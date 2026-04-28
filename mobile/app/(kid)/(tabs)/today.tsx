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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { kidApi } from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { ProgressRing } from '../../../components/ui/ProgressRing';
import { BalanceText } from '../../../components/ui/BalanceText';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState } from '../../../components/ui/EmptyState';
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

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 10) return t('kid.todayScreen.greetingMorning', { name });
  if (hour < 17) return t('kid.todayScreen.greetingAfternoon', { name });
  return t('kid.todayScreen.greetingEvening', { name });
}

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

    // Spring animation: 1 → 0.95 → 1.05 → 1.0
    scale.value = withSequence(
      withSpring(0.95, { damping: 12, stiffness: 300 }),
      withSpring(1.05, { damping: 8, stiffness: 200 }),
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
    statusIcon = <Clock size={16} color={theme.colors.semantic.warning} strokeWidth={2} />;
    statusColor = theme.colors.semantic.warning;
    statusLabel = t('kid.todayScreen.waitingApproval');
  } else if (task.status === 'approved') {
    statusIcon = <CheckCircle size={16} color={theme.colors.semantic.success} strokeWidth={2} />;
    statusColor = theme.colors.semantic.success;
    statusLabel = t('kid.todayScreen.approved');
  } else if (task.status === 'rejected') {
    statusIcon = <XCircle size={16} color={theme.colors.semantic.danger} strokeWidth={2} />;
    statusColor = theme.colors.semantic.danger;
    statusLabel = t('kid.todayScreen.rejected');
  }

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
            backgroundColor: isDone ? s.card : theme.colors.gold[50],
            borderColor: isDone ? s.border : theme.colors.gold[300],
            opacity: task.status === 'rejected' ? 0.5 : 1,
          },
        ]}
      >
        {/* "Bra jobba!" overlay */}
        {showOverlay ? (
          <Animated.View style={[styles.overlay, overlayStyle]}>
            <Text style={styles.overlayText}>{t('kid.todayScreen.completedOverlay')}</Text>
          </Animated.View>
        ) : null}

        <View style={styles.taskCardInner}>
          <View style={styles.taskLeft}>
            <Text style={[styles.taskIcon, { fontSize: 32 }]}>
              {task.icon ?? '✅'}
            </Text>
          </View>
          <View style={styles.taskMid}>
            <Text
              style={[
                styles.taskTitle,
                { color: tx.primary, textDecorationLine: isDone ? 'line-through' : 'none' },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {statusLabel ? (
              <View style={styles.statusRow}>
                {statusIcon}
                <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.taskRight}>
            <Text style={[styles.taskReward, { color: theme.colors.gold[500] }]}>
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
    notifListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data?.kind === 'kroni.taskApproved') {
        const amount = typeof data.amountCents === 'number' ? data.amountCents : 0;
        router.push({ pathname: '/(kid)/celebrate', params: { amountCents: String(amount) } });
      }
    });
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

  const { data: tasks, isLoading, isError, refetch } = useQuery({
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

  const handleComplete = useCallback((completionId: string) => {
    completeMutation.mutate({ completionId });
  }, [completeMutation]);

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
        {/* Greeting + Balance */}
        <View style={styles.heroSection}>
          <Text style={[styles.greeting, { color: tx.secondary }]}>
            {me ? getGreeting(me.name) : t('kid.todayScreen.greetingAfternoon', { name: '…' })}
          </Text>
          <BalanceText
            amountOre={balance?.balanceCents ?? 0}
            large
            accessibilityLabel={`Saldo: ${balance?.balanceCents ?? 0} øre`}
          />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <Spinner size={36} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={{ color: theme.colors.semantic.danger }}>{t('common.error')}</Text>
            <TouchableOpacity onPress={() => void refetch()} style={{ marginTop: 8 }}>
              <Text style={{ color: theme.colors.gold[500] }}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : total === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title={t('kid.todayScreen.noTasks')}
            body={t('kid.todayScreen.noTasksBody')}
          />
        ) : (
          <>
            {/* Pending tasks */}
            {pending.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
                  {t('kid.todayScreen.pendingSection')}
                </Text>
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

            {/* Done tasks */}
            {done.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
                  {t('kid.todayScreen.doneSection')}
                </Text>
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

            {/* Progress ring */}
            <View style={styles.progressSection}>
              <ProgressRing value={progress} size={72} strokeWidth={7} />
              <Text style={[styles.progressLabel, { color: tx.secondary }]}>
                {t('kid.todayScreen.progressLabel', { done: doneCount, total })}
              </Text>
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
  heroSection: { alignItems: 'center', paddingVertical: 12, gap: 4 },
  greeting: { fontSize: 16, fontWeight: '500' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 200 },
  section: { gap: 10 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  taskCard: {
    borderRadius: 24,
    borderWidth: 2,
    minHeight: 80,
    overflow: 'hidden',
    position: 'relative',
  },
  taskCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    minHeight: 80,
  },
  taskLeft: { width: 44, alignItems: 'center' },
  taskIcon: {},
  taskMid: { flex: 1, gap: 4 },
  taskTitle: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusLabel: { fontSize: 13, fontWeight: '500' },
  taskRight: { alignItems: 'flex-end' },
  taskReward: { fontSize: 16, fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245,176,21,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: 22,
  },
  overlayText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressSection: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  progressLabel: { fontSize: 14, fontWeight: '500' },
});
