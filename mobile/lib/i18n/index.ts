// [REVIEW] sv.json and da.json contain English placeholder values. Full Scandinavian translations needed.
import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';

import nb from './nb.json';
import sv from './sv.json';
import da from './da.json';
import en from './en.json';

const i18n = new I18n({
  nb,
  sv,
  da,
  en,
});

// Detect device locale — default to 'nb' for Scandinavian locales, 'en' otherwise
function detectLocale(): string {
  const locales = getLocales();
  const deviceLocale = locales[0]?.languageCode ?? 'nb';

  if (deviceLocale === 'nb' || deviceLocale === 'no') return 'nb';
  if (deviceLocale === 'sv') return 'sv';
  if (deviceLocale === 'da') return 'da';
  return 'en';
}

i18n.locale = detectLocale();
i18n.defaultLocale = 'nb';
i18n.enableFallback = true;

export { i18n };

/** Convenience shorthand */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
