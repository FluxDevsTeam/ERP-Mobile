import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { 
  ArrowLeft, 
  Cloud, 
  ChevronDown, 
  Check, 
  Gift, 
  CheckCircle2 
} from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import "../global.css";

export default function OnboardingScreen() {
  // Steps: 'company', 'company_success', 'pricing', 'plan_success'
  const [currentView, setCurrentView] = useState('company'); 
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annually'

  // --- LOGIC HANDLERS ---

  const handleCompanySubmit = () => {
    setCurrentView('company_success');
  };

  const handleToPricing = () => {
    setCurrentView('pricing');
  };

  const handlePlanSelect = () => {
    setCurrentView('plan_success');
  };

  const handleFinish = () => {
    // Navigate to your actual dashboard or home
    // router.replace('/dashboard'); 
    alert("Welcome to the Dashboard!");
  };

  // --- RENDER HELPERS ---

  const renderSuccessModal = (
    title: string, 
    subtitle: string, 
    buttonText: string, 
    onPress: () => void
  ) => (
    <Modal animationType="fade" transparent={true} visible={true}>
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white w-full rounded-3xl p-8 items-center">
          {/* Big Green Check Circle */}
          <View className="w-28 h-28 bg-[#ECFDF5] rounded-full items-center justify-center mb-6">
            <View className="w-20 h-20 bg-[#D1FAE5] rounded-full items-center justify-center">
               <Check size={40} color="#10B981" strokeWidth={3} />
            </View>
          </View>

          <Text className="text-2xl font-bold text-[#0F172A] text-center mb-4">{title}</Text>
          <Text className="text-[#64748B] text-center text-sm leading-6 mb-8 px-2">
            {subtitle}
          </Text>

          <TouchableOpacity 
            onPress={onPress}
            className="bg-[#5841D8] w-full h-14 rounded-xl items-center justify-center shadow-lg shadow-indigo-200"
          >
            <Text className="text-white text-base font-bold">{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // --- VIEW 1: COMPANY FORM ---
  if (currentView === 'company' || currentView === 'company_success') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />

        <View className="px-6 py-4 flex-row items-center justify-between">
           <TouchableOpacity onPress={() => router.back()}>
             <ArrowLeft size={24} color="#0F172A" />
           </TouchableOpacity>
           <View className="flex-row items-center">
             <View className="w-8 h-8 bg-[#F5F3FF] rounded-lg items-center justify-center mr-2">
               <Cloud size={16} color="#5841D8" />
             </View>
             <Text className="text-lg font-bold text-[#0F172A]">Fluxdevs</Text>
           </View>
           <View className="w-6" /> 
        </View>

        <View className="px-6 mt-6">
          <Text className="text-2xl font-bold text-[#0F172A] mb-8">Tell Us about your Company</Text>

          {/* Company Name */}
          <View className="mb-6">
            <Text className="text-[#334155] font-medium mb-2">Company Name</Text>
            <TextInput 
              value="Big Milo Enterprises" // Hardcoded for demo
              className="h-14 border border-[#5841D8] rounded-xl px-4 text-base text-[#0F172A] bg-white"
            />
            <Text className="text-[#5841D8] text-sm mt-2">Company name available</Text>
          </View>

          {/* Industry Dropdown (Visual) */}
          <View className="mb-10">
            <Text className="text-[#334155] font-medium mb-2">Industry</Text>
            <TouchableOpacity className="h-14 border border-[#CBD5E1] rounded-xl px-4 flex-row items-center justify-between">
               <Text className="text-[#0F172A] text-base">Finance</Text>
               <ChevronDown size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={handleCompanySubmit}
            className="bg-[#5841D8] h-14 rounded-xl items-center justify-center shadow-lg shadow-indigo-200"
          >
            <Text className="text-white text-lg font-bold">Continue</Text>
          </TouchableOpacity>
        </View>

        {/* MODAL 1: COMPANY SUCCESS */}
        {currentView === 'company_success' && renderSuccessModal(
          "Company created successfully",
          "Your workspace is ready. You can now start managing your business from one place.",
          "Continue to Plans",
          handleToPricing
        )}
      </SafeAreaView>
    );
  }

  // --- VIEW 2: PRICING ---
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
           <TouchableOpacity onPress={() => setCurrentView('company')}>
             <ArrowLeft size={24} color="#0F172A" />
           </TouchableOpacity>
           <View className="flex-row items-center">
             <View className="w-8 h-8 bg-[#F5F3FF] rounded-lg items-center justify-center mr-2">
               <Cloud size={16} color="#5841D8" />
             </View>
             <Text className="text-lg font-bold text-[#0F172A]">Fluxdevs</Text>
           </View>
           <View className="w-6" /> 
        </View>

        <Text className="text-3xl font-bold text-[#0F172A] text-center mb-2">
          Simple, transparent pricing
        </Text>
        <Text className="text-[#64748B] text-center mb-8 px-2">
          Choose a plan based on your team size and business needs. You can switch plans, upgrade, or cancel at any time.
        </Text>

        {/* Free Trial Banner */}
        <View className="bg-[#F0F5FF] rounded-2xl p-6 items-center mb-8">
           <View className="w-10 h-10 bg-[#DBEAFE] rounded-lg items-center justify-center mb-3">
             <Gift size={20} color="#5841D8" />
           </View>
           <Text className="text-[#0F172A] font-bold text-base mb-1">Start your Free 14 Days Trial</Text>
           <Text className="text-[#64748B] text-xs mb-4">Full access to all features • No credit card needed</Text>
           <TouchableOpacity className="border border-[#5841D8] rounded-lg px-6 py-2.5 bg-white">
             <View className="flex-row items-center gap-2">
               <Gift size={16} color="#5841D8" />
               <Text className="text-[#5841D8] font-semibold text-sm">Start Free Trial</Text>
             </View>
           </TouchableOpacity>
        </View>

        {/* Toggle */}
        <View className="bg-[#F1F5F9] p-1 rounded-xl flex-row mb-10 mx-auto">
          <TouchableOpacity 
            onPress={() => setBillingCycle('monthly')}
            className={`px-8 py-2.5 rounded-lg ${billingCycle === 'monthly' ? 'bg-[#5841D8]' : 'bg-transparent'}`}
          >
            <Text className={`font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-[#64748B]'}`}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
             onPress={() => setBillingCycle('annually')}
             className={`px-8 py-2.5 rounded-lg ${billingCycle === 'annually' ? 'bg-[#5841D8]' : 'bg-transparent'}`}
          >
            <Text className={`font-semibold ${billingCycle === 'annually' ? 'text-white' : 'text-[#64748B]'}`}>Annually</Text>
          </TouchableOpacity>
        </View>

        {/* Plan Card 1 ($10) */}
        <View className="border border-[#5841D8] rounded-2xl p-6 mb-6 bg-white shadow-sm">
          <Text className="text-4xl font-bold text-[#0F172A] text-center mb-2">$10/mth</Text>
          <Text className="text-[#0F172A] font-bold text-lg text-center">Basic plan</Text>
          <Text className="text-[#64748B] text-center mb-6">Free forever</Text>

          <View className="gap-y-3 mb-8">
            {['1 User', '2 Branches', '20+ Integrations', 'Finance Industry', 'Basic chat and email support'].map((item, i) => (
              <View key={i} className="flex-row items-center gap-3">
                <View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View>
                <Text className="text-[#334155]">{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            onPress={handlePlanSelect}
            className="bg-[#5841D8] h-12 rounded-xl items-center justify-center"
          >
            <Text className="text-white font-bold">Get started</Text>
          </TouchableOpacity>
        </View>

        {/* Plan Card 2 ($20) */}
        <View className="border border-slate-200 rounded-2xl p-6 mb-6 bg-white">
          <Text className="text-4xl font-bold text-[#0F172A] text-center mb-2">$20/mth</Text>
          <Text className="text-[#0F172A] font-bold text-lg text-center">Business plan</Text>
          <Text className="text-[#64748B] text-center mb-6">Billed annually.</Text>

          <View className="gap-y-3 mb-8">
            {['5 User', '10 Branches', '50+ Integrations', 'Finance Industry', 'Basic chat and email support'].map((item, i) => (
              <View key={i} className="flex-row items-center gap-3">
                <View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View>
                <Text className="text-[#334155]">{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handlePlanSelect} className="bg-[#5841D8] h-12 rounded-xl items-center justify-center">
            <Text className="text-white font-bold">Get started</Text>
          </TouchableOpacity>
        </View>

        {/* Plan Card 3 ($40) */}
        <View className="border border-slate-200 rounded-2xl p-6 bg-white">
          <Text className="text-4xl font-bold text-[#0F172A] text-center mb-2">$40/mth</Text>
          <Text className="text-[#0F172A] font-bold text-lg text-center">Enterprise plan</Text>
          <Text className="text-[#64748B] text-center mb-6">Billed annually.</Text>

          <View className="gap-y-3 mb-8">
            {['5 User', '10 Branches', '50+ Integrations', 'Advanced custom fields', 'Audit log and data history'].map((item, i) => (
              <View key={i} className="flex-row items-center gap-3">
                <View className="bg-[#E0E7FF] rounded-full p-0.5"><Check size={12} color="#5841D8" /></View>
                <Text className="text-[#334155]">{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handlePlanSelect} className="bg-[#5841D8] h-12 rounded-xl items-center justify-center">
            <Text className="text-white font-bold">Get started</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL 2: PLAN SUCCESS */}
      {currentView === 'plan_success' && renderSuccessModal(
        "Free Trial Started Successful",
        "Welcome to Basic Plan. Your subscription is now active and ready to use.",
        "Go to Dashboard",
        handleFinish
      )}

    </SafeAreaView>
  );
}