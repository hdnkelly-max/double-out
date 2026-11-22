// DQ check for exp-s3-imgswitch: every picture on the Season 3 screens goes through the switch (s3/ redo, or the dark placeholder), on
// this engine. For each screen, every visible <img> src and every computed background-image URL is read; a path the switch WOULD change
// but that is still showing as the old one is "unswitched". usage: BR=chromium|webkit node imgscan.js <dir>
const pw = require('playwright'); const fs = require('fs'), path = require('path'); const dir = path.resolve(process.argv[2]); const BR = process.env.BR || 'chromium';
(async () => { const b = await pw[BR].launch(BR === 'chromium' ? { args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] } : {});
  const res = {}; for (const v3 of ['0', '1']) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message.slice(0, 120)));
  const raw = fs.readFileSync(path.join(__dirname, 'a_long_s3.json'), 'utf8');
  await p.addInitScript(raw => { if (!sessionStorage.getItem('q')) { localStorage.setItem('doubleout_s3', raw); localStorage.setItem('tops_s3_welcome', '1'); sessionStorage.setItem('q', 1); } }, raw);
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?s3=1&s3x=1&v3=' + v3, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.TOPS_S3 && window.TOPS_S3_IMG, null, { timeout: 180000 }); await p.waitForTimeout(3000);
  const scan = name => p.evaluate(name => { const PATH = /(?:\.\/)?((?:assets|img)\/[\w\/.-]+?\.(?:jpe?g|png|webp))/g; const rows = { name, seen: 0, switched: 0, unswitched: [] };
    const shown = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.bottom > 0 && r.top < innerHeight; };
    const base = location.href.replace(/[^/]*$/, ''); const check = (u0, where) => { const u = u0.split(base).join(''); let m; PATH.lastIndex = 0; while ((m = PATH.exec(u))) { const pth = m[1], off = m.index; if (/s3\/(v3\/)?$/.test(u.slice(Math.max(0, off - 6), off))) { rows.seen++; rows.switched++; continue; } rows.seen++; const w = TOPS_S3_IMG(pth); if (w !== pth) rows.unswitched.push(where + ' ' + pth); } if (/s3\/|data:image\/svg/.test(u) && !PATH.test(u)) { rows.seen++; rows.switched++; } };
    for (const e of document.querySelectorAll('body *')) { if (!shown(e)) continue; if (e.tagName === 'IMG') check(e.getAttribute('src') || '', 'img' + (e.id ? '#' + e.id : '.' + String(e.className).split(' ')[0]));
      const bg = getComputedStyle(e).backgroundImage; if (bg && bg !== 'none') check(bg, (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0])); }
    rows.unswitched = [...new Set(rows.unswitched)].slice(0, 8); return rows; }, name);
  const out = [];
  await p.evaluate(() => { try { const l = document.getElementById('login'); if (l) l.hidden = true; save.authSeen = true; showTitle(); } catch (e) {} }); await p.waitForTimeout(1500); out.push(await scan('title'));
  await p.evaluate(() => { const n = document.getElementById('s3V3New'); if (n) n.remove(); try { showHub('play'); } catch (e) {} }); await p.waitForTimeout(2000);
  const tabs = await p.evaluate(() => [...document.querySelectorAll('#rbTabs button')].map(b => b.dataset.t));
  for (const t of tabs) { await p.evaluate(t => { const b = document.querySelector(`#rbTabs [data-t="${t}"]`); if (b) b.click(); }, t); await p.waitForTimeout(1200); out.push(await scan('hub:' + t));
    if (t === 'locker') for (const k of await p.evaluate(() => [...document.querySelectorAll('#rbApp [data-lk]')].map(x => x.dataset.lk))) { await p.evaluate(k => { const x = document.querySelector(`#rbApp [data-lk="${k}"]`); if (x) x.click(); }, k); await p.waitForTimeout(1200); out.push(await scan('locker:' + k)); } }
  await p.evaluate(() => { try { TC_API.binder(); } catch (e) {} }); await p.waitForTimeout(2000); out.push(await scan('binder'));
  await p.evaluate(() => { document.querySelectorAll('.tc-sheet').forEach(s => s.remove()); try { TC_API.cabinet(); } catch (e) {} }); await p.waitForTimeout(1500); out.push(await scan('cabinet'));
  res['v3=' + v3] = { screens: out.map(r => `${r.name}: ${r.switched}/${r.seen}${r.unswitched.length ? ' UNSWITCHED ' + r.unswitched.join(', ') : ''}`), totalUnswitched: out.reduce((a, r) => a + r.unswitched.length, 0), pageErrors: pe.slice(0, 3) };
  await ctx.close(); }
  console.log(JSON.stringify({ BR, ...res })); await b.close(); })();
