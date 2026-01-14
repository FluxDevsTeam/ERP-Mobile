import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Cloud, ArrowLeft, Check } from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import "../global.css"; 

// API Imports
import { 
  requestForgotPassword, 
  verifyForgotPasswordOtp, 
  setNewPassword, 
  resendForgotPasswordOtp 
} from '../api/forgotPassword';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [email, setEmail] = useState('');
  
  // UPDATED: Array of 6 empty strings for 6-digit OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // --- ACTIONS ---

  // Step 1: Request OTP
  const handleEmailSubmit = async () => {
    if (!email) {
      Alert.alert("Required", "Please enter your email address.");
      return;
    }

    setLoading(true);
    const result = await requestForgotPassword(email);
    setLoading(false);

    if (result.success) {
      setStep(2);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  // Step 2: Verify OTP
  const handleOtpVerify = async () => {
    const otpString = otp.join('');
    
    // UPDATED: Check for 6 digits
    if (otpString.length < 6) {
      Alert.alert("Invalid OTP", "Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    const result = await verifyForgotPasswordOtp(email, otpString);
    setLoading(false);

    if (result.success) {
      setStep(3);
    } else {
      Alert.alert("Verification Failed", result.message);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    const result = await resendForgotPasswordOtp(email);
    setLoading(false);
    
    if (result.success) {
      Alert.alert("Sent", "A new code has been sent to your email.");
    } else {
      Alert.alert("Error", result.message);
    }
  };

  // Step 3: Set New Password
  const handleSetNewPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Required", "Please fill in both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const result = await setNewPassword(email, password, confirmPassword);
    setLoading(false);

    if (result.success) {
      setStep(4); // Show success modal
    } else {
      Alert.alert("Reset Failed", result.message);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // UPDATED: Auto-focus logic for 6 digits (indexes 0 to 5)
    if (text.length === 1 && index < 5) inputRefs.current[index + 1]?.focus();
    if (text.length === 0 && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleDone = () => {
    router.replace('/login');
  };

  // --- RENDER HEADER ---
  const renderHeader = () => (
    <View className="flex-row items-center justify-between mt-8 mb-12">
      <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
        <ArrowLeft size={24} color="#0F172A" />
      </TouchableOpacity>
      <View className="flex-row items-center">
        <View className="w-8 h-8 bg-[#F5F3FF] border border-[#E0E7FF] rounded-lg items-center justify-center mr-2">
          <Cloud size={18} color="#5841D8" />
        </View>
        <Text className="text-lg font-bold text-[#0F172A]">Fluxdevs</Text>
      </View>
      <View className="w-10" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40}}
        // className="px-6 pt-4 pb-10"
        extraScrollHeight={140}
        enableAutomaticScroll
      >
        {step < 4 && renderHeader()}

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <View>
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-[#0F172A] mb-4 text-center">Forgot Password?</Text>
              <Text className="text-[#64748B] text-base text-center leading-6">
                Enter the email address you used when you joined and we’ll send you instructions to reset your password.
              </Text>
            </View>

            <View className="mb-8">
              <Text className="text-[14px] font-medium text-[#334155] mb-1.5">Email</Text>
              <TextInput 
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email" 
                placeholderTextColor="#94A3B8" 
                keyboardType="email-address"
                autoCapitalize="none"
                className="h-14 border border-[#D1D5DB] rounded-xl px-4 text-base text-[#0F172A] bg-white" 
              />
            </View>

            <TouchableOpacity 
              onPress={handleEmailSubmit}
              disabled={loading}
              className={`bg-[#5841D8] h-14 rounded-xl items-center justify-center shadow-md shadow-indigo-200 mb-8 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Continue</Text>}
            </TouchableOpacity>

            <View className="items-center">
               <Text className="text-[#64748B]">
                 You remember your password? <Text onPress={() => router.back()} className="text-[#5841D8] font-bold">Log In</Text>
               </Text>
            </View>
          </View>
        )}

        {/* STEP 2: OTP (6 DIGITS) */}
        {step === 2 && (
          <View>
            <View className="items-center mb-10">
              <Text className="text-3xl font-bold text-[#0F172A] mb-4 text-center">OTP Verification</Text>
              <Text className="text-[#64748B] text-base text-center leading-6">
                Please check your email and enter the OTP code sent to your email address
              </Text>
            </View>

            {/* UPDATED: Container uses gap-1 to fit 6 items, reduced margins */}
            <View className="flex-row justify-between gap-1 px-1 mb-8">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  // UPDATED: Width set to w-11 (approx 44px) to fit 6 digits on small screens
                  // Font size reduced slightly to text-2xl
                  className={`w-11 h-14 border-b-2 text-center text-2xl font-bold text-[#0F172A] ${digit ? 'border-[#5841D8]' : 'border-[#CBD5E1]'}`}
                />
              ))}
            </View>

            <View className="items-center mb-8">
               <Text className="text-[#64748B]">
                 Didn't get any code? <Text onPress={handleResendOtp} className="text-[#5841D8] font-bold">Resend Code</Text>
               </Text>
            </View>

            <TouchableOpacity 
              onPress={handleOtpVerify}
              disabled={loading}
              className={`bg-[#5841D8] h-14 rounded-xl items-center justify-center shadow-md shadow-indigo-200 mb-8 ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Verify</Text>}
            </TouchableOpacity>

            <View className="items-center">
               <Text className="text-[#64748B]">
                 You remember your password? <Text onPress={() => router.replace('/login')} className="text-[#5841D8] font-bold">Log In</Text>
               </Text>
            </View>
          </View>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <View>
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-[#0F172A] mb-4 text-center">Set New Password</Text>
              <Text className="text-[#64748B] text-base text-center">Must be at least eight (8) characters</Text>
            </View>

            <View className="gap-y-6 mb-8">
              <View>
                <Text className="text-[14px] font-medium text-[#334155] mb-1.5">Password</Text>
                <TextInput 
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••" 
                  placeholderTextColor="#94A3B8" 
                  secureTextEntry
                  className="h-14 border border-[#D1D5DB] rounded-xl px-4 text-base text-[#0F172A] bg-white" 
                />
              </View>

              <View>
                <Text className="text-[14px] font-medium text-[#334155] mb-1.5">Confirm Password</Text>
                <TextInput 
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••" 
                  placeholderTextColor="#94A3B8" 
                  secureTextEntry
                  className="h-14 border border-[#D1D5DB] rounded-xl px-4 text-base text-[#0F172A] bg-white" 
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleSetNewPassword}
              disabled={loading}
              className={`bg-[#5841D8] h-14 rounded-xl items-center justify-center shadow-md shadow-indigo-200 ${loading ? 'opacity-70' : ''}`}
            >
               {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-bold">Set new password</Text>}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* STEP 4: SUCCESS MODAL */}
      <Modal animationType="fade" transparent={true} visible={step === 4}>
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-8 items-center">
            <View className="w-24 h-24 bg-[#5841D8] rounded-full items-center justify-center mb-6 shadow-xl shadow-indigo-300">
               <Check size={48} color="white" strokeWidth={3} />
            </View>
            <Text className="text-2xl font-bold text-[#0F172A] mb-8">Password reset</Text>
            <TouchableOpacity 
              onPress={handleDone}
              className="bg-[#5841D8] w-full h-12 rounded-xl items-center justify-center shadow-lg shadow-indigo-200"
            >
              <Text className="text-white text-base font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}