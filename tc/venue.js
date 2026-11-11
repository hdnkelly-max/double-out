// ===== TOPS venue posters: paint art into the empty picture frames baked into the venue walls =====
// The pub's frames are baked into bake_wallR's texture. Each entry is the UV pixel rect (on the 2048 texture)
// of a frame's picture face, plus the poster to paint there. game4.js calls TOPS_VENUE_TEX while loading the venue glb.
(function () {
  'use strict';
  const P = 'assets/venue/';
  const SPOTS = {
    0: { bake_wallR: [
      // left → right on the side wall: p4, p2, p1, p3. Faces map the texture rotated 180°.
      { r: [1719, 474, 1801, 585], img: 'pub_1.webp', rot: 180, dim: .32 },
      { r: [1724, 1100, 1805, 1211], img: 'pub_2.webp', rot: 180, dim: .32 },
      { r: [1724, 1241, 1805, 1351], img: 'pub_3.webp', rot: 180, dim: .32 },
      { r: [1696, 1365, 1777, 1476], img: 'pub_4.webp', rot: 180, dim: .32 }
    ] },
    // the club: plain painted walls, so these get a frame, a mat and a shadow. Faces map the texture rotated 90° (wall up = texture -x).
    1: {
      bake_wallL: [
        { r: [240, 1528, 600, 1752], img: 'club_team.webp', rot: 270, frame: 'wood' },
        { r: [240, 1168, 600, 1392], img: 'club_brew.webp', rot: 270, frame: 'black' },
        { r: [240, 808, 600, 1032], img: 'club_throw.webp', rot: 270, frame: 'black' }
      ],
      bake_wallB: [
        { r: [130, 590, 400, 770], img: 'club_raffle.webp', rot: 270, frame: 'black' },
        { r: [130, 250, 400, 430], img: 'club_throw.webp', rot: 270, frame: 'wood' }
      ]
    }
  };

  const LIGHT = { 1: [
    '{ vec3 w = vTopsW;',
    '  float lane = exp(-pow(length((w - vec3(0., 1.8, .3)) * vec3(.55, .8, .7)), 2.));',   // board lane: wide, warm
    '  float oche = exp(-pow(length((w - vec3(0., .05, 2.4)) * vec3(.75, 1.5, .75)), 2.));',  // pool on the oche
    '  float side = exp(-pow(length((w - vec3(4.4, 1.75, 2.2)) * vec3(.9, .85, .5)), 2.));',  // wash on the honours wall behind the thrower (side view)
    '  float edge = smoothstep(3.2, 4.5, abs(w.x)) * .14 * (1. - side) + smoothstep(4.8, 7., w.z) * .3 + smoothstep(2.5, 3.4, w.y) * .25;',
    '  float hon = exp(-pow(length((w - vec3(4.42, 1.85, 1.6)) * vec3(1.0, 1.25, .8)), 2.));',  // tight amber highlight on the honours boards (x 4.42, y 1.2-2.5, z 0.6-2.6, measured from the wallR UVs)
    '  float flr = exp(-pow(length((w - vec3(2.4, 0., 3.4)) * vec3(.9, 4., .9)), 2.)) * (1. - oche);', // carpet behind the player, kept off the oche pool
    '  float L = clamp(.74 + .42 * lane + .3 * oche + .3 * side + .5 * hon - edge - .13 * flr, .36, 1.28);',
    '  outgoingLight *= L * mix(vec3(1.), vec3(1.07, .97, .82), clamp(lane + oche + hon, 0., 1.)); }'
  ].join('\n'),
    // pub: one lit board in a dim, warm boozer. The board lane is the brightest thing, the brick wall the side
    // camera faces (x 3.2) gets only a low wash, the bar glows as a warm pocket, ceiling and corners go dark.
    0: [
    '{ vec3 w = vTopsW;',
    '  float lane = exp(-pow(length((w - vec3(0., 1.75, .25)) * vec3(.95, 1.05, .95)), 2.));',  // hood light over the board
    '  float oche = exp(-pow(length((w - vec3(0., .05, 2.4)) * vec3(.9, 1.6, .9)), 2.));',
    '  float side = exp(-pow(length((w - vec3(3.2, 1.6, 2.0)) * vec3(.9, .9, .6)), 2.));',     // brick behind the thrower: low wash
    '  float bar = exp(-pow(length((w - vec3(-3.4, 1.2, 4.2)) * vec3(.7, .9, .55)), 2.));',     // warm pocket at the bar
    '  float low = exp(-pow(length((w - vec3(3.1, .55, 2.0)) * vec3(.9, 2.2, .6)), 2.));',      // oche spill kissing the lower wall: separates carpet, panels, brick
    '  float corner = exp(-pow(length((w - vec3(3.2, 1.9, .5)) * vec3(.9, .9, .9)), 2.));',     // board-light spill on the side wall near the board corner
    '  float head = exp(-pow(length((w - vec3(3.2, 1.75, 2.0)) * vec3(.9, .75, .95)), 2.));',  // the brick right behind the thrower\'s head and arm
    '  float edge = smoothstep(2.0, 3.3, w.y) * .32 + smoothstep(4.4, 7., w.z) * .22 + smoothstep(3.4, 4.5, w.x) * .12;',
    '  float L = clamp(.6 + .62 * lane + .26 * oche + .14 * side + .22 * bar + .2 * low + .22 * corner - edge, .3, 1.24);',
    '  float lm = dot(outgoingLight, vec3(.2126, .7152, .0722));',
    '  outgoingLight = mix(outgoingLight, vec3(lm) * vec3(1.15, .92, .7), .38 * head);',          // calmer, less contrasty brick behind the thrower
    '  outgoingLight = mix(outgoingLight, vec3(.13, .09, .065), .2 * head);',
    '  outgoingLight *= L * mix(vec3(1.03, .97, .88), vec3(1.08, .95, .78), clamp(lane + oche + bar + corner, 0., 1.)); }'
    ].join('\n') };
  function venueMat(tier, name, mat) {
    if (!LIGHT[tier] || !mat || !/^bake_/.test(name)) return;
    mat.customProgramCacheKey = () => 'topsVenue' + tier;   // one program per venue light setup; club and pub never share or clash
    mat.onBeforeCompile = sh => {
      sh.vertexShader = 'varying vec3 vTopsW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vTopsW = (modelMatrix * vec4(transformed, 1.)).xyz;');
      sh.fragmentShader = 'varying vec3 vTopsW;\n' + sh.fragmentShader.replace('#include <envmap_fragment>', '#include <envmap_fragment>\n' + LIGHT[tier]);
    };
  }
  window.TOPS_VENUE_MAT = venueMat;
  window.TOPS_VENUE_SPOTS = SPOTS;
  window.TOPS_VENUE_TEX = function (tier, name, map) {
    if (window.TOPS_VENUE_DEBUG) (window.__ven = window.__ven || []).push([tier, name]);
    const spots = SPOTS[tier] && SPOTS[tier][name]; if (!spots || !map || !map.image) return null;
    const src = map.image, W = src.width || 2048, H = src.height || 2048, k = W / 2048;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    g.drawImage(src, 0, 0, W, H);
    const tex = new THREE.CanvasTexture(cv); tex.flipY = map.flipY; tex.wrapS = map.wrapS; tex.wrapT = map.wrapT;
    spots.forEach(s => {
      const im = new Image(); im.onload = () => {
        const [x0, y0, x1, y1] = s.r.map(v => v * k), w = x1 - x0, h = y1 - y0;
        g.save(); g.translate(x0 + w / 2, y0 + h / 2); if (s.rot) g.rotate(s.rot * Math.PI / 180); if (s.flip) g.scale(-1, 1);
        const sw = s.rot % 180 ? h : w, sh = s.rot % 180 ? w : h;
        // cover-fit the poster, then darken a touch so it sits in the baked lighting
        const a = im.width / im.height, b = sw / sh; let dw = sw, dh = sh; if (a > b) dw = sh * a; else dh = sw / a;
        if (s.frame) {   // a real frame on a plain wall: soft shadow below, moulding, then a mat for photos
          const fw = Math.max(4, sw * .055), mat = s.frame === 'wood' ? sw * .06 : 0;
          g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = sw * .08; g.shadowOffsetY = sw * .04; g.fillStyle = '#222'; g.fillRect(-sw / 2, -sh / 2, sw, sh); g.restore();
          if (s.frame !== 'none') {
            const fg = g.createLinearGradient(-sw / 2, -sh / 2, sw / 2, sh / 2);
            if (s.frame === 'wood') { fg.addColorStop(0, '#6b4424'); fg.addColorStop(.5, '#8a5a33'); fg.addColorStop(1, '#4e2f17'); } else { fg.addColorStop(0, '#2b2b2d'); fg.addColorStop(.5, '#151516'); fg.addColorStop(1, '#0b0b0c'); }
            g.fillStyle = fg; g.fillRect(-sw / 2, -sh / 2, sw, sh);
            g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; g.strokeRect(-sw / 2 + .5, -sh / 2 + .5, sw - 1, sh - 1);
            if (mat) { g.fillStyle = '#efe9dc'; g.fillRect(-sw / 2 + fw, -sh / 2 + fw, sw - 2 * fw, sh - 2 * fw); }
            const ins = fw + mat; g.translate(0, 0); s._in = ins;
          } else s._in = 0;
          const ins = s._in, iw = sw - 2 * ins, ih = sh - 2 * ins; let ddw = iw, ddh = ih; if (a > iw / ih) ddw = ih * a; else ddh = iw / a;
          g.beginPath(); g.rect(-iw / 2, -ih / 2, iw, ih); g.clip(); g.drawImage(im, -ddw / 2, -ddh / 2, ddw, ddh);
          const gl = g.createLinearGradient(-iw / 2, -ih / 2, iw / 2, ih / 2); gl.addColorStop(0, 'rgba(255,255,255,.14)'); gl.addColorStop(.35, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(-iw / 2, -ih / 2, iw, ih);   // glass glare
          g.restore(); tex.needsUpdate = true; return;
        }
        g.beginPath(); g.rect(-sw / 2, -sh / 2, sw, sh); g.clip(); g.drawImage(im, -dw / 2, -dh / 2, dw, dh);
        g.fillStyle = 'rgba(20,12,6,' + (s.dim == null ? .18 : s.dim) + ')'; g.fillRect(-sw / 2, -sh / 2, sw, sh);
        const sh2 = g.createLinearGradient(0, -sh / 2, 0, sh / 2); sh2.addColorStop(0, 'rgba(255,230,190,.10)'); sh2.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = sh2; g.fillRect(-sw / 2, -sh / 2, sw, sh);
        g.restore(); tex.needsUpdate = true;
      };
      im.src = P + s.img;
    });
    return tex;
  };
})();

