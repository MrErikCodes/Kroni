import { Text, TextProps, useColorScheme } from 'react-native';
import { colors } from '../../lib/theme';

interface BalanceTextProps extends TextProps {
  /** Amount in øre (integer) */
  amountOre: number;
  /** Show big headline variant */
  large?: boolean;
  /** Locale for formatting — defaults to nb-NO */
  locale?: string;
  className?: string;
}

/** Formats integer øre to localized NOK currency string.
 *  Money math stays integer; display formatting only happens here. */
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
  const textColor = isDark ? '#F5F5F0' : colors.sand[900];

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(amountOre / 100);

  return (
    <Text
      style={[
        {
          fontSize: large ? 48 : 22,
          fontWeight: '700',
          color: large ? colors.gold[500] : textColor,
          letterSpacing: large ? -1 : 0,
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
