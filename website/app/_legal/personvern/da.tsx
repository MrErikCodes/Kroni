import type { LegalContent } from "../types";

export const personvernDa: LegalContent = {
  eyebrow: "Privatliv",
  title: "Privatlivspolitik",
  intro:
    "Kroni er bygget til familier — og privatliv er ikke noget, vi har lagt på bagefter. Denne politik forklarer hvilke oplysninger vi behandler, hvorfor, hvor længe, og hvilke rettigheder du har.",
  updated: "29. april 2026",
  sections: [
    {
      id: "innledning",
      number: "01",
      title: "Indledning og dataansvarlig",
      body: (
        <>
          <p>
            <strong>Nilsen Konsult</strong> (norsk CVR/org.nr. 931 405 861 MVA) er dataansvarlig for de personoplysninger, der behandles via Kroni-appen og hjemmesiden kroni.no. Det betyder at vi bestemmer formålene og midlerne for behandlingen og er ansvarlige for at den sker i overensstemmelse med persondataloven og GDPR.
          </p>
          <p>
            Kroni er en familieapp, hvor en forælder opretter opgaver, lommepenge og belønninger til sine børn. For at appen kan fungere, må vi behandle et minimum af personoplysninger om både forælder og barn. Vi har gennemgående valgt løsninger der indsamler så lidt som muligt — vi spørger aldrig om barnets efternavn, e-mailadresse eller billede, og der flyder aldrig rigtige penge gennem systemet. Privatliv er bygget ind, ikke klistret på.
          </p>
          <p>
            For privatlivsspørgsmål eller for at udøve dine GDPR-rettigheder kan du nå os på <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "opplysninger",
      number: "02",
      title: "Hvilke personoplysninger vi behandler",
      body: (
        <>
          <p>Om <strong>forælderen</strong> behandler vi:</p>
          <ul>
            <li>E-mailadresse (bruges som login via vores autentifikationspartner Clerk).</li>
            <li>Navn fra Apple ID hvis du vælger «Log ind med Apple».</li>
            <li>Valgfrit visningsnavn der vises i familien (fornavn eller kælenavn).</li>
            <li>Abonnementstatus (gratis, prøveperiode, månedlig, årlig, livstid, afsluttet) og et RevenueCat-app-bruger-ID koblet til dit Clerk-bruger-ID.</li>
            <li>IP-adresse og enheds-/browser-info ved login og kald til vores serverendepunkter, brugt til sikkerhed og fejlfinding.</li>
            <li>Tidsstempler for hændelser i appen (oprettelse af opgaver, godkendelser, logins).</li>
            <li>Valgfri sprogpræference.</li>
          </ul>
          <p>Om <strong>barnet</strong> behandler vi:</p>
          <ul>
            <li>Fornavn (typisk det forælderen kalder barnet til daglig — et kælenavn er fint).</li>
            <li>Eventuelt fødselsår — kun året, aldrig dag eller måned. Frivilligt, bruges til alderstilpasning.</li>
            <li>Eventuel firecifret PIN, gemt som hash (bcrypt). Aldrig i klartekst.</li>
            <li>En valgt avatar-nøgle der peger på en af appens foruddefinerede ikoner. Vi gemmer ingen uploadede billeder.</li>
            <li>Enheds-ID og push-token til at sende notifikationer om nye opgaver, godkendelser og belønninger.</li>
          </ul>
          <p>
            Vi <strong>indsamler ikke</strong> efternavn på barnet, fuld fødselsdato, e-mail, telefonnummer, billeder eller stemmedata, lokation eller andre særlige kategorier af personoplysninger.
          </p>
          <p>
            For køb og fakturering håndteres betalingsoplysningerne (kortdata, faktureringsadresse mv.) af Apple eller Google som merchant of record. Kroni modtager kun en ordrebekræftelse uden kortinformation samt et anonymiseret købsobjekt fra RevenueCat (produkt-id, købstidspunkt, fornyelsestidspunkt, eventuel prøveperiode-status).
          </p>
          <p>Om <strong>brugen af appen</strong> behandler vi:</p>
          <ul>
            <li>Opgaver og opgaveskabeloner (titler, beløb, frekvens, tildelinger).</li>
            <li>Fuldførelser, godkendelser og afslag.</li>
            <li>Belønninger og indløsninger.</li>
            <li>Saldoer i virtuelle kroner per barn.</li>
            <li>
              Teknisk telemetri fra <strong>Sentry</strong> — crash-rapporter med stack-trace, brødkrummer (breadcrumbs) af nylige hændelser, ydelses- og distribuerede traces, samt enheds-, OS- og appversion. Hændelser tagges med forælderens Clerk-bruger-ID og e-mailadresse, og barnprofilens interne ID hvis fejlen opstår på barnets side. Sentry kører som en <strong>selvhostet instans</strong> på samme infrastruktur som resten af tjenesten; loggene forlader ikke vores infrastruktur og deles ikke med tredjeparter, særligt ikke til markedsføring. Andelen af ydelses-traces er begrænset (10–20% i produktion).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "innsamling",
      number: "03",
      title: "Hvordan oplysningerne indsamles",
      body: (
        <>
          <p>
            Det meste får vi <strong>direkte fra forælderen</strong> ved registrering, ved oprettelse af barneprofiler og under normal brug af appen. Barnets enhed parres til familien via en sekscifret kode forælderen indtaster; barnet indtaster ikke personoplysninger ud over det forælderen har udfyldt på forhånd.
          </p>
          <p>
            Tekniske data — IP-adresse, enhedsmodel, OS, appversion, tidsstempler og lignende — indsamles automatisk når appen kontakter vores serverendepunkter, og er nødvendige for at tjenesten fungerer og for at opdage misbrug.
          </p>
          <p>
            Abonnementsoplysninger får vi fra Apple App Store og Google Play, formidlet via vores abonnementsplatform RevenueCat.
          </p>
        </>
      ),
    },
    {
      id: "grunnlag",
      number: "04",
      title: "Behandlingsgrundlag",
      body: (
        <>
          <p>Vi behandler personoplysninger på følgende retsgrundlag efter GDPR artikel 6:</p>
          <ul>
            <li><strong>Aftale (artikel 6, stk. 1, litra b):</strong> Behandling der er nødvendig for at opfylde aftalen med forælderen — at levere familieappen, oprette og vedligeholde kontoen, gennemføre køb og fornyelser.</li>
            <li><strong>Samtykke (artikel 6, stk. 1, litra a):</strong> Push-notifikationer og andre valgfrie funktioner der kræver dit aktive samtykke. Samtykket kan trækkes tilbage til enhver tid.</li>
            <li><strong>Legitim interesse (artikel 6, stk. 1, litra f):</strong> Sikring af tjenesten mod misbrug, fejlfinding, aggregeret statistik, forsvar mod retskrav.</li>
            <li><strong>Retlig forpligtelse (artikel 6, stk. 1, litra c):</strong> Når vi skal opbevare bilag og regnskabsdata efter norsk bogføringslov, eller efterkomme pålæg fra myndigheder.</li>
          </ul>
          <p>
            For børn under 13 år bygger vi på forælderens samtykke efter <strong>GDPR artikel 8</strong>, som gennemført i norsk persondatalov § 5.
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
          <p>Vi behandler personoplysninger for at:</p>
          <ul>
            <li>oprette, drifte og vedligeholde forældrekonti og tilknyttede barneprofiler;</li>
            <li>lade barnet markere opgaver som klar, og lade forælderen godkende;</li>
            <li>føre saldoen af virtuelle kroner og vise den i barnets app;</li>
            <li>sende relevante push-notifikationer, hvis samtykke er givet;</li>
            <li>håndtere abonnement, prøveperiode og fornyelse via App Store og Google Play;</li>
            <li>besvare kundeservice- og privatlivshenvendelser;</li>
            <li>opdage og forebygge misbrug, kontoovertagelse og overtrædelse af vilkårene;</li>
            <li>forbedre tjenesten baseret på aggregeret, anonymiseret brugsstatistik;</li>
            <li>efterkomme retlige forpligtelser, herunder bogføring og myndighedspålæg.</li>
          </ul>
          <p>
            Vi bruger <strong>ikke</strong> personoplysninger til adfærdsstyret markedsføring rettet mod børn, profilering med retlige eller tilsvarende væsentlige virkninger eller salg af data til tredjepart.
          </p>
        </>
      ),
    },
    {
      id: "lagringstid",
      number: "06",
      title: "Opbevaringstid",
      body: (
        <>
          <p>Vi opbevarer personoplysninger så længe det er nødvendigt til de formål, de blev indsamlet til, og derefter ikke længere end loven tillader eller kræver.</p>
          <ul>
            <li><strong>Aktive konti:</strong> Oplysningerne opbevares så længe aftalen løber og kontoen er i aktiv brug.</li>
            <li><strong>Fuldførte og godkendte opgaver:</strong> Slettes eller anonymiseres som hovedregel inden for 90 dage efter godkendelse.</li>
            <li><strong>Sletning af konto:</strong> Når forælderen sletter familiekontoen, slettes alle personoplysninger inden for <strong>30 dage</strong>, undtaget regnskabsbilag (5 år) og bevismateriale ved retskrav.</li>
            <li><strong>Logge og sikkerhedsdata:</strong> Typisk 30 til 180 dage.</li>
            <li><strong>Kundeservicehenvendelser:</strong> Normalt op til 24 måneder.</li>
          </ul>
        </>
      ),
    },
    {
      id: "mottakere",
      number: "07",
      title: "Modtagere og databehandlere",
      body: (
        <>
          <p>
            Vi deler ikke personoplysninger med tredjeparter til deres egne formål. Vi har som <strong>udtrykt princip</strong> at dele så lidt data som muligt — vi minimerer mængde, kategorier og antal modtagere. Visse delinger er teknisk uundgåelige (login, fakturering, distribution), og hvor det sker, er det udelukkende med databehandlere bundet af databehandleraftale (DPA) efter GDPR artikel 28, eller — for Apple og Google — som selvstændige dataansvarlige for merchant-of-record-rollen.
          </p>
          <ul>
            <li><strong>Hetzner Online GmbH</strong> — drift af Kronis applikationsservere og PostgreSQL-databaser. Maskinerne ligger i Hetzners datacenter i <strong>Finland</strong>, inden for EU/EØS. Hele kernedatamængden (konti, barneprofiler, opgaver, fuldførelser, virtuelle saldoer, Sentry-logge) opbevares der.</li>
            <li><strong>Clerk, Inc.</strong> — autentifikation og kontostyring for forælderen. Behandler e-mail, login-hændelser og Apple ID-navn ved «Log ind med Apple». Clerk har egen privatlivspolitik.</li>
            <li><strong>RevenueCat, Inc.</strong> — håndterer abonnementstilstand og synkroniserer køb/fornyelser på tværs af App Store og Google Play. Modtager et anonymiseret app-bruger-ID og købsmetadata; ingen kortinformation. RevenueCat har egen privatlivspolitik.</li>
            <li><strong>Mailpace</strong> (Ohmysmtp Ltd., etableret i Storbritannien) — leverer vores transaktionelle e-mails fra afsenderdomænet <code>kroni.no</code> (autentificeret med SPF, DKIM og DMARC). Behandler din e-mailadresse (hentet fra Clerk) og selve indholdet i de beskeder vi sender dig. Formålet er udelukkende levering af kontonødvendige tjeneste-e-mails — registreringsbekræftelse, nulstilling af adgangskode, e-mailverifikation, faktureringsbeskeder (mislykket betaling, abonnementsudløb) og invitationslinks til familiehusstand. Behandlingsgrundlaget er <strong>aftale (GDPR art. 6, stk. 1, litra b)</strong> — vi kan ikke drifte kontoen uden at levere disse beskeder. Mailpace er underdatabehandler (sub-processor) under den databehandleraftale vi har med dig og opbevarer leveringslogge i henhold til sin offentliggjorte opbevaringsplan; selve e-mailindholdet opbevarer vi ikke langsigtet. Disse beskeder er nødvendige tjenestebeskeder og kan <strong>ikke fravælges</strong> uden at kontoen slettes; eventuelle markedsførings-e-mails (vi sender ingen i dag) ville kræve særskilt samtykke. Vi har valgt at sende vores egne, lokaliserede e-mails i Kronis visuelle identitet i stedet for Clerks standardskabeloner, der er deaktiveret.</li>
            <li><strong>Apple Distribution International Ltd.</strong> (App Store) og <strong>Google Commerce Limited</strong> (Google Play) — distribution og betaling som merchant of record. Apples og Googles privatlivsvilkår styrer det de selv indsamler.</li>
            <li><strong>Expo (Expo Application Services)</strong> — levering af push-notifikationer.</li>
            <li><strong>Cloudflare, Inc.</strong> — DDoS-beskyttelse og CDN for kroni.no.</li>
          </ul>
          <p>Personoplysninger kan udleveres til offentlige myndigheder hvor vi er retligt forpligtet til det.</p>
          <p>
            En opdateret oversigt fås ved at kontakte <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "tredjeland",
      number: "08",
      title: "Overførsel uden for EØS",
      body: (
        <>
          <p>
            Nogle af vores databehandlere — særligt Clerk og RevenueCat — er etableret i USA og kan have datastrømme dertil. Sådan overførsel sker på grundlag af <strong>EU-Kommissionens standardkontraktbestemmelser (SCC)</strong> efter GDPR artikel 46, suppleret med tekniske og organisatoriske foranstaltninger.
          </p>
          <p>
            Kronis kernedatabaser og applikationsservere drives hos <strong>Hetzner i Finland</strong>, så den løbende behandling sker inden for EU/EØS. Den «centrale» datamængde — opgaver, fuldførelser, virtuelle saldoer, barneprofiler og Sentry-logge — forlader således aldrig EØS i normal drift.
          </p>
        </>
      ),
    },
    {
      id: "sikkerhet",
      number: "09",
      title: "Informationssikkerhed",
      body: (
        <>
          <p>Vi har gennemført rimelige tekniske og organisatoriske foranstaltninger:</p>
          <ul>
            <li>TLS-kryptering på al trafik.</li>
            <li>Hashning af følsomme felter — barnets PIN er bcrypt-hash.</li>
            <li>Adgangskontrol efter <em>need-to-know</em>-princippet.</li>
            <li>Logning og overvågning via vores selvhostede Sentry-instans, samt regelmæssige sikkerhedsopdateringer.</li>
            <li>Regelmæssig backup og genoprettelsesrutiner.</li>
            <li>Vi behandler aldrig kortnumre, CVC-koder eller MitID/BankID-data.</li>
          </ul>
        </>
      ),
    },
    {
      id: "rettigheter",
      number: "10",
      title: "Dine rettigheder",
      body: (
        <>
          <p>Som registreret har du følgende rettigheder efter GDPR:</p>
          <ul>
            <li><strong>Indsigt (art. 15):</strong> Få at vide hvilke oplysninger vi har og modtage en kopi.</li>
            <li><strong>Berigtigelse (art. 16):</strong> Få urigtige eller ufuldstændige oplysninger rettet.</li>
            <li><strong>Sletning (art. 17):</strong> Bede om sletning af personoplysninger.</li>
            <li><strong>Begrænsning (art. 18):</strong> Bede om at vi midlertidigt standser brugen.</li>
            <li><strong>Dataportabilitet (art. 20):</strong> Modtage dine oplysninger i et struktureret, maskinlæsbart format.</li>
            <li><strong>Indsigelse (art. 21):</strong> Indsige mod behandling baseret på legitim interesse.</li>
            <li><strong>Tilbagetrækning af samtykke (art. 7, stk. 3):</strong> Trække samtykke tilbage til enhver tid.</li>
          </ul>
          <p>
            Skriv til <a href="mailto:support@kroni.no">support@kroni.no</a>. Vi svarer inden for <strong>30 dage</strong>.
          </p>
        </>
      ),
    },
    {
      id: "klage",
      number: "11",
      title: "Klage til tilsynsmyndighed",
      body: (
        <>
          <p>Mener du at vi behandler dine personoplysninger i strid med reglerne, har du ret til at klage. For Kroni er norske Datatilsynet primær tilsynsmyndighed:</p>
          <p>
            <strong>Datatilsynet</strong><br />
            Postboks 458 Sentrum, 0105 Oslo, Norge<br />
            Telefon: +47 22 39 69 00<br />
            Web: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer">datatilsynet.no</a>
          </p>
          <p>Som dansk borger kan du også henvende dig til Datatilsynet i Danmark: <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer">datatilsynet.dk</a>.</p>
          <p>Vi sætter dog pris på, at du kontakter os først.</p>
        </>
      ),
    },
    {
      id: "barn",
      number: "12",
      title: "Børn og forældreansvar",
      body: (
        <>
          <p>
            Aldersgrænsen for digitalt samtykke efter GDPR artikel 8 er sat til 13 år i Norge (og 13 år i Danmark efter dansk gennemførelse). Børn under 13 år må kun bruge Kroni gennem en barneprofil oprettet af en forælder eller værge, der samtykker på barnets vegne.
          </p>
          <p>
            For børn der er <strong>13 år eller ældre</strong> kan forælderen tage barnets eget samtykke i betragtning. Uanset hvad ligger al administration og kontoejerskab hos forælderen.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      number: "13",
      title: "Cookies og sporing",
      body: (
        <>
          <p>
            <strong>I mobilappen:</strong> Vi bruger ingen reklamesporing, ingen tredjepartsanalyseværktøjer med personhenførbare identifikatorer og ingen <em>fingerprinting</em>. Til fejlfinding sender appen crash-rapporter og en begrænset andel ydelses-traces til vores selvhostede Sentry-instans, jf. punkt 02 og 09. Loggene bruges udelukkende til fejlfinding.
          </p>
          <p>
            <strong>På kroni.no:</strong> Vi bruger kun strengt nødvendige cookies.
          </p>
        </>
      ),
    },
    {
      id: "brudd",
      number: "14",
      title: "Persondatabrud",
      body: (
        <>
          <p>
            Sker der et brud, anmelder vi det til tilsynsmyndigheden inden for <strong>72 timer</strong>, jf. GDPR artikel 33. Hvis bruddet sandsynligvis vil medføre høj risiko for de berørte, underretter vi dig direkte, jf. GDPR artikel 34.
          </p>
        </>
      ),
    },
    {
      id: "endringer",
      number: "15",
      title: "Ændringer i politikken",
      body: (
        <>
          <p>
            Vi kan opdatere denne politik for at afspejle ændringer i tjenesten eller lovgivningen. Væsentlige ændringer varsles mindst <strong>30 dage før</strong> de træder i kraft.
          </p>
        </>
      ),
    },
    {
      id: "kontakt",
      number: "16",
      title: "Kontakt og databeskyttelsesrådgiver",
      body: (
        <>
          <p>For privatlivsspørgsmål og rettighedsudøvelse:</p>
          <p>
            <strong>Nilsen Konsult</strong><br />
            E-mail: <a href="mailto:support@kroni.no">support@kroni.no</a>
          </p>
        </>
      ),
    },
  ],
};
