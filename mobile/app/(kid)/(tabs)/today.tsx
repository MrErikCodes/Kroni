// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { useTheme, fonts } from '../../../lib/theme';
import { kidApi, isSubscriptionLapsedError } from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { formatMoney } from '../../../lib/format';
import { useCurrency } from '../../../lib/useCurrency';
import { ProgressRing } from '../../../components/ui/ProgressRing';
import { BalanceText } from '../../../components/ui/BalanceText';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { KroniText } from '../../../components/ui/Text';
import { Sheet } from '../../../components/ui/Sheet';
import type { TodayTask } from '@kroni/shared';
import 'react-native-get-random-values';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function formatRecurrence(task: TodayTask): string {
  if (task.recurrence === 'daily') return t('kid.todayScreen.detailSheet.recurrenceDaily');
  if (task.recurrence === 'once') return t('kid.todayScreen.detailSheet.recurrenceOnce');
  // weekly
  const days = (task.daysOfWeek ?? []).slice().sort(
    (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b),
  );
  if (days.length === 0) return t('kid.todayScreen.detailSheet.recurrenceWeekly');
  // Mirrors the "Valgfri" shortcut in the parent task form: when all days
  // are selected, the kid sees the same wording.
  if (days.length === 7) return t('kid.todayScreen.detailSheet.recurrenceAllDays');
  const connector = t('kid.todayScreen.detailSheet.connector');
  if (days.length === 1) {
    const dayName = t(`kid.todayScreen.detailSheet.dayNames.${days[0]}`).toLowerCase();
    return t('kid.todayScreen.detailSheet.recurrenceOneDay', { day: dayName });
  }
  const named = days.map((d) => t(`kid.todayScreen.detailSheet.dayNames.${d}`));
  if (named.length <= 2) return named.join(` ${connector} `);
  return `${named.slice(0, -1).join(', ')} ${connector} ${named[named.length - 1]}`;
}

