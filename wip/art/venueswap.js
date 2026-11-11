// Art: QA's Club send-back checks on the phone profile (CDP CPU throttle x4, phone asset set assets/m/).
// Plays club -> pub -> club. For each match: time from match start to the baked venue in the scene, long frames
// (> 50 ms) while it loads, large getImageData calls (reported; see the control note below), shader programs, and the
// scene brightness behind the thrower (the second club must match the first: same lighting after a venue switch).
// Usage: node wip/art/venueswap.js [throttle=4]
const { chromium } = require('playwright'); const path = require('path');
const TH = +process.argv[2] || 4;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/supabase\.co|fonts\./, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: path.resolve('node_modules/three/build/three.min.js'), contentType: 'application/javascript' }));
  const glbs = []; p.on('request', r => { if (/\.glb$/.test(r.url())) glbs.push(r.url().replace(/.*assets\//, 'assets/')); });
  await p.addInitScript(() => {
    let a = 'assets/m/'; Object.defineProperty(window, 'TOPS_ASSETS', { configurable: true, get: () => a, set: () => {} });   // phone asset set
    window.__big = 0; const gi = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (x, y, w, h) { if (w * h >= 512 * 512) window.__big++; return gi.apply(this, arguments); };
    window.__long = 0; let last = performance.now(); (function f() { const n = performance.now(); if (n - last > 50) window.__long++; last = n; requestAnimationFrame(f); })();
  });
  const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: TH });
  await p.goto('file://' + path.resolve('double-out-standalone.html'), { timeout: 240000 }); await p.waitForTimeout(8000);
  await p.evaluate(() => { save.authSeen = true; V.walkOn = () => {}; newCareer(); sessionStorage.setItem('tcWalkSeen', '1'); });
  const res = [];
  for (const tier of [1, 0, 1]) {
    await p.evaluate(() => { window.__big = 0; window.__long = 0; try { if (window.S && !S.done) S.done = true; } catch (e) {} });
    const t0 = Date.now();
    await p.evaluate(t => { const n = nextOpponent(); beginMatch({ mode: 'career', tier: t, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); }, tier);
    let ms = null;
    try { await p.waitForFunction(() => { let n = 0; V._qa.scene.traverse(o => { if (o.isMesh && /^bake_/.test(o.name)) n++; }); return n >= 5; }, null, { timeout: 120000, polling: 250 }); ms = Date.now() - t0; } catch (e) {}
    await p.waitForTimeout(6000);
    const r = await p.evaluate(() => ({ big: window.__big, long: window.__long, programs: V._qa.renderer.info.programs.length, tex: V._qa.renderer.info.memory.textures, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
      keys: [...new Set(V._qa.renderer.info.programs.map(q => q.cacheKey).filter(k => /topsVenue/.test(k)).map(k => k.match(/topsVenue\d/)[0]))] }));
    const shot = await p.screenshot({ clip: { x: 0, y: 420, width: 390, height: 300 } });
    r.bright = await p.evaluate(async b64 => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, 60, 120).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return Math.round(s / (d.length / 4) / 3); }, shot.toString('base64'));   // left edge of the scene: venue wall, not the thrower
    r.tier = tier; r.bakedInMs = ms; res.push(r); console.log(JSON.stringify(r));
  }
  console.log('glb requests:', [...new Set(glbs)].filter(g => /club|pub/.test(g)).join(', '));
  const fails = [];
  res.forEach(r => { if (r.bakedInMs == null) fails.push(`tier ${r.tier}: baked venue never appeared`); });
  // large getImageData calls also come from other code (portraits, shirts, dart renders): clean src 1.88 gives 16/14/1,
  // so they're reported, not judged. The runtime grade itself must be gone:
  if (await p.evaluate(() => !!window.TOPS_VENUE_GRADE)) fails.push('runtime grade code still in the game (TOPS_VENUE_GRADE)');
  const keys = res[2].keys || []; if (!keys.includes('topsVenue1')) fails.push('club light shader has no program cache key');
  if (Math.abs(res[0].bright - res[2].bright) > 3) fails.push(`club after pub looks different: brightness ${res[0].bright} vs ${res[2].bright}`);
  if (res[2].programs > res[1].programs) fails.push(`programs grew on returning to club: ${res[1].programs} -> ${res[2].programs}`);
  if (!glbs.some(g => /m\/club2\.glb/.test(g))) fails.push('phone set did not load the graded club2.glb');
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(fails.length ? 'VENUESWAP FAIL\n- ' + fails.join('\n- ') : 'VENUESWAP PASS');
  await b.close(); process.exit(fails.length ? 1 : 0);
})();
