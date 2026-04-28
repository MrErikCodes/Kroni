import { I18n } from 'i18n-js';

import nb from './nb.json';
import en from './en.json';

export type AppLocale = 'nb-NO' | 'en-US';

export const SUPPORTED_LOCALES: ReadonlyArray<{ code: AppLocale; label: string }> = [
  { code: 'nb-NO', label: 'Norsk (bokmål)' },
  { code: 'en-US', label: 'English' },
];

// nb is default. en falls back to nb for missing keys via enableFallback so
// partial English translations degrade gracefully while the rest of en.json
// gets filled in. Server-stored parents.locale drives both UI and email.
const i18n = new I18n({ nb, en });

i18n.locale = 'nb';
i18n.defaultLocale = 'nb';
i18n.enableFallback = true;

function normalize(locale: string | null | undefined): 'nb' | 'en' {
  if (!locale) return 'nb';
  if (locale.toLowerCase().startsWith('en')) return 'en';
  return 'nb';
}

export function setAppLocale(locale: string | null | undefined): void {
  i18n.locale = normalize(locale);
}

export { i18n };

/** Convenience shorthand */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
