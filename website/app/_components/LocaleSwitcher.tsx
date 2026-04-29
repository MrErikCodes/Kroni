"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { LOCALES, LOCALE_LABELS, type Locale } from "../_i18n/locales";

const LOCALE_COOKIE = "kroni-locale";

function setLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
}

function swapLocaleInPath(pathname: string, next: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${next}`;
  const [first, ...rest] = parts;
  if ((LOCALES as readonly string[]).includes(first)) {
    return `/${next}/${rest.join("/")}`.replace(/\/$/, "") || `/${next}`;
  }
  return `/${next}${pathname}`;
}

export default function LocaleSwitcher({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  function pick(next: Locale) {
    setLocaleCookie(next);
    setOpen(false);
    if (next === current) return;
    router.push(swapLocaleInPath(pathname, next));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="inline-flex items-center gap-1.5 rounded-md border border-sand-200 bg-sand-50 px-2.5 py-1.5 text-[13px] font-medium tracking-tight text-sand-900 transition-colors hover:bg-white sm:px-3 sm:text-[14px]"
      >
        <Globe aria-hidden="true" strokeWidth={1.6} className="h-3.5 w-3.5" />
        {LOCALE_LABELS[current]}
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.6}
          className={[
            "h-3.5 w-3.5 transition-transform",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-sand-200 bg-sand-50 shadow-[0_8px_30px_rgba(31,28,20,0.10)]"
        >
          {LOCALES.map((l) => {
            const active = l === current;
            return (
              <li key={l}>
                <button
                  type="button"
                  onClick={() => pick(l)}
                  role="option"
                  aria-selected={active}
                  className={[
                    "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[14px] transition-colors",
                    active
                      ? "bg-sand-100 text-sand-900"
                      : "text-sand-700 hover:bg-sand-100 hover:text-sand-900",
                  ].join(" ")}
                >
                  <span>{LOCALE_LABELS[l]}</span>
                  {active ? (
                    <Check
                      aria-hidden="true"
                      strokeWidth={2}
                      className="h-3.5 w-3.5 text-gold-700"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
