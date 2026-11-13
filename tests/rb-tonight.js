// Roll-out 1 (Hayden 09:05): Tonight's hero is the tier's generated scene with the opponent seen from behind; women opponents get the
// woman's version (incl. the women's names the game draws on men's models); the line under it names the opponent ("Shazza · avg 60"),
// never "Him". Every image must load. usage: node tests/rb-tonight.js [dir] [shotsDir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..'), shots = process.argv[3] || '';
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message)); const bad = []; p.on('requestfailed', r => { if (/tn_t/.test(r.url())) bad.push(r.url()); });
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html'); await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_RB, null, { timeout: 180000 }); await p.waitForTimeout(1000);
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); const c = career(); c.stage = 'season'; c.bank = 640; newSeason(c); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
  await p.waitForTimeout(4000); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  const cases = [];
  for (let t = 0; t <= 6; t++) for (const nm of ['Tama Rewiri', 'Shazza', 'Lisa Tane']) {
    const r = await p.evaluate(([t, nm]) => { const c = career(); c.tier = t; c.next = Object.assign({}, nextOpponent(), { oppName: nm, oppName2: null }); TOPS_RB.render();
      const im = document.querySelector('#rbApp .rb-hero .rb-im'), bg = im ? im.style.background || im.style.backgroundImage : ''; const m = bg.match(/tn_t(\d)(f?)\.jpg/);
      return { t, nm, img: m ? m[0] : null, line: (document.querySelector('#rbApp .rb-line') || {}).textContent || '' }; }, [t, nm]);
    cases.push(r); if (shots && nm !== 'Lisa Tane') { await p.waitForTimeout(700); await p.screenshot({ path: path.join(shots, `tonight_t${t}_${nm.split(' ')[0].toLowerCase()}.png`), clip: { x: 0, y: 0, width: 390, height: 640 } }); }
  }
  // ChatGPT P2: pairs read "Them", and a long first name at 360 px never pushes the page sideways
  await p.setViewportSize({ width: 360, height: 640 });
  const edge = await p.evaluate(() => { const c = career(); c.tier = 2; const n0 = nextOpponent(); const out = {};
    c.next = Object.assign({}, n0, { oppName: 'Kev Marsh', oppName2: 'Kev Marsh & Shane Bell' }); TOPS_RB.render(); out.pair = (document.querySelector('#rbApp .rb-line') || {}).textContent || '';
    c.next = Object.assign({}, n0, { oppName: 'Bartholomew-Alexander Smith', oppName2: null, oppAvg: 100.5 }); TOPS_RB.render(); const l = document.querySelector('#rbApp .rb-line');
    out.long = l ? l.textContent : ''; out.overflow = document.documentElement.scrollWidth > innerWidth || (l && l.scrollWidth > l.clientWidth + 1); return out; });
  await p.setViewportSize({ width: 390, height: 844 });
  const loaded = await p.evaluate(async () => { const out = {}; for (let t = 0; t <= 6; t++) for (const f of ['', 'f']) { const u = `assets/rb/tn_t${t}${f}.jpg`; out[u] = await new Promise(res => { const i = new Image(); i.onload = () => res(i.naturalWidth); i.onerror = () => res(0); i.src = u; }); } return out; });
  const fail = [];
  for (const c of cases) { const f = c.nm !== 'Tama Rewiri'; if (c.img !== `tn_t${c.t}${f ? 'f' : ''}.jpg`) fail.push(`tier ${c.t} ${c.nm}: ${c.img}`); if (/\bHim\b/.test(c.line) || !c.line.includes(c.nm.split(' ')[0] + ' · avg ')) fail.push(`line "${c.line}"`); }
  for (const [u, w] of Object.entries(loaded)) if (w !== 1200) fail.push(`${u} did not load (${w})`);
  if (!/Them · avg /.test(edge.pair) || /\bHim\b/.test(edge.pair)) fail.push('pair line "' + edge.pair + '"'); if (edge.overflow) fail.push('long name overflows at 360: "' + edge.long + '"');
  if (bad.length) fail.push('failed requests ' + bad.join(', ')); if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 150));
  console.log(JSON.stringify(cases.slice(0, 3))); console.log(fail.length ? 'rb-tonight FAIL: ' + fail.slice(0, 6).join('; ') : 'rb-tonight PASS (21 cases + pair + long name at 360, 14 images)'); await b.close(); process.exit(fail.length ? 1 : 0); })();
