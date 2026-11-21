// CAR-WEAK 3 (1): a lost Worlds sends you back to the DPNZ Tour (Producer 14:39). Engine checks in node, then the real page.
//   1 lose the Worlds (L128 and the final): level 3, a new DPNZ season (dpnzEv 0, year +1, 40% of DPNZ points carried), no grant, bank = before - travel + prize
//   2 the next week has DPNZ events (weekly), so no rest weeks
//   3 win the Worlds: champion, still at the Palace (unchanged)
//   4 back again via OOM #1 or the Trans-Tasman final: no second Palace grant
//   5 Trans-Tasman semi-final -> the Palace with the Q-School place kept (pace package); OOM 2..10 -> TT
//   6 page: a lost Worlds through TOPS_S3 moves the career to the DPNZ Tour, logs s3_result up 3, and the result, then a "Back on tour · DPNZ Tour" sheet with "N points carried (40%, up to 300)"
// usage: node tests/s3-worlds.js [dir]
const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
const E = require(path.join(dir, 'tc/circuit.js')); const f = [];
function atPalace(o) { const c = E.newCareer(Object.assign({ level: 6, week: 52, bank: 5000, pts: { dpnz: 1500 }, res: { dpnz: [400, 400, 240, 240, 144, 80] }, dpnzEv: 8, dpnzYear: 0, grants: { 6: 1 } }, o || {})); return c; }
function playWorlds(c, winRounds) { const r0 = E.book(c, 'worlds'); if (!r0.ok) return { err: 'book', r0 }; let res; for (let i = 0; i < 7; i++) { res = E.result(c, i < winRounds); if (res && res.done) break; } return res; }
// 1 + 2: lose in the first round
{ const c = atPalace(); const b0 = c.bank; const r = playWorlds(c, 0);
  const prize = E.prizeFor(E.eventOf('worlds'), 'L128');
  if (!r || !r.up || r.up.to !== 3 || c.level !== 3) f.push('1 L128 loss did not go back to the DPNZ Tour ' + JSON.stringify(r && r.up));
  if (c.dpnzEv !== 0 || c.dpnzYear !== 1 || c.pts.dpnz !== 300 || JSON.stringify(c.res.dpnz) !== JSON.stringify([300])) f.push('1 new DPNZ season with 40% carried ' + JSON.stringify({ ev: c.dpnzEv, yr: c.dpnzYear, pts: c.pts.dpnz, res: c.res.dpnz }));
  if (r.up.grant || c.bank !== b0 - 3000 + prize) f.push('1 money: no grant, bank = before - travel + prize ' + JSON.stringify({ b0, bank: c.bank, prize, grant: r.up.grant }));
  if (!/Out of the Worlds in the last 128/.test(r.up.msg) || r.up.fromWorlds !== 'L128') f.push('1 message ' + r.up.msg);
  if (E.restNeeded(c) || !E.calendar(c).length || c.week !== 53) f.push('2 week 53 should have DPNZ events ' + JSON.stringify({ week: c.week, cal: E.calendar(c).map(e => e.id) }));
  // 4a back via OOM #1: play a whole season winning everything -> Palace, no second grant
  c.bank = 99999; let up = null; for (let ev = 0; ev < 8 && c.level === 3; ev++) { const e = E.calendar(c)[0]; E.book(c, e.id); let res; for (let i = 0; i < 6; i++) { res = E.result(c, true); if (res.done) break; } up = res.up || up; }
  if (c.level !== 6 || !up || up.grant) f.push('4 OOM #1 back to the Palace without a second grant ' + JSON.stringify({ level: c.level, up })); }
// 1b lose the final
{ const c = atPalace(); const r = playWorlds(c, 6); if (!r.up || r.up.to !== 3 || !/in the final/.test(r.up.msg) || r.fin !== 'F') f.push('1b final loss ' + JSON.stringify(r)); }
// 3 win
{ const c = atPalace(); const r = playWorlds(c, 7); if (!r.up || !r.up.champion || c.level !== 6) f.push('3 a Worlds win is still champion at the Palace ' + JSON.stringify(r.up)); }
// 4b back via the Trans-Tasman final: no second grant
{ const c = atPalace(); playWorlds(c, 0); c.level = 4; c.bank = 9999; E.book(c, 'tt_bne'); let res; for (let i = 0; i < 4; i++) { res = E.result(c, i < 3); if (res.done) break; }
  if (c.level !== 6 || res.up.grant) f.push('4b TT final back to the Palace, no second grant ' + JSON.stringify(res.up)); }
