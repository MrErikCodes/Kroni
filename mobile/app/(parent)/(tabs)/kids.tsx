// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Settings as SettingsIcon, Users, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, fonts } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { formatMoney } from '../../../lib/format';
import { useCurrency } from '../../../lib/useCurrency';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { KroniText } from '../../../components/ui/Text';
import type { Kid } from '@kroni/shared';

function KidRow({ kid }: { kid: Kid }) {
  const currency = useCurrency();
  const theme = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => {
        void Haptics.selectionAsync();
        router.push(`/(parent)/kids/${kid.id}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={kid.name}
      activeOpacity={0.85}
    >
      <Card style={styles.kidCard}>
        <Avatar avatarKey={kid.avatarKey ?? 'bear'} size={48} />
        <View style={styles.kidInfo}>
          <KroniText variant="h2" tone="primary" style={styles.kidName}>
            {kid.name}
          </KroniText>
          {kid.allowanceFrequency !== 'none' && kid.allowanceCents > 0 ? (
            <KroniText variant="small" tone="secondary">
              {formatMoney(kid.allowanceCents, currency)} · {t(`parent.kidDetail.allowanceFrequencyLabel.${kid.allowanceFrequency}`)}
            </KroniText>
          ) : (
            <KroniText variant="small" tone="secondary">
              {t('parent.kidsList.noAllowance')}
            </KroniText>
          )}
        </View>
        <ChevronRight size={20} color={theme.text.secondary} strokeWidth={1.75} />
      </Card>
    </TouchableOpacity>
  );
}

export default function KidsTab() {
  const theme = useTheme();
  const router = useRouter();
  const api = useParentApi();
  const tabBarHeight = useBottomTabBarHeight();

  const { data: kids, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent', 'kids'],
    queryFn: () => api.getKids(),
  });

  const s = theme.surface;

  const handleAdd = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(parent)/kids/new');
  }, [router]);

  const handleSettings = useCallback(() => {
    void Haptics.selectionAsync();
    router.push('/(parent)/settings');
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      {/* Editorial header — serif headline with italic emphasis on "din". */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <KroniText variant="eyebrow" tone="gold">
            {t('parent.kidsList.eyebrow')}
          </KroniText>
          <View style={styles.headlineRow}>
            <KroniText variant="display" tone="primary" style={styles.headlineText}>
              {t('parent.kidsList.headlineA')}{' '}
            </KroniText>
            <KroniText
              variant="displayItalic"
              tone="gold"
              style={[styles.headlineText, { fontFamily: fonts.displayItalic }]}
            >
              {t('parent.kidsList.headlineB')}
            </KroniText>
            <KroniText variant="display" tone="primary" style={styles.headlineText}>
              .
            </KroniText>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleSettings}
          accessibilityRole="button"
          accessibilityLabel={t('parent.settings.title')}
          style={[styles.iconBtn, { borderColor: theme.surface.border }]}
          activeOpacity={0.85}
        >
          <SettingsIcon size={20} color={theme.text.primary} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Spinner />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <KroniText variant="body" tone="danger">
            {t('common.error')}
          </KroniText>
          <TouchableOpacity onPress={() => void refetch()}>
            <KroniText variant="body" tone="gold">
              {t('common.retry')}
            </KroniText>
          </TouchableOpacity>
        </View>
      ) : kids && kids.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('parent.kidsList.empty')}
          body={t('parent.kidsList.emptyBody')}
          ctaLabel={t('parent.kidsList.addKid')}
          onCta={handleAdd}
        />
      ) : (
        <FlashList
          data={kids ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <KidRow kid={item} />}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight + 16 }]}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => void refetch()}
              tintColor={theme.colors.gold[500]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 8,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  headlineText: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.7,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 16, paddingTop: 4 },
  kidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  kidInfo: { flex: 1, gap: 2 },
  kidName: {
    fontSize: 17,
    lineHeight: 22,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
