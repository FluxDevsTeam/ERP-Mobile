import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  StatusBar,
  ActivityIndicator,
  Alert,
  FlatList,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  Cloud, 
  ChevronDown, 
  Check, 
  Gift, 
  X,
  CreditCard,
  ExternalLink
} from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Stack, router } from 'expo-router';
import "../global.css";

// API Imports
import { createTenant, checkTenantName } from '../api/tenant';
import { getBillingPlans, Plan } from '../api/billing';
import { initiatePayment } from '../api/payment';
import { useUserStore } from '../store/userStore';

const INDUSTRIES = [
  "Basic", "Finance", "Technology", "Healthcare", "Retail", "Education", "Construction", "Other"
];

export default function OnboardingScreen() {
  // Navigation State
  // Added 'payment_pending' to the flow
  const [currentView, setCurrentView] = useState('company'); 
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | 'quarterly'>('monthly');

  // Store
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // Form Data
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Finance');

  // Logic/UI State
  const [loading, setLoading] = useState(false); 
  const [checkingName, setCheckingName] = useState(false); 
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null); 
  const [showIndustryModal, setShowIndustryModal] = useState(false);

  // Plans State
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // --- NAME CHECK LOGIC ---
  useEffect(() => {
    if (!companyName) {
      setNameAvailable(null);
      return;
    }
    setNameAvailable(null);

    const delayDebounceFn = setTimeout(async () => {
      if (companyName.length > 2) {
        setCheckingName(true);
        const result = await checkTenantName(companyName, industry);
        setCheckingName(false);
        setNameAvailable(result.success);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [companyName, industry]);

  // --- FETCH PLANS ---
  useEffect(() => {
    if (currentView === 'pricing') {
      fetchPlans();
    }
  }, [currentView]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    const result = await getBillingPlans();
    setLoadingPlans(false);

    if (result.success && result.data) {
      setPlans(result.data);
    } else {
      Alert.alert("Error", "Failed to load pricing plans.");
    }
  };

  // --- HANDLERS ---
  const handleCompanySubmit = async () => {
    if (!companyName || !industry) {
      Alert.alert("Missing Fields", "Please enter a company name and select an industry.");
      return;
    }
    if (nameAvailable === false) {
      Alert.alert("Unavailable", "This company name is already taken.");
      return;
    }

    setLoading(true);
    const result = await createTenant(companyName, industry);
    setLoading(false);

    if (result.success) {
      if (user) {
        setUser({ ...user, tenant_name: companyName, tenant_industry: industry });
      }
      setCurrentView('company_success');
    } else {
      Alert.alert("Error", result.message || "Failed to create company.");
    }
  };

  const handleToPricing = () => setCurrentView('pricing');

  // --- UPDATED: HANDLE PAYMENT FLOW ---
  const handlePlanSelect = async (plan: Plan) => {
    setProcessingPayment(true);
    
    // 1. Initiate
    const result = await initiatePayment(plan.id);
    
    setProcessingPayment(false);

    if (result.success) {
      const authUrl = result.data?.data?.authorization_url || result.data?.payment_link;

      if (authUrl) {
        const supported = await Linking.canOpenURL(authUrl);
        if (supported) {
          // 2. Open Browser
          await Linking.openURL(authUrl);
          
          // 3. PAUSE HERE: Don't show success yet. Show "Payment Pending" modal.
          setCurrentView('payment_pending');
        } else {
          Alert.alert("Error", "Cannot open payment link.");
        }
      } else {
        // Free plan or no URL needed
        setCurrentView('plan_success');
      }
    } else {
      Alert.alert("Payment Failed", result.message);
    }
  };

  // Called when user clicks "I have paid" in the pending modal
  const handlePaymentConfirmed = () => {
    // In a real app, you would verify the transaction ID with an API call here.
    // For now, we trust the user has finished.
    setCurrentView('plan_success');
  };

  const handleFinish = () => {
    router.replace('/dashboard');
  };

  const getFilteredPlans = () => {
    return plans.filter(p => {
      const industryMatch = p.industry.toLowerCase() === industry.toLowerCase();
      const cycleMatch = p.billing_period === billingCycle;
      return industryMatch && cycleMatch;
    });
  };

  // --- RENDER HELPERS ---

  // 1. GENERIC SUCCESS MODAL
  const renderSuccessModal = (title: string, subtitle: string, buttonText: string, onPress: () => void) => (
    <Modal animationType="fade" transparent={true} visible={true}>
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white w-full rounded-3xl p-8 items-center">
          <View className="w-28 h-28 bg-[#ECFDF5] rounded-full items-center justify-center mb-6">
            <View className="w-20 h-20 bg-[#D1FAE5] rounded-full items-center justify-center">
               <Check size={40} color="#10B981" strokeWidth={3} />
            </View>
          </View>
          <Text className="text-2xl font-bold text-[#0F172A] text-center mb-4">{title}</Text>
          <Text className="text-[#64748B] text-center text-sm leading-6 mb-8 px-2">{subtitle}</Text>
          <TouchableOpacity onPress={onPress} className="bg-[#5841D8] w-full h-14 rounded-xl items-center justify-center shadow-lg shadow-indigo-200">
            <Text className="text-white text-base font-bold">{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // 2. NEW: PAYMENT PENDING MODAL
  const renderPaymentPendingModal = () => (
    <Modal animationType="fade" transparent={true} visible={true}>
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white w-full rounded-3xl p-8 items-center">
          <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6">
             <CreditCard size={40} color="#5841D8" />
          </View>

          <Text className="text-2xl font-bold text-[#0F172A] text-center mb-2">Payment in Progress</Text>
          <Text className="text-[#64748B] text-center text-sm leading-6 mb-8 px-1">
            We have opened the payment page in your browser. Please complete the payment to continue.
          </Text>

          <TouchableOpacity 
            onPress={handlePaymentConfirmed}
            className="bg-[#5841D8] w-full h-14 rounded-xl items-center justify-center shadow-lg shadow-indigo-200 mb-4"
          >
            <Text className="text-white text-base font-bold">I have completed payment</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setCurrentView('pricing')}
            className="py-2"
          >
            <Text className="text-[#EF4444] font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderIndustryPicker = () => (
    <Modal visible={showIndustryModal} transparent animationType="slide">
      <TouchableOpacity className="flex-1 bg-black/50 justify-end" activeOpacity={1} onPress={() => setShowIndustryModal(false)}>
        <View className="bg-white rounded-t-3xl h-[50%] p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-[#0F172A]">Select Industry</Text>
            <TouchableOpacity onPress={() => setShowIndustryModal(false)}><X size={24} color="#64748B" /></TouchableOpacity>
          </View>
          <FlatList 
            data={INDUSTRIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => { setIndustry(item); setShowIndustryModal(false); }} className="py-4 border-b border-slate-100 flex-row justify-between items-center">
                <Text className={`text-lg ${industry === item ? 'text-[#5841D8] font-bold' : 'text-[#334155]'}`}>{item}</Text>
                {industry === item && <Check size={20} color="#5841D8" />}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // --- RENDER MAIN ---
  if (currentView === 'company' || currentView === 'company_success') {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />
        <View className="px-6 py-4 flex-row items-center justify-between bg-white z-10">
           <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#0F172A" /></TouchableOpacity>
           <View className="flex-row items-center">
             <View className="w-8 h-8 bg-[#F5F3FF] rounded-lg items-center justify-center mr-2"><Cloud size={16} color="#5841D8" /></View>
             <Text className="text-lg font-bold text-[#0F172A]">Fluxdevs</Text>
           </View>
           <View className="w-6" /> 
        </View>

        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40}}
          extraScrollHeight={140}
          enableAutomaticScroll
        >
          <Text className="text-2xl font-bold text-[#0F172A] mb-8">Tell Us about your Company</Text>
          <View className="mb-6">
            <Text className="text-[#334155] font-medium mb-2">Company Name</Text>
            <View className="relative">
              <TextInput value={companyName} onChangeText={setCompanyName} placeholder="Ex. Big Milo Enterprises" placeholderTextColor="#94A3B8" className={`h-14 border rounded-xl px-4 text-base text-[#0F172A] bg-white pr-10 ${nameAvailable === false ? 'border-red-500' : nameAvailable === true ? 'border-[#10B981]' : 'border-[#5841D8]'}`} />
              {checkingName && <View className="absolute right-3 top-4"><ActivityIndicator color="#5841D8" size="small" /></View>}
            </View>
            <View className="h-6 justify-center mt-1">
              {!checkingName && nameAvailable === true && <Text className="text-[#10B981] text-sm">Company name available</Text>}
              {!checkingName && nameAvailable === false && <Text className="text-red-500 text-sm">Company name is already taken</Text>}
            </View>
          </View>
          <View className="mb-10">
            <Text className="text-[#334155] font-medium mb-2">Industry</Text>
            <TouchableOpacity onPress={() => setShowIndustryModal(true)} className="h-14 border border-[#CBD5E1] rounded-xl px-4 flex-row items-center justify-between bg-white">
               <Text className="text-[#0F172A] text-base">{industry}</Text>
               <ChevronDown size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleCompanySubmit} disabled={loading || checkingName || nameAvailable === false} className={`bg-[#5841D8] h-14 rounded-xl items-center justify-center shadow-lg shadow-indigo-200 ${loading ? 'opacity-70' : ''}`}>
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Continue</Text>}
          </TouchableOpacity>
        </KeyboardAwareScrollView>
        {renderIndustryPicker()}
        {currentView === 'company_success' && renderSuccessModal("Company created successfully", "Your workspace is ready. You can now start managing your business from one place.", "Continue to Plans", handleToPricing)}
      </SafeAreaView>
    );
  }

  // --- VIEW 2: PRICING RENDER ---
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View className="px-6 py-4 flex-row items-center justify-between">
         <TouchableOpacity onPress={() => setCurrentView('company')}><ArrowLeft size={24} color="#0F172A" /></TouchableOpacity>
         <View className="flex-row items-center">
           <View className="w-8 h-8 bg-[#F5F3FF] rounded-lg items-center justify-center mr-2"><Cloud size={16} color="#5841D8" /></View>
           <Text className="text-lg font-bold text-[#0F172A]">Fluxdevs</Text>
         </View>
         <View className="w-6" /> 
      </View>

      <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40}}
          extraScrollHeight={140}
          enableAutomaticScroll
      >
        <Text className="text-3xl font-bold text-[#0F172A] text-center mb-2">Simple, transparent pricing</Text>
        <Text className="text-[#64748B] text-center mb-8 px-2">Choose a plan based on your team size and business needs.</Text>

        <View className="bg-[#F0F5FF] rounded-2xl p-6 items-center mb-8">
           <View className="w-10 h-10 bg-[#DBEAFE] rounded-lg items-center justify-center mb-3"><Gift size={20} color="#5841D8" /></View>
           <Text className="text-[#0F172A] font-bold text-base mb-1">Start your Free 14 Days Trial</Text>
           <Text className="text-[#64748B] text-xs mb-4">Full access to all features • No credit card needed</Text>
           <TouchableOpacity className="border border-[#5841D8] rounded-lg px-6 py-2.5 bg-white"><View className="flex-row items-center gap-2"><Gift size={16} color="#5841D8" /><Text className="text-[#5841D8] font-semibold text-sm">Start Free Trial</Text></View></TouchableOpacity>
        </View>

        <View className="bg-[#F1F5F9] p-1 rounded-xl flex-row mb-10 mx-auto">
          <TouchableOpacity onPress={() => setBillingCycle('monthly')} className={`px-8 py-2.5 rounded-lg ${billingCycle === 'monthly' ? 'bg-[#5841D8]' : 'bg-transparent'}`}><Text className={`font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-[#64748B]'}`}>Monthly</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setBillingCycle('quarterly')} className={`px-8 py-2.5 rounded-lg ${billingCycle === 'quarterly' ? 'bg-[#5841D8]' : 'bg-transparent'}`}><Text className={`font-semibold ${billingCycle === 'quarterly' ? 'text-white' : 'text-[#64748B]'}`}>Quarterly</Text></TouchableOpacity>
        </View>

        {loadingPlans ? (
          <ActivityIndicator size="large" color="#5841D8" className="mt-8" />
        ) : (
          <View>
            {getFilteredPlans().length === 0 ? (
               <Text className="text-center text-[#64748B] mt-8">No {billingCycle} plans available for the {industry} industry.</Text>
            ) : (
              getFilteredPlans().map((plan) => (
                <View key={plan.id} className="border border-[#CBD5E1] rounded-2xl p-6 mb-6 bg-white shadow-sm">
                  <Text className="text-4xl font-bold text-[#0F172A] text-center mb-2">₦{parseFloat(plan.price).toLocaleString()}</Text>
                  <Text className="text-[#0F172A] font-bold text-lg text-center">{plan.name}</Text>
                  <Text className="text-[#64748B] text-center mb-6">{plan.description}</Text>
                  <View className="gap-y-3 mb-8">
                    <View className="flex-row items-center gap-3"><View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View><Text className="text-[#334155]">{plan.max_users} Users</Text></View>
                    <View className="flex-row items-center gap-3"><View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View><Text className="text-[#334155]">{plan.max_branches} Branches</Text></View>
                    <View className="flex-row items-center gap-3"><View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View><Text className="text-[#334155]">Billing: {plan.billing_period}</Text></View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handlePlanSelect(plan)}
                    disabled={processingPayment}
                    className={`bg-[#5841D8] h-12 rounded-xl items-center justify-center ${processingPayment ? 'opacity-70' : ''}`}
                  >
                    {processingPayment ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Get started</Text>}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* RENDER NEW MODAL STATES */}
      {currentView === 'payment_pending' && renderPaymentPendingModal()}
      {currentView === 'plan_success' && renderSuccessModal("Plan Selected Successfully", "Welcome to your Plan. Your subscription is now active and ready to use.", "Go to Dashboard", handleFinish)}
    </SafeAreaView>
  );
}