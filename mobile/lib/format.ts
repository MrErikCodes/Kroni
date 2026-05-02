import type { Currency } from '@kroni/shared';

// Format integer minor units (øre / öre / øre — same idea, all 100x) as a
// localized currency string. The locale used for formatting tracks the
// currency, NOT the UI language: a parent who picks English UI but has
// currency=NOK still sees "kr 50" rather than "NOK 50". Mixing the two
// produces the ISO-code prefix because the runtime can't render the
// native symbol when the locale doesn't claim that currency as its own.
const CURRENCY_LOCALE: Record<Currency, string> = {
  NOK: 'nb-NO',
  SEK: 'sv-SE',
  DKK: 'da-DK',
};

export interface FormatMoneyOptions {
  /** When true, always show a sign — used for delta entries in history. */
  signed?: boolean;
  /** Override fraction digits — defaults to 0 (whole-unit display). */
  fractionDigits?: number;
}

/**
 * Format an integer minor-unit amount as the household's currency.
 * `currency` falls back to NOK so callers that haven't loaded `me` yet
 * still render a sensible string instead of the ISO code.
 */
export function formatMoney(
  minorUnits: number,
  currency: Currency | null | undefined,
  opts: FormatMoneyOptions = {},
): string {
  const cur: Currency = currency ?? 'NOK';
  const locale = CURRENCY_LOCALE[cur];
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: opts.fractionDigits ?? 0,
    ...(opts.signed ? { signDisplay: 'always' as const } : {}),
  }).format(minorUnits / 100);
}
