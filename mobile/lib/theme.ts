import { useColorScheme } from 'react-native';

// Color tokens — mirrors tailwind.config.js
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
    500: '#8B8472',
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

// Typography scale (px values used for RN fontSize)
export const typography = {
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
  // SF Pro on iOS (system), Inter on Android via expo-font
  family: {
    ios:     'System',
    android: 'Inter',
  },
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

// Corner radii
export const radii = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
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
    spacing,
    radii,
    touchTarget,
    isDark,
    surface: {
      background: isDark ? colors.ink[900]   : colors.sand[50],
      card:       isDark ? colors.ink[800]   : '#FFFFFF',
      border:     isDark ? '#2A3040'         : colors.sand[200],
    },
    text: {
      primary:   isDark ? '#F5F5F0'          : colors.sand[900],
      secondary: isDark ? '#9AA0AA'          : colors.sand[500],
      inverse:   isDark ? colors.sand[900]   : '#FFFFFF',
    },
  } as const;
}

/** Hook returning resolved theme tokens for the current color scheme. */
export function useTheme(): ResolvedTheme {
  const scheme = useColorScheme() ?? 'light';
  return resolveTheme(scheme);
}
