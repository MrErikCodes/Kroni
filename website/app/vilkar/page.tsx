import type { Metadata } from "next";
import Link from "next/link";
import PolicyShell, {
  PolicySection,
} from "../_components/PolicyShell";

export const metadata: Metadata = {
  title: "Vilkår for bruk — Kroni",
  description:
    "Vilkårene for bruk av Kroni-appen og familieabonnementet — skrevet for å være forståelige, men juridisk dekkende etter norsk forbrukerrett.",
};

const sections = [
  { id: "innledning", number: "01", title: "Innledning og avtaleparter" },
  { id: "definisjoner", number: "02", title: "Definisjoner" },
  { id: "tjenesten", number: "03", title: "Tjenestens innhold og begrensninger" },
  { id: "konto", number: "04", title: "Oppretting av konto og paring av barn" },
  { id: "akseptabel-bruk", number: "05", title: "Akseptabel bruk" },
  { id: "abonnement", number: "06", title: "Familieabonnement og priser" },
  { id: "provetid", number: "07", title: "Prøveperiode på 7 dager" },
  { id: "betaling", number: "08", title: "Betaling og automatisk fornying" },
  { id: "oppsigelse", number: "09", title: "Oppsigelse" },
  { id: "refusjon", number: "10", title: "Refusjon" },
  { id: "angrerett", number: "11", title: "Angrerett og samtykke til umiddelbar levering" },
  { id: "brukerinnhold", number: "12", title: "Innhold opprettet av brukere" },
  { id: "rettigheter", number: "13", title: "Immaterielle rettigheter" },
  { id: "personvern", number: "14", title: "Personvern" },
  { id: "ansvar", number: "15", title: "Garantier og ansvarsbegrensning" },
  { id: "barneansvar", number: "16", title: "Foreldrenes ansvar for barn" },
  { id: "endringer", number: "17", title: "Endringer i vilkårene" },
  { id: "force-majeure", number: "18", title: "Force majeure" },
  { id: "fullstendig", number: "19", title: "Fullstendig avtale og delvis ugyldighet" },
  { id: "lov", number: "20", title: "Lovvalg, tvisteløsning og verneting" },
  { id: "kontakt", number: "21", title: "Kontakt" },
];

