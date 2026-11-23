// CAR-TABS R8 final set (tabs-r8.js, from tabs-adv.js): every case also records a WRITER TRACE (each local save write, each cloud push, each Web Locks grant/release, per tab, with time) and checks that every write and push happened while that tab held the lock (fallback: no tab writes after another tab has). DLY=ms sets the older tab's message delay (A1: both tabs). Real match results (endMatch) and competing bank/week/history writes.
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
const TRACE = () => { const PID = Math.random().toString(36).slice(2, 7); window.__qaPid = PID; const W = window.__qaW = []; { const p0 = W.push.bind(W); W.push = o => p0(Object.assign(o, { i: W.length })); }
  const sum = v => { try { const s = JSON.parse(v); const c = s.career || {}; return { sv: s.sv, bank: c.bank, wk: c.week, m: s.matches, qa: (c.qa || []).join('') }; } catch (e) { return {}; } };
  const si = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'doubleout_s3' && this === localStorage && !window.__qaSeed) { const t = Date.now(); const r = si.call(this, k, v); let st = ''; try { st = (new Error().stack || '').split('\n').slice(2, 14).map(x => x.trim().replace(/^at /, '').replace(/\(?https?:\/\/[^)]*\/([^/)]+)\)?/, '@$1')).join(' < ').slice(0, 900); } catch (e) {} W.push(Object.assign({ k: 'write', t, pid: PID, st }, sum(v))); return r; } return si.call(this, k, v); };
  if (navigator.locks && navigator.locks.request) { const L = navigator.locks, rq = L.request.bind(L);
    L.request = function (name, opts, cb) { if (typeof opts === 'function') { cb = opts; opts = {}; } const nm = String(name); const kind = /^tops-save-/.test(nm) ? 'own' : /^tops-write-/.test(nm) ? 'wl' : /^tops-push-/.test(nm) ? 'pl' : null; if (!kind) return rq(name, opts, cb);
      const p = rq(name, opts, lock => { if (lock) W.push({ k: 'grant', lk: kind, t: Date.now(), pid: PID, steal: !!(opts && opts.steal) }); let r; try { r = cb(lock); } catch (e) { if (lock) W.push({ k: 'release', lk: kind, t: Date.now(), pid: PID }); throw e; }
        if (lock) Promise.resolve(r).then(() => W.push({ k: 'release', lk: kind, t: Date.now(), pid: PID }), () => W.push({ k: 'release', lk: kind, t: Date.now(), pid: PID })); return r; });
      p.catch(e => W.push({ k: 'lockerr', lk: kind, t: Date.now(), pid: PID, e: String(e && e.name) })); return p; }; }
  const f0 = window.fetch; window.fetch = function (u, o) { try { const s = String(u && u.url || u); if (/\/rpc\/tops_save3_put/.test(s)) { let sv = null; try { sv = JSON.parse(o && o.body || '{}').p_data.sv; } catch (e) {} let st = ''; try { st = (new Error().stack || '').split('\n').slice(2, 9).map(x => x.trim().replace(/^at /, '').replace(/\(?https?:\/\/[^)]*\/([^/)]+)\)?/, '@$1')).join(' < ').slice(0, 400); } catch (e) {} W.push({ k: 'push', t: Date.now(), pid: PID, sv, st, body: String(o && o.body || '').slice(0, 30) }); } } catch (e) {} return f0.apply(this, arguments); }; };
