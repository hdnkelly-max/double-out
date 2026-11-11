// Checkout routes (Hayden 22:59): every score 2-170 against the agreed standard table, by darts in hand,
// plus set-up advice and the route picker's alternatives. node tests/checkouts.js  (no browser; runs in a second)
const fs = require('fs'), path = require('path'), vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, '..', 'engine.js'), 'utf8');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(src + ';this.E={route,aimFor,routesFor,valOf};', ctx);
const { route, aimFor, routesFor, valOf } = ctx.E;

// the agreed table (three darts in hand), kept here on purpose so the test isn't a copy of the engine
const AGREED = `170 T20 T20 Bull; 167 T20 T19 Bull; 164 T20 T18 Bull; 161 T20 T17 Bull; 160 T20 T20 D20; 158 T20 T20 D19; 157 T20 T19 D20; 156 T20 T20 D18; 155 T20 T19 D19; 154 T20 T18 D20; 153 T20 T19 D18; 152 T20 T20 D16; 151 T20 T17 D20; 150 T20 T18 D18; 149 T20 T19 D16; 148 T20 T16 D20; 147 T20 T17 D18; 146 T20 T18 D16; 145 T20 T15 D20; 144 T20 T20 D12; 143 T20 T17 D16; 142 T20 T14 D20; 141 T20 T19 D12; 140 T20 T20 D10; 139 T20 T13 D20; 138 T20 T18 D12; 137 T20 T19 D10; 136 T20 T20 D8; 135 T20 T17 D12; 134 T20 T14 D16; 133 T20 T19 D8; 132 T20 T16 D12; 131 T20 T13 D16; 130 T20 T18 D8; 129 T19 T16 D12; 128 T18 T14 D16; 127 T20 T17 D8; 126 T19 T19 D6; 125 25 T20 D20; 124 T20 T16 D8; 123 T19 T10 D18; 122 T18 T12 D16; 121 T20 T15 D8; 120 T20 S20 D20; 119 T19 T10 D16; 118 T20 S18 D20; 117 T20 S17 D20; 116 T20 S16 D20; 115 T20 S15 D20; 114 T20 S14 D20; 113 T20 S13 D20; 112 T20 S12 D20; 111 T20 S19 D16; 110 T20 Bull; 109 T20 S9 D20; 108 T20 S16 D16; 107 T19 Bull; 106 T20 S10 D18; 105 T20 S13 D16; 104 T18 Bull; 103 T19 S6 D20; 102 T20 S10 D16; 101 T17 Bull; 100 T20 D20; 99 T19 S10 D16; 98 T20 D19; 97 T19 D20; 96 T20 D18; 95 T19 D19; 94 T18 D20; 93 T19 D18; 92 T20 D16; 91 T17 D20; 90 T18 D18; 89 T19 D16; 88 T16 D20; 87 T17 D18; 86 T18 D16; 85 T15 D20; 84 T20 D12; 83 T17 D16; 82 Bull D16; 81 T19 D12; 80 T20 D10; 79 T13 D20; 78 T18 D12; 77 T19 D10; 76 T20 D8; 75 T17 D12; 74 T14 D16; 73 T19 D8; 72 T16 D12; 71 T13 D16; 70 T18 D8; 69 T19 D6; 68 T20 D4; 67 T17 D8; 66 T10 D18; 65 25 D20; 64 T16 D8; 63 T13 D12; 62 T10 D16; 61 T15 D8; 60 S20 D20; 59 S19 D20; 58 S18 D20; 57 S17 D20; 56 S16 D20; 55 S15 D20; 54 S14 D20; 53 S13 D20; 52 S12 D20; 51 S11 D20; 50 Bull; 49 S9 D20; 48 S16 D16; 47 S15 D16; 46 S6 D20; 45 S13 D16; 44 S12 D16; 43 S11 D16; 42 S10 D16; 41 S9 D16; 40 D20; 39 S7 D16; 38 D19; 37 S5 D16; 36 D18; 35 S3 D16; 34 D17; 33 S1 D16; 32 D16; 31 S15 D8; 30 D15; 29 S13 D8; 28 D14; 27 S11 D8; 26 D13; 25 S9 D8; 24 D12; 23 S7 D8; 22 D11; 21 S5 D8; 20 D10; 19 S3 D8; 18 D9; 17 S1 D8; 16 D8; 15 S7 D4; 14 D7; 13 S5 D4; 12 D6; 11 S3 D4; 10 D5; 9 S1 D4; 8 D4; 7 S3 D2; 6 D3; 5 S1 D2; 4 D2; 3 S1 D1; 2 D1`;
const T = {}; AGREED.split(';').map(x => x.trim()).filter(Boolean).forEach(l => { const p = l.split(' '); T[+p[0]] = p.slice(1).map(x => x === 'Bull' ? 'BULL' : x); });
const BOGEY = [169, 168, 166, 165, 163, 162, 159];
const fails = []; const bad = (m) => fails.push(m);
const J = (r) => r ? r.join(' ') : 'none';
const isFin = (x) => x[0] === 'D' || x === 'BULL';

