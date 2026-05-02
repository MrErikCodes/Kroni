# iOS sign-in debugging — TestFlight build

You shipped a TestFlight build, tapped Sign In, and got "Klar om litt — appen
laster fortsatt". Android dev works. EAS env vars are correct
(`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…Y2xlcmsua3Jvbmkubm8k` →
`clerk.kroni.no`). `https://clerk.kroni.no/` confirmed reachable from a
browser, with valid TLS. So the bundle has the right key AND the FAPI is up
on the public internet. The remaining unknown is whether the iPhone on its
current network can actually reach the host — and whether the local dev env
(Phase) is using the same `pk_live_*` key or a different `pk_test_*`.

This runbook walks through the diagnostic, in priority order based on what's
most likely given the above. Stop as soon as you find the cause.

---

## Hypothesis ranking (after browser-reach + iPhone-reach BOTH confirmed)

iPhone Safari hitting `https://clerk.kroni.no/v1/client` returns a 200 JSON
client response. Network reach from the device is fine. Updated ranking:

1. **Wrong key inlined into the bundle at build time** — bundle ships with
   empty/test/old key despite EAS dashboard being correct. Could happen if a
   local `expo prebuild` + Xcode archive bypassed EAS env, or if EAS evaluated
   `app.config.ts` with the wrong env scope. The `[clerk] publishableKey pk_…`
   boot log added in this session will reveal this in seconds.
2. **Phase ≠ EAS divergence** — explains why dev "works": Phase serves a
   `pk_test_*` key whose FAPI is `*.clerk.accounts.dev` (bulletproof). Even
   if both keys exist, the comparison "Android works, iOS doesn't" doesn't
   actually test the same Clerk instance.
3. **Clerk SDK throwing during init** — bad key format, internal SDK error,
   tokenCache exception. Would surface in Sentry as an unhandled error.
4. **SecureStore `tokenCache.getToken` hang on this specific device** — iOS
   Keychain occasionally returns very slowly; we await it without a timeout.
5. **iOS-specific `@clerk/clerk-expo` regression** — bumped recently in
   commit `a1c6baa`. Low probability; would have hit other users.

## Pre-rebuild free diagnostics (do FIRST)

Both can be done in 5 minutes without touching the build pipeline.

### A. Sentry

`sentry.mkapi.no` → kroni-mobile project → Issues, filter "Last 24h".

- Look for: errors with stack traces in `@clerk/clerk-expo`, anything
  mentioning `publishableKey`, anything with `Frontend API`, `FAPI`, or
  `clerkjs`.
- Boot-time crashes captured by `Sentry.wrap(RootLayout)` would show here.

### B. Console.app on existing build

Plug iPhone in. Open Console.app → Devices → your iPhone. Filter:
`Kroni OR Clerk OR clerk`. Click **Start streaming**. Force-quit Kroni on
the phone, then cold-launch.

Look for around launch (first ~5 seconds):
- `[sign-in] press` lines once you tap (existing log) — confirms `isLoaded:
  false, hasSignIn: false`.
- Any line containing `Clerk` from the SDK — warnings about invalid keys,
  failed fetches, throttling.
- Network errors (`NSURLErrorDomain`, `Could not connect to the server`).

If A or B reveals the cause, skip to the relevant fix below. Otherwise
rebuild with diagnostics (Section 2) and continue.

---

## 0. What changed in the app

A previous session added three things you'll use today:

1. **Boot-time log** in `mobile/app/_layout.tsx`:
   ```
   [clerk] publishableKey pk_live_… (len NN)
   ```
   Tells you what was actually inlined into the bundle.

2. **6-second timeout** in `mobile/app/auth/parent-sign-in.tsx`. Sit on the
   sign-in screen for 6 s without typing — if Clerk hasn't initialised, you'll
   see the new copy:
   - **NB:** "Kunne ikke nå innloggingstjenesten. Sjekk internettforbindelsen og prøv igjen."
   - **EN:** "Couldn't reach the sign-in service. Check your internet connection and try again."
   This also fires `Sentry.captureMessage('clerk init timeout (6s)', warning)`.

