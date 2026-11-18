// S3 money gate (Experience EXP-S3C 12:03): a whole Pub league night played as REAL matches (real throws through land(), the game's own
// end of match and after-match chain) pays exactly its prize: the bank is 60 - $5 entry after every won round, and 60 - 5 + the winner's
// prize when the final is won. No old career pay (appearance, win bonus, objectives, contracts, feats) on any round.
// usage: node tests/s3-event.js
const { chromium } = require('playwright'); const path = require('path'); const dir = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?s3=1'); await p.waitForTimeout(800); await p.evaluate(() => localStorage.clear());
  await p.goto('file://' + dir + '/index.html?s3=1'); await p.waitForFunction(() => typeof S !== 'undefined' && window.TOPS_S3 && V._qa && V._qa.rigReady && V._qa.rigReady(), null, { timeout: 180000 }); await p.waitForTimeout(1500);
  const r = { rounds: [] };
  r.start = await p.evaluate(() => { save.authSeen = true; save.name = 'Hayden'; save.lessonDone = true; save.totThrows = 500; $('login').hidden = true; newCareer(); persist(); const b = TOPS_S3.book('pub_night'); return { b, bank: career().bank, prizeW: TOPS_CIRCUIT.prizeFor(TOPS_CIRCUIT.eventOf('pub_night'), 'W') }; });
  for (let round = 0; round < 3; round++) {
    await p.evaluate(() => { TOPS_S3._playNow(); });
    await p.waitForFunction(() => typeof S !== 'undefined' && S && S.p && S.p[1] && !S.done, null, { timeout: 60000 });
    await p.evaluate(() => { V.walkOn = () => {}; });
    let st = ''; const t0 = Date.now();
    while (Date.now() - t0 < 160000) {
      st = await p.evaluate(() => { try { if (S.done) return 'done'; const it = document.getElementById('intro'); if (it && it.classList.contains('show')) it.click();
        if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(0, 0); } return 'bull'; }
        if (S.p[1].score < 200) S.p[1].score = 501;  /* the opponent never gets close: we win every round */
        if (S.cur === 0 && !S.busy && !S.p[0].ai && S.view !== 1) { S.p[0].score = 40; S.busy = true; land(0, -166); } return 'play'; } catch (e) { return 'ERR ' + e.message; } });
      if (st === 'done' || st.startsWith('ERR')) break; await p.waitForTimeout(100);
    }
    await p.waitForTimeout(2500);
    const m = await p.evaluate(() => ({ won: !!S.won, res: S.s3res || null, bank: career().bank, earned: S.earned || 0 }));
    let back = false;
    for (let i = 0; i < 60 && !back; i++) { await p.waitForTimeout(600);
      back = await p.evaluate(() => { const h = document.getElementById('hub'); if (h && !h.hidden && (typeof S === 'undefined' || !S)) return true;
        const ms = document.getElementById('msg'); if (ms && !ms.hidden) { const rb = document.querySelector('#msgReplies button'); if (rb) rb.click(); return false; }
        const later = document.querySelector('.tcpk__later'); if (later) { later.click(); return false; }
        for (const id of ['btnPerkLater', 'btnResultNext', 'c3rwGo']) { const e = document.getElementById(id); if (e && e.offsetParent) { e.click(); return false; } } return false; }).catch(() => false); }
    m.bankAfterChain = await p.evaluate(() => career().bank); m.st = st; r.rounds.push(m);
    if (!m.won || (m.res && m.res.done)) break;
  }
  r.end = await p.evaluate(() => ({ bank: career().bank, hist: career().circuit.history.length, titles: (career().circuit.titles || []).length }));
  console.log(JSON.stringify(r));
  const f = [], want = 60 - 5;
  if (!r.start.b.ok || r.start.bank !== want) f.push('booking ' + JSON.stringify(r.start));
  r.rounds.forEach((m, i) => { if (!m.won) f.push(`round ${i + 1} not won (${m.st})`);
    const fin = m.res && m.res.done; const exp = fin ? want + r.start.prizeW : want;
    if (m.bank !== exp || m.bankAfterChain !== exp) f.push(`round ${i + 1}: bank ${m.bank} at the result, ${m.bankAfterChain} after the after-match screens, want ${exp}`);
    if (!fin && m.earned) f.push(`round ${i + 1}: the result screen shows $${m.earned} earned on a round`); });
  if (r.rounds.length !== 3 || !(r.rounds[2].res && r.rounds[2].res.fin === 'W')) f.push('the event did not end with a win in round 3');
  if (r.end.bank !== want + r.start.prizeW) f.push(`end bank ${r.end.bank}, want ${want + r.start.prizeW}`);
  if (pe.length) f.push('page errors: ' + pe.slice(0, 3).join(' | '));
  console.log(f.length ? 's3-event FAIL: ' + f.join('; ') : `s3-event PASS: Pub night won in 3 real matches; bank 55 after each round, 55 + $${r.start.prizeW} prize = ${r.end.bank} at the end`); await b.close(); process.exit(f.length ? 1 : 0);
})();
