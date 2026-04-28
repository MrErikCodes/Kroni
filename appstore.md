# App Store + Play Store setup

What this app actually needs from each store. Most of what's already in your accounts (existing subscriptions, app records) carries over.

---

## iOS — App Store Connect

### App record
- Bundle ID: **`no.nilsenkonsult.kroni`** (matches `mobile/app.config.ts`).
- Name: **Kroni**.
- Default language: Norwegian Bokmål; add English (US/UK) and Swedish if you want a wider Nordic launch.

### Capabilities (Xcode / EAS Build)
EAS builds these automatically when present in the bundle, but Apple still requires the corresponding entitlements be checked on the App ID.

| Capability | Why we need it | How to enable |
|---|---|---|
| **In-App Purchase** | Selling Kroni Familie monthly/yearly + lifetime | App Store Connect → your app → App Information → enables itself when you create the first subscription / IAP. Also tick it on the App ID in Apple Developer → Identifiers. |
| **Push Notifications** | Approval reminders, allowance payouts, "task completed" pings on the parent device. EAS Build sets up the entitlement, but you need an APNs key. | Apple Developer → Keys → "+" → Apple Push Notifications service (APNs) → download the .p8 once. Upload that to **Expo** (`eas credentials`) and to **RevenueCat** (Project → Apps → iOS → Push notifications). |
| **Sign in with Apple** | Not currently used — Clerk handles auth. Skip unless we add it later. | — |
| **Associated Domains** | Required if/when we add deep-link magic-login URLs for parent sign-in. Not yet wired. | — |
| **Family Sharing** *(optional)* | Lets a paying parent share Kroni Familie with up to 5 family-group members. Worth enabling on the subscription products. | App Store Connect → each subscription → "Family Sharing: On". |

### What you upload per release
- Build via EAS: `eas build --profile production --platform ios`. EAS auto-submits via `eas submit --platform ios` if you've connected the App Store API key.
- Privacy nutrition labels: `User Data → Identifiers → Device ID` (we read iOS vendor ID for diagnostics), `User Data → Contact Info → Email` (Clerk auth), `Purchases` (RevenueCat).
- App Privacy URL: `https://kroni.no/personvern`.
- Support URL: `https://kroni.no/support`.

### Sandbox testing
- Users and Access → Sandbox Testers → create a tester per teammate.
- Sign out of production Apple ID on the device (Settings → App Store → Sandbox Account).
- Sandbox subscriptions auto-renew on accelerated timelines (1 week → 3 minutes).

---

## Android — Google Play Console

### App record
- Package: **`no.nilsenkonsult.kroni`** (matches `mobile/app.config.ts`).
- Default language: nb-NO; add en-US, sv-SE.

### Capabilities (gradle / EAS)
Most permissions are inferred from native modules. The ones that need explicit Play Console attention:

| Permission / capability | Why | Where it shows up |
|---|---|---|
| **`com.android.vending.BILLING`** | Required for in-app purchases. EAS adds it automatically when `react-native-purchases` is present. | Manifest is generated; nothing to toggle in Play Console. |
| **`POST_NOTIFICATIONS`** *(Android 13+)* | Push notifications. expo-notifications adds it. | Make sure **Notifications** is declared under Play Console → App content → Data safety. |
| **`READ_EXTERNAL_STORAGE` / camera / location** | Not used. Don't enable. | If Play complains during review, remove from the merged manifest by adding to `android.permissions` exclusion in app.config. |

### Subscriptions
- Monetize → Products → Subscriptions → reuse existing if you already have them, or create new with these IDs (must match RevenueCat exactly):
  - `kroni_family_monthly` — base plan `monthly-autorenewing`, 49 NOK / 1 month.
  - `kroni_family_yearly` — base plan `yearly-autorenewing`, 399 NOK / 1 year.
- Trials: Subscription → base plan → **Offers → Add free trial** → 7 days, eligibility "Developer determined: New customers". Google enforces the 24-hour-before-renewal cancellation rule automatically.

### One-time products (lifetime)
- Monetize → **In-app products** (NOT subscriptions) → create:
  - Product ID: `kroni_lifetime`, type Managed, 1200 NOK.
- Localized titles in nb-NO + en-US.

### Service account for RevenueCat
- Setup → API access → Create new service account in Google Cloud.
  - Role: **Service Account User** at the GCP project level.
- Back in Play Console → Setup → API access → grant the service account these permissions:
  - View financial data, orders, and cancellation survey responses
  - Manage orders and subscriptions
- GCP IAM → that service account → Keys → Add key → JSON → download.
- Upload the JSON to RevenueCat → Project → Apps → Android.

### License testers (sandbox)
- Setup → License testing → add the Google account email of every teammate that needs to test paid flows.
- Internal testing track → upload an EAS build → testers install via the link.

### Data safety form
- Diagnostic data: device ID (Android ID for our install_id), crash logs (Sentry).
- Personal info: email (Clerk).
- Financial info: in-app purchases.
- All of these need a YES + a description before Play will publish.

---

## Cross-platform reminders

- **Bundle / package IDs** must match exactly between RC, the manifest, and the store. Mismatch is the #1 cause of "this app is not configured for sandbox purchases" errors.
- **Same product IDs on both stores** so RC has one canonical mapping per product. Localized display names differ; the ID stays the same.
- **App-store privacy strings** (`NSUserTrackingUsageDescription` etc.) — we don't currently track for ads, so we don't need ATT. If marketing later asks for IDFA, that's a code change + a privacy-label update.
- **Subscription pricing localization** — set the NOK base price; both stores auto-convert to other currencies. Spot-check the EUR/USD prices before submitting.
- **App review notes** — for both stores, include test credentials (sandbox tester / license tester) in the review notes so Apple/Google can actually buy a sub during review.
