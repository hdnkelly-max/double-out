// v3 switch-on: the creator's PLAYER row uses the v3 head cards (s3/assets/creator/head_v3_<id>.png) when ?v3=1 and the card is in the build
// (have.json); a base without a v3 card keeps its painted card (never the live 3D bust, the white-bust bug); with v3 off the row is unchanged.
// The build's file list is stubbed per case (TOPS_S3_HAVE gains the v3 paths), so this runs before the art lands. usage: node tests/s3-v3heads.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const run = async (v3, extra) => { const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.addInitScript(extra => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} let v; Object.defineProperty(window, 'TOPS_S3_HAVE', { configurable: true, get: () => v, set: x => { v = (x || []).concat(extra); } }); }, extra);
    await p.goto('file://' + dir + '/index.html?s3=1&v3=' + v3, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(() => { $('login').hidden = true; save.authSeen = true; persist(); showTitle(); }); await p.waitForTimeout(1000); await p.locator('#btnNewCareer').click(); await p.waitForTimeout(3000);
    const r = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('#s3Cre [data-pt]')].map(i => [i.dataset.pt, (i.querySelector('img') || {}).getAttribute ? i.querySelector('img').getAttribute('src').replace(/\?v=.*/, '') : (i.innerHTML ? 'other' : 'empty')])));
    // a refresh (picking another base) keeps the right set
    await p.evaluate(() => { const t = document.querySelector('#s3Cre [data-f="base"][data-v="tama"]'); if (t) t.click(); }); await p.waitForTimeout(1200);
    const r2 = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('#s3Cre [data-pt]')].map(i => [i.dataset.pt, i.querySelector('img') ? i.querySelector('img').getAttribute('src').replace(/\?v=.*/, '') : 'none'])));
    if (pe.length) fail.push('v3=' + v3 + ' page errors ' + pe.join('; ').slice(0, 160)); await p.close(); return { r, r2 }; };
  const IDS = ['kai', 'ray', 'tama', 'mia', 'dazza'], V3 = IDS.slice(0, 3).map(id => 'assets/creator/head_v3_' + id + '.png');
  out.on = await run('1', V3); out.off = await run('0', V3); out.none = await run('1', []);
  for (const [k, want] of [['on', id => V3.includes('assets/creator/head_v3_' + id + '.png') ? 's3/assets/creator/head_v3_' + id + '.png' : 's3/assets/creator/head_' + id + '.png'], ['off', id => 's3/assets/creator/head_' + id + '.png'], ['none', id => 's3/assets/creator/head_' + id + '.png']])
    for (const st of ['r', 'r2']) IDS.forEach(id => { if (out[k][st][id] !== want(id)) fail.push(k + ' ' + st + ' ' + id + ': ' + out[k][st][id] + ' want ' + want(id)); });
  console.log(JSON.stringify(out).slice(0, 900)); console.log(fail.length ? 's3-v3heads FAIL: ' + fail.join('; ') : 's3-v3heads PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
