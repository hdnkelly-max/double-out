// Art: walk-on stills at fixed points of the timeline (TC_WALK_FREEZE), phone and desktop.
// usage: node wip/art/walkshot.js <tag> [effect=walk_power] [ks=.15,.4,.6,.68,.85,.97] [tier=2]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const tag = process.argv[2] || 'x', fx = process.argv[3] || 'walk_power', ks = (process.argv[4] || '.15,.4,.6,.68,.85,.97').split(',').map(Number), tier = +(process.argv[5] || 2);
const root = path.resolve(__dirname, '../..'), out = path.resolve(__dirname, 'shots'); fs.mkdirSync(out, { recursive: true });
const VIEWS = { p390: { width: 390, height: 844 }, d1280: { width: 1280, height: 800 } };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  for (const [vn, vp] of Object.entries(process.env.VIEW ? { [process.env.VIEW]: VIEWS[process.env.VIEW] } : VIEWS)) {
    const p = await b.newPage({ viewport: vp }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(6000);
    await p.evaluate(fx => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; newCareer(); try { sessionStorage.removeItem('tcWalkSeen'); } catch (e) {}
      TC_API.grant(fx); TC_API.equip(fx); persist(); window.TC_WALK_FREEZE = .02; }, fx);
    // warm-up match (walk-on already seen) so the character models and anims.glb are in before the walk-on match;
    // otherwise SwiftShader's slow load means the walk-on holds/skips (no T-pose since 1f21ac7) and the stills show nothing useful
    await p.evaluate(tier => { sessionStorage.setItem('tcWalkSeen', '1'); const n = nextOpponent(); beginMatch({ mode: 'career', tier, p0: save.name || 'Test', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); }, tier);
    await p.waitForTimeout(+(process.env.WARM || 45000));
    await p.evaluate(() => { try { S.done = true; } catch (e) {} sessionStorage.removeItem('tcWalkSeen'); window.TC_WALK_FREEZE = .02; });
    await p.evaluate(tier => { const n = nextOpponent(); beginMatch({ mode: 'career', tier, p0: save.name || 'Test', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); }, tier);
    const walking = await p.waitForFunction(() => document.body.classList.contains('tc-walking'), null, { timeout: 30000, polling: 250 }).then(() => true).catch(() => false);
    if (!walking) { console.log(vn, 'walk-on did not start (S.cur != 0 or seen?)'); await p.close(); continue; }
    await p.waitForTimeout(8000);
    for (const k of ks) { await p.evaluate(k => { window.TC_WALK_FREEZE = k; }, k); await p.waitForTimeout(k >= .64 && k < .75 ? 1200 : k >= .85 ? 7000 : 3500); /* hero: let the one-shot cheer finish and clamp */ await p.screenshot({ path: `${out}/${tag}_${vn}_${String(k).replace('.', '')}.png` }); }
    console.log(vn, 'errors:', errs.length ? errs.slice(0, 3) : 'none'); await p.close();
  }
  await b.close();
})();
