import {
  CURRENCY,
  prices,
  formatPrice,
  yearlySavingsPercent,
} from "../../_config/pricing";

const monthlyPrice = formatPrice(prices.monthly, "nb");
const yearlyPrice = formatPrice(prices.yearly, "nb");
const lifetimePrice = formatPrice(prices.lifetime, "nb");

export const nb = {
  common: {
    currency: CURRENCY,
    save32: `Spar ${yearlySavingsPercent}%`,
    oneTime: "Engangskjøp",
    bestValue: "Beste verdi",
    lifetime: "Livstid",
    languageLabel: "Språk",
  },
  meta: {
    home: {
      title: "Kroni — Lommepenger og oppgaver for familier",
      description:
        "Lommepenger som lærer barn å mestre, ikke å forvente. Kroni hjelper familier å bygge ansvar gjennom oppgaver, ukepenger og belønninger.",
      og: "Lommepenger som lærer barn å mestre, ikke å forvente. Laget i Norge.",
    },
    rootDescription:
      "Kroni hjelper familier med å lære barn å mestre — gjennom oppgaver, ukepenger og belønninger. Laget i Norge.",
    support: {
      title: "Støtte og hjelp — Kroni",
      description:
        "Finn svar på vanlige spørsmål om Kroni, eller ta kontakt med oss på support@kroni.no.",
    },
    privacy: {
      title: "Personvernerklæring — Kroni",
      description:
        "Hvordan Nilsen Konsult samler inn, bruker, deler og beskytter personopplysninger om foreldre og barn som bruker Kroni.",
    },
    terms: {
      title: "Vilkår for bruk — Kroni",
      description:
        "Vilkårene for bruk av Kroni-appen og familieabonnementet — skrevet for å være forståelige, men juridisk dekkende etter norsk forbrukerrett.",
    },
  },
  header: {
    home: "Hjem",
    privacy: "Personvern",
    terms: "Vilkår",
    support: "Støtte",
    nav: "Nettstednavigasjon",
    homeAria: "Kroni — hjem",
    languageMenu: "Velg språk",
  },
  footer: {
    tagline: "Lommepenger som lærer barn å mestre, ikke å forvente.",
    blurb: "Bygd for familier. Ingen ekte penger, full kontroll.",
    productHeading: "Produkt",
    companyHeading: "Selskap",
    home: "Hjem",
    support: "Støtte",
    privacy: "Personvern",
    terms: "Vilkår",
    copyright: "© 2026 Nilsen Konsult. Alle rettigheter forbeholdt.",
  },
  home: {
    badge: "Lansert i Norge · våren 2026",
    heroTitlePre: "Lommepenger som lærer barn å ",
    heroTitleEm: "mestre",
    heroTitlePost: ", ikke å forvente.",
    heroBody:
      "Kroni er den lille familieappen for oppgaver, ukepenger og belønninger som faktisk passer hverdagen. Laget i Norge, for kjøkkenbordet ditt.",
    ctaIos: "Last ned for iOS",
    ctaAndroid: "Last ned for Android",
    ctaIosAria: "Last ned Kroni for iOS",
    ctaAndroidAria: "Last ned Kroni for Android",
    heroFinePrint: "Gratis å starte · Aldri ekte penger på kontoen · Full kontroll for foreldre",
    phoneCaption: "Slik ser barnets app ut. Ingen krimskrams, bare det viktige.",
    trust: ["Bygd i Norge", "GDPR-vennlig", "Ingen virkelige penger", "For barn 6–14 år"],
    howWorks: {
      eyebrow: "Slik fungerer det",
      title: "Tre steg fra rotete kjøkken til ro.",
      steps: [
        {
          n: "01",
          t: "Du lager oppgavene",
          d: "«Rydd rommet», «ta ut søppel», «øv 20 min på piano». Sett beløp og hyppighet en gang — Kroni gjentar resten.",
        },
        {
          n: "02",
          t: "Barnet hukar av",
          d: "Når oppgaven er gjort, trykker barnet på sin enkle «I dag»-liste. Du får et stille varsel — ingen mas, ingen sirener.",
        },
        {
          n: "03",
          t: "Du godkjenner — og kronene tikker inn",
          d: "Ett trykk, og saldoen vokser. Barna ser fremgangen. Du ser at noe faktisk ble gjort. Helgen blir litt roligere.",
        },
      ],
    },
    features: [
      {
        eyebrow: "Ukepenger",
        title: "Ukepenger som faktisk er pedagogiske.",
        body: "Du bestemmer beløpet. Mandag morgen lander det på barnets balanse — uten påminnelser, uten krangling. Pause når familien er på ferie, juster når lønna går opp.",
        side: "right",
      },
      {
        eyebrow: "Belønninger",
        title: "Belønninger som gir mening for familien.",
        body: "Skjermtid, kinokvelder, en helg uten oppvask — du bestemmer hva som er verdt noe i deres hjem. Barna sparer mot et mål de selv valgte.",
        side: "left",
      },
      {
        eyebrow: "Trygt",
        title: "Trygt for hele familien.",
        body: "Ingen ekte penger flyter. Ingen kjøp i appen. Barneprofilen ser bare det den skal se. Du har full kontroll, hele tiden.",
        side: "right",
      },
    ],
    twoSides: {
      eyebrow: "To sider, samme lag",
      title: "Forskjellig app — samme familie.",
      parentEyebrow: "For deg som forelder",
      parentTitle: "Mindre planlegging, mer hverdag.",
      parentPoints: [
        "Lag oppgaver på sekunder — gjentakende eller engangs.",
        "Godkjenn med ett trykk når oppgaven er gjort.",
        "Sett ukentlig beløp og pause når det trengs.",
        "Se historikk og fremgang per barn, samlet på ett sted.",
      ],
      kidEyebrow: "For barnet",
      kidTitle: "En liste. Et mål. Ingen tull.",
      kidPoints: [
        "En enkel «I dag»-liste — ingen forvirrende menyer.",
        "Saldoen vokser når du gjør jobben.",
        "Velg belønninger du faktisk vil ha.",
        "Ingen kjøp i appen. Ingen overraskelser.",
      ],
    },
    pricing: {
      eyebrow: "Priser",
      title: "Begynn gratis. Oppgrader når familien vokser.",
      free: {
        label: "Gratis",
        price: "0",
        period: "For alltid",
        items: ["1 barn", "5 aktive oppgaver", "Ukepenger"],
      },
      monthly: {
        label: "Familie",
        price: monthlyPrice,
        period: "per måned · 7 dager gratis",
        items: ["Ubegrenset antall barn", "Ubegrenset oppgaver", "Belønninger og mål"],
      },
      yearly: {
        label: "Familie årlig",
        price: yearlyPrice,
        period: "per år · 7 dager gratis",
        items: ["Alt i Familie", "Prioritert support", "Tidlig tilgang til nytt"],
      },
      lifetime: {
        label: "Livstid",
        price: lifetimePrice,
        period: "én gang, for alltid",
        items: ["Alt i Familie", "Ingen fornying", "Følger med fremtidige funksjoner"],
      },
      footnote:
        "Månedlig og årlig starter med 7 dager gratis. Betaling håndteres av App Store eller Google Play. Ingen skjulte gebyrer. Avbestill når du vil. Priser i NOK; din lokale valuta og skatt kan variere ved kjøp.",
    },
    faq: {
      eyebrow: "Spørsmål",
      title: "Det foreldre lurer på først.",
      blurb: "Finner du ikke svaret? Vi svarer hver e-post personlig, vanligvis samme dag.",
      seeAll: "Se alle spørsmål",
      items: [
        {
          q: "Hvor mye koster Kroni?",
          a: `Gratisplanen dekker ett barn og fem aktive oppgaver. Familieplanen starter på ${monthlyPrice} ${CURRENCY} i måneden eller ${yearlyPrice} ${CURRENCY} per år (du sparer ${yearlySavingsPercent}%), eller ${lifetimePrice} ${CURRENCY} som engangskjøp for livstid. Månedlig og årlig kommer med 7 dager gratis prøveperiode. Priser i ${CURRENCY}; din lokale valuta og skatt kan variere ved kjøp.`,
        },
        {
          q: "Hvorfor koster Kroni penger?",
          a: "Fordi vi aldri kommer til å spore barnet ditt eller selge data videre — det er hele poenget. Det betyr at familiene som bruker appen betaler for utviklingen. Pengene går til drift, sikkerhet, personvern, native-språk og videre utvikling. En liten, ærlig app som du kan stole på, koster litt — men aldri barnets oppmerksomhet.",
        },
        {
          q: "Er det ekte penger involvert?",
          a: "Nei. Saldoen i Kroni er en virtuell tellestrek. Du som forelder bestemmer hvordan den løses inn — kontant, Vipps eller belønninger som skjermtid og kinokvelder.",
        },
        {
          q: "Hvilken alder passer Kroni for?",
          a: "Kroni er laget for barn mellom 6 og 14 år. Yngre barn klarer seg fint med foreldrenes hjelp, eldre barn liker den enkle oversikten.",
        },
        {
          q: "Hva skjer hvis vi vil slutte?",
          a: "Du kan eksportere alt og slette familiekontoen i innstillinger. Personopplysninger slettes innen 30 dager. Du betaler ikke et øre for å gå.",
        },
      ],
    },
    finalCta: {
      titlePre: "Klar for ",
      titleEm: "kjøkkenbordfreden",
      titlePost: "?",
      body: "Last ned Kroni gratis. Sett opp første oppgave på under to minutter. Pause eller slutt når du vil.",
      talkFirst: "Snakk med oss først",
      ariaLabel: "Kom i gang",
    },
  },
  support: {
    eyebrow: "Støtte",
    title: "Vi er her — og vi svarer faktisk.",
    blurb: "Finn svar på det folk lurer mest på, eller skriv en linje til oss. Et menneske leser hver e-post.",
    cardEmail: "E-post",
    cardResponse: "Svartid",
    cardResponseValue: "Vi svarer innen 24 timer",
    cardLanguage: "Språk",
    cardLanguageValue: "Norsk og engelsk",
    tocLabel: "Tema",
    ctaTitle: "Fant ikke det du lette etter?",
    ctaBody: "Skriv til oss — så hjelper vi deg så raskt vi kan. Helst på norsk, men engelsk går også fint.",
    ctaButton: "Send e-post",
    sectionAria: "Vanlige spørsmål",
    groups: [
      {
        label: "Komme i gang",
        items: [
          {
            q: "Hvordan parer jeg barnets enhet?",
            a: "Etter at du har opprettet en barneprofil i foreldreappen, vises en paringskode på skjermen. Start Kroni på barnets enhet og tast inn koden. Paringen fullføres automatisk og barnet er klar til å bruke appen.",
          },
          {
            q: "Trenger barnet egen e-post?",
            a: "Nei. Barneprofilen opprettes av foreldrekontoen og krever bare et fornavn, fødselsår og avatar-valg. Barnet logger inn via foreldrenes paringskode, ikke e-post.",
          },
          {
            q: "Kan jeg sette opp oppgaver som gjentar seg?",
            a: "Ja, du kan opprette ukentlige eller daglige gjentagende oppgaver. Velg «Gjentagende» under opprettelse av oppgaven og velg frekvens. Oppgaven dukker automatisk opp i barnets liste til riktig tid.",
          },
        ],
      },
      {
        label: "Familie og barn",
        items: [
          {
            q: "Kan flere foreldre bruke samme konto?",
            a: "Ja. Du kan invitere en medforelder fra innstillingene i foreldreappen. Begge får full tilgang til å opprette oppgaver, godkjenne og justere ukepenger for alle barn i familien.",
          },
          {
            q: "Får barnet beskjed når en oppgave er godkjent?",
            a: "Ja. Barnet mottar et stille push-varsel på sin enhet med det samme du godkjenner eller avslår en oppgave. Varslinger kan skrus av i telefonens innstillinger om ønskelig.",
          },
          {
            q: "Hva gjør jeg hvis barnet har mistet tilgang til appen?",
            a: "Gå til barnets profil i foreldreappen og generer en ny paringskode under «Enheter». Installer Kroni på barnets nye eller tilbakestilte enhet og bruk den nye koden for å koble til igjen.",
          },
          {
            q: "Hvordan endrer jeg språk i appen?",
            a: "Kroni følger enhetens systemspråk automatisk. Endre telefonens systemspråk for å endre språket i appen.",
          },
        ],
      },
      {
        label: "Betaling",
        items: [
          {
            q: "Hvor mye koster Kroni?",
            a: `Gratisplanen dekker ett barn og fem aktive oppgaver. Familieplanen starter på ${monthlyPrice} ${CURRENCY} i måneden eller ${yearlyPrice} ${CURRENCY} per år, eller ${lifetimePrice} ${CURRENCY} som engangskjøp for livstid. Månedlig og årlig kommer med 7 dager gratis prøveperiode. Priser i ${CURRENCY}; din lokale valuta og skatt kan variere. Gjeldende priser vises i App Store eller Google Play.`,
          },
          {
            q: "Hvorfor koster Kroni penger?",
            a: "Vi har bestemt oss for å aldri spore barnet ditt eller selge data — derfor betaler familiene for utviklingen. Pengene går til drift, sikkerhet, personvern, native-språk og videre utvikling.",
          },
          {
            q: "Kan jeg endre ukepenger?",
            a: "Ja. Gå til barnets profil i foreldreappen, trykk på «Ukepenger» og juster beløpet. Endringen trer i kraft ved neste utbetalingsdato. Du kan også pause utbetalinger midlertidig.",
          },
          {
            q: "Kan jeg avbestille når som helst?",
            a: "Ja. Avbestilling skjer i innstillingene til App Store eller Google Play. Du beholder tilgang til betalt plan ut den perioden du allerede har betalt for.",
          },
        ],
      },
      {
        label: "Personvern",
        items: [
          {
            q: "Hva skjer hvis vi sletter kontoen?",
            a: "Alle data knyttet til kontoen — inkludert barneprofiler, oppgavehistorikk og belønninger — slettes permanent innen 30 dager. Denne handlingen kan ikke angres. Du kan eksportere data fra innstillinger før du sletter.",
          },
          {
            q: "Selger dere data om barna våre?",
            a: "Aldri. Kroni har ingen sporing for markedsføring, og vi selger ikke data til tredjepart. Det er ikke en del av forretningsmodellen og blir det aldri.",
          },
        ],
      },
    ],
  },
  policy: {
    sectionsTitle: "Innhold",
    updatedLabel: "Sist oppdatert",
    backToTop: "Til toppen",
    translationNotice:
      "Denne siden er oversatt fra norsk. Den norske versjonen er rettslig bindende. Det kan forekomme oversettelsesfeil — gi oss beskjed på support@kroni.no hvis du finner noen.",
  },
  pair: {
    metaTitle: "Åpne Kroni Familie",
    metaDescription:
      "Åpne Kroni-appen for å fullføre paringen av barnets enhet.",
    eyebrow: "Paring",
    title: "Åpne Kroni på barnets telefon",
    body: "Trykk på knappen for å åpne Kroni-appen og fullføre paringen automatisk. Hvis appen åpnet seg av seg selv da du trykket på lenken, kan du lukke denne fanen.",
    codeLabel: "Paringskode",
    openButton: "Åpne i Kroni-appen",
    notInstalled: "Har du ikke appen ennå?",
    appStore: "Last ned for iOS",
    playStore: "Last ned for Android",
    autoOpen:
      "Vi prøver å åpne appen automatisk om noen sekunder. Skjer ingenting? Trykk på knappen over.",
    helpLine: "Treng hjelp? Skriv til support@kroni.no.",
  },
};
