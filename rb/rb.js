// TOPS rebrand (EXP-REBRAND) · the new menu set, behind one switch.
// ?rebrand=1 turns it on for this device (remembered), ?rebrand=0 turns it off. Off = this file installs nothing.
// Rule: the new screens only PRESENT the game. Every action calls the game's own function or button
// (Walk on → the hub's #c3Go / playNext path, money match → moneyMatch()), so the match lifecycle, money and saves stay the game's.
(function () {
  // Launch model (Overseer 22:02, Hayden 21:58): the new look is ON for everyone. RB_KILL = true turns it off for everyone (rollback = a one-line release).
  // ?rebrand=0 / ?rebrand=1 still set this device for debugging (remembered).
  const RB_KILL = false;
  const ON = (() => { if (RB_KILL) return false; try { const q = new URLSearchParams(location.search); if (q.has('rebrand')) localStorage.setItem('tops_rebrand', q.get('rebrand') === '0' ? '0' : '1'); return localStorage.getItem('tops_rebrand') !== '0'; } catch (e) { return true; } })();
  window.TOPS_REBRAND = ON;
  const setRB = on => { try { localStorage.setItem('tops_rebrand', on ? '1' : '0'); } catch (e) {} try { location.reload(); } catch (e) {} };
  window.TOPS_RB_SET = setRB;
  if (!ON) return;
  try { document.documentElement.classList.add('rb-on'); } catch (e) {}
  const $id = id => document.getElementById(id), qa = (s, r) => [...(r || document).querySelectorAll(s)];
  const IMG = 'assets/rb/';   // review build: images on main under assets/rb (Shipping copies them from exp-rebrand-assets)
  const IC = {
    cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 6l6 8H6z"/></svg>'
  };
  // opponents with a generated photo (one consistent set); everyone else gets the tier's empty venue and their face in the head-to-head
  /* Director #41: the generated Big Mal photo was a different man from the 3D Big Mal he plays; no opponent photos now. The Tonight hero is the opponent's own
     render (V.heroShot of his look: named build + beard come with his name) over the tier's empty venue, and his face is his own portrait. A render that
     needs the hair library waits for it (never a beardless Big Mal); until then, the empty venue. */
  const OPP_PHOTO = {};
  const hairReady = () => { try { return Array.isArray(((V._qa && V._qa.gfx && V._qa.gfx()) || {}).hair); } catch (e) { return false; } };
  const oppLookRb = n => { const L = oppLookFor(n); try { if (V.hairFor && V.hairFor(L, n.oppName)) { if (hairReady()) return Object.assign({}, L, { _rbHair: 1 }); window.__avPending = 1; return null; } } catch (e) {} return L; };   // the game caches renders by look, not by whether the hair library was in: a look that needs it gets its own key once it's in (null = not yet)
  const oppHeroBg = (n, tier) => { const scene = `url(${IMG}venue_t${tier}.jpg) 60% 40%/cover no-repeat`; try { if (!V.heroShot || !n || n.oppName2) return scene; const L = oppLookRb(n); if (!L) return scene; const h = V.heroShot(L, n.oppName, tier, 0); return h ? `url(${h}) 86% 100%/auto 100% no-repeat,${scene}` : scene; } catch (e) { return scene; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // #18 (Director/Overseer 23:50): never caption a stock photo with the player's name. Player heroes use his OWN render (V.heroShot of save.look)
  // over a people-free venue still; the header avatar is his own portrait.
  const meHero = tier => { try { return V.heroShot && V.heroShot(save.look, save.name || 'You', tier, save.flight); } catch (e) { return ''; } };
  const sceneImg = tier => `${IMG}venue_t${Math.max(0, Math.min(6, tier | 0))}.jpg`;
  const heroBg = (tier, pos) => { const h = meHero(tier); return h ? `url(${h}) ${pos || '82% 100%'}/auto 100% no-repeat,url(${sceneImg(tier)}) 50% 40%/cover no-repeat` : `url(${sceneImg(tier)}) 50% 40%/cover no-repeat`; };
  /* ---------- components (same as the v9.1 prototype) ---------- */
  const chip = (t, c = '') => `<span class="rb-chip ${c ? 'rb-' + c : ''}">${t}</span>`;
  const meter = (n, fill, o = {}) => { let h = ''; for (let i = 0; i < n; i++) { const c = i < fill ? 'rb-f' : i < fill + (o.ghost || 0) ? 'rb-gh' : ''; h += `<i class="${c}"></i>`; } return `<div class="rb-meter" aria-hidden="true">${h}${o.tick != null ? `<span class="rb-mtk" style="left:calc(${o.tick * 100}% - 1px)"></span>` : ''}</div>`; };
  /* match the mockup (Hayden 06:10): no green rings. The header shows "Lv 14" over a thin XP line; the big variant (Locker, Season, Result) is a
     caps label, the number in condensed type and the same thin line. Green stays only on the thin XP line; the week line is white. */
  const ring = (pct, lv, sz = 64, lab = 'LEVEL') => { const p = Math.round(Math.max(0, Math.min(1, pct)) * 100); return sz < 40 ? `<span class="rb-lvt">Lv ${lv}</span><span class="rb-lvb"><i style="width:${p}%"></i></span>` : `<small>${lab}</small><b>${lv}</b><span class="rb-lvb"><i style="width:${p}%;${lab === 'LEVEL' ? '' : 'background:var(--ink)'}"></i></span>`; };
  const sh = t => `<div class="rb-sh"><h3>${t}</h3></div>`;
  /* ---------- reads from the real save (no writes here) ---------- */
  function model() {
    const c = career(), v = (window.C3 && C3.V3) ? C3.V3() : null; if (!c || !v) return null;
    const t = TIERS[c.tier], sn = c.season, n = c.next || nextOpponent();
    const rows = sn && !sn.ko ? seasonPos(sn) : null, yi = rows ? rows.findIndex(r => r.you) : -1;
    const need = C3.lvNeed(v.lv), avgs = c.tierAvgs || [], form = avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null;
    return { c, v, t, sn, n, rows, yi, need, pct: v.xp / need, form, bank: c.bank, name: save.name || 'You' };
  }
  /* ---------- shell ---------- */
  const TABS = [['tonight', 'Tonight'], ['season', 'Season'], ['shop', 'Shop'], ['locker', 'Locker'], ['practice', 'Practice']];
  const OLD = { shop: 'kit', kit: 'kit', locker: 'player', practice: 'practice' };
  const BUILT = { tonight: 1, season: 1, locker: 1, shop: 1, practice: 1 };   // until each new screen lands, the tab opens the old one
  let tab = 'tonight', lk = 'load', sel = null, shopMsg = '', cardF = 'all';
  function ensure() {
    let el = $id('rbApp'); if (el) return el;
    el = document.createElement('div'); el.id = 'rbApp'; el.hidden = true;
    el.innerHTML = `<header class="rb-hd"><span class="rb-wm">TOPS</span><button class="rb-me" type="button" id="rbMe" aria-label="Your level, open Locker"><span class="rb-face" id="rbFace" style="width:30px;height:30px;flex-basis:30px"></span><span class="rb-nm" id="rbName"></span><span class="rb-ring" id="rbRing" style="width:30px;height:30px;flex-basis:30px"></span></button><span class="rb-bank rb-num" id="rbBank"></span><button class="rb-ib" type="button" id="rbMenu" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></header><nav class="rb-tabs" id="rbTabs" role="tablist"></nav><main id="rbMain" style="flex:1;display:flex;flex-direction:column;min-height:0"></main>`;
    document.body.appendChild(el);
    const back = document.createElement('button'); back.id = 'rbBack'; back.type = 'button'; back.hidden = true; back.textContent = 'New look ›'; back.onclick = () => open('tonight'); document.body.appendChild(back);
    el.querySelector('#rbMe').onclick = () => { tab = 'locker'; lk = 'load'; render(); };
    el.querySelector('#rbMenu').onclick = () => { const m = $id('rbMenuSheet'); if (m) { m.remove(); return; } const d = document.createElement('div'); d.id = 'rbMenuSheet'; d.className = 'rb-msheet'; d.innerHTML = `<button type="button" data-m="look">Edit look</button><button type="button" data-m="title">Main menu</button>`; el.appendChild(d);
      setTimeout(() => { const off = ev => { if (!d.isConnected) { document.removeEventListener('pointerdown', off, true); return; } if (!d.contains(ev.target) && ev.target.id !== 'rbMenu' && !ev.target.closest('#rbMenu')) { d.remove(); document.removeEventListener('pointerdown', off, true); } }; document.addEventListener('pointerdown', off, true); }, 0);
      d.onclick = e => { const k = e.target.dataset && e.target.dataset.m; if (!k) return; d.remove(); if (k === 'title') { close(); try { showTitle(); } catch (x) {} } else if (k === 'look') { close(); const b = $id('btnLook'); if (b) b.click(); } }; };
    return el;
  }
  function open(t) { if (resOn) return; const el = ensure(); tab = t || tab; el.hidden = false; $id('rbBack').hidden = true; render(); }
  function close() { clearInterval(armT); const el = $id('rbApp'); if (el) el.hidden = true; }
  /* live bug (05:45): Setup & gear showed an empty old Store (no dart, no list): switching the hub tab alone doesn't draw it. Press the game's own
     hub tab button, which switches and draws (Store → showShop, Player → showPlayer, Practice → renderPractice); Setup & gear lands on the Setup tab */
  function toOld(t) { close(); const b = $id('rbBack'); if (b) b.hidden = false; const k = OLD[t] || 'play'; try { const bt = document.querySelector(`#hubTabs [data-t="${k}"]`); if (bt) bt.click(); else hubTab(k); if (t === 'kit') showShop('setup', true); } catch (e) { console.warn('rb old tab', e); try { hubTab(k); } catch (e2) {} } }
  function render(keepSheet) {
    if (!keepSheet) { const ms = $id('rbMenuSheet'); if (ms) ms.remove(); }   /* #39: the game's soft portrait refresh keeps an open ☰ sheet */
    const M = model(); if (!M) { close(); return; }
    $id('rbName').textContent = M.name; $id('rbBank').textContent = money(M.bank); $id('rbRing').innerHTML = ring(M.pct, M.v.lv, 30);
    try { const p = V.portrait(save.look, save.name, M.c.tier, 0); if (p) $id('rbFace').style.backgroundImage = `url(${p})`; } catch (e) {}
    $id('rbTabs').innerHTML = TABS.map(([k, n]) => `<button role="tab" data-t="${k}" aria-selected="${k === tab}">${n}</button>`).join('');
    qa('#rbTabs button').forEach(b => b.onclick = () => { const k = b.dataset.t; if (BUILT[k]) { tab = k; render(); const sc = document.querySelector('#rbMain .rb-scr'); if (sc) sc.scrollTop = 0; } else toOld(k); });
    let html = ''; try { html = tab === 'season' ? season(M) : tab === 'locker' ? locker(M) : tab === 'shop' ? shop(M) : tab === 'practice' ? practice(M) : tonight(M); } catch (e) { console.warn('rb tonight', e); close(); return; }
    $id('rbMain').innerHTML = `<section class="rb-scr">${html}</section>`; wire(M);
  }
  /* ---------- Tonight (live data) ---------- */
  function tonight(M) {
    const { c, t, sn, n, rows, yi } = M;
    const oppPt = (() => { try { const L = n.oppName2 ? oppLookFor(n) : oppLookRb(n); return L ? V.portrait(L, n.oppName2 || n.oppName, c.tier, 0) : ''; } catch (e) { return ''; } })();
    const mePt = (() => { try { return V.portrait(save.look, save.name, c.tier, 0); } catch (e) { return ''; } })();
    const wk = sn ? Math.min(sn.week, sn.len) : 1, kick = sn && !sn.ko ? `${t.n} · week ${wk} of ${sn.len}` : sn && sn.ko ? `${t.n} · round ${wk} of ${sn.len}` : t.n;
    const cost = (c.run || n.intro) ? { fee: 0, trav: 0 } : { fee: FIXPAY[c.tier][2], trav: c.travelCredit > 0 ? 0 : ((typeof TRAVEL !== 'undefined' && TRAVEL[c.tier]) || 0) },   /* same as career3 fixtureCost */ tot = cost.fee + cost.trav, short = tot > c.bank;
    const fp = FIXPAY[c.tier], winTxt = n.intro ? 'a place in the team' : sn && sn.ko ? 'the next round' : `+2 pts · ${money(fp[0] + fp[3])}`;
    const hero = `<div class="rb-hero" style="height:262px"><div class="rb-im" style="background:${oppHeroBg(n, c.tier)}"></div><div class="rb-sh2" style="background:linear-gradient(180deg,rgba(10,12,14,0) 36%,rgba(10,12,14,.7) 64%,rgba(10,12,14,.96) 100%),linear-gradient(90deg,rgba(10,12,14,.55) 0,rgba(10,12,14,0) 48%)"></div><div class="rb-tx"><span class="rb-kick">${esc(kick)}</span><span class="rb-big" style="font-size:40px">vs ${esc(n.oppName)}</span><span class="rb-win">Win: ${esc(winTxt)}</span></div></div>`;
    const me = M.form, op = n.oppAvg, tot2 = (me || op) + op;
    const h2h = `<div class="rb-line">${me != null ? `You ${me} (last ${(c.tierAvgs || []).length})` : (n.intro ? 'Your fill-in night' : 'Your first average comes tonight')} · Him ${op} · Best of ${n.legs}</div>`;
    const cta = short
      ? `<div class="rb-card"><div class="rb-lock"><span class="rb-ic">${IC.cash}</span><div style="flex:1;display:flex;flex-direction:column;gap:6px"><span class="rb-t2">${money(tot - c.bank)} short of the ${money(tot)} entry</span><div class="rb-chips">${chip('Entry ' + money(tot))}${chip('You have ' + money(c.bank), 'l')}</div></div></div><div class="rb-bar"><i style="width:${Math.min(100, c.bank / tot * 100)}%"></i></div></div><button class="rb-primary" type="button" id="rbMoney"><b>Play the money match</b><small>Back room · best of 1</small></button>`
      : `<button class="rb-primary" type="button" id="rbGo"><b>Walk on</b><small>${tot ? `Entry ${money(tot)} · leaves ${money(c.bank - tot)}` : 'Free entry'}</small></button>`;
    let season = '';
    if (rows && yi >= 0) { const gap = yi <= 1 ? 0 : rows[1].pts - rows[yi].pts; season = `<button class="rb-link" type="button" id="rbSeason">Week ${wk} of ${sn.len} · ${ord(yi + 1)}${yi <= 1 ? ' · promotion places' : ` · ${gap} pt${gap === 1 ? '' : 's'} off 2nd`} ›</button>`; }
    const used = !!(sn && sn.side), nd = nextDart(M.v.lv);
    const side = n.intro ? '' : `<div class="rb-g2 rb-tiles"><button class="rb-card rb-tile" type="button" id="rbMoneyTile" ${used ? 'disabled' : ''}><span class="rb-t1">Money match</span><span class="rb-sub">${used ? 'Used this week' : 'Back room · ' + money(MM_PAY[c.tier] || 30)}</span></button><button class="rb-card rb-tile" type="button" id="rbNext"><span class="rb-t1">${nd ? 'Next dart' : 'Next level'}</span><span class="rb-sub">${nd ? esc(nd.b.n.replace(/ \d+g$/, '').replace(/^(Harrows|Red Dragon|Target|Shot|Winmau|Unicorn) /, '')) + ' · Lv ' + nd.lv : 'Level ' + (M.v.lv + 1)}</span>${nd ? `<span class="rb-tdart" style="background-image:url(${dartImg(nd.b, 'ds')})"></span>` : ''}</button></div>`;
    return hero + h2h + cta + season + side;
  }
  /* ---------- Season (live data) ---------- */
  function season(M) {
    const { c, t, sn, rows, yi } = M;
    const road = TIERS.map((x, i) => `${i ? '<span class="rb-ln"></span>' : ''}<div class="rb-st ${i < c.tier ? 'rb-done' : i === c.tier ? 'rb-now' : ''}"><i></i><span>${esc(x.n.replace(/ singles| league/i, ''))}</span></div>`).join('');
    const roadCard = `<div class="rb-card">${sh('Road to the Palace')}<div class="rb-road">${road}</div></div>`;
    if (!sn) return `<div class="rb-card"><span class="rb-t2">No season running yet</span><span class="rb-sub">Win your fill-in night and the league season starts.</span></div>` + roadCard;
    const wk = Math.min(sn.week, sn.len), left = Math.max(0, sn.len - wk + (sn.done ? 0 : 1) - 1);
    let head;
    if (sn.ko) head = `<div class="rb-card" style="flex-direction:row;align-items:center;gap:14px"><div class="rb-ring">${ring(wk / sn.len, wk, 64, 'ROUND')}</div><div style="flex:1;display:flex;flex-direction:column;gap:4px"><span class="rb-t1">${esc(t.n)}</span><span class="rb-sub">Round ${wk} of ${sn.len} · lose and you're out</span></div></div>`;
    else { const gap = yi <= 1 ? 0 : rows[1].pts - rows[yi].pts; head = `<div class="rb-card" style="flex-direction:row;align-items:center;gap:14px"><div class="rb-ring">${ring(wk / sn.len, wk, 64, 'WEEK')}</div><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px"><span class="rb-t1">${yi >= 0 ? ord(yi + 1) + ' · ' : ''}${esc(t.n)}</span><span class="rb-sub">${yi <= 1 ? 'In the promotion places' : gap + ' pt' + (gap === 1 ? '' : 's') + ' off 2nd'} · ${left} week${left === 1 ? '' : 's'} left</span><div class="rb-chips">${chip(IC.up + ' Top two go up')}</div></div></div>`; }
    const tbl = rows ? `<div class="rb-card">${sh('Table')}<div class="rb-sub" style="display:grid;grid-template-columns:24px 1fr 28px 34px;gap:8px;font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:var(--ink3)"><span>#</span><span>Player</span><span style="text-align:right">P</span><span style="text-align:right">Pts</span></div><div class="rb-tbl">${rows.map((r, i) => `${i === 2 ? '<div class="rb-cutl"><span>Top two go up</span></div>' : ''}<div class="rb-tr ${r.you ? 'rb-me' : ''}"><span class="rb-p">${i + 1}</span><span>${esc(r.you ? (save.name || 'You') : r.name)}</span><span class="rb-r rb-p">${r.p || 0}</span><span class="rb-r">${r.pts || 0}</span></div>`).join('')}</div></div>` : '';
    const next = sn.fixtures && sn.fixtures[sn.week] ? `<div class="rb-card" style="flex-direction:row;align-items:center;gap:12px"><span class="rb-face" style="background:#2b3135"></span><div style="flex:1;display:flex;flex-direction:column;gap:2px"><small class="rb-kick" style="font-size:11px">After tonight · week ${sn.week + 1}</small><span class="rb-t2">vs ${esc(sn.fixtures[sn.week])}</span></div></div>` : '';
    return head + tbl + roadCard + next;
  }

  /* ---------- Locker (live data; the only write is the game's own TOPS_spend on a + tap) ---------- */
  const DART_PHOTO = { assassin: 1, supergrip: 1, razor: 1, vapor8: 1, zen: 1, asp: 1, littler: 1 };   // generated product shots; the other darts use the game's own render
  function dartImg(b, kind) { if (DART_PHOTO[b.id]) return `${IMG}${kind}_${b.id}.jpg`; try { return V.dartShot(save.flight, Object.assign({ barrel: b }, setupParts())); } catch (e) { return ''; } }
  function nextDart(lv) { const G = window.TOPS_GATE; if (!G) return null; let best = null; BARRELS.forEach(b => { const n = G.LV[b.id]; if (n && !G.EXCL[b.id] && n > lv && !(save.owned || []).includes(b.id) && !(save.v12ent || []).includes(b.id) && (!best || n < best.lv)) best = { lv: n, b }; }); return best; }
  function locker(M) {
    const { c, v } = M;
    const seg = `<div class="rb-seg" role="tablist">${[['load', 'Loadout'], ['stats', 'Stats'], ['cards', 'Cards'], ['troph', 'Trophies']].map(([a, b]) => `<button type="button" role="tab" aria-selected="${lk === a}" data-lk="${a}">${b}</button>`).join('')}</div>`;
    if (lk === 'stats') return seg + stats(M);
    if (lk === 'cards') return seg + cards(M);
    if (lk === 'troph') return seg + trophies(M);
    const t = M.t, title = v.title || '', nd = nextDart(v.lv);
    const hero = `<div class="rb-hero" style="height:170px"><div class="rb-im" style="background:${heroBg(c.tier)}"></div><div class="rb-sh2" style="background:linear-gradient(90deg,rgba(10,12,14,.9) 0,rgba(10,12,14,.25) 62%,rgba(10,12,14,0) 80%)"></div><div class="rb-tx" style="right:42%"><span class="rb-big" style="font-size:32px">${esc(M.name)}</span><span class="rb-sub">${title ? esc(title) + ' · ' : ''}${esc(t.n)}</span></div></div>`;
    const lvl = `<div class="rb-card" style="flex-direction:row;align-items:center;gap:14px"><div class="rb-ring">${ring(M.pct, v.lv)}</div><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px"><span class="rb-t2">${M.need - v.xp} XP to level ${v.lv + 1}</span>${nd ? `<div style="display:flex;align-items:center;gap:8px"><div class="rb-slot rb-dart rb-r8" style="width:84px;flex:0 0 84px"><div class="rb-im" style="background-image:url(${dartImg(nd.b, 'ds')})"></div></div><span class="rb-sub" style="font-size:12.5px">${nd.lv === v.lv + 1 ? 'Next level' : 'Level ' + nd.lv}: ${esc(nd.b.n.replace(/ \d+g$/, ''))} unlocks</span></div>` : ''}</div></div>`;
    let game = '';
    const A = window.TOPS_ST2_API, st = window.TOPS_st && TOPS_st();
    if (A && st && window.TOPS_ST2 && TOPS_ST2()) {
      const kp = A.kitPts(), cap = Math.min(85, A.capNow()), seg10 = x => Math.round(Math.max(0, Math.min(cap, x)) / cap * 10);
      const rows = A.STATS.map(x => { const me = st.v[x.id], k = kp[x.id] || 0, f = seg10(me), g = Math.max(0, seg10(me + k) - f); return `<div class="rb-stt"><span>${esc(x.n)}</span>${meter(10, f, { ghost: g })}<b>${me + k}</b><button class="rb-plus" type="button" data-st="${x.id}" aria-label="Add a point to ${esc(x.n)}" ${st.bank > 0 && me < cap ? '' : 'disabled'}>+</button></div>`; }).join('');
      game = `<div class="rb-card">${sh('Your game')}${st.bank > 0 ? `<div class="rb-chips">${chip(st.bank + ' point' + (st.bank > 1 ? 's' : '') + ' to spend · tap +', 'g')}</div>` : ''}${rows}<div class="rb-mlab"><span><span class="rb-key rb-kf"></span>You</span><span><span class="rb-key rb-kg"></span>From your kit</span><span>Cap ${cap} at ${esc(t.n.replace(/ singles| league/i, ''))}</span></div></div>`;
    }
    const b = barrel(), shirt = (save.look && save.look.shirt) || '';
    const kit = `<div class="rb-sh" style="margin-top:2px"><h3>Kit</h3></div><div class="rb-g2"><button class="rb-card" type="button" data-go="shop" style="padding:0;gap:0;overflow:hidden"><div class="rb-slot rb-sq" style="background:var(--dartbg)"><div class="rb-im" style="background-image:url(${dartImg(b, 'ds')});background-size:92% auto"></div><span class="rb-chip" style="position:absolute;left:8px;top:8px">Equipped</span></div><div style="padding:10px 12px 12px;display:flex;flex-direction:column;gap:2px"><small class="rb-kick" style="font-size:11px">Darts</small><span class="rb-t2" style="font-size:14px">${esc(b.n)}</span><span class="rb-sub" style="font-size:12.5px">Change in Shop ›</span></div></button><div class="rb-card" style="padding:0;gap:0;overflow:hidden"><div class="rb-slot rb-sq"><div class="rb-im" style="background-image:${shirt ? `linear-gradient(${shirt},${shirt}),` : ''}url(${IMG}shirt.jpg);${shirt ? 'background-blend-mode:color,normal' : ''}"></div><span class="rb-chip" style="position:absolute;left:8px;top:8px">Wearing</span></div><div style="padding:10px 12px 12px;display:flex;flex-direction:column;gap:2px"><small class="rb-kick" style="font-size:11px">Shirt</small><span class="rb-t2" style="font-size:14px">Your colours</span><span class="rb-sub" style="font-size:12.5px">New ones every 5 levels</span></div></div></div>`;
    return seg + hero + lvl + game + kit;
  }
  function stats(M) {
    const { c } = M, b = c.best || {}, played = (c.wins || 0) + (c.losses || 0), avg = c.darts ? c.pts / c.darts * 3 : 0, A = c.tierAvgs || [];
    if (!played) return `<div class="rb-card"><span class="rb-t2">Your numbers start here</span><span class="rb-sub">Play your first fixture to record an average, high finish and best visit.</span></div>`;
    const tl = (k, v, s) => `<div class="rb-tl"><small>${k}</small><b class="rb-num">${v}</b><span class="rb-sub">${s}</span></div>`;
    const tiles = `<div class="rb-tile4">${tl('Average', avg.toFixed(1), 'Career · ' + played + ' match' + (played === 1 ? '' : 'es'))}${tl('Record', `${c.wins}–${c.losses}`, (c.streak || 0) + ' in a row now')}${tl('180s', c.t180 || 0, 'Best visit ' + (b.visit || '–'))}${tl('Best leg', b.leg < 99 ? b.leg : '–', b.leg < 99 ? 'darts' : 'not yet')}</div>`;
    let form = '';
    if (A.length >= 2) { const w = 320, h = 80, lo = Math.min(...A, avg) - 5, hi = Math.max(...A, avg) + 5, xs = i => 16 + i * ((w - 32) / (A.length - 1)), ys = x => 4 + h - (x - lo) / (hi - lo) * h;
      form = `<div class="rb-card">${sh('Form · last ' + A.length + ' matches')}<svg viewBox="0 0 ${w} ${h + 8}" style="width:100%;height:auto" role="img" aria-label="Match averages ${A.join(', ')}"><line x1="0" x2="${w}" y1="${ys(avg)}" y2="${ys(avg)}" stroke="#a0a6a3" stroke-dasharray="4 4" opacity=".8"/><polyline fill="none" stroke="#f3f4f2" stroke-width="2.5" stroke-linejoin="round" points="${A.map((x, i) => xs(i) + ',' + ys(x)).join(' ')}"/>${A.map((x, i) => `<circle cx="${xs(i)}" cy="${ys(x)}" r="${i === A.length - 1 ? 5 : 3}" fill="${i === A.length - 1 ? '#d7232d' : '#f3f4f2'}"/><text x="${xs(i)}" y="${ys(x) - 9}" fill="#aeb4b1" font-size="11" text-anchor="middle">${x}</text>`).join('')}</svg><div class="rb-mlab"><span>Oldest</span><span>- - ${avg.toFixed(1)} career</span><span>Last match</span></div></div>`; }
    const rec = (k, v) => `<div class="rb-mlab" style="font-size:14px;color:var(--ink)"><span>${k}</span><b>${v}</b></div>`;
    const recs = `<div class="rb-card" style="gap:8px">${sh('Records')}${rec('Highest checkout', b.hf || '–')}${rec('Best match average', b.avg ? b.avg.toFixed(1) : '–')}${rec('v Deano', `${c.rivalW || 0}–${c.rivalL || 0}`)}</div>`;
    return tiles + form + recs;
  }

  /* ---------- Shop (live data). Buy and Equip press the game's own shop row (rendered off-screen by showShop),
     so price, level gates, sponsor sets, the bank and the save stay entirely the game's (v12 buyBtn → buyBarrel; owned row → equip). ---------- */
  const bPts = b => { const acc = Math.round((5.6 - b.base) / 1.8 * 7); return { sc: acc, fi: acc, rh: Math.round((b.tol - 1) / .15 * 6), ct: Math.round((1.25 - b.sway) / .6 * 7) }; };   // same formula as the game's v09 barrelPts (display only)
  function dState(b) { const G = window.TOPS_GATE, own = (save.owned || []).includes(b.id), eq = save.barrel === b.id || (!save.barrel && b.id === BARRELS[0].id), g = !own && G ? G.gateBarrel(b) : null; return { own, eq, g, sp: !!(g && g.sp), lockLv: g && g.lv && !g.res ? g.lv : 0, res: !!(g && g.res), cost: price(b.price) }; }
  function shop(M) {
    const c = M.c, mine = barrel(); if (!sel) sel = mine.id; const b = BARRELS.find(x => x.id === sel) || mine, st = dState(b);
    const seg = `<div class="rb-seg" role="tablist"><button type="button" role="tab" aria-selected="true">Darts</button><button type="button" role="tab" aria-selected="false" data-go="kit">Setup &amp; gear</button></div>`;
    const wt = (b.n.match(/(\d+)g$/) || [])[1], name = b.n.replace(/ \d+g$/, '').replace(new RegExp('^' + b.brand + ' '), '');
    const badge = st.eq ? chip('Equipped') : st.sp ? chip('Sponsor set', 'w') : st.own ? chip('Owned') : st.lockLv ? chip(IC.lock + ' Level ' + st.lockLv, 'l') : '';
    const photo = DART_PHOTO[b.id] ? `${IMG}d_${b.id}.jpg` : dartImg(b, 'ds');
    const hero = `<div class="rb-card" style="padding:0;gap:0;overflow:hidden"><div class="rb-slot" style="aspect-ratio:16/9;background:var(--dartbg)"><div class="rb-im" style="background-image:url(${photo});background-size:${DART_PHOTO[b.id] ? 'cover' : '88% auto'}"></div></div><div style="padding:12px 14px 14px;display:flex;flex-direction:column;gap:6px"><div class="rb-chips">${badge}<span class="rb-kick" style="align-self:center">${esc(b.brand)}</span></div><span class="rb-big" style="font-size:28px">${esc(name)}</span><span class="rb-sub">${esc(b.s)}${wt ? ' · ' + wt + ' g' : ''}</span></div></div>`;
    const A = window.TOPS_ST2_API, names = A ? Object.fromEntries(A.STATS.map(x => [x.id, x.n])) : { sc: 'Scoring', fi: 'Finishing', ct: 'Control', rh: 'Rhythm' };
    const pa = bPts(mine), pb = bPts(b), mx = 10;
    const bars = id => { const a = pa[id], v = pb[id], dv = v - a; return `<div class="rb-cmp"><span>${names[id]}</span><div class="rb-bars"><div class="rb-bar"><i class="rb-prev" style="width:${Math.max(2, (a + 3) / (mx + 3) * 100)}%"></i></div><div class="rb-bar"><i style="width:${Math.max(2, (v + 3) / (mx + 3) * 100)}%"></i></div></div><span class="rb-d ${dv > 0 ? 'rb-up' : dv < 0 ? 'rb-dn' : 'rb-eq'}">${dv > 0 ? '+' : dv < 0 ? '−' : '±'}${Math.abs(dv)}</span></div>`; };
    const cmp = st.eq ? `<div class="rb-card">${sh('Equipped now')}<span class="rb-sub">This is the dart you throw. Pick another to compare.</span></div>` : `<div class="rb-card">${sh('vs your ' + esc(mine.n.replace(/ \d+g$/, '')))}<div class="rb-mlab"><span><span class="rb-key" style="background:#4a5156"></span>Yours</span><span><span class="rb-key rb-kt"></span>This dart</span></div>${['sc', 'fi', 'ct', 'rh'].map(bars).join('')}<span class="rb-sub" style="font-size:12px">Stat points the dart adds on top of yours.</span></div>`;
    let act = '';
    if (st.eq) act = '';
    else if (st.own) act = `<button class="rb-primary" type="button" id="rbEquip"><b>Equip</b><small>Throw with it from your next match</small></button>`;
    else if (st.sp) act = `<div class="rb-card"><div class="rb-lock"><span class="rb-ic">${IC.lock}</span><div style="flex:1"><span class="rb-t2">Comes with a sponsor deal</span><div class="rb-sub">Not sold. Sponsors offer their set as you climb.</div></div></div></div>`;
    else if (st.lockLv || st.res) { const lv = M.v.lv, need = st.lockLv || (st.g && st.g.lv) || lv; act = `<div class="rb-card"><div class="rb-lock"><span class="rb-ic">${IC.lock}</span><div style="flex:1;display:flex;flex-direction:column;gap:6px"><span class="rb-t2">${st.res ? 'Reserved for you · back at level ' + need : 'Unlocks at level ' + need}</span><div class="rb-chips">${chip('Level ' + need)}${chip(money(st.cost))}</div></div></div><div class="rb-mlab"><span>You · level ${lv}</span><span>${Math.max(0, need - lv)} level${need - lv === 1 ? '' : 's'} to go</span></div>${meter(10, Math.round(Math.min(1, lv / need) * 10))}<button class="rb-link" type="button" data-go="tonight" style="align-self:flex-start;min-height:44px">Play to level up ›</button></div>`; }
    else if (c.bank < st.cost) act = `<div class="rb-card"><div class="rb-lock"><span class="rb-ic">${IC.cash}</span><div style="flex:1;display:flex;flex-direction:column;gap:6px"><span class="rb-t2">${money(st.cost - c.bank)} to go</span><div class="rb-chips">${chip('Price ' + money(st.cost))}${chip('You have ' + money(c.bank), 'l')}</div></div></div><div class="rb-bar"><i style="width:${Math.min(100, c.bank / st.cost * 100)}%"></i></div></div>`;
    else act = `<button class="rb-primary" type="button" id="rbBuy"><b>Buy · ${money(st.cost)}</b><small>${money(c.bank)} → ${money(c.bank - st.cost)}</small></button>`;
    const msg = shopMsg ? `<div class="rb-card" role="status" style="padding:10px 14px"><span class="rb-sub">${esc(shopMsg)}</span></div>` : ''; shopMsg = '';
    const th = BARRELS.map(x => { const s2 = dState(x), lk = !s2.own && (s2.lockLv || s2.sp || s2.res); return `<button class="rb-th ${lk ? 'rb-lk' : ''}" type="button" data-bid="${x.id}" aria-pressed="${x.id === b.id}" aria-label="${esc(x.n)}"><div class="rb-slot rb-dart rb-r8"><div class="rb-im" style="background-image:url(${dartImg(x, 'ds')})"></div></div><small>${s2.eq ? '● Equipped' : s2.own ? '✓ Owned' : s2.sp ? 'Sponsor set' : s2.lockLv ? `<span class="rb-lkc">${IC.lock}</span>Level ${s2.lockLv} · ${money(s2.cost)}` : money(s2.cost)}</small></button>`; }).join('');
    return seg + hero + cmp + act + msg + `<div class="rb-card" style="padding:12px 0 12px 12px">${sh('All darts')}<div class="rb-thumbs" id="rbThumbs">${th}</div></div>`;
  }
  // press the game's own shop control for this dart; returns what changed
  function gameShop(id, kind) {
    const before = { bank: career().bank, owned: (save.owned || []).length, eq: save.barrel }, prevTab = (typeof hubTab !== 'undefined' && hubTab.cur) || null;
    try { showShop('barrel', true); } catch (e) { console.warn('rb showShop', e); }
    const row = document.querySelector(`#shopList .opt[data-v12id="${id}"]`);
    if (row) { if (kind === 'buy') { const btn = row.querySelector('.v12buy'); if (btn) btn.click(); } else { row.click(); const go = row.nextElementSibling && row.nextElementSibling.querySelector('.st2go'); if (save.barrel === before.eq && go) go.click(); } }   // with stats on, the row opens the game's detail and its Equip button does the equip
    try { if (hubTab.cur !== prevTab && prevTab) hubTab(prevTab); } catch (e) {}   // the game's buy/equip re-opens its shop screen under ours; put the hub back as it was
    const after = { bank: career().bank, owned: (save.owned || []).length, eq: save.barrel };
    return { ok: !!row && (after.eq !== before.eq || after.owned !== before.owned || after.bank !== before.bank), before, after };
  }

  /* ---------- Cards (live data from TC_API; Open uses the game's own pack opening, cards open the game's binder) ---------- */
  function cards(M) {
    const T = window.TC_API; if (!T || !T.st()) return `<div class="rb-card"><span class="rb-t2">Cards aren't ready yet</span></div>`;
    const t = T.st(), D = T.D, all = D.CARDS.filter(c => !c.exclusive), own = all.filter(c => t.own[c.id]), picks = t.picks.filter(p => p.chosen == null).length;
    const sets = D.SETS.filter(x => !x.exclusive && all.some(c => c.set === x.id));
    const pack = `<div class="rb-card" style="flex-direction:row;gap:12px;align-items:stretch"><div class="rb-slot rb-sq rb-r8" style="width:96px"><div class="rb-im" style="background-image:url(${IMG}pack.jpg)"></div></div><div style="flex:1;display:flex;flex-direction:column;gap:6px;min-width:0"><span class="rb-t1">${picks ? picks + ' pick' + (picks > 1 ? 's' : '') + ' waiting' : 'Nothing to open'}</span><span class="rb-sub">${picks ? 'Choose one card from each' : 'Win matches to earn picks'}</span><div class="rb-mlab"><span>Collected</span><span>${own.length} / ${all.length}</span></div>${meter(10, Math.round(own.length / all.length * 10))}</div></div>${picks ? '<button class="rb-primary" type="button" id="rbOpen"><b>Open</b></button>' : ''}`;
    const chips = `<div class="rb-fchips" role="group" aria-label="Filter cards">${[['all', 'All']].concat(sets.map(x => [x.id, x.name])).map(([id, n]) => `<button type="button" data-cf="${id}" aria-pressed="${cardF === id}">${esc(n)}${id !== 'all' ? ' · ' + all.filter(c => c.set === id && t.own[c.id]).length + '/' + all.filter(c => c.set === id).length : ''}</button>`).join('')}</div>`;
    const L = all.filter(c => cardF === 'all' || c.set === cardF);
    const grid = `<div class="rb-grid">${L.map(c => t.own[c.id] ? `<button type="button" class="rb-cd" data-card="${c.id}" aria-label="${esc(c.name)}"><div class="rb-im" style="background-image:url(${c.art})"></div><span class="rb-n" style="text-align:left">${esc(c.name)}</span></button>` : `<div class="rb-cd rb-out" aria-label="Not collected yet">${c.no}</div>`).join('')}</div>`;
    const more = `<div class="rb-g2"><button class="rb-row" type="button" id="rbBinder" style="min-height:56px"><span class="rb-tx"><span class="rb-t2">Binder</span><small>Sets · trades</small></span><span class="rb-chev">›</span></button><button class="rb-row" type="button" id="rbLoad" style="min-height:56px"><span class="rb-tx"><span class="rb-t2">Loadout</span><small>What you wear</small></span><span class="rb-chev">›</span></button></div>`;
    return pack + more + chips + grid;
  }

  /* ---------- Result (presentation only). The game's reward overlay (career3 showReward) still runs and pays everything;
     this screen sits over it, reads the match and the save, and its buttons press the overlay's own buttons, so the after-match chain is unchanged. ---------- */
  let pre0 = null, resOn = false;
  const xpTotal = v => { let t = v.xp; for (let L = 1; L < v.lv; L++) t += C3.lvNeed(L); return t; };
  function result(M) {
    const { c, v } = M, me = S.p[0], op = S.p[1] || {}, won = !!S.won, money0 = !!(S.local || S.after === 'money' || S.intro), avg = x => x && x.darts ? +(x.pts / x.darts * 3).toFixed(1) : 0;
    const a = avg(me), b = avg(op), cash = c.bank - pre0.bank, xp = Math.max(0, xpTotal(v) - pre0.xp), up = pre0 && v.lv > pre0.lv;
    const ov = $id('c3rw'), unl = ov && ov.querySelector('#c3rwUnl b'), extra = ov ? ov.querySelectorAll('.c3rw-ach, #c3rwCon span').length : 0, keep = ov && ov.querySelector('#c3rwKeep'), go = ov && ov.querySelector('#c3rwGo');
    const head = `<div class="rb-hero" style="height:250px"><div class="rb-im" style="background:${heroBg(c.tier, '18% 100%')}"></div><div class="rb-sh2" style="background:linear-gradient(270deg,rgba(10,12,14,.92) 0,rgba(10,12,14,.4) 45%,rgba(10,12,14,0) 70%)"></div><div class="rb-lockup"><small style="color:${won ? 'var(--ink)' : 'var(--ink2)'}">${won ? 'Won' : 'Lost'}</small><b class="rb-num">${me.legs || 0}–${op.legs || 0}</b><span>vs ${esc(op.disp || op.name || '')}</span></div></div>`;
    const mePt = (() => { try { return V.portrait(save.look, save.name, c.tier, 0); } catch (e) { return ''; } })();
    const opPt = (pre0 && pre0.opPt) || (() => { try { return op.look ? V.portrait(op.look, op.name, c.tier, 0) : ''; } catch (e) { return ''; } })();
    const co = me.coAtt ? Math.round(me.coHit / me.coAtt * 100) + '%' : '–';
    const h2h = `<div class="rb-line">You ${a || '–'} · Him ${b || '–'} · Checkout ${co}${me.t180 ? ' · ' + me.t180 + ' × 180' : ''}${me.hf ? ' · High out ' + me.hf : ''}</div>`;
    const rw = `<div class="rb-card">${sh(won ? 'Rewards' : 'Match summary')}<div style="display:flex;align-items:center;gap:14px">${up ? '' : `<div class="rb-ring">${ring(M.pct, v.lv)}</div>`}<div style="flex:1;display:flex;flex-direction:column;gap:6px"><div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><span class="rb-big rb-num" id="rbRCash" style="font-size:32px;color:${cash > 0 ? 'var(--good)' : 'var(--ink3)'}">${cash < 0 ? '−' + money(-cash) : '+' + money(cash)}</span><span class="rb-t2 rb-num" id="rbRXp">+${xp} XP</span></div><span class="rb-sub">${M.need - v.xp} XP to level ${v.lv + 1}</span>${extra ? `<div class="rb-chips">${chip('+' + extra + ' achievement' + (extra > 1 ? 's' : '') + ' and contracts', 'g')}</div>` : ''}</div></div></div>`;
    let want = '';
    const nb = BARRELS.filter(x => { const d = dState(x); return !d.own && !d.g; }).sort((x, y) => x.price - y.price)[0];
    if (nb) { const cost = price(nb.price), left = Math.max(0, cost - c.bank); want = `<div class="rb-row" style="flex-direction:column;align-items:stretch;gap:8px;cursor:default"><span style="display:flex;align-items:center;gap:12px"><div class="rb-slot rb-dart rb-r8" style="width:110px;flex:0 0 110px"><div class="rb-im" style="background-image:url(${dartImg(nb, 'ds')})"></div></div><span class="rb-tx"><small>Next dart</small><span class="rb-t2">${esc(nb.n.replace(/ \d+g$/, '').replace(new RegExp('^' + nb.brand + ' '), ''))} · ${left ? money(left) + ' to go' : 'you can buy it'}</span></span></span><div class="rb-bar"><i style="width:${Math.min(100, c.bank / cost * 100)}%"></i></div></div>`; }
    let tbl = '';
    if (!money0 && M.rows && M.yi >= 0) tbl = `<div class="rb-row" style="cursor:default"><span class="rb-tx"><small>Season</small><span class="rb-t2">Now ${ord(M.yi + 1)}${M.yi <= 1 ? ' · top two go up' : ' · ' + (M.rows[1].pts - M.rows[M.yi].pts) + ' pts off 2nd'}</span></span></div>`;
    const act = `<div class="rb-pin" style="display:flex;flex-direction:column;gap:8px;padding-bottom:4px"><button class="rb-primary" type="button" id="rbRGo"><b>${esc(go ? go.textContent : 'Continue')}</b></button>${keep ? `<button class="rb-ghost" type="button" id="rbRKeep" style="align-self:center">${esc(keep.textContent)}</button>` : ''}</div>`;
    // the milestone moment: a level-up gets its own card above the rewards (v8 note: real milestones get a stronger moment)
    const lvl = up ? `<div class="rb-card rb-lvup" style="flex-direction:row;align-items:center;gap:16px;border-color:#6a2226;background:linear-gradient(90deg,#2a1416,#1a1e21 70%)"><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px"><small class="rb-kick" style="color:#f0a3a7">Level up</small><span class="rb-big" style="font-size:34px">Level ${v.lv}</span>${unl ? `<span class="rb-sub">${esc(unl.textContent)} unlocked</span>` : ''}</div></div>` : '';
    return head + lvl + h2h + rw + want + tbl + act;
  }
  let resMO = null, bodyMO = null;
  // any game layer showing at or above our level (sheets 55-61, pack opening, messages) other than the reward overlay itself
  function blocker() { for (const n of document.body.children) { if (n.id === 'rbApp' || n.id === 'rbBack' || n.id === 'c3rw' || n.hidden) continue; const cs = getComputedStyle(n); if (cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.pointerEvents !== 'none' && +cs.opacity > .05 && (+cs.zIndex || 0) >= 50 && n.offsetWidth > 100 && n.offsetHeight > 200) return true; /* a sheet or screen, not a toast or banner */ } return false; }
  function showResult() {
    if (resMO) resMO.disconnect(); if (bodyMO) bodyMO.disconnect(); resMO = bodyMO = null;
    if (pre0 && S && S.p && $id('c3rw') && blocker()) waitBack();
    if (!pre0 || !S || !S.p || !$id('c3rw') || blocker()) { if (window.TOPS_RB_DEBUG) console.log('rb result skipped', JSON.stringify({ pre0: !!pre0, S: !!(S && S.p), ov: !!$id('c3rw'), bl: blocker() && [...document.body.children].filter(n => { if (n.id === 'rbApp' || n.id === 'rbBack' || n.id === 'c3rw' || n.hidden) return false; const cs = getComputedStyle(n); return cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > .05 && (+cs.zIndex || 0) >= 50 && n.offsetWidth > 100; }).map(n => n.id || n.className) })); return; }   // nothing recorded for this match, or a game sheet is up: the game's own overlay stays as it is
    const M = model(); if (!M) return;
    let html = ''; try { html = result(M); } catch (e) { console.warn('rb result', e); return; }
    const el = ensure(); resOn = true; preOff(); el.classList.add('rb-resmode'); el.hidden = false; const bk = $id('rbBack'); if (bk) bk.hidden = true;
    $id('rbName').textContent = M.name; $id('rbBank').textContent = money(M.bank); $id('rbRing').innerHTML = ring(M.pct, M.v.lv, 30);
    $id('rbMain').innerHTML = `<section class="rb-scr">${html}</section>`;
    // press the overlay's own button; if it isn't there or can't be pressed, step aside and leave the game's overlay in charge
    const press = id => { const b = $id(id); endResult(); if (b && !b.disabled && b.offsetParent !== null) b.click(); };
    $id('rbRGo').onclick = () => press('c3rwGo');
    const k = $id('rbRKeep'); if (k) k.onclick = () => press('c3rwKeep');
    /* Director 05 #8: no "Full match stats" link: it closed the reward and showed the old Match result screen; the Result already carries the averages, checkout, 180s / best visit and high out */
    const ov = $id('c3rw');
    // one observer each, always disconnected in endResult: the overlay closing by any other route, or anything new opening on top of the page, hands control back to the game
    resMO = new MutationObserver(() => { if (ov.hidden || !document.body.contains(ov)) endResult(); }); resMO.observe(ov, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] });
    bodyMO = new MutationObserver(() => { if (blocker()) { const keep = pre0; endResult(); pre0 = keep; waitBack(); } }); bodyMO.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'style'] });   // a sheet appended or an existing one shown
  }
  /* Q&D R1-1: a game sheet (the card pack) opened over the Result; when it closes and the reward overlay is still up, the Result comes back */
  let backMO = null;
  function waitBack() { if (backMO) backMO.disconnect(); backMO = new MutationObserver(() => { const ov = $id('c3rw'); if (!ov || ov.hidden || !document.body.contains(ov) || !pre0) { backMO.disconnect(); backMO = null; return; } if (!blocker()) { backMO.disconnect(); backMO = null; showResult(); } }); backMO.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'style'] }); }
  function endResult() { if (window.TOPS_RB_DEBUG && resOn) console.log('rb endResult', new Error().stack.split('\n').slice(2, 5).join(' | ')); if (resMO) { resMO.disconnect(); resMO = null; } if (bodyMO) { bodyMO.disconnect(); bodyMO = null; } const was = resOn; resOn = false; pre0 = was ? null : pre0; const el = $id('rbApp'); if (el && was) { el.classList.remove('rb-resmode'); el.hidden = true; } }

  /* ---------- Practice (live data; Start calls the game's own startDrill) ---------- */
  function practice(M) {
    const c = M.c, rew = (() => { try { return drillRewardOpen(c); } catch (e) { return false; } })();
    const hero = `<div class="rb-hero" style="height:150px"><div class="rb-im" style="background:url(${sceneImg(c.tier)}) 50% 40%/cover no-repeat"></div><div class="rb-sh2" style="background:linear-gradient(180deg,rgba(10,12,14,0) 30%,rgba(10,12,14,.9))"></div><div class="rb-tx"><span class="rb-kick">Practice</span><span class="rb-big" style="font-size:32px">Drills</span><div class="rb-chips">${rew ? chip('This week your drill earns XP') : ''}</div></div></div>`;
    const rows = DRILLS.filter(d => !d.soon).map(d => { const sv = save.drills && save.drills[d.id], best = sv && sv.best != null ? d.fmt(sv.best) : null;
      return d.soon ? `<div class="rb-row" style="cursor:default;opacity:.55"><span class="rb-tx"><small>${esc(d.kick)} · soon</small><span class="rb-t2">${esc(d.n)}</span><span class="rb-sub">${esc(d.line)}</span></span></div>`
        : `<button class="rb-row" type="button" data-drill="${d.id}"><span class="rb-tx"><small>${esc(d.kick)}${d.darts ? ' · ' + d.darts + ' darts' : ''}</small><span class="rb-t2">${esc(d.n)}</span><span class="rb-sub">${esc(d.line)}</span>${best ? `<span class="rb-chips">${chip('Best ' + esc(best), 'l')}${chip((sv.runs || 0) + ' run' + (sv.runs === 1 ? '' : 's'), 'l')}</span>` : ''}</span><span class="rb-chev">›</span></button>`; }).join('');
    return hero + rows;
  }
  // Walk on mirrors the game's two-tap state; kept at module level so a re-render can't lose it
  let armT = 0, goBusy = 0;
  function armSync() { const g = $id('c3Go'), go = $id('rbGo'); const armed = !!(g && g.dataset.arm); if (go) { go.querySelector('b').textContent = armed ? 'Tap again' : 'Walk on'; if (armed) go.querySelector('small').textContent = g.textContent; } return armed && !!go; }

  /* ---------- Trophies (live data from TC_API; the cabinet button opens the game's own 3D cabinet) ---------- */
  function trophies(M) {
    const T = window.TC_API; if (!T || !T.st()) return '';
    const t = T.st(), L = T.D.TROPHIES, won = L.filter(x => t.troph.some(y => y.id === x.id)).length, c = M.c;
    const hero = `<div class="rb-hero" style="height:190px"><div class="rb-im" style="background-image:url(${IMG}trophies.jpg);background-position:50% 50%"></div><div class="rb-sh2" style="background:linear-gradient(180deg,transparent 45%,rgba(10,12,14,.92))"></div><div class="rb-tx"><span class="rb-t1">${won} of ${L.length} titles</span><span class="rb-sub">Win a league or a knockout and the trophy goes in the case</span></div></div>`;
    const rows = L.map((x, i) => { const g = t.troph.find(y => y.id === x.id), n = g ? g.wins.length : 0, last = g && g.wins[g.wins.length - 1];
      return `<div class="rb-row" style="cursor:default${g ? '' : ';opacity:.6'}"><div class="rb-slot rb-sq rb-r8" style="width:52px;background:#0d0f10"><div class="rb-im" style="background-image:url(assets/cards/${x.img}.webp);background-size:contain;${g ? '' : 'filter:grayscale(1) brightness(.5)'}"></div></div><span class="rb-tx"><small>${g ? 'Won' + (n > 1 ? ' ×' + n : '') : i === c.tier ? 'To win · this season' : i < c.tier ? 'Not won' : 'Locked'}</small><span class="rb-t2">${esc(x.n)}</span>${last && last.opp ? `<span class="rb-sub">Final v ${esc(last.opp)}${last.score ? ' · ' + esc(last.score) : ''}</span>` : ''}</span></div>`; }).join('');
    return hero + `<button class="rb-ghost" type="button" id="rbCab" style="align-self:center">Open the trophy cabinet</button>` + rows;
  }
  function wire(M) {
    const go = $id('rbGo'); if (go) {
      armSync();   // a re-render shows the game's current armed state
      go.onclick = () => {
        if (goBusy) return; goBusy = 1; setTimeout(() => { goBusy = 0; }, 450);   // no double fire from a fast double tap
        const g = $id('c3Go'); if (!g) { try { playNext(); } catch (e) {} return; }
        g.click();   // the game's own Walk on: it may ask for a second tap on a big entry
        if (armSync()) { clearInterval(armT); armT = setInterval(() => { if (!armSync()) clearInterval(armT); }, 400); }
      }; }
    const mm = () => { try { moneyMatch(); } catch (e) { console.warn('rb money', e); } };
    const m1 = $id('rbMoney'); if (m1) m1.onclick = mm;
    const m2 = $id('rbMoneyTile'); if (m2) m2.onclick = mm;
    const s = $id('rbSeason'); if (s) s.onclick = () => { tab = 'season'; render(); };
    const nx = $id('rbNext'); if (nx) nx.onclick = () => { tab = 'locker'; lk = 'load'; render(); };
    qa('#rbApp [data-lk]').forEach(b => b.onclick = () => { const k = b.dataset.lk; lk = k; render(); });
    qa('#rbApp [data-st]').forEach(b => b.onclick = () => { try { const g = window.TOPS_spend && TOPS_spend(b.dataset.st); if (g) render(); } catch (e) { console.warn('rb spend', e); } });
    qa('#rbApp [data-bid]').forEach(b => b.onclick = () => { sel = b.dataset.bid; const y = $id('rbThumbs') ? $id('rbThumbs').scrollLeft : 0; render(); const t2 = $id('rbThumbs'); if (t2) t2.scrollLeft = y; });
    const bu = $id('rbBuy'); if (bu) bu.onclick = () => { const r = gameShop(sel, 'buy'); shopMsg = r.ok ? 'Bought and equipped.' : 'The shop said no. Nothing was charged.'; render(); };
    const eqb = $id('rbEquip'); if (eqb) eqb.onclick = () => { const r = gameShop(sel, 'equip'); shopMsg = r.ok ? 'Equipped. You throw it from your next match.' : 'Couldn\'t equip it.'; render(); };
    qa('#rbApp [data-cf]').forEach(b => b.onclick = () => { cardF = b.dataset.cf; render(); });
    const T = window.TC_API;
    const op = $id('rbOpen'); if (op && T) op.onclick = () => { try { T.openPack(T.st().picks.filter(p => p.chosen == null), () => { try { render(); } catch (e) {} }); } catch (e) { console.warn('rb open', e); } };
    const bi = $id('rbBinder'); if (bi && T) bi.onclick = () => { try { T.binder(); } catch (e) { console.warn('rb binder', e); } };
    qa('#rbApp [data-card]').forEach(b => b.onclick = () => { try { T.binder(); } catch (e) {} });
    const lo = $id('rbLoad'); if (lo && T) lo.onclick = () => { close(); const bk = $id('rbBack'); if (bk) bk.hidden = false; try { T.loadout(); } catch (e) { console.warn('rb loadout', e); } };
    qa('#rbApp [data-drill]').forEach(b => b.onclick = () => { try { startDrill(b.dataset.drill); } catch (e) { console.warn('rb drill', e); } });
    const cb = $id('rbCab'); if (cb && window.TC_API) cb.onclick = () => { try { TC_API.cabinet(); } catch (e) { console.warn('rb cabinet', e); } };
    qa('#rbApp [data-go]').forEach(b => b.onclick = () => { const k = b.dataset.go; if (BUILT[k]) { tab = k; render(); } else toOld(k); });
  }
  /* ---------- hooks: show the new look on the career hub, hide it the moment anything else takes the screen ---------- */
  const _sh = window.showHub; window.showHub = showHub = function (t) {
    const r = _sh.apply(this, arguments);
    try { const c = career(), app = $id('rbApp'); if (window.__hubSoft) { /* the game's portrait refresh (tops-avatars, every 2.5 s while models load) re-runs showHub: keep the player's tab and scroll, and stay out of the way of an old screen */ if (app && !app.hidden && !resOn) { const sc = document.querySelector('#rbMain .rb-scr'), y = sc ? sc.scrollTop : 0; render(true); const s2 = document.querySelector('#rbMain .rb-scr'); if (s2) s2.scrollTop = y; } } else if (c && !c.run && (!t || t === 'play')) open('tonight'); else close(); } catch (e) { console.warn('rb hub', e); }
    return r;
  };
  // any other game screen (messages, online lobby, title, creator, the Run's screens, perk, results) takes over from the new look
  const _scr = window.showScreen; window.showScreen = showScreen = function (id) { const r = _scr.apply(this, arguments); try { if (id === 'result' && resOn) return r; /* the reward overlay sits on the result screen: our Result stays over both */ if (id !== 'hub') { if (resOn) endResult(); close(); const b = $id('rbBack'); if (b) b.hidden = true; } } catch (e) { console.warn('rb screen', e); } return r; };
  const _bm = window.beginMatch; window.beginMatch = beginMatch = function () { try { const c = career(), v = C3.V3(); pre0 = c && v && !c.run ? { bank: c.bank, xp: xpTotal(v), lv: v.lv, opPt: (() => { try { const n = c.next || nextOpponent(); return V.portrait((!n.oppName2 && oppLookRb(n)) || oppLookFor(n), n.oppName2 || n.oppName, c.tier, 0); } catch (e) { return ''; } })() } : null; } catch (e) { pre0 = null; } clearInterval(armT); endResult(); close(); const b = $id('rbBack'); if (b) b.hidden = true; return _bm.apply(this, arguments); };
  const _st = window.showTitle; if (_st) window.showTitle = showTitle = function () { close(); const b = $id('rbBack'); if (b) b.hidden = true; return _st.apply(this, arguments); };
  /* Q&D R1-1 / Director 05 #8: in the 0.85 s between match end and the reward, the old Match result screen showed and its Next fixture could be tapped (the pack then opened first and the player got the old reward card). For a career match the old screen stays hidden until the new Result is up (1.6 s at most) */
  let preT = 0; const preOff = () => { clearTimeout(preT); document.documentElement.classList.remove('rb-preres'); };
  if (typeof endMatch === 'function') { const _em = endMatch; window.endMatch = endMatch = function () { const r = _em.apply(this, arguments); try { const c = career(); if (c && !c.run && pre0 && S && !S.practice && !S.local) { document.documentElement.classList.add('rb-preres'); clearTimeout(preT); preT = setTimeout(preOff, 1600); } } catch (e) {} return r; }; }
  const _rw = window.TOPS_REWARD; window.TOPS_REWARD = function (el) { try { if (_rw) _rw(el); } catch (e) {} try { const c = career(); if (c && !c.run) showResult(); } catch (e) { console.warn('rb reward', e); } };
  addEventListener('keydown', e => { if (e.key === 'Escape') { const ms = $id('rbMenuSheet'); if (ms) ms.remove(); } });
  // #22: the match header never says the same word twice ("PRACTICE / PRACTICE" in the lesson)
  try { const et = $id('eventTier'), en = $id('eventName'), lg = $id('lkLeg'); if (et && en) { const tx = e => e && getComputedStyle(e).display !== 'none' ? e.textContent.trim().toLowerCase() : ''; const dd = () => { const t = et.textContent.trim().toLowerCase(); const sameN = !!t && t === en.textContent.trim().toLowerCase(); if (et.hidden !== sameN) et.hidden = sameN; if (lg) { const sameL = !!lg.textContent.trim() && lg.textContent.trim().toLowerCase() === (sameN ? tx(en) : t); if (lg.hidden !== sameL) lg.hidden = sameL; } }; [et, en, lg].forEach(e => e && new MutationObserver(dd).observe(e, { childList: true, characterData: true, subtree: true })); } } catch (e) {}   /* #22: header text only: the lesson's 'PRACTICE / PRACTICE' (tier line and leg line) shows once */
  window.TOPS_RB = { open, close, render, model, showResult };
})();
