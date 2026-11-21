// TOPS Season 3 · Experience (EXP-S3C). Everything here is behind the Season 3 flag; with the flag off this file installs nothing
// except the hidden tester switch on the title screen.
//
// Flag: window.TOPS_S3FLAG (Career owns it: S3_DEFAULT, ?s3=1 / ?s3=0, localStorage tops_s3). This file adds the hidden tester switch:
// 5 taps on the version label on the title screen flips it (Hayden 07:45: no Menu toggle players can find).
//
// Data comes from Career (W1/W2/W6/W7). Interface this file reads (Career owns the data; this file only presents it):
//   TOPS_S3.state()   the Circuit career, shape of tc/circuit.js newCareer(): {level, week, bank, pts, oom, history, live, debt, dpnzEv, ...}
//   TOPS_S3.book(id)  pay entry + travel, start the event          -> {ok} | {ok:false, why}
//   TOPS_S3.play()    walk on for the live event's next match (the game's real match)
//   TOPS_S3.advance() hardship advance                              -> {ok, amt} | {ok:false, why}
//   TOPS_S3.moneyMatch() the back-room money match
//   TOPS_HISTORY.rows() Season 1/2 board: [{name, you, furthest:{level, n}, bestAvg, closest9}] (closest9 = fewest darts in a won 501 leg) | null
//   TOPS_BESTLEG.mine() {darts} | null ;  TOPS_BESTLEG.table() -> Promise<[{name, you, darts}]>
// Until Career's functions exist, a dev stand-in runs the real engine (TOPS_CIRCUIT) on a local copy, so the screens can be built and tested.
(function () {
  'use strict';
  const q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(''); } })();
  const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} };
  const ON = !!window.TOPS_S3FLAG;   /* the one Season 3 flag (Career, top of game4.js; Overseer 08:08) */

  /* ---------- hidden tester switch: 5 taps on the title's version label within 3 s (works with S3 on or off) ---------- */
  (function hidden() {
    let n = 0, t0 = 0;
    document.addEventListener('click', e => {
      const v = e.target && e.target.closest && e.target.closest('#tlVer'); if (!v) return;
      const now = Date.now(); if (now - t0 > 3000) n = 0; t0 = now; n++;
      if (n < 5) return; n = 0;
      lsSet('tops_s3', ON ? '0' : '1');   /* Career's key: '1' on, '0' the sticky opt-out */
      try { v.textContent = ON ? 'Season 3 test off · reloading' : 'Season 3 test on · reloading'; } catch (x) {}
      setTimeout(() => { try { location.reload(); } catch (x) {} }, 700);
    }, true);
  })();
  if (!ON) return;
  try { document.documentElement.classList.add('s3-on'); } catch (e) {}

  /* ---------- s3/ image switch (W9): a person or venue image shows its Vinyl redo, or an on-brand placeholder, never the old lifelike image ---------- */
  // TOPS_S3_HAVE (from build.js): the repo paths that have a redo at 's3/' + path. PEOPLE: the paths that show a person or a venue
  // (Director's art audit, 10-season3-build.md); one of those without a redo yet shows a plain dark placeholder (Hayden 07:55).
  // Objects (darts, trophies, badges, icons) keep their own images.
  const PH = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><defs><radialGradient id="g" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#2a1416"/><stop offset="1" stop-color="#0d0f10"/></radialGradient></defs><rect width="64" height="64" fill="url(#g)"/></svg>');
  const HAVE = {}; (window.TOPS_S3_HAVE || []).forEach(p => { HAVE[p] = 1; });
  const PEOPLE = /^(assets\/rb\/(tn_t\d+f?|venue_t\d|w_win_t\d|w_loss_t\d|w_rw_[\w-]+|result_\w+|opp_\w+|lk_[mf][\w-]*|locker|t_hero|backroom|pack)\.\w+|assets\/ui\/(bg_\w+|th_\w+|card_(gang|pass|steady|stare|tap|turns|wing|heckle|invasion|crowd))\.\w+|assets\/bets\/(hot|steady|tight)\.\w+|img\/(splash|menu\w*|v\d)\.\w+|assets\/venue\/(club_team|club_throw|club_raffle|pub_\d)\.\w+|assets\/cards\/art\/((tl|tn|rd|pr)_[\w-]+|anika|bigmal|deano|jonno|kev|mo|pete|phil|shazza|sherlock|tama|comeback|green|madhouse|regional|robbed|robin|water|whitewash|wigan|chalker|tunnel|transtasman|nuke|anderson|barneveld|humphries|power|price|smith|wright|bar|club|kauri|lastorders|oche|palace|papakura|practiceboard|rsa|dpnz)\.\w+)$/;
  const PATH = /(?:\.\/)?((?:assets|img)\/[\w\/.-]+?\.(?:jpe?g|png|webp))/g;
  /* the build's content hash per s3/ file (TOPS_S3V), so a repainted picture under the same name is a new URL for the HTTP cache and Cache Storage (Q&D 12:02) */
  const s3u = u => { const h = (window.TOPS_S3V || {})[u]; return h ? u + '?v=' + h : u; };
  const one = p => HAVE[p] ? s3u('s3/' + p) : PEOPLE.test(p) ? PH : null;
  const swap = s => (typeof s !== 'string') ? s :   /* no length cap: the Locker's recoloured hero is a long data: URL with the venue image after it */ s.replace(PATH, (m, p, off, str) => (off >= 3 && str.slice(off - 3, off) === 's3/') ? m : (one(p) || m));   /* an s3/ path is left alone */
  window.TOPS_S3_IMG = swap;
  {
    const wrapSet = (proto, prop, fn) => { const d = Object.getOwnPropertyDescriptor(proto, prop); if (!d || !d.set) return;
      Object.defineProperty(proto, prop, { configurable: true, enumerable: d.enumerable, get: d.get, set(v) { return d.set.call(this, fn(v, this)); } }); };
    try { wrapSet(HTMLImageElement.prototype, 'src', (v, img) => { const n = swap(v); if (n !== v && n.indexOf('s3/') >= 0) img.addEventListener('error', function back() { miss(n); img.src = PH; }, { once: true }); return n; }); } catch (e) {}
    try { wrapSet(Element.prototype, 'innerHTML', v => swap(v)); } catch (e) {}
    try { const sa = Element.prototype.setAttribute; Element.prototype.setAttribute = function (k, v) { return sa.call(this, k, (k === 'src' || k === 'style') ? swap(v) : v); }; } catch (e) {}
    try { const sp = CSSStyleDeclaration.prototype.setProperty; CSSStyleDeclaration.prototype.setProperty = function (k, v, p) { return sp.call(this, k, swap(v), p); };
      ['background', 'backgroundImage', 'cssText'].forEach(p => wrapSet(CSSStyleDeclaration.prototype, p, v => swap(v))); } catch (e) {}
    const sheets = () => { try { document.querySelectorAll('style').forEach(s => { if (s.dataset.s3) return; const t = s.textContent, n = swap(t); if (n !== t) s.textContent = n; s.dataset.s3 = 1; }); } catch (e) {} };
    /* images the game set before this file loaded (title menu art, sign-in splash at boot): set them again through the switch */
    const rescan = () => { try { sheets(); document.querySelectorAll('img[src]').forEach(im => { const v = im.getAttribute('src'), n = swap(v); if (n !== v) im.src = v; });
      document.querySelectorAll('[style*="url("]').forEach(e => { const v = e.getAttribute('style'), n = swap(v); if (n !== v) e.setAttribute('style', v); }); } catch (e) {} };
    rescan(); document.addEventListener('DOMContentLoaded', rescan); window.addEventListener('load', rescan);
  }
  const missed = {}; function miss(p) { if (missed[p]) return; missed[p] = 1; try { window.TOPS_LOG && TOPS_LOG('s3_img_miss', { p }); } catch (e) {} }

  /* ---------- helpers ---------- */
  const $id = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const money = n => '$' + Math.round(+n || 0).toLocaleString('en-NZ');
  const CI = () => window.TOPS_CIRCUIT;
  /* a round's name (the engine's FIN_NAME names a FINISH: losing the final = Runner-up; the round itself is the Final) */
  const RN = { G: 'Group match', F: 'Final', SF: 'Semi-final', QF: 'Quarter-final', L16: 'Last 16', L32: 'Last 32', L64: 'Last 64', L128: 'Last 128' };
  const roundName = r => RN[r] || r || ''; window.TOPS_S3_ROUND = roundName;
  const IMG = 'assets/rb/';
  const lvArt = i => `${IMG}venue_t${Math.max(0, Math.min(6, i | 0))}.jpg`;   // the level's venue card (W9 swaps it to the Vinyl plate through the manifest)
  const GRAD = ['#5b2a1a', '#1f3b4d', '#2e4a2a', '#4a1d22', '#2a2f5a', '#3a3a3a', '#5a1218'];
  const SHORT = ['Pub', 'Club', 'Opens', 'DPNZ', 'Trans-Tas', 'Tour Card', 'Palace'];
  const TOWN = s => String(s || '').replace(/^DPNZ Tour · /, '').replace(/^Players Championship · /, '');

  /* ---------- data: Career's functions, else the dev stand-in ---------- */
  const API = () => window.TOPS_S3 || {};
  const live3 = () => { const a = API(); return typeof a.view === 'function' && typeof a._circ === 'function'; };
  const DEVK = 'tops_s3c_dev';
  let devC = null;
  const devState = () => { if (devC) return devC; try { devC = JSON.parse(lsGet(DEVK) || 'null'); } catch (e) {} if (!devC && CI()) devC = CI().newCareer({}); return devC; };
  const devSave = () => lsSet(DEVK, JSON.stringify(devC));
  const isDev = () => !live3();
  // Career's TOPS_S3: the engine state lives in save.career.circuit and save.career.bank is the one bank (tc/s3.js); read it, never write it
  const real = () => { const k = API()._circ(); if (!k) return null; try { k.bank = (career() || {}).bank || 0; } catch (e) {} return k; };
  const D = {
    st() { try { return isDev() ? devState() : real(); } catch (e) { console.warn('s3 state', e); return null; } },
    oppName() { try { const v = !isDev() && API().view(); return v && v.live && v.live.opp ? v.live.opp.name : ''; } catch (e) { return ''; } },
    book(id) { if (!isDev()) return API().book(id); const r = CI().book(devState(), id); devSave(); return r; },
    play() { if (!isDev()) { if (!API().play()) toast('<b>Can\'t walk on</b><span>The event isn\'t running</span>'); return; } devTap = 1; render(); },
    advance() { if (!isDev()) return API().advance(); const r = CI().advance(devState()); devSave(); return r; },
    rest() { if (!isDev()) return API().rest(); const r = CI().restWeek(devState()); devSave(); return r; },
    recover() { if (!isDev()) return API().recover(); const r = CI().recoveryEntry(devState()); devSave(); return r; },
    moneyMatch() { if (!isDev() && API().moneyMatch) return API().moneyMatch(); try { moneyMatch(); } catch (e) { console.warn('s3 money match', e); } },
    devResult(won) { const r = CI().result(devState(), won); devSave(); devTap = 0; return r; }
  };
  let devTap = 0;
  window.TOPS_S3UI_DEV = D;   // tests drive the dev stand-in through this (never used when Career's TOPS_S3 is present)

  /* ---------- what changed since the last screen: drives the round toast, the event result and the promotion moment ---------- */
  // The match reloads the page (ENG-RESET), so nothing is kept in memory: the last state the player SAW is kept on the device and compared
  // with the state now. A result is shown once; OK marks it seen. Works whether or not Career fires an event.
  const SEENK = 'tops_s3_seen';
  const snap = c => ({ h: (c.history || []).length, lv: c.level, r: c.live ? c.live.round : -1, id: c.live ? c.live.id : '', g: c.live && c.live.g ? c.live.g.p : 0 });
  const seenGet = () => { try { return JSON.parse(lsGet(SEENK) || 'null'); } catch (e) { return null; } };
  const seenSet = s => lsSet(SEENK, JSON.stringify(s));
  function pending(c) {
    const was = seenGet(), now = snap(c);
    if (!was) { seenSet(now); return null; }
    if (now.h > was.h) { const rec = c.history[c.history.length - 1], C = CI();
      if (!rec || typeof rec !== 'object' || !C || !C.eventOf(rec.id) || !C.LEVELS[rec.level]) { seenSet(now); return null; }   /* a broken or unknown last result: nothing to announce, never a crash */
      return { kind: 'done', rec, up: now.lv !== was.lv ? { from: was.lv, to: now.lv } : null, now }; }
    if (now.id && now.id === was.id && (now.r > was.r || now.g > was.g)) return { kind: 'round', now };
    if (now.lv !== was.lv) return { kind: 'level', up: { from: was.lv, to: now.lv }, now };
    if (now.id !== was.id || now.r !== was.r) { seenSet(now); }   // booked a new event, nothing to announce
    return null;
  }

  /* ---------- Circuit tab ---------- */
  let sub = 'week';   // week | oom | results
  function circuit() {
    const C = CI(), c = D.st(); if (!C || !c) return `<div class="rb-card"><span class="rb-t2">The Circuit is loading</span></div>`;
    const L = C.LEVELS[c.level], have = c.pts[L.id] || 0, need = L.need;
    const best = C.BEST_N[L.id], bestTxt = best && best < 50 ? `best ${best} count` : 'every result counts';
    const ladder = C.LEVELS.map((x, i) => `<li class="${i < c.level ? 's3-done' : i === c.level ? 's3-now' : ''}"><i></i><span>${SHORT[i]}</span></li>`).join('');
    const head = `<section class="s3-lv">
      <div class="s3-lvart" style="background:url(${lvArt(c.level)}) 50% 40%/cover no-repeat,${GRAD[c.level]}"></div><div class="s3-lvsh"></div>
      <div class="s3-lvtx"><span class="rb-kick">Level ${c.level + 1} of 7 · week ${c.week}</span><span class="s3-lvn">${esc(L.n)}</span><span class="rb-sub">${esc(L.s)}</span></div>${X ? trChip(c) : ''}
    </section>
    <div class="rb-card s3-prog">
      ${need ? `<div class="s3-row"><span class="s3-lab">To move up · ${bestTxt}</span><b class="s3-num">${have} <small>/ ${need} pts</small></b></div><div class="rb-bar"><i style="width:${Math.min(100, 100 * have / need)}%"></i></div>` : ''}
      <span class="rb-sub">${esc(L.up)}</span>
      ${c.debt ? `<span class="s3-warn">You owe ${money(c.debt)} · half of each prize until it's clear</span>` : ''}
      <ol class="s3-ladder" aria-label="The seven levels, you're on ${esc(L.n)}">${ladder}</ol>
    </div>`;
    const isO = L.oom || L.id === 'tt';
    const seg = `<div class="rb-seg" role="tablist">${[['week', c.live ? 'Playing now' : 'This week'], L.id === 'dpnz' ? ['oom', 'Order of Merit'] : null, ['results', 'Results']].filter(Boolean).map(([k, n]) => `<button type="button" role="tab" data-s3sub="${k}" aria-selected="${sub === k}">${n}</button>`).join('')}</div>`;
    if (sub === 'oom' && L.id !== 'dpnz') sub = 'week';
    let body = '';
    if (sub === 'oom') body = oom(c);
    else if (sub === 'results') body = results(c);
    else body = c.live ? live(c) : week(c);
    return head + seg + body + records(c) + (isO ? '' : '');
  }
  /* 'N titles' on the level card: opens Locker > Trophies (EXP-IDLE 3, behind s3x=1); hidden until there's something on the shelf */
  function trChip(c) { const d = shelfData(c, CI()), w = d.titles, f = d.runnerUp; if (d.empty) return '';
    return `<button type="button" class="s3-trchip" data-s3="troph">${CUP(w ? 'W' : 'F', 's3cupchip')}<span>${w ? w + ' title' + (w > 1 ? 's' : '') : f + ' final' + (f > 1 ? 's' : '')}</span><i aria-hidden="true">›</i></button>`; }
  function week(c) {
    const C = CI(), cal = C.calendar(c);
    /* CAR-DEADWK (Producer 13:40): a week with nothing on at your level is a rest week with one way on: straight to the next event */
    if (!cal.length && X) return restX(c);   /* EXP-IDLE 4 (behind s3x=1): the rest week in the result-screen pattern */
    if (!cal.length) { const nx = C.nextEventWeek ? C.nextEventWeek(c) : null, gap = nx != null ? nx - c.week : 0;
      return `<div class="rb-sh"><h3>Rest week</h3></div><div class="rb-card s3-rest"><span class="rb-t2">${nx != null ? `Nothing on at this level until week ${nx}` : 'Nothing on at this level'}</span><span class="rb-sub">Rest up. The next event is ${gap > 1 ? gap + ' weeks away' : 'next week'}.</span>
      <button class="rb-primary s3-grow" type="button" data-s3="rest"><b>${nx != null ? 'Advance to week ' + nx : 'Advance'}</b><small>${nx != null ? (gap > 1 ? 'Skips ' + gap + ' weeks' : 'One week on') + ' · the next event at your level' : ''}</small></button></div>`; }
    let h = '';
    /* CAR-DEADWK layout (Q&D): when broke, the way out comes first, above the posters you can't afford */
    if (C.broke(c) && X) h += brokeX(c);   /* EXP-IDLE 4 (behind s3x=1) */
    else if (C.broke(c)) { const ro = C.recoveryOffer ? C.recoveryOffer(c) : null;
      h += `<div class="rb-sh"><h3>Can't afford a trip this week</h3></div><div class="rb-card s3-broke"><span class="rb-sub">${ro ? `A recovery entry covers the cheapest event, paid back from half of each prize. ` : ''}A money match in the back room pays too.${c.debt ? '' : ' Or take the hardship advance: two entries, paid back from half of each prize.'}</span>
      ${ro ? `<button class="rb-primary s3-grow" type="button" data-s3="rec"><b>Recovery entry</b><small>${esc(ro.n)} · ${money(ro.cost)} covered${c.debt ? ' · then you owe ' + money(c.debt + ro.cost) : ', paid back from prizes'}</small></button>` : ''}
      <div class="s3-two"><button class="rb-ghost" type="button" data-s3="mm">Money match</button>${c.debt ? '' : `<button class="rb-ghost" type="button" data-s3="adv">Hardship advance</button>`}</div></div>`; }
    const noNeed = X && C.broke(c) && C.recoveryOffer && !!C.recoveryOffer(c);   /* 4b (C): while the recovery card offers a way in, the posters drop their greyed 'Need $X' button */
    h += `<div class="rb-sh"><h3>${C.broke(c) ? 'On this week' : 'On this week · pick one'}</h3></div>` + cal.map(e => poster(c, e, noNeed)).join('');
    return h;
  }
  /* ---------- EXP-IDLE 4 · rest week and broke week (behind s3x=1), on Career's CAR-DEADWK data (nextEventWeek, restWeek, recoveryOffer, broke).
     Same pattern as the result screen: a kicker, one plain headline, the facts as rows, one red action that says exactly what it does. ---------- */
  /* 4b (A): the section header above the rest or broke card names the level and week and pins to the top of the scroller, so the level
     isn't lost when the page opens scrolled to the card. wire() adds its divider once the level card has scrolled away. */
  const ctxLine = (c, tag) => `<div class="s3-ctx"><span><b>${esc(CI().LEVELS[c.level].n)}</b> · Week ${c.week}${tag ? ' · ' + tag : ''}</span></div>`;
  function restX(c) {
    const C = CI(), L = C.LEVELS[c.level], nx = C.nextEventWeek ? C.nextEventWeek(c) : null;
    if (nx == null) return ctxLine(c, 'rest week') + `<div class="s3-rp s3-wk"><div class="s3-rph s3-wkh"><b class="s3-wkup">Nothing on</b><span>No event at ${esc(L.n)} in the next ${C.REST_SCAN || 156} weeks. Play a money match or practise.</span></div>
      <div class="s3-two"><button class="rb-ghost" type="button" data-s3="mm">Money match</button><button class="rb-ghost" type="button" data-s3="toprac">Practice</button></div></div>`;
    const gap = nx - c.week, evs = C.calendar(Object.assign({}, c, { week: nx })), e = evs.slice().sort((a, b) => a.cost - b.cost)[0], win = C.prizeFor(e, 'W'), can = c.bank >= e.cost;
    /* the weeks between: now (resting), the skipped ones, the event week. More than 5 skipped fold into one '… N weeks' cell */
    const mid = gap - 1, cells = [`<li class="s3-rpnow s3-wkrest"><b>Wk ${c.week}</b><small>Rest</small></li>`]
      .concat(mid > 5 ? [`<li class="s3-rpoff"><b>…</b><small>${mid} weeks</small></li>`] : Array.from({ length: mid }, (_, i) => `<li class="s3-rpoff"><b>Wk ${c.week + 1 + i}</b><small>Rest</small></li>`))
      .concat([`<li class="s3-rpnext s3-wkev"><b>Wk ${nx}</b><small>${esc(TOWN(e.n).split(' · ')[0])}</small></li>`]).join('');
    return ctxLine(c, 'rest week') + `<div class="s3-rp s3-wk">
      <div class="s3-rph s3-wkh"><b class="s3-wkup">Next up</b><b class="s3-wkevn">${esc(e.n)}</b><span>${gap > 1 ? `Week ${nx}. Nothing on at ${esc(L.n)} for ${gap} weeks.` : `Week ${nx}. Nothing on at ${esc(L.n)} this week.`}</span></div>
      <ol class="s3-rpdraw s3-wkline" aria-label="Weeks to the next event">${cells}</ol>
      <div class="s3-wkev2" style="background:url(${lvArt(e.level)}) 30% 62%/cover no-repeat,${GRAD[e.level]}"><span>${esc(e.where || L.n)}</span></div>
      <div class="s3-rpbar"><div class="s3-rprow"><span>Winner takes</span><b>${money(win)}</b></div><div class="s3-rprow"><span>To enter${e.travel ? ' (entry + travel)' : ''}</span><b>${money(e.cost)}</b></div>
        <div class="s3-rprow"><span>Tour budget</span><b class="${can ? '' : 's3-neg'}">${money(c.bank)}${can ? '' : ` · short ${money(e.cost - c.bank)}`}</b></div></div>
      <button class="rb-primary s3-grow" type="button" data-s3="rest"><b>${gap > 1 ? 'Skip to week ' + nx : 'On to week ' + nx}</b><small>${gap > 1 ? gap + ' weeks on · ' : ''}${esc(TOWN(e.n).split(' · ')[0])} is next</small></button>
      <button class="s3-wklink" type="button" data-s3="toprac">Practise first ›</button></div>`;
  }
  function brokeX(c) {
    const C = CI(), ro = C.recoveryOffer ? C.recoveryOffer(c) : null, cal = C.calendar(c), cheap = cal.slice().sort((a, b) => a.cost - b.cost)[0];
    const mm = (typeof MM_PAY !== 'undefined' && MM_PAY[c.level]) || null;
    const opt = (k, cls, t, d) => `<button class="${cls} s3-grow s3-bkopt" type="button" data-s3="${k}"><b>${t}</b><small>${d}</small></button>`;
    return ctxLine(c) + `<div class="s3-rp s3-wk s3-bk">
      <div class="s3-rph s3-wkh"><b class="s3-wkup">Get back on tour</b><span class="s3-wksub">Can't afford a trip this week</span></div>
      <div class="s3-rpbar"><div class="s3-rprow"><span>Cheapest trip${cheap ? ' · ' + esc(TOWN(cheap.n).split(' · ')[0]) : ''}</span><b>${cheap ? money(cheap.cost) : '–'}</b></div><div class="s3-rprow"><span>Tour budget</span><b class="s3-neg">${money(c.bank)}</b></div>
        ${c.debt ? `<div class="s3-rprow"><span>You owe</span><b class="s3-neg">${money(c.debt)}</b></div>` : ''}</div>
      ${ro ? opt('rec', 'rb-primary', 'Recovery entry', `${esc(ro.n)}, ${money(ro.cost)} covered. You'll owe ${money((c.debt || 0) + ro.cost)}${c.debt ? ' in total' : ''}, paid back from half of each prize.`) : ''}
      ${opt('mm', 'rb-ghost', 'Money match', `Best of 3 in the back room${mm ? `. Win it for ${money(mm)}` : ''}. Nothing to lose.`)}
      ${c.debt ? '' : opt('adv', 'rb-ghost', 'Hardship advance', 'Two entries paid now, paid back from half of each prize.')}</div>`;
  }
  function poster(c, e, noNeed) {
    const C = CI(), L = C.LEVELS[e.level];
    const fmt = e.kind === 'groupko' ? `Group of 4, then ${e.size / 2}-player knockout` : `${e.size}-player knockout`;
    const win = C.prizeFor(e, 'W'), pts = C.pointsFor(e, 'W');
    const left = c.bank - e.cost;
    return `<article class="s3-post">
      <div class="s3-part" style="background:url(${lvArt(e.level)}) 50% 35%/cover no-repeat,${GRAD[e.level]}">${e.jump ? '<span class="s3-tag">Win it to move up</span>' : ''}<h3>${esc(e.n)}</h3></div>
      <div class="s3-pbody"><span class="rb-sub">${esc(e.where)} · ${fmt} · best of ${L.legs} · field avg ${L.avg + (e.field || 0)}</span>
        <div class="s3-kv"><div><b>${money(win)}</b><span>to the winner</span></div><div><b>${pts || 'OOM'}</b><span>${pts ? 'points to the winner' : 'prize money counts'}</span></div><div><b>${money(e.cost)}</b><span>${e.travel ? `entry ${money(e.entry)} + travel ${money(e.travel)}` : 'entry'}</span></div></div>
        ${e.canAfford ? `<button class="rb-primary" type="button" data-s3book="${esc(e.id)}"><b>Book it · ${money(e.cost)}</b><small>Leaves ${money(left)} in the tour budget</small></button>`
          : noNeed ? '' : `<button class="rb-primary s3-off" type="button" disabled><b>Need ${money(e.cost)}</b><small>You have ${money(c.bank)}</small></button>`}
      </div></article>`;
  }
  function live(c) {
    const C = CI(), lv = c.live, e = C.eventOf(lv.id), o = C.nextOpp(c), L = C.LEVELS[e.level];
    const cells = lv.rounds.map((r, i) => { const cls = i < lv.round ? 's3-w' : i === lv.round ? 's3-on' : ''; const t = r === 'G' ? 'Group' + (lv.g ? ' ' + lv.g.w + '–' + (lv.g.p - lv.g.w) : '') : r; return `<li class="${cls}">${t}</li>`; }).join('');
    const rn = o.round === 'G' ? `Group match ${(lv.g ? lv.g.p : 0) + 1} of 3 · win 2 to go through` : roundName(o.round);
    const winNow = C.prizeFor(e, 'W'), safe = C.prizeFor(e, lv.rounds[lv.round]);   /* losing this round finishes the event at this round */
    let h = `<div class="rb-card s3-live"><span class="rb-kick">Playing now · ${esc(e.where)}</span><span class="rb-t1">${esc(e.n)}</span>
      <ol class="s3-draw" aria-label="The draw">${cells}</ol>
      <div class="s3-row"><div><span class="s3-lab">Next opponent${D.oppName() ? ' · ' + esc(D.oppName()) : ''}</span><b class="s3-big">${o.avg}</b><span class="rb-sub">average · best of ${o.legs}</span></div>
        <div style="text-align:right"><span class="s3-lab">${esc(rn)}</span><b class="s3-mid">${money(winNow)}</b><span class="rb-sub">to the winner</span></div></div>
      ${safe ? `<span class="rb-sub">Lose now and you still take ${money(safe)}</span>` : ''}
      <button class="rb-primary" type="button" id="s3Go"><b>Walk on</b><small>${esc(rn)}${L.legs ? ' · best of ' + L.legs : ''}</small></button>`;
    if (isDev() && devTap) h += `<div class="s3-two"><button class="rb-ghost" type="button" data-s3dev="1">Dev: I won</button><button class="rb-ghost" type="button" data-s3dev="0">Dev: I lost</button></div>`;
    return h + `</div>`;
  }
  function oom(c) {
    const C = CI(), t = C.dpnzTable(c), me = t.findIndex(r => r.you) + 1;
    const rows = t.map((r, i) => `<li class="${r.you ? 's3-you' : ''}${i === 0 ? ' s3-p1' : ''}"><span>${i + 1}</span><span>${esc(r.you ? 'You' : r.n)}</span><b>${r.pts}</b></li>${i === 0 ? '<li class="s3-cut">#1 goes to the Palace</li>' : i === 9 ? '<li class="s3-cut">Top 10 go to the Trans-Tasman</li>' : ''}`).join('');
    return `<div class="rb-card"><div class="s3-row"><span class="rb-t2">DPNZ Order of Merit</span><span class="rb-sub">event ${c.dpnzEv || 0} of 8</span></div>
      <span class="rb-sub">You're ${ordinal(me)}. Your best 6 events count. The others bank points every event, whether you play or not.</span>
      <ol class="s3-tbl">${rows}</ol></div>`;
  }
  function results(c) {
    const C = CI(), hs = (c.history || []).slice().reverse().slice(0, 20);
    if (!hs.length) return `<div class="rb-card"><span class="rb-t2">No events yet</span><span class="rb-sub">Book one from This week. Every result shows here.</span></div>`;
    return `<div class="rb-card"><ol class="s3-res">${hs.map(h => `<li><span><b>${esc(h.n)}</b><small>Week ${h.week} · ${esc(C.LEVELS[h.level].n)}</small></span><span style="text-align:right"><b>${esc(C.FIN_NAME[h.fin])}</b><small>${h.prize ? '+' + money(h.prize) : '$0'}${h.pts ? ' · +' + h.pts + ' pts' : ''}</small></span></li>`).join('')}</ol></div>`;
  }
  const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');

  /* ---------- Best Leg (W6) + Season 1/2 history (W7), on the Circuit tab under the week ---------- */
  // Both are async reads of Career's views (tops_bestleg_s3, tops_history); fetched at most once a minute, the card redraws in place.
  let blRows = null, blAt = 0, hiRows = null, hiAt = 0;
  const fetchOnce = (fn, at, set, redraw) => { if (Date.now() - at < 60000) return at; try { Promise.resolve(fn()).then(r => { set(r || []); redraw(); }).catch(() => { set('err'); redraw(); }); } catch (e) {} return Date.now(); };
  function records() {
    const B = window.TOPS_BESTLEG, H = window.TOPS_HISTORY; let h = '';
    if (B && B.table) { blAt = fetchOnce(() => B.table(), blAt, r => { blRows = r; }, () => { const el = $id('s3Bl'); if (el) el.outerHTML = blCard(); }); h += blCard(); }
    if (H && H.rows) { hiAt = fetchOnce(() => H.rows(), hiAt, r => { hiRows = r; }, () => { const el = $id('s3Hi'); if (el) { el.outerHTML = histCard(); wire(); } }); h += histCard(); }
    return h;
  }
  function blCard() {
    if (blRows === 'err') { blAt = Date.now() - 45000; return `<div class="rb-card" id="s3Bl"><span class="rb-t2">Best leg · Season 3</span><span class="rb-sub">Can't load the table right now. It comes back when you're online.</span></div>`; }   /* retry in 15 s */
    const rows = (blRows || []).slice(0, 8), mine = (blRows || []).find(r => r.you);
    const list = rows.length ? `<ol class="s3-tbl">${rows.map((r, i) => `<li class="${r.you ? 's3-you' : ''}"><span>${i + 1}</span><span>${esc(r.you ? 'You' : r.name)}</span><b>${r.darts} darts</b></li>`).join('')}</ol>`
      : `<span class="rb-sub">${blRows ? 'Nobody has a best leg yet this season. Win a 501 leg in the Circuit to set one.' : 'Loading the table…'}</span>`;
    return `<div class="rb-card" id="s3Bl"><div class="s3-row"><span class="rb-t2">Best leg · Season 3</span><span class="rb-sub">${mine ? 'Yours: ' + mine.darts + ' darts' : ''}</span></div>${list}</div>`;
  }
  // a player's best across both seasons: furthest level, highest average, fewest darts in a won leg
  const hist = r => { const ss = [r.s1, r.s2].filter(Boolean), f = ss.map(x => x.furthest).filter(Boolean).sort((a, b) => b.level - a.level)[0] || null;
    const av = ss.map(x => x.bestAvg).filter(x => x != null), lg = ss.map(x => x.bestLeg).filter(x => x != null);
    return { name: r.name, you: r.you, furthest: f, bestAvg: av.length ? Math.max(...av) : null, bestLeg: lg.length ? Math.min(...lg) : null }; };
  function histCard() {
    if (hiRows === 'err') hiAt = Date.now() - 45000;
    if (!Array.isArray(hiRows) || !hiRows.length) return `<div id="s3Hi"></div>`;
    const r = hiRows.map(hist), top = (k, lo) => r.filter(x => x[k] != null).sort((a, b) => k === 'furthest' ? b.furthest.level - a.furthest.level : lo ? a[k] - b[k] : b[k] - a[k])[0];
    const f = top('furthest'), a = top('bestAvg'), n = top('bestLeg', true);
    const line = (lab, w, txt) => `<li><span class="s3-lab">${lab}</span><span>${w ? esc(w.you ? 'You' : w.name) : 'No data'}</span><b>${w ? txt(w) : ''}</b></li>`;
    return `<button class="rb-card s3-hist" type="button" id="s3Hi" data-s3="hist"><div class="s3-row"><span class="rb-t2">Seasons 1 & 2 · the records</span><span class="rb-sub">All ›</span></div>
      <ol class="s3-tbl s3-h3">${line('Furthest', f, w => esc(w.furthest.n || ''))}${line('Highest average', a, w => (+w.bestAvg).toFixed(1))}${line('Closest to a 9-darter', n, w => w.bestLeg + ' darts')}</ol></button>`;
  }
  function histSheet() {
    const r = (Array.isArray(hiRows) ? hiRows : []).map(hist);
    const row = x => `<li class="${x.you ? 's3-you' : ''}"><span>${esc(x.you ? 'You' : x.name)}</span><span>${x.furthest ? esc(x.furthest.n) : 'No data'}</span><span>${x.bestAvg != null ? (+x.bestAvg).toFixed(1) : '–'}</span><span>${x.bestLeg != null ? x.bestLeg : '–'}</span></li>`;
    sheet(`<span class="rb-kick">Seasons 1 & 2</span><span class="rb-t1">The records</span><span class="rb-sub">Kept from before the reset: furthest level, best match average, fewest darts in a won 501 leg.</span>
      <ol class="s3-tbl s3-h4"><li class="s3-thd"><span>Player</span><span>Furthest</span><span>Avg</span><span>Darts</span></li>${r.map(row).join('')}</ol>`, 'Done');
  }

  /* ---------- Money tab ---------- */
  function moneyTab() {
    const C = CI(), c = D.st(); if (!C || !c) return '';
    const L = C.LEVELS[c.level], avg = L.events.reduce((s, e) => s + C.cost(e), 0) / L.events.length, run = c.bank / avg;
    const hs = (c.history || []).slice().reverse().slice(0, 30);
    const tin = hs.reduce((s, h) => s + (h.prize || 0), 0), tout = hs.reduce((s, h) => s + (h.cost || 0), 0);
    const runTxt = run < 1 ? 'Not enough for a trip at this level' : `About ${Math.floor(run)} trip${Math.floor(run) === 1 ? '' : 's'} at this level`;
    const rows = hs.map(h => `<li><span><b>${esc(h.n)}</b><small>Week ${h.week} · ${esc(C.FIN_NAME[h.fin])}</small></span><span class="s3-neg">−${money(h.cost)}</span><span class="s3-pos">${h.prize ? '+' + money(h.prize) : '$0'}</span></li>`).join('');
    return `<div class="rb-card s3-bank"><span class="s3-lab">Tour budget</span><b class="s3-huge">${money(c.bank)}</b><span class="rb-sub">${runTxt} (avg trip ${money(avg)})</span>
        <div class="rb-bar"><i style="width:${Math.min(100, run / 8 * 100)}%"></i></div>
        ${c.debt ? `<span class="s3-warn">You owe ${money(c.debt)}. Half of each prize goes to it until it's clear.</span>` : ''}</div>
      <div class="rb-card"><span class="rb-t2">Every dollar has a job</span><span class="rb-sub">Entry and travel are paid when you book. Prize money comes from how far you get. Moving up a level pays a one-off travel grant.</span></div>
      <div class="rb-card"><div class="s3-row"><span class="rb-t2">In and out</span><span class="rb-sub">${hs.length ? `last ${hs.length}: <span class="s3-pos">+${money(tin)}</span> · <span class="s3-neg">−${money(tout)}</span>` : ''}</span></div>
        ${rows ? `<ol class="s3-res s3-mon">${rows}</ol>` : `<span class="rb-sub">Nothing yet. Book an event on the Circuit tab.</span>`}</div>`;
  }

  /* ---------- overlays: round toast, event result, promotion moment, new best leg ---------- */
  function sheet(html, ok, onOk, cls) {
    const old = $id('s3Sheet'); if (old) old.remove();
    const d = document.createElement('div'); d.id = 's3Sheet'; d.className = 's3-sheet ' + (cls || ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = `<div class="s3-sbox">${html}<button class="rb-primary" type="button" id="s3Ok"><b>${esc(ok || 'OK')}</b></button></div>`;
    (document.getElementById('rbApp') || document.body).appendChild(d);
    const b = d.querySelector('#s3Ok'); b.onclick = () => { d.remove(); if (onOk) onOk(); }; try { b.focus({ preventScroll: true }); } catch (e) {}
  }
  function toast(html) {
    const old = $id('s3Toast'); if (old) old.remove();
    const d = document.createElement('div'); d.id = 's3Toast'; d.className = 's3-toast'; d.setAttribute('role', 'status'); d.innerHTML = html;
    (document.getElementById('rbApp') || document.body).appendChild(d); setTimeout(() => { if (d.isConnected) d.classList.add('s3-out'); }, 2600); setTimeout(() => d.remove(), 3100);
  }
  function announce(c) {
    if ($id('s3Sheet')) return;
    const p = pending(c); if (!p) return;
    const C = CI();
    if (p.kind === 'round') {
      seenSet(p.now); const o = C.nextOpp(c); if (!o) return;
      const nm = o.round === 'G' ? 'next group match' : roundName(o.round);
      toast(`<b>Through</b><span>${esc(nm)} next · opponent avg ${o.avg}</span>`); return;
    }
    if (p.kind === 'done') {
      const r = p.rec, won = r.fin === 'W', L = C.LEVELS[r.level];
      const head = `<span class="rb-kick">${esc(r.n)}</span><span class="s3-fin ${won ? 's3-gold' : ''}">${won ? 'Winner' : esc(C.FIN_NAME[r.fin])}</span>
        <div class="s3-kv"><div><b>${r.prize ? '+' + money(r.prize) : '$0'}</b><span>prize money</span></div><div><b>${r.pts ? '+' + r.pts : (L.oom || L.id === 'tt' ? 'OOM' : '0')}</b><span>${r.pts ? 'points' : 'ranking'}</span></div><div><b>${money(c.bank)}</b><span>tour budget</span></div></div>`;
      const after = () => { seenSet(snap(c)); if (p.up) promo(c, p.up); else render(); };
      seenSet(Object.assign({}, p.now, { lv: p.up ? p.up.from : p.now.lv }));   // the result is seen; the promotion (if any) still shows
      sheet(head, p.up ? 'Next' : 'OK', after, won ? 's3-win' : '');
      return;
    }
    if (p.kind === 'level') promo(c, p.up);
  }
  function promo(c, up) {
    const C = CI(), to = C.LEVELS[up.to], down = up.to < up.from;
    const g = (c.grants && c.grants[up.to] && !down) ? [0, 60, 450, 900, 850, 0, 3000][up.to] : 0;
    const html = `<div class="s3-pmart" style="background:url(${lvArt(up.to)}) 50% 40%/cover no-repeat,${GRAD[up.to]}"></div>
      <span class="rb-kick">${up.from === 6 ? 'Back on tour' : down ? 'New season' : 'Promoted'}</span><span class="s3-pmn">${down ? esc(to.n) : 'Up to ' + esc(to.n)}</span>
      <span class="rb-sub">${up.from === 6 ? `Out of the Worlds. A new season starts now with ${(c.pts && c.pts.dpnz) || 0} points carried (40%, up to 300).` : esc(to.s)}</span>${g ? `<span class="s3-grant">Travel grant +${money(g)}</span>` : ''}<span class="rb-sub">${esc(to.up)}</span>`;
    sheet(html, 'See what\'s on', () => { seenSet(snap(c)); sub = 'week'; render(); }, 's3-promo');
  }
  // new best leg: Career fires window 'tops:bestleg' {detail:{darts, prev}}; kept on the device so it still shows after the reset reload
  window.addEventListener('tops:bestleg', e => { const d = e.detail || {}; try { lsSet('tops_s3_bl', JSON.stringify(d)); } catch (x) {}
    /* in the match: a banner that doesn't block the throw (no taps, gone in 4 s); the full moment comes on the next Circuit screen */
    try { const old = $id('s3Rec'); if (old) old.remove(); const b = document.createElement('div'); b.id = 's3Rec'; b.className = 's3-rec'; b.setAttribute('role', 'status');
      b.innerHTML = `<small>${d.kind === 'equal' ? 'Equals the Season 3 record' : 'New Season 3 record'}</small><b>${+d.darts || ''} darts</b>`; document.body.appendChild(b);
      setTimeout(() => b.classList.add('s3-out'), 3600); setTimeout(() => b.remove(), 4200); } catch (x) {} });
  function bestLeg() {
    if ($id('s3Sheet')) return; let d = null; try { d = JSON.parse(lsGet('tops_s3_bl') || 'null'); } catch (e) {} if (!d || !d.darts) return;
    const eq = d.kind === 'equal';
    sheet(`<span class="rb-kick">${eq ? 'Equals the Season 3 record' : 'New Season 3 record'}</span><span class="s3-recn">${d.darts}<small>darts</small></span><span class="rb-sub">${eq ? `Level with the best leg this season (${d.prev} darts).` : d.prev ? `The best leg this season was ${d.prev} darts.` : 'The first best leg of the season.'} It's on the Circuit table now.</span>`, 'See the table', () => { lsSet('tops_s3_bl', null); blAt = 0; render(); setTimeout(() => { const t = $id('s3Bl'); if (t) t.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 50); }, 's3-win s3-recm');
  }

  /* ---------- after a Circuit match: the new-look Result over the game's Match result screen (rb.js TOPS_RB_S3RESULT) ---------- */
  /* endMatch shows the Match result with $('result').hidden=false then sceneBg('result'): sceneBg is the hook */
  if (typeof sceneBg === 'function') { const _ss = sceneBg; sceneBg = function (id) { const r = _ss.apply(this, arguments);
    try { const rs = $id('result'); if (rs) rs.classList.toggle('s3-old', !!(id === 'result' && typeof S !== 'undefined' && S && S.s3));   /* the old league-standings Match result never shows for a Circuit match (Overseer 08:56) */
      if (id === 'result' && typeof S !== 'undefined' && S && S.s3 && window.TOPS_RB_S3RESULT) setTimeout(() => { if (!$id('result').hidden) TOPS_RB_S3RESULT(); }, 0); } catch (e) {} return r; }; }

  /* ---------- Season 3 wording on the old screens ---------- */
  const words = () => { try { document.querySelectorAll('#login .lgn-help').forEach(e => { if (/^Season 1\./.test(e.textContent)) e.textContent = e.textContent.replace(/^Season 1\./, 'Season 3.'); }); } catch (e) {} };
  words(); document.addEventListener('DOMContentLoaded', words);
  if (typeof showTitle === 'function') { const _st = showTitle; showTitle = function () { const r = _st.apply(this, arguments); try { const v = $id('tlVer'); if (v) v.textContent = v.textContent.replace(/Season \d+/, 'Season 3'); } catch (e) {} return r; }; }
  /* the match intro and event strip name the Circuit event and round, not the old tier ("PUB LEAGUE") */
  /* the match intro and event strip name the Circuit event and round, not the old tier ("PUB LEAGUE"); Career sets S.s3 right after beginMatch */
  const s3Head = () => { try { if (typeof S === 'undefined' || !S || !S.s3 || !CI()) return; const e = CI().eventOf(S.s3.id), t = (e ? e.n + ' · ' : '') + roundName(S.s3.round);
    /* the in-match strip leads with the round, so a long venue is what gets trimmed, never the round (Delivery QA 14:42: it ran under MENU at 390) */
    const ts = roundName(S.s3.round) + (e ? ' · ' + e.n : '');
    [['introTier', t], ['eventTier', ts]].forEach(([id, tx]) => { const el = $id(id); if (!el || el.dataset.s3v === el.innerHTML && el.dataset.s3t === tx || /^Leg |^Bull up/.test(el.textContent)) return;
      /* the walk-on card wraps: the round sits whole on its own line ('KAURI ARMS LEAGUE NIGHT ·' / 'QUARTER-FINAL'), never split at its hyphen */
      if (id === 'introTier' && e) el.innerHTML = `<span>${esc(e.n)}&nbsp;·</span> <span style="white-space:nowrap">${esc(roundName(S.s3.round))}</span>`; else el.textContent = tx;
      el.title = tx; el.dataset.s3t = tx; el.dataset.s3v = el.innerHTML; }); const v = $id('introVenue'); if (v && e) v.textContent = e.where; } catch (e) {} };
  if (typeof beginMatch === 'function') { const _bm = beginMatch; beginMatch = function () { const r = _bm.apply(this, arguments); setTimeout(s3Head, 0); setTimeout(s3Head, 400); return r; }; }

  /* the first message after the creator: a Circuit league night, not the old 'Pub league' */
  try { if (typeof STORY !== 'undefined' && STORY.intro && Array.isArray(STORY.intro.lines)) STORY.intro.lines = STORY.intro.lines.map(l => l.replace("Pub league, 501.", "League night, 501. Eight of us, knockout."));
    if (Array.isArray(STORY.intro.time)) STORY.intro.time = STORY.intro.time.map(l => l.replace("You'll be on against Big Mal first up. Don't let the belly fool you.", "The draw's on the board when you walk in. Win and you keep throwing.")); } catch (e) {}

  /* ---------- 'Season 3 is here': once per device, the first time the game opens with Season 3 on, before the creator (Overseer 09:38) ---------- */
  const WELK = 'tops_s3_welcome';
  function welcome() {
    if (lsGet(WELK) || $id('s3Wel')) return;
    const d = document.createElement('div'); d.id = 's3Wel'; d.className = 's3-wel'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 's3WelH');
    d.innerHTML = `<div class="s3-welart" style="background-image:url(img/splash.jpg)"></div><div class="s3-welsh"></div>
      <div class="s3-welbox"><span class="s3-welk">Season 3</span><h2 id="s3WelH">A new season.<br>A new career.</h2>
        <ul>
          <li><b>Everyone starts again at the Pub.</b> New career, new bank.</li>
          <li><b>The Circuit.</b> Book your events, pay your way, climb seven levels to the Palace.</li>
          <li><b>New players and venues.</b> Pick your player, then make them yours.</li>
          <li><b>Best leg.</b> Fewest darts in a leg this season holds the record. Beat it.</li>
          <li><b>Seasons 1 and 2 are kept.</b> The records board on the Circuit shows who went furthest.</li>
        </ul>
        <button type="button" id="s3WelGo">Start your career</button></div>`;
    document.body.appendChild(d);
    const go = d.querySelector('#s3WelGo'); try { go.focus({ preventScroll: true }); } catch (e) {}
    go.onclick = () => { lsSet(WELK, '1'); d.remove(); try { window.TOPS_LOG && TOPS_LOG.log && TOPS_LOG.log('s3_welcome', {}); } catch (e) {}
      let has = false; try { const c = career(); has = !!(c && c.circuit && (c.circuit.history.length || c.circuit.live)); } catch (e) {}
      const title = $id('title'); if (!title || title.hidden) return;   /* sign-in first (login screen): the title's New career comes after it, as before */
      if (!has) { const b = $id('btnNewCareer'); try { if (window.audioInit) audioInit(); } catch (e) {} try { if (b) b.click(); else showCreator(false); } catch (e) { console.warn('s3 welcome', e); } } };
  }
  /* after the loading screen lifts, never on the between-match reset page, never mid-match */
  (function welWait(n) { try { const l = $id('loading'), up = l && !l.classList.contains('gone') && getComputedStyle(l).display !== 'none';
      if (window.TOPS_RESETTING || lsGet(WELK)) return; if (up || (typeof S !== 'undefined' && S && !S.done) || !document.body) { if (n < 240) setTimeout(() => welWait(n + 1), 250); return; } setTimeout(welcome, 700);   /* after the loader's fade */ } catch (e) {} })(0);

  /* ---------- creator (W4): pick one of Engine's 5 Vinyl base looks, then the game's own hair / colour / skin / extras / shirt pickers ---------- */
  // Engine: TOPS_S3_BASES [{id, name, tag, look}] and TOPS_S3_LOOK(id). The 8-model "Character" row is hidden in Season 3 (the bases replace it).
  /* Engine's Season 3 creator (s3Creator: the PLAYER portrait row, writes save.vlook) replaces this row. When it's in the build this
     wrapper adds no row and leaves the Character field to Engine (Overseer 14:52: one row, not two) */
  /* Engine's PLAYER row draws each base as a live 3D portrait, which shows plain white busts on phones (Q&D). Fill each slot first with the
     painted Vinyl head (s3/assets/creator/head_<id>.png): Engine's portrait pass skips a slot that already has a picture. */
  const heads = () => { try { document.querySelectorAll('#s3Cre [data-pt]').forEach(i => { if (i.querySelector('img.s3-head')) return; const u = swap('assets/creator/head_' + i.dataset.pt + '.png');
      if (!/^s3\//.test(u)) return; i.innerHTML = `<img class="s3-head" src="${u}" alt="">`; }); } catch (e) {} };
  if (typeof s3Creator === 'function') { const _s3c = s3Creator; s3Creator = function () { const r = _s3c.apply(this, arguments); heads(); return r; }; }
  const engineCre = () => typeof s3Creator === 'function' || !!$id('s3Cre');
  if (typeof showCreator === 'function') {
    const _sc = showCreator;
    showCreator = function (editing) {
      const B = window.TOPS_S3_BASES;
      /* first open: start on the first base (as 4.01 does; Engine's creator then opens on Ray) */
      if (B && B.length && save && save.look && !save.look.s3base) { const L = window.TOPS_S3_LOOK(B[0].id); if (L) { save.look = Object.assign({}, save.look, L, { s3base: B[0].id }); try { persist(); } catch (e) {} } }
      if (engineCre()) { const r = _sc.apply(this, arguments); const old = $id('s3Base'); if (old) old.remove(); return r; }
      const r = _sc.apply(this, arguments);
      try { if (B && B.length) baseRow(editing); } catch (e) { console.warn('s3 creator', e); }
      return r;
    };
  }
  function baseRow(editing) {
    if (engineCre()) { const old = $id('s3Base'); if (old) old.remove(); return; }
    const B = window.TOPS_S3_BASES, ch = $id('segChar'), f = ch && ch.closest('.field'); if (!f) return;
    f.hidden = true;
    let row = $id('s3Base'); if (!row) { row = document.createElement('div'); row.className = 'field'; row.id = 's3Base'; f.parentNode.insertBefore(row, f); }
    const cur = save.look.s3base;
    row.innerHTML = `<span class="label">Your player</span><div class="s3-bases">${B.map(b => `<button type="button" data-b="${esc(b.id)}" aria-pressed="${b.id === cur}"><b>${esc(b.name)}</b><small>${esc(b.tag || '')}</small></button>`).join('')}</div>`;
    row.querySelectorAll('[data-b]').forEach(btn => btn.onclick = () => { const L = window.TOPS_S3_LOOK(btn.dataset.b); if (!L) return;
      save.look = Object.assign({}, L, { s3base: btn.dataset.b }); try { persist(); } catch (e) {}
      const nm = $id('cName') ? $id('cName').value : null; showCreator(editing); if (nm != null && $id('cName')) $id('cName').value = nm; });
  }

  /* ---------- wiring into the rebrand shell (rb.js calls these) ---------- */
  let shell = null, nav = null, annT = 0, chipFrom = null;   /* chipFrom: Trophies was opened from the Circuit's titles chip (its ‹ Circuit button returns there) */
  function render() { if (shell) shell(); }
  /* trophy names never break inside a word: a name whose longest word doesn't fit its card steps down 15 → 11 px (the cards keep their size) */
  const wordSplit = el => { const n = el.firstChild; if (!n || n.nodeType !== 3) return false; const t = n.textContent; let i = 0;
    for (const w of t.split(/([ \-])/)) { if (w && w !== ' ' && w !== '-') { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + w.length); if (new Set([...r.getClientRects()].map(q => Math.round(q.top))).size > 1) return true; } i += w.length; } return false; };
  function fitNames(app) { app.querySelectorAll('.s3-tr b').forEach(b => { b.style.fontSize = ''; for (let px = 14; px >= 11 && (wordSplit(b) || b.scrollWidth > b.clientWidth + 1); px--) b.style.fontSize = px + 'px'; }); }
  function wire() {
    const app = $id('rbApp'); if (!app) return;
    const cx = app.querySelector('.s3-ctx'), lvc = app.querySelector('.s3-lv'), scr = app.querySelector('.rb-scr');
    if (cx && lvc && scr && 'IntersectionObserver' in window) { if (wire.cxIO) wire.cxIO.disconnect(); wire.cxIO = new IntersectionObserver(es => es.forEach(en => cx.classList.toggle('on', !en.isIntersecting)), { root: scr, threshold: 0 }); wire.cxIO.observe(lvc); }
    if (app.querySelector('.s3-tr b')) { fitNames(app); if (!wire.fitRs) { wire.fitRs = 1; let t = 0; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { const a = $id('rbApp'); if (a) fitNames(a); }, 120); }); } }
    app.querySelectorAll('[data-s3sub]').forEach(b => b.onclick = () => { sub = b.dataset.s3sub; render(); });
    app.querySelectorAll('[data-s3book]').forEach(b => b.onclick = () => { if (b.dataset.busy) return; b.dataset.busy = 1; let r = null; try { r = D.book(b.dataset.s3book); } catch (e) { console.warn('s3 book', e); }
      if (r && r.ok === false) toast(`<b>Not booked</b><span>${esc(r.why || '')}</span>`); else { const c = D.st(); if (c) seenSet(snap(c)); } render(); });
    const go = $id('s3Go'); if (go) go.onclick = () => { if (go.dataset.busy) return; go.dataset.busy = 1; setTimeout(() => { delete go.dataset.busy; }, 800); try { D.play(); } catch (e) { console.warn('s3 play', e); } };
    app.querySelectorAll('[data-s3dev]').forEach(b => b.onclick = () => { D.devResult(b.dataset.s3dev === '1'); render(); });
    app.querySelectorAll('[data-s3]').forEach(b => b.onclick = () => { const k = b.dataset.s3; if ((k === 'rest' || k === 'rec') && b.dataset.busy) return; if (k === 'rest' || k === 'rec') { b.dataset.busy = 1; b.disabled = true; } /* one tap acts once */
      if (k === 'mm') D.moneyMatch();
      else if (k === 'adv') { const r = D.advance(); toast(r && r.ok ? `<b>Advance +${money(r.amt)}</b><span>Half of each prize pays it back</span>` : `<b>No advance</b><span>${esc((r && r.why) || '')}</span>`); render(); }
      else if (k === 'rest') { const r = D.rest(); if (!r || !r.ok) toast(`<b>Can't move on</b><span>${esc((r && r.why) || '')}</span>`); render(); }
      else if (k === 'rec') { const r = D.recover(); if (r && r.ok) { toast(`<b>Entered · ${money(r.cost)} covered</b><span>Half of each prize pays it back</span>`); render(); D.play(); } else { toast(`<b>No recovery entry</b><span>${esc((r && r.why) || '')}</span>`); render(); } }
      else if (k === 'hist') histSheet();
      else if (k === 'troph' && nav) { const sc = document.querySelector('#rbMain .rb-scr'); chipFrom = { scroll: sc ? sc.scrollTop : 0 }; nav('locker', 'troph'); }
      else if (k === 'toprac' && nav) nav('practice');
      else if (k === 'trback' && nav) { const y = chipFrom ? chipFrom.scroll : 0; chipFrom = null; nav('circuit'); const sc = document.querySelector('#rbMain .rb-scr'); if (sc) sc.scrollTop = y; } });
    const c = D.st(); if (c) { const bk = $id('rbBank'); if (bk) bk.textContent = money(c.bank); }
    /* not while the between-match reset is about to reload the page (ENG-RESET): the result would show behind the loader and be lost */
    /* nor while the loading screen still covers the page (the fresh page after the reset): wait for it to lift, then show it once */
    const resetting = () => { try { const r = window.TOPS_RESET && TOPS_RESET.state && TOPS_RESET.state(); if (r && (r.played || r.busy)) return true; const l = $id('loading'); return !!(l && !l.classList.contains('gone') && getComputedStyle(l).display !== 'none'); } catch (e) { return false; } };
    clearTimeout(annT); let tries = 0;
    const tryAnn = () => { if (!$id('rbApp') || $id('rbApp').hidden) return; if (resetting()) { if (++tries < 40) annT = setTimeout(tryAnn, 400); return; } const c2 = D.st(); if (c2) announce(c2); bestLeg(); };
    annT = setTimeout(tryAnn, 0);
  }
  /* ---------- EXP-IDLE 1 · first night (behind s3x=1): before the first Circuit match, one screen that says what tonight is, who's first up,
     what winning pays and how you move up. Shown once per device; Walk on goes on into the match as before. ---------- */
  const X = (() => { try { if (q.has('s3x')) lsSet('tops_s3x', q.get('s3x') === '1' ? '1' : null); } catch (e) {} return lsGet('tops_s3x') === '1'; })();
  const FNK = 'tops_s3_firstnight';
  const CARD = ['anika', 'bigmal', 'deano', 'jonno', 'kev', 'mo', 'pete', 'phil', 'shazza', 'tama'];
  const oppArt = n => { const k = String(n || '').toLowerCase().replace(/[^a-z]/g, ''); const c = CARD.find(x => k.startsWith(x)); return c ? swap('assets/cards/art/' + c + '.webp') : ''; };
  function firstNight(go) {
    const C = CI(), A = API(), k = A._circ && A._circ(); if (!C || !k) return go();
    if (!k.live) { const v = A.view(), e = v && v.calendar.find(x => x.canAfford); if (!e) return go(); const r = A.book(e.id); if (!r || r.ok === false) return go(); }
    const v = A.view(), lv = v && v.live; if (!lv) return go();
    const e = C.eventOf(lv.id), L = C.LEVELS[e.level], n = lv.rounds.length, opp = lv.opp || {};
    const draw = lv.rounds.map((r, i) => `<li class="${i === 0 ? 's3-fnon' : ''}${i === n - 1 ? ' s3-fnwin' : ''}"><b>${esc(({ G: 'Group', QF: 'QF', SF: 'Semi', F: 'Final' })[r] || r)}</b><span>${i === 0 && opp.name ? esc(opp.name.split(' ')[0]) + ' · ' : ''}avg ${C.oppAvg(e.level, i, n, e.field)}</span></li>`).join('');
    const lad = C.LEVELS.map((x, i) => `<li class="${i === e.level ? 's3-fnnow' : ''}${i === C.LEVELS.length - 1 ? ' s3-fnend' : ''}"><i></i>${SHORT[i]}</li>`).join('');
    const have = (k.pts && k.pts[L.id]) || 0, art = oppArt(opp.name);
    const fmt = e.kind === 'groupko' ? `group of 4, then knockout` : `${e.size} players, knockout`;
    const d = document.createElement('div'); d.id = 's3Fn'; d.className = 's3-fn'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 's3FnH');
    d.innerHTML = `<div class="s3-fnart" style="background-image:url(${lvArt(e.level)})"><div class="s3-fntop"><span class="s3-fnk">Your first night</span><h2 class="s3-fnt" id="s3FnH">${esc(e.n)}</h2><span class="s3-fnsub">${esc(e.where)} · ${fmt}</span></div></div>
      <div class="s3-fnb">
        <div class="s3-fnc">${opp.name ? `<div class="s3-fnopp">${art ? `<img src="${art}" alt="">` : ''}<div><span class="s3-fnl">First up · ${esc(roundName(lv.rounds[0]).toLowerCase())}</span><b>${esc(opp.name)}</b><span>Averages about ${C.oppAvg(e.level, 0, n, e.field)} · best of ${L.legs} legs</span></div></div>` : ''}
          <span class="s3-fnl">Win ${n} matches to take it</span><ol class="s3-fndraw">${draw}</ol>
          <div class="s3-fnkv"><div><b>${money(C.prizeFor(e, 'W'))}</b><span>to the winner</span></div><div><b>${C.pointsFor(e, 'W')} pts</b><span>to the winner</span></div><div><b>${money(C.cost(e))}</b><span>entry, paid</span></div></div></div>
        ${L.need ? `<div class="s3-fnc"><span class="s3-fnl">How you move up</span><ol class="s3-fnlad">${lad}</ol>
          <div class="s3-fnrow"><span class="s3-fnsm">${esc(L.id === 'pub' ? 'Kauri points' : L.n + ' points')}</span><b>${have} / ${L.need}</b></div><div class="s3-fnbar"><i style="width:${Math.min(100, 100 * have / L.need)}%"></i></div>
          <span class="s3-fnsm">${esc(L.up.replace(/\.$/, ''))}${C.LEVELS[e.level + 1] ? ', and you\'re up to the ' + esc(C.LEVELS[e.level + 1].n) : ''}.<span class="s3-fnmore"> Each week you pick an event, pay to enter and climb toward the Palace.</span></span></div>` : ''}
        <button type="button" class="s3-fngo" id="s3FnGo"><b>Walk on</b><small>${esc(roundName(lv.rounds[0]))}${opp.name ? ' · ' + esc(opp.name) : ''}</small></button>
      </div>`;
    document.body.appendChild(d); const b = d.querySelector('#s3FnGo'); try { b.focus({ preventScroll: true }); } catch (x) {}
    b.onclick = () => { if (b.dataset.busy) return; b.dataset.busy = 1; lsSet(FNK, '1'); d.remove(); try { window.TOPS_LOG && TOPS_LOG.log && TOPS_LOG.log('s3_firstnight', { id: e.id }); } catch (x) {} go(); };
  }
  if (X && typeof playNext === 'function') { const _pn = playNext; playNext = function () { const self = this, args = arguments, go = () => _pn.apply(self, args);
    try { const k = API()._circ && API()._circ(); if (!lsGet(FNK) && !$id('s3Fn') && k && !(k.history || []).length && !(k.live && (k.live.results || []).length)) return firstNight(go); } catch (e) { console.warn('s3 first night', e); }
    return go(); }; }

  /* ---------- EXP-IDLE 2 · event progress + move-up bar on the Circuit result (behind s3x=1). A won round reads as progress (the draw with
     this round ticked, the next opponent, the prize already banked), an event end shows the finish and the level's points bar filling. ---------- */
  function resultBlock(S, c) {
    try {
      if (!X || !S || !S.s3 || !CI() || !c || !c.circuit) return null;
      const C = CI(), e = C.eventOf(S.s3.id), r = S.s3res || {}, k = c.circuit; if (!e) return null;
      const L = C.LEVELS[e.level], won = !!S.won, done = !!r.done;
      const rounds = e.kind === 'groupko' ? ['G'].concat(C.roundsFor(e.size / 2)) : C.roundsFor(e.size), at = Math.max(0, rounds.indexOf(S.s3.round));
      const short = x => ({ G: 'Group', QF: 'QF', SF: 'Semi', F: 'Final' })[x] || x;
      const cells = rounds.map((x, i) => { const cls = i < at ? 's3-rpw' : i === at ? (won ? 's3-rpw s3-rpnow' : 's3-rpl s3-rpnow') : (done ? 's3-rpoff' : i === at + 1 ? 's3-rpnext' : '');
        const mark = i < at || (i === at && won) ? '<i aria-hidden="true">✓</i>' : i === at && !won ? '<i aria-hidden="true">✕</i>' : '';
        return `<li class="${cls}${i === rounds.length - 1 ? ' s3-rpfin' : ''}">${mark}<b>${esc(short(x))}</b></li>`; }).join('');
      let head = '', sub = '', cashLab = 'Prize money', cashVal = '';
      if (done) { const winA = r.fin === 'W'; head = winA ? 'Winner' : `Out in the ${esc(roundName(S.s3.round).toLowerCase())}`; sub = r.prize ? `${money(r.prize)} prize money` : 'No prize money this time';
        cashVal = '+' + money(r.prize || 0); }
      else if (k.live) { const o = C.nextOpp(k), lv = k.live, gp = o.round === 'G'; let nm = ''; try { const v = API().view(); nm = v && v.live && v.live.opp ? v.live.opp.name : ''; } catch (x) {}
        head = gp ? `Group: ${lv.g ? lv.g.w + ' won, ' + (lv.g.p - lv.g.w) + ' lost' : ''} · next group match` : `${esc(roundName(o.round))} next`;
        sub = `Next: ${nm ? esc(nm) + ' · ' : ''}avg ${o.avg}`; const bank = C.prizeFor(e, o.round); cashLab = 'Banked so far'; cashVal = money(bank); sub += ` · ${money(C.prizeFor(e, 'W'))} if you win it`; }
      let bar = '';
      if (L.need) { const now = Math.max(0, (k.pts && k.pts[L.id]) || 0), before = done ? Math.max(0, now - (r.pts || 0)) : now, pot = done ? now : Math.min(L.need, now + C.pointsFor(e, 'W'));
        const pc = v => Math.min(100, 100 * v / L.need), up = r.up && r.up.to > e.level;
        bar = `<div class="s3-rpbar"><div class="s3-rprow"><span>${up ? 'Promoted to ' + esc(C.LEVELS[r.up.to].n) : esc(L.id === 'pub' ? 'Kauri points' : L.n + ' points') + ' · to move up'}</span><b>${up ? '' : Math.min(now, L.need) + ' / ' + L.need}</b></div>
          <div class="s3-rpm"><i class="s3-rpb" style="width:${up ? 100 : pc(before)}%"></i>${done && !up ? `<i class="s3-rpg" style="left:${pc(before)}%;width:${pc(now) - pc(before)}%"></i>` : ''}${!done ? `<i class="s3-rpp" style="left:${pc(now)}%;width:${pc(pot) - pc(now)}%"></i>` : ''}</div>
          ${!done ? `<small>Potential +${C.pointsFor(e, 'W')} if you win</small>` : r.pts ? `<small class="s3-rpgain"><em>+${r.pts} from this event</em> · ${up ? 'that took you over ' + L.need : 'now ' + Math.min(now, L.need) + ', was ' + before}</small>` : ''}</div>`; }
      return { pin: 's3-pin', html: `<div class="s3-rp"><ol class="s3-rpdraw" aria-label="The draw">${cells}</ol><div class="s3-rph"><b>${head}</b><span>${sub}</span></div>${bar}</div>`, cashLab, cashVal };
    } catch (x) { console.warn('s3 result block', x); return null; }
  }

  /* an achievement badge that fails to load shows a trophy instead of a broken-image box (Producer 13:28 P1b) */
  if (typeof achIco === 'function') { const _ai = achIco; achIco = function () { const h = _ai.apply(this, arguments);
    return typeof h === 'string' ? h.replace('<img class="ach-img"', '<img class="ach-img" onerror="this.outerHTML=window.TOPS_S3_TROPHY||\'\'"') : h; }; }
  window.TOPS_S3_TROPHY = '<svg class="ach-fb" viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><path fill="#f1c64b" d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V17h3v2H8v-2h3v-2.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3Zm0 4H6v1a2 2 0 0 0 1.2 1.8A5 5 0 0 1 7 8V7Zm10 0v1c0 .6-.1 1.2-.2 1.8A2 2 0 0 0 18 8V7h-1Z"/><rect x="6" y="20" width="12" height="2" rx="1" fill="#f1c64b"/></svg>';

  /* ---------- EXP-IDLE 3 · the trophy shelf in Locker > Trophies (behind s3x=1). Built from Career's career().circuit.titles (wins + finals,
     kept from day one), the circuit history (weeks, prize money), career().best.leg (the same number the Best Leg board ranks) and Career's
     tops_history view for Seasons 1 & 2. The trophies are drawn here: no Vinyl trophy art exists yet. ---------- */
  const CUP = (k, id) => { const g = { W: ['#fff3c4', '#f1c64b', '#a8791c'], F: ['#ffffff', '#c9d0d6', '#7d868d'] }[k];
    if (!g) return `<svg class="s3-cup s3-cupe" viewBox="0 0 48 48" aria-hidden="true"><path d="M14 7h20v4h6v5a8 8 0 0 1-8 8h-.6A10 10 0 0 1 26 29.8V34h6v4H16v-4h6v-4.2A10 10 0 0 1 16.6 24H16a8 8 0 0 1-8-8v-5h6V7Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2.4"/><rect x="12" y="40" width="24" height="4" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2.4"/></svg>`;
    return `<svg class="s3-cup" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset=".45" stop-color="${g[1]}"/><stop offset="1" stop-color="${g[2]}"/></linearGradient></defs>
      <path d="M14 7h20v4h6v5a8 8 0 0 1-8 8h-.6A10 10 0 0 1 26 29.8V34h6v4H16v-4h6v-4.2A10 10 0 0 1 16.6 24H16a8 8 0 0 1-8-8v-5h6V7Zm0 7h-2v2a4 4 0 0 0 2.4 3.7A10 10 0 0 1 14 17v-3Zm20 0v3c0 .9-.1 1.8-.4 2.7A4 4 0 0 0 36 16v-2h-2Z" fill="url(#${id})"/>
      <path d="M18 10h3v9a6 6 0 0 0 1.5 4" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <rect x="12" y="39" width="24" height="5" rx="1.5" fill="#3a2b1e"/><rect x="15" y="40.5" width="18" height="2" rx="1" fill="url(#${id})" opacity=".8"/></svg>`; };
  let shelfHi = null, shelfHiAt = 0;
  /* The shelf's numbers, from the save alone (pure, so tests can feed it real and broken saves).
     - Trophies: Career's titles (wins W and lost finals F, kept from day one), plus any W/F in the circuit history that has no title of its own
       (a save from before titles were kept). One event result is one trophy: each history entry pairs with at most one title.
     - A winner is never a runner-up: W and F come from the single finish of that event.
     - complete: the history holds every finished event (weeks 1 … week-1, one each, in order; the week only moves on when an event
       finishes). Then a title with no result of its own is a duplicate and is dropped. If not complete, a missing trophy reads
       "No record", never "Not won". */
  function shelfData(k, C) {
    k = k && typeof k === 'object' ? k : {}; const LV = C && Array.isArray(C.LEVELS) ? C.LEVELS : [];
    const num = (x, d) => (typeof x === 'number' && isFinite(x) ? x : d), fin = x => (x === 'W' || x === 'F' ? x : null);
    const hs = (Array.isArray(k.history) ? k.history : []).filter(h => h && typeof h === 'object');
    const ts = (Array.isArray(k.titles) ? k.titles : []).filter(t => t && typeof t === 'object' && fin(t.finish) && t.ev);
    const level = Math.max(0, Math.min(LV.length - 1, Math.floor(num(k.level, 0)))), week = Math.max(1, Math.floor(num(k.week, 1)));
    const complete = hs.length === week - 1 && hs.every((h, i) => h.week === i + 1);
    const used = new Set(), out = [];
    ts.forEach(t => { const i = hs.findIndex((h, j) => !used.has(j) && h.id === t.ev && h.fin === t.finish); const h = i >= 0 ? hs[i] : null; if (h) used.add(i);
      else if (complete) return;   /* every finished event is in the history, so a title with no result of its own is a second copy: dropped */
      out.push({ ev: t.ev, finish: t.finish, prize: num(t.prize, h ? num(h.prize, null) : null), week: h && num(h.week, null) != null ? h.week : null, level: num(t.level, h ? num(h.level, null) : null) }); });
    hs.forEach((h, j) => { if (!used.has(j) && fin(h.fin) && h.id) out.push({ ev: h.id, finish: h.fin, prize: num(h.prize, null), week: num(h.week, null), level: num(h.level, null), fromHistory: true }); });
    const W = out.filter(t => t.finish === 'W').length, F = out.filter(t => t.finish === 'F').length;
    const prize = Math.max(hs.reduce((a, h) => a + Math.max(0, num(h.prize, 0)), 0), out.reduce((a, t) => a + Math.max(0, t.prize || 0), 0));   // never less than the trophies' own prizes
    const leftAt = i => { if (i >= level) return null; const l = hs.filter(h => num(h.level, -1) === i && num(h.week, null) != null).slice(-1)[0]; return l ? l.week : null; };
    return { trophies: out, titles: W, runnerUp: F, finals: W + F, prize, complete, level, week, leftAt, empty: !out.length };
  }
  function shelf() {
    try {
      if (!X || !CI() || !D.st()) return null;
      const C = CI(), k = D.st(), c = typeof career === 'function' ? career() : null, d = shelfData(k, C);
      const lv = C.LEVELS[d.level];
      const hero = `<section class="s3-trh"><div class="s3-lvart" style="background:url(${lvArt(d.level)}) 50% 40%/cover no-repeat,${GRAD[d.level]}"></div><div class="s3-lvsh"></div>
        <div class="s3-trk"><div><small>Titles</small><b>${d.titles}</b></div><div><small>Finals</small><b>${d.finals}</b></div><div><small>Prize money</small><b>${money(d.prize)}</b></div></div></section>`;
      const gap = d.complete ? '' : `<div class="rb-card s3-trgap"><span class="rb-sub">Some earlier results aren't in this save, so the shelf shows only what's on record.</span></div>`;
      /* best leg: your own number is career().best.leg (what lbPost sends to the board). The Season 3 record is the board's top row, shown
         as its own line and never in place of yours. */
      const b = c && c.best, leg = b && typeof b.leg === 'number' && b.leg > 0 && b.leg < 99 ? b.leg : null, at = b && b.legAt && b.legAt.d === leg ? b.legAt : null;
      const B = window.TOPS_BESTLEG; if (B && B.table) blAt = fetchOnce(() => B.table(), blAt, r => { blRows = r; }, () => { const el = $id('s3TrBl'); if (el) el.outerHTML = blLine(leg); });
      const bl = leg ? `<div class="s3-trbl"><b>${leg}<small>darts</small></b><div><span class="s3-trbll">Your best leg · Season 3</span><span>${at ? `${esc(at.ev)}${at.week ? ' · week ' + at.week : ''}` : 'Fewest darts in a won leg'}</span>${blLine(leg)}</div></div>`
        : `<div class="s3-trbl s3-tre"><b>–</b><div><span class="s3-trbll">Your best leg · Season 3</span><span>Win a 501 leg in the Circuit to set one</span>${blLine(null)}</div></div>`;
      const empty = d.empty && d.complete ? `<div class="rb-card s3-tremp"><span class="rb-t2">Your shelf is empty</span><span class="rb-sub">Win an event, or reach a final, and the trophy goes here. ${esc(lv.events[0].n)} pays ${money(C.prizeFor(C.eventOf(lv.events[0].id), 'W'))} to the winner.</span></div>` : '';
      let n = 0;
      const lvRow = i => { const L = C.LEVELS[i], up = i < d.level, left = d.leftAt(i);
        const cards = L.events.map(e => { const w = d.trophies.filter(t => t.ev === e.id && t.finish === 'W'), f = d.trophies.filter(t => t.ev === e.id && t.finish === 'F'), top = w.length ? 'W' : f.length ? 'F' : '';
          const set = top === 'W' ? w : f, wk = set.map(t => t.week).filter(x => x != null).sort((a, b) => a - b), pz = set.reduce((a, t) => a + Math.max(0, t.prize || 0), 0), cnt = set.length, pzT = pz > 0 ? ' · ' + money(pz) : '';
          const line = top === 'W' ? `Winner${cnt > 1 ? ' ×' + cnt : ''}${pzT}` : top === 'F' ? `Runner-up${cnt > 1 ? ' ×' + cnt : ''}${pzT}` : !d.complete ? 'No record' : up ? 'Not won' : 'Not won yet';
          const more = top === 'W' && f.length ? `<small>+ runner-up${f.length > 1 ? ' ×' + f.length : ''}</small>` : '';
          return `<li class="s3-tr${top ? ' s3-tr' + top : ' s3-tre'}" data-ev="${esc(e.id)}">${CUP(top, 's3cup' + (n++))}<b title="${esc(e.n)}">${esc(TOWN(e.n).split(' · ')[0])}</b><span>${line}${wk.length ? `<br>Week${wk.length > 1 ? 's' : ''} ${wk.join(', ')}` : ''}</span>${more}</li>`; }).join('');
        const tag = up ? `<span class="s3-trup">Promoted${left ? ' · week ' + left : ''}</span>` : `<span class="s3-trnow">This level</span>`;
        return `<section class="s3-trlv" data-lv="${i}"><div class="s3-row"><span class="s3-trn">${esc(L.n)}</span>${tag}</div><ol class="s3-shelf">${cards}</ol></section>`; };
      let rows = ''; for (let i = d.level; i >= 0; i--) rows += lvRow(i);
      const nx = C.LEVELS[d.level + 1], next = nx ? `<section class="s3-trlv s3-trlock"><div class="s3-row"><span class="s3-trn">${esc(nx.n)}</span><span class="rb-sub">Next level · ${nx.events.length} event${nx.events.length > 1 ? 's' : ''} to win</span></div></section>` : '';
      /* Seasons 1 & 2: Career's live tops_history view, read here (never a copy), so the shelf and the Circuit records board show the same numbers */
      const H = window.TOPS_HISTORY; if (H && H.rows) shelfHiAt = fetchOnce(() => H.rows(), shelfHiAt, r => { shelfHi = r; }, () => { const el = $id('s3TrHi'); if (el) el.outerHTML = oldSeasons(); });
      const back = chipFrom ? `<button type="button" class="s3-trback" data-s3="trback">‹ Back to Circuit</button>` : '';
      const cab = window.TC_API && TC_API.cabinet ? `<button class="rb-ghost" type="button" id="rbCab" style="align-self:center">Seasons 1 & 2 trophy cabinet</button>` : '';   /* the old 3D cabinet stays reachable under s3x */
      return back + hero + gap + bl + empty + rows + next + oldSeasons() + cab;
    } catch (x) { console.warn('s3 shelf', x); return null; }
  }
  /* the Season 3 record line under your best leg: the board's top row (Career's tops_bestleg_s3), a separate value from yours */
  function blLine(leg) {
    const rec = Array.isArray(blRows) && blRows[0] && typeof blRows[0].darts === 'number' ? blRows[0] : null; if (!rec) return `<small id="s3TrBl"></small>`;
    const t = rec.you ? (leg === rec.darts ? 'You hold the Season 3 record' : `Season 3 record: ${rec.darts} darts · you`) : `Season 3 record: ${rec.darts} darts · ${esc(rec.name)}`;
    return `<small id="s3TrBl">${t}</small>`;
  }
  function oldSeasons() {
    const me = Array.isArray(shelfHi) ? shelfHi.find(r => r.you) : null; if (!me || (!me.s1 && !me.s2)) return `<div id="s3TrHi"></div>`;
    const one = (s, lab) => s ? `<li><span class="s3-lab">${lab}</span><span>${s.furthest ? esc(s.furthest.n) : '–'}</span><span>${s.bestAvg != null ? (+s.bestAvg).toFixed(1) + ' avg' : '–'}</span><span>${s.bestLeg != null ? s.bestLeg + ' darts' : '–'}</span></li>` : '';
    return `<div class="rb-card" id="s3TrHi"><span class="rb-t2">Seasons 1 & 2 · yours</span><ol class="s3-tbl s3-trold">${one(me.s1, 'Season 1')}${one(me.s2, 'Season 2')}</ol><span class="rb-sub">Furthest level, best match average, fewest darts in a won leg. Kept from before the reset.</span></div>`;
  }
  /* where and when the best leg came: stamped when career().best.leg drops during a Circuit match (Career's recordBests sets the number) */
  if (typeof recordBests === 'function') { const _rb = recordBests; recordBests = function () { const c = typeof career === 'function' ? career() : null, was = c && c.best ? c.best.leg : 99; const r = _rb.apply(this, arguments);
    try { const b = c && c.best; if (b && b.leg < was && typeof S !== 'undefined' && S && S.s3 && CI()) { const e = CI().eventOf(S.s3.id), k = D.st(); b.legAt = { d: b.leg, ev: e ? e.n : '', week: k ? k.week : null }; } } catch (e) {} return r; }; }

  window.TOPS_S3UI = {
    TABS: [['circuit', 'Circuit'], ['money', 'Money'], ['shop', 'Shop'], ['locker', 'Locker'], ['practice', 'Practice']],
    owns: t => t === 'circuit' || t === 'money',
    view: t => t === 'money' ? moneyTab() : circuit(),
    wire, attach: (fn, go) => { shell = fn; nav = go || null; },
    resultBlock, shelf, shelfData, navClear: () => { chipFrom = null; },
    refreshRecords: () => { blAt = 0; hiAt = 0; blRows = null; hiRows = null; render(); },
    _snap: snap, _seen: seenGet
  };
})();
