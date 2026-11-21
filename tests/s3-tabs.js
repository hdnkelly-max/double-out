// CAR-TABS (Q&D, Producer 22 Nov 07:38): two tabs of one browser lost real progress on 4.26: neither tab listened for the other's saves and
// every save wrote that tab's whole in-memory copy, so the last tab to save won. Now one tab owns the save; an older tab shows "TOPS is open
// in another tab" with "Play here"; a tab never overwrites a newer save (local or cloud); the hub only saves when something changed.
//   1 Q&D's repro: tab A on the hub, waiting; tab B wins a Pub night (week 2, bank $90); tab A taps a Circuit poster; a fresh load still has
//     week 2 and $90, and tab A shows the card. Play here reloads A with the latest save and takes ownership; B then shows the card
//   2 write guard on its own (no claim message, as from an older build): a newer save lands in storage behind tab A's back; A's next save
//     must not overwrite it, and A shows the card instead
//   3 no-career wipe: tab A sits on the title with no career; tab B starts a career; A saves once: B's career is still there
//   4 cloud: a stale tab never pushes its copy (the save RPC is not called), the owner does
//   5 the hub does not save on its redraws: an idle owner hub writes the save no more than once in 30 s (it was every 2.5 s)
//   9 p_base (DQ's server-side guard, a proposal): sent only when the server supports it; today's server gets exactly what it gets now
//   6 cloud, two devices (mocked cloud that keeps the higher counter, like tops_save3_put): device Y loads X's save and plays on; stale device X,
//     never pulling, saves more times than Y did; X's push must load Y's newer save, not overwrite it (a counter alone let X win)
//   10 the handshake race (DQ 22 Nov 10:52): a slow owner never leaves both tabs behind the card; mid-match it is known busy from its heartbeat
//   11 a tab that took over on a timeout adopts the late write of the tab it claimed from (2 s) instead of stepping aside
//   12 recovery copies when another build's tab writes the save
// usage: node tests/s3-tabs.js [dir]   (CASES=7,10 runs just those; pass an absolute dir)
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
require('fs').mkdirSync(path.join(dir, 'wip/car-tabs'), { recursive: true });
// served over http, like the real site: file:// pages in separate processes don't reliably share one localStorage (a second tab sometimes
// saw an empty store), which is a test-harness effect, not the game's
const http = require('http'), fs = require('fs'); const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const fp = path.join(dir, u === '/' ? 'index.html' : u); if (!fp.startsWith(dir)) { r.writeHead(403); return r.end(); }
  fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(fp)] || 'application/octet-stream' }); r.end(d); }); });