3. **Buttons gated on `!isLoaded`** — Sign In and 2FA Confirm are disabled
   until Clerk reports loaded. You can no longer race the init.

If the new copy is what you see (not the old "klar om litt"), the build did
ship the new code. If it still says the old text, the iPhone is running an
older cached build — bump the build number and reinstall.

---

## 1. Pre-flight checks (do BEFORE rebuilding)

### 1a. Compare Phase vs EAS values

Local dev (Android) reads from Phase. Prod iOS reads from EAS. They can drift.

```bash
# Phase value (what your local dev uses)
cd ~/Kroni/mobile          # or wherever the repo is on Mac
phase secrets list --env production | grep CLERK
# or, if Phase has 'dev' env for local:
phase secrets list --env dev | grep CLERK

# EAS value (what prod TestFlight uses)
eas env:list --environment production | grep CLERK
```

Both should show `pk_live_Y2xlcmsua3Jvbmkubm8k`. If Phase shows `pk_test_*`,
that's why dev "works" (it's hitting a test instance that's properly set up)
while prod hits the live instance that may not be.

### 1b. DNS check from your Mac

```bash
dig clerk.kroni.no
# Should return a CNAME pointing at frontend-api.clerk.services or similar.
# If you get NXDOMAIN or no answer: DNS isn't set up at the registrar yet.

dig clerk.kroni.no @1.1.1.1
# Same query against Cloudflare DNS — confirms the answer is propagated.
```

Expected: a CNAME like `clerk.kroni.no. → frontend-api.clerk.services.`
(exact target depends on what Clerk gave you).

### 1c. TLS reachability from your Mac

```bash
curl -sv https://clerk.kroni.no/v1/client 2>&1 | head -40
```

Look for:
- `* SSL connection using TLSv1.3 / ...` → TLS works
- HTTP `200` or `401` JSON body → Clerk FAPI is up at this hostname
- `curl: (60) SSL certificate problem` → cert isn't provisioned yet
- `curl: (6) Could not resolve host` → DNS not propagated
- `curl: (7) Failed to connect` → DNS resolves but no listener

If any of these fail, that's your root cause. Fix the DNS/cert in the Clerk
dashboard (Domains → Production → reissue cert / verify CNAME) before
rebuilding the app.

### 1d. Same check from the iPhone (CRITICAL — this is now the top diagnostic)

You already confirmed `https://clerk.kroni.no/` works in your desktop
browser. The remaining question is whether your **iPhone** on its current
network can reach it.

From the iPhone's Safari, open:
```
https://clerk.kroni.no/v1/client
```

Expected: a JSON body (likely a 401 with JSON content) — NOT a "can't
connect" or cert-warning page.

- ✅ JSON loads → iPhone reaches Clerk fine. Hypothesis 2 dead, focus on
  Hypothesis 1 (Phase/EAS divergence) and Hypothesis 4 (SecureStore hang).
- ❌ Safari shows "cannot connect" / DNS error → iPhone network can't reach
  `clerk.kroni.no`. Try toggling cellular ↔ wifi. If it only fails on one
  network, that network is the problem (captive portal, MDM, carrier DNS).
- ❌ Safari shows cert error → MITM proxy on this network. Same wifi as Mac?

Also try toggling airplane mode → off, force-quit Kroni, retry sign-in.

---

## 2. Build + install

```bash
cd ~/Kroni/mobile
eas build -p ios --profile production --auto-submit
```

`--auto-submit` pushes to TestFlight automatically once the build succeeds.
Wait for the email, then update on the iPhone.

Build number autoIncrements (eas.json line 21), so the new install will be
distinct from the broken one even if you pin the version string.

---

## 3. Read the device console (the diagnostic that matters)

Plug iPhone into Mac with cable, accept "Trust this computer".

### Console.app (recommended)

1. Open **Console.app** on Mac.
2. In the left sidebar pick your iPhone under **Devices**.
3. In the top-right search box: `clerk`
4. Click **Start streaming** (top-left, looks like a play button).
5. Cold-launch Kroni on the phone (force-quit first, then tap the icon).

What you're looking for, near the top of the stream:

