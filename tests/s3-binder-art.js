// EXP-S3-BINDER (live since 4.00, DQ confirmed): on Chromium (Android Chrome, desktop Chrome, Edge) every card face drawn by tc/cards.js
// fill() showed the old lifelike art: the Season 3 picture switch relied on a setter patched onto CSSStyleDeclaration.prototype, which
// Chromium never calls for style.backgroundImage. This runs in Chromium and checks every card in the game: with Season 3 on, the 113 cards
// with a Season 3 redo show the s3/ file, the 8 people without a redo show the plain placeholder, the 23 object cards keep their own
// image; the binder (the screen players saw it on) draws the same; and with Season 3 off every card keeps its original art.
// usage: node tests/s3-binder-art.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const page = async s3 => { const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); p.pe = pe;
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.goto('file://' + dir + '/index.html?s3=' + s3, { timeout: 180000 }); await p.waitForFunction(() => window.TC_DATA && window.TopsCards && window.TC_API, null, { timeout: 180000 }); await p.waitForTimeout(1500); return p; };
  const faces = p => p.evaluate(() => { const art = u => (u.match(/url\("?([^")]+)"?\)/) || [])[1] || '';
    return TC_DATA.CARDS.map(d => { const c = TopsCards.card(d); const a = art(c.querySelector('.tc__art').style.backgroundImage); return { id: d.id, src: d.art, got: a }; }); });
  const kind = r => /^s3\//.test(r.got) ? 's3' : /^data:image\/svg/.test(r.got) ? 'ph' : r.got === r.src ? 'same' : 'other';
  { const p = await page('1'); const on = await p.evaluate(() => !!window.TOPS_S3FLAG); if (!on) fail.push('Season 3 did not switch on');
    const rows = await faces(p); const n = { s3: 0, ph: 0, same: 0, other: 0 }; rows.forEach(r => n[kind(r)]++); out.s3on = Object.assign({ total: rows.length }, n);
    out.other = rows.filter(r => kind(r) === 'other').slice(0, 3).map(r => r.id + ' ' + r.src + ' -> ' + r.got.slice(0, 60)); if (rows.length !== 144 || n.s3 !== 113 || n.ph !== 8 || n.same !== 23 || n.other) fail.push('Season 3 card faces ' + JSON.stringify(out.s3on) + ' (want 144: 113 s3, 8 placeholder, 23 unchanged)');
    const bad = rows.filter(r => kind(r) === 's3' && r.got.split('?')[0] !== 's3/' + r.src).map(r => r.id); if (bad.length) fail.push('s3 file is not the card\'s own redo: ' + bad.slice(0, 5).join(','));
    // the binder, the screen players saw: its card faces come through the same fill()
    const bind = await p.evaluate(async () => { try { save.authSeen = true; const t = TC_API.st(); TC_DATA.CARDS.slice(0, 40).forEach(d => { t.own[d.id] = 1; }); TC_API.binder(); } catch (e) { return { err: e.message }; }
      await new Promise(r => setTimeout(r, 1500)); const arts = [...document.querySelectorAll('.tc-binder .tc__art, [class*="binder"] .tc__art')].map(a => a.style.backgroundImage).filter(Boolean);
      return { n: arts.length, s3: arts.filter(a => /s3\//.test(a)).length, old: arts.filter(a => /url\("?assets\/cards\/art\/(anika|bigmal|deano|jonno|kev|mo|pete|phil|shazza|tama)\./.test(a)).length }; });
    out.binder = bind; if (bind.err || !(bind.n > 0) || !(bind.s3 > 0) || bind.old) fail.push('binder ' + JSON.stringify(bind));
    // the picture actually loads (a sample of the s3 files)
    const ok = await p.evaluate(async () => { const us = TC_DATA.CARDS.map(d => (TopsCards.card(d).querySelector('.tc__art').style.backgroundImage.match(/url\("?([^")]+)"?\)/) || [])[1]).filter(u => u && /^s3\//.test(u)).slice(0, 12);
      const r = await Promise.all(us.map(u => new Promise(ok => { const im = new Image(); im.onload = () => ok(im.naturalWidth > 0); im.onerror = () => ok(false); im.src = u; }))); return r.filter(Boolean).length + '/' + r.length; });
    out.load = ok; if (!/^(\d+)\/\1$/.test(ok)) fail.push('s3 card files did not load ' + ok);
    if (p.pe.length) fail.push('s3 page errors ' + p.pe.join('; ').slice(0, 200)); await p.close(); }
  { const p = await page('0'); const rows = await faces(p); const changed = rows.filter(r => r.got !== r.src); out.s3off = { total: rows.length, changed: changed.length };
    if (changed.length) fail.push('Season 3 off changed card art ' + changed.slice(0, 3).map(r => r.id + ':' + r.got.slice(0, 40)).join(' '));
    if (p.pe.length) fail.push('s3 off page errors ' + p.pe.join('; ').slice(0, 200)); await p.close(); }
  console.log(JSON.stringify(out)); console.log(fail.length ? 's3-binder-art FAIL: ' + fail.join('; ') : 's3-binder-art PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
