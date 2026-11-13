// ENG-RESET (Hayden 14:14 / 14:19): after every match, once its result is saved, a fresh page behind a loading screen, on every device.
// node tests/reset.js <dir>   (served over http; rebrand on; real taps for Walk on, the result/reward/pack/message screens and Quit)
// Per profile (iPhone 390, Android 412, desktop 1366), as a guest:
//  1. match 1 played to a win (the player's legs are checked out on D20), then through the result and reward screens to the hub: the page
//     reloads exactly once, only after the match is over (live=false at unload), after the save is written; the hub opens again with no
//     title or login, the loading bar finishes, TOPS_RESET.last.ms is set; career, cards, settings, look, switches identical after it.
//  2. a reset can't run during a match: TOPS_RESET.go() called mid-match does nothing (no reload).
//  3. match 2 quit (Menu, Quit, Forfeit) -> hub -> a second reload; the quit match's perf row carries reset_ms and reset_n (per-OS load time).
// iPhone only, signed-in cases (the game's cloud client replaced by a stub that answers like the server):
//  4. cloud save confirmed -> reset; on the new page an older cloud copy is not adopted over it, a newer one is; 5. cloud save refused ->
//     no reset, hub stays, 'reset_skip' logged; 6. cloud save slower than 5 s -> no reset; 7. another push acknowledged but the reset's own
//     push fails -> no reset; 8. 'Test: no fresh start between matches' on -> no reset.
// iPhone only, guest: 9. a reward card still to show (C3.pending) holds the reset until it's gone; 10. a stale flag (an app closed during
//     the loading screen and reopened later) boots normally.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]||path.join(__dirname,'..'));const ONLY=process.env.ONLY||'';
const types={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.css':'text/css'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(dir,u==='/'?'index.html':u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});}).listen(0);
const URL0=`http://127.0.0.1:${srv.address().port}/index.html`;
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
const T00=Date.now();const out=[];out.push=function(o){console.log(Math.round((Date.now()-T00)/1000)+'s '+JSON.stringify(o));return Array.prototype.push.call(this,o);};const fails=[];const F=(tag,m)=>{console.log(Math.round((Date.now()-T00)/1000)+'s FAIL '+tag+': '+m);fails.push(tag+': '+m);};
const PROF={iphone:{viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent},
 android:{viewport:{width:412,height:915},hasTouch:true,isMobile:true,userAgent:'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'},
 desktop:{viewport:{width:1366,height:768},hasTouch:false,isMobile:false}};
const page=async(prof)=>{const ctx=await b.newContext(PROF[prof]);const p=await ctx.newPage();await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
 const st={loads:0,pe:[]};p.on('pageerror',e=>st.pe.push(e.message));p.on('load',()=>st.loads++);
 await p.addInitScript(()=>{/* speed: no GPU drawing (SwiftShader is CPU) and the game's own timers at 0.2x; the reset's waits run on Date.now, unscaled */
  const iv=setInterval(()=>{try{if(window.V&&V._qa&&V._qa.renderer){V._qa.renderer.render=function(){};clearInterval(iv);}}catch(e){}},50);
  const st0=window.setTimeout;window.__st0=st0;window.setTimeout=(f,ms,...a)=>st0(f,Math.max(0,(ms||0)*0.2),...a);
  try{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem('tops_rebrand','1');localStorage.setItem('tops_q20_app','nowalk');}}catch(e){}
  /* at unload: was a match live, and the state the next page must show */
  addEventListener('beforeunload',()=>{try{const live=typeof S!=='undefined'&&S&&!S.done;sessionStorage.setItem('__snap',JSON.stringify({live,dig:window.__dig?__dig():null}));}catch(e){}});
  window.__dig=()=>{let tc=null;try{tc=JSON.stringify(save.tc||null);}catch(e){}const c=Object.assign({},career()||{});/* next = the next fixture, worked out when the hub asks for it (null right after a match) */delete c.next;return {career:JSON.stringify(c),slot:save.slot||'career',name:save.name,matches:save.matches||0,look:JSON.stringify(save.look||{}),walkon:save.walkon||null,
   tc,audio:localStorage.getItem('doubleout_audio'),q20:localStorage.getItem('tops_q20_app'),rb:localStorage.getItem('tops_rebrand'),saveKeys:Object.keys(save).length};};});
 await p.goto(URL0);return {p,ctx,st};};
