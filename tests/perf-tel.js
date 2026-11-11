// v13 live performance telemetry (Hayden 06:54; ChatGPT 9.0). A real career match through beginMatch / the game's frames / endMatch,
// with the network stubbed so the rows can be read back:
//  - a 30 s checkpoint row (threshold shortened for the test) uploaded at a safe moment, then an end row with the same match_id, status complete
//  - hidden is a pause: a local checkpoint is stored, resuming keeps the match, the hidden time isn't counted, the finished match replaces it
//  - an injected 120 ms main-thread stall shows up as stalls100 and an incident with the game phase
//  - a quit before 30 frames sends nothing; guests' rows wait in a bounded local queue
//  - cost: the per-frame bookkeeping p95 < 0.05 ms and max < 0.5 ms (bench, median of 3 runs), and no raw user-agent in the row
//  - every row: version, match index, standalone flag, 10-bin frame histogram summing to frame_n, under 5 KB; the 5 KB guard trims an oversized row
// usage: node tests/perf-tel.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files','--js-flags=--expose-gc']});const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
 const f=[];
 await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;
  window.__rows=[];NET.user={id:'u1'};NET.sb={from:()=>({upsert:(rows)=>{__rows.push(...JSON.parse(JSON.stringify(rows)));return Promise.resolve({error:null});}}),auth:{getSession:()=>Promise.resolve({data:{}})}};
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
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 console.log(JSON.stringify({r30:r30&&{fps:r30.fps,p95:r30.p95,frame_n:r30.frame_n,dev:r30.dev,reticle_n:r30.reticle_n},end:re&&{status:re.status,stalls100:re.stalls100,max_ms:re.max_ms,incidents:(re.incidents||[]).slice(0,2),draws_max:re.draws_max,reticle_n:re.reticle_n,reticle_p95:re.reticle_p95,match_index:re.match_index,app_secs:re.app_secs,geometries:re.geometries,textures:re.textures,programs:re.programs,tex_mb:re.tex_mb},cost}));
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: 30 s checkpoint + end row (same match), hidden is a pause, stall caught with its phase, quit sends nothing, guest queue bounded, bookkeeping p95 '+cost.p95+' us per frame, single-call max (median of 3) '+cost.call_max+' us');})();
