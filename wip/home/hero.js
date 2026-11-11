// EXP-HOME r2: real in-game hero render of the player (transparent background) via V.heroShot
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const root = path.resolve(__dirname, '../..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.route(/cdnjs\.cloudflare\.com.*three\.min\.js/, r => r.fulfill({ path: root + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
  await p.goto('file://' + root + '/double-out-standalone.html', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await p.evaluate(() => { save.authSeen = true; newCareer(); save.name = 'Hayden'; showHub(); });
  await p.waitForFunction(() => V._qa.rigReady(), null, { timeout: 90000, polling: 1000 }); await p.waitForTimeout(8000);
  const url = await p.evaluate(() => { try { return V.heroShot(save.look, save.name, 1, save.flight) || ''; } catch (e) { return 'ERR ' + e.message; } });
  if (url.startsWith('data:')) { fs.writeFileSync(path.join(__dirname, 'hero_me.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('saved hero_me.png'); } else console.log('no hero', url.slice(0, 80));
  await b.close(); })();
