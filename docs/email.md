# Transactional email — Mailpace pipeline

All transactional mail (Clerk-driven welcome / password-reset / email-
verification, RC billing notices, future household invites) goes
through one provider: **Mailpace**, sending domain `kroni.no`. Clerk's
default emails are disabled at the dashboard so the backend can intercept
the events and send a branded, localized message instead.

Phase 1 (shipped): scaffolding + welcome-email-on-signup.
Phase 2 (shipped 2026-04-29): password-reset, email-verification, RC
billing notices, household invites. 60 new template files (5 events ×
4 locales × 3 file types) wired through existing helpers.
Phase 3+ (pending): future receipts, kid-pairing notifications,
re-engagement.

## Environment variables

| Var | Purpose | Default |
|---|---|---|
| `MAILPACE_API_TOKEN` | Server token from the Mailpace dashboard. Domain-scoped — this token can only send `from:*@kroni.no`. **Required.** | — |
| `MAILPACE_FROM_EMAIL` | Verified sending address. | `noreply@kroni.no` |
| `MAILPACE_FROM_NAME` | Friendly From: display name. Renders as `Kroni <noreply@kroni.no>`. | `Kroni` |
| `CLERK_WEBHOOK_SECRET` | svix signing secret from the Clerk dashboard's Webhooks page. **Required.** | — |

Set these in Phase (`phase secrets edit`) for the backend service. The
`phase run` wrappers in `package.json` inject them at runtime.

## Where the code lives

- `backend/src/lib/mailpace.ts` — `sendMail({ to, subject, html, text, replyTo? })`. Posts to `https://app.mailpace.com/api/v1/send` with `MailPace-Server-Token`. Throws typed `MailpaceError` on non-2xx. Native fetch (Node 22+), no SDK.
- `backend/src/lib/email-templates.ts` — `loadTemplate(event, locale, vars)` reads from disk and does `{{name}}` substitution. Caches files per process.
- `backend/src/emails/<event>.<locale>.{html,txt,subject.txt}` — template files. 4 locales × 3 files per event.
- `backend/src/routes/webhooks/clerk.ts` — Clerk webhook receiver, mounted at `POST /webhooks/clerk`. svix verify, then on `user.created` calls `sendMail` with the welcome template.

## Bilingual layout

Every email body shows the recipient's locale section first, then a
horizontal-rule divider, then an English section. The two sections are
**hard-coded inline** in the same template file — `welcome.nb-NO.html`
contains both Norwegian and English markup. This keeps the runtime
helper trivial (one disk read, one substitution pass, no concat).

The `welcome.en-US.{html,txt}` files are English-only — no second
section.

Subject lines are locale-only:
- nb: `Velkommen til Kroni`
- sv: `Välkommen till Kroni`
- da: `Velkommen til Kroni`
- en: `Welcome to Kroni`

Every body is wrapped in an `<!-- [REVIEW] <locale> email copy -->`
HTML comment — the copy is AI-generated and needs a native-speaker pass
before private beta.

## Adding a new locale

1. Add the locale code to the `SupportedLocale` union in `email-templates.ts` and the `SUPPORTED_LOCALES` array.
2. Drop three files into `backend/src/emails/`: `<event>.<locale>.html`, `<event>.<locale>.txt`, `<event>.<locale>.subject.txt`.
3. Mark each body with the `<!-- [REVIEW] <locale> email copy -->` comment until a native speaker has signed off.
4. If the locale is non-English, embed the English fallback section inline (see existing nb / sv / da templates).

## Adding a new event

1. Create the 12 files (4 locales × 3 file types) under `backend/src/emails/<event>.*`.
2. Call `loadTemplate('<event>', locale, vars)` in the webhook handler / job that triggers it.
3. Pass the result to `sendMail({ to, subject, html, text })`.

## Clerk webhook URL

In the Clerk dashboard → **Webhooks** → **Add endpoint**:

- **URL:** `https://api.kroni.no/webhooks/clerk` (prod) or the ngrok tunnel URL during dev.
- **Subscribe to events:** `user.created`, `user.updated`, `user.deleted`. (Phase 2 will add `email.created` for OTP verification and `password.reset_*` events.)
- Copy the **Signing secret** from the endpoint detail page into `CLERK_WEBHOOK_SECRET`.

