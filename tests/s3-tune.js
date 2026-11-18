// S3 difficulty tuning routine (Hayden 09:21): read the real per-level numbers, propose a small THROW_TUNE change.
// 1) In Supabase run:  select * from tops_s3_curve;   (save the rows as JSON, e.g. curve.json)
// 2) node tests/s3-tune.js curve.json            -> prints, per level, what the players did vs the target, and a proposed THROW_TUNE.s3span
//    (only levels with enough matches move; each step at most ±STEP on the span), plus a curve note when the
//    climb inside levels is off across most levels.
// Targets (Hayden 08:54): ~50% wins in the first third of a player's matches at a level, ~65-70% in the last third.
// Lever (since CAR-EASE): THROW_TUNE.s3span[k] = how wide the honest ring starts at level k (bigger = near-misses land wider = fewer wins;
// sim: +0.1 is about -8 win-% points). THROW_TUNE.curve.win/sway = how much stats move the throw (the climb inside a level).
const fs = require('fs'), path = require('path');
const rows = JSON.parse(fs.readFileSync(process.argv[2] || 'curve.json', 'utf8'));
const src = fs.readFileSync(path.resolve(__dirname, '../game4.js'), 'utf8');
const m = src.match(/const THROW_TUNE=(\{[\s\S]*?\]\]\});/); if (!m) { console.log('THROW_TUNE not found'); process.exit(1); }
const T = Function('return ' + m[1])();
const MIN = +process.env.MIN || 6, STEP = +process.env.STEP || 0.05, ENTRY = 50, EXIT = 67;
const PTS_PER_SPAN = +process.env.SENS || 80; // win-% points per +1.0 of span
const by = {}; rows.forEach(r => { const k = +r.level; (by[k] = by[k] || []).push(r); });
const span = (T.s3span || T.span).slice(); const out = []; let climbLow = 0, climbHigh = 0, seen = 0;
for (let k = 0; k < span.length; k++) {
  const rs = (by[k] || []).filter(r => +r.matches >= MIN); if (!rs.length) { out.push(`L${k}: no player with ${MIN}+ matches yet`); continue; }
  const w = rs.reduce((s, r) => s + +r.matches, 0), mean = f => rs.reduce((s, r) => s + (+r[f] || 0) * +r.matches, 0) / w;
  const first = mean('first_win_pct'), last = mean('last_win_pct'), err = ((first - ENTRY) + (last - EXIT)) / 2;
  seen++; if (last - first < 10) climbLow++; if (last - first > 25) climbHigh++;
  // too many wins -> a wider starting ring (span up); too few -> narrower (small steps, at most STEP a patch)
  const d = Math.max(-STEP, Math.min(STEP, err / PTS_PER_SPAN));
  if (Math.abs(err) >= 5) span[k] = +(span[k] + d).toFixed(3);
  out.push(`L${k}: ${rs.length} player(s), ${w} matches · first third ${first.toFixed(0)}% (target ${ENTRY}) · last third ${last.toFixed(0)}% (target ${EXIT}) · ` +
    (Math.abs(err) >= 5 ? `span ${(span[k] - d).toFixed(2)} -> ${span[k]}` : 'leave'));
}
console.log(out.join('\n'));
console.log('\nproposed THROW_TUNE.s3span = ' + JSON.stringify(span));
if (seen >= 3 && climbLow > seen / 2) console.log('curve: players climb less than 10 points inside most levels -> widen THROW_TUNE.curve (e.g. win top +10%, sway top -10%)');
if (seen >= 3 && climbHigh > seen / 2) console.log('curve: players climb more than 25 points inside most levels -> narrow THROW_TUNE.curve (win top -10%, sway top +10%)');
console.log('\nship it as a fast-lane patch: edit THROW_TUNE in game4.js, node build.js, node tests/car-top.js && node tests/s3-circuit.js, push, release.');
