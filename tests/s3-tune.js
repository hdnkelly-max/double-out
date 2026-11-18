// S3 difficulty tuning routine (Hayden 09:21): read the real per-level numbers, propose a small THROW_TUNE change.
// 1) In Supabase run:  select * from tops_s3_curve;   (save the rows as JSON, e.g. curve.json)
// 2) node tests/s3-tune.js curve.json            -> prints, per level, what the players did vs the target, and a proposed THROW_TUNE.stage
//    (only levels with enough matches move; each step at most ±STEP on the window multiplier and the cone), plus a curve note when the
//    climb inside levels is off across most levels.
// Targets (Hayden 08:54): ~50% wins in the first third of a player's matches at a level, ~65-70% in the last third.
// Levers: stage[k][0] = window multiplier for level k (entry/exit both move), stage[k][1] = cone ms (bigger = gentler misses);
// THROW_TUNE.curve.win/sway = how much stats move the throw (the climb inside a level).
const fs = require('fs'), path = require('path');
const rows = JSON.parse(fs.readFileSync(process.argv[2] || 'curve.json', 'utf8'));
const src = fs.readFileSync(path.resolve(__dirname, '../game4.js'), 'utf8');
const m = src.match(/const THROW_TUNE=(\{[^\n]*\});/); if (!m) { console.log('THROW_TUNE not found'); process.exit(1); }
const T = Function('return ' + m[1])();
const MIN = +process.env.MIN || 6, STEP = +process.env.STEP || 0.05, ENTRY = 50, EXIT = 67;
// sensitivity from the s3-curve sims: about 3 win-% points per 1% of window at a level's field (and the cone moves with it)
const PTS_PER_PCT = +process.env.SENS || 3;
const by = {}; rows.forEach(r => { const k = +r.level; (by[k] = by[k] || []).push(r); });
const stage = T.stage.map(r => r.slice()); const out = []; let climbLow = 0, climbHigh = 0, seen = 0;
for (let k = 0; k < stage.length; k++) {
  const rs = (by[k] || []).filter(r => +r.matches >= MIN); if (!rs.length) { out.push(`L${k}: no player with ${MIN}+ matches yet`); continue; }
  const w = rs.reduce((s, r) => s + +r.matches, 0), mean = f => rs.reduce((s, r) => s + (+r[f] || 0) * +r.matches, 0) / w;
  const first = mean('first_win_pct'), last = mean('last_win_pct'), err = ((first - ENTRY) + (last - EXIT)) / 2;
  seen++; if (last - first < 10) climbLow++; if (last - first > 25) climbHigh++;
  // too many wins -> smaller window and a steeper cone; too few -> bigger and gentler (small steps)
  const pct = Math.max(-STEP, Math.min(STEP, -err / PTS_PER_PCT / 100));
  if (Math.abs(err) >= 5) { stage[k][0] = +(stage[k][0] * (1 + pct)).toFixed(3); stage[k][1] = Math.round(stage[k][1] * (1 + pct)); }
  out.push(`L${k}: ${rs.length} player(s), ${w} matches · first third ${first.toFixed(0)}% (target ${ENTRY}) · last third ${last.toFixed(0)}% (target ${EXIT}) · ` +
    (Math.abs(err) >= 5 ? `window x${(1 + pct).toFixed(3)}, cone x${(1 + pct).toFixed(3)}` : 'leave'));
}
console.log(out.join('\n'));
console.log('\nproposed THROW_TUNE.stage = ' + JSON.stringify(stage));
if (seen >= 3 && climbLow > seen / 2) console.log('curve: players climb less than 10 points inside most levels -> widen THROW_TUNE.curve (e.g. win top +10%, sway top -10%)');
if (seen >= 3 && climbHigh > seen / 2) console.log('curve: players climb more than 25 points inside most levels -> narrow THROW_TUNE.curve (win top -10%, sway top +10%)');
console.log('\nship it as a fast-lane patch: edit THROW_TUNE in game4.js, node build.js, node tests/car-top.js && node tests/s3-circuit.js, push, release.');
