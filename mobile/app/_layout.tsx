import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
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
import { registerNavigate , kidApi, parentApi } from '../lib/api';
import {
  subscribeLocale,
  setAppLocale,
  getAppLocale,
  type ShortLocale,
} from '../lib/i18n';
import { initSentry, refreshSentryInstallTag, tagSentryUser } from '../lib/sentry';
import { ensureInstallId } from '../lib/installInfo';
import {
  getKidToken,
  getKidLocale,
  getParentLocale,
  setParentLocale,
  clearParentLocale,
} from '../lib/auth';
import { Platform, AppState } from 'react-native';
import * as Sentry from '@sentry/react-native';
// RevenueCat is parent-only; configured lazily inside the identity bridge
// once a Clerk session appears.
import {
  configureRevenueCat,
  loginRevenueCat,
  logoutRevenueCat,
} from '../lib/billing';

const CLERK_LOCALES: Record<ShortLocale, LocalizationResource> = {
  nb: clerkNb,
  en: clerkEn,
  sv: clerkSv,
  da: clerkDa,
};

// Initialize Sentry at module load — before any React tree mounts — so
// errors during component setup are captured. No-op if SENTRY_DSN isn't
// set (Expo Go without phase env, etc.).
initSentry();

// Bootstrap i18n with the device language before any screen mounts. The
// settings screen overrides this with the server-stored `me.locale` once
// the parent is authenticated, but pre-auth flows (sign-up, sign-in,
// kid pairing) need to render in the right language and link to the
// right legal-domain (kroni.no/.se/.dk).
//
// Boot-order resolution: stored kid locale (if a kid session is active)
// → cached parent locale (SecureStore mirror of parents.locale) → device
// locale → 'nb' default. Both stored reads are async since SecureStore
// is async; the device fallback runs synchronously first so the very
// first frame renders in *some* locale rather than blank, and the
// stored value overrides as soon as it resolves.
//
// The cached parent locale matters because the previous build only
// applied parents.locale once the parent opened Settings — anywhere
// else (sign-in screens, paywall, kid list) rendered in device locale
// until then. Mirroring to SecureStore means the next cold start
// already knows the parent's preferred language without a network
// round-trip; ParentLocaleBridge below keeps the cache in sync with
// the server while the parent is signed in.
// Module-scope session id. Logged from every diagnostic site so two
// different ids => the JS bundle was re-evaluated (cold restart, expo
// hot reload, or RN reload). Same id repeated means it's all one boot
// and any visible "refresh" is a React remount inside that boot.
const BOOT_ID = Math.random().toString(36).slice(2, 8);
const BOOT_TS = Date.now();
console.log('[boot] _layout module evaluated', { BOOT_ID, BOOT_TS });

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'nb';
console.log('[boot] module load', { BOOT_ID, deviceLocale });
setAppLocale(deviceLocale);
void (async () => {
  const [kidToken, storedKidLocale, storedParentLocale] = await Promise.all([
    getKidToken(),
    getKidLocale(),
    getParentLocale(),
  ]);
  console.log('[boot] async locale resolution', {
    hasKidToken: !!kidToken,
    storedKidLocale,
    storedParentLocale,
  });
  if (kidToken && storedKidLocale) {
    setAppLocale(storedKidLocale);
  } else if (storedParentLocale) {
    setAppLocale(storedParentLocale);
  }
})();

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

// Boot-time visibility into what actually got bundled. EAS inlines the
// publishable key from the env at build time — if the wrong env scope is
// used, or a local prebuild bypasses the EAS env entirely, you can read
// the prefix here in the Xcode device console (or in Sentry breadcrumbs)
// to confirm whether `pk_live_*`, `pk_test_*`, or '(empty)' shipped.
console.log(
  '[clerk] publishableKey',
  clerkPublishableKey ? `${clerkPublishableKey.slice(0, 8)}… (len ${clerkPublishableKey.length})` : '(empty)',
);
Sentry.addBreadcrumb({
  category: 'clerk',
  level: 'info',
  message: 'publishableKey bundled',
  data: {
    prefix: clerkPublishableKey ? clerkPublishableKey.slice(0, 8) : '(empty)',
    length: clerkPublishableKey.length,
  },
});

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
      console.log('[nav] router.replace from api', { path });
      router.replace(path as Parameters<typeof router.replace>[0]);
    });
  }, [router]);

  return null;
}

function AppStateLogger() {
  useEffect(() => {
    console.log('[appstate] mount', { BOOT_ID, current: AppState.currentState });
    const sub = AppState.addEventListener('change', (next) => {
      console.log('[appstate] change', { BOOT_ID, next });
    });
    return () => sub.remove();
  }, []);
  return null;
}

