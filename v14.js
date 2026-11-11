<script>
(function(){
// ===== v14: flight recorder (Hayden via Overseer 08:01, 12 Nov; ChatGPT design 8.1 and code review 7.4 -> fixes below) =====
// A small ring of what happened, so a bug report can be read from tops_log instead of retested. Nothing per frame.
// Evidence is kept locally BEFORE any upload in a small pending queue (up to 3 unsent incidents + 1 checkpoint; an unsent incident is never
// replaced) and retried at the next signed-in foreground moment. Uploads: an error (first serious one kept and sent at once; later ones
// coalesce into one per 60 s, 10 a session), every match end, and when the page is hidden (primary exit; pagehide repeats with the same id),
// with fetch keepalive and a request body under 48 KiB. Resource snapshots name the owner (GPU counts + cached character templates) before
// and after a match's cleanup and with every tops_perf row. Text is redacted before it enters the ring. Insert-only own rows; 30-day
// retention (sql/tops_log.sql).
const CAP=300,BODY_MAX=48*1024,D_MAX=300,SCHEMA=1;
const rid=()=>{try{return crypto.randomUUID();}catch(e){return 'x'+Date.now().toString(36)+Math.random().toString(36).slice(2);}};
const SID=(()=>{try{let s=sessionStorage.getItem('tops_log_sid');if(!s){s=rid();sessionStorage.setItem('tops_log_sid',s);}return s;}catch(e){return rid();}})();/* the logical session (survives a reload in the same tab) */
const PAGE=rid();/* this document load */
const RING=new Array(CAP);let head=0,count=0,dropped=0,seq=0;
const T0=performance.now();const now=()=>Math.round(performance.now()-T0);
// ---- redaction: before anything enters the ring ----
const RED=[[/[\w.+-]+@[\w-]+\.[\w.-]+/g,'<email>'],[/eyJ[\w-]{8,}\.[\w-]{8,}\.[\w-]{8,}/g,'<jwt>'],[/\b(Bearer|apikey|token|key|secret|password)[=: ]+\S+/gi,'$1=<x>'],[/\b[A-Za-z0-9_]{32,}\b/g,'<id>'],[/[?#]\S*/g,'']];
function redact(s){s=String(s);for(const [re,to] of RED)s=s.replace(re,to);return s;}
function clean(d){if(d==null)return d;if(typeof d!=='object')return redact(d).slice(0,200);const o={};for(const k in d){const v=d[k];o[k]=(typeof v==='string')?redact(v).slice(0,160):v;}
 let s;try{s=JSON.stringify(o);}catch(e){return '?';}return s.length>D_MAX?s.slice(0,D_MAX)+'…':o;}/* objects capped at 300 chars of JSON */
// noisy kinds are coalesced (same kind + key within 10 s -> one event with a count) and budgeted (20 a minute each; suppressed counts per kind)
const NOISY={net_fail:1,warn:1,res_error:1,console_error:1},BUDGET=20;const bud={},lastBy={},supp={};let budMin=0;
function keyOf(k,d){if(!d||typeof d!=='object')return k+'|'+String(d).slice(0,60);const u=d.u?String(d.u).replace(/[^/]*$/,''):'';return k+'|'+u+'|'+(d.st||d.err||d.m||d.tag||'');}
const oldestQ=()=>seq-count+1;
let MID=null;/* current match id (stable, attached to match events) */
function log(k,d){try{const t=now();d=clean(d);if(NOISY[k]){const key=keyOf(k,d),prev=lastBy[key];if(prev&&prev.q>=oldestQ()&&t-prev.t<10000){prev.n=(prev.n||1)+1;prev.t2=t;return;}
  const m=Math.floor(t/60000);if(m!==budMin){budMin=m;for(const x in bud)delete bud[x];}bud[k]=(bud[k]||0)+1;if(bud[k]>BUDGET){supp[k]=(supp[k]||0)+1;return;}}
 const e={t,q:++seq,k};if(d!==undefined)e.d=d;if(MID&&/^(match|visit|res|perf)/.test(k))e.m=MID;if(NOISY[k])lastBy[keyOf(k,d)]=e;if(count===CAP)dropped++;else count++;RING[head]=e;head=(head+1)%CAP;}catch(x){}}
function events(){const out=[];for(let i=0;i<count;i++)out.push(RING[(head-count+i+CAP)%CAP]);return out;}
const VER=()=>window.TOPS_VER||'?';
// ---- resource snapshot: what exists and who owns it ----
let lastRes=null;
function res(when){try{const o={w:when};const r=window.TOPS_R;if(r&&r.info){o.geo=r.info.memory.geometries;o.tex=r.info.memory.textures;o.prog=r.info.programs?r.info.programs.length:null;o.calls=r.info.render.calls;o.tris=r.info.render.triangles;}
 const g=window.TOPS_RIGS&&TOPS_RIGS();if(g){o.chars=g.n;o.char_ids=g.ids.join(',');o.loading=g.wait;o.anims=g.anim;}lastRes=o;log('res',o);}catch(e){}}
// ---- what we record ----
function devInfo(){try{const d=window.TOPS_perf&&TOPS_perf.dev?TOPS_perf.dev():{};return Object.assign({standalone:!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches))},d);}catch(e){return {};}}
log('boot',{v:VER(),build:window.TOPS_BUILD||'',os:devInfo().os,osv:devInfo().os_major,br:devInfo().browser,brv:devInfo().browser_major,scr:devInfo().screen,dpr:devInfo().dpr,gpu:devInfo().gpu,sa:devInfo().standalone,page:PAGE});
let lastScreen=null;if(typeof showScreen==='function'){const ss=showScreen;showScreen=function(id){if(id!==lastScreen){lastScreen=id;log('screen',String(id));}return ss.apply(this,arguments);};}
let inMatch=false,matchN=0;
function leftMatch(how,extra){if(!inMatch)return;inMatch=false;const m=MID;log('match_end',Object.assign({how},extra||{}));
 setTimeout(()=>{if(MID===m&&!inMatch){res('after');}},1500);/* only if no new match has started meanwhile */upload('match_end');}
if(typeof beginMatch==='function'){const bm=beginMatch;beginMatch=function(o){if(inMatch)leftMatch('replaced');MID=rid().slice(0,8);matchN++;
 log('match_try',{opp:o&&o.oppName,legs:o&&o.legs,n:matchN});/* logged before, so a start that throws still shows */
 let r;try{r=bm.apply(this,arguments);}catch(err){log('error',errInfo('beginMatch failed: '+(err&&err.message),null,null,err));incident(true);throw err;}
 try{const c=typeof career==='function'?career():null;inMatch=true;visit=null;
  log('match_start',{mode:S&&(S.online?'online':S.mp?'local':S.practice?'practice':(c&&c.run?'run':'career')),tier:S&&S.tier&&S.tier.n,opp:o&&o.oppName,legs:o&&o.legs,n:matchN});res('start');}catch(e){}return r;};}
if(typeof endMatch==='function'){const em=endMatch;endMatch=function(){let info=null;try{info={won:!!(S&&S.won),legs:S&&S.p?S.p.map(p=>p.legs):null,avg:S&&S.p&&S.p[0]&&S.p[0].darts?+(S.p[0].pts/S.p[0].darts*3).toFixed(1):null};}catch(e){}
 flushVisit();if(inMatch)res('pre_end');/* before the game's own cleanup */const r=em.apply(this,arguments);if(inMatch)res('end');leftMatch('finished',info);return r;};}
{const q=document.getElementById('btnQuit');if(q)q.addEventListener('click',()=>{if(!inMatch)return;flushVisit();res('pre_end');leftMatch('quit');},true);/* capture phase: before the game's quit handler */}
// darts summarised per visit (one event per visit: who, the three scores, perfects) so a match doesn't flush the ring
let visit=null;function flushVisit(){if(visit&&visit.s.length){log('visit',{w:visit.w,s:visit.s.join(' '),p:visit.p});}visit=null;}
if(typeof land==='function'){const ld=land;land=function(x,y){let who=null;try{who=S.p[S.cur].ai?'opp':'me';}catch(e){}const perf=(()=>{try{return !!S.perfect;}catch(e){return false;}})();const r=ld.apply(this,arguments);
 try{if(who&&!S.bull){const h=typeof scoreAt==='function'?scoreAt(x,y):null;if(!visit||visit.w!==who||visit.s.length>=3){flushVisit();visit={w:who,s:[],p:0};}visit.s.push(h?h.label:'?');if(who==='me'&&perf)visit.p++;if(visit.s.length>=3)flushVisit();}}catch(e){}return r;};}
// errors and warnings (warnings carry cloud-save and telemetry failures)
function errInfo(m,src,line,err){return {m:String(m||'').slice(0,180),at:src?String(src).split(/[?#]/)[0].split('/').pop()+':'+(line||0):undefined,st:err&&err.stack?String(err.stack).split('\n').slice(1,4).map(s=>s.trim().split(/[?#]/)[0].replace(/^.*\//,'')).join(' | ').slice(0,200):undefined};}
addEventListener('error',e=>{if(e.target&&e.target!==window){log('res_error',{tag:e.target.tagName,src:String(e.target.src||e.target.href||'').split(/[?#]/)[0].split('/').pop().slice(0,80)});return;}log('error',errInfo(e.message,e.filename,e.lineno,e.error));incident(true);},true);
addEventListener('unhandledrejection',e=>{const r=e.reason;log('error',Object.assign({rej:1},errInfo(r&&r.message||String(r),null,null,r)));incident(true);});
for(const lvl of ['error','warn']){const o=console[lvl];if(!o||o.__fr)continue;let inside=false;const w=function(){if(!inside){inside=true;try{const m=Array.from(arguments).map(a=>a&&a.message?a.message:(typeof a==='object'?'[object]':String(a))).join(' ');log(lvl==='error'?'console_error':'warn',m.slice(0,200));if(lvl==='error')incident(false);}catch(e){}inside=false;}return o.apply(console,arguments);};w.__fr=true;console[lvl]=w;}
// network: failures (host + path only) and cloud-save successes; the recorder's own uploads aren't logged
if(window.fetch&&!window.fetch.__fr){const f0=window.fetch;const w=function(input){const t=performance.now();const url=(()=>{try{const s=input instanceof Request?input.url:(input instanceof URL?input.href:String(input));const u=new URL(s,location.href);return u.host+u.pathname;}catch(e){return '?';}})();if(/tops_log/.test(url))return f0.apply(this,arguments);
 return f0.apply(this,arguments).then(r=>{if(!r.ok)log('net_fail',{u:url.slice(0,100),st:r.status,ms:Math.round(performance.now()-t)});else if(/tops_saves/.test(url))log('cloud_save',{ms:Math.round(performance.now()-t)});return r;},e=>{log('net_fail',{u:url.slice(0,100),err:String(e&&e.message||e).slice(0,80),ms:Math.round(performance.now()-t)});throw e;});};w.__fr=true;window.fetch=w;}
// GPU (on loss, the last snapshot taken while the context was valid), visibility, audio
setTimeout(()=>{try{const cv=document.querySelector('canvas');if(cv){cv.addEventListener('webglcontextlost',()=>{log('gl_lost',lastRes?{last:lastRes.w,geo:lastRes.geo,tex:lastRes.tex,chars:lastRes.chars}:undefined);incident(true);});cv.addEventListener('webglcontextrestored',()=>log('gl_restored'));}}catch(e){}},0);
let auSeen=null;function watchAudio(){try{const c=(typeof AU!=='undefined')&&AU&&AU.ctx;if(c&&c!==auSeen){auSeen=c;log('audio',c.state);c.addEventListener('statechange',()=>log('audio',c.state));}}catch(e){}}
setInterval(watchAudio,2000);document.addEventListener('pointerdown',watchAudio,{passive:true,capture:true});/* the game creates its AudioContext on the first tap */
// each tops_perf row (30 s checkpoint, end) as a compact performance line + a resource snapshot with the cached characters
{const prev=window.TOPS_LOG_PERF;window.TOPS_LOG_PERF=r=>{try{if(prev)prev(r);}catch(e){}try{log('perf',{ph:r.phase,st:r.status,ix:r.match_index,fps:r.fps,p95:r.p95,o100:r.stalls100,max:r.max_ms,ret:r.reticle_p95,au:r.audio_issue_n,geo:r.geometries,tex:r.textures,prog:r.programs,mb:r.tex_mb});res('perf');}catch(e){}};}
// ---- evidence and upload ----
const QK='tops_logq',INC_MAX=3;
const enc=s=>{try{return new TextEncoder().encode(s).length;}catch(e){return s.length*3;}};
// the body is measured exactly as sent; trimming continues until it fits (oldest events first)
function row(reason){let ev=events();const head0={upload_id:rid(),session_id:SID,page_id:PAGE,schema_ver:SCHEMA,ver:VER(),reason,dropped,suppressed:Object.keys(supp).length?Object.assign({},supp):null,seq_first:null,seq_last:null,trimmed_events:0,bytes:0,events:ev};
 const fit=()=>{head0.seq_first=ev.length?ev[0].q:null;head0.seq_last=ev.length?ev[ev.length-1].q:null;head0.events=ev;head0.bytes=0;let txt=JSON.stringify(head0);let n=enc(txt);head0.bytes=n;txt=JSON.stringify(head0);return enc(txt);};
 let n=fit();const total=ev.length;while(n>BODY_MAX&&ev.length){ev=ev.slice(Math.max(1,Math.ceil(ev.length/8)));head0.trimmed_events=total-ev.length;n=fit();}return head0;}
function qGet(){try{return JSON.parse(localStorage.getItem(QK)||'[]');}catch(e){return [];}}
let failN=0,lastFail=null;
function qSet(q){try{localStorage.setItem(QK,JSON.stringify(q));return true;}catch(e){/* quota: drop the checkpoint, then the oldest incident, and try again */try{const q2=q.filter(r=>r.reason==='error');if(q2.length>1)q2.shift();localStorage.setItem(QK,JSON.stringify(q2));}catch(x){}return false;}}
// an unsent incident is never replaced: up to 3 are kept; at the limit the NEWEST pending incident is refreshed with the current ring
// (it carries everything since); checkpoints keep only the latest
function keep(r){const q=qGet();const same=q.findIndex(x=>x.upload_id===r.upload_id);if(same>=0){q.splice(same,1,r);qSet(q);return;}/* a refresh of a pending row keeps its id */
 if(r.reason==='error'){const inc=q.filter(x=>x.reason==='error');if(inc.length>=INC_MAX){const last=inc[inc.length-1];r.upload_id=last.upload_id;q.splice(q.indexOf(last),1,r);}else q.push(r);}
 else{const i=q.findIndex(x=>x.reason!=='error');if(i>=0)q.splice(i,1,r);else q.push(r);}qSet(q);}
function release(id){qSet(qGet().filter(r=>r.upload_id!==id));}
let KA=null;const signedIn=()=>typeof NET!=='undefined'&&NET.user&&NET.sb;
function prepKA(){try{if(!signedIn()){KA=null;return;}const u=NET.sb.supabaseUrl,k=NET.sb.supabaseKey,who=NET.user.id;NET.sb.auth.getSession().then(({data})=>{const s=data&&data.session;KA=(u&&k&&s&&s.access_token&&(!s.user||s.user.id===who))?{u,k,t:s.access_token,who}:null;}).catch(()=>{KA=null;});}catch(e){KA=null;}}
const inflight=new Set();
function insert(r){if(!signedIn()||inflight.has(r.upload_id))return;inflight.add(r.upload_id);
 try{NET.sb.from('tops_log').upsert(r,{onConflict:'upload_id',ignoreDuplicates:true}).then(({error})=>{inflight.delete(r.upload_id);if(!error)release(r.upload_id);else{failN++;lastFail=String(error.code||error.message||'?').slice(0,40);}}).catch(()=>{inflight.delete(r.upload_id);failN++;});}catch(e){inflight.delete(r.upload_id);}}
function beacon(r){if(!KA||!signedIn()||KA.who!==NET.user.id)return;/* never with another account's token */try{fetch(KA.u+'/rest/v1/tops_log?on_conflict=upload_id',{method:'POST',keepalive:true,headers:{apikey:KA.k,Authorization:'Bearer '+KA.t,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(r)}).then(x=>{if(x.ok)release(r.upload_id);}).catch(()=>{});}catch(e){}}
const idle=f=>{let done=false;const go=()=>{if(done)return;done=true;f();};try{if(window.requestIdleCallback)requestIdleCallback(go,{timeout:2000});}catch(e){}setTimeout(go,2500);/* never starve */};
// wait for the player's pull to finish, but at most 20 s
function whenNotPulling(f){const t0=Date.now();const go=()=>{try{if(typeof S!=='undefined'&&S&&S.pulling&&Date.now()-t0<20000){setTimeout(go,800);return;}}catch(e){}f();};idle(go);}
// errors: a serious one (exception, rejection, GL loss) is kept at once; console.error and later errors only mark the log dirty, and one
// coalesced snapshot is kept + sent per 60 s (10 a session), carrying everything since
let errUps=0,lastErrUp=0,errTimer=null,dirty=false;
let lastKeep=0,pendInc=null;
function incident(serious){try{if(serious&&Date.now()-lastKeep>10000){lastKeep=Date.now();const r0=row('error');if(pendInc)r0.upload_id=pendInc;pendInc=r0.upload_id;keep(r0);/* a serious incident is on disk at once (at most every 10 s), whatever the upload timer is doing */}
 if(errTimer||errUps>=10){dirty=true;return;}
 const go=()=>{errTimer=null;dirty=false;errUps++;lastErrUp=Date.now();const r=row('error');if(pendInc){r.upload_id=pendInc;pendInc=null;}/* the upload replaces the copy kept at once */keep(r);whenNotPulling(()=>{prepKA();insert(r);});};
 const wait=errUps?Math.max(0,60000-(Date.now()-lastErrUp)):0;errTimer=setTimeout(()=>idle(go),wait);
 if(!errUps){/* during the cooldown more errors just set dirty; one follow-up carries them */}}catch(e){}}
setInterval(()=>{if(dirty&&!errTimer&&errUps<10){dirty=false;incident(false);}},15000);
function upload(reason){try{whenNotPulling(()=>{const r=row(reason);keep(r);prepKA();insert(r);});}catch(e){}}/* match end: built and kept off the end-of-match path */
// hidden is the reliable exit on iOS (pagehide may never come): keep + send now with keepalive; pagehide repeats it (same upload_id)
let hideRow=null;function onHide(why){try{log('vis',why);if(!hideRow){hideRow=row('pagehide');}keep(hideRow);beacon(hideRow);}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)onHide('hidden');else{hideRow=null;log('vis','visible');retry();}});
addEventListener('pagehide',()=>onHide('pagehide'));
// anything left in the queue (a failed upload, a killed page, a guest) goes up at the next signed-in foreground moment; a guest's queue is
// only sent for the account that signs in on this page load (not attributed to a later, different account on a shared phone)
let firstUser=null;
function retry(){if(!signedIn())return;if(firstUser&&firstUser!==NET.user.id){qSet([]);firstUser=NET.user.id;return;}firstUser=NET.user.id;prepKA();for(const r of qGet())insert(r);}
setInterval(()=>{if(!document.hidden){prepKA();retry();}},15000);/* also keeps the keepalive token fresh and clears it after sign-out */
setTimeout(retry,6000);
window.TOPS_LOG={log,events,res,row,retry,incident,upload,queue:qGet,get dropped(){return dropped;},get failures(){return {n:failN,last:lastFail};},_err:()=>({errUps,timer:!!errTimer,dirty,lastErrUp,inflight:inflight.size,q:qGet().map(r=>r.reason)}),sid:SID,page:PAGE};
})();
</script>
