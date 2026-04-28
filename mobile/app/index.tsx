// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getKidToken, setRolePreference } from '../lib/auth';
import { colors, fonts } from '../lib/theme';
import { KroniText } from '../components/ui/Text';

export default function RoleChooser() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  // Kids should never see the role chooser after first pair. The token in
  // SecureStore + the now-permanent JWT mean a force-close → reopen lands
  // straight back in the kid app. Only if no token exists do we render the
  // chooser. Parents flow through Clerk in their own (parent) layout, so
  // we don't auto-resume them here — Clerk's tokenCache handles that.
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = await getKidToken();
      if (cancelled) return;
      if (token) {
        router.replace('/(kid)/(tabs)/today');
        return;
      }
      setResolved(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const bg = isDark ? colors.ink[900] : colors.sand[50];
  const cardBg = isDark ? colors.ink[800] : colors.sand[50];
  const border = isDark ? '#2A3040' : colors.sand[200];

  const handleParent = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setRolePreference('parent');
    router.push('/auth/parent-sign-in');
  }, [router]);

  const handleKid = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setRolePreference('kid');
    router.push('/auth/kid-pair');
  }, [router]);

  // While we're deciding whether to redirect, paint the background only —
  // showing the role chooser for a frame then yanking it away looks broken.
  if (!resolved) {
    return <SafeAreaView style={[styles.container, { backgroundColor: bg }]} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.content}>
        {/* Eyebrow + serif headline with italic emphasis on "hvem". */}
        <View style={styles.header}>
          <KroniText variant="eyebrow" tone="gold" style={styles.eyebrow}>
            {/* [REVIEW] */}
            Velkommen til Kroni
          </KroniText>
          <View style={styles.headlineRow}>
            <KroniText variant="displayLarge" tone="primary" style={styles.headlineLine}>
              {/* [REVIEW] */}
              Hvem er du —{' '}
            </KroniText>
            <KroniText
              variant="displayItalic"
              tone="gold"
              style={[styles.headlineLine, styles.italic]}
            >
              {/* [REVIEW] */}
              i dag
            </KroniText>
            <KroniText variant="displayLarge" tone="primary" style={styles.headlineLine}>
              ?
            </KroniText>
          </View>
          <KroniText variant="bodyLarge" tone="secondary" style={styles.intro}>
            {/* [REVIEW] */}
            Velg hvilken side av Kroni du logger inn på.
          </KroniText>
        </View>

        {/* Two role cards — hairline borders, sand-50 surface, no shadow. */}
        <View style={styles.cards}>
          <TouchableOpacity
            onPress={handleParent}
            accessibilityRole="button"
            accessibilityLabel="Forelder"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
            activeOpacity={0.85}
          >
            <KroniText variant="eyebrow" tone="tertiary">
              {/* [REVIEW] */}
              Forelder
            </KroniText>
            <KroniText variant="display" tone="primary" style={styles.cardTitle}>
              {/* [REVIEW] */}
              Sett opp familien.
            </KroniText>
            <KroniText variant="small" tone="secondary" style={styles.cardBody}>
              {/* [REVIEW] */}
              Lag oppgaver, godkjenn ferdig arbeid og sett ukepenger. Fra kjøkkenbordet, ikke fra appen.
            </KroniText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleKid}
            accessibilityRole="button"
            accessibilityLabel="Barn"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.card, styles.kidCard, { backgroundColor: cardBg, borderColor: border }]}
            activeOpacity={0.85}
          >
            <KroniText variant="eyebrow" tone="tertiary">
              {/* [REVIEW] */}
              Barn
            </KroniText>
            <KroniText variant="display" tone="primary" style={styles.cardTitle}>
              {/* [REVIEW] */}
              Logg inn med kode.
            </KroniText>
            <KroniText variant="small" tone="secondary" style={styles.cardBody}>
              {/* [REVIEW] */}
              Be foreldrene dine om en seks-sifret kode. Du får din egen oppgaveliste og saldo.
            </KroniText>
          </TouchableOpacity>
        </View>

        {/* Trust strip — middot separators, sand-500. */}
        <View style={styles.trustStrip}>
          <KroniText variant="caption" tone="secondary" style={styles.trustText}>
            {/* [REVIEW] */}
            Bygd i Norge
          </KroniText>
          <View style={[styles.dot, { backgroundColor: isDark ? '#2A3040' : colors.sand[300] }]} />
          <KroniText variant="caption" tone="secondary" style={styles.trustText}>
            {/* [REVIEW] */}
            Aldri ekte penger
          </KroniText>
          <View style={[styles.dot, { backgroundColor: isDark ? '#2A3040' : colors.sand[300] }]} />
          <KroniText variant="caption" tone="secondary" style={styles.trustText}>
            {/* [REVIEW] */}
            For barn 6–14 år
          </KroniText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-start',
    gap: 16,
  },
  eyebrow: {
    marginBottom: 4,
  },
  headlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  headlineLine: {
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.1,
  },
  italic: {
    fontFamily: fonts.displayItalic,
  },
  intro: {
    maxWidth: 320,
    fontSize: 17,
    lineHeight: 26,
  },
  cards: {
    gap: 14,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    minHeight: 44,
    gap: 10,
  },
  kidCard: {
    minHeight: 56,
  },
  cardTitle: {
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  cardBody: {
    lineHeight: 20,
  },
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 12,
  },
  trustText: {
    letterSpacing: 0.3,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});
