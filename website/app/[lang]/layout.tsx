import type { Metadata, Viewport, ResolvingMetadata } from "next";
import type { ReactNode } from "react";
import { Inter, Newsreader } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import SiteHeader from "../_components/SiteHeader";
import SiteFooter from "../_components/SiteFooter";
import {
  CANONICAL_DOMAIN,
  HTML_LANG,
  LOCALES,
  hasLocale,
  type Locale,
} from "../_i18n/locales";
import { getDictionary } from "../_i18n/dict";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FBFAF6",
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const base = CANONICAL_DOMAIN[lang];
  const alternates: Metadata["alternates"] = {
    canonical: `${base}/${lang}`,
    languages: Object.fromEntries(
      LOCALES.map((l) => [l, `${CANONICAL_DOMAIN[l]}/${l}`]),
    ),
  };
  return {
    metadataBase: new URL(base),
    title: dict.meta.home.title,
    description: dict.meta.rootDescription,
    alternates,
    openGraph: {
      title: dict.meta.home.title,
      description: dict.meta.home.og,
      url: `${base}/${lang}`,
      images: [{ url: "/og-image.png" }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);
  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${inter.variable} ${newsreader.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased bg-sand-50 text-sand-900">
        <SiteHeader locale={locale} dict={dict} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} dict={dict} />
      </body>
    </html>
  );
}
