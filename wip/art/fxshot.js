// Art: screenshot Pub rules card effects in a live match (career at the Pub stands in for the online room; the
// effects only read S.cur and the board pane). Usage: node wip/art/fxshot.js <tag> [ids=juke,horn,heckle,door] [times=ms,ms,..]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const tag = process.argv[2] || 'x', ids = (process.argv[3] || 'juke,horn,heckle,door').split(','), times = (process.argv[4] || '150,600,1300').split(',').map(Number);
const root = path.resolve(__dirname, '../..'), out = path.resolve(__dirname, 'shots'); fs.mkdirSync(out, { recursive: true });
const VIEWS = { p390: { width: 390, height: 844 }, d1280: { width: 1280, height: 800 } };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  for (const [vn, vp] of Object.entries(process.env.VIEW ? { [process.env.VIEW]: VIEWS[process.env.VIEW] } : VIEWS)) {
    const p = await b.newPage({ viewport: vp }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(4000);
    await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {}
      const n = nextOpponent(); beginMatch({ mode: 'career', tier: 0, p0: 'Test', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); });
    await p.waitForFunction(() => { let n = 0; V._qa.scene.traverse(o => { if (o.isMesh && /^bake_/.test(o.name)) n++; }); return n >= 5; }, null, { timeout: 90000, polling: 1000 }).catch(() => console.log('no baked venue'));
    await p.waitForTimeout(5000);
    // SwiftShader renders a 3D frame in ~1 s, which stalls CSS animations and the FX canvas; freeze the 3D view (its last frame stays on
    // screen) so the effects play in real time like on a phone. Camera jolts from TOPS_DRUNKCAM don't show in these shots.
    await p.waitForFunction(() => S && S.cur === 0 && !S.busy && !S.aiFlying, null, { timeout: 60000, polling: 300 }).catch(() => {});
    { const still = (await p.screenshot()).toString('base64');   // the scene as it looks now, HUD included; it goes where the 3D canvas was, under the HUD
      await p.evaluate(src => { const r = V._qa.renderer, c = r.domElement, cs = getComputedStyle(c), im = new Image(); im.src = 'data:image/png;base64,' + src;
        Object.assign(im.style, { position: 'fixed', left: 0, top: 0, width: innerWidth + 'px', height: innerHeight + 'px', zIndex: cs.zIndex === 'auto' ? 0 : cs.zIndex, pointerEvents: 'none' });
        c.parentNode.insertBefore(im, c.nextSibling); c.style.visibility = 'hidden'; r.render = () => {}; }, still); }
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/${tag}_none_${vn}.png` });
    for (const id of ids) {
      await p.waitForFunction(() => S && S.cur === 0 && !S.busy && !S.aiFlying, null, { timeout: 60000, polling: 300 }).catch(() => console.log('not your turn'));
      const t0 = Date.now();
      await p.evaluate(id => { if (id === 'door') TOPS_PUBFX.door(); else if (id === 'stamp') TOPS_PUBFX.stamp('2×', 'Doubles next visit', 'drink'); else TOPS_PUBFX.test(id); }, id);
      for (const t of times) { const w = t - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w); await p.screenshot({ path: `${out}/${tag}_${id}_${vn}_${t}.png` }); }
      await p.waitForTimeout(2500);
      await p.evaluate(() => { const L = document.getElementById('pubFx'); if (L) L.innerHTML = ''; });
    }
    console.log(vn, 'errors:', errs.length ? errs.slice(0, 3) : 'none'); await p.close();
  }
  await b.close();
})();
