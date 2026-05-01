import { CANONICAL_DOMAIN, LOCALES, type Locale } from "../_i18n/locales";

/**
 * Build a per-route `alternates.languages` map for hreflang.
 *
 * Each locale points at its canonical domain + the locale prefix + the slug,
 * e.g. `localizedAlternates("vilkar")` →
 *   {
 *     nb: "https://kroni.no/nb/vilkar",
 *     en: "https://kroni.no/en/vilkar",
 *     sv: "https://kroni.se/sv/vilkar",
 *     da: "https://kroni.dk/da/vilkar",
 *   }
 *
 * `slug` should be the path under `/<lang>/` without leading slash.
 * Pass `""` for the locale root (`/<lang>`).
 */
export function localizedAlternates(slug: string): Record<Locale, string> {
  const trimmed = slug.replace(/^\/+|\/+$/g, "");
  const suffix = trimmed.length > 0 ? `/${trimmed}` : "";
  return Object.fromEntries(
    LOCALES.map((l) => [l, `${CANONICAL_DOMAIN[l]}/${l}${suffix}`]),
  ) as Record<Locale, string>;
}
