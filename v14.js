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
function cl(v,depth){if(v==null||typeof v==='number'||typeof v==='boolean')return v;if(typeof v==='string')return redact(v).slice(0,160);if(depth>=2)return '[nested]';if(Array.isArray(v))return v.slice(0,10).map(x=>cl(x,depth+1));if(typeof v==='object'){const o={};for(const k of Object.keys(v).slice(0,20))o[k]=cl(v[k],depth+1);return o;}return String(v).slice(0,40);}
function clean(d){if(d==null)return d;if(typeof d!=='object')return redact(d).slice(0,200);const o=cl(d,0);/* keep a valid structured subset under 300 chars: drop the last fields until it fits */
 const ks=Object.keys(o);let s=JSON.stringify(o);while(s.length>D_MAX&&ks.length>1){delete o[ks.pop()];o._cut=1;s=JSON.stringify(o);}return s.length>D_MAX?{_cut:1}:o;}
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
function leftMatch(how,extra){if(!inMatch)return;try{slowFlush();}catch(e){}inMatch=false;try{if(atBreak.length)idle(flushBreak);}catch(e){}/* anything held during the match goes now */const m=MID;log('match_end',Object.assign({how},extra||{}));
 setTimeout(()=>{if(MID===m&&!inMatch){res('after');}},1500);/* only if no new match has started meanwhile */upload('match_end');}
