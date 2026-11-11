// Trophy cabinet, 3D: a small three.js scene of its own (one renderer, three lights, one 1024 shadow map).
// Wooden glass-front cabinet, glass shelves, warm spot, procedural trophies (lathe cups, plates, shields,
// a crystal and a dart column) in gold, silver and bronze with engraved plates. Renders on demand and
// disposes everything on close. core.js falls back to the painted 2D cabinet if this returns null.
window.TC_CAB3D = (function () {
  'use strict';
  const T = window.THREE;
  // shelf slots, same order as TC_DATA.TROPHIES: bottom row 0-2, middle row 3-5, top centre 6
  const SH = [.04, .47, .92], TOPY = 1.42, IW = .96, ID = .36;
  const SLOT = [[-.3, 0], [0, 0], [.3, 0], [-.3, 1], [0, 1], [.3, 1], [0, 2]];
  const hsh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  function canvasTex(w, h, draw, srgb) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); if (srgb !== false) t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t; }
  function woodTex(base, dark, rep) {
    const t = canvasTex(256, 512, (x, w, h) => {
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) { const px = hsh(i, 1) * w, wd = 1 + hsh(i, 2) * 5; x.fillStyle = `rgba(${dark},${.08 + hsh(i, 3) * .22})`; x.beginPath(); x.moveTo(px, 0);
        for (let y = 0; y <= h; y += 32) x.lineTo(px + Math.sin(y * .012 + i) * 6 + Math.sin(y * .05 + i * 3) * 2, y); for (let y = h; y >= 0; y -= 32) x.lineTo(px + wd + Math.sin(y * .012 + i) * 6 + Math.sin(y * .05 + i * 3) * 2, y); x.fill(); }
      for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,220,170,${hsh(i, 4) * .04})`; x.fillRect(hsh(i, 5) * w, hsh(i, 6) * h, 1, 6 + hsh(i, 7) * 20); }
    });
    t.wrapS = t.wrapT = T.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); return t;
  }
  // tiny equirect "room" so the metals have something warm to reflect: dark walls, two soft lamps, a bright window
  function envTex() {
    return canvasTex(512, 256, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6b5642'); g.addColorStop(.38, '#a98a66'); g.addColorStop(.5, '#d9bf98'); g.addColorStop(.6, '#6e5038'); g.addColorStop(1, '#2e2016'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      // soft boxes and lamps round the room so every curve of a cup catches something bright
      [[40, 110, 34, '#fff6e6'], [130, 96, 26, '#ffe2b0'], [230, 112, 40, '#fff2dc'], [330, 100, 24, '#ffd89c'], [420, 108, 36, '#fff4e2'], [256, 20, 60, '#fff0d8'], [100, 170, 30, '#c79a64'], [380, 175, 30, '#c79a64']].forEach(([cx, cy, r, c]) => { const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(cx - r, cy - r, r * 2, r * 2); });
      x.fillStyle = 'rgba(255,248,235,.8)'; x.fillRect(300, 86, 40, 26); x.fillRect(60, 90, 16, 30);
    });
  }
  function plateTex(lines, big) {
    return canvasTex(256, big ? 96 : 64, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f0d58e'); g.addColorStop(.5, '#c39a4c'); g.addColorStop(1, '#8a6427'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.strokeStyle = 'rgba(60,38,10,.7)'; x.lineWidth = 3; x.strokeRect(5, 5, w - 10, h - 10);
      x.fillStyle = '#2a1a06'; x.textAlign = 'center'; x.textBaseline = 'middle';
      lines.forEach((ln, i) => { let fs = i === 0 ? (big ? 30 : 22) : 17; x.font = `800 ${fs}px "Barlow Condensed", Impact, sans-serif`; while (x.measureText(ln).width > w - 22 && fs > 9) { fs--; x.font = `800 ${fs}px "Barlow Condensed", Impact, sans-serif`; }
        x.fillText(ln, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (big ? 32 : 22)); });
    });
  }
  function boardTex() {
    return canvasTex(256, 256, (x, w) => {
      const c = w / 2, seg = Math.PI / 10; x.fillStyle = '#111'; x.fillRect(0, 0, w, w);
      const ring = (r0, r1, a, b) => { for (let i = 0; i < 20; i++) { const s0 = -Math.PI / 2 - seg / 2 + i * seg; x.fillStyle = i % 2 ? a : b; x.beginPath(); x.arc(c, c, r1, s0, s0 + seg); x.arc(c, c, r0, s0 + seg, s0, true); x.closePath(); x.fill(); } };
      ring(0, 118, '#efe6cf', '#141414'); ring(104, 118, '#1f7a3e', '#c4242a'); ring(62, 72, '#1f7a3e', '#c4242a');
      x.fillStyle = '#1f7a3e'; x.beginPath(); x.arc(c, c, 12, 0, 7); x.fill(); x.fillStyle = '#c4242a'; x.beginPath(); x.arc(c, c, 5.5, 0, 7); x.fill();
      x.strokeStyle = 'rgba(200,200,200,.55)'; x.lineWidth = 1.2; [118, 104, 72, 62, 12].forEach(r => { x.beginPath(); x.arc(c, c, r, 0, 7); x.stroke(); });
    });
  }
  function lathe(pts, mat, seg) { const g = new T.LatheGeometry(pts.map(p => new T.Vector2(p[0], p[1])), seg || 40); return new T.Mesh(g, mat); }
  function handle(mat, r, tube, x, y, flip) { const m = new T.Mesh(new T.TorusGeometry(r, tube, 8, 24, Math.PI * 1.15), mat); m.position.set(x, y, 0); m.rotation.z = flip ? Math.PI * .92 : -Math.PI * .07; if (flip) m.rotation.y = Math.PI; return m; }
  function dart(steel, flightMat) {
    const g = new T.Group();
    const barrel = new T.Mesh(new T.CylinderGeometry(.006, .007, .05, 14), steel); g.add(barrel);
    const tip = new T.Mesh(new T.ConeGeometry(.0035, .03, 10), steel); tip.position.y = -.04; tip.rotation.x = Math.PI; g.add(tip);
    const shaft = new T.Mesh(new T.CylinderGeometry(.003, .003, .035, 8), flightMat); shaft.position.y = .042; g.add(shaft);
    for (let k = 0; k < 2; k++) { const f = new T.Mesh(new T.PlaneGeometry(.026, .03), flightMat); f.position.y = .062; f.rotation.y = k * Math.PI / 2; g.add(f); }
    return g;
  }
  // base block with the engraved plate on its front
  function base(M, w, h, d, plate, name) {
    const g = new T.Group();
    const b = new T.Mesh(new T.BoxGeometry(w, h, d), M.ebony); b.position.y = h / 2; g.add(b);
    const cap = new T.Mesh(new T.BoxGeometry(w * .86, h * .25, d * .86), M.ebony); cap.position.y = h + h * .125; g.add(cap);
    if (plate) { const pm = new T.MeshStandardMaterial({ map: plateTex(name), metalness: .85, roughness: .32, envMap: M.env, envMapIntensity: 1 }); const p = new T.Mesh(new T.PlaneGeometry(w * .78, h * .5), pm); p.position.set(0, h * .5, d / 2 + .0015); g.add(p); M.own.push(pm); }
    g.userData.top = h * 1.25; return g;
  }
  function cup(M, metal, s, o) {
    o = o || {}; const g = new T.Group();
    const prof = [[0, 0], [.07, 0], [.07, .008], [.045, .016], [.02, .03], [.015, .07], [.026, .08], [.015, .09], [.016, .1], [.03, .11], [.07, .14], [.095, .19], [.1, .23], [.104, .235], [.098, .235], [.09, .19], [.0, .16]].map(p => [p[0] * s * (o.wide || 1), p[1] * s]);
    if (o.wide) prof.forEach(p => { if (p[1] > .11 * s) p[1] = .11 * s + (p[1] - .11 * s) * .6; });
    g.add(lathe(prof, metal));
    if (o.handles !== false) { const hy = o.wide ? .16 * s : .19 * s, hx = (o.wide ? .1 : .095) * s * (o.wide || 1); g.add(handle(metal, .035 * s, .006 * s, hx, hy, false), handle(metal, .035 * s, .006 * s, -hx, hy, true)); }
    if (o.lid) { const lid = lathe([[0, 0], [.1, 0], [.1, .006], [.07, .02], [.03, .05], [.012, .06], [.02, .075], [.0, .09]].map(p => [p[0] * s, p[1] * s]), metal); lid.position.y = .235 * s; g.add(lid); }
    return g;
  }
  // one trophy per tier
  function trophy(M, tier, name) {
    const g = new T.Group(); let b, top, h;
    if (tier === 0) {           // pub league: bronze column with a dart on top
      b = base(M, .13, .045, .1, true, [name]); g.add(b); top = b.userData.top;
      const col = new T.Mesh(new T.CylinderGeometry(.016, .02, .11, 16), M.bronze); col.position.y = top + .055; g.add(col);
      const cap = new T.Mesh(new T.CylinderGeometry(.03, .02, .012, 20), M.bronze); cap.position.y = top + .116; g.add(cap);
      const disc = new T.Mesh(new T.CylinderGeometry(.036, .036, .008, 28), [M.bronze, M.board, M.bronze]); disc.rotation.x = Math.PI / 2; disc.position.set(0, top + .17, 0); g.add(disc);
      const d = dart(M.silver, M.flight); d.position.set(0, top + .23, .012); d.rotation.z = .5; g.add(d);
      h = top + .27;
    } else if (tier === 1) {    // club singles: silver two-handled cup
      b = base(M, .14, .055, .11, true, [name]); g.add(b); top = b.userData.top;
      const c = cup(M, M.silver, .95); c.position.y = top; g.add(c); h = top + .24;
    } else if (tier === 2) {    // regional: wooden shield with a silver board and little shields round it
      const sh = new T.Shape(); sh.moveTo(-.09, .2); sh.lineTo(.09, .2); sh.lineTo(.09, .07); sh.quadraticCurveTo(.08, -.02, 0, -.06); sh.quadraticCurveTo(-.08, -.02, -.09, .07); sh.closePath();
      const sg = new T.ExtrudeGeometry(sh, { depth: .016, bevelEnabled: true, bevelThickness: .004, bevelSize: .005, bevelSegments: 2 }); const shield = new T.Mesh(sg, M.mahog); shield.position.set(0, .09, -.02); shield.rotation.x = -.12; g.add(shield);
      const board = new T.Mesh(new T.CylinderGeometry(.045, .045, .008, 32), [M.silver, M.board, M.silver]); board.rotation.x = Math.PI / 2 - .12; board.position.set(0, .2, .005); g.add(board);
      const ring = new T.Mesh(new T.TorusGeometry(.03, .003, 6, 28), M.gold); ring.position.set(0, .2, .011); ring.rotation.x = -.12; g.add(ring);
      for (let i = 0; i < 6; i++) { const a = -1 + i * .4, p = new T.Mesh(new T.BoxGeometry(.022, .014, .004), M.silver); p.position.set(Math.sin(a) * .07, .2 - Math.cos(a) * .07 - .02, .008 + .012); p.rotation.x = -.12; g.add(p); }
      const pm = new T.MeshStandardMaterial({ map: plateTex([name]), metalness: .85, roughness: .32, envMap: M.env }); M.own.push(pm); const pl = new T.Mesh(new T.PlaneGeometry(.1, .026), pm); pl.position.set(0, .1, .012); pl.rotation.x = -.12; g.add(pl);
      const foot = new T.Mesh(new T.BoxGeometry(.12, .02, .07), M.ebony); foot.position.y = .01; g.add(foot);
      h = .3;
    } else if (tier === 3) {    // DPNZ: crystal blade on a black base
      b = base(M, .12, .05, .09, true, [name]); g.add(b); top = b.userData.top;
      const s = new T.Shape(); s.moveTo(-.04, 0); s.lineTo(.04, 0); s.lineTo(.05, .16); s.lineTo(.0, .23); s.lineTo(-.035, .19); s.closePath();
      const cg = new T.ExtrudeGeometry(s, { depth: .022, bevelEnabled: true, bevelThickness: .004, bevelSize: .004, bevelSegments: 1 }); cg.translate(0, 0, -.011);
      const cr = new T.Mesh(cg, M.crystal); cr.position.y = top; g.add(cr);
      const et = new T.Mesh(new T.CircleGeometry(.026, 28), M.etch); et.position.set(.004, top + .12, .016); g.add(et);
      h = top + .24;
    } else if (tier === 4) {    // Trans-Tasman: tall lidded silver cup
      b = base(M, .15, .06, .12, true, [name]); g.add(b); top = b.userData.top;
      const c = cup(M, M.silver, 1.05, { lid: true }); c.position.y = top; g.add(c); h = top + .34;
    } else if (tier === 5) {    // Players Championship: wide gold chalice with a dart laid across
      b = base(M, .16, .065, .12, true, [name]); g.add(b); top = b.userData.top;
      const c = cup(M, M.gold, 1, { wide: 1.25, handles: false }); c.position.y = top; g.add(c);
      const d = dart(M.silver, M.flight); d.position.set(0, top + .2, .02); d.rotation.set(0, 0, 1.2); g.add(d); h = top + .23;
    } else {                    // the Palace: big gold lidded cup on a tall stepped plinth
      const p1 = new T.Mesh(new T.BoxGeometry(.22, .05, .17), M.ebony); p1.position.y = .025; g.add(p1);
      const p2 = new T.Mesh(new T.BoxGeometry(.18, .07, .14), M.ebony); p2.position.y = .085; g.add(p2);
      const p3 = new T.Mesh(new T.CylinderGeometry(.06, .075, .03, 32), M.ebony); p3.position.y = .135; g.add(p3);
      const pm = new T.MeshStandardMaterial({ map: plateTex([name, 'The Palace'], true), metalness: .85, roughness: .3, envMap: M.env }); M.own.push(pm);
      const pl = new T.Mesh(new T.PlaneGeometry(.15, .055), pm); pl.position.set(0, .085, .0715); g.add(pl);
      const c = cup(M, M.gold, 1.25, { lid: true }); c.position.y = .15; g.add(c);
      g.userData.fit = .84; h = .55;
    }
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = false; } });
    g.userData.h = h; return g;
  }

  function mount(wrap, opts) {
    if (!T || !T.WebGLRenderer) return null;
    let R;
    try { R = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' }); } catch (e) { return null; }
    if (!R || !R.getContext || !R.getContext()) return null;
    const own = [], disposers = [];
    R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    const cv = R.domElement; cv.className = 'tc-cab3d'; wrap.appendChild(cv);
    const sc = new T.Scene(); sc.background = new T.Color(0x0f1612); sc.fog = new T.Fog(0x0f1612, 4.5, 9);
    // environment for reflections
    const pm = new T.PMREMGenerator(R); const eq = envTex(); eq.mapping = T.EquirectangularReflectionMapping; const envRT = pm.fromEquirectangular(eq); eq.dispose(); pm.dispose();
    const env = envRT.texture;
    const M = { env, own };
    const mk = (o) => { const m = new T.MeshStandardMaterial(Object.assign({ envMap: env }, o)); own.push(m); return m; };
    M.gold = mk({ color: 0xe8bd62, metalness: 1, roughness: .22, envMapIntensity: 1.6 });
    M.silver = mk({ color: 0xe4e7ea, metalness: 1, roughness: .18, envMapIntensity: 1.5 });
    M.bronze = mk({ color: 0xc4844c, metalness: 1, roughness: .3, envMapIntensity: 1.4 });
    M.ebony = mk({ color: 0x141110, metalness: 0, roughness: .35, envMapIntensity: .6 });
    M.board = mk({ map: boardTex(), roughness: .7, envMapIntensity: .3 });
    M.flight = mk({ color: 0xC6F36B, roughness: .5, side: T.DoubleSide });
    M.crystal = mk({ color: 0xcfe8ff, metalness: .1, roughness: .02, transparent: true, opacity: .42, envMapIntensity: 2.2, depthWrite: false });
    M.etch = mk({ color: 0xffffff, roughness: .6, transparent: true, opacity: .35, depthWrite: false });
    const wood = woodTex('#4b2513', '30,12,4', [1, 1]), woodH = woodTex('#4b2513', '30,12,4', [1, .25]); woodH.rotation = Math.PI / 2;
    M.mahog = mk({ map: wood, color: 0xd8b8a0, roughness: .45, envMapIntensity: .5 });
    const frameM = mk({ map: wood, color: 0xc9a487, roughness: .42, envMapIntensity: .55 });
    const frameH = mk({ map: woodH, color: 0xc9a487, roughness: .42, envMapIntensity: .55 });
    const backT = canvasTex(256, 512, (x, w, h) => { x.fillStyle = '#3d1f12'; x.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${hsh(i, 8) > .5 ? '255,200,150' : '0,0,0'},${hsh(i, 9) * .05})`; x.fillRect(hsh(i, 10) * w, hsh(i, 11) * h, 2, 2); } [.18, .5, .82].forEach(y => { const rg = x.createRadialGradient(w / 2, h * (1 - y) - 40, 4, w / 2, h * (1 - y) - 20, 150); rg.addColorStop(0, 'rgba(255,190,110,.32)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(0, 0, w, h); }); });
    const backM = mk({ map: backT, roughness: .9, envMapIntensity: .2 });
    const wallT = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#16251d'; x.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(${hsh(i, 12) > .5 ? '120,160,130' : '0,0,0'},${hsh(i, 13) * .06})`; x.fillRect(hsh(i, 14) * w, hsh(i, 15) * h, 2, 3); } });
    wallT.wrapS = wallT.wrapT = T.RepeatWrapping; wallT.repeat.set(3, 2);
    const wallM = mk({ map: wallT, roughness: .95, envMapIntensity: .1 });
    const glassM = mk({ color: 0xffffff, metalness: 0, roughness: .02, transparent: true, opacity: .07, envMapIntensity: 2.5, depthWrite: false });
    const shelfM = mk({ color: 0xb8e0cc, metalness: 0, roughness: .05, transparent: true, opacity: .32, envMapIntensity: 2, depthWrite: false });
    const brassM = mk({ color: 0xd6a956, metalness: 1, roughness: .28, envMapIntensity: 1.2 });
    const add = (geo, mat, x, y, z, rs) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); if (rs) m.receiveShadow = true; sc.add(m); return m; };

    // room: wall, panelled dado, floor
    add(new T.PlaneGeometry(6, 4), wallM, 0, 1.4, -.32, true);
    const dado = add(new T.BoxGeometry(6, .62, .03), frameH, 0, -.06, -.3, true);
    add(new T.BoxGeometry(6, .03, .05), frameH, 0, .26, -.29, true);
    const floor = add(new T.PlaneGeometry(6, 4), mk({ color: 0x1c120c, roughness: .8, envMapIntensity: .2 }), 0, -.37, 1, true); floor.rotation.x = -Math.PI / 2;
    // cabinet carcass
    const W = IW + .1, Z = 0;
    add(new T.PlaneGeometry(IW, TOPY + .02), backM, 0, TOPY / 2, -ID / 2, true);
    [-1, 1].forEach(s => { add(new T.BoxGeometry(.05, TOPY + .1, ID + .06), frameM, s * (IW / 2 + .025), TOPY / 2, Z, true); });
    add(new T.BoxGeometry(W + .04, .07, ID + .1), frameH, 0, TOPY + .035, Z, true);                     // top
    add(new T.BoxGeometry(W + .1, .05, ID + .14), frameH, 0, TOPY + .095, Z + .01, true);                  // cornice
    const crest = new T.Shape(); crest.moveTo(-.4, 0); crest.lineTo(.4, 0); crest.lineTo(.4, .04); crest.quadraticCurveTo(.2, .05, .12, .1); crest.quadraticCurveTo(0, .14, -.12, .1); crest.quadraticCurveTo(-.2, .05, -.4, .04); crest.closePath();
    const cm = new T.Mesh(new T.ExtrudeGeometry(crest, { depth: .03, bevelEnabled: false }), frameH); cm.position.set(0, TOPY + .12, ID / 2 - .02); sc.add(cm);
    add(new T.BoxGeometry(W + .04, .07, ID + .1), frameH, 0, SH[0] - .035, Z, true);                     // floor of the case
    add(new T.BoxGeometry(W + .08, .3, ID + .14), frameH, 0, -.21, Z + .01, true);                       // lower cupboard
    add(new T.BoxGeometry(W - .1, .2, .01), frameM, 0, -.21, ID / 2 + .085, true);                       // its door panel
    add(new T.BoxGeometry(W + .12, .03, ID + .18), frameH, 0, -.355, Z + .01, true);                      // plinth
    // glass shelves with brass rails
    [SH[1], SH[2]].forEach(y => { const s = add(new T.BoxGeometry(IW - .01, .012, ID - .02), shelfM, 0, y - .006, 0, false); s.renderOrder = 2; add(new T.BoxGeometry(IW - .01, .006, .006), brassM, 0, y - .006, ID / 2 - .012, false); });
    // door: frame + glass + glare
    const fz = ID / 2 + .03, fw = .045;
    add(new T.BoxGeometry(W, fw, .025), frameH, 0, TOPY - fw / 2 + .005, fz); add(new T.BoxGeometry(W, fw, .025), frameH, 0, fw / 2 - .005, fz);
    [-1, 1].forEach(s => add(new T.BoxGeometry(fw, TOPY, .025), frameM, s * (W / 2 - fw / 2), TOPY / 2, fz));
    const knob = add(new T.SphereGeometry(.014, 16, 10), brassM, W / 2 - fw / 2, TOPY * .48, fz + .022);
    [.3, .75, 1.2].forEach(y => add(new T.BoxGeometry(.012, .04, .008), brassM, -(W / 2 - .006), y, fz));
    const glare = canvasTex(128, 256, (x, w, h) => { x.clearRect(0, 0, w, h); [[.15, .1], [.32, .035], [.7, .06]].forEach(([p, ww]) => { const g = x.createLinearGradient(0, 0, w, h * .5); g.addColorStop(Math.max(0, p - ww), 'rgba(255,255,255,0)'); g.addColorStop(p, 'rgba(255,245,225,.55)'); g.addColorStop(Math.min(1, p + ww), 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }); });
    const glass = add(new T.PlaneGeometry(W - fw * 2 + .01, TOPY - fw * 2 + .01), glassM, 0, TOPY / 2, fz); glass.renderOrder = 5;
    const glM = mk({ map: glare, transparent: true, opacity: .32, depthWrite: false, blending: T.AdditiveBlending, color: 0xffffff, roughness: 1, metalness: 0 });
    const gl = add(new T.PlaneGeometry(W - fw * 2, TOPY - fw * 2), glM, 0, TOPY / 2, fz + .002); gl.renderOrder = 6;
    // brass label plate on the cornice
    { const lm = mk({ map: plateTex([opts.label || 'Trophy cabinet']), metalness: .85, roughness: .3 }); const lp = add(new T.PlaneGeometry(.28, .07), lm, 0, TOPY + .095, Z + .01 + (ID + .14) / 2 + .001); lp.scale.set(1, .8, 1); }

    // lights: warm hemisphere fill, one shadowed spot from the ceiling, a small lamp inside the case
    sc.add(new T.HemisphereLight(0xffe2bd, 0x1a120c, .5));
    const spot = new T.SpotLight(0xffd8a8, 2.4, 7, .5, .75, 1.2); spot.position.set(.5, 3, 2.2); spot.target.position.set(0, .7, 0); sc.add(spot, spot.target);
    spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -.0006; spot.shadow.camera.near = 1; spot.shadow.camera.far = 6;
    const lamp = new T.PointLight(0xffc27a, 1.1, 1.8, 2); lamp.position.set(0, TOPY - .08, .02); sc.add(lamp);

    // trophies
    const items = []; const byId = {};
    (opts.trophies || []).forEach(t => {
      const s = SLOT[Math.max(0, Math.min(6, t.slot))], g = trophy(M, t.slot, t.name);
      g.scale.setScalar(g.userData.fit || .95);
      g.position.set(s[0], SH[s[1]] + .001, -.02); g.rotation.y = t.slot === 2 ? 0 : (hsh(t.slot, 3) - .5) * .5;
      g.userData.tid = t.id; g.userData.ry0 = g.rotation.y; sc.add(g); items.push(g); byId[t.id] = g;
      g.traverse(m => { if (m.isMesh) m.userData.tid = t.id; });
      if (t.count > 1) {          // repeat wins: a little brass ×N plate on the shelf in front
        const xm = mk({ map: canvasTex(128, 64, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f0d58e'); gr.addColorStop(1, '#8a6427'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(60,38,10,.7)'; x.lineWidth = 3; x.strokeRect(4, 4, w - 8, h - 8); x.fillStyle = '#2a1a06'; x.font = '800 44px "Barlow Condensed", Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('×' + t.count, w / 2, h / 2 + 2); }), metalness: .85, roughness: .3 });
        const xp = new T.Mesh(new T.BoxGeometry(.075, .034, .008), [frameM, frameM, frameM, frameM, xm, frameM]); xp.position.set(s[0] + .085, SH[s[1]] + .02, .09); xp.rotation.set(-.32, -.15, 0); xp.castShadow = true; xp.userData.tid = t.id; sc.add(xp);
      }
    });
    if (!items.length) {            // empty: dusty outlines where the trophies will go
      const ghost = mk({ color: 0xffe0b0, transparent: true, opacity: .07, depthWrite: false, roughness: 1 });
      SLOT.forEach((s, i) => { const r = new T.Mesh(new T.RingGeometry(.045, .052, 32), ghost); r.rotation.x = -Math.PI / 2; r.position.set(s[0], SH[s[1]] + .003, -.02); sc.add(r); });
    }

    // camera, sized to frame the cabinet whatever the aspect
    const cam = new T.PerspectiveCamera(30, 1, .1, 20); const look = new T.Vector3(0, .64, 0);
    let yaw = 0, yawT = 0, sel = null, intro = 0, raf = 0, dead = false, lastT = 0;
    function frame() { const w = wrap.clientWidth || 390, h = wrap.clientHeight || 520; R.setSize(w, h, false); cam.aspect = w / h; const needH = 2.18, needW = 1.4; const vf = cam.fov * Math.PI / 360; const dH = needH / 2 / Math.tan(vf), dW = needW / 2 / (Math.tan(vf) * cam.aspect); cam.userData.d = Math.max(dH, dW); cam.updateProjectionMatrix(); }
    function place() { const d = cam.userData.d * (1 + .25 * (1 - ease(intro))); cam.position.set(Math.sin(yaw) * d, look.y + .12, Math.cos(yaw) * d); cam.lookAt(look); }
    const ease = t => 1 - Math.pow(1 - Math.min(1, t), 3);
    function tick(now) {
      raf = 0; if (dead) return; if (!wrap.isConnected) { dispose(); return; }
      const dt = Math.min(.05, lastT ? (now - lastT) / 1000 : .016); lastT = now; let busy = false;
      if (intro < 1) { intro = Math.min(1, intro + dt / 1.1); busy = true; }
      if (Math.abs(yawT - yaw) > .0005) { yaw += (yawT - yaw) * Math.min(1, dt * 8); busy = true; }
      items.forEach(g => { if (g === sel) { g.rotation.y += dt * .7; busy = true; } else if (Math.abs(g.rotation.y - g.userData.ry0) > .002) { const d = ((g.userData.ry0 - g.rotation.y + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; g.rotation.y += d * Math.min(1, dt * 5); busy = true; } });
      const tgt = sel ? sel.position.clone().add(new T.Vector3(0, .15, 0)) : new T.Vector3(0, .7, 0); if (spot.target.position.distanceTo(tgt) > .002) { spot.target.position.lerp(tgt, Math.min(1, dt * 5)); busy = true; }
      spot.angle += ((sel ? .3 : .5) - spot.angle) * Math.min(1, dt * 5); spot.intensity += ((sel ? 3.2 : 2.4) - spot.intensity) * Math.min(1, dt * 5);
      place(); R.render(sc, cam);
      if (busy) raf = requestAnimationFrame(tick); else lastT = 0;
    }
    const kick = () => { if (!raf && !dead) raf = requestAnimationFrame(tick); };
    // input: tap to pick a trophy, drag sideways to look round the case a little
    const ray = new T.Raycaster(), v2 = new T.Vector2(); let down = null;
    const pd = e => { down = { x: e.clientX, y: e.clientY, yaw: yawT, moved: false }; };
    const pmv = e => { if (!down) return; const dx = e.clientX - down.x; if (Math.abs(dx) > 6) down.moved = true; if (down.moved) { yawT = Math.max(-.35, Math.min(.35, down.yaw - dx / 500)); kick(); } };
    const pu = e => { const d0 = down; down = null; if (!d0 || d0.moved) return; const r = cv.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(v2, cam);
      const hit = ray.intersectObjects(sc.children, true).find(h => h.object.userData.tid); pick(hit ? hit.object.userData.tid : null, true); };
    const pc = () => { down = null; };
    cv.addEventListener('pointerdown', pd); cv.addEventListener('pointermove', pmv); cv.addEventListener('pointercancel', pc); window.addEventListener('pointerup', pu);
    const alive = setInterval(() => { if (!wrap.isConnected) dispose(); }, 2000);
    disposers.push(() => { clearInterval(alive); cv.removeEventListener('pointerdown', pd); cv.removeEventListener('pointermove', pmv); cv.removeEventListener('pointercancel', pc); window.removeEventListener('pointerup', pu); });
    function pick(id, user) { const g = id && byId[id]; sel = g || null; kick(); if (user && opts.onPick) opts.onPick(sel ? id : null); }
    let ro = null; if (window.ResizeObserver) { ro = new ResizeObserver(() => { frame(); kick(); }); ro.observe(wrap); disposers.push(() => ro.disconnect()); }
    function dispose() {
      if (dead) return; dead = true; if (raf) cancelAnimationFrame(raf); raf = 0; disposers.forEach(f => { try { f(); } catch (e) {} });
      sc.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      own.forEach(m => { ['map', 'envMap'].forEach(k => { if (m[k] && m[k] !== env) m[k].dispose(); }); m.dispose(); });
      envRT.dispose(); spot.shadow.map && spot.shadow.map.dispose(); R.dispose(); try { R.forceContextLoss(); } catch (e) {} cv.remove();
    }
    frame(); if (opts.instant) intro = 1; place(); R.render(sc, cam); kick();
    return { select: id => pick(id, false), dispose, renderer: R, scene: sc, camera: cam, items: byId };
  }
  return { mount };
})();