Disable Clerk's built-in transactional emails in the dashboard:
**Customization → Emails** → toggle off the "Send from Clerk" switch
for the events we now own (welcome / verification / reset). Clerk will
keep firing the corresponding webhook events; the backend takes over
the delivery.

## Mailpace domain authentication (kroni.no)

Add these DNS records on `kroni.no` to authenticate the domain.
Mailpace will not send mail from an unverified domain.

### SPF (TXT @ kroni.no)

```
v=spf1 include:relay.mailpace.com ~all
```

If you already have an SPF record (e.g. for Google Workspace), merge
the `include:` rather than adding a second SPF — RFC 7208 disallows
multiple SPF records on the same name.

### DKIM (TXT)

Mailpace exposes the exact DKIM record on the domain detail page. The
host is something like `mailpace._domainkey.kroni.no` and the value is
a long `v=DKIM1; k=rsa; p=…` blob. Copy verbatim from the dashboard.

### DMARC (TXT _dmarc.kroni.no)

Start in monitor mode so we get reports without hard-bouncing legit
mail while we polish the alignment:

```
v=DMARC1; p=none; rua=mailto:dmarc@kroni.no; pct=100
```

After two weeks of clean reports, tighten to `p=quarantine` then
`p=reject`.

### MAIL FROM subdomain (recommended)

Mailpace recommends a dedicated `MAIL FROM` subdomain (e.g.
`mail.kroni.no`) so the bounce-handling SPF + return-path live under
their control without polluting the apex. Add the records they list on
the domain page under "Custom Return-Path" and set the subdomain in
the dashboard.

## Smoke-testing without sending

The Mailpace token is not provisioned yet, so don't actually call the
API. Instead:

- Verify `npm --workspace=backend run typecheck` is clean.
- Verify the webhook route mounts (start the backend, hit
  `POST /webhooks/clerk` with no headers — should 401 from
  the missing svix headers, not 404).
- Once the token lands in Phase, send a test signup through Clerk dev
  and confirm a real email arrives. Test against Gmail web + iOS,
  Outlook desktop + web, Apple Mail (email-client CSS support is
  narrow; the templates are pure table layout + inline styles).

## Phase 2 events (shipped 2026-04-29)

| Event template | Trigger | Vars | URL placeholders |
|---|---|---|---|
| `password-reset` | Clerk webhook `email.created` with slug starting with `reset_password` (matches `reset_password_code`, `reset_password_attempt_*`, etc.) | `{{name}}`, `{{code}}` | — |
| `email-verification` | Clerk webhook `email.created` with slug = `verification_code`, `magic_link_sign_up`, or `magic_link_sign_in` | `{{name}}`, `{{code}}` | — |
| `billing-failed` | RevenueCat webhook `BILLING_ISSUE` event in `revenuecat.ts` (alongside `notifyOwner` push) | `{{name}}`, `{{updatePaymentUrl}}` | hard-coded `https://kroni.no/account/billing` (TODO swap for universal-link) |
| `subscription-expired` | RevenueCat webhook `EXPIRATION` event for non-lifetime household (alongside `notifyOwner` push) | `{{name}}`, `{{renewUrl}}` | hard-coded `https://kroni.no/account/billing` (TODO swap for universal-link) |
| `household-invite` | `POST /parent/household/invites` after invite row inserted, when `invitedEmail` non-null | `{{inviterName}}`, `{{householdName}}`, `{{code}}`, `{{acceptUrl}}` | `https://kroni.no/invite/<code>` (TODO swap to real `/invite` landing) |

In Clerk dashboard → **Webhooks** → also subscribe to `email.created`
on the same endpoint. Disable Clerk's built-in delivery for the
matched slugs so we don't double-send.

The Clerk `email.created` payload-shape varies by version. The handler
extracts the OTP from `data.otp` first, then `data.token`, then nested
`data.data.{otp,token}`, finally falling back to the raw `data.body`
string so the template still renders something visible if Clerk
changes the field name.

Email failures are independent of push notifications: each path is
wrapped in its own try/catch in the RC webhook, so a Mailpace outage
does not block the lock-screen push and vice versa.

Recipient locale resolution:
- For Clerk emails: lookup `parents.locale` by `data.user_id`, fallback `nb-NO`.
- For RC emails: lookup the household's premium owner via `parents.locale`, fallback `nb-NO`.
- For invite emails: use the inviter's locale (recipient unknown until signup), fallback `nb-NO`.
