// CAR-5d: the release record on tops_darts.rel (Hayden approved the column 06:05), plus Q&D's P2 on CAR-5c (recorder ring).
//  E by default every dart row carries rel (same fields as the CAR-5c record) and is under the column's 1 KB check
//  F with the record on the row, the flight recorder keeps only darts next to a slow frame: the stall before the press and the stall in
//    the pull are logged, the steady dart is not; at most 30 per match (31st stall dart in the same match: no event)
//  G insurance: an insert refused for an unknown 'rel' column (PGRST204, as PostgREST says it) is sent again without rel, once; rel stays
//    off for the session, 'dart_rel_off' is logged, the re-sent darts go to the recorder instead, and from then on every dart is logged there again (as before CAR-5d)
// usage: node tests/dart-rel-col.js [dir]
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();
 window.__rows=[];window.__calls=[];NET.user={id:'u1'};NET.sb={from:t=>({insert:rows=>{if(t==='tops_darts'){__calls.push(rows.map(r=>'rel' in r?1:0));if(window.__noCol&&rows.some(r=>'rel' in r))return Promise.resolve({error:{code:'PGRST204',message:"Could not find the 'rel' column of 'tops_darts' in the schema cache"},status:400});__rows.push(...JSON.parse(JSON.stringify(rows)));}return Promise.resolve({error:null,status:201});},upsert:()=>Promise.resolve({error:null}),select:()=>({eq:()=>Promise.resolve({data:[],error:null})})}),auth:{getSession:()=>Promise.resolve({data:{session:null}})}};
 beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});});
const toAim=async()=>{for(let i=0;i<600;i++){const st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai&&!S.pulling)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim'||st==='done'||st.startsWith('ERR'))return st;await p.waitForTimeout(100);}return 'timeout';};
const ev=()=>p.evaluate(()=>{const e=TOPS_LOG.events().filter(x=>x&&x.k==='match_dart');return e.length?e[e.length-1].d:null;});
const throwOne=async(mode)=>{const s=await toAim();if(s!=='aim')return {err:'state '+s};await p.waitForTimeout(400);
 return p.evaluate(mode=>new Promise(res=>{const press=()=>{try{startPull('key');}catch(e){res({err:e.message});return;}
   const rel=()=>{try{release({timeStamp:performance.now()},'key');res({ok:1});}catch(e){res({err:e.message});}};
   if(mode==='pull'){setTimeout(()=>{const a=performance.now();while(performance.now()-a<300){}rel();},120);}else setTimeout(rel,300);};
  if(mode==='stall'){requestAnimationFrame(()=>{const a=performance.now();while(performance.now()-a<330){}setTimeout(press,0);});}
  else requestAnimationFrame(()=>setTimeout(press,0));}),mode);};
const evs=()=>p.evaluate(()=>TOPS_LOG.events().filter(x=>x&&x.k==='match_dart').length);
const out={},f=[];
// E + F
const n0=await evs();const rA=await throwOne('stall');await p.waitForTimeout(200);const n1=await evs();const rB=await throwOne('steady');await p.waitForTimeout(200);const n2=await evs();const rC=await throwOne('pull');await p.waitForTimeout(200);const n3=await evs();
out.F={stall:n1-n0,steady:n2-n1,pull:n3-n2};if(rA.err||rB.err||rC.err)f.push('throws: '+JSON.stringify([rA,rB,rC]));
if(out.F.stall!==1)f.push('stall before the press not logged with the record on the row');if(out.F.steady!==0)f.push('steady dart logged although the row carries it');if(out.F.pull!==1)f.push('stall in the pull not logged');
await p.waitForTimeout(8500);
out.E=await p.evaluate(()=>{const R=__rows.slice(-3);return {n:R.length,all:R.every(r=>r.rel&&typeof r.rel==='object'),keys:R[0]&&R[0].rel&&Object.keys(R[0].rel).sort().join(','),bytes:Math.max(...R.map(r=>JSON.stringify(r.rel||{}).length))};});
if(!(out.E.n===3&&out.E.all))f.push('rows without rel: '+JSON.stringify(out.E));if(out.E.keys!=='gp,gpl,gr,gx,gy,lag,pm,ra,rx,ry,sx,sy')f.push('rel keys: '+out.E.keys);if(!(out.E.bytes<400))f.push('rel too big: '+out.E.bytes);
// cap: 30 already logged this match -> a stall dart adds no event
await p.evaluate(()=>{S.mdN=30;});const c0=await evs();const rX=await throwOne('stall');await p.waitForTimeout(200);out.cap=(await evs())-c0;if(rX.err)f.push('cap throw: '+rX.err);if(out.cap!==0)f.push('31st event in a match logged');
await p.waitForTimeout(8500);
// G: the column is missing
await p.evaluate(()=>{window.__noCol=true;__calls.length=0;S.mdN=0;});const g0=await evs();
for(const m of ['steady','steady','steady']){const r=await throwOne(m);if(r.err)f.push('G throw: '+r.err);await p.waitForTimeout(150);}
await p.waitForTimeout(600);
out.G=await p.evaluate(()=>({calls:__calls.map(c=>c.join('')),last:__rows.slice(-3).map(r=>'rel' in r?1:0).join(''),off:TOPS_LOG.events().filter(x=>x&&x.k==='dart_rel_off').length}));
const r4=await throwOne('steady');await p.waitForTimeout(200);out.G.logged=(await evs())-g0;await p.waitForTimeout(8500);
out.G.after=await p.evaluate(()=>({calls:__calls.map(c=>c.join('')),rows:__rows.length}));
if(JSON.stringify(out.G.calls.slice(0,2))!=='["111","000"]')f.push('missing column: not re-sent once without rel: '+JSON.stringify(out.G));if(out.G.last!=='000')f.push('re-sent rows still have rel');if(out.G.off!==1)f.push('dart_rel_off not logged once');
if(out.G.after.calls[2]!=='0')f.push('rel not off for the session: '+JSON.stringify(out.G.after));if(out.G.logged!==4)f.push('with rel off every dart should be in the recorder (the 3 re-sent ones and the next): '+out.G.logged);
if(pe.length)f.push('page errors: '+pe.slice(0,2).join(' | '));
console.log(JSON.stringify(out));await b.close();
if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
console.log('PASS: rows carry rel by default (12 fields, < 400 B); recorder keeps only slow-frame darts, max 30 per match; a missing rel column re-sends without it once, turns rel off for the session and logs every dart again');})();
