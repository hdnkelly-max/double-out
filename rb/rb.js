// TOPS rebrand (EXP-REBRAND) · the new menu set, behind one switch.
// ?rebrand=1 turns it on for this device (remembered), ?rebrand=0 turns it off. Off = this file installs nothing.
// Rule: the new screens only PRESENT the game. Every action calls the game's own function or button
// (Walk on → the hub's #c3Go / playNext path, money match → moneyMatch()), so the match lifecycle, money and saves stay the game's.
(function () {
  const ON = (() => { try { const q = new URLSearchParams(location.search); if (q.has('rebrand')) localStorage.setItem('tops_rebrand', q.get('rebrand') === '1' ? '1' : '0'); return localStorage.getItem('tops_rebrand') === '1'; } catch (e) { return false; } })();
  window.TOPS_REBRAND = ON;
  if (!ON) return;
  const $id = id => document.getElementById(id), qa = (s, r) => [...(r || document).querySelectorAll(s)];
  const IMG = 'assets/rb/';   // review build: images on main under assets/rb (Shipping copies them from exp-rebrand-assets)
  const IC = {
    cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 6l6 8H6z"/></svg>'
  };
  // opponents with a generated photo (one consistent set); everyone else gets the tier's empty venue and their face in the head-to-head
  const OPP_PHOTO = { 'Big Mal': 'opp_bigmal.jpg' };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* ---------- components (same as the v9.1 prototype) ---------- */
  const chip = (t, c = '') => `<span class="rb-chip ${c ? 'rb-' + c : ''}">${t}</span>`;
  const meter = (n, fill, o = {}) => { let h = ''; for (let i = 0; i < n; i++) { const c = i < fill ? 'rb-f' : i < fill + (o.ghost || 0) ? 'rb-gh' : ''; h += `<i class="${c}"></i>`; } return `<div class="rb-meter" aria-hidden="true">${h}${o.tick != null ? `<span class="rb-mtk" style="left:calc(${o.tick * 100}% - 1px)"></span>` : ''}</div>`; };
  const ring = (pct, lv, sz = 64, lab = 'LEVEL') => { const r = sz / 2 - 4, c = 2 * Math.PI * r, w = sz > 40 ? 6 : 3; return `<svg viewBox="0 0 ${sz} ${sz}"><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="#2b3135" stroke-width="${w}"/><circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="#7fd19a" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${c * Math.max(0, Math.min(1, pct))} ${c}"/></svg><b style="${sz < 40 ? 'font-size:13px' : ''}">${lv}</b>${sz > 40 ? `<small>${lab}</small>` : ''}`; };
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
  const BUILT = { tonight: 1, season: 1, locker: 1, shop: 1 };   // until each new screen lands, the tab opens the old one
  let tab = 'tonight', lk = 'load', sel = null, shopMsg = '', cardF = 'all';
  function ensure() {
    let el = $id('rbApp'); if (el) return el;
    el = document.createElement('div'); el.id = 'rbApp'; el.hidden = true;
    el.innerHTML = `<header class="rb-hd"><span class="rb-wm">TOPS</span><button class="rb-me" type="button" id="rbMe" aria-label="Your level, open Locker"><span class="rb-face" id="rbFace" style="width:30px;height:30px;flex-basis:30px"></span><span class="rb-nm" id="rbName"></span><span class="rb-ring" id="rbRing" style="width:30px;height:30px;flex-basis:30px"></span></button><span class="rb-bank rb-num" id="rbBank"></span><button class="rb-ib" type="button" id="rbMenu" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></header><nav class="rb-tabs" id="rbTabs" role="tablist"></nav><main id="rbMain" style="flex:1;display:flex;flex-direction:column;min-height:0"></main>`;
    document.body.appendChild(el);
    const back = document.createElement('button'); back.id = 'rbBack'; back.type = 'button'; back.hidden = true; back.textContent = 'New look ›'; back.onclick = () => open('tonight'); document.body.appendChild(back);
    el.querySelector('#rbMe').onclick = () => { tab = 'locker'; lk = 'load'; render(); };
    el.querySelector('#rbMenu').onclick = () => { close(); try { showTitle(); } catch (e) {} };
    return el;
  }
  function open(t) { const el = ensure(); tab = t || tab; el.hidden = false; $id('rbBack').hidden = true; render(); }
  function close() { const el = $id('rbApp'); if (el) el.hidden = true; }
  function toOld(t) { close(); const b = $id('rbBack'); if (b) b.hidden = false; try { hubTab(OLD[t] || 'play'); } catch (e) { console.warn('rb old tab', e); } }
  function render() {
    const M = model(); if (!M) { close(); return; }
    $id('rbName').textContent = M.name; $id('rbBank').textContent = money(M.bank); $id('rbRing').innerHTML = ring(M.pct, M.v.lv, 30);
    try { const p = V.portrait(save.look, save.name, M.c.tier, 0); if (p) $id('rbFace').style.backgroundImage = `url(${p})`; } catch (e) {}
    $id('rbTabs').innerHTML = TABS.map(([k, n]) => `<button role="tab" data-t="${k}" aria-selected="${k === tab}">${n}</button>`).join('');
    qa('#rbTabs button').forEach(b => b.onclick = () => { const k = b.dataset.t; if (BUILT[k]) { tab = k; render(); const sc = document.querySelector('#rbMain .rb-scr'); if (sc) sc.scrollTop = 0; } else toOld(k); });
    let html = ''; try { html = tab === 'season' ? season(M) : tab === 'locker' ? locker(M) : tab === 'shop' ? shop(M) : tonight(M); } catch (e) { console.warn('rb tonight', e); close(); return; }
    $id('rbMain').innerHTML = `<section class="rb-scr">${html}</section>`; wire(M);
  }
  /* ---------- Tonight (live data) ---------- */
  function tonight(M) {
    const { c, t, sn, n, rows, yi } = M;
    const oppPt = (() => { try { return V.portrait(oppLookFor(n), n.oppName2 || n.oppName, c.tier, 0); } catch (e) { return ''; } })();
    const mePt = (() => { try { return V.portrait(save.look, save.name, c.tier, 0); } catch (e) { return ''; } })();
    const wk = sn ? Math.min(sn.week, sn.len) : 1, kick = sn && !sn.ko ? `${t.n} · week ${wk} of ${sn.len}` : sn && sn.ko ? `${t.n} · round ${wk} of ${sn.len}` : t.n;
    const cost = (c.run || n.intro) ? { fee: 0, trav: 0 } : { fee: FIXPAY[c.tier][2], trav: c.travelCredit > 0 ? 0 : ((typeof TRAVEL !== 'undefined' && TRAVEL[c.tier]) || 0) },   /* same as career3 fixtureCost */ tot = cost.fee + cost.trav, short = tot > c.bank;
    const fp = FIXPAY[c.tier], winTxt = n.intro ? 'a place in the team' : sn && sn.ko ? 'the next round' : `+2 pts · ${money(fp[0] + fp[3])}`;
    const hero = `<div class="rb-hero" style="height:262px"><div class="rb-im" style="background-image:${OPP_PHOTO[n.oppName] ? `url(${IMG}${OPP_PHOTO[n.oppName]})` : `url(${IMG}venue_t${c.tier}.jpg)`};background-position:${OPP_PHOTO[n.oppName] ? '72% 28%' : '60% 40%'}"></div><div class="rb-sh2" style="background:linear-gradient(180deg,rgba(10,12,14,0) 36%,rgba(10,12,14,.7) 64%,rgba(10,12,14,.96) 100%),linear-gradient(90deg,rgba(10,12,14,.55) 0,rgba(10,12,14,0) 48%)"></div><div class="rb-tx"><span class="rb-kick">${esc(kick)}</span><span class="rb-big" style="font-size:40px">vs ${esc(n.oppName)}</span><div class="rb-chips">${chip('Win: ' + esc(winTxt), 'l')}</div></div></div>`;
    const me = M.form, op = n.oppAvg, tot2 = (me || op) + op;
    const h2h = `<div class="rb-card" style="gap:8px"><div class="rb-h2h"><span class="rb-face" style="${mePt ? `background-image:url(${mePt})` : 'background:#2b3135'}"></span><div class="rb-vs2"><div class="rb-nums"><b class="rb-num">${me != null ? me : '–'}</b><span>${me != null ? 'Average · recent' : 'Your first match'}</span><b class="rb-num">${op}</b></div><div class="rb-tug"><i class="rb-a" style="width:${(me || op) / tot2 * 100}%"></i><i class="rb-b" style="width:${op / tot2 * 100}%"></i></div></div><span class="rb-face" style="${oppPt ? `background-image:url(${oppPt})` : 'background:#2b3135'}"></span></div><div class="rb-sub" style="text-align:center">${me != null ? `You ${me} (last ${(c.tierAvgs || []).length})` : 'Your first match'} · Him ${op} · Best of ${n.legs}</div></div>`;
    const cta = short
      ? `<div class="rb-card"><div class="rb-lock"><span class="rb-ic">${IC.cash}</span><div style="flex:1;display:flex;flex-direction:column;gap:6px"><span class="rb-t2">${money(tot - c.bank)} short of the ${money(tot)} entry</span><div class="rb-chips">${chip('Entry ' + money(tot))}${chip('You have ' + money(c.bank), 'l')}</div></div></div><div class="rb-bar"><i style="width:${Math.min(100, c.bank / tot * 100)}%"></i></div></div><button class="rb-primary" type="button" id="rbMoney"><b>Play the money match</b><small>Back room · best of 1</small></button>`
      : `<button class="rb-primary" type="button" id="rbGo"><b>Walk on</b><small>${tot ? `Entry ${money(tot)} · leaves ${money(c.bank - tot)}` : 'Free entry'}</small></button>`;
    let season = '';
    if (rows && yi >= 0) { const gap = yi <= 1 ? 0 : rows[1].pts - rows[yi].pts; season = `<button class="rb-row" type="button" id="rbSeason"><span class="rb-tx"><small>Season · week ${wk} of ${sn.len}</small><span class="rb-t2">${ord(yi + 1)}${yi <= 1 ? ' · promotion places' : ` · ${gap} pt${gap === 1 ? '' : 's'} off 2nd`}</span></span><span class="rb-pos" aria-hidden="true">${rows.slice(0, 5).map((r, i) => `${i === 2 ? '<span class="rb-cut"></span>' : ''}<i class="${r.you ? 'rb-me' : i < 2 ? 'rb-up' : ''}">${i + 1}</i>`).join('')}</span><span class="rb-chev">›</span></button>`; }
    const used = !!(sn && sn.side), nd = nextDart(M.v.lv);
    const side = n.intro ? '' : `<div class="rb-g2"><button class="rb-card" type="button" id="rbMoneyTile" ${used ? 'disabled' : ''} style="padding:0;gap:0;overflow:hidden"><div class="rb-slot rb-wide"><div class="rb-im" style="background-image:url(${IMG}backroom.jpg);background-position:70% 50%"></div></div><div style="padding:10px 12px 12px;display:flex;flex-direction:column;gap:6px"><span class="rb-t1" style="font-size:19px">Money match</span><span class="rb-sub" style="font-size:12.5px">${used ? 'Used this week' : 'Back room · best of 1'}</span><div class="rb-chips">${chip(IC.cash + ' Win ' + money(MM_PAY[c.tier] || 30), 'g')}</div></div></button>
      <button class="rb-card" type="button" id="rbNext" style="padding:0;gap:0;overflow:hidden"><div class="rb-slot rb-wide" style="background:var(--dartbg)"><div class="rb-im" style="background-image:url(${nd ? dartImg(nd.b, 'ds') : IMG + 'dw_razor.jpg'});${nd ? 'background-size:92% auto' : ''}"></div></div><div style="padding:10px 12px 12px;display:flex;flex-direction:column;gap:6px"><span class="rb-t1" style="font-size:19px">${nd ? esc(nd.b.n.replace(/ \d+g$/, '').replace(/^(Harrows|Red Dragon|Target|Shot|Winmau|Unicorn) /, '')) : 'Next level'}</span><span class="rb-sub" style="font-size:12.5px">${nd ? 'Unlocks at level ' + nd.lv : 'Level ' + (M.v.lv + 1)}</span><div class="rb-mlab"><span>Lv ${M.v.lv}</span><span>${M.v.xp} / ${M.need} XP</span></div>${meter(10, Math.round(M.pct * 10))}</div></button></div>`;
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
    else { const gap = yi <= 1 ? 0 : rows[1].pts - rows[yi].pts; head = `<div class="rb-card" style="flex-direction:row;align-items:center;gap:14px"><div class="rb-ring">${ring(wk / sn.len, wk, 64, 'WEEK')}</div><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px"><span class="rb-t1">${yi >= 0 ? ord(yi + 1) + ' · ' : ''}${esc(t.n)}</span><span class="rb-sub">${yi <= 1 ? 'In the promotion places' : gap + ' pt' + (gap === 1 ? '' : 's') + ' off 2nd'} · ${left} week${left === 1 ? '' : 's'} left</span><div class="rb-chips">${chip(IC.up + ' Top two go up', 'g')}</div></div></div>`; }
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
    const t = M.t, title = v.title || '', nd = nextDart(v.lv);
    const hero = `<div class="rb-hero" style="height:150px"><div class="rb-im" style="background-image:url(${IMG}locker.jpg);background-position:78% 32%"></div><div class="rb-sh2" style="background:linear-gradient(90deg,rgba(10,12,14,.9) 0,rgba(10,12,14,.2) 70%)"></div><div class="rb-tx" style="right:42%"><span class="rb-big" style="font-size:32px">${esc(M.name)}</span><span class="rb-sub">${title ? esc(title) + ' · ' : ''}${esc(t.n)}</span></div></div>`;
    const lvl = `<div class="rb-card" style="flex-direction:row;align-items:center;gap:14px"><div class="rb-ring">${ring(M.pct, v.lv)}</div><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px"><span class="rb-t2">${M.need - v.xp} XP to level ${v.lv + 1}</span>${nd ? `<div style="display:flex;align-items:center;gap:8px"><div class="rb-slot rb-dart rb-r8" style="width:84px;flex:0 0 84px"><div class="rb-im" style="background-image:url(${dartImg(nd.b, 'ds')})"></div></div><span class="rb-sub" style="font-size:12.5px">${nd.lv === v.lv + 1 ? 'Next level' : 'Level ' + nd.lv}: ${esc(nd.b.n.replace(/ \d+g$/, ''))} unlocks</span></div>` : ''}</div></div>`;
    let game = '';
    const A = window.TOPS_ST2_API, st = window.TOPS_st && TOPS_st();
    if (A && st && window.TOPS_ST2 && TOPS_ST2()) {
      const kp = A.kitPts(), cap = Math.min(85, A.capNow()), seg10 = x => Math.round(Math.max(0, Math.min(cap, x)) / cap * 10);
      const rows = A.STATS.map(x => { const me = st.v[x.id], k = kp[x.id] || 0, f = seg10(me), g = Math.max(0, seg10(me + k) - f); return `<div class="rb-stt"><span>${esc(x.n)}</span>${meter(10, f, { ghost: g })}<b>${me + k}</b><button class="rb-plus" type="button" data-st="${x.id}" aria-label="Add a point to ${esc(x.n)}" ${st.bank > 0 && me < cap ? '' : 'disabled'}>+</button></div>`; }).join('');
      game = `<div class="rb-card">${sh('Your game')}${st.bank > 0 ? `<div class="rb-chips">${chip(st.bank + ' point' + (st.bank > 1 ? 's' : '') + ' to spend · tap +', 'g')}</div>` : ''}${rows}<div class="rb-mlab"><span><span class="rb-key rb-kf"></span>You</span><span><span class="rb-key rb-kg"></span>From your kit</span><span>Cap ${cap} at ${esc(t.n.replace(/ singles| league/i, ''))}</span></div></div>`;
    }
    const b = barrel(), shirt = (save.look && save.look.shirt) || '';
    const kit = `<div class="rb-sh" style="margin-top:2px"><h3>Kit</h3></div><div class="rb-g2"><button class="rb-card" type="button" data-go="shop" style="padding:0;gap:0;overflow:hidden"><div class="rb-slot rb-sq"><div class="rb-im" style="background-image:url(${dartImg(b, 'dsq')});${DART_PHOTO[b.id] ? '' : 'background-size:contain'}"></div><span class="rb-chip" style="position:absolute;left:8px;top:8px">Equipped</span></div><div style="padding:10px 12px 12px;display:flex;flex-direction:column;gap:2px"><small class="rb-kick" style="font-size:11px">Darts</small><span class="rb-t2" style="font-size:14px">${esc(b.n)}</span><span class="rb-sub" style="font-size:12.5px">Change in Shop ›</span></div></button><div class="rb-card" style="padding:0;gap:0;overflow:hidden"><div class="rb-slot rb-sq"><div class="rb-im" style="background-image:${shirt ? `linear-gradient(${shirt},${shirt}),` : ''}url(${IMG}shirt.jpg);${shirt ? 'background-blend-mode:color,normal' : ''}"></div><span class="rb-chip" style="position:absolute;left:8px;top:8px">Wearing</span></div><div style="padding:10px 12px 12px;display:flex;flex-direction:column;gap:2px"><small class="rb-kick" style="font-size:11px">Shirt</small><span class="rb-t2" style="font-size:14px">Your colours</span><span class="rb-sub" style="font-size:12.5px">New ones every 5 levels</span></div></div></div>`;
    return seg + hero + lvl + game + kit;
  }
  function stats(M) {
    const { c } = M, b = c.best || {}, played = (c.wins || 0) + (c.losses || 0), avg = c.darts ? c.pts / c.darts * 3 : 0, A = c.tierAvgs || [];
    if (!played) return `<div class="rb-card"><span class="rb-t2">Your numbers start here</span><span class="rb-sub">Play your first fixture to record an average, high finish and best visit.</span></div>`;
    const tl = (k, v, s) => `<div class="rb-tl"><small>${k}</small><b class="rb-num">${v}</b><span class="rb-sub">${s}</span></div>`;
    const tiles = `<div class="rb-tile4">${tl('Average', avg.toFixed(1), 'Career · ' + played + ' match' + (played === 1 ? '' : 'es'))}${tl('Record', `${c.wins}–${c.losses}`, (c.streak || 0) + ' in a row now')}${tl('180s', c.t180 || 0, 'Best visit ' + (b.visit || '–'))}${tl('Best leg', b.leg < 99 ? b.leg : '–', b.leg < 99 ? 'darts' : 'not yet')}</div>`;
    let form = '';
    if (A.length >= 2) { const w = 320, h = 80, lo = Math.min(...A, avg) - 5, hi = Math.max(...A, avg) + 5, xs = i => 16 + i * ((w - 32) / (A.length - 1)), ys = x => 4 + h - (x - lo) / (hi - lo) * h;
      form = `<div class="rb-card">${sh('Form · last ' + A.length + ' matches')}<svg viewBox="0 0 ${w} ${h + 8}" style="width:100%;height:auto" role="img" aria-label="Match averages ${A.join(', ')}"><line x1="0" x2="${w}" y1="${ys(avg)}" y2="${ys(avg)}" stroke="#7fd19a" stroke-dasharray="4 4" opacity=".7"/><polyline fill="none" stroke="#f3f4f2" stroke-width="2.5" stroke-linejoin="round" points="${A.map((x, i) => xs(i) + ',' + ys(x)).join(' ')}"/>${A.map((x, i) => `<circle cx="${xs(i)}" cy="${ys(x)}" r="${i === A.length - 1 ? 5 : 3}" fill="${i === A.length - 1 ? '#7fd19a' : '#f3f4f2'}"/><text x="${xs(i)}" y="${ys(x) - 9}" fill="#aeb4b1" font-size="11" text-anchor="middle">${x}</text>`).join('')}</svg><div class="rb-mlab"><span>Oldest</span><span style="color:var(--good)">- - ${avg.toFixed(1)} career</span><span>Last match</span></div></div>`; }
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
    const cmp = st.eq ? `<div class="rb-card">${sh('Equipped now')}<span class="rb-sub">This is the dart you throw. Pick another to compare.</span></div>` : `<div class="rb-card">${sh('vs your ' + esc(mine.n.replace(/ \d+g$/, '')))}<div class="rb-mlab"><span><span class="rb-key" style="background:#4a5156"></span>Yours</span><span><span class="rb-key rb-kf"></span>This dart</span></div>${['sc', 'fi', 'ct', 'rh'].map(bars).join('')}<span class="rb-sub" style="font-size:12px">Stat points the dart adds on top of yours.</span></div>`;
    let act = '';
    if (st.eq) act = '';
    else if (st.own) act = `<button class="rb-primary" type="button" id="rbEquip"><b>Equip</b><small>Throw with it from your next match</small></button>`;
    else if (st.sp) act = `<div class="rb-card"><div class="rb-lock"><span class="rb-ic">${IC.lock}</span><div style="flex:1"><span class="rb-t2">Comes with a sponsor deal</span><div class="rb-sub">Not sold. Sponsors offer their set as you climb.</div></div></div></div>`;
    else if (st.lockLv || st.res) { const lv = M.v.lv, need = st.lockLv || (st.g && st.g.lv) || lv; act = `<div class="rb-card"><div class="rb-lock"><span class="rb-ic">${IC.lock}</span><div style="flex:1;display:flex;flex-direction:column;gap:6px"><span class="rb-t2">${st.res ? 'Reserved for you · back at level ' + need : 'Unlocks at level ' + need}</span><div class="rb-chips">${chip('Level ' + need)}${chip(money(st.cost))}</div></div></div><div class="rb-mlab"><span>You · level ${lv}</span><span>${Math.max(0, need - lv)} level${need - lv === 1 ? '' : 's'} to go</span></div>${meter(10, Math.round(Math.min(1, lv / need) * 10))}<button class="rb-link" type="button" data-go="tonight" style="align-self:flex-start;min-height:44px">Play to level up ›</button></div>`; }
    else if (c.bank < st.cost) act = `<div class="rb-card"><div class="rb-lock"><span class="rb-ic">${IC.cash}</span><div style="flex:1;display:flex;flex-direction:column;gap:6px"><span class="rb-t2">${money(st.cost - c.bank)} to go</span><div class="rb-chips">${chip('Price ' + money(st.cost))}${chip('You have ' + money(c.bank), 'l')}</div></div></div><div class="rb-bar"><i style="width:${Math.min(100, c.bank / st.cost * 100)}%"></i></div></div>`;
    else act = `<button class="rb-primary" type="button" id="rbBuy"><b>Buy · ${money(st.cost)}</b><small>${money(c.bank)} → ${money(c.bank - st.cost)}</small></button>`;
    const msg = shopMsg ? `<div class="rb-card" role="status" style="padding:10px 14px"><span class="rb-sub">${esc(shopMsg)}</span></div>` : ''; shopMsg = '';
    const th = BARRELS.map(x => { const s2 = dState(x), lk = !s2.own && (s2.lockLv || s2.sp || s2.res); return `<button class="rb-th ${lk ? 'rb-lk' : ''}" type="button" data-bid="${x.id}" aria-pressed="${x.id === b.id}" aria-label="${esc(x.n)}"><div class="rb-slot rb-dart rb-r8"><div class="rb-im" style="background-image:url(${dartImg(x, 'ds')})"></div></div><small>${s2.eq ? '● Equipped' : s2.own ? '✓ Owned' : s2.sp ? 'Sponsor' : s2.lockLv ? IC.lock + ' Lv ' + s2.lockLv : money(s2.cost)}</small></button>`; }).join('');
    return seg + hero + cmp + act + msg + `<div class="rb-card" style="padding:12px 0 12px 12px">${sh('All darts')}<div class="rb-thumbs" id="rbThumbs">${th}</div></div>`;
  }
  // press the game's own shop control for this dart; returns what changed
  function gameShop(id, kind) {
    const before = { bank: career().bank, owned: (save.owned || []).length, eq: save.barrel };
    try { showShop('barrel', true); } catch (e) { console.warn('rb showShop', e); }
    const row = document.querySelector(`#shopList .opt[data-v12id="${id}"]`);
    if (row) { if (kind === 'buy') { const btn = row.querySelector('.v12buy'); if (btn) btn.click(); } else { row.click(); const go = row.nextElementSibling && row.nextElementSibling.querySelector('.st2go'); if (save.barrel === before.eq && go) go.click(); } }   // with stats on, the row opens the game's detail and its Equip button does the equip
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
  function wire(M) {
    const go = $id('rbGo'); if (go) go.onclick = () => {
      const g = $id('c3Go'); if (!g) { try { playNext(); } catch (e) {} return; }
      g.click();   // the game's own Walk on: it may ask for a second tap on a big entry
      if (g.dataset.arm) { go.querySelector('small').textContent = g.textContent; go.querySelector('b').textContent = 'Tap again'; setTimeout(() => { try { render(); } catch (e) {} }, 3000); }
    };
    const mm = () => { try { moneyMatch(); } catch (e) { console.warn('rb money', e); } };
    const m1 = $id('rbMoney'); if (m1) m1.onclick = mm;
    const m2 = $id('rbMoneyTile'); if (m2) m2.onclick = mm;
    const s = $id('rbSeason'); if (s) s.onclick = () => { tab = 'season'; render(); };
    const nx = $id('rbNext'); if (nx) nx.onclick = () => { tab = 'locker'; lk = 'load'; render(); };
    qa('#rbApp [data-lk]').forEach(b => b.onclick = () => { const k = b.dataset.lk; if (k === 'troph') { toOld('locker'); return; } lk = k; render(); });
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
    qa('#rbApp [data-go]').forEach(b => b.onclick = () => { const k = b.dataset.go; if (BUILT[k]) { tab = k; render(); } else toOld(k); });
  }
  /* ---------- hooks: show the new look on the career hub, hide it the moment anything else takes the screen ---------- */
  const _sh = window.showHub; window.showHub = showHub = function (t) {
    const r = _sh.apply(this, arguments);
    try { const c = career(); if (c && !c.run && (!t || t === 'play')) open('tonight'); else close(); } catch (e) { console.warn('rb hub', e); }
    return r;
  };
  const _bm = window.beginMatch; window.beginMatch = beginMatch = function () { close(); const b = $id('rbBack'); if (b) b.hidden = true; return _bm.apply(this, arguments); };
  const _st = window.showTitle; if (_st) window.showTitle = showTitle = function () { close(); const b = $id('rbBack'); if (b) b.hidden = true; return _st.apply(this, arguments); };
  window.TOPS_RB = { open, close, render, model };
})();
