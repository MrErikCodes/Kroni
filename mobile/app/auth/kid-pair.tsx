// [REVIEW] Norwegian copy — verify with native speaker
import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { useTheme } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { publicApi, ApiError } from '../../lib/api';
import { setKidToken } from '../../lib/auth';

const CODE_LENGTH = 6;
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

export default function KidPair() {
  const theme = useTheme();
  const router = useRouter();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey>('fox');
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

  const handleConnect = useCallback(async () => {
    if (code.length < CODE_LENGTH || !name.trim()) return;
    setError(null);
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Use a stable device ID from expo constants
    const deviceId: string =
      (Constants.expoConfig?.extra?.['eas']?.projectId as string | undefined) ??
      'unknown-device';

    try {
      const result = await publicApi.pair({
        code,
        name: name.trim(),
        avatarKey: selectedAvatar,
        deviceId,
      });
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
  }, [code, name, selectedAvatar, router]);

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.logo, { color: theme.colors.gold[500] }]}>Kroni</Text>
            <Text style={[styles.title, { color: tx.primary }]}>
              {t('auth.kid.pair')}
            </Text>
            <Text style={[styles.subtitle, { color: tx.secondary }]}>
              {t('auth.kid.enterCode')}
            </Text>
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
                    fontSize: 28,
                    fontWeight: '700',
                  },
                ]}
                accessibilityLabel={`Siffer ${i + 1}`}
              />
            ))}
          </View>

          {/* Name input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: tx.secondary }]}>
              {t('auth.kid.nameLabel')}
            </Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder={t('auth.kid.namePlaceholder')}
              autoCapitalize="words"
              accessibilityLabel={t('auth.kid.nameLabel')}
            />
          </View>

          {/* Avatar picker */}
          <View style={styles.avatarSection}>
            <Text style={[styles.label, { color: tx.secondary }]}>
              {t('auth.kid.avatarLabel')}
            </Text>
            <View style={styles.avatarGrid}>
              {AVATAR_KEYS.map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedAvatar(key)}
                  style={[
                    styles.avatarPill,
                    {
                      backgroundColor:
                        selectedAvatar === key
                          ? theme.colors.gold[500]
                          : s.card,
                      borderColor:
                        selectedAvatar === key ? theme.colors.gold[500] : borderColor,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityLabel={key}
                  accessibilityState={{ selected: selectedAvatar === key }}
                >
                  <Text style={styles.avatarEmoji}>{AVATAR_EMOJI[key]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Connect button */}
          <Button
            label={loading ? t('auth.kid.connecting') : t('auth.kid.pairButton')}
            onPress={handleConnect}
            loading={loading}
            disabled={code.length < CODE_LENGTH || !name.trim()}
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
  header: { alignItems: 'center' },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
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
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500' },
  avatarSection: { gap: 10 },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
