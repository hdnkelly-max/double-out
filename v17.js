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
  // 3 the cloud. The server keeps the higher save counter, but a counter alone can be beaten: a device (or a stale tab) that saves on
  // without seeing another device's newer cloud save climbs past it and overwrites it. So: a stepped-aside or stale tab never pushes, and
  // before each push this device checks the cloud: if another device saved since the last time this one synced, it loads that save
  // instead of overwriting it (the same "never over a newer save" rule as storage). synced = the cloud counter this device last pushed or loaded.
  let synced = null;
  if (typeof cloudPush === 'function' && window.TOPS_SAVEV && TOPS_SAVEV.adopt) {
    const SV = TOPS_SAVEV, _adopt = SV.adopt; SV.adopt = function (c, why) { const r = _adopt.apply(this, arguments); try { if (c) synced = +(c.sv || 0); lastBody = body(); } catch (e) {} return r; };
    const _pull = SV.pull; SV.pull = async function () { if (away) return; return _pull.apply(this, arguments); };
    cloudPush = function (now) {
      if (typeof NET === 'undefined' || !NET.user || !NET.sb || away || stale()) return; clearTimeout(NET.pushT);
      const go = async () => { if (away || stale()) return; try {
        if (synced != null) { let c = null; try { const r = await NET.sb.from(TOPS_SAVE_NS.table).select('data').eq('user_id', NET.user.id).maybeSingle(); c = r && r.data && r.data.data; } catch (e) {}
          if (c && c.dev !== SV.dev() && +(c.sv || 0) > synced) { try { trackEv && trackEv('save_conflict', { cloud: c.sv || 0, synced, mine: save.sv || 0 }); } catch (e) {} SV.adopt(c, 'push'); return; } }
        const { data, error } = await NET.sb.rpc(TOPS_SAVE_NS.rpc, { p_data: save }); if (error) throw error;
        if (data && data.ok) { NET.cloudAt = Date.now(); synced = +(save.sv || 0); return; }
        if (data && data.err === 'older' && data.data) { console.warn('TOPS cloud save is newer (sv ' + data.sv + ' vs ' + (save.sv || 0) + '), loading it'); SV.adopt(data.data, 'push'); }
      } catch (e) { console.warn('cloud push', e); } };
      if (now) go(); else NET.pushT = setTimeout(go, 2500); };
  } else if (typeof cloudPush === 'function') { const _c = cloudPush; cloudPush = function () { if (away || stale()) return; return _c.apply(this, arguments); }; }
  lastBody = body();   // what this tab loaded counts as written
  window.TOPS_TABS = { tab: TAB, away: () => away, canWrite: () => !away && !stale(), stepAside, claim, synced: () => synced };
})();
</script>
<style>
#tabsCard{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(9,10,12,.97);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:#f3f4f2;font-family:Manrope,system-ui,sans-serif}
#tabsCard .tc-in{max-width:340px;text-align:center;display:flex;flex-direction:column;gap:14px;align-items:center}
#tabsCard b{font:800 26px/1.1 "Saira Condensed","Arial Narrow",Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase}
#tabsCard p{margin:0;font-size:15px;line-height:1.45;color:#c9ccd0}
#tabsCard button{min-height:48px;padding:0 28px;border:0;border-radius:12px;background:#c6f36b;color:#111;font:800 16px/1 Manrope,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
#tabsCard button:focus,#tabsCard button:focus-visible{outline:3px solid #f3f4f2;outline-offset:3px}
#tabsCard small{font-size:12px;color:#8d9096}
</style>
