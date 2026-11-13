// Launch gate (improvements log #10, ChatGPT 9.0): one REAL career match with the rebrand on: real throws through land(), the game's
// own end of match, reward overlay, the new Result over it, Continue through the game's after-match chain (messages answered), back to Tonight.
// Roll-outs 3+4: after a real multi-level career win, the first-level-up poster and the old reward card show the unlocked shirt as the
// generated shirt photo in its colour (not a 3D render) and the card's top figure as the Locker photo. usage: node tests/rb-rwcards.js [dir] [shotPrefix]
const { chromium } = require('playwright'); const path = require('path');
const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.on('console', m => { if (/^rb /.test(m.text())) console.log('PAGE', m.text().slice(0, 400)); }); await p.addInitScript(t => { window.TOPS_RB_DEBUG = 1; window.__TIER = t; }, process.env.TIER || '1');
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?rebrand=1'); await p.waitForFunction(() => window.TC_API && typeof S !== 'undefined' && window.C3 && V._qa && V._qa.rigReady && V._qa.rigReady(), null, { timeout: 180000 }); await p.waitForTimeout(1500);
  await p.evaluate(() => { save.authSeen = true; save.name = 'Hayden'; save.matches = 30; save.lessonDone = true; save.totThrows = 500; $('login').hidden = true; newCareer(); const c = career(); c.tier = +(window.__TIER || 1); c.bank = 640; c.wins = 3; c.losses = 2; c.pts = 2400; c.darts = 150; c.stage = 'season'; c.next = null; newSeason(c); save.tcWelSeen = 1; save.tcIntro = Date.now(); persist(); showHub('play'); });
  await p.waitForTimeout(3000); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  const r = {}; r.tonight0 = await p.evaluate(() => !document.getElementById('rbApp').hidden);
  r.bank0 = await p.evaluate(() => career().bank); r.next = await p.evaluate(() => { const n = career().next || nextOpponent(); return { intro: !!n.intro, opp: n.oppName, legs: n.legs }; });
  // the real Walk on (new screen → the hub's own c3Go), then a short real match: shorten only the start score before the first dart
  await p.evaluate(() => { const g = document.getElementById('rbGo'); if (g) g.click(); });
  await p.waitForFunction(() => typeof S !== 'undefined' && S && S.p && S.p[1], null, { timeout: 60000 });
  r.walkon = await p.evaluate(() => document.getElementById('rbApp').hidden); r.s0 = await p.evaluate(() => ({ practice: !!S.practice, money: typeof S_money !== 'undefined' && !!S_money, local: !!S.local, legsNeeded: S.legs || S.firstTo, opp: S.p[1].name, arm: (document.getElementById('c3Go') || {}).dataset ? document.getElementById('c3Go').dataset.arm : null, bank: career().bank }));
  await p.evaluate(L => { window.__LOSE = !!L; V.walkOn = () => {}; S.p.forEach((q, i) => { q.score = (window.__LOSE && i === 1) ? 32 : 121; }); }, process.env.LOSE || '');
  const t0 = Date.now(); let st = '';
  while (Date.now() - t0 < 160000) {
    st = await p.evaluate(() => { try { if (S.done) return 'done'; if (!S.busy && S.visit.length === 0) S.p.forEach((q, i) => { const cap = (window.__LOSE && i === 1) ? 32 : 121; if (q.score > cap && q.score >= 301) q.score = cap; }); const it = document.getElementById('intro'); if (it && it.classList.contains('show')) { it.click(); }
      if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(0, 0); } return 'bull'; }
      if (S.cur === 0 && !S.busy && S.visit.length < 3 && !S.p[0].ai) { const me = S.p[0]; const t = targetPoint(aimFor(me.score, 4 - S.dart)); S.busy = true; land(t.x + gauss() * 2 + (window.__LOSE ? 300 : 0), t.y + gauss() * 2); } return 'play'; } catch (e) { return 'ERR ' + e.message; } });
    if (st === 'done' || st.startsWith('ERR')) break; await p.waitForTimeout(80);
  }
  r.end = st; r.m = await p.evaluate(() => ({ won: S.won, intro: !!S.intro, mode: S.mode || (typeof ui !== 'undefined' && ui.mode), local: !!S.local, legs: S.p.map(q => q.legs), after: S.after }));
  const OUT = process.argv[3] || process.env.OUT || ''; const chk = {}; let lvShot = false, rwShot = false;
  for (let i = 0; i < 90 && !rwShot; i++) {
    await p.waitForTimeout(400);
    const st = await p.evaluate(() => { const lf = document.getElementById('lvFirst'); const ov = document.getElementById('c3rw'); const u = document.getElementById('c3rwUnl');
      return { lv: !!lf, lvReady: !!(lf && lf.querySelector('.ri img') && lf.querySelector('.ri img').complete), rw: !!(ov && !ov.hidden && u && !u.hidden) }; });
    if (st.lv && !lvShot) { await p.waitForTimeout(2500); if (OUT) await p.screenshot({ path: OUT + '_lv.png' }); lvShot = true; await p.evaluate(() => { const lf = document.getElementById('lvFirst'); if (lf) lf.click(); }); continue; }
    if (st.lv) { await p.evaluate(() => { const lf = document.getElementById('lvFirst'); if (lf) lf.click(); }); continue; }
    if (st.rw) { await p.waitForTimeout(2500); if (await p.evaluate(() => !!document.getElementById('lvFirst'))) { await p.evaluate(() => { const a = document.getElementById('rbApp'); if (a) a.style.display = 'none'; }); await p.waitForTimeout(1500); if (OUT) await p.screenshot({ path: OUT + '_lv.png' }); lvShot = true; chk.lv = await p.evaluate(() => { const ri = document.querySelector('#lvFirst .ri'); const im = ri && ri.querySelector('img'); return { photo: !!(ri && ri.classList.contains('rb-lv-photo') && ri.classList.contains('rb-ri-photo')), data: !!(im && /^data:image/.test(im.src)), w: im ? im.naturalWidth : 0 }; }); await p.evaluate(() => { const lf = document.getElementById('lvFirst'); if (lf) lf.click(); }); await p.waitForTimeout(1200); }
      await p.evaluate(() => { const a = document.getElementById('rbApp'); if (a) a.style.display = 'none'; document.documentElement.classList.remove('rb-preres'); document.querySelectorAll('.tc-poster,.tcpk,.tc-sheet').forEach(e => e.remove()); }); await p.waitForTimeout(800); if (OUT) await p.screenshot({ path: OUT + '_rw.png' }); rwShot = true; chk.rw = await p.evaluate(() => { const ri = document.querySelector('#c3rwUnl .ri'); const im = ri && ri.querySelector('img'); const h = document.querySelector('#c3rw img.rwhero'); return { tile: !!(ri && ri.classList.contains('rb-ri-photo') && im && /^data:image/.test(im.src)), top: !!(h && h.classList.contains('rb-rwphoto') && /^data:image/.test(h.src) && getComputedStyle(h).visibility !== 'hidden'), unlock: (document.getElementById('c3rwUnl') || {}).textContent || '' }; }); }
    await p.evaluate(() => { [...document.body.querySelectorAll('*')].filter(e => /tap to continue/i.test(e.textContent || '') && e.offsetParent !== null && e.children.length === 0).forEach(e => e.click()); });
  }
  // ChatGPT P1/P2: a poster filled after it is added still gets the photo; calling the fixer again doesn't redo it; a flights poster keeps its render
  chk.late = await p.evaluate(async () => { document.querySelectorAll('#lvFirst').forEach(e => e.remove()); const o = document.createElement('div'); o.id = 'lvFirst'; o.innerHTML = '<div class="n">5</div>'; document.body.appendChild(o);
    await new Promise(r => setTimeout(r, 300)); const ri = document.createElement('span'); ri.className = 'ri ri-hero'; ri.innerHTML = '<img src="assets/rb/w_rw_trophy.jpg">'; o.appendChild(ri);
    for (let i = 0; i < 50 && !ri.classList.contains('rb-lv-photo'); i++) await new Promise(r => setTimeout(r, 100));
    const src1 = ri.querySelector('img').src; TOPS_RB.fixReward(); TOPS_RB.fixReward(); const same = ri.querySelector('img').src === src1 && ri.classList.contains('rb-lv-photo');
    o.remove(); const o2 = document.createElement('div'); o2.id = 'lvFirst'; o2.innerHTML = '<div class="n">3</div><span class="ri ri-dart"><img src="assets/rb/w_rw_darts.jpg"></span>'; document.body.appendChild(o2); await new Promise(r => setTimeout(r, 300));
    const dartKept = !o2.querySelector('.ri').classList.contains('rb-ri-photo') && /w_rw_darts/.test(o2.querySelector('img').src); o2.remove();
    return { late: ri.classList.contains('rb-lv-photo') && /^data:image/.test(src1), same, dartKept }; });
  const f = []; if (!rwShot) f.push('old reward card never shown'); if (!lvShot) f.push('level-up poster never shown');
  if (chk.lv && !(chk.lv.photo && chk.lv.data && chk.lv.w >= 1000)) f.push('poster shirt not the photo ' + JSON.stringify(chk.lv)); if (chk.rw && !/shirt/i.test(chk.rw.unlock)) f.push('first unlock not a shirt: ' + chk.rw.unlock.slice(0, 60));
  if (chk.rw && !chk.rw.tile) f.push('reward tile not the shirt photo'); if (chk.rw && !chk.rw.top) f.push('card top figure not the Locker photo'); if (!chk.late.late) f.push('poster filled late never got the photo'); if (!chk.late.same) f.push('fixer redid a finished poster'); if (!chk.late.dartKept) f.push('a non-shirt poster lost its render');
  if (pe.length) f.push('page errors ' + pe.join('; ').slice(0, 150));
  console.log(JSON.stringify(chk)); console.log(f.length ? 'rb-rwcards FAIL: ' + f.join('; ') : 'rb-rwcards PASS'); await b.close(); process.exit(f.length ? 1 : 0);
})();
