// CAR-OPP (Producer 21 Nov 22:21, agreed with ChatGPT): opponent recalibration plus the three rules that keep it honest
//   1 field centres: Season 3 uses TOPS_CIRCUIT.FIELD_CEN per Circuit level (Pub fitted to the weak profile, Club and Opens to mid; DPNZ
//     and up unchanged); fixed by level, never the player. On the page v11's shift uses them for Circuit matches only (C2, Producer
//     02:05): money matches, local nights, Season 2 and the Run keep CEN as on 4.22. The cards show the average you actually play (note a)
//   2 DPNZ route results gate (C1, Producer 02:05): 400 (best 6) after 2+ events AND at least one semi-final or better this season. Six
//     quarter-finals (480) don't qualify; four QFs + one SF do; a final does; the counters start again with each new DPNZ season
//   2b B1 (Q&D 01:25): a save from before the gate (no counters) backfills them once from this season's DPNZ history: David's shape (one
//     win at Hamilton, 400 points, dpnzEv 1) qualifies on any result in his next DPNZ event; a pre-gate save with five QFs + a QF stays
//   3 Pub best 6: twenty first-round-and-out nights stay at the Pub (6 x 10 = 60); five QFs and one knockout win (68) still stay; two
//     knockout wins (76) or any title reach the Club
//   4 funded Worlds trip: qualifying sets the package for the next edition; that Worlds shows travel paid, booking it costs the entry only
//     ($0), no cash goes into the bank (only the one-off $3,000 arrival grant), the record says funded; the package can't be used twice,
//     and the next qualification funds the next edition
//   5 page: TOPS_S3.view() marks the Worlds funded, the poster reads "trip paid", booking leaves the bank as it was
// usage: node tests/s3-opp.js [dir]
const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..'); const f = []; const out = {};
const E = require(path.join(dir, 'tc/circuit.js'));
const night = (c, wins) => { const cal = E.calendar(c); if (!cal.length) E.restWeek(c); const e = E.calendar(c)[0]; const b = E.book(c, e.id); if (!b.ok) return { err: b }; let r; for (let i = 0; i < 10; i++) { r = E.result(c, i < wins); if (r && r.done) break; } return r; };
// 1
{ const C = E.FIELD_CEN; out.cen = C;
  if (!Array.isArray(C) || C.length !== 7 || C[3] !== 76 || C[4] !== 84 || C[5] !== 91 || C[6] !== 97) f.push('1 DPNZ and up must stay 76/84/91/97 ' + JSON.stringify(C));
  if (!(C[0] < 58 && C[1] > 63 && C[2] >= 69)) f.push('1 the Pub eases, the Club and the Opens firm ' + JSON.stringify(C));
  for (let i = 1; i < 7; i++) if (!(C[i] > C[i - 1])) f.push('1 centres must rise level by level ' + JSON.stringify(C)); }
// 2 results gate (DPNZ 32 players: wins 2 = QF, 3 = SF, 4 = F, 5 = W)
const dp = () => E.newCareer({ level: 3, week: 10, bank: 99999, pts: {} });
{ const c = dp(); for (let i = 0; i < 6; i++) night(c, 2); out.qf6 = { pts: c.pts.dpnz, lv: c.level, ev: c.dpnzEv };
  if (c.level !== 3 || c.pts.dpnz !== 480) f.push('2 six quarter-finals (480) must not qualify ' + JSON.stringify(out.qf6)); }
{ const c = dp(); night(c, 2); night(c, 2); night(c, 2); out.sf0 = c.level; const r0 = night(c, 3); // 3 QFs + SF = 384: under 400
  if (c.level !== 3) f.push('2 three QFs + one SF (384) is under 400 ' + JSON.stringify({ lv: c.level, pts: c.pts.dpnz }));
  const r = night(c, 2); if (c.level !== 6 || !r.up || !/a semi-final/.test(r.up.msg)) f.push('2 four QFs + one SF (464) qualify ' + JSON.stringify({ lv: c.level, up: r.up })); out.sf2 = r.up && r.up.msg; }
