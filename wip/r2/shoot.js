const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 3400, height: 900 }, deviceScaleFactor: 1 });
 await p.goto('file://' + path.resolve(__dirname, 'r2.html')); await p.waitForTimeout(800);
 for (const id of await p.evaluate(() => [...document.querySelectorAll('.ph')].map(e => e.id))) await (await p.$('#' + id)).screenshot({ path: path.join(__dirname, 'out_' + id + '.png') });
 console.log('done'); await b.close(); })();
