// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Copy, RefreshCw, Share2, Trash2 } from 'lucide-react-native';
import type { HouseholdInvite, HouseholdMember } from '@kroni/shared';
import { useTheme, fonts } from '../../lib/theme';
import { t, getAppLocale } from '../../lib/i18n';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ApiError, clientFor } from '../../lib/api';

type ParentApi = ReturnType<typeof clientFor>;

interface HouseholdSectionProps {
  api: ParentApi;
  currentParentId: string | null;
}

function getInitials(member: HouseholdMember): string {
  const source = member.displayName ?? member.email ?? '';
  const trimmed = source.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

function formatRelativeExpiry(expiresAt: string): string {
  const expiry = new Date(expiresAt).getTime();
  const diffMs = expiry - Date.now();
  if (diffMs <= 0) return '00:00';
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) {
    const dayLabel = days === 1 ? 'dag' : 'dager';
    if (hours > 0) {
      const hourLabel = hours === 1 ? 'time' : 'timer';
      return `${days} ${dayLabel} ${hours} ${hourLabel}`;
    }
    return `${days} ${dayLabel}`;
  }
  if (hours > 0) {
    const hourLabel = hours === 1 ? 'time' : 'timer';
    if (minutes > 0) {
      return `${hours} ${hourLabel} ${minutes} min`;
    }
    return `${hours} ${hourLabel}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatCodeForDisplay(code: string): string {
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  return code;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function MemberRow({
  member,
  isPremiumOwner,
  isCurrentUser,
}: {
  member: HouseholdMember;
  isPremiumOwner: boolean;
  isCurrentUser: boolean;
}) {
  const theme = useTheme();
  const tx = theme.text;
  const initials = getInitials(member);
  const displayName =
    member.displayName ?? member.email.split('@')[0] ?? member.email;

  return (
    <View style={memberStyles.row}>
      <View
        style={[
          memberStyles.avatar,
          { backgroundColor: theme.colors.gold[100] },
        ]}
      >
        <Text style={[memberStyles.initials, { color: theme.colors.gold[700] }]}>
          {initials}
        </Text>
      </View>
      <View style={memberStyles.info}>
        <Text
          numberOfLines={1}
          style={[memberStyles.name, { color: tx.primary }]}
        >
          {displayName}
          {isCurrentUser ? ` ${t('parent.household.members.currentUserLabel')}` : ''}
        </Text>
        <Text
          numberOfLines={1}
          style={[memberStyles.email, { color: tx.secondary }]}
        >
          {member.email}
        </Text>
      </View>
      {isPremiumOwner ? (
        <Badge label={t('parent.household.members.mainOwnerLabel')} variant="gold" />
      ) : null}
    </View>
  );
}

const memberStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: '600' },
  email: { fontSize: 13 },
});

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  api: ParentApi;
}

function InviteModal({ visible, onClose, api }: InviteModalProps) {
  const theme = useTheme();
  const tx = theme.text;
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ code: string; expiresAt: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset modal state on close.
  useEffect(() => {
    if (!visible) {
      setEmail('');
      setEmailError(null);
      setIssued(null);
      setCopied(false);
      setError(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [visible]);

  // Tick countdown when an invite is showing.
  useEffect(() => {
    if (!issued) return;
    const expiry = new Date(issued.expiresAt).getTime();
    const update = () => {
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    update();
    timerRef.current = setInterval(update, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [issued]);

  const mutation = useMutation({
    mutationFn: () =>
      api.createHouseholdInvite(
        email.trim() ? { invitedEmail: email.trim() } : {},
      ),
    onSuccess: (data) => {
      setIssued({ code: data.code, expiresAt: data.expiresAt });
      void queryClient.invalidateQueries({ queryKey: ['parent', 'householdInvites'] });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.status === 429) {
        setError(t('parent.household.inviteModal.errorRateLimit'));
      } else {
        setError(t('parent.household.inviteModal.errorGeneric'));
      }
    },
  });

  const handleGenerate = useCallback(async () => {
    setError(null);
    setEmailError(null);
    const trimmed = email.trim();
    if (trimmed.length > 0 && !EMAIL_REGEX.test(trimmed)) {
      setEmailError(t('parent.household.inviteModal.errorEmailInvalid'));
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mutation.mutate();
  }, [email, mutation]);

  const handleCopy = useCallback(async () => {
    if (!issued) return;
    await Clipboard.setStringAsync(issued.code);
    setCopied(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  }, [issued]);

  // Universal-link share — kroni.no is the canonical hub domain. The website
  // route is /[lang]/invite/[code]; iOS AASA + Android App Links bounce the
  // URL straight into the mobile app for already-installed users.
  const handleShare = useCallback(async () => {
    if (!issued) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = `https://kroni.no/${getAppLocale()}/invite/${issued.code}`;
    try {
      await Share.share({
        title: t('parent.household.inviteModal.shareTitle'),
        message: t('parent.household.inviteModal.shareBody', {
          code: issued.code,
          url,
        }),
        url,
      });
    } catch {
      // User cancelled / share sheet failed — code is still valid on screen.
    }
  }, [issued]);

  const handleRegenerate = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError(null);
    setIssued(null);
    setCopied(false);
    mutation.mutate();
  }, [mutation]);

  const handleMailto = useCallback(async () => {
    if (!issued) return;
    const subject = t('parent.household.inviteModal.mailtoSubject');
    const body = t('parent.household.inviteModal.mailtoBody', {
      code: issued.code,
      expires: new Date(issued.expiresAt).toLocaleString('nb-NO'),
    });
    const target = email.trim();
    const url = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
    }
  }, [issued, email]);

  const expiryLabel = useMemo(() => {
    if (!issued) return '';
    return t('parent.household.inviteModal.expiresIn', {
      time: formatRelativeExpiry(issued.expiresAt),
    });
    // secondsLeft is in deps so the label re-renders each tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issued, secondsLeft]);

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={inviteModalStyles.container}>
        <Text style={[inviteModalStyles.title, { color: tx.primary }]}>
          {t('parent.household.inviteModal.title')}
        </Text>

        {issued ? (
          <View style={inviteModalStyles.codeWrap}>
            <Text
              style={[inviteModalStyles.heading, { color: tx.secondary }]}
            >
              {t('parent.household.inviteModal.codeDisplayHeading')}
            </Text>
            <Text
              style={[
                inviteModalStyles.code,
                { color: theme.colors.gold[700] },
              ]}
              accessibilityLabel={`Familiekode: ${issued.code}`}
            >
              {formatCodeForDisplay(issued.code)}
            </Text>
            <View
              style={[
                inviteModalStyles.expiryPill,
                { backgroundColor: theme.colors.gold[50] },
              ]}
            >
              <Text
                style={[
                  inviteModalStyles.expiryText,
                  { color: theme.colors.gold[700] },
                ]}
              >
                {expiryLabel}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                void handleShare();
              }}
              accessibilityRole="button"
              accessibilityLabel={t('parent.household.inviteModal.share')}
              style={[
                inviteModalStyles.primaryBtn,
                { backgroundColor: theme.colors.gold[500] },
              ]}
            >
              <Share2 size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={inviteModalStyles.primaryLabel}>
                {t('parent.household.inviteModal.share')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCopy}
              accessibilityRole="button"
              accessibilityLabel={t('parent.household.inviteModal.copyButton')}
              style={[
                inviteModalStyles.copyBtn,
                { borderColor: theme.surface.border },
              ]}
            >
              <Copy size={16} color={tx.primary} strokeWidth={2} />
              <Text style={[inviteModalStyles.copyLabel, { color: tx.primary }]}>
                {copied
                  ? t('parent.household.inviteModal.copiedToast')
                  : t('parent.household.inviteModal.copyButton')}
              </Text>
            </TouchableOpacity>

            {email.trim().length > 0 ? (
              <TouchableOpacity
                onPress={handleMailto}
                accessibilityRole="link"
                accessibilityLabel={t('parent.household.inviteModal.mailtoLink')}
                style={inviteModalStyles.mailtoLink}
              >
                <Text
                  style={[
                    inviteModalStyles.mailtoText,
                    { color: theme.colors.gold[700] },
                  ]}
                >
                  {t('parent.household.inviteModal.mailtoLink')}
                </Text>
              </TouchableOpacity>
            ) : null}

            <View style={inviteModalStyles.footerRow}>
              <TouchableOpacity
                onPress={handleRegenerate}
                disabled={mutation.isPending}
                accessibilityRole="button"
                accessibilityLabel={t('parent.household.inviteModal.regenerate')}
                style={[
                  inviteModalStyles.regenBtn,
                  { borderColor: theme.surface.border, opacity: mutation.isPending ? 0.5 : 1 },
                ]}
              >
                <RefreshCw size={14} color={tx.secondary} strokeWidth={2} />
                <Text style={[inviteModalStyles.regenLabel, { color: tx.secondary }]}>
                  {t('parent.household.inviteModal.regenerate')}
                </Text>
              </TouchableOpacity>

              <Button
                label={t('parent.household.inviteModal.close')}
                variant="secondary"
                onPress={onClose}
                size="sm"
              />
            </View>
          </View>
        ) : (
          <View style={inviteModalStyles.formWrap}>
            <View style={inviteModalStyles.field}>
              <Text style={[inviteModalStyles.label, { color: tx.secondary }]}>
                {t('parent.household.inviteModal.emailLabel')}
              </Text>
              <Input
                value={email}
                onChangeText={(v: string) => {
                  setEmail(v);
                  if (emailError) setEmailError(null);
                }}
                placeholder={t('parent.household.inviteModal.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel={t('parent.household.inviteModal.emailLabel')}
              />
              {emailError ? (
                <Text style={[inviteModalStyles.fieldError, { color: theme.colors.semantic.danger }]}>
                  {emailError}
                </Text>
              ) : null}
            </View>

            {error ? (
              <View
                style={[
                  inviteModalStyles.errorBox,
                  { backgroundColor: theme.colors.semantic.danger + '18' },
                ]}
              >
                <Text style={[inviteModalStyles.errorText, { color: theme.colors.semantic.danger }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Button
              label={
                mutation.isPending
                  ? t('parent.household.inviteModal.generating')
                  : t('parent.household.inviteModal.generate')
              }
              onPress={handleGenerate}
              loading={mutation.isPending}
              size="sm"
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const inviteModalStyles = StyleSheet.create({
  container: { gap: 16 },
  title: {
    fontFamily: fonts.uiBold,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  formWrap: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500' },
  fieldError: { fontSize: 13, marginTop: 4 },
  errorBox: { borderRadius: 12, padding: 12 },
  errorText: { fontSize: 14, fontWeight: '500' },
  codeWrap: { gap: 16, alignItems: 'center' },
  heading: { fontSize: 13, textAlign: 'center' },
  code: {
    fontFamily: fonts.uiBold,
    fontSize: 44,
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  expiryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  expiryText: { fontSize: 13, fontWeight: '600' },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 44,
    alignSelf: 'stretch',
  },
  copyLabel: { fontSize: 15, fontWeight: '600' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    minHeight: 44,
    alignSelf: 'stretch',
  },
  primaryLabel: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  mailtoLink: { paddingVertical: 8 },
  mailtoText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 4,
  },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 44,
  },
  regenLabel: { fontSize: 13, fontWeight: '600' },
});

interface InviteRowProps {
  invite: HouseholdInvite;
  onRevoke: (code: string) => void;
}

function InviteRow({ invite, onRevoke }: InviteRowProps) {
  const theme = useTheme();
  const tx = theme.text;
  const expiresLabel = formatRelativeExpiry(invite.expiresAt);

  return (
    <View style={inviteRowStyles.row}>
      <View style={inviteRowStyles.info}>
        <Text style={[inviteRowStyles.code, { color: tx.primary }]}>
          {formatCodeForDisplay(invite.code)}
        </Text>
        <Text style={[inviteRowStyles.meta, { color: tx.secondary }]}>
          {t('parent.household.inviteModal.expiresIn', { time: expiresLabel })}
          {invite.invitedEmail ? ` · ${invite.invitedEmail}` : ''}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onRevoke(invite.code)}
        accessibilityRole="button"
        accessibilityLabel={t('parent.household.invitesList.revokeAction')}
        style={inviteRowStyles.revokeBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Trash2 size={18} color={theme.colors.semantic.danger} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const inviteRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  info: { flex: 1, gap: 2 },
  code: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  meta: { fontSize: 12 },
  revokeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function HouseholdSection({ api, currentParentId }: HouseholdSectionProps) {
  const theme = useTheme();
  const tx = theme.text;
  const s = theme.surface;
  const queryClient = useQueryClient();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  const householdQuery = useQuery({
    queryKey: ['parent', 'household'],
    queryFn: () => api.getHousehold(),
    retry: false,
    // The owner needs to see a co-parent appear within seconds of them
    // joining. Refetch on focus + a slow background poll covers both
    // foreground tabs and the device coming back from sleep.
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });

  const premiumOwnerId =
    householdQuery.data?.household.premiumOwnerParentId ?? null;
  const isOwner = premiumOwnerId !== null && premiumOwnerId === currentParentId;

  const invitesQuery = useQuery({
    queryKey: ['parent', 'householdInvites'],
    queryFn: () => api.listHouseholdInvites(),
    retry: false,
    // Only the owner can issue / revoke invites, so non-owners shouldn't
    // even hit this endpoint.
    enabled: isOwner,
  });

  const revokeMutation = useMutation({
    mutationFn: (code: string) => api.revokeHouseholdInvite(code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['parent', 'householdInvites'] });
    },
  });

  const [pendingRevokeCode, setPendingRevokeCode] = useState<string | null>(null);
  const handleRevoke = useCallback(
    (code: string) => setPendingRevokeCode(code),
    [],
  );
  const confirmRevoke = useCallback(() => {
    if (!pendingRevokeCode) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    revokeMutation.mutate(pendingRevokeCode);
    setPendingRevokeCode(null);
  }, [pendingRevokeCode, revokeMutation]);

  const members = householdQuery.data?.members ?? [];
  const activeInvites = (invitesQuery.data ?? []).filter((inv) => inv.usedAt === null);

  return (
    <View>
      <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
        {t('parent.household.sectionTitle')}
      </Text>

      <Card style={styles.section}>
        {householdQuery.isLoading ? (
          <View style={styles.loadingRow}>
            <Spinner size={20} />
          </View>
        ) : members.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={[styles.emptyText, { color: tx.secondary }]}>
              {t('parent.household.members.emptyState')}
            </Text>
          </View>
        ) : (
          members.map((member, index) => (
            <View key={member.id}>
              <MemberRow
                member={member}
                isPremiumOwner={member.id === premiumOwnerId}
                isCurrentUser={member.id === currentParentId}
              />
              {index < members.length - 1 ? (
                <View style={[styles.divider, { backgroundColor: s.border }]} />
              ) : null}
            </View>
          ))
        )}
      </Card>

      {/* Inviting + revoking is owner-only. A co-parent who joined via a
          code shouldn't be able to invite a third party — that's a
          billing / capacity decision for the household's main owner. */}
      {isOwner ? (
        <>
          <View style={styles.inviteButtonWrap}>
            <Button
              label={t('parent.household.inviteButton')}
              variant="secondary"
              onPress={() => setInviteModalVisible(true)}
              size="sm"
            />
          </View>

          <Text style={[styles.sectionLabel, { color: tx.secondary }]}>
            {t('parent.household.invitesList.title')}
          </Text>
          <Card style={styles.section}>
            {invitesQuery.isLoading ? (
              <View style={styles.loadingRow}>
                <Spinner size={20} />
              </View>
            ) : activeInvites.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text style={[styles.emptyText, { color: tx.secondary }]}>
                  {t('parent.household.invitesList.empty')}
                </Text>
              </View>
            ) : (
              activeInvites.map((invite, index) => (
                <View key={invite.code}>
                  <InviteRow invite={invite} onRevoke={handleRevoke} />
                  {index < activeInvites.length - 1 ? (
                    <View style={[styles.divider, { backgroundColor: s.border }]} />
                  ) : null}
                </View>
              ))
            )}
          </Card>

          <InviteModal
            visible={inviteModalVisible}
            onClose={() => setInviteModalVisible(false)}
            api={api}
          />
        </>
      ) : null}

      <ConfirmDialog
        visible={pendingRevokeCode !== null}
        title={t('parent.household.invitesList.revokeAction')}
        message={
          pendingRevokeCode
            ? t('parent.household.invitesList.revokeConfirm', { code: pendingRevokeCode })
            : ''
        }
        confirmLabel={t('parent.household.invitesList.revokeAction')}
        destructive
        onConfirm={confirmRevoke}
        onCancel={() => setPendingRevokeCode(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  section: { overflow: 'hidden' },
  divider: { height: 1, marginHorizontal: 16 },
  loadingRow: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyRow: { paddingVertical: 16, paddingHorizontal: 16 },
  emptyText: { fontSize: 14 },
  inviteButtonWrap: { marginTop: 12, marginBottom: 4 },
});
