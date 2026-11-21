// CAR-PRESTIGE gear cam capture (Producer 22 Nov 07:03): the ~1.2 s close-up of your three darts in the board that plays on your 180s, the
// match-winning double and any nine-darter (behind TOPS_GEARCAM). Per edition (and the default darts), on the current (v2) and the new (v3)
// figures, at 390x844 and 360x800 (2x): three of your darts flown into treble 20 (V.fly, no scoring), then TOPS_GEARCAM_FIRE('180') and the
// board pane shot mid-way through the close-up. Writes wip/car-prestige/gc-<model>-<w>-<edition>.png and contact sheets (via python, below).
// usage: node tests/prestige-gearcam.js <dir>   (a capture tool: SKIP without arguments)
if (process.argv.length < 3) { console.log('prestige-gearcam: SKIP (capture tool; pass the repo dir)'); process.exit(0); }
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const dir = path.resolve(process.argv[2]);
const out = path.join(dir, 'wip/car-prestige'); fs.mkdirSync(out, { recursive: true });
const EDS = process.env.EDS ? process.env.EDS.split(',') : ['default', 'pub', 'dpnz', 'tt', 'card', 'worlds'];
const MODELS = process.env.MODELS ? process.env.MODELS.split(',') : ['v2', 'v3']; const WS = process.env.WS ? process.env.WS.split(',').map(Number) : [390, 360];
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const log = [];
  for (const model of MODELS) for (const w of WS) for (const ed of EDS) { const h = w === 390 ? 844 : 800;
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto('file://' + dir + '/index.html?s3=1&gearcam=1' + (model === 'v3' ? '&v3=1' : '&v3=0'));
    await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TOPS_GEARCAM_FIRE && typeof V !== 'undefined' && V.gearShot, null, { timeout: 180000 }); await p.waitForTimeout(2000);
    await p.evaluate(ed => { save.authSeen = true; $('login').hidden = true; save.name = 'Hayden'; newCareer(); persist(); window.TOPS_GEAR_PREVIEW = ed === 'default' ? null : ed; window.TOPS_GEARCAM_QA = { still: 1, hold: 8000 }; const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); }, ed);
    for (let i = 0; i < 60; i++) { const ok = await p.evaluate(() => typeof S !== 'undefined' && S && !S.bull && S.cur === 0 && !S.done).catch(() => false); if (ok) break; await p.waitForTimeout(500); }
    await p.waitForTimeout(1200);
    const fired = await p.evaluate(() => new Promise(res => { V.clearDarts(); const from = V.handWorld(); let n = 0; const land = [[-6, -103], [1, -100.5], [7, -104.5]];
      land.forEach(([x, y], i) => setTimeout(() => V.fly(from, x, y, 0, 380, .02, () => { if (++n === 3) setTimeout(() => res(TOPS_GEARCAM_FIRE('180')), 650); }), i * 450)); }));
    await p.waitForTimeout(2500); const pane = await p.evaluate(() => { const d = document.getElementById('gearCam'); if (!d) return null; const r = d.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    const f = path.join(out, `gc-${model}-${w}-${ed}.png`); if (pane) await p.screenshot({ path: f, clip: { x: 0, y: pane.y, width: w, height: pane.h } });
    const gone = await p.evaluate(() => { window.TOPS_GEARCAM_QA = {}; const d = document.getElementById('gearCam'); if (d) d.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return new Promise(r => setTimeout(() => r(!document.getElementById('gearCam')), 600)); });   // a tap skips it
    log.push({ model, w, ed, fired, pane, gone, last: await p.evaluate(() => window.TOPS_GEARCAM_LAST), errs: pe.slice(0, 1) }); await p.close(); }
  await b.close(); console.log(JSON.stringify(log)); })();
