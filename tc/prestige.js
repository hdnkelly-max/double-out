/* CAR-PRESTIGE (Producer 21 Nov 22:43, agreed with ChatGPT): prestige-only spends. Money never buys stats.
   Gear first. A title at a level unlocks that level's premium edition (the trophy on the shelf is the free proof); buying the edition is a
   cosmetic, one-off spend that never takes the bank below the next entry fee. This file: the catalogue and the dart art.
   The dart parts only change how your own darts look: the flight SHAPE, shaft length, barrel and point (and every throw number) stay the ones
   you have equipped. game4's makeDart asks TOPS_GEAR() for {flight: canvas painter, shaft: colour, barrel: finish} on your own darts only. */
(function () {
  const ED = [
    { id: 'pub',    lv: 0, n: 'Kauri Arms flights',         price: 250,   parts: ['flight'] },
    { id: 'club',   lv: 1, n: 'Club shirt',                 price: 750,   parts: ['shirt'] },
    { id: 'opens',  lv: 2, n: 'Opens crest shirt',          price: 2000,  parts: ['shirt'] },
    { id: 'dpnz',   lv: 3, n: 'DPNZ fern darts',            price: 5000,  parts: ['flight', 'shaft', 'barrel'] },
    { id: 'tt',     lv: 4, n: 'Trans-Tasman kit',           price: 9000,  parts: ['flight', 'shaft', 'shirt'] },
    { id: 'card',   lv: 5, n: 'Tour Card signature darts',  price: 15000, parts: ['flight', 'shaft', 'barrel'] },
    { id: 'worlds', lv: 6, n: 'Worlds gold edition',        price: 25000, parts: ['flight', 'shaft', 'barrel'] }
  ];
  // flight art: the flight texture is a 256 px square laid over the whole flight (game4 flightTex scale), so big shapes, high contrast
  const FONT = '"Saira Condensed","Arial Narrow",Arial,sans-serif';
  function fern(x, cx, cy, s, col) {   // a silver fern frond: a curved stem with tapering leaflets
    x.save(); x.translate(cx, cy); x.rotate(-Math.PI / 4); x.fillStyle = col; x.strokeStyle = col; x.lineCap = 'round';
    x.lineWidth = 7 * s; x.beginPath(); x.moveTo(0, 95 * s); x.quadraticCurveTo(6 * s, 0, 0, -100 * s); x.stroke();
    for (let i = 0; i < 11; i++) { const t = i / 11, y = 85 * s - t * 180 * s, L = (1 - t * .85) * 52 * s;
      for (const d of [-1, 1]) { x.beginPath(); x.moveTo(0, y); x.quadraticCurveTo(d * L * .6, y - 6 * s, d * L, y - 20 * s); x.quadraticCurveTo(d * L * .55, y - 2 * s, 0, y + 9 * s); x.fill(); } }
    x.restore(); }
  function paint(id, name) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    if (id === 'pub') {   // warm rimu wood with the pub's name, the Kauri Arms colours
      x.fillStyle = '#7a4a22'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(${i % 2 ? '40,20,8' : '160,100,50'},.28)`; x.lineWidth = 3 + (i % 3); x.beginPath(); x.moveTo(-20, i * 11); x.bezierCurveTo(80, i * 11 + 14, 170, i * 11 - 12, 280, i * 11 + 6); x.stroke(); }
      x.fillStyle = '#f2e2b8'; x.font = `800 46px ${FONT}`; x.textAlign = 'center'; x.save(); x.translate(140, 140); x.rotate(-Math.PI / 4); x.fillText('KAURI', 0, -6); x.fillText('ARMS', 0, 40); x.restore();
      x.strokeStyle = '#f2e2b8'; x.lineWidth = 8; x.strokeRect(4, 4, 248, 248); }
    else if (id === 'dpnz') { x.fillStyle = '#0d0e10'; x.fillRect(0, 0, 256, 256); fern(x, 140, 140, 1.15, '#d8dde2'); x.strokeStyle = '#d8dde2'; x.lineWidth = 6; x.strokeRect(3, 3, 250, 250); }
    else if (id === 'tt') {   // half NZ black, half Aussie green and gold, split along the flight
      x.fillStyle = '#0d0e10'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#0f6b3a'; x.beginPath(); x.moveTo(256, 0); x.lineTo(256, 256); x.lineTo(0, 256); x.closePath(); x.fill();
      x.strokeStyle = '#f2c230'; x.lineWidth = 16; x.beginPath(); x.moveTo(256, 0); x.lineTo(0, 256); x.stroke(); fern(x, 96, 96, .55, '#d8dde2');
      x.fillStyle = '#f2c230'; x.font = `800 40px ${FONT}`; x.textAlign = 'center'; x.save(); x.translate(176, 176); x.rotate(-Math.PI / 4); x.fillText('TT', 0, 14); x.restore(); }
    else if (id === 'card') {   // tour white with your signature in black ink
      x.fillStyle = '#f4f4f1'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#c9ccd0'; x.fillRect(0, 0, 256, 18);
      x.fillStyle = '#121316'; x.font = `italic 700 ${Math.max(34, 70 - (name || 'You').length * 3)}px "Brush Script MT","Segoe Script",cursive`; x.textAlign = 'center';
      x.save(); x.translate(132, 136); x.rotate(-Math.PI / 4); x.fillText(name || 'You', 0, 12); x.lineWidth = 4; x.strokeStyle = '#121316'; x.beginPath(); x.moveTo(-70, 30); x.quadraticCurveTo(10, 46, 82, 22); x.stroke(); x.restore(); }
    else if (id === 'worlds') {   // gold leaf with a black crown band
      const g = x.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, '#8a6a22'); g.addColorStop(.45, '#f3d27a'); g.addColorStop(.55, '#e2b64a'); g.addColorStop(1, '#7a5a1a'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      x.fillStyle = '#111'; x.beginPath(); x.moveTo(256, 60); x.lineTo(256, 112); x.lineTo(112, 256); x.lineTo(60, 256); x.closePath(); x.fill();
      x.fillStyle = '#111'; x.font = `800 34px ${FONT}`; x.textAlign = 'center'; x.save(); x.translate(110, 110); x.rotate(-Math.PI / 4); x.fillText('WORLD', 0, -4); x.fillText('CHAMPION', 0, 28); x.restore(); }
    else return null;
    return c; }
  const PARTS = {   // shaft colour and barrel finish per edition (the flight is painted above)
    pub:    {},
    dpnz:   { shaft: 0x0d0e10, barrel: { col: 0x2a2d31, met: .9, rough: .28, band: 0xd8dde2 } },
    tt:     { shaft: 0xf2c230 },
    card:   { shaft: 0xf4f4f1, barrel: { col: 0xb9c0c6, met: .95, rough: .18, band: 0x121316 } },
    worlds: { shaft: 0xd9b24a, barrel: { col: 0xd4a63c, met: .95, rough: .2, band: 0x111111 } }
  };
  const CACHE = {};
  // which edition your darts wear: TOPS_GEAR_PREVIEW (captures) or the equipped one on the career
  function equipped() { try { if (window.TOPS_GEAR_PREVIEW) return window.TOPS_GEAR_PREVIEW; const c = career(), g = c && c.prestige; return g && g.eq && g.eq.darts || null; } catch (e) { return null; } }
  window.TOPS_GEAR = function () { const id = equipped(); if (!id || !PARTS[id]) return null; const nm = (typeof save !== 'undefined' && save.name) || 'You';
    const key = id + '|' + nm; if (!CACHE[key]) CACHE[key] = paint(id, nm); return Object.assign({ id, flight: CACHE[key] }, PARTS[id]); };
  /* gear cam (Producer 07:03): on your 180s, the match-winning double and any nine-darter, a ~1.2 s still close-up of your three darts in the
     board over the board pane. Tap skips. Never on ordinary visits; the match carries on underneath (turn timing and throw numbers unchanged).
     Behind TOPS_GEARCAM (?gearcam=1 sticks, ?gearcam=0 off) until it ships. */
  window.TOPS_GEARCAM = (() => { try { const q = new URLSearchParams(location.search).get('gearcam'); if (q === '1' || q === '0') localStorage.setItem('tops_gearcam', q); return localStorage.getItem('tops_gearcam') === '1'; } catch (e) { return false; } })();
  const GC_MS = 1200, LAB = { '180': 'ONE HUNDRED AND EIGHTY', match: 'GAME SHOT AND THE MATCH', nine: 'NINE-DARTER' };
  function pane() {   // the board pane: under the match header, down to where the pull pad starts (or the board's bottom edge)
    let top = 0, bot = 0; try { const m = document.getElementById('btnMenu').getBoundingClientRect(); if (m.height > 0 && m.bottom < innerHeight * .2) top = Math.round(m.bottom); } catch (e) {}   // the match header ends under its MENU button
    try { const r = document.getElementById('pullPad').getBoundingClientRect(); if (r.height > 40 && r.top > top + 80) bot = Math.round(r.top); } catch (e) {}
    if (!bot) try { const b = V.boardBottomY(); if (b > top + 80) bot = Math.round(b); } catch (e) {}
    if (!bot) bot = Math.round(innerHeight * .45); return { top, h: bot - top }; }
  window.TOPS_GEARCAM_FIRE = function (kind) {
    const VV = typeof V !== 'undefined' ? V : null; if (!window.TOPS_GEARCAM || !VV || !VV.gearShot) return false; const P = pane(); const shot = VV.gearShot(innerWidth / P.h); if (!shot) return false;
    const old = document.getElementById('gearCam'); if (old) old.remove();
    const d = document.createElement('div'); d.id = 'gearCam'; d.setAttribute('role', 'img'); d.setAttribute('aria-label', 'Your darts, close up');
    d.style.cssText = `position:fixed;left:0;right:0;top:${P.top}px;height:${P.h}px;z-index:2147483000;overflow:hidden;background:#000;opacity:1;touch-action:none;pointer-events:auto`;
    shot.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
    d.appendChild(shot); const t = document.createElement('div'); t.textContent = LAB[kind] || ''; t.style.cssText = 'position:absolute;left:12px;bottom:10px;font:800 13px/1 "Saira Condensed","Arial Narrow",Arial,sans-serif;letter-spacing:1.5px;color:#f3f4f2;background:rgba(10,11,13,.72);padding:6px 9px;border-left:3px solid #c6f36b'; d.appendChild(t);
    document.body.appendChild(d); const Q = window.TOPS_GEARCAM_QA || {}; if (!Q.still) try { d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 }); shot.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }], { duration: GC_MS, fill: 'forwards', easing: 'cubic-bezier(.2,.6,.3,1)' }); } catch (e) {}
    let gone = false; const end = () => { if (gone) return; gone = true; try { d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }); } catch (e) {} setTimeout(() => d.remove(), 150); };
    const skip = e => { try { e.preventDefault(); e.stopPropagation(); } catch (x) {} end(); };   // the tap that skips never reaches the aim pad
    d.addEventListener('pointerdown', skip, true); d.addEventListener('touchstart', skip, { capture: true, passive: false }); setTimeout(end, Q.hold || GC_MS);   // QA captures: {still, hold} (slow software GL drops frames)
    window.TOPS_GEARCAM_LAST = { kind, at: Date.now(), w: shot.width, h: shot.height }; return true; };
  /* ---------- the shop (Producer 07:03, decided with ChatGPT): a title at a level unlocks that level's premium edition; the trophy on the shelf
     is the free proof. Buying is cosmetic and one-off and never takes the bank below the next entry fee. Owned editions never expire; one
     dart edition is worn at a time. Shirt editions (Club, Opens) and the Trans-Tasman shirt only show outside matches and need their kit art,
     so they're listed but not sold until that lands (READY). ---------- */
  const READY = { pub: 1, dpnz: 1, tt: 1, card: 1, worlds: 1 };
  const CIRC = () => window.TOPS_CIRCUIT;
  const carOf = () => { try { const c = career(); return c && c.circuit ? c : null; } catch (e) { return null; } };
  const wonAt = (k, ed) => (k.history || []).some(h => h.fin === 'W' && (ed.id === 'worlds' ? h.id === 'worlds' : h.level === ed.lv));
  function floorFee(c) {   // the next entry fee at the player's level: the cheapest event there (with the trip funded if it is)
    const E = CIRC(), k = c.circuit; try { const L = E.LEVELS[k.level]; return Math.min(...L.events.map(e => E.costFor ? E.costFor(k, e) : E.cost(e))); } catch (e) { return 0; } }
  const pres = c => { c.prestige = c.prestige && typeof c.prestige === 'object' ? c.prestige : {}; const g = c.prestige; g.own = Array.isArray(g.own) ? g.own : []; g.eq = g.eq || {}; return g; };
  function state(id) { const ed = ED.find(x => x.id === id), c = carOf(); if (!ed || !c) return null; const g = pres(c), k = c.circuit;
    const owned = g.own.includes(id), won = wonAt(k, ed), fee = floorFee(c), left = c.bank - ed.price;
    return { id, n: ed.n, lv: ed.lv, price: ed.price, ready: !!READY[id], won, owned, worn: g.eq.darts === id, fee, canAfford: left >= fee,
      can: !!READY[id] && won && !owned && left >= fee }; }
  function buy(id) { const st = state(id), c = carOf(); if (!st) return { ok: false, why: 'No career' };
    if (!st.ready) return { ok: false, why: 'Not on sale yet' }; if (!st.won) return { ok: false, why: 'Win a title at this level to unlock it' };
    if (st.owned) return { ok: false, why: 'Already yours' }; if (!st.canAfford) return { ok: false, why: 'Keep ' + st.fee + ' for your next entry' };
    if (window.TOPS_TABS && TOPS_TABS.canWrite && !TOPS_TABS.canWrite()) return { ok: false, why: 'TOPS is open in another tab' };
    c.bank -= st.price; const g = pres(c); g.own.push(id); g.at = g.at || {}; g.at[id] = Date.now(); if (ED.find(x => x.id === id).parts.includes('flight')) g.eq.darts = id;
    try { persist(); } catch (e) {} try { window.TOPS_FLIGHT && TOPS_FLIGHT.log && TOPS_FLIGHT.log('prestige_buy', { id, price: st.price, bank: c.bank }); } catch (e) {}
    return { ok: true, id, bank: c.bank }; }
  function wear(id) { const c = carOf(); if (!c) return { ok: false }; const g = pres(c); if (id && !g.own.includes(id)) return { ok: false, why: 'Not yours yet' };
    g.eq.darts = id || null; try { persist(); } catch (e) {} return { ok: true, worn: g.eq.darts }; }
  /* the edition row under each level on the trophy shelf (Locker > Trophies). Self-contained: rb/s3.js only asks for the row's HTML; taps are
     handled here (delegated), and the row redraws itself. Buying takes two taps (the first arms it for 3 s), never a dialog. */
  const $m = n => '$' + Math.round(n).toLocaleString('en-NZ'); const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const THUMB = {}; const thumb = id => { if (!PARTS[id]) return ''; const nm = (typeof save !== 'undefined' && save.name) || 'You', k = id + '|' + nm; try { if (!THUMB[k]) THUMB[k] = paint(id, nm).toDataURL('image/jpeg', .82); } catch (e) { return ''; } return THUMB[k]; };
  function row(lv) { const ed = ED.find(x => x.lv === lv); if (!ed) return ''; const st = state(ed.id); if (!st) return ''; const E = CIRC(), L = E && E.LEVELS[lv];
    let line, btn = '';
    if (!st.ready) line = 'Joins the shop with the new kits';
    else if (!st.won) line = (ed.id === 'worlds' ? 'Win the World Championship' : 'Win a ' + esc(L ? L.n : '') + ' title') + ' to unlock · ' + $m(ed.price);
    else if (!st.owned) { line = 'Your title unlocked it · cosmetic only'; btn = st.canAfford ? `<button type="button" class="s3-edb" data-ed-buy="${ed.id}"><b>Buy · ${$m(ed.price)}</b></button>` : `<button type="button" class="s3-edb" disabled><b>${$m(ed.price)}</b><small>Keep ${$m(st.fee)} for your next entry</small></button>`; }
    else if (PARTS[ed.id]) { line = st.worn ? 'On your darts' : 'Yours'; btn = `<button type="button" class="s3-edb s3-edw" data-ed-wear="${st.worn ? '' : ed.id}"><b>${st.worn ? 'Take off' : 'Wear'}</b></button>`; }
    else line = 'Yours';
    const img = thumb(ed.id); return `<div class="s3-ed${st.owned ? ' s3-edown' : st.won && st.ready ? ' s3-edopen' : ''}" data-edrow="${lv}">${img ? `<img src="${img}" alt="">` : '<i></i>'}<div><span>Title edition</span><b>${esc(ed.n)}</b><small>${line}</small></div>${btn}</div>`; }
  const redraw = lv => { const r = document.querySelector(`[data-edrow="${lv}"]`); if (r) r.outerHTML = row(lv); };
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ed-buy],[data-ed-wear]'); if (!b) return; e.preventDefault(); e.stopPropagation();
    const r = b.closest('[data-edrow]'), lv = r ? +r.dataset.edrow : null;
    if (b.dataset.edBuy) { if (!b.dataset.armed) { b.dataset.armed = 1; b.innerHTML = '<b>Tap again to buy</b><small>' + $m(ED.find(x => x.id === b.dataset.edBuy).price) + '</small>'; setTimeout(() => { if (b.isConnected) redraw(lv); }, 3000); return; }
      const res = buy(b.dataset.edBuy); if (!res.ok) { b.innerHTML = '<b>' + esc(res.why || 'Not bought') + '</b>'; setTimeout(() => redraw(lv), 1800); return; } redraw(lv);
      try { const bk = document.getElementById('rbBank'); if (bk) bk.textContent = $m(career().bank); } catch (x) {} }
    else { wear(b.dataset.edWear || null); redraw(lv); } }, true);
  window.TOPS_PRESTIGE = { ED, paint, PARTS, READY, state, buy, wear, floorFee, row };
})();
