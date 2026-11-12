// v14 flight recorder (Overseer 08:01; ChatGPT design 8.1 -> P0s fixed). Runs in under 2 minutes (rule 29.1). Real page, network stubbed:
//  - boot event with version and coarse device; screens, match start/end with resource snapshots naming cached character templates
//  - darts summarised per visit; a thrown error and console.error are kept locally at once (incident slot) and uploaded; a burst of errors
//    coalesces (no second upload inside 60 s); the recorder's own uploads aren't logged
//  - hidden = keep + keepalive send to tops_log; pagehide repeats with the same upload_id; failed uploads stay in the slot and retry
//  - body under 48 KiB; ring capped at 300 with a dropped count; fetch failures logged without query strings
// usage: node tests/flight-log.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>{if(!/flight-test/.test(e.message))errs.push(e.message);});
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const f=[];
 const boot=await p.evaluate(()=>{const e=TOPS_LOG.events().find(x=>x.k==='boot');return e&&e.d;});if(!boot||!boot.v||!boot.os||!boot.br||boot.page==='<id>')f.push('no boot event with version and device: '+JSON.stringify(boot));
 // stub the signed-in client: inserts captured; keepalive fetches to tops_log captured
 await p.evaluate(()=>{window.__ins=[];window.__ka=[];NET.user={id:'u1'};NET.sb={supabaseUrl:'https://x.supabase.co',supabaseKey:'k',from:t=>({insert:(r)=>{__ins.push([t,JSON.parse(JSON.stringify(r))]);return Promise.resolve({error:window.__failIns?{message:'nope'}:null});}}),auth:{getSession:()=>Promise.resolve({data:{session:{access_token:'tok'}}})}};
  const f0=window.fetch;window.fetch=function(u,o){if(/tops_log/.test(String(u))){__ka.push({u:String(u),keepalive:o&&o.keepalive,n:o&&o.body?o.body.length:0,id:o&&o.body?JSON.parse(o.body).upload_id:null});return Promise.resolve(new Response(null,{status:201}));}return f0.apply(this,arguments);};
  save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;TOPS_LOG.retry();});
 await p.waitForTimeout(500);
 // a match: start, three darts (one visit), an error and a console.error, end
 await p.evaluate(()=>{window.__ins0=__ins.length;beginMatch({mode:'career',tier:1,p0:'P',oppName:'Phil Taylor',oppAvg:60,legs:1});});await p.waitForTimeout(2500);
 await p.evaluate(()=>{if(S.bull)S.bull=null;S.busy=false;S.cur=0;const tg=targetPoint('T20');for(let i=0;i<3;i++){try{land(tg.x,tg.y);}catch(e){}}});
 await p.evaluate(()=>{setTimeout(()=>{throw new Error('flight-test boom');},0);});await p.waitForTimeout(300);
 const inc=await p.evaluate(()=>{const q=JSON.parse(localStorage.getItem('tops_logq')||'[]');return q.find(r=>r.reason==='error')||null;});
 if(!inc||!inc.events.some(e=>e.k==='error'&&/flight-test/.test(e.d&&e.d.m)))f.push('the error was not kept locally at once');
 await p.evaluate(()=>{console.error('flight-test console');console.error('flight-test again');});
 // Q&D 08:23 / 11:00 rule: nothing uploads during play; the error row waits on disk for the next break
 await p.waitForTimeout(4000);const during=await p.evaluate(()=>__ins.slice(__ins0).filter(x=>x[0]==='tops_log').length);
 if(during)f.push('an upload went during play: '+JSON.stringify(await p.evaluate(()=>__ins.slice(__ins0).map(x=>[x[0],x[1].reason]))));
 await p.evaluate(()=>{S.won=true;endMatch();});/* the match ends: the held error upload goes now */
 let up1=0;for(let i=0;i<20&&!up1;i++){await p.waitForTimeout(500);up1=await p.evaluate(()=>__ins.filter(x=>x[0]==='tops_log'&&x[1].reason==='error').length);}
 const qLeft=await p.evaluate(()=>TOPS_LOG.queue().filter(r=>r.reason==='error').length);if(up1===1&&qLeft)f.push('the uploaded incident stayed queued (duplicate copy): '+qLeft);if(up1!==1)f.push('error uploads after the match ended: '+up1+' (want exactly 1, coalesced) '+JSON.stringify(await p.evaluate(()=>({e:TOPS_LOG._err(),ins:__ins.map(x=>[x[0],x[1].reason]),user:!!NET.user}))));
 await p.waitForTimeout(5500);/* match already ended above */
 const me=await p.evaluate(()=>{const r=__ins.filter(x=>x[0]==='tops_log'&&x[1].reason==='match_end').map(x=>x[1]);const last=r[r.length-1];return last?{n:r.length,ev:last.events,bytes:last.bytes}:null;});
 if(!me)f.push('no match_end upload');else{const k=me.ev.map(e=>e.k);for(const want of ['match_start','visit','error','console_error','match_end','res'])if(!k.includes(want))f.push('match_end upload has no '+want+' event');
  const rs=me.ev.filter(e=>e.k==='res').map(e=>e.d);if(!rs.some(r=>r.w==='start'&&r.chars!=null&&r.char_ids!=null&&r.geo!=null))f.push('resource snapshot lacks GPU counts or cached characters: '+JSON.stringify(rs[0]));
  const vs=me.ev.find(e=>e.k==='visit');if(!vs||String(vs.d.s).split(' ').length!==3)f.push('darts not summarised per visit: '+JSON.stringify(vs));
  if(me.ev.some(e=>/tops_log/.test(JSON.stringify(e.d||''))))f.push("the recorder logged its own upload");}
 const after=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,1200));return TOPS_LOG.events().some(e=>e.k==='res'&&e.d.w==='after');});if(!after)f.push('no resource snapshot after leaving the match');
 // hidden: kept + keepalive; pagehide repeats with the same id
 const hid=await p.evaluate(async()=>{let hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('pagehide'));await new Promise(r=>setTimeout(r,300));
  const kept=JSON.parse(localStorage.getItem('tops_logq')||'[]').some(r=>r.reason==='pagehide');hidden=false;document.dispatchEvent(new Event('visibilitychange'));return {ka:__ka.slice(),kept};});
 if(hid.ka.length<1||!hid.ka.every(x=>x.keepalive))f.push('hidden/pagehide: no keepalive send '+JSON.stringify(hid.ka));else if(new Set(hid.ka.map(x=>x.id)).size!==1)f.push('hidden and pagehide sent different upload ids (duplicates)');
 if(hid.ka.some(x=>x.n>48*1024))f.push('keepalive body over 48 KiB');
 // a failed upload stays in its slot and is retried
 const rt=await p.evaluate(async()=>{localStorage.setItem('tops_logq','[]');window.__failIns=true;TOPS_LOG.upload('match_end');await new Promise(r=>setTimeout(r,3500));const kept=TOPS_LOG.queue().some(r=>r.reason==='match_end');window.__failIns=false;const n0=__ins.length;TOPS_LOG.retry();await new Promise(r=>setTimeout(r,300));return {kept,retried:__ins.length>n0,gone:!TOPS_LOG.queue().some(r=>r.reason==='match_end')};});
 if(!rt.kept)f.push('a failed upload lost its evidence');if(!rt.retried||!rt.gone)f.push('the kept row was not retried and released: '+JSON.stringify(rt));
 // two incidents while uploads fail: the first is not replaced
 const two=await p.evaluate(async()=>{localStorage.setItem('tops_logq','[]');window.__failIns=true;TOPS_LOG.log('x','A marker');TOPS_LOG.incident(true);await new Promise(r=>setTimeout(r,200));const a=TOPS_LOG.queue().filter(r=>r.reason==='error').map(r=>r.upload_id);
   TOPS_LOG.log('x','B marker');TOPS_LOG.incident(true);await new Promise(r=>setTimeout(r,200));const b=TOPS_LOG.queue().filter(r=>r.reason==='error');window.__failIns=false;return {a,b:b.map(r=>r.upload_id),aHasA:b.some(r=>JSON.stringify(r.events).includes('A marker'))};});
 if(!two.a.length||!two.b.includes(two.a[0])||!two.aHasA)f.push('an unsent incident was replaced or lost: '+JSON.stringify(two));
 // in-flight refresh: incident A is uploading when more errors arrive; A's success must not delete the newer evidence (new id)
 const inf=await p.evaluate(async()=>{localStorage.setItem('tops_logq','[]');let resolveA;const orig=NET.sb.from;NET.sb.from=t=>({insert:(r)=>{__ins.push([t,JSON.parse(JSON.stringify(r))]);return new Promise(res=>{resolveA=()=>res({error:null});});}});
   const A=TOPS_LOG.row('error');A.reason='error';const qa=[A];localStorage.setItem('tops_logq',JSON.stringify(qa));TOPS_LOG.retry();await new Promise(r=>setTimeout(r,50));
   const refreshed=Object.assign(TOPS_LOG.row('error'),{upload_id:A.upload_id});TOPS_LOG._keep(refreshed);const ids=TOPS_LOG.queue().map(r=>r.upload_id);
   resolveA();await new Promise(r=>setTimeout(r,50));NET.sb.from=orig;const left=TOPS_LOG.queue();return {ids,left:left.map(r=>r.upload_id),aId:A.upload_id};});
 if(!(inf.left.length===1&&inf.left[0]!==inf.aId))f.push('in-flight refresh lost the newer evidence or reused the sent id: '+JSON.stringify(inf));
 // queue full: a 4th unsent incident is not added over the 3 (counted), the 3 stay
 const full=await p.evaluate(()=>{localStorage.setItem('tops_logq','[]');for(let i=0;i<4;i++){const r=TOPS_LOG.row('error');TOPS_LOG._keep(r);}const q=TOPS_LOG.queue().filter(r=>r.reason==='error').length;return {q,diag:TOPS_LOG.row('error').diag};});
 if(full.q!==3||!(full.diag.inc_overflow>=1))f.push('queue full not handled: '+JSON.stringify(full));
 // redaction before the ring
 const red=await p.evaluate(()=>{console.error('login failed for joe@example.com token=abc123secret Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');return JSON.stringify(TOPS_LOG.events().slice(-3));});
 if(/joe@example|abc123secret|eyJhbGci/.test(red))f.push('secrets reached the ring: '+red.slice(0,200));
 // strict body cap with huge unicode events
 const big=await p.evaluate(()=>{for(let i=0;i<300;i++)TOPS_LOG.log('x',{m:'表'.repeat(400),i});const r=TOPS_LOG.row('error');const w=Object.assign({},r);delete w.made;delete w.rev;/* the body actually sent */return {bytes:new TextEncoder().encode(JSON.stringify(w)).length,claimed:r.bytes,trimmed:r.trimmed_events};});
 if(big.bytes>48*1024)f.push('body over 48 KiB with unicode: '+JSON.stringify(big));if(big.bytes!==big.claimed)f.push('bytes field does not match the body: '+JSON.stringify(big));
 // rapid transition: a match starting within 1.5 s gets no 'after' snapshot from the previous one
 const rap=await p.evaluate(async()=>{beginMatch({mode:'career',tier:1,p0:'P',oppName:'A',oppAvg:60,legs:1});await new Promise(r=>setTimeout(r,300));S.won=true;endMatch();beginMatch({mode:'career',tier:1,p0:'P',oppName:'B',oppAvg:60,legs:1});await new Promise(r=>setTimeout(r,2000));
   const ev=TOPS_LOG.events();const startB=ev.filter(e=>e.k==='match_start').pop();const afterA=ev.filter(e=>e.k==='res'&&e.d.w==='after'&&e.q>startB.q);return {after:afterA.length};});
 if(rap.after)f.push('a previous match\'s after-cleanup snapshot landed inside the next match');
 // CAR-8: match_end carries this match's result, decided by the game's own endMatch (not the previous match's S.won)
 const res8=await p.evaluate(async()=>{const out=[];const end=(me,op,stale)=>{beginMatch({mode:'career',tier:1,p0:'P',oppName:'R'+out.length,oppAvg:60,legs:3});S.p[0].legs=me;S.p[1].legs=op;S.won=stale;endMatch();const e=TOPS_LOG.events().filter(x=>x.k==='match_end').pop();out.push({me,op,won:e&&e.d.won,how:e&&e.d.how,legs:e&&e.d.legs});};
   end(2,0,false);await new Promise(r=>setTimeout(r,300));end(0,2,true);await new Promise(r=>setTimeout(r,300));end(2,1,false);await new Promise(r=>setTimeout(r,300));end(1,2,true);await new Promise(r=>setTimeout(r,300));
   // a quit straight after a win: no result carried over
   beginMatch({mode:'career',tier:1,p0:'P',oppName:'Q',oppAvg:60,legs:3});S.won=true;document.getElementById('btnQuit').click();await new Promise(r=>setTimeout(r,300));const q=TOPS_LOG.events().filter(x=>x.k==='match_end').pop();out.push({quit:1,won:q&&q.d.won,how:q&&q.d.how});return out;});
 [[0,true],[1,false],[2,true],[3,false]].forEach(([i,w])=>{if(res8[i].won!==w)f.push('match_end won '+JSON.stringify(res8[i].won)+' for legs '+res8[i].me+'-'+res8[i].op+' (want '+w+')');});
 if(res8[4].how!=='quit'||res8[4].won===true)f.push('a quit after a win logs '+JSON.stringify(res8[4]));
 // sign-out: no keepalive with the old token
 const so=await p.evaluate(async()=>{const n0=__ka.length;NET.user=null;await new Promise(r=>setTimeout(r,100));let hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});document.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setTimeout(r,200));hidden=false;document.dispatchEvent(new Event('visibilitychange'));NET.user={id:'u1'};return __ka.length-n0;});
 if(so)f.push('sent with a token after sign-out');
 // ring cap, dropped count, size cap, fetch failures without query strings
 const cap=await p.evaluate(async()=>{for(let i=0;i<400;i++)TOPS_LOG.log('x','y'.repeat(150));try{await fetch('http://127.0.0.1:9/nowhere?token=secret');}catch(e){}const r=TOPS_LOG.row('error');return {n:TOPS_LOG.events().length,dropped:TOPS_LOG.dropped,bytes:r.bytes,q:JSON.stringify(TOPS_LOG.events()).includes('token=secret'),nf:TOPS_LOG.events().some(e=>e.k==='net_fail')};});
 if(cap.n!==300)f.push('ring not capped at 300: '+cap.n);if(cap.dropped<100)f.push('dropped count missing: '+cap.dropped);if(cap.bytes>48*1024)f.push('row over 48 KiB: '+cap.bytes);if(cap.q)f.push('a query string was logged');if(!cap.nf)f.push('fetch failure not logged');
 // ChatGPT r4 P0-1/P0-2/P0-3 and P1-4: the send-time guard, rapid match transition and a foreign-key 409
 const r4=await p.evaluate(async()=>{const out={};const sent=[];let mode='ok';
  NET.sb.from=t=>({insert:(r)=>{if(t==='tops_log')sent.push({id:r.upload_id,reason:r.reason,t:Date.now()});/* CAR-5: only the recorder's own rows (tops_perf's sends used to be counted here) */if(mode==='fk')return Promise.resolve({error:{code:'23503',message:'insert or update on table violates foreign key constraint'},status:409});return Promise.resolve({error:null,status:201});}});
  localStorage.setItem('tops_logq','[]');
  // rapid transition: match A ends, B starts at once -> A's row is built before B and nothing is sent while B is in play
  beginMatch({mode:'career',tier:1,p0:'P',oppName:'A',oppAvg:60,legs:9});await new Promise(r=>setTimeout(r,600));const midA=TOPS_LOG.events().filter(e=>e.k==='match_start').pop();
  S.won=true;endMatch();beginMatch({mode:'career',tier:1,p0:'P',oppName:'B',oppAvg:60,legs:9});const q1=TOPS_LOG.queue().filter(r=>r.reason==='match_end');
  out.builtBeforeB=q1.length===1&&!q1[0].events.some(e=>e.k==='match_start'&&e.d&&e.d.opp==='B');
  await new Promise(r=>setTimeout(r,3500));out.sentDuringB=sent.length;if(S.bull)S.bull=null;S.cur=0;/* B's opening who-throws-first card answered, as a player's tap */
  // quiet window closes: a leg ends while the player is already pulling -> nothing; pull ends but no break -> nothing; next real leg end -> sent
  S.busy=false;S.pulling=true;try{endLeg();}catch(e){}await new Promise(r=>setTimeout(r,6500));out.sentWhilePulling=sent.length;/* the window has 15 s; the pull is held through the start of it */
  S.pulling=false;await new Promise(r=>setTimeout(r,1000));out.sentAfterPullNoBreak=sent.length;
  S.busy=false;if(S.bull)S.bull=null;try{endLeg();}catch(e){}await new Promise(r=>setTimeout(r,900));if(!S.bull)S.bull={me:1,op:2};/* the next leg's who-throws-first card, as the game shows it after a leg (this harness doesn't) */await new Promise(r=>setTimeout(r,5100));out.sentAtBreak=sent.length;out.sentReason=sent.map(x=>x.reason).join(',');
  // foreign-key 409: not counted as stored; the row stays queued
  S.won=true;endMatch();mode='fk';await new Promise(r=>setTimeout(r,4000));
  out.fkQueued=TOPS_LOG.queue().length;out.fkTried=sent.length;mode='ok';return out;});
 if(!r4.builtBeforeB)f.push('match-end row not built before the next match: '+JSON.stringify(r4));
 if(r4.sentDuringB||r4.sentWhilePulling||r4.sentAfterPullNoBreak)f.push('sent during play: '+JSON.stringify(r4));
 if(r4.sentAtBreak<1)f.push('held rows not sent at the next real leg break: '+JSON.stringify(r4));
 if(r4.fkQueued<1)f.push('a foreign-key 409 was treated as stored: '+JSON.stringify(r4));
 // ChatGPT r5 P0: a built row never changes, even when the coalescer updates the ring event it came from
 const imm=await p.evaluate(()=>{TOPS_LOG.log('net_fail',{u:'/imm/test.mp3',err:'Failed to fetch',ms:3});const r=TOPS_LOG.row('error');const before=JSON.stringify(r);
  TOPS_LOG.log('net_fail',{u:'/imm/test.mp3',err:'Failed to fetch',ms:4});TOPS_LOG.log('net_fail',{u:'/imm/test.mp3',err:'Failed to fetch',ms:5});
  const ring=TOPS_LOG.events().filter(e=>e.k==='net_fail'&&e.d&&e.d.u==='/imm/test.mp3').pop();return {same:JSON.stringify(r)===before,ringN:ring&&ring.n};});
 if(!imm.same)f.push('a built row changed after the ring event was coalesced: '+JSON.stringify(imm));
 if(!(imm.ringN>=2))f.push('coalescing did not happen (test not exercised): '+JSON.stringify(imm));
 // ChatGPT r5 P1: only a unique violation on upload_id counts as stored
 const dupk=await p.evaluate(async()=>{const of=NET.sb.from;localStorage.setItem('tops_logq','[]');const out={};
  for(const [name,err] of [['upload_id',{code:'23505',message:'duplicate key value violates unique constraint "tops_log_upload_id_key"'}],['other',{code:'23505',message:'duplicate key value violates unique constraint "tops_log_other_key"'}]]){
   NET.sb.from=t=>({insert:(r)=>Promise.resolve({error:err,status:409})});const r=TOPS_LOG.row('error');TOPS_LOG._keep(r);TOPS_LOG.retry();await new Promise(z=>setTimeout(z,500));
   out[name]=TOPS_LOG.queue().some(x=>x.upload_id===r.upload_id);}NET.sb.from=of;return out;});
 if(dupk.upload_id!==false||dupk.other!==true)f.push('unique-violation handling (want upload_id: released, other: kept): '+JSON.stringify(dupk));
 // ChatGPT r3 P0-1: storage writes fail while reads still work (quota): a new incident must live in memory, be read back and upload
 const memc=await p.evaluate(async()=>{const old=[{upload_id:'disk-old',reason:'error',rev:1,events:[]}];localStorage.setItem('tops_logq',JSON.stringify(old));
  const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='tops_logq')throw new DOMException('full','QuotaExceededError');return set.call(this,k,v);};
  window.__ins2=[];const of=NET.sb.from;NET.sb.from=t=>({insert:(r)=>{__ins2.push(JSON.parse(JSON.stringify(r)));return Promise.resolve({error:{code:'08006',message:'offline'},status:0});}});
  let res;try{TOPS_LOG.log('error',{m:'mem-test'});const r=TOPS_LOG.row('error');const kept=TOPS_LOG._keep(r);const q=TOPS_LOG.queue();
   res={kept,inQueue:q.some(x=>x.upload_id===r.upload_id),diskOnly:JSON.parse(localStorage.getItem('tops_logq')).length,persist:r.diag&&r.diag.persist,id:r.upload_id};}
  finally{Storage.prototype.setItem=set;}
  // storage works again: the memory queue (with the new incident) uploads on the next retry
  NET.sb.from=t=>({insert:(r)=>{__ins2.push(JSON.parse(JSON.stringify(r)));return Promise.resolve({error:null,status:201});}});TOPS_LOG.retry();await new Promise(r=>setTimeout(r,800));
  res.uploaded=__ins2.some(x=>x.upload_id===res.id);NET.sb.from=of;return res;});
 if(!memc.kept||!memc.inQueue||!memc.uploaded)f.push('memory fallback: '+JSON.stringify(memc));
 const mp=await p.evaluate(()=>{const r=TOPS_LOG.row('error');const d=r.diag;const S2=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='tops_logq')throw new Error('q');return S2.call(this,k,v);};try{TOPS_LOG._keep(TOPS_LOG.row('error'));return TOPS_LOG.row('error').diag.persist;}finally{Storage.prototype.setItem=S2;}});
 if(mp!=='memory')f.push('diag.persist after a failed write: '+mp);
 // ChatGPT r3 P1-2: bytes = the body actually sent (local fields stripped)
 const by=await p.evaluate(()=>{const r=TOPS_LOG.row('error');const w=Object.assign({},r);delete w.made;delete w.rev;return {bytes:r.bytes,real:new TextEncoder().encode(JSON.stringify(w)).length};});
 if(by.bytes!==by.real)f.push('bytes field '+by.bytes+' vs sent body '+by.real);
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 console.log(JSON.stringify({kinds:me&&me.ev.reduce((a,e)=>(a[e.k]=(a[e.k]||0)+1,a),{}),sample:me&&me.ev.filter(e=>e.k==="warn"||e.k==="net_fail").slice(0,3),boot,res:me&&me.ev.filter(e=>e.k==='res').map(e=>e.d).slice(0,2),bytes:me&&me.bytes,cap}));
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: boot, match, per-visit darts, errors kept at once and coalesced, resource snapshots with cached characters, hidden+pagehide one keepalive id, failed upload kept and retried, ring 300, body <48 KiB, no query strings');})();