// 1. every score, three darts: exactly the agreed route; arithmetic and double-out hold
for (let s = 2; s <= 170; s++) {
  const r = route(s, 3);
  if (BOGEY.includes(s)) { if (r) bad(`${s}: bogey but got ${J(r)}`); continue; }
  if (!T[s]) { bad(`${s}: missing from the agreed table`); continue; }
  if (J(r) !== J(T[s])) bad(`${s}/3: got ${J(r)}, agreed ${J(T[s])}`);
  if (r && r.reduce((a, x) => a + valOf(x), 0) !== s) bad(`${s}: route adds to the wrong total`);
  if (r && !isFin(r[r.length - 1])) bad(`${s}: route doesn't end on a double or Bull`);
}
// 2. fewer darts: the agreed route if it fits, else no finish
for (let s = 2; s <= 170; s++) for (const d of [1, 2]) {
  const want = T[s] && T[s].length <= d ? T[s] : null, got = route(s, d);
  if (J(got) !== J(want)) bad(`${s}/${d}: got ${J(got)}, want ${J(want)}`);
}
// 3. Hayden's anchors and set-ups
const A = [[60, 3, 'S20 D20'], [86, 3, 'T18 D16'], [82, 3, 'BULL D16'], [72, 3, 'T16 D12'], [170, 3, 'T20 T20 BULL'], [50, 1, 'BULL'], [110, 2, 'T20 BULL']];
A.forEach(([s, d, w]) => { if (J(route(s, d)) !== w) bad(`anchor ${s}/${d}: got ${J(route(s, d))}, want ${w}`); });
const SU = [[80, 1, 'T16'], [70, 1, /^(T10|T18)$/], [64, 1, 'T16'], [60, 1, 'S20'], [56, 1, 'S16'], [45, 1, 'S13'], [41, 1, 'S9'], [39, 1, 'S7'], [120, 2, 'T20'], [99, 2, 'T19']];
SU.forEach(([s, d, w]) => { const a = aimFor(s, d); if (w instanceof RegExp ? !w.test(a) : a !== w) bad(`set-up ${s}/${d}: aims ${a}, want ${w}`); });
// one dart, 41-60, no finish: always a single that leaves a double
for (let s = 41; s <= 60; s++) { if (s === 50) continue; const a = aimFor(s, 1); if (!/^S/.test(a) || ((s - valOf(a)) % 2) || s - valOf(a) > 40) bad(`set-up ${s}/1: ${a} doesn't leave a double`); }
// 4. the picker: standard route first, at most 4, every alternative sane
const OKD = new Set(['D20', 'D16', 'D8', 'D18', 'D12', 'D10', 'D14', 'D4', 'BULL']);
for (let s = 2; s <= 170; s++) for (const d of [1, 2, 3]) for (const pref of [16, 20, 'BULL']) {
  const list = routesFor(s, d, pref).map(x => x.r), std = route(s, d);
  if (std && J(list[0]) !== J(std)) bad(`picker ${s}/${d} pref ${pref}: first is ${J(list[0])}, standard ${J(std)}`);
  if (list.length > 4) bad(`picker ${s}/${d}: ${list.length} routes`);
  list.slice(std ? 1 : 0).forEach(r => {
    const pre = r.slice(0, -1), last = r[r.length - 1], k = J(r);
    if (r.reduce((a, x) => a + valOf(x), 0) !== s || r.length > d) bad(`picker ${s}/${d}: ${k} invalid`);
    if (std && r.length > std.length) bad(`picker ${s}/${d}: ${k} uses more darts than the standard`);
    if (!OKD.has(last)) bad(`picker ${s}/${d}: ${k} ends on ${last}`);
    if (pre.some(x => x[0] === 'T' && +x.slice(1) < 10)) bad(`picker ${s}/${d}: ${k} small treble set-up`);
    if (pre.some(x => x[0] === 'S' && +x.slice(1) < 10) && !(r.length === 2 && s <= 60)) bad(`picker ${s}/${d}: ${k} small single set-up`);
    if (r.length === 2 && s <= 60 && pre[0][0] === 'T') bad(`picker ${s}/${d}: ${k} treble on a 60-and-under two-darter`);
    if (last === 'BULL' && !pre.every(x => x === 'BULL' || (x[0] === 'T' && +x.slice(1) >= 17))) bad(`picker ${s}/${d}: ${k} Bull after a weak set-up`);
  });
}
if (!routesFor(100, 2, 16).some(x => J(x.r) === 'BULL BULL')) bad('picker 100/2: Bull Bull flex missing');
if (fails.length) { console.log(`checkouts: FAIL (${fails.length})`); fails.slice(0, 40).forEach(f => console.log('  ' + f)); process.exit(1); }
console.log('checkouts: PASS (2-170 by darts in hand, anchors, set-ups, picker)');
