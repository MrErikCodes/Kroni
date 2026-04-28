import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import SiteHeader from "./_components/SiteHeader";
import SiteFooter from "./_components/SiteFooter";

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

export const metadata: Metadata = {
  title: "Kroni — Lommepenger og oppgaver for familier",
  description:
    "Kroni hjelper norske familier med å lære barn å mestre — gjennom oppgaver, ukepenger og belønninger. Laget i Norge.",
  openGraph: {
    title: "Kroni — Lommepenger og oppgaver for familier",
    description:
      "Lommepenger som lærer barn å mestre, ikke å forvente. Laget i Norge for norske familier.",
    images: [{ url: "/og-image.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FBFAF6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb-NO"
      className={`${inter.variable} ${newsreader.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased bg-sand-50 text-sand-900">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