export default function VilkarPage() {
  return (
    <PolicyShell
      eyebrow="Vilkår"
      title="Vilkår for bruk"
      intro="Disse vilkårene regulerer bruken av Kroni-appen og familieabonnementet. De er skrevet på vanlig norsk, men bruker presise juridiske begreper der det betyr noe — slik at både du og vi vet hva vi har avtalt."
      updated="28. april 2026"
      sections={sections}
    >
      <PolicySection
        id="innledning"
        number="01"
        title="Innledning og avtaleparter"
      >
        <p>
          Disse vilkårene («Vilkårene») utgjør en bindende avtale mellom deg som
          bruker («du», «Brukeren», «Forelderen») og <strong>Nilsen Konsult</strong>,
          norsk enkeltpersonforetak med forretningsadresse i Norge («vi», «oss»,
          «Nilsen Konsult», «Kroni»). Nilsen Konsult er leverandør av
          familieappen Kroni og det tilhørende nettstedet kroni.no.
        </p>
        <p>
          Ved å laste ned, opprette konto i eller på annen måte ta i bruk
          Kroni-appen, bekrefter du at du har lest og akseptert disse Vilkårene
          og vår <Link href="/personvern">personvernerklæring</Link>. Dersom du
          ikke aksepterer Vilkårene, kan du ikke bruke tjenesten.
        </p>
        <p>
          Du må være myndig (fylt 18 år) og ha rettslig handleevne for å inngå
          denne avtalen. Personer under 18 år kan kun bruke tjenesten gjennom
          en paret barneprofil opprettet av en forelder eller foresatt, og
          forelderen har det fulle ansvaret for slik bruk.
        </p>
      </PolicySection>

      <PolicySection id="definisjoner" number="02" title="Definisjoner">
        <p>I disse Vilkårene betyr:</p>
        <ul>
          <li>
            <strong>Appen</strong> – Kroni-mobilappen for iOS og Android, samt
            tilhørende nettsted og bakenforliggende tjenester.
          </li>
          <li>
            <strong>Forelder</strong> – den voksne kontoinnehaveren som
            oppretter familien, administrerer barneprofiler, oppretter
            oppgaver og belønninger, og som er ansvarlig overfor Kroni.
          </li>
          <li>
            <strong>Barn</strong> – en barneprofil pares til Forelderens konto
            ved hjelp av en sekssifret kode. Barnet har en egen, forenklet
            innlogging i appen, men ingen egen avtale med Kroni.
          </li>
          <li>
            <strong>Konto</strong> – Forelderens samlede tilgang til
            tjenesten, inkludert tilknyttede barneprofiler, oppgaver og
            belønninger.
          </li>
          <li>
            <strong>Virtuelle kroner</strong> – en intern, ikke-monetær
            tellestrek som vises som «kroner» eller «kr» i barnets app. Disse
            representerer <em>ikke</em> norske kroner, kan ikke veksles inn i
            ekte penger, og har ingen verdi utenfor Appen.
          </li>
          <li>
            <strong>Belønning</strong> – en gjenstand, opplevelse eller
            handling som Forelderen selv definerer, og som barnet kan «kjøpe»
            ved å bruke virtuelle kroner. Belønninger leveres av Forelderen,
            ikke av Kroni.
          </li>
          <li>
            <strong>Familieabonnement</strong> – det betalte
            abonnementsproduktet som låser opp ubegrenset antall
            barneprofiler, oppgaver og belønninger.
          </li>
          <li>
            <strong>Prøveperiode</strong> – sju (7) dagers gratis prøvetid på
            Familieabonnementet, levert av Apple App Store eller Google Play.
          </li>
          <li>
            <strong>Plattformene</strong> – Apple App Store (Apple Inc.) og
            Google Play (Google LLC), som fungerer som distribusjons- og
            betalingsformidlere for Appen.
          </li>
        </ul>
      </PolicySection>

      <PolicySection
        id="tjenesten"
        number="03"
        title="Tjenestens innhold og begrensninger"
      >
        <p>
          Kroni er en familieapp som lar Forelderen opprette oppgaver
          («husarbeid», «leksetid», «gå tur med hunden» og lignende), tildele
          dem til ett eller flere barn, og knytte en sum virtuelle kroner til
          hver oppgave. Når barnet markerer en oppgave som utført, kan
          Forelderen godkjenne fullføringen, hvorpå barnets virtuelle saldo
          øker tilsvarende. Barnet kan deretter benytte saldoen til å «løse
          inn» belønninger som Forelderen selv har lagt inn.
        </p>
        <p>
          <strong>
            Kroni er ikke en betalingstjeneste, lommebok eller finansiell
            institusjon.
          </strong>{" "}
          Det flyttes aldri ekte penger mellom kontoer i Kroni. Saldoen som
          vises hos barnet er en intern poengverdi som kun har betydning
          innenfor familien som bruker Appen. Virtuelle kroner kan ikke
          overføres mellom familier, kan ikke veksles inn i kontanter, varer
          eller tjenester fra tredjeparter, og gir ingen rett overfor Kroni
          eller noen andre. Dersom Forelderen ønsker å gi barnet ekte penger
          som motsvarighet til den virtuelle saldoen, er dette en privat
          ordning mellom Forelderen og barnet, som Kroni ikke er part i.
        </p>
        <p>
          Tjenesten leveres som programvare-som-tjeneste over internett.
          Funksjoner kan endres, utvides eller avvikles over tid. Vi
          bestreber oss på rimelig tilgjengelighet, men gir ingen garanti
          for uavbrutt drift.
        </p>
      </PolicySection>

      <PolicySection
        id="konto"
        number="04"
        title="Oppretting av konto og paring av barn"
      >
        <p>
          For å bruke Kroni må Forelderen opprette en konto via vår
          autentiseringspartner Clerk, med e-postadresse eller via «Logg på
          med Apple». Forelderen plikter å oppgi korrekte og oppdaterte
          opplysninger og er ansvarlig for å holde innloggingsinformasjonen
          hemmelig. All aktivitet som skjer fra Forelderens konto, regnes
          som utført av Forelderen.
        </p>
        <p>
          Barneprofiler opprettes alltid av Forelderen. Når en barneprofil
          legges til, genererer Appen en sekssifret paringskode som brukes
          for å koble barnets enhet til familien. Forelderen står inne for
          at det er Forelderen selv eller annen person med foreldreansvar
          som oppretter barneprofilen, og at relevant samtykke er innhentet
          i tråd med GDPR artikkel 8 og norsk personopplysningslov for barn
          under 13 år.
        </p>
        <p>
          Hvis Forelderen mistenker uautorisert bruk av Kontoen, skal Kroni
          varsles uten ugrunnet opphold på{" "}
          <a href="mailto:support@kroni.no">support@kroni.no</a>.
        </p>
      </PolicySection>

      <PolicySection
        id="akseptabel-bruk"
        number="05"
        title="Akseptabel bruk"
      >
        <p>Du forplikter deg til å ikke:</p>
        <ul>
          <li>
            bruke Appen i strid med norsk eller annen relevant lovgivning,
            offentlig orden eller alminnelige etiske normer;
          </li>
          <li>
            forsøke å skaffe deg uautorisert tilgang til Kronis systemer,
            kontoer som ikke tilhører deg, eller underliggende
            infrastruktur;
          </li>
          <li>
            dekompilere, omskrive, demontere eller på annen måte
            reverse-engineere klient eller server, utover det ufravikelig
            lov tillater;
          </li>
          <li>
            kjøre automatiserte skript, skrapere, boter eller belastnings­tester
            mot tjenesten uten skriftlig forhåndssamtykke fra Kroni;
          </li>
          <li>
            bruke Appen til andre formål enn familiens oppgavestyring og
            belønningssystem — for eksempel til kommersiell virksomhet,
            videresalg eller massehåndtering av brukere;
          </li>
          <li>
            skrive eller laste opp oppgaver, belønninger, profilnavn eller
            annet innhold som er støtende, krenkende, diskriminerende,
            seksualisert, voldelig, eller som på annen måte er upassende for
            barn;
          </li>
          <li>
            bruke Appen til å overvåke barn på en måte som er i strid med
            barnets rettigheter etter barnekonvensjonen og norsk
            barnelovgivning.
          </li>
        </ul>
        <p>
          Forelderen er ansvarlig for at all bruk fra tilknyttede barneprofiler
          skjer innenfor disse rammene. Vi forbeholder oss retten til å
          stenge kontoer som benyttes i strid med Vilkårene, etter rimelig
          varsel der dette lar seg gjøre.
        </p>
      </PolicySection>

      <PolicySection
        id="abonnement"
        number="06"
        title="Familieabonnement og priser"
      >
        <p>
          Kroni tilbys i to nivåer:
        </p>
        <ul>
          <li>
            <strong>Gratis</strong> — opptil ett barn og maksimalt fem
            aktive oppgaver. Ingen tidsbegrensning, ingen belastning.
            Ukepenger og enkelte avanserte funksjoner er ikke inkludert.
          </li>
          <li>
            <strong>Familie månedlig</strong> — 49 kr per måned. Ubegrenset
            antall barn, ubegrensede oppgaver, belønninger, mål og
            ukepenger.
          </li>
          <li>
            <strong>Familie årlig</strong> — 399 kr per år (tilsvarer en
            besparelse på omlag 32 % sammenlignet med månedlig). Samme
            innhold som månedlig.
          </li>
        </ul>
        <p>
          Prisene som er oppgitt er veiledende og vises i norske kroner
          inkludert merverdiavgift. Den prisen som faktisk gjelder for ditt
          kjøp, er den som vises i App Store eller Google Play på
          kjøpstidspunktet, og kan variere mellom land og regioner som følge
          av valuta, lokal avgift og prislister i Plattformene.
        </p>
      </PolicySection>

      <PolicySection
        id="provetid"
        number="07"
        title="Prøveperiode på 7 dager"
      >
        <p>
          Alle nye brukere får en gratis prøveperiode på sju (7) dager på
          Familieabonnementet, både ved månedlig og årlig fakturering.
          Prøveperioden starter idet du fullfører kjøpet i App Store eller
          Google Play. I løpet av prøveperioden har du full tilgang til alle
          funksjoner i Familieabonnementet.
        </p>
        <p>
          Ved utløp av prøveperioden fornyes abonnementet{" "}
          <strong>automatisk</strong> til det intervallet du valgte ved
          kjøpet — månedlig 49 kr eller årlig 399 kr — til den prisen som
          vises i Plattformen på kjøpstidspunktet, og du blir belastet via
          Apple ID eller Google-konto.
        </p>
        <p>
          For å unngå belastning må du <strong>kansellere abonnementet
          minst 24 timer før prøveperioden utløper</strong>. Kansellering
          gjøres direkte i abonnementsinnstillingene i Plattformene:
        </p>
        <ul>
          <li>
            <strong>iOS:</strong> Innstillinger → Apple ID → Abonnementer →
            Kroni → Avbryt abonnement.
          </li>
          <li>
            <strong>Android:</strong> Google Play-appen → Profil →
            Betalinger og abonnementer → Abonnementer → Kroni → Avslutt
            abonnement.
          </li>
        </ul>
        <p>
          Du kan kun benytte gratis prøveperiode én gang per Apple ID eller
          Google-konto, i samsvar med Plattformenes egne regler.
        </p>
      </PolicySection>

      <PolicySection
        id="betaling"
        number="08"
        title="Betaling og automatisk fornying"
      >
        <p>
          Familieabonnementet selges utelukkende som et kjøp i appen via
          App Store eller Google Play. <strong>Kroni er ikke selger av
          betalingen og er ikke merchant of record.</strong> Alle
          transaksjoner gjennomføres av henholdsvis Apple Distribution
          International Ltd. og Google Commerce Limited (eller en annen
          relevant Google-enhet), som er ansvarlig for fakturering, kvitteringer,
          chargebacks, skattetrekk og overholdelse av deres egne kjøpsvilkår.
          Kroni mottar nettoinntekt etter at Plattformen har trukket sin
          provisjon.
        </p>
        <p>
          Abonnementet fornyes automatisk for samme periode (en måned eller
          ett år) inntil det sies opp av deg gjennom Plattformen. Belastning
          skjer på det betalingsmiddelet som er knyttet til Apple ID-en
          eller Google-kontoen din.
        </p>
        <p>
          Vi kan endre prisene for fremtidige fornyelser. Endringer varsles
          minst 30 dager før de trer i kraft, via e-post eller ved varsel i
          Appen. Plattformene har egne rutiner for samtykke til
          prisøkninger; i enkelte tilfeller må du aktivt samtykke til ny
          pris for at abonnementet skal fortsette. Hvis du ikke ønsker å
          akseptere en prisendring, kan du si opp abonnementet før den nye
          prisen trer i kraft.
        </p>
      </PolicySection>

      <PolicySection id="oppsigelse" number="09" title="Oppsigelse">
        <p>
          Du kan si opp Familieabonnementet når som helst, gjennom App Store
          eller Google Play (se punkt 07 for fremgangsmåte). Oppsigelsen får
          virkning ved slutten av den inneværende fakturaperioden — du
          beholder altså full tilgang ut den måneden eller det året du har
          betalt for.
        </p>
        <p>
          Vi gir <strong>ingen forholdsmessig refusjon</strong> for ubrukt
          tid etter oppsigelse, da prisene allerede er priset ut fra at
          abonnementet skal kunne sies opp gjennom hele perioden uten
          binding utover inneværende intervall.
        </p>
        <p>
          Du kan slette familiekontoen din permanent fra innstillinger i
          Appen. Sletting av Kontoen oppfyller ikke automatisk en aktiv
          abonnementsoppsigelse i Plattformene; for å stoppe fornyelse må
          oppsigelse utføres i Plattformens abonnementsinnstillinger som
          beskrevet over.
        </p>
        <p>
          Vi kan på vår side avslutte avtalen ved vesentlig mislighold,
          herunder brudd på punkt 05 (Akseptabel bruk), brudd på betaling,
          eller dersom fortsatt levering vil være i strid med lov.
        </p>
      </PolicySection>

      <PolicySection id="refusjon" number="10" title="Refusjon">
        <p>
          Fordi Kroni ikke er selger av betalingen, kan vi ikke selv
          tilbakebetale beløp som er betalt via App Store eller Google Play.
          Refusjonsforespørsler må derfor rettes direkte til Plattformen som
          gjennomførte kjøpet:
        </p>
        <ul>
          <li>
            <strong>Apple App Store:</strong>{" "}
            <a
              href="https://reportaproblem.apple.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              reportaproblem.apple.com
            </a>
          </li>
          <li>
            <strong>Google Play:</strong>{" "}
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              play.google.com
            </a>{" "}
            → Bestillingshistorikk → velg kjøpet → «Be om refusjon».
          </li>
        </ul>
        <p>
          Apple og Google vurderer refusjonsforespørsler etter sine egne
          retningslinjer. Den syv dager lange prøveperioden er ment å gi
          deg anledning til å vurdere tjenesten i god tid før du blir
          belastet, slik at refusjon i liten grad blir nødvendig.
        </p>
        <p>
          Dersom du mener du har et selvstendig krav mot Kroni — for
          eksempel ved vesentlig mislighold fra vår side — kan du
          fremme krav direkte mot oss på{" "}
          <a href="mailto:support@kroni.no">support@kroni.no</a>. Vi
          behandler slike henvendelser i samsvar med ufravikelig
          forbrukerrett, herunder forbrukerkjøpsloven.
        </p>
      </PolicySection>

      <PolicySection
        id="angrerett"
        number="11"
        title="Angrerett og samtykke til umiddelbar levering"
      >
        <p>
          Forbrukere har som hovedregel 14 dagers angrerett ved fjernsalg
          etter angrerettloven. Etter angrerettloven § 22 bokstav n
          bortfaller imidlertid angreretten for digitalt innhold som leveres
          umiddelbart etter avtaleinngåelsen, dersom forbrukeren (a)
          uttrykkelig samtykker til at leveringen begynner før angrefristen
          utløper og (b) erkjenner at angreretten dermed bortfaller.
        </p>
        <p>
          Ved å aktivere et Familieabonnement gir du følgende uttrykkelige
          samtykke:
        </p>
        <p>
          <em>
            «Jeg samtykker til at Kroni leveres umiddelbart etter
            avtaleinngåelse, og jeg erkjenner at angreretten faller bort så
            snart abonnementet er aktivert.»
          </em>
        </p>
        <p>
          Dette gjelder også gjennom prøveperioden, dersom du tar tjenesten
          i bruk i løpet av disse sju dagene. Den syv dager lange,
          kostnadsfrie prøveperioden gir deg likevel reell mulighet til å
          vurdere tjenesten og avslutte uten å bli belastet, slik beskrevet
          i punkt 07.
        </p>
      </PolicySection>

      <PolicySection
        id="brukerinnhold"
        number="12"
        title="Innhold opprettet av brukere"
      >
        <p>
          Forelderen har det fulle ansvaret for alt innhold som legges inn
          i Appen — herunder oppgavetitler, beskrivelser,
          belønningsnavn, ukepengeordninger, profilnavn på barn, og annet
          fritekstinnhold. Du står inne for at slikt innhold er passende
          for barn og ikke krenker andres rettigheter.
        </p>
        <p>
          Innhold som legges inn av Forelderen lagres på Kronis
          serverinfrastruktur. Vi tar ikke redaksjonelt ansvar for
          familiens private innhold, men forbeholder oss retten til å
          fjerne eller blokkere innhold som åpenbart strider mot punkt
          05 eller mot lov, særlig dersom det utgjør en risiko for
          tredjeparter eller for stabiliteten i tjenesten.
        </p>
      </PolicySection>

      <PolicySection
        id="rettigheter"
        number="13"
        title="Immaterielle rettigheter"
      >
        <p>
          Alle rettigheter til Kroni-merkenavnet, logo, programvare,
          design, ikoner, tekst, illustrasjoner og annen opphavsrettslig
          beskyttet komponent i Appen og på kroni.no tilhører Nilsen
          Konsult eller våre lisensgivere. Ingen rettigheter overdras til
          deg utover det som uttrykkelig fremgår av disse Vilkårene.
        </p>
        <p>
          Du gis en begrenset, ikke-eksklusiv, ikke-overførbar og
          tilbakekallelig bruksrett til å installere og benytte Appen på
          enheter som tilhører deg eller din husstand, til personlig,
          ikke-kommersiell familiebruk, så lenge du overholder Vilkårene.
        </p>
        <p>
          Ditt eget innhold (oppgavetitler, profilnavn, belønninger og
          lignende) tilhører deg. Du gir Kroni en begrenset rett til å
          lagre, vise og behandle slikt innhold i den grad det er
          nødvendig for å levere tjenesten til deg.
        </p>
      </PolicySection>

      <PolicySection id="personvern" number="14" title="Personvern">
        <p>
          Kroni behandler personopplysninger om Forelderen og barn i tråd
          med personopplysningsloven og personvernforordningen (GDPR).
          Hvilke opplysninger vi behandler, til hvilke formål, hvor lenge
          de lagres, og hvilke rettigheter du har, fremgår av vår{" "}
          <Link href="/personvern">personvernerklæring</Link>. Ved
          spørsmål om personvern, kontakt oss på{" "}
          <a href="mailto:privacy@kroni.no">privacy@kroni.no</a>.
        </p>
      </PolicySection>

      <PolicySection
        id="ansvar"
        number="15"
        title="Garantier og ansvarsbegrensning"
      >
        <p>
          Kroni leveres «som den er» og «som tilgjengelig». Vi gir, i den
          grad ufravikelig lov tillater det, ingen garanti for at tjenesten
          alltid vil være tilgjengelig, feilfri eller egnet for et bestemt
          formål utover det som er beskrevet på kroni.no og i Appen.
        </p>
        <p>
          Vi er ikke ansvarlige for tap av virtuelle kroner som skyldes
          forhold på Forelderens eller barnets side — for eksempel feil
          inntastet beløp, sletting av oppgaver, deling av innloggingen
          eller mistet enhet. Virtuelle kroner har som nevnt ingen
          pengeverdi, og slikt «tap» innebærer ikke et økonomisk tap i
          rettslig forstand.
        </p>
        <p>
          Med mindre annet følger av ufravikelig lov, og særlig av
          forbrukerkjøpsloven, er Kronis samlede ansvar overfor en bruker
          per kalenderår begrenset til det beløpet brukeren faktisk har
          betalt for tjenesten i det aktuelle kalenderåret. Vi svarer ikke
          for indirekte tap, herunder tapt fortjeneste, tapt forventet
          besparelse, tap av data, tap av goodwill eller tredjeparts­krav,
          så langt slikt ansvar lovlig kan fraskrives.
        </p>
        <p>
          Begrensningene i dette punktet gjelder ikke ved forsett eller
          grov uaktsomhet fra Kronis side, eller ved personskade voldt ved
          uaktsomhet, og påvirker ikke dine ufravikelige rettigheter som
          forbruker etter norsk lov.
        </p>
      </PolicySection>

      <PolicySection
        id="barneansvar"
        number="16"
        title="Foreldrenes ansvar for barn"
      >
        <p>
          Norsk lov setter aldersgrensen for digitalt samtykke etter GDPR
          artikkel 8 til 13 år. For barn under 13 må forelder eller foresatt
          gi samtykke til behandlingen av barnets personopplysninger.
          Forelderen står inne for at slikt samtykke er gyldig avgitt på
          vegne av barnet, og forplikter seg til å forklare bruken av
          Appen for barnet på en måte som er tilpasset barnets alder og
          modenhet.
        </p>
        <p>
          Forelderen har, i tråd med foreldreansvaret etter barneloven, det
          overordnede ansvaret for at barnets bruk av Appen skjer på en
          trygg og hensiktsmessig måte. Dette omfatter blant annet
          rimelig skjermtid, valg av oppgaver og belønninger som er
          passende for barnets alder, samt ivaretakelse av barnets
          PIN-kode og enhet.
        </p>
      </PolicySection>

      <PolicySection
        id="endringer"
        number="17"
        title="Endringer i vilkårene"
      >
        <p>
          Vi kan oppdatere disse Vilkårene for å reflektere endringer i
          tjenesten, lovgivningen, sikkerhetshensyn eller forretningsmessige
          forhold. Datoen øverst på denne siden viser når Vilkårene sist ble
          endret.
        </p>
        <p>
          Vesentlige endringer som påvirker dine rettigheter eller plikter,
          varsles minst <strong>30 dager før</strong> de trer i kraft, via
          e-post til den adressen vi har registrert på Kontoen din eller
          ved tydelig varsel i Appen. Fortsatt bruk av tjenesten etter at
          endringene har trådt i kraft, regnes som aksept av de oppdaterte
          Vilkårene. Hvis du ikke kan godta endringene, kan du si opp
          abonnementet før de trer i kraft, jf. punkt 09.
        </p>
      </PolicySection>

      <PolicySection
        id="force-majeure"
        number="18"
        title="Force majeure"
      >
        <p>
          Ingen av partene anses for å ha misligholdt sine forpliktelser
          etter avtalen så lenge oppfyllelse hindres av forhold utenfor
          partens kontroll, og som parten ikke med rimelighet kunne ha
          forutsett, unngått eller overvunnet — herunder krig,
          naturkatastrofer, omfattende strøm- eller internettbrudd,
          vesentlige svikt hos underleverandører som Apple, Google, Clerk
          eller hostingleverandør, samt myndighetspålegg.
        </p>
      </PolicySection>

      <PolicySection
        id="fullstendig"
        number="19"
        title="Fullstendig avtale og delvis ugyldighet"
      >
        <p>
          Disse Vilkårene, sammen med personvernerklæringen og eventuelle
          tilleggsvilkår vi viser til, utgjør den fullstendige avtalen
          mellom deg og Kroni vedrørende bruken av Appen, og erstatter
          tidligere skriftlige eller muntlige avtaler om samme tema.
        </p>
        <p>
          Dersom én eller flere bestemmelser i Vilkårene blir ansett som
          ugyldige, ulovlige eller ikke kan gjennomføres, skal de
          gjenværende bestemmelsene fortsatt gjelde i sin helhet, og den
          ugyldige bestemmelsen skal tolkes så nær opp til den
          opprinnelige meningen som mulig innenfor lovens rammer.
        </p>
      </PolicySection>

      <PolicySection
        id="lov"
        number="20"
        title="Lovvalg, tvisteløsning og verneting"
      >
        <p>
          Disse Vilkårene reguleres av norsk rett. Ved tvist skal partene
          først forsøke å finne en minnelig løsning gjennom direkte
          dialog. Som forbruker har du rett til å henvende deg til:
        </p>
        <ul>
          <li>
            <strong>Forbrukertilsynet</strong> –{" "}
            <a
              href="https://www.forbrukertilsynet.no"
              target="_blank"
              rel="noopener noreferrer"
            >
              forbrukertilsynet.no
            </a>
          </li>
          <li>
            <strong>Forbrukerklageutvalget</strong> –{" "}
            <a
              href="https://www.forbrukerklageutvalget.no"
              target="_blank"
              rel="noopener noreferrer"
            >
              forbrukerklageutvalget.no
            </a>
          </li>
          <li>
            <strong>EU-kommisjonens nettbaserte tvisteløsningsplattform</strong>{" "}
            (ODR) –{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
            >
              ec.europa.eu/consumers/odr
            </a>
          </li>
        </ul>
        <p>
          Dersom tvisten ikke løses i minnelighet, vedtas{" "}
          <strong>Oslo tingrett</strong> som verneting. Ufravikelige regler
          om forbrukerverneting går likevel foran denne vernetingsklausulen.
        </p>
      </PolicySection>

      <PolicySection id="kontakt" number="21" title="Kontakt">
        <p>
          <strong>Nilsen Konsult</strong>
          <br />
          Generelle henvendelser:{" "}
          <a href="mailto:support@kroni.no">support@kroni.no</a>
          <br />
          Personvern og DPO:{" "}
          <a href="mailto:privacy@kroni.no">privacy@kroni.no</a>
          <br />
          Nettsted:{" "}
          <a href="https://kroni.no" target="_blank" rel="noopener noreferrer">
            kroni.no
          </a>
        </p>
        <p className="text-[13px] text-sand-500">
          [Postadresse oppdateres ved registrering]
        </p>
        <p className="mt-8 text-[13px] italic text-sand-500">
          Disse vilkårene oppdateres når Nilsen Konsult vurderer det
          nødvendig.
        </p>
      </PolicySection>
    </PolicyShell>
  );
}
