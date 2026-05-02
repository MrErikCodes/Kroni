// [REVIEW] Norwegian tab labels — verify with native speaker
import { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Sun, Wallet, Gift, User } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { getKidToken } from '../../../lib/auth';
import { t } from '../../../lib/i18n';
import { kidApi } from '../../../lib/api';

export default function KidTabsLayout() {
  const theme = useTheme();
  const router = useRouter();

  // Token-ready gate. Without this the useQuery below fires on first
  // render — kidApi.getMe synchronously calls kidRequest, which calls
  // navigateToRoot('/') if no token is in SecureStore, bouncing the kid
  // off the tabs before the redirect-to-pair effect ever runs.
  const [tokenReady, setTokenReady] = useState(false);

  // Mount the kid me query at the layout root so every tab inherits the
  // kid's currency in cache. `useCurrency()` reads from this — without it
  // the balance/rewards screens would format in NOK on first render until
  // a child screen happened to fetch /kid/me independently.
  useQuery({
    queryKey: ['kid', 'me'],
    queryFn: () => kidApi.getMe(),
    enabled: tokenReady,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    console.log('[kid-tabs] auth-guard effect');
    // Verify kid token exists; redirect to pair if not
    void getKidToken().then((token) => {
      console.log('[kid-tabs] token check', { hasToken: !!token });
      if (!token) {
        console.log('[kid-tabs] redirecting -> /auth/kid-pair');
        router.replace('/auth/kid-pair');
        return;
      }
      setTokenReady(true);
    });
  }, [router]);

  // Same render-time gate as the parent tabs: useEffect-based redirects
  // are too late — the children mount and fire their own queries before
  // the redirect lands. Block render until the token check has passed.
  if (!tokenReady) {
    console.log('[kid-tabs] gated render (waiting for token check)');
    return null;
  }

  // Same editorial tab styling as the parent shell.
  const activeTint = theme.colors.gold[500];
  const inactiveTint = theme.text.secondary;
  const tabBarBg = theme.isDark ? theme.colors.ink[900] : theme.colors.sand[50];
  const borderColor = theme.surface.border;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarStyle: {
          // `position: 'relative'` makes the tab bar reserve its own space
          // instead of floating over content. Without it, the last items in
          // each tab's ScrollView/FlashList scroll under the bar and only the
          // top edge peeks above (looked like a stuck banner on Profil).
          position: 'relative',
          backgroundColor: tabBarBg,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.uiMedium,
          fontSize: 12,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: t('kid.today'),
          tabBarIcon: ({ color, size }) => (
            <Sun size={size} color={color} strokeWidth={1.75} />
          ),
          tabBarAccessibilityLabel: t('kid.today'),
        }}
      />
      <Tabs.Screen
        name="balance"
        options={{
          title: t('kid.balance'),
          tabBarIcon: ({ color, size }) => (
            <Wallet size={size} color={color} strokeWidth={1.75} />
          ),
          tabBarAccessibilityLabel: t('kid.balance'),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: t('kid.rewards'),
          tabBarIcon: ({ color, size }) => (
            <Gift size={size} color={color} strokeWidth={1.75} />
          ),
          tabBarAccessibilityLabel: t('kid.rewards'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('kid.profile'),
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={1.75} />
          ),
          tabBarAccessibilityLabel: t('kid.profile'),
        }}
      />
    </Tabs>
  );
}
