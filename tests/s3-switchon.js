// Season 3 switch-on decisions (Producer 22 Nov 06:51), behind s3x:
// (a) the old 3D trophy cabinet is linked from the Seasons 1 & 2 card in Locker > Trophies (not retired): the link sits inside the card,
//     opens the cabinet on top, still works after the card is redrawn when the history arrives late, and shows (alone) when the history
//     can't load; the Season 1/2 rows keep the level name whole at 320.
// (b) the five tabs fit at 320-390 with 13 px text (no 12 px), even gaps between labels, nothing clipped or touching the edges, and still
//     fit with a dot on PRACTICE at 320.
// s3x off: the live Season 3 tabs are unchanged (five equal slots, the live 12 px rule under 351 px) and there's no s3x shelf. usage: node tests/s3-switchon.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] }); const fail = [], out = {};
  const ME = { you: true, name: 'Hayden', s1: { furthest: { level: 3, n: 'Regional' }, bestAvg: 48.2, bestLeg: 19 }, s2: { furthest: { level: 4, n: 'DPNZ Tour' }, bestAvg: 52.7, bestLeg: 17 } };
  const page = async (w, h, s3x, hist) => {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await ctx.addInitScript(x => { try { localStorage.setItem('tops_s3_welcome', '1'); localStorage.setItem('tops_s3_firstnight', '1'); localStorage.setItem('tops_s3x', x); } catch (e) {} }, s3x);
    const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.goto('file://' + dir + '/index.html?s3=1&s3x=' + s3x, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.TOPS_S3UI && window.TOPS_RB, null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(([hist, me]) => {
      // the Seasons 1 & 2 history: 'ok' answers at once, 'late' after 1.5 s (the card is redrawn in place), 'fail' never loads
      if (window.TOPS_HISTORY) TOPS_HISTORY.rows = hist === 'ok' ? async () => [me] : hist === 'late' ? () => new Promise(r => setTimeout(() => r([me]), 1500)) : async () => { throw new Error('offline'); };
      save.name = 'Hayden'; save.lessonDone = true; newCareer(); persist();
      const t = TC_API.st(); t.troph.push({ id: TC_API.D.TROPHIES[0].id, tier: 0, wins: [{ at: Date.now() }] }, { id: TC_API.D.TROPHIES[2].id, tier: 2, wins: [{ at: Date.now() }] });
      $('login').hidden = true; save.authSeen = true; try { $('title').hidden = true; } catch (e) {} TOPS_RB.open('locker'); }, [hist, ME]);
    await p.waitForTimeout(1500); p.pe = pe; p.ctx = ctx; return p; };
  const tabs = p => p.evaluate(() => { const bs = [...document.querySelectorAll('#rbTabs button')], rg = document.createRange();
    const e = bs.map(b => { rg.selectNodeContents(b); const r = rg.getBoundingClientRect(), br = b.getBoundingClientRect(); return { t: b.textContent.trim(), l: r.left, r: r.right, w: br.width, fs: parseFloat(getComputedStyle(b).fontSize), clip: b.scrollWidth > b.clientWidth + 1 }; });
    return { n: e.length, fs: Math.min(...e.map(x => x.fs)), gaps: e.slice(1).map((x, i) => Math.round(x.l - e[i].r)), edgeL: Math.round(e[0].l), edgeR: Math.round(innerWidth - e[e.length - 1].r), clip: e.filter(x => x.clip).map(x => x.t), w: e.map(x => Math.round(x.w)) }; });
  const trophies = p => p.evaluate(async () => { const t = [...document.querySelectorAll('#rbApp button')].find(b => /^Trophies$/.test(b.textContent.trim())); if (t) t.click(); await new Promise(r => setTimeout(r, 1200)); });
  const cardOf = p => p.evaluate(() => { const c = document.getElementById('s3TrHi'), cb = document.getElementById('rbCab'); const lab = [...document.querySelectorAll('#s3TrHi .s3-trold li')].map(li => { const s = li.children[1]; return s ? { t: s.textContent, cut: s.scrollWidth > s.clientWidth + 1 } : null; });
    return { text: c ? c.innerText.replace(/\s+/g, ' ').trim() : null, inCard: !!(cb && c && c.contains(cb)), links: document.querySelectorAll('#rbCab').length, h: cb ? Math.round(cb.getBoundingClientRect().height) : 0, rows: lab, wide: document.documentElement.scrollWidth > innerWidth + 1 }; });
  const open = p => p.evaluate(async () => { const cb = document.getElementById('rbCab'); if (!cb) return { sheet: false }; cb.scrollIntoView({ block: 'center' }); cb.click(); await new Promise(r => setTimeout(r, 2500));
    const s = document.querySelector('.tc-cab'); const r = s && s.getBoundingClientRect(); const top = r && document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 120)); return { sheet: !!s, onTop: !!(s && top && s.contains(top)) }; });

  // (b) tabs, and (a) the link, at four widths with the history in
  for (const [w, h] of [[320, 568], [350, 700], [360, 640], [390, 844]]) {
    const p = await page(w, h, '1', 'ok'); const tb = await tabs(p); out['tabs' + w] = tb;
    if (tb.n !== 5 || tb.fs < 13) fail.push(`${w} tab text ${tb.fs}px (want 13)`);
    if (tb.clip.length) fail.push(`${w} tabs clipped ${tb.clip}`);
    if (Math.min(...tb.gaps) < 8) fail.push(`${w} tab labels crowd: gaps ${tb.gaps}`);
    if (Math.max(...tb.gaps) - Math.min(...tb.gaps) > 2) fail.push(`${w} tab gaps uneven ${tb.gaps}`);
    if (tb.edgeL < 6 || tb.edgeR < 6) fail.push(`${w} tab labels at the edge L${tb.edgeL} R${tb.edgeR}`);
    await trophies(p); await p.waitForTimeout(600); const c = await cardOf(p); out['card' + w] = c;
    if (!c.inCard || c.links !== 1) fail.push(`${w} cabinet link not in the Seasons 1 & 2 card ${JSON.stringify(c)}`);
    if (!/Season 1 Regional/i.test(c.text || '') || !/Season 2 DPNZ Tour/i.test(c.text || '') || !/Trophy cabinet 2 trophies on the shelves/i.test(c.text || '')) fail.push(`${w} card text ${c.text}`);
    if (c.rows.some(r => !r || r.cut)) fail.push(`${w} Season 1/2 level name cut ${JSON.stringify(c.rows)}`);
    if (c.h < 44) fail.push(`${w} cabinet link ${c.h}px tall`); if (c.wide) fail.push(`${w} page scrolls sideways`);
    const o = await open(p); out['open' + w] = o; if (!o.sheet || !o.onTop) fail.push(`${w} cabinet didn't open on top ${JSON.stringify(o)}`);
    if (w === 320) { // a dot on PRACTICE (the shell's new-item dot) still fits
      await p.evaluate(() => { const x = document.querySelector('.tc-cab .tc-x'); if (x) x.click(); const t = document.querySelector('#rbTabs [data-t="practice"]'); if (t) t.insertAdjacentHTML('beforeend', '<span class="rb-dot"></span>'); });
      const td = await tabs(p); out.tabsDot = td; if (td.clip.length || Math.min(...td.gaps) < 6 || td.edgeR < 4) fail.push(`320 tabs with a dot ${JSON.stringify(td)}`); }
    if (p.pe.length) fail.push(`${w} page errors ${p.pe.join('; ').slice(0, 200)}`); await p.ctx.close(); }

  // (a) history late (the card is redrawn in place: the link must still open), and history offline (the link shows alone)
  for (const hist of ['late', 'fail']) {
    const p = await page(360, 640, '1', hist); await trophies(p); await p.waitForTimeout(2500); const c = await cardOf(p); out[hist] = c;
    if (!c.inCard || c.links !== 1) fail.push(`${hist}: no cabinet link ${JSON.stringify(c)}`);
    if (hist === 'late' && !/Season 2 DPNZ Tour/i.test(c.text || '')) fail.push(`late: records didn't arrive ${c.text}`);
    if (hist === 'fail' && (/Season 1/.test(c.text || '') || !/^Seasons 1 & 2 · yours Trophy cabinet/i.test(c.text || ''))) fail.push(`fail: card ${c.text}`);
    const o = await open(p); out['open_' + hist] = o; if (!o.sheet || !o.onTop) fail.push(`${hist}: cabinet didn't open ${JSON.stringify(o)}`);
    if (p.pe.length) fail.push(`${hist} page errors ${p.pe.join('; ').slice(0, 200)}`); await p.ctx.close(); }

  // s3x off: the old Locker and tabs are untouched
  { const p = await page(320, 568, '0', 'ok'); const r = await p.evaluate(() => ({ s3x: document.documentElement.classList.contains('s3x'), cab: (document.getElementById('rbCab') || {}).textContent || null, card: !!document.getElementById('s3TrHi'),
      w: [...document.querySelectorAll('#rbTabs button')].map(b => Math.round(b.getBoundingClientRect().width)), fs: [...document.querySelectorAll('#rbTabs button')].map(b => getComputedStyle(b).fontSize) }));
    out.off = r; if (r.s3x || r.card) fail.push('s3x off shows the s3x layer ' + JSON.stringify(r));
    if (r.w.length !== 5 || Math.max(...r.w) - Math.min(...r.w) > 1 || r.fs.some(f => f !== '12px')) fail.push('s3x off tabs changed ' + JSON.stringify(r));
    if (p.pe.length) fail.push(`off page errors ${p.pe.join('; ').slice(0, 200)}`); await p.ctx.close(); }

  console.log(JSON.stringify(out).slice(0, 1800)); console.log(fail.length ? 's3-switchon FAIL: ' + fail.join('; ') : 's3-switchon PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
