// EXP-UX phase 2: venue stills rendered from our own 3D rooms (no people: figures, crowd and sprites hidden).
// usage: node wip/style/stills/stills.js <gameDir> <tier> [tag]   -> wip/style/stills/t<tier>_<view>.png (1672x941)
// Starts a real career match at the tier, waits for the room, hides every person, then renders the scene through the
// game's own renderer from fixed camera framings (the game loop is paused while it renders).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const dir = process.argv[2], tier = +(process.argv[3] || 1), tag = process.argv[4] || '';
const out = path.resolve(__dirname); fs.mkdirSync(out, { recursive: true });
const W = 1672, H = 941;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: dir + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + dir + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await p.waitForFunction(() => typeof beginMatch === 'function' && typeof V !== 'undefined' && V._qa, null, { timeout: 180000 });
  await p.waitForTimeout(3000);
  await p.evaluate((tier) => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; try { V.walkOn = () => {}; } catch (e) {} newCareer();
    try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {}
    const n = nextOpponent(); beginMatch({ mode: 'career', tier, p0: 'Test', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); }, tier);
  if (tier <= 1) await p.waitForFunction(() => { let n = 0; V._qa.scene.traverse(o => { if (o.isMesh && /^bake_/.test(o.name)) n++; }); return n >= 5; }, null, { timeout: 90000, polling: 1000 }).catch(() => console.log('baked room not loaded'));
  await p.waitForTimeout(tier <= 1 ? 6000 : 12000);
  const views = await p.evaluate(({ W, H }) => {
    const T = THREE, sc = V._qa.scene, R = window.TOPS_R; const OZ = typeof OCHE_Z !== 'undefined' ? OCHE_Z : 2.37;
    // hide every person: anything with a skinned mesh (our rigs), sprites (crowd cut-outs) and meshes textured with the crowd atlas
    const hidden = [];
    const hide = o => { if (o.visible) { o.visible = false; hidden.push(o.name || o.type); } };
    sc.children.forEach(top => { let skin = false; top.traverse(o => { if (o.isSkinnedMesh) skin = true; }); if (skin) hide(top); });
    sc.traverse(o => { if (o.isSprite) hide(o); if (o.isMesh || o.isInstancedMesh) { const ms = [].concat(o.material || []); if (ms.some(m => m && m.map && m.map.image && /crowd/i.test(m.map.image.src || m.map.image.currentSrc || ''))) hide(o); } });
    sc.traverse(o => { if (o.isMesh && /dart|flight|shaft/i.test(o.name)) hide(o); });
    // stop the game drawing over our frames
    window.__stillPause = true; const f0 = V.frame; V.frame = function () { if (!window.__stillPause) return f0.apply(this, arguments); };
    const cam = new T.PerspectiveCamera(45, W / H, .05, 200);
    const size = new T.Vector2(); R.getSize(size); const pr = R.getPixelRatio();
    R.setPixelRatio(1); R.setSize(W, H, false);
    const shots = {
      // the room you're about to walk into: from behind the oche, a little to the side, board on the right third
      walkin: { pos: [1.15, 1.6, OZ + 4.2], look: [-.15, 1.45, 0], fov: 50 },
      // establishing shot used by the walk-on hold (3.4 m back, 0.6 m to the side)
      est: { pos: [.6, 1.55, OZ + 3.48], look: [0, 1.6, 0], fov: 52 },
      // wide, low and off-axis: more room, board small
      wide: { pos: [-1.6, 1.25, OZ + 5.2], look: [.4, 1.5, .2], fov: 58 },
    };
    const res = {};
    for (const [k, s] of Object.entries(shots)) { cam.position.set(...s.pos); cam.fov = s.fov; cam.updateProjectionMatrix(); cam.lookAt(new T.Vector3(...s.look)); R.render(sc, cam); res[k] = R.domElement.toDataURL('image/png'); }
    R.setPixelRatio(pr); R.setSize(size.x, size.y, false); window.__stillPause = false; V.frame = f0;
    return { res, hidden: hidden.length, hiddenNames: hidden.slice(0, 12) };
  }, { W, H });
  for (const [k, d] of Object.entries(views.res)) fs.writeFileSync(`${out}/t${tier}_${k}${tag}.png`, Buffer.from(d.split(',')[1], 'base64'));
  console.log(JSON.stringify({ tier, hidden: views.hidden, names: views.hiddenNames, errors: errs.slice(0, 3) }));
  await b.close();
})();
