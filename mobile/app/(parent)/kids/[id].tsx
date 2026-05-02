// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import type { BalanceEntry, AllowanceFrequency, Kid } from '@kroni/shared';
import { nextPaymentDate as computeNextPaymentDate } from '@kroni/shared';
import { useTheme, fonts } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { formatMoney } from '../../../lib/format';
import { useCurrency } from '../../../lib/useCurrency';
import { ApiError } from '../../../lib/api';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { BalanceText } from '../../../components/ui/BalanceText';
import { KroniText } from '../../../components/ui/Text';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';

function formatRelativeDate(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diffDays === 0) return t('parent.kidDetail.today');
  if (diffDays === 1) return t('parent.kidDetail.yesterday');
  return t('parent.kidDetail.daysAgo', { count: diffDays });
}

const REASON_ICONS: Record<string, string> = {
  task: '✅',
  allowance: '💰',
  redemption: '🎁',
  adjustment: '✏️',
  gift: '🎉',
  reversal: '↩️',
};

type AdjustReason = 'adjustment' | 'gift' | 'reversal';
const ADJUST_REASONS: AdjustReason[] = ['adjustment', 'gift', 'reversal'];

// Convert a kroner string from the input field (e.g. "-50", "100") to øre.
// Returns null when the input is empty / not parseable. Negatives allowed.
function krToOre(input: string): number | null {
  const trimmed = input.trim().replace(/\s/g, '').replace(',', '.');
  if (trimmed === '' || trimmed === '-' || trimmed === '+') return null;
  if (!/^-?\d+(?:\.\d+)?$/.test(trimmed)) return null;
  const kr = Number(trimmed);
  if (!Number.isFinite(kr)) return null;
  return Math.round(kr * 100);
}

