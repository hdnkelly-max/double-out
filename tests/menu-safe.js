// EXP-MENU: in the iPhone home-screen app the status bar is drawn over the page (black-translucent). The match top bar must sit
// below it so MENU can be tapped. Emulates a 47 px top inset through --tops-sat (= env(safe-area-inset-top) in real use).
// Checks: MENU's hit box is entirely below the inset and >= 44 px tall (with its hit area), a real tap opens the menu, Quit works;
// the board keeps its size, the pull pad doesn't move; hub top bar unchanged. usage: node tests/menu-safe.js [dir]
const { chromium } = require('playwright'); const path = require('path');
const dir = process.argv[2] || path.resolve(__dirname, '..'), SAT = 47;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html'); await p.waitForFunction(() => window.TC_API && typeof S !== 'undefined' && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1500);
  await p.evaluate(() => { save.authSeen = true; save.name = 'Hayden'; save.matches = 30; $('login').hidden = true; newCareer(); const c = career(); c.tier = 0; c.bank = 200; save.tcWelSeen = 1; persist(); showHub('play'); });
  await p.waitForTimeout(2500); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  const hubTop = () => p.evaluate(() => { const e = document.querySelector('#hub .hx-top, #hub header, #hubPt'); const r = e ? e.getBoundingClientRect() : null; return r ? [Math.round(r.top), Math.round(r.height)] : null; });
  const hub0 = await hubTop();
  await p.evaluate(() => { const n = nextOpponent(); V.walkOn = () => {}; beginMatch({ mode: 'career', tier: 0, p0: 'Hayden', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 40, legs: 3, start: 301 }); });
  await p.waitForTimeout(3000);
  const measure = () => p.evaluate(() => { const r = e => { const q = e && e.getBoundingClientRect(); return q ? { t: Math.round(q.top), b: Math.round(q.bottom), l: Math.round(q.left), r: Math.round(q.right), h: Math.round(q.height) } : null; }; const L = V.lkRects();
    return { top: r(document.querySelector('#hud .top')), menu: r($('btnMenu')), board: { y: L.board.y, h: L.board.h, w: L.board.w, diam: L.diam }, pad: r($('pullPad')), sb: r(document.querySelector('#hud .sb')), hdr: L.hdr }; });
  const before = await measure();
  // emulate the status bar inset, then a resize so the layout re-reads it (as an orientation or standalone launch does)
  await p.addStyleTag({ content: `:root{--tops-sat:${SAT}px}` }); await p.setViewportSize({ width: 390, height: 845 }); await p.waitForTimeout(300); await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(800);
  const after = await measure();
  const m = after.menu, cx = (m.l + m.r) / 2, cy = (m.t + m.b) / 2;
  const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.id || e.className); }, [cx, cy]);
  await p.touchscreen.tap(cx, cy); await p.waitForTimeout(500);
  const open = await p.evaluate(() => { const m = $('lkMenu'); return !!m && getComputedStyle(m).display !== 'none' && m.getBoundingClientRect().height > 40; });
  const quit = await p.evaluate(() => { const q = $('btnQuit'); const r = q.getBoundingClientRect(); return { y: Math.round(r.top), h: Math.round(r.height), vis: r.height > 0 }; });
  await p.screenshot({ path: path.join(dir, 'tests/menu_safe_open_390.png') });
  await p.touchscreen.tap(195, quit.y + quit.h / 2 > 0 ? 0 : 0).catch(() => {}); // no-op guard
  const qb = await p.evaluate(() => { const r = $('btnQuit').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.touchscreen.tap(qb[0], qb[1]); await p.waitForTimeout(1500);
  // Quit may ask to confirm (a second tap); press it again if the game armed it
  await p.evaluate(async () => { const q = $('btnQuit'); for (let i = 0; i < 2 && S && !S.done; i++) { q.click(); await new Promise(r => setTimeout(r, 300)); } });   // Quit arms first (Forfeit?), the second tap quits
  await p.waitForTimeout(1500);
  const quitOk = await p.evaluate(() => $('hud').hidden || !S || !!S.done);
  await p.waitForTimeout(1500); const hub1 = await hubTop();
  const out = { before, after, hit, open, quit, quitOk, hub0, hub1, errors: pe.slice(0, 3) }; console.log(JSON.stringify(out));
  const f = [];
  if (after.menu.t < SAT) f.push(`MENU top ${after.menu.t} is under the ${SAT} px inset`);
  if (after.menu.h < 44) f.push(`MENU ${after.menu.h} px tall (<44)`);
  if (hit !== 'btnMenu' && !/menu/.test(hit || '')) f.push('tap point is not on MENU: ' + hit);
  if (!open) f.push('menu did not open on a real tap');
  if (!quitOk) f.push('Quit did not end the match');
  if (after.board.h !== before.board.h || after.board.w !== before.board.w || after.board.diam !== before.board.diam) f.push('board size changed');
  if (after.board.y !== before.board.y + SAT) f.push(`board did not move down by the inset (${before.board.y} → ${after.board.y})`);
  // option A (Overseer 22:08): the pad gives up exactly the inset (its top moves down by it), the board keeps its size
  if (!before.pad || !after.pad || after.pad.t !== before.pad.t + SAT || after.pad.h !== before.pad.h - SAT || after.pad.b !== before.pad.b) f.push(`pull pad not as option A (${JSON.stringify(before.pad)} → ${JSON.stringify(after.pad)})`);
  if (after.sb.t !== before.sb.t) f.push('scoreboard moved');
  if (pe.length) f.push('page errors');
  console.log(f.length ? 'menu-safe FAIL: ' + f.join('; ') : 'menu-safe PASS'); await b.close(); process.exit(f.length ? 1 : 0);
})();
