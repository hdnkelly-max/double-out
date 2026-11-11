// Art (QA 05:59 follow-up): the shared crowd atlas is loaded once and kept; venue rebuilds must not dispose it (that
// re-uploads a 1024-wide texture on every switch). Switches Worlds -> Regional -> Worlds -> Trans-Tasman -> Worlds and
// counts dispose() calls on the atlas. Fails on 1.96. usage: node tests/crowdkeep.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: +(process.env.VW || 390), height: process.env.VW == 360 ? 640 : 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); if (process.env.PHONE) { const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await p.addInitScript(() => { Object.defineProperty(window, 'TOPS_ASSETS', { configurable: true, get: () => 'assets/m/', set: () => {} }); }); }   /* rule 26: phone profile */
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(4000);
  const go = t => p.evaluate(t => { try { if (S && !S.done) S.done = true; } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: t, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); }, t);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} });
  await go(6); await p.waitForTimeout(9000);
  const hooked = await p.evaluate(() => { let tex = null; V._qa.scene.traverse(o => { const m = o.material; if (!tex && m && m.map && m.map.image && /crowd/.test(m.map.image.src || '')) tex = m.map; }); if (!tex) return false; window.__cd = 0; const d = tex.dispose.bind(tex); tex.dispose = () => { window.__cd++; d(); }; window.__ct = tex; return true; });
  for (const t of [2, 6, 4, 6]) { await go(t); await p.waitForTimeout(6000); }
  const r = await p.evaluate(() => { let same = false; V._qa.scene.traverse(o => { if (o.material && o.material.map === window.__ct) same = true; }); return { disposed: window.__cd, stillUsed: same }; });
  const fails = []; if (!hooked) fails.push('crowd atlas not found in the Worlds scene');
  else { if (r.disposed) fails.push(`crowd atlas disposed ${r.disposed} times over 4 venue switches`); if (!r.stillUsed) fails.push('Worlds no longer uses the same atlas texture after the switches'); }
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(JSON.stringify(r)); console.log(fails.length ? 'CROWDKEEP FAIL\n- ' + fails.join('\n- ') : 'CROWDKEEP PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
