// EXP-S3C end-to-end: a brand-new Season 3 player on a 390 px phone, as a player taps it. One screenshot per screen (tests/e2e/NN_name.png).
// usage: node tests/s3-e2e.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const dir = process.argv[2] || path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'e2e'); fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true }); const p = await ctx.newPage();
  const pe = [], steps = [], notes = []; let loads = 0; p.on('pageerror', e => pe.push(e.message)); p.on('load', () => loads++);
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  let n = 0; const shot = async (name, what) => { n++; const f = String(n).padStart(2, '0') + '_' + name + '.png'; await p.screenshot({ path: path.join(OUT, f) }); steps.push(f + ': ' + what); };
  const vis = sel => p.evaluate(sel => { const e = document.querySelector(sel); return !!(e && e.getClientRects().length && !e.disabled && getComputedStyle(e).visibility !== 'hidden'); }, sel).catch(() => false);
  const tap = async sel => { for (let i = 0; i < 40 && !(await vis(sel)); i++) await p.waitForTimeout(250); if (!(await vis(sel))) { notes.push('missing ' + sel); return false; } await p.locator(sel).first().tap({ timeout: 8000 }).catch(e => notes.push('tap ' + sel + ': ' + e.message.split('\n')[0])); await p.waitForTimeout(900); return true; };
  const loaderGone = () => p.waitForFunction(() => { const l = document.getElementById('loading'); return !l || l.classList.contains('gone') || getComputedStyle(l).display === 'none'; }, null, { timeout: 60000 }).catch(() => {});
  const ready = async () => { await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3, null, { timeout: 180000 }); await loaderGone(); await p.waitForTimeout(1500); };
  const lifelike = () => p.evaluate(() => { const H = window.TOPS_S3_HAVE || []; const urls = []; document.querySelectorAll('*').forEach(e => { if (!e.getClientRects().length) return; const cs = getComputedStyle(e); const bg = cs.backgroundImage || ''; (bg.match(/url\("?([^")]+)/g) || []).forEach(u => urls.push(u.replace(/^url\("?/, ''))); if (e.tagName === 'IMG' && e.currentSrc) urls.push(e.currentSrc); });
    return [...new Set(urls.map(u => u.replace(/^file:\/\/[^?]*?\/(?=(assets|img|s3)\/)/, '')).filter(u => /^(assets|img)\//.test(u) && /\.(jpe?g|png|webp)/.test(u)))]; });
  const who = () => p.evaluate(() => { const r = []; document.querySelectorAll('*').forEach(e => { if (!e.getClientRects().length) return; const bg = getComputedStyle(e).backgroundImage || ''; const src = e.tagName === 'IMG' ? e.getAttribute('src') || '' : ''; if (/(^|[^3]\/)assets\/rb\/venue_t|^assets\/rb\/venue_t/.test(bg + ' ' + src) && !/s3\/assets\/rb\/venue/.test(bg + src)) r.push((e.id || e.className || e.tagName) + ' ' + (bg + src).slice(0, 80)); }); return r; });
  const check = async where => { const old = await lifelike(); if (old.length) notes.push(where + ': non-s3 images on screen: ' + old.join(', ')); };
  // 1 first open
  await p.goto('file://' + dir + '/index.html?s3=1', { timeout: 180000 }); await ready(); await p.waitForTimeout(800);
  await shot('welcome', 'first open with ?s3=1: the Season 3 welcome'); await check('welcome');
  await tap('#s3WelGo');
  await shot('signin', 'Start your career on the sign-in screen: welcome closes, sign-in stays'); await check('sign-in');
  // 2 (test only) sign-in can't reach Supabase here: go on as a signed-out player would reach the title
  await p.evaluate(() => { $('login').hidden = true; save.authSeen = true; persist(); showTitle(); }); await p.waitForTimeout(1500);
  await shot('title', 'title screen (Season 3, Vinyl menu art)'); await check('title');
  await tap('#btnNewCareer');
  await shot('creator', 'New career → creator with the 5 Vinyl players'); await check('creator');
  if (await vis('#s3Base [data-b]')) { const ids = await p.evaluate(() => [...document.querySelectorAll('#s3Base [data-b]')].map(x => x.dataset.b)); await tap(`#s3Base [data-b="${ids[1] || ids[0]}"]`); await p.fill('#cName', 'Hayden').catch(() => {}); await p.waitForTimeout(1200); await shot('creator_pick', 'picked the 2nd player, name Hayden'); }
  await tap('#btnCreate'); await p.waitForTimeout(1500);
  await shot('after_create', "That's me"); await check('after create');
  out = {}; out.afterCreate = await p.evaluate(() => ({ screens: ['title', 'creator', 'msg', 'hub', 'result', 'login'].filter(id => { const e = document.getElementById(id); return e && !e.hidden; }), rb: !!document.getElementById('rbApp') && !document.getElementById('rbApp').hidden, match: typeof S !== 'undefined' && !!S && !S.done, circ: !!(career() && career().circuit), stage: career() && career().stage }));
  // through any intro message to the hub
  for (let i = 0; i < 12; i++) { if (await vis('#rbApp [data-s3book]') || await vis('#s3Go')) break; if (await p.evaluate(() => typeof S !== 'undefined' && S && !S.done)) { notes.push('a match started straight after the creator: ' + JSON.stringify(await p.evaluate(() => ({ opp: S.p[1] && S.p[1].name, s3: S.s3 || null, intro: !!S.intro })))); break; }
    if (!(await tap('#msgReplies button'))) { await p.evaluate(() => { try { showHub(); } catch (e) {} }); await p.waitForTimeout(1500); } }
  await shot('hub', 'the hub: Circuit tab at the Pub'); await check('hub');
  // 3 play the Circuit event through: win every match (each of our visits is a 40 checkout on D20, as tests/reset.js), tap through the screens
  const NEXT = ['#rbRGo', '#rbRKeep', '#lvFirst', '#tcWelLater', '#btnResultNext', '#c3rwGo', '#c3rwKeep', '#btnPerkLater', '#tcPLater', '.tcpk__later', '#msgReplies button', '.tc-sheet [data-close]', '.tc-sheet .tc-x', '#s3Ok'];
  const winMatch = async () => { for (let i = 0; i < 1500; i++) { const s = await p.evaluate(() => { try { if (!S || S.done) return 'done'; if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(0, 0); } return 'play'; }
      if (S.cur === 0 && !S.busy && !S.p[0].ai && S.view !== 1) { S.p[0].score = 40; S.busy = true; land(0, -166); } const it = document.getElementById('intro'); if (it && it.classList.contains('show')) it.click(); return 'play'; } catch (e) { return 'ERR ' + e.message; } }).catch(() => 'nav'); if (s !== 'play') return s; await p.waitForTimeout(120); } return 'timeout'; };
  const throughScreens = async (tag) => { const l0 = loads; let shotRes = false; for (let i = 0; i < 300 && loads === l0; i++) {
      if (!shotRes && await vis('#rbApp.rb-resmode #rbRGo')) { shotRes = true; await p.waitForTimeout(1200); await shot(tag + '_result', 'match over: new-look Result'); await check(tag + ' result'); }
      for (const s of NEXT) { if (loads > l0) break; if (await vis(s)) { await p.locator(s).first().tap({ timeout: 5000 }).catch(() => {}); await p.waitForTimeout(400); break; } } await p.waitForTimeout(250); }
    if (loads > l0) await ready(); };
  for (let m = 0; m < 4; m++) {
    if (!(await p.evaluate(() => typeof S !== 'undefined' && S && !S.done))) { if (await vis('#s3Go')) { if (m === 0 || m === 1) await shot('live' + m, 'Playing now: draw, next opponent, Walk on'); await tap('#s3Go'); }
      else if (await vis('#rbApp [data-s3book]')) { await shot('week' + m, 'This week: event posters'); await tap('#rbApp [data-s3book]'); await shot('booked' + m, 'booked: Playing now'); await tap('#s3Go'); } else break; }
    for (let i = 0; i < 40 && !(await p.evaluate(() => typeof S !== 'undefined' && S && !S.done)); i++) await p.waitForTimeout(250);
    await p.waitForTimeout(2500); if (m === 0) { await shot('match', 'in the match: intro card + header'); await check('match'); }
    const r = await winMatch(); notes.push('match ' + (m + 1) + ': ' + r + ' ' + JSON.stringify(await p.evaluate(() => S && S.s3res).catch(() => null)));
    await throughScreens('m' + (m + 1));
    for (let i = 0; i < 20; i++) { if (await vis('#s3Toast') || await vis('#s3Sheet')) break; await p.waitForTimeout(250); }
    await shot('after' + (m + 1), 'back on the Circuit after the reset: toast / result sheet'); 
    for (let k = 0; k < 3 && await vis('#s3Ok'); k++) { await tap('#s3Ok'); await shot('after' + (m + 1) + '_' + k, 'after OK'); }
    if (!(await vis('#s3Go'))) break; }
  out.circ = await p.evaluate(() => { const k = career().circuit; return { level: k.level, week: k.week, bank: career().bank, hist: k.history.map(h => h.n + ' ' + h.fin + ' +$' + h.prize) }; });
  // 4 Money tab
  await tap('#rbTabs [data-t="money"]'); await shot('money', 'Money tab'); await check('money');
  // 5 Best Leg record (forced: Career fires tops:bestleg at a leg end; Supabase is unreachable here)
  await tap('#rbTabs [data-t="circuit"]'); await p.evaluate(() => window.dispatchEvent(new CustomEvent('tops:bestleg', { detail: { darts: 13, prev: 15, kind: 'new', name: 'Hayden' } }))); await p.waitForTimeout(400); await shot('record_banner', 'record banner (in a match it shows over the board)');
  await p.evaluate(() => { try { showHub(); } catch (e) {} }); await p.waitForTimeout(1500); await shot('record_moment', 'the record moment'); await tap('#s3Ok'); await p.waitForTimeout(800);
  // 6 records board (Career's tops_history; unreachable here, so the board is stubbed with real-shaped rows)
  await p.evaluate(() => { window.TOPS_HISTORY = { rows: async () => [{ name: 'David', you: false, s1: { furthest: { level: 6, n: 'World Championship' }, bestAvg: 105.3, bestLeg: 12 }, s2: null }, { name: 'Hayden', you: true, s1: null, s2: { furthest: { level: 1, n: 'Club singles' }, bestAvg: 62.1, bestLeg: 19 } }, { name: 'Lee', you: false, s1: null, s2: { furthest: { level: 2, n: 'Regional' }, bestAvg: 88.6, bestLeg: 14 } }] };
    window.TOPS_BESTLEG = { table: async () => [{ name: 'Lee', darts: 13 }, { name: 'Hayden', you: true, darts: 15 }, { name: 'David', darts: 16 }] }; showHub(); TOPS_S3UI.refreshRecords(); }); await p.waitForTimeout(2000);
  await p.evaluate(() => { const e = document.getElementById('s3Bl'); if (e) e.scrollIntoView({ block: 'start' }); }); await shot('records', 'Best leg table + Seasons 1 & 2 records (stub data)');
  await tap('#s3Hi'); await shot('records_all', 'records: all'); await tap('#s3Ok');
  // 7 Locker, Shop
  await tap('#rbTabs [data-t="locker"]'); await p.waitForTimeout(2500); await shot('locker', 'Locker'); await check('locker'); notes.push('locker venue users: ' + JSON.stringify(await who()));
  await tap('#rbTabs [data-t="shop"]'); await p.waitForTimeout(1500); await shot('shop', 'Shop'); await check('shop');
  console.log(JSON.stringify({ steps, notes, out, pe: pe.slice(0, 5) }, null, 1));
  await b.close(); })();
let out;
