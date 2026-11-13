// Roll-out 2 (Hayden 09:05): the Locker hero is the generated locker room with the player from behind in HIS shirt colour (recoloured in
// code), the woman's version when the player's character is a woman (the game's own V.charKey), and the tier scene while it recolours or if
// it fails. usage: node tests/rb-locker.js [dir] [shotsDir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..'), shots = process.argv[3] || '';
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html'); await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_RB, null, { timeout: 180000 }); await p.waitForTimeout(1000);
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); const c = career(); c.stage = 'season'; c.tier = 1; c.bank = 640; newSeason(c); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
  await p.waitForTimeout(4000); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); const t = document.querySelector('#rbTabs [data-t="locker"]'); if (t) t.click(); });
  // shirt colour at a point on the polo (man 900,500; woman 900,560 in the 1200x800 image)
  const probe = async (look, pt) => p.evaluate(async ([look, pt]) => { save.look = Object.assign({}, save.look, look); TOPS_RB.render();
    const first = ($id => ($id('rbLkHero') || {}).style)(id => document.getElementById(id)); const pend = first ? /data:image/.test(first.background) : null;
    for (let i = 0; i < 60; i++) { const e = document.getElementById('rbLkHero'); if (e && /data:image/.test(e.style.background)) break; await new Promise(r => setTimeout(r, 100)); }
    const e = document.getElementById('rbLkHero'); const m = e && e.style.background.match(/url\("?(data:image[^")]+)"?\)/); if (!m) return { ok: false, bg: e ? e.style.background.slice(0, 80) : null };
    const img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = m[1]; }); if (!img) return { ok: false };
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(pt[0], pt[1], 6, 6).data; let r = 0, gg = 0, bb = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; bb += d[i + 2]; }
    const fem = /lk_f/.test(e.style.background) || null; return { ok: true, rgb: [r / 36 | 0, gg / 36 | 0, bb / 36 | 0], w: img.naturalWidth, pendScene: pend === false }; }, [look, pt]);
  const out = {};
  out.blue = await probe({ shirt: '#274a7a', model: 'brian', sex: undefined }, [900, 500]);
  if (shots) await p.screenshot({ path: path.join(shots, 'locker_m.png'), clip: { x: 0, y: 0, width: 390, height: 560 } });
  out.red = await probe({ shirt: '#7a2a2a', model: 'brian' }, [900, 500]);
  out.femGreen = await probe({ shirt: '#2f6b3a', model: 'megan' }, [900, 560]);
  if (shots) await p.screenshot({ path: path.join(shots, 'locker_f.png'), clip: { x: 0, y: 0, width: 390, height: 560 } });
  out.black = await probe({ shirt: '#1c1c1c', model: 'pete' }, [900, 500]);
  out.fem = await p.evaluate(() => { const r = {}; for (const [k, L] of [['megan', { model: 'megan' }], ['elizabeth', { model: 'elizabeth' }], ['brian', { model: 'brian' }]]) { save.look = Object.assign({}, save.look, L); TOPS_RB.render(); r[k] = /lk_f/.test(document.getElementById('rbLkHero').getAttribute('data-base') || '') || null; } return r; });
  out.bad = await p.evaluate(async () => { const u = await new Promise(r => { const x = TOPS_RB.recolour('lk_m', 'not-a-colour', 'FALLBACK', r); if (x) r(x); }); return u; });
  const fail = [], dom = (o, ch) => o && o.ok && o.rgb[ch] > Math.max(...o.rgb.filter((_, i) => i !== ch)) + 15;
  if (!dom(out.blue, 2)) fail.push('blue shirt not blue ' + JSON.stringify(out.blue)); if (!dom(out.red, 0)) fail.push('red shirt not red ' + JSON.stringify(out.red));
  if (!dom(out.femGreen, 1)) fail.push('woman green shirt not green ' + JSON.stringify(out.femGreen));
  if (!(out.black && out.black.ok && Math.max(...out.black.rgb) >= 18)) fail.push('near-black shirt lost its folds (clamp) ' + JSON.stringify(out.black));
  if (!(out.fem.megan && out.fem.elizabeth && !out.fem.brian)) fail.push('woman version not picked from the character ' + JSON.stringify(out.fem));
  if (out.bad !== 'FALLBACK') fail.push('bad colour did not fall back: ' + String(out.bad).slice(0, 40)); if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 150));
  console.log(JSON.stringify(out)); console.log(fail.length ? 'rb-locker FAIL: ' + fail.join('; ') : 'rb-locker PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
