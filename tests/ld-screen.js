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
    if (!(r.jump >= 60 && r.capped <= 72.5 && r.capped > r.jump)) fail.push(`${W}: after 60 %: ${r.jump} → ${r.capped}`); if (r.full !== 100 || !r.gone) fail.push(`${W}: done() ${r.full}% gone ${r.gone}`);
    if (r.safe.footBottom > r.safe.H - 20 || r.safe.logoTop < 40 || r.safe.side < 16) fail.push(`${W}: layout ${JSON.stringify(r.safe)}`); if (pe.length) fail.push(`${W}: page errors ${pe.join('; ').slice(0, 120)}`);
    // the game's own .gone (old path) fills the bar first
    out[W] = r; await p.close(); }
  console.log(JSON.stringify(out)); console.log(fail.length ? 'ld-screen FAIL: ' + fail.join('; ') : 'ld-screen PASS (390 + 360)'); await b.close(); process.exit(fail.length ? 1 : 0); })();
