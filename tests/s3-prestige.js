// CAR-PRESTIGE shop (Producer 22 Nov 07:03, decided with ChatGPT): a title at a level unlocks that level's premium edition, the trophy on the
// shelf is the free proof, buying is cosmetic and one-off and never takes the bank below the next entry fee.
//   1 locked until a title at that level (the Worlds edition needs the World Championship itself); kit-art editions (Club, Opens) aren't sold yet
//   2 a title + the money: bought, the bank drops by exactly the price, the edition is owned and worn (your darts wear it: TOPS_GEAR)
//   3 the floor: a purchase that would leave less than the next entry fee is refused, the bank unchanged
//   4 cosmetic only: setupBaseMult / setupTolMult / setupSwayMult (the throw maths) are identical with and without the edition
//   5 wear / take off; owned and worn survive a reload
//   6 page: Locker > Trophies shows the edition row under the level: locked line, then Buy (two taps), then Take off; captures at 390 and 360
// usage: node tests/s3-prestige.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const dir = process.argv[2] || path.resolve(__dirname, '..');
const f = []; const out = {}; fs.mkdirSync(path.join(dir, 'wip/car-prestige'), { recursive: true });
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); const url = 'file://' + path.join(dir, 'index.html') + '?s3=1&s3x=1';
  await p.goto(url); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TOPS_PRESTIGE, null, { timeout: 180000 }); await p.waitForTimeout(2500);
  out.e = await p.evaluate(() => { const o = {}; const P = TOPS_PRESTIGE; save.authSeen = true; $('login').hidden = true; save.name = 'Hayden'; newCareer(); const c = career(), k = c.circuit; c.bank = 100; persist();
    o.lock = P.state('pub'); o.lockBuy = P.buy('pub');
    k.history.push({ week: 1, id: 'kauri_cup', n: 'Kauri Cup', level: 0, fin: 'W', prize: 400, pts: 75 });
    o.poor = P.state('pub'); o.poorBuy = P.buy('pub'); o.bankPoor = c.bank;
    const fee = P.floorFee(c); o.fee = fee; c.bank = 250 + fee - 1; o.floorBuy = P.buy('pub'); o.bankFloor = c.bank;
    const m0 = [setupBaseMult(), setupTolMult(), setupSwayMult()].map(v => JSON.stringify(v));
    c.bank = 250 + fee; o.buy = P.buy('pub'); o.bankAfter = c.bank; o.owned = P.state('pub'); o.gear = TOPS_GEAR() && TOPS_GEAR().id;
    const m1 = [setupBaseMult(), setupTolMult(), setupSwayMult()].map(v => JSON.stringify(v)); o.cosmetic = JSON.stringify(m0) === JSON.stringify(m1); o.m = m0;
    o.again = P.buy('pub'); o.club = P.buy('club');
    k.history.push({ week: 60, id: 'pc_1', n: 'Players Championship', level: 6, fin: 'W', prize: 0, pts: 0 }); o.worldsNo = P.state('worlds').won;
    k.history.push({ week: 104, id: 'worlds', n: 'World Championship', level: 6, fin: 'W', prize: 0, pts: 0 }); o.worldsYes = P.state('worlds').won;
    o.off = P.wear(null); o.gearOff = TOPS_GEAR(); o.on = P.wear('pub'); o.wearNot = P.wear('dpnz');
    persist(); return o; });
  const e = out.e;
  if (e.lock.won || e.lockBuy.ok) f.push('1 locked without a title ' + JSON.stringify([e.lock, e.lockBuy]));
  if (e.poorBuy.ok || e.bankPoor !== 100) f.push('2 not enough money must refuse ' + JSON.stringify([e.poorBuy, e.bankPoor]));
  if (e.floorBuy.ok || e.bankFloor !== 250 + e.fee - 1) f.push('3 the floor: never below the next entry fee ' + JSON.stringify([e.floorBuy, e.fee]));
  if (!e.buy.ok || e.bankAfter !== e.fee || !e.owned.owned || !e.owned.worn || e.gear !== 'pub') f.push('2 buy: price taken exactly, owned and worn ' + JSON.stringify([e.buy, e.bankAfter, e.fee, e.owned, e.gear]));
  if (!e.cosmetic) f.push('4 the edition changed the throw maths ' + JSON.stringify(e.m));
  if (e.again.ok || e.club.ok || !/sale/.test(e.club.why)) f.push('1 no double buy; Club shirt not on sale yet ' + JSON.stringify([e.again, e.club]));
  if (e.worldsNo || !e.worldsYes) f.push('1 the Worlds edition needs the World Championship ' + JSON.stringify([e.worldsNo, e.worldsYes]));
  if (!e.off.ok || e.gearOff || !e.on.ok || e.wearNot.ok) f.push('5 wear / take off ' + JSON.stringify([e.off, e.gearOff, e.on, e.wearNot]));
  await p.reload(); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TOPS_PRESTIGE, null, { timeout: 180000 }); await p.waitForTimeout(2500);
  out.reload = await p.evaluate(() => { const s = TOPS_PRESTIGE.state('pub'); return { owned: s.owned, worn: s.worn, gear: TOPS_GEAR() && TOPS_GEAR().id }; });
  if (!out.reload.owned || !out.reload.worn || out.reload.gear !== 'pub') f.push('5 owned and worn survive a reload ' + JSON.stringify(out.reload));
  // 6 page: the shelf row. A fresh title at the Club level (not bought) shows Buy; the Pub row shows Take off
  const shelf = async () => { await p.evaluate(() => { const k = career().circuit; k.level = 1; career().tier = 1; k.history.push({ week: 8, id: 'club_open', n: 'Club Open', level: 1, fin: 'W', prize: 0, pts: 0 }); career().bank = 50000; persist(); try { showHub('play'); } catch (e) {} }); await p.waitForTimeout(1800);
    await p.evaluate(() => { const ch = document.querySelector('[data-s3="troph"]'); if (ch) ch.click(); }); await p.waitForTimeout(1500);
    return p.evaluate(() => ({ rows: [...document.querySelectorAll('[data-edrow]')].map(r => r.innerText.replace(/\s+/g, ' ')) })); };
  out.shelf = await shelf();
  // the Club edition isn't on sale (kit art), so test the buy flow on DPNZ: give a DPNZ title and redraw the shelf
  out.buyFlow = await p.evaluate(async () => { const k = career().circuit; k.level = 3; career().tier = 3; k.history.push({ week: 20, id: 'dpnz_1', n: 'DPNZ', level: 3, fin: 'W', prize: 0, pts: 0 }); persist();
    const ch = document.querySelector('[data-s3="trback"]'); try { showHub('play'); } catch (e) {} await new Promise(r => setTimeout(r, 1500)); const t = document.querySelector('[data-s3="troph"]'); if (t) t.click(); await new Promise(r => setTimeout(r, 1500));
    const row = () => document.querySelector('[data-edrow="3"]'); const r0 = row() && row().innerText.replace(/\s+/g, ' '); const b0 = career().bank;
    const btn = row() && row().querySelector('[data-ed-buy]'); if (btn) btn.click(); await new Promise(r => setTimeout(r, 200)); const r1 = row() && row().innerText.replace(/\s+/g, ' ');
    const btn2 = row() && row().querySelector('[data-ed-buy]'); if (btn2) btn2.click(); await new Promise(r => setTimeout(r, 300)); const r2 = row() && row().innerText.replace(/\s+/g, ' ');
    return { r0, r1, r2, paid: b0 - career().bank, gear: TOPS_GEAR() && TOPS_GEAR().id }; });
  for (const [w, h] of [[390, 844], [360, 640]]) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(400); await p.evaluate(() => { const r = document.querySelector('[data-edrow="3"]'); if (r) r.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(300); await p.screenshot({ path: path.join(dir, `wip/car-prestige/shop-${w}.png`) }); }
  const bf = out.buyFlow;
  if (!/Buy · \$5,000/i.test(bf.r0 || '') || !/Tap again to buy/i.test(bf.r1 || '') || !/Take off/i.test(bf.r2 || '') || bf.paid !== 5000 || bf.gear !== 'dpnz') f.push('6 shelf buy flow ' + JSON.stringify(bf));
  if (!out.shelf.rows.some(r => /Kauri Arms flights/i.test(r) && /Take off/i.test(r)) || !out.shelf.rows.some(r => /Club shirt/i.test(r) && /new kits/i.test(r))) f.push('6 shelf rows ' + JSON.stringify(out.shelf));
  if (pe.length) f.push('page errors ' + pe.slice(0, 2).join(' | '));
  await b.close();
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out).slice(0, 1500)); process.exit(1); }
  console.log(`PASS: locked until a title at the level (Worlds needs the World Championship); not enough money and the entry-fee floor ($${e.fee}) refuse with the bank untouched; a buy takes exactly the price, the edition is owned and on your darts; the throw maths are identical with it on; no double buy, Club shirt not on sale yet; wear/take off; owned and worn survive a reload; the trophy shelf row goes "${bf.r0}" → "${bf.r1}" → "${bf.r2}" ($${bf.paid}); captures shop-390/360`);
})();
