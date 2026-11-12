// Live bug 05:45 (Experience): Shop → "Setup & gear" opened the old Store empty (no dart, no list). It must open the old Store drawn, on its Setup tab,
// with the "New look ›" pill to come back, and come back to the new Shop. usage: node tests/rb-oldkit.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html', { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1000);
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); const c = career(); c.stage = 'season'; c.bank = 640; newSeason(c); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
  await p.waitForTimeout(3000); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  const tap = async sel => { const pt = await p.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); await p.touchscreen.tap(pt[0], pt[1]); await p.waitForTimeout(1500); };
  await tap('#rbTabs [data-t="shop"]'); await tap('#rbApp [data-go="kit"]');
  const st = await p.evaluate(() => { const vis = e => !!e && !e.hidden && e.offsetParent !== null; const img = document.getElementById('kitImg'); const sec = document.querySelector('#hub .htab[data-t="kit"]');
    return { rb: !document.getElementById('rbApp').hidden, kitShown: vis(sec), kitName: (document.getElementById('kitName') || {}).textContent || '', img: !!(img && img.complete && img.naturalWidth > 0), setupTab: (document.querySelector('#kitTabs [aria-pressed="true"],#kitTabs .on') || {}).dataset?.t || showShop.tab, back: (e => !!e && !e.hidden && getComputedStyle(e).display !== 'none')(document.getElementById('rbBack')) }; });
  await tap('#rbBack'); const back = await p.evaluate(() => ({ rb: !document.getElementById('rbApp').hidden }));
  const fail = []; if (st.rb) fail.push('new look still showing'); if (!st.kitShown) fail.push('old Store not shown'); if (!st.kitName.trim()) fail.push('no dart name (Store not drawn)'); if (!st.img) fail.push('no dart image'); if (st.setupTab !== 'setup') fail.push('not on the Setup tab (' + st.setupTab + ')'); if (!st.back) fail.push('no New look pill'); if (!back.rb) fail.push('New look pill does not come back'); if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 150));
  console.log(JSON.stringify({ st, back })); console.log(fail.length ? 'rb-oldkit FAIL: ' + fail.join(', ') : 'rb-oldkit PASS'); await b.close(); })();
