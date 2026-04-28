// [REVIEW] copy generated; native review needed.
import Link from "next/link";

export default function SiteFooter() {
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
              Lommepenger som lærer barn å mestre, ikke å forvente.
            </p>
            <p className="mt-6 text-[13px] leading-relaxed text-sand-500">
              Bygd i Norge for norske familier. Ingen ekte penger,
              ingen reklame, full kontroll.
            </p>
          </div>

          <div className="sm:col-span-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-sand-500">
              Produkt
            </h3>
            <ul className="mt-5 space-y-3 text-[15px]">
              <li>
                <Link
                  href="/"
                  className="text-sand-900 transition-colors hover:text-gold-700"
                >
                  Hjem
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sand-900 transition-colors hover:text-gold-700"
                >
                  Støtte
                </Link>
              </li>
              <li>
                <Link
                  href="/en"
                  className="text-sand-900 transition-colors hover:text-gold-700"
                >
                  English
                </Link>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-sand-500">
              Selskap
            </h3>
            <ul className="mt-5 space-y-3 text-[15px]">
              <li>
                <Link
                  href="/personvern"
                  className="text-sand-900 transition-colors hover:text-gold-700"
                >
                  Personvern
                </Link>
              </li>
              <li>
                <Link
                  href="/vilkar"
                  className="text-sand-900 transition-colors hover:text-gold-700"
                >
                  Vilkår
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
          <p>© 2026 Nilsen Konsult. Alle rettigheter forbeholdt.</p>
          <p className="font-display italic">
            {/* [REVIEW] tagline copy */}
            Laget i Oslo med kaffe og to barn under bordet.
          </p>
        </div>
      </div>
    </footer>
  );
}
