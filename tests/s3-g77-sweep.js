// ChatGPT P1 on rel-grip77b 0f01a74: the v3 raised seat (G77V3) must keep the dart clear of hair along the WHOLE raise, not only at its end
// (every share of the raise is on screen while the seat eases in and out). Checked independently of the game's limiter: the dart is moved
// along its own raise path (its pose at the 4.30 seat -> the seat the game chose, 17 steps, orientation fixed) and at every step
//   - the dart-hair measure (TOPS_S3DARTHAIR, signed, within its 6 cm radius) stays >= min(its value at the 4.30 seat, 8 mm), and
//   - rays along the dart (its axis and 4 lines at the barrel's radius, tip to flight end) hit no hair or cap triangle (double-sided).
// A. Fixture: a small hair lock placed half way along the full raise, clear of the dart at both ends. The game must stop the raise short of it.
//    (0f01a74 checked only the end of the raise and carried the dart through it: FAIL.)
// B. Builds: Kai / Ray / Tama / Mia / Dazza heavy and muscle + save3 (David: Tama, heavy, quiff, band, glasses) + Kai standard, at the match,
//    match-portrait, opponent and test-rig places; aim, pull 0-1.3 (.1) and throw 0-.3 (.05). Reports how much raise is kept.
// usage: node tests/s3-g77-sweep.js <dir (forced v3)>
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
(async () => { const dir = path.resolve(process.argv[2]); const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split('?')[0]); if (u === '/') u = '/index.html'; fs.readFile(path.join(dir, u), (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': /\.html$/.test(u) ? 'text/html' : /\.js$/.test(u) ? 'text/javascript' : 'application/octet-stream' }); r.end(d); }); }).listen(0);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort()); await p.addInitScript(() => { window.TOPS_S3FLAG = true; try { localStorage.setItem('tops_s3', '1'); } catch (e) {} });
  await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1&v3=1`); await p.waitForFunction(() => typeof V !== 'undefined' && V._qa && V._qa.rigReady && V._qa.rigReady(), null, { timeout: 240000 });
  await p.evaluate(() => { V.loadAnims(); }); await p.waitForFunction(() => V._qa.animNames().length > 0, null, { timeout: 180000 });
  const LOOKS = JSON.parse(fs.readFileSync(path.join(__dirname, 'looks70.json'), 'utf8')).filter(l => /_body_(heavy|muscle)$/.test(l.id) || l.id === 'save3' || l.id === 'kai_body_standard');
  const res = await p.evaluate(LOOKS => { const Q = V._qa, T = Q.T, OCHE_Z = 2.37, boardC = new T.Vector3(0, 1.73, 0.045);
    const places = [['match', f => { f.position.set(0.1, 0, OCHE_Z - 0.51); f.rotation.set(0, 0.8, 0); }, () => boardC], ['match-portrait', f => { f.position.set(0.1, 0, OCHE_Z - 0.66); f.rotation.set(0, 0.8, 0); }, () => boardC],
      ['opponent', f => { f.position.set(-0.06, 0, OCHE_Z + 0.08); f.rotation.set(0, 1.0, 0); }, () => boardC], ['test-rig', f => { f.position.set(0, 0, 0); f.rotation.set(0, 0, 0); }, f => f.localToWorld(new T.Vector3(0, 1.73, -2.4))]];
    const phases = [{ phase: 'idle' }]; for (let i = 0; i <= 13; i++) phases.push({ phase: 'pull', pull: +(i / 10).toFixed(1) }); for (let i = 0; i <= 6; i++) phases.push({ phase: 'throw', pull: 1, k: +(i * .05).toFixed(2) });
    const hairMeshes = f => { const M = []; f.traverse(o => { if (o.isMesh && (o.userData.hair || o.userData.cap)) M.push(o); }); return M; };
    const rc = new T.Raycaster();
    /* the independent check of one share: TOPS_S3DARTHAIR + rays along the dart */
    const check = (f, dt, M) => { f.updateMatrixWorld(true); const h = TOPS_S3DARTHAIR(f); const L = []; dt.traverse(o => { if (o.isMesh) { o.geometry.computeBoundingBox(); L.push(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
      const ax = new T.Vector3(0, 0, 1).transformDirection(dt.matrixWorld), sx = new T.Vector3(1, 0, 0).transformDirection(dt.matrixWorld), sy = new T.Vector3(0, 1, 0).transformDirection(dt.matrixWorld), o0 = dt.getWorldPosition(new T.Vector3());
      const box = new T.Box3(); L.forEach(bb => box.union(bb)); const half = box.getSize(new T.Vector3()).length() / 2 + .01, rr = .004 * new T.Vector3().setFromMatrixScale(dt.matrixWorld).x;/* the barrel's radius */
      let hits = 0; const sides = M.map(m => [m, m.material.side]); M.forEach(m => m.material.side = T.DoubleSide);
      for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const st = o0.clone().addScaledVector(sx, dx * rr).addScaledVector(sy, dy * rr).addScaledVector(ax, -half); rc.set(st, ax); rc.far = 2 * half; hits += rc.intersectObjects(M, false).length; }
      sides.forEach(([m, s]) => m.material.side = s); return { mm: h.mm, hits }; };
    const sweep = (f, tgtF, oa) => { const dt = f.userData.dt, M = hairMeshes(f); window.TOPS_G77V3 = {}; Q.poseFigure(f, oa, tgtF(f)); f.updateMatrixWorld(true); const p0 = dt.position.clone(), w0 = dt.getWorldPosition(new T.Vector3());
      window.TOPS_G77V3 = undefined; Q.poseFigure(f, oa, tgtF(f)); f.updateMatrixWorld(true); const p1 = dt.position.clone(), w1 = dt.getWorldPosition(new T.Vector3());
      window.TOPS_G77V3 = { u: .03 }; window.TOPS_G77HC = 0; Q.poseFigure(f, oa, tgtF(f)); f.updateMatrixWorld(true); const wf = dt.getWorldPosition(new T.Vector3()); window.TOPS_G77V3 = undefined; window.TOPS_G77HC = undefined;
      Q.poseFigure(f, oa, tgtF(f)); f.updateMatrixWorld(true);
      const full = wf.distanceTo(w0), kept = full > 1e-6 ? w1.distanceTo(w0) / full : 0; const out = { kept, worst: 99, hits: 0, base: 99 };
      for (let s = 0; s <= 16; s++) { dt.position.copy(p0).lerp(p1, s / 16); const c = check(f, dt, M); if (s === 0) out.base = c.mm; out.worst = Math.min(out.worst, c.mm); out.hits += c.hits; if (c.mm < Math.min(out.base, 8) - .5 && !out.bad) out.bad = 'share ' + (kept * s / 16).toFixed(2) + ': ' + c.mm.toFixed(1) + ' mm (4.30 seat ' + out.base.toFixed(1) + ')'; if (c.hits && !out.badR) out.badR = 'share ' + (kept * s / 16).toFixed(2) + ': rays hit hair'; }
      dt.position.copy(p1); return out; };
    const R = { fixture: null, looks: {} };
    /* A. the fixture */
    { const f = Q.makeFigure({ s3: { base: 'kai' } }, 'You', 0); Q.scene.add(f); places[0][1](f); f.updateMatrixWorld(true); const oa = { phase: 'idle' }, tg = places[0][2], dt = f.userData.dt;
      /* a 12 cm raise for the fixture: a lock half way is 6 cm from the dart at both ends, clear even of a check that only looks at the end */const FX = { u: .12 }; window.TOPS_G77V3 = {}; Q.poseFigure(f, oa, tg(f)); f.updateMatrixWorld(true); const w0 = dt.getWorldPosition(new T.Vector3()); window.TOPS_G77V3 = FX; window.TOPS_G77HC = 0; Q.poseFigure(f, oa, tg(f)); f.updateMatrixWorld(true); const wF = dt.getWorldPosition(new T.Vector3()); window.TOPS_G77HC = undefined;
      const H = f.userData.B.Head, hs = new T.Vector3().setFromMatrixScale(H.matrixWorld).x; /* the fixture's only hair is the lock: the figure's own hair is taken out of the hair set, so a long raise isn't stopped by it */f.traverse(o => { if (o.isMesh && (o.userData.hair || o.userData.cap)) { o.userData.hair = false; o.userData.cap = false; } }); delete f.userData._dhC; const lock = new T.Mesh(new T.BoxGeometry(.006, .006, .006), new T.MeshStandardMaterial({ color: 0x553311 })); lock.userData.hair = true; lock.name = 'g77-fixture-lock';
      const mid = w0.clone().lerp(wF, .45);/* a little nearer the start, so the end is the clearest point of the path */ H.add(lock); lock.position.copy(H.worldToLocal(mid.clone())); lock.scale.setScalar(1 / hs); delete f.userData._hc77; f.updateMatrixWorld(true);
      /* both ends clear of it */ const dt0 = dt.position.clone(); const endA = (() => { dt.position.copy(f.worldToLocal(w0.clone())); return check(f, dt, [lock]); })(), endB = (() => { dt.position.copy(f.worldToLocal(wF.clone())); return check(f, dt, [lock]); })(), midC = (() => { dt.position.copy(f.worldToLocal(mid.clone())); return check(f, dt, [lock]); })(); dt.position.copy(dt0);
      window.TOPS_G77V3 = FX; Q.poseFigure(f, oa, tg(f)); f.updateMatrixWorld(true); const w1 = dt.getWorldPosition(new T.Vector3()); window.TOPS_G77V3 = undefined; const kept = w1.distanceTo(w0) / wF.distanceTo(w0);
      let hit = 0, worst = 99; for (let s = 0; s <= 16; s++) { dt.position.copy(f.worldToLocal(w0.clone().lerp(w1, s / 16))); const c = check(f, dt, [lock]); hit += c.hits; worst = Math.min(worst, c.mm); }
      R.fixture = { ends: [+endA.mm.toFixed(1), endA.hits, +endB.mm.toFixed(1), endB.hits], middle: [+midC.mm.toFixed(1), midC.hits], kept: +kept.toFixed(3), pathHits: hit, pathWorst: +worst.toFixed(1) }; Q.scene.remove(f); }
    /* B. the builds */
    for (const L of LOOKS) { const { id, ...look } = L; const f = Q.makeFigure({ s3: look }, 'You', 0); Q.scene.add(f); const o = { n: 0, raised: 0, keptSum: 0, worst: 99, hits: 0, bad: [] };
      for (const [pl, place, tg] of places) { place(f); f.updateMatrixWorld(true); for (const oa of phases) { const r = sweep(f, tg, oa); o.n++; if (r.kept > .01) { o.raised++; o.keptSum += r.kept; } o.worst = Math.min(o.worst, r.worst); o.hits += r.hits; if (r.bad) o.bad.push(pl + '/' + oa.phase + (oa.pull != null ? oa.pull : '') + (oa.k != null ? '/' + oa.k : '') + ' ' + r.bad); if (r.badR) o.bad.push(pl + '/' + oa.phase + ' ' + r.badR); } }
      R.looks[id] = { n: o.n, raised: o.raised, meanKept: +(o.keptSum / Math.max(1, o.raised)).toFixed(2), worst: +o.worst.toFixed(1), rayHits: o.hits, bad: o.bad.slice(0, 3) }; Q.scene.remove(f); }
    return R; }, LOOKS);
  const fail = []; const F = res.fixture;
  if (!(F.ends[0] > 0 && F.ends[2] > 0 && !F.ends[1] && !F.ends[3])) fail.push('fixture: the lock is not clear of the dart at both ends ' + JSON.stringify(F.ends));
  if (!(F.middle[0] < 0 || F.middle[1] > 0)) fail.push('fixture: the lock does not cut the middle of the raise ' + JSON.stringify(F.middle));
  if (F.pathHits || F.pathWorst < 0) fail.push(`fixture: the dart passes through the hair lock on its way up (raise kept ${F.kept}, ray hits ${F.pathHits}, worst ${F.pathWorst} mm)`);
  for (const [id, o] of Object.entries(res.looks)) { if (o.bad.length) fail.push(id + ': ' + o.bad.join('; ')); if (o.rayHits) fail.push(id + ': rays along the dart hit hair (' + o.rayHits + ')'); }
  console.log(JSON.stringify(res)); if (pe.length) console.log('page errors', pe.slice(0, 2));
  console.log(fail.length ? 'S3-G77-SWEEP FAIL ' + fail.join(' | ') : `S3-G77-SWEEP PASS (fixture: the raise stops at ${F.kept} of the way, short of a lock that cuts its middle; ${Object.keys(res.looks).length} looks x 4 places x 22 poses: the whole raise path stays clear (measure and rays); raise kept: ${Object.entries(res.looks).map(([k, o]) => k + ' ' + o.raised + '/' + o.n + ' @' + o.meanKept).join(', ')})`);
  await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
