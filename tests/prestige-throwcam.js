// CAR-PRESTIGE (Director doc 82): your darts AT THE THROW in the match (board) cam, per edition. One dart thrown through the game's own path
// (V.fly -> land) at a slowed flight (DUR ms) so it can be caught mid-air, shot at 25 / 50 / 75% of the flight and once stuck in the board.
// Writes <out>/throw-<model>-<ed>-<k>.png (board pane at 390, 2x). usage: CAPTURE=1 node tests/prestige-throwcam.js <dir> [out]   (capture tool)
if (!process.env.CAPTURE || process.argv.length < 3) { console.log('prestige-throwcam: SKIP (capture tool; run with CAPTURE=1 and the build dir)'); process.exit(0); }
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const http = require('http'); const dir = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3] || path.join(dir, 'wip/car-prestige')); fs.mkdirSync(out, { recursive: true });
const EDS = (process.env.EDS || 'default,tt').split(','); const MODELS = (process.env.MODELS || 'v3,v2').split(','); const DUR = +(process.env.DUR || 6000);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const fp = path.join(dir, u === '/' ? 'index.html' : u);
  fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(fp)] || 'application/octet-stream' }); r.end(d); }); });
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port + '/index.html?s3=1&gearcam=0';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const log = [];
  for (const model of MODELS) for (const ed of EDS) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto(base + (model === 'v3' ? '&v3=1' : '&v3=0'));
    await p.waitForFunction(() => window.TOPS_S3 && window.C3 && typeof V !== 'undefined' && V.fly && V._qa && V._qa.rigReady(), null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(ed => { save.authSeen = true; $('login').hidden = true; save.name = 'Hayden'; newCareer(); persist(); window.TOPS_GEAR_PREVIEW = ed === 'default' ? null : ed;
      const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); }, ed);
    for (let i = 0; i < 60; i++) { const bu = await p.evaluate(() => typeof S !== 'undefined' && S && S.bull && S.bull.me == null && !S.busy).catch(() => false); if (bu) break; await p.waitForTimeout(500); }
    await p.evaluate(() => { S.busy = true; V.fly(V.handWorld(), 0, 0, 0, 380, .05, () => { S.anim = null; land(0, 0, false); }); });
    for (let i = 0; i < 160; i++) { const ok = await p.evaluate(() => typeof S !== 'undefined' && S && !S.bull && S.cur === 0 && S.dart === 1 && !S.busy && !S.done && !S.aiFlying).catch(() => false); if (ok) break; await p.waitForTimeout(500); }
    await p.waitForTimeout(800); const pane = await p.evaluate(() => { const r = V.lkRects && V.lkRects(); const bp = r && (r.board || r.BP || r.b); return bp ? { y: bp.y, h: bp.h } : null; }).catch(() => null);
    const clip = pane && pane.h > 50 ? { x: 0, y: pane.y, width: 390, height: pane.h } : { x: 0, y: 60, width: 390, height: 390 };
    const t0 = await p.evaluate(D => { window.__thrown = performance.now(); S.busy = true; S.flyingOwn = true; V.fly(V.handWorld(), -1.5, -103, 0, D, .05, () => { S.flyingOwn = false; S.anim = null; land(-1.5, -103, false); }); return 0; }, DUR);
    const shots = [];for (const [k, f] of [['25', .25], ['50', .5], ['75', .75]]) { await p.waitForFunction(([f, D]) => performance.now() - window.__thrown >= f * D, [f, DUR], { timeout: DUR * 3 }); const fp = path.join(out, `throw-${model}-${ed}-${k}.png`); await p.screenshot({ path: fp, clip }); shots.push(k); }
    await p.waitForFunction(D => performance.now() - window.__thrown >= D + 600, DUR, { timeout: DUR * 3 }); await p.screenshot({ path: path.join(out, `throw-${model}-${ed}-stuck.png`), clip });
    log.push({ model, ed, clip, shots, errs: pe.slice(0, 1) }); await p.close(); }
  await b.close(); srv.close(); console.log(JSON.stringify(log)); })();
