// REN-WI (Hayden 22 Nov, Director doc 80): the Club opponent Tama Rewiri is renamed Wiremu 'Wi' Rewiri, so he no longer clashes with the
// player base Tama. Checks:
//   1 his look is pinned: every name-seeded part (lookFor, the Season 3 look s3Look, the model pick, the named variant, the lash check) is identical
//   2 no clash: the opponent lists name him once, nobody else is Wiremu / Wi / Rewiri, the player base Tama is still Tama
//   3 the name everywhere: his profile (temper, habit), commentary pack, season and fixture lines, the contracts he gives ('Wi'), his card
//     (id 'tama' kept, shown as 'Wi'), his card art in the first-night sheet; no 'Tama Rewiri' left in the game's own files
//   4 saves: a save from before the rename (next match, fixtures, table, history, a head-to-head keyed by his name, a contract from 'Tama', the
//     Tama base on the player, card 'tama') loads with him renamed everywhere, the player base and card id untouched, and a match against him starts
//   5 an older copy can't bring the old name back: a write cleans it, netAdopt and v11's adopt rename it; a head-to-head under both names merges
// usage: node tests/ren-wi.js [absolute dir]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const http = require('http'); const dir = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const fp = path.join(dir, u === '/' ? 'index.html' : u); if (!fp.startsWith(dir)) { r.writeHead(403); return r.end(); }
  fs.readFile(fp, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(fp)] || 'application/octet-stream' }); r.end(d); }); });
