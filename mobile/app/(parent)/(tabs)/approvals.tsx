// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { CheckCircle, XCircle, ClipboardList } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import type {
  PendingApprovalItem,
  PendingRedemptionItem,
} from '../../../lib/api';

// Discriminated row so the same FlashList can render both task completions
// (kid did a chore — parent credits balance) and reward redemptions (kid
// spent saldo — parent fulfills it). Both use the same swipe / button UX.
type ApprovalRow =
  | { kind: 'task'; id: string; data: PendingApprovalItem }
  | { kind: 'reward'; id: string; data: PendingRedemptionItem };

const formatNok = (ore: number) =>
  new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(ore / 100);

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `for ${days} dag${days === 1 ? '' : 'er'} siden`;
  if (hrs > 0) return `for ${hrs} time${hrs === 1 ? '' : 'r'} siden`;
  if (mins > 0) return `for ${mins} minutt${mins === 1 ? '' : 'er'} siden`;
  return 'akkurat nå';
}

interface ApprovalCardProps {
  row: ApprovalRow;
  onApprove: (row: ApprovalRow) => void;
  onReject: (row: ApprovalRow) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

function ApprovalCard({ row, onApprove, onReject, isApproving, isRejecting }: ApprovalCardProps) {
  const theme = useTheme();
  const s = theme.surface;
  const tx = theme.text;

  const isReward = row.kind === 'reward';
  const kidName = row.data.kidName;
  const title = row.data.title;
  const amountCents = isReward ? row.data.costCents : row.data.rewardCents;
  const timestampIso = isReward ? row.data.requestedAt : row.data.completedAt;
  const icon = isReward ? row.data.icon : null;

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  function animateOut(direction: 'left' | 'right', cb: () => void) {
    'worklet';
    translateX.value = withTiming(direction === 'right' ? 400 : -400, { duration: 280 });
    opacity.value = withTiming(0, { duration: 280 });
    runOnJS(cb)();
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > 80) {
        animateOut('right', () => onApprove(row));
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (e.translationX < -80) {
        animateOut('left', () => onReject(row));
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: s.card, borderColor: s.border },
          animStyle,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={[styles.kindLabel, { color: isReward ? theme.colors.semantic.warning : theme.colors.gold[500] }]}>
                {isReward ? /* [REVIEW] */ 'Belønning' : /* [REVIEW] */ 'Oppgave'}
              </Text>
              <Text style={[styles.kidName, { color: tx.secondary }]}>{kidName}</Text>
            </View>
            <Text style={[styles.reward, { color: tx.primary }]}>
              {isReward ? `−${formatNok(amountCents)}` : formatNok(amountCents)}
            </Text>
          </View>
          <Text style={[styles.taskTitle, { color: tx.primary }]}>
            {icon ? `${icon} ` : ''}{title}
          </Text>
          <Text style={[styles.time, { color: tx.secondary }]}>
            {formatRelativeTime(timestampIso)}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onReject(row)}
            disabled={isRejecting}
            style={[styles.actionBtn, { backgroundColor: theme.colors.semantic.danger + '18' }]}
            accessibilityRole="button"
            accessibilityLabel={t('parent.approvals.reject')}
          >
            <XCircle size={22} color={theme.colors.semantic.danger} strokeWidth={2} />
            <Text style={[styles.actionLabel, { color: theme.colors.semantic.danger }]}>
              {t('parent.approvals.reject')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onApprove(row)}
            disabled={isApproving}
            style={[styles.actionBtn, { backgroundColor: theme.colors.semantic.success + '18' }]}
            accessibilityRole="button"
            accessibilityLabel={t('parent.approvals.approve')}
          >
            <CheckCircle size={22} color={theme.colors.semantic.success} strokeWidth={2} />
            <Text style={[styles.actionLabel, { color: theme.colors.semantic.success }]}>
              {t('parent.approvals.approve')}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export default function ApprovalsScreen() {
  const theme = useTheme();
  const api = useParentApi();
  const queryClient = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

  // Local state for optimistic removal animation
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const { data: approvals, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent', 'approvals'],
    queryFn: () => api.getApprovals(),
    refetchInterval: 30000, // Poll every 30s
  });

  const approveMutation = useMutation({
    mutationFn: async (row: ApprovalRow) => {
      if (row.kind === 'task') {
        await api.approveTask(row.id);
      } else {
        await api.approveReward(row.id);
      }
    },
    onSuccess: (_data, row) => {
      // Optimistic removal from list
      setRemovedIds((prev) => new Set([...prev, row.id]));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void queryClient.invalidateQueries({ queryKey: ['parent', 'approvals'] });
      void queryClient.invalidateQueries({ queryKey: ['parent', 'kids'] });
    },
    onError: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (row: ApprovalRow) =>
      row.kind === 'task'
        ? api.rejectTask(row.id)
        : api.rejectReward(row.id),
    onSuccess: (_data, row) => {
      setRemovedIds((prev) => new Set([...prev, row.id]));
      void queryClient.invalidateQueries({ queryKey: ['parent', 'approvals'] });
    },
    onError: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const handleApprove = useCallback(
    (row: ApprovalRow) => {
      approveMutation.mutate(row);
    },
    [approveMutation],
  );

  const [pendingReject, setPendingReject] = useState<ApprovalRow | null>(null);
  const handleReject = useCallback((row: ApprovalRow) => {
    setPendingReject(row);
  }, []);
  const confirmReject = useCallback(() => {
    if (!pendingReject) return;
    rejectMutation.mutate(pendingReject);
    setPendingReject(null);
  }, [pendingReject, rejectMutation]);
  const pendingRejectTitle = pendingReject?.data.title ?? '';

  // Merge both queues into a single time-ordered list, then strip optimistic
  // removals. Reward redemptions and task completions co-mingle so the
  // parent works through them top-to-bottom in arrival order.
  const visibleApprovals: ApprovalRow[] = (() => {
    const taskRows: ApprovalRow[] = (approvals?.taskCompletions ?? []).map((d) => ({
      kind: 'task' as const,
      id: d.completionId,
      data: d,
    }));
    const redemptionRows: ApprovalRow[] = (approvals?.rewardRedemptions ?? []).map((d) => ({
      kind: 'reward' as const,
      id: d.redemptionId,
      data: d,
    }));
    const ts = (r: ApprovalRow) =>
      r.kind === 'task' ? r.data.completedAt : r.data.requestedAt;
    return [...taskRows, ...redemptionRows]
      .filter((r) => !removedIds.has(r.id))
      .sort((a, b) => (ts(a) < ts(b) ? 1 : -1));
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={[styles.header, { borderBottomColor: s.border }]}>
        <Text style={[styles.headerTitle, { color: tx.primary }]}>
          {t('parent.approvals.title')}
        </Text>
        {visibleApprovals.length > 0 ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.gold[500] }]}>
            <Text style={styles.badgeText}>{visibleApprovals.length}</Text>
          </View>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Spinner />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.semantic.danger }}>{t('common.error')}</Text>
          <TouchableOpacity onPress={() => void refetch()}>
            <Text style={{ color: theme.colors.gold[500], marginTop: 8 }}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : visibleApprovals.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t('parent.approvals.empty')}
          body={t('parent.approvals.emptyBody')}
        />
      ) : (
        <FlashList
          data={visibleApprovals}
          keyExtractor={(item) => `${item.kind}:${item.id}`}
          renderItem={({ item }) => (
            <ApprovalCard
              row={item}
              onApprove={handleApprove}
              onReject={handleReject}
              isApproving={approveMutation.isPending}
              isRejecting={rejectMutation.isPending}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void refetch()}
              tintColor={theme.colors.gold[500]}
            />
          }
        />
      )}

      <ConfirmDialog
        visible={pendingReject !== null}
        title={t('parent.approvals.reject')}
        message={t('parent.approvals.confirmReject', { title: pendingRejectTitle })}
        confirmLabel={t('parent.approvals.reject')}
        destructive
        onConfirm={confirmReject}
        onCancel={() => setPendingReject(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  list: { padding: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: { padding: 16, gap: 4 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kindLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  kidName: { fontSize: 13, fontWeight: '500' },
  reward: { fontSize: 16, fontWeight: '700' },
  taskTitle: { fontSize: 17, fontWeight: '600' },
  time: { fontSize: 13 },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    minHeight: 44,
  },
  actionLabel: { fontSize: 15, fontWeight: '600' },
});