const ready=p=>p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&window.TOPS_RESET&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
const hubShown=p=>p.evaluate(()=>{const a=document.getElementById('rbApp');const l=document.getElementById('loading');return !!(a&&!a.hidden&&a.getClientRects().length)&&!!(l&&l.classList.contains('gone'))&&!(typeof S!=='undefined'&&S&&!S.done);});
const fresh=async p=>{await ready(p);await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;newCareer();save.walkon='off';save.tcIntro=1;save.tcWelcomed=1;try{if(save.tc)delete save.tc.welPend;}catch(e){}try{persist();}catch(e){}document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();});
 for(let i=0;i<40;i++){const busy=await p.evaluate(()=>{try{const r=TOPS_RIGS();return !!((r.wait&&r.wait.length)||r.loading);}catch(e){return false;}});if(!busy)break;await p.waitForTimeout(250);}await p.waitForTimeout(800);
 /* the first page's own boot (the blocked sign-in ending on the login or title screen) can land after the setup: back to the hub, as a player's Continue would */
 for(let i=0;i<60;i++){if(await vis(p,'#rbGo'))break;await p.evaluate(()=>{try{$('login').hidden=true;showHub();}catch(e){}});await p.waitForTimeout(500);}};
const vis=(p,sel)=>p.evaluate(sel=>{const e=document.querySelector(sel);return !!(e&&e.getClientRects().length&&!e.disabled&&getComputedStyle(e).visibility!=='hidden');},sel).catch(()=>false);
const tap=async(p,sel,touch)=>{if(!(await vis(p,sel)))return false;try{if(touch)await p.locator(sel).first().tap({timeout:10000});else await p.locator(sel).first().click({timeout:10000});return true;}catch(e){tap.err=e.message.split('\n')[0];return false;}};
const toAim=async(p,touch)=>{await tap(p,'#tcWelLater',touch);await p.waitForTimeout(300);if(!(await tap(p,'#rbGo',touch)))return 'no Walk on: '+(tap.err||'')+' '+(await p.evaluate(()=>{const e=document.getElementById('rbGo');if(!e)return 'none';const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);let ch=[];for(let c=t,i=0;c&&i<6;i++,c=c.parentElement)ch.push(c.id||(typeof c.className==='string'&&c.className)||c.tagName);return JSON.stringify({r:[r.x,r.y,r.width,r.height],top:ch.join('<'),login:!document.getElementById('login').hidden,ld:document.getElementById('loading').className,scr:[...document.querySelectorAll('.screen')].filter(x=>!x.hidden).map(x=>x.id),rb:!!document.getElementById('rbApp')&&document.getElementById('rbApp').hidden,flag:sessionStorage.getItem('tops_reset_go'),resetting:!!window.TOPS_RESETTING,last:TOPS_RESET.last});}).catch(e=>e.message));for(let i=0;i<400;i++){const s=await p.evaluate(()=>{try{const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();if(!S||S.done)return 'wait';
  if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*20,gauss()*20);}return 'bull';}return (S.cur===0&&!S.busy&&!S.p[0].ai&&S.view!==1)?'aim':'wait';}catch(e){return 'ERR '+e.message;}}).catch(()=>'nav');if(s==='aim')return 'aim';if(s.startsWith('ERR'))return s;await p.waitForTimeout(150);}return 'timeout';};
const win=async p=>{for(let i=0;i<1200;i++){const s=await p.evaluate(()=>{try{if(!S||S.done)return 'done';if(S.cur===0&&!S.busy&&!S.p[0].ai&&!S.bull&&S.view!==1){S.p[0].score=40;S.busy=true;land(0,-166);}const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();return 'play';}catch(e){return 'ERR '+e.message;}}).catch(()=>'nav');if(s!=='play')return s;await p.waitForTimeout(150);}return 'timeout';};
const quit=async(p,touch)=>{await p.waitForTimeout(9000);/* >5 s visible, so the match sends a perf row */await tap(p,'#btnMenu',touch);await p.waitForTimeout(300);
 /* Quit, then Forfeit? at once (the confirm disarms after 2.5 s of game time, 0.5 s here): the game's own button handler, clicked twice */
 const q=await p.evaluate(()=>{const pre=window.C3&&C3.pending();const b=document.getElementById('btnQuit');b.click();const t1=b.textContent;b.click();return {pre,t1,live:typeof S!=='undefined'&&S&&!S.done,pend:C3.pending()};}).catch(e=>({err:e.message}));out.push({tag:'quit',q});if(q.live)F('quit','match still live after Quit, Forfeit');};