```
[clerk] publishableKey pk_live_… (len 38)
```

Then sit on the sign-in screen for 8+ seconds. If FAPI fails:

```
[Sentry] captureMessage clerk init timeout (6s)
```

### Xcode alternative

If Console.app is noisy, **Xcode → Window → Devices & Simulators → pick
iPhone → Open Console** does the same thing with better filtering.

### Filter for sign-in attempts too

Add filter `[sign-in]` to also catch the existing log lines from
`parent-sign-in.tsx` when you tap the button:

```
[sign-in] press { isLoaded: false, hasSignIn: false, email: '...' }
```

If `isLoaded: false` is logged at button-press time AFTER the gate, that's a
bug in the gating. Should never happen.

---

## 4. Interpret what you see

| Console log | Meaning | Fix |
|---|---|---|
| `[clerk] publishableKey (empty)` | Env var didn't get inlined into the bundle. EAS-Build guard in `app.config.ts` should've prevented this. | Check `eas.json` profile uses `"environment": "production"`, then check EAS dashboard env scope. Rebuild. |
| `[clerk] publishableKey pk_test_…` | Wrong key bundled — `pk_live_*` is in EAS dashboard. Local prebuild bypassed EAS env? | Confirm you ran `eas build`, not `expo prebuild` + Xcode archive. Phase env may have leaked into the build. |
| `[clerk] publishableKey pk_live_Y2xlcmsua3Jvbmkubm8k…` AND timeout fires | Right key, but FAPI unreachable. Almost certainly DNS/cert for `clerk.kroni.no`. | Go to Clerk dashboard → Domains → Production. Verify CNAME shows green. Re-run pre-flight 1b/1c. |
| `[clerk] publishableKey pk_live_…` AND no timeout AND sign-in still fails | Clerk loaded fine; failure is downstream (wrong password, account not found, locked). | Read the Clerk error in the inline error box on screen. |

---

## 5. If hypothesis 3 (FAPI unreachable) is confirmed

1. Open Clerk dashboard → your production application → **Domains**.
2. Production domain should show `kroni.no` with **CNAME verified ✅** and
   **SSL certificate ✅**. If either is amber/red, click **Verify** or
   **Reissue certificate**.
3. The CNAME records Clerk needs are typically:
   - `clerk.kroni.no` → `frontend-api.clerk.services` (or a per-instance host)
   - `accounts.kroni.no` → `accounts.clerk.services`
   - Plus a couple for email DKIM
4. Add/correct any missing records at your DNS provider (Cloudflare /
   wherever `kroni.no` is hosted). Wait 5–30 min for propagation, retry the
   `dig` and `curl` checks above.
5. Once `curl https://clerk.kroni.no/v1/client` returns JSON, the existing
   TestFlight build will start working without a rebuild — Clerk init is
   purely runtime, no app changes needed.

---

## 6. Sanity checks you can skip if pressed for time

- **App Transport Security**: native iOS only allows HTTPS by default. Clerk
  is HTTPS, so this is a non-issue.
- **Clerk SDK version**: `@clerk/clerk-expo` was bumped recently
  (commit `a1c6baa`). If you suspect SDK regression, `git log
  -- mobile/package.json | head -20` and check for any post-bump auth
  reports.
- **Sentry**: when the timeout fires, the breadcrumb + captureMessage land in
  Sentry. Check `sentry.mkapi.no` → kroni-mobile project → Issues for
  `clerk init timeout` to confirm it's reaching Sentry too (rules out total
  network loss on the device).

---

## 7. Quick rollback plan if you can't fix it tomorrow

If `clerk.kroni.no` provisioning is blocked and you need a working build for
a demo, you can temporarily point the prod app at Clerk's hosted FAPI:

1. In Clerk dashboard, find the **non-custom-domain** publishable key — looks
   like `pk_live_<long base64 ending in $>`, base64 decodes to
   `<your-app>.clerk.accounts.dev$` instead of `clerk.kroni.no$`.
2. `eas env:create --environment production --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value "<that key>" --force`
3. Rebuild. App will use Clerk's default FAPI which is always reachable.
4. Switch back to the custom-domain key once DNS is sorted.
