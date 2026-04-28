// [REVIEW] Norwegian tab labels — verify with native speaker
import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { Users, CheckSquare, Gift, Settings } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { t } from '../../../lib/i18n';

export default function ParentTabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/auth/parent-sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  const activeTint = theme.colors.gold[500];
  const inactiveTint = theme.text.secondary;
  const tabBarBg = theme.surface.card;
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
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="kids"
        options={{
          title: t('parent.kids'),
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: t('parent.kids'),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('parent.tasks'),
          tabBarIcon: ({ color, size }) => (
            <CheckSquare size={size} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: t('parent.tasks'),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: t('parent.rewards'),
          tabBarIcon: ({ color, size }) => (
            <Gift size={size} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: t('parent.rewards'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('parent.settings'),
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: t('parent.settings'),
        }}
      />
    </Tabs>
  );
}
