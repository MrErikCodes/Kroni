import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { nbNO } from '@clerk/localizations';
import { tokenCache } from '../lib/clerkTokenCache';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
  Newsreader_600SemiBold,
  Newsreader_600SemiBold_Italic,
  Newsreader_700Bold,
} from '@expo-google-fonts/newsreader';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { registerNavigate } from '../lib/api';
import {
  configureRevenueCat,
  loginRevenueCat,
  logoutRevenueCat,
} from '../lib/billing';

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

/**
 * Mirrors the Clerk parent identity into RevenueCat. On Clerk sign-in we call
 * `Purchases.logIn(userId)` so any anonymous purchases attached to the device
 * transfer onto that Clerk user; on Clerk sign-out we call `Purchases.logOut`
 * so a different parent signing in on the same device starts with a fresh
 * anonymous id and doesn't inherit the previous parent's entitlements.
 */
function RevenueCatIdentityBridge() {
  const { userId, isLoaded } = useAuth();
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const previous = lastUserIdRef.current;
    if (userId && previous !== userId) {
      lastUserIdRef.current = userId;
      void loginRevenueCat(userId);
    } else if (!userId && previous !== null) {
      lastUserIdRef.current = null;
      void logoutRevenueCat();
    }
  }, [userId, isLoaded]);

  return null;
}

export default function RootLayout() {
  // Load Newsreader (display serif) + Inter (UI sans). Italic variants are
  // used for the single-noun emphasis in display headlines, mirroring the
  // website's editorial language.
  const [fontsLoaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium,
    Newsreader_600SemiBold,
    Newsreader_600SemiBold_Italic,
    Newsreader_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
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
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      tokenCache={tokenCache}
      localization={nbNO}
    >
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationRegistrar />
          <RevenueCatIdentityBridge />
          <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