export default function KidDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const api = useParentApi();
  const queryClient = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;
  const currency = useCurrency();

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [allowanceOpen, setAllowanceOpen] = useState(false);

  const { data: kid, isLoading: kidLoading, isError } = useQuery({
    queryKey: ['parent', 'kids', id],
    queryFn: () => api.getKid(id),
    enabled: !!id,
  });

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['parent', 'kids', id, 'balance'],
    queryFn: () => api.getKidBalance(id),
    enabled: !!id,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['parent', 'kids', id, 'history'],
    queryFn: () => api.getKidHistory(id, 50),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteKid(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['parent', 'kids'] });
      router.back();
    },
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleDelete = useCallback(() => setDeleteOpen(true), []);
  const confirmDelete = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    deleteMutation.mutate();
    setDeleteOpen(false);
  }, [deleteMutation]);

  const handlePairingCode = useCallback(() => {
    router.push({ pathname: '/(parent)/pairing-code', params: { kidId: id } });
  }, [router, id]);

  const isLoading = kidLoading || balanceLoading;

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
          <Spinner size={36} />
        </View>
      ) : isError || !kid ? (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.semantic.danger }}>{t('common.error')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile band */}
          <View style={styles.profile}>
            <Avatar avatarKey={kid.avatarKey ?? 'bear'} size={80} />
            <KroniText variant="display" tone="primary" style={styles.name}>
              {kid.name}
            </KroniText>
            {kid.birthYear ? (
              <KroniText variant="small" tone="secondary">
                {t('parent.kidDetail.bornIn', { year: kid.birthYear })}
              </KroniText>
            ) : null}
          </View>

          {/* Saldo card */}
          <Card style={styles.bigCard}>
            <KroniText variant="eyebrow" tone="tertiary">
              {t('parent.kidDetail.balance')}
            </KroniText>
            <BalanceText
              amountOre={balance?.balanceCents ?? 0}
              large
              accessibilityLabel={`Saldo: ${formatMoney(balance?.balanceCents ?? 0, currency)}`}
            />
            <View style={styles.cardCta}>
              <Button
                label={t('parent.kidDetail.adjustBalance')}
                onPress={() => setAdjustOpen(true)}
                variant="secondary"
                size="sm"
              />
            </View>
          </Card>

          {/* Lommepenger card */}
          <Card style={styles.rowCard}>
            <View style={styles.rowCardInfo}>
              <KroniText variant="eyebrow" tone="tertiary">
                {t('parent.kidDetail.allowance')}
              </KroniText>
              <Text style={[styles.allowanceValue, { color: tx.primary }]}>
                {kid.allowanceFrequency !== 'none' && kid.allowanceCents > 0
                  ? `${formatMoney(kid.allowanceCents, currency)} · ${t(`parent.kidDetail.allowanceFrequencyLabel.${kid.allowanceFrequency}`)}`
                  : t('parent.kidDetail.allowanceOff')}
              </Text>
              <KroniText variant="caption" tone="secondary">
                {formatNextPaymentLine(kid)}
              </KroniText>
            </View>
            <Button
              label={t('parent.kidDetail.edit')}
              onPress={() => setAllowanceOpen(true)}
              variant="secondary"
              size="sm"
            />
          </Card>

          {/* Historikk */}
          <View style={styles.historySection}>
            <KroniText variant="eyebrow" tone="tertiary">
              {t('parent.kidDetail.history')}
            </KroniText>
            {historyLoading ? (
              <View style={styles.historyLoading}>
                <Spinner size={20} />
              </View>
            ) : (history ?? []).length === 0 ? (
              <Card style={styles.historyEmpty}>
                <KroniText variant="h2" tone="primary" style={styles.historyEmptyTitle}>
                  {t('parent.kidDetail.emptyHistoryTitle')}
                </KroniText>
                <KroniText variant="body" tone="secondary" style={styles.historyEmptyBody}>
                  {t('parent.kidDetail.emptyHistoryBody', { name: kid.name })}
                </KroniText>
              </Card>
            ) : (
              <Card style={styles.historyCard}>
                {(history ?? []).map((entry, idx) => (
                  <HistoryRow
                    key={entry.id}
                    entry={entry}
                    isLast={idx === (history ?? []).length - 1}
                  />
                ))}
              </Card>
            )}
          </View>

          {/* Generer paringskode — full-screen view shows code, copy,
              share-link, and regenerate. Co-parent invites live in
              Settings → Family (household-scoped, not kid-scoped). */}
          <Button
            label={t('parent.kidDetail.generatePairingCode')}
            onPress={handlePairingCode}
            variant="secondary"
            size="sm"
          />
        </ScrollView>
      )}

      {kid ? (
        <>
          <AdjustBalanceModal
            visible={adjustOpen}
            onClose={() => setAdjustOpen(false)}
            kidId={kid.id}
            currentBalanceCents={balance?.balanceCents ?? 0}
            onSaved={(newBalanceCents) => {
              queryClient.setQueryData(
                ['parent', 'kids', id, 'balance'],
                (prev: { balanceCents: number; weekEarnedCents: number; weekSpentCents: number } | undefined) =>
                  prev
                    ? { ...prev, balanceCents: newBalanceCents }
                    : { balanceCents: newBalanceCents, weekEarnedCents: 0, weekSpentCents: 0 },
              );
              void queryClient.invalidateQueries({ queryKey: ['parent', 'kids', id, 'balance'] });
              void queryClient.invalidateQueries({ queryKey: ['parent', 'kids', id, 'history'] });
            }}
          />
          <AllowanceModal
            visible={allowanceOpen}
            onClose={() => setAllowanceOpen(false)}
            kidId={kid.id}
            kid={kid}
            onSaved={() => {
              void queryClient.invalidateQueries({ queryKey: ['parent', 'kids', id] });
              void queryClient.invalidateQueries({ queryKey: ['parent', 'kids'] });
            }}
          />
        </>
      ) : null}

      <ConfirmDialog
        visible={deleteOpen}
        title={t('common.delete')}
        message={t('parent.kidDetail.deleteConfirm', { name: kid?.name ?? '' })}
        confirmLabel={t('common.delete')}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </SafeAreaView>
  );
}

// ── History row ──────────────────────────────────────────────────────────────

