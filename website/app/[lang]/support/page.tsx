import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, Clock, MessageCircle } from "lucide-react";
import { hasLocale } from "../../_i18n/locales";
import { getDictionary } from "../../_i18n/dict";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.support.title,
    description: dict.meta.support.description,
    alternates: { canonical: `/${lang}/support` },
  };
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åäæ]/g, "a")
    .replace(/[øö]/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const s = dict.support;

  return (
    <>
      <section className="border-b border-sand-200 bg-sand-50">
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
            {s.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-sand-900 sm:text-[56px]">
            {s.title}
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.6] text-sand-500">
            {s.blurb}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="mailto:support@kroni.no"
              className="group flex items-start gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-5 transition-colors hover:border-gold-300 hover:bg-white"
            >
              <span aria-hidden="true" className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gold-500">
                <Mail strokeWidth={1.5} className="h-4 w-4 text-sand-900" />
              </span>
              <span>
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-sand-500">
                  {s.cardEmail}
                </span>
                <span className="mt-1 block text-[15px] font-semibold text-sand-900">
                  support@kroni.no
                </span>
              </span>
            </a>
            <div className="flex items-start gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-5">
              <span aria-hidden="true" className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-sand-200 bg-white">
                <Clock strokeWidth={1.5} className="h-4 w-4 text-sand-700" />
              </span>
              <span>
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-sand-500">
                  {s.cardResponse}
                </span>
                <span className="mt-1 block text-[15px] font-semibold text-sand-900">
                  {s.cardResponseValue}
                </span>
              </span>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-5">
              <span aria-hidden="true" className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-sand-200 bg-white">
                <MessageCircle strokeWidth={1.5} className="h-4 w-4 text-sand-700" />
              </span>
              <span>
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-sand-500">
                  {s.cardLanguage}
                </span>
                <span className="mt-1 block text-[15px] font-semibold text-sand-900">
                  {s.cardLanguageValue}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28" aria-label={s.sectionAria}>
        <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-12">
          <aside className="lg:col-span-3" aria-label={s.tocLabel}>
            <div className="lg:sticky lg:top-24">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-sand-500">
                {s.tocLabel}
              </p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                {s.groups.map((g) => (
                  <li key={g.label}>
                    <a
                      href={`#${slug(g.label)}`}
                      className="text-sand-700 hover:text-gold-700 hover:underline underline-offset-4"
                    >
                      {g.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <div className="space-y-16">
              {s.groups.map((g) => (
                <div key={g.label} id={slug(g.label)}>
                  <h2 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-sand-900 sm:text-[30px]">
                    {g.label}
                  </h2>
                  <div className="mt-6 border-t border-sand-200">
                    {g.items.map((it) => (
                      <details key={it.q} className="accordion">
                        <summary>
                          {it.q}
                          <span aria-hidden="true" className="accordion-icon" />
                        </summary>
                        <div className="accordion-body text-[15px]">{it.a}</div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-sand-200 bg-sand-100">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h2 className="max-w-2xl font-display text-[34px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[40px]">
                {s.ctaTitle}
              </h2>
              <p className="mt-4 max-w-xl text-[15.5px] leading-[1.6] text-sand-500">
                {s.ctaBody}
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <a
                href="mailto:support@kroni.no"
                className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
              >
                {s.ctaButton}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
