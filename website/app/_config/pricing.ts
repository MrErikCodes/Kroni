// Single source of truth for Kroni pricing on the marketing site.
// Update the numbers here and they propagate through pricing cards, FAQ
// answers, the legal terms (vilkår), and any future caller. The mobile app
// and App Store description templates aren't wired through this — those
// are listed in `docs/pricing-sources.md` as separate sync points.
//
// Sales / promotions: populate `SALE_PRICES`. The effective `prices`
// export prefers a sale override over the base price.

export type Locale = "en" | "nb" | "sv" | "da";

export const CURRENCY = "NOK";

const BASE_PRICES = {
  monthly: 49,
  yearly: 399,
  lifetime: 1199,
} as const;

const SALE_PRICES: Partial<Record<keyof typeof BASE_PRICES, number>> = {};

export const prices = {
  monthly: SALE_PRICES.monthly ?? BASE_PRICES.monthly,
  yearly: SALE_PRICES.yearly ?? BASE_PRICES.yearly,
  lifetime: SALE_PRICES.lifetime ?? BASE_PRICES.lifetime,
};

// Rounded percent savings on yearly vs. paying monthly for 12 months.
// Computed so the displayed "save N%" badge stays in sync with the prices.
export const yearlySavingsPercent = Math.round(
  (1 - prices.yearly / (prices.monthly * 12)) * 100,
);

// Format a numeric price with the locale-appropriate thousands separator.
// English uses a comma; Nordic locales use a non-breaking space.
export function formatPrice(amount: number, locale: Locale): string {
  if (amount < 1000) return String(amount);
  const sep = locale === "en" ? "," : " ";
  const thousands = Math.floor(amount / 1000);
  const rest = (amount % 1000).toString().padStart(3, "0");
  return `${thousands}${sep}${rest}`;
}