const RUN = n => !process.env.CASES || process.env.CASES.split(',').includes(String(n));
let url = ''; const f = []; const out = {};
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); url = 'http://127.0.0.1:' + srv.address().port + '/index.html?s3=1';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const open = async (ctx, init) => { const p = await ctx.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p._pe = pe;
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} }); if (init) await p.addInitScript(init);
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto(url, { timeout: 120000 }); await p.waitForFunction(() => window.TOPS_S3 && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1500); return p; };
  const card = p => p.evaluate(() => { const d = document.getElementById('tabsCard'); return d && !d.hidden && d.getClientRects().length ? d.innerText.replace(/\s+/g, ' ') : null; }).catch(() => null);
  const stored = p => p.evaluate(() => { const s = JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key) || '{}'); const c = s.career, k = c && c.circuit; return { sv: s.sv || 0, has: !!c, week: k ? k.week : null, bank: c ? c.bank : null, mark: s.__mark || null }; });
  // 1 Q&D's repro
  if (RUN(1)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); try { showHub('play'); } catch (e) {} }); await A.waitForTimeout(1500);   // let the write reach the other tab's process (localStorage syncs between tabs asynchronously)
    const B = await open(ctx); await B.waitForFunction(() => typeof career === 'function' && career() && career().circuit, null, { timeout: 60000 }); await B.waitForTimeout(800);
    out.b0 = await B.evaluate(() => ({ week: career().circuit.week, bank: career().bank }));
    await B.evaluate(() => { const c = career(); c.circuit.week = 2; c.bank = 90; c.circuit.history.push({ week: 1, id: 'pub_night', n: 'Kauri Arms League Night', level: 0, fin: 'W', prize: 35, pts: 50 }); persist(); });
    await A.waitForTimeout(3000); out.aCard = await card(A);
    const tap = await A.evaluate(() => { try { const e = TOPS_S3.view().calendar[0]; const r = TOPS_S3.book(e.id); persist(); return { ok: !!(r && r.ok) }; } catch (e) { return { err: String(e) }; } });
    await A.waitForTimeout(800); const C = await open(ctx); out.after = await stored(C); out.cCard = await card(C); out.tap = tap;
    if (out.after.week !== 2 || out.after.bank !== 90) f.push('1 tab A overwrote tab B\'s won Pub night ' + JSON.stringify(out.after));
    if (!out.aCard || !/TOPS is open in another tab/i.test(out.aCard) || !/Play here/i.test(out.aCard)) f.push('1 tab A shows the other-tab card ' + JSON.stringify(out.aCard));
    // Play here on A: reloads with the latest save and takes ownership; B and C step aside
    await A.setViewportSize({ width: 390, height: 844 }); await A.waitForTimeout(300); await A.screenshot({ path: path.join(dir, 'wip/car-tabs/tabs-card-390.png') }).catch(() => {}); await A.setViewportSize({ width: 360, height: 640 }); await A.screenshot({ path: path.join(dir, 'wip/car-tabs/tabs-card-360.png') }).catch(() => {});
    await C.close(); await A.evaluate(() => { const bt = document.querySelector('#tabsCard button'); if (bt) setTimeout(() => bt.click(), 50); }).catch(() => {});
    await A.waitForFunction(() => window.TOPS_S3 && window.C3 && !document.getElementById('tabsCard'), null, { timeout: 180000 }).catch(() => {}); await A.waitForTimeout(2500);
    out.playHere = await A.evaluate(() => ({ week: career().circuit.week, bank: career().bank, card: !!document.getElementById('tabsCard') })); out.bCard = await card(B);
    if (out.playHere.week !== 2 || out.playHere.bank !== 90 || out.playHere.card) f.push('1 Play here loads the latest save and plays ' + JSON.stringify(out.playHere));
    if (!out.bCard) f.push('1 after Play here on A, tab B shows the card');
    out.errs1 = [...A._pe, ...B._pe].slice(0, 2); await ctx.close(); }
  // 2 the write guard alone: a newer save lands behind A's back (no claim message)
  if (RUN(2)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); });
    await A.evaluate(() => { const s = JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key)); s.sv = (s.sv || 0) + 5; s.__mark = 'newer'; s.career.bank = 777; localStorage.setItem(TOPS_SAVE_NS.key, JSON.stringify(s)); career().bank = 1; persist(); });
    await A.waitForTimeout(500); out.guard = await stored(A); out.guardCard = await card(A);
    if (out.guard.mark !== 'newer' || out.guard.bank !== 777) f.push('2 a tab overwrote a newer save it never read ' + JSON.stringify(out.guard));
    if (!out.guardCard) f.push('2 the stale tab shows the card instead of saving');
    out.guardRescue = await A.evaluate(() => TOPS_TABS.rescues().map(r => r.why + ':' + (r.save && r.save.career && r.save.career.bank)));
    if (!out.guardRescue.includes('newer:1')) f.push('2 the tab keeps a recovery copy of its own save before stepping aside ' + JSON.stringify(out.guardRescue));
    await ctx.close(); }
  // 3 no-career wipe
  if (RUN(3)) { const ctx = await b.newContext(); const A = await open(ctx); out.a3 = await A.evaluate(() => !!(save.career));
    const B = await open(ctx); await B.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); career().bank = 4321; persist(); });
    await A.evaluate(() => { try { save.vol = (save.vol || 0) + 1; persist(); } catch (e) {} }); await A.waitForTimeout(500);
    out.wipe = await stored(B); if (!out.wipe.has || out.wipe.bank !== 4321) f.push('3 a stale tab with no career wiped the other tab\'s career ' + JSON.stringify(out.wipe));
    await ctx.close(); }
  // 4 cloud: the stale tab never pushes, the owner does
  if (RUN(4)) { const ctx = await b.newContext(); const stub = () => { window.__rpc = 0; window.__stubNet = () => { NET.user = { id: 'u1' }; NET.sb = { rpc: async n => { if (n === TOPS_SAVE_NS.rpc) window.__rpc++; return { data: { ok: true } }; }, from: () => ({ upsert: async () => { window.__rpc++; return {}; }, select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }) }; }; };
    const A = await open(ctx, stub); await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); }); await A.waitForTimeout(1500);
    const B = await open(ctx, stub); await B.waitForFunction(() => typeof career === 'function' && career(), null, { timeout: 60000 }); await B.evaluate(() => { career().bank = 555; persist(); }); await B.waitForTimeout(1500);
    await A.evaluate(() => { __stubNet(); career().bank = 2; cloudPush(true); persist(); }); await B.evaluate(() => { __stubNet(); career().bank = 556; cloudPush(true); });
    await A.waitForTimeout(800); out.cloud = { stale: await A.evaluate(() => window.__rpc), owner: await B.evaluate(() => window.__rpc) };
    if (out.cloud.stale !== 0) f.push('4 the stale tab pushed its copy to the cloud ' + JSON.stringify(out.cloud));
    if (!(out.cloud.owner >= 1)) f.push('4 the owner tab still pushes ' + JSON.stringify(out.cloud));
    await ctx.close(); }
  // 5 the idle hub doesn't save on redraws
  if (RUN(5)) { const ctx = await b.newContext(); const A = await open(ctx, () => { const k = () => (window.TOPS_SAVE_NS || {}).key; const si = Storage.prototype.setItem; window.__w = 0; Storage.prototype.setItem = function (a, v) { if (a === k()) window.__w++; return si.apply(this, arguments); }; });
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); showHub('play'); }); await A.waitForTimeout(1500);
    const w0 = await A.evaluate(() => { window.__pendAv = setInterval(() => { window.__avPending = 1; }, 500); return window.__w; });   // keep the portrait refresh (tops-avatars) firing, as while models load
    await A.waitForTimeout(30000); const w1 = await A.evaluate(() => window.__w); out.hubWrites = w1 - w0;
    if (out.hubWrites > 1) f.push('5 the idle hub saved ' + out.hubWrites + ' times in 30 s');
    await ctx.close(); }
  // 7 mid-match: a second tab opened while the owner is mid-match shows the card itself and doesn't take over; "Play here anyway" does
  if (RUN(7)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); });
    await A.waitForFunction(() => typeof S !== 'undefined' && S && !S.done, null, { timeout: 60000 }); await A.waitForTimeout(1500); const sv0 = (await stored(A)).sv;
    const B = await open(ctx); await B.waitForTimeout(1500);
    out.mid = { bCard: await card(B), aCard: await card(A), aLive: await A.evaluate(() => typeof S !== 'undefined' && !!S && !S.done && !TOPS_TABS.away()), sv: (await stored(A)).sv, sv0 };
    if (!out.mid.bCard || !/match is in progress/i.test(out.mid.bCard) || !/Play here anyway/i.test(out.mid.bCard)) f.push('7 the new tab shows "a match is in progress" with Play here anyway ' + JSON.stringify(out.mid));
    if (out.mid.aCard || !out.mid.aLive) f.push('7 the owner keeps playing its match ' + JSON.stringify(out.mid));
    out.mid.aSv = await A.evaluate(() => save.sv); if (out.mid.sv !== out.mid.aSv) f.push('7 the waiting tab must not write the save (only the owner\'s flush) ' + JSON.stringify(out.mid));
    await B.setViewportSize({ width: 390, height: 844 }); await B.waitForTimeout(300); await B.screenshot({ path: path.join(dir, 'wip/car-tabs/tabs-busy-390.png') }).catch(() => {});
    await B.evaluate(() => { const bt = document.querySelector('#tabsCard button'); if (bt) bt.click(); }); await B.waitForTimeout(1500);
    out.anyway = { aCard: await card(A), bOwner: await B.evaluate(() => !TOPS_TABS.away() && !TOPS_TABS.pending() && !document.getElementById('tabsCard')) };
    if (!out.anyway.aCard || !out.anyway.bOwner) f.push('7 Play here anyway takes over and the other tab steps aside ' + JSON.stringify(out.anyway));
    await ctx.close(); }
  // 8 the owner flushes on hello: a change it hadn't written yet is in the save the new tab loads
  if (RUN(8)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); }); await A.waitForTimeout(1500);
    await A.evaluate(() => { career().bank = 4242; });   // in memory only
    const B = await open(ctx); await B.waitForTimeout(1000); out.flush = await B.evaluate(() => ({ bank: career() && career().bank, own: !TOPS_TABS.away() && !TOPS_TABS.pending() }));
    if (out.flush.bank !== 4242 || !out.flush.own) f.push('8 the new tab loads what the owner flushed and takes over ' + JSON.stringify(out.flush));
    await ctx.close(); }
  // 6 cloud, two devices
  if (RUN(6)) { let cloud = null; const rpcs = []; const mk = async () => { const ctx = await b.newContext();
      await ctx.exposeBinding('__cloudGet', () => cloud ? JSON.parse(JSON.stringify(cloud)) : null);
      await ctx.exposeBinding('__cloudPut', (src, d) => { rpcs.push(d.sv); if (cloud && (d.sv || 0) <= (cloud.sv || 0)) return { ok: false, err: 'older', sv: cloud.sv, data: cloud }; cloud = d; return { ok: true }; }); return ctx; };
    const net = () => { NET.user = { id: 'u1' }; NET.sb = { rpc: async (n, a) => ({ data: await __cloudPut(JSON.parse(JSON.stringify(a.p_data))) }), from: () => ({ upsert: async () => ({}), select: () => ({ eq: () => ({ maybeSingle: async () => { const c = await __cloudGet(); return { data: c ? { data: c } : null }; } }) }) }) }; };
    const X = await open(await mk()); await X.evaluate(n => { eval(n)(); save.authSeen = true; $('login').hidden = true; newCareer(); career().bank = 100; persist(); cloudPush(true); }, '(' + net + ')'); await X.waitForTimeout(800);
    const Y = await open(await mk()); await Y.evaluate(async n => { eval(n)(); save.authSeen = true; await TOPS_SAVEV.pull(); }, '(' + net + ')'); await Y.waitForTimeout(800);
    out.y0 = await Y.evaluate(() => ({ bank: career() && career().bank, sv: save.sv }));
    await Y.evaluate(() => { for (let i = 1; i <= 3; i++) { career().bank = 200 + i; persist(); } cloudPush(true); }); await Y.waitForTimeout(800);
    await X.evaluate(() => { for (let i = 1; i <= 12; i++) { career().bank = 100 + i; persist(); } cloudPush(true); }); await X.waitForTimeout(1500);
    out.xsv = await X.evaluate(() => save.sv);
    out.cloud2 = { bank: cloud && cloud.career && cloud.career.bank, sv: cloud && cloud.sv, x: await X.evaluate(() => ({ bank: career().bank, sv: save.sv })), y0: out.y0 };
    if (out.y0.bank !== 100) f.push('6 setup: device Y should load X\'s save from the cloud ' + JSON.stringify(out.y0));
    // DQ P1: loading the other device's save must not put up the other-tab card on this lone device; it keeps saving; its own copy is kept
    out.x6 = await X.evaluate(() => { const card = !!document.getElementById('tabsCard'); const away = TOPS_TABS.away(); career().bank = 303; persist(); const st = JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key));
      return { card, away, saved: st.career.bank, rescue: TOPS_TABS.rescues().map(r => r.why + ':' + (r.save && r.save.career && r.save.career.bank)) }; });
    if (out.x6.card || out.x6.away || out.x6.saved !== 303) f.push('6 a lone device that loads a newer cloud save must not show the other-tab card, and keeps saving ' + JSON.stringify(out.x6));
    if (!out.x6.rescue.includes('cloud:112')) f.push('6 the device keeps a recovery copy of the save it replaced ' + JSON.stringify(out.x6));
    if (out.cloud2.bank !== 203) f.push('6 stale device X overwrote device Y\'s newer cloud save ' + JSON.stringify(out.cloud2));
    if (out.cloud2.x.bank !== 203) f.push('6 device X should load Y\'s newer save instead ' + JSON.stringify(out.cloud2)); }
  // 9 p_base: sent only when the server takes it (DQ's tops_save3_put proposal); today's server (no p_base) works unchanged
  if (RUN(9)) for (const supports of [false, true]) { const ctx = await b.newContext(); const A = await open(ctx, () => { window.__calls = []; });
    out['pb' + supports] = await A.evaluate(async sup => { NET.user = { id: 'u1' }; NET.sb = { rpc: async (n, a) => { if (n !== TOPS_SAVE_NS.rpc) return { data: null }; __calls.push(Object.keys(a).sort().join(',') + (a.p_base != null ? '=' + a.p_base : ''));
        if (a.p_base != null && !sup) return { error: { code: 'PGRST202', message: 'Could not find the function public.tops_save3_put(p_base, p_data)' } }; return { data: { ok: true } }; },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }) };
      save.authSeen = true; $('login').hidden = true; newCareer(); persist(); cloudPush(true); await new Promise(r => setTimeout(r, 300)); const s1 = TOPS_TABS.synced();
      career().bank = 7; persist(); cloudPush(true); await new Promise(r => setTimeout(r, 300)); career().bank = 8; persist(); cloudPush(true); await new Promise(r => setTimeout(r, 300));
      return { calls: __calls, s1, flag: localStorage.getItem('tops_pbase') }; }, supports);
    await ctx.close(); }
  if (RUN(9)) { const n = out.pbfalse, y = out.pbtrue;
    if (n.calls[0] !== 'p_data' || !n.calls.includes('p_base,p_data=' + n.s1) || n.calls[n.calls.length - 1] !== 'p_data' || !/"ok":0/.test(n.flag || '')) f.push('9 without server support: plain push, one probe, then plain again ' + JSON.stringify(n));
    if (!y.calls.slice(1).every(c => /^p_base,p_data=\d+$/.test(c)) || !/"ok":1/.test(y.flag || '')) f.push('9 with server support every push after the first sync sends p_base ' + JSON.stringify(y)); }
  // 10 the handshake race (DQ 10:52): an owner that hears the hello late (1.7 s, past the new tab's 1.5 s wait, as a busy or just-woken tab
  //    does) ignores it (no flush, no ack); the new tab takes over and the owner steps aside on the claim: exactly one tab plays, never both
  //    behind the card. 10b: the same slow owner mid-match: its heartbeat already says "busy", so the new tab shows "a match is in progress"
  //    at once and the owner keeps playing; when that match ends the card turns into the ordinary "Play here"
  if (RUN(10)) for (const mid of [false, true]) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(m => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); if (m) { const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); } else try { showHub('play'); } catch (e) {} window.TOPS_TABS_QA = { delay: 1700 }; }, mid);
    if (mid) await A.waitForFunction(() => typeof S !== 'undefined' && S && !S.done, null, { timeout: 60000 }); await A.waitForTimeout(1500); const sv0 = (await stored(A)).sv;
    const B = await open(ctx); await B.waitForTimeout(3500);
    const st = async P => P.evaluate(() => ({ card: (document.getElementById('tabsCard') || {}).dataset ? document.getElementById('tabsCard').dataset.mode || 'other' : null, away: TOPS_TABS.away(), pending: TOPS_TABS.pending(), live: typeof S !== 'undefined' && !!S && !S.done && !S.paused }));
    const r = { mid, a: await st(A), b: await st(B), sv0, sv: (await stored(B)).sv }; if (process.env.TABSLOG) r.log = { a: await A.evaluate(() => TOPS_TABS.log()), b: await B.evaluate(() => TOPS_TABS.log()) };
    const plays = [r.a, r.b].filter(x => !x.card && !x.away && !x.pending).length;
    if (plays !== 1) f.push('10 exactly one tab plays after the handshake (' + (mid ? 'mid-match' : 'hub') + ') ' + JSON.stringify(r));
    if (!mid && (r.b.card || r.a.card !== 'other')) f.push('10 a late owner on the hub: the new tab takes over, the old one steps aside ' + JSON.stringify(r));
    if (mid) { if (r.b.card !== 'busy' || r.a.card || !r.a.live) f.push('10b a slow owner mid-match keeps its match, the new tab shows the busy card at once ' + JSON.stringify(r));
      await A.evaluate(() => { S.done = true; }); await B.waitForTimeout(2000); r.after = await st(B);
      if (r.after.card !== 'other') f.push('10b the match there ended: the card offers Play here ' + JSON.stringify(r.after)); }
    out['race' + (mid ? 'Mid' : 'Hub')] = r; await ctx.close(); }
  // 11 the 2 s adopt: an owner that still flushes a late hello (as the old build did, or a write already under way when the claim lands)
  //    writes a newer save just after the new tab took over; the new tab loads it instead of stepping aside, and the change is kept
  if (RUN(11)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); try { showHub('play'); } catch (e) {} window.TOPS_TABS_QA = { delay: 1700, late: 1 }; }); await A.waitForTimeout(1500);
    await A.evaluate(() => { career().bank = 4343; });   // a change the owner hasn't written yet: its late flush writes it
    const B = await open(ctx); await B.waitForTimeout(4000);
    out.grace = await B.evaluate(() => ({ card: !!document.getElementById('tabsCard'), away: TOPS_TABS.away(), bank: career().bank, stored: JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key)).career.bank }));
    out.grace.aCard = !!(await card(A));
    if (out.grace.card || out.grace.away || out.grace.bank !== 4343 || out.grace.stored !== 4343 || !out.grace.aCard) f.push('11 the new tab adopts the late flush instead of stepping aside ' + JSON.stringify(out.grace));
    await ctx.close(); }
  // 12 recovery copies when another build's tab writes the save (no counter bump past ours, so no "newer"): an owner writing over a save it
  //    didn't write keeps the stored one first; an owner stepping aside for a different newer save keeps its own even with nothing unsaved
  if (RUN(12)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); career().bank = 50; persist(); }); await A.waitForTimeout(800);
    const O = await ctx.newPage(); await O.goto(url.replace('index.html?s3=1', 'no-such-page.html'));   // same origin, no game: an older build's tab writing directly
    const key = await A.evaluate(() => TOPS_SAVE_NS.key);
    await O.evaluate(([k, sv]) => { const s = JSON.parse(localStorage.getItem(k)); s.sv = sv; s.career.bank = 999; localStorage.setItem(k, JSON.stringify(s)); }, [key, await A.evaluate(() => save.sv)]); await A.waitForTimeout(1500);
    out.r12a = await A.evaluate(() => { career().bank = 51; persist(); return { r: TOPS_TABS.rescues().map(r => r.why + ':' + (r.save && r.save.career && r.save.career.bank)), stored: JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key)).career.bank, away: TOPS_TABS.away() }; });
    await O.evaluate(([k, sv]) => { const s = JSON.parse(localStorage.getItem(k)); s.sv = sv; s.career.bank = 777; localStorage.setItem(k, JSON.stringify(s)); }, [key, (await A.evaluate(() => save.sv)) + 5]); await A.waitForTimeout(1500);
    out.r12b = await A.evaluate(() => ({ r: TOPS_TABS.rescues().map(r => r.why + ':' + (r.save && r.save.career && r.save.career.bank)), away: TOPS_TABS.away() }));
    if (!out.r12a.r.includes('overwrite:999') || out.r12a.stored !== 51 || out.r12a.away) f.push('12 an owner writing over another build\'s save keeps a copy of it first ' + JSON.stringify(out.r12a));
    if (!out.r12b.away || !out.r12b.r.some(x => /^(newer|overwritten):51$/.test(x))) f.push('12 stepping aside for a different newer save keeps this tab\'s copy ' + JSON.stringify(out.r12b));
    await ctx.close(); }
  await b.close(); srv.close();
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
  if (process.env.CASES) { console.log('PASS cases ' + process.env.CASES + ' ' + JSON.stringify(out).slice(0, 900)); return; }
  console.log(`PASS: two tabs: B's won Pub night (week ${out.after.week}, $${out.after.bank}) survives tab A's poster tap; A shows "${(out.aCard || '').slice(0, 80)}"; Play here reloads A with the latest save and B steps aside; a newer save behind a tab's back is never overwritten (that tab shows the card); a tab with no career can't wipe another tab's career; a stale tab never pushes to the cloud (RPC calls ${out.cloud.stale}), the owner does (${out.cloud.owner}); an idle hub saved ${out.hubWrites} time(s) in 30 s; mid-match, the new tab shows "a match is in progress" and leaves the owner playing until Play here anyway; the owner flushes on hello (the new tab loads $${out.flush.bank}); two devices on a mocked cloud: stale device X (12 saves after Y's 3, so its counter is higher) loads Y's newer save ($${out.cloud2.bank}) instead of overwriting it, without the other-tab card, and keeps a recovery copy of what it replaced; p_base goes to the server only once it takes it (today: one probe, then plain pushes)`);
})();
