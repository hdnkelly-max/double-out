// doc 59: the v3 cast (8 seeded opponents + 4 pros, TOPS_V3CAST). Throwing dart vs hair MARGIN (Producer, round 5, 21 Nov): every base + three seeded opponents, through the whole throw at k steps of .01
// (aim/set, pull 0-1.3, throw, fly, follow, reset: dartPhase interpolates inside each phase, so .01 covers the in-between frames), with
// head movement (the idle clip under the pose at changing times, and the idle spine sway at four points of its cycle), in every place the
// game poses the dart hand: the match figure (landscape and portrait camera), the opponent's spot, the creator preview, the hero shot,
// the title figure. (Clips are not sampled: the game hides the throwing dart under every clip.) Pass: the dart stays >= 8 mm from the hair, beard, cap and hoops
// (signed surface distance, TOPS_S3DARTHAIR) in every sample.
// node tests/s3-dart-hair.js <dir> [base,base,...] [step]    (<dir> = the built page as index.html + assets/ + rig/)
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]),only=(process.argv[3]||'').split(',').filter(Boolean),STEP=+(process.argv[4]||0.01),MARGIN=8;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':/\.webp$/.test(u)?'image/webp':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(d=>{window.TOPS_S3FLAG=true;if(d)window.__dhDbg=1;try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_v2','1');localStorage.setItem('tops_v3cast','1');localStorage.setItem('tops_s3pros','1');}catch(e){}},process.env.DH_DEBUG||'');
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1&v3=1&v3cast=1&s3pros=1`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>{V.loadAnims();});await p.waitForFunction(()=>TOPS_RIGS().ids.includes('leonard')&&V._qa.animNames().length>0,null,{timeout:180000});
const t0=Date.now();
const res=await p.evaluate(([only,STEP,MARGIN,EXPORT])=>{const Q=V._qa,T=Q.T;const OCHE_Z=2.37,boardC=new T.Vector3(0,1.73,0.045);
 const specs=['Big Mal','Shazza','Dave Hurring','Pete the Plumber','Deano Marsh','Jonno','Kev Marsh','Lisa Tane','Luke Littler','Michael van Gerwen','Gerwyn Price','Luke Humphries'].map(n=>[n==='Deano Marsh'?RIVAL.look:lookFor(n),n,n]).filter(s=>!only.length||only.includes(s[2]));
 const N=k=>Math.round(k/STEP);const seq=(a,b)=>{const o=[];for(let i=N(a);i<=N(b);i++)o.push(+(i*STEP).toFixed(4));return o;};
 const phases=[['set',[{phase:'idle'}]],['pull',seq(0,1.3).map(v=>({phase:'pull',pull:v}))]];for(const ph of ['throw','fly','follow','reset'])phases.push([ph,seq(0,1).map(v=>({phase:ph,k:v}))]);
 /* where the game poses the dart hand (game4.js frame / poseOpp / preview / title / heroShot) */
 const places=[['match',f=>{f.position.set(0.1,0,OCHE_Z-0.51);f.rotation.set(0,0.8,0);},()=>boardC],['match-portrait',f=>{f.position.set(0.1,0,OCHE_Z-0.66);f.rotation.set(0,0.8,0);},()=>boardC],
  ['opponent',f=>{f.position.set(-0.06,0,OCHE_Z+0.08);f.rotation.set(0,1.0,0);},()=>boardC],['test-rig',f=>{f.position.set(0,0,0);f.rotation.set(0,0,0);},f=>f.localToWorld(new T.Vector3(0,1.73,-2.4))]];
 const idleOnly=[['creator-preview',f=>{f.position.set(0,0,OCHE_Z+1.5);f.rotation.set(0,-0.35,0);},f=>f.localToWorld(new T.Vector3(0.1,1.6,-3))],
  ['hero',f=>{f.position.set(0,0,0);f.rotation.set(0,0,0);},f=>{const v=new T.Vector3();f.userData.B.Head.getWorldPosition(v);return new T.Vector3(0.35,v.y+0.05,-2.4);}]];
 const pn=performance.now.bind(performance);const out={};let poses=0;
 for(const [look,name,id] of specs){const f=Q.makeFigure(look,name,0);if(!f.userData.rigged){out[id]={err:'not rigged'};continue;}Q.scene.add(f);
  const idleA=Q.playClip(f,'idle',{t:0}),idur=idleA?idleA.getClip().duration:1;let ci=0;
  const R={min:99,at:'',fails:0,n:0,byPlace:{},hist:[0,0,0,0,0]};/* hist: <0, 0-8, 8-15, 15-30, >=30 mm */
  /* DH_EXPORT: the dart's path in the hair's own space, Director's r15 table format (z bin -> the smallest |x| the dart reaches on her throwing side,
     y -0.24..+0.13), over every place, so a keep-out can be cut for all of them, not just the test rig */
  let hairM=null;f.traverse(o=>{if(o.isMesh&&o.userData.hair&&o.geometry.attributes.position&&(!hairM||o.geometry.attributes.position.count>hairM.geometry.attributes.position.count))hairM=o;});const XT={},XTP={};
  const exp=(where)=>{if(!EXPORT||!hairM||!f.userData.dt||!f.userData.dt.visible)return;const inv=new T.Matrix4().copy(hairM.matrixWorld).invert(),v=new T.Vector3(),pl=where.split('/')[0];
   f.userData.dt.traverse(o=>{if(!o.isMesh)return;const P=o.geometry.attributes.position;for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);if(v.x>=0||v.y<-0.24||v.y>0.13)continue;const zb=(Math.round(v.z/0.02)*0.02).toFixed(2),ax=-v.x;
    if(XT[zb]==null||ax<XT[zb])XT[zb]=ax;const q=XTP[pl]||(XTP[pl]={});if(q[zb]==null||ax<q[zb])q[zb]=ax;}});};
  const rec=(where,r)=>{exp(where);R.n++;poses++;const mm=r.mm;R.hist[mm<0?0:mm<MARGIN?1:mm<15?2:mm<30?3:4]++;if(mm<R.min){R.min=mm;R.at=where+' ('+r.at+')';if(r.dbg)R.dbg=r.dbg;}if(mm<MARGIN){R.fails++;if(!R.first)R.first=where;}const pk=where.split('/')[0];R.byPlace[pk]=Math.min(R.byPlace[pk]??99,mm);};
  const pose=(place,tgt,oa,lean)=>{if(f.userData.mixer)f.userData.mixer.stopAllAction();f.userData.act=null;const a=Q.playClip(f,'idle',{t:0});if(a&&f.userData.mixer){a.time=idur*((ci++*0.1379)%1);f.userData.mixer.update(0);}/* head movement: the idle clip at a different time every sample */
   if(lean!=null)performance.now=()=>lean;try{f.updateMatrixWorld(true);Q.poseFigure(f,oa,tgt(f));}finally{performance.now=pn;}f.updateMatrixWorld(true);};
  for(const [pl,place,tgt] of places){place(f);f.updateMatrixWorld(true);
   for(const [ph,oas] of phases)for(const oa of oas){if(ph==='set'){for(const lean of [0,1047,2094,3141]){pose(pl,tgt,oa,lean);rec(pl+'/set/sway'+lean,TOPS_S3DARTHAIR(f));}continue;}
    pose(pl,tgt,oa);rec(pl+'/'+ph+(oa.k!=null?oa.k:oa.pull),TOPS_S3DARTHAIR(f));}}
  for(const [pl,place,tgt] of idleOnly){place(f);f.updateMatrixWorld(true);for(const lean of [0,1047,2094,3141]){pose(pl,tgt,{phase:'idle'},lean);rec(pl+'/sway'+lean,TOPS_S3DARTHAIR(f));}}
  /* no clip sampling: the game only shows the throwing dart while poseDarts places it in the hand (set / pull / throw); clips, walk-ons, waiting and the
     stand poses hide it (dt.visible=false), and under a clip the hidden dart is left where the last pose put it, so measuring it there means nothing */
  if(EXPORT&&Object.keys(XT).length){const srt=o=>Object.keys(o).map(Number).sort((a,b)=>a-b).map(z=>[z,+o[z.toFixed(2)].toFixed(3)]);R.dartPath=srt(XT);R.dartPathByPlace={};for(const k in XTP)R.dartPathByPlace[k]=srt(XTP[k]);}
  R.min=+R.min.toFixed(1);for(const k in R.byPlace)R.byPlace[k]=+R.byPlace[k].toFixed(1);out[id]=R;Q.scene.remove(f);Q.dispose(f);}
 return {out,poses};},[only,STEP,MARGIN,!!process.env.DH_EXPORT]);
const fails=Object.entries(res.out).filter(([,r])=>r.err||r.fails);
console.log(JSON.stringify(res));
const line=Object.entries(res.out).map(([id,r])=>r.err?`${id} ${r.err}`:`${id} ${r.min} mm`).join(', ');
console.log(`S3-DART-HAIR ${fails.length?'FAIL':'PASS'} (${res.poses} samples, k step ${STEP}, margin >= ${MARGIN} mm; closest: ${line}; ${((Date.now()-t0)/1000).toFixed(0)} s)`+(fails.length?' FAILS: '+fails.map(([id,r])=>`${id} ${r.fails} samples < ${MARGIN} mm, worst ${r.min} mm at ${r.at}`).join('; '):''));
if(pe.length)console.log('page errors',pe.slice(0,3));
await b.close();srv.close();process.exit(fails.length?1:0);})();
