# Webhooks

Backend endpoints that receive events from external services. Both are mounted in `backend/src/app.ts` and live under `backend/src/routes/webhooks/`.

## Endpoints

| Service     | Path                       | Source file                                     | Auth                                                   |
| ----------- | -------------------------- | ----------------------------------------------- | ------------------------------------------------------ |
| RevenueCat  | `POST /api/webhooks/revenuecat` | `backend/src/routes/webhooks/revenuecat.ts` | `Authorization: Bearer ${REVENUECAT_WEBHOOK_AUTH}`     |
| Clerk       | `POST /api/webhooks/clerk`      | `backend/src/routes/webhooks/clerk.ts`      | svix-signed (verified with `${CLERK_WEBHOOK_SECRET}`)  |

## Full URLs

| Environment | RevenueCat | Clerk |
| ----------- | ---------- | ----- |
| **Dev (ngrok)**  | `https://square-logically-shark.ngrok-free.app/api/webhooks/revenuecat` | `https://square-logically-shark.ngrok-free.app/api/webhooks/clerk` |
| **Prod**         | `https://api.kroni.no/api/webhooks/revenuecat`                          | `https://api.kroni.no/api/webhooks/clerk`                          |

The ngrok tunnel domain is `square-logically-shark.ngrok-free.app` (see `backend/package.json` `ngrok` script). Run `npm run ngrok` from `backend/` to start the tunnel locally.

## Configuring the dashboards

### RevenueCat

1. RevenueCat dashboard → Project → Integrations → Webhooks → Add new.
2. URL: paste the env-appropriate URL above.
3. Authorization header: paste the SAME string that's stored as `REVENUECAT_WEBHOOK_AUTH` in Phase. Backend compares the bearer token verbatim — they must match exactly. Generate one with `openssl rand -hex 32` if you don't have one yet, then `phase secrets update REVENUECAT_WEBHOOK_AUTH --value '<generated>'` in `backend/`.
4. Subscribe to all event types — the route already filters; unhandled events are acked + logged + dropped.

### Clerk

1. Clerk dashboard → Webhooks → Add Endpoint.
2. URL: paste the env-appropriate URL above.
3. **No auth header to configure in Clerk's UI** — Clerk signs every request with svix. Copy the **Signing Secret** that Clerk shows after creating the endpoint and save it in Phase as `CLERK_WEBHOOK_SECRET`. Backend verifies the signature using the `svix` package — a mismatch returns 401.
4. Subscribe to events:
   - `user.created` — triggers the welcome email.
   - `email.created` — triggers password-reset / email-verification / OTP / magic-link emails depending on the event's `slug` field.
   - `user.deleted` — currently logs only.

## Swapping between environments

When `EXPO_PUBLIC_API_URL` flips from the ngrok tunnel to `https://api.kroni.no`, update the webhook URLs in BOTH dashboards in lockstep so events still reach the live backend.

## Apple Developer Team ID

`V992VUTLR2` — used in `website/public/.well-known/apple-app-site-association` as `V992VUTLR2.no.nilsenkonsult.kroni`. Bundle ID `no.nilsenkonsult.kroni` matches `mobile/app.config.ts`.

## Related runbooks

- `revenuecat.md` — RC dashboard config (entitlement, products, offering, sandbox testing).
- `email.md` — Mailpace email pipeline (sender domain, DKIM/SPF/DMARC, template structure, Phase 2 events).
- `universal-links.md` — `apple-app-site-association` + `assetlinks.json` placeholder swap instructions.
- `appstore.md` — App Store + Play Store setup (capabilities, IAP products, sandbox testers).
