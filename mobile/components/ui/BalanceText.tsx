import { Text, TextProps, useColorScheme } from 'react-native';
import { colors, fonts } from '../../lib/theme';
import { formatMoney } from '../../lib/format';
import { useCurrency } from '../../lib/useCurrency';

interface BalanceTextProps extends TextProps {
  /** Amount in øre (integer) */
  amountOre: number;
  /** Show big headline variant — uses Newsreader display serif. */
  large?: boolean;
}

/** Formats integer minor-unit balance to the household's currency.
 *  Money math stays integer; display formatting only happens here.
 *  Currency is read from the cached me query — see lib/useCurrency.ts.
 *
 *  The large variant renders in Newsreader so the balance reads as the
 *  editorial centerpiece of the kid's home screen — the same role the
 *  serif headline plays on the website. */
export function BalanceText({
  amountOre,
  large = false,
  style,
  ...rest
}: BalanceTextProps) {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const currency = useCurrency();
  const textColor = large
    ? isDark
      ? '#F5F5F0'
      : colors.sand[900]
    : isDark
      ? '#F5F5F0'
      : colors.sand[900];

  const formatted = formatMoney(amountOre, currency);

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
      {...rest}
    >
      {formatted}
    </Text>
  );
}
