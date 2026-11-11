// Kill-switch config read (Process V2 §7; Career/Build owns the read, Art/Experience applies the switches).
// Inlined by build.js BEFORE game4.js, so window.TOPS_SAFE is set from this browser's cache before any loader runs.
// Remote source: Supabase table tops_config, row key 'safe' (sql/tops_config.sql), read with the publishable key over REST.
//  - boot: cached value at once (sync); then a fresh read. If it arrives before the first match starts it applies at once;
//    after that, a fresh value waits and applies only at the next beginMatch (a match never changes mid-way).
//  - refreshed after each match ends / quit / app back to the foreground (outside a match), at most once a minute.
//  - Supabase down, slow (4 s) or odd: keep the last good value (cache), else the default: everything off.
//  - strict: only crowd/venueFx/simpleFigures === true, profile === 'safe', telemetry === 'minimal'; anything else is ignored.
//  - never touches saves, scoring, progression or auth. Only the Overseer or Shipping flips the row (SQL in tops_config.sql).
(function(){
 var CK='tops_cfg_safe',TIMEOUT=4000,MIN_GAP=60000,BOOL=['crowd','venueFx','simpleFigures'];
 function clean(v){var o={};if(!v||typeof v!=='object'||Array.isArray(v))return o;
  for(var i=0;i<BOOL.length;i++)if(v[BOOL[i]]===true)o[BOOL[i]]=true;
  if(v.profile==='safe')o.profile='safe';if(v.telemetry==='minimal')o.telemetry='minimal';return o;}
 function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
 var st={src:'default',at:0,fetchedAt:0,pending:null,inMatch:false,started:false,busy:false,fails:0};
 // A value already present before the page runs (test init scripts only) wins and remote reads are not applied.
 var preset=window.TOPS_SAFE&&typeof window.TOPS_SAFE==='object'&&!Array.isArray(window.TOPS_SAFE);
 if(preset){st.src='preset';st.locked=true;}else window.TOPS_SAFE={};
 if(!preset)try{var c=JSON.parse(localStorage.getItem(CK)||'null');if(c&&c.v){window.TOPS_SAFE=clean(c.v);st.src='cache';st.at=c.at||0;}}catch(e){}
 window.TOPS_SAFE_STATE=st;
 function log(ev,d){try{if(typeof trackEv==='function')trackEv(ev,Object.assign({v:window.TOPS_VER||''},d||{}));}catch(e){}}
 // Art's hook: first activation of each switch per session (safeOn) is logged here
 window.TOPS_telemetry=function(ev,d){log(ev,d);};
 function apply(v,src){if(st.locked)return;var was=window.TOPS_SAFE;window.TOPS_SAFE=v;st.src=src;st.pending=null;
  if(!same(was,v))log('safe_cfg',{on:Object.keys(v).join(',')||'none',src:src});}
 function got(v){var n=clean(v);st.fetchedAt=Date.now();st.fails=0;
  try{localStorage.setItem(CK,JSON.stringify({v:n,at:st.fetchedAt}));}catch(e){}
  if(!st.started&&!st.inMatch)apply(n,'remote');            // boot, before any match: take it now
  else if(!same(n,window.TOPS_SAFE))st.pending=n;            // otherwise at the next match boundary
  else st.pending=null;}
 function refresh(force){
  try{if(st.busy)return;if(!force&&Date.now()-st.fetchedAt<MIN_GAP)return;
   if(typeof LB==='undefined'||!LB.url||typeof fetch!=='function')return;
   st.busy=true;st.fetchedAt=Date.now();
   var ac=typeof AbortController==='function'?new AbortController():null,to=setTimeout(function(){try{ac&&ac.abort();}catch(e){}},TIMEOUT);
   fetch(LB.url+'/rest/v1/tops_config?key=eq.safe&select=value',{headers:{apikey:LB.key,Authorization:'Bearer '+LB.key},cache:'no-store',signal:ac?ac.signal:undefined})
    .then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json();})
    .then(function(rows){got(Array.isArray(rows)&&rows[0]?rows[0].value:{});})
    .catch(function(){st.fails++;})
    .then(function(){clearTimeout(to);st.busy=false;});
  }catch(e){st.busy=false;}}
 window.TOPS_SAFE_refresh=refresh;
 function hook(){
  try{if(typeof beginMatch==='function'&&!beginMatch.__cfg){var bm=beginMatch;
    beginMatch=function(){try{st.started=true;st.inMatch=true;if(st.pending)apply(st.pending,'remote');}catch(e){}return bm.apply(this,arguments);};beginMatch.__cfg=1;}}catch(e){}
  try{if(typeof endMatch==='function'&&!endMatch.__cfg){var em=endMatch;
    endMatch=function(){var r=em.apply(this,arguments);try{st.inMatch=false;refresh(false);}catch(e){}return r;};endMatch.__cfg=1;}}catch(e){}
  try{var q=document.getElementById('btnQuit');if(q)q.addEventListener('click',function(){setTimeout(function(){try{if(typeof S!=='undefined'&&S&&S.done){st.inMatch=false;refresh(false);}}catch(e){}},0);});}catch(e){}
  try{document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&!st.inMatch)refresh(false);});}catch(e){}
  refresh(true);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else setTimeout(hook,0);
})();
