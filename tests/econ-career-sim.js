// CAR-WEAK 2: full Season 3 career economy and pace through the real build (Circuit engine, money, XP, levels, stat points, caps).
// What is real: the page's TOPS_S3 booking/play/result path (tc/s3.js + tc/circuit.js), entries, travel, purses, points, grants, the
// hardship advance, careerAfterMatch (XP and levels, CAR-XP), stat points (v09 syncPts/spend, tier caps).
// What is modelled: each match's result. The player's match average comes from the throw sim (sim-player-ft through the real throw on 4.13,
// ramp 20 / Palace 40, 400 matches a cell, three timing profiles: Hayden, mid, Lee) as a function of his stats; the win chance against the
// round's static opponent is the game's own rival model: p = 1 / (1 + 10^((opp - me) / 12)).
// Stat points: v09 syncPts (1 point per player level, run when the hub opens) then spend() on the lowest stat, inside the tier cap.
// Policy: the hub's Play with CAR-DEADWK: rest() when nothing is on, the first affordable event, the hardship advance when broke and
// nothing is owed, else the recovery entry. Stat points spread evenly (lowest stat first),
// no kit bought (kit only adds stats; noted as a limit).
// usage: node tests/econ-career-sim.js <curves.json> [careers per profile=20] [match cap=400] [partial-out.json] > out.json
// a sim, not a gate test: CI runs every tests/*.js with no arguments, so with no curves file it prints its usage and passes
if (!process.argv[2]) { console.log('SKIP (sim, not a test): usage: node ' + require('path').basename(__filename) + ' <curves.json> [careers] ...'); process.exit(0); }
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const CURVES = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const N = +(process.argv[3] || 20), CAP = +(process.argv[4] || 400);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] }); const errs = [];
  const out = {}; const OUTF = process.argv[5];
  for (const who of Object.keys(CURVES)) { out[who] = [];
   for (let n = 0; n < N; n++) { /* a fresh page per career: one page playing hundreds of matches runs out of memory */
    const p = await b.newPage(); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + path.resolve(__dirname, '../index.html') + '?s3=1'); await p.waitForTimeout(4500); await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    let one; try { one = await p.evaluate(({ curve, N, CAP }) => {
      save.authSeen = true; save.lessonDone = true; try { $('login').hidden = true; } catch (e) {} V.walkOn = () => {};
      try { window.showMsg = (m, cb) => { try { cb && cb('ok'); } catch (e) {} }; } catch (e) {}
      const A = v => { const xs = curve.map(r => r[0]), ys = curve.map(r => r[1]); if (v <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (v <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (v - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[ys.length - 1]; };
      const API = window.TOPS_ST2_API, ids = ['sc', 'fi', 'ct', 'rh', 'co'];
      const runs = [];
      for (let n = 0; n < N; n++) {
        newCareer(); const c = career(); TOPS_S3.view();
        const lv = {}; let m = 0, stuckWeeks = 0, deadWeeks = 0, mmTot = 0, recTot = 0, advances = 0, champion = false, end = 'cap';
        const L = () => c.circuit.level; const rec = () => (lv[L()] = lv[L()] || { matches: 0, events: 0, wins: 0, weeks0: c.circuit.week, bankIn: c.bank, bankMin: c.bank, cost: 0, prize: 0, adv: 0, statIn: null, plvIn: C3.V3().lv });
        while (m < CAP) {
          // spend stat points like a player who levels evenly
          try { const s = save.st2; if (s) { const pl = C3.V3().lv; if (pl > s.lvSeen) { s.bank += pl - s.lvSeen; s.lvSeen = pl; } /* = v09 syncPts, which the hub runs */ let g = 0; while (s.bank > 0 && g < 50) { g++; const o = ids.slice().sort((a, b) => s.v[a] - s.v[b]); let done = false; for (const id of o) if (API.spend(id)) { done = true; break; } if (!done) break; } } } catch (e) {}
          const r = rec(); const sv = save.st2 ? save.st2.v : { sc: 20, fi: 20, ct: 20, rh: 20 }; const stat = (sv.sc + sv.fi + sv.ct + sv.rh) / 4; if (r.statIn == null) r.statIn = +stat.toFixed(1);
          const k = c.circuit;
          if (!k.live) { let v = TOPS_S3.view();
            if (v.rest) { const rr = TOPS_S3.rest(); if (!rr || !rr.ok) { end = 'stall: rest failed L' + L() + ' wk ' + k.week; break; } r.rest = (r.rest || 0) + 1; r.restWeeks = (r.restWeeks || 0) + rr.skipped; v = TOPS_S3.view(); }
            let e = v.calendar.find(x => x.canAfford);
            if (!e && !k.debt) { const a = TOPS_S3.advance(); if (a && a.ok) { advances++; r.adv++; v = TOPS_S3.view(); e = v.calendar.find(x => x.canAfford); } }
            if (e) { const b0 = c.bank; const bk = TOPS_S3.book(e.id); if (!bk || !bk.ok) { end = 'stall: book failed L' + L(); break; } r.cost += b0 - c.bank; }
            else { const rc = TOPS_S3.recover(); if (!rc || !rc.ok) { end = 'stall: broke, no recovery L' + L() + ' bank ' + c.bank; break; } r.rec = (r.rec || 0) + 1; recTot++; }
            r.events++; r.bankMin = Math.min(r.bankMin, c.bank); }
          if (!TOPS_S3._playNow()) { end = 'play failed'; break; }
          const me = A(stat), opp = S.oppAvg || (S.p[1] && S.p[1].avg) || 50; const pw = 1 / (1 + Math.pow(10, (opp - me) / 12)); const won = Math.random() < pw;
          const legs = Math.ceil((S.bestOf || 3) / 2); S.won = won; S.p[0].legs = won ? legs : Math.max(0, legs - 1); S.p[1].legs = won ? Math.max(0, legs - 1) : legs;
          const darts = 18 * (S.p[0].legs + S.p[1].legs); S.p[0].darts = darts; S.p[0].pts = Math.round(me / 3 * darts);
          const lvl0 = L(), bank0 = c.bank; careerAfterMatch(); S.done = true; m++; const rr = lv[lvl0]; rr.matches++; if (won) rr.wins++;
          const d = c.bank - bank0; if (d > 0) rr.prize += d; rr.bankMin = Math.min(rr.bankMin, c.bank);
          if (L() !== lvl0) { rr.weeks = c.circuit.week - rr.weeks0; rr.bankOut = c.bank; rr.statOut = +stat.toFixed(1); rr.plvOut = C3.V3().lv; }
          const last = c.circuit.history[c.circuit.history.length - 1]; if (S.s3res && S.s3res.up && S.s3res.up.champion) { champion = true; end = 'champion'; break; }
          if (last && last.id === 'worlds' && last.fin === 'W') { champion = true; end = 'champion'; break; }
        }
        Object.values(lv).forEach(x => { if (x.weeks == null) { x.weeks = c.circuit.week - x.weeks0; x.bankOut = c.bank; x.plvOut = C3.V3().lv; } delete x.weeks0; });
        runs.push({ matches: m, champion, end, finalLevel: L(), bank: c.bank, plv: C3.V3().lv, stats: save.st2 ? Object.assign({}, save.st2.v) : null, advances, stuckWeeks, deadWeeks, mm: mmTot, rec: recTot, weeks: c.circuit.week, lv });
      }
      return runs[0];
    }, { curve: CURVES[who], N: 1, CAP }); } catch (e) { one = { error: String(e.message || e).slice(0, 120) }; }
    out[who].push(one); await p.close(); if (OUTF) fs.writeFileSync(OUTF, JSON.stringify(out));
   }
  }
  await b.close();
  if (errs.length) out._errors = errs.slice(0, 5);
  console.log(JSON.stringify(out));
})();
