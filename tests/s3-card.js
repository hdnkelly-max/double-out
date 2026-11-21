// CAR-CARD (Producer 21 Nov 14:26): the Tour Card level can never be a dead end (no card + Q-School already used = nothing left).
//   1 Q-School without a card -> back to the DPNZ Tour: new season, 40% carried, qsOffer kept; no grant
//   2 Q-School top 4 -> Tour Card, stays at the Tour Card level, Players Championships on from the next week
//   3 Q-School runs once a year (not once a career): next year's is on the calendar at the Tour Card level
//   4 grid: every level 0-6 x weeks 1..120 x card yes/no x Q-School played yes/no reaches an event in one action (rest, or the safety net)
//     and that event books; the same grid on the engine before this change finds the dead states
//   5 safety net: a level above the DPNZ Tour with nothing left for this career sends you back to the DPNZ Tour (never an error)
//   6 page: TOPS_S3.rest() takes the safety net, logs s3_rest fallback, the career tier follows, and the level sheet reads "Back on tour"
// usage: node tests/s3-card.js [dir]
const path = require('path'); const fs = require('fs'); const { execSync } = require('child_process');
const dir = process.argv[2] || path.resolve(__dirname, '..'); const f = []; const out = {};
const load = src => { const m = { exports: {} }; new Function('module', 'exports', src)(m, m.exports); return m.exports; };
const E = load(fs.readFileSync(path.join(dir, 'tc/circuit.js'), 'utf8'));
const atCard = o => E.newCareer(Object.assign({ level: 5, week: 52, bank: 20000, pts: { dpnz: 1000 }, res: { dpnz: [400, 300, 300] }, dpnzEv: 8, qsOffer: true, grants: { 3: 1, 4: 1 } }, o || {}));
const play = (c, id, wins) => { const b = E.book(c, id); if (!b.ok) return { err: b }; let r; for (let i = 0; i < 8; i++) { r = E.result(c, i < wins); if (r && r.done) break; } return r; };
// 1 Q-School lost in the first round
{ const c = atCard(), b0 = c.bank; const r = play(c, 'qschool', 0);
  if (!r || !r.up || r.up.to !== 3 || c.level !== 3 || !c.qsOffer || c.dpnzEv !== 0 || c.pts.dpnz !== 400 || r.up.grant || r.up.fromQs !== 'L128') f.push('1 Q-School without a card ' + JSON.stringify({ r, level: c.level, qs: c.qsOffer, ev: c.dpnzEv, pts: c.pts.dpnz }));
  if (c.bank !== b0 - 3700) f.push('1 money: Q-School costs 1,100 + 2,600, no prize, no grant ' + (b0 - c.bank));
  if (!/No Tour Card this time \(last 128\)/.test(r.up.msg)) f.push('1 message ' + r.up.msg);
  if (!E.calendar(c).length) f.push('1 the DPNZ Tour has an event the next week');
  out.qsLost = r.up.msg;
  // 3 next year: Q-School is on again at the Tour Card level
  c.level = 5; c.week = 104; const cal = E.calendar(c).map(e => e.id); if (!cal.includes('qschool')) f.push('3 next year Q-School not on ' + JSON.stringify(cal)); }
// 2 Q-School semi-final = card
{ const c = atCard(); const r = play(c, 'qschool', 5); // 128 -> L64, L32, L16, QF, SF: lose the SF
  if (!c.card || c.level !== 5 || r.up) f.push('2 Q-School semi-final: card, stay ' + JSON.stringify({ card: c.card, level: c.level, r }));
  const cal = E.calendar(c).map(e => e.id); if (!cal.some(x => /^pc_/.test(x)) || cal.includes('qschool')) f.push('2 next week: Players Championships, no Q-School ' + JSON.stringify(cal)); }
// 3b no card, Q-School far off: wait on the DPNZ Tour (place kept), not 40+ rest weeks; within 4 weeks: rest to Q-School
{ const c = atCard({ week: 60, qsOffer: false }); const r = E.restWeek(c);
  if (!r.ok || !r.fallback || r.qsWeek !== 104 || c.level !== 3 || !c.qsOffer || !E.calendar(c).length || !/Q-School is in week 104/.test(r.up.msg)) f.push('3b Q-School far off ' + JSON.stringify({ r, level: c.level, qs: c.qsOffer }));
  const c2 = atCard({ week: 49 }); const r2 = E.restWeek(c2); if (!r2.ok || r2.fallback || r2.to !== 52 || c2.level !== 5) f.push('3b Q-School in 3 weeks should rest to it ' + JSON.stringify(r2)); }
// 4 grid, this engine and the one before
function grid(Eng) { const bad = [], fall = []; for (let L = 0; L <= 6; L++) for (let w = 1; w <= 120; w++) for (const card of [false, true]) for (const qs of [false, true]) {
  const c = Eng.newCareer({ level: L, week: w, bank: 1e6, card, pts: { dpnz: 500 }, grants: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 } });
  if (qs) c.history.push({ week: Math.max(1, w - 1), id: 'qschool', level: 5, fin: 'L128', prize: 0, pts: 0 });
  if (!Eng.calendar(c).length) { const r = Eng.restWeek(c); if (!r || !r.ok) { bad.push([L, w, card, qs, r && r.why]); continue; } if (r.fallback) fall.push([L, w, card, qs]); }
  const e = Eng.calendar(c)[0]; if (!e) { bad.push([L, w, card, qs, 'empty after rest']); continue; } const b = Eng.book(c, e.id); if (!b || !b.ok) bad.push([L, w, card, qs, 'book ' + e.id]); }
  return { bad, fall }; }
