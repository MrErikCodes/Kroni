// [REVIEW] Norwegian copy — verify with native speaker
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts } from '../../lib/theme';
import { t, legalUrl } from '../../lib/i18n';
import { formatClerkError } from '../../lib/clerkErrors';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { KroniText } from '../../components/ui/Text';
import { ApiError, parentApi } from '../../lib/api';

const CODE_LENGTH = 6;

export default function ParentSignUp() {
  const theme = useTheme();
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const { getToken } = useAuth();

  console.log('[sign-up] render', {
    isLoaded,
    hasSignUp: !!signUp,
    status: signUp?.status,
    emailAddress: signUp?.emailAddress,
  });
  useEffect(() => {
    console.log('[sign-up] MOUNT');
    return () => console.log('[sign-up] UNMOUNT');
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend-code state. Cooldown ticks down once per second after a successful
  // resend so impatient users can't hammer Clerk's prepare endpoint.
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // Resume-verification on mount: if the user backgrounded the app (or
  // iOS killed it) between `signUp.create` and entering the email code,
  // Clerk's tokenCache rehydrates the in-progress SignUp resource. Without
  // this guard the user lands back on the empty form, has to re-enter
  // their password, and ends up with the dreaded "you're already
  // verifying" error or a duplicate signup attempt. We detect the pending
  // state via `signUp.status === 'missing_requirements'` + an unverified
  // email address and jump them straight to the code entry step. The
  // resend button below is wired to `signUp.prepareEmailAddressVerification`
  // so they can request a fresh code if the original expired.
  useEffect(() => {
    console.log('[sign-up] resume-effect', {
      isLoaded,
      hasSignUp: !!signUp,
      step,
      status: signUp?.status,
      emailAddress: signUp?.emailAddress,
      emailVerStatus: signUp?.verifications?.emailAddress?.status,
      unverifiedFields: signUp?.unverifiedFields,
    });
    if (!isLoaded || !signUp) return;
    if (step !== 'form') return;
    const pendingEmail = signUp.emailAddress ?? '';
    const emailUnverified =
      signUp.verifications?.emailAddress?.status === 'unverified';
    const unverifiedFields = signUp.unverifiedFields ?? [];
    const needsEmailVerify =
      emailUnverified || unverifiedFields.includes('email_address');
    if (
      pendingEmail &&
      signUp.status === 'missing_requirements' &&
      needsEmailVerify
    ) {
      console.log('[sign-up] resuming verify step', { pendingEmail });
      setEmail(pendingEmail);
      setStep('verify');
    }
  }, [isLoaded, signUp, step]);

  // Optional family-join code: when a parent has been invited by a co-parent,
  // they can paste the 6-digit code here. After Clerk verification we call
  // joinHousehold(code) before routing to the parent shell.
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [joinDigits, setJoinDigits] = useState<string[]>(
    Array(CODE_LENGTH).fill(''),
  );
  const joinInputRefs = useRef<(TextInput | null)[]>([]);
  const joinCode = joinDigits.join('');

  const handleJoinDigit = useCallback(
    (index: number, value: string) => {
      const char = value.replace(/\D/g, '').slice(-1);
      const next = [...joinDigits];
      next[index] = char;
      setJoinDigits(next);
      if (char && index < CODE_LENGTH - 1) {
        joinInputRefs.current[index + 1]?.focus();
      }
    },
    [joinDigits],
  );

  const handleJoinKeyPress = useCallback(
    (index: number, key: string) => {
      if (key === 'Backspace' && !joinDigits[index] && index > 0) {
        joinInputRefs.current[index - 1]?.focus();
      }
    },
    [joinDigits],
  );

  const handleJoinPaste = useCallback((text: string) => {
    const chars = text.replace(/\D/g, '').slice(0, CODE_LENGTH).split('');
    const next = Array(CODE_LENGTH).fill('');
    chars.forEach((c, i) => {
      next[i] = c;
    });
    setJoinDigits(next);
    const lastFilled = Math.min(chars.length, CODE_LENGTH - 1);
    joinInputRefs.current[lastFilled]?.focus();
  }, []);

  const handleSignUp = useCallback(async () => {
    console.log('[sign-up] handleSignUp press', { isLoaded, hasSignUp: !!signUp, email });
    if (!isLoaded || !signUp) return;
    setError(null);
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await signUp.create({ emailAddress: email.trim(), password });
      console.log('[sign-up] signUp.create OK', { status: signUp.status });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      console.log('[sign-up] prepare OK, switching to verify step');
      setStep('verify');
    } catch (err: unknown) {
      console.log('[sign-up] handleSignUp error', err);
      const message = formatClerkError(err);
      setError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, email, password]);

  const handleVerify = useCallback(async () => {
    console.log('[sign-up] handleVerify press', { hasSignUp: !!signUp, code: verificationCode });
    if (!isLoaded || !signUp) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });
      console.log('[sign-up] attemptEmail result', { status: result.status });
      if (result.status === 'complete') {
        console.log('[sign-up] setActive', { session: result.createdSessionId });
        await setActive({ session: result.createdSessionId });

        // If the user supplied a family join code, attempt to join the
        // household before routing. Failures show inline so the user can
        // either fix the code or proceed without joining.
        const trimmedJoinCode = joinCode.trim();
        if (showJoinCode && trimmedJoinCode.length === CODE_LENGTH) {
          try {
            const client = parentApi.clientFor(() => getToken());
            await client.joinHousehold(trimmedJoinCode);
          } catch (joinErr: unknown) {
            if (
              joinErr instanceof ApiError &&
              (joinErr.status === 401 || joinErr.status === 404 || joinErr.status === 410)
            ) {
              setError(t('parent.household.joinFlow.errorInvalid'));
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              return;
            }
            if (joinErr instanceof ApiError && joinErr.status === 409) {
              setError(t('parent.household.joinFlow.errorAlreadyJoined'));
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              return;
            }
            setError(t('common.error'));
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
          }
        }
        console.log('[sign-up] post-verify -> /(parent)/(tabs)/kids');
        router.replace('/(parent)/(tabs)/kids');
      }
    } catch (err: unknown) {
      console.log('[sign-up] handleVerify error', err);
      const message = formatClerkError(err);
      setError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, setActive, verificationCode, router, joinCode, showJoinCode, getToken]);

  const handleResendCode = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    if (resending || resendCooldown > 0) return;
    setError(null);
    setResendNotice(null);
    setResending(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setResendCooldown(30);
      setResendNotice(t('auth.parentSignUp.codeSent'));
    } catch (err: unknown) {
      setError(formatClerkError(err));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setResending(false);
    }
  }, [isLoaded, signUp, resending, resendCooldown]);

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
              {t('auth.parentSignUp.eyebrow')}
            </KroniText>
            <View style={styles.headlineRow}>
              <KroniText variant="displayLarge" tone="primary" style={styles.headlineText}>
                {t('auth.parentSignUp.headlineA')}{' '}
              </KroniText>
              <KroniText
                variant="displayItalic"
                tone="gold"
                style={[styles.headlineText, { fontFamily: fonts.displayItalic }]}
              >
                {t('auth.parentSignUp.headlineB')}
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

              {showJoinCode ? (
                <View style={styles.field}>
                  <Text style={[styles.label, { color: tx.secondary }]}>
                    {t('parent.household.joinFlow.codeInputLabel')}
                  </Text>
                  <View style={styles.codeRow}>
                    {joinDigits.map((digit, i) => (
                      <TextInput
                        key={i}
                        ref={(ref) => {
                          joinInputRefs.current[i] = ref;
                        }}
                        value={digit}
                        onChangeText={(v) => {
                          if (v.length > 1) {
                            handleJoinPaste(v);
                          } else {
                            handleJoinDigit(i, v);
                          }
                        }}
                        onKeyPress={({ nativeEvent }) =>
                          handleJoinKeyPress(i, nativeEvent.key)
                        }
                        keyboardType="number-pad"
                        maxLength={6}
                        selectTextOnFocus
                        style={[
                          styles.digitBox,
                          {
                            backgroundColor: s.card,
                            borderColor: digit
                              ? theme.colors.gold[500]
                              : s.border,
                            color: tx.primary,
                            fontFamily: fonts.display,
                          },
                        ]}
                        accessibilityLabel={`Familiekode siffer ${i + 1}`}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowJoinCode(true)}
                  accessibilityRole="link"
                  accessibilityLabel={t('parent.household.joinFlow.linkLabel')}
                  style={styles.joinLinkRow}
                >
                  <Text
                    style={[styles.joinLink, { color: theme.colors.gold[700] }]}
                  >
                    {t('parent.household.joinFlow.linkLabel')}
                  </Text>
                </TouchableOpacity>
              )}

              <Button
                label={loading ? t('common.loading') : t('auth.parent.signUp')}
                onPress={handleSignUp}
                loading={loading}
                disabled={!email || !password}
                size="sm"
              />

              <Text style={[styles.consent, { color: tx.secondary }]}>
                {t('auth.parent.consentPre')}{' '}
                <Text
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(legalUrl('vilkar'))}
                  style={[styles.consentLink, { color: theme.colors.gold[700] }]}
                >
                  {t('auth.parent.consentTerms')}
                </Text>{' '}
                {t('auth.parent.consentAnd')}{' '}
                <Text
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(legalUrl('personvern'))}
                  style={[styles.consentLink, { color: theme.colors.gold[700] }]}
                >
                  {t('auth.parent.consentPrivacy')}
                </Text>
                {t('auth.parent.consentDot')}
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={[styles.verifyText, { color: tx.secondary }]}>
                {t('auth.parentSignUp.verifyText', { email })}
              </Text>
              <View style={styles.field}>
                <Text style={[styles.label, { color: tx.secondary }]}>{t('auth.parentSignUp.verifyCodeLabel')}</Text>
                <Input
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="123456"
                  keyboardType="number-pad"
                  accessibilityLabel={t('auth.parentSignUp.verifyCodeAccessibility')}
                />
              </View>
              <Button
                label={loading ? t('common.loading') : t('common.confirm')}
                onPress={handleVerify}
                loading={loading}
                disabled={!verificationCode}
                size="sm"
              />
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resending || resendCooldown > 0}
                accessibilityRole="button"
                accessibilityLabel={t('auth.parentSignUp.resendCode')}
                style={styles.resendRow}
              >
                <Text
                  style={[
                    styles.resendLink,
                    {
                      color: theme.colors.gold[700],
                      opacity: resending || resendCooldown > 0 ? 0.5 : 1,
                    },
                  ]}
                >
                  {resending
                    ? t('auth.parentSignUp.resendingCode')
                    : resendCooldown > 0
                      ? t('auth.parentSignUp.resendCooldown', {
                          seconds: resendCooldown,
                        })
                      : t('auth.parentSignUp.resendCode')}
                </Text>
              </TouchableOpacity>
              {resendNotice ? (
                <Text style={[styles.resendNotice, { color: tx.secondary }]}>
                  {resendNotice}
                </Text>
              ) : null}
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
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  digitBox: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 24,
  },
  joinLinkRow: { paddingVertical: 4 },
  joinLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendNotice: {
    fontSize: 13,
    textAlign: 'center',
  },
  consent: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center',
  },
  consentLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
