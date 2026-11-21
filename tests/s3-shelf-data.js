// EXP-IDLE 3b: the trophy shelf's data (ChatGPT P1/P2 before Season 3 switches on), behind s3x=1.
//  A shelfData on saved results: a winner is never also a runner-up; titles + runner-ups = finals; prize money = every event's prize (never less
//    than the trophies'); a title written twice is counted once; a save from before titles were kept still shows its trophies.
//  B missing or truncated history never reads 'Not won': the shelf says 'No record' and shows the gap note; broken fields render safely
//    (no NaN / undefined / null, no page errors).
//  C legacy saves: Seasons 1 & 2 (Career's live tops_history view) and the trophies survive adopting an older cloud copy, a reload and the
//    v11 migration; an adopted copy with no titles and no weeks renders safely.
//  D best leg vs record: your number is career().best.leg, the Season 3 record is its own line from tops_bestleg_s3; your 12 never shows as
//    the 9-dart record, and the three cases (someone else, you elsewhere, you) read correctly.
//  E every level's shelf at 320 / 360 / 390: one card per event (1 to 6), cards never under 96 px, names never cut mid-word, no sideways scroll.
// usage: node tests/s3-shelf-data.js [dir]   (SHOTS=1 writes tests/s3_sd_<case>.png)
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const HIST = [{ who: 'Hayden', season: 1, tier: 1, title: null, best_avg: '61.4', best_leg: 17 }, { who: 'Hayden', season: 2, tier: 2, title: 'Regional rep', best_avg: '88.2', best_leg: 13 }, { who: 'Lee McKenzie', season: 2, tier: 2, title: 'Regional rep', best_avg: '115.6', best_leg: 12 }];
  let BL = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); } catch (e) {} });
  await p.route(/jsdelivr|googleapis|gstatic/, r => r.abort());
  await p.route(/supabase\.co/, r => { const u = r.request().url(); if (/tops_history/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(HIST) });
    if (/tops_bestleg_s3/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(BL) }); r.abort(); });
  const ready = async () => { await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_S3 && window.TOPS_S3UI, null, { timeout: 180000 }); await p.waitForTimeout(1500); };
  await p.goto('file://' + dir + '/index.html?s3=1&s3x=1', { timeout: 180000 }); await ready();
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); save.tcWelSeen = 1; persist(); $('login').hidden = true; showHub('play'); });
  await p.waitForTimeout(2000); await p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  const H = (week, id, fin, prize, level = 0, extra) => Object.assign({ week, id, n: id, level, fin, prize, pts: 10 }, extra || {});
  const T = (ev, finish, prize, level = 0) => ({ ev, n: ev, level, season: 3, finish, prize, date: '2026-11-20T00:00:00Z' });
  // ---------- A: shelfData on saved results
  const sd = k => p.evaluate(k => { const d = TOPS_S3UI.shelfData(k, TOPS_CIRCUIT); return Object.assign({}, d, { leftAt: [0, 1, 2, 3, 4, 5, 6].map(i => d.leftAt(i)) }); }, k);
  const A = {
    normal: { level: 0, week: 4, history: [H(1, 'pub_night', 'W', 35), H(2, 'kauri_cup', 'F', 85), H(3, 'pub_night', 'QF', 10)], titles: [T('pub_night', 'W', 35), T('kauri_cup', 'F', 85)] },
    twice: { level: 0, week: 2, history: [H(1, 'pub_night', 'W', 35)], titles: [T('pub_night', 'W', 35), T('pub_night', 'W', 35)] },
    legacy: { level: 1, week: 4, history: [H(1, 'pub_night', 'W', 35), H(2, 'kauri_cup', 'W', 170), H(3, 'club_night', 'F', 105, 1)] },
    mixed: { level: 0, week: 3, history: [H(1, 'pub_night', 'W', 35), H(2, 'pub_night', 'F', 20)], titles: [T('pub_night', 'W', 35), T('pub_night', 'F', 20)] }
  };
  for (const [n, k] of Object.entries(A)) out['A_' + n] = await sd(k);
  const a = out.A_normal; if (a.titles !== 1 || a.runnerUp !== 1 || a.finals !== 2 || a.prize !== 130 || !a.complete || a.trophies.length !== 2) fail.push('A normal ' + JSON.stringify(a));
  if (a.trophies.find(t => t.ev === 'pub_night').finish !== 'W' || a.trophies.filter(t => t.ev === 'pub_night').length !== 1) fail.push('A a winner also counted as runner-up ' + JSON.stringify(a.trophies));
  const tw = out.A_twice; if (tw.titles !== 1 || tw.trophies.length !== 1) fail.push('A title written twice counted twice ' + JSON.stringify(tw));
  const lg = out.A_legacy; if (lg.titles !== 2 || lg.runnerUp !== 1 || lg.prize !== 310 || !lg.complete || lg.trophies.some(t => !t.fromHistory) || lg.leftAt[0] !== 2) fail.push('A legacy (no titles) ' + JSON.stringify(lg));
  const mx = out.A_mixed; if (mx.titles !== 1 || mx.runnerUp !== 1 || mx.finals !== 2) fail.push('A win + runner-up of one event ' + JSON.stringify(mx));
  for (const [n, d] of Object.entries(out).filter(([n]) => /^A_/.test(n))) { const tp = d.trophies.reduce((s, t) => s + (t.prize || 0), 0); if (d.prize < tp || d.finals !== d.titles + d.runnerUp || d.titles + d.runnerUp !== d.trophies.length) fail.push(n + ' does not add up ' + JSON.stringify({ prize: d.prize, tp, t: d.titles, r: d.runnerUp, f: d.finals, n: d.trophies.length })); }
  // ---------- render helper: put a circuit state in the live save and open Locker > Trophies
  const show = async (k, w = 390) => { await p.setViewportSize({ width: w, height: w === 320 ? 640 : 844 });
    await p.evaluate(k => { const c = career(); c.circuit = Object.assign(c.circuit, k); if ('history' in k && !('titles' in k)) delete c.circuit.titles; persist(); TOPS_S3UI.refreshRecords(); }, k); await p.waitForTimeout(300);
    await p.evaluate(() => { const t = document.querySelector('#rbTabs [data-t="locker"]'); if (t) t.click(); }); await p.waitForTimeout(300);
    await p.evaluate(() => { const t = document.querySelector('#rbApp [data-lk="troph"]'); if (t) t.click(); }); await p.waitForTimeout(900);
    for (let i = 0; i < 6; i++) { const ok = await p.$('#s3Ok'); if (!ok) break; await ok.click().catch(() => {}); await p.waitForTimeout(400); }   // seeded results raise the result announcement: clear it
    return p.evaluate(() => { const app = document.getElementById('rbApp'), q = s => app.querySelector(s), tx = e => e ? e.innerText.replace(/\s+/g, ' ') : null;
      return { shelf: !!q('.s3-trh'), all: tx(q('.rb-scr')), hero: tx(q('.s3-trh')), gap: !!q('.s3-trgap'), bl: tx(q('.s3-trbl')), cups: [...app.querySelectorAll('.s3-tr')].map(l => l.className.replace('s3-tr ', '') + ':' + tx(l)),
        lv: [...app.querySelectorAll('.s3-trlv[data-lv]')].map(s => ({ lv: +s.dataset.lv, n: s.querySelectorAll('.s3-tr').length, cols: getComputedStyle(s.querySelector('.s3-shelf')).gridTemplateColumns.split(' ').length })),
        minW: Math.min(...[...app.querySelectorAll('.s3-tr')].map(l => l.getBoundingClientRect().width)), cut: [...app.querySelectorAll('.s3-tr b')].filter(x => { if (x.scrollWidth > x.clientWidth + 1) return true; const n = x.firstChild; if (!n) return false; const t = n.textContent; let i = 0;   // a word split over two lines
          for (const w of t.split(/([ \-])/)) { if (w && w !== ' ' && w !== '-') { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + w.length); if (new Set([...r.getClientRects()].map(q => Math.round(q.top))).size > 1) return true; } i += w.length; } return false; }).map(x => x.textContent + '@' + getComputedStyle(x).fontSize),
        small: [...app.querySelectorAll('.s3-tr b')].filter(x => parseFloat(getComputedStyle(x).fontSize) < 11).map(x => x.textContent),
        wide: document.documentElement.scrollWidth > innerWidth + 1 || (q('.rb-scr') && q('.rb-scr').scrollWidth > q('.rb-scr').clientWidth + 1), old: tx(q('#s3TrHi')) }; }); };
  const bad = (n, r) => { if (!r.shelf) fail.push(n + ': no shelf'); if (/\bNaN\b|undefined|\bnull\b|\[object/.test(r.all || '')) fail.push(n + ': broken text ' + (r.all || '').match(/.{0,40}(NaN|undefined|null|\[object).{0,20}/)[0]); };
  // ---------- B: truncated and broken
  const trunc = await show({ level: 1, week: 9, history: [H(6, 'club_night', 'W', 105, 1), H(7, 'interclub', 'QF', 20, 1), H(8, 'club_night', 'SF', 40, 1)], titles: [T('club_night', 'W', 105, 1)] }); out.B_trunc = trunc; bad('B truncated', trunc);
  if (/not won/i.test(trunc.all) || !trunc.gap || !trunc.cups.some(c => /^s3-tre:THE KAURI CUP No record$/i.test(c)) || !trunc.cups.some(c => /^s3-trW:RSA CLUB NIGHT Winner · \$105 Week 6$/i.test(c))) fail.push('B truncated history ' + JSON.stringify({ cups: trunc.cups, gap: trunc.gap }));
  if (process.env.SHOTS) await p.screenshot({ path: path.join(__dirname, 's3_sd_truncated.png') });
  const broken = await show({ level: 0, week: undefined, history: [null, { week: 'x' }, { id: 'pub_night', fin: 'W', prize: '35' }, { id: 'nope', fin: 'W', week: 2 }, 7], titles: [null, { finish: 'X', ev: 'pub_night' }, { ev: 'kauri_cup', finish: 'F' }] }); out.B_broken = broken; bad('B broken fields', broken);
  if (/not won/i.test(broken.all) || !/^titles 2 finals 3 prize money \$0$/i.test(broken.hero || '')) fail.push('B broken fields ' + JSON.stringify({ hero: broken.hero, cups: broken.cups }));
  const gone = await show({ level: 0, week: 5, history: undefined, titles: undefined }); bad('B no history at all', gone); if (/not won/i.test(gone.all) || !gone.gap) fail.push('B no history reads not won ' + JSON.stringify(gone.cups));
  // ---------- C: legacy saves (adoption, reload, migration)
  const good = { level: 1, week: 5, history: [H(1, 'pub_night', 'W', 35), H(2, 'kauri_cup', 'F', 85), H(3, 'pub_night', 'W', 35), H(4, 'club_night', 'QF', 20, 1)], titles: [T('pub_night', 'W', 35), T('kauri_cup', 'F', 85), T('pub_night', 'W', 35)] };
  const c0 = await show(good); out.C_before = { hero: c0.hero, old: c0.old };
  const seasonsOK = r => /season 1 club singles 61\.4 avg 17 darts season 2 regional rep 88\.2 avg 13 darts/i.test(r.old || '');
  if (!seasonsOK(c0) || !/titles 2 finals 3 prize money \$175/i.test(c0.hero || '')) fail.push('C before ' + JSON.stringify(out.C_before));
  const adopt = async mut => { await p.evaluate(mut => { const cp = JSON.parse(JSON.stringify(save)); cp.sv = (save.sv || 1) + 5; cp.dev = 'other'; const k = cp.career && cp.career.circuit;
      if (mut === 'legacy' && k) { delete k.titles; k.history.forEach(h => { delete h.week; delete h.prize; }); } netAdopt(cp); }, mut); await p.waitForTimeout(500); };
  await adopt('same'); const c1 = await show({}); out.C_adopt = { hero: c1.hero, old: !!c1.old }; if (!seasonsOK(c1) || !/titles 2 finals 3 prize money \$175/i.test(c1.hero || '')) fail.push('C after adopting a cloud copy ' + JSON.stringify(out.C_adopt));
  await p.reload(); await ready(); await p.evaluate(() => { $('login').hidden = true; showHub('play'); }); await p.waitForTimeout(1500); await p.evaluate(() => document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove())); const c2 = await show({}); out.C_reload = { hero: c2.hero }; if (!seasonsOK(c2) || !/titles 2 finals 3 prize money \$175/i.test(c2.hero || '')) fail.push('C after reload ' + JSON.stringify(out.C_reload));
  await p.evaluate(() => { try { window.TOPS_v11Migrate && TOPS_v11Migrate(); } catch (e) { window.__migErr = e.message; } persist(); }); const c3 = await show({}); out.C_migrate = { hero: c3.hero, err: await p.evaluate(() => window.__migErr || null) };
  if (!seasonsOK(c3) || !/titles 2 finals 3 prize money \$175/i.test(c3.hero || '') || out.C_migrate.err) fail.push('C after migration ' + JSON.stringify(out.C_migrate));
  await adopt('legacy'); const c4 = await show({}); out.C_legacy = { hero: c4.hero, cups: c4.cups, gap: c4.gap }; bad('C legacy cloud copy', c4);
  if (!seasonsOK(c4) || /not won/i.test(c4.all) || !/titles 2 finals 3/i.test(c4.hero || '') || !c4.cups.some(c => /^s3-trW:KAURI ARMS LEAGUE NIGHT Winner ×2/i.test(c))) fail.push('C legacy cloud copy ' + JSON.stringify(out.C_legacy));
  // ---------- D: best leg vs the Season 3 record
  const legCase = async (mine, rows) => { BL = rows; await p.evaluate(m => { const c = career(); c.best = c.best || {}; c.best.leg = m; c.best.legAt = { d: m, ev: 'Kauri Arms league night', week: 3 }; persist(); }, mine); const r = await show(good); await p.waitForTimeout(800); return (await show({})).bl; };
  out.D_other = await legCase(12, [{ name: 'Lee McKenzie', darts: 9, at: '2026-11-19T01:00:00Z' }, { name: 'Hayden', darts: 12, at: '2026-11-19T02:00:00Z' }]);
  out.D_youElse = await legCase(12, [{ name: 'Hayden', darts: 9, at: '2026-11-19T01:00:00Z' }]);
  out.D_you = await legCase(12, [{ name: 'Hayden', darts: 12, at: '2026-11-19T01:00:00Z' }, { name: 'Lee McKenzie', darts: 13, at: '2026-11-19T02:00:00Z' }]);
  out.D_none = await legCase(12, []);
  const big = s => (String(s || '').match(/^(\S+) darts/i) || [])[1];
  if (big(out.D_other) !== '12' || !/season 3 record: 9 darts · lee mckenzie$/i.test(out.D_other || '')) fail.push('D someone else holds it ' + out.D_other);
  if (big(out.D_youElse) !== '12' || !/season 3 record: 9 darts · you$/i.test(out.D_youElse || '')) fail.push('D you hold it from another device ' + out.D_youElse);
  if (big(out.D_you) !== '12' || !/you hold the season 3 record$/i.test(out.D_you || '')) fail.push('D you hold it ' + out.D_you);
  if (big(out.D_none) !== '12' || /record/i.test(out.D_none || '')) fail.push('D no board rows ' + out.D_none);
  // ---------- E: every level, 320 / 360 / 390
  const all = { level: 6, week: 1 + 7, history: [], titles: [] }; const LVS = await p.evaluate(() => TOPS_CIRCUIT.LEVELS.map(L => L.events.length));
  const evs = await p.evaluate(() => TOPS_CIRCUIT.LEVELS.map(L => L.events.map(e => e.id)));
  evs.forEach((ids, i) => { all.history.push(H(all.history.length + 1, ids[ids.length - 1], 'W', 100, i)); all.titles.push(T(ids[ids.length - 1], 'W', 100, i)); }); all.history.push(H(8, evs[6][0], 'F', 500, 6)); all.titles.push(T(evs[6][0], 'F', 500, 6)); all.week = 9;
  for (const w of [320, 360, 390]) { const r = await show(all, w); out['E' + w] = { lv: r.lv, minW: Math.round(r.minW), cut: r.cut, wide: r.wide }; bad('E ' + w, r);
    if (r.lv.length !== LVS.length || r.lv.some(x => x.n !== LVS[x.lv])) fail.push(w + ' shelf cards per level ' + JSON.stringify(r.lv) + ' want ' + LVS);
    if (r.minW < 96) fail.push(w + ' trophy card narrower than 96 px: ' + r.minW); if (r.cut.length) fail.push(w + ' names cut: ' + r.cut.join(', ')); if (r.small.length) fail.push(w + ' names under 11 px: ' + r.small.join(', ')); if (r.wide) fail.push(w + ': Trophies scrolls sideways');
    if (w === 320 && r.lv.some(x => x.cols !== 2)) fail.push('320: expected 2 columns ' + JSON.stringify(r.lv)); if (w >= 360 && r.lv.some(x => x.cols !== 3)) fail.push(w + ': expected 3 columns ' + JSON.stringify(r.lv));
    if (process.env.SHOTS) await p.screenshot({ path: path.join(__dirname, 's3_sd_all_' + w + '.png') }); }
  if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 300));
  console.log(JSON.stringify(out).slice(0, 2500)); console.log(fail.length ? 's3-shelf-data FAIL: ' + fail.join('; ') : 's3-shelf-data PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
