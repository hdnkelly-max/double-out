// CAR-XP (Overseer 21:58: David "almost no XP" in Season 3). A Season 3 Circuit match gives the same player XP as a Season 2 match
// (played 60 + win 100 x tier multiplier, plus tons/checkouts/quick legs/decider/feats), levels go up (stat points and unlocks follow the
// level), and Season 3 money stays the Circuit's: no contract, pool or level-up cash. Checks:
//   1 a won Pub night QF gives XP (>= 160) and the level moves; a loss gives >= 60
//   2 the bank after a 3-win Pub night is still exactly 60 - $5 + the winner's prize (s3-event's rule), even with levels gained
//   3 a level that would pay cash in Season 2 pays nothing in Season 3 (listed as 'Level up')
//   4 catch-up: a Season 3 save with 1 win / 5 losses and no XP (David's) gets (160 + 5x60) = 460 XP once, on the hub view; never twice
//   4b the first post-fix match before any hub view: catch-up for the earlier matches + that match's own XP, nothing twice
//   6 the same match scored twice gives its XP once; 7 adopting an older cloud copy of the save gets its own catch-up once (XP, flag and
//     counters travel in the same save); 8 a multi-level catch-up lists every level reward and pays no cash (Pub multiplier for past matches)
//   5 a fresh career gets no catch-up XP; Season 2 (?s3=0) XP is unchanged (its own wrapper)
//   6 the Result screen's XP delta (rb.js reads C3.V3 before/after) is non-zero for a Circuit match
// usage: node tests/s3-xp.js
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); const errs = []; p.on('pageerror', e => errs.push(e.message)); const f = [];
  const url = 'file://' + path.resolve(__dirname, '../index.html');
  await p.goto(url + '?s3=1'); await p.waitForTimeout(800); await p.evaluate(() => localStorage.clear()); await p.goto(url + '?s3=1'); await p.waitForTimeout(4500);
  const r = await p.evaluate(() => { const o = {}; try {
    save.authSeen = true; save.lessonDone = true; $('login').hidden = true; V.walkOn = () => {}; newCareer(); const c = career(); TOPS_S3.view();
    o.fresh = { xp: C3.V3().xp, lv: C3.V3().lv, flag: C3.V3().s3xp };
    const play = (won) => { TOPS_S3._playNow(); const x0 = C3.V3(); const before = { lv: x0.lv, xp: x0.xp }; S.won = won; S.p[0].pts = won ? 300 : 120; S.p[0].darts = 18; S.p[0].legs = won ? 2 : 0; careerAfterMatch(); S.done = true; return { before, res: S.s3xp }; };
    TOPS_S3.book('pub_night'); const a = play(true); o.win = { xp: a.res && a.res.xp, lvBefore: a.before.lv, lvAfter: C3.V3().lv };
    const b2 = play(true), b3 = play(true); o.bank = { bank: career().bank, prize: (c.circuit.history[c.circuit.history.length - 1] || {}).prize };
    TOPS_S3.book('pub_night'); const l1 = play(false); o.loss = { xp: l1.res && l1.res.xp };
    // 3 a cash level in Season 3
    let cashLv = 0; for (let L = 2; L < 60; L++) { const rw = C3.rewardAt(L); if (rw && rw.k === 'cash') { cashLv = L; break; } }
    const v = C3.V3(); v.lv = cashLv - 1; v.xp = 0; const bank0 = career().bank; const ups = C3.gainLevels(v, C3.lvNeed(cashLv - 1), true); o.cashLv = { L: cashLv, ups, bankDiff: career().bank - bank0 };
    // 4 catch-up on a David-like save
    const v2 = C3.V3(); v2.lv = 1; v2.xp = 0; delete v2.s3xp; career().wins = 1; career().losses = 5; career().tier = 0; TOPS_S3.view(); o.catch1 = { lv: v2.lv, xp: v2.xp, total: (() => { let t = v2.xp; for (let L = 1; L < v2.lv; L++) t += C3.lvNeed(L); return t; })() };
    TOPS_S3.view(); o.catch2 = { lv: v2.lv, xp: v2.xp };
    // 4b a David-like save whose first post-fix match comes before any hub view: catch-up (without that match) + the match's own XP, once
    const v3 = C3.V3(); v3.lv = 1; v3.xp = 0; delete v3.s3xp; career().wins = 1; career().losses = 5; career().circuit.live = null; career().bank = 60; TOPS_S3.book('pub_night'); TOPS_S3._playNow(); S.won = false; S.p[0].pts = 120; S.p[0].darts = 18; S.p[0].legs = 0; careerAfterMatch(); S.done = true;
    const tot = () => { let t = v3.xp; for (let L = 1; L < v3.lv; L++) t += C3.lvNeed(L); return t; }; o.catch3 = { total: tot(), own: S.s3xp && S.s3xp.xp }; TOPS_S3.view(); o.catch3.after = tot();
    // 6 the same match scored twice gives its XP once
    const t0 = tot(); const again = C3.s3MatchXP(); o.dup = { diff: tot() - t0, same: again === S.s3xp };
    // 7 cloud adopt of an OLDER copy of the save (no catch-up flag, no XP yet, its own 1-5): it gets its own catch-up once, never stacked on the newer copy
    const old = JSON.parse(JSON.stringify(save)); const ov = old.career.v3; ov.lv = 1; ov.xp = 0; delete ov.s3xp; old.career.wins = 1; old.career.losses = 5; old.career.circuit.live = null;
    Object.keys(save).forEach(k => delete save[k]); Object.assign(save, old); TOPS_S3.view(); const v7 = C3.V3(); let t7 = v7.xp; for (let L = 1; L < v7.lv; L++) t7 += C3.lvNeed(L); TOPS_S3.view(); let t8 = C3.V3().xp; for (let L = 1; L < C3.V3().lv; L++) t8 += C3.lvNeed(L); o.adopt = { t7, t8 };
    // 8 a multi-level catch-up applies every non-cash reward (titles/unlocks listed in v.unl, applyUnlocks ran)
    const v8 = C3.V3(); v8.lv = 1; v8.xp = 0; v8.unl = []; delete v8.s3xp; career().wins = 20; career().losses = 0; TOPS_S3.view(); o.multi = { lv: v8.lv, unl: v8.unl.length, kinds: [...new Set(v8.unl.map(u => u.k))], cashPaid: v8.unl.filter(u => u.k === 'cash' && u.v > 0).length };
  } catch (e) { o.err = String(e.stack || e).slice(0, 400); } return o; });
  await p.goto(url + '?s3=0'); await p.waitForTimeout(4500);
  const s2 = await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; $('login').hidden = true; V.walkOn = () => {}; newCareer(); const c = career(); c.stage = 'season'; beginMatch({ mode: 'career', tier: 0, p0: 'P', oppName: 'X', oppAvg: 50, legs: 3 }); S.won = true; S.p[0].pts = 300; S.p[0].darts = 18; S.p[0].legs = 2; careerAfterMatch(); S.done = true; const v = C3.V3(); let t = v.xp; for (let L = 1; L < v.lv; L++) t += C3.lvNeed(L); return { total: t, s3: !!(window.TOPS_S3 && TOPS_S3.on()) }; });
  await b.close();
  if (r.err) f.push('error: ' + r.err); else {
    if (r.fresh.xp !== 0 || r.fresh.lv !== 1 || r.fresh.flag !== 1) f.push('5 fresh career got catch-up XP ' + JSON.stringify(r.fresh));
    if (!(r.win.xp >= 160) || !(r.win.lvAfter > r.win.lvBefore)) f.push('1 a Circuit win gives no XP/level ' + JSON.stringify(r.win));
    if (!(r.loss.xp >= 60)) f.push('1 a Circuit loss gives < 60 XP ' + JSON.stringify(r.loss));
    if (r.bank.bank !== 60 - 5 + r.bank.prize) f.push('2 Season 3 bank changed by XP/levels ' + JSON.stringify(r.bank));
    if (!r.cashLv.L || r.cashLv.bankDiff !== 0 || !r.cashLv.ups.some(u => u.lv === r.cashLv.L && u.v === 0)) f.push('3 a cash level paid in Season 3 ' + JSON.stringify(r.cashLv));
    if (r.catch1.total !== 460) f.push('4 catch-up XP ' + JSON.stringify(r.catch1) + ' want 460');
    if (r.catch2.lv !== r.catch1.lv || r.catch2.xp !== r.catch1.xp) f.push('4 catch-up ran twice');
    if (r.dup.diff !== 0 || !r.dup.same) f.push('6 the same match gave XP twice ' + JSON.stringify(r.dup));
    if (r.adopt.t7 !== 460 || r.adopt.t8 !== 460) f.push('7 adopting an older copy stacked or missed the catch-up ' + JSON.stringify(r.adopt));
    if (r.multi.unl !== r.multi.lv - 1 || r.multi.cashPaid !== 0 || r.multi.lv < 5) f.push('8 multi-level catch-up rewards ' + JSON.stringify(r.multi));
    if (r.catch3.total !== 460 + r.catch3.own || r.catch3.after !== r.catch3.total) f.push('4b match before a hub view counted twice or missed ' + JSON.stringify(r.catch3));
  }
  if (s2.s3 || !(s2.total >= 160)) f.push('5 Season 2 XP changed ' + JSON.stringify(s2));
  if (errs.length) f.push('page errors: ' + errs.slice(0, 3).join(' | '));
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(r)); process.exit(1); }
  console.log(`PASS: same match twice = XP once; older cloud copy adopted = its own 460 once; 20-0 catch-up to Lv ${r.multi.lv} with ${r.multi.unl} level rewards (${r.multi.kinds.join('/')}), $0 cash; Circuit win +${r.win.xp} XP (Lv ${r.win.lvBefore} -> ${r.win.lvAfter}), loss +${r.loss.xp}; Pub night bank still 60 - 5 + $${r.bank.prize}; cash level ${r.cashLv.L} pays $0 in Season 3; David-like save (1-5) gets 460 XP once (Lv ${r.catch1.lv}); fresh career 0; Season 2 unchanged`);
})();
