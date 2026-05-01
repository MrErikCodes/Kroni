import test from 'node:test';
import assert from 'node:assert/strict';
import { Webhook } from 'svix';

// Pin a real svix-format secret BEFORE importing the app so the webhook
// route's `new Webhook(secret)` constructor accepts it. _env.ts sets a
// `whsec_placeholder` default which is not valid base64 and would crash
// svix at boot.
process.env.CLERK_WEBHOOK_SECRET =
  'whsec_c2VjcmV0c2VjcmV0c2VjcmV0c2VjcmV0c2VjcmV0c2VjcmV0c2VjcmV0';

import {
  setupTestDb,
  snapshotDb,
  cleanupSinceSnapshot,
  teardownTestDb,
  type DbSnapshot,
} from '../helpers/db.js';

const { buildApp } = await import('../../app.js');
const { getDb } = await import('../../db/index.js');
const { closeRedis } = await import('../../lib/redis.js');
const { closeDb } = await import('../../db/index.js');
const { parents } = await import('../../db/schema/parents.js');
const { processedWebhookEvents } = await import('../../db/schema/webhook-events.js');
const { eq, and } = await import('drizzle-orm');
const { randomUUID } = await import('node:crypto');

let snapshot: DbSnapshot;

// Spy on global fetch so we can count Mailpace POSTs without module-mocking
// the ESM `sendMail` export. The Clerk handler swallows MailpaceError, so
// failures here don't affect HTTP status — we only observe call count.
const MAILPACE_URL = 'https://app.mailpace.com/api/v1/send';
let originalFetch: typeof globalThis.fetch;
let mailpaceCallCount = 0;

function installFetchSpy(): void {
  mailpaceCallCount = 0;
  originalFetch = globalThis.fetch;
  const spy: typeof globalThis.fetch = async (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;
    if (url === MAILPACE_URL) {
      mailpaceCallCount += 1;
      // Pretend Mailpace accepted the send so the handler logs success
      // rather than swallowing an error — closer to the prod path we
      // care about exercising.
      return new Response(JSON.stringify({ id: `mock_${randomUUID()}`, status: 'queued' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return originalFetch(input, init);
  };
  globalThis.fetch = spy;
}

function uninstallFetchSpy(): void {
  globalThis.fetch = originalFetch;
}

test.before(async () => {
  await setupTestDb();
  snapshot = await snapshotDb();
  installFetchSpy();
});
test.beforeEach(() => {
  mailpaceCallCount = 0;
});
test.afterEach(async () => {
  await cleanupSinceSnapshot(snapshot);
});
test.after(async () => {
  uninstallFetchSpy();
  await closeRedis();
  await closeDb();
  await teardownTestDb();
});

const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

interface SignedHeaders extends Record<string, string> {
  'svix-id': string;
  'svix-timestamp': string;
  'svix-signature': string;
  'content-type': string;
}

function signPayload(body: string): SignedHeaders {
  const id = `msg_${randomUUID()}`;
  const ts = new Date();
  const signature = wh.sign(id, ts, body);
  return {
    'svix-id': id,
    'svix-timestamp': Math.floor(ts.getTime() / 1000).toString(),
    'svix-signature': signature,
    'content-type': 'application/json',
  };
}

function userCreatedPayload(clerkUserId: string, email: string): Record<string, unknown> {
  return {
    type: 'user.created',
    data: {
      id: clerkUserId,
      email_addresses: [{ id: 'email_1', email_address: email }],
      primary_email_address_id: 'email_1',
      first_name: 'Test',
      last_name: 'User',
      public_metadata: null,
    },
  };
}

test('clerk — user.created with valid svix sig creates parent + sends welcome', async () => {
  const app = await buildApp();
  try {
    const clerkUserId = `user_test_${randomUUID()}`;
    const email = `t-${randomUUID()}@example.com`;
    const body = JSON.stringify(userCreatedPayload(clerkUserId, email));
    const headers = signPayload(body);

    const res = await app.inject({
      method: 'POST',
      url: '/webhooks/clerk',
      headers,
      payload: body,
    });
    assert.equal(res.statusCode, 200);

    const db = getDb();
    const [parent] = await db
      .select()
      .from(parents)
      .where(eq(parents.clerkUserId, clerkUserId))
      .limit(1);
    assert.ok(parent, 'parent row must be created');
    assert.equal(parent.email, email);

    const eventRows = await db
      .select()
      .from(processedWebhookEvents)
      .where(
        and(
          eq(processedWebhookEvents.provider, 'clerk'),
          eq(processedWebhookEvents.eventId, headers['svix-id']),
        ),
      );
    assert.equal(eventRows.length, 1, 'exactly one dedup row for the svix-id');

    assert.equal(mailpaceCallCount, 1, 'welcome email POSTed to mailpace exactly once');
  } finally {
    await app.close();
  }
});

test('clerk — replayed user.created does NOT re-send welcome', async () => {
  const app = await buildApp();
  try {
    const clerkUserId = `user_test_${randomUUID()}`;
    const email = `t-${randomUUID()}@example.com`;
    const body = JSON.stringify(userCreatedPayload(clerkUserId, email));
    const headers = signPayload(body);

    const first = await app.inject({
      method: 'POST',
      url: '/webhooks/clerk',
      headers,
      payload: body,
    });
    assert.equal(first.statusCode, 200);
    assert.equal(mailpaceCallCount, 1, 'first delivery sends welcome');

    // Replay with the SAME svix-id + body. Dedup row insert hits ON
    // CONFLICT DO NOTHING; alreadyProcessed becomes true; welcome path
    // is gated and skipped.
    const replay = await app.inject({
      method: 'POST',
      url: '/webhooks/clerk',
      headers,
      payload: body,
    });
    assert.equal(replay.statusCode, 200);
    assert.equal(mailpaceCallCount, 1, 'replay must NOT re-send welcome');

    const db = getDb();
    const eventRows = await db
      .select()
      .from(processedWebhookEvents)
      .where(
        and(
          eq(processedWebhookEvents.provider, 'clerk'),
          eq(processedWebhookEvents.eventId, headers['svix-id']),
        ),
      );
    assert.equal(eventRows.length, 1, 'still exactly one dedup row after replay');

    const parentRows = await db
      .select()
      .from(parents)
      .where(eq(parents.clerkUserId, clerkUserId));
    assert.equal(parentRows.length, 1, 'parent upsert remains a single row');
  } finally {
    await app.close();
  }
});

test('clerk — invalid svix signature returns 401', async () => {
  const app = await buildApp();
  try {
    const body = JSON.stringify(userCreatedPayload(`user_test_${randomUUID()}`, 'x@example.com'));
    const headers = signPayload(body);
    // Tamper with the body AFTER signing so the signature no longer matches.
    const tampered = body + ' ';
    const res = await app.inject({
      method: 'POST',
      url: '/webhooks/clerk',
      headers,
      payload: tampered,
    });
    assert.equal(res.statusCode, 401);
    assert.equal(mailpaceCallCount, 0, 'invalid sig must not trigger any send');
  } finally {
    await app.close();
  }
});
