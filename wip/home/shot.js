// screenshot mock pages at 390x844 @2x (fonts are local files). usage: node shot.js a_tonight [b_local c_dash ...]
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  for (const n of process.argv.slice(2)) { await p.goto('file://' + path.resolve(__dirname, n + '.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
    await p.screenshot({ path: path.resolve(__dirname, n + '.png') }); console.log('shot', n); }
  await b.close(); })();
