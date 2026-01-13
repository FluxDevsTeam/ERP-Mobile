import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import "../global.css";

export default function Layout() {
  
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Just set the icons to be Dark (Black). 
      // We don't need to set the background color because edge-to-edge 
      // effectively makes the nav bar transparent, revealing your white app bg.
      NavigationBar.setButtonStyleAsync("dark");
    }
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}