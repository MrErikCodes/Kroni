import Link from "next/link";
import "./globals.css";
import { en } from "./_i18n/dicts/en";

// Top-level fallback for the rare case the user lands on a path before the
// proxy resolves a locale (or for unmatched non-locale paths). Defaults to
// English copy.
export default function RootNotFound() {
  const t = en.notFound;
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased bg-sand-50 text-sand-900 flex items-center justify-center px-5 py-20">
        <div className="mx-auto max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.14em] text-sand-700">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            {t.eyebrow}
          </p>
          <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-sand-900 sm:text-[56px]">
            {t.title}
          </h1>
          <p className="mt-5 text-[17px] leading-[1.6] text-sand-500">{t.body}</p>
          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/en"
              className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
            >
              {t.ctaHome}
            </Link>
            <Link
              href="/en/support"
              className="inline-flex h-12 items-center justify-center rounded-full border border-sand-900 bg-transparent px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-sand-100"
            >
              {t.ctaSupport}
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
