import { I18n } from 'i18n-js';

import nb from './nb.json';

// Kroni is a Norwegian-first product. v1 ships in Bokmål only — no device
// detection, no English fallback at the UI layer. sv/da/en files exist but
// are not loaded; add them back when proper translations land.
const i18n = new I18n({ nb });

i18n.locale = 'nb';
i18n.defaultLocale = 'nb';
i18n.enableFallback = true;

export { i18n };

/** Convenience shorthand */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
