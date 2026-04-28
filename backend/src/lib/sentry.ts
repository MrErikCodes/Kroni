import * as Sentry from '@sentry/node';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getConfig } from '../config.js';

let initialized = false;

/**
 * Resolve a release identifier that matches what we'll upload source
 * maps under. Order of precedence:
 *   1. SENTRY_RELEASE (explicit override, recommended for CI)
 *   2. `${name}@${version}+${gitSha}` derived from package.json + git
 *   3. `${name}@${version}` if git isn't available (Docker without .git)
 */
function resolveRelease(explicit: string | undefined): string | undefined {
  if (explicit) return explicit;
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkgPath = join(here, '..', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      name?: string;
      version?: string;
    };
    const name = pkg.name?.replace(/[@/]/g, '-') ?? 'kroni-backend';
    const version = pkg.version ?? '0.0.0';
    let sha: string | null = null;
    try {
      sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();
    } catch {
      sha = null;
    }
    return sha ? `${name}@${version}+${sha}` : `${name}@${version}`;
  } catch {
    return undefined;
  }
}

/**
 * Initialize Sentry once at process start. Idempotent: subsequent calls are
 * no-ops. Skips entirely when SENTRY_DSN is unset (dev / tests). Must be
 * called BEFORE any other module imports if you want unhandled exceptions
 * during boot to be captured.
 */
export function initSentry(): void {
  if (initialized) return;
  const cfg = getConfig();
  if (!cfg.SENTRY_DSN) return;

  const release = resolveRelease(cfg.SENTRY_RELEASE);

  Sentry.init({
    dsn: cfg.SENTRY_DSN,
    environment: cfg.NODE_ENV,
    release,
    // Tracing is on. The Fastify integration extracts sentry-trace +
    // baggage from incoming requests automatically, so a mobile event
    // links to the request transaction it produced.
    tracesSampleRate: cfg.SENTRY_TRACES_SAMPLE_RATE,
    // Fastify integration is auto-detected; explicit listing kept off so a
    // future package upgrade picks up new defaults automatically.
  });
  initialized = true;
}

/** Exposed so the deploy script uploads source maps under the same name. */
export function computeReleaseForCli(): string {
  const cfg = getConfig();
  return resolveRelease(cfg.SENTRY_RELEASE) ?? 'unknown';
}

export function isSentryEnabled(): boolean {
  return initialized;
}

/**
 * Wire Sentry into Fastify's error path. Call AFTER the app is built so
 * the error handler is registered last. Safe to call when Sentry isn't
 * initialized — becomes a no-op.
 */
export function attachSentryToFastify(app: FastifyInstance): void {
  if (!initialized) return;
  Sentry.setupFastifyErrorHandler(app);
}

/**
 * Per-request scope tagging. Mirrors the fields the auth plugins stamp on
 * `req.log` so Sentry events from the same request carry the same
 * identifiers we already log. Safe when Sentry is disabled.
 */
export function tagSentryScope(
  req: FastifyRequest,
  scope: {
    appRole?: 'parent' | 'kid';
    userId?: string;
    email?: string;
    householdId?: string;
    installId?: string | null;
    appVersion?: string | null;
    appBuild?: string | null;
    platform?: string | null;
  },
): void {
  if (!initialized) return;
  const isolation = Sentry.getIsolationScope();
  if (scope.userId) {
    isolation.setUser({
      id: scope.userId,
      ...(scope.email ? { email: scope.email } : {}),
    });
  }
  const tags: Record<string, string> = {};
  if (scope.appRole) tags.app_role = scope.appRole;
  if (scope.householdId) tags.household_id = scope.householdId;
  if (scope.installId) tags.install_id = scope.installId;
  if (scope.appVersion) tags.app_version = scope.appVersion;
  if (scope.appBuild) tags.app_build = scope.appBuild;
  if (scope.platform) tags.platform = scope.platform;
  if (Object.keys(tags).length > 0) isolation.setTags(tags);
  void req;
}
