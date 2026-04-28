import { randomInt } from 'node:crypto';

// 6-digit pairing codes, zero-padded. crypto-strong RNG.
export function generatePairingCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}
