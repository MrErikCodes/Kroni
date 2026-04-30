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
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Plus, CheckSquare, ListChecks } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { KroniText } from '../../../components/ui/Text';
import { KidPickerSheet } from '../../../components/parent/KidPickerSheet';
import type { LoggableTask, LogTaskCompletionRequest, Task } from '@kroni/shared';

const formatNok = (ore: number) =>
  new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(ore / 100);

const RECURRENCE_LABEL = () => ({
  daily: t('parent.tasksList.recurrenceDaily'),
  weekly: t('parent.tasksList.recurrenceWeekly'),
  once: t('parent.tasksList.recurrenceOnce'),
});

function generateIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function TaskRow({ task }: { task: Task }) {
  const theme = useTheme();
  const router = useRouter();
  const tx = theme.text;

  return (
    <TouchableOpacity
      onPress={() => {
        void Haptics.selectionAsync();
        router.push(`/(parent)/tasks/${task.id}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={task.title}
      activeOpacity={0.8}
    >
      <Card style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, { color: tx.primary }]} numberOfLines={1}>
            {task.title}
          </Text>
          <Text style={[styles.taskReward, { color: theme.colors.gold[500] }]}>
            {formatNok(task.rewardCents)}
          </Text>
        </View>
        <View style={styles.taskMeta}>
          <Badge
            label={RECURRENCE_LABEL()[task.recurrence] ?? task.recurrence}
            variant="default"
          />
          {!task.active && <Badge label={t('parent.tasksList.inactive')} variant="warning" />}
          {task.requiresApproval && (
            <Badge label={t('parent.tasksList.approval')} variant="info" />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function TasksTab() {
  const theme = useTheme();
  const router = useRouter();
  const api = useParentApi();
  const queryClient = useQueryClient();

  const [logMode, setLogMode] = useState(false);
  const [pickerTask, setPickerTask] = useState<LoggableTask | null>(null);
  const [confirmation, setConfirmation] = useState<{ taskId: string; names: string } | null>(null);
  const [logError, setLogError] = useState<string | null>(null);

  const { data: tasks, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent', 'tasks'],
    queryFn: () => api.getTasks(),
  });

  const {
    data: loggableTasks,
    isLoading: isLoggableLoading,
    refetch: refetchLoggable,
  } = useQuery({
    queryKey: ['parent', 'tasks', 'loggable'],
    queryFn: () => api.getLoggableTasks(),
    enabled: logMode,
  });

  const logMutation = useMutation({
    mutationFn: (input: { taskId: string; kidIds: string[] }) =>
      api.logTaskCompletion(input.taskId, {
        kidIds: input.kidIds as LogTaskCompletionRequest['kidIds'],
        idempotencyKey: generateIdempotencyKey() as LogTaskCompletionRequest['idempotencyKey'],
      }),
    onSuccess: (result, vars) => {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPickerTask(null);
      setLogError(null);
      if (result.credited.length > 0) {
        const names = (loggableTasks ?? [])
          .find((tt) => tt.taskId === vars.taskId)
          ?.eligibleKids
          .filter((k) => result.credited.some((c) => c.kidId === k.kidId))
          .map((k) => k.name)
          .join(', ');
        if (names) {
          setConfirmation({ taskId: vars.taskId, names });
          setTimeout(
            () =>
              setConfirmation((prev) => (prev?.taskId === vars.taskId ? null : prev)),
            1500,
          );
        }
      }
      if (result.skipped.length > 0 && result.credited.length === 0) {
        const taskBeingLogged = (loggableTasks ?? []).find(
          (tt) => tt.taskId === vars.taskId,
        );
        const firstSkippedKidId = result.skipped[0]?.kidId;
        const skippedName =
          taskBeingLogged?.eligibleKids.find((k) => k.kidId === firstSkippedKidId)?.name ??
          '';
        setLogError(t('parent.tasksList.logErrorAlreadyDone', { name: skippedName }));
      }
      void queryClient.invalidateQueries({ queryKey: ['parent', 'tasks', 'loggable'] });
      void queryClient.invalidateQueries({ queryKey: ['parent', 'kids'] });
      void queryClient.invalidateQueries({ queryKey: ['parent', 'approvals'] });
    },
    onError: () => {
      setLogError(t('parent.tasksList.logErrorGeneric'));
    },
  });

  const handleAdd = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(parent)/tasks/new');
  }, [router]);

  const s = theme.surface;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <KroniText variant="eyebrow" tone="gold">
            {t('parent.tasksList.eyebrow')}
          </KroniText>
          <View style={styles.headlineRow}>
            {logMode ? (
              <>
                <KroniText variant="display" tone="primary" style={styles.headline}>
                  {t('parent.tasksList.logModeHeadlineA')}{' '}
                </KroniText>
                <KroniText
                  variant="displayItalic"
                  tone="gold"
                  style={[styles.headline, { fontFamily: fonts.displayItalic }]}
                >
                  {t('parent.tasksList.logModeHeadlineB')}
                </KroniText>
                <KroniText variant="display" tone="primary" style={styles.headline}>
                  ?
                </KroniText>
              </>
            ) : (
              <>
                <KroniText variant="display" tone="primary" style={styles.headline}>
                  {t('parent.tasksList.headlineA')}{' '}
                </KroniText>
                <KroniText
                  variant="displayItalic"
                  tone="gold"
                  style={[styles.headline, { fontFamily: fonts.displayItalic }]}
                >
                  {t('parent.tasksList.headlineB')}
                </KroniText>
                <KroniText variant="display" tone="primary" style={styles.headline}>
                  ?
                </KroniText>
              </>
            )}
          </View>
        </View>
        {logMode ? (
          <TouchableOpacity
            onPress={() => {
              void Haptics.selectionAsync();
              setLogMode(false);
              setLogError(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('parent.tasksList.logModeExit')}
            style={[styles.iconBtn, { borderColor: theme.surface.border }]}
            activeOpacity={0.85}
          >
            <KroniText variant="body" tone="primary">
              {t('parent.tasksList.logModeExit')}
            </KroniText>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtnRow}>
            <TouchableOpacity
              onPress={() => {
                void Haptics.selectionAsync();
                setLogMode(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('parent.tasksList.logMode')}
              style={[styles.iconBtn, { borderColor: theme.surface.border }]}
              activeOpacity={0.85}
            >
              <ListChecks size={20} color={theme.text.primary} strokeWidth={1.75} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              accessibilityRole="button"
              accessibilityLabel={t('parent.tasksList.addTask')}
              style={[styles.addBtn, { backgroundColor: theme.colors.gold[500] }]}
              activeOpacity={0.85}
            >
              <Plus size={20} color={theme.colors.sand[900]} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {logMode ? (
        isLoggableLoading ? (
          <View style={styles.center}>
            <Spinner />
          </View>
        ) : (loggableTasks ?? []).length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={t('parent.tasksList.logModeEmpty')}
          />
        ) : (
          <FlashList
            data={loggableTasks ?? []}
            keyExtractor={(item) => item.taskId}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  void Haptics.selectionAsync();
                  const eligibleNonDone = item.eligibleKids.filter(
                    (k) => !k.alreadyCompletedToday,
                  );
                  if (eligibleNonDone.length === 1) {
                    logMutation.mutate({
                      taskId: item.taskId,
                      kidIds: [eligibleNonDone[0]!.kidId],
                    });
                    return;
                  }
                  setPickerTask(item);
                }}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                activeOpacity={0.8}
              >
                <Card
                  style={[
                    styles.taskCard,
                    styles.logCard,
                    { borderLeftColor: theme.colors.gold[300] },
                  ]}
                >
                  <View style={styles.taskHeader}>
                    <Text
                      style={[styles.taskTitle, { color: theme.text.primary }]}
                      numberOfLines={1}
                    >
                      {item.icon ? `${item.icon} ` : ''}
                      {item.title}
                    </Text>
                    <Text style={[styles.taskReward, { color: theme.colors.gold[500] }]}>
                      {formatNok(item.rewardCents)}
                    </Text>
                  </View>
                  {confirmation?.taskId === item.taskId ? (
                    <KroniText
                      variant="caption"
                      style={{ color: theme.colors.semantic.success }}
                    >
                      {t('parent.tasksList.creditedFor', { names: confirmation.names })}
                    </KroniText>
                  ) : null}
                </Card>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={isLoggableLoading}
                onRefresh={() => void refetchLoggable()}
                tintColor={theme.colors.gold[500]}
              />
            }
          />
        )
      ) : isLoading ? (
        <View style={styles.center}>
          <Spinner />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.colors.semantic.danger }]}>
            {t('common.error')}
          </Text>
          <TouchableOpacity onPress={() => void refetch()}>
            <Text style={[styles.retry, { color: theme.colors.gold[500] }]}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : tasks && tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={t('parent.tasksList.empty')}
          body={t('parent.tasksList.emptyBody')}
          ctaLabel={t('parent.tasksList.addTask')}
          onCta={handleAdd}
        />
      ) : (
        <FlashList
          data={tasks ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskRow task={item} />}
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

      {logError ? (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: theme.colors.semantic.danger + '18' },
          ]}
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          <KroniText
            variant="small"
            style={{ color: theme.colors.semantic.danger, flex: 1 }}
          >
            {logError}
          </KroniText>
          <TouchableOpacity
            onPress={() => setLogError(null)}
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

      <KidPickerSheet
        task={pickerTask}
        onClose={() => setPickerTask(null)}
        onSubmit={(kidIds) => {
          if (!pickerTask) return;
          logMutation.mutate({ taskId: pickerTask.taskId, kidIds });
        }}
        isSubmitting={logMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  headerText: { flex: 1, gap: 8 },
  headlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  headline: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.7,
  },
  headerBtnRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 16 },
  taskCard: { padding: 16, marginBottom: 10, gap: 10 },
  logCard: {
    borderLeftWidth: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  taskReward: { fontSize: 15, fontWeight: '700' },
  taskMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 16, fontWeight: '500' },
  retry: { fontSize: 15, fontWeight: '600' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 16,
  },
});
