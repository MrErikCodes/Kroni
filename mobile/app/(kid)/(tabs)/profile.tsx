// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LogOut, User } from 'lucide-react-native';
import { useTheme, fonts } from '../../../lib/theme';
import { kidApi } from '../../../lib/api';
import { clearKidToken } from '../../../lib/auth';
import { t } from '../../../lib/i18n';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import { KroniText } from '../../../components/ui/Text';
import type { BalanceEntry } from '@kroni/shared';

const formatNok = (ore: number) =>
  new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(ore / 100);

// Mini bar chart — last 7 days earnings
function MiniBarChart({ entries }: { entries: BalanceEntry[] }) {
  const theme = useTheme();
  const tx = theme.text;

  // Build daily buckets for last 7 days
  const buckets: number[] = Array(7).fill(0);
  const now = new Date();
  entries.forEach((e) => {
    if (e.amountCents <= 0) return;
    const diff = Math.floor(
      (now.getTime() - new Date(e.createdAt).getTime()) / 86400000,
    );
    if (diff >= 0 && diff < 7) {
      buckets[6 - diff] += e.amountCents;
    }
  });

  const maxVal = Math.max(...buckets, 1);
  const DAY_LABELS = ['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'];
  // Figure out which day of week today is (0=Sun) and map to labels
  const todayIdx = (now.getDay() + 6) % 7; // Mon=0
  const labels = Array(7)
    .fill(0)
    .map((_, i) => DAY_LABELS[(todayIdx - 6 + i + 7) % 7]);

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {buckets.map((val, i) => {
          const heightPct = val / maxVal;
          return (
            <View key={i} style={chartStyles.barCol}>
              <View style={chartStyles.barTrack}>
                <View
                  style={[
                    chartStyles.bar,
                    {
                      height: `${Math.round(heightPct * 100)}%`,
                      backgroundColor:
                        val > 0 ? theme.colors.gold[500] : theme.colors.sand[200],
                    },
                  ]}
                />
              </View>
              <Text style={[chartStyles.label, { color: tx.secondary }]}>{labels[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { width: '100%', paddingVertical: 8 },
  bars: { flexDirection: 'row', height: 64, gap: 4, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 3 },
  label: { fontSize: 10, fontWeight: '500' },
});

export default function KidProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const s = theme.surface;
  const tx = theme.text;

  const { data: me, isLoading } = useQuery({
    queryKey: ['kid', 'me'],
    queryFn: () => kidApi.getMe(),
  });

  const { data: history } = useQuery({
    queryKey: ['kid', 'history'],
    queryFn: () => kidApi.getHistory(),
  });

  const { data: balance } = useQuery({
    queryKey: ['kid', 'balance'],
    queryFn: () => kidApi.getBalance(),
  });

  const handleSignOut = useCallback(() => {
    Alert.alert(
      t('kid.profileScreen.signOut'),
      t('kid.profileScreen.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('kid.profileScreen.signOut'),
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await clearKidToken();
            router.replace('/');
          },
        },
      ],
    );
  }, [router]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
        <View style={styles.center}>
          <Spinner size={36} />
        </View>
      </SafeAreaView>
    );
  }

  // Last 7 days total earned
  const last7DaysEarned =
    history
      ?.filter((e) => {
        const diff = (Date.now() - new Date(e.createdAt).getTime()) / 86400000;
        return diff < 7 && e.amountCents > 0;
      })
      .reduce((sum, e) => sum + e.amountCents, 0) ?? 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      <View style={styles.header}>
        <KroniText variant="eyebrow" tone="gold">
          {/* [REVIEW] */}
          Profil
        </KroniText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Editorial profile block — italic name as the visual signature. */}
        <View style={styles.profileSection}>
          <Avatar avatarKey={me?.avatarKey ?? 'bear'} size={88} />
          <KroniText
            variant="displayItalic"
            tone="primary"
            style={[styles.name, { fontFamily: fonts.displayItalic }]}
          >
            {me?.name ?? '…'}
          </KroniText>
          <Text
            style={[
              styles.balance,
              { color: theme.colors.gold[700], fontFamily: fonts.uiBold },
            ]}
          >
            {formatNok(balance?.balanceCents ?? 0)}
          </Text>
        </View>

        {/* Weekly earnings bar chart */}
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: tx.secondary }]}>
            {t('kid.profileScreen.weeklyEarnings')}
          </Text>
          <Text style={[styles.chartTotal, { color: theme.colors.gold[500] }]}>
            +{formatNok(last7DaysEarned)}
          </Text>
          {history && history.length > 0 ? (
            <MiniBarChart entries={history} />
          ) : (
            <Text style={[styles.noEarnings, { color: tx.secondary }]}>
              {t('kid.profileScreen.noEarnings')}
            </Text>
          )}
        </Card>

        {/* Sign out */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.signOutBtn, { borderColor: theme.colors.semantic.danger + '44' }]}
          accessibilityRole="button"
          accessibilityLabel={t('kid.profileScreen.signOut')}
        >
          <LogOut size={18} color={theme.colors.semantic.danger} strokeWidth={2} />
          <Text style={[styles.signOutLabel, { color: theme.colors.semantic.danger }]}>
            {t('kid.profileScreen.signOut')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, gap: 20 },
  profileSection: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  name: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  balance: { fontSize: 20, letterSpacing: -0.3 },
  chartCard: { padding: 16, gap: 4 },
  chartTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  chartTotal: { fontSize: 22, fontWeight: '700' },
  noEarnings: { fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 56,
  },
  signOutLabel: { fontSize: 16, fontWeight: '600' },
});
