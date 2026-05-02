import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { hasLocale, type Locale } from "../../../_i18n/locales";
import { getDictionary } from "../../../_i18n/dict";

// Co-parent invite codes are 6 digits (see backend CodeParam in
// `parent/household.ts`). The `/pair/<code>` page accepts a wider 4–12
// alphanumeric range because kid pairing share-links historically used a
// different alphabet; household invites are strictly numeric. We normalize
// here, falling back to notFound() for anything else.
const INVITE_CODE_PATTERN = /^\d{6}$/;

function normalizeCode(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, "");
  if (!INVITE_CODE_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; code: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.invite.metaTitle,
    description: dict.invite.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ lang: string; code: string }>;
}) {
  const { lang, code: rawCode } = await params;
  if (!hasLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);
  const p = dict.invite;

  const code = normalizeCode(rawCode);
  if (!code) notFound();

  // Mirrors the /pair page custom-scheme handoff. The mobile app declares
  // `kroni://` and registers `/invite` as a path-segment entrypoint via
  // `app/invite/[code].tsx`, so this URL resolves to the parent invite
  // landing inside the app. iOS universal links + Android App Links also
  // point at this path (see app.config.ts intentFilters and the AASA file
  // at /.well-known/apple-app-site-association).
  const deepLink = `kroni://invite?code=${encodeURIComponent(code)}`;
  const autoOpenScript = `
    (function () {
      try {
        var t = setTimeout(function () {
          window.location.href = ${JSON.stringify(deepLink)};
        }, 700);
        window.addEventListener("pagehide", function () { clearTimeout(t); }, { once: true });
      } catch (e) {}
    })();
  `;

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-gold-100 opacity-60 blur-3xl"
      />
      <div className="relative mx-auto flex max-w-3xl flex-col items-start px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.14em] text-sand-700">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-500" />
          {p.eyebrow}
        </p>
        <h1 className="mt-6 max-w-2xl font-display-lg font-display text-[40px] font-semibold leading-[1.05] text-sand-900 sm:text-[52px]">
          {p.title}
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-sand-500 sm:text-[18px]">
          {p.body}
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 rounded-2xl border border-sand-200 bg-sand-50 p-6 shadow-card">
          <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-sand-500">
            {p.codeLabel}
          </span>
          <span className="font-display text-[36px] font-semibold tracking-[0.18em] text-sand-900 tabular-nums">
            {code}
          </span>
        </div>

        <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <a
            href={deepLink}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
          >
            {p.openButton}
            <ArrowUpRight
              aria-hidden="true"
              strokeWidth={1.5}
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-sand-500">
          {p.autoOpen}
        </p>

        <div className="mt-12 w-full border-t border-sand-200 pt-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-sand-500">
            {p.notInstalled}
          </p>
          <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-sand-900 bg-transparent px-5 text-[14px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-sand-100"
            >
              {p.appStore}
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-sand-900 bg-transparent px-5 text-[14px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-sand-100"
            >
              {p.playStore}
            </a>
          </div>
          <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-sand-500">
            {p.fallbackHint}
          </p>
        </div>

        <p className="mt-10 text-[13px] text-sand-500">
          {p.helpLine}
        </p>
      </div>
      <script
        dangerouslySetInnerHTML={{ __html: autoOpenScript }}
      />
      <noscript>
        <meta httpEquiv="refresh" content={`3;url=${deepLink}`} />
      </noscript>
    </section>
  );
}
