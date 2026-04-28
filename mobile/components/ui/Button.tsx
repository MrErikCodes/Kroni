import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/theme';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  className?: string;
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary:   { bg: colors.gold[500],    text: '#FFFFFF' },
  secondary: { bg: colors.sand[100],    text: colors.sand[900], border: colors.sand[200] },
  ghost:     { bg: 'transparent',       text: colors.sand[900] },
  danger:    { bg: colors.semantic.danger, text: '#FFFFFF' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'sm',
  loading = false,
  disabled = false,
  accessibilityLabel,
  className,
}: ButtonProps) {
  const vs = variantStyles[variant];
  // Touch targets: sm=44pt (parent), lg=56pt (kid)
  const minHeight = size === 'lg' ? 56 : 44;

  async function handlePress() {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
      style={[
        styles.base,
        {
          backgroundColor: vs.bg,
          minHeight,
          borderColor: vs.border ?? 'transparent',
          borderWidth: vs.border ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
          borderRadius: 999,
        },
      ]}
      className={className}
      activeOpacity={0.8}
    >
      {loading ? (
        <Spinner size={20} color={vs.text} />
      ) : (
        <Text style={[styles.label, { color: vs.text, fontSize: size === 'lg' ? 18 : 16 }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  label: {
    fontWeight: '600',
  },
});
