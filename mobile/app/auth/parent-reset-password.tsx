// [REVIEW] Norwegian copy — verify with native speaker
import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

export default function ParentResetPassword() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    setError(null);
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });
      setStep('confirm');
    } catch (err: unknown) {
      const message = formatClerkError(err) || t('auth.resetPassword.errorGeneric');
      setError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, email]);

  const handleConfirmReset = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    setError(null);
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password: newPassword,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(parent)/(tabs)/kids');
        return;
      }
      setError(t('auth.resetPassword.errorGeneric'));
    } catch (err: unknown) {
      const message = formatClerkError(err) || t('auth.resetPassword.errorGeneric');
      setError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, setActive, code, newPassword, router]);

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
          <View style={styles.header}>
            <KroniText variant="eyebrow" tone="gold">
              {t('auth.parentSignIn.eyebrow')}
            </KroniText>
            <View style={styles.headlineRow}>
              <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
                {t('auth.resetPassword.title')}
              </KroniText>
              <KroniText
                variant="displayItalic"
                tone="gold"
                style={[styles.headline, { fontFamily: fonts.displayItalic }]}
              >
                .
              </KroniText>
            </View>
          </View>

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

            {step === 'request' ? (
              <>
                <View style={styles.field}>
                  <KroniText variant="caption" tone="tertiary" style={styles.label}>
                    {t('auth.resetPassword.emailLabel')}
                  </KroniText>
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="hei@eksempel.no"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    accessibilityLabel={t('auth.resetPassword.emailLabel')}
                  />
                </View>

                <Button
                  label={loading ? t('common.loading') : t('auth.resetPassword.sendCode')}
                  onPress={handleSendCode}
                  loading={loading}
                  disabled={!email}
                  size="sm"
                />
              </>
            ) : (
              <>
                <View style={styles.field}>
                  <KroniText variant="caption" tone="tertiary" style={styles.label}>
                    {t('auth.resetPassword.codeLabel')}
                  </KroniText>
                  <Input
                    value={code}
                    onChangeText={setCode}
                    placeholder="123456"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    maxLength={6}
                    accessibilityLabel={t('auth.resetPassword.codeLabel')}
                  />
                </View>

                <View style={styles.field}>
                  <KroniText variant="caption" tone="tertiary" style={styles.label}>
                    {t('auth.resetPassword.newPasswordLabel')}
                  </KroniText>
                  <Input
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    autoComplete="new-password"
                    accessibilityLabel={t('auth.resetPassword.newPasswordLabel')}
                  />
                </View>

                <Button
                  label={loading ? t('common.loading') : t('auth.resetPassword.submit')}
                  onPress={handleConfirmReset}
                  loading={loading}
                  disabled={code.length < 6 || !newPassword}
                  size="sm"
                />
              </>
            )}
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
});
