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
 const boot=await p.evaluate(()=>{const e=TOPS_LOG.events().find(x=>x.k==='boot');return e&&e.d;});if(!boot||!boot.v||!boot.dev)f.push('no boot event with version and device: '+JSON.stringify(boot));
 // stub the signed-in client: inserts captured; keepalive fetches to tops_log captured
 await p.evaluate(()=>{window.__ins=[];window.__ka=[];NET.user={id:'u1'};NET.sb={supabaseUrl:'https://x.supabase.co',supabaseKey:'k',from:t=>({upsert:(r)=>{__ins.push([t,JSON.parse(JSON.stringify(r))]);return Promise.resolve({error:window.__failIns?{message:'nope'}:null});}}),auth:{getSession:()=>Promise.resolve({data:{session:{access_token:'tok'}}})}};
  const f0=window.fetch;window.fetch=function(u,o){if(/tops_log/.test(String(u))){__ka.push({u:String(u),keepalive:o&&o.keepalive,n:o&&o.body?o.body.length:0,id:o&&o.body?JSON.parse(o.body).upload_id:null});return Promise.resolve(new Response(null,{status:201}));}return f0.apply(this,arguments);};
  save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;TOPS_LOG.retry();});
 await p.waitForTimeout(500);
 // a match: start, three darts (one visit), an error and a console.error, end
 await p.evaluate(()=>{beginMatch({mode:'career',tier:1,p0:'P',oppName:'Phil Taylor',oppAvg:60,legs:1});});await p.waitForTimeout(2500);
 await p.evaluate(()=>{if(S.bull)S.bull=null;S.busy=false;S.cur=0;const tg=targetPoint('T20');for(let i=0;i<3;i++){try{land(tg.x,tg.y);}catch(e){}}});
 await p.evaluate(()=>{setTimeout(()=>{throw new Error('flight-test boom');},0);});await p.waitForTimeout(300);
 const inc=await p.evaluate(()=>{const v=localStorage.getItem('tops_log_inc');return v?JSON.parse(v):null;});
 if(!inc||!inc.events.some(e=>e.k==='error'&&/flight-test/.test(e.d&&e.d.m)))f.push('the error was not kept locally at once');
 await p.evaluate(()=>{console.error('flight-test console');console.error('flight-test again');});await p.waitForTimeout(4000);
 const up1=await p.evaluate(()=>__ins.filter(x=>x[0]==='tops_log'&&x[1].reason==='error').length);if(up1!==1)f.push('error uploads in the first minute: '+up1+' (want 1, coalesced)');
 await p.evaluate(()=>{S.won=true;endMatch();});await p.waitForTimeout(5500);
 const me=await p.evaluate(()=>{const r=__ins.filter(x=>x[0]==='tops_log'&&x[1].reason==='match_end').map(x=>x[1]);const last=r[r.length-1];return last?{n:r.length,ev:last.events,bytes:last.bytes}:null;});
 if(!me)f.push('no match_end upload');else{const k=me.ev.map(e=>e.k);for(const want of ['match_start','visit','error','console_error','match_end','res'])if(!k.includes(want))f.push('match_end upload has no '+want+' event');
  const rs=me.ev.filter(e=>e.k==='res').map(e=>e.d);if(!rs.some(r=>r.w==='start'&&r.chars!=null&&r.char_ids!=null&&r.geo!=null))f.push('resource snapshot lacks GPU counts or cached characters: '+JSON.stringify(rs[0]));
  const vs=me.ev.find(e=>e.k==='visit');if(!vs||vs.d.s.length!==3)f.push('darts not summarised per visit: '+JSON.stringify(vs));
  if(me.ev.some(e=>/tops_log/.test(JSON.stringify(e.d||''))))f.push("the recorder logged its own upload");}
 const after=await p.evaluate(async()=>{await new Promise(r=>setTimeout(r,1200));return TOPS_LOG.events().some(e=>e.k==='res'&&e.d.w==='after');});if(!after)f.push('no resource snapshot after leaving the match');
 // hidden: kept + keepalive; pagehide repeats with the same id
 const hid=await p.evaluate(async()=>{let hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('pagehide'));await new Promise(r=>setTimeout(r,300));
  const kept=!!localStorage.getItem('tops_log_ck');hidden=false;document.dispatchEvent(new Event('visibilitychange'));return {ka:__ka.slice(),kept};});
 if(hid.ka.length<1||!hid.ka.every(x=>x.keepalive))f.push('hidden/pagehide: no keepalive send '+JSON.stringify(hid.ka));else if(new Set(hid.ka.map(x=>x.id)).size!==1)f.push('hidden and pagehide sent different upload ids (duplicates)');
 if(hid.ka.some(x=>x.n>48*1024))f.push('keepalive body over 48 KiB');
 // a failed upload stays in its slot and is retried
 const rt=await p.evaluate(async()=>{window.__failIns=true;TOPS_LOG.upload('match_end');await new Promise(r=>setTimeout(r,3500));const kept=!!localStorage.getItem('tops_log_ck');window.__failIns=false;const n0=__ins.length;TOPS_LOG.retry();await new Promise(r=>setTimeout(r,300));return {kept,retried:__ins.length>n0,gone:!localStorage.getItem('tops_log_ck')};});
 if(!rt.kept)f.push('a failed upload lost its evidence');if(!rt.retried||!rt.gone)f.push('the kept row was not retried and released: '+JSON.stringify(rt));
 // ring cap, dropped count, size cap, fetch failures without query strings
 const cap=await p.evaluate(async()=>{for(let i=0;i<400;i++)TOPS_LOG.log('x','y'.repeat(150));try{await fetch('http://127.0.0.1:9/nowhere?token=secret');}catch(e){}const r=TOPS_LOG.row('error');return {n:TOPS_LOG.events().length,dropped:TOPS_LOG.dropped,bytes:r.bytes,q:JSON.stringify(TOPS_LOG.events()).includes('token=secret'),nf:TOPS_LOG.events().some(e=>e.k==='net_fail')};});
 if(cap.n!==300)f.push('ring not capped at 300: '+cap.n);if(cap.dropped<100)f.push('dropped count missing: '+cap.dropped);if(cap.bytes>48*1024)f.push('row over 48 KiB: '+cap.bytes);if(cap.q)f.push('a query string was logged');if(!cap.nf)f.push('fetch failure not logged');
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 console.log(JSON.stringify({kinds:me&&me.ev.reduce((a,e)=>(a[e.k]=(a[e.k]||0)+1,a),{}),sample:me&&me.ev.filter(e=>e.k==="warn"||e.k==="net_fail").slice(0,3),boot,res:me&&me.ev.filter(e=>e.k==='res').map(e=>e.d).slice(0,2),bytes:me&&me.bytes,cap}));
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: boot, match, per-visit darts, errors kept at once and coalesced, resource snapshots with cached characters, hidden+pagehide one keepalive id, failed upload kept and retried, ring 300, body <48 KiB, no query strings');})();
