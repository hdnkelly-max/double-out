// Delivery QA (S3 gate): what a launch costs on an iPhone, and every same-origin request that fails.
// Runtime half of the asset gate (tests/asset-refs.js is the static half).
//
//   node tests/launch-cost.js <site root> [--page <built page>] [--overlay <dir>] [--query "s3=1"]
//                             [--label 3.55] [--json out.json] [--base base.json]
//     site root : a checkout of main (assets/, img/, voice ...), served like GitHub Pages
//                 (Cache-Control: max-age=600, ETag, 304 on If-None-Match)
//     --page    : serve this file as index.html (a fresh build); default the root's index.html
//     --overlay : extra dir served first (a build's rig/ and version.json)
//     --base    : a previous run's --json, printed side by side with a +/- column
//
// Four launches on an iPhone 13 profile (Playwright device), counted at the server (what really
// crosses the network), each to the first screen, 10 s on the hub, then audioInit() as the first match
// start does (it starts the caller's voice preload) and 25 s more:
//   install   : new browser, no save: a first launch onto the login screen
//   returning : new browser (empty HTTP cache), a returning player's save, to the hub (login hidden, as
//               the other tests do: we can't sign in to Google here)
//   warm      : the same browser again at once (HTTP cache fresh: max-age 600)
//   stale     : the same player after the 600 s max-age has passed (every cached file revalidated)
// Reports per launch: requests, MB over the wire, 304s, by folder, time until the loader lifts.
// FAIL if any same-origin request returns 4xx/5xx or never completes, or the loader never lifts.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { chromium, devices } = require('playwright');
const argv = process.argv.slice(2), opt = k => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : null; };
const root = argv[0]; if (!root || root.startsWith('--')) { console.error('usage: node tests/launch-cost.js <site root> [--page f] [--overlay d] [--query q] [--label l] [--json f] [--base f]'); process.exit(2); }
const page0 = opt('page'), overlay = opt('overlay'), query = opt('query') || '', label = opt('label') || 'candidate';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
let stale = false; const etags = new Map(); let hits = [];
const resolve = u => {
  let p = decodeURIComponent(u.split('?')[0]).replace(/^\/+/, ''); if (!p || p.endsWith('/')) p += 'index.html';
  if (p === 'index.html' && page0) return page0;
  for (const r of [overlay, root].filter(Boolean)) { const f = path.join(r, p); if (f.startsWith(path.resolve(r)) || f.startsWith(r)) { try { if (fs.statSync(f).isFile()) return f; } catch (e) {} } }
  return null;
};
const srv = http.createServer((q, s) => {
  const f = resolve(q.url); if (!f) { hits.push({ url: q.url, st: 404, bytes: 0 }); s.writeHead(404); return s.end('404'); }
  let et = etags.get(f); if (!et) { et = '"' + crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0, 16) + '"'; etags.set(f, et); }
  const h = { 'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': stale ? 'max-age=0' : 'max-age=600', ETag: et };
  if (q.headers['if-none-match'] === et) { hits.push({ url: q.url, st: 304, bytes: 200 }); s.writeHead(304, h); return s.end(); }
  const b = fs.readFileSync(f); h['Content-Length'] = b.length; hits.push({ url: q.url, st: 200, bytes: b.length + 300 }); s.writeHead(200, h); s.end(q.method === 'HEAD' ? undefined : b);
});
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port, origin = `http://127.0.0.1:${port}`;
  // third parties are not ours to count: fail their DNS (a Playwright route() would turn the HTTP cache off)
  const NOHOST = ['*.supabase.co', 'cdn.jsdelivr.net', '*.googleapis.com', '*.gstatic.com', 'unpkg.com', 'cdnjs.cloudflare.com', 'accounts.google.com'];
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--host-resolver-rules=' + NOHOST.map(h => `MAP ${h} ~NOTFOUND`).join(', ')] });
  const newCtx = async (state) => b.newContext({ ...devices['iPhone 13'], storageState: state });
  const url = `${origin}/${query ? '?' + query : ''}`;
  // a returning player's save, made by the game itself
  const c0 = await newCtx(); const p0 = await c0.newPage(); await p0.goto(url, { timeout: 120000 });
  await p0.waitForFunction(() => typeof save === 'object' && typeof persist === 'function', null, { timeout: 120000 });
  await p0.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.tcWelSeen = 1; save.name = save.name || 'Lee'; try { if (!window.career || !career()) newCareer(); } catch (e) { try { newCareer(); } catch (e2) {} } persist(); });
  const player = await c0.storageState(); await c0.close();
  const out = { label, query, launches: {} }; const fails = [];
  const run = async (name, ctx) => {
    const p = await ctx.newPage(); hits = []; const pend = new Map(), cfail = [], who = new Map();
    try { const cdp = await ctx.newCDPSession(p); await cdp.send('Network.enable'); cdp.on('Network.requestWillBeSent', e => { if (!e.request.url.startsWith(origin)) return; const st = e.initiator && e.initiator.stack; const f = st && st.callFrames && st.callFrames[0]; who.set(e.request.url.slice(origin.length), f ? `${f.functionName || '(anon)'} @${f.lineNumber + 1}:${f.columnNumber + 1}` : (e.initiator && e.initiator.type) || '?'); }); } catch (e) {}
    p.on('request', q => { if (q.url().startsWith(origin)) pend.set(q, q.url().slice(origin.length)); });
    p.on('requestfinished', q => pend.delete(q)); p.on('requestfailed', q => { const u = pend.get(q); pend.delete(q); const e = q.failure() && q.failure().errorText; if (u && !/ERR_ABORTED/.test(e || '')) cfail.push(`${e} ${u}`); });
    const t0 = Date.now(); let lift = null;
    await p.goto(url, { waitUntil: 'commit', timeout: 120000 });
    for (let i = 0; i < 240 && lift === null; i++) {
      await p.waitForTimeout(500);
      if (await p.evaluate(() => { const l = document.getElementById('loading'); if (!l) return document.readyState === 'complete'; const cs = getComputedStyle(l); return l.hidden || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0; }).catch(() => false)) lift = Date.now() - t0;
    }
    // a signed-in player lands on the hub; offline we can't sign in, so do what the other tests do (hide login, open the hub)
    if (name !== 'install') await p.evaluate(() => { try { const l = document.getElementById('login'); if (l) l.hidden = true; if (typeof showHub === 'function') showHub('play'); } catch (e) {} }).catch(() => {});
    await p.waitForTimeout(10000);
    // the first match start calls audioInit(), which starts the caller's voice preload: count it in the same launch
    if (name !== 'install') await p.evaluate(() => { try { audioInit(); if (window.TOPS_clipLoad) TOPS_clipLoad(); } catch (e) {} }).catch(() => {});
    await p.waitForTimeout(25000);
    const H = hits.slice(), mb = a => +(a.reduce((x, h) => x + h.bytes, 0) / 1e6).toFixed(2);
    const folder = u => { const q = u.split('?')[0].replace(/^\//, '') || 'index.html'; const seg = q.split('/'); return seg.length > 2 ? seg.slice(0, 2).join('/') : seg.length === 2 ? seg[0] : q; };
    const by = {}; for (const h of H) { const k = folder(h.url); by[k] = by[k] || { n: 0, mb: 0 }; by[k].n++; by[k].mb += h.bytes / 1e6; } for (const v of Object.values(by)) v.mb = +v.mb.toFixed(2);
    out.launches[name] = { requests: H.length, mb: mb(H), downloaded: H.filter(h => h.st === 200).length, revalidated_304: H.filter(h => h.st === 304).length, loader_lift_s: lift === null ? null : +(lift / 1000).toFixed(1), by_folder: by };
    for (const h of H) if (h.st >= 400) fails.push(`${name}: HTTP ${h.st} ${h.url}  (requested by ${who.get(h.url) || '?'})`);
    for (const e of cfail) fails.push(`${name}: ${e}`); for (const u of pend.values()) fails.push(`${name}: never completed ${u}`);
    if (lift === null) fails.push(`${name}: the loader never lifted in 120 s`);
    await p.close();
  };
  { const c = await newCtx(); await run('install', c); await c.close(); }
  { const c = await newCtx(player); await run('returning', c); await run('warm', c); await c.close(); }
  { stale = true; const c = await newCtx(player); await run('stale-warmup', c); await run('stale', c); delete out.launches['stale-warmup']; await c.close(); stale = false; }
  await b.close(); srv.close();
  if (opt('json')) fs.writeFileSync(opt('json'), JSON.stringify(out, null, 1));
  const base = opt('base') ? JSON.parse(fs.readFileSync(opt('base'), 'utf8')) : null;
  const N = ['install', 'returning', 'warm', 'stale'];
  const row = (k, f) => console.log(`  ${k.padEnd(18)} ${N.map(n => { const v = f(out.launches[n]); if (!base) return String(v).padEnd(20); const w = f(base.launches[n]); const d = typeof v === 'number' && typeof w === 'number' ? ` ${v - w >= 0 ? '+' : ''}${+(v - w).toFixed(2)}` : ''; return `${v} (${w}${d})`.padEnd(20); }).join('')}`);
  console.log(`launch-cost ${label}${query ? ' ?' + query : ''}${base ? ` vs ${base.label}${base.query ? ' ?' + base.query : ''}` : ''}  (iPhone 13 profile, counted at the server${base ? '; value (base +/-)' : ''})`);
  console.log(`  ${''.padEnd(18)} ${['install', 'returning', 'warm', 'stale (600 s on)'].map(x => x.padEnd(20)).join('')}`);
  row('requests', L => L.requests); row('MB over the wire', L => L.mb); row('downloads (200)', L => L.downloaded); row('304s', L => L.revalidated_304); row('loader lift (s)', L => L.loader_lift_s);
  for (const n of ['returning', 'stale']) { const top = Object.entries(out.launches[n].by_folder).sort((a, b) => b[1].n - a[1].n).slice(0, 8); console.log(`  ${n}, by folder: ` + top.map(([k, v]) => `${k} ${v.n} req ${v.mb} MB`).join(' · ')); }
  if (fails.length) { console.log('launch-cost FAIL\n  ' + [...new Set(fails)].slice(0, 40).join('\n  ')); process.exit(1); }
  console.log('launch-cost PASS (no same-origin request failed)');
})().catch(e => { console.error('launch-cost ERROR', e); process.exit(3); });
