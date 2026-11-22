// DQ independent check for exp-walk-hold: the first walk-on of a COLD session on a throttled connection (the whole page throttled,
// not just the clip file), v2 and v3; the player sits on the hub ~2 s, then Walk on. Plus: fast network (nothing else changes), a clip
// file that fails (404), and the second walk-on of the session. usage: node walkthrottle.js <dir> <scenarios>
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const http = require('http');
const dir = path.resolve(process.argv[2]); const ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(dir, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'content-type': /\.html$/.test(u) ? 'text/html' : /\.js$/.test(u) ? 'text/javascript' : /\.css$/.test(u) ? 'text/css' : 'application/octet-stream' }); r.end(d); }); }).listen(0);
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const out = {};
  const run = async (tag, v3, net, opts = {}) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); sessionStorage.removeItem('tcWalkSeen'); } catch (x) {}
      window.__w = { on: 0, off: 0, walk: 0, first: 0 }; const ad = DOMTokenList.prototype.add, rm = DOMTokenList.prototype.remove;
      DOMTokenList.prototype.add = function (...a) { if (a.includes('tc-walking') && !window.__w.on) window.__w.on = performance.now(); return ad.apply(this, a); };
      DOMTokenList.prototype.remove = function (...a) { if (a.includes('tc-walking') && window.__w.on && !window.__w.off) window.__w.off = performance.now(); return rm.apply(this, a); };
      setInterval(() => { const f = window.TOPS_WALKFX; if (!f || f.__w) return; const g = function (now, v) { const r = f.apply(this, arguments);
        try { if (document.body.classList.contains('tc-walking') && v && v.me && v.me.visible && v.me.userData && v.me.userData.mixer) { window.__w.walk++; if (!window.__w.first) window.__w.first = performance.now(); } } catch (e) {} return r; }; g.__w = 1; window.TOPS_WALKFX = g; }, 20); });
    await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com|jsdelivr/, r => r.abort());
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: '/tmp/claude-0/wt-428/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    if (opts.fail) await p.route(/assets\/anims\.glb/, r => r.fulfill({ status: 404, body: '' }));
    let glb = null; p.on('requestfinished', rq => { if (/anims\.glb/.test(rq.url())) glb = Date.now(); }); let glbStart = null; p.on('request', rq => { if (/anims\.glb/.test(rq.url()) && !glbStart) glbStart = Date.now(); });
    if (net) { const c = await ctx.newCDPSession(p); await c.send('Network.enable'); await c.send('Network.emulateNetworkConditions', { offline: false, latency: net.lat, downloadThroughput: net.kbps * 1024 / 8, uploadThroughput: 750 * 1024 / 8 }); }
    const t0 = Date.now(); await p.goto('http://127.0.0.1:' + srv.address().port + '/index.html?s3=1&v3=' + v3, { waitUntil: 'domcontentloaded', timeout: 300000 });
    await p.waitForFunction(() => typeof beginMatch === 'function' && typeof V !== 'undefined' && V._qa && window.TC_API && (V._qa.rigReady ? V._qa.rigReady() || window.TOPS_V3FLAG : true), null, { timeout: 300000 });
    const tReady = Date.now();
    const go = async () => { await p.evaluate(() => { const n = nextOpponent(); window.__w = Object.assign(window.__w, { on: 0, off: 0, walk: 0, first: 0 }); try { sessionStorage.removeItem('tcWalkSeen'); } catch (e) {}
      beginMatch({ mode: 'career', tier: 0, p0: 'Hayden', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); });
      await p.waitForFunction(() => !!window.__w.off, null, { timeout: 60000 }).catch(() => {});
      return p.evaluate(() => ({ walked: window.__w.walk, secs: window.__w.on && window.__w.off ? +((window.__w.off - window.__w.on) / 1000).toFixed(1) : null, heldUntilWalk: window.__w.on && window.__w.first ? +((window.__w.first - window.__w.on) / 1000).toFixed(1) : null })); };
    await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; const l = $('login'); if (l) l.hidden = true; newCareer(); { const c = career(); c.stage = 'season'; c.tier = 0; newSeason(c); }
      save.look = Object.assign({}, save.look || {}, { base: 'kai', acc: [] }); save.vlook = { base: 'kai' }; TC_API.grant('walk_power'); TC_API.equip('walk_power'); persist(); try { showHub('play'); } catch (e) {} });
    await p.waitForTimeout(2000);   // a player on the hub for ~2 s, then Walk on (the hub starts the clip download)
    const first = await go();
    let second = null; if (opts.second) { await p.evaluate(() => { try { quitMatch && quitMatch(); } catch (e) {} try { teardownMatch && teardownMatch(); } catch (e) {} try { showHub('play'); } catch (e) {} }); await p.waitForTimeout(1500); second = await go(); }
    const r = { first, second, loadS: +((tReady - t0) / 1000).toFixed(1), glbReq: glbStart ? +((glbStart - t0) / 1000).toFixed(1) : null, glbDone: glb ? +((glb - t0) / 1000).toFixed(1) : null, pe: pe.slice(0, 2) }; out[tag] = r; console.log(tag, JSON.stringify(r)); await ctx.close(); return r; };
  const S = { fast_v2: ['0', null, { second: 1 }], fast_v3: ['1', null, { second: 1 }], '4mbps_v2': ['0', { kbps: 4000, lat: 150 }], '4mbps_v3': ['1', { kbps: 4000, lat: 150 }], '2mbps_v2': ['0', { kbps: 2000, lat: 300 }], '2mbps_v3': ['1', { kbps: 2000, lat: 300 }], fail404_v3: ['1', null, { fail: 1 }] };
  for (const [k, [v3, net, o]] of Object.entries(S)) if (!ONLY.length || ONLY.includes(k)) await run(k, v3, net, o);
  await b.close(); srv.close(); })();
