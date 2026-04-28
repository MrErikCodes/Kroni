import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "./_components/SiteHeader";
import SiteFooter from "./_components/SiteFooter";

export const metadata: Metadata = {
  title: "Kroni — Ukepenger og oppgaver for familier",
  description:
    "Kroni hjelper familier med å gi barn ansvar gjennom oppgaver, belønninger og ukepenger. Last ned appen gratis.",
  openGraph: {
    title: "Kroni — Ukepenger og oppgaver for familier",
    description:
      "Kroni hjelper familier med å gi barn ansvar gjennom oppgaver, belønninger og ukepenger.",
    images: [{ url: "/og-image.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F5B015",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb-NO" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
