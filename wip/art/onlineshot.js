// Art: online screens baseline/after shots. Play online entry + host lobby with 3 players (fake presence, no network),
// at 390x844 (full page) and 1280x800. usage: node wip/art/onlineshot.js <tag>  -> wip/art/online_<tag>_<state>_<w>.png
const { chromium } = require('playwright'); const path = require('path'); const root = path.resolve(__dirname, '../..');
const tag = process.argv[2] || 'live';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  for (const [w, h] of [[390, 844], [1280, 800]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/supabase\.co/, r => r.abort());
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 }); await p.waitForTimeout(5000);
    await p.evaluate(() => { save.authSeen = true; const l = $('login'); if (l) l.hidden = true; newCareer(); save.name = 'Hayden'; save.walkon = 'off'; openMultiplayer(); const n = $('onName'); if (n) n.value = 'Hayden'; });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${root}/wip/art/online_${tag}_entry_${w}.png`, fullPage: true });
    await p.evaluate(() => {
      const peers = { me: { name: 'Hayden', pro: 'jet', host: true }, b: { name: 'Lee', pro: 'tui', ready: true }, c: { name: 'David', pro: 'hemi', ready: false } };
      NET.chan = { presenceState: () => Object.fromEntries(Object.entries(peers).map(([k, v]) => [k, [v]])), send() {}, track() {}, unsubscribe() {} };
      NET.myId = 'me'; NET.seat = 0; NET.room = 'K7QX';
      $('onEntry').hidden = true; $('onLobby').hidden = false; $('onCode').textContent = 'K7QX';
      try { renderLobby(); } catch (e) { console.log('renderLobby', e.message); }
    });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${root}/wip/art/online_${tag}_lobby_${w}.png`, fullPage: true });
    console.log(w, 'errors:', errs.slice(0, 2).join(' | ') || 'none'); await p.close();
  }
  await b.close();
})();
