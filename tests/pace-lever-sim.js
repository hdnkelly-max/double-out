// CAR-WEAK 3 pace diagnosis (Producer 14:39): the real Circuit engine (tc/circuit.js) in node, many careers fast, one lever at a time.
// Real: calendar, booking, entry + travel, purses, points (best N), promotion rules, DPNZ OOM vs the 12 seeded rivals, Trans-Tasman,
//   grants, advance and the recovery entry (CAR-DEADWK), rest weeks.
// Modelled (calibrated to the page sim, tests/econ-career-sim.js): XP per match = (60 + 100 if won) x XPMUL[level] + 60 deciding leg on a win
//   (the page harness plays every match to the deciding leg), levels by lvNeed, 1 stat point a level spent on the lowest of 5 stats with
//   gainAt() inside the tier cap (v09 CAPS), match average = the throw-sim curve at the mean of sc/fi/ct/rh, win chance = 1/(1+10^((opp-me)/12)).
// Variants patch the engine's constants (text-level, so the real rule code runs): see VARIANTS below.
// curves: tests/profiles/pace-curves.json (match average by stat for weak = Hayden's timing, mid, strong = Lee's timing, zero = loses every match)
// usage: node tests/pace-lever-sim.js <curves.json> [careers=300] [variant,variant...] > out.json
// a sim, not a gate test: CI runs every tests/*.js with no arguments, so with no curves file it prints its usage and passes
if (!process.argv[2]) { console.log('SKIP (sim, not a test): usage: node ' + require('path').basename(__filename) + ' <curves.json> [careers] ...'); process.exit(0); }
const fs = require('fs'), path = require('path');
const CURVES = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const N = +(process.argv[3] || 300);
const SHIFT = process.env.NOSHIFT ? 0 : 1;
const SRC0 = fs.readFileSync(path.resolve(__dirname, '../tc/circuit.js'), 'utf8');
// car-worlds has the lost-Worlds rule built in: put the old rule back as the engine baseline so every variant starts from today's live rules
const NEWRULE = /    \/\/ CAR-WEAK 3 \(1\)[\s\S]*?r\.fromWorlds = fin; return r; \}/;
const SRC = NEWRULE.test(SRC0) ? SRC0.replace(NEWRULE, "    if (L.id === 'palace') return fin === 'W' ? { champion: true, msg: 'World Champion. Champion’s Year starts next season' } : null;") : SRC0;
function engine(patch) { let s = patch.raw ? SRC0 : SRC; for (const [a, b] of patch.text || []) { if (!s.includes(a)) throw new Error('patch miss: ' + a); s = s.replace(a, b); }
  const m = { exports: {} }; new Function('module', 'exports', s)(m, m.exports); const E = m.exports; if (patch.data) patch.data(E.LEVELS, E); if (patch.caps) E._caps = patch.caps; return E; }
const XPMUL = [1, 1.25, 1.5, 2, 2.5, 3.5, 5], CAPS = [40, 50, 60, 68, 75, 80, 82];
const lvNeed = L => Math.round(150 + 25 * L + .6 * L * L), gainAt = v => Math.max(2, Math.min(6, Math.round((100 - v) / 9)));
// the game maps every career opponent into its tier band (v11.js v1.77 shift, Season 2 and 3 alike): Pub QF 44 plays as 54
const BAND = [[50, 58], [56, 64], [62, 70], [68, 76], [74, 82], [80, 90], [88, 100]], CEN = [58, 63, 69, 76, 84, 91, 97], TAVG = [52, 65, 75, 85, 91, 95, 101];
const CENX = process.env.CEN ? JSON.parse(process.env.CEN) : null;
const shift = (v, k) => { if (CENX) { const [lo, hi] = BAND[k], c0 = CENX[k], adj = c0 - (lo + hi) / 2, rel = Math.max(-10, Math.min(10, v - TAVG[k])) * .5; return Math.round(Math.max(Math.max(20, lo + adj), Math.min(hi + adj, c0 + rel))); } const [lo, hi] = BAND[k], adj = CEN[k] - (lo + hi) / 2, rel = Math.max(-10, Math.min(10, v - TAVG[k])) * .5; return Math.round(Math.max(Math.max(20, lo + adj), Math.min(hi + adj, CEN[k] + rel))); };
const PALACE_BACK = ["if (L.id === 'palace') return fin === 'W' ? { champion: true, msg: 'World Champion. Champion’s Year starts next season' } : null;",
  "if (L.id === 'palace') { if (fin === 'W') return { champion: true, msg: 'World Champion. Champion’s Year starts next season' }; newDpnzSeason(c); return promote(c, 3, 'Back to the DPNZ Tour'); }"];
