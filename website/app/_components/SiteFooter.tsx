import Link from "next/link";
import type { Locale } from "../_i18n/locales";
import type { Dictionary } from "../_i18n/dict";

export default function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const base = `/${locale}`;
  return (
    <footer className="mt-24 border-t border-sand-200 bg-sand-50">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 py-16 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <div className="inline-flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-semibold tracking-tight text-sand-900">
                Kroni
              </span>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-gold-500"
              />
            </div>
            <p className="mt-4 max-w-sm font-display text-[19px] italic leading-snug text-sand-700">
              {dict.footer.tagline}
            </p>
            <p className="mt-6 text-[13px] leading-relaxed text-sand-500">
              {dict.footer.blurb}
            </p>
          </div>

          <div className="sm:col-span-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-sand-500">
              {dict.footer.productHeading}
            </h3>
            <ul className="mt-5 space-y-3 text-[15px]">
              <li>
                <Link
                  href={base}
                  className="text-sand-900 transition-colors hover:text-gold-700"
                >
                  {dict.footer.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`${base}/support`}
                  className="text-sand-900 transition-colors hover:text-gold-700"
                >
                  {dict.footer.support}
                </Link>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-sand-500">
              {dict.footer.companyHeading}
            </h3>
            <ul className="mt-5 space-y-3 text-[15px]">
              <li>
                <Link
                  href={`${base}/personvern`}
                  className="text-sand-900 transition-colors hover:text-gold-700"
                >
                  {dict.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`${base}/vilkar`}
                  className="text-sand-900 transition-colors hover:text-gold-700"
                >
                  {dict.footer.terms}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@kroni.no"
                  className="text-sand-900 transition-colors hover:text-gold-700"
                >
                  support@kroni.no
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-sand-200 py-6 text-[12px] text-sand-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{dict.footer.copyright}</p>
          <p className="font-display italic">{dict.footer.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
