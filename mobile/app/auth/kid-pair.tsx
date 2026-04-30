// [REVIEW] Norwegian copy — verify with native speaker
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { useTheme, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { Button } from '../../components/ui/Button';
import { KroniText } from '../../components/ui/Text';
import { publicApi, ApiError } from '../../lib/api';
import { setKidToken } from '../../lib/auth';

const CODE_LENGTH = 6;

export default function KidPair() {
  const theme = useTheme();
  const router = useRouter();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const code = digits.join('');

  const handleDigit = useCallback((index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits]);

  const handleKeyPress = useCallback((index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((text: string) => {
    const chars = text.replace(/\D/g, '').slice(0, CODE_LENGTH).split('');
    const next = Array(CODE_LENGTH).fill('');
    chars.forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const lastFilled = Math.min(chars.length, CODE_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  }, []);

  // Deep-link receiver — accepts:
  //   • https://kroni.no/pair/<code>  (universal link, after AASA verifies)
  //   • kroni://pair?code=<code>      (custom-scheme fallback)
  // kroni.se / kroni.dk are NOT wired as deep-link hosts — only the
  // canonical .no domain is used so we have a single share surface.
  // Returns the 6-digit code if the URL matches, else null. We deliberately
  // *prefill* and require the kid to tap "pair" rather than auto-submitting
  // — the URL might've been opened accidentally and an unintended pair
  // would silently rotate the kid's session token.
  const extractPairingCode = useCallback((url: string | null): string | null => {
    if (!url) return null;
    try {
      const parsed = Linking.parse(url);
      // Custom scheme: kroni://pair?code=123456 → hostname='pair', queryParams.code
      const queryCode = parsed.queryParams?.['code'];
      if (typeof queryCode === 'string') {
        const digits = queryCode.replace(/\D/g, '').slice(0, CODE_LENGTH);
        if (digits.length === CODE_LENGTH) return digits;
      }
      // Universal link: https://kroni.no/pair/123456 → path='pair/123456'
      const path = parsed.path ?? '';
      const match = /(?:^|\/)pair\/(\d{6})\b/.exec(path);
      if (match?.[1]) return match[1];
    } catch {
      // Malformed URL — ignore.
    }
    return null;
  }, []);

  // Cold-start path: app launched from a deep link with no instance running.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const initial = await Linking.getInitialURL();
      if (cancelled) return;
      const code = extractPairingCode(initial);
      if (code) handlePaste(code);
    })();
    return () => {
      cancelled = true;
    };
  }, [extractPairingCode, handlePaste]);

  // Warm path: app already running and a deep link arrives.
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      const code = extractPairingCode(url);
      if (code) handlePaste(code);
    });
    return () => {
      sub.remove();
    };
  }, [extractPairingCode, handlePaste]);

  const handleConnect = useCallback(async () => {
    if (code.length < CODE_LENGTH) return;
    setError(null);
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Use a stable device ID from expo constants
    const deviceId: string =
      (Constants.expoConfig?.extra?.['eas']?.projectId as string | undefined) ??
      'unknown-device';

    try {
      const result = await publicApi.pair({ code, deviceId });
      // Token is stored in SecureStore — survives app restarts and OS reboots,
      // and the JWT itself is effectively permanent. The kid stays signed in
      // until a parent revokes by deleting the kid.
      await setKidToken(result.token);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(kid)/(tabs)/today');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('auth.kid.errorInvalidCode'));
      } else {
        setError(t('auth.kid.errorNetwork'));
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [code, router]);

  const s = theme.surface;
  const tx = theme.text;
  const borderColor = s.border;
  const activeBorder = theme.colors.gold[500];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Editorial header — eyebrow + serif headline with italic emphasis. */}
          <View style={styles.header}>
            <KroniText variant="eyebrow" tone="gold">
              {t('auth.kidPair.eyebrow')}
            </KroniText>
            <View style={styles.headlineRow}>
              <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
                {t('auth.kidPair.headlineA')}{' '}
              </KroniText>
              <KroniText
                variant="displayItalic"
                tone="gold"
                style={[styles.headline, { fontFamily: fonts.displayItalic }]}
              >
                {t('auth.kidPair.headlineB')}
              </KroniText>
              <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
                .
              </KroniText>
            </View>
            <KroniText variant="body" tone="secondary" style={styles.subtitle}>
              {t('auth.kid.enterCode')}
            </KroniText>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.semantic.danger + '18' }]}>
              <Text style={[styles.errorText, { color: theme.colors.semantic.danger }]}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* 6-digit code input */}
          <View style={styles.codeRow} accessibilityLabel={t('auth.kid.codeLabel')}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputRefs.current[i] = ref; }}
                value={digit}
                onChangeText={(v) => {
                  if (v.length > 1) {
                    handlePaste(v);
                  } else {
                    handleDigit(i, v);
                  }
                }}
                onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={6}
                selectTextOnFocus
                style={[
                  styles.digitBox,
                  {
                    backgroundColor: s.card,
                    borderColor: digit ? activeBorder : borderColor,
                    color: tx.primary,
                    fontFamily: fonts.display,
                    fontSize: 28,
                  },
                ]}
                accessibilityLabel={t('auth.kidPair.digitAccessibility', { n: String(i + 1) })}
              />
            ))}
          </View>

          {/* Connect button */}
          <Button
            label={loading ? t('auth.kid.connecting') : t('auth.kid.pairButton')}
            onPress={handleConnect}
            loading={loading}
            disabled={code.length < CODE_LENGTH}
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 24,
  },
  header: { alignItems: 'flex-start', gap: 10 },
  headlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  headline: {
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.0,
  },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 4 },
  errorBox: { borderRadius: 12, padding: 12 },
  errorText: { fontSize: 14, fontWeight: '500' },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  digitBox: {
    width: 48,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: 'center',
  },
});
