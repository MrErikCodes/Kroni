// [REVIEW] Norwegian copy — verify with native speaker
import { useState, useCallback } from 'react';
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
import { useSignUp } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { formatClerkError } from '../../lib/clerkErrors';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { KroniText } from '../../components/ui/Text';

export default function ParentSignUp() {
  const theme = useTheme();
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    setError(null);
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err: unknown) {
      const message = formatClerkError(err);
      setError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, email, password]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
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
  }, [isLoaded, signUp, setActive, verificationCode, router]);

  const s = theme.surface;
  const tx = theme.text;

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
              {/* [REVIEW] */}
              Ny konto
            </KroniText>
            <View style={styles.headlineRow}>
              <KroniText variant="displayLarge" tone="primary" style={styles.headlineText}>
                {/* [REVIEW] */}
                Begynn{' '}
              </KroniText>
              <KroniText
                variant="displayItalic"
                tone="gold"
                style={[styles.headlineText, { fontFamily: fonts.displayItalic }]}
              >
                {/* [REVIEW] */}
                gratis
              </KroniText>
              <KroniText variant="displayLarge" tone="primary" style={styles.headlineText}>
                .
              </KroniText>
            </View>
            <KroniText variant="body" tone="secondary" style={styles.subtitle}>
              {t('auth.parent.createAccount')}
            </KroniText>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.semantic.danger + '18' }]}>
              <Text style={[styles.errorText, { color: theme.colors.semantic.danger }]}>
                {error}
              </Text>
            </View>
          ) : null}

          {step === 'form' ? (
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: tx.secondary }]}>
                  {t('auth.parent.email')}
                </Text>
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
                <Text style={[styles.label, { color: tx.secondary }]}>
                  {t('auth.parent.password')}
                </Text>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="new-password"
                  accessibilityLabel={t('auth.parent.password')}
                />
              </View>

              <Button
                label={loading ? t('common.loading') : t('auth.parent.signUp')}
                onPress={handleSignUp}
                loading={loading}
                disabled={!email || !password}
                size="sm"
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={[styles.verifyText, { color: tx.secondary }]}>
                {/* [REVIEW] */}
                Vi har sendt en bekreftelseskode til {email}. Skriv inn koden under.
              </Text>
              <View style={styles.field}>
                <Text style={[styles.label, { color: tx.secondary }]}>Bekreftelseskode</Text>
                <Input
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="123456"
                  keyboardType="number-pad"
                  accessibilityLabel="Bekreftelseskode"
                />
              </View>
              <Button
                label={loading ? t('common.loading') : t('common.confirm')}
                onPress={handleVerify}
                loading={loading}
                disabled={!verificationCode}
                size="sm"
              />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: tx.secondary }]}>
              {t('auth.parent.hasAccount')}
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/auth/parent-sign-in')}
              accessibilityRole="link"
              accessibilityLabel={t('auth.parent.signIn')}
            >
              <Text style={[styles.link, { color: theme.colors.gold[500] }]}>
                {' '}{t('auth.parent.signIn')}
              </Text>
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
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 10,
  },
  headlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  headlineText: {
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.0,
  },
  subtitle: { fontSize: 16, lineHeight: 24, marginTop: 4 },
  form: { gap: 16, marginBottom: 32 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500' },
  errorBox: { borderRadius: 12, padding: 12, marginBottom: 4 },
  errorText: { fontSize: 14, fontWeight: '500' },
  verifyText: { fontSize: 15, lineHeight: 22 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '600' },
});
