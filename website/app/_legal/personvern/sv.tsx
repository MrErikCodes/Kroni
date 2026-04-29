import type { LegalContent } from "../types";

export const personvernSv: LegalContent = {
  eyebrow: "Integritet",
  title: "Integritetspolicy",
  intro:
    "Kroni är byggt för familjer — och integritet är inte något vi har lagt på i efterhand. Den här policyn förklarar vilka uppgifter vi behandlar, varför, hur länge, och vilka rättigheter du har.",
  updated: "29 april 2026",
  sections: [
    {
      id: "innledning",
      number: "01",
      title: "Inledning och personuppgiftsansvarig",
      body: (
        <>
          <p>
            <strong>Nilsen Konsult</strong> (norskt org.nr. 931 405 861 MVA) är personuppgiftsansvarig för de personuppgifter som behandlas via Kroni-appen och webbplatsen kroni.no. Det innebär att vi bestämmer ändamålen och medlen för behandlingen och ansvarar för att den sker i enlighet med personuppgiftslagstiftningen och GDPR.
          </p>
          <p>
            Kroni är en familjeapp där en förälder skapar sysslor, veckopeng och belöningar för sina barn. För att appen ska fungera måste vi behandla ett minimum av personuppgifter om både förälder och barn. Vi har genomgående valt lösningar som samlar in så lite som möjligt — vi frågar aldrig efter barnets efternamn, e-postadress eller bild, och inga riktiga pengar passerar systemet. Integritet är inbyggt, inte påklistrat.
          </p>
          <p>
            För integritetsfrågor eller för att utöva dina GDPR-rättigheter når du oss på <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "opplysninger",
      number: "02",
      title: "Vilka personuppgifter vi behandlar",
      body: (
        <>
          <p>Om <strong>föräldern</strong> behandlar vi:</p>
          <ul>
            <li>E-postadress (används som inloggning via vår autentiseringspartner Clerk).</li>
            <li>Namn från Apple ID om du väljer «Logga in med Apple».</li>
            <li>Valfritt visningsnamn som syns i familjen (förnamn eller smeknamn).</li>
            <li>Abonnemangsstatus (gratis, prov, månadsvis, årligen, livstid, avslutad) och ett RevenueCat-app-användar-ID kopplat till ditt Clerk-användar-ID.</li>
            <li>IP-adress och enhets-/webbläsarinformation vid inloggning och anrop till våra serverändpunkter, för säkerhet och felsökning.</li>
            <li>Tidsstämplar för händelser i appen (skapande av sysslor, godkännanden, inloggningar).</li>
            <li>Valfri språkpreferens.</li>
          </ul>
          <p>Om <strong>barnet</strong> behandlar vi:</p>
          <ul>
            <li>Förnamn (det föräldern brukar kalla barnet — ett smeknamn går lika bra).</li>
            <li>Eventuellt födelseår — endast året, aldrig dag eller månad. Frivilligt, används för åldersanpassning.</li>
            <li>Eventuell fyrsiffrig PIN, lagrad som hash (bcrypt). Aldrig i klartext.</li>
            <li>En vald avatar-nyckel som pekar på en av appens fördefinierade ikoner. Vi lagrar inga uppladdade bilder.</li>
            <li>Enhets-ID och push-token för att skicka aviseringar om nya sysslor, godkännanden och belöningar.</li>
          </ul>
          <p>
            Vi <strong>samlar inte in</strong> efternamn på barnet, fullständigt födelsedatum, e-postadress, telefonnummer, bilder eller röstdata, plats, eller andra särskilda kategorier av personuppgifter.
          </p>
          <p>
            För köp och fakturering hanteras betalningsuppgifterna (kortdata, faktureringsadress m.m.) av Apple eller Google som merchant of record. Kroni får endast en orderbekräftelse utan kortinformation samt ett anonymiserat köpobjekt från RevenueCat (produkt-id, köptidpunkt, förnyelsetidpunkt, eventuell provperiod).
          </p>
          <p>Om <strong>användningen av appen</strong> behandlar vi:</p>
          <ul>
            <li>Sysslor och syssel-mallar (titlar, belopp, frekvens, tilldelningar).</li>
            <li>Slutförda, godkända och avvisade sysslor.</li>
            <li>Belöningar och inlösningar.</li>
            <li>Saldon i virtuella kronor per barn.</li>
            <li>
              Teknisk telemetri från <strong>Sentry</strong> — krasch-rapporter med stack-trace, brödsmulor (breadcrumbs) av nyligen utförda händelser, prestanda- och distribuerade traces, samt enhets-, OS- och appversion. Händelser taggas med förälderns Clerk-användar-ID och e-postadress, samt barnprofilens interna ID om felet uppstår på barnets sida. Sentry körs som en <strong>självhostad instans</strong> på samma infrastruktur som resten av tjänsten; loggarna lämnar inte vår infrastruktur och delas inte med tredje part, särskilt inte i marknadsföringssyfte. Andelen prestanda-traces är begränsad (10–20% i produktion).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "innsamling",
      number: "03",
      title: "Hur uppgifterna samlas in",
      body: (
        <>
          <p>
            Det mesta får vi <strong>direkt från föräldern</strong> vid registrering, vid skapande av barnprofiler och vid normal användning av appen. Barnets enhet parkopplas till familjen via en sexsiffrig kod som föräldern anger; barnet matar inte in personuppgifter utöver det föräldern fyllt i.
          </p>
          <p>
            Tekniska data — IP-adress, enhetsmodell, OS, appversion, tidsstämplar och liknande — samlas in automatiskt när appen kontaktar våra serverändpunkter, och behövs för att tjänsten ska fungera och för att upptäcka missbruk.
          </p>
          <p>
            Abonnemangsinformation kommer från Apple App Store och Google Play, förmedlat via vår abonnemangsplattform RevenueCat.
          </p>
        </>
      ),
    },
    {
      id: "grunnlag",
      number: "04",
      title: "Rättslig grund",
      body: (
        <>
          <p>Vi behandlar personuppgifter på följande rättsliga grunder enligt GDPR artikel 6:</p>
          <ul>
            <li><strong>Avtal (artikel 6.1.b):</strong> Behandling som krävs för att fullgöra avtalet med föräldern — leverera familjeappen, skapa och underhålla kontot, genomföra köp och förnyelser.</li>
            <li><strong>Samtycke (artikel 6.1.a):</strong> Push-aviseringar och andra valfria funktioner som kräver ditt aktiva samtycke. Samtycket kan när som helst återkallas.</li>
            <li><strong>Berättigat intresse (artikel 6.1.f):</strong> Säkring av tjänsten mot missbruk, felsökning, aggregerad statistik, försvar mot rättsliga anspråk.</li>
            <li><strong>Rättslig förpliktelse (artikel 6.1.c):</strong> När vi måste bevara bokföringsunderlag enligt norsk bokföringslag, eller följa myndighetsbeslut.</li>
          </ul>
          <p>
            För barn under 13 år bygger vi på förälderns samtycke enligt <strong>GDPR artikel 8</strong>, så som den genomförts i norsk personuppgiftslag § 5.
          </p>
        </>
      ),
    },
    {
      id: "formal",
      number: "05",
      title: "Ändamål med behandlingen",
      body: (
        <>
          <p>Vi behandlar personuppgifter för att:</p>
          <ul>
            <li>skapa, drifta och underhålla föräldrakonton och tillhörande barnprofiler;</li>
            <li>låta barnet markera sysslor som klara, och låta föräldern godkänna dem;</li>
            <li>föra saldot av virtuella kronor och visa det i barnets app;</li>
            <li>skicka relevanta push-aviseringar, förutsatt att samtycke har lämnats;</li>
            <li>hantera abonnemang, prov och förnyelse via App Store och Google Play;</li>
            <li>besvara kundtjänst- och integritetsärenden;</li>
            <li>upptäcka och förhindra missbruk, kontoövertagande och brott mot villkoren;</li>
            <li>förbättra tjänsten baserat på aggregerad, anonymiserad användningsstatistik;</li>
            <li>uppfylla rättsliga skyldigheter, inklusive bokföring och myndighetsbeslut.</li>
          </ul>
          <p>
            Vi använder <strong>inte</strong> personuppgifter för beteendestyrd marknadsföring riktad till barn, profilering med rättsliga eller liknande betydande effekter, eller försäljning av data till tredje part.
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
          <p>Vi lagrar personuppgifter så länge det är nödvändigt för de ändamål de samlats in för, och därefter inte längre än lagen tillåter eller kräver.</p>
          <ul>
            <li><strong>Aktiva konton:</strong> Uppgifterna sparas så länge avtalet löper och kontot är i aktiv användning.</li>
            <li><strong>Slutförda och godkända sysslor:</strong> Raderas eller anonymiseras som regel inom 90 dagar efter godkännande.</li>
            <li><strong>Borttagning av konto:</strong> När föräldern raderar familjekontot raderas alla personuppgifter inom <strong>30 dagar</strong>, med undantag för bokföringsunderlag (5 år) och bevisning vid rättsliga anspråk.</li>
            <li><strong>Loggar och säkerhetsdata:</strong> Vanligtvis 30 till 180 dagar.</li>
            <li><strong>Kundtjänstärenden:</strong> Normalt upp till 24 månader.</li>
          </ul>
        </>
      ),
    },
    {
      id: "mottakere",
      number: "07",
      title: "Mottagare och biträden",
      body: (
        <>
          <p>
            Vi delar inte personuppgifter med tredje part för deras egna ändamål. Vi har som <strong>uttalad princip</strong> att dela så lite data som möjligt — vi minimerar mängd, kategorier och antal mottagare. Viss delning är ändå tekniskt oundviklig (inloggning, fakturering, distribution), och då sker den enbart med personuppgiftsbiträden enligt biträdesavtal (DPA) i enlighet med GDPR artikel 28, eller — för Apple och Google — som självständiga personuppgiftsansvariga för merchant-of-record-rollen.
          </p>
          <ul>
            <li><strong>Hetzner Online GmbH</strong> — drift av Kronis applikationsservrar och PostgreSQL-databaser. Maskinerna ligger i Hetzners datacenter i <strong>Finland</strong>, inom EU/EES. Hela kärndatamängden (konton, barnprofiler, sysslor, slutförda, virtuella saldon, Sentry-loggar) finns där.</li>
            <li><strong>Clerk, Inc.</strong> — autentisering och kontohantering för föräldern. Behandlar e-post, inloggningshändelser och Apple ID-namn vid «Logga in med Apple». Clerk har egen integritetspolicy.</li>
            <li><strong>RevenueCat, Inc.</strong> — hanterar abonnemangsstatus och synkroniserar köp/förnyelser mellan App Store och Google Play. Tar emot ett anonymiserat app-användar-ID och köpmetadata; ingen kortinformation. RevenueCat har egen integritetspolicy.</li>
            <li><strong>Apple Distribution International Ltd.</strong> (App Store) och <strong>Google Commerce Limited</strong> (Google Play) — distribution och betalning som merchant of record. Apples och Googles villkor styr det de själva samlar in.</li>
            <li><strong>Expo (Expo Application Services)</strong> — leverans av push-aviseringar.</li>
            <li><strong>Cloudflare, Inc.</strong> — DDoS-skydd och CDN för kroni.no.</li>
          </ul>
          <p>Personuppgifter kan lämnas ut till myndigheter när vi är rättsligt förpliktade att göra det.</p>
          <p>
            En aktuell lista över biträden kan beställas via <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "tredjeland",
      number: "08",
      title: "Överföring utanför EES",
      body: (
        <>
          <p>
            Några av våra biträden — särskilt Clerk och RevenueCat — är etablerade i USA och kan ha dataflöden dit. Sådan överföring sker med stöd av <strong>EU-kommissionens standardavtalsklausuler (SCC)</strong> enligt GDPR artikel 46, kompletterat med tekniska och organisatoriska åtgärder.
          </p>
          <p>
            Kronis kärndatabaser och applikationsservrar drivs hos <strong>Hetzner i Finland</strong>, så den löpande behandlingen sker inom EU/EES. Den «centrala» datamängden — sysslor, slutförda, virtuella saldon, barnprofiler och Sentry-loggar — lämnar därmed aldrig EES i normal drift.
          </p>
        </>
      ),
    },
    {
      id: "sikkerhet",
      number: "09",
      title: "Informationssäkerhet",
      body: (
        <>
          <p>Vi har vidtagit rimliga tekniska och organisatoriska åtgärder:</p>
          <ul>
            <li>TLS-kryptering på all trafik.</li>
            <li>Hashning av känsliga fält — barnets PIN är bcrypt-hash.</li>
            <li>Åtkomstkontroll efter <em>need-to-know</em>.</li>
            <li>Loggning och övervakning via vår självhostade Sentry-instans, samt regelbundna säkerhetsuppdateringar.</li>
            <li>Regelbundna databassäkerhetskopior och återställningsrutiner.</li>
            <li>Vi behandlar aldrig kortnummer, CVC-koder eller BankID-data.</li>
          </ul>
        </>
      ),
    },
    {
      id: "rettigheter",
      number: "10",
      title: "Dina rättigheter",
      body: (
        <>
          <p>Som registrerad har du följande rättigheter enligt GDPR:</p>
          <ul>
            <li><strong>Tillgång (art. 15):</strong> Få veta vilka uppgifter vi har och en kopia.</li>
            <li><strong>Rättelse (art. 16):</strong> Få felaktiga eller ofullständiga uppgifter rättade.</li>
            <li><strong>Radering (art. 17):</strong> Begära radering av personuppgifter.</li>
            <li><strong>Begränsning (art. 18):</strong> Be att vi tillfälligt pausar behandlingen.</li>
            <li><strong>Dataportabilitet (art. 20):</strong> Få dina uppgifter i ett strukturerat, maskinläsbart format.</li>
            <li><strong>Invändning (art. 21):</strong> Invända mot behandling som baseras på berättigat intresse.</li>
            <li><strong>Återkallelse av samtycke (art. 7.3):</strong> Återkalla samtycke när som helst.</li>
          </ul>
          <p>
            Mejla <a href="mailto:support@kroni.no">support@kroni.no</a>. Vi svarar inom <strong>30 dagar</strong>.
          </p>
        </>
      ),
    },
    {
      id: "klage",
      number: "11",
      title: "Klagomål till tillsynsmyndigheten",
      body: (
        <>
          <p>Anser du att vi behandlar dina personuppgifter i strid med reglerna, har du rätt att klaga. För Kroni är norska Datatilsynet primär tillsynsmyndighet:</p>
          <p>
            <strong>Datatilsynet</strong><br />
            Postboks 458 Sentrum, 0105 Oslo, Norge<br />
            Telefon: +47 22 39 69 00<br />
            Webb: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer">datatilsynet.no</a>
          </p>
          <p>Som svensk medborgare kan du även vända dig till Integritetsskyddsmyndigheten (IMY): <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer">imy.se</a>.</p>
          <p>Vi uppskattar dock om du hör av dig till oss först.</p>
        </>
      ),
    },
    {
      id: "barn",
      number: "12",
      title: "Barn och föräldraansvar",
      body: (
        <>
          <p>
            Åldersgränsen för digitalt samtycke enligt GDPR artikel 8 är 13 år i Norge (och i Sverige enligt svensk genomförande). Barn under 13 år får endast använda Kroni via en barnprofil skapad av en förälder eller vårdnadshavare, som samtycker på barnets vägnar.
          </p>
          <p>
            För barn som är <strong>13 år eller äldre</strong> kan föräldern beakta barnets eget samtycke. Oavsett ligger all administration och kontoinnehav hos föräldern.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      number: "13",
      title: "Kakor och spårning",
      body: (
        <>
          <p>
            <strong>I mobilappen:</strong> Vi använder ingen reklamspårning, inga tredjepartsanalysverktyg med personidentifierande identifierare och ingen <em>fingerprinting</em>. För felsökning skickar appen kraschrapporter och en begränsad andel prestanda-traces till vår självhostade Sentry-instans, jfr punkt 02 och 09. Loggarna används enbart för felsökning.
          </p>
          <p>
            <strong>På kroni.no:</strong> Vi använder bara strikt nödvändiga kakor.
          </p>
        </>
      ),
    },
    {
      id: "brudd",
      number: "14",
      title: "Personuppgiftsincidenter",
      body: (
        <>
          <p>
            Vid en personuppgiftsincident anmäler vi den till tillsynsmyndigheten inom <strong>72 timmar</strong>, enligt GDPR artikel 33. Om incidenten sannolikt medför hög risk för de berörda underrättar vi dig direkt, enligt GDPR artikel 34.
          </p>
        </>
      ),
    },
    {
      id: "endringer",
      number: "15",
      title: "Ändringar i policyn",
      body: (
        <>
          <p>
            Vi kan uppdatera denna policy för att spegla ändringar i tjänsten eller lagen. Väsentliga ändringar aviseras minst <strong>30 dagar i förväg</strong>.
          </p>
        </>
      ),
    },
    {
      id: "kontakt",
      number: "16",
      title: "Kontakt och dataskyddsombud",
      body: (
        <>
          <p>För integritetsfrågor och rättighetsärenden:</p>
          <p>
            <strong>Nilsen Konsult</strong><br />
            E-post: <a href="mailto:support@kroni.no">support@kroni.no</a>
          </p>
        </>
      ),
    },
  ],
};
