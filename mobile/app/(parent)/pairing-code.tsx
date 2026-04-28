// [REVIEW] Norwegian copy — verify with native speaker
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Copy, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useParentApi } from '../../lib/useParentApi';
import { t } from '../../lib/i18n';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

const EXPIRY_SECONDS = 15 * 60; // 15 min

function formatCode(code: string): string {
  // Format as "### ###"
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  return code;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PairingCode() {
  const theme = useTheme();
  const router = useRouter();
  const api = useParentApi();
  const { kidId } = useLocalSearchParams<{ kidId: string }>();
  const s = theme.surface;
  const tx = theme.text;

  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      // Codes are tied to a specific pre-created kid; route guarantees kidId.
      if (!kidId) throw new Error('missing kidId');
      return api.generatePairingCode(kidId);
    },
    onSuccess: (data) => {
      setCode(data.code);
      // Clock-skew safe: anchor the countdown on the device clock at the
      // moment we received the response, capped at the known TTL. The
      // server's expiresAt is the wall-clock truth at the API boundary,
      // but a small drift between emulator/device and server can push the
      // diff past 15 min or below it. Computing from the local 'now' keeps
      // the user-facing timer honest.
      const expFromServer = new Date(data.expiresAt);
      const localExp = new Date(Date.now() + EXPIRY_SECONDS * 1000);
      // If the server thinks the code expires sooner than our cap (e.g.
      // because the request took more than a second), respect that.
      const exp =
        expFromServer.getTime() < localExp.getTime() ? expFromServer : localExp;
      const diff = Math.max(0, Math.floor((exp.getTime() - Date.now()) / 1000));
      setExpiresAt(exp);
      setSecondsLeft(diff);
    },
    onError: (err) => {
      console.log('[pairing-code] error', err);
    },
  });

  // Generate on mount
  useEffect(() => {
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!expiresAt) return;

    timerRef.current = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0) {
        clearInterval(timerRef.current!);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expiresAt]);

  const handleRegenerate = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    mutation.mutate();
  }, [mutation]);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const isExpired = secondsLeft === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      {/* Header */}
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
          {t('parent.pairingCode.title')}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={mutation.isPending}
            onRefresh={handleRegenerate}
            tintColor={theme.colors.gold[500]}
          />
        }
      >
        {mutation.isPending && !code ? (
          <View style={styles.center}>
            <Spinner size={40} />
            <Text style={[styles.generating, { color: tx.secondary }]}>
              {t('parent.pairingCode.generating')}
            </Text>
          </View>
        ) : (
          <>
            {/* Big code display */}
            <View style={[styles.codeCard, { backgroundColor: s.card, borderColor: s.border }]}>
              {code && !isExpired ? (
                <Text
                  style={[styles.codeText, { color: theme.colors.gold[500] }]}
                  accessibilityLabel={`Paringskode: ${code}`}
                >
                  {formatCode(code)}
                </Text>
              ) : (
                <Text style={[styles.codeExpired, { color: tx.secondary }]}>
                  {t('parent.pairingCode.expired')}
                </Text>
              )}

              {/* Countdown */}
              <View style={[styles.countdownRow, { backgroundColor: isExpired ? theme.colors.semantic.danger + '18' : theme.colors.gold[50] }]}>
                <Text style={[styles.countdown, { color: isExpired ? theme.colors.semantic.danger : theme.colors.gold[700] }]}>
                  {isExpired
                    ? t('parent.pairingCode.expired')
                    : t('parent.pairingCode.expiresIn', { time: formatCountdown(secondsLeft) })}
                </Text>
              </View>
            </View>

            {/* Instructions */}
            <Text style={[styles.instructions, { color: tx.secondary }]}>
              {t('parent.pairingCode.instructions')}
            </Text>

            {/* Actions */}
            <View style={styles.actions}>
              {code && !isExpired ? (
                <TouchableOpacity
                  onPress={handleCopy}
                  style={[styles.copyBtn, { backgroundColor: s.card, borderColor: s.border }]}
                  accessibilityRole="button"
                  accessibilityLabel={t('parent.pairingCode.copy')}
                >
                  <Copy size={18} color={tx.primary} strokeWidth={2} />
                  <Text style={[styles.copyLabel, { color: tx.primary }]}>
                    {copied ? t('parent.pairingCode.copied') : t('parent.pairingCode.copy')}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={handleRegenerate}
                style={[styles.regenBtn, { backgroundColor: theme.colors.gold[500] }]}
                accessibilityRole="button"
                accessibilityLabel={t('parent.pairingCode.regenerate')}
              >
                <RefreshCw size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.regenLabel}>
                  {t('parent.pairingCode.regenerate')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
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
  content: {
    padding: 24,
    gap: 24,
    alignItems: 'stretch',
    flexGrow: 1,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: 200 },
  generating: { fontSize: 16 },
  codeCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 0,
    overflow: 'hidden',
    gap: 24,
  },
  codeText: {
    // Large monospace "### ###" display
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: 8,
    fontVariant: ['tabular-nums'],
  },
  codeExpired: {
    fontSize: 24,
    fontWeight: '600',
  },
  countdownRow: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  countdown: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  instructions: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    minHeight: 44,
  },
  copyLabel: { fontSize: 16, fontWeight: '600' },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    minHeight: 44,
  },
  regenLabel: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
