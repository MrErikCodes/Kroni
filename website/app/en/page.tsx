import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kroni — Chores, rewards and allowance for families",
  description:
    "Kroni helps families build responsibility through chores, rewards and weekly allowance. Download the app for free.",
  alternates: { canonical: "/en" },
};

const features = [
  {
    title: "Chores",
    description:
      "Create tasks for your kids and track their progress. Approve or decline with a single tap and give direct feedback through the app.",
    icon: "✓",
  },
  {
    title: "Rewards",
    description:
      "Let kids choose rewards to save up for. Real motivation — they can see the goal and know exactly what they need to get there.",
    icon: "★",
  },
  {
    title: "Allowance 💰",
    description:
      "Set a weekly amount and let Kroni handle the payout automatically. Kids learn the value of money in a safe and fun way.",
    icon: null,
  },
];

export default function EnHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-sand-900 sm:text-5xl dark:text-sand-50">
          Allowance and chores —{" "}
          <span className="text-gold-500">simple for the whole family</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-sand-500 dark:text-sand-200">
          Kroni gives parents full oversight and kids real responsibility. Create
          tasks, set allowances and watch your children grow — all in one place.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Kroni on the App Store"
            className="inline-flex h-14 items-center justify-center rounded-xl bg-sand-900 px-6 text-sm font-semibold text-sand-50 transition-opacity hover:opacity-80 dark:bg-sand-50 dark:text-sand-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-2 h-5 w-5"
              aria-hidden="true"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            App Store
          </a>
          <a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Kroni on Google Play"
            className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-sand-200 bg-white px-6 text-sm font-semibold text-sand-900 transition-colors hover:border-gold-300 hover:bg-gold-50 dark:border-ink-800 dark:bg-ink-800 dark:text-sand-50 dark:hover:border-gold-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-2 h-5 w-5"
              aria-hidden="true"
            >
              <path d="M3.18 23.76c.3.17.64.24.99.2l.11-.04L13.65 12 4.28.08l-.11-.04A1.49 1.49 0 003.18.24C2.77.49 2.5.96 2.5 1.5v20.99c0 .55.27 1.02.68 1.27zM16.34 15.1l-2.43-2.43 2.43-2.43 2.79 1.61c.8.46.8 1.19 0 1.65l-2.79 1.6zm-2.94-2.94L4.93 3.69l8.29 8.3-.82.17zm0 1.68l.82.17-8.29 8.3 8.47-8.47z" />
            </svg>
            Google Play
          </a>
        </div>
        <p className="mt-4 text-xs text-sand-500 dark:text-sand-500">
          Free to download. Subscription available.
        </p>
      </section>

      {/* Features */}
      <section className="bg-sand-100 dark:bg-ink-800" aria-label="Features">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="mb-12 text-center text-2xl font-bold text-sand-900 sm:text-3xl dark:text-sand-50">
            Everything your family needs
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((f) => (
              <article
                key={f.title}
                className="rounded-2xl bg-white p-6 shadow-sm dark:bg-ink-900"
              >
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-lg font-bold text-gold-700 dark:bg-gold-900/30 dark:text-gold-300"
                  aria-hidden="true"
                >
                  {f.icon ?? "💰"}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-sand-900 dark:text-sand-50">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-sand-500 dark:text-sand-200">
                  {f.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <h2 className="mb-4 text-2xl font-bold text-sand-900 sm:text-3xl dark:text-sand-50">
          Ready to try Kroni?
        </h2>
        <p className="mb-8 text-sand-500 dark:text-sand-200">
          Download the app and get started in minutes.
        </p>
        <Link
          href="#"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-gold-500 px-8 font-semibold text-white transition-colors hover:bg-gold-700"
          aria-label="Download Kroni"
        >
          Download
        </Link>
        <p className="mt-6 text-sm text-sand-500 dark:text-sand-500">
          Questions?{" "}
          <Link
            href="/support"
            className="text-gold-500 hover:underline dark:text-gold-300"
          >
            Visit our support page
          </Link>
          .
        </p>
      </section>
    </>
  );
}
