import { Calendar, Check, ChevronDown, Clock, CreditCard, Gift, Hash, Plus, Shield, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// API Imports
import {
  activateTrial,
  BillingPeriod,
  createPlan,
  deletePlan,
  deleteSubscription,
  getBillingPlans,
  getUserSubscriptions,
  Industry,
  Plan,
  Subscription,
  TierLevel,
  updatePlan // NEW
} from '../../api/billing';
import { initiatePayment } from '../../api/payment';

import PaginationControl from './PaginationControl';

// Payment Provider Images - using placeholder URLs (replace with actual logos)
const PAYSTACK_LOGO = 'https://th.bing.com/th/id/OIP.N1_DrDva635Qn6G0VNUnbwHaHa?w=175&h=180&c=7&r=0&o=7&pid=1.7&rm=3';
const FLUTTERWAVE_LOGO = 'https://th.bing.com/th/id/OIP.iYgNe33Usol96g7vMtxOBwHaEK?w=320&h=180&c=7&r=0&o=7&pid=1.7&rm=3';

// Enums API Options
const INDUSTRIES: Industry[] = [
  "Basic", "Finance", "Healthcare", "Production", "Education", "Technology", "Retail", "Agriculture", "Real Estate", "Supermarket", "Warehouse", "Other"
];
const BILLING_PERIODS: BillingPeriod[] = ["monthly", "quarterly", "biannual", "annual"];
const TIER_LEVELS: TierLevel[] = ["tier1", "tier2", "tier3", "tier4"];

export default function SubscriptionTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ count: number, next: string | null, previous: string | null } | null>(null);

  // Payment Modal State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'paystack' | 'flutterwave'>('paystack');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Success Modal State
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Create Plan Modal State
  const [createPlanModalVisible, setCreatePlanModalVisible] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null); // NEW
  const [newPlan, setNewPlan] = useState<{
    name: string;
    description: string;
    industry: Industry;
    max_users: string;
    max_branches: string;
    price: string;
    billing_period: BillingPeriod;
    tier_level: TierLevel;
  }>({
    name: '',
    description: '',
    industry: 'Other',
    max_users: '',
    max_branches: '',
    price: '',
    billing_period: 'monthly',
    tier_level: 'tier1'
  });

  // Helper Modal States for Pickers
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'industry' | 'billing' | 'tier' | null>(null);


  useEffect(() => {
    fetchSubs(page);
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchSubs(page);
  }, [page]);

  const fetchSubs = async (pageNumber: number) => {
    setLoadingSubs(true);
    const result = await getUserSubscriptions(pageNumber);
    setLoadingSubs(false);
    if (result.success && result.data) {
      setSubscriptions(result.data);
      if (result.meta) setMeta(result.meta);
    }
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    const result = await getBillingPlans();
    setLoadingPlans(false);
    if (result.success && result.data) {
      setPlans(result.data);
    }
  };

  // --- ACTIONS ---

  // Handle Create or Update Plan
  const handleSavePlan = async () => {
    if (!newPlan.name || !newPlan.price || !newPlan.max_users || !newPlan.max_branches) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    setIsCreatingPlan(true);

    const payload = {
      ...newPlan,
      max_users: parseInt(newPlan.max_users) || 0,
      max_branches: parseInt(newPlan.max_branches) || 0,
      is_active: true,
      discontinued: false
    };

    let result;
    if (editingPlanId) {
      // UPDATE existing plan
      result = await updatePlan(editingPlanId, payload);
    } else {
      // CREATE new plan
      result = await createPlan(payload);
    }

    setIsCreatingPlan(false);

    if (result.success) {
      Alert.alert("Success", `Plan ${editingPlanId ? 'updated' : 'created'} successfully`);
      setCreatePlanModalVisible(false);
      resetPlanForm();
      fetchPlans();
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const resetPlanForm = () => {
    setNewPlan({
      name: '', description: '', industry: 'Other',
      max_users: '', max_branches: '', price: '',
      billing_period: 'monthly', tier_level: 'tier1'
    });
    setEditingPlanId(null);
  };

  const openCreateModal = () => {
    resetPlanForm();
    setCreatePlanModalVisible(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setNewPlan({
      name: plan.name,
      description: plan.description,
      industry: plan.industry,
      max_users: plan.max_users.toString(),
      max_branches: plan.max_branches.toString(),
      price: plan.price.toString(),
      billing_period: plan.billing_period,
      tier_level: plan.tier_level
    });
    setCreatePlanModalVisible(true);
  };

  // Free Trial Activation
  const handleFreeTrial = async (plan: Plan) => {
    Alert.alert(
      "Activate Free Trial",
      `Do you want to start a free trial for the ${plan.name} plan?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Activate",
          onPress: async () => {
            setProcessingId(`TRIAL_${plan.id}`);
            const res = await activateTrial(plan.id);
            setProcessingId(null);

            if (res.success) {
              setSuccessMessage(`Your ${plan.name} free trial has been activated successfully!`);
              setSuccessModalVisible(true);
              fetchSubs(1);
            } else {
              Alert.alert("Activation Failed", res.message);
            }
          }
        }
      ]
    );
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setSelectedProvider('paystack'); // Reset to default
    setPaymentModalVisible(true);
  };

  // Process Payment with selected provider
  const handleProcessPayment = async () => {
    if (!selectedPlan) return;

    setIsProcessingPayment(true);
    const res = await initiatePayment(selectedPlan.id, selectedProvider);
    setIsProcessingPayment(false);

    if (res.success) {
      const authUrl = res.data?.data?.authorization_url || res.data?.data?.payment_link || res.data?.payment_link;
      if (authUrl) {
        setPaymentModalVisible(false);
        const supported = await Linking.canOpenURL(authUrl);
        if (supported) {
          await Linking.openURL(authUrl);
        } else {
          Alert.alert("Error", "Cannot open payment link.");
        }
      } else {
        setPaymentModalVisible(false);
        Alert.alert("Success", "Plan activated.");
        fetchSubs(1);
      }
    } else {
      Alert.alert("Payment Error", res.message);
    }
  };

  // --- HANDLE DELETE SUBSCRIPTION ---
  const handleLongPressSubscription = (subId: string, planName: string) => {
    Alert.alert(
      "Cancel Subscription",
      `Are you sure you want to cancel/delete the ${planName} subscription?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: async () => {
            setLoadingSubs(true);
            const res = await deleteSubscription(subId);
            if (res.success) {
              Alert.alert("Success", "Subscription deleted.");
              fetchSubs(1);
            } else {
              setLoadingSubs(false);
              Alert.alert("Error", res.message);
            }
          }
        }
      ]
    );
  };

  // --- HANDLE PLAN ACTIONS (Edit/Delete) ---
  const handleLongPressPlan = (plan: Plan) => {
    Alert.alert(
      "Manage Plan",
      `Options for "${plan.name}"`,
      [
        { text: "Edit Plan", onPress: () => openEditModal(plan) },
        {
          text: "Delete Plan",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Delete",
              "Are you sure you want to delete this plan? This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    setLoadingPlans(true);
                    const res = await deletePlan(plan.id);
                    if (res.success) {
                      Alert.alert("Success", "Plan deleted successfully.");
                      fetchPlans();
                    } else {
                      setLoadingPlans(false);
                      Alert.alert("Error", res.message);
                    }
                  }
                }
              ]
            );
          }
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // --- RENDER HELPERS ---
  const renderStatusBadge = (status: string) => {
    const styles: any = {
      active: 'bg-emerald-100 text-emerald-700',
      trial: 'bg-indigo-100 text-indigo-700',
      canceled: 'bg-rose-100 text-rose-700',
      suspended: 'bg-orange-100 text-orange-700',
    };
    const styleClass = styles[status] || 'bg-slate-100 text-slate-700';
    return (
      <View className={`px-2.5 py-1 rounded-full self-start ${styleClass.split(' ')[0]}`}>
        <Text className={`text-[10px] font-bold uppercase tracking-wider ${styleClass.split(' ')[1]}`}>{status}</Text>
      </View>
    );
  };

  // --- PAYMENT MODAL ---
  const renderPaymentModal = () => (
    <Modal
      visible={paymentModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setPaymentModalVisible(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 pb-10">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-[#0F172A]">Choose Payment Method</Text>
            <TouchableOpacity onPress={() => setPaymentModalVisible(false)} className="p-2">
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Plan Summary */}
          {selectedPlan && (
            <View className="bg-slate-50 rounded-xl p-4 mb-6">
              <Text className="text-lg font-bold text-[#0F172A]">{selectedPlan.name}</Text>
              <Text className="text-sm text-[#64748B] mt-1">{selectedPlan.description}</Text>
              <View className="flex-row justify-between mt-3">
                <Text className="text-[#64748B]">Price:</Text>
                <Text className="font-bold text-[#0F172A]">
                  ₦{parseFloat(selectedPlan.price).toLocaleString()}/{selectedPlan.billing_period}
                </Text>
              </View>
            </View>
          )}

          {/* Payment Providers */}
          <View className="gap-y-3 mb-6">
            {/* Paystack */}
            <TouchableOpacity
              onPress={() => setSelectedProvider('paystack')}
              className={`flex-row items-center p-4 rounded-xl border-2 ${selectedProvider === 'paystack'
                ? 'border-[#5841D8] bg-indigo-50'
                : 'border-slate-200 bg-white'
                }`}
            >
              <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${selectedProvider === 'paystack' ? 'border-[#5841D8] bg-[#5841D8]' : 'border-slate-300'
                }`}>
                {selectedProvider === 'paystack' && <Check size={14} color="white" />}
              </View>
              <Image
                source={{ uri: PAYSTACK_LOGO }}
                className="w-8 h-8 rounded mr-3"
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="font-semibold text-[#0F172A]">Paystack</Text>
                <Text className="text-xs text-[#64748B]">Cards, Bank Transfer, USSD</Text>
              </View>
            </TouchableOpacity>

            {/* Flutterwave */}
            <TouchableOpacity
              onPress={() => setSelectedProvider('flutterwave')}
              className={`flex-row items-center p-4 rounded-xl border-2 ${selectedProvider === 'flutterwave'
                ? 'border-[#5841D8] bg-indigo-50'
                : 'border-slate-200 bg-white'
                }`}
            >
              <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${selectedProvider === 'flutterwave' ? 'border-[#5841D8] bg-[#5841D8]' : 'border-slate-300'
                }`}>
                {selectedProvider === 'flutterwave' && <Check size={14} color="white" />}
              </View>
              <Image
                source={{ uri: FLUTTERWAVE_LOGO }}
                className="w-8 h-8 rounded mr-3"
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="font-semibold text-[#0F172A]">Flutterwave</Text>
                <Text className="text-xs text-[#64748B]">Cards, Mobile Money, M-Pesa</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Provider Features */}
          <View className="bg-slate-50 rounded-xl p-4 mb-6">
            <Text className="font-semibold text-[#0F172A] mb-2">
              {selectedProvider === 'paystack' ? 'Paystack Features:' : 'Flutterwave Features:'}
            </Text>
            {selectedProvider === 'paystack' ? (
              <View className="gap-y-1">
                <Text className="text-sm text-[#64748B]">• Secure card payments with 3D Secure</Text>
                <Text className="text-sm text-[#64748B]">• Direct bank transfers</Text>
                <Text className="text-sm text-[#64748B]">• USSD payments</Text>
                <Text className="text-sm text-[#64748B]">• Quick and reliable transactions</Text>
              </View>
            ) : (
              <View className="gap-y-1">
                <Text className="text-sm text-[#64748B]">• Card payments and mobile money</Text>
                <Text className="text-sm text-[#64748B]">• Bank account transfers</Text>
                <Text className="text-sm text-[#64748B]">• M-Pesa (Kenya) support</Text>
                <Text className="text-sm text-[#64748B]">• Multiple currency support</Text>
              </View>
            )}
          </View>

          {/* Proceed Button */}
          <TouchableOpacity
            onPress={handleProcessPayment}
            disabled={isProcessingPayment}
            className={`h-14 rounded-xl flex-row items-center justify-center bg-[#5841D8] ${isProcessingPayment ? 'opacity-70' : ''}`}
          >
            {isProcessingPayment ? (
              <>
                <ActivityIndicator color="white" className="mr-2" />
                <Text className="font-bold text-white text-base">Processing...</Text>
              </>
            ) : (
              <>
                <CreditCard size={20} color="white" />
                <Text className="font-bold text-white text-base ml-2">Proceed to Pay</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View className="flex-row items-center justify-center mt-4 gap-2">
            <Shield size={14} color="#10B981" />
            <Text className="text-xs text-[#64748B]">
              Your payment is processed securely via {selectedProvider === 'paystack' ? 'Paystack' : 'Flutterwave'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  // --- CREATE PLAN MODAL ---
  const renderCreatePlanModal = () => (
    <Modal visible={createPlanModalVisible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white h-[90%] rounded-t-3xl overflow-hidden">
          {/* Header */}
          <View className="bg-[#0F172A] px-6 py-5 flex-row justify-between items-center">
            <Text className="text-xl font-bold text-white">{editingPlanId ? 'Edit Plan' : 'Create New Plan'}</Text>
            <TouchableOpacity onPress={() => setCreatePlanModalVisible(false)} className="p-2 bg-white/20 rounded-full">
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
            {/* Name */}
            <Text className="text-[#334155] font-semibold mb-2">Plan Name</Text>
            <TextInput
              value={newPlan.name}
              onChangeText={(text) => setNewPlan({ ...newPlan, name: text })}
              placeholder="e.g. Gold Tier"
              placeholderTextColor="#94A3B8"
              className="h-12 border border-slate-200 rounded-xl px-4 text-base text-[#0F172A] bg-slate-50 mb-4"
            />

            {/* Description */}
            <Text className="text-[#334155] font-semibold mb-2">Description</Text>
            <TextInput
              value={newPlan.description}
              onChangeText={(text) => setNewPlan({ ...newPlan, description: text })}
              placeholder="Brief description of the plan..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              className="h-24 border border-slate-200 rounded-xl px-4 py-3 text-base text-[#0F172A] bg-slate-50 mb-4 text-top"
              textAlignVertical="top"
            />

            {/* Price */}
            <Text className="text-[#334155] font-semibold mb-2">Price (₦)</Text>
            <TextInput
              value={newPlan.price}
              onChangeText={(text) => setNewPlan({ ...newPlan, price: text })}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              className="h-12 border border-slate-200 rounded-xl px-4 text-base text-[#0F172A] bg-slate-50 mb-4"
            />

            {/* Max Users & Branches (Row) */}
            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-[#334155] font-semibold mb-2">Max Users</Text>
                <TextInput
                  value={newPlan.max_users}
                  onChangeText={(text) => setNewPlan({ ...newPlan, max_users: text })}
                  placeholder="10"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  className="h-12 border border-slate-200 rounded-xl px-4 text-base text-[#0F172A] bg-slate-50"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#334155] font-semibold mb-2">Max Branches</Text>
                <TextInput
                  value={newPlan.max_branches}
                  onChangeText={(text) => setNewPlan({ ...newPlan, max_branches: text })}
                  placeholder="5"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  className="h-12 border border-slate-200 rounded-xl px-4 text-base text-[#0F172A] bg-slate-50"
                />
              </View>
            </View>

            {/* Pickers */}
            <Text className="text-[#334155] font-semibold mb-2">Industry</Text>
            <TouchableOpacity
              onPress={() => { setPickerType('industry'); setPickerVisible(true); }}
              className="h-12 border border-slate-200 rounded-xl px-4 flex-row items-center justify-between bg-slate-50 mb-4"
            >
              <Text className="text-[#0F172A] text-base">{newPlan.industry}</Text>
              <ChevronDown size={20} color="#64748B" />
            </TouchableOpacity>

            <Text className="text-[#334155] font-semibold mb-2">Billing Period</Text>
            <TouchableOpacity
              onPress={() => { setPickerType('billing'); setPickerVisible(true); }}
              className="h-12 border border-slate-200 rounded-xl px-4 flex-row items-center justify-between bg-slate-50 mb-4"
            >
              <Text className="text-[#0F172A] text-base capitalize">{newPlan.billing_period}</Text>
              <ChevronDown size={20} color="#64748B" />
            </TouchableOpacity>

            <Text className="text-[#334155] font-semibold mb-2">Tier Level</Text>
            <TouchableOpacity
              onPress={() => { setPickerType('tier'); setPickerVisible(true); }}
              className="h-12 border border-slate-200 rounded-xl px-4 flex-row items-center justify-between bg-slate-50 mb-8"
            >
              <Text className="text-[#0F172A] text-base capitalize">{newPlan.tier_level}</Text>
              <ChevronDown size={20} color="#64748B" />
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSavePlan}
              disabled={isCreatingPlan}
              className={`bg-[#5841D8] h-14 rounded-xl items-center justify-center flex-row ${isCreatingPlan ? 'opacity-70' : ''}`}
            >
              {isCreatingPlan ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Plus size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">{editingPlanId ? 'Save Changes' : 'Create Plan'}</Text>
                </>
              )}
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );

  // --- GENERIC PICKER MODAL ---
  const renderPickerModal = () => {
    let options: string[] = [];
    let onSelect: (val: any) => void = () => { };
    let currentVal = '';

    if (pickerType === 'industry') {
      options = INDUSTRIES;
      currentVal = newPlan.industry;
      onSelect = (val) => setNewPlan({ ...newPlan, industry: val });
    } else if (pickerType === 'billing') {
      options = BILLING_PERIODS;
      currentVal = newPlan.billing_period;
      onSelect = (val) => setNewPlan({ ...newPlan, billing_period: val });
    } else if (pickerType === 'tier') {
      options = TIER_LEVELS;
      currentVal = newPlan.tier_level;
      onSelect = (val) => setNewPlan({ ...newPlan, tier_level: val });
    }

    return (
      <Modal visible={pickerVisible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center px-6"
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View className="bg-white w-full rounded-2xl max-h-[70%] overflow-hidden shadow-xl">
            <View className="p-4 border-b border-slate-100 flex-row justify-between items-center">
              <Text className="font-bold text-lg text-[#0F172A] capitalize">Select {pickerType}</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => { onSelect(opt); setPickerVisible(false); }}
                  className={`p-4 border-b border-slate-50 flex-row justify-between items-center ${currentVal === opt ? 'bg-indigo-50' : ''}`}
                >
                  <Text className={`text-base capitalize ${currentVal === opt ? 'text-[#5841D8] font-bold' : 'text-[#334155]'}`}>
                    {opt}
                  </Text>
                  {currentVal === opt && <Check size={18} color="#5841D8" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // --- SUCCESS MODAL ---
  const renderSuccessModal = () => (
    <Modal
      visible={successModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setSuccessModalVisible(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-6">
        <View className="bg-white rounded-2xl p-8 w-full max-w-sm items-center">
          <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4">
            <Check size={32} color="#10B981" />
          </View>
          <Text className="text-xl font-bold text-[#0F172A] text-center mb-2">
            Trial Activated!
          </Text>
          <Text className="text-[#64748B] text-center mb-6">
            {successMessage}
          </Text>
          <TouchableOpacity
            onPress={() => setSuccessModalVisible(false)}
            className="h-12 w-full rounded-xl bg-[#5841D8] items-center justify-center"
          >
            <Text className="font-bold text-white">Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="pb-10">
      {/* Payment Provider Modal */}
      {renderPaymentModal()}

      {/* Success Modal */}
      {renderSuccessModal()}

      {/* Create Plan Modal */}
      {renderCreatePlanModal()}

      {/* Picker Modal */}
      {renderPickerModal()}

      {/* 1. SUBSCRIPTIONS LIST */}
      <View className="mb-10">
        <Text className="text-lg font-bold text-[#0F172A] mb-6">Subscription History</Text>
        <Text className="text-xs text-[#64748B] mb-6 -mt-2">Long press a subscription to cancel or delete it.</Text>

        {loadingSubs ? (
          <ActivityIndicator color="#5841D8" className="py-10" />
        ) : (
          <View>
            {subscriptions.length === 0 ? (
              <View className="bg-white border border-slate-200 border-dashed rounded-xl p-8 items-center justify-center mb-4">
                <Text className="text-slate-400 font-medium">No subscription history found.</Text>
              </View>
            ) : (
              subscriptions.map((sub) => {
                const isActive = sub.status === 'active';
                const isTrial = sub.status === 'trial';

                return (
                  <TouchableOpacity
                    key={sub.id}
                    onLongPress={() => handleLongPressSubscription(sub.id, sub.plan.name)}
                    delayLongPress={500}
                    activeOpacity={0.7}
                    className="bg-white border border-slate-100 rounded-2xl p-6 mb-6 shadow-sm relative overflow-hidden"
                  >
                    <View className={`absolute left-0 top-0 bottom-0 w-1.5 ${isActive ? 'bg-emerald-500' : isTrial ? 'bg-indigo-500' : 'bg-slate-300'}`} />

                    <View className="flex-row justify-between items-start mb-3 pl-2">
                      <View>
                        <Text className="text-lg font-bold text-[#0F172A]">{sub.plan.name}</Text>
                        <Text className="text-xs text-[#64748B] mt-0.5">
                          ₦{parseFloat(sub.plan.price).toLocaleString()} • {sub.plan.billing_period}
                        </Text>
                      </View>
                      {renderStatusBadge(sub.status)}
                    </View>

                    <View className="border-t border-slate-50 pt-3 flex-row justify-between pl-2">
                      <View>
                        <Text className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1">Start Date</Text>
                        <View className="flex-row items-center">
                          <Calendar size={12} color="#64748B" className="mr-1.5" />
                          <Text className="text-xs font-medium text-[#334155]">
                            {new Date(sub.start_date).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>

                      <View>
                        <Text className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1 text-right">End Date</Text>
                        <View className="flex-row items-center justify-end">
                          <Clock size={12} color="#64748B" className="mr-1.5" />
                          <Text className="text-xs font-medium text-[#334155]">
                            {new Date(sub.end_date).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="mt-3 pt-2 pl-2 flex-row items-center">
                      <Hash size={10} color="#CBD5E1" className="mr-1" />
                      <Text className="text-[9px] text-[#CBD5E1] font-mono">ID: {sub.tenant_id ? sub.tenant_id.substring(0, 8) : 'N/A'}...</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            {subscriptions.length > 0 && (
              <PaginationControl
                currentPage={page}
                hasNext={!!meta?.next}
                hasPrev={!!meta?.previous}
                totalCount={meta?.count}
                onNext={() => setPage(p => p + 1)}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
              />
            )}
          </View>
        )}
      </View>

      {/* 2. AVAILABLE PLANS */}
      <View>
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-lg font-bold text-[#0F172A]">Available Plans</Text>
            <Text className="text-xs text-[#64748B]">Upgrade your workspace capacity</Text>
          </View>
          <TouchableOpacity
            onPress={openCreateModal}
            className="flex-row items-center bg-[#0F172A] px-3 py-2 rounded-lg"
          >
            <Plus size={14} color="white" />
            <Text className="text-white text-xs font-bold ml-1.5">Add Plan</Text>
          </TouchableOpacity>
        </View>

        {/* PAID PLANS LIST - Grouped by Billing Period */}
        {loadingPlans ? (
          <ActivityIndicator color="#5841D8" />
        ) : plans.length === 0 ? (
          <View className="bg-white border border-slate-200 border-dashed rounded-xl p-8 items-center justify-center">
            <Text className="text-slate-400 font-medium text-center">
              No plans available.
            </Text>
          </View>
        ) : (
          <View>
            {/* Group plans by billing period */}
            {(['monthly', 'quarterly', 'biannual', 'annual'] as const).map((period) => {
              const periodPlans = plans.filter(p => p.billing_period === period);

              if (periodPlans.length === 0) return null;

              return (
                <View key={period} className="mb-8">
                  {/* Period Header */}
                  <View className="flex-row items-center mb-4">
                    <View className={`px-3 py-1.5 rounded-lg ${period === 'monthly' ? 'bg-blue-100' :
                      period === 'quarterly' ? 'bg-purple-100' : 'bg-emerald-100'
                      }`}>
                      <Text className={`font-bold text-sm capitalize ${period === 'monthly' ? 'text-blue-700' :
                        period === 'quarterly' ? 'text-purple-700' : 'text-emerald-700'
                        }`}>
                        {period}
                      </Text>
                    </View>
                    <Text className="text-xs text-slate-400 ml-2">
                      {periodPlans.length} plan{periodPlans.length !== 1 ? 's' : ''}
                    </Text>
                  </View>

                  {/* Plans for this period */}
                  {periodPlans.map((plan) => {
                    // Check if user already has this plan
                    const isSubscribed = subscriptions.some(sub => sub.plan.id === plan.id);
                    const subscriptionStatus = isSubscribed
                      ? subscriptions.find(sub => sub.plan.id === plan.id)?.status
                      : null;

                    return (
                      <TouchableOpacity
                        key={plan.id}
                        onLongPress={() => handleLongPressPlan(plan)}
                        delayLongPress={500}
                        activeOpacity={0.9}
                        className="border border-[#CBD5E1] rounded-2xl p-6 mb-6 bg-white shadow-sm"
                      >
                        {/* HEADER ROW WITH GIFT ICON */}
                        <View className="flex-row justify-between items-start mb-2">
                          <View>
                            <Text className="text-4xl font-bold text-[#0F172A]">
                              ₦{parseFloat(plan.price).toLocaleString()}
                            </Text>
                            <Text className="text-[#0F172A] font-bold text-lg">{plan.name}</Text>
                          </View>

                          {/* FREE TRIAL BUTTON - Only show if no subscriptions */}
                          {subscriptions.length === 0 && (
                            <TouchableOpacity
                              onPress={() => handleFreeTrial(plan)}
                              disabled={processingId === `TRIAL_${plan.id}`}
                              className="bg-emerald-100 p-2 rounded-xl border border-emerald-200 flex-row items-center"
                            >
                              {processingId === `TRIAL_${plan.id}` ? (
                                <ActivityIndicator size="small" color="#10B981" />
                              ) : (
                                <>
                                  <Gift size={20} color="#10B981" />
                                  <Text className="text-emerald-700 font-bold text-[10px] ml-1 uppercase">Trial</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>

                        <Text className="text-[#64748B] mb-6">{plan.description}</Text>

                        <View className="gap-y-3 mb-8">
                          <View className="flex-row items-center gap-3"><View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View><Text className="text-[#334155]">{plan.max_users} Users</Text></View>
                          <View className="flex-row items-center gap-3"><View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View><Text className="text-[#334155]">{plan.max_branches} Branches</Text></View>
                          <View className="flex-row items-center gap-3"><View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View><Text className="text-[#334155]">{plan.industry} Industry</Text></View>
                          <View className="flex-row items-center gap-3"><View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View><Text className="text-[#334155] capitalize">{plan.billing_period}</Text></View>
                        </View>

                        {/* Action Button */}
                        {isSubscribed ? (
                          <View className="h-12 rounded-xl flex-row items-center justify-center bg-emerald-100">
                            <Check size={18} color="#10B981" />
                            <Text className="font-bold text-emerald-700 ml-2">
                              {subscriptionStatus === 'active' ? 'Current Plan' : 'Subscribed'}
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => handleOpenPaymentModal(plan)}
                            disabled={!!processingId}
                            className={`h-12 rounded-xl flex-row items-center justify-center bg-[#5841D8] ${processingId && processingId !== plan.id ? 'opacity-50' : ''}`}
                          >
                            <CreditCard size={18} color="white" />
                            <Text className="font-bold text-white text-base ml-2">Subscribe Now</Text>
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}