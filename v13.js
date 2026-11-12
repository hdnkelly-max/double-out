<script>
(function(){
// ===== v13: live performance telemetry (Hayden 06:54, 12 Nov; ChatGPT design review 7.9 -> 9.0) =====
// Whole-match counters inside the game's own frame (V.frame), no second rAF loop: frame-interval and render-CPU histograms (1 ms buckets),
// stalls, reticle input-to-render latency, audio events, timer drift (iOS has no long-task API), draw calls, and the worst 10 slow frames
// with what the game was doing. Two rows per match into tops_perf: a checkpoint at 30 s of visible play (uploaded at the next safe moment)
// and the end (or quit / hidden-and-killed). Nothing on the network or in storage during a throw. Player id only (auth.uid()).
const SCHEMA=1,NB=202;/* buckets 0..200 ms + overflow (201) */
const VER=()=>window.TOPS_VER||'?',BUILD=()=>window.TOPS_BUILD||'';
const Q_KEY='tops_perfq',Q_MAX=20,CK_KEY='tops_perfck',DROP_KEY='tops_perfdrop',BAD_KEY='tops_perfbad';
let M=null,ltObs=null,auCtx=null;
const uid=()=>{try{if(crypto.randomUUID)return crypto.randomUUID();}catch(e){}const h=()=>Math.floor(Math.random()*65536).toString(16).padStart(4,'0');return `${h()}${h()}-${h()}-4${h().slice(1)}-a${h().slice(1)}-${h()}${h()}${h()}`;};
const hist=()=>new Uint32Array(NB);
const bump=(h,ms)=>{h[ms>=200?201:(ms<0?0:ms|0)]++;};
function pct(h,p){let n=0;for(let i=0;i<NB;i++)n+=h[i];if(!n)return null;const k=Math.max(1,Math.ceil(n*p));let c=0;for(let i=0;i<NB;i++){c+=h[i];if(c>=k)return i>=200?200:i+.5;}return null;}
function mode(){try{if(!S)return '?';if(S.online)return 'online';if(S.mp)return 'local';if(S.practice)return 'practice';const c=career();if(c&&c.run)return 'run';return 'career';}catch(e){return '?';}}
function phase(){try{if(!S||S.done)return 'end';if(S.bull)return 'bull';if(S.pulling)return 'pull';if(S.p&&S.p[S.cur]&&S.p[S.cur].ai)return 'opp';if(S.busy)return 'flight';return 'aim';}catch(e){return '?';}}
// #20: how hard the GPU worked between matches (hub, menus, result screens): frames the game drew per second of visible time since the last
// match ended (or the app opened), so we can see whether the phone ever gets a rest. Read when the next match starts.
const IDL={t:performance.now(),n:0,r:0,r0:0};function idleTake(){try{const now=performance.now(),secs=(now-IDL.t)/1000,rc=window.TOPS_RC?TOPS_RC.n:0;const o={secs:Math.round(secs),fps:secs>1?+(IDL.n/secs).toFixed(1):null,renders_ps:secs>1&&window.TOPS_RC?+((rc-IDL.r0)/secs).toFixed(1):null};try{const K=window.TOPS_RC&&TOPS_RC.k,n=IDL.n||1;if(K){const rk={};Object.keys(K).sort((a,b)=>K[b]-K[a]).slice(0,6).forEach(k=>rk[k]=+(K[k]/n).toFixed(2));o.rpf=rk;}}catch(e){}/* passes per frame between matches (the previous match's are in its own row) */return o;}catch(e){return null;}}
function idleReset(){try{IDL.t=performance.now();IDL.n=0;IDL.r0=window.TOPS_RC?TOPS_RC.n:0;}catch(e){}}
function newM(){return {id:uid(),t0:performance.now(),vis:0,last:0,skip:true,fh:hist(),rh:hist(),ih:hist(),fn:0,c33:0,c50:0,c100:0,max:0,inc:[],
 pend:0,lat:0,iN:0,i50:0,iNeg:0,cpu:0,draws:0,tris:0,infoAt:0,auN:0,auLast:0,auStates:[],drift:0,driftN:0,ltN:0,ltMs:0,
 want30:false,sent30:false,done:false,mode:mode(),tier:(S&&S.tier&&S.tier.n)||'',hid:0,ix:++MATCH_IX,app:Math.round(performance.now()/1000),win:[],w:null,idle:idleTake(),_rk:(window.TOPS_RC&&(TOPS_RC.k={}),0),_ll:(window.TOPS_LOCKLAG={n:0,o5:0,max:0,sum:0}),mem0:mem(),ur0:underruns()};}
// --- the frame hook: wraps V.frame (called once per game frame from tick) ---
// CAR-6: render time inside each game frame, from a JS wrapper on renderer.render (not a GL call); JS time = frame callback - render
/* R0 #20: is the time between frames the main thread (style/layout/other JS, GC) or the GPU/compositor? Every 10th frame a MessageChannel
   message is posted at the end of the game frame; how long it waits to run = main-thread work queued after the frame. Long frame interval +
   short wait = GPU/compositor-bound; long wait = main thread. ~5 us per sample, 6 a second. */
let MQ=null,MQt=0,MQlast=0,MQmax=0,MQn=0;try{MQ=new MessageChannel();MQ.port1.onmessage=()=>{const w=performance.now()-MQt;MQlast=w;if(w>MQmax)MQmax=w;MQt=0;};}catch(e){MQ=null;}
let RND=0,RW=false;function wrapRender(){try{const R=window.TOPS_R;if(!R)return;if(R.render.__car6){RW=true;return;}const rr=R.render;const w=function(){const a=performance.now();try{return rr.apply(this,arguments);}finally{RND+=performance.now()-a;}};w.__car6=true;R.render=w;RW=true;}catch(e){}}
wrapRender();setTimeout(wrapRender,0);
const SCR_IDS=['hub','game','tcWalk','c3rw','cardDraft','perkSheet','result','login','tcExh','shop'];
function openScreens(){const o=[];try{for(const id of SCR_IDS){const e=document.getElementById(id);if(e&&!e.hidden&&e.getClientRects().length)o.push(id);}const cd=document.querySelector('.cd-wrap');if(cd&&cd.getClientRects().length)o.push('cards');}catch(e){}return o.join(',');}
// #20 (Overseer 20:30): the match in 30 s windows of visible play [secs since match start, fps, p95 ms, stalls >100 ms, p50 ms], so one long match shows
// whether the frame rate falls with time (heat) or stays flat. Up to 40 windows (20 min); the open window is added when the row is built.
function winRow(w){const p=pct(w.h,.95);const r=[Math.round((w.at-M.t0)/1000),w.vis?+(w.n/(w.vis/1000)).toFixed(1):null,p,w.c100,pct(w.h,.5)];
 /* #20 frame split ('split' switch only): per second of visible play, ms of [our rAF frame incl. render submit, our JS outside rAF (timers + event handlers), the GPU probe itself,
    unclassified = waiting for vsync/GPU/compositor/WebKit work/GC], then the sampled readback stall [p50, p90, n] (compare match 1 vs 2; it is not one frame's GPU time) */
 if(w.a0!==undefined&&w.vis>0){const s=w.vis/1000,AJ=window.TOPS_AJS,aj=AJ?AJ.ms-w.a0:0;const g=w.g.slice().sort((a,b)=>a-b),q=f=>g.length?+g[Math.min(g.length-1,Math.floor(g.length*f))].toFixed(1):null;
  r.push([Math.round(w.raf/s),Math.round(aj/s),Math.round(w.gms/s),Math.round((w.vis-w.raf-aj-w.gms)/s),q(.5),q(.9),g.length]);}
 return r;}/* + p50: a p50 near 33 ms with fps ~30 means the browser is capping the frame rate, not that a frame got dearer */
function winAdd(now,d){let w=M.w;if(!w){w=M.w={at:now,vis:0,n:0,c100:0,h:hist()};const AJ=window.TOPS_AJS;if(AJ){w.raf=0;w.a0=AJ.ms;w.g=[];w.gms=0;}}w.n++;w.vis+=d;bump(w.h,d);if(d>100)w.c100++;if(w.vis>=30000){if(M.win.length<40)M.win.push(winRow(w));M.w=null;}}
// #20 (Overseer 20:51): what this match draws and stacks, once per match after ~10 s of visible play (idle callback, quiet moments only),
// so match 1 and match 2 rows can be compared on the phone: lights by type (visible) and shadow casters, GPU objects, scene objects, canvases in
// the page, shown layers with backdrop-filter / filter / will-change / blend, shown fixed full-screen layers, running CSS animations.
function counters(){const o={};try{const R=window.TOPS_R;let root=null;try{root=V._qa.opp();while(root&&root.parent)root=root.parent;}catch(e){}const L={};let objs=0,sh=0;
 if(root)root.traverse(x=>{objs++;if(x.isLight){let v=true;for(let q=x;q;q=q.parent)if(!q.visible){v=false;break;}if(v){L[x.type]=(L[x.type]||0)+1;if(x.castShadow)sh++;}}});o.lights=L;o.shadow=sh;o.objs=objs;
 if(R&&R.info)o.gpu=[R.info.memory.geometries,R.info.memory.textures,R.info.programs?R.info.programs.length:null];
 const W=innerWidth,H=innerHeight,cs=e=>getComputedStyle(e);const shown=e=>{for(let q=e;q&&q.nodeType===1;q=q.parentElement){const c=cs(q);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0)return false;}return true;};
 const nm=e=>e.id?'#'+e.id:(e.tagName.toLowerCase()+(typeof e.className==='string'&&e.className.trim()?'.'+e.className.trim().split(/\s+/)[0]:''));
 o.canv=[...document.querySelectorAll('canvas')].map(c=>nm(c)+(shown(c)?'':'-'));const lay=[];let full=0;
 document.querySelectorAll('body *').forEach(e=>{const c=cs(e);if(c.display==='none')return;const bf=c.backdropFilter||c.webkitBackdropFilter;const fx=(bf&&bf!=='none')||(c.filter&&c.filter!=='none')||(c.willChange&&c.willChange!=='auto')||(c.mixBlendMode&&c.mixBlendMode!=='normal');
  let big=false;if(c.position==='fixed'){const r=e.getBoundingClientRect();big=r.width*r.height>=.4*W*H;}if(!(fx||big)||!shown(e))return;if(big)full++;if(fx&&lay.length<12)lay.push(nm(e)+(bf&&bf!=='none'?':bd':'')+(c.filter&&c.filter!=='none'?':f':'')+(c.willChange&&c.willChange!=='auto'?':wc':'')+(c.mixBlendMode&&c.mixBlendMode!=='normal'?':bl':''));});
 o.full=full;o.fxl=lay;o.css=document.getAnimations().filter(a=>a.playState==='running').length;try{if(window.TOPS_LSN)o.lsn=TOPS_LSN();}catch(e){}try{if(window.TOPS_GYRO)o.gyro=TOPS_GYRO();}catch(e){}try{if(window.TOPS_IMGC)o.imgc=TOPS_IMGC();}catch(e){}try{const pm=performance.memory;if(pm&&pm.usedJSHeapSize)o.heap=Math.round(pm.usedJSHeapSize/1048576);}catch(e){}}catch(e){o.err=String(e.message||e).slice(0,60);}return o;}
function pre(now){{const AJ=window.TOPS_AJS;if(AJ){M.ajF=M.ajLast===undefined?0:AJ.ms-M.ajLast;M.ajLast=AJ.ms;M.rbF=M.rbLast||0;M.rbLast=0;}}if(!M.skip&&M.last){const d=now-M.last;if(d>0&&d<5000){M.fn++;M.vis+=d;bump(M.fh,d);winAdd(now,d);if(!M.cTry&&M.vis>10000){M.cTry=1;const id=M.id;const go=n=>{try{if(!M||M.id!==id||M.done)return;if(!quiet()){if(n<40)setTimeout(()=>go(n+1),500);return;}M.cnt=counters();}catch(e){}};idle(()=>go(0));}if(d>33)M.c33++;if(d>50){M.c50++;M.pinc=[d,now];}if(d>100)M.c100++;if(d>M.max)M.max=d;}}
 M.skip=false;M.last=now;RND=0;if(!RW)wrapRender();/* installs once the renderer exists */const R=window.TOPS_R;const counting=!!(R&&R.info)&&now-M.infoAt>2000;if(counting){M.infoAt=now;M.ar=R.info.autoReset;R.info.autoReset=false;R.info.reset();}return counting;}
let GPX=null,GPN=0;function gpuProbe(){/* 1 frame in 30: a 1-pixel read right after this frame's render. A READBACK STALL (queued GPU work + resolve + GPU-process round trip), not the GPU time of one frame: compare match 1 vs match 2 only (ChatGPT P1) */try{const w=M.w;if(!w||w.a0===undefined||++GPN%30)return;const R=window.TOPS_R;const gl=R&&R.getContext();if(!gl)return;if(!GPX)GPX=new Uint8Array(4);const a=performance.now();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,GPX);const d=performance.now()-a;w.gms+=d;M.rbLast=d;if(w.g.length<400)w.g.push(d);}catch(e){}}
function post(t0,t1,counting){const pc=M.cpu,pr=M.rnd||0;M.cpu=t1-t0;M.rnd=RND;if(M.w&&M.w.a0!==undefined){M.w.raf+=M.cpu;gpuProbe();}if(MQ&&!MQt&&(++MQn%10===0)){MQt=performance.now();MQ.port2.postMessage(0);}bump(M.rh,M.cpu);if(M.pinc){incident(M.pinc[0],M.pinc[1],pc,pr);M.pinc=null;}if(counting){try{const R=window.TOPS_R;const c=R.info.render.calls,tr=R.info.render.triangles;R.info.autoReset=M.ar;if(c>M.draws)M.draws=c;if(tr>M.tris)M.tris=tr;}catch(e){}}
 if(M.pend){const lat=t1-M.pend;M.pend=0;if(lat<0)M.iNeg++;else{bump(M.ih,lat);M.iN++;M.lat=lat;if(lat>50)M.i50++;}}
 if(!M.sent30&&!M.want30&&M.vis>=(window.TOPS_PERF_30||30000)){M.want30=true;M.want30At=M.vis;}}
