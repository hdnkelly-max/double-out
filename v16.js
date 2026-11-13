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
/* Experience's loading screen (exp-load, Hayden approved 14:36): TOPS_LOAD.set(p,label), .next({k,t,s}), .done(). Before the reload the
   screen has already finished once (boot), so the old page paints the bar itself while it saves. */
const paintOld=(p,tip)=>{const l=ld();if(!l)return;l.classList.remove('gone','ld-done');const b=document.getElementById('ldBar'),pc=document.getElementById('ldPct'),t=document.getElementById('ldTip');const v=Math.max(0,Math.min(1,p));
 if(b)b.style.width=(v*100).toFixed(1)+'%';if(pc)pc.textContent=Math.round(v*100)+'%';if(t&&tip)t.textContent=tip;l.setAttribute('aria-valuenow',String(Math.round(v*100)));};
const bar=(p,tip)=>{if(window.TOPS_RESETTING&&window.TOPS_LOAD)TOPS_LOAD.set(p,tip);else paintOld(p,tip);};
/* requests to the game's server, so a reset waits for them and knows if one failed */
const NQ={n:0,fail:0};
if(window.fetch&&!window.fetch.__rs){const F=window.fetch;window.fetch=function(u){let url='';try{url=String((u&&u.url)||u);}catch(e){}if(!/supabase\.co/.test(url))return F.apply(this,arguments);NQ.n++;
  return F.apply(this,arguments).then(r=>{NQ.n--;if(!r.ok)NQ.fail++;return r;},e=>{NQ.n--;NQ.fail++;throw e;});};window.fetch.__rs=1;}
const off=()=>{try{return !!(window.TOPS_q20has&&TOPS_q20has('noreset'));}catch(e){return false;}};
const live=()=>typeof S!=='undefined'&&S&&!S.done;
let played=false,lastOnline=false,busy=false,watchT=null;
const RS=window.TOPS_RESET={state:()=>({played,busy,off:off(),pending:!!watchT}),progress:(p,t)=>bar(p,t),last:null};

/* ---- after a match: wait for a clear hub, then save and reload ---- */
/* the watch starts with the match and acts once it's over: the hub is often shown under the result screen at the match's end, and the
   reward card, level reveal, card pack and messages then close over it without calling showHub again */
const bm=beginMatch;beginMatch=function(o){if(watchT){clearInterval(watchT);watchT=null;}const r=bm.apply(this,arguments);try{played=true;lastOnline=!!((o&&o.online)||(typeof S!=='undefined'&&S&&S.online));watch();}catch(e){}return r;};
/* the hub must stay clear for 2.5 s: the reward card opens ~0.85 s after the result screen and the card welcome 0.7 s after the hub, and a
   reward card still to show (C3.pending) blocks it outright, since its achievement payout runs when the card opens */
function watch(){if(watchT)clearInterval(watchT);const t0=Date.now();let clearSince=0;watchT=setInterval(()=>{try{if(busy)return;if(live()){clearSince=0;return;}/* cheap while a match is live */
  if(Date.now()-t0>3600000||!played){clearInterval(watchT);watchT=null;return;}
  if(hubClear()&&!(window.C3&&C3.pending&&C3.pending())){if(!clearSince)clearSince=Date.now();if(Date.now()-clearSince>=2500){clearInterval(watchT);watchT=null;go('match');}}else clearSince=0;}catch(e){}},300);}
const hubClear=()=>{try{if(document.visibilityState!=='visible')return false;const rbOn=!!document.getElementById('rbApp')&&!document.getElementById('rbApp').hidden;if(!rbOn&&$('hub').hidden)return false;
  if(document.getElementById('rbMenuSheet'))return false;if(document.querySelector('#result:not([hidden]),#perk:not([hidden]),#msg:not([hidden]),#lvFirst,.tcpk,.tc-sheet,#c3rw:not([hidden]),#rbApp.rb-resmode'))return false;/* the reward card, and the rebrand's Result screen drawn inside #rbApp over it */const hp=document.getElementById('hubPop');if(hp&&!hp.hidden&&hp.getClientRects().length)return false;
  const W=innerWidth,H=innerHeight;return [[W/2,H/2],[W/2,H*.25],[W/2,H*.8]].every(([x,y])=>{const e=document.elementFromPoint(x,y);return !!(e&&(e.closest('#rbApp')||e.closest('#hub')));});}catch(e){return false;}};
