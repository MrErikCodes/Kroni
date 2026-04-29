import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PolicyShell from "../../_components/PolicyShell";
import { hasLocale, type Locale } from "../../_i18n/locales";
import { getDictionary } from "../../_i18n/dict";
import { vilkarNb } from "../../_legal/vilkar/nb";
import { vilkarEn } from "../../_legal/vilkar/en";
import { vilkarSv } from "../../_legal/vilkar/sv";
import { vilkarDa } from "../../_legal/vilkar/da";
import type { LegalContent } from "../../_legal/types";

const CONTENT: Record<Locale, LegalContent> = {
  nb: vilkarNb,
  en: vilkarEn,
  sv: vilkarSv,
  da: vilkarDa,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.terms.title,
    description: dict.meta.terms.description,
    alternates: { canonical: `/${lang}/vilkar` },
  };
}

export default async function VilkarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);
  const content = CONTENT[locale];
  return (
    <PolicyShell
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
      updated={content.updated}
      sections={content.sections.map((s) => ({ id: s.id, number: s.number, title: s.title }))}
      labels={{
        sectionsTitle: dict.policy.sectionsTitle,
        updatedLabel: dict.policy.updatedLabel,
      }}
      translationNotice={locale === "nb" ? undefined : dict.policy.translationNotice}
    >
      {content.sections.map((s) => (
        <section
          key={s.id}
          id={s.id}
          className="scroll-mt-24 border-t border-sand-200 py-10 first:border-t-0 first:pt-0"
        >
          <div className="flex items-baseline gap-4">
            <span className="font-display text-[15px] font-medium tabular-nums text-gold-700">
              {s.number}
            </span>
            <h2 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-sand-900 sm:text-[28px]">
              {s.title}
            </h2>
          </div>
          <div className="mt-5 space-y-4 text-[15.5px] leading-[1.7] text-sand-700 [&_a]:text-gold-700 [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-sand-900 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2.5 [&_li]:pl-1">
            {s.body}
          </div>
        </section>
      ))}
    </PolicyShell>
  );
}
