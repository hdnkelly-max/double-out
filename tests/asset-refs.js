// Delivery QA (S3 gate): every file the shipped page names must exist in the published site.
// Static half of the gate; tests/launch-cost.js is the runtime half (it fails on any same-origin 4xx/5xx).
//
//   node tests/asset-refs.js <built page> <site root> [more roots...]
//     built page: double-out-standalone.html (what release.yml ships as index.html)
//     site root : a checkout of main (where assets/, img/ live) - plus the src checkout for files
//                 the build writes (rig/, version.json)
//
// What it checks:
//  1. Every literal relative path in the page under assets/ img/ rig/ s3/ ui/ (any file extension)
//     exists in one of the roots. Missing = FAIL, with the path and a snippet of where it is named.
//  2. Paths built at run time ('assets/voice/'+n+'.mp3', 's3/'+k+'.webp') can't be read statically.
//     They're listed. Any dynamic prefix under s3/ must be covered by s3/manifest.json
//     ({"files":["s3/...", ...]}): every listed file must exist, and every literal s3/ path must be
//     in the manifest, so the manifest is the one list of Season 3 art.
// Exit 0 = PASS, 1 = FAIL.
const fs = require('fs'), path = require('path');
const [page, ...roots] = process.argv.slice(2);
if (!page || !roots.length) { console.error('usage: node tests/asset-refs.js <built page> <site root> [more roots]'); process.exit(2); }
const src = fs.readFileSync(page, 'utf8');
const exists = p => roots.some(r => { try { return fs.statSync(path.join(r, p)).isFile(); } catch (e) { return false; } });
const TOP = '(?:assets|img|rig|s3|ui)';
// literal paths: inside quotes, backticks or url(...); stop at a quote, paren, space, ? or #
const lit = new Map();
const re = new RegExp(`(?<=['"\`(\\s,])(?:\\.\\/)?(${TOP}\\/[A-Za-z0-9_\\-./]+\\.[A-Za-z0-9]{2,5})(?=[?#'"\`)\\s,])`, 'g');
for (let m; (m = re.exec(src));) { const p = m[1]; if (/\$\{/.test(p)) continue; if (!lit.has(p)) lit.set(p, m.index); }
// dynamic: a quoted prefix ending in / or a partial name, followed by +
const dyn = new Map();
const dre = new RegExp(`['"\`](${TOP}\\/[A-Za-z0-9_\\-./]*)['"\`]\\s*\\+`, 'g');
for (let m; (m = dre.exec(src));) if (!dyn.has(m[1])) dyn.set(m[1], m.index);
const tre = new RegExp('`(' + TOP + '\\/[A-Za-z0-9_\\-./]*)\\$\\{', 'g');
for (let m; (m = tre.exec(src));) if (!dyn.has(m[1])) dyn.set(m[1], m.index);
// a bare folder held in a variable (const RB='assets/rb/') is also a run-time prefix
const fre = new RegExp(`['"\`](${TOP}\\/(?:[A-Za-z0-9_\\-.]+\\/)*)['"\`]`, 'g');
for (let m; (m = fre.exec(src));) if (!dyn.has(m[1])) dyn.set(m[1], m.index);
const snip = i => src.slice(Math.max(0, i - 60), i + 80).replace(/\s+/g, ' ');
const missing = [...lit].filter(([p]) => !exists(p));
const fails = missing.map(([p, i]) => `missing ${p}   (named at: …${snip(i)}…)`);
// Season 3 manifest
const s3lit = [...lit.keys()].filter(p => p.startsWith('s3/')), s3dyn = [...dyn.keys()].filter(p => p.startsWith('s3/'));
let manifest = null;
for (const r of roots) { try { manifest = JSON.parse(fs.readFileSync(path.join(r, 's3/manifest.json'), 'utf8')); break; } catch (e) {} }
if (s3dyn.length && !manifest) fails.push(`the page builds s3/ paths at run time (${s3dyn.join(', ')}) but there is no s3/manifest.json to check them against`);
if (manifest) {
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  if (!files.length) fails.push('s3/manifest.json has no "files" list');
  for (const f of files) if (!exists(f)) fails.push(`missing ${f}   (listed in s3/manifest.json)`);
  for (const p of s3lit) if (!files.includes(p)) fails.push(`${p} is named in the page but not listed in s3/manifest.json`);
  for (const d of s3dyn) if (!files.some(f => f.startsWith(d))) fails.push(`dynamic prefix ${d} has no file in s3/manifest.json`);
}
console.log(`asset-refs: ${lit.size} literal paths (${lit.size - missing.length} present), ${dyn.size} run-time prefixes${manifest ? `, s3/manifest.json ${manifest.files.length} files` : ''}`);
if (dyn.size) console.log('  run-time prefixes (not checkable statically; tests/launch-cost.js catches their 404s at run time): ' + [...dyn.keys()].join(' '));
if (fails.length) { console.log('asset-refs FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('asset-refs PASS');
