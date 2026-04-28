// [REVIEW] copy generated; native review needed.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_NB = [
  { href: "/", label: "Hjem" },
  { href: "/personvern", label: "Personvern" },
  { href: "/vilkar", label: "Vilkår" },
  { href: "/support", label: "Støtte" },
];

const NAV_EN = [
  { href: "/en", label: "Home" },
  { href: "/personvern", label: "Privacy" },
  { href: "/vilkar", label: "Terms" },
  { href: "/support", label: "Support" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const isEn = pathname?.startsWith("/en") ?? false;
  const nav = isEn ? NAV_EN : NAV_NB;

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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href={isEn ? "/en" : "/"}
          className="group inline-flex items-baseline gap-1.5"
          aria-label={isEn ? "Kroni — home" : "Kroni — hjem"}
        >
          <span className="font-display text-[22px] font-semibold tracking-tight text-sand-900">
            Kroni
          </span>
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-gold-500 transition-transform duration-300 group-hover:scale-125"
          />
        </Link>

        <nav aria-label={isEn ? "Site navigation" : "Nettstednavigasjon"}>
          <ul className="flex items-center gap-1 sm:gap-2">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : item.href === "/en"
                    ? pathname === "/en"
                    : pathname?.startsWith(item.href);
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
      </div>
    </header>
  );
}
