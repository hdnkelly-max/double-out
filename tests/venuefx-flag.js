// #15 A/B: ?venuefx=0 must turn off the Club light shader (no topsVenue program) and its extra point light; without the
// flag the Club is as live. usage: node tests/venuefx-flag.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const res = {}, fails = [];
  for (const q of ['', '?venuefx=0']) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    await p.goto('file://' + root + '/double-out-standalone.html' + q, { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(4000);
    await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); });
    await p.waitForFunction(() => { let n = 0; V._qa.scene.traverse(o => { if (o.isMesh && /^bake_/.test(o.name)) n++; }); return n >= 5; }, null, { timeout: 120000, polling: 1000 });
    await p.waitForTimeout(5000);
    res[q || 'live'] = await p.evaluate(() => { let pl = 0; V._qa.scene.traverse(o => { if (o.isPointLight && Math.abs(o.distance - 3.6) < 1e-6) pl++;   /* intensities are rescaled by the venue dimmer */ }); return { venueProg: V._qa.renderer.info.programs.some(x => /topsVenue/.test(x.cacheKey)), clubLight: pl }; });
    if (errs.length) fails.push((q || 'live') + ' page errors: ' + errs.slice(0, 2).join(' | ')); await p.close();
  }
  if (!res.live.venueProg || !res.live.clubLight) fails.push('without the flag the Club should be as live (shader + light)');
  if (res['?venuefx=0'].venueProg || res['?venuefx=0'].clubLight) fails.push('?venuefx=0 still has the shader or the light');
  console.log(JSON.stringify(res)); console.log(fails.length ? 'VENUEFX FAIL\n- ' + fails.join('\n- ') : 'VENUEFX PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
