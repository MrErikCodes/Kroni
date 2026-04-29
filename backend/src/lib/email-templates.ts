import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from './logger.js';

export type SupportedLocale = 'nb-NO' | 'sv-SE' | 'da-DK' | 'en-US';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  'nb-NO',
  'sv-SE',
  'da-DK',
  'en-US',
];

// Resolve `backend/src/emails` relative to this file. Works in both `tsx`
// dev (running .ts) and the compiled dist build, since the directory tree
// mirrors `dist/lib/email-templates.js` -> `dist/emails/...`.
const __filename = fileURLToPath(import.meta.url);
const EMAILS_DIR = join(dirname(__filename), '..', 'emails');

// Cache loaded files so we hit disk once per process. Keyed by full path.
const fileCache = new Map<string, string>();

function readCached(path: string): string {
  const cached = fileCache.get(path);
  if (cached !== undefined) return cached;
  const contents = readFileSync(path, 'utf8');
  fileCache.set(path, contents);
  return contents;
}

function tryLoad(event: string, locale: SupportedLocale): EmailTemplate | null {
  try {
    const subject = readCached(
      join(EMAILS_DIR, `${event}.${locale}.subject.txt`),
    ).trim();
    const html = readCached(join(EMAILS_DIR, `${event}.${locale}.html`));
    const text = readCached(join(EMAILS_DIR, `${event}.${locale}.txt`));
    return { subject, html, text };
  } catch {
    return null;
  }
}

function substitute(input: string, vars: Record<string, string>): string {
  // Simple `{{name}}` -> value replacement. Unknown placeholders left as-is
  // so they're visible in QA rather than silently blanked out.
  return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) => {
    const v = vars[key];
    return v === undefined ? match : v;
  });
}

/**
 * Load a localized email template, substituting `{{name}}` style vars.
 *
 * Locale fallback: requested -> `nb-NO` (mobile default) -> `en-US`. Each
 * non-en template embeds its English fallback inline (per docs/email.md),
 * so this helper does NOT concatenate two locales — it just picks the
 * right file. Subject lines are locale-only.
 */
export function loadTemplate(
  event: string,
  locale: SupportedLocale,
  vars: Record<string, string>,
): EmailTemplate {
  const tried: SupportedLocale[] = [];
  const candidates: SupportedLocale[] = [locale, 'nb-NO', 'en-US'];

  for (const cand of candidates) {
    if (tried.includes(cand)) continue;
    tried.push(cand);
    const tpl = tryLoad(event, cand);
    if (tpl) {
      if (cand !== locale) {
        logger.warn(
          { event, requested: locale, used: cand },
          'email template fell back to alternate locale',
        );
      }
      return {
        subject: substitute(tpl.subject, vars),
        html: substitute(tpl.html, vars),
        text: substitute(tpl.text, vars),
      };
    }
  }

  throw new Error(
    `email template not found for event="${event}" (tried ${tried.join(', ')})`,
  );
}

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
