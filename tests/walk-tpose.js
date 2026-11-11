// Art (walk-on 8.5 -> 9): the walk-on must never show the player in bind pose (T-pose). The rig can't animate until
// assets/anims.glb is in; this test delays that file by 15 s and counts walk-on frames where the walking figure is on
// screen without an animation mixer. Fails on 1.96 (the walk starts regardless), passes when the walk holds on an
// establishing shot (or skips) until the clips are ready. usage: node tests/walk-tpose.js
const { chromium } = require('playwright'); const DELAY = process.env.DELAY != null ? +process.env.DELAY : 15000; /* ms the clips arrive late */ const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.route(/assets\/anims\.glb$/, async r => { await new Promise(z => setTimeout(z, DELAY)); r.continue(); });
  await p.addInitScript(() => { window.__bad = 0; window.__frames = 0;
    setInterval(() => { const f = window.TOPS_WALKFX; if (!f || f.__w) return; const g = function (now, v) { const r = f.apply(this, arguments);
      try { if (r && v && v.me && document.body.classList.contains('tc-walking')) {   /* frames the walk-on owns the camera */ window.__frames++; let vis = true, q = v.me; while (q) { if (!q.visible) vis = false; q = q.parent; } if (vis && !v.me.userData.mixer) window.__bad++; if (vis && v.me.userData.mixer) window.__anim = (window.__anim || 0) + 1; } } catch (e) {}
      return r; }; g.__w = 1; window.TOPS_WALKFX = g; }, 30); });
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(5000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; newCareer(); TC_API.grant('walk_power'); TC_API.equip('walk_power'); persist(); });
  await p.evaluate(() => { try { sessionStorage.removeItem('tcWalkSeen'); } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 2, p0: 'Test', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); });
  const started = await p.waitForFunction(() => document.body.classList.contains('tc-walking'), null, { timeout: 40000, polling: 100 }).then(() => true).catch(() => false);
  await p.waitForFunction(() => !document.body.classList.contains('tc-walking'), null, { timeout: 120000, polling: 250 }).catch(() => {});
  const r = await p.evaluate(() => ({ frames: window.__frames, tpose: window.__bad, animated: window.__anim || 0 }));
  const fails = []; if (!started) fails.push('walk-on did not start'); if (r.tpose) fails.push(`${r.tpose} of ${r.frames} walk-on frames showed the player without animation (T-pose)`);
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r)); console.log(fails.length ? 'WALK-TPOSE FAIL\n- ' + fails.join('\n- ') : 'WALK-TPOSE PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
