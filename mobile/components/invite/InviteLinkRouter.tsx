// Shared landing logic for the co-parent invite share-link entrypoints
// (`app/invite/index.tsx` + `app/invite/[code].tsx`). The website's
// `/invite/<code>` page hands off to either:
//   • https://kroni.no/invite/<code>   (universal link, iOS/Android verified)
//   • kroni://invite?code=<code>        (custom-scheme fallback)
// This component normalises the four resulting cases, mirroring
// `PairLinkRouter` for the kid-side flow.
//
// Cases:
//   1. Kid token already present on this device → silently bounce back
//      to the kid app. A co-parent invite tapped on a kid device must
//      never overwrite the kid's session, and the parent flow needs
//      Clerk auth which the kid device is intentionally missing.
//   2. Parent already signed in via Clerk → forward to the household
//      join screen (settings) which calls `joinHousehold(code)` against
//      the API. The screen handles dedup / "already in a household"
//      via the existing 409 path.
//   3. No Clerk session → forward to `/auth/parent-sign-up?join=<code>`
//      so the join code is prefilled into the existing
//      `showJoinCode` flow on the sign-up screen. The user can also
//      switch to sign-in from there if they already have an account.
import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ArrowLeft, Smartphone } from 'lucide-react-native';
import { colors, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { getKidToken } from '../../lib/auth';
import { KroniText } from '../ui/Text';
import { Button } from '../ui/Button';

interface InviteLinkRouterProps {
  /** Sanitized 6-digit code, or empty string if the URL didn't carry one. */
  code: string;
}

type Decision = 'pending' | 'kidActive' | 'parentSignedIn' | 'needsAuth';

export function InviteLinkRouter({ code }: InviteLinkRouterProps) {
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const [kidTokenChecked, setKidTokenChecked] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = await getKidToken();
      if (cancelled) return;
      setKidTokenChecked(token !== null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const decision: Decision = (() => {
    if (!isLoaded || kidTokenChecked === null) return 'pending';
    if (kidTokenChecked) return 'kidActive';
    if (userId) return 'parentSignedIn';
    return 'needsAuth';
  })();

  if (decision === 'pending') {
    return <BlankPlate />;
  }

  if (decision === 'kidActive') {
    // Same warning surface as `PairLinkRouter` reuses — wrong device for
    // the wrong account role. Co-parent invite must run from the parent's
    // own device.
    return <KidDeviceWarning onBack={() => router.replace('/(kid)/(tabs)/today')} />;
  }

  if (decision === 'parentSignedIn') {
    // Already signed in: drop them at the household section in settings
    // where the InviteModal + co-parent join surface live. The user can
    // paste the code there, or use the settings screen's existing
    // `joinHousehold` controls. We don't auto-submit — silently mutating
    // the household membership from a tapped link is a footgun.
    return <Redirect href="/(parent)/settings" />;
  }

  // No active session — prefill the code into the sign-up flow's existing
  // join-code field. The `?join=<code>` query is read by parent-sign-up.tsx
  // (see resume-from-link logic in that screen).
  const target =
    code.length > 0
      ? (`/auth/parent-sign-up?join=${code}` as const)
      : ('/auth/parent-sign-up' as const);
  return <Redirect href={target} />;
}

function BlankPlate() {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const bg = isDark ? colors.ink[900] : colors.sand[50];
  return <SafeAreaView style={[styles.container, { backgroundColor: bg }]} />;
}

function KidDeviceWarning({ onBack }: { onBack: () => void }) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const bg = isDark ? colors.ink[900] : colors.sand[50];
  const cardBg = isDark ? colors.ink[800] : colors.sand[50];
  const border = isDark ? '#2A3040' : colors.sand[200];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ArrowLeft
            size={22}
            color={isDark ? '#F5F5F0' : colors.sand[900]}
            strokeWidth={1.75}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.gold[500] },
          ]}
        >
          <Smartphone size={28} color={colors.sand[900]} strokeWidth={2} />
        </View>

        <KroniText variant="eyebrow" tone="gold" style={styles.eyebrow}>
          {t('invite.kidDevice.eyebrow')}
        </KroniText>
        <View style={styles.headlineRow}>
          <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
            {t('invite.kidDevice.headlineA')}{' '}
          </KroniText>
          <KroniText
            variant="displayItalic"
            tone="gold"
            style={[styles.headline, { fontFamily: fonts.displayItalic }]}
          >
            {t('invite.kidDevice.headlineB')}
          </KroniText>
          <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
            .
          </KroniText>
        </View>
        <KroniText variant="bodyLarge" tone="secondary" style={styles.body}>
          {t('invite.kidDevice.body')}
        </KroniText>

        <View
          style={[
            styles.tipCard,
            { backgroundColor: cardBg, borderColor: border },
          ]}
        >
          <KroniText variant="caption" tone="tertiary" style={styles.tipEyebrow}>
            {t('invite.kidDevice.tipEyebrow')}
          </KroniText>
          <KroniText variant="body" tone="primary" style={styles.tipBody}>
            {t('invite.kidDevice.tipBody')}
          </KroniText>
        </View>

        <Button
          label={t('invite.kidDevice.backCta')}
          onPress={onBack}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 18,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  eyebrow: { marginBottom: 4 },
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
  body: {
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 4,
  },
  tipCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  tipEyebrow: {
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  tipBody: {
    lineHeight: 22,
  },
});
