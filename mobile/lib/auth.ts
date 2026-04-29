import * as SecureStore from 'expo-secure-store';

const KID_TOKEN_KEY = 'kroni.kidToken';
const ROLE_KEY = 'kroni.role';
// Kid locale is device-local — re-pairing or reinstalling clears it. We
// don't sync this to the backend (kids have no server-side `locale`
// column), so the picker on the kid profile screen writes here and the
// root layout reads on boot.
const KID_LOCALE_KEY = 'kid.locale.v1';

export type Role = 'parent' | 'kid';

// ── Kid JWT helpers ──────────────────────────────────────────────────────────

export async function setKidToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KID_TOKEN_KEY, token);
}

export async function getKidToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KID_TOKEN_KEY);
}

export async function clearKidToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KID_TOKEN_KEY);
}

// ── Kid locale override (device-local) ───────────────────────────────────────

export async function setKidLocale(locale: string): Promise<void> {
  await SecureStore.setItemAsync(KID_LOCALE_KEY, locale);
}

export async function getKidLocale(): Promise<string | null> {
  return SecureStore.getItemAsync(KID_LOCALE_KEY);
}

// ── Role preference (non-security-critical) ──────────────────────────────────

export async function setRolePreference(role: Role): Promise<void> {
  await SecureStore.setItemAsync(ROLE_KEY, role);
}

export async function getRolePreference(): Promise<Role | null> {
  const value = await SecureStore.getItemAsync(ROLE_KEY);
  if (value === 'parent' || value === 'kid') return value;
  return null;
}
