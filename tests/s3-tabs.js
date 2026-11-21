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
// usage: node tests/s3-tabs.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
require('fs').mkdirSync(path.join(dir, 'wip/car-tabs'), { recursive: true }); const url = 'file://' + path.join(dir, 'index.html') + '?s3=1'; const f = []; const out = {};
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] });
  const open = async (ctx, init) => { const p = await ctx.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p._pe = pe;
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} }); if (init) await p.addInitScript(init);
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto(url); await p.waitForFunction(() => window.TOPS_S3 && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1500); return p; };
  const card = p => p.evaluate(() => { const d = document.getElementById('tabsCard'); return d && !d.hidden && d.getClientRects().length ? d.innerText.replace(/\s+/g, ' ') : null; }).catch(() => null);
  const stored = p => p.evaluate(() => { const s = JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key) || '{}'); const c = s.career, k = c && c.circuit; return { sv: s.sv || 0, has: !!c, week: k ? k.week : null, bank: c ? c.bank : null, mark: s.__mark || null }; });
  // 1 Q&D's repro
  { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); try { showHub('play'); } catch (e) {} });
    const B = await open(ctx); await B.waitForFunction(() => typeof career === 'function' && career() && career().circuit, null, { timeout: 60000 }); await B.waitForTimeout(800);
    out.b0 = await B.evaluate(() => ({ week: career().circuit.week, bank: career().bank }));
    await B.evaluate(() => { const c = career(); c.circuit.week = 2; c.bank = 90; c.circuit.history.push({ week: 1, id: 'pub_night', n: 'Kauri Arms League Night', level: 0, fin: 'W', prize: 35, pts: 50 }); persist(); });
    await A.waitForTimeout(3000); out.aCard = await card(A);
    const tap = await A.evaluate(() => { try { const e = TOPS_S3.view().calendar[0]; const r = TOPS_S3.book(e.id); persist(); return { ok: !!(r && r.ok) }; } catch (e) { return { err: String(e) }; } });
    await A.waitForTimeout(800); const C = await open(ctx); out.after = await stored(C); out.cCard = await card(C); out.tap = tap;
    if (out.after.week !== 2 || out.after.bank !== 90) f.push('1 tab A overwrote tab B\'s won Pub night ' + JSON.stringify(out.after));
    if (!out.aCard || !/TOPS is open in another tab/i.test(out.aCard) || !/Play here/i.test(out.aCard)) f.push('1 tab A shows the other-tab card ' + JSON.stringify(out.aCard));
    // Play here on A: reloads with the latest save and takes ownership; B and C step aside
    await A.screenshot({ path: path.join(dir, 'wip/car-tabs/tabs-card-390.png') }).catch(() => {}); await A.setViewportSize({ width: 360, height: 640 }); await A.screenshot({ path: path.join(dir, 'wip/car-tabs/tabs-card-360.png') }).catch(() => {});
    await C.close(); await A.evaluate(() => { const bt = document.querySelector('#tabsCard button'); if (bt) setTimeout(() => bt.click(), 50); }).catch(() => {});
    await A.waitForFunction(() => window.TOPS_S3 && window.C3 && !document.getElementById('tabsCard'), null, { timeout: 180000 }).catch(() => {}); await A.waitForTimeout(2500);
    out.playHere = await A.evaluate(() => ({ week: career().circuit.week, bank: career().bank, card: !!document.getElementById('tabsCard') })); out.bCard = await card(B);
    if (out.playHere.week !== 2 || out.playHere.bank !== 90 || out.playHere.card) f.push('1 Play here loads the latest save and plays ' + JSON.stringify(out.playHere));
    if (!out.bCard) f.push('1 after Play here on A, tab B shows the card');
    out.errs1 = [...A._pe, ...B._pe].slice(0, 2); await ctx.close(); }
  // 2 the write guard alone: a newer save lands behind A's back (no claim message)
  { const ctx = await b.newContext(); const A = await open(ctx);
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); });
    await A.evaluate(() => { const s = JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key)); s.sv = (s.sv || 0) + 5; s.__mark = 'newer'; s.career.bank = 777; localStorage.setItem(TOPS_SAVE_NS.key, JSON.stringify(s)); career().bank = 1; persist(); });
    await A.waitForTimeout(500); out.guard = await stored(A); out.guardCard = await card(A);
    if (out.guard.mark !== 'newer' || out.guard.bank !== 777) f.push('2 a tab overwrote a newer save it never read ' + JSON.stringify(out.guard));
    if (!out.guardCard) f.push('2 the stale tab shows the card instead of saving');
    await ctx.close(); }
  // 3 no-career wipe
  { const ctx = await b.newContext(); const A = await open(ctx); out.a3 = await A.evaluate(() => !!(save.career));
    const B = await open(ctx); await B.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); career().bank = 4321; persist(); });
    await A.evaluate(() => { try { save.vol = (save.vol || 0) + 1; persist(); } catch (e) {} }); await A.waitForTimeout(500);
    out.wipe = await stored(B); if (!out.wipe.has || out.wipe.bank !== 4321) f.push('3 a stale tab with no career wiped the other tab\'s career ' + JSON.stringify(out.wipe));
    await ctx.close(); }
  // 4 cloud: the stale tab never pushes, the owner does
  { const ctx = await b.newContext(); const stub = () => { window.__rpc = 0; window.__stubNet = () => { NET.user = { id: 'u1' }; NET.sb = { rpc: async () => { window.__rpc++; return { data: { ok: true } }; }, from: () => ({ upsert: async () => { window.__rpc++; return {}; }, select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }) }; }; };
    const A = await open(ctx, stub); await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); });
    const B = await open(ctx, stub); await B.waitForFunction(() => typeof career === 'function' && career(), null, { timeout: 60000 }); await B.evaluate(() => { career().bank = 555; persist(); });
    await A.evaluate(() => { __stubNet(); career().bank = 2; cloudPush(true); persist(); }); await B.evaluate(() => { __stubNet(); career().bank = 556; cloudPush(true); });
    await A.waitForTimeout(800); out.cloud = { stale: await A.evaluate(() => window.__rpc), owner: await B.evaluate(() => window.__rpc) };
    if (out.cloud.stale !== 0) f.push('4 the stale tab pushed its copy to the cloud ' + JSON.stringify(out.cloud));
    if (!(out.cloud.owner >= 1)) f.push('4 the owner tab still pushes ' + JSON.stringify(out.cloud));
    await ctx.close(); }
  // 5 the idle hub doesn't save on redraws
  { const ctx = await b.newContext(); const A = await open(ctx, () => { const k = () => (window.TOPS_SAVE_NS || {}).key; const si = Storage.prototype.setItem; window.__w = 0; Storage.prototype.setItem = function (a, v) { if (a === k()) window.__w++; return si.apply(this, arguments); }; });
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); persist(); showHub('play'); }); await A.waitForTimeout(1500);
    const w0 = await A.evaluate(() => { window.__pendAv = setInterval(() => { window.__avPending = 1; }, 500); return window.__w; });   // keep the portrait refresh (tops-avatars) firing, as while models load
    await A.waitForTimeout(30000); const w1 = await A.evaluate(() => window.__w); out.hubWrites = w1 - w0;
    if (out.hubWrites > 1) f.push('5 the idle hub saved ' + out.hubWrites + ' times in 30 s');
    await ctx.close(); }
  await b.close();
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out)); process.exit(1); }
  console.log(`PASS: two tabs: B's won Pub night (week ${out.after.week}, $${out.after.bank}) survives tab A's poster tap; A shows "${(out.aCard || '').slice(0, 80)}"; Play here reloads A with the latest save and B steps aside; a newer save behind a tab's back is never overwritten (that tab shows the card); a tab with no career can't wipe another tab's career; a stale tab never pushes to the cloud (RPC calls ${out.cloud.stale}), the owner does (${out.cloud.owner}); an idle hub saved ${out.hubWrites} time(s) in 30 s`);
})();
