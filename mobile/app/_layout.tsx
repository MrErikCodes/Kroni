import '../global.css';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { registerNavigate } from '../lib/api';
import { configureRevenueCat } from '../lib/billing';

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

// Configure notification handler — foreground notifications suppressed by default;
// individual screens handle them via addNotificationReceivedListener.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function NavigationRegistrar() {
  const router = useRouter();

  useEffect(() => {
    // Wire API client navigate calls to expo-router
    registerNavigate((path) => {
      router.replace(path as Parameters<typeof router.replace>[0]);
    });
  }, [router]);

  return null;
}

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

  // Initialize RevenueCat once on mount
  useEffect(() => {
    configureRevenueCat();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationRegistrar />
          <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
