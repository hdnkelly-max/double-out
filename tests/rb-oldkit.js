// Live bug 05:45 (Experience): Shop → "Setup & gear" opened the old Store EMPTY (no dart, no list). Since EXP-SETUP, Setup & gear opens in place
// inside the new Shop (no old Store, no "New look ›" pill). This test keeps the bug's point on the new route (Delivery QA 15:45: the old version
// tapped the removed old-Store button): Setup & gear is never empty: the dart photo loads, the five stat bars and the four rows are there, the
// old Store stays hidden, and it is still drawn after a refresh and after the game's own Store renders off-screen. usage: node tests/rb-oldkit.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html', { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1000);
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); const c = career(); c.stage = 'season'; c.bank = 640; newSeason(c); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
  await p.waitForTimeout(3000); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  const tap = async sel => { const pt = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); if (!pt) return false; await p.touchscreen.tap(pt[0], pt[1]); await p.waitForTimeout(1500); return true; };
  const look = () => p.evaluate(async () => { const vis = e => !!e && !e.hidden && e.offsetParent !== null; const app = document.getElementById('rbApp');
    const hero = app && app.querySelector('.rb-im'); const m = hero && (hero.style.backgroundImage || hero.style.background || '').match(/url\("?([^")]+)"?\)/);
    const w = m ? await new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth); i.onerror = () => r(0); i.src = m[1]; }) : 0;
    return { rb: !!app && !app.hidden, sub: (app.querySelector('[data-sub][aria-selected="true"]') || {}).dataset?.sub, img: w, bars: app.querySelectorAll('.rb-sbr').length, rows: app.querySelectorAll('.rb-strow').length,
      oldKit: vis(document.querySelector('#hub .htab[data-t="kit"]')) && !!document.getElementById('hub') && vis(document.getElementById('hub')) && app.hidden, pill: (e => !!e && !e.hidden && getComputedStyle(e).display !== 'none')(document.getElementById('rbBack')) }; });
  await tap('#rbTabs [data-t="shop"]'); const found = await tap('#rbApp [data-sub="setup"]'); const a = await look();
  await p.evaluate(() => document.dispatchEvent(new Event('tops-avatars'))); await p.waitForTimeout(800); const b2 = await look();
  await p.evaluate(() => { try { showShop('setup', true); } catch (e) {} try { TOPS_RB.render(); } catch (e) {} }); await p.waitForTimeout(600); const c = await look();
  const fail = []; if (!found) fail.push('no Setup & gear tab in the Shop');
  for (const [k, s] of [['opened', a], ['after a refresh', b2], ['after the game drew its Store off-screen', c]]) {
    if (!s.rb || s.sub !== 'setup') fail.push(k + ': not on Setup & gear in the new Shop'); if (!(s.img > 0)) fail.push(k + ': no dart image'); if (s.bars !== 5) fail.push(k + ': stat bars ' + s.bars);
    if (s.rows !== 4) fail.push(k + ': rows ' + s.rows); if (s.oldKit) fail.push(k + ': old Store showing'); if (s.pill) fail.push(k + ': New look pill showing'); }
  if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 150));
  console.log(JSON.stringify({ a, b2, c })); console.log(fail.length ? 'rb-oldkit FAIL: ' + fail.join(', ') : 'rb-oldkit PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
