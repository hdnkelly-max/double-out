<script>
(function(){
// ===== v13: live performance telemetry (Hayden 06:54, 12 Nov; ChatGPT design review 7.9 -> 9.0) =====
// Whole-match counters inside the game's own frame (V.frame), no second rAF loop: frame-interval and render-CPU histograms (1 ms buckets),
// stalls, reticle input-to-render latency, audio events, timer drift (iOS has no long-task API), draw calls, and the worst 10 slow frames
// with what the game was doing. Two rows per match into tops_perf: a checkpoint at 30 s of visible play (uploaded at the next safe moment)
// and the end (or quit / hidden-and-killed). Nothing on the network or in storage during a throw. Player id only (auth.uid()).
const SCHEMA=1,NB=202;/* buckets 0..200 ms + overflow (201) */
const VER=()=>window.TOPS_VER||'?',BUILD=()=>window.TOPS_BUILD||'';
const Q_KEY='tops_perfq',Q_MAX=20,CK_KEY='tops_perfck',DROP_KEY='tops_perfdrop';
let M=null,ltObs=null,auCtx=null;
const uid=()=>{try{if(crypto.randomUUID)return crypto.randomUUID();}catch(e){}const h=()=>Math.floor(Math.random()*65536).toString(16).padStart(4,'0');return `${h()}${h()}-${h()}-4${h().slice(1)}-a${h().slice(1)}-${h()}${h()}${h()}`;};
const hist=()=>new Uint32Array(NB);
const bump=(h,ms)=>{h[ms>=200?201:(ms<0?0:ms|0)]++;};
function pct(h,p){let n=0;for(let i=0;i<NB;i++)n+=h[i];if(!n)return null;const k=Math.max(1,Math.ceil(n*p));let c=0;for(let i=0;i<NB;i++){c+=h[i];if(c>=k)return i>=200?200:i+.5;}return null;}
function mode(){try{if(!S)return '?';if(S.online)return 'online';if(S.mp)return 'local';if(S.practice)return 'practice';const c=career();if(c&&c.run)return 'run';return 'career';}catch(e){return '?';}}
function phase(){try{if(!S||S.done)return 'end';if(S.bull)return 'bull';if(S.pulling)return 'pull';if(S.p&&S.p[S.cur]&&S.p[S.cur].ai)return 'opp';if(S.busy)return 'flight';return 'aim';}catch(e){return '?';}}
function newM(){return {id:uid(),t0:performance.now(),vis:0,last:0,skip:true,fh:hist(),rh:hist(),ih:hist(),fn:0,c33:0,c50:0,c100:0,max:0,inc:[],
 pend:0,lat:0,iN:0,i50:0,iNeg:0,cpu:0,draws:0,tris:0,infoAt:0,auN:0,auLast:0,auStates:[],drift:0,driftN:0,ltN:0,ltMs:0,
 want30:false,sent30:false,done:false,mode:mode(),tier:(S&&S.tier&&S.tier.n)||'',hid:0,ix:++MATCH_IX,app:Math.round(performance.now()/1000),mem0:mem(),ur0:underruns()};}
// --- the frame hook: wraps V.frame (called once per game frame from tick) ---
function pre(now){if(!M.skip&&M.last){const d=now-M.last;if(d>0&&d<5000){M.fn++;M.vis+=d;bump(M.fh,d);if(d>33)M.c33++;if(d>50){M.c50++;M.pinc=[d,now];}if(d>100)M.c100++;if(d>M.max)M.max=d;}}
 M.skip=false;M.last=now;const R=window.TOPS_R;const counting=!!(R&&R.info)&&now-M.infoAt>2000;if(counting){M.infoAt=now;M.ar=R.info.autoReset;R.info.autoReset=false;R.info.reset();}return counting;}
function post(t0,t1,counting){const pc=M.cpu;M.cpu=t1-t0;bump(M.rh,M.cpu);if(M.pinc){incident(M.pinc[0],M.pinc[1],pc);M.pinc=null;}if(counting){try{const R=window.TOPS_R;const c=R.info.render.calls,tr=R.info.render.triangles;R.info.autoReset=M.ar;if(c>M.draws)M.draws=c;if(tr>M.tris)M.tris=tr;}catch(e){}}
 if(M.pend){const lat=t1-M.pend;M.pend=0;if(lat<0)M.iNeg++;else{bump(M.ih,lat);M.iN++;M.lat=lat;if(lat>50)M.i50++;}}
 if(!M.sent30&&!M.want30&&M.vis>=(window.TOPS_PERF_30||30000)){M.want30=true;M.want30At=M.vis;}}
if(typeof V!=='undefined'&&V&&typeof V.frame==='function'){const vf=V.frame;V.frame=function(now,st){
 if(!M||M.done||document.hidden)return vf.apply(this,arguments);
 const counting=pre(now);const t0=performance.now();try{return vf.apply(this,arguments);}finally{post(t0,performance.now(),counting);}};}
// cost bench for tests: the per-frame bookkeeping alone (pre + post), n calls in chunks of 100, per-call microseconds
function bench(n){const keep=M;M=newM();const out=[];let t=1000;for(let c=0;c<n/100;c++){const a=performance.now();for(let i=0;i<100;i++){t+=16.7;const k=pre(t);post(t,t+3,k);}out.push((performance.now()-a)*10);}out.sort((x,y)=>x-y);const per=[],emp=[];for(let i=0;i<2000;i++){t+=16.7;let a=performance.now();emp.push(performance.now()-a);a=performance.now();const k=pre(t);post(t,t+3,k);per.push(performance.now()-a);}M=keep;per.sort((x,y)=>x-y);emp.sort((x,y)=>x-y);const e95=emp[Math.floor(emp.length*.95)]*1000;
 return {p50:+out[out.length>>1].toFixed(2),p95:+out[Math.floor(out.length*.95)].toFixed(2),max:+out[out.length-1].toFixed(2),call_p95:+Math.max(0,per[Math.floor(per.length*.95)]*1000-e95).toFixed(1),call_max:+(per[per.length-1]*1000).toFixed(1)};}
function incident(d,now,prevCpu){const it={s:Math.round((now-M.t0)/1000),ph:phase(),f:Math.round(d),cpu:+M.cpu.toFixed(1),cpu_prev:+(prevCpu||0).toFixed(1),lat:Math.round(M.lat),au:M.auLast?Math.max(0,Math.round(now-M.auLast)):null};
 if(M.inc.length<10){M.inc.push(it);return;}let lo=0;for(let i=1;i<10;i++)if(M.inc[i].f<M.inc[lo].f)lo=i;if(it.f>M.inc[lo].f)M.inc[lo]=it;}
// reticle: newest unrendered aim input (numbers only); latency recorded after the next frame's render submit
addEventListener('pointermove',e=>{if(M&&!M.done&&e.target&&e.target.tagName==='CANVAS')M.pend=e.timeStamp;},{passive:true});/* newest unrendered aim move on the game canvas; latency = render submitted - that input */
// live texture memory estimate (uploads after this script loads; renderer.info has the full counts): level-0 uploads x 4 bytes/pixel per texture (cube maps sum their faces), freed on deleteTexture
let texBytes=0;const TEXB=new WeakMap();
try{for(const C of [window.WebGLRenderingContext,window.WebGL2RenderingContext]){if(!C)continue;const P=C.prototype;
 const dims=a=>{if(typeof a[3]==='number'&&typeof a[4]==='number'&&a.length>=8)return [a[3],a[4]];const src=a[a.length-1];if(!src)return null;const w=src.videoWidth||src.naturalWidth||src.width,h=src.videoHeight||src.naturalHeight||src.height;return w&&h?[w,h]:null;};
 const note=function(gl,target,level,d,faceKey){if(level!==0||!d)return;const cube=target!==gl.TEXTURE_2D;const t=gl.getParameter(cube?gl.TEXTURE_BINDING_CUBE_MAP:gl.TEXTURE_BINDING_2D);if(!t)return;
  let e=TEXB.get(t);if(!e){e={};TEXB.set(t,e);}const k=cube?String(target):'2d';const nb=d[0]*d[1]*4;texBytes+=nb-(e[k]||0);e[k]=nb;};
 for(const fn of ['texImage2D','compressedTexImage2D']){const o=P[fn];if(!o||o.__tp)continue;const w=function(){try{note(this,arguments[0],arguments[1],dims(arguments));}catch(e){}return o.apply(this,arguments);};w.__tp=true;P[fn]=w;}
 if(P.texStorage2D&&!P.texStorage2D.__tp){const o=P.texStorage2D;const w=function(target,levels,fmt,wd,ht){try{note(this,target===this.TEXTURE_CUBE_MAP?this.TEXTURE_CUBE_MAP_POSITIVE_X:target,0,[wd*(target===this.TEXTURE_CUBE_MAP?6:1),ht]);}catch(e){}return o.apply(this,arguments);};w.__tp=true;P.texStorage2D=w;}
 const od=P.deleteTexture;if(od&&!od.__tp){const w=function(t){try{const e=t&&TEXB.get(t);if(e){for(const k in e)texBytes-=e[k];TEXB.delete(t);}}catch(x){}return od.apply(this,arguments);};w.__tp=true;P.deleteTexture=w;}}}catch(e){}
function mem(){const o={geo:null,tex:null,prog:null,tex_mb:+(texBytes/1048576).toFixed(1),heap_mb:performance.memory?+(performance.memory.usedJSHeapSize/1048576).toFixed(1):null};
 try{const r=window.TOPS_R;if(r&&r.info){o.geo=r.info.memory.geometries;o.tex=r.info.memory.textures;o.prog=r.info.programs?r.info.programs.length:null;}}catch(e){}return o;}
let MATCH_IX=0;
// every funnel event carries the version (the gap found 07:10: match_exit rows had no version)
if(typeof trackEv==='function'){const te=trackEv;trackEv=function(){const L0=(save.funnel||[]).length;const r=te.apply(this,arguments);try{const L=save.funnel;if(L&&L.length>L0)L[L.length-1].v=VER();}catch(e){}return r;};}
// long tasks where supported (not iOS Safari)
try{if(window.PerformanceObserver&&(PerformanceObserver.supportedEntryTypes||[]).includes('longtask')){ltObs=new PerformanceObserver(l=>{if(!M||M.done)return;for(const e of l.getEntries()){M.ltN++;M.ltMs+=e.duration;}});ltObs.observe({type:'longtask',buffered:false});}}catch(e){}
// timer drift (main-thread stall proxy for iOS) + the safe-moment check for the 30 s upload; one 250 ms timer, idle when no match or hidden
let exp=0,tickN=0;setInterval(()=>{const t=performance.now();if(!M||M.done||document.hidden){exp=0;return;}if(exp){const d=t-exp;if(d>M.drift)M.drift=d;if(d>100)M.driftN++;}exp=t+250;
 if(++tickN%40===0&&!(S&&S.pulling)&&typeof NET!=='undefined'&&NET.user&&NET.sb){if(!KA)prepKA();if(qGet().length)idle(()=>send([]));}
 if(M.want30&&!M.sent30&&(safe()||(M.vis-M.want30At>10000&&!(S&&S.pulling)))){M.sent30=true;M.want30=false;const row=build('30s','partial');idle(()=>send([row]));}watchAudio();},250);
function safe(){try{return S&&!S.pulling&&!S.busy&&!S.bull;}catch(e){return false;}}/* preferred; after 10 s of play waiting, any moment the player isn't pulling */
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
 return {sample_id:uid(),match_id:M.id,ver:VER(),build:BUILD(),schema_ver:SCHEMA,phase:ph,status,mode:M.mode,tier:M.tier,secs:Math.round((performance.now()-M.t0)/1000),visible_secs:+vs.toFixed(1),frame_n:M.fn,
  refresh_hz:p50?(p50<10?120:p50<13?90:60):null,fps:vs?+(M.fn/vs).toFixed(1):null,p50,p95:pct(fh,.95),p99:pct(fh,.99),pct33:M.fn?+(M.c33/n*100).toFixed(2):null,pct50:M.fn?+(M.c50/n*100).toFixed(2):null,frames_over200:M.fh[201],stalls100:M.c100,max_ms:Math.round(M.max),
  render_p95:pct(M.rh,.95),reticle_p50:pct(M.ih,.5),reticle_p95:pct(M.ih,.95),reticle_max:M.iN?Math.round(Math.max(...Array.from(M.ih).map((v,i)=>v?i:0))):null,reticle_n:M.iN,reticle_slow:M.i50,
  audio_issue_n:M.auN+(M.mediaN||0)+(()=>{const u=underruns();return u!=null&&M.ur0!=null?Math.max(0,u-M.ur0):0;})(),audio:audioInfo(),drift_max:Math.round(M.drift),drift_n:M.driftN,lt_n:M.ltN,lt_ms:Math.round(M.ltMs),draws_max:M.draws||null,tris_max:M.tris||null,
  heap_mb:performance.memory?+(performance.memory.usedJSHeapSize/1e6).toFixed(1):null,match_index:M.ix,app_secs:M.app,...(m=>({geometries:m.geo,textures:m.tex,programs:m.prog,tex_mb:m.tex_mb,mem:{now:m,start:M.mem0}}))(mem()),incidents:M.inc.slice().sort((a,b)=>b.f-a.f),q_dropped:(()=>{try{return +localStorage.getItem(DROP_KEY)||0;}catch(e){return null;}})(),dev:Object.assign({rpr:rpr()},dev())};}
// --- transport: queue in localStorage (bounded), insert when signed in; duplicates ignored by sample_id ---
function qGet(){try{return JSON.parse(localStorage.getItem(Q_KEY)||'[]');}catch(e){return [];}}
function qSet(a){const drop=Math.max(0,a.length-Q_MAX);try{if(drop)localStorage.setItem(DROP_KEY,String((+localStorage.getItem(DROP_KEY)||0)+drop));localStorage.setItem(Q_KEY,JSON.stringify(a.slice(-Q_MAX)));return true;}catch(e){return false;}}
function ckSet(row){try{if(row)localStorage.setItem(CK_KEY,JSON.stringify(row));else localStorage.removeItem(CK_KEY);}catch(e){}}
function ckGet(){try{return JSON.parse(localStorage.getItem(CK_KEY)||'null');}catch(e){return null;}}
function send(rows){const all=qGet().concat(rows||[]);if(!all.length)return;
 if(typeof NET==='undefined'||!NET.user||!NET.sb){qSet(all);return;}
 qSet(all);try{NET.sb.from('tops_perf').upsert(all,{onConflict:'sample_id',ignoreDuplicates:true}).then(({error})=>{if(error){console.warn('tops_perf',error.message);return;}const ids=new Set(all.map(r=>r.sample_id));qSet(qGet().filter(r=>!ids.has(r.sample_id)));}).catch(()=>{});}catch(e){}}
// keepalive on page close: needs the URL, key and token prepared before (no async work while closing)
let KA=null;function prepKA(){try{if(typeof NET==='undefined'||!NET.sb||!NET.user)return;const u=NET.sb.supabaseUrl||(NET.sb.rest&&NET.sb.rest.url&&NET.sb.rest.url.replace(/\/rest\/v1$/,''));const k=NET.sb.supabaseKey;NET.sb.auth.getSession().then(({data})=>{const t=data&&data.session&&data.session.access_token;if(u&&k&&t)KA={u,k,t};}).catch(()=>{});}catch(e){}}
function keepalive(rows){try{if(!KA||!rows.length)return false;fetch(KA.u+'/rest/v1/tops_perf?on_conflict=sample_id',{method:'POST',keepalive:true,headers:{apikey:KA.k,Authorization:'Bearer '+KA.t,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(rows)}).catch(()=>{});return true;}catch(e){return false;}}
// --- lifecycle ---
function finish(status){if(!M||M.done)return null;M.done=true;ckSet(null);if(M.fn<30&&M.vis<5000){M=null;return null;}/* too short to say anything (an instant quit) */const row=build('end',status);M=null;return row;}
const _bm=beginMatch;beginMatch=function(){const prev=finish('interrupted');const r=_bm.apply(this,arguments);try{M=newM();prepKA();watchAudio();if(prev)idle(()=>send([prev]));}catch(e){}return r;};
const _em=endMatch;endMatch=function(){const r=_em.apply(this,arguments);try{const row=finish('complete');if(row)idle(()=>send([row]));}catch(e){}return r;};
{const q=document.getElementById('btnQuit');if(q)q.addEventListener('click',()=>{try{const row=finish('quit');if(row)idle(()=>send([row]));}catch(e){}},true);}
// hidden is a pause, not an exit: close the segment, store a checkpoint locally (no network); visible resumes the same match
document.addEventListener('visibilitychange',()=>{if(!M||M.done)return;if(document.hidden){M.hid++;try{const ck=build('end','interrupted');ck.sample_id='ck-'+M.id;ckSet(ck);}catch(e){}}else{M.skip=true;M.last=0;exp=0;}});/* the recovery checkpoint is never uploaded while its match can still finish */
addEventListener('pagehide',()=>{try{const row=finish('closed');/* finish clears this match's checkpoint; with no match open, an older one is left for the next load */const q=qGet();if(row)q.push(row);qSet(q);keepalive(q);}catch(e){}});
// flush anything queued once signed in (after load, off the hot path)
{const ck=ckGet();if(ck){ckSet(null);ck.sample_id=uid();qSet(qGet().concat([ck]));}}
// flush when signed in: after load, and every ~10 s while not pulling (catches a sign-in after the match); keepalive credentials refreshed
setTimeout(()=>idle(()=>{if(qGet().length)send([]);}),8000);
window.TOPS_perf={get m(){return M;},bench,build:(p,s)=>M&&build(p,s),queue:qGet,send,dev,_hook:typeof V!=='undefined'&&!!V.frame};
})();
</script>
