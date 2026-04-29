import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALES,
  DEFAULT_LOCALE,
  DOMAIN_DEFAULT_LOCALE,
  type Locale,
} from "./app/_i18n/locales";

const LOCALE_COOKIE = "kroni-locale";
const LOCALE_PREFIXES = LOCALES.map((l) => `/${l}`);

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

function localeFromHost(host: string | null): Locale | null {
  if (!host) return null;
  const bare = host.split(":")[0].toLowerCase();
  return DOMAIN_DEFAULT_LOCALE[bare] ?? null;
}

function pickInitialLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host");
  const fromDomain = localeFromHost(host);
  if (fromDomain) return fromDomain;

  const accept = request.headers.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.split(";")[0].trim().toLowerCase();
    const short = code.split("-")[0];
    if (isLocale(short)) return short;
    if (short === "no") return "nb";
  }

  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/brand") ||
    pathname.includes(".")
  ) {
    return;
  }

  const hasLocalePrefix = LOCALE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (hasLocalePrefix) return;

  const locale = pickInitialLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|brand|.*\\.).*)"],
};
