// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Users, Baby } from 'lucide-react-native';
import { setRolePreference } from '../lib/auth';
import { colors } from '../lib/theme';
import { t } from '../lib/i18n';

export default function RoleChooser() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  const bg = isDark ? colors.ink[900] : colors.sand[50];
  const cardBg = isDark ? colors.ink[800] : '#FFFFFF';
  const border = isDark ? '#2A3040' : colors.sand[200];
  const textPrimary = isDark ? '#F5F5F0' : colors.sand[900];
  const textSecondary = isDark ? '#9AA0AA' : colors.sand[500];

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.gold[500] }]}>Kroni</Text>
          <Text style={[styles.subtitle, { color: textPrimary }]}>
            {t('roleChooser.title')}
          </Text>
          <Text style={[styles.body, { color: textSecondary }]}>
            {t('roleChooser.subtitle')}
          </Text>
        </View>

        {/* Cards */}
        <View style={styles.cards}>
          {/* Parent card */}
          <TouchableOpacity
            onPress={handleParent}
            accessibilityRole="button"
            accessibilityLabel={t('roleChooser.parentCard.title')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
            activeOpacity={0.85}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.gold[50] }]}>
              <Users size={32} color={colors.gold[500]} strokeWidth={2} />
            </View>
            <Text style={[styles.cardTitle, { color: textPrimary }]}>
              {t('roleChooser.parentCard.title')}
            </Text>
            <Text style={[styles.cardDesc, { color: textSecondary }]}>
              {t('roleChooser.parentCard.description')}
            </Text>
          </TouchableOpacity>

          {/* Kid card */}
          <TouchableOpacity
            onPress={handleKid}
            accessibilityRole="button"
            accessibilityLabel={t('roleChooser.kidCard.title')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.card,
              styles.kidCard,
              { backgroundColor: cardBg, borderColor: colors.gold[300] },
            ]}
            activeOpacity={0.85}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.accent.coral + '22' }]}>
              <Baby size={32} color={colors.accent.coral} strokeWidth={2} />
            </View>
            <Text style={[styles.cardTitle, { color: textPrimary }]}>
              {t('roleChooser.kidCard.title')}
            </Text>
            <Text style={[styles.cardDesc, { color: textSecondary }]}>
              {t('roleChooser.kidCard.description')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  cards: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    minHeight: 44, // parent touch target
  },
  kidCard: {
    minHeight: 56, // kid touch target
    borderWidth: 2,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
