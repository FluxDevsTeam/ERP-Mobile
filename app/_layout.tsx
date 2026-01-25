import { Redirect, SplashScreen, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import "../global.css";

import LoadingSplashScreen from '../components/LoadingSplashScreen'; // Adjust path if needed
import { useUserStore } from '../store/userStore';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, token, hasHydrated } = useUserStore();
  const segments = useSegments();
  const [appIsReady, setAppIsReady] = useState(false);

  console.log('🔄 App State:', {
    hasHydrated,
    hasToken: !!token,
    hasUser: !!user,
    tenant: user?.tenant_name,
    segments,
    appIsReady
  });

  useEffect(() => {
    // Wait for store hydration
    if (!hasHydrated) {
      console.log('⏳ Waiting for store hydration...');
      return;
    }

    console.log('✅ Store is hydrated');

    // Hide splash screen and mark app as ready
    SplashScreen.hideAsync();
    setAppIsReady(true);

  }, [hasHydrated]);

  // Show custom loading screen until app is ready
  if (!appIsReady) {
    return <LoadingSplashScreen />;
  }

  // Get first segment safely
  const firstSegment = segments[0] ?? '';

  console.log('🎯 Current Route Segment:', firstSegment);
  console.log('📂 Full Segments:', segments);

  // Define auth routes ('' for root/signup)
  const authRoutes = ['', 'login', 'forgot-password', 'payment-callback'];
  const isAuthRoute = authRoutes.includes(firstSegment);

  // Check if in protected drawer group
  const isInProtectedGroup = firstSegment === '(drawer)';

  // Check for onboarding
  const isOnboarding = firstSegment === 'onboarding';

  // NO TOKEN - should be on auth routes
  if (!token) {
    console.log('🔐 No token found');
    if (!isAuthRoute) {
      console.log('➡️ Redirecting to login');
      return <Redirect href="/login" />;
    }
  }

  // HAS TOKEN but NO USER
  if (token && !user) {
    console.log('⚠️ Has token but no user data');
    return <Redirect href="/login" />;
  }

  // HAS TOKEN and USER but NO TENANT - needs onboarding
  if (token && user && !user.tenant_name) {
    console.log('📝 User needs onboarding');
    if (!isOnboarding) {
      console.log('➡️ Redirecting to onboarding');
      return <Redirect href="/onboarding" />;
    }
  }

  // HAS TOKEN, USER, and TENANT - should be in protected group
  if (token && user?.tenant_name) {
    console.log('🏠 User is fully authenticated');
    if (!isInProtectedGroup) {
      console.log('➡️ Redirecting to dashboard');
      return <Redirect href="/dashboard" />;
    }
  }

  // If we get here, user is on the correct route
  console.log('✅ User is on correct route:', firstSegment);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}