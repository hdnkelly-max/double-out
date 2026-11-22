// The first walk-on of a session on a slow connection (Engine + Producer, 22 Nov): the walk clip file (assets/anims.glb) is still
// downloading when Walk on is pressed. The walk-on used to give up after a flat 4 s held and skip, so the player never saw it. Now it
// holds while the file is still coming and can land inside 10 s, then plays; a tap still skips; a file that sends nothing skips by ~7 s;
// a failed file (404) skips at once.
// Runs on v2 and v3 figures, the clip file delayed in the network layer (throttled: 5.5 s, past today's 4 s give-up), the match started before it lands.
// usage: node tests/walk-slowanims.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const http = require('http');
const dir = path.resolve(process.argv[2] || path.resolve(__dirname, '..'));
const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(dir, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'content-type': /\.html$/.test(u) ? 'text/html' : /\.js$/.test(u) ? 'text/javascript' : /\.css$/.test(u) ? 'text/css' : 'application/octet-stream' }); r.end(d); }); }).listen(0);
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const fail = [], out = {};
  const run = async (tag, v3, delay, tap) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); sessionStorage.removeItem('tcWalkSeen'); } catch (x) {}
      window.__w = { on: 0, off: 0, walk: 0 }; const ad = DOMTokenList.prototype.add, rm = DOMTokenList.prototype.remove;
      DOMTokenList.prototype.add = function (...a) { if (a.includes('tc-walking') && !window.__w.on) window.__w.on = performance.now(); return ad.apply(this, a); };
      DOMTokenList.prototype.remove = function (...a) { if (a.includes('tc-walking') && window.__w.on && !window.__w.off) window.__w.off = performance.now(); return rm.apply(this, a); };
      setInterval(() => { const f = window.TOPS_WALKFX; if (!f || f.__w) return; const g = function (now, v) { const r = f.apply(this, arguments);
        try { if (document.body.classList.contains('tc-walking') && v && v.me && v.me.visible && v.me.userData && v.me.userData.mixer) window.__w.walk++; } catch (e) {} return r; }; g.__w = 1; window.TOPS_WALKFX = g; }, 20); });
    await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com|jsdelivr/, r => r.abort());
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: dir + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    // the clip file lands `delay` ms after Walk on, wherever the game asks for it (it now starts with the page); 'fail' answers 404
    let release = null; const gate = new Promise(z => { release = z; });
    await p.route(/assets\/anims\.glb/, async r => { if (delay === 'fail') return r.fulfill({ status: 404, body: '' }); await gate; if (delay === Infinity) return; try { await r.continue(); } catch (e) {} });
    await p.goto('http://127.0.0.1:' + srv.address().port + '/index.html?s3=1&v3=' + v3, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await p.waitForFunction(() => typeof beginMatch === 'function' && typeof V !== 'undefined' && V._qa && V._qa.rigReady && V._qa.rigReady() && window.TC_API, null, { timeout: 180000 });
    await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; const l = $('login'); if (l) l.hidden = true; newCareer(); { const c = career(); c.stage = 'season'; c.tier = 0; newSeason(c); }
      save.look = Object.assign({}, save.look || {}, { base: 'kai', acc: [] }); save.vlook = { base: 'kai' }; TC_API.grant('walk_power'); TC_API.equip('walk_power'); persist();
      try { sessionStorage.removeItem('tcWalkSeen'); } catch (e) {} const n = nextOpponent(); beginMatch({ mode: 'career', tier: 0, p0: 'Hayden', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); });
    if (delay !== Infinity && delay !== 'fail') setTimeout(() => release(), delay);
    const pend0 = await p.evaluate(() => { try { return V.animsPending ? V.animsPending() : 'n/a'; } catch (e) { return 'err'; } });
    if (tap) { await p.waitForFunction(() => !!window.__w.on, null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(tap); await p.evaluate(() => { window.__w.tap = performance.now(); const o = document.getElementById('tcWalk'); if (o) o.click(); }); }
    await p.waitForFunction(() => !!window.__w.off, null, { timeout: 40000 }).catch(() => {});
    const w = await p.evaluate(() => ({ walked: window.__w.walk, secs: window.__w.on && window.__w.off ? +((window.__w.off - window.__w.on) / 1000).toFixed(1) : null, afterTap: window.__w.tap && window.__w.off ? +((window.__w.off - window.__w.tap) / 1000).toFixed(1) : null }));
    const r = Object.assign({ pend0 }, w, { pe: pe.slice(0, 2) }); out[tag] = r; await ctx.close(); return r; };
  for (const v3 of ['0', '1']) {
    const r = await run('slow55_v3' + v3, v3, 5500);
    if (!(r.walked >= 1)) fail.push(`v3=${v3}: clip file 5.5 s late, the walk-on skipped instead of waiting for it ${JSON.stringify(r)}`);
    if (r.secs == null || r.secs > 17) fail.push(`v3=${v3}: walk-on length ${r.secs}s`);
  }
  // a file that sends nothing (no rate to judge) gets the 4 s hold plus 3 s, then the walk-on skips: never 10 s of an empty room
  { const r = await run('stalled', '1', Infinity); if (r.secs == null || r.secs < 6 || r.secs > 10) fail.push('a clip file that never arrives must skip by about 7 s ' + JSON.stringify(r)); }
  // a failed file (404) skips at once
  { const r = await run('fail404', '1', 'fail'); if (r.secs == null || r.secs > 3) fail.push('a failed clip file must skip at once ' + JSON.stringify(r)); }
  { const r = await run('tap', '1', Infinity, 1500); if (r.afterTap == null || r.afterTap > 1.5) fail.push('a tap during the hold must skip at once ' + JSON.stringify(r)); }
  for (const k of Object.keys(out)) if (out[k].pe.length) fail.push(k + ' page errors ' + out[k].pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out)); console.log(fail.length ? 'walk-slowanims FAIL: ' + fail.join('; ') : 'walk-slowanims PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
