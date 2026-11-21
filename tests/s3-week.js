// EXP-IDLE 4: the rest week and the broke week behind s3x=1, on Career's CAR-DEADWK data. At 390 / 360 / 320:
//  rest (short gap): kicker, 'Next up: <event>', the weeks line (now → event), winner prize, cost, budget, 'On to / Skip to week N'; the tap
//    moves the week to Career's nextEventWeek and the event's poster shows; 'Practise first' opens Practice.
//  rest (long gap): more than 5 rest weeks fold into one '… N weeks' cell, nothing scrolls sideways.
//  broke (with debt): the cheapest trip, the budget, what you owe; Recovery entry says what you'll owe after it and books + starts the match;
//    Money match states the purse (MM_PAY at your level) and 'nothing to lose'; no Hardship advance while in debt (shown when not).
//  s3x off: Career's 4.18 screens unchanged.
// usage: node tests/s3-week.js [dir]   (SHOTS=1 writes tests/s3_wk_<case>_<w>.png)
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const boot = async (x, w, h) => { const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: process.env.SHOTS ? 2 : 1 }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} }); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.goto('file://' + dir + '/index.html?s3=1&s3x=' + x, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3 && window.TOPS_S3UI, null, { timeout: 180000 }); await p.waitForTimeout(1500);
    await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); }); await p.waitForTimeout(2000);
    await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); }); return { ctx, p, pe }; };
  const state = (p, k) => p.evaluate(k => { const c = career(), C = TOPS_CIRCUIT; let wk = k.week;
      if (k.find === 'rest' || k.find === 'long') { for (let w = 1; w < 400; w++) { const t = Object.assign({}, c.circuit, { level: k.level, week: w, live: null }); if (!C.calendar(t).length) { const nx = C.nextEventWeek(t); if (nx != null && (k.find === 'rest' ? nx - w <= 3 : nx - w > 7)) { wk = w; break; } } } }
      if (k.find === 'event') { for (let w = 1; w < 400; w++) { if (C.calendar(Object.assign({}, c.circuit, { level: k.level, week: w, live: null })).length) { wk = w; break; } } }
      Object.assign(c.circuit, { level: k.level, week: wk, live: null, booked: null, debt: k.debt || 0 }); c.bank = k.bank; c.tier = k.level; persist();
      TOPS_S3UI.refreshRecords(); const t = document.querySelector('#rbTabs [data-t="circuit"]'); if (t) t.click(); return { week: wk, nx: C.nextEventWeek(c.circuit), cal: C.calendar(c.circuit).length }; }, k);
  const clear = async p => { for (let i = 0; i < 8; i++) { await p.waitForTimeout(350); const ok = await p.$('#s3Ok'); if (!ok) { if (i > 2) break; continue; } await ok.click().catch(() => {}); } };   // seeded level changes raise the promotion announcement
  const read = p => p.evaluate(() => { const app = document.getElementById('rbApp'), q = s => app.querySelector(s), tx = e => e ? e.innerText.replace(/\s+/g, ' ').trim() : null;
    const wk = q('.s3-wk'); return { wk: tx(wk), line: [...app.querySelectorAll('.s3-wkline li')].map(tx), btns: [...app.querySelectorAll('.s3-wk button')].map(x => ({ t: tx(x), clip: x.scrollWidth > x.clientWidth + 1 || x.scrollHeight > x.clientHeight + 1 || [...x.children].some(ch => ch.scrollWidth > ch.clientWidth + 1 || ch.getBoundingClientRect().bottom > x.getBoundingClientRect().bottom + 1) })),
      rest: !!q('.s3-rest'), broke: !!q('.s3-broke'), posters: app.querySelectorAll('.s3-post').length, wide: document.documentElement.scrollWidth > innerWidth + 1 || (q('.rb-scr') && q('.rb-scr').scrollWidth > q('.rb-scr').clientWidth + 1) }; });
  const shot = async (p, n) => { if (!process.env.SHOTS) return; await p.evaluate(() => { const w = document.querySelector('#rbApp .s3-wk, #rbApp .s3-rest, #rbApp .s3-broke'); if (w) w.scrollIntoView({ block: 'start' }); }); await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, 's3_wk_' + n + '.png') }); };
  for (const [w, h] of [[390, 844], [360, 640], [320, 640]]) { const { ctx, p, pe } = await boot(1, w, h);
    // rest, short gap
    const s1 = await state(p, { level: 2, find: 'rest', bank: 900 }); await clear(p); const r1 = await read(p); out['rest' + w] = { s1, wk: r1.wk, line: r1.line, btns: r1.btns };
    const gap = s1.nx - s1.week, ev = await p.evaluate(nx => { const c = career().circuit, C = TOPS_CIRCUIT; const e = C.calendar(Object.assign({}, c, { week: nx })).sort((a, b) => a.cost - b.cost)[0]; return { n: e.n, cost: e.cost, win: C.prizeFor(e, 'W') }; }, s1.nx);
    if (!r1.wk || !new RegExp('^next up ' + ev.n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' week ' + s1.nx + '\\.', 'i').test(r1.wk)) fail.push(w + ' rest head ' + r1.wk);
    const f1 = await p.evaluate(() => { const g = s => { const e = document.querySelector('#rbApp ' + s); if (!e) return null; const cs = getComputedStyle(e); return { st: cs.fontStyle, wt: cs.fontWeight, fam: cs.fontFamily.split(',')[0].replace(/"/g, '') }; }; return { up: g('.s3-wkup'), ev: g('.s3-wkevn') }; });   // 4b (B)
    if (!f1.up || f1.up.st !== 'italic' || +f1.up.wt < 800 || !/barlow/i.test(f1.up.fam) || !f1.ev || f1.ev.st !== 'normal' || +f1.ev.wt < 700 || !/inter/i.test(f1.ev.fam)) fail.push(w + ' headline faces ' + JSON.stringify(f1));
    // 4b (A): the context line: hidden at the top, shown once the level card scrolls away, clear of the card, names the level and week
    const cx = async () => p.evaluate(() => { const x = document.querySelector('#rbApp .s3-ctx'), sp = x && x.firstElementChild, scr = document.querySelector('#rbApp .rb-scr'), wk = document.querySelector('#rbApp .s3-wk'); if (!sp) return null; const a = sp.getBoundingClientRect(), sc = scr.getBoundingClientRect(), k = wk.getBoundingClientRect();
      const xr = x.getBoundingClientRect(); return { on: x.classList.contains('on'), txt: sp.textContent, cut: sp.scrollWidth > sp.clientWidth + 1, top: Math.round(xr.top - sc.top), bottom: Math.round(xr.bottom - sc.top), gapToCard: Math.round(k.top - xr.bottom), cardTop: Math.round(k.top - sc.top) }; });
    // scroll so the card sits under the header (as when the page opens there), then to the very bottom: the header pins at the top and never covers the card
    const cx0 = await cx(); await p.evaluate(() => document.querySelector('#rbApp .s3-wk').scrollIntoView({ block: 'start' })); await p.waitForTimeout(500); const cx1 = await cx();
    await p.evaluate(() => { const s = document.querySelector('#rbApp .rb-scr'); s.scrollTop = s.scrollHeight; }); await p.waitForTimeout(400); const cx2 = await cx(); out['ctx' + w] = { cx0, cx1, cx2 };
    const lvN = await p.evaluate(() => TOPS_CIRCUIT.LEVELS[career().circuit.level].n);
    if (!cx0 || cx0.on || cx0.cut || cx0.gapToCard < 0 || !new RegExp('^' + lvN + ' · week ' + s1.week + ' · rest week$', 'i').test(cx0.txt)) fail.push(w + ' context header at the top ' + JSON.stringify(cx0));
    if (!cx1 || cx1.gapToCard < 0 || cx1.top < -1 || !cx2 || cx2.top < -1 || cx2.top > 1 && cx2.cardTop < cx2.bottom || (cx2.cardTop < 0 && !cx2.on)) fail.push(w + ' context header when scrolled ' + JSON.stringify({ cx1, cx2 }));
    if (process.env.SHOTS) await p.screenshot({ path: path.join(__dirname, 's3_wk_ctx_' + w + '.png') });
    await p.evaluate(() => { document.querySelector('#rbApp .rb-scr').scrollTop = 0; }); await p.waitForTimeout(300);
    if (!new RegExp('winner takes \\$' + ev.win.toLocaleString('en-US') + ' to enter.*\\$' + ev.cost + ' tour budget \\$900', 'i').test(r1.wk || '')) fail.push(w + ' rest facts ' + r1.wk);
    if (r1.line.length !== gap + 1 || !/^wk \d+ rest$/i.test(r1.line[0]) || !new RegExp('^wk ' + s1.nx + ' ', 'i').test(r1.line[r1.line.length - 1])) fail.push(w + ' weeks line ' + JSON.stringify(r1.line) + ' gap ' + gap);
    const go = r1.btns.find(x => /^(on|skip) to week/i.test(x.t)); if (!go || !new RegExp('^' + (gap > 1 ? 'skip' : 'on') + ' to week ' + s1.nx, 'i').test(go.t)) fail.push(w + ' rest button ' + JSON.stringify(r1.btns));
    if (r1.btns.some(x => x.clip)) fail.push(w + ' rest button text clipped ' + JSON.stringify(r1.btns)); if (r1.wide) fail.push(w + ' rest scrolls sideways');
    await shot(p, 'rest_' + w);
    await p.locator('#rbApp .s3-wk [data-s3="rest"]').tap(); await p.waitForTimeout(900); const a1 = await p.evaluate(() => ({ week: career().circuit.week, cal: TOPS_CIRCUIT.calendar(career().circuit).length }));
    const r1b = await read(p); if (a1.week !== s1.nx || !a1.cal || !r1b.posters || r1b.wk) fail.push(w + ' after the rest tap ' + JSON.stringify({ a1, posters: r1b.posters, wk: r1b.wk }));
    // practise link
    await state(p, { level: 2, find: 'rest', bank: 900 }); await clear(p); await p.locator('#rbApp .s3-wk [data-s3="toprac"]').tap(); await p.waitForTimeout(700);
    const pr = await p.evaluate(() => (document.querySelector('#rbTabs [aria-selected="true"]') || {}).dataset); if (!pr || pr.t !== 'practice') fail.push(w + ' Practise first → ' + JSON.stringify(pr));
    // rest, long gap
    const s2 = await state(p, { level: 6, find: 'long', bank: 5000 }); await clear(p); const r2 = await read(p); out['long' + w] = { s2, line: r2.line };
    if (s2.nx == null || r2.line.length !== 3 || !new RegExp('^… ' + (s2.nx - s2.week - 1) + ' weeks$').test(r2.line[1] || '') || r2.wide || r2.btns.some(x => x.clip)) fail.push(w + ' long rest ' + JSON.stringify({ s2, line: r2.line, wide: r2.wide, btns: r2.btns }));
    if (w === 390) await shot(p, 'long_' + w);
    // broke, in debt
    const s3 = await state(p, { level: 2, find: 'event', bank: 0, debt: 40 }); await clear(p); const r3 = await read(p); out['broke' + w] = { s3, wk: r3.wk, btns: r3.btns.map(x => x.t) };
    const ro = await p.evaluate(() => TOPS_CIRCUIT.recoveryOffer(career().circuit)), mm = await p.evaluate(() => MM_PAY[2]);
    const bh = await p.evaluate(() => { const sp = document.querySelector('#rbApp .s3-ctx>span'); return sp ? { t: sp.textContent, cut: sp.scrollWidth > sp.clientWidth + 1 } : null; });
    if (!bh || bh.cut || !/^regional opens · week \d+$/i.test(bh.t)) fail.push(w + ' broke context header ' + JSON.stringify(bh));
    const off3 = await p.evaluate(() => document.querySelectorAll('#rbApp .s3-post .s3-off').length); if (off3) fail.push(w + ' greyed Need buttons still showing under the recovery card: ' + off3);   // 4b (C)
    if (!/^get back on tour can't afford a trip this week cheapest trip/i.test(r3.wk || '') || !new RegExp('cheapest trip.*\\$' + ro.cost + ' tour budget \\$0 you owe \\$40', 'i').test(r3.wk || '')) fail.push(w + ' broke head/facts ' + r3.wk);
    const rec = r3.btns.find(x => /^recovery entry/i.test(x.t)), mmb = r3.btns.find(x => /^money match/i.test(x.t)), adv = r3.btns.find(x => /^hardship advance/i.test(x.t));
    if (!rec || !new RegExp(ro.n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ', \\$' + ro.cost + " covered\\. you'll owe \\$" + (40 + ro.cost) + ' in total, paid back', 'i').test(rec.t)) fail.push(w + ' recovery option ' + JSON.stringify(rec));
    if (!mmb || !new RegExp('win it for \\$' + mm + '\\. nothing to lose', 'i').test(mmb.t)) fail.push(w + ' money match option ' + JSON.stringify(mmb)); if (adv) fail.push(w + ': hardship advance offered while in debt');
    if (r3.btns.some(x => x.clip) || r3.wide) fail.push(w + ' broke layout ' + JSON.stringify(r3.btns));
    await shot(p, 'broke_' + w);
    if (w === 390) { await p.locator('#rbApp .s3-wk [data-s3="rec"]').tap(); for (let i = 0; i < 40 && !(await p.evaluate(() => typeof S !== 'undefined' && !!S && !S.done)); i++) await p.waitForTimeout(250);
      const a3 = await p.evaluate(() => ({ live: career().circuit.live, debt: career().circuit.debt, match: typeof S !== 'undefined' && !!S && !S.done, s3: typeof S !== 'undefined' && S && S.s3 }));
      if (!a3.live || a3.live.recovery !== 1 || a3.debt !== 40 + ro.cost || !a3.match || !a3.s3) fail.push('recovery entry tap ' + JSON.stringify(a3)); }
    const tabs = await p.evaluate(() => [...document.querySelectorAll('#rbTabs button')].filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent)); if (tabs.length) fail.push(w + ' tab labels clipped: ' + tabs.join(', '));
    if (pe.length) fail.push(w + ' page errors ' + pe.join('; ').slice(0, 200)); await ctx.close(); }
  // broke, no debt (advance offered) + s3x off
  { const { ctx, p } = await boot(1, 390, 844); await state(p, { level: 2, find: 'event', bank: 0, debt: 0 }); await clear(p); const r = await read(p); if (!r.btns.some(x => /^hardship advance two entries/i.test(x.t))) fail.push('no debt: hardship advance missing ' + JSON.stringify(r.btns)); const rc0 = r.btns.find(x => /^recovery entry/i.test(x.t)); if (!rc0 || /in total/i.test(rc0.t) || !/you'll owe \$\d+, paid back/i.test(rc0.t)) fail.push('no debt: recovery copy ' + JSON.stringify(rc0)); /* 'in total' only when there's debt already */ await ctx.close(); }
  { const { ctx, p } = await boot(0, 390, 844); await state(p, { level: 2, find: 'rest', bank: 900 }); await p.waitForTimeout(700); const r = await read(p); await state(p, { level: 2, find: 'event', bank: 0, debt: 40 }); await clear(p); const r2 = await read(p);
    out.off = { rest: r.rest, wk: !!r.wk, broke: r2.broke, wk2: !!r2.wk, need: await p.evaluate(() => document.querySelectorAll('#rbApp .s3-post .s3-off').length), ctx: await p.evaluate(() => !!document.querySelector('#rbApp .s3-ctx')) }; if (!r.rest || r.wk || !r2.broke || r2.wk || !out.off.need || out.off.ctx) fail.push('s3x off changed the 4.18 screens ' + JSON.stringify(out.off)); await ctx.close(); }
  console.log(JSON.stringify(out).slice(0, 2500)); console.log(fail.length ? 's3-week FAIL: ' + fail.join('; ') : 's3-week PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
