import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

// One stable identifier per install on this device. Pasted into
// "Kopier app info" in settings, sent on every authed request as
// `X-Kroni-Install-Id`, and (later) used as the Sentry user/tag id —
// so a single value joins client-side crashes to server-side logs to
// support tickets.
//
// Sources, in order of preference:
//   - iOS: `getIosIdForVendorAsync()` (stable across reinstalls if the
//     vendor still has another app installed; rotates otherwise — close
//     enough for support).
//   - Android: `getAndroidId()` (stable per (device, signing key)).
//   - Fallback: a UUID we generate once and cache in SecureStore.

const INSTALL_ID_KEY = 'kroni.installId';

let cached: string | null = null;
let inflight: Promise<string> | null = null;

function generateUuid(): string {
  // Acceptable for an opaque tag value; not used for security.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function resolveInstallId(): Promise<string> {
  const stored = await SecureStore.getItemAsync(INSTALL_ID_KEY);
  if (stored && stored.length > 0) return stored;

  let platformId: string | null = null;
  try {
    if (Platform.OS === 'ios') {
      platformId = await Application.getIosIdForVendorAsync();
    } else if (Platform.OS === 'android') {
      platformId = Application.getAndroidId() ?? null;
    }
  } catch {
    platformId = null;
  }

  const value = platformId ?? generateUuid();
  await SecureStore.setItemAsync(INSTALL_ID_KEY, value);
  return value;
}

/**
 * Resolve once per app session, then return the cached value. Callers
 * happy with `null` (request just-fired before init) should fall back to
 * not sending the header.
 */
export async function ensureInstallId(): Promise<string> {
  if (cached) return cached;
  if (!inflight) {
    inflight = resolveInstallId().then((v) => {
      cached = v;
      return v;
    });
  }
  return inflight;
}

export function getInstallIdSync(): string | null {
  return cached;
}

export interface InstallInfo {
  installId: string | null;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  appVersion: string | null;
  appBuild: string | null;
  osVersion: string;
}

function platformName(): InstallInfo['platform'] {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'web') return 'web';
  return 'unknown';
}

/** Snapshot of everything we tag on logs / Sentry. Cheap to call. */
export function getInstallInfo(): InstallInfo {
  return {
    installId: cached,
    platform: platformName(),
    appVersion:
      Application.nativeApplicationVersion ??
      ((Constants.expoConfig?.version as string | undefined) ?? null),
    appBuild: Application.nativeBuildVersion ?? null,
    osVersion: String(Platform.Version),
  };
}

export type AppRole = 'parent' | 'kid';

/**
 * Headers to attach to authenticated API requests. Returns an empty
 * object if the install id hasn't resolved yet so the first call after
 * cold-start doesn't block — subsequent requests will carry it.
 *
 * `role` lets the backend tag the log line + the install table without
 * inferring it from auth; for support filtering we want "kid app v1.0.1"
 * vs "parent app v1.0.1" to be obvious in logs.
 */
export function getDiagnosticHeaders(role: AppRole): Record<string, string> {
  const info = getInstallInfo();
  const out: Record<string, string> = {
    'X-Kroni-App-Role': role,
    'X-Kroni-Platform': info.platform,
    'X-Kroni-Os-Version': info.osVersion,
  };
  if (info.installId) out['X-Kroni-Install-Id'] = info.installId;
  if (info.appVersion) out['X-Kroni-App-Version'] = info.appVersion;
  if (info.appBuild) out['X-Kroni-App-Build'] = info.appBuild;
  return out;
}
