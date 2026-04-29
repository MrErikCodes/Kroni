# Google Play + RevenueCat setup walkthrough

Sequential checklist for wiring `no.nilsenkonsult.kroni` into Google Play + RevenueCat for Android. Pairs with `docs/appstore.md` (the iOS equivalent is already done) and `docs/revenuecat.md` (canonical product/entitlement IDs).

Resume from whichever step you stopped at — each step states its own preconditions.

---

## Differences from iOS (already done)

| Concern | iOS (done) | Android (this doc) |
|---|---|---|
| Auth to store API | App Store Connect API key (.p8) | Service account JSON |
| Push channel for subs | APNs key (.p8) | Pub/Sub topic via RTDN |
| Webhook into RC | App Store Server Notifications V2 | Real-time Developer Notifications |
| Sandbox | Sandbox testers (ASC) | License testers (Play Console) |
| Review screenshot | Required per product | Not needed — Play reviews the app build |
| Lifetime IAP | Non-consumable IAP | "In-app product" (Managed) |

---

## Step 1 — Add the Android app in RC

RC dashboard → **Apps → + New** → choose **Play Store**.

- App name: `Kroni Android`
- Package name: `no.nilsenkonsult.kroni` (must match `mobile/app.config.ts:57`)

The form will ask for the service account JSON next. Get that ready in Step 2 first.

---

## Step 2 — Create the Google Cloud service account

This is what lets RC call the Play Developer API to verify purchases and read subscription state.

1. **console.cloud.google.com** → pick your project (or create one named `kroni`).
2. **IAM & Admin → Service Accounts → + Create service account**.
3. Name: `revenuecat`. Description: `RevenueCat → Play Developer API`.
4. Click **Done** without granting any project roles (Play permissions are granted in Play Console, not GCP IAM).
5. Click into the new service account → **Keys → Add Key → Create new key → JSON**. Downloads a `.json` file. **Save it securely** (1Password) — you only get to download it once.

---

## Step 3 — Grant Play Console API access

The non-obvious part: Play permissions live in **Play Console**, not GCP IAM.

1. **Play Console → Setup → API access**.
2. First time only: "Link to existing project" or "Create new project" prompt. Pick the same GCP project that holds the service account from Step 2.
3. Once linked, scroll to **Service accounts** — your `revenuecat` account should appear. If not, click **Refresh service accounts**.
4. Click **Grant access** on its row → toggle these permissions:
   - View app information and download bulk reports
   - View financial data, orders, and cancellation survey responses
   - Manage orders and subscriptions
5. **Apply** → choose all apps (or just Kroni). Save.

---

## Step 4 — Upload the JSON to RC

In RC's Android app form (from Step 1), upload the `.json` from Step 2. Save.

RC validates by making a test API call:
- ✅ green badge = working
- ❌ red = either the JSON is wrong or Play permissions in Step 3 haven't propagated (give it a minute and retry)

---

## Step 5 — Real-time Developer Notifications (RTDN)

Play's equivalent of Apple's Server Notifications. Without this, RC polls slowly; renewals/refunds lag.

1. RC → **Project → Apps → Kroni Android → Real-time Developer Notifications**.
2. RC gives you a **Topic name** (e.g., `projects/revenuecat-prod/topics/play-events-xyz`). Copy it.
3. **Play Console → Monetize → Monetization setup** (NOT API access — different page).
4. Scroll to **Real-time developer notifications**.
5. Paste the topic name. Save.
6. Click **Send test notification** — should land as ✅ in RC within seconds.

---

## Step 6 — Create the products in Play Console

### Subscriptions

**Monetize → Products → Subscriptions → Create subscription** — twice:

| Product ID | Name | Base plan ID | Period | Price |
|---|---|---|---|---|
| `kroni_family_monthly` | Kroni Familie Månedlig | `monthly-autorenewing` | 1 month | 49 NOK |
| `kroni_family_yearly` | Kroni Familie Årlig | `yearly-autorenewing` | 1 year | 399 NOK |

For each, after creating:
- **Subscription benefits** → 3–5 short bullets describing what the user gets
- **Base plan** → auto-renewing period and price set above
- **Offers → + Add → Free trial** → 7 days, eligibility **"Developer determined: New customer acquisition"**
- **Real-time notification preferences** → on
- **Family Sharing eligibility: Off** (co-parent access via Clerk household, not Google Family — see `docs/appstore.md:105`)

### Lifetime (one-time)

**Monetize → Products → In-app products → Create product**:

| Product ID | Type | Name | Price |
|---|---|---|---|
| `kroni_lifetime` | Managed product | Kroni Familie Livstid | 1199 NOK |

Localizations (nb-NO + en-US minimum, ideally also sv-SE + da-DK):

| Locale | Title | Description |
|---|---|---|
| nb-NO | Kroni Familie Livstid | Engangskjøp. Full familietilgang for alltid. |
| en-US | Kroni Family Lifetime | One-time purchase. Family access forever. |
| sv-SE | Kroni Familj Livstid | Engångsköp. Full familjeåtkomst för alltid. |
| da-DK | Kroni Familie Livstid | Engangskøb. Fuld familieadgang for altid. |

**Activate** each product once everything is filled in.

---

## Step 7 — Connect the Play products to existing RC products

The iOS products already exist in RC with these IDs. RC supports one entry per ID with both stores attached.

For each existing RC product (`kroni_family_monthly`, `kroni_family_yearly`, `kroni_lifetime`):
1. RC → **Products** → click the product row.
2. Click **Connect Play Store product** (or similar — UI varies).
3. Pick the matching Play product. Save.

Each product should now show **two store badges** (App Store + Play Store) green.

