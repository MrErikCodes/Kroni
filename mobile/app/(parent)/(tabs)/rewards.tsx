// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Plus, Gift } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { formatMoney } from '../../../lib/format';
import { useCurrency } from '../../../lib/useCurrency';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import { KroniText } from '../../../components/ui/Text';
import type { Reward } from '@kroni/shared';

function RewardRow({ reward }: { reward: Reward }) {
  const theme = useTheme();
  const router = useRouter();
  const tx = theme.text;
  const currency = useCurrency();

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
            {formatMoney(reward.costCents, currency)}
          </Text>
        </View>
        {!reward.active && <Badge label={t('parent.rewardsList.inactive')} variant="warning" />}
        <Text style={[styles.chevron, { color: tx.secondary }]}>›</Text>
      </Card>
    </TouchableOpacity>
  );
}

export default function RewardsTab() {
  const theme = useTheme();
  const router = useRouter();
  const api = useParentApi();
  const tabBarHeight = useBottomTabBarHeight();

  const { data: rewards, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent', 'rewards'],
    queryFn: () => api.getRewards(),
  });

  const handleAdd = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(parent)/rewards/new');
  }, [router]);

  const s = theme.surface;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <KroniText variant="eyebrow" tone="gold">
            {t('parent.rewardsList.eyebrow')}
          </KroniText>
          <View style={styles.headlineRow}>
            <KroniText variant="display" tone="primary" style={styles.headline}>
              {t('parent.rewardsList.headlineA')}{' '}
            </KroniText>
            <KroniText
              variant="displayItalic"
              tone="gold"
              style={[styles.headline, { fontFamily: fonts.displayItalic }]}
            >
              {t('parent.rewardsList.headlineB')}
            </KroniText>
            <KroniText variant="display" tone="primary" style={styles.headline}>
              .
            </KroniText>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={t('parent.rewardsList.addReward')}
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
          contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight + 16 }]}
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
