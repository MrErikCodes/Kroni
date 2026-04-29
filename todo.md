# Kroni — outstanding work

A running list of what's not done, what needs testing, and what's parked. Group by surface.

## Blockers before private beta

- [ ] **Production RevenueCat keys** — currently `test_…`. Replace `EXPO_PUBLIC_RC_IOS_KEY` and `EXPO_PUBLIC_RC_ANDROID_KEY` in Phase + EAS once the App Store / Play subscriptions are live.
- [ ] **Production API URL** — `EXPO_PUBLIC_API_URL` is the ngrok dev tunnel. Swap to `https://api.kroni.no` (or wherever prod lands) before any TestFlight build.
- [ ] **Clerk production keys** — Clerk publishable + secret are `*_test_*`. Generate live keys, update Phase + EAS.
- [ ] **Sentry source-map upload smoke test** — run `npm run release:sentry` once after a real build to confirm a release lands in `sentry.mkapi.no` with symbolicated stacks. Trigger one error on each side and verify the unminified frame.
- [ ] **RevenueCat dashboard config** — see `revenuecat.md`. Until the entitlement / offering / products / webhook are wired, paying paths just no-op.
- [ ] **App Store Connect** — products `kroni_family_monthly`, `kroni_family_yearly`, `kroni_lifetime` (non-consumable). 7-day intro trial on the recurring subs. Localized names per `appstore.md`.
- [ ] **Google Play Console** — same product IDs. Subscription offers configured with 7-day trial eligibility = "New customers".
- [ ] **ToS + Privacy consent on signup** — parent sign-up flow must require explicit acceptance of Terms of Service and Privacy Policy before account creation. Store `accepted_terms_at` / `accepted_privacy_at` timestamps on the user (or household) record. Link to the policy on the user's locale domain (`kroni.no/.dk/.se` + `/en`).

## RevenueCat / billing — still untested end-to-end

- [ ] Sandbox monthly purchase → webhook → `households.subscription_tier = 'family'` + correct `subscription_expires_at`.
- [ ] Sandbox yearly purchase → same, with year-out expiration.
- [ ] Sandbox lifetime purchase → `households.lifetime_paid = true`, no expiry.
- [ ] Cancellation in App Store → `EXPIRATION` event fires when the period ends → tier flips back to free.
- [ ] Lifetime owner does NOT lose access if a stale `EXPIRATION` for a previous sub fires (`isHouseholdPaid` should still return true). Verified in code; needs live test.
- [ ] Restore purchases on a fresh install — re-runs the bridge, RC re-fires events, household re-grants entitlement.
- [ ] Co-parent inheritance — second parent in the household sees `isHouseholdPaid = true` and bypasses kid/task limits.
- [ ] Trial expiration without cancellation → automatic renewal → grants stay continuous.
- [ ] Trial cancellation 24h before end → expiration fires at trial end → tier flips to free.

## Sentry / observability

- [ ] **Connect Sentry to GitHub** so `sentry-cli releases set-commits --auto` actually populates suspect-commit data.
- [ ] **Source maps** — verify both backend and mobile traces are unminified after a build that runs `release:sentry`.
- [x] **PII review** — email removed from Sentry user identity 2026-04-29; userId only.
- [ ] **Performance tracing volume** — backend defaults to 0.1, mobile to 0.2 (1.0 in dev). Tune once we see the actual event volume.
- [ ] **Sentry alerts** — add a rule for "any unhandled error in production" + Telegram/Slack channel.

## Mobile app

- [x] **Subscription detail trial banner** — plumbed periodType through webhook + API + mobile 2026-04-29; banner now shows only when RC reports `period_type: TRIAL`.
- [ ] **Paywall lifetime row** — the i18n strings (`paywall.lifetime` / `lifetimeBadge` / `lifetimeNote`) are added but not yet rendered in `(parent)/paywall.tsx`. RevenueCat's hosted paywall picks up the offering automatically; if/when we replace it with a custom paywall, render those keys.
- [x] **Sentry.wrap(RootLayout)** — wrapped 2026-04-29.
- [ ] **Error surfaces** — kid screens that talk to the API should show inline failures, not silently fall through to the generic "common.error". Same audit done for the rewards modal; tasks/balance still rely on react-query default behavior.
- [ ] **Norwegian copy review** — every i18n string is currently AI-generated. Native speaker pass before launch (look for `// [REVIEW] Norwegian copy` file headers).
- [ ] **Locale support: nb (default), sv, da, + en fallback** — launch markets are NO / SE / DK only. Auto-detect from device locale: `nb-*` → nb, `sv-*` → sv, `da-*` → da, anything else → en (catch-all for non-Nordic speakers). Expose a manual language picker in parent + kid settings. Add `sv`, `da`, `en` translation bundles alongside the existing `nb` one; keep `// [REVIEW]` headers per language for native-speaker passes.
- [ ] **Signup consent UI** — checkbox + linked Terms / Privacy on `parent-sign-up.tsx`. Block submit until checked. Link target = locale-correct domain (`kroni.no/personvern`, `kroni.dk/privatliv`, `kroni.se/integritet`, `/en/privacy` etc.) — pick by current app locale.
- [ ] **Share kid login link from parent app** — generate a deep link from the kid detail screen (e.g. `kroni://pair?code=…` + universal link fallback `https://kroni.no/pair/<code>`). Parent shares via system share sheet; opening the link on the device installs/opens the kid app, prefills the pairing code, and auto-completes pairing without the kid typing anything. Code must be single-use and short-lived (mirror existing pairing-code TTL).

