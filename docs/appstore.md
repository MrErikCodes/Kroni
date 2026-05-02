# App Store + Play Store setup

What this app actually needs from each store. Most of what's already in your accounts (existing subscriptions, app records) carries over.

---

## iOS — App Store Connect

### App record

- Bundle ID: **`no.nilsenkonsult.kroni`** (matches `mobile/app.config.ts`).
- Name: **Kroni**.
- Launch markets: **Norway, Sweden, Denmark only** (App Store Connect → Pricing and Availability → restrict to NO, SE, DK).
- Default language: Norwegian Bokmål. Add Swedish (sv-SE) and Danish (da-DK) localizations. en-US is a catch-all fallback for travelers / non-Nordic speakers, not a market — minimal localized metadata is fine.

### Capabilities (Xcode / EAS Build)

EAS builds these automatically when present in the bundle, but Apple still requires the corresponding entitlements be checked on the App ID.

| Capability             | Why we need it                                                                                                                                                                                                         | How to enable                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **In-App Purchase**    | Selling Kroni Familie monthly/yearly + lifetime                                                                                                                                                                        | App Store Connect → your app → App Information → enables itself when you create the first subscription / IAP. Also tick it on the App ID in Apple Developer → Identifiers.                                                                                                                                                                                                         |
| **Push Notifications** | Approval reminders, allowance payouts, "task completed" pings on the parent device. EAS Build sets up the entitlement, but you need an APNs key.                                                                       | Apple Developer → Keys → "+" → Apple Push Notifications service (APNs) → download the .p8 once. Upload that to **Expo** (`eas credentials`) and to **RevenueCat** (Project → Apps → iOS → Push notifications).                                                                                                                                                                     |
| **Sign in with Apple** | Not currently used — Clerk handles auth. Skip unless we add it later.                                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                                                                  |
| **Associated Domains** | Required for kid-pairing universal links (`https://kroni.no/pair/<code>`, `https://kroni.dk/pair/<code>`, `https://kroni.se/pair/<code>`). Tapping a shared link from the parent app opens the kid app and auto-pairs. | Apple Developer → Identifiers → app ID → enable **Associated Domains**. Add `applinks:kroni.no`, `applinks:kroni.dk`, `applinks:kroni.se` to the entitlement (declare in `mobile/app.config.ts` under `ios.associatedDomains`). Host an `apple-app-site-association` file at `https://kroni.{no,dk,se}/.well-known/apple-app-site-association` mapping `/pair/*` to the bundle ID. |

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
- Launch countries: **Norway, Sweden, Denmark only** (Play Console → Production → Countries / regions → restrict to NO, SE, DK).
- Default language: nb-NO. Add sv-SE and da-DK store-listing translations. en-US listing is a catch-all fallback for non-Nordic speakers, not a market.

### Capabilities (gradle / EAS)

Most permissions are inferred from native modules. The ones that need explicit Play Console attention:

| Permission / capability                         | Why                                                                                                                                             | Where it shows up                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`com.android.vending.BILLING`**               | Required for in-app purchases. EAS adds it automatically when `react-native-purchases` is present.                                              | Manifest is generated; nothing to toggle in Play Console.                                                                                                                                                                                                                                                                                                         |
| **`POST_NOTIFICATIONS`** _(Android 13+)_        | Push notifications. expo-notifications adds it.                                                                                                 | Make sure **Notifications** is declared under Play Console → App content → Data safety.                                                                                                                                                                                                                                                                           |
| **`READ_EXTERNAL_STORAGE` / camera / location** | Not used. Don't enable.                                                                                                                         | If Play complains during review, remove from the merged manifest by adding to `android.permissions` exclusion in app.config.                                                                                                                                                                                                                                      |
| **Android App Links (intent filters)**          | Kid-pairing universal links must open the kid app directly without the chooser dialog. Same `https://kroni.{no,dk,se}/pair/<code>` URLs as iOS. | Declare `intentFilters` in `mobile/app.config.ts` for each host with `autoVerify: true` and path prefix `/pair/`. Host a Digital Asset Links file at `https://kroni.{no,dk,se}/.well-known/assetlinks.json` containing the package name + SHA-256 of the upload + Play app-signing certificates. Verify with `adb shell pm get-app-links no.nilsenkonsult.kroni`. |

