import type { LegalContent } from "../types";

export const personvernNb: LegalContent = {
  eyebrow: "Personvern",
  title: "Personvernerklæring",
  intro:
    "Kroni er laget for familier — og personvern er ikke noe vi har lagt på etterpå. Denne erklæringen forklarer hvilke opplysninger vi behandler, hvorfor, hvor lenge, og hvilke rettigheter du har.",
  updated: "29. april 2026",
  sections: [
    {
      id: "innledning",
      number: "01",
      title: "Innledning og behandlingsansvarlig",
      body: (
        <>
          <p>
            <strong>Nilsen Konsult</strong> (org.nr. 931 405 861 MVA, Norge) er behandlingsansvarlig for personopplysningene som behandles gjennom Kroni-appen og nettstedet kroni.no. Det betyr at vi bestemmer formålene med, og midlene for, behandlingen, og at vi har ansvaret for at behandlingen skjer i samsvar med personopplysningsloven og personvernforordningen (GDPR).
          </p>
          <p>
            Kroni er en familieapp hvor en forelder oppretter oppgaver, ukepenger og belønninger for sine barn. For at appen skal kunne fungere, må vi behandle et minimum av personopplysninger om både forelderen og barnet. Vi har gjennomgående valgt løsninger som samler så lite som mulig — for eksempel ber vi aldri om barnets etternavn, e-postadresse eller bilde, og det går aldri ekte penger gjennom systemet. Personvern er bygget inn i tjenesten, ikke lagt på som et vedlegg.
          </p>
          <p>
            Hvis du har spørsmål om personvern, eller ønsker å utøve dine rettigheter etter GDPR, kan du nå oss på <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "opplysninger",
      number: "02",
      title: "Hvilke personopplysninger vi behandler",
      body: (
        <>
          <p>Om <strong>forelderen</strong> behandler vi:</p>
          <ul>
            <li>E-postadresse (brukes som innlogging via vår autentiseringspartner Clerk).</li>
            <li>Eventuelt navn på Apple ID dersom du velger «Logg på med Apple».</li>
            <li>Valgfritt visningsnavn som vises i familien (kan være kun fornavn eller et kallenavn).</li>
            <li>Abonnementstatus (gratis, prøveperiode, månedlig, årlig, livstid, avsluttet) og en RevenueCat-app-bruker-ID som er knyttet til din Clerk-bruker-ID.</li>
            <li>IP-adresse og enhets-/nettleserinformasjon ved innlogging og ved kontakt med våre serverendepunkter, brukt til sikkerhet og feilsøking.</li>
            <li>Tidsstempler for hendelser i appen (oppretting av oppgaver, godkjenninger, innlogginger).</li>
            <li>Valgfri språkpreferanse.</li>
          </ul>
          <p>Om <strong>barnet</strong> behandler vi:</p>
          <ul>
            <li>Fornavn (typisk slik forelderen kaller barnet i hverdagen — et kallenavn er like greit).</li>
            <li>Eventuelt fødselsår — kun året, aldri dag eller måned. Dette er valgfritt og brukes til alderstilpasning av appen.</li>
            <li>Eventuelt en firesifret PIN, lagret som hash (bcrypt). Vi lagrer aldri PIN-en i klartekst.</li>
            <li>En valgt avatarnøkkel som peker til ett av appens forhåndsdefinerte ikoner. Vi lagrer ikke bilder lastet opp av bruker.</li>
            <li>Enhets-ID og push-token for å sende varsler om nye oppgaver, godkjenninger og belønninger til barnets enhet.</li>
          </ul>
          <p>
            Vi <strong>samler ikke</strong> inn etternavn på barnet, fullstendig fødselsdato, e-postadresse, telefonnummer, bilder eller stemmedata, posisjon, eller andre særlige kategorier av personopplysninger om barnet.
          </p>
          <p>
            Når det gjelder kjøp og fakturering, behandles betalingsopplysningene (kortdata, faktureringsadresse mv.) av Apple eller Google som merchant of record. Kroni mottar kun en ordrebekreftelse uten kortinformasjon, samt et anonymisert kjøpsobjekt fra RevenueCat (produkt-id, kjøpstidspunkt, fornyelsestidspunkt, eventuell prøveperiode-status).
          </p>
          <p>Om <strong>bruken av Appen</strong> behandler vi:</p>
          <ul>
            <li>Oppgaver og oppgavemaler (titler, beløp, hyppighet, tildelinger).</li>
            <li>Fullføringer, godkjenninger og avslag.</li>
            <li>Belønninger og innløsninger.</li>
            <li>Saldoer av virtuelle kroner per barn.</li>
            <li>
              Tekniske loggdata fra <strong>Sentry</strong> — krasjrapporter med stack-trace, brødsmuler (breadcrumbs) av nylige hendelser i appen, ytelses-/distribuerte traces, samt enhets-, OS- og appversjon. Hendelsene tagges med forelderens Clerk-bruker-ID og e-postadresse, og barneprofilens interne ID hvis feilen oppstår på barnets side. Sentry driftes som en <strong>selvhostet instans</strong> på samme infrastruktur som resten av tjenesten; loggene forlater ikke vår infrastruktur og deles ikke med tredjeparter, særlig ikke for markedsføringsformål. Andelen ytelses-traces er begrenset (10–20 % i produksjon).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "innsamling",
      number: "03",
      title: "Hvordan opplysningene samles inn",
      body: (
        <>
          <p>
            De fleste opplysningene får vi <strong>direkte fra forelderen</strong> ved registrering, ved oppretting av barneprofiler og ved bruk av appens funksjoner. Barnets enhet pares til familien gjennom en sekssifret kode som forelderen oppgir, og barnet selv legger ikke inn personopplysninger ut over det forelderen har forhåndsutfylt.
          </p>
          <p>
            Tekniske data — IP-adresse, enhetsmodell, operativsystem, appversjon, tidsstempler og lignende — samles automatisk når appen kontakter våre serverendepunkter, og er nødvendig for at tjenesten skal fungere og for å oppdage misbruk.
          </p>
          <p>
            Abonnementsinformasjon mottar vi fra Apple App Store og Google Play, formidlet via vår abonnementsplattform RevenueCat.
          </p>
        </>
      ),
    },
    {
      id: "grunnlag",
      number: "04",
      title: "Behandlingsgrunnlag",
      body: (
        <>
          <p>Vi behandler personopplysninger på følgende rettslige grunnlag etter GDPR artikkel 6:</p>
          <ul>
            <li><strong>Avtale (artikkel 6 nr. 1 bokstav b):</strong> Behandling som er nødvendig for å oppfylle avtalen med forelderen — typisk å levere selve familieappen, opprette og vedlikeholde kontoen, gjennomføre kjøp og fornying av abonnement.</li>
            <li><strong>Samtykke (artikkel 6 nr. 1 bokstav a):</strong> Push-varsler og eventuelle valgfrie funksjoner som krever ditt aktive samtykke. Samtykke kan trekkes tilbake når som helst.</li>
            <li><strong>Berettiget interesse (artikkel 6 nr. 1 bokstav f):</strong> Sikring av tjenesten mot misbruk, feilsøking, statistikk på aggregert nivå, og forsvar mot rettskrav.</li>
            <li><strong>Rettslig forpliktelse (artikkel 6 nr. 1 bokstav c):</strong> Når vi må oppbevare bilag og regnskapsdata etter bokføringsloven, eller når vi må reagere på pålegg fra offentlige myndigheter.</li>
          </ul>
          <p>
            For barn som er under 13 år benytter vi forelderens samtykke etter <strong>GDPR artikkel 8</strong>, slik denne er gjennomført i norsk personopplysningslov § 5.
          </p>
        </>
      ),
    },
    {
      id: "formal",
      number: "05",
      title: "Formålene med behandlingen",
      body: (
        <>
          <p>Vi behandler personopplysninger for å:</p>
          <ul>
            <li>opprette, drifte og vedlikeholde forelderkontoer og tilknyttede barneprofiler;</li>
            <li>la barnet markere oppgaver som utført, og la forelderen godkjenne disse;</li>
            <li>føre saldo av virtuelle kroner og vise denne i barnets app;</li>
            <li>sende relevante push-varsler, forutsatt at samtykke er gitt;</li>
            <li>håndtere abonnement, prøveperiode og fornying via App Store og Google Play;</li>
            <li>besvare henvendelser til kundeservice og personvernhenvendelser;</li>
            <li>oppdage og forebygge misbruk, kontoovertakelse og brudd på vilkårene;</li>
            <li>forbedre tjenesten basert på aggregert, anonymisert bruksstatistikk;</li>
            <li>etterkomme rettslige forpliktelser, herunder regnskapsplikt og pålegg fra myndigheter.</li>
          </ul>
          <p>
            Vi bruker <strong>ikke</strong> personopplysninger til adferdsstyrt markedsføring rettet mot barn, ikke til profilering med rettslige eller tilsvarende vesentlige virkninger, og ikke til salg av data til tredjeparter.
          </p>
        </>
      ),
    },
    {
      id: "lagringstid",
      number: "06",
      title: "Lagringstid",
      body: (
        <>
          <p>Vi lagrer personopplysninger så lenge det er nødvendig for de formålene de er samlet inn for, og deretter ikke lenger enn loven tillater eller pålegger.</p>
          <ul>
            <li><strong>Aktive kontoer:</strong> Opplysningene oppbevares så lenge avtalen løper og kontoen brukes aktivt.</li>
            <li><strong>Fullførte og godkjente oppgaver:</strong> Slettes eller anonymiseres som hovedregel innen 90 dager fra godkjenning.</li>
            <li><strong>Sletting av konto:</strong> Når forelderen sletter familiekontoen, slettes alle personopplysninger om forelderen og barna innen <strong>30 dager</strong>, med unntak av regnskapsbilag (5 år) og rettskravsbevis.</li>
            <li><strong>Logger og sikkerhetsdata:</strong> Lagres typisk i 30 til 180 dager.</li>
            <li><strong>Henvendelser til kundeservice:</strong> Lagres normalt opptil 24 måneder.</li>
          </ul>
        </>
      ),
    },
    {
      id: "mottakere",
      number: "07",
      title: "Mottakere og databehandlere",
      body: (
        <>
          <p>
            Vi deler ikke personopplysninger med tredjeparter for deres egne formål. Vi har som <strong>uttrykt prinsipp</strong> å dele så lite data som overhodet mulig — vi minimerer både mengden, kategoriene og antall mottakere. Noe deling er likevel teknisk uunngåelig for at appen skal fungere (innlogging, fakturering, distribusjon), og denne delingen skjer da utelukkende med databehandlere bundet av databehandleravtale (DPA) etter GDPR artikkel 28, eller — for Apple og Google — som selvstendig behandlingsansvarlige for merchant-of-record-leddet.
          </p>
          <ul>
            <li><strong>Hetzner Online GmbH</strong> — drift av Kronis applikasjonsservere og PostgreSQL-databaser. Maskinene er plassert i Hetzners datasenter i <strong>Finland</strong>, innenfor EU/EØS, og hele kjernedatamengden (kontoer, barneprofiler, oppgaver, fullføringer, virtuelle saldoer, Sentry-logger) holdes der.</li>
            <li><strong>Clerk, Inc.</strong> — autentisering og kontohåndtering for forelderen. Behandler e-post, innloggingshendelser og eventuelt navn fra «Logg på med Apple». Clerk har egen personvernerklæring.</li>
            <li><strong>RevenueCat, Inc.</strong> — håndterer abonnementstilstand og synkronisering av kjøp/fornying på tvers av App Store og Google Play. Mottar et anonymisert app-bruker-ID og kjøpsmetadata; ingen kortinformasjon. RevenueCat har egen personvernerklæring.</li>
            <li><strong>Mailpace</strong> (Ohmysmtp Ltd., etablert i Storbritannia) — leverer våre transaksjonelle e-poster fra avsenderdomenet <code>kroni.no</code> (autentisert med SPF, DKIM og DMARC). Behandler e-postadressen din (hentet fra Clerk) og selve innholdet i meldingene vi sender deg. Formålet er utelukkende levering av kontonødvendige tjeneste-e-poster — bekreftelse ved registrering, tilbakestilling av passord, e-postverifisering, faktureringsvarsler (mislykket betaling, utløp av abonnement) og invitasjonslenker til familiehusholdning. Behandlingsgrunnlaget er <strong>avtale (GDPR art. 6 nr. 1 bokstav b)</strong> — vi kan ikke drifte kontoen uten å levere disse meldingene. Mailpace er underleverandør (sub-processor) under databehandleravtalen vi har med deg, og holder leveranselogger i henhold til sin publiserte oppbevaringsplan; selve e-postinnholdet lagres ikke langsiktig hos oss. Disse meldingene er nødvendige tjeneste-meldinger og kan <strong>ikke reserveres mot</strong> uten at kontoen slettes; eventuelle markedsførings-e-poster (vi sender ingen i dag) ville eventuelt kreve separat samtykke. Vi har valgt å sende egne, lokaliserte e-poster i tråd med Kronis visuelle identitet i stedet for å bruke Clerks standardmaler, som er deaktivert.</li>
            <li><strong>Apple Distribution International Ltd.</strong> (App Store) og <strong>Google Commerce Limited</strong> (Google Play) — distribusjon og betaling som merchant of record. Apples og Googles personvernvilkår gjelder for det de samler inn.</li>
            <li><strong>Expo (Expo Application Services)</strong> — formidling av push-varsler.</li>
            <li><strong>Cloudflare, Inc.</strong> — DDoS-beskyttelse og CDN for kroni.no.</li>
          </ul>
          <p>
            Personopplysninger kan utleveres til offentlige myndigheter dersom vi er rettslig forpliktet til det.
          </p>
          <p>
            En oppdatert oversikt fås ved å kontakte <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "tredjeland",
      number: "08",
      title: "Overføring til land utenfor EØS",
      body: (
        <>
          <p>
            Enkelte av våre databehandlere — særlig Clerk og RevenueCat — er etablert i USA og kan ha datastrømmer dit. Slik overføring skjer på grunnlag av <strong>EU-kommisjonens standardkontraktklausuler (SCC)</strong> i tråd med GDPR artikkel 46, supplert med tekniske og organisatoriske tiltak.
          </p>
          <p>
            Kronis kjernedatabaser og applikasjonsservere driftes hos <strong>Hetzner i Finland</strong>, slik at den løpende behandlingen skjer innenfor EU/EØS. Den «sentrale» datamengden — oppgaver, fullføringer, virtuelle saldoer, barneprofiler, samt Sentry-logger — forlater dermed aldri EØS i normal drift.
          </p>
        </>
      ),
    },
    {
      id: "sikkerhet",
      number: "09",
      title: "Informasjonssikkerhet",
      body: (
        <>
          <p>Vi har gjennomført rimelige tekniske og organisatoriske tiltak:</p>
          <ul>
            <li>TLS-kryptering på all trafikk.</li>
            <li>Hashing av sensitive felt — barnets PIN er bcrypt-hash.</li>
            <li>Tilgangskontroll og prinsippet om <em>need-to-know</em>.</li>
            <li>Logging og overvåkning via vår selvhostede Sentry-instans, samt regelmessige sikkerhetsoppdateringer.</li>
            <li>Regelmessig sikkerhetskopiering og rutiner for gjenoppretting.</li>
            <li>Vi behandler aldri kortnumre, CVC-koder eller BankID-data.</li>
          </ul>
        </>
      ),
    },
    {
      id: "rettigheter",
      number: "10",
      title: "Dine rettigheter",
      body: (
        <>
          <p>Som registrert har du etter GDPR følgende rettigheter:</p>
          <ul>
            <li><strong>Innsyn (art. 15):</strong> Få vite hvilke opplysninger vi har, og motta en kopi.</li>
            <li><strong>Retting (art. 16):</strong> Få korrigert uriktige eller ufullstendige opplysninger.</li>
            <li><strong>Sletting (art. 17):</strong> Be om at vi sletter personopplysninger.</li>
            <li><strong>Begrensning (art. 18):</strong> Be om at vi midlertidig stanser bruken.</li>
            <li><strong>Dataportabilitet (art. 20):</strong> Motta opplysninger i strukturert maskinlesbart format.</li>
            <li><strong>Innsigelse (art. 21):</strong> Protestere mot behandling basert på berettiget interesse.</li>
            <li><strong>Tilbaketrekk av samtykke (art. 7 nr. 3):</strong> Trekke tilbake samtykke.</li>
          </ul>
          <p>
            Send e-post til <a href="mailto:support@kroni.no">support@kroni.no</a>. Vi besvarer innen <strong>30 dager</strong>.
          </p>
        </>
      ),
    },
    {
      id: "klage",
      number: "11",
      title: "Klage til Datatilsynet",
      body: (
        <>
          <p>Hvis du mener vi behandler personopplysningene dine i strid med regelverket, har du rett til å klage til Datatilsynet:</p>
          <p>
            <strong>Datatilsynet</strong><br />
            Postboks 458 Sentrum, 0105 Oslo<br />
            Telefon: 22 39 69 00<br />
            Nettsted: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer">datatilsynet.no</a>
          </p>
          <p>Vi setter likevel pris på om du tar kontakt med oss først.</p>
        </>
      ),
    },
    {
      id: "barn",
      number: "12",
      title: "Barn og foreldreansvar",
      body: (
        <>
          <p>
            Aldersgrensen for digitalt samtykke etter GDPR artikkel 8 er i Norge satt til 13 år. Barn under 13 år kan kun bruke Kroni gjennom en barneprofil opprettet av en forelder eller foresatt, og forelderen samtykker på vegne av barnet.
          </p>
          <p>
            For barn som er <strong>13 år eller eldre</strong> kan forelderen vurdere barnets eget samtykke. Kroni er uansett bygget slik at all administrasjon ligger hos forelderen.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      number: "13",
      title: "Informasjonskapsler og sporing",
      body: (
        <>
          <p>
            <strong>I mobilappen:</strong> Vi bruker ingen reklamesporing, ingen tredjeparts analyseverktøy med personhenførbare identifikatorer, og ingen <em>fingerprinting</em>. For feilsøking sender appen krasjrapporter og en begrenset andel ytelses-traces til vår selvhostede Sentry-instans, jf. punkt 02 og 09. Disse loggene benyttes utelukkende til feilsøking, og deles ikke videre.
          </p>
          <p>
            <strong>På kroni.no:</strong> Vi bruker kun teknisk nødvendige informasjonskapsler.
          </p>
        </>
      ),
    },
    {
      id: "brudd",
      number: "14",
      title: "Brudd på personopplysningssikkerheten",
      body: (
        <>
          <p>
            Dersom det skjer et brudd, melder vi til Datatilsynet innen <strong>72 timer</strong>, jf. GDPR art. 33. Hvis bruddet sannsynligvis vil medføre høy risiko for de berørte, varsler vi deg direkte, jf. GDPR art. 34.
          </p>
        </>
      ),
    },
    {
      id: "endringer",
      number: "15",
      title: "Endringer i erklæringen",
      body: (
        <>
          <p>
            Vi kan endre erklæringen for å reflektere endringer i tjenesten eller lovgivningen. Vesentlige endringer varsles minst <strong>30 dager før</strong> de trer i kraft.
          </p>
        </>
      ),
    },
    {
      id: "kontakt",
      number: "16",
      title: "Kontakt og personvernombud",
      body: (
        <>
          <p>For spørsmål om personvern og rettighetsutøvelse:</p>
          <p>
            <strong>Nilsen Konsult</strong><br />
            E-post: <a href="mailto:support@kroni.no">support@kroni.no</a>
          </p>
        </>
      ),
    },
  ],
};