// ===== the board matches the venue: tired at the pub, fresh and branded on the big stages =====
(function () {
  'use strict';
  //        wear: pinhole multiplier · fade: colour washed out · dirt: grime + stains · fresh: vivid colours + white numbers
  const LOOK = [
    { wear: 1.5, fade: .34, dirt: 1,   brand: 'KAURI ARMS',      ring: 'rgba(233,228,216,.42)', holes: 220 },
    { wear: 1.1, fade: .2,  dirt: .6,  brand: 'RSA DARTS CLUB',  ring: 'rgba(233,228,216,.5)',  holes: 120 },
    { wear: .9,  fade: .06, dirt: .2,  brand: 'SUPER LEAGUE',    ring: 'rgba(240,240,236,.6)',  holes: 40 },
    { wear: .4,  fade: 0,   dirt: 0,   brand: 'DPNZ PROTOUR',    ring: '#e8382c',               holes: 10, fresh: .5 },
    { wear: .15, fade: 0,   dirt: 0,   brand: 'TRANS-TASMAN',    ring: '#ffb000',               holes: 0,  fresh: .8 },
    { wear: 0,   fade: 0,   dirt: 0,   brand: 'PRO TOUR',        ring: '#2c8cff',               holes: 0,  fresh: 1, sponsor: 'TOPS' },
    { wear: 0,   fade: 0,   dirt: 0,   brand: 'WORLD CHAMPS',    ring: '#C6F36B',               holes: 0,  fresh: 1, sponsor: 'TOPS' }
  ];
  const cache = {}, scache = {};
  let cur = -1;
  window.TOPS_BOARD_LOOK = LOOK; window.TOPS_BOARD_CACHE = cache;
  window.TOPS_BOARD = function (t, G) {
    const L = LOOK[Math.max(0, Math.min(6, t | 0))]; if (cur === t) return; cur = t;
    // board face: regenerate the base with this venue's wear, then grade it
    let cv = cache[t];
    if (!cv) {
      const base = G.boardTexture(L.wear).image;
      cv = document.createElement('canvas'); cv.width = base.width; cv.height = base.height; const x = cv.getContext('2d'); x.drawImage(base, 0, 0);
      grade(x, cv.width, L, G);
      cache[t] = cv;
    }
    const img = G.boardTex.image, gx = img.getContext('2d'); gx.setTransform(1, 0, 0, 1, 0, 0); gx.clearRect(0, 0, img.width, img.height); gx.drawImage(cv, 0, 0); G.boardTex.needsUpdate = true;
    // surround: the venue's name, missed-dart holes at the pub, a coloured event ring on the stages
    let st = scache[t];
    if (!st) { st = G.surroundTex(L.brand); dressSurround(st.image, L); st.needsUpdate = true; scache[t] = st; }
    G.surround.material.map = st; G.surround.material.needsUpdate = true;
  };
  function grade(x, W, L, G) {
    const R = G.R, ORDER = G.ORDER, S = W / 1024, mm = 512 / 225;
    x.save(); x.setTransform(S, 0, 0, S, W / 2, W / 2);
    const face = () => { x.beginPath(); x.arc(0, 0, R.dOut * mm + 1, 0, 7); };
    if (L.fade) {           // washed-out colours and a nicotine tint, strongest toward the middle where the light hits
      x.save(); face(); x.clip();
      x.globalCompositeOperation = 'saturation'; x.fillStyle = `rgba(128,128,128,${L.fade})`; x.fillRect(-512, -512, 1024, 1024);
      x.globalCompositeOperation = 'multiply'; x.fillStyle = `rgba(214,188,140,${L.fade * .9})`; x.fillRect(-512, -512, 1024, 1024);
      x.globalCompositeOperation = 'lighten'; x.fillStyle = `rgba(52,44,36,${Math.min(1, L.fade * 2.6)})`; x.fillRect(-512, -512, 1024, 1024);   // no true black left on an old board
      x.globalCompositeOperation = 'source-over'; x.fillStyle = `rgba(150,140,120,${L.fade * .16})`; x.fillRect(-512, -512, 1024, 1024);
      x.restore();
    }
    if (L.dirt) {           // grime toward the rim, a beer splash, chalk dust and frayed sisal round the trebles
      x.save(); face(); x.clip();
      const g = x.createRadialGradient(0, 0, 90 * mm, 0, 0, R.dOut * mm); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(40,26,12,${.35 * L.dirt})`); x.fillStyle = g; x.fillRect(-512, -512, 1024, 1024);
      for (let k = 0; k < 3 * L.dirt; k++) { const a = Math.random() * 6.28, r = (40 + Math.random() * 120) * mm; x.fillStyle = `rgba(92,60,22,${.1 + Math.random() * .08})`; x.beginPath(); x.ellipse(Math.cos(a) * r, Math.sin(a) * r, 14 + Math.random() * 22, 9 + Math.random() * 14, Math.random() * 3, 0, 7); x.fill(); }
      x.fillStyle = `rgba(240,240,232,${.05 * L.dirt})`; for (let k = 0; k < 900 * L.dirt; k++) { const a = Math.random() * 6.28, r = Math.random() * R.dOut * mm; x.fillRect(Math.cos(a) * r, Math.sin(a) * r, 1.2, 1.2); }
      const segA = n => ((ORDER.indexOf(n) * 18 - 90) * Math.PI / 180);
      [20, 19, 1, 5, 16, 3].forEach((n, j) => { for (let k = 0; k < 140 * L.dirt / (j + 1); k++) { const a = segA(n) + (Math.random() - .5) * .3, r = (R.tIn + Math.random() * (R.tOut - R.tIn)) * mm; x.fillStyle = `rgba(${Math.random() < .5 ? '255,248,230' : '30,20,10'},${.12 + Math.random() * .18})`; x.fillRect(Math.cos(a) * r, Math.sin(a) * r, .8 + Math.random() * 1.6, .6); } });
      // Wear over the whole face, weighted by how often each spot is hit. A real pub board is tired everywhere
      // (fuzzy sisal, greyed blacks, tan whites, pinholes all over), just heaviest round 20, 1, 5, 19 and the bull.
      const top = a => Math.exp(-Math.pow(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2)) / .55, 2)),
        bot = a => Math.exp(-Math.pow(Math.atan2(Math.sin(a - Math.PI / 2 - .3), Math.cos(a - Math.PI / 2 - .3)) / .45, 2));
      const heat = (a, r) => { const ring = (r > R.tIn - 4 && r < R.tOut + 4) || (r > R.dIn - 3 && r < R.dOut + 2) ? .5 : 0, bull = r < R.obull + 6 ? .9 : 0;
        return .3 + 1.1 * top(a) * (r > 40 ? 1 : .4) + .55 * bot(a) * (r > 40 ? 1 : .4) + ring * (.4 + top(a)) + bull; };
      const pick = () => { for (;;) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * (R.dOut + 2), h = heat(a, r); if (Math.random() * 3.2 < h) return [a, r * mm, h]; } };
      // 1) blotchy unevenness: soft light and dark mottles everywhere
      for (let i = 0; i < 70 * L.dirt; i++) { const [a, r, h] = pick(); const lite = Math.random() < .5; x.fillStyle = lite ? `rgba(235,222,196,${.035 + .03 * h})` : `rgba(38,26,14,${.04 + .035 * h})`; x.beginPath(); x.ellipse(Math.cos(a) * r, Math.sin(a) * r, 10 + Math.random() * 26, 6 + Math.random() * 16, Math.random() * 3, 0, 7); x.fill(); }
      // 2) frayed sisal: short fibre strokes across the face, pale ones show up on the blacks, dark ones on the creams
      x.lineCap = 'round';
      for (let i = 0; i < 9000 * L.dirt; i++) { const [a, r, h] = pick(), px = Math.cos(a) * r, py = Math.sin(a) * r, d = Math.random() * 6.28, l = 1.2 + Math.random() * 2.6 * (.6 + h * .5);
        x.strokeStyle = Math.random() < .55 ? `rgba(226,210,178,${.07 + .07 * h})` : `rgba(26,18,10,${.06 + .06 * h})`; x.lineWidth = .5 + Math.random() * .5;
        x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(d) * l, py + Math.sin(d) * l); x.stroke(); }
      // 3) pinholes all over, denser where it gets hit, never a solid patch
      for (let i = 0; i < 5200 * L.dirt; i++) { const [a, r, h] = pick(); x.fillStyle = `rgba(12,8,4,${.18 + Math.random() * .22})`; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, .28 * mm + Math.random() * .22 * mm, 0, 7); x.fill(); }
      // 3b) extra holes only where it really gets hammered
      for (let i = 0; i < 6000 * L.dirt; i++) { const [a, r, h] = pick(); if (h < 1.3) continue; x.fillStyle = `rgba(12,8,4,${.2 + Math.random() * .25})`; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, .26 * mm + Math.random() * .2 * mm, 0, 7); x.fill(); }
      // 4) the most-hit beds go fuzzy and pale (sisal pushed out), not black
      for (let i = 0; i < 5000 * L.dirt; i++) { const [a, r, h] = pick(); if (h < 1.1) continue; x.fillStyle = `rgba(232,218,190,${.03 + .035 * h})`; x.beginPath(); x.arc(Math.cos(a) * r, Math.sin(a) * r, .7 + Math.random() * 1.5, 0, 7); x.fill(); }
      x.restore();
    }
    if (L.fresh) {          // tournament board: punchy colours, bright white numbers
      x.save(); face(); x.clip(); x.globalCompositeOperation = 'saturation'; x.fillStyle = `rgba(255,0,0,${.12 * L.fresh})`; x.fillRect(-512, -512, 1024, 1024);
      x.globalCompositeOperation = 'soft-light'; x.fillStyle = `rgba(255,255,255,${.12 * L.fresh})`; x.fillRect(-512, -512, 1024, 1024); x.restore();
      x.font = `700 ${19.5 * mm}px "Saira Condensed","Arial Narrow",Arial,sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      ORDER.forEach((n, i) => { const a = (i * 18 - 90) * Math.PI / 180; x.save(); x.translate(Math.cos(a) * 200 * mm, Math.sin(a) * 200 * mm);
        x.fillStyle = `rgba(0,0,0,${.6 * L.fresh})`; x.fillText(n, 1.4, 1.8); x.fillStyle = `rgba(250,250,247,${L.fresh})`; x.fillText(n, 0, 0); x.restore(); });
    } else if (L.fade) {    // pub numbers: dull and a bit tarnished
      x.save(); x.beginPath(); x.arc(0, 0, 225 * mm, 0, 7); x.arc(0, 0, R.dOut * mm + 2, 0, 7, true); x.clip(); x.globalCompositeOperation = 'multiply'; x.fillStyle = `rgba(190,170,130,${L.fade})`; x.fillRect(-512, -512, 1024, 1024); x.restore();
    }
    x.restore();
  }
  function dressSurround(c, L) {
    const x = c.getContext('2d'), W = c.width; x.save(); x.setTransform(W / 1024, 0, 0, W / 1024, W / 2, W / 2);
    for (let k = 0; k < L.holes; k++) {   // missed darts. Most land near 20, 1, 5 at the top
      const a = -Math.PI / 2 + (Math.random() - .5) * (Math.random() < .7 ? 1.3 : 6.28), r = 330 + Math.random() * 170;
      const hx = Math.cos(a) * r, hy = Math.sin(a) * r; x.fillStyle = 'rgba(0,0,0,.75)'; x.beginPath(); x.arc(hx, hy, 1.6 + Math.random() * 1.6, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,235,220,.07)'; x.beginPath(); x.arc(hx + .8, hy + .8, 2.6, 0, 7); x.fill();
    }
    if (L.fresh) {       // event ring + sponsor marks on the stage surrounds
      x.strokeStyle = L.ring; x.lineWidth = 10; x.globalAlpha = .9; x.beginPath(); x.arc(0, 0, 330, 0, 7); x.stroke(); x.globalAlpha = 1;
      if (L.sponsor) { x.font = '800 52px "Saira Condensed","Arial Narrow",Arial,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(240,240,236,.75)';
        [[-Math.PI / 2 + 1.15, L.sponsor], [-Math.PI / 2 - 1.15, L.sponsor]].forEach(([a, s]) => { x.save(); x.rotate(a + Math.PI / 2); x.translate(0, -420); x.fillText(s, 0, 0); x.restore(); }); }
    }
    if (L.dirt) { const g = x.createRadialGradient(0, 0, 330, 0, 0, 512); g.addColorStop(0, 'rgba(60,40,20,0)'); g.addColorStop(1, `rgba(60,40,20,${.25 * L.dirt})`); x.fillStyle = g; x.fillRect(-512, -512, 1024, 1024); }
    x.restore();
  }
})();
