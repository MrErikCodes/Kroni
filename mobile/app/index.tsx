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
import { t } from '../lib/i18n';
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

  console.log('[index] render', { resolved });

  useEffect(() => {
    console.log('[index] resolve-effect mount');
    let cancelled = false;
    void (async () => {
      const token = await getKidToken();
      console.log('[index] kid token check', { hasToken: !!token, cancelled });
      if (cancelled) return;
      if (token) {
        console.log('[index] redirect -> /(kid)/(tabs)/today');
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
            {t('roleChooser.eyebrow')}
          </KroniText>
          <View style={styles.headlineRow}>
            <KroniText variant="displayLarge" tone="primary" style={styles.headlineLine}>
              {t('roleChooser.headlineA')}{' '}
            </KroniText>
            <KroniText
              variant="displayItalic"
              tone="gold"
              style={[styles.headlineLine, styles.italic]}
            >
              {t('roleChooser.headlineB')}
            </KroniText>
            <KroniText variant="displayLarge" tone="primary" style={styles.headlineLine}>
              ?
            </KroniText>
          </View>
          <KroniText variant="bodyLarge" tone="secondary" style={styles.intro}>
            {t('roleChooser.intro')}
          </KroniText>
        </View>

        {/* Two role cards — hairline borders, sand-50 surface, no shadow. */}
        <View style={styles.cards}>
          <TouchableOpacity
            onPress={handleParent}
            accessibilityRole="button"
            accessibilityLabel={t('roleChooser.parentAccessibility')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
            activeOpacity={0.85}
          >
            <KroniText variant="eyebrow" tone="primary" style={styles.cardLabel}>
              {t('roleChooser.parentEyebrow')}
            </KroniText>
            <KroniText variant="small" tone="secondary" style={styles.cardBody}>
              {t('roleChooser.parentBody')}
            </KroniText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleKid}
            accessibilityRole="button"
            accessibilityLabel={t('roleChooser.kidAccessibility')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
            activeOpacity={0.85}
          >
            <KroniText variant="eyebrow" tone="primary" style={styles.cardLabel}>
              {t('roleChooser.kidEyebrow')}
            </KroniText>
            <KroniText variant="small" tone="secondary" style={styles.cardBody}>
              {t('roleChooser.kidBody')}
            </KroniText>
          </TouchableOpacity>
        </View>

        {/* Brand motto — italic display line above the trust strip. */}
        <KroniText
          variant="bodyLarge"
          tone="gold"
          style={[styles.motto, { fontFamily: fonts.displayItalic }]}
        >
          {t('common.motto')}
        </KroniText>

        {/* Trust strip — middot separators, sand-500. */}
        <View style={styles.trustStrip}>
          <KroniText variant="caption" tone="secondary" style={styles.trustText}>
            {t('roleChooser.trustBuilt')}
          </KroniText>
          <View style={[styles.dot, { backgroundColor: isDark ? '#2A3040' : colors.sand[300] }]} />
          <KroniText variant="caption" tone="secondary" style={styles.trustText}>
            {t('roleChooser.trustNoCash')}
          </KroniText>
          <View style={[styles.dot, { backgroundColor: isDark ? '#2A3040' : colors.sand[300] }]} />
          <KroniText variant="caption" tone="secondary" style={styles.trustText}>
            {t('roleChooser.trustAge')}
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
  cardLabel: {
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 1.4,
  },
  cardBody: {
    lineHeight: 20,
  },
  motto: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    paddingHorizontal: 12,
    paddingTop: 16,
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
