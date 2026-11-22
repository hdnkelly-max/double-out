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
//   19 R6: an older cloud copy at sign-in never replaces this tab's newer save (DQ A5/A3)
//   13 busy is written where a match starts: a new tab opened while the owner is blocked still sees it (DQ 12:41)
//   TABS_NOLOCKS=1 runs every case on the fallback (no Web Locks)
//   14-18 R5 (ChatGPT review): simultaneous, crossed and late claims; a match started after B read the key, and claims refused mid-match;
//   a push suspended in preflight while another tab takes over, the acknowledged snapshot, a failed preflight; the back-forward cache; a refused write
// usage: node tests/s3-tabs.js [dir]   (cases 1-6; CASES=all for every case, CASES=7,10 for just those; pass an absolute dir)
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
require('fs').mkdirSync(path.join(dir, 'wip/car-tabs'), { recursive: true });
// served over http, like the real site: file:// pages in separate processes don't reliably share one localStorage (a second tab sometimes
// saw an empty store), which is a test-harness effect, not the game's
const http = require('http'), fs = require('fs'); const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const fp = path.join(dir, u === '/' ? 'index.html' : u); if (!fp.startsWith(dir)) { r.writeHead(403); return r.end(); }
  fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(fp)] || 'application/octet-stream' }); r.end(d); }); });
/* 18 cases take longer than one CI test may (600 s), so CI runs them in three files: this one (1-6), s3-tabs-2.js (7-12) and s3-tabs-3.js
   (13-18), which set CASES and load this file. CASES=all runs every case; CASES=7,10 runs just those. */
