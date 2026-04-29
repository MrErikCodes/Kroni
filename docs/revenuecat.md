# RevenueCat setup

Concrete configuration steps for the Kroni RC project, plus how the dashboard pieces connect to the code. Match the names below exactly — the entitlement ID, product IDs, and `app_user_id` shape are referenced from code and changing them breaks things.

---

## 0. What's already in code

The mobile + backend integration is fully wired. You only need to configure RC + the stores.

| Concept | Where it lives | What you must match |
|---|---|---|
| Public SDK keys | `EXPO_PUBLIC_RC_IOS_KEY` / `EXPO_PUBLIC_RC_ANDROID_KEY` (Phase + EAS) | Pull these from RC → API keys → Public app-specific |
| Entitlement ID | `mobile/lib/billing.ts:5` → `'kroni_family'` | Create entitlement with EXACT id `kroni_family` (lowercase, underscore). Display name in RC stays `Kroni Family` (brand-facing label only). |
| `app_user_id` | `mobile/app/_layout.tsx → RevenueCatIdentityBridge` calls `Purchases.logIn(clerkUserId)` | Backend webhook resolves the parent by `parents.clerk_user_id` = RC `app_user_id` |
| Webhook URL | `POST /webhooks/revenuecat` | Configure in RC → Integrations → Webhooks |
| Webhook auth | `REVENUECAT_WEBHOOK_AUTH` (Phase backend) | Same string in RC's webhook "Authorization" field |
| Lifetime tracking | `households.lifetime_paid` (boolean) | Webhook sets this when product ID is `kroni_lifetime` |
| Recurring tracking | `households.subscription_tier` + `subscription_expires_at` | Webhook sets `tier='family'` + expiration on grants |

---

## 1. Project + apps

1. Sign in to your self-hosted instance (or app.revenuecat.com if migrating). Create a project named **Kroni** if it doesn't exist.
2. Add iOS app:
   - Bundle ID: `no.nilsenkonsult.kroni`
   - App Store Connect API key: in App Store Connect → Users and Access → Integrations → App Store Connect API → "+" → role **In-App Purchase** → download the .p8. Provide RC the .p8 + Key ID + Issuer ID.
   - APNs key (.p8): same Apple Developer console → Keys → APNs key. Upload to RC's iOS app → Push notifications. Required so RC can send subscription-status pushes.
3. Add Android app:
   - Package: `no.nilsenkonsult.kroni`
   - Service account JSON: see `appstore.md` → "Service account for RevenueCat" for the Play / GCP steps. Upload the JSON to RC's Android app.

## 2. API keys → Phase + EAS

```bash
# In the mobile app:
phase secrets update EXPO_PUBLIC_RC_IOS_KEY --value "appl_…"      # iOS public SDK key
phase secrets update EXPO_PUBLIC_RC_ANDROID_KEY --value "goog_…"  # Android public SDK key

# Mirror to EAS (sensitive visibility, all envs):
for k in EXPO_PUBLIC_RC_IOS_KEY EXPO_PUBLIC_RC_ANDROID_KEY; do
  V=$(phase secrets get "$k" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{console.log(JSON.parse(d).value)})")
  npx eas-cli env:create --force --visibility sensitive --type string \
    --name "$k" --value "$V" \
    --environment development --environment preview --environment production
done
```

Keys are NOT environment-specific — RC distinguishes sandbox vs prod purchases automatically based on the receipt source. Same key works for both.

## 3. Products

Create three products in RC → Products. The IDs MUST match what's in App Store Connect / Play Console.

| RC Product ID | Type | Stores | Price |
|---|---|---|---|
| `kroni_family_monthly` | Auto-renewing subscription | iOS + Android | 49 NOK / month |
| `kroni_family_yearly`  | Auto-renewing subscription | iOS + Android | 399 NOK / year |
| `kroni_lifetime`       | Non-consumable (iOS) / Managed product (Android) | iOS + Android | 1199 NOK one-time |

Give each product a **Display Name** in nb-NO + en-US. The localized name shown in the paywall comes from this.

## 4. Entitlement

- RC → Entitlements → "+" → identifier **`kroni_family`** (lowercase, underscore — matches `mobile/lib/billing.ts:5`). Display Name: `Kroni Family` (this is just the dashboard label, not user-visible).
- Attach all three products to it.
- Description (internal): "Unlocks unlimited kids, tasks, history, notifications. Granted by any of: monthly, yearly, lifetime."

## 5. Offering

- RC → Offerings → "+" → identifier **`default`**.
- Mark as **Current**. (`presentPaywall()` reads the current offering by default.)
- Add packages:
  - `$rc_monthly` → `kroni_family_monthly`
  - `$rc_annual` → `kroni_family_yearly`
  - `$rc_lifetime` → `kroni_lifetime`
- Display order from top: monthly, yearly, lifetime — or whatever drives the conversion you want. Lifetime as third reads as "Best value" on the paywall.

## 6. Paywall

You're using `RevenueCatUI.presentPaywall()`. Configure:

- RC → Paywalls → "+ New paywall" → pick a template that matches the editorial sand-50 / gold style.
- For each package, set:
  - Localized title (nb / en).
  - Optional badge (e.g. on the lifetime row: "Mest verdi" / "Best value" — `paywall.lifetimeBadge` in i18n).
  - Trial copy on monthly/yearly: "7 dager gratis" / "7 days free" (`paywall.trial`). Apple/Google insert their own legal text under it; this is just the marketing line.
- Footer note about cancellation 24h before trial: use `paywall.trialNote`.
- Publish.

## 7. Free trial

