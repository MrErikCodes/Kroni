import { eq, and, isNull, gt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { getRedis } from '../lib/redis.js';
import { pairingCodes, kidDevices } from '../db/schema/pairing.js';
import { kids } from '../db/schema/kids.js';
import { generatePairingCode } from '../lib/codes.js';
import { signKidJwt } from '../lib/jwt.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../lib/errors.js';
import type { AvatarKey } from '@kroni/shared';

const CODE_TTL_MIN = 15;
const CODE_TTL_SEC = CODE_TTL_MIN * 60;

const codeCacheKey = (code: string): string => `pair:${code}`;

export interface CreatedPairingCode {
  code: string;
  expiresAt: Date;
}

// Generate a 6-digit pairing code unique among non-expired non-used codes.
// Retries on collision up to 5 times (vanishingly small probability). The
// code targets a specific kid the parent has already created; redemption
// only attaches a device to that kid.
export async function createPairingCode(
  householdId: string,
  parentId: string,
  targetKidId: string,
): Promise<CreatedPairingCode> {
  const db = getDb();
  const redis = getRedis();

  // Validate the kid is actually in this household before issuing a code.
  const kidRows = await db
    .select({ id: kids.id, householdId: kids.householdId })
    .from(kids)
    .where(eq(kids.id, targetKidId))
    .limit(1);
  const kidRow = kidRows[0];
  if (!kidRow || kidRow.householdId !== householdId) {
    throw new NotFoundError('kid not found in household');
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generatePairingCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_SEC * 1000);
    try {
      await db
        .insert(pairingCodes)
        .values({ code, householdId, parentId, targetKidId, expiresAt });
      // Cache householdId so the public pair endpoint can fast-path lookup.
      await redis.set(codeCacheKey(code), householdId, 'EX', CODE_TTL_SEC);
      return { code, expiresAt };
    } catch (err) {
      // PK collision (Postgres error 23505) — retry. Anything else surfaces.
      const pgCode = (err as { code?: string }).code;
      if (pgCode !== '23505') throw err;
    }
  }
  throw new ConflictError('failed to generate unique code after 5 attempts');
}

export interface PairInput {
  code: string;
  deviceId: string;
}

export interface PairOutput {
  token: string;
  kid: {
    id: string;
    // The creator parent's id at pair time. Always present for newly-paired
    // kids (created by an authenticated parent). The schema column is
    // nullable only to survive parent deletion later.
    parentId: string;
    name: string;
    birthYear: number | null;
    avatarKey: AvatarKey | null;
    allowanceFrequency: 'none' | 'weekly' | 'biweekly' | 'monthly';
    allowanceCents: number;
    allowanceDayOfWeek: number | null;
    allowanceDayOfMonth: number | null;
    allowanceLastPaidAt: string | null;
    createdAt: string;
  };
}

export async function redeemPairingCode(input: PairInput): Promise<PairOutput> {
  const { code, deviceId } = input;
  const db = getDb();
  const redis = getRedis();

  // Cache lookup is informational — the transaction below is the source of
  // truth and re-validates expiry/usage. Read kept for parity in case
  // future code wants a fast pre-auth check.
  void (await redis.get(codeCacheKey(code)));

  // Atomic transaction. Lock pairing row to prevent races, mark used,
  // attach device to the pre-existing target kid.
  const result = await db.transaction(async (tx) => {
    const codeRows = await tx
      .select()
      .from(pairingCodes)
      .where(
        and(
          eq(pairingCodes.code, code),
          isNull(pairingCodes.usedAt),
          gt(pairingCodes.expiresAt, sql`now()`),
        ),
      )
      .for('update')
      .limit(1);
    const codeRow = codeRows[0];
    if (!codeRow) throw new UnauthorizedError('invalid or expired pairing code');

    const kidRows = await tx
      .select()
      .from(kids)
      .where(eq(kids.id, codeRow.targetKidId))
      .limit(1);
    const kid = kidRows[0];
    // Cascade on kids delete should remove the code too, but guard anyway.
    if (!kid) throw new UnauthorizedError('paired kid no longer exists');

    // Idempotent device attach: the unique key (kidId, deviceId) makes
    // re-pairing the same device a no-op so a kid can rotate codes safely.
    await tx
      .insert(kidDevices)
      .values({ kidId: kid.id, deviceId })
      .onConflictDoNothing({ target: [kidDevices.kidId, kidDevices.deviceId] });

    await tx
      .update(pairingCodes)
      .set({ usedAt: new Date(), usedByKidId: kid.id })
      .where(eq(pairingCodes.code, code));

    return kid;
  });

  await redis.del(codeCacheKey(code));

  // Pairing route requires an authenticated parent, so parentId is always
  // populated at create time. parent_id in the JWT is informational; the
  // auth-kid plugin re-checks via kid.householdId.
  if (!result.parentId) throw new ConflictError('paired kid missing creator');
  const token = signKidJwt({
    sub: result.id,
    parent_id: result.parentId,
    device_id: deviceId,
  });

  return {
    token,
    kid: {
      id: result.id,
      parentId: result.parentId,
      name: result.name,
      birthYear: result.birthYear,
      avatarKey: result.avatarKey as AvatarKey | null,
      allowanceFrequency: result.allowanceFrequency as PairOutput['kid']['allowanceFrequency'],
      allowanceCents: result.allowanceCents,
      allowanceDayOfWeek: result.allowanceDayOfWeek,
      allowanceDayOfMonth: result.allowanceDayOfMonth,
      allowanceLastPaidAt: result.allowanceLastPaidAt ? result.allowanceLastPaidAt.toISOString() : null,
      createdAt: result.createdAt.toISOString(),
    },
  };
}


// Lightweight rate limiter on top of Redis INCR + EXPIRE.
export async function checkRateLimit(
  scope: string,
  key: string,
  max: number,
  windowSeconds: number,
): Promise<{ ok: boolean; current: number; resetSeconds: number }> {
  const redis = getRedis();
  const k = `rl:${scope}:${key}`;
  const current = await redis.incr(k);
  if (current === 1) {
    await redis.expire(k, windowSeconds);
  }
  const ttl = await redis.ttl(k);
  return {
    ok: current <= max,
    current,
    resetSeconds: ttl < 0 ? windowSeconds : ttl,
  };
}
