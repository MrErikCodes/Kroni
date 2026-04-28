import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kroni — Chores, rewards and allowance for families",
  description:
    "Kroni helps families build responsibility through chores, rewards and weekly allowance. Download the app for free.",
  openGraph: {
    title: "Kroni — Chores, rewards and allowance for families",
    description:
      "Kroni helps families build responsibility through chores, rewards and weekly allowance.",
    images: [{ url: "/og-image.png" }],
  },
  alternates: { canonical: "/en" },
};

// The /en segment overrides the lang attribute via the root layout's html element.
// Next.js App Router does not support nested <html>/<body> tags; the root layout
// handles the shell. This layout only overrides metadata for the /en subtree.
export default function EnLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