if(typeof V!=='undefined'&&V&&typeof V.frame==='function'){const vf=V.frame;V.frame=function(now,st){
 let on=false,counting=false,t0=0;try{on=!!(M&&!M.done&&!document.hidden);if(on){counting=pre(now);t0=performance.now();}}catch(e){on=false;}
 try{if(!on&&!document.hidden){IDL.n++;const rr=window.TOPS_RC;IDL.r=rr?rr.n:IDL.r;}}catch(e){}
 window.__TOPS_INF=1;let r;try{r=vf.apply(this,arguments);}finally{window.__TOPS_INF=0;}/* the game's frame always runs, outside any telemetry try; __TOPS_INF: the frame-split switch doesn't count handlers run inside the frame twice */
 if(on){try{post(t0,performance.now(),counting);}catch(e){}}return r;};}/* QA 08:23: a telemetry error can't stop or skip a frame */
// cost bench for tests: the per-frame bookkeeping alone (pre + post), n calls in chunks of 100, per-call microseconds
function bench(n){const keep=M;M=newM();const out=[];let t=1000;for(let c=0;c<n/100;c++){const a=performance.now();for(let i=0;i<100;i++){t+=16.7;const k=pre(t);post(t,t+3,k);}out.push((performance.now()-a)*10);}out.sort((x,y)=>x-y);const per=[],emp=[];for(let i=0;i<2000;i++){t+=16.7;let a=performance.now();emp.push(performance.now()-a);a=performance.now();const k=pre(t);post(t,t+3,k);per.push(performance.now()-a);}M=keep;per.sort((x,y)=>x-y);emp.sort((x,y)=>x-y);const e95=emp[Math.floor(emp.length*.95)]*1000;
 return {p50:+out[out.length>>1].toFixed(2),p95:+out[Math.floor(out.length*.95)].toFixed(2),max:+out[out.length-1].toFixed(2),call_p95:+Math.max(0,per[Math.floor(per.length*.95)]*1000-e95).toFixed(1),call_max:+(per[per.length-1]*1000).toFixed(1)};}
