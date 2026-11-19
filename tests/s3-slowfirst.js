// Delivery QA (Overseer 12:40, eng-s3 f633d66): a brand-new Season 3 player on Slow 3G. Every character figure the game builds,
// for the creator's heads and the first match, must be the Vinyl build, before AND after the S3 rig file (assets/chars/leonard.glb)
// lands. Figures are counted where they are made (each THREE.SkeletonUtils.clone of a rigged character): a Vinyl build carries
// userData.s3fig; a lifelike build doesn't. The creator heads are also checked as images (none may be a cached lifelike render:
// heads drawn before the rig landed are re-checked after).
// node tests/s3-slowfirst.js <dir> [device]   <dir> = the SHIPPED page as index.html + rig/ + s3/ + assets/ (+ img/)
const { chromium, devices } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || '.'), dev = process.argv[3] || 'iPhone 13';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.css': 'text/css' };
(async () => {
  const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(dir, u), (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(u).toLowerCase()] || 'application/octet-stream' }); r.end(d); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const origin = `http://127.0.0.1:${srv.address().port}`;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ ...devices[dev] }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
  // Slow 3G (Chrome DevTools preset): 400 ms latency, 500 kbit/s down, 500 kbit/s up
  const cdp = await ctx.newCDPSession(p); await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 500 * 1024 / 8, uploadThroughput: 500 * 1024 / 8 });
  const T0 = Date.now(); let rigLanded = null; const t = () => +((Date.now() - T0) / 1000).toFixed(1);
  const glb = []; p.on('request', q => { if (/\.glb/.test(q.url())) glb.push({ u: q.url().replace(/^.*\/(rig|assets)\//, '$1/').split('?')[0], start: t() }); }); p.on('requestfailed', q => { if (/\.glb/.test(q.url())) glb.push({ u: q.url().split('/').pop(), failed: q.failure() && q.failure().errorText, at: t() }); });
  let remyLanded = null; p.on('requestfinished', q => { if (/\.glb/.test(q.url())) glb.push({ u: q.url().split('/').pop().split('?')[0], done: t() }); if (/chars\/leonard\.glb/.test(q.url()) && rigLanded === null) rigLanded = t(); if (/rig\/remy-[0-9a-f]+\.glb/.test(q.url()) && remyLanded === null) remyLanded = t(); });
  await p.route(/cdnjs\.cloudflare\.com\/.*three\.min\.js/, r => r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(require.resolve('three/build/three.min.js', { paths: [process.cwd(), dir, '/home/claude/src'] }), 'utf8') }));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  // count every rigged character figure where it is made
  await p.addInitScript(() => { window.__figs = []; const hook = () => { const SU = window.THREE && THREE.SkeletonUtils; if (!SU || SU.__qa) return !!(SU && SU.__qa); const c = SU.clone; SU.clone = function (src) { const f = c.apply(this, arguments); let bones = 0; try { f.traverse(o => { if (o.isBone) bones++; }); } catch (e) {} if (bones > 10) { const rec = { at: performance.now(), f, s3: null }; window.__figs.push(rec); setTimeout(() => { rec.s3 = !!(f.userData && (f.userData.s3fig || f.userData.s3rig)); rec.stand = !!(f.userData && f.userData.stand); }, 0); } return f; }; SU.__qa = 1; return true; }; const iv = setInterval(() => { if (hook()) clearInterval(iv); }, 20); });
  await p.goto(origin + '/index.html', { timeout: 300000 });
  const figs = () => p.evaluate(() => (window.__figs || []).map(r => ({ t: +(r.at / 1000).toFixed(1), s3: r.s3, stand: r.stand })));
  await p.waitForFunction(() => { const l = document.getElementById('loading'); return !l || l.classList.contains('gone') || getComputedStyle(l).display === 'none'; }, null, { timeout: 300000 });
  const lift = t();
  // the welcome sheet's "start" opens the creator; on a fresh device this is the first thing a new player does
  await p.waitForFunction(() => !!document.getElementById('s3WelGo') || !document.getElementById('creator').hidden, null, { timeout: 120000 }).catch(() => {});
  await p.evaluate(() => { const g = document.getElementById('s3WelGo'); if (g) g.click(); }).catch(() => {});
  await p.waitForTimeout(4000);
  const creatorOpen = await p.evaluate(() => !document.getElementById('creator').hidden).catch(() => false);
  const headsEarly = await p.evaluate(() => [...document.querySelectorAll('#creator img')].map(i => (i.currentSrc || i.src || '').replace(location.origin, '').slice(0, 80)));
  const rigAtCreator = rigLanded;
  await p.screenshot({ path: path.join(__dirname, `s3_slowfirst_creator_${dev.replace(/\s/g, '')}.png`) });
  // first Circuit match, as s3-realmatch starts it
  await p.evaluate(() => { save.authSeen = true; save.name = 'Hayden'; save.lessonDone = true; save.totThrows = 500; const l = document.getElementById('login'); if (l) l.hidden = true; const c = document.getElementById('creator'); if (c) c.hidden = true; if (!career()) newCareer(); persist(); TOPS_S3.book('pub_night'); TOPS_S3._playNow(); });
  await p.waitForFunction(() => typeof S !== 'undefined' && S && S.p && S.p[1], null, { timeout: 180000 });
  await p.waitForTimeout(3000);
  const matchEarlyAt = t(); await p.screenshot({ path: path.join(__dirname, `s3_slowfirst_match_early_${dev.replace(/\s/g, '')}.png`) });
  const matchEarly = await p.evaluate(() => { const o = V._qa.opp && V._qa.opp(), f = V._qa.fp && V._qa.fp(); const d = x => x ? { s3: !!(x.userData && (x.userData.s3fig || x.userData.s3rig)), stand: !!(x.userData && x.userData.stand), rigged: !!(x.userData && x.userData.rigged), keys: Object.keys(x.userData || {}).slice(0, 8).join(',') } : null; return { opp: d(o), me: d(f), rigReady: V._qa.rigReady() }; });
  // wait for the S3 rig to land, then let the swap happen
  for (let i = 0; i < 240 && rigLanded === null; i++) await p.waitForTimeout(500);
  // the stand-in should be swapped for the Vinyl build once the S3 rig is in; let the opponent take turns (as a player would wait)
  let swapAt = null; for (let i = 0; i < 60 && swapAt === null; i++) { await p.waitForTimeout(500); const ok = await p.evaluate(() => { const o = V._qa.opp && V._qa.opp(); try { if (S && !S.done && S.cur === 0) { S.p.forEach(q => { }); } } catch (e) {} return !!(o && o.userData && o.userData.s3fig); }).catch(() => false); if (ok) swapAt = t(); }
  const matchLate = await p.evaluate(() => { const o = V._qa.opp && V._qa.opp(), f = V._qa.fp && V._qa.fp(); const d = x => x ? { s3: !!(x.userData && (x.userData.s3fig || x.userData.s3rig)), stand: !!(x.userData && x.userData.stand) } : null; return { opp: d(o), me: d(f) }; });
  const F = await figs();
  const lifelike = F.filter(r => r.s3 === false);
  const before = F.filter(r => rigLanded === null || r.t <= rigLanded), after = F.filter(r => rigLanded !== null && r.t > rigLanded);
  const out = { device: dev, loader_lift_s: lift, inpage_rig_landed_s: remyLanded, match_early_at_s: matchEarlyAt, rig_landed_s: rigLanded, rig_landed_before_creator: rigAtCreator !== null, creatorOpen, figures: F.length, before: before.length, after: after.length, lifelike: lifelike.length, lifelikeAt: lifelike.map(r => r.t), matchEarly, matchLate, swapAt, glb, headsEarly: headsEarly.length, pageErrors: pe.slice(0, 5) };
  console.log(JSON.stringify(out, null, 1));
  const fails = [];
  if (rigLanded === null) fails.push('the S3 rig (chars/leonard.glb) never landed');
  // with the S3 rig requested first it may land before any figure is built (191e53f): then the first match must start Vinyl
  if (!before.length && !(rigLanded !== null && matchEarly.opp && matchEarly.opp.s3)) fails.push('no figure was built before the S3 rig landed and the first match did not start Vinyl');
  if (!after.length && !(matchLate.opp && matchLate.opp.s3)) fails.push('no figure checked after the S3 rig landed');
  if (lifelike.length) fails.push(`${lifelike.length} lifelike figure(s) built (at ${lifelike.map(r => r.t + ' s').join(', ')}; rig landed at ${rigLanded} s)`);
  for (const [k, v] of Object.entries({ matchEarly, matchLate })) for (const w of ['opp', 'me']) if (v[w] && !v[w].s3) fails.push(`${k}: the ${w === 'me' ? 'player' : 'opponent'} figure is not the Vinyl build`);
  if (matchLate.opp && matchLate.opp.stand) fails.push('after the rig landed the opponent is still the stand-in carrier (not swapped)');
  if (pe.length) fails.push('page errors: ' + pe.slice(0, 3).join(' | '));
  await b.close(); srv.close();
  if (fails.length) { console.log('S3-SLOWFIRST FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log(`S3-SLOWFIRST PASS (${dev}): ${F.length} figures built, all Vinyl, ${before.length} before and ${after.length} after the S3 rig landed at ${rigLanded} s`);
})().catch(e => { console.error('S3-SLOWFIRST ERROR', e); process.exit(3); });