// 5 TT semi-final: the Palace since the pace package (Hayden 15:10), Q-School place kept
{ const c = E.newCareer({ level: 4, week: 10, bank: 9999, pts: { dpnz: 1000 } }); E.book(c, 'tt_bne'); let res; for (let i = 0; i < 4; i++) { res = E.result(c, i < 2); if (res.done) break; }
  if (c.level !== 6 || !c.qsOffer || res.fin !== 'SF') f.push('5 TT semi-final should reach the Palace (pace package) ' + JSON.stringify(res)); }
(async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] }); const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('file://' + path.join(dir, 'index.html') + '?s3=1'); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TC_API, null, { timeout: 120000 }); await p.waitForTimeout(1500);
  const pg = await p.evaluate(async () => { const o = {};  try { save.authSeen = true; save.lessonDone = true; save.tcWelSeen = 1; $('login').hidden = true; try { localStorage.setItem('tops_s3_welcome', '1'); const w = document.getElementById('s3Wel'); if (w) w.remove(); } catch (e) {} window.showMsg = (m, cb) => { try { cb && cb('ok'); } catch (e) {} };
    newCareer(); const c = career(), k = c.circuit; try { showHub('play'); } catch (e) {} await new Promise(r => setTimeout(r, 1500));
    try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove());
    k.level = 6; c.tier = 6; k.week = 52; c.bank = 5000; k.grants = { 6: 1 }; k.pts = { dpnz: 500 }; k.res = { dpnz: [300, 200] }; k.dpnzEv = 8; persist(); localStorage.setItem('tops_s3_seen', JSON.stringify({ h: k.history.length, lv: 6, r: -1, id: '', g: 0 }));
    try { showHub('play'); } catch (e) {} await new Promise(r => setTimeout(r, 1200));
    const bk = TOPS_S3.book('worlds'); o.book = bk && bk.ok; const logs = []; const _L = window.TOPS_LOG;
    TOPS_S3._playNow(); S.won = false; S.p[0].legs = 4; S.p[1].legs = 5; S.p[0].darts = 120; S.p[0].pts = 3000; careerAfterMatch(); S.done = true;
    o.level = k.level; o.tier = c.tier; o.week = k.week; o.ev = k.dpnzEv; o.pts = k.pts.dpnz; o.res = S.s3res && S.s3res.up;
    persist();
  } catch (e) { o.err = String(e.stack || e).slice(0, 300); } return o; });
  // the real flow: the match reset reloads the page (ENG-RESET), then the Circuit screen shows what changed
  await p.reload(); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TC_API, null, { timeout: 120000 }); await p.waitForTimeout(1500);
  Object.assign(pg, await p.evaluate(async () => { save.authSeen = true; save.lessonDone = true; $('login').hidden = true; try { showHub('play'); } catch (e) {} await new Promise(r => setTimeout(r, 2500));
    const d = document.getElementById('s3Sheet'); return { first: d ? d.innerText.replace(/\s+/g, ' ').slice(0, 160) : null, lvAfterReload: career().circuit.level }; }));
  // the result sheet first (Next), then the level sheet
  try { await p.locator('#s3Sheet #s3Ok').click({ timeout: 8000 }); } catch (e) { pg.tapErr = String(e.message).slice(0, 80); }
  await p.waitForTimeout(600);
  Object.assign(pg, await p.evaluate(() => { const d = document.getElementById('s3Sheet'); return { second: d ? d.innerText.replace(/\s+/g, ' ').slice(0, 300) : null, sheetVisible: !!(d && d.getClientRects().length) }; }));
  await p.screenshot({ path: path.join(__dirname, '../wip/s3-worlds-back.jpg') }).catch(() => {});
  await b.close();
  if (pg.err) f.push('6 page error ' + pg.err);
  if (!pg.book || pg.level !== 3 || pg.tier !== 3 || pg.week !== 53 || pg.ev !== 0 || pg.pts !== 200) f.push('6 page: lost Worlds did not go back to the DPNZ Tour ' + JSON.stringify(pg));
  if (!pg.sheetVisible || !/^Back on tour/i.test(pg.second || '') || !/DPNZ Tour/i.test(pg.second || '') || !/with 200 points carried/.test(pg.second || '') || /Promoted|grant/i.test(pg.second || '')) f.push('6 page: no "Back on tour" level sheet ' + JSON.stringify(pg));
  if (errs.length) f.push('page errors: ' + errs.slice(0, 3).join(' | '));
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ')); process.exit(1); }
  console.log('PASS: a lost Worlds (last 128 or the final) goes back to the DPNZ Tour: new season, 40% of 1500 capped at 300 points carried, no grant, bank = before - $3,000 travel + prize, week 53 has DPNZ events (no rest); a Worlds win is still champion; back to the Palace via OOM #1 or the Trans-Tasman final with no second grant; a Trans-Tasman semi-final reaches the Palace (pace package); on the page the career moves to the DPNZ Tour and the result, then a "Back on tour · DPNZ Tour" sheet with "N points carried (40%, up to 300)"');
})();
