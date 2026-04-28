import { Text, TextProps, useColorScheme } from 'react-native';
import { colors, fonts } from '../../lib/theme';

interface LabelProps extends TextProps {
  /** When true the label reads as an editorial eyebrow — uppercase, tracked,
   *  sand-500 — to match the website's "EYEBROW · SECTION" pattern. */
  eyebrow?: boolean;
}

export function Label({
  style,
  children,
  eyebrow = false,
  ...rest
}: LabelProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  return (
    <Text
      style={[
        eyebrow
          ? {
              fontFamily: fonts.uiBold,
              fontSize: 11,
              lineHeight: 14,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: isDark ? '#9AA0AA' : colors.sand[500],
              marginBottom: 8,
            }
          : {
              fontFamily: fonts.uiMedium,
              fontSize: 13,
              lineHeight: 18,
              letterSpacing: 0,
              color: isDark ? '#9AA0AA' : colors.sand[500],
              marginBottom: 6,
            },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