### Subscriptions

- Monetize → Products → Subscriptions → reuse existing if you already have them, or create new with these IDs (must match RevenueCat exactly):
  - `kroni_family_monthly` — base plan `monthly-autorenewing`, 49 NOK / 1 month.
  - `kroni_family_yearly` — base plan `yearly-autorenewing`, 399 NOK / 1 year.
- Trials: Subscription → base plan → **Offers → Add free trial** → 7 days, eligibility "Developer determined: New customers". Google enforces the 24-hour-before-renewal cancellation rule automatically.

### One-time products (lifetime)

- Monetize → **In-app products** (NOT subscriptions) → create:
  - Product ID: `kroni_lifetime`, type Managed, 1199 NOK.
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

## Introductory offers (7-day free trial)

The trial is **NOT** a field on the subscription itself — it's a separate sub-record (an "introductory offer" on iOS, a "subscription offer" on Android) attached to each subscription. Both platforms treat trials as time-bounded promotions on top of the base subscription, so they live in their own UI section.

Once configured, RC reads the trial info from each store's API and the paywall renders "7 dager gratis" / "7-day free trial" automatically — no client-side trial logic in our code.

### iOS — App Store Connect

1. **App Store Connect → your app → Subscriptions** (sidebar).
2. Click into **Kroni Family Monthly** (then repeat for **Yearly**).
3. Scroll past Subscription Prices and Localization to find **"Introductory Offers"** (or click **"View All Subscription Pricing"** → look for the introductory offers tab).
4. Click **+** → **Create Introductory Offer**.
5. Fill in:
   - **Type:** Free
   - **Eligibility:** New Subscribers (so each Apple ID gets one trial only)
   - **Duration:** 1 Week
   - **Countries or regions:** All available territories (or restrict to NO/SE/DK)
   - **Start Date:** Today
   - **End Date:** No End Date
6. Save — repeats for Yearly.

Apple enforces the 24-hour-before-renewal cancellation rule automatically. RC fires `INITIAL_PURCHASE` with `period_type: "TRIAL"` when the trial begins, then `RENEWAL` when it converts (or `EXPIRATION` if the user cancels in time).

### Android — Play Console

1. **Monetize → Products → Subscriptions** → click into the subscription.
2. Scroll to the **base plan** (e.g., `monthly-autorenewing`).
3. Under the base plan, find the **Offers** section.
4. Click **+ Add → Free trial**.
5. Fill in:
   - **Duration:** 7 days
   - **Eligibility:** Developer determined → **New customer acquisition**
   - **Countries:** all
