// Kill switch `venueFx` (Process V2 §7, Art): with TOPS_SAFE.venueFx the Club has no light-pool shader program and no
// extra warm light; switched off at the next match boundary both come back, and on again they go, without the program
// count growing. Three Club matches: on -> off -> on. Prints one line per match (checkpoints). usage: node tests/safe-venuefx.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.TOPS_SAFE = { venueFx: true }; });
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(4000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} });
  const fails = [], rows = [];
  for (const [i, on] of [[1, true], [2, false], [3, true]]) {
    await p.evaluate(on => { window.TOPS_SAFE = { venueFx: on }; try { if (S && !S.done) S.done = true; } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); }, on);
    await p.waitForFunction(() => { let n = 0; V._qa.scene.traverse(o => { if (o.isMesh && /^bake_/.test(o.name)) n++; }); return n >= 5; }, null, { timeout: 120000, polling: 1000 });
    await p.waitForTimeout(4000);
    const r = await p.evaluate(() => { let pl = 0; V._qa.scene.traverse(o => { if (o.isPointLight && Math.abs(o.distance - 3.6) < 1e-6) pl++; });
      const R = V._qa.renderer, progs = R.info.programs; let inUse = false, vfx = 0, obc = 0, keys = {}; V._qa.scene.traverse(o => { const m = o.isMesh && o.material; if (!m || !m.userData.vfx) return; vfx++; if (m.onBeforeCompile === m.userData.vfx.obc) obc++; const P = R.properties.get(m), pr = P.currentProgram || P.program; const k = pr ? (/topsVenue\d*/.exec(pr.cacheKey) || ['plain'])[0] : 'none'; keys[k] = (keys[k] || 0) + 1; if (/topsVenue/.test(k)) inUse = true; });
      /* the program each baked material is drawn with now (renderer.info.programs keeps released programs a while) */
      return { venueProg: inUse, light: pl, programs: progs.length, vfx, obc, keys }; });
    r.match = i; r.switchOn = on; rows.push(r); console.log(JSON.stringify(r));
    if (on && (r.venueProg || r.light)) fails.push(`match ${i}: switch on but shader ${r.venueProg} / light ${r.light}`);
    if (!on && (!r.venueProg || !r.light)) fails.push(`match ${i}: switch off but shader ${r.venueProg} / light ${r.light}`);
  }
  if (rows[2].programs > rows[1].programs + 2) fails.push(`programs grew on/off/on: ${rows.map(r => r.programs).join(' -> ')}`);
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(fails.length ? 'SAFE-VENUEFX FAIL\n- ' + fails.join('\n- ') : 'SAFE-VENUEFX PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
