// [REVIEW] Norwegian copy generated; native review needed.
import type { Metadata } from "next";
import DraftBanner from "../_components/DraftBanner";

export const metadata: Metadata = {
  title: "Personvernerklæring — Kroni",
  description: "Les om hvordan Kroni samler inn, bruker og beskytter dine personopplysninger.",
};

export default function PersonvernPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <DraftBanner />
      </div>

      <h1 className="mb-6 text-3xl font-bold text-sand-900 dark:text-sand-50">
        Personvernerklæring
      </h1>
      <p className="mb-8 text-sm text-sand-500">
        Sist oppdatert: april 2026
      </p>

      <div className="prose prose-sand max-w-none space-y-8 text-sand-900 dark:text-sand-100">

        <section>
          <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
            1. Behandlingsansvarlig
          </h2>
          <p className="leading-relaxed text-sand-500 dark:text-sand-200">
            Nilsen Konsult er behandlingsansvarlig for personopplysningene som behandles via
            Kroni-appen og dette nettstedet. Kontakt oss på{" "}
            <a href="mailto:support@kroni.no" className="text-gold-500 hover:underline">
              support@kroni.no
            </a>{" "}
            ved spørsmål om personvern.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
            2. Hvilke opplysninger vi samler inn
          </h2>
          <p className="mb-3 leading-relaxed text-sand-500 dark:text-sand-200">
            Vi samler inn følgende kategorier av personopplysninger:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sand-500 dark:text-sand-200">
            <li>
              <strong className="text-sand-900 dark:text-sand-50">Foreldrekonto:</strong>{" "}
              E-postadresse og passordhash.
            </li>
            <li>
              <strong className="text-sand-900 dark:text-sand-50">Barneprofil:</strong>{" "}
              Fornavn, fødselsår og valgt avatar-nøkkel (ingen fullt navn, ingen bilde lastet
              opp av bruker).
            </li>
            <li>
              <strong className="text-sand-900 dark:text-sand-50">Enhetsinformasjon:</strong>{" "}
              Enhets-ID og push-varslings-token for å sende varsler til barnets enhet.
            </li>
            <li>
              <strong className="text-sand-900 dark:text-sand-50">Bruksdata:</strong>{" "}
              Anonymisert statistikk om appbruk (ingen kobling til enkeltpersoner).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
            3. Hvorfor vi behandler opplysningene
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sand-500 dark:text-sand-200">
            <li>
              <strong className="text-sand-900 dark:text-sand-50">Levering av tjenesten:</strong>{" "}
              For å opprette og administrere familiekontoer, oppgaver og ukepenger
              (rettslig grunnlag: avtale, jf. GDPR art. 6 nr. 1 b).
            </li>
            <li>
              <strong className="text-sand-900 dark:text-sand-50">Push-varsler:</strong>{" "}
              For å varsle barn og foreldre om hendelser i appen
              (rettslig grunnlag: samtykke, jf. GDPR art. 6 nr. 1 a).
            </li>
            <li>
              <strong className="text-sand-900 dark:text-sand-50">Kundeservice:</strong>{" "}
              For å besvare henvendelser og løse tekniske problemer
              (rettslig grunnlag: berettiget interesse, jf. GDPR art. 6 nr. 1 f).
            </li>
            <li>
              <strong className="text-sand-900 dark:text-sand-50">Sikkerhet og drift:</strong>{" "}
              For å ivareta sikkerheten i tjenesten og forhindre misbruk
              (rettslig grunnlag: berettiget interesse).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
            4. Oppbevaring og sletting
          </h2>
          <p className="leading-relaxed text-sand-500 dark:text-sand-200">
            Personopplysninger oppbevares så lenge kontoen er aktiv. Etter at en konto er slettet,
            vil alle personopplysninger bli slettet innen 30 dager, med unntak av data vi er
            lovpålagt å beholde (f.eks. regnskapsdata i henhold til bokføringsloven).
            Anonymisert bruksstatistikk kan beholdes på ubestemt tid.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
            5. Deling med tredjeparter
          </h2>
          <p className="leading-relaxed text-sand-500 dark:text-sand-200">
            Vi selger ikke personopplysninger til tredjeparter. Vi kan dele opplysninger med
            underleverandører som hjelper oss med å levere tjenesten (f.eks. skytjenester og
            push-varslingstjenester). Alle underleverandører er bundet av databehandleravtaler
            i samsvar med GDPR.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
            6. Dine rettigheter
          </h2>
          <p className="mb-3 leading-relaxed text-sand-500 dark:text-sand-200">
            Under GDPR har du følgende rettigheter:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sand-500 dark:text-sand-200">
            <li>Rett til innsyn i dine personopplysninger</li>
            <li>Rett til retting av uriktige opplysninger</li>
            <li>Rett til sletting («retten til å bli glemt»)</li>
            <li>Rett til begrensning av behandling</li>
            <li>Rett til dataportabilitet</li>
            <li>Rett til å protestere mot behandling</li>
            <li>Rett til å trekke tilbake samtykke</li>
          </ul>
          <p className="mt-3 leading-relaxed text-sand-500 dark:text-sand-200">
            For å utøve dine rettigheter, kontakt oss på{" "}
            <a href="mailto:support@kroni.no" className="text-gold-500 hover:underline">
              support@kroni.no
            </a>
            . Du har også rett til å klage til{" "}
            <a
              href="https://www.datatilsynet.no"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-500 hover:underline"
            >
              Datatilsynet
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
            7. Barn og personvern
          </h2>
          <p className="leading-relaxed text-sand-500 dark:text-sand-200">
            Kroni er utformet for bruk av foreldre på vegne av sine barn. Barneprofiler
            opprettes kun av foreldre eller foresatte. Vi samler ikke inn mer informasjon om
            barn enn det som er strengt nødvendig for å levere tjenesten. Vi ber ikke barn om
            e-postadresse eller annen kontaktinformasjon.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
            8. Informasjonskapsler (cookies)
          </h2>
          <p className="leading-relaxed text-sand-500 dark:text-sand-200">
            Dette nettstedet bruker kun teknisk nødvendige informasjonskapsler. Vi bruker ikke
            sporings- eller markedsføringskapsler.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
            9. Endringer i personvernerklæringen
          </h2>
          <p className="leading-relaxed text-sand-500 dark:text-sand-200">
            Vi kan oppdatere denne erklæringen fra tid til annen. Vesentlige endringer vil bli
            varslet via e-post eller ved tydelig melding i appen. Datoen øverst på siden angir
            når erklæringen sist ble oppdatert.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-sand-900 dark:text-sand-50">
            10. Kontakt
          </h2>
          <p className="leading-relaxed text-sand-500 dark:text-sand-200">
            Nilsen Konsult
            <br />
            E-post:{" "}
            <a href="mailto:support@kroni.no" className="text-gold-500 hover:underline">
              support@kroni.no
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
