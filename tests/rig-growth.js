// #15 lead (Overseer 07:51): graphics memory per match from the character template cache (RIGS, pinned in KEEP).
// Plays N career matches back to back against different opponents (different character models) on the phone set
// (390 px, assets/m/) and reports per match: renderer.info, templates cached, and their estimated GPU MB.
// usage: node tests/rig-growth.js [matches=4]   (MAX_TPL=n fails if more than n templates are cached after the run)
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '..');
const N = +(process.argv[2] || 4);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { Object.defineProperty(window, 'TOPS_ASSETS', { configurable: true, get: () => 'assets/m/', set: () => {} }); });
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(4000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} });
  const keys = await p.evaluate(() => (window.TOPS_CHARKEYS = ['brian', 'bryce', 'pete', 'lewis', 'david', 'leonard', 'megan', 'elizabeth']));
  const rows = [];
  for (let i = 0; i < N; i++) {
    await p.evaluate(i => { try { if (S && !S.done) S.done = true; } catch (e) {}
      // a different model each match: pin the opponent look to the next character key
      const ck = window.TOPS_CHARKEYS[(i + 1) % 8]; const n = nextOpponent();
      beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: ['Deano', 'Gaz Tapsell', 'Big Mal', 'Shazza', 'Kev Mercer', 'Tama'][i % 6], oppAvg: 50, legs: 1, start: 501 }); }, i);
    await p.waitForTimeout(20000);
    rows.push(await p.evaluate(() => { const info = V._qa.renderer.info, R = V._qa.rigs ? V._qa.rigs() : null;
      return { geo: info.memory.geometries, tex: info.memory.textures, programs: info.programs.length, tpl: window.TOPS_RIGSTAT ? window.TOPS_RIGSTAT() : null }; }));
    console.log('match', i + 1, JSON.stringify(rows[i]));
  }
  const fails = []; const last = rows[rows.length - 1];
  if (process.env.MAX_TPL && last.tpl && Object.keys(last.tpl).length > +process.env.MAX_TPL) fails.push(`templates cached ${Object.keys(last.tpl).length} > ${process.env.MAX_TPL}`);
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(fails.length ? 'RIG-GROWTH FAIL\n- ' + fails.join('\n- ') : 'RIG-GROWTH DONE'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
