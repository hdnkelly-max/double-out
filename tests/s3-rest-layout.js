// CAR-DEADWK layout (Q&D 21 Nov send-back): at 360 and 390
//   1 Rest week: the button title reads "Advance to week N", fits inside the button (no text on the edges), detail in the small line
//   2 broke week with the most posters on: the "can't afford" card with the recovery entry sits ABOVE the posters and inside the first screen
//   3 the recovery button reads "Recovery entry", fits, and still works by touch
// Captures: wip/car-deadwk/s3-layout-<w>-rest.jpg, wip/car-deadwk/s3-layout-<w>-broke.jpg
// usage: node tests/s3-rest-layout.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] }); const f = []; const out = {};
  fs.mkdirSync(path.join(dir, 'wip/car-deadwk'), { recursive: true });
  for (const W of [360, 390]) {
    const H = W === 360 ? 780 : 844;
    const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); const url = 'file://' + path.join(dir, 'index.html') + '?s3=1';
    await p.goto(url); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TC_API, null, { timeout: 120000 }); await p.waitForTimeout(1500);
    const show = async (setup) => p.evaluate(async (setup) => {
      save.authSeen = true; save.lessonDone = true; save.tcWelSeen = 1; $('login').hidden = true; V.walkOn = () => {}; window.showMsg = (m, cb) => { try { cb && cb('ok'); } catch (e) {} };
      if (!career() || !career().circuit) newCareer(); const c = career(), k = c.circuit, E = TOPS_CIRCUIT;
      if (setup === 'rest') { k.live = null; k.level = 2; c.bank = 900; k.debt = 0; c.tier = 2; let w = 1; while (E.calendar(Object.assign({}, k, { week: w })).length && w < 60) w++; k.week = w; }
      else { // the level/week with the most events on, broke, owing a little (the Q&D case: every poster unaffordable)
        let best = null; for (const L of [2, 1, 0, 3]) for (let w = 1; w <= 12; w++) { const n = E.calendar(Object.assign({}, k, { level: L, week: w, live: null })).length; if (!best || n > best.n) best = { L, w, n }; }
        k.live = null; k.level = best.L; k.week = best.w; c.bank = 0; k.debt = 40; c.tier = best.L; }
      persist(); try { showHub('play'); } catch (e) {} await new Promise(r => setTimeout(r, 2000));
      try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim,#s3Sheet').forEach(e => e.remove());
      const fit = sel => { const btn = document.querySelector(sel); if (!btn) return null; btn.scrollIntoView({ block: 'center' }); const r = btn.getBoundingClientRect(), t = btn.querySelector('b'), s = btn.querySelector('small');
        const tr = t.getBoundingClientRect(), sr = s ? s.getBoundingClientRect() : null, cs = getComputedStyle(btn), pad = parseFloat(cs.paddingLeft);
        return { title: t.textContent.trim(), small: s ? s.textContent.trim() : '', bottom: Math.round(r.bottom), h: Math.round(r.height), inside: tr.left >= r.left + pad - 1 && tr.right <= r.right - pad + 1 && tr.top >= r.top && tr.bottom <= r.bottom && (!sr || (sr.top >= r.top && sr.bottom <= r.bottom + 1)),
          overflow: t.scrollWidth > t.clientWidth + 1, lines: Math.round(tr.height / parseFloat(getComputedStyle(t).lineHeight)) }; };
      window.scrollTo(0, 0); document.querySelectorAll('#rbApp, #rbApp *').forEach(e => { if (e.scrollTop) e.scrollTop = 0; });
      const o = { setup, cal: E.calendar(k).length, level: k.level, week: k.week };
      if (setup === 'rest') o.rest = fit('#rbApp [data-s3="rest"]');
      else { const card = document.querySelector('#rbApp .s3-broke'), post = document.querySelector('#rbApp .s3-post'); o.rec = fit('#rbApp [data-s3="rec"]'); window.scrollTo(0, 0); document.querySelectorAll('#rbApp, #rbApp *').forEach(e => { if (e.scrollTop) e.scrollTop = 0; }); { const rb = document.querySelector('#rbApp [data-s3="rec"]'); o.recBottom = rb ? Math.round(rb.getBoundingClientRect().bottom) : null; }
        window.scrollTo(0, 0); document.querySelectorAll('#rbApp, #rbApp *').forEach(e => { if (e.scrollTop) e.scrollTop = 0; });
        o.cardTop = card ? Math.round(card.getBoundingClientRect().top) : null; o.cardBottom = card ? Math.round(card.getBoundingClientRect().bottom) : null; o.postTop = post ? Math.round(post.getBoundingClientRect().top) : null;
        o.unaffordable = document.querySelectorAll('#rbApp .s3-post .s3-off').length; o.vh = innerHeight; }
      return o; }, setup);
    const rest = await show('rest'); await p.waitForTimeout(300); await p.screenshot({ path: path.join(dir, `wip/car-deadwk/s3-layout-${W}-rest.jpg`), quality: 80 });
    const broke = await show('broke'); await p.waitForTimeout(300); await p.screenshot({ path: path.join(dir, `wip/car-deadwk/s3-layout-${W}-broke.jpg`), quality: 80 });
    // 3 the recovery button by touch
    let tapped = false; try { await p.locator('#rbApp [data-s3="rec"]').first().tap({ timeout: 8000 }); tapped = true; } catch (e) {}
    await p.waitForTimeout(1500); const after = await p.evaluate(() => { const k = career().circuit; return { live: !!k.live, recovery: !!(k.live && k.live.recovery), debt: k.debt }; });
    out[W] = { rest, broke, tapped, after };
    const R = rest.rest, Q = broke.rec;
    if (!R || !/^Advance to week \d+$/.test(R.title) || !R.inside || R.overflow || !/Skips \d+ weeks|One week on/.test(R.small)) f.push(W + ' 1 rest button ' + JSON.stringify(R));
    if (!Q || Q.title !== 'Recovery entry' || !Q.inside || Q.overflow || !/covered/.test(Q.small)) f.push(W + ' 3 recovery button ' + JSON.stringify(Q));
    if (broke.cardTop == null || broke.postTop == null || !(broke.cardBottom <= broke.postTop) || !(broke.recBottom <= broke.vh)) f.push(W + ' 2 broke card not above the posters in the first screen ' + JSON.stringify(broke));
    if (broke.unaffordable < 2) f.push(W + ' 2 expected several unaffordable posters ' + JSON.stringify(broke));
    if (!tapped || !after.live || !after.recovery) f.push(W + ' 3 recovery entry by touch ' + JSON.stringify({ tapped, after }));
    if (errs.length) f.push(W + ' page errors: ' + errs.slice(0, 2).join(' | '));
    await p.close();
  }
  await b.close();
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
  const s = W => `${W}: rest "${out[W].rest.rest.title}" (${out[W].rest.rest.h} px, ${out[W].rest.rest.lines} line), broke card ${out[W].broke.cardTop}-${out[W].broke.cardBottom} px (recovery button ends ${out[W].broke.recBottom} of ${out[W].broke.vh}) above ${out[W].broke.unaffordable} posters (first at ${out[W].broke.postTop}), "${out[W].broke.rec.title}" ${out[W].broke.rec.h} px`;
  console.log('PASS: ' + s(360) + ' · ' + s(390) + '; both buttons keep their text inside, the recovery entry works by touch');
})();
