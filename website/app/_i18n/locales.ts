export const LOCALES = ["nb", "en", "sv", "da"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "nb";

export const LOCALE_LABELS: Record<Locale, string> = {
  nb: "Norsk",
  en: "English",
  sv: "Svenska",
  da: "Dansk",
};

export const HTML_LANG: Record<Locale, string> = {
  nb: "nb-NO",
  en: "en",
  sv: "sv-SE",
  da: "da-DK",
};

export const DOMAIN_DEFAULT_LOCALE: Record<string, Locale> = {
  "kroni.no": "nb",
  "www.kroni.no": "nb",
  "kroni.se": "sv",
  "www.kroni.se": "sv",
  "kroni.dk": "da",
  "www.kroni.dk": "da",
};

export function hasLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function localeFromHost(host: string | null | undefined): Locale {
  if (!host) return DEFAULT_LOCALE;
  const bare = host.split(":")[0].toLowerCase();
  return DOMAIN_DEFAULT_LOCALE[bare] ?? "en";
}
