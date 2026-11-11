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
    if (p.k === 'mist') { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .97; p.vy *= .97; const r = p.r * (1 + k * 2.2), g = cx.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, r);
      g.addColorStop(0, `rgba(236,240,244,${.22 * (1 - k) * Math.min(1, k * 6)})`); g.addColorStop(.6, `rgba(236,240,244,${.08 * (1 - k)})`); g.addColorStop(1, 'rgba(236,240,244,0)'); cx.fillStyle = g; cx.save(); cx.translate(p.x * W, p.y * H); cx.rotate(p.vy * 3); cx.scale(p.sx || 1, 1); cx.translate(-p.x * W, -p.y * H); cx.beginPath(); cx.arc(p.x * W, p.y * H, r, 0, 7); cx.fill(); cx.restore(); return; }
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
      case 'juke': {   // bubble-tube neon down both edges of the board pane, colour spilling onto the board's edge (centre stays clear), on a 123 bpm beat
        const per = 60 / 123, ph = q % per, env = ph < .1 ? ph / .1 : Math.exp(-(ph - .1) / .28), beat = Math.floor(q / per), fade = Math.min(1, q / .35);
        const top = Math.min(H * .14, 56), bot = H - Math.min(H * .16, 64), L = bot - top, mob = W < 600, tw = mob ? 5 : 7, ix = mob ? 7 : 12;
        const hue = y => (q * 40 + (bot - y) / L * 220) % 360;
        e.bub = e.bub || [0, 1].map(() => Array.from({ length: low() ? 5 : 9 }, () => ({ y: R(), v: .18 + R() * .25, s: .6 + R() * .5 })));
        [ix, W - ix].forEach((x, side) => {
          // spill onto the board: a soft vertical band of the tube's colours, strongest on the beat
          cx.globalCompositeOperation = 'soft-light';
          const sp = cx.createLinearGradient(x, 0, side ? x - W * .2 : x + W * .2, 0), sg = cx.createLinearGradient(0, top, 0, bot);
          sp.addColorStop(0, `rgba(255,255,255,${(.32 + .3 * env) * fade})`); sp.addColorStop(1, 'rgba(255,255,255,0)');
          for (let i = 0; i <= 4; i++) sg.addColorStop(i / 4, `hsla(${hue(top + L * i / 4)},95%,58%,${(.5 + .35 * env) * fade})`);
          cx.save(); cx.beginPath(); cx.rect(side ? x - W * .2 : x, top - 20, W * .2, L + 40); cx.clip(); cx.fillStyle = sg; cx.fillRect(side ? x - W * .2 : x, top - 20, W * .2, L + 40);
          cx.globalCompositeOperation = 'destination-in'; cx.fillStyle = sp; cx.fillRect(side ? x - W * .2 : x, top - 20, W * .2, L + 40); cx.restore();
          cx.globalCompositeOperation = 'source-over';
          // the tube: dark housing, coloured glass, a hot core, chrome caps
          const tg = cx.createLinearGradient(0, bot, 0, top); for (let i = 0; i <= 6; i++) tg.addColorStop(i / 6, `hsl(${hue(bot - L * i / 6)},100%,${58 + 8 * env}%)`);
          cx.lineCap = 'round'; cx.strokeStyle = 'rgba(8,6,10,.75)'; cx.lineWidth = tw + 6; cx.beginPath(); cx.moveTo(x, top); cx.lineTo(x, bot); cx.stroke();
          cx.save(); cx.shadowColor = `hsla(${hue(top + L / 2)},100%,60%,.9)`; cx.shadowBlur = (mob ? 14 : 22) * (.6 + .4 * env); cx.globalAlpha = fade;
          cx.strokeStyle = tg; cx.lineWidth = tw; cx.beginPath(); cx.moveTo(x, top); cx.lineTo(x, bot); cx.stroke(); cx.restore();
          cx.globalAlpha = .55 * fade; cx.strokeStyle = '#fff'; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(x - tw * .18, top + 4); cx.lineTo(x - tw * .18, bot - 4); cx.stroke(); cx.globalAlpha = 1;
          e.bub[side].forEach(u => { u.y = (u.y + u.v * .016) % 1; const by = bot - u.y * L, r = tw * .32 * u.s; cx.fillStyle = `rgba(255,255,255,${.55 * fade})`; cx.beginPath(); cx.arc(x + Math.sin(u.y * 9 + side) * tw * .12, by, r, 0, 7); cx.fill(); });
          [top, bot].forEach(cy => { const cg = cx.createLinearGradient(x - tw, 0, x + tw, 0); cg.addColorStop(0, '#3a3e44'); cg.addColorStop(.45, '#d9dde2'); cg.addColorStop(1, '#2a2d32'); cx.fillStyle = cg; cx.fillRect(x - tw * .9, cy - 3, tw * 1.8, 6); });
        });
        if (e.lb !== beat) { e.lb = beat; if (beat % 2 === 0) PF.cam.push({ dx: .0025, dy: .0025, t0: now(), ms: 120, kind: 'shake' }); } break; }
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
    horn(m) { jolt(.016, -.012, 330); PF.cam.push({ dx: .006, dy: .006, t0: now(), ms: 260, kind: 'shake' });
      for (let i = 0; i < (low() ? 10 : 18); i++) setTimeout(() => drop({ k: 'mist', x: .3 + R() * .04, y: .8 + R() * .04, vx: .12 + R() * .3, vy: -.06 - R() * .2, r: 12 + R() * 22, life: .5 + R() * .5, sx: .7 + R() * .8 }), 120 + i * 18);
      el('horn', '<div class="pf-can"><i></i><b></b></div>'); setTimeout(() => { const d = layer && layer.querySelector('.pf-horn'); if (d) { d.classList.add('out'); setTimeout(() => d.remove(), 450); } }, 900); },
    bump(m) { const a = R() * 6.28; jolt(Math.cos(a) * .03, Math.sin(a) * .02, 1100); start('bump', m, { until: 'time', end: now() + 2600 });
      for (let i = 0; i < 26; i++) drop({ k: 'splash', x: .5 + (R() - .5) * .5, y: .95, vx: (R() - .5) * 500, vy: -300 - R() * 500, s: 2 + R() * 4, life: 1.4, foam: R() < .3 }); },
    spill(m) { start('spill', m, { until: 'dart', n: 1 }); for (let i = 0; i < 30; i++) drop({ k: 'splash', x: .5 + (R() - .5) * .7, y: .02, vx: (R() - .5) * 220, vy: 60 + R() * 260, s: 2 + R() * 5, life: 1.3, foam: R() < .35 }); },
    heckle(m) { start('heckle', m, { until: 'dart', n: 1 }); el('heckle', `<div class="pf-guy"><i></i><b></b><u></u></div><p><em>${esc(m.fromName || 'Crowd')}</em> “${esc(m.fl)}”</p>`); jolt(.004, .002, 260); },
    orders(m) { start('orders', m, { until: 'dart', n: 1 }); el('orders', '<div class="pf-bell"></div><b>Last orders!</b>'); jolt(.006, .002, 900, 'shake'); },
    juke(m) { start('juke', m, { until: 'visit' }); el('juke', '<div class="pf-np"><span><i></i><i></i><i></i><i></i><i></i></span><b>Jukebox</b><small>this visit</small></div>'); },
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

  function door() { const d = el('door', '<i></i><b>Not tonight</b>'); setTimeout(() => jolt(.012, 0, 420), 480); setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 450); }, 1100); }
  const _ca = cardAnnounce;
  cardAnnounce = function (m, mine) {
    const r = _ca.apply(this, arguments);
    try {
      if (!S || !S.pub || S.done || !m) return r;
      const c = (typeof CARD !== 'undefined' && CARD[m.id]) || {}, fi = pubIdx(m.from), ti = pubIdx(m.to);
      const mm = Object.assign({}, m, { fl: c.fl, fromName: fi >= 0 ? S.p[fi].name : '' });
      if (m.res === 'blocked' && m.by === 'bouncer') { door(); return r; }
      if (m.res === 'blocked') { stamp(m.by === 'ear' ? '🦻' : '🚪', m.by === 'ear' ? 'Earplugs in' : 'Bouncer says no', 'def'); return r; }
      if (m.res === 'reflected') { stamp('↩', 'Return to sender', 'def'); return r; }
      if (m.res !== 'live' && m.res !== 'queued') return r;
      if (STAMP[m.id]) { stamp(STAMP[m.id][0], STAMP[m.id][1], 'drink'); return r; }
      if (FX[m.id] && ti >= 0 && ti === S.cur) FX[m.id](mm);
    } catch (e) { console.warn('pubfx', e); }
    return r;
  };
  window.TOPS_PUBFX = { FX, door, test: (id, fl) => FX[id] && FX[id]({ id, fl: fl || (CARD[id] || {}).fl || '', fromName: 'Big Mal' }), stamp };

  const CSS = `
#pubFxC{position:fixed;left:0;top:0;width:100%;height:52%;z-index:41;pointer-events:none}
#pubFx{position:fixed;left:0;top:0;width:100%;height:52%;z-index:42;pointer-events:none;overflow:hidden}
#pubFx>div{position:absolute;inset:0;transition:opacity .45s}#pubFx>div.out{opacity:0}
/* air horn: a hard blast from the corner */
#pubFx .pf-can{position:absolute;left:-8px;bottom:6%;width:150px;height:70px;transform-origin:0 100%;animation:pfCanIn .6s cubic-bezier(.2,.9,.3,1) both;filter:blur(1.2px) drop-shadow(0 10px 14px rgba(0,0,0,.6))}
#pubFx .pf-can i{position:absolute;left:0;top:14px;width:62px;height:42px;border-radius:10px 22px 22px 10px;background:linear-gradient(180deg,#ff5a4a,#c81e14 55%,#7a0d08)}
#pubFx .pf-can b{position:absolute;left:58px;top:4px;width:88px;height:62px;background:linear-gradient(180deg,#fafafa,#cfd3d6 60%,#8b9095);clip-path:polygon(0 38%,100% 0,100% 100%,0 62%)}
#pubFx .pf-horn u{position:absolute;left:120px;bottom:6%;width:220px;height:110px;margin-bottom:-20px;background:radial-gradient(ellipse at 0 50%,rgba(255,255,255,.55),rgba(255,255,255,0) 70%);animation:pfBlast .5s .15s ease-out both}
@keyframes pfCanIn{0%{transform:translate(-120px,40px) rotate(-14deg)}60%{transform:translate(4px,-2px) rotate(-12deg)}100%{transform:rotate(-12deg)}}
@keyframes pfBlast{0%{transform:scaleX(.2);opacity:0}30%{opacity:1}100%{transform:scaleX(1.6);opacity:0}}
/* heckle: a bloke leans in from the corner, his line as a broadcast subtitle */
#pubFx .pf-heckle .pf-guy{position:absolute;left:-30px;bottom:-20px;width:190px;height:230px;filter:blur(3px);animation:pfLean 1.9s cubic-bezier(.2,.9,.3,1) both}
#pubFx .pf-guy i{position:absolute;left:46px;top:10px;width:92px;height:112px;border-radius:48% 48% 44% 44%;background:radial-gradient(circle at 62% 38%,#4a3a30,#1c1410 70%)}
#pubFx .pf-guy b{position:absolute;left:0;top:104px;width:190px;height:150px;border-radius:46% 46% 0 0;background:linear-gradient(180deg,#22262c,#0c0e10)}
#pubFx .pf-guy u{position:absolute;left:118px;top:62px;width:46px;height:44px;border-radius:40% 60% 50% 50%;background:radial-gradient(circle at 40% 40%,#6c5242,#2a1d16);transform:rotate(-18deg)}
@keyframes pfLean{0%{transform:translate(-160px,60px) rotate(-10deg)}14%{transform:translate(0,0) rotate(6deg)}22%{transform:rotate(3deg)}80%{transform:rotate(4deg)}100%{transform:translate(-170px,70px) rotate(-8deg)}}
#pubFx .pf-heckle p{position:absolute;left:12px;right:12px;bottom:76px;margin:0;text-align:center;font:600 14px/1.35 Manrope,sans-serif;color:#fff;text-shadow:0 1px 3px #000,0 0 12px rgba(0,0,0,.8);animation:pfSub .25s .2s both}
#pubFx .pf-heckle p em{font-style:normal;font-weight:800;color:#F2B705;letter-spacing:.04em}
@keyframes pfSub{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
/* bouncer: the door shuts in their face */
#pubFx .pf-door i{position:absolute;top:0;bottom:0;right:0;width:100%;background:linear-gradient(90deg,#2a1a10,#4a2e1a 8%,#3a2414 50%,#2a1a10);box-shadow:inset 0 0 0 14px rgba(0,0,0,.25);animation:pfDoor .7s cubic-bezier(.6,0,.9,.4) both}
#pubFx .pf-door b{position:absolute;left:0;right:0;top:44%;text-align:center;font:800 30px "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#C6F36B;text-shadow:0 2px 10px #000;animation:pfSub .3s .55s both}
@keyframes pfDoor{0%{transform:translateX(100%)}70%{transform:translateX(-2%)}85%{transform:translateX(1%)}100%{transform:none}}
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
/* jukebox: a now-playing pill with equaliser bars, opposite the HR chip, for as long as the card lasts */
#pubFx .pf-np{position:absolute;right:10px;bottom:10px;display:flex;align-items:center;gap:8px;height:32px;padding:0 12px 0 10px;border-radius:9px;background:rgba(12,14,18,.78);border:1px solid rgba(255,255,255,.1);box-shadow:0 4px 14px rgba(0,0,0,.45);animation:pfSub .3s .15s both}
#pubFx .pf-np span{display:flex;align-items:flex-end;gap:2px;height:14px}
#pubFx .pf-np i{width:3px;height:100%;border-radius:1px;background:linear-gradient(0deg,#ff4fa8,#ffb23c 55%,#6fd3ff);transform-origin:50% 100%;animation:pfEq .49s ease-in-out infinite alternate}
#pubFx .pf-np i:nth-child(2){animation-duration:.37s;animation-delay:-.2s}#pubFx .pf-np i:nth-child(3){animation-duration:.61s;animation-delay:-.1s}#pubFx .pf-np i:nth-child(4){animation-duration:.43s;animation-delay:-.3s}#pubFx .pf-np i:nth-child(5){animation-duration:.55s}
@keyframes pfEq{from{transform:scaleY(.25)}to{transform:scaleY(1)}}
#pubFx .pf-np b{font:800 13px/1 "Barlow Condensed",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#fff}
#pubFx .pf-np small{font:600 11px/1 Manrope,sans-serif;color:rgba(255,255,255,.62)}
/* stamps: drink cards and blocks */
#pubFx .pf-stamp{display:flex;flex-direction:column;align-items:center;justify-content:center}
#pubFx .pf-stamp b{font:800 64px/1 "Barlow Condensed",sans-serif;color:#fff;padding:10px 22px;border:4px solid currentColor;border-radius:14px;transform:rotate(-8deg);animation:pfStamp .45s cubic-bezier(.2,1.5,.4,1) both;text-shadow:0 3px 16px rgba(0,0,0,.7)}
#pubFx .pf-stamp.drink b{color:#F2B705}#pubFx .pf-stamp.def b{color:#C6F36B}
#pubFx .pf-stamp small{margin-top:12px;font:800 14px Manrope,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#fff;text-shadow:0 2px 8px #000}
@keyframes pfStamp{from{transform:scale(2.6) rotate(-14deg);opacity:0}to{transform:rotate(-8deg);opacity:1}}
@media (prefers-reduced-motion:reduce){#pubFx *{animation-duration:.01s!important;animation-iteration-count:1!important}}
`;
})();
