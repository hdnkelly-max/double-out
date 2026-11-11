// Kill switch `simpleFigures` (Process V2 §7, Art): on from boot, no character GLB is requested (rig, chars/*.glb,
// hair.glb, anims.glb), every figure is the code-built one and a match plays; switched off at the next match boundary,
// the rig loads and figures are rigged again. Prints one line per step. usage: node tests/safe-figures.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const glb = []; p.on('request', r => { const u = r.url(); if (/(remy|anims|hair)\.glb|chars\/[a-z]+\.glb/.test(u)) glb.push(u.replace(/.*\//, '')); });
  await p.addInitScript(() => { window.TOPS_SAFE = { simpleFigures: true }; });
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(5000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} });
  const figs = () => p.evaluate(() => { let rigged = 0, skinned = 0; V._qa.scene.traverse(o => { if (o.userData && o.userData.rigged) rigged++; if (o.isSkinnedMesh) skinned++; }); return { rigged, skinned, rigReady: V._qa.rigReady() }; });
  const fails = [];
  // 1: switch on from boot, play a short match (darts land, a visit completes)
  await p.evaluate(() => { const n = nextOpponent(); beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); });
  await p.waitForTimeout(8000);
  /* drive real landings through land() the way tests/match-growth.js does (bull-up first, then our visits), up to 3 darts */
  for (let t0 = Date.now(); Date.now() - t0 < 60000;) {
    const st = await p.evaluate(() => { try { if (S.done) return 'done'; if (S.p[0].darts >= 3) return 'ok';
      if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(gauss() * 30, gauss() * 30); } return 'bull'; }
      if (S.cur === 0 && !S.busy && S.visit.length < 3 && !S.p[0].ai) { const t = targetPoint(aimFor(S.p[0].score, 4 - S.dart)); S.busy = true; land(t.x + gauss() * 6, t.y + gauss() * 6); } return 'play'; } catch (e) { return 'ERR ' + e.message; } });
    if (st === 'ok' || st === 'done' || /^ERR/.test(st)) { if (/^ERR/.test(st)) fails.push('driver: ' + st); break; } await p.waitForTimeout(700);
  }
  const a = Object.assign({ step: 'on from boot', glbRequests: glb.slice(), dartsThrown: await p.evaluate(() => (S && S.p && S.p[0] && S.p[0].darts) || 0) }, await figs()); console.log(JSON.stringify(a));
  if (a.glbRequests.length) fails.push('character GLBs requested with the switch on: ' + a.glbRequests.join(', '));
  if (a.rigged || a.skinned) fails.push(`rigged figures with the switch on (rigged ${a.rigged}, skinned ${a.skinned})`);
  if (!a.dartsThrown) fails.push('no darts thrown with simple figures');
  // 2: switch off at the next match boundary: the rig loads and figures are rigged again
  await p.evaluate(() => { window.TOPS_SAFE = {}; try { S.done = true; } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); });
  await p.waitForFunction(() => V._qa.rigReady(), null, { timeout: 60000, polling: 1000 }).catch(() => {});
  await p.evaluate(() => { try { S.done = true; } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); });
  await p.waitForTimeout(10000);
  const c = Object.assign({ step: 'off at match boundary', glbRequests: glb.length }, await figs()); console.log(JSON.stringify(c));
  if (!c.rigReady || !c.skinned) fails.push(`switch off but figures not rigged (rigReady ${c.rigReady}, skinned ${c.skinned})`);
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(fails.length ? 'SAFE-FIGURES FAIL\n- ' + fails.join('\n- ') : 'SAFE-FIGURES PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
