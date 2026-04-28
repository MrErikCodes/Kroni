// [REVIEW] copy generated; native review needed.
import type { Metadata } from "next";
import { Mail, Clock, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Støtte og hjelp — Kroni",
  description:
    "Finn svar på vanlige spørsmål om Kroni, eller ta kontakt med oss på support@kroni.no.",
};

const groups = [
  {
    label: "Komme i gang",
    items: [
      {
        q: "Hvordan parer jeg barnets enhet?",
        a: "Etter at du har opprettet en barneprofil i foreldreappen, vises en paringskode på skjermen. Start Kroni på barnets enhet og tast inn koden. Paringen fullføres automatisk og barnet er klar til å bruke appen.",
      },
      {
        q: "Trenger barnet egen e-post?",
        a: "Nei. Barneprofilen opprettes av foreldrekontoen og krever bare et fornavn, fødselsår og avatar-valg. Barnet logger inn via foreldrenes paringskode, ikke e-post.",
      },
      {
        q: "Kan jeg sette opp oppgaver som gjentar seg?",
        a: "Ja, du kan opprette ukentlige eller daglige gjentagende oppgaver. Velg «Gjentagende» under opprettelse av oppgaven og velg frekvens. Oppgaven dukker automatisk opp i barnets liste til riktig tid.",
      },
    ],
  },
  {
    label: "Familie og barn",
    items: [
      {
        q: "Kan flere foreldre bruke samme konto?",
        a: "Ja. Du kan invitere en medforelder fra innstillingene i foreldreappen. Begge får full tilgang til å opprette oppgaver, godkjenne og justere ukepenger for alle barn i familien.",
      },
      {
        q: "Får barnet beskjed når en oppgave er godkjent?",
        a: "Ja. Barnet mottar et stille push-varsel på sin enhet med det samme du godkjenner eller avslår en oppgave. Varslinger kan skrus av i telefonens innstillinger om ønskelig.",
      },
      {
        q: "Hva gjør jeg hvis barnet har mistet tilgang til appen?",
        a: "Gå til barnets profil i foreldreappen og generer en ny paringskode under «Enheter». Installer Kroni på barnets nye eller tilbakestilte enhet og bruk den nye koden for å koble til igjen.",
      },
      {
        q: "Hvordan endrer jeg språk i appen?",
        a: "Kroni følger enhetens systemspråk automatisk. Endre telefonens systemspråk for å endre språket i appen.",
      },
    ],
  },
  {
    label: "Betaling",
    items: [
      {
        q: "Hvor mye koster Kroni?",
        a: "Gratisplanen dekker ett barn og fem aktive oppgaver. Familieplanen koster 49 kr i måneden eller 399 kr per år. Gjeldende priser vises i App Store eller Google Play.",
      },
      {
        q: "Kan jeg endre ukepenger?",
        a: "Ja. Gå til barnets profil i foreldreappen, trykk på «Ukepenger» og juster beløpet. Endringen trer i kraft ved neste utbetalingsdato. Du kan også pause utbetalinger midlertidig.",
      },
      {
        q: "Kan jeg avbestille når som helst?",
        a: "Ja. Avbestilling skjer i innstillingene til App Store eller Google Play. Du beholder tilgang til betalt plan ut den perioden du allerede har betalt for.",
      },
    ],
  },
  {
    label: "Personvern",
    items: [
      {
        q: "Hva skjer hvis vi sletter kontoen?",
        a: "Alle data knyttet til kontoen — inkludert barneprofiler, oppgavehistorikk og belønninger — slettes permanent innen 30 dager. Denne handlingen kan ikke angres. Du kan eksportere data fra innstillinger før du sletter.",
      },
      {
        q: "Selger dere data om barna våre?",
        a: "Aldri. Kroni har ingen reklame, ingen sporing for markedsføring, og vi selger ikke data til tredjepart. Det er ikke en del av forretningsmodellen og blir det aldri.",
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-sand-200 bg-sand-50">
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-700">
            Støtte
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-sand-900 sm:text-[56px]">
            Vi er her — og vi svarer faktisk.
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.6] text-sand-500">
            Finn svar på det folk lurer mest på, eller skriv en linje til oss.
            Et menneske leser hver e-post.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="mailto:support@kroni.no"
              className="group flex items-start gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-5 transition-colors hover:border-gold-300 hover:bg-white"
            >
              <span
                aria-hidden="true"
                className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gold-500"
              >
                <Mail
                  strokeWidth={1.5}
                  className="h-4 w-4 text-sand-900"
                />
              </span>
              <span>
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-sand-500">
                  E-post
                </span>
                <span className="mt-1 block text-[15px] font-semibold text-sand-900">
                  support@kroni.no
                </span>
              </span>
            </a>
            <div className="flex items-start gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-5">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-sand-200 bg-white"
              >
                <Clock
                  strokeWidth={1.5}
                  className="h-4 w-4 text-sand-700"
                />
              </span>
              <span>
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-sand-500">
                  Svartid
                </span>
                <span className="mt-1 block text-[15px] font-semibold text-sand-900">
                  Vi svarer innen 24 timer
                </span>
              </span>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-5">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-sand-200 bg-white"
              >
                <MessageCircle
                  strokeWidth={1.5}
                  className="h-4 w-4 text-sand-700"
                />
              </span>
              <span>
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-sand-500">
                  Språk
                </span>
                <span className="mt-1 block text-[15px] font-semibold text-sand-900">
                  Norsk og engelsk
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28"
        aria-label="Vanlige spørsmål"
      >
        <div className="grid grid-cols-1 gap-x-16 gap-y-16 lg:grid-cols-12">
          <aside
            className="lg:col-span-3"
            aria-label="Innholdsfortegnelse"
          >
            <div className="lg:sticky lg:top-24">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-sand-500">
                Tema
              </p>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                {groups.map((g) => (
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
              {groups.map((g) => (
                <div key={g.label} id={slug(g.label)}>
                  <h2 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-sand-900 sm:text-[30px]">
                    {g.label}
                  </h2>
                  <div className="mt-6 border-t border-sand-200">
                    {g.items.map((it) => (
                      <details key={it.q} className="accordion">
                        <summary>
                          {it.q}
                          <span
                            aria-hidden="true"
                            className="accordion-icon"
                          />
                        </summary>
                        <div className="accordion-body text-[15px]">
                          {it.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-sand-200 bg-sand-100">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <h2 className="max-w-2xl font-display text-[34px] font-semibold leading-[1.1] tracking-tight text-sand-900 sm:text-[40px]">
                Fant ikke det du lette etter?
              </h2>
              <p className="mt-4 max-w-xl text-[15.5px] leading-[1.6] text-sand-500">
                Skriv til oss — så hjelper vi deg så raskt vi kan. Helst på
                norsk, men engelsk går også fint.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <a
                href="mailto:support@kroni.no"
                className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-6 text-[14.5px] font-semibold tracking-tight text-sand-900 transition-colors hover:bg-gold-700 hover:text-sand-50"
              >
                Send e-post
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
