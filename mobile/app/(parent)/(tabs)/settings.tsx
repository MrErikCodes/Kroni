// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { LogOut, ChevronRight, Crown, Shield, FileText, HelpCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import Constants from 'expo-constants';

const version: string =
  (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const theme = useTheme();
  const tx = theme.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.row}
    >
      <View style={styles.rowLeft}>
        {icon}
        <Text
          style={[
            styles.rowLabel,
            { color: danger ? theme.colors.semantic.danger : tx.primary },
          ]}
        >
          {label}
        </Text>
      </View>
      {value ? (
        <Text style={[styles.rowValue, { color: tx.secondary }]}>{value}</Text>
      ) : null}
      {onPress ? (
        <ChevronRight size={16} color={tx.secondary} strokeWidth={2} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function SettingsTab() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const api = useParentApi();
  const s = theme.surface;
  const tx = theme.text;

  const { data: billing } = useQuery({
    queryKey: ['parent', 'billing'],
    queryFn: () => api.getBillingStatus(),
    retry: false,
  });

  const tierLabel: Record<string, string> = {
    free: t('parent.settings.subscriptionTier.free'),
    family: t('parent.settings.subscriptionTier.family'),
    premium: t('parent.settings.subscriptionTier.premium'),
  };

  const handleSignOut = useCallback(() => {
    Alert.alert(
      t('parent.settings.signOut'),
      t('parent.settings.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('parent.settings.signOut'),
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await signOut();
            router.replace('/');
          },
        },
      ],
    );
  }, [signOut, router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={[styles.header, { borderBottomColor: s.border }]}>
        <Text style={[styles.title, { color: tx.primary }]}>
          {t('parent.settings.title')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Account */}
        <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
          {t('parent.settings.account')}
        </Text>
        <Card style={styles.section}>
          <SettingsRow
            icon={<Text style={styles.rowEmoji}>👤</Text>}
            label={t('parent.settings.displayName')}
            value={user?.fullName ?? user?.firstName ?? '—'}
          />
          <View style={[styles.divider, { backgroundColor: s.border }]} />
          <SettingsRow
            icon={<Text style={styles.rowEmoji}>✉️</Text>}
            label={t('parent.settings.email')}
            value={user?.primaryEmailAddress?.emailAddress ?? '—'}
          />
        </Card>

        {/* Subscription */}
        <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
          {t('parent.settings.subscription')}
        </Text>
        <Card style={styles.section}>
          <SettingsRow
            icon={<Crown size={18} color={theme.colors.gold[500]} strokeWidth={2} />}
            label={t('parent.settings.subscription')}
            value={tierLabel[billing?.tier ?? 'free'] ?? 'Gratis'}
          />
          {billing?.tier === 'free' && (
            <>
              <View style={[styles.divider, { backgroundColor: s.border }]} />
              <SettingsRow
                icon={<Text style={styles.rowEmoji}>⭐</Text>}
                label={t('parent.settings.upgradePro')}
                onPress={() => router.push('/(parent)/paywall')}
              />
            </>
          )}
        </Card>

        {/* Legal */}
        <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
          {/* [REVIEW] */}
          Annet
        </Text>
        <Card style={styles.section}>
          <SettingsRow
            icon={<Shield size={18} color={tx.secondary} strokeWidth={2} />}
            label={t('parent.settings.privacy')}
            onPress={() => { /* [REVIEW] link to kroni.no/personvern */ }}
          />
          <View style={[styles.divider, { backgroundColor: s.border }]} />
          <SettingsRow
            icon={<FileText size={18} color={tx.secondary} strokeWidth={2} />}
            label={t('parent.settings.terms')}
            onPress={() => { /* [REVIEW] link to kroni.no/vilkar */ }}
          />
          <View style={[styles.divider, { backgroundColor: s.border }]} />
          <SettingsRow
            icon={<HelpCircle size={18} color={tx.secondary} strokeWidth={2} />}
            label={t('parent.settings.support')}
            onPress={() => { /* [REVIEW] link to kroni.no/support */ }}
          />
          <View style={[styles.divider, { backgroundColor: s.border }]} />
          <SettingsRow
            icon={<Text style={styles.rowEmoji}>ℹ️</Text>}
            label={t('parent.settings.version', { version })}
          />
        </Card>

        {/* Sign out */}
        <Card style={styles.section}>
          <SettingsRow
            icon={<LogOut size={18} color={theme.colors.semantic.danger} strokeWidth={2} />}
            label={t('parent.settings.signOut')}
            onPress={handleSignOut}
            danger
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  content: { padding: 20, gap: 8 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  section: { overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 44,
    gap: 10,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  rowEmoji: { fontSize: 18, width: 24, textAlign: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 14 },
  divider: { height: 1, marginHorizontal: 16 },
});
