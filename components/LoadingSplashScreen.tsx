import React from 'react';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { Cloud } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function LoadingSplashScreen() {
  return (
    <View className="flex-1 bg-white justify-center items-center absolute inset-0 z-50 w-full h-full">
      {/* Centered Content */}
      <View className="items-center">
        {/* Logo Container with soft shadow */}
        <View className="w-20 h-20 bg-[#F5F3FF] rounded-3xl items-center justify-center mb-6 shadow-sm shadow-indigo-100 border border-[#E0E7FF]">
          <Cloud size={48} color="#5841D8" strokeWidth={1.5} />
        </View>
        
        {/* Brand Name */}
        <Text className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Fluxdevs
        </Text>
        <Text className="text-sm text-[#64748B] mt-2 font-medium tracking-wide uppercase">
          Enterprise ERP
        </Text>
      </View>

      {/* Footer Spinner */}
      <View className="absolute bottom-16 items-center">
        <ActivityIndicator size="large" color="#5841D8" />
        <Text className="text-[#94A3B8] text-xs mt-4 font-medium">Initializing...</Text>
      </View>
    </View>
  );
}