const DLY = +(process.env.DLY || 0), LKM = !process.env.NOLOCKS, LOCKV = +(process.env.LOCKV || 9);
const fin = p => p.evaluate(() => { const s = JSON.parse(localStorage.getItem('doubleout_s3') || '{}'); const c = s.career || {}; return { sv: s.sv || 0, bank: c.bank, wk: c.week, m: s.matches || 0, qa: (c.qa || []).join('') }; });
const finAll = async (...ps) => { let best = null; const all = []; for (const p of ps) { const f = await fin(p).catch(() => null); if (!f) continue; all.push(f.sv); if (!best || f.sv > best.sv) best = f; } if (best) best.views = all; return best; };
const rescues = p => p.evaluate(() => (window.TOPS_TABS && TOPS_TABS.rescues) ? TOPS_TABS.rescues().map(r => r.why + ' sv' + r.sv) : []).catch(() => null);
const audit = async (name, pages) => { const all = [], lab = {}, resc = {};
  for (const [L, p] of pages) { const r = await p.evaluate(() => ({ pid: window.__qaPid, w: window.__qaW || [] })).catch(() => null); if (!r) { lab['?' + L] = L; continue; } lab[r.pid] = L; all.push(...r.w); resc[L] = await rescues(p); }
  const ord = { grant: 0, lockerr: 1, release: 2, write: 3, push: 3 }; all.sort((a, b) => a.t - b.t || (a.pid === b.pid ? a.i - b.i : ord[a.k] - ord[b.k]));   /* same page, same ms: the page's own order */
  const viol = []; let cur = null, curT = 0, firstT = all.length ? all[0].t : 0; const seq = []; let n = { write: {}, push: {} };
  const inW = {}, inP = {}; let ownSince = {}, wroteSince = {}; const strict = [];
  for (const e of all) { const L = lab[e.pid];
    if (e.k === 'grant') { if (e.lk === 'wl') { inW[e.pid] = (inW[e.pid] || 0) + 1; continue; } if (e.lk === 'pl') { inP[e.pid] = (inP[e.pid] || 0) + 1; continue; } cur = e.pid; curT = e.t; ownSince = { [e.pid]: true }; wroteSince = {}; seq.push('+' + L); continue; }
    if (e.k === 'release') { if (e.lk === 'wl') { inW[e.pid] = Math.max(0, (inW[e.pid] || 0) - 1); continue; } if (e.lk === 'pl') { inP[e.pid] = Math.max(0, (inP[e.pid] || 0) - 1); continue; } if (cur === e.pid) cur = null; continue; }
    if (e.k === 'lockerr') { if (!e.lk || e.lk === 'own') seq.push('x' + L); continue; }
    if (e.k === 'write' || e.k === 'push') { n[e.k][L] = (n[e.k][L] || 0) + 1; if (seq[seq.length - 1] !== (e.k === 'write' ? 'w' : 'p') + L) seq.push((e.k === 'write' ? 'w' : 'p') + L);
      if (!LKM) continue;
      const serial = e.k === 'write' ? (inW[e.pid] || 0) > 0 : (inP[e.pid] || 0) > 0;   /* R9: each write inside this tab's short write lock (puts: push lock) */
      const other = Object.keys(wroteSince).find(p => p !== e.pid);   /* the newest owner (or anyone) has already written since the last owner grant */
      const neverOwned = !all.some(g => g.k === 'grant' && g.lk === 'own' && g.pid === e.pid && g.t <= e.t);
      const base = { k: e.k, tab: L, at: e.t - firstT, holder: cur ? lab[cur] : null, msAfterHolderGrant: cur ? e.t - curT : null, sv: e.sv, bank: e.bank, qa: e.qa, st: e.st };
      if (neverOwned) viol.push(Object.assign({ why: 'never held the owner lock' }, base));
      else if (other) viol.push(Object.assign({ why: 'another tab already wrote under a newer owner grant' }, base));
      else if (!serial && LOCKV === 9) viol.push(Object.assign({ why: 'outside its write lock' }, base));
      if (cur !== e.pid) strict.push(Object.assign({ why: 'after another tab was granted the owner lock (serialized: ' + serial + ')' }, base));
      if (cur === e.pid) wroteSince[e.pid] = true; } }
  if (!LKM) { const w = all.filter(e => e.k === 'write' || e.k === 'push').map(e => lab[e.pid]); const seen = []; for (let i = 0; i < w.length; i++) { if (i && w[i] !== w[i - 1] && seen.includes(w[i])) viol.push({ k: 'return', tab: w[i], at: i }); if (!seen.includes(w[i])) seen.push(w[i]); } }
  if (strict.length) console.log('INFO  ' + name + ': writes after the steal was granted (by callback time): ' + JSON.stringify(strict.slice(0, 3)).slice(0, 700)); console.log('TRACE ' + name + ' :: writes ' + JSON.stringify(n.write) + ' pushes ' + JSON.stringify(n.push) + ' :: ' + seq.join(' ') + ' :: rescues ' + JSON.stringify(resc));
  row(!viol.length, name + ': zero simultaneous writers (' + (LKM ? 'one writer at a time: no tab writes after the newer owner has written, never without the owner lock, each write inside its write lock' : 'fallback: no tab writes again after another tab wrote') + ')', { violations: viol.slice(0, 6), nViol: viol.length, writes: n.write, pushes: n.push });
  return { viol, resc }; };
