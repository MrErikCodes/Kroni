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

// Subscribers listen for locale flips so React can rerender any tree
// downstream. We don't reach for context here — the root layout uses
// `subscribeLocale` to bump a key on the navigation stack, which remounts
// every screen and forces all `t(...)` calls to re-evaluate against the
// new locale. Cheaper than threading a context through every screen.
type LocaleListener = (locale: 'nb' | 'en') => void;
const listeners = new Set<LocaleListener>();

export function subscribeLocale(fn: LocaleListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function setAppLocale(locale: string | null | undefined): void {
  const next = normalize(locale);
  if (i18n.locale === next) return;
  i18n.locale = next;
  for (const fn of listeners) fn(next);
}

export { i18n };

/** Convenience shorthand */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
