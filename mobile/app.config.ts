import { ExpoConfig, ConfigContext } from 'expo/config';

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
    // Universal links for the "share kid login link" feature. iOS verifies
    // these against `<domain>/.well-known/apple-app-site-association`. The
    // AASA file is served by the marketing site (kroni.no/.se/.dk) and
    // **must contain the production Team ID + bundle id** before TestFlight
    // — until then, taps on https://kroni.no/pair/<code> open Safari
    // instead of deep-linking into the app. The custom-scheme fallback
    // (`kroni://pair?code=…`) works without AASA.
    associatedDomains: [
      'applinks:kroni.no',
      'applinks:kroni.se',
      'applinks:kroni.dk',
    ],
  },
  android: {
    package: 'no.nilsenkonsult.kroni',
    adaptiveIcon: {
      backgroundColor: '#FBFAF6',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    // App Links for the "share kid login link" feature. Android verifies
    // these against `<domain>/.well-known/assetlinks.json`. The
    // assetlinks.json file is served by the marketing site (kroni.no/.se/
    // .dk) and **must contain the release SHA-256 fingerprint** before Play
    // release — until then, taps on https://kroni.no/pair/<code> open the
    // chooser instead of deep-linking into the app. The custom-scheme
    // fallback (`kroni://pair?code=…`) works without verified app links.
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          { scheme: 'https', host: 'kroni.no', pathPrefix: '/pair/' },
          { scheme: 'https', host: 'kroni.se', pathPrefix: '/pair/' },
          { scheme: 'https', host: 'kroni.dk', pathPrefix: '/pair/' },
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
        imageWidth: 96,
        resizeMode: 'contain',
        backgroundColor: '#FBFAF6',
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
