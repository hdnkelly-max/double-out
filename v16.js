<script>
/* ENG-RESET (Hayden 14:14 / 14:19, Overseer 14:16 / 14:20): a fresh page between matches, on every device.
   Match 1 is always smooth on Hayden's iPhone and match 2 isn't (47 matches), so after each match, once its result is saved locally and in the
   cloud, the game reloads the page behind a loading screen and opens straight on the hub: every match runs on a fresh page, like match 1.
   - When: the player is back on the hub after a match (finished or quit) and nothing is open over it (reward card, card pack, perk, message,
     Menu). Never during a match. Never after an online match (the room would drop). A new match started first cancels it.
   - Saves first: the save is written locally, then pushed to the cloud and confirmed (NET.cloudAt), pending tops_darts rows are flushed, and
     every in-flight request to the game's server (perf rows, recorder) has to finish without an error, all within 5 s. If anything fails or
     times out, there is no reset: the hub stays as it is today.
   - After the reload: title, splash and login are skipped; the hub opens on the same career/Run slot and tab. The loading bar follows the
     real boot steps. reset_ms (reset start -> hub ready) and how many resets this session go in the next perf rows (dev.t20.reset_ms/reset_n).
   - Test switch: hub Menu "Test: no fresh start between matches" (q20 'noreset') turns it off. */
