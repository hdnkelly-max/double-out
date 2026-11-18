// EXP-S3C real-match smoke on Season 3: book an event, Walk on from the Circuit tab (Career's TOPS_S3.play → the game's real match),
// win it, tap through the after-match screens as a player does, and after the between-match reset the Circuit tab shows the next
// round with the "Through" toast. usage: node tests/s3-match.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const pe = []; p.on('pageerror', e => pe.push(e.message)); await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} });   /* the welcome has its own test (s3-welcome.js) */
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); let loads = 0; p.on('load', () => loads++);
  const fail = [], out = {};
  const vis = sel => p.evaluate(sel => { const e = document.querySelector(sel); return !!(e && e.getClientRects().length && !e.disabled && getComputedStyle(e).visibility !== 'hidden'); }, sel).catch(() => false);
  const tap = async sel => { if (!(await vis(sel))) return false; try { await p.locator(sel).first().tap({ timeout: 8000 }); return true; } catch (e) { return false; } };
  const ready = async () => { await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(1500); };
  await p.goto('file://' + dir + '/index.html?s3=1', { timeout: 180000 }); await ready();
  await p.evaluate(() => { localStorage.removeItem('tops_s3_seen'); save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
  await p.waitForTimeout(2500); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  if (!(await tap('#rbApp [data-s3book]'))) fail.push('no Book it');
  await p.waitForTimeout(600); if (!(await tap('#s3Go'))) fail.push('no Walk on after booking');
  for (let i = 0; i < 80; i++) { if (await p.evaluate(() => typeof S !== 'undefined' && S && !S.done).catch(() => false)) break; await p.waitForTimeout(250); }
  out.match = await p.evaluate(() => typeof S !== 'undefined' && S ? { s3: S.s3 || null, opp: S.p && S.p[1] && S.p[1].name, legs: S.legs } : null);
  if (!out.match || !out.match.s3) fail.push('Walk on did not start a Circuit match: ' + JSON.stringify(out.match));
  // win: every visit of ours is a 40 checkout on D20 (same as tests/reset.js)
  for (let i = 0; i < 1500; i++) { const s = await p.evaluate(() => { try { if (!S || S.done) return 'done'; if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(0, 0); } return 'play'; }
      if (S.cur === 0 && !S.busy && !S.p[0].ai && S.view !== 1) { S.p[0].score = 40; S.busy = true; land(0, -166); } const it = document.getElementById('intro'); if (it && it.classList.contains('show')) it.click(); return 'play'; } catch (e) { return 'ERR ' + e.message; } }).catch(() => 'nav');
    if (s !== 'play') { out.end = s; break; } await p.waitForTimeout(120); }
  out.won = await p.evaluate(() => !!(S && S.won)).catch(() => null); out.res = await p.evaluate(() => S && S.s3res).catch(() => null);
  for (let i = 0; i < 60; i++) { if (await p.evaluate(() => !!document.querySelector('#rbApp.rb-resmode')).catch(() => false)) break; await p.waitForTimeout(250); }
  out.resScreen = await p.evaluate(() => (document.querySelector('#rbApp.rb-resmode') || {}).innerText || '').catch(() => '');
  out.oldHidden = await p.evaluate(() => { const r = document.getElementById('result'); return !r || r.hidden || getComputedStyle(r).visibility === 'hidden'; }); if (!out.oldHidden) fail.push('old Match result visible under a Circuit match');
  if (!/league night/i.test(out.resScreen) || !/through/i.test(out.resScreen)) fail.push('result screen does not report the event/round: ' + out.resScreen.slice(0, 200).replace(/\n/g, ' | '));
  out.bankAfterMatch = await p.evaluate(() => career().bank); if (out.bankAfterMatch !== 55) out.note = 'Career: the old career pays still pay on a Circuit round (bank 55 -> ' + out.bankAfterMatch + ')';
  const NEXT = ['#rbRGo', '#rbRKeep', '#lvFirst', '#tcWelLater', '#btnResultNext', '#c3rwGo', '#c3rwKeep', '#btnPerkLater', '#tcPLater', '.tcpk__later', '#msgReplies button', '.tc-sheet [data-close]', '.tc-sheet .tc-x'];
  out.seenBefore = await p.evaluate(() => localStorage.getItem('tops_s3_seen'));
  const l0 = loads; for (let i = 0; i < 300 && loads === l0; i++) { for (const s of NEXT) { if (loads > l0) break; if (await tap(s)) { await p.waitForTimeout(300); break; } } await p.waitForTimeout(250); }
  out.reloaded = loads > l0;
  if (out.reloaded) { await ready(); for (let i = 0; i < 40; i++) { if (await vis('#rbApp .s3-live')) break; await p.evaluate(() => { try { $('login').hidden = true; showHub(); } catch (e) {} }); await p.waitForTimeout(500); } }
  for (let i = 0; i < 40; i++) { if (await p.evaluate(() => !!document.getElementById('s3Toast')).catch(() => false)) break; await p.waitForTimeout(250); }   /* the toast waits for the loader to lift */
  out.after = await p.evaluate(() => ({ seen: localStorage.getItem('tops_s3_seen'), rs: window.TOPS_RESET && TOPS_RESET.state && TOPS_RESET.state(), rsg: !!window.TOPS_RESETTING, live: !!document.querySelector('#rbApp .s3-live'), toast: (document.getElementById('s3Toast') || {}).innerText || '', sheet: (document.querySelector('#s3Sheet .s3-sbox') || {}).innerText || '', circ: career().circuit && career().circuit.live, tab: (document.querySelector('#rbTabs [aria-selected="true"]') || {}).dataset?.t }));
  if (!out.won) fail.push('match not won'); if (!out.res || !out.res.next) fail.push('Circuit did not move to the next round: ' + JSON.stringify(out.res));
  if (out.after.tab !== 'circuit') fail.push('after the match the shell is on ' + out.after.tab); if (!out.after.live) fail.push('live event not shown after the match');
  if (!/through/i.test(out.after.toast)) fail.push('no Through toast after the match');
  if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out)); console.log(fail.length ? 's3-match FAIL: ' + fail.join('; ') : 's3-match PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
