// ===== TOPS collectibles: core =====
// Store (save.tc, synced with the cloud save), awards, pack flow, collection, loadout,
// wearables, walk-on, trophy cabinet, exhibitions, in the zone. Spec: claude/tops-collectibles-plan.md
(function () {
  'use strict';
  const D = window.TC_DATA, FX = window.TC_FX, TCC = window.TopsCards;
  const CARD = Object.fromEntries(D.CARDS.map(c => [c.id, c]));
  // a card the server knows but this build doesn't (catalogue ahead of the app): never crash the reveal
  const cardOf = id => CARD[id] || { id, no: 0, name: 'New card', set: '', setName: 'Refresh to see it', rarity: 'common', cosmetic: null, exclusive: false, art: 'assets/cards/back.webp' };
  const $id = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const H = { sess: [], inPack: false, bypass: false };
  window.TC = H;

  // ---------- store ----------
  function st() {
    if (typeof save === 'undefined' || !save) return null;
    const t = save.tc || (save.tc = {});
    t.v = 1; t.picks = t.picks || []; t.own = t.own || {}; t.paid = t.paid || {}; t.unl = t.unl || {};
    t.stats = t.stats || {}; t.tiers = t.tiers || {}; t.troph = t.troph || []; t.exh = t.exh || {}; t.since = t.since || 0; t.seq = t.seq || 0; t.sets = t.sets || {};
    return t;
  }
  function keep() { try { persist(); } catch (e) {} }
  const ownedN = id => (st().own[id] || 0);
  const unlocked = cos => !!st().unl[cos];

  // ---------- rolls (local mode; server mode uses tc_award / tc_choose, see collectibles/sql) ----------
  function legChance(since) {
    const P = D.PITY, base = D.ODDS.legendary;
    if (since + 1 >= P.hard) return 1;
    if (since + 1 < P.start) return base;
    const k = (since + 1 - P.start) / (P.hard - P.start); return base + (P.top - base) * k * k;
  }
  function rollOne(pL) {
    let r = Math.random(), rar;
    if (r < pL) rar = 'legendary';
    else { r = (r - pL) / (1 - pL) * (1 - D.ODDS.legendary); let a = 0; for (const k of ['common', 'uncommon', 'rare', 'epic']) { a += D.ODDS[k]; if (r < a) { rar = k; break; } } rar = rar || 'epic'; }
    const pool = D.CARDS.filter(c => c.rarity === rar && !c.exclusive); return pool[(Math.random() * pool.length) | 0].id;
  }

  // ---------- awards ----------
  // kind: max | ton | ach | tier | nine | exh. key must be unique per real event.
  function award(key, kind, reason) {
    const t = st(); if (!t || t.paid[key]) return false;
    t.paid[key] = Date.now();
    if (t.srv) { (t.q = t.q || []).push({ a: key, k: kind, r: reason }); keep(); srvSync(); return true; }
    let pL = legChance(t.since); if (kind === 'nine') pL = Math.max(pL, .05);
    const opts = [rollOne(pL), rollOne(pL), rollOne(pL)];
    const p = { id: 'k' + (++t.seq) + '_' + Date.now().toString(36), reason, opts, keepAll: kind === 'nine', at: Date.now() };
    t.picks.push(p); H.sess.push(p.id);
    if (kind === 'nine') grant('ninex', 'nine');
    keep(); badge(); return true;
  }
  function grant(id, origin) {
    const t = st(); t.own[id] = (t.own[id] || 0) + 1;
    const c = CARD[id]; let newCos = null;
    if (c && c.cosmetic && !t.unl[c.cosmetic]) { t.unl[c.cosmetic] = { at: Date.now(), src: 'card:' + id }; newCos = c.cosmetic; }
    checkSets(); keep(); return newCos;
  }
  function unlockCos(cos, src) { const t = st(); if (!t.unl[cos]) { t.unl[cos] = { at: Date.now(), src }; keep(); return true; } return false; }
  function checkSets() {
    const t = st();
    D.SETS.forEach(s => {
      if (!s.reward || t.sets[s.id]) return;
      const need = D.CARDS.filter(c => c.set === s.id && !c.exclusive);
      if (need.length && need.every(c => t.own[c.id])) { t.sets[s.id] = Date.now(); unlockCos(s.reward, 'set:' + s.id); toast('Set complete', s.name, 'Unlocked: ' + D.COS[s.reward].n, 'legendary'); }
    });
  }
  // resolve a pick (same shape as the server RPC tc_choose)
  function choose(pickId, pos) {
    return new Promise(res => {
      const t = st(), p = t.picks.find(x => x.id === pickId);
      if (!p) return res(null);
      if (p.sid) return res(srvChoose(t, p, pos));
      if (p.chosen == null) {
        p.chosen = pos; p.done = Date.now();
        const kept = p.keepAll ? p.opts : [p.opts[pos]];
        let gotLeg = false; kept.forEach(id => { grant(id, 'pick'); if (CARD[id] && CARD[id].rarity === 'legendary') gotLeg = true; });
        t.since = gotLeg ? 0 : t.since + 1;
        t.picks = t.picks.filter(x => x.chosen == null || x === p); // drop resolved history except this one
        keep();
      }
      const owned = {}; p.opts.forEach(id => owned[id] = ownedN(id));
      setTimeout(() => res({ options: p.opts.map(cardOf), chosen: p.chosen, owned, keepAll: p.keepAll }), 60);
    });
  }
  // ---------- server mode: signed-in players use the tc_ RPCs (collectibles/sql), save.tc mirrors them ----------
  // Linking is one-way: the first sync imports the save-file collection (tc_import, once per account), after
  // which awards and exhibition grants queue in save.tc.q and flush whenever the player is online.
  const SRV = { busy: null, again: false, seeded: false }; H.srv = SRV;
  const KIND = { max: '180', ton: 'ton_checkout', ach: 'achievement', tier: 'achievement', nine: 'nine_darter' };
  const sbOk = () => !!(window.NET && NET.sb && NET.user && NET.user.id);
  async function rpc(fn, args) { const { data, error } = await NET.sb.rpc(fn, args || {}); if (error) throw error; return data; }
  const netErr = e => /fetch|network|timeout|offline|Failed to/i.test(String((e && (e.message || e)) || ''));
  function mirror(s) {
    const t = st(), known = new Set(t.picks.map(p => p.sid).filter(Boolean));
    t.own = Object.assign({}, s.own || {});
    Object.entries(s.unl || {}).forEach(([c, src]) => { if (!t.unl[c]) t.unl[c] = { at: Date.now(), src }; });
    t.since = s.since || 0;
    t.picks = (s.picks || []).map(p => t.picks.find(x => x.sid === p.id) || { id: 's' + p.id, sid: p.id, reason: p.reason, keepAll: !!p.keepAll, at: Date.now() });
    if (SRV.seeded) t.picks.forEach(p => { if (!known.has(p.sid) && !H.sess.includes(p.id)) H.sess.push(p.id); });
    SRV.seeded = true;
    checkSets(); keep(); badge();
    try { if ($id('tcCareer') || $id('tcPlay')) hubTiles(); } catch (e) {}
  }
  async function srvRun() {
    const t = st(); if (!t || !sbOk()) return;
    if (t.srv && t.srv !== NET.user.id) { t.srv = null; t.q = []; SRV.seeded = false; }   // a different account took over this save
    let s = await rpc('tc_state');
    if (!s.imported) {
      const loc = t.picks.filter(p => !p.sid && p.chosen == null && p.opts).map(p => ({ reason: p.reason, opts: p.opts, keepAll: !!p.keepAll }));
      s = await rpc('tc_import', { p: { own: t.own, unl: Object.keys(t.unl), paid: Object.keys(t.paid), picks: loc, since: t.since } });
    }
    t.srv = NET.user.id; t.q = t.q || []; keep();
    while (t.q.length) {
      const j = t.q[0];
      try {
        if (j.g) await rpc('tc_grant', { p_source_key: j.g, p_card: j.c, p_cosmetic: j.cos || null });
        else await rpc('tc_award', { p_source_key: j.a, p_kind: KIND[j.k] || 'achievement', p_reason: j.r });
      } catch (e) { if (netErr(e)) throw e; console.warn('tc srv dropped', j, e); }
      t.q.shift(); keep();
    }
    mirror(await rpc('tc_state'));
  }
  function srvSync() {
    if (SRV.busy) { SRV.again = true; return SRV.busy; }
    SRV.busy = srvRun().catch(e => console.warn('tc srv', e)).finally(() => { SRV.busy = null; if (SRV.again) { SRV.again = false; srvSync(); } });
    return SRV.busy;
  }
  H.sync = srvSync; H.ready = () => SRV.busy || Promise.resolve();
  async function srvChoose(t, p, pos) {
    if (!sbOk()) throw new Error('offline');
    const r = await rpc('tc_choose', { p_pick: p.sid, p_pos: pos });
    const ids = (r.options || []).slice().sort((a, b) => a.pos - b.pos).map(o => o.id);
    const kept = p.keepAll ? ids : [ids[r.chosen]];
    Object.assign(t.own, r.owned || {});
    let leg = false;
    kept.forEach(id => { const c = CARD[id]; if (!c) return; if (c.rarity === 'legendary') leg = true; if (c.cosmetic && !t.unl[c.cosmetic]) t.unl[c.cosmetic] = { at: Date.now(), src: 'card:' + id }; });
    t.since = leg ? 0 : t.since + 1; p.chosen = r.chosen;
    t.picks = t.picks.filter(x => x !== p); checkSets(); keep();
    return { options: ids.map(cardOf), chosen: r.chosen, owned: r.owned || {}, keepAll: p.keepAll };
  }
  // link as soon as the player is signed in, then keep the queue drained
  setInterval(() => { try { const t = st(); if (t && sbOk() && (!SRV.seeded || (t.q && t.q.length))) srvSync(); } catch (e) {} }, 4000);
  window.addEventListener('online', () => { try { srvSync(); } catch (e) {} });

  const openPicks = () => (st() ? st().picks.filter(p => p.chosen == null) : []);

  // ---------- tiered achievements ----------
  function bump(stat, n) {
    const t = st(); t.stats[stat] = (t.stats[stat] || 0) + (n || 1);
    D.TIERS.filter(x => x.stat === stat).forEach(T => {
      const have = t.tiers[T.id] || 0;
      for (let lv = have; lv < 3; lv++) {
        if (t.stats[stat] >= T.lv[lv]) {
          t.tiers[T.id] = lv + 1; const tn = D.TIER_NAMES[lv];
          tierToast(T, lv); award('tier:' + T.id + ':' + lv, 'tier', `${T.n} · ${tn.toLowerCase()}`);
        } else break;
      }
    });
  }
  function tierToast(T, lv) {
    const mat = ['bronze', 'silver', 'gold'][lv];
    let host = $id('achToasts'); if (!host) { host = document.createElement('div'); host.id = 'achToasts'; host.className = 'ach-toasts'; document.body.appendChild(host); }
    const el = document.createElement('div'); el.className = 'ach-t tc-tier ' + ['t-R', 't-E', 't-L'][lv];
    el.innerHTML = `<i class="tc-medal tc-${mat}"><b>${['I', 'II', 'III'][lv]}</b></i><div><small>Achievement tier · ${D.TIER_NAMES[lv]}</small><b>${esc(T.n)}</b><span>${esc(T.d(T.lv[lv]))} · +1 card pick</span></div>`;
    host.appendChild(el); try { noiseBurst({ dur: .08, freq: 1600, q: 9, gain: .08 }); } catch (e) {}
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 2800);
  }
  function toast(kicker, title, line, rar) {
    let host = $id('achToasts'); if (!host) { host = document.createElement('div'); host.id = 'achToasts'; host.className = 'ach-toasts'; document.body.appendChild(host); }
    const mat = ({ legendary: 'gold', epic: 'gold', rare: 'silver' }[rar] || 'bronze'); const el = document.createElement('div'); el.className = 'ach-t tc-tier ' + ({ legendary: 't-L', epic: 't-E', rare: 'R' }[rar] || 't-R');
    el.innerHTML = `<i class="tc-medal tc-${mat}"><b>★</b></i><div><small>${esc(kicker)}</small><b>${esc(title)}</b><span>${esc(line)}</span></div>`;
    host.appendChild(el); setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 2800);
  }

  // toast queue: never more than two on screen
  (function () { const q = []; let busy = 0; const host = () => { let h = $id('achToasts'); if (!h) { h = document.createElement('div'); h.id = 'achToasts'; h.className = 'ach-toasts'; document.body.appendChild(h); } return h; };
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('ach-t') && !n.dataset.q) { if (host().querySelectorAll('.ach-t:not(.out)').length > 1) { n.dataset.q = 1; n.remove(); q.push(n); } } })))
      .observe(document.body, { childList: true, subtree: true });
    setInterval(() => { if (q.length && host().querySelectorAll('.ach-t:not(.out)').length < 1) { const n = q.shift(); n.classList.remove('out'); host().appendChild(n); setTimeout(() => { n.classList.add('out'); setTimeout(() => n.remove(), 400); }, 2800); } }, 500);
  })();
  function maxText(who) { const e = document.createElement('div'); e.className = 'tc-maxtxt'; e.innerHTML = `<b>180</b><small>${esc(String(who || '').split(' ')[0])} · maximum</small>`; document.body.appendChild(e); setTimeout(() => e.remove(), 1400); }
  // ---------- game hooks ----------
  const mkey = () => { if (!S._tcid) { S._tcid = Date.now().toString(36); S._tcv = 0; } return S._tcid; };
  function legIdx() { try { return S.p.reduce((a, p) => a + (p.legs || 0), 0); } catch (e) { return 0; } }
  const human = tc => S && !S.practice && !S.drill && tc === 0 && S.p[0] && !S.p[0].ai;

  if (typeof achVisit === 'function') {
    const _av = achVisit;
    window.achVisit = achVisit = function (tc, R, vs0) {
      const r = _av.apply(this, arguments);
      try {
        const me = S && S.p[tc]; if (!me || !R) return r;
        // celebrations: every client plays the thrower's equipped effect (own look or synced opponent look)
        const cel = (tc === 0 ? (save.look && save.look.cel) : (me.look && me.look.cel)) || {};
        if (!R.bust && R.tot === 180 && cel.max) { FX.run(cel.max, me.disp || me.name); maxText(me.disp || me.name); }
        if (R.won && vs0 >= 100 && cel.checkout) FX.run(cel.checkout, me.disp || me.name);
        if (!human(tc)) return r;
        const k = mkey(), v = ++S._tcv, base = `match:${k}:leg:${legIdx()}:visit:${v}`;
        if (!R.bust && R.tot === 180) { award(base + ':180', 'max', '180'); bump('max'); }
        if (!R.bust && R.tot === 26 && R.labels.length === 3) bump('s26');
        if (R.won) {
          if (vs0 >= 100) { award(base + ':ton', 'ton', `${vs0} checkout`); bump('ton'); }
          if (vs0 >= 140) bump('f140');
          if (R.labels[R.labels.length - 1] === 'BULL') bump('bullout');
          const ld = me.legDarts; if ((S.start || 501) >= 501 && !S.din) { if (ld <= 15) bump('leg15'); if (ld <= 9) award(base + ':nine', 'nine', 'Nine-darter'); }
        }
      } catch (e) { console.warn('tc visit', e); }
      return r;
    };
  }
  if (typeof achUnlock === 'function') {
    const _au = achUnlock;
    window.achUnlock = achUnlock = function (id) {
      const had = typeof achHas === 'function' && achHas(id);
      const r = _au.apply(this, arguments);
      try { if (!had && achHas(id)) { const a = ACH.find(x => x.id === id); award('ach:' + id, 'ach', a ? a.n : 'Achievement'); } } catch (e) {}
      return r;
    };
  }
  if (typeof feelAfterRelease === 'function') {
    const _fr = feelAfterRelease;
    window.feelAfterRelease = feelAfterRelease = function (perf) {
      const r = _fr.apply(this, arguments);
      try { if (S && !S.practice && !S.drill && S.cur === 0 && !S.p[0].ai) { if (perf) bump('perf'); zone(S.perfStreak || 0); } } catch (e) {}
      return r;
    };
  }
  if (typeof endMatch === 'function') {
    const _em = endMatch;
    window.endMatch = endMatch = function () {
      const s0 = S, c = career && career();
      const snap = c ? { seasons: (c.seasons || []).length, titles: c.titles || 0, tier: c.tier } : null;
      const r = _em.apply(this, arguments);
      try {
        zone(0);
        const w = s0.p.reduce((bi, p, i) => p.legs > s0.p[bi].legs ? i : bi, 0);
        const won = w === 0 || (s0.teams && w === 2);
        const wp = s0.p[w]; const cel = (w === 0 ? (save.look && save.look.cel) : (wp.look && wp.look.cel)) || {};
        if (cel.win) setTimeout(() => FX.run(cel.win, wp.disp || wp.name), 400);
        if (w === 0) try { V.tcCelebrate && V.tcCelebrate(); } catch (e) {}
        if (!s0.practice && !s0.drill && won) bump('wins');
        if (s0.tcExh) exhibitionResult(s0, won);
        H.lastMatch = { opp: s0.p[1] && (s0.p[1].disp || s0.p[1].name), me: s0.p[0].legs, op: s0.p[1] ? s0.p[1].legs : 0, avg: s0.p[0].darts ? +(s0.p[0].pts / s0.p[0].darts * 3).toFixed(1) : null, venue: s0.tier && s0.tier.venue, co: s0.p[0].hf || null };
        if (snap) setTimeout(() => trophyCheck(snap), 0);
      } catch (e) { console.warn('tc end', e); }
      return r;
    };
  }
  if (typeof beginMatch === 'function') {
    const _bm = beginMatch;
    window.beginMatch = beginMatch = function (opts) {
      walkAbort();   // #17: a walk-on left from the last match ends here
      const r = _bm.apply(this, arguments);
      try { H.sess = []; if (opts && opts.tcExh) S.tcExh = opts.tcExh; const d = oppWalk(opts); if (d) { const s0 = S; setTimeout(() => { try { if (S === s0 && S && !S.done) walkOnStart(opts); } catch (e) {} }, d); } else walkOnStart(opts);   /* #17: the delayed walk-on only starts if the same match is still running */ } catch (e) { console.warn('tc begin', e); }
      return r;
    };
  }

  // ---------- after the match: reward line + pack screen ----------
  const why = ids => {
    const ps = st().picks.filter(p => ids.includes(p.id)); const m = {};
    ps.forEach(p => m[p.reason] = (m[p.reason] || 0) + 1);
    return Object.entries(m).map(([k, n]) => n > 1 ? `${n}× ${k}` : k).join(', ');
  };
  new MutationObserver(() => {
    const card = document.querySelector('.c3rw-card'); if (!card || card.querySelector('.tc-rwline')) return;
    const n = H.sess.filter(id => openPicks().some(p => p.id === id)).length; if (!n) return;
    const act = card.querySelector('.c3rw-act'); if (!act) return;
    const el = document.createElement('div'); el.className = 'tc-rwline';
    el.innerHTML = `<i class="tc-rwcards"><b></b><b></b><b></b></i><div><b>${n} card pick${n > 1 ? 's' : ''}</b><span>${esc(why(H.sess))}</span></div><em>Open next</em>`;
    act.parentNode.insertBefore(el, act);
  }).observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('#btnResultNext'); if (!b || H.bypass || H.inPack) return;
    const mine = openPicks().filter(p => H.sess.includes(p.id)); if (!mine.length) return;
    e.stopImmediatePropagation(); e.preventDefault();
    openPack(openPicks(), () => { H.sess = []; H.bypass = true; try { b.click(); } finally { H.bypass = false; } });
  }, true);

  // #13 (David 21:13): one-time "What are cards?" before the first pick, and from the Cards screen any time
  function cardsIntro(then, skip) {
    const el = sheet('tc-intro', `<div class="tcpk__kicker">Cards</div><h2 class="tc-h">What are cards?</h2>
      <ol class="tc-introl">
        <li><b>Earn picks</b><span>Hit 180s, check out 100+, or complete achievements.</span></li>
        <li><b>Keep one of three</b><span>Three cards appear. Pick one to keep. Nine&#8209;darter? Keep all three.</span></li>
        <li><b>Unlock rewards</b><span>Many cards unlock kit and celebrations. Equip them in Player · Loadout.</span></li>
        <li><b>Find them</b><span>Your collection is in Career → Cards.</span></li>
      </ol>
      <button type="button" class="tcpk__btn tcpk__btn--go tc-introgo">${then ? 'Open my picks' : 'Got it'}</button>`);
    const x = el.querySelector('.tc-x'); el.querySelector('.tc-sh-in').appendChild(x);
    let gone = false; const close = fn => { if (gone) return; gone = true; el.classList.add('out'); setTimeout(() => el.remove(), 200); fn && fn(); };
    /* the button opens the picks; X or a tap outside means "not now": the picks stay waiting and the calling flow carries on */
    el.querySelector('.tc-introgo').onclick = () => close(then); x.onclick = () => close(skip); el.addEventListener('click', e => { if (e.target === el) close(skip); });
    return el;
  }
  function openPack(picks, after) {
    if (!picks.length) { after && after(); return; }
    if (!save.tcIntro) { save.tcIntro = Date.now(); keep(); cardsIntro(() => openPack(picks, after), () => { after && after(); }); return; }
    H.inPack = true; try { TCC.Sfx.ctx || TCC.Sfx.init('assets/cards/sfx/'); } catch (e) {}
    const done = got => {
      H.inPack = false; badge();
      (got || []).forEach(g => { const c = g.def; if (!g.dupe && c.cosmetic) { const cs = D.COS[c.cosmetic]; if (cs) toast('Reward unlocked', cs.n, 'Equip it in Player · Loadout', c.rarity); } });
      after && after();
    };
    TCC.openPack({ picks: picks.map(p => ({ id: p.id, reason: p.reason })), resolve: choose, backdrop: 'assets/ui/bg_pub.webp', onDone: done, onLater: () => done([]) });
  }
  window.tcOpenPicks = () => openPack(openPicks(), null);

  // ---------- hub: tiles on the Career tab, picks badge ----------
  function badge() { const n = openPicks().length; document.querySelectorAll('.tc-pickbadge').forEach(b => { b.hidden = !n; b.querySelector('b').textContent = n; }); }
  function hubTiles() {
    if (!st()) return;
    const t = st(), nOwn = Object.keys(t.own).filter(id => CARD[id] && !CARD[id].exclusive).length, nAll = D.CARDS.filter(c => !c.exclusive).length;
    const ex = activeExh(), L = ex && D.LEGENDS.find(l => l.id === ex.id), np = openPicks().length;
    // Play tab: exhibition poster + picks waiting, above Spare night
    const play = $id('c3play') || document.querySelector('#hub .htab.hx-main[data-t="play"]');
    if (play) {
      let row = $id('tcPlay'); if (!row) { row = document.createElement('div'); row.id = 'tcPlay'; row.className = 'tc-hub'; }
      const spare = [...play.children].find(e => /Spare night/i.test(e.textContent || '') && e !== row);
      if (spare) play.insertBefore(row, spare); else if (row.parentNode !== play) play.appendChild(row);
      row.innerHTML = `${L ? `<button type="button" class="tc-tile tc-exh" id="tcExhTile"><img src="assets/cards/exh_poster.webp" alt=""><span><small>Exhibition night · ${ex.tries} ${ex.tries === 1 ? 'chance' : 'chances'} left</small><b>${esc(L.name)}</b><em>is coming to ${esc(ex.venue)}</em></span></button>` : ''}
        ${np ? `<button type="button" class="tc-tile tc-picks" id="tcPicksTile"><i class="tc-fan"><img src="assets/cards/back.webp" alt=""><img src="assets/cards/back.webp" alt=""><img src="assets/cards/back.webp" alt=""></i><span><b>${np} card pick${np > 1 ? 's' : ''}</b><small>Ready to open</small></span><i class="tc-chev">›</i></button>` : ''}`;
      row.hidden = !L && !np;
      // incoming trade offers: a tile on the Play tab so mates see them without opening the binder
      if (t.srv && sbOk()) tradeCount().then(n => {
        let tt = $id('tcTradeTile');
        if (!n) { if (tt) tt.remove(); row.hidden = !L && !np; return; }
        if (!tt) { tt = document.createElement('button'); tt.type = 'button'; tt.id = 'tcTradeTile'; tt.className = 'tc-tile tc-trade-tile'; row.appendChild(tt); }
        tt.innerHTML = `<i class="tc-trade-ic">⇄</i><span><b>${n} trade offer${n > 1 ? 's' : ''}</b><small>A mate wants to swap legendaries</small></span><i class="tc-chev">›</i>`;
        tt.onclick = () => trades(); row.hidden = false;
      });
      if (L) $id('tcExhTile').onclick = () => poster(ex, L);
      if (np) $id('tcPicksTile').onclick = () => openPack(openPicks(), () => hubTiles());
    }
    // Career tab: trophy cabinet + collection
    const car = $id('c3season') || play;
    if (car) {
      let row = $id('tcCareer'); if (!row) { row = document.createElement('div'); row.id = 'tcCareer'; row.className = 'tc-hub'; }
      if (row.parentNode !== car) car.insertBefore(row, car.firstChild);
      row.innerHTML = `<button type="button" class="tc-tile tc-cab" id="tcCabTile"><img src="assets/cards/hub_cabinet.webp" alt=""><span><small>Trophy cabinet</small><b>${t.troph.length ? t.troph.length + (t.troph.length === 1 ? ' title' : ' titles') : 'Empty'}</b></span></button>
        <button type="button" class="tc-tile tc-col" id="tcColTile"><i class="tc-fan"><img src="assets/cards/back.webp" alt=""><img src="assets/cards/back.webp" alt=""><img src="assets/cards/back.webp" alt=""></i><span><small>Cards</small><b>${nOwn} / ${nAll}</b></span><em class="tc-pickbadge" hidden><b>0</b> picks</em></button>`;
      $id('tcCabTile').onclick = cabinet; $id('tcColTile').onclick = binder;
    }
    badge();
  }
  // ---------- welcome backfill: returning players get the picks their history would have earned ----------
  function backfill() {
    const t = st(); if (!t || t.bf) return false;
    if (!((save.matches || 0) > 0)) return false; // brand-new players: welcome after their first match, not over the lesson
    t.bf = Date.now(); H.sess = [];
    const cnt = () => openPicks().length + ((t.q && t.q.length) || 0), before = cnt();   // server mode queues instead of rolling
    const got = Object.keys(save.ach || {});
    got.forEach(id => { const a = (typeof ACH !== 'undefined' && ACH.find(x => x.id === id)); award('ach:' + id, 'ach', 'Welcome · ' + (a ? a.n : 'achievement')); });
    const c = career && career(); const wins = (c && c.wins) || 0;
    if (wins) bumpQuiet('wins', wins);
    let n = cnt() - before; let i = 0;
    while (n < 3) { award('welcome:' + i++, 'ach', 'Welcome to the cards'); n++; }
    keep(); H.sess = [];
    return { picks: n, ach: got.length, wins };
  }
  // tiers from past stats: award each reached tier once, quietly (no toast spam)
  function bumpQuiet(stat, n) {
    const t = st(); t.stats[stat] = Math.max(t.stats[stat] || 0, n);
    D.TIERS.filter(x => x.stat === stat).forEach(T => { const have = t.tiers[T.id] || 0; for (let lv = have; lv < 3; lv++) { if (t.stats[stat] >= T.lv[lv]) { t.tiers[T.id] = lv + 1; award('tier:' + T.id + ':' + lv, 'tier', `Welcome · ${T.n} ${D.TIER_NAMES[lv].toLowerCase()}`); } else break; } });
  }
  function welcome(info) {
    const peek = CARD.littler;
    const el = sheet('tc-welcome', `<div class="tc-wel"><div class="tc-wel-fan"><img src="assets/cards/back.webp" alt=""><img src="assets/cards/back.webp" alt=""><div class="tc-wel-peek"></div></div>
      <div class="tcpk__kicker">New in TOPS</div><h2 class="tc-h">Cards are here</h2>
      <div class="tc-wel-big"><b>${info.picks}</b><span>picks earned</span></div>
      ${info.ach ? `<p>From the ${info.ach} achievement${info.ach > 1 ? 's' : ''} you've already completed.</p>` : ''}
      <ul class="tc-wel-how"><li><b>Keep one of three.</b> Each pick deals three cards. You keep one.</li><li><b>Earn more.</b> 180s, 100+ checkouts and achievements.</li><li><b>Unlock rewards.</b> Many cards unlock kit and celebrations for Player · Loadout.</li><li><b>Find them</b> in Career → Cards.</li></ul>
      <button type="button" class="tcpk__btn tcpk__btn--go" id="tcWelGo">Open ${info.picks} picks</button><button type="button" class="tcpk__later" id="tcWelLater">Later</button></div>`);
    const pk = TCC.card(peek); pk.classList.add('is-flipped'); el.querySelector('.tc-wel-peek').appendChild(pk);
    save.tcIntro = save.tcIntro || Date.now(); keep(); // #13: the welcome carries the explainer, so no second sheet before the first pick
    el.querySelector('#tcWelGo').onclick = () => { el.remove(); H.ready().then(() => openPack(openPicks(), () => hubTiles())); };
    el.querySelector('#tcWelLater').onclick = () => { el.remove(); hubTiles(); };
  }
  // tab switches re-run the hub renderers; keep our rows in place
  if (typeof hubTab === 'function') { const _ht = hubTab; window.hubTab = hubTab = function () { const r = _ht.apply(this, arguments); try { hubTiles(); } catch (e) {} return r; }; }
  if (typeof showHub === 'function') {
    const _sh = showHub;
    window.showHub = showHub = function () { walkAbort(); const r = _sh.apply(this, arguments); try { trophyCheck(); exhibitionTick(); const bf = backfill(); hubTiles(); if (bf) setTimeout(() => welcome(bf), 700); } catch (e) { console.warn('tc hub', e); } return r; };
  }
  if (typeof showTitle === 'function') {   // #17: quitting to the title ends a walk-on too
    const _st = showTitle;
    window.showTitle = showTitle = function () { walkAbort(); return _st.apply(this, arguments); };
  }
  // Player tab: collection + loadout + tiers
  if (typeof showPlayer === 'function') {
    const _sp = showPlayer;
    window.showPlayer = showPlayer = function () {
      const r = _sp.apply(this, arguments);
      try {
        const host = $id('plPerks'); if (!host) return r;
        let sec = $id('tcPlayer'); if (!sec) { sec = document.createElement('section'); sec.id = 'tcPlayer'; sec.className = 'tc-psec'; host.parentNode.insertBefore(sec, host); }
        const t = st(), nOwn = Object.keys(t.own).filter(id => CARD[id] && !CARD[id].exclusive).length, nAll = D.CARDS.filter(c => !c.exclusive).length;
        const title = save.look && save.look.title && D.COS[save.look.title];
        sec.innerHTML = `<div class="c3x-sh"><b>Collection and loadout</b><span>${title ? 'Title: ' + esc(title.n) : 'Cards unlock wearables, celebrations and walk-ons'}</span></div>
          <div class="tc-prow"><button type="button" class="tc-pbtn" id="tcPCol"><b>${nOwn}/${nAll}</b><small>Cards</small></button><button type="button" class="tc-pbtn" id="tcPLoad"><b>${Object.keys(t.unl).length}</b><small>Rewards</small></button><button type="button" class="tc-pbtn" id="tcPTier"><b>${Object.values(t.tiers).reduce((a, b) => a + b, 0)}/${D.TIERS.length * 3}</b><small>Tiers</small></button>${openPicks().length ? `<button type="button" class="tc-pbtn go" id="tcPPick"><b>${openPicks().length}</b><small>Open picks</small></button>` : ''}</div>`;
        $id('tcPCol').onclick = binder; $id('tcPLoad').onclick = loadout; $id('tcPTier').onclick = tiersView;
        if ($id('tcPPick')) $id('tcPPick').onclick = () => openPack(openPicks(), () => showPlayer(true));
      } catch (e) { console.warn('tc player', e); }
      return r;
    };
  }

  // ---------- sheets (full-screen panels) ----------
  function sheet(cls, html) {
    const el = document.createElement('div'); el.className = 'tc-sheet ' + (cls || '');
    el.innerHTML = `<div class="tc-sh-in">${html}</div><button type="button" class="tc-x" aria-label="Close">✕</button>`;
    document.body.appendChild(el); el.querySelector('.tc-x').onclick = () => { el.classList.add('out'); setTimeout(() => el.remove(), 200); };
    return el;
  }

  // P6 (a11y): a Collection card is a real button for keyboard and screen-reader users (Tab to it, Enter or Space opens it)
  function kbCard(k, label) {
    k.tabIndex = 0; k.setAttribute('role', 'button'); k.setAttribute('aria-label', label);
    /* QA 05:10: open once per press. Enter opens on keydown; Space on keyup (as native buttons do); a held key never repeats */
    k.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); if (e.repeat || e.key === ' ') return; openKb(k);
    });
    k.addEventListener('keyup', e => { if (e.key === ' ') { e.preventDefault(); openKb(k); } });
  }
  function openKb(k) {
    if (document.querySelector('.tc-inspect')) return;
    const id = k.dataset.id; k.click();
    const view = [...document.querySelectorAll('.tc-inspect')].pop(); if (!view) return;
    /* keyboard users: focus moves into the card view, Tab stays inside it, Escape closes it.
       getClientRects, not offsetParent: the close button is position:fixed, so its offsetParent is null (QA 05:10) */
    const foc = () => [...view.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && x.getClientRects().length);
    const onKey = ev => {
      if (ev.key === 'Escape') { ev.preventDefault(); if (ev.repeat) return; const x = view.querySelector('.tc-x'); x ? x.click() : view.remove(); return; }
      /* the Enter that opened the view, held down, must not auto-repeat onto ✕ and close it (QA 05:10) */
      if (ev.repeat && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); return; }
      if (ev.key !== 'Tab') return; const f = foc(); if (!f.length) { ev.preventDefault(); return; }
      const i = f.indexOf(document.activeElement);
      if (ev.shiftKey && i <= 0) { ev.preventDefault(); f[f.length - 1].focus(); } else if (!ev.shiftKey && (i === -1 || i === f.length - 1)) { ev.preventDefault(); f[0].focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    const x0 = view.querySelector('.tc-x'); if (x0) x0.focus({ preventScroll: true });
    /* when the view closes, focus goes back to this card; if the binder redrew meanwhile, to the same card in the new grid */
    const mo = new MutationObserver(() => {
      if (view.isConnected) return; mo.disconnect(); document.removeEventListener('keydown', onKey, true);
      const back = k.isConnected ? k : [...document.querySelectorAll('.tc-grid .tc[role=button]')].find(c => c.dataset.id === id);
      if (back) back.focus({ preventScroll: true });
    });
    mo.observe(view.parentNode || document.body, { childList: true });
  }
  // Collection binder
  function binder() {
    const t = st(); let filt = 'all';
    const nO = D.CARDS.filter(c => !c.exclusive && t.own[c.id]).length, nA = D.CARDS.filter(c => !c.exclusive).length;
    const el = sheet('tc-binder', `<div class="tcpk__kicker">Cards · Collection</div><h2 class="tc-h">Your cards</h2><button type="button" class="tc-whatbtn" id="tcWhat"><i>?</i>How cards work</button><div class="tc-prog"><b>${nO} / ${nA}</b><span>Collected</span></div><i class="tc-progbar" style="--p:${nO / nA};display:block"></i>${t.srv ? `<button type="button" class="tc-tradebtn" id="tcTradeBtn"><i>⇄</i><span><b>Trades</b><small>Swap spare legendaries with your mates</small></span><em class="tc-tradebadge" hidden></em><i class="tc-chev">›</i></button>` : ''}<div class="tc-chips" id="tcChips"></div><div class="tc-grid" id="tcGrid"></div><div class="tc-sets" id="tcSets"></div>`);
    { const tb = el.querySelector('#tcTradeBtn'); if (tb) { tb.onclick = () => trades(); tradeCount().then(n => { const b = tb.querySelector('.tc-tradebadge'); if (n) { b.hidden = false; b.textContent = n + ' new'; } }); } }
    el.querySelector('#tcWhat').onclick = () => cardsIntro(null);
    const chips = el.querySelector('#tcChips'), grid = el.querySelector('#tcGrid');
    const sets = D.SETS.filter(s => D.CARDS.some(c => c.set === s.id));
    chips.innerHTML = [['all', 'All']].concat(sets.map(s => [s.id, s.name])).map(([id, n]) => `<button type="button" data-s="${id}" aria-pressed="${id === filt}">${esc(n)}</button>`).join('');
    const draw = () => {
      grid.innerHTML = '';
      D.CARDS.filter(c => filt === 'all' || c.set === filt).filter(c => !c.exclusive || t.own[c.id]).sort((a, b) => (!t.own[a.id]) - (!t.own[b.id]) || a.no - b.no).forEach(c => {
        const n = t.own[c.id] || 0; const k = TCC.card(c); k.classList.add('is-mini');
        if (n) { k.classList.add('is-flipped'); if (n > 1) { const tg = k.querySelector('.tc__tag'); tg.textContent = c.rarity === 'legendary' ? `×${n} · tradeable` : `×${n}`; tg.className = 'tc__tag is-dupe'; k.classList.add('show-tag'); } k.onclick = () => inspect(c); kbCard(k, `${c.name}, ${c.rarity} card${n > 1 ? `, ${n} owned` : ''}`); }
        else { k.classList.add('is-locked'); k.setAttribute('role', 'img'); k.setAttribute('aria-label', `Card ${c.no}, not collected`); k.insertAdjacentHTML('beforeend', `<span class="tc-lockno" aria-hidden="true">No. ${String(c.no).padStart(3, '0')}<em>Not collected</em></span>`); }
        grid.appendChild(k);
      });
      el.querySelector('#tcSets').innerHTML = `<div class="tcpk__kicker">Sets</div>` + sets.filter(s => !s.exclusive).map(s => {
        const cs = D.CARDS.filter(c => c.set === s.id && !c.exclusive), have = cs.filter(c => t.own[c.id]).length;
        return `<div class="tc-setrow${t.sets[s.id] ? ' done' : ''}"><b>${esc(s.name)}</b><span>${have}/${cs.length}</span><i style="--p:${have / cs.length}"></i><small>${s.reward ? (t.sets[s.id] ? 'Unlocked: ' : 'Complete for: ') + esc(D.COS[s.reward].n) : ''}</small></div>`;
      }).join('');
    };
    chips.querySelectorAll('button').forEach(b => b.onclick = () => { filt = b.dataset.s; chips.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
    draw();
  }
  // ---------- trades: spare legendaries only, between mates you have played online ----------
  async function mates() {
    const me = NET.user.id, m = {};
    try { const rows = (typeof mpFetch === 'function') ? await mpFetch() : []; (rows || []).forEach(r => (r.players || []).forEach(pl => { const id = String(pl.pid || '').replace(/^u:/, ''); if (/^[0-9a-f-]{36}$/.test(id) && id !== me && !m[id]) m[id] = pl.name || 'Mate'; })); } catch (e) {}
    return m;
  }
  const TC_ = { n: 0, at: 0, p: null };
  async function tradeCount(fresh) {
    if (!sbOk()) return 0;
    if (!fresh && Date.now() - TC_.at < 30000) return TC_.n;
    if (TC_.p) return TC_.p;
    TC_.p = rpc('tc_my_trades').then(l => { TC_.n = (l || []).filter(x => x.open && x.dir === 'in').length; TC_.at = Date.now(); return TC_.n; }).catch(() => TC_.n).finally(() => { TC_.p = null; });
    return TC_.p;
  }
  function miniCard(id, extra) {
    const c = CARD[id]; const w = document.createElement('button'); w.type = 'button'; w.className = 'tc-tcard' + (extra ? ' ' + extra : '');
    if (c) { const k = TCC.card(c); k.classList.add('is-flipped', 'is-mini'); w.appendChild(k); w.insertAdjacentHTML('beforeend', `<small>${esc(c.name)}</small>`); }
    return w;
  }
  async function trades() {
    const el = sheet('tc-trades', `<div class="tcpk__kicker">Collection</div><h2 class="tc-h">Trades</h2><p class="tc-dim">Spare legendary copies can be swapped with mates you've played online. You always keep one of each. Offers last 48 hours.</p><div id="tcTrBody"><p class="tc-dim">Loading…</p></div>`);
    const body = el.querySelector('#tcTrBody');
    if (!sbOk()) { body.innerHTML = '<p class="tc-dim">Sign in to trade.</p>'; return; }
    let names = {}, list = [], board = {}, sel = { mate: null, want: null, give: null }, err = '';
    const nm = id => names[id] || 'A mate';
    const load = async () => {
      try {
        names = await mates();
        [list, board] = await Promise.all([rpc('tc_my_trades'), rpc('tc_trade_board', { p_users: Object.keys(names) })]);
        err = '';
      } catch (e) { err = 'Could not reach the card server. Try again in a moment.'; }
      draw();
    };
    const act = async (fn, args, okMsg) => {
      try { const r = await rpc(fn, args); if (okMsg) toast('Trades', okMsg(r), '', 'legendary'); sel = { mate: null, want: null, give: null }; TC_.at = 0; await srvSync(); }
      catch (e) { toast('Trades', 'That didn\'t go through', String((e && e.message) || e).replace(/^.*?:\s*/, ''), 'common'); }
      await load();
    };
    const draw = () => {
      body.innerHTML = err ? `<p class="tc-dim">${esc(err)}</p>` : '';
      if (err) return;
      const me = NET.user.id, mine = board[me] || [];
      const open = list.filter(x => x.open), done = list.filter(x => !x.open).slice(0, 5);
      // offers
      const sec = (title, html) => `<div class="tcpk__kicker tc-trk">${title}</div>${html}`;
      let h = '';
      if (open.length) h += sec('Offers', open.map(x => `<div class="tc-offer" data-id="${x.id}"><div class="tc-off-h"><b>${x.dir === 'in' ? esc(nm(x.other)) + ' wants to swap' : 'You offered ' + esc(nm(x.other))}</b><small>${Math.max(1, Math.round((new Date(x.expires_at) - Date.now()) / 36e5))}h left</small></div><div class="tc-off-cards"><span class="tc-off-side" data-side="${x.dir === 'in' ? 'get' : 'give'}"><small>You give</small></span><i class="tc-off-arrow">→</i><span class="tc-off-side is-get" data-side="${x.dir === 'in' ? 'give' : 'get'}"><small>You get</small></span></div><div class="tc-off-act">${x.dir === 'in' ? '<button type="button" class="tcpk__btn tcpk__btn--go" data-a="accept">Accept</button><button type="button" class="tcpk__later" data-a="decline">Decline</button>' : '<button type="button" class="tcpk__later" data-a="cancel">Cancel offer</button>'}</div></div>`).join(''));
      // your spares
      h += sec('Your spares', mine.length ? `<div class="tc-trrow" id="tcMine"></div>` : `<p class="tc-dim">No spare legendaries yet. A second copy of any legendary shows up here.</p>`);
      // mates
      const ids = Object.keys(names);
      h += sec('Mates', ids.length ? ids.map(id => `<div class="tc-mate" data-u="${id}"><b>${esc(names[id])}</b>${(board[id] || []).length ? `<div class="tc-trrow"></div>` : '<small class="tc-dim">No spares to trade</small>'}</div>`).join('') : '<p class="tc-dim">Play a mate online and they show up here.</p>');
      if (done.length) h += sec('Recent', done.map(x => `<div class="tc-done"><span>${x.dir === 'in' ? esc(nm(x.other)) : 'You → ' + esc(nm(x.other))}</span><b>${esc(x.status)}</b></div>`).join(''));
      h += `<div class="tc-compose" id="tcCompose" hidden></div>`;
      body.innerHTML = h;
      // fill cards
      open.forEach(x => { const o = body.querySelector(`.tc-offer[data-id="${x.id}"]`); ['give', 'get'].forEach(side => { const box = o.querySelector(`[data-side="${side}"]`); (x[side] || []).forEach(id => box.appendChild(miniCard(id))); if (!(x[side] || []).length) box.insertAdjacentHTML('beforeend', '<em class="tc-dim">Nothing (a gift)</em>'); }); o.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { b.disabled = true; act('tc_trade_respond', { p_trade: x.id, p_action: b.dataset.a }, r => r === 'accepted' ? 'Swap done' : r === 'decline' ? 'Offer declined' : r === 'cancel' ? 'Offer cancelled' : 'Offer ' + r); }); });
      const mrow = body.querySelector('#tcMine');
      if (mrow) mine.forEach(it => { const b = miniCard(it.c, sel.give === it.i ? 'is-sel' : ''); b.onclick = () => { sel.give = sel.give === it.i ? null : it.i; draw(); }; mrow.appendChild(b); });
      ids.forEach(id => { const row = body.querySelector(`.tc-mate[data-u="${id}"] .tc-trrow`); if (!row) return; (board[id] || []).forEach(it => { const b = miniCard(it.c, sel.want === it.i ? 'is-sel' : ''); b.onclick = () => { if (sel.want === it.i) { sel.want = null; sel.mate = null; } else { sel.want = it.i; sel.mate = id; } draw(); }; row.appendChild(b); }); });
      // compose bar
      const cp = body.querySelector('#tcCompose'), gv = mine.find(x => x.i === sel.give), wn = sel.mate && (board[sel.mate] || []).find(x => x.i === sel.want);
      if (gv || wn) {
        cp.hidden = false;
        cp.innerHTML = `<div class="tc-cp-side"><i class="tc-cp-th" data-c="${gv ? gv.c : ''}"></i><span><small>You give</small><b>${gv ? esc(CARD[gv.c].name) : 'Pick a spare'}</b></span></div><i class="tc-cp-arrow">→</i><div class="tc-cp-side"><i class="tc-cp-th" data-c="${wn ? wn.c : ''}"></i><span><small>${wn ? 'From ' + esc(nm(sel.mate).split(' ')[0]) : 'You get'}</small><b>${wn ? esc(CARD[wn.c].name) : "Pick a mate's card"}</b></span></div><button type="button" class="tcpk__btn tcpk__btn--go" id="tcSend" ${gv && wn ? '' : 'disabled'}>Propose trade</button>`;
        cp.querySelectorAll('.tc-cp-th').forEach(th => { const c = CARD[th.dataset.c]; if (c) { const k = TCC.card(c); k.classList.add('is-flipped', 'is-mini'); th.appendChild(k); } });
        const sd = cp.querySelector('#tcSend'); if (gv && wn) sd.onclick = () => { sd.disabled = true; act('tc_trade_offer', { p_to: sel.mate, p_give: [gv.i], p_get: [wn.i] }, () => 'Offer sent to ' + nm(sel.mate)); };
      }
    };
    load();
  }
  function inspect(c) {
    const cs = c.cosmetic && D.COS[c.cosmetic];
    const el = sheet('tc-inspect', `<div class="tc-big"></div><div class="tc-info"><div class="tcpk__kicker">${esc(c.setName)}</div><h2 class="tc-h">${esc(c.name)}</h2><p>${c.rarity[0].toUpperCase() + c.rarity.slice(1)} · owned ×${ownedN(c.id)}</p>${cs ? `<div class="tc-rew"><small>Reward</small><b>${esc(cs.n)}</b>${unlocked(c.cosmetic) ? `<button type="button" class="tcpk__btn tcpk__btn--go" id="tcEq">${isEquipped(c.cosmetic) ? 'Equipped' : 'Equip'}</button>` : ''}${cs.kind === 'cel' ? '<button type="button" class="tcpk__btn" id="tcTry">Preview</button>' : ''}</div>` : '<p class="tc-dim">Collection card. Completes the set.</p>'}${c.rarity === 'legendary' && ownedN(c.id) > 1 ? '<p class="tc-dim">Spare legendary: swap it with a mate from Collection · Trades.</p>' : ''}</div>`);
    const k = TCC.card(c); k.classList.add('is-flipped'); k.dataset.inspect = '1'; el.querySelector('.tc-big').appendChild(k);
    if (c.rarity === 'legendary') setTimeout(() => k.classList.add('do-sweep'), 250);
    const eq = el.querySelector('#tcEq'); if (eq) eq.onclick = () => { equip(c.cosmetic); eq.textContent = 'Equipped'; };
    const tr = el.querySelector('#tcTry'); if (tr) tr.onclick = () => FX.run(c.cosmetic, save.name);
  }
  // Loadout
  function isEquipped(cos) { const s = D.COS[cos]; if (!s) return false; const L = save.look || {}; return s.kind === 'wear' ? (L.wear || {})[s.slot] === cos : s.kind === 'cel' ? (L.cel || {})[s.slot] === cos : s.kind === 'title' ? L.title === cos : (L.tkit || {})[s.slot] === cos; }
  function equip(cos, off) {
    const s = D.COS[cos]; if (!s) return; const L = save.look || (save.look = {});
    if (s.kind === 'wear') { L.wear = L.wear || {}; if (off) delete L.wear[s.slot]; else { L.wear[s.slot] = cos; if (s.slot === 'hat') L.cap = 0; } }
    else if (s.kind === 'cel') { L.cel = L.cel || {}; if (off) delete L.cel[s.slot]; else L.cel[s.slot] = cos; }
    else if (s.kind === 'title') { L.title = off ? null : cos; }
    else { L.tkit = (L.tkit && typeof L.tkit === 'object') ? L.tkit : {}; if (off) delete L.tkit[s.slot]; else L.tkit[s.slot] = cos; if (s.flight && !off) { save.flight = s.flight; save.flightCustom = true; } else if (s.flight && off && save.flight === s.flight) save.flightCustom = false; }
    keep(); try { V.setPlayerLook(save.look, save.flight, save.name, career() ? career().tier : 0); if (document.body.classList.contains('tc-preview')) V.preview(true); } catch (e) {}
  }
  // QA-B1: true when an equipped reward's flight colour is the current flight (covers saves from before the fix)
  window.TOPS_flightReward = () => { try { const tk = (save.look && save.look.tkit) || {}; return Object.values(tk).some(c => D.COS[c] && D.COS[c].flight && D.COS[c].flight === save.flight); } catch (e) { return false; } };
  function slotOf(slot) { const L = save.look || {}; return (L.wear || {})[slot] || (L.cel || {})[slot] || (L.tkit || {})[slot] || (slot === 'title' ? L.title : null); }
  // source card for a cosmetic (for thumbnails and "how to unlock")
  function srcOf(cos) {
    const c = D.CARDS.find(x => x.cosmetic === cos); if (c) return { card: c, how: `${c.name} card · ${c.rarity}` };
    const set = D.SETS.find(x => x.reward === cos); if (set) return { card: D.CARDS.find(x => x.set === set.id), how: `Complete ${set.name}` };
    const L = D.LEGENDS.find(x => x.cos === cos); if (L) return { card: CARD[L.card], how: `Beat ${L.name} at an exhibition` };
    return { card: null, how: 'Special reward' };
  }
  function loadout() {
    const t = st();
    document.body.classList.add('tc-preview'); try { V.idle(false); try { sceneBg('creator'); } catch (e) {} V.preview(true); V.setPlayerLook(save.look, save.flight, save.name, career() ? career().tier : 0); } catch (e) {}
    const el = sheet('tc-load', `<div class="tc-load-stage"><div class="tcpk__kicker">Loadout</div><b class="tc-load-name">${esc(save.name || 'You')}</b><span class="tc-load-title" id="tcLTitle"></span></div><div class="tc-load-list" id="tcSlots"></div>`);
    const x = el.querySelector('.tc-x'); const close0 = x.onclick; x.onclick = () => { document.body.classList.remove('tc-preview'); try { V.preview(false); try { sceneBg('hub'); } catch (e) {} V.idle(true); } catch (e) {} close0(); };
    const draw = () => {
      const tl = save.look && save.look.title && D.COS[save.look.title]; el.querySelector('#tcLTitle').textContent = tl ? tl.n : '';
      el.querySelector('#tcSlots').innerHTML = D.SLOTS.map(([slot, nm]) => {
        const cur = slotOf(slot), opts = Object.entries(D.COS).filter(([, c]) => c.slot === slot), have = opts.filter(([id]) => t.unl[id]).length;
        const sc = cur && srcOf(cur).card;
        return `<button type="button" class="tc-lrow" data-slot="${slot}"><i class="tc-lthumb">${sc ? `<img src="${sc.art}" alt="">` : ''}</i><span><small>${nm}</small><b class="${cur ? '' : 'tc-none'}">${cur ? esc(D.COS[cur].n) : 'Not equipped'}</b></span><em>${have}/${opts.length}</em><i class="tc-chev">›</i></button>`;
      }).join('');
      el.querySelectorAll('.tc-lrow').forEach(b => b.onclick = () => pickSlot(b.dataset.slot, draw));
    };
    draw();
  }
  function pickSlot(slot, after) {
    const t = st(), nm = (D.SLOTS.find(s => s[0] === slot) || [])[1], cur = slotOf(slot);
    const opts = Object.entries(D.COS).filter(([, c]) => c.slot === slot);
    const bs = document.createElement('div'); bs.className = 'tc-bsheet';
    bs.innerHTML = `<div class="tc-bs-in"><i class="tc-bs-grab"></i><div class="tc-bs-h"><b>${esc(nm)}</b><button type="button" class="tc-bs-x">Done</button></div>
      <button type="button" class="tc-opt${cur ? '' : ' on'}" data-id=""><i class="tc-othumb none"></i><span><b>None</b></span></button>
      ${opts.map(([id, c]) => { const s0 = srcOf(id), on = t.unl[id]; return `<button type="button" class="tc-opt${cur === id ? ' on' : ''}${on ? '' : ' locked'}" data-id="${id}" ${on ? '' : 'disabled'}><i class="tc-othumb">${s0.card ? `<img src="${s0.card.art}" alt="">` : ''}</i><span><b>${esc(c.n)}</b><small>${on ? (c.kind === 'cel' ? 'Tap to preview' : 'Unlocked') : 'Locked · ' + esc(s0.how)}</small></span>${on && cur === id ? '<em>Equipped</em>' : ''}</button>`; }).join('')}</div>`;
    document.body.appendChild(bs); requestAnimationFrame(() => bs.classList.add('in'));
    const shut = () => { bs.classList.remove('in'); setTimeout(() => bs.remove(), 220); after && after(); };
    bs.querySelector('.tc-bs-x').onclick = shut; bs.addEventListener('click', e => { if (e.target === bs) shut(); });
    bs.querySelectorAll('.tc-opt').forEach(b => b.onclick = () => {
      const c0 = slotOf(slot); if (c0) equip(c0, true); const id = b.dataset.id; if (id) { equip(id); if (D.COS[id].kind === 'cel') FX.run(id, save.name); }
      bs.querySelectorAll('.tc-opt').forEach(o => { o.classList.toggle('on', o === b); const em = o.querySelector('em'); if (em) em.remove(); });
      if (id) b.insertAdjacentHTML('beforeend', '<em>Equipped</em>');
    });
  }
  function tiersView() {
    const t = st(), mats = ['bronze', 'silver', 'gold'];
    sheet('tc-tiers', `<div class="tcpk__kicker">Achievements</div><h2 class="tc-h">Tiers</h2><p class="tc-dim">Bronze, silver and gold. Every tier earns a card pick.</p>` + D.TIERS.map(T => {
      const lv = t.tiers[T.id] || 0, n = t.stats[T.stat] || 0, nxt = T.lv[Math.min(2, lv)], done = lv >= 3;
      return `<div class="tc-trow${done ? ' done' : ''}"><div class="tc-meds">${[0, 1, 2].map(i => `<i class="tc-medal tc-${mats[i]}${i < lv ? '' : ' off'}${i === lv ? ' next' : ''}"><b>${['I', 'II', 'III'][i]}</b></i>`).join('')}</div><div><b>${esc(T.n)}</b><span>${done ? 'All three tiers · ' + n : `Next: ${D.TIER_NAMES[lv]} · ${esc(T.d(nxt))}`}</span><i class="tc-bar" style="--p:${done ? 1 : Math.min(1, n / nxt)}"></i><em>${done ? '' : `${n} / ${nxt}`}</em></div></div>`;
    }).join(''));
  }

  // ---------- wearables (called from faceKit inside the 3D viewer) ----------
  window.TOPS_WEAR = function (T, B, L, hd, headH, fig) {
    const W = L && L.wear; if (!W || !B.Head) return;
    const bx = hd ? { x0: hd.min[0], x1: hd.max[0], y0: hd.min[1], y1: hd.max[1], z0: hd.min[2], z1: hd.max[2] } : { x0: -.09, x1: .09, y0: -.02, y1: headH, z0: -.1, z1: .12 };
    const w = bx.x1 - bx.x0, h = bx.y1 - bx.y0, sc = w / .18, eyeY = bx.y0 + h * .47, front = bx.z1;
    const M = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .8 }, o || {}));
    const add = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } }); B.Head.add(o); };
    if (W.face === 'wear_eyepatch') {
      const g = new T.Group(), blk = M(0x0b0b0b, { roughness: .6 });
      const patch = new T.Mesh(new T.SphereGeometry(.024, 18, 10, 0, Math.PI * 2, 0, Math.PI * .32), blk); patch.rotation.x = Math.PI / 2; patch.position.set(.032, 0, -.012); patch.scale.set(.9, .78, .9); g.add(patch);
      g.position.set(0, eyeY, front - .022); g.scale.setScalar(sc); add(g);
      // strap: a band round the skull, rising from the patch over the far temple
      const cz = (bx.z0 + bx.z1) / 2, rx = w * .53, rz = (bx.z1 - bx.z0) * .52;
      const band = new T.Mesh(new T.TorusGeometry(1, .012, 6, 56), blk); band.rotation.x = Math.PI / 2; band.scale.set(rx, rz, 1);
      const tilt = new T.Group(); tilt.add(band); tilt.rotation.set(-.18, 0, .32); tilt.position.set(0, eyeY + h * .06, cz); add(tilt);
    }
    if (W.face === 'wear_aviators') {
      const g = new T.Group(), gold = M(0xC49A52, { metalness: .9, roughness: .25 }), lens = new T.MeshStandardMaterial({ color: 0x1a1208, metalness: .6, roughness: .08, transparent: true, opacity: .88 });
      [-1, 1].forEach(sx => { const l = new T.Mesh(new T.CircleGeometry(.021, 20), lens); l.scale.set(1, 1.12, 1); l.position.set(sx * .031, -.004, .002); g.add(l);
        const rim = new T.Mesh(new T.TorusGeometry(.021, .0016, 6, 24), gold); rim.scale.set(1, 1.12, 1); rim.position.copy(l.position); g.add(rim);
        const arm = new T.Mesh(new T.BoxGeometry(.0018, .0018, .1), gold); arm.position.set(sx * .054, .004, -.05); g.add(arm); });
      const br = new T.Mesh(new T.BoxGeometry(.024, .002, .002), gold); br.position.y = .012; g.add(br);
      g.position.set(0, eyeY, front - .026); g.scale.setScalar(sc); add(g);
    }
    if (W.mouth === 'wear_ciggie') {
      const g = new T.Group();
      const body = new T.Mesh(new T.CylinderGeometry(.0042, .0042, .055, 10), M(0xf3efe6, { roughness: .9 })); body.rotation.x = Math.PI / 2; g.add(body);
      const filt = new T.Mesh(new T.CylinderGeometry(.0044, .0044, .016, 10), M(0xc98a3d)); filt.rotation.x = body.rotation.x; filt.position.set(0, .003, -.02); g.add(filt);
      const tip = new T.Mesh(new T.CylinderGeometry(.0043, .0043, .004, 10), new T.MeshBasicMaterial({ color: 0xff6a1a })); tip.rotation.x = body.rotation.x; tip.position.set(0, -.007, .028); g.add(tip);
      g.rotation.set(.5, .55, 0); g.position.set(.018, bx.y0 + h * .15, front - .004); g.scale.setScalar(sc); add(g);
    }
    if (W.hat === 'wear_flatcap') {
      // hide hair that would poke through the crown (the model's own hair, and attached styles that sit high on the head)
      fig && fig.traverse(o => { if (o.isMesh && /Hair/i.test(o.name) && !/Eyelash|Brow/i.test(o.name)) o.visible = false; });
      B.Head.children.forEach(o => { if (!o.isMesh || !o.geometry) return; o.geometry.computeBoundingBox(); const top = o.geometry.boundingBox.max.y * o.scale.y + o.position.y, bot = o.geometry.boundingBox.min.y * o.scale.y + o.position.y; if (top > bx.y0 + h * .8 && bot > bx.y0 + h * .35) o.visible = false; });
      const cv = document.createElement('canvas'); cv.width = cv.height = 64; const cx = cv.getContext('2d'); cx.fillStyle = '#3d3329'; cx.fillRect(0, 0, 64, 64);
      for (let y = 0; y < 64; y += 4) for (let x = 0; x < 64; x += 8) { cx.fillStyle = (x / 8 + y / 4) % 2 ? 'rgba(160,140,110,.28)' : 'rgba(0,0,0,.25)'; cx.fillRect(x + ((y / 4) % 2 ? 4 : 0), y, 4, 2); }
      const tt = new T.CanvasTexture(cv); tt.wrapS = tt.wrapT = T.RepeatWrapping; tt.repeat.set(5, 3);
      const tw = new T.MeshStandardMaterial({ map: tt, color: 0xffffff, roughness: .98 });
      const g = new T.Group();
      const crown = new T.Mesh(new T.SphereGeometry(.1, 32, 14, 0, Math.PI * 2, 0, Math.PI * .5), tw); crown.scale.set(1.1, .6, 1.2); crown.position.z = .008; crown.rotation.x = .12; g.add(crown);
      const band = new T.Mesh(new T.CylinderGeometry(.11, .112, .03, 32, 1, true), tw); band.scale.set(1, 1, 1.1); band.position.y = -.01; g.add(band);
      const peak = new T.Mesh(new T.CylinderGeometry(.09, .09, .008, 28, 1, false, -Math.PI / 2, Math.PI), tw); peak.scale.set(1, 1, .62); peak.position.set(0, -.016, .1); peak.rotation.x = .16; g.add(peak);
      const btn = new T.Mesh(new T.SphereGeometry(.009, 10, 6), tw); btn.position.set(0, .058, .01); g.add(btn);
      g.position.set(0, bx.y1 - h * .33 + .006, (bx.z0 + bx.z1) / 2 + .006); g.rotation.x = -.06; g.scale.setScalar(sc); add(g);
    }
    if (W.hair === 'wear_mullet') {
      const col = (L.hairCol && new T.Color(L.hairCol)) || new T.Color(0x2b2119);
      const g = new T.Group(), hm = M(col.getHex(), { roughness: .7 });
      for (let i = 0; i < 11; i++) { const s = new T.Mesh(new T.SphereGeometry(.028, 10, 8), hm); const a = (i - 5) / 5; s.position.set(a * .058, -(i % 2) * .018 - Math.abs(a) * .012, -(i % 3) * .006); s.scale.set(1, 3.3 - Math.abs(a) * 1.1, .75); s.rotation.z = a * .25; g.add(s); }
      g.position.set(0, bx.y0 + h * .18, bx.z0 + .03); g.scale.setScalar(sc); add(g);
    }
    if (W.shoulder === 'wear_towel') {
      const par = B.Spine2 || B.Spine1 || B.Neck; if (!par) return;
      const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#efe9dc'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#9b3b32'; for (let i = 0; i < 64; i += 16) { x.fillRect(i, 0, 5, 64); x.fillRect(0, i, 64, 5); }
      const tex = new T.CanvasTexture(c); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(2, 4);
      const mat = new T.MeshStandardMaterial({ map: tex, roughness: 1, side: T.DoubleSide });
      // one strip bent over the shoulder: hangs down the front, curls over the top, hangs longer down the back
      const W0 = .11, F = .16, R = .092, Bk = .22, Ltot = F + Math.PI * R + Bk;
      const geo = new T.PlaneGeometry(W0, Ltot, 6, 40), pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i), sAlong = Ltot / 2 - pos.getY(i); let y, z;
        if (sAlong < F) { y = -(F - sAlong); z = R; }
        else if (sAlong < F + Math.PI * R) { const th = (sAlong - F) / R; y = Math.sin(th) * R; z = Math.cos(th) * R; }
        else { y = -(sAlong - F - Math.PI * R); z = -R; }
        const wob = Math.sin(sAlong * 38 + u * 20) * .003 + (y < 0 ? -y * .06 : 0);
        pos.setXYZ(i, u * (1 + (y < 0 ? -y * .8 : 0)), y, z + Math.sign(z || 1) * wob);
      }
      geo.computeVertexNormals();
      const g = new T.Group(), cloth = new T.Mesh(geo, mat); g.add(cloth);
      g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
      g.position.set(.115, .11, -.012); g.rotation.set(0, 0, -.3); g.scale.setScalar(1); par.add(g);
    }
  };

  // barrel finish from the loadout (own dart only)
  window.TOPS_BARREL = function (mat) {
    const k = save.look && save.look.tkit && save.look.tkit.barrel, c = k && D.COS[k];
    if (c && c.barrel != null) { mat.color.setHex(c.barrel); mat.metalness = c.barrel === 0x1a1d1f ? .5 : .95; mat.roughness = c.barrel === 0x1a1d1f ? .45 : .22; }
  };
  // ---------- walk-on: character walks to the oche, effect fires on arrival ----------
  // Hook in the viewer's frame loop calls TOPS_WALKFX each frame; we own the camera while walking.
  let WK = null; const WA = .5;   // walk arrives at half time
  function walkOnStart(opts) {
    if (!opts || opts.practice || opts.money) return;
    const stage = opts.online || (opts.mode === 'career' && (opts.tier | 0) >= 1) || opts.tcExh;
    const cel = (save.look && save.look.cel) || {};
    if (!stage && !cel.walkon) return;
    if (S && S.cur !== 0) return;                       // only when you throw first
    // not before every match: once a session, always for exhibitions and the Palace
    let seen = false; try { seen = sessionStorage.getItem('tcWalkSeen') === '1'; } catch (e) {}
    if (seen && !opts.tcExh && (opts.tier | 0) < 6) return;
    try { sessionStorage.setItem('tcWalkSeen', '1'); } catch (e) {}
    const L = save.look || {}, title = L.title && D.COS[L.title], song = (window.TOPS_walk && save.walkon && TOPS_walk.WALK.find(w => w.id === save.walkon)) || null;
    WK = { t0: performance.now() + 300, dur: 4800, fx: cel.walkon || null, fired: false, name: save.name || 'You' };
    window.TOPS_WALKFULL = true; document.body.classList.add('tc-walking');
    const ov = document.createElement('div'); ov.id = 'tcWalk';
    ov.innerHTML = `<div class="tc-wk-bars"></div><div class="tc-wk-ban"><small>Now walking on</small><b>${esc(WK.name)}</b>${title ? `<em>${esc(title.n)}</em>` : ''}${song && song.id !== 'off' ? `<span>♪ ${esc(song.n)}</span>` : ''}</div><div class="tc-wk-skip">Tap to skip</div>`;
    ov.onclick = () => { if (WK) WK.t0 = performance.now() - WK.dur; };
    document.body.appendChild(ov);
    WK.ov = ov;
  }
  // online: your mate's equipped walk-on plays on your screen too (banner + their effect), before yours
  function oppWalk(opts) {
    if (!opts || !opts.online || !S || !S.p || !S.p[1]) return 0;
    const P = S.p[1], L = P.look || {}, cel = L.cel || {};
    if (!cel.walkon) return 0;
    const title = L.title && D.COS[L.title], nm = P.disp || P.name || 'Your opponent';
    document.body.classList.add('tc-oppwalk');
    const ov = document.createElement('div'); ov.id = 'tcOppWalk';
    ov.innerHTML = `<div class="tc-wk-ban"><small>Now walking on</small><b>${esc(nm)}</b>${title ? `<em>${esc(title.n)}</em>` : ''}</div><div class="tc-wk-skip">Tap to skip</div>`;
    let done = false; const end = () => { if (done) return; done = true; ov.classList.add('out'); document.body.classList.remove('tc-oppwalk'); setTimeout(() => ov.remove(), 400); };
    ov.onclick = end; document.body.appendChild(ov);
    setTimeout(() => { try { FX.run(cel.walkon, nm); } catch (e) {} }, 350);
    setTimeout(end, 3200);
    return 3500;
  }
  /* #17: every exit that isn't a completed walk (quit, back to the hub or title, the next beginMatch) ends the walk-on the same way:
     figures it hid come back, the player figure goes back to how the walk found it, its clip stops, lights/overlay/body class clear. */
  function walkAbort() {
    const w = WK; if (!w) return; WK = null;
    try { if (w.hid) w.hid.forEach(o => { o.visible = true; }); } catch (e) {}
    try { if (w.act) w.act.stop(); } catch (e) {}
    try { if (w.me && w.vis0 !== undefined) w.me.visible = !!w.vis0; } catch (e) {}
    walkEnd();
  }
  function walkEnd() {
    walkLights(null);
    window.TOPS_WALKFULL = false; document.body.classList.remove('tc-walking');
    const ov = $id('tcWalk'); if (ov) { ov.classList.add('out'); setTimeout(() => ov.remove(), 400); }
  }
  // play a Mixamo clip on the player figure, retargeting track names to the bones it actually has
  function clipOn(v, me, name, once) {
    try {
      const r = v.playClip && v.playClip(me, name, { fade: .2, once }); if (!r) return null;
      let hip = null; me.traverse(o => { if (!hip && o.isBone && /Hips$/.test(o.name)) hip = o.name; });
      const want = hip ? hip.slice(0, -4) : '', have = (me.userData.ck || '') + '_';
      const inPlace = name === 'walk';
      if (!hip || (want === have && !inPlace)) { WK.act = r; return r; }
      const src = r._clip; r.stop();
      const T = v.T, key = name + '@' + want + (inPlace ? ':ip' : ''); me.userData.tcClips = me.userData.tcClips || {};
      const clip = me.userData.tcClips[key] || (me.userData.tcClips[key] = new T.AnimationClip(key, src.duration, src.tracks.filter(t => !(inPlace && /Hips\.position$/.test(t.name))).map(t => { const c = t.clone(); c.name = c.name.replace(have, want); return c; })));
      const a = me.userData.mixer.clipAction(clip); if (WK.act && WK.act !== a) WK.act.fadeOut(.2);
      a.reset(); a.setLoop(once ? T.LoopOnce : T.LoopRepeat); a.clampWhenFinished = !!once; a.fadeIn(.2).play(); WK.act = a; return a;
    } catch (e) { console.warn('tc clip', e); return null; }
  }
  // re-apply the walk pose after the game's own posing, right before the frame renders
  window.TOPS_WALKPOST = function () { if (WK && WK.act && WK.me && WK.me.userData.mixer) { WK.me.userData.mixer.update(0); WK.me.position.copy(WK.pos || WK.me.position); } if (WK && WK.fp) WK.fp.visible = false; if (WK && WK.hid) WK.hid.forEach(o => { o.visible = false; }); };
  window.TOPS_WALKFX = function (_now, v) {
    const now = performance.now();
    if (!WK || !v.me) return null;
    let k = (now - WK.t0) / WK.dur; if (window.TC_WALK_FREEZE != null) k = window.TC_WALK_FREEZE; if (k < 0) return { fov: 50 };
    const me = v.me, T3 = v.T.Vector3;
    if (!WK.home) {
      WK.vis0 = !!me.visible;   // #17/#18 (from Experience's exp-fix18 b500b3d): the figure's visibility before the walk-on shows it (hidden in a match)
      WK.rot = me.rotation.y;
      // the room is fixed: board at z≈0, oche line at OCHE_Z, the player faces -z. (The figure can be mid-rebuild at the origin
      // and the camera can still be the hub camera on the first frame, so neither is trusted for the end point.)
      const OZ = typeof OCHE_Z !== 'undefined' ? OCHE_Z : 2.37;
      const fwd = new T3(0, 0, -1), side = new T3(fwd.z, 0, -fwd.x), spot = new T3(0, me.position.y || 0, OZ + .08);
      const mp = me.position.clone(); WK.home = Math.hypot(mp.x - spot.x, mp.z - spot.z) < .8 ? mp : spot;
      if (Math.abs(WK.rot) > 3.5 || WK.home === spot) WK.rot = Math.PI;   // face the board
      WK.fwd = fwd; WK.side = side;
      WK.start = WK.home.clone().addScaledVector(fwd, -2.4).addScaledVector(side, 1.0);   // walk in from the room behind the oche
      WK.cam = WK.home.clone().addScaledVector(fwd, .15).addScaledVector(side, 1.3); WK.cam.y = 1.5;   // beside the oche, facing back at you
    }
    if (!WK.walking && k < WA) { const a = clipOn(v, me, 'walk', false); if (a) WK.walking = true; }
    me.visible = true; if (v.fpFig) { v.fpFig.visible = false; WK.fp = v.fpFig; }
    // clear the stage: other figures (opponent, crowd) near the walk path hide until the walk-on ends
    if (me.parent && (!WK.hidAt || now - WK.hidAt > 500)) {
      WK.hidAt = now; WK.hid = WK.hid || new Set(); let root = me; while (root.parent) root = root.parent; const wp = new T3();
      // find figures by their hip bone (skinned meshes report the rig root, not the body), then hide the whole figure
      const within = (o, anc) => { let q = o; while (q) { if (q === anc) return true; q = q.parent; } return false; };
      root.traverse(o => { if (!o.isBone || !/Hips$/.test(o.name) || within(o, me) || (v.fpFig && within(o, v.fpFig))) return;
        o.getWorldPosition(wp);
        const ax = WK.start.x, az = WK.start.z, dx = WK.home.x - ax, dz = WK.home.z - az, t = Math.max(0, Math.min(1, ((wp.x - ax) * dx + (wp.z - az) * dz) / (dx * dx + dz * dz || 1)));
        if (Math.hypot(wp.x - (ax + dx * t), wp.z - (az + dz * t)) > 1.6) return;
        // climb to the node that also holds the body mesh skinned to this hip bone, so the whole figure hides
        const skinnedTo = n => { let hit = false; n.traverse(m => { if (!hit && m.isSkinnedMesh && m.skeleton && m.skeleton.bones.indexOf(o) >= 0) hit = true; }); return hit; };
        let fig = o; while (fig.parent && fig.parent !== root && !skinnedTo(fig)) fig = fig.parent;
        if (fig !== root && fig.visible) { fig.visible = false; WK.hid.add(fig); }
        root.traverse(m => { if (m.isSkinnedMesh && m.skeleton && m.skeleton.bones.indexOf(o) >= 0 && m.visible) { m.visible = false; WK.hid.add(m); } }); });
    }
    if (WK.hid) WK.hid.forEach(o => { o.visible = false; }); if (WK.me !== me) { WK.walking = false; if (WK.arrived) WK.arrived = false; } WK.me = me;
    { const mx = me.userData && me.userData.mixer, dt = Math.min(.05, (now - (WK.last || now)) / 1000); WK.last = now; if (mx) mx.update(window.TC_WALK_FREEZE != null ? .12 : dt); }
    if (k >= 1) {
      me.position.copy(WK.home); me.rotation.y = WK.rot;
      try { if (WK.act) WK.act.fadeOut(.4); v.playClip && v.playClip(me, 'idle', { fade: .5 }); } catch (e) {}
      if (!WK.fired && WK.fx) FX.run(WK.fx, WK.name);
      if (WK.hid) WK.hid.forEach(o => { o.visible = true; });
      walkLights(null);
      me.visible = !!WK.vis0;   // #17/#18: hand the figure back as the walk-on found it. Left visible, a whole extra skinned figure rendered every frame for the rest of the match and stood where the opponent throws.
      WK = null; walkEnd(); return null;
    }
    // timeline (ChatGPT review 3): 0–1.4 s entrance, 1.4–2.4 s tracking close-up, cut to the oche, lightning ≈2.9 s, hero hold
    const e = Math.min(1, k / WA), ease = 1 - Math.pow(1 - e, 2.2);
    me.position.lerpVectors(WK.start, WK.home, ease); WK.pos = me.position.clone();
    const dir = new T3().subVectors(WK.home, WK.start), face = Math.atan2(dir.x, dir.z) + Math.PI;
    const atOche = Math.atan2(WK.fwd.x, WK.fwd.z) + Math.PI;   // square to the board for the hero shot; the game's own stance returns at the end
    me.rotation.y = k < WA ? face : face + (atOche - face) * Math.min(1, (k - WA) / .08);
    if (k >= WA && !WK.arrived) { WK.arrived = true; clipOn(v, me, WK.fx ? 'pump' : 'idle', !!WK.fx); }
    if (k >= .8 && !WK.hero) { WK.hero = true; clipOn(v, me, window.TC_HERO_CLIP || 'cheer', true); }   // hero pose for the final hold: arms up to the crowd (ChatGPT review 5)
    if (k >= .645 && !WK.fired && WK.fx) { WK.fired = true; WK.flash = now; window.TC_FX_ANCHOR = WK.anchor || null; try { FX.run(WK.fx, WK.name); } finally { window.TC_FX_ANCHOR = null; } }
    walkLights(v, me, now);
    const F = WK.fwd, Sd = WK.side, p0 = me.position, up = (v3, y) => { v3.y = y; return v3; };
    let cam, tgt, fov;
    if (k < .29) {          // low front 3/4, pushing in as you come through the crowd
      const q = k / .29;
      cam = up(p0.clone().addScaledVector(F, 1.9 - q * .5).addScaledVector(Sd, -1.5 + q * .3), 1.05); tgt = up(p0.clone(), 1.25); fov = 50 - q * 6;
    } else if (k < WA) {    // tracking close-up alongside: face and chest
      cam = up(p0.clone().addScaledVector(F, .55).addScaledVector(Sd, -1.15), 1.5); tgt = up(p0.clone().addScaledVector(F, .1), 1.4); fov = 41;
    } else {                // low rear 3/4 at the oche, board in frame, slow push
      // slow 10° orbit round the player and a 5% push until the hero hold (last .5 s)
      const q = Math.min(1, (k - WA) / (.9 - WA)), qe = q * q * (3 - 2 * q), ang = qe * .09;
      const off = new T3().addScaledVector(F, -2.5).addScaledVector(Sd, -.95), c = Math.cos(ang), sn = Math.sin(ang);
      cam = up(new T3(off.x * c - off.z * sn, 0, off.x * sn + off.z * c).multiplyScalar(1 - qe * .08).add(WK.home), 1.12 + qe * .06);
      tgt = up(WK.home.clone().addScaledVector(F, 1.5).addScaledVector(Sd, .15), 1.45); fov = 50 - qe * 2.5;   // board two-thirds across, player a third
      // where the board sits on screen, so the lightning strikes it (board at the origin, ~1.73 m up)
      { const fw = new T3().subVectors(tgt, cam).normalize(), rt = new T3().crossVectors(fw, new T3(0, 1, 0)).normalize(), uv = new T3().crossVectors(rt, fw), d = new T3(0, 1.73, 0).sub(cam), z = d.dot(fw), th = Math.tan(fov * Math.PI / 360), as = innerWidth / innerHeight;
        if (z > .1) WK.anchor = { x: .5 + d.dot(rt) / z / (th * as) / 2, y: .5 - d.dot(uv) / z / th / 2 }; }
    }
    // lightning shake: 2–3 px for a quarter second
    if (WK.flash && now - WK.flash < 260) { const a = (1 - (now - WK.flash) / 260) * .012; cam.x += (Math.random() - .5) * a; cam.y += (Math.random() - .5) * a; }
    const shot = k < .29 ? 0 : k < WA ? 1 : 2; if (WK.shot !== shot) { WK.shot = shot; if (WK.ov) WK.ov.dataset.shot = shot; }
    const blend = k < .94 ? 1 : 1 - (k - .94) / .06;
    v.pos.lerp(cam, blend); v.look.lerp(tgt, blend);
    return { fov: fov + (1 - blend) * 4 };
  };
  // walk-on lighting: a warm follow spot above the player and a cool rim light behind; the lightning flashes the rim
  function walkLights(v, me, now) {
    const L = walkLights.L;
    if (!v) { if (L) { L.forEach(l => { if (l.parent) l.parent.remove(l); if (l.target && l.target.parent) l.target.parent.remove(l.target); }); walkLights.L = null; } return; }
    let root = me; while (root.parent) root = root.parent; if (root === me) return;
    if (!L || L[0].parent !== root) {
      if (L) walkLights(null);
      const T = v.T, spot = new T.SpotLight(0xffd9a8, 9, 7, .42, .55, 1.4), rim = new T.PointLight(0x9cc8ff, 3, 4.5, 1.6), fill = new T.PointLight(0xffe7cc, 1.4, 3.2, 1.8);
      root.add(spot); root.add(spot.target); root.add(rim); root.add(fill); walkLights.L = [spot, rim, fill];
    }
    const [spot, rim, fill] = walkLights.L, p = me.position, F = WK.fwd, Sd = WK.side;
    spot.position.set(p.x + Sd.x * -.4, p.y + 3.6, p.z + Sd.z * -.4 + .3); spot.target.position.set(p.x, p.y + 1.1, p.z);
    rim.position.set(p.x - F.x * 1.1 + Sd.x * .6, p.y + 1.9, p.z - F.z * 1.1 + Sd.z * .6);
    fill.position.set(p.x + F.x * 1.2 + Sd.x * -1, p.y + 1.5, p.z + F.z * 1.2 + Sd.z * -1);
    const dtf = WK.flash ? now - WK.flash : 1e9, fl = Math.max(0, 1 - dtf / 110, 1 - Math.abs(dtf - 190) / 90) + (dtf < 600 ? .25 * (1 - dtf / 600) : 0);   // two strikes then a fading afterglow
    rim.intensity = 3 + fl * 40; rim.color.setHex(fl > .1 ? 0xe8f2ff : 0x9cc8ff); fill.intensity = 1.4 + fl * 10;
  }

  // ---------- trophy cabinet ----------
  function trophyCheck(snap) {
    const c = career && career(); if (!c || c.run) return; const t = st();
    const seen = t.seen || (t.seen = { seasons: (c.seasons || []).length, titles: c.titles || 0 });
    const ss = c.seasons || [];
    for (let i = seen.seasons; i < ss.length; i++) if (ss[i].pos === 1) addTrophy(ss[i].tier);
    if ((c.titles || 0) > seen.titles) addTrophy(6);
    t.seen = { seasons: ss.length, titles: c.titles || 0 }; keep();
  }
  function addTrophy(tier) {
    const t = st(), T = D.TROPHIES[Math.max(0, Math.min(6, tier))]; const m = H.lastMatch || {};
    const ex = t.troph.find(x => x.id === T.id);
    const rec = { at: Date.now(), opp: m.opp || '', score: m.me != null ? `${m.me}–${m.op}` : '', avg: m.avg, venue: m.venue || '', co: m.co };
    if (ex) { ex.wins.push(rec); } else t.troph.push({ id: T.id, tier, wins: [rec] });
    keep(); toast('Title won', T.n, 'A new trophy for the cabinet', 'legendary');
  }
  // shelf slots on hub_cabinet.webp (fractions of the image), measured from the art
  const SHELF = [ // bottom shelf: club night, club champs, regional; middle: DPNZ, Trans-Tasman, Pro Tour; top centre: the Palace
    { x: .232, y: .70, w: .145 }, { x: .372, y: .70, w: .145 }, { x: .512, y: .70, w: .145 },
    { x: .232, y: .495, w: .145 }, { x: .372, y: .495, w: .145 }, { x: .512, y: .495, w: .145 },
    { x: .372, y: .322, w: .2 }];
  const CASE = [{ x: .779, y: .316 }, { x: .896, y: .316 }, { x: .779, y: .419 }, { x: .896, y: .419 }, { x: .779, y: .529 }, { x: .896, y: .529 }];
  function cabinet() {
    const t = st();
    const el = sheet('tc-cab', `<div class="tc-cabwrap"><img class="tc-cabimg" src="assets/cards/hub_cabinet.webp" alt=""><div class="tc-cablayer"></div></div><div class="tc-cabinfo"><div class="tcpk__kicker">Trophy cabinet</div><h2 class="tc-h">${t.troph.length ? 'Your titles' : 'Empty for now'}</h2><p class="tc-dim">${t.troph.length ? `${t.troph.length} ${t.troph.length === 1 ? 'title' : 'titles'} won · ${t.troph.reduce((a, x) => a + x.wins.length, 0)} trophies lifted` : 'Win a league or a knockout and the trophy goes here. Your best cards sit in the case.'}</p><div class="tc-cabdet" id="tcCabDet"></div></div>`);
    const lay = el.querySelector('.tc-cablayer');
    D.TROPHIES.forEach((T, i) => {
      const got = t.troph.find(x => x.id === T.id); if (!got) return;
      const s = SHELF[i]; const b = document.createElement('button'); b.type = 'button'; b.className = 'tc-tro'; b.style.left = (s.x * 100) + '%'; b.style.top = (s.y * 100) + '%'; b.style.width = (s.w * 100) + '%';
      b.innerHTML = `<img src="assets/cards/${T.img}.webp" alt="${esc(T.n)}">${got.wins.length > 1 ? `<em>×${got.wins.length}</em>` : ''}`;
      b.onclick = () => { lay.querySelectorAll('.tc-tro').forEach(x => x.classList.toggle('sel', x === b)); const w = got.wins[got.wins.length - 1]; el.querySelector('#tcCabDet').innerHTML = `<b>${esc(T.n)}</b>${got.wins.map(w => `<div class="tc-plate"><span>${new Date(w.at).toLocaleDateString()}</span><span>${w.opp ? 'Final v ' + esc(w.opp) : ''} ${esc(w.score)}</span><span>${w.avg ? 'Avg ' + w.avg : ''}${w.co ? ' · High out ' + w.co : ''}</span></div>`).join('')}`; };
      lay.appendChild(b);
    });
    // display case: best six cards, legendary first
    const ord = ['legendary', 'epic', 'rare'];
    const best = Object.keys(t.own).map(id => CARD[id]).filter(c => c && ord.includes(c.rarity)).sort((a, b) => ord.indexOf(a.rarity) - ord.indexOf(b.rarity) || a.no - b.no).slice(0, 6);
    best.forEach((c, i) => { const s = CASE[i]; const k = TCC.card(c); k.classList.add('is-flipped', 'is-mini', 'tc-incase'); k.style.left = (s.x * 100) + '%'; k.style.top = (s.y * 100) + '%'; k.onclick = () => inspect(c); lay.appendChild(k); });
  }

  // ---------- exhibition nights ----------
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function activeExh() { const e = st() && st().exh.active; return e && e.tries > 0 && e.weeksLeft > 0 ? e : null; }
  function exhibitionTick() {
    const c = career && career(); if (!c || c.run || !c.season) return; const t = st(); const E = t.exh;
    const wk = `${c.tier}:${c.season.n || 0}:${c.season.week || 0}`;
    const force = /[?&]exh=1/.test(location.search) && !E.active;
    if (E.lastWk === wk && !force) return;
    const isNewWeek = E.lastWk && E.lastWk !== wk; E.lastWk = wk; E.weeks = (E.weeks || 0) + (isNewWeek ? 1 : 0);
    if (E.active && isNewWeek) { E.active.weeksLeft--; if (E.active.weeksLeft <= 0 || E.active.tries <= 0) { E.active = null; E.since = 0; } }
    if (E.active) { keep(); return; }
    E.since = (E.since || 0) + (isNewWeek ? 1 : 0);
    // rare: ~7% a week, never within 8 weeks of the last one, legends you have beaten come round less
    const roll = hash(wk + (save.name || ''));
    if (force || (E.since >= 8 && roll < .07)) {
      const pool = D.LEGENDS.filter(l => !(E.beaten || {})[l.id]); const L = (pool.length ? pool : D.LEGENDS)[Math.floor(hash(wk + 'L') * (pool.length || D.LEGENDS.length))];
      E.active = { id: L.id, tries: 3, weeksLeft: 3, venue: (TIERS[c.tier] || TIERS[0]).venue }; E.since = 0;
      setTimeout(() => poster(E.active, L, true), 600);
    }
    keep();
  }
  function poster(ex, L, isNew) {
    const el = sheet('tc-poster', `<div class="tc-post"><img src="assets/cards/exh_poster.webp" alt=""><div class="tc-post-t"><small>${isNew ? 'Just announced' : 'Exhibition night'}</small><b>${esc(L.name)}</b><em>"${esc(L.nick)}"</em><span>Live at ${esc(ex.venue)}</span></div><div class="tc-post-b"><span>${esc(L.blurb)}</span><span>Best of 3 legs · plays near a ${L.avg} average · ${ex.tries} ${ex.tries === 1 ? 'chance' : 'chances'} in the next ${ex.weeksLeft} weeks · uses your spare night</span></div></div>
      <div class="tc-stakes"><div><b>Best of 3</b><small>legs</small></div><div><b>${ex.tries} ${ex.tries === 1 ? 'try' : 'tries'}</b><small>in ${ex.weeksLeft} weeks</small></div><div class="tc-st-card"><i class="tc-st-mini" data-card="${L.card}"></i><span><b>${esc(L.nick)}</b><small>foil card</small></span></div></div>
      <div class="tc-post-act"><button type="button" class="tcpk__btn tcpk__btn--go" id="tcPGo">Accept invite</button><button type="button" class="tcpk__later" id="tcPLater">Not tonight</button></div>`);
    { const m = el.querySelector('.tc-st-mini'); if (m) { const k0 = TCC.card(CARD[m.dataset.card]); k0.classList.add('is-flipped', 'is-mini'); m.appendChild(k0); } }
    el.querySelector('#tcPLater').onclick = () => el.querySelector('.tc-x').click();
    el.querySelector('#tcPGo').onclick = () => {
      el.querySelector('.tc-x').click(); const c = career();
      try { beginMatch({ mode: 'career', tier: c.tier, p0: save.name || 'You', oppName: L.name, oppAvg: L.avg, legs: 3, purse: 0, local: true, tcExh: L.id }); } catch (e) { console.warn('exh start', e); }
    };
  }
  function exhibitionResult(s0, won) {
    const t = st(), E = t.exh, L = D.LEGENDS.find(l => l.id === s0.tcExh); if (!L) return;
    if (E.active && E.active.id === L.id) E.active.tries--;
    if (won) {
      E.beaten = E.beaten || {}; E.beaten[L.id] = Date.now(); E.active = null;
      grant(L.card, 'exhibition'); unlockCos(L.cos, 'exh:' + L.id);
      if (t.srv) { (t.q = t.q || []).push({ g: 'exh:' + L.id + ':win', c: L.card, cos: L.cos }); srvSync(); }
      const id = 'exh_' + L.id;
      if (!ACH.find(a => a.id === id)) ACH.push({ id, n: 'Beat ' + L.name, d: `Win an exhibition against ${L.name}`, t: 'L', ic: '🏆' });
      try { achUnlock(id); } catch (e) {}
      toast('Exhibition won', 'You beat ' + L.name, `${L.nick} foil card + title "${D.COS[L.cos].n}"`, 'legendary');
    } else {
      if (!t.own.ticket) { grant('ticket', 'exhibition'); if (t.srv) { (t.q = t.q || []).push({ g: 'exh:ticket', c: 'ticket' }); srvSync(); } toast('Exhibition', 'Lost to ' + L.name, 'You kept the ticket. Commemorative card added.', 'common'); }
      else toast('Exhibition', 'Lost to ' + L.name, E.active && E.active.tries > 0 ? `${E.active.tries} ${E.active.tries === 1 ? 'chance' : 'chances'} left` : 'The legend has left town', 'common');
    }
    keep();
  }
  // re-register exhibition achievements already earned so the grid shows them
  try { const t0 = typeof save !== 'undefined' && save && save.tc && save.tc.exh && save.tc.exh.beaten; if (t0) Object.keys(t0).forEach(id => { const L = D.LEGENDS.find(l => l.id === id); if (L && !ACH.find(a => a.id === 'exh_' + id)) ACH.push({ id: 'exh_' + id, n: 'Beat ' + L.name, d: `Win an exhibition against ${L.name}`, t: 'L', ic: '🏆' }); }); } catch (e) {}

  // ---------- in the zone (feel only, maths unchanged) ----------
  let zoneOn = false, zoneTimer = 0;
  function zone(streak) {
    const want = streak >= 3 && S && !S.done;
    if (want === zoneOn) return; zoneOn = want;
    document.body.classList.toggle('tc-zone', want);
    try { crowdSet(want ? .03 : (S && S.tier ? S.tier.crowd : .2)); } catch (e) {}
    clearInterval(zoneTimer);
    if (want) zoneTimer = setInterval(() => { try { if (!zoneOn) return; sfxHeart(); } catch (e) {} }, 820);
  }
  window.TC_API = { oppWalk, trades, openPack, exhResult: exhibitionResult, sync: () => srvSync(), maxText, award, choose, openPicks, grant, equip, binder, loadout, cabinet, tiersView, st, FX, zone, addTrophy, poster, D };
})();
