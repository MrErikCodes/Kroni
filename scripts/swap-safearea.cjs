#!/usr/bin/env node
// Swap deprecated react-native SafeAreaView -> react-native-safe-area-context.
// Idempotent. Run once; re-runs are no-ops.

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'mobile');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) out.push(p);
  }
}

const files = [];
walk(path.join(root, 'app'), files);
walk(path.join(root, 'components'), files);

let changed = 0;

for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  if (!src.includes('SafeAreaView')) continue;

  // Match an import block from 'react-native' that contains SafeAreaView.
  const importRe = /import\s*\{\s*([^}]*?)\}\s*from\s*['"]react-native['"];?/s;
  const m = importRe.exec(src);
  if (!m || !m[1].includes('SafeAreaView')) continue;

  // Remove SafeAreaView from the named imports.
  const named = m[1]
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s !== 'SafeAreaView');

  let newImport;
  if (named.length === 0) {
    // Drop the entire react-native import line.
    newImport = '';
  } else {
    newImport = `import {\n  ${named.join(',\n  ')},\n} from 'react-native';`;
  }

  let next = src.replace(importRe, newImport);

  // Ensure an import from react-native-safe-area-context that pulls SafeAreaView.
  const sacRe =
    /import\s*\{\s*([^}]*?)\}\s*from\s*['"]react-native-safe-area-context['"];?/s;
  const sacMatch = sacRe.exec(next);
  if (sacMatch) {
    const sacNamed = sacMatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!sacNamed.includes('SafeAreaView')) sacNamed.push('SafeAreaView');
    const newSac = `import { ${sacNamed.join(', ')} } from 'react-native-safe-area-context';`;
    next = next.replace(sacRe, newSac);
  } else {
    // Insert a new import line right after the react-native import (or at top).
    const insertAt = next.indexOf("from 'react-native';");
    const lineEnd =
      insertAt === -1 ? 0 : next.indexOf('\n', insertAt) + 1;
    const insertLine =
      "import { SafeAreaView } from 'react-native-safe-area-context';\n";
    if (insertAt === -1) {
      // No remaining react-native import — prepend at file top after any leading comments.
      next = insertLine + next;
    } else {
      next = next.slice(0, lineEnd) + insertLine + next.slice(lineEnd);
    }
  }

  if (next !== src) {
    fs.writeFileSync(f, next);
    changed++;
  }
}

console.log(`[swap-safearea] updated ${changed} file(s)`);
