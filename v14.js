<script>
(function(){
// ===== v14: flight recorder (Hayden via Overseer 08:01, 12 Nov; ChatGPT design review 8.1 -> fixes below) =====
// A small ring of what happened, so a bug report can be read from tops_log instead of retested. Nothing per frame.
// Evidence is saved locally BEFORE any upload (two slots: latest incident + latest checkpoint) and retried at the next signed-in
// foreground moment. Uploads: an error (coalesced: first at once, then at most one per 60 s, 10 per session), every match end,
// and when the page is hidden (primary; pagehide is the backup), with fetch keepalive and a body under 48 KiB.
// Resource snapshots name the owner: GPU counts plus which character templates are cached (TOPS_RIGS), at match start, match end,
// 1.5 s after leaving a match (after any cleanup) and every tops_perf row. Insert-only own rows; 30-day retention (sql/tops_log.sql).
const CAP=300,BODY_MAX=48*1024,SID=(()=>{try{return crypto.randomUUID();}catch(e){return 's'+Date.now().toString(36)+Math.random().toString(36).slice(2);}})();
const RING=new Array(CAP);let head=0,count=0,dropped=0,seq=0;
const T0=performance.now();const now=()=>Math.round(performance.now()-T0);
const cut=(v,n)=>{const s=typeof v==='string'?v:(()=>{try{return JSON.stringify(v);}catch(e){return String(v);}})();return s&&s.length>n?s.slice(0,n)+'…':s;};
// noisy kinds are coalesced (same kind + key within 10 s -> one event with a count) and budgeted (20 a minute each, the rest counted);
// milestones (boot, screens, match start/end, visits, res, perf, errors) are never limited
const NOISY={net_fail:1,warn:1,res_error:1,console_error:1},BUDGET=20;const bud={},lastBy={};let budMin=0,skipped=0;
function keyOf(k,d){if(!d||typeof d!=='object')return k+'|'+String(d).slice(0,60);const u=d.u?String(d.u).replace(/[^/]*$/,''):'';return k+'|'+u+'|'+(d.st||d.err||d.m||d.tag||'');}
function log(k,d){try{const t=now();if(NOISY[k]){const key=keyOf(k,d),prev=lastBy[key];if(prev&&t-prev.t<10000){prev.n=(prev.n||1)+1;prev.t2=t;if(d&&d.u&&prev.d&&typeof prev.d==='object')prev.d.last=String(d.u).split('/').pop();return;}
  const m=Math.floor(t/60000);if(m!==budMin){budMin=m;for(const x in bud)delete bud[x];}bud[k]=(bud[k]||0)+1;if(bud[k]>BUDGET){skipped++;return;}}
 const e={t,q:++seq,k};if(d!==undefined)e.d=(d&&typeof d==='object')?d:cut(d,200);if(NOISY[k])lastBy[keyOf(k,d)]=e;if(count===CAP)dropped++;else count++;RING[head]=e;head=(head+1)%CAP;}catch(x){}}
function events(){const out=[];for(let i=0;i<count;i++)out.push(RING[(head-count+i+CAP)%CAP]);return out;}
const VER=()=>window.TOPS_VER||'?';
const uid=()=>{try{return crypto.randomUUID();}catch(e){return SID+'-'+seq+'-'+Math.random().toString(36).slice(2);}};
// ---- resource snapshot: what exists and who owns it ----
function res(when){try{const o={w:when};const r=window.TOPS_R;if(r&&r.info){o.geo=r.info.memory.geometries;o.tex=r.info.memory.textures;o.prog=r.info.programs?r.info.programs.length:null;o.calls=r.info.render.calls;o.tris=r.info.render.triangles;}
 const g=window.TOPS_RIGS&&TOPS_RIGS();if(g){o.chars=g.n;o.char_ids=g.ids.join(',');o.loading=g.wait;o.anims=g.anim;}
 const pm=window.TOPS_perf&&TOPS_perf.m&&TOPS_perf.m.mem0;if(pm&&pm.tex_mb!=null)o.tex_mb_est=pm.tex_mb;log('res',o);}catch(e){}}
// ---- what we record ----
function devInfo(){try{const d=window.TOPS_perf&&TOPS_perf.dev?TOPS_perf.dev():{};return Object.assign({standalone:!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches))},d);}catch(e){return {};}}
log('boot',{v:VER(),build:window.TOPS_BUILD||'',dev:devInfo(),sid:SID});
if(typeof showScreen==='function'){const ss=showScreen;showScreen=function(id){log('screen',String(id));return ss.apply(this,arguments);};}
let inMatch=false;
function leftMatch(how,extra){if(!inMatch)return;inMatch=false;log('match_end',Object.assign({how},extra||{}));res('end');setTimeout(()=>res('after'),1500);/* after the game's own cleanup */upload('match_end');}
if(typeof beginMatch==='function'){const bm=beginMatch;beginMatch=function(o){if(inMatch)leftMatch('replaced');const r=bm.apply(this,arguments);try{const c=typeof career==='function'?career():null;inMatch=true;visit=null;
 log('match_start',{mode:S&&(S.online?'online':S.mp?'local':S.practice?'practice':(c&&c.run?'run':'career')),tier:S&&S.tier&&S.tier.n,opp:o&&o.oppName,legs:o&&o.legs,ix:window.TOPS_perf&&TOPS_perf.m?TOPS_perf.m.ix:null});res('start');}catch(e){}return r;};}
