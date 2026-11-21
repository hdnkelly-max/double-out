// CAR-PRESTIGE close-up in a REAL post-180 (Producer 22 Nov 10:40, Director doc 75c): per edition (default + 5), served over http (the rig
// doesn't load from file://), a Pub night; on your visit three darts go through the game's own throw path (V.fly -> land, the same calls a
// release makes, aimed so they overlap in treble 20), the visit scores 180 and landCore fires the close-up itself. Shot as soon as it shows,
// before the AI throws. ?v3=1 row + v2 row, 390 at 2x. Writes wip/car-prestige/c180-<model>-<edition>.png and c180-sheet.jpg (python).
// usage: node tests/prestige-180.js <dir>   (capture tool: SKIP without arguments)
if (process.argv.length < 3) { console.log('prestige-180: SKIP (capture tool; pass the repo dir)'); process.exit(0); }
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const http = require('http'); const dir = path.resolve(process.argv[2]);
const out = path.join(dir, 'wip/car-prestige'); fs.mkdirSync(out, { recursive: true });
const EDS = (process.env.EDS || 'default,pub,dpnz,tt,card,worlds').split(','); const MODELS = (process.env.MODELS || 'v3,v2').split(',');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const fp = path.join(dir, u === '/' ? 'index.html' : u); if (!fp.startsWith(dir)) { r.writeHead(403); return r.end(); }
  fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(fp)] || 'application/octet-stream' }); r.end(d); }); });
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port + '/index.html?s3=1&gearcam=1';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const log = [];
  for (const model of MODELS) for (const ed of EDS) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto(base + (model === 'v3' ? '&v3=1' : '&v3=0'));
    await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TOPS_GEARCAM_FIRE && typeof V !== 'undefined' && V.gearShot, null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(ed => { save.authSeen = true; $('login').hidden = true; save.name = 'Hayden'; newCareer(); persist(); window.TOPS_GEAR_PREVIEW = ed === 'default' ? null : ed;
      window.TOPS_GEARCAM_QA = { still: 1, hold: 9000 }; const _f = TOPS_GEARCAM_FIRE; window.__fired = null; TOPS_GEARCAM_FIRE = k => { window.__fired = k; return _f(k); };
      const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); }, ed);
    // past the bull-up and onto your first visit (dart 1, your turn, nothing flying)
    for (let i = 0; i < 160; i++) { const ok = await p.evaluate(() => typeof S !== 'undefined' && S && !S.bull && S.cur === 0 && S.dart === 1 && !S.busy && !S.done && !S.aiFlying).catch(() => false); if (ok) break; await p.waitForTimeout(500); }
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => new Promise(res => { const T = [[-1.5, -103], [1, -102.4], [2.5, -103.6]]; let i = 0;
      const one = () => { if (i >= 3) return; const [x, y] = T[i++]; S.busy = true; S.flyingOwn = true; V.fly(V.handWorld(), x, y, 0, 380, .05, () => { if (!S || S.done) return; S.flyingOwn = false; S.anim = null; land(x, y, false); if (i < 3) setTimeout(one, 500); else setTimeout(() => res({ fired: window.__fired, score: S.p[0].score, last: S.p[0].lastVisit }), 900); }); };
      one(); }));
    await p.waitForTimeout(400); const pane = await p.evaluate(() => { const d = document.getElementById('gearCam'); if (!d) return null; const q = d.getBoundingClientRect(); return { y: q.y, h: q.height }; });
    const f = path.join(out, `c180-${model}-${ed}.png`); if (pane) await p.screenshot({ path: f, clip: { x: 0, y: pane.y, width: 390, height: pane.h } });
    log.push({ model, ed, r, pane: !!pane, errs: pe.slice(0, 1) }); await p.close(); }
  await b.close(); srv.close(); console.log(JSON.stringify(log)); })();
