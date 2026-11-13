// EXP-OLDOUT (Overseer 16:45/16:46; Hayden 16:40 "I see the old screen before it loads the new one"): on a cold launch the first paint is the
// new loading screen and nothing in the old look ever paints: (1) static: a dark page background and the loader markup come before the first
// external stylesheet and script, and the TOPS mark is inline; (2) live: every animation frame from the first one is logged; an old-look frame is
// one where a game screen (title, login, hub, creator) shows without the rebrand on, or the loader shows an old splash line ("Chalking the board").
// Run on a returning save and a new player, at 390. usage: node tests/boot-paint.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const fail = [], out = {};
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'); const at = s => html.indexOf(s);
  const ld = at('id="loading"'), css = at('fonts.googleapis.com/css2'), js = at('<script src='), bg = at('html,body{background:#08090b');
  out.static = { ld, css, js, bg, logoInline: /class="ld-logo" src="data:image\//.test(html), oldTips: /Chalking the board/.test(html) };
  if (!(bg >= 0 && bg < css && bg < js)) fail.push('dark background is not before the first external stylesheet/script'); if (!(ld >= 0 && ld < css && ld < js)) fail.push('loader markup is not before the first external stylesheet/script');
  if (!out.static.logoInline) fail.push('TOPS mark needs a fetch'); if (out.static.oldTips) fail.push('old splash lines still in the page');
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  for (const who of ['returning', 'new']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.route(/jsdelivr|supabase\.co/, r => r.abort());
    if (who === 'returning') { await p.goto('file://' + dir + '/index.html'); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1500);
      await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); persist(); }); }
    await p.addInitScript(() => { const log = window.__bp = []; const vis = e => { if (!e || e.hidden) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > .05; };
      const f = () => { try { const L = document.getElementById('loading'), cover = vis(L) && +getComputedStyle(L).opacity > .95; const scr = ['title', 'login', 'hub', 'creator'].filter(id => vis(document.getElementById(id)));
        const tip = (document.getElementById('ldTip') || {}).textContent || ''; log.push({ t: Math.round(performance.now()), cover, scr, rb: document.documentElement.classList.contains('rb-on'), pre: document.documentElement.classList.contains('tops-pre'), tip, bg: document.body ? getComputedStyle(document.body).backgroundColor : getComputedStyle(document.documentElement).backgroundColor }); } catch (e) {} if (log.length < 4000) requestAnimationFrame(f); };
      requestAnimationFrame(f); });
    await p.goto('file://' + dir + '/index.html'); await p.waitForTimeout(16000);
    const log = await p.evaluate(() => window.__bp); const old = log.filter(x => (!x.cover && x.scr.length && !x.rb) || /Chalking|Pouring|Warming|Hanging/.test(x.tip));
    const first = log[0] || {}; const m = (first.bg || '').match(/\d+/g) || [255, 255, 255]; const lum = (+m[0] + +m[1] + +m[2]) / 3;
    const shown = log.find(x => !x.cover && x.scr.length); out[who] = { frames: log.length, firstAt: first.t, firstBg: first.bg, firstCover: first.cover, oldFrames: old.length, firstOld: old[0], screenAt: shown && shown.t, screens: shown && shown.scr, rbAtScreen: shown && shown.rb, released: log.length && !log[log.length - 1].pre };
    if (lum > 40) fail.push(who + ': first frame background ' + first.bg); if (!first.cover) fail.push(who + ': loader not on the first frame'); if (old.length) fail.push(who + ': ' + old.length + ' old-look frames, first ' + JSON.stringify(old[0]));
    if (!shown) fail.push(who + ': no screen after the loader'); if (!out[who].released) fail.push(who + ': pre-paint hold never released'); if (pe.length) fail.push(who + ': page errors ' + pe.join('; ').slice(0, 120));
    await ctx.close(); }
  console.log(JSON.stringify(out)); console.log(fail.length ? 'boot-paint FAIL: ' + fail.join('; ') : 'boot-paint PASS (returning + new player)'); await b.close(); process.exit(fail.length ? 1 : 0); })();
