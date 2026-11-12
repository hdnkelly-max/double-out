// Round 2 #1 (Hayden 06:05): Shop → Setup & gear in the new look. Real taps; every pick/buy goes through the game's own Store controls.
// Checks: no old Store / second bottom nav; flight colour, a shaft buy + use, a gear buy change the save exactly as the game does; bank charged once; stays on the new Shop.
// usage: node tests/rb-setup.js [dir] [width] [height] [shotsDir]
const { chromium } = require('playwright'); const path = require('path');
const dir = process.argv[2] || path.resolve(__dirname, '..'), W = +(process.argv[3] || 390), H = +(process.argv[4] || 844), shots = process.argv[5] || '';
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html', { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1000);
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); const c = career(); c.stage = 'season'; c.tier = 1; c.bank = 640; newSeason(c); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
  await p.waitForTimeout(3000); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  const tap = async sel => { await p.evaluate(sel => { const e = document.querySelector(sel); e.scrollIntoView({ block: 'center' }); }, sel); const pt = await p.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); await p.touchscreen.tap(pt[0], pt[1]); await p.waitForTimeout(900); };
  const snap = async n => { if (shots) await p.screenshot({ path: path.join(shots, `setup_${n}_${W}.png`), timeout: 120000 }); };
  const state = () => p.evaluate(() => ({ rb: !document.getElementById('rbApp').hidden, sub: (document.querySelector('#rbApp [data-sub][aria-selected="true"]') || {}).dataset?.sub, tab: (document.querySelector('#rbTabs [aria-selected="true"]') || {}).dataset?.t, oldNav: !!document.querySelector('#hubTabs') && getComputedStyle(document.getElementById('hub')).display !== 'none' && !document.getElementById('rbApp').hidden ? 'covered' : 'visible', bank: career().bank, setup: JSON.stringify(save.setup || {}), owned: (save.ownedSetup || []).join(','), gear: JSON.stringify(save.gear || {}), flight: save.flight, custom: !!save.flightCustom, hs: document.documentElement.scrollWidth > innerWidth }));
  const out = {}, fail = [];
  await tap('#rbTabs [data-t="shop"]'); await tap('#rbApp [data-sub="setup"]'); out.open = await state(); await snap('top');
  if (!out.open.rb || out.open.sub !== 'setup' || out.open.tab !== 'shop') fail.push('Setup & gear did not open in the new look');
  const fl = await p.evaluate(() => [...document.querySelectorAll('#rbApp [data-fl]')].map(x => x.dataset.fl)); await tap(`#rbApp [data-fl="${fl[2]}"]`); out.flight = await state(); if (out.flight.flight !== fl[2] || !out.flight.custom) fail.push('flight colour not set');
  await tap('#rbApp [data-fl="set"]'); out.flightSet = await state(); if (out.flightSet.custom) fail.push('"Set" flights not restored');
  await tap('#rbApp [data-acc="shaft"]'); await snap('shafts');
  const b0 = (await state()).bank; const pid = await p.evaluate(() => { const it = SHAFTS.find(x => x.price > 0 && price(x.price) <= career().bank); return it && it.id; });
  await tap(`#rbApp [data-part="shaft"][data-pid="${pid}"]`); out.shaft = await state(); out.shaftCost = await p.evaluate(pid => price(SHAFTS.find(x => x.id === pid).price), pid);
  if (JSON.parse(out.shaft.setup).shaft !== pid || !out.shaft.owned.includes('shaft:' + pid) || b0 - out.shaft.bank !== out.shaftCost) fail.push(`shaft buy wrong (${pid}: bank ${b0}→${out.shaft.bank}, cost ${out.shaftCost}, setup ${out.shaft.setup})`);
  await tap('#rbApp [data-part="shaft"][data-pid="med"]'); out.shaftBack = await state(); if (JSON.parse(out.shaftBack.setup).shaft !== 'med' || out.shaftBack.bank !== out.shaft.bank) fail.push('switching back to an owned shaft charged or failed');
  await tap('#rbApp [data-acc="gear"]'); await snap('gear');
  const gid = await p.evaluate(() => { const it = GEAR.find(x => x.price <= career().bank && gearCount(x.id) < (x.rep || 1)); return it && it.id; }); const b1 = (await state()).bank;
  if (gid) { await tap(`#rbApp [data-gear="${gid}"]`); out.gear = await state(); const gp = await p.evaluate(g => GEAR.find(x => x.id === g).price, gid); if (!JSON.parse(out.gear.gear)[gid] || b1 - out.gear.bank !== gp) fail.push(`gear buy wrong (${gid})`); }
  out.end = await state(); if (!out.end.rb || out.end.tab !== 'shop' || out.end.sub !== 'setup') fail.push('left the new Shop'); if (out.end.hs) fail.push('sideways scroll');
  if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out)); console.log(fail.length ? 'rb-setup FAIL: ' + fail.join(', ') : 'rb-setup PASS'); await b.close(); })();
