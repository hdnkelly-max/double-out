// Art: screenshot a venue in a real career match at phone and desktop size.
// Usage: node wip/art/venueshot.js <tier> <tag> [page=double-out-standalone.html]
const { chromium } = require('playwright');
const path = require('path');
const tier = +process.argv[2] || 1, tag = process.argv[3] || 'x';
const page = process.argv[4] || 'double-out-standalone.html';
const out = path.resolve(__dirname, 'shots'); require('fs').mkdirSync(out, { recursive: true });
const VIEWS = { p390: { width: 390, height: 844 }, d1280: { width: 1280, height: 800 } };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  for (const [vn, vp] of Object.entries(VIEWS)) {
    const p = await b.newPage({ viewport: vp });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/supabase\.co/, r => r.abort());
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: path.resolve(__dirname, '../../node_modules/three/build/three.min.js'), contentType: 'application/javascript' }));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    if (process.env.DEBUGW) await p.addInitScript(() => { window.TOPS_VENUE_DEBUGW = 1; });
    await p.goto('file://' + path.resolve(__dirname, '../../' + page), { waitUntil: 'domcontentloaded', timeout: 180000 });
    await p.waitForTimeout(4000);
    await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); });
    await p.evaluate((tier) => { try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {}
      const n = nextOpponent(); beginMatch({ mode: 'career', tier, p0: 'Test', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); }, tier);
    if (tier <= 1) await p.waitForFunction(() => window.__gradeMs && Object.keys(window.__gradeMs).length >= 5, null, { timeout: 60000 }).catch(() => console.log('baked venue not graded in 60 s'));
    await p.waitForTimeout(tier <= 1 ? 4000 : 9000);
    await p.screenshot({ path: `${out}/${tag}_t${tier}_${vn}_a.png` });
    // throw a visit so the camera shows the room from the oche / opponent's turn
    for (let i = 0; i < 3; i++) { await p.mouse.click(vp.width / 2, vp.height * .45); await p.waitForTimeout(350); await p.mouse.click(vp.width / 2, vp.height * .45); await p.waitForTimeout(1600); }
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${tag}_t${tier}_${vn}_b.png` });
    await p.waitForTimeout(3500);
    await p.screenshot({ path: `${out}/${tag}_t${tier}_${vn}_c.png` });
    console.log(vn, 'errors:', errs.length ? errs.slice(0, 3) : 'none');
    await p.close();
  }
  await b.close();
})();
