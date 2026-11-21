// SWITCH-ON (Producer Sat 20:47): "is Season 3's s3x the default yet?" as one run. Experience's switch-on checklist (EXP-IDLE row), automated:
//   GATE    item 1: every gate test the checklist names, run on this build (a test missing from the build is a FAIL: it isn't shipped yet)
//   SAVES   item 3: copies of real saves, shaped from the db with no personal data (tests/fixtures/switch-on: names, ids, tokens, device ids
//           replaced), opened with s3x=1. Money, XP, level and history must be exactly as saved (the one allowed change is Career's new
//           career().best.legAt, checklist item 10). A mid-season save gets no first-night screen and a shelf built from its own history.
//           A Season 2-only save keeps its Season 2 slot byte for byte.
//   PHONES  item 2's automatable half: iPhone 13, Pixel 7 and a 360 px phone, each a brand-new player: the first night, a whole Pub night
//           (3 results), the Trophies shelf, the titles chip and back. On every screen: no stuck overlay, nothing under MENU, no word split
//           over two lines, no sideways scroll, no page errors. (Hayden's real-phone play stays a manual item.)
// usage: node tests/switch-on.js [dir] [parts]      parts: gate,saves,phones (default all)
//        OUT=<file.json> writes the full result; SHOTS=<dir> saves a screenshot of every checked screen; PHONES='Pixel 7' runs one phone profile
// Exit 0 only if every row passes. The last lines printed are a markdown PASS/FAIL table.
const { chromium, devices } = require('playwright'); const path = require('path'), fs = require('fs'), cp = require('child_process');
const dir = path.resolve(process.argv[2] || path.resolve(__dirname, '..')); const PARTS = (process.argv[3] || 'gate,saves,phones').split(',');
const SHOTS = process.env.SHOTS ? path.resolve(process.env.SHOTS) : null; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
// FLAG=none opens the game with no ?s3x (and clears the stored opt-in first): use it once the default has flipped, to test what an
// unflagged player gets. Today (flag off by default) that run is expected to FAIL; it is the post-flip check (ChatGPT P1-1).
const NOFLAG = process.env.FLAG === 'none'; const Q = NOFLAG ? '?s3=1' : '?s3=1&s3x=1';
const GATE = ['s3-trophies', 's3-shelf-data', 's3-progress', 's3-firstnight', 's3-xp', 's3-match', 's3-screens', 's3-welcome'];
const rows = []; const row = (part, check, ok, note) => { rows.push({ part, check, ok: !!ok, note: String(note || '').replace(/\s+/g, ' ').slice(0, 300) }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${part} · ${check}${note ? '  (' + String(note).replace(/\s+/g, ' ').slice(0, 200) + ')' : ''}`); };
if (!fs.existsSync(path.join(dir, 'index.html'))) { console.error('no index.html in ' + dir + ' (run bash tests/setup.sh)'); process.exit(2); }

// ---------- GATE: the checklist's gate tests, each as its own process, on this build
function gate() {
  for (const t of GATE) {
    const f = path.join(__dirname, t + '.js'); if (!fs.existsSync(f)) { row('gate', t, false, 'not on this build (tests/' + t + '.js missing: not shipped yet)'); continue; }
    const s = Date.now(); const r = cp.spawnSync(process.execPath, [f, dir], { encoding: 'utf8', timeout: 600000, maxBuffer: 64 << 20, env: process.env });
    const last = ((r.stdout || '') + (r.stderr || '')).trim().split('\n').filter(Boolean).pop() || '';
    row('gate', t, r.status === 0, `${r.status === 0 ? '' : 'exit ' + (r.status == null ? r.signal : r.status) + ': '}${last.slice(0, 220)} [${Math.round((Date.now() - s) / 1000)} s]`);
  }
}

// ---------- shared browser helpers
const NEXT = ['#rbRGo', '#rbRKeep', '#lvFirst', '#tcWelLater', '#btnResultNext', '#c3rwGo', '#c3rwKeep', '#btnPerkLater', '#tcPLater', '.tcpk__later', '#msgReplies button', '.tc-sheet [data-close]', '.tc-sheet .tc-x', '#s3Ok'];
const PROFILES = { 'iPhone 13': devices['iPhone 13'], 'Pixel 7': devices['Pixel 7'], '360 px phone': { viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: devices['Pixel 7'].userAgent } };
async function session(b, profile, init, fn) {
  const ctx = await b.newContext({ ...PROFILES[profile] }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message.slice(0, 160)));
  if (init) await p.addInitScript(init.fn, init.arg);
  await p.route(/jsdelivr|googleapis|gstatic/, r => r.abort());
  await p.route(/supabase\.co/, r => { const u = r.request().url(); if (/tops_history|tops_bestleg_s3/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }); r.abort(); });   // no cloud: a pulled save must never replace the copy under test
  let loads = 0; p.on('load', () => loads++);
  const vis = sel => p.evaluate(sel => { const e = document.querySelector(sel); return !!(e && e.getClientRects().length && !e.disabled && getComputedStyle(e).visibility !== 'hidden'); }, sel).catch(() => false);
  const tap = async sel => { if (!(await vis(sel))) return false; try { await p.locator(sel).first().tap({ timeout: 8000 }); return true; } catch (e) { return false; } };
  const ready = async () => { await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(1500); };
  const tab = async name => { await p.evaluate(n => { const t = document.querySelector(`#rbApp [data-tab="${n}"]`) || [...document.querySelectorAll('#rbApp button')].find(x => x.textContent.trim().toLowerCase() === n); if (t) t.click(); }, name); await p.waitForTimeout(700); };
  const toTrophies = async () => { await tab('locker'); await tap('#rbApp [data-lk="troph"]'); await p.waitForTimeout(900); };
  const shelf = () => p.evaluate(() => { const app = document.getElementById('rbApp'); const q = s => app && app.querySelector(s);
    return { shelf: !!q('.s3-trh'), hero: q('.s3-trh') ? q('.s3-trh').innerText.replace(/\s+/g, ' ') : null, cups: [...(app ? app.querySelectorAll('.s3-tr') : [])].map(l => l.className.replace('s3-tr ', '') + ':' + l.innerText.replace(/\s+/g, ' ')),
      gapNote: /some earlier results/i.test(app ? app.innerText : ''), chip: q('.s3-trchip') ? q('.s3-trchip').innerText.trim() : null }; });
  const shot = async name => { if (SHOTS) await p.screenshot({ path: path.join(SHOTS, name.replace(/[^a-z0-9_.-]+/gi, '_') + '.png') }).catch(() => {}); };
  // the three screen checks the checklist names, on whatever is on screen now
  const look = (expectHub) => p.evaluate(expectHub => {
    const out = { overlay: null, underMenu: [], splits: [], wide: document.documentElement.scrollWidth > innerWidth + 1 };
    const shown = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
    // stuck overlay: on the hub, what a finger hits in the middle of the screen and on the tab bar must belong to the hub itself
    if (expectHub) { const app = document.getElementById('rbApp'); const pts = [[innerWidth / 2, innerHeight / 2], [innerWidth / 2, innerHeight - 30], [innerWidth / 2, innerHeight * 0.3]];
      for (const [x, y] of pts) { const e = document.elementFromPoint(x, y); if (!e || !app || !app.contains(e)) { out.overlay = e ? (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) + ' at ' + Math.round(x) + ',' + Math.round(y) : 'nothing at ' + Math.round(x) + ',' + Math.round(y); break; } } }
    // nothing under MENU: no visible text or control is drawn over the MENU button or hidden under it (the 390 header-line class of bug).
    // Ignored, as a player can't see them: backgrounds and pictures (no own text), things buried under another layer, and a full-screen
    // sheet that covers MENU on purpose while it's open.
    const m = ['rbMenu', 'btnMenu', 'btnHubMenu'].map(i => document.getElementById(i)).find(e => e && shown(e)); /* the hub's MENU, else the match's */ out.menu = m ? '#' + m.id : null; const nm = e => e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0];
    const sheetAt = e => { for (let a = e; a && a !== document.body; a = a.parentElement) { const r = a.getBoundingClientRect(), cs = getComputedStyle(a); if ((cs.position === 'fixed' || cs.position === 'absolute') && r.width * r.height >= innerWidth * innerHeight * 0.8 && !a.contains(m)) return true; } return false; };
    if (m && shown(m)) { const mr = m.getBoundingClientRect(); const c = document.elementFromPoint(mr.left + mr.width / 2, mr.top + mr.height / 2);
      const sheet = c && !m.contains(c) && sheetAt(c); out.sheetOverMenu = !!sheet;
      if (c && !m.contains(c) && !sheet) out.underMenu.push('a tap on MENU hits ' + nm(c));
      // MENU's own full-screen layer (the new hub's #rbApp, or the match view): things on another layer are hidden under it or a stuck overlay
      let layer = null; for (let a = m.parentElement; a && a !== document.body; a = a.parentElement) { const r = a.getBoundingClientRect(); if (r.width * r.height >= innerWidth * innerHeight * 0.8) { layer = a; break; } }
      if (!sheet) for (const e of document.querySelectorAll('body *')) { if (e === m || m.contains(e) || e.contains(m) || !shown(e) || /^(IMG|SVG|CANVAS|VIDEO|PICTURE)$/i.test(e.tagName) || (layer && !layer.contains(e))) continue;
        const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || /^(BUTTON|A|INPUT|SELECT)$/i.test(e.tagName); if (!own) continue;
        const r = e.getBoundingClientRect(); const x0 = Math.max(r.left, mr.left), x1 = Math.min(r.right, mr.right), y0 = Math.max(r.top, mr.top), y1 = Math.min(r.bottom, mr.bottom); if (x1 - x0 <= 2 || y1 - y0 <= 2) continue;
        const top = document.elementFromPoint((x0 + x1) / 2, (y0 + y1) / 2); if (!top) continue;
        if (e.contains(top) || m.contains(top)) { out.underMenu.push(nm(e) + ' "' + (e.innerText || e.value || '').trim().slice(0, 30) + '" ' + (e.contains(top) ? 'drawn over MENU' : 'hidden under MENU')); if (out.underMenu.length > 5) break; } } }
    // no word split: no single word whose letters land on two lines (overflow-wrap / word-break / hyphenation breaking a word)
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const rg = document.createRange();
    for (let n; (n = tw.nextNode()) && out.splits.length < 6;) { const el = n.parentElement; if (!el || !shown(el) || /^(SCRIPT|STYLE|CANVAS)$/.test(el.tagName)) continue; const t = n.textContent; const re = /[^\s  ·/|–-]{2,}/g;
      for (let mm; (mm = re.exec(t));) { rg.setStart(n, mm.index); rg.setEnd(n, mm.index + mm[0].length); const rs = [...rg.getClientRects()].filter(r => r.width > 0.5); if (rs.length < 2) continue; const tops = [...new Set(rs.map(r => Math.round(r.top / 3)))]; if (tops.length > 1 && rs[0].bottom > 0 && rs[0].top < innerHeight) { out.splits.push('"' + mm[0].slice(0, 24) + '" in ' + (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0])); break; } } }
    return out; }, expectHub);
  await fn(p, { vis, tap, ready, tab, toTrophies, shelf, shot, look, loads: () => loads });
  await ctx.close(); return pe;
}
const lookNote = l => [l.overlay ? 'stuck overlay: ' + l.overlay : '', l.underMenu.length ? 'under MENU: ' + l.underMenu.join(', ') : '', l.splits.length ? 'word split: ' + l.splits.join(', ') : '', l.wide ? 'scrolls sideways' : ''].filter(Boolean).join('; ');
const lookOk = l => !l.overlay && !l.underMenu.length && !l.splits.length && !l.wide;