function incident(d,now,prevCpu,prevRnd){const it={s:Math.round((now-M.t0)/1000),ph:phase(),f:Math.round(d),cpu:+M.cpu.toFixed(1),cpu_prev:+(prevCpu||0).toFixed(1),lat:Math.round(M.lat),au:M.auLast?Math.max(0,Math.round(now-M.auLast)):null,/* CAR-6: where the time went *//* the slow interval holds the previous frame's callback (render + game JS) and time outside the game (GC, layout, other tasks) */rnd:+(prevRnd||0).toFixed(1),js:+Math.max(0,(prevCpu||0)-(prevRnd||0)).toFixed(1),other:Math.max(0,Math.round(d-(prevCpu||0))),scr:openScreens(),dom:null,/* filled at the next quiet idle moment by the recorder (never counted inside a slow frame) */mq:Math.round(MQlast),mq_max:Math.round(MQmax)};if(window.TOPS_AJS){it.aj=+(M.ajF||0).toFixed(1);it.rb=Math.round(M.rbF||0);}/* frame split: our timer/event JS and the readback probe inside this slow interval; unclassified = f - cpu_prev - aj - rb */;MQmax=0;try{if(window.TOPS_LOG&&TOPS_LOG.slow)TOPS_LOG.slow(it);}catch(e){}/* R0 #20: every slow frame goes to the recorder (uploaded at match end); tops_perf keeps the worst 10 */
 if(M.inc.length<10){M.inc.push(it);return;}let lo=0;for(let i=1;i<10;i++)if(M.inc[i].f<M.inc[lo].f)lo=i;if(it.f>M.inc[lo].f)M.inc[lo]=it;}
