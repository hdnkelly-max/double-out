// Director doc 74 under v3 (?v3=1): the Locker hero is the player's own V.heroShot (every creator choice, the real shirt colour) over
// lk_plate.jpg (the Kauri Arms locker with the photo's person taken out), not the recoloured man/woman photo; it fills in when the render
// arrives late; the figure is its own img (whole head inside the card with headroom, shadow onto the locker, under the name's shade); the level-up reward hero and the shirt reward tile keep career3's own render (rb.js no longer swaps them). TOPS_LK74=0 under
// v3, and v3 off, keep the photo path exactly (data-base lk_m/lk_f, no plate, the reward photo swap still runs). usage: node tests/s3-lk74.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const http = require('http'); const dir = path.resolve(process.argv[2] || path.resolve(__dirname, '..'));
// over http, not file:// (Q&D 22 Nov): the page fetch()es the S3 rig file, which file:// refuses, so a file:// run only ever saw the stand-in
const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(dir, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'content-type': /\.html$/.test(u) ? 'text/html' : /\.js$/.test(u) ? 'text/javascript' : /\.css$/.test(u) ? 'text/css' : /\.jpe?g$/.test(u) ? 'image/jpeg' : /\.png$/.test(u) ? 'image/png' : 'application/octet-stream' }); r.end(d); }); }).listen(0);
const URL0 = () => 'http://127.0.0.1:' + srv.address().port + '/index.html';
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const MIA = { v: 1, base: 'mia', shirt: '#0e7c86', acc: [] }, RAY = { v: 1, base: 'ray', body: 'heavy', face: 'clean', hairC: '#c9c4bc', shirt: '#2a2b33', acc: ['glasses', 'band', 'cap'], accSet: true };
  const run = async (tag, v3, look, { lk74 = 1, late = 0 } = {}) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(lk => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} if (!lk) window.TOPS_LK74 = 0; }, lk74);
    const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.goto(URL0() + '?s3=1&v3=' + v3, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.TOPS_S3UI && window.TOPS_RB, null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(([look, late]) => {
      if (late && typeof V !== 'undefined') { const real = V.heroShot; let n = 0; V.heroShot = function () { return ++n <= late ? '' : real.apply(this, arguments); }; }   // the render isn't ready for the first few asks
      save.name = 'Hayden'; save.lessonDone = true; newCareer(); save.vlook = Object.assign({ at: Date.now() }, look); save.v3NewLook = 1; persist();
      $('login').hidden = true; save.authSeen = true; try { $('title').hidden = true; } catch (e) {} TOPS_RB.open('locker'); }, [look, late]);
    const filled = await p.waitForFunction(() => { const e = document.getElementById('rbLkHero'); return e && /lk_plate\.jpg/.test(e.style.background) && !!TOPS_RB.lkInfo(); }, null, { timeout: v3 === '1' && lk74 ? 30000 : 4000 }).then(() => true, () => false);
    const r = await p.evaluate(() => { const e = document.getElementById('rbLkHero'), bg = e ? e.style.background : '';
      const fe = document.getElementById('rbLkFig'), fi = fe && fe.querySelector('img'); let same = null; try { same = !!fi && TOPS_RB.lkFig(career().tier) === fi.src; } catch (e) { same = 'err ' + e.message; }
      // the level-up overlay: a stand-in for career3's #c3rw with its own render on top and a shirt reward tile
      const ov = document.createElement('div'); ov.id = 'c3rw'; ov.innerHTML = '<img class="rwhero" src="data:image/png;base64,iVBORw0KGgo="><div id="c3rwUnl">Level 4 <span class="ri ri-hero"><img src="data:image/png;base64,iVBORw0KGgo="></span></div>'; document.body.appendChild(ov);
      TOPS_RB.fixReward(); const h = ov.querySelector('img.rwhero'), ri = ov.querySelector('.ri.ri-hero');
      const rw = { heroKept: !h.dataset.rb && h.src === 'data:image/png;base64,iVBORw0KGgo=', tileTouched: !!ri.dataset.rb }; ov.remove();
      const fig = fe && !fe.hidden && fi ? fi.src : '';
      // the figure sits in the card: head inside with headroom, a shadow and a lamp edge, under the name's shade
      const card = e && e.closest('.rb-hero').getBoundingClientRect(), fr = fe ? fe.getBoundingClientRect() : null, cs = fe ? getComputedStyle(fe) : null, sh = e && e.parentNode.querySelector('.rb-sh2');
      const li = TOPS_RB.lkInfo(), comp = fe && li ? { top: li.head, drop: (() => { const c = fe.querySelector('.rb-lkcast'), r = fe.querySelector('.rb-lkrim'); if (!c || !r) return false; const cc = getComputedStyle(c), rc = getComputedStyle(r), op = +cc.opacity, m = x => /url\(/.test(x.maskImage || x.webkitMaskImage || ''); const t = new DOMMatrix(cc.transform);
        return op >= .25 && op <= .35 && t.m41 > 0 && t.m42 > 0 && m(cc) && m(rc); })(),   /* Director doc 82: a cast shadow of the figure's own silhouette down and to the right at 25-35%, and the lamp rim */ shade: !!fe.querySelector('.rb-lkshade') && /url\(/.test(getComputedStyle(fe.querySelector('.rb-lkshade')).maskImage || getComputedStyle(fe.querySelector('.rb-lkshade')).webkitMaskImage || ''), under: !!sh && !!(fe.compareDocumentPosition(sh) & Node.DOCUMENT_POSITION_FOLLOWING) } : null;
      return new Promise(ok => { if (!fig) return ok(0); const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
        const d = g.getImageData(0, Math.round(im.height * .5), im.width, Math.round(im.height * .2)).data; let n = 0, t = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { n++; if (d[i + 2] > d[i] + 40 && d[i + 1] > d[i] + 40) t++; } ok(n ? t / n : 0); }; im.onerror = () => ok(-1); im.src = fig; })
      .then(teal => ({ comp, teal: Math.round(teal * 100) / 100, base: e && e.dataset.base, plate: /lk_plate\.jpg/.test(bg), fig: !!fig, same, rw, lk: TOPS_RB.v3Lk() })); });
    r.filled = filled; r.pe = pe.slice(0, 2); out[tag] = r; await ctx.close(); return r; };

  let r = await run('mia', '1', MIA);
  if (r.base !== 'lk74' || !r.filled || r.same !== true) fail.push('v3 Mia Locker hero isn\'t her render over the plate ' + JSON.stringify(r));
  if (!r.comp || r.comp.top < 8 || r.comp.top > 12 || !r.comp.drop || !r.comp.shade || !r.comp.under) fail.push('v3 Locker figure composition (head inside with headroom, cast shadow down-right and lamp rim (doc 82), under the name shade) ' + JSON.stringify(r.comp));
  if (r.teal < .15) fail.push('v3 Mia teal shirt not teal on the Locker figure ' + r.teal);
  if (!r.rw.heroKept || r.rw.tileTouched) fail.push('v3 reward hero/tile swapped for the photo ' + JSON.stringify(r.rw));
  r = await run('ray', '1', RAY); if (r.base !== 'lk74' || !r.filled || r.same !== true) fail.push('v3 Ray save Locker hero ' + JSON.stringify(r));
  if (r.teal > .05) fail.push('v3 Ray charcoal shirt reads teal ' + r.teal);
  r = await run('late', '1', MIA, { late: 3 }); if (!r.filled || r.same !== true) fail.push('late render never filled the Locker hero ' + JSON.stringify(r));
  r = await run('lk74off', '1', MIA, { lk74: 0 }); if (r.base !== 'lk_f' || r.plate || r.lk) fail.push('TOPS_LK74=0 under v3 isn\'t the photo path ' + JSON.stringify(r));
  if (r.rw.heroKept) fail.push('TOPS_LK74=0: reward photo swap didn\'t run ' + JSON.stringify(r.rw));
  r = await run('v3off', '0', MIA); if (!/^lk_[mf]$/.test(r.base || '') || r.plate || r.lk) fail.push('v3 off changed ' + JSON.stringify(r));
  if (r.rw.heroKept) fail.push('v3 off: reward photo swap didn\'t run ' + JSON.stringify(r.rw));
  // ChatGPT 8.0 framing pass at 360: the highest point (hair, bun, cap) 8-12 px below the card top across the look range, and long names
  { const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true }); await ctx.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.goto(URL0() + '?s3=1&v3=1', { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.TOPS_S3UI && window.TOPS_RB, null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(() => { save.name = 'Hayden'; save.lessonDone = true; newCareer(); save.v3NewLook = 1; $('login').hidden = true; save.authSeen = true; try { $('title').hidden = true; } catch (e) {} });
    const looks = []; for (const base of ['kai', 'ray', 'tama', 'mia', 'dazza']) { looks.push({ base }); for (const hair of ['quiff', 'curly', 'mullet', 'ponytail']) looks.push({ base, hair }); looks.push({ base, acc: ['cap'], accSet: true }); }
    const heads = []; for (const L of looks) { const r = await p.evaluate(async L => { save.vlook = Object.assign({ v: 1, at: Date.now() }, L); const u0 = (TOPS_RB.lkInfo() || {}).u; TOPS_RB.open('locker');
        for (let i = 0; i < 80; i++) { await new Promise(r => setTimeout(r, 250)); const k = TOPS_RB.lkInfo(); if (k && k.u !== u0) return k.head; } return null; }, L); heads.push(r); }
    out.heads360 = heads; const bad = heads.map((h, i) => (h == null || h < 8 || h > 12) ? JSON.stringify(looks[i]) + ':' + h : null).filter(Boolean); if (bad.length) fail.push('360 headroom outside 8-12 px: ' + bad.join(' '));
    const names = []; for (const nm of ['Hayden', 'Christopher', 'Maximilian-James', 'Wiremu Te Rangi', 'WWWWWWWWWWWWWWWW']) { names.push(await p.evaluate(async nm => { save.name = nm; TOPS_RB.open('locker'); await new Promise(r => setTimeout(r, 400));
        const e = document.querySelector('#rbApp .rb-hero #rbLkHero ~ .rb-tx .rb-big'), cs = getComputedStyle(e), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * .95;
        return { nm, fs: parseFloat(cs.fontSize), over: e.scrollWidth > e.clientWidth + 1, lines: Math.round(e.getBoundingClientRect().height / lh), inCard: e.getBoundingClientRect().top >= e.closest('.rb-hero').getBoundingClientRect().top }; }, nm)); }
    out.names360 = names; names.forEach(n => { if (n.over || n.fs < (/[\s-]/.test(n.nm) ? 22 : 18) || n.lines > 2 || !n.inCard) fail.push('360 long name ' + JSON.stringify(n)); }); if (names[0].fs !== 32 || names[0].lines !== 1) fail.push('360 short name changed ' + JSON.stringify(names[0]));
    out.range = { pe: pe.slice(0, 2) }; await ctx.close(); }
  for (const k of Object.keys(out)) if (out[k].pe && out[k].pe.length) fail.push(k + ' page errors ' + out[k].pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out)); console.log(fail.length ? 's3-lk74 FAIL: ' + fail.join('; ') : 's3-lk74 PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
