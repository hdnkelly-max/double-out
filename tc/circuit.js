/* TOPS Season 3 · The Circuit (career rework) · data + engine
   Brief: claude/director/08-circuit-economy.md. Owner: Director (prototype), Career (wiring).
   Pure functions over a plain state object, so it runs in the game, in the prototype page and in node tests.
   Rules (Hayden): fields are static by level and event, never read from the player's average. The throw is untouched.
   Ranking points come from your finish in each event only. Every dollar has a job: entry and travel are the main cost.
   Career 19 Nov (Hayden 07:33/07:45): Season 3 is a full reset (everyone starts at the Pub, banks reset), so the Legacy
   split from the prototype is removed. */
(function (root) {
  'use strict';

  // Finish ladder, best first. 'G' is a group-stage exit (Opens only).
  const FIN = ['W', 'F', 'SF', 'QF', 'L16', 'L32', 'L64', 'L128', 'G'];
  const FIN_NAME = { W: 'Winner', F: 'Runner-up', SF: 'Semi-final', QF: 'Quarter-final', L16: 'Last 16', L32: 'Last 32', L64: 'Last 64', L128: 'Last 128', G: 'Group stage' };
  // a knockout of N players: finishing round names from the first round to the final
  const roundsFor = n => { const r = []; let k = n; while (k >= 2) { r.push(k === 2 ? 'F' : k === 4 ? 'SF' : k === 8 ? 'QF' : 'L' + k); k /= 2; } return r; };

  // money and points ladders by finish, as share of the purse / of the event's points
  const PURSE_SPLIT = { W: .28, F: .14, SF: .07, QF: .035, L16: .016, L32: .008, L64: .004, L128: .002, G: 0 };
  const PTS_SPLIT = { W: 1, F: .6, SF: .36, QF: .2, L16: .1, L32: .05, L64: .02, L128: .01, G: .02 };
  // only your best N results at a level count, so playing more events is not the same as playing well (ChatGPT review)
  const BEST_N = { pub: 6, club: 6, opens: 5, dpnz: 6 }; // Pub best 6 (Producer 22:21): six quarter-final exits make 60, under the 75 need, so a never-winner stays at the Pub

  // ---------------------------------------------------------------------------------------------
  // The seven levels. avg = the static field average (today's TIERS). legs = best-of. need = threshold to move up.
  // Each event: id, n (name), where, kind ('ko' | 'groupko' | 'league'), size (draw), entry, travel, purse, pts, every (weeks)
  const LEVELS = [
    { id: 'pub', n: 'Pub', s: 'Thursday nights at the Kauri Arms', avg: 52, legs: 3, need: 75, minEv: 1, /* pace package (Hayden 15:10): 150 -> 75 */
      up: 'Reach 75 Kauri points, or win the Kauri Cup',
      events: [
        { id: 'pub_night', n: 'Kauri Arms league night', where: 'The Kauri Arms', kind: 'ko', size: 8, entry: 5, travel: 0, purse: 120, pts: 50, every: 1, field: -2 },
        { id: 'kauri_cup', n: 'The Kauri Cup', where: 'The Kauri Arms', kind: 'ko', size: 16, entry: 10, travel: 0, purse: 600, pts: 150, every: 4, jump: true, field: 2 }
      ] },
    { id: 'club', n: 'Club', s: 'RSA club nights, interclub and the association Open', avg: 65, legs: 3, need: 150, minEv: 2,
      up: 'Reach 150 association points (your best 6 nights count) to be named in the rep squad',
      events: [
        { id: 'club_night', n: 'RSA club night', where: 'Henderson RSA', kind: 'ko', size: 8, entry: 20, travel: 10, purse: 700, pts: 80, every: 1, field: -3 },
        { id: 'interclub', n: 'Interclub · Auckland association', where: 'Rotating clubs', kind: 'ko', size: 16, entry: 15, travel: 20, purse: 1200, pts: 120, every: 2, field: 0 },
        { id: 'assoc_open', n: 'Waitākere Open', where: 'Henderson RSA', kind: 'ko', size: 32, entry: 30, travel: 10, purse: 3000, pts: 260, every: 4, jump: true, field: 3 }
      ] },
    { id: 'opens', n: 'Regional Opens', s: 'NZDC-ranked weekend Opens around the North Island', avg: 75, legs: 5, need: 150, minEv: 2, /* pace package: 260 -> 150 */
      up: 'Reach 150 NZ Opens points (your best 5 Opens count) for a DPNZ Tour place',
      events: [
        { id: 'northland', n: 'Northland Open', where: 'Whangārei', kind: 'groupko', size: 32, entry: 30, travel: 90, purse: 2600, pts: 260, every: 3, field: -3 },
        { id: 'waikato', n: 'Waikato Open', where: 'Hamilton', kind: 'groupko', size: 32, entry: 30, travel: 70, purse: 3200, pts: 340, every: 3, field: 0 },
        { id: 'bop', n: 'Bay of Plenty Open', where: 'Tauranga', kind: 'groupko', size: 32, entry: 30, travel: 110, purse: 2600, pts: 260, every: 3, field: -3 },
        { id: 'manawatu', n: 'Manawatū Open', where: 'Palmerston North', kind: 'groupko', size: 32, entry: 40, travel: 180, purse: 4000, pts: 420, every: 3, field: 3 },
        { id: 'hb', n: 'Hawke’s Bay Open', where: 'Napier', kind: 'groupko', size: 32, entry: 30, travel: 160, purse: 3600, pts: 360, every: 3, field: 1 },
        { id: 'akl_open', n: 'Auckland Open', where: 'Auckland', kind: 'groupko', size: 64, entry: 40, travel: 40, purse: 6000, pts: 420, every: 6, jump: true, field: 4 }
      ] },
    { id: 'dpnz', n: 'DPNZ Tour', s: 'Six weekends, two events each. #1 on the Order of Merit goes to the Palace', avg: 85, legs: 5, need: 900, minEv: 2, oom: true,
      up: 'Reach 400 DPNZ points (best 6, at least 2 events this season) with a semi-final or better, or finish #1 on the Order of Merit, for the Palace. Top 10 earns the Trans-Tasman',
      events: [
        { id: 'dpnz_wlg', n: 'DPNZ Tour · Wellington', where: 'Wellington', kind: 'ko', size: 32, entry: 60, travel: 380, purse: 8000, pts: 400, every: 1, field: 1 },
        { id: 'dpnz_ham', n: 'DPNZ Tour · Hamilton', where: 'Hamilton', kind: 'ko', size: 32, entry: 60, travel: 150, purse: 8000, pts: 400, every: 1 },
        { id: 'dpnz_akl', n: 'DPNZ Tour · Auckland', where: 'Auckland', kind: 'ko', size: 32, entry: 60, travel: 120, purse: 8000, pts: 400, every: 1, field: 2 },
        { id: 'dpnz_rot', n: 'DPNZ Tour · Rotorua', where: 'Rotorua', kind: 'ko', size: 32, entry: 60, travel: 220, purse: 8000, pts: 400, every: 1 },
        { id: 'dpnz_chc', n: 'DPNZ Tour · Christchurch', where: 'Christchurch', kind: 'ko', size: 32, entry: 60, travel: 420, purse: 8000, pts: 400, every: 1 },
        { id: 'dpnz_dun', n: 'DPNZ Tour · Dunedin', where: 'Dunedin', kind: 'ko', size: 32, entry: 60, travel: 450, purse: 8000, pts: 400, every: 1 }
      ] },
    { id: 'tt', n: 'Trans-Tasman', s: 'One Brisbane weekend: top 8 NZ v top 8 AUS', avg: 88, legs: 7, need: 0, minEv: 1,
      up: 'Reach the semi-finals for the Palace (all four semi-finalists go)',
      events: [
        { id: 'tt_bne', n: 'Trans-Tasman Championship', where: 'Brisbane', kind: 'ko', size: 16, entry: 150, travel: 700, purse: 40000, pts: 0, every: 1 }
      ] },
    { id: 'card', n: 'Tour Card', s: 'Optional: Q-School, then the Pro Tour from a UK base', avg: 95, legs: 7, need: 0, minEv: 4, oom: true,
      up: 'Finish in the top 32 of the Pro Tour Order of Merit for a seeded Palace place',
      events: [
        { id: 'qschool', n: 'Q-School', where: 'Leicester', kind: 'ko', size: 128, entry: 1100, travel: 2600, purse: 0, pts: 0, every: 52, card: true }, // CAR-CARD: once a year, not once a career (no card + Q-School used was a dead end)
        { id: 'pc_wigan', n: 'Players Championship · Wigan', where: 'Wigan', kind: 'ko', size: 64, entry: 120, travel: 450, purse: 40000, pts: 0, every: 1, needCard: true },
        { id: 'pc_mk', n: 'Players Championship · Milton Keynes', where: 'Milton Keynes', kind: 'ko', size: 64, entry: 120, travel: 450, purse: 40000, pts: 0, every: 1, needCard: true },
        { id: 'pc_hild', n: 'Players Championship · Hildesheim', where: 'Hildesheim', kind: 'ko', size: 64, entry: 120, travel: 900, purse: 40000, pts: 0, every: 2, needCard: true }
      ] },
    { id: 'palace', n: 'The Palace', s: 'The World Championship: seven rounds, lose once and it’s over', avg: 101, legs: 9, need: 0, minEv: 1,
      up: 'Win it for Champion’s Year',
      events: [
        { id: 'worlds', n: 'World Championship', where: 'The Palace · London', kind: 'ko', size: 128, entry: 0, travel: 3000, purse: 300000, pts: 0, every: 52 }
      ] }
  ];
  // Pro Tour and Trans-Tasman pay prize money into the Order of Merit (two-year, real PDC style), not points
  const OOM_BY_MONEY = { card: true, tt: true };

  // ---------------------------------------------------------------------------------------------
  // field strength by round: early rounds sit below the level average, the final above it (static, by round only)
  function oppAvg(level, round, rounds, field) {
    const L = LEVELS[level], k = rounds <= 1 ? 1 : round / (rounds - 1); // 0..1
    return Math.round(L.avg + (field || 0) - 6 + 12 * k);
  }
  const eventOf = id => { for (let i = 0; i < LEVELS.length; i++) { const e = LEVELS[i].events.find(x => x.id === id); if (e) return Object.assign({ level: i }, e); } return null; };
  const cost = e => e.entry + e.travel;
  const shareTotal = size => { let t = 0; ['W', 'F', 'SF', 'QF', 'L16', 'L32', 'L64', 'L128'].forEach((f, i) => { const cnt = i === 0 ? 1 : Math.pow(2, i - 1); if (Math.pow(2, i) <= size) t += PURSE_SPLIT[f] * cnt; }); return t; };
  const prizeFor = (e, fin) => { const sz = e.kind === 'groupko' ? e.size / 2 : e.size; return Math.round(e.purse * (PURSE_SPLIT[fin] || 0) / Math.max(1, shareTotal(sz)) / 5) * 5; };
  const pointsFor = (e, fin) => Math.round(e.pts * (PTS_SPLIT[fin] || 0));

  // ---------------------------------------------------------------------------------------------
  // career state: { level, week, bank, pts:{levelId:n}, oom:{}, card:false, history:[], booked:null, live:null }
  function newCareer(o) {
    return Object.assign({ level: 0, week: 1, bank: 60, pts: {}, oom: {}, card: false, history: [], booked: null, live: null, seen: {} }, o || {});
  }
  // what's on this week at your level (and the next level's events you've been invited to)
  function calendar(c) {
    const L = LEVELS[c.level];
    // events every 2-6 weeks are open for two weeks (the week and the one after); a yearly event (every 52: the Worlds, Q-School) runs on
    // ONE week a year; finishing any event moves the week on, so it can't be entered twice (Q&D P1: on weeks 52 and 53 a World Champion could book and win the Worlds again straight away)
    return L.events.filter(e => (e.every >= 52 ? c.week % e.every === 0 && !playedEdition(c, e)
        : (c.week % e.every === 0 || e.every === 1 || (e.every > 1 && c.week % e.every === 1)))
      && !(e.once && c.history.some(h => h.id === e.id)) && !(e.needCard && !c.card) && !(e.card && c.card))
      .map(e => Object.assign({ level: c.level, cost: costFor(c, e), canAfford: c.bank >= costFor(c, e) }, e, fundedTrip(c, e) ? { funded: true } : {}));
  }
  // book an event: pay entry + travel up front
  function book(c, id) {
    const e = eventOf(id); if (!e) throw new Error('no event ' + id);
    const pay = costFor(c, e), funded = fundedTrip(c, e);
    if (c.bank < pay) return { ok: false, why: 'Not enough in the tour budget' };
    c.bank -= pay; c.booked = id; if (funded) c.wfundUsed = c.wfund; // the package pays this edition's trip once, straight to the travel, never into the bank
    const rounds = e.kind === 'groupko' ? ['G'].concat(roundsFor(e.size / 2)) : roundsFor(e.size);
    c.live = { id, round: 0, rounds, lost: false, results: [], paid: pay }; if (funded) c.live.funded = 1;
    return { ok: true, live: c.live };
  }
  // the next opponent for the live event: static by level and round
  function nextOpp(c) {
    const lv = c.live; if (!lv) return null; const e = eventOf(lv.id);
    return { round: lv.rounds[lv.round], avg: oppAvg(e.level, lv.round, lv.rounds.length, e.field), legs: LEVELS[e.level].legs };
  }
  // report a match result for the live event. A group stage needs 2 wins from 3.
  function result(c, won) {
    const lv = c.live; if (!lv) return null;
    const r = lv.rounds[lv.round];
    if (r === 'G') {
      lv.g = lv.g || { w: 0, p: 0 }; lv.g.p++; if (won) lv.g.w++; lv.results.push({ r, won });
      if (lv.g.w >= 2) { lv.round++; return { next: true }; }
      if (lv.g.p - lv.g.w >= 2) return finish(c, 'G');
      return { next: true, group: lv.g };
    }
    lv.results.push({ r, won });
    if (!won) return finish(c, r);
    if (r === 'F') return finish(c, 'W');
    lv.round++; return { next: true };
  }
  // the event is over: pay prize money, award points, move the week on, check promotion
  function finish(c, fin) {
    const lv = c.live, e = eventOf(lv.id), L = LEVELS[e.level];
    const prize = prizeFor(e, fin), pts = pointsFor(e, fin);
    c.bank += prize; repay(c, prize);
    c.res = c.res || {}; (c.res[L.id] = c.res[L.id] || []).push(pts);
    c.pts[L.id] = c.res[L.id].slice().sort((a, b) => b - a).slice(0, BEST_N[L.id] || 99).reduce((s, x) => s + x, 0);
    if (OOM_BY_MONEY[L.id]) c.oom[L.id] = (c.oom[L.id] || 0) + prize;
    if (e.card && (fin === 'W' || fin === 'F' || fin === 'SF')) c.card = true;
    const rec = { week: c.week, id: e.id, n: e.n, level: e.level, fin, prize, pts, cost: lv.paid != null ? lv.paid : cost(e) }; if (lv.funded) rec.funded = 1; if (e.every >= 52) rec.ed = edition(e, c.week);
    c.history.push(rec); c.live = null; c.booked = null; c.week++;
    const up = checkUp(c, e, fin);
    return Object.assign({ done: true, fin, finName: FIN_NAME[fin], prize, pts }, up ? { up } : {});
  }
  // how you move up: a points threshold (with a minimum number of events), or a jump event won, or a route to the Palace
  function checkUp(c, e, fin) {
    const L = LEVELS[c.level], played = c.history.filter(h => h.level === c.level).length;
    if (L.id === 'tt') { if (fin === 'W' || fin === 'F' || fin === 'SF') { if (fin === 'SF') c.qsOffer = true; return promote(c, 6, (fin === 'W' ? 'Trans-Tasman champion' : fin === 'F' ? 'Trans-Tasman finalist' : 'Trans-Tasman semi-finalist') + ': you’re going to the Palace'); } /* pace package: the semi-final qualifies too */ if (fin === 'SF') c.qsOffer = true; newDpnzSeason(c); return promote(c, 3, 'Back to the DPNZ Tour for a new season' + (c.qsOffer ? '. A funded Q-School place is yours if you want it' : '')); }
    if (L.id === 'card') { if (c.card && (c.oom.card || 0) >= 30000) return promote(c, 6, 'Top 32 on the Pro Tour: seeded at the Palace');
      // CAR-CARD: Q-School without a card sends you back to the DPNZ Tour (new season, 40% carried); the Q-School place (qsOffer) is kept
      // for next year, the same way back as the Trans-Tasman and a lost Worlds
      if (e.id === 'qschool' && !c.card) { c.qsOffer = true; newDpnzSeason(c); const r = promote(c, 3, 'No Tour Card this time (' + FIN_NAME[fin].toLowerCase() + '). Back to the DPNZ Tour for a new season: 40% of your points roll over. Your Q-School place stays for next year');
        r.fromQs = fin; return r; }
      return null; }
    if (L.id === 'dpnz') {
      // B1 (Q&D 01:25): a save from before the gate has no counters, so its own results this season (David: a win at Hamilton) would not
      // count. Backfill both once from this season's DPNZ history: the last dpnzEv DPNZ records before this event's (pushed just above).
      if (c.dpnzF == null && c.dpnzSF == null) { const n = c.dpnzEv || 0, ids = new Set(L.events.map(x => x.id));
        const mine = n ? (c.history || []).filter(h => ids.has(h.id)).slice(0, -1).slice(-n) : []; c.dpnzF = mine.filter(h => h.fin === 'W' || h.fin === 'F').length; c.dpnzSF = mine.filter(h => h.fin === 'SF').length; }
      c.dpnzEv = (c.dpnzEv || 0) + 1;
      // pace package (Hayden 15:10, doc 46): the DPNZ points route. 400 points (best 6) with at least 2 events this season; the carry
      // from a new season is capped at 300, so it always takes new results
      // results gate (Producer 22:21, C1 02:05): plus at least one semi-final or better this season (so it sits in the route's best 6);
      // six quarter-finals (480) can't do it
      if (fin === 'W' || fin === 'F') c.dpnzF = (c.dpnzF || 0) + 1; else if (fin === 'SF') c.dpnzSF = (c.dpnzSF || 0) + 1;
      if (c.dpnzEv >= DPNZ_ROUTE_EV && (c.pts.dpnz || 0) >= DPNZ_ROUTE && routeGate(c)) return promote(c, 6, DPNZ_ROUTE + ' DPNZ points with ' + ((c.dpnzF || 0) ? 'a final' : 'a semi-final') + ': the NZ route to the Palace');
      if (c.dpnzEv < DPNZ_SEASON) return null; const r = dpnzRank(c);
      if (r === 1) return promote(c, 6, 'DPNZ #1: the NZ route to the Palace');
      if (r <= TT_CUT) { c.dpnzLast = r; return promote(c, 4, 'Finished #' + r + ' on the DPNZ Order of Merit: the Trans-Tasman'); }
      newDpnzSeason(c); return { to: 3, n: 'DPNZ Tour', msg: 'Finished #' + r + '. A new DPNZ season: 40% of your points roll over' }; }
    // CAR-WEAK 3 (1): a lost Worlds sends you back to the DPNZ Tour for a new season (40% of your DPNZ points carried, as after the
    // Trans-Tasman), instead of a year of rest weeks at the Palace. Back to the Palace the same ways: OOM #1, or the Trans-Tasman final.
    if (L.id === 'palace') { if (fin === 'W') return { champion: true, msg: 'World Champion. Champion’s Year starts next season' };
      newDpnzSeason(c); const r = promote(c, 3, 'Out of the Worlds in the ' + (fin === 'F' ? 'final' : FIN_NAME[fin].toLowerCase()) + '. Back to the DPNZ Tour for a new season: 40% of your points roll over. Finish #1, or make the Trans-Tasman final, to go back to the Palace');
      r.fromWorlds = fin; return r; }
    if (played >= L.minEv && ((c.pts[L.id] || 0) >= L.need || (e.jump && fin === 'W'))) return promote(c, c.level + 1, 'Up to ' + LEVELS[c.level + 1].n);
    return null;
  }
  // CAR-OPP (Producer 22:21, ChatGPT agreed): Season 3 field centres per Circuit level, read by v11's band shift in Season 3 in place of
  // CEN. Fixed by level and round, never the player. Pub fitted to the weak profile (Hayden's timing) at ~25-30% entering, Club and Opens to
  // the mid profile at ~50-55%; DPNZ, Trans-Tasman, Tour Card, Palace unchanged (76/84/91/97). Fitted by tests/pace-lever-sim.js.
  const FIELD_CEN = [54.5, 65.5, 70, 76, 84, 91, 97]; // was CEN [58, 63, 69, ...]: weak enters the Pub at 25%, mid the Club at 52% and the Opens at 49% (500 careers)
  const TT_CUT = 10; // top 10 on the DPNZ OOM go to the Trans-Tasman
  const DPNZ_ROUTE = 400, DPNZ_ROUTE_EV = 2; const routeGate = c => (c.dpnzF || 0) + (c.dpnzSF || 0) >= 1; // pace package: 400 DPNZ points (best 6) after at least 2 events this season = the Palace
  const DPNZ_SEASON = 8; // events per DPNZ season (6 weekends x 2 in real life, 8 picks in TOPS)
  // Championship-year identity (Hayden 15:10, doc 46): a yearly event (every 52: the Worlds, Q-School) has one edition per cycle,
  // edition = floor(week / 52). Each history record carries its edition, and an edition already played can't be entered again,
  // so weeks 52 and 53 (or any repeat) can never be two claimable titles.
  const edition = (e, week) => e.every >= 52 ? Math.floor(week / e.every) : null;
  const playedEdition = (c, e) => (c.history || []).some(h => h.id === e.id && (h.ed != null ? h.ed : edition(e, h.week)) === edition(e, c.week));
  // carry into a new DPNZ season: 40%, capped below the Palace route so a new season always needs new results (doc 46)
  const DPNZ_CARRY = .4, DPNZ_CARRY_CAP = 300;
  function newDpnzSeason(c) { c.dpnzEv = 0; c.dpnzF = 0; c.dpnzSF = 0; const carry = Math.min(DPNZ_CARRY_CAP, Math.round((c.pts.dpnz || 0) * DPNZ_CARRY)); c.res = c.res || {}; c.res.dpnz = carry ? [carry] : []; c.pts.dpnz = carry; c.dpnzYear = (c.dpnzYear || 0) + 1; }
  const GRANT = [0, 60, 450, 900, 850, 0, 3000]; // paid when you arrive at a level: rep-squad fund, DPNZ travel subsidy, NZ team flights, Palace travel
  // (D, Producer 22:21) funded qualification package: qualifying for the Palace pays the next Worlds trip directly (travel and entry),
  // once per qualified edition, and never puts cash in the bank. The first-arrival travel grant is unchanged.
  const WORLDS_EVERY = 52, nextWorldsEd = w => w % WORLDS_EVERY === 0 ? w / WORLDS_EVERY : Math.floor(w / WORLDS_EVERY) + 1;
  const fundedTrip = (c, e) => e.id === 'worlds' && c.wfund != null && c.wfund === edition(e, c.week) && c.wfundUsed !== c.wfund;
  const costFor = (c, e) => fundedTrip(c, e) ? e.entry : cost(e); // the package pays the travel; the entry (none at the Worlds) stays
  function promote(c, to, msg) { if (to === 6) c.wfund = nextWorldsEd(c.week); c.grants = c.grants || {}; const g = to > c.level && !c.grants[to] ? GRANT[to] : 0; if (g) c.grants[to] = 1; c.level = to; c.bank += g; return { to, n: LEVELS[to].n, msg, grant: g }; }
  // hardship advance: two entries at your level, paid back from half of each prize until cleared (once at a time)
  function advance(c) { if (c.debt) return { ok: false, why: 'Pay back the last advance first' }; const L = LEVELS[c.level], ch = L.events.map(cost).sort((a, b) => a - b)[0]; const amt = ch * 2; c.bank += amt; c.debt = amt; return { ok: true, amt }; }
  function repay(c, prize) { if (!c.debt || !prize) return; const p = Math.min(c.debt, Math.round(prize / 2)); c.debt -= p; c.bank -= p; }

  // DPNZ Order of Merit: 12 named rivals play every event of the season with fixed ratings (seeded, never reads the player)
  const DPNZ_RIVALS = [['Ben Robb', 88], ['Haupai Puha', 86], ['Kayden Milne', 84], ['Jonny Tata', 82], ['Hone Rata', 80], ['Blair Simmons', 79], ['Pita Lelei', 78], ['Scott Mabey', 77], ['Rangi Meihana', 76], ['Josh Teddy', 75], ['Cody Harwood', 74], ['Kane Lister', 73]];
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
  function rivalFinish(name, a, key) { // walk a 32 draw round by round against the static field
    const rounds = roundsFor(32); for (let r = 0; r < rounds.length; r++) { const opp = oppAvg(3, r, rounds.length); const p = 1 / (1 + Math.pow(10, (opp - a) / 12)); if (hash(name + key + r) > p) return rounds[r]; } return 'W'; }
  function dpnzTable(c) {
    const yr = c.dpnzYear || 0, ev = c.dpnzEv || 0, E = { pts: 400 };
    const rows = DPNZ_RIVALS.map(([n, a]) => { const res = []; for (let k = 0; k < ev; k++) res.push(pointsFor(E, rivalFinish(n, a, 'y' + yr + 'e' + k)));
      let carry = 0; if (yr) { const prev = []; for (let k = 0; k < DPNZ_SEASON; k++) prev.push(pointsFor(E, rivalFinish(n, a, 'y' + (yr - 1) + 'e' + k))); carry = Math.round(prev.sort((x, y) => y - x).slice(0, BEST_N.dpnz).reduce((s, x) => s + x, 0) * .4); }
      return { n, pts: carry + res.sort((x, y) => y - x).slice(0, BEST_N.dpnz).reduce((s, x) => s + x, 0) }; });
    rows.push({ n: 'You', you: true, pts: c.pts.dpnz || 0 });
    return rows.sort((a, b) => b.pts - a.pts);
  }
  const dpnzRank = c => dpnzTable(c).findIndex(r => r.you) + 1;

  // broke: the way back is money matches and hardship entry (today's systems), so the career never dead-ends
  const broke = c => calendar(c).every(e => !e.canAfford);

  // CAR-DEADWK (Producer 13:40, 20 Nov): the week only moves when an event finishes, so a week with nothing on at your level (the Opens run
  // every 3 weeks, the Worlds once a year) stopped the career. The calendar stays the source of truth: a rest week jumps straight to the next
  // week that has an event at your level (all the empty weeks at once), looking up to REST_SCAN weeks past this one. calendar() is also the
  // eligibility gate (needCard, once, card, level), and book() only adds the bank check, so any week it finds can be booked.
  const REST_SCAN = 156;
  function nextEventWeek(c) { for (let w = c.week; w <= c.week + REST_SCAN; w++) { if (calendar(Object.assign({}, c, { week: w })).length) return w; } return null; }
  const restNeeded = c => !c.live && !calendar(c).length;
  const QS_WAIT = 4; // weeks a player without a card may rest at the Tour Card level waiting for Q-School
  // CAR-CARD (Q&D re-check, Producer 23:26): what a rest week will do, worked out BEFORE the tap so the rest card can say it. null = no rest
  // (an event is on, or one is live). Stable field names (Experience's s3x rest screen reads them too):
  //   next   the week the next event at this level is on (null if none in REST_SCAN weeks)
  //   back   'dpnz' when the tap sends you back to the DPNZ Tour instead of moving the week on, else null
  //   why    'qschool' (no card, Q-School more than QS_WAIT weeks off) or 'none' (the safety net: nothing left at this level)
  //   qsWeek the Q-School week (why 'qschool'), carry the DPNZ points a new season starts with (40%, capped), fromLevel the level you leave
  function restPlan(c) {
    if (c.live || calendar(c).length) return null;
    const next = nextEventWeek(c), carry = Math.min(DPNZ_CARRY_CAP, Math.round(((c.pts && c.pts.dpnz) || 0) * DPNZ_CARRY));
    if (next == null && c.level > 3) return { next: null, back: 'dpnz', why: 'none', qsWeek: null, carry, fromLevel: c.level };
    if (next != null && c.level === 5 && !c.card && next - c.week > QS_WAIT) return { next, back: 'dpnz', why: 'qschool', qsWeek: next, carry, fromLevel: 5 };
    return { next, back: null, why: null, qsWeek: null, carry: null, fromLevel: c.level };
  }
  function restWeek(c) {
    if (c.live) return { ok: false, why: 'Finish the event you are in first' };
    if (calendar(c).length) return { ok: false, why: 'There is an event on this week' };
    const to = nextEventWeek(c), plan = restPlan(c);
    // CAR-CARD safety net: above the DPNZ Tour, a level with nothing left for this career (a rule we missed later) sends you back to the
    // DPNZ Tour, which runs every week, instead of a dead end. Pub to DPNZ always have events, so they keep the explicit error.
    if (plan.back === 'dpnz' && plan.why === 'none') { const fromLevel = c.level; newDpnzSeason(c); const up = promote(c, 3, 'Nothing left on at the ' + LEVELS[fromLevel].n + ' for you. Back to the DPNZ Tour for a new season: 40% of your points roll over');
      return { ok: true, from: c.week, to: c.week, skipped: 0, fallback: true, fromLevel, up }; }
    if (to == null) return { ok: false, error: true, why: 'No event found in the next ' + REST_SCAN + ' weeks' };
    // CAR-CARD: no card yet means the only Tour Card event is Q-School, once a year. Rather than up to 51 rest weeks, wait on the DPNZ Tour
    // (weekly events) with the Q-School place kept; the Q-School offer is taken from there in its week
    if (plan.back === 'dpnz' && plan.why === 'qschool') { c.qsOffer = true; newDpnzSeason(c); const up = promote(c, 3, 'Q-School is in week ' + to + '. Back to the DPNZ Tour until then: your Q-School place is kept, and 40% of your points roll over');
      return { ok: true, from: c.week, to: c.week, skipped: 0, fallback: true, fromLevel: 5, qsWeek: to, up }; }
    const from = c.week; c.week = to; return { ok: true, from, to, skipped: to - from };
  }
  // Broke and nothing affordable on: a recovery entry books one eligible event this week with no cash up front, capped at the cheapest
  // event on (entry + travel). It goes on the same debt as the hardship advance (half of each prize pays it back), normal prize and points,
  // and it stays available after a loss, so being broke is never a new dead end. The cap is per entry (that one cheapest trip); the total
  // owed is not capped on purpose, since any total cap would bring the dead end back (Producer's call, flagged).
  function recoveryOffer(c) { if (c.live || !broke(c)) return null; const cal = calendar(c); if (!cal.length) return null; const e = cal.slice().sort((a, b) => a.cost - b.cost)[0]; return { id: e.id, n: e.n, cost: e.cost }; }
  function recoveryEntry(c, id) {
    const o = recoveryOffer(c); if (!o) return { ok: false, why: c.live ? 'Finish the event you are in first' : 'You can afford an event this week' };
    const e = calendar(c).find(x => x.id === (id || o.id)); if (!e) return { ok: false, why: 'Not on this week' };
    if (e.cost > o.cost) return { ok: false, why: 'A recovery entry covers the cheapest event this week' };
    const bank = c.bank; let r; try { c.bank = e.cost; r = book(c, e.id); } finally { c.bank = bank; } if (!r || !r.ok) { c.live = null; c.booked = null; return r || { ok: false, why: 'Could not book' }; }
    c.debt = (c.debt || 0) + e.cost; c.recovered = (c.recovered || 0) + 1; c.live.recovery = 1;
    return { ok: true, id: e.id, cost: e.cost, debt: c.debt, live: c.live };
  }

  const API = { FIN, FIN_NAME, LEVELS, BEST_N, roundsFor, oppAvg, eventOf, cost, prizeFor, pointsFor, newCareer, calendar, book, nextOpp, result, finish, dpnzTable, dpnzRank, broke, advance, REST_SCAN, DPNZ_CARRY, DPNZ_CARRY_CAP, DPNZ_ROUTE, DPNZ_ROUTE_EV, FIELD_CEN, costFor, fundedTrip, edition, nextEventWeek, restNeeded, restPlan, restWeek, recoveryOffer, recoveryEntry };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TOPS_CIRCUIT = API;
})(this);
