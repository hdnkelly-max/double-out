// Art: list the side-view dressing (sprites, banners) for a tier and the camera, after the venue settles.
const { chromium } = require('playwright'); const path = require('path'); const TIER = +(process.argv[2] || 4);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.route(/supabase\.co|fonts\./, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: path.resolve('node_modules/three/build/three.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + path.resolve('double-out-standalone.html'), { timeout: 240000 }); await p.waitForTimeout(4000);
  await p.evaluate(t => { save.authSeen = true; V.walkOn = () => {}; newCareer(); sessionStorage.setItem('tcWalkSeen', '1'); const n = nextOpponent(); beginMatch({ mode: 'career', tier: t, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); }, TIER);
  await p.waitForTimeout(20000);
  console.log(await p.evaluate(() => { const out = []; V._qa.scene.traverse(o => { if (o.name === 'sideDress') { out.push('sideDress kids ' + o.children.length); o.children.forEach(c => { if (c.isMesh && c.material && c.material.alphaTest) { const w = new THREE.Vector3(); c.getWorldPosition(w); out.push('sprite ' + w.toArray().map(v => v.toFixed(2)) + ' img ' + !!(c.material.map && c.material.map.image)); } }); } });
    const cams = ['camera', 'armCam'].map(k => V._qa[k] ? k + ' ' + V._qa[k].position.toArray().map(v => v.toFixed(2)) : k + ' none'); out.push(...cams); return out.slice(0, 10).join('\n'); }));
  await b.close();
})();
