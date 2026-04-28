// [REVIEW] Norwegian copy generated; native review needed.
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-sand-200 bg-sand-100 dark:border-ink-800 dark:bg-ink-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-sand-500 sm:flex-row sm:px-6 dark:text-sand-500">
        <p>© 2026 Nilsen Konsult. Alle rettigheter forbeholdt.</p>
        <nav aria-label="Fotnavigasjon">
          <ul className="flex flex-wrap gap-4">
            <li>
              <Link
                href="/personvern"
                className="transition-colors hover:text-gold-500 dark:hover:text-gold-300"
              >
                Personvern
              </Link>
            </li>
            <li>
              <Link
                href="/vilkar"
                className="transition-colors hover:text-gold-500 dark:hover:text-gold-300"
              >
                Vilkår
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="transition-colors hover:text-gold-500 dark:hover:text-gold-300"
              >
                Støtte
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
