/* TOPS collectible cards: renderer + pack screen.
   No dependencies. The game supplies a `resolve(pickId, position)` that calls the server
   and returns { options:[def,def,def], chosen:0..2, owned:{[cardId]:count} }.
   Card def: { id, name, no, set, rarity:'common'|'uncommon'|'rare'|'epic'|'legendary', art, cosmetic? } */
(function (root) {
  'use strict';
  const RAR = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
  const T = { arrive: 180, stagger: 60, lift: 120, flip: 540, react: 490, othersGap: 100, quickFlip: 200 };
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- audio: tiny palette, preloaded, one context ---------- */
  const Sfx = {
    ctx: null, buf: {}, muted: false, base: 'assets/sfx/',
    names: ['select', 'flip', 'tick', 'chime', 'legendary', 'dupe'],
    async init(base) {
      if (base) this.base = base;
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      await Promise.all(this.names.map(async n => {
        try { const r = await fetch(this.base + n + '.mp3'); this.buf[n] = await this.ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { /* optional */ }
      }));
    },
    play(n, vol = 0.8) {
      if (this.muted || !this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const b = this.buf[n]; if (!b) return synth(this.ctx, n, vol);
      const s = this.ctx.createBufferSource(), g = this.ctx.createGain(); g.gain.value = vol;
      s.buffer = b; s.connect(g).connect(this.ctx.destination); s.start();
    }
  };
  // fallback synth so the prototype has sound before real files exist
  function synth(ctx, n, vol) {
    const t = ctx.currentTime, g = ctx.createGain(); g.connect(ctx.destination);
    const o = ctx.createOscillator();
    const set = { select: [1800, .03, 'square', .05], flip: [420, .09, 'triangle', .12], tick: [2600, .05, 'sine', .1],
      chime: [880, .5, 'sine', .14], legendary: [110, .7, 'sine', .3], dupe: [300, .12, 'triangle', .06] }[n] || [500, .1, 'sine', .1];
    o.type = set[2]; o.frequency.setValueAtTime(set[0], t);
    if (n === 'flip') o.frequency.exponentialRampToValueAtTime(180, t + set[1]);
    if (n === 'legendary') { const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 1320; const g2 = ctx.createGain(); g2.gain.setValueAtTime(0, t + .15); g2.gain.linearRampToValueAtTime(.05 * vol, t + .3); g2.gain.exponentialRampToValueAtTime(.001, t + 1.1); o2.connect(g2).connect(ctx.destination); o2.start(t + .15); o2.stop(t + 1.2); }
    g.gain.setValueAtTime(set[3] * vol, t); g.gain.exponentialRampToValueAtTime(.001, t + set[1]);
    o.connect(g); o.start(t); o.stop(t + set[1] + .02);
  }
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

  /* ---------- card element ---------- */
  function card(def) {
    const c = el('div', 'tc'); c.dataset.r = def ? def.rarity : 'common';
    c.innerHTML = `<div class="tc__tag"></div><div class="tc__inner">
      <div class="tc__face tc__back"></div>
      <div class="tc__face tc__front"><div class="tc__art"></div><div class="tc__foil"></div>
        <div class="tc__frame"></div><div class="tc__sheen"></div><div class="tc__sweep"></div>
        <div class="tc__plate"><div class="tc__name"></div><div class="tc__meta"><span class="tc__set"></span><span class="tc__rar"></span></div></div>
      </div></div>`;
    if (def) fill(c, def);
    tilt(c);
    return c;
  }
  function fill(c, def) {
    c.dataset.r = def.rarity; c.dataset.id = def.id;
    c.querySelector('.tc__art').style.backgroundImage = def.art ? `url(${def.art})` : '';
    if (def.foilMask) c.style.setProperty('--foil-mask', `url(${def.foilMask}) center/cover`);
    const nm = c.querySelector('.tc__name'); nm.textContent = def.name; nm.style.fontSize = def.name.length > 16 ? 'calc(var(--card-w)*.072)' : def.name.length > 11 ? 'calc(var(--card-w)*.086)' : '';
    c.querySelector('.tc__set').innerHTML = `No. ${String(def.no).padStart(3, '0')}<span class="tc__setname"> · ${esc(def.set)}</span>`;
    c.querySelector('.tc__rar').textContent = RAR[def.rarity];
  }
  // touch-drag tilt, max 6 deg; art parallax 3px; light follows the finger
  function tilt(c) {
    let on = false;
    const inner = c.querySelector('.tc__inner');
    const move = e => {
      if (!on || !c.classList.contains('is-flipped')) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      const cx = Math.max(-.5, Math.min(.5, x)), cy = Math.max(-.5, Math.min(.5, y));
      inner.style.transition = 'transform 60ms linear';
      inner.style.transform = `rotateY(${180 - cx * 12}deg) rotateX(${cy * 12}deg)`;
      c.style.setProperty('--px', `${-cx * 6}px`); c.style.setProperty('--py', `${-cy * 6}px`);
      c.style.setProperty('--lx', `${50 + cx * 90}%`);
      c.style.setProperty('--fx', `${50 + cx * 60}%`); c.style.setProperty('--fy', `${50 + cy * 60}%`);
    };
    const end = () => {
      if (!on) return; on = false;
      inner.style.transition = ''; inner.style.transform = '';
      ['--px', '--py', '--lx', '--fx', '--fy'].forEach(p => c.style.removeProperty(p));
    };
    c.addEventListener('pointerdown', e => { if (c.classList.contains('is-flipped') && c.dataset.inspect) { on = true; c.setPointerCapture(e.pointerId); move(e); } });
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
  }
  async function flip(c, ms) {
    if (ms) c.style.setProperty('--flip-ms', ms + 'ms');
    c.classList.add('is-flipped');
    await wait(reduce() ? 0 : (ms || T.flip) * .5);
    const r = c.dataset.r;
    if (r === 'legendary' && !reduce()) { c.classList.remove('do-sweep'); void c.offsetWidth; c.classList.add('do-sweep'); }
    await wait(reduce() ? 0 : (ms || T.flip) * .5);
  }
  function tag(c, text, kind) { const t = c.querySelector('.tc__tag'); t.textContent = text; t.className = 'tc__tag' + (kind ? ' is-' + kind : ''); c.classList.add('show-tag'); }

  /* ---------- pack screen ---------- */
  // opts: { picks:[{id, reason}], resolve(pickId,pos)->Promise, onDone(), onLater(), backdrop?:url }
  function openPack(opts) {
    const picks = opts.picks.slice();
    const n = picks.length;
    const mode = n >= 8 ? 'quick' : n >= 4 ? 'skippable' : 'full';
    const ov = el('div', 'pk');
    if (opts.backdrop) ov.style.setProperty('--bd', `url(${opts.backdrop})`);
    ov.innerHTML = `<div class="pk__head"><div class="pk__kicker">Card picks</div>
      <div class="pk__count"><b>1</b> of ${n}</div><div class="pk__why"></div></div>
      <div class="pk__row"></div>
      <div class="pk__foot"><button class="pk__btn pk__later">Open later</button>
      <button class="pk__btn pk__skip" ${mode === 'full' ? 'hidden' : ''}>${mode === 'quick' ? 'Quick open: on' : 'Skip animation'}</button>
      <button class="pk__btn pk__next pk__btn--go" hidden>Next pick</button></div>
      <div class="pk__summary" hidden></div>`;
    document.body.appendChild(ov);
    const row = ov.querySelector('.pk__row'), why = ov.querySelector('.pk__why'), cnt = ov.querySelector('.pk__count b');
    const btnNext = ov.querySelector('.pk__next'), btnSkip = ov.querySelector('.pk__skip'), btnLater = ov.querySelector('.pk__later');
    let quick = mode === 'quick', i = 0, busy = false; const got = [];
    btnSkip.onclick = () => { quick = !quick; btnSkip.textContent = quick ? 'Quick open: on' : 'Skip animation'; };
    btnLater.onclick = () => { close(); opts.onLater && opts.onLater(picks.slice(i)); };
    btnNext.onclick = () => { i++; i < n ? deal() : summary(); };
    function close() { ov.classList.add('is-out'); setTimeout(() => ov.remove(), 220); }

    async function deal() {
      btnNext.hidden = true; cnt.textContent = i + 1; why.textContent = picks[i].reason || '';
      row.innerHTML = ''; busy = false;
      const cards = [0, 1, 2].map(pos => { const c = card(null); c.style.setProperty('--d', pos); c.classList.add('is-dealing'); row.appendChild(c); return c; });
      requestAnimationFrame(() => cards.forEach(c => c.classList.remove('is-dealing')));
      cards.forEach((c, pos) => c.addEventListener('click', () => choose(cards, pos), { once: true }));
    }
    async function choose(cards, pos) {
      if (busy) return; busy = true;
      Sfx.play('select'); buzz(8);
      cards.forEach((c, k) => c.classList.add(k === pos ? 'is-chosen' : 'is-other'));
      let res;
      try { res = await opts.resolve(picks[i].id, pos); }
      catch (e) { busy = false; cards.forEach(c => c.classList.remove('is-chosen', 'is-other')); why.textContent = 'Connection dropped. Your pick is safe, tap again.'; cards.forEach((c, k) => c.addEventListener('click', () => choose(cards, k), { once: true })); return; }
      res.options.forEach((d, k) => fill(cards[k], d));
      const mine = cards[pos], def = res.options[pos];
      const fms = quick ? T.quickFlip : T.flip;
      await wait(quick ? 0 : T.lift);
      Sfx.play('flip');
      await flip(mine, fms);
      const r = def.rarity;
      if (r === 'rare') Sfx.play('tick'); else if (r === 'epic') { Sfx.play('chime'); buzz(15); } else if (r === 'legendary') { Sfx.play('legendary', 1); buzz([20, 40, 30]); }
      const owned = (res.owned && res.owned[def.id]) || 1;
      if (owned > 1) { tag(mine, `Duplicate · ${owned} owned`, 'dupe'); Sfx.play('dupe', .5); }
      else tag(mine, def.cosmetic ? `New · unlocks ${def.cosmetic}` : 'New', 'new');
      mine.dataset.inspect = '1';
      got.push({ def, dupe: owned > 1 });
      await wait(quick ? 120 : T.react);
      for (let k = 0; k < 3; k++) if (k !== pos) {
        const c = cards[k]; c.classList.add('is-missed'); flip(c, quick ? T.quickFlip : 360); tag(c, 'Missed');
        await wait(T.othersGap);
      }
      await wait(quick ? 150 : 300);
      btnNext.textContent = i + 1 < n ? 'Next pick' : 'Done'; btnNext.hidden = false;
    }
    function summary() {
      row.innerHTML = ''; ov.querySelector('.pk__foot').hidden = true; ov.querySelector('.pk__head').hidden = true;
      const s = ov.querySelector('.pk__summary'); s.hidden = false;
      const order = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
      const sorted = got.slice().sort((a, b) => order.indexOf(a.def.rarity) - order.indexOf(b.def.rarity));
      s.innerHTML = `<div class="pk__kicker">You kept</div><div class="pk__grid"></div><button class="pk__btn pk__btn--go pk__done">Done</button>`;
      const g = s.querySelector('.pk__grid');
      sorted.forEach(x => { const c = card(x.def); c.classList.add('is-flipped', 'is-mini'); if (x.dupe) tag(c, 'Dupe', 'dupe'); g.appendChild(c); });
      s.querySelector('.pk__done').onclick = () => { close(); opts.onDone && opts.onDone(got); };
    }
    deal();
    return { close };
  }

  root.TopsCards = { card, fill, flip, openPack, Sfx, TIMING: T };
})(window);
