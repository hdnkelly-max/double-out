// Q&D 22 Nov (EXP-IDLE 17:21, blocker on the v3 New look branch): before the Season 3 rig file (assets/chars/leonard.glb, assets/m/ on phones) is in, the game
// builds a stand-in figure (userData.stand), and a hero render of it is the old grey human. The New look card took the first render it got
// and the Locker kept it for the session, so phones showed the grey human for good. Now V.heroShot gives '' for a stand-in under v3 (never
// cached), and both screens ask again when the rig lands (the game's 'tops-avatars' refresh), however late.
// Checks, at a 390 phone with the rig file held back 20 s in the network layer: no hero render at all while the rig is out (so never the
// stand-in); the card shows the base's v3 card and the Locker the plain room meanwhile; once the rig lands both end on the real v3 figure
// (the same render V.heroShot gives with the rig in, Mia's teal shirt reading teal). usage: node tests/s3-slowrig-hero.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const http = require('http');
const dir = path.resolve(process.argv[2] || path.resolve(__dirname, '..')); const HOLD = 20000;
const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(dir, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'content-type': /\.html$/.test(u) ? 'text/html' : /\.js$/.test(u) ? 'text/javascript' : /\.css$/.test(u) ? 'text/css' : /\.jpe?g$/.test(u) ? 'image/jpeg' : /\.png$/.test(u) ? 'image/png' : 'application/octet-stream' }); r.end(d); }); }).listen(0);
const MIA = { v: 1, base: 'mia', shirt: '#0e7c86', acc: [] };
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const fail = [], out = {};
  const run = async tag => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {}
      // every hero render the page hands out, and whether the rig file had been released by then
      window.__hs = []; const t = setInterval(() => { if (typeof V === 'undefined' || !V.heroShot || V.heroShot.__w) return; const f = V.heroShot; const g = function () { const u = f.apply(this, arguments);
        if (u) window.__hs.push({ t: performance.now(), out: !window.__rigOut }); return u; }; g.__w = 1; V.heroShot = g; }, 5); });
    await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com|jsdelivr/, r => r.abort());
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: dir + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    let release = null; const gate = new Promise(z => { release = z; }); let rigAsked = 0;
    await p.route(/assets\/(m\/)?chars\/leonard\.glb/, async r => { rigAsked++; await gate; try { await r.continue(); } catch (e) {} });
    await p.goto('http://127.0.0.1:' + srv.address().port + '/index.html?s3=1&v3=1', { waitUntil: 'domcontentloaded', timeout: 180000 });
    await p.waitForFunction(() => window.TC_API && window.TOPS_S3UI && window.TOPS_RB && typeof V !== 'undefined' && V.heroShot && V.heroShot.__w, null, { timeout: 180000 });
    const t0 = Date.now();
    await p.evaluate(([look, tag]) => { save.name = 'Hayden'; save.lessonDone = true; save.authSeen = true; newCareer(); save.vlook = Object.assign({ at: Date.now() }, look); save.look = Object.assign({}, save.look || {}, { base: 'mia', shirt: look.shirt });
      if (tag === 'card') { delete save.v3NewLook; persist(); $('login').hidden = true; if (window.TOPS_USERNAV) TOPS_USERNAV(showTitle); else showTitle(); /* as the player's own Main menu (the boot guard turns the boot's own showTitle into the hub) */ setTimeout(() => TOPS_S3UI.v3NewLook(0), 300); }
      else { save.v3NewLook = 1; persist(); $('login').hidden = true; try { $('title').hidden = true; } catch (e) {} TOPS_RB.open('locker'); } }, [MIA, tag]);
    // while the rig is out: the card shows the base's v3 card (no hero render), the Locker the plain room
    await p.waitForTimeout(Math.max(0, HOLD - 2000 - (Date.now() - t0)));
    const during = await p.evaluate(() => { const f = document.getElementById('s3V3NewFig'), w = document.getElementById('rbLkFig');
      return { card: !!document.getElementById('s3V3New'), cardHero: !!(f && f.classList.contains('s3-v3nlhero')), cardSrc: f ? f.getAttribute('src').slice(0, 40) : null, lkFilled: !!(w && !w.hidden), renders: window.__hs.length }; });
    await p.evaluate(() => { window.__rigOut = 1; }); release();
    const ok = await p.waitForFunction(tag => { if (tag === 'card') { const f = document.getElementById('s3V3NewFig'); return !!(f && f.classList.contains('s3-v3nlhero') && f.complete); }
      const w = document.getElementById('rbLkFig'); return !!(w && !w.hidden && document.getElementById('rbLkHero').dataset.lk74); }, tag, { timeout: 60000 }).then(() => true, () => false);
    const after = await p.evaluate(tag => { const im = tag === 'card' ? document.getElementById('s3V3NewFig') : document.querySelector('#rbLkFig img'); const src = im ? im.src : '';
      let real = ''; try { real = tag === 'card' ? V.heroShot(save.look, 'Hayden', career().tier || 0, '') : TOPS_RB.lkFig(career().tier); } catch (e) { real = 'err ' + e.message; }
      return new Promise(ok => { if (!src) return ok({ same: false, teal: 0 }); const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0);
        const d = g.getImageData(0, Math.round(i.height * .5), i.width, Math.round(i.height * .2)).data; let n = 0, t = 0; for (let k = 0; k < d.length; k += 4) if (d[k + 3] > 200) { n++; if (d[k + 2] > d[k] + 40 && d[k + 1] > d[k] + 40) t++; }
        ok({ same: !!real && src === real, teal: n ? Math.round(t / n * 100) / 100 : 0, early: window.__hs.filter(h => h.out).length }); }; i.onerror = () => ok({ same: false, teal: -1 }); i.src = src; }); }, tag);
    const r = Object.assign({ rigAsked, during, ok }, after, { pe: pe.slice(0, 2) }); out[tag] = r; await ctx.close(); return r; };
  for (const tag of ['card', 'locker']) { const r = await run(tag);
    if (!r.rigAsked) fail.push(tag + ': the rig file was never asked for (test not holding it back)');
    if (r.during.renders || r.early) fail.push(tag + ': a hero render came out while the rig was out (the stand-in) ' + JSON.stringify(r));
    if (tag === 'card' && (!r.during.card || r.during.cardHero)) fail.push('card: while the rig is out it should show the base\'s v3 card ' + JSON.stringify(r.during));
    if (tag === 'locker' && r.during.lkFilled) fail.push('locker: filled while the rig was out ' + JSON.stringify(r.during));
    if (!r.ok || !r.same) fail.push(tag + ': did not end on the real v3 figure once the rig landed ' + JSON.stringify(r));
    if (r.teal < .15) fail.push(tag + ': Mia\'s teal shirt not teal on the final figure ' + r.teal);
    if (r.pe.length) fail.push(tag + ' page errors ' + r.pe.join('; ').slice(0, 200)); }
  console.log(JSON.stringify(out)); console.log(fail.length ? 's3-slowrig-hero FAIL: ' + fail.join('; ') : 's3-slowrig-hero PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