function HistoryRow({ entry, isLast }: { entry: BalanceEntry; isLast: boolean }) {
  const theme = useTheme();
  const tx = theme.text;
  const currency = useCurrency();
  const isPositive = entry.amountCents >= 0;
  return (
    <View
      style={[
        styles.historyRow,
        !isLast && {
          borderBottomColor: theme.surface.border,
          borderBottomWidth: 1,
        },
      ]}
    >
      <View style={[styles.historyIcon, { backgroundColor: theme.colors.gold[50] }]}>
        <Text style={styles.historyEmoji}>{REASON_ICONS[entry.reason] ?? '💸'}</Text>
      </View>
      <View style={styles.historyInfo}>
        {/* Title-first rendering — matches the kid's history screen so a
            parent recognises a task by name, not "Oppgave fullført". */}
        <Text style={[styles.historyReason, { color: tx.primary }]} numberOfLines={2}>
          {entry.referenceTitle ??
            t(`kid.balanceScreen.reasons.${entry.reason}`) ??
            entry.reason}
        </Text>
        <Text style={[styles.historyDate, { color: tx.secondary }]}>
          {formatRelativeDate(entry.createdAt)}
        </Text>
        {entry.note ? (
          <Text style={[styles.historyNote, { color: tx.secondary }]} numberOfLines={2}>
            {entry.note}
          </Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.historyAmount,
          {
            color: isPositive
              ? theme.colors.semantic.success
              : theme.colors.semantic.danger,
          },
        ]}
      >
        {formatMoney(entry.amountCents, currency, { signed: true })}
      </Text>
    </View>
  );
}

// ── Adjust balance modal ─────────────────────────────────────────────────────

interface AdjustBalanceModalProps {
  visible: boolean;
  onClose: () => void;
  kidId: string;
  currentBalanceCents: number;
  onSaved: (newBalanceCents: number) => void;
}

