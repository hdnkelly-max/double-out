// EXP-S3-BINDER follow-up (ChatGPT 9.4 on 4.28): one path per URL for the Season 3 picture switch. The prototype setters for
// style.background / backgroundImage are retired (Chromium never called them; Safari and Firefox did, on top of the point-of-use switch).
// Checks: (1) the switch is idempotent: running it on its own output changes nothing, for every file in the Season 3 list, placeholders,
// v3 files, data: URLs, other hosts and multi-layer backgrounds; (2) the prototype no longer carries setters for those two properties;
// (Chromium never had those two setters on the prototype, so (2) can only fail on WebKit/Gecko; this runner is Chromium, so the code change
// itself is the proof there.) (3) tc/cards.js keeps 'use strict' as its first statement (Q&D); (4) no script in the built page sets style.background / backgroundImage to a game picture without the switch (tc/cards.js, rb/rb.js call it).
// usage: node tests/s3-imgswitch.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const fail = [], out = {};
  // (3) static: every script-set background that names a game picture goes through the switch
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'); const bad = [];
  for (const m of html.matchAll(/\.style\.(background|backgroundImage)\s*=\s*([^;\n]{0,400})/g)) { const rhs = m[2];
    if (/url\(/.test(rhs) && /assets\/|img\/|\bIMG\b|\.art\b|sceneImg|WIMG/.test(rhs) && !/s3img|TOPS_S3_IMG|lkImg/.test(rhs)) bad.push(rhs.slice(0, 90)); }
  // Q&D: the directive must be the first statement of tc/cards.js's function, or strict mode is off for the whole file
  { const cj = fs.readFileSync(path.join(dir, 'tc/cards.js'), 'utf8'); out.strict = /\(function \(root\) \{\s*'use strict';/.test(cj); if (!out.strict) fail.push("tc/cards.js: 'use strict' is not the first statement"); }
  out.unswitched = bad.length; if (bad.length) fail.push('script-set backgrounds without the switch: ' + bad.join(' | '));
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} });
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?s3=1', { timeout: 180000 }); await p.waitForFunction(() => window.TOPS_S3_IMG && window.TC_DATA, null, { timeout: 180000 }); await p.waitForTimeout(800);
  const r = await p.evaluate(() => { const S = window.TOPS_S3_IMG, H = window.TOPS_S3_HAVE || [];
    const samples = []; H.forEach(h => { samples.push(h, './' + h, `url(${h})`, `url("${h}") 50% 40%/cover no-repeat`); });
    TC_DATA.CARDS.forEach(c => { if (c.art) samples.push(c.art, `url(${c.art})`); });
    samples.push('assets/rb/lk_m.jpg', 'assets/rb/tn_t9f.jpg', 'https://example.com/assets/rb/lk_m.jpg', 'data:image/png;base64,AAAA', 'linear-gradient(red,blue)', '',
      `radial-gradient(ellipse 24% 26% at 70% 100%,rgba(8,5,3,.62) 0,transparent 100%),url(assets/rb/lk_m.jpg) 80% 30%/cover no-repeat,url(assets/rb/venue_t0.jpg) 50% 40%/cover`);
    const once = samples.map(x => S(x)), twice = once.map(x => S(x)); const diff = samples.filter((x, i) => once[i] !== twice[i]);
    const changed = samples.filter((x, i) => once[i] !== x).length; const ph = once.filter(x => /data:image\/svg/.test(x)).length;
    const own = k => { let o = document.body.style, n = 0; while (o) { const d = Object.getOwnPropertyDescriptor(o, k); if (d) return { lvl: n, setter: !!d.set, proto: o === CSSStyleDeclaration.prototype }; o = Object.getPrototypeOf(o); n++; } return null; };
    const protoBg = ['background', 'backgroundImage'].map(k => { const d = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, k); return d && d.set && /swap|fn\(/.test(String(d.set)) ? k : null; }).filter(Boolean);
    return { n: samples.length, changed, ph, diff: diff.slice(0, 5), protoBg, cssText: !!Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'cssText') }; });
  out.switch = r; if (r.diff.length) fail.push('switch not idempotent: ' + JSON.stringify(r.diff)); if (!(r.changed > 100)) fail.push('switch changed too few samples ' + r.changed);
  if (r.protoBg.length) fail.push('prototype still wraps ' + r.protoBg.join(','));
  if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 200)); await b.close();
  console.log(JSON.stringify(out)); console.log(fail.length ? 's3-imgswitch FAIL: ' + fail.join('; ') : 's3-imgswitch PASS'); process.exit(fail.length ? 1 : 0); })();
