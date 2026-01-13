import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Cloud, ArrowLeft, Check } from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import "../global.css"; 

export default function ForgotPasswordScreen() {
  // Steps: 1=Email, 2=OTP, 3=NewPassword, 4=SuccessModal
  const [step, setStep] = useState(1);
  
  // State for Inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Refs for OTP auto-focus
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // --- ACTIONS ---

  const handleEmailSubmit = () => {
    // API call to send email would go here
    setStep(2);
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next
    if (text.length === 1 && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-focus prev
    if (text.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpVerify = () => {
    // Verify OTP logic here
    setStep(3);
  };

  const handleSetNewPassword = () => {
    // API call to update password
    setStep(4); // Show success modal
  };

  const handleDone = () => {
    // Go back to login screen
    router.replace('/login');
  };

  // --- RENDER HELPERS ---

  // Shared Header for Steps 1, 2, 3
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
      
      {/* Empty view to balance the flex-row center */}
      <View className="w-10" />
    </View>
  );

  // --- MAIN RENDER ---
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <KeyboardAwareScrollView 
        enableOnAndroid={true}
        extraScrollHeight={20}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        className="px-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Render the top bar (Logo/Back button) only if not in success modal */}
        {step < 4 && renderHeader()}

        {/* STEP 1: EMAIL INPUT */}
        {step === 1 && (
          <View>
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-[#0F172A] mb-4 text-center">Forgot Password?</Text>
              <Text className="text-[#64748B] text-base text-center leading-6">
                Enter the email address you used when you joined and we’ll send you instruction to reset your password.
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
              className="bg-[#5841D8] h-14 rounded-xl items-center justify-center shadow-md shadow-indigo-200 mb-8"
            >
              <Text className="text-white text-lg font-bold">Continue</Text>
            </TouchableOpacity>

            <View className="items-center">
               <Text className="text-[#64748B]">
                 You remember your password? <Text onPress={() => router.back()} className="text-[#5841D8] font-bold">Log In</Text>
               </Text>
            </View>
          </View>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <View>
            <View className="items-center mb-10">
              <Text className="text-3xl font-bold text-[#0F172A] mb-4 text-center">OTP Verification</Text>
              <Text className="text-[#64748B] text-base text-center leading-6">
                Please check your email and enter the OTP code sent to your email address
              </Text>
            </View>

            <View className="flex-row justify-between px-4 mb-8">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  className={`w-14 h-14 border-b-2 text-center text-3xl font-bold text-[#0F172A] ${digit ? 'border-[#5841D8]' : 'border-[#CBD5E1]'}`}
                />
              ))}
            </View>

            <View className="items-center mb-8">
               <Text className="text-[#64748B]">
                 Didn't get any code? <Text className="text-[#5841D8] font-bold">Resend Code</Text>
               </Text>
            </View>

            <TouchableOpacity 
              onPress={handleOtpVerify}
              className="bg-[#5841D8] h-14 rounded-xl items-center justify-center shadow-md shadow-indigo-200 mb-8"
            >
              <Text className="text-white text-lg font-bold">Verify</Text>
            </TouchableOpacity>

            <View className="items-center">
               <Text className="text-[#64748B]">
                 You remember your password? <Text onPress={() => router.replace('/login')} className="text-[#5841D8] font-bold">Log In</Text>
               </Text>
            </View>
          </View>
        )}

        {/* STEP 3: SET NEW PASSWORD */}
        {step === 3 && (
          <View>
            <View className="items-center mb-8">
              <Text className="text-3xl font-bold text-[#0F172A] mb-4 text-center">Set New Password</Text>
              <Text className="text-[#64748B] text-base text-center">
                Must be at least eight (8) characters
              </Text>
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
              className="bg-[#5841D8] h-14 rounded-xl items-center justify-center shadow-md shadow-indigo-200"
            >
              <Text className="text-white text-lg font-bold">Set new password</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* STEP 4: SUCCESS MODAL */}
      <Modal animationType="fade" transparent={true} visible={step === 4}>
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-2xl p-8 items-center">
            {/* Success Icon */}
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