/* through every post-match screen back to the hub, as a player taps; stops when the page reloads */
const NEXT=['#rbRGo','#rbRKeep','#lvFirst','#tcWelLater','#btnResultNext','#c3rwGo','#c3rwKeep','#btnPerkLater','#tcPLater','.tcpk__later','#msgReplies button','.tc-sheet [data-close]','.tc-sheet .tc-x'];
const advance=async(p,st,touch,want)=>{const l0=st.loads;let hubSince=0,held=false;const A0=Date.now();for(let i=0;i<400;i++){if(st.loads>l0)return 'reloaded';if(Date.now()-A0>120000)return 'timeout';
  /* the Result screen (the reward) left up for 4 s: it must not be reset away under the player */
  if(!held&&await p.evaluate(()=>!!document.querySelector('#rbApp.rb-resmode,#c3rw:not([hidden])')).catch(()=>false)){held=true;await p.waitForTimeout(4000);if(st.loads>l0){advance.early=true;return 'reloaded on the Result screen';}}for(const s of NEXT){if(st.loads>l0)break;if(await tap(p,s,touch)){await p.waitForTimeout(250);break;}}await p.waitForTimeout(200);
  if(st.loads>l0)return 'reloaded';const h=await hubShown(p).catch(()=>false);if(h){if(!hubSince)hubSince=Date.now();if(Date.now()-hubSince>15000)return 'hub';}else hubSince=0;}return 'timeout';};
const afterReload=async(p,tag)=>{await ready(p);let ok=false;for(let i=0;i<80;i++){if(await hubShown(p).catch(()=>false)){ok=true;break;}await p.waitForTimeout(250);}
 const r=await p.evaluate(()=>({last:TOPS_RESET.last,ms:window.TOPS_RESET_MS,n:window.TOPS_RESET_N,title:!document.getElementById('title').hidden,login:!document.getElementById('login').hidden,tab:(document.querySelector('#rbTabs [aria-selected="true"]')||{}).textContent||null,
  snap:JSON.parse(sessionStorage.getItem('__snap')||'null'),dig:__dig(),flag:sessionStorage.getItem('tops_reset_go')}));if(!ok)F(tag,'hub not shown after the reload');if(r.title||r.login)F(tag,'title/login shown after the reset');
 if(r.flag)F(tag,'reset flag not cleared (could loop)');if(!(r.ms>0))F(tag,'reset_ms not set');if(!r.snap)F(tag,'no unload snapshot');else{if(r.snap.live)F(tag,'page reloaded with a match live');
  const a=r.snap.dig,c=r.dig;if(a&&c)for(const k of Object.keys(a)){if(k==='saveKeys')continue;if(a[k]!==c[k]){let d='';if(k==='career'||k==='tc'){try{const A=JSON.parse(a[k]),C=JSON.parse(c[k]);d=' '+JSON.stringify(Object.keys(Object.assign({},A,C)).filter(x=>JSON.stringify(A[x])!==JSON.stringify(C[x])).map(x=>[x,JSON.stringify(A[x]).slice(0,120),JSON.stringify(C[x]).slice(0,120)]));}catch(e){d=' ?';}}else d=' '+a[k]+' -> '+c[k];F(tag,'state changed across the reset: '+k+d);}}}
 await p.evaluate(()=>sessionStorage.removeItem('__snap'));return r;};
