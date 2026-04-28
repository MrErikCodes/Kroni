// [REVIEW] copy generated; native review needed.
import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Kroni — Allowance and chores for families",
  description:
    "Pocket money that teaches kids to master, not to expect. Kroni helps families build responsibility through chores, weekly allowance and rewards.",
  alternates: { canonical: "/en" },
};

const features = [
  {
    eyebrow: "Allowance",
    title: "Weekly allowance that actually teaches.",
    body: "You set the amount. Monday morning it lands in your child's balance — no reminders, no arguments. Pause when you're on holiday, adjust when life changes.",
    image: {
      alt: "Photo of a child looking at the Kroni app on a Monday morning.",
      caption:
        "[REVIEW] photo placeholder — kid checking the balance on a Monday morning, soft light.",
      aspect: "portrait" as const,
    },
    side: "right" as const,
  },
  {
    eyebrow: "Rewards",
    title: "Rewards that mean something to your family.",
    body: "Screen time, movie nights, a weekend off dishes — you decide what's worth saving for. Kids work toward a goal they chose themselves.",
    image: {
      alt: "Photo of a parent and child planning rewards together.",
      caption:
        "[REVIEW] photo placeholder — parent and kid at the kitchen table choosing rewards.",
      aspect: "landscape" as const,
    },
    side: "left" as const,
  },
  {
    eyebrow: "Safe",
    title: "Safe for the whole family.",
    body: "No real money moves. No ads. No in-app purchases. The kid profile only sees what it should. You stay in control, all the time.",
    image: {
      alt: "Still life of coins and a notebook on a wooden table.",
      caption:
        "[REVIEW] photo placeholder — still life of coins, pencil and a small notebook on light oak.",
      aspect: "landscape" as const,
    },
    side: "right" as const,
  },
];

const trustItems = [
  { Icon: Heart, label: "Built in Norway" },
  { Icon: Shield, label: "GDPR-friendly" },
  { Icon: PiggyBank, label: "No real money" },
  { Icon: Users, label: "For ages 6–14" },
];

const parentPoints = [
  "Create chores in seconds — recurring or one-off.",
  "Approve with a single tap when work is done.",
  "Set a weekly amount and pause whenever you need.",
  "See history and progress per child, in one place.",
];

const kidPoints = [
  "A simple \"Today\" list — no confusing menus.",
  "Your balance grows when you do the work.",
  "Pick rewards you actually want.",
  "Never any ads. Never any in-app purchases.",
];

const faqs = [
  {
    q: "How much does Kroni cost?",
    a: "The free plan covers one child and five active chores. The Family plan is 49 NOK per month or 399 NOK per year (you save 32%) and includes unlimited children and chores.",
  },
  {
    q: "Is real money involved?",
    a: "No. The balance in Kroni is a virtual counter. You as a parent decide how it gets paid out — cash, Vipps or rewards like screen time and movie nights.",
  },
  {
    q: "What ages is Kroni for?",
    a: "Kroni is built for kids aged 6 to 14. Younger children manage with parental help, older kids enjoy the calm overview.",
  },
  {
    q: "What happens if we want to stop?",
    a: "Export everything and delete the family account in Settings. Personal data is deleted within 30 days. There is never a fee to leave.",
  },
];

