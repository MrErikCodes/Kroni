import Link from "next/link";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  hasLocale,
  localeFromHost,
  type Locale,
} from "../_i18n/locales";
import { getDictionary } from "../_i18n/dict";

const LOCALE_COOKIE = "kroni-locale";

// `[lang]/not-found.tsx` does not receive `params`, so we recover the locale
// from the cookie set by `LocaleSwitcher`, falling back to the host-based
// default and finally `DEFAULT_LOCALE`.
async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && hasLocale(cookieLocale)) return cookieLocale;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return localeFromHost(host) ?? DEFAULT_LOCALE;
}

export default async function NotFound() {
  const locale = await resolveLocale();
  const dict = await getDictionary(locale);
  const t = dict.notFound;

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-gold-100 opacity-60 blur-3xl"
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-start px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
        <p className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.14em] text-sand-700">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-500" />
          {t.eyebrow}
        </p>
        <h1 className="mt-6 max-w-2xl font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-sand-900 sm:text-[56px]">
          {t.title}
        </h1>
        <p className="mt-5 max-w-xl text-[17px] leading-[1.6] text-sand-500">
          {t.body}
        </p>
        <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href={`/${locale}`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
          >
            {t.ctaHome}
          </Link>
          <Link
            href={`/${locale}/support`}
            className="inline-flex h-12 items-center justify-center rounded-full border border-sand-900 bg-transparent px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-sand-100"
          >
            {t.ctaSupport}
          </Link>
        </div>
      </div>
    </section>
  );
}