// reticle: newest unrendered aim input (numbers only); latency recorded after the next frame's render submit
addEventListener('pointermove',e=>{try{if(M&&!M.done&&e.target&&e.target.tagName==='CANVAS')M.pend=e.timeStamp;}catch(x){}},{passive:true});/* newest unrendered aim move on the game canvas; latency = render submitted - that input */
// (QA 08:23) no texture-upload patching: tex_mb is not estimated; renderer.info's geometry/texture/program counts are the memory signal
function mem(){const o={geo:null,tex:null,prog:null,tex_mb:null,heap_mb:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null};
 try{const r=window.TOPS_R;if(r&&r.info){o.geo=r.info.memory.geometries;o.tex=r.info.memory.textures;o.prog=r.info.programs?r.info.programs.length:null;}}catch(e){}return o;}
let MATCH_IX=0;
// every funnel event carries the version (the gap found 07:10: match_exit rows had no version)
if(typeof trackEv==='function'){const te=trackEv;trackEv=function(){let L0=-1;try{L0=(save.funnel||[]).length;}catch(e){}const r=te.apply(this,arguments);try{const L=save.funnel;if(L0>=0&&L&&L.length>L0)L[L.length-1].v=VER();}catch(e){}return r;};}
// long tasks where supported (not iOS Safari)
try{if(window.PerformanceObserver&&(PerformanceObserver.supportedEntryTypes||[]).includes('longtask')){ltObs=new PerformanceObserver(l=>{if(!M||M.done)return;for(const e of l.getEntries()){M.ltN++;M.ltMs+=e.duration;}});ltObs.observe({type:'longtask',buffered:false});}}catch(e){}
// timer drift (main-thread stall proxy for iOS) + the safe-moment check for the 30 s upload; one 250 ms timer, idle when no match or hidden
let exp=0,tickN=0;setInterval(()=>{const t=performance.now();if(!M||M.done||document.hidden){exp=0;return;}if(exp){const d=t-exp;if(d>M.drift)M.drift=d;if(d>100)M.driftN++;}exp=t+250;
 watchAudio();},250);
