// Art: Worlds side-stand crowd cheers on a big moment (SIDE_C via crowdBob). Usage: node wip/art/cheershot.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '../..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(4000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 6, p0: 'Test', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); });
  await p.waitForTimeout(12000);
  const uv = () => p.evaluate(() => { let s = 0, m = null; V._qa.scene.traverse(o => { if (o.isMesh && o.material && o.material.vertexColors && o.material.map && o.geometry.attributes.color) m = o; }); if (!m) return null; const a = m.geometry.attributes.uv.array; for (let i = 0; i < a.length; i++) s += a[i]; return +s.toFixed(2); });
  const u0 = await uv(); await p.screenshot({ path: __dirname + '/shots/cheer_before.png' });
  await p.evaluate(() => { try { V.cheer ? V.cheer(1) : null; } catch (e) {} });
  const hasCheer = await p.evaluate(() => typeof V.cheer);
  await p.waitForTimeout(300); const u1 = await uv(); await p.screenshot({ path: __dirname + '/shots/cheer_during.png' });
  await p.waitForTimeout(2500); const u2 = await uv();
  console.log(JSON.stringify({ hasCheer, u0, u1, u2, errs: errs.slice(0, 3) })); await b.close(); })();
