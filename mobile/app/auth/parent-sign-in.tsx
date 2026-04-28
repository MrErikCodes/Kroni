// [REVIEW] Norwegian copy — verify with native speaker
import { useEffect, useState, useCallback } from 'react';
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
import { useAuth, useSignIn } from '@clerk/clerk-expo';
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
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  // Already-signed-in guard. Without this Clerk throws 'You're already
  // signed in' when the user lands on the sign-in screen with a live
  // session (e.g. opens the app after a previous sign-in survived in
  // the secure-store token cache).
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace('/(parent)/(tabs)/kids');
    }
  }, [authLoaded, isSignedIn, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'twoFactor'>('credentials');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorStrategy, setTwoFactorStrategy] = useState<
    'totp' | 'phone_code' | 'backup_code' | 'email_code'
  >('totp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async () => {
    console.log('[sign-in] press', { isLoaded, hasSignIn: !!signIn, email });
    if (!isLoaded) {
      setError('Klar om litt — appen laster fortsatt.');
      return;
    }
    if (!signIn) {
      setError('Innlogging er ikke tilgjengelig. Prøv igjen.');
      return;
    }
    setError(null);
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });
      console.log('[sign-in] result.status', result.status);
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(parent)/(tabs)/kids');
        return;
      }
      if (result.status === 'needs_second_factor') {
        const supported = result.supportedSecondFactors ?? [];
        console.log(
          '[sign-in] supportedSecondFactors',
          supported.map((f) => f.strategy),
        );
        const totp = supported.find((f) => f.strategy === 'totp');
        const phone = supported.find((f) => f.strategy === 'phone_code');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emailFactor = supported.find((f: any) => f.strategy === 'email_code') as
          | { strategy: 'email_code'; emailAddressId: string }
          | undefined;
        const backup = supported.find((f) => f.strategy === 'backup_code');
        if (totp) {
          setTwoFactorStrategy('totp');
          setStep('twoFactor');
        } else if (phone) {
          setTwoFactorStrategy('phone_code');
          await signIn.prepareSecondFactor({
            strategy: 'phone_code',
            phoneNumberId: phone.phoneNumberId,
          });
          setStep('twoFactor');
        } else if (emailFactor) {
          setTwoFactorStrategy('email_code');
          await signIn.prepareSecondFactor({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            strategy: 'email_code' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            emailAddressId: emailFactor.emailAddressId,
          } as any);
          setStep('twoFactor');
        } else if (backup) {
          setTwoFactorStrategy('backup_code');
          setStep('twoFactor');
        } else {
          const names = supported.map((f) => f.strategy).join(', ') || 'ingen';
          setError(`Ingen støttet to-faktor-metode (${names}).`);
        }
        return;
      }
      setError(`Status: ${result.status}. Prøv på nytt eller kontakt støtte.`);
    } catch (err: unknown) {
      console.log('[sign-in] error', err);
      const message = formatClerkError(err);
      setError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, setActive, email, password, router]);

  const handleTwoFactor = useCallback(async () => {
    if (!isLoaded || !signIn) return;
    setError(null);
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await signIn.attemptSecondFactor({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        strategy: twoFactorStrategy as any,
        code: twoFactorCode.trim(),
      });
      console.log('[sign-in:2fa] result.status', result.status);
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(parent)/(tabs)/kids');
        return;
      }
      setError(`Status: ${result.status}. Prøv koden på nytt.`);
    } catch (err: unknown) {
      console.log('[sign-in:2fa] error', err);
      setError(formatClerkError(err));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, setActive, twoFactorStrategy, twoFactorCode, router]);

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

            {step === 'credentials' ? (
              <>
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
              </>
            ) : (
              <>
                <KroniText variant="body" tone="secondary">
                  {twoFactorStrategy === 'totp'
                    ? 'Skriv inn 6-sifret kode fra autentiseringsappen din.'
                    : twoFactorStrategy === 'phone_code'
                      ? 'Vi sendte en kode til telefonen din. Skriv den inn under.'
                      : twoFactorStrategy === 'email_code'
                        ? 'Vi sendte en kode til e-posten din. Skriv den inn under.'
                        : 'Skriv inn en av reservekodene dine.'}
                </KroniText>
                <View style={styles.field}>
                  <KroniText variant="caption" tone="tertiary" style={styles.label}>
                    Kode
                  </KroniText>
                  <Input
                    value={twoFactorCode}
                    onChangeText={setTwoFactorCode}
                    placeholder="123456"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    maxLength={8}
                    accessibilityLabel="6-sifret kode"
                  />
                </View>
                <Button
                  label={loading ? t('common.loading') : 'Bekreft'}
                  onPress={handleTwoFactor}
                  loading={loading}
                  disabled={twoFactorCode.length < 6}
                  size="sm"
                />
                <TouchableOpacity
                  onPress={() => {
                    setStep('credentials');
                    setTwoFactorCode('');
                    setError(null);
                  }}
                  accessibilityRole="button"
                >
                  <KroniText variant="small" tone="secondary">
                    Bytt konto
                  </KroniText>
                </TouchableOpacity>
              </>
            )}
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
