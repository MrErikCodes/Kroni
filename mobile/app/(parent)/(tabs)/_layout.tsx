// [REVIEW] Norwegian tab labels — verify with native speaker
import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { Users, CheckSquare, Gift, ClipboardCheck } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { t } from '../../../lib/i18n';

export default function ParentTabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  console.log('[parent-tabs] render', { isLoaded, isSignedIn });

  useEffect(() => {
    console.log('[parent-tabs] auth-guard effect', { isLoaded, isSignedIn });
    if (isLoaded && !isSignedIn) {
      console.log('[parent-tabs] redirecting to /auth/parent-sign-in');
      router.replace('/auth/parent-sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Editorial tab bar — sand-50 surface, sand-200 hairline top border,
  // gold-500 active (label + icon), sand-500 inactive, Inter Medium 12pt.
  // No drop shadow — restraint, like the website's footer.
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
          // Reset Android elevation so the bar reads as a hairline divider.
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
        name="kids"
        options={{
          title: t('parent.kids'),
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} strokeWidth={1.75} />
          ),
          tabBarAccessibilityLabel: t('parent.kids'),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('parent.tasks'),
          tabBarIcon: ({ color, size }) => (
            <CheckSquare size={size} color={color} strokeWidth={1.75} />
          ),
          tabBarAccessibilityLabel: t('parent.tasks'),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: t('parent.rewards'),
          tabBarIcon: ({ color, size }) => (
            <Gift size={size} color={color} strokeWidth={1.75} />
          ),
          tabBarAccessibilityLabel: t('parent.rewards'),
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: t('parent.approvals.title'),
          tabBarIcon: ({ color, size }) => (
            <ClipboardCheck size={size} color={color} strokeWidth={1.75} />
          ),
          tabBarAccessibilityLabel: t('parent.approvals.title'),
        }}
      />
    </Tabs>
  );
}
