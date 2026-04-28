// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Gift } from 'lucide-react-native';
import { useTheme, fonts } from '../../../lib/theme';
import { kidApi } from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { KroniText } from '../../../components/ui/Text';
import type { Reward } from '@kroni/shared';
import { ApiError } from '../../../lib/api';

const formatNok = (ore: number) =>
  new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(ore / 100);

interface RewardCardProps {
  reward: Reward;
  balanceCents: number;
  onRedeem: (reward: Reward) => void;
  isRedeeming: boolean;
}

function RewardCard({ reward, balanceCents, onRedeem, isRedeeming }: RewardCardProps) {
  const theme = useTheme();
  const s = theme.surface;
  const tx = theme.text;
  const canAfford = balanceCents >= reward.costCents;
  const needMore = reward.costCents - balanceCents;

  return (
    <TouchableOpacity
      onPress={() => canAfford && onRedeem(reward)}
      disabled={!canAfford || isRedeeming}
      activeOpacity={canAfford ? 0.8 : 1}
      accessibilityRole="button"
      accessibilityLabel={`${reward.title}: ${formatNok(reward.costCents)}`}
      accessibilityState={{ disabled: !canAfford }}
      style={[
        styles.card,
        {
          backgroundColor: canAfford ? theme.colors.gold[50] : s.card,
          borderColor: canAfford ? theme.colors.gold[300] : s.border,
          opacity: canAfford ? 1 : 0.75,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.iconEmoji}>{reward.icon ?? '🎁'}</Text>
      </View>
      <Text style={[styles.rewardTitle, { color: tx.primary }]} numberOfLines={2}>
        {reward.title}
      </Text>
      <Text style={[styles.rewardCost, { color: canAfford ? theme.colors.gold[500] : tx.secondary }]}>
        {formatNok(reward.costCents)}
      </Text>
      {!canAfford ? (
        <View style={[styles.needMoreBadge, { backgroundColor: s.background }]}>
          <Text style={[styles.needMoreText, { color: tx.secondary }]}>
            {t('kid.rewardsScreen.needMore', { amount: formatNok(needMore) })}
          </Text>
        </View>
      ) : (
        <View style={[styles.affordBadge, { backgroundColor: theme.colors.gold[500] }]}>
          <Text style={styles.affordText}>{t('kid.rewardsScreen.redeem')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function KidRewardsScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const { data: balance } = useQuery({
    queryKey: ['kid', 'balance'],
    queryFn: () => kidApi.getBalance(),
  });

  const { data: rewards, isLoading, isError, refetch } = useQuery({
    queryKey: ['kid', 'rewards'],
    queryFn: () => kidApi.getRewards(),
  });

  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) => kidApi.redeemReward(rewardId),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void queryClient.invalidateQueries({ queryKey: ['kid', 'balance'] });
      void queryClient.invalidateQueries({ queryKey: ['kid', 'rewards'] });
      setConfirmReward(null);
      setRedeemError(null);
      setSuccessOpen(true);
    },
    onError: async (err: unknown) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Surface the failure inline so the kid (and we) can see *why*
      // nothing happened — the previous silent-fail was the bug.
      if (err instanceof ApiError && err.status === 409) {
        setRedeemError(t('kid.rewardsScreen.errorInsufficient'));
      } else if (err instanceof ApiError && err.problem.detail) {
        setRedeemError(err.problem.detail);
      } else {
        setRedeemError(t('common.error'));
      }
    },
  });

  const handleRedeemPress = useCallback((reward: Reward) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRedeemError(null);
    setConfirmReward(reward);
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmReward) {
      setRedeemError(null);
      redeemMutation.mutate(confirmReward.id);
    }
  }, [confirmReward, redeemMutation]);

  const handleCloseConfirm = useCallback(() => {
    setConfirmReward(null);
    setRedeemError(null);
  }, []);

  const balanceCents = balance?.balanceCents ?? 0;
  const activeRewards = (rewards ?? []).filter((r) => r.active);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      {/* Editorial header — serif headline + balance pill aligned baseline. */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <KroniText variant="eyebrow" tone="gold">
            {t('kid.rewardsScreen.eyebrow')}
          </KroniText>
          <View style={styles.headlineRow}>
            <KroniText variant="display" tone="primary" style={styles.headline}>
              {t('kid.rewardsScreen.headlineA')}{' '}
            </KroniText>
            <KroniText
              variant="displayItalic"
              tone="gold"
              style={[styles.headline, { fontFamily: fonts.displayItalic }]}
            >
              {t('kid.rewardsScreen.headlineB')}
            </KroniText>
            <KroniText variant="display" tone="primary" style={styles.headline}>
              .
            </KroniText>
          </View>
        </View>
        <KroniText
          variant="mono"
          style={[styles.balanceSub, { color: theme.colors.gold[700] }]}
        >
          {formatNok(balanceCents)}
        </KroniText>
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
      ) : activeRewards.length === 0 ? (
        <EmptyState
          icon={Gift}
          title={t('kid.rewardsScreen.empty')}
          body={t('kid.rewardsScreen.emptyBody')}
        />
      ) : (
        <FlashList
          data={activeRewards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RewardCard
              reward={item}
              balanceCents={balanceCents}
              onRedeem={handleRedeemPress}
              isRedeeming={redeemMutation.isPending}
            />
          )}
          numColumns={2}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void refetch()}
              tintColor={theme.colors.gold[500]}
            />
          }
        />
      )}

      {/* Success confirmation — replaces native Alert. */}
      <Modal visible={successOpen} onClose={() => setSuccessOpen(false)}>
        <Text style={[styles.modalTitle, { color: tx.primary }]}>
          {t('kid.rewardsScreen.redeemed')}
        </Text>
        <View style={styles.modalActions}>
          <Button
            label={t('common.ok')}
            onPress={() => setSuccessOpen(false)}
            size="lg"
          />
        </View>
      </Modal>

      {/* Confirm modal */}
      <Modal
        visible={!!confirmReward}
        onClose={handleCloseConfirm}
      >
        <Text style={[styles.modalTitle, { color: tx.primary }]}>
          {t('kid.rewardsScreen.confirmRedeem', {
            title: confirmReward?.title ?? '',
            amount: formatNok(confirmReward?.costCents ?? 0),
          })}
        </Text>
        {redeemError ? (
          <View
            style={[
              styles.modalError,
              { backgroundColor: theme.colors.semantic.danger + '18' },
            ]}
          >
            <Text style={[styles.modalErrorText, { color: theme.colors.semantic.danger }]}>
              {redeemError}
            </Text>
          </View>
        ) : null}
        <View style={styles.modalActions}>
          <Button
            label={t('common.cancel')}
            onPress={handleCloseConfirm}
            variant="secondary"
          />
          <Button
            label={redeemMutation.isPending ? t('common.loading') : t('kid.rewardsScreen.redeem')}
            onPress={handleConfirm}
            loading={redeemMutation.isPending}
            size="lg"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
  balanceSub: {
    fontSize: 16,
    paddingBottom: 6,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  grid: { padding: 12 },
  card: {
    margin: 6,
    flex: 1,
    borderRadius: 24,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    minHeight: 180,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  iconEmoji: { fontSize: 28 },
  rewardTitle: { fontSize: 15, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  rewardCost: { fontSize: 17, fontWeight: '700' },
  needMoreBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  needMoreText: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  affordBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  affordText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  modalTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center', marginBottom: 20, lineHeight: 24 },
  modalError: { borderRadius: 12, padding: 12, marginBottom: 12 },
  modalErrorText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 12 },
});
