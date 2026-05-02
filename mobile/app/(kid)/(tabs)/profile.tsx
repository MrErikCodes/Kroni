// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as Application from 'expo-application';
import { Check, ClipboardCopy, LogOut } from 'lucide-react-native';
import { useTheme, fonts } from '../../../lib/theme';
import { kidApi, isSubscriptionLapsedError } from '../../../lib/api';
import { clearKidToken, setKidLocale } from '../../../lib/auth';
import {
  t,
  setAppLocale,
  SUPPORTED_LOCALES,
  getAppLocale,
  i18n,
  type AppLocale,
} from '../../../lib/i18n';
import { formatMoney } from '../../../lib/format';
import { useCurrency } from '../../../lib/useCurrency';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import { KroniText } from '../../../components/ui/Text';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Modal as InAppModal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { getInstallInfo } from '../../../lib/installInfo';
import { AVATAR_KEYS, type AvatarKey, type BalanceEntry, type Kid } from '@kroni/shared';

// Mini bar chart — last 7 days earnings
function MiniBarChart({ entries }: { entries: BalanceEntry[] }) {
  const theme = useTheme();
  const tx = theme.text;

  // Build daily buckets for last 7 days
  const buckets: number[] = Array(7).fill(0);
  const now = new Date();
  entries.forEach((e) => {
    if (e.amountCents <= 0) return;
    const diff = Math.floor(
      (now.getTime() - new Date(e.createdAt).getTime()) / 86400000,
    );
    if (diff >= 0 && diff < 7) {
      buckets[6 - diff] += e.amountCents;
    }
  });

  const maxVal = Math.max(...buckets, 1);
  // Localized 7-day labels, Monday-first to match the chart bucket layout.
  // i18n-js returns the underlying array when the key resolves to one;
  // fall back to en short labels if the bundle is missing the entry.
  const localizedDayLabels: unknown = i18n.t('kid.dayLabelsShort');
  const DAY_LABELS: string[] = Array.isArray(localizedDayLabels)
    ? (localizedDayLabels as string[])
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  // Figure out which day of week today is (0=Sun) and map to labels
  const todayIdx = (now.getDay() + 6) % 7; // Mon=0
  const labels = Array(7)
    .fill(0)
    .map((_, i) => DAY_LABELS[(todayIdx - 6 + i + 7) % 7]);

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {buckets.map((val, i) => {
          const heightPct = val / maxVal;
          return (
            <View key={i} style={chartStyles.barCol}>
              <View style={chartStyles.barTrack}>
                <View
                  style={[
                    chartStyles.bar,
                    {
                      height: `${Math.round(heightPct * 100)}%`,
                      backgroundColor:
                        val > 0 ? theme.colors.gold[500] : theme.colors.sand[200],
                    },
                  ]}
                />
              </View>
              <Text style={[chartStyles.label, { color: tx.secondary }]}>{labels[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { width: '100%', paddingVertical: 8 },
  bars: { flexDirection: 'row', height: 64, gap: 4, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 3 },
  label: { fontSize: 10, fontWeight: '500' },
});

export default function KidProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;
  const currency = useCurrency();
  const tabBarHeight = useBottomTabBarHeight();

  const { data: me, isLoading, error: meError } = useQuery({
    queryKey: ['kid', 'me'],
    queryFn: () => kidApi.getMe(),
    // 402 means the household subscription lapsed — retrying just churns
    // because only the parent owner can fix billing. Render the banner
    // and let them ask their parent to renew.
    retry: (_count, err) => !isSubscriptionLapsedError(err),
  });
  const subscriptionLapsed = isSubscriptionLapsedError(meError);

  // Avatar picker — kid can change their own avatar from the kid app. The
  // parent's create flow uses the same grid layout in `(parent)/kids/new.tsx`;
  // we mirror it here (selection ring, gold[500] accent, emoji-on-disc) so the
  // visual language is consistent between the two pickers.
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const avatarMutation = useMutation({
    mutationFn: (avatarKey: AvatarKey) => kidApi.updateMyAvatar(avatarKey),
    onMutate: async (avatarKey) => {
      // Optimistic update so the new avatar appears immediately.
      await queryClient.cancelQueries({ queryKey: ['kid', 'me'] });
      const previous = queryClient.getQueryData<Kid>(['kid', 'me']);
      if (previous) {
        queryClient.setQueryData<Kid>(['kid', 'me'], { ...previous, avatarKey });
      }
      return { previous };
    },
    onError: async (_err, _key, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['kid', 'me'], ctx.previous);
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void queryClient.invalidateQueries({ queryKey: ['kid', 'me'] });
    },
  });
  const handleOpenAvatarPicker = useCallback(() => {
    void Haptics.selectionAsync();
    setAvatarPickerOpen(true);
  }, []);
  const handlePickAvatar = useCallback(
    (key: AvatarKey) => {
      void Haptics.selectionAsync();
      avatarMutation.mutate(key);
      setAvatarPickerOpen(false);
    },
    [avatarMutation],
  );

  const { data: history } = useQuery({
    queryKey: ['kid', 'history'],
    queryFn: () => kidApi.getHistory(),
  });

  const { data: balance } = useQuery({
    queryKey: ['kid', 'balance'],
    queryFn: () => kidApi.getBalance(),
  });

  const [signOutOpen, setSignOutOpen] = useState(false);
  const handleSignOut = useCallback(() => setSignOutOpen(true), []);

  // Locale picker — kid choice lives only on the device (no server schema).
  // The root layout's `subscribeLocale` bump remounts the Stack, so this
  // screen re-renders with the right `t(...)` strings after a tap; we just
  // need to read the current short locale to mark the active row.
  const activeShortLocale = getAppLocale();
  const handlePickLocale = useCallback(async (code: AppLocale) => {
    await setKidLocale(code);
    setAppLocale(code);
    await Haptics.selectionAsync();
  }, []);
  const confirmSignOut = useCallback(async () => {
    setSignOutOpen(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearKidToken();
    router.replace('/');
  }, [router]);

  // "Kopier app info" — same shape as the parent's, scoped to the kid
  // identity. Pasted into a support DM so we can join from kid_id /
  // install_id back to recent activity in `kid_installs` and the logs
  // tagged via the auth-kid plugin.
  const [diagOpen, setDiagOpen] = useState(false);
  const [diagText, setDiagText] = useState('');
  const handleCopyAppInfo = useCallback(async () => {
    const info = getInstallInfo();
    const lines = [
      t('kid.profileScreen.appInfo.roleLine.kid'),
      `Kroni ${info.appVersion ?? '?'}` +
        (info.appBuild != null ? ` (${info.appBuild})` : ''),
      `Bundle: ${Application.applicationId ?? 'unknown'}`,
      t('kid.profileScreen.appInfo.platformLine', { platform: info.platform, osVersion: info.osVersion }),
      `${t('kid.profileScreen.appInfo.installIdLabel')}: ${info.installId ?? 'unknown'}`,
      `${t('kid.profileScreen.appInfo.kidNameLabel')}: ${me?.name ?? 'unknown'}`,
      `${t('kid.profileScreen.appInfo.parentIdLabel')}: ${me?.parentId ?? 'unknown'}`,
      `${t('kid.profileScreen.appInfo.timestampLabel')}: ${new Date().toISOString()}`,
    ];
    const text = lines.join('\n');
    await Clipboard.setStringAsync(text);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDiagText(text);
    setDiagOpen(true);
  }, [me]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
        <View style={styles.center}>
          <Spinner size={36} />
        </View>
      </SafeAreaView>
    );
  }

  // Last 7 days total earned
  const last7DaysEarned =
    history
      ?.filter((e) => {
        const diff = (Date.now() - new Date(e.createdAt).getTime()) / 86400000;
        return diff < 7 && e.amountCents > 0;
      })
      .reduce((sum, e) => sum + e.amountCents, 0) ?? 0;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[
        styles.container,
        { backgroundColor: s.background, paddingBottom: tabBarHeight },
      ]}
    >
      <View style={styles.header}>
        <KroniText variant="eyebrow" tone="gold">
          {t('kid.profileScreen.eyebrow')}
        </KroniText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {subscriptionLapsed ? (
          <View
            style={[
              styles.subscriptionBanner,
              { backgroundColor: theme.colors.semantic.warning + '22' },
            ]}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
          >
            <Text
              style={[
                styles.subscriptionBannerText,
                { color: theme.colors.semantic.warning },
              ]}
            >
              {t('kid.errors.subscriptionLapsed')}
            </Text>
          </View>
        ) : null}
        {/* Editorial profile block — italic name as the visual signature.
            Avatar is tappable; opens the picker modal so the kid can change
            their figure from the kid app. */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={handleOpenAvatarPicker}
            accessibilityRole="button"
            accessibilityLabel={t('kid.profileScreen.avatar.editTitle')}
            activeOpacity={0.8}
          >
            <Avatar avatarKey={me?.avatarKey ?? 'bear'} size={88} />
          </TouchableOpacity>
          <KroniText
            variant="displayItalic"
            tone="primary"
            style={[styles.name, { fontFamily: fonts.displayItalic }]}
          >
            {me?.name ?? '…'}
          </KroniText>
          <Text
            style={[
              styles.balance,
              { color: theme.colors.gold[700], fontFamily: fonts.uiBold },
            ]}
          >
            {formatMoney(balance?.balanceCents ?? 0, currency)}
          </Text>
        </View>

        {/* Weekly earnings bar chart */}
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: tx.secondary }]}>
            {t('kid.profileScreen.weeklyEarnings')}
          </Text>
          <Text style={[styles.chartTotal, { color: theme.colors.gold[500] }]}>
            +{formatMoney(last7DaysEarned, currency)}
          </Text>
          {history && history.length > 0 ? (
            <MiniBarChart entries={history} />
          ) : (
            <Text style={[styles.noEarnings, { color: tx.secondary }]}>
              {t('kid.profileScreen.noEarnings')}
            </Text>
          )}
        </Card>

        {/* Language picker — mirrors the parent settings row layout, but
            persists to SecureStore (`kid.locale.v1`) since kids have no
            server-side `locale` column. The root layout reads this on boot. */}
        <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
          {t('kid.profileLanguage.title')}
        </Text>
        <Card style={styles.langSection}>
          {SUPPORTED_LOCALES.map((opt, idx) => {
            const shortCode = opt.code.slice(0, 2);
            const active = activeShortLocale === shortCode;
            return (
              <View key={opt.code}>
                <TouchableOpacity
                  onPress={() => {
                    if (!active) void handlePickLocale(opt.code);
                  }}
                  style={styles.langRow}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={opt.label}
                >
                  <Text style={[styles.langLabel, { color: tx.primary }]}>
                    {opt.label}
                  </Text>
                  {active ? (
                    <Check size={18} color={theme.colors.gold[500]} strokeWidth={2.5} />
                  ) : null}
                </TouchableOpacity>
                {idx < SUPPORTED_LOCALES.length - 1 ? (
                  <View style={[styles.langDivider, { backgroundColor: theme.surface.border }]} />
                ) : null}
              </View>
            );
          })}
        </Card>
        <Text style={[styles.langHelp, { color: tx.secondary }]}>
          {t('kid.profileLanguage.subtitle')}
        </Text>

        {/* Kopier app info — same shape as parent settings */}
        <TouchableOpacity
          onPress={handleCopyAppInfo}
          style={[styles.diagBtn, { borderColor: theme.surface.border }]}
          accessibilityRole="button"
          accessibilityLabel={t('kid.profileScreen.appInfo.copyButton')}
        >
          <ClipboardCopy size={18} color={tx.secondary} strokeWidth={2} />
          <Text style={[styles.diagBtnLabel, { color: tx.secondary }]}>
            {t('kid.profileScreen.appInfo.copyButton')}
          </Text>
        </TouchableOpacity>

        {/* Sign out */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.signOutBtn, { borderColor: theme.colors.semantic.danger + '44' }]}
          accessibilityRole="button"
          accessibilityLabel={t('kid.profileScreen.signOut')}
        >
          <LogOut size={18} color={theme.colors.semantic.danger} strokeWidth={2} />
          <Text style={[styles.signOutLabel, { color: theme.colors.semantic.danger }]}>
            {t('kid.profileScreen.signOut')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Avatar picker — same emoji-on-disc grid the parent uses, with the
          gold[500] selection ring. Tapping a tile saves and closes. */}
      <InAppModal visible={avatarPickerOpen} onClose={() => setAvatarPickerOpen(false)}>
        <Text style={[styles.pickerTitle, { color: tx.primary }]}>
          {t('kid.profileScreen.avatar.pickerTitle')}
        </Text>
        <View style={styles.avatarGrid}>
          {AVATAR_KEYS.map((key) => {
            const selected = (me?.avatarKey ?? null) === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handlePickAvatar(key)}
                style={[
                  styles.avatarTile,
                  {
                    backgroundColor: selected ? theme.colors.gold[100] : s.card,
                    borderColor: selected ? theme.colors.gold[500] : s.border,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityLabel={key}
                accessibilityState={{ selected }}
              >
                <Avatar avatarKey={key} size={56} />
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.pickerActions}>
          <Button
            label={t('common.cancel')}
            variant="ghost"
            size="sm"
            onPress={() => setAvatarPickerOpen(false)}
          />
        </View>
      </InAppModal>

      <InAppModal visible={diagOpen} onClose={() => setDiagOpen(false)}>
        <Text style={[styles.diagModalTitle, { color: tx.primary }]}>
          {t('kid.profileScreen.appInfo.copiedTitle')}
        </Text>
        <ScrollView style={styles.diagScroll}>
          <Text style={[styles.diagBody, { color: tx.secondary }]}>
            {diagText}
          </Text>
        </ScrollView>
        <View style={styles.diagActions}>
          <Button
            label={t('kid.profileScreen.appInfo.copyAgain')}
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

      <ConfirmDialog
        visible={signOutOpen}
        title={t('kid.profileScreen.signOut')}
        message={t('kid.profileScreen.signOutConfirm')}
        confirmLabel={t('kid.profileScreen.signOut')}
        destructive
        onConfirm={confirmSignOut}
        onCancel={() => setSignOutOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, gap: 20 },
  profileSection: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  name: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  balance: { fontSize: 20, letterSpacing: -0.3 },
  chartCard: { padding: 16, gap: 4 },
  chartTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  chartTotal: { fontSize: 22, fontWeight: '700' },
  noEarnings: { fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 56,
  },
  signOutLabel: { fontSize: 16, fontWeight: '600' },
  diagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 44,
  },
  diagBtnLabel: { fontSize: 14, fontWeight: '600' },
  diagModalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  diagScroll: { maxHeight: 240, marginBottom: 16 },
  diagBody: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.uiBold,
  },
  diagActions: { flexDirection: 'row', gap: 12 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  pickerTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  avatarTile: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  langSection: { overflow: 'hidden' },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 44,
    gap: 10,
  },
  langLabel: { fontSize: 15, fontWeight: '500' },
  langDivider: { height: 1, marginHorizontal: 16 },
  langHelp: { fontSize: 12, paddingHorizontal: 8, marginTop: 6, lineHeight: 16 },
  subscriptionBanner: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  subscriptionBannerText: { fontSize: 13, fontWeight: '500' },
});
