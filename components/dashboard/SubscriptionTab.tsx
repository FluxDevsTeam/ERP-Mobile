import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { Calendar, Check, Gift, ArrowRight, Clock, Hash, Trash2 } from 'lucide-react-native';

// API Imports
import { 
  getUserSubscriptions, 
  getBillingPlans, 
  activateTrial, 
  deleteSubscription, 
  deletePlan, // <--- NEW IMPORT
  Subscription, 
  Plan 
} from '../../api/billing';
import { initiatePayment } from '../../api/payment';

import PaginationControl from './PaginationControl';

export default function SubscriptionTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | 'quarterly'>('monthly');
  
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  const [processingId, setProcessingId] = useState<string | null>(null); 

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ count: number, next: string | null, previous: string | null } | null>(null);

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
    if (result.success && result.data) setPlans(result.data);
  };

  // --- ACTIONS ---

  // Updated to accept a specific plan
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
              Alert.alert("Success", "Free trial activated successfully!");
              fetchSubs(1); 
            } else {
              Alert.alert("Activation Failed", res.message);
            }
          }
        }
      ]
    );
  };

  const handleSubscribe = async (plan: Plan) => {
    setProcessingId(plan.id);
    const res = await initiatePayment(plan.id);
    setProcessingId(null);
    if (res.success) {
      const authUrl = res.data?.data?.authorization_url || res.data?.payment_link;
      if (authUrl) {
        const supported = await Linking.canOpenURL(authUrl);
        if (supported) {
          await Linking.openURL(authUrl);
        } else {
          Alert.alert("Error", "Cannot open payment link.");
        }
      } else {
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

  // --- NEW: HANDLE DELETE PLAN ---
  const handleLongPressPlan = (plan: Plan) => {
    Alert.alert(
      "Delete Plan",
      `Are you sure you want to delete the plan "${plan.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            // Optimistic update logic or simple refresh
            setLoadingPlans(true); // Show loader while deleting
            const res = await deletePlan(plan.id);
            
            if (res.success) {
              Alert.alert("Success", "Plan deleted successfully.");
              fetchPlans(); // Refresh list
            } else {
              setLoadingPlans(false);
              Alert.alert("Error", res.message);
            }
          }
        }
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

  const filteredPlans = plans.filter(p => p.billing_period === billingCycle);

  return (
    <View className="pb-10">
      
      {/* 1. SUBSCRIPTIONS LIST */}
      <View className="mb-10">
        <Text className="text-lg font-bold text-[#0F172A] mb-4">Subscription History</Text>
        <Text className="text-xs text-[#64748B] mb-4 -mt-2">Long press a subscription to cancel or delete it.</Text>
        
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
                    className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 shadow-sm relative overflow-hidden"
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
        <Text className="text-lg font-bold text-[#0F172A] mb-2">Available Plans</Text>
        <Text className="text-xs text-[#64748B] mb-6">Upgrade your workspace capacity. Long press to delete a plan.</Text>

        {/* BILLING TOGGLE */}
        <View className="bg-[#F1F5F9] p-1 rounded-xl flex-row mb-8 mx-auto">
          {['monthly', 'quarterly', 'annual'].map((cycle) => (
            <TouchableOpacity 
              key={cycle}
              onPress={() => setBillingCycle(cycle as any)}
              className={`flex-1 py-2.5 rounded-lg items-center ${billingCycle === cycle ? 'bg-[#5841D8] shadow-sm' : 'bg-transparent'}`}
            >
              <Text className={`font-semibold text-xs capitalize ${billingCycle === cycle ? 'text-white' : 'text-[#64748B]'}`}>
                {cycle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PAID PLANS LIST */}
        {loadingPlans ? (
          <ActivityIndicator color="#5841D8" />
        ) : (
          <View>
            {filteredPlans.length === 0 ? (
               <Text className="text-center text-slate-400 py-8">No plans available for this cycle.</Text>
            ) : (
              filteredPlans.map((plan) => (
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

                    {/* FREE TRIAL ACTIVATION BUTTON */}
                    <TouchableOpacity 
                      onPress={() => handleFreeTrial(plan)}
                      disabled={processingId === `TRIAL_${plan.id}`}
                      className="bg-[#F5F3FF] p-2 rounded-xl border border-indigo-100 flex-row items-center"
                    >
                      {processingId === `TRIAL_${plan.id}` ? (
                        <ActivityIndicator size="small" color="#5841D8" />
                      ) : (
                        <>
                          <Gift size={20} color="#5841D8" />
                          <Text className="text-[#5841D8] font-bold text-[10px] ml-1 uppercase">Trial</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  
                  <Text className="text-[#64748B] mb-6">{plan.description}</Text>

                  <View className="gap-y-3 mb-8">
                    <View className="flex-row items-center gap-3"><View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View><Text className="text-[#334155]">{plan.max_users} Users</Text></View>
                    <View className="flex-row items-center gap-3"><View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View><Text className="text-[#334155]">{plan.max_branches} Branches</Text></View>
                    <View className="flex-row items-center gap-3"><View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View><Text className="text-[#334155]">{plan.industry} Industry</Text></View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => handleSubscribe(plan)}
                    disabled={!!processingId}
                    className={`h-12 rounded-xl flex-row items-center justify-center bg-[#5841D8] ${processingId && processingId !== plan.id ? 'opacity-50' : ''}`}
                  >
                    {processingId === plan.id ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="font-bold text-white text-base">Subscribe Now</Text>
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
}