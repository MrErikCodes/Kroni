// [REVIEW] Norwegian copy — verify with native speaker
import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { Plus, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../lib/theme';
import { useParentApi } from '../../../lib/useParentApi';
import { t } from '../../../lib/i18n';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import type { Kid } from '@kroni/shared';

function KidRow({ kid }: { kid: Kid }) {
  const theme = useTheme();
  const router = useRouter();
  const tx = theme.text;

  return (
    <TouchableOpacity
      onPress={() => {
        void Haptics.selectionAsync();
        router.push(`/(parent)/kids/${kid.id}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={kid.name}
      activeOpacity={0.8}
    >
      <Card style={styles.kidCard}>
        <Avatar avatarKey={kid.avatarKey ?? 'bear'} size={52} />
        <View style={styles.kidInfo}>
          <Text style={[styles.kidName, { color: tx.primary }]}>{kid.name}</Text>
          {kid.weeklyAllowanceCents > 0 ? (
            <Text style={[styles.kidSub, { color: tx.secondary }]}>
              {/* [REVIEW] */}
              {new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(kid.weeklyAllowanceCents / 100)} / uke
            </Text>
          ) : null}
        </View>
        <Text style={[styles.chevron, { color: tx.secondary }]}>›</Text>
      </Card>
    </TouchableOpacity>
  );
}

export default function KidsTab() {
  const theme = useTheme();
  const router = useRouter();
  const api = useParentApi();

  const { data: kids, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent', 'kids'],
    queryFn: () => api.getKids(),
  });

  const s = theme.surface;
  const tx = theme.text;

  const handleAdd = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(parent)/kids/new');
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: s.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: s.border }]}>
        <Text style={[styles.title, { color: tx.primary }]}>{t('parent.kidsList.title')}</Text>
        <TouchableOpacity
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={t('parent.kidsList.addKid')}
          style={[styles.addBtn, { backgroundColor: theme.colors.gold[500] }]}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Spinner />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.colors.semantic.danger }]}>
            {t('common.error')}
          </Text>
          <TouchableOpacity onPress={() => void refetch()}>
            <Text style={[styles.retry, { color: theme.colors.gold[500] }]}>
              {t('common.retry')}
            </Text>
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
          contentContainerStyle={styles.list}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 16 },
  kidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  kidInfo: { flex: 1 },
  kidName: { fontSize: 17, fontWeight: '600' },
  kidSub: { fontSize: 13, marginTop: 2 },
  chevron: { fontSize: 22, fontWeight: '300' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 16, fontWeight: '500' },
  retry: { fontSize: 15, fontWeight: '600' },
});
