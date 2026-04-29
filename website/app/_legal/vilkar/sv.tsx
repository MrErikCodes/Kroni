import type { LegalContent } from "../types";

export const vilkarSv: LegalContent = {
  eyebrow: "Villkor",
  title: "Användarvillkor",
  intro:
    "De här villkoren reglerar användningen av Kroni-appen och familjeabonnemanget. De är skrivna för att vara läsbara, men använder precisa juridiska begrepp där det betyder något — så att både du och vi vet vad vi har kommit överens om.",
  updated: "29 april 2026",
  sections: [
    {
      id: "innledning",
      number: "01",
      title: "Inledning och avtalsparter",
      body: (
        <>
          <p>
            Dessa villkor («Villkoren») utgör ett bindande avtal mellan dig som användare («du», «Användaren», «Föräldern») och <strong>Nilsen Konsult</strong> (norskt org.nr. 931 405 861 MVA), en norsk enskild firma («vi», «oss», «Nilsen Konsult», «Kroni»). Nilsen Konsult tillhandahåller familjeappen Kroni och webbplatsen kroni.no.
          </p>
          <p>
            Genom att ladda ner, skapa konto i eller på annat sätt använda Kroni-appen bekräftar du att du har läst och accepterat Villkoren och vår integritetspolicy. Acceptansen sker automatiskt vid registrering — när du slutför registreringen accepterar du både Villkoren och integritetspolicyn.
          </p>
          <p>
            Du måste vara myndig (18 år eller äldre) och rättskapabel för att ingå avtalet. Personer under 18 år får endast använda tjänsten genom en parkopplad barnprofil skapad av en förälder eller vårdnadshavare.
          </p>
        </>
      ),
    },
    {
      id: "definisjoner",
      number: "02",
      title: "Definitioner",
      body: (
        <>
          <p>I dessa Villkor:</p>
          <ul>
            <li><strong>Appen</strong> — Kroni-mobilappen för iOS och Android, tillhörande webbplats och underliggande tjänster.</li>
            <li><strong>Förälder</strong> — den vuxna kontoinnehavaren som skapar familjen och hanterar barnprofiler, sysslor och belöningar.</li>
            <li><strong>Barn</strong> — en barnprofil parkopplad till Förälderns konto via en sexsiffrig kod. Barnet har en egen, förenklad inloggning men inget eget avtal med Kroni.</li>
            <li><strong>Konto</strong> — Förälderns samlade åtkomst till tjänsten, inklusive tillhörande barnprofiler.</li>
            <li><strong>Virtuella kronor</strong> — en intern, icke-monetär räknare som visas som «kronor» eller «kr» i barnets app. De representerar <em>inte</em> norska kronor, kan inte växlas till riktiga pengar och har inget värde utanför Appen.</li>
            <li><strong>Belöning</strong> — en sak, upplevelse eller handling som Föräldern själv definierar och som barnet kan «köpa» med virtuella kronor. Levereras av Föräldern, inte av Kroni.</li>
            <li><strong>Familjeabonnemang</strong> — den betalda abonnemangsprodukten (månadsvis eller årligen) som låser upp obegränsat antal barnprofiler, sysslor och belöningar och förnyas automatiskt tills den sägs upp.</li>
            <li><strong>Livstidsköp</strong> — ett engångsköp som ger varaktig tillgång till alla funktioner i Familjeabonnemanget för det konto köpet är knutet till. Förnyas inte, debiteras inte på nytt och inkluderar framtida funktioner inom samma produktområde. Har ingen provperiod.</li>
            <li><strong>Provperiod</strong> — sju (7) dagars gratis prov av Familjeabonnemanget (månads- eller år), levererat av Apple App Store eller Google Play. Gäller inte Livstidsköp.</li>
            <li><strong>Plattformarna</strong> — Apple App Store (Apple Inc.) och Google Play (Google LLC).</li>
          </ul>
        </>
      ),
    },
    {
      id: "tjenesten",
      number: "03",
      title: "Tjänstens innehåll och begränsningar",
      body: (
        <>
          <p>
            Kroni låter Föräldern skapa sysslor, tilldela dem till ett eller flera barn och knyta ett antal virtuella kronor till varje syssla. När barnet markerar en syssla som klar kan Föräldern godkänna den, varpå barnets virtuella saldo ökar. Barnet kan därefter «lösa in» belöningar Föräldern lagt in.
          </p>
          <p>
            <strong>Kroni är inte en betaltjänst, plånbok eller finansiell institution.</strong> Inga riktiga pengar flyttas mellan konton i Kroni. Saldot som visas hos barnet är ett internt poängvärde med betydelse endast inom familjen som använder Appen. Virtuella kronor kan inte överföras mellan familjer, kan inte växlas till kontanter, varor eller tjänster från tredje part och ger ingen rätt mot Kroni eller någon annan.
          </p>
          <p>
            Tjänsten levereras som programvara-som-tjänst. Funktioner kan ändras, utökas eller läggas ned. Vi strävar efter rimlig tillgänglighet men ger ingen garanti för oavbruten drift.
          </p>
        </>
      ),
    },
    {
      id: "konto",
      number: "04",
      title: "Skapande av konto och parkoppling av barn",
      body: (
        <>
          <p>
            För att använda Kroni skapar Föräldern ett konto via vår autentiseringspartner Clerk, med e-post eller via «Logga in med Apple». Föräldern ska lämna korrekta och uppdaterade uppgifter och ansvarar för att hålla inloggningen hemlig. All aktivitet från Förälderns konto räknas som utförd av Föräldern.
          </p>
          <p>
            Barnprofiler skapas alltid av Föräldern. När en barnprofil läggs till genererar Appen en sexsiffrig parkopplingskod som används för att koppla barnets enhet till familjen. Föräldern står inne för att Föräldern eller någon annan med vårdnadsansvar är den som skapar profilen, och att relevant samtycke har inhämtats enligt GDPR artikel 8 och norsk personuppgiftslag för barn under 13 år.
          </p>
          <p>
            Misstänker Föräldern obehörig användning av Kontot ska Kroni utan oskäligt dröjsmål meddelas på <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
          <p>
            Genom att skapa ett konto samtycker du till att ta emot drifts- och transaktionella e-postmeddelanden (konto, säkerhet, fakturering och familjehushålls-hantering) på den e-postadress som användes vid registreringen. Det omfattar bland annat registreringsbekräftelse, lösenordsåterställning, e-postverifiering, aviseringar om misslyckad betalning eller abonnemangets utgång, och inbjudningslänkar till familjehushåll. Sådana meddelanden är <strong>nödvändiga tjänstemeddelanden</strong> och kan inte avregistreras så länge kontot är aktivt. Vi skickar <strong>inga marknadsförings-mejl</strong> som del av tjänsten. Mejlen skickas från <code>noreply@kroni.no</code> via vår e-postunderleverantör Mailpace; svarsadress är <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "akseptabel-bruk",
      number: "05",
      title: "Acceptabel användning",
      body: (
        <>
          <p>Du förbinder dig att inte:</p>
          <ul>
            <li>använda Appen i strid med tillämplig lag;</li>
            <li>försöka skaffa obehörig åtkomst till Kronis system eller andras konton;</li>
            <li>dekompilera, skriva om, demontera eller på annat sätt reverse-engineera Appen, utöver vad tvingande lag tillåter;</li>
            <li>köra automatiska skript, scrapers, bottar eller belastningstester utan skriftligt förhandssamtycke;</li>
            <li>använda Appen för andra ändamål än familjens hantering av sysslor och belöningar;</li>
            <li>ladda upp innehåll som är stötande, kränkande, diskriminerande, sexualiserat, våldsamt eller på annat sätt olämpligt för barn;</li>
            <li>använda Appen för att övervaka barn på sätt som strider mot barnkonventionen och tillämplig barnrätt.</li>
          </ul>
          <p>
            Föräldern ansvarar för att tillkopplade barnprofiler håller sig inom dessa ramar. Vi förbehåller oss rätten att stänga konton som strider mot Villkoren.
          </p>
        </>
      ),
    },
    {
      id: "abonnement",
      number: "06",
      title: "Familjeabonnemang och priser",
      body: (
        <>
          <p>Kroni erbjuds i fyra nivåer:</p>
          <ul>
            <li><strong>Gratis</strong> — upp till ett barn och max fem aktiva sysslor. Ingen tidsbegränsning, ingen avgift.</li>
            <li><strong>Familj månadsvis</strong> — 49 kr per månad, förnyas automatiskt. Obegränsat antal barn, sysslor, belöningar, mål och veckopeng.</li>
            <li><strong>Familj år</strong> — 399 kr per år, förnyas automatiskt (cirka 32 % besparing vs. månadsvis). Samma innehåll som månadsvis.</li>
            <li><strong>Livstid</strong> — 1 200 kr som engångsköp. Permanent tillgång till samma funktioner som Familjeabonnemanget, utan förnyelser och utan ny debitering. Knutet till Apple ID eller Google-konto som gjorde köpet.</li>
          </ul>
          <p>
            Priserna är vägledande och anges i norska kronor inklusive moms. Det pris som faktiskt gäller är det som visas i App Store eller Google Play vid köpet och kan variera mellan länder och regioner.
          </p>
          <p>
            Livstidsköpet är avsett för familjer som föredrar en enkel engångsbetalning framför abonnemang. Det omfattar funktioner inom familjeprodukten såsom den definieras vid köpet, samt framtida utveckling inom samma produktområde.
          </p>
        </>
      ),
    },
    {
      id: "provetid",
      number: "07",
      title: "Provperiod på 7 dagar",
      body: (
        <>
          <p>
            Alla nya användare får sju (7) dagars gratis prov av Familjeabonnemanget, både vid månadsvis och årlig fakturering. Provet börjar när du slutför köpet i App Store eller Google Play. Under provperioden har du full tillgång till alla funktioner.
          </p>
          <p>
            Vid provperiodens slut förnyas abonnemanget <strong>automatiskt</strong> till det intervall du valt, till det pris som visas i Plattformen vid köpet, debiterat via Apple ID eller Google-konto.
          </p>
          <p>
            För att undvika debitering måste du <strong>säga upp abonnemanget minst 24 timmar innan provet löper ut</strong> i Plattformens abonnemangsinställningar.
          </p>
          <p>
            Den gratis provperioden kan endast användas en gång per Apple ID eller Google-konto, enligt Plattformarnas egna regler.
          </p>
        </>
      ),
    },
    {
      id: "betaling",
      number: "08",
      title: "Betalning och automatisk förnyelse",
      body: (
        <>
          <p>
            Familjeabonnemanget och Livstidsköpet säljs uteslutande som köp i appen via App Store eller Google Play. <strong>Kroni är inte säljare av betalningen och inte merchant of record.</strong> Alla transaktioner genomförs av Apple Distribution International Ltd. respektive Google Commerce Limited, som ansvarar för fakturering, kvitton, chargebacks, skatteavdrag och efterlevnad av sina egna köpvillkor.
          </p>
          <p>
            Familjeabonnemanget förnyas automatiskt för samma period (en månad eller ett år) tills du säger upp det via Plattformen. Debitering sker på det betalningsmedel som är kopplat till ditt Apple ID eller Google-konto.
          </p>
          <p>
            <strong>Livstidsköpet</strong> debiteras som ett enda belopp vid köpet och förnyas inte. Du debiteras inte på nytt och det finns inget att säga upp. Köpet kan återställas på en ny enhet via «Återställ köp» i Appen.
          </p>
          <p>
            Vi kan ändra priser för framtida förnyelser. Ändringar aviseras minst 30 dagar i förväg. Vill du inte acceptera en prisändring kan du säga upp innan det nya priset träder i kraft.
          </p>
        </>
      ),
    },
    {
      id: "oppsigelse",
      number: "09",
      title: "Uppsägning",
      body: (
        <>
          <p>
            Du kan när som helst säga upp Familjeabonnemanget via App Store eller Google Play. Uppsägningen får verkan vid utgången av den pågående faktureringsperioden — du behåller full åtkomst ut den månad eller det år du redan har betalat för.
          </p>
          <p>
            Vi ger <strong>ingen proportionerlig återbetalning</strong> för outnyttjad tid efter uppsägning.
          </p>
          <p>
            Livstidsköp har ingen uppsägning eftersom det inte förnyas. Vill du sluta använda tjänsten kan du radera familjekontot i Appen; själva köpet finns kvar registrerat hos Apple eller Google och kan återställas senare.
          </p>
          <p>
            Vi kan på vår sida säga upp avtalet vid väsentligt avtalsbrott, inklusive brott mot punkt 05.
          </p>
        </>
      ),
    },
    {
      id: "refusjon",
      number: "10",
      title: "Återbetalning",
      body: (
        <>
          <p>
            Eftersom Kroni inte är säljare av betalningen kan vi inte själva återbetala belopp som betalats via App Store eller Google Play. Återbetalningskrav måste därför riktas direkt till Plattformen som genomförde köpet:
          </p>
          <ul>
            <li><strong>Apple App Store:</strong> <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener noreferrer">reportaproblem.apple.com</a></li>
            <li><strong>Google Play:</strong> <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">play.google.com</a> → Beställningshistorik → välj köpet → «Begär återbetalning».</li>
          </ul>
          <p>
            Den sjudagars provperioden är tänkt att ge dig tid att utvärdera tjänsten innan du debiteras, så att återbetalning sällan behövs.
          </p>
          <p>
            Anser du att du har ett självständigt anspråk mot Kroni — t.ex. vid väsentligt avtalsbrott från vår sida — kan du framställa det direkt till oss på <a href="mailto:support@kroni.no">support@kroni.no</a>. Vi behandlar sådana ärenden i enlighet med tvingande konsumenträtt.
          </p>
        </>
      ),
    },
    {
      id: "angrerett",
      number: "11",
      title: "Ångerrätt och samtycke till omedelbar leverans",
      body: (
        <>
          <p>
            Konsumenter har som huvudregel 14 dagars ångerrätt vid distansköp enligt norsk ångerrättslag. Enligt § 22 bokstav n i lagen bortfaller dock ångerrätten för digitalt innehåll som levereras omedelbart efter avtalets ingående, om konsumenten (a) uttryckligen samtycker till att leveransen påbörjas innan ångerfristen löpt ut och (b) erkänner att ångerrätten därmed bortfaller.
          </p>
          <p>
            Genom att aktivera ett Familjeabonnemang eller Livstidsköp lämnar du följande uttryckliga samtycke:
          </p>
          <p>
            <em>«Jag samtycker till att Kroni levereras omedelbart efter avtalsslut och erkänner att ångerrätten bortfaller så snart abonnemanget eller livstidsköpet är aktiverat.»</em>
          </p>
          <p>
            Den sjudagars kostnadsfria provperioden ger dig ändå reell möjlighet att utvärdera tjänsten och avsluta utan att debiteras, jfr punkt 07.
          </p>
        </>
      ),
    },
    {
      id: "brukerinnhold",
      number: "12",
      title: "Användarskapat innehåll",
      body: (
        <>
          <p>
            Föräldern har det fulla ansvaret för allt innehåll som läggs in i Appen — syssletitlar, beskrivningar, belöningsnamn, veckopengsupplägg, profilnamn på barn och annat fritt innehåll. Du står inne för att innehållet är passande för barn och inte kränker andras rättigheter.
          </p>
          <p>
            Vi tar inget redaktionellt ansvar för familjens privata innehåll men förbehåller oss rätten att ta bort eller blockera innehåll som uppenbart bryter mot punkt 05 eller mot lag.
          </p>
        </>
      ),
    },
    {
      id: "rettigheter",
      number: "13",
      title: "Immateriella rättigheter",
      body: (
        <>
          <p>
            Alla rättigheter till Kroni-namnet, logo, programvara, design, ikoner, text, illustrationer och andra upphovsrättsligt skyddade komponenter tillhör Nilsen Konsult eller våra licensgivare. Inga rättigheter överlåts till dig utöver vad som uttryckligen följer av Villkoren.
          </p>
          <p>
            Du får en begränsad, icke-exklusiv, icke-överlåtbar och återkallelig nyttjanderätt att installera och använda Appen för personligt, icke-kommersiellt familjebruk så länge du följer Villkoren.
          </p>
          <p>
            Ditt eget innehåll är ditt. Du ger Kroni en begränsad rätt att lagra, visa och behandla sådant innehåll i den utsträckning det krävs för att leverera tjänsten.
          </p>
        </>
      ),
    },
    {
      id: "personvern",
      number: "14",
      title: "Integritet",
      body: (
        <>
          <p>
            Kroni behandlar personuppgifter om Föräldern och barn enligt persondatalagstiftningen och GDPR. Vilka uppgifter vi behandlar, ändamål, lagringstid och dina rättigheter framgår av vår integritetspolicy. Vid frågor, kontakta <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "ansvar",
      number: "15",
      title: "Garantier och ansvarsbegränsning",
      body: (
        <>
          <p>
            Kroni levereras «som det är» och «som tillgängligt». I den utsträckning tvingande lag tillåter ger vi ingen garanti för att tjänsten alltid kommer att vara tillgänglig, felfri eller lämplig för ett visst ändamål.
          </p>
          <p>
            Vi ansvarar inte för förlust av virtuella kronor som beror på förhållanden på Förälderns eller barnets sida. Virtuella kronor har inget penningvärde, så sådan «förlust» är inte en ekonomisk förlust i juridisk mening.
          </p>
          <p>
            Om tvingande lag inte föreskriver annat är Kronis sammanlagda ansvar gentemot en användare per kalenderår begränsat till det belopp användaren faktiskt har betalat för tjänsten under det aktuella året. Vi ansvarar inte för indirekt skada.
          </p>
          <p>
            Begränsningarna gäller inte vid uppsåt eller grov vårdslöshet från vår sida, eller vid personskada genom vårdslöshet, och påverkar inte dina tvingande rättigheter som konsument.
          </p>
        </>
      ),
    },
    {
      id: "barneansvar",
      number: "16",
      title: "Föräldrarnas ansvar för barn",
      body: (
        <>
          <p>
            Åldersgränsen för digitalt samtycke enligt GDPR artikel 8 är 13 år i Norge (och i Sverige enligt svensk genomförande). För barn under 13 krävs förälderns eller vårdnadshavarens samtycke för behandling av barnets personuppgifter. Föräldern står inne för att samtycket är giltigt avgivet.
          </p>
          <p>
            Föräldern har det övergripande ansvaret för att barnets användning av Appen sker tryggt och lämpligt.
          </p>
        </>
      ),
    },
    {
      id: "endringer",
      number: "17",
      title: "Ändringar i villkoren",
      body: (
        <>
          <p>
            Vi kan uppdatera Villkoren för att spegla ändringar i tjänsten, lagstiftningen, säkerhet eller affärsförhållanden. Datumet överst visar när Villkoren senast ändrades.
          </p>
          <p>
            Väsentliga ändringar som påverkar dina rättigheter eller skyldigheter aviseras minst <strong>30 dagar i förväg</strong>. Fortsatt användning efter att ändringarna trätt i kraft räknas som accept.
          </p>
        </>
      ),
    },
    {
      id: "force-majeure",
      number: "18",
      title: "Force majeure",
      body: (
        <>
          <p>
            Ingen part anses bryta mot avtalet så länge fullgörandet hindras av omständigheter utanför partens kontroll — t.ex. krig, naturkatastrofer, omfattande ström- eller internetavbrott, väsentliga brister hos underleverantörer som Apple, Google, Clerk eller hostingleverantör, samt myndighetsbeslut.
          </p>
        </>
      ),
    },
    {
      id: "fullstendig",
      number: "19",
      title: "Fullständigt avtal och ogiltighet",
      body: (
        <>
          <p>
            Dessa Villkor, tillsammans med integritetspolicyn, utgör det fullständiga avtalet mellan dig och Kroni avseende användningen av Appen.
          </p>
          <p>
            Om en eller flera bestämmelser bedöms som ogiltiga, olagliga eller inte verkställbara, ska övriga bestämmelser fortsätta gälla i sin helhet.
          </p>
        </>
      ),
    },
    {
      id: "lov",
      number: "20",
      title: "Lagval, tvistelösning och forum",
      body: (
        <>
          <p>
            Dessa Villkor regleras av norsk rätt. Vid tvist ska parterna först söka en förlikning genom direkt dialog. Som konsument har du rätt att vända dig till:
          </p>
          <ul>
            <li><strong>Forbrukertilsynet (Norge)</strong> — <a href="https://www.forbrukertilsynet.no" target="_blank" rel="noopener noreferrer">forbrukertilsynet.no</a></li>
            <li><strong>Allmänna reklamationsnämnden (ARN, Sverige)</strong> — <a href="https://www.arn.se" target="_blank" rel="noopener noreferrer">arn.se</a></li>
            <li><strong>EU-kommissionens onlineplattform för tvistelösning (ODR)</strong> — <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a></li>
          </ul>
          <p>
            Om tvisten inte löses i godo utses <strong>Oslo tingsrätt</strong> som forum. Tvingande regler om konsumentforum går dock före denna klausul.
          </p>
        </>
      ),
    },
    {
      id: "kontakt",
      number: "21",
      title: "Kontakt",
      body: (
        <>
          <p>
            <strong>Nilsen Konsult</strong> (norskt org.nr. 931 405 861 MVA)<br />
            E-post: <a href="mailto:support@kroni.no">support@kroni.no</a><br />
            Webb: <a href="https://kroni.no" target="_blank" rel="noopener noreferrer">kroni.no</a>
          </p>
        </>
      ),
    },
  ],
};
