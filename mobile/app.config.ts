import { ExpoConfig, ConfigContext } from 'expo/config';

// EAS Build runs app.config.ts on the cloud worker before Metro bundles
// the JS. If EXPO_PUBLIC_* vars aren't in the build environment, they get
// inlined as empty strings and the resulting binary fails silently — the
// Clerk provider never initialises, the API client points at localhost,
// etc. Fail loud at config time instead of shipping a broken bundle. Only
// enforced in EAS Build (EAS_BUILD=true) so local Expo Go without phase
// run still works.
const isEasBuild = process.env.EAS_BUILD === 'true';
const requiredEasEnv = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY',
];
if (isEasBuild) {
  const missing = requiredEasEnv.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Missing required EAS Build environment variables: ${missing.join(', ')}. ` +
        `Set them via the EAS dashboard or 'eas env:create' and ensure the build profile in eas.json has the matching "environment" key.`,
    );
  }
}

export default ({ config: _config }: ConfigContext): ExpoConfig => ({
  name: 'Kroni',
  slug: 'kroni',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'kroni',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'no.nilsenkonsult.kroni',
    // Declares the app uses no non-exempt encryption (only HTTPS / Apple
    // crypto APIs). Skips the export-compliance question on every TestFlight
    // upload. Re-evaluate if we ship custom crypto.
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    // Universal links for the "share kid login link" feature. iOS verifies
    // this against `https://kroni.no/.well-known/apple-app-site-association`.
    // The AASA file is served by the marketing site and **must contain the
    // production Team ID + bundle id** before TestFlight — until then, taps
    // on https://kroni.no/pair/<code> open Safari instead of deep-linking
    // into the app. The custom-scheme fallback (`kroni://pair?code=…`)
    // works without AASA. kroni.no is the canonical brand domain — kroni.se
    // and kroni.dk are marketing/legal aliases and are intentionally NOT
    // wired for universal links to keep the share-link surface single-domain.
    associatedDomains: [
      'applinks:kroni.no',
    ],
  },
  android: {
    package: 'no.nilsenkonsult.kroni',
    adaptiveIcon: {
      backgroundColor: '#0E1116',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    // App Links for the "share kid login link" feature. Android verifies
    // this against `https://kroni.no/.well-known/assetlinks.json`. The file
    // is served by the marketing site and **must contain the upload key +
    // Play App Signing SHA-256 fingerprints** before Play release — until
    // then, taps on https://kroni.no/pair/<code> open the chooser instead
    // of deep-linking into the app. The custom-scheme fallback
    // (`kroni://pair?code=…`) works without verified app links. kroni.se
    // and kroni.dk are marketing aliases and intentionally NOT wired here.
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          { scheme: 'https', host: 'kroni.no', pathPrefix: '/pair/' },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        // The splash asset is the full "Kroni." wordmark on the brand-dark
        // sand-900 surface — it's a single canonical brand image, not a
        // theme-switched icon. Match the image's own background so there's
        // no visible seam between the splash plate and the logo, and bump
        // imageWidth so the wordmark is readable instead of rendering as a
        // tiny gold dot at 96pt. 280pt fits safely on the smallest device
        // (iPhone SE 320pt width) with margin.
        imageWidth: 280,
        resizeMode: 'contain',
        backgroundColor: '#0E1116',
        dark: {
          backgroundColor: '#0E1116',
        },
      },
    ],
    'expo-secure-store',
    'expo-notifications',
    'expo-localization',
    // Sentry config plugin: at EAS build time it (a) bundles the SDK
    // native module with the app and (b) uploads the JS bundle's source
    // maps to Sentry under a release named `${version}+${buildNumber}`,
    // matching what `Sentry.init` reports at runtime. Requires the
    // SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT env vars on the
    // build machine — see README/Sentry runbook.
    [
      '@sentry/react-native/expo',
      {
        // Self-hosted Sentry at sentry.mkapi.no. Org/project slugs are
        // fixed to the project under that instance; env vars override
        // for ad-hoc builds against a different sentry instance.
        organization: process.env.SENTRY_ORG ?? 'kroni',
        project: process.env.SENTRY_PROJECT ?? 'kroni-mobile',
        url: process.env.SENTRY_URL ?? 'https://sentry.mkapi.no/',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '0c4171da-0dac-4d60-91b4-dd3fbf8101d8',
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
    clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '',
    // Phase injects SENTRY_DSN; we accept either spelling so the env var
    // can be reused as-is across backend and mobile. DSNs are public per
    // Sentry's threat model — safe to ship in the bundle.
    sentryDsn:
      process.env.SENTRY_DSN ?? process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  },
  owner: 'nilsenkonsult',
});
