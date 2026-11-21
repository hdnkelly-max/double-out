// EXP-IDLE 3b (split from s3-trophies.js so each file fits CI's 600 s): the trophy shelf from a real lost final, and the chip at 320.
//  390: a brand-new Season 3 career plays a real Pub night through the quarter-final and semi-final and loses the final. Career saves one
//    title with finish F (never W); the history says F in week 1; the Circuit chip reads '1 final'; the shelf: Titles 0, Finals 1, prize money
//    = the event's prize, the Kauri Arms card silver 'Runner-up · $N, Week 1'; after a reload nothing is counted twice.
//  320: a saved win (seeded): the chip opens Locker > Trophies, '‹ Back to Circuit' returns, no sideways scroll, cards 96 px or wider.
// usage: node tests/s3-trophies-final.js [dir]   (SHOTS=1 writes tests/s3_trf_<w>.png)
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const NEXT = ['#rbRGo', '#rbRKeep', '#lvFirst', '#tcWelLater', '#btnResultNext', '#c3rwGo', '#c3rwKeep', '#btnPerkLater', '#tcPLater', '.tcpk__later', '#msgReplies button', '.tc-sheet [data-close]', '.tc-sheet .tc-x', '#s3Ok'];
  const HIST = [{ who: 'Hayden', season: 1, tier: 1, title: null, best_avg: '61.4', best_leg: 17 }, { who: 'Hayden', season: 2, tier: 2, title: 'Regional rep', best_avg: '88.2', best_leg: 13 }, { who: 'Lee McKenzie', season: 2, tier: 2, title: 'Regional rep', best_avg: '115.6', best_leg: 12 }];
  const BL = [{ name: 'Lee McKenzie', darts: 9, at: '2026-11-19T01:00:00Z' }, { name: 'David Fraser', darts: 13, at: '2026-11-19T02:00:00Z' }];
  const session = async (qs, vw, vh, fn) => { const ctx = await b.newContext({ viewport: { width: vw, height: vh }, hasTouch: true, isMobile: true, deviceScaleFactor: process.env.SHOTS ? 2 : 1 }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic/, r => r.abort());
    await p.route(/supabase\.co/, r => { const u = r.request().url(); if (/tops_history/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(HIST) });
      if (/tops_bestleg_s3/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(BL) }); r.abort(); });
    let loads = 0; p.on('load', () => loads++);
    const vis = sel => p.evaluate(sel => { const e = document.querySelector(sel); return !!(e && e.getClientRects().length && !e.disabled && getComputedStyle(e).visibility !== 'hidden'); }, sel).catch(() => false);
    const tap = async sel => { if (!(await vis(sel))) return false; try { await p.locator(sel).first().tap({ timeout: 8000 }); return true; } catch (e) { return false; } };
    const ready = async () => { await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(1500); };
    await p.goto('file://' + dir + '/index.html' + qs, { timeout: 180000 }); await ready();
    await p.evaluate(() => { localStorage.removeItem('tops_s3_seen'); save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
    await p.waitForTimeout(2500); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
    const match = async (loseFinal, quick) => {   // quick: legs won with one dart (QF/SF), so the test fits CI's 600 s; the deciding match is played out   // one Circuit match as the player taps it (won, or lost if it's the final and loseFinal); back on the hub afterwards
      if (await vis('#rbApp [data-s3book="pub_night"]')) await tap('#rbApp [data-s3book="pub_night"]'); else if (await vis('#rbApp [data-s3book]')) await tap('#rbApp [data-s3book]'); await p.waitForTimeout(500); await tap('#s3Go');
      for (let i = 0; i < 80 && !(await p.evaluate(() => typeof S !== 'undefined' && S && !S.done).catch(() => false)); i++) await p.waitForTimeout(250);
      for (let i = 0; i < (loseFinal ? 5000 : 1500); i++) { const s = await p.evaluate(([lf, qk]) => { try { if (!S || S.done) return 'done'; if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(0, 0); } return 'play'; }
          if (lf && S.s3 && S.s3.round === 'F' && S.cur === 1 && S.p[1].score > 40) S.p[1].score = 40;   /* the opponent checks out quickly in a final the player is losing */
          if (S.cur === 0 && !S.busy && !S.p[0].ai && S.view !== 1) { const me = S.p[0]; S.busy = true; if (lf && S.s3 && S.s3.round === 'F') land(0, -320); else if (qk) { me.score = 40; land(0, -166); } else if (me.score > 200) land(0, -103); else if (me.score - 20 >= 40) land(0, -60); else { me.score = 40; land(0, -166); } }   /* T20s, single 20s, out on D20: a 14-dart leg */ const it = document.getElementById('intro'); if (it && it.classList.contains('show')) it.click(); return 'play'; } catch (e) { return 'ERR ' + e.message; } }, [!!loseFinal, !!quick]).catch(() => 'nav'); if (s !== 'play') break; await p.waitForTimeout(120); }
      for (let i = 0; i < 60 && !(await vis('#rbApp.rb-resmode #rbRGo')); i++) await p.waitForTimeout(250); await p.waitForTimeout(800);
      const l0 = loads; for (let i = 0; i < 300 && loads === l0; i++) { for (const s of NEXT) { if (loads > l0) break; if (await tap(s)) { await p.waitForTimeout(300); break; } } await p.waitForTimeout(250); }
      if (loads > l0) await ready(); for (let i = 0; i < 20 && (await vis('#s3Ok')); i++) { await tap('#s3Ok'); await p.waitForTimeout(400); } };
    const settle = async () => { for (let i = 0; i < 24; i++) { if (await vis('#s3Ok')) { await tap('#s3Ok'); await p.waitForTimeout(500); i = Math.max(i, 16); } else await p.waitForTimeout(500); } };   // the event result / promotion announcements
    const toTrophies = async () => { await p.evaluate(() => { const t = document.querySelector('#rbApp [data-tab="locker"], #rbApp [data-t="locker"]'); if (t) t.click(); }); await p.waitForTimeout(500);
      if (!(await vis('#rbApp [data-lk="troph"]'))) await p.evaluate(() => { const t = [...document.querySelectorAll('#rbApp button')].find(x => /^locker$/i.test(x.textContent.trim())); if (t) t.click(); });
      await p.waitForTimeout(400); await tap('#rbApp [data-lk="troph"]'); await p.waitForTimeout(900); };
    const read = () => p.evaluate(() => { const app = document.getElementById('rbApp'); const q = s => app.querySelector(s);
      return { shelf: !!q('.s3-trh'), hero: q('.s3-trh') ? q('.s3-trh').innerText.replace(/\s+/g, ' ') : null, bl: q('.s3-trbl') ? q('.s3-trbl').innerText.replace(/\s+/g, ' ') : null, empty: !!q('.s3-tremp'),
        cups: [...app.querySelectorAll('.s3-tr')].map(l => l.className.replace('s3-tr ', '') + ':' + l.innerText.replace(/\s+/g, ' ')), lv: [...app.querySelectorAll('.s3-trlv .s3-row')].map(r => r.innerText.replace(/\s+/g, ' ')),
        old: q('#s3TrHi') ? q('#s3TrHi').innerText.replace(/\s+/g, ' ') : null, oldList: !q('.s3-trh') && !!q('#rbCab'), cab: !!q('.s3-trh') && !!q('#rbCab'), wide: document.documentElement.scrollWidth > innerWidth + 1, leg: (career().best || {}).leg, legAt: (career().best || {}).legAt, titles: career().circuit.titles || [] }; });
    await fn(p, { match, toTrophies, read, tap, vis, settle }); if (pe.length) fail.push(qs + ' ' + vw + ' page errors ' + pe.join('; ').slice(0, 160)); await ctx.close(); };
  await session('?s3=1&s3x=1', 390, 844, async (p, T) => {
    await p.evaluate(() => { const t = [...document.querySelectorAll('#rbApp button')].find(x => /^circuit$/i.test(x.textContent.trim())); if (t) t.click(); }); await p.waitForTimeout(500);
    for (let i = 0; i < 3; i++) await T.match(true, i < 2); await T.settle();   // QF and SF quick, the final lost
    const sv = await p.evaluate(() => { const k = career().circuit; return { titles: (k.titles || []).map(t => t.ev + ':' + t.finish), hist: k.history.map(h => h.id + ':' + h.fin + ':' + h.week), prize: k.history.reduce((a, h) => a + (h.prize || 0), 0) }; }); out.saved = sv;
    if (sv.titles.join() !== 'pub_night:F' || sv.hist.join() !== 'pub_night:F:1') fail.push('lost final saved as ' + JSON.stringify(sv));
    await p.evaluate(() => { const t = document.querySelector('#rbTabs [data-t="circuit"]'); if (t) t.click(); }); await p.waitForTimeout(800);
    const chip = await p.evaluate(() => { const c = document.querySelector('#rbApp .s3-trchip'); return c ? c.innerText.replace(/\s+/g, ' ').trim() : null; }); out.chip = chip;
    if (!/^1 final/.test(chip || '')) fail.push('chip ' + chip);
    const chk = async tag => { const r = await T.read(); out[tag] = { hero: r.hero, cups: r.cups.slice(0, 2), n: r.titles.length };
      if (!r.shelf || !new RegExp('^titles 0 finals 1 prize money \\$' + sv.prize.toLocaleString('en-US') + '$', 'i').test(r.hero || '') || !new RegExp('^s3-trF:KAURI ARMS LEAGUE NIGHT Runner-up · \\$' + sv.prize + ' Week 1$', 'i').test(r.cups[0] || '') || r.cups.some(c => /^s3-trW/.test(c)) || r.titles.length !== 1) fail.push(tag + ' ' + JSON.stringify(out[tag])); };
    await T.tap('#rbApp .s3-trchip'); await p.waitForTimeout(900); await chk('shelf');
    if (process.env.SHOTS) { await p.evaluate(() => { const m = document.querySelector('#rbApp .rb-scr'); if (m) m.scrollTop = 0; }); await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, 's3_trf_390.png') }); }
    await p.reload(); await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(() => { $('login').hidden = true; showHub('play'); document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); }); await p.waitForTimeout(1200);
    await T.toTrophies(); await T.settle(); await chk('afterReload'); });
  await session('?s3=1&s3x=1', 320, 640, async (p, T) => {
    await p.evaluate(() => { const k = career().circuit; (k.titles = k.titles || []).push({ ev: 'pub_night', n: 'Kauri Arms league night', level: 0, season: 3, finish: 'W', prize: 35, date: new Date().toISOString() });
      k.history.push({ week: 1, id: 'pub_night', n: 'Kauri Arms league night', level: 0, fin: 'W', prize: 35, pts: 50 }); k.week = 2; persist(); TOPS_S3UI.refreshRecords(); }); await T.settle();
    await p.evaluate(() => { const t = document.querySelector('#rbTabs [data-t="circuit"]'); if (t) t.click(); }); await p.waitForTimeout(800);
    const y0 = await p.evaluate(() => { const sc = document.querySelector('#rbApp .rb-scr'); const c = document.querySelector('#rbApp .s3-trchip'); if (c) c.scrollIntoView({ block: 'center' }); return sc ? Math.round(sc.scrollTop) : 0; });
    await T.tap('#rbApp .s3-trchip'); await p.waitForTimeout(900);
    const a = await p.evaluate(() => ({ tab: (document.querySelector('#rbTabs [aria-selected="true"]') || {}).dataset, back: !!document.querySelector('#rbApp .s3-trback'), shelf: !!document.querySelector('#rbApp .s3-trh'),
      wide: document.documentElement.scrollWidth > innerWidth + 1, minW: Math.min(...[...document.querySelectorAll('#rbApp .s3-tr')].map(l => l.getBoundingClientRect().width)), tabsCut: [...document.querySelectorAll('#rbTabs button')].filter(x => x.scrollWidth > x.clientWidth + 1).length }));
    if (process.env.SHOTS) await p.screenshot({ path: path.join(__dirname, 's3_trf_320.png') });
    await T.tap('#rbApp .s3-trback'); await p.waitForTimeout(600);
    const b2 = await p.evaluate(() => { const sc = document.querySelector('#rbApp .rb-scr'); return { tab: (document.querySelector('#rbTabs [aria-selected="true"]') || {}).dataset, y: sc ? Math.round(sc.scrollTop) : 0 }; }); out.w320 = { y0, a, b2 };
    if (!a.tab || a.tab.t !== 'locker' || !a.back || !a.shelf || a.wide || a.minW < 96 || a.tabsCut) fail.push('320 chip → Trophies ' + JSON.stringify(a));
    if (!b2.tab || b2.tab.t !== 'circuit') fail.push('320 back to Circuit ' + JSON.stringify(b2)); });
  console.log(JSON.stringify(out).slice(0, 1800)); console.log(fail.length ? 's3-trophies-final FAIL: ' + fail.join('; ') : 's3-trophies-final PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