function ClerkAuthLogger() {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth();
  useEffect(() => {
    console.log('[clerk-auth] state', {
      BOOT_ID,
      isLoaded,
      isSignedIn,
      userId,
      sessionId,
    });
  }, [isLoaded, isSignedIn, userId, sessionId]);
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

  // Resolve the install id once at startup, then re-tag.
  useEffect(() => {
    void ensureInstallId().then(refreshSentryInstallTag);
  }, []);

  // Parent identity follows Clerk: tag on sign-in, clear on sign-out.
  useEffect(() => {
    console.log('[bridge:sentry] effect', { isLoaded, clerkUserId });
    if (!isLoaded) return;
    if (clerkUserId) {
      tagSentryUser({
        role: 'parent',
        userId: clerkUserId,
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
  }, [clerkUserId, isLoaded]);

  return null;
}

function RevenueCatIdentityBridge() {
  const { userId, isLoaded } = useAuth();
  const lastUserIdRef = useRef<string | null>(null);
  const configuredRef = useRef(false);

  useEffect(() => {
    console.log('[bridge:revenuecat] effect', {
      isLoaded,
      userId,
      previous: lastUserIdRef.current,
    });
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

/**
 * Keeps the in-app locale aligned with the server-stored `parents.locale`
 * regardless of which screen is open. Without this, the device-locale
 * fallback applied at module load (line ~71) sticks until the parent
 * navigates to Settings, which is where the `me` query was previously
 * the only thing calling `setAppLocale(me.locale)`. Result: cold-start
 * sign-in / paywall / kid list rendered in device locale (English on a
 * fresh emulator) until the parent opened Settings.
 *
 * Strategy: as soon as Clerk reports a signed-in user, fetch parent.me,
 * apply the locale, and mirror it to SecureStore so the next cold start
 * picks it up before the network round-trip completes. On sign-out,
 * drop the cache so a different parent on the same device starts from
 * the device default rather than inheriting the previous parent's
 * preference.
 */
function ParentLocaleBridge() {
  const { userId, isLoaded, getToken } = useAuth();
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('[bridge:locale] effect', {
      isLoaded,
      userId,
      previous: lastUserIdRef.current,
    });
    if (!isLoaded) return;
    const previous = lastUserIdRef.current;
    if (userId && previous !== userId) {
      lastUserIdRef.current = userId;
      void (async () => {
        try {
          const client = parentApi.clientFor(() => getToken());
          const me = await client.getMe();
          console.log('[bridge:locale] me', {
            locale: me?.locale,
            createdAt: me?.createdAt,
          });
          // Fresh-parent path: row younger than 5 min AND server still at
          // default 'nb'. Push the device locale UP to the server instead
          // of pulling 'nb' DOWN — otherwise a sign-up on an English/SE/DK
          // device fires `setAppLocale('nb')` which causes a visible
          // re-render right after `/(parent)/(tabs)/kids` mounts. Same
          // five-minute window as the currency default below.
          const ageMs = me?.createdAt
            ? Date.now() - new Date(me.createdAt).getTime()
            : Number.POSITIVE_INFINITY;
          const isFreshParent = ageMs < 5 * 60 * 1000;
          // ShortLocale → AppLocale. Server stores BCP-47 with explicit
          // region; in-app i18n keys off the language only.
          const shortToApp = {
            nb: 'nb-NO',
            en: 'en-US',
            sv: 'sv-SE',
            da: 'da-DK',
          } as const;
          const deviceShort = getAppLocale();
          if (
            isFreshParent &&
            me?.locale === 'nb-NO' &&
            deviceShort !== 'nb'
          ) {
            try {
              await client.updateMe({ locale: shortToApp[deviceShort] });
              await setParentLocale(shortToApp[deviceShort]);
            } catch {
              // Best-effort — fall through to the normal align-to-server
              // path below, which is correct just slightly louder.
            }
          } else if (me?.locale) {
            setAppLocale(me.locale);
            await setParentLocale(me.locale);
          }
          // Currency default-from-region. Only fires for freshly created
          // parents (server default 'NOK' AND parent row younger than 5 min)
          // so existing users on a new device never have their stored
          // preference overwritten by the device's region. Maps NO→NOK,
          // SE→SEK, DK→DKK; anything else keeps NOK because we only ship
          // in those three markets.
          if (me?.currency === 'NOK' && isFreshParent) {
            const region = Localization.getLocales()[0]?.regionCode;
            const derived: 'NOK' | 'SEK' | 'DKK' =
              region === 'SE' ? 'SEK' : region === 'DK' ? 'DKK' : 'NOK';
            if (derived !== 'NOK') {
              try {
                await client.updateMe({ currency: derived });
              } catch {
                // Best-effort — UI still renders in NOK and the parent
                // can switch in Settings.
              }
            }
          }
        } catch {
          // Network / unauthorized — boot-cached SecureStore value stays
          // in effect. Surfaces no error to the user.
        }
      })();
    } else if (!userId && previous !== null) {
      lastUserIdRef.current = null;
      void clearParentLocale();
    }
  }, [userId, isLoaded, getToken]);

  return null;
}

/**
 * Registers the signed-in parent's Expo push token with our backend so
 * RevenueCat-driven billing notifications (failed payment, expiration)
 * can be delivered to the household owner. We declined RC's direct APNs
 * push integration; everything routes through `/parent/devices`.
 *
 * Idempotency: keyed on (Clerk userId, push token) — never re-sends the
 * same pair. Permission denial is respected; we don't re-prompt on every
 * launch. Failures are logged as Sentry breadcrumbs but never thrown so
 * sign-in is never blocked by push registration.
 */
function ParentDevicePushBridge() {
  const { userId, isLoaded, getToken } = useAuth();
  const lastRegistered = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      lastRegistered.current = null;
      return;
    }

    void (async () => {
      // Native push tokens are iOS/Android only. Web doesn't get RC pushes.
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

      // Respect the user's choice: if they've already denied, don't
      // re-prompt on every launch. Only ask when status is undetermined.
      const existing = await Notifications.getPermissionsAsync();
      let status = existing.status;
      if (status !== 'granted' && existing.canAskAgain) {
        const requested = await Notifications.requestPermissionsAsync();
        status = requested.status;
      }
      if (status !== 'granted') return;

      const projectId =
        (Constants.expoConfig?.extra?.['eas'] as { projectId?: string } | undefined)
          ?.projectId;
      const tokenResponse = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined,
      );
      const pushToken = tokenResponse.data;

      // Idempotency guard: skip if we've already registered this exact
      // (userId, pushToken) pair this session.
      const key = `${userId}:${pushToken}`;
      if (lastRegistered.current === key) return;

      const deviceId = await ensureInstallId();
      const platform: 'ios' | 'android' =
        Platform.OS === 'ios' ? 'ios' : 'android';

      try {
        await parentApi
          .clientFor(getToken)
          .registerParentDevice(deviceId, pushToken, platform);
        lastRegistered.current = key;
      } catch (err: unknown) {
        // Push registration failure must never block sign-in or surface
        // to the user — we just leave a breadcrumb for triage.
        Sentry.addBreadcrumb({
          category: 'push',
          level: 'warning',
          message: 'parent device registration failed',
          data: {
            platform,
            error: err instanceof Error ? err.message : String(err),
          },
        });
      }
    })();
  }, [userId, isLoaded, getToken]);

  return null;
}

