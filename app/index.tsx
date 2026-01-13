import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Cloud } from 'lucide-react-native';
import { Stack } from 'expo-router';
import "../global.css"; 

export default function SignupScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* This hides the "index" header at the top of the screen */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      
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
            <TouchableOpacity className="bg-[#5841D8] h-14 rounded-xl items-center justify-center">
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
    </SafeAreaView>
  );
}