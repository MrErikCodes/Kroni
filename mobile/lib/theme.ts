import { useColorScheme } from 'react-native';

// Color tokens — mirrors tailwind.config.js and the website's @theme tokens.
export const colors = {
  gold: {
    50:  '#FFF8E6',
    100: '#FFEFC2',
    300: '#FFD263',
    500: '#F5B015',
    700: '#B8800A',
    900: '#6B4806',
  },
  sand: {
    50:  '#FBFAF6',
    100: '#F4F1E8',
    200: '#E8E2D1',
    300: '#D9D1B8',
    500: '#8B8472',
    700: '#4A463B',
    900: '#1F1C14',
  },
  ink: {
    800: '#1A1F26',
    900: '#0E1116',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    danger:  '#EF4444',
    info:    '#3B82F6',
  },
  accent: {
    coral:  '#FB7185',
    violet: '#A78BFA',
    sky:    '#38BDF8',
  },
} as const;

// Font family identifiers loaded by expo-font in app/_layout.tsx.
// `display`/`displayItalic` is Newsreader (serif) for hero/section headlines.
// `ui`/`uiMedium`/`uiBold` is Inter for body, captions, buttons, tab labels.
export const fonts = {
  display:        'Newsreader_600SemiBold',
  displayItalic:  'Newsreader_600SemiBold_Italic',
  displayLight:   'Newsreader_400Regular',
  displayLightItalic: 'Newsreader_400Regular_Italic',
  ui:             'Inter_400Regular',
  uiMedium:       'Inter_500Medium',
  uiBold:         'Inter_600SemiBold',
} as const;

// Typography scale (px values used for RN fontSize).
// `display.*` mirrors the website's editorial display sizing; `body.*` keeps
// Inter UI text on a relaxed line-height.
export const typography = {
  display: {
    28: 28,
    32: 32,
    40: 40,
    48: 48,
  },
  body: {
    14: 14,
    16: 16,
    18: 18,
  },
  // Legacy size scale kept for screens that haven't been migrated yet.
  size: {
    xs:   12,
    sm:   14,
    base: 16,
    lg:   18,
    xl:   22,
    '2xl': 28,
    '3xl': 36,
    '4xl': 48,
  },
  weight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
  },
  family: fonts,
} as const;

// 4-point spacing grid
export const spacing = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  12: 48,
  16: 64,
} as const;

// Corner radii — website uses rounded-2xl on hero cards, rounded-lg on rows,
// rounded-full on primary CTA. Match those by name.
export const radii = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  '2xl': 24,
  pill: 999,
} as const;

// Touch targets
export const touchTarget = {
  parent: 44,
  kid:    56,
} as const;

// Resolved light/dark theme tokens
export type ResolvedTheme = ReturnType<typeof resolveTheme>;

function resolveTheme(colorScheme: 'light' | 'dark') {
  const isDark = colorScheme === 'dark';
  return {
    colors,
    typography,
    fonts,
    spacing,
    radii,
    touchTarget,
    isDark,
    // Surfaces match the website: hairline borders, no shadows, sand-50 base.
    surface: {
      background: isDark ? colors.ink[900] : colors.sand[50],
      // Card surface stays sand-50 in light mode (vs the old pure white) so
      // hairline borders read as the website's editorial panels.
      card:       isDark ? colors.ink[800] : colors.sand[50],
      // A faintly-tinted panel — used for trust strips and quiet section
      // wrappers (matches the website's sand-100/60 strip).
      panel:      isDark ? '#11161D'        : colors.sand[100],
      border:     isDark ? '#2A3040'        : colors.sand[200],
      hairline:   isDark ? '#2A3040'        : colors.sand[200],
    },
    text: {
      primary:   isDark ? '#F5F5F0'         : colors.sand[900],
      // Body / muted text — sand-500 on light, neutral grey on dark.
      secondary: isDark ? '#9AA0AA'         : colors.sand[500],
      // Tertiary used for trust-strip and meta rows.
      tertiary:  isDark ? '#6E7682'         : colors.sand[700],
      inverse:   isDark ? colors.sand[900]  : colors.sand[50],
    },
  } as const;
}

/** Hook returning resolved theme tokens for the current color scheme. */
export function useTheme(): ResolvedTheme {
  const scheme = useColorScheme() ?? 'light';
  return resolveTheme(scheme);
}
