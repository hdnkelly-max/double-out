const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files','--use-gl=swiftshader','--ignore-gpu-blocklist'] });
 const out = {};
 for (const q of ['0', '1']) for (const wait of [1500, 12000]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file:///home/claude/rebwt/index.html?rebrand=' + q); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 120000 }); await p.waitForTimeout(800);
  await p.evaluate(() => { save.authSeen = true; $('login').hidden = true; showTitle(); $('btnNewCareer').click(); });
  await p.waitForTimeout(wait);
  out[q + '_' + wait] = await p.evaluate(() => { const c = id => { const e = document.getElementById(id); return e ? e.querySelectorAll('button,.sw,i,span').length : -1; }; return { segChar: c('segChar'), segHair2: c('segHair2'), swHair2: c('swHair2'), swSkin2: c('swSkin2'), segExtra: c('segExtra'), swSkin: c('swSkin'), segHair: c('segHair'), swShirt: c('swShirt'), creatorShown: !document.getElementById('creator').hidden }; });
  await p.screenshot({ path: `/home/claude/rebwt/wip/inv/creator_${q}_${wait}.png` }); await p.close(); }
 console.log(JSON.stringify(out, null, 1)); await b.close(); })();