Trials are configured **store-side**, not in RC. RC just relays the result.

- App Store Connect → each subscription → Subscription → **Add Introductory Offer** → "Free trial" → 7 days → eligibility: "New subscribers".
- Google Play Console → subscription → base plan → **Offers → Add → Free trial** → 7 days → eligibility: "Developer determined: New customer acquisition".

When the trial starts, RC fires `INITIAL_PURCHASE` with `period_type: "TRIAL"` and an `expiration_at_ms` ~7 days out. Our webhook treats it like a normal grant — the household gets `tier='family'` for the trial duration. When the trial converts to a paid renewal, RC fires `RENEWAL` and we extend `subscription_expires_at`. If the user cancels and lets the trial expire, RC fires `EXPIRATION` and we revert to free. Apple's 24-hour-before-renewal-cancellation rule is enforced by the store, not us.

## 8. Webhook

- RC → Project Settings → Integrations → Webhooks → "+ New webhook".
- URL: `https://api.kroni.no/webhooks/revenuecat` (or your ngrok dev URL while testing).
- Authorization header: paste the same string you put in `REVENUECAT_WEBHOOK_AUTH` on the backend Phase. The route compares the bearer token byte-for-byte.
- Send: **all event types**. The backend explicitly handles `INITIAL_PURCHASE`, `RENEWAL`, `PRODUCT_CHANGE`, `NON_RENEWING_PURCHASE`, `UNCANCELLATION`, `TRANSFER` (grant), `EXPIRATION` (revoke). Everything else (`CANCELLATION`, `BILLING_ISSUE`, `TEST`, `SUBSCRIPTION_EXTENDED`, `SUBSCRIBER_ALIAS`) is logged and ignored on purpose.
- After saving, click "Send test event" — should land as a logged 200 with no DB change (test events have no `app_user_id`).

## 9. Connecting RC events to backend logs

Once Sentry is wired (see commit history), every webhook call produces a log line tagged with `event_type` + `parent_id` + `household_id`. To trace a billing issue:

1. User reports "lost premium on phone".
2. Tap **Kopier app info** in the app → DM the blob.
3. Grep the install_id in pino logs (or Sentry transactions) → see which webhook fired before the loss.
4. Cross-reference with RC's customer event timeline (RC dashboard → Customers → search by `app_user_id`).

## 10. Sandbox testing checklist

Run through this on both platforms before submitting for review:

- [ ] Create a parent on a sandbox device. Sign in with Clerk.
- [ ] Open Settings → tap **Abonnement** → see "Gratis" plan.
- [ ] Tap **Oppgrader til Familie** → RC paywall shows three packages.
- [ ] Buy monthly trial. App returns to settings; tier shows "Kroni Familie", trial banner showing "Cancel 24h before…".
- [ ] Backend log shows `INITIAL_PURCHASE` event, `period_type: TRIAL`, `lifetime: false`. `households.subscription_tier='family'`, `subscription_expires_at` ~7 days out.
- [ ] Cancel in sandbox App Store. After accelerated 7-day window, RC fires `EXPIRATION`. Tier flips back to `'free'`.
- [ ] Buy `kroni_lifetime` instead. `households.lifetime_paid=true`, `subscription_expires_at=null`. Detail screen shows "Kroni Familie · Livstid".
- [ ] Force a (mocked) `EXPIRATION` event for the lifetime owner — log should say "expiration ignored — household has lifetime", state unchanged.
- [ ] Restore-purchases button on a clean install of the same Apple ID re-grants the entitlement.
- [ ] Add a co-parent via household invite. Second parent does NOT see "Inviter forelder" or "Abonnement" controls but DOES bypass kid/task limits (they share the household's tier).

## 11. Production rollout order

1. Apple/Google products in "Ready to Submit" / "Active" state.
2. RC entitlement + offering published.
3. Webhook URL pointing at production API.
4. EAS build with production keys.
5. Internal test track / TestFlight build → run the sandbox checklist with real testers.
6. Submit for review with reviewer notes containing the sandbox tester credentials AND a reminder that the entitlement is `kroni_family` so they can verify in RC if they email support.
7. Once reviewed + live: switch the RC webhook URL to production if you were testing against ngrok, and confirm one real purchase end-to-end.

---

## Reference: webhook event semantics in this codebase

Source: `backend/src/routes/webhooks/revenuecat.ts`.

- **GRANT** events (set `subscription_tier='family'`, set `subscription_expires_at` from `expiration_at_ms`, OR set `lifetime_paid=true` if `product_id === 'kroni_lifetime'`):
  - `INITIAL_PURCHASE` (includes trial)
  - `RENEWAL`
  - `PRODUCT_CHANGE`
  - `NON_RENEWING_PURCHASE` — the only event for lifetime
  - `UNCANCELLATION`
  - `TRANSFER`
- **REVOKE** events (revert to `tier='free'`, clear `expires_at`, only when `lifetime_paid=false`):
  - `EXPIRATION`
- **NOTED, NO STATE CHANGE** (logged for visibility):
  - `CANCELLATION` — auto-renew off; access stays valid until `EXPIRATION`
  - `BILLING_ISSUE`
  - `SUBSCRIPTION_EXTENDED`
  - `TEST`
  - `SUBSCRIBER_ALIAS`
  - any unrecognised type

The 24-hour cancellation rule for trials is enforced by Apple/Google. From the backend's POV: if the user cancels within the trial, `EXPIRATION` fires when the trial ends and we revert to free. If they don't cancel, `RENEWAL` fires, the subscription continues, and `subscription_expires_at` extends.