6. **Activate** the offer (Draft offers don't reach the paywall).

Repeat for `kroni_family_yearly`. Google enforces the same 24-hour cancellation rule. Trial events fire identically through RTDN → RC → our webhook.

### Verification

After creating the offer (either platform):

1. Wait 5–15 min for the store to propagate.
2. RC → **Products → kroni_family_monthly** → click in.
3. Should show "Has introductory offer: 1 week free" or similar metadata.
4. If RC doesn't pick it up, click **Refresh metadata** on the product.
5. Sandbox/license-tester purchase on a real device should display "7 dager gratis" in the paywall.

If the badge still doesn't show after 30 min, the offer is likely in **Draft** state — confirm it's **Active**.

### Why we apply the trial to monthly *and* yearly

Both subscriptions belong to the `kroni_family` entitlement and are sold side-by-side on the paywall. Applying the trial to both:
- Lets the user pick monthly OR yearly with the same risk-free entry point.
- Apple/Google enforce per-Apple-ID / per-Google-account eligibility, so a user can't double-dip across the two.
- Removes a friction point — without a yearly trial, the yearly tier reads as "pay 399 kr now or get a free monthly first" which kills conversions.

The lifetime IAP gets no trial — Apple/Google don't allow free trials on non-consumable IAPs.

---

## Screenshots and app previews

Apple allows up to **10 screenshots + 3 app previews** per locale per device family. Play allows up to **8 screenshots + 1 promo video (YouTube link, not uploaded)**.

### Required sizes (2026)

| Asset | Dimensions | Required? |
|---|---|---|
| iPhone 6.9" screenshots (iPhone 16 Pro Max) | **1320 × 2868** portrait | Yes |
| iPhone 6.5" screenshots (legacy) | 1242 × 2688 | Optional |
| iPad 13" screenshots | 2064 × 2752 | Only if listing iPad |
| App preview video | H.264, 30 fps, ≤ 30 s, ≤ 500 MB, same native resolution as the device class | Optional but recommended |
| Play Store phone screenshot | 1080 × 1920 minimum, 16:9 or 9:16 | Yes |
| Play Store feature graphic | 1024 × 500 | Yes |

App Store Connect auto-scales the 6.9" set down for older device sizes, so capturing once at iPhone 16 Pro Max covers all iPhone classes. iPad is a separate set; skip it unless you submit an iPad build.

### Capture stack (macOS strongly recommended)

You can build and submit from Windows via EAS, but iOS Simulator is macOS-only and is the cleanest path to store-ready assets. On macOS install:

- **Xcode** (free, Mac App Store) — bundles iOS Simulator and `xcrun simctl`.
- **iMovie** (free, preinstalled) or **DaVinci Resolve** (free) for trimming previews.

Boot the largest required device and clean the status bar:

```bash
cd mobile
npx expo run:ios --device "iPhone 16 Pro Max"

xcrun simctl status_bar booted override \
  --time "9:41" --batteryState charged --batteryLevel 100 \
  --cellularBars 4 --wifiBars 3
```

Capture:

- **Screenshot**: `Cmd+S` inside Simulator (saves to Desktop), or `xcrun simctl io booted screenshot kids.png`. Outputs at native 1320 × 2868.
- **Preview video**: `xcrun simctl io booted recordVideo --codec h264 preview-1.mov` → `Ctrl+C` to stop. Trim in iMovie to ≤ 30 s, export H.264 .mov.

### Real-iPhone capture (no Mac)

Possible but limited:

- Screenshots: Side button + Volume Up. Works only if your iPhone is a 6.9" device (iPhone 15 Pro Max / 16 Pro Max) — anything smaller fails the primary size requirement.
- Previews: Control Center → Screen Recording, trim in Photos. You can't fake the status bar, so carrier name / battery level / time will appear in submitted videos and Apple has rejected for this in the past.

Verdict: borrow a Mac for a day or buy a Mac mini. It saves a half-day of fighting Transporter, signing certs, and asset dimensions, and you'll need it again for every TestFlight cycle.

### Simulator vs real device — which for what

| Asset type | Best source | Why |
|---|---|---|
| Screenshots (10) | **iOS Simulator** | Exact native resolution, fakeable status bar, no carrier branding, every device size from one Mac. |
| App previews (3) | **iOS Simulator** for most apps; switch to real device + QuickTime if you need camera/biometrics in frame | Same reasons as screenshots; Kroni doesn't need camera, so Simulator is fine. |
| TestFlight smoke tests | **Real iPhone** | Sandbox IAP, push, Universal Links don't fully work in Simulator. |

You will still need a real iPhone for sandbox IAP and pairing-link verification — those parts of the doc above are unchanged. The Mac is for asset capture and submission, the iPhone is for end-to-end flows.

### The 10-screenshot lineup

Tell a 3-act story: parent setup → kid loop → trust close. Each frame = one promise. Compose with caption text in the top third over a brand-gold background, the device frame below. Same composition across all 10 keeps the listing visually coherent.

| # | Screen | Route | Caption (nb-NO) | Caption (en) | Why this frame |
| - | ------ | ----- | --------------- | ------------ | -------------- |
| 1 | Approvals — pending list, Approve button highlit | `(parent)/(tabs)/approvals` | Godkjenn med ett trykk | Approve with one tap | Hook — the core action. |
| 2 | Kids overview with 2–3 child cards + balances | `(parent)/(tabs)/kids` | Hele familien, ett sted | The whole family, one place | Establishes scale. |
| 3 | Task creation modal mid-fill | `(parent)/tasks/new` | Lag en oppgave på 10 sekunder | Make a chore in 10 seconds | Removes setup anxiety. |
| 4 | Task list with recurring + one-off mix | `(parent)/(tabs)/tasks` | Faste eller engangs | Recurring or one-off | Flexibility. |
| 5 | Reward list with savings goals | `(parent)/(tabs)/rewards` | Belønninger som betyr noe | Rewards that mean something | Emotional payoff. |
| 6 | Settings with pause toggle visible | `(parent)/settings` | Pause når familien er på ferie | Pause when life happens | Anticipates objection. |
| 7 | Kid Today with 3 chores, 1 checked | `(kid)/(tabs)/today` | Egen, enkel app for barnet | A simple app just for kids | Pivot to kid side. |
| 8 | Kid Balance with goal progress bar | `(kid)/(tabs)/balance` | Se sparepengene vokse | Watch savings grow | Kid-side emotion. |
| 9 | Celebrate screen (confetti / approval moment) | `(kid)/celebrate` | Følelsen av mestring | The feeling of mastery | Climax of the loop. |
| 10 | Paywall with pricing tiers | `(parent)/paywall` | 49 kr/mnd · 7 dager gratis | 49 NOK/mo · 7 days free | Soft commercial close. |

For sv-SE / da-DK use the parallel phrasings already in each locale's Description block above. Re-shoot per locale by switching the device language in Settings → General → Language; don't translate captions only — the in-app text needs to match.

### The 3 app previews

Each preview = one feeling, looped. Don't tour the app.

| # | Concept | Length | Beats |
|---|---|---|---|
| 1 | **Approve a chore** | 15–20 s | Kid taps "Ryd rommet" off → parent gets a quiet badge → parent opens Approvals → taps Approve → kid balance ticks up. End on the number growing. **Core promise.** |
| 2 | **Set up a chore** | 10–15 s | Empty Tasks → tap `+` → fields fill (title "Tøm oppvaskmaskinen", 10 kr, weekly) → Save → it lands in the list. **Removes the "looks complicated" objection.** |
| 3 | **Saving toward a goal** | 15–20 s | Kid Balance → balance grows → goal bar fills → reward unlocks → confetti. **Emotional close, mirrors the lifetime tier's promise.** |

Recording recipe per preview:

1. Pre-seed the database with a known-good fixture so there's content to film against — don't record from a fresh install.
2. `xcrun simctl status_bar booted override ...` (see above).
3. `xcrun simctl io booted recordVideo --codec h264 preview-1.mov`.
4. Trim in iMovie. No music, no titles, no end card — Apple strips them anyway.
5. Export H.264 .mov at 1320 × 2868.
6. Pick a clean poster frame in App Store Connect (skip mid-animation frames).

Per locale: same three concepts, language switched. Four locales × three previews = up to 12 videos. Realistically: ship nb-NO + en for v1, add sv-SE / da-DK in a follow-up release rather than blocking launch.

---

## Cross-platform reminders

- **Bundle / package IDs** must match exactly between RC, the manifest, and the store. Mismatch is the #1 cause of "this app is not configured for sandbox purchases" errors.
- **Same product IDs on both stores** so RC has one canonical mapping per product. Localized display names differ; the ID stays the same.
- **App-store privacy strings** (`NSUserTrackingUsageDescription` etc.) — we don't currently track for ads, so we don't need ATT. If marketing later asks for IDFA, that's a code change + a privacy-label update.
- **Subscription pricing localization** — set the NOK base price; both stores auto-convert to other currencies. Spot-check the EUR/USD prices before submitting.
- **App review notes** — for both stores, include test credentials (sandbox tester / license tester) in the review notes so Apple/Google can actually buy a sub during review.
- **Family Sharing: OFF** on every subscription and on the lifetime IAP. Co-parent access is granted at the household level via Clerk membership, not via Apple/Google family groups. Enabling Family Sharing would let an Apple family-organizer's purchase reach up to 5 unrelated Apple IDs that aren't in the Kroni household — bypasses our entitlement model. App Store Connect → each product → Family Sharing: **Off**. Play Console → subscription → "Eligible for family library" → **Off**.

---

## Universal / app links for kid pairing

The parent app generates `https://kroni.{no,dk,se}/pair/<code>` and shares via the system share sheet. Tapping must open the kid app, prefill the code, and auto-pair. Without this wiring, the URL just opens the marketing site in a browser.

### Files to host on every domain (kroni.no, kroni.dk, kroni.se)

| File                         | Path                                      | Purpose             | Notes                                                                                                                                                                         |
| ---------------------------- | ----------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apple-app-site-association` | `/.well-known/apple-app-site-association` | iOS universal links | JSON, **no extension**, served as `application/json`, no redirects, HTTPS only. Contains `appID = <TeamID>.no.nilsenkonsult.kroni` and `paths: [ "/pair/*" ]`.                |
| `assetlinks.json`            | `/.well-known/assetlinks.json`            | Android App Links   | JSON. List the package `no.nilsenkonsult.kroni` with both the **upload signing key** SHA-256 and the **Play app-signing key** SHA-256 (Play Console → Setup → App integrity). |

### App-side wiring

- `mobile/app.config.ts`:
  - `ios.associatedDomains: ["applinks:kroni.no", "applinks:kroni.dk", "applinks:kroni.se"]`
  - `android.intentFilters` for each host with `action: VIEW`, `category: [BROWSABLE, DEFAULT]`, `autoVerify: true`, `data.pathPrefix: "/pair/"`.
- Custom scheme `kroni://pair?code=…` keeps working as an in-app fallback (used when sharing inside the parent app to a device that already has the app installed).
- Web side: the `/pair/<code>` route on each domain renders a thin landing that triggers the universal link and falls back to App Store / Play store badges if the app isn't installed.

### Verification

- iOS: install via TestFlight, tap a `kroni.no/pair/test` link from Notes → must open the kid app, not Safari. Check `swcutil_show.log` if it doesn't.
- Android: `adb shell pm get-app-links no.nilsenkonsult.kroni` should report `verified` for all three hosts after install.

---

## Store listing copy

Drop these straight into App Store Connect ("App Information" + each localization) and Play Console ("Main store listing" + each translation). Limits: Promotional Text 170, Description 4 000, Keywords 100 (App Store only, comma-separated, no spaces between commas to save chars). Version + Copyright are global on App Store Connect; Play Store reads version from the AAB. Marketing/Support URLs can be the locale-specific marketing site since each Nordic country has its own ccTLD.

> Kept short on purpose — a tight 1 500–2 000-char description outperforms a 4 000-char wall on conversion. Edit before submission, don't pad.

### Norwegian — nb-NO (default, kroni.no)

**App Name** (29 / 30)

```
Kroni - Ukepenger og oppgaver
```

Alternates: `Kroni - Lommepenger uten mas` (28) · `Kroni - Ukepenger for barn` (26)

**Subtitle** — iOS only (30 / 30)

```
Lommepenger som lærer mestring
```

**Short description** — Play only (70 / 80)

```
Ukepenger, oppgaver og belønninger som lærer barn å mestre — uten mas.
```

**Promotional Text** (155 / 170)

```
Lommepenger som lærer barn å mestre, ikke å forvente. Sett oppgaver, godkjenn med ett trykk — og kronene tikker inn. Uten mas.
```

**Description** (~1 950 / 4 000)

```
Kroni er den lille familieappen for ukepenger, oppgaver og belønninger som faktisk passer hverdagen. Laget i Norge, for kjøkkenbordet ditt.

Lommepenger som lærer barn å mestre, ikke å forvente.

DETTE FÅR DU
• Lag oppgaver på sekunder — gjentakende eller engangs
• Sett ukentlig beløp og pause når familien er på ferie
• Godkjenn med ett trykk når oppgaven er gjort
• Se historikk og fremgang per barn, samlet på ett sted
• Egen, enkel app for barnet — ingen forvirrende menyer

SLIK FUNGERER DET
1. Du lager oppgavene. «Rydd rommet», «ta ut søppel», «øv 20 min på piano». Sett beløp og hyppighet én gang — Kroni gjentar resten.
2. Barnet hukar av. Når oppgaven er gjort, trykker barnet på sin enkle «I dag»-liste. Du får et stille varsel — ingen mas, ingen sirener.
3. Du godkjenner — og kronene tikker inn. Ett trykk, saldoen vokser, og helgen blir litt roligere.

UKEPENGER SOM ER PEDAGOGISKE
Du bestemmer beløpet. Mandag morgen lander det på barnets balanse — uten påminnelser, uten krangling. Pause når familien er på ferie, juster når lønna går opp.

BELØNNINGER SOM GIR MENING
Skjermtid, kinokvelder, en helg uten oppvask — du bestemmer hva som er verdt noe i deres hjem. Barna sparer mot et mål de selv valgte.

TRYGT FOR HELE FAMILIEN
Ingen kjøp inne i barnets app. Barneprofilen ser bare det den skal se. Du har full kontroll, hele tiden.

PRISER
• Gratis for alltid: 1 barn, 5 aktive oppgaver, ukepenger
• Familie: 49 kr/måned med 7 dager gratis prøve
• Familie årlig: 399 kr/år (spar 32 %) med 7 dager gratis prøve
• Livstid: 1 200 kr som engangskjøp — ingen fornying

FOR HVEM
Bygd for familier med barn mellom 6 og 14 år. Yngre barn klarer seg fint med foreldrenes hjelp.

PERSONVERN PÅ ALVOR
Ingen sporing for markedsføring, ingen salg av data. GDPR-vennlig og bygd i Norge. Familiene som bruker appen betaler for utviklingen.

Spørsmål? Skriv til support@kroni.no — et ekte menneske svarer, vanligvis samme dag.
```

**Keywords** (87 / 100)

```
lommepenger,ukepenger,oppgaver,barn,familie,belønning,sparing,gjøremål,foreldre,ansvar
```

| Field         | Value                              |
| ------------- | ---------------------------------- |
| Support URL   | `https://kroni.no/nb/support`      |
| Marketing URL | `https://kroni.no/nb`              |
| Version       | `1.0.0`                            |
| Copyright     | `© 2026 Nilsen Konsult`            |

---

### English — en (catch-all, kroni.no/en)

**App Name** (26 / 30)

```
Kroni - Allowance & Chores
```

Alternates: `Kroni - Pocket Money & Chores` (29) · `Kroni - Family Allowance App` (28)

**Subtitle** — iOS only (29 / 30)

```
Chores, allowance, no nagging
```

**Short description** — Play only (71 / 80)

```
Allowance, chores and rewards that teach kids to master, not to expect.
```

**Promotional Text** (152 / 170)

```
Pocket money that teaches kids to master, not to expect. Set chores, approve with one tap, and watch the kroner roll in. No nagging.
```

**Description** (~1 950 / 4 000)

```
Kroni is the small family app for allowance, chores and rewards that actually fits real life. Built in Norway, for your kitchen table.

Pocket money that teaches kids to master, not to expect.

WHAT YOU GET
• Create chores in seconds — recurring or one-off
• Set a weekly allowance and pause whenever you need
• Approve with a single tap when work is done
• See history and progress per child in one place
• A simple, separate app for your kid — no confusing menus

HOW IT WORKS
1. You create the chores. "Tidy the room", "take out the trash", "practice piano 20 min". Set the amount and frequency once — Kroni repeats the rest.
2. Your kid checks them off. When a chore is done, they tap their simple Today list. You get a quiet notification — no nagging, no sirens.
3. You approve — and the kroner roll in. One tap, the balance grows, and Sundays get a little quieter.

ALLOWANCE THAT TEACHES
You set the amount. Monday morning it lands in your child's balance — no reminders, no arguments. Pause for holidays, adjust when life changes.

REWARDS THAT MEAN SOMETHING
Screen time, movie nights, a weekend off dishes — you decide what's worth saving for. Kids work toward a goal they chose themselves.

SAFE FOR THE WHOLE FAMILY
No in-app purchases inside the kid app. The kid profile only sees what it should. You stay in control, always.

PRICING
• Free forever: 1 child, 5 active chores, weekly allowance
• Family: 49 NOK/month with a 7-day free trial
• Family yearly: 399 NOK/year (save 32 %) with a 7-day free trial
• Lifetime: 1,200 NOK one-time — no renewals

WHO IT'S FOR
Built for families with kids aged 6 to 14. Younger children manage fine with parental help.

PRIVACY THAT MEANS IT
No marketing tracking, no data sales. GDPR-friendly and built in Norway. The families who use the app pay for it being built.

Questions? Email support@kroni.no — a real person replies, usually the same day.
```

**Keywords** (88 / 100)

```
allowance,chores,kids,family,rewards,savings,parenting,pocket money,tasks,responsibility
```

| Field         | Value                              |
| ------------- | ---------------------------------- |
| Support URL   | `https://kroni.no/en/support`      |
| Marketing URL | `https://kroni.no/en`              |
| Version       | `1.0.0`                            |
| Copyright     | `© 2026 Nilsen Konsult`            |

---

### Swedish — sv-SE (kroni.se)

**App Name** (29 / 30)

```
Kroni - Veckopeng och sysslor
```

Alternates: `Kroni - Veckopeng utan tjat` (27) · `Kroni - Veckopeng för familjen` (30)

**Subtitle** — iOS only (28 / 30)

```
Veckopeng som lär bemästring
```

**Short description** — Play only (72 / 80)

```
Veckopeng, sysslor och belöningar som lär barn att bemästra — utan tjat.
```

**Promotional Text** (152 / 170)

```
Veckopeng som lär barn att bemästra, inte att förvänta. Skapa sysslor, godkänn med ett tryck, se kronorna trilla in. Inget tjat.
```

**Description** (~1 950 / 4 000)

```
Kroni är den lilla familjeappen för veckopeng, sysslor och belöningar som faktiskt passar vardagen. Byggd i Norge, för ditt köksbord.

Veckopeng som lär barn att bemästra, inte att förvänta.

DET HÄR FÅR DU
• Skapa sysslor på sekunder — återkommande eller engångs
• Sätt veckobelopp och pausa när familjen är på semester
• Godkänn med ett tryck när jobbet är gjort
• Se historik och utveckling per barn, samlat på ett ställe
• En egen, enkel app för barnet — inga förvirrande menyer

SÅ FUNGERAR DET
1. Du skapar sysslorna. «Städa rummet», «ta ut soporna», «öva 20 min på piano». Sätt belopp och frekvens en gång — Kroni upprepar resten.
2. Barnet bockar av. När en syssla är klar trycker barnet på sin enkla «Idag»-lista. Du får en tyst notis — inget tjat, inga sirener.
3. Du godkänner — och kronorna trillar in. Ett tryck, saldot växer, och helgen blir lite lugnare.

VECKOPENG SOM ÄR PEDAGOGISK
Du bestämmer beloppet. Måndag morgon landar det på barnets saldo — utan påminnelser, utan bråk. Pausa under semestern, justera när lönen ändras.

BELÖNINGAR SOM BETYDER NÅGOT
Skärmtid, biokvällar, en helg utan disk — du bestämmer vad som är värt något i ert hem. Barnen sparar mot ett mål de själva valt.

TRYGGT FÖR HELA FAMILJEN
Inga köp inne i barnets app. Barnets profil ser bara det den ska se. Du har full kontroll, hela tiden.

PRISER
• Gratis för alltid: 1 barn, 5 aktiva sysslor, veckopeng
• Familj: 49 kr/månad med 7 dagar gratis prov
• Familj årligen: 399 kr/år (spara 32 %) med 7 dagar gratis prov
• Livstid: 1 200 kr som engångsköp — ingen förnyelse

FÖR VEM
Byggd för familjer med barn mellan 6 och 14 år. Yngre barn klarar sig fint med föräldrarnas hjälp.

INTEGRITET PÅ RIKTIGT
Ingen marknadsföringsspårning, ingen försäljning av data. GDPR-vänlig och byggd i Norge. Familjerna som använder appen betalar för utvecklingen.

Frågor? Skriv till support@kroni.no — en riktig människa svarar, oftast samma dag.
```

**Keywords** (82 / 100)

```
veckopeng,sysslor,barn,familj,belöning,sparande,föräldrar,ansvar,uppgifter,hushåll
```

| Field         | Value                              |
| ------------- | ---------------------------------- |
| Support URL   | `https://kroni.se/sv/support`      |
| Marketing URL | `https://kroni.se/sv`              |
| Version       | `1.0.0`                            |
| Copyright     | `© 2026 Nilsen Konsult`            |

---

### Danish — da-DK (kroni.dk)

**App Name** (29 / 30)

```
Kroni - Lommepenge og opgaver
```

Alternates: `Kroni - Lommepenge uden pjat` (28) · `Kroni - Lommepenge & opgaver` (28)

**Subtitle** — iOS only (29 / 30)

```
Lommepenge der lærer mestring
```

**Short description** — Play only (72 / 80)

```
Lommepenge, opgaver og belønninger der lærer børn at mestre — uden pjat.
```

**Promotional Text** (152 / 170)

```
Lommepenge der lærer børn at mestre, ikke at forvente. Lav opgaver, godkend med ét tryk, og se kronerne tikke ind. Intet pjat.
```

**Description** (~1 950 / 4 000)

```
Kroni er den lille familieapp til lommepenge, opgaver og belønninger, der faktisk passer til hverdagen. Bygget i Norge, til dit køkkenbord.

Lommepenge der lærer børn at mestre, ikke at forvente.

DET HER FÅR DU
• Lav opgaver på sekunder — tilbagevendende eller engangs
• Sæt ugentligt beløb og pause når familien er på ferie
• Godkend med ét tryk når opgaven er klar
• Se historik og fremgang per barn, samlet ét sted
• En egen, enkel app til barnet — ingen forvirrende menuer

SÅDAN FUNGERER DET
1. Du laver opgaverne. «Ryd værelset», «smid skraldet ud», «øv 20 min på klaver». Sæt beløb og hyppighed én gang — Kroni gentager resten.
2. Barnet sætter flueben. Når en opgave er klar, trykker barnet på sin enkle «I dag»-liste. Du får en stille notifikation — ingen brokken, ingen sirener.
3. Du godkender — og kronerne tikker ind. Et tryk, saldoen vokser, og weekenden bliver lidt roligere.

LOMMEPENGE DER ER PÆDAGOGISKE
Du bestemmer beløbet. Mandag morgen lander det på barnets saldo — uden påmindelser, uden skænderier. Pause når familien er på ferie, juster når lønnen ændres.

BELØNNINGER DER BETYDER NOGET
Skærmtid, biografaftener, en weekend uden opvask — du bestemmer hvad der er værd noget i jeres hjem. Børnene sparer mod et mål, de selv har valgt.

TRYGT FOR HELE FAMILIEN
Ingen køb inde i barnets app. Barneprofilen ser kun det, den skal se. Du har fuld kontrol, hele tiden.

PRISER
• Gratis for altid: 1 barn, 5 aktive opgaver, lommepenge
• Familie: 49 kr/måned med 7 dages gratis prøve
• Familie årlig: 399 kr/år (spar 32 %) med 7 dages gratis prøve
• Livstid: 1 200 kr som engangskøb — ingen fornyelse

FOR HVEM
Bygget til familier med børn mellem 6 og 14 år. Yngre børn klarer sig fint med forældrenes hjælp.

PRIVATLIV DER MENER DET
Ingen sporing til markedsføring, intet salg af data. GDPR-venlig og bygget i Norge. Familierne der bruger appen betaler for udviklingen.

Spørgsmål? Skriv til support@kroni.no — et rigtigt menneske svarer, oftest samme dag.
```

**Keywords** (87 / 100)

```
lommepenge,opgaver,børn,familie,belønning,opsparing,forældre,ansvar,husarbejde,gøremål
```

| Field         | Value                              |
| ------------- | ---------------------------------- |
| Support URL   | `https://kroni.dk/da/support`      |
| Marketing URL | `https://kroni.dk/da`              |
| Version       | `1.0.0`                            |
| Copyright     | `© 2026 Nilsen Konsult`            |
