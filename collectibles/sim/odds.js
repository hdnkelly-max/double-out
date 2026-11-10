// TOPS card odds + soft pity simulator. node sim/odds.js [players] [picksPerWeek]
// Rules (tops-collectibles-plan.md): 3 independent rolls per pick; base odds C60 U25 R11 E3.5 L0.5;
// soft pity counts completed picks without keeping a legendary; ramps from pick 160, hard at 240
// (tuned 11 Nov: 80/120 halved the time to first legendary). Resets on any legendary kept, dupes included.
// Pity raises all three rolls equally so the blind choice stays honest; at the hard cap all three are legendary.
const BASE = { common: .60, uncommon: .25, rare: .11, epic: .035, legendary: .005 };
const PITY_START = +process.env.PS || 160, PITY_HARD = +process.env.PH || 240;
function legChance(sinceLeg) {
  if (sinceLeg + 1 >= PITY_HARD) return 1;
  if (sinceLeg + 1 < PITY_START) return BASE.legendary;
  const t = (sinceLeg + 1 - PITY_START) / (PITY_HARD - PITY_START); // 0..1
  return BASE.legendary + (0.25 - BASE.legendary) * t * t;          // quadratic ramp to 25% per option
}
function roll(pL, rnd) {
  const r = rnd();
  if (r < pL) return 'legendary';
  const rest = 1 - BASE.legendary, s = (r - pL) / (1 - pL) * rest;
  let acc = 0; for (const k of ['common', 'uncommon', 'rare', 'epic']) { acc += BASE[k]; if (s < acc) return k; }
  return 'epic';
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function simPlayer(seed, picks) {
  const rnd = mulberry(seed); let since = 0; const firstAt = []; const kept = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
  let missedLeg = 0;
  for (let p = 1; p <= picks; p++) {
    const pL = legChance(since);
    const opts = [roll(pL, rnd), roll(pL, rnd), roll(pL, rnd)];
    const pos = Math.floor(rnd() * 3); const k = opts[pos]; kept[k]++;
    if (k === 'legendary') { firstAt.push(p); since = 0; } else { since++; if (opts.includes('legendary')) missedLeg++; }
  }
  return { firstAt, kept, missedLeg };
}
const N = +process.argv[2] || 20000, PPW = +process.argv[3] || 40, PICKS = 600;
const first = [], counts = []; let missed = 0; const tot = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
for (let i = 0; i < N; i++) { const r = simPlayer(i + 1, PICKS); first.push(r.firstAt[0] || Infinity); counts.push(r.firstAt.length); missed += r.missedLeg; for (const k in tot) tot[k] += r.kept[k]; }
first.sort((a, b) => a - b);
const q = f => first[Math.floor(f * (N - 1))];
const allKept = Object.values(tot).reduce((a, b) => a + b, 0);
console.log(`players ${N}, ${PICKS} picks each, ${PPW} picks/week assumed`);
console.log(`first legendary (picks): p10 ${q(.1)}  median ${q(.5)}  p90 ${q(.9)}  max ${first[N - 1]}`);
console.log(`first legendary (weeks): median ${(q(.5) / PPW).toFixed(1)}  p90 ${(q(.9) / PPW).toFixed(1)}  worst ${(first[N - 1] / PPW).toFixed(1)}`);
console.log(`legendaries per ${PICKS} picks: mean ${(counts.reduce((a, b) => a + b, 0) / N).toFixed(2)}`);
console.log(`share kept: ` + Object.entries(tot).map(([k, v]) => `${k} ${(100 * v / allKept).toFixed(2)}%`).join('  '));
console.log(`"missed a legendary" moments per player per ${PICKS} picks: ${(missed / N).toFixed(2)}`);
const pureFirst = Math.round(1 / BASE.legendary);
console.log(`(no pity: median first legendary ~${Math.round(Math.log(.5) / Math.log(1 - BASE.legendary))} picks, mean ${pureFirst}; 37% still empty at 200)`);
