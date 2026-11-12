// Launch gate (Overseer 22:12, KPI review 7): safe-area audit over the whole inventory.
// Emulates the iPhone home-screen app's insets with Chrome's own override (env(safe-area-inset-*) = 47 top / 34 bottom at 390x844),
// opens every screen a player reaches, and checks each visible, tappable control (topmost at its centre) sits inside the safe area.
// A control below the bottom inset inside a container that can still scroll is fine (it scrolls up). usage: node tests/safe-audit.js [dir] [rebrand=1]
const { chromium } = require('playwright'); const path = require('path');
const dir = process.argv[2] || path.resolve(__dirname, '..'), RB = process.argv[3] || '1', TOP = 47, BOT = 34, W = 390, H = 844;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: W, height: H } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  const SA = await require('./_safearea').safeArea(p, { top: TOP, bottom: BOT });  // Chrome's override, or the env() shim where the browser lacks it (release gate)
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html?rebrand=' + RB); await p.waitForFunction(() => window.TC_API && typeof S !== 'undefined' && window.C3, null, { timeout: 180000 }); await p.waitForTimeout(1500);
  console.log('safe-area: ' + SA.mode + ' ' + JSON.stringify(await SA.verify(p)));
  const clean = () => p.evaluate(() => { try { delete TC_API.st().welPend; } catch (e) {} document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e => e.remove()); });
  const audit = (name) => p.evaluate(([name, TOP, BOT, H]) => {
    const bad = [], seen = new Set();
    const canScroll = el => { for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + e.scrollTop + 2) return true; } return false; };
    for (const el of document.querySelectorAll('button,a[href],[role=button],input,select,[onclick]')) {
      const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom <= 0 || r.top >= H) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.pointerEvents === 'none' || +cs.opacity < .05) continue;
      const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(H - 1, Math.max(0, r.top + r.height / 2)); const top = document.elementFromPoint(cx, cy); if (!top || !(el === top || el.contains(top))) continue;
      const id = el.id || (el.textContent || '').trim().slice(0, 24) || el.className; if (seen.has(id)) continue; seen.add(id);
      if (r.top < TOP - 1) bad.push({ id, why: 'under top inset', top: Math.round(r.top) });
      else if (r.bottom > H - BOT + 1 && !canScroll(el)) bad.push({ id, why: 'under bottom inset', bottom: Math.round(r.bottom) });
    }
    return { name, bad, n: seen.size };
  }, [name, TOP, BOT, H]);
  const out = []; const step = async (name, f, w = 1500) => { try { await p.evaluate(f); } catch (e) { out.push({ name, err: e.message.slice(0, 100) }); return; } await p.waitForTimeout(w); const a = await audit(name); out.push(a); await p.screenshot({ path: path.join(dir, `tests/safe_${name}.png`) }); };
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
  const fails = out.filter(o => o.err || (o.bad && o.bad.length));
  console.log(JSON.stringify(out)); console.log(fails.length ? 'safe-audit FAIL: ' + fails.map(f => f.name + (f.err ? ' (error ' + f.err + ')' : ': ' + f.bad.map(x => x.id + ' ' + x.why).join(', '))).join(' | ') : 'safe-audit PASS (' + out.length + ' screens)');
  await b.close();
})();