function AdjustBalanceModal({
  visible,
  onClose,
  kidId,
  currentBalanceCents,
  onSaved,
}: AdjustBalanceModalProps) {
  const theme = useTheme();
  const tx = theme.text;
  const api = useParentApi();
  const currency = useCurrency();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState<AdjustReason>('adjustment');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setAmount('');
    setReason('adjustment');
    setNote('');
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const mutation = useMutation({
    mutationFn: (input: { amountCents: number; reason: AdjustReason; note?: string }) =>
      api.adjustKidBalance({
        kidId,
        amountCents: input.amountCents,
        reason: input.reason,
        note: input.note,
      }),
    onSuccess: (result) => {
      onSaved(result.newBalanceCents);
      reset();
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.status === 409) {
        setError(t('parent.kidDetail.adjustModal.errorInsufficient'));
        return;
      }
      if (err instanceof ApiError && err.problem.detail) {
        setError(err.problem.detail);
        return;
      }
      setError(t('parent.kidDetail.adjustModal.errorGeneric'));
    },
  });

  const handleSubmit = useCallback(() => {
    setError(null);
    const ore = krToOre(amount);
    if (ore === null) {
      setError(t('parent.kidDetail.adjustModal.errorAmountInvalid'));
      return;
    }
    if (ore === 0) {
      setError(t('parent.kidDetail.adjustModal.errorAmountZero'));
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mutation.mutate({
      amountCents: ore,
      reason,
      note: note.trim() === '' ? undefined : note.trim(),
    });
  }, [amount, mutation, note, reason]);

  const previewOre = krToOre(amount);
  const previewNew = previewOre !== null ? currentBalanceCents + previewOre : null;

  return (
    <Modal visible={visible} onClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent}>
          <KroniText variant="display" tone="primary" style={styles.modalTitle}>
            {t('parent.kidDetail.adjustModal.title')}
          </KroniText>

          <View style={styles.modalField}>
            <Label>{t('parent.kidDetail.adjustModal.amountLabel')}</Label>
            <Input
              value={amount}
              onChangeText={setAmount}
              keyboardType="numbers-and-punctuation"
              placeholder="0"
              autoFocus
            />
            <KroniText variant="caption" tone="secondary" style={styles.helpText}>
              {t('parent.kidDetail.adjustModal.amountHelp')}
            </KroniText>
            {previewNew !== null ? (
              <KroniText variant="small" tone="tertiary" style={styles.helpText}>
                {`${formatMoney(currentBalanceCents, currency)} → ${formatMoney(previewNew, currency)}`}
              </KroniText>
            ) : null}
          </View>

          <View style={styles.modalField}>
            <Label>{t('parent.kidDetail.adjustModal.reasonLabel')}</Label>
            <View style={styles.reasonRow}>
              {ADJUST_REASONS.map((r) => {
                const selected = reason === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setReason(r)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    style={[
                      styles.reasonChip,
                      {
                        borderColor: selected
                          ? theme.colors.gold[500]
                          : theme.surface.border,
                        backgroundColor: selected
                          ? theme.colors.gold[50]
                          : theme.surface.card,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reasonChipText,
                        { color: selected ? theme.colors.gold[700] : tx.primary },
                      ]}
                    >
                      {t(`parent.kidDetail.adjustModal.reasons.${r}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.modalField}>
            <Label>{t('parent.kidDetail.adjustModal.noteLabel')}</Label>
            <Input
              value={note}
              onChangeText={(value) => {
                if (value.length <= 500) setNote(value);
              }}
              placeholder={t('parent.kidDetail.adjustModal.notePlaceholder')}
              multiline
              numberOfLines={3}
              maxLength={500}
              style={styles.noteInput}
            />
          </View>

          {error ? (
            <KroniText variant="small" tone="danger" style={styles.errorText}>
              {error}
            </KroniText>
          ) : null}

          <View style={styles.modalActions}>
            <View style={styles.modalActionBtn}>
              <Button
                label={t('parent.kidDetail.adjustModal.cancel')}
                onPress={handleClose}
                variant="ghost"
                size="sm"
              />
            </View>
            <View style={styles.modalActionBtn}>
              <Button
                label={t('parent.kidDetail.adjustModal.save')}
                onPress={handleSubmit}
                variant="primary"
                size="sm"
                loading={mutation.isPending}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Allowance modal ──────────────────────────────────────────────────────────

const FREQUENCY_OPTIONS: AllowanceFrequency[] = ['none', 'weekly', 'biweekly', 'monthly'];
// dayOfWeek convention: 0 = Sun … 6 = Sat. We render Mon → Sun for nb-NO.
const DOW_ORDER: { value: number; key: string }[] = [
  { value: 1, key: 'mon' },
  { value: 2, key: 'tue' },
  { value: 3, key: 'wed' },
  { value: 4, key: 'thu' },
  { value: 5, key: 'fri' },
  { value: 6, key: 'sat' },
  { value: 0, key: 'sun' },
];
const DOM_OPTIONS: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

interface AllowanceModalProps {
  visible: boolean;
  onClose: () => void;
  kidId: string;
  kid: Kid;
  onSaved: () => void;
}

function AllowanceModal({
  visible,
  onClose,
  kidId,
  kid,
  onSaved,
}: AllowanceModalProps) {
  const theme = useTheme();
  const tx = theme.text;
  const api = useParentApi();
  const [frequency, setFrequency] = useState<AllowanceFrequency>(kid.allowanceFrequency);
  const [amount, setAmount] = useState(
    String(Math.round((kid.allowanceCents ?? 0) / 100)),
  );
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(kid.allowanceDayOfWeek);
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(kid.allowanceDayOfMonth);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setFrequency(kid.allowanceFrequency);
    setAmount(String(Math.round((kid.allowanceCents ?? 0) / 100)));
    setDayOfWeek(kid.allowanceDayOfWeek);
    setDayOfMonth(kid.allowanceDayOfMonth);
    setError(null);
  }, [kid.allowanceFrequency, kid.allowanceCents, kid.allowanceDayOfWeek, kid.allowanceDayOfMonth]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  // Refresh local state when the kid's persisted values change between opens.
  useMemo(() => {
    if (visible) reset();
  }, [visible, reset]);

  const mutation = useMutation({
    mutationFn: (input: {
      allowanceFrequency: AllowanceFrequency;
      allowanceCents: number;
      allowanceDayOfWeek: number | null;
      allowanceDayOfMonth: number | null;
    }) => api.updateKid(kidId, input),
    onSuccess: () => {
      onSaved();
      setError(null);
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.problem.detail) {
        setError(err.problem.detail);
        return;
      }
      setError(t('parent.kidDetail.allowanceModal.errorGeneric'));
    },
  });

  const handleFrequencyChange = useCallback((next: AllowanceFrequency) => {
    setFrequency(next);
    if (next === 'none') {
      setDayOfWeek(null);
      setDayOfMonth(null);
    } else if (next === 'weekly' || next === 'biweekly') {
      setDayOfMonth(null);
      // Default to Monday if not set.
      setDayOfWeek((prev) => (prev === null ? 1 : prev));
    } else if (next === 'monthly') {
      setDayOfWeek(null);
      setDayOfMonth((prev) => (prev === null ? 1 : prev));
    }
  }, []);

  const handleSubmit = useCallback(() => {
    setError(null);
    const ore = krToOre(amount);
    if (ore === null || ore < 0) {
      setError(t('parent.kidDetail.allowanceModal.errorInvalid'));
      return;
    }
    if ((frequency === 'weekly' || frequency === 'biweekly') && dayOfWeek === null) {
      setError(t('parent.kidDetail.allowanceModal.errorMissingDayOfWeek'));
      return;
    }
    if (frequency === 'monthly' && dayOfMonth === null) {
      setError(t('parent.kidDetail.allowanceModal.errorMissingDayOfMonth'));
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mutation.mutate({
      allowanceFrequency: frequency,
      allowanceCents: ore,
      allowanceDayOfWeek: frequency === 'weekly' || frequency === 'biweekly' ? dayOfWeek : null,
      allowanceDayOfMonth: frequency === 'monthly' ? dayOfMonth : null,
    });
  }, [amount, frequency, dayOfWeek, dayOfMonth, mutation]);

  return (
    <Modal visible={visible} onClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent}>
          <KroniText variant="display" tone="primary" style={styles.modalTitle}>
            {t('parent.kidDetail.allowanceModal.title')}
          </KroniText>

          {/* Frequency */}
          <View style={styles.modalField}>
            <Label>{t('parent.kidDetail.allowanceModal.frequencyLabel')}</Label>
            <View style={styles.reasonRow}>
              {FREQUENCY_OPTIONS.map((opt) => {
                const selected = frequency === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => handleFrequencyChange(opt)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    style={[
                      styles.reasonChip,
                      {
                        borderColor: selected ? theme.colors.gold[500] : theme.surface.border,
                        backgroundColor: selected ? theme.colors.gold[50] : theme.surface.card,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reasonChipText,
                        { color: selected ? theme.colors.gold[700] : tx.primary },
                      ]}
                    >
                      {t(`parent.kidDetail.allowanceModal.frequency.${opt}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Day of week (weekly/biweekly) */}
          {(frequency === 'weekly' || frequency === 'biweekly') ? (
            <View style={styles.modalField}>
              <Label>{t('parent.kidDetail.allowanceModal.dayOfWeekLabel')}</Label>
              <View style={styles.reasonRow}>
                {DOW_ORDER.map(({ value, key }) => {
                  const selected = dayOfWeek === value;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setDayOfWeek(value)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[
                        styles.reasonChip,
                        {
                          borderColor: selected ? theme.colors.gold[500] : theme.surface.border,
                          backgroundColor: selected ? theme.colors.gold[50] : theme.surface.card,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.reasonChipText,
                          { color: selected ? theme.colors.gold[700] : tx.primary },
                        ]}
                      >
                        {t(`parent.kidDetail.allowanceModal.dayOfWeek.${key}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Day of month (monthly) */}
          {frequency === 'monthly' ? (
            <View style={styles.modalField}>
              <Label>{t('parent.kidDetail.allowanceModal.dayOfMonthLabel')}</Label>
              <View style={styles.domGrid}>
                {DOM_OPTIONS.map((d) => {
                  const selected = dayOfMonth === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setDayOfMonth(d)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[
                        styles.domChip,
                        {
                          borderColor: selected ? theme.colors.gold[500] : theme.surface.border,
                          backgroundColor: selected ? theme.colors.gold[50] : theme.surface.card,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.reasonChipText,
                          { color: selected ? theme.colors.gold[700] : tx.primary },
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <KroniText variant="caption" tone="secondary" style={styles.helpText}>
                {t('parent.kidDetail.allowanceModal.dayOfMonthHelp')}
              </KroniText>
            </View>
          ) : null}

          {/* Amount */}
          <View style={styles.modalField}>
            <Label>{t('parent.kidDetail.allowanceModal.amountLabel')}</Label>
            <Input
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              placeholder="0"
            />
            <KroniText variant="caption" tone="secondary" style={styles.helpText}>
              {t('parent.kidDetail.allowanceModal.amountHelp')}
            </KroniText>
          </View>

          {error ? (
            <KroniText variant="small" tone="danger" style={styles.errorText}>
              {error}
            </KroniText>
          ) : null}

          <View style={styles.modalActions}>
            <View style={styles.modalActionBtn}>
              <Button
                label={t('parent.kidDetail.allowanceModal.cancel')}
                onPress={handleClose}
                variant="ghost"
                size="sm"
              />
            </View>
            <View style={styles.modalActionBtn}>
              <Button
                label={t('parent.kidDetail.allowanceModal.save')}
                onPress={handleSubmit}
                variant="primary"
                size="sm"
                loading={mutation.isPending}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatNextPaymentLine(kid: Kid): string {
  if (kid.allowanceFrequency === 'none') {
    return t('parent.kidDetail.nextPaymentNone');
  }
  const iso = computeNextPaymentDate({
    frequency: kid.allowanceFrequency,
    dayOfWeek: kid.allowanceDayOfWeek,
    dayOfMonth: kid.allowanceDayOfMonth,
    lastPaidAt: kid.allowanceLastPaidAt ? new Date(kid.allowanceLastPaidAt) : null,
  });
  if (!iso) return t('parent.kidDetail.nextPaymentNone');
  // Build a Date at noon local to avoid tz edge effects when formatting.
  const [y, m, d] = iso.split('-').map((s) => Number(s));
  const date = new Date(y!, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
  const formatted = new Intl.DateTimeFormat('nb-NO', {
    day: 'numeric',
    month: 'long',
  }).format(date);
  return t('parent.kidDetail.nextPayment', { date: formatted });
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontFamily: fonts.uiBold,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, gap: 20, alignItems: 'stretch' },
  profile: { alignItems: 'center', gap: 8 },
  name: { textAlign: 'center' },
  bigCard: {
    padding: 20,
    gap: 8,
    alignItems: 'flex-start',
  },
  cardCta: { marginTop: 12, alignSelf: 'flex-start' },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  rowCardInfo: { flex: 1, gap: 4 },
  allowanceValue: {
    fontSize: 18,
    fontFamily: fonts.uiBold,
    letterSpacing: -0.2,
  },
  historySection: { gap: 12 },
  historyLoading: { paddingVertical: 24, alignItems: 'center' },
  historyCard: { paddingVertical: 4 },
  historyEmpty: { padding: 24, gap: 6, alignItems: 'flex-start' },
  historyEmptyTitle: { marginTop: 4 },
  historyEmptyBody: {},
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyEmoji: { fontSize: 20 },
  historyInfo: { flex: 1, gap: 2 },
  historyReason: { fontSize: 15, fontFamily: fonts.uiBold },
  historyDate: { fontSize: 13 },
  historyNote: { fontSize: 12 },
  historyAmount: { fontSize: 16, fontFamily: fonts.uiBold },
  // Modal
  modalContent: { gap: 16 },
  modalTitle: { fontSize: 24, lineHeight: 28 },
  modalField: { gap: 4 },
  helpText: { marginTop: 4 },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  reasonRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  reasonChipText: { fontSize: 14, fontFamily: fonts.uiBold },
  domGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  domChip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { marginTop: 4 },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalActionBtn: { flex: 1 },
});
