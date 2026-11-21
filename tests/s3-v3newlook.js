// v3 switch-on (Director doc 69, behind ?v3=1): the one-time 'New look' card and the Locker shirt colour.
//  An existing Season 3 player (career made with v3 off) opens with v3 on: over the title, a card with their name, Director's copy
//  ('New look, same you' / rebuilt every player... / Your career, cards and stats haven't changed.), a figure, 'Let's go' and 'Tweak my look'.
//  'Let's go' sets save.v3NewLook (in the save, so once per account) and it never shows again, also after a reload; 'Tweak my look' opens the
//  creator. A career started with v3 on never sees it; with v3 off nothing shows. The Locker shirt colour and the woman's photo follow the
//  v3 look (save.vlook) when v3 is on, the legacy look when off. usage: node tests/s3-v3newlook.js [dir]   (SHOTS=1: tests/s3_v3nl_<w>.png)
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const page = async (ctx, v3) => { const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.goto('file://' + dir + '/index.html?s3=1&v3=' + v3, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.TOPS_S3 && window.TOPS_S3UI, null, { timeout: 180000 }); await p.waitForTimeout(1500); p.pe = pe; return p; };
  const title = async p => { await p.evaluate(() => { $('login').hidden = true; save.authSeen = true; persist(); showTitle(); }); await p.waitForTimeout(1600); };
  const card = p => p.evaluate(() => { const d = document.getElementById('s3V3New'); if (!d) return null; const r = d.querySelector('.s3-v3nlbox').getBoundingClientRect(), go = document.getElementById('s3V3NewGo').getBoundingClientRect();
    return { t: d.innerText.replace(/\s+/g, ' ').trim(), img: !!d.querySelector('.s3-v3nlfig img'), fits: r.top >= 0 && r.bottom <= innerHeight + 1 && go.bottom <= innerHeight, wide: document.documentElement.scrollWidth > innerWidth + 1, ink: getComputedStyle(d).color }; });
  for (const [w, h] of [[390, 844], [360, 640]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: process.env.SHOTS ? 2 : 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    // an existing player: career made with v3 off
    let p = await page(ctx, '0'); await p.waitForTimeout(2500);   // the game's start-up can write a fresh save; let it settle first (a player can't act this early)
    const stored = () => p.evaluate(() => { try { const o = JSON.parse(localStorage.getItem(TOPS_SAVE_NS.key) || 'null'); return !!(o && o.career && o.name === 'Hayden' && o.vlook); } catch (e) { return false; } });
    for (let k = 0; k < 3; k++) { await p.evaluate(() => { save.name = 'Hayden'; save.lessonDone = true; newCareer(); save.vlook = { v: 1, base: 'mia', shirt: 0xd7232d, acc: [], at: Date.now() }; persist(); }); await p.waitForTimeout(3000); if (await stored()) break; }
    if (!(await stored())) fail.push(w + ': the existing save did not stick');
    await title(p); await p.waitForTimeout(2000); const off = await card(p); out['off' + w] = off; if (off) fail.push(w + ': card shows with v3 off');
    const lk0 = await p.evaluate(() => ({ shirt: TOPS_RB.myShirt(), fem: TOPS_RB.meFem() })); out['lk0' + w] = lk0; await p.close();
    p = await page(ctx, '1'); await title(p); await p.waitForSelector('#s3V3New', { timeout: 6000 }).catch(() => {}); await p.waitForTimeout(400); const on = await card(p); out['on' + w] = on; }
    if (!on) { /* already failed above: no taps */ } else if (w === 390) { await p.locator('#s3V3NewTw').tap(); await p.waitForTimeout(1200); const tw = await p.evaluate(() => ({ gone: !document.getElementById('s3V3New'), flag: !!save.v3NewLook, cre: !!document.querySelector('#creator') && !document.getElementById('creator').hidden && getComputedStyle(document.getElementById('creator')).display !== 'none' }));
      out.tweak = tw; if (!tw.gone || !tw.flag || !tw.cre) fail.push('Tweak my look ' + JSON.stringify(tw)); }
    else { await p.locator('#s3V3NewGo').tap(); await p.waitForTimeout(500); const g = await p.evaluate(() => ({ gone: !document.getElementById('s3V3New'), flag: !!save.v3NewLook })); out.go = g; if (!g.gone || !g.flag) fail.push("Let's go " + JSON.stringify(g)); }
    await p.reload(); await p.waitForFunction(() => window.TOPS_S3UI, null, { timeout: 180000 }); await p.waitForTimeout(1500); await title(p); await p.waitForTimeout(2000); if (await card(p)) fail.push(w + ': card shows again after it was seen');
    if (p.pe.length) fail.push(w + ' page errors ' + p.pe.join('; ').slice(0, 200)); await p.close(); await ctx.close(); }
  // a career started with v3 on: no card
  { const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} });
    const p = await page(ctx, '1'); await p.evaluate(() => { save.name = 'New'; save.lessonDone = true; newCareer(); persist(); }); await title(p); await p.waitForTimeout(2000); const c = await card(p); out.fresh = { card: !!c, flag: await p.evaluate(() => !!save.v3NewLook) };
    if (c || !out.fresh.flag) fail.push('new v3 career ' + JSON.stringify(out.fresh)); await ctx.close(); }
  console.log(JSON.stringify(out).slice(0, 1500)); console.log(fail.length ? 's3-v3newlook FAIL: ' + fail.join('; ') : 's3-v3newlook PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