function RootLayout() {
  // Locale state — bumping it re-renders this layout AND re-keys the
  // <Stack> below so every mounted screen unmounts and remounts with the
  // new locale. We need the re-key because expo-router/react-navigation
  // owns the screen tree internally; a parent re-render alone doesn't
  // propagate to the screens, so `t(...)` strings stay stale (the picker
  // logs `setAppLocale FIRE` and the layout re-renders, but the visible
  // screen still shows the old language). Losing nav stack state on a
  // language flip is the cost — language changes are rare and the user
  // is in a settings screen at the moment of change anyway.
  const [shortLocale, setShortLocale] = useState<ShortLocale>(() =>
    getAppLocale(),
  );
  const renderCounter = useRef(0);
  renderCounter.current += 1;
  console.log('[layout] RootLayout render', {
    BOOT_ID,
    n: renderCounter.current,
    sinceBootMs: Date.now() - BOOT_TS,
    shortLocale,
  });
  useEffect(() => {
    console.log('[layout] RootLayout MOUNT', { BOOT_ID });
    return () => console.log('[layout] RootLayout UNMOUNT', { BOOT_ID });
  }, []);
  useEffect(
    () =>
      subscribeLocale((next) => {
        console.log('[layout] locale subscriber fired', { BOOT_ID, next });
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
          <AppStateLogger />
          <ClerkAuthLogger />
          <SentryIdentityBridge />
          <RevenueCatIdentityBridge />
          <ParentLocaleBridge />
          <ParentDevicePushBridge />
          <Stack key={shortLocale} screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default Sentry.wrap(RootLayout);