// QA 08:23: nothing is built or sent during aiming or a dart's flight. Flush points: a leg ending (the scoreboard between legs), the
// match ending or being left, and the hub (a 15 s timer that only acts when no match is running).
// a real break: no pull, no busy turn, no dart in the air (QA 09:03 / 11:00 finding 2); otherwise wait for the next break or match end
function quiet(){try{if(typeof S==='undefined'||!S)return true;if(S.pulling||S.busy)return false;const d=typeof V!=='undefined'&&V&&V._qa&&V._qa.darts?V._qa.darts():null;return !(d&&d.flying);}catch(e){return false;}}
// CAR-5 (the CAR-2 rules, ChatGPT 8.8): during a match nothing is sent and the queue isn't touched except inside a break window: a leg has
// ended, the game is quiet AND the who-throws-first card (S.bull) is up (quiet() alone is also true while the player aims). Rechecked where
// the request starts (send) and where the queue is cleaned (done).
let brkUntil=0,held=[],relPend=[];function between(){try{return typeof S!=='undefined'&&!!S&&!!S.bull;}catch(e){return false;}}
function inPlay(){return !!(M&&!M.done);}
function playOk(){return !inPlay()||(quiet()&&between());}/* the card up + quiet IS the break: the player can't be aiming (rechecked at send time, so an idle callback landing late is safe) */
let heldT=0;function retryHeld(n){clearTimeout(heldT);if(!held.length&&!relPend.length)return;if(!inPlay()){send([]);return;}if(playOk()){send([]);return;}if((n||0)<240)heldT=setTimeout(()=>retryHeld((n||0)+1),250);}/* look for the next break for up to 60 s; the match end flushes anyway */
function legBreak(id,tries){try{if(!M||M.done||M.id!==id)return;if(!quiet()||!between()){/* the leg-end banner keeps the game busy first; look again for up to 15 s, else the next break or the match end */if((tries||0)<60)setTimeout(()=>legBreak(id,(tries||0)+1),250);return;}
 brkUntil=Date.now()+3000;if(M.want30&&!M.sent30){M.sent30=true;M.want30=false;const row=build('30s','partial');idle(()=>send([row]));}else if(qGet().length||held.length||relPend.length)idle(()=>send([]));}catch(e){}}
if(typeof endLeg==='function'){const el=endLeg;endLeg=function(){const r=el.apply(this,arguments);try{if(M&&!M.done){const id=M.id;setTimeout(()=>legBreak(id,0),600);}/* after the leg's own scoring work */}catch(e){}return r;};}
setInterval(()=>{try{if((M&&!M.done)||document.hidden)return;if(typeof NET!=='undefined'&&NET.user&&NET.sb){if(!KA)prepKA();if(qGet().length)idle(()=>send([]));}}catch(e){}},15000);
const idle=f=>{try{if(window.requestIdleCallback)return requestIdleCallback(f,{timeout:3000});}catch(e){}setTimeout(f,1500);};
// audio: the game's AudioContext state changes (incl. iOS 'interrupted') and playbackStats underruns where the browser has them
function watchAudio(){try{const c=(typeof AU!=='undefined')&&AU&&AU.ctx;if(!c||c===auCtx)return;auCtx=c;let prev=c.state;c.addEventListener('statechange',()=>{const was=prev;prev=c.state;if(!M||M.done)return;M.auLast=performance.now();if(was==='running'&&c.state!=='running'&&!document.hidden)M.auN++;/* leaving 'running' mid-match while visible is the unexpected case */if(M.auStates.length<12)M.auStates.push(c.state+'@'+Math.round((M.auLast-M.t0)/1000));});}catch(e){}}
// media elements (music tracks): waiting / stalled / error / unexpected pause during a match (capture phase: these events don't bubble)
for(const ev of ['waiting','stalled','error']){document.addEventListener(ev,e=>{if(!M||M.done||document.hidden||!(e.target instanceof HTMLMediaElement))return;const el=e.target;if(el.muted||el.volume===0||(ev!=='error'&&el.paused)||(ev==='error'&&!(el.currentTime>0)))return;/* only while that track is meant to be audible and playing */M.mediaN=(M.mediaN||0)+1;M.auLast=performance.now();if(M.auStates.length<12)M.auStates.push('media-'+ev+'@'+Math.round((M.auLast-M.t0)/1000));},true);}
function underruns(){try{const c=(typeof AU!=='undefined')&&AU&&AU.ctx;const ps=c&&c.playbackStats;return ps&&ps.underrunEvents!=null?ps.underrunEvents:null;}catch(e){return null;}}
function audioInfo(){const c=(typeof AU!=='undefined')&&AU&&AU.ctx;const o={state:c?c.state:null,base:c&&c.baseLatency!=null?+(c.baseLatency*1000).toFixed(1):null,out:c&&c.outputLatency!=null?+(c.outputLatency*1000).toFixed(1):null,changes:M.auStates};
 const u=underruns();o.underruns=u!=null&&M.ur0!=null?u-M.ur0:null;/* this match only (the counter is per AudioContext lifetime) */o.media=M.mediaN||0;return o;}
// coarse device info: no raw user-agent string
let DEV=null;function dev(){if(DEV)return DEV;const ua=navigator.userAgent||'';let os='other',om=null,br='other',bm=null;
 let m;if((m=ua.match(/iPhone OS (\d+)/))||(m=ua.match(/CPU OS (\d+)/))){os='iOS';om=+m[1];}else if(m=ua.match(/Android (\d+)/)){os='Android';om=+m[1];}else if(/Mac OS X/.test(ua))os='macOS';else if(/Windows/.test(ua))os='Windows';
 if(m=ua.match(/CriOS\/(\d+)/)){br='Chrome';bm=+m[1];}else if(m=ua.match(/Edg\/(\d+)/)){br='Edge';bm=+m[1];}else if(m=ua.match(/Chrome\/(\d+)/)){br='Chrome';bm=+m[1];}else if(m=ua.match(/Firefox\/(\d+)/)){br='Firefox';bm=+m[1];}else if(m=ua.match(/Version\/(\d+).*Safari/)){br='Safari';bm=+m[1];}
 let gpu=null;try{const cv=document.querySelector('canvas');const gl=cv&&(cv.getContext('webgl2')||cv.getContext('webgl'));const x=gl&&gl.getExtension('WEBGL_debug_renderer_info');const r=x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):null;
  if(r){const g=String(r);gpu=/Apple/i.test(g)?'Apple':/Adreno/i.test(g)?'Adreno':/Mali/i.test(g)?'Mali':/PowerVR/i.test(g)?'PowerVR':/SwiftShader/i.test(g)?'SwiftShader':/Intel/i.test(g)?'Intel':/NVIDIA|GeForce/i.test(g)?'NVIDIA':/AMD|Radeon/i.test(g)?'AMD':'Other';}}catch(e){}
 const sw=Math.round(Math.min(screen.width,screen.height)),sh=Math.round(Math.max(screen.width,screen.height)),dpr=+(window.devicePixelRatio||1).toFixed(2);
 DEV={os,os_major:om,browser:br,browser_major:bm,screen:sw+'x'+sh,dpr,gpu,device_class:`${os}${om||''}-${dpr}x-${sw}`};return DEV;}
