// TOPS asset regression (QA, 11 Nov, after tester report #10: blank board + plain black tee in Club singles).
// Plays several Club singles matches back to back in one session, at phone and desktop size, and checks that
// 1) the board face texture has real colour (red and green rings, numbers drawn, not blank),
// 2) the board on screen shows that colour,
// 3) the player's and opponent's shirt textures are drawn,
// 4) GPU textures and geometries stay flat across matches (needs 3+ matches; the default run plays 4),
// 5) with the character model requests failing, one Club match still shows a coloured board and drawn kits. (not a blank or near-black canvas).
// Usage: node tests/regress_assets.js [matches=3]   exits 1 on any failure.
const { chromium } = require('playwright');
const path = require('path');
const N = +process.argv[2] || 4;
const VIEWS = { phone: { width: 390, height: 844 }, desktop: { width: 1280, height: 800 } };
const TIERS = [1, 0, 1, 1, 0, 1];   // match 1 and match 4 are both Club, so the memory check compares like with like   // Club singles, with a pub rebuild in between to exercise venue swaps

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const fails = [], notes = [];
  const RUNS = [];
  for (const [vn, vp] of Object.entries(VIEWS)) RUNS.push([vn, vp, N, false]);
  for (const [vn, vp] of Object.entries(VIEWS)) RUNS.push([vn + ' (character models fail to load)', vp, 1, true]);   // a failed texture request must fall back, never a blank or black kit
  for (const [vn, vp, NM, failChars] of RUNS) {
    const p = await b.newPage({ viewport: vp });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/supabase\.co/, r => r.abort());
    if (failChars) await p.route(/assets\/(m\/)?chars\//, r => r.abort('failed'));
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: path.resolve(__dirname, '../node_modules/three/build/three.min.js'), contentType: 'application/javascript' }));   // offline test boxes
    // capture the board textures through the existing TOPS_BOARD hook (no game changes needed)
    await p.addInitScript(() => {
      let f = null;
      Object.defineProperty(window, 'TOPS_BOARD', { configurable: true, get() { return f && function (t, G) { window.__G = G; return f.apply(this, arguments); }; }, set(v) { f = v; } });
    });
    if (process.env.TOPS_QA_SABOTAGE) await p.addInitScript(() => { setTimeout(() => { CanvasRenderingContext2D.prototype.drawImage = function () {}; CanvasRenderingContext2D.prototype.putImageData = function () {}; }, 6000); });   // simulates iOS canvas memory exhaustion: new canvases stay blank
    await p.goto('file://' + path.resolve(__dirname, '../' + (process.env.TOPS_PAGE || 'double-out-standalone.html')), { waitUntil: 'domcontentloaded', timeout: 180000 });
    await p.waitForTimeout(4000);
    const ok = await p.evaluate(() => { try { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; V.walkOn = () => {}; newCareer(); return 'ok'; } catch (e) { return e.message; } });
    if (ok !== 'ok') { fails.push(`${vn}: setup ${ok}`); await p.close(); continue; }
    const mems = [];
    for (let m = 0; m < NM; m++) {
      const tier = TIERS[m % TIERS.length], tag = `${vn} match ${m + 1} (tier ${tier})`;
      await p.evaluate((tier) => { try { if (window.S && !S.done) S.done = true; } catch (e) {} try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {}
        const n = nextOpponent(); beginMatch({ mode: 'career', tier, p0: 'Test', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 1, start: 501 }); }, tier);
      await p.waitForTimeout(6000);
      const r = await p.evaluate(() => {
        const out = {};
        try { const mem = V._qa.renderer.info.memory; out.mem = { geo: mem.geometries, tex: mem.textures }; } catch (e) {}
        // 1) board face canvas
        const G = window.__G, img = G && G.boardTex && G.boardTex.image;
        if (!img || !img.getContext) out.board = 'no board canvas captured';
        else {
          const d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data; let red = 0, green = 0, opaque = 0, n = 0;
          for (let i = 0; i < d.length; i += 4 * 7) { n++; if (d[i + 3] > 200) opaque++; if (d[i] > 120 && d[i + 1] < 90 && d[i + 2] < 90) red++; if (d[i + 1] > 90 && d[i] < 90 && d[i + 2] < 120) green++; }
          out.boardPct = { red: +(red / n * 100).toFixed(2), green: +(green / n * 100).toFixed(2), opaque: +(opaque / n * 100).toFixed(1) };
        }
        // 3) shirt textures on the character figures in the scene (player and opponent). The base rig names the shirt material
        //    'Topmat'; the per-character models (assets/chars) put the shirt on a mesh like 'Ch01_Shirt' with one atlas material.
        const sc = V._qa && V._qa.scene, figs = sc ? sc.children.filter(o => o.userData && o.userData.rigged) : [];
        out.figs = figs.length; out.shirts = [];
        figs.forEach(f => { let img = null; f.traverse(o => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach(mt => { if (!img && /Top|Shirt|Hoody|Sweater|Vest/i.test((mt.name || '') + ' ' + (o.name || '')) && mt.map && mt.map.image) img = mt.map.image; }); });
          if (!img) { out.shirts.push('none'); return; }
          if (!img.getContext) { const w = img.naturalWidth || img.width || 0; out.shirts.push(img.complete === false || !w ? 'image not decoded' : 'image ok'); return; }
          const d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data; let s = 0, s2 = 0, n = 0, a = 0;
          for (let i = 0; i < d.length; i += 4 * 97) { const l = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]; s += l; s2 += l * l; n++; if (d[i + 3] > 200) a++; }
          const mean = s / n; out.shirts.push({ mean: +mean.toFixed(1), sd: +Math.sqrt(Math.max(0, s2 / n - mean * mean)).toFixed(1), opaque: +(a / n * 100).toFixed(1) }); });
        return out;
      });
      // 2) board on screen: red and green pixels in the board panel
      const shot = await p.screenshot({ type: 'png', clip: vn === 'phone' ? { x: 0, y: 40, width: 390, height: 300 } : { x: 0, y: 48, width: 740, height: 560 }, timeout: 90000 }).catch(() => null);
      let screen = null;
      if (shot) screen = await p.evaluate(async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let red = 0, green = 0, n = 0; for (let i = 0; i < d.length; i += 4 * 5) { n++; if (d[i] > 120 && d[i + 1] < 90 && d[i + 2] < 90) red++; if (d[i + 1] > 90 && d[i] < 90 && d[i + 2] < 120) green++; } return { red: +(red / n * 100).toFixed(2), green: +(green / n * 100).toFixed(2) }; }, shot.toString('base64'));
      if (r.mem) mems.push(r.mem);
      notes.push(`${tag}: gpu ${JSON.stringify(r.mem)} board ${JSON.stringify(r.boardPct || r.board)} screen ${JSON.stringify(screen)} figures ${r.figs} shirts ${JSON.stringify(r.shirts)}`);
      if (r.board) fails.push(`${tag}: ${r.board}`);
      else if (r.boardPct.red < .3 || r.boardPct.green < .3 || r.boardPct.opaque < 50) fails.push(`${tag}: board face blank or missing colour ${JSON.stringify(r.boardPct)}`);
      if (!screen) fails.push(`${tag}: board screenshot failed`);
      else if (screen.red < .5 || screen.green < .5) fails.push(`${tag}: board on screen has no red/green ${JSON.stringify(screen)}`);
      if (!r.figs) fails.push(`${tag}: no character figures in the scene`);
      r.shirts.forEach((sh, i) => { if (sh === 'none' || sh === 'image not decoded') fails.push(`${tag}: figure ${i} shirt texture ${sh === 'none' ? 'missing' : 'not decoded'}`); else if (typeof sh === 'object' && (sh.mean < 25 || sh.sd < 2 || sh.opaque < 50)) fails.push(`${tag}: figure ${i} shirt blank or black ${JSON.stringify(sh)}`); });
    }
    // 4) GPU memory stays flat match to match (#10 root cause: v1.75 leaked ~50-100 textures a match until uploads failed).
    //    Compare like tiers (match 1 vs the last tier-1 match) so a venue's own texture count doesn't read as a leak.
    if (mems.length >= 3) { const last = mems[mems.length - 1], first = mems[0];
      if (last.tex > first.tex + 15 || last.geo > first.geo + 40) fails.push(`${vn}: GPU memory grows across matches ${JSON.stringify(mems)}`); }
    if (errs.length) fails.push(`${vn}: page errors: ${[...new Set(errs)].slice(0, 3).join(' | ')}`);
    await p.close();
  }
  await b.close();
  notes.forEach(n => console.log('  ' + n));
  if (fails.length) { console.log('regress_assets: FAIL\n- ' + fails.join('\n- ')); process.exit(1); }
  console.log('regress_assets: all checks passed');
})();
