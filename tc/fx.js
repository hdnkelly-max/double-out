// ===== TOPS collectibles: celebration + walk-on effects =====
// One full-screen canvas, pointer-events none, <=1.8 s per effect, capped particle counts.
// Plays on every client: your own moments from save.look.cel, opponents' from their synced look.
window.TC_FX = (function () {
  let cv = null, cx = null, parts = [], beams = [], flashes = [], raf = 0, last = 0;
  const lowPerf = () => (window.TOPS_LOWFX === true) || (navigator.hardwareConcurrency || 4) <= 2;
  function ensure() {
    if (cv) return;
    cv = document.createElement('canvas'); cv.id = 'tcFx';
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:60';
    document.body.appendChild(cv); cx = cv.getContext('2d'); size(); addEventListener('resize', size);
  }
  function size() { if (!cv) return; const d = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  function loop(t) {
    const dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
    const W = innerWidth, H = innerHeight; cx.clearRect(0, 0, W, H);
    // flashes (full-screen tints / radial glows)
    flashes = flashes.filter(f => (f.age += dt) < f.life);
    flashes.forEach(f => {
      const k = f.age / f.life, a = f.a * (k < .15 ? k / .15 : 1 - (k - .15) / .85);
      if (f.kind === 'radial') { const g = cx.createRadialGradient(W * f.x, H * f.y, 0, W * f.x, H * f.y, Math.max(W, H) * f.r * (0.6 + k * .5)); g.addColorStop(0, rgba(f.c, a)); g.addColorStop(1, rgba(f.c, 0)); cx.fillStyle = g; cx.fillRect(0, 0, W, H); }
      else if (f.kind === 'vignette') { const g = cx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .25, W / 2, H / 2, Math.max(W, H) * .75); g.addColorStop(0, rgba(f.c, 0)); g.addColorStop(1, rgba(f.c, a)); cx.fillStyle = g; cx.fillRect(0, 0, W, H); }
      else if (f.kind === 'ring') { cx.strokeStyle = rgba(f.c, a); cx.lineWidth = 6 * (1 - k) + 1; cx.beginPath(); cx.arc(W * f.x, H * f.y, Math.max(W, H) * k * f.r, 0, Math.PI * 2); cx.stroke(); }
      else if (f.kind === 'bolt') { if (k < .5 && ((f.age * 30) | 0) % 2 === 0) drawBolt(f, W, H, a); }
      else { cx.fillStyle = rgba(f.c, a); cx.fillRect(0, 0, W, H); }
    });
    // beams (lasers)
    beams = beams.filter(b => (b.age += dt) < b.life);
    cx.globalCompositeOperation = 'lighter';
    beams.forEach(b => {
      const k = b.age / b.life, a = b.a * Math.sin(Math.PI * k);
      const ang = b.a0 + (b.a1 - b.a0) * k, x0 = W * b.x, y0 = H * b.y, len = Math.max(W, H) * 1.4;
      cx.strokeStyle = rgba(b.c, a); cx.lineWidth = b.w; cx.shadowColor = rgba(b.c, a); cx.shadowBlur = 12;
      cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len); cx.stroke();
    });
    cx.shadowBlur = 0;
    // particles
    parts = parts.filter(p => (p.age += dt) < p.life);
    parts.forEach(p => {
      p.vy += p.g * dt; p.vx *= (1 - p.drag * dt); p.vy *= (1 - p.drag * dt); p.x += p.vx * dt; p.y += p.vy * dt;
      const k = p.age / p.life, a = p.a * (1 - k * k);
      if (p.kind === 'spark') { cx.strokeStyle = rgba(p.c, a); cx.lineWidth = p.s; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * .03, p.y - p.vy * .03); cx.stroke(); }
      else if (p.kind === 'smoke') { cx.globalCompositeOperation = 'source-over'; const r = p.s * (1 + k * 1.6); const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); g.addColorStop(0, rgba(p.c, a * .55)); g.addColorStop(1, rgba(p.c, 0)); cx.fillStyle = g; cx.fillRect(p.x - r, p.y - r, r * 2, r * 2); cx.globalCompositeOperation = 'lighter'; }
      else { cx.globalCompositeOperation = 'source-over'; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot += p.vr * dt); cx.fillStyle = rgba(p.c, a); cx.fillRect(-p.s, -p.s * .4, p.s * 2, p.s * .8); cx.restore(); cx.globalCompositeOperation = 'lighter'; }
    });
    cx.globalCompositeOperation = 'source-over';
    if (parts.length || beams.length || flashes.length) raf = requestAnimationFrame(loop); else { raf = 0; last = 0; cx.clearRect(0, 0, W, H); }
  }
  function kick() { ensure(); if (!raf) raf = requestAnimationFrame(loop); }
  const HEX = {}; function rgb(h) { if (HEX[h]) return HEX[h]; const n = parseInt(h.slice(1), 16); return HEX[h] = [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgba(h, a) { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`; }
  function drawBolt(f, W, H, a) {
    cx.strokeStyle = rgba('#EAF4FF', a); cx.lineWidth = 3; cx.shadowColor = rgba('#9CC8FF', a); cx.shadowBlur = 18;
    cx.beginPath(); let x = W * f.x, y = 0; cx.moveTo(x, y); const seg = 9;
    for (let i = 1; i <= seg; i++) { x += (f.seed[i] - .5) * W * .12; y = H * f.y * i / seg; cx.lineTo(x, y); }
    cx.stroke(); cx.shadowBlur = 0;
  }
  const R = Math.random, cap = n => lowPerf() ? Math.round(n * .45) : n;

  // ---------- effects ----------
  function fountain(xFrac, n, cols, up) {
    const W = innerWidth, H = innerHeight;
    for (let i = 0; i < n; i++) parts.push({ kind: 'spark', x: W * xFrac + (R() - .5) * 18, y: H * .8, vx: (R() - .5) * 140, vy: -(up * (.75 + R() * .5)), g: 900, drag: .6, life: 1.1 + R() * .5, age: -R() * .5, s: 1.6 + R() * 1.4, a: 1, c: cols[(R() * cols.length) | 0] });
  }
  function confetti(n, fromSides) {
    const W = innerWidth, H = innerHeight, cols = ['#C6F36B', '#C49A52', '#EDECE5', '#C9554A', '#7FD3C9'];
    for (let i = 0; i < n; i++) {
      const left = fromSides ? i % 2 === 0 : R() < .5;
      parts.push({ kind: 'conf', x: fromSides ? (left ? -10 : W + 10) : W * R(), y: fromSides ? H * .78 : -10, vx: fromSides ? (left ? 1 : -1) * (260 + R() * 320) : (R() - .5) * 60, vy: fromSides ? -(420 + R() * 380) : 60 + R() * 80,
        g: 520, drag: 1.4, life: 1.8 + R() * .6, age: 0, s: 4 + R() * 3, a: 1, rot: R() * 6, vr: (R() - .5) * 14, c: cols[(R() * cols.length) | 0] });
    }
  }
  function smoke(n, y) { const W = innerWidth, H = innerHeight; for (let i = 0; i < n; i++) parts.push({ kind: 'smoke', x: W * R(), y: H * (y || .95) + R() * 40, vx: (R() - .5) * 30, vy: -20 - R() * 30, g: 0, drag: .2, life: 2.6 + R(), age: -R() * .8, s: 70 + R() * 70, a: .5, c: '#B9C4C2' }); }
  function lasers(cols) { for (let i = 0; i < 6; i++) { const side = i % 2 ? .05 : .95; beams.push({ x: side, y: 0, a0: side < .5 ? 1.1 : 2.0, a1: side < .5 ? 0.35 : 2.8, life: 1.6, age: -i * .12, w: 2.5, a: .85, c: cols[i % cols.length] }); } }
  const play = {
    pyro() { fountain(.28, cap(60), ['#FFD27A', '#FF9F43', '#FFF3D6'], 1120); fountain(.72, cap(60), ['#FFD27A', '#FF9F43', '#FFF3D6'], 1120); flashes.push({ kind: 'radial', x: .5, y: .78, r: .45, c: '#FFC468', a: .45, life: .55, age: 0 }); flashes.push({ kind: 'radial', x: .5, y: .8, r: .9, c: '#FFB54A', a: .3, life: .7, age: 0 }); boom(.5); },
    nuke() { flashes.push({ kind: 'fill', c: '#FFFFFF', a: .7, life: .35, age: 0 }, { kind: 'ring', x: .5, y: .45, r: 1.1, c: '#C6F36B', a: .9, life: 1.1, age: 0 }, { kind: 'radial', x: .5, y: .45, r: .7, c: '#FFE6A0', a: .45, life: 1.3, age: 0 }); confetti(cap(120), false); boom(1); },
    confetti() { confetti(cap(140), true); pop(); },
    chant(name) { flashes.push({ kind: 'vignette', c: '#C6F36B', a: .18, life: 1.6, age: 0 }); chant(name); },
    goldflash() { flashes.push({ kind: 'radial', x: .5, y: .28, r: .55, c: '#C49A52', a: .55, life: 1.1, age: 0 }, { kind: 'ring', x: .5, y: .28, r: .6, c: '#E2C27E', a: .8, life: .9, age: 0 }); chime(); },
    green() { for (let i = 0; i < 3; i++) flashes.push({ kind: 'vignette', c: '#3BE07A', a: .45, life: .6, age: -i * .5 }); lasers(['#3BE07A']); },
    smoke() { smoke(cap(26), .95); },
    lasers() { lasers(['#C6F36B', '#7FD3C9', '#C9554A']); smoke(cap(12), .98); },
    cool() { for (let i = 0; i < 2; i++) flashes.push({ kind: 'vignette', c: '#7FD3FF', a: .45, life: .7, age: -i * .45 }); const W = innerWidth, H = innerHeight; for (let i = 0; i < cap(60); i++) parts.push({ kind: 'spark', x: W * R(), y: H * (.2 + R() * .5), vx: (R() - .5) * 40, vy: -20 - R() * 40, g: 30, drag: .4, life: 1.2 + R() * .5, age: -R() * .4, s: 1.2, a: .9, c: R() < .5 ? '#E6F7FF' : '#9ED8FF' }); chime(); },
    saltire() { beams.push({ x: 0, y: 0, a0: .85, a1: .65, life: 1.8, age: 0, w: 5, a: .9, c: '#FFFFFF' }, { x: 1, y: 0, a0: 2.3, a1: 2.5, life: 1.8, age: 0, w: 5, a: .9, c: '#FFFFFF' }); lasers(['#2F6BFF', '#FFFFFF']); smoke(cap(14), .98); },
    power() { const seed = () => Array.from({ length: 10 }, R); flashes.push({ kind: 'bolt', x: .3, y: .7, seed: seed(), a: 1, life: .5, age: 0 }, { kind: 'bolt', x: .72, y: .6, seed: seed(), a: 1, life: .5, age: -.25 }, { kind: 'fill', c: '#DDEBFF', a: .4, life: .25, age: 0 }, { kind: 'fill', c: '#DDEBFF', a: .3, life: .25, age: -.25 }); thunder(); smoke(cap(10), .98); },
  };
  const MAP = { cel_pyro: 'pyro', cel_nuke: 'nuke', cel_confetti: 'confetti', cel_chant: 'chant', cel_goldflash: 'goldflash', cel_green: 'green', walk_smoke: 'smoke', walk_lasers: 'lasers', walk_power: 'power', cel_cool: 'cool', walk_saltire: 'saltire' };
  function run(cosId, name) { const f = play[MAP[cosId]]; if (!f) return false; try { f(name); kick(); } catch (e) { console.warn('fx', e); } return true; }

  // ---------- audio (uses the game's AudioContext when present) ----------
  const hasAU = () => typeof AU !== 'undefined' && AU;
  function ac() { return (hasAU() && AU.ctx) || null; }
  function boom(g) { try { window.noiseBurst && noiseBurst({ dur: .5, freq: 90, q: .5, gain: .35 * g, type: 'lowpass' }); window.noiseBurst && noiseBurst({ dur: .9, freq: 3000, q: .4, gain: .08, type: 'bandpass', delay: .05 }); } catch (e) {} }
  function pop() { try { [0, .08, .16].forEach(d => window.noiseBurst && noiseBurst({ dur: .07, freq: 1600, q: 1, gain: .14, delay: d })); } catch (e) {} }
  function thunder() { try { window.noiseBurst && noiseBurst({ dur: 1.2, freq: 70, q: .3, gain: .4, type: 'lowpass' }); } catch (e) {} }
  function chime() { const c = ac(); if (!c) return; const t = c.currentTime; [880, 1320].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.setValueAtTime(.0001, t + i * .06); g.gain.exponentialRampToValueAtTime(.08, t + i * .06 + .02); g.gain.exponentialRampToValueAtTime(.0001, t + i * .06 + .7); o.connect(g).connect(hasAU() && AU.master || c.destination); o.start(t + i * .06); o.stop(t + i * .06 + .8); }); }
  function chant(name) {
    try {
      if (!('speechSynthesis' in window) || !name) return; const nm = String(name).split(/[ &]/)[0];
      [0, 650].forEach(d => setTimeout(() => { const u = new SpeechSynthesisUtterance(nm + '!'); u.rate = .85; u.pitch = .6; u.volume = .9; speechSynthesis.speak(u); }, d));
      window.crowdCheer && crowdCheer(1);
    } catch (e) {}
  }
  return { run, MAP, play, kick };
})();
