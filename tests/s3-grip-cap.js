// doc 77 (Hayden, live 4.26): the dart grip and the cap. node tests/s3-grip-cap.js <dir> [v3: 0|1]
// GRIP: for the player (Hayden's own look: Ray, heavy, glasses, wristband, cap, charcoal), every base and two opponents (Big Mal, Shazza), posed by
// the game's own code (V._qa.poseFigure -> poseDarts) in aim, pull and throw (before the release): the index and middle fingers must close round
// the barrel (bend from the first to the last segment, index >= 60 deg, middle >= 75 deg; today's open pinch is ~30 / ~40), ring and pinky
// tucked, the shaft pointing along the aim (toward the board), and the
// player's grip the same as the opponents' (index and middle bend within 6 deg of the opponents').
// CAP (v2 figures only; the v3 cap is its own build): every base x every build with the cap on must have a peak at the front (the cap reaches
// >= 12% of the head depth past the face, measured on everything worn on the head above its middle) and the peak must sit at the rim, not on top
// of the crown.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const dir = path.resolve(process.argv[2] || path.resolve(__dirname, '..')), V3 = process.argv[3] === '1';
const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(dir, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': /\.html$/.test(u) ? 'text/html' : /\.js$/.test(u) ? 'text/javascript' : /\.css$/.test(u) ? 'text/css' : 'application/octet-stream' }); r.end(d); }); }).listen(0);
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.addInitScript(v3 => { try { localStorage.setItem('tops_s3', '1'); localStorage.setItem('tops_s3_welcome', '1'); if (v3) localStorage.setItem('tops_v3', '1'); else localStorage.removeItem('tops_v3'); } catch (e) {} }, V3);
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1${V3 ? '&v3=1' : ''}`); await p.waitForFunction(() => typeof V !== 'undefined' && V._qa && V._qa.rigReady && V._qa.rigReady() && V._qa.poseFigure, null, { timeout: 240000 });
  const r = await p.evaluate(() => { const Q = V._qa, T = Q.T || THREE, SC = typeof Q.scene === 'function' ? Q.scene() : Q.scene, OZ = 2.37, tgt = new T.Vector3(0, 1.73, 0), W = o => o.getWorldPosition(new T.Vector3()), deg = x => +(x * 180 / Math.PI).toFixed(1);
    save.name = 'Hayden'; save.vlook = { v: 1, base: 'ray', body: 'heavy', shirt: '#2a2b33', acc: ['glasses', 'band', 'cap'], accSet: true };
    const figs = [['player', save.look || {}, 'Hayden', 1], ...['kai', 'ray', 'tama', 'mia', 'dazza'].map(id => [id, { s3: { base: id } }, 'You ' + id, 0]), ['Big Mal', lookFor('Big Mal'), 'Big Mal', 2], ['Shazza', lookFor('Shazza'), 'Shazza', 2]];
    const phases = [['aim', { phase: 'aim' }], ['pull', { phase: 'pull', pull: .6, k: .6 }], ['throw', { phase: 'throw', k: .5 }]];
    const bend = (B, f) => { const P = [1, 2, 3, 4].map(j => B['RightHand' + f + j]).filter(Boolean).map(W); if (P.length < 3) return null; const a = P[1].clone().sub(P[0]), z = P[P.length - 1].clone().sub(P[P.length - 2]); return deg(a.angleTo(z)); };
    const grip = []; for (const [id, look, name, kind] of figs) { const f = Q.makeFigure(look, name, 0); SC.add(f); f.position.set(0, 0, OZ + .08); f.rotation.set(0, 0, 0); f.updateMatrixWorld(true);
      for (const [ph, oa] of phases) { Q.poseFigure(f, oa, tgt); f.updateMatrixWorld(true); const B = f.userData.B, dt = f.userData.dt; const o = { id, kind, ph, v3: !!(f.userData.s3rig && f.userData.s3rig.v3) };
        ['Index', 'Middle', 'Ring', 'Pinky'].forEach(k => o[k] = bend(B, k));
        if (dt && B.RightHandIndex2 && B.RightHandIndex3) { const bw = W(dt), hook = W(B.RightHandIndex2).lerp(W(B.RightHandIndex3), .5); o.hookMm = +(bw.distanceTo(hook) * 1000 / (f.scale.y || 1)).toFixed(1);
          const ax = new T.Vector3(0, 0, 1).applyQuaternion(dt.getWorldQuaternion(new T.Quaternion())); const toB = tgt.clone().sub(bw).normalize(); o.aimDot = +Math.abs(ax.dot(toB)).toFixed(2); }
        grip.push(o); }
      SC.remove(f); Q.dispose(f); }
    /* the cap: v2 figures (v3 has its own cap build) */
    const cap = []; if (window.TOPS_V3FLAG !== true) for (const base of ['kai', 'ray', 'tama', 'mia', 'dazza']) for (const body of ['standard', 'skinny', 'heavy', 'muscle']) {
      const f = Q.makeFigure({ s3: { base, body, acc: ['cap'], accSet: true } }, 'Cap ' + base, 0); f.updateMatrixWorld(true); const hd = f.userData.B && f.userData.B.Head; let sk = null; const att = [];
      if (hd) hd.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return; if (o.userData.tag === 'skull') { if (!sk) sk = o; return; } if (o.userData.tag === 'face') return; att.push(o); });
      const o = { base, body }; if (!sk) { o.err = 'no skull'; cap.push(o); Q.dispose(f); continue; } const inv = new T.Matrix4().copy(sk.parent.matrixWorld).invert(), v = new T.Vector3();
      const S = new T.Box3(); { const P = sk.geometry.attributes.position; for (let i = 0; i < P.count; i++) S.expandByPoint(v.fromBufferAttribute(P, i).applyMatrix4(sk.matrixWorld).applyMatrix4(inv)); }
      const cy = (S.min.y + S.max.y) / 2, hy = (S.max.y - S.min.y) / 2, depth = S.max.z - S.min.z; let fz = -1e9, fy = 0;
      /* the head's attachments (cap, hair, beard; not the skull or the face sheet) above the head's middle: the front-most point is the cap's peak */
      att.forEach(m => { const P = m.geometry.attributes.position; for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(m.matrixWorld).applyMatrix4(inv); if (v.y < cy) continue; if (v.z > fz) { fz = v.z; fy = v.y; } } });
      o.frontOut = +((fz - S.max.z) / depth).toFixed(3); o.peakY = +((fy - cy) / hy).toFixed(3); cap.push(o); Q.dispose(f); }
    return { grip, cap, g77: window.TOPS_GRIP77, c77: window.TOPS_CAP77 }; });
  await b.close(); srv.close();
  const fails = []; const opp = r.grip.filter(g => g.kind === 2);
  for (const g of r.grip) { const t = `${g.id}/${g.ph}`; if (g.Index == null) { fails.push(t + ': no finger bones'); continue; }
    if (g.Index < 60) fails.push(`${t}: index bend ${g.Index} deg (< 60: an open pinch)`); if (g.Middle < 75) fails.push(`${t}: middle bend ${g.Middle} deg (< 75)`);
    if (g.Ring < 75 || g.Pinky < 75) fails.push(`${t}: ring/pinky ${g.Ring}/${g.Pinky} deg (< 75: not tucked)`);
    if (g.aimDot != null && g.aimDot < .7) fails.push(`${t}: shaft not along the aim (|cos| ${g.aimDot})`); }
  for (const g of r.grip.filter(g => g.kind === 1)) { const o = opp.filter(x => x.ph === g.ph); const mi = o.reduce((s, x) => s + x.Index, 0) / o.length, mm = o.reduce((s, x) => s + x.Middle, 0) / o.length;
    if (Math.abs(g.Index - mi) > 6 || Math.abs(g.Middle - mm) > 6) fails.push(`player/${g.ph}: grip differs from the opponents (index ${g.Index} vs ${mi.toFixed(1)}, middle ${g.Middle} vs ${mm.toFixed(1)})`); }
  for (const c of r.cap) { const t = `cap ${c.base}/${c.body}`; if (c.err) { fails.push(t + ': ' + c.err); continue; } if (c.frontOut < .12) fails.push(`${t}: no front peak (the cap reaches ${(c.frontOut * 100).toFixed(0)}% of the head depth past the face, < 12%)`); else if (c.peakY > .75) fails.push(`${t}: the peak sits on top of the crown (${c.peakY} of the half-height above the middle), not at the rim`); }
  const sm = r.grip.filter(g => g.ph === 'aim').map(g => `${g.id} ${g.Index}/${g.Middle}/${g.Ring}/${g.Pinky}${g.hookMm != null ? ' ' + g.hookMm + 'mm' : ''}`).join('; ');
  console.log(JSON.stringify({ v3: V3, aim: sm, cap: r.cap.map(c => `${c.base}/${c.body} ${c.err || c.frontOut + '/' + c.peakY}`).join('; '), pe: pe.slice(0, 2) }));
  console.log(fails.length ? `S3-GRIP-CAP FAIL (${fails.length}) ` + JSON.stringify(fails.slice(0, 12)) : `S3-GRIP-CAP PASS (${V3 ? 'v3' : 'v2'}: ${r.grip.length} poses closed round the barrel, player = opponents; ${r.cap.length} capped looks (5 bases x 4 builds) with a front peak at the rim)`); process.exit(fails.length ? 1 : 0); })();
