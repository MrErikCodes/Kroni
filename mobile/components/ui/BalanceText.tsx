import { Text, TextProps, useColorScheme } from 'react-native';
import { colors, fonts } from '../../lib/theme';

interface BalanceTextProps extends TextProps {
  /** Amount in øre (integer) */
  amountOre: number;
  /** Show big headline variant — uses Newsreader display serif. */
  large?: boolean;
  /** Locale for formatting — defaults to nb-NO */
  locale?: string;
  className?: string;
}

/** Formats integer øre to localized NOK currency string.
 *  Money math stays integer; display formatting only happens here.
 *
 *  The large variant renders in Newsreader so the balance reads as the
 *  editorial centerpiece of the kid's home screen — the same role the
 *  serif headline plays on the website. */
export function BalanceText({
  amountOre,
  large = false,
  locale = 'nb-NO',
  style,
  className,
  ...rest
}: BalanceTextProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const textColor = large
    ? isDark
      ? '#F5F5F0'
      : colors.sand[900]
    : isDark
      ? '#F5F5F0'
      : colors.sand[900];

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(amountOre / 100);

  return (
    <Text
      style={[
        large
          ? {
              fontFamily: fonts.display,
              fontSize: 56,
              lineHeight: 60,
              letterSpacing: -1.4,
              color: textColor,
            }
          : {
              fontFamily: fonts.uiBold,
              fontSize: 22,
              lineHeight: 28,
              letterSpacing: -0.3,
              color: textColor,
            },
        style,
      ]}
      className={className}
      {...rest}
    >
      {formatted}
    </Text>
  );
}
