// CAR-TABS adversarial cases (Producer 17:26, ChatGPT's R4 P1s). Same-origin http server; one browser context per case (shared storage).
// Every page gets hooks that can DELAY its BroadcastChannel and storage-event delivery (window.__QAcfg.bcDelay / stDelay, ms) so a tab can
// be "slow to hear" without blocking its main thread; CPU=4 throttles every page's CPU (Chrome DevTools). usage: node tabs-adv.js <dir> [cases]
//   A1 two cold starts at once (no owner yet), x3, plain and with crossed 800 ms message delays: exactly one tab owns
//   A2 A owns on the hub; B opens and reads busy=0; THEN A starts a match and is deaf for 8 s (past B's 4 s wait): A keeps its match, one owner
//   A3 a cloud push suspended in its preflight read while B takes over and saves: A must not write to the cloud after losing ownership
//   A4 bfcache-style restore: A frozen (and its messages lost), B takes over and saves, A resumes with pageshow persisted: A must not act
//      as owner (no write, shows the card) and the save keeps B's progress
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const DIR = path.resolve(process.argv[2]); const ONLY = (process.argv[3] || '').split(',').filter(Boolean); const CPU = +(process.env.CPU || 1);
const TY = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/blank.html') { r.writeHead(200, { 'content-type': 'text/html' }); return r.end('<!doctype html><title>away</title>'); }
  if (u === '/') u = '/index.html'; const fp = path.join(DIR, u); if (!fp.startsWith(DIR)) { r.writeHead(403); return r.end(); }
  fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TY[path.extname(fp)] || 'application/octet-stream' }); r.end(d); }); });
const FIX = fs.readFileSync(path.join(__dirname, 'b_short_s3.json'), 'utf8');
const rows = []; const row = (ok, name, note) => { rows.push({ ok, name }); console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + '  ' + JSON.stringify(note).slice(0, 520)); };
const SB = 'https://thyirfwoqkshsaqowdpe.supabase.co', UID = '00000000-0000-4000-8000-00000000c10d';
const HOOK = cfg => { window.__QAcfg = Object.assign({ bcDelay: 0, stDelay: 0 }, cfg || {});
  try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {}
  const BC = window.BroadcastChannel; if (BC) { class QBC extends BC { constructor(n) { super(n); super.addEventListener('message', e => { const run = () => { try { this.__h && this.__h.call(this, e); } catch (x) {} (this.__ls || []).forEach(g => { try { g.call(this, e); } catch (x) {} }); };
        const d = window.__QAcfg.bcDelay; if (d === Infinity) return; d ? setTimeout(run, d) : run(); }); }
      set onmessage(f) { this.__h = f; } get onmessage() { return this.__h; }
      addEventListener(t, f, o) { if (t === 'message') { (this.__ls = this.__ls || []).push(f); return; } return super.addEventListener(t, f, o); } }
    window.BroadcastChannel = QBC; }
  const ael = window.addEventListener; window.addEventListener = function (t, f, o) { if (t === 'storage' && typeof f === 'function') { const g = e => { const d = window.__QAcfg.stDelay; if (d === Infinity) return; d ? setTimeout(() => f.call(window, e), d) : f.call(window, e); }; return ael.call(this, t, g, o); } return ael.call(this, t, f, o); }; };
const SEED = raw => { try { if (!localStorage.getItem('doubleout_s3')) localStorage.setItem('doubleout_s3', raw); } catch (e) {} };
const state = p => p.evaluate(() => { const T = window.TOPS_TABS || {}; const c = document.getElementById('tabsCard'); const away = T.away ? T.away() : null, pend = T.pending ? T.pending() : null;
  return { own: !c && away === false && pend === false, away, pending: pend, card: c ? (c.dataset.mode || 'normal') : null, mid: typeof S !== 'undefined' && !!S && !S.done && !S.paused, paused: typeof S !== 'undefined' && !!S && !!S.paused, sv: (typeof save !== 'undefined' && save.sv) || 0, bank: (typeof career === 'function' && career() && career().bank) || null }; }).catch(e => ({ err: e.message.slice(0, 60) }));
