// Launch blocker check (Overseer 22:08): does the 3D board ever draw without its texture, with the rebrand on vs off?
// N runs per mode and size, alternating on/off; each run: fresh page, career match, 4 s in, sample the board pane for red/green segment pixels.
// usage: node tests/board-blank.js [dir] [N=10]
const { chromium } = require('playwright'); const path = require('path');
const dir = process.argv[2] || path.resolve(__dirname, '..'), N = +(process.argv[3] || 10);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const res = [];
  let i = 0;
  for (const [W, H] of (process.env.SIZES || '390x844,360x640').split(',').map(s => s.split('x').map(Number))) for (i = 0; i < N; i++) for (const q of ['0', '1']) {
    const ctx = await b.newContext({ viewport: { width: W, height: H } }); const p = await ctx.newPage(); const req = [];
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); p.on('requestfailed', r => req.push(r.url().split('/').slice(-2).join('/')));
    const t0 = Date.now(); let blank = null, info = {};
    try {
      await p.goto('file://' + dir + '/index.html?rebrand=' + q); await p.waitForFunction(() => window.TC_API && typeof S !== 'undefined' && window.C3, null, { timeout: 120000 }); await p.waitForTimeout(800);
      await p.evaluate(() => { save.authSeen = true; save.name = 'T'; $('login').hidden = true; newCareer(); const c = career(); c.tier = 1; persist(); const n = nextOpponent(); V.walkOn = () => {}; beginMatch({ mode: 'career', tier: 1, p0: 'T', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 40, legs: 3, start: 301 }); });
      await p.waitForTimeout(4000);
      const L = await p.evaluate(() => V.lkRects().board);
      const png = await p.screenshot({ clip: { x: 0, y: L.y + 10, width: Math.min(W, L.w), height: Math.min(L.h - 20, 300) } });
      require('fs').mkdirSync(process.env.BBDIR || '/tmp/claude-0/bb', { recursive: true }); require('fs').writeFileSync(path.join(process.env.BBDIR || '/tmp/claude-0/bb', `${W}_${q}_${i}.png`), png);
      info.tex = await p.evaluate(() => { try { const t = []; V.scene && V.scene.traverse(o => { if (o.material && o.material.map && o.name && /board/i.test(o.name)) t.push(!!(o.material.map.image && (o.material.map.image.width || o.material.map.image.videoWidth))); }); return t; } catch (e) { return 'n/a'; } });
    } catch (e) { info.err = e.message.slice(0, 80); }
    res.push({ W, q, blank, ms: Date.now() - t0, failed: req.slice(0, 3), ...info }); console.log(JSON.stringify(res[res.length - 1]));
    await ctx.close();
  }
  const sum = {}; res.forEach(r => { const k = r.W + ' rebrand=' + r.q; sum[k] = sum[k] || { runs: 0, blank: 0, unknown: 0 }; sum[k].runs++; if (r.blank === true) sum[k].blank++; if (r.blank === null) sum[k].unknown++; });
  console.log('SUMMARY ' + JSON.stringify(sum)); await b.close();
})();
