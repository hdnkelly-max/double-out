// Kill switch `simpleFigures` + walk-on: code-built figures have no walk clip, so the player's walk-on must be the banner +
// equipped effect (the online opponent's no-3D path), never the 3D walk (an empty held stage or a sliding figure).
// Switch on: #tcOppWalk banner shows, no #tcWalk / body.tc-walking, banner gone by 4 s. Switch off: the 3D walk-on starts.
// usage: node tests/safe-walkon.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.TOPS_SAFE = { simpleFigures: true }; });
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(4000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; newCareer(); });
  const fails = [];
  const start = on => p.evaluate(on => { window.TOPS_SAFE = { simpleFigures: on }; try { sessionStorage.removeItem('tcWalkSeen'); } catch (e) {} try { if (S && !S.done) S.done = true; } catch (e) {}
    const n = nextOpponent(); beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); return S.cur; }, on);
  const state = () => p.evaluate(() => ({ banner: !!document.getElementById('tcOppWalk'), walk3d: !!document.getElementById('tcWalk'), walking: document.body.classList.contains('tc-walking') }));
  // 1: switch on
  const cur1 = await start(true); await p.waitForTimeout(1200); const a = await state(); await p.waitForTimeout(3600); const a2 = await state();
  console.log(JSON.stringify({ step: 'on', cur: cur1, at1s: a, at5s: a2 }));
  if (cur1 !== 0) fails.push('setup: opponent threw first (walk-on only runs when you throw first); rerun');
  else { if (!a.banner) fails.push('switch on: no banner walk-on'); if (a.walk3d || a.walking) fails.push('switch on: 3D walk-on started'); if (a2.banner || a2.walking) fails.push('switch on: banner still up at 5 s'); }
  // 2: switch off at the next match boundary
  const cur2 = await start(false); await p.waitForTimeout(1200); const c = await state();
  console.log(JSON.stringify({ step: 'off', cur: cur2, at1s: c }));
  if (cur2 === 0 && !(c.walk3d || c.walking)) fails.push('switch off: 3D walk-on did not start');
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 3).join(' | '));
  console.log(fails.length ? 'SAFE-WALKON FAIL\n- ' + fails.join('\n- ') : 'SAFE-WALKON PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