// 2b B1: saves from before the gate (no dpnzF / dpnzSF)
for (const w of [0, 1, 2, 3]) { const c = dp(); night(c, 5); delete c.dpnzF; delete c.dpnzSF; // David: one win at an event, 400 points, dpnzEv 1
  if (c.pts.dpnz !== 400 || c.dpnzEv !== 1) f.push('2b setup ' + JSON.stringify({ pts: c.pts.dpnz, ev: c.dpnzEv }));
  const r = night(c, w); if (c.level !== 6 || !/with a final/.test((r.up || {}).msg || '')) f.push('2b David\'s pre-gate save must qualify on any result (wins ' + w + ') ' + JSON.stringify({ lv: c.level, up: r.up, F: c.dpnzF }));
  if (w === 0) out.david = r.up && r.up.msg; }
{ const c = dp(); for (let i = 0; i < 5; i++) night(c, 2); delete c.dpnzF; delete c.dpnzSF; night(c, 2);
  if (c.level !== 3 || c.dpnzF !== 0 || c.dpnzSF !== 0) f.push('2b a pre-gate save with six QFs still stays ' + JSON.stringify({ lv: c.level, pts: c.pts.dpnz, F: c.dpnzF, SF: c.dpnzSF })); }
{ const c = dp(); night(c, 3); night(c, 2); delete c.dpnzF; delete c.dpnzSF; c.dpnzEv = 1; // only this season's records count: the SF was last season
  night(c, 2); if (c.dpnzSF !== 0 || c.level !== 3) f.push('2b the backfill counts only this season\'s events ' + JSON.stringify({ SF: c.dpnzSF, lv: c.level })); }
{ const c = dp(); night(c, 2); night(c, 2); const r = night(c, 4); if (c.level !== 6 || !/a final/.test((r.up || {}).msg || '')) f.push('2 two QFs + a final (400) qualify ' + JSON.stringify({ lv: c.level, pts: c.pts.dpnz, up: r.up })); }
{ const c = E.newCareer({ level: 6, week: 52, bank: 99999, pts: { dpnz: 900 }, grants: { 6: 1 }, dpnzF: 1, dpnzSF: 1, dpnzEv: 8 }); // a lost Worlds starts a new DPNZ season
  E.book(c, 'worlds'); for (let i = 0; i < 8; i++) { const r = E.result(c, false); if (r.done) break; }
  out.season = { lv: c.level, F: c.dpnzF, SF: c.dpnzSF, ev: c.dpnzEv, pts: c.pts.dpnz };
  if (c.level !== 3 || c.dpnzF || c.dpnzSF || c.dpnzEv) f.push('2 a new DPNZ season starts the gate counters again ' + JSON.stringify(out.season));
  night(c, 3); if (c.level !== 3) f.push('2 the carry (300) + one SF (444) after a new season is one event and one SF: no ' + JSON.stringify({ lv: c.level, pts: c.pts.dpnz })); }
// 3 Pub best 6
{ const c = E.newCareer({ bank: 60 }); for (let i = 0; i < 20; i++) night(c, 0); out.pub0 = { lv: c.level, pts: c.pts.pub };
  if (c.level !== 0 || c.pts.pub !== 60) f.push('3 twenty first-round exits stay at the Pub on 60 ' + JSON.stringify(out.pub0));
  night(c, 1); out.pub1 = { lv: c.level, pts: c.pts.pub }; if (c.level !== 0 || c.pts.pub !== 68) f.push('3 one knockout win (68) still stays ' + JSON.stringify(out.pub1));
  night(c, 1); if (c.level !== 1) f.push('3 two knockout wins (76) reach the Club ' + JSON.stringify({ lv: c.level, pts: c.pts.pub })); if (E.BEST_N.pub !== 6) f.push('3 BEST_N.pub ' + E.BEST_N.pub); }
// 4 funded trip
{ const c = E.newCareer({ level: 3, week: 30, bank: 5000, pts: {} }); night(c, 2); night(c, 2); const b0 = c.bank; const r = night(c, 4); const gain = c.bank - b0 + c.history[c.history.length - 1].cost; // the bank after the final, with that night's entry added back
  out.fund = { wfund: c.wfund, lv: c.level, grant: r.up && r.up.grant, gain, prize: r.prize };
  if (c.level !== 6 || c.wfund !== 1 || gain !== r.prize + 3000) f.push('4 qualifying sets the package for edition 1 and pays no cash beyond the prize and the one-off grant ' + JSON.stringify(out.fund));
  E.restWeek(c); const w = E.calendar(c).find(e => e.id === 'worlds'); if (!w || !w.funded || w.cost !== 0 || !w.canAfford) f.push('4 the Worlds at week 52 shows the trip paid ' + JSON.stringify(w));
  c.bank = 0; const bk = E.book(c, 'worlds'); if (!bk.ok || c.bank !== 0 || c.wfundUsed !== 1) f.push('4 a funded booking costs nothing, with $0 in the bank ' + JSON.stringify({ bk, bank: c.bank }));
  let rr; for (let i = 0; i < 8; i++) { rr = E.result(c, false); if (rr.done) break; } const h = c.history[c.history.length - 1];
  if (h.cost !== 0 || !h.funded || h.ed !== 1) f.push('4 the Worlds record says funded, cost 0 ' + JSON.stringify(h));
  out.after = { lv: c.level, bank: c.bank }; if (c.level !== 3 || c.bank !== E.prizeFor(E.eventOf('worlds'), 'L128')) f.push('4 a lost funded Worlds leaves only the prize ' + JSON.stringify(out.after));
  // wind the same edition back (an older reload at week 52 at the Palace): already played, and the package is spent
  const g = E.newCareer({ level: 6, week: 52, bank: 0, wfund: 1, wfundUsed: 1 }); const gw = E.calendar(g).find(e => e.id === 'worlds'); if (gw && gw.funded) f.push('4 a spent package pays twice');
  // requalify during year 2: edition 2 funded, never edition 1 again
  c.bank = 5000; c.week = 70; night(c, 2); night(c, 4); if (c.level !== 6 || c.wfund !== 2) f.push('4 the next qualification funds the next edition ' + JSON.stringify({ lv: c.level, wfund: c.wfund }));
  const g2 = E.newCareer({ level: 6, week: 104, bank: 10, wfund: 2, wfundUsed: 1 }); const w2 = E.calendar(g2).find(e => e.id === 'worlds'); if (!w2 || !w2.funded || !w2.canAfford) f.push('4 edition 2 funded with $10 in the bank ' + JSON.stringify(w2));
  const g3 = E.newCareer({ level: 6, week: 104, bank: 10 }); const w3 = E.calendar(g3).find(e => e.id === 'worlds'); if (!w3 || w3.funded || w3.cost !== 3000) f.push('4 no package (set straight to the Palace) still pays travel ' + JSON.stringify(w3)); }
