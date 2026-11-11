// Two-player online harness (QA, directive 12). Two headless players in one room, no Supabase:
// window.supabase is stubbed before the game loads, and every channel send / presence change is relayed between the
// two pages by this script (the same shape as Supabase Realtime broadcast + presence). Each page throws its own darts
// through land() when it's that player's turn, exactly like regress.js does offline.
// Checks: create + join, both lobbies see two players, host starts, the match finishes on both phones with the same
// legs and winner, every visit on one phone matches the other (scores in step), no page errors; then the guest leaves
// mid-match on a second game and the host is told.
// usage: node tests/twoplayer.js [legs=1]   (phone 390 x 844 for the host, desktop 1280 x 800 for the guest)
const { chromium } = require('playwright'); const path = require('path');
const LEGS = +process.argv[2] || 1;
const STUB = () => {
  const H = {}; let pres = {};
  const chain = () => new Proxy(function () {}, { get: (t, k) => k === 'then' ? (res) => res({ data: [], error: null, count: 0 }) : chain(), apply: () => chain() });
  window.__netIn = (kind, d) => { const hs = H[d.room] || []; hs.forEach(([type, filt, cb]) => {
    if (kind === 'b' && type === 'broadcast') cb({ payload: d.payload });
    if (kind === 'p' && type === 'presence') { pres[d.room] = d.state; if (filt.event === d.event) cb(d.event === 'sync' ? {} : { key: d.key }); } }); };
  const client = {
    auth: { getSession: async () => ({ data: { session: null } }), getUser: async () => ({ data: { user: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }), signInWithOAuth: async () => ({}), signOut: async () => ({}) },
    from: () => chain(), rpc: async () => ({ data: null, error: null }), removeChannel: async () => {},
    channel(name, cfg) { const room = name, key = cfg && cfg.config && cfg.config.presence && cfg.config.presence.key; H[room] = H[room] || []; const ch = {
      on(type, filt, cb) { H[room].push([type, filt || {}, cb]); return ch; },
      subscribe(cb) { window.__relay({ op: 'sub', room, key }).then(() => cb && cb('SUBSCRIBED')); return ch; },
      async track(meta) { await window.__relay({ op: 'track', room, key, meta }); return 'ok'; },
      send(msg) { window.__relay({ op: 'send', room, key, payload: msg.payload }); return Promise.resolve('ok'); },
      presenceState() { return pres[room] || {}; },
      async unsubscribe() { await window.__relay({ op: 'leave', room, key }); H[room] = []; return 'ok'; } }; return ch; } };
  window.supabase = { createClient: () => client };
};
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const fails = [], notes = []; const pages = []; const rooms = {};   // room -> {pages:Set, state:{key:[meta]}}
  const deliver = (room, kind, d, except) => Promise.all([...(rooms[room] ? rooms[room].pages : [])].filter(p => p !== except).map(p => p.evaluate(([k, x]) => window.__netIn && window.__netIn(k, x), [kind, d]).catch(() => {})));
  async function mk(name, vp) {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage(); p.__errs = []; p.on('pageerror', e => p.__errs.push(e.message));
    await p.route(/supabase\.co|jsdelivr|googleapis|gstatic/, r => r.abort());
    await p.exposeBinding('__relay', async (src, m) => {
      const r = rooms[m.room] = rooms[m.room] || { pages: new Set(), state: {} };
      if (m.op === 'sub') r.pages.add(p);
      else if (m.op === 'track') { r.state[m.key] = [m.meta]; await deliver(m.room, 'p', { room: m.room, event: 'sync', state: r.state }); await deliver(m.room, 'p', { room: m.room, event: 'join', key: m.key, state: r.state }); }
      else if (m.op === 'send') { setTimeout(() => deliver(m.room, 'b', { room: m.room, payload: m.payload }, p), 30 + Math.random() * 40); }   // 30-70 ms network
      else if (m.op === 'leave') { r.pages.delete(p); delete r.state[m.key]; await deliver(m.room, 'p', { room: m.room, event: 'sync', state: r.state }); await deliver(m.room, 'p', { room: m.room, event: 'leave', key: m.key, state: r.state }); }
      return true; });
    await p.addInitScript(STUB);
    await p.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(f, Math.max(0, (ms || 0) * 0.15), ...a); });   // like regress.js: shorten waits (two 3D pages on a 2-core box are slow)
    await p.goto('file://' + path.resolve(__dirname, '../index.html'), { waitUntil: 'domcontentloaded', timeout: 180000 });
    await p.waitForFunction(() => typeof NET !== 'undefined' && typeof onlineHost === 'function' && typeof V !== 'undefined', null, { timeout: 180000 });
    await p.waitForTimeout(2500);
    await p.evaluate(n => { save.authSeen = true; save.lessonDone = true; save.name = n; try { $('login').hidden = true; } catch (e) {} V.walkOn = () => {}; window.__fl = []; const _fly = V.fly; V.fly = function () { const a = [...arguments]; if (typeof a[4] === 'number') a[4] = a[4] * 0.08; const cb = a[6]; const id = window.__fl.length; window.__fl.push({ t: Math.round(performance.now()), dur: a[4], done: false }); if (typeof cb === 'function') a[6] = function () { window.__fl[id].done = Math.round(performance.now()); return cb.apply(this, arguments); }; return _fly.apply(this, a); }; window.__ld = []; const _ld = land; land = function (x, y, far) { window.__ld.push([Math.round(performance.now()), !!far, S && S.dart, S && S.netAnim]); return _ld.apply(this, arguments); }; }, name);
    p.__name = name; pages.push(p); return p; }
  const host = await mk('Alpha', { width: 390, height: 844 }), guest = await mk('Bravo', { width: +process.env.GW || 390, height: +process.env.GH || 844 });
  // 1. create + join
  await host.evaluate(() => onlineHost()); await host.waitForTimeout(1500);
  const code = await host.evaluate(() => NET.room); if (!code) { fails.push('host: no room code after onlineHost()'); }
  await guest.evaluate(c => onlineJoin(c, 1), code); await guest.waitForTimeout(2000);
  const lob = await Promise.all([host, guest].map(p => p.evaluate(() => ({ peers: (mpPeers() || []).length, lobby: !$('onLobby').hidden }))));
  notes.push(`room ${code}: host sees ${lob[0].peers}, guest sees ${lob[1].peers}`);
  if (lob[0].peers !== 2 || lob[1].peers !== 2) fails.push(`lobby: expected 2 players on both phones, got host ${lob[0].peers} / guest ${lob[1].peers}`);
  // 2. host starts; both play their own darts until the match ends on both phones
  if (LEGS > 1) await host.evaluate(l => { try { const el = [...$('mpLegs').children].find(x => +x.dataset.v === l); if (el) el.click(); } catch (e) {} }, LEGS);
  await host.evaluate(([st, lg]) => { const _c = mpCfgOpts; mpCfgOpts = function () { return Object.assign(_c.apply(this, arguments), { start: st, legs: lg }); }; onlineStart(); mpCfgOpts = _c; }, [+process.env.START || 101, LEGS]); await host.waitForTimeout(1500);   // 101 keeps a full match inside the time budget; START=501 for the real thing
  const vlog = { Alpha: [], Bravo: [] };
  for (const p of [host, guest]) await p.evaluate(() => { window.__vl = []; const _vr = visitReceipt; visitReceipt = function () { const r = _vr.apply(this, arguments); try { const R = S.lastRec || {}; const who = S.p[R.who != null ? R.who : S.cur]; window.__vl.push([who && who.name, R.tot, S.p.map(q => q.name + '=' + q.score).sort().join('/')]); } catch (e) {} return r; }; });
  if (process.env.DBG) { await host.waitForTimeout(15000); console.log('  dbg', JSON.stringify(await Promise.all([host, guest].map(p => p.evaluate(() => S && { bull: S.bull, busy: S.busy, cur: S.cur, dart: S.dart, v: S.visit.length, me: S.p.findIndex(q => q.key === NET.myId), keys: S.p.map(q => q.key), my: NET.myId, mode: ui.mode, q: NET.queue.length, qs: NET.queue.slice(0,2), intro: $('intro').classList.contains('show'), netAnim: S.netAnim, busyLeg: S.busyLeg, seen: Object.keys(NET.seen).length }))))); }
  const t0 = Date.now(); let st = ['', ''];
  while (Date.now() - t0 < (+process.env.TMAX || 360000)) {
    st = await Promise.all([host, guest].map(p => p.evaluate(() => { try {
      if (!S) return 'nomatch'; if (S.done) return 'done';
      const me = S.p.findIndex(q => q.key === NET.myId);
      const thr = (x, y) => { S.busy = true; S.flyHit = false; S.boNext = false; S.slip = false; netSend('dart', { bo: 0, x: +x.toFixed(2), y: +y.toFixed(2), dart: S.dart, leg: legsPlayed(), aim: scoreAt(S.aim.x, S.aim.y).label, slip: 0, fly: 0 }); land(x, y); };   // the same send the release handler makes (game4.js ~1486)
      if (S.bull) { if (S.cur === me && !S.busy) thr(gauss() * 30, gauss() * 30); return 'bull'; }
      if (S.cur === me && !S.busy && S.visit.length < 3) { const pl = S.p[me]; const lbl = aimFor(pl.score, 4 - S.dart); const t = targetPoint(lbl); thr(t.x + gauss() * 14, t.y + gauss() * 14); }
      return 'play'; } catch (e) { return 'ERR ' + e.message; } }).catch(e => 'ERR ' + e.message)));
    if (st.every(s => s === 'done') || st.some(s => s.startsWith('ERR'))) break; if (process.env.DBG && (Date.now()-t0) % 15000 < 120) console.log('  dbg', JSON.stringify(await Promise.all([host, guest].map(p => p.evaluate(() => S && { bull: S.bull, busy: S.busy, cur: S.cur, dart: S.dart, v: S.visit.length, me: S.p.findIndex(q => q.key === NET.myId), keys: S.p.map(q => q.key), my: NET.myId, mode: ui.mode }))))); await host.waitForTimeout(60); }
  const res = await Promise.all([host, guest].map(p => p.evaluate(() => ({ done: !!(S && S.done), legs: S ? S.p.map(q => q.legs) : null, names: S ? S.p.map(q => q.name) : null, scores: S ? S.p.map(q => q.score) : null, vl: window.__vl || [], vlog: S ? Object.fromEntries(S.p.map(q => [q.name, (q.vlog || []).join(',')])) : {} }))));
  if (process.env.DBG) { console.log('  HOSTLOG', JSON.stringify(res[0].vl)); console.log('  GUESTLOG', JSON.stringify(res[1].vl)); console.log('  END', JSON.stringify(await Promise.all([host, guest].map(p => p.evaluate(() => S && { cur: S.cur, busy: S.busy, dart: S.dart, v: S.visit.length, netAnim: S.netAnim, q: NET.queue.length, qs: NET.queue.slice(0,3).map(m => [m.from.slice(0,4), m.dart, m.leg]), scores: S.p.map(q => q.name + '=' + q.score), intro: $('intro').classList.contains('show'), busyLeg: S.busyLeg, now: Math.round(performance.now()), arm: S.oppArm, fl: (window.__fl || []).slice(-3), ld: (window.__ld || []).slice(-4), cine: document.body.classList.contains('lk-cine') }))))); }
  notes.push(`match: host ${JSON.stringify({ legs: res[0].legs, names: res[0].names })} · guest ${JSON.stringify({ legs: res[1].legs, names: res[1].names })} · visits ${res[0].vl.length}/${res[1].vl.length} · states ${st.join('/')}`);
  if (!res[0].done || !res[1].done) fails.push(`match did not finish on both phones within 6 min (host ${st[0]}, guest ${st[1]})`);
  else if (JSON.stringify(res[0].legs) !== JSON.stringify([...res[1].legs].reverse())) fails.push(`legs differ: host ${res[0].legs} vs guest ${res[1].legs}`);
  // each player's visit totals (me.vlog, written once per finished visit) must be identical on both phones
  for (const nm of ['Alpha', 'Bravo']) { const a = res[0].vlog[nm], g = res[1].vlog[nm]; if (a !== g) fails.push(`${nm}'s visits differ between phones: host [${a}] vs guest [${g}]`); }
  notes.push('visit totals: ' + JSON.stringify(res[0].vlog));
  await host.screenshot({ path: path.resolve(__dirname, 'out/twoplayer_host_end.png') }).catch(() => {}); await guest.screenshot({ path: path.resolve(__dirname, 'out/twoplayer_guest_end.png') }).catch(() => {});
  // 3. leave mid-match: a fresh game, the guest quits after a few darts, the host must be told and not hang
  await host.evaluate(() => { try { onlineStart(); } catch (e) {} }); await host.waitForTimeout(3000);
  await guest.evaluate(() => onlineLeave()); await host.waitForTimeout(8000);
  const left = await host.evaluate(() => ({ done: !!(S && S.done), msg: (document.body.innerText.match(/left|quit|dropped|disconnect/i) || [])[0] || '' }));
  notes.push(`guest left mid-match: host ${JSON.stringify(left)}`);
  if (!left.done && !left.msg) fails.push('guest left mid-match: the host was not told (match still running, no message)');
  pages.forEach(p => { if (p.__errs.length) fails.push(`${p.__name} page errors: ${[...new Set(p.__errs)].slice(0, 3).join(' | ')}`); });
  await b.close(); notes.forEach(n => console.log('  ' + n));
  if (fails.length) { console.log('twoplayer: FAIL\n- ' + fails.join('\n- ')); process.exit(1); } console.log('twoplayer: all checks passed');
})();
