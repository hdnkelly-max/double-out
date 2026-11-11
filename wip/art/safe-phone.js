// Pre-flight (rule 26.3) for the safe rendering profile: 360x640, CPU x4, phone asset set (assets/m/), TOPS_SAFE={profile:'safe'}.
// One Club match from boot: no character/crowd GLB or crowd.webp requests, plain venue materials, no warm light, no page errors,
// darts land through land(). Saves a shot to wip/art/safe_phone_360.png. usage: node wip/art/safe-phone.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '../..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const errs = [], req = []; p.on('pageerror', e => errs.push(e.message)); p.on('request', r => { const u = r.url(); if (/\.glb|crowd\.webp/.test(u) && !/(club|pub)2?\.glb/.test(u)) req.push(u.replace(/^.*assets\//, '')); });
  await p.addInitScript(() => { window.TOPS_SAFE = { profile: 'safe' }; window.TOPS_ASSETS = 'assets/m/'; });
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(5000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} });
  await p.evaluate(() => { const n = nextOpponent(); beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); });
  const fails = [];
  for (let t0 = Date.now(); Date.now() - t0 < 80000;) {
    const st = await p.evaluate(() => { try { if (S.done) return 'done'; if (S.p[0].darts >= 3) return 'ok';
      if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(gauss() * 30, gauss() * 30); } return 'bull'; }
      if (S.cur === 0 && !S.busy && S.visit.length < 3 && !S.p[0].ai) { const t = targetPoint(aimFor(S.p[0].score, 4 - S.dart)); S.busy = true; land(t.x + gauss() * 6, t.y + gauss() * 6); } return 'play'; } catch (e) { return 'ERR ' + e.message; } });
    if (st === 'ok' || st === 'done' || /^ERR/.test(st)) { if (/^ERR/.test(st)) fails.push('driver: ' + st); break; } await p.waitForTimeout(800);
  }
  await p.waitForTimeout(3000);
  const r = await p.evaluate(() => { const R = V._qa.renderer; let vfx = 0, venueProg = 0, pl = 0, rigged = 0, skinned = 0, atlas = 0;
    V._qa.scene.traverse(o => { if (o.isPointLight && Math.abs(o.distance - 3.6) < 1e-6) pl++; if (o.userData && o.userData.rigged) rigged++; if (o.isSkinnedMesh) skinned++;
      const m = o.isMesh && o.material; if (m && m.map && m.map.image && /crowd/.test(m.map.image.src || '')) atlas++;
      if (m && m.userData && m.userData.vfx) { vfx++; const P = R.properties.get(m), pr = P.currentProgram || P.program; if (pr && /topsVenue/.test(pr.cacheKey)) venueProg++; } });
    return { darts: S.p[0].darts, vfx, venueProg, light: pl, rigged, skinned, atlas, geo: R.info.memory.geometries, tex: R.info.memory.textures }; });
  r.requests = req; console.log(JSON.stringify(r));
  await p.screenshot({ path: root + '/wip/art/safe_phone_360.png' });
  if (req.length) fails.push('asset requests with safe profile: ' + req.join(', '));
  if (r.venueProg || r.light) fails.push('venue fx still on');
  if (r.rigged || r.skinned) fails.push('rigged figures present');
  if (r.atlas) fails.push('crowd atlas present');
  if (!r.darts) fails.push('no darts landed');
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(fails.length ? 'SAFE-PHONE FAIL\n- ' + fails.join('\n- ') : 'SAFE-PHONE PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
