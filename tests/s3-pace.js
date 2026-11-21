// Pace package (Hayden Sat 15:10, doc 46): Pub need 75, Opens need 150, the DPNZ points route (400, best 6, at least 2 events this
// season), a Trans-Tasman semi-final qualifies. Not the 4-event season, not DPNZ 250-300.
//   1 Pub: a win + a final (50 + 30 = 80) after two nights = the Club; one win (50) isn't enough; the Kauri Cup still jumps
//   2 Opens: 150 points over at least 2 Opens = the DPNZ Tour; one big win alone isn't (minEv 2)
//   3 DPNZ route: 400 points (best 6) after 2+ events this season = the Palace (grant once); one event can't do it, nor can the carried
//     300 plus one event; the Order of Merit still decides at 8 events for everyone else
//   4 Trans-Tasman: W, F and SF = the Palace (the SF keeps the Q-School place); a QF goes back to the DPNZ Tour
//   5 after the route, a mid-year arrival rests to the next Worlds week (52) in one action
// usage: node tests/s3-pace.js [dir]
const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..'); const f = []; const out = {};
const E = require(path.join(dir, 'tc/circuit.js'));
const night = (c, id, wins) => { const cal = E.calendar(c); const e = cal.find(x => x.id === id) || cal[0]; const b = E.book(c, e.id); if (!b.ok) return { err: b, id: e.id, cal: cal.map(x => x.id) }; let r; for (let i = 0; i < 10; i++) { r = E.result(c, i < wins); if (r && r.done) break; } return r; };
// 1 Pub
{ const c = E.newCareer({ bank: 500 }); const a = night(c, 'pub_night', 3); if (c.level !== 0 || c.pts.pub !== 50) f.push('1 one Pub win should not promote ' + JSON.stringify({ lv: c.level, pts: c.pts }));
  const b = night(c, 'pub_night', 2); if (c.level !== 1 || !b.up || b.up.to !== 1) f.push('1 win + final (80) should reach the Club ' + JSON.stringify({ lv: c.level, pts: c.pts, up: b.up }));
  out.pub = c.pts.pub; if (E.LEVELS[0].need !== 75) f.push('1 Pub need ' + E.LEVELS[0].need); }
// 2 Opens
{ const c = E.newCareer({ level: 2, week: 3, bank: 99999, pts: {} }); const a = night(c, null, 7); if (c.level !== 2) f.push('2 one Opens win alone should not promote (minEv 2) ' + JSON.stringify({ lv: c.level, pts: c.pts, a }));
  for (let i = 0; i < 6 && c.level === 2; i++) { if (!E.calendar(c).length) E.restWeek(c); night(c, null, 2); }
  if (c.level !== 3) f.push('2 two Opens with 150+ should reach the DPNZ Tour ' + JSON.stringify({ lv: c.level, pts: c.pts })); out.opens = c.pts.opens; if (E.LEVELS[2].need !== 150) f.push('2 Opens need ' + E.LEVELS[2].need); }
// 3 DPNZ route
{ const c = E.newCareer({ level: 3, week: 10, bank: 99999, pts: {} }); const b0 = c.bank;
  night(c, null, 9); if (c.level !== 3 || c.pts.dpnz !== 400) f.push('3 one DPNZ win (400) must not be enough on its own ' + JSON.stringify({ lv: c.level, pts: c.pts.dpnz, ev: c.dpnzEv }));
  const r = night(c, null, 0); if (c.level !== 6 || !r.up || r.up.to !== 6 || r.up.grant !== 3000) f.push('3 400+ after 2 events should be the Palace with the grant ' + JSON.stringify({ lv: c.level, up: r.up, pts: c.pts.dpnz }));
  const rw = E.restWeek(c); if (!rw.ok || rw.to !== 52) f.push('5 a mid-year arrival should rest to week 52 ' + JSON.stringify(rw)); }
{ const c = E.newCareer({ level: 3, week: 60, bank: 99999, pts: { dpnz: 300 }, res: { dpnz: [300] }, dpnzEv: 0 }); // the capped carry after a lost Worlds
  const r = night(c, null, 2); if (c.level !== 3) f.push('3 carry 300 + one event (80) must not qualify ' + JSON.stringify({ lv: c.level, pts: c.pts.dpnz, ev: c.dpnzEv }));
  const r2 = night(c, null, 2); if (c.level !== 6) f.push('3 carry 300 + two QFs (160, best 6 = 460) after 2 events should qualify ' + JSON.stringify({ lv: c.level, pts: c.pts.dpnz, ev: c.dpnzEv })); }
{ const c = E.newCareer({ level: 3, week: 10, bank: 99999, pts: {} }); for (let i = 0; i < 7; i++) night(c, null, 0); // first-round exits: 20 a time
  if (c.level !== 3 || c.dpnzEv !== 7) f.push('3 seven first-round exits stay on the Tour ' + JSON.stringify({ lv: c.level, ev: c.dpnzEv }));
  const r = night(c, null, 0); if (!r.up || ![3, 4, 6].includes(r.up.to)) f.push('3 the 8th event still runs the Order of Merit ' + JSON.stringify(r.up)); }
// 4 Trans-Tasman
for (const [wins, want, name] of [[4, 6, 'W'], [3, 6, 'F'], [2, 6, 'SF'], [1, 3, 'QF']]) { const c = E.newCareer({ level: 4, week: 10, bank: 99999, pts: { dpnz: 600 }, grants: { 6: 1 } }); const r = night(c, 'tt_bne', wins);
  if (c.level !== want || r.fin !== name) f.push('4 Trans-Tasman ' + name + ' -> level ' + want + ' ' + JSON.stringify({ lv: c.level, fin: r.fin, up: r.up }));
  if (name === 'SF' && !c.qsOffer) f.push('4 the SF keeps the Q-School place'); }
if (E.DPNZ_ROUTE !== 400 || E.DPNZ_ROUTE_EV !== 2 || E.BEST_N.dpnz !== 6) f.push('route constants ' + JSON.stringify([E.DPNZ_ROUTE, E.DPNZ_ROUTE_EV, E.BEST_N.dpnz]));
if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
console.log(`PASS: Pub need 75 (one win 50 stays, win + final ${out.pub} = the Club); Opens need 150 over 2+ Opens (${out.opens}); DPNZ route 400 best 6 after 2+ events = the Palace with the $3,000 grant (one win alone, or the capped 300 carry + one event, isn't); the Order of Merit still decides at event 8; Trans-Tasman W/F/SF = the Palace (SF keeps the Q-School place), QF back to the DPNZ Tour; a mid-year arrival rests to week 52`);
