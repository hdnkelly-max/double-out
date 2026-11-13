// EXP-SETUP chips (Hayden 14:29 "finish chips first"): a part row says what your part gives against the default part (the game's own kitPts),
// nothing for the default part; Gear says how many items you can buy now, nothing when you can't afford any; the save is untouched by reading.
// usage: node tests/rb-setchips.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html', { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_RB, null, { timeout: 180000 }); await p.waitForTimeout(1000);
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); const c = career(); c.stage = 'season'; c.tier = 1; c.bank = 640; newSeason(c); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
  await p.waitForTimeout(4000); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); document.querySelector('#rbTabs [data-t="shop"]').click(); });
  await p.waitForTimeout(800); await p.evaluate(() => document.querySelector('#rbApp [data-sub="setup"]').click()); await p.waitForTimeout(800);
  const chips = () => p.evaluate(() => { const g = k => { const b = document.querySelector(`#rbApp [data-acc="${k}"] .rb-chip`); return b ? b.textContent : ''; }; return { shaft: g('shaft'), point: g('point'), gear: g('gear'), flight: g('flight') }; });
  const r = {}; r.start = await chips();
  r.setup0 = await p.evaluate(() => JSON.stringify(save.setup));
  r.long = await p.evaluate(() => { save.setup = Object.assign({}, save.setup, { shaft: 'long' }); (save.ownedSetup = save.ownedSetup || []).push('shaft:long'); TOPS_RB.render(); return JSON.stringify(save.setup); });
  r.afterLong = await chips();
  r.kit = await p.evaluate(() => { const A = TOPS_ST2_API, now = A.kitPts(); const ss = save.setup; save.setup = Object.assign({}, ss, { shaft: 'med' }); const base = A.kitPts(); save.setup = ss; const out = {}; A.STATS.forEach(x => { const d = (now[x.id] || 0) - (base[x.id] || 0); if (d) out[x.n] = d; }); return out; });
  r.setupAfterRead = await p.evaluate(() => JSON.stringify(save.setup));
  await p.setViewportSize({ width: 360, height: 640 }); await p.evaluate(() => TOPS_RB.render());
  r.fit360 = await p.evaluate(() => { const c = document.querySelector('#rbApp [data-acc="shaft"] .rb-chip'), a = document.querySelector('#rbApp [data-acc="shaft"]'); if (!c) return 'no chip'; const cr = c.getBoundingClientRect(), ar = a.getBoundingClientRect(); return document.documentElement.scrollWidth <= innerWidth && cr.right <= ar.right && cr.left >= ar.left && c.scrollWidth <= c.clientWidth + 1 ? 'ok' : JSON.stringify([cr.left, cr.right, ar.left, ar.right, document.documentElement.scrollWidth]); });
  r.mixedCls = await p.evaluate(() => { const c = document.querySelector('#rbApp [data-acc="shaft"] .rb-chip'); return c ? c.className + '|' + !!c.querySelector('.rb-up') : ''; });
  await p.setViewportSize({ width: 390, height: 844 });
  r.broke = await p.evaluate(() => { career().bank = 12; TOPS_RB.render(); const b = document.querySelector('#rbApp [data-acc="gear"] .rb-chip'); return b ? b.textContent : ''; });
  const fail = [];
  if (r.start.shaft || r.start.point) fail.push('default parts should have no chip ' + JSON.stringify(r.start));
  if (!/^\d+ new$/.test(r.start.gear)) fail.push('gear chip ' + r.start.gear); if (!/owned/.test(r.start.flight)) fail.push('flights chip ' + r.start.flight);
  // a trade-off shows both sides (biggest gain · biggest cost), so the cost is never hidden
  const ks = Object.entries(r.kit).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])), up = ks.find(x => x[1] > 0), dn = ks.find(x => x[1] < 0), f = x => (x[1] > 0 ? '+' : '−') + Math.abs(x[1]) + ' ' + x[0].toLowerCase();
  const want = up && dn ? f(up) + ' · ' + f(dn) : up ? f(up) : dn ? f(dn) : '';
  if (r.afterLong.shaft !== want) fail.push(`long shaft chip "${r.afterLong.shaft}" want "${want}"`); if (r.setupAfterRead !== r.long) fail.push('reading the chips changed the save');
  if (r.fit360 !== 'ok') fail.push('mixed chip does not fit at 360: ' + r.fit360); if (up && dn && !/rb-x\|true/.test(r.mixedCls)) fail.push('mixed chip style ' + r.mixedCls);
  if (r.broke) fail.push('gear chip shown with $12: ' + r.broke); if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 150));
  console.log(JSON.stringify(r)); console.log(fail.length ? 'rb-setchips FAIL: ' + fail.join('; ') : 'rb-setchips PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