(async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} });
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto('file://' + path.join(dir, 'index.html') + '?s3=1');
  await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TOPS_OPP_SHIFT, null, { timeout: 120000 }); await p.waitForTimeout(1200);
  const pg = await p.evaluate(() => { const o = {}; try { save.authSeen = true; newCareer(); const c = career(), k = c.circuit;
    o.s3 = [0, 1, 2, 3].map(t => TOPS_OPP_SHIFT(TIERS[t].avg, t, true)); o.plain = [0, 1, 2, 3].map(t => TOPS_OPP_SHIFT(TIERS[t].avg, t)); const keep = window.TOPS_S3FLAG; window.TOPS_S3FLAG = false; o.s2 = [0, 1, 2, 3].map(t => TOPS_OPP_SHIFT(TIERS[t].avg, t)); window.TOPS_S3FLAG = keep;
    // C2: a money match in a Circuit career plays at the 4.22 figure; note (a): the view shows what the Circuit match then plays
    V.walkOn = () => {}; beginMatch({ mode: 'career', tier: 3, p0: 'T', oppName: 'Money', oppAvg: 70, legs: 3, purse: 50 }); o.money = S.oppAvg; o.moneyWant = (() => { const f = window.TOPS_S3FLAG; window.TOPS_S3FLAG = false; const v = TOPS_OPP_SHIFT(70, 3); window.TOPS_S3FLAG = f; return v; })(); try { S.done = true; } catch (e) {}
    o.card = []; for (const lv of [0, 3]) { k.live = null; k.booked = null; k.level = lv; c.tier = lv; k.week = lv ? 10 : 1; c.bank = 99999; persist(); const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); const v = TOPS_S3.view().live.opp; TOPS_S3._playNow(); o.card.push({ lv, shown: v.avg, raw: v.raw, plays: S.oppAvg }); try { S.done = true; } catch (e) {} }
    k.live = null; k.booked = null;
    // CAR-OPP follow-up (Q&D P2): a Circuit match whose name and average happen to equal the queued Season 2 c.next must not take c.next's
    // strength (viaNext). Identity: the Circuit match keeps its own raw; a non-Circuit match with the same name/avg still goes via c.next
    { const q = { _d: 1, oppName: 'Same Name', oppAvg: 60, oppRaw: 71, routeAdj: 0 }; c.next = q;
      beginMatch({ mode: 'career', tier: 2, p0: 'T', oppName: 'Same Name', oppAvg: 60, legs: 3, purse: 0, fee: 0, circuit: true });
      o.vnC = { raw: S.oppRaw, avg: S.oppAvg, want: TOPS_OPP_SHIFT(60, 2, true), nextAvg: c.next.oppAvg, nextRaw: c.next.oppRaw }; try { S.done = true; } catch (e) {}
      c.next = { _d: 1, oppName: 'Same Name', oppAvg: 60, oppRaw: 71, routeAdj: 0 }; beginMatch({ mode: 'career', tier: 2, p0: 'T', oppName: 'Same Name', oppAvg: 60, legs: 3, purse: 0, fee: 0 });
      o.vnL = { raw: S.oppRaw, avg: S.oppAvg }; try { S.done = true; } catch (e) {} c.next = null; }
    k.level = 6; c.tier = 6; k.week = 52; c.bank = 0; k.wfund = 1; k.grants = { 3: 1, 4: 1, 6: 1 }; persist();
    const w = TOPS_S3.view().calendar.find(e => e.id === 'worlds'); o.view = w && { funded: w.funded, cost: w.cost, canAfford: w.canAfford };
    const r = TOPS_S3.book('worlds'); o.book = r && r.ok; o.bank = c.bank; o.paid = k.live && k.live.paid; } catch (e) { o.err = String(e.stack || e).slice(0, 300); } return o; });
  // the poster text, straight from the renderer with the same calendar entry
  const poster = await p.evaluate(() => { try { const k = career().circuit; k.live = null; k.booked = null; k.wfundUsed = null; persist(); showHub('play'); return new Promise(r => setTimeout(() => { const t = document.body.innerText; r({ paid: /Book it · trip paid/i.test(t), pkg: /qualifier’s trip/.test(t) }); }, 1500)); } catch (e) { return { err: String(e) }; } });
  await p.screenshot({ path: path.join(dir, 'wip/car-opp/s3-opp-worlds-390.jpg'), quality: 80 }).catch(() => {});
  await b.close(); out.page = pg; out.poster = poster;
  if (pg.err) f.push('5 page ' + pg.err);
  else { if (JSON.stringify(pg.s3.slice(0, 3)) === JSON.stringify(pg.s2.slice(0, 3)) || pg.s3[3] !== pg.s2[3]) f.push('1 page: Circuit centres differ from Season 2 at the Pub/Club/Opens and match at the DPNZ ' + JSON.stringify({ s3: pg.s3, s2: pg.s2 }));
    if (JSON.stringify(pg.plain) !== JSON.stringify(pg.s2)) f.push('1 C2: non-Circuit matches in a Season 3 career keep the 4.22 centres ' + JSON.stringify({ plain: pg.plain, s2: pg.s2 }));
    if (pg.money !== pg.moneyWant) f.push('1 C2: a money match plays as on 4.22 ' + JSON.stringify({ money: pg.money, want: pg.moneyWant }));
    if (!pg.vnC || pg.vnC.raw !== 60 || pg.vnC.avg !== pg.vnC.want || pg.vnC.nextAvg !== 60 || pg.vnC.nextRaw !== 71) f.push('1 P2: a Circuit match must not take the queued c.next strength ' + JSON.stringify(pg.vnC));
    if (!pg.vnL || pg.vnL.raw !== 71) f.push('1 P2 control: a non-Circuit match with the same name and average still plays the queued c.next ' + JSON.stringify(pg.vnL));
    for (const x of pg.card || []) if (x.shown !== x.plays || x.shown === x.raw && x.lv === 0) f.push('1 note (a): the card shows what you play ' + JSON.stringify(x));
    if (!pg.view || !pg.view.funded || pg.view.cost !== 0 || !pg.view.canAfford || !pg.book || pg.bank !== 0 || pg.paid !== 0) f.push('5 page funded Worlds ' + JSON.stringify(pg)); }
  if (!poster.paid || !poster.pkg) f.push('5 poster should read "Book it · trip paid" ' + JSON.stringify(poster));
  if (errs.length) f.push('page errors ' + errs.slice(0, 2).join(' | '));
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
  console.log(`PASS: Season 3 field centres ${JSON.stringify(out.cen)} (DPNZ and up unchanged; on the page Pub/Club/Opens opponents at the tier average play as ${pg.s3.slice(0, 3).join('/')} in Season 3, ${pg.s2.slice(0, 3).join('/')} in Season 2); a Circuit match never takes the queued Season 2 opponent's strength (same name and average: plays raw 60 as ${pg.vnC.avg}, c.next untouched; a local match still does); Circuit matches only: money matches and local nights play the 4.22 figures (money match tier 3 = ${pg.money}); the opponent shown is the one you play (Pub ${pg.card[0].raw} raw shows and plays ${pg.card[0].plays}, DPNZ ${pg.card[1].raw} -> ${pg.card[1].plays}); six DPNZ quarter-finals (480) don't qualify, four QFs + one SF do ("${out.sf2}"), two QFs + a final do, a new season restarts the counters; pre-gate saves backfill once: David's shape (one win, 400, one event) qualifies on any next result ("${out.david}"), six QFs still stay, last season's SF doesn't count; Pub best 6: twenty first-round exits stay on 60, one knockout win 68 stays, two reach the Club; qualifying funds the next Worlds trip (edition ${out.fund.wfund}): $0 to book with $0 in the bank, no cash beyond the prize and the one-off $3,000 grant, the record says funded, a spent package never pays twice, the next qualification funds the next edition; the page marks it funded and the poster reads "Book it · trip paid"`);
})();