const DPNZ_NEED = n => ["if (L.id === 'dpnz') { c.dpnzEv = (c.dpnzEv || 0) + 1;", "if (L.id === 'dpnz' && (c.pts.dpnz || 0) >= " + n + " && played >= 2) return promote(c, 6, 'DPNZ points: the Palace'); if (L.id === 'dpnz') { c.dpnzEv = (c.dpnzEv || 0) + 1;"];
// (b) recovery entries earn a share of ranking points; (a) a debt cap of K x the level's cheapest trip: at the cap the entry is still
// offered (no dead end) but adds no debt and earns no points ("the tour covers it")
const REC_PTS = m => ["const prize = prizeFor(e, fin), pts = pointsFor(e, fin);", "const prize = prizeFor(e, fin), pts = Math.round(pointsFor(e, fin) * (lv.capped ? 0 : lv.recovery ? " + m + " : 1));"];
const DEBT_CAP = k => ["c.debt = (c.debt || 0) + e.cost; c.recovered = (c.recovered || 0) + 1; c.live.recovery = 1;",
  "const capAmt = " + k + " * LEVELS[c.level].events.map(cost).sort((a, b) => a - b)[0]; if ((c.debt || 0) + e.cost > capAmt) { c.live.capped = 1; } else c.debt = (c.debt || 0) + e.cost; c.recovered = (c.recovered || 0) + 1; c.live.recovery = 1;"];