export default function EnHomePage() {
  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        aria-label="Kroni introduction"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-gold-100 opacity-60 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.14em] text-sand-700">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-gold-500"
              />
              Launched in Norway · spring 2026
            </p>
            <h1 className="mt-6 font-display-lg font-display text-[44px] font-semibold leading-[1.04] text-sand-900 sm:text-[60px] lg:text-[68px]">
              Pocket money that teaches kids to{" "}
              <em className="italic text-gold-700">master</em>, not to expect.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-sand-500 sm:text-[18px]">
              Kroni is the small family app for chores, allowance and rewards
              that actually fits real life. Built in Norway, for your kitchen
              table.
            </p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download Kroni for iOS"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
              >
                Download for iOS
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
                aria-label="Download Kroni for Android"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-sand-900 bg-transparent px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-sand-100"
              >
                Download for Android
              </a>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-sand-500">
              Free to start · No ads · Never any real money in the account
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -right-6 -top-6 hidden h-32 w-32 rounded-full bg-gold-100 blur-2xl lg:block"
              />
              <PhoneMock variant="en" className="relative" />
              <div
                aria-hidden="true"
                className="mt-6 hidden text-center font-display text-[14px] italic text-sand-500 lg:block"
              >
                The kid app, exactly as built. No ads, no clutter.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section
        aria-label="How Kroni is built"
        className="border-y border-sand-200 bg-sand-100/60"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-5 text-[13px] text-sand-700 sm:px-8">
          {trustItems.map(({ Icon, label }, i) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Icon
                aria-hidden="true"
                strokeWidth={1.5}
                className="h-4 w-4 text-sand-500"
              />
              <span className="font-medium tracking-tight">{label}</span>
              {i < trustItems.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="ml-8 hidden h-1 w-1 rounded-full bg-sand-300 sm:block"
                />
              ) : null}
            </span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32"
        aria-label="How Kroni works"
      >
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
              How it works
            </p>
            <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[44px]">
              Three steps from chaos to calm.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-14">
          {[
            {
              n: "01",
              t: "You make the chores",
              d: "\"Tidy the room\", \"take out the trash\", \"practice piano 20 min\". Set the amount and frequency once — Kroni repeats the rest.",
            },
            {
              n: "02",
              t: "Your kid checks them off",
              d: "When a chore is done, the kid taps it on their simple Today list. You get a quiet notification — no nagging, no sirens.",
            },
            {
              n: "03",
              t: "You approve — the kroner roll in",
              d: "One tap, and the balance grows. Kids see the progress. You see something actually happened. Sundays get a little quieter.",
            },
          ].map((step, i) => (
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
      <section
        className="border-t border-sand-200 bg-sand-50"
        aria-label="Features"
      >
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="space-y-24 sm:space-y-32">
            {features.map((f, i) => (
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
                      alt={f.image.alt}
                      caption={f.image.caption}
                      aspect={f.image.aspect}
                      tone={i === 1 ? "gold" : "sand"}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOR PARENTS / FOR KIDS */}
      <section
        className="border-y border-sand-200 bg-sand-100"
        aria-label="For parents and kids"
      >
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
                Two sides, same team
              </p>
              <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[44px]">
                Different app — same family.
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 sm:grid-cols-2">
            <Reveal className="bg-sand-50 p-8 sm:p-10">
              <p className="font-display text-[12px] uppercase tracking-[0.18em] text-sand-500">
                For you, the parent
              </p>
              <h3 className="mt-3 font-display text-[28px] font-semibold leading-tight tracking-tight text-sand-900">
                Less planning, more living.
              </h3>
              <ul className="mt-7 space-y-4">
                {parentPoints.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 text-[15.5px] leading-[1.55] text-sand-700"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 grid h-4 w-4 flex-shrink-0 place-items-center rounded-full bg-gold-500"
                    >
                      <Check
                        strokeWidth={2.5}
                        className="h-2.5 w-2.5 text-sand-900"
                      />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="bg-sand-50 p-8 sm:p-10" delay={120}>
              <p className="font-display text-[12px] uppercase tracking-[0.18em] text-sand-500">
                For your kid
              </p>
              <h3 className="mt-3 font-display text-[28px] font-semibold leading-tight tracking-tight text-sand-900">
                One list. One goal. No nonsense.
              </h3>
              <ul className="mt-7 space-y-4">
                {kidPoints.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-3 text-[15.5px] leading-[1.55] text-sand-700"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 grid h-4 w-4 flex-shrink-0 place-items-center rounded-full border-[1.5px] border-sand-900"
                    >
                      <Check
                        strokeWidth={2.5}
                        className="h-2.5 w-2.5 text-sand-900"
                      />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section
        className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32"
        aria-label="Pricing"
      >
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
              Pricing
            </p>
            <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[44px]">
              Start free. Upgrade when the family grows.
            </h2>
          </div>
        </Reveal>

        <Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 md:grid-cols-3">
            <div className="bg-sand-50 p-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-sand-500">
                Free
              </p>
              <p className="mt-3 font-display text-[28px] font-semibold leading-none tracking-tight text-sand-900">
                0&nbsp;NOK
              </p>
              <p className="mt-2 text-[12.5px] text-sand-500">Forever</p>
              <ul className="mt-6 space-y-2 text-[14px] text-sand-700">
                <li>1 child</li>
                <li>5 active chores</li>
                <li>Weekly allowance</li>
              </ul>
            </div>
            <div className="bg-sand-50 p-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-sand-500">
                Family
              </p>
              <p className="mt-3 font-display text-[28px] font-semibold leading-none tracking-tight text-sand-900">
                49&nbsp;NOK
              </p>
              <p className="mt-2 text-[12.5px] text-sand-500">per month</p>
              <ul className="mt-6 space-y-2 text-[14px] text-sand-700">
                <li>Unlimited children</li>
                <li>Unlimited chores</li>
                <li>Rewards and goals</li>
              </ul>
            </div>
            <div
              className="relative bg-sand-50 p-7 shadow-[0_1px_3px_rgba(31,28,20,0.04)]"
              aria-label="Best value"
            >
              <span className="absolute right-5 top-5 inline-flex items-center rounded-full bg-gold-500 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-sand-900">
                Save 32%
              </span>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-sand-500">
                Family yearly
              </p>
              <p className="mt-3 font-display text-[28px] font-semibold leading-none tracking-tight text-sand-900">
                399&nbsp;NOK
              </p>
              <p className="mt-2 text-[12.5px] text-sand-500">per year</p>
              <ul className="mt-6 space-y-2 text-[14px] text-sand-700">
                <li>Everything in Family</li>
                <li>Priority support</li>
                <li>Early access to new things</li>
              </ul>
            </div>
          </div>
        </Reveal>
        <p className="mx-auto mt-6 max-w-2xl text-center text-[12.5px] text-sand-500">
          Billing handled by App Store or Google Play. No hidden fees. Cancel
          any time.
        </p>
      </section>

      {/* FAQ TEASER */}
      <section
        className="border-y border-sand-200 bg-sand-50"
        aria-label="Frequently asked questions"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
              Questions
            </p>
            <h2 className="mt-4 font-display text-[34px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[40px]">
              What parents wonder first.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-[1.65] text-sand-500">
              Can&apos;t find your answer? We reply to every email personally,
              usually the same day.
            </p>
            <Link
              href="/support"
              className="mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-semibold tracking-tight text-sand-900 underline-offset-4 hover:text-gold-700 hover:underline"
            >
              See all questions
              <ArrowUpRight
                strokeWidth={1.5}
                aria-hidden="true"
                className="h-4 w-4"
              />
            </Link>
          </div>
          <div className="lg:col-span-8">
            <div className="border-t border-sand-200">
              {faqs.map((f) => (
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
      <section
        className="bg-sand-100"
        aria-label="Get started"
      >
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-8">
                <h2 className="max-w-3xl font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-sand-900 sm:text-[60px]">
                  Ready for{" "}
                  <em className="italic text-gold-700">kitchen-table calm</em>?
                </h2>
                <p className="mt-6 max-w-lg text-[17px] leading-[1.6] text-sand-500">
                  Download Kroni free. Set up your first chore in under two
                  minutes. Pause or quit any time.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:col-span-4 lg:justify-end">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download Kroni for iOS"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
                >
                  Download for iOS
                </a>
                <Link
                  href="/support"
                  className="text-[14.5px] font-semibold tracking-tight text-sand-900 underline-offset-4 hover:text-gold-700 hover:underline"
                >
                  Talk to us first
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
