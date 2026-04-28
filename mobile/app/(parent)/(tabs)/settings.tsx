// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, LogOut, ChevronRight, Crown, Shield, FileText, HelpCircle, Info, ClipboardCopy } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';

const WEB_LINKS = {
  privacy: 'https://kroni.no/personvern',
  terms: 'https://kroni.no/vilkar',
  support: 'https://kroni.no/support',
} as const;

function openLink(key: keyof typeof WEB_LINKS): void {
  void WebBrowser.openBrowserAsync(WEB_LINKS[key], {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: '#F5B015',
  });
}
import { useTheme, fonts } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t, setAppLocale, SUPPORTED_LOCALES, type AppLocale } from '../../../lib/i18n';
import { Card } from '../../../components/ui/Card';
import { KroniText } from '../../../components/ui/Text';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { HouseholdSection } from '../../../components/household/HouseholdSection';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { Modal as InAppModal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { getInstallInfo } from '../../../lib/installInfo';

// Read straight from the binary (Info.plist / AndroidManifest) so the row
// always matches the installed build, including OTA updates that don't
// change the manifest. `Constants.expoConfig?.version` is the fallback for
// dev (Expo Go / web), where the native binary value is unavailable.
const nativeVersion = Application.nativeApplicationVersion;
const nativeBuild = Application.nativeBuildVersion;
const version: string =
  nativeVersion != null
    ? nativeBuild != null
      ? `${nativeVersion} (${nativeBuild})`
      : nativeVersion
    : (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

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
  const qc = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

  const { data: billing } = useQuery({
    queryKey: ['parent', 'billing'],
    queryFn: () => api.getBillingStatus(),
    retry: false,
  });

  const { data: me } = useQuery({
    queryKey: ['parent', 'me'],
    queryFn: () => api.getMe(),
    retry: false,
  });

  // Subscription is owner-only — co-parents inherit the plan and shouldn't
  // be shown billing controls. We reuse the cached household query the
  // HouseholdSection already mounts (same key), so this is a cheap lookup.
  const { data: household } = useQuery({
    queryKey: ['parent', 'household'],
    queryFn: () => api.getHousehold(),
    retry: false,
  });
  const isOwner =
    household != null &&
    me != null &&
    household.household.premiumOwnerParentId === me.id;

  useEffect(() => {
    if (me?.locale) setAppLocale(me.locale);
  }, [me?.locale]);

  const localeMut = useMutation({
    mutationFn: (locale: AppLocale) => api.updateMe({ locale }),
    onSuccess: async (updated) => {
      setAppLocale(updated.locale);
      await Haptics.selectionAsync();
      await qc.invalidateQueries({ queryKey: ['parent', 'me'] });
    },
  });

  const tierLabel: Record<string, string> = {
    free: t('parent.settings.subscriptionTier.free'),
    family: t('parent.settings.subscriptionTier.family'),
    premium: t('parent.settings.subscriptionTier.premium'),
  };

  const [signOutVisible, setSignOutVisible] = useState(false);
  const handleSignOut = useCallback(() => setSignOutVisible(true), []);
  const confirmSignOut = useCallback(async () => {
    setSignOutVisible(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
    router.replace('/');
  }, [signOut, router]);

  // "Kopier app info" — bundles the data support needs to triage a bug
  // report from a single user message. We deliberately keep this local
  // (no telemetry endpoint) so the user controls what gets shared and
  // pastes it themselves.
  const [diagOpen, setDiagOpen] = useState(false);
  const [diagText, setDiagText] = useState('');
  const handleCopyAppInfo = useCallback(async () => {
    const info = getInstallInfo();
    const lines = [
      t('parent.settings.appInfo.roleLine.parent'),
      `Kroni ${info.appVersion ?? '?'}` +
        (info.appBuild != null ? ` (${info.appBuild})` : ''),
      `Bundle: ${Application.applicationId ?? 'unknown'}`,
      t('parent.settings.appInfo.platformLine', { platform: info.platform, osVersion: info.osVersion }),
      `Installasjons-ID: ${info.installId ?? 'unknown'}`,
      `Forelder-ID: ${me?.id ?? 'unknown'}`,
      `E-post: ${me?.email ?? user?.primaryEmailAddress?.emailAddress ?? 'unknown'}`,
      `Husholdning-ID: ${household?.household.id ?? 'unknown'}`,
      `Eier: ${isOwner ? 'ja' : 'nei'}`,
      `Abonnement: ${billing?.tier ?? 'unknown'}`,
      `Språk: ${me?.locale ?? 'unknown'}`,
      `Tidspunkt: ${new Date().toISOString()}`,
    ];
    const text = lines.join('\n');
    await Clipboard.setStringAsync(text);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDiagText(text);
    setDiagOpen(true);
  }, [me, household, isOwner, billing, user]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={styles.header}>
        <KroniText variant="eyebrow" tone="gold">
          {t('parent.settings.eyebrow')}
        </KroniText>
        <View style={styles.headlineRow}>
          <KroniText variant="display" tone="primary" style={styles.headline}>
            {t('parent.settings.headlineSettings')}
          </KroniText>
          <KroniText variant="display" tone="primary" style={styles.headline}>
            .
          </KroniText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Household — members + invite a co-parent */}
        <HouseholdSection api={api} currentParentId={me?.id ?? null} />

        {/* Account */}
        <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
          {t('parent.settings.account')}
        </Text>
        <Card style={styles.section}>
          <SettingsRow
            icon={<Text style={styles.rowEmoji}>👤</Text>}
            label={t('parent.settings.displayName')}
            value={user?.fullName ?? user?.firstName ?? '—'}
            onPress={() => router.push('/(parent)/account')}
          />
          <View style={[styles.divider, { backgroundColor: s.border }]} />
          <SettingsRow
            icon={<Text style={styles.rowEmoji}>✉️</Text>}
            label={t('parent.settings.email')}
            value={user?.primaryEmailAddress?.emailAddress ?? '—'}
            onPress={() => router.push('/(parent)/account')}
          />
          <View style={[styles.divider, { backgroundColor: s.border }]} />
          <SettingsRow
            icon={<Text style={styles.rowEmoji}>🔒</Text>}
            label={t('parent.settings.password')}
            value={t('parent.settings.passwordValue')}
            onPress={() => router.push('/(parent)/account')}
          />
        </Card>

        {/* Language */}
        <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
          {t('parent.settings.language')}
        </Text>
        <Card style={styles.section}>
          {SUPPORTED_LOCALES.map((opt, idx) => {
            const active = (me?.locale ?? 'nb-NO') === opt.code;
            return (
              <View key={opt.code}>
                <TouchableOpacity
                  onPress={() => {
                    if (!active) localeMut.mutate(opt.code);
                  }}
                  style={styles.row}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={opt.label}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.rowEmoji}>
                      {opt.code === 'nb-NO' ? '🇳🇴' : '🇬🇧'}
                    </Text>
                    <Text style={[styles.rowLabel, { color: tx.primary }]}>
                      {opt.label}
                    </Text>
                  </View>
                  {active ? (
                    <Check size={18} color={theme.colors.gold[500]} strokeWidth={2.5} />
                  ) : null}
                </TouchableOpacity>
                {idx < SUPPORTED_LOCALES.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: s.border }]} />
                ) : null}
              </View>
            );
          })}
        </Card>
        <Text style={[styles.helpText, { color: tx.secondary }]}>
          {t('parent.settings.languageHelp')}
        </Text>

        {/* Subscription — only the household owner manages billing. */}
        {isOwner ? (
          <>
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
          </>
        ) : null}

        {/* Legal */}
        <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
          {t('parent.settings.other')}
        </Text>
        <Card style={styles.section}>
          <SettingsRow
            icon={<Shield size={18} color={tx.secondary} strokeWidth={2} />}
            label={t('parent.settings.privacy')}
            onPress={() => openLink('privacy')}
          />
          <View style={[styles.divider, { backgroundColor: s.border }]} />
          <SettingsRow
            icon={<FileText size={18} color={tx.secondary} strokeWidth={2} />}
            label={t('parent.settings.terms')}
            onPress={() => openLink('terms')}
          />
          <View style={[styles.divider, { backgroundColor: s.border }]} />
          <SettingsRow
            icon={<HelpCircle size={18} color={tx.secondary} strokeWidth={2} />}
            label={t('parent.settings.support')}
            onPress={() => openLink('support')}
          />
          <View style={[styles.divider, { backgroundColor: s.border }]} />
          <SettingsRow
            icon={<Info size={18} color={tx.secondary} strokeWidth={2} />}
            label={t('parent.settings.version', { version })}
          />
          <View style={[styles.divider, { backgroundColor: s.border }]} />
          <SettingsRow
            icon={<ClipboardCopy size={18} color={tx.secondary} strokeWidth={2} />}
            label={t('parent.settings.appInfo.copyButton')}
            onPress={handleCopyAppInfo}
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

      <ConfirmDialog
        visible={signOutVisible}
        title={t('parent.settings.signOut')}
        message={t('parent.settings.signOutConfirm')}
        confirmLabel={t('parent.settings.signOut')}
        destructive
        onConfirm={confirmSignOut}
        onCancel={() => setSignOutVisible(false)}
      />

      {/* App-info copy confirmation. Shows the exact blob that landed on
          the clipboard so the user can verify what they're about to paste
          into a support DM. */}
      <InAppModal visible={diagOpen} onClose={() => setDiagOpen(false)}>
        <Text style={[styles.diagTitle, { color: tx.primary }]}>
          {t('parent.settings.appInfo.copiedTitle')}
        </Text>
        <ScrollView style={styles.diagScroll}>
          <Text style={[styles.diagBody, { color: tx.secondary }]}>
            {diagText}
          </Text>
        </ScrollView>
        <View style={styles.diagActions}>
          <Button
            label={t('parent.settings.appInfo.copyAgain')}
            variant="secondary"
            size="sm"
            onPress={() => {
              void Clipboard.setStringAsync(diagText);
            }}
          />
          <Button
            label={t('common.close')}
            size="sm"
            onPress={() => setDiagOpen(false)}
          />
        </View>
      </InAppModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  diagTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  diagScroll: { maxHeight: 240, marginBottom: 16 },
  diagBody: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  diagActions: { flexDirection: 'row', gap: 12 },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 8,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.7,
  },
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
  helpText: {
    fontSize: 12,
    paddingHorizontal: 8,
    marginTop: 6,
    lineHeight: 16,
  },
});
