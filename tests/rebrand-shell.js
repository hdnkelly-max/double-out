// EXP-REBRAND shell check: off = nothing installed; on = new Tonight on the career hub from the real save; Walk on starts the real match
// and the new screen gets out of the way; the hub comes back after the match. usage: node tests/rebrand-shell.js [dir] [W] [H]
const { chromium } = require('playwright'); const path = require('path');
const dir = process.argv[2] || path.resolve(__dirname, '..'), W = +(process.argv[3] || 390), H = +(process.argv[4] || 844);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const out = {}, fails = [];
  for (const mode of ['0', '1']) {
    const p = await b.newPage({ viewport: { width: W, height: H } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.goto('file://' + dir + '/index.html?rebrand=' + mode); await p.waitForFunction(() => window.TC_API && typeof S !== 'undefined' && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1500);
    await p.evaluate(() => { save.authSeen = true; save.name = 'Hayden'; save.matches = 30; $('login').hidden = true; newCareer(); const c = career(); c.tier = 1; c.bank = 640; persist(); showHub('play'); });
    await p.waitForTimeout(3500);
    await p.evaluate(() => { try { const t = TC_API.st(); delete t.welPend; } catch (e) {} document.querySelectorAll('.tc-sheet').forEach(e => e.remove()); });
    const r = await p.evaluate(() => ({ flag: window.TOPS_REBRAND, app: !!document.getElementById('rbApp'), shown: !!(document.getElementById('rbApp') && !document.getElementById('rbApp').hidden), opp: (document.querySelector('#rbApp .rb-big') || {}).textContent || '', go: !!document.getElementById('rbGo'), bank: (document.getElementById('rbBank') || {}).textContent || '' }));
    await p.screenshot({ path: path.join(dir, `tests/rb_tonight_${mode}_${W}.png`) });
    if (mode === '1') {
      // Walk on through the real path
      await p.click('#rbGo'); await p.waitForTimeout(400); const armed = await p.evaluate(() => !!(document.getElementById('c3Go') || {}).dataset && !!document.getElementById('c3Go').dataset.arm); if (armed) await p.click('#rbGo');
      await p.waitForTimeout(3000);
      r.match = await p.evaluate(() => ({ S: !!(typeof S !== 'undefined' && S && !S.done), rbHidden: document.getElementById('rbApp').hidden }));
      // tabs: Shop falls back to the old screen, New look returns
      await p.evaluate(() => { S && (S.done = true); showHub('play'); }); await p.waitForTimeout(1500);
      await p.click('#rbTabs [data-t="shop"]'); await p.waitForTimeout(800);
      r.shopOld = await p.evaluate(() => ({ rbHidden: document.getElementById('rbApp').hidden, back: !document.getElementById('rbBack').hidden }));
      await p.click('#rbBack'); await p.waitForTimeout(500); r.backOk = await p.evaluate(() => !document.getElementById('rbApp').hidden);
      await p.evaluate(() => { const c = career(); c.next = null; if (!c.season) newSeason(c); persist(); TOPS_RB.render(); });
      await p.click('#rbTabs [data-t="season"]'); await p.waitForTimeout(500);
      r.season = await p.evaluate(() => ({ rows: document.querySelectorAll('#rbApp .rb-tr').length, me: !!document.querySelector('#rbApp .rb-tr.rb-me'), road: document.querySelectorAll('#rbApp .rb-road .rb-st').length }));
      await p.screenshot({ path: require('path').join(dir, `tests/rb_season_${W}.png`) });
      // Locker: level, stats with points to spend (spent through the game's own TOPS_spend), kit; Stats sub-tab
      await p.evaluate(() => { const c = career(); c.wins = 3; c.losses = 2; c.pts = 2400; c.darts = 150; c.tierAvgs = [41.2, 45.8, 39.9, 48.3]; c.best = { avg: 52.1, hf: 88, leg: 21, visit: 140 }; TOPS_st(); if (!save.st2) TOPS_ST2_API.spend && 0; persist(); });
      await p.evaluate(() => { if (!save.st2) { try { TOPS_spend('sc'); } catch (e) {} } save.st2.bank = 2; persist(); });
      await p.click('#rbTabs [data-t="locker"]'); await p.waitForTimeout(600);
      r.locker = await p.evaluate(() => ({ stats: document.querySelectorAll('#rbApp .rb-stt').length, plus: [...document.querySelectorAll('#rbApp .rb-plus')].filter(b => !b.disabled).length, kit: document.querySelectorAll('#rbApp .rb-g2 .rb-card').length, ring: !!document.querySelector('#rbApp .rb-ring svg'), sc0: save.st2.v.sc, bank0: save.st2.bank }));
      await p.screenshot({ path: path.join(dir, `tests/rb_locker_${W}.png`), fullPage: false });
      await p.click('#rbApp [data-st="sc"]'); await p.waitForTimeout(300);
      r.locker.after = await p.evaluate(() => ({ sc: save.st2.v.sc, bank: save.st2.bank, chip: (document.querySelector('#rbApp .rb-chip.rb-g') || {}).textContent || '' }));
      await p.click('#rbApp [data-lk="stats"]'); await p.waitForTimeout(400);
      r.stats = await p.evaluate(() => ({ tiles: document.querySelectorAll('#rbApp .rb-tl').length, pts: document.querySelectorAll('#rbMain svg[role=img] circle').length, avg: (document.querySelector('#rbApp .rb-tl b') || {}).textContent }));
      await p.screenshot({ path: path.join(dir, `tests/rb_stats_${W}.png`) });
      r.hscroll = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    }
    r.errors = pe.slice(0, 3); out[mode] = r; await p.close();
  }
  if (out['0'].flag !== false || out['0'].app) fails.push('switch off but rebrand installed');
  if (!out['1'].shown || !out['1'].go) fails.push('switch on but the new Tonight did not show');
  if (out['1'].match && (!out['1'].match.S || !out['1'].match.rbHidden)) fails.push('Walk on did not start the real match / new screen stayed up');
  if (out['1'].shopOld && (!out['1'].shopOld.rbHidden || !out['1'].shopOld.back)) fails.push('Shop tab did not fall back to the old screen with a way back');
  if (!out['1'].backOk) fails.push('New look button did not return');
  const L = out['1'].locker || {}; if (L.stats !== 5 || L.plus < 1 || L.kit !== 2 || !L.ring || !L.after || L.after.sc <= L.sc0 || L.after.bank !== L.bank0 - 1) fails.push('Locker: stats/spend/kit wrong');
  const T = out['1'].stats || {}; if (T.tiles !== 4 || T.pts !== 4 || T.avg !== '48.0') fails.push('Stats: tiles/form wrong');
  if (!out['1'].season || out['1'].season.rows < 4 || !out['1'].season.me || out['1'].season.road !== 7) fails.push('Season: table/you/road missing');
  if (out['0'].errors.length || out['1'].errors.length) fails.push('page errors');
  console.log(JSON.stringify(out)); console.log(fails.length ? 'rebrand-shell FAIL: ' + fails.join('; ') : 'rebrand-shell PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
