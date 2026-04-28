// [REVIEW] Norwegian copy generated; native review needed.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Støtte og hjelp — Kroni",
  description:
    "Finn svar på vanlige spørsmål om Kroni, eller ta kontakt med oss på support@kroni.no.",
};

const faqs = [
  {
    question: "Hvordan parer jeg barnets enhet?",
    answer:
      "Etter at du har opprettet en barneprofil i foreldreappen, vises en paring-kode på skjermen. Start Kroni på barnets enhet og tast inn koden. Paringen fullføres automatisk og barnet er klar til å bruke appen.",
  },
  {
    question: "Kan jeg endre ukepenger?",
    answer:
      "Ja. Gå til barnets profil i foreldreappen, trykk på «Ukepenger» og juster beløpet. Endringen trer i kraft ved neste utbetalingsdato. Du kan også pause utbetalinger midlertidig.",
  },
  {
    question: "Hvor mye koster Kroni?",
    answer:
      "Kroni er gratis å laste ned og inkluderer en prøveperiode. Etter prøveperioden kreves et abonnement. Gjeldende priser vises i App Store eller Google Play. Vi tilbyr månedlige og årlige planer.",
  },
  {
    question: "Hva skjer hvis vi sletter kontoen?",
    answer:
      "Alle data knyttet til kontoen — inkludert barneprofiler, oppgavehistorikk og belønninger — slettes permanent innen 30 dager. Denne handlingen kan ikke angres. Du kan eksportere data fra innstillinger før du sletter.",
  },
  {
    question: "Trenger barnet egen e-post?",
    answer:
      "Nei. Barneprofilen opprettes av foreldrekontoen og krever bare et fornavn, fødselsår og avatar-valg. Barnet logger inn via foreldrenes paring-kode, ikke e-post.",
  },
  {
    question: "Kan flere foreldre bruke samme konto?",
    answer:
      "Ja. Du kan invitere en medforelder fra innstillingene i foreldreappen. Begge får full tilgang til å opprette oppgaver, godkjenne og justere ukepenger for alle barn i familien.",
  },
  {
    question: "Hvordan endrer jeg språk i appen?",
    answer:
      "Kroni følger enhetens systemspråk automatisk. For å endre språk: gå til innstillinger på telefonen din, velg appen Kroni og endre foretrukket språk om tilgjengelig — ellers endrer du telefonens systemspråk.",
  },
  {
    question: "Får barnet beskjed når en oppgave er godkjent?",
    answer:
      "Ja. Barnet mottar et push-varsel på sin enhet med det samme du godkjenner eller avslår en oppgave. Varslinger kan skrus av i telefonens innstillinger om ønskelig.",
  },
  {
    question: "Kan jeg sette opp oppgaver som gjentar seg?",
    answer:
      "Ja, du kan opprette ukentlige eller daglige gjentagende oppgaver. Velg «Gjentagende» under opprettelse av oppgaven og velg frekvens. Oppgaven dukker automatisk opp i barnets liste til riktig tid.",
  },
  {
    question: "Hva gjør jeg hvis barnet har mistet tilgang til appen?",
    answer:
      "Gå til barnets profil i foreldreappen og generer en ny paring-kode under «Enheter». Installer Kroni på barnets nye eller tilbakestilte enhet og bruk den nye koden for å koble til igjen.",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-3 text-3xl font-bold text-sand-900 dark:text-sand-50">
        Støtte og hjelp
      </h1>
      <p className="mb-10 text-sand-500 dark:text-sand-200">
        Her finner du svar på de vanligste spørsmålene. Finner du ikke svaret du leter etter?
        Send oss en e-post på{" "}
        <a
          href="mailto:support@kroni.no"
          className="text-gold-500 hover:underline dark:text-gold-300"
        >
          support@kroni.no
        </a>
        , så hjelper vi deg så raskt vi kan.
      </p>

      <section aria-label="Vanlige spørsmål">
        <h2 className="mb-6 text-2xl font-semibold text-sand-900 dark:text-sand-50">
          Vanlige spørsmål
        </h2>
        <dl className="space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl border border-sand-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-800"
            >
              <dt className="mb-2 font-semibold text-sand-900 dark:text-sand-50">
                {faq.question}
              </dt>
              <dd className="text-sm leading-relaxed text-sand-500 dark:text-sand-200">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className="mt-14 rounded-2xl bg-gold-50 p-8 text-center dark:bg-gold-900/20"
        aria-label="Kontakt oss"
      >
        <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
          Kom ikke videre?
        </h2>
        <p className="mb-6 text-sand-500 dark:text-sand-200">
          Teamet vårt svarer på hverdager innen 24 timer.
        </p>
        <a
          href="mailto:support@kroni.no"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-gold-500 px-8 font-semibold text-white transition-colors hover:bg-gold-700"
          aria-label="Send e-post til support@kroni.no"
        >
          Send e-post
        </a>
        <p className="mt-4 text-sm text-sand-500 dark:text-sand-500">
          support@kroni.no
        </p>
      </section>
    </div>
  );
}
