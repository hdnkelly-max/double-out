// Kill switch `crowd` (Process V2 §7, Art): with TOPS_SAFE.crowd on from boot, Worlds and Regional show no spectators
// (no crowd-atlas meshes, no box/sphere crowd) and crowd.webp is never requested; switched off at the next match boundary,
// Worlds has its crowd again. Prints one line per match. usage: node tests/safe-crowd.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const reqs = []; p.on('request', r => { if (/crowd\.webp/.test(r.url())) reqs.push(Date.now()); });
  await p.addInitScript(() => { window.TOPS_SAFE = { crowd: true }; });
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(4000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} });
  const count = () => p.evaluate(() => { let atlas = 0, inst = 0; V._qa.scene.traverse(o => { const m = o.material; if (o.isMesh && m && m.map && m.map.image && /crowd/.test(m.map.image.src || '')) atlas++; if (o.isInstancedMesh && o.count > 20) inst++; }); return { atlas, instanced: inst }; });
  const fails = [];
  for (const [tier, on] of [[6, true], [2, true], [6, false]]) {
    const before = reqs.length;
    await p.evaluate(([tier, on]) => { window.TOPS_SAFE = { crowd: on }; try { if (S && !S.done) S.done = true; } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); }, [tier, on]);
    await p.waitForTimeout(on ? 9000 : 14000);
    const r = Object.assign({ tier, switchOn: on, crowdRequests: reqs.length - before }, await count()); console.log(JSON.stringify(r));
    if (on && (r.atlas || r.instanced || r.crowdRequests)) fails.push(`tier ${tier} with the switch on still has crowd (atlas ${r.atlas}, instanced ${r.instanced}, requests ${r.crowdRequests})`);
    if (!on && !r.atlas) fails.push(`tier ${tier} with the switch off has no crowd`);
  }
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(fails.length ? 'SAFE-CROWD FAIL\n- ' + fails.join('\n- ') : 'SAFE-CROWD PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