// Foreground notification handler — suppressed here; root layout handles routing
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function generateIdempotencyKey(): string {
  // Simple uuid-like key using Math.random as crypto not always available on RN
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface TaskCardProps {
  task: TodayTask;
  onComplete: (task: TodayTask) => void;
  onUncomplete: (completionId: string) => void;
  onOpenDetails: (task: TodayTask) => void;
  isCompleting: boolean;
}

function TaskCard({
  task,
  onComplete,
  onUncomplete,
  onOpenDetails,
  isCompleting,
}: TaskCardProps) {
  const theme = useTheme();
  const s = theme.surface;
  const tx = theme.text;
  const currency = useCurrency();

  const scale = useSharedValue(1);

  const isDone =
    task.status === 'completed_pending_approval' ||
    task.status === 'approved' ||
    task.status === 'rejected';

  const isPending = task.status === 'pending';
  // Undoable while waiting on a parent — once the parent acts (approved /
  // rejected) the balance has moved or the task is closed, so we lock it.
  const canUndo = task.status === 'completed_pending_approval';

  function handleCirclePress() {
    if (isCompleting) return;

    if (canUndo) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUncomplete(task.completionId);
      return;
    }

    if (!isPending) return;

    // Spring sequence — kept as the heartbeat of the kid app, but the
    // displacement is toned down ~15% (0.96/1.04 vs the original 0.95/1.05).
    scale.value = withSequence(
      withSpring(0.96, { damping: 12, stiffness: 300 }),
      withSpring(1.04, { damping: 8, stiffness: 200 }),
      withSpring(1.0, { damping: 14, stiffness: 250 }),
    );

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    onComplete(task);
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  let statusIcon: React.ReactNode = null;
  let statusColor: string = tx.secondary;
  let statusLabel = '';

  if (task.status === 'completed_pending_approval') {
    statusIcon = <Clock size={14} color={theme.colors.semantic.warning} strokeWidth={1.75} />;
    statusColor = theme.colors.semantic.warning;
    statusLabel = t('kid.todayScreen.waitingApproval');
  } else if (task.status === 'approved') {
    statusIcon = <CheckCircle size={14} color={theme.colors.semantic.success} strokeWidth={1.75} />;
    statusColor = theme.colors.semantic.success;
    statusLabel = t('kid.todayScreen.approved');
  } else if (task.status === 'rejected') {
    statusIcon = <XCircle size={14} color={theme.colors.semantic.danger} strokeWidth={1.75} />;
    statusColor = theme.colors.semantic.danger;
    statusLabel = t('kid.todayScreen.rejected');
  }

  // Pending tasks get the warm gold-50 wash; everything else returns to the
  // editorial sand-50 surface with hairline border. Mirrors the website's
  // PhoneMock "I dag" frame.
  const surfaceBg = isPending
    ? theme.isDark
      ? theme.colors.gold[900]
      : theme.colors.gold[50]
    : s.card;
  const surfaceBorder = isPending
    ? theme.isDark
      ? theme.colors.gold[700]
      : theme.colors.gold[300]
    : s.border;

  const circleDisabled = (!isPending && !canUndo) || isCompleting;
  const circleAccessibilityLabel = isPending
    ? `Marker som ferdig: ${task.title}`
    : canUndo
      ? `Angre: ${task.title}`
      : task.title;

  return (
    <Animated.View
      style={[
        animStyle,
        styles.taskCard,
        {
          backgroundColor: surfaceBg,
          borderColor: surfaceBorder,
          opacity: task.status === 'rejected' ? 0.55 : 1,
        },
      ]}
    >
      <View style={styles.taskCardInner}>
        {/* Only the circle marks the task done / undoes it. Tap targets are
            split so a curious kid can read the description without
            accidentally checking the task off. */}
        <TouchableOpacity
          onPress={handleCirclePress}
          disabled={circleDisabled}
          activeOpacity={circleDisabled ? 1 : 0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel={circleAccessibilityLabel}
          accessibilityState={{ disabled: circleDisabled, checked: isDone }}
          style={[
            styles.taskCheck,
            {
              borderColor: isPending
                ? theme.colors.gold[500]
                : theme.colors.semantic.success,
              backgroundColor: isPending
                ? 'transparent'
                : isDone
                  ? theme.colors.semantic.success
                  : 'transparent',
            },
          ]}
        >
          {isDone ? (
            <CheckCircle size={20} color="#FFFFFF" strokeWidth={2.25} />
          ) : null}
        </TouchableOpacity>

        {/* Tap anywhere except the circle to open the detail sheet. */}
        <TouchableOpacity
          onPress={() => onOpenDetails(task)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Detaljer for ${task.title}`}
          style={styles.taskBodyTap}
        >
          <View style={styles.taskMid}>
            <KroniText
              variant="h2"
              tone="primary"
              style={[
                styles.taskTitle,
                { textDecorationLine: isDone ? 'line-through' : 'none' },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </KroniText>
            {task.description ? (
              <KroniText
                variant="small"
                tone="secondary"
                style={styles.taskDescription}
                numberOfLines={2}
              >
                {task.description}
              </KroniText>
            ) : null}
            {statusLabel ? (
              <View style={styles.statusRow}>
                {statusIcon}
                <KroniText variant="caption" style={{ color: statusColor }}>
                  {statusLabel}
                </KroniText>
              </View>
            ) : null}
          </View>

          {/* Reward chip — gold-500 fill like the website mock. */}
          <View
            style={[
              styles.rewardChip,
              { backgroundColor: theme.colors.gold[500] },
            ]}
          >
            <Text
              style={[
                styles.rewardChipText,
                { color: theme.colors.sand[900] },
              ]}
            >
              {formatMoney(task.rewardCents, currency)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

interface TaskDetailSheetProps {
  task: TodayTask | null;
  onClose: () => void;
}

function TaskDetailSheet({ task, onClose }: TaskDetailSheetProps) {
  const theme = useTheme();
  const tx = theme.text;
  const currency = useCurrency();
  return (
    <Sheet visible={task !== null} onClose={onClose}>
      {task ? (
        <View style={styles.sheetContent}>
          <KroniText variant="eyebrow" tone="gold">
            {formatMoney(task.rewardCents, currency)}
          </KroniText>
          <KroniText variant="display" tone="primary" style={styles.sheetTitle}>
            {task.title}
          </KroniText>

          {task.description ? (
            <KroniText
              variant="body"
              tone="secondary"
              style={styles.sheetDescription}
            >
              {task.description}
            </KroniText>
          ) : null}

          <View style={styles.sheetMeta}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: tx.tertiary }]}>
                {t('kid.todayScreen.detailSheet.whenLabel')}
              </Text>
              <Text style={[styles.metaValue, { color: tx.primary }]}>
                {formatRecurrence(task)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: tx.tertiary }]}>
                {t('kid.todayScreen.detailSheet.approvalLabel')}
              </Text>
              <Text style={[styles.metaValue, { color: tx.primary }]}>
                {task.requiresApproval
                  ? t('kid.todayScreen.detailSheet.approvalRequired')
                  : t('kid.todayScreen.detailSheet.approvalDirect')}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}

export default function TodayScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const s = theme.surface;

  // null when the sheet is closed; set to the task whose details to show.
  const [detailTask, setDetailTask] = useState<TodayTask | null>(null);

  // Request notification permissions on first visit
  useEffect(() => {
    void (async () => {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  // Listen for foreground notifications
  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  useEffect(() => {
    notifListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data;
        if (data?.kind === 'kroni.taskApproved') {
          const amount =
            typeof data.amountCents === 'number' ? data.amountCents : 0;
          router.push({
            pathname: '/(kid)/celebrate',
            params: { amountCents: String(amount) },
          });
        }
      },
    );
    return () => {
      notifListener.current?.remove();
    };
  }, [router]);

  const { data: me } = useQuery({
    queryKey: ['kid', 'me'],
    queryFn: () => kidApi.getMe(),
  });

  const { data: balance } = useQuery({
    queryKey: ['kid', 'balance'],
    queryFn: () => kidApi.getBalance(),
  });

  const {
    data: tasks,
    isLoading,
    isError,
    error: tasksError,
    refetch,
  } = useQuery({
    queryKey: ['kid', 'today'],
    queryFn: () => kidApi.getTodayTasks(),
    // 402 means the household subscription lapsed — kids can't fix this
    // themselves, so retrying the request just churns. Render the banner
    // and let the parent handle billing.
    retry: (_count, err) => !isSubscriptionLapsedError(err),
  });

  // Surface a friendly banner instead of the generic "Couldn't load" state
  // when the backend returns 402 Payment Required. Kids can't open the
  // paywall (only the parent owner can manage billing), so the message
  // tells them to ask the parent to renew.
  const subscriptionLapsed = isSubscriptionLapsedError(tasksError);

  // Surface mutation failures inline (matches the rewards modal pattern):
  // a previous "silent fall-through to common.error" hid network blips when
  // the kid tapped the circle. Now we render a hairline banner above the
  // task list and bounce the kid back into the pending list (react-query
  // already reverts the cache on error).
  const [mutationError, setMutationError] = useState<string | null>(null);

  const completeMutation = useMutation({
    mutationFn: ({ completionId }: { completionId: string }) =>
      kidApi.completeTask(completionId, generateIdempotencyKey()),
    onSuccess: () => {
      setMutationError(null);
      void queryClient.invalidateQueries({ queryKey: ['kid', 'today'] });
      void queryClient.invalidateQueries({ queryKey: ['kid', 'balance'] });
    },
    onError: () => {
      setMutationError(t('kid.errors.completeFailed'));
    },
  });

  const uncompleteMutation = useMutation({
    mutationFn: (completionId: string) => kidApi.uncompleteTask(completionId),
    onSuccess: () => {
      setMutationError(null);
      void queryClient.invalidateQueries({ queryKey: ['kid', 'today'] });
    },
    onError: () => {
      setMutationError(t('kid.errors.uncompleteFailed'));
    },
  });

  const handleComplete = useCallback(
    (task: TodayTask) => {
      completeMutation.mutate({ completionId: task.completionId });
      // Navigate optimistically — the celebrate screen owns its own
      // lifetime, so the confetti/coin animation isn't cut short by the
      // list refetch that moves this card from `pending` → `done` and
      // unmounts the source TaskCard.
      router.push({
        pathname: '/(kid)/celebrate',
        params: { amountCents: String(task.rewardCents) },
      });
    },
    [completeMutation, router],
  );

  const handleUncomplete = useCallback(
    (completionId: string) => {
      uncompleteMutation.mutate(completionId);
    },
    [uncompleteMutation],
  );

  const pending = (tasks ?? []).filter((t) => t.status === 'pending');
  const done = (tasks ?? []).filter((t) => t.status !== 'pending');
  const total = tasks?.length ?? 0;
  const doneCount = done.length;
  const progress = total > 0 ? doneCount / total : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => void refetch()}
            tintColor={theme.colors.gold[500]}
          />
        }
      >
        {/* Editorial hero: serif "I dag, _Ada_." with the kid's name in italic. */}
        <View style={styles.heroSection}>
          <View style={styles.heroLine}>
            <KroniText variant="displayLarge" tone="primary" style={styles.heroText}>
              {t('kid.todayScreen.heroToday')}{' '}
            </KroniText>
            <KroniText
              variant="displayItalic"
              tone="gold"
              style={[styles.heroText, styles.italicHero]}
            >
              {me?.name ?? '…'}
            </KroniText>
            <KroniText variant="displayLarge" tone="primary" style={styles.heroText}>
              .
            </KroniText>
          </View>
          <View style={styles.balanceRow}>
            <KroniText variant="caption" tone="tertiary">
              {t('kid.todayScreen.balanceLabel')}
            </KroniText>
            <BalanceText
              amountOre={balance?.balanceCents ?? 0}
              large
              accessibilityLabel={t('kid.todayScreen.balanceAccessibility', { amount: String(balance?.balanceCents ?? 0) })}
            />
          </View>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <Spinner size={36} />
          </View>
        ) : subscriptionLapsed ? (
          <View
            style={[
              styles.mutationError,
              { backgroundColor: theme.colors.semantic.warning + '22' },
            ]}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
          >
            <KroniText
              variant="small"
              style={{ color: theme.colors.semantic.warning, flex: 1 }}
            >
              {t('kid.errors.subscriptionLapsed')}
            </KroniText>
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <KroniText variant="body" tone="primary">
              {t('kid.errors.loadFailedTitle')}
            </KroniText>
            <KroniText variant="small" tone="secondary">
              {t('kid.errors.loadFailedBody')}
            </KroniText>
            <TouchableOpacity onPress={() => void refetch()} style={{ marginTop: 8 }}>
              <KroniText variant="body" tone="gold">
                {t('kid.errors.retry')}
              </KroniText>
            </TouchableOpacity>
          </View>
        ) : total === 0 ? (
          <EmptyState
            title={t('kid.todayScreen.noTasks')}
            body={t('kid.todayScreen.noTasksBody')}
          />
        ) : (
          <>
            {mutationError ? (
              <View
                style={[
                  styles.mutationError,
                  { backgroundColor: theme.colors.semantic.danger + '18' },
                ]}
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
              >
                <KroniText
                  variant="small"
                  style={{ color: theme.colors.semantic.danger, flex: 1 }}
                >
                  {mutationError}
                </KroniText>
                <TouchableOpacity
                  onPress={() => setMutationError(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.close')}
                >
                  <KroniText variant="small" tone="danger">
                    ×
                  </KroniText>
                </TouchableOpacity>
              </View>
            ) : null}
            {pending.length > 0 ? (
              <View style={styles.section}>
                <KroniText variant="eyebrow" tone="tertiary">
                  {t('kid.todayScreen.pendingSection')}
                </KroniText>
                {pending.map((task) => (
                  <TaskCard
                    key={task.completionId}
                    task={task}
                    onComplete={handleComplete}
                    onUncomplete={handleUncomplete}
                    onOpenDetails={setDetailTask}
                    isCompleting={completeMutation.isPending || uncompleteMutation.isPending}
                  />
                ))}
              </View>
            ) : null}

            {done.length > 0 ? (
              <View style={styles.section}>
                <KroniText variant="eyebrow" tone="tertiary">
                  {t('kid.todayScreen.doneSection')}
                </KroniText>
                {done.map((task) => (
                  <TaskCard
                    key={task.completionId}
                    task={task}
                    onComplete={handleComplete}
                    onUncomplete={handleUncomplete}
                    onOpenDetails={setDetailTask}
                    isCompleting={completeMutation.isPending || uncompleteMutation.isPending}
                  />
                ))}
              </View>
            ) : null}

            <View style={styles.progressSection}>
              <ProgressRing value={progress} size={72} strokeWidth={6} />
              <KroniText variant="small" tone="secondary">
                {t('kid.todayScreen.progressLabel', { done: doneCount, total })}
              </KroniText>
            </View>
          </>
        )}
      </ScrollView>

      <TaskDetailSheet task={detailTask} onClose={() => setDetailTask(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 24, flexGrow: 1 },
  heroSection: { paddingTop: 12, gap: 16 },
  heroLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  heroText: {
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.0,
  },
  italicHero: {
    fontFamily: fonts.displayItalic,
  },
  balanceRow: { gap: 4 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 200,
  },
  section: { gap: 10 },
  mutationError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  taskCard: {
    borderRadius: 24,
    borderWidth: 1,
    minHeight: 80,
    overflow: 'hidden',
    position: 'relative',
  },
  taskCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    minHeight: 80,
  },
  taskCheck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskBodyTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  taskMid: { flex: 1, gap: 4 },
  taskTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.uiBold,
    letterSpacing: -0.2,
  },
  taskDescription: { fontSize: 13, lineHeight: 18 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rewardChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  rewardChipText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  progressSection: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  // Detail sheet
  sheetContent: { gap: 12, paddingBottom: 12 },
  sheetTitle: { fontSize: 28, lineHeight: 32, letterSpacing: -0.6 },
  sheetDescription: { fontSize: 16, lineHeight: 24 },
  sheetMeta: { gap: 12, marginTop: 8 },
  metaRow: { gap: 4 },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metaValue: { fontSize: 16, fontWeight: '500' },
});
