// EXP-S3C Season 3 screens. With ?s3=1 the rebrand shell shows Circuit + Money instead of Tonight + Season; booking, the live event,
// a won round, an event result and a promotion all survive a page reload (the game reloads between matches, ENG-RESET), and each result
// shows once. Flag off = the old tabs. Runs on Career's TOPS_S3 (tc/s3.js); results are written into save.career.circuit as a match does, then the page reloads.
// usage: node tests/s3-screens.js [dir]   (SHOTS=1 writes tests/s3_*.png at 390)
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const ctx = await b.newContext({ viewport: { width: +(process.env.VW || 390), height: +(process.env.VH || 844) }, hasTouch: true, isMobile: true }); const p = await ctx.newPage();
  const pe = []; p.on('pageerror', e => pe.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  const fail = [], out = {}; const shot = async n => { if (process.env.SHOTS) await p.screenshot({ path: path.join(__dirname, 's3_' + n + '.png') }); };
  const boot = async (qs) => { await p.goto('file://' + dir + '/index.html' + qs, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(800);
    await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; if (!save.career) newCareer(); const c = career(); if (!window.TOPS_S3FLAG) { c.stage = 'season'; if (!c.season) newSeason(c); } save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
    await p.waitForTimeout(2500); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); }); };
  const look = () => p.evaluate(() => { const app = document.getElementById('rbApp'); const vis = e => !!e && !e.hidden && e.offsetParent !== null;
    return { open: !!app && !app.hidden, tabs: [...document.querySelectorAll('#rbTabs button')].map(x => x.dataset.t), sel: (document.querySelector('#rbTabs [aria-selected="true"]') || {}).dataset?.t,
      posters: document.querySelectorAll('#rbApp .s3-post').length, book: document.querySelectorAll('#rbApp [data-s3book]').length, live: !!document.querySelector('#rbApp .s3-live'), go: vis(document.getElementById('s3Go')),
      sheet: (document.querySelector('#s3Sheet .s3-sbox') || {}).innerText || '', toast: (document.getElementById('s3Toast') || {}).innerText || '', lvn: (document.querySelector('#rbApp .s3-lvn') || {}).textContent || '',
      bank: (document.getElementById('rbBank') || {}).textContent, wide: document.documentElement.scrollWidth > innerWidth + 1 }; });
  const tap = async sel => { const pt = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); if (!pt) return false; await p.touchscreen.tap(pt[0], pt[1]); await p.waitForTimeout(500); return true; };
  const reload = async () => { await boot('?s3=1'); await p.waitForFunction(() => { const l = document.getElementById('loading'); return !l || l.classList.contains('gone') || getComputedStyle(l).display === 'none'; }, null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(700); };   /* results wait for the loader to lift */
  // 1 flag off: old tabs, no S3 class

  await boot('?s3=0'); out.off = await look(); if (out.off.tabs.includes('circuit') || !out.off.tabs.includes('tonight')) fail.push('flag off: tabs ' + out.off.tabs);
  // 2 flag on, fresh: Circuit tab at the Pub with posters
  await boot('?s3=1'); await p.evaluate(() => { localStorage.removeItem('tops_s3_seen'); newCareer(); const c = career(); c.stage = 'circuit'; persist(); }); await reload();
  out.on = await look(); await shot('1_circuit');
  if (out.on.tabs.join() !== 'circuit,money,shop,locker,practice') fail.push('flag on: tabs ' + out.on.tabs); if (out.on.sel !== 'circuit') fail.push('flag on: opens on ' + out.on.sel);
  if (!/pub/i.test(out.on.lvn)) fail.push('not at the Pub: ' + out.on.lvn); if (out.on.posters < 1 || out.on.book < 1) fail.push('no event posters / Book it'); if (out.on.wide) fail.push('page scrolls sideways');
  // 3 book → live view; reload mid-booking keeps the live view, no result shown
  await tap('#rbApp [data-s3book]'); out.booked = await look(); if (!out.booked.live) fail.push('booking did not open the live view');
  await reload(); out.bookedR = await look(); await shot('2_live'); if (!out.bookedR.live || !out.bookedR.go) fail.push('after reload mid-booking: no live view / Walk on'); if (out.bookedR.sheet) fail.push('a result showed after booking: ' + out.bookedR.sheet);
  // 4 win a round (as a match would), reload → "Through" toast once
  await p.evaluate(() => { const k = career().circuit; k.bank = career().bank; TOPS_CIRCUIT.result(k, true); career().bank = k.bank; persist(); }); await reload();   /* as a match does: the result lands, then the page reloads */ out.round = await look(); await shot('3_round');
  if (!/through/i.test(out.round.toast)) fail.push('won round: no toast after reload'); await p.waitForTimeout(3300); await reload(); out.round2 = await look(); if (out.round2.toast) fail.push('round toast showed twice');
  // 5 win the event out (Pub night, 8-player: QF, SF, F) → result sheet, then promotion if any; reload after OK shows nothing
  const r = await p.evaluate(() => { const k = career().circuit; k.bank = career().bank; let x; do { x = TOPS_CIRCUIT.result(k, true); } while (!x.done); career().bank = k.bank; career().tier = k.level; persist(); return x; });
  await reload(); out.res = await look(); await shot('4_result'); if (!/winner/i.test(out.res.sheet)) fail.push('event won: no result sheet after reload: ' + out.res.sheet);
  await tap('#s3Ok'); out.after = await look(); await shot('5_after');
  if (r.up && !/up to club/i.test(out.after.sheet)) fail.push('promotion moment missing: ' + out.after.sheet);
  if (r.up) await tap('#s3Ok');
  await reload(); out.again = await look(); if (out.again.sheet) fail.push('result showed again after OK: ' + out.again.sheet);
  // 6 money tab and OOM (DPNZ)
  await tap('#rbTabs [data-t="money"]'); out.money = await p.evaluate(() => (document.querySelector('#rbApp .s3-bank') || {}).innerText || ''); await shot('6_money'); if (!/tour budget/i.test(out.money)) fail.push('Money tab empty');
  await p.evaluate(() => { const c = career().circuit; c.level = 3; c.live = null; career().bank = 2400; career().tier = 3; persist(); localStorage.setItem('tops_s3_seen', JSON.stringify(TOPS_S3UI._snap(c))); }); await reload();
  await tap('#rbApp [data-s3sub="oom"]'); out.oom = await p.evaluate(() => document.querySelectorAll('#rbApp .s3-tbl li:not(.s3-cut)').length); await shot('7_oom'); if (out.oom !== 13) fail.push('DPNZ OOM rows ' + out.oom);
  // 7b Best Leg record: Career's tops:bestleg (fired at the leg end) shows a banner that takes no taps, then the big moment on the next screen
  out.bl = await p.evaluate(() => { window.dispatchEvent(new CustomEvent('tops:bestleg', { detail: { darts: 14, prev: 15, kind: 'new', name: 'Hayden' } })); const b = document.getElementById('s3Rec'); return b ? { t: b.innerText, pe: getComputedStyle(b).pointerEvents } : null; });
  if (!out.bl || !/14 darts/i.test(out.bl.t) || out.bl.pe !== 'none') fail.push('record banner ' + JSON.stringify(out.bl));
  await reload(); out.blm = await look(); await shot('7b_record'); if (!/new season 3 record/i.test(out.blm.sheet) || !/14/.test(out.blm.sheet)) fail.push('record moment after reload: ' + out.blm.sheet);
  await tap('#s3Ok'); await reload(); out.blm2 = await look(); if (/record/i.test(out.blm2.sheet)) fail.push('record moment showed twice');
  // 8 creator: the 5 Vinyl bases replace the Character row (Engine's TOPS_S3_BASES; stubbed here when Engine's code isn't in this build)
  out.cr = await p.evaluate(() => { if (!window.TOPS_S3_BASES) { window.TOPS_S3_BASES = [{ id: 'ray', name: 'Ray', tag: 'The Veteran', look: { model: 'brian', hair2: 'short' } }, { id: 'mia', name: 'Mia', tag: 'The Ace', look: { model: 'megan', sex: 'f', hair2: 'pony' } }]; window.TOPS_S3_LOOK = id => { const b = TOPS_S3_BASES.find(x => x.id === id); return b ? JSON.parse(JSON.stringify(b.look)) : null; }; }
    save.look = {}; showCreator(false); const row = document.getElementById('s3Base'); const ch = document.getElementById('segChar').closest('.field');
    const first = save.look.s3base; const b = row && row.querySelector('[data-b="' + TOPS_S3_BASES[TOPS_S3_BASES.length - 1].id + '"]'); if (b) b.click();
    return { row: !!row, n: row ? row.querySelectorAll('[data-b]').length : 0, charHidden: ch.hidden, first, after: save.look.s3base, model: save.look.model, pressed: (document.querySelector('#s3Base [aria-pressed="true"]') || {}).dataset?.b }; });
  if (!out.cr.row || out.cr.n < 2 || !out.cr.charHidden) fail.push('creator base row ' + JSON.stringify(out.cr)); if (!out.cr.first || out.cr.after === out.cr.first || out.cr.pressed !== out.cr.after) fail.push('base pick did not apply ' + JSON.stringify(out.cr));
  await shot('8_creator');
  // 7 hidden switch: 5 taps on the version label flips the device flag
  out.hidden = await p.evaluate(() => { const v = document.createElement('p'); v.id = 'tlVer'; document.body.appendChild(v); const rl = location.reload; let n = 0; for (let i = 0; i < 5; i++) v.click(); return localStorage.getItem('tops_s3'); });
  if (out.hidden !== '0') fail.push('hidden switch did not turn S3 off: ' + out.hidden);
  if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out)); console.log(fail.length ? 's3-screens FAIL: ' + fail.join('; ') : 's3-screens PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