const lv = (L, id) => L.find(x => x.id === id);
const VARIANTS = {
  base: {},
  // economy follow-ups, on the live rules (Palace loss stays at the Palace) and with (1) (raw = this branch's engine)
  recHalf: { text: [REC_PTS(.5)] }, recZero: { text: [REC_PTS(0)] }, cap6: { text: [DEBT_CAP(6)] }, cap6half: { text: [DEBT_CAP(6), REC_PTS(.5)] }, cap10half: { text: [DEBT_CAP(10), REC_PTS(.5)] },
  pubBest10: { text: [["const BEST_N = { pub: 99,", "const BEST_N = { pub: 10,"]] }, pubBest12: { text: [["const BEST_N = { pub: 99,", "const BEST_N = { pub: 12,"]] },
  pubBest6: { text: [["const BEST_N = { pub: 99,", "const BEST_N = { pub: 6,"]] }, pubBest8: { text: [["const BEST_N = { pub: 99,", "const BEST_N = { pub: 8,"]] },
  winToScore: { text: [["const prize = prizeFor(e, fin), pts = pointsFor(e, fin);", "const prize = prizeFor(e, fin), pts = lv.results.some(x => x.won) ? pointsFor(e, fin) : 0;"]] },
  W_pubBest6cap6half: { raw: true, text: [["const BEST_N = { pub: 99,", "const BEST_N = { pub: 6,"], DEBT_CAP(6), REC_PTS(.5)] },
  W_carry25: { raw: true, text: [['const DPNZ_CARRY = .4,', 'const DPNZ_CARRY = .25,']] }, W_carry50: { raw: true, text: [['const DPNZ_CARRY = .4,', 'const DPNZ_CARRY = .5,']] }, W_carry40nocap: { raw: true, text: [['DPNZ_CARRY_CAP = 300;', 'DPNZ_CARRY_CAP = 1e9;']] },
  cap6z: { text: [DEBT_CAP(6), REC_PTS(1)] }, W_cap6z: { raw: true, text: [DEBT_CAP(6), REC_PTS(1)] }, W_recHalf_only: { raw: true, text: [REC_PTS(.5)] }, W_pubBest12: { raw: true, text: [["const BEST_N = { pub: 99,", "const BEST_N = { pub: 12,"]] },
  W_base: { raw: true }, W_recHalf: { raw: true, text: [REC_PTS(.5)] }, W_recZero: { raw: true, text: [REC_PTS(0)] }, W_cap6half: { raw: true, text: [DEBT_CAP(6), REC_PTS(.5)] }, W_cap10half: { raw: true, text: [DEBT_CAP(10), REC_PTS(.5)] },

  // the engine exactly as it is on this branch (car-worlds: the lost-Worlds rule in tc/circuit.js), no patches
  branch: { raw: true },
  branch_wtravel0: { raw: true, text: [['entry: 0, travel: 3000, purse: 300000', 'entry: 0, travel: 0, purse: 300000']] }, branch_pub6_wtravel0: { raw: true, text: [['entry: 0, travel: 3000, purse: 300000', 'entry: 0, travel: 0, purse: 300000'], ['const BEST_N = { pub: 99,', 'const BEST_N = { pub: 6,']] },
  branch_pub6: { raw: true, text: [['const BEST_N = { pub: 99,', 'const BEST_N = { pub: 6,']] }, branch_pub5: { raw: true, text: [['const BEST_N = { pub: 99,', 'const BEST_N = { pub: 5,']] },
  // (1) a lost Worlds sends you back to the DPNZ Tour (new season, 40% carry)
  worldsBack: { text: [PALACE_BACK] },
  // DPNZ season length (OOM decided after N events instead of 8)
  dpnz4: { text: [PALACE_BACK, ['const DPNZ_SEASON = 8;', 'const DPNZ_SEASON = 4;']] },
  dpnz3: { text: [PALACE_BACK, ['const DPNZ_SEASON = 8;', 'const DPNZ_SEASON = 3;']] },
  // qualification: top 2 on the OOM to the Palace (instead of #1)
  top2: { text: [PALACE_BACK, ["if (r === 1) return promote(c, 6,", "if (r <= 2) return promote(c, 6,"]] },
  // qualification: Trans-Tasman semi-final also goes to the Palace
  ttSF: { text: [PALACE_BACK, ["if (fin === 'W' || fin === 'F') return promote(c, 6,", "if (fin === 'W' || fin === 'F' || fin === 'SF') return promote(c, 6,"]] },
  // DPNZ as a points level: reach 'need' (best 6) for the Palace route; OOM still at season end
  dpnzNeed1000: { text: [PALACE_BACK, ["if (L.id === 'dpnz') { c.dpnzEv = (c.dpnzEv || 0) + 1;", "if (L.id === 'dpnz' && (c.pts.dpnz || 0) >= 1000 && played >= 2) return promote(c, 6, 'DPNZ points: the Palace'); if (L.id === 'dpnz') { c.dpnzEv = (c.dpnzEv || 0) + 1;"]] },
  dpnzNeed800: { text: [PALACE_BACK, ["if (L.id === 'dpnz') { c.dpnzEv = (c.dpnzEv || 0) + 1;", "if (L.id === 'dpnz' && (c.pts.dpnz || 0) >= 800 && played >= 2) return promote(c, 6, 'DPNZ points: the Palace'); if (L.id === 'dpnz') { c.dpnzEv = (c.dpnzEv || 0) + 1;"]] },
  // the need lever, stacked smallest first: DPNZ points route 400 (best 6, 2 events min) -> + Opens need 150 -> + Pub need 75
  need1: { text: [PALACE_BACK, DPNZ_NEED(400)] },
  need2: { text: [PALACE_BACK, DPNZ_NEED(400)], data: L => { lv(L, 'opens').need = 150; } },
  need3: { text: [PALACE_BACK, DPNZ_NEED(400)], data: L => { lv(L, 'opens').need = 150; lv(L, 'pub').need = 75; } },
  need3b: { text: [PALACE_BACK, DPNZ_NEED(500)], data: L => { lv(L, 'opens').need = 180; lv(L, 'pub').need = 90; } },
  need3_300: { text: [PALACE_BACK, DPNZ_NEED(300)], data: L => { lv(L, 'opens').need = 150; lv(L, 'pub').need = 75; } },
  need3_250: { text: [PALACE_BACK, DPNZ_NEED(250)], data: L => { lv(L, 'opens').need = 150; lv(L, 'pub').need = 75; } },
  // not a pace lever (stats/difficulty, HIGH): the Opens stat cap 60 -> 65 so a mid player arrives at the DPNZ nearer 50%
  need1cap65: { text: [PALACE_BACK, DPNZ_NEED(400)], caps: [40, 50, 65, 68, 75, 80, 82] },
  need3cap65: { text: [PALACE_BACK, DPNZ_NEED(400)], data: L => { lv(L, 'opens').need = 150; lv(L, 'pub').need = 75; }, caps: [40, 50, 65, 68, 75, 80, 82] },
  opens150: { text: [PALACE_BACK], data: L => { lv(L, 'opens').need = 150; } },
  pub75need: { text: [PALACE_BACK], data: L => { lv(L, 'pub').need = 75; } },
  dpnzNeed400: { text: [PALACE_BACK, DPNZ_NEED(400)] },
  // Opens: one event can be enough (minEv 2 -> 1)
  opensMin1: { text: [PALACE_BACK], data: L => { lv(L, 'opens').minEv = 1; } },
  // Pub: league night worth 75 (two wins instead of three)
  pub75: { text: [PALACE_BACK], data: L => { lv(L, 'pub').events[0].pts = 75; } },
};
function career(E, curve, cap) {
  const A = v => { const xs = curve.map(r => r[0]), ys = curve.map(r => r[1]); if (v <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (v <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (v - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[ys.length - 1]; };
  const c = E.newCareer({ bank: 60 }); const st = { sc: 20, fi: 20, ct: 20, rh: 20, co: 20 }; let plv = 1, xp = 0, pts = 0, seen = 1;
  const out = { lv: {}, matches: 0, palaceAt: null, champion: false, worlds: 0, rec: 0, capped: 0, debtMax: 0, recPub: 0, recPts: 0 }; const R = () => (out.lv[c.level] = out.lv[c.level] || { m: 0, w: 0, ev: 0, first: [], last: [], fv: [] });
  let guard = 0;
  while (out.matches < cap && guard++ < 20000) {
    if (plv > seen) { pts += plv - seen; seen = plv; }
    let g = 0; while (pts > 0 && g++ < 50) { const capv = (E._caps || CAPS)[c.level]; const id = Object.keys(st).sort((a, b) => st[a] - st[b])[0]; if (st[id] >= capv) break; st[id] = Math.min(capv, st[id] + gainAt(st[id])); pts--; }
    if (!c.live) { if (E.restNeeded(c)) { const r = E.restWeek(c); if (!r.ok) return Object.assign(out, { end: 'stall' }); }
      let e = E.calendar(c).find(x => x.canAfford);
      if (!e && !c.debt) { const a = E.advance(c); if (a.ok) e = E.calendar(c).find(x => x.canAfford); }
      if (e) E.book(c, e.id); else { const rc = E.recoveryEntry(c); if (!rc.ok) return Object.assign(out, { end: 'stall broke' }); out.rec++; if (c.level === 0) out.recPub++; if (c.live.capped) out.capped++; }
      R().ev++; if (c.live.id === 'worlds') out.worlds++; }
    const o = E.nextOpp(c), me = A((st.sc + st.fi + st.ct + st.rh) / 4); const opp = SHIFT ? shift(o.avg, c.level) : o.avg; const won = Math.random() < 1 / (1 + Math.pow(10, (opp - me) / 12));
    const L0 = c.level, r = R(); r.m++; if (!out.left || !out.left[L0]) { r.m1 = (r.m1 || 0) + 1; r.fv.push(won ? 1 : 0); } if (won) r.w++; (r.first.length < 10 ? r.first : r.last).push(won ? 1 : 0); if (r.last.length > 10) r.last.shift();
    out.matches++; xp += (60 + (won ? 100 : 0)) * XPMUL[L0] + (won ? 60 : 0); while (xp >= lvNeed(plv)) { xp -= lvNeed(plv); plv++; }
    const wasRec = !!(c.live && c.live.recovery); const res = E.result(c, won); out.debtMax = Math.max(out.debtMax, c.debt || 0); if (res && res.done && wasRec) out.recPts += res.pts || 0; if (c.level !== L0) { out.left = out.left || {}; if (!out.left[L0] && c.level > L0) r.up = 1; out.left[L0] = 1; }
    if (res && res.up && res.up.champion) { out.champion = true; break; }
    if (c.level === 6 && L0 !== 6) { out.quals = (out.quals || 0) + 1; if (out.lastQ != null) (out.gaps = out.gaps || []).push(out.matches - out.lastQ); out.lastQ = out.matches; }
    if (c.level === 6 && out.palaceAt == null) out.palaceAt = out.matches;
  }
  out.end = out.champion ? 'champion' : 'cap'; out.bank = c.bank; out.debtEnd = c.debt || 0; out.maxLevel = Math.max(...Object.keys(out.lv).map(Number)); out.plv = plv; return out;
}
const want = (process.argv[4] || Object.keys(VARIANTS).join(',')).split(',');
const res = {};
for (const v of want) { const E = engine(VARIANTS[v]); res[v] = {};
  for (const who of Object.keys(CURVES)) { const runs = []; for (let i = 0; i < N; i++) runs.push(career(E, CURVES[who], 400));
    const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(p * (s.length - 1))] : null; };
    const pa = runs.map(r => r.palaceAt).filter(x => x != null);
    const lvl = {}; for (let L = 0; L <= 6; L++) { const xs = runs.map(r => r.lv[L]).filter(Boolean); if (!xs.length) continue;
      const f = [].concat(...xs.map(x => x.first)), l = [].concat(...xs.filter(x => x.m >= 10).map(x => x.last));
      const fe = [].concat(...xs.map(x => x.fv.slice(0, 10))), fx = [].concat(...xs.filter(x => x.up).map(x => x.fv.slice(-10))); const mean = a => a.length ? +(a.reduce((p, q) => p + q, 0) / a.length).toFixed(2) : null;
      lvl[L] = { reached: xs.length, up: xs.filter(x => x.up).length, cIn: mean(fe), cOut: mean(fx), m1: q(xs.map(x => x.fv.length), .5), mMed: q(xs.map(x => x.m), .5), m1Med: q(xs.map(x => x.m1 || 0), .5), evMed: q(xs.map(x => x.ev), .5), win: +(xs.reduce((s, x) => s + x.w, 0) / xs.reduce((s, x) => s + x.m, 0)).toFixed(2),
        entry: f.length ? +(f.reduce((s, x) => s + x, 0) / f.length).toFixed(2) : null, exit: l.length ? +(l.reduce((s, x) => s + x, 0) / l.length).toFixed(2) : null }; }
    res[v][who] = { palace: pa.length + '/' + N, toPalaceP50: q(pa, .5), toPalaceP25: q(pa, .25), toPalaceP75: q(pa, .75), champ: runs.filter(r => r.champion).length + '/' + N,
      matchesP50: q(runs.map(r => r.matches), .5), bankP50: q(runs.map(r => r.bank), .5), worldsP50: q(runs.map(r => r.worlds), .5), qualsP50: q(runs.map(r => r.quals || 0), .5), gapP50: q([].concat(...runs.map(r => r.gaps || [])), .5), stalls: runs.filter(r => /stall/.test(r.end || '')).length, recP50: q(runs.map(r => r.rec), .5), recPubP50: q(runs.map(r => r.recPub), .5), cappedP50: q(runs.map(r => r.capped), .5), debtMaxP50: q(runs.map(r => r.debtMax), .5), debtMaxP90: q(runs.map(r => r.debtMax), .9), debtMaxMax: Math.max(...runs.map(r => r.debtMax)), debtEndP50: q(runs.map(r => r.debtEnd), .5), recPtsP50: q(runs.map(r => r.recPts), .5), reachClub: runs.filter(r => r.maxLevel >= 1).length, reachDpnz: runs.filter(r => r.maxLevel >= 3).length, clubAtP50: q(runs.map(r => r.lv[0] ? r.lv[0].m : null).filter(x => x != null), .5), lvl }; } }
console.log(JSON.stringify(res));
