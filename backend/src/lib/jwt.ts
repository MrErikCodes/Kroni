import { createHmac, createPublicKey, timingSafeEqual } from 'node:crypto';
import { getConfig } from '../config.js';
import { UnauthorizedError } from './errors.js';

// Minimal HS256 JWT — kid tokens. We avoid jsonwebtoken to keep deps lean
// and to be explicit about exact algorithm + claim shape.

export interface KidJwtPayload {
  sub: string;          // kid id
  kind: 'kid';
  parent_id: string;
  device_id: string;
  iat: number;          // unix seconds
  exp: number;          // unix seconds
}

// Kid tokens are effectively permanent. Once a parent has paired a child's
// device, that device should stay signed in indefinitely so the kid never
// has to re-enter a code. Revocation happens by deleting the kid (cascades
// to kid_devices) — not by token expiry. Refresh-on-use still rotates the
// token forward so the exp claim never goes stale.
const KID_TOKEN_TTL_DAYS = 365 * 100;
// Refresh once we're more than ~5 years past issuance, just to keep the
// `iat` claim from drifting too far. Practically a no-op for users.
const REFRESH_THRESHOLD_DAYS = 365 * 95;

function base64url(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  return Buffer.from(b64, 'base64');
}

export function signKidJwt(
  payload: Omit<KidJwtPayload, 'iat' | 'exp' | 'kind'>,
  ttlSeconds: number = KID_TOKEN_TTL_DAYS * 86_400,
): string {
  const cfg = getConfig();
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: KidJwtPayload = {
    ...payload,
    kind: 'kid',
    iat: now,
    exp: now + ttlSeconds,
  };
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(fullPayload));
  const signingInput = `${header}.${body}`;
  const sig = createHmac('sha256', cfg.KID_JWT_SECRET).update(signingInput).digest();
  return `${signingInput}.${base64url(sig)}`;
}

export function verifyKidJwt(token: string): KidJwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new UnauthorizedError('malformed token');
  const [headerB64, bodyB64, sigB64] = parts as [string, string, string];

  const cfg = getConfig();
  const expected = createHmac('sha256', cfg.KID_JWT_SECRET)
    .update(`${headerB64}.${bodyB64}`)
    .digest();
  const provided = fromBase64url(sigB64);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new UnauthorizedError('invalid signature');
  }

  let header: { alg?: string; typ?: string };
  let payload: KidJwtPayload;
  try {
    header = JSON.parse(fromBase64url(headerB64).toString('utf8'));
    payload = JSON.parse(fromBase64url(bodyB64).toString('utf8'));
  } catch {
    throw new UnauthorizedError('malformed token');
  }
  if (header.alg !== 'HS256') throw new UnauthorizedError('unsupported alg');
  if (payload.kind !== 'kid') throw new UnauthorizedError('wrong token kind');
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < now) {
    throw new UnauthorizedError('token expired');
  }
  return payload;
}

export function shouldRefreshKidJwt(payload: KidJwtPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  const remainingSeconds = payload.exp - now;
  return remainingSeconds < REFRESH_THRESHOLD_DAYS * 86_400;
}

// Re-issue a kid JWT with the same identity claims and fresh ttl.
export function refreshKidJwt(payload: KidJwtPayload): string {
  return signKidJwt({
    sub: payload.sub,
    parent_id: payload.parent_id,
    device_id: payload.device_id,
  });
}

// Suppress unused import warning if createPublicKey is needed later for asymmetric.
void createPublicKey;
