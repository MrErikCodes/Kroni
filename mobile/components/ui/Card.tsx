import { View, ViewProps, useColorScheme } from 'react-native';
import { colors, radii } from '../../lib/theme';

export type CardTone = 'default' | 'elevated' | 'panel' | 'gold';

interface CardProps extends ViewProps {
  /** `default` — sand-50/ink-800 with hairline border, no shadow.
   *  `elevated` — same surface but with a single soft elevation. Reach for
   *  this on at most one highlighted card per screen.
   *  `panel` — sand-100 tinted background for quiet wrapping (trust strips).
   *  `gold` — gold-50 with gold-300 hairline; used for celebration / hero
   *  cards that need to feel warm without leaning on shadow. */
  tone?: CardTone;
  /** `lg` — list rows (radius 16). `xl` / `2xl` — hero/celebration cards. */
  radius?: 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Card({
  style,
  children,
  tone = 'default',
  radius = 'lg',
  className,
  ...rest
}: CardProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  const radiusValue = radius === '2xl' || radius === 'xl' ? 24 : radii.lg;

  let bg: string;
  let borderColor: string;
  switch (tone) {
    case 'panel':
      bg = isDark ? '#11161D' : colors.sand[100];
      borderColor = isDark ? '#2A3040' : colors.sand[200];
      break;
    case 'gold':
      bg = isDark ? colors.gold[900] : colors.gold[50];
      borderColor = isDark ? colors.gold[700] : colors.gold[300];
      break;
    case 'elevated':
      bg = isDark ? colors.ink[800] : colors.sand[50];
      borderColor = isDark ? '#2A3040' : colors.sand[200];
      break;
    case 'default':
    default:
      bg = isDark ? colors.ink[800] : colors.sand[50];
      borderColor = isDark ? '#2A3040' : colors.sand[200];
      break;
  }

  // Restraint > drama: only the elevated tone gets a single soft shadow.
  // Everything else relies on the 1px hairline border, like the website.
  const elevation =
    tone === 'elevated'
      ? {
          shadowColor: '#1F1C14',
          shadowOpacity: isDark ? 0.4 : 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }
      : null;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radiusValue,
          borderWidth: 1,
          borderColor,
          overflow: 'hidden',
        },
        elevation,
        style,
      ]}
      className={className}
      {...rest}
    >
      {children}
    </View>
  );
}
