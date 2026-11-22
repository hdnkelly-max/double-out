// CAR-PRESTIGE capture (Producer 22:43): do the title-edition darts read at the match camera? For each edition (and the default darts), a
// Pub night on a 390x844 and 360x800 phone at 2x: three darts thrown at treble 20, then the board as the match shows it. Current figures
// (v2) and the new Vinyl ones (?v3=1). Writes wip/car-prestige/<model>-<w>-<edition>.png and a contact sheet per model and width.
// usage: CAPTURE=1 node tests/prestige-capture.js [dir]   (not a pass/fail test: it skips when run without arguments, like the sims)
/* capture tool, never a CI test: CI passes the build dir to any test whose usage names one, which ran the whole capture set (24 page loads,
   past CI's 600 s limit: FAIL 124). It runs only with CAPTURE=1; otherwise it skips at once. */
if (!process.env.CAPTURE || process.argv.length < 3) { console.log('prestige-capture: SKIP (capture tool; run with CAPTURE=1 and the repo dir)'); process.exit(0); }
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const dir = path.resolve(process.argv[2]);
const out = path.join(dir, 'wip/car-prestige'); fs.mkdirSync(out, { recursive: true });
const EDS = (process.env.EDS ? process.env.EDS.split(',').map(x => x === 'default' ? null : x) : [null, 'pub', 'dpnz', 'tt', 'card', 'worlds']);
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const log = [];
  for (const [model, q] of (process.env.MODELS === 'v2' ? [['v2', '']] : [['v2', ''], ['v3', '&v3=1']])) for (const [w, h] of (process.env.W === '390' ? [[390, 844]] : [[390, 844], [360, 800]])) for (const ed of EDS) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto('file://' + dir + '/index.html?s3=1' + q);
    await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TOPS_GEAR, null, { timeout: 180000 }); await p.waitForTimeout(2000);
    await p.evaluate(ed => { save.authSeen = true; $('login').hidden = true; save.name = 'Hayden'; newCareer(); persist(); window.TOPS_GEAR_PREVIEW = ed; const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); }, ed);
    // the bull-up, then your first visit: throw whenever it's your turn until three of your darts are in the board, then shoot at once
    const st = () => p.evaluate(() => typeof S !== 'undefined' && S ? { cur: S.cur, d0: S.p[0].darts || 0, done: S.done } : null).catch(() => null);
    for (let k = 0; k < 60; k++) { const s0 = await st(); if (s0 && s0.d0 >= 3) break; if (!s0 || s0.cur !== 0 || s0.done) { await p.waitForTimeout(500); continue; }
      await p.mouse.click(w / 2, h * .16); await p.waitForTimeout(300); await p.mouse.move(w / 2, h * .7); await p.mouse.down(); await p.waitForTimeout(650); await p.mouse.move(w / 2, h * .66, { steps: 4 }); await p.mouse.up();
      for (let j = 0; j < 20; j++) { const s1 = await st(); if (!s1 || s1.d0 !== s0.d0 || s1.cur !== 0) break; await p.waitForTimeout(150); } { const s2 = await st(); if (s2 && s2.d0 >= 3) break; } await p.waitForTimeout(700); }   /* Engine (doc 82): shoot as soon as your third dart is in; the old extra 700 ms let the visit clear, so the frames showed only the opponent's darts (their red default shafts read as "the edition looks like the default") */
    if (process.env.SEQ) for (let t = 0; t < 8; t++) { await p.screenshot({ path: path.join(out, `seq-${model}-${w}-${ed || 'default'}-${t}.png`), clip: { x: 0, y: 40, width: w, height: Math.round(h * .43) } }); await p.waitForTimeout(400); }
    const f = path.join(out, `${model}-${w}-${ed || 'default'}.png`); await p.screenshot({ path: f, clip: { x: 0, y: 40, width: w, height: Math.round(h * .43) } });
    const g = await p.evaluate(() => ({ gear: window.TOPS_GEAR && TOPS_GEAR() && TOPS_GEAR().id, darts: (S && S.p && S.p[0] && S.p[0].darts) || null }));
    log.push({ model, w, ed: ed || 'default', gear: g.gear || null, errs: pe.slice(0, 1) }); await p.close(); }
  await b.close(); console.log(JSON.stringify(log)); })();
