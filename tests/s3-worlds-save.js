// Doc 46 (Hayden 15:10) release conditions for "a lost Worlds goes back to the DPNZ Tour":
//   1 championship-year identity: every yearly event (Worlds, Q-School) records its edition (floor(week/52)); an edition already played
//     is never on again, even if a save comes back at week 52 with the result already in its history (an older reload / other device)
//   2 the $3,000 Palace grant is paid once and never repaid: 30 Palace -> lost Worlds -> DPNZ -> Palace cycles, grant once, never in the debt
//   3 Worlds history, titles and money are kept across the reset to the DPNZ Tour; the carry is 40% capped at 300 (below the Palace route)
//   4 page: lose the Worlds through TOPS_S3, reload the page: same state (DPNZ, week 53, points, history with the edition), Worlds not on
//   5 other device: a second browser holding the copy from before the Worlds adopts the new copy: DPNZ state, the Worlds not on there either
// usage: node tests/s3-worlds-save.js [dir]
const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..'); const f = []; const out = {};
const E = require(path.join(dir, 'tc/circuit.js'));
const playWorlds = (c, wins) => { const b = E.book(c, 'worlds'); if (!b.ok) return { err: b }; let r; for (let i = 0; i < 8; i++) { r = E.result(c, i < wins); if (r && r.done) break; } return r; };
// 1 edition
{ const c = E.newCareer({ level: 6, week: 52, bank: 1e6 }); const r = playWorlds(c, 7); const h = c.history[c.history.length - 1];
  if (!r.up || !r.up.champion || h.ed !== 1) f.push('1 a Worlds record carries its edition ' + JSON.stringify(h));
  c.week = 52; if (E.calendar(c).some(e => e.id === 'worlds')) f.push('1 a save back at week 52 with this year\'s Worlds already played can enter it again');
  c.week = 104; if (!E.calendar(c).some(e => e.id === 'worlds')) f.push('1 next year\'s Worlds (edition 2) must be on');
  const q = E.newCareer({ level: 5, week: 52, bank: 1e6 }); E.book(q, 'qschool'); for (let i = 0; i < 8; i++) { const rr = E.result(q, false); if (rr.done) break; }
  q.level = 5; q.week = 52; if (E.calendar(q).some(e => e.id === 'qschool')) f.push('1 Q-School twice in one edition');
  // an old save without ed on its record (written before this change) still counts by its week
  const o = E.newCareer({ level: 6, week: 52, history: [{ week: 52, id: 'worlds', level: 6, fin: 'W', prize: 0, pts: 0 }] }); if (E.calendar(o).some(e => e.id === 'worlds')) f.push('1 an old record without ed is not counted'); }
// 2 + 3: 30 cycles
{ const c = E.newCareer({ level: 6, week: 52, bank: 1e6, pts: { dpnz: 1500 }, grants: { 6: 1 } });
  const ev = E.eventOf('worlds'), net = E.cost(ev) - E.prizeFor(ev, 'L128'); let grants = 0, debtSeen = 0, wrongMoney = 0;
  for (let cy = 0; cy < 30; cy++) { c.level = 6; c.week = 52 * (cy + 1); c.pts.dpnz = 1200 + cy * 10; const b0 = c.bank; const r = playWorlds(c, 0);
    if (r.up && r.up.grant) grants++; if (c.debt) debtSeen++; if (b0 - c.bank !== net) wrongMoney++;
    if (c.level !== 3 || c.pts.dpnz !== Math.min(300, Math.round((1200 + cy * 10) * .4))) f.push('3 cycle ' + cy + ' carry ' + JSON.stringify({ level: c.level, pts: c.pts.dpnz }));
    if (cy === 0) out.carry = c.pts.dpnz; }
  const ws = c.history.filter(h => h.id === 'worlds'); out.cycles = { worlds: ws.length, eds: new Set(ws.map(h => h.ed)).size, grants, debtSeen, wrongMoney, net };
  if (grants || debtSeen || wrongMoney) f.push('2 grant paid again, a debt, or money other than entry + travel - prize across 30 cycles ' + JSON.stringify(out.cycles));
  if (ws.length !== 30 || out.cycles.eds !== 30) f.push('3 Worlds history lost across the resets ' + JSON.stringify(out.cycles)); }