const diag=p=>p.evaluate(()=>{const W=innerWidth,H=innerHeight;const vis=[...document.querySelectorAll('#result,#perk,#msg,#lvFirst,.tcpk,.tc-sheet,#c3rw,#rbApp,#hub,#title,#login,#rbMenuSheet,#hubPop')].map(e=>(e.id||e.className)+':'+(e.hidden?'h':'v')+(e.getClientRects().length?'':'0')+(e.className&&e.id==='rbApp'?'['+e.className+']':''));return {st:TOPS_RESET.state(),last:TOPS_RESET.last,S:typeof S!=='undefined'&&S?{done:S.done,after:S.after}:null,els:vis,pts:[[W/2,H/2],[W/2,H*.25],[W/2,H*.8]].map(([x,y])=>{const e=document.elementFromPoint(x,y);let c=e,ch=[];for(let i=0;c&&i<5;i++,c=c.parentElement)ch.push(c.id||c.className||c.tagName);return ch.join('<');})};}).catch(e=>e.message);
const twoMatches=async(prof)=>{const touch=prof!=='desktop';const {p,ctx,st}=await page(prof);await fresh(p);const tag=prof;const T0=Date.now();
 // 1. a won match, through the screens
 const a1=await toAim(p,touch);if(a1!=='aim'){F(tag,'match 1 aim: '+a1);await ctx.close();return;}
 const mid=await p.evaluate(()=>{const l=document.getElementById('loading');TOPS_RESET.go('test');return {live:!!(S&&!S.done),rs:!!(l&&l.classList.contains('rs')&&!l.classList.contains('gone'))};});await p.waitForTimeout(1500);
 if(st.loads>1)F(tag,'TOPS_RESET.go() during a match reloaded the page');if(mid.rs)F(tag,'loading screen shown during a match');
 const w=await win(p);if(w!=='done')F(tag,'match 1: '+w);const loads1=st.loads;const adv=await advance(p,st,touch,'hub');out.push({tag,match1:w,after:adv});
 if(adv!=='reloaded'){await p.waitForTimeout(500);const d=await p.evaluate(()=>{const W=innerWidth,H=innerHeight;return {st:TOPS_RESET.state(),last:TOPS_RESET.last,pts:[[W/2,H/2],[W/2,H*.25],[W/2,H*.8]].map(([x,y])=>{const e=document.elementFromPoint(x,y);let c=e,ch=[];for(let i=0;c&&i<5;i++,c=c.parentElement)ch.push(c.id||c.className||c.tagName);return ch.join('<');}),sheet:!!document.getElementById('rbMenuSheet'),vis:document.visibilityState};}).catch(e=>e.message);F(tag,'no reset after match 1 ('+adv+') '+JSON.stringify(d));await ctx.close();return;}
 const r1=await afterReload(p,tag+' reset 1');out.push({tag,reset1:{ms:r1.ms,saveMs:r1.last&&r1.last.saveMs,tab:r1.tab}});
 if(st.loads!==loads1+1)F(tag,'reloads after match 1: '+(st.loads-loads1));
 // 3. a quit match -> a second reset; its perf row carries reset_ms
 const a2=await toAim(p,touch);if(a2!=='aim'){F(tag,'match 2 aim: '+a2);await ctx.close();return;}await quit(p,touch);
 const row=await p.evaluate(()=>{try{const q=JSON.parse(localStorage.getItem('tops_perfq')||'[]');const e=q.filter(r=>r.phase==='end').pop();return e?{os:e.dev&&e.dev.os,reset_ms:e.dev&&e.dev.t20&&e.dev.t20.reset_ms,reset_n:e.dev&&e.dev.t20&&e.dev.t20.reset_n,t20keys:e.dev&&e.dev.t20?Object.keys(e.dev.t20):null,fps_err:e.dev&&e.dev.t20&&e.dev.t20.fps_err,devkeys:e.dev?Object.keys(e.dev).length:0,rows:q.length,phases:q.map(r=>r.phase).join(',')}:{none:q.map(r=>r.phase).join(',')};}catch(e){return {err:e.message};}});
 out.push({tag,quitRow:row});if(!row||!(row.reset_ms>0))F(tag,'match 2 perf row has no reset_ms: '+JSON.stringify(row));
 const adv2=await advance(p,st,touch,'hub');if(adv2!=='reloaded')F(tag,'no reset after the quit ('+adv2+') '+JSON.stringify(await diag(p)));else{const r2=await afterReload(p,tag+' reset 2');out.push({tag,reset2:{ms:r2.ms,n:r2.n}});if(r2.n!==2)F(tag,'reset_n after 2 resets: '+r2.n);}
 if(st.pe.length)F(tag,'page errors: '+st.pe.slice(0,3).join(' | '));out.push({tag,secs:Math.round((Date.now()-T0)/1000)});await ctx.close();};
