// S3 launch gate: one REAL Circuit match with ?s3=1 (real throws through land(), the game's own end of match, the after-match chain),
// then the Circuit state moved on correctly (and a won round pays nothing: only the event's prize does, Overseer 08:56): a win goes to the next round, a loss ends the event with that finish; no page errors.
// usage: node tests/s3-realmatch.js
const { chromium } = require('playwright'); const path = require('path');
const dir = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?s3=1'); await p.waitForTimeout(800); await p.evaluate(() => localStorage.clear());
  await p.goto('file://' + dir + '/index.html?s3=1'); await p.waitForFunction(() => typeof S !== 'undefined' && window.TOPS_S3 && V._qa && V._qa.rigReady && V._qa.rigReady(), null, { timeout: 180000 }); await p.waitForTimeout(1500);
  const r = {};
  r.start = await p.evaluate(() => { save.authSeen = true; save.name = 'Hayden'; save.lessonDone = true; save.totThrows = 500; $('login').hidden = true; newCareer(); persist(); const b = TOPS_S3.book('pub_night'); const ok = TOPS_S3._playNow(); return { b, ok, bank: career().bank, level: career().circuit.level }; });
  await p.waitForFunction(() => typeof S !== 'undefined' && S && S.p && S.p[1], null, { timeout: 60000 });
  r.s0 = await p.evaluate(() => ({ s3: S.s3, opp: S.p[1].name, oppAvg: S.p[1].avg, legs: S.bestOf }));
  await p.evaluate(() => { V.walkOn = () => {}; S.p.forEach(q => { q.score = 121; }); });
  const t0 = Date.now(); let st = '';
  while (Date.now() - t0 < 160000) {
    st = await p.evaluate(() => { try { if (S.done) return 'done'; const it = document.getElementById('intro'); if (it && it.classList.contains('show')) { it.click(); }
      if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(0, 0); } return 'bull'; }
      if (S.cur === 0 && !S.busy && S.visit.length < 3 && !S.p[0].ai) { const me = S.p[0]; const t = targetPoint(aimFor(me.score, 4 - S.dart)); S.busy = true; land(t.x + gauss() * 2, t.y + gauss() * 2); } return 'play'; } catch (e) { return 'ERR ' + e.message; } });
    if (st === 'done' || st.startsWith('ERR')) break; await p.waitForTimeout(80);
  }
  r.end = st; await p.waitForTimeout(2500);
  r.m = await p.evaluate(() => ({ won: !!S.won, res: S.s3res || null, live: career().circuit.live ? { round: career().circuit.live.round } : null, hist: career().circuit.history.length, bank: career().bank, btn: (document.getElementById('btnResAction') || {}).textContent || null }));
  let back = false;
  for (let i = 0; i < 60 && !back; i++) {
    await p.waitForTimeout(700);
    back = await p.evaluate(() => { const h = document.getElementById('hub'); if (h && !h.hidden && (typeof S === 'undefined' || !S)) return true;
      const ms = document.getElementById('msg'); if (ms && !ms.hidden) { const rb = document.querySelector('#msgReplies button'); if (rb) rb.click(); return false; }
      const later = document.querySelector('.tcpk__later'); if (later) { later.click(); return false; }
      const x = document.querySelector('.tc-x'); if (x && x.offsetParent) { x.click(); return false; }
      for (const id of ['btnPerkLater', 'btnResultNext', 'c3rwGo']) { const e = document.getElementById(id); if (e && e.offsetParent) { e.click(); return false; } }
      return false; }).catch(() => false);
  }
  r.back = back; r.after = await p.evaluate(() => ({ s3: TOPS_S3.on(), live: !!career().circuit.live, week: career().circuit.week, bank: career().bank, slot: localStorage.getItem('doubleout_s3') ? 1 : 0, s2: localStorage.getItem('doubleout2') })).catch(e => ({ err: String(e) }));
  await p.screenshot({ path: path.join(dir, 'tests/s3_real_after_390.png') });
  r.errors = pe.slice(0, 3); console.log(JSON.stringify(r));
  const f = [];
  if (!r.start.b.ok || !r.start.ok || r.start.bank !== 55) f.push('could not book and start ' + JSON.stringify(r.start));
  if (!r.s0.s3 || r.s0.s3.id !== 'pub_night') f.push('the match is not a Circuit match');
  if (r.end !== 'done') f.push('match did not finish: ' + r.end);
  if (r.m.won) { if (!r.m.res || !r.m.res.next || !r.m.live || r.m.live.round !== 1) f.push('a win did not move to the next round ' + JSON.stringify(r.m)); }
  else { if (!r.m.res || !r.m.res.done || r.m.res.fin !== 'QF' || r.m.live || r.m.hist !== 1) f.push('a loss did not end the event as a Quarter-final ' + JSON.stringify(r.m)); }
  if (r.m.won && r.m.bank !== 55) f.push('a won round paid money before the event ended (bank 55 -> ' + r.m.bank + '); only the Circuit prize pays in Season 3');
  if (!r.back) f.push('never got back to the hub'); if (r.after.s2) f.push('a Season 2 device save appeared');
  if (pe.length) f.push('page errors: ' + pe.slice(0, 3).join(' | '));
  console.log(f.length ? 's3-realmatch FAIL: ' + f.join('; ') : 's3-realmatch PASS (' + (r.m.won ? 'won, on to round 2' : 'lost, Quarter-final') + ', button "' + r.m.btn + '")'); await b.close(); process.exit(f.length ? 1 : 0);
})();
