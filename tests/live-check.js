// Delivery QA (DQ-IDLE-1, Hayden 17:03: LOW items ship before Q&D sees them, so every release is checked live afterwards).
// The live site as a brand-new player on two phones: iPhone 13 and Pixel 7, each a fresh device (no saved game).
// Per phone it FAILs on: a page error; a same-origin file that fails (4xx/5xx/network) other than a known optional one; a page whose
// version is not the release's; the loader not lifting in 120 s; a career match that doesn't start; three darts thrown by touch on
// the pull pad that don't land; and (file sweep) any file the live page names, or s3/manifest.json lists, not served. Screenshots (hub, match, after 3 darts) go to <out>/ for the run summary.
//   node tests/live-check.js <site url> <expected version | -> [out dir] [devices, comma separated]
// e.g. node tests/live-check.js https://hdnkelly-max.github.io/double-out/ 4.07 live-shots
const { chromium, devices } = require('playwright'); const fs = require('fs'), path = require('path');
const [url0, want, outDir = 'live-shots', devs = 'iPhone 13,Pixel 7'] = process.argv.slice(2);
// no URL = nothing to check (CI's fast suite runs every new test with no site; live-check.yml gives it the live URL)
if (!url0) { console.log('live-check SKIP: no site url (usage: node tests/live-check.js <site url> <expected version|-> [out dir] [devices])'); process.exit(0); }
const URL0 = url0.endsWith('/') || /\.html?$/.test(url0) ? url0 : url0 + '/'; const origin = new URL(URL0).origin;
fs.mkdirSync(outDir, { recursive: true });
// files the game asks for that may be absent by design (it handles their 404): add here only with a reason
const OPTIONAL = [/\/s3\/pros\/pros\.json$/];
// the live file sweep: every literal file path the live page names (as tests/asset-refs.js reads them) plus every file in the live
// s3/manifest.json, requested from the live site; any that isn't 200 FAILs (catches art the first match never asks for)
async function sweep() {
  const html = await (await fetch(URL0 + '?sweep=' + Date.now())).text(); let src = html.replace(/\/\*[\s\S]*?\*\//g, ' ');
  // window.TOPS_S3_HAVE holds KEYS (assets/ paths that have a Season 3 redo at s3/<key>), not files the page asks for: check s3/<key>
  let have = []; src = src.replace(/window\.TOPS_S3_HAVE\s*=\s*(\[[^\]]*\])/, (m, arr) => { try { have = JSON.parse(arr); } catch (e) {} return 'window.TOPS_S3_HAVE=[]'; });
  const re = /(?<=['"`(\s,])(?:\.\/)?((?:assets|img|rig|s3|ui)\/[A-Za-z0-9_\-./]+\.[A-Za-z0-9]{2,5})(?=[?#'"`)\s,])/g; const paths = new Set();
  for (let m; (m = re.exec(src));) if (!/\$\{/.test(m[1])) paths.add(m[1]);
  let man = null; try { const r = await fetch(URL0 + 's3/manifest.json?sweep=' + Date.now()); if (r.ok) man = await r.json(); } catch (e) {}
  if (man) { (man.files || []).forEach(f => paths.add(f)); }
  have.forEach(k => paths.add('s3/' + k));
  const opt = new Set((man && man.optional) || []); const list = [...paths].filter(f => !opt.has(f) && !OPTIONAL.some(o => o.test('/' + f)));
  const bad = []; let i = 0;
  await Promise.all(Array.from({ length: 8 }, async () => { while (i < list.length) { const f = list[i++]; let st = 0; for (let t = 0; t < 2 && st !== 200; t++) { try { st = (await fetch(URL0 + f, { method: 'HEAD' })).status; } catch (e) { st = 'net'; } } if (st !== 200) bad.push(`${st} ${f}`); } }));
  return { files: list.length, manifest: !!man, bad };
}
(async () => {
  let sw; try { sw = await sweep(); } catch (e) { sw = { files: 0, bad: ['sweep stopped: ' + String(e.message || e).slice(0, 120)] }; }
  console.log(`${sw.bad.length ? 'FAIL' : 'PASS'} file sweep: ${sw.files} files named by the live page${sw.manifest ? ' + s3/manifest.json' : ''}${sw.bad.length ? ', not served: ' + sw.bad.slice(0, 8).join(', ') + (sw.bad.length > 8 ? ` (+${sw.bad.length - 8})` : '') : ', all 200'}`);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const all = []; let bad = 0;
  for (const dev of devs.split(',').map(s => s.trim()).filter(Boolean)) {
    const tag = dev.replace(/\s/g, ''), r = { device: dev, fails: [] }; const T0 = Date.now(); const sec = () => +((Date.now() - T0) / 1000).toFixed(1);
    const ctx = await b.newContext({ ...devices[dev] }); const p = await ctx.newPage(); const pe = [], failed = [];
    p.on('pageerror', e => pe.push(e.message.slice(0, 160)));
    // THREE_JS=<path>: serve three.js locally (only for running this check where cdnjs is unreachable; never set in CI)
    if (process.env.THREE_JS) await p.route(/cdnjs\.cloudflare\.com\/.*three\.min\.js/, q => q.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(process.env.THREE_JS, 'utf8') }));
    p.on('response', q => { const u = q.url(); if (u.startsWith(origin) && q.status() >= 400 && !OPTIONAL.some(o => o.test(u))) failed.push(q.status() + ' ' + u.replace(origin, '')); });
    p.on('requestfailed', q => { const u = q.url(); const why = (q.failure() && q.failure().errorText) || ''; if (u.startsWith(origin) && !/ERR_ABORTED/.test(why) && !OPTIONAL.some(o => o.test(u))) failed.push('fail ' + u.replace(origin, '') + ' ' + why); });
    try {
      await p.goto(URL0 + (URL0.includes('?') ? '&' : '?') + 'qa=' + Date.now(), { timeout: 120000 });
      await p.waitForFunction(() => { const l = document.getElementById('loading'); return !l || l.classList.contains('gone') || getComputedStyle(l).display === 'none'; }, null, { timeout: 120000 });
      r.loader_s = sec();
      r.version = await p.evaluate(() => window.TOPS_VER || (typeof TOPS_VER !== 'undefined' ? TOPS_VER : null)).catch(() => null);
      r.s3 = await p.evaluate(() => !!window.TOPS_S3FLAG).catch(() => null);
      if (want && want !== '-' && String(r.version) !== String(want)) r.fails.push(`page is version ${r.version}, release is ${want}`);
      await p.waitForTimeout(2000); await p.screenshot({ path: path.join(outDir, `${tag}_1_open.png`) });
      // a career match as a new player starts one (Circuit in Season 3, the career fixture otherwise)
      r.start = await p.evaluate(() => { save.authSeen = true; save.name = 'QA live'; save.lessonDone = true; save.totThrows = 500; ['login', 'creator'].forEach(id => { const e = document.getElementById(id); if (e) e.hidden = true; });
        if (!career()) newCareer(); persist(); if (window.TOPS_S3FLAG && window.TOPS_S3) { TOPS_S3.book('pub_night'); TOPS_S3._playNow(); return 'circuit'; } beginMatch({ mode: 'career', tier: 0, p0: 'QA live', oppName: 'Pete', oppAvg: 45, legs: 3 }); return 'career'; });
      await p.waitForFunction(() => typeof S !== 'undefined' && S && S.p && S.p[1], null, { timeout: 120000 });
      r.match_s = sec(); r.opp = await p.evaluate(() => S.p[1].name);
      await p.waitForTimeout(2500); await p.screenshot({ path: path.join(outDir, `${tag}_2_match.png`) });
      // three darts by touch on the pull pad, released at the perfect moment (the game times from the events' own stamps)
      let thrown = 0;
      for (let tries = 0; thrown < 3 && tries < 400; tries++) {
        const st = await p.evaluate(() => { if (!S || S.done) return { done: 1 }; const it = document.getElementById('intro'); if (it && it.classList.contains('show')) it.click(); const pad = document.getElementById('pullPad'); const bb = pad && pad.getBoundingClientRect(); return { can: typeof padCanPull === 'function' && padCanPull(), x: bb ? bb.x + bb.width / 2 : 0, y: bb ? bb.y + bb.height / 2 : 0, w: bb ? bb.width : 0 }; });
        if (st.done) break; if (!st.can || !st.w) { await p.waitForTimeout(150); continue; }
        const d = await p.evaluate(({ x, y }) => { const pad = document.getElementById('pullPad'); const o = { bubbles: true, cancelable: true, pointerId: 9, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y };
          const n0 = (S.p[0].darts || 0) + (S.bull ? 100 : 0); pad.dispatchEvent(new PointerEvent('pointerdown', o)); if (!S.pulling) return null;
          const tgt = S.pullStart + S.pullMs * SWEET + 35; while (performance.now() < tgt) {} pad.dispatchEvent(new PointerEvent('pointerup', o)); if (S.pulling) document.dispatchEvent(new PointerEvent('pointerup', o));
          return { rel: S.relMs, perfect: !!S.perfect }; }, st);
        if (d) { thrown++; (r.darts = r.darts || []).push(d); await p.waitForTimeout(1500); }
      }
      if (thrown < 3) r.fails.push(`only ${thrown} of 3 darts could be thrown by touch`);
      r.myDarts = await p.evaluate(() => S.p[0].darts || 0);
      await p.screenshot({ path: path.join(outDir, `${tag}_3_after.png`) });
    } catch (e) { r.fails.push('stopped: ' + String(e.message || e).split('\n')[0].slice(0, 160)); try { await p.screenshot({ path: path.join(outDir, `${tag}_x_error.png`) }); } catch (x) {} }
    if (pe.length) r.fails.push('page errors: ' + pe.slice(0, 3).join(' | '));
    if (failed.length) r.fails.push(`${failed.length} file(s) failed: ` + [...new Set(failed)].slice(0, 6).join(', '));
    r.total_s = sec(); r.pageErrors = pe.length; r.failedFiles = failed.length; if (r.fails.length) bad++;
    console.log(`${r.fails.length ? 'FAIL' : 'PASS'} ${dev}: v${r.version} s3=${r.s3} loader ${r.loader_s}s, ${r.start} match vs ${r.opp} at ${r.match_s}s, darts ${(r.darts || []).length}/3 (${(r.darts || []).map(x => x.perfect ? 'perfect' : Math.round(x.rel) + 'ms').join(', ')})${r.fails.length ? '\n  ' + r.fails.join('\n  ') : ''}`);
    all.push(r); await ctx.close();
  }
  if (sw.bad.length) bad++;
  fs.writeFileSync(path.join(outDir, 'live-check.json'), JSON.stringify({ sweep: sw, phones: all }, null, 1));
  await b.close();
  console.log(bad ? `LIVE-CHECK FAIL (${bad} problem(s): file sweep + ${all.length} phones)` : `LIVE-CHECK PASS (file sweep + ${all.length} phones)`); process.exit(bad ? 1 : 0);
})().catch(e => { console.error('LIVE-CHECK ERROR', e); process.exit(3); });
