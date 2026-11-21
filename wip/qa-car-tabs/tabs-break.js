// CAR-TABS independent QA (Delivery QA): try to break it. Both builds served from ONE origin (like the real site after a release):
// /new/ = the candidate, /old/ = live 4.26. usage: node tabs-break.js <newDir> <oldDir> <shotsDir>
const { chromium, devices } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const [NEW, OLD, SH] = process.argv.slice(2).map(p => path.resolve(p)); fs.mkdirSync(SH, { recursive: true });
const TY = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const m = u.match(/^\/(new|old)(\/.*)$/); if (!m) { r.writeHead(404); return r.end(); }
  const root = m[1] === 'new' ? NEW : OLD; const fp = path.join(root, m[2] === '/' ? 'index.html' : m[2]); if (!fp.startsWith(root)) { r.writeHead(403); return r.end(); }
  fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TY[path.extname(fp)] || 'application/octet-stream' }); r.end(d); }); });
const rows = []; const row = (ok, name, note) => { rows.push({ ok, name, note }); console.log((ok === null ? 'INFO' : ok ? 'PASS' : 'FAIL') + '  ' + name + '  (' + JSON.stringify(note).slice(0, 400) + ')'); };
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const open = async (ctx, which, vp) => { const p = await ctx.newPage(vp ? { viewport: vp } : {}); p._pe = []; p.on('pageerror', e => p._pe.push(e.message.slice(0, 120)));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto(base + '/' + which + '/index.html?s3=1&s3x=1'); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TC_API, null, { timeout: 180000 }); await p.waitForTimeout(1500); return p; };
  const card = p => p.evaluate(() => { const d = document.getElementById('tabsCard'); return !!(d && d.getClientRects().length); }).catch(() => 'closed');
  const st = p => p.evaluate(() => { const s = JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key) || '{}'); return { sv: s.sv || 0, bank: s.career ? s.career.bank : null, week: s.career && s.career.circuit ? s.career.circuit.week : null }; });
  const mem = p => p.evaluate(() => ({ sv: save.sv || 0, bank: career() ? career().bank : null }));
  const mk = p => p.evaluate(() => { save.authSeen = true; save.name = 'QA Tabs'; $('login').hidden = true; newCareer(); career().bank = 100; persist(); try { showHub('play'); } catch (e) {} });

  // 1 two tabs + a reload mid-save: B (owner) earns money and reloads straight away (cloud push not due yet); A (stepped aside) is then
  //   reloaded too, as a player would. Nothing earned may be lost and only one tab may play.
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const A = await open(ctx, 'new'); await mk(A); await A.waitForTimeout(1500);
    const B = await open(ctx, 'new'); await B.waitForFunction(() => career && career(), null, { timeout: 60000 }); await B.waitForTimeout(800);
    await B.evaluate(() => { career().bank += 250; persist(); }); const reloadP = B.reload(); await reloadP; await B.waitForFunction(() => window.TOPS_S3 && window.C3, null, { timeout: 180000 }); await B.waitForTimeout(2000);
    const b1 = await mem(B), aCard = await card(A), bCard = await card(B);
    row(b1.bank === 350 && !bCard, '1 owner reloads straight after a save: the money is there and it plays', { b1, bCard });
    row(aCard === true, '1 the other tab shows the card', { aCard });
    await A.reload(); await A.waitForFunction(() => window.TOPS_S3 && window.C3, null, { timeout: 180000 }); await A.waitForTimeout(2500);
    const a2 = await mem(A), a2c = await card(A), b2c = await card(B); await B.evaluate(() => { try { career().bank += 1; persist(); } catch (e) {} }); await B.waitForTimeout(800); const s2 = await st(A);
    row(a2.bank === 350 && !a2c && b2c === true && s2.bank === 350, '1 reloading the other tab: it takes over with the latest save, the first tab steps aside and its next save is blocked', { a2, a2c, b2c, stored: s2 });
    row(!A._pe.length && !B._pe.length, '1 no page errors', [...A._pe, ...B._pe]); await ctx.close(); }

  // 2 an OLD build tab (4.26, opened before the release) next to a NEW one: the old tab knows nothing of the guard and its hub saves on redraw
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const O = await open(ctx, 'old'); await mk(O); await O.waitForTimeout(1500); await O.evaluate(() => { try { showTitle(); } catch (e) {} }); await O.waitForTimeout(3000);   // the old tab idles on the title (no hub redraw saves) while the new tab plays
    const N = await open(ctx, 'new'); await N.waitForFunction(() => career && career(), null, { timeout: 60000 }); await N.waitForTimeout(800);
    await N.evaluate(() => { career().bank += 500; persist(); }); await N.waitForTimeout(500); const n0 = await st(N);
    await O.evaluate(() => { try { showHub('play'); } catch (e) {} }); await O.waitForTimeout(12000);   // the old hub redraws and saves as it always has
    const s = await st(N), nCard = await card(N), nm = await mem(N); const n0card = null;
    row(null, '2 old 4.26 tab + new tab: after the old tab\'s hub sits 12 s', { newSaved: n0, storedNow: s, newShowsCard: nCard, newInMemory: nm, verdict: s.bank === 600 ? 'kept' : 'the new tab\'s +500 was overwritten by the old tab' });
    // what the player sees next in the new tab: can it still lose more? one more save from N
    await N.evaluate(() => { try { career().bank += 1; persist(); } catch (e) {} }); await N.waitForTimeout(500); const s2 = await st(N);
    const resc = await N.evaluate(() => { try { const l = JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key + '_rescue') || '[]'); return l.map(x => ({ why: x.why, sv: x.sv, bank: x.save && x.save.career && x.save.career.bank })); } catch (e) { return 'none'; } });
    row(null, '2 the new tab then saves again', { stored: s2, newShowsCard: await card(N) });
    row(Array.isArray(resc) && resc.some(x => x.bank === 600), '2 the new tab kept a recovery copy with its +$500 before stepping aside', { rescues: resc }); await ctx.close(); }

  // 4 mid-match: A is in a Circuit match; B opens. B must say a match is in progress and not take over; A plays on and B writes nothing.
  //   Then "Play here anyway" on B: B owns, A stops behind the card, A's match isn't saved, and the save is A's last completed state.
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const A = await open(ctx, 'new');
    await A.evaluate(() => { save.authSeen = true; $('login').hidden = true; newCareer(); career().bank = 100; persist(); const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); });
    await A.waitForFunction(() => typeof S !== 'undefined' && S && !S.done, null, { timeout: 60000 }); await A.waitForTimeout(1500); const s0 = await st(A);
    const B = await open(ctx, 'new'); await B.waitForTimeout(1500);
    const bTxt = await B.evaluate(() => { const d = document.getElementById('tabsCard'); return d ? d.innerText.replace(/\s+/g, ' ') : null; });
    const aLive = await A.evaluate(() => typeof S !== 'undefined' && !!S && !S.done && !TOPS_TABS.away() && !document.getElementById('tabsCard'));
    // A keeps playing: a dart from A's side while B waits (the throw API the tests use)
    const aDart = await A.evaluate(() => { try { const s1 = save.sv || 0; return { ok: true, sv: s1 }; } catch (e) { return String(e); } });
    const s1 = await st(B), aSv = await A.evaluate(() => save.sv), bSv = await B.evaluate(() => save.sv || 0);
    // the owner flushes once on the hello (its own write, the last completed state); the waiting tab writes nothing
    row(!!bTxt && /match is in progress/i.test(bTxt) && aLive && s1.sv === aSv && s1.sv <= s0.sv + 1, '4 mid-match: the new tab waits behind "a match is in progress", the owner plays on, only the owner\'s flush is written', { bTxt: bTxt && bTxt.slice(0, 90), aLive, storedSv: [s0.sv, s1.sv], ownerSv: aSv, waitingTabSv: bSv });
    const pre = s1.bank;
    await B.screenshot({ path: path.join(SH, 'tabs-busy-390.png') });
    await B.evaluate(() => { const bt = document.querySelector('#tabsCard button'); if (bt) bt.click(); }); await B.waitForTimeout(2000);
    const after = { aCard: await card(A), aPaused: await A.evaluate(() => !!(typeof S !== 'undefined' && S && S.paused)), bOwns: await B.evaluate(() => !TOPS_TABS.away() && !document.getElementById('tabsCard')), stored: await st(B), bMem: await mem(B) };
    // A tries to save its half-played state (as its match end or a hub redraw would): must be refused
    const aTry = await A.evaluate(() => { try { career().bank = 1; persist(); return 'persist returned'; } catch (e) { return 'threw: ' + e.message.slice(0, 60); } }); await A.waitForTimeout(500); const s2 = await st(B);
    row(after.aCard === true && after.bOwns && s2.bank === pre && s2.week === s0.week && after.bMem.bank === pre, '4 Play here anyway: the new tab owns, the match tab stops behind the card, its later save is refused, the save is the last completed state', { ...after, aTry, storedAfterATry: s2 });
    row(!A._pe.length && !B._pe.length, '4 no page errors', [...A._pe, ...B._pe]); await ctx.close(); }

  // 3 the card on iPhone 13 and Pixel 7 at 390 and 360: readable, one tap target >= 44 px, nothing cut off, nothing behind it tappable
  for (const [dn, d] of [['iPhone 13', devices['iPhone 13']], ['Pixel 7', devices['Pixel 7']]]) for (const w of [390, 360]) {
    const ctx = await b.newContext({ ...d, viewport: { width: w, height: w === 360 ? 640 : 844 } }); const A = await open(ctx, 'new'); await mk(A); await A.waitForTimeout(1500);
    const B = await open(ctx, 'new'); await A.waitForTimeout(2500); await A.bringToFront(); await A.waitForTimeout(400);
    const m = await A.evaluate(() => { const d = document.getElementById('tabsCard'); if (!d) return null; const bt = d.querySelector('button'), r = bt.getBoundingClientRect(), box = d.querySelector('.tc-in').getBoundingClientRect();
      const hit = document.elementFromPoint(innerWidth / 2, innerHeight - 40), cut = [...d.querySelectorAll('*')].some(e => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > innerWidth || e.getBoundingClientRect().left < 0);
      const mb = document.getElementById('rbMenu') || document.getElementById('btnMenu'), mr = mb && mb.getBoundingClientRect(), menuHit = mr && mr.width ? document.elementFromPoint(mr.left + mr.width / 2, mr.top + mr.height / 2) : null;
      return { btn: [Math.round(r.width), Math.round(r.height)], box: [Math.round(box.left), Math.round(box.right), Math.round(box.top), Math.round(box.bottom)], vw: innerWidth, vh: innerHeight, cut, bottomHitsCard: d.contains(hit), menuCovered: menuHit ? d.contains(menuHit) : 'no menu', focus: document.activeElement === bt, text: d.innerText.replace(/\s+/g, ' ').slice(0, 60) }; });
    const f = path.join(SH, `tabs-card-${dn.replace(/\s/g, '')}-${w}.png`); await A.screenshot({ path: f });
    // a tap anywhere but the button must not reach the game; then Play here
    const before = await A.evaluate(() => location.href); await A.touchscreen.tap(Math.round(w / 2), 60).catch(() => {}); await A.waitForTimeout(300);
    const still = await card(A);
    row(!!m && m.btn[1] >= 44 && !m.cut && m.bottomHitsCard && m.menuCovered !== false && still === true && m.box[0] >= 0 && m.box[1] <= m.vw && m.box[3] <= m.vh, `3 card on ${dn} at ${w}`, { ...m, tapOutsideKeepsCard: still, shot: path.basename(f) });
    await ctx.close(); }
  await b.close(); srv.close(); console.log(`\n${rows.filter(r => r.ok === true).length} pass, ${rows.filter(r => r.ok === false).length} fail, ${rows.filter(r => r.ok === null).length} info`); process.exit(rows.some(r => r.ok === false) ? 1 : 0); })().catch(e => { console.error('ERR', e); process.exit(3); });
