# Closed beta — TestFlight + Google Play

How to ship a private build to ~10 families (one parent + one or more kids per family) so they can install Kroni on real devices without the app being public.

The two stores treat closed testing differently. Plan for ~1 day of setup; testers can install within an hour after that.

---

## 0. What "ten families" means in practice

Each family needs:

- **One Apple ID + one Google account** for the parent (signs in with Clerk, owns the subscription).
- **One Apple ID + one Google account per kid** (signs in via 6-digit pairing code, no app-store account needed for the kid app — but the device the kid uses still has to be enrolled as a tester to install the build).

So 10 families ≈ 20–40 individual store testers. Both TestFlight and Play Internal Testing handle this scale comfortably (limits are 10,000 / 100 respectively).

If a kid uses the family's spare iPad / hand-me-down Android, you can use the parent's tester account on that device too — the app's own kid auth is independent of the App Store account.

---

## 1. Get a build ready

The same EAS build artifact is used for both stores' testing tracks.

### iOS

```bash
cd mobile
eas build --profile production --platform ios
```

The build produces an `.ipa`. Then:

```bash
eas submit --platform ios --latest
```

This uploads to App Store Connect → TestFlight. First-time uploads take 30–60 minutes for Apple's binary processing, then "Missing Compliance" prompts for the encryption-export answer (we don't use proprietary crypto → say "No, this app does not use any non-exempt encryption").

### Android

```bash
eas build --profile production --platform android
```

Produces an `.aab`. Then:

```bash
eas submit --platform android --latest --track internal
```

This uploads to Play Console → Testing → Internal testing. Available to internal testers within ~10 minutes; license-tester accounts on the device can install via the opt-in URL.

### Build prereqs

- App Store Connect record exists (`no.nilsenkonsult.kroni`).
- Google Play app record exists with at least an **internal testing** track.
- Both apps have all the products (`kroni_family_monthly`, `kroni_family_yearly`, `kroni_lifetime`) at least in "Ready to Submit" state — closed-beta testers can buy if you've configured prices, otherwise the paywall errors. For a free beta, leave products inactive and rely on backend overrides (see §6).
- EAS secrets contain production-or-staging values for `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_RC_*`, `SENTRY_*`. (See `appstore.md`.)

---

## 2. iOS — TestFlight

### Add internal testers (your team)

App Store Connect → your app → **TestFlight** → Internal Testing.

- Internal testers must already be in your App Store Connect team (Users and Access). They can install without Apple review, immediately after a build finishes processing.
- Limit: 100 internal testers.
- Best for: you + immediate friends/family who can debug.

### Add external testers (the 10 families)

External testing requires Apple's beta review (one-time per major version, usually < 24h).

Two ways to add testers:

**Option A — public TestFlight link (simplest for 10 strangers)**

1. App Store Connect → TestFlight → External Testing → Create a public link (or use an existing group).
2. Add a description: "Kroni private beta — please report bugs via the in-app Settings → Kopier app info link."
3. Apple requires a "Beta App Review Notes" with sandbox reviewer credentials (one of your Apple sandbox testers + their password). They actually launch the app during review.
4. Copy the public TestFlight URL (`https://testflight.apple.com/join/XXXXXXXX`).
5. Send the URL to families. They install **TestFlight** from the App Store, open the URL, tap "Accept" → "Install".

**Option B — invite by email (more control over who joins)**

1. Same screen → External group → "+ Add testers" → enter family emails one at a time.
2. Apple emails each invitee a code; they paste it into TestFlight.
3. Lets you revoke per-tester later.

Either path: builds promoted to External need beta review. Allow ~24h on the first build of each version.

### What testers actually do

1. Install TestFlight (App Store).
2. Open your invite link → "Accept" → install Kroni.
3. The TestFlight icon stays on the home screen as a way to send feedback / see version history.
4. **Sandbox subscriptions**: when they hit the paywall in your beta build, they're charged sandbox-only. They need to sign into a **sandbox Apple ID** (Settings → App Store → Sandbox Account) for purchases not to charge real money. Mention this in your invitation email.

### Crash reports + screenshots

- TestFlight users who shake the device or long-press the TestFlight icon get "Send feedback" → screenshot + freeform text → attaches the device's last crashes.
- All crash logs aggregate in App Store Connect → TestFlight → Crashes. They'll also flow into Sentry once that's wired (see `revenuecat.md`).

---

## 3. Android — Google Play closed testing

Three tracks: **internal** (instant, up to 100 testers), **closed** (requires app review-lite, up to 100 testers per group), **open** (anyone with a link).

For a 10-family beta, **internal** is plenty.

### Add internal testers

Play Console → your app → **Testing → Internal testing** → tab "Testers".