function rpr(){try{if(window.TOPS_R&&TOPS_R.getPixelRatio)return +TOPS_R.getPixelRatio().toFixed(2);const cv=document.querySelector('canvas');return cv&&cv.clientWidth?+(cv.width/cv.clientWidth).toFixed(2):null;}catch(e){return null;}}
function build(ph,status){const fh=M.fh,p50=pct(fh,.5),vs=M.vis/1000;const n=M.fn||1;
 return fit({sample_id:uid(),match_id:M.id,ver:VER(),build:BUILD(),schema_ver:SCHEMA,phase:ph,status,mode:M.mode,tier:M.tier,secs:Math.round((performance.now()-M.t0)/1000),visible_secs:+vs.toFixed(1),frame_n:M.fn,
  refresh_hz:p50?(p50<10?120:p50<13?90:60):null,fps:vs?+(M.fn/vs).toFixed(1):null,p50,p95:pct(fh,.95),p99:pct(fh,.99),pct33:M.fn?+(M.c33/n*100).toFixed(2):null,pct50:M.fn?+(M.c50/n*100).toFixed(2):null,frames_over200:M.fh[201],stalls100:M.c100,max_ms:Math.round(M.max),
  render_p95:pct(M.rh,.95),reticle_p50:pct(M.ih,.5),reticle_p95:pct(M.ih,.95),reticle_max:M.iN?Math.round(Math.max(...Array.from(M.ih).map((v,i)=>v?i:0))):null,reticle_n:M.iN,reticle_slow:M.i50,
  audio_issue_n:M.auN+(M.mediaN||0)+(()=>{const u=underruns();return u!=null&&M.ur0!=null?Math.max(0,u-M.ur0):0;})(),audio:audioInfo(),drift_max:Math.round(M.drift),drift_n:M.driftN,lt_n:M.ltN,lt_ms:Math.round(M.ltMs),draws_max:M.draws||null,tris_max:M.tris||null,
  heap_mb:performance.memory?+(performance.memory.usedJSHeapSize/1e6).toFixed(1):null,match_index:M.ix,frame_hist:fbins(fh),standalone:standalone(),app_secs:M.app,...(m=>({geometries:m.geo,textures:m.tex,programs:m.prog,tex_mb:m.tex_mb,mem:{now:m,start:M.mem0}}))(mem()),incidents:M.inc.slice().sort((a,b)=>b.f-a.f),q_dropped:(()=>{try{return +localStorage.getItem(DROP_KEY)||0;}catch(e){return null;}})(),dev:Object.assign({rpr:rpr()},dev(),t20())});}
// #20: no new columns (tops_perf is strict), so the extra per-match detail rides in the dev JSON: fps per 30 s window, frames drawn between matches,
// how far a stale screen would have moved the lock point (TOPS_LOCKLAG), and the bisect switch in use (?q20=)
function t20(){try{const o={fps_30s:M.win.concat(M.w&&M.w.vis>=5000?[winRow(M.w)]:[]),idle:M.idle};if(M.cnt)o.cnt=M.cnt;
 /* Overseer 21:37: render passes per frame in this match by scene|camera|target (main|p21|screen = the board view, main|p7… = the room view, arm = first-person
    arm pass, other = portraits/hero/dart renders), and the 3D canvas as it is now: [width, height, CSS width, CSS height, drawing buffer w, h, renderer pixel ratio, devicePixelRatio] */
 try{const K=window.TOPS_RC&&TOPS_RC.k,n=M.fn||1;if(K){const rk={};Object.keys(K).sort((a,b)=>K[b]-K[a]).slice(0,8).forEach(k=>rk[k]=+(K[k]/n).toFixed(2));o.rpf=rk;}}catch(e){}
 try{const cv=document.getElementById('scene'),R=window.TOPS_R,g=R&&R.getContext();o.cv=[cv.width,cv.height,cv.clientWidth,cv.clientHeight,g?g.drawingBufferWidth:null,g?g.drawingBufferHeight:null,R?+R.getPixelRatio().toFixed(2):null,+(window.devicePixelRatio||1).toFixed(2)];}catch(e){}const L=window.TOPS_LOCKLAG;if(L&&L.n)o.lock={n:L.n,over5:L.o5,max:+L.max.toFixed(1),mean:+(L.sum/L.n).toFixed(1)};if(window.TOPS_Q20)o.q20=TOPS_Q20;return {t20:o};}catch(e){return {};}}
