// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
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
import { ArrowLeft, CheckCircle, XCircle, ClipboardList } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useParentApi } from '../../lib/useParentApi';
import { t } from '../../lib/i18n';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import type { PendingApprovalItem } from '../../lib/api';

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
  item: PendingApprovalItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

function ApprovalCard({ item, onApprove, onReject, isApproving, isRejecting }: ApprovalCardProps) {
  const theme = useTheme();
  const s = theme.surface;
  const tx = theme.text;

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
        animateOut('right', () => onApprove(item.completionId));
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (e.translationX < -80) {
        animateOut('left', () => onReject(item.completionId));
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
        {/* Swipe hint indicators */}
        <View style={styles.swipeHintLeft}>
          <XCircle size={20} color={theme.colors.semantic.danger} strokeWidth={2} />
        </View>
        <View style={styles.swipeHintRight}>
          <CheckCircle size={20} color={theme.colors.semantic.success} strokeWidth={2} />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.kidName, { color: theme.colors.gold[500] }]}>
              {item.kidName}
            </Text>
            <Text style={[styles.reward, { color: tx.primary }]}>
              {formatNok(item.rewardCents)}
            </Text>
          </View>
          <Text style={[styles.taskTitle, { color: tx.primary }]}>{item.title}</Text>
          <Text style={[styles.time, { color: tx.secondary }]}>
            {formatRelativeTime(item.completedAt)}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onReject(item.completionId)}
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
            onPress={() => onApprove(item.completionId)}
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
  const router = useRouter();
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
    mutationFn: (completionId: string) => api.approveTask(completionId),
    onSuccess: (_data, completionId) => {
      // Optimistic removal from list
      setRemovedIds((prev) => new Set([...prev, completionId]));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void queryClient.invalidateQueries({ queryKey: ['parent', 'approvals'] });
    },
    onError: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (completionId: string) => api.rejectTask(completionId),
    onSuccess: (_data, completionId) => {
      setRemovedIds((prev) => new Set([...prev, completionId]));
      void queryClient.invalidateQueries({ queryKey: ['parent', 'approvals'] });
    },
    onError: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const handleApprove = useCallback((completionId: string) => {
    approveMutation.mutate(completionId);
  }, [approveMutation]);

  const handleReject = useCallback((completionId: string) => {
    Alert.alert(
      t('parent.approvals.reject'),
      t('parent.approvals.confirmReject', { title: approvals?.find((a) => a.completionId === completionId)?.title ?? '' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('parent.approvals.reject'),
          style: 'destructive',
          onPress: () => rejectMutation.mutate(completionId),
        },
      ],
    );
  }, [approvals, rejectMutation]);

  const visibleApprovals = (approvals ?? []).filter(
    (a) => !removedIds.has(a.completionId),
  );

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
          {t('parent.approvals.title')}
        </Text>
        <View style={[styles.headerBtn, styles.countBadge]}>
          {visibleApprovals.length > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.gold[500] }]}>
              <Text style={styles.badgeText}>{visibleApprovals.length}</Text>
            </View>
          ) : null}
        </View>
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
          keyExtractor={(item) => item.completionId}
          renderItem={({ item }) => (
            <ApprovalCard
              item={item}
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
  countBadge: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  list: { padding: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  swipeHintLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -10,
    opacity: 0.3,
  },
  swipeHintRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
    opacity: 0.3,
  },
  cardContent: { padding: 16, gap: 4 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kidName: { fontSize: 13, fontWeight: '600' },
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
