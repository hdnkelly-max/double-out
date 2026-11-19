// CAR-RAMP (Hayden 19:42): near-perfect timing isn't punishing. Season 3, real landFrom, Pub (starter stats) and Worlds (max stats):
//   1 no cliff: 1 ms outside the window lands within 12% of a perfect dart (p50)
//   2 the spread grows steadily: p50 never drops by more than noise from one 2 ms step to the next, out to 120 ms
//   3 never harsher than 3.54: at every timing the p50 is <= the 3.54 near-miss (+7% sampling noise, 3,000 darts a point); past the ramp it is the 3.54 one
//   4 the drawn ring is unchanged (players time off it)
//   5 Season 2 (?s3=0): no ramp, the 3.54 landing exactly (same p50 as ramp 0)
//   6 (ChatGPT P1-3) a win_scale nudge of up to ±20% moves the drawn ring's timing cue by no more than 20% of the window (≤4.4 ms, under one
//     60 Hz frame) and leaves it within 1.5 mm from 20 ms past the window on: the ring keeps showing the real window, so it moves with it
// usage: node tests/car-ramp.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] }); const f = []; const out = {};
  for (const q of ['?s3=1', '?s3=0']) {
    const p = await b.newPage(); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.goto('file://' + path.join(dir, 'index.html') + q); await p.waitForTimeout(4500);
    out[q] = await p.evaluate(() => {
      save.authSeen = true; newCareer(); const N = 3000, o = {}; const en = effNerves; effNerves = () => 0;
      const p50 = (tp, dt) => { const d = []; for (let i = 0; i < N; i++) { const l = landFrom({ x: 0, y: -103 }, tp, dt); d.push(Math.hypot(l.x, l.y + 103)); } d.sort((a, b) => a - b); return d[N >> 1]; };
      try {
        for (const [name, tier, st] of [['Pub', 0, 20], ['Worlds', 6, 95]]) {
          save.st2 = save.st2 || {}; save.st2.v = { sc: st, fi: st, ct: st, rh: st, co: st }; career().tier = tier;
          beginMatch({ mode: 'career', tier, p0: 'P', oppName: 'X', oppAvg: 50, legs: 1 }); const tp = Object.assign({}, throwParams()); const t0 = Object.assign({}, tp, { ramp: 0 });
          const r = { P: tp.P, ramp: tp.ramp, perfect: p50(tp, 0), grid: [], ringSame: true };
          for (let e = 1; e <= 120 - tp.P; e += 2) { const dt = -(tp.P + e); r.grid.push({ e, now: p50(tp, dt), old: p50(t0, dt) }); if (ringR(dt, tp) !== ringR(dt, t0)) r.ringSame = false; }
          r.ringScale = {}; for (const sc of [0.8, 0.9, 1.1, 1.2]) { const t2 = Object.assign({}, tp, { P: tp.P * sc }); let far = 0, edgeShift = Math.abs(tp.P * (sc - 1)); for (let dt = -300; dt <= 300; dt++) { if (Math.abs(dt) >= Math.max(tp.P, t2.P) + 20) far = Math.max(far, Math.abs(ringR(dt, t2) - ringR(dt, tp))); } r.ringScale[sc] = { far: +far.toFixed(2), edgeShift: +edgeShift.toFixed(1) }; }
          o[name] = r; S.done = true;
        }
      } finally { effNerves = en; }
      return o;
    });
    await p.close();
  }
  await b.close();
  const s3 = out['?s3=1'], s2 = out['?s3=0'];
  for (const k of ['Pub', 'Worlds']) {
    const r = s3[k]; if (!(r.ramp > 0)) f.push(`${k}: Season 3 has no ramp`);
    if (r.grid[0].now > r.perfect * 1.12) f.push(`${k}: cliff at the window edge (perfect ${r.perfect.toFixed(1)}, +1 ms ${r.grid[0].now.toFixed(1)})`);
    for (let i = 1; i < r.grid.length; i++) if (r.grid[i].now < r.grid[i - 1].now * 0.94) f.push(`${k}: spread drops at +${r.grid[i].e} ms`);
    r.grid.forEach(g => { if (g.now > g.old * 1.07 + 0.3) f.push(`${k}: harsher than 3.54 at +${g.e} ms (${g.now.toFixed(1)} vs ${g.old.toFixed(1)})`); if (g.e > r.ramp + 1 && Math.abs(g.now - g.old) > g.old * 0.07 + 0.3) f.push(`${k}: past the ramp but not 3.54 at +${g.e} ms`); });
    if (!r.ringSame) f.push(`${k}: the drawn ring changed`);
    Object.entries(r.ringScale).forEach(([sc, v]) => { if (v.far > 1.5) f.push(`${k}: win_scale ${sc} moves the drawn ring ${v.far} mm away from the window edge`); if (v.edgeShift > 0.2 * r.P + 1e-9 || v.edgeShift > 16.7) f.push(`${k}: win_scale ${sc} shifts the ring's edge ${v.edgeShift} ms`); });
    const q = s2[k]; if (q.ramp) f.push(`${k}: Season 2 has a ramp`); q.grid.forEach(g => { if (Math.abs(g.now - g.old) > g.old * 0.07 + 0.3) f.push(`${k}: Season 2 landing differs from 3.54 at +${g.e} ms`); });
  }
  const pick = (r, e) => (r.grid.find(g => g.e >= e) || {}).now;
  if (f.length) { console.log('FAIL\n- ' + [...new Set(f)].slice(0, 12).join('\n- ')); process.exit(1); }
  console.log(`PASS: Pub p50 perfect ${s3.Pub.perfect.toFixed(1)} mm -> +1 ms ${s3.Pub.grid[0].now.toFixed(1)} (3.54 ${s3.Pub.grid[0].old.toFixed(1)}), +15 ms ${pick(s3.Pub, 15).toFixed(1)} (3.54 ${pick(s3.Pub, 15).toFixed ? s3.Pub.grid.find(g => g.e >= 15).old.toFixed(1) : ''}), past ${s3.Pub.ramp} ms = 3.54; Worlds perfect ${s3.Worlds.perfect.toFixed(1)} -> +1 ms ${s3.Worlds.grid[0].now.toFixed(1)}; steady growth, never harsher than 3.54, drawn ring unchanged, win_scale ±20% moves the ring cue ≤${Math.max(...Object.values(s3.Pub.ringScale).map(v=>v.edgeShift),...Object.values(s3.Worlds.ringScale).map(v=>v.edgeShift))} ms at the edge and ≤${Math.max(...Object.values(s3.Pub.ringScale).map(v=>v.far),...Object.values(s3.Worlds.ringScale).map(v=>v.far))} mm beyond it, Season 2 = 3.54`);
})();
