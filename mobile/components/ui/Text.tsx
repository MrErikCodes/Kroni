// KroniText — single primitive that owns the type system for the re-skinned app.
//
// Two type families: Newsreader (serif display) for hero/section headlines,
// Inter (sans UI) for body and metadata. Variants encode the website's
// editorial scale; surfaces should reach for these instead of ad-hoc fontSize
// + fontFamily pairs.
import { Text, TextProps, TextStyle, useColorScheme } from 'react-native';
import { colors, fonts } from '../../lib/theme';

export type KroniTextVariant =
  | 'display'        // Newsreader 600 — section headlines (28-32pt)
  | 'displayLarge'   // Newsreader 600 — hero headline (40-48pt)
  | 'displayItalic'  // Newsreader 600 italic — emphasized noun within a headline
  | 'eyebrow'        // Inter 600 uppercase — small kicker above headlines
  | 'h1'             // Inter 700 — large UI title (when serif is overkill)
  | 'h2'             // Inter 600 — medium UI title
  | 'body'           // Inter 400 — body copy at 16pt
  | 'bodyLarge'      // Inter 400 — relaxed reading body at 18pt
  | 'small'          // Inter 400 — secondary meta at 14pt
  | 'caption'        // Inter 500 — captions / trust strip at 12pt
  | 'mono';          // tabular numerals (paring code, balance)

interface KroniTextProps extends TextProps {
  variant?: KroniTextVariant;
  /** Force a tone — defaults to primary for headlines, secondary for captions. */
  tone?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'gold' | 'danger';
}

const VARIANT_STYLES: Record<KroniTextVariant, TextStyle> = {
  display: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.7,
  },
  displayLarge: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.0,
  },
  displayItalic: {
    fontFamily: fonts.displayItalic,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.7,
  },
  eyebrow: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  h1: {
    fontFamily: fonts.uiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: fonts.uiBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: fonts.ui,
    fontSize: 18,
    lineHeight: 28,
  },
  small: {
    fontFamily: fonts.ui,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  mono: {
    fontFamily: fonts.uiBold,
    fontSize: 18,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
};

const DEFAULT_TONE: Record<KroniTextVariant, KroniTextProps['tone']> = {
  display: 'primary',
  displayLarge: 'primary',
  displayItalic: 'primary',
  eyebrow: 'tertiary',
  h1: 'primary',
  h2: 'primary',
  body: 'primary',
  bodyLarge: 'primary',
  small: 'secondary',
  caption: 'secondary',
  mono: 'primary',
};

export function KroniText({
  variant = 'body',
  tone,
  style,
  children,
  ...rest
}: KroniTextProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  const resolvedTone = tone ?? DEFAULT_TONE[variant] ?? 'primary';

  let color: string;
  switch (resolvedTone) {
    case 'primary':
      color = isDark ? '#F5F5F0' : colors.sand[900];
      break;
    case 'secondary':
      color = isDark ? '#9AA0AA' : colors.sand[500];
      break;
    case 'tertiary':
      color = isDark ? '#6E7682' : colors.sand[700];
      break;
    case 'inverse':
      color = isDark ? colors.sand[900] : colors.sand[50];
      break;
    case 'gold':
      color = colors.gold[700];
      break;
    case 'danger':
      color = colors.semantic.danger;
      break;
    default:
      color = isDark ? '#F5F5F0' : colors.sand[900];
  }

  return (
    <Text
      style={[VARIANT_STYLES[variant], { color }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}
