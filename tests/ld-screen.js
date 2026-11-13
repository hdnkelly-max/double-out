// ENG-RESET loading screen (Overseer 14:18): the bar shows real progress from TOPS_LOAD.set(), never goes backwards, never looks frozen
// (it creeps between updates but never past the next step or 96 %), fills to 100 % before the screen goes (done() and the game's own .gone),
// shows the "Next up" card from sessionStorage 'tops_reset', and is inside the safe area at 390 and 360. usage: node tests/ld-screen.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  for (const [W, H] of [[390, 844], [360, 640]]) {
    const p = await b.newPage({ viewport: { width: W, height: H } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.route(/jsdelivr|supabase\.co/, r => r.abort());
    // the game hides the screen as soon as it is ready (fast here); hold that until the test lets it go, so the bar can be watched
    await p.addInitScript(() => { const add = DOMTokenList.prototype.add; DOMTokenList.prototype.add = function (...c) { try { if (!window.__letGo && c.includes('gone') && document.getElementById('loading') && this === document.getElementById('loading').classList) { window.__goneAsked = 1; return; } } catch (e) {} return add.apply(this, c); }; });
    await p.addInitScript(() => { let tl; Object.defineProperty(window, 'TOPS_LOAD', { configurable: true, get() { return tl; }, set(v) { if (v && v.part) v.part = function () {}; tl = v; } }); });   // the page's own progress steps (ENG-FLASH) are switched off here so the API itself can be checked from 0; tests/ld-progress.js covers them
    await p.addInitScript(() => { try { sessionStorage.setItem('tops_reset', JSON.stringify({ k: 'Next up', t: 'vs Tama Rewiri', s: 'Club singles · week 2 of 8' })); } catch (e) {} });
    await p.goto('file://' + dir + '/index.html', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.TOPS_LOAD, null, { timeout: 30000 });
    const w = () => p.evaluate(() => parseFloat(document.getElementById('ldBar').style.width) || 0);
    const r = {}; r.card = await p.evaluate(() => { const n = document.getElementById('ldNext'); return !n.hidden && n.textContent.includes('Tama Rewiri'); });
    r.cardOnce = await p.evaluate(() => sessionStorage.getItem('tops_reset') === null);
    await p.evaluate(() => TOPS_LOAD.set(.2, 'Loading the venue…')); const a0 = await w(); await p.waitForTimeout(1500); const a1 = await w(); r.creep = [a0, a1];
    r.label = await p.evaluate(() => document.getElementById('ldTip').textContent);
    await p.evaluate(() => TOPS_LOAD.set(.1)); r.noBack = (await w()) >= a1;
    await p.evaluate(() => TOPS_LOAD.set(.6)); await p.waitForTimeout(150); r.jump = await w(); await p.waitForTimeout(2500); r.capped = await w();
    r.safe = await p.evaluate(() => { const q = s => document.querySelector(s).getBoundingClientRect(); const f = q('#loading .ld-foot'), l = q('#loading .ld-logo'); return { footBottom: Math.round(f.bottom), logoTop: Math.round(l.top), H: innerHeight, W: innerWidth, side: Math.round(f.left) }; });
    r.pct = await p.evaluate(() => document.getElementById('ldPct').textContent);
    await p.evaluate(() => { window.__letGo = 1; TOPS_LOAD.done(); }); await p.waitForTimeout(60); r.full = await w(); await p.waitForTimeout(500); r.gone = await p.evaluate(() => document.getElementById('loading').classList.contains('gone'));
    if (!r.card || !r.cardOnce) fail.push(`${W}: Next up card not shown once`); if (!(a1 > a0 && a1 <= 32.5)) fail.push(`${W}: creep ${a0}→${a1} (must move, ≤ step + 12 %)`);
    if (r.label !== 'Loading the venue…') fail.push(`${W}: label ${r.label}`); if (!r.noBack) fail.push(`${W}: bar went backwards`);
    if (r.pct !== '60%') fail.push(`${W}: % shows ${r.pct}, real is 60`); if (!(r.jump >= 60 && r.capped <= 72.5 && r.capped > r.jump)) fail.push(`${W}: after 60 %: ${r.jump} → ${r.capped}`); if (r.full !== 100 || !r.gone) fail.push(`${W}: done() ${r.full}% gone ${r.gone}`);
    if (r.safe.footBottom > r.safe.H - 20 || r.safe.logoTop < 40 || r.safe.side < 16) fail.push(`${W}: layout ${JSON.stringify(r.safe)}`); if (pe.length) fail.push(`${W}: page errors ${pe.join('; ').slice(0, 120)}`);
    // the game's own .gone (old path) fills the bar first
    // the game's own path: #loading.gone without done() still shows a full bar while it fades (ChatGPT P2); the % shows real progress, not the creep
    await p.evaluate(() => { const L = document.getElementById('loading'); L.classList.remove('gone', 'ld-done'); });
    r.pctReal = r.pct; out[W] = r; await p.close();
    const q = await b.newPage({ viewport: { width: W, height: H } }); await q.route(/jsdelivr|supabase\.co/, x => x.abort());
    await q.addInitScript(() => { const add = DOMTokenList.prototype.add; DOMTokenList.prototype.add = function (...c) { try { if (!window.__letGo && c.includes('gone') && this === document.getElementById('loading').classList) return; } catch (e) {} return add.apply(this, c); }; });
    await q.addInitScript(() => { let tl; Object.defineProperty(window, 'TOPS_LOAD', { configurable: true, get() { return tl; }, set(v) { if (v && v.part) v.part = function () {}; tl = v; } }); });   // the page's own progress steps (ENG-FLASH) are switched off here so the API itself can be checked from 0; tests/ld-progress.js covers them
    await q.goto('file://' + dir + '/index.html', { waitUntil: 'domcontentloaded' }); await q.waitForFunction(() => window.TOPS_LOAD);
    const g = await q.evaluate(async () => { TOPS_LOAD.set(.4); await new Promise(r => setTimeout(r, 900)); const pctMid = document.getElementById('ldPct').textContent, barMid = parseFloat(document.getElementById('ldBar').style.width);
      window.__letGo = 1; document.getElementById('loading').classList.add('gone'); await new Promise(r => setTimeout(r, 30)); return { pctMid, barMid, bar: document.getElementById('ldBar').style.width, pct: document.getElementById('ldPct').textContent }; });
    if (g.pctMid !== '40%' || !(g.barMid > 40)) fail.push(`${W}: % should show real 40 while the bar creeps: ${JSON.stringify(g)}`); if (g.bar !== '100%' || g.pct !== '100%') fail.push(`${W}: game .gone path did not fill: ${JSON.stringify(g)}`);
    out[W].gonePath = g; await q.close(); }
  console.log(JSON.stringify(out)); console.log(fail.length ? 'ld-screen FAIL: ' + fail.join('; ') : 'ld-screen PASS (390 + 360)'); await b.close(); process.exit(fail.length ? 1 : 0); })();