if(typeof endMatch==='function'){const em=endMatch;endMatch=function(){let info=null;try{info={won:!!(S&&S.won),legs:S&&S.p?S.p.map(p=>p.legs):null,avg:S&&S.p&&S.p[0]&&S.p[0].darts?+(S.p[0].pts/S.p[0].darts*3).toFixed(1):null};}catch(e){}
 flushVisit();const r=em.apply(this,arguments);leftMatch('finished',info);return r;};}
{const q=document.getElementById('btnQuit');if(q)q.addEventListener('click',()=>{flushVisit();leftMatch('quit');},true);}
// darts summarised per visit (one event per visit: who, the three scores, perfects) so a match doesn't flush the ring
let visit=null;function flushVisit(){if(visit&&visit.s.length){log('visit',visit);}visit=null;}
if(typeof land==='function'){const ld=land;land=function(x,y){let who=null;try{who=S.p[S.cur].ai?'opp':'me';}catch(e){}const r=ld.apply(this,arguments);
 try{if(who&&!S.bull){const h=typeof scoreAt==='function'?scoreAt(x,y):null;if(!visit||visit.w!==who||visit.s.length>=3){flushVisit();visit={w:who,s:[],p:0};}visit.s.push(h?h.label:'?');if(who==='me'&&S.perfect)visit.p++;if(visit.s.length>=3)flushVisit();}}catch(e){}return r;};}
// errors and warnings (warnings carry cloud-save and telemetry failures)
function errInfo(m,src,line,err){return {m:cut(m,180),at:src?cut(String(src).split('?')[0].split('/').pop()+':'+(line||0),60):undefined,st:err&&err.stack?cut(String(err.stack).split('\n').slice(1,4).map(s=>s.trim().split('?')[0]).join(' | '),200):undefined};}
addEventListener('error',e=>{if(e.target&&e.target!==window){log('res_error',{tag:e.target.tagName,src:cut(String(e.target.src||e.target.href||'').split('?')[0].split('/').pop(),80)});return;}log('error',errInfo(e.message,e.filename,e.lineno,e.error));incident();},true);
addEventListener('unhandledrejection',e=>{const r=e.reason;log('error',Object.assign({rej:1},errInfo(r&&r.message||String(r),null,null,r)));incident();});
for(const lvl of ['error','warn']){const o=console[lvl];if(!o||o.__fr)continue;const w=function(){try{const m=Array.from(arguments).map(a=>a&&a.message?a.message:(typeof a==='object'?cut(a,120):String(a))).join(' ');log(lvl==='error'?'console_error':'warn',cut(m,200));if(lvl==='error')incident();}catch(e){}return o.apply(console,arguments);};w.__fr=true;console[lvl]=w;}
// network: failures (host + path only) and cloud-save successes; the recorder's own uploads aren't logged
if(window.fetch&&!window.fetch.__fr){const f0=window.fetch;const w=function(input){const t=performance.now();const url=(()=>{try{const u=new URL(typeof input==='string'?input:input.url,location.href);return u.host+u.pathname;}catch(e){return '?';}})();if(/tops_log/.test(url))return f0.apply(this,arguments);
 return f0.apply(this,arguments).then(r=>{if(!r.ok)log('net_fail',{u:cut(url,100),st:r.status,ms:Math.round(performance.now()-t)});else if(/tops_saves/.test(url))log('cloud_save',{ms:Math.round(performance.now()-t)});return r;},e=>{log('net_fail',{u:cut(url,100),err:cut(e&&e.message||String(e),80),ms:Math.round(performance.now()-t)});throw e;});};w.__fr=true;window.fetch=w;}
