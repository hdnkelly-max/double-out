// ===== TOPS collectibles: core =====
// Store (save.tc, synced with the cloud save), awards, pack flow, collection, loadout,
// wearables, walk-on, trophy cabinet, exhibitions, in the zone. Spec: claude/tops-collectibles-plan.md
(function () {
  'use strict';
  const D = window.TC_DATA, FX = window.TC_FX, TCC = window.TopsCards;
  const CARD = Object.fromEntries(D.CARDS.map(c => [c.id, c]));
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
      if (p.chosen == null) {
        p.chosen = pos; p.done = Date.now();
        const kept = p.keepAll ? p.opts : [p.opts[pos]];
        let gotLeg = false; kept.forEach(id => { grant(id, 'pick'); if (CARD[id].rarity === 'legendary') gotLeg = true; });
        t.since = gotLeg ? 0 : t.since + 1;
        t.picks = t.picks.filter(x => x.chosen == null || x === p); // drop resolved history except this one
        keep();
      }
      const owned = {}; p.opts.forEach(id => owned[id] = ownedN(id));
      setTimeout(() => res({ options: p.opts.map(id => CARD[id]), chosen: p.chosen, owned, keepAll: p.keepAll }), 60);
    });
  }
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
      const r = _bm.apply(this, arguments);
      try { H.sess = []; if (opts && opts.tcExh) S.tcExh = opts.tcExh; walkOnStart(opts); } catch (e) { console.warn('tc begin', e); }
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

  function openPack(picks, after) {
    if (!picks.length) { after && after(); return; }
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
    const t = st(), nOwn = Object.keys(t.own).filter(id => !CARD[id].exclusive).length, nAll = D.CARDS.filter(c => !c.exclusive).length;
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
      if (L) $id('tcExhTile').onclick = () => poster(ex, L);
      if (np) $id('tcPicksTile').onclick = () => openPack(openPicks(), () => hubTiles());
    }
    // Career tab: trophy cabinet + collection
    const car = $id('c3season') || play;
    if (car) {
      let row = $id('tcCareer'); if (!row) { row = document.createElement('div'); row.id = 'tcCareer'; row.className = 'tc-hub'; }
      if (row.parentNode !== car) car.insertBefore(row, car.firstChild);
      row.innerHTML = `<button type="button" class="tc-tile tc-cab" id="tcCabTile"><img src="assets/cards/hub_cabinet.webp" alt=""><span><small>Trophy cabinet</small><b>${t.troph.length ? t.troph.length + (t.troph.length === 1 ? ' title' : ' titles') : 'Empty'}</b></span></button>
        <button type="button" class="tc-tile tc-col" id="tcColTile"><i class="tc-fan"><img src="assets/cards/back.webp" alt=""><img src="assets/cards/back.webp" alt=""><img src="assets/cards/back.webp" alt=""></i><span><small>Collection</small><b>${nOwn} / ${nAll}</b></span><em class="tc-pickbadge" hidden><b>0</b> picks</em></button>`;
      $id('tcCabTile').onclick = cabinet; $id('tcColTile').onclick = binder;
    }
    badge();
  }
  // ---------- welcome backfill: returning players get the picks their history would have earned ----------
  function backfill() {
    const t = st(); if (!t || t.bf) return false;
    t.bf = Date.now(); const before = openPicks().length; H.sess = [];
    const got = Object.keys(save.ach || {});
    got.forEach(id => { const a = (typeof ACH !== 'undefined' && ACH.find(x => x.id === id)); award('ach:' + id, 'ach', 'Welcome · ' + (a ? a.n : 'achievement')); });
    const c = career && career(); const wins = (c && c.wins) || 0;
    if (wins) bumpQuiet('wins', wins);
    let n = openPicks().length - before; let i = 0;
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
      <p>${info.ach ? `From the ${info.ach} achievement${info.ach > 1 ? 's' : ''} you've already completed. ` : ''}From now on every 180, ton-plus checkout and achievement earns another.</p>
      <button type="button" class="tcpk__btn tcpk__btn--go" id="tcWelGo">Open ${info.picks} picks</button><button type="button" class="tcpk__later" id="tcWelLater">Later</button></div>`);
    const pk = TCC.card(peek); pk.classList.add('is-flipped'); el.querySelector('.tc-wel-peek').appendChild(pk);
    el.querySelector('#tcWelGo').onclick = () => { el.remove(); openPack(openPicks(), () => hubTiles()); };
    el.querySelector('#tcWelLater').onclick = () => { el.remove(); hubTiles(); };
  }
  // tab switches re-run the hub renderers; keep our rows in place
  if (typeof hubTab === 'function') { const _ht = hubTab; window.hubTab = hubTab = function () { const r = _ht.apply(this, arguments); try { hubTiles(); } catch (e) {} return r; }; }
  if (typeof showHub === 'function') {
    const _sh = showHub;
    window.showHub = showHub = function () { const r = _sh.apply(this, arguments); try { trophyCheck(); exhibitionTick(); const bf = backfill(); hubTiles(); if (bf) setTimeout(() => welcome(bf), 700); } catch (e) { console.warn('tc hub', e); } return r; };
  }
  // Player tab: collection + loadout + tiers
  if (typeof showPlayer === 'function') {
    const _sp = showPlayer;
    window.showPlayer = showPlayer = function () {
      const r = _sp.apply(this, arguments);
      try {
        const host = $id('plPerks'); if (!host) return r;
        let sec = $id('tcPlayer'); if (!sec) { sec = document.createElement('section'); sec.id = 'tcPlayer'; sec.className = 'tc-psec'; host.parentNode.insertBefore(sec, host); }
        const t = st(), nOwn = Object.keys(t.own).filter(id => !CARD[id].exclusive).length, nAll = D.CARDS.filter(c => !c.exclusive).length;
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

  // Collection binder
  function binder() {
    const t = st(); let filt = 'all';
    const nO = D.CARDS.filter(c => !c.exclusive && t.own[c.id]).length, nA = D.CARDS.filter(c => !c.exclusive).length;
    const el = sheet('tc-binder', `<div class="tcpk__kicker">Collection</div><h2 class="tc-h">Your cards</h2><div class="tc-prog"><b>${nO} / ${nA}</b><span>Collected</span></div><i class="tc-progbar" style="--p:${nO / nA};display:block"></i><div class="tc-chips" id="tcChips"></div><div class="tc-grid" id="tcGrid"></div><div class="tc-sets" id="tcSets"></div>`);
    const chips = el.querySelector('#tcChips'), grid = el.querySelector('#tcGrid');
    const sets = D.SETS.filter(s => D.CARDS.some(c => c.set === s.id));
    chips.innerHTML = [['all', 'All']].concat(sets.map(s => [s.id, s.name])).map(([id, n]) => `<button type="button" data-s="${id}" aria-pressed="${id === filt}">${esc(n)}</button>`).join('');
    const draw = () => {
      grid.innerHTML = '';
      D.CARDS.filter(c => filt === 'all' || c.set === filt).filter(c => !c.exclusive || t.own[c.id]).sort((a, b) => a.no - b.no).forEach(c => {
        const n = t.own[c.id] || 0; const k = TCC.card(c); k.classList.add('is-mini');
        if (n) { k.classList.add('is-flipped'); if (n > 1) { const tg = k.querySelector('.tc__tag'); tg.textContent = c.rarity === 'legendary' ? `×${n} · tradeable` : `×${n}`; tg.className = 'tc__tag is-dupe'; k.classList.add('show-tag'); } k.onclick = () => inspect(c); }
        else { k.classList.add('is-locked'); k.insertAdjacentHTML('beforeend', `<span class="tc-lockno">No. ${String(c.no).padStart(3, '0')}</span>`); }
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
  function inspect(c) {
    const cs = c.cosmetic && D.COS[c.cosmetic];
    const el = sheet('tc-inspect', `<div class="tc-big"></div><div class="tc-info"><div class="tcpk__kicker">${esc(c.setName)}</div><h2 class="tc-h">${esc(c.name)}</h2><p>${c.rarity[0].toUpperCase() + c.rarity.slice(1)} · owned ×${ownedN(c.id)}</p>${cs ? `<div class="tc-rew"><small>Reward</small><b>${esc(cs.n)}</b>${unlocked(c.cosmetic) ? `<button type="button" class="tcpk__btn tcpk__btn--go" id="tcEq">${isEquipped(c.cosmetic) ? 'Equipped' : 'Equip'}</button>` : ''}${cs.kind === 'cel' ? '<button type="button" class="tcpk__btn" id="tcTry">Preview</button>' : ''}</div>` : '<p class="tc-dim">Collection card. Completes the set.</p>'}${c.rarity === 'legendary' && ownedN(c.id) > 1 ? '<p class="tc-dim">Duplicate legendary: trade it with a mate from the Trades button once the card server is on.</p>' : ''}</div>`);
    const k = TCC.card(c); k.classList.add('is-flipped'); k.dataset.inspect = '1'; el.querySelector('.tc-big').appendChild(k);
    if (c.rarity === 'legendary') setTimeout(() => k.classList.add('do-sweep'), 250);
    const eq = el.querySelector('#tcEq'); if (eq) eq.onclick = () => { equip(c.cosmetic); eq.textContent = 'Equipped'; };
    const tr = el.querySelector('#tcTry'); if (tr) tr.onclick = () => FX.run(c.cosmetic, save.name);
  }
  // Loadout
  function isEquipped(cos) { const s = D.COS[cos]; if (!s) return false; const L = save.look || {}; return s.kind === 'wear' ? (L.wear || {})[s.slot] === cos : s.kind === 'cel' ? (L.cel || {})[s.slot] === cos : s.kind === 'title' ? L.title === cos : (L.kit || {})[s.slot] === cos; }
  function equip(cos, off) {
    const s = D.COS[cos]; if (!s) return; const L = save.look || (save.look = {});
    if (s.kind === 'wear') { L.wear = L.wear || {}; if (off) delete L.wear[s.slot]; else { L.wear[s.slot] = cos; if (s.slot === 'hat') L.cap = 0; } }
    else if (s.kind === 'cel') { L.cel = L.cel || {}; if (off) delete L.cel[s.slot]; else L.cel[s.slot] = cos; }
    else if (s.kind === 'title') { L.title = off ? null : cos; }
    else { L.kit = L.kit || {}; if (off) delete L.kit[s.slot]; else L.kit[s.slot] = cos; if (s.flight && !off) save.flight = s.flight; }
    keep(); try { V.setPlayerLook(save.look, save.flight, save.name, career() ? career().tier : 0); if (document.body.classList.contains('tc-preview')) V.preview(true); } catch (e) {}
  }
  function slotOf(slot) { const L = save.look || {}; return (L.wear || {})[slot] || (L.cel || {})[slot] || (L.kit || {})[slot] || (slot === 'title' ? L.title : null); }
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
        return `<button type="button" class="tc-lrow" data-slot="${slot}"><i class="tc-lthumb">${sc ? `<img src="${sc.art}" alt="">` : ''}</i><span><small>${nm}</small><b>${cur ? esc(D.COS[cur].n) : 'None'}</b></span><em>${have}/${opts.length}</em><i class="tc-chev">›</i></button>`;
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
    if (W.mouth === 'wear_ciggie') {
      const g = new T.Group();
      const body = new T.Mesh(new T.CylinderGeometry(.0042, .0042, .055, 10), M(0xf3efe6, { roughness: .9 })); body.rotation.x = Math.PI / 2; g.add(body);
      const filt = new T.Mesh(new T.CylinderGeometry(.0044, .0044, .016, 10), M(0xc98a3d)); filt.rotation.x = body.rotation.x; filt.position.set(0, .003, -.02); g.add(filt);
      const tip = new T.Mesh(new T.CylinderGeometry(.0043, .0043, .004, 10), new T.MeshBasicMaterial({ color: 0xff6a1a })); tip.rotation.x = body.rotation.x; tip.position.set(0, -.007, .028); g.add(tip);
      g.rotation.set(.5, .55, 0); g.position.set(.018, bx.y0 + h * .15, front - .004); g.scale.setScalar(sc); add(g);
    }
    if (W.hat === 'wear_flatcap') {
      const g = new T.Group(), tw = M(0x5b4a3a, { roughness: .95 });
      const crown = new T.Mesh(new T.SphereGeometry(.1, 28, 12, 0, Math.PI * 2, 0, Math.PI * .5), tw); crown.scale.set(1.04, .66, 1.12); g.add(crown);
      const rim = new T.Mesh(new T.CylinderGeometry(.104, .104, .02, 28, 1, true), tw); rim.scale.set(1, 1, 1.08); rim.position.y = -.008; g.add(rim);
      const peak = new T.Mesh(new T.CylinderGeometry(.08, .08, .007, 24, 1, false, -Math.PI / 2, Math.PI), tw); peak.scale.set(1, 1, .6); peak.position.set(0, -.012, .088); peak.rotation.x = .2; g.add(peak);
      g.position.set(0, bx.y1 - h * .36 + .01, (bx.z0 + bx.z1) / 2 + .01); g.rotation.x = -.09; g.scale.setScalar(sc); add(g);
    }
    if (W.hair === 'wear_mullet') {
      const col = (L.hairCol && new T.Color(L.hairCol)) || new T.Color(0x3b2a1a);
      const g = new T.Group(), hm = M(col.getHex(), { roughness: .7 });
      for (let i = 0; i < 11; i++) { const s = new T.Mesh(new T.SphereGeometry(.028, 10, 8), hm); const a = (i - 5) / 5; s.position.set(a * .058, -(i % 2) * .018 - Math.abs(a) * .012, -(i % 3) * .006); s.scale.set(1, 3.3 - Math.abs(a) * 1.1, .75); s.rotation.z = a * .25; g.add(s); }
      g.position.set(0, bx.y0 + h * .18, bx.z0 + .03); g.scale.setScalar(sc); add(g);
    }
    if (W.shoulder === 'wear_towel') {
      const par = B.Spine2 || B.Spine1 || B.Neck; if (!par) return;
      const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#efe9dc'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#9b3b32'; for (let i = 0; i < 64; i += 16) { x.fillRect(i, 0, 5, 64); x.fillRect(0, i, 64, 5); }
      const tex = new T.CanvasTexture(c); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(2, 3);
      const mat = new T.MeshStandardMaterial({ map: tex, roughness: 1, side: T.DoubleSide });
      const g = new T.Group();
      const top = new T.Mesh(new T.BoxGeometry(.11, .018, .2), mat); g.add(top);
      const seam = new T.Mesh(new T.BoxGeometry(.112, .004, .006), new T.MeshStandardMaterial({ color: 0x9b3b32, roughness: 1 })); seam.position.set(0, -.19, .104); g.add(seam);
      const front = new T.Mesh(new T.BoxGeometry(.11, .2, .016), mat); front.position.set(0, -.1, .1); front.rotation.x = -.12; g.add(front);
      const back = new T.Mesh(new T.BoxGeometry(.11, .16, .016), mat); back.position.set(0, -.08, -.1); back.rotation.x = .1; g.add(back);
      g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
      g.position.set(-.095, .13, .0); g.rotation.z = -.32; g.scale.setScalar(.92); par.add(g);
    }
  };

  // ---------- walk-on: character walks to the oche, effect fires on arrival ----------
  // Hook in the viewer's frame loop calls TOPS_WALKFX each frame; we own the camera while walking.
  let WK = null;
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
  function walkEnd() {
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
  window.TOPS_WALKPOST = function () { if (WK && WK.act && WK.me && WK.me.userData.mixer) { WK.me.userData.mixer.update(0); WK.me.position.copy(WK.pos || WK.me.position); } if (WK && WK.fp) WK.fp.visible = false; };
  window.TOPS_WALKFX = function (_now, v) {
    const now = performance.now();
    if (!WK || !v.me) return null;
    let k = (now - WK.t0) / WK.dur; if (window.TC_WALK_FREEZE != null) k = window.TC_WALK_FREEZE; if (k < 0) return { fov: 50 };
    const me = v.me, T3 = v.T.Vector3;
    if (!WK.home) {
      WK.home = me.position.clone(); WK.rot = me.rotation.y;
      // derive the room's axes from the normal player camera: it sits behind the player looking at the board
      const fwd = new T3().subVectors(v.look, v.pos); fwd.y = 0; fwd.normalize(); const side = new T3(fwd.z, 0, -fwd.x);
      WK.fwd = fwd; WK.side = side;
      WK.start = WK.home.clone().addScaledVector(fwd, -2.4).addScaledVector(side, 1.0);   // walk in from the room behind the oche
      WK.cam = WK.home.clone().addScaledVector(fwd, .15).addScaledVector(side, 1.3); WK.cam.y = 1.5;   // beside the oche, facing back at you
    }
    if (!WK.walking && k < .78) { const a = clipOn(v, me, 'walk', false); if (a) WK.walking = true; }
    me.visible = true; if (v.fpFig) { v.fpFig.visible = false; WK.fp = v.fpFig; } if (WK.me !== me) { WK.walking = false; if (WK.arrived) WK.arrived = false; } WK.me = me;
    { const mx = me.userData && me.userData.mixer, dt = Math.min(.05, (now - (WK.last || now)) / 1000); WK.last = now; if (mx) mx.update(window.TC_WALK_FREEZE != null ? .12 : dt); }
    if (k >= 1) {
      me.position.copy(WK.home); me.rotation.y = WK.rot;
      try { if (WK.act) WK.act.fadeOut(.4); v.playClip && v.playClip(me, 'idle', { fade: .5 }); } catch (e) {}
      if (!WK.fired && WK.fx) FX.run(WK.fx, WK.name);
      WK = null; walkEnd(); return null;
    }
    const e = Math.min(1, k / .78), ease = 1 - Math.pow(1 - e, 2);
    me.position.lerpVectors(WK.start, WK.home, ease); WK.pos = me.position.clone();
    const dir = new T3().subVectors(WK.home, WK.start), face = Math.atan2(dir.x, dir.z) + Math.PI;
    me.rotation.y = k < .78 ? face : face + (WK.rot - face) * Math.min(1, (k - .78) / .12);
    if (k >= .78 && !WK.arrived) { WK.arrived = true; clipOn(v, me, WK.fx ? 'pump' : 'idle', !!WK.fx); }
    if (k >= .8 && !WK.fired && WK.fx) { WK.fired = true; FX.run(WK.fx, WK.name); }
    // three deliberate shots with hard cuts: entrance (low 3/4 front), walk (tracking alongside), arrival (rear 3/4 to the board)
    const F = WK.fwd, Sd = WK.side, p0 = me.position, up = (v3, y) => { v3.y = y; return v3; };
    let cam, tgt, fov;
    if (k < .7) { cam = up(WK.home.clone().addScaledVector(F, -.55).addScaledVector(Sd, -1.7), 1.5); tgt = up(p0.clone(), 1.3); fov = k < .3 ? 38 : 44; }
    else { cam = up(WK.home.clone().addScaledVector(F, -2.3).addScaledVector(Sd, -.9), 1.5); tgt = up(WK.home.clone().addScaledVector(F, 1.4), 1.35); fov = 46; }
    const shot = k < .22 ? 0 : k < .7 ? 1 : 2; if (WK.shot !== shot) { WK.shot = shot; if (WK.ov) WK.ov.dataset.shot = shot; }
    const blend = k < .93 ? 1 : 1 - (k - .93) / .07;
    v.pos.lerp(cam, blend); v.look.lerp(tgt, blend);
    return { fov: fov + (1 - blend) * 4 };
  };

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
      const id = 'exh_' + L.id;
      if (!ACH.find(a => a.id === id)) ACH.push({ id, n: 'Beat ' + L.name, d: `Win an exhibition against ${L.name}`, t: 'L', ic: '🏆' });
      try { achUnlock(id); } catch (e) {}
      toast('Exhibition won', 'You beat ' + L.name, `${L.nick} foil card + title "${D.COS[L.cos].n}"`, 'legendary');
    } else {
      if (!t.own.ticket) { grant('ticket', 'exhibition'); toast('Exhibition', 'Lost to ' + L.name, 'You kept the ticket. Commemorative card added.', 'common'); }
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
  window.TC_API = { maxText, award, choose, openPicks, grant, equip, binder, loadout, cabinet, tiersView, st, FX, zone, addTrophy, poster, D };
})();
