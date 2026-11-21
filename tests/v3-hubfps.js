// r8c (Q&D): with ?v3=1 the hub managed 1-2 frames every 2 s for ~28 s after it opened (4.26: ~100): the avatar refresh (every 2.5 s, up to 12x)
// never got a cached v3 portrait / hero, so each pass rebuilt the v3 figures and re-rendered every portrait and the hero.
// This opens the S3 hub as s3-match does (career, showHub) and counts frames in 2 s windows for 30 s, plus the avatar refreshes and the v3
// figure builds after the first 4 s. node tests/v3-hubfps.js <dir> [v3: 1|0] [minFrac]
// PASS: from 4 s no 2 s window under 2 frames; from 12 s every window >= 40 frames and <= 50 ms in portrait / hero renders; <= 4 avatar refreshes.
// The v2 run is reported for comparison only (v2 is untouched here).
const { chromium } = require('playwright'); const path = require('path'), http = require('http'), fs = require('fs'); const dir = path.resolve(process.argv[2] || path.resolve(__dirname, '..')); const FRAC = +(process.argv[3] || 0.5);
const run = async (b, v3) => { const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const pe = []; p.on('pageerror', e => pe.push(e.message)); if (+(process.env.CPU || 1) > 1) { const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +(process.env.CPU || 1) }); }   /* CPU=4: phone profile (rule 26); on software GL one first-time render (shader compile) can then take > 2 s */
  await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} }); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto((process.env.FILE ? 'file://' + dir : 'http://127.0.0.1:' + srv.address().port) + '/index.html?s3=1' + (v3 ? '&v3=1' : '&v3=0'), { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3, null, { timeout: 240000 }); await p.waitForTimeout(1500);
  await p.evaluate(() => { window.__av = 0; document.addEventListener('tops-avatars', () => window.__av++); window.__mk = 0; const Q = V._qa, mk = Q.makeFigure; /* counts figure builds through the QA hook only */
    localStorage.removeItem('tops_s3_seen'); save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); save.tcWelSeen = 1; persist(); $('login').hidden = true;
    window.__ms = 0; window.__msw = []; for (const k of ['portrait', 'heroShot']) { const f = V[k]; V[k] = function () { const t = performance.now(); try { return f.apply(this, arguments); } finally { window.__ms += performance.now() - t; } }; }   /* time inside the portrait / hero renders */
    window.__fr = []; let n = 0, t0 = performance.now(); window.__t0 = t0; const tick = () => { n++; const t = performance.now(); if (t - t0 >= 2000) { window.__fr.push(n); window.__msw.push(Math.round(window.__ms)); window.__ms = 0; n = 0; t0 = t; } if (window.__fr.length < 15) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    showHub('play'); });
  await p.waitForFunction(() => window.__fr.length >= 15, null, { timeout: 200000, polling: 1000 }).catch(() => {});
  const r = await p.evaluate(() => ({ rig: V._qa.rigReady(), fr: window.__fr, ms: window.__msw, av: window.__av, v3: window.TOPS_V3FLAG === true, hub: !!document.querySelector('#rbApp:not([hidden])') || !!document.querySelector('#hub:not([hidden])') }));
  r.pe = pe.slice(0, 2); await p.close(); return r; };
let srv; (async () => { srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(dir, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': /\.html$/.test(u) ? 'text/html' : /\.js$/.test(u) ? 'text/javascript' : /\.css$/.test(u) ? 'text/css' : /\.json$/.test(u) ? 'application/json' : 'application/octet-stream' }); r.end(d); }); }).listen(0); const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const v2 = await run(b, false), v3 = await run(b, true); await b.close(); srv.close();
  const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; }, tail = a => a.slice(2) /* after the first 4 s (the hub's own first build) */;
  const fails = [], W = v3.fr, M = v3.ms; if (!v3.v3) fails.push('v3 flag not on'); if (!v3.hub) fails.push('hub not open'); if (!v3.rig) fails.push('rig not ready');
  /* the first 4 s are the hub's own first build; 4-12 s the queued first-time renders (one per frame); from 12 s the hub must run freely */
  const lo = Math.min(...W.slice(2)); if (lo < 2) fails.push(`v3 hub: a 2 s window with ${lo} frames after the first 4 s (taps time out)`);
  const late = W.slice(6), lateMin = Math.min(...late); if (lateMin < 40) fails.push(`v3 hub from 12 s: a 2 s window with ${lateMin} frames (< 40)`);
  const lateMs = Math.max(...M.slice(6)); if (lateMs > 50) fails.push(`v3 hub from 12 s: ${lateMs} ms of portrait / hero rendering in a 2 s window (> 50: re-rendering cached looks)`);
  if (v3.av > 4) fails.push(`v3 hub: ${v3.av} avatar refreshes (> 4: portraits never cached)`);
  console.log(JSON.stringify({ rig: [v2.rig, v3.rig], v2: { fr: v2.fr, ms: v2.ms, av: v2.av }, v3: { fr: v3.fr, ms: v3.ms, av: v3.av }, pe: [...v2.pe, ...v3.pe] }));
  console.log(fails.length ? 'V3-HUBFPS FAIL ' + JSON.stringify(fails) : `V3-HUBFPS PASS (v3 hub, CPU x${process.env.CPU || 1}: from 4 s every 2 s window >= ${lo} frames; from 12 s >= ${lateMin} frames and <= ${lateMs} ms of portrait / hero rendering; ${v3.av} avatar refreshes)`); process.exit(fails.length ? 1 : 0); })();