(async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] });
  const url = 'file://' + path.join(dir, 'index.html') + '?s3=1';
  const open = async () => { const ctx = await b.newContext(); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto(url); await p.waitForFunction(() => window.TOPS_S3 && window.C3, null, { timeout: 120000 }); await p.waitForTimeout(1200); return { ctx, p, errs }; };
  const snap = p => p.evaluate(() => { const k = career().circuit; const w = k.history.filter(h => h.id === 'worlds'); return { level: k.level, tier: career().tier, week: k.week, pts: k.pts.dpnz, ev: k.dpnzEv, bank: career().bank, worlds: w.length, ed: w.length ? w[w.length - 1].ed : null, grants: k.grants, worldsOn: TOPS_S3.view().calendar.some(e => e.id === 'worlds'), cal: TOPS_S3.view().calendar.length }; });
  // device A: at the Palace, keep a copy from before the Worlds (for device B), lose it, reload
  const A = await open();
  const before = await A.p.evaluate(() => { save.authSeen = true; newCareer(); const c = career(), k = c.circuit; k.level = 6; c.tier = 6; k.week = 52; c.bank = 5000; k.grants = { 3: 1, 4: 1, 6: 1 }; k.pts = { dpnz: 1500 }; k.res = { dpnz: [400, 400, 300, 200, 200] }; k.dpnzEv = 8; persist(); return JSON.stringify(save); });
  const res = await A.p.evaluate(() => { const bk = TOPS_S3.book('worlds'); TOPS_S3._playNow(); S.won = false; S.p[0].legs = 4; S.p[1].legs = 5; S.p[0].darts = 120; S.p[0].pts = 3000; careerAfterMatch(); S.done = true; persist(); return { book: bk && bk.ok, json: JSON.stringify(save) }; });
  const a1 = await snap(A.p);
  await A.p.reload(); await A.p.waitForFunction(() => window.TOPS_S3 && window.C3, null, { timeout: 120000 }); await A.p.waitForTimeout(1200); const a2 = await snap(A.p);
  out.a = { a1, a2 };
  if (!res.book || a1.level !== 3 || a1.week !== 53 || a1.pts !== 300 || a1.worlds !== 1 || a1.ed !== 1 || a1.worldsOn || !a1.cal) f.push('4 after the lost Worlds ' + JSON.stringify(a1));
  if (JSON.stringify(a1) !== JSON.stringify(a2)) f.push('4 reload changed the state ' + JSON.stringify({ a1, a2 }));
  // device B: has the older copy (Palace, week 52, Worlds on), then adopts the newer one the way a cloud copy replaces the save
  const B = await open();
  const b0 = await B.p.evaluate(j => { Object.keys(save).forEach(k => delete save[k]); Object.assign(save, JSON.parse(j)); persist(); const k = career().circuit; return { level: k.level, worldsOn: TOPS_S3.view().calendar.some(e => e.id === 'worlds') }; }, before);
  await B.p.evaluate(j => { Object.keys(save).forEach(k => delete save[k]); Object.assign(save, JSON.parse(j)); persist(); }, res.json);
  await B.p.reload(); await B.p.waitForFunction(() => window.TOPS_S3 && window.C3, null, { timeout: 120000 }); await B.p.waitForTimeout(1200); const b1 = await snap(B.p);
  // and if that device is wound back to week 52 at the Palace (an older reload), this year's Worlds is still not on
  const b2 = await B.p.evaluate(() => { const k = career().circuit; const keep = { l: k.level, w: k.week }; k.level = 6; k.week = 52; const on = TOPS_S3.view().calendar.some(e => e.id === 'worlds'); k.level = keep.l; k.week = keep.w; return on; });
  out.b = { b0, b1, b2 };
  if (!b0.worldsOn || b0.level !== 6) f.push('5 setup: device B should start at the Palace with the Worlds on ' + JSON.stringify(b0));
  if (JSON.stringify(b1) !== JSON.stringify(a1)) f.push('5 device B after adopting differs from device A ' + JSON.stringify({ a1, b1 }));
  if (b2) f.push('5 device B wound back to week 52 can enter this year\'s Worlds again');
  if (A.errs.length || B.errs.length) f.push('page errors ' + [...A.errs, ...B.errs].slice(0, 2).join(' | '));
  await b.close();
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
  console.log(`PASS: yearly events record their edition (Worlds W at week 52 = edition 1; not on again at week 52, on at 104; Q-School the same; old records without ed count by their week); 30 lost-Worlds cycles: grant never paid again, no debt, each cycle costs exactly entry + travel - the first-round prize ($${out.cycles.net}), all 30 Worlds kept in the history (30 editions), carry 40% capped at 300 (first cycle ${out.carry}); a lost Worlds through TOPS_S3 survives a reload unchanged (DPNZ, week 53, 300 points, edition 1, Worlds off); a second device adopting the new copy over its pre-Worlds copy matches it, and wound back to week 52 still can't enter this year's Worlds`);
})();
