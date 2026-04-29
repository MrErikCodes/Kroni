import "server-only";
import type { Locale } from "./locales";
import { nb } from "./dicts/nb";
import { en } from "./dicts/en";
import { sv } from "./dicts/sv";
import { da } from "./dicts/da";

export type Dictionary = typeof nb;

const DICTIONARIES: Record<Locale, Dictionary> = { nb, en, sv, da };

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return DICTIONARIES[locale];
}
