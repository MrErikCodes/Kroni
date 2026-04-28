// [REVIEW] Norwegian copy — verify with native speaker
import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { formatClerkError } from '../../lib/clerkErrors';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { KroniText } from '../../components/ui/Text';

export default function ParentSignIn() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    setError(null);
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(parent)/(tabs)/kids');
      }
    } catch (err: unknown) {
      const message = formatClerkError(err);
      setError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, setActive, email, password, router]);

  const s = theme.surface;

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
              {/* [REVIEW] */}
              Logg inn
            </KroniText>
            <View style={styles.headlineRow}>
              <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
                {/* [REVIEW] */}
                Velkommen{' '}
              </KroniText>
              <KroniText
                variant="displayItalic"
                tone="gold"
                style={[styles.headline, { fontFamily: fonts.displayItalic }]}
              >
                {/* [REVIEW] */}
                hjem
              </KroniText>
              <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
                .
              </KroniText>
            </View>
            <KroniText variant="body" tone="secondary" style={styles.subtitle}>
              {t('auth.parent.welcomeBack')}
            </KroniText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: theme.colors.semantic.danger + '14' },
                ]}
              >
                <KroniText variant="small" tone="danger">
                  {error}
                </KroniText>
              </View>
            ) : null}

            <View style={styles.field}>
              <KroniText variant="caption" tone="tertiary" style={styles.label}>
                {t('auth.parent.email')}
              </KroniText>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="hei@eksempel.no"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel={t('auth.parent.email')}
              />
            </View>

            <View style={styles.field}>
              <KroniText variant="caption" tone="tertiary" style={styles.label}>
                {t('auth.parent.password')}
              </KroniText>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                accessibilityLabel={t('auth.parent.password')}
              />
            </View>

            <Button
              label={loading ? t('common.loading') : t('auth.parent.signIn')}
              onPress={handleSignIn}
              loading={loading}
              disabled={!email || !password}
              size="sm"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <KroniText variant="small" tone="secondary">
              {t('auth.parent.noAccount')}
            </KroniText>
            <TouchableOpacity
              onPress={() => router.push('/auth/parent-sign-up')}
              accessibilityRole="link"
              accessibilityLabel={t('auth.parent.signUp')}
            >
              <KroniText variant="small" tone="gold" style={styles.link}>
                {' '}
                {t('auth.parent.signUp')}
              </KroniText>
            </TouchableOpacity>
          </View>
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
    paddingTop: 48,
    paddingBottom: 32,
    justifyContent: 'center',
    gap: 32,
  },
  header: {
    gap: 12,
  },
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
  subtitle: { marginTop: 4, lineHeight: 24 },
  form: {
    gap: 18,
  },
  field: {
    gap: 8,
  },
  label: {
    letterSpacing: 1.6,
  },
  errorBox: {
    borderRadius: 12,
    padding: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    textDecorationLine: 'underline',
  },
});
