const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  p.on('request', r => { if (/glb|webp/.test(r.url())) console.log('REQ', r.url().slice(-60)); }); p.on('requestfailed', r => console.log('FAIL', r.url().slice(-60))); p.on('console', m => { if (/glb|venue|grade/i.test(m.text())) console.log('CONSOLE', m.text().slice(0,200)); }); await p.route(/supabase\.co|fonts\./, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: path.resolve('node_modules/three/build/three.min.js'), contentType: 'application/javascript' }));
  await p.goto('file://' + path.resolve('double-out-standalone.html')); await p.waitForTimeout(4000);
  await p.evaluate(() => { save.authSeen = true; V.walkOn = () => {}; newCareer(); sessionStorage.setItem('tcWalkSeen','1'); const n = nextOpponent(); beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); });
  await p.waitForTimeout(20000);
  await p.waitForFunction(() => window.__gradeMs && Object.keys(window.__gradeMs).length >= 5, null, { timeout: 60000 });
  console.log(await p.evaluate(() => { const T = THREE, out = []; V._qa.scene.traverse(o => { if (!o.isMesh || o.name !== 'bake_wallR') return;
    const g = o.geometry, P = g.attributes.position, U = g.attributes.uv, mn = new T.Vector3(1e9,1e9,1e9), mx = new T.Vector3(-1e9,-1e9,-1e9), v = new T.Vector3(); let n = 0;
    for (let k = 0; k < U.count; k++) { const us = U.normalized ? (U.array instanceof Uint16Array ? 65535 : U.array instanceof Uint8Array ? 255 : 1) : 1, ps = P.normalized ? (P.array instanceof Int16Array ? 32767 : P.array instanceof Int8Array ? 127 : 1) : 1; const u = U.getX(k) / us, w = U.getY(k) / us; if (u > .6 && u < .86 && w > .09 && w < .27) { v.fromBufferAttribute(P, k).multiplyScalar(1 / ps).applyMatrix4(o.matrixWorld); if (n < 400) out.push(u.toFixed(3) + ',' + w.toFixed(3) + ' -> ' + v.toArray().map(x => x.toFixed(2)).join(',')); n++; } }
    out.push('verts ' + n + ' min ' + mn.toArray().map(x => x.toFixed(2)) + ' max ' + mx.toArray().map(x => x.toFixed(2)) + ' flipY ' + (o.material.map && o.material.map.flipY)); }); return out.join('\n'); }));
  await b.close();
})();
