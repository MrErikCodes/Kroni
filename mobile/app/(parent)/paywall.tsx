// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Check } from 'lucide-react-native';
import {
  PACKAGE_TYPE,
  type PurchasesPackage,
  type PurchasesOffering,
} from 'react-native-purchases';
import { useTheme, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';
import {
  getCurrentOffering,
  purchasePackage,
  restorePurchases,
  checkTrialEligibility,
  type TrialEligibility,
  type PurchaseErrorCode,
} from '../../lib/billing';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Card } from '../../components/ui/Card';
import { KroniText } from '../../components/ui/Text';

// Feature labels are evaluated PER RENDER, not at module load. The
// previous module-level array captured `t()` results before
// ParentLocaleBridge had hydrated the parent's preferred locale, so
// the rest of the screen was Norwegian while the bullet list was
// stuck on whatever locale was active at the first JS evaluation
// (typically the device locale, which on a fresh emulator is en).
function buildFeatures(): string[] {
  return [
    t('paywall.features.kids'),
    t('paywall.features.tasks'),
    t('paywall.features.rewards'),
    t('paywall.features.notifications'),
    t('paywall.features.history'),
  ];
}

type PackageRow = {
  pkg: PurchasesPackage;
  kind: 'monthly' | 'yearly' | 'lifetime';
};

function partitionPackages(offering: PurchasesOffering): PackageRow[] {
  const rows: PackageRow[] = [];
  for (const pkg of offering.availablePackages) {
    if (pkg.packageType === PACKAGE_TYPE.MONTHLY) rows.push({ pkg, kind: 'monthly' });
    else if (pkg.packageType === PACKAGE_TYPE.ANNUAL) rows.push({ pkg, kind: 'yearly' });
    else if (pkg.packageType === PACKAGE_TYPE.LIFETIME) rows.push({ pkg, kind: 'lifetime' });
  }
  // Stack order: yearly, monthly, lifetime.
  const order: Record<PackageRow['kind'], number> = { yearly: 0, monthly: 1, lifetime: 2 };
  rows.sort((a, b) => order[a.kind] - order[b.kind]);
  return rows;
}

function ctaLabel(kind: PackageRow['kind'], trialEligible: boolean): string {
  if (kind === 'lifetime') return t('paywall.buyLifetime');
  if (trialEligible) return t('paywall.startTrial');
  return t('paywall.subscribe');
}

