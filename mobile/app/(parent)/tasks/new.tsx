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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateTaskSchema, type CreateTaskInput } from '@kroni/shared';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

// Use input type (before defaults) for useForm
type FormValues = CreateTaskInput;

const RECURRENCE_OPTIONS = [
  { value: 'daily' as const, label: t('parent.taskNew.recurrence.daily') },
  { value: 'weekly' as const, label: t('parent.taskNew.recurrence.weekly') },
  { value: 'once' as const, label: t('parent.taskNew.recurrence.once') },
];

export default function TaskNew() {
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
    resolver: zodResolver(CreateTaskSchema) as Resolver<FormValues>,
    defaultValues: {
      title: '',
      recurrence: 'daily' as const,
      requiresApproval: true,
      active: true,
      rewardCents: 1000,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => api.createTask({
      ...data,
      requiresApproval: data.requiresApproval ?? true,
      active: data.active ?? true,
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['parent', 'tasks'] });
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
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={styles.headerBtn}
          >
            <ArrowLeft size={24} color={tx.primary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tx.primary }]}>
            {t('parent.taskNew.title')}
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

          {/* Title */}
          <View style={styles.field}>
            <Label>{t('parent.taskNew.titleLabel')}</Label>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('parent.taskNew.titlePlaceholder')}
                  accessibilityLabel={t('parent.taskNew.titleLabel')}
                />
              )}
            />
            {errors.title ? (
              <Text style={[styles.fieldError, { color: theme.colors.semantic.danger }]}>
                {errors.title.message}
              </Text>
            ) : null}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Label>{t('parent.taskNew.descLabel')}</Label>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value ?? ''}
                  onChangeText={onChange}
                  placeholder={t('parent.taskNew.descPlaceholder')}
                  multiline
                  numberOfLines={3}
                  style={styles.multiline}
                  accessibilityLabel={t('parent.taskNew.descLabel')}
                />
              )}
            />
          </View>

          {/* Reward (kr) */}
          <View style={styles.field}>
            <Label>{/* [REVIEW] */}Belønning (kr)</Label>
            <Controller
              control={control}
              name="rewardCents"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value !== undefined ? String(value / 100) : ''}
                  onChangeText={(v) => onChange(v ? Math.round(parseFloat(v) * 100) : 0)}
                  placeholder="10"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Belønning"
                />
              )}
            />
          </View>

          {/* Recurrence */}
          <View style={styles.field}>
            <Label>{t('parent.taskNew.recurrenceLabel')}</Label>
            <Controller
              control={control}
              name="recurrence"
              render={({ field: { onChange, value } }) => (
                <View style={styles.segmented}>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => onChange(opt.value)}
                      style={[
                        styles.segment,
                        {
                          backgroundColor: value === opt.value ? theme.colors.gold[500] : s.card,
                          borderColor: s.border,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityLabel={opt.label}
                      accessibilityState={{ selected: value === opt.value }}
                    >
                      <Text
                        style={[
                          styles.segmentLabel,
                          { color: value === opt.value ? '#FFFFFF' : tx.primary },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          {/* Assign to kid */}
          <View style={styles.field}>
            <Label>{t('parent.taskNew.kidLabel')}</Label>
            <Controller
              control={control}
              name="kidId"
              render={({ field: { onChange, value } }) => (
                <View style={styles.kidPicker}>
                  <TouchableOpacity
                    onPress={() => onChange(null)}
                    style={[
                      styles.segment,
                      {
                        backgroundColor: !value ? theme.colors.gold[500] : s.card,
                        borderColor: s.border,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityLabel={t('parent.taskNew.kidNone')}
                  >
                    <Text style={[styles.segmentLabel, { color: !value ? '#FFFFFF' : tx.primary }]}>
                      {t('parent.taskNew.kidNone')}
                    </Text>
                  </TouchableOpacity>
                  {(kids ?? []).map((kid) => (
                    <TouchableOpacity
                      key={kid.id}
                      onPress={() => onChange(kid.id)}
                      style={[
                        styles.segment,
                        {
                          backgroundColor: value === kid.id ? theme.colors.gold[500] : s.card,
                          borderColor: s.border,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityLabel={kid.name}
                    >
                      <Text style={[styles.segmentLabel, { color: value === kid.id ? '#FFFFFF' : tx.primary }]}>
                        {kid.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          {/* Requires approval */}
          <View style={styles.field}>
            <Controller
              control={control}
              name="requiresApproval"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  style={[styles.toggle, { borderColor: s.border, backgroundColor: s.card }]}
                  accessibilityRole="checkbox"
                  accessibilityLabel={t('parent.taskNew.requiresApproval')}
                  accessibilityState={{ checked: value }}
                >
                  <View style={[
                    styles.checkbox,
                    { borderColor: value ? theme.colors.gold[500] : s.border },
                  ]}>
                    {value ? (
                      <View style={[styles.checkFill, { backgroundColor: theme.colors.gold[500] }]} />
                    ) : null}
                  </View>
                  <Text style={[styles.toggleLabel, { color: tx.primary }]}>
                    {t('parent.taskNew.requiresApproval')}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <Button
            label={mutation.isPending ? t('common.loading') : t('parent.taskNew.create')}
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
  multiline: { height: 88, paddingTop: 12, textAlignVertical: 'top' },
  segmented: { flexDirection: 'row', gap: 8 },
  kidPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  segmentLabel: { fontSize: 14, fontWeight: '500' },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkFill: { width: 12, height: 12, borderRadius: 3 },
  toggleLabel: { fontSize: 15, fontWeight: '500' },
});
