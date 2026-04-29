import type { LegalContent } from "../types";
import {
  CURRENCY,
  prices,
  formatPrice,
  yearlySavingsPercent,
} from "../../_config/pricing";

const monthlyPrice = formatPrice(prices.monthly, "da");
const yearlyPrice = formatPrice(prices.yearly, "da");
const lifetimePrice = formatPrice(prices.lifetime, "da");

export const vilkarDa: LegalContent = {
  eyebrow: "Vilkår",
  title: "Brugsvilkår",
  intro:
    "Disse vilkår regulerer brugen af Kroni-appen og familieabonnementet. De er skrevet for at være forståelige, men bruger præcise juridiske begreber hvor det betyder noget — så både du og vi ved, hvad vi har aftalt.",
  updated: "29. april 2026",
  sections: [
    {
      id: "innledning",
      number: "01",
      title: "Indledning og aftaleparter",
      body: (
        <>
          <p>
            Disse vilkår («Vilkårene») udgør en bindende aftale mellem dig som bruger («du», «Brugeren», «Forælderen») og <strong>Nilsen Konsult</strong> (norsk org.nr. 931 405 861 MVA), en norsk enkeltmandsvirksomhed («vi», «os», «Nilsen Konsult», «Kroni»). Nilsen Konsult leverer familieappen Kroni og hjemmesiden kroni.no.
          </p>
          <p>
            Ved at downloade, oprette konto i eller på anden måde tage Kroni-appen i brug, bekræfter du at du har læst og accepteret Vilkårene og vores privatlivspolitik. Accept sker automatisk ved registrering — når du fuldfører registreringen accepterer du både Vilkårene og privatlivspolitikken.
          </p>
          <p>
            Du skal være myndig (fyldt 18 år) og have retsevne for at indgå aftalen. Personer under 18 må kun bruge tjenesten gennem en parret barneprofil oprettet af en forælder eller værge.
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
          <p>I disse Vilkår betyder:</p>
          <ul>
            <li><strong>Appen</strong> — Kroni-mobilappen til iOS og Android, tilhørende hjemmeside og bagvedliggende tjenester.</li>
            <li><strong>Forælder</strong> — den voksne kontoindehaver der opretter familien og administrerer barneprofiler, opgaver og belønninger.</li>
            <li><strong>Barn</strong> — en barneprofil parret til Forælderens konto via en sekscifret kode. Barnet har et eget, forenklet login men ingen selvstændig aftale med Kroni.</li>
            <li><strong>Konto</strong> — Forælderens samlede adgang til tjenesten inkl. tilknyttede barneprofiler.</li>
            <li><strong>Virtuelle kroner</strong> — en intern, ikke-monetær tæller der vises som «kroner» eller «kr» i barnets app. De repræsenterer <em>ikke</em> norske kroner, kan ikke veksles til rigtige penge og har ingen værdi uden for Appen.</li>
            <li><strong>Belønning</strong> — en ting, oplevelse eller handling som Forælderen selv definerer og som barnet kan «købe» med virtuelle kroner. Leveres af Forælderen, ikke af Kroni.</li>
            <li><strong>Familieabonnement</strong> — det betalte abonnementsprodukt (månedligt eller årligt) der låser op for ubegrænset antal barneprofiler, opgaver og belønninger og fornyes automatisk indtil det opsiges.</li>
            <li><strong>Livstidskøb</strong> — et engangskøb der giver varig adgang til alle funktioner i Familieabonnementet for den konto købet er knyttet til. Fornyes ikke, faktureres ikke igen, og inkluderer fremtidige funktioner inden for samme produktområde. Har ingen prøveperiode.</li>
            <li><strong>Prøveperiode</strong> — syv (7) dages gratis prøve af Familieabonnementet (månedligt eller årligt), leveret af Apple App Store eller Google Play. Gælder ikke Livstidskøb.</li>
            <li><strong>Platformene</strong> — Apple App Store (Apple Inc.) og Google Play (Google LLC).</li>
          </ul>
        </>
      ),
    },
    {
      id: "tjenesten",
      number: "03",
      title: "Tjenestens indhold og begrænsninger",
      body: (
        <>
          <p>
            Kroni lader Forælderen oprette opgaver, tildele dem til et eller flere børn og knytte et beløb i virtuelle kroner til hver opgave. Når barnet markerer en opgave som klar, kan Forælderen godkende den, og barnets virtuelle saldo vokser tilsvarende. Barnet kan derefter «indløse» belønninger, Forælderen har lagt ind.
          </p>
          <p>
            <strong>Kroni er ikke en betalingstjeneste, tegnebog eller finansiel institution.</strong> Der flyttes aldrig rigtige penge mellem konti i Kroni. Saldoen der vises hos barnet er en intern pointværdi der kun har betydning inden for familien som bruger Appen. Virtuelle kroner kan ikke overføres mellem familier, ikke veksles til kontanter, varer eller tjenester fra tredjepart, og giver ingen ret over for Kroni eller andre.
          </p>
          <p>
            Tjenesten leveres som software-som-tjeneste. Funktioner kan ændres, udvides eller udfases. Vi tilstræber rimelig tilgængelighed men giver ingen garanti for uafbrudt drift.
          </p>
        </>
      ),
    },
    {
      id: "konto",
      number: "04",
      title: "Oprettelse af konto og parring af barn",
      body: (
        <>
          <p>
            For at bruge Kroni opretter Forælderen en konto via vores autentifikationspartner Clerk, med e-mail eller via «Log ind med Apple». Forælderen skal afgive korrekte og opdaterede oplysninger og har ansvar for at holde loginoplysninger hemmelige. Al aktivitet fra Forælderens konto regnes som udført af Forælderen.
          </p>
          <p>
            Barneprofiler oprettes altid af Forælderen. Når en barneprofil tilføjes, genererer Appen en sekscifret parringskode der bruges til at koble barnets enhed til familien. Forælderen står inde for at det er Forælderen eller en anden med forældremyndighed der opretter profilen, og at relevant samtykke er indhentet i overensstemmelse med GDPR artikel 8 og norsk persondatalov for børn under 13 år.
          </p>
          <p>
            Mistænker Forælderen uautoriseret brug af Kontoen, skal Kroni varsles uden ugrundet ophold på <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
          <p>
            Ved at oprette en konto samtykker du til at modtage drifts- og transaktionelle e-mails (konto, sikkerhed, fakturering og familiehusstands-administration) på den e-mailadresse, der blev brugt ved registreringen. Det omfatter blandt andet registreringsbekræftelse, nulstilling af adgangskode, e-mailverifikation, varsler om mislykket betaling eller abonnementsudløb, og invitationslinks til familiehusstand. Sådanne beskeder er <strong>nødvendige tjenestebeskeder</strong> og kan ikke fravælges, så længe kontoen er aktiv. Vi sender <strong>ingen markedsførings-e-mails</strong> som del af tjenesten. E-mails sendes fra <code>noreply@kroni.no</code> via vores e-mailunderleverandør Mailpace; svaradresse er <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "akseptabel-bruk",
      number: "05",
      title: "Acceptabel brug",
      body: (
        <>
          <p>Du forpligter dig til ikke at:</p>
          <ul>
            <li>bruge Appen i strid med gældende lov;</li>
            <li>forsøge at få uautoriseret adgang til Kronis systemer eller andres konti;</li>
            <li>dekompilere, omskrive, demontere eller på anden måde reverse-engineere Appen, ud over hvad ufravigelig lov tillader;</li>
            <li>køre automatiske scripts, scrapers, bots eller belastningstest uden skriftligt forhåndssamtykke;</li>
            <li>bruge Appen til andet end familiens opgavestyring og belønningssystem;</li>
            <li>uploade indhold der er stødende, krænkende, diskriminerende, seksualiseret, voldeligt eller upassende for børn;</li>
            <li>bruge Appen til at overvåge børn på en måde der strider mod barnets rettigheder efter børnekonventionen og dansk/norsk børnelovgivning.</li>
          </ul>
          <p>
            Forælderen er ansvarlig for at tilknyttede barneprofiler holder sig inden for disse rammer. Vi forbeholder os retten til at lukke konti der bruges i strid med Vilkårene.
          </p>
        </>
      ),
    },
    {
      id: "abonnement",
      number: "06",
      title: "Familieabonnement og priser",
      body: (
        <>
          <p>Kroni tilbydes i fire niveauer:</p>
          <ul>
            <li><strong>Gratis</strong> — op til ét barn og maks. fem aktive opgaver. Ingen tidsbegrænsning, ingen betaling.</li>
            <li><strong>Familie månedlig</strong> — {monthlyPrice} {CURRENCY} om måneden, fornyes automatisk. Ubegrænset antal børn, opgaver, belønninger, mål og lommepenge.</li>
            <li><strong>Familie årlig</strong> — {yearlyPrice} {CURRENCY} om året, fornyes automatisk (ca. {yearlySavingsPercent} % besparelse vs. månedlig). Samme indhold som månedlig.</li>
            <li><strong>Livstid</strong> — {lifetimePrice} {CURRENCY} som engangskøb. Varig adgang til samme funktioner som Familieabonnementet, uden fornyelse og uden ny betaling. Knyttet til det Apple ID eller den Google-konto der gennemførte købet.</li>
          </ul>
          <p>
            Priserne er vejledende og oplyses i norske kroner inkl. moms. Den pris der faktisk gælder er den der vises i App Store eller Google Play på købstidspunktet og kan variere mellem lande og regioner.
          </p>
          <p>
            Livstidskøbet er beregnet til familier der foretrækker en simpel engangsbetaling fremfor abonnement. Det omfatter funktioner i familieproduktet sådan som det er defineret ved købet, samt fremtidig udvikling inden for samme produktområde.
          </p>
        </>
      ),
    },
    {
      id: "provetid",
      number: "07",
      title: "Prøveperiode på 7 dage",
      body: (
        <>
          <p>
            Alle nye brugere får syv (7) dages gratis prøve af Familieabonnementet, både ved månedlig og årlig fakturering. Prøven starter når du gennemfører købet i App Store eller Google Play. I prøveperioden har du fuld adgang til alle funktioner.
          </p>
          <p>
            Ved prøveperiodens udløb fornyes abonnementet <strong>automatisk</strong> til det interval du har valgt, til den pris der vises i Platformen ved købet, og du betaler via Apple ID eller Google-konto.
          </p>
          <p>
            For at undgå opkrævning skal du <strong>opsige abonnementet senest 24 timer før prøveperioden udløber</strong> i Platformens abonnementsindstillinger.
          </p>
          <p>
            Den gratis prøveperiode kan kun bruges én gang per Apple ID eller Google-konto, jf. Platformenes egne regler.
          </p>
        </>
      ),
    },
    {
      id: "betaling",
      number: "08",
      title: "Betaling og automatisk fornyelse",
      body: (
        <>
          <p>
            Familieabonnementet og Livstidskøbet sælges udelukkende som køb i appen via App Store eller Google Play. <strong>Kroni er ikke sælger af betalingen og ikke merchant of record.</strong> Alle transaktioner gennemføres af Apple Distribution International Ltd. og Google Commerce Limited, der er ansvarlige for fakturering, kvitteringer, chargebacks, skattetræk og overholdelse af deres egne købsvilkår.
          </p>
          <p>
            Familieabonnementet fornyes automatisk for samme periode (en måned eller et år) indtil det opsiges via Platformen. Opkrævning sker på det betalingsmiddel der er knyttet til dit Apple ID eller din Google-konto.
          </p>
          <p>
            <strong>Livstidskøbet</strong> opkræves som ét enkelt beløb på købstidspunktet og fornyes ikke. Du opkræves ikke igen, og der er ikke noget at opsige. Købet kan genoprettes på en ny enhed via «Gendan køb» i Appen.
          </p>
          <p>
            Vi kan ændre priser for fremtidige fornyelser. Ændringer varsles mindst 30 dage før de træder i kraft. Ønsker du ikke at acceptere en prisændring, kan du opsige før den nye pris træder i kraft.
          </p>
        </>
      ),
    },
    {
      id: "oppsigelse",
      number: "09",
      title: "Opsigelse",
      body: (
        <>
          <p>
            Du kan til enhver tid opsige Familieabonnementet via App Store eller Google Play. Opsigelsen får virkning ved udgangen af den igangværende faktureringsperiode — du beholder fuld adgang ud den måned eller det år du allerede har betalt for.
          </p>
          <p>
            Vi giver <strong>ingen forholdsmæssig refusion</strong> for ubrugt tid efter opsigelse.
          </p>
          <p>
            Livstidskøb har ingen opsigelse, da det ikke fornyes. Vil du stoppe brugen, kan du slette familiekontoen i Appen; selve købet forbliver registreret hos Apple eller Google og kan genoprettes senere.
          </p>
          <p>
            Vi kan på vores side opsige aftalen ved væsentlig misligholdelse, herunder brud på punkt 05.
          </p>
        </>
      ),
    },
    {
      id: "refusjon",
      number: "10",
      title: "Refusion",
      body: (
        <>
          <p>
            Da Kroni ikke er sælger af betalingen, kan vi ikke selv tilbagebetale beløb betalt via App Store eller Google Play. Refusionsforespørgsler skal derfor rettes direkte til Platformen som gennemførte købet:
          </p>
          <ul>
            <li><strong>Apple App Store:</strong> <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener noreferrer">reportaproblem.apple.com</a></li>
            <li><strong>Google Play:</strong> <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">play.google.com</a> → Bestillingshistorik → vælg købet → «Anmod om refusion».</li>
          </ul>
          <p>
            Den syv dage lange prøveperiode er tænkt at give dig tid til at vurdere tjenesten inden du bliver opkrævet, så refusion sjældent er nødvendigt.
          </p>
          <p>
            Mener du at have et selvstændigt krav mod Kroni — fx ved væsentlig misligholdelse fra vores side — kan du fremsætte kravet direkte til os på <a href="mailto:support@kroni.no">support@kroni.no</a>. Vi behandler sådanne henvendelser i overensstemmelse med ufravigelig forbrugerret.
          </p>
        </>
      ),
    },
    {
      id: "angrerett",
      number: "11",
      title: "Fortrydelsesret og samtykke til straks-levering",
      body: (
        <>
          <p>
            Forbrugere har som hovedregel 14 dages fortrydelsesret ved fjernkøb efter norsk fortrydelsesret. Efter § 22 litra n bortfalder fortrydelsesretten dog for digitalt indhold der leveres umiddelbart efter aftalens indgåelse, hvis forbrugeren (a) udtrykkeligt samtykker til at leveringen påbegyndes før fortrydelsesfristen udløber og (b) erkender at fortrydelsesretten dermed bortfalder.
          </p>
          <p>
            Ved at aktivere et Familieabonnement eller Livstidskøb afgiver du følgende udtrykkelige samtykke:
          </p>
          <p>
            <em>«Jeg samtykker til at Kroni leveres umiddelbart efter aftaleindgåelse, og jeg erkender at fortrydelsesretten bortfalder så snart abonnementet eller livstidskøbet er aktiveret.»</em>
          </p>
          <p>
            Den syv dage lange, gratis prøveperiode giver dig stadig reel mulighed for at vurdere tjenesten og afslutte uden at blive opkrævet, jf. punkt 07.
          </p>
        </>
      ),
    },
    {
      id: "brukerinnhold",
      number: "12",
      title: "Brugerskabt indhold",
      body: (
        <>
          <p>
            Forælderen har det fulde ansvar for alt indhold der lægges ind i Appen — opgavetitler, beskrivelser, belønningsnavne, lommepengeordninger, profilnavne på børn og andet fritekstindhold. Du står inde for at indholdet er passende for børn og ikke krænker andres rettigheder.
          </p>
          <p>
            Vi tager intet redaktionelt ansvar for familiens private indhold men forbeholder os retten til at fjerne eller blokere indhold der åbenbart strider mod punkt 05 eller mod loven.
          </p>
        </>
      ),
    },
    {
      id: "rettigheter",
      number: "13",
      title: "Immaterielle rettigheder",
      body: (
        <>
          <p>
            Alle rettigheder til Kroni-mærket, logo, software, design, ikoner, tekst, illustrationer og andre ophavsretligt beskyttede komponenter tilhører Nilsen Konsult eller vores licensgivere. Ingen rettigheder overdrages til dig ud over hvad der udtrykkeligt fremgår af Vilkårene.
          </p>
          <p>
            Du gives en begrænset, ikke-eksklusiv, ikke-overdragelig og tilbagekaldelig brugsret til at installere og bruge Appen til personlig, ikke-kommerciel familiebrug, så længe du overholder Vilkårene.
          </p>
          <p>
            Dit eget indhold tilhører dig. Du giver Kroni en begrænset ret til at gemme, vise og behandle indholdet i det omfang det er nødvendigt for at levere tjenesten.
          </p>
        </>
      ),
    },
    {
      id: "personvern",
      number: "14",
      title: "Privatliv",
      body: (
        <>
          <p>
            Kroni behandler personoplysninger om Forælderen og børn i overensstemmelse med persondatalovgivningen og GDPR. Hvilke oplysninger vi behandler, formålene, opbevaringstiden og dine rettigheder fremgår af vores privatlivspolitik. Ved spørgsmål, kontakt <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "ansvar",
      number: "15",
      title: "Garantier og ansvarsbegrænsning",
      body: (
        <>
          <p>
            Kroni leveres «som det er» og «som tilgængeligt». I det omfang ufravigelig lov tillader, giver vi ingen garanti for at tjenesten altid vil være tilgængelig, fejlfri eller egnet til et bestemt formål.
          </p>
          <p>
            Vi er ikke ansvarlige for tab af virtuelle kroner som skyldes forhold på Forælderens eller barnets side. Virtuelle kroner har ingen pengeværdi, og sådant «tab» udgør ikke et økonomisk tab i juridisk forstand.
          </p>
          <p>
            Medmindre ufravigelig lov foreskriver andet er Kronis samlede ansvar over for en bruger pr. kalenderår begrænset til det beløb brugeren faktisk har betalt for tjenesten i det pågældende år. Vi hæfter ikke for indirekte tab.
          </p>
          <p>
            Begrænsningerne gælder ikke ved forsæt eller grov uagtsomhed fra vores side eller ved personskade forvoldt ved uagtsomhed, og påvirker ikke dine ufravigelige rettigheder som forbruger.
          </p>
        </>
      ),
    },
    {
      id: "barneansvar",
      number: "16",
      title: "Forældres ansvar for børn",
      body: (
        <>
          <p>
            Aldersgrænsen for digitalt samtykke efter GDPR artikel 8 er 13 år i Norge (og i Danmark efter dansk gennemførelse). For børn under 13 kræves forælderens eller værgens samtykke til behandling af barnets personoplysninger. Forælderen står inde for at samtykket er gyldigt afgivet.
          </p>
          <p>
            Forælderen har det overordnede ansvar for at barnets brug af Appen sker trygt og hensigtsmæssigt.
          </p>
        </>
      ),
    },
    {
      id: "endringer",
      number: "17",
      title: "Ændringer i vilkårene",
      body: (
        <>
          <p>
            Vi kan opdatere Vilkårene for at afspejle ændringer i tjenesten, lovgivningen, sikkerhed eller forretningsforhold. Datoen øverst viser hvornår Vilkårene sidst blev ændret.
          </p>
          <p>
            Væsentlige ændringer der påvirker dine rettigheder eller pligter varsles mindst <strong>30 dage før</strong> de træder i kraft. Fortsat brug efter ændringerne er trådt i kraft regnes som accept.
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
            Ingen part anses for at have misligholdt sine forpligtelser så længe opfyldelsen hindres af forhold uden for partens kontrol — herunder krig, naturkatastrofer, omfattende strøm- eller internetafbrud, væsentlige svigt hos underleverandører som Apple, Google, Clerk eller hostingleverandør, samt myndighedspålæg.
          </p>
        </>
      ),
    },
    {
      id: "fullstendig",
      number: "19",
      title: "Fuldstændig aftale og delvis ugyldighed",
      body: (
        <>
          <p>
            Disse Vilkår, sammen med privatlivspolitikken, udgør den fuldstændige aftale mellem dig og Kroni vedrørende brugen af Appen.
          </p>
          <p>
            Bliver én eller flere bestemmelser anset for ugyldige, ulovlige eller ikke gennemførlige, gælder de øvrige bestemmelser fortsat i deres helhed.
          </p>
        </>
      ),
    },
    {
      id: "lov",
      number: "20",
      title: "Lovvalg, tvistløsning og værneting",
      body: (
        <>
          <p>
            Disse Vilkår reguleres af norsk ret. Ved tvist skal parterne først forsøge at finde en mindelig løsning gennem direkte dialog. Som forbruger har du ret til at henvende dig til:
          </p>
          <ul>
            <li><strong>Forbrukertilsynet (Norge)</strong> — <a href="https://www.forbrukertilsynet.no" target="_blank" rel="noopener noreferrer">forbrukertilsynet.no</a></li>
            <li><strong>Forbrugerklagenævnet (Danmark)</strong> — <a href="https://kfst.dk" target="_blank" rel="noopener noreferrer">kfst.dk</a></li>
            <li><strong>EU-Kommissionens onlineplatform for tvistløsning (ODR)</strong> — <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a></li>
          </ul>
          <p>
            Hvis tvisten ikke løses i mindelighed, vedtages <strong>Oslo tingrett</strong> som værneting. Ufravigelige regler om forbrugerværneting går dog forud for denne klausul.
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
            <strong>Nilsen Konsult</strong> (norsk org.nr. 931 405 861 MVA)<br />
            E-mail: <a href="mailto:support@kroni.no">support@kroni.no</a><br />
            Web: <a href="https://kroni.no" target="_blank" rel="noopener noreferrer">kroni.no</a>
          </p>
        </>
      ),
    },
  ],
};
