// [REVIEW] Norwegian copy — verify with native speaker
import { useEffect, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useTheme, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { presentPaywall, restorePurchases } from '../../lib/billing';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Card } from '../../components/ui/Card';
import { KroniText } from '../../components/ui/Text';

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

  const [presenting, setPresenting] = useState(false);
  const [restoring, setRestoring] = useState(false);

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

  // Present the RevenueCat paywall sheet on mount; the editorial wrapper
  // below is what shows when the sheet dismisses without a purchase.
  useEffect(() => {
    void handlePresent();
  }, [handlePresent]);

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
          <ArrowLeft size={22} color={theme.text.primary} strokeWidth={1.75} />
        </TouchableOpacity>
        <KroniText variant="caption" tone="tertiary">
          {t('paywall.headerCaption')}
        </KroniText>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Editorial hero — serif headline with italic emphasis on "vokser". */}
        <View style={styles.hero}>
          <KroniText variant="eyebrow" tone="gold">
            {t('paywall.headerEyebrow')}
          </KroniText>
          <View style={styles.headlineRow}>
            <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
              {t('paywall.headlineA')}{' '}
            </KroniText>
            <KroniText
              variant="displayItalic"
              tone="gold"
              style={[styles.headline, { fontFamily: fonts.displayItalic }]}
            >
              {t('paywall.headlineB')}
            </KroniText>
            <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
              .
            </KroniText>
          </View>
          <KroniText variant="bodyLarge" tone="secondary" style={styles.intro}>
            {t('paywall.intro')}
          </KroniText>
        </View>

        {/* Highlighted card — the single allowed elevated surface on this screen. */}
        <Card tone="elevated" radius="2xl" style={styles.featureCard}>
          <KroniText variant="eyebrow" tone="tertiary">
            {t('paywall.featuresEyebrow')}
          </KroniText>
          <View style={styles.featureList}>
            {FEATURES_PRO.map((f) => (
              <View key={f} style={styles.featureRow}>
                <View
                  style={[
                    styles.checkDot,
                    { backgroundColor: theme.colors.gold[500] },
                  ]}
                >
                  <Check size={11} color={theme.colors.sand[900]} strokeWidth={2.5} />
                </View>
                <KroniText variant="body" tone="primary" style={styles.featureText}>
                  {f}
                </KroniText>
              </View>
            ))}
          </View>
        </Card>

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
            <KroniText variant="small" tone="secondary" style={styles.restoreLabel}>
              {t('paywall.restore')}
            </KroniText>
          )}
        </TouchableOpacity>

        {/* Trust strip footer — middot separators, sand-500 caption. */}
        <View style={styles.trustRow}>
          <KroniText variant="caption" tone="secondary">
            {t('paywall.trustCancel')}
          </KroniText>
          <View
            style={[
              styles.dot,
              { backgroundColor: theme.isDark ? '#2A3040' : theme.colors.sand[300] },
            ]}
          />
          <KroniText variant="caption" tone="secondary">
            {t('paywall.trustNoAds')}
          </KroniText>
          <View
            style={[
              styles.dot,
              { backgroundColor: theme.isDark ? '#2A3040' : theme.colors.sand[300] },
            ]}
          />
          <KroniText variant="caption" tone="secondary">
            {t('paywall.trustNoCash')}
          </KroniText>
        </View>

        <KroniText variant="caption" tone="secondary" style={styles.legal}>
          {t('paywall.legalNote')}
        </KroniText>

        <View style={styles.legalLinks}>
          <TouchableOpacity
            onPress={() => void Linking.openURL('https://kroni.no/vilkar')}
            accessibilityRole="link"
            accessibilityLabel={t('paywall.terms')}
          >
            <KroniText variant="caption" tone="gold">
              {t('paywall.terms')}
            </KroniText>
          </TouchableOpacity>
          <KroniText variant="caption" tone="secondary">
            {' · '}
          </KroniText>
          <TouchableOpacity
            onPress={() => void Linking.openURL('https://kroni.no/personvern')}
            accessibilityRole="link"
            accessibilityLabel={t('paywall.privacy')}
          >
            <KroniText variant="caption" tone="gold">
              {t('paywall.privacy')}
            </KroniText>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, gap: 24, paddingBottom: 40 },
  hero: { gap: 12 },
  headlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  headline: {
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.0,
  },
  intro: {
    fontSize: 17,
    lineHeight: 26,
  },
  featureCard: {
    padding: 24,
    gap: 18,
  },
  featureList: { gap: 14 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  featureText: { flex: 1, lineHeight: 22 },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  restoreLabel: {
    textDecorationLine: 'underline',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  legal: {
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
