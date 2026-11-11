// Kill-switch config read (cfg.js, Process V2 §7). The Supabase read is intercepted so each case controls what the server says.
//  1 no row / server down, no cache -> TOPS_SAFE {} (everything on as normal), state 'default'
//  2 remote {"crowd":true} at boot, before any match -> applied at once, cached in this browser
//  3 reload with Supabase down -> the cached value is in place before game4.js runs (TOPS_SAFE seen at game4's first line)
//  4 the row changes during a match: no read during play; read at match end; applied at the next beginMatch, not before
//  5 junk values ignored ("yes", 1, unknown keys, arrays, profile other than 'safe') -> {}
//  6 server hangs: gives up after 4 s, keeps the last good value, no page errors, match still starts
//  7 throttle: two match ends within a minute -> one read
//  8 a broken fetch can't stop a match starting (fault injection)
//  9 first activation logged through TOPS_telemetry with the version (funnel event)
// usage: node tests/kill-cfg.js   (PART=1 cases 1-4, PART=2 cases 5-9; each under ~90 s)
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});
 const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
 let remote=null,hang=false,reads=0;   // remote: null = no row; 'down' = network error; object = the row's value
 await p.route(/jsdelivr|googleapis|gstatic/,r=>r.abort());
 await p.route(/supabase\.co/,async r=>{const u=r.request().url();
  if(!/\/rest\/v1\/tops_config/.test(u))return r.abort();
  reads++;if(hang)return; // never answers
  if(remote==='down')return r.abort();
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(remote===null?[]:[{value:remote}])});});
 // record what game4.js sees at its first line (NET is declared in game4.js; TOPS_SAFE must already exist)
 await ctx.addInitScript(()=>{let seen;Object.defineProperty(window,'NET',{configurable:true,set(v){if(seen===undefined)seen=JSON.stringify(window.TOPS_SAFE);Object.defineProperty(window,'NET',{value:v,writable:true,configurable:true});window.__safeAtGame=seen;},get(){return undefined;}});});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));const f=[];const ok=[];const PART=process.env.PART||'all',A=PART!=='2',B=PART!=='1';
 const okp=ok.push.bind(ok);ok.push=x=>{console.log('ok  '+x);return okp(x);};
 const load=async(clear)=>{await p.goto('file://'+path.resolve(__dirname,'../index.html'));if(clear){await p.evaluate(()=>localStorage.clear());await p.reload();}await p.waitForTimeout(2500);};
 const st=()=>p.evaluate(()=>({safe:JSON.stringify(TOPS_SAFE),src:TOPS_SAFE_STATE.src,pending:JSON.stringify(TOPS_SAFE_STATE.pending),cache:localStorage.getItem('tops_cfg_safe'),at:window.__safeAtGame}));
 const start=()=>p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};if(!career())newCareer();const c=career();c.stage=null;c.tier=1;
  beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:60,legs:3});return !!S&&!S.done;});
 const end=()=>p.evaluate(()=>{try{endMatch();}catch(e){}});
 if(A){
 // 1
 remote=null;await load(true);let s=await st();
 if(s.safe!=='{}'||s.src==='cache')f.push('1 no row: '+JSON.stringify(s));else ok.push('1 no row -> {} ('+s.src+')');
 // 2
 remote={crowd:true};await load(true);s=await st();
 if(s.safe!=='{"crowd":true}'||s.src!=='remote'||!/crowd/.test(s.cache||''))f.push('2 boot remote: '+JSON.stringify(s));else ok.push('2 boot remote applied before first match, cached');
 // 3
 remote='down';await load(false);s=await st();
 if(s.safe!=='{"crowd":true}'||s.src!=='cache'||s.at!=='{"crowd":true}')f.push('3 cache before game4: '+JSON.stringify(s));else ok.push('3 Supabase down: cached value set before game4.js ran');
 // 4 (the real flow: the row changes while a match is on; the game reads only at match end, then applies at the next start)
 remote={crowd:true};await load(true);
 if(!await start())f.push('4 match did not start');
 const r4=reads;remote={venueFx:true};await p.waitForTimeout(3000);
 if(reads!==r4)f.push('4 read during play: '+(reads-r4));
 s=await st();if(s.safe!=='{"crowd":true}')f.push('4 changed mid-match: '+s.safe);
 await p.evaluate(()=>{TOPS_SAFE_STATE.fetchedAt=0;});await end();
 for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>!TOPS_SAFE_STATE.busy&&TOPS_SAFE_STATE.pending))break;}s=await st();
 if(s.safe!=='{"crowd":true}')f.push('4 applied at match end, not next start: '+s.safe);
 if(s.pending!=='{"venueFx":true}')f.push('4 not pending after match end: '+JSON.stringify(s));
 await start();s=await st();if(s.safe!=='{"venueFx":true}'||s.pending!=='null')f.push('4 next beginMatch: '+JSON.stringify(s));else ok.push('4 no read during play; read at match end; applied at the next beginMatch');
 await end();
 }
 if(B){
 // 5 (one page, before any match: each forced read applies at once)
 remote={};await load(true);
 const waitIdle=async()=>{for(let i=0;i<40;i++){await p.waitForTimeout(150);if(!await p.evaluate(()=>TOPS_SAFE_STATE.busy))break;}};
 for(const junk of [{crowd:'yes',venueFx:1,simpleFigures:'true',foo:true,profile:'SAFE'},[true],'{"crowd":true}',{profile:'safe',telemetry:'off'},{crowd:true,venueFx:false,telemetry:'minimal'}]){
  remote=junk;await p.evaluate(()=>TOPS_SAFE_refresh(true));await waitIdle();s=await st();
  const want=Array.isArray(junk)||typeof junk!=='object'?'{}':junk.profile==='safe'?'{"profile":"safe"}':junk.crowd===true?'{"crowd":true,"telemetry":"minimal"}':'{}';
  if(s.safe!==want)f.push('5 '+JSON.stringify(junk)+' -> '+s.safe+' (want '+want+')');}
 if(!f.some(x=>x.startsWith('5')))ok.push('5 only true / "safe" / "minimal" count; strings, numbers, arrays, unknown keys ignored');
 // 6 (same page)
 remote={simpleFigures:true};await p.evaluate(()=>TOPS_SAFE_refresh(true));await waitIdle();hang=true;
 await p.evaluate(()=>TOPS_SAFE_refresh(true));await p.waitForTimeout(4600);s=await st();
 const busy=await p.evaluate(()=>TOPS_SAFE_STATE.busy);
 if(busy||s.safe!=='{"simpleFigures":true}')f.push('6 hang: busy '+busy+' '+JSON.stringify(s));
 hang=false;if(!await start())f.push('6 match did not start after Supabase hung');else ok.push('6 hanging server: gives up at 4 s, keeps the last value, match starts');
 await end();
 // 7 (same page; a read just happened at match end)
 remote={};await p.waitForTimeout(800);const r0=reads;
 await start();await end();await p.waitForTimeout(300);await start();await end();await p.waitForTimeout(500);
 if(reads-r0>0)f.push('7 throttle: '+(reads-r0)+' reads after boot within a minute (want 0: boot read was <60 s ago)');else ok.push('7 at most one read a minute');
 // 8
 await p.evaluate(()=>{window.fetch=()=>{throw new Error('boom');};TOPS_SAFE_STATE.fetchedAt=0;TOPS_SAFE_STATE.pending={crowd:true};});
 if(!await start())f.push('8 match did not start with a broken fetch');else ok.push('8 broken fetch: match still starts');
 await end();
 // 9
 const ev=await p.evaluate(()=>{save.funnel=[];TOPS_telemetry('safe_switch',{k:'crowd'});const e=save.funnel.find(x=>x.e==='safe_switch');return e&&e.d;});
 if(!ev||ev.k!=='crowd'||!ev.v)f.push('9 telemetry event: '+JSON.stringify(ev));else ok.push('9 TOPS_telemetry -> funnel event with version '+ev.v);
 }
 const pe=errs.filter(e=>!/boom/.test(e));if(pe.length)f.push('page errors: '+pe.slice(0,3).join(' | '));
 console.log(f.length?'FAIL:\n- '+f.join('\n- '):'PASS: kill-switch config read');await b.close();process.exit(f.length?1:0);})();
