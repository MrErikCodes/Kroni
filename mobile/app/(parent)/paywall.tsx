// [REVIEW] Norwegian copy — verify with native speaker
import { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Check, Crown } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { presentPaywall, restorePurchases } from '../../lib/billing';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useState } from 'react';

const FEATURES_FREE = [
  t('paywall.free.kids'),
  t('paywall.free.tasks'),
];

const FEATURES_PRO = [
  t('paywall.features.kids'),
  t('paywall.features.tasks'),
  t('paywall.features.rewards'),
  t('paywall.features.notifications'),
  t('paywall.features.history'),
];

export default function PaywallScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

  const [presenting, setPresenting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Present the RevenueCat paywall immediately on mount
  useEffect(() => {
    void handlePresent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePresent = useCallback(async () => {
    setPresenting(true);
    try {
      const purchased = await presentPaywall();
      if (purchased) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        void queryClient.invalidateQueries({ queryKey: ['billing'] });
        router.back();
      }
    } finally {
      setPresenting(false);
    }
  }, [queryClient, router]);

  const handleRestore = useCallback(async () => {
    setRestoring(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        void queryClient.invalidateQueries({ queryKey: ['billing'] });
        router.back();
      }
    } finally {
      setRestoring(false);
    }
  }, [queryClient, router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={[styles.header, { borderBottomColor: s.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ArrowLeft size={24} color={tx.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tx.primary }]}>
          {t('paywall.title')}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Crown icon + title */}
        <View style={styles.hero}>
          <View style={[styles.crownWrap, { backgroundColor: theme.colors.gold[50] }]}>
            <Crown size={40} color={theme.colors.gold[500]} strokeWidth={2} />
          </View>
          <Text style={[styles.heroTitle, { color: tx.primary }]}>
            {t('paywall.title')}
          </Text>
          <Text style={[styles.heroSub, { color: tx.secondary }]}>
            {t('paywall.subtitle')}
          </Text>
        </View>

        {/* Feature comparison */}
        <View style={[styles.compCard, { backgroundColor: s.card, borderColor: s.border }]}>
          {/* Free column header */}
          <View style={styles.compHeader}>
            <View style={styles.compCol}>
              <Text style={[styles.compTier, { color: tx.secondary }]}>Gratis</Text>
            </View>
            <View style={[styles.compCol, styles.compProCol, { backgroundColor: theme.colors.gold[500] }]}>
              <Text style={styles.compTierPro}>Pro</Text>
            </View>
          </View>

          {/* Free features */}
          {FEATURES_FREE.map((f) => (
            <View key={f} style={styles.compRow}>
              <View style={styles.compCol}>
                <Text style={[styles.compFeature, { color: tx.secondary }]}>{f}</Text>
              </View>
              <View style={[styles.compCol, { backgroundColor: theme.colors.gold[50] }]}>
                <Text style={[styles.compFeature, { color: theme.colors.gold[700] }]}>{f}</Text>
              </View>
            </View>
          ))}

          {/* Pro-only features */}
          {FEATURES_PRO.slice(2).map((f) => (
            <View key={f} style={styles.compRow}>
              <View style={styles.compCol}>
                <Text style={[styles.compFeature, { color: tx.secondary }]}>—</Text>
              </View>
              <View style={[styles.compCol, { backgroundColor: theme.colors.gold[50] }]}>
                <View style={styles.checkRow}>
                  <Check size={14} color={theme.colors.gold[700]} strokeWidth={2.5} />
                  <Text style={[styles.compFeature, { color: theme.colors.gold[700] }]}>{f}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <Button
          label={presenting ? t('common.loading') : t('paywall.subscribe')}
          onPress={handlePresent}
          loading={presenting}
          size="lg"
        />

        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoring}
          accessibilityRole="button"
          accessibilityLabel={t('paywall.restore')}
          style={styles.restoreBtn}
        >
          {restoring ? (
            <Spinner size={18} />
          ) : (
            <Text style={[styles.restoreLabel, { color: tx.secondary }]}>
              {t('paywall.restore')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Legal */}
        <Text style={[styles.legal, { color: tx.secondary }]}>
          {t('paywall.legalNote')}
        </Text>

        <View style={styles.legalLinks}>
          <TouchableOpacity
            onPress={() => void Linking.openURL('https://kroni.no/vilkar')}
            accessibilityRole="link"
            accessibilityLabel={t('paywall.terms')}
          >
            <Text style={[styles.legalLink, { color: theme.colors.gold[500] }]}>
              {t('paywall.terms')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.legalSep, { color: tx.secondary }]}> · </Text>
          <TouchableOpacity
            onPress={() => void Linking.openURL('https://kroni.no/personvern')}
            accessibilityRole="link"
            accessibilityLabel={t('paywall.privacy')}
          >
            <Text style={[styles.legalLink, { color: theme.colors.gold[500] }]}>
              {t('paywall.privacy')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: { padding: 24, gap: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', gap: 12 },
  crownWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  heroSub: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  compCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  compHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  compRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  compCol: { flex: 1, padding: 12, justifyContent: 'center' },
  compProCol: { borderLeftWidth: 0 },
  compTier: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  compTierPro: { fontSize: 13, fontWeight: '700', textAlign: 'center', color: '#FFFFFF' },
  compFeature: { fontSize: 13, textAlign: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  restoreBtn: { alignItems: 'center', paddingVertical: 8, minHeight: 44, justifyContent: 'center' },
  restoreLabel: { fontSize: 14 },
  legal: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  legalLink: { fontSize: 12 },
  legalSep: { fontSize: 12 },
});
