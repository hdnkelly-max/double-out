// CAR-PULL (Overseer 18:42): in Season 3 every player has one pull length (S3_PULL_MS in v09.js) at every Rhythm.
// Rhythm only widens the perfect window. Season 2 (?s3=0) keeps the old Rhythm-dependent pull exactly.
// Checks:
//   1 ?s3=1: throwParams().D is TOPS_S3_PULL ms at Rhythm 20/40/60/80/95, and the window (P) still rises with Rhythm
//   2 ?s3=0: D is unchanged from 4.06 (660/633/607/580/560 by Rhythm, the TT table) and P is identical to Season 3's
//   3 a real held release (startPull, held exactly TOPS_S3_PULL ms, release) is Perfect at Rhythm 20 and 95 in Season 3;
//     in Season 2 a 560 ms hold at Rhythm 20 is 100 ms early (the bug David hit)
// usage: node tests/car-pull.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] }); const p = await b.newPage();
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const f = [], res = {};
  for (const q of ['?s3=1', '?s3=0']) {
    await p.goto('file://' + path.join(dir, 'index.html') + q); await p.waitForTimeout(4500);
    res[q] = await p.evaluate(async () => {
      save.authSeen = true; save.lessonDone = true; save.inputOffsetMs = 0; newCareer(); const o = { tp: {}, hold: {} };
      const setRh = v => { save.st2 = save.st2 || {}; save.st2.v = { sc: v, fi: v, ct: v, rh: v, co: v }; };
      const start = () => { beginMatch({ mode: 'career', tier: 0, p0: 'P', oppName: 'X', oppAvg: 50, legs: 1 }); S.bull = null; S.busy = false; S.view = 0; S.breathe = false; S.cur = 0; S.noPullUntil = 0; };
      const en = effNerves; effNerves = () => 0;
      try {
        for (const v of [20, 40, 60, 80, 95]) { setRh(v); start(); const tp = throwParams(); o.tp[v] = { D: +tp.D.toFixed(1), P: +tp.P.toFixed(2) }; S.done = true; }
        for (const v of [20, 95]) {
          setRh(v); start(); V.walking = () => false; startPull('key'); const lock = S.lockTp;
          S.pullStart = performance.now() - (window.TOPS_S3FLAG ? window.TOPS_S3_PULL : 560); release({ timeStamp: performance.now() }, 'key');
          o.pullMs = window.TOPS_S3_PULL; o.hold[v] = { rel: +(S.relMs || 0).toFixed(1), P: +lock.P.toFixed(1), D: +lock.D.toFixed(1), perfect: Math.abs(S.relMs) <= lock.P };
          S.done = true;
        }
      } finally { effNerves = en; }
      return o;
    });
  }
  const s3 = res['?s3=1'], s2 = res['?s3=0'], R = [20, 40, 60, 80, 95];
  const want = s3.pullMs; if (!(want >= 500 && want <= 700)) f.push('TOPS_S3_PULL missing or odd: ' + want);
  R.forEach(v => { if (Math.abs(s3.tp[v].D - want) > 0.5) f.push(`S3 Rhythm ${v}: pull ${s3.tp[v].D} ms, want ${want}`); });
  for (let i = 1; i < R.length; i++) if (!(s3.tp[R[i]].P >= s3.tp[R[i - 1]].P)) f.push(`S3 window narrows from Rhythm ${R[i - 1]} to ${R[i]}`);
  const old = { 20: 660, 40: 633.3, 60: 606.7, 80: 580, 95: 560 }; // the TT table's ms-to-tightest column at Rhythm level 0, .265, .5, .75, 1
  R.forEach(v => { if (Math.abs(s2.tp[v].D - old[v]) > 1.5) f.push(`S2 Rhythm ${v}: pull ${s2.tp[v].D}, want the 4.06 value ${old[v]}`); if (s2.tp[v].P !== s3.tp[v].P) f.push(`window differs S2 ${s2.tp[v].P} vs S3 ${s3.tp[v].P} at Rhythm ${v}`); });
  [20, 95].forEach(v => { if (!s3.hold[v].perfect) f.push(`S3 Rhythm ${v}: a 560 ms hold hold is not Perfect ${JSON.stringify(s3.hold[v])}`); });
  if (!(Math.abs(s2.hold[20].rel + 100) < 1)) f.push('S2 Rhythm 20: a 560 ms hold should be early (old pull) ' + JSON.stringify(s2.hold[20]));
  if (errs.length) f.push('page errors: ' + errs.slice(0, 3).join(' | '));
  await b.close();
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(res)); process.exit(1); }
  console.log(`PASS: Season 3 pull ${want} ms at every Rhythm (window ${R.map(v => s3.tp[v].P).join('/')} ms); a ${want} ms hold is Perfect at Rhythm 20 (${s3.hold[20].rel} ms) and 95 (${s3.hold[95].rel} ms); Season 2 unchanged (pull ${R.map(v => s2.tp[v].D).join('/')}, 560 ms hold at Rhythm 20 = ${s2.hold[20].rel} ms)`);
})();
