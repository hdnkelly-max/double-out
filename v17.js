<script>
// ===== CAR-TABS (Q&D, Producer 22 Nov 07:38): one tab owns the save =====
// Two tabs of one browser each held their own copy of the save and wrote all of it on every save, so the last tab to save won (real progress
// lost on 4.26). Now:
//  1 ownership: a tab that opens announces itself (BroadcastChannel, with the storage event as the fallback); any older tab steps aside behind
//    a calm full-screen card, "TOPS is open in another tab", whose "Play here" reloads the latest save and takes ownership back
//  2 write guard: before writing, a tab compares the save counter in storage (sv, bumped on every save) with its own; if another tab (or an
//    older build) saved since, it never overwrites: it steps aside behind the same card, and Play here re-reads
//  3 the cloud gets the same guard: a stepped-aside or stale tab never pushes its copy
//  4 a save only writes when something changed (the hub redraws, about every 2.5 s while portraits load, used to save each time)
(function () {
  if (typeof persist !== 'function' || typeof TOPS_SAVE_NS === 'undefined') return;
  const KEY = TOPS_SAVE_NS.key, OWN = 'tops_owner_' + KEY, TAB = 't' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  let away = false, lastBody = null;
  const svIn = () => { try { const s = localStorage.getItem(KEY); return s ? +(JSON.parse(s).sv || 0) : 0; } catch (e) { return 0; } };
  const mine = () => { try { return +(save && save.sv || 0); } catch (e) { return 0; } };
  const stale = () => svIn() > mine();
  const body = () => { try { const sv = save.sv, dev = save.dev; save.sv = 0; save.dev = ''; const j = JSON.stringify(save); save.sv = sv; save.dev = dev; return j; } catch (e) { return null; } };
  function card() {
    if (document.getElementById('tabsCard')) return; const d = document.createElement('div'); d.id = 'tabsCard'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="tc-in"><b>TOPS is open in another tab</b><p>Only one tab can play at a time, so your progress stays safe. Keep playing there, or play here instead.</p><button type="button">Play here</button><small>Play here loads your latest save.</small></div>';
    d.querySelector('button').onclick = () => { try { localStorage.setItem(OWN, JSON.stringify({ tab: 'reload', at: Date.now() })); } catch (e) {} location.reload(); };
    const stop = e => { if (!e.target.closest || !e.target.closest('button')) { e.stopPropagation(); } };
    ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(t => d.addEventListener(t, stop, true));
    (document.body || document.documentElement).appendChild(d); try { d.querySelector('button').focus(); } catch (e) {}
  }
  function stepAside(why) { if (away) return; away = true; try { clearTimeout(NET.pushT); } catch (e) {} try { if (typeof S !== 'undefined' && S && !S.done) S.paused = true; } catch (e) {}
    try { trackEv && trackEv('tabs_away', { why }); } catch (e) {} card(); }
  // 1 ownership
  let bc = null; try { bc = new BroadcastChannel('tops-tabs-' + KEY); bc.onmessage = m => { const d = m && m.data; if (d && d.t === 'claim' && d.tab !== TAB) stepAside('claim'); }; } catch (e) {}
  const claim = () => { try { bc && bc.postMessage({ t: 'claim', tab: TAB }); } catch (e) {} try { localStorage.setItem(OWN, JSON.stringify({ tab: TAB, at: Date.now() })); } catch (e) {} };
  window.addEventListener('storage', e => { try { if (e.key === OWN && e.newValue) { const o = JSON.parse(e.newValue); if (o && o.tab !== TAB) stepAside('claim'); }
    else if (e.key === KEY && e.newValue && !away && stale()) stepAside('newer'); } catch (x) {} });
  claim();
  // 2 + 4 the write guard and "only when something changed"
  const _p = persist;
  persist = function () {
    if (away) return;
    const j = body(); if (j !== null && j === lastBody) { try { hubBankUpdate(); } catch (e) {} return; }   // nothing changed: no write, no counter bump
    if (stale()) { stepAside('newer'); return; }
    const r = _p.apply(this, arguments); lastBody = j; return r; };
  // 3 the cloud
  if (typeof cloudPush === 'function') { const _c = cloudPush; cloudPush = function () { if (away || stale()) return; return _c.apply(this, arguments); }; }
  lastBody = body();   // what this tab loaded counts as written
  window.TOPS_TABS = { tab: TAB, away: () => away, canWrite: () => !away && !stale(), stepAside, claim };
})();
</script>
<style>
#tabsCard{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(9,10,12,.94);color:#f3f4f2;font-family:Manrope,system-ui,sans-serif}
#tabsCard .tc-in{max-width:340px;text-align:center;display:flex;flex-direction:column;gap:14px;align-items:center}
#tabsCard b{font:800 26px/1.1 "Saira Condensed","Arial Narrow",Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase}
#tabsCard p{margin:0;font-size:15px;line-height:1.45;color:#c9ccd0}
#tabsCard button{min-height:48px;padding:0 28px;border:0;border-radius:12px;background:#c6f36b;color:#111;font:800 16px/1 Manrope,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
#tabsCard small{font-size:12px;color:#8d9096}
</style>
