import { TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../../lib/theme';
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
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'sm',
  loading = false,
  disabled = false,
  accessibilityLabel,
}: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  // Touch targets: sm=44pt (parent), lg=56pt (kid). Both within Apple's HIG.
  const minHeight = size === 'lg' ? 56 : 44;

  // Variant resolution. The website uses one rule above all others: the
  // primary CTA appears at most once per screen, fully filled in gold, with
  // the brand-dark sand-900 typography. Secondary is the outline pair.
  let bg: string;
  let textColor: string;
  let borderWidth = 0;
  let borderColor: string = 'transparent';
  let borderRadius = 999; // pill — primary CTA, kid-sized

  switch (variant) {
    case 'primary':
      bg = colors.gold[500];
      textColor = colors.sand[900];
      borderRadius = 999;
      break;
    case 'secondary':
      bg = isDark ? colors.ink[800] : colors.sand[50];
      textColor = isDark ? '#F5F5F0' : colors.sand[900];
      borderWidth = 1;
      borderColor = isDark ? '#F5F5F0' : colors.sand[900];
      borderRadius = 16; // editorial rounded-2xl on outline
      break;
    case 'ghost':
      bg = 'transparent';
      textColor = isDark ? '#F5F5F0' : colors.sand[900];
      borderRadius = 8;
      break;
    case 'danger':
      bg = colors.semantic.danger;
      textColor = colors.sand[50];
      borderRadius = 999;
      break;
    default:
      bg = colors.gold[500];
      textColor = colors.sand[900];
  }

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
          backgroundColor: bg,
          minHeight,
          borderColor,
          borderWidth,
          borderRadius,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
      activeOpacity={variant === 'ghost' ? 0.6 : 0.85}
    >
      {loading ? (
        <Spinner size={20} color={textColor} />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: textColor,
              fontSize: size === 'lg' ? 17 : 15,
              fontFamily: fonts.uiBold,
              textDecorationLine: variant === 'ghost' ? 'underline' : 'none',
            },
          ]}
        >
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
    letterSpacing: -0.1,
  },
});
