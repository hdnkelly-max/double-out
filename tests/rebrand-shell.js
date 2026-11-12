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
      await p.click('#rbTabs [data-t="practice"]'); await p.waitForTimeout(800);
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
      // Shop: level 9, buy Neutron through the game's own shop row, then equip the Club Brass back; Littler is a sponsor set; Razor locked
      await p.evaluate(() => { C3.V3().lv = 9; career().bank = 640; persist(); });
      await p.click('#rbTabs [data-t="shop"]'); await p.waitForTimeout(500);
      r.shop = await p.evaluate(() => ({ visible: !document.getElementById('rbApp').hidden, thumbs: document.querySelectorAll('#rbApp .rb-th').length, n: BARRELS.length }));
      await p.click('#rbApp [data-bid="razor"]'); await p.waitForTimeout(300);
      r.shop.razor = await p.evaluate(() => (document.querySelector('#rbApp .rb-lock .rb-t2') || {}).textContent || '');
      await p.click('#rbApp [data-bid="littler"]'); await p.waitForTimeout(300);
      r.shop.littler = await p.evaluate(() => (document.querySelector('#rbApp .rb-lock .rb-t2') || {}).textContent || '');
      await p.click('#rbApp [data-bid="neutron"]'); await p.waitForTimeout(300);
      await p.screenshot({ path: path.join(dir, `tests/rb_shop_${W}.png`) });
      await p.click('#rbBuy'); await p.waitForTimeout(500);
      r.shop.buy = await p.evaluate(() => ({ bank: career().bank, owned: save.owned.includes('neutron'), eq: save.barrel, visible: !document.getElementById('rbApp').hidden, msg: (document.querySelector('#rbApp [role=status]') || {}).textContent || '' }));
      await p.click('#rbApp [data-bid="assassin"]'); await p.waitForTimeout(300); await p.click('#rbEquip'); await p.waitForTimeout(400);
      r.shop.back = await p.evaluate(() => ({ eq: save.barrel, bank: career().bank }));
      // Cards: two owned cards and one pick waiting; Open runs the game's own pack opening over the new screen
      await p.evaluate(() => { save.tcIntro = Date.now(); TC_API.grant('deano', 'test'); TC_API.grant('kauri', 'test'); TC_API.award('rbtest1', 'win', 'test'); });
      await p.click('#rbTabs [data-t="locker"]'); await p.waitForTimeout(300); await p.click('#rbApp [data-lk="cards"]'); await p.waitForTimeout(500);
      r.cards = await p.evaluate(() => ({ owned: document.querySelectorAll('#rbApp button.rb-cd').length, total: document.querySelectorAll('#rbApp .rb-cd').length, open: !!document.getElementById('rbOpen'), title: (document.querySelector('#rbApp .rb-t1') || {}).textContent }));
      await p.screenshot({ path: path.join(dir, `tests/rb_cards_${W}.png`) });
      await p.click('#rbOpen'); await p.waitForTimeout(1500);
      r.cards.pack = await p.evaluate(() => { const els = [...document.querySelectorAll('body > *')].filter(e => e.id !== 'rbApp' && getComputedStyle(e).position === 'fixed' && +getComputedStyle(e).zIndex >= 50 && e.offsetWidth > 200 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden'); return els.map(e => (e.id || e.className).toString().slice(0, 30)); });
      // Result: start a real match (beginMatch records bank/XP), fake the end state, then fire the game's own reward overlay
      await p.evaluate(() => { document.querySelectorAll('.tcpk').forEach(e => e.remove()); const c = career(); c.next = null; c.bank = 200; persist(); showHub('play'); });
      await p.waitForTimeout(800); await p.evaluate(() => { const g = document.getElementById('rbGo'); if (g) g.click(); });
      await p.waitForFunction(() => typeof S !== 'undefined' && S && S.p && S.p[1], null, { timeout: 60000 });
      r.result = await p.evaluate(() => { const c = career(), v = C3.V3(); S.won = true; S.p[0].legs = 2; S.p[1].legs = 1; S.p[0].pts = 900; S.p[0].darts = 54; S.p[1].pts = 700; S.p[1].darts = 54; S.after = 'next';
        c.bank += 55; const lv0 = v.lv; C3.gainLevels(v, C3.lvNeed(v.lv) + 20);
        C3.showRewardTest({ m: { won: true }, L: [['Win', 120]], ups: [], done: [], before: { lv: lv0, xp: 0, bank: c.bank - 55, fame: 0 }, after: {}, xp: 120, cash: 55, ranked: true });
        const app = document.getElementById('rbApp'); return { on: !app.hidden && app.classList.contains('rb-resmode'), z: getComputedStyle(app).zIndex, cash: (document.getElementById('rbRCash') || {}).textContent, lock: (document.querySelector('#rbApp .rb-lockup b') || {}).textContent, lvup: /Level up/.test(document.getElementById('rbMain').textContent), tabs: getComputedStyle(document.getElementById('rbTabs')).display }; });
      await p.waitForTimeout(1500); await p.screenshot({ path: path.join(dir, `tests/rb_result_${W}.png`) });
      await p.click('#rbRGo'); await p.waitForTimeout(1200);
      r.result.after = await p.evaluate(() => ({ ovHidden: document.getElementById('c3rw').hidden, resmode: document.getElementById('rbApp').classList.contains('rb-resmode') }));
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
  const SH = out['1'].shop || {}; if (!SH.visible || SH.thumbs !== SH.n || !/level 15/i.test(SH.razor || '') || !/sponsor/i.test(SH.littler || '') || !SH.buy || SH.buy.bank !== 595 || !SH.buy.owned || SH.buy.eq !== 'neutron' || !SH.buy.visible || !SH.back || SH.back.eq !== 'assassin' || SH.back.bank !== 595) fails.push('Shop: gates/buy/equip wrong');
  const CD = out['1'].cards || {}; if (CD.owned !== 2 || CD.total < 20 || !CD.open || !/picks? waiting/.test(CD.title || '') || !(CD.pack || []).length) fails.push('Cards: grid/open wrong');
  const RS = out['1'].result || {}; if (!RS.on || RS.z !== '95' || RS.cash !== '+$55' || RS.lock !== '2–1' || !RS.lvup || RS.tabs !== 'none' || !RS.after || !RS.after.ovHidden || RS.after.resmode) fails.push('Result: screen/continue wrong');
  const T = out['1'].stats || {}; if (T.tiles !== 4 || T.pts !== 4 || T.avg !== '48.0') fails.push('Stats: tiles/form wrong');
  if (!out['1'].season || out['1'].season.rows < 4 || !out['1'].season.me || out['1'].season.road !== 7) fails.push('Season: table/you/road missing');
  if (out['0'].errors.length || out['1'].errors.length) fails.push('page errors');
  console.log(JSON.stringify(out)); console.log(fails.length ? 'rebrand-shell FAIL: ' + fails.join('; ') : 'rebrand-shell PASS'); await b.close(); process.exit(fails.length ? 1 : 0);
})();
