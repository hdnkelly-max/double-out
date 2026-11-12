// Art (walk-on 8.5 -> 9): the walk-on must never show the player in bind pose (T-pose). The rig can't animate until
// assets/anims.glb is in; this test delays that file by 15 s and counts walk-on frames where the walking figure is on
// screen without an animation mixer. Fails on 1.96 (the walk starts regardless), passes when the walk holds on an
// establishing shot (or skips) until the clips are ready. usage: node tests/walk-tpose.js
// EXP-1d (Q&D 22:46 send-back): DELAY=0 must animate (animated > 0) with ~no hold; DELAY=15000 holds at most 4 s, then animates or skips cleanly.
// TAP=1 (QA 14:24): tap to skip 1.5 s into the hold; still no unposed frame. Also checks the hold camera really sits on the
// establishing shot (behind the oche, ~3.4 m back), not at the gameplay view.
const { chromium } = require('playwright'); const DELAY = process.env.DELAY != null ? +process.env.DELAY : 15000; /* ms the clips arrive late */ const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: +(process.env.VW || 390), height: process.env.VW == 360 ? 640 : 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); if (process.env.PHONE) { const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await p.addInitScript(() => { Object.defineProperty(window, 'TOPS_ASSETS', { configurable: true, get: () => 'assets/m/', set: () => {} }); }); }   /* rule 26: phone profile */
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.route(/anims\.glb$/, async r => { await new Promise(z => setTimeout(z, DELAY)); r.continue(); });
  await p.addInitScript(() => { window.__bad = 0; window.__frames = 0; { const ad = DOMTokenList.prototype.add; DOMTokenList.prototype.add = function (...a) { if (a.includes('tc-walking')) window.__walkSeen = 1; return ad.apply(this, a); }; }
    setInterval(() => { const f = window.TOPS_WALKFX; if (!f || f.__w) return; const g = function (now, v) { const r = f.apply(this, arguments);
      try { if (r && v && v.me && document.body.classList.contains('tc-walking')) {   /* frames the walk-on owns the camera */ window.__frames++; let vis = true, q = v.me; while (q) { if (!q.visible) vis = false; q = q.parent; } if (vis && !v.me.userData.mixer) window.__bad++; if (vis && v.me.userData.mixer) window.__anim = (window.__anim || 0) + 1; if (!vis) window.__hidden = (window.__hidden || 0) + 1; if (!vis && r.fov === 52) { const t = performance.now(); if (window.__h0 == null) window.__h0 = t; window.__h1 = t; const z = v.pos.z - (typeof OCHE_Z !== 'undefined' ? OCHE_Z : 2.37); window.__hold = (window.__hold || 0) + 1; (window.__hck = window.__hck || []).push((v.me.userData.ck || '-') + '@' + Math.round(performance.now())); window.__holdMinZ = Math.min(window.__holdMinZ == null ? 9 : window.__holdMinZ, z); } } } catch (e) {}
      return r; }; g.__w = 1; window.TOPS_WALKFX = g; }, 30); });
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(5000);
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; const l = $('login'); if (l) l.hidden = true; newCareer(); { const c = career(); c.stage = 'season'; c.tier = 2; newSeason(c); } TC_API.grant('walk_power'); TC_API.equip('walk_power'); persist(); });
  if (DELAY === 0) {   /* the real path: the hub has the clip file before you walk on (it plays the idle on the hub figure) */
    await p.evaluate(() => showHub('play'));
    await p.waitForTimeout(+(process.env.HUBWAIT || 6000));   /* the hub fetches anims.glb (EXP-1d) */
  }
  await p.evaluate(() => { try { sessionStorage.removeItem('tcWalkSeen'); } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 2, p0: 'Test', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); });
  const started = await p.waitForFunction(() => !!window.__walkSeen, null, { timeout: 40000, polling: 100 }).then(() => true).catch(() => false);
  if (process.env.REBUILD) { await p.waitForTimeout(+process.env.REBUILD);   /* ChatGPT 9.2 P2: rebuild the player's figure mid-walk (as character models landing do); it must never show unposed */ await p.evaluate(() => { try { V.setPlayerLook(save.look, save.flight, save.name, 2); window.__rebuilt = 1; } catch (e) { window.__rebuilt = 'err ' + e.message; } }); }
  if (process.env.TAP) { await p.waitForTimeout(+process.env.TAPAT || 1500);   /* TAPAT=3950: tap at the hold's 4 s cap (ChatGPT P2) */ await p.evaluate(() => { const o = document.getElementById('tcWalk'); if (o) o.click(); }); }
  await p.waitForFunction(() => !document.body.classList.contains('tc-walking'), null, { timeout: 120000, polling: 250 }).catch(() => {});
  const r = await p.evaluate(() => ({ frames: window.__frames, tpose: window.__bad, animated: window.__anim || 0, hold: window.__hold || 0, hidden: window.__hidden || 0, holdMinZ: window.__holdMinZ, holdMs: window.__h0 == null ? 0 : Math.round(window.__h1 - window.__h0), rebuilt: window.__rebuilt, hck: window.__hck }));
  const fails = []; if (!started) fails.push('walk-on did not start'); if (r.tpose) fails.push(`${r.tpose} of ${r.frames} walk-on frames showed the player without animation (T-pose)`);
  if (DELAY > 3000 && !r.hidden) fails.push('the figure was never held hidden while the clips were late'); if (r.hold && r.holdMinZ < 3.0) fails.push(`hold camera only ${r.holdMinZ.toFixed(2)} m behind the oche (gameplay view), not the establishing shot`);
  if (DELAY === 0 && !r.animated) fails.push('clips on time but the walk never animated (0 animated frames)'); if (DELAY === 0 && r.holdMs > 1000) fails.push(`clips on time but held ${r.holdMs} ms`); if (r.holdMs > 4300) fails.push(`held ${r.holdMs} ms (cap 4 s)`);
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r)); console.log(fails.length ? 'WALK-TPOSE FAIL\n- ' + fails.join('\n- ') : 'WALK-TPOSE PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