const stored = p => p.evaluate(() => { const s = JSON.parse(localStorage.getItem('doubleout_s3') || '{}'); return { sv: s.sv || 0, bank: s.career ? s.career.bank : null }; });
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); const URL0 = 'http://127.0.0.1:' + srv.address().port + '/index.html?s3=1&s3x=1';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const open = async (ctx, cfg, extra) => { const p = await ctx.newPage({ viewport: { width: 390, height: 844 } }); p._pe = []; p.on('pageerror', e => p._pe.push(e.message.slice(0, 120)));
    await p.addInitScript(SEED, FIX); await p.addInitScript(HOOK, cfg || {});
    await p.route(/jsdelivr|googleapis|gstatic/, r => r.abort()); if (!ctx.__cloud) await p.route(/supabase\.co/, r => r.abort());
    if (extra) await extra(p);   /* after the blanket aborts: Playwright tries the newest route first */
    if (CPU > 1) { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: CPU }); p._cdp = c; }
    await p.goto(URL0, { timeout: 180000 }); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TC_API, null, { timeout: 180000 }); return p; };
  const hub = p => p.evaluate(() => { try { save.authSeen = true; const l = document.getElementById('login'); if (l) l.hidden = true; showHub('play'); } catch (e) {} });
  const startMatch = p => p.evaluate(() => { try { const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); return 'started'; } catch (e) { return 'err ' + e.message; } });
  const owners = sts => sts.filter(s => s.own).length;
  const RUN = k => !ONLY.length || ONLY.includes(k);

  // A1 two cold starts at once
  if (RUN('A1')) for (const [lab, cfg] of [['plain', {}], ['crossed 800 ms', { bcDelay: 800, stDelay: 800 }]]) for (let i = 1; i <= 3; i++) {
    const ctx = await b.newContext({ serviceWorkers: "block" }); const [A, B] = await Promise.all([open(ctx, cfg), open(ctx, cfg)]); await Promise.all([hub(A), hub(B)]); await A.waitForTimeout(7000);
    const s = [await state(A), await state(B)]; row(owners(s) === 1, `A1 two cold starts at once (${lab}) #${i}: exactly one tab owns`, { A: s[0], B: s[1], pe: [...A._pe, ...B._pe].slice(0, 2) }); await ctx.close(); }

  // A2 a match starts after B read busy=0, and A is deaf past B's wait
  if (RUN('A2')) for (let i = 1; i <= 2; i++) { const ctx = await b.newContext({ serviceWorkers: "block" }); const A = await open(ctx); await hub(A); await A.waitForTimeout(2500);
    let helloAt = 0, fired = false;
    const B = await open(ctx, {}, async p => { await p.exposeBinding('__qaHello', async () => { if (fired) return; fired = true; helloAt = Date.now();
        await A.evaluate(() => { window.__QAcfg.bcDelay = 8000; window.__QAcfg.stDelay = 8000; }); await startMatch(A); });
      await p.addInitScript(() => { const BC = window.BroadcastChannel; const pm = BC.prototype.postMessage; BC.prototype.postMessage = function (d) { try { if (d && d.t === 'hello') window.__qaHello(); } catch (e) {} return pm.call(this, d); }; }); });
    await B.waitForTimeout(9000); const s = [await state(A), await state(B)];
    row(fired && s[0].mid && !s[0].paused && owners(s) === 1 && !s[1].own, `A2 match starts after B read busy=0, A deaf 8 s #${i}: A keeps its match, B doesn't take over`, { helloSeen: fired, A: s[0], B: s[1], pe: [...A._pe, ...B._pe].slice(0, 2) }); await ctx.close(); }

  // A2b A is mid-match and frozen 10 s (a phone backgrounded mid-match: no heartbeat, the owner key goes stale); B opens meanwhile.
  //   The match must not be ended by an ordinary takeover: B shows "a match is in progress" (only Play here anyway may interrupt), and
  //   after A resumes exactly one tab owns.
  if (RUN('A2b')) { const ctx = await b.newContext({ serviceWorkers: "block" }); const A = await open(ctx); await hub(A); await A.waitForTimeout(2000); await startMatch(A);
    await A.waitForFunction(() => typeof S !== 'undefined' && S && !S.done, null, { timeout: 60000 }); await A.waitForTimeout(1500);
    const ca = A._cdp || await ctx.newCDPSession(A); await ca.send('Page.setWebLifecycleState', { state: 'frozen' }); await new Promise(z => setTimeout(z, 10000));
    const B = await open(ctx); await B.waitForTimeout(5000); const sB0 = await state(B);
    await ca.send('Page.setWebLifecycleState', { state: 'active' }); await A.waitForTimeout(4000); const s = [await state(A), await state(B)];
    row(s[0].mid && !s[0].paused && owners(s) === 1 && !s[1].own, 'A2b A mid-match and frozen 10 s, B opens: A keeps its match, B waits behind "a match is in progress", one owner after A resumes', { B_beforeAresumes: sB0, A: s[0], B: s[1], pe: [...A._pe, ...B._pe].slice(0, 2) }); await ctx.close(); }

  // A3 a cloud push suspended in its preflight read while B takes over and saves
  if (RUN('A3')) { const ctx = await b.newContext({ serviceWorkers: "block" }); ctx.__cloud = true;
    const exp = Math.floor(Date.now() / 1000) + 21600, b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
    const user = { id: UID, aud: 'authenticated', role: 'authenticated', email: 'qa@example.invalid', user_metadata: { full_name: 'QA' }, app_metadata: { provider: 'google' } };
    const sess = { access_token: b64({ alg: 'none' }) + '.' + b64({ sub: UID, role: 'authenticated', exp }) + '.qa', token_type: 'bearer', expires_in: 21600, expires_at: exp, refresh_token: 'r', user };
    // a SETTLED save, as a returning player has it: the fixture opened once by this build (guest), so the boot has nothing left to change;
    // the cloud holds exactly the same copy (same counter and device), as after that player's last push
    let local = FIX; { const c0 = await b.newContext({ serviceWorkers: "block" }); const g = await open(c0); await g.evaluate(() => { save.authSeen = true; save.cloudUser = { id: '00000000-0000-4000-8000-00000000c10d', name: 'QA' }; try { persist(); } catch (e) {} }); await g.waitForTimeout(6000); local = await g.evaluate(() => localStorage.getItem('doubleout_s3')); await c0.close(); }
    const seed = JSON.parse(local); const st = { row: { data: seed }, log: [] }; let hold = null, holdOld = null; const LOCAL = local;
    const sbjs = (() => { try { return fs.readFileSync(process.env.SBJS, 'utf8'); } catch (e) { return null; } })();
    const J = (r, s, o) => r.fulfill({ status: s, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: o === undefined ? '' : JSON.stringify(o) });
    const attach = async (p, who) => { await p.addInitScript(s => { try { localStorage.setItem('sb-thyirfwoqkshsaqowdpe-auth-token', JSON.stringify(s)); } catch (e) {} }, sess);
      await p.route(/supabase-js@[\d.]+\/dist\/umd\/supabase(\.min)?\.js/, r => sbjs ? r.fulfill({ status: 200, contentType: 'application/javascript', body: sbjs }) : r.continue());
      await p.route(u => u.href.startsWith(SB), async r => { const q = r.request(), u = new URL(q.url()), m = q.method();
        if (m === 'OPTIONS') return r.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
        if (u.pathname.startsWith('/auth/v1/user')) return J(r, 200, user); if (u.pathname.startsWith('/auth/v1/')) return J(r, 200, sess);
        if (u.pathname === '/rest/v1/rpc/tops_save3_put') { const bd = JSON.parse(q.postData() || '{}'); if ('p_base' in bd) return J(r, 404, { code: 'PGRST202', message: 'Could not find the function' });
          const cur = st.row.data, nv = +(bd.p_data.sv || 0), cv = +(cur.sv || 0); const ok = !(cv > nv || (cv === nv && cur.dev !== bd.p_data.dev && cv > 0));
          st.log.push({ who, t: Date.now(), sv: nv, bank: bd.p_data.career && bd.p_data.career.bank, ok }); if (ok) st.row = { data: bd.p_data }; return J(r, 200, ok ? { ok: true, sv: nv } : { ok: false, err: 'older', sv: cv, data: cur }); }
        if (u.pathname === '/rest/v1/tops_saves_s3' && m === 'GET') { const snap = JSON.parse(JSON.stringify(st.row));
          if (hold && who === 'A') { st.log.push({ who, t: Date.now(), preflight: 'held' }); await hold; holdOld = snap; }   // answers with the cloud as it was when asked
          const one = /pgrst\.object/.test(q.headers()['accept'] || ''); const rowv = { user_id: UID, ...(holdOld && who === 'A' ? holdOld : snap) }; return one ? J(r, 200, rowv) : J(r, 200, [rowv]); }
        if (u.pathname.startsWith('/rest/v1/rpc/')) return J(r, 200, null); return m === 'GET' ? J(r, 200, []) : J(r, 201); }); };
    const A = await open(ctx, {}, async p => { await p.addInitScript(raw => { try { localStorage.setItem('doubleout_s3', raw); } catch (e) {} }, LOCAL); await attach(p, 'A'); }); await hub(A);
    // A5 (inside A3's setup): this one signed-in tab, alone, must never show "open in another tab" (the cloud already has its save)
    const seen = []; let tPrev = 0; for (const t of [2, 5, 8, 12]) { await A.waitForTimeout((t - tPrev) * 1000); tPrev = t; const s5 = await state(A); seen.push({ t, own: s5.own, card: s5.card, sv: s5.sv }); }
    const lg5 = await A.evaluate(() => (window.TOPS_TABS && TOPS_TABS.log) ? TOPS_TABS.log().slice(-8) : null).catch(() => null);
    row(seen.every(x => !x.card), 'A5 one signed-in tab, alone, for 12 s: never "open in another tab"', { seen, tabsLog: lg5, cloudLog: st.log.map(x => x.who + (x.preflight ? ' preflight' : ' put sv' + x.sv + (x.ok ? ' ok' : ' refused'))).join(', ') });
    if (process.env.DBG) console.log('DBG A3', JSON.stringify(await A.evaluate(() => ({ user: !!(window.NET && NET.user), sb: !!(window.NET && NET.sb), supa: !!window.supabase, cp: typeof cloudPush, tok: !!localStorage.getItem('sb-thyirfwoqkshsaqowdpe-auth-token') }))), 'log', JSON.stringify(st.log));
    let release; hold = new Promise(z => release = z);
    const sA0 = await state(A), st0 = await stored(A);
    await A.evaluate(() => { career().bank += 100; persist(); try { cloudPush(true); } catch (e) {} }); await A.waitForTimeout(800); const stA = await stored(A);
    if (process.env.DBG) console.log('DBG A before +100', JSON.stringify(sA0), 'stored', JSON.stringify(st0), 'after', JSON.stringify(stA), 'log', JSON.stringify(await A.evaluate(() => (window.TOPS_TABS && TOPS_TABS.log) ? TOPS_TABS.log().slice(-12) : null)).slice(0, 1500));
    const B = await open(ctx, {}, p => attach(p, 'B')); await hub(B); await B.waitForTimeout(3000);
    const sA1 = await state(A), sB1 = await state(B);
    await B.evaluate(() => { career().bank += 300; persist(); try { cloudPush(true); } catch (e) {} }); await B.waitForTimeout(3000); const cloudB = st.row.data.career.bank, tRel = Date.now();
    release(); hold = null;
    const want0 = JSON.parse(LOCAL).career.bank + 400; for (let k = 0; k < 40 && st.row.data.career.bank !== want0; k++) await A.waitForTimeout(500);   // give B's push up to 20 s (preflight, retries): slow is not lost
    await A.waitForTimeout(1500);
    const late = st.log.filter(x => x.who === 'A' && !x.preflight && x.t >= tRel);
    const want = JSON.parse(LOCAL).career.bank + 400, bEnd = (await state(B)).bank;   /* A's +100 then B's +300: nothing may be lost */
    row(!late.length && st.row.data.career.bank === want && bEnd === want, 'A3 cloud push suspended in preflight while B takes over and saves: A writes nothing after losing ownership; B starts from A\'s latest save; the cloud ends with both A\'s +$100 and B\'s +$300',
      { want, bEnd, A_whenB_open: sA1, B: sB1, cloudAfterB: cloudB, A_putsAfterRelease: late, cloudEnd: st.row.data.career.bank, log: st.log.map(x => x.who + (x.preflight ? ' preflight held' : ' put sv' + x.sv + ' $' + x.bank + (x.ok ? ' ok' : ' refused'))).join(', ') });
    await ctx.close(); }

  // A4 bfcache-style restore
  if (RUN('A4')) { const ctx = await b.newContext({ serviceWorkers: "block" }); const A = await open(ctx); await hub(A); await A.waitForTimeout(2500);
    const ca = A._cdp || await ctx.newCDPSession(A); await A.evaluate(() => { window.__QAcfg.bcDelay = Infinity; window.__QAcfg.stDelay = Infinity; });   // what it misses while in the cache is lost
    await ca.send('Page.setWebLifecycleState', { state: 'frozen' });
    const B = await open(ctx); await hub(B); await B.waitForTimeout(6000); await B.evaluate(() => { career().bank += 200; persist(); }); await B.waitForTimeout(800); const sB = await state(B), s0 = await stored(B);
    await ca.send('Page.setWebLifecycleState', { state: 'active' });
    await A.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })); }); await A.waitForTimeout(2000); const sA = await state(A);
    const w = await A.evaluate(() => { try { career().bank = 1; persist(); return 'persist returned'; } catch (e) { return 'threw: ' + e.message.slice(0, 50); } }); await A.waitForTimeout(800); const s1 = await stored(B);
    row(!sA.own && s1.bank === s0.bank && s1.bank != null, 'A4 bfcache-style restore: A revalidates on pageshow (not owner, card) and its write is refused; the save keeps B\'s progress', { B: sB, A_afterPageshow: sA, A_write: w, storedBefore: s0, storedAfter: s1, pe: [...A._pe, ...B._pe].slice(0, 2) });
    await ctx.close(); }
  await b.close(); srv.close(); console.log(`\n${rows.filter(r => r.ok).length} pass, ${rows.filter(r => !r.ok).length} fail (CPU x${CPU})`); process.exit(rows.some(r => !r.ok) ? 1 : 0); })().catch(e => { console.error('ERR', e); process.exit(3); });
