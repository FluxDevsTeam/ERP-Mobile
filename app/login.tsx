import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // <--- NEW IMPORT
import { Cloud, Check } from 'lucide-react-native';
import { Stack, router } from 'expo-router';
import "../global.css"; 

export default function LoginScreen() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = () => {
    router.replace('/onboarding');
  };

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
        <View className="items-center mt-8 mb-10">
          <View className="flex-row items-center">
            <View className="w-9 h-9 bg-[#F5F3FF] border border-[#E0E7FF] rounded-lg items-center justify-center mr-2">
              <Cloud size={20} color="#5841D8" />
            </View>
            <Text className="text-xl font-bold text-[#0F172A]">Fluxdevs</Text>
          </View>
        </View>

        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-[#0F172A] mb-2">Log in</Text>
          <Text className="text-[#64748B] text-base text-center">Welcome back! Please enter your details.</Text>
        </View>

        <View className="gap-y-5">
          <View>
            <Text className="text-[14px] font-medium text-[#334155] mb-1.5">Email</Text>
            <TextInput placeholder="Enter your email" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" className="h-12 border border-[#D1D5DB] rounded-lg px-4 text-base text-[#0F172A] bg-white" />
          </View>
          <View>
            <Text className="text-[14px] font-medium text-[#334155] mb-1.5">Password</Text>
            <TextInput placeholder="••••••••" placeholderTextColor="#94A3B8" secureTextEntry className="h-12 border border-[#D1D5DB] rounded-lg px-4 text-base text-[#0F172A] bg-white" />
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-5 mb-8">
          <TouchableOpacity activeOpacity={1} onPress={() => setRememberMe(!rememberMe)} className="flex-row items-center">
            <View className={`w-5 h-5 rounded border items-center justify-center mr-2 ${rememberMe ? 'bg-[#5841D8] border-[#5841D8]' : 'bg-white border-[#D1D5DB]'}`}>
              {rememberMe && <Check size={14} color="white" strokeWidth={3} />}
            </View>
            <Text className="text-[#334155] text-sm font-medium">Remember for 30 days</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
  <Text className="text-[#EF4444] text-sm font-semibold">Forgot password</Text>
</TouchableOpacity>
         </View>

        <View className="gap-y-4">
          <TouchableOpacity onPress={handleSignIn} className="bg-[#5841D8] h-12 rounded-lg items-center justify-center shadow-sm">
            <Text className="text-white text-base font-semibold">Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white border border-[#D1D5DB] h-12 rounded-lg flex-row items-center justify-center">
            <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} className="w-5 h-5 mr-3" />
            <Text className="text-[#334155] text-base font-semibold">Sign in with Google</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-10 mb-8 items-center">
          <Text className="text-[#64748B] text-sm">
            Don't have an account? <Text onPress={() => router.back()} className="text-[#5841D8] font-semibold">Sign up</Text>
          </Text>
        </View>

      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}