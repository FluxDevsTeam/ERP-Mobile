import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import "../global.css";

import { useUserStore } from '../store/userStore';
import LoadingSplashScreen from '@/components/loadingsplashscreen';

export default function Layout() {
  const [isReady, setIsReady] = useState(false);
  const user = useUserStore((state) => state.user);
  const token = useUserStore((state) => state.token);
  
  // 1. Get Navigation State
  const rootNavigationState = useRootNavigationState();
  const segments = useSegments() as string[];

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  useEffect(() => {
    // 2. CRITICAL CHECK: Do not run logic until navigation is mounted
    if (!rootNavigationState?.key) return;

    const performAuthCheck = async () => {
      const currentRoute = segments[0]; 
      const inPublicGroup = !currentRoute || ['login', 'forgot-password'].includes(currentRoute);

      // --- LOGIC ---
      if (token && user?.tenant_name) {
        if (inPublicGroup) {
          router.replace('/dashboard');
        }
      } 
      else if (token && !user?.tenant_name) {
        if (currentRoute !== 'onboarding') {
          router.replace('/onboarding');
        }
      }
      
      // Reveal app after check
      setTimeout(() => {
        setIsReady(true);
      }, 1000);
    };

    performAuthCheck();

  }, [token, user, rootNavigationState?.key]); 

  // 3. While Expo is loading the Root Layout, show NOTHING (or Splash)
  // This prevents the "Attempted to navigate before mounting" error
  if (!rootNavigationState?.key) {
    return <LoadingSplashScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
      {!isReady && <LoadingSplashScreen />}
    </View>
  );
}