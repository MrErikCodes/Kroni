// [REVIEW] Norwegian copy — verify with native speaker
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Wallet } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { kidApi } from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { BalanceText } from '../../../components/ui/BalanceText';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
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
        <Text style={[styles.historyReason, { color: tx.primary }]}>
          {t(`kid.balanceScreen.reasons.${entry.reason}`) || entry.reason}
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
  const tx = theme.text;

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['kid', 'balance'],
    queryFn: () => kidApi.getBalance(),
  });

  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['kid', 'history'],
    queryFn: () => kidApi.getHistory(),
  });

  const isLoading = summaryLoading || historyLoading;

  function handleRefresh() {
    void refetchSummary();
    void refetchHistory();
  }

  const ListHeader = (
    <View style={styles.headerSection}>
      {/* Big balance */}
      <Text style={[styles.balanceLabel, { color: tx.secondary }]}>
        {t('kid.balanceScreen.currentBalance')}
      </Text>
      <BalanceText
        amountOre={summary?.balanceCents ?? 0}
        large
        accessibilityLabel={`Saldo: ${summary?.balanceCents ?? 0} øre`}
      />

      {/* Week stats */}
      <View style={styles.weekRow}>
        <Card style={styles.weekCard}>
          <Text style={[styles.weekStatLabel, { color: tx.secondary }]}>
            {t('kid.balanceScreen.weekEarned')}
          </Text>
          <Text style={[styles.weekStatValue, { color: theme.colors.semantic.success }]}>
            +{formatNok(summary?.weekEarnedCents ?? 0)}
          </Text>
        </Card>
        <Card style={styles.weekCard}>
          <Text style={[styles.weekStatLabel, { color: tx.secondary }]}>
            {t('kid.balanceScreen.weekSpent')}
          </Text>
          <Text style={[styles.weekStatValue, { color: theme.colors.semantic.danger }]}>
            -{formatNok(summary?.weekSpentCents ?? 0)}
          </Text>
        </Card>
      </View>

      {/* History header */}
      {(history ?? []).length > 0 ? (
        <Text style={[styles.historyHeader, { color: tx.secondary }]}>
          {t('kid.balanceScreen.history')}
        </Text>
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
      {(history ?? []).length === 0 ? (
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
    alignItems: 'center',
    gap: 12,
  },
  balanceLabel: { fontSize: 14, fontWeight: '500' },
  weekRow: { flexDirection: 'row', gap: 12, width: '100%' },
  weekCard: { flex: 1, padding: 14, alignItems: 'center', gap: 4 },
  weekStatLabel: { fontSize: 12, fontWeight: '500' },
  weekStatValue: { fontSize: 18, fontWeight: '700' },
  historyHeader: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 8,
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
});
