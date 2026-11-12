// v13 live performance telemetry (Hayden 06:54; ChatGPT 9.0). A real career match through beginMatch / the game's frames / endMatch,
// with the network stubbed so the rows can be read back:
//  - a 30 s checkpoint row (threshold shortened for the test) uploaded at a safe moment, then an end row with the same match_id, status complete
//  - hidden is a pause: a local checkpoint is stored, resuming keeps the match, the hidden time isn't counted, the finished match replaces it
//  - an injected 120 ms main-thread stall shows up as stalls100 and an incident with the game phase
//  - a quit before 30 frames sends nothing; guests' rows wait in a bounded local queue
//  - cost: the per-frame bookkeeping p95 < 0.05 ms and max < 0.5 ms (bench, median of 3 runs), and no raw user-agent in the row
//  - insert-only stub like the real table: a duplicate in a batch is retried row by row and clears the queue; keepalive is a plain POST
//  - a leg ending during the next pull sends nothing until a real break (QA 09:03 / 11:00)
//  - every row: version, match index, standalone flag, 10-bin frame histogram summing to frame_n, under 5 KB; the 5 KB guard trims an oversized row
// usage: node tests/perf-tel.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files','--js-flags=--expose-gc']});const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
 const f=[];
 await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;
  window.__rows=[];NET.user={id:'u1'};/* insert-only like the real table (QA 09:03): no upsert; a row whose sample_id is already stored fails the whole batch with 23505 / 409 */
  window.__stored=new Set();window.__calls=[];NET.sb={from:t=>({insert:(rows)=>{__calls.push(rows.length);if(rows.some(r=>__stored.has(r.sample_id)))return Promise.resolve({error:{code:'23505',message:'duplicate key value violates unique constraint "tops_perf_sample_id_key"',details:'Key (sample_id)=(x) already exists.'},status:409});rows.forEach(r=>__stored.add(r.sample_id));__rows.push(...JSON.parse(JSON.stringify(rows)));return Promise.resolve({error:null,status:201});},upsert:()=>{throw new Error('upsert used: needs SELECT on tops_perf');}}),auth:{getSession:()=>Promise.resolve({data:{}})}};
  window.TOPS_PERF_30=3000;beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:60,legs:3});});
 await p.waitForTimeout(2500);await p.evaluate(()=>{if(S&&S.bull)S.bull=null;S.busy=false;S.cur=0;/* the 'who throws first, tap to continue' card, as a player's tap */});
 // aim input (real pointer events) so the reticle latency has samples
 await p.evaluate(()=>{for(let k=0;k<5;k++)setTimeout(()=>document.querySelector('canvas').dispatchEvent(new PointerEvent('pointermove',{pointerType:'touch',pointerId:3,clientX:200+k,clientY:300,bubbles:true})),k*400);});
 // wait for the 30 s checkpoint (3 s here) to upload at a safe moment
 // QA 08:23: nothing is sent during play; the 30 s checkpoint waits for the next leg end (the game's own endLeg)
 for(let i=0;i<30;i++){await p.waitForTimeout(500);if(await p.evaluate(()=>TOPS_perf.m&&TOPS_perf.m.want30))break;}
 await p.waitForTimeout(3000);const early=await p.evaluate(()=>__rows.length);if(early)f.push('a row was sent during play, before any leg ended: '+early);
 await p.evaluate(()=>{try{endLeg();}catch(e){}S.busy=false;S.cur=0;});
 for(let i=0;i<20;i++){await p.waitForTimeout(500);if(await p.evaluate(()=>__rows.some(r=>r.phase==='30s')))break;}
 const r30=await p.evaluate(()=>__rows.find(r=>r.phase==='30s')||null);
 if(!r30)f.push('no 30 s checkpoint row');else{if(r30.status!=='partial')f.push('30 s row status '+r30.status);for(const k of ['ver','match_id','sample_id','fps','p95','frame_n','visible_secs','dev'])if(r30[k]==null)f.push('30 s row missing '+k);
  if(r30.dev&&(r30.dev.ua||/Mozilla\//.test(JSON.stringify(r30))))f.push('raw user-agent stored');if(!r30.dev||!r30.dev.device_class)f.push('no device_class');}
 // hidden = pause: checkpoint stored locally, no network; then resume
 const hid=await p.evaluate(async()=>{const n0=__rows.length;const vis0=TOPS_perf.m.vis;let hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});document.dispatchEvent(new Event('visibilitychange'));
  const q=[JSON.parse(localStorage.getItem('tops_perfck')||'null')].filter(Boolean);const inQueue=TOPS_perf.queue().filter(r=>String(r.sample_id).startsWith('ck-')).length;await new Promise(r=>setTimeout(r,2000));const visHidden=TOPS_perf.m.vis-vis0;
  hidden=false;document.dispatchEvent(new Event('visibilitychange'));return {ck:q.length,inQueue,net:__rows.length-n0,visHidden,still:!!TOPS_perf.m&&!TOPS_perf.m.done,mid:TOPS_perf.m&&TOPS_perf.m.id};});
 if(hid.ck!==1)f.push('hidden: no local checkpoint ('+hid.ck+')');if(hid.inQueue)f.push('hidden checkpoint put in the upload queue (would upload with the next send)');if(hid.net)f.push('hidden: sent to the network');if(hid.visHidden>50)f.push('hidden time counted as play: '+hid.visHidden+' ms');if(!hid.still)f.push('hidden ended the match');
 await p.waitForTimeout(1500);
 // injected 120 ms stall during the next frame
 await p.evaluate(()=>{requestAnimationFrame(()=>{const t=performance.now();while(performance.now()-t<120);});});await p.waitForTimeout(2500);
 const mid=await p.evaluate(()=>({c100:TOPS_perf.m.c100,inc:TOPS_perf.m.inc.slice()}));
 if(mid.c100<1)f.push('injected 120 ms stall not counted');if(!mid.inc.some(i=>i.f>=100&&i.ph))f.push('no incident with a phase for the stall: '+JSON.stringify(mid.inc.slice(0,3)));
 // end the match
 const end=await p.evaluate(async()=>{S.won=true;endMatch();await new Promise(r=>setTimeout(r,5000));return {rows:__rows.filter(r=>r.phase==='end'),all:__rows.slice(),q:TOPS_perf.queue(),ck:localStorage.getItem('tops_perfck')};});
 const re=end.rows[0];if(end.rows.length!==1)f.push('end rows: '+end.rows.length);else{if(re.status!=='complete')f.push('end status '+re.status);if(r30&&re.match_id!==r30.match_id)f.push('30 s and end rows have different match ids');if(re.stalls100<1)f.push('end row lost the stall');if(!(re.reticle_n>=1))f.push('no reticle latency samples from the aim input: '+re.reticle_n);}
 if(end.q.some(r=>String(r.sample_id).startsWith('ck-'))||end.ck)f.push('the hidden checkpoint survived the finished match');if(end.all.some(r=>r.status==='interrupted'))f.push('an interrupted row was uploaded for a match that finished');if(re&&re.audio_issue_n)f.push('audio issues reported with no audio problem: '+re.audio_issue_n+' '+JSON.stringify(re.audio));
 // Overseer 07:56: per-match memory and session fields, version on every funnel event
 // Overseer 10:31 (R0 #16 support): every row carries version, match index, standalone flag and a 10-bin frame histogram, and is under 5 KB
 for(const r of end.all){const bytes=Buffer.byteLength(JSON.stringify(r));if(bytes>=5000)f.push(r.phase+' row is '+bytes+' bytes (limit 5000)');
  if(!r.ver)f.push(r.phase+' row has no version');if(r.match_index==null)f.push(r.phase+' row has no match_index');if(!('standalone' in r))f.push(r.phase+' row has no standalone flag');
  if(!Array.isArray(r.frame_hist)||r.frame_hist.length!==10)f.push(r.phase+' row frame_hist: '+JSON.stringify(r.frame_hist));else if(r.frame_hist.reduce((a,b)=>a+b,0)!==r.frame_n)f.push(r.phase+' frame_hist sums to '+r.frame_hist.reduce((a,b)=>a+b,0)+', frame_n '+r.frame_n);}
 // the 5 KB guard trims an oversized row (40 fat incidents) instead of sending it whole
 const big=await p.evaluate(()=>{const r=TOPS_perf.fitTest();return {bytes:new TextEncoder().encode(JSON.stringify(r)).length,inc:(r.incidents||[]).length};});
 if(big.bytes>5000)f.push('oversized row not trimmed: '+JSON.stringify(big));
 if(re){for(const k of ['match_index','app_secs','geometries','textures','programs'])if(re[k]==null)f.push('end row missing '+k);if(!re.mem||!re.mem.start||!re.mem.now)f.push('end row missing mem start/now');}
 const fv=await p.evaluate(()=>(save.funnel||[]).slice(-5).map(e=>e.v));if(!fv.length||fv.some(v=>!v))f.push('funnel events without a version: '+JSON.stringify(fv));
 // short match quit: nothing sent; guest: queued, bounded
 const g=await p.evaluate(async()=>{const n0=__rows.length;beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:60,legs:1});await new Promise(r=>setTimeout(r,300));const q=document.getElementById('btnQuit');if(q)q.click();
  await new Promise(r=>setTimeout(r,2500));const sent=__rows.length-n0;NET.user=null;TOPS_perf.send(Array.from({length:30},(_,i)=>({sample_id:'g'+i,match_id:'m',phase:'end'})));return {sent,q:TOPS_perf.queue().length};});
 if(g.sent)f.push('a quit before 30 frames sent a row');if(g.q>20)f.push('guest queue not bounded: '+g.q);
 // match index counts up across matches in one session
 const ix=await p.evaluate(async()=>{const out=[];for(let i=0;i<2;i++){window.__rows.length=0;NET.user={id:'u1'};beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:60,legs:1});out.push(TOPS_perf.m&&TOPS_perf.m.ix);await new Promise(r=>setTimeout(r,200));}return out;});
 if(!(ix[1]===ix[0]+1&&ix[0]>=3))f.push('match index does not count up per match: '+JSON.stringify(ix));
 // QA 08:23: a telemetry fault can't touch gameplay: break the sampler's state, frames and the next match start still run
 const fault=await p.evaluate(async()=>{beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:60,legs:1});const m=TOPS_perf.m;m.fh=null;m.rh=null;m.inc=null;let frames=0;const f0=V.frame;
   await new Promise(r=>setTimeout(r,2500));let ok=true;try{beginMatch({mode:'career',tier:1,p0:'P',oppName:'Y',oppAvg:60,legs:1});}catch(e){ok=false;}return {ok,started:!!(S&&!S.done&&S.p)};});
 if(!fault.ok||!fault.started)f.push('a broken telemetry state stopped a match starting: '+JSON.stringify(fault));
 // a quit after a few seconds of play (under 5 s) sends nothing even with plenty of frames
 const q5=await p.evaluate(async()=>{const n0=__rows.length;beginMatch({mode:'career',tier:1,p0:'P',oppName:'Z',oppAvg:60,legs:1});const m=TOPS_perf.m;m.fn=400;m.vis=4000;const q=document.getElementById('btnQuit');if(q)q.click();await new Promise(r=>setTimeout(r,3500));return __rows.length-n0;});
 if(q5)f.push('a 4 s quit sent a row');
 // median of 3 bench runs, each after a forced GC: pre/post allocate nothing on normal frames, but the match's own garbage was being collected
 // inside a timed call (700-4100 µs single-call spikes after a match, p95 0 µs; 100 µs = the timer's resolution here on a fresh page)
 const runs=[];for(let i=0;i<3;i++)runs.push(await p.evaluate(()=>{if(typeof gc==='function')gc();return TOPS_perf.bench(20000);}));const med=k=>runs.map(r=>r[k]).sort((x,y)=>x-y)[1];const cost={p95:med('p95'),call_p95:med('call_p95'),call_max:med('call_max'),runs:runs.map(r=>r.call_max)};if(cost.p95>50||cost.call_p95>50||cost.call_max>500)f.push('per-frame bookkeeping too slow: '+JSON.stringify(cost));
 // a session killed while hidden: its checkpoint becomes one interrupted row on the next load (and isn't lost)
 await p.evaluate(()=>{try{S.won=true;endMatch();}catch(e){}localStorage.setItem('tops_perfq','[]');localStorage.setItem('tops_perfck',JSON.stringify({sample_id:'ck-zz',match_id:'zz',phase:'end',status:'interrupted'}));});
 await p.reload();await p.waitForTimeout(4500);const k=await p.evaluate(()=>({ck:localStorage.getItem('tops_perfck'),q:JSON.parse(localStorage.getItem('tops_perfq')||'[]').map(r=>[r.match_id,r.status,String(r.sample_id).startsWith('ck-')])}));
 if(k.ck||k.q.length!==1||k.q[0][0]!=='zz'||k.q[0][1]!=='interrupted'||k.q[0][2])f.push('killed-while-hidden checkpoint not promoted once with a fresh id: '+JSON.stringify(k));
 
 // the page was reloaded above: put the insert-only stub back, with one row already stored
 await p.evaluate(()=>{window.__stored=new Set(['old-1']);window.__calls=[];window.__rows=[{sample_id:'old-1',phase:'end',ver:'x'}];NET.user={id:'u1'};NET.sb={from:t=>({insert:(rows)=>{__calls.push(rows.length);if(rows.some(r=>__stored.has(r.sample_id)))return Promise.resolve({error:{code:'23505',message:'duplicate key value violates unique constraint "tops_perf_sample_id_key"',details:'Key (sample_id)=(x) already exists.'},status:409});rows.forEach(r=>__stored.add(r.sample_id));__rows.push(...JSON.parse(JSON.stringify(rows)));return Promise.resolve({error:null,status:201});},upsert:()=>{throw new Error('upsert used');}}),auth:{getSession:()=>Promise.resolve({data:{}})}};save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};if(!career())newCareer();const c=career();c.stage=null;c.tier=1;});
 // QA 09:03 / 11:00 finding 1: a batch with a row already stored (lost response, retry) still clears the queue, row by row
 const dupc=await p.evaluate(async()=>{const old=__rows[0];const fresh=Object.assign({},old,{sample_id:'fresh-'+Date.now()});
  localStorage.setItem('tops_perfq',JSON.stringify([old,fresh]));const before=__rows.length;TOPS_perf.flush&&TOPS_perf.flush();await new Promise(r=>setTimeout(r,800));
  return {q:JSON.parse(localStorage.getItem('tops_perfq')||'[]').length,added:__rows.length-before,freshStored:__stored.has(fresh.sample_id)};});
 if(dupc.q!==0||!dupc.freshStored||dupc.added!==1)f.push('duplicate in a batch: '+JSON.stringify(dupc));
 // CAR-5 / CAR-5b: a 23505 on sample_id = already stored (released, not counted); a row refused for good (FK 23503, another unique
 // constraint: non-duplicate 4xx) is retried alone once, then dropped and counted; network/5xx/401/429 keep the row queued
 const fk0=0;const fk=await p.evaluate(async()=>{const keep=NET.sb;const out={};
  const run=async(err,status)=>{const row={sample_id:'fk-'+Math.random(),phase:'end',ver:'x'};localStorage.setItem('tops_perfq',JSON.stringify([row]));const b0=(TOPS_perf.bad?TOPS_perf.bad():0);
   NET.sb={from:t=>({insert:(rows)=>Promise.resolve(err?{error:err,status}:{error:null,status:201})}),auth:keep.auth};TOPS_perf.flush();await new Promise(r=>setTimeout(r,600));
   return [JSON.parse(localStorage.getItem('tops_perfq')||'[]').length,(TOPS_perf.bad?TOPS_perf.bad():0)-b0];};
  out.fk=await run({code:'23503',message:'insert or update on table "tops_perf" violates foreign key constraint "tops_perf_user_id_fkey"',details:'Key (user_id)=(x) is not present in table "users".'},409);
  out.otherUnique=await run({code:'23505',message:'duplicate key value violates unique constraint "some_other_key"',details:'Key (match_id, phase)=(a, b) already exists.'},409);
  out.bad400=await run({code:'22P02',message:'invalid input syntax'},400);
  out.sample=await run({code:'23505',message:'duplicate key value violates unique constraint "tops_perf_sample_id_key"',details:'Key (sample_id)=(x) already exists.'},409);
  out.schema=await run({code:'PGRST204',message:"Could not find the 'x' column of 'tops_perf' in the schema cache"},400);out.s500=await run({code:'XX000',message:'server'},500);out.s401=await run({code:'PGRST301',message:'JWT expired'},401);out.s429=await run({message:'slow down'},429);out.net=await run({message:'Failed to fetch'},0);
  // a batch of three where the middle row is refused for good: the two good rows are stored, the bad one dropped and counted, queue empty
  {const rows=['ok-a','bad-b','ok-c'].map(id=>({sample_id:id+Math.random(),phase:'end',ver:'x'}));localStorage.setItem('tops_perfq',JSON.stringify(rows));const b0=(TOPS_perf.bad?TOPS_perf.bad():0);const stored=[];
   NET.sb={from:t=>({insert:(rs)=>Promise.resolve(rs.some(r=>/^bad/.test(r.sample_id))?{error:{code:'23503',message:'fk'},status:409}:(stored.push(...rs.map(r=>r.sample_id.slice(0,4))),{error:null,status:201}))}),auth:keep.auth};
   TOPS_perf.flush();await new Promise(r=>setTimeout(r,800));out.mixed=[JSON.parse(localStorage.getItem('tops_perfq')||'[]').length,(TOPS_perf.bad?TOPS_perf.bad():0)-b0,stored.join(',')];}
  NET.sb=keep;localStorage.setItem('tops_perfq','[]');return out;});
 const want={fk:[0,1],otherUnique:[0,1],bad400:[0,1],sample:[0,0],schema:[1,0],s500:[1,0],s401:[1,0],s429:[1,0],net:[1,0],mixed:[0,1,'ok-a,ok-c']};
 if(JSON.stringify(fk)!==JSON.stringify(want))f.push('CAR-5b batch rules: '+JSON.stringify(fk)+' want '+JSON.stringify(want));
 // CAR-5b (A): on pagehide the keepalive carries rows held in memory during play, not only the stored queue
 const ph=await p.evaluate(()=>{const bodies=[];const of=window.fetch;window.fetch=(u,o)=>{if(String(u).includes('tops_perf'))bodies.push(String(o&&o.body||''));return Promise.resolve({ok:true});};
  const ka=TOPS_perf.kaTest;let r;try{localStorage.setItem('tops_perfq',JSON.stringify([{sample_id:'q-1',phase:'end'}]));if(TOPS_perf._hold)TOPS_perf._hold([{sample_id:'held-30s',phase:'30s'}]);
   const keepKA=window.__KA_SET;dispatchEvent(new Event('pagehide'));r={bodies,q:JSON.parse(localStorage.getItem('tops_perfq')||'[]').map(x=>x.sample_id)};}finally{window.fetch=of;}return r;});
 if(!ph.q.includes('held-30s')||!ph.q.includes('q-1'))f.push('pagehide drops held rows (queue after pagehide): '+JSON.stringify(ph));
 if(ph.bodies.length&&!ph.bodies.some(b=>b.includes('held-30s')))f.push('pagehide keepalive body has no held row: '+JSON.stringify(ph.bodies).slice(0,200));
 // keepalive: plain POST, no on_conflict / resolution
 const ka=await p.evaluate(()=>{const seen=[];const of=window.fetch;window.fetch=(u,o)=>{seen.push({u:String(u),p:o&&o.headers&&o.headers.Prefer});return Promise.resolve({ok:true});};try{TOPS_perf.kaTest&&TOPS_perf.kaTest();}finally{window.fetch=of;}return seen;});
 if(!ka.length)f.push('keepalive not exercised');else if(ka.some(x=>/on_conflict/.test(x.u)||/resolution/.test(x.p||'')))f.push('keepalive still asks for on_conflict/resolution: '+JSON.stringify(ka));
 // QA 09:03 / 11:00 finding 2: a leg that ends while the next pull is under way sends nothing until a real break
 const midp=await p.evaluate(async()=>{beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:60,legs:9});/* long match: two endLeg() calls must not finish it */await new Promise(r=>setTimeout(r,800));
  const m=TOPS_perf.m;if(!m)return {err:'no match'};m.want30=true;m.sent30=false;const n0=__calls.length;S.busy=false;S.pulling=true;try{endLeg();}catch(e){}
  await new Promise(r=>setTimeout(r,6500));/* a pull held through the whole 5 s look-again window: nothing may go */const during=__calls.length-n0;
  S.pulling=false;S.busy=false;await new Promise(r=>setTimeout(r,1500));const afterWindow=__calls.length-n0;/* window over: wait for the next break */
  try{endLeg();}catch(e){}await new Promise(r=>setTimeout(r,3000));return {during,afterWindow,sent30:m.sent30,calls:__calls.length-n0};});
 if(midp.err||midp.during!==0||midp.afterWindow!==0||!midp.sent30)f.push('leg break during a pull: '+JSON.stringify(midp));
 // CAR-5 check 2: after a leg ends, the player aiming (quiet, no who-throws-first card) sends nothing; the card up opens the break and it goes
 const aim=await p.evaluate(async()=>{beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:60,legs:9});await new Promise(r=>setTimeout(r,800));const m=TOPS_perf.m;if(!m)return {err:'no match'};
  m.want30=true;m.sent30=false;const n0=__calls.length;try{endLeg();}catch(e){}await new Promise(r=>setTimeout(r,50));
  const sv=S;Object.defineProperty(sv,'bull',{configurable:true,get:()=>null,set:()=>{}});/* the player has tapped the card and is aiming: no card, quiet */
  const stopAt=Date.now()+4000;while(Date.now()<stopAt){S.busy=false;S.pulling=false;await new Promise(r=>setTimeout(r,50));}
  const during=__calls.length-n0;const sentDuring=m.sent30;delete sv.bull;sv.bull={me:1,op:2};S.busy=false;await new Promise(r=>setTimeout(r,2500));return {during,sentDuring,sent30:m.sent30,calls:__calls.length-n0};});
 if(aim.err||aim.during!==0||aim.sentDuring||!aim.sent30||aim.calls<1)f.push('CAR-5: send while aiming after a leg end, or not at the break: '+JSON.stringify(aim));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 console.log(JSON.stringify({r30:r30&&{fps:r30.fps,p95:r30.p95,frame_n:r30.frame_n,dev:r30.dev,reticle_n:r30.reticle_n},end:re&&{status:re.status,stalls100:re.stalls100,max_ms:re.max_ms,incidents:(re.incidents||[]).slice(0,2),draws_max:re.draws_max,reticle_n:re.reticle_n,reticle_p95:re.reticle_p95,match_index:re.match_index,app_secs:re.app_secs,geometries:re.geometries,textures:re.textures,programs:re.programs,tex_mb:re.tex_mb},cost}));
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: 30 s checkpoint + end row (same match), hidden is a pause, stall caught with its phase, quit sends nothing, guest queue bounded, bookkeeping p95 '+cost.p95+' us per frame, single-call max (median of 3) '+cost.call_max+' us');})();
