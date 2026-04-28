// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { UpdateRewardSchema } from '@kroni/shared';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Spinner } from '../../../components/ui/Spinner';

type FormValues = z.infer<typeof UpdateRewardSchema>;

export default function RewardDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const api = useParentApi();
  const queryClient = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

  const { data: reward, isLoading } = useQuery({
    queryKey: ['parent', 'rewards', id],
    queryFn: () => api.getRewards().then((rs) => rs.find((r) => r.id === id)),
    enabled: !!id,
  });

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(UpdateRewardSchema),
    values: reward
      ? {
          title: reward.title,
          costCents: reward.costCents,
          active: reward.active,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => api.updateReward(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['parent', 'rewards'] });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteReward(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['parent', 'rewards'] });
      router.back();
    },
  });

  const onSubmit = useCallback(
    handleSubmit((data) => updateMutation.mutate(data)),
    [handleSubmit, updateMutation],
  );

  const handleDelete = useCallback(() => {
    Alert.alert(t('parent.rewardDetail.delete'), t('parent.rewardDetail.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          deleteMutation.mutate();
        },
      },
    ]);
  }, [deleteMutation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            {t('parent.rewardDetail.title')}
          </Text>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel={t('parent.rewardDetail.delete')}
          >
            <Trash2 size={20} color={theme.colors.semantic.danger} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <Spinner />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.field}>
              <Label>{t('parent.rewardNew.titleLabel')}</Label>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value ?? ''}
                    onChangeText={onChange}
                    accessibilityLabel={t('parent.rewardNew.titleLabel')}
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Label>{/* [REVIEW] */}Kostnad (kr)</Label>
              <Controller
                control={control}
                name="costCents"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value !== undefined ? String(value / 100) : ''}
                    onChangeText={(v) => onChange(v ? Math.round(parseFloat(v) * 100) : 0)}
                    keyboardType="decimal-pad"
                    accessibilityLabel="Kostnad"
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Controller
                control={control}
                name="active"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    onPress={() => onChange(!value)}
                    style={[styles.toggle, { borderColor: s.border, backgroundColor: s.card }]}
                    accessibilityRole="checkbox"
                    accessibilityLabel={/* [REVIEW] */'Aktiv'}
                    accessibilityState={{ checked: value }}
                  >
                    <View style={[styles.checkbox, { borderColor: value ? theme.colors.gold[500] : s.border }]}>
                      {value ? <View style={[styles.checkFill, { backgroundColor: theme.colors.gold[500] }]} /> : null}
                    </View>
                    <Text style={[styles.toggleLabel, { color: tx.primary }]}>
                      {/* [REVIEW] */}Aktiv
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <Button
              label={updateMutation.isPending ? t('common.loading') : t('parent.rewardDetail.save')}
              onPress={onSubmit}
              loading={updateMutation.isPending}
              size="sm"
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
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
  content: { padding: 20, gap: 20 },
  field: { gap: 8 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
  },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkFill: { width: 12, height: 12, borderRadius: 3 },
  toggleLabel: { fontSize: 15, fontWeight: '500' },
});
