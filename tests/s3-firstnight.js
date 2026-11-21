// EXP-IDLE 1 first night (behind s3x=1). A brand-new Season 3 player: creator → That's me → Jonno's message → the first-night screen
// (event, first opponent, draw, prize, how you move up) → Walk on starts the Circuit quarter-final. Shown once per device; without s3x=1
// the match starts straight away as before. usage: node tests/s3-firstnight.js [dir]   (SHOTS=1 writes tests/s3_fn_<w>.png)
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const run = async (qs, vw, vh, fn) => { const ctx = await b.newContext({ viewport: { width: vw, height: vh }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} });
    await p.goto('file://' + dir + '/index.html' + qs, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await fn(p); if (pe.length) fail.push(qs + ' page errors ' + pe.join('; ').slice(0, 160)); await ctx.close(); };
  const vis = (p, sel) => p.evaluate(sel => { const e = document.querySelector(sel); return !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden'); }, sel).catch(() => false);
  const toFirstMatch = async p => {   // as a player taps it: New career → That's me → reply to Jonno
    await p.evaluate(() => { $('login').hidden = true; save.authSeen = true; persist(); showTitle(); }); await p.waitForTimeout(1200);
    await p.locator('#btnNewCareer').tap(); await p.waitForTimeout(1200); await p.fill('#cName', 'Hayden').catch(() => {}); await p.locator('#btnCreate').tap(); await p.waitForTimeout(1500);
    for (let i = 0; i < 8 && !(await vis(p, '#s3Fn')) && !(await p.evaluate(() => typeof S !== 'undefined' && !!S && !S.done)); i++) { if (await vis(p, '#msgReplies button')) await p.locator('#msgReplies button').first().tap().catch(() => {}); await p.waitForTimeout(900); } };
  for (const [w, h] of [[390, 844], [360, 640]]) await run('?s3=1&s3x=1', w, h, async p => {
    await toFirstMatch(p); const k = 'fn' + w;
    out[k] = await p.evaluate(() => { const d = document.getElementById('s3Fn'); if (!d) return null; const go = document.getElementById('s3FnGo').getBoundingClientRect();
      return { t: d.innerText, match: typeof S !== 'undefined' && !!S && !S.done, goIn: go.bottom <= innerHeight && go.top >= 0, wide: d.scrollWidth > innerWidth + 1, draw: d.querySelectorAll('.s3-fndraw li').length, ink: getComputedStyle(d).color, booked: !!career().circuit.live,
        // CAR-OPP follow-up (Producer 04:23): every average on the sheet is the one you play (the Circuit shift), not the raw engine figure
        avgs: [...d.querySelectorAll('.s3-fndraw li')].map(li => +((li.innerText.match(/avg (\d+)/) || [])[1])), about: +((d.innerText.match(/Averages about (\d+)/) || [])[1]),
        want: (() => { const k = career().circuit, E = TOPS_CIRCUIT, e = E.eventOf(k.live.id), n = k.live.rounds.length; return k.live.rounds.map((r, i) => TOPS_OPP_SHIFT(E.oppAvg(e.level, i, n, e.field), e.level, true)); })(),
        raw: (() => { const k = career().circuit, E = TOPS_CIRCUIT, e = E.eventOf(k.live.id), n = k.live.rounds.length; return k.live.rounds.map((r, i) => E.oppAvg(e.level, i, n, e.field)); })() }; });
    if (process.env.SHOTS) await p.screenshot({ path: path.join(__dirname, 's3_fn_' + w + '.png') });
    const o = out[k]; if (!o) { fail.push(w + ': no first-night screen'); return; }
    if (o.match) fail.push(w + ': the match started under the first-night screen'); if (!o.goIn) fail.push(w + ': Walk on not on screen'); if (o.wide) fail.push(w + ': scrolls sideways');
    if (!/your first night/i.test(o.t) || !/league night/i.test(o.t) || !/first up/i.test(o.t) || !/\$35/.test(o.t) || !/how you move up/i.test(o.t) || !/0 \/ 75/.test(o.t)) fail.push(w + ': copy ' + o.t.slice(0, 220).replace(/\n/g, ' | '));
    if (JSON.stringify(o.avgs) !== JSON.stringify(o.want) || o.about !== o.want[0] || JSON.stringify(o.want) === JSON.stringify(o.raw)) fail.push(w + ': sheet averages must be the ones you play ' + JSON.stringify({ shown: o.avgs, about: o.about, want: o.want, raw: o.raw }));
    if (o.draw !== 3) fail.push(w + ': draw cells ' + o.draw); if (o.ink !== 'rgb(243, 244, 242)') fail.push(w + ': text colour (tokens) ' + o.ink);
    await p.locator('#s3FnGo').tap(); for (let i = 0; i < 40 && !(await p.evaluate(() => typeof S !== 'undefined' && !!S && !S.done)); i++) await p.waitForTimeout(250);
    out[k + 'after'] = await p.evaluate(() => ({ gone: !document.getElementById('s3Fn'), s3: typeof S !== 'undefined' && S && S.s3, seen: localStorage.getItem('tops_s3_firstnight'), plays: typeof S !== 'undefined' && S ? S.oppAvg : null }));
    if (out[k + 'after'].plays !== o.want[0]) fail.push(w + ': the first match plays ' + out[k + 'after'].plays + ', the sheet said ' + o.want[0]);
    if (!out[k + 'after'].gone || !out[k + 'after'].s3 || out[k + 'after'].s3.round !== 'QF' || out[k + 'after'].seen !== '1') fail.push(w + ': Walk on ' + JSON.stringify(out[k + 'after']));
    if (w === 390) { await p.reload(); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(4000); if (await vis(p, '#s3Fn')) fail.push('first-night screen showed again after a reload'); } });
  await run('?s3=1&s3x=0', 390, 844, async p => { await toFirstMatch(p); out.off = { fn: await vis(p, '#s3Fn'), match: await p.evaluate(() => typeof S !== 'undefined' && !!S && !S.done) }; if (out.off.fn || !out.off.match) fail.push('without s3x: ' + JSON.stringify(out.off)); });
  console.log(JSON.stringify(out).slice(0, 700)); console.log(fail.length ? 's3-firstnight FAIL: ' + fail.join('; ') : 's3-firstnight PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
