// CI-only diagnostic for s3-v3heads' "#btnNewCareer click timed out" on the switch-on candidate: what is on screen, what a tap there hits
const { chromium } = require('playwright'); const dir = process.argv[2];
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  for (const v3 of ['1', '0']) { const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = [], con = []; p.on('pageerror', e => pe.push(e.message.slice(0, 200))); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') con.push(m.text().slice(0, 160)); });
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('tops_s3_welcome', '1'); } catch (e) {} });
    const t0 = Date.now(); await p.goto('file://' + dir + '/index.html?s3=1&v3=' + v3, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.TOPS_S3, null, { timeout: 180000 }); await p.waitForTimeout(2500);
    await p.evaluate(() => { $('login').hidden = true; save.authSeen = true; persist(); showTitle(); }); await p.waitForTimeout(1000);
    const probe = () => p.evaluate(() => { const bt = document.getElementById('btnNewCareer'); if (!bt) return 'no #btnNewCareer'; const r = bt.getBoundingClientRect(), cs = getComputedStyle(bt);
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); const nm = e => e ? (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) : 'null';
      const chain = []; for (let a = top; a && chain.length < 5; a = a.parentElement) chain.push(nm(a));
      return { rect: [r.x, r.y, r.width, r.height].map(Math.round), vis: cs.visibility, disp: cs.display, op: cs.opacity, pe: cs.pointerEvents, disabled: bt.disabled, title: !document.getElementById('title').hidden, hits: chain.join(' < '), v3nl: !!document.getElementById('s3V3New'), overlays: [...document.querySelectorAll('body > *')].filter(e => { const s = getComputedStyle(e); return s.position === 'fixed' && s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0.05 && e.getBoundingClientRect().width > 300; }).map(nm).slice(0, 8) }; });
    const before = await probe(); let click = 'ok'; const tc = Date.now();
    try { await p.locator('#btnNewCareer').click({ timeout: 30000 }); } catch (e) { click = e.message.split('\n').filter(l => /waiting|intercept|not visible|not stable|retrying|element is/.test(l)).slice(-6).join(' / ').slice(0, 900) || e.message.slice(0, 300); }
    const after = await probe().catch(e => 'probe failed ' + e.message.slice(0, 80));
    // main-thread responsiveness: how late does a 100 ms timer fire
    const lag = await p.evaluate(() => new Promise(res => { const t = performance.now(); setTimeout(() => res(Math.round(performance.now() - t - 100)), 100); })).catch(() => 'n/a');
    console.log(JSON.stringify({ v3, loadS: Math.round((tc - t0) / 1000), clickS: Math.round((Date.now() - tc) / 1000), click, before, after, timerLagMs: lag, pageErrors: pe.slice(0, 5), console: con.slice(-6) }, null, 1));
    await p.close(); }
  await b.close(); })();
