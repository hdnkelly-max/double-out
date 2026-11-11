// #14 guard (QA, 11 Nov): on a phone the Collection must scroll when the swipe starts on a card.
// Cards had touch-action:none (needed for the pack flip), so a swipe on the binder grid did nothing.
// Opens the Collection at 390 px with touch, does a real touch drag (CDP) that starts on a card, and checks the sheet scrolled.
// Usage: node tests/scroll14.js   exits 1 on failure.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/, r => r.abort());
  await p.goto('file://' + path.resolve(__dirname, '../index.html')); await p.waitForTimeout(4000);
  const setup = await p.evaluate(() => {
    try {
      save.authSeen = true; const l = $('login'); if (l) l.hidden = true; newCareer();
      const t = TC_API.st(); t.srv = false; TC_API.D.CARDS.filter(c => !c.exclusive).forEach(c => { t.own[c.id] = t.own[c.id] || 1; });   // a full binder, so there is plenty to scroll
      TC_API.binder(); return 'ok';
    } catch (e) { return 'setup ' + e.message; }
  });
  if (setup !== 'ok') { console.log('scroll14: FAIL ' + setup); process.exit(1); }
  await p.waitForTimeout(1500);
  // the scrolling element: the nearest scrollable ancestor of the first card in the grid
  const info = await p.evaluate(() => {
    const card = document.querySelector('#tcGrid .tc'); if (!card) return { err: 'no card in the binder grid' };
    let sc = card.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight + 20 && /(auto|scroll)/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement;
    if (!sc) sc = document.scrollingElement;
    sc.setAttribute('data-qa-scroll', '1');
    const r = card.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: Math.min(r.top + r.height / 2, innerHeight - 200), top: sc.scrollTop, max: sc.scrollHeight - sc.clientHeight, ta: getComputedStyle(card).touchAction, tag: sc.id || sc.className || sc.tagName };
  });
  if (info.err) { console.log('scroll14: FAIL ' + info.err); process.exit(1); }
  if (info.max < 100) { console.log('scroll14: FAIL binder has nothing to scroll (max ' + info.max + ')'); process.exit(1); }
  const cdp = await ctx.newCDPSession(p);
  const swipe = async (x, y0, y1) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
    for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + (y1 - y0) * i / 10 }] }); await p.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(600);
  };
  await swipe(info.x, info.y, info.y - 300);
  const after = await p.evaluate(() => document.querySelector('[data-qa-scroll]').scrollTop);
  const fails = [];
  if (!(after > info.top + 40)) fails.push(`Collection did not scroll when the swipe started on a card (scrollTop ${info.top} -> ${after}; card touch-action: ${info.ta})`);
  if (errs.length) fails.push('page errors: ' + errs.slice(0, 2).join(' | '));
  console.log(`scroll14: card touch-action ${info.ta} · scroller ${info.tag} · scrollTop ${info.top} -> ${after} (max ${info.max})`);
  await b.close();
  if (fails.length) { console.log('scroll14: FAIL\n- ' + fails.join('\n- ')); process.exit(1); }
  console.log('scroll14: PASS');
})();