// GPU, visibility, audio
setTimeout(()=>{try{const cv=document.querySelector('canvas');if(cv){cv.addEventListener('webglcontextlost',()=>{log('gl_lost');res('gl_lost');incident();});cv.addEventListener('webglcontextrestored',()=>log('gl_restored'));}}catch(e){}},0);
let auSeen=null;setInterval(()=>{try{const c=(typeof AU!=='undefined')&&AU&&AU.ctx;if(c&&c!==auSeen){auSeen=c;log('audio',c.state);c.addEventListener('statechange',()=>log('audio',c.state));}}catch(e){}},2000);
// each tops_perf row (30 s checkpoint, end) as a compact performance + resource line
window.TOPS_LOG_PERF=r=>{try{log('perf',{ph:r.phase,st:r.status,ix:r.match_index,fps:r.fps,p95:r.p95,p99:r.p99,o100:r.stalls100,max:r.max_ms,ret:r.reticle_p95,retmax:r.reticle_max,au:r.audio_issue_n,geo:r.geometries,tex:r.textures,prog:r.programs,mb:r.tex_mb,calls:r.draws_max});}catch(e){}};
// ---- evidence and upload ----
// two local slots so a failed or impossible upload never loses the evidence: 'inc' (latest incident) and 'ck' (latest checkpoint)
const SLOT={inc:'tops_log_inc',ck:'tops_log_ck'};
const enc=s=>{try{return new TextEncoder().encode(s).length;}catch(e){return s.length*2;}};
function row(reason){let ev=events();const body={upload_id:uid(),session_id:SID,ver:VER(),reason,dropped,skipped,events:ev};let txt=JSON.stringify(body),n=enc(txt);
 while(n>BODY_MAX&&ev.length>10){ev=ev.slice(Math.ceil(ev.length/5));body.events=ev;body.trimmed=(body.trimmed||0)+1;txt=JSON.stringify(body);n=enc(txt);}body.bytes=n;return body;}
function keep(slot,r){try{localStorage.setItem(SLOT[slot],JSON.stringify(r));return true;}catch(e){/* quota or blocked storage: try the other slot's space once */try{localStorage.removeItem(SLOT.ck);localStorage.setItem(SLOT[slot],JSON.stringify(r));return true;}catch(x){return false;}}}
function release(slot,id){try{const v=localStorage.getItem(SLOT[slot]);if(v&&JSON.parse(v).upload_id===id)localStorage.removeItem(SLOT[slot]);}catch(e){}}
let KA=null;function prepKA(){try{if(typeof NET==='undefined'||!NET.sb||!NET.user)return;const u=NET.sb.supabaseUrl,k=NET.sb.supabaseKey;NET.sb.auth.getSession().then(({data})=>{const t=data&&data.session&&data.session.access_token;if(u&&k&&t)KA={u,k,t};}).catch(()=>{});}catch(e){}}
const signedIn=()=>typeof NET!=='undefined'&&NET.user&&NET.sb;
function insert(slot,r){if(!signedIn())return;try{NET.sb.from('tops_log').upsert(r,{onConflict:'upload_id',ignoreDuplicates:true}).then(({error})=>{if(!error)release(slot,r.upload_id);}).catch(()=>{});}catch(e){}}
function beacon(slot,r){if(!KA)return;try{fetch(KA.u+'/rest/v1/tops_log?on_conflict=upload_id',{method:'POST',keepalive:true,headers:{apikey:KA.k,Authorization:'Bearer '+KA.t,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(r)}).then(x=>{if(x.ok)release(slot,r.upload_id);}).catch(()=>{});}catch(e){}}
const idle=f=>{let done=false;const go=()=>{if(done)return;done=true;f();};try{if(window.requestIdleCallback)requestIdleCallback(go,{timeout:2000});}catch(e){}setTimeout(go,2500);/* fallback: never starve */};
function whenNotPulling(f){const go=()=>{try{if(typeof S!=='undefined'&&S&&S.pulling){setTimeout(go,800);return;}}catch(e){}f();};idle(go);}
// errors: the evidence is kept at once; uploads coalesce (first now, then one per 60 s carrying everything since; max 10 a session)
let errUps=0,lastErrUp=0,errTimer=null;
function incident(){try{const r=row('error');keep('inc',r);/* saved before any network */if(errUps>=10||errTimer)return;const wait=Math.max(0,60000-(Date.now()-lastErrUp));
 errTimer=setTimeout(()=>{errTimer=null;errUps++;lastErrUp=Date.now();const r2=row('error');keep('inc',r2);whenNotPulling(()=>insert('inc',r2));},errUps?wait:0);}catch(e){}}
function upload(reason){try{whenNotPulling(()=>{const r=row(reason);keep('ck',r);prepKA();insert('ck',r);});}catch(e){}}/* match end: built and kept off the end-of-match path */
// hidden is the reliable exit on iOS (pagehide may never come): keep + send now with keepalive; pagehide repeats it (same upload_id = no duplicate)
let hideRow=null;function onHide(why){try{log('vis',why);if(!hideRow)hideRow=row('pagehide');keep('ck',hideRow);beacon('ck',hideRow);}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)onHide('hidden');else{hideRow=null;log('vis','visible');retry();}});
addEventListener('pagehide',()=>onHide('pagehide'));
// anything left in the slots (a failed upload, a killed page, a guest) goes up at the next signed-in foreground moment
function retry(){if(!signedIn())return;prepKA();for(const slot of ['inc','ck']){try{const v=localStorage.getItem(SLOT[slot]);if(v)insert(slot,JSON.parse(v));}catch(e){}}}
setInterval(()=>{if(!document.hidden){prepKA();retry();}},15000);/* also keeps the keepalive token fresh */
setTimeout(retry,6000);
window.TOPS_LOG={log,events,res,row,retry,incident,upload,get dropped(){return dropped;},sid:SID,_slots:SLOT};
})();
</script>
