// Director's audit (Season 3 art): (1) the Locker photo's shirt recolour left white blotches (the Vinyl masks missed the lit left side and the
// left sleeve); (2) a shirt reward ('Racing green shirt') showed an almost black square (no Vinyl w_rw_shirt, so the image switch gave its dark
// placeholder). In the real page with Season 3 on: on the recoloured Locker photo (lk_m and lk_f) every fixed shirt point, left side and left
// sleeve included, takes the shirt colour (green, blue, red each lead on it), and the shirt reward
// image is the full photo in the reward colour (green on the shirt), never a small dark placeholder. usage: node tests/s3-shirt.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const fail = [], out = {};
  const p = await b.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?s3=1', { timeout: 180000 }); await p.waitForFunction(() => window.TOPS_RB && TOPS_RB.recolour && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(1500);
  // points that are shirt in the base photos (left side and left sleeve included: the parts the old masks missed), checked by hand on a grid
  const PTS = { lk_m: [[700, 500], [705, 550], [712, 450], [668, 340], [682, 380], [700, 320], [800, 450], [860, 500]], lk_f: [[715, 500], [712, 550], [718, 460], [690, 370], [700, 345], [800, 450], [840, 520]] };
  const CH = { '#1f5c3a': 1, '#2e6fd6': 2, '#d7232d': 0 };   // the channel that must lead on the shirt in that colour
  out.res = await p.evaluate(async ([PTS, CH]) => {
    const load = u => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(u); i.src = u; });
    const px = im => { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d'); g.drawImage(im, 0, 0); return { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data }; };
    const rc = (base, hex) => new Promise(ok => { const u = TOPS_RB.recolour(base, hex, '', v => ok(v)); if (u) ok(u); });
    const r = {};
    for (const base of ['lk_m', 'lk_f']) { if (!(window.TOPS_S3_HAVE || []).includes('assets/rb/' + base + '.jpg')) { r[base] = 'no s3 base'; continue; } const R = {};
      for (const [hex, ch] of Object.entries(CH)) { const url = await rc(base, hex); if (!url) { R[hex] = 'no image'; continue; } const O = px(await load(url));
        R[hex] = PTS[base].filter(([x, y]) => { const i = (y * O.w + x) * 4, v = [O.d[i], O.d[i + 1], O.d[i + 2]]; return !(v[ch] > Math.max(...v.filter((_, k) => k !== ch)) + 12); }).map(q => q.join(',')); }
      r[base] = R; }
    // the shirt reward image (the same function the Result and reward cards use)
    r.reward = await new Promise(ok => { const u = TOPS_RB.shirtImg('#1f5c3a', v => ok(v)); if (u) ok(u); }).then(async u => { if (!u) return 'none'; const O = px(await load(u)); let g = 0, n = 0;
      for (let i = 0; i < O.d.length; i += 4 * 97) { n++; if (O.d[i + 1] > O.d[i] + 15 && O.d[i + 1] > O.d[i + 2] + 5) g++; } return { w: O.w, h: O.h, green: Math.round(100 * g / n) }; });
    return r; }, [PTS, CH]);
  for (const base of ['lk_m', 'lk_f']) { const R = out.res[base]; if (typeof R !== 'object') { fail.push(base + ': ' + R); continue; }
    for (const [hex, v] of Object.entries(R)) if (!Array.isArray(v) || v.length) fail.push(base + ' ' + hex + ' shirt points not recoloured: ' + JSON.stringify(v)); }
  const rw = out.res.reward; if (typeof rw !== 'object' || rw.w < 600 || rw.green < 3) fail.push('shirt reward image ' + JSON.stringify(rw));
  if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out).slice(0, 800)); console.log(fail.length ? 's3-shirt FAIL: ' + fail.join('; ') : 's3-shirt PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
