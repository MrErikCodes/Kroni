import type { LegalContent } from "../types";
import {
  CURRENCY,
  prices,
  formatPrice,
  yearlySavingsPercent,
} from "../../_config/pricing";

const monthlyPrice = formatPrice(prices.monthly, "nb");
const yearlyPrice = formatPrice(prices.yearly, "nb");
const lifetimePrice = formatPrice(prices.lifetime, "nb");

export const vilkarNb: LegalContent = {
  eyebrow: "Vilkår",
  title: "Vilkår for bruk",
  intro:
    "Disse vilkårene regulerer bruken av Kroni-appen og familieabonnementet. De er skrevet på vanlig norsk, men bruker presise juridiske begreper der det betyr noe — slik at både du og vi vet hva vi har avtalt.",
  updated: "29. april 2026",
  sections: [
    {
      id: "innledning",
      number: "01",
      title: "Innledning og avtaleparter",
      body: (
        <>
          <p>
            Disse vilkårene («Vilkårene») utgjør en bindende avtale mellom deg som bruker («du», «Brukeren», «Forelderen») og <strong>Nilsen Konsult</strong> (org.nr. 931 405 861 MVA, Norge), norsk enkeltpersonforetak («vi», «oss», «Nilsen Konsult», «Kroni»). Nilsen Konsult er leverandør av familieappen Kroni og det tilhørende nettstedet kroni.no.
          </p>
          <p>
            Ved å laste ned, opprette konto i eller på annen måte ta i bruk Kroni-appen, bekrefter du at du har lest og akseptert disse Vilkårene og vår personvernerklæring. Aksept skjer automatisk ved registrering — ved å fullføre registreringen aksepterer du både Vilkårene og personvernerklæringen.
          </p>
          <p>
            Du må være myndig (fylt 18 år) og ha rettslig handleevne for å inngå denne avtalen. Personer under 18 år kan kun bruke tjenesten gjennom en paret barneprofil opprettet av en forelder eller foresatt.
          </p>
        </>
      ),
    },
    {
      id: "definisjoner",
      number: "02",
      title: "Definisjoner",
      body: (
        <>
          <p>I disse Vilkårene betyr:</p>
          <ul>
            <li><strong>Appen</strong> — Kroni-mobilappen for iOS og Android, samt tilhørende nettsted og bakenforliggende tjenester.</li>
            <li><strong>Forelder</strong> — den voksne kontoinnehaveren som oppretter familien, administrerer barneprofiler, oppretter oppgaver og belønninger.</li>
            <li><strong>Barn</strong> — en barneprofil paret til Forelderens konto via en sekssifret kode. Barnet har en egen, forenklet innlogging, men ingen egen avtale med Kroni.</li>
            <li><strong>Konto</strong> — Forelderens samlede tilgang til tjenesten, inkludert tilknyttede barneprofiler.</li>
            <li><strong>Virtuelle kroner</strong> — en intern, ikke-monetær tellestrek som vises som «kroner» eller «kr» i barnets app. Disse representerer <em>ikke</em> norske kroner, kan ikke veksles inn i ekte penger og har ingen verdi utenfor Appen.</li>
            <li><strong>Belønning</strong> — en gjenstand, opplevelse eller handling som Forelderen selv definerer, og som barnet kan «kjøpe» med virtuelle kroner. Leveres av Forelderen, ikke av Kroni.</li>
            <li><strong>Familieabonnement</strong> — det betalte abonnementsproduktet (månedlig eller årlig) som låser opp ubegrenset antall barneprofiler, oppgaver og belønninger, og som fornyes automatisk inntil det sies opp.</li>
            <li><strong>Livstidskjøp</strong> — et engangskjøp som gir varig tilgang til alle funksjonene i Familieabonnementet for den kontoen kjøpet er knyttet til. Fornyes ikke, faktureres ikke på nytt, og inkluderer fremtidige funksjoner innenfor samme produktområde. Tilbyr ingen prøveperiode.</li>
            <li><strong>Prøveperiode</strong> — sju (7) dagers gratis prøvetid på Familieabonnementet (månedlig eller årlig), levert av Apple App Store eller Google Play. Gjelder ikke for Livstidskjøp.</li>
            <li><strong>Plattformene</strong> — Apple App Store (Apple Inc.) og Google Play (Google LLC).</li>
          </ul>
        </>
      ),
    },
    {
      id: "tjenesten",
      number: "03",
      title: "Tjenestens innhold og begrensninger",
      body: (
        <>
          <p>
            Kroni er en familieapp som lar Forelderen opprette oppgaver, tildele dem til ett eller flere barn, og knytte en sum virtuelle kroner til hver oppgave. Når barnet markerer en oppgave som utført, kan Forelderen godkjenne fullføringen, og barnets virtuelle saldo øker tilsvarende. Barnet kan deretter «løse inn» belønninger som Forelderen har lagt inn.
          </p>
          <p>
            <strong>Kroni er ikke en betalingstjeneste, lommebok eller finansiell institusjon.</strong> Det flyttes aldri ekte penger mellom kontoer i Kroni. Saldoen som vises hos barnet er en intern poengverdi som kun har betydning innenfor familien som bruker Appen. Virtuelle kroner kan ikke overføres mellom familier, kan ikke veksles inn i kontanter, varer eller tjenester fra tredjeparter, og gir ingen rett overfor Kroni eller noen andre.
          </p>
          <p>
            Tjenesten leveres som programvare-som-tjeneste. Funksjoner kan endres, utvides eller avvikles over tid. Vi bestreber oss på rimelig tilgjengelighet, men gir ingen garanti for uavbrutt drift.
          </p>
        </>
      ),
    },
    {
      id: "konto",
      number: "04",
      title: "Oppretting av konto og paring av barn",
      body: (
        <>
          <p>
            For å bruke Kroni må Forelderen opprette en konto via vår autentiseringspartner Clerk, med e-postadresse eller via «Logg på med Apple». Forelderen plikter å oppgi korrekte og oppdaterte opplysninger og er ansvarlig for å holde innloggingsinformasjonen hemmelig. All aktivitet fra Forelderens konto regnes som utført av Forelderen.
          </p>
          <p>
            Barneprofiler opprettes alltid av Forelderen. Når en barneprofil legges til, genererer Appen en sekssifret paringskode som brukes for å koble barnets enhet til familien. Forelderen står inne for at det er Forelderen selv eller annen person med foreldreansvar som oppretter barneprofilen, og at relevant samtykke er innhentet i tråd med GDPR artikkel 8 og norsk personopplysningslov for barn under 13 år.
          </p>
          <p>
            Hvis Forelderen mistenker uautorisert bruk av Kontoen, skal Kroni varsles uten ugrunnet opphold på <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
          <p>
            Ved å opprette en konto samtykker du til å motta drifts- og transaksjonelle e-poster (konto, sikkerhet, fakturering og familiehusholdnings-administrasjon) på den e-postadressen som ble brukt ved registrering. Dette omfatter blant annet bekreftelse av registrering, tilbakestilling av passord, e-postverifisering, varsler om mislykket betaling eller utløp av abonnement, og invitasjonslenker til familiehusholdning. Slike meldinger er <strong>nødvendige tjeneste-meldinger</strong> og kan ikke reserveres mot så lenge kontoen er aktiv. Vi sender <strong>ikke markedsførings-e-poster</strong> som del av tjenesten. E-poster sendes fra <code>noreply@kroni.no</code> via vår e-postunderleverandør Mailpace; svar-til-adresse er <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "akseptabel-bruk",
      number: "05",
      title: "Akseptabel bruk",
      body: (
        <>
          <p>Du forplikter deg til å ikke:</p>
          <ul>
            <li>bruke Appen i strid med norsk eller annen relevant lovgivning;</li>
            <li>forsøke å skaffe deg uautorisert tilgang til Kronis systemer eller andres kontoer;</li>
            <li>dekompilere, omskrive, demontere eller på annen måte reverse-engineere Appen, utover det ufravikelig lov tillater;</li>
            <li>kjøre automatiserte skript, skrapere, boter eller belastnings-tester uten skriftlig forhåndssamtykke;</li>
            <li>bruke Appen til andre formål enn familiens oppgavestyring og belønningssystem;</li>
            <li>laste opp innhold som er støtende, krenkende, diskriminerende, seksualisert, voldelig eller upassende for barn;</li>
            <li>bruke Appen til å overvåke barn på en måte som er i strid med barnets rettigheter etter barnekonvensjonen og norsk barnelovgivning.</li>
          </ul>
          <p>
            Forelderen er ansvarlig for at all bruk fra tilknyttede barneprofiler skjer innenfor disse rammene. Vi forbeholder oss retten til å stenge kontoer som benyttes i strid med Vilkårene.
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
          <p>Kroni tilbys i fire nivåer:</p>
          <ul>
            <li><strong>Gratis</strong> — opptil ett barn og maksimalt fem aktive oppgaver. Ingen tidsbegrensning, ingen belastning.</li>
            <li><strong>Familie månedlig</strong> — {monthlyPrice} {CURRENCY} per måned, fornyes automatisk. Ubegrenset antall barn, ubegrensede oppgaver, belønninger, mål og ukepenger.</li>
            <li><strong>Familie årlig</strong> — {yearlyPrice} {CURRENCY} per år, fornyes automatisk (ca. {yearlySavingsPercent} % besparelse vs. månedlig). Samme innhold som månedlig.</li>
            <li><strong>Livstid</strong> — {lifetimePrice} {CURRENCY} som engangskjøp. Gir varig tilgang til samme funksjoner som Familieabonnementet, uten fornying og uten ny belastning. Knyttet til den Apple ID-en eller Google-kontoen som gjennomførte kjøpet.</li>
          </ul>
          <p>
            Prisene som er oppgitt er veiledende og vises i norske kroner inkludert merverdiavgift. Den prisen som faktisk gjelder for ditt kjøp, er den som vises i App Store eller Google Play på kjøpstidspunktet, og kan variere mellom land og regioner.
          </p>
          <p>
            Livstidskjøpet er ment som et alternativ for familier som foretrekker en enkel engangsbetaling fremfor abonnement. Det omfatter funksjoner innenfor familieproduktet i Appen slik det er definert på kjøpstidspunktet, og fremtidig utvikling innenfor samme produktområde.
          </p>
        </>
      ),
    },
    {
      id: "provetid",
      number: "07",
      title: "Prøveperiode på 7 dager",
      body: (
        <>
          <p>
            Alle nye brukere får en gratis prøveperiode på sju (7) dager på Familieabonnementet, både ved månedlig og årlig fakturering. Prøveperioden starter idet du fullfører kjøpet i App Store eller Google Play. I løpet av prøveperioden har du full tilgang til alle funksjoner i Familieabonnementet.
          </p>
          <p>
            Ved utløp av prøveperioden fornyes abonnementet <strong>automatisk</strong> til det intervallet du valgte, til den prisen som vises i Plattformen på kjøpstidspunktet, og du blir belastet via Apple ID eller Google-konto.
          </p>
          <p>
            For å unngå belastning må du <strong>kansellere abonnementet minst 24 timer før prøveperioden utløper</strong> i abonnementsinnstillingene i Plattformen.
          </p>
          <p>
            Du kan kun benytte gratis prøveperiode én gang per Apple ID eller Google-konto, i samsvar med Plattformenes egne regler.
          </p>
        </>
      ),
    },
    {
      id: "betaling",
      number: "08",
      title: "Betaling og automatisk fornying",
      body: (
        <>
          <p>
            Familieabonnementet og Livstidskjøpet selges utelukkende som kjøp i appen via App Store eller Google Play. <strong>Kroni er ikke selger av betalingen og er ikke merchant of record.</strong> Alle transaksjoner gjennomføres av henholdsvis Apple Distribution International Ltd. og Google Commerce Limited, som er ansvarlig for fakturering, kvitteringer, chargebacks, skattetrekk og overholdelse av deres egne kjøpsvilkår.
          </p>
          <p>
            Familieabonnementet fornyes automatisk for samme periode (en måned eller ett år) inntil det sies opp gjennom Plattformen. Belastning skjer på det betalingsmiddelet som er knyttet til Apple ID-en eller Google-kontoen din.
          </p>
          <p>
            <strong>Livstidskjøpet</strong> belastes som ett enkelt beløp på kjøpstidspunktet og fornyes ikke. Du blir ikke belastet på nytt, og det er ingenting å si opp. Kjøpet kan gjenopprettes på en ny enhet via «Gjenopprett kjøp» i Appen.
          </p>
          <p>
            Vi kan endre prisene for fremtidige fornyelser. Endringer varsles minst 30 dager før de trer i kraft. Hvis du ikke ønsker å akseptere en prisendring, kan du si opp abonnementet før den nye prisen trer i kraft.
          </p>
        </>
      ),
    },
    {
      id: "oppsigelse",
      number: "09",
      title: "Oppsigelse",
      body: (
        <>
          <p>
            Du kan si opp Familieabonnementet når som helst, gjennom App Store eller Google Play. Oppsigelsen får virkning ved slutten av den inneværende fakturaperioden — du beholder full tilgang ut den måneden eller det året du har betalt for.
          </p>
          <p>
            Vi gir <strong>ingen forholdsmessig refusjon</strong> for ubrukt tid etter oppsigelse.
          </p>
          <p>
            Livstidskjøp har ingen oppsigelse fordi det ikke fornyes. Hvis du ønsker å avslutte bruken, kan du slette familiekontoen i Appen; selve kjøpet forblir registrert hos Apple eller Google og kan gjenopprettes senere.
          </p>
          <p>
            Vi kan på vår side avslutte avtalen ved vesentlig mislighold, herunder brudd på punkt 05.
          </p>
        </>
      ),
    },
    {
      id: "refusjon",
      number: "10",
      title: "Refusjon",
      body: (
        <>
          <p>
            Fordi Kroni ikke er selger av betalingen, kan vi ikke selv tilbakebetale beløp som er betalt via App Store eller Google Play. Refusjonsforespørsler må derfor rettes direkte til Plattformen:
          </p>
          <ul>
            <li><strong>Apple App Store:</strong> <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener noreferrer">reportaproblem.apple.com</a></li>
            <li><strong>Google Play:</strong> <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">play.google.com</a> → Bestillingshistorikk → velg kjøpet → «Be om refusjon».</li>
          </ul>
          <p>
            Den syv dager lange prøveperioden er ment å gi deg anledning til å vurdere tjenesten i god tid før du blir belastet, slik at refusjon i liten grad blir nødvendig.
          </p>
          <p>
            Dersom du mener du har et selvstendig krav mot Kroni — for eksempel ved vesentlig mislighold fra vår side — kan du fremme krav direkte mot oss på <a href="mailto:support@kroni.no">support@kroni.no</a>. Vi behandler slike henvendelser i samsvar med ufravikelig forbrukerrett.
          </p>
        </>
      ),
    },
    {
      id: "angrerett",
      number: "11",
      title: "Angrerett og samtykke til umiddelbar levering",
      body: (
        <>
          <p>
            Forbrukere har som hovedregel 14 dagers angrerett ved fjernsalg etter angrerettloven. Etter angrerettloven § 22 bokstav n bortfaller imidlertid angreretten for digitalt innhold som leveres umiddelbart etter avtaleinngåelsen, dersom forbrukeren (a) uttrykkelig samtykker til at leveringen begynner før angrefristen utløper og (b) erkjenner at angreretten dermed bortfaller.
          </p>
          <p>
            Ved å aktivere et Familieabonnement eller Livstidskjøp gir du følgende uttrykkelige samtykke:
          </p>
          <p>
            <em>«Jeg samtykker til at Kroni leveres umiddelbart etter avtaleinngåelse, og jeg erkjenner at angreretten faller bort så snart abonnementet eller livstidskjøpet er aktivert.»</em>
          </p>
          <p>
            Den syv dager lange, kostnadsfrie prøveperioden gir deg likevel reell mulighet til å vurdere tjenesten og avslutte uten å bli belastet, jf. punkt 07.
          </p>
        </>
      ),
    },
    {
      id: "brukerinnhold",
      number: "12",
      title: "Innhold opprettet av brukere",
      body: (
        <>
          <p>
            Forelderen har det fulle ansvaret for alt innhold som legges inn i Appen — herunder oppgavetitler, beskrivelser, belønningsnavn, ukepengeordninger, profilnavn på barn og annet fritekstinnhold. Du står inne for at slikt innhold er passende for barn og ikke krenker andres rettigheter.
          </p>
          <p>
            Vi tar ikke redaksjonelt ansvar for familiens private innhold, men forbeholder oss retten til å fjerne eller blokkere innhold som åpenbart strider mot punkt 05 eller mot lov.
          </p>
        </>
      ),
    },
    {
      id: "rettigheter",
      number: "13",
      title: "Immaterielle rettigheter",
      body: (
        <>
          <p>
            Alle rettigheter til Kroni-merkenavnet, logo, programvare, design, ikoner, tekst, illustrasjoner og annen opphavsrettslig beskyttet komponent tilhører Nilsen Konsult eller våre lisensgivere. Ingen rettigheter overdras til deg utover det som uttrykkelig fremgår av disse Vilkårene.
          </p>
          <p>
            Du gis en begrenset, ikke-eksklusiv, ikke-overførbar og tilbakekallelig bruksrett til å installere og benytte Appen til personlig, ikke-kommersiell familiebruk, så lenge du overholder Vilkårene.
          </p>
          <p>
            Ditt eget innhold tilhører deg. Du gir Kroni en begrenset rett til å lagre, vise og behandle slikt innhold i den grad det er nødvendig for å levere tjenesten.
          </p>
        </>
      ),
    },
    {
      id: "personvern",
      number: "14",
      title: "Personvern",
      body: (
        <>
          <p>
            Kroni behandler personopplysninger om Forelderen og barn i tråd med personopplysningsloven og GDPR. Hvilke opplysninger vi behandler, til hvilke formål, hvor lenge de lagres, og hvilke rettigheter du har, fremgår av vår personvernerklæring. Ved spørsmål om personvern, kontakt oss på <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "ansvar",
      number: "15",
      title: "Garantier og ansvarsbegrensning",
      body: (
        <>
          <p>
            Kroni leveres «som den er» og «som tilgjengelig». Vi gir, i den grad ufravikelig lov tillater det, ingen garanti for at tjenesten alltid vil være tilgjengelig, feilfri eller egnet for et bestemt formål utover det som er beskrevet på kroni.no og i Appen.
          </p>
          <p>
            Vi er ikke ansvarlige for tap av virtuelle kroner som skyldes forhold på Forelderens eller barnets side. Virtuelle kroner har ingen pengeverdi, og slikt «tap» innebærer ikke et økonomisk tap i rettslig forstand.
          </p>
          <p>
            Med mindre annet følger av ufravikelig lov, er Kronis samlede ansvar overfor en bruker per kalenderår begrenset til det beløpet brukeren faktisk har betalt for tjenesten i det aktuelle kalenderåret. Vi svarer ikke for indirekte tap.
          </p>
          <p>
            Begrensningene gjelder ikke ved forsett eller grov uaktsomhet, eller ved personskade voldt ved uaktsomhet, og påvirker ikke dine ufravikelige rettigheter som forbruker.
          </p>
        </>
      ),
    },
    {
      id: "barneansvar",
      number: "16",
      title: "Foreldrenes ansvar for barn",
      body: (
        <>
          <p>
            Norsk lov setter aldersgrensen for digitalt samtykke etter GDPR artikkel 8 til 13 år. For barn under 13 må forelder eller foresatt gi samtykke til behandlingen av barnets personopplysninger. Forelderen står inne for at slikt samtykke er gyldig avgitt på vegne av barnet.
          </p>
          <p>
            Forelderen har, i tråd med foreldreansvaret etter barneloven, det overordnede ansvaret for at barnets bruk av Appen skjer på en trygg og hensiktsmessig måte.
          </p>
        </>
      ),
    },
    {
      id: "endringer",
      number: "17",
      title: "Endringer i vilkårene",
      body: (
        <>
          <p>
            Vi kan oppdatere disse Vilkårene for å reflektere endringer i tjenesten, lovgivningen, sikkerhetshensyn eller forretningsmessige forhold. Datoen øverst på denne siden viser når Vilkårene sist ble endret.
          </p>
          <p>
            Vesentlige endringer som påvirker dine rettigheter eller plikter, varsles minst <strong>30 dager før</strong> de trer i kraft. Fortsatt bruk av tjenesten etter at endringene har trådt i kraft, regnes som aksept.
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
            Ingen av partene anses for å ha misligholdt sine forpliktelser så lenge oppfyllelse hindres av forhold utenfor partens kontroll — herunder krig, naturkatastrofer, omfattende strøm- eller internettbrudd, vesentlige svikt hos underleverandører som Apple, Google, Clerk eller hostingleverandør, samt myndighetspålegg.
          </p>
        </>
      ),
    },
    {
      id: "fullstendig",
      number: "19",
      title: "Fullstendig avtale og delvis ugyldighet",
      body: (
        <>
          <p>
            Disse Vilkårene, sammen med personvernerklæringen, utgjør den fullstendige avtalen mellom deg og Kroni vedrørende bruken av Appen.
          </p>
          <p>
            Dersom én eller flere bestemmelser blir ansett som ugyldige, ulovlige eller ikke kan gjennomføres, skal de gjenværende bestemmelsene fortsatt gjelde i sin helhet.
          </p>
        </>
      ),
    },
    {
      id: "lov",
      number: "20",
      title: "Lovvalg, tvisteløsning og verneting",
      body: (
        <>
          <p>
            Disse Vilkårene reguleres av norsk rett. Ved tvist skal partene først forsøke å finne en minnelig løsning gjennom direkte dialog. Som forbruker har du rett til å henvende deg til:
          </p>
          <ul>
            <li><strong>Forbrukertilsynet</strong> — <a href="https://www.forbrukertilsynet.no" target="_blank" rel="noopener noreferrer">forbrukertilsynet.no</a></li>
            <li><strong>Forbrukerklageutvalget</strong> — <a href="https://www.forbrukerklageutvalget.no" target="_blank" rel="noopener noreferrer">forbrukerklageutvalget.no</a></li>
            <li><strong>EU-kommisjonens nettbaserte tvisteløsningsplattform (ODR)</strong> — <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a></li>
          </ul>
          <p>
            Dersom tvisten ikke løses i minnelighet, vedtas <strong>Oslo tingrett</strong> som verneting. Ufravikelige regler om forbrukerverneting går likevel foran denne klausulen.
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
            <strong>Nilsen Konsult</strong> (org.nr. 931 405 861 MVA, Norge)<br />
            E-post: <a href="mailto:support@kroni.no">support@kroni.no</a><br />
            Nettsted: <a href="https://kroni.no" target="_blank" rel="noopener noreferrer">kroni.no</a>
          </p>
        </>
      ),
    },
  ],
};
