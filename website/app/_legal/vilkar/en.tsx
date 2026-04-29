import type { LegalContent } from "../types";

export const vilkarEn: LegalContent = {
  eyebrow: "Terms",
  title: "Terms of use",
  intro:
    "These terms govern the use of the Kroni app and the family subscription. They are written to be readable, but use precise legal terms where it matters — so we both know what we have agreed.",
  updated: "29 April 2026",
  sections: [
    {
      id: "innledning",
      number: "01",
      title: "Introduction and parties",
      body: (
        <>
          <p>
            These terms (the «Terms») form a binding agreement between you as a user («you», «User», «Parent») and <strong>Nilsen Konsult</strong> (Norwegian business reg. no. 931 405 861 MVA), a Norwegian sole proprietorship («we», «us», «Nilsen Konsult», «Kroni»). Nilsen Konsult provides the Kroni family app and the website kroni.no.
          </p>
          <p>
            By downloading, creating an account in, or otherwise using the Kroni app, you confirm that you have read and accepted these Terms and our privacy policy. Acceptance happens automatically on registration — completing sign-up means you accept the Terms and the privacy policy.
          </p>
          <p>
            You must be of age (18 or older) and have legal capacity to enter into this agreement. People under 18 may only use the service through a paired child profile created by a parent or legal guardian.
          </p>
        </>
      ),
    },
    {
      id: "definisjoner",
      number: "02",
      title: "Definitions",
      body: (
        <>
          <p>In these Terms:</p>
          <ul>
            <li><strong>The App</strong> — the Kroni mobile app for iOS and Android, the related website and underlying services.</li>
            <li><strong>Parent</strong> — the adult account holder who creates the family, manages child profiles, chores and rewards.</li>
            <li><strong>Child</strong> — a child profile paired to the Parent's account via a six-digit code. The child has its own simplified login but no separate agreement with Kroni.</li>
            <li><strong>Account</strong> — the Parent's overall access to the service, including linked child profiles.</li>
            <li><strong>Virtual kroner</strong> — an internal, non-monetary counter shown as «kroner» or «kr» in the child's app. They do <em>not</em> represent Norwegian kroner, cannot be exchanged for real money, and have no value outside the App.</li>
            <li><strong>Reward</strong> — an item, experience or action defined by the Parent that the child can «buy» with virtual kroner. Delivered by the Parent, not by Kroni.</li>
            <li><strong>Family subscription</strong> — the paid subscription product (monthly or yearly) that unlocks unlimited child profiles, chores and rewards, renewing automatically until cancelled.</li>
            <li><strong>Lifetime purchase</strong> — a one-time purchase that grants permanent access to all features of the Family subscription for the account it is tied to. Does not renew, is not re-billed, and includes future features within the same product area. Has no trial period.</li>
            <li><strong>Trial period</strong> — the seven (7) day free trial of the Family subscription (monthly or yearly), provided by the Apple App Store or Google Play. Does not apply to Lifetime purchases.</li>
            <li><strong>The Platforms</strong> — Apple App Store (Apple Inc.) and Google Play (Google LLC).</li>
          </ul>
        </>
      ),
    },
    {
      id: "tjenesten",
      number: "03",
      title: "What the service does and does not do",
      body: (
        <>
          <p>
            Kroni lets the Parent create chores, assign them to one or more children, and attach an amount of virtual kroner to each chore. When the child marks a chore as done, the Parent can approve it and the child's virtual balance grows accordingly. The child can then «redeem» rewards the Parent has set up.
          </p>
          <p>
            <strong>Kroni is not a payment service, wallet or financial institution.</strong> No real money ever moves between accounts in Kroni. The balance shown to the child is an internal point value with meaning only inside the family using the App. Virtual kroner cannot be transferred between families, cannot be exchanged for cash, goods or services from third parties, and grant no claim against Kroni or anyone else.
          </p>
          <p>
            The service is delivered as software-as-a-service. Features may change, expand or be retired. We aim for reasonable availability but give no guarantee of uninterrupted operation.
          </p>
        </>
      ),
    },
    {
      id: "konto",
      number: "04",
      title: "Creating an account and pairing a child",
      body: (
        <>
          <p>
            To use Kroni, the Parent creates an account via our authentication partner Clerk, with email or via «Sign in with Apple». The Parent must provide accurate, up-to-date information and is responsible for keeping login credentials secret. All activity from the Parent's account is treated as performed by the Parent.
          </p>
          <p>
            Child profiles are always created by the Parent. When a child profile is added, the App generates a six-digit pairing code used to connect the child's device. The Parent represents that the Parent or another person with parental responsibility is the one creating the profile, and that any required consent under GDPR Article 8 and the Norwegian Personal Data Act has been obtained for children under 13.
          </p>
          <p>
            If the Parent suspects unauthorised use of the Account, contact <a href="mailto:support@kroni.no">support@kroni.no</a> without undue delay.
          </p>
          <p>
            By creating an account you consent to receiving operational and transactional emails (account, security, billing and household-management) at the email address used during sign-up. This includes sign-up confirmation, password reset, email verification, notices of failed payment or subscription expiration, and household invitation links. These are <strong>essential service messages</strong> and cannot be opted out of while the account is active. We do <strong>not send marketing emails</strong> as part of the standard service. Emails are sent from <code>noreply@kroni.no</code> via our email sub-processor Mailpace; the reply-to address is <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "akseptabel-bruk",
      number: "05",
      title: "Acceptable use",
      body: (
        <>
          <p>You agree not to:</p>
          <ul>
            <li>use the App in violation of Norwegian or other applicable law;</li>
            <li>attempt to gain unauthorised access to Kroni's systems or other people's accounts;</li>
            <li>decompile, rewrite, disassemble or otherwise reverse-engineer the App, beyond what mandatory law permits;</li>
            <li>run automated scripts, scrapers, bots or load tests without prior written consent;</li>
            <li>use the App for purposes other than family chore and reward management;</li>
            <li>upload content that is offensive, abusive, discriminatory, sexualised, violent or otherwise inappropriate for children;</li>
            <li>use the App to monitor children in ways that breach the child's rights under the UN Convention on the Rights of the Child or Norwegian children's law.</li>
          </ul>
          <p>
            The Parent is responsible for ensuring linked child profiles stay within these limits. We reserve the right to close accounts that breach these Terms.
          </p>
        </>
      ),
    },
    {
      id: "abonnement",
      number: "06",
      title: "Family subscription and pricing",
      body: (
        <>
          <p>Kroni is offered in four tiers:</p>
          <ul>
            <li><strong>Free</strong> — up to one child and a maximum of five active chores. No time limit, no charge.</li>
            <li><strong>Family monthly</strong> — 49 NOK per month, renews automatically. Unlimited children, unlimited chores, rewards, goals and allowance.</li>
            <li><strong>Family yearly</strong> — 399 NOK per year, renews automatically (about 32% savings vs. monthly). Same content as monthly.</li>
            <li><strong>Lifetime</strong> — 1,200 NOK as a one-time purchase. Permanent access to the same features as the Family subscription, with no renewals and no re-billing. Tied to the Apple ID or Google account that made the purchase.</li>
          </ul>
          <p>
            Prices shown are guidance and are stated in Norwegian kroner including VAT. The price that actually applies is the one shown in the App Store or Google Play at the time of purchase, and may vary by country and region.
          </p>
          <p>
            The Lifetime purchase is intended for families who prefer a single one-off payment over a subscription. It covers features within the family product as defined at purchase, and future development within the same product area.
          </p>
        </>
      ),
    },
    {
      id: "provetid",
      number: "07",
      title: "7-day trial period",
      body: (
        <>
          <p>
            All new users get a free seven (7) day trial of the Family subscription, on both monthly and yearly billing. The trial starts when you complete the purchase in the App Store or Google Play. During the trial you have full access to all features of the Family subscription.
          </p>
          <p>
            At the end of the trial, the subscription <strong>automatically renews</strong> at the interval you chose, at the price shown in the Platform at the time of purchase, billed via Apple ID or Google account.
          </p>
          <p>
            To avoid being charged you must <strong>cancel the subscription at least 24 hours before the trial ends</strong> in the Platform's subscription settings.
          </p>
          <p>
            The free trial can only be used once per Apple ID or Google account, in line with the Platforms' own rules.
          </p>
        </>
      ),
    },
    {
      id: "betaling",
      number: "08",
      title: "Billing and automatic renewal",
      body: (
        <>
          <p>
            The Family subscription and the Lifetime purchase are sold exclusively as in-app purchases via the App Store or Google Play. <strong>Kroni is not the seller of the payment and is not the merchant of record.</strong> All transactions are processed by Apple Distribution International Ltd. and Google Commerce Limited respectively, who are responsible for billing, receipts, chargebacks, tax withholding and compliance with their own purchase terms.
          </p>
          <p>
            The Family subscription renews automatically for the same period (one month or one year) until you cancel it through the Platform. Charges are made on the payment method tied to your Apple ID or Google account.
          </p>
          <p>
            The <strong>Lifetime purchase</strong> is charged as a single amount at purchase and does not renew. You are not re-billed and there is nothing to cancel. The purchase can be restored on a new device via «Restore purchases» in the App.
          </p>
          <p>
            We may change prices for future renewals. Changes are notified at least 30 days before they take effect. If you do not want to accept a price change, you can cancel before the new price applies.
          </p>
        </>
      ),
    },
    {
      id: "oppsigelse",
      number: "09",
      title: "Cancellation",
      body: (
        <>
          <p>
            You can cancel the Family subscription at any time through the App Store or Google Play. Cancellation takes effect at the end of the current billing period — you keep full access for the month or year you have already paid for.
          </p>
          <p>
            We give <strong>no pro-rated refund</strong> for unused time after cancellation.
          </p>
          <p>
            The Lifetime purchase has no cancellation because it does not renew. If you wish to stop using the service, you can delete the family account in the App; the purchase itself remains registered with Apple or Google and can be restored later.
          </p>
          <p>
            We may terminate the agreement on our side for material breach, including breach of section 05.
          </p>
        </>
      ),
    },
    {
      id: "refusjon",
      number: "10",
      title: "Refunds",
      body: (
        <>
          <p>
            Because Kroni is not the seller of the payment, we cannot ourselves refund amounts paid via the App Store or Google Play. Refund requests must therefore be addressed to the Platform that processed the purchase:
          </p>
          <ul>
            <li><strong>Apple App Store:</strong> <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener noreferrer">reportaproblem.apple.com</a></li>
            <li><strong>Google Play:</strong> <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">play.google.com</a> → Order history → select the purchase → «Request a refund».</li>
          </ul>
          <p>
            The seven-day trial is meant to give you time to evaluate the service before being charged, so refunds are rarely needed.
          </p>
          <p>
            If you believe you have an independent claim against Kroni — for instance for material breach on our side — you can raise the claim directly with us at <a href="mailto:support@kroni.no">support@kroni.no</a>. We handle such enquiries in line with mandatory consumer law.
          </p>
        </>
      ),
    },
    {
      id: "angrerett",
      number: "11",
      title: "Right of withdrawal and consent to immediate delivery",
      body: (
        <>
          <p>
            Consumers normally have a 14-day right of withdrawal under Norwegian distance-selling law. However, under section 22 letter n of the Norwegian Right of Withdrawal Act, the right of withdrawal lapses for digital content delivered immediately after the contract is concluded, provided the consumer (a) expressly consents to delivery starting before the withdrawal period ends and (b) acknowledges that the right of withdrawal is therefore lost.
          </p>
          <p>
            By activating a Family subscription or Lifetime purchase you give the following express consent:
          </p>
          <p>
            <em>«I consent to Kroni being delivered immediately upon contract conclusion, and acknowledge that my right of withdrawal lapses as soon as the subscription or lifetime purchase is activated.»</em>
          </p>
          <p>
            The seven-day free trial still gives you a real opportunity to evaluate the service and exit without being charged, see section 07.
          </p>
        </>
      ),
    },
    {
      id: "brukerinnhold",
      number: "12",
      title: "User-created content",
      body: (
        <>
          <p>
            The Parent has full responsibility for all content entered into the App — chore titles, descriptions, reward names, allowance arrangements, child profile names and other free-text content. You represent that such content is suitable for children and does not infringe anyone's rights.
          </p>
          <p>
            We take no editorial responsibility for the family's private content, but reserve the right to remove or block content that obviously breaches section 05 or the law.
          </p>
        </>
      ),
    },
    {
      id: "rettigheter",
      number: "13",
      title: "Intellectual property",
      body: (
        <>
          <p>
            All rights to the Kroni name, logo, software, design, icons, text, illustrations and other copyrighted components belong to Nilsen Konsult or our licensors. No rights are transferred to you beyond what is expressly stated in these Terms.
          </p>
          <p>
            You are granted a limited, non-exclusive, non-transferable and revocable right to install and use the App for personal, non-commercial family use, as long as you abide by the Terms.
          </p>
          <p>
            Your own content remains yours. You grant Kroni a limited right to store, display and process such content to the extent necessary to provide the service.
          </p>
        </>
      ),
    },
    {
      id: "personvern",
      number: "14",
      title: "Privacy",
      body: (
        <>
          <p>
            Kroni processes personal data about the Parent and children in line with the Norwegian Personal Data Act and the GDPR. Which data we process, for what purposes, how long it is stored, and what rights you have, is set out in our privacy policy. For privacy questions contact <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "ansvar",
      number: "15",
      title: "Warranties and limitation of liability",
      body: (
        <>
          <p>
            Kroni is provided «as is» and «as available». To the extent permitted by mandatory law, we give no guarantee that the service will always be available, error-free or fit for any particular purpose beyond what is described on kroni.no and in the App.
          </p>
          <p>
            We are not liable for loss of virtual kroner due to circumstances on the Parent's or child's side. Virtual kroner have no monetary value, so such «loss» does not constitute economic loss in the legal sense.
          </p>
          <p>
            Unless mandatory law requires otherwise, Kroni's total liability to a user per calendar year is limited to the amount the user has actually paid for the service in that calendar year. We are not liable for indirect loss.
          </p>
          <p>
            These limitations do not apply to wilful misconduct or gross negligence on our side, nor to personal injury caused by negligence, and they do not affect your mandatory rights as a consumer.
          </p>
        </>
      ),
    },
    {
      id: "barneansvar",
      number: "16",
      title: "Parental responsibility for children",
      body: (
        <>
          <p>
            Norwegian law sets the age of digital consent under GDPR Article 8 at 13. For children under 13, parental consent is required for processing of the child's personal data. The Parent represents that such consent is validly given on the child's behalf.
          </p>
          <p>
            In line with parental responsibility under the Norwegian Children Act, the Parent has overall responsibility for the child's safe and appropriate use of the App.
          </p>
        </>
      ),
    },
    {
      id: "endringer",
      number: "17",
      title: "Changes to the Terms",
      body: (
        <>
          <p>
            We may update these Terms to reflect changes in the service, the law, security or business circumstances. The date at the top of this page shows when the Terms were last changed.
          </p>
          <p>
            Material changes affecting your rights or obligations are notified at least <strong>30 days before</strong> they take effect. Continued use of the service after the changes apply is treated as acceptance.
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
            Neither party is in breach of its obligations to the extent performance is prevented by circumstances outside its control — including war, natural disaster, large-scale power or internet outage, material failures by suppliers such as Apple, Google, Clerk or hosting provider, and orders from public authorities.
          </p>
        </>
      ),
    },
    {
      id: "fullstendig",
      number: "19",
      title: "Entire agreement and severability",
      body: (
        <>
          <p>
            These Terms, together with the privacy policy, form the entire agreement between you and Kroni regarding use of the App.
          </p>
          <p>
            If one or more provisions are deemed invalid, illegal or unenforceable, the remaining provisions continue in full force.
          </p>
        </>
      ),
    },
    {
      id: "lov",
      number: "20",
      title: "Governing law, dispute resolution and venue",
      body: (
        <>
          <p>
            These Terms are governed by Norwegian law. In a dispute, the parties shall first try to find an amicable solution through direct dialogue. As a consumer you have the right to contact:
          </p>
          <ul>
            <li><strong>Forbrukertilsynet (Norwegian Consumer Authority)</strong> — <a href="https://www.forbrukertilsynet.no" target="_blank" rel="noopener noreferrer">forbrukertilsynet.no</a></li>
            <li><strong>Forbrukerklageutvalget (Norwegian Consumer Disputes Tribunal)</strong> — <a href="https://www.forbrukerklageutvalget.no" target="_blank" rel="noopener noreferrer">forbrukerklageutvalget.no</a></li>
            <li><strong>EU Commission's Online Dispute Resolution platform (ODR)</strong> — <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a></li>
          </ul>
          <p>
            If the dispute is not resolved amicably, <strong>Oslo District Court</strong> is agreed as venue. Mandatory rules on consumer venue still take precedence.
          </p>
        </>
      ),
    },
    {
      id: "kontakt",
      number: "21",
      title: "Contact",
      body: (
        <>
          <p>
            <strong>Nilsen Konsult</strong> (Norwegian business reg. no. 931 405 861 MVA)<br />
            Email: <a href="mailto:support@kroni.no">support@kroni.no</a><br />
            Web: <a href="https://kroni.no" target="_blank" rel="noopener noreferrer">kroni.no</a>
          </p>
        </>
      ),
    },
  ],
};
