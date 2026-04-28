// [REVIEW] Norwegian copy generated; native review needed.
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="w-full border-b border-sand-200 bg-sand-50 dark:border-ink-800 dark:bg-ink-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-gold-500"
          aria-label="Kroni — hjem"
        >
          Kroni
        </Link>
        <nav aria-label="Nettstednavigasjon">
          <ul className="flex items-center gap-4 text-sm font-medium sm:gap-6">
            <li>
              <Link
                href="/"
                className="text-sand-900 transition-colors hover:text-gold-500 dark:text-sand-100 dark:hover:text-gold-300"
              >
                Hjem
              </Link>
            </li>
            <li>
              <Link
                href="/personvern"
                className="text-sand-900 transition-colors hover:text-gold-500 dark:text-sand-100 dark:hover:text-gold-300"
              >
                Personvern
              </Link>
            </li>
            <li>
              <Link
                href="/vilkar"
                className="text-sand-900 transition-colors hover:text-gold-500 dark:text-sand-100 dark:hover:text-gold-300"
              >
                Vilkår
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="text-sand-900 transition-colors hover:text-gold-500 dark:text-sand-100 dark:hover:text-gold-300"
              >
                Støtte
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
