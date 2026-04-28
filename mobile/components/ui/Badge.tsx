import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../lib/theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.semantic.success + '22', text: colors.semantic.success },
  warning: { bg: colors.semantic.warning + '22', text: colors.semantic.warning },
  danger:  { bg: colors.semantic.danger  + '22', text: colors.semantic.danger },
  info:    { bg: colors.semantic.info    + '22', text: colors.semantic.info },
  default: { bg: colors.sand[100],               text: colors.sand[500] },
};

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  const vc = variantColors[variant];
  return (
    <View
      style={[styles.pill, { backgroundColor: vc.bg }]}
      className={className}
    >
      <Text style={[styles.label, { color: vc.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
