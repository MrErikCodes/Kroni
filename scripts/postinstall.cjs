#!/usr/bin/env node
// Cross-workspace dep reconciliation. Two issues we fix every install:
//
// 1. Tailwind CSS version split. Website needs v4 (we pin v4 at root).
//    NativeWind v4 hard-checks for Tailwind v3 and refuses v4. NPM hoists one
//    version per scope, so when nativewind resolves "tailwindcss" from root it
//    finds v4 and crashes. Workaround: copy a v3 install (already nested in
//    mobile/node_modules) into nativewind/node_modules so its local resolution
//    sees v3 first.
//
// 2. (placeholder) future cross-workspace patches.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const nativewindNm = path.join(root, 'node_modules/nativewind/node_modules');
const nativewindTw = path.join(nativewindNm, 'tailwindcss');
const sourceTw = path.join(root, 'mobile/node_modules/tailwindcss');

function pkgVersion(p) {
  try {
    return JSON.parse(fs.readFileSync(path.join(p, 'package.json'), 'utf8')).version;
  } catch {
    return null;
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else if (entry.isSymbolicLink()) {
      const link = fs.readlinkSync(s);
      try { fs.symlinkSync(link, d); } catch { fs.copyFileSync(s, d); }
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function patchNativewindTailwind() {
  const sourceVersion = pkgVersion(sourceTw);
  if (!sourceVersion || !sourceVersion.startsWith('3.')) {
    console.log(
      '[postinstall] skipped tailwind nest: mobile/node_modules/tailwindcss not v3',
    );
    return;
  }
  const currentVersion = pkgVersion(nativewindTw);
  if (currentVersion === sourceVersion) {
    return; // already nested correctly
  }
  fs.mkdirSync(nativewindNm, { recursive: true });
  if (fs.existsSync(nativewindTw)) {
    fs.rmSync(nativewindTw, { recursive: true, force: true });
  }
  copyDir(sourceTw, nativewindTw);
  console.log(`[postinstall] nested tailwindcss@${sourceVersion} into nativewind`);
}

patchNativewindTailwind();