> Don't create new RC product entries for Play — that fragments the data model. One RC product = one cross-platform product.

---

## Step 8 — Entitlement + offering: nothing to do

The `kroni_family` entitlement and `default` offering are platform-agnostic in RC. Once each product has both stores connected, the same offering serves Android paywalls automatically. The paywall config done for iOS applies to Android too.

---

## Step 9 — Drop the Android public SDK key into Phase + EAS

RC → **Project settings → API keys → Play Store** → copy the `goog_…` public key.

```bash
cd mobile

phase secrets update EXPO_PUBLIC_RC_ANDROID_KEY --value "goog_..."

V=$(phase secrets get EXPO_PUBLIC_RC_ANDROID_KEY | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{console.log(JSON.parse(d).value)})")
npx eas-cli env:create --force --visibility sensitive --type string \
  --name EXPO_PUBLIC_RC_ANDROID_KEY --value "$V" \
  --environment development --environment preview --environment production
```

Verify:
```bash
npx eas-cli env:list --environment production | grep RC_ANDROID
```

---

## Step 10 — License testers (Play's "sandbox")

Unlike Apple's Sandbox testers, Play uses real Google accounts marked as testers.

1. **Play Console → Setup → License testing**.
2. Add the Gmail addresses of every teammate who needs to test paid flows. They see "test purchases" instead of being charged.
3. **License test response: RESPOND_NORMALLY** so purchases reach RC.

---

## Step 11 — Build, internal testing track, capture screenshot

Unlike iOS, Play doesn't require a per-product review screenshot. But you still want a screenshot to verify the paywall renders correctly before submitting for review.

```bash
cd mobile
eas build --profile production --platform android
eas submit --platform android --latest --track internal
```

After processing (~30 min):

1. **Play Console → Internal testing → Testers** → add yourself + license testers via the opt-in URL.
2. Open the URL on an Android device → install Kroni from the Play Store via the test link.
3. Sign in to the device with a **license-tester Google account**.
4. Open Kroni → sign in as a Clerk parent → Settings → **Oppgrader til Familie**.
5. Paywall renders with NOK prices and the trial badges.
6. Buy the monthly trial in test mode.
7. Backend log should show `INITIAL_PURCHASE` event with `period_type: TRIAL`.

---

## Step 12 — App-level review notes (Play's equivalent of Apple's per-product notes)

Play doesn't have per-product review notes. Instead:

**Play Console → Main store listing → Notes for review** (or **App content → Reviewer notes**):

```
Sandbox account credentials (license tester):
  email: <test-account@gmail.com>
  password: <password>

How to access subscriptions:
1. Sign in with Clerk (use the demo parent account in TestFlight notes — same applies to Play tester)
2. Settings → "Oppgrader til Familie"
3. Paywall shows three options: Monthly (49 NOK), Yearly (399 NOK, 32% off), Lifetime (1199 NOK)

Subscriptions are managed via RevenueCat. Entitlement identifier: `kroni_family`.
RTDN topic is configured for billing events. Test purchases reach RC's webhook,
which updates the household subscription tier in our backend.

Lifetime IAP grants permanent access regardless of subscription expiration.
Family Sharing is intentionally disabled — co-parent access uses our own
household model via Clerk authentication.

7-day free trial on monthly + yearly subscriptions, eligibility:
"Developer determined: New customer acquisition".
```

---

## Step 13 — Submit

1. **Production track** → create release → upload AAB (or promote from internal).
2. Fill in **What's new in this release**.
3. **App content** → confirm Data safety, Content rating, Target audience are all set.
4. **Send for review**.

First-time review takes 3–7 days. After that, expect 1–2 hours per update.

---

## Verification checklist (run before submission)

- [ ] Service account JSON uploaded to RC, status green
- [ ] RTDN topic configured, test notification successful
- [ ] All 3 products active in Play Console
- [ ] All 3 products show both store badges green in RC
- [ ] Free trial offers attached to monthly + yearly subscriptions
- [ ] Family Sharing eligibility off on all 3 products
- [ ] License testers added in Play Console
- [ ] `EXPO_PUBLIC_RC_ANDROID_KEY` in Phase + EAS for all 3 environments
- [ ] Production AAB built and uploaded to Internal testing
- [ ] Real test purchase on a license-tester device fires `INITIAL_PURCHASE` to backend
- [ ] Restore Purchases works on a clean install of the same Google account
- [ ] App-level review notes filled in with test credentials + entitlement reference
- [ ] Data safety form filled in (`docs/appstore.md` § "Data safety form")

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| RC service account badge red | Permissions in Play Console didn't propagate | Wait 5 min, refresh service accounts in Play Console, retry |
| Paywall blank on Android | Products inactive in Play Console, or RC SDK key missing | Activate products; verify `EXPO_PUBLIC_RC_ANDROID_KEY` is in EAS env list |
| `INITIAL_PURCHASE` doesn't fire | RTDN not configured, or product not linked in RC | Re-test RTDN; check both store badges on RC product |
| "This version of the app is not configured for billing" on test purchase | License tester not added, OR test build not on a track the tester can install | Add to License testing AND Internal testing track |
| Trial doesn't show "7 days free" on paywall | Free trial offer not active on the base plan | Subscription → base plan → Offers → activate the trial |

---

## Related docs

- `docs/appstore.md` — App Store + Play Store overview, capabilities, store listing copy
- `docs/revenuecat.md` — canonical product IDs, entitlement, webhook semantics
- `docs/closedbeta.md` — testing flow once builds are out
- `mobile/lib/billing.ts` — entitlement check (`kroni_family`)
- `backend/src/routes/webhooks/revenuecat.ts` — backend webhook handler