// ---------- SAVES: real save shapes, opened with s3x=1; nothing that is the player's may change
const FIX = [
  { id: 'a_long_s3', label: 'mid-season S3 (David\'s shape: 28 matches, level 2, 10 events, 4 titles)', slot: 'doubleout_s3', mid: true },
  { id: 'b_short_s3', label: 'new S3 career, first night booked, no results (third real S3 save\'s shape)', slot: 'doubleout_s3', mid: false },
  { id: 'c_s2_only', label: 'Season 2 only, 3 matches (Joel\'s shape; no S3 save yet)', slot: 'doubleout2', mid: false, s2only: true } ];
const KEEP = { 'money: career bank': c => c.career && c.career.bank, 'money: Circuit bank': c => c.career && c.career.circuit && c.career.circuit.bank, 'money: Season 2 bank': c => c.st2 && c.st2.bank,
  'XP': c => c.career && c.career.v3 && c.career.v3.xp, 'level (player)': c => c.career && c.career.v3 && c.career.v3.lv, 'level (Circuit)': c => c.career && c.career.circuit && c.career.circuit.level, 'tier': c => c.career && c.career.tier,
  'history: Circuit events': c => c.career && c.career.circuit && c.career.circuit.history, 'history: titles': c => c.career && c.career.circuit && c.career.circuit.titles, 'history: results by opponent': c => c.career && c.career.h2h,
  'history: wins/losses/matches': c => [c.career && c.career.wins, c.career && c.career.losses, c.matches], 'history: form': c => c.career && c.career.history,
  'best (legAt may be added)': c => { const b = c.career && c.career.best; if (!b) return b; const o = { ...b }; delete o.legAt; return o; } };
