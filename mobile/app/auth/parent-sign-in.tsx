// [REVIEW] Norwegian copy — verify with native speaker
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { Mail } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

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
      const message =
        err instanceof Error ? err.message : t('common.error');
      setError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signIn, setActive, email, password, router]);

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.logo, { color: theme.colors.gold[500] }]}>Kroni</Text>
            <Text style={[styles.title, { color: tx.primary }]}>
              {t('auth.parent.signIn')}
            </Text>
            <Text style={[styles.subtitle, { color: tx.secondary }]}>
              {t('auth.parent.welcomeBack')}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: theme.colors.semantic.danger + '18' }]}>
                <Text style={[styles.errorText, { color: theme.colors.semantic.danger }]}>
                  {error}
                </Text>
              </View>
            ) : null}

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
            <Text style={[styles.footerText, { color: tx.secondary }]}>
              {t('auth.parent.noAccount')}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/parent-sign-up')}
              accessibilityRole="link"
              accessibilityLabel={t('auth.parent.signUp')}
            >
              <Text style={[styles.link, { color: theme.colors.gold[500] }]}>
                {' '}{t('auth.parent.signUp')}
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
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
    marginBottom: 32,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorBox: {
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
