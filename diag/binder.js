// Finding A check on a build: Season 3's image switch vs the card art (tc/cards.js sets .style.backgroundImage). usage: node binder.js <dir> <shot.png>
const pw = require('playwright'); const fs = require('fs'), path = require('path'); const [dir, shot] = process.argv.slice(2); const BR = process.env.BR || 'chromium';
(async () => { const b = await pw[BR].launch(BR === 'chromium' ? { args: ['--use-gl=swiftshader', '--allow-file-access-from-files'] } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const pe = []; p.on('pageerror', e => pe.push(e.message.slice(0, 120)));
  const raw = fs.readFileSync(path.join(__dirname, 'a_long_s3.json'), 'utf8');
  await p.addInitScript(raw => { if (!sessionStorage.getItem('q')) { localStorage.setItem('doubleout_s3', raw); localStorage.setItem('tops_s3_welcome', '1'); sessionStorage.setItem('q', 1); } }, raw);
  await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/, r => r.abort());
  await p.goto('file://' + path.resolve(dir) + '/index.html?s3=1&s3x=1', { timeout: 180000 }); await p.waitForFunction(() => window.TC_API && window.TOPS_S3 && window.TOPS_S3_IMG, null, { timeout: 180000 }); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => {
    const d = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'backgroundImage');
    // smallest repro: one element, the same assignment the card code makes
    const old = 'assets/cards/art/bigmal.webp', want = TOPS_S3_IMG(old); const e = document.createElement('div'); e.style.backgroundImage = `url(${old})`; const viaProp = e.style.backgroundImage;
    const e2 = document.createElement('div'); e2.style.setProperty('background-image', `url(${old})`); const viaSet = e2.style.backgroundImage;
    // every card def: what the art should be under S3 vs what this browser shows
    const defs = Object.values((TC_API.D && (TC_API.D.CARDS || TC_API.D.cards)) || {}); const list = Array.isArray(defs[0]) ? defs[0] : defs;
    const all = (window.TC_DATA && TC_DATA.CARDS) || list; const rows = [];
    for (const c of all) { if (!c || !c.art) continue; const w = TOPS_S3_IMG(c.art); if (w === c.art) continue; const x = document.createElement('div'); x.style.backgroundImage = `url(${c.art})`; const shown = x.style.backgroundImage; rows.push({ id: c.id, art: c.art, want: w.startsWith('data:') ? 'placeholder' : w, oldShown: !/s3\/|data:image/.test(shown) }); }
    return { engine: navigator.userAgent.slice(0, 60), protoHasSetter: !!(d && d.set), repro: { old, want, viaProp, viaSet }, defs: all.length, affected: rows.length, oldShown: rows.filter(x => x.oldShown).length, sample: rows.slice(0, 6) }; });
  // the real binder: open it and read what each card shows
  await p.evaluate(() => { try { const l = document.getElementById('login'); if (l) l.hidden = true; showHub('play'); TC_API.binder(); } catch (e) { window.__berr = String(e); } }); await p.waitForTimeout(2500);
  const bind = await p.evaluate(() => { const arts = [...document.querySelectorAll('.tc-binder .tc__art, .tc__art')].map(a => a.style.backgroundImage).filter(Boolean);
    return { cards: arts.length, oldArt: arts.filter(u => /assets\/cards\/art/.test(u) && !/s3\//.test(u)).length, s3Art: arts.filter(u => /s3\//.test(u)).length, ph: arts.filter(u => /data:image/.test(u)).length, ex: arts.filter(u => !/s3\//.test(u)).slice(0, 4), err: window.__berr || null }; });
  if (shot) await p.screenshot({ path: shot });
  console.log(JSON.stringify({ BR, ...r, binder: bind, pageErrors: pe.slice(0, 3) }, null, 1)); await b.close(); })();
