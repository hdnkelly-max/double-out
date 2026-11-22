// CAR-PRESTIGE doc 82 (Director): (1) the Trans-Tasman edition reads at match size: your dart wears the edition's cap (shaft top), point ring and
// two barrel bands in Australia green, while its length, tip and every part of the 4.30 dart stay; no other dart changes (the default set,
// editions without a cap colour, the opponent's). (2) the Locker Loadout's Equipped darts card renders the set you throw when you wear an edition,
// and keeps the stock photo without one. v2 and ?v3=1. usage: node tests/s3-gear83.js <dir>
const { chromium, devices } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
(async () => { const dir = path.resolve(process.argv[2] || path.resolve(__dirname, '..'));
  const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(dir, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': /\.html$/.test(u) ? 'text/html' : /\.js$/.test(u) ? 'text/javascript' : /\.css$/.test(u) ? 'text/css' : /\.jpg$/.test(u) ? 'image/jpeg' : /\.png$/.test(u) ? 'image/png' : 'application/octet-stream' }); r.end(d); }); }).listen(0);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const fail = [], out = {};
  for (const v3 of [0, 1]) { const p = await (await b.newContext({ ...devices['iPhone 13'] })).newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.addInitScript(v3 => { try { localStorage.setItem('tops_s3', '1'); localStorage.setItem('tops_s3_welcome', '1'); if (v3) localStorage.setItem('tops_v3', '1'); else localStorage.removeItem('tops_v3'); } catch (e) {} }, v3);
    await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1&v3=${v3}`); await p.waitForFunction(() => typeof V !== 'undefined' && V._qa && V._qa.rigReady && V._qa.rigReady() && window.TOPS_GEAR, null, { timeout: 240000 });
    const r = await p.evaluate(() => { const parts = d => { const o = []; d.traverse(m => { if (!m.isMesh) return; const a = m.geometry.attributes.position; let h = 0; for (let i = 0; i < a.array.length; i += 5) h = (h * 31 + Math.round(a.array[i] * 1e5)) | 0; o.push([a.count + ':' + h, m.position.toArray().map(v => +v.toFixed(5)).join(), m.material.color ? m.material.color.getHexString() : '', m.material.roughness, m.material.metalness, !!m.material.map].join('/')); }); return { tip: d.userData.tipZ, o, len: (() => { const B = new V._qa.T.Box3().setFromObject(d); return +(B.max.z - B.min.z).toFixed(5); })() }; };
      const R = {}; for (const ed of [null, 'pub', 'dpnz', 'tt', 'card', 'worlds']) { window.TOPS_GEAR_PREVIEW = ed; R[ed || 'none'] = { mine: parts(V.myDart(save.flight)), opp: parts(V.oppDart('Big Mal')) }; window.TOPS_GEAR83 = 0; R[(ed || 'none') + '_off'] = { mine: parts(V.myDart(save.flight)) }; window.TOPS_GEAR83 = undefined; } window.TOPS_GEAR_PREVIEW = null; return R; });
    const tag = 'v3=' + v3, same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    // (1) TT: the 4.30 parts all still there, plus 4 parts (cap, ring, 2 bands) in green; tip unchanged
    const tt = r.tt.mine, ttOff = r.tt_off.mine; const added = tt.o.filter(x => !ttOff.o.includes(x));
    if (tt.tip !== ttOff.tip) fail.push(tag + ' TT tip moved ' + ttOff.tip + ' -> ' + tt.tip);
    if (!ttOff.o.every(x => tt.o.includes(x))) fail.push(tag + ' TT lost or changed a 4.30 part');
    if (added.length !== 4 || !added.every(x => x.split('/')[2] === '00843d')) fail.push(tag + ' TT edition parts: want 4 green (cap, ring, 2 bands), got ' + JSON.stringify(added.map(x => x.split('/')[2])));
    if (Math.abs(tt.len - ttOff.len) > 1e-5) fail.push(tag + ' TT dart length changed ' + ttOff.len + ' -> ' + tt.len);
    // nothing else changes: editions without a cap colour, the default dart and every opponent dart
    for (const ed of ['none', 'pub', 'dpnz', 'card', 'worlds']) if (!same(r[ed].mine, r[ed + '_off'].mine)) fail.push(tag + ' ' + ed + ': your dart changed');
    for (const ed of ['pub', 'dpnz', 'tt', 'card', 'worlds']) if (!same(r[ed].opp.o.map(x => x.replace(/\/(true|false)$/, '')), r.none.opp.o.map(x => x.replace(/\/(true|false)$/, '')))) fail.push(tag + ' ' + ed + ': the opponent dart changed');
    // (2) the Loadout card
    const card = async ed => { await p.evaluate(ed => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; try { $('login').hidden = true; } catch (e) {} if (!career()) { newCareer(); persist(); } window.TOPS_GEAR_PREVIEW = ed; showHub(); }, ed); await p.waitForTimeout(1500);
      await p.getByText('Locker', { exact: true }).first().click({ timeout: 8000 }).catch(() => {}); await p.waitForTimeout(1500); await p.getByText('Loadout', { exact: true }).first().click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(1200);
      return p.evaluate(() => { const c = [...document.querySelectorAll('.rb-card')].find(e => /darts/i.test(e.innerText) && /equipped/i.test(e.innerText) && e.querySelector(".rb-im")); const im = c && c.querySelector('.rb-im'); return im ? getComputedStyle(im).backgroundImage.slice(0, 60) : 'no card'; }); };
    out[tag] = { none: await card(null), tt: await card('tt'), worlds: await card('worlds') };
    if (!/^url\("data:image/.test(out[tag].tt) || !/^url\("data:image/.test(out[tag].worlds)) fail.push(tag + ' Loadout card with an edition is not the rendered set: ' + JSON.stringify(out[tag]));
    if (/data:image/.test(out[tag].none) || out[tag].none === 'no card') fail.push(tag + ' Loadout card without an edition is not the stock photo: ' + out[tag].none); if (pe.length) fail.push(tag + ' page errors ' + pe.slice(0, 2).join('; '));
    await p.close(); }
  console.log(JSON.stringify(out)); console.log(fail.length ? 'S3-GEAR83 FAIL ' + fail.join('; ') : 'S3-GEAR83 PASS (TT: cap, point ring and 2 barrel bands in green, tip and length unchanged; default, Pub, DPNZ, Tour Card, Worlds and every opponent dart unchanged; the Loadout card renders the worn set, v2 and v3)'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
