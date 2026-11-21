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
  window.TOPS_PRESTIGE = { ED, paint, PARTS };
})();