(function(){
const FK='tops_reset_go',NK='tops_reset_n';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ld=()=>document.getElementById('loading');
const bar=(p,tip)=>{const l=ld();if(!l)return;l.classList.add('rs');l.classList.remove('gone');l.style.setProperty('--rsp',String(Math.max(0,Math.min(1,p))));if(tip){const t=document.getElementById('ldTip');if(t)t.textContent=tip;}};
(function(){const st=document.createElement('style');st.textContent='#loading.rs i::after{animation:none;left:0;width:calc(var(--rsp,0)*100%);transition:width .3s ease-out}';document.head.appendChild(st);})();
/* requests to the game's server, so a reset waits for them and knows if one failed */
const NQ={n:0,fail:0};
if(window.fetch&&!window.fetch.__rs){const F=window.fetch;window.fetch=function(u){let url='';try{url=String((u&&u.url)||u);}catch(e){}if(!/supabase\.co/.test(url))return F.apply(this,arguments);NQ.n++;
  return F.apply(this,arguments).then(r=>{NQ.n--;if(!r.ok)NQ.fail++;return r;},e=>{NQ.n--;NQ.fail++;throw e;});};window.fetch.__rs=1;}
const off=()=>{try{return !!(window.TOPS_q20has&&TOPS_q20has('noreset'));}catch(e){return false;}};
const live=()=>typeof S!=='undefined'&&S&&!S.done;
let played=false,lastOnline=false,busy=false,watchT=null;
const RS=window.TOPS_RESET={state:()=>({played,busy,off:off(),pending:!!watchT}),progress:p=>bar(p),last:null};

/* ---- after a match: wait for a clear hub, then save and reload ---- */
/* the watch starts with the match and acts once it's over: the hub is often shown under the result screen at the match's end, and the
   reward card, level reveal, card pack and messages then close over it without calling showHub again */
const bm=beginMatch;beginMatch=function(o){if(watchT){clearInterval(watchT);watchT=null;}const r=bm.apply(this,arguments);try{played=true;lastOnline=!!((o&&o.online)||(typeof S!=='undefined'&&S&&S.online));watch();}catch(e){}return r;};
function watch(){if(watchT)clearInterval(watchT);const t0=Date.now();watchT=setInterval(()=>{try{if(busy)return;if(live())return;/* cheap while a match is live */
  if(Date.now()-t0>3600000||!played){clearInterval(watchT);watchT=null;return;}if(hubClear()){clearInterval(watchT);watchT=null;go('match');}}catch(e){}},300);}
const hubClear=()=>{try{if(document.visibilityState!=='visible')return false;const rbOn=!!document.getElementById('rbApp')&&!document.getElementById('rbApp').hidden;if(!rbOn&&$('hub').hidden)return false;
  if(document.getElementById('rbMenuSheet'))return false;const hp=document.getElementById('hubPop');if(hp&&!hp.hidden&&hp.getClientRects().length)return false;
  const W=innerWidth,H=innerHeight;return [[W/2,H/2],[W/2,H*.25],[W/2,H*.8]].every(([x,y])=>{const e=document.elementFromPoint(x,y);return !!(e&&(e.closest('#rbApp')||e.closest('#hub')));});}catch(e){return false;}};
async function go(why){if(busy)return;if(off()||lastOnline||window.__noGL){played=false;return;}if(live())return;
 busy=true;const t0=Date.now();const log=(k,d)=>{try{window.TOPS_LOG&&TOPS_LOG.log(k,d);}catch(e){}};
 bar(.08,'Saving your match');
 let ok=true,why2='';
 try{
  try{persist();}catch(e){ok=false;why2='local';}
  const signed=!!(window.NET&&NET.user&&NET.sb);NQ.fail=0;
  if(ok&&signed){const c0=NET.cloudAt||0;let snap='';try{snap=JSON.stringify(save);cloudPush(true);}catch(e){ok=false;why2='push';}
   const dl=window.TOPS_DARTS_FLUSH?TOPS_DARTS_FLUSH():Promise.resolve(true);
   const until=Date.now()+5000;let dok=null;dl.then(v=>{dok=v!==false;},()=>{dok=false;});
   while(ok&&Date.now()<until){if(dok!==null&&(NET.cloudAt||0)>c0&&NQ.n===0)break;await sleep(60);bar(.08+.25*Math.min(1,(Date.now()-t0)/2500));}
   if(ok&&!((NET.cloudAt||0)>c0)){ok=false;why2='cloud';}else if(ok&&dok!==true){ok=false;why2='darts';}else if(ok&&NQ.n!==0){ok=false;why2='pending';}else if(ok&&NQ.fail){ok=false;why2='server';}
   else{try{if(JSON.stringify(save)!==snap){ok=false;why2='changed';}}catch(e){ok=false;why2='changed';}}}
  else if(ok){/* guest: the save is local; perf rows wait in local storage; let any request in flight finish */const until=Date.now()+3000;while(NQ.n>0&&Date.now()<until)await sleep(60);}
 }catch(e){ok=false;why2='error';}
 if(!ok||live()){log('reset_skip',{why:why2||'live',ms:Date.now()-t0});RS.last={skipped:why2||'live'};const l=ld();if(l){l.classList.add('gone');setTimeout(()=>l.classList.remove('rs'),600);}busy=false;played=false;return;}
 const n=(+sessionStorage.getItem(NK)||0)+1;
 try{sessionStorage.setItem(NK,String(n));sessionStorage.setItem(FK,JSON.stringify({t:t0,saveMs:Date.now()-t0,run:!!(window.isRun&&isRun()),tab:(window.hubTab&&hubTab.cur)||null,why}));}catch(e){busy=false;played=false;return;}
 log('reset_go',{n,save_ms:Date.now()-t0});bar(.35,'Setting up the oche');
 setTimeout(()=>{try{location.reload();}catch(e){}},30);}
RS.go=go;

/* ---- the fresh page: straight to the hub ---- */
let flag=null;try{flag=JSON.parse(sessionStorage.getItem(FK)||'null');sessionStorage.removeItem(FK);}catch(e){flag=null;}
if(flag&&Date.now()-flag.t<120000){
 window.TOPS_RESETTING=flag;bar(.4,'Setting up the oche');
 /* the game hides the loading screen when the rig is in (and at 9 s); keep it up until the hub is ready */
 const l0=ld();let done=false;let mo=null;if(l0&&window.MutationObserver){mo=new MutationObserver(()=>{if(!done&&l0.classList.contains('gone'))l0.classList.remove('gone');});mo.observe(l0,{attributes:true,attributeFilter:['class']});}
 const finish=(why)=>{if(done)return;done=true;try{if(mo)mo.disconnect();}catch(e){}bar(1);const ms=Date.now()-flag.t;window.TOPS_RESET_MS=ms;window.TOPS_RESET_N=+sessionStorage.getItem(NK)||1;RS.last={ms,why,saveMs:flag.saveMs};
  try{window.TOPS_LOG&&TOPS_LOG.log('reset_done',{ms,save_ms:flag.saveMs,why});}catch(e){}setTimeout(()=>{const l=ld();if(l){l.classList.add('gone');setTimeout(()=>l.classList.remove('rs'),600);}},200);};
 let hubAt=0;const toHub=()=>{if(hubAt)return true;hubAt=Date.now();try{const lg=$('login');if(lg)lg.hidden=true;if(flag.run){if(!isRun())switchSlot('run');}else if(isRun())switchSlot('career');}catch(e){}
  try{showHub();}catch(e){}try{if(flag.tab&&window.hubTab)hubTab(flag.tab);}catch(e){}bar(.8);return true;};
 /* the hub opens as soon as the rig is in: the local save is the one just confirmed in the cloud, so nothing waits for the network. The
    boot's own end (showTitle after the cloud pull when signed in, showLogin when the network or the session isn't there) is turned into a
    hub refresh for the next 30 s, so the player stays on the hub; a signed-in boot still adopts the cloud copy (the same save) as usual. */
 const tb=Date.now();const st=showTitle;showTitle=function(){if(Date.now()-tb<30000){if(!hubAt)return toHub();try{showHub();if(flag.tab&&window.hubTab)hubTab(flag.tab);}catch(e){}return;}return st.apply(this,arguments);};
 const sl=showLogin;showLogin=function(){if(Date.now()-tb<30000){if(!hubAt)toHub();try{const lg=$('login');if(lg)lg.hidden=true;}catch(e){}return;}return sl.apply(this,arguments);};
 /* bar: rig in, hub shown, character files and venue settled; capped so a slow file can't hold the screen */
 const t1=Date.now();const tick=setInterval(()=>{try{let p=.4;const rig=V&&V._qa&&V._qa.rigReady&&V._qa.rigReady();if(rig){p=.6;if(!hubAt)toHub();}if(hubAt)p=.8;let settled=false;try{const r=TOPS_RIGS();settled=!((r.wait&&r.wait.length)||r.loading);}catch(e){settled=true;}
   if(hubAt&&rig&&(settled||Date.now()-hubAt>1500)){clearInterval(tick);finish(settled?'ready':'hub');return;}/* a character file still loading lands on the hub as usual */bar(Math.max(p,.4+.55*Math.min(1,(Date.now()-t1)/6000)));
   if(Date.now()-t1>9000){clearInterval(tick);if(!hubAt){/* the boot never reached title or login (e.g. a join link): let it carry on */}finish(hubAt?'cap':'nohub');}}catch(e){}},150);
 /* sound: the reload drops the audio unlock; the first tap on the hub brings it back, as Continue on the title does */
 const un=()=>{try{audioInit();}catch(e){}['pointerup','touchend','keydown'].forEach(t=>document.removeEventListener(t,un,true));};['pointerup','touchend','keydown'].forEach(t=>document.addEventListener(t,un,true));
}
})();
</script>
