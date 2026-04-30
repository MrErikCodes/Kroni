import type { LegalContent } from "../types";

export const personvernEn: LegalContent = {
  eyebrow: "Privacy",
  title: "Privacy policy",
  intro:
    "Kroni is built for families — and privacy is not something we tacked on afterwards. This policy explains what data we process, why, for how long, and what rights you have.",
  updated: "29 April 2026",
  sections: [
    {
      id: "innledning",
      number: "01",
      title: "Introduction and controller",
      body: (
        <>
          <p>
            <strong>Nilsen Konsult</strong> (Norwegian business registration no. 931 405 861 MVA) is the data controller for the personal data processed through the Kroni app and the kroni.no website. That means we determine the purposes and means of the processing, and we are responsible for ensuring it complies with the Norwegian Personal Data Act and the GDPR.
          </p>
          <p>
            Kroni is a family app where a parent creates chores, allowance and rewards for their children. For the app to work, we have to process a minimum of personal data about both the parent and the child. Throughout, we have chosen solutions that collect as little as possible — for example, we never ask for the child&apos;s last name, email address or photo, and no real money ever moves through the system. Privacy is built in, not bolted on.
          </p>
          <p>
            For privacy questions or to exercise your GDPR rights, reach us at <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "opplysninger",
      number: "02",
      title: "What personal data we process",
      body: (
        <>
          <p>About the <strong>parent</strong> we process:</p>
          <ul>
            <li>Email address (used as login via our authentication partner Clerk).</li>
            <li>The Apple ID name if you choose «Sign in with Apple».</li>
            <li>An optional display name shown in the family (first name or nickname).</li>
            <li>Subscription state (free, trial, monthly, yearly, lifetime, ended) and a RevenueCat app-user-ID linked to your Clerk user ID.</li>
            <li>IP address and device/browser info on login and when contacting our server endpoints, used for security and debugging.</li>
            <li>Timestamps for events in the app (chore creation, approvals, logins).</li>
            <li>Optional language preference.</li>
          </ul>
          <p>About the <strong>child</strong> we process:</p>
          <ul>
            <li>First name (typically what the parent calls the child day to day — a nickname is fine).</li>
            <li>Optionally a year of birth — only the year, never day or month. Used for age-tailoring; optional.</li>
            <li>Optionally a four-digit PIN, stored as a bcrypt hash. We never store the PIN in clear text.</li>
            <li>A chosen avatar key pointing to one of the app&apos;s predefined icons. We do not store user-uploaded images.</li>
            <li>Device ID and push token to deliver notifications about new chores, approvals and rewards.</li>
          </ul>
          <p>
            We do <strong>not</strong> collect the child&apos;s last name, full date of birth, email address, phone number, photos or voice data, location, or other special categories of personal data about the child.
          </p>
          <p>
            For purchases and billing, payment data (card data, billing address, etc.) is processed by Apple or Google as merchant of record. Kroni only receives an order confirmation without card information, plus an anonymised purchase object from RevenueCat (product id, purchase time, renewal time, trial status if any).
          </p>
          <p>About <strong>app usage</strong> we process:</p>
          <ul>
            <li>Chores and chore templates (titles, amounts, frequency, assignments).</li>
            <li>Completions, approvals and declines.</li>
            <li>Rewards and redemptions.</li>
            <li>Virtual-kroner balances per child.</li>
            <li>
              Technical telemetry from <strong>Sentry</strong> — crash reports with stack trace, breadcrumbs of recent events in the app, performance / distributed traces, plus device, OS and app version. Events are tagged with the parent&apos;s Clerk user ID and email address, and the child profile&apos;s internal ID if the error occurs on the child&apos;s side. Sentry is run as a <strong>self-hosted instance</strong> on the same infrastructure as the rest of the service; the logs do not leave our infrastructure and are not shared with third parties, especially not for marketing. Performance trace sampling is limited (10–20% in production).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "innsamling",
      number: "03",
      title: "How data is collected",
      body: (
        <>
          <p>
            Most data we get <strong>directly from the parent</strong> on registration, when creating child profiles, and through normal use of the app. The child&apos;s device pairs to the family via a six-digit code provided by the parent; the child does not enter personal data beyond what the parent has prefilled.
          </p>
          <p>
            Technical data — IP address, device model, OS, app version, timestamps and similar — is collected automatically when the app contacts our server endpoints, and is necessary for the service to function and to detect abuse.
          </p>
          <p>
            Subscription information comes from the Apple App Store and Google Play, mediated by our subscription platform RevenueCat.
          </p>
        </>
      ),
    },
    {
      id: "grunnlag",
      number: "04",
      title: "Legal basis",
      body: (
        <>
          <p>We process personal data on the following legal bases under GDPR Article 6:</p>
          <ul>
            <li><strong>Contract (Article 6(1)(b)):</strong> Processing necessary to perform the agreement with the parent — providing the family app, creating and maintaining the account, executing purchases and renewals.</li>
            <li><strong>Consent (Article 6(1)(a)):</strong> Push notifications and any optional features that require your active consent. Consent can be withdrawn at any time.</li>
            <li><strong>Legitimate interest (Article 6(1)(f)):</strong> Securing the service against abuse, debugging, aggregated statistics, and defending against legal claims.</li>
            <li><strong>Legal obligation (Article 6(1)(c)):</strong> When we must retain accounting records under Norwegian bookkeeping law, or respond to orders from public authorities.</li>
          </ul>
          <p>
            For children under 13 we rely on parental consent under <strong>GDPR Article 8</strong>, as implemented in Norwegian Personal Data Act § 5.
          </p>
        </>
      ),
    },
    {
      id: "formal",
      number: "05",
      title: "Purposes of processing",
      body: (
        <>
          <p>We process personal data to:</p>
          <ul>
            <li>create, operate and maintain parent accounts and linked child profiles;</li>
            <li>let the child mark chores as done and the parent approve them;</li>
            <li>maintain virtual-kroner balances and display them in the child&apos;s app;</li>
            <li>send relevant push notifications, when consent is given;</li>
            <li>handle subscription, trial and renewal via the App Store and Google Play;</li>
            <li>answer customer-service and privacy enquiries;</li>
            <li>detect and prevent abuse, account takeover and breaches of the terms;</li>
            <li>improve the service based on aggregated, anonymised usage statistics;</li>
            <li>comply with legal obligations, including bookkeeping and orders from authorities.</li>
          </ul>
          <p>
            We do <strong>not</strong> use personal data for behavioural advertising aimed at children, for profiling with legal or similarly significant effects, or for selling data to third parties.
          </p>
        </>
      ),
    },
    {
      id: "lagringstid",
      number: "06",
      title: "Retention",
      body: (
        <>
          <p>We store personal data for as long as necessary for the purposes for which it was collected, and no longer than the law allows or requires.</p>
          <ul>
            <li><strong>Active accounts:</strong> Data is retained while the agreement runs and the account is in active use.</li>
            <li><strong>Completed and approved chores:</strong> Generally deleted or anonymised within 90 days of approval.</li>
            <li><strong>Account deletion:</strong> When the parent deletes the family account, all personal data about the parent and the children is deleted within <strong>30 days</strong>, except for accounting records (5 years) and evidence required for legal claims.</li>
            <li><strong>Logs and security data:</strong> Typically 30 to 180 days.</li>
            <li><strong>Customer service enquiries:</strong> Normally up to 24 months.</li>
          </ul>
        </>
      ),
    },
    {
      id: "mottakere",
      number: "07",
      title: "Recipients and processors",
      body: (
        <>
          <p>
            We do not share personal data with third parties for their own purposes. As an <strong>explicit principle</strong> we share as little data as possible — minimising the amount, the categories and the number of recipients. Some sharing is technically unavoidable for the app to work (login, billing, distribution), and where it occurs it is solely with processors bound by a Data Processing Agreement (DPA) under GDPR Article 28, or — for Apple and Google — as independent controllers for the merchant-of-record role.
          </p>
          <ul>
            <li><strong>Hetzner Online GmbH</strong> — operates Kroni&apos;s application servers and PostgreSQL databases. Machines are located in Hetzner&apos;s data centre in <strong>Finland</strong>, within the EU/EEA. The entire core dataset (accounts, child profiles, chores, completions, virtual balances, Sentry logs) is held there.</li>
            <li><strong>Clerk, Inc.</strong> — authentication and account management for the parent. Processes email, login events and the Apple ID name if «Sign in with Apple» is used. Clerk has its own privacy policy.</li>
            <li><strong>RevenueCat, Inc.</strong> — handles subscription state and synchronises purchases / renewals across the App Store and Google Play. Receives an anonymised app-user-ID and purchase metadata; no card information. RevenueCat has its own privacy policy.</li>
            <li><strong>Mailpace</strong> (Ohmysmtp Ltd., established in the United Kingdom) — delivers our transactional emails from the sending domain <code>kroni.no</code> (authenticated with SPF, DKIM and DMARC). Processes your email address (sourced from Clerk) and the body content of the messages we send you. The purpose is solely delivery of account-essential service emails — sign-up confirmation, password reset, email verification, billing notices (failed payment, subscription expiration) and household invitation links. The legal basis is <strong>contract (GDPR Art. 6(1)(b))</strong> — we cannot operate the account without delivering these messages. Mailpace is a sub-processor under the data processing agreement we have with you, and retains delivery logs per its published retention schedule; the email content itself is not stored long-term by us. These are essential service messages and <strong>cannot be opted out of</strong> while the account is active; any marketing emails (we send none today) would require separate, opt-in consent. We have chosen to send our own, localised emails matching Kroni&apos;s visual identity rather than Clerk&apos;s default templates, which are disabled.</li>
            <li><strong>Apple Distribution International Ltd.</strong> (App Store) and <strong>Google Commerce Limited</strong> (Google Play) — distribution and payment as merchant of record. Apple&apos;s and Google&apos;s privacy terms govern what they themselves collect.</li>
            <li><strong>Expo (Expo Application Services)</strong> — delivery of push notifications.</li>
            <li><strong>Cloudflare, Inc.</strong> — DDoS protection and CDN for kroni.no.</li>
          </ul>
          <p>Personal data may be disclosed to public authorities where we are legally required to do so.</p>
          <p>
            An up-to-date list is available by contacting <a href="mailto:support@kroni.no">support@kroni.no</a>.
          </p>
        </>
      ),
    },
    {
      id: "tredjeland",
      number: "08",
      title: "Transfers outside the EEA",
      body: (
        <>
          <p>
            Some of our processors — especially Clerk and RevenueCat — are established in the US and may have data flows there. Such transfers rely on the <strong>EU Commission&apos;s Standard Contractual Clauses (SCCs)</strong> per GDPR Article 46, supplemented by technical and organisational measures.
          </p>
          <p>
            Kroni&apos;s core databases and application servers are operated by <strong>Hetzner in Finland</strong>, so day-to-day processing takes place within the EU/EEA. The «central» dataset — chores, completions, virtual balances, child profiles and Sentry logs — therefore never leaves the EEA in normal operation.
          </p>
        </>
      ),
    },
    {
      id: "sikkerhet",
      number: "09",
      title: "Information security",
      body: (
        <>
          <p>We have implemented reasonable technical and organisational measures:</p>
          <ul>
            <li>TLS encryption on all traffic.</li>
            <li>Hashing of sensitive fields — the child&apos;s PIN is a bcrypt hash.</li>
            <li>Access control on a <em>need-to-know</em> basis.</li>
            <li>Logging and monitoring via our self-hosted Sentry instance, plus regular security updates.</li>
            <li>Regular database backups and restore procedures.</li>
            <li>We never process card numbers, CVC codes or BankID data.</li>
          </ul>
        </>
      ),
    },
    {
      id: "rettigheter",
      number: "10",
      title: "Your rights",
      body: (
        <>
          <p>As a data subject you have the following rights under the GDPR:</p>
          <ul>
            <li><strong>Access (Art. 15):</strong> See what data we hold and receive a copy.</li>
            <li><strong>Rectification (Art. 16):</strong> Have inaccurate or incomplete data corrected.</li>
            <li><strong>Erasure (Art. 17):</strong> Request deletion of personal data.</li>
            <li><strong>Restriction (Art. 18):</strong> Have processing temporarily paused.</li>
            <li><strong>Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format.</li>
            <li><strong>Objection (Art. 21):</strong> Object to processing based on legitimate interest.</li>
            <li><strong>Withdrawal of consent (Art. 7(3)):</strong> Withdraw consent at any time.</li>
          </ul>
          <p>
            Email <a href="mailto:support@kroni.no">support@kroni.no</a>. We respond within <strong>30 days</strong>.
          </p>
        </>
      ),
    },
    {
      id: "klage",
      number: "11",
      title: "Complaint to the Data Protection Authority",
      body: (
        <>
          <p>If you believe we process your personal data in breach of the rules, you have the right to lodge a complaint with the Norwegian Data Protection Authority:</p>
          <p>
            <strong>Datatilsynet</strong><br />
            P.O. Box 458 Sentrum, 0105 Oslo, Norway<br />
            Phone: +47 22 39 69 00<br />
            Web: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer">datatilsynet.no</a>
          </p>
          <p>We would still appreciate hearing from you first.</p>
        </>
      ),
    },
    {
      id: "barn",
      number: "12",
      title: "Children and parental responsibility",
      body: (
        <>
          <p>
            The age of digital consent under GDPR Article 8 is set at 13 in Norway. Children under 13 may only use Kroni through a child profile created by a parent or legal guardian, who consents on the child&apos;s behalf.
          </p>
          <p>
            For children <strong>13 or older</strong> the parent may take the child&apos;s own consent into account. Either way, all administration and account ownership remain with the parent.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      number: "13",
      title: "Cookies and tracking",
      body: (
        <>
          <p>
            <strong>In the mobile app:</strong> We use no advertising trackers, no third-party analytics with personally identifying identifiers, and no <em>fingerprinting</em>. For debugging the app sends crash reports and a limited share of performance traces to our self-hosted Sentry instance, see sections 02 and 09. These logs are used solely for debugging and are not shared further.
          </p>
          <p>
            <strong>On kroni.no:</strong> We use only strictly necessary cookies.
          </p>
        </>
      ),
    },
    {
      id: "brudd",
      number: "14",
      title: "Personal data breaches",
      body: (
        <>
          <p>
            If a breach occurs, we notify the Data Protection Authority within <strong>72 hours</strong>, per GDPR Article 33. If the breach is likely to result in a high risk to the persons affected, we will also notify you directly, per GDPR Article 34.
          </p>
        </>
      ),
    },
    {
      id: "endringer",
      number: "15",
      title: "Changes to this policy",
      body: (
        <>
          <p>
            We may update this policy to reflect changes in the service or the law. Material changes are notified at least <strong>30 days before</strong> they take effect.
          </p>
        </>
      ),
    },
    {
      id: "kontakt",
      number: "16",
      title: "Contact and DPO",
      body: (
        <>
          <p>For privacy questions and rights requests:</p>
          <p>
            <strong>Nilsen Konsult</strong><br />
            Email: <a href="mailto:support@kroni.no">support@kroni.no</a>
          </p>
        </>
      ),
    },
  ],
};
