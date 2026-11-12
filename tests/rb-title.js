// EXP-TITLE: every control on the Broadcast title hands over to the game's own screen or sheet, and nothing opens UNDER the title layer.
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html', { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3, null, { timeout: 180000 });
  await p.evaluate(() => { save.authSeen = true; save.lessonDone = true; save.name = 'Hayden'; newCareer(); career().stage = 'season'; persist(); $('login').hidden = true; });
  const out = {}, fails = [];
  for (const id of ['rbtCred', 'rbtCalib', 'rbtLesson', 'rbtMate', 'rbtThrow', 'rbtRun', 'rbtNew', 'rbtIn', 'rbtSnd', 'rbtGo']) {
    await p.evaluate(() => { const ct = document.getElementById('calTap'); if (ct) { let e = ct; while (e.parentElement && e.parentElement !== document.body && getComputedStyle(e).position !== 'fixed') e = e.parentElement; e.remove(); } const cr = document.getElementById('credits'); if (cr) cr.hidden = true; document.querySelectorAll('.sheet,.tc-sheet,.tc-scrim').forEach(e => { if (getComputedStyle(e).position === 'fixed') e.remove(); }); try { if (typeof S !== 'undefined' && S && !S.done) { S.done = true; } } catch (e) {} showTitle(); });
    await p.waitForTimeout(1500);
    const before = await p.evaluate(() => !document.getElementById('rbTitle').hidden);
    await p.evaluate(id => document.getElementById(id).click(), id); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => { document.querySelectorAll('#intro.show').forEach(e => e.classList.remove('show')); const t = document.getElementById('rbTitle'); const top = document.elementFromPoint(195, 420); return { title: !t.hidden, topInTitle: !!(top && top.closest('#rbTitle')), top: top ? ((top.closest('[id]') || {}).id || top.tagName) : '' }; });
    out[id] = { before, ...r };
    // a control that leaves the title up must be an in-place toggle (sound) or open something ABOVE it; never something hidden under it
    if (!before) fails.push(id + ': title not shown first');
    else if (id === 'rbtSnd') { if (!r.title || !r.topInTitle) fails.push('sound toggle should stay on the title'); }
    else if (id === 'rbtIn') { const lg = await p.evaluate(() => !document.getElementById('login').hidden); out[id].login = lg; if (r.title || !lg) fails.push('sign-in: login must replace the title layer'); await p.evaluate(() => { document.getElementById('login').hidden = true; }); }
    else if (r.title && r.topInTitle) fails.push(id + ': nothing visible came forward (opened under the title?)');
  }
  console.log(JSON.stringify(out)); if (errs.length) console.log('errors', errs.slice(0, 3));
  console.log(fails.length ? 'rb-title FAIL: ' + fails.join('; ') : 'rb-title PASS'); await b.close(); process.exit(fails.length ? 1 : 0); })();
