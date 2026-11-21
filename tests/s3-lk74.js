// Director doc 74 under v3 (?v3=1): the Locker hero is the player's own V.heroShot (every creator choice, the real shirt colour) over
// lk_plate.jpg (the Kauri Arms locker with the photo's person taken out), not the recoloured man/woman photo; it fills in when the render
// arrives late; the level-up reward hero and the shirt reward tile keep career3's own render (rb.js no longer swaps them). TOPS_LK74=0 under
// v3, and v3 off, keep the photo path exactly (data-base lk_m/lk_f, no plate, the reward photo swap still runs). usage: node tests/s3-lk74.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const MIA = { v: 1, base: 'mia', shirt: '#0e7c86', acc: [] }, RAY = { v: 1, base: 'ray', body: 'heavy', face: 'clean', hairC: '#c9c4bc', shirt: '#2a2b33', acc: ['glasses', 'band', 'cap'], accSet: true };
  const run = async (tag, v3, look, { lk74 = 1, late = 0 } = {}) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(lk => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} if (!lk) window.TOPS_LK74 = 0; }, lk74);
    const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.goto('file://' + dir + '/index.html?s3=1&v3=' + v3, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.TOPS_S3UI && window.TOPS_RB, null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(([look, late]) => {
      if (late && typeof V !== 'undefined') { const real = V.heroShot; let n = 0; V.heroShot = function () { return ++n <= late ? '' : real.apply(this, arguments); }; }   // the render isn't ready for the first few asks
      save.name = 'Hayden'; save.lessonDone = true; newCareer(); save.vlook = Object.assign({ at: Date.now() }, look); save.v3NewLook = 1; persist();
      $('login').hidden = true; save.authSeen = true; try { $('title').hidden = true; } catch (e) {} TOPS_RB.open('locker'); }, [look, late]);
    const filled = await p.waitForFunction(() => { const e = document.getElementById('rbLkHero'); return e && /lk_plate\.jpg/.test(e.style.background) && /data:image\/png/.test(e.style.background); }, null, { timeout: v3 === '1' && lk74 ? 30000 : 4000 }).then(() => true, () => false);
    const r = await p.evaluate(() => { const e = document.getElementById('rbLkHero'), bg = e ? e.style.background : '';
      let same = null; try { const u = V.heroShot(save.look, save.name || 'You', career().tier | 0, save.flight); same = !!u && bg.includes(u.slice(0, 200)) && bg.indexOf('data:image/png') < bg.indexOf('lk_plate'); } catch (e) { same = 'err ' + e.message; }
      // the level-up overlay: a stand-in for career3's #c3rw with its own render on top and a shirt reward tile
      const ov = document.createElement('div'); ov.id = 'c3rw'; ov.innerHTML = '<img class="rwhero" src="data:image/png;base64,iVBORw0KGgo="><div id="c3rwUnl">Level 4 <span class="ri ri-hero"><img src="data:image/png;base64,iVBORw0KGgo="></span></div>'; document.body.appendChild(ov);
      TOPS_RB.fixReward(); const h = ov.querySelector('img.rwhero'), ri = ov.querySelector('.ri.ri-hero');
      const rw = { heroKept: !h.dataset.rb && h.src === 'data:image/png;base64,iVBORw0KGgo=', tileTouched: !!ri.dataset.rb }; ov.remove();
      return { base: e && e.dataset.base, plate: /lk_plate\.jpg/.test(bg), fig: /data:image\/png/.test(bg), same, rw, lk: TOPS_RB.v3Lk() }; });
    r.filled = filled; r.pe = pe.slice(0, 2); out[tag] = r; await ctx.close(); return r; };

  let r = await run('mia', '1', MIA);
  if (r.base !== 'lk74' || !r.filled || r.same !== true) fail.push('v3 Mia Locker hero isn\'t her render over the plate ' + JSON.stringify(r));
  if (!r.rw.heroKept || r.rw.tileTouched) fail.push('v3 reward hero/tile swapped for the photo ' + JSON.stringify(r.rw));
  r = await run('ray', '1', RAY); if (r.base !== 'lk74' || !r.filled || r.same !== true) fail.push('v3 Ray save Locker hero ' + JSON.stringify(r));
  r = await run('late', '1', MIA, { late: 3 }); if (!r.filled || r.same !== true) fail.push('late render never filled the Locker hero ' + JSON.stringify(r));
  r = await run('lk74off', '1', MIA, { lk74: 0 }); if (r.base !== 'lk_f' || r.plate || r.lk) fail.push('TOPS_LK74=0 under v3 isn\'t the photo path ' + JSON.stringify(r));
  if (r.rw.heroKept) fail.push('TOPS_LK74=0: reward photo swap didn\'t run ' + JSON.stringify(r.rw));
  r = await run('v3off', '0', MIA); if (!/^lk_[mf]$/.test(r.base || '') || r.plate || r.lk) fail.push('v3 off changed ' + JSON.stringify(r));
  if (r.rw.heroKept) fail.push('v3 off: reward photo swap didn\'t run ' + JSON.stringify(r.rw));
  for (const k of Object.keys(out)) if (out[k].pe.length) fail.push(k + ' page errors ' + out[k].pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out)); console.log(fail.length ? 's3-lk74 FAIL: ' + fail.join('; ') : 's3-lk74 PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
