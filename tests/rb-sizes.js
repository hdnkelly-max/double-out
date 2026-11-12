// Delivery QA R2 findings 1-2 (01:08): text under 11 px and taps under 44 px, same screen walk as safe-audit.js. usage: node tests/rb-sizes.js [dir] [rebrand=1] [width] [height]
// Emulates the iPhone home-screen app's insets with Chrome's own override (env(safe-area-inset-*) = 47 top / 34 bottom at 390x844),
// opens every screen a player reaches, and checks each visible, tappable control (topmost at its centre) sits inside the safe area.
// A control below the bottom inset inside a container that can still scroll is fine (it scrolls up). usage: node tests/safe-audit.js [dir] [rebrand=1]
const { chromium } = require('playwright'); const path = require('path');
const dir = process.argv[2] || path.resolve(__dirname, '..'), RB = process.argv[3] || '1', TOP = 47, BOT = 34, W = +(process.argv[4] || 390), H = +(process.argv[5] || 844);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: W, height: H } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: TOP, bottom: BOT, left: 0, right: 0 } });
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?rebrand=' + RB); await p.waitForFunction(() => window.TC_API && typeof S !== 'undefined' && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1500);
  const clean = () => p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  const audit = (name) => p.evaluate(([name]) => {
    const bad = [], seen = new Set(); const H = innerHeight;
    const vis = el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom <= 0 || r.top >= H) return null; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < .05) return null; } return r; };
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) { const t = n.textContent.trim(); if (!t || /^[·•|–—]$/.test(t)) continue; const el = n.parentElement; if (!el || el.closest('svg,canvas,.tc-card,.tcc')) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs >= 10.95 || fs < 1) continue; const r = vis(el); if (!r) continue; const k = 'T ' + t.slice(0, 20) + ' ' + fs; if (seen.has(k)) continue; seen.add(k); bad.push({ k: 'text', t: t.slice(0, 30), fs: +fs.toFixed(1), cls: (el.id ? '#' + el.id : '') + '.' + String(el.className).slice(0, 30) }); }
    for (const el of document.querySelectorAll('button,a[href],[role=button],[role=tab],input:not([type=hidden]),select,[onclick]')) { const r = vis(el); if (!r) continue; const cs = getComputedStyle(el); if (cs.pointerEvents === 'none') continue; const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(H - 1, Math.max(0, r.top + r.height / 2)); const top = document.elementFromPoint(cx, cy); if (!top || !(el === top || el.contains(top))) continue; if (r.height >= 43.5 && r.width >= 43.5) continue; const t = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24); const k = 'B ' + (el.id || t) + Math.round(r.height); if (seen.has(k)) continue; seen.add(k); bad.push({ k: 'tap', t, w: Math.round(r.width), h: Math.round(r.height), cls: (el.id ? '#' + el.id : '') + '.' + String(el.className).slice(0, 30), rb: !!el.closest('#rbApp') }); }
    return { name, bad };
  }, [name]);
  const out = []; const step = async (name, f, w = 1500) => { try { await p.evaluate(f); } catch (e) { out.push({ name, err: e.message.slice(0, 100) }); return; } await p.waitForTimeout(w); const a = await audit(name); out.push(a);  };
  await step('login', () => { $('login').hidden = false; showScreen('login'); });
  await step('title_first', () => { save.authSeen = true; $('login').hidden = true; showTitle(); });
  await step('creator', () => showScreen('creator'));
  await p.evaluate(() => { save.name = 'Hayden'; save.matches = 30; newCareer(); const c = career(); c.tier = 1; c.bank = 640; c.wins = 3; c.losses = 2; c.pts = 2400; c.darts = 150; c.tierAvgs = [41, 45, 40, 48]; newSeason(c); save.tcWelSeen = 1; persist(); });
  await step('title_returning', () => showTitle());
  await step('hub_tonight', () => showHub('play'), 4000); await clean();
  for (const t of ['season', 'shop', 'locker', 'practice']) await step('hub_' + t, (t) => { const b = document.querySelector(`#rbTabs [data-t="${t}"]`); if (b) b.click(); else hubTab({ shop: 'kit', locker: 'player' }[t] || t); }, 1200);
  for (const k of ['stats', 'cards', 'troph']) await step('locker_' + k, (k) => { const t = document.querySelector('#rbTabs [data-t="locker"]'); if (t) t.click(); const b = document.querySelector(`#rbApp [data-lk="${k}"]`); if (b) b.click(); }, 1000);
  await step('rb_menu', () => { const m = document.getElementById('rbMenu'); if (m) m.click(); }, 600); await p.evaluate(() => { const m = document.getElementById('rbMenuSheet'); if (m) m.remove(); });
  await step('old_kit', () => { hubTab('kit'); showShop('setup', true); }, 1500);
  await step('binder', () => TC_API.binder(), 1500); await clean();
  await step('cabinet', () => TC_API.cabinet(), 2500); await clean();
  await step('poster', () => TC_API.poster({ venue: 'the Club', tries: 2, weeksLeft: 3 }, TC_API.D.LEGENDS[0], true), 2000); await clean();
  await step('online', () => openMultiplayer(), 2000);
  await step('message', () => { try { showMsg({ from: 'Deano', sub: 'League', thread: ['Big one Thursday.'], replies: ['Bring it', 'Nervous'] }); } catch (e) { showScreen('msg'); } }, 1500);
  await step('pack', () => { save.tcIntro = Date.now(); TC_API.award('sa1', 'win', 't'); TC_API.openPack(TC_API.st().picks.filter(x => x.chosen == null), null); }, 2500); await clean();
  await step('match', () => { showHub('play'); const n = nextOpponent(); V.walkOn = () => {}; beginMatch({ mode: 'career', tier: 1, p0: 'Hayden', oppKey: n.oppKey, oppName: n.oppName, oppAvg: 40, legs: 3, start: 301 }); }, 4000);
  await step('match_menu', () => $('btnMenu').click(), 600); await p.evaluate(() => $('btnMenu').click());
  await step('run_hub', () => { S = null; startRun(); }, 3000);
  await step('perk', () => showScreen('perk'), 1000);
  for (const o of out) { console.log('== ' + o.name + (o.err ? ' ERR ' + o.err : '')); for (const x of o.bad || []) console.log('  ' + JSON.stringify(x)); }
  await b.close();
})();
