// Q&D / Delivery QA (23:08): "Shop tab shows Tonight again on a new career". Cause: the game's portrait refresh
// (tops-avatars, every 2.5 s while character models load) re-runs showHub softly (__hubSoft) and the rebrand reopened Tonight.
// Checks: a soft refresh keeps the tab (Shop with its scroll, Season, Locker · Stats); an old screen opened from the new look (Setup & gear) stays.
// usage: node tests/rb-softhub.js [dir] [width] [height]
const { chromium } = require('playwright'); const path = require('path');
const dir = process.argv[2] || path.resolve(__dirname, '..'), W = +(process.argv[3] || 390), H = +(process.argv[4] || 844);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?rebrand=1'); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1500);
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); persist(); $('login').hidden = true; showHub('play'); });
  await p.waitForTimeout(2500);
  const tap = async sel => { const pt = await p.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); await p.touchscreen.tap(pt[0], pt[1]); await p.waitForTimeout(800); };
  const soft = () => p.evaluate(() => { document.dispatchEvent(new Event('tops-avatars')); });
  const st = () => p.evaluate(() => ({ tab: (document.querySelector('#rbTabs [aria-selected="true"]') || {}).dataset?.t, app: !document.getElementById('rbApp').hidden, lk: (document.querySelector('#rbApp [data-lk][aria-selected="true"]') || {}).dataset?.lk, y: (document.querySelector('#rbMain .rb-scr') || {}).scrollTop || 0 }));
  const out = {}, fail = [];
  await tap('#rbTabs [data-t="shop"]'); await p.evaluate(() => { document.querySelector('#rbMain .rb-scr').scrollTop = 1e5; }); const y0 = (await st()).y; await soft(); await p.waitForTimeout(600); out.shop = await st(); out.shop.y0 = y0; if (out.shop.tab !== 'shop' || !out.shop.app) fail.push('shop'); if (Math.abs(out.shop.y - y0) > 2) fail.push('shop scroll ' + y0 + '→' + out.shop.y);
  await tap('#rbTabs [data-t="season"]'); await soft(); await p.waitForTimeout(600); out.season = await st(); if (out.season.tab !== 'season') fail.push('season');
  await tap('#rbTabs [data-t="locker"]'); await tap('#rbApp [data-lk="stats"]'); await soft(); await p.waitForTimeout(600); out.locker = await st(); if (out.locker.tab !== 'locker' || out.locker.lk !== 'stats') fail.push('locker');
  await p.evaluate(() => { const b = [...document.querySelectorAll('#rbTabs [data-t="shop"]')][0]; b.click(); });
  await p.waitForTimeout(600); const old = await p.evaluate(() => { const b = [...document.querySelectorAll('#rbApp .rb-seg button')].find(x => /Setup/.test(x.textContent)); if (b) b.click(); return !!b; });
  await p.waitForTimeout(800); await soft(); await p.waitForTimeout(600); out.oldKit = { found: old, ...(await st()), cur: await p.evaluate(() => hubTab.cur) }; if (!old || out.oldKit.app) fail.push('old kit reopened by refresh');
  await p.evaluate(() => showHub('play')); await p.waitForTimeout(800); out.hubAgain = await st(); if (out.hubAgain.tab !== 'tonight' || !out.hubAgain.app) fail.push('real showHub → Tonight');
  if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out)); console.log(fail.length ? 'rb-softhub FAIL: ' + fail.join(', ') : 'rb-softhub PASS'); await b.close();
})();