/* signed-in: the cloud client replaced by a stub (rpc/insert answer like the server; 'mode' decides the save push) */
const signedCase=async(mode)=>{const tag='iphone signed-in '+mode;const {p,ctx,st}=await page('iphone');await fresh(p);
 await p.evaluate(mode=>{const ok=async()=>({data:{ok:true},error:null});const fetchOk=()=>fetch('https://stub.supabase.co/rest/v1/x',{method:'POST'}).catch(()=>null);
  NET.user={id:'test-user',email:'t@t'};NET.sb={rpc:async(n,a)=>{if(n!=='tops_save_put')return {data:null,error:null};if(mode==='refused')return {data:null,error:{message:'refused'}};if(mode==='otherok'&&window.TOPS_RESET&&TOPS_RESET.state().busy)return {data:null,error:{message:'this one failed'}};if(mode==='slow'){await new Promise(z=>__st0(z,7000));/* real 7 s: the game's timers run at 0.2x in this test */}return {data:{ok:true},error:null};},
   from:()=>({insert:async()=>({error:null}),select:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:null})})}),upsert:async()=>({error:null})}),channel:()=>({on(){return this;},subscribe(){return this;}}),removeChannel(){},auth:{getSession:async()=>({data:{session:null}})}};
  if(mode==='off'){localStorage.setItem('tops_q20_app','nowalk,noreset');}},mode);
 if(mode==='off')await p.evaluate(()=>{/* the switch is read when the reset would start */});
 const a=await toAim(p,true);if(a!=='aim'){F(tag,'aim: '+a);await ctx.close();return;}const w=await win(p);if(w!=='done')F(tag,'match: '+w);
 const adv=await advance(p,st,true,'hub');const last=adv==='reloaded'?null:await p.evaluate(()=>TOPS_RESET.last).catch(()=>null);out.push({tag,after:adv,last});
 if(mode==='ok'){if(adv!=='reloaded')F(tag,'no reset with the cloud save confirmed ('+adv+')');else{await afterReload(p,tag);
   /* ChatGPT P1: a cloud copy older than the confirmed save must not replace it on the new page; a newer one (another device) still does */
   const g=await p.evaluate(()=>{const c0=JSON.stringify(career());const old=JSON.parse(JSON.stringify(save));old.sv=(TOPS_RESETTING.sv||1)-1;old.career=Object.assign({},old.career,{bank:-777});netAdopt(old);const kept=JSON.stringify(career())===c0;
     const nw=JSON.parse(JSON.stringify(save));nw.sv=(TOPS_RESETTING.sv||1)+5;nw.season=save.season;let adopted=null;try{netAdopt(nw);adopted=((save.sv||0)>=nw.sv);}catch(e){adopted='err '+e.message;}return {kept,keptLocal:TOPS_RESET.keptLocal|0,adopted};});
   out.push({tag,olderCopy:g});if(!g.kept||g.keptLocal!==1)F(tag,'an older cloud copy replaced the confirmed save: '+JSON.stringify(g));if(g.adopted!==true)F(tag,'a newer cloud copy was not adopted: '+JSON.stringify(g));}}
 else{if(adv==='reloaded')F(tag,'reset despite '+mode);else{const shown=await hubShown(p);if(!shown)F(tag,'hub not usable after a skipped reset');if(mode!=='off'&&!(last&&last.skipped))F(tag,'skip not recorded: '+JSON.stringify(last));}}
 if(st.pe.length)F(tag,'page errors: '+st.pe.slice(0,3).join(' | '));await ctx.close();};
for(const prof of ['iphone','android','desktop'])if(!ONLY||ONLY.includes(prof))await twoMatches(prof);
const holdCase=async()=>{const tag='iphone reward pending';const {p,ctx,st}=await page('iphone');await fresh(p);const a=await toAim(p,true);if(a!=='aim'){F(tag,'aim: '+a);await ctx.close();return;}
 const w=await win(p);if(w!=='done')F(tag,'match: '+w);await p.evaluate(()=>{window.__pd=C3.pending;C3.pending=()=>true;});const l0=st.loads;
 const adv=await advance(p,st,true,'hub');/* 15 s on a clear hub with a reward card still to show */if(adv==='reloaded'||st.loads>l0)F(tag,'reset while a reward card was still to show');
 await p.evaluate(()=>{C3.pending=window.__pd;});for(let i=0;i<40&&st.loads===l0;i++)await p.waitForTimeout(250);if(st.loads===l0)F(tag,'no reset after the reward card was done '+JSON.stringify(await diag(p)));else await afterReload(p,tag);out.push({tag,held:adv});await ctx.close();};
const staleCase=async()=>{const tag='iphone stale flag';const {p,ctx,st}=await page('iphone');await fresh(p);await p.evaluate(()=>{sessionStorage.setItem('tops_reset_go',JSON.stringify({t:Date.now()-600000,sv:1}));});await p.reload();await ready(p);await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>({resetting:!!window.TOPS_RESETTING,flag:sessionStorage.getItem('tops_reset_go')}));out.push({tag,r});if(r.resetting)F(tag,'a stale flag forced the reset path');if(r.flag)F(tag,'stale flag not cleared');await ctx.close();};
if(!ONLY||ONLY.includes('hold'))await holdCase();if(!ONLY||ONLY.includes('stale'))await staleCase();
for(const m of ['ok','refused','slow','otherok','off'])if(!ONLY||ONLY.includes('signed'))await signedCase(m);
await b.close();srv.close();console.log(JSON.stringify({fails}));console.log(fails.length?'RESET FAIL':'RESET PASS');process.exit(fails.length?1:0);})();