const f = []; const out = {};
// 3 (files): the old full name is gone from the game's own files, except the pin and the save migration that name it on purpose
for (const fn of ['game4.js', 'career3.js', 'v041.js', 'tc/data.js', 'rb/s3.js', 'head3.html', 'rb/rb.js', 'tc/circuit.js']) { if (!fs.existsSync(path.join(dir, fn))) continue;
  const lines = fs.readFileSync(path.join(dir, fn), 'utf8').split('\n').filter(l => l.includes('Tama Rewiri') && !/NAME_PIN|REN-WI|was Tama/.test(l)); if (lines.length) f.push(`3 'Tama Rewiri' still in ${fn}: ${lines[0].slice(0, 120)}`); }
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); const url = 'http://127.0.0.1:' + srv.address().port + '/index.html?s3=1';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader'] }); const ctx = await b.newContext(); const p = await ctx.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  const load = async () => { await p.goto(url, { timeout: 120000 }); await p.waitForFunction(() => window.TOPS_S3 && window.C3 && window.TOPS_RENWI, null, { timeout: 180000 }); await p.waitForTimeout(1500); };
  await load();
  out.a = await p.evaluate(() => { const o = {}; const N = 'Wiremu Rewiri', O = 'Tama Rewiri';
    o.look = JSON.stringify(lookFor(N)) === JSON.stringify(lookFor(O));
    /* _nm (the name it carries) differs by design: its only reader, v3Cast, pins it */ const s3 = n => { try { const L = TOPS_S3FIG.look(lookFor(n), n, false); return JSON.stringify(L, (k, v) => typeof v === 'function' || k === '_nm' ? undefined : v); } catch (e) { return 'err ' + e; } }; o.s3 = s3(N) === s3(O) && !/^err/.test(s3(N)); o.s3d = o.s3 ? '' : (() => { try { const x = JSON.parse(s3(N)), y = JSON.parse(s3(O)); return Object.keys(Object.assign({}, x, y)).filter(k => JSON.stringify(x[k]) !== JSON.stringify(y[k])).map(k => k + ':' + JSON.stringify(x[k]) + '/' + JSON.stringify(y[k])); } catch (e) { return String(e); } })(); o.hash = hash(N) === hash(O); o.extra = JSON.stringify(lookFor('Wi')) === JSON.stringify(lookFor('Tama'));
    try { o.model = V.oppVar ? JSON.stringify(V.oppVar(N, 'lewis')) === JSON.stringify(V.oppVar(O, 'lewis')) : 'n/a'; } catch (e) { o.model = String(e); }
    const all = AINAMES.flat(); o.count = all.filter(x => x === N).length; o.old = all.filter(x => x === O).length; o.clash = all.filter(x => x !== N && /wiremu|rewiri|^wi\b/i.test(x));
    o.base = (window.TOPS_S3_BASES || []).find(x => x.id === 'tama'); o.base = o.base && o.base.name;
    o.opp = !!OPPS[N] && !OPPS[O] && OPPS[N].temper;
    return o; });
  const a = out.a;
  if (!a.look || !a.s3 || !a.hash || !a.extra || a.model === false) f.push('1 his look must stay his: ' + JSON.stringify(a));
  if (a.count !== 1 || a.old || a.clash.length || a.base !== 'Tama') f.push('2 no clash: named once, old name gone, nobody else Wiremu/Wi/Rewiri, the base still Tama ' + JSON.stringify(a));
  const v041 = fs.readFileSync(path.join(dir, 'v041.js'), 'utf8'); a.pack = v041.includes('"Wiremu Rewiri": {') && !v041.includes('"Tama Rewiri"');
  if (a.opp !== 'Ice' || !a.pack) f.push('3 his profile and commentary pack follow the new name ' + JSON.stringify(a));
  // 3 text: dialogue + contracts + card
  const g4 = fs.readFileSync(path.join(dir, 'game4.js'), 'utf8'), c3 = fs.readFileSync(path.join(dir, 'career3.js'), 'utf8'), td = fs.readFileSync(path.join(dir, 'tc/data.js'), 'utf8');
  if ((g4.match(/\/tama\/i\.test\(String\(L\.base\|\|pinName\(L\.name\)/g) || []).length !== 2) f.push('1 the lash check reads the pinned name (both eye paths)');
  if (!/const s3h=s=>\{s=pinName\(s\);/.test(g4)) f.push('1 the Season 3 look seed (s3h) is pinned');
  if (!/Wi from the RSA here/.test(g4) || !/I ring Wi at the RSA/.test(g4) || !/reckons Wi from the RSA/.test(g4)) f.push('3 his messages say Wi');
  if (!/const FROM=\[[^\]]*'Wi'/.test(c3) || /const FROM=\[[^\]]*'Tama'/.test(c3)) f.push('3 contracts come from Wi');
  if (!/\['tama', 3, 'Wi',/.test(td)) f.push('3 his card keeps id tama and shows Wi');
  // 4 an old save: him everywhere, the player on the Tama base
  await p.evaluate(() => { save.authSeen = true; $('login').hidden = true; save.name = 'Hayden'; newCareer(); const c = career();
    c.next = { oppName: 'Tama Rewiri', oppKey: 'Tama Rewiri', oppAvg: 64, legs: 3, fixture: true };
    c.renTest = { fixtures: ['Tama Rewiri', 'Kev Marsh'], table: [{ name: 'Tama Rewiri', avg: 64 }, { name: 'Kev Marsh', avg: 68 }], h2h: { 'Tama Rewiri': { w: 2, l: 1 } }, h2hBoth: { 'Tama Rewiri': { w: 2, l: 1, res: ['W 2-0', 'L 1-2', 'W 2-1'] }, 'Wiremu Rewiri': { w: 1, l: 0, res: ['W 2-1'] } }, line: 'Lost to Tama Rewiri 2-1', con: [{ id: 'tons', from: 'Tama' }, { id: 'x', from: 'Kev' }] };
    if (typeof save.look !== 'object' || !save.look) save.look = {}; save.look.base = 'tama'; save.look.s3base = 'tama'; save.renCard = ['tama'];
    // written raw, as the old build wrote it (no migration on this write)
    const k = TOPS_SAVE_NS.key; save.sv = (save.sv || 0) + 1; localStorage.setItem(k, JSON.stringify(save)); });
  await load();
  out.s = await p.evaluate(() => { const c = career(); return { next: c.next && [c.next.oppName, c.next.oppKey], rt: c.renTest, base: save.look && [save.look.base, save.look.s3base], card: save.renCard, stored: localStorage.getItem(TOPS_SAVE_NS.key).includes('Tama Rewiri') }; });
  const s = out.s, rt = s.rt || {};
  if (JSON.stringify(s.next) !== '["Wiremu Rewiri","Wiremu Rewiri"]') f.push('4 the next match names Wiremu Rewiri ' + JSON.stringify(s.next));
  if (rt.fixtures[0] !== 'Wiremu Rewiri' || rt.table[0].name !== 'Wiremu Rewiri' || !rt.h2h['Wiremu Rewiri'] || rt.h2h['Wiremu Rewiri'].w !== 2 || rt.h2h['Tama Rewiri'] || rt.line !== 'Lost to Wiremu Rewiri 2-1' || rt.con[0].from !== 'Wi' || rt.con[1].from !== 'Kev' || JSON.stringify(rt.h2hBoth) !== JSON.stringify({ 'Wiremu Rewiri': { w: 3, l: 1, res: ['W 2-0', 'L 1-2', 'W 2-1', 'W 2-1'] } })) f.push('4 fixtures, table, head-to-head (kept, re-keyed), history line, contract from Wi ' + JSON.stringify(rt));
  if (JSON.stringify(s.base) !== '["tama","tama"]' || JSON.stringify(s.card) !== '["tama"]') f.push('4 the player base Tama and card id tama are untouched ' + JSON.stringify(s));
  if (s.stored) f.push('4 the migrated save is written back');
  // the match against him starts and names him
  out.m = await p.evaluate(async () => { const c = career(); try { beginMatch({ mode: 'career', tier: 1, p0: 'Hayden', oppName: c.next.oppName, oppKey: c.next.oppKey, oppAvg: 64, legs: 3 }); } catch (e) { return { err: String(e) }; }
    await new Promise(r => setTimeout(r, 2500)); return { name: S && S.p && S.p[1].name, txt: document.body.innerText.includes('Wiremu') }; });
  if (out.m.err || out.m.name !== 'Wiremu Rewiri') f.push('4 a match against him starts ' + JSON.stringify(out.m));
  // 5 an older copy can't bring the old name back: a save written with it is cleaned on the write; the cloud adopt (netAdopt) cleans it too
  out.p = await p.evaluate(() => { career().renW = 'beat Tama Rewiri'; persist(); const st = localStorage.getItem(TOPS_SAVE_NS.key); const r = { persisted: !st.includes('Tama Rewiri') && st.includes('beat Wiremu Rewiri') };
    const o = JSON.parse(st); o.sv = (save.sv || 0) + 9; o.career.next = { oppName: 'Tama Rewiri', oppKey: 'Tama Rewiri', oppAvg: 64, legs: 3 }; o.career.h2h = { 'Tama Rewiri': { w: 4, l: 0, res: [] } };
    try { netAdopt(o); } catch (e) { r.err = String(e); } r.net = career().next && career().next.oppName; r.netH = career().h2h && Object.keys(career().h2h); r.netStored = !localStorage.getItem(TOPS_SAVE_NS.key).includes('Tama Rewiri'); return r; });
  if (!out.p.persisted) f.push('5 a save written with the old name is cleaned on the write ' + JSON.stringify(out.p));
  if (out.p.err || out.p.net !== 'Wiremu Rewiri' || JSON.stringify(out.p.netH) !== '["Wiremu Rewiri"]' || !out.p.netStored) f.push('5 an older cloud copy (netAdopt) is renamed and stored clean ' + JSON.stringify(out.p));
  // 5 another device's old save through v11's adopt (car-tabs exports it)
  out.c = await p.evaluate(() => { if (!window.TOPS_SAVEV || !TOPS_SAVEV.adopt) return { skip: 1 }; const o = JSON.parse(JSON.stringify(save)); o.sv = (save.sv || 0) + 5; o.dev = 'other'; o.career.next = { oppName: 'Tama Rewiri', oppKey: 'Tama Rewiri', oppAvg: 64, legs: 3 };
    TOPS_SAVEV.adopt(o, 'pull'); return { next: career().next.oppName }; });
  if (!out.c.skip && out.c.next !== 'Wiremu Rewiri') f.push('5 an old save from another device is renamed when loaded ' + JSON.stringify(out.c));
  if (pe.length) f.push('page errors ' + pe.slice(0, 2).join(' | '));
  await b.close(); srv.close();
  if (f.length) { console.log('FAIL\n- ' + f.join('\n- ') + '\n' + JSON.stringify(out).slice(0, 1500)); process.exit(1); }
  console.log(`PASS: Wiremu 'Wi' Rewiri keeps Tama Rewiri's look (lookFor, hash, model variant, the club extra); named once, no clash, the player base is still Tama; profile (${a.opp}), commentary, messages, contracts and card follow; an old save loads renamed everywhere (head-to-head re-keyed, contract from Wi) with the Tama base and card id untouched; a match against him starts; head-to-heads under both names merge (w ${3}/l 1, results joined); a write and a cloud adopt (netAdopt) can't bring the old name back; ${out.c.skip ? 'no cloud adopt in this build' : 'an old cloud save is renamed on adopt'}`);
})();
