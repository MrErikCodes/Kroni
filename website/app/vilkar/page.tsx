// [REVIEW] copy generated; native review needed.
import type { Metadata } from "next";
import PolicyShell, {
  PolicySection,
} from "../_components/PolicyShell";

export const metadata: Metadata = {
  title: "Vilkår for bruk — Kroni",
  description: "Les vilkårene for bruk av Kroni-appen og tjenestene vi tilbyr.",
};

const sections = [
  { id: "parter", number: "01", title: "Avtaleparter og aksept" },
  { id: "tjeneste", number: "02", title: "Beskrivelse av tjenesten" },
  { id: "konto", number: "03", title: "Kontoregistrering" },
  { id: "abonnement", number: "04", title: "Abonnement og betaling" },
  { id: "angrerett", number: "05", title: "Angrerett" },
  { id: "akseptabel-bruk", number: "06", title: "Akseptabel bruk" },
  { id: "rettigheter", number: "07", title: "Immaterielle rettigheter" },
  { id: "ansvar", number: "08", title: "Ansvarsbegrensning" },
  { id: "endringer", number: "09", title: "Endringer i vilkårene" },
  { id: "lov", number: "10", title: "Gjeldende lov og verneting" },
  { id: "kontakt", number: "11", title: "Kontakt" },
];

export default function VilkarPage() {
  return (
    <PolicyShell
      eyebrow="Vilkår"
      title="Vilkår for bruk"
      intro="Disse vilkårene regulerer bruken av Kroni-appen og tilhørende tjenester. Vi har gjort dem så korte og leselige som loven tillater."
      updated="april 2026"
      sections={sections}
    >
      <PolicySection
        id="parter"
        number="01"
        title="Avtaleparter og aksept"
      >
        <p>
          Disse vilkårene («Vilkårene») er en avtale mellom deg («Brukeren») og
          Nilsen Konsult («vi», «oss», «Kroni»). Ved å laste ned, installere
          eller bruke Kroni-appen aksepterer du disse Vilkårene. Dersom du ikke
          aksepterer Vilkårene, skal du ikke bruke appen.
        </p>
      </PolicySection>

      <PolicySection
        id="tjeneste"
        number="02"
        title="Beskrivelse av tjenesten"
      >
        <p>
          Kroni er en familieapp som lar foreldre opprette oppgaver, sette
          ukepenger og administrere belønninger for sine barn. Tjenesten
          leveres som programvare-som-tjeneste (SaaS) og krever
          internettilgang.
        </p>
      </PolicySection>

      <PolicySection
        id="konto"
        number="03"
        title="Kontoregistrering"
      >
        <p>
          Du må opprette en konto for å bruke Kroni. Du er ansvarlig for at
          informasjonen du oppgir er korrekt og holdes oppdatert. Du er
          ansvarlig for all aktivitet som skjer på din konto. Kontoen er
          personlig og skal ikke deles med andre voksne utenfor husstanden uten
          vår skriftlige tillatelse.
        </p>
      </PolicySection>

      <PolicySection
        id="abonnement"
        number="04"
        title="Abonnement og betaling"
      >
        <p>
          Kroni tilbys med en gratisplan og et betalt abonnement.
          Abonnementet fornyes automatisk ved slutten av hver
          abonnementsperiode (månedlig eller årlig, avhengig av valgt plan)
          med mindre du avbestiller før fornyelsesdatoen.
        </p>
        <p>
          <strong>App Store (Apple):</strong> Kjøp via App Store reguleres av
          Apples vilkår for kjøp. Betaling belastes din Apple ID-konto ved
          bekreftelse av kjøpet. Abonnementet fornyes automatisk med mindre
          automatisk fornyelse deaktiveres minst 24 timer før gjeldende
          periode utløper. Administrasjon og avbestilling skjer i dine
          iPhone-innstillinger under Abonnementer.
        </p>
        <p>
          <strong>Google Play:</strong> Kjøp via Google Play reguleres av
          Googles vilkår for kjøp. Betaling belastes din Google-konto.
          Abonnementet fornyes automatisk med mindre du avbestiller minst 24
          timer før gjeldende periode utløper. Administrasjon og avbestilling
          skjer i Google Play Store under Abonnementer.
        </p>
      </PolicySection>

      <PolicySection id="angrerett" number="05" title="Angrerett">
        <p>
          For kjøp gjort direkte fra oss (ikke via App Store eller Google
          Play) gjelder angrerettloven. Du har 14 dagers angrerett fra
          kjøpsdatoen. For digitale tjenester som allerede er tatt i bruk, kan
          angreretten bortfalle etter ditt samtykke. Kontakt{" "}
          <a href="mailto:support@kroni.no">support@kroni.no</a> for å benytte
          angreretten.
        </p>
      </PolicySection>

      <PolicySection
        id="akseptabel-bruk"
        number="06"
        title="Akseptabel bruk"
      >
        <p>Du samtykker i å ikke bruke Kroni til å:</p>
        <ul>
          <li>Handle i strid med gjeldende lover og regler</li>
          <li>Laste opp krenkende, ulovlig eller støtende innhold</li>
          <li>Forsøke å skaffe deg uautorisert tilgang til systemet</li>
          <li>Forstyrre eller skade tjenestens infrastruktur</li>
        </ul>
      </PolicySection>

      <PolicySection
        id="rettigheter"
        number="07"
        title="Immaterielle rettigheter"
      >
        <p>
          Alle rettigheter til Kroni-appen, inkludert programvare, design,
          varemerker og innhold, tilhører Nilsen Konsult. Du gis en begrenset,
          ikke-eksklusiv lisens til å bruke appen til personlig,
          ikke-kommersiell bruk.
        </p>
      </PolicySection>

      <PolicySection
        id="ansvar"
        number="08"
        title="Ansvarsbegrensning"
      >
        <p>
          Tjenesten leveres «som den er». Vi garanterer ikke at tjenesten er
          feilfri eller alltid tilgjengelig. I den grad loven tillater det, er
          vi ikke ansvarlige for indirekte tap eller følgeskader som oppstår
          ved bruk av tjenesten.
        </p>
      </PolicySection>

      <PolicySection
        id="endringer"
        number="09"
        title="Endringer i vilkårene"
      >
        <p>
          Vi forbeholder oss retten til å endre disse Vilkårene. Vesentlige
          endringer varsles via e-post eller i appen minst 30 dager før de
          trer i kraft. Fortsatt bruk av tjenesten etter at endringene trer i
          kraft, anses som aksept av de nye Vilkårene.
        </p>
      </PolicySection>

      <PolicySection
        id="lov"
        number="10"
        title="Gjeldende lov og verneting"
      >
        <p>
          Disse Vilkårene reguleres av norsk rett. Eventuelle tvister søkes
          løst i minnelighet. Dersom dette ikke lykkes, er Oslo tingrett
          verneting.
        </p>
      </PolicySection>

      <PolicySection id="kontakt" number="11" title="Kontakt">
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
