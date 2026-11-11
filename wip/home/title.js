// EXP-HOME r3 baseline: today's TITLE screen at 390x844 (DPR 2), returning player with a mid-career save; lists every visible control.
// usage: node title.js <built game dir> <out dir>
const { chromium } = require('playwright'); const fs = require('fs');
const root = process.argv[2], out = process.argv[3];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com.*three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(5000);
  await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; newCareer(); save.name = 'Hayden'; save.tcIntro = Date.now();
    const c = career(); c.tier = 1; c.bank = 640; c.wins = 23; c.losses = 11; try { const v = C3.V3(); v.lv = 14; v.xp = 380; } catch (e) {}
    try { persist(); } catch (e) {} showTitle(); });
  await p.waitForTimeout(4000);
  const cdp = await p.context().newCDPSession(p);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 } });
  fs.writeFileSync(out + '/r3_baseline_today.png', Buffer.from(data, 'base64'));
  const inv = await p.evaluate(() => { const t = $('title'); const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[hidden]'); };
    return { cls: t.className, scrollH: t.scrollHeight, clientH: t.clientHeight,
      controls: [...t.querySelectorAll('button,a,[role=button]')].map(e => ({ id: e.id, vis: vis(e), y: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height), text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90) })),
      text: t.innerText.replace(/\n{2,}/g, '\n').slice(0, 1500) }; });
  fs.writeFileSync(out + '/r3_baseline_inventory.json', JSON.stringify(inv, null, 1)); console.log(JSON.stringify(inv, null, 1)); await b.close();
})();