// frame-interval histogram in 10 fixed bins (ms): <9, 9-12, 13-17, 18-20, 21-25, 26-33, 34-50, 51-100, 101-199, >=200 (Overseer 10:31: per-match histogram, rows < 5 KB)
const FEDGE=[9,13,18,21,26,34,51,101,200];function fbins(h){const o=[0,0,0,0,0,0,0,0,0,0];try{for(let i=0;i<h.length;i++){if(!h[i])continue;let b=0;while(b<FEDGE.length&&i>=FEDGE[b])b++;o[b]+=h[i];}}catch(e){}return o;}
// home-screen web app (iOS navigator.standalone, or display-mode standalone elsewhere); null if unknown
function standalone(){try{if(navigator.standalone===true)return true;if(window.matchMedia)return matchMedia('(display-mode: standalone)').matches;}catch(e){}return null;}
// keep every row under 5 KB: drop the least useful detail first (Overseer 10:31)
const ROW_MAX=5000;function fit(row){try{const len=r=>new TextEncoder().encode(JSON.stringify(r)).length;if(len(row)<=ROW_MAX)return row;row.incidents=(row.incidents||[]).slice(0,3);if(len(row)<=ROW_MAX)return row;row.mem=null;if(len(row)<=ROW_MAX)return row;row.incidents=[];row.audio=null;}catch(e){}return row;}
// --- transport: queue in localStorage (bounded), insert when signed in; duplicates ignored by sample_id ---
function qGet(){try{return JSON.parse(localStorage.getItem(Q_KEY)||'[]');}catch(e){return [];}}
function qSet(a){const drop=Math.max(0,a.length-Q_MAX);try{if(drop)localStorage.setItem(DROP_KEY,String((+localStorage.getItem(DROP_KEY)||0)+drop));localStorage.setItem(Q_KEY,JSON.stringify(a.slice(-Q_MAX)));return true;}catch(e){return false;}}
function ckSet(row){try{if(row)localStorage.setItem(CK_KEY,JSON.stringify(row));else localStorage.removeItem(CK_KEY);}catch(e){}}
function ckGet(){try{return JSON.parse(localStorage.getItem(CK_KEY)||'null');}catch(e){return null;}}
function ckSave(row){try{const q=qGet();q.push(row);qSet(q);}catch(e){}}/* queue only; sent at the next flush point */
function send(rows){if(!playOk()){held=held.concat(rows||[]);retryHeld(0);return;}/* during play: kept in memory for the next break or the match end */if(relPend.length){const ids=new Set(relPend.splice(0));try{qSet(qGet().filter(r=>!ids.has(r.sample_id)));}catch(e){}}
 const all=qGet().concat(held.splice(0),rows||[]);if(!all.length)return;
 if(typeof NET==='undefined'||!NET.user||!NET.sb){qSet(all);return;}
 qSet(all);
 // QA 09:03 / 11:00 finding 1: plain INSERT only (the table grants INSERT, not SELECT, so ON CONFLICT (sample_id) is refused).
 // A row already stored comes back as a unique violation (23505 / 409): count it as stored. One duplicate fails the whole batch,
 // so on a duplicate the rows are retried one at a time and each stored or duplicate row leaves the queue.
 try{const ins=r=>NET.sb.from('tops_perf').insert(r);
  // CAR-5b (Q&D P2 B): a row the table refuses for good (a non-duplicate 4xx, e.g. a foreign key after an account delete) used to fail the
  // whole batch on every flush until the 20-row cap pushed it out. Now the batch is retried one row at a time, once: stored/duplicate rows
  // leave the queue, a row refused for good is dropped and counted (BAD_KEY + flight recorder), and anything else (network, 5xx, 401/403
  // session, 408/429) stays queued for the next flush.
  ins(all).then(({error,status})=>{if(!error){done(all);return;}if(!dup(error,status)&&!badRowErr(error,status)){console.warn('tops_perf',error.message);return;}
   all.reduce((p,r)=>p.then(()=>ins([r]).then(({error,status})=>{if(!error||dup(error,status)){done([r]);return;}if(badRowErr(error,status))badRow(r,error,status);})),Promise.resolve()).catch(()=>{});}).catch(()=>{});}catch(e){}}
