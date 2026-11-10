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
    names: ['deal', 'select', 'flip', 'missed', 'charge_epic', 'charge_legendary', 'rev_uncommon', 'rev_rare', 'rev_epic', 'rev_legendary', 'dupe'],
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
    const set = { select: [1800, .03, 'square', .05], flip: [420, .09, 'triangle', .12], missed: [300, .07, 'triangle', .05], deal: [600, .08, 'triangle', .04], rev_rare: [2600, .25, 'sine', .1],
      rev_uncommon: [523, .3, 'sine', .1], rev_epic: [880, .5, 'sine', .14], rev_legendary: [110, .7, 'sine', .3], charge_epic: [500, .4, 'sine', .05], charge_legendary: [300, .55, 'sine', .07], dupe: [300, .12, 'triangle', .06] }[n] || [500, .1, 'sine', .1];
    o.type = set[2]; o.frequency.setValueAtTime(set[0], t);
    if (n === 'flip') o.frequency.exponentialRampToValueAtTime(180, t + set[1]);
    if (n === 'rev_legendary') { const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 1320; const g2 = ctx.createGain(); g2.gain.setValueAtTime(0, t + .15); g2.gain.linearRampToValueAtTime(.05 * vol, t + .3); g2.gain.exponentialRampToValueAtTime(.001, t + 1.1); o2.connect(g2).connect(ctx.destination); o2.start(t + .15); o2.stop(t + 1.2); }
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
        <div class="tc__frame"></div><div class="tc__sheen"></div><div class="tc__holo"></div><div class="tc__glare"></div><div class="tc__sweep"></div>
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
    const nm = c.querySelector('.tc__name'); nm.textContent = def.name; nm.classList.toggle('is-long', def.name.length > 13);
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
      c.style.setProperty('--fx', `${50 + cx * 60}%`); c.style.setProperty('--fy', `${50 + cy * 60}%`); c.style.setProperty('--gx', `${50 + cx * 100}%`); c.style.setProperty('--gy', `${50 + cy * 100}%`);
    };
    const end = () => {
      if (!on) return; on = false;
      inner.style.transition = ''; inner.style.transform = '';
      ['--px', '--py', '--lx', '--fx', '--fy', '--gx', '--gy'].forEach(p => c.style.removeProperty(p)); c.classList.remove('is-tilting');
    };
    c.addEventListener('pointerdown', e => { if (c.classList.contains('is-flipped') && c.dataset.inspect) { on = true; c.classList.add('is-tilting'); c.setPointerCapture(e.pointerId); move(e); } });
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
    const ov = el('div', 'tcpk');
    if (opts.backdrop) ov.style.setProperty('--bd', `url(${opts.backdrop})`);
    ov.innerHTML = `<div class="tcpk__head"><div class="tcpk__kicker">Card picks</div>
      <div class="tcpk__count"><b>1</b> of ${n}</div><div class="tcpk__why"></div></div>
      <button class="tcpk__skip" ${mode === 'full' ? 'hidden' : ''} aria-pressed="${mode === 'quick'}">Fast reveals</button>
      <div class="tcpk__row"></div><p class="tcpk__hint">Pick a card</p>
      <div class="tcpk__foot"><button class="tcpk__btn tcpk__next tcpk__btn--go" hidden>Continue</button><button class="tcpk__later">Open later</button></div>
      <div class="tcpk__summary" hidden></div>`;
    document.body.appendChild(ov);
    const hint = ov.querySelector('.tcpk__hint'), row = ov.querySelector('.tcpk__row'), why = ov.querySelector('.tcpk__why'), cnt = ov.querySelector('.tcpk__count b');
    const btnNext = ov.querySelector('.tcpk__next'), btnSkip = ov.querySelector('.tcpk__skip'), btnLater = ov.querySelector('.tcpk__later');
    let quick = mode === 'quick', i = 0, busy = false; const got = [];
    btnSkip.onclick = () => { quick = !quick; btnSkip.setAttribute('aria-pressed', quick); };
    btnLater.onclick = () => { close(); opts.onLater && opts.onLater(picks.slice(i)); };
    btnNext.onclick = () => { i++; i < n ? deal() : summary(); };
    function close() { ov.classList.add('is-out'); setTimeout(() => ov.remove(), 220); }

    async function deal() {
      btnNext.hidden = true; hint.hidden = false; btnLater.hidden = false; cnt.textContent = i + 1; why.textContent = picks[i].reason || '';
      row.innerHTML = ''; busy = false;
      const cards = [0, 1, 2].map(pos => { const c = card(null); c.style.setProperty('--d', pos); c.classList.add('is-dealing'); row.appendChild(c); return c; });
      requestAnimationFrame(() => cards.forEach(c => c.classList.remove('is-dealing'))); Sfx.play('deal', .7);
      cards.forEach((c, pos) => c.addEventListener('click', () => choose(cards, pos), { once: true }));
    }
    async function choose(cards, pos) {
      if (busy) return; busy = true;
      Sfx.play('select'); buzz(8);
      hint.hidden = true; btnLater.hidden = true;
      cards.forEach((c, k) => { c.classList.add(k === pos ? 'is-hero' : 'is-behind'); if (k !== pos) c.style.setProperty('--side', k < pos || (pos === 0 && k === 1 ? false : k < pos) ? -1 : 1); });
      { const o = [0, 1, 2].filter(k => k !== pos); cards[o[0]].style.setProperty('--side', -1); cards[o[1]].style.setProperty('--side', 1); }
      let res;
      try { res = await opts.resolve(picks[i].id, pos); }
      catch (e) { busy = false; cards.forEach(c => c.classList.remove('is-hero', 'is-behind')); hint.hidden = false; why.textContent = 'Connection dropped. Your pick is safe, tap again.'; cards.forEach((c, k) => c.addEventListener('click', () => choose(cards, k), { once: true })); return; }
      res.options.forEach((d, k) => fill(cards[k], d));
      const mine = cards[pos], def = res.options[pos];
      const fms = quick ? T.quickFlip : T.flip;
      await wait(quick ? 0 : T.lift);
      if (!quick && (def.rarity === 'epic' || def.rarity === 'legendary')) { Sfx.play('charge_' + def.rarity, .9); mine.classList.add('is-charging'); await wait(def.rarity === 'legendary' ? 620 : 460); mine.classList.remove('is-charging'); }
      Sfx.play('flip');
      await flip(mine, fms);
      const r = def.rarity;
      if (r !== 'common') Sfx.play('rev_' + r, r === 'legendary' ? 1 : .85); if (r === 'epic') buzz(15); else if (r === 'legendary') buzz([20, 40, 30]);
      const owned = (res.owned && res.owned[def.id]) || 1;
      if (owned > 1) { mine.classList.add('is-dupe'); mine.dataset.dupe = `Duplicate · ${owned} owned`; Sfx.play('dupe', .5); }
      else tag(mine, def.cosmetic ? `New · unlocks ${def.cosmetic}` : 'New', 'new');
      mine.dataset.inspect = '1';
      got.push({ def, dupe: owned > 1 });
      await wait(quick ? 120 : T.react);
      for (let k = 0; k < 3; k++) if (k !== pos) {
        const c = cards[k]; c.classList.add('is-missed'); Sfx.play('missed', .5); flip(c, quick ? T.quickFlip : 360); tag(c, 'Missed');
        await wait(T.othersGap);
      }
      await wait(quick ? 150 : 300);
      btnNext.textContent = i + 1 < n ? `Continue · ${n - i - 1} left` : 'Done'; btnNext.hidden = false; btnLater.hidden = i + 1 >= n;
    }
    function summary() {
      row.innerHTML = ''; ov.querySelector('.tcpk__foot').hidden = true; ov.querySelector('.tcpk__head').hidden = true;
      const s = ov.querySelector('.tcpk__summary'); s.hidden = false;
      const order = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
      const sorted = got.slice().sort((a, b) => order.indexOf(a.def.rarity) - order.indexOf(b.def.rarity));
      s.innerHTML = `<div class="tcpk__kicker">You kept</div><div class="tcpk__grid"></div><button class="tcpk__btn tcpk__btn--go tcpk__done">Done</button>`;
      const g = s.querySelector('.tcpk__grid');
      sorted.forEach(x => { const c = card(x.def); c.classList.add('is-flipped', 'is-mini'); if (x.dupe) tag(c, 'Dupe', 'dupe'); g.appendChild(c); });
      s.querySelector('.tcpk__done').onclick = () => { close(); opts.onDone && opts.onDone(got); };
    }
    deal();
    return { close };
  }

  root.TopsCards = { card, fill, flip, openPack, Sfx, TIMING: T };
})(window);
