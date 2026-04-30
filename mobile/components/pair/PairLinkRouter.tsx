// Shared landing logic for the share-link entrypoints
// (`app/pair/index.tsx` + `app/pair/[code].tsx`).
//
// Three cases:
//   1. Parent signed into Clerk → show "open this on your kid's device"
//      warning. Pairing here would mint a kid token alongside the
//      parent session, and the role chooser at `app/index.tsx` boots
//      kids first when both exist, so we'd silently boot the parent
//      out of their own device.
//   2. Kid token already exists → redirect to the kid app instead of
//      re-running pairing. A stale link tapped on a paired device
//      should never silently rotate the kid's session.
//   3. Otherwise → redirect to `/auth/kid-pair?code=<code>` with the
//      sanitized 6-digit code. The pairing UI handles prefill + submit.
import { useEffect, useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ArrowLeft, Smartphone } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { colors, fonts } from '../../lib/theme';
import { t } from '../../lib/i18n';
import { getKidToken } from '../../lib/auth';
import { KroniText } from '../ui/Text';
import { Button } from '../ui/Button';

interface PairLinkRouterProps {
  /** Sanitized 6-digit code, or empty string if the URL didn't carry one. */
  code: string;
}

type Decision = 'pending' | 'kidActive' | 'parentSignedIn' | 'proceed';

export function PairLinkRouter({ code }: PairLinkRouterProps) {
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
    return 'proceed';
  })();

  if (decision === 'pending') {
    // Suppress route flash while we wait for Clerk + SecureStore to resolve.
    return <BlankPlate />;
  }

  if (decision === 'kidActive') {
    return <Redirect href="/(kid)/(tabs)/today" />;
  }

  if (decision === 'parentSignedIn') {
    return <ParentDeviceWarning onBack={() => router.back()} />;
  }

  // No active session in any role — fall through to the pairing screen.
  const target =
    code.length > 0
      ? (`/auth/kid-pair?code=${code}` as const)
      : ('/auth/kid-pair' as const);
  return <Redirect href={target} />;
}

function BlankPlate() {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const bg = isDark ? colors.ink[900] : colors.sand[50];
  return <SafeAreaView style={[styles.container, { backgroundColor: bg }]} />;
}

function ParentDeviceWarning({ onBack }: { onBack: () => void }) {
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
          {t('pair.parentDevice.eyebrow')}
        </KroniText>
        <View style={styles.headlineRow}>
          <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
            {t('pair.parentDevice.headlineA')}{' '}
          </KroniText>
          <KroniText
            variant="displayItalic"
            tone="gold"
            style={[styles.headline, { fontFamily: fonts.displayItalic }]}
          >
            {t('pair.parentDevice.headlineB')}
          </KroniText>
          <KroniText variant="displayLarge" tone="primary" style={styles.headline}>
            .
          </KroniText>
        </View>
        <KroniText variant="bodyLarge" tone="secondary" style={styles.body}>
          {t('pair.parentDevice.body')}
        </KroniText>

        <View
          style={[
            styles.tipCard,
            { backgroundColor: cardBg, borderColor: border },
          ]}
        >
          <KroniText variant="caption" tone="tertiary" style={styles.tipEyebrow}>
            {t('pair.parentDevice.tipEyebrow')}
          </KroniText>
          <KroniText variant="body" tone="primary" style={styles.tipBody}>
            {t('pair.parentDevice.tipBody')}
          </KroniText>
        </View>

        <Button
          label={t('pair.parentDevice.backCta')}
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