if(typeof beginMatch==='function'){const bm=beginMatch;beginMatch=function(o){try{if(pendBuild)pendBuild();}catch(e){}if(inMatch)leftMatch('replaced');MID=rid().slice(0,8);matchN++;
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
for(const lvl of ['error','warn']){const o=console[lvl];if(!o||o.__fr)continue;let inside=false;const w=function(){if(!inside){inside=true;try{const m=Array.from(arguments).map(a=>a&&a.message?a.message:(typeof a==='object'?'[object]':String(a))).join(' ');if(!(lvl==='error'&&shaderConsole(Array.from(arguments)))){log(lvl==='error'?'console_error':'warn',m.slice(0,200));if(lvl==='error')incident(false);}}catch(e){}inside=false;}return o.apply(console,arguments);};w.__fr=true;console[lvl]=w;}
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
function row(reason){let ev=JSON.parse(JSON.stringify(events()));/* ChatGPT r5 P0: a detached copy: the coalescer later updates ring events (n, t2) in place, and a built row must never change */const head0={made:Date.now(),upload_id:rid(),session_id:SID,page_id:PAGE,schema_ver:SCHEMA,ver:VER(),reason,dropped,suppressed:Object.keys(supp).length?Object.assign({},supp):null,seq_first:null,seq_last:null,trimmed_events:0,bytes:0,events:ev};
 const fit=()=>{head0.seq_first=ev.length?ev[0].q:null;head0.seq_last=ev.length?ev[ev.length-1].q:null;head0.events=ev;head0.diag=diag();let n=0;for(let i=0;i<4;i++){head0.bytes=n;const w=Object.assign({},head0);delete w.made;delete w.rev;const m=enc(JSON.stringify(w));if(m===n)break;n=m;}head0.bytes=n;return n;};/* measured on the body actually sent (local fields stripped), its own digits included (ChatGPT r3 P1-2) */
 let n=fit();const total=ev.length;while(n>BODY_MAX&&ev.length){ev=ev.slice(Math.max(1,Math.ceil(ev.length/8)));head0.trimmed_events=total-ev.length;n=fit();}return head0;}
const OWN='tops_logq_owner';
let mem=null,memOnly=false;/* ChatGPT r3 P0-1: once a write fails, the in-memory queue is the truth (the disk copy is stale) until a full write succeeds */
function qGet(){if(memOnly&&mem)return mem.slice();try{const v=localStorage.getItem(QK);return v?JSON.parse(v):(mem||[]);}catch(e){return mem||[];}}
let failN=0,lastFail=null,keepFail=0,incOverflow=0,ckOverflow=0,lastOk=0;const submitted=new Set();
function qSet(q){mem=q.slice();try{localStorage.setItem(QK,JSON.stringify(q));memOnly=false;return true;}catch(e){keepFail++;memOnly=true;/* the full queue lives in memory for this page; disk keeps what fits (incidents first) for the next load */try{localStorage.setItem(QK,JSON.stringify(q.filter(r=>r.reason==='error')));}catch(x){}return 'memory';}}/* truthy 'memory' = kept for this page only; true = on disk; false = not kept (overflow) */
let revN=0;
// a row's payload is immutable once it has been sent: refreshing it then makes a NEW row (new id); an unsent row may be refreshed in place.
// Up to 3 unsent incidents are kept; a 4th is not added (counted in diag.inc_overflow) - its events stay in the ring for the next upload.
function keep(r){r.rev=++revN;const q=qGet();const same=q.findIndex(x=>x.upload_id===r.upload_id);
 if(same>=0){if(submitted.has(r.upload_id)||inflight.has(r.upload_id)){r.upload_id=rid();}else{q.splice(same,1,r);return qSet(q);}}
 if(r.reason==='error'){if(q.filter(x=>x.reason==='error').length>=INC_MAX){incOverflow++;return false;}q.push(r);}
 else{const k=q.findIndex(x=>x.reason!=='error'&&!inflight.has(x.upload_id));if(k>=0)q.splice(k,1,r);else if(q.filter(x=>x.reason!=='error').length<2)q.push(r);else{ckOverflow++;return false;}}/* ChatGPT r4 P1-5: at most 2 checkpoints (one may be in flight) */return qSet(q);}
function release(id,rev){if(inMatch&&!sendOk()){atBreak.push(()=>release(id,rev));return;}/* ChatGPT r5 P1: no storage write during play */qSet(qGet().filter(r=>!(r.upload_id===id&&r.rev===rev)));/* only the exact version that was sent */}
function diag(){let oldest=null;try{const q=qGet();for(const r of q)if(r.made&&(oldest==null||r.made<oldest))oldest=r.made;}catch(e){}
 return {persist:memOnly?'memory':'disk'/* storage state when this row was built */,ck_overflow:ckOverflow,fail_n:failN,last_fail:lastFail,keep_fail:keepFail,inc_overflow:incOverflow,last_ok_age_s:lastOk?Math.round((Date.now()-lastOk)/1000):null,oldest_pending_age_s:oldest?Math.round((Date.now()-oldest)/1000):null};}
let KA=null;const signedIn=()=>typeof NET!=='undefined'&&NET.user&&NET.sb;
function prepKA(){try{if(!signedIn()){KA=null;return;}const u=NET.sb.supabaseUrl,k=NET.sb.supabaseKey,who=NET.user.id;NET.sb.auth.getSession().then(({data})=>{const s=data&&data.session;KA=(u&&k&&s&&s.access_token&&(!s.user||s.user.id===who))?{u,k,t:s.access_token,who}:null;}).catch(()=>{KA=null;});}catch(e){KA=null;}}
const inflight=new Set();
const wire=r=>{const o=Object.assign({},r);delete o.rev;delete o.made;return o;};/* local bookkeeping fields aren't sent */
// ChatGPT r4 P0-1/2: the final check is where the request starts, not where it was scheduled: during a match only inside a quiet leg break
let brkUntil=0;const held=new Set();function between(){try{return typeof S!=='undefined'&&!!S&&!!S.bull;}catch(e){return false;}}/* the who-throws-first card: shown from a leg's end until the player taps; quiet() alone is also true while aiming */
function sendOk(){return !inMatch||(Date.now()<brkUntil&&quiet()&&between());}
function insert(r){if(!signedIn()||inflight.has(r.upload_id))return;if(!sendOk()){if(!held.has(r.upload_id)){held.add(r.upload_id);atBreak.push(()=>{held.delete(r.upload_id);insert(r);});}return;}inflight.add(r.upload_id);submitted.add(r.upload_id);const rev=r.rev;
 try{NET.sb.from('tops_log').insert(wire(r)).then(({error,status})=>{inflight.delete(r.upload_id);if(!error||dupErr(error,status)){lastOk=Date.now();release(r.upload_id,rev);/* plain INSERT (the table grants INSERT only, Q&D 09:03); a duplicate upload_id means it's already stored */}else{failN++;lastFail=String(error.code||error.message||'?').slice(0,40);}}).catch(()=>{inflight.delete(r.upload_id);failN++;});}catch(e){inflight.delete(r.upload_id);}}
function beacon(r){if(!KA||!signedIn()||KA.who!==NET.user.id)return;/* never with another account's token */submitted.add(r.upload_id);const rev=r.rev;try{fetch(KA.u+'/rest/v1/tops_log',{method:'POST',keepalive:true,headers:{apikey:KA.k,Authorization:'Bearer '+KA.t,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(wire(r))}).then(x=>{if(x.ok){/* a keepalive 409 isn't proof it's stored: the row stays queued and the next insert() decides by its error code */lastOk=Date.now();release(r.upload_id,rev);}}).catch(()=>{});}catch(e){}}
const idle=f=>{let done=false;const go=()=>{if(done)return;done=true;f();};try{if(window.requestIdleCallback)requestIdleCallback(go,{timeout:2000});}catch(e){}setTimeout(go,2500);/* never starve */};
// wait for the player's pull to finish, but at most 20 s
function dupErr(e,st){return !!(e&&(e.code==='23505'||/duplicate key value violates unique constraint/i.test(e.message||''))&&/upload_id/.test((e.message||'')+' '+(e.details||'')));}/* ChatGPT r5 P1: only the upload_id unique constraint (tops_log_upload_id_key) *//* ChatGPT r4 P0-3: a 409 can also be a foreign-key error (23503); only a unique violation means it's stored */
// uploads never go during play (Q&D 08:23 / 11:00): outside a match at once (idle); during a match only at a real break (a leg end at a
// quiet moment: no pull, not busy, no dart in the air) or at the match end. Evidence is already on disk, so waiting costs nothing.
let atBreak=[];function quiet(){try{if(typeof S==='undefined'||!S)return true;if(S.pulling||S.busy)return false;const d=typeof V!=='undefined'&&V&&V._qa&&V._qa.darts?V._qa.darts():null;return !(d&&d.flying);}catch(e){return false;}}
function whenNotPulling(f){try{if(!inMatch){idle(f);return;}atBreak.push(f);}catch(e){}}
function flushBreak(){try{const fs=atBreak;atBreak=[];fs.forEach(f=>{try{f();}catch(e){}});}catch(e){}}
function legBreak(m,tries){try{if(MID!==m||!inMatch)return;if(!quiet()||!between()){if((tries||0)<60)setTimeout(()=>legBreak(m,(tries||0)+1),250);return;}/* look again for up to 15 s (the leg-end banner keeps the game busy first); else the next break or the match end */brkUntil=Date.now()+3000;/* the break window; insert() rechecks quiet() at send time */if(atBreak.length)flushBreak();}catch(e){}}
if(typeof endLeg==='function'){const el0=endLeg;endLeg=function(){const r=el0.apply(this,arguments);try{if(inMatch&&atBreak.length){const m=MID;setTimeout(()=>legBreak(m,0),600);}}catch(e){}return r;};}
// errors: a serious one (exception, rejection, GL loss) is kept at once; console.error and later errors only mark the log dirty, and one
// coalesced snapshot is kept + sent per 60 s (10 a session), carrying everything since
let errUps=0,lastErrUp=0,errTimer=null,dirty=false;
let lastKeep=0,pendInc=null;
function incident(serious){try{if(serious&&Date.now()-lastKeep>10000){lastKeep=Date.now();const r0=row('error');if(pendInc&&!submitted.has(pendInc))r0.upload_id=pendInc;if(keep(r0))pendInc=r0.upload_id;/* a serious incident is on disk at once (at most every 10 s), whatever the upload timer is doing */}
 if(errTimer||errUps>=10){dirty=true;return;}
 const go=()=>{errTimer=null;dirty=false;errUps++;lastErrUp=Date.now();const r=row('error');if(pendInc&&!submitted.has(pendInc)){r.upload_id=pendInc;}pendInc=null;/* the upload replaces the copy kept at once (unless that one already went) */keep(r);whenNotPulling(()=>{prepKA();insert(r);});};
 const wait=errUps?Math.max(0,60000-(Date.now()-lastErrUp)):0;errTimer=setTimeout(()=>idle(go),wait);
 if(!errUps){/* during the cooldown more errors just set dirty; one follow-up carries them */}}catch(e){}}
setInterval(()=>{if(dirty&&!errTimer&&errUps<10){dirty=false;incident(false);}},15000);
// ChatGPT r4 P1-4: the match-end row is built off the end-of-match path (idle), but always before the next match starts (beginMatch runs it first)
let pendBuild=null;function upload(reason){try{if(pendBuild)pendBuild();/* ChatGPT r5 P2: an earlier pending row is built first, never replaced */const b=()=>{if(pendBuild!==b)return;pendBuild=null;const r=row(reason);keep(r);prepKA();whenNotPulling(()=>insert(r));};pendBuild=b;idle(b);}catch(e){}}/* match end: built and kept off the end-of-match path */
// hidden is the reliable exit on iOS (pagehide may never come): keep + send now with keepalive; pagehide repeats it (same upload_id)
let hideRow=null;function onHide(why){try{log('vis',why);if(!hideRow){hideRow=row('pagehide');keep(hideRow);}beacon(hideRow);/* pagehide after hidden re-sends the identical row (same id, no duplicate) */}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)onHide('hidden');else{hideRow=null;log('vis','visible');if(!inMatch)retry();}});
addEventListener('pagehide',()=>onHide('pagehide'));
// anything left in the queue (a failed upload, a killed page, a guest) goes up at the next signed-in foreground moment; a guest's queue is
// only sent for the account that signs in on this page load (not attributed to a later, different account on a shared phone)
function retry(){if(!signedIn()||inMatch)return;/* never during a match (incl. the 6 s startup retry) */let own=null;try{own=localStorage.getItem(OWN);}catch(e){}
 if(own&&own!==NET.user.id){qSet([]);try{localStorage.setItem(OWN,NET.user.id);}catch(e){}return;}/* a different account on this phone: the old queue isn't sent as theirs */
 if(!own){try{localStorage.setItem(OWN,NET.user.id);}catch(e){}}prepKA();for(const r of qGet())insert(r);}
setInterval(()=>{if(!document.hidden&&!inMatch){prepKA();retry();if(atBreak.length)idle(flushBreak);}},15000);/* never during a match *//* also keeps the keepalive token fresh and clears it after sign-out */
setTimeout(retry,6000);
// ===== CAR-6: diagnostics that name the cause (Overseer 15:21, after R0 #19; ChatGPT design 7.5 -> its 3 changes applied) =====
// Per frame only an O(n<=~60) signature of the program cache (ids summed, no allocation) and a slow-run counter. Everything heavier
// (scene traversal, attribution, health checks, diffs, the thumbnail) waits for a quiet moment (not aiming, pulling or darts flying).
// No WebGL patching: three.js r128's own renderer.info.programs, renderer.properties and program.diagnostics.
const BIG_MAX=2600,THUMB_MAX=12000;
const RED_SH=RED.filter(r=>String(r[0])!==String(/\b[A-Za-z0-9_]{32,}\b/g));/* shader logs: no long-identifier rule (it would hide the failing GLSL/MSL function name; shader text carries no user data) */
function bigText(s,n){s=String(s);for(const [re,to] of RED_SH)s=s.replace(re,to);return s.slice(0,n);}
function logBig(k,o,cap){try{cap=cap||BIG_MAX;let s=JSON.stringify(o);if(s.length>cap&&o.img){return null;}/* thumbnails: own documented cap, never trimmed into a broken image */if(s.length>cap){if(o.log)o.log=String(o.log).slice(0,Math.max(200,o.log.length-(s.length-cap)));s=JSON.stringify(o);}if(s.length>cap)return null;
 const t=now();const e={t,q:++seq,k,d:JSON.parse(s)};if(MID)e.m=MID;if(count===CAP)dropped++;else count++;RING[head]=e;head=(head+1)%CAP;return e;}catch(x){return null;}}
const SHADER_RE=/WebGLProgram|shader|MSL|getProgramInfoLog/i;
let progSig=-1,progLen=-1,progIds=new Set(),progPend=[],pendFail=null,diagPend=false,fails=0;
const R_=()=>{try{return window.TOPS_R||(typeof V!=='undefined'&&V&&V._qa&&V._qa.renderer)||null;}catch(e){return null;}};
const SC_=()=>{try{return (typeof V!=='undefined'&&V&&V._qa&&V._qa.scene)||null;}catch(e){return null;}};
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
// full console text for shader errors (the generic console_error keeps 200 chars): captured from the console arguments themselves
function shaderConsole(args){try{const txt=args.map(a=>a&&a.message?a.message:(typeof a==='object'?'':String(a))).join(' ');if(!SHADER_RE.test(txt))return false;
 fails++;pendFail={t:now(),log:bigText(txt,2000)};diagPend=true;thumbWant('shader_fail');/* attribution + upload at the next quiet moment */
 logBig('shader_fail',{log:pendFail.log,scr:lastScreen,n:fails});incident(true);return true;}catch(e){return false;}}
// per frame (after the game's own frame): program-cache signature and the slow-frame run
let lastF=0,slowRun=0,slowFired=false;
let pgSeq=0;let domQ=[],domBusy=false;let SL=[],SLn=0,SLt={js:0,rnd:0,o:0,dom:0};
function slow(it){try{SLn++;SLt.js+=it.js||0;SLt.rnd+=it.rnd||0;SLt.o+=it.other||0;const row=[it.s,it.f,Math.round(it.js||0),Math.round(it.rnd||0),it.other||0,null,it.ph,it.mq_max||0];if(SL.length<60)SL.push(row);if(domQ.length<60)domQ.push([it,row,performance.now()]);}catch(e){}}
/* DOM size for slow frames: counted once at the next quiet idle moment and written back into every waiting row (dom_lag = ms after the frame) */
function domFill(){try{if(!domQ.length)return;const n=document.getElementsByTagName('*').length,t=performance.now();for(const [it,row,at] of domQ){it.dom=n;it.dom_lag=Math.round(t-at);row[5]=n;}if(n>SLt.dom)SLt.dom=n;domQ=[];}catch(e){domQ=[];}}
function domIdle(){if(domBusy)return;domBusy=true;const go=()=>{domBusy=false;if(quiet())domFill();};try{if(window.requestIdleCallback)requestIdleCallback(go,{timeout:1000});else setTimeout(go,200);}catch(e){setTimeout(go,200);}}
function slowFlush(){try{domFill();/* match end is a break: fill any still waiting */if(!SLn)return;logBig('slow_sum',{n:SLn,js:Math.round(SLt.js),rnd:Math.round(SLt.rnd),other:Math.round(SLt.o),dom_max:SLt.dom,cols:'s,f,js,rnd,other,dom,ph,mq_max',f:SL});}catch(e){}SL=[];SLn=0;SLt={js:0,rnd:0,o:0,dom:0};}
function frameTick(nowT){try{const PGx=window.TOPS_PG;if(PGx&&(PGx.failSeq|0)!==pgSeq){diagPend=true;thumbWant('shader_fail');}const R=R_();const P=R&&R.info&&R.info.programs;if(P){let s=P.length*1000003;for(let i=0;i<P.length;i++)s+=P[i].id*(i+7);if(s!==progSig){progSig=s;progLen=P.length;onProgChange(P,nowT-lastF);}}
 const d=lastF?nowT-lastF:0;lastF=nowT;if(inMatch&&d>50&&d<5000){slowRun+=d;if(slowRun>=2000&&!slowFired){slowFired=true;thumbWant('slow2s');log('slow_run',{ms:Math.round(slowRun),scr:lastScreen});}}else if(d<=50)slowRun=0;/* 2 s of back-to-back frames over 50 ms, once a match */
 if(thumbReq&&quiet())thumbShot();
 if(domQ.length&&!domBusy&&quiet())domIdle();
 if((diagPend||healthDue())&&quiet()&&!thumbBusy)idleDiag();}catch(e){}}
// a change in the program cache: which programs came and went (ids only now; names and owners at the quiet moment)
function onProgChange(P,frameMs){const ids=new Set();const add=[];for(const p of P){ids.add(p.id);if(!progIds.has(p.id))add.push(p);}let gone=0;for(const id of progIds)if(!ids.has(id))gone++;progIds=ids;
 if(!add.length&&!gone)return;for(const p of add){progPend.push(p);if(progPend.length>40)progPend.shift();}
 log('prog',{n:P.length,add:add.length,gone,ms:Math.round(frameMs||0),scr:lastScreen});
 for(const p of add)if(p.diagnostics&&p.diagnostics.runnable===false){diagPend=true;thumbWant('shader_fail');}diagPend=diagPend||add.length>0;}
// which mesh/material uses each program (one traversal, quiet moments only)
function owners(){const R=R_(),sc=SC_();const map=new Map();if(!R||!sc||!R.properties)return map;sc.traverse(o=>{if(!o.material)return;const ms=Array.isArray(o.material)?o.material:[o.material];
 for(const m of ms){let pr=null;try{pr=R.properties.get(m);}catch(e){}const cp=pr&&pr.currentProgram;if(!cp)continue;let a=map.get(cp.id);if(!a){a=[];map.set(cp.id,a);}if(a.length<3)a.push(tagOf(o)+'/'+(m.name||m.type));}});return map;}
function tagOf(o){let q=o,path=[];for(let i=0;q&&i<4;i++){const n=(q.userData&&(q.userData.ck||q.userData.tag))||q.name;if(n)path.push(n);q=q.parent;}return path.slice(0,2).join('<')||o.type;}
function lightCounts(){const sc=SC_();const c={dir:0,point:0,spot:0,hemi:0,amb:0,rect:0,shadow:0};if(!sc)return c;sc.traverse(o=>{if(!o.isLight)return;let v=true,q=o;while(q){if(!q.visible){v=false;break;}q=q.parent;}if(!v)return;
 if(o.isDirectionalLight)c.dir++;else if(o.isPointLight)c.point++;else if(o.isSpotLight)c.spot++;else if(o.isHemisphereLight)c.hemi++;else if(o.isAmbientLight)c.amb++;else if(o.isRectAreaLight)c.rect++;if(o.castShadow)c.shadow++;});return c;}
function defs(p){const pre=p&&p.diagnostics&&p.diagnostics.fragmentShader?(p.diagnostics.fragmentShader.prefix||''):'';const o={};for(const k of ['NUM_DIR_LIGHTS','NUM_POINT_LIGHTS','NUM_SPOT_LIGHTS','NUM_HEMI_LIGHTS','NUM_DIR_LIGHT_SHADOWS','NUM_SPOT_LIGHT_SHADOWS','NUM_POINT_LIGHT_SHADOWS']){const m=pre.match(new RegExp('#define '+k+' (\\d+)'));if(m)o[k.replace('NUM_','').toLowerCase()]=+m[1];}
 for(const k of ['USE_MAP','USE_ENVMAP','USE_SKINNING','USE_FOG','USE_SHADOWMAP','USE_BUMPMAP','USE_NORMALMAP','USE_EMISSIVEMAP','USE_INSTANCING','PHYSICAL'])if(pre.indexOf('#define '+k)>=0)(o.on=o.on||[]).push(k.replace('USE_',''));return o;}
let idleBusy=false;function idleDiag(){if(idleBusy)return;idleBusy=true;const go=()=>{idleBusy=false;if(!quiet())return;try{runDiag();}catch(e){}};try{if(window.requestIdleCallback)requestIdleCallback(go,{timeout:400});else setTimeout(go,0);}catch(e){setTimeout(go,0);}}
function runDiag(){const R=R_();if(!R)return;let own=null;
 if(diagPend){diagPend=false;own=owners();const lc=lightCounts();
  const news=progPend.splice(0);const bad=[];for(const p of news){const o={id:p.id,sh:p.name,key:hashStr(String(p.cacheKey||'')),by:own.get(p.id)||null};if(p.diagnostics&&p.diagnostics.runnable===false){o.fail=1;o.defs=defs(p);bad.push({p,o});}log('prog_new',o);}
  for(const p of (R.info.programs||[]))if(p.diagnostics&&p.diagnostics.runnable===false&&!bad.some(b=>b.p===p))bad.push({p,o:{id:p.id,sh:p.name,key:hashStr(String(p.cacheKey||'')),by:own.get(p.id)||null,defs:defs(p)}});
  for(const b of bad){const d=b.p.diagnostics;logBig('shader_fail_at',Object.assign({},b.o,{lights:lc,log:bigText([d.programLog,d.fragmentShader&&d.fragmentShader.log,d.vertexShader&&d.vertexShader.log].filter(Boolean).join(' | '),2000)}));}
  // #19's progRescue takes a failed program out of the cache inside the render call: it keeps what it rescued in TOPS_PG.failed
  const PGx=window.TOPS_PG;let resc=0;if(PGx&&PGx.failed&&(PGx.failSeq|0)!==pgSeq){const F=PGx.failed;const seq=PGx.failSeq|0;for(const r of F){if(r._car6||(r.seq|0)<=pgSeq)continue;r._car6=1;resc++;const d=r.diag||{};
   logBig('shader_fail_at',{sh:r.name,key:hashStr(String(r.key||'')),by:r.by,rescued:1,defs:defs({diagnostics:d}),lights:lc,log:bigText([d.programLog,d.fragmentShader&&d.fragmentShader.log,d.vertexShader&&d.vertexShader.log].filter(Boolean).join(' | '),2000)});}const lost=(seq-pgSeq)-resc;if(lost>0)log('shader_fail_lost',{n:lost});/* more failures than the list keeps */pgSeq=seq;}
  if(pendFail||bad.length||resc){pendFail=null;incident(true);}}
 health(own);}
// ---- match health: first quiet frame after the start, and again from 5 s in ----
let hDue=[],h1=null,boardFace=null;
function healthDue(){return hDue.length&&inMatch&&now()>=hDue[0].at;}
function findBoard(){const sc=SC_();if(!sc)return null;let best=null;sc.traverse(o=>{if(best||!o.isMesh||!o.geometry||o.geometry.type!=='CircleGeometry')return;const r=o.geometry.parameters&&o.geometry.parameters.radius;const mp=o.material&&o.material.map;if(r&&Math.abs(r-.2255)<.002&&mp&&mp.image&&mp.image.width>=1024)best=o;});return best;}
function objState(o){if(!o)return {ok:false,why:'missing'};const R=R_();let v=true,q=o;while(q){if(!q.visible){v=false;break;}q=q.parent;}const st={vis:v};let meshes=0,noProg=0,bad=0,noTex=0;
 o.traverse(m=>{if(!m.isMesh||!m.material)return;meshes++;const ms=Array.isArray(m.material)?m.material:[m.material];for(const mt of ms){let pr=null;try{pr=R.properties.get(mt);}catch(e){}const cp=pr&&pr.currentProgram;if(!cp)noProg++;else if(cp.diagnostics&&cp.diagnostics.runnable===false)bad++;const im=mt.map&&mt.map.image;if(mt.map&&(!im||(im.width===0)||(im.complete===false)))noTex++;}});
 Object.assign(st,{meshes,noProg,bad,noTex});return st;}
function health(own){if(!healthDue())return;const h=hDue.shift();const R=R_();if(!R)return;if(!boardFace||!boardFace.parent)boardFace=findBoard();
 const opp=(()=>{try{return V._qa.opp();}catch(e){return null;}})();const b=boardFace?objState(boardFace):{missing:1},o=opp?objState(opp):null;
 const progs=R.info.programs||[];const keys=progs.map(p=>hashStr(String(p.cacheKey||''))).sort();
 const fx=figInfo(),css=cssAnims();const snap={w:h.w,n:matchN,lights:lightCounts(),progs:progs.length,calls:R.info.render.calls,tris:R.info.render.triangles,geo:R.info.memory.geometries,tex:R.info.memory.textures,board:b,opp:o,figs:fx.n,by:fx.by,mixers:fx.mix,dom:document.getElementsByTagName('*').length,css:css.n,css_names:css.names};
 const miss=[];const late=h.w==='5s';const vsAI=(()=>{try{return !!(S&&S.p&&S.p[1]&&S.p[1].ai&&!S.practice);}catch(e){return false;}})();
 if(!boardFace){if(late)miss.push('board missing');}else if(b.vis===false)miss.push('board hidden');
 if(late&&vsAI&&!opp)miss.push('opponent missing');if(b.meshes&&(b.bad||(b.noProg&&late)))miss.push('board program '+(b.bad?'failed':'missing'));/* 'missing' only from 5 s in: the first frames may not have drawn it yet */if(b.noTex)miss.push('board texture');if(o&&o.bad)miss.push('opponent program failed');if(o&&o.noTex)miss.push('opponent texture');
 log('health',snap);if(miss.length){logBig('health_fail',{w:h.w,miss,board:b,opp:o,lights:snap.lights,progs:snap.progs});thumbWant('health_fail');incident(true);}
 if(h.w==='5s'){const k={keys,lights:snap.lights,figs:snap.figs,by:snap.by,mixers:snap.mixers,dom:snap.dom,css:snap.css,css_names:snap.css_names,calls:snap.calls,tris:snap.tris,geo:snap.geo,tex:snap.tex,progs:snap.progs};if(!h1)h1=k;else{const d={};const add=k.keys.filter(x=>h1.keys.indexOf(x)<0),gone=h1.keys.filter(x=>k.keys.indexOf(x)<0);if(add.length)d.prog_new=add.slice(0,12);if(gone.length)d.prog_gone=gone.length;
  for(const t in k.lights)if(k.lights[t]!==h1.lights[t])d['l_'+t]=h1.lights[t]+'>'+k.lights[t];if(k.figs!==h1.figs)d.figs=h1.figs+'>'+k.figs;d.geo=k.geo-h1.geo;d.tex=k.tex-h1.tex;d.progs=h1.progs+'>'+k.progs;
  /* R0 #20 counters: always logged for match 2+, so one row compares every match with match 1 */d.by=h1.by+'>'+k.by;d.mixers=h1.mixers+'>'+k.mixers;d.dom=h1.dom+'>'+k.dom;d.css=h1.css+'>'+k.css;if(k.css!==h1.css)d.css_names=k.css_names;d.calls=h1.calls+'>'+k.calls;d.tris=h1.tris+'>'+k.tris;
  logBig('health_diff',d);}}}
function figInfo(){const sc=SC_();const o={n:0,by:'',mix:0};if(!sc)return o;const ks=[];sc.traverse(f=>{if(!(f.userData&&f.userData.ck))return;let v=true,q=f;while(q){if(!q.visible){v=false;break;}q=q.parent;}if(!v)return;o.n++;ks.push(f.userData.ck);const a=f.userData.act;if(f.userData.mixer&&a&&a.isRunning&&a.isRunning())o.mix++;});o.by=ks.sort().join(',');return o;}
function cssAnims(){try{if(!document.getAnimations)return {n:null,names:''};const r=document.getAnimations().filter(a=>a.playState==='running');return {n:r.length,names:r.slice(0,8).map(a=>(a.animationName||(a.effect&&a.effect.target&&a.effect.target.id)||'?')+'@'+((a.effect&&a.effect.target&&(a.effect.target.id||a.effect.target.className))||'').toString().slice(0,20)).join(' ')};}catch(e){return {n:null,names:''};}}
function visibleFigs(){const sc=SC_();let n=0;if(!sc)return 0;sc.traverse(o=>{if(!(o.userData&&o.userData.ck))return;let v=true,q=o;while(q){if(!q.visible){v=false;break;}q=q.parent;}if(v)n++;});return n;}
// ---- thumbnail: 160 px JPEG of our own canvas, right after a quiet render, max 2 a session, blank captures rejected ----
let thumbReq=null,thumbN=0,thumbBusy=false;function thumbWant(why){if(thumbN<2&&!thumbReq)thumbReq=why;}
function thumbShot(){const why=thumbReq;thumbReq=null;try{const R=R_();const cv=R&&R.domElement;if(!cv||!cv.width)return;const W=160,H=Math.max(1,Math.round(cv.height*W/cv.width));const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');const a=performance.now();
 x.drawImage(cv,0,0,W,H);/* same task as the render: the drawing buffer is still valid without preserveDrawingBuffer */const px=x.getImageData(0,0,W,H).data;let mn=765,mx=0;for(let i=0;i<px.length;i+=64){const v=px[i]+px[i+1]+px[i+2];if(v<mn)mn=v;if(v>mx)mx=v;}
 if(mx-mn<12){log('thumb_blank',{why});return;}thumbN++;thumbBusy=true;const cap=Math.round(performance.now()-a);
 const done=url=>{thumbBusy=false;/* THUMB_MAX: the one event allowed above 2.6 KB; the row stays under the 48 KiB body cap (row() trims oldest events) */if(!(url&&url.length<=THUMB_MAX&&logBig('thumb',{why,w:W,h:H,cap_ms:cap,img:url},THUMB_MAX+200)))log('thumb_big',{why,len:url?url.length:0});};
 if(c.toBlob)c.toBlob(bl=>{if(!bl){done(null);return;}const fr=new FileReader();fr.onload=()=>done(fr.result);fr.onerror=()=>done(null);fr.readAsDataURL(bl);},'image/jpeg',.5);else done(c.toDataURL('image/jpeg',.5));}catch(e){thumbBusy=false;}}
if(typeof V!=='undefined'&&V&&typeof V.frame==='function'){const vf2=V.frame;V.frame=function(nowT){const r=vf2.apply(this,arguments);/* the game's frame always runs first, outside any try */try{frameTick(typeof nowT==='number'?nowT:performance.now());}catch(e){}return r;};}
if(typeof beginMatch==='function'){const bm2=beginMatch;beginMatch=function(){const r=bm2.apply(this,arguments);try{slowRun=0;slowFired=false;const t=now();hDue=[{w:'start',at:t+1000},{w:'5s',at:t+5000}];}catch(e){}return r;};}
window.TOPS_LOG={log,events,slow:(it)=>slow(it),_car6:()=>({progLen,fails,thumbN,h1:!!h1,hDue:hDue.length,board:!!boardFace}),_health:()=>{hDue=[{w:'5s',at:0}];},_tick:t=>frameTick(t),res,row,retry,incident,upload,queue:qGet,_keep:keep,get dropped(){return dropped;},get failures(){return {n:failN,last:lastFail};},_brk:()=>({atBreak:atBreak.length,held:held.size,brkIn:brkUntil-Date.now(),inMatch,quiet:quiet(),pend:!!pendBuild}),_err:()=>({errUps,timer:!!errTimer,dirty,lastErrUp,inflight:inflight.size,q:qGet().map(r=>r.reason)}),sid:SID,page:PAGE};
})();
</script>
