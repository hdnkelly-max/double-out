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
  await tap('#rbApp [data-acc="flight"]'); await snap('flights'); const fl = await p.evaluate(() => [...document.querySelectorAll('#rbApp [data-fl]')].map(x => x.dataset.fl)); await tap(`#rbApp [data-fl="${fl[2]}"]`); out.flight = await state(); if (out.flight.flight !== fl[2] || !out.flight.custom) fail.push('flight colour not set');
  await tap('#rbApp [data-fl="set"]'); out.flightSet = await state(); if (out.flightSet.custom) fail.push('"Set" flights not restored');
  await tap('#rbApp [data-acc="shaft"]'); await snap('shafts');
  const b0 = (await state()).bank; const pid = await p.evaluate(() => { const it = SHAFTS.find(x => x.price > 0 && price(x.price) <= career().bank && !TOPS_GATE.gatePart('shaft', x.id)); return it && it.id; });
  await tap(`#rbApp [data-part="shaft"][data-pid="${pid}"]`); out.shaft = await state(); out.shaftCost = await p.evaluate(pid => price(SHAFTS.find(x => x.id === pid).price), pid);
  if (JSON.parse(out.shaft.setup).shaft !== pid || !out.shaft.owned.includes('shaft:' + pid) || b0 - out.shaft.bank !== out.shaftCost) fail.push(`shaft buy wrong (${pid}: bank ${b0}→${out.shaft.bank}, cost ${out.shaftCost}, setup ${out.shaft.setup})`);
  await tap('#rbApp [data-part="shaft"][data-pid="med"]'); out.shaftBack = await state(); if (JSON.parse(out.shaftBack.setup).shaft !== 'med' || out.shaftBack.bank !== out.shaft.bank) fail.push('switching back to an owned shaft charged or failed');
  await tap('#rbApp [data-acc="gear"]'); await snap('gear');
  const gid = await p.evaluate(() => { const it = GEAR.find(x => x.price <= career().bank && gearCount(x.id) < (x.rep || 1)); return it && it.id; }); const b1 = (await state()).bank;
  if (gid) { await tap(`#rbApp [data-gear="${gid}"]`); out.gear = await state(); const gp = await p.evaluate(g => GEAR.find(x => x.id === g).price, gid); if (!JSON.parse(out.gear.gear)[gid] || b1 - out.gear.bank !== gp) fail.push(`gear buy wrong (${gid})`); }
  // double tap (ChatGPT P1): two events on the same buy before the redraw, then a second real tap 120 ms later: exactly one charge each time
  await tap('#rbApp [data-acc="point"]');
  const dbl = await p.evaluate(() => { const it = POINTS.find(x => x.price > 0 && !(save.ownedSetup || []).includes('point:' + x.id) && price(x.price) <= career().bank && !TOPS_GATE.gatePart('point', x.id)); if (!it) return null; const b0 = career().bank; const b = document.querySelector(`#rbApp [data-part="point"][data-pid="${it.id}"]`); b.click(); b.click(); return { id: it.id, cost: price(it.price), b0 }; });
  if (dbl) { await p.waitForTimeout(600); dbl.b1 = await p.evaluate(() => career().bank); }
  if (dbl) { out.dbl = dbl; if (dbl.b0 - dbl.b1 !== dbl.cost) fail.push(`double tap charged ${dbl.b0 - dbl.b1}, expected ${dbl.cost}`); }
  await tap('#rbApp [data-acc="gear"]');
  const rep = await p.evaluate(() => { const it = GEAR.find(x => (x.rep || 1) > 1 && gearCount(x.id) < x.rep && x.price <= career().bank); if (!it) return null; return { id: it.id, price: it.price, n0: gearCount(it.id), b0: career().bank }; });
  if (rep) { const sel = `#rbApp [data-gear="${rep.id}"]`; out.repClick = await p.evaluate(sel => { const b = document.querySelector(sel); if (!b) return { found: false, open: (document.querySelector('#rbApp [aria-expanded="true"]') || {}).dataset?.acc }; const b0 = career().bank; b.click(); const b1 = career().bank; b.click(); return { found: true, dis: b.getAttribute('aria-disabled'), b0, b1, b2: career().bank, msg: (document.querySelector('#rbApp [role="status"]') || {}).textContent }; }, sel); await p.waitForTimeout(120); await tap(sel);
    const r2 = await p.evaluate(id => ({ n1: gearCount(id), b1: career().bank }), rep.id); out.rep = { ...rep, ...r2 };
    if (r2.n1 - rep.n0 !== 1 || rep.b0 - r2.b1 !== rep.price) fail.push(`repeatable gear double tap: +${r2.n1 - rep.n0} bought, charged ${rep.b0 - r2.b1}`); }
  // refused buy (ChatGPT P1): something you can't afford never charges and the player sees the outcome on the new Shop
  const ref = await p.evaluate(() => { const c = career(); const b0 = c.bank; c.bank = 1; TOPS_RB.render(); const b = [...document.querySelectorAll('#rbApp [data-gear]')].find(x => x.getAttribute('aria-disabled') === 'true' && /short/.test(x.textContent)); if (b) b.click(); const r = { b1: career().bank, msgShort: /short/.test(b ? b.textContent : '') }; c.bank = b0; TOPS_RB.render(); return r; });
  out.refused = ref; if (ref.b1 !== 1 || !ref.msgShort) fail.push('refused buy charged or showed no shortfall');
  await tap('#rbApp [data-acc="point"]'); await snap('points');
  const gl = await p.evaluate(() => { const k = Object.keys(TOPS_GATE.PART_LV).find(k => TOPS_GATE.gatePart(...k.split(':'))); if (!k) return null; const [key, id] = k.split(':'); const b = document.querySelector(`#rbApp [data-part="${key}"][data-pid="${id}"]`); return { k, shown: !!b, dis: b && b.getAttribute('aria-disabled'), txt: b && b.textContent.replace(/\s+/g, ' ').slice(-40) }; });
  out.gated = gl; if (gl && gl.shown && (gl.dis !== 'true' || !/Level \d+/.test(gl.txt))) fail.push('a level-locked part looks buyable');
  out.end = await state(); if (!out.end.rb || out.end.tab !== 'shop' || out.end.sub !== 'setup') fail.push('left the new Shop'); if (out.end.hs) fail.push('sideways scroll');
  if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out)); console.log(fail.length ? 'rb-setup FAIL: ' + fail.join(', ') : 'rb-setup PASS'); await b.close(); })();
