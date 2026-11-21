// CAR-DEADWK (Producer 13:40, 20 Nov): Season 3 never stops on a week with nothing on, and being broke is never a dead end.
//   1b every week rest lands on (and every week with an event) books; Palace arrivals at weeks 106/157/200; after losing a Worlds
//   1 every level from every start week (1..120) reaches a bookable event in ONE action: rest() when nothing is on (all the empty weeks at
//     once, Palace week 17 -> 52), and nothing changes when something is on (Pub/Club/DPNZ/Trans-Tasman weeks never move by rest)
//   2 a saved career parked on an empty Opens week (made the way 4.13 saved it, then a page reload) loads into the rest state and moves on
//   3 broke at the DPNZ Tour with an advance still owed: a recovery entry books the cheapest event with no cash, the debt grows by its cost,
//     a loss leaves it available again (no new dead end), a win repays half the prize; you can't use it when you can afford an event
//   4 the hub's Play (playNext; the un-gated launcher, as ENG-RESET runs it on the fresh page) on an empty week jumps to the next event and books it; when broke it uses the recovery entry
//   5 the Circuit screen: a Rest week card with "Advance to next event" that works by touch; the broke card offers the recovery entry
//   6 money, points and XP of a normal event are unchanged (s3-event / s3-xp cover them; here: a Pub night pays exactly as before)
// usage: node tests/s3-rest.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} });
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); const f = []; const url = 'file://' + path.join(dir, 'index.html') + '?s3=1';
  await p.goto(url); await p.waitForTimeout(800); await p.evaluate(() => localStorage.clear()); await p.goto(url); await p.waitForTimeout(4500);
  const r = await p.evaluate(() => { const o = {}; try {
    save.authSeen = true; save.lessonDone = true; $('login').hidden = true; V.walkOn = () => {}; window.showMsg = (m, cb) => { try { cb && cb('ok'); } catch (e) {} };
    newCareer(); const c = career(), k = c.circuit, E = TOPS_CIRCUIT;
    // 1 every level x start week
    o.grid = []; for (let lv = 0; lv <= 6; lv++) for (let w = 1; w <= 120; w++) { k.level = lv; k.week = w; k.live = null; c.bank = 999999; const v0 = TOPS_S3.view(); const had = v0.calendar.length;
      let acted = 0; if (!had) { const rr = TOPS_S3.rest(); acted = 1; if (!rr || !rr.ok) { o.grid.push({ lv, w, fail: rr }); continue; } }
      else { const rr = TOPS_S3.rest(); if (rr && rr.ok) o.grid.push({ lv, w, movedWhileOn: rr }); }
      const v1 = TOPS_S3.view(); if (!v1.calendar.length) o.grid.push({ lv, w, stillEmpty: v1.week }); if (had && v1.week !== w) o.grid.push({ lv, w, weekChanged: v1.week }); }
    // every week a rest lands on (and every week with an event) can actually be booked: calendar() is the eligibility gate
    o.book = []; for (let lv = 0; lv <= 6; lv++) for (let w = 1; w <= 120; w++) { k.level = lv; k.week = w; k.live = null; c.bank = 999999; if (TOPS_S3.view().rest) TOPS_S3.rest(); const ev = TOPS_S3.view().calendar[0]; const bk = ev && TOPS_S3.book(ev.id); if (!bk || !bk.ok) o.book.push({ lv, w, ev: ev && ev.id, bk }); k.live = null; }
    k.level = 6; k.week = 17; k.live = null; o.palace = TOPS_S3.rest(); // before any Worlds is in the history (no time travel)
    // Palace arrivals late in the cycle and after a Worlds was already played
    o.palaceLate = [106, 157, 200].map(w => { k.level = 6; k.week = w; k.live = null; const rr = TOPS_S3.view().rest ? TOPS_S3.rest() : { ok: true, to: w }; return { w, to: rr.to, ok: rr.ok }; });
    k.level = 6; k.week = 52; k.live = null; c.bank = 999999; TOPS_S3.book('worlds'); TOPS_S3._playNow(); S.won = false; S.p[0].legs = 0; S.p[0].darts = 30; S.p[0].pts = 300; careerAfterMatch(); S.done = true; o.afterWorlds = { week: k.week, rest: TOPS_S3.view().rest, r: TOPS_S3.rest(), cal: TOPS_S3.view().calendar.map(e => e.id) };
    // 3 broke at DPNZ with an advance owed
    k.level = 3; k.week = 5; k.live = null; c.bank = 50; k.debt = 120; o.adv = TOPS_S3.advance(); const v = TOPS_S3.view(); o.offer = v.recover;
    const b0 = c.bank; o.rec = TOPS_S3.recover(); o.bankAfterRec = c.bank - b0; o.debt1 = k.debt; o.live = !!k.live;
    TOPS_S3._playNow(); S.won = false; S.p[0].legs = 0; S.p[0].darts = 30; S.p[0].pts = 300; careerAfterMatch(); S.done = true; o.afterLoss = { live: !!k.live, offer: TOPS_S3.view().recover, debt: k.debt };
    o.rec2 = TOPS_S3.recover(); TOPS_S3._playNow(); S.won = true; S.p[0].legs = 3; S.p[0].darts = 45; S.p[0].pts = 900; careerAfterMatch(); S.done = true;
    let guard = 0; while (k.live && guard++ < 8) { TOPS_S3._playNow(); S.won = true; S.p[0].legs = 3; S.p[0].darts = 45; S.p[0].pts = 900; careerAfterMatch(); S.done = true; }
    const last = k.history[k.history.length - 1]; o.win = { prize: last.prize, debtBefore: o.afterLoss.debt + o.rec2.cost, debtAfter: k.debt, bank: c.bank };
    c.bank = 99999; k.live = null; o.notBroke = TOPS_S3.recover();
    // 4 hub Play on an empty week, and broke
    k.level = 2; k.week = 2; k.live = null; c.bank = 5000; (playNext.__rsw || playNext)(); o.pn = { week: k.week, live: k.live && k.live.id };
    k.live = null; S.done = true; k.level = 3; k.week = 9; c.bank = 10; k.debt = 50; (playNext.__rsw || playNext)(); o.pnBroke = { live: k.live && k.live.id, recovery: !!(k.live && k.live.recovery), bank: c.bank };
    // 6 a Pub night pays as before
    k.live = null; k.level = 0; k.week = 3; k.debt = 0; c.bank = 60; TOPS_S3.book('pub_night'); for (let i = 0; i < 3; i++) { TOPS_S3._playNow(); S.won = true; S.p[0].legs = 2; S.p[0].darts = 36; S.p[0].pts = 600; careerAfterMatch(); S.done = true; }
    o.pub = { bank: c.bank, prize: k.history[k.history.length - 1].prize, week: k.week };
    // 2 (part 1) park a career on an empty Opens week and save it
    k.live = null; k.level = 2; k.week = 5; c.bank = 900; k.debt = 0; persist();
  } catch (e) { o.err = String(e.stack || e).slice(0, 400); } return o; });
  // 2 (part 2) reload: the parked save loads into the rest state
  await p.goto(url); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TC_API, null, { timeout: 120000 }); await p.waitForTimeout(1500);
  const r2 = await p.evaluate(() => { const v = TOPS_S3.view(); return { week: v.week, level: v.level.i, rest: v.rest, cal: v.calendar.length }; });
  // 5 the Circuit screen
  const ui = await p.evaluate(async () => { save.authSeen = true; save.lessonDone = true; save.tcWelSeen = 1; $('login').hidden = true; try { showHub('play'); } catch (e) {} await new Promise(r => setTimeout(r, 2500));
    try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove());
    const q = s => { const e = document.querySelector(s); return !!(e && e.getClientRects().length); }; return { rest: q('#rbApp .s3-rest'), btn: q('#rbApp [data-s3="rest"]'), text: (document.querySelector('#rbApp .s3-rest') || {}).innerText || '' }; });
  let tapped = false; if (ui.btn) { try { await p.locator('#rbApp [data-s3="rest"]').first().tap({ timeout: 8000 }); tapped = true; } catch (e) {} }
  await p.waitForTimeout(800);
  const ui2 = await p.evaluate(() => ({ week: TOPS_S3.view().week, posters: document.querySelectorAll('#rbApp [data-s3book]').length }));
  const ui3 = await p.evaluate(async () => { const c = career(), k = c.circuit; k.level = 3; k.week = 9; c.bank = 10; k.debt = 50; k.live = null; persist(); try { showHub('play'); } catch (e) {} await new Promise(r => setTimeout(r, 1500)); const e = document.querySelector('#rbApp [data-s3="rec"]'); return { rec: !!(e && e.getClientRects().length), text: e ? e.innerText : '', adv: !!document.querySelector('#rbApp [data-s3="adv"]') }; });
  // 7 reload straight after a recovery entry (ChatGPT round 2 P2-2): bank, debt, live.recovery and the booking survive; no second funding
  const rl0 = await p.evaluate(() => { const c = career(), k = c.circuit; k.level = 3; k.week = 9; c.bank = 10; k.debt = 50; k.live = null; k.recovered = 0; const rc = TOPS_S3.recover(); persist();
    return { ok: rc && rc.ok, cost: rc && rc.cost, bank: c.bank, debt: k.debt, live: k.live && k.live.id, recovery: !!(k.live && k.live.recovery), recovered: k.recovered }; });
  await p.goto(url); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TC_API, null, { timeout: 120000 }); await p.waitForTimeout(1500);
  const rl1 = await p.evaluate(() => { const c = career(), k = c.circuit; const again = TOPS_S3.recover(); const v = TOPS_S3.view();
    return { bank: c.bank, debt: k.debt, live: k.live && k.live.id, recovery: !!(k.live && k.live.recovery), recovered: k.recovered, again: !!(again && again.ok), vdebt: v.debt, vrec: v.recover }; });
  await b.close();
  if (!rl0.ok || rl1.bank !== rl0.bank || rl1.debt !== rl0.debt || rl1.live !== rl0.live || !rl1.recovery || rl1.recovered !== 1 || rl1.again || rl1.vdebt !== rl0.debt || rl1.vrec) f.push('7 recovery entry across a reload ' + JSON.stringify({ rl0, rl1 }));
  if (r.err) f.push('error: ' + r.err); else {
    if (r.grid.length) f.push('1 levels/weeks not reaching an event in one action: ' + JSON.stringify(r.grid.slice(0, 5)) + ' (' + r.grid.length + ')');
    if (!r.palace || !r.palace.ok || r.palace.to !== 52) f.push('1 Palace week 17 -> 52: ' + JSON.stringify(r.palace));
    if (r.book.length) f.push('1 a week with an event could not be booked: ' + JSON.stringify(r.book.slice(0, 3)));
    if (JSON.stringify(r.palaceLate.map(x => x.to)) !== JSON.stringify([156, 208, 208])) f.push('1 late Palace arrivals (the Worlds is on week 52 of each year only) ' + JSON.stringify(r.palaceLate));
    // car-worlds (CAR-WEAK 3): a lost Worlds goes back to the DPNZ Tour, so week 53 has the weekly DPNZ events (no rest)
    if (r.afterWorlds.week !== 53 || r.afterWorlds.rest || !/^dpnz_/.test(r.afterWorlds.cal[0] || '')) f.push('1 after losing the Worlds at week 52 the DPNZ Tour should be on at week 53 ' + JSON.stringify(r.afterWorlds));
    if (r.adv.ok) f.push('3 the advance should be refused while one is owed');
    if (!r.offer || !r.rec.ok || r.bankAfterRec !== 0 || r.debt1 !== 120 + r.rec.cost || !r.live) f.push('3 recovery entry ' + JSON.stringify({ offer: r.offer, rec: r.rec, bank: r.bankAfterRec, debt: r.debt1 }));
    if (r.afterLoss.live || !r.afterLoss.offer) f.push('3 after a loss the recovery entry is gone (dead end) ' + JSON.stringify(r.afterLoss));
    if (!r.rec2.ok) f.push('3 second recovery entry refused ' + JSON.stringify(r.rec2));
    if (!(r.win.prize > 0) || r.win.debtAfter !== Math.max(0, r.win.debtBefore - Math.round(r.win.prize / 2))) f.push('3 a win repays half the prize ' + JSON.stringify(r.win));
    if (r.notBroke.ok) f.push('3 recovery entry offered while you can afford an event');
    if (r.pn.week !== 3 || !r.pn.live) f.push('4 hub Play on empty Opens week 2 ' + JSON.stringify(r.pn));
    if (!r.pnBroke.live || !r.pnBroke.recovery || r.pnBroke.bank !== 10) f.push('4 hub Play when broke at DPNZ ' + JSON.stringify(r.pnBroke));
    if (r.pub.bank !== 60 - 5 + r.pub.prize || r.pub.week !== 4) f.push('6 Pub night money/week changed ' + JSON.stringify(r.pub));
  }
  if (r2.level !== 2 || r2.week !== 5 || !r2.rest || r2.rest.next !== 6 || r2.cal !== 0) f.push('2 parked save did not load into the rest state ' + JSON.stringify(r2));
  if (!ui.rest || !ui.btn || !/week 6/.test(ui.text)) f.push('5 no Rest week card ' + JSON.stringify(ui));
  if (!tapped || ui2.week !== 6 || ui2.posters < 1) f.push('5 Advance to next event by touch ' + JSON.stringify({ tapped, ui2 }));
  if (!ui3.rec || ui3.adv) f.push('5 broke card: recovery entry shown, advance hidden while owed ' + JSON.stringify(ui3));
  if (errs.length) f.push('page errors: ' + errs.slice(0, 3).join(' | '));
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ')); process.exit(1); }
  console.log(`PASS: 7 levels x 120 start weeks each reach an event in one action (Palace 17 -> ${r.palace.to}); weeks with an event never move; a 4.13-style save parked on Opens week 5 reloads into "Rest week · until week 6" and the button moves it by touch; broke at DPNZ with an advance owed: recovery entry (${r.rec.id}, $${r.rec.cost} covered, bank unchanged), still there after a loss, a win repays half of $${r.win.prize}; not offered when you can afford one; hub Play jumps an empty week and books, and uses the recovery entry when broke; Pub night pays as before; a recovery entry survives a reload (bank, debt, booking) and is not funded twice`);
})();
