// EXP-WIN: which unlock the Result shows big when one match crosses several levels (ChatGPT P2 13 Nov). The rule: the newest shirt,
// else the newest big reward, else the last; every level in the jump counted, none outside it. usage: node tests/rb-unlock.js [dir]
const { chromium } = require('playwright'); const path = require('path'); const dir = process.argv[2] || path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const pe = []; p.on('pageerror', e => pe.push(e.message));
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + dir + '/index.html', { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.C3 && window.TOPS_RB, null, { timeout: 180000 });
  const r = await p.evaluate(() => { const real = C3.rewardAt, T = {
      2: { k: 'cash', v: 50 }, 3: { k: 'shirt', v: '#0b3d2e', n: 'Racing green' }, 4: { k: 'flight', v: 'x', n: 'Flight' }, 5: { k: 'shirt', v: '#123456', n: 'Navy' },
      6: { k: 'title', v: 'Pro', n: 'Pro', big: true }, 7: { k: 'cash', v: 80 }, 8: { k: 'title', v: 'Star', n: 'Star', big: true }, 9: { k: 'flight', v: 'y', n: 'Flight 2' } };
    C3.rewardAt = L => T[L] || null; const f = (a, z) => { const o = TOPS_RB.pickUnlock(a, z); return { n: o.rs.length, lv: o.pick && o.pick[0] }; };
    const out = { twoShirts: f(2, 6), noShirtBig: f(5, 9), noShirtNoBig: f(8, 9), one: f(1, 2), none: f(9, 9), bounds: f(3, 4) };
    let thrown = false; C3.rewardAt = L => { if (L === 4) throw new Error('x'); return T[L] || null; }; try { out.throws = f(2, 5); } catch (e) { thrown = true; } out.thrown = thrown; C3.rewardAt = real;
    out.real = TOPS_RB.pickUnlock(0, 20); out.real = { n: out.real.rs.length, k: out.real.pick && out.real.pick[1].k }; return out; });
  const fail = [], eq = (k, a, e) => { if (JSON.stringify(a) !== JSON.stringify(e)) fail.push(k + ' ' + JSON.stringify(a) + ' want ' + JSON.stringify(e)); };
  eq('two shirts in the jump → the newer shirt', r.twoShirts, { n: 4, lv: 5 }); eq('no new shirt → newest big', r.noShirtBig, { n: 4, lv: 8 });
  eq('no shirt, no big → the last', r.noShirtNoBig, { n: 1, lv: 9 }); eq('one level', r.one, { n: 1, lv: 2 }); eq('no level up → nothing', r.none, { n: 0, lv: null });
  eq('only levels from+1..to', r.bounds, { n: 1, lv: 4 }); eq('a throwing level is skipped', r.throws, { n: 2, lv: 5 }); if (r.thrown) fail.push('pickUnlock threw');
  if (!r.real.n) fail.push('real rewardAt gave no rewards for 1..20'); if (pe.length) fail.push('page errors ' + pe.join('; ').slice(0, 150));
  console.log(JSON.stringify(r)); console.log(fail.length ? 'rb-unlock FAIL: ' + fail.join(', ') : 'rb-unlock PASS'); await b.close(); })();