async function go(why){if(busy)return;if(off()||lastOnline||window.__noGL||(window.NET&&NET.room)){played=false;return;}/* never online or in a room: the reload would drop it */if(live())return;
 busy=true;const t0=Date.now();const log=(k,d)=>{try{window.TOPS_LOG&&TOPS_LOG.log(k,d);}catch(e){}};
 bar(.08,'Saving your match');
 let ok=true,why2='';
 try{
  try{persist();}catch(e){ok=false;why2='local';}
  const signed=!!(window.NET&&NET.user&&NET.sb);NQ.fail=0;
  /* ChatGPT P1: the cloud ack must be for this exact save. The game's debounced push is cancelled and this page sends the save itself, and
     only the server's ok for this call counts (the server refuses an older sv, so a slower earlier push can't overwrite it) */
  if(ok&&signed){let snap='';try{clearTimeout(NET.pushT);snap=JSON.stringify(save);}catch(e){ok=false;why2='push';}
   const sv=save.sv||0;let pok=null;try{NET.sb.rpc('tops_save_put',{p_data:save}).then(r=>{pok=!!(r&&!r.error&&r.data&&r.data.ok);if(pok)NET.cloudAt=Date.now();},()=>{pok=false;});}catch(e){pok=false;}
   const dl=window.TOPS_DARTS_FLUSH?TOPS_DARTS_FLUSH():Promise.resolve(true);
   const until=Date.now()+5000;let dok=null;dl.then(v=>{dok=v!==false;},()=>{dok=false;});
   while(ok&&Date.now()<until){if(pok!==null&&dok!==null&&NQ.n===0)break;if(pok===false)break;await sleep(60);bar(.08+.2*Math.min(1,(Date.now()-t0)/2500));}
   if(ok&&pok!==true){ok=false;why2='cloud';}else if(ok&&dok!==true){ok=false;why2='darts';}else if(ok&&NQ.n!==0){ok=false;why2='pending';}else if(ok&&NQ.fail){ok=false;why2='server';}
   else{try{if(JSON.stringify(save)!==snap){ok=false;why2='changed';}}catch(e){ok=false;why2='changed';}}
   RS.sv=sv;}
  else if(ok){/* guest: the save is local; perf rows wait in local storage; let any request in flight finish */const until=Date.now()+3000;while(NQ.n>0&&Date.now()<until)await sleep(60);}
 }catch(e){ok=false;why2='error';}
 if(!ok||live()){log('reset_skip',{why:why2||'live',ms:Date.now()-t0});RS.last={skipped:why2||'live'};const l=ld();if(l)l.classList.add('gone');busy=false;played=false;return;}
 const n=(+sessionStorage.getItem(NK)||0)+1;
 try{sessionStorage.setItem(NK,String(n));sessionStorage.setItem(FK,JSON.stringify({t:t0,saveMs:Date.now()-t0,run:!!(window.isRun&&isRun()),tab:(window.hubTab&&hubTab.cur)||null,why,sv:save.sv||0}));}catch(e){busy=false;played=false;return;}
 /* the Next up card on the new page's loading screen, from its first frame (exp-load reads sessionStorage 'tops_reset') */
 try{const c=career();if(c&&window.nextOpponent&&!(window.isRun&&isRun()&&c.lives===0)){const no=nextOpponent();const T=TIERS[c.tier]||{};if(no&&no.oppName)sessionStorage.setItem('tops_reset',JSON.stringify({k:'Next up',t:'vs '+no.oppName,s:T.name||''}));}}catch(e){}
 log('reset_go',{n,save_ms:Date.now()-t0});bar(.3,'Setting up the oche…');
 setTimeout(()=>{try{location.reload();}catch(e){}},30);}
