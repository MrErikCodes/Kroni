// [REVIEW] Norwegian copy — verify with native speaker
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Wallet } from 'lucide-react-native';
import { useTheme, fonts } from '../../../lib/theme';
import { kidApi } from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { BalanceText } from '../../../components/ui/BalanceText';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { KroniText } from '../../../components/ui/Text';
import type { BalanceEntry } from '@kroni/shared';

const formatNok = (ore: number) =>
  new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(ore / 100);

function formatRelativeDate(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diffDays === 0) return t('kid.balanceScreen.today');
  if (diffDays === 1) return t('kid.balanceScreen.yesterday');
  return t('kid.balanceScreen.daysAgo', { count: diffDays });
}

const REASON_ICONS: Record<string, string> = {
  task: '✅',
  allowance: '💰',
  redemption: '🎁',
  adjustment: '📝',
  gift: '🎀',
  reversal: '↩️',
};

function HistoryRow({ entry }: { entry: BalanceEntry }) {
  const theme = useTheme();
  const tx = theme.text;
  const isPositive = entry.amountCents > 0;

  return (
    <View style={[styles.historyRow, { borderBottomColor: theme.surface.border }]}>
      <View style={[styles.historyIcon, { backgroundColor: theme.colors.gold[50] }]}>
        <Text style={styles.historyEmoji}>{REASON_ICONS[entry.reason] ?? '💸'}</Text>
      </View>
      <View style={styles.historyInfo}>
        {/* Show the actual task / reward title when we have it; fall back
            to the generic reason label for adjustments and pre-snapshot
            entries. */}
        <Text style={[styles.historyReason, { color: tx.primary }]} numberOfLines={2}>
          {entry.referenceTitle ??
            t(`kid.balanceScreen.reasons.${entry.reason}`) ??
            entry.reason}
        </Text>
        <Text style={[styles.historyDate, { color: tx.secondary }]}>
          {formatRelativeDate(entry.createdAt)}
        </Text>
        {entry.note ? (
          <Text style={[styles.historyNote, { color: tx.secondary }]}>{entry.note}</Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.historyAmount,
          { color: isPositive ? theme.colors.semantic.success : theme.colors.semantic.danger },
        ]}
      >
        {isPositive ? '+' : ''}{formatNok(entry.amountCents)}
      </Text>
    </View>
  );
}

export default function BalanceScreen() {
  const theme = useTheme();
  const s = theme.surface;

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryIsError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['kid', 'balance'],
    queryFn: () => kidApi.getBalance(),
  });

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyIsError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['kid', 'history'],
    queryFn: () => kidApi.getHistory(),
  });

  const isLoading = summaryLoading || historyLoading;
  // Treat either query failing as a load failure — the kid would otherwise
  // see a "no transactions yet" empty state even when the network is just
  // down. Mirrors the rewards modal's inline-error pattern.
  const isError = summaryIsError || historyIsError;

  function handleRefresh() {
    void refetchSummary();
    void refetchHistory();
  }

  const ListHeader = (
    <View style={styles.headerSection}>
      {/* Editorial centerpiece — serif balance with eyebrow caption. */}
      <View style={styles.balanceBlock}>
        <KroniText variant="eyebrow" tone="tertiary">
          {t('kid.balanceScreen.currentBalance')}
        </KroniText>
        <BalanceText
          amountOre={summary?.balanceCents ?? 0}
          large
          accessibilityLabel={`Saldo: ${summary?.balanceCents ?? 0} øre`}
        />
      </View>

      {/* Week stats — paired hairline cards with editorial labels. */}
      <View style={styles.weekRow}>
        <Card style={styles.weekCard}>
          <KroniText variant="caption" tone="tertiary">
            {t('kid.balanceScreen.weekEarned')}
          </KroniText>
          <Text
            style={[
              styles.weekStatValue,
              { color: theme.colors.semantic.success },
            ]}
          >
            +{formatNok(summary?.weekEarnedCents ?? 0)}
          </Text>
        </Card>
        <Card style={styles.weekCard}>
          <KroniText variant="caption" tone="tertiary">
            {t('kid.balanceScreen.weekSpent')}
          </KroniText>
          <Text
            style={[
              styles.weekStatValue,
              { color: theme.colors.semantic.danger },
            ]}
          >
            -{formatNok(summary?.weekSpentCents ?? 0)}
          </Text>
        </Card>
      </View>

      {(history ?? []).length > 0 ? (
        <KroniText variant="eyebrow" tone="tertiary" style={styles.historyHeader}>
          {t('kid.balanceScreen.history')}
        </KroniText>
      ) : null}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
        <View style={styles.center}>
          <Spinner size={36} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      {isError ? (
        <View style={styles.emptyContainer}>
          {ListHeader}
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: theme.colors.semantic.danger + '18' },
            ]}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
          >
            <KroniText variant="body" tone="primary" style={styles.errorTitle}>
              {t('kid.errors.loadFailedTitle')}
            </KroniText>
            <KroniText variant="small" tone="secondary" style={styles.errorBody}>
              {t('kid.errors.loadFailedBody')}
            </KroniText>
            <TouchableOpacity
              onPress={handleRefresh}
              style={[styles.retryBtn, { borderColor: theme.colors.gold[500] }]}
              accessibilityRole="button"
              accessibilityLabel={t('kid.errors.retry')}
            >
              <KroniText variant="body" tone="gold">
                {t('kid.errors.retry')}
              </KroniText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (history ?? []).length === 0 ? (
        <View style={styles.emptyContainer}>
          {ListHeader}
          <EmptyState
            icon={Wallet}
            title={t('kid.balanceScreen.emptyHistory')}
            body={t('kid.balanceScreen.emptyHistoryBody')}
          />
        </View>
      ) : (
        <FlashList
          data={history ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryRow entry={item} />}
          ListHeaderComponent={ListHeader}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={theme.colors.gold[500]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1 },
  headerSection: {
    padding: 24,
    gap: 24,
  },
  balanceBlock: { alignItems: 'flex-start', gap: 8 },
  weekRow: { flexDirection: 'row', gap: 12, width: '100%' },
  weekCard: { flex: 1, padding: 16, gap: 6 },
  weekStatValue: {
    fontFamily: fonts.uiBold,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  historyHeader: {
    marginTop: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyEmoji: { fontSize: 20 },
  historyInfo: { flex: 1, gap: 2 },
  historyReason: { fontSize: 15, fontWeight: '600' },
  historyDate: { fontSize: 13 },
  historyNote: { fontSize: 12 },
  historyAmount: { fontSize: 16, fontWeight: '700' },
  errorBanner: {
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  errorTitle: { fontSize: 15, fontWeight: '600' },
  errorBody: { fontSize: 13 },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
});
