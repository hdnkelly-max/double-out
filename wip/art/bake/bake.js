// Art bake tool: grade the baked venue textures once, offline, and write new GLBs the game loads as-is.
// Usage: node wip/art/bake/bake.js            (writes assets/club2.glb, assets/m/club2.glb, assets/pub2.glb, assets/m/pub2.glb)
// The grades are in grade.js (the code ChatGPT reviewed at runtime); they run in headless Chromium on a 2D canvas,
// exactly as they did in the game, and each graded texture is saved as WebP at a quality picked to stay close to the
// original file size. Geometry, materials and every other buffer view are copied byte for byte.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../../..');
const JOBS = [
  { src: 'assets/club.glb', dst: 'assets/club2.glb', tier: 1 }, { src: 'assets/m/club.glb', dst: 'assets/m/club2.glb', tier: 1 },
  { src: 'assets/pub.glb', dst: 'assets/pub2.glb', tier: 0 }, { src: 'assets/m/pub.glb', dst: 'assets/m/pub2.glb', tier: 0 }
];
function readGlb(file) {
  const b = fs.readFileSync(file), jl = b.readUInt32LE(12), json = JSON.parse(b.slice(20, 20 + jl).toString('utf8'));
  const bo = 20 + jl, bl = b.readUInt32LE(bo), bin = b.slice(bo + 8, bo + 8 + bl);
  return { json, bin };
}
function writeGlb(file, json, bin) {
  let js = Buffer.from(JSON.stringify(json), 'utf8'); const jp = (4 - js.length % 4) % 4; js = Buffer.concat([js, Buffer.alloc(jp, 0x20)]);
  const bp = (4 - bin.length % 4) % 4; bin = Buffer.concat([bin, Buffer.alloc(bp, 0)]);
  const h = Buffer.alloc(12); h.writeUInt32LE(0x46546C67, 0); h.writeUInt32LE(2, 4); h.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
  const jh = Buffer.alloc(8); jh.writeUInt32LE(js.length, 0); jh.writeUInt32LE(0x4E4F534A, 4);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004E4942, 4);
  fs.writeFileSync(file, Buffer.concat([h, jh, js, bh, bin]));
}
(async () => {
  const br = await chromium.launch(); const page = await br.newPage();
  await page.setContent('<html><body></body></html>');
  await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'grade.js'), 'utf8') });
  for (const job of JOBS) {
    const { json, bin } = readGlb(path.join(ROOT, job.src));
    // which images get graded: the grade table is keyed by mesh name, and each baked mesh, material and image share a name
    const grades = await page.evaluate(t => Object.keys(window.TOPS_VENUE_GRADE[t] || {}), job.tier);
    const out = new Map(); let before = 0, after = 0;
    for (const im of json.images) {
      if (!grades.includes(im.name)) continue;
      const v = json.bufferViews[im.bufferView], bytes = bin.slice(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength);
      const res = await page.evaluate(async ({ b64, name, tier, target }) => {
        const im = new Image(); im.src = 'data:image/webp;base64,' + b64; await im.decode();
        const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const g = cv.getContext('2d', { willReadFrequently: true });
        g.drawImage(im, 0, 0); window.TOPS_VENUE_GRADE[tier][name](g, cv.width, cv.height);
        let best = null; for (const q of [.92, .88, .84, .8, .76]) { const d = cv.toDataURL('image/webp', q).split(',')[1]; best = d; if (d.length * .75 <= target * 1.15) break; }
        return { b64: best, w: cv.width, h: cv.height };
      }, { b64: bytes.toString('base64'), name: im.name, tier: job.tier, target: v.byteLength });
      const nb = Buffer.from(res.b64, 'base64'); out.set(im.bufferView, nb); before += v.byteLength; after += nb.length;
      console.log(`  ${job.src} ${im.name} ${res.w}x${res.h} ${v.byteLength} -> ${nb.length}`);
    }
    // rebuild buffer 0 in original byte order. Two kinds of region live there: plain buffer views (images and the
    // like) and EXT_meshopt_compression payloads (the view itself points at the empty fallback buffer, its extension
    // points into buffer 0). Graded images get their new bytes; every other region is copied as is, 4-byte aligned.
    const regs = [];
    json.bufferViews.forEach((v, i) => {
      const m = v.extensions && v.extensions.EXT_meshopt_compression;
      if (m && (m.buffer || 0) === 0) regs.push({ o: m.byteOffset || 0, n: m.byteLength, set: (no, nl) => { m.byteOffset = no; m.byteLength = nl; } });
      else if ((v.buffer || 0) === 0 && !m) regs.push({ o: v.byteOffset || 0, n: v.byteLength, i, set: (no, nl) => { v.byteOffset = no; v.byteLength = nl; } });
    });
    regs.sort((a, b) => a.o - b.o);
    const parts = []; let off = 0;
    for (const r of regs) {
      const data = (r.i != null && out.get(r.i)) || bin.slice(r.o, r.o + r.n);
      const pad = (4 - off % 4) % 4; if (pad) { parts.push(Buffer.alloc(pad)); off += pad; }
      r.set(off, data.length); parts.push(data); off += data.length;
    }
    const nbin = Buffer.concat(parts); json.buffers[0].byteLength = nbin.length;
    (json.asset.extras = json.asset.extras || {}).topsGrade = 'wip/art/bake/grade.js tier ' + job.tier;
    writeGlb(path.join(ROOT, job.dst), json, nbin);
    console.log(`${job.dst}: textures ${before} -> ${after} bytes, file ${fs.statSync(path.join(ROOT, job.src)).size} -> ${fs.statSync(path.join(ROOT, job.dst)).size}`);
  }
  await br.close();
})();