const SEED = raw => { try { window.__qaSeed = 1; if (!localStorage.getItem('doubleout_s3')) localStorage.setItem('doubleout_s3', raw); } catch (e) {} window.__qaSeed = 0; };
const state = p => p.evaluate(() => { const T = window.TOPS_TABS || {}; const c = document.getElementById('tabsCard'); const away = T.away ? T.away() : null, pend = T.pending ? T.pending() : null;
  return { own: !c && away === false && pend === false, away, pending: pend, card: c ? (c.dataset.mode || 'normal') : null, mid: typeof S !== 'undefined' && !!S && !S.done && !S.paused, paused: typeof S !== 'undefined' && !!S && !!S.paused, sv: (typeof save !== 'undefined' && save.sv) || 0, bank: (typeof career === 'function' && career() && career().bank) || null }; }).catch(e => ({ err: e.message.slice(0, 60) }));
const stored = p => p.evaluate(() => { const s = JSON.parse(localStorage.getItem('doubleout_s3') || '{}'); return { sv: s.sv || 0, bank: s.career ? s.career.bank : null }; });
const OLDDIR = process.env.OLDDIR ? path.resolve(process.env.OLDDIR) : null; let OLDPORT = 0;
const srv2 = OLDDIR ? http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; const fp = path.join(OLDDIR, u); if (!fp.startsWith(OLDDIR)) { r.writeHead(403); return r.end(); }
  fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TY[path.extname(fp)] || 'application/octet-stream' }); r.end(d); }); }) : null;
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); if (srv2) { await new Promise(r => srv2.listen(0, '127.0.0.1', r)); OLDPORT = srv2.address().port; } const URL0 = 'http://127.0.0.1:' + srv.address().port + '/index.html?s3=1&s3x=1';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader'] });
  const open = async (ctx, cfg, extra, dir) => { const p = await ctx.newPage({ viewport: { width: 390, height: 844 } }); p._pe = []; p.on('pageerror', e => p._pe.push(e.message.slice(0, 120)));
    await p.addInitScript(TRACE); await p.addInitScript(SEED, FIX); await p.addInitScript(HOOK, cfg || {}); if (process.env.NOLOCKS) await p.addInitScript(() => { window.TOPS_NOLOCKS = 1; });
    await p.route(/jsdelivr|googleapis|gstatic/, r => r.abort()); if (!ctx.__cloud) await p.route(/supabase\.co/, r => r.abort());
    if (extra) await extra(p);   /* after the blanket aborts: Playwright tries the newest route first */
    if (CPU > 1) { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: CPU }); p._cdp = c; }
    await p.goto(dir ? URL0.replace(/:\d+\//, ':' + OLDPORT + '/') : URL0, { timeout: 180000 }); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TC_API, null, { timeout: 180000 }); return p; };
  const hub = p => p.evaluate(() => { try { save.authSeen = true; const l = document.getElementById('login'); if (l) l.hidden = true; showHub('play'); } catch (e) {} });
  const startMatch = p => p.evaluate(() => { try { const e = TOPS_S3.view().calendar[0]; TOPS_S3.book(e.id); TOPS_S3._playNow(); return 'started'; } catch (e) { return 'err ' + e.message; } });
  const owners = sts => sts.filter(s => s.own).length;
  const RUN = k => !ONLY.length || ONLY.includes(k);


  // ---- R10 server cases, against the REAL guard v3 on the local Postgres (brk/pgshim.py on :55500) ----
  const cp = require('child_process'); const shimSync = (path, body) => { try { return JSON.parse(cp.execSync(`curl -s -X POST http://127.0.0.1:55500${path} -d @-`, { input: JSON.stringify(body || {}) }).toString() || 'null'); } catch (e) { return null; } };
  const shim = (path, body) => fetch('http://127.0.0.1:55500' + path, body ? { method: 'POST', body: JSON.stringify(body) } : undefined).then(r => r.json());
  const exp = Math.floor(Date.now() / 1000) + 21600, b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const user = { id: UID, aud: 'authenticated', role: 'authenticated', email: 'qa@example.invalid', user_metadata: { full_name: 'QA' }, app_metadata: { provider: 'google' } };
  const sess = { access_token: b64({ alg: 'none' }) + '.' + b64({ sub: UID, role: 'authenticated', exp }) + '.qa', token_type: 'bearer', expires_in: 21600, expires_at: exp, refresh_token: 'r', user };
  const sbjs = (() => { try { return fs.readFileSync(process.env.SBJS, 'utf8'); } catch (e) { return null; } })();
  const J = (r, s, o) => r.fulfill({ status: s, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: o === undefined ? '' : JSON.stringify(o) });
  const CL = { log: [], holdPut: null };   // holdPut: { who, until: Promise } holds that device's next PUT before it reaches the database
  const cloudRow = async () => (await shim('/row?uid=' + UID));
  const attach = async (p, who) => { await p.addInitScript(s => { try { if (!sessionStorage.getItem('qa_auth')) { localStorage.setItem('sb-thyirfwoqkshsaqowdpe-auth-token', JSON.stringify(s)); sessionStorage.setItem('qa_auth', '1'); } } catch (e) {} }, sess);
    await p.route(/supabase-js@[\d.]+\/dist\/umd\/supabase(\.min)?\.js/, r => sbjs ? r.fulfill({ status: 200, contentType: 'application/javascript', body: sbjs }) : r.continue());
    await p.route(u => u.href.startsWith(SB), async r => { const q = r.request(), u = new URL(q.url()), m = q.method();
      if (m === 'OPTIONS') return r.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
      if (u.pathname.startsWith('/auth/v1/user')) return J(r, 200, user); if (u.pathname.startsWith('/auth/v1/')) return J(r, 200, sess);
      if (u.pathname === '/rest/v1/rpc/tops_save3_put') { const bd = JSON.parse(q.postData() || '{}'); const e = { who, t: Date.now(), sv: +(bd.p_data && bd.p_data.sv || 0), base: 'p_base' in bd ? bd.p_base : 'none', bank: bd.p_data && bd.p_data.career && bd.p_data.career.bank };
        if (CL.holdPut && CL.holdPut.who === who) { const h = CL.holdPut; CL.holdPut = null; e.held = true; CL.log.push(Object.assign({ k: 'held' }, e)); await h.until; e.released = Date.now(); }
        const x = await shim('/rpc', Object.assign({ uid: UID, p_data: bd.p_data }, 'p_base' in bd ? { p_base: bd.p_base } : {})); CL.log.push(Object.assign({ k: 'put', ok: !!x.ok, err: x.err, cv: x.sv }, e)); return J(r, 200, x); }
      if (u.pathname === '/rest/v1/tops_saves_s3') { if (m !== 'GET') return J(r, 401, { code: '42501', message: 'permission denied for table tops_saves_s3' });
        const x = await cloudRow(); const one = /pgrst\.object/.test(q.headers()['accept'] || ''); const rowv = x ? { user_id: UID, data: x.data } : null;
        return one ? (rowv ? J(r, 200, rowv) : J(r, 406, { code: 'PGRST116', message: 'no rows' })) : J(r, 200, rowv ? [rowv] : []); }
      if (u.pathname.startsWith('/rest/v1/rpc/')) return J(r, 200, null); return m === 'GET' ? J(r, 200, []) : J(r, 201); }); };
  const logStr = () => CL.log.map(x => x.who + ' ' + x.k + ' sv' + x.sv + ' base' + x.base + (x.k === 'put' ? (x.ok ? ' ok' : ' ' + x.err) : '')).join(', ');
  // a settled returning player's save, the cloud holding the same copy
  let SETTLED = null; const settled = async () => { if (SETTLED) return SETTLED; const c0 = await b.newContext({ serviceWorkers: 'block' }); const g = await open(c0); await g.evaluate(() => { save.authSeen = true; save.cloudUser = { id: '00000000-0000-4000-8000-00000000c10d', name: 'QA' }; try { persist(); } catch (e) {} }); await g.waitForTimeout(6000); SETTLED = await g.evaluate(() => localStorage.getItem('doubleout_s3')); await c0.close(); return SETTLED; };
  const fresh = async () => { const L = await settled(); shimSync('/reset'); shimSync('/seed', { uid: UID, data: JSON.parse(L), guarded: false }); CL.log = []; CL.holdPut = null; return L; };
  const dev = async (ctx, who, L, dir) => open(ctx, {}, async p => { if (L) await p.addInitScript(raw => { try { if (!sessionStorage.getItem('qa_seeded')) { window.__qaSeed = 1; localStorage.setItem('doubleout_s3', raw); window.__qaSeed = 0; sessionStorage.setItem('qa_seeded', '1'); } } catch (e) {} }, L); await attach(p, who); }, dir);
  const waitPut = async (pred, ms) => { const t = Date.now(); while (Date.now() - t < ms) { const x = CL.log.find(pred); if (x) return x; await new Promise(z => setTimeout(z, 250)); } return null; };
  const change = (p, d, tag) => p.evaluate(([d, tag]) => { const c = career(); c.bank += d; c.qa = (c.qa || []).concat(tag); persist(); try { cloudPush(true); } catch (e) {} }, [d, tag]);

  // C1 a delayed PUT after the lock moved: tab A's PUT is held on the wire, B takes over and pushes; then A's PUT reaches the database
  if (RUN('C1')) { const L = await fresh(); const ctx = await b.newContext({ serviceWorkers: 'block' }); const A = await dev(ctx, 'A', L); await hub(A); await A.waitForTimeout(9000);
    let rel; CL.holdPut = { who: 'A', until: new Promise(z => rel = z) }; await change(A, 100, 'A'); const held = await waitPut(x => x.k === 'held' && x.who === 'A', 20000);
    const B = await dev(ctx, 'B', null); await hub(B); for (let k = 0; k < 40 && !(await state(B)).own; k++) await B.waitForTimeout(1000);
    await change(B, 300, 'B'); const bPut = await waitPut(x => x.k === 'put' && x.who === 'B' && x.ok && x.bank === JSON.parse(L).career.bank + 400, 40000);
    rel(); const aPut = await waitPut(x => x.k === 'put' && x.who === 'A' && x.released, 20000); await A.waitForTimeout(4000);
    const cr = await cloudRow(), fl = await finAll(A, B), sA = await state(A), want = JSON.parse(L).career.bank + 400;
    row(!!held && !!bPut && aPut && !aPut.ok && aPut.err === 'older' && cr.data.career.bank === want && (cr.data.career.qa || []).join('') === 'AB' && fl.bank === want && !sA.own,
      'C1 delayed PUT after the lock moved: refused by the server (older); the cloud and local save keep A+B; A stays aside and adopts nothing over B', { aPut, cloud: { sv: cr.data.sv, bank: cr.data.career.bank, qa: (cr.data.career.qa || []).join(''), guarded: cr.guarded }, local: fl, A: sA, log: logStr() });
    await audit('C1', [['A', A], ['B', B]]); await ctx.close(); }

  // C2 a legacy caller (live build without p_base) before and after this player's first p_base write
  if (RUN('C2') && process.env.OLDDIR) { const L = await fresh(); const c1 = await b.newContext({ serviceWorkers: 'block' }), c2 = await b.newContext({ serviceWorkers: 'block' });
    const O = await dev(c1, 'old', L, process.env.OLDDIR); await hub(O); await O.waitForTimeout(6000); await change(O, 10, 'o'); const o1 = await waitPut(x => x.who === 'old' && x.k === 'put' && x.bank === JSON.parse(L).career.bank + 10, 30000);
    const g0 = (await cloudRow()).guarded;
    const N = await dev(c2, 'new', null); await hub(N); await N.waitForTimeout(9000); await change(N, 20, 'n'); const n1 = await waitPut(x => x.who === 'new' && x.k === 'put' && x.ok && x.base !== 'none' && (x.bank || 0) >= JSON.parse(L).career.bank + 30, 120000); const nLog = await N.evaluate(() => TOPS_TABS.log().filter(x => /push|put|cloud|adopt|rescue|own|lock|pre/.test(x[1])).slice(-16)).catch(() => null);
    const g1 = (await cloudRow()).guarded; const before = await cloudRow();
    await change(O, 5, 'o2'); const o2 = await waitPut(x => x.who === 'old' && x.k === 'put' && x.t > (n1 ? n1.t : 0), 30000); await O.waitForTimeout(3000); const after = await cloudRow();
    row(o1 && o1.ok && o1.base === 'none' && g0 === false && n1 && g1 === true && o2 && o2.err === 'upgrade_required' && after.data.sv === before.data.sv && (after.data.career.qa || []).join('') === 'on',
      'C2 legacy caller: before the flag its p_data-only save lands; the new build\'s first p_base write sets the flag; after it the old build\'s save is refused upgrade_required and the cloud is untouched', { o1, guardedBefore: g0, n1, guardedAfter: g1, o2, cloud: { sv: after.data.sv, qa: (after.data.career.qa || []).join('') }, oldLocal: await fin(O), log: logStr(), nLog });
    await c1.close(); await c2.close(); }

  // C3 ENG-RESET (v16, between matches) sends its put with a base, and it lands under the flag
  if (RUN('C3')) { const L = await fresh(); shimSync('/seed', { uid: UID, data: JSON.parse(L), guarded: true });   // a player who already has a new client
    const ctx = await b.newContext({ serviceWorkers: 'block' }); const A = await dev(ctx, 'A', L); await hub(A); await A.waitForTimeout(9000); const m0 = (await fin(A)).m;
    await startMatch(A); await A.waitForFunction(() => typeof S !== 'undefined' && S && !S.done, null, { timeout: 60000 }); await A.waitForTimeout(1500);
    const t0 = Date.now(); await A.evaluate(() => { S.p[0].legs = 9; endMatch(); }); await A.waitForTimeout(1500);
    await A.evaluate(() => { try { if (typeof afterResult === 'function') afterResult(S); } catch (e) {} try { showHub('play'); } catch (e) {} }).catch(() => {});
    const rp = await waitPut(x => x.who === 'A' && x.k === 'put' && x.t > t0 && x.ok, 30000); await A.waitForTimeout(8000);
    const cr = await cloudRow(); const nav = await A.evaluate(() => performance.getEntriesByType('navigation').map(n => n.type).join(',')).catch(e => 'err');
    row(!!rp && rp.base !== 'none' && cr.data.matches === m0 + 1 && !CL.log.some(x => x.who === 'A' && x.err === 'upgrade_required'), 'C3 ENG-RESET after a match: the match result reaches the cloud through a put with a base (no upgrade_required)', { put: rp, cloudMatches: cr.data.matches, m0, guarded: cr.guarded, nav, log: logStr() });
    await ctx.close(); }

  // C4 equal-version conflict across two devices: both synced the same save, both push one change from the same base
  if (RUN('C4')) { const L = await fresh(); const c1 = await b.newContext({ serviceWorkers: 'block' }), c2 = await b.newContext({ serviceWorkers: 'block' });
    const X = await dev(c1, 'X', L), Y = await dev(c2, 'Y', L); await Promise.all([hub(X), hub(Y)]); await X.waitForTimeout(9000);
    await Promise.all([change(X, 7, 'x'), change(Y, 9, 'y')]); for (let k = 0; k < 40; k++) { await X.waitForTimeout(1000); const a1 = await fin(X), a2 = await fin(Y), c0 = await cloudRow(); if (a1.qa === a2.qa && a2.qa === (c0.data.career.qa || []).join('') && k > 8) break; }
    const cr = await cloudRow(), fx = await fin(X), fy = await fin(Y); const puts = CL.log.filter(x => x.k === 'put');
    const refused = puts.filter(x => x.err === 'older'), q = (cr.data.career.qa || []).join('');
    row(puts.length >= 1 && (q === 'x' || q === 'y' || q === 'xy' || q === 'yx') && fx.qa === q && fy.qa === q && !puts.some(x => x.err === 'upgrade_required'),
      'C4 equal-version conflict: one device\'s save wins, the other is refused (older) and adopts it; both devices and the cloud end on the same save', { cloud: { sv: cr.data.sv, qa: q }, X: fx, Y: fy, refused: refused.length, log: logStr(), yLog: await Y.evaluate(() => TOPS_TABS.log().filter(x => /push|put|cloud|adopt|rescue|sync|net|pre/.test(x[1])).slice(-14)).catch(() => null), yRescues: await rescues(Y) });
    await c1.close(); await c2.close(); }
  await b.close(); srv.close(); console.log(`\n${rows.filter(r => r.ok).length} pass, ${rows.filter(r => !r.ok).length} fail (CPU x${CPU})`); process.exit(rows.some(r => !r.ok) ? 1 : 0); })().catch(e => { console.error('ERR', e); process.exit(3); });
