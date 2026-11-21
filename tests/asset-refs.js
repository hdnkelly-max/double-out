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
// block comments are prose, not requests (a path only mentioned in a /* note */ is not shipped); strings keep theirs
let src = fs.readFileSync(page, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
// window.TOPS_S3_HAVE (build.js, Season 3): a list of KEYS, the assets/ paths that have a redo at 's3/' + path, not files the page
// asks for. Check each key's s3/ copy instead and take the list out of the literal scan (a new S3-only image has no assets/ original).
let have = []; src = src.replace(/window\.TOPS_S3_HAVE\s*=\s*(\[[^\]]*\])/, (m, arr) => { try { have = JSON.parse(arr); } catch (e) { have = null; } return 'window.TOPS_S3_HAVE=[]'; });
const exists = p => roots.some(r => { try { return fs.statSync(path.join(r, p)).isFile(); } catch (e) { return false; } });
// s3/manifest.json ships WITH the page, so it is read from the root the built page sits in first (the branch in ci.yml, the build
// in release.yml), then the other roots. Reading the live site's first made every new Season 3 file fail CI until it was live
// (EXP-IDLE, Sun 03:58). Files may still exist in any root; only which manifest counts changed.
const pageDir = path.resolve(path.dirname(page));
const holds = r => { const a = path.resolve(r); return pageDir === a || pageDir.startsWith(a + path.sep); };
const own = roots.filter(holds).sort((x, y) => path.resolve(y).length - path.resolve(x).length)[0];
const mroots = own ? [own, ...roots.filter(r => r !== own)] : roots;
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
// s3/manifest.json "optional": files the code asks for only when the build shipped them (e.g. a TOPS_S3V hash check
// before the fetch). Absent = fine; present = must also be in "files". Read before the missing-file check.
let opt0 = []; for (const r of mroots) { try { opt0 = JSON.parse(fs.readFileSync(path.join(r, 's3/manifest.json'), 'utf8')).optional || []; break; } catch (e) {} }
const missing = [...lit].filter(([p]) => !exists(p) && !opt0.includes(p));
const fails = missing.map(([p, i]) => `missing ${p}   (named at: …${snip(i)}…)`);
if (have === null) fails.push('window.TOPS_S3_HAVE is not a JSON list of paths');
for (const k of have || []) if (!exists('s3/' + k)) fails.push(`missing s3/${k}   (TOPS_S3_HAVE says ${k} has a Season 3 redo)`);
// Season 3 manifest
const s3lit = [...lit.keys()].filter(p => p.startsWith('s3/')), s3dyn = [...dyn.keys()].filter(p => p.startsWith('s3/'));
let manifest = null;
for (const r of mroots) { try { manifest = JSON.parse(fs.readFileSync(path.join(r, 's3/manifest.json'), 'utf8')); break; } catch (e) {} }
if (s3dyn.length && !manifest) fails.push(`the page builds s3/ paths at run time (${s3dyn.join(', ')}) but there is no s3/manifest.json to check them against`);
if (manifest) {
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  if (!files.length) fails.push('s3/manifest.json has no "files" list');
  const optional = Array.isArray(manifest.optional) ? manifest.optional : [];
  for (const f of optional) if (exists(f) && !files.includes(f)) fails.push(`${f} is shipped (listed as optional) but not listed in "files"`);
  for (const f of files) if (!exists(f)) fails.push(`missing ${f}   (listed in s3/manifest.json)`);
  for (const p of s3lit) if (p !== 's3/manifest.json' && !files.includes(p) && !(optional.includes(p) && !exists(p))) fails.push(`${p} is named in the page but not listed in s3/manifest.json`);
  for (const d of s3dyn) if (!files.some(f => f.startsWith(d))) fails.push(`dynamic prefix ${d} has no file in s3/manifest.json`);
  // the manifest must be complete: every file shipped under s3/ is listed (an art file left out of it is unchecked)
  const walk = (r, d) => { let o = []; try { for (const e of fs.readdirSync(path.join(r, d), { withFileTypes: true })) { const q = d + '/' + e.name; if (e.isDirectory()) o = o.concat(walk(r, q)); else o.push(q); } } catch (e) {} return o; };
  for (const r of roots) for (const f of walk(r, 's3')) if (f !== 's3/manifest.json' && !files.includes(f)) fails.push(`${f} is shipped but not listed in s3/manifest.json`);
}
console.log(`asset-refs: manifest from ${mroots.find(r => fs.existsSync(path.join(r, 's3/manifest.json'))) || 'none'}; ${lit.size} literal paths (${lit.size - missing.length} present), ${have && have.length ? `TOPS_S3_HAVE ${have.length} redos, ` : ''}${dyn.size} run-time prefixes${manifest ? `, s3/manifest.json ${manifest.files.length} files` : ''}`);
if (dyn.size) console.log('  run-time prefixes (not checkable statically; tests/launch-cost.js catches their 404s at run time): ' + [...dyn.keys()].join(' '));
if (fails.length) { console.log('asset-refs FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('asset-refs PASS');
