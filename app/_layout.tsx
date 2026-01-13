
import "../global.css"; // Ensure your styles are imported here
import { Stack } from 'expo-router';
// Check this import below:
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}