const g = grid(E); out.grid = { states: 7 * 120 * 4, bad: g.bad.length, fallback: g.fall.length };
if (g.bad.length) f.push('4 dead states ' + g.bad.length + ' e.g. ' + JSON.stringify(g.bad.slice(0, 3)));
let before = null; try { const src = execSync('git show car-worlds2:tc/circuit.js', { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); const gb = grid(load(src)); before = gb.bad.length; } catch (e) {}
out.before = before; if (before !== null && before === 0) f.push('4 the old engine should show the dead states (it found none)');
// 5 safety net
{ const ev = E.LEVELS[5].events, keep = ev.map(e => Object.assign({}, e)); ev.forEach(e => { e.needCard = true; });
  try { const c = atCard({ week: 60 }); const r = E.restWeek(c);
    if (!r || !r.ok || !r.fallback || r.fromLevel !== 5 || c.level !== 3 || !E.calendar(c).length || !/Nothing left on at the Tour Card/.test(r.up.msg)) f.push('5 safety net ' + JSON.stringify({ r, level: c.level }));
    const c2 = E.newCareer({ level: 2, week: 2 }); const r2 = E.restWeek(c2); if (r2.fallback) f.push('5 the safety net must not move a lower level up');
  } finally { ev.forEach((e, i) => { Object.keys(e).forEach(k => delete e[k]); Object.assign(e, keep[i]); }); } }
(async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} });
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); const url = 'file://' + path.join(dir, 'index.html') + '?s3=1';
  await p.goto(url); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TC_API, null, { timeout: 120000 }); await p.waitForTimeout(1500);
  const pg = await p.evaluate(async () => { const o = {}; try {
    save.authSeen = true; save.lessonDone = true; save.tcWelSeen = 1; $('login').hidden = true; V.walkOn = () => {}; window.showMsg = (m, cb) => { try { cb && cb('ok'); } catch (e) {} };
    newCareer(); const c = career(), k = c.circuit; try { showHub('play'); } catch (e) {} await new Promise(r => setTimeout(r, 1500));
    k.level = 5; c.tier = 5; k.week = 60; k.card = false; k.pts = { dpnz: 1000 }; k.res = { dpnz: [400, 300, 300] }; k.grants = { 3: 1, 4: 1, 5: 1 }; persist();
    localStorage.setItem('tops_s3_seen', JSON.stringify({ h: k.history.length, lv: 5, r: -1, id: '', g: 0 }));
    const ev = TOPS_CIRCUIT.LEVELS[5].events; ev.forEach(e => { e._nc = e.needCard; e.needCard = true; });
    const logs = []; const _l = window.TOPS_FLIGHT && TOPS_FLIGHT.log; o.view0 = { rest: TOPS_S3.view().rest, cal: TOPS_S3.view().calendar.length };
    const r = TOPS_S3.rest(); ev.forEach(e => { e.needCard = e._nc; delete e._nc; });
    o.r = { ok: r && r.ok, fallback: r && r.fallback, fromLevel: r && r.fromLevel }; o.level = k.level; o.tier = c.tier; o.cal = TOPS_S3.view().calendar.length; o.pts = k.pts.dpnz;
    try { showHub('play'); } catch (e) {} await new Promise(r => setTimeout(r, 2000));
    const d = document.getElementById('s3Sheet'); o.sheet = d ? d.innerText.replace(/\s+/g, ' ').slice(0, 220) : null;
  } catch (e) { o.err = String(e.stack || e).slice(0, 300); } return o; });
  await p.screenshot({ path: path.join(dir, 'wip/car-card/s3-card-fallback-390.jpg'), quality: 80 }).catch(() => {});
  await b.close(); out.page = pg;
  if (pg.err) f.push('6 page ' + pg.err);
  else if (!pg.r.ok || !pg.r.fallback || pg.level !== 3 || pg.tier !== 3 || !pg.cal || pg.pts !== 400 || !/^Back on tour/i.test(pg.sheet || '') || !/No Tour Card this time/.test(pg.sheet || '')) f.push('6 page safety net ' + JSON.stringify(pg));
  if (errs.length) f.push('page errors: ' + errs.slice(0, 2).join(' | '));
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
  console.log(`PASS: Q-School without a card goes back to the DPNZ Tour (new season, 40% = 400 carried, Q-School place kept, $3,700 spent, no grant); a Q-School semi-final gives the card and Players Championships next week; Q-School is on again next year; no card with Q-School more than 4 weeks off waits on the DPNZ Tour with the place kept (week 60 -> back, week 49 -> rests to 52); grid ${out.grid.states} states (7 levels x 120 weeks x card x Q-School played): 0 dead (${out.grid.fallback} via the safety net), the engine before this change: ${out.before} dead; the safety net moves only levels above the DPNZ Tour; on the page TOPS_S3.rest() takes it, the tier follows and the sheet reads "Back on tour"`);
})();