const CASES = process.env.CASES || '1,2,3,4,5,6';
const RUN = n => CASES === 'all' || CASES.split(',').includes(String(n));
let url = ''; const f = []; const out = {};
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); url = 'http://127.0.0.1:' + srv.address().port + '/index.html?s3=1';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const open = async (ctx, init) => { const p = await ctx.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p._pe = pe;
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} }); if (init) await p.addInitScript(init);
    if (process.env.TABS_NOLOCKS) await p.addInitScript(() => { window.TOPS_NOLOCKS = 1; });   /* the fallback (no Web Locks) */
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
    await B.evaluate(() => { const bt = document.querySelector('#tabsCard button'); if (bt) bt.click(); });
    for (let k = 0; k < 16; k++) { await B.waitForTimeout(500); if (await card(A)) break; }   // the old tab learns from its lock (crosses processes)
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
  // 10 the handshake race (DQ 10:52): an owner that hears the hello late (4.5 s, past the new tab's wait: 4 s with a live heartbeat, as a busy
  //    or just-woken tab does) ignores it (no flush, no ack); the new tab takes over and the owner steps aside on the claim: exactly one tab plays, never both
  //    behind the card. 10b: the same slow owner mid-match: its heartbeat already says "busy", so the new tab shows "a match is in progress"
  //    at once and the owner keeps playing; when that match ends the card turns into the ordinary "Play here"
  if (RUN(10)) for (const mid of [false, true]) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(m => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); if (m) { const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); } else try { showHub('play'); } catch (e) {} window.TOPS_TABS_QA = { delay: m ? 1700 : 4500 }; }, mid);
    if (mid) await A.waitForFunction(() => typeof S !== 'undefined' && S && !S.done, null, { timeout: 60000 }); await A.waitForTimeout(1500); const sv0 = (await stored(A)).sv;
    const B = await open(ctx); await B.waitForTimeout(mid ? 3500 : 8000);
    const st = async P => P.evaluate(() => ({ card: (document.getElementById('tabsCard') || {}).dataset ? document.getElementById('tabsCard').dataset.mode || 'other' : null, away: TOPS_TABS.away(), pending: TOPS_TABS.pending(), live: typeof S !== 'undefined' && !!S && !S.done && !S.paused }));
    const r = { mid, a: await st(A), b: await st(B), sv0, sv: (await stored(B)).sv }; if (process.env.TABSLOG) r.log = { a: await A.evaluate(() => TOPS_TABS.log()), b: await B.evaluate(() => TOPS_TABS.log()) };
    const plays = [r.a, r.b].filter(x => !x.card && !x.away && !x.pending).length;
    if (plays !== 1) f.push('10 exactly one tab plays after the handshake (' + (mid ? 'mid-match' : 'hub') + ') ' + JSON.stringify(r));
    if (!mid && (r.b.card || r.a.card !== 'other')) f.push('10 a late owner on the hub: the new tab takes over, the old one steps aside ' + JSON.stringify(r));
    if (mid) { if (r.b.card !== 'busy' || r.a.card || !r.a.live) f.push('10b a slow owner mid-match keeps its match, the new tab shows the busy card at once ' + JSON.stringify(r));
      await A.evaluate(() => { S.done = true; }); await B.waitForTimeout(2000); r.after = await st(B);
      if (r.after.card !== 'other') f.push('10b the match there ended: the card offers Play here ' + JSON.stringify(r.after)); }
    out['race' + (mid ? 'Mid' : 'Hub')] = r; await ctx.close(); }
  // 13 DQ 12:41: the owner starts a match and is at once too busy to run timers (main thread blocked 3 s, messages late); a tab opened right
  //    then still sees busy, because busy is written where the match starts, not by a poll: the busy card, and the owner keeps its match
  if (RUN(13)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); window.TOPS_TABS_QA = { delay: 1700 }; const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow();
      setTimeout(() => { const t = Date.now(); while (Date.now() - t < 3000); }, 0); });
    const own = await A.evaluate(() => JSON.parse(localStorage.getItem('tops_owner_' + TOPS_SAVE_NS.key) || 'null')).catch(e => String(e));
    const B = await open(ctx); await B.waitForTimeout(3000);
    const st = async P => P.evaluate(() => ({ card: document.getElementById('tabsCard') ? document.getElementById('tabsCard').dataset.mode || 'other' : null, away: TOPS_TABS.away(), live: typeof S !== 'undefined' && !!S && !S.done && !S.paused }));
    out.r13 = { own, a: await st(A), b: await st(B) };
    if (!out.r13.own || out.r13.own.busy !== 1) f.push('13 busy is in the owner key the moment the match starts (read before the owner runs any timer) ' + JSON.stringify(out.r13.own));
    if (out.r13.b.card !== 'busy' || out.r13.a.card || !out.r13.a.live) f.push('13 a blocked owner that just started a match keeps it; the new tab shows the busy card ' + JSON.stringify(out.r13));
    await ctx.close(); }
  // 11 the 2 s adopt: an owner that still flushes a late hello (as the old build did, or a write already under way when the claim lands)
  //    writes a newer save just after the new tab took over; the new tab loads it instead of stepping aside, and the change is kept
  if (RUN(11)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); try { showHub('play'); } catch (e) {} window.TOPS_TABS_QA = { delay: 4500, late: 1 }; }); await A.waitForTimeout(1500);
    await A.evaluate(() => { career().bank = 4343; });   // a change the owner hasn't written yet: its late flush writes it
    const B = await open(ctx); await B.waitForTimeout(8000);
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
  // ---- R5 (ChatGPT review): the races outside the paths above ----
  const own = P => P.evaluate(() => !window.TOPS_TABS ? { loading: 1 } : ({ owner: TOPS_TABS.owner(), away: TOPS_TABS.away(), pending: TOPS_TABS.pending(), gen: TOPS_TABS.gen(), card: document.getElementById('tabsCard') ? document.getElementById('tabsCard').dataset.mode || 'other' : null, live: typeof S !== 'undefined' && !!S && !S.done && !S.paused, key: JSON.parse(localStorage.getItem('tops_owner_' + TOPS_SAVE_NS.key) || 'null') }));
  const settle = async (ps, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const r = await Promise.all(ps.map(own)); if (r.filter(x => x.owner).length === 1 && r.filter(x => !x.owner).every(x => x.away || x.card)) return r; await ps[0].waitForTimeout(300); } return Promise.all(ps.map(own)); };
  // 14 P1-1: (a) two tabs starting together with no owner; (b) crossed claims from both, messages delayed 1 s; (c) a claim delivered late
  //    (an old gen) after the owner moved on. Always exactly one owner, and the late claim changes nothing
  if (RUN(14)) { const ctx = await b.newContext(); const [A, B] = await Promise.all([open(ctx), open(ctx)]);
    out.r14a = await settle([A, B], 8000); if (process.env.TABSLOG2) fs.writeFileSync(process.env.TABSLOG2, JSON.stringify({ a: await A.evaluate(() => [TOPS_TABS.tab, TOPS_TABS.log()]), b: await B.evaluate(() => [TOPS_TABS.tab, TOPS_TABS.log()]) }, null, 1)); if (out.r14a.filter(x => x.owner).length !== 1) f.push('14a two tabs starting together: exactly one owner ' + JSON.stringify(out.r14a) + ' LOGS ' + JSON.stringify({ a: await A.evaluate(() => TOPS_TABS.log()), b: await B.evaluate(() => TOPS_TABS.log()) }));
    await Promise.all([A, B].map(P => P.evaluate(() => { window.TOPS_TABS_QA = { delay: 1000 }; })));
    await Promise.all([A.evaluate(() => TOPS_TABS._claim()), B.evaluate(() => TOPS_TABS._claim())]);
    out.r14b = await settle([A, B], 10000); if (out.r14b.filter(x => x.owner).length !== 1) out.r14blog = { a: await A.evaluate(() => TOPS_TABS.log().slice(-12)), b: await B.evaluate(() => TOPS_TABS.log().slice(-12)) }; if (process.env.TABSLOG) fs.writeFileSync(process.env.TABSLOG, JSON.stringify({ a: await A.evaluate(() => [TOPS_TABS.tab, TOPS_TABS.log()]), b: await B.evaluate(() => [TOPS_TABS.tab, TOPS_TABS.log()]) }, null, 1)); if (out.r14b.filter(x => x.owner).length !== 1) f.push('14b crossed claims (messages 1 s late): exactly one owner ' + JSON.stringify(out.r14b));
    await Promise.all([A, B].map(P => P.evaluate(() => { window.TOPS_TABS_QA = null; })));
    const W = out.r14b[0].owner ? A : B, L = W === A ? B : A; const g = (await own(W)).gen;
    const O = await ctx.newPage(); await O.goto(url.replace('index.html?s3=1', 'no-such-page.html'));   // a late claim from an older gen, on the channel and in the key
    await O.evaluate(([k, g]) => { const c = { t: 'claim', gen: g - 1, tab: 'zzzz-late', at: Date.now() }; new BroadcastChannel('tops-tabs-' + k).postMessage(c); localStorage.setItem('tops_owner_' + k, JSON.stringify(c)); }, [await W.evaluate(() => TOPS_SAVE_NS.key), g]);
    await W.waitForTimeout(2000); out.r14c = await own(W);
    if (!out.r14c.owner || out.r14c.away || !out.r14c.key || out.r14c.key.tab === 'zzzz-late') f.push('14c a late claim from an older gen leaves the owner in place (and it re-asserts in the key) ' + JSON.stringify(out.r14c));
    // 14d the key isn't a lock: the old owner's heartbeat can land on top of a newer claim before it hears it (CI run 44992335158). The newer
    //     owner sees that lower heartbeat and says its claim again at once (not at its next heartbeat)
    const ow = W, lo = L; const gW = (await own(ow)).gen; const loTab = await lo.evaluate(() => TOPS_TABS.tab);
    await ow.evaluate(([t, g]) => { localStorage.setItem('tops_owner_' + TOPS_SAVE_NS.key, JSON.stringify({ tab: t, gen: g - 1, at: Date.now(), hb: 1, busy: 0 })); }, [loTab, gW]);   // written in the owner's own page: no event there
    await lo.evaluate(([t, g]) => { localStorage.setItem('tops_owner_' + TOPS_SAVE_NS.key, JSON.stringify({ tab: t, gen: g - 1, at: Date.now(), hb: 1, busy: 0 })); }, [loTab, gW]);   // and from the other page, so the owner gets the event
    await ow.waitForTimeout(1200); out.r14d = await own(ow);
    if (!out.r14d.owner || !out.r14d.key || out.r14d.key.tab === loTab) f.push('14d an older heartbeat over the claim: the owner re-asserts within a second ' + JSON.stringify(out.r14d));
    await ctx.close(); }
  // 15 P1-2: (a) B reads the owner key (busy 0), then A starts a match and is blocked past B's 4 s wait: B re-reads before taking over and
  //    shows the busy card (or, if B's re-read came first, A refuses B's claim and B shows it then); A keeps its match. (b) an ordinary claim reaching an owner mid-match is refused (B: busy card); Play here anyway wins
  if (RUN(15)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); try { showHub('play'); } catch (e) {} const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id);
      window.TOPS_TABS_QA = { delay: 9000 };   // A hears nothing in time
      const iv = setInterval(() => { let m = null; try { m = JSON.parse(localStorage.getItem('tops_owner_' + TOPS_SAVE_NS.key + '_msg') || 'null'); } catch (x) {} if (m && m.t === 'hello') { clearInterval(iv); TOPS_S3._playNow(); setTimeout(() => { const t = Date.now(); while (Date.now() - t < 6000); }, 0); } }, 30); });
    await A.waitForTimeout(1200); const B = await open(ctx); await B.waitForTimeout(6000);
    out.r15a = { a: await own(A), b: await own(B), via: await B.evaluate(() => (TOPS_TABS.log().find(l => l[1] === 'tabs_busy') || [])[2] || null) };
    if (out.r15a.b.card !== 'busy' || out.r15a.b.owner || !out.r15a.a.owner || !out.r15a.a.live) f.push('15a a match started after B read the key: B shows the busy card, A keeps its match ' + JSON.stringify(out.r15a));
    await A.evaluate(() => { window.TOPS_TABS_QA = null; }); await B.evaluate(() => TOPS_TABS._claim());
    for (let k = 0; k < 20; k++) { await B.waitForTimeout(500); const [x, y] = [await own(A), await own(B)]; if (x.owner && y.card === 'busy') break; }   // settle: a lock handover crosses processes
    out.r15b = { a: await own(A), b: await own(B) };
    if (!out.r15b.a.owner || !out.r15b.a.live || out.r15b.b.owner || out.r15b.b.card !== 'busy') f.push('15b an ordinary claim mid-match is refused: A plays on, B shows the busy card ' + JSON.stringify(out.r15b) + ' LOGS ' + JSON.stringify({ a: await A.evaluate(() => TOPS_TABS.log().slice(-14)), b: await B.evaluate(() => TOPS_TABS.log().slice(-14)) }));
    await B.evaluate(() => { const bt = document.querySelector('#tabsCard button'); if (bt) bt.click(); });
    for (let k = 0; k < 20; k++) { await B.waitForTimeout(500); const [x, y] = [await own(A), await own(B)]; if (y.owner && x.card) break; }
    out.r15c = { a: await own(A), b: await own(B) };
    if (!out.r15c.b.owner || out.r15c.a.owner || out.r15c.a.live) f.push('15c Play here anyway still takes over ' + JSON.stringify(out.r15c) + ' LOGS ' + JSON.stringify({ a: await A.evaluate(() => TOPS_TABS.log().slice(-12)), b: await B.evaluate(() => TOPS_TABS.log().slice(-12)) }));
    await ctx.close(); }
  // 15d B's claim lands just before A's Play tap: A steps aside (the claim came first) and the match must not start behind the card
  if (RUN(15)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); try { showHub('play'); } catch (e) {} const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id);
      window.TOPS_TABS_QA = { delay: 9000 };
      const iv = setInterval(() => { let m = null; try { m = JSON.parse(localStorage.getItem('tops_owner_' + TOPS_SAVE_NS.key + '_msg') || 'null'); } catch (x) {} if (m && m.t === 'claim' && m.tab !== TOPS_TABS.tab) { clearInterval(iv); setTimeout(() => TOPS_S3._playNow(), 200); } }, 30); });
    await A.waitForTimeout(600); const B = await open(ctx); await B.waitForTimeout(7000);
    out.r15d = { a: await own(A), b: await own(B), blocked: await A.evaluate(() => TOPS_TABS.log().some(l => l[1] === 'tabs_match_blocked')) };
    if (!out.r15d.b.owner || out.r15d.a.owner || !out.r15d.a.card || out.r15d.a.live || !out.r15d.blocked) f.push('15d a Play tap just after a claim: no match starts behind the card ' + JSON.stringify(out.r15d));
    await ctx.close(); }
  // 15e CI's order: A is mid-match when a fresh, better claim reaches it by the owner key (the channel copy still on its way): A refuses it
  //    there too (one rule wherever a claim is found), so the claimant ends on the busy card and A keeps its match
  if (RUN(15)) { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); });
    await A.waitForFunction(() => typeof S !== 'undefined' && S && !S.done, null, { timeout: 60000 }); await A.waitForTimeout(800);
    // written by A's own page, so no storage event or message reaches A: it finds the claim on its next heartbeat (the non-message path)
    await A.evaluate(g => { localStorage.setItem('tops_owner_' + TOPS_SAVE_NS.key, JSON.stringify({ tab: 'zzzz-b', gen: g + 1, at: Date.now() })); }, (await own(A)).gen);
    await A.waitForTimeout(5000); out.r15e = { a: await own(A), refused: await A.evaluate(() => TOPS_TABS.log().some(l => l[1] === 'tabs_refuse')) };
    const lk = await A.evaluate(() => !window.TOPS_NOLOCKS && !!(navigator.locks && navigator.locks.request)); out.r15e.lk = lk;   /* with Web Locks a key alone moves nothing: no refusal needed, the owner just says so again in the key */
    if ((!lk && !out.r15e.refused) || !out.r15e.a.owner || !out.r15e.a.live || !out.r15e.a.key || out.r15e.a.key.tab === 'zzzz-b') f.push('15e a fresh claim found in the key mid-match is refused ' + JSON.stringify(out.r15e));
    await ctx.close(); }
  // 16 P1-3: A's push is suspended in its preflight cloud read while B takes over and writes; when the read returns, A sends nothing.
  //    Then B's own push: the save changes while its RPC is in flight; synced is the counter it sent, and a second push follows
  if (RUN(16)) { const ctx = await b.newContext(); const puts = [];
    await ctx.exposeBinding('__put', (src, d) => { puts.push({ from: d.tab, sv: d.sv }); return { ok: true }; });
    const net = () => { NET.user = { id: 'u1' }; window.__gate = null; window.__rpcGate = null; NET.sb = { rpc: async (n, a) => { if (n !== TOPS_SAVE_NS.rpc) return { data: null };
        if (window.__rpcGate) await new Promise(r => { window.__rpcGo = r; }); return { data: await __put({ tab: TOPS_TABS.tab, sv: a.p_data.sv }) }; },
      from: () => ({ upsert: async () => ({}), select: () => ({ eq: () => ({ maybeSingle: async () => { if (window.__gate) await new Promise(r => { window.__go = r; }); return { data: null }; } }) }) }) }; };
    const A = await open(ctx); await A.evaluate(n => { eval(n)(); save.authSeen = true; $('login').hidden = true; newCareer(); persist(); }, '(' + net + ')');
    await A.evaluate(() => { career().bank = 11; persist(); cloudPush(true); }); await A.waitForTimeout(800);   // first push: synced is set
    const p0 = puts.length; await A.evaluate(() => { window.__gate = 1; career().bank = 12; persist(); cloudPush(true); }); await A.waitForTimeout(500);   // suspended in the preflight read
    const B = await open(ctx); await B.evaluate(n => { eval(n)(); }, '(' + net + ')'); await B.waitForTimeout(1500);
    await B.evaluate(() => { if (!TOPS_TABS.owner()) TOPS_TABS._claim(true); }); await B.waitForTimeout(1500); await B.evaluate(() => { career().bank = 77; persist(); }); await B.waitForTimeout(800);
    await A.evaluate(() => { window.__go && window.__go(); }); await A.waitForTimeout(1500);
    out.r16a = { aPuts: puts.slice(p0).filter(x => x.from === puts[0].from).length, a: await own(A), b: await own(B) };
    if (out.r16a.aPuts !== 0 || out.r16a.a.owner) f.push('16a a push suspended in preflight sends nothing once another tab owns the save ' + JSON.stringify(out.r16a));
    out.r16b = await B.evaluate(async () => { career().bank = 80; persist(); const sent = save.sv; window.__rpcGate = 1; cloudPush(true); await new Promise(r => setTimeout(r, 400)); career().bank = 81; persist(); const later = save.sv; window.__rpcGate = null; window.__rpcGo && window.__rpcGo();
      await new Promise(r => setTimeout(r, 1500)); return { sent, later, synced: TOPS_TABS.synced() }; });
    const bPuts = puts.filter(x => x.from !== puts[0].from).map(x => x.sv); out.r16b.puts = bPuts;
    if (!bPuts.includes(out.r16b.sent) || !bPuts.includes(out.r16b.later) || out.r16b.synced !== out.r16b.later) f.push('16b synced follows the acknowledged snapshot, and the change made in flight is pushed next ' + JSON.stringify(out.r16b));
    out.r16c = await B.evaluate(async () => { const before = TOPS_TABS.synced(); NET.sb.from = () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: { message: 'network' } }) }) }) }); career().bank = 90; persist(); cloudPush(true); await new Promise(r => setTimeout(r, 600)); return { before, after: TOPS_TABS.synced(), failed: TOPS_TABS.log().some(l => l[1] === 'push_preflight_failed') }; });
    if (!out.r16c.failed || out.r16c.after !== out.r16c.before) f.push('16c a failed preflight read pushes nothing and retries ' + JSON.stringify(out.r16c));
    await ctx.close(); }
  // 17 back-forward cache: A is hidden (pagehide) and restored (pageshow persisted). If B took over meanwhile, A steps aside before writing;
  //    alone, A carries on as owner
  if (RUN(17)) { const ctx = await b.newContext(); const A = await open(ctx); await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); });
    await A.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); }); await A.waitForTimeout(500);
    out.r17a = await own(A); if (!out.r17a.owner) f.push('17a restored alone: still the owner ' + JSON.stringify(out.r17a));
    await A.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })); window.TOPS_TABS_QA = { delay: 60000 }; });   // frozen: hears nothing
    const B = await open(ctx); await B.waitForFunction(() => TOPS_TABS.owner(), null, { timeout: 15000 }).catch(() => {}); await B.evaluate(() => { career().bank = 5150; persist(); }); await B.waitForTimeout(800);
    await A.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); career().bank = 1; persist(); }); await A.waitForTimeout(800);
    out.r17b = { a: await own(A), b: await own(B), bank: (await stored(B)).bank };
    if (out.r17b.a.owner || !out.r17b.a.card || !out.r17b.b.owner || out.r17b.bank !== 5150) f.push('17b restored after another tab took over: steps aside without writing ' + JSON.stringify(out.r17b) + ' LOGS ' + JSON.stringify({ a: await A.evaluate(() => TOPS_TABS.log()), b: await B.evaluate(() => TOPS_TABS.log()) }));
    await ctx.close(); }
  // 18 a save the browser refuses (storage full): a banner says so, nothing is marked saved, and the next save after space frees up lands
  if (RUN(18)) { const ctx = await b.newContext(); const A = await open(ctx); await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); });
    out.r18 = await A.evaluate(async () => { window.TOPS_TABS_QA = { failWrite: 1 }; career().bank = 4444; try { persist(); } catch (e) {} const banner = !!document.getElementById('tabsSaveFail'); const kept = JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key)).career.bank;
      window.TOPS_TABS_QA = null; try { persist(); } catch (e) {} return { banner, kept, after: JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key)).career.bank, gone: !document.getElementById('tabsSaveFail'), logged: TOPS_TABS.log().some(l => l[1] === 'save_write_failed') }; });
    if (!out.r18.banner || out.r18.kept === 4444 || out.r18.after !== 4444 || !out.r18.gone || !out.r18.logged) f.push('18 a refused write shows the banner and retries on the next save ' + JSON.stringify(out.r18));
    await ctx.close(); }
  // 19 R6 (DQ A5/A3): the sign-in pull loads an OLDER cloud copy (asked before the boot's saves, answered after). This tab keeps its newer save
  //    (no card, nothing lost, counter never backwards); an older copy from another device is kept as a recovery copy; a newer one still loads
  if (RUN(19)) { const ctx = await b.newContext(); const A = await open(ctx);
    out.r19 = await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); const old = JSON.parse(JSON.stringify(save)); old.dev = 'other-dev';
      for (let i = 1; i <= 5; i++) { career().bank = 1000 + i; persist(); } const sv = save.sv;
      netAdopt(old); const r = { sv, after: save.sv, bank: career().bank, away: TOPS_TABS.away(), card: !!document.getElementById('tabsCard'), rescue: TOPS_TABS.rescues().map(x => x.why) };
      career().bank = 2000; persist(); r.saved = JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key)).career.bank;
      const newer = JSON.parse(JSON.stringify(save)); newer.sv = save.sv + 10; newer.dev = 'other-dev'; newer.career.bank = 3000; netAdopt(newer); r.newer = career().bank; r.awayN = TOPS_TABS.away(); return r; });
    const r = out.r19;
    if (r.bank !== 1005 || r.after < r.sv || r.away || r.card || !r.rescue.includes('cloud-older') || r.saved !== 2000 || r.newer !== 3000 || r.awayN) f.push('19 an older cloud copy at sign-in never replaces this tab\'s newer save; a newer one still loads ' + JSON.stringify(r));
    await ctx.close(); }
  await b.close(); srv.close();
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
  if (CASES !== 'all') { console.log('PASS cases ' + CASES + ' ' + JSON.stringify(out).slice(0, +(process.env.OUTLEN || 900))); return; }
  console.log(`PASS: two tabs: B's won Pub night (week ${out.after.week}, $${out.after.bank}) survives tab A's poster tap; A shows "${(out.aCard || '').slice(0, 80)}"; Play here reloads A with the latest save and B steps aside; a newer save behind a tab's back is never overwritten (that tab shows the card); a tab with no career can't wipe another tab's career; a stale tab never pushes to the cloud (RPC calls ${out.cloud.stale}), the owner does (${out.cloud.owner}); an idle hub saved ${out.hubWrites} time(s) in 30 s; mid-match, the new tab shows "a match is in progress" and leaves the owner playing until Play here anyway; the owner flushes on hello (the new tab loads $${out.flush.bank}); two devices on a mocked cloud: stale device X (12 saves after Y's 3, so its counter is higher) loads Y's newer save ($${out.cloud2.bank}) instead of overwriting it, without the other-tab card, and keeps a recovery copy of what it replaced; p_base goes to the server only once it takes it (today: one probe, then plain pushes)`);
})();
