// EXP-UX round 2: character and dart renders from the game itself (V.portrait, V.heroShot, V.dartShot) for the prototype.
// usage: node wip/ux/proto/renders.js <gameDir>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const dir = process.argv[2], out = path.join(__dirname, 'img');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: dir + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + dir + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await p.waitForFunction(() => typeof V !== 'undefined' && V.portrait && typeof newCareer === 'function', null, { timeout: 180000 });
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; newCareer(); save.name = 'Hayden'; career().tier = 1; });
  await p.waitForFunction(() => typeof RIG !== 'undefined' ? !!RIG.ready : true, null, { timeout: 120000 }).catch(() => {});
  await p.evaluate(() => { const mal = Object.assign(lookFor('Big Mal'), { model: 'david', beard: 1, build: 2 }); window.__mal = mal;
    // first calls (tier 3) make the game load each character model; the real renders below use tier 1, a new cache key
    try { V.portrait(save.look, 'Hayden', 3, 0); V.portrait(mal, 'Big Mal', 3, 0); V.heroShot(save.look, 'Hayden', 3); V.heroShot(mal, 'Big Mal', 3); } catch (e) {} });
  await p.waitForTimeout(25000);
  await p.waitForTimeout(8000);   // anims
  const res = await p.evaluate(() => {
    const o = {}; const tryit = (k, f) => { try { o[k] = f(); } catch (e) { o[k] = 'ERR ' + e.message; } };
    const mal = window.__mal;
    tryit('me_portrait', () => V.portrait(save.look, 'Hayden', 1, 0));
    tryit('mal_portrait', () => V.portrait(mal, 'Big Mal', 1, 0));
    tryit('me_hero', () => V.heroShot(save.look, 'Hayden', 1));
    tryit('mal_hero', () => V.heroShot(mal, 'Big Mal', 1));
    const bar = id => (typeof BARRELS !== 'undefined' ? BARRELS.find(x => x.id === id) : null);
    ['razor', 'assassin', 'zen', 'vapor8', 'asp', 'supergrip'].forEach(id => tryit('dart_' + id, () => V.dartShot(save.flight, Object.assign(setupParts(), { barrel: bar(id) }))));
    return o;
  });
  const sizes = {};
  for (const [k, v] of Object.entries(res)) { if (typeof v === 'string' && v.startsWith('data:image')) { const ext = v.slice(11, 15).replace(';', ''); fs.writeFileSync(path.join(out, k + '.' + (ext === 'jpeg' ? 'jpg' : ext)), Buffer.from(v.split(',')[1], 'base64')); sizes[k] = v.length; } else sizes[k] = String(v).slice(0, 80); }
  console.log(JSON.stringify({ sizes, errs: errs.slice(0, 3) }));
  await b.close();
})();
