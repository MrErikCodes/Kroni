import { eq, and, isNull, gt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { getRedis } from '../lib/redis.js';
import { pairingCodes, kidDevices } from '../db/schema/pairing.js';
import { kids } from '../db/schema/kids.js';
import { kidBalances } from '../db/schema/balance.js';
import { generatePairingCode } from '../lib/codes.js';
import { signKidJwt } from '../lib/jwt.js';
import { ConflictError, UnauthorizedError } from '../lib/errors.js';
import bcrypt from 'bcryptjs';
import type { AvatarKey } from '@kroni/shared';

const CODE_TTL_MIN = 15;
const CODE_TTL_SEC = CODE_TTL_MIN * 60;

const codeCacheKey = (code: string): string => `pair:${code}`;

export interface CreatedPairingCode {
  code: string;
  expiresAt: Date;
}

// Generate a 6-digit pairing code unique among non-expired non-used codes.
// Retries on collision up to 5 times (vanishingly small probability).
// Scoped to a household — any parent in that household can pair a kid.
export async function createPairingCode(
  householdId: string,
  parentId: string,
): Promise<CreatedPairingCode> {
  const db = getDb();
  const redis = getRedis();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generatePairingCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_SEC * 1000);
    try {
      await db.insert(pairingCodes).values({ code, householdId, parentId, expiresAt });
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
  name: string;
  birthYear?: number | undefined;
  avatarKey?: string | undefined;
  pin?: string | undefined;
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
    weeklyAllowanceCents: number;
    createdAt: string;
  };
}

export async function redeemPairingCode(input: PairInput): Promise<PairOutput> {
  const { code, name, birthYear, avatarKey, pin, deviceId } = input;
  const db = getDb();
  const redis = getRedis();

  // Cache lookup is informational — the transaction below is the source of
  // truth and re-validates expiry/usage. Read kept for parity with the old
  // implementation in case future code wants a fast pre-auth check.
  void (await redis.get(codeCacheKey(code)));

  // Atomic transaction. Lock pairing row to prevent races, mark used,
  // create kid, balance row, device.
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

    const hashedPin = pin ? await bcrypt.hash(pin, 10) : null;

    const insertedKids = await tx
      .insert(kids)
      .values({
        householdId: codeRow.householdId,
        parentId: codeRow.parentId,
        name,
        birthYear: birthYear ?? null,
        avatarKey: avatarKey ?? null,
        pin: hashedPin,
      })
      .returning();
    const kid = insertedKids[0];
    if (!kid) throw new ConflictError('kid insert failed');

    await tx.insert(kidBalances).values({ kidId: kid.id, balanceCents: 0 });

    await tx.insert(kidDevices).values({
      kidId: kid.id,
      deviceId,
    });

    await tx
      .update(pairingCodes)
      .set({ usedAt: new Date(), usedByKidId: kid.id })
      .where(eq(pairingCodes.code, code));

    return kid;
  });

  // Invalidate cache after successful redemption.
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
      // avatarKey is constrained to AvatarKey at write time (Zod-validated input).
      avatarKey: result.avatarKey as AvatarKey | null,
      weeklyAllowanceCents: result.weeklyAllowanceCents,
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
