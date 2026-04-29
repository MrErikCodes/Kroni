import type { nb } from "./nb";

export const sv: typeof nb = {
  common: {
    currency: "kr",
    save32: "Spara 32%",
    oneTime: "Engångsköp",
    bestValue: "Bäst värde",
    lifetime: "Livstid",
    languageLabel: "Språk",
  },
  meta: {
    home: {
      title: "Kroni — Veckopeng och sysslor för familjer",
      description:
        "Veckopeng som lär barn att bemästra, inte att förvänta. Kroni hjälper familjer att bygga ansvar genom sysslor, veckopeng och belöningar.",
      og: "Veckopeng som lär barn att bemästra, inte att förvänta. Byggd i Norge.",
    },
    rootDescription:
      "Kroni hjälper familjer att lära sina barn att bemästra — genom sysslor, veckopeng och belöningar. Byggd i Norge.",
    support: {
      title: "Support och hjälp — Kroni",
      description:
        "Hitta svar på vanliga frågor om Kroni, eller kontakta oss på support@kroni.no.",
    },
    privacy: {
      title: "Integritetspolicy — Kroni",
      description:
        "Hur Nilsen Konsult samlar in, använder, delar och skyddar personuppgifter om föräldrar och barn som använder Kroni.",
    },
    terms: {
      title: "Användarvillkor — Kroni",
      description:
        "Villkoren för Kroni-appen och familjeabonnemanget — skrivna för att vara läsbara, men juridiskt korrekta enligt norsk konsumenträtt.",
    },
  },
  header: {
    home: "Hem",
    privacy: "Integritet",
    terms: "Villkor",
    support: "Support",
    nav: "Webbplatsnavigering",
    homeAria: "Kroni — hem",
    languageMenu: "Välj språk",
  },
  footer: {
    tagline: "Veckopeng som lär barn att bemästra, inte att förvänta.",
    blurb: "Byggd för familjer. Inga riktiga pengar, ingen reklam, full kontroll.",
    productHeading: "Produkt",
    companyHeading: "Företag",
    home: "Hem",
    support: "Support",
    privacy: "Integritet",
    terms: "Villkor",
    copyright: "© 2026 Nilsen Konsult. Alla rättigheter förbehållna.",
    madeIn: "Byggd i Oslo med kaffe och två barn under bordet.",
  },
  home: {
    badge: "Lanserad i Norden · våren 2026",
    heroTitlePre: "Veckopeng som lär barn att ",
    heroTitleEm: "bemästra",
    heroTitlePost: ", inte att förvänta.",
    heroBody:
      "Kroni är den lilla familjeappen för sysslor, veckopeng och belöningar som faktiskt passar vardagen. Byggd i Norge, för ditt köksbord.",
    ctaIos: "Ladda ner till iOS",
    ctaAndroid: "Ladda ner till Android",
    ctaIosAria: "Ladda ner Kroni för iOS",
    ctaAndroidAria: "Ladda ner Kroni för Android",
    heroFinePrint: "Gratis att börja · Ingen reklam · Aldrig några riktiga pengar på kontot",
    phoneCaption: "Så här ser barnets app ut. Ingen reklam, inget krimskrams.",
    trust: ["Byggd i Norge", "GDPR-vänlig", "Inga riktiga pengar", "För barn 6–14 år"],
    howWorks: {
      eyebrow: "Så fungerar det",
      title: "Tre steg från rörigt kök till lugn.",
      steps: [
        {
          n: "01",
          t: "Du skapar sysslorna",
          d: "«Städa rummet», «ta ut soporna», «öva 20 min på piano». Sätt belopp och frekvens en gång — Kroni upprepar resten.",
        },
        {
          n: "02",
          t: "Barnet bockar av",
          d: "När en syssla är klar trycker barnet på sin enkla «Idag»-lista. Du får en tyst notis — inget tjat, inga sirener.",
        },
        {
          n: "03",
          t: "Du godkänner — och kronorna trillar in",
          d: "Ett tryck, och saldot växer. Barnen ser framstegen. Du ser att något faktiskt blev gjort. Helgen blir lite lugnare.",
        },
      ],
    },
    features: [
      {
        eyebrow: "Veckopeng",
        title: "Veckopeng som faktiskt är pedagogisk.",
        body: "Du bestämmer beloppet. Måndag morgon landar det på barnets saldo — utan påminnelser, utan bråk. Pausa under semestern, justera när lönen ändras.",
        side: "right",
      },
      {
        eyebrow: "Belöningar",
        title: "Belöningar som betyder något för familjen.",
        body: "Skärmtid, biokvällar, en helg utan disk — du bestämmer vad som är värt något i ert hem. Barnen sparar mot ett mål de själva valt.",
        side: "left",
      },
      {
        eyebrow: "Tryggt",
        title: "Tryggt för hela familjen.",
        body: "Inga riktiga pengar flödar. Ingen reklam. Inga köp i appen. Barnets profil ser bara det den ska se. Du har full kontroll, hela tiden.",
        side: "right",
      },
    ],
    twoSides: {
      eyebrow: "Två sidor, samma lag",
      title: "Olika appar — samma familj.",
      parentEyebrow: "För dig som förälder",
      parentTitle: "Mindre planering, mer vardag.",
      parentPoints: [
        "Skapa sysslor på sekunder — återkommande eller engångs.",
        "Godkänn med ett tryck när jobbet är gjort.",
        "Sätt veckobelopp och pausa när det behövs.",
        "Se historik och utveckling per barn, samlat på ett ställe.",
      ],
      kidEyebrow: "För barnet",
      kidTitle: "En lista. Ett mål. Inget krångel.",
      kidPoints: [
        "En enkel «Idag»-lista — inga förvirrande menyer.",
        "Saldot växer när du gör jobbet.",
        "Välj belöningar du faktiskt vill ha.",
        "Aldrig reklam. Aldrig köp i appen.",
      ],
    },
    pricing: {
      eyebrow: "Priser",
      title: "Börja gratis. Uppgradera när familjen växer.",
      free: {
        label: "Gratis",
        price: "0",
        period: "För alltid",
        items: ["1 barn", "5 aktiva sysslor", "Veckopeng"],
      },
      monthly: {
        label: "Familj",
        price: "49",
        period: "per månad · 7 dagar gratis",
        items: ["Obegränsat antal barn", "Obegränsat med sysslor", "Belöningar och mål"],
      },
      yearly: {
        label: "Familj år",
        price: "399",
        period: "per år · 7 dagar gratis",
        items: ["Allt i Familj", "Prioriterad support", "Tidig tillgång till nytt"],
      },
      lifetime: {
        label: "Livstid",
        price: "1 200",
        period: "en gång, för alltid",
        items: ["Allt i Familj", "Ingen förnyelse", "Framtida funktioner ingår"],
      },
      footnote:
        "Månadsvis och årligen startar med 7 dagar gratis. Betalning hanteras av App Store eller Google Play. Inga dolda avgifter. Avsluta när du vill.",
    },
    faq: {
      eyebrow: "Frågor",
      title: "Det föräldrar undrar först.",
      blurb: "Hittar du inte svaret? Vi svarar varje mejl personligen, oftast samma dag.",
      seeAll: "Se alla frågor",
      items: [
        {
          q: "Vad kostar Kroni?",
          a: "Gratisplanen täcker ett barn och fem aktiva sysslor. Familjeplanen startar på 49 kr per månad eller 399 kr per år (du sparar 32%), eller 1 200 kr som engångsköp för livstid. Månads- och årsplanen kommer med 7 dagars gratis provperiod.",
        },
        {
          q: "Varför kostar Kroni pengar?",
          a: "För att vi aldrig kommer att sälja reklam, spåra ditt barn eller sälja vidare data — det är hela poängen. Det betyder att familjerna som använder appen, inte annonsörer, betalar för utvecklingen. Pengarna går till drift, säkerhet, integritet, modersmålsöversättning och fortsatt utveckling. En liten, ärlig app som du kan lita på kostar lite — men aldrig ditt barns uppmärksamhet.",
        },
        {
          q: "Är riktiga pengar inblandade?",
          a: "Nej. Saldot i Kroni är en virtuell räknare. Du som förälder bestämmer hur det löses in — kontant, Swish eller belöningar som skärmtid och biokvällar.",
        },
        {
          q: "Vilken ålder passar Kroni för?",
          a: "Kroni är byggd för barn mellan 6 och 14 år. Yngre barn klarar sig fint med föräldrarnas hjälp, äldre barn gillar den enkla översikten.",
        },
        {
          q: "Vad händer om vi vill sluta?",
          a: "Du kan exportera allt och radera familjekontot i inställningar. Personuppgifter raderas inom 30 dagar. Det kostar inget att gå.",
        },
      ],
    },
    finalCta: {
      titlePre: "Redo för ",
      titleEm: "köksbordsfreden",
      titlePost: "?",
      body: "Ladda ner Kroni gratis. Skapa din första syssla på under två minuter. Pausa eller avsluta när du vill.",
      talkFirst: "Prata med oss först",
      ariaLabel: "Kom igång",
    },
  },
  support: {
    eyebrow: "Support",
    title: "Vi finns här — och vi svarar faktiskt.",
    blurb: "Hitta svar på det folk undrar mest, eller skriv en rad till oss. En människa läser varje mejl.",
    cardEmail: "E-post",
    cardResponse: "Svarstid",
    cardResponseValue: "Vi svarar inom 24 timmar",
    cardLanguage: "Språk",
    cardLanguageValue: "Svenska och engelska",
    tocLabel: "Tema",
    ctaTitle: "Hittade du inte det du letade efter?",
    ctaBody: "Skriv till oss — så hjälper vi dig så snabbt vi kan. Helst på svenska, men engelska går också bra.",
    ctaButton: "Skicka e-post",
    sectionAria: "Vanliga frågor",
    groups: [
      {
        label: "Komma igång",
        items: [
          {
            q: "Hur parkopplar jag barnets enhet?",
            a: "När du har skapat en barnprofil i föräldraappen visas en parkopplingskod på skärmen. Starta Kroni på barnets enhet och skriv in koden. Parkopplingen slutförs automatiskt och barnet är redo att använda appen.",
          },
          {
            q: "Behöver barnet en egen e-post?",
            a: "Nej. Barnprofilen skapas av föräldrakontot och behöver bara ett förnamn, födelseår och avatar-val. Barnet loggar in via föräldrarnas parkopplingskod, inte e-post.",
          },
          {
            q: "Kan jag skapa sysslor som upprepas?",
            a: "Ja, du kan skapa veckovisa eller dagliga återkommande sysslor. Välj «Återkommande» under skapandet och välj frekvens. Sysslan dyker upp automatiskt i barnets lista vid rätt tid.",
          },
        ],
      },
      {
        label: "Familj och barn",
        items: [
          {
            q: "Kan flera föräldrar dela samma konto?",
            a: "Ja. Du kan bjuda in en medförälder från inställningarna i föräldraappen. Båda får full tillgång att skapa sysslor, godkänna och justera veckopeng för alla barn i familjen.",
          },
          {
            q: "Får barnet besked när en syssla godkänns?",
            a: "Ja. Barnet får en tyst push-notis på sin enhet i samma sekund som du godkänner eller avvisar en syssla. Notiser kan stängas av i telefonens inställningar.",
          },
          {
            q: "Vad gör jag om barnet förlorat åtkomst till appen?",
            a: "Gå till barnets profil i föräldraappen och generera en ny parkopplingskod under «Enheter». Installera Kroni på barnets nya eller återställda enhet och använd den nya koden för att koppla samman igen.",
          },
          {
            q: "Hur byter jag språk i appen?",
            a: "Kroni följer enhetens systemspråk automatiskt. Ändra telefonens systemspråk för att ändra appens språk.",
          },
        ],
      },
      {
        label: "Betalning",
        items: [
          {
            q: "Vad kostar Kroni?",
            a: "Gratisplanen täcker ett barn och fem aktiva sysslor. Familjeplanen startar på 49 kr per månad eller 399 kr per år, eller 1 200 kr som engångsköp för livstid. Månads- och årsplan kommer med 7 dagars gratis provperiod. Aktuella priser visas i App Store eller Google Play.",
          },
          {
            q: "Varför kostar Kroni pengar?",
            a: "Vi har bestämt oss för att aldrig visa reklam, spåra ditt barn eller sälja data — därför betalar familjerna för utvecklingen i stället för annonsörer. Pengarna går till drift, säkerhet, integritet, modersmålsöversättning och fortsatt utveckling.",
          },
          {
            q: "Kan jag ändra veckopeng?",
            a: "Ja. Gå till barnets profil i föräldraappen, tryck på «Veckopeng» och justera beloppet. Ändringen träder i kraft vid nästa utbetalningsdatum. Du kan också pausa utbetalningar tillfälligt.",
          },
          {
            q: "Kan jag avsluta när som helst?",
            a: "Ja. Avslutet sker i App Store eller Google Plays inställningar. Du behåller åtkomst till den betalda planen ut den period du redan har betalat för.",
          },
        ],
      },
      {
        label: "Integritet",
        items: [
          {
            q: "Vad händer om vi raderar kontot?",
            a: "Alla data kopplade till kontot — inklusive barnprofiler, syssel-historik och belöningar — raderas permanent inom 30 dagar. Åtgärden kan inte ångras. Du kan exportera data från inställningar innan du raderar.",
          },
          {
            q: "Säljer ni data om våra barn?",
            a: "Aldrig. Kroni har ingen reklam, ingen spårning för marknadsföring och vi säljer inga data till tredje part. Det är inte en del av affärsmodellen och kommer aldrig att bli det.",
          },
        ],
      },
    ],
  },
  policy: {
    sectionsTitle: "Innehåll",
    updatedLabel: "Senast uppdaterad",
    backToTop: "Tillbaka till toppen",
    translationNotice:
      "Den här sidan är översatt från norska. Den norska versionen är juridiskt bindande. Översättningsfel kan förekomma — meddela oss på support@kroni.no om du hittar några.",
  },
};
