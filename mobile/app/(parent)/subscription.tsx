// Subscription detail screen — accessible from Settings → Abonnement.
// Shows the current plan (free / family / lifetime), renewal/expiry,
// trial status, and exposes "Manage in App Store" + "Restore" actions.
// Buying happens via the existing /paywall route.
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Crown, Sparkles } from 'lucide-react-native';
import { useTheme, fonts } from '../../lib/theme';
import { useParentApi } from '../../lib/useParentApi';
import { t } from '../../lib/i18n';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { KroniText } from '../../components/ui/Text';
import { Modal } from '../../components/ui/Modal';
import { restorePurchases } from '../../lib/billing';

const APP_STORE_MANAGE_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions';

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export default function SubscriptionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const api = useParentApi();
  const qc = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

  const { data: billing, isLoading } = useQuery({
    queryKey: ['parent', 'billing'],
    queryFn: () => api.getBillingStatus(),
    retry: false,
    refetchOnMount: 'always',
  });

  const { data: me } = useQuery({
    queryKey: ['parent', 'me'],
    queryFn: () => api.getMe(),
    retry: false,
  });
  const locale = me?.locale ?? 'nb-NO';

  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handleRestore = useCallback(async () => {
    setRestoring(true);
    setRestoreMsg(null);
    try {
      const restored = await restorePurchases();
      // RevenueCat re-fires webhooks for any restored entitlement, so the
      // backend status will be fresh on the next refetch.
      await qc.invalidateQueries({ queryKey: ['parent', 'billing'] });
      if (restored) {
        setRestoreMsg(t('subscriptionDetail.restoreSuccess'));
      } else {
        setRestoreMsg(t('subscriptionDetail.restoreEmpty'));
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setRestoreMsg(t('subscriptionDetail.restoreError'));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setRestoring(false);
      setRestoreOpen(true);
    }
  }, [qc]);

  const handleManage = useCallback(() => {
    void Linking.openURL(APP_STORE_MANAGE_URL);
  }, []);

  const handleUpgrade = useCallback(() => {
    router.push('/(parent)/paywall');
  }, [router]);

  const isLifetime = billing?.lifetimePaid === true;
  const isFamily = billing?.tier === 'family' && !isLifetime;
  const isFree = !isLifetime && !isFamily;

  // RevenueCat doesn't surface period_type directly to the client, but the
  // expiration window (~7 days) plus first-time purchase is the trial
  // signal. If we ever need exact precision we can plumb period_type
  // through the webhook into a household column.
  let trialBanner: string | null = null;
  if (isFamily && billing?.expiresAt) {
    const expires = new Date(billing.expiresAt).getTime();
    const daysLeft = Math.ceil((expires - Date.now()) / 86_400_000);
    if (daysLeft <= 7 && daysLeft >= 0) {
      trialBanner = t('subscriptionDetail.trialActiveBody', {
        date: formatDate(billing.expiresAt, locale),
      });
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={[styles.header, { borderBottomColor: s.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={styles.headerBtn}
        >
          <ArrowLeft size={24} color={tx.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tx.primary }]}>
          {t('subscriptionDetail.title')}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.center}>
            <Spinner size={36} />
          </View>
        ) : (
          <>
            {/* Plan card */}
            <Card style={styles.planCard}>
              <KroniText variant="eyebrow" tone="gold">
                {t('subscriptionDetail.eyebrow')}
              </KroniText>
              <View style={styles.planRow}>
                {isLifetime ? (
                  <Sparkles size={28} color={theme.colors.gold[500]} strokeWidth={2} />
                ) : isFamily ? (
                  <Crown size={28} color={theme.colors.gold[500]} strokeWidth={2} />
                ) : null}
                <KroniText
                  variant="display"
                  tone="primary"
                  style={[styles.planTitle, { fontFamily: fonts.display }]}
                >
                  {isLifetime
                    ? t('subscriptionDetail.tierLifetime')
                    : isFamily
                      ? t('subscriptionDetail.tierFamily')
                      : t('subscriptionDetail.tierFree')}
                </KroniText>
              </View>

              {isLifetime ? (
                <KroniText variant="body" tone="secondary" style={styles.blurb}>
                  {t('subscriptionDetail.lifetimeBlurb')}
                </KroniText>
              ) : isFamily && billing?.expiresAt ? (
                <KroniText variant="body" tone="secondary" style={styles.blurb}>
                  {t('subscriptionDetail.renewsOn', {
                    date: formatDate(billing.expiresAt, locale),
                  })}
                </KroniText>
              ) : (
                <KroniText variant="body" tone="secondary" style={styles.blurb}>
                  {t('subscriptionDetail.freeBlurb')}
                </KroniText>
              )}

              {trialBanner ? (
                <View
                  style={[
                    styles.trialBox,
                    { backgroundColor: theme.colors.gold[50] },
                  ]}
                >
                  <KroniText
                    variant="caption"
                    tone="gold"
                    style={styles.trialEyebrow}
                  >
                    {t('subscriptionDetail.trialActive')}
                  </KroniText>
                  <Text style={[styles.trialBody, { color: tx.primary }]}>
                    {trialBanner}
                  </Text>
                </View>
              ) : null}
            </Card>

            {/* Actions */}
            <View style={styles.actions}>
              {isFree ? (
                <Button
                  label={t('subscriptionDetail.upgradeButton')}
                  onPress={handleUpgrade}
                  size="lg"
                />
              ) : null}

              {/* Manage is shown for any active subscription; lifetime
                  buyers don't need to manage anything but Apple still
                  exposes the receipt history there. */}
              {!isFree ? (
                <>
                  <Button
                    label={t('subscriptionDetail.manageButton')}
                    onPress={handleManage}
                    variant="secondary"
                    size="lg"
                  />
                  <Text style={[styles.hint, { color: tx.secondary }]}>
                    {t('subscriptionDetail.manageHint')}
                  </Text>
                </>
              ) : null}

              <Button
                label={
                  restoring
                    ? t('subscriptionDetail.restoring')
                    : t('subscriptionDetail.restoreButton')
                }
                onPress={handleRestore}
                variant="ghost"
                loading={restoring}
                size="sm"
              />
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={restoreOpen} onClose={() => setRestoreOpen(false)}>
        <Text style={[styles.modalTitle, { color: tx.primary }]}>
          {restoreMsg ?? ''}
        </Text>
        <Button
          label={t('common.ok')}
          onPress={() => setRestoreOpen(false)}
          size="lg"
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' },
  content: { padding: 24, gap: 24 },
  center: { paddingVertical: 48, alignItems: 'center' },
  planCard: { padding: 20, gap: 12 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planTitle: {
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  blurb: { fontSize: 15, lineHeight: 22 },
  trialBox: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
    marginTop: 4,
  },
  trialEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  trialBody: { fontSize: 14, lineHeight: 20 },
  actions: { gap: 12 },
  hint: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
});
