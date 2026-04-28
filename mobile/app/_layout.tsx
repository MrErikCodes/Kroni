import '../global.css';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

// Keep splash screen visible until fonts are loaded
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 s
      retry: 1,
    },
  },
});

const clerkPublishableKey: string =
  (Constants.expoConfig?.extra?.['clerkPublishableKey'] as string | undefined) ?? '';

export default function RootLayout() {
  // Load Inter font for Android; iOS uses SF Pro (system)
  const [fontsLoaded] = useFonts(
    Platform.OS === 'android'
      ? {
          Inter: require('../assets/fonts/SpaceMono-Regular.ttf'), // [REVIEW] Replace with Inter font file
        }
      : {},
  );

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Initialize RevenueCat lazily when API keys are present
  useEffect(() => {
    const iosKey = process.env.EXPO_PUBLIC_RC_IOS_KEY;
    const androidKey = process.env.EXPO_PUBLIC_RC_ANDROID_KEY;
    const key = Platform.OS === 'ios' ? iosKey : androidKey;
    if (key) {
      Purchases.configure({ apiKey: key });
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
