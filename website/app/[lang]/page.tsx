import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Heart,
  Shield,
  PiggyBank,
  Users,
  Check,
  ArrowUpRight,
} from "lucide-react";
import PhoneMock from "../_components/PhoneMock";
import PhotoPlaceholder from "../_components/PhotoPlaceholder";
import Reveal from "../_components/Reveal";
import { hasLocale, type Locale } from "../_i18n/locales";
import { getDictionary } from "../_i18n/dict";

const TRUST_ICONS = [Heart, Shield, PiggyBank, Users] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.home.title,
    description: dict.meta.home.description,
    alternates: { canonical: `/${lang}` },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale: Locale = lang;
  const dict = await getDictionary(locale);
  const h = dict.home;

  const featureImages = [
    {
      alt: "Photo of a child looking at the Kroni app on a Monday morning.",
      caption: "[REVIEW] photo placeholder — kid checking the balance on a Monday morning, soft light.",
      aspect: "portrait" as const,
    },
    {
      alt: "Photo of a parent and child planning rewards together.",
      caption: "[REVIEW] photo placeholder — parent and kid at the kitchen table choosing rewards.",
      aspect: "landscape" as const,
    },
    {
      alt: "Still life of coins and a notebook on a wooden table.",
      caption: "[REVIEW] photo placeholder — still life of coins, pencil and a small notebook on light oak.",
      aspect: "landscape" as const,
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden" aria-label="Kroni">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-gold-100 opacity-60 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.14em] text-sand-700">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              {h.badge}
            </p>
            <h1 className="mt-6 font-display-lg font-display text-[44px] font-semibold leading-[1.04] text-sand-900 sm:text-[60px] lg:text-[68px]">
              {h.heroTitlePre}
              <em className="italic text-gold-700">{h.heroTitleEm}</em>
              {h.heroTitlePost}
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-sand-500 sm:text-[18px]">
              {h.heroBody}
            </p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={h.ctaIosAria}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
              >
                {h.ctaIos}
                <ArrowUpRight
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={h.ctaAndroidAria}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-sand-900 bg-transparent px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-sand-100"
              >
                {h.ctaAndroid}
              </a>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-sand-500">
              {h.heroFinePrint}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -right-6 -top-6 hidden h-32 w-32 rounded-full bg-gold-100 blur-2xl lg:block"
              />
              <PhoneMock variant={locale} className="relative" />
              <div
                aria-hidden="true"
                className="mt-6 hidden text-center font-display text-[14px] italic text-sand-500 lg:block"
              >
                {h.phoneCaption}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-sand-200 bg-sand-100/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-[13px] text-sand-700 sm:px-8">
          {h.trust.map((label, i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 text-sand-500" />
                <span className="font-medium tracking-tight">{label}</span>
                {i < h.trust.length - 1 ? (
                  <span aria-hidden="true" className="ml-8 hidden h-1 w-1 rounded-full bg-sand-300 sm:block" />
                ) : null}
              </span>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
              {h.howWorks.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[44px]">
              {h.howWorks.title}
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-14">
          {h.howWorks.steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 100}>
              <div className="relative">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-[40px] font-medium tabular-nums text-gold-500">
                    {step.n}
                  </span>
                  <div className="h-px flex-1 bg-sand-200" />
                </div>
                <h3 className="mt-5 font-display text-[22px] font-semibold leading-tight tracking-tight text-sand-900">
                  {step.t}
                </h3>
                <p className="mt-3 max-w-sm text-[15px] leading-[1.65] text-sand-500">
                  {step.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURE ROWS */}
      <section className="border-t border-sand-200 bg-sand-50">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="space-y-24 sm:space-y-32">
            {h.features.map((f, i) => {
              const img = featureImages[i];
              return (
                <Reveal key={f.title}>
                  <div
                    className={[
                      "grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16",
                      f.side === "left" ? "lg:[&>div:first-child]:order-2" : "",
                    ].join(" ")}
                  >
                    <div className="lg:col-span-7">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
                        {String(i + 1).padStart(2, "0")} · {f.eyebrow}
                      </p>
                      <h3 className="mt-4 max-w-xl font-display text-[32px] font-semibold leading-[1.12] tracking-tight text-sand-900 sm:text-[40px]">
                        {f.title}
                      </h3>
                      <p className="mt-5 max-w-lg text-[16.5px] leading-[1.65] text-sand-500">
                        {f.body}
                      </p>
                    </div>
                    <div className="lg:col-span-5">
                      <PhotoPlaceholder
                        alt={img.alt}
                        caption={img.caption}
                        aspect={img.aspect}
                        tone={i === 1 ? "gold" : "sand"}
                      />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* TWO SIDES */}
      <section className="border-y border-sand-200 bg-sand-100">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
                {h.twoSides.eyebrow}
              </p>
              <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[44px]">
                {h.twoSides.title}
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 sm:grid-cols-2">
            <Reveal className="bg-sand-50 p-8 sm:p-10">
              <p className="font-display text-[12px] uppercase tracking-[0.18em] text-sand-500">
                {h.twoSides.parentEyebrow}
              </p>
              <h3 className="mt-3 font-display text-[28px] font-semibold leading-tight tracking-tight text-sand-900">
                {h.twoSides.parentTitle}
              </h3>
              <ul className="mt-7 space-y-4">
                {h.twoSides.parentPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15.5px] leading-[1.55] text-sand-700">
                    <span aria-hidden="true" className="mt-1 grid h-4 w-4 flex-shrink-0 place-items-center rounded-full bg-gold-500">
                      <Check strokeWidth={2.5} className="h-2.5 w-2.5 text-sand-900" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="bg-sand-50 p-8 sm:p-10" delay={120}>
              <p className="font-display text-[12px] uppercase tracking-[0.18em] text-sand-500">
                {h.twoSides.kidEyebrow}
              </p>
              <h3 className="mt-3 font-display text-[28px] font-semibold leading-tight tracking-tight text-sand-900">
                {h.twoSides.kidTitle}
              </h3>
              <ul className="mt-7 space-y-4">
                {h.twoSides.kidPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15.5px] leading-[1.55] text-sand-700">
                    <span aria-hidden="true" className="mt-1 grid h-4 w-4 flex-shrink-0 place-items-center rounded-full border-[1.5px] border-sand-900">
                      <Check strokeWidth={2.5} className="h-2.5 w-2.5 text-sand-900" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32" aria-label={h.pricing.eyebrow}>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
              {h.pricing.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[44px]">
              {h.pricing.title}
            </h2>
          </div>
        </Reveal>

        <Reveal>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-4">
            <PriceCard tier={h.pricing.free} currency={dict.common.currency} />
            <PriceCard tier={h.pricing.monthly} currency={dict.common.currency} />
            <PriceCard
              tier={h.pricing.yearly}
              currency={dict.common.currency}
              badge={dict.common.save32}
              accent="gold"
            />
            <PriceCard
              tier={h.pricing.lifetime}
              currency={dict.common.currency}
              badge={dict.common.oneTime}
              accent="outline"
            />
          </div>
        </Reveal>
        <p className="mx-auto mt-6 max-w-2xl text-center text-[12.5px] text-sand-500">
          {h.pricing.footnote}
        </p>
      </section>

      {/* FAQ */}
      <section className="border-y border-sand-200 bg-sand-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
              {h.faq.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-[34px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[40px]">
              {h.faq.title}
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-[1.65] text-sand-500">
              {h.faq.blurb}
            </p>
            <Link
              href={`/${locale}/support`}
              className="mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-semibold tracking-tight text-sand-900 underline-offset-4 hover:text-gold-700 hover:underline"
            >
              {h.faq.seeAll}
              <ArrowUpRight strokeWidth={1.5} aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="lg:col-span-8">
            <div className="border-t border-sand-200">
              {h.faq.items.map((f) => (
                <details key={f.q} className="accordion">
                  <summary>
                    {f.q}
                    <span aria-hidden="true" className="accordion-icon" />
                  </summary>
                  <div className="accordion-body text-[15px]">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-sand-100" aria-label={h.finalCta.ariaLabel}>
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-8">
                <h2 className="max-w-3xl font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-sand-900 sm:text-[60px]">
                  {h.finalCta.titlePre}
                  <em className="italic text-gold-700">{h.finalCta.titleEm}</em>
                  {h.finalCta.titlePost}
                </h2>
                <p className="mt-6 max-w-lg text-[17px] leading-[1.6] text-sand-500">
                  {h.finalCta.body}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:col-span-4 lg:justify-end">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={h.ctaIosAria}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
                >
                  {h.ctaIos}
                </a>
                <Link
                  href={`/${locale}/support`}
                  className="text-[14.5px] font-semibold tracking-tight text-sand-900 underline-offset-4 hover:text-gold-700 hover:underline"
                >
                  {h.finalCta.talkFirst}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function PriceCard({
  tier,
  currency,
  badge,
  accent = "plain",
}: {
  tier: { label: string; price: string; period: string; items: readonly string[] };
  currency: string;
  badge?: string;
  accent?: "plain" | "gold" | "outline";
}) {
  return (
    <div
      className={[
        "relative bg-sand-50 p-7",
        accent === "gold" || accent === "outline"
          ? "shadow-[0_1px_3px_rgba(31,28,20,0.04)]"
          : "",
      ].join(" ")}
    >
      {badge ? (
        <span
          className={[
            "absolute right-5 top-5 inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-sand-900",
            accent === "outline"
              ? "border border-sand-900 bg-sand-50"
              : "bg-gold-500",
          ].join(" ")}
        >
          {badge}
        </span>
      ) : null}
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-sand-500">
        {tier.label}
      </p>
      <p className="mt-3 font-display text-[28px] font-semibold leading-none tracking-tight text-sand-900">
        {tier.price}&nbsp;{currency}
      </p>
      <p className="mt-2 text-[12.5px] text-sand-500">{tier.period}</p>
      <ul className="mt-6 space-y-2 text-[14px] text-sand-700">
        {tier.items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
