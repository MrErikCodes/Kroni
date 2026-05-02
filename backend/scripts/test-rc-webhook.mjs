#!/usr/bin/env node
// Replay a synthetic RevenueCat webhook against the backend so we can
// exercise EXPIRATION / RENEWAL / BILLING_ISSUE flows without waiting for
// the sandbox subscription cycle.
//
// Required env (via `phase run`):
//   REVENUECAT_WEBHOOK_AUTH   bearer token the route compares against
//
// Optional env:
//   BACKEND_URL               default http://localhost:3000
//
// Usage:
//   phase run -- node backend/scripts/test-rc-webhook.mjs --type EXPIRATION --user user_xxx
//   phase run -- node backend/scripts/test-rc-webhook.mjs --type INITIAL_PURCHASE --user user_xxx --product kroni_family_yearly --expires-in-ms 3600000
//   phase run -- node backend/scripts/test-rc-webhook.mjs --type BILLING_ISSUE --user user_xxx
//
// Notes:
//   - EXPIRATION omits expiration_at_ms so the route's "stale event" guard
//     never short-circuits the revoke (revenuecat.ts:396-408).
//   - Each call mints a fresh event id so the idempotency table doesn't
//     dedupe a re-run.

import { randomUUID } from 'node:crypto';

const args = parseArgs(process.argv.slice(2));
const type = (args.type ?? 'EXPIRATION').toUpperCase();
const userId = args.user;
const productId = args.product ?? 'kroni_family_yearly';
const expiresInMs = Number(args['expires-in-ms'] ?? 3_600_000);

if (!userId) {
  console.error('Missing --user <clerkUserId>. Find it in app settings → Kopier app info.');
  process.exit(2);
}

const auth = process.env.REVENUECAT_WEBHOOK_AUTH;
if (!auth) {
  console.error('REVENUECAT_WEBHOOK_AUTH is not set. Run via `phase run -- node ...`.');
  process.exit(2);
}

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:3000';

const now = Date.now();
const baseEvent = {
  type,
  id: `script-${randomUUID()}`,
  event_timestamp_ms: now,
  app_user_id: userId,
  original_app_user_id: userId,
  aliases: [userId],
  product_id: productId,
  environment: 'SANDBOX',
  store: 'TEST_STORE',
  period_type: 'NORMAL',
};

let event;
switch (type) {
  case 'EXPIRATION':
    // Omit expiration_at_ms so the stale-expiration guard falls through
    // and the household is revoked unconditionally.
    event = baseEvent;
    break;
  case 'INITIAL_PURCHASE':
  case 'RENEWAL':
  case 'PRODUCT_CHANGE':
  case 'UNCANCELLATION':
  case 'NON_RENEWING_PURCHASE':
  case 'TRANSFER':
    event = {
      ...baseEvent,
      purchased_at_ms: now,
      expiration_at_ms: now + expiresInMs,
      entitlement_ids: ['kroni_family'],
    };
    break;
  case 'BILLING_ISSUE':
  case 'CANCELLATION':
    event = baseEvent;
    break;
  default:
    console.error(`Unsupported event type: ${type}`);
    process.exit(2);
}

const url = `${backendUrl.replace(/\/$/, '')}/webhooks/revenuecat`;
const body = { api_version: '1.0', event };

console.log(`POST ${url}`);
console.log(`type=${type} user=${userId} product=${productId}`);

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${auth}`,
  },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`-> ${res.status} ${text}`);
process.exit(res.ok ? 0 : 1);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next == null || next.startsWith('--')) {
        out[key] = 'true';
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}