export default function PaywallScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const s = theme.surface;

  const [selectedKind, setSelectedKind] = useState<PackageRow['kind']>('yearly');
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const offeringQuery = useQuery({
    queryKey: ['billing', 'offering'],
    queryFn: getCurrentOffering,
    staleTime: 1000 * 60 * 5,
  });

  const rows = useMemo<PackageRow[]>(() => {
    if (!offeringQuery.data) return [];
    return partitionPackages(offeringQuery.data);
  }, [offeringQuery.data]);

  // Run trial-eligibility checks for the recurring SKUs once the offering
  // loads. Lifetime is non-renewing so it doesn't have intro pricing.
  const eligibilityQuery = useQuery({
    queryKey: [
      'billing',
      'trialEligibility',
      rows.filter((r) => r.kind !== 'lifetime').map((r) => r.pkg.product.identifier).join(','),
    ],
    queryFn: async (): Promise<Record<string, TrialEligibility>> => {
      const subs = rows.filter((r) => r.kind !== 'lifetime');
      const entries = await Promise.all(
        subs.map(async (r) => [r.pkg.product.identifier, await checkTrialEligibility(r.pkg.product.identifier)] as const),
      );
      return Object.fromEntries(entries);
    },
    enabled: rows.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const selectedRow = rows.find((r) => r.kind === selectedKind) ?? rows[0];

  // Show the trial badge when RC says ELIGIBLE, or UNKNOWN (Android always
  // reports UNKNOWN because Play Billing only resolves eligibility on the
  // store sheet — better to advertise the trial and let the sheet correct
  // ineligible users than to silently hide it).
  function showTrialBadge(productId: string): boolean {
    const status = eligibilityQuery.data?.[productId];
    return status === 'eligible' || status === 'unknown' || status === undefined;
  }

  const trialEligibleForSelected =
    selectedRow && selectedRow.kind !== 'lifetime'
      ? showTrialBadge(selectedRow.pkg.product.identifier)
      : false;

  const handlePurchase = useCallback(async () => {
    if (!selectedRow) return;
    setErrorMessage(null);
    setPurchasing(true);
    try {
      const result = await purchasePackage(selectedRow.pkg);
      if (result.kind === 'purchased') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        void queryClient.invalidateQueries({ queryKey: ['billing'] });
        router.back();
      } else if (result.kind === 'error') {
        setErrorMessage(t(`paywall.purchaseErrors.${result.code}` satisfies `paywall.purchaseErrors.${PurchaseErrorCode}`));
      }
      // 'cancelled' → silent
    } finally {
      setPurchasing(false);
    }
  }, [selectedRow, queryClient, router]);

  const handleRestore = useCallback(async () => {
    setErrorMessage(null);
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

  const handleSelect = useCallback(async (kind: PackageRow['kind']) => {
    await Haptics.selectionAsync();
    setSelectedKind(kind);
  }, []);

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

        <Card tone="elevated" radius="2xl" style={styles.featureCard}>
          <KroniText variant="eyebrow" tone="tertiary">
            {t('paywall.featuresEyebrow')}
          </KroniText>
          <View style={styles.featureList}>
            {buildFeatures().map((f) => (
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

        {/* Plans */}
        {offeringQuery.isPending ? (
          <View style={styles.loaderRow}>
            <Spinner size={22} />
          </View>
        ) : rows.length === 0 ? (
          <Card tone="panel" radius="xl" style={styles.errorCard}>
            <KroniText variant="bodyLarge" tone="primary" style={styles.errorTitle}>
              {t('paywall.errorTitle')}
            </KroniText>
            <KroniText variant="body" tone="secondary" style={styles.errorBody}>
              {t('paywall.errorBody')}
            </KroniText>
            <Button
              label={t('paywall.errorRetry')}
              onPress={() => void offeringQuery.refetch()}
              variant="secondary"
              loading={offeringQuery.isFetching}
            />
          </Card>
        ) : (
          <View style={styles.planList}>
            <KroniText variant="eyebrow" tone="tertiary">
              {t('paywall.choosePlan')}
            </KroniText>
            {rows.map((row) => (
              <PlanRow
                key={row.kind}
                row={row}
                selected={selectedKind === row.kind}
                onSelect={() => void handleSelect(row.kind)}
                showTrial={row.kind !== 'lifetime' && showTrialBadge(row.pkg.product.identifier)}
              />
            ))}
          </View>
        )}

        {errorMessage ? (
          <Card tone="panel" radius="lg" style={styles.errorBanner}>
            <KroniText variant="small" tone="primary">
              {errorMessage}
            </KroniText>
          </Card>
        ) : null}

        {selectedRow ? (
          <Button
            label={purchasing ? t('common.loading') : ctaLabel(selectedRow.kind, trialEligibleForSelected)}
            onPress={() => void handlePurchase()}
            loading={purchasing}
            size="lg"
          />
        ) : null}

        <TouchableOpacity
          onPress={() => void handleRestore()}
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

function PlanRow({
  row,
  selected,
  onSelect,
  showTrial,
}: {
  row: PackageRow;
  selected: boolean;
  onSelect: () => void;
  showTrial: boolean;
}) {
  const theme = useTheme();
  const { pkg, kind } = row;

  const tierLabel =
    kind === 'monthly' ? t('paywall.monthly') : kind === 'yearly' ? t('paywall.yearly') : t('paywall.lifetime');
  const periodSuffix =
    kind === 'monthly' ? ` ${t('paywall.perMonth')}` : kind === 'yearly' ? ` ${t('paywall.perYear')}` : '';
  const badge = kind === 'yearly' ? t('paywall.save') : kind === 'lifetime' ? t('paywall.lifetimeBadge') : null;
  const note = kind === 'lifetime' ? t('paywall.lifetimeNote') : null;

  const borderColor = selected ? theme.colors.gold[500] : theme.isDark ? '#2A3040' : theme.colors.sand[200];
  const bg = selected
    ? theme.isDark
      ? theme.colors.gold[900]
      : theme.colors.gold[50]
    : theme.isDark
      ? theme.colors.ink[800]
      : theme.colors.sand[50];

  return (
    <TouchableOpacity
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${tierLabel} ${pkg.product.priceString}`}
      activeOpacity={0.85}
      style={[
        styles.planRow,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? theme.colors.gold[500] : theme.isDark ? '#2A3040' : theme.colors.sand[300],
          },
        ]}
      >
        {selected ? (
          <View style={[styles.radioDot, { backgroundColor: theme.colors.gold[500] }]} />
        ) : null}
      </View>

      <View style={styles.planBody}>
        <View style={styles.planTopRow}>
          <KroniText variant="bodyLarge" tone="primary" style={styles.planTitle}>
            {tierLabel}
          </KroniText>
          {badge ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: kind === 'lifetime' ? theme.colors.gold[500] : 'transparent',
                  borderColor: theme.colors.gold[500],
                  borderWidth: kind === 'lifetime' ? 0 : 1,
                },
              ]}
            >
              <KroniText
                variant="caption"
                style={[
                  styles.badgeLabel,
                  { color: kind === 'lifetime' ? theme.colors.sand[900] : theme.colors.gold[700] },
                ]}
              >
                {badge}
              </KroniText>
            </View>
          ) : null}
        </View>
        <KroniText variant="body" tone="secondary" style={styles.planPrice}>
          {pkg.product.priceString}
          {periodSuffix}
        </KroniText>
        {showTrial ? (
          <KroniText variant="caption" tone="gold" style={styles.trialLine}>
            {t('paywall.trial')}
          </KroniText>
        ) : null}
        {note ? (
          <KroniText variant="caption" tone="secondary" style={styles.planNote}>
            {note}
          </KroniText>
        ) : null}
      </View>
    </TouchableOpacity>
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
  planList: { gap: 12 },
  planRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  planBody: { flex: 1, gap: 4 },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  planTitle: {
    fontSize: 17,
    fontFamily: fonts.uiBold,
  },
  planPrice: {
    fontSize: 15,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeLabel: {
    fontSize: 11,
    fontFamily: fonts.uiBold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  trialLine: {
    fontFamily: fonts.uiBold,
    marginTop: 2,
  },
  planNote: {
    marginTop: 4,
    lineHeight: 16,
  },
  loaderRow: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  errorCard: {
    padding: 20,
    gap: 12,
  },
  errorTitle: {
    fontFamily: fonts.uiBold,
  },
  errorBody: {
    lineHeight: 20,
  },
  errorBanner: {
    padding: 12,
  },
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