1. **Create email list** → name it "Kroni private beta" → paste tester emails (one per line).
2. Save. Each email must be a Google account (Gmail or Workspace; Apple Mail accounts don't work).
3. **Copy opt-in URL** at the bottom of the page (`https://play.google.com/apps/internaltest/...`).
4. Send the URL to testers; they tap **"Become a tester"**, then the link automatically opens the Play Store listing where they install the beta build like any other app.

### Closed testing (only if you exceed 100 testers OR want a longer-term track)

Same flow but under **Closed testing** instead of internal. First closed-test launch requires you to fill out:

- App content (data safety, privacy policy, content rating).
- A short "Why are you doing closed testing?" form Google added in 2023.
- Apparently 12 testers must remain enrolled for 14 continuous days before Google will let you graduate to Production. For a 10-family beta this is fine; just keep the testers enrolled.

### Sandbox purchases

- Tester emails must be added to **Setup → License testing** in Play Console — separate list from the internal tester list. Anyone in license testing buys with the "test card" by default (no real charges) and can pick the response (always approve / always decline / etc.).
- Subscriptions in license-testing mode renew on accelerated cycles too.

---

## 4. What to communicate to testers

A short email/DM template to send each family:

> Hei!
>
> Du er invitert til den lukkede betaen av Kroni — appen for ukepenger, oppgaver og belønninger til familier.
>
> **Slik kommer du i gang (forelder-telefon):**
> 1. **iPhone**: Last ned **TestFlight** fra App Store. Åpne deretter denne lenken: <TestFlight URL>
> **Android**: Åpne denne lenken på telefonen din og trykk "Become a tester": <Play opt-in URL>
> 2. Installer **Kroni** når den dukker opp.
> 3. Lag en konto (forelder), legg til barnet ditt og generer en paringskode.
>
> **Slik gjør barnet (barnets telefon):**
> 1. Installer Kroni på samme måte som over (TestFlight-lenke / Play-lenke).
> 2. Velg "Barn" på første skjerm, skriv inn 6-sifret kode fra forelderens app.
>
> **Hvordan rapportere bugs:**
> Åpne Innstillinger i appen → trykk **Kopier app info** → lim inn i en melding til oss + en kort beskrivelse av hva som skjedde.
>
> **Betaling:**
> Du blir ikke belastet for ekte penger — Apple/Google bruker testkonti i denne fasen. Hvis appen ber om kjøp, gå gjennom flyten som vanlig; det er en del av testen.

---

## 5. What you watch during the beta

| Channel | What to look for |
|---|---|
| **Sentry** (`sentry.mkapi.no`) | Unhandled errors, especially on cold-start. Distributed traces should link mobile → backend transactions. |
| **Backend logs** (Phase / your runtime) | `parent_id`, `kid_id`, `install_id` tags appear on each authenticated request. Grep by `install_id` from a tester's "Kopier app info" blob to replay their session. |
| **TestFlight feedback / Play console pre-launch** | Screenshots + crash logs that bypass Sentry (e.g. native crashes during boot). |
| **RevenueCat dashboard** | Customers tab → search a tester's `app_user_id` (= Clerk userId) → see every event, entitlement state, and any failed renewals. Also gives you "what RC sent us" so you can match webhook hits in backend logs. |
| **kid_installs / parent_installs tables** | Quick sanity check that requests are coming through. `select * from parent_installs order by last_seen_at desc limit 10;` answers "is anyone using this right now". |

---

## 6. Granting beta testers premium without charging

Optionally, give beta families full access for the duration without making them sandbox-buy. Two ways:

**Quick + dirty (recommended for closed beta):**

```sql
UPDATE households
   SET subscription_tier = 'family',
       subscription_expires_at = now() + interval '90 days'
 WHERE id IN (
   SELECT household_id FROM parents WHERE email IN (
     'tester1@example.com',
     'tester2@example.com'
     -- ...
   )
 );
```

Run that against your DB after each tester signs up. They'll see Kroni Familie active in the subscription detail screen until the date you set.

**Cleaner**: add a `bypass_paywall` boolean to `households` and check it in `isHouseholdPaid`. Worth doing if the beta runs longer than a month.

---

## 7. When you're ready to graduate to public

- Promote the TestFlight build → **App Store Review** (App Store Connect → Distribution → Add for Review).
- Promote internal-testing build to **Closed → Open testing → Production** in Play Console (each step requires the new "12 testers for 14 days" rule for first-time pubs).
- Update `EXPO_PUBLIC_API_URL` to production, `_CLERK_PUBLISHABLE_KEY` to live, RC keys (still the same, but switch the SDK environment indicator if you're using RC sandbox toggles).
- Switch the RC webhook URL from ngrok to `https://api.kroni.no/api/webhooks/revenuecat`.
- Re-confirm Sentry releases match the App Store / Play build version + build number.
