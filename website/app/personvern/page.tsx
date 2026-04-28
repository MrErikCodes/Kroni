import type { Metadata } from "next";
import Link from "next/link";
import PolicyShell, {
  PolicySection,
} from "../_components/PolicyShell";

export const metadata: Metadata = {
  title: "Personvernerklæring — Kroni",
  description:
    "Hvordan Nilsen Konsult samler inn, bruker, deler og beskytter personopplysninger om foreldre og barn som bruker Kroni.",
};

const sections = [
  { id: "innledning", number: "01", title: "Innledning og behandlingsansvarlig" },
  { id: "opplysninger", number: "02", title: "Hvilke personopplysninger vi behandler" },
  { id: "innsamling", number: "03", title: "Hvordan opplysningene samles inn" },
  { id: "grunnlag", number: "04", title: "Behandlingsgrunnlag" },
  { id: "formal", number: "05", title: "Formålene med behandlingen" },
  { id: "lagringstid", number: "06", title: "Lagringstid" },
  { id: "mottakere", number: "07", title: "Mottakere og databehandlere" },
  { id: "tredjeland", number: "08", title: "Overføring til land utenfor EØS" },
  { id: "sikkerhet", number: "09", title: "Informasjonssikkerhet" },
  { id: "rettigheter", number: "10", title: "Dine rettigheter" },
  { id: "klage", number: "11", title: "Klage til Datatilsynet" },
  { id: "barn", number: "12", title: "Barn og foreldreansvar" },
  { id: "cookies", number: "13", title: "Informasjonskapsler og sporing" },
  { id: "brudd", number: "14", title: "Brudd på personopplysningssikkerheten" },
  { id: "endringer", number: "15", title: "Endringer i erklæringen" },
  { id: "kontakt", number: "16", title: "Kontakt og personvernombud" },
];