function badSt(st){st=+st||0;return st>=400&&st<500&&st!==401&&st!==403&&st!==408&&st!==429;}
function badRowErr(e,st){return badSt(st)&&/^2[23]/.test(String(e&&e.code||''));}/* ChatGPT P2: only a Postgres data/integrity error (22xxx, 23xxx: FK, check, not-null, other unique) is about the row; a schema or API mismatch (e.g. PGRST204 missing column after a code-before-migration release) refuses every row, so those rows stay queued */
function badRow(r,e,st){try{done([r]);localStorage.setItem(BAD_KEY,String((+localStorage.getItem(BAD_KEY)||0)+1));}catch(x){}try{window.TOPS_LOG&&TOPS_LOG.log('perf_bad_row',{status:+st||0,code:e&&e.code||null,phase:r&&r.phase||null,msg:String(e&&e.message||'').slice(0,120)});}catch(x){}}
function dup(e,st){return !!(e&&(e.code==='23505'||/duplicate key value violates unique constraint/i.test(e.message||''))&&(/tops_perf_sample_id_key/.test(e.message||'')||/^Key \(sample_id\)=/.test(e.details||'')));}/* ChatGPT 8.8 P1: the exact constraint, or PostgREST's detail naming sample_id *//* CAR-5: only a unique violation on sample_id means "already stored"; any other 409 (e.g. a foreign-key 23503) keeps the row */
function done(rows){try{if(!playOk()){relPend=relPend.concat(rows.map(r=>r.sample_id));return;}/* no storage write during play */const ids=new Set(rows.map(r=>r.sample_id));qSet(qGet().filter(r=>!ids.has(r.sample_id)));}catch(e){}}
// keepalive on page close: needs the URL, key and token prepared before (no async work while closing)
let KA=null;function prepKA(){try{if(typeof NET==='undefined'||!NET.sb||!NET.user)return;const u=NET.sb.supabaseUrl||(NET.sb.rest&&NET.sb.rest.url&&NET.sb.rest.url.replace(/\/rest\/v1$/,''));const k=NET.sb.supabaseKey;NET.sb.auth.getSession().then(({data})=>{const t=data&&data.session&&data.session.access_token;if(u&&k&&t)KA={u,k,t};}).catch(()=>{});}catch(e){}}
function keepalive(rows){try{if(!KA||!rows.length)return false;fetch(KA.u+'/rest/v1/tops_perf',{method:'POST',keepalive:true,headers:{apikey:KA.k,Authorization:'Bearer '+KA.t,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(rows)})/* plain insert; rows stay queued, so a duplicate (409) is cleared by the next send() */.catch(()=>{});return true;}catch(e){return false;}}
// --- lifecycle ---
function finish(status){if(!M||M.done)return null;M.done=true;idleReset();ckSet(null);if(M.vis<5000){M=null;try{if(window.TOPS_RC)TOPS_RC.k={};}catch(e){}return null;}/* QA 08:23: under 5 s of play (an instant quit) sends nothing */const row=build('end',status);M=null;try{if(window.TOPS_RC)TOPS_RC.k={};}catch(e){}/* the hub's passes count from here */return row;}
const _bm=beginMatch;beginMatch=function(){let prev=null;try{prev=finish('interrupted');}catch(e){M=null;}const r=_bm.apply(this,arguments);try{M=newM();prepKA();watchAudio();if(prev)ckSave(prev);/* the previous match's row is queued, sent at the next flush point */}catch(e){M=null;}return r;};
const _em=endMatch;endMatch=function(){let row=null;try{row=finish('complete');}catch(e){M=null;}const r=_em.apply(this,arguments);try{if(row)idle(()=>send([row]));/* the match is over: off the throw path */}catch(e){}return r;};
{const q=document.getElementById('btnQuit');if(q)q.addEventListener('click',()=>{try{const row=finish('quit');if(row)idle(()=>send([row]));}catch(e){}},true);}
// hidden is a pause, not an exit: close the segment, store a checkpoint locally (no network); visible resumes the same match
document.addEventListener('visibilitychange',()=>{try{if(!M||M.done)return;if(document.hidden){M.hid++;try{const ck=build('end','interrupted');ck.sample_id='ck-'+M.id;ckSet(ck);}catch(e){}}else{M.skip=true;M.last=0;exp=0;}}catch(e){}});/* the recovery checkpoint is never uploaded while its match can still finish */
addEventListener('pagehide',()=>{try{const row=finish('closed');/* finish clears this match's checkpoint; with no match open, an older one is left for the next load */
 /* CAR-5b (Q&D P2 A): rows held in memory during play (e.g. the 30 s row) go too; rows already stored during play (relPend) don't */
 const gone=new Set(relPend.splice(0));const q=qGet().concat(held.splice(0)).filter(r=>!gone.has(r.sample_id));if(row)q.push(row);qSet(q);keepalive(q);}catch(e){}});
// flush anything queued once signed in (after load, off the hot path)
{const ck=ckGet();if(ck){ckSet(null);ck.sample_id=uid();qSet(qGet().concat([ck]));}}
// flush when signed in: after load, and every ~10 s while not pulling (catches a sign-in after the match); keepalive credentials refreshed
setTimeout(()=>idle(()=>{if(qGet().length)send([]);}),8000);
{const b0=build;build=function(){const r=b0.apply(this,arguments);try{window.TOPS_LOG_PERF&&TOPS_LOG_PERF(r);}catch(e){}return r;};}/* v14 flight recorder keeps a summary of each row */
window.TOPS_perf={flush(){send([]);},bad:()=>+(localStorage.getItem(BAD_KEY)||0),_hold:rows=>{held=held.concat(rows||[]);},/* tests: a row held in memory during play */_car5:()=>({held:held.length,relPend:relPend.length,brkIn:brkUntil-Date.now(),playOk:playOk()}),kaTest(){const keep=KA;KA={u:'https://example.supabase.co',k:'k',t:'t'};try{keepalive([{sample_id:'ka-test'}]);}finally{KA=keep;}},fitTest(){const inc=[];for(let i=0;i<40;i++)inc.push({s:i,ph:'aim',f:250+i,cpu:12.3,cpu_prev:11.1,lat:40,au:1234,note:'x'.repeat(60)});return fit({ver:VER(),incidents:inc,mem:{now:{geo:1},start:{geo:1}},audio:{log:'y'.repeat(800)}});},get m(){return M;},bench,build:(p,s)=>M&&build(p,s),queue:qGet,send,dev,_hook:typeof V!=='undefined'&&!!V.frame};
})();
</script>
