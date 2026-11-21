// CAR-PRESTIGE walk-on capture (Producer 22 Nov 07:03 / 12:12): your darts in hand on the walk-on, wearing the edition, with the two spares
// matching (doc 76 spareDart). A real Pub night started with Play now; frames through the walk-on. Over http. Capture tool: SKIP without args.
// usage: node tests/prestige-walkon.js <absolute dir>   env EDS=worlds,dpnz MODELS=v3,v2 TIMES=600,1400,2200,3000
if (process.argv.length < 3) { console.log('prestige-walkon: SKIP (capture tool; pass the repo dir)'); process.exit(0); }
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const http = require('http'); const dir = path.resolve(process.argv[2]);
const out = path.join(dir, 'wip/car-prestige'); fs.mkdirSync(out, { recursive: true });
const EDS = (process.env.EDS || 'default,worlds,dpnz').split(','), MODELS = (process.env.MODELS || 'v3,v2').split(','), TIMES = (process.env.TIMES || '600,1400,2200,3000').split(',').map(Number);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const fp = path.join(dir, u === '/' ? 'index.html' : u); if (!fp.startsWith(dir)) { r.writeHead(403); return r.end(); }
  fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(fp)] || 'application/octet-stream' }); r.end(d); }); });
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port + '/index.html?s3=1';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const log = [];
  for (const model of MODELS) for (const ed of EDS) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto(base + (model === 'v3' ? '&v3=1' : '&v3=0'), { timeout: 120000 });
    await p.waitForFunction(() => window.TOPS_S3 && window.C3 && typeof V !== 'undefined', null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(ed => { save.authSeen = true; $('login').hidden = true; save.name = 'Hayden'; newCareer(); persist(); window.TOPS_GEAR_PREVIEW = ed === 'default' ? null : ed; if (window.__HOLD !== false) { window.__sbu = startBullUp; startBullUp = function () {}; } const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); }, ed);
    let t0 = Date.now(); const shots = [];
    for (const t of TIMES) { const w = t - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w); const f = path.join(out, `walk-${model}-${ed}-${t}.png`); await p.screenshot({ path: f }); shots.push(path.basename(f)); }
    log.push({ model, ed, shots, walking: await p.evaluate(() => { try { return V.walking(); } catch (e) { return null; } }), errs: pe.slice(0, 1) }); await p.close(); }
  await b.close(); srv.close(); console.log(JSON.stringify(log)); })();
