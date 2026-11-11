// Art bake tool: the colour grades for the baked pub and club textures. Run once offline by bake.js; the game
// ships the graded textures (club2.glb, pub2.glb) and never runs this. Same code that ChatGPT reviewed at runtime.
(function () {
  'use strict';
  // ===== Art: colour grade for the club's baked textures (tier 1). The baked club was near-white plaster, a blue
  // carpet and a bright fluoro ceiling, which read clinical. Each grade runs once when club.glb loads (the baked
  // venue is kept, never rebuilt), keeps the baked shading by working on luminance, and leaves timber, honours
  // boards and frames alone (they're saturated or dark, so the masks skip them). Display only.
  function lum(r, g, b) { return .2126 * r + .7152 * g + .0722 * b; }
  function sat(r, g, b) { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0; }
  // walls: plaster (bright, unsaturated) becomes a deep bottle green; the top of each wall (texture x near 0 is
  // wall-up, see the poster notes above) falls off darker and warmer, like a hall lit from low lamps, not tubes
  function wallGrade(g, W, H, xMax) {
    const im = g.getImageData(0, 0, W, H), d = im.data, TG = [34, 58, 48], XM = Math.round((xMax || 1) * W);
    for (let y = 0; y < H; y++) for (let x = 0; x < XM; x++) {
      const i = (y * W + x) * 4, r = d[i], gg = d[i + 1], b = d[i + 2], L = lum(r, gg, b), S = sat(r, gg, b);
      const up = 1 - x / W;                       // 1 at the ceiling line, 0 at the floor
      const fall = .62 + .38 * Math.pow(1 - up, .7); // darker toward the ceiling
      if (L > 120 && S < .16) {                   // plaster
        const m = Math.min(1, (L - 120) / 40) * (1 - Math.max(0, (S - .1) / .06));
        const sh = L / 235 * fall;                // keep the baked shading
        d[i] = r + (TG[0] * sh * 1.25 - r) * m; d[i + 1] = gg + (TG[1] * sh * 1.25 - gg) * m; d[i + 2] = b + (TG[2] * sh * 1.25 - b) * m;
      } else {                                    // timber and everything else: warmer, slightly lower
        d[i] = r * .84 * fall; d[i + 1] = gg * .7 * fall; d[i + 2] = b * .6 * fall;   // timber to a deeper walnut
      }
    }
    g.putImageData(im, 0, 0);
  }
  // carpet: the blue becomes oxblood, then a faint gold club-carpet diamond so it isn't a flat colour field
  function floorGrade(g, W, H) {
    const im = g.getImageData(0, 0, W, H), d = im.data, TC = [96, 40, 38];   // muted oxblood, not fire-engine red
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const wear = new Float32Array(64 * 64); for (let j = 0; j < wear.length; j++) wear[j] = .9 + rnd() * .2;   // low-frequency wear
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], gg = d[i + 1], b = d[i + 2];
      if (b > r + 12 && b > gg) { const p = i >> 2, x = p % W, y = (p / W) | 0, w = wear[((y * 64 / H) | 0) * 64 + ((x * 64 / W) | 0)]; const L = lum(r, gg, b) / 165 * w; d[i] = TC[0] * L; d[i + 1] = TC[1] * L; d[i + 2] = TC[2] * L; }
      else { d[i] = r * .9; d[i + 1] = gg * .82; d[i + 2] = b * .74; }
    }
    g.putImageData(im, 0, 0);
    const s = Math.round(W / 40), pc = document.createElement('canvas'); pc.width = pc.height = s; const q = pc.getContext('2d');
    q.strokeStyle = 'rgba(196,150,84,.11)'; q.lineWidth = Math.max(1, s / 22);
    q.beginPath(); q.moveTo(s / 2, s * .18); q.lineTo(s * .82, s / 2); q.lineTo(s / 2, s * .82); q.lineTo(s * .18, s / 2); q.closePath(); q.stroke();
    q.fillStyle = 'rgba(196,150,84,.10)'; q.beginPath(); q.arc(s / 2, s / 2, s * .05, 0, 7); q.fill();
    g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = g.createPattern(pc, 'repeat'); g.fillRect(0, 0, W, H); g.restore();
  }
  // ceiling: knock the white tiles and fluoro grid down and warm them, so the room's light comes from below
  function ceilGrade(g, W, H) {
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#6f6150'; g.fillRect(0, 0, W, H); g.restore();
  }
  // honours boards (wallR atlas, 2048 px rect): the faint lettering becomes gold leaf
  function honoursGold(g, W, H) {
    const k = W / 2048, x0 = Math.round(1225 * k), y0 = Math.round(185 * k), w = Math.round(545 * k), h = Math.round(370 * k);
    const im = g.getImageData(x0, y0, w, h), d = im.data, hit = new Uint8Array(w * h);
    for (let p = 0, i = 0; p < w * h; p++, i += 4) { const r = d[i], gg = d[i + 1], L = lum(r, gg, d[i + 2]); if (L > 62 && r > 0 && gg / r > .62) hit[p] = 1; }   // gilt: greener than the wood (wood g/r is about .5)
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const p = y * w + x; if (hit[p] === 1 || hit[p - 1] === 1 || hit[p + 1] === 1 || hit[p - w] === 1 || hit[p + w] === 1) { const i = p * 4, c = hit[p] === 1 ? 1 : .6; d[i] += (242 - d[i]) * c; d[i + 1] += (190 - d[i + 1]) * c; d[i + 2] += (92 - d[i + 2]) * c; } }   // gold leaf, thickened by a pixel so it survives a phone-sized downscale
    g.putImageData(im, x0, y0);
  }
  // chairs and stools: blue upholstery becomes oxblood vinyl, a shade lighter than the carpet so they read
  function furnGrade(g, W, H) {
    const im = g.getImageData(0, 0, W, H), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const r = d[i], gg = d[i + 1], b = d[i + 2];
      if (b > r + 18 && b > gg + 6) { const L = lum(r, gg, b) / 150; d[i] = Math.min(255, 128 * L); d[i + 1] = Math.min(255, 46 * L); d[i + 2] = Math.min(255, 42 * L); } }
    g.putImageData(im, 0, 0);
  }
  // light hierarchy in world space (the baked club is unlit, so this is its lighting): the board lane and the oche
  // are warmest and brightest, the player's side of the room next, the corners and far wall fall away. One shared
  // shader for every club mesh; display only.
  // pub: age everything a little (less saturation, smoky amber, deeper shadows) so the brick and timber read as a
  // real boozer, not a freshly shot feature wall
  function pubAge(g, W, H) {
    const im = g.getImageData(0, 0, W, H), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const r = d[i], gg = d[i + 1], b = d[i + 2], L = lum(r, gg, b), k = Math.pow(L / 255, .18) * .92;   // deepen darks (grout, corners) more than lights
      d[i] = (L + (r - L) * .78) * k * 1.04; d[i + 1] = (L + (gg - L) * .78) * k * .96; d[i + 2] = (L + (b - L) * .78) * k * .84; }
    g.putImageData(im, 0, 0);
  }
  // pub carpet: darker, quieter pattern (blend toward a blurred copy), worn red-brown, patchy wear and stains
  function pubFloor(g, W, H) {
    const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const q = c2.getContext('2d');
    q.filter = 'blur(' + Math.round(W / 300) + 'px)'; q.drawImage(g.canvas, 0, 0); g.save(); g.globalAlpha = .5; g.drawImage(c2, 0, 0); g.restore();
    pubAge(g, W, H);
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#b08a78'; g.fillRect(0, 0, W, H);
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let n = 0; n < 70; n++) { const x = rnd() * W, y = rnd() * H, r = (.01 + rnd() * .035) * W, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(60,40,30,' + (.25 + rnd() * .25) + ')'); gr.addColorStop(1, 'rgba(60,40,30,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * (.5 + rnd() * .6), rnd() * 3, 0, 7); g.fill(); }
    g.restore();
  }
  const GRADE = { 0: { bake_wallF: pubAge, bake_wallB: pubAge, bake_wallL: pubAge, bake_wallR: pubAge, bake_props: pubAge, bake_bar: pubAge, bake_furn: pubAge, bake_floor: pubFloor }, 1: { bake_wallF: wallGrade, bake_wallB: wallGrade, bake_wallL: wallGrade, bake_wallR: (g, W, H) => { wallGrade(g, W, H, .86); honoursGold(g, W, H); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#978870'; g.fillRect(W * .86, 0, W * .14, H); g.restore(); },   // props atlas: papers to aged cream so the noticeboard stops glowing   // right of .86 is the props atlas (noticeboard papers, posters): leave it
       bake_floor: floorGrade, bake_ceil: ceilGrade, bake_furn: furnGrade } };
  window.TOPS_VENUE_GRADE = GRADE;
})();
