// [REVIEW] Norwegian tab labels — verify with native speaker
import { useEffect } from 'react';
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

  // Mount the kid me query at the layout root so every tab inherits the
  // kid's currency in cache. `useCurrency()` reads from this — without it
  // the balance/rewards screens would format in NOK on first render until
  // a child screen happened to fetch /kid/me independently.
  useQuery({
    queryKey: ['kid', 'me'],
    queryFn: () => kidApi.getMe(),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    // Verify kid token exists; redirect to pair if not
    void getKidToken().then((token) => {
      if (!token) {
        router.replace('/auth/kid-pair');
      }
    });
  }, [router]);

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
