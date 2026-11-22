// Director doc 76c (Experience owns it): the walk-on's tracking camera under v3. Today's tracking shot (set for the old rig) sits inside
// the v3 head; under v3 the default is now the pull-back (TOPS_WALK76 unset = 1: eye 1.25 m, look-at 1.15 m, 2.3x the distance).
// Checks, at a 360 x 640 phone, the walk-on frozen in the tracking beat (k .40): v3 default = the pull-back; v3 with ?walk76=0 = today's
// camera; v3 off with ?walk76=2 = today's camera (v2 untouched whatever the switch says); the spare darts end at their own scale.
// usage: node tests/s3-walk76.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const http = require('http');
const dir = path.resolve(process.argv[2] || path.resolve(__dirname, '..'));
const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(dir, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'content-type': /\.html$/.test(u) ? 'text/html' : /\.js$/.test(u) ? 'text/javascript' : /\.css$/.test(u) ? 'text/css' : 'application/octet-stream' }); r.end(d); }); }).listen(0);
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const fail = [], out = {};
  const run = async (tag, q) => {
    const ctx = await b.newContext({ viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); sessionStorage.removeItem('tcWalkSeen'); } catch (x) {}
      { const ad = DOMTokenList.prototype.add; DOMTokenList.prototype.add = function (...a) { if (a.includes('tc-walking')) window.__walkSeen = 1; return ad.apply(this, a); }; }
      setInterval(() => { const f = window.TOPS_WALKFX; if (!f || f.__w) return; const g = function (now, v) { const r = f.apply(this, arguments);
        try { if (document.body.classList.contains('tc-walking') && v && v.pos) window.__cam = { y: v.pos.y, ly: v.look.y, fov: r && r.fov, d: v.pos.distanceTo(v.look) }; } catch (e) {} return r; }; g.__w = 1; window.TOPS_WALKFX = g; }, 30); });
    await p.route(/supabase\.co|fonts\.(googleapis|gstatic)\.com|jsdelivr/, r => r.abort());
    await p.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js/, r => r.fulfill({ path: dir + '/node_modules/three/build/three.min.js', contentType: 'application/javascript' }));
    await p.goto('http://127.0.0.1:' + srv.address().port + '/index.html' + q, { waitUntil: 'domcontentloaded', timeout: 180000 });
    await p.waitForFunction(() => typeof beginMatch === 'function' && typeof V !== 'undefined' && V._qa && V._qa.rigReady && V._qa.rigReady() && window.TC_API, null, { timeout: 180000 });
    await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; const l = $('login'); if (l) l.hidden = true; newCareer(); { const c = career(); c.stage = 'season'; c.tier = 0; newSeason(c); }
      save.look = Object.assign({}, save.look || {}, { base: 'mia', acc: [] }); save.vlook = { base: 'mia' }; TC_API.grant('walk_power'); TC_API.equip('walk_power'); persist(); try { showHub('play'); } catch (e) {} });
    await p.waitForTimeout(2000); await p.evaluate(() => { try { V.loadAnims(); } catch (e) {} });
    await p.waitForFunction(() => { try { const a = V._qa.animNames(); return a && a.length > 0; } catch (e) { return false; } }, null, { timeout: 90000 }).catch(() => {});
    const sp0 = await p.evaluate(() => { try { return V._qa.meFig().userData.B.LeftHand.children.filter(c => c.userData.spare).map(c => +c.scale.x.toFixed(4)); } catch (e) { return null; } });
    await p.evaluate(() => { try { sessionStorage.removeItem('tcWalkSeen'); } catch (e) {} window.TC_WALK_FREEZE = .4; window.TOPS_WALK76DBG = 1; const n = nextOpponent(); beginMatch({ mode: 'career', tier: 0, p0: 'Hayden', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 50, legs: 3, start: 501 }); });
    const walked = await p.waitForFunction(() => !!window.__walkSeen, null, { timeout: 40000, polling: 100 }).then(() => true, () => false);
    await p.waitForTimeout(5000); const cam = await p.evaluate(() => window.__cam || null);
    const ins = await p.evaluate(() => { const I = window.__ins76; let sc = null; try { sc = V._qa.meFig().userData.B.LeftHand.children.filter(c => c.userData.spare).map(c => +c.scale.x.toFixed(4)); } catch (e) {}
      return I ? { D: I.D, fov: I.fov, gfov: V._qa.camera && +V._qa.camera.fov.toFixed(1), back: I.back, sc } : null; });
    await p.evaluate(() => { window.TC_WALK_FREEZE = null; }); await p.waitForFunction(() => !document.body.classList.contains('tc-walking'), null, { timeout: 20000 }).catch(() => {});
    const sp1 = await p.evaluate(() => { try { return V._qa.meFig().userData.B.LeftHand.children.filter(c => c.userData.spare).map(c => +c.scale.x.toFixed(4)); } catch (e) { return null; } });
    const r = { walked, ins, cam: cam && { y: +cam.y.toFixed(3), ly: +cam.ly.toFixed(3), fov: cam.fov && +cam.fov.toFixed(1), d: +cam.d.toFixed(2) }, sp0, sp1, pe: pe.slice(0, 2) }; out[tag] = r; await ctx.close(); return r; };
  const pull = c => c && Math.abs(c.y - 1.25) < .03 && Math.abs(c.ly - 1.15) < .03;   // position and aim; the returned fov never reaches the camera (Director doc 76d), the pull-back renders at the game's fov as approved
  const a = await run('v3', '?s3=1&v3=1');
  if (!a.walked || !pull(a.cam)) fail.push('v3 default is not the pull-back ' + JSON.stringify(a.cam));
  if (JSON.stringify(a.sp0) !== JSON.stringify(a.sp1)) fail.push('spare darts not back to scale ' + JSON.stringify([a.sp0, a.sp1]));
  const c = await run('v3off', '?s3=1&v3=0&walk76=2');
  if (!c.walked || !c.cam || pull(c.cam)) fail.push('v3 off moved the walk-on camera ' + JSON.stringify(c.cam));
  const z = await run('v3zero', '?s3=1&v3=1&walk76=0');
  if (!z.walked || !z.cam || pull(z.cam) || Math.abs(z.cam.y - c.cam.y) > .05) fail.push('walk76=0 is not today\'s camera ' + JSON.stringify([z.cam, c.cam]));
  if (a.cam && z.cam && !(a.cam.d > z.cam.d * 1.6)) fail.push('pull-back not further than today ' + JSON.stringify([a.cam.d, z.cam.d]));
  // doc 76d: the reworked insert (=2, opt-in): inside it (k .40) the spares are 1.5x, the real camera is at the insert's fov 30, nothing of
  // the figure behind the flights, and the spares go back to their own scale when the walk-on ends
  const d = await run('v3ins', '?s3=1&v3=1&walk76=2');
  if (!d.walked || !d.ins || d.ins.gfov !== 30 || !d.ins.back || !(d.ins.D > .3 && d.ins.D < 2.5) || !d.ins.sc || !d.sp0 || Math.abs(d.ins.sc[0] / d.sp0[0] - 1.5) > .01) fail.push('76d insert ' + JSON.stringify([d.ins, d.sp0]));
  if (JSON.stringify(d.sp0) !== JSON.stringify(d.sp1)) fail.push('76d spares not back to scale ' + JSON.stringify([d.sp0, d.sp1]));
  for (const k of Object.keys(out)) if (out[k].pe.length) fail.push(k + ' page errors ' + out[k].pe.join('; ').slice(0, 200));
  console.log(JSON.stringify(out)); console.log(fail.length ? 's3-walk76 FAIL: ' + fail.join('; ') : 's3-walk76 PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
