import React, { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Cloud } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

export default function LoadingSplashScreen() {
  const logoScale = useSharedValue(1);
  const cloudOpacity = useSharedValue(1);

  useEffect(() => {
    // Gentle pulse animation for logo
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1
    );

    // Subtle fade for cloud icon
    cloudOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const animatedCloudStyle = useAnimatedStyle(() => ({
    opacity: cloudOpacity.value,
  }));

  return (
    <View className="flex-1 bg-gradient-to-b from-[#F5F3FF] to-white justify-center items-center">
      {/* Centered Content */}
      <View className="items-center px-8">
        {/* Logo Container with enhanced shadow and gradient */}
        <Animated.View 
          style={animatedLogoStyle}
          className="w-24 h-24 bg-gradient-to-br from-[#5841D8] to-[#7C3AED] rounded-full items-center justify-center mb-8 shadow-lg shadow-indigo-300 border border-white/30"
        >
          <Animated.View style={animatedCloudStyle}>
            <Cloud size={56} color="white" strokeWidth={1.75} />
          </Animated.View>
        </Animated.View>
        
        {/* Brand Name with subtle gradient text */}
        <Text className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#5841D8] to-[#7C3AED] tracking-tight mb-1">
          Fluxdevs
        </Text>
        <Text className="text-base text-[#64748B] font-semibold tracking-wider uppercase opacity-80 mb-8">
          Enterprise ERP
        </Text>

        {/* Loading Text */}
        <Text className="text-[#94A3B8] text-sm font-medium tracking-wide">Initializing Your Experience...</Text>
      </View>
    </View>
  );
}