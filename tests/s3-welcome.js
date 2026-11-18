// EXP-S3C 'Season 3 is here': a new device opening with Season 3 on sees the welcome once, after the loading screen, before the creator;
// Start your career opens the creator; a reload doesn't show it again; Season 3 off never shows it. usage: node tests/s3-welcome.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const fail = [], out = {};
  const run = async (qs, fn) => { const ctx = await b.newContext({ viewport: { width: +(process.env.VW || 390), height: +(process.env.VH || 844) }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
    await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.goto('file://' + dir + '/index.html' + qs, { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 180000 });
    await fn(p); if (pe.length) fail.push(qs + ' page errors ' + pe.join('; ').slice(0, 160)); await ctx.close(); };
  const wel = p => p.evaluate(() => { const w = document.getElementById('s3Wel'); return w ? { t: w.innerText, top: document.elementFromPoint(innerWidth / 2, innerHeight - 40).closest('#s3Wel') ? 1 : 0, wide: document.documentElement.scrollWidth > innerWidth + 1 } : null; });
  await run('?s3=1', async p => {
    for (let i = 0; i < 60 && !(await wel(p)); i++) await p.waitForTimeout(250);
    await p.waitForTimeout(800); out.first = await wel(p); if (process.env.SHOTS) await p.screenshot({ path: path.join(__dirname, 's3_welcome.png') });
    if (!out.first) fail.push('no welcome on first open'); else { if (!/start your career/i.test(out.first.t) || !/pub/i.test(out.first.t) || !/circuit/i.test(out.first.t) || !/best leg/i.test(out.first.t) || !/seasons 1 and 2/i.test(out.first.t)) fail.push('welcome copy ' + out.first.t.slice(0, 200)); if (!out.first.top) fail.push('welcome not on top'); if (out.first.wide) fail.push('welcome scrolls sideways'); }
    out.loaderGone = await p.evaluate(() => { const l = document.getElementById('loading'); return !l || l.classList.contains('gone') || getComputedStyle(l).display === 'none'; }); if (!out.loaderGone) fail.push('welcome showed under the loading screen');
    out.screenBefore = await p.evaluate(() => !document.getElementById('title').hidden ? 'title' : !document.getElementById('login').hidden ? 'login' : 'other');
    await p.locator('#s3WelGo').tap(); await p.waitForTimeout(1500);
    out.after = await p.evaluate(() => ({ wel: !!document.getElementById('s3Wel'), creator: !document.getElementById('creator').hidden, seen: localStorage.getItem('tops_s3_welcome') }));
    if (out.after.wel || out.after.seen !== '1' || (out.screenBefore === 'title' && !out.after.creator)) fail.push('Start your career (' + out.screenBefore + '): ' + JSON.stringify(out.after));
    out.loginKept = out.screenBefore !== 'login' || await p.evaluate(() => !document.getElementById('login').hidden); if (!out.loginKept) fail.push('Start your career skipped the sign-in screen');
    await p.reload(); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(5000); out.again = await wel(p); if (out.again) fail.push('welcome showed again after a reload'); });
  await run('?s3=0', async p => { await p.waitForTimeout(8000); out.off = await wel(p); if (out.off) fail.push('welcome showed with Season 3 off'); });
  console.log(JSON.stringify(out).slice(0, 600)); console.log(fail.length ? 's3-welcome FAIL: ' + fail.join('; ') : 's3-welcome PASS'); await b.close(); process.exit(fail.length ? 1 : 0); })();
