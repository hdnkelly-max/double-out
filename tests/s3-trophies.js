// EXP-IDLE 3 trophy shelf in Locker > Trophies (behind s3x=1).
//  A brand-new Season 3 career: the shelf is empty (empty state, no best leg, no titles chip on the Circuit). Then a real Pub night is played
//  through and won: the shelf shows 1 title, the Kauri Arms night trophy in gold with its prize and week, the best leg equal to
//  career().best.leg (the number the Best Leg board ranks) with the event and week, and Seasons 1 & 2 from Career's live tops_history view.
//  The Circuit level card shows '1 title' and tapping it opens Locker > Trophies. A direct render with more history checks a promoted level,
//  a runner-up (silver) and repeat wins. With s3x off the Locker keeps the old trophy list and the Circuit has no chip.
// usage: node tests/s3-trophies.js [dir]   (SHOTS=1 writes tests/s3_tr_<w>.png and tests/s3_tr_390_more.png)
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
    const match = async (loseFinal) => {   // one Circuit match as the player taps it (won, or lost if it's the final and loseFinal); back on the hub afterwards
      if (await vis('#rbApp [data-s3book="pub_night"]')) await tap('#rbApp [data-s3book="pub_night"]'); else if (await vis('#rbApp [data-s3book]')) await tap('#rbApp [data-s3book]'); await p.waitForTimeout(500); await tap('#s3Go');
      for (let i = 0; i < 80 && !(await p.evaluate(() => typeof S !== 'undefined' && S && !S.done).catch(() => false)); i++) await p.waitForTimeout(250);
      for (let i = 0; i < (loseFinal ? 5000 : 1500); i++) { const s = await p.evaluate(lf => { try { if (!S || S.done) return 'done'; if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(0, 0); } return 'play'; }
          if (S.cur === 0 && !S.busy && !S.p[0].ai && S.view !== 1) { const me = S.p[0]; S.busy = true; if (lf && S.s3 && S.s3.round === 'F') land(0, -320); else if (me.score > 200) land(0, -103); else if (me.score - 20 >= 40) land(0, -60); else { me.score = 40; land(0, -166); } }   /* T20s, single 20s, out on D20: a 14-dart leg */ const it = document.getElementById('intro'); if (it && it.classList.contains('show')) it.click(); return 'play'; } catch (e) { return 'ERR ' + e.message; } }, !!loseFinal).catch(() => 'nav'); if (s !== 'play') break; await p.waitForTimeout(120); }
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
        old: q('#s3TrHi') ? q('#s3TrHi').innerText.replace(/\s+/g, ' ') : null, oldList: !!q('#rbCab'), wide: document.documentElement.scrollWidth > innerWidth + 1, leg: (career().best || {}).leg, legAt: (career().best || {}).legAt, titles: career().circuit.titles || [] }; });
    await fn(p, { match, toTrophies, read, tap, vis, settle }); if (pe.length) fail.push(qs + ' ' + vw + ' page errors ' + pe.join('; ').slice(0, 160)); await ctx.close(); };
  for (const [w, h] of [[390, 844], [360, 640], [320, 640]]) await session('?s3=1&s3x=1', w, h, async (p, T) => {
    // 1 empty
    const chip0 = await T.vis('#rbApp .s3-trchip'); await T.toTrophies(); const e = await T.read(); out['empty' + w] = { hero: e.hero, bl: e.bl, empty: e.empty, n: e.cups.length };
    if (chip0) fail.push(w + ': titles chip shows with no titles'); if (!e.shelf || !e.empty || !/titles 0 finals 0/i.test(e.hero || '') || !/win a 501 leg/i.test(e.bl || '')) fail.push(w + ' empty shelf: ' + JSON.stringify(out['empty' + w]));
    if (e.cups.length !== 2 || e.cups.some(c => !/^s3-tre/.test(c))) fail.push(w + ' empty cups ' + JSON.stringify(e.cups));
    // 2 a real Pub night, won
    await T.tap('#rbApp [data-tab="circuit"]'); await p.evaluate(() => { const t = [...document.querySelectorAll('#rbApp button')].find(x => /^circuit$/i.test(x.textContent.trim())); if (t) t.click(); }); await p.waitForTimeout(500);
    for (let i = 0; i < 3; i++) await T.match(); await T.settle();
    const live = await p.evaluate(async () => ({ hist: await TOPS_HISTORY.rows(), bl: await TOPS_BESTLEG.table() }));   // Career's live views
    await p.evaluate(() => { const t = [...document.querySelectorAll('#rbApp button')].find(x => /^circuit$/i.test(x.textContent.trim())); if (t) t.click(); }); await p.waitForTimeout(1200);
    const chip = await p.evaluate(() => { const c = document.querySelector('#rbApp .s3-trchip'); return c ? c.innerText.trim() : null; }); out['chip' + w] = chip;
    if (!/^1 title/.test(chip || '')) fail.push(w + ': titles chip ' + chip);
    if (process.env.SHOTS) await p.screenshot({ path: path.join(__dirname, 's3_tr_chip_' + w + '.png'), clip: { x: 0, y: 0, width: w, height: 330 } });
    const nav0 = await p.evaluate(() => { const sc = document.querySelector('#rbMain .rb-scr'); if (sc) sc.scrollTop = 150; return { hl: history.length, y: sc ? sc.scrollTop : 0 }; });   // P2: return lands back where you were
    await p.evaluate(() => { const c = document.querySelector('#rbApp .s3-trchip'); if (c) c.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(200); nav0.y = await p.evaluate(() => { const sc = document.querySelector('#rbMain .rb-scr'); return sc ? Math.round(sc.scrollTop) : 0; });
    await T.tap('#rbApp .s3-trchip'); await p.waitForTimeout(900); const r = await T.read(); out['won' + w] = r;
    if (!r.shelf) fail.push(w + ': the chip did not open Locker > Trophies');
    if (r.titles.length !== 1 || r.titles[0].finish !== 'W' || r.titles[0].ev !== 'pub_night') fail.push(w + ' titles ' + JSON.stringify(r.titles));
    if (!/titles 1 finals 1 prize money \$35/i.test(r.hero || '')) fail.push(w + ' hero ' + r.hero);
    if (!/^s3-trW:KAURI ARMS LEAGUE NIGHT Winner · \$35 Week 1$/i.test(r.cups[0] || '') || !/^s3-tre/.test(r.cups[1] || '')) fail.push(w + ' Pub shelf ' + JSON.stringify(r.cups));
    if (!/^pub this level$/i.test(r.lv[0] || '') || !/^club next level/i.test(r.lv[1] || '')) fail.push(w + ' level rows ' + JSON.stringify(r.lv));
    if (r.empty) fail.push(w + ': empty state still showing with a title');
    // best leg: the same number Career sends to the Best Leg board, with where it came from; the record line from Career's tops_bestleg_s3
    if (!(r.leg >= 9 && r.leg < 99) || !new RegExp('^' + r.leg + ' darts your best leg · season 3 kauri arms league night · week 1', 'i').test(r.bl || '') || !r.legAt || r.legAt.week !== 1) fail.push(w + ' best leg ' + JSON.stringify({ bl: r.bl, leg: r.leg, at: r.legAt }));
    const rec = live.bl[0]; if (!rec || !new RegExp('season 3 record: ' + rec.darts + ' darts · ' + rec.name, 'i').test(r.bl || '')) fail.push(w + ' record line vs tops_bestleg_s3 ' + JSON.stringify({ bl: r.bl, rec }));
    const me = live.hist.find(x => x.you); const s2 = me && me.s2;
    if (!me || !new RegExp('season 1 ' + me.s1.furthest.n + ' ' + me.s1.bestAvg.toFixed(1) + ' avg ' + me.s1.bestLeg + ' darts season 2 ' + me.s2.furthest.n + ' ' + s2.bestAvg.toFixed(1) + ' avg ' + s2.bestLeg + ' darts', 'i').test(r.old || '')) fail.push(w + ' seasons vs tops_history ' + JSON.stringify({ old: r.old, me }));
    if (r.wide) fail.push(w + ': Trophies scrolls sideways');
    const cupW = await p.evaluate(() => [...document.querySelectorAll('#rbApp .s3-tr')].map(l => Math.round(l.getBoundingClientRect().width))); if (cupW.some(x => x < 90)) fail.push(w + ' trophy cards too narrow ' + cupW);
    if (process.env.SHOTS) { await p.evaluate(() => { const m = document.querySelector('#rbApp .rb-scr') || document.getElementById('rbMain'); if (m) m.scrollTop = 0; }); await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, 's3_tr_' + w + '.png'), fullPage: false }); }
    // P2 navigation: the chip opened Locker > Trophies, '‹ Back to Circuit' returns to the same place, no browser history added, and the
    // button is gone once you move around the Locker yourself
    const navA = await p.evaluate(() => ({ tab: (document.querySelector('#rbTabs [aria-selected="true"]') || {}).dataset, lk: !!document.querySelector('#rbApp [data-lk="troph"].on, #rbApp [data-lk="troph"][aria-selected="true"], #rbApp [data-lk="troph"][aria-pressed="true"]'), back: !!document.querySelector('#rbApp .s3-trback'), hl: history.length }));
    await T.tap('#rbApp .s3-trback'); await p.waitForTimeout(600);
    const navB = await p.evaluate(() => { const sc = document.querySelector('#rbMain .rb-scr'); return { tab: (document.querySelector('#rbTabs [aria-selected="true"]') || {}).dataset, chip: !!document.querySelector('#rbApp .s3-trchip'), y: sc ? Math.round(sc.scrollTop) : 0, hl: history.length }; });
    await T.toTrophies(); const navC = await p.evaluate(() => ({ shelf: !!document.querySelector('#rbApp .s3-trh'), back: !!document.querySelector('#rbApp .s3-trback') }));
    out['nav' + w] = { y0: nav0.y, navA, navB, navC };
    if (!navA.tab || navA.tab.t !== 'locker' || !navA.back || navA.hl !== nav0.hl) fail.push(w + ' chip → Trophies ' + JSON.stringify(navA));
    if (!navB.tab || navB.tab.t !== 'circuit' || !navB.chip || Math.abs(navB.y - nav0.y) > 2 || navB.hl !== nav0.hl) fail.push(w + ' back to Circuit ' + JSON.stringify({ navB, y0: nav0.y }));
    if (!navC.shelf || navC.back) fail.push(w + ' Trophies opened from the Locker still shows the back button ' + JSON.stringify(navC));
    if (w !== 390) return;
    // a real runner-up: a second Pub night, won through to the final and lost there; then a reload: nothing counted twice
    await p.evaluate(() => { const t = document.querySelector('#rbTabs [data-t="circuit"]'); if (t) t.click(); }); await p.waitForTimeout(600);
    for (let i = 0; i < 3; i++) await T.match(true); await T.settle();
    const ru = await p.evaluate(() => { const k = career().circuit; return { titles: (k.titles || []).map(t => t.ev + ':' + t.finish), hist: k.history.map(h => h.id + ':' + h.fin + ':' + h.week) }; }); out.runnerUp = ru;
    if (ru.titles.join() !== 'pub_night:W,pub_night:F' || ru.hist.join() !== 'pub_night:W:1,pub_night:F:2') fail.push('real runner-up saved as ' + JSON.stringify(ru));
    const chk = async tag => { await T.toTrophies(); await T.settle(); const r = await T.read(); out[tag] = { hero: r.hero, cups: r.cups };
      const sum = await p.evaluate(() => career().circuit.history.reduce((a, h) => a + (h.prize || 0), 0));
      if (!new RegExp('titles 1 finals 2 prize money \\$' + sum.toLocaleString('en-US') + '$', 'i').test(r.hero || '') || !/^s3-trW:KAURI ARMS LEAGUE NIGHT Winner · \$35 Week 1 \+ runner-up$/i.test(r.cups[0] || '') || r.titles.length !== 2) fail.push(tag + ' ' + JSON.stringify({ hero: r.hero, cups: r.cups, n: r.titles.length })); };
    await chk('runnerUpShelf');
    await p.reload(); await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(() => { $('login').hidden = true; showHub('play'); document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); }); await p.waitForTimeout(1200);
    await chk('afterReload');
    // 3 more history (direct): promoted to Club, a runner-up, two Kauri wins
    await p.evaluate(() => { const k = career().circuit; k.titles.push({ ev: 'kauri_cup', n: 'The Kauri Cup', level: 0, season: 3, finish: 'F', prize: 85, date: new Date().toISOString() }, { ev: 'pub_night', n: 'Kauri Arms league night', level: 0, season: 3, finish: 'W', prize: 35, date: new Date().toISOString() });
      k.history.push({ week: 3, id: 'kauri_cup', n: 'The Kauri Cup', level: 0, fin: 'F', prize: 85, pts: 100 }, { week: 4, id: 'pub_night', n: 'Kauri Arms league night', level: 0, fin: 'W', prize: 35, pts: 50 }); k.level = 1; k.week = 5;
      const e = TOPS_CIRCUIT.LEVELS[1].events[0]; k.titles.push({ ev: e.id, n: e.n, level: 1, season: 3, finish: 'W', prize: 210, date: new Date().toISOString() }); k.history.push({ week: 5, id: e.id, n: e.n, level: 1, fin: 'W', prize: 210, pts: 50 }); k.week = 6; TOPS_S3UI.refreshRecords(); });
    await T.settle(); await p.waitForTimeout(400); const m = await T.read(); out.more = { hero: m.hero, cups: m.cups, lv: m.lv };
    if (!/titles 3 finals 5/i.test(m.hero || '')) fail.push('more hero ' + m.hero);
    if (!/^club this level$/i.test(m.lv[0] || '') || !/^pub promoted · week 4$/i.test(m.lv[1] || '') || !/^palace|^opens|next level/i.test(m.lv[2] || '')) fail.push('more levels ' + JSON.stringify(m.lv));
    if (!m.cups.some(c => /^s3-trW:KAURI ARMS LEAGUE NIGHT Winner ×2 · \$70 Weeks 1, 4 \+ runner-up$/i.test(c)) || !m.cups.some(c => /^s3-trF:THE KAURI CUP Runner-up · \$85 Week 3$/i.test(c)) || !m.cups.some(c => /^s3-tre:INTERCLUB Not won yet$/i.test(c))) fail.push('more cups ' + JSON.stringify(m.cups));
    if (process.env.SHOTS) { await p.evaluate(() => { const m = document.querySelector('#rbApp .rb-scr') || document.getElementById('rbMain'); if (m) m.scrollTop = 0; }); await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, 's3_tr_390_more.png'), fullPage: false }); } });
  // 4 s3x off: the old Trophies list, no chip
  await session('?s3=1&s3x=0', 390, 844, async (p, T) => { await p.evaluate(() => { const k = career().circuit; (k.titles = k.titles || []).push({ ev: 'pub_night', n: 'Kauri Arms league night', level: 0, season: 3, finish: 'W', prize: 35 }); TOPS_S3UI.refreshRecords(); }); await p.waitForTimeout(600);
    const chip = await T.vis('#rbApp .s3-trchip'); await T.toTrophies(); const r = await T.read(); out.off = { chip, shelf: r.shelf, oldList: r.oldList };
    if (chip || r.shelf || !r.oldList) fail.push('s3x off changed Trophies: ' + JSON.stringify(out.off)); });
  console.log(JSON.stringify(out).slice(0, 1800)); console.log(fail.length ? 's3-trophies FAIL: ' + fail.join('; ') : 's3-trophies PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