## Backend

- [x] Owner-only invite enforcement — done 2026-04-29. `POST /api/parent/household/invites` rejects with 403 when the requesting parent isn't `households.premiumOwnerParentId`. Mirrors mobile UI's `isOwner` check.
- [x] **`/api/parent/billing/verify-receipt`** — removed dead client method 2026-04-29; RC webhook is authoritative.
- [ ] **Pairing tests** — backend test suite passes locally on the live DB. Wire a fresh test DB so they run in CI.
- [x] Drizzle snapshot baseline rebuild — done 2026-04-29. Introspected live DB, replaced `drizzle/meta/0007_snapshot.json` with full 15-table state, normalized `_journal.json` `when` values + `__drizzle_migrations.created_at` to monotonic 1700000000000 + idx*1000. `npm run db:generate` now reports `No schema changes, nothing to migrate`. Root cause was: legacy migrations 0002–0004 had hand-edited future-dated `when` (e.g. 1798820000000) and drizzle's migrator at `pg-core/dialect.js:62` uses `lastDbMigration.created_at < migration.folderMillis` to decide what to apply (purely timestamp comparison, ignores hash), so 0005–0007 were silently skipped on every `db:migrate` run.
- [ ] **`background-jobs/runner.ts`** is started separately (`npm run start:jobs`); make sure prod has it as its own service / container.
- [ ] **Webhook signing** — RevenueCat webhook uses a shared bearer token (`REVENUECAT_WEBHOOK_AUTH`). Consider switching to an HMAC of the body once RC supports it self-hosted, or whitelist their source IPs at the load balancer.

## Web (kroni.no)

- [x] Update marketing-site pricing to mention "from 49 kr/mo, 399 kr/yr, 1200 kr lifetime, 7 days free" — pricing cards (NO + EN), homepage FAQ, support FAQ. Added "Hvorfor koster Kroni penger?" / "Why does Kroni cost money?" FAQ on both locales.
- [x] Privacy + Terms updates: lifetime purchase terms (vilkår §02 def, §06 priser, §08 betaling, §09 oppsigelse), Sentry crash reporting disclosure (personvern §02, §09, §13). Bumped "updated" to 29. april 2026.
- [ ] **Multi-domain + multi-language site** — kroni.no (nb default), kroni.se (sv default), kroni.dk (da default). Each domain serves its market's language for privacy + terms. Expose `/en` on each domain as the catch-all English fallback for non-Nordic visitors. DNS / Caddy routing per host; Next.js locale segments under `app/[lang]/`.
- [ ] **Localized legal pages** — translate Personvern + Vilkår to sv, da, en. Keep §-numbering aligned across locales so the mobile app can deep-link to a specific clause regardless of language.
- [ ] **Universal-link `/pair/<code>` route** — landing page on kroni.no/.dk/.se that triggers the deep link into the kid app on iOS/Android (with App Store / Play fallback if not installed). Backs the "share kid login link" feature.

## Nice-to-have

- [x] Localized day names in the kid task-detail sheet for languages beyond nb (`formatRecurrence` hard-codes Norwegian `og`). <!-- localized 2026-04-29 via i18n -->
- [x] Reset password flow on the parent app (currently Clerk handles via email, but no UI link). <!-- added forgot-password flow on parent sign-in 2026-04-29 via Clerk reset_password_email_code -->
- [ ] Avatar tweaking after pairing (kid can't currently change their avatar from the kid app).
- [x] Per-kid pairing-code regeneration UI on the kid detail screen (today the parent has to delete + re-add the kid). <!-- shipped 2026-04-29 -->
- [ ] `sentry-expo` source-map upload for OTA updates — only matters once we use EAS Update.

