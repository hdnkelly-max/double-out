// Circuit engine checks: node tests/circuit.js
// From the Director's prototype (claude/director/circuit/circuit-tests.js). Career 19 Nov: the Legacy check is replaced by
// "a new career starts at the Pub with the starter bank and no Legacy" (Hayden 07:33/07:45: Season 3 is a full reset).
const C = require('../tc/circuit.js'); const assert = require('assert');
let n = 0; const t = (name, f) => { f(); n++; console.log('ok', name); };

t('booking takes entry + travel', () => { const c = C.newCareer({ bank: 100 }); const r = C.book(c, 'pub_night'); assert(r.ok); assert.strictEqual(c.bank, 95); });
t('cannot book what you cannot afford', () => { const c = C.newCareer({ bank: 3 }); assert.strictEqual(C.book(c, 'pub_night').ok, false); assert.strictEqual(c.bank, 3); });
t('8-player knockout is QF, SF, F', () => assert.deepStrictEqual(C.roundsFor(8), ['QF', 'SF', 'F']));
t('opponents are static by level and round, never the player', () => { const a = C.oppAvg(3, 0, 5), b = C.oppAvg(3, 4, 5); assert.strictEqual(a, 79); assert.strictEqual(b, 91); });
t('winning the final pays the winner share and points', () => {
  const c = C.newCareer({ bank: 100 }); C.book(c, 'pub_night'); C.result(c, true); C.result(c, true); const r = C.result(c, true);
  assert(r.done && r.fin === 'W'); assert.strictEqual(r.prize, C.prizeFor(C.eventOf('pub_night'), 'W')); assert.strictEqual(c.pts.pub, 50); assert.strictEqual(c.week, 2);
});
t('losing a round ends the event with that finish', () => { const c = C.newCareer(); C.book(c, 'pub_night'); C.result(c, true); const r = C.result(c, false); assert.strictEqual(r.fin, 'SF'); });
t('group stage: 2 wins from 3 to go through, 2 losses out', () => {
  const c = C.newCareer({ level: 2, bank: 1000 }); C.book(c, 'waikato'); C.result(c, false); C.result(c, true); const r = C.result(c, true); assert(r.next && c.live.round === 1);
  const d = C.newCareer({ level: 2, bank: 1000 }); C.book(d, 'waikato'); C.result(d, false); const r2 = C.result(d, false); assert.strictEqual(r2.fin, 'G');
});
t('winning the Kauri Cup jumps the threshold', () => {
  const c = C.newCareer({ bank: 100, week: 4 }); C.book(c, 'kauri_cup'); let r; for (let i = 0; i < 4; i++) r = C.result(c, true); assert.strictEqual(r.up.to, 1); assert.strictEqual(c.level, 1);
});
t('promotion pays the travel grant once', () => { const c = C.newCareer({ level: 1, bank: 30, res: { club: [140] }, pts: { club: 140 }, history: [{ level: 1 }, { level: 1 }] }); C.book(c, 'club_night'); c.bank = 0; C.result(c, true); C.result(c, true); const r = C.result(c, true); assert.strictEqual(r.up.to, 2); assert(c.bank >= 450); });
t('a new career starts at the Pub with the starter bank and no Legacy (full reset)', () => { const c = C.newCareer(); assert.strictEqual(c.level, 0); assert.strictEqual(c.bank, 60); assert.strictEqual(c.legacy, undefined); assert.strictEqual(C.legacySplit, undefined); });
t('DPNZ: winning everything reaches the Palace (the 400 route after 2 events, pace package; else #1 at 8)', () => { const c = C.newCareer({ level: 3, bank: 99999 }); let up = null, ev = 0; for (let i = 0; i < 8 && !up; i++) { C.book(c, 'dpnz_akl'); let r; do { r = C.result(c, true); } while (!r.done); up = r.up || up; ev++; } assert(up && up.to === 6); assert.strictEqual(ev, 2); });
console.log(n + ' checks passed');
