import { I18n } from 'i18n-js';

import nb from './nb.json';
import en from './en.json';
import sv from './sv.json';
import da from './da.json';

export type AppLocale = 'nb-NO' | 'en-US' | 'sv-SE' | 'da-DK';
export type ShortLocale = 'nb' | 'en' | 'sv' | 'da';

export const SUPPORTED_LOCALES: readonly { code: AppLocale; label: string }[] = [
  { code: 'nb-NO', label: 'Norsk (bokmål)' },
  { code: 'en-US', label: 'English' },
  { code: 'sv-SE', label: 'Svenska' },
  { code: 'da-DK', label: 'Dansk' },
];

// nb is default. Other locales fall back to nb for missing keys via
// enableFallback so partial translations degrade gracefully while the rest
// of the JSON files get filled in. Server-stored parents.locale drives both
// UI and email.
const i18n = new I18n({ nb, en, sv, da });

i18n.locale = 'nb';
i18n.defaultLocale = 'nb';
i18n.enableFallback = true;

// Launch markets are NO / SE / DK only — we ship four UI locales:
// nb (Norwegian Bokmål, default), sv (Swedish), da (Danish) and en (English).
// `nb-*`, `nn-*` and the legacy `no` tag all map to `nb`. `sv-*`/`da-*`/`en-*`
// map to their respective bundles. Anything else (de, fr, es, …) falls
// through to `en` — non-Nordic speakers are far more likely to read English
// than Norwegian, so the previous `nb` catch-all was wrong. The empty/null
// case keeps `nb` so genuinely missing input still hits the app's default.
function normalize(locale: string | null | undefined): ShortLocale {
  if (!locale) return 'nb';
  const lower = locale.toLowerCase();
  if (
    lower.startsWith('nb') ||
    lower.startsWith('nn') ||
    lower === 'no' ||
    lower.startsWith('no-') ||
    lower.startsWith('no_')
  ) {
    return 'nb';
  }
  if (lower.startsWith('sv')) return 'sv';
  if (lower.startsWith('da')) return 'da';
  if (lower.startsWith('en')) return 'en';
  return 'en';
}

// Subscribers listen for locale flips so React can rerender any tree
// downstream. We don't reach for context here — the root layout uses
// `subscribeLocale` to bump a key on the navigation stack, which remounts
// every screen and forces all `t(...)` calls to re-evaluate against the
// new locale. Cheaper than threading a context through every screen.
type LocaleListener = (locale: ShortLocale) => void;
const listeners = new Set<LocaleListener>();

export function subscribeLocale(fn: LocaleListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function setAppLocale(locale: string | null | undefined): void {
  const next = normalize(locale);
  if (i18n.locale === next) {
    console.log('[locale] setAppLocale noop', { locale, current: i18n.locale });
    return;
  }
  console.log('[locale] setAppLocale FIRE', {
    from: i18n.locale,
    to: next,
    raw: locale,
    listeners: listeners.size,
  });
  i18n.locale = next;
  for (const fn of listeners) fn(next);
}

export function getAppLocale(): ShortLocale {
  return (i18n.locale as ShortLocale) ?? 'nb';
}

const LEGAL_DOMAIN: Record<ShortLocale, string> = {
  nb: 'https://kroni.no',
  en: 'https://kroni.no',
  sv: 'https://kroni.se',
  da: 'https://kroni.dk',
};

export function legalUrl(path: 'vilkar' | 'personvern'): string {
  const locale = getAppLocale();
  return `${LEGAL_DOMAIN[locale]}/${locale}/${path}`;
}

export { i18n };

/** Convenience shorthand */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
