import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import {
  nbNO as clerkNb,
  enUS as clerkEn,
  svSE as clerkSv,
  daDK as clerkDa,
} from '@clerk/localizations';
import type { LocalizationResource } from '@clerk/types';
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
import * as Localization from 'expo-localization';
import { registerNavigate } from '../lib/api';
import {
  subscribeLocale,
  setAppLocale,
  getAppLocale,
  type ShortLocale,
} from '../lib/i18n';

const CLERK_LOCALES: Record<ShortLocale, LocalizationResource> = {
  nb: clerkNb,
  en: clerkEn,
  sv: clerkSv,
  da: clerkDa,
};
import { initSentry, refreshSentryInstallTag, tagSentryUser } from '../lib/sentry';
import { ensureInstallId } from '../lib/installInfo';
import { getKidToken } from '../lib/auth';
import { kidApi } from '../lib/api';

// Initialize Sentry at module load — before any React tree mounts — so
// errors during component setup are captured. No-op if SENTRY_DSN isn't
// set (Expo Go without phase env, etc.).
initSentry();

// Bootstrap i18n with the device language before any screen mounts. The
// settings screen overrides this with the server-stored `me.locale` once
// the parent is authenticated, but pre-auth flows (sign-up, sign-in,
// kid pairing) need to render in the right language and link to the
// right legal-domain (kroni.no/.se/.dk).
const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'nb';
setAppLocale(deviceLocale);
// RevenueCat is parent-only; configured lazily inside the identity bridge
// once a Clerk session appears.
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
 * Mirrors the Clerk parent identity into RevenueCat. RevenueCat is parent-
 * only — kids never enter a paywall flow, so we lazily configure the SDK
 * the first time a Clerk session appears on the device. On Clerk sign-in
 * we call `Purchases.logIn(userId)` so any anonymous purchases attached to
 * the device transfer onto that Clerk user; on Clerk sign-out we call
 * `Purchases.logOut` so a different parent signing in on the same device
 * starts with a fresh anonymous id and doesn't inherit the previous
 * parent's entitlements.
 */
/**
 * Tags the Sentry scope with the current user identity so events join to
 * the same `app_role` / `parent_id` / `kid_id` we stamp server-side. Also
 * refreshes the install tag once the async install id resolves.
 */
function SentryIdentityBridge() {
  const { userId: clerkUserId, isLoaded } = useAuth();
  const { user } = useUser();

  // Resolve the install id once at startup, then re-tag.
  useEffect(() => {
    void ensureInstallId().then(refreshSentryInstallTag);
  }, []);

  // Parent identity follows Clerk: tag on sign-in, clear on sign-out.
  useEffect(() => {
    if (!isLoaded) return;
    if (clerkUserId) {
      tagSentryUser({
        role: 'parent',
        userId: clerkUserId,
        email: user?.primaryEmailAddress?.emailAddress ?? null,
      });
    } else {
      // No Clerk session — fall through to kid-token check below.
      void (async () => {
        const kidToken = await getKidToken();
        if (kidToken) {
          try {
            const me = await kidApi.getMe();
            tagSentryUser({ role: 'kid', userId: me.id });
            return;
          } catch {
            // Token expired / network — skip silently; events will still
            // carry install + version, just no user id.
          }
        }
        tagSentryUser(null);
      })();
    }
  }, [clerkUserId, isLoaded, user?.primaryEmailAddress?.emailAddress]);

  return null;
}

function RevenueCatIdentityBridge() {
  const { userId, isLoaded } = useAuth();
  const lastUserIdRef = useRef<string | null>(null);
  const configuredRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    const previous = lastUserIdRef.current;
    if (userId && previous !== userId) {
      // First parent activity on this install — initialize the SDK now.
      if (!configuredRef.current) {
        configureRevenueCat();
        configuredRef.current = true;
      }
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
  // Locale-version key — bumped whenever setAppLocale fires. The Stack
  // below uses this as its `key`, so every screen remounts and re-runs
  // its `t(...)` calls against the new locale. ClerkProvider and
  // QueryClientProvider sit above the key boundary, so auth + cached
  // data survive the swap.
  const [localeKey, setLocaleKey] = useState(0);
  const [shortLocale, setShortLocale] = useState<ShortLocale>(() =>
    getAppLocale(),
  );
  useEffect(
    () =>
      subscribeLocale((next) => {
        setLocaleKey((n) => n + 1);
        setShortLocale(next);
      }),
    [],
  );

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      tokenCache={tokenCache}
      localization={CLERK_LOCALES[shortLocale]}
    >
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationRegistrar />
          <SentryIdentityBridge />
          <RevenueCatIdentityBridge />
          <Stack key={localeKey} screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
