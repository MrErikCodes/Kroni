// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Trash2, Key } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';

const formatNok = (ore: number) =>
  new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(ore / 100);

export default function KidDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const api = useParentApi();
  const queryClient = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

  const { data: kid, isLoading, isError } = useQuery({
    queryKey: ['parent', 'kids', id],
    queryFn: () => api.getKid(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteKid(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['parent', 'kids'] });
      router.back();
    },
  });

  const handleDelete = useCallback(() => {
    Alert.alert(
      t('common.delete'),
      t('parent.kidDetail.deleteConfirm', { name: kid?.name ?? '' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            deleteMutation.mutate();
          },
        },
      ],
    );
  }, [kid, deleteMutation]);

  const handlePairingCode = useCallback(() => {
    router.push('/(parent)/pairing-code');
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: s.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={styles.headerBtn}
        >
          <ArrowLeft size={24} color={tx.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tx.primary }]}>
          {kid?.name ?? '…'}
        </Text>
        <TouchableOpacity
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={t('parent.kidDetail.deleteKid')}
          style={styles.headerBtn}
        >
          <Trash2 size={20} color={theme.colors.semantic.danger} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Spinner />
        </View>
      ) : isError || !kid ? (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.semantic.danger }}>{t('common.error')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile */}
          <View style={styles.profile}>
            <Avatar avatarKey={kid.avatarKey ?? 'bear'} size={80} />
            <Text style={[styles.name, { color: tx.primary }]}>{kid.name}</Text>
            {kid.birthYear ? (
              <Text style={[styles.sub, { color: tx.secondary }]}>
                {/* [REVIEW] */}
                Født {kid.birthYear}
              </Text>
            ) : null}
          </View>

          {/* Stats */}
          <Card style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: tx.secondary }]}>
                {t('parent.kidDetail.weeklyAllowance')}
              </Text>
              <Text style={[styles.statValue, { color: tx.primary }]}>
                {kid.weeklyAllowanceCents > 0
                  ? formatNok(kid.weeklyAllowanceCents) + ' / uke'
                  : '—'}
              </Text>
            </View>
          </Card>

          {/* Actions */}
          <Button
            label={/* [REVIEW] */ 'Generer paringskode'}
            onPress={handlePairingCode}
            variant="secondary"
            size="sm"
          />
        </ScrollView>
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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, gap: 20, alignItems: 'stretch' },
  profile: { alignItems: 'center', gap: 8 },
  name: { fontSize: 28, fontWeight: '700' },
  sub: { fontSize: 15 },
  statsCard: { padding: 16 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 15, fontWeight: '600' },
});
