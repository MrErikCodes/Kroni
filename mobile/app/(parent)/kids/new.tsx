// [REVIEW] Norwegian copy — verify with native speaker
import { useMemo } from 'react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateKidSchema, type CreateKidInput } from '@kroni/shared';
import * as Haptics from 'expo-haptics';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

// Use the input type (before defaults are applied) for useForm
type FormValues = CreateKidInput;

const AVATAR_KEYS = [
  'fox', 'bear', 'rabbit', 'owl', 'penguin', 'lion',
  'panda', 'cat', 'dog', 'unicorn', 'dragon', 'astronaut',
] as const;
type AvatarKey = typeof AVATAR_KEYS[number];

const AVATAR_EMOJI: Record<AvatarKey, string> = {
  fox: '🦊', bear: '🐻', rabbit: '🐰', owl: '🦉', penguin: '🐧',
  lion: '🦁', panda: '🐼', cat: '🐱', dog: '🐶', unicorn: '🦄',
  dragon: '🐲', astronaut: '🧑‍🚀',
};

export default function KidNew() {
  const theme = useTheme();
  const router = useRouter();
  const api = useParentApi();
  const queryClient = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(CreateKidSchema) as Resolver<FormValues>,
    defaultValues: {
      name: '',
      allowanceFrequency: 'none',
      allowanceCents: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      // Default new-kid creation flow: a non-zero amount → weekly on Monday.
      // The dedicated allowance modal on the detail screen lets the parent
      // pick frequency/day once the kid exists.
      const cents = data.allowanceCents ?? 0;
      if (cents > 0) {
        return api.createKid({
          ...data,
          allowanceFrequency: 'weekly',
          allowanceCents: cents,
          allowanceDayOfWeek: 1,
          allowanceDayOfMonth: null,
        });
      }
      return api.createKid({
        ...data,
        allowanceFrequency: 'none',
        allowanceCents: 0,
        allowanceDayOfWeek: null,
        allowanceDayOfMonth: null,
      });
    },
    onSuccess: (kid) => {
      void queryClient.invalidateQueries({ queryKey: ['parent', 'kids'] });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/(parent)/kids/${kid.id}`);
    },
    onError: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const onSubmit = useMemo(
    () => handleSubmit((data) => mutation.mutate(data)),
    [handleSubmit, mutation],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: s.border }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color={tx.primary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tx.primary }]}>
            {t('parent.kidNew.title')}
          </Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {mutation.isError ? (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.semantic.danger + '18' }]}>
              <Text style={[styles.errorText, { color: theme.colors.semantic.danger }]}>
                {mutation.error instanceof Error ? mutation.error.message : t('common.error')}
              </Text>
            </View>
          ) : null}

          {/* Name */}
          <View style={styles.field}>
            <Label>{t('parent.kidNew.nameLabel')}</Label>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder={t('parent.kidNew.namePlaceholder')}
                  autoCapitalize="words"
                  accessibilityLabel={t('parent.kidNew.nameLabel')}
                />
              )}
            />
            {errors.name ? (
              <Text style={[styles.fieldError, { color: theme.colors.semantic.danger }]}>
                {errors.name.message}
              </Text>
            ) : null}
          </View>

          {/* Birth year */}
          <View style={styles.field}>
            <Label>{t('parent.kidNew.birthYearLabel')}</Label>
            <Controller
              control={control}
              name="birthYear"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value !== undefined ? String(value) : ''}
                  onChangeText={(v) => onChange(v ? parseInt(v, 10) : undefined)}
                  placeholder={t('parent.kidNew.birthYearPlaceholder')}
                  keyboardType="number-pad"
                  accessibilityLabel={t('parent.kidNew.birthYearLabel')}
                />
              )}
            />
          </View>

          {/* Lommepenger (kr/uke). Frequency picker lives on the kid detail
              screen so the create flow stays minimal. */}
          <View style={styles.field}>
            <Label>{t('parent.kidNew.allowanceLabel')}</Label>
            <Controller
              control={control}
              name="allowanceCents"
              render={({ field: { onChange, value } }) => (
                <Input
                  value={value !== undefined ? String(Math.round(value / 100)) : '0'}
                  onChangeText={(v) => onChange(v ? Math.round(parseFloat(v) * 100) : 0)}
                  placeholder={t('parent.kidNew.allowancePlaceholder')}
                  keyboardType="decimal-pad"
                  accessibilityLabel={t('parent.kidNew.allowanceLabel')}
                />
              )}
            />
          </View>

          {/* Avatar */}
          <View style={styles.field}>
            <Label>{t('parent.kidNew.avatarLabel')}</Label>
            <Controller
              control={control}
              name="avatarKey"
              render={({ field: { onChange, value } }) => (
                <View style={styles.avatarGrid}>
                  {AVATAR_KEYS.map((key) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => onChange(key)}
                      style={[
                        styles.avatarPill,
                        {
                          backgroundColor: value === key ? theme.colors.gold[500] : s.card,
                          borderColor: value === key ? theme.colors.gold[500] : s.border,
                        },
                      ]}
                      accessibilityRole="radio"
                      accessibilityLabel={key}
                      accessibilityState={{ selected: value === key }}
                    >
                      <Text style={styles.avatarEmoji}>{AVATAR_EMOJI[key]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          <Button
            label={mutation.isPending ? t('parent.kidNew.creating') : t('parent.kidNew.create')}
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
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' },
  content: { padding: 20, gap: 20 },
  field: { gap: 8 },
  errorBox: { borderRadius: 12, padding: 12 },
  errorText: { fontSize: 14, fontWeight: '500' },
  fieldError: { fontSize: 13 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  avatarPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
});
