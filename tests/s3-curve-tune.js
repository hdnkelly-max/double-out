// S3-CURVE on top of CAR-PULL/CAR-RAMP/CAR-TUNE (4.12): with ?curve=1 the curve sets the window and sway, then the tier's tops_tune values
// apply on top (window x win_scale, ramp), the pull stays 660 ms, and the near-miss ramp is on. Curve off = 4.12 exactly.
// usage: node tests/s3-curve-tune.js
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] }); const f = []; const out = {};
  for (const q of ['?s3=1&curve=0', '?s3=1&curve=1']) {
    const p = await b.newPage(); await p.route(/jsdelivr|googleapis|gstatic/, r => r.abort());
    await p.route(/supabase\.co/, r => /tops_tune/.test(r.request().url()) ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ tier: 1, win_scale: 0.9, ramp_ms: 30 }]) }) : r.abort());
    await p.goto('file://' + path.resolve(__dirname, '../index.html') + q); await p.waitForTimeout(4500);
    out[q] = await p.evaluate(() => { save.authSeen = true; newCareer(); save.st2 = save.st2 || {}; save.st2.v = { sc: 60, fi: 60, ct: 60, rh: 60, co: 60 }; const en = effNerves; effNerves = () => 0; const o = {};
      try { for (const t of [0, 1]) { career().tier = t; beginMatch({ mode: 'career', tier: t, p0: 'P', oppName: 'X', oppAvg: 50, legs: 1 }); const tp = throwParams(); o[t] = { P: tp.P, A: tp.A, D: Math.round(tp.D), ramp: tp.ramp, curve: tp.curve || 0, win: S.tune && S.tune.win }; S.done = true; } } finally { effNerves = en; } return o; });
    await p.close();
  }
  await b.close();
  const off = out['?s3=1&curve=0'], on = out['?s3=1&curve=1'];
  [0, 1].forEach(t => { if (on[t].D !== 660 || off[t].D !== 660) f.push(`tier ${t}: pull not 660 (${off[t].D}/${on[t].D})`); if (!on[t].curve || off[t].curve) f.push(`tier ${t}: curve flag ${off[t].curve}/${on[t].curve}`); if (on[t].ramp !== off[t].ramp) f.push(`tier ${t}: ramp differs ${off[t].ramp}/${on[t].ramp}`); });
  if (off[0].ramp !== 20 || Math.abs(off[1].ramp - 27) > 1e-9) f.push('ramp from the table ' + JSON.stringify([off[0].ramp, off[1].ramp]));
  // the tier-1 0.9 scale applies on top of each mode's own window: ratio of tier-1 window to the unscaled one = 0.9 x the curve's level factor ratio
  const lvl = [1, 1.07]; const rOn = on[1].P / on[0].P, want = 0.9 * lvl[1] / lvl[0];
  if (Math.abs(rOn - want) > 1e-6) f.push(`curve on: tier 1/tier 0 window ${rOn.toFixed(4)}, want ${want.toFixed(4)} (0.9 x level factor)`);
  if (Math.abs(off[1].P / off[0].P - 0.9) > 1e-6) f.push('curve off: tier 1 window not x.9');
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
  console.log(`PASS: curve on and off both pull 660 ms and use the table's ramp (Pub 20, Club 30 x .9 = 27 ms); the Club .9 window scale applies on top of the curve window (on: Pub ${on[0].P.toFixed(2)} / Club ${on[1].P.toFixed(2)} ms; off: ${off[0].P.toFixed(2)} / ${off[1].P.toFixed(2)})`);
})();