const out_sab = [];
async function saves(b) {
  for (const fx of FIX) {
    const raw = fs.readFileSync(path.join(__dirname, 'fixtures', 'switch-on', fx.id + '.json'), 'utf8'); const before = JSON.parse(raw); const L = 'saves · ' + fx.id;
    let res = null; const pe = await session(b, 'iPhone 13', { fn: ({ slot, raw, seen, noflag }) => { try { if (!sessionStorage.getItem('qa_seeded')) { localStorage.setItem(slot, raw); if (noflag) localStorage.removeItem('tops_s3x'); if (seen) { localStorage.setItem('tops_s3_welcome', '1'); } sessionStorage.setItem('qa_seeded', '1'); } } catch (e) {} }, arg: { slot: fx.slot, raw, seen: !fx.s2only, noflag: NOFLAG } }, async (p, T) => {
      await p.goto('file://' + dir + '/index.html' + Q, { timeout: 180000 }); await T.ready(); await p.waitForTimeout(2500);
      if (process.env.QA_SABOTAGE) out_sab.push(await p.evaluate(() => { try { const c = career(); const b0 = c.bank; c.bank += 1; c.circuit.bank += 1; return { b0, b1: career().bank, key: TOPS_SAVE_NS.key }; } catch (e) { return "err " + e.message; } }));   // proves the check bites: the money rows must FAIL
      const fn = await T.vis('#s3Fn'); await T.shot('saves_' + fx.id + '_open');
      await p.evaluate(() => { const l = document.getElementById('login'); if (l) l.hidden = true; }); if (!(await T.vis('#rbApp'))) await p.evaluate(() => { try { showHub('play'); } catch (e) {} }); await p.waitForTimeout(1200);
      await T.tab('circuit'); const circ = await T.shelf(); await T.shot('saves_' + fx.id + '_circuit');
      if (circ.chip) { await T.tap('#rbApp .s3-trchip'); await p.waitForTimeout(900); } else await T.toTrophies(); const sh = await T.shelf(); await T.shot('saves_' + fx.id + '_trophies');
      await T.tab('circuit'); await p.waitForTimeout(600);
      await p.evaluate(() => { try { persist(); } catch (e) {} });   // anything the visit changed in memory is now in storage too
      const rd = () => p.evaluate(() => ({ s3: localStorage.getItem('doubleout_s3'), s2: localStorage.getItem('doubleout2'), key: window.TOPS_SAVE_NS && TOPS_SAVE_NS.key }));
      const store = await rd();
      // ChatGPT P2-3: the stored copy must survive a fresh page load (the game reads it back and writes it again) with the same numbers
      await p.reload({ timeout: 180000 }); await T.ready(); await p.waitForTimeout(2000); await p.evaluate(() => { try { persist(); } catch (e) {} }); const store2 = await rd();
      res = { fn, chip: circ.chip, shelf: sh, store, store2 }; });
    if (!res) { row(L, 'opens', false, 'session failed'); continue; }
    const after = JSON.parse((fx.slot === 'doubleout2' ? res.store.s2 : res.store.s3) || 'null');
    if (!after) { row(L, 'save still there', false, 'slot ' + fx.slot + ' empty after opening'); continue; }
    if (fx.s2only) {
      const s2b = res.store2.s2, same2 = s2b === raw, dd = []; if (!same2) { const z = JSON.parse(s2b || 'null'); const f = (a, b, pre) => { if (JSON.stringify(a) === JSON.stringify(b)) return; if (!a || !b || typeof a !== 'object' || Array.isArray(a)) { dd.push(pre + ': ' + JSON.stringify(a).slice(0, 40) + ' → ' + JSON.stringify(b).slice(0, 40)); return; } for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) f(a[k], b[k], pre ? pre + '.' + k : k); }; f(before, z, ''); }
      row(L, 'same after a fresh page load', same2, same2 ? 'doubleout2 still byte-identical after a reload' : 'doubleout2 changed after a reload: ' + dd.slice(0, 8).join(', '));
      row(L, 'Season 2 save untouched', res.store.s2 === raw, res.store.s2 === raw ? 'doubleout2 byte-identical after opening Season 3' : JSON.stringify(after) === JSON.stringify(before) ? 'doubleout2 rewritten (same content, different bytes)' : 'doubleout2 changed');
      const s3 = JSON.parse(res.store.s3 || 'null'); row(L, 'Season 3 starts clean', !s3 || !(s3.career && s3.career.circuit && (s3.career.circuit.history || []).length), (res.fn ? 'first-night screen shown (zero S3 history, by design)' : 'no first-night screen') + '; S3 slot ' + (s3 ? 'new' : 'empty'));
    } else {
      const bad = []; for (const [k, g] of Object.entries(KEEP)) { const a = JSON.stringify(g(before)), z = JSON.stringify(g(after)); if (a !== z) bad.push(k + ': ' + String(a).slice(0, 60) + ' → ' + String(z).slice(0, 60)); }
      const after2 = JSON.parse(res.store2.s3 || 'null'); const bad2 = after2 ? Object.entries(KEEP).filter(([, g]) => JSON.stringify(g(before)) !== JSON.stringify(g(after2))).map(([k]) => k) : ['save gone'];
      row(L, 'same after a fresh page load', !bad2.length, bad2.length ? 'changed after reload: ' + bad2.join(', ') : 'reloaded, read back and saved again: all ' + Object.keys(KEEP).length + ' fields still equal');
      row(L, 'money, XP, level, history unchanged', !bad.length, bad.length ? bad.join(' | ') : Object.keys(KEEP).length + ' fields equal (bank ' + before.career.bank + ', XP ' + before.career.v3.xp + ', level ' + before.career.v3.lv + '/' + before.career.circuit.level + ', ' + (before.career.circuit.history || []).length + ' events)');
      const diff = (a, z, pre, d, out) => { if (JSON.stringify(a) === JSON.stringify(z)) return out; if (d >= 4 || !a || !z || typeof a !== 'object' || typeof z !== 'object' || Array.isArray(a)) { out.push(pre); return out; }
        for (const k of new Set([...Object.keys(a), ...Object.keys(z)])) if (k !== 'sv') diff(a[k], z[k], pre ? pre + '.' + k : k, d + 1, out); return out; };
      const changed = diff(before, after, '', 0, []);
      row(L, 'other save changes (info)', true, changed.length ? changed.slice(0, 14).join(', ') + (changed.length > 14 ? ' (+' + (changed.length - 14) + ')' : '') : 'none');
      if (fx.mid) {
        row(L, 'no first-night screen', !res.fn, res.fn ? 'first-night screen shown on a mid-season save' : 'not shown');
        const t = before.career.circuit.titles || [], w = t.filter(x => x.finish === 'W').length, f = t.length;
        const heroOk = new RegExp('titles ' + w + ' finals ' + f, 'i').test(res.shelf.hero || ''); const cups = res.shelf.cups.filter(c => /^s3-tr(W|F)/.test(c)).length;
        row(L, 'shelf built from its history', res.shelf.shelf && heroOk && cups >= 1, `hero "${(res.shelf.hero || '').slice(0, 90)}" (expect titles ${w} finals ${f}); ${cups} won/final cups; chip "${res.chip}"`);
        const hist = before.career.circuit.history || [], wk = hist.map(h => h.week), gap = wk.some((x, i) => i && x !== wk[i - 1] + 1);
        row(L, '"some earlier results" note only with a gap', res.shelf.gapNote === gap, `history weeks ${wk[0]}-${wk[wk.length - 1]}, gap ${gap}, note ${res.shelf.gapNote}`);
      } else row(L, 'first-night screen (info)', true, res.fn ? 'shown: this save has no results yet (by design it needs zero history)' : 'not shown');
    }
    row(L, 'no page errors', !pe.length, pe.join(' | '));
  }
}

