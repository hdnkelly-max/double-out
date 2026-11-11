// Art (card effects): Pub rules effects sit on the board pane (phone and desktop), every effect fires without errors,
// and the Jukebox's "this visit" pill and tubes end with the visit. Fails on 1.94 (the layer was a fixed top 52% band:
// on desktop the Bouncer door covered half the board). usage: node tests/pubfx-pane.js
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fails = [];
  for (const vp of [{ width: 390, height: 844 }, { width: 360, height: 640 }, { width: 1280, height: 800 }]) {
    const p = await b.newPage({ viewport: vp }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (/pubfx/.test(m.text())) errs.push(m.text()); }); if (process.env.PHONE && vp.width < 700) { const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }   /* rule 26: phone profile */
    await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(4000);
    await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 0, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); });
    await p.waitForFunction(() => S && S.cur === 0 && !S.busy, null, { timeout: 90000, polling: 500 });
    const r = await p.evaluate(async () => { const out = {}; const ids = Object.keys(TOPS_PUBFX.FX); for (const id of ids) { try { TOPS_PUBFX.test(id); } catch (e) { out.err = (out.err || '') + id + ':' + e.message + ' '; } }
      TOPS_PUBFX.door(); TOPS_PUBFX.stamp('2×', 'x', 'drink'); TOPS_PUBFX.test('juke'); await new Promise(z => setTimeout(z, 600));
      const L = document.getElementById('pubFx').getBoundingClientRect(), B = V.lkRects().board; out.layer = [L.x, L.y, L.width, L.height].map(Math.round); out.board = [B.x, B.y, B.w, B.h].map(Math.round);
      out.pill = !!document.querySelector('#pubFx .pf-juke .pf-np'); out.on = document.body.classList.contains('pfx-juke');
      S.cur = 1; await new Promise(z => setTimeout(z, 900)); out.pillAfter = !!document.querySelector('#pubFx .pf-juke'); out.onAfter = document.body.classList.contains('pfx-juke'); S.cur = 0; return out; });
    const tag = vp.width + 'px';
    if (r.err) fails.push(`${tag}: effect threw: ${r.err}`);
    if (r.layer.some((v, i) => Math.abs(v - r.board[i]) > 1)) fails.push(`${tag}: effects layer ${r.layer} is not on the board pane ${r.board}`);
    if (!r.pill || !r.on) fails.push(`${tag}: Jukebox pill/state missing while the visit runs`);
    if (r.pillAfter || r.onAfter) fails.push(`${tag}: Jukebox still showing after the visit ended`);
    if (errs.length) fails.push(`${tag}: page errors: ${errs.slice(0, 3).join(' | ')}`);
    console.log(tag, JSON.stringify(r)); await p.close();
  }
  console.log(fails.length ? 'PUBFX-PANE FAIL\n- ' + fails.join('\n- ') : 'PUBFX-PANE PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
