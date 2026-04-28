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

// Kroni is a Norwegian-first product. Default to Bokmål and only fall back to
// the device locale when it is one of the explicitly-supported Scandinavian
// languages. English serves as a last-resort fallback for non-Scandinavian
// devices, but until proper sv/da translations land, nb is the safer default.
function detectLocale(): string {
  const locales = getLocales();
  const deviceLocale = locales[0]?.languageCode ?? 'nb';

  if (deviceLocale === 'sv') return 'sv';
  if (deviceLocale === 'da') return 'da';
  if (deviceLocale === 'en') return 'en';
  // Default — Norwegian Bokmål, including 'nb', 'no', or anything unmapped.
  return 'nb';
}

i18n.locale = detectLocale();
i18n.defaultLocale = 'nb';
i18n.enableFallback = true;

export { i18n };

/** Convenience shorthand */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
