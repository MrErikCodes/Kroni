// [REVIEW] Norwegian copy — verify with native speaker
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { useParentApi } from '../../lib/useParentApi';
import { formatClerkError } from '../../lib/clerkErrors';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { KroniText } from '../../components/ui/Text';

export default function AccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const api = useParentApi();
  const qc = useQueryClient();
  const s = theme.surface;
  const tx = theme.text;

  const { data: me } = useQuery({
    queryKey: ['parent', 'me'],
    queryFn: () => api.getMe(),
    retry: false,
  });

  // Inline banner replaces native Alert popups. Auto-hides after 3.5s.
  const [banner, setBanner] = useState<
    { kind: 'success' | 'error'; message: string } | null
  >(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showBanner = useCallback(
    (kind: 'success' | 'error', message: string) => {
      setBanner({ kind, message });
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
      bannerTimer.current = setTimeout(() => setBanner(null), 3500);
    },
    [],
  );
  useEffect(() => {
    return () => {
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
    };
  }, []);

  // ── Name ──────────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
    }
  }, [user]);

  const nameMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('no user');
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      const display = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (display) {
        await api.updateMe({ displayName: display });
      }
      await Promise.all([
        qc.refetchQueries({ queryKey: ['parent', 'me'] }),
        qc.refetchQueries({ queryKey: ['parent', 'household'] }),
      ]);
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showBanner('success', t('parent.account.nameSaved'));
    },
    onError: async (err) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showBanner('error', formatClerkError(err));
    },
  });

  // ── Email ─────────────────────────────────────────────────────────────────
  const [newEmail, setNewEmail] = useState('');
  const [pendingEmailId, setPendingEmailId] = useState<string | null>(null);
  const [emailCode, setEmailCode] = useState('');

  const sendCodeMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('no user');
      const email = newEmail.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(t('parent.account.errorEmailInvalid'));
      }
      const created = await user.createEmailAddress({ email });
      await created.prepareVerification({ strategy: 'email_code' });
      return created.id;
    },
    onSuccess: async (id) => {
      setPendingEmailId(id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showBanner('success', t('parent.account.codeSent', { email: newEmail }));
    },
    onError: async (err) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showBanner('error', formatClerkError(err));
    },
  });

  const verifyEmailMut = useMutation({
    mutationFn: async () => {
      if (!user || !pendingEmailId) throw new Error('no pending');
      const target = user.emailAddresses.find((e) => e.id === pendingEmailId);
      if (!target) throw new Error('not found');
      await target.attemptVerification({ code: emailCode.trim() });
      await user.update({ primaryEmailAddressId: pendingEmailId });
      // Mirror to backend so emails / serializer agree.
      await api.updateMe({});
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['parent', 'me'] }),
        qc.invalidateQueries({ queryKey: ['parent', 'household'] }),
      ]);
    },
    onSuccess: async () => {
      setPendingEmailId(null);
      setNewEmail('');
      setEmailCode('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showBanner('success', t('parent.account.emailChanged'));
    },
    onError: async (err) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showBanner('error', formatClerkError(err));
    },
  });

  // ── Password ──────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('no user');
      if (newPassword.length < 8) {
        throw new Error(t('parent.account.errorPasswordTooShort'));
      }
      if (newPassword !== confirmPassword) {
        throw new Error(t('parent.account.errorPasswordsDontMatch'));
      }
      await user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: true,
      });
    },
    onSuccess: async () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showBanner('success', t('parent.account.passwordSaved'));
    },
    onError: async (err) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showBanner('error', formatClerkError(err));
    },
  });

  const handleBack = useCallback(() => router.back(), [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={[styles.header, { borderBottomColor: s.border }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ArrowLeft size={24} color={tx.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tx.primary }]}>
          {t('parent.account.title')}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      {banner ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor:
                banner.kind === 'success'
                  ? theme.colors.gold[50]
                  : theme.colors.semantic.danger + '18',
              borderColor:
                banner.kind === 'success'
                  ? theme.colors.gold[500]
                  : theme.colors.semantic.danger,
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          <Text
            style={[
              styles.bannerText,
              {
                color:
                  banner.kind === 'success'
                    ? theme.colors.gold[700]
                    : theme.colors.semantic.danger,
              },
            ]}
          >
            {banner.message}
          </Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <KroniText variant="caption" tone="tertiary" style={styles.sectionLabel}>
            {t('parent.account.nameSection')}
          </KroniText>
          <Card style={styles.cardPad}>
            <View style={styles.field}>
              <KroniText variant="caption" tone="tertiary" style={styles.label}>
                {t('parent.account.firstName')}
              </KroniText>
              <Input
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoComplete="name-given"
              />
            </View>
            <View style={styles.field}>
              <KroniText variant="caption" tone="tertiary" style={styles.label}>
                {t('parent.account.lastName')}
              </KroniText>
              <Input
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoComplete="name-family"
              />
            </View>
            <Button
              label={
                nameMut.isPending
                  ? t('common.loading')
                  : t('parent.account.saveName')
              }
              onPress={() => nameMut.mutate()}
              loading={nameMut.isPending}
              disabled={!firstName.trim()}
              size="sm"
            />
          </Card>

          {/* Email */}
          <KroniText variant="caption" tone="tertiary" style={styles.sectionLabel}>
            {t('parent.account.emailSection')}
          </KroniText>
          <Card style={styles.cardPad}>
            <View style={styles.field}>
              <KroniText variant="caption" tone="tertiary" style={styles.label}>
                {t('parent.account.currentEmail')}
              </KroniText>
              <Text style={[styles.staticValue, { color: tx.primary }]}>
                {user?.primaryEmailAddress?.emailAddress ?? '—'}
              </Text>
            </View>

            {pendingEmailId === null ? (
              <>
                <View style={styles.field}>
                  <KroniText variant="caption" tone="tertiary" style={styles.label}>
                    {t('parent.account.newEmail')}
                  </KroniText>
                  <Input
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder={t('parent.account.newEmailPlaceholder')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                <Button
                  label={
                    sendCodeMut.isPending
                      ? t('parent.account.sendingCode')
                      : t('parent.account.sendCode')
                  }
                  onPress={() => sendCodeMut.mutate()}
                  loading={sendCodeMut.isPending}
                  disabled={!newEmail.trim()}
                  size="sm"
                />
              </>
            ) : (
              <>
                <KroniText variant="small" tone="secondary" style={styles.help}>
                  {t('parent.account.codeSent', { email: newEmail })}
                </KroniText>
                <View style={styles.field}>
                  <KroniText variant="caption" tone="tertiary" style={styles.label}>
                    {t('parent.account.codeLabel')}
                  </KroniText>
                  <Input
                    value={emailCode}
                    onChangeText={setEmailCode}
                    placeholder={t('parent.account.codePlaceholder')}
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    maxLength={8}
                  />
                </View>
                <Button
                  label={
                    verifyEmailMut.isPending
                      ? t('common.loading')
                      : t('parent.account.confirmEmail')
                  }
                  onPress={() => verifyEmailMut.mutate()}
                  loading={verifyEmailMut.isPending}
                  disabled={emailCode.trim().length < 6}
                  size="sm"
                />
                <TouchableOpacity
                  onPress={() => {
                    setPendingEmailId(null);
                    setEmailCode('');
                  }}
                  accessibilityRole="button"
                  style={styles.linkRow}
                >
                  <KroniText variant="small" tone="secondary">
                    {t('common.cancel')}
                  </KroniText>
                </TouchableOpacity>
              </>
            )}
          </Card>

          {/* Password */}
          <KroniText variant="caption" tone="tertiary" style={styles.sectionLabel}>
            {t('parent.account.passwordSection')}
          </KroniText>
          <Card style={styles.cardPad}>
            <View style={styles.field}>
              <KroniText variant="caption" tone="tertiary" style={styles.label}>
                {t('parent.account.currentPassword')}
              </KroniText>
              <Input
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>
            <View style={styles.field}>
              <KroniText variant="caption" tone="tertiary" style={styles.label}>
                {t('parent.account.newPassword')}
              </KroniText>
              <Input
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>
            <View style={styles.field}>
              <KroniText variant="caption" tone="tertiary" style={styles.label}>
                {t('parent.account.confirmPassword')}
              </KroniText>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>
            <Button
              label={
                passwordMut.isPending
                  ? t('common.loading')
                  : t('parent.account.savePassword')
              }
              onPress={() => passwordMut.mutate()}
              loading={passwordMut.isPending}
              disabled={
                !currentPassword || !newPassword || !confirmPassword
              }
              size="sm"
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600' },
  content: { padding: 20, gap: 8, paddingBottom: 40 },
  sectionLabel: {
    letterSpacing: 1.6,
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  cardPad: { padding: 16, gap: 14 },
  field: { gap: 8 },
  label: { letterSpacing: 1.4 },
  staticValue: { fontSize: 16, fontWeight: '500' },
  help: { lineHeight: 20 },
  linkRow: { alignItems: 'center', paddingVertical: 8 },
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
});
