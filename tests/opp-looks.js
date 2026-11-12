// CAR-7c (Delivery QA 00:23): a woman's name drawn on a male model never walks out with a beard.
//  1 every opponent name (AINAMES + league regulars): the look entry that applies (V.oppVar) — the women's names on male
//    models (Lisa Tane, Pania Walters: Bryce; Maia Tuhoe: Lewis; Ngaire Pou: Pete) get no beard and no build;
//    the controls keep theirs (Big Mal, Lewis/Bryce/Pete-model men)
//  2 real figures, built the way a match builds the opponent (V.setOpponentLook) with the model and hair library loaded:
//    no visible beard mesh on the women; a beard on Kev Marsh (Bryce), Shane Bell (Pete), Dave Hurring (Lewis)
// usage: node tests/opp-looks.js   (serves the build over http so the GLBs load; ~2-3 min)
const {chromium}=require('playwright');const path=require('path');const http=require('http');const fs=require('fs');
const root=path.resolve(__dirname,'..');const srv=http.createServer((q,s)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':'application/octet-stream'});s.end(d);});});
const WOMEN=['Lisa Tane','Pania Walters','Maia Tuhoe','Ngaire Pou'];
const MEN=[['Kev Marsh','bryce'],['Shane Bell','pete'],['Dave Hurring','lewis']];
// CAR-7d: Brian-model men wear the short library crop; Mere Hohepa's own hair is tinted dark (no library mesh, no beard)
const HAIR=[['Craig Caldwell','brian','short']];
(async()=>{await new Promise(r=>srv.listen(0,r));const port=srv.address().port;const f=[];
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:360,height:640}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());
 await p.goto(`http://localhost:${port}/index.html`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
 // 1 table
 const hasVar=await p.evaluate(()=>typeof V.oppVar==='function');if(!hasVar)f.push('V.oppVar missing (build before the CAR-7c fix)');
 const t=!hasVar?[]:await p.evaluate(()=>{const all=[...new Set([...AINAMES.flat(),...(typeof EXTRA_NAMES!=='undefined'?Object.values(EXTRA_NAMES).flat():[])])];
  return all.map(n=>{const ck=V.charKey(lookFor(n),n);const v=V.oppVar(n,ck);const beard=!!(v&&v.beard)||(ck==='pete'&&!(v&&v.noBeard));return {n,ck,beard,girth:(v&&v.girth)||0,soft:!!(v&&v.beardSoft)};});});
 const by=Object.fromEntries(t.map(r=>[r.n,r]));
 if(hasVar)for(const n of WOMEN){const r=by[n];if(!r)f.push(n+' is not an opponent name any more (test setup)');else if(r.beard||r.girth)f.push(`${n} (${r.ck}) still gets ${r.beard?'a beard':''}${r.girth?' build '+r.girth:''}`);}
 const ctl={'Big Mal':r=>r.beard&&r.girth===1.12,'Kev Marsh':r=>r.beard&&r.soft,'Shane Bell':r=>r.beard&&r.soft,'Dave Hurring':r=>r.beard&&r.girth===1.06};
 if(hasVar)for(const n in ctl)if(!by[n]||!ctl[n](by[n]))f.push('control changed: '+JSON.stringify(by[n]));
 // 2 real figures
 await p.evaluate(()=>{save.authSeen=true;save.name='P';save.lessonDone=true;$('login').hidden=true;newCareer();V.walkOn=()=>{};V.loadHair();
  for(const m of ['bryce','pete','lewis'])try{V.heroShot({model:m},'x',0,null);}catch(e){}});
 await p.waitForFunction(()=>{const r=TOPS_RIGS();return ['bryce','pete','lewis'].every(k=>r.ids.includes(k))&&typeof V._qa.gfx().hair==='object';},null,{timeout:180000});
 /* the game frees character files it isn't using (evictChars), so load each model again just before its figure is built, and
    fail as test setup if the figure fell back to the stand-in model (no face kit at all) */
 const shot=async(n,ck)=>{await p.evaluate(ck=>{if(!TOPS_RIGS().ids.includes(ck))try{V.heroShot({model:ck},'x',0,null);}catch(e){}},ck);
  await p.waitForFunction(ck=>TOPS_RIGS().ids.includes(ck),ck,{timeout:120000});
  return p.evaluate(n=>{V.setOpponentLook(lookFor(n),n,0);const o=V._qa.opp();let beard=0,lib=0;o.traverse(m=>{if(m.userData.hairStyle)lib++;if(m.isMesh&&m.userData.hairStyle==='beard'&&m.visible)beard++;});return {n,ck:o.userData.ck,beard,lib};},n);};
 const rows=[];for(const n of WOMEN){const want=hasVar?by[n].ck:{'Lisa Tane':'bryce','Pania Walters':'bryce','Maia Tuhoe':'lewis','Ngaire Pou':'pete'}[n];const r=await shot(n,want);rows.push(r);if(r.ck!==want)f.push(`${n}: built on ${r.ck}, expected ${want} (test setup)`);else if(r.beard)f.push(`${n} (${r.ck}) figure has ${r.beard} visible beard mesh(es)`);}
 for(const [n,ck] of MEN){const r=await shot(n,ck);rows.push(r);if(r.ck!==ck)f.push(`${n}: built on ${r.ck}, expected ${ck} (test setup)`);else if(!r.beard)f.push(`control ${n} (${ck}) lost its beard${r.lib?'':' (no library mesh at all: stand-in model? test setup)'}`);}
 for(const [n,ck,st] of HAIR){const r=await shot(n,ck);const h=await p.evaluate(st=>{let k=0;V._qa.opp().traverse(m=>{if(m.isMesh&&m.userData.hairStyle===st&&m.visible)k++;});return k;},st);r.hair=h;rows.push(r);if(r.ck!==ck)f.push(`${n}: built on ${r.ck}, expected ${ck} (test setup)`);else if(!h)f.push(`${n} (${ck}) has no ${st} library hair`);}
 if(hasVar){const m=by['Mere Hohepa'];if(!m||m.beard)f.push('Mere Hohepa: '+JSON.stringify(m));const mv=await p.evaluate(()=>V.oppVar('Mere Hohepa',V.charKey(lookFor('Mere Hohepa'),'Mere Hohepa')));if(!mv||!mv.hairCol)f.push('Mere Hohepa has no hair tint: '+JSON.stringify(mv));}
 if(hasVar){const hf=await p.evaluate(()=>V.hairFor(lookFor('Craig Caldwell'),'Craig Caldwell'));if(!hf)f.push('the hub would not prefetch hair.glb for a Brian-model fixture');}
 console.log(JSON.stringify(rows));if(errs.length)f.push('page errors: '+errs.slice(0,2).join(' | '));
 await b.close();srv.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log(`PASS: ${t.length} opponent names checked; no beard or build on ${WOMEN.join(', ')} (table and real figures); Big Mal, Kev Marsh, Shane Bell, Dave Hurring keep theirs; Craig Caldwell wears the short crop; Mere Hohepa's hair is tinted`);})();