export default function PersonvernPage() {
  return (
    <PolicyShell
      eyebrow="Personvern"
      title="Personvernerklæring"
      intro="Kroni er laget for familier — og personvern er ikke noe vi har lagt på etterpå. Denne erklæringen forklarer hvilke opplysninger vi behandler, hvorfor, hvor lenge, og hvilke rettigheter du har."
      updated="28. april 2026"
      sections={sections}
    >
      <PolicySection
        id="innledning"
        number="01"
        title="Innledning og behandlingsansvarlig"
      >
        <p>
          <strong>Nilsen Konsult</strong> er behandlingsansvarlig for
          personopplysningene som behandles gjennom Kroni-appen og
          nettstedet kroni.no. Det betyr at vi bestemmer formålene med, og
          midlene for, behandlingen, og at vi har ansvaret for at
          behandlingen skjer i samsvar med personopplysningsloven og
          personvernforordningen (GDPR).
        </p>
        <p>
          Kroni er en familieapp hvor en forelder oppretter oppgaver,
          ukepenger og belønninger for sine barn. For at appen skal kunne
          fungere, må vi behandle et minimum av personopplysninger om både
          forelderen og barnet. Vi har gjennomgående valgt løsninger som
          samler så lite som mulig — for eksempel ber vi aldri om barnets
          etternavn, e-postadresse eller bilde, og det går aldri ekte
          penger gjennom systemet. Personvern er bygget inn i tjenesten,
          ikke lagt på som et vedlegg.
        </p>
        <p>
          Denne erklæringen er skrevet for at både foreldre og barn skal
          kunne forstå hva som faktisk skjer med opplysningene. Vi har
          forsøkt å bruke vanlig norsk der det går an, og presise
          juridiske begreper der det betyr noe. Hvis noe likevel virker
          uklart, vil vi gjerne høre fra deg — kortere og bedre språk er
          en del av personvernet.
        </p>
        <p>
          Hvis du har spørsmål om personvern, eller ønsker å utøve dine
          rettigheter etter GDPR, kan du nå oss på{" "}
          <a href="mailto:privacy@kroni.no">privacy@kroni.no</a>.
        </p>
      </PolicySection>

      <PolicySection
        id="opplysninger"
        number="02"
        title="Hvilke personopplysninger vi behandler"
      >
        <p>Om <strong>forelderen</strong> behandler vi:</p>
        <ul>
          <li>
            E-postadresse (brukes som innlogging via vår
            autentiseringspartner Clerk).
          </li>
          <li>
            Eventuelt navn på Apple ID dersom du velger «Logg på med
            Apple».
          </li>
          <li>
            Valgfritt visningsnavn som vises i familien (kan være kun
            fornavn eller et kallenavn).
          </li>
          <li>
            Abonnementstatus (gratis, prøveperiode, månedlig, årlig,
            avsluttet) og en RevenueCat-app-bruker-ID som er knyttet til
            din Clerk-bruker-ID.
          </li>
          <li>
            IP-adresse og enhets-/nettleserinformasjon ved innlogging og
            ved kontakt med våre serverendepunkter, brukt til sikkerhet og
            feilsøking.
          </li>
          <li>
            Tidsstempler for hendelser i appen (oppretting av oppgaver,
            godkjenninger, innlogginger).
          </li>
          <li>Valgfri språkpreferanse (Bokmål, engelsk).</li>
        </ul>
        <p>Om <strong>barnet</strong> behandler vi:</p>
        <ul>
          <li>
            Fornavn (typisk slik forelderen kaller barnet i hverdagen — et
            kallenavn er like greit).
          </li>
          <li>
            Eventuelt fødselsår — kun året, aldri dag eller måned. Dette
            er valgfritt og brukes til alderstilpasning av appen.
          </li>
          <li>
            Eventuelt en firesifret PIN, lagret som hash (bcrypt). Vi
            lagrer aldri PIN-en i klartekst.
          </li>
          <li>
            En valgt avatarnøkkel som peker til ett av appens
            forhåndsdefinerte ikoner. Vi lagrer ikke bilder lastet opp av
            bruker.
          </li>
          <li>
            Enhets-ID og push-token for å sende varsler om nye oppgaver,
            godkjenninger og belønninger til barnets enhet.
          </li>
        </ul>
        <p>
          Vi <strong>samler ikke</strong> inn etternavn på barnet,
          fullstendig fødselsdato, e-postadresse, telefonnummer, bilder
          eller stemmedata, posisjon, eller andre særlige kategorier av
          personopplysninger om barnet. Vi behandler heller ikke
          opplysninger om religion, etnisitet, helse, politisk
          oppfatning eller seksuell legning, og vi har ingen mekanismer
          i appen som ville samlet inn slike opplysninger fra forelder
          eller barn.
        </p>
        <p>
          Når det gjelder kjøp og fakturering, behandles
          betalingsopplysningene (kortdata, faktureringsadresse mv.) av
          Apple eller Google som merchant of record. Kroni mottar kun en
          ordrebekreftelse uten kortinformasjon, samt et anonymisert
          kjøpsobjekt fra RevenueCat (produkt-id, kjøpstidspunkt,
          fornyelsestidspunkt, eventuell prøveperiode-status).
        </p>
        <p>Om <strong>bruken av Appen</strong> behandler vi:</p>
        <ul>
          <li>
            Oppgaver og oppgavemaler (titler, beløp, hyppighet,
            tildelinger).
          </li>
          <li>Fullføringer, godkjenninger og avslag.</li>
          <li>Belønninger og innløsninger.</li>
          <li>Saldoer av virtuelle kroner per barn.</li>
          <li>
            Tekniske loggdata (anonymiserte feilrapporter, ytelsesdata),
            som ikke deles med tredjeparter for markedsføringsformål.
          </li>
        </ul>
      </PolicySection>

      <PolicySection
        id="innsamling"
        number="03"
        title="Hvordan opplysningene samles inn"
      >
        <p>
          De fleste opplysningene får vi <strong>direkte fra forelderen</strong>{" "}
          ved registrering, ved oppretting av barneprofiler og ved bruk
          av appens funksjoner. Barnets enhet pares til familien gjennom
          en sekssifret kode som forelderen oppgir, og barnet selv legger
          ikke inn personopplysninger ut over det forelderen har
          forhåndsutfylt.
        </p>
        <p>
          Tekniske data — IP-adresse, enhetsmodell, operativsystem,
          appversjon, tidsstempler og lignende — samles automatisk når
          appen kontakter våre serverendepunkter, og er nødvendig for at
          tjenesten skal fungere og for å oppdage misbruk.
        </p>
        <p>
          Abonnementsinformasjon mottar vi fra Apple App Store og Google
          Play, formidlet via vår abonnementsplattform RevenueCat.
        </p>
      </PolicySection>

      <PolicySection
        id="grunnlag"
        number="04"
        title="Behandlingsgrunnlag"
      >
        <p>
          Vi behandler personopplysninger på følgende rettslige
          grunnlag etter GDPR artikkel 6:
        </p>
        <ul>
          <li>
            <strong>Avtale (artikkel 6 nr. 1 bokstav b):</strong>{" "}
            Behandling som er nødvendig for å oppfylle avtalen med
            forelderen — typisk å levere selve familieappen, opprette og
            vedlikeholde kontoen, gjennomføre kjøp og fornying av
            abonnement.
          </li>
          <li>
            <strong>Samtykke (artikkel 6 nr. 1 bokstav a):</strong>{" "}
            Push-varsler og eventuelle valgfrie funksjoner som krever
            ditt aktive samtykke. Samtykke kan trekkes tilbake når som
            helst.
          </li>
          <li>
            <strong>Berettiget interesse (artikkel 6 nr. 1 bokstav f):</strong>{" "}
            Sikring av tjenesten mot misbruk, feilsøking, statistikk på
            aggregert nivå, og forsvar mot rettskrav. Vi har vurdert at
            disse interessene veier tyngre enn personverninngrepet, blant
            annet fordi datamengden er liten og barn ikke deltar i denne
            behandlingen utover det som er nødvendig for sikkerhet.
          </li>
          <li>
            <strong>Rettslig forpliktelse (artikkel 6 nr. 1 bokstav c):</strong>{" "}
            Når vi må oppbevare bilag og regnskapsdata etter
            bokføringsloven, eller når vi må reagere på pålegg fra
            offentlige myndigheter.
          </li>
        </ul>
        <p>
          For barn som er under 13 år benytter vi forelderens samtykke
          etter <strong>GDPR artikkel 8</strong>, slik denne er
          gjennomført i norsk personopplysningslov § 5. Forelderen
          bekrefter dette samtykket når barneprofilen opprettes.
        </p>
      </PolicySection>

      <PolicySection id="formal" number="05" title="Formålene med behandlingen">
        <p>Vi behandler personopplysninger for å:</p>
        <ul>
          <li>
            opprette, drifte og vedlikeholde forelderkontoer og tilknyttede
            barneprofiler;
          </li>
          <li>
            la barnet markere oppgaver som utført, og la forelderen
            godkjenne disse;
          </li>
          <li>
            føre saldo av virtuelle kroner og vise denne i barnets app;
          </li>
          <li>
            sende relevante push-varsler (ny oppgave tildelt, godkjenning,
            innløst belønning), forutsatt at samtykke til varsler er
            gitt;
          </li>
          <li>
            håndtere abonnement, prøveperiode og fornying via App Store og
            Google Play, samt holde abonnementsstatus oppdatert i appen;
          </li>
          <li>
            besvare henvendelser til kundeservice og personvernhenvendelser;
          </li>
          <li>
            oppdage og forebygge misbruk, kontoovertakelse og brudd på
            vilkårene;
          </li>
          <li>
            forbedre tjenesten basert på aggregert, anonymisert
            bruksstatistikk;
          </li>
          <li>
            etterkomme rettslige forpliktelser, herunder regnskapsplikt og
            pålegg fra myndigheter.
          </li>
        </ul>
        <p>
          Vi bruker <strong>ikke</strong> personopplysninger til
          adferdsstyrt markedsføring rettet mot barn, ikke til
          profilering med rettslige eller tilsvarende vesentlige
          virkninger, og ikke til salg av data til tredjeparter. Kroni
          har ingen reklame-SDK, ingen tracking-piksler, og ingen
          attribusjonsverktøy som identifiserer enkeltbarn på tvers av
          tjenester.
        </p>
        <p>
          Hvis vi i fremtiden ønsker å ta i bruk opplysningene til et
          formål som ikke er forenlig med formålene som er beskrevet her
          — for eksempel å bygge funksjoner basert på maskinlæring trent
          på familiens data — vil vi først innhente nytt og separat
          samtykke fra forelderen, og oppdatere denne erklæringen i god
          tid før endringen trer i kraft.
        </p>
      </PolicySection>

      <PolicySection id="lagringstid" number="06" title="Lagringstid">
        <p>
          Vi lagrer personopplysninger så lenge det er nødvendig for de
          formålene de er samlet inn for, og deretter ikke lenger enn
          loven tillater eller pålegger.
        </p>
        <ul>
          <li>
            <strong>Aktive kontoer:</strong> Opplysningene oppbevares så
            lenge avtalen løper og kontoen brukes aktivt.
          </li>
          <li>
            <strong>Fullførte og godkjente oppgaver:</strong> Slettes
            eller anonymiseres som hovedregel innen 90 dager fra
            godkjenning, slik at vi ikke bygger opp et
            historikkarkiv om barnets aktiviteter utover det familien selv
            kan bruke i løpende drift.
          </li>
          <li>
            <strong>Sletting av konto:</strong> Når forelderen sletter
            familiekontoen, slettes alle personopplysninger om
            forelderen og barna innen <strong>30 dager</strong>, med
            unntak av:
            <ul>
              <li>
                regnskaps- og fakturaunderlag som vi etter bokføringsloven
                må oppbevare i inntil fem år etter regnskapsårets slutt;
              </li>
              <li>
                opplysninger som er nødvendige for å fastsette, gjøre
                gjeldende eller forsvare et rettskrav (f.eks. dokumentasjon
                ved en pågående tvist).
              </li>
            </ul>
          </li>
          <li>
            <strong>Logger og sikkerhetsdata:</strong> Lagres typisk i 30
            til 180 dager, avhengig av loggens funksjon, før de slettes
            eller anonymiseres.
          </li>
          <li>
            <strong>Henvendelser til kundeservice:</strong> Lagres så
            lenge det er nødvendig for å avslutte saken, normalt opptil
            24 måneder.
          </li>
        </ul>
      </PolicySection>

      <PolicySection
        id="mottakere"
        number="07"
        title="Mottakere og databehandlere"
      >
        <p>
          Vi deler ikke personopplysninger med tredjeparter for deres
          egne formål. For å levere tjenesten benytter vi imidlertid
          enkelte underleverandører som behandler personopplysninger på
          våre vegne. Alle slike underleverandører er bundet av
          databehandleravtale (DPA) i samsvar med GDPR artikkel 28.
        </p>
        <ul>
          <li>
            <strong>Clerk, Inc.</strong> — autentisering og kontohåndtering
            for forelderen.
          </li>
          <li>
            <strong>RevenueCat, Inc.</strong> — håndtering av
            abonnementstatus og synkronisering av kjøp på tvers av Apple
            og Google.
          </li>
          <li>
            <strong>Apple Distribution International Ltd.</strong> (App
            Store) og <strong>Google Commerce Limited</strong> (Google
            Play) — distribusjon av appen og gjennomføring av betalinger
            som merchant of record.
          </li>
          <li>
            <strong>Expo (Expo Application Services)</strong> — formidling
            av push-varsler til forelders og barns enheter.
          </li>
          <li>
            <strong>Hostingleverandør</strong> — drift av Kronis
            applikasjonsservere og PostgreSQL-database. Servere er
            plassert i Norge eller EU.{" "}
            <em>[Konkret leverandør oppdateres når avtalen er signert.]</em>
          </li>
          <li>
            <strong>Cloudflare, Inc.</strong> — DDoS-beskyttelse og CDN
            for kroni.no, der det er aktivert.
          </li>
        </ul>
        <p>
          Personopplysninger kan i tillegg utleveres til offentlige
          myndigheter dersom vi er rettslig forpliktet til det, for
          eksempel ved pålegg fra politi, skattemyndigheter eller
          Datatilsynet. Slike utleveringer dokumenteres internt og
          gjøres aldri i større omfang enn det pålegget krever.
        </p>
        <p>
          En oppdatert oversikt over våre underleverandører kan til
          enhver tid fås ved å kontakte{" "}
          <a href="mailto:privacy@kroni.no">privacy@kroni.no</a>. Bytte
          av underleverandør innen samme kategori (for eksempel ny
          hostingleverandør) regnes ikke som en vesentlig endring av
          erklæringen, men formidles ved oppdatering av denne listen.
        </p>
      </PolicySection>

      <PolicySection
        id="tredjeland"
        number="08"
        title="Overføring til land utenfor EØS"
      >
        <p>
          Enkelte av våre databehandlere — særlig Clerk og RevenueCat — er
          etablert i USA og kan ha datastrømmer dit. Slik overføring
          skjer på grunnlag av <strong>EU-kommisjonens
          standardkontraktklausuler (SCC)</strong> i tråd med GDPR
          artikkel 46, supplert med tekniske og organisatoriske tiltak
          som kryptering i transitt og hvile, tilgangsstyring og
          gjennomsiktighet om underleverandører.
        </p>
        <p>
          Hostingleverandøren plasserer Kronis kjernedatabaser i Norge
          eller EU, slik at den løpende driften av familiens data skjer
          innenfor EØS. Den «sentrale» datamengden — oppgaver,
          fullføringer, virtuelle saldoer, barneprofiler — forlater
          dermed aldri EØS i normal drift.
        </p>
        <p>
          For overføringer som omfattes av EU-US Data Privacy Framework,
          benytter vi databehandlere som er sertifisert under
          rammeverket der det er tilgjengelig. En oversikt over
          gjeldende overføringsmekanismer per databehandler kan
          rekvireres ved henvendelse til{" "}
          <a href="mailto:privacy@kroni.no">privacy@kroni.no</a>.
        </p>
      </PolicySection>

      <PolicySection
        id="sikkerhet"
        number="09"
        title="Informasjonssikkerhet"
      >
        <p>
          Vi har gjennomført rimelige tekniske og organisatoriske tiltak
          for å beskytte personopplysningene mot uautorisert tilgang,
          tap, endring eller avsløring. Tiltakene inkluderer blant annet:
        </p>
        <ul>
          <li>
            TLS-kryptering på all trafikk mellom appen, nettstedet og
            våre servere.
          </li>
          <li>
            Hashing av sensitive felt — barnets PIN er lagret som
            bcrypt-hash, aldri i klartekst.
          </li>
          <li>
            Tilgangskontroll og prinsippet om <em>need-to-know</em> internt:
            kun de få personene som drifter Kroni har produksjonstilgang.
          </li>
          <li>
            Logging og overvåkning av sikkerhetsrelevante hendelser, samt
            regelmessige sikkerhetsoppdateringer på OS, database og
            applikasjon.
          </li>
          <li>
            Regelmessig sikkerhetskopiering av databasen, og rutiner for
            gjenoppretting.
          </li>
          <li>
            Bevisst fravær av betalingskortdata: Kroni er ikke merchant of
            record, og vi behandler aldri kortnumre, CVC-koder eller
            BankID-data. Det reduserer angrepsflaten betydelig.
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="rettigheter" number="10" title="Dine rettigheter">
        <p>
          Som registrert har du etter GDPR følgende rettigheter, som du
          kan utøve overfor oss:
        </p>
        <ul>
          <li>
            <strong>Innsyn (artikkel 15):</strong> Få vite hvilke
            opplysninger vi har om deg eller barnet ditt, og motta en
            kopi.
          </li>
          <li>
            <strong>Retting (artikkel 16):</strong> Få korrigert uriktige
            eller ufullstendige opplysninger.
          </li>
          <li>
            <strong>Sletting (artikkel 17):</strong> Be om at vi sletter
            personopplysninger, så fremt vi ikke er rettslig forpliktet
            til å beholde dem.
          </li>
          <li>
            <strong>Begrensning (artikkel 18):</strong> Be om at vi midlertidig
            stanser bruken av opplysningene mens en innsigelse vurderes.
          </li>
          <li>
            <strong>Dataportabilitet (artikkel 20):</strong> Motta dine
            opplysninger i et strukturert, maskinlesbart format, eller få
            dem overført til en annen behandlingsansvarlig der det er
            teknisk mulig.
          </li>
          <li>
            <strong>Innsigelse (artikkel 21):</strong> Protestere mot
            behandling som er basert på berettiget interesse.
          </li>
          <li>
            <strong>Tilbaketrekk av samtykke (artikkel 7 nr. 3):</strong>{" "}
            Trekke tilbake samtykke til push-varsler eller andre
            samtykkebaserte behandlinger, uten at det påvirker lovligheten
            av behandlingen forut for tilbaketrekkingen.
          </li>
        </ul>
        <p>
          For å utøve rettighetene, send en e-post til{" "}
          <a href="mailto:privacy@kroni.no">privacy@kroni.no</a>. Vi
          besvarer henvendelser uten ugrunnet opphold, og senest{" "}
          <strong>innen 30 dager</strong> fra mottak. Ved særlig
          komplekse henvendelser kan fristen forlenges med inntil to
          måneder; i så fall varsles du om forlengelsen og om grunnen
          til den.
        </p>
        <p>
          Vi kan be om identifikasjon før vi besvarer en henvendelse, for
          å sikre at vi ikke utleverer personopplysninger til feil
          person. Hvis henvendelsen gjelder et barn, er det forelderen
          eller foresatte som utøver rettighetene på vegne av barnet,
          så lenge barnet er under 13 år. For barn over 13 år
          balanserer vi rettighetsutøvelsen mellom forelderens
          foreldreansvar og barnets gradvis økende selvbestemmelsesrett.
        </p>
        <p>
          Utøvelse av rettighetene er gratis. Ved åpenbart grunnløse
          eller overdrevne forespørsler — særlig dersom de gjentas — kan
          vi i unntakstilfeller kreve et rimelig gebyr eller avslå
          henvendelsen, jf. GDPR artikkel 12 nr. 5. Vi vil i så fall
          alltid begrunne avslaget skriftlig.
        </p>
      </PolicySection>

      <PolicySection
        id="klage"
        number="11"
        title="Klage til Datatilsynet"
      >
        <p>
          Hvis du mener at vi behandler personopplysningene dine i strid
          med personvernregelverket, har du rett til å klage til
          Datatilsynet:
        </p>
        <p>
          <strong>Datatilsynet</strong>
          <br />
          Postboks 458 Sentrum, 0105 Oslo
          <br />
          Telefon: 22 39 69 00
          <br />
          Nettsted:{" "}
          <a
            href="https://www.datatilsynet.no"
            target="_blank"
            rel="noopener noreferrer"
          >
            datatilsynet.no
          </a>
        </p>
        <p>
          Vi setter likevel pris på om du tar kontakt med oss først, slik
          at vi får anledning til å rette opp eventuelle feil eller
          misforståelser.
        </p>
      </PolicySection>

      <PolicySection id="barn" number="12" title="Barn og foreldreansvar">
        <p>
          Aldersgrensen for digitalt samtykke etter GDPR artikkel 8 er i
          Norge satt til 13 år. Det betyr at barn under 13 år kun kan
          bruke Kroni gjennom en barneprofil opprettet av en forelder
          eller foresatt med foreldreansvar, og at forelderen samtykker
          til behandlingen av barnets personopplysninger på vegne av
          barnet.
        </p>
        <p>
          For barn som er <strong>13 år eller eldre</strong> kan lokal
          praksis tilsi at barnet selv kan samtykke til enkelte digitale
          tjenester. Forelderen har ansvar for å vurdere barnets modenhet
          og innhente barnets eget samtykke der det er relevant. Kroni er
          uansett bygget slik at all administrasjon og kontoinnehav
          ligger hos forelderen.
        </p>
        <p>
          Forelderen plikter å forklare bruken av Kroni for barnet på en
          alderstilpasset måte, og å påse at barnets bruk skjer trygt.
          Dette omfatter blant annet å avtale med barnet hvilke
          belønninger som er passende, og å sørge for at barnets PIN-kode
          ikke deles med andre.
        </p>
      </PolicySection>

      <PolicySection
        id="cookies"
        number="13"
        title="Informasjonskapsler og sporing"
      >
        <p>
          <strong>I mobilappen:</strong> Vi bruker ingen reklamesporing,
          ingen tredjeparts analyseverktøy med personhenførbare
          identifikatorer, og ingen <em>fingerprinting</em> av barnets
          enhet. Ekt sti-loggdata (krasjrapporter, ytelsesdata) er
          aggregert og benyttes utelukkende til feilsøking.
        </p>
        <p>
          <strong>På kroni.no:</strong> Vi bruker kun teknisk nødvendige
          informasjonskapsler — typisk en sesjonsinformasjonskapsel og
          eventuelle preferanseinnstillinger. Dersom vi en gang i
          fremtiden tar i bruk analyseverktøy som forutsetter samtykke,
          vil dette presenteres gjennom en eksplisitt
          informasjonskapsel-banner som du aktivt kan godta eller avslå.
        </p>
      </PolicySection>

      <PolicySection
        id="brudd"
        number="14"
        title="Brudd på personopplysningssikkerheten"
      >
        <p>
          Dersom det skjer et brudd på personopplysningssikkerheten,
          melder vi dette til Datatilsynet uten ugrunnet opphold og
          senest innen <strong>72 timer</strong> etter at vi har blitt
          kjent med bruddet, jf. GDPR artikkel 33. Dersom bruddet
          sannsynligvis vil medføre en høy risiko for de berørtes
          rettigheter og friheter, vil vi i tillegg varsle deg som
          bruker direkte, jf. GDPR artikkel 34.
        </p>
        <p>
          Vi fører internt avviksregister over alle brudd, uavhengig av
          alvorlighet, slik at vi kan lære av hendelsene og forbedre
          rutinene våre.
        </p>
      </PolicySection>

      <PolicySection id="endringer" number="15" title="Endringer i erklæringen">
        <p>
          Vi kan endre denne personvernerklæringen for å reflektere
          endringer i tjenesten, lovgivningen eller hvordan vi behandler
          opplysningene. Vesentlige endringer som påvirker dine
          rettigheter, varsles minst <strong>30 dager før</strong> de
          trer i kraft, via e-post eller varsel i appen. Datoen øverst
          på siden viser når erklæringen sist ble oppdatert.
        </p>
      </PolicySection>

      <PolicySection
        id="kontakt"
        number="16"
        title="Kontakt og personvernombud"
      >
        <p>
          For alle spørsmål om personvern, og for å utøve dine
          rettigheter etter GDPR, kontakt:
        </p>
        <p>
          <strong>Nilsen Konsult — Personvern</strong>
          <br />
          E-post:{" "}
          <a href="mailto:privacy@kroni.no">privacy@kroni.no</a>
          <br />
          Generell support:{" "}
          <a href="mailto:support@kroni.no">support@kroni.no</a>
          <br />
          Nettsted:{" "}
          <a href="https://kroni.no" target="_blank" rel="noopener noreferrer">
            kroni.no
          </a>
        </p>
        <p className="text-[13px] text-sand-500">
          [Postadresse oppdateres ved registrering]
        </p>
        <p>
          Du finner vilkårene for bruk av tjenesten under{" "}
          <Link href="/vilkar">Vilkår for bruk</Link>.
        </p>
        <p className="mt-8 text-[13px] italic text-sand-500">
          Denne personvernerklæringen oppdateres når Nilsen Konsult
          vurderer det nødvendig.
        </p>
      </PolicySection>
    </PolicyShell>
  );
}
