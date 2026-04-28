import { getRedis } from './redis.js';

const NS = 'idemp';
const TTL_SECONDS = 24 * 60 * 60;

export interface CachedResponse {
  status: number;
  body: unknown;
}

export async function lookup(key: string, scope: string): Promise<CachedResponse | null> {
  const raw = await getRedis().get(`${NS}:${scope}:${key}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedResponse;
  } catch {
    return null;
  }
}

export async function store(key: string, scope: string, value: CachedResponse): Promise<void> {
  await getRedis().set(`${NS}:${scope}:${key}`, JSON.stringify(value), 'EX', TTL_SECONDS);
}
