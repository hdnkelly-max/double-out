// EXP-IDLE 2 Circuit result: event progress + move-up bar (behind s3x=1).
//  A real Pub night played through (Walk on → win → Result) at 390 and 360: the QF Result shows the draw with the QF ticked, "Through to the
//  semi-final", the next opponent, the prize banked so far and the Kauri points bar with the event's potential; the Final's Result shows
//  "Winner", +$35 and the bar filling by +50. The money and XP on the screen are the real ones (bank = 60 - 5 + 35; XP from S.s3xp).
//  Direct renders for a lost QF, a group stage and a promotion. With s3x off the Result is exactly as before (no block, old cash label).
// usage: node tests/s3-progress.js [dir]   (SHOTS=1 writes tests/s3_rp_<w>_<n>.png)
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const NEXT = ['#rbRGo', '#rbRKeep', '#lvFirst', '#tcWelLater', '#btnResultNext', '#c3rwGo', '#c3rwKeep', '#btnPerkLater', '#tcPLater', '.tcpk__later', '#msgReplies button', '.tc-sheet [data-close]', '.tc-sheet .tc-x', '#s3Ok'];
  const session = async (qs, vw, vh, fn) => { const ctx = await b.newContext({ viewport: { width: vw, height: vh }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); let loads = 0; p.on('load', () => loads++);
    const vis = sel => p.evaluate(sel => { const e = document.querySelector(sel); return !!(e && e.getClientRects().length && !e.disabled && getComputedStyle(e).visibility !== 'hidden'); }, sel).catch(() => false);
    const tap = async sel => { if (!(await vis(sel))) return false; try { await p.locator(sel).first().tap({ timeout: 8000 }); return true; } catch (e) { return false; } };
    const ready = async () => { await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(1500); };
    await p.goto('file://' + dir + '/index.html' + qs, { timeout: 180000 }); await ready();
    await p.evaluate(() => { localStorage.removeItem('tops_s3_seen'); save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
    await p.waitForTimeout(2500); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
    // one Circuit match, won; returns the Result screen as the player sees it, then taps through to the next page
    const match = async (shot) => {
      if (await vis('#rbApp [data-s3book]')) await tap('#rbApp [data-s3book]'); await p.waitForTimeout(500); await tap('#s3Go');
      for (let i = 0; i < 80 && !(await p.evaluate(() => typeof S !== 'undefined' && S && !S.done).catch(() => false)); i++) await p.waitForTimeout(250);
      for (let i = 0; i < 1500; i++) { const s = await p.evaluate(() => { try { if (!S || S.done) return 'done'; if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(0, 0); } return 'play'; }
          if (S.cur === 0 && !S.busy && !S.p[0].ai && S.view !== 1) { S.p[0].score = 40; S.busy = true; land(0, -166); } const it = document.getElementById('intro'); if (it && it.classList.contains('show')) it.click(); return 'play'; } catch (e) { return 'ERR ' + e.message; } }).catch(() => 'nav'); if (s !== 'play') break; await p.waitForTimeout(120); }
      for (let i = 0; i < 60 && !(await vis('#rbApp.rb-resmode #rbRGo')); i++) await p.waitForTimeout(250); await p.waitForTimeout(1800);
      const r = await p.evaluate(() => { const app = document.querySelector('#rbApp.rb-resmode'); const blk = app && app.querySelector('.s3-rp');
        return { text: app ? app.innerText : '', blk: blk ? blk.innerText : null, cells: blk ? [...blk.querySelectorAll('.s3-rpdraw li')].map(l => l.className + ':' + l.innerText.replace(/\s+/g, ' ')) : [], cashLab: ((app && app.querySelector('.rbw-cash small')) || {}).textContent, cash: (document.getElementById('rbRCash') || {}).textContent, xpTxt: (document.getElementById('rbRXp') || {}).textContent,
          bank: career().bank, s3xp: S && S.s3xp, res: S && S.s3res && { done: S.s3res.done, fin: S.s3res.fin, prize: S.s3res.prize, pts: S.s3res.pts, next: S.s3res.next }, pts: career().circuit.pts, wide: document.documentElement.scrollWidth > innerWidth + 1,
          barB: blk && blk.querySelector('.s3-rpb') ? blk.querySelector('.s3-rpb').style.width : null, barG: blk && blk.querySelector('.s3-rpg') ? blk.querySelector('.s3-rpg').style.width : null }; });
      if (shot && process.env.SHOTS) { await p.evaluate(() => { const m = document.querySelector('#rbApp .rb-scr') || document.getElementById('rbMain'); if (m) m.scrollTop = 0; }); await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, shot) }); }
      const l0 = loads; for (let i = 0; i < 300 && loads === l0; i++) { for (const s of NEXT) { if (loads > l0) break; if (await tap(s)) { await p.waitForTimeout(300); break; } } await p.waitForTimeout(250); }
      if (loads > l0) await ready(); for (let i = 0; i < 20 && (await vis('#s3Ok')); i++) { await tap('#s3Ok'); await p.waitForTimeout(400); } return r; };
    await fn(p, match); if (pe.length) fail.push(qs + ' ' + vw + ' page errors ' + pe.join('; ').slice(0, 160)); await ctx.close(); };
  // 1 s3x on: a full Pub night at 390, the QF at 360
  for (const [w, h] of [[390, 844], [360, 640]]) await session('?s3=1&s3x=1', w, h, async (p, match) => {
    const qf = await match('s3_rp_' + w + '_qf.png'); out['qf' + w] = qf;
    if (!qf.blk) { fail.push(w + ': no progress block on the QF Result'); return; }
    if (!/through to the semi-final/i.test(qf.blk) || !/next:/i.test(qf.blk) || !/\$35 if you win it/i.test(qf.blk)) fail.push(w + ' QF block copy: ' + qf.blk.replace(/\n/g, ' | '));
    if (qf.cells.length !== 3 || !/s3-rpw s3-rpnow/.test(qf.cells[0]) || !/s3-rpnext/.test(qf.cells[1])) fail.push(w + ' QF draw: ' + JSON.stringify(qf.cells));
    if (qf.cashLab !== 'Banked so far' || !/^\$\d+$/.test(qf.cash || '')) fail.push(w + ' QF cash: ' + qf.cashLab + ' ' + qf.cash);
    if (!/0 \/ 150/.test(qf.blk) || !/\+50 pts/.test(qf.blk)) fail.push(w + ' QF bar: ' + qf.blk.replace(/\n/g, ' | '));
    if (qf.wide) fail.push(w + ': QF Result scrolls sideways');
    if (qf.s3xp && !new RegExp('\\+' + (qf.s3xp.xp != null ? qf.s3xp.xp : '') ).test(qf.xpTxt || '') && qf.s3xp.xp != null) fail.push(w + ' XP on screen ' + qf.xpTxt + ' vs S.s3xp ' + JSON.stringify(qf.s3xp));
    if (w !== 390) return;
    const sf = await match(null); out.sf = { blk: sf.blk, cells: sf.cells }; if (!/through to the final/i.test(sf.blk || '')) fail.push('SF block: ' + sf.blk);
    const fin = await match('s3_rp_390_final.png'); out.fin = fin;
    if (!/winner/i.test(fin.blk || '') || !/\$35 prize money/i.test(fin.blk || '')) fail.push('Final block: ' + (fin.blk || '').replace(/\n/g, ' | '));
    if (fin.cashLab !== 'Prize money' || fin.cash !== '+$35') fail.push('Final cash ' + fin.cashLab + ' ' + fin.cash);
    if (fin.bank !== 90) fail.push('bank after the night ' + fin.bank + ' (want 60 - 5 + 35 = 90)');
    if (!/50 \/ 150/.test(fin.blk || '') || !/\+50/.test(fin.blk || '') || fin.barB !== '0%' || !fin.barG) fail.push('Final bar: ' + JSON.stringify({ blk: fin.blk, b: fin.barB, g: fin.barG, pts: fin.pts }));
    if (!/s3-rpfin/.test(fin.cells[2] || '') || !/s3-rpw/.test(fin.cells[2] || '')) fail.push('Final draw cells ' + JSON.stringify(fin.cells));
    // 2 direct renders: lost QF, group stage, promotion
    out.direct = await p.evaluate(() => { const U = TOPS_S3UI, c = career(), k = c.circuit, keep = JSON.stringify(k), r = {};
      const fakeS = (s3, won, res) => ({ s3, won, s3res: res });
      k.live = null; r.lost = U.resultBlock(fakeS({ id: 'pub_night', round: 'QF', level: 0 }, false, { done: true, fin: 'QF', finName: 'Quarter-final', prize: 5, pts: 10 }), c);
      k.level = 2; k.bank = 1000; TOPS_CIRCUIT.book(k, 'northland'); r.group = U.resultBlock(fakeS({ id: 'northland', round: 'G', level: 2 }, true, { next: true, group: k.live.g = { w: 1, p: 1 } }), c);
      k.live = null; k.level = 1; r.promo = U.resultBlock(fakeS({ id: 'kauri_cup', round: 'F', level: 0 }, true, { done: true, fin: 'W', finName: 'Winner', prize: 170, pts: 150, up: { to: 1, n: 'Club' } }), c);
      Object.assign(k, JSON.parse(keep)); const tx = h => { const d = document.createElement('div'); d.innerHTML = h; return d.innerText || d.textContent; };
      return { lost: r.lost && tx(r.lost.html), lostCash: r.lost && r.lost.cashVal, group: r.group && tx(r.group.html), promo: r.promo && tx(r.promo.html) }; });
    const d = out.direct; if (!/out in the quarter-final/i.test(d.lost || '') || d.lostCash !== '+$5') fail.push('lost QF: ' + JSON.stringify(d.lost) + ' ' + d.lostCash);
    if (!/group: 1 won, 0 lost/i.test(d.group || '') && !/group/i.test(d.group || '')) fail.push('group: ' + d.group);
    if (!/promoted to club/i.test(d.promo || '')) fail.push('promotion: ' + d.promo); });
  // 3 s3x off: nothing changes (no block; the 4.13 cash label and value)
  await session('?s3=1&s3x=0', 390, 844, async (p, match) => { const r = await match(null); out.off = { blk: r.blk, cashLab: r.cashLab, cash: r.cash };
    if (r.blk !== null || r.cashLab !== 'Prize money · paid at the end' || r.cash !== '+$0') fail.push('s3x off changed the Result: ' + JSON.stringify(out.off)); });
  console.log(JSON.stringify(out).slice(0, 1500)); console.log(fail.length ? 's3-progress FAIL: ' + fail.join('; ') : 's3-progress PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
