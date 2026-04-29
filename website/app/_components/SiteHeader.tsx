"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LocaleSwitcher from "./LocaleSwitcher";
import type { Locale } from "../_i18n/locales";
import type { Dictionary } from "../_i18n/dict";

export default function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname() || "/";
  const base = `/${locale}`;
  const nav = [
    { href: `${base}`, label: dict.header.home, exact: true },
    { href: `${base}/personvern`, label: dict.header.privacy },
    { href: `${base}/vilkar`, label: dict.header.terms },
    { href: `${base}/support`, label: dict.header.support },
  ];

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "bg-sand-50/85 border-b border-sand-200 backdrop-blur-md"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href={base}
          className="group inline-flex items-baseline gap-1.5"
          aria-label={dict.header.homeAria}
        >
          <span className="font-display text-[22px] font-semibold tracking-tight text-sand-900">
            Kroni
          </span>
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-gold-500 transition-transform duration-300 group-hover:scale-125"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <nav aria-label={dict.header.nav} className="hidden sm:block">
            <ul className="flex items-center gap-1 sm:gap-2">
              {nav.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        "inline-flex items-center rounded-md px-2.5 py-1.5 text-[13px] font-medium tracking-tight transition-colors sm:px-3 sm:text-[14px]",
                        active
                          ? "text-sand-900"
                          : "text-sand-500 hover:text-sand-900",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <LocaleSwitcher current={locale} label={dict.header.languageMenu} />
        </div>
      </div>
    </header>
  );
}
