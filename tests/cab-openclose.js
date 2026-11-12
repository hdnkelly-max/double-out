// QA (F6/F7): open and close the 3D trophy cabinet N times (default 20) and check nothing outlives it:
// live WebGL contexts, window/document listeners, intervals, rAF loops, JS heap after GC.
// NODE_PATH=/opt/node-tools/node_modules node tests/cab-openclose.js   (N=20, URL=file://.../index.html)
const { chromium } = require('playwright'); const path = require('path');
const N = +process.env.N || 20, URL = process.env.URL || 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const t0 = Date.now(); const b = await chromium.launch({ args: ['--js-flags=--expose-gc', '--enable-precise-memory-info'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.addInitScript(() => {
    const Q = window.__CQ = { ctx: 0, lost: 0, lis: 0, iv: new Set(), raf: 0 };
    const gc = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (k) { const had = this.__q; const r = gc.apply(this, arguments); if (r && /webgl/.test(k) && !had) { this.__q = 1; Q.ctx++; } return r; };
    const ge = WebGLRenderingContext.prototype.getExtension; const hook = (C) => { const g = C.prototype.getExtension; C.prototype.getExtension = function (n) { const e = g.apply(this, arguments); if (e && n === 'WEBGL_lose_context' && !e.__q) { e.__q = 1; const l = e.loseContext.bind(e); e.loseContext = () => { Q.lost++; return l(); }; } return e; }; };
    hook(WebGLRenderingContext); if (window.WebGL2RenderingContext) hook(WebGL2RenderingContext);
    for (const T of [window, document]) { const a = T.addEventListener, r = T.removeEventListener, seen = new WeakMap(); T.addEventListener = function (t, f, o) { const k = t + '|' + !!(o && (o === true || o.capture)); let m = seen.get(f); if (!m) seen.set(f, m = new Set()); if (!m.has(k)) { m.add(k); Q.lis++; } return a.apply(this, arguments); }; T.removeEventListener = function (t, f, o) { const k = t + '|' + !!(o && (o === true || o.capture)); const m = seen.get(f); if (m && m.delete(k)) Q.lis--; return r.apply(this, arguments); }; }
    const si = window.setInterval, ci = window.clearInterval; window.setInterval = function () { const id = si.apply(this, arguments); Q.iv.add(id); return id; }; window.clearInterval = function (id) { Q.iv.delete(id); return ci.apply(this, arguments); };
    const ra = window.requestAnimationFrame; window.requestAnimationFrame = function () { Q.raf++; return ra.apply(this, arguments); };
  });
  await p.goto(URL); await p.waitForFunction(() => window.TC_API && typeof TC_API.cabinet === 'function', null, { timeout: 60000 });
  await p.waitForTimeout(2500);
  // a few trophies so the cabinet builds cups, plates, shadows and strips
  await p.evaluate(() => { try { [0, 1, 2, 6].forEach(i => TC_API.addTrophy(i)); } catch (e) { console.log('addTrophy', e); } });
  const snap = () => p.evaluate(async () => { const Q = window.__CQ; const r0 = Q.raf; await new Promise(z => setTimeout(z, 1200)); window.gc && window.gc(); await new Promise(z => setTimeout(z, 200)); window.gc && window.gc();
    return { live: Q.ctx - Q.lost, lis: Q.lis, iv: Q.iv.size, rafPerS: +((Q.raf - r0) / 1.2).toFixed(1), heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null, cabs: document.querySelectorAll('.tc-cab-3d').length }; });
  const base = await snap(); const cups = await p.evaluate(() => { const el = TC_API.cabinet(); const n = el && el._cab ? el._cab.scene.children.length : -1; const x = el && el.querySelector('.tc-x'); x && x.click(); return n; });
  const one = await snap(); let mid = null;
  for (let i = 1; i < N; i++) { await p.evaluate(() => { const el = TC_API.cabinet(); return new Promise(z => setTimeout(() => { const x = el && el.querySelector('.tc-x'); x && x.click(); z(); }, 250)); }); if (i === Math.floor(N / 2)) mid = await snap(); }
  const end = await snap(); const secs = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(JSON.stringify({ base, afterFirst: one, mid, end, sceneChildren: cups, errs }));
  const f = [];
  if (cups < 1) f.push('the 3D cabinet did not mount (fell back to 2D?)');
  if (end.live > one.live) f.push(`live WebGL contexts grow: ${one.live} after 1 → ${end.live} after ${N}`);
  if (end.lis > one.lis) f.push(`window/document listeners grow: ${one.lis} → ${end.lis}`);
  if (end.iv > one.iv) f.push(`intervals grow: ${one.iv} → ${end.iv}`);
  if (end.rafPerS > one.rafPerS + 1.5) f.push(`rAF loops grow: ${one.rafPerS}/s → ${end.rafPerS}/s`);
  if (end.cabs) f.push('cabinet sheets left in the DOM: ' + end.cabs);
  if (one.heapMB && end.heapMB - one.heapMB > 8) f.push(`JS heap grows ${one.heapMB} → ${end.heapMB} MB over ${N - 1} more opens`);
  if (errs.length) f.push('page errors: ' + errs.join(' | '));
  await b.close();
  console.log(f.length ? `FAIL (${secs} s):\n- ` + f.join('\n- ') : `PASS (${secs} s): ${N} cabinet open/close cycles, nothing outlives the cabinet (WebGL contexts, listeners, intervals, rAF loops, heap)`);
  process.exit(f.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