// ---------- PHONES: a brand-new player's first Pub night, on each phone
async function phones(b) {
  const only = process.env.PHONES ? process.env.PHONES.split(',') : null;   // PHONES='Pixel 7' runs one profile
  for (const prof of Object.keys(PROFILES).filter(x => !only || only.includes(x))) {
    const L = 'phones · ' + prof; const R = {}; const looks = [];
    const check = async (name, hub) => { const l = await phonesLook(name, hub); looks.push([name, l]); return l; };
    let phonesLook;
    const pe = await session(b, prof, NOFLAG ? { fn: () => { try { if (!sessionStorage.getItem('qa_seeded')) { localStorage.removeItem('tops_s3x'); sessionStorage.setItem('qa_seeded', '1'); } } catch (e) {} } } : null, async (p, T) => {
      phonesLook = async (name, hub) => {
        // QA_SABOTAGE_UI=1 proves the three screen checks bite: text under MENU and a split word on the first night, a stuck overlay on the hub
        if (process.env.QA_SABOTAGE_UI && name === '1_first_night') await p.evaluate(() => { const w = document.createElement('div'); w.id = 'qaSplit'; w.textContent = 'Championship'; w.style.cssText = 'position:fixed;left:10px;top:300px;width:40px;overflow-wrap:anywhere;z-index:2147483647;color:#fff;font:16px sans-serif'; document.body.appendChild(w); });
        if (process.env.QA_SABOTAGE_UI && name === '3_circuit_after') await p.evaluate(() => { const m = document.getElementById('rbMenu'); if (!m) return; const r = m.getBoundingClientRect();   // header text running under MENU, inside MENU's own header
          const t = document.createElement('span'); t.id = 'qaUnderMenu'; t.textContent = 'KAURI ARMS LEAGUE NIGHT · QUARTER-FINAL'; t.style.cssText = `position:fixed;left:${r.left - 120}px;top:${r.top + r.height / 2 - 7}px;width:${r.width + 120}px;white-space:nowrap;color:#fff;font:12px sans-serif;z-index:1`; m.parentElement.appendChild(t); });
        if (process.env.QA_SABOTAGE_UI && name === '5_back_on_circuit') await p.evaluate(() => { const o = document.createElement('div'); o.id = 'qaStuck'; o.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.01)'; document.body.appendChild(o); });
        await T.shot('phones_' + prof + '_' + name); const l = await T.look(hub);
        if (process.env.QA_SABOTAGE_UI) await p.evaluate(() => ['qaUnderMenu', 'qaSplit', 'qaStuck'].forEach(i => { const e = document.getElementById(i); if (e) e.remove(); }));
        return l; };
      await p.goto('file://' + dir + '/index.html' + Q, { timeout: 180000 }); await T.ready(); await p.waitForTimeout(2000);
      // a new player: the Season 3 welcome (if shown) -> creator -> That's me -> Jonno's message -> the first-night screen
      if (await T.vis('#s3WelGo')) await T.tap('#s3WelGo'); await p.waitForTimeout(1200);
      if (!(await T.vis('#creator')) && !(await T.vis('#btnCreate'))) { await p.evaluate(() => { const l = document.getElementById('login'); if (l) l.hidden = true; save.authSeen = true; persist(); showTitle(); }); await p.waitForTimeout(1000); await T.tap('#btnNewCareer'); await p.waitForTimeout(1200); }
      await p.fill('#cName', 'QA Phone').catch(() => {}); await T.tap('#btnCreate'); await p.waitForTimeout(1500);
      for (let i = 0; i < 10 && !(await T.vis('#s3Fn')) && !(await p.evaluate(() => typeof S !== 'undefined' && !!S && !S.done)); i++) { if (await T.vis('#msgReplies button')) await T.tap('#msgReplies button'); await p.waitForTimeout(900); }
      R.firstNight = await T.vis('#s3Fn'); const lf = await check('1_first_night', false); R.fnLook = lf;
      if (R.firstNight) await T.tap('#s3FnGo');
      // the Pub night: QF, SF, Final, each played to a win as the player taps it (bull, then T20s, single 20s, out on D20)
      R.results = [];
      for (let m = 0; m < 3; m++) {
        const running = () => p.evaluate(() => typeof S !== 'undefined' && !!S && !S.done).catch(() => false);
        for (let k = 0; m > 0 && k < 12 && !(await running()); k++) {   // the next round, as a player gets to it: clear any announcement, Circuit tab, book / Walk on
          for (let j = 0; j < 4 && (await T.vis('#s3Ok')); j++) { await T.tap('#s3Ok'); await p.waitForTimeout(400); }
          await T.tab('circuit'); if (await T.vis('#rbApp [data-s3book]')) await T.tap('#rbApp [data-s3book]'); await p.waitForTimeout(600); await T.tap('#s3Go'); await p.waitForTimeout(1500); }
        for (let i = 0; i < 80 && !(await running()); i++) await p.waitForTimeout(250);
        const round = await p.evaluate(() => typeof S !== 'undefined' && S && S.s3 ? S.s3.round : null).catch(() => null);
        let midLooked = false;
        for (let i = 0; i < 1500; i++) {
          if (!midLooked && i > 20 && await p.evaluate(() => typeof S !== 'undefined' && S && !S.done && !S.bull && S.cur === 0 && !S.busy).catch(() => false)) { midLooked = true; const lm = await check('2_match_' + (m + 1), false); R.matchLooks = (R.matchLooks || []).concat([lm]); }
          const s = await p.evaluate(() => { try { if (!S || S.done) return 'done'; if (S.bull) { if (S.cur === 0 && !S.busy && S.bull.me == null) { S.busy = true; land(0, 0); } return 'play'; }
            if (S.cur === 0 && !S.busy && !S.p[0].ai && S.view !== 1) { const me = S.p[0]; S.busy = true; if (me.score > 200) land(0, -103); else if (me.score - 20 >= 40) land(0, -60); else { me.score = 40; land(0, -166); } }
            const it = document.getElementById('intro'); if (it && it.classList.contains('show')) it.click(); return 'play'; } catch (e) { return 'err ' + e.message; } }).catch(() => 'nav'); if (s === 'done') break; await p.waitForTimeout(120); }
        for (let i = 0; i < 80 && !(await T.vis('#rbApp.rb-resmode #rbRGo')); i++) await p.waitForTimeout(250); await p.waitForTimeout(800);
        const rs = await p.evaluate(() => { const app = document.getElementById('rbApp'); return { result: !!(app && app.classList.contains('rb-resmode')), text: app ? app.innerText.replace(/\s+/g, ' ').slice(0, 160) : '', round: typeof S !== 'undefined' && S && S.s3 ? S.s3.round : null }; });
        const l = await check('2_result_' + (m + 1), false); R.results.push({ ...rs, round, look: l });
        const l0 = T.loads(); for (let i = 0; i < 300 && T.loads() === l0; i++) { let hit = false; for (const s of NEXT) { if (await T.tap(s)) { hit = true; await p.waitForTimeout(300); break; } } if (!hit && await p.evaluate(() => { const a = document.getElementById('rbApp'); return !!(a && !a.classList.contains('rb-resmode') && !document.querySelector('.tc-sheet,.tc-poster,.tcpk,.tc-scrim,#s3Ok')); })) break; await p.waitForTimeout(250); }
        if (T.loads() > l0) await T.ready(); for (let i = 0; i < 20 && (await T.vis('#s3Ok')); i++) { await T.tap('#s3Ok'); await p.waitForTimeout(400); }
      }
      for (let i = 0; i < 24; i++) { if (await T.vis('#s3Ok')) { await T.tap('#s3Ok'); await p.waitForTimeout(500); i = Math.max(i, 16); } else await p.waitForTimeout(400); }
      // back on the hub: the Circuit tab, the titles chip, the shelf, and back again
      await T.tab('circuit'); R.hubLook = await check('3_circuit_after', true); const c = await T.shelf(); R.chip = c.chip;
      // ChatGPT P2-5: MENU really works to a finger, not only by geometry: a tap opens its sheet, a second tap closes it
      const sheetUp = () => p.evaluate(() => { const d = document.getElementById('rbMenuSheet'); return !!(d && d.getClientRects().length); });
      R.menuTap = { open: false, closed: false }; if (await T.tap('#rbMenu')) { await p.waitForTimeout(500); R.menuTap.open = await sheetUp(); await T.tap('#rbMenu'); await p.waitForTimeout(500); R.menuTap.closed = !(await sheetUp()); }
      if (c.chip) await T.tap('#rbApp .s3-trchip'); await p.waitForTimeout(900); R.shelf = await T.shelf(); R.shelfLook = await check('4_trophies', true);
      await T.tab('circuit'); await p.waitForTimeout(700); R.back = await T.shelf(); R.backLook = await check('5_back_on_circuit', true);
      R.titles = await p.evaluate(() => (career().circuit.titles || []).map(t => t.finish + ':' + t.ev));
      // ChatGPT P1-1 (what we can test before the flip): a fresh load with no ?s3x keeps the player in Season 3 with the title
      // (the test has no cloud, so a fresh load stops at the Google sign-in; pass it the way the start of this run does, as a signed-in player would)
      await p.goto('file://' + dir + '/index.html?s3=1', { timeout: 180000 }); await T.ready(); await p.waitForTimeout(2500);
      R.reloadKey = await p.evaluate(() => ({ key: window.TOPS_SAVE_NS && TOPS_SAVE_NS.key, x: localStorage.getItem('tops_s3x'), login: /Season 3/.test((document.getElementById('login') || {}).innerText || '') }));
      await p.evaluate(() => { const l = document.getElementById('login'); if (l) l.hidden = true; if (!(document.getElementById('rbApp') || {}).isConnected) { try { showHub('play'); } catch (e) {} } }); await p.waitForTimeout(1500); for (let i = 0; i < 6 && (await T.vis('#s3Ok')); i++) { await T.tap('#s3Ok'); await p.waitForTimeout(400); }
      R.reload = await p.evaluate(() => { try { return { s3: !!(window.TOPS_S3 && document.getElementById('rbApp') && document.getElementById('rbApp').getClientRects().length), titles: (career().circuit.titles || []).map(t => t.finish + ':' + t.ev), fn: !!(document.getElementById('s3Fn') && document.getElementById('s3Fn').getClientRects().length) }; } catch (e) { return { err: e.message }; } });
      await T.shot('phones_' + prof + '_6_reloaded');
    });
    row(L, 'first night', R.firstNight && lookOk(R.fnLook), R.firstNight ? lookNote(R.fnLook) || 'shown, Walk on starts the QF' : 'no first-night screen for a new player');
    (R.matchLooks || []).forEach((l, i) => row(L, 'match ' + (i + 1) + ' (mid-match)', lookOk(l), (lookNote(l) || 'MENU ' + l.menu + ' clear')));
    const RND = ['QF', 'SF', 'F']; (R.results || []).forEach((r, i) => row(L, 'result ' + (i + 1) + ' (' + RND[i] + ')', r.result && r.round === RND[i] && lookOk(r.look), (r.result ? '' : 'no Circuit result screen; ') + (r.round === RND[i] ? '' : 'round was ' + r.round + '; ') + (lookNote(r.look) || r.text.slice(0, 90))));
    if (!R.results || R.results.length < 3) row(L, '3 results', false, 'only ' + (R.results || []).length + ' results reached');
    const won = (R.titles || []).includes('W:pub_night');
    row(L, 'Trophies shelf', R.shelf && R.shelf.shelf && won && /titles 1/i.test(R.shelf.hero || '') && lookOk(R.shelfLook), R.shelf ? (lookNote(R.shelfLook) || `"${(R.shelf.hero || '').slice(0, 80)}"`) + (won ? '' : '; Pub night not recorded as won: ' + JSON.stringify(R.titles)) : 'not reached');
    row(L, 'the chip and back', !!R.chip && /1 title/.test(R.chip) && R.back && !R.back.shelf && R.back.chip === R.chip && lookOk(R.backLook) && lookOk(R.hubLook), `chip "${R.chip}"; back on Circuit: chip "${R.back && R.back.chip}"` + (lookNote(R.backLook) ? '; ' + lookNote(R.backLook) : '') + (lookNote(R.hubLook) ? '; hub: ' + lookNote(R.hubLook) : ''));
    row(L, 'MENU opens and closes to a tap', R.menuTap && R.menuTap.open && R.menuTap.closed, R.menuTap ? `tap: sheet ${R.menuTap.open ? 'opened' : 'did NOT open'}; second tap: ${R.menuTap.closed ? 'closed' : 'still open'}` : 'not reached');
    const rl = R.reload || {}; const rk = R.reloadKey || {}; row(L, 'still Season 3 after a reload (no ?s3x)', rk.key === 'doubleout_s3' && rl.s3 && (rl.titles || []).includes('W:pub_night') && !rl.fn, rl.err ? 'error ' + rl.err : `save ${rk.key}, opt-in ${rk.x}, sign-in says Season 3: ${!!rk.login}; hub ${rl.s3 ? 'shown' : 'NOT shown'}; titles ${JSON.stringify(rl.titles)}; first night ${rl.fn ? 'shown again' : 'not shown again'}`);
    for (const [what, test] of [['no stuck overlay', l => !l.overlay], ['nothing under MENU', l => !l.underMenu.length], ['no word split', l => !l.splits.length]]) {
      const badAt = looks.filter(([, l]) => l && !test(l)).map(([n, l]) => n + ': ' + lookNote(l)); row(L, what, !badAt.length, badAt.length ? badAt.join(' | ') : looks.length + ' screens checked');
    }
    row(L, 'no page errors', !pe.length, pe.join(' | '));
  }
}

(async () => {
  const t0 = Date.now(); const ver = (() => { try { return (fs.readFileSync(path.join(dir, 'v051.js'), 'utf8').match(/TOPS_VER='([^']+)'/) || [])[1]; } catch (e) { return null; } })();
  if (PARTS.includes('gate')) gate();
  if (PARTS.includes('saves') || PARTS.includes('phones')) { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
    try { if (PARTS.includes('saves')) await saves(b); if (PARTS.includes('phones')) await phones(b); } finally { await b.close(); } }
  const nFail = rows.filter(r => !r.ok).length; const out = { version: ver, at: new Date().toISOString(), secs: Math.round((Date.now() - t0) / 1000), pass: !nFail, rows };
  if (process.env.QA_SABOTAGE) console.log('sabotage: ' + JSON.stringify(out_sab));
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify(out, null, 1));
  // ChatGPT P1-3: green here means checklist items 1-3 pass on this build, not that Season 3 may be switched on
  console.log(`\n### SWITCH-ON ${nFail ? 'FAIL' : 'AUTOMATED PASS'} on v${ver}${NOFLAG ? ' (no flag)' : ' (s3x=1)'}: ${rows.length - nFail}/${rows.length} rows pass (${out.secs} s) · release NOT cleared until the manual checklist items are signed off on this build\n\n| | Part | Check | Note |\n|---|---|---|---|`);
  for (const r of rows) console.log(`| ${r.ok ? 'PASS' : '**FAIL**'} | ${r.part} | ${r.check} | ${r.note.replace(/\|/g, '/')} |`);
  console.log('| (manual) | real phones | Hayden: one Pub night on an Android Chrome phone (iPhone skipped by Hayden, Sat 19:59) | not automatable |');
  process.exit(nFail ? 1 : 0);
})().catch(e => { console.error('SWITCH-ON ERROR', e); process.exit(3); });
