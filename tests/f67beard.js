// QA 05:13 (F6/F7): the mullet must not hide the beard. A career match with a bearded look and the mullet equipped;
// every attached beard mesh on the player's figure must still render. Fails on d43cfbc (mulletCrop hid every Ch*_hair mesh).
// usage: node tests/f67beard.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: +(process.env.VW || 390), height: process.env.VW == 360 ? 640 : 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); if (process.env.PHONE) { const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await p.addInitScript(() => { Object.defineProperty(window, 'TOPS_ASSETS', { configurable: true, get: () => 'assets/m/', set: () => {} }); }); }   /* rule 26: phone profile */
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(4000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer();
    save.look = Object.assign({}, save.look, { beard2: 1, hair2: 'short' }); TC_API.grant('wear_mullet'); TC_API.equip('wear_mullet'); persist();
    try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 2, p0: 'Test', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); });
  const res = await p.waitForFunction(() => { const out = { beards: 0, shown: 0, mullet: 0 };
    V._qa.scene.traverse(o => { if (o.name === 'wear_mullet') out.mullet++; if (o.isMesh && o.userData && o.userData.hairStyle === 'beard') { out.beards++; if (o.visible) out.shown++; } /* the mesh own flag is what mulletCrop sets; a whole figure can be hidden when off stage */ });
    return out.mullet && out.beards ? out : null; }, null, { timeout: 120000, polling: 1000 }).then(h => h.jsonValue()).catch(() => null);
  const fails = [];
  if (!res) fails.push('no figure with both the mullet and an attached beard appeared (check the look and the hair library loaded)');
  else if (res.shown < res.beards) fails.push(`beard hidden by the mullet: ${res.shown} of ${res.beards} beard meshes visible`);
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(JSON.stringify(res)); console.log(fails.length ? 'F67BEARD FAIL\n- ' + fails.join('\n- ') : 'F67BEARD PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
