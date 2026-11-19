// Miss curve (Hayden 19:42): landing spread around the lock (where the reticle was at release) against how far the release was from
// the perfect moment, at the Pub (starter stats, tier 0) and the Worlds (max stats, tier 6), Season 3, through the game's real landFrom.
// Prints p50/p90 (mm) early and late at 0, 5, 10, 15, 20, 30, 50, 80, 120 ms, and the drawn ring radius at the same moments.
// usage: node tests/miss-curve.js [dir] [json-out]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const dir = process.argv[2] || path.resolve(__dirname, '..'); const out = process.argv[3];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] }); const p = await b.newPage();
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + path.join(dir, 'index.html') + '?s3=1'); await p.waitForTimeout(4500);
  const res = await p.evaluate(() => {
    save.authSeen = true; newCareer(); const OFF = [0, 5, 10, 15, 20, 30, 50, 80, 120], N = 4000, o = {};
    const en = effNerves; effNerves = () => 0;
    try {
      for (const [name, tier, st] of [['Pub', 0, 20], ['Worlds', 6, 95]]) {
        save.st2 = save.st2 || {}; save.st2.v = { sc: st, fi: st, ct: st, rh: st, co: st }; career().tier = tier;
        beginMatch({ mode: 'career', tier, p0: 'P', oppName: 'X', oppAvg: 50, legs: 1 }); S.aim = { x: 0, y: -103 };
        const tp = throwParams(); const rows = [];
        for (const off of OFF) for (const sg of [-1, 1]) {
          if (off === 0 && sg > 0) continue; const dt = sg * off; const d = [];
          for (let i = 0; i < N; i++) { const l = landFrom({ x: 0, y: -103 }, tp, dt); d.push(Math.hypot(l.x, l.y + 103)); }
          d.sort((a, b) => a - b);
          rows.push({ ms: off, side: off === 0 ? 'perfect' : (sg < 0 ? 'early' : 'late'), inWindow: Math.abs(dt) <= tp.P, p50: +d[N >> 1].toFixed(1), p90: +d[Math.floor(N * .9)].toFixed(1), ring: +ringR(dt, tp).toFixed(1) });
        }
        o[name] = { P: +tp.P.toFixed(1), D: Math.round(tp.D), s0: +tp.s0.toFixed(2), R0: tp.R0, rows }; S.done = true;
      }
    } finally { effNerves = en; }
    return o;
  });
  await b.close();
  for (const k of Object.keys(res)) {
    const r = res[k]; console.log(`\n${k}: window ±${r.P} ms, pull ${r.D} ms, s0 ${r.s0}`);
    console.log('ms   side     win  p50   p90   ring');
    r.rows.forEach(x => console.log(`${String(x.ms).padEnd(4)} ${x.side.padEnd(8)} ${x.inWindow ? 'in ' : 'out'}  ${String(x.p50).padEnd(5)} ${String(x.p90).padEnd(5)} ${x.ring}`));
  }
  if (out) fs.writeFileSync(out, JSON.stringify(res, null, 1));
})();
