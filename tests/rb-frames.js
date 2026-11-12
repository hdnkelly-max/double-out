// Launch gate: frame cost of the rebrand in a match on a phone profile (390x844, CPU x4, phone assets), rebrand on vs off, N runs each.
// Records requestAnimationFrame deltas for 6 s of the player's turn. usage: node tests/rb-frames.js [dir] [N=3]
const { chromium } = require('playwright'); const path = require('path');
const dir = process.argv[2] || path.resolve(__dirname, '..'), N = +(process.argv[3] || 3);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const res = { '0': [], '1': [] };
  for (let i = 0; i < N; i++) for (const q of ['0', '1']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); const p = await ctx.newPage();
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: +(process.env.CPU || 4) }); await c.send('Performance.enable');
    await p.goto('file://' + dir + '/index.html?rebrand=' + q); await p.waitForFunction(() => window.TC_API && typeof S !== 'undefined' && window.C3, null, { timeout: 240000 }); await p.waitForTimeout(1000);
    await p.evaluate(() => { save.authSeen = true; save.name = 'T'; save.lessonDone = true; $('login').hidden = true; newCareer(); const cc = career(); cc.tier = 1; cc.stage = 'season'; persist(); const n = nextOpponent(); V.walkOn = () => {}; beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 40, legs: 3, start: 301 }); });
    await p.waitForTimeout(6000);
    const mt = async () => Object.fromEntries((await c.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value])); const m0 = await mt();
    const d = await p.evaluate(() => new Promise(res => { const a = []; let t = performance.now(); const t0 = t; const f = n => { a.push(n - t); t = n; if (n - t0 < 6000) requestAnimationFrame(f); else res(a); }; requestAnimationFrame(f); }));
    const m1 = await mt(); const style = +((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000).toFixed(1), layout = +((m1.LayoutDuration - m0.LayoutDuration) * 1000).toFixed(1), script = +((m1.ScriptDuration - m0.ScriptDuration) * 1000).toFixed(0);
    d.sort((x, y) => x - y); const med = d[d.length >> 1], p95 = d[Math.floor(d.length * .95)], long = d.filter(x => x > 50).length;
    res[q].push({ frames: d.length, med: +med.toFixed(1), p95: +p95.toFixed(1), long, style, layout, script }); console.log(q, JSON.stringify(res[q][res[q].length - 1]));
    await ctx.close();
  }
  const agg = q => { const r = res[q]; const m = k => +(r.reduce((s, x) => s + x[k], 0) / r.length).toFixed(1); return { frames: m('frames'), med: m('med'), p95: m('p95'), long: m('long'), styleMs: m('style'), layoutMs: m('layout'), scriptMs: m('script') }; };
  console.log('SUMMARY off ' + JSON.stringify(agg('0')) + ' on ' + JSON.stringify(agg('1'))); await b.close();
})();
