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
 const g=window.TOPS_RIGS&&TOPS_RIGS();if(g){o.chars=g.n;o.char_ids=g.ids.join(',');o.loading=g.wait;o.anims=g.anim;if(g.animKeys&&g.animKeys.length)o.anim_keys=g.animKeys.join(',').slice(0,120);}lastRes=o;log('res',o);}catch(e){}}
// ---- what we record ----
function devInfo(){try{const d=window.TOPS_perf&&TOPS_perf.dev?TOPS_perf.dev():{};return Object.assign({standalone:!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches))},d);}catch(e){return {};}}
log('boot',{v:VER(),build:window.TOPS_BUILD||'',os:devInfo().os,osv:devInfo().os_major,br:devInfo().browser,brv:devInfo().browser_major,scr:devInfo().screen,dpr:devInfo().dpr,gpu:devInfo().gpu,sa:devInfo().standalone,page:PAGE});
let lastScreen=null;if(typeof showScreen==='function'){const ss=showScreen;showScreen=function(id){if(id!==lastScreen){lastScreen=id;log('screen',String(id));}return ss.apply(this,arguments);};}
let inMatch=false,matchN=0;
function leftMatch(how,extra){if(!inMatch)return;inMatch=false;try{if(atBreak.length)idle(flushBreak);}catch(e){}/* anything held during the match goes now */const m=MID;log('match_end',Object.assign({how},extra||{}));
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
window.TOPS_LOG={log,events,res,row,retry,incident,upload,queue:qGet,_keep:keep,get dropped(){return dropped;},get failures(){return {n:failN,last:lastFail};},_brk:()=>({atBreak:atBreak.length,held:held.size,brkIn:brkUntil-Date.now(),inMatch,quiet:quiet(),pend:!!pendBuild}),_err:()=>({errUps,timer:!!errTimer,dirty,lastErrUp,inflight:inflight.size,q:qGet().map(r=>r.reason)}),sid:SID,page:PAGE};
})();
</script>
