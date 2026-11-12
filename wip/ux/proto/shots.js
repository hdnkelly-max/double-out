// screenshots of the prototype screens at phone size: node shots.js [w] [h]
const { chromium } = require('playwright'); const path = require('path');
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844);
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(800);
  for (const t of ['tonight', 'shop', 'locker']) { await p.evaluate(t => show(t), t); await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, `shot_${t}_${W}.png`) }); }
  await p.evaluate(() => { st.sel = 'zen'; renderShop(); show('shop'); }); await p.waitForTimeout(200); await p.screenshot({ path: path.join(__dirname, `shot_shoplocked_${W}.png`) });
  await p.evaluate(() => show('result')); await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, `shot_result_${W}.png`) });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth); console.log('hscroll', ov); await b.close(); })();
