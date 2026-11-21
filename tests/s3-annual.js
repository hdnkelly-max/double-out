// Q&D P1 (Producer 21 Nov 14:56): a yearly event (every 52: the Worlds, Q-School) ran on weeks 52 AND 53, so a World Champion at week 53
// could book and win the Worlds again straight away (+$69k twice). Now one week a year.
//   1 over weeks 1..520 the Worlds and Q-School are on exactly on weeks 52, 104, ... (10 each), events every 2-6 weeks keep their two-week window
//   2 a champion at week 53: no Worlds on the calendar, book('worlds') refused by the engine and by TOPS_S3, the bank unchanged; next Worlds week 104
//   3 the same for Q-School (week 53 after playing it at 52)
//   4 a lost Worlds at week 52 (car-worlds): back to the DPNZ Tour with an event at week 53; a Palace arrival mid-year rests to the next week 52
//   5 every level x weeks 1..260 reaches an event in one action (rest if needed) and that event books
// usage: node tests/s3-annual.js [dir]
const path = require('path'); const fs = require('fs'); const dir = process.argv[2] || path.resolve(__dirname, '..'); const f = []; const out = {};
const E = require(path.join(dir, 'tc/circuit.js'));
const weeksOn = (lv, id, extra) => { const on = []; for (let w = 1; w <= 520; w++) { const c = E.newCareer(Object.assign({ level: lv, week: w }, extra || {})); if (E.calendar(c).some(e => e.id === id)) on.push(w); } return on; };
// 1
{ const wo = weeksOn(6, 'worlds'), qs = weeksOn(5, 'qschool'); out.worlds = wo.length; out.qs = qs.length;
  const want = Array.from({ length: 10 }, (_, i) => 52 * (i + 1));
  if (JSON.stringify(wo) !== JSON.stringify(want)) f.push('1 Worlds weeks ' + JSON.stringify(wo.slice(0, 6)));
  if (JSON.stringify(qs) !== JSON.stringify(want)) f.push('1 Q-School weeks ' + JSON.stringify(qs.slice(0, 6)));
  const k3 = weeksOn(0, 'kauri_cup'); if (!(k3.includes(4) && k3.includes(5) && !k3.includes(6))) f.push('1 a 4-weekly event lost its two-week window ' + JSON.stringify(k3.slice(0, 6))); }
// 2 champion at 53
{ const c = E.newCareer({ level: 6, week: 52, bank: 1e6 }); E.book(c, 'worlds'); let r; for (let i = 0; i < 8; i++) { r = E.result(c, true); if (r.done) break; }
  const b0 = c.bank;
  if (!r.up || !r.up.champion || c.week !== 53) f.push('2 setup: champion at week 53 ' + JSON.stringify({ up: r.up, week: c.week }));
  if (E.calendar(c).length) f.push('2 champion at week 53 still has the Worlds on ' + JSON.stringify({ cal: E.calendar(c).map(e => e.id) }));
  const rw = E.restWeek(c); if (!rw.ok || rw.to !== 104) f.push('2 next Worlds should be week 104 ' + JSON.stringify(rw));
  out.champPrize = r.prize; }
// 3 Q-School again at 53
{ const c = E.newCareer({ level: 5, week: 52, bank: 1e6, pts: {} }); E.book(c, 'qschool'); let r; for (let i = 0; i < 8; i++) { r = E.result(c, false); if (r.done) break; }
  c.level = 5; c.week = 53; if (E.calendar(c).some(e => e.id === 'qschool')) f.push('3 Q-School on again at week 53'); }
// 4 lost Worlds + Palace arrival
{ const c = E.newCareer({ level: 6, week: 52, bank: 1e6, pts: { dpnz: 1000 }, grants: { 6: 1 } }); E.book(c, 'worlds'); let r; for (let i = 0; i < 8; i++) { r = E.result(c, false); if (r.done) break; }
  if (c.level !== 3 || c.week !== 53 || !E.calendar(c).length) f.push('4 lost Worlds: DPNZ event at week 53 ' + JSON.stringify({ level: c.level, week: c.week }));
  const p = E.newCareer({ level: 6, week: 61 }); const rw = E.restWeek(p); if (!rw.ok || rw.to !== 104) f.push('4 Palace arrival at week 61 should rest to 104 ' + JSON.stringify(rw)); }
// 5 grid
{ const bad = []; for (let L = 0; L <= 6; L++) for (let w = 1; w <= 260; w++) { const c = E.newCareer({ level: L, week: w, bank: 1e6, card: L === 5 });
    if (!E.calendar(c).length) { const r = E.restWeek(c); if (!r.ok) { bad.push([L, w, r.why]); continue; } }
    const e = E.calendar(c)[0]; const b = e && E.book(c, e.id); if (!b || !b.ok) bad.push([L, w, 'book']); }
  out.grid = 7 * 260; if (bad.length) f.push('5 ' + bad.length + ' states fail ' + JSON.stringify(bad.slice(0, 3))); }
(async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + path.join(dir, 'index.html') + '?s3=1'); await p.waitForFunction(() => window.TOPS_S3 && window.C3, null, { timeout: 120000 }); await p.waitForTimeout(1000);
  const pg = await p.evaluate(() => { save.authSeen = true; newCareer(); const c = career(), k = c.circuit; k.level = 6; c.tier = 6; k.week = 53; c.bank = 500000; k.live = null;
    k.history.push({ week: 52, id: 'worlds', n: 'World Championship', level: 6, fin: 'W', prize: 0, pts: 0 }); const b0 = c.bank; const r = TOPS_S3.book('worlds');
    return { ok: r && r.ok, why: r && r.why, bank: c.bank, b0, live: !!k.live, cal: TOPS_S3.view().calendar.length, rest: TOPS_S3.view().rest }; });
  await b.close(); out.page = pg;
  if (pg.ok || pg.bank !== pg.b0 || pg.live || pg.cal || !pg.rest || pg.rest.next !== 104) f.push('page: TOPS_S3 lets a champion at week 53 back in ' + JSON.stringify(pg));
  if (errs.length) f.push('page errors ' + errs[0]);
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
  console.log(`PASS: the Worlds and Q-School run on weeks 52, 104 ... only (10 each in 520 weeks); 2-6-weekly events keep their two-week window; a champion at week 53 sees no Worlds, TOPS_S3.book('worlds') is refused with the bank untouched, next Worlds week 104; Q-School can't be played twice in one year; a lost Worlds is back on the DPNZ Tour at week 53; a Palace arrival at week 61 rests to 104; ${out.grid} level x week states reach and book an event in one action`);
})();
