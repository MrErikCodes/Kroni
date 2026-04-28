// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { useTheme, fonts } from '../../../lib/theme';
import { kidApi } from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { ProgressRing } from '../../../components/ui/ProgressRing';
import { BalanceText } from '../../../components/ui/BalanceText';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { KroniText } from '../../../components/ui/Text';
import type { TodayTask } from '@kroni/shared';
import 'react-native-get-random-values';

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

const formatNok = (ore: number) =>
  new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(ore / 100);

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
  onComplete: (completionId: string) => void;
  isCompleting: boolean;
}

function TaskCard({ task, onComplete, isCompleting }: TaskCardProps) {
  const theme = useTheme();
  const s = theme.surface;
  const tx = theme.text;

  const scale = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);
  const [showOverlay, setShowOverlay] = useState(false);

  const isDone =
    task.status === 'completed_pending_approval' ||
    task.status === 'approved' ||
    task.status === 'rejected';

  const isPending = task.status === 'pending';

  function triggerSpringAndComplete() {
    if (!isPending || isCompleting) return;

    setShowOverlay(true);
    overlayOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 200 }),
    );

    // Spring sequence — kept as the heartbeat of the kid app, but the
    // displacement is toned down ~15% (0.96/1.04 vs the original 0.95/1.05).
    scale.value = withSequence(
      withSpring(0.96, { damping: 12, stiffness: 300 }),
      withSpring(1.04, { damping: 8, stiffness: 200 }),
      withSpring(1.0, { damping: 14, stiffness: 250 }),
    );

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setShowOverlay(false), 500);

    onComplete(task.completionId);
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
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

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={triggerSpringAndComplete}
        disabled={!isPending || isCompleting}
        activeOpacity={isPending ? 0.85 : 1}
        accessibilityRole="button"
        accessibilityLabel={task.title}
        accessibilityState={{ disabled: !isPending }}
        style={[
          styles.taskCard,
          {
            backgroundColor: surfaceBg,
            borderColor: surfaceBorder,
            opacity: task.status === 'rejected' ? 0.55 : 1,
          },
        ]}
      >
        {/* "Bra jobba!" overlay */}
        {showOverlay ? (
          <Animated.View
            style={[
              styles.overlay,
              { backgroundColor: theme.colors.gold[500] },
              overlayStyle,
            ]}
          >
            <KroniText
              variant="displayItalic"
              tone="primary"
              style={styles.overlayText}
            >
              {t('kid.todayScreen.completedOverlay')}
            </KroniText>
          </Animated.View>
        ) : null}

        <View style={styles.taskCardInner}>
          {/* Circular check stand-in — matches the website's PhoneMock dot. */}
          <View
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
          </View>

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
              {formatNok(task.rewardCents)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TodayScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

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
    refetch,
  } = useQuery({
    queryKey: ['kid', 'today'],
    queryFn: () => kidApi.getTodayTasks(),
  });

  const completeMutation = useMutation({
    mutationFn: ({ completionId }: { completionId: string }) =>
      kidApi.completeTask(completionId, generateIdempotencyKey()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['kid', 'today'] });
      void queryClient.invalidateQueries({ queryKey: ['kid', 'balance'] });
    },
  });

  const handleComplete = useCallback(
    (completionId: string) => {
      completeMutation.mutate({ completionId });
    },
    [completeMutation],
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
              {/* [REVIEW] */}
              I dag,{' '}
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
              {/* [REVIEW] */}
              Saldo
            </KroniText>
            <BalanceText
              amountOre={balance?.balanceCents ?? 0}
              large
              accessibilityLabel={`Saldo: ${balance?.balanceCents ?? 0} øre`}
            />
          </View>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <Spinner size={36} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <KroniText variant="body" tone="danger">
              {t('common.error')}
            </KroniText>
            <TouchableOpacity onPress={() => void refetch()} style={{ marginTop: 8 }}>
              <KroniText variant="body" tone="gold">
                {t('common.retry')}
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
                    isCompleting={completeMutation.isPending}
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
                    isCompleting={completeMutation.isPending}
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
  taskMid: { flex: 1, gap: 4 },
  taskTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.uiBold,
    letterSpacing: -0.2,
  },
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: 22,
  },
  overlayText: {
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  progressSection: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
});
