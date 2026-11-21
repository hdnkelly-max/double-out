// Director's audit (Season 3 art): (1) the Locker photo's shirt recolour left white blotches (the Vinyl masks missed the lit left side and the
// left sleeve); (2) a shirt reward ('Racing green shirt') showed an almost black square (no Vinyl w_rw_shirt, so the image switch gave its dark
// placeholder). In the real page with Season 3 on: the recoloured Locker photo (lk_m and lk_f) has no near-white pixels left on the shirt
// (counted inside a fixed shirt box, the shirt's own pixels found by the base photo's light, low-saturation fabric), and the shirt reward
// image is the full photo in the reward colour (green on the shirt), never a small dark placeholder. usage: node tests/s3-shirt.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const fail = [], out = {};
  const p = await b.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?s3=1', { timeout: 180000 }); await p.waitForFunction(() => window.TOPS_RB && TOPS_RB.recolour && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(1500);
  const BOX = { lk_m: [640, 285, 960, 585], lk_f: [660, 315, 935, 590] };   // the shirt and both sleeves, from the base photos
  out.res = await p.evaluate(async BOX => {
    const load = u => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(u); i.src = u; });
    const px = im => { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d'); g.drawImage(im, 0, 0); return { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data }; };
    const rc = (base, hex) => new Promise(ok => { const u = TOPS_RB.recolour(base, hex, '', v => ok(v)); if (u) ok(u); });
    const r = {};
    for (const base of ['lk_m', 'lk_f']) { const src = (window.TOPS_S3_HAVE || []).includes('assets/rb/' + base + '.jpg') ? 's3/assets/rb/' + base + '.jpg' : null; if (!src) { r[base] = 'no s3 base'; continue; }
      const B = px(await load(src)); const [x0, y0, x1, y1] = BOX[base]; const R = {};
      for (const hex of ['#1f5c3a', '#2e6fd6', '#d7232d']) { const url = await rc(base, hex); if (!url) { R[hex] = 'no image'; continue; } const O = px(await load(url)); let fab = 0, white = 0;
        for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const i = (y * B.w + x) * 4, br = B.d[i], bg = B.d[i + 1], bb = B.d[i + 2], mx = Math.max(br, bg, bb), mn = Math.min(br, bg, bb), lum = .3 * br + .59 * bg + .11 * bb;
          if (lum > 150 && (mx - mn) / mx < .45) { fab++; const o = O.d[i], og = O.d[i + 1], ob = O.d[i + 2], omx = Math.max(o, og, ob), omn = Math.min(o, og, ob); if (.3 * o + .59 * og + .11 * ob > 185 && (omx - omn) / omx < .2) white++; } }
        R[hex] = { fab, white }; }
      r[base] = R; }
    // the shirt reward image (the same function the Result and reward cards use)
    r.reward = await new Promise(ok => { const u = TOPS_RB.shirtImg('#1f5c3a', v => ok(v)); if (u) ok(u); }).then(async u => { if (!u) return 'none'; const O = px(await load(u)); let g = 0, n = 0;
      for (let i = 0; i < O.d.length; i += 4 * 97) { n++; if (O.d[i + 1] > O.d[i] + 15 && O.d[i + 1] > O.d[i + 2] + 5) g++; } return { w: O.w, h: O.h, green: Math.round(100 * g / n) }; });
    return r; }, BOX);
  for (const base of ['lk_m', 'lk_f']) { const R = out.res[base]; if (typeof R !== 'object') { fail.push(base + ': ' + R); continue; }
    for (const [hex, v] of Object.entries(R)) if (typeof v !== 'object' || v.fab < 2000 || v.white > v.fab * 0.01) fail.push(base + ' ' + hex + ' white left on the shirt: ' + JSON.stringify(v)); }
  const rw = out.res.reward; if (typeof rw !== 'object' || rw.w < 600 || rw.green < 3) fail.push('shirt reward image ' + JSON.stringify(rw));
  if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out).slice(0, 800)); console.log(fail.length ? 's3-shirt FAIL: ' + fail.join('; ') : 's3-shirt PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
