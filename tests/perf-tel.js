// v13 live performance telemetry (Hayden 06:54; ChatGPT 9.0). A real career match through beginMatch / the game's frames / endMatch,
// with the network stubbed so the rows can be read back:
//  - a 30 s checkpoint row (threshold shortened for the test) uploaded at a safe moment, then an end row with the same match_id, status complete
//  - hidden is a pause: a local checkpoint is stored, resuming keeps the match, the hidden time isn't counted, the finished match replaces it
//  - an injected 120 ms main-thread stall shows up as stalls100 and an incident with the game phase
//  - a quit before 30 frames sends nothing; guests' rows wait in a bounded local queue
//  - cost: the per-frame bookkeeping p95 < 0.05 ms and max < 0.5 ms (bench), and no raw user-agent in the row
// usage: node tests/perf-tel.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
 const f=[];
 await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;
  window.__rows=[];NET.user={id:'u1'};NET.sb={from:()=>({upsert:(rows)=>{__rows.push(...JSON.parse(JSON.stringify(rows)));return Promise.resolve({error:null});}}),auth:{getSession:()=>Promise.resolve({data:{}})}};
  window.TOPS_PERF_30=3000;beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:60,legs:3});});
 await p.waitForTimeout(2500);await p.evaluate(()=>{if(S&&S.bull)S.bull=null;S.busy=false;S.cur=0;/* the 'who throws first, tap to continue' card, as a player's tap */});
 // aim input (real pointer events) so the reticle latency has samples
 await p.evaluate(()=>{for(let k=0;k<5;k++)setTimeout(()=>window.dispatchEvent(new PointerEvent('pointermove',{pointerType:'touch',pointerId:3,clientX:200+k,clientY:300,bubbles:true})),k*400);});
 // wait for the 30 s checkpoint (3 s here) to upload at a safe moment
 for(let i=0;i<40;i++){await p.waitForTimeout(500);if(await p.evaluate(()=>__rows.some(r=>r.phase==='30s')))break;}
 const r30=await p.evaluate(()=>__rows.find(r=>r.phase==='30s')||null);
 if(!r30)f.push('no 30 s checkpoint row');else{if(r30.status!=='partial')f.push('30 s row status '+r30.status);for(const k of ['ver','match_id','sample_id','fps','p95','frame_n','visible_secs','dev'])if(r30[k]==null)f.push('30 s row missing '+k);
  if(r30.dev&&(r30.dev.ua||/Mozilla\//.test(JSON.stringify(r30))))f.push('raw user-agent stored');if(!r30.dev||!r30.dev.device_class)f.push('no device_class');}
 // hidden = pause: checkpoint stored locally, no network; then resume
 const hid=await p.evaluate(async()=>{const n0=__rows.length;const vis0=TOPS_perf.m.vis;let hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});document.dispatchEvent(new Event('visibilitychange'));
  const q=TOPS_perf.queue().filter(r=>String(r.sample_id).startsWith('ck-'));await new Promise(r=>setTimeout(r,2000));const visHidden=TOPS_perf.m.vis-vis0;
  hidden=false;document.dispatchEvent(new Event('visibilitychange'));return {ck:q.length,net:__rows.length-n0,visHidden,still:!!TOPS_perf.m&&!TOPS_perf.m.done,mid:TOPS_perf.m&&TOPS_perf.m.id};});
 if(hid.ck!==1)f.push('hidden: no local checkpoint ('+hid.ck+')');if(hid.net)f.push('hidden: sent to the network');if(hid.visHidden>50)f.push('hidden time counted as play: '+hid.visHidden+' ms');if(!hid.still)f.push('hidden ended the match');
 await p.waitForTimeout(1500);
 // injected 120 ms stall during the next frame
 await p.evaluate(()=>{requestAnimationFrame(()=>{const t=performance.now();while(performance.now()-t<120);});});await p.waitForTimeout(2500);
 const mid=await p.evaluate(()=>({c100:TOPS_perf.m.c100,inc:TOPS_perf.m.inc.slice()}));
 if(mid.c100<1)f.push('injected 120 ms stall not counted');if(!mid.inc.some(i=>i.f>=100&&i.ph))f.push('no incident with a phase for the stall: '+JSON.stringify(mid.inc.slice(0,3)));
 // end the match
 const end=await p.evaluate(async()=>{S.won=true;endMatch();await new Promise(r=>setTimeout(r,5000));return {rows:__rows.filter(r=>r.phase==='end'),q:TOPS_perf.queue()};});
 const re=end.rows[0];if(end.rows.length!==1)f.push('end rows: '+end.rows.length);else{if(re.status!=='complete')f.push('end status '+re.status);if(r30&&re.match_id!==r30.match_id)f.push('30 s and end rows have different match ids');if(re.stalls100<1)f.push('end row lost the stall');if(!(re.reticle_n>=1))f.push('no reticle latency samples from the aim input: '+re.reticle_n);}
 if(end.q.some(r=>String(r.sample_id).startsWith('ck-')))f.push('the hidden checkpoint was not replaced by the finished match');
 // short match quit: nothing sent; guest: queued, bounded
 const g=await p.evaluate(async()=>{const n0=__rows.length;beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:60,legs:1});await new Promise(r=>setTimeout(r,300));const q=document.getElementById('btnQuit');if(q)q.click();
  await new Promise(r=>setTimeout(r,2500));const sent=__rows.length-n0;NET.user=null;TOPS_perf.send(Array.from({length:30},(_,i)=>({sample_id:'g'+i,match_id:'m',phase:'end'})));return {sent,q:TOPS_perf.queue().length};});
 if(g.sent)f.push('a quit before 30 frames sent a row');if(g.q>20)f.push('guest queue not bounded: '+g.q);
 const cost=await p.evaluate(()=>TOPS_perf.bench(20000));if(cost.p95>50||cost.max>500)f.push('per-frame bookkeeping too slow: '+JSON.stringify(cost));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 console.log(JSON.stringify({r30:r30&&{fps:r30.fps,p95:r30.p95,frame_n:r30.frame_n,dev:r30.dev,reticle_n:r30.reticle_n},end:re&&{status:re.status,stalls100:re.stalls100,max_ms:re.max_ms,incidents:(re.incidents||[]).slice(0,2),draws_max:re.draws_max,reticle_n:re.reticle_n,reticle_p95:re.reticle_p95},cost}));
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: 30 s checkpoint + end row (same match), hidden is a pause, stall caught with its phase, quit sends nothing, guest queue bounded, bookkeeping p95 '+cost.p95+' us / max '+cost.max+' us per frame');})();
