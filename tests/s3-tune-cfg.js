// CAR-TUNE config (Overseer 19:45): tops_tune read once at load, baked fallback, per-value validation, frozen per match, Season 3 only.
//   1 no table / network error: baked values (win 1, ramp 40), src 'baked', tune_fail logged, the game plays
//   2 valid rows: tier 1 win_scale .9, ramp 30 -> a Club match has the window x.9 and tp.ramp 27 (win_scale scales the ramp too); Pub keeps 1 / 40
//   3 bad values are dropped one by one (win 3, ramp -5, tier 9, text) -> baked for those, good ones kept
//   4 a new read mid-match doesn't change that match; the next match uses it
//   5 Season 2 (?s3=0): no tops_tune request, no ramp, window unchanged
//   6 one request per page load
// usage: node tests/s3-tune-cfg.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] }); const f = []; const out = {};
  async function page(q, body, status) {
    const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); let reqs = 0;
    await p.route(/jsdelivr|googleapis|gstatic/, r => r.abort());
    await p.route(/supabase\.co/, r => { if (/tops_tune/.test(r.request().url())) { reqs++; if (body === null) return r.abort(); return r.fulfill({ status: status || 200, contentType: 'application/json', body: JSON.stringify(body) }); } r.abort(); });
    await p.goto('file://' + path.join(dir, 'index.html') + q); await p.waitForTimeout(4500);
    return { p, errs, reqs: () => reqs };
  }
  const probe = (p) => p.evaluate(() => {
    save.authSeen = true; newCareer(); save.st2 = save.st2 || {}; save.st2.v = { sc: 50, fi: 50, ct: 50, rh: 50, co: 50 };
    const tpAt = t => { career().tier = t; beginMatch({ mode: 'career', tier: t, p0: 'P', oppName: 'X', oppAvg: 50, legs: 1 }); const en = effNerves; effNerves = () => 0; let tp; try { tp = throwParams(); } finally { effNerves = en; } const r = { P: +tp.P.toFixed(3), ramp: tp.ramp, tune: S.tune }; return r; };
    const o = { state: window.TOPS_TUNE ? TOPS_TUNE.state() : null, pub: tpAt(0), club: tpAt(1) }; S.done = true; return o;
  });
  // 1 no table
  { const { p, errs } = await page('?s3=1', [], 404); const r = await probe(p); out.none = r;
    if (!r.state || r.state.src !== 'baked' || r.club.tune.win !== 1 || r.club.ramp !== 40 || r.pub.ramp !== 40) f.push('1 no table: not baked ' + JSON.stringify(r));
    out.base = { pub: r.pub.P, club: r.club.P }; if (errs.length) f.push('1 page errors ' + errs[0]); await p.close(); }
  // 2 valid rows + 6 one request
  { const { p, errs, reqs } = await page('?s3=1', [{ tier: 0, win_scale: 1, ramp_ms: 40 }, { tier: 1, win_scale: 0.9, ramp_ms: 30, updated_at: '2026-11-19T07:00:00Z' }]);
    const r = await probe(p); out.valid = r;
    if (r.state.src !== 'db' || Math.abs(r.club.P - out.base.club * 0.9) > 0.01 || Math.abs(r.club.ramp - 27) > 1e-9) f.push('2 Club not x.9 / ramp 30 ' + JSON.stringify(r.club) + ' base ' + out.base.club);
    if (Math.abs(r.pub.P - out.base.pub) > 0.001 || r.pub.ramp !== 40) f.push('2 Pub changed ' + JSON.stringify(r.pub));
    const card = await p.evaluate(() => { career().tier = 1; const a = TOPS_FXLINE('rh', 20, 20); career().tier = 0; const b = TOPS_FXLINE('rh', 20, 20); return { club: a, pub: b, w: TOPS_WIN(0) }; });
    if (!card.club.includes(String(Math.round(card.w * 0.9 * 10) / 10)) || !card.pub.includes(String(card.w))) f.push('2 Rhythm card does not show the tier window ' + JSON.stringify(card));
    // 4 frozen per match
    const fr = await p.evaluate(async () => { career().tier = 1; beginMatch({ mode: 'career', tier: 1, p0: 'P', oppName: 'X', oppAvg: 50, legs: 1 }); const before = S.tune.win;
      const _f = window.fetch; window.fetch = async () => new Response(JSON.stringify([{ tier: 1, win_scale: 1.2, ramp_ms: 50 }]), { status: 200 }); try { await TOPS_TUNE.load(); } finally { window.fetch = _f; }
      const during = S.tune.win; S.done = true; beginMatch({ mode: 'career', tier: 1, p0: 'P', oppName: 'X', oppAvg: 50, legs: 1 }); const next = S.tune.win; S.done = true; return { before, during, next }; });
    if (fr.before !== 0.9 || fr.during !== 0.9 || fr.next !== 1.2) f.push('4 not frozen per match ' + JSON.stringify(fr));
    if (reqs() !== 1) f.push('6 requests at load: ' + reqs()); if (errs.length) f.push('2 page errors ' + errs[0]); await p.close(); }
  // 3 bad values
  { const { p } = await page('?s3=1', [{ tier: 1, win_scale: 3, ramp_ms: 30 }, { tier: 2, win_scale: 0.8, ramp_ms: -5 }, { tier: 9, win_scale: 0.7, ramp_ms: 10 }, { tier: 'x', win_scale: 'a' }, { tier: 3, win_scale: 'abc', ramp_ms: 'z' }]);
    const st = await p.evaluate(() => TOPS_TUNE.state()); out.bad = st;
    const want = { win: [1, 1, 0.8, 1, 1, 1, 1], ramp: [40, 30, 40, 40, 40, 40, 40] };
    if (JSON.stringify(st.win) !== JSON.stringify(want.win) || JSON.stringify(st.ramp) !== JSON.stringify(want.ramp)) f.push('3 validation ' + JSON.stringify(st));
    await p.close(); }
  // 5 Season 2
  { const { p, reqs } = await page('?s3=0', [{ tier: 1, win_scale: 0.5, ramp_ms: 100 }]); const r = await probe(p); out.s2 = r;
    if (reqs() !== 0) f.push('5 Season 2 requested tops_tune'); if (r.club.ramp !== undefined || r.club.tune) f.push('5 Season 2 has a ramp/tune ' + JSON.stringify(r.club));
    await p.close(); }
  await b.close();
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
  console.log(`PASS: no table -> baked (win 1, ramp 40); Club row x.9 / 30 ms applied (window x.9, ramp 30 x .9 = 27 ms) (P ${out.base.club} -> ${out.valid.club.P}), Pub untouched; the Rhythm card shows the tier's window; bad values dropped one by one; frozen per match, next match takes the new read; Season 2 makes no request and has no ramp; one request per load`);
})();
