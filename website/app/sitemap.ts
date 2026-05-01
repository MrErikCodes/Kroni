import type { MetadataRoute } from "next";
import { CANONICAL_DOMAIN, LOCALES, type Locale } from "./_i18n/locales";
import { localizedAlternates } from "./_lib/seo";

const LAST_MODIFIED = new Date("2026-04-29");

// Slugs are identical across locales today (privacy lives at /<lang>/personvern,
// terms at /<lang>/vilkar, support at /<lang>/support). Centralized so future
// locale-specific slugs can be added per-entry without rewriting the loop.
const ROUTES: { slug: string; priority: number }[] = [
  { slug: "", priority: 1.0 },
  { slug: "personvern", priority: 0.7 },
  { slug: "vilkar", priority: 0.7 },
  { slug: "support", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const { slug, priority } of ROUTES) {
    const languages = localizedAlternates(slug);
    for (const lang of LOCALES) {
      entries.push({
        url: urlFor(lang, slug),
        lastModified: LAST_MODIFIED,
        changeFrequency: "monthly",
        priority,
        alternates: { languages },
      });
    }
  }
  return entries;
}

function urlFor(lang: Locale, slug: string): string {
  const base = `${CANONICAL_DOMAIN[lang]}/${lang}`;
  return slug ? `${base}/${slug}` : base;
}
