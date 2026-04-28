// Upload backend source maps + create a Sentry release for the just-built
// `dist/` output. Run AFTER `npm run build`.
//
// Required env (set via Phase or your CI secret store):
//   SENTRY_AUTH_TOKEN  - user/org auth token with project:write
//
// Optional env (sensible defaults for our self-hosted instance):
//   SENTRY_URL         - default https://sentry.mkapi.no/
//   SENTRY_ORG         - default "kroni"
//   SENTRY_PROJECT     - default "kroni-backend"
//   SENTRY_RELEASE     - explicit release name; defaults to
//                        `${pkg.name}@${pkg.version}+${git-short-sha}`,
//                        which matches what Sentry.init reports at runtime.
//
// The CI flow is:
//   1. npm ci
//   2. npm run build
//   3. npm run release:sentry          (this script)
//   4. deploy `dist/` to wherever
//
// The release name MUST match the runtime SDK init for source maps to be
// applied — that's why both ends derive it the same way.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

function fail(msg) {
  console.error(`[sentry-release] ${msg}`);
  process.exit(1);
}

function shell(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', cwd: root, ...opts });
}

// Default to our self-hosted sentry instance; env overrides for ad-hoc
// uploads to a different host (e.g. preview tenants).
process.env.SENTRY_URL = process.env.SENTRY_URL ?? 'https://sentry.mkapi.no/';
process.env.SENTRY_ORG = process.env.SENTRY_ORG ?? 'kroni';
process.env.SENTRY_PROJECT = process.env.SENTRY_PROJECT ?? 'kroni-backend';

if (!process.env.SENTRY_AUTH_TOKEN) fail('missing env: SENTRY_AUTH_TOKEN');

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const name = pkg.name.replace(/[@/]/g, '-');
const version = pkg.version;

let sha = null;
try {
  sha = execSync('git rev-parse --short HEAD', {
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim();
} catch {
  // No git in container — fall back to bare version.
}

const release = process.env.SENTRY_RELEASE ?? (sha ? `${name}@${version}+${sha}` : `${name}@${version}`);
const distDir = join(root, 'dist');
if (!existsSync(distDir)) fail(`dist/ not found — run "npm run build" first`);

console.log(`[sentry-release] release: ${release}`);

shell(`npx --no sentry-cli releases new "${release}"`);
shell(
  `npx --no sentry-cli sourcemaps upload --release "${release}" --strip-prefix "${root}" "${distDir}"`,
);
shell(`npx --no sentry-cli releases finalize "${release}"`);

if (sha) {
  // Optional: associate commits so Sentry can show "fixed by commit X".
  // Skips silently if your repo isn't pushed to a Sentry-known SCM.
  try {
    shell(`npx --no sentry-cli releases set-commits "${release}" --auto`);
  } catch {
    // Non-fatal — set-commits requires GitHub/GitLab integration.
  }
}

console.log(`[sentry-release] done`);