RS.go=go;

/* ---- the cover (Overseer 16:44): the page starts with the loading screen on top and everything else hidden ('tops-pre', built into the
   head); it lifts only when the screen the boot lands on is up, two frames after, so the old title / splash never paint ---- */
const lift=()=>{const d=document.documentElement;window.TOPS_LDHOLD=false;window.TOPS_BOOTHOLD=false;const go=()=>{/* the page's own pre-paint hold (Experience's TOPS_PRE, released once the new look is installed) is left to its owner */if(!window.TOPS_PRE)d.classList.remove('tops-pre');/* the game's own way out (#loading.gone): the loader fills its bar and fades on that (Experience's observer) */try{const l=ld();if(l)l.classList.add('gone');}catch(e){}};
 try{requestAnimationFrame(()=>requestAnimationFrame(go));setTimeout(()=>{if(d.classList.contains('tops-pre'))go();},300);/* hidden tab: no frames */}catch(e){go();}};
/* ---- the fresh page: straight to the hub ---- */
let flag=null;try{flag=JSON.parse(sessionStorage.getItem(FK)||'null');sessionStorage.removeItem(FK);}catch(e){flag=null;}
if(flag&&Date.now()-flag.t<120000){
 window.TOPS_RESETTING=flag;bar(.35,'Setting up the oche…');
 /* the game hides the loading screen when the rig is in (and at 9 s): hold that until the hub is ready (on this element only), so the bar
    keeps following the real steps instead of jumping to 100 % */
 let done=false;window.TOPS_LDHOLD=true;/* game4 skips its own #loading.gone while this is set (rig in, 9 s fallback) */
 const finish=(why)=>{if(done)return;done=true;window.TOPS_LDHOLD=false;const ms=Date.now()-flag.t;window.TOPS_RESET_MS=ms;window.TOPS_RESET_N=+sessionStorage.getItem(NK)||1;RS.last={ms,why,saveMs:flag.saveMs};
  try{window.TOPS_LOG&&TOPS_LOG.log('reset_done',{ms,save_ms:flag.saveMs,why});}catch(e){}lift();};
 let hubAt=0;const toHub=()=>{if(hubAt)return true;hubAt=Date.now();try{const lg=$('login');if(lg)lg.hidden=true;if(flag.run){if(!isRun())switchSlot('run');}else if(isRun())switchSlot('career');}catch(e){}
  try{showHub();}catch(e){}try{if(flag.tab&&window.hubTab)hubTab(flag.tab);}catch(e){}bar(.8,'Opening the hub…');return true;};
 /* the hub opens as soon as the rig is in: the local save is the one just confirmed in the cloud, so nothing waits for the network. The
    boot's own end (showTitle after the cloud pull when signed in, showLogin when the network or the session isn't there) is turned into a
    hub refresh for the next 30 s, so the player stays on the hub; a signed-in boot still adopts the cloud copy (the same save) as usual. */
 const tb=Date.now();const st=showTitle;showTitle=function(){if(Date.now()-tb<30000){if(!hubAt)return toHub();try{showHub();if(flag.tab&&window.hubTab)hubTab(flag.tab);}catch(e){}return;}return st.apply(this,arguments);};
 const sl=showLogin;showLogin=function(){if(Date.now()-tb<30000){if(!hubAt)toHub();try{const lg=$('login');if(lg)lg.hidden=true;}catch(e){}return;}return sl.apply(this,arguments);};
 /* bar: rig in, hub shown, character files and venue settled; capped so a slow file can't hold the screen */
 const t1=Date.now();const tick=setInterval(()=>{try{let p=.35;const rig=V&&V._qa&&V._qa.rigReady&&V._qa.rigReady();if(rig){p=.6;if(!hubAt)toHub();}if(hubAt)p=.8;let settled=false;try{const r=TOPS_RIGS();settled=!((r.wait&&r.wait.length)||r.loading);}catch(e){settled=true;}
   if(hubAt&&rig&&(settled||Date.now()-hubAt>1500)){clearInterval(tick);finish(settled?'ready':'hub');return;}/* a character file still loading lands on the hub as usual */bar(p);
   if(Date.now()-t1>9000){clearInterval(tick);if(!hubAt){/* the boot never reached title or login (e.g. a join link): let it carry on */}finish(hubAt?'cap':'nohub');if(!hubAt){try{st.call(window);}catch(e){}/* never leave an unusable screen: the normal title */}}}catch(e){}},150);
 /* ChatGPT P1: on this page the save just confirmed in the cloud is the floor. A cloud copy older than it (a stale read, a slow replica) is
    never adopted over it for the first 60 s; the local one is pushed again instead. A newer copy (another device) is adopted as before. */
 if(typeof netAdopt==='function'){const na=netAdopt;netAdopt=function(cloud){try{if(Date.now()-tb<60000&&cloud&&(cloud.sv||0)<(flag.sv||0)){try{window.TOPS_LOG&&TOPS_LOG.log('reset_keep_local',{cloud:cloud.sv||0,local:flag.sv||0});}catch(e){}RS.keptLocal=(RS.keptLocal|0)+1;try{cloudPush(true);}catch(e){}return;}}catch(e){}return na.apply(this,arguments);};}
 /* sound: the reload drops the audio unlock; the first tap on the hub brings it back, as Continue on the title does */
 const un=()=>{try{audioInit();}catch(e){}['pointerup','touchend','keydown'].forEach(t=>document.removeEventListener(t,un,true));};['pointerup','touchend','keydown'].forEach(t=>document.addEventListener(t,un,true));
}else if(window.TOPS_PRE?TOPS_PRE.on():document.documentElement.classList.contains('tops-pre')){
 window.TOPS_LDHOLD=true;window.TOPS_BOOTHOLD=true;/* game4 skips its own #loading.gone (rig in, 9 s) while this is set */
 /* a launch (cold, or a normal reload): the boot ends on login (no session / no network) or on the title after the cloud pull (signed in).
    Hold the loading screen until that call has run and the rig is in (the game's own rule), so the player never sees the title drawn
    before the cloud save landed or the old layout under the new one. 9 s without the rig still lifts on the boot's end (as the game's own
    fallback did); 15 s lifts regardless. */
 const t0=Date.now()-Math.round(performance.now());/* page start */let end=0;/* the boot's end is marked by netBoot itself (TOPS_BOOTEND), which may come before this script is parsed */
 /* real progress on a launch (Hayden 17:57: no sitting at 0 % then jumping to 100 %): page parsed, the cloud client loaded, the player model
    in, the boot's screen drawn; the loader creeps between these and fills to 100 % when it lifts. A page that drives TOPS_LOAD itself (a test of
    the loader) sets TOPS_LOAD_MANUAL and the steps stay out of its way. */
 const step=p=>{try{if(!window.TOPS_LOAD_MANUAL&&window.TOPS_LOAD)TOPS_LOAD.set(p);}catch(e){}};step(.4);
 const tick=setInterval(()=>{try{if(!end&&window.TOPS_BOOTEND)end=TOPS_BOOTEND;const rig=V&&V._qa&&V._qa.rigReady&&V._qa.rigReady();
   step(.4+(typeof NET!=='undefined'&&NET.sb?.1:0)+(rig?.25:0)+(end?.15:0));/* the page itself is 2-38 % (build.js) */
   if(Date.now()-t0>15000){clearInterval(tick);window.TOPS_BOOT_MS=Date.now()-t0;try{window.TOPS_LOG&&TOPS_LOG.log('boot_cover',{ms:TOPS_BOOT_MS,cap:1});}catch(e){}lift();return;}/* never longer than 15 s */
   if(end&&(rig||Date.now()-t0>9000)){clearInterval(tick);window.TOPS_BOOT_MS=Date.now()-t0;try{window.TOPS_LOG&&TOPS_LOG.log('boot_cover',{ms:TOPS_BOOT_MS,rig:!!rig});}catch(e){}lift();}}catch(e){}},100);
}
})();
</script>
