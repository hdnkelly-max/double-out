// Kill switch `simpleFigures` with character loads already in flight (ChatGPT P0-1): boot normally (switch off) with the
// character GLBs held back 6 s, switch on before they land, start a match; after they land there must be no rigged or
// skinned figure in the scene and no figure rebuild from the late loads. usage: node tests/safe-inflight.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  let landed = 0; const reqs = [];
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.route(/(remy|anims|hair|chars\/[a-z]+)\.glb/, async r => { reqs.push(r.request().url().replace(/.*\//, '')); await new Promise(res => setTimeout(res, 6000)); landed++; await r.continue(); });
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(1500);
  const fails = [];
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {}
    const n0 = nextOpponent(); beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n0.oppKey, oppName: n0.oppName, oppAvg: 50, legs: 1, start: 501 }); });
  await p.waitForTimeout(1500);   /* normal match: its character files are requested now and held 6 s */
  const held = reqs.length; if (!held) fails.push('setup: no character load in flight');
  await p.evaluate(() => { window.TOPS_SAFE = { simpleFigures: true }; try { S.done = true; } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); });
  await p.waitForTimeout(16000);   // the held loads land during this wait
  const r = await p.evaluate(() => { let rigged = 0, skinned = 0; V._qa.scene.traverse(o => { if (o.userData && o.userData.rigged) rigged++; if (o.isSkinnedMesh) skinned++; }); return { rigged, skinned, rigReady: V._qa.rigReady() }; });
  r.landed = landed; r.held = reqs; console.log(JSON.stringify(r));
  if (!landed) fails.push('setup: no held load landed');
  if (r.rigged || r.skinned) fails.push(`late loads put rigged figures in a safe match (rigged ${r.rigged}, skinned ${r.skinned})`);
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(fails.length ? 'SAFE-INFLIGHT FAIL\n- ' + fails.join('\n- ') : 'SAFE-INFLIGHT PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
