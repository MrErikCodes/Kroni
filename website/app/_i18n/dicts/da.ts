import type { nb } from "./nb";

export const da: typeof nb = {
  common: {
    currency: "kr",
    save32: "Spar 32%",
    oneTime: "Engangskøb",
    bestValue: "Bedste værdi",
    lifetime: "Livstid",
    languageLabel: "Sprog",
  },
  meta: {
    home: {
      title: "Kroni — Lommepenge og opgaver til familier",
      description:
        "Lommepenge der lærer børn at mestre, ikke at forvente. Kroni hjælper familier med at opbygge ansvar gennem opgaver, lommepenge og belønninger.",
      og: "Lommepenge der lærer børn at mestre, ikke at forvente. Bygget i Norge.",
    },
    rootDescription:
      "Kroni hjælper familier med at lære børn at mestre — gennem opgaver, lommepenge og belønninger. Bygget i Norge.",
    support: {
      title: "Support og hjælp — Kroni",
      description:
        "Find svar på almindelige spørgsmål om Kroni, eller kontakt os på support@kroni.no.",
    },
    privacy: {
      title: "Privatlivspolitik — Kroni",
      description:
        "Hvordan Nilsen Konsult indsamler, bruger, deler og beskytter personoplysninger om forældre og børn, der bruger Kroni.",
    },
    terms: {
      title: "Brugsvilkår — Kroni",
      description:
        "Vilkår for brug af Kroni-appen og familieabonnementet — skrevet for at være forståelige, men juridisk dækkende efter norsk forbrugerret.",
    },
  },
  header: {
    home: "Hjem",
    privacy: "Privatliv",
    terms: "Vilkår",
    support: "Support",
    nav: "Sidenavigation",
    homeAria: "Kroni — hjem",
    languageMenu: "Vælg sprog",
  },
  footer: {
    tagline: "Lommepenge der lærer børn at mestre, ikke at forvente.",
    blurb: "Bygget til familier. Ingen rigtige penge, ingen reklamer, fuld kontrol.",
    productHeading: "Produkt",
    companyHeading: "Selskab",
    home: "Hjem",
    support: "Support",
    privacy: "Privatliv",
    terms: "Vilkår",
    copyright: "© 2026 Nilsen Konsult. Alle rettigheder forbeholdes.",
    madeIn: "Lavet i Oslo med kaffe og to børn under bordet.",
  },
  home: {
    badge: "Lanceret i Norden · foråret 2026",
    heroTitlePre: "Lommepenge der lærer børn at ",
    heroTitleEm: "mestre",
    heroTitlePost: ", ikke at forvente.",
    heroBody:
      "Kroni er den lille familieapp til opgaver, lommepenge og belønninger, der faktisk passer til hverdagen. Bygget i Norge, til dit køkkenbord.",
    ctaIos: "Hent til iOS",
    ctaAndroid: "Hent til Android",
    ctaIosAria: "Hent Kroni til iOS",
    ctaAndroidAria: "Hent Kroni til Android",
    heroFinePrint: "Gratis at starte · Ingen reklamer · Aldrig rigtige penge på kontoen",
    phoneCaption: "Sådan ser barnets app ud. Ingen reklamer, intet pjat.",
    trust: ["Bygget i Norge", "GDPR-venlig", "Ingen rigtige penge", "Til børn 6–14 år"],
    howWorks: {
      eyebrow: "Sådan fungerer det",
      title: "Tre trin fra rodet køkken til ro.",
      steps: [
        {
          n: "01",
          t: "Du laver opgaverne",
          d: "«Ryd værelset», «smid skraldet ud», «øv 20 min på klaver». Sæt beløb og hyppighed én gang — Kroni gentager resten.",
        },
        {
          n: "02",
          t: "Barnet sætter flueben",
          d: "Når en opgave er klar, trykker barnet på sin enkle «I dag»-liste. Du får en stille notifikation — ingen brokken, ingen sirener.",
        },
        {
          n: "03",
          t: "Du godkender — og kronerne tikker ind",
          d: "Et tryk, og saldoen vokser. Børnene ser fremgangen. Du ser at noget faktisk blev gjort. Weekenden bliver lidt roligere.",
        },
      ],
    },
    features: [
      {
        eyebrow: "Lommepenge",
        title: "Lommepenge der faktisk er pædagogiske.",
        body: "Du bestemmer beløbet. Mandag morgen lander det på barnets saldo — uden påmindelser, uden skænderier. Pause når familien er på ferie, juster når lønnen ændres.",
        side: "right",
      },
      {
        eyebrow: "Belønninger",
        title: "Belønninger der betyder noget for familien.",
        body: "Skærmtid, biografaftener, en weekend uden opvask — du bestemmer hvad der er værd noget i jeres hjem. Børnene sparer mod et mål, de selv har valgt.",
        side: "left",
      },
      {
        eyebrow: "Trygt",
        title: "Trygt for hele familien.",
        body: "Ingen rigtige penge flyder. Ingen reklamer. Ingen køb i appen. Barneprofilen ser kun det, den skal se. Du har fuld kontrol, hele tiden.",
        side: "right",
      },
    ],
    twoSides: {
      eyebrow: "To sider, samme hold",
      title: "Forskellig app — samme familie.",
      parentEyebrow: "Til dig som forælder",
      parentTitle: "Mindre planlægning, mere hverdag.",
      parentPoints: [
        "Lav opgaver på sekunder — tilbagevendende eller engangs.",
        "Godkend med ét tryk når opgaven er klar.",
        "Sæt ugentligt beløb og pause når der er behov.",
        "Se historik og fremgang per barn, samlet ét sted.",
      ],
      kidEyebrow: "Til barnet",
      kidTitle: "Én liste. Ét mål. Intet pjat.",
      kidPoints: [
        "En enkel «I dag»-liste — ingen forvirrende menuer.",
        "Saldoen vokser når du gør arbejdet.",
        "Vælg belønninger du faktisk vil have.",
        "Aldrig reklamer. Aldrig køb i appen.",
      ],
    },
    pricing: {
      eyebrow: "Priser",
      title: "Start gratis. Opgrader når familien vokser.",
      free: {
        label: "Gratis",
        price: "0",
        period: "For altid",
        items: ["1 barn", "5 aktive opgaver", "Lommepenge"],
      },
      monthly: {
        label: "Familie",
        price: "49",
        period: "pr. måned · 7 dage gratis",
        items: ["Ubegrænset antal børn", "Ubegrænsede opgaver", "Belønninger og mål"],
      },
      yearly: {
        label: "Familie årlig",
        price: "399",
        period: "pr. år · 7 dage gratis",
        items: ["Alt i Familie", "Prioriteret support", "Tidlig adgang til nyt"],
      },
      lifetime: {
        label: "Livstid",
        price: "1 200",
        period: "én gang, for altid",
        items: ["Alt i Familie", "Ingen fornyelse", "Fremtidige funktioner inkluderet"],
      },
      footnote:
        "Månedlig og årlig starter med 7 dage gratis. Betaling håndteres af App Store eller Google Play. Ingen skjulte gebyrer. Afmeld når du vil.",
    },
    faq: {
      eyebrow: "Spørgsmål",
      title: "Det forældre spørger om først.",
      blurb: "Finder du ikke svaret? Vi svarer hver e-mail personligt, oftest samme dag.",
      seeAll: "Se alle spørgsmål",
      items: [
        {
          q: "Hvad koster Kroni?",
          a: "Gratisplanen dækker ét barn og fem aktive opgaver. Familieplanen starter på 49 kr om måneden eller 399 kr om året (du sparer 32%), eller 1 200 kr som engangskøb for livstid. Månedlig og årlig kommer med 7 dages gratis prøveperiode.",
        },
        {
          q: "Hvorfor koster Kroni penge?",
          a: "Fordi vi aldrig kommer til at sælge reklamer, spore dit barn eller sælge data videre — det er hele pointen. Det betyder at familierne der bruger appen, ikke annoncører, betaler for udviklingen. Pengene går til drift, sikkerhed, privatliv, modersmålsoversættelse og fortsat udvikling. En lille, ærlig app du kan stole på, koster lidt — men aldrig dit barns opmærksomhed.",
        },
        {
          q: "Er der rigtige penge involveret?",
          a: "Nej. Saldoen i Kroni er en virtuel tæller. Du som forælder bestemmer hvordan den indløses — kontant, MobilePay eller belønninger som skærmtid og biografaftener.",
        },
        {
          q: "Hvilken alder passer Kroni til?",
          a: "Kroni er lavet til børn mellem 6 og 14 år. Yngre børn klarer sig fint med forældrenes hjælp, ældre børn nyder det enkle overblik.",
        },
        {
          q: "Hvad sker der hvis vi vil stoppe?",
          a: "Du kan eksportere alt og slette familiekontoen i indstillinger. Personoplysninger slettes inden for 30 dage. Det koster ikke en krone at gå.",
        },
      ],
    },
    finalCta: {
      titlePre: "Klar til ",
      titleEm: "køkkenbordsfreden",
      titlePost: "?",
      body: "Hent Kroni gratis. Sæt din første opgave op på under to minutter. Pause eller stop når du vil.",
      talkFirst: "Tal med os først",
      ariaLabel: "Kom i gang",
    },
  },
  support: {
    eyebrow: "Support",
    title: "Vi er her — og vi svarer faktisk.",
    blurb: "Find svar på det folk spørger mest om, eller skriv en linje til os. Et menneske læser hver e-mail.",
    cardEmail: "E-mail",
    cardResponse: "Svartid",
    cardResponseValue: "Vi svarer inden for 24 timer",
    cardLanguage: "Sprog",
    cardLanguageValue: "Dansk og engelsk",
    tocLabel: "Emne",
    ctaTitle: "Fandt du ikke det du ledte efter?",
    ctaBody: "Skriv til os — så hjælper vi så hurtigt vi kan. Helst på dansk, men engelsk går også fint.",
    ctaButton: "Send e-mail",
    sectionAria: "Ofte stillede spørgsmål",
    groups: [
      {
        label: "Kom i gang",
        items: [
          {
            q: "Hvordan parrer jeg barnets enhed?",
            a: "Når du har oprettet en barneprofil i forældreappen, vises en parringskode på skærmen. Start Kroni på barnets enhed og indtast koden. Parringen fuldføres automatisk og barnet er klar til at bruge appen.",
          },
          {
            q: "Skal barnet have sin egen e-mail?",
            a: "Nej. Barneprofilen oprettes af forældrekontoen og kræver kun et fornavn, fødselsår og avatar-valg. Barnet logger ind via forældrenes parringskode, ikke e-mail.",
          },
          {
            q: "Kan jeg lave opgaver der gentages?",
            a: "Ja, du kan oprette ugentlige eller daglige tilbagevendende opgaver. Vælg «Tilbagevendende» under oprettelse af opgaven og vælg frekvens. Opgaven dukker automatisk op i barnets liste på det rigtige tidspunkt.",
          },
        ],
      },
      {
        label: "Familie og børn",
        items: [
          {
            q: "Kan flere forældre bruge samme konto?",
            a: "Ja. Du kan invitere en medforælder fra indstillingerne i forældreappen. Begge får fuld adgang til at oprette opgaver, godkende og justere lommepenge for alle børn i familien.",
          },
          {
            q: "Får barnet besked når en opgave er godkendt?",
            a: "Ja. Barnet modtager en stille push-notifikation på sin enhed med det samme du godkender eller afviser en opgave. Notifikationer kan slås fra i telefonens indstillinger.",
          },
          {
            q: "Hvad gør jeg hvis barnet har mistet adgang til appen?",
            a: "Gå til barnets profil i forældreappen og generer en ny parringskode under «Enheder». Installer Kroni på barnets nye eller nulstillede enhed og brug den nye kode for at koble til igen.",
          },
          {
            q: "Hvordan ændrer jeg sprog i appen?",
            a: "Kroni følger enhedens systemsprog automatisk. Skift telefonens systemsprog for at skifte appens sprog.",
          },
        ],
      },
      {
        label: "Betaling",
        items: [
          {
            q: "Hvad koster Kroni?",
            a: "Gratisplanen dækker ét barn og fem aktive opgaver. Familieplanen starter på 49 kr om måneden eller 399 kr om året, eller 1 200 kr som engangskøb for livstid. Månedlig og årlig kommer med 7 dages gratis prøveperiode. Aktuelle priser vises i App Store eller Google Play.",
          },
          {
            q: "Hvorfor koster Kroni penge?",
            a: "Vi har besluttet aldrig at vise reklamer, spore dit barn eller sælge data — derfor må familierne betale for udviklingen i stedet for annoncører. Pengene går til drift, sikkerhed, privatliv, modersmålsoversættelse og fortsat udvikling.",
          },
          {
            q: "Kan jeg ændre lommepengene?",
            a: "Ja. Gå til barnets profil i forældreappen, tryk på «Lommepenge» og juster beløbet. Ændringen træder i kraft ved næste udbetalingsdato. Du kan også pause udbetalinger midlertidigt.",
          },
          {
            q: "Kan jeg afmelde når som helst?",
            a: "Ja. Afmelding sker i indstillingerne i App Store eller Google Play. Du beholder adgang til den betalte plan ud den periode du allerede har betalt for.",
          },
        ],
      },
      {
        label: "Privatliv",
        items: [
          {
            q: "Hvad sker der hvis vi sletter kontoen?",
            a: "Alle data tilknyttet kontoen — inklusive barneprofiler, opgavehistorik og belønninger — slettes permanent inden for 30 dage. Handlingen kan ikke fortrydes. Du kan eksportere data fra indstillinger inden du sletter.",
          },
          {
            q: "Sælger I data om vores børn?",
            a: "Aldrig. Kroni har ingen reklamer, ingen sporing til markedsføring, og vi sælger ikke data til tredjepart. Det er ikke en del af forretningsmodellen og bliver det aldrig.",
          },
        ],
      },
    ],
  },
  policy: {
    sectionsTitle: "Indhold",
    updatedLabel: "Sidst opdateret",
    backToTop: "Tilbage til toppen",
    translationNotice:
      "Denne side er oversat fra norsk. Den norske version er den juridisk bindende. Oversættelsesfejl kan forekomme — giv os besked på support@kroni.no hvis du finder nogen.",
  },
  pair: {
    metaTitle: "Åbn Kroni Familie",
    metaDescription:
      "Åbn Kroni-appen for at færdiggøre parringen af barnets enhed.",
    eyebrow: "Parring",
    title: "Åbn Kroni på barnets telefon",
    body: "Tryk på knappen for at åbne Kroni-appen og færdiggøre parringen automatisk. Hvis appen åbnede af sig selv da du trykkede på linket, kan du lukke denne fane.",
    codeLabel: "Parringskode",
    openButton: "Åbn i Kroni-appen",
    notInstalled: "Har du ikke appen endnu?",
    appStore: "Download til iOS",
    playStore: "Download til Android",
    autoOpen:
      "Vi forsøger at åbne appen automatisk om få sekunder. Sker der ingenting? Tryk på knappen ovenfor.",
    helpLine: "Brug for hjælp? Skriv til support@kroni.no.",
  },
};
