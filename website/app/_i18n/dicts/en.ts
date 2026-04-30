import type { nb } from "./nb";
import {
  CURRENCY,
  prices,
  formatPrice,
  yearlySavingsPercent,
} from "../../_config/pricing";

const monthlyPrice = formatPrice(prices.monthly, "en");
const yearlyPrice = formatPrice(prices.yearly, "en");
const lifetimePrice = formatPrice(prices.lifetime, "en");

export const en: typeof nb = {
  common: {
    currency: CURRENCY,
    save32: `Save ${yearlySavingsPercent}%`,
    oneTime: "One-time",
    bestValue: "Best value",
    lifetime: "Lifetime",
    languageLabel: "Language",
  },
  meta: {
    home: {
      title: "Kroni — Allowance and chores for families",
      description:
        "Pocket money that teaches kids to master, not to expect. Kroni helps families build responsibility through chores, allowance and rewards.",
      og: "Pocket money that teaches kids to master, not to expect. Built in Norway.",
    },
    rootDescription:
      "Kroni helps families teach their kids to master — through chores, allowance and rewards. Built in Norway.",
    support: {
      title: "Support and help — Kroni",
      description:
        "Find answers to common questions about Kroni, or get in touch at support@kroni.no.",
    },
    privacy: {
      title: "Privacy policy — Kroni",
      description:
        "How Nilsen Konsult collects, uses, shares and protects personal data about parents and children using Kroni.",
    },
    terms: {
      title: "Terms of use — Kroni",
      description:
        "Terms of use for the Kroni app and the family subscription — written to be readable, but legally accurate under Norwegian consumer law.",
    },
  },
  header: {
    home: "Home",
    privacy: "Privacy",
    terms: "Terms",
    support: "Support",
    nav: "Site navigation",
    homeAria: "Kroni — home",
    languageMenu: "Choose language",
  },
  footer: {
    tagline: "Pocket money that teaches kids to master, not to expect.",
    blurb: "Built for families. No real money, full control.",
    productHeading: "Product",
    companyHeading: "Company",
    home: "Home",
    support: "Support",
    privacy: "Privacy",
    terms: "Terms",
    copyright: "© 2026 Nilsen Konsult. All rights reserved.",
  },
  home: {
    badge: "Launched in Norway · spring 2026",
    heroTitlePre: "Pocket money that teaches kids to ",
    heroTitleEm: "master",
    heroTitlePost: ", not to expect.",
    heroBody:
      "Kroni is the small family app for chores, allowance and rewards that actually fits real life. Built in Norway, for your kitchen table.",
    ctaIos: "Download for iOS",
    ctaAndroid: "Download for Android",
    ctaIosAria: "Download Kroni for iOS",
    ctaAndroidAria: "Download Kroni for Android",
    heroFinePrint: "Free to start · Never any real money in the account · Full parental control",
    phoneCaption: "The kid app, exactly as built. No clutter, just the essentials.",
    trust: ["Built in Norway", "GDPR-friendly", "No real money", "For ages 6–14"],
    howWorks: {
      eyebrow: "How it works",
      title: "Three steps from chaos to calm.",
      steps: [
        {
          n: "01",
          t: "You create the chores",
          d: "\"Tidy the room\", \"take out the trash\", \"practice piano 20 min\". Set the amount and frequency once — Kroni repeats the rest.",
        },
        {
          n: "02",
          t: "Your kid checks them off",
          d: "When a chore is done, the kid taps it on their simple Today list. You get a quiet notification — no nagging, no sirens.",
        },
        {
          n: "03",
          t: "You approve — the kroner roll in",
          d: "One tap, and the balance grows. Kids see the progress. You see something actually happened. Sundays get a little quieter.",
        },
      ],
    },
    features: [
      {
        eyebrow: "Allowance",
        title: "Weekly allowance that actually teaches.",
        body: "You set the amount. Monday morning it lands in your child's balance — no reminders, no arguments. Pause when you're on holiday, adjust when life changes.",
        side: "right",
      },
      {
        eyebrow: "Rewards",
        title: "Rewards that mean something to your family.",
        body: "Screen time, movie nights, a weekend off dishes — you decide what's worth saving for. Kids work toward a goal they chose themselves.",
        side: "left",
      },
      {
        eyebrow: "Safe",
        title: "Safe for the whole family.",
        body: "No real money moves. No in-app purchases. The kid profile only sees what it should. You stay in control, all the time.",
        side: "right",
      },
    ],
    twoSides: {
      eyebrow: "Two sides, same team",
      title: "Different app — same family.",
      parentEyebrow: "For you, the parent",
      parentTitle: "Less planning, more living.",
      parentPoints: [
        "Create chores in seconds — recurring or one-off.",
        "Approve with a single tap when work is done.",
        "Set a weekly amount and pause whenever you need.",
        "See history and progress per child, in one place.",
      ],
      kidEyebrow: "For your kid",
      kidTitle: "One list. One goal. No nonsense.",
      kidPoints: [
        "A simple \"Today\" list — no confusing menus.",
        "Your balance grows when you do the work.",
        "Pick rewards you actually want.",
        "No in-app purchases. No surprises.",
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Start free. Upgrade when the family grows.",
      free: {
        label: "Free",
        price: "0",
        period: "Forever",
        items: ["1 child", "5 active chores", "Weekly allowance"],
      },
      monthly: {
        label: "Family",
        price: monthlyPrice,
        period: "per month · 7 days free",
        items: ["Unlimited children", "Unlimited chores", "Rewards and goals"],
      },
      yearly: {
        label: "Family yearly",
        price: yearlyPrice,
        period: "per year · 7 days free",
        items: ["Everything in Family", "Priority support", "Early access to new things"],
      },
      lifetime: {
        label: "Lifetime",
        price: lifetimePrice,
        period: "pay once, keep forever",
        items: ["Everything in Family", "No renewals", "Future features included"],
      },
      footnote:
        "Monthly and yearly start with 7 days free. Billing handled by App Store or Google Play. No hidden fees. Cancel any time. Prices in NOK; your local currency and tax may vary at checkout.",
    },
    faq: {
      eyebrow: "Questions",
      title: "What parents wonder first.",
      blurb: "Can't find your answer? We reply to every email personally, usually the same day.",
      seeAll: "See all questions",
      items: [
        {
          q: "How much does Kroni cost?",
          a: `The free plan covers one child and five active chores. Family plans start from ${monthlyPrice} ${CURRENCY} per month or ${yearlyPrice} ${CURRENCY} per year (save ${yearlySavingsPercent}%), or a one-time ${lifetimePrice} ${CURRENCY} for lifetime access. Monthly and yearly include a 7-day free trial. Prices in ${CURRENCY}; your local currency and tax may vary at checkout.`,
        },
        {
          q: "Why does Kroni cost money?",
          a: "Because we will never track your child or sell data on — that's the whole point. So the families who use the app pay for it being built. The money goes to hosting, security, privacy, native-language work and continued development. A small, honest app you can trust costs a little — but it will never cost your child's attention.",
        },
        {
          q: "Is real money involved?",
          a: "No. The balance in Kroni is a virtual counter. You as a parent decide how it gets paid out — cash, Vipps or rewards like screen time and movie nights.",
        },
        {
          q: "What ages is Kroni for?",
          a: "Kroni is built for kids aged 6 to 14. Younger children manage with parental help, older kids enjoy the calm overview.",
        },
        {
          q: "What happens if we want to stop?",
          a: "Export everything and delete the family account in Settings. Personal data is deleted within 30 days. There is never a fee to leave.",
        },
      ],
    },
    finalCta: {
      titlePre: "Ready for ",
      titleEm: "kitchen-table calm",
      titlePost: "?",
      body: "Download Kroni free. Set up your first chore in under two minutes. Pause or quit any time.",
      talkFirst: "Talk to us first",
      ariaLabel: "Get started",
    },
  },
  support: {
    eyebrow: "Support",
    title: "We're here — and we actually reply.",
    blurb: "Find answers to what people ask most, or drop us a line. A real person reads every email.",
    cardEmail: "Email",
    cardResponse: "Response time",
    cardResponseValue: "We reply within 24 hours",
    cardLanguage: "Language",
    cardLanguageValue: "Norwegian and English",
    tocLabel: "Topic",
    ctaTitle: "Didn't find what you were looking for?",
    ctaBody: "Write to us — we'll help as fast as we can. Norwegian preferred, but English is also fine.",
    ctaButton: "Send email",
    sectionAria: "Frequently asked questions",
    groups: [
      {
        label: "Getting started",
        items: [
          {
            q: "How do I pair my child's device?",
            a: "Once you've created a child profile in the parent app, a pairing code shows on screen. Open Kroni on the child's device and enter the code. Pairing completes automatically and the child is ready to go.",
          },
          {
            q: "Does the child need their own email?",
            a: "No. The child profile is created from the parent account and only needs a first name, year of birth and avatar choice. The child logs in via the pairing code, not email.",
          },
          {
            q: "Can I set up chores that repeat?",
            a: "Yes. Create weekly or daily recurring chores by selecting \"Recurring\" when adding the chore and choosing a frequency. The chore appears in the child's list at the right time.",
          },
        ],
      },
      {
        label: "Family and kids",
        items: [
          {
            q: "Can multiple parents use the same account?",
            a: "Yes. Invite a co-parent from the settings of the parent app. Both get full access to create chores, approve, and adjust allowance for all children in the family.",
          },
          {
            q: "Does the child get notified when a chore is approved?",
            a: "Yes. The child receives a quiet push notification the moment you approve or decline a chore. Notifications can be turned off in the phone's settings.",
          },
          {
            q: "What if my child loses access to the app?",
            a: "Open the child's profile in the parent app and generate a new pairing code under \"Devices\". Install Kroni on the new or reset device and use the new code to reconnect.",
          },
          {
            q: "How do I change the app's language?",
            a: "Kroni follows the device's system language automatically. Change the phone's system language to change the app's language.",
          },
        ],
      },
      {
        label: "Billing",
        items: [
          {
            q: "How much does Kroni cost?",
            a: `The free plan covers one child and five active chores. Family plans start from ${monthlyPrice} ${CURRENCY} per month or ${yearlyPrice} ${CURRENCY} per year, or a one-time ${lifetimePrice} ${CURRENCY} for lifetime access. Monthly and yearly come with a 7-day free trial. Prices in ${CURRENCY}; your local currency and tax may vary. Current pricing is shown in the App Store or Google Play.`,
          },
          {
            q: "Why does Kroni cost money?",
            a: "We've decided we'll never track your child or sell data — so the families who use Kroni fund development. Money goes to hosting, security, privacy, native-language work and continued development.",
          },
          {
            q: "Can I change the allowance amount?",
            a: "Yes. Go to the child's profile in the parent app, tap \"Allowance\" and adjust the amount. The change takes effect at the next payout date. You can also pause payouts temporarily.",
          },
          {
            q: "Can I cancel any time?",
            a: "Yes. Cancellation happens in the App Store or Google Play subscription settings. You keep access to the paid plan for the period you've already paid for.",
          },
        ],
      },
      {
        label: "Privacy",
        items: [
          {
            q: "What happens if we delete the account?",
            a: "All account-linked data — including child profiles, chore history and rewards — is permanently deleted within 30 days. The action cannot be undone. You can export your data from settings before deleting.",
          },
          {
            q: "Do you sell data about our children?",
            a: "Never. Kroni runs no marketing tracking, and we do not sell data to third parties. It's not part of the business model and never will be.",
          },
        ],
      },
    ],
  },
  policy: {
    sectionsTitle: "Contents",
    updatedLabel: "Last updated",
    backToTop: "Back to top",
    translationNotice:
      "This page has been translated from Norwegian. The Norwegian version is the legally binding one. Translation errors may occur — please let us know at support@kroni.no if you find any.",
  },
  pair: {
    metaTitle: "Open Kroni Family",
    metaDescription:
      "Open the Kroni app to finish pairing your child's device.",
    eyebrow: "Pairing",
    title: "Open Kroni on your child's phone",
    body: "Tap the button to open the Kroni app and finish pairing automatically. If the app opened on its own when you tapped the link, you can close this tab.",
    codeLabel: "Pairing code",
    openButton: "Open in Kroni app",
    notInstalled: "Don't have the app yet?",
    appStore: "Download for iOS",
    playStore: "Download for Android",
    autoOpen:
      "We'll try to open the app automatically in a few seconds. Nothing happening? Tap the button above.",
    helpLine: "Need help? Email support@kroni.no.",
  },
};
