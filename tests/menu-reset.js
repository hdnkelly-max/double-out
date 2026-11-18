// BUG-MENU (David, Android, TOPS chat 17 Nov 'the main menu button doesn't work all the time'): right after a between-match reset (ENG-RESET
// reload), ☰ → Main menu must open the title. On 3.49 it did nothing for 30 s (v16 turned every showTitle into a hub refresh). Android touch,
// four runs tapping 0 / 0.3 / 0.9 / 2 s after the loader lifts. usage: node tests/menu-reset.js [dir]
const { chromium, devices } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..'); const out = process.argv[3] || ''; const N = +(process.env.N || 4);
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const ctx = await b.newContext({ ...devices['Pixel 7'] }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message)); const logs = []; p.on('console', m => { if (/reset|boot|TOPS/i.test(m.text())) logs.push(m.text().slice(0, 120)); });
  await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/, r => r.abort());
  await p.goto('file://' + dir + '/index.html'); await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_RB, null, { timeout: 180000 }); await p.waitForTimeout(1500);
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'David'; newCareer(); const c = career(); c.stage = 'season'; c.bank = 640; newSeason(c); save.tcWelSeen = 1; persist(); });
  const screen = () => p.evaluate(() => { const v = id => { const e = document.getElementById(id); return e && !e.hidden && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden'; }; const L = document.getElementById('loading'); return ['title', 'hub', 'login', 'creator'].filter(v).join(',') + (document.getElementById('rbApp') && !document.getElementById('rbApp').hidden ? '+rb' : '') + (L && !L.classList.contains('gone') ? '+LOADER' : ''); });
  const runs = [];
  for (let k = 0; k < N; k++) {
    // what the game writes before its between-match reload (v16 FK), then reload
    await p.evaluate(() => { try { sessionStorage.setItem('tops_reset_go', JSON.stringify({ t: Date.now(), saveMs: Date.now(), run: false, tab: 'play', why: 'match' })); sessionStorage.setItem('tops_reset', JSON.stringify({ k: 'Next up', t: 'vs Kev Marsh', s: 'Club singles' })); } catch (e) {} });
    await p.reload(); const t0 = Date.now(); const tl = [];
    let tapped = null;
    for (let i = 0; i < 60; i++) { const s = await screen(); tl.push(((Date.now() - t0) / 1000).toFixed(1) + ' ' + s);
      if (!tapped && /hub\+rb/.test(s) && !/LOADER/.test(s)) { const delay = [0, 300, 900, 2000][k % 4]; await p.waitForTimeout(delay);
        const mb = await p.evaluate(() => { const e = document.getElementById('rbMenu'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
        if (mb) { await p.touchscreen.tap(mb[0], mb[1]); await p.waitForTimeout(350); const ib = await p.evaluate(() => { const e = document.querySelector('#rbMenuSheet [data-m="title"]'); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
          tapped = { at: ((Date.now() - t0) / 1000).toFixed(1), delay, sheet: !!ib }; if (ib) await p.touchscreen.tap(ib[0], ib[1]); } }
      if (tapped && Date.now() - t0 > (+tapped.at * 1000) + 8000) break; await p.waitForTimeout(250); }
    const fin = await screen(); runs.push({ k, tapped, final: fin, tl: tl.filter((x, i) => i === 0 || x.split(' ')[1] !== tl[i - 1].split(' ')[1]) });
    
    await p.evaluate(() => { try { showHub('play'); } catch (e) {} }); await p.waitForTimeout(1500); }
  const bad = runs.filter(r => !r.tapped || !r.tapped.sheet || !/title/.test(r.final)); console.log(JSON.stringify(runs.map(r => [r.k, r.tapped, r.final]))); console.log(bad.length ? 'menu-reset FAIL: Main menu after a reset left the player on ' + bad.map(r => r.final).join(', ') : 'menu-reset PASS (' + runs.length + ' resets)'); await b.close(); process.exit(bad.length ? 1 : 0); })();
