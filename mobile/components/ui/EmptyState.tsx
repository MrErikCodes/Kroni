import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Button } from './Button';
import { colors } from '../../lib/theme';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  ctaLabel,
  onCta,
  className,
}: EmptyStateProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const textPrimary = isDark ? '#F5F5F0' : colors.sand[900];
  const textSecondary = isDark ? '#9AA0AA' : colors.sand[500];

  return (
    <View style={styles.container} className={className}>
      <View style={[styles.iconWrap, { backgroundColor: colors.gold[50] }]}>
        <Icon size={32} color={colors.gold[500]} strokeWidth={2} />
      </View>
      <Text style={[styles.title, { color: textPrimary }]}>{title}</Text>
      {body ? (
        <Text style={[styles.body, { color: textSecondary }]}>{body}</Text>
      ) : null}
      {ctaLabel && onCta ? (
        <View style={styles.cta}>
          <Button label={ctaLabel} onPress={onCta} variant="primary" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    marginTop: 24,
  },
});
