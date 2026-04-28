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
import { Plus, Gift } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import type { Reward } from '@kroni/shared';

const formatNok = (ore: number) =>
  new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(ore / 100);

function RewardRow({ reward }: { reward: Reward }) {
  const theme = useTheme();
  const router = useRouter();
  const tx = theme.text;

  return (
    <TouchableOpacity
      onPress={() => {
        void Haptics.selectionAsync();
        router.push(`/(parent)/rewards/${reward.id}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={reward.title}
      activeOpacity={0.8}
    >
      <Card style={styles.rewardCard}>
        <View style={[styles.iconWrap, { backgroundColor: theme.colors.gold[50] }]}>
          <Text style={styles.iconEmoji}>{reward.icon ?? '🎁'}</Text>
        </View>
        <View style={styles.rewardInfo}>
          <Text style={[styles.rewardTitle, { color: tx.primary }]} numberOfLines={1}>
            {reward.title}
          </Text>
          <Text style={[styles.rewardCost, { color: theme.colors.gold[500] }]}>
            {formatNok(reward.costCents)}
          </Text>
        </View>
        {!reward.active && <Badge label="Inaktiv" variant="warning" />}
        <Text style={[styles.chevron, { color: tx.secondary }]}>›</Text>
      </Card>
    </TouchableOpacity>
  );
}

export default function RewardsTab() {
  const theme = useTheme();
  const router = useRouter();
  const api = useParentApi();

  const { data: rewards, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent', 'rewards'],
    queryFn: () => api.getRewards(),
  });

  const handleAdd = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(parent)/rewards/new');
  }, [router]);

  const s = theme.surface;
  const tx = theme.text;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={[styles.header, { borderBottomColor: s.border }]}>
        <Text style={[styles.title, { color: tx.primary }]}>{t('parent.rewardsList.title')}</Text>
        <TouchableOpacity
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={t('parent.rewardsList.addReward')}
          style={[styles.addBtn, { backgroundColor: theme.colors.gold[500] }]}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
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
      ) : rewards && rewards.length === 0 ? (
        <EmptyState
          icon={Gift}
          title={t('parent.rewardsList.empty')}
          body={t('parent.rewardsList.emptyBody')}
          ctaLabel={t('parent.rewardsList.addReward')}
          onCta={handleAdd}
        />
      ) : (
        <FlashList
          data={rewards ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RewardRow reward={item} />}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 16 },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 22 },
  rewardInfo: { flex: 1 },
  rewardTitle: { fontSize: 16, fontWeight: '600' },
  rewardCost: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  chevron: { fontSize: 22, fontWeight: '300' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 16, fontWeight: '500' },
  retry: { fontSize: 15, fontWeight: '600' },
});
