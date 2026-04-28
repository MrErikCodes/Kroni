// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateRewardSchema, type CreateRewardInput } from '@kroni/shared';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

// Use input type (before defaults) for useForm
type FormValues = CreateRewardInput;

export default function RewardNew() {
  const theme = useTheme();
  const router = useRouter();
  const api = useParentApi();
  const queryClient = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

  const { data: kids } = useQuery({
    queryKey: ['parent', 'kids'],
    queryFn: () => api.getKids(),
  });

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(CreateRewardSchema) as Resolver<FormValues>,
    defaultValues: { title: '', costCents: 5000 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => api.createReward({ ...data, active: data.active ?? true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['parent', 'rewards'] });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
    onError: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const onSubmit = useCallback(
    handleSubmit((data) => mutation.mutate(data)),
    [handleSubmit, mutation],
  );

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
            {t('parent.rewardNew.title')}
          </Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {mutation.isError ? (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.semantic.danger + '18' }]}>
              <Text style={[styles.errorText, { color: theme.colors.semantic.danger }]}>
                {mutation.error instanceof Error ? mutation.error.message : t('common.error')}
              </Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Label>{t('parent.rewardNew.titleLabel')}</Label>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('parent.rewardNew.titlePlaceholder')}
                  accessibilityLabel={t('parent.rewardNew.titleLabel')}
                />
              )}
            />
            {errors.title ? (
              <Text style={[styles.fieldError, { color: theme.colors.semantic.danger }]}>
                {errors.title.message}
              </Text>
            ) : null}
          </View>

          {/* Cost in kr */}
          <View style={styles.field}>
            <Label>{/* [REVIEW] */}Kostnad (kr)</Label>
            <Controller
              control={control}
              name="costCents"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value !== undefined ? String(value / 100) : ''}
                  onChangeText={(v) => onChange(v ? Math.round(parseFloat(v) * 100) : 0)}
                  placeholder="50"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Kostnad"
                />
              )}
            />
          </View>

          {/* Assign to kid */}
          <View style={styles.field}>
            <Label>{t('parent.rewardNew.kidLabel')}</Label>
            <Controller
              control={control}
              name="kidId"
              render={({ field: { onChange, value } }) => (
                <View style={styles.kidPicker}>
                  <TouchableOpacity
                    onPress={() => onChange(null)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: !value ? theme.colors.gold[500] : s.card,
                        borderColor: s.border,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityLabel={t('parent.rewardNew.kidNone')}
                  >
                    <Text style={[styles.chipLabel, { color: !value ? '#FFFFFF' : tx.primary }]}>
                      {t('parent.rewardNew.kidNone')}
                    </Text>
                  </TouchableOpacity>
                  {(kids ?? []).map((kid) => (
                    <TouchableOpacity
                      key={kid.id}
                      onPress={() => onChange(kid.id)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: value === kid.id ? theme.colors.gold[500] : s.card,
                          borderColor: s.border,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityLabel={kid.name}
                    >
                      <Text style={[styles.chipLabel, { color: value === kid.id ? '#FFFFFF' : tx.primary }]}>
                        {kid.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          <Button
            label={mutation.isPending ? t('common.loading') : t('parent.rewardNew.create')}
            onPress={onSubmit}
            loading={mutation.isPending}
            size="sm"
          />
        </ScrollView>
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
  content: { padding: 20, gap: 20 },
  field: { gap: 8 },
  errorBox: { borderRadius: 12, padding: 12 },
  errorText: { fontSize: 14, fontWeight: '500' },
  fieldError: { fontSize: 13 },
  kidPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  chipLabel: { fontSize: 14, fontWeight: '500' },
});
