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
import PhoneMock from "./_components/PhoneMock";
import PhotoPlaceholder from "./_components/PhotoPlaceholder";
import Reveal from "./_components/Reveal";

export const metadata: Metadata = {
  title: "Kroni — Lommepenger og oppgaver for familier",
  description:
    "Lommepenger som lærer barn å mestre, ikke å forvente. Kroni hjelper norske familier å bygge ansvar gjennom oppgaver, ukepenger og belønninger.",
  alternates: { canonical: "/" },
};

// Alternate hero copy (kept for review):
//   "Den lille appen som gjør husarbeid til mestring."
//   "Ukepenger med mening — for familier som vil lære, ikke bare betale."

const features = [
  {
    eyebrow: "Ukepenger",
    title: "Ukepenger som faktisk er pedagogiske.",
    body: "Du bestemmer beløpet. Mandag morgen lander det på barnets balanse — uten påminnelser, uten krangling. Pause når familien er på ferie, juster når lønna går opp.",
    image: {
      alt: "Photo of a child looking at the Kroni app on a Monday morning.",
      caption:
        "[REVIEW] photo placeholder — kid checking the balance on a Monday morning, soft light.",
      aspect: "portrait" as const,
    },
    side: "right" as const,
  },
  {
    eyebrow: "Belønninger",
    title: "Belønninger som gir mening for familien.",
    body: "Skjermtid, kinokvelder, en helg uten oppvask — du bestemmer hva som er verdt noe i deres hjem. Barna sparer mot et mål de selv valgte.",
    image: {
      alt: "Photo of a parent and child planning rewards together.",
      caption:
        "[REVIEW] photo placeholder — parent and kid at the kitchen table choosing rewards.",
      aspect: "landscape" as const,
    },
    side: "left" as const,
  },
  {
    eyebrow: "Trygt",
    title: "Trygt for hele familien.",
    body: "Ingen ekte penger flyter. Ingen reklame. Ingen kjøp i appen. Barneprofilen ser bare det den skal se. Du har full kontroll, hele tiden.",
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
  { Icon: Heart, label: "Bygd i Norge" },
  { Icon: Shield, label: "GDPR-vennlig" },
  { Icon: PiggyBank, label: "Ingen virkelige penger" },
  { Icon: Users, label: "For barn 6–14 år" },
];

const parentPoints = [
  "Lag oppgaver på sekunder — gjentakende eller engangs.",
  "Godkjenn med ett trykk når oppgaven er gjort.",
  "Sett ukentlig beløp og pause når det trengs.",
  "Se historikk og fremgang per barn, samlet på ett sted.",
];

const kidPoints = [
  "En enkel «I dag»-liste — ingen forvirrende menyer.",
  "Saldoen vokser når du gjør jobben.",
  "Velg belønninger du faktisk vil ha.",
  "Aldri reklame. Aldri kjøp i appen.",
];

const faqs = [
  {
    q: "Hvor mye koster Kroni?",
    a: "Gratisplanen dekker ett barn og fem aktive oppgaver. Familieplanen koster 49 kr i måneden eller 399 kr per år (du sparer 32%) og gir ubegrenset antall barn og oppgaver.",
  },
  {
    q: "Er det ekte penger involvert?",
    a: "Nei. Saldoen i Kroni er en virtuell tellestrek. Du som forelder bestemmer hvordan den løses inn — kontant, Vipps eller belønninger som skjermtid og kinokvelder.",
  },
  {
    q: "Hvilken alder passer Kroni for?",
    a: "Kroni er laget for barn mellom 6 og 14 år. Yngre barn klarer seg fint med foreldrenes hjelp, eldre barn liker den enkle oversikten.",
  },
  {
    q: "Hva skjer hvis vi vil slutte?",
    a: "Du kan eksportere alt og slette familiekontoen i innstillinger. Personopplysninger slettes innen 30 dager. Du betaler ikke et øre for å gå.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        aria-label="Kroni introduksjon"
      >
        {/* Soft top-left flare. Restraint > drama. */}
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
              Lansert i Norge · våren 2026
            </p>
            <h1 className="mt-6 font-display-lg font-display text-[44px] font-semibold leading-[1.04] text-sand-900 sm:text-[60px] lg:text-[68px]">
              Lommepenger som lærer barn å{" "}
              <em className="italic text-gold-700">mestre</em>, ikke å forvente.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-[1.6] text-sand-500 sm:text-[18px]">
              Kroni er den lille familieappen for oppgaver, ukepenger og
              belønninger som faktisk passer hverdagen. Laget i Norge, for
              kjøkkenbordet ditt.
            </p>
            <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Last ned Kroni for iOS"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
              >
                Last ned for iOS
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
                aria-label="Last ned Kroni for Android"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-sand-900 bg-transparent px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-sand-100"
              >
                Last ned for Android
              </a>
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-sand-500">
              Gratis å starte · Ingen reklame · Aldri ekte penger på kontoen
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -right-6 -top-6 hidden h-32 w-32 rounded-full bg-gold-100 blur-2xl lg:block"
              />
              <PhoneMock variant="nb" className="relative" />
              <div
                aria-hidden="true"
                className="mt-6 hidden text-center font-display text-[14px] italic text-sand-500 lg:block"
              >
                Slik ser barnets app ut. Ingen reklame, ingen krimskrams.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section
        aria-label="Slik er Kroni laget"
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
        aria-label="Slik fungerer Kroni"
      >
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
              Slik fungerer det
            </p>
            <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[44px]">
              Tre steg fra rotete kjøkken til ro.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-14">
          {[
            {
              n: "01",
              t: "Du lager oppgavene",
              d: "«Rydd rommet», «ta ut søppel», «øv 20 min på piano». Sett beløp og hyppighet en gang — Kroni gjentar resten.",
            },
            {
              n: "02",
              t: "Barnet hukar av",
              d: "Når oppgaven er gjort, trykker barnet på sin enkle «I dag»-liste. Du får et stille varsel — ingen mas, ingen sirener.",
            },
            {
              n: "03",
              t: "Du godkjenner — og kronene tikker inn",
              d: "Ett trykk, og saldoen vokser. Barna ser fremgangen. Du ser at noe faktisk ble gjort. Helgen blir litt roligere.",
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
        aria-label="Funksjoner"
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
        aria-label="For foreldre og barn"
      >
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
                To sider, samme lag
              </p>
              <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[44px]">
                Forskjellig app — samme familie.
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 sm:grid-cols-2">
            <Reveal className="bg-sand-50 p-8 sm:p-10">
              <p className="font-display text-[12px] uppercase tracking-[0.18em] text-sand-500">
                For deg som forelder
              </p>
              <h3 className="mt-3 font-display text-[28px] font-semibold leading-tight tracking-tight text-sand-900">
                Mindre planlegging, mer hverdag.
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
                For barnet
              </p>
              <h3 className="mt-3 font-display text-[28px] font-semibold leading-tight tracking-tight text-sand-900">
                En liste. Et mål. Ingen tull.
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
        aria-label="Priser"
      >
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
              Priser
            </p>
            <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[44px]">
              Begynn gratis. Oppgrader når familien vokser.
            </h2>
          </div>
        </Reveal>

        <Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 md:grid-cols-3">
            <div className="bg-sand-50 p-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-sand-500">
                Gratis
              </p>
              <p className="mt-3 font-display text-[28px] font-semibold leading-none tracking-tight text-sand-900">
                0&nbsp;kr
              </p>
              <p className="mt-2 text-[12.5px] text-sand-500">For alltid</p>
              <ul className="mt-6 space-y-2 text-[14px] text-sand-700">
                <li>1 barn</li>
                <li>5 aktive oppgaver</li>
                <li>Ukepenger</li>
              </ul>
            </div>
            <div className="bg-sand-50 p-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-sand-500">
                Familie
              </p>
              <p className="mt-3 font-display text-[28px] font-semibold leading-none tracking-tight text-sand-900">
                49&nbsp;kr
              </p>
              <p className="mt-2 text-[12.5px] text-sand-500">per måned</p>
              <ul className="mt-6 space-y-2 text-[14px] text-sand-700">
                <li>Ubegrenset antall barn</li>
                <li>Ubegrenset oppgaver</li>
                <li>Belønninger og mål</li>
              </ul>
            </div>
            <div
              className="relative bg-sand-50 p-7 shadow-[0_1px_3px_rgba(31,28,20,0.04)]"
              aria-label="Beste verdi"
            >
              <span className="absolute right-5 top-5 inline-flex items-center rounded-full bg-gold-500 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-sand-900">
                Spar 32%
              </span>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-sand-500">
                Familie årlig
              </p>
              <p className="mt-3 font-display text-[28px] font-semibold leading-none tracking-tight text-sand-900">
                399&nbsp;kr
              </p>
              <p className="mt-2 text-[12.5px] text-sand-500">per år</p>
              <ul className="mt-6 space-y-2 text-[14px] text-sand-700">
                <li>Alt i Familie</li>
                <li>Prioritert support</li>
                <li>Tidlig tilgang til nytt</li>
              </ul>
            </div>
          </div>
        </Reveal>
        <p className="mx-auto mt-6 max-w-2xl text-center text-[12.5px] text-sand-500">
          Betaling håndteres av App Store eller Google Play. Ingen skjulte
          gebyrer. Avbestill når du vil.
        </p>
      </section>

      {/* FAQ TEASER */}
      <section
        className="border-y border-sand-200 bg-sand-50"
        aria-label="Vanlige spørsmål"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
              Spørsmål
            </p>
            <h2 className="mt-4 font-display text-[34px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[40px]">
              Det foreldre lurer på først.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-[1.65] text-sand-500">
              Finner du ikke svaret? Vi svarer hver e-post personlig, vanligvis
              samme dag.
            </p>
            <Link
              href="/support"
              className="mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-semibold tracking-tight text-sand-900 underline-offset-4 hover:text-gold-700 hover:underline"
            >
              Se alle spørsmål
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
        aria-label="Kom i gang"
      >
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <Reveal>
            <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-8">
                <h2 className="max-w-3xl font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-sand-900 sm:text-[60px]">
                  Klar for{" "}
                  <em className="italic text-gold-700">kjøkkenbordfreden</em>?
                </h2>
                <p className="mt-6 max-w-lg text-[17px] leading-[1.6] text-sand-500">
                  Last ned Kroni gratis. Sett opp første oppgave på under to
                  minutter. Pause eller slutt når du vil.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:col-span-4 lg:justify-end">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Last ned Kroni for iOS"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
                >
                  Last ned for iOS
                </a>
                <Link
                  href="/support"
                  className="text-[14.5px] font-semibold tracking-tight text-sand-900 underline-offset-4 hover:text-gold-700 hover:underline"
                >
                  Snakk med oss først
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
