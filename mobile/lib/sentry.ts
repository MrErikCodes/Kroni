import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { getInstallInfo, type AppRole } from './installInfo';

let initialized = false;

/**
 * Initialize Sentry once per app launch. Idempotent: subsequent calls are
 * no-ops. Skips entirely when no DSN is configured (Expo Go without
 * env / dev without phase).
 *
 * The DSN comes from Phase via `app.config.ts` -> `extra.sentryDsn`.
 * Sentry DSNs are designed to be public (they identify a project for the
 * ingest endpoint, not authenticate writers), so shipping it in the JS
 * bundle is the recommended pattern.
 */
export function initSentry(): void {
  if (initialized) return;

  const dsn =
    (Constants.expoConfig?.extra?.['sentryDsn'] as string | undefined) ?? '';
  if (!dsn) return;

  const release =
    Application.nativeApplicationVersion != null
      ? Application.nativeBuildVersion != null
        ? `${Application.nativeApplicationVersion}+${Application.nativeBuildVersion}`
        : Application.nativeApplicationVersion
      : undefined;

  // Distributed tracing: the SDK injects `sentry-trace` and `baggage`
  // headers on outgoing fetches. The backend SDK picks them up via
  // `Sentry.setupFastifyErrorHandler` so a mobile issue links straight
  // to the request transaction it triggered. Sample rate is non-zero so
  // some traces actually get propagated; tune via the env later.
  const apiUrl =
    (Constants.expoConfig?.extra?.['apiUrl'] as string | undefined) ??
    'http://localhost:3000';
  // Match anything under the configured API host so production + ngrok
  // dev URLs both get linked.
  let apiHost: RegExp;
  try {
    const parsed = new URL(apiUrl);
    apiHost = new RegExp(parsed.hostname.replace(/\./g, '\\.'));
  } catch {
    apiHost = /localhost/;
  }

  Sentry.init({
    dsn,
    environment: __DEV__ ? 'development' : 'production',
    release,
    dist: Application.nativeBuildVersion ?? undefined,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    // Without this, the SDK refuses to attach trace headers to requests
    // outside the local origin. Adding our backend host opts the API
    // calls in.
    tracePropagationTargets: [apiHost, /localhost/],
    // Don't capture user PII automatically; we set a curated user payload
    // ourselves in tagSentryUser.
    sendDefaultPii: false,
  });

  // Tag every event with the install / platform / version info we already
  // send to the backend on every request. install_id resolves async, so
  // re-set the tag once it lands.
  applyInstallTags();
  initialized = true;
}

export function isSentryEnabled(): boolean {
  return initialized;
}

function applyInstallTags(): void {
  const info = getInstallInfo();
  Sentry.setTags({
    platform: info.platform,
    os_version: info.osVersion,
    ...(info.appVersion ? { app_version: info.appVersion } : {}),
    ...(info.appBuild ? { app_build: info.appBuild } : {}),
    ...(info.installId ? { install_id: info.installId } : {}),
  });
  void Platform; // keep import for future use
}

/**
 * Re-tag once the install id has resolved (it's async on cold start).
 * Safe to call repeatedly.
 */
export function refreshSentryInstallTag(): void {
  if (!initialized) return;
  applyInstallTags();
}

/**
 * Set or clear the Sentry user identity for the current app session.
 * Call this after sign-in / sign-out so events are joinable to the
 * server-side parent_id / kid_id stamped via the Sentry node SDK.
 */
export function tagSentryUser(
  scope:
    | { role: AppRole; userId: string; householdId?: string | null }
    | null,
): void {
  if (!initialized) return;
  if (!scope) {
    Sentry.setUser(null);
    Sentry.setTags({ app_role: '', household_id: '' });
    return;
  }
  Sentry.setUser({
    id: scope.userId,
  });
  Sentry.setTags({
    app_role: scope.role,
    ...(scope.householdId ? { household_id: scope.householdId } : {}),
  });
}
