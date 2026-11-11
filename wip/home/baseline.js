// EXP-HOME baseline: today's career hub at 390x844 (DPR 2) with a mid-career save; dumps the hub's text for realistic mock data.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const root = path.resolve(__dirname, '../..');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com.*three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(5000);
  const info = await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; newCareer(); save.name = 'Hayden'; save.tcIntro = Date.now();
    const c = career(); c.tier = 1; c.bank = 640; c.wins = 23; c.losses = 11; try { const v = C3.V3(); v.lv = 14; v.xp = 380; v.fame = 31; } catch (e) {}
    try { persist(); } catch (e) {} showHub(); return { tier: c.tier }; });
  await p.waitForTimeout(6000);
  const cdp = await p.context().newCDPSession(p); const shot = async f => { const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 } }); fs.writeFileSync(f, Buffer.from(data, 'base64')); };
  await shot(root + '/wip/home/baseline_top.png');
  const dump = await p.evaluate(() => { const h = $('hub'); const sc = [...document.querySelectorAll('#hub, #hub *')].find(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY)) || document.scrollingElement;
    return { text: (h ? h.innerText : '').replace(/\n{2,}/g, '\n').slice(0, 3000), scrollH: sc.scrollHeight, clientH: sc.clientHeight, scId: sc.id || sc.className }; });
  fs.writeFileSync(root + '/wip/home/baseline_text.json', JSON.stringify(dump, null, 1));
  for (const [i, f] of [[2, .5], [3, 1]]) { await p.evaluate(f => { const sc = [...document.querySelectorAll('#hub, #hub *')].find(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY)) || document.scrollingElement; sc.scrollTop = (sc.scrollHeight - sc.clientHeight) * f; }, f); await p.waitForTimeout(600); await shot(root + '/wip/home/baseline_' + i + '.png'); }
  console.log(JSON.stringify({ info, scrollH: dump.scrollH, clientH: dump.clientH, sc: dump.scId })); await b.close();
})();
