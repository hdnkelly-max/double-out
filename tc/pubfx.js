/* TOPS pub rules: ability card effects you can see.
   The card mechanics live in game4.js (cardApply). This layer adds the visuals on every screen that is watching the
   target throw: the target and any spectators. Board-camera moves go through TOPS_DRUNKCAM, everything else is a
   canvas over the board pane plus a few CSS layers. Effects end with the card's own lifetime: one dart, two darts,
   the visit, or a fixed time. */
(function () {
  'use strict';
  if (typeof cardAnnounce !== 'function') return;
  const PF = { on: [], cam: [], parts: [], raf: 0, last: 0 };
  const low = () => { try { return (navigator.hardwareConcurrency || 8) <= 4; } catch (e) { return false; } };
  const R = Math.random, now = () => performance.now();
  let cv, cx, layer;
  function host() {
    if (cv) return;
    layer = document.createElement('div'); layer.id = 'pubFx'; document.body.appendChild(layer);
    cv = document.createElement('canvas'); cv.id = 'pubFxC'; document.body.appendChild(cv); cx = cv.getContext('2d');
    const css = document.createElement('style'); css.textContent = CSS; document.head.appendChild(css);
  }
  function size() { const d = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = Math.round(innerHeight * .52); if (cv.width !== w * d || cv.height !== h * d) { cv.width = w * d; cv.height = h * d; } cx.setTransform(d, 0, 0, d, 0, 0); return [w, h]; }

  // ---- who is throwing, and how long a card lasts ----
  const thr = () => (S && S.p && S.p[S.cur]) || null;
  const darts = () => { const t = thr(); return t ? (t.darts || 0) : 0; };
  function alive(e) {
    if (!S || S.done) return false;
    const t = thr(); if (!t || t.key !== e.key && !(e.key == null && S.cur === e.cur)) return false;
    if (e.until === 'time') return now() < e.end;
    if (e.until === 'visit') return S.cur === e.cur && darts() < e.d0 + 3 && (S.visit ? S.visit.length < 3 : true);
    return darts() < e.d0 + e.n;
  }
  function start(id, m, life) {
    host(); const t = thr();
    const e = Object.assign({ id, t0: now(), key: t && t.key, cur: S.cur, d0: darts(), fl: m.fl || '', from: m.fromName || '' }, life);
    PF.on = PF.on.filter(o => o.id !== id); PF.on.push(e); document.body.classList.add('pfx-' + id); kick(); return e;
  }
  function stop(e) { document.body.classList.remove('pfx-' + e.id); const el = layer && layer.querySelector('.pf-' + e.id); if (el) { el.classList.add('out'); setTimeout(() => el.remove(), 450); } }
  function el(id, html) { host(); let d = layer.querySelector('.pf-' + id); if (d) d.remove(); d = document.createElement('div'); d.className = 'pf-' + id; d.innerHTML = html || ''; layer.appendChild(d); return d; }
  const esc = s => String(s || '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  // ---- board camera: jolts, shakes and the slow swing of a loose board ----
  function jolt(dx, dy, ms, kind) { PF.cam.push({ dx, dy, t0: now(), ms, kind: kind || 'jolt' }); kick(); }
  const _dc = window.TOPS_DRUNKCAM;
  window.TOPS_DRUNKCAM = function (t) {
    let b = null; try { b = _dc ? _dc(t) : null; } catch (e) {}
    const n = now(); let x = 0, y = 0, r = 0, f = 1, any = false;
    PF.cam = PF.cam.filter(c => n - c.t0 < c.ms);
    PF.cam.forEach(c => { const k = (n - c.t0) / c.ms; any = true;
      if (c.kind === 'shake') { const a = (1 - k) * (1 - k); x += (R() - .5) * c.dx * a; y += (R() - .5) * c.dy * a; }
      else { const s = Math.exp(-k * 5) * Math.cos(k * 14); x += c.dx * s; y += c.dy * s; r += c.dx * 1.4 * s; } });
    PF.on.forEach(e => { if (!alive(e)) return;
      if (e.id === 'wobble') { const q = (n - e.t0) / 1000; any = true; r += .022 * Math.sin(q * 1.9) + .008 * Math.sin(q * 4.3); x += .004 * Math.sin(q * 1.9 + .6); }
      if (e.id === 'gang' || e.id === 'turns') { const q = (n - e.t0) / 1000; any = true; f *= 1 + .02 * Math.sin(q * 2.4); x += .002 * Math.sin(q * 7); } });
    if (!any) return b;
    b = b || { x: 0, y: 0, r: 0, f: 1 }; return { x: b.x + x, y: b.y + y, r: b.r + r, f: b.f * f };
  };

  // ---- particles over the board pane ----
  function drop(o) { PF.parts.push(Object.assign({ t0: now(), age: 0 }, o)); kick(); }
  function kick() { if (!PF.raf) { PF.last = now(); PF.raf = requestAnimationFrame(tick); } }
  function tick(t) {
    PF.raf = 0; if (!cv) return;
    const dt = Math.min(.05, (t - PF.last) / 1000); PF.last = t;
    const [W, H] = size(); cx.clearRect(0, 0, W, H);
    PF.on = PF.on.filter(e => { const ok = alive(e) && (now() - e.t0 < 20000); if (!ok) stop(e); return ok; });
    PF.on.forEach(e => draw(e, W, H, t));
    PF.parts = PF.parts.filter(p => (p.age += dt) < p.life);
    PF.parts.forEach(p => part(p, W, H, dt));
    if (PF.on.length || PF.parts.length || PF.cam.length) PF.raf = requestAnimationFrame(tick);
  }
  function part(p, W, H, dt) {
    const k = p.age / p.life;
    if (p.k === 'ring') { cx.strokeStyle = `rgba(255,248,230,${.8 * (1 - k)})`; cx.lineWidth = 6 * (1 - k) + 1; cx.shadowColor = "rgba(255,240,200,.8)"; cx.shadowBlur = 12; cx.beginPath(); cx.arc(p.x * W, p.y * H, 20 + k * p.r * W, 0, 7); cx.stroke(); cx.shadowBlur = 0; return; }
    if (p.k === 'splash') { p.vy += 900 * dt; p.x += p.vx * dt / W; p.y += p.vy * dt / H; const a = Math.min(1, (1 - k) * 2);
      cx.fillStyle = `rgba(${p.foam ? '250,244,226' : '214,150,40'},${.75 * a})`; cx.beginPath(); cx.ellipse(p.x * W, p.y * H, p.s, p.s * (1 + Math.min(2, Math.abs(p.vy) / 500)), Math.atan2(p.vy, p.vx) - Math.PI / 2, 0, 7); cx.fill();
      cx.fillStyle = `rgba(255,255,255,${.5 * a})`; cx.beginPath(); cx.arc(p.x * W - p.s * .3, p.y * H - p.s * .3, p.s * .3, 0, 7); cx.fill(); return; }
    if (p.k === 'note') { p.y -= .12 * dt; p.x += Math.sin(p.age * 3 + p.ph) * .02 * dt; cx.fillStyle = `rgba(${p.c},${Math.sin(Math.PI * k) * .85})`; cx.font = `700 ${p.s}px serif`; cx.fillText(p.g, p.x * W, p.y * H); return; }
    if (p.k === 'spark') { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += .6 * dt; cx.fillStyle = `rgba(255,214,120,${1 - k})`; cx.fillRect(p.x * W, p.y * H, 2, 2); }
  }
  // drips that run down the glass for as long as the card lasts
  function drips(e, W, H, t, col) {
    e.dr = e.dr || Array.from({ length: low() ? 9 : 16 }, () => ({ x: R(), y: -.1 - R() * .5, v: .05 + R() * .12, s: 3 + R() * 6, w: R() * 6.28, trail: [] }));
    const dt = Math.min(.05, (t - (e.lt || t)) / 1000); e.lt = t;
    e.dr.forEach(d => { if (R() < .02) d.v = .03 + R() * .16; d.y += d.v * dt; d.x += Math.sin(t / 900 + d.w) * .0006; if (d.y > 1.1) { d.y = -.1; d.x = R(); d.trail = []; }
      d.trail.push([d.x, d.y]); if (d.trail.length > 40) d.trail.shift();
      cx.strokeStyle = `rgba(${col},.22)`; cx.lineWidth = d.s * .7; cx.lineCap = 'round'; cx.beginPath(); d.trail.forEach((q, i) => i ? cx.lineTo(q[0] * W, q[1] * H) : cx.moveTo(q[0] * W, q[1] * H)); cx.stroke();
      const g = cx.createRadialGradient(d.x * W - d.s * .3, d.y * H - d.s * .4, 1, d.x * W, d.y * H, d.s * 1.2); g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(.35, `rgba(${col},.55)`); g.addColorStop(1, `rgba(${col},.05)`);
      cx.fillStyle = g; cx.beginPath(); cx.ellipse(d.x * W, d.y * H, d.s, d.s * 1.35, 0, 0, 7); cx.fill(); });
  }
  function draw(e, W, H, t) {
    const q = (now() - e.t0) / 1000;
    switch (e.id) {
      case 'spill': drips(e, W, H, t, '214,150,40'); break;
      case 'bump': if (q < 2.5) drips(e, W, H, t, '214,150,40'); break;
      case 'juke': {   // jukebox light washing over the board on the beat
        const beat = Math.pow(Math.max(0, Math.cos(q * Math.PI * 2 * 2.05)), 6), hue = (q * 40) % 360;
        const g = cx.createRadialGradient(W * (.5 + .35 * Math.sin(q * .9)), H * .9, 10, W * .5, H * .6, W * 1.1);
        g.addColorStop(0, `hsla(${hue},90%,60%,${.18 + .2 * beat})`); g.addColorStop(1, `hsla(${(hue + 120) % 360},90%,50%,0)`); cx.fillStyle = g; cx.fillRect(0, 0, W, H);
        if (R() < .05) drop({ k: 'note', x: .1 + R() * .8, y: .95, life: 2.4, s: 16 + R() * 12, g: R() < .5 ? '♪' : '♫', ph: R() * 6, c: R() < .5 ? '255,140,220' : '140,220,255' }); break; }
      case 'cooker': {  // heat shimmer rising and a pulse at the edges in time with the heart rate
        const hr = (S && S.hr) || 90, bt = Math.pow(Math.max(0, Math.sin(q * Math.PI * hr / 60)), 8);
        const v = cx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .75); v.addColorStop(0, 'rgba(160,20,10,0)'); v.addColorStop(1, `rgba(160,20,10,${.28 + .3 * bt})`); cx.fillStyle = v; cx.fillRect(0, 0, W, H);
        cx.strokeStyle = 'rgba(255,190,140,.07)'; cx.lineWidth = 2; for (let i = 0; i < 9; i++) { const y0 = H - ((q * 60 + i * H / 9) % H); cx.beginPath(); for (let x = 0; x <= W; x += 12) cx.lineTo(x, y0 + Math.sin(x / 26 + q * 5 + i) * 4); cx.stroke(); } break; }
      case 'gang': case 'turns': {  // the room closing in: a red pressure vignette that throbs
        const p = .5 + .5 * Math.sin(q * 3.2), v = cx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .32, W / 2, H / 2, Math.max(W, H) * .7);
        v.addColorStop(0, 'rgba(120,0,0,0)'); v.addColorStop(1, `rgba(110,0,0,${.32 + .18 * p})`); cx.fillStyle = v; cx.fillRect(0, 0, W, H); break; }
      case 'orders': {  // the barman flicks the lights
        const f = q < 1.6 ? ((q * 10 | 0) % 3 === 0 ? .62 : (q < .9 ? .1 : 0)) : 0; if (f) { cx.fillStyle = `rgba(0,0,0,${f})`; cx.fillRect(0, 0, W, H); } break; }
      case 'nan': break;   // CSS lens layer
    }
  }

  // ---- one entry per card ----
  const FX = {
    horn(m) { jolt(.02, .02, 900, 'shake'); for (let i = 0; i < 5; i++) setTimeout(() => drop({ k: 'ring', x: .08, y: .96, r: 1.2, life: 1 }), i * 120);
      el('horn', '<i></i>'); setTimeout(() => { const d = layer && layer.querySelector('.pf-horn'); if (d) { d.classList.add('out'); setTimeout(() => d.remove(), 450); } }, 1300); },
    bump(m) { const a = R() * 6.28; jolt(Math.cos(a) * .03, Math.sin(a) * .02, 1100); start('bump', m, { until: 'time', end: now() + 2600 });
      for (let i = 0; i < 26; i++) drop({ k: 'splash', x: .5 + (R() - .5) * .5, y: .95, vx: (R() - .5) * 500, vy: -300 - R() * 500, s: 2 + R() * 4, life: 1.4, foam: R() < .3 }); },
    spill(m) { start('spill', m, { until: 'dart', n: 1 }); for (let i = 0; i < 30; i++) drop({ k: 'splash', x: .5 + (R() - .5) * .7, y: .02, vx: (R() - .5) * 220, vy: 60 + R() * 260, s: 2 + R() * 5, life: 1.3, foam: R() < .35 }); },
    heckle(m) { start('heckle', m, { until: 'dart', n: 1 }); el('heckle', `<b>${esc(m.fl)}</b><small>${esc(m.fromName)}</small>`); jolt(.004, .004, 400, 'shake'); },
    orders(m) { start('orders', m, { until: 'dart', n: 1 }); el('orders', '<div class="pf-bell"></div><b>Last orders!</b>'); jolt(.006, .002, 900, 'shake'); },
    juke(m) { start('juke', m, { until: 'visit' }); },
    flash(m) { el('flash', '<i></i><u></u>'); setTimeout(() => { const d = layer && layer.querySelector('.pf-flash'); if (d) { d.classList.add('out'); setTimeout(() => d.remove(), 450); } }, 2200); },
    wobble(m) { start('wobble', m, { until: 'visit' }); jolt(.012, 0, 700); },
    cooker(m) { start('cooker', m, { until: 'dart', n: 1 }); },
    nan(m) { start('nan', m, { until: 'dart', n: 1 }); el('nan', '<i></i><i></i>'); },
    tap(m) { jolt(-.018, -.022, 800); el('tap', '<i></i>'); setTimeout(() => { const d = layer && layer.querySelector('.pf-tap'); if (d) d.remove(); }, 1000); },
    gang(m) { start('gang', m, { until: 'visit' }); el('gang', '<div class="pf-crowd"></div>'); jolt(.006, .006, 600, 'shake'); },
    turns(m) { start('turns', m, { until: 'visit' }); el('turns', '<div class="pf-crowd"></div>'); }
  };
  // drink cards and defences get a stamp everyone sees
  const STAMP = { double: ['2×', 'Doubles next visit'], stick: ['TAB', 'Under 60 and it’s down it'], shout: ['🍻', 'My shout'], tab: ['💳', 'Pass the tab'], tax: ['👑', 'Leader tax'], table: ['🍽️', 'Round the table'], swap: ['🔁', 'Pint swap'] };
  function stamp(big, small, cls) { const d = el('stamp', `<b>${esc(big)}</b><small>${esc(small)}</small>`); if (cls) d.classList.add(cls); setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 450); }, 1700); }

  const _ca = cardAnnounce;
  cardAnnounce = function (m, mine) {
    const r = _ca.apply(this, arguments);
    try {
      if (!S || !S.pub || S.done || !m) return r;
      const c = (typeof CARD !== 'undefined' && CARD[m.id]) || {}, fi = pubIdx(m.from), ti = pubIdx(m.to);
      const mm = Object.assign({}, m, { fl: c.fl, fromName: fi >= 0 ? S.p[fi].name : '' });
      if (m.res === 'blocked') { stamp(m.by === 'ear' ? '🦻' : '🚪', m.by === 'ear' ? 'Earplugs in' : 'Bouncer says no', 'def'); return r; }
      if (m.res === 'reflected') { stamp('↩', 'Return to sender', 'def'); return r; }
      if (m.res !== 'live' && m.res !== 'queued') return r;
      if (STAMP[m.id]) { stamp(STAMP[m.id][0], STAMP[m.id][1], 'drink'); return r; }
      if (FX[m.id] && ti >= 0 && ti === S.cur) FX[m.id](mm);
    } catch (e) { console.warn('pubfx', e); }
    return r;
  };
  window.TOPS_PUBFX = { FX, test: (id, fl) => FX[id] && FX[id]({ id, fl: fl || (CARD[id] || {}).fl || '', fromName: 'Big Mal' }), stamp };

  const CSS = `
#pubFxC{position:fixed;left:0;top:0;width:100%;height:52%;z-index:41;pointer-events:none}
#pubFx{position:fixed;left:0;top:0;width:100%;height:52%;z-index:42;pointer-events:none;overflow:hidden}
#pubFx>div{position:absolute;inset:0;transition:opacity .45s}#pubFx>div.out{opacity:0}
/* air horn: a hard blast from the corner */
#pubFx .pf-horn i{position:absolute;left:-30px;bottom:-30px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(255,250,235,.55),rgba(255,250,235,0) 70%);animation:pfHorn .9s ease-out both}
@keyframes pfHorn{0%{transform:scale(.3);opacity:1}100%{transform:scale(4);opacity:0}}
/* heckle: their line, shouted across the room */
#pubFx .pf-heckle{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:0 18px 108px}
#pubFx .pf-heckle b{max-width:78%;background:rgba(250,248,240,.96);color:#141414;font:800 17px/1.2 "Barlow Condensed",sans-serif;padding:10px 14px;border-radius:16px 16px 16px 4px;box-shadow:0 8px 24px rgba(0,0,0,.45);transform-origin:0 100%;animation:pfShout .5s cubic-bezier(.2,1.6,.4,1) both,pfJit .12s .5s 6 alternate}
#pubFx .pf-heckle small{margin:6px 0 0 6px;font:700 11px Manrope,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.75);text-shadow:0 1px 4px #000}
@keyframes pfShout{from{transform:scale(.3) rotate(-8deg);opacity:0}to{transform:none;opacity:1}}@keyframes pfJit{to{transform:translate(1px,-1px) rotate(.6deg)}}
/* last orders: brass bell swinging, lights flicking */
#pubFx .pf-orders{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:18%}
#pubFx .pf-bell{width:54px;height:50px;background:radial-gradient(circle at 35% 30%,#ffe7a3,#c99a3a 45%,#6e4b14);clip-path:path('M27 2C14 2 10 14 9 28C8 38 4 42 1 46L53 46C50 42 46 38 45 28C44 14 40 2 27 2Z');transform-origin:50% 0;animation:pfBell .18s ease-in-out 8 alternate;filter:drop-shadow(0 6px 10px rgba(0,0,0,.6))}
@keyframes pfBell{from{transform:rotate(-24deg)}to{transform:rotate(24deg)}}
#pubFx .pf-orders b{background:none;margin-top:10px;font:800 26px "Barlow Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#f3e2b8;text-shadow:0 2px 12px rgba(0,0,0,.9);animation:pfShout .4s .1s both}
/* camera flash: white-out, then the purple-green blob burned into your eyes */
#pubFx .pf-flash i{position:absolute;inset:0;background:#fff;animation:pfWhite 1s ease-out both}
#pubFx .pf-flash u{position:absolute;left:50%;top:46%;width:170px;height:170px;margin:-85px 0 0 -85px;border-radius:50%;background:radial-gradient(circle,rgba(120,255,170,.85),rgba(170,80,255,.6) 45%,rgba(170,80,255,0) 70%);mix-blend-mode:screen;filter:blur(6px);animation:pfBurn 2.2s .25s ease-out both}
@keyframes pfWhite{0%{opacity:1}30%{opacity:.95}100%{opacity:0}}@keyframes pfBurn{0%{opacity:0;transform:scale(1.4)}15%{opacity:1}100%{opacity:0;transform:translate(14px,-8px) scale(.8)}}
/* nan's readers: two thick lenses, everything outside swims */
#pubFx .pf-nan{backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}
#pubFx .pf-nan i{position:absolute;top:22%;width:46%;height:56%;border-radius:46% 46% 42% 42%;box-shadow:0 0 0 9px rgba(28,22,16,.9),0 0 0 11px rgba(120,96,60,.6),inset 0 0 40px rgba(255,255,255,.18);backdrop-filter:blur(2px) saturate(1.2);-webkit-backdrop-filter:blur(2px) saturate(1.2);animation:pfLens 2.6s ease-in-out infinite alternate}
#pubFx .pf-nan i:first-child{left:2%}#pubFx .pf-nan i:last-child{right:2%}
@keyframes pfLens{from{transform:translateY(-4px) rotate(-1deg)}to{transform:translateY(4px) rotate(1deg)}}
/* shoulder tap: a finger prod from the side */
#pubFx .pf-tap i{position:absolute;right:-10px;top:58%;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.4),rgba(255,255,255,0) 60%);animation:pfTap .6s ease-out both}
@keyframes pfTap{0%{transform:scale(.2);opacity:1}100%{transform:scale(2.4);opacity:0}}
/* gang up / crowd turns: heads rising at the bottom of the frame */
#pubFx .pf-crowd{position:absolute;left:-6%;right:-6%;bottom:-4px;height:40%;filter:blur(2.5px);opacity:.95;animation:pfCrowd .7s cubic-bezier(.2,.9,.3,1) both,pfSway 2.6s .7s ease-in-out infinite alternate;
 background:linear-gradient(0deg,rgba(0,0,0,.85),rgba(0,0,0,0) 45%),
 radial-gradient(ellipse 8.5% 17% at 9% 52%,#0b0908 96%,transparent 100%),radial-gradient(ellipse 17% 30% at 9% 100%,#0b0908 96%,transparent 100%),
 radial-gradient(ellipse 9.5% 19% at 31% 62%,#0d0b09 96%,transparent 100%),radial-gradient(ellipse 19% 30% at 31% 108%,#0d0b09 96%,transparent 100%),
 radial-gradient(ellipse 8% 16% at 66% 56%,#0a0807 96%,transparent 100%),radial-gradient(ellipse 16% 28% at 66% 102%,#0a0807 96%,transparent 100%),
 radial-gradient(ellipse 9% 18% at 90% 60%,#0c0a08 96%,transparent 100%),radial-gradient(ellipse 18% 30% at 90% 106%,#0c0a08 96%,transparent 100%)}
#pubFx .pf-crowd::after{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 8% 3% at 31% 46%,rgba(255,190,120,.18),transparent),radial-gradient(ellipse 7% 3% at 66% 41%,rgba(255,190,120,.16),transparent)}
@keyframes pfCrowd{from{transform:translateY(100%)}to{transform:none}}@keyframes pfSway{to{transform:translateX(10px)}}
/* stamps: drink cards and blocks */
#pubFx .pf-stamp{display:flex;flex-direction:column;align-items:center;justify-content:center}
#pubFx .pf-stamp b{font:800 64px/1 "Barlow Condensed",sans-serif;color:#fff;padding:10px 22px;border:4px solid currentColor;border-radius:14px;transform:rotate(-8deg);animation:pfStamp .45s cubic-bezier(.2,1.5,.4,1) both;text-shadow:0 3px 16px rgba(0,0,0,.7)}
#pubFx .pf-stamp.drink b{color:#F2B705}#pubFx .pf-stamp.def b{color:#C6F36B}
#pubFx .pf-stamp small{margin-top:12px;font:800 14px Manrope,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#fff;text-shadow:0 2px 8px #000}
@keyframes pfStamp{from{transform:scale(2.6) rotate(-14deg);opacity:0}to{transform:rotate(-8deg);opacity:1}}
@media (prefers-reduced-motion:reduce){#pubFx *{animation-duration:.01s!important;animation-iteration-count:1!important}}
`;
})();
