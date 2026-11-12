// Launch gate (improvements log #10, ChatGPT 9.0): one REAL career match with the rebrand on: real throws through land(), the game's
// own end of match, reward overlay, the new Result over it, Continue through the game's after-match chain (messages answered), back to Tonight.
// usage: node tests/rb-realmatch.js [dir]
const { chromium } = require('playwright'); const path = require('path');
const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('console', m => { if (/^rb /.test(m.text())) console.log('PAGE', m.text().slice(0, 400)); }); await p.addInitScript(() => { window.TOPS_RB_DEBUG = 1; });
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?rebrand=1'); await p.waitForFunction(() => window.TC_API && typeof S !== 'undefined' && window.C3 && V._qa && V._qa.rigReady && V._qa.rigReady(), null, { timeout: 180000 }); await p.waitForTimeout(1500);
  await p.evaluate(() => { save.authSeen = true; save.name = 'Hayden'; save.matches = 30; save.lessonDone = true; save.totThrows = 500; $('login').hidden = true; newCareer(); const c = career(); c.tier = 1; c.bank = 640; c.wins = 3; c.losses = 2; c.pts = 2400; c.darts = 150; c.stage = 'season'; c.next = null; newSeason(c); save.tcWelSeen = 1; save.tcIntro = Date.now(); persist(); showHub('play'); });
  await p.waitForTimeout(3000); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  const r = {}; r.tonight0 = await p.evaluate(() => !document.getElementById('rbApp').hidden);
  r.bank0 = await p.evaluate(() => career().bank); r.next = await p.evaluate(() => { const n = career().next || nextOpponent(); return { intro: !!n.intro, opp: n.oppName, legs: n.legs }; });
  // the real Walk on (new screen → the hub's own c3Go), then a short real match: shorten only the start score before the first dart
  await p.evaluate(() => { const g = document.getElementById('rbGo'); if (g) g.click(); });
  await p.waitForFunction(() => typeof S !== 'undefined' && S && S.p && S.p[1], null, { timeout: 60000 });
  r.walkon = await p.evaluate(() => document.getElementById('rbApp').hidden); r.s0 = await p.evaluate(() => ({ practice: !!S.practice, money: typeof S_money !== 'undefined' && !!S_money, local: !!S.local, legsNeeded: S.legs || S.firstTo, opp: S.p[1].name, arm: (document.getElementById('c3Go') || {}).dataset ? document.getElementById('c3Go').dataset.arm : null, bank: career().bank }));
  await p.evaluate(() => { V.walkOn = () => {}; S.p.forEach(q => { q.score = 121; }); });
  const t0 = Date.now(); let st = '';
  while (Date.now() - t0 < 160000) {
    st = await p.evaluate(() => { try { if (S.done) return 'done'; const it = document.getElementById('intro'); if (it && it.classList.contains('show')) { it.click(); }
      if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(0, 0); } return 'bull'; }
      if (S.cur === 0 && !S.busy && S.visit.length < 3 && !S.p[0].ai) { const me = S.p[0]; const t = targetPoint(aimFor(me.score, 4 - S.dart)); S.busy = true; land(t.x + gauss() * 2, t.y + gauss() * 2); } return 'play'; } catch (e) { return 'ERR ' + e.message; } });
    if (st === 'done' || st.startsWith('ERR')) break; await p.waitForTimeout(80);
  }
  r.end = st; r.m = await p.evaluate(() => ({ won: S.won, intro: !!S.intro, mode: S.mode || (typeof ui !== 'undefined' && ui.mode), local: !!S.local, legs: S.p.map(q => q.legs), after: S.after }));
  for (let i = 0; i < 40; i++) { if (await p.evaluate(() => { const a = document.getElementById('rbApp'); return a && !a.hidden && a.classList.contains('rb-resmode'); })) break; await p.waitForTimeout(500); }
  r.result = await p.evaluate(() => { const a = document.getElementById('rbApp'); return { on: !a.hidden && a.classList.contains('rb-resmode'), cash: (document.getElementById('rbRCash') || {}).textContent, lock: (document.querySelector('#rbApp .rb-lockup b') || {}).textContent, ov: !!document.getElementById('c3rw') && !document.getElementById('c3rw').hidden, bl: [...document.body.children].filter(n => { if (n.id === 'rbApp' || n.id === 'rbBack' || n.id === 'c3rw' || n.hidden) return false; const cs = getComputedStyle(n); return cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > .05 && (+cs.zIndex || 0) >= 50 && n.offsetWidth > 100; }).map(n => (n.id || n.className) + ':' + getComputedStyle(n).zIndex + ':' + getComputedStyle(n).pointerEvents) }; });
  r.bank1 = await p.evaluate(() => career().bank);
  await p.screenshot({ path: path.join(dir, 'tests/rb_real_result_390.png') });
  await p.evaluate(() => { const g = document.getElementById('rbRGo'); if (g) g.click(); });
  // walk the after-match chain the way a player does: answer any message, open/skip pack picks, continue screens, until Tonight shows
  let back = false;
  for (let i = 0; i < 60 && !back; i++) {
    await p.waitForTimeout(700);
    back = await p.evaluate(() => { const a = document.getElementById('rbApp'); if (a && !a.hidden && !a.classList.contains('rb-resmode') && document.getElementById('rbGo')) return true;
      const ms = document.getElementById('msg'); if (ms && !ms.hidden) { const rb = document.querySelector('#msgReplies button'); if (rb) rb.click(); return false; }
      const later = document.querySelector('.tcpk__later'); if (later) { later.click(); return false; }
      const x = document.querySelector('.tc-x'); if (x && x.offsetParent) { x.click(); return false; }
      for (const id of ['btnPerkLater', 'btnResultNext', 'c3rwGo']) { const e = document.getElementById(id); if (e && e.offsetParent) { e.click(); return false; } }
      return false; });
  }
  r.backToTonight = back; r.week = await p.evaluate(() => career().season && career().season.week);
  await p.screenshot({ path: path.join(dir, 'tests/rb_real_after_390.png') });
  r.errors = pe.slice(0, 3); console.log(JSON.stringify(r));
  const f = [];
  if (!r.tonight0) f.push('Tonight not shown'); if (!r.walkon) f.push('new screen not out of the way after Walk on'); if (r.end !== 'done') f.push('match did not finish: ' + r.end);
  if (!r.result.on || !r.result.ov) f.push('new Result not over the reward overlay'); { const shown = +String(r.result.cash || '').replace(/[^0-9]/g, '') * (/−/.test(r.result.cash || '') ? -1 : 1), want = r.bank1 - r.s0.bank; if (shown !== want) f.push(`cash shown ${r.result.cash} vs bank change since the match started ${want}`); }   // the entry is paid at Walk on; the Result shows what the match paid
  if (!r.backToTonight) f.push('never got back to Tonight'); if (pe.length) f.push('page errors');
  console.log(f.length ? 'rb-realmatch FAIL: ' + f.join('; ') : 'rb-realmatch PASS'); await b.close(); process.exit(f.length ? 1 : 0);
})();
