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
    bundleIdentifier: 'no.kroni.app',
  },
  android: {
    package: 'no.kroni.app',
    adaptiveIcon: {
      backgroundColor: '#FBFAF6',
      foregroundImage: './assets/images/android-icon-foreground.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
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
  },
  owner: 'nilsenkonsult',
});
