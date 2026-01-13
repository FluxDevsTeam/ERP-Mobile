import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cloud, X, Check, BadgeCheck } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import "../global.css"; 

export default function SignupScreen() {
  // --- STATE MANAGEMENT ---
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(1); // 1 = Prompt, 2 = OTP, 3 = Success
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '']);
  // Refs to handle auto-focusing next input
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // --- ACTIONS ---

  // Open the flow
  const handleGetStarted = () => {
    setStep(1);
    setModalVisible(true);
  };

  // Move to OTP Step
  const handleSendEmail = () => {
    setStep(2);
  };

  // Handle OTP Input Logic
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input if typing a number
    if (text.length === 1 && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-focus previous input if deleting (optional but nice)
    if (text.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify Code and Show Success
  const handleVerifyCode = () => {
    // In a real app, you would check the API here
    setStep(3);
  };

  // Close everything
  const handleDone = () => {
  setModalVisible(false);
  // Navigate to the new Onboarding file we just created
  router.push('/onboarding');
};

  const handleClose = () => {
    setModalVisible(false);
    setStep(1); // Reset for next time
  }


  // --- RENDER MODAL CONTENT ---
  const renderModalContent = () => {
    switch (step) {
      case 1: // STEP 1: VERIFY EMAIL PROMPT
        return (
          <View className="bg-white w-full rounded-2xl p-6 relative">
            <TouchableOpacity onPress={handleClose} className="absolute top-4 right-4 z-10 p-2 bg-slate-50 rounded-full">
              <X size={20} color="#64748B" />
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-[#0F172A] mb-4 pr-8">Verify your email address</Text>
            
            <Text className="text-[#64748B] text-base text-center mb-6 leading-6">
              You have entered {'\n'}
              <Text className="font-bold text-[#0F172A]">the.rajihakeem@gmail.com</Text> as the email address for your account{'\n\n'}
              Please verify this email address by clicking the button below.
            </Text>

            <TouchableOpacity 
              onPress={handleSendEmail}
              className="bg-[#5841D8] h-12 rounded-xl items-center justify-center shadow-lg shadow-indigo-200"
            >
              <Text className="text-white text-base font-bold">Verify your email</Text>
            </TouchableOpacity>
          </View>
        );

      case 2: // STEP 2: OTP INPUT
        return (
          <View className="bg-white w-full rounded-2xl p-6 relative">
            <TouchableOpacity onPress={handleClose} className="absolute top-4 right-4 z-10 p-2 bg-slate-50 rounded-full">
              <X size={20} color="#64748B" />
            </TouchableOpacity>

            <Text className="text-2xl font-bold text-[#0F172A] mb-2">Email Verification</Text>
            <Text className="text-[#64748B] text-sm mb-8">Enter the verification code sent to your email</Text>

            {/* OTP Inputs */}
            <View className="flex-row justify-between px-2 mb-6">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  className={`w-14 h-14 border-b-2 text-center text-2xl font-bold text-[#0F172A] ${digit ? 'border-[#5841D8]' : 'border-[#CBD5E1]'}`}
                />
              ))}
            </View>

            <TouchableOpacity className="mb-8 items-center">
              <Text className="text-[#5841D8] font-semibold">Resend Code</Text>
            </TouchableOpacity>

            <View className="flex-row gap-x-4">
              <TouchableOpacity 
                onPress={handleClose}
                className="flex-1 h-12 rounded-xl items-center justify-center border border-[#EF4444]"
              >
                <Text className="text-[#EF4444] text-base font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleVerifyCode}
                className="flex-1 bg-[#5841D8] h-12 rounded-xl items-center justify-center shadow-md shadow-indigo-200"
              >
                <Text className="text-white text-base font-bold">Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 3: // STEP 3: SUCCESS
        return (
          <View className="bg-white w-full rounded-2xl p-8 items-center">
            {/* Success Icon */}
            <View className="w-24 h-24 bg-[#5841D8] rounded-full items-center justify-center mb-6 shadow-xl shadow-indigo-300">
               <Check size={48} color="white" strokeWidth={3} />
            </View>

            <Text className="text-2xl font-bold text-[#0F172A] mb-8">Email verified</Text>

            <TouchableOpacity 
              onPress={handleDone}
              className="bg-[#5841D8] w-full h-12 rounded-xl items-center justify-center shadow-lg shadow-indigo-200"
            >
              <Text className="text-white text-base font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  // --- MAIN SCREEN RENDER ---
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle={modalVisible ? "light-content" : "dark-content"} />
      
      {/* --- ORIGINAL FORM --- */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} 
          className="px-8" 
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View className="items-center mt-8 mb-12">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#F5F3FF] border border-[#E0E7FF] rounded-xl items-center justify-center mr-3">
                <Cloud size={22} color="#5841D8" />
              </View>
              <Text className="text-2xl font-bold text-[#0F172A]">Fluxdevs</Text>
            </View>
          </View>

          <Text className="text-4xl font-bold text-[#0F172A] mb-10">Sign up</Text>

          {/* Form Fields */}
          <View className="gap-y-6">
            <View>
              <Text className="text-[15px] font-semibold text-[#334155] mb-1">Name*</Text>
              <TextInput 
                placeholder="Enter your name" 
                placeholderTextColor="#94A3B8" 
                className="h-14 border border-[#D1D5DB] rounded-xl px-4 text-base bg-white" 
              />
            </View>

            <View>
              <Text className="text-[15px] font-semibold text-[#334155] mb-1">Email*</Text>
              <TextInput 
                placeholder="Enter your email" 
                placeholderTextColor="#94A3B8" 
                className="h-14 border border-[#D1D5DB] rounded-xl px-4 text-base bg-white" 
              />
            </View>

            <View>
              <Text className="text-[15px] font-semibold text-[#334155] mb-1">Password*</Text>
              <TextInput 
                placeholder="Create a password" 
                placeholderTextColor="#94A3B8" 
                secureTextEntry 
                className="h-14 border border-[#D1D5DB] rounded-xl px-4 text-base bg-white" 
              />
            </View>

            <View>
              <Text className="text-[15px] font-semibold text-[#334155] mb-1">Confirm Password*</Text>
              <TextInput 
                placeholder="Confirm password" 
                placeholderTextColor="#94A3B8" 
                secureTextEntry 
                className="h-14 border border-[#D1D5DB] rounded-xl px-4 text-base bg-white" 
              />
              <Text className="text-sm text-[#64748B] mt-2">Must be at least 8 characters.</Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="mt-10 gap-y-4">
            {/* UPDATED: onPress calls handleGetStarted */}
            <TouchableOpacity 
              onPress={handleGetStarted}
              activeOpacity={0.8}
              className="bg-[#5841D8] h-14 rounded-xl items-center justify-center shadow-md shadow-indigo-100"
            >
              <Text className="text-white text-lg font-bold">Get started</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white border border-[#D1D5DB] h-14 rounded-xl flex-row items-center justify-center">
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
                className="w-6 h-6 mr-3" 
              />
              <Text className="text-[#334155] text-lg font-bold">Sign up with Google</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-12 items-center">
            <Text className="text-[#64748B] text-base">
              Already have an account? <Text className="text-[#5841D8] font-bold">Log in</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- MODAL IMPLEMENTATION --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/60 justify-center items-center px-6">
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
              className="w-full"
            >
              {renderModalContent()}
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}