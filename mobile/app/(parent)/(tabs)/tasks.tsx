// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Plus, CheckSquare } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { KroniText } from '../../../components/ui/Text';
import type { Task } from '@kroni/shared';

const formatNok = (ore: number) =>
  new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(ore / 100);

const RECURRENCE_LABEL: Record<string, string> = {
  daily: 'Daglig',
  weekly: 'Ukentlig',
  once: 'Én gang',
};

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
            label={RECURRENCE_LABEL[task.recurrence] ?? task.recurrence}
            variant="default"
          />
          {!task.active && <Badge label="Inaktiv" variant="warning" />}
          {task.requiresApproval && (
            <Badge label="Godkjenning" variant="info" />
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

  const { data: tasks, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent', 'tasks'],
    queryFn: () => api.getTasks(),
  });

  const handleAdd = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(parent)/tasks/new');
  }, [router]);

  const s = theme.surface;
  const tx = theme.text;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <KroniText variant="eyebrow" tone="gold">
            {/* [REVIEW] */}
            Oppgaver
          </KroniText>
          <View style={styles.headlineRow}>
            <KroniText variant="display" tone="primary" style={styles.headline}>
              {/* [REVIEW] */}
              Hva skal{' '}
            </KroniText>
            <KroniText
              variant="displayItalic"
              tone="gold"
              style={[styles.headline, { fontFamily: fonts.displayItalic }]}
            >
              {/* [REVIEW] */}
              gjøres
            </KroniText>
            <KroniText variant="display" tone="primary" style={styles.headline}>
              ?
            </KroniText>
          </View>
        </View>
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

      {isLoading ? (
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 16 },
  taskCard: { padding: 16, marginBottom: 10, gap: 10 },
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
});
