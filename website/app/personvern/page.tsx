// [REVIEW] copy generated; native review needed.
import type { Metadata } from "next";
import PolicyShell, {
  PolicySection,
} from "../_components/PolicyShell";

export const metadata: Metadata = {
  title: "Personvernerklæring — Kroni",
  description:
    "Les om hvordan Kroni samler inn, bruker og beskytter dine personopplysninger.",
};

const sections = [
  { id: "behandlingsansvarlig", number: "01", title: "Behandlingsansvarlig" },
  { id: "opplysninger", number: "02", title: "Hvilke opplysninger vi samler inn" },
  { id: "formal", number: "03", title: "Hvorfor vi behandler opplysningene" },
  { id: "oppbevaring", number: "04", title: "Oppbevaring og sletting" },
  { id: "deling", number: "05", title: "Deling med tredjeparter" },
  { id: "rettigheter", number: "06", title: "Dine rettigheter" },
  { id: "barn", number: "07", title: "Barn og personvern" },
  { id: "cookies", number: "08", title: "Informasjonskapsler" },
  { id: "endringer", number: "09", title: "Endringer i erklæringen" },
  { id: "kontakt", number: "10", title: "Kontakt" },
];

export default function PersonvernPage() {
  return (
    <PolicyShell
      eyebrow="Personvern"
      title="Personvernerklæring"
      intro="Dette er hvordan Kroni samler, bruker og beskytter personopplysninger. Skrevet for å være til å forstå — ikke bare juridisk dekkende."
      updated="april 2026"
      sections={sections}
    >
      <PolicySection
        id="behandlingsansvarlig"
        number="01"
        title="Behandlingsansvarlig"
      >
        <p>
          Nilsen Konsult er behandlingsansvarlig for personopplysningene som
          behandles via Kroni-appen og dette nettstedet. Kontakt oss på{" "}
          <a href="mailto:support@kroni.no">support@kroni.no</a> ved spørsmål om
          personvern.
        </p>
      </PolicySection>

      <PolicySection
        id="opplysninger"
        number="02"
        title="Hvilke opplysninger vi samler inn"
      >
        <p>Vi samler inn følgende kategorier av personopplysninger:</p>
        <ul>
          <li>
            <strong>Foreldrekonto:</strong> E-postadresse og passordhash.
          </li>
          <li>
            <strong>Barneprofil:</strong> Fornavn, fødselsår og valgt
            avatar-nøkkel (ingen fullt navn, ingen bilde lastet opp av bruker).
          </li>
          <li>
            <strong>Enhetsinformasjon:</strong> Enhets-ID og
            push-varslingstoken for å sende varsler til barnets enhet.
          </li>
          <li>
            <strong>Bruksdata:</strong> Anonymisert statistikk om appbruk
            (ingen kobling til enkeltpersoner).
          </li>
        </ul>
      </PolicySection>

      <PolicySection
        id="formal"
        number="03"
        title="Hvorfor vi behandler opplysningene"
      >
        <ul>
          <li>
            <strong>Levering av tjenesten:</strong> For å opprette og
            administrere familiekontoer, oppgaver og ukepenger (rettslig
            grunnlag: avtale, jf. GDPR art. 6 nr. 1 b).
          </li>
          <li>
            <strong>Push-varsler:</strong> For å varsle barn og foreldre om
            hendelser i appen (rettslig grunnlag: samtykke, jf. GDPR art. 6 nr.
            1 a).
          </li>
          <li>
            <strong>Kundeservice:</strong> For å besvare henvendelser og løse
            tekniske problemer (rettslig grunnlag: berettiget interesse, jf.
            GDPR art. 6 nr. 1 f).
          </li>
          <li>
            <strong>Sikkerhet og drift:</strong> For å ivareta sikkerheten i
            tjenesten og forhindre misbruk (rettslig grunnlag: berettiget
            interesse).
          </li>
        </ul>
      </PolicySection>

      <PolicySection
        id="oppbevaring"
        number="04"
        title="Oppbevaring og sletting"
      >
        <p>
          Personopplysninger oppbevares så lenge kontoen er aktiv. Etter at en
          konto er slettet, vil alle personopplysninger bli slettet innen 30
          dager, med unntak av data vi er lovpålagt å beholde (f.eks.
          regnskapsdata i henhold til bokføringsloven). Anonymisert
          bruksstatistikk kan beholdes på ubestemt tid.
        </p>
      </PolicySection>

      <PolicySection
        id="deling"
        number="05"
        title="Deling med tredjeparter"
      >
        <p>
          Vi selger ikke personopplysninger til tredjeparter. Vi kan dele
          opplysninger med underleverandører som hjelper oss med å levere
          tjenesten (f.eks. skytjenester og push-varslingstjenester). Alle
          underleverandører er bundet av databehandleravtaler i samsvar med
          GDPR.
        </p>
      </PolicySection>

      <PolicySection
        id="rettigheter"
        number="06"
        title="Dine rettigheter"
      >
        <p>Under GDPR har du følgende rettigheter:</p>
        <ul>
          <li>Rett til innsyn i dine personopplysninger</li>
          <li>Rett til retting av uriktige opplysninger</li>
          <li>Rett til sletting («retten til å bli glemt»)</li>
          <li>Rett til begrensning av behandling</li>
          <li>Rett til dataportabilitet</li>
          <li>Rett til å protestere mot behandling</li>
          <li>Rett til å trekke tilbake samtykke</li>
        </ul>
        <p>
          For å utøve dine rettigheter, kontakt oss på{" "}
          <a href="mailto:support@kroni.no">support@kroni.no</a>. Du har også
          rett til å klage til{" "}
          <a
            href="https://www.datatilsynet.no"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datatilsynet
          </a>
          .
        </p>
      </PolicySection>

      <PolicySection id="barn" number="07" title="Barn og personvern">
        <p>
          Kroni er utformet for bruk av foreldre på vegne av sine barn.
          Barneprofiler opprettes kun av foreldre eller foresatte. Vi samler
          ikke inn mer informasjon om barn enn det som er strengt nødvendig
          for å levere tjenesten. Vi ber ikke barn om e-postadresse eller
          annen kontaktinformasjon.
        </p>
      </PolicySection>

      <PolicySection
        id="cookies"
        number="08"
        title="Informasjonskapsler (cookies)"
      >
        <p>
          Dette nettstedet bruker kun teknisk nødvendige informasjonskapsler.
          Vi bruker ikke sporings- eller markedsføringskapsler.
        </p>
      </PolicySection>

      <PolicySection
        id="endringer"
        number="09"
        title="Endringer i personvernerklæringen"
      >
        <p>
          Vi kan oppdatere denne erklæringen fra tid til annen. Vesentlige
          endringer vil bli varslet via e-post eller ved tydelig melding i
          appen. Datoen øverst på siden angir når erklæringen sist ble
          oppdatert.
        </p>
      </PolicySection>

      <PolicySection id="kontakt" number="10" title="Kontakt">
        <p>
          Nilsen Konsult
          <br />
          E-post:{" "}
          <a href="mailto:support@kroni.no">support@kroni.no</a>
        </p>
      </PolicySection>
    </PolicyShell>
  );
}
