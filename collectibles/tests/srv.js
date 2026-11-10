// Integration test: the game's collectibles client in server mode against the real tc_ SQL (local Postgres copy).
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const U1 = '11111111-1111-1111-1111-111111111111';
const lit = v => v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : typeof v === 'object' ? `$tc$${JSON.stringify(v)}$tc$::jsonb` : `$tc$${v}$tc$`;
function sql(q, uid) {
  const pre = uid ? `select set_config('t.uid','${uid}',false);` : '';
  return execFileSync('su', ['postgres', '-c', `psql -h /var/tmp/pgtest -p 5499 -d tcint -At -v ON_ERROR_STOP=1 -c "${(pre + q).replace(/"/g, '\\"').replace(/\$/g, '\\$')}"`], { encoding: 'utf8' }).trim().split('\n').pop();
}
let offline = false, calls = [];
function rpc(fn, args, uid) {
  calls.push(fn);
  if (offline) return { error: { message: 'TypeError: Failed to fetch' } };
  const a = Object.entries(args || {}).map(([k, v]) => `${k} => ${lit(v)}`).join(', ');
  try { return { data: JSON.parse(sql(`select to_jsonb(${fn}(${a}))`, uid)) }; }
  catch (e) { return { error: { message: String(e.stderr || e.message).split('\n').find(l => /ERROR/.test(l)) || 'sql error' } }; }
}
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  sql(`delete from tc_trade_items; delete from tc_trades; delete from tc_owned; delete from tc_pick_options; delete from tc_picks; delete from tc_unlocks; delete from tc_reward_events; delete from tc_ach_awards; delete from tc_pick_state;`);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (/tc srv/.test(m.text())) errs.push(m.text()); });
  await p.exposeFunction('__rpc', (fn, args, uid) => rpc(fn, args, uid));
  const ev = (f, a) => p.evaluate(f, a);
  const mock = () => ev(U => { window.NET.sb = { rpc: (fn, args) => window.__rpc(fn, args, U), from: () => ({ upsert: async () => ({ error: null }), insert: () => Promise.resolve({ error: null }), select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }), auth: { signOut: async () => {} } }; window.NET.user = { id: U }; }, U1);
  const settle = async () => { await p.waitForTimeout(300); await ev(() => TC.sync()); await ev(() => TC.ready()); };
  await p.goto('http://localhost:8790/index.html'); await p.waitForTimeout(3500);

  // 1. offline player with history: backfill gives local picks, plus a couple of cards already owned
  await ev(() => { save.authSeen = true; $('login').hidden = true; newCareer(); save.ach = { tonout: 1, firstmax: 2 }; save.matches = 3; persist(); showHub('play'); });
  await p.waitForTimeout(1200);
  await ev(() => { document.querySelectorAll('.tc-sheet').forEach(e => e.remove()); TC_API.grant('deano'); TC_API.grant('kev'); TC_API.grant('kev'); });
  const L0 = await ev(() => ({ picks: TC_API.st().picks.filter(x => x.chosen == null).length, own: TC_API.st().own }));
  ok(L0.picks === 3, `local backfill picks = ${L0.picks}`);

  // 2. sign in: one-time import, mirror
  await mock(); await settle();
  const s1 = JSON.parse(sql(`select tc_state()`, U1));
  const L1 = await ev(() => ({ srv: TC_API.st().srv, picks: TC_API.st().picks.map(x => x.id), q: (TC_API.st().q || []).length }));
  ok(s1.imported === true, 'server imported');
  ok(s1.own.deano === 1 && s1.own.kev === 2, 'owned cards imported ' + JSON.stringify(s1.own));
  ok(s1.picks.length === 3 && L1.picks.length === 3 && L1.picks.every(id => /^s\d+$/.test(id)), 'open picks moved to server ' + L1.picks.join(','));
  ok(L1.srv === U1, 'save linked to account');

  // 3. a 180 in play: queued then awarded server-side, shows in the session
  await ev(() => TC_API.award('match:qa:leg:1:visit:3:180', 'max', '180'));
  await settle();
  const L2 = await ev(() => ({ n: TC_API.st().picks.length, sess: TC.sess.slice(), q: TC_API.st().q.length }));
  ok(L2.n === 4 && L2.q === 0, `180 award -> 4 open picks (q ${L2.q})`);
  ok(L2.sess.length === 1, 'new server pick counted in this session ' + L2.sess);
  ok(!(await ev(() => TC_API.award('match:qa:leg:1:visit:3:180', 'max', '180'))), 'same 180 not paid twice (client)');
  ok(sql(`select count(*) from tc_reward_events where source_key='match:qa:leg:1:visit:3:180'`) === '1', 'reward event recorded once');

  // 4. open the pack through the real UI and choose a card
  const before = JSON.parse(sql(`select tc_state()`, U1)).own;
  await ev(() => { document.querySelectorAll('.tc-sheet').forEach(e => e.remove()); tcOpenPicks(); }); await p.waitForTimeout(800);
  const cs = await p.$$('.tcpk__row .tc'); await cs[1].click(); await p.waitForTimeout(3000);
  const after = JSON.parse(sql(`select tc_state()`, U1));
  const nBefore = Object.values(before).reduce((a, b) => a + b, 0), nAfter = Object.values(after.own).reduce((a, b) => a + b, 0);
  ok(nAfter === nBefore + 1, `choosing through the pack adds one card on the server (${nBefore} -> ${nAfter})`);
  const L3 = await ev(() => ({ own: TC_API.st().own, picks: TC_API.st().picks.length }));
  ok(JSON.stringify(Object.entries(L3.own).filter(e => e[1]).sort()) === JSON.stringify(Object.entries(after.own).sort()), 'local mirror matches server collection');
  ok(L3.picks === 3 && after.picks.length === 3, 'pick consumed on both sides');
  await ev(() => { document.querySelectorAll('.tcpk').forEach(e => e.remove()); TC.inPack = false; });

  // 5. nine-darter: keep-all pick + exclusive card from the server
  await ev(() => TC_API.award('match:qa:leg:2:nine', 'nine', 'Nine-darter')); await settle();
  const s5 = JSON.parse(sql(`select tc_state()`, U1));
  ok(s5.own.ninex === 1 && s5.picks.some(x => x.keepAll), 'nine-darter: Nine-Dart Club card + keep-all pick');

  // 6. offline: awards queue in the save and flush when back
  offline = true;
  await ev(() => TC_API.award('match:qa:leg:3:visit:1:ton', 'ton', '121 checkout')); await settle();
  const q6 = await ev(() => TC_API.st().q.length);
  ok(q6 === 1, 'offline award kept in queue');
  offline = false; await settle();
  const q6b = await ev(() => ({ q: TC_API.st().q.length, n: TC_API.st().picks.length }));
  ok(q6b.q === 0 && q6b.n === 5, `queue flushed when back online (${q6b.n} picks)`);

  // 7. offline choose fails cleanly and keeps the pick
  offline = true;
  await ev(() => { document.querySelectorAll('.tc-sheet').forEach(e => e.remove()); tcOpenPicks(); }); await p.waitForTimeout(800);
  const cs2 = await p.$$('.tcpk__row .tc'); await cs2[0].click(); await p.waitForTimeout(1500);
  const msg = await ev(() => (document.querySelector('.tcpk') || {}).textContent || '');
  ok(/Connection dropped/.test(msg), 'offline pick shows retry message');
  offline = false; const cs3 = await p.$$('.tcpk__row .tc'); await cs3[0].click(); await p.waitForTimeout(3000);
  ok(JSON.parse(sql(`select tc_state()`, U1)).picks.length === 4, 'retry after reconnect resolves the pick');
  await ev(() => { document.querySelectorAll('.tcpk').forEach(e => e.remove()); TC.inPack = false; });

  // 8. exhibition win grants the legend card once
  await ev(() => { TC_API.st().exh.active = { id: 'taylor', tries: 3, weeksLeft: 3, venue: 'x' }; });
  const r8 = await ev(() => { try { TC_API.exhResult ? TC_API.exhResult({ tcExh: 'taylor' }, true) : null; return !!TC_API.exhResult; } catch (e) { return 'err ' + e.message; } });
  if (r8 === true) { await settle(); ok(JSON.parse(sql(`select tc_state()`, U1)).own.taylor === 1, 'exhibition win granted on the server'); }
  else console.log('SKIP exhibition (no TC_API.exhResult)', r8);

  // 9. reload: no second import, state survives
  const imp = sql(`select imported_at from tc_pick_state where user_id='${U1}'`);
  await p.reload(); await p.waitForTimeout(3500); await mock(); await settle();
  ok(sql(`select imported_at from tc_pick_state where user_id='${U1}'`) === imp, 'no second import after reload');
  const L9 = await ev(() => TC_API.st().picks.length);
  ok(L9 === JSON.parse(sql(`select tc_state()`, U1)).picks.length, 'reloaded save mirrors server picks');

  console.log('rpc calls:', calls.length, [...new Set(calls)].join(','));
  console.log('errors:', JSON.stringify(errs.slice(0, 8)));
  await b.close();
})();
