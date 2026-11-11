// R0 #16 H2 (Experience): does DOM/CSS left over from match 1's end make match 2 frames more expensive?
// Real path at 390x844: hub "Walk on" -> Pub League match, LOSE it (AI checks out, player misses), result -> reward Continue
// -> hub -> Walk on again (straight into the next match). Measures at: M1 mid, M1 end (result up), M2 mid, M3 mid.
// usage: node wip/h2-dom.js <out.jsonl>   (one JSON line per checkpoint)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const root = path.resolve(__dirname, '..');
const OUT = process.argv[2] || '/tmp/h2.jsonl'; fs.writeFileSync(OUT, '');
const log = o => { fs.appendFileSync(OUT, JSON.stringify(o) + '\n'); };
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com.*three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(5000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; newCareer(); try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {} showHub(); });
  const measure = tag => p.evaluate(tag => {
    const all = document.getElementsByTagName('*'); const st = { nodes: all.length, bodyKids: document.body.children.length };
    const cats = { backdrop: {}, filter: {}, willChange: {}, fixed: {}, anim: {} }; const big = [];
    const bump = (c, s) => { cats[c][s] = (cats[c][s] || 0) + 1; };
    for (const e of all) { const cs = getComputedStyle(e);
      const shown = e.getClientRects().length > 0; let s = !shown ? 'displayNone' : cs.visibility === 'hidden' ? 'visHidden' : 'visible';
      if (s === 'visible') { let q = e, op = 1; while (q && q.nodeType === 1) { op *= +getComputedStyle(q).opacity; q = q.parentElement; } if (op < .01) s = 'opacity0'; }
      const bf = (cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none');
      if (bf) bump('backdrop', s); if (cs.filter !== 'none') bump('filter', s); if (cs.willChange !== 'auto') bump('willChange', s); if (cs.position === 'fixed') bump('fixed', s);
      if (cs.animationName !== 'none' && cs.animationPlayState === 'running') bump('anim', s);
      if (s !== 'displayNone' && s !== 'visible' && (bf || cs.filter !== 'none' || cs.willChange !== 'auto' || cs.position === 'fixed')) big.push((e.id ? '#' + e.id : String(e.className).split(' ')[0] || e.tagName) + ':' + s + (bf ? ':bf' : '') + (cs.filter !== 'none' ? ':filter' : '') + (cs.willChange !== 'auto' ? ':wc' : '') + (cs.position === 'fixed' ? ':fixed' : ''));
    }
    let anims = 0, animsInf = 0, animsOnHidden = 0; try { for (const a of document.getAnimations()) { if (a.playState !== 'running') continue; anims++; const t = a.effect && a.effect.getTiming && a.effect.getTiming(); if (t && t.iterations === Infinity) animsInf++; const tg = a.effect && a.effect.target; if (tg && tg.getClientRects && (!tg.getClientRects().length || getComputedStyle(tg).visibility === 'hidden')) animsOnHidden++; } } catch (e) {}
    const kids = [...document.body.children].map(k => (k.id || k.tagName.toLowerCase() + '.' + String(k.className).split(' ')[0]) + (k.getClientRects().length ? '' : '(none)'));
    return Object.assign(st, { tag, cats, anims, animsInf, animsOnHidden, hiddenComposited: big.slice(0, 40), hiddenCompositedN: big.length, bodyKidList: kids, scr: (document.querySelector('.screen:not([hidden])') || {}).id, S: !!(window.S), cur: S && S.cur, done: S && S.done });
  }, tag);
  const clickIf = async sel => p.evaluate(sel => { const e = document.querySelector(sel); if (e && e.getClientRects().length && !e.disabled) { e.click(); return true; } return false; }, sel);
  // drive: player throws wide (misses), AI's visit starts at 40 so it checks out; until the match is done
  const playToEnd = async (maxMs, midTag) => { let mid = false; const t0 = Date.now();
    while (Date.now() - t0 < maxMs) { const st = await p.evaluate(() => { try { if (!S) return 'noS'; if (S.done) return 'done';
        if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(gauss() * 30, gauss() * 30); } return 'bull'; }
        if (S.cur === 1 && S.visit && S.visit.length === 0 && S.p[1].score > 40) S.p[1].score = 40;
        if (S.cur === 0 && !S.busy && S.visit.length < 3 && !S.p[0].ai) { S.busy = true; land(400 + Math.random() * 50, 400); } return 'play'; } catch (e) { return 'ERR ' + e.message; } });
      if (st === 'noS' && Date.now() - t0 > 20000) return 'noS';
      if (!mid && midTag && st === 'play' && Date.now() - t0 > 12000) { mid = true; log(await measure(midTag)); }
      if (st === 'done' || /^ERR/.test(st)) return st; await p.waitForTimeout(600); }
    return 'timeout'; };
  const startFromHub = async () => { await p.evaluate(() => { try { showHub(); } catch (e) {} }); await p.waitForTimeout(800);
    const ok = (await clickIf('#c3Go')) || (await clickIf('#btnPlayNext')); await p.waitForTimeout(6000); return ok; };
  const finishScreens = async () => { await p.waitForTimeout(4000); log(await measure('end_result_up'));
    for (let i = 0; i < 6; i++) { if (await clickIf('#c3rwGo')) { await p.waitForTimeout(1500); continue; } if (await clickIf('#btnResultNext')) { await p.waitForTimeout(2000); continue; } break; }
    await p.waitForTimeout(1500); log(await measure('after_continue_hub')); };
  for (let m = 1; m <= 3; m++) {
    const ok = await startFromHub(); log({ tag: 'start_m' + m, walkOnClicked: ok, errs: errs.slice() });
    if (!ok) { log({ tag: 'abort', why: 'no Walk on button' }); break; }
    const r = await playToEnd(240000, 'mid_m' + m); log({ tag: 'end_m' + m, result: r });
    await finishScreens();
  }
  log({ tag: 'done', errs: errs.slice(0, 5) }); await b.close();
})();
