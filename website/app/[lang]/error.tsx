"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "../_i18n/locales";
import { nb } from "../_i18n/dicts/nb";
import { en } from "../_i18n/dicts/en";
import { sv } from "../_i18n/dicts/sv";
import { da } from "../_i18n/dicts/da";

// Error boundaries are Client Components, which means we can't use the
// `getDictionary` server helper. We import the four small dicts statically
// (they're already shipped to the client elsewhere via the layout chain) and
// pick the locale from the URL pathname.
const DICTS = { nb, en, sv, da } as const;

function localeFromPath(pathname: string | null): Locale {
  if (!pathname) return DEFAULT_LOCALE;
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && (LOCALES as readonly string[]).includes(first)) {
    return first as Locale;
  }
  return DEFAULT_LOCALE;
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = useMemo(() => localeFromPath(pathname), [pathname]);
  const t = DICTS[locale].error;

  useEffect(() => {
    // Surface to the browser console; production telemetry is out of scope
    // until launch.
    console.error(error);
  }, [error]);

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
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
          >
            {t.retry}
          </button>
          <Link
            href={`/${locale}`}
            className="inline-flex h-12 items-center justify-center rounded-full border border-sand-900 bg-transparent px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-sand-100"
          >
            {t.ctaHome}
          </Link>
        </div>
      </div>
    </section>
  );
}
