/* S3 · Season 3 Circuit career wiring (Career). Loaded after every career script, so its wrappers are outermost.
   Off unless TOPS_S3FLAG (?s3=1 or the Menu switch). Frozen data shape (07:58, add-only): TOPS_S3 / TOPS_HISTORY / TOPS_BESTLEG.
   The engine (tc/circuit.js) holds the Circuit state in save.career.circuit; save.career.bank stays the one bank (shop and kit spend it),
   copied into the engine around every engine call. save.career.tier follows the Circuit level, so venue, crowd, nerves and the
   CAR-TOP throw table (THROW_TUNE.stage, one row per level) all follow the player up the Circuit. Opponents are static by level and round. */
(function(){
  'use strict';
  const on=()=>!!window.TOPS_S3FLAG&&!!window.TOPS_CIRCUIT;
  const C=()=>window.TOPS_CIRCUIT;
  const L=(k,d)=>{try{window.TOPS_LOG&&TOPS_LOG.log(k,d);}catch(e){}};
  const START_BANK=60;
  const SS=()=>(typeof S!=='undefined'&&S)||null;/* S is a top-level let in game4, not a window property */
  function circ(){const c=career();if(!c||c.run)return null;if(!c.circuit){c.circuit=C().newCareer({bank:c.bank||START_BANK});c.bank=c.circuit.bank;c.tier=0;}return c.circuit;}
  // the game's bank is the one bank: copy in before an engine call, back out after
  function sync(fn){const c=career(),k=circ();if(!k)return null;k.bank=c.bank||0;const r=fn(k);c.bank=k.bank;c.tier=k.level;return r;}
  const oppName=(k)=>{const lv=k.live;const pool=(typeof AINAMES!=='undefined'&&AINAMES[Math.min(AINAMES.length-1,k.level)])||['Opponent'];const h=String(lv.id)+'|'+k.week+'|'+lv.round+'|'+(lv.results||[]).length;let x=0;for(let i=0;i<h.length;i++)x=(x*31+h.charCodeAt(i))>>>0;return pool[x%pool.length];};

  // ---- a brand new Season 3 career: the Pub, the starter bank, the Circuit state (full reset, Hayden 07:45)
  if(typeof newCareer==='function'){const _nc=newCareer;newCareer=function(){const r=_nc.apply(this,arguments);try{if(on()){const c=career();if(c&&!c.run){c.circuit=C().newCareer({bank:START_BANK});c.bank=START_BANK;c.tier=0;c.stage='circuit';c.s3=1;persist();L('s3_new_career',{bank:START_BANK});}}}catch(e){}return r;};}

  // CAR-OPP note (a): the average you actually play against (the Circuit band shift, Circuit matches only), not the raw engine figure
  const plays=(a,lv)=>{try{return window.TOPS_OPP_SHIFT?TOPS_OPP_SHIFT(a,lv,true):a;}catch(e){return a;}};
  function view(){const k=circ();if(!k)return null;/* CAR-XP: matches played before the XP fix get their base XP once */try{const cu=window.C3&&C3.s3CatchUp?C3.s3CatchUp():null;if(cu&&cu.xp){L('s3_xp_catchup',{xp:cu.xp,w:cu.w,l:cu.l,lv:C3.V3().lv});persist();}}catch(e){}const c=career();k.bank=c.bank||0;const E=C(),Lv=E.LEVELS[k.level];
    const played=k.history.filter(h=>h.level===k.level).length;
    const cal=E.calendar(k).map(e=>{const prizes={},points={};E.FIN.forEach(f=>{prizes[f]=E.prizeFor(e,f);points[f]=E.pointsFor(e,f);});return {id:e.id,n:e.n,where:e.where,kind:e.kind,size:e.size,entry:e.entry,travel:e.travel,cost:e.cost,funded:!!e.funded,purse:e.purse,pts:e.pts,every:e.every,jump:!!e.jump,canAfford:e.canAfford,prizes,points};});
    let live=null;if(k.live){const e=E.eventOf(k.live.id),o=E.nextOpp(k);live={id:e.id,n:e.n,where:e.where,round:k.live.round,roundName:E.FIN_NAME[o.round]||o.round,rounds:k.live.rounds.slice(),results:(k.live.results||[]).slice(),group:k.live.g?{w:k.live.g.w,p:k.live.g.p}:null,opp:{name:oppName(k),avg:plays(o.avg,k.level),raw:o.avg,legs:o.legs}};}
    const costs=Lv.events.map(E.cost);const avgCost=costs.reduce((s,x)=>s+x,0)/Math.max(1,costs.length);
    return {level:{i:k.level,id:Lv.id,n:Lv.n,s:Lv.s,avg:Lv.avg,legs:Lv.legs,up:Lv.up,need:Lv.need,pts:k.pts[Lv.id]||0,minEv:Lv.minEv,played},
      ladder:E.LEVELS.map((x,i)=>({i,id:x.id,n:x.n,avg:x.avg,state:i<k.level?'done':i===k.level?'current':i===k.level+1?'next':'locked'})),
      week:k.week,bank:c.bank||0,debt:k.debt||0,runway:Math.floor((c.bank||0)/Math.max(1,avgCost)),calendar:cal,live,
      oom:Lv.id==='dpnz'?E.dpnzTable(k).map(r=>({n:r.n,pts:r.pts,you:!!r.you})):null,
      history:k.history.slice().reverse().map(h=>Object.assign({finName:E.FIN_NAME[h.fin]||h.fin},h)),card:!!k.card,qsOffer:!!k.qsOffer,
      /* CAR-DEADWK: rest = nothing on at your level this week (next = the week the next event is on); recover = broke with an event on */
      rest:E.restNeeded(k)?(E.restPlan?E.restPlan(k):{next:E.nextEventWeek(k)}):null,recover:k.live?null:E.recoveryOffer(Object.assign({},k,{bank:c.bank||0}))};}
  function book(id){if(!on())return {ok:false,why:'Season 3 is off'};const k=circ();if(!k)return {ok:false,why:'No career'};if(k.live)return {ok:false,why:'Finish the event you are in first'};
    const e=C().eventOf(id);if(!e||e.level!==k.level||!C().calendar(Object.assign({},k,{bank:career().bank||0})).some(x=>x.id===id))return {ok:false,why:'Not on this week'};
    const r=sync(k=>C().book(k,id));const k0=career()&&career().circuit,k0paid=()=>k0&&k0.live&&k0.live.paid!=null?k0.live.paid:C().cost(e),k0funded=()=>!!(k0&&k0.live&&k0.live.funded);if(r&&r.ok){persist();L('s3_book',{id,cost:k0paid(),funded:k0funded(),bank:career().bank});}return r&&r.ok?{ok:true}:{ok:false,why:(r&&r.why)||'Could not book'};}
  // play(): the screens' Play button. It goes through playNext so ENG-RESET gives a fresh page between matches (its launcher replays playNext on the new page)
  function play(){if(!on())return false;const k=circ();if(!k||!k.live)return false;try{window.playNext();}catch(e){return false;}return true;}
  function playNow(){if(!on())return false;const k=circ();if(!k||!k.live)return false;const o=C().nextOpp(k),e=C().eventOf(k.live.id),nm=oppName(k);
    beginMatch({mode:'career',tier:k.level,p0:save.name||'You',oppKey:nm,oppName:nm,oppAvg:o.avg,legs:o.legs,purse:0,fee:0,circuit:true});
    if(SS()){S.s3={id:e.id,round:o.round,level:k.level,recovery:k.live&&k.live.recovery?1:0};}L('s3_match',{id:e.id,round:o.round,opp:o.avg,legs:o.legs});return true;}
  function restWeek(){if(!on())return {ok:false,why:'Season 3 is off'};const k=circ();if(!k)return {ok:false,why:'No career'};const r=sync(k=>C().restWeek(k));if(r&&r.ok){persist();L('s3_rest',Object.assign({from:r.from,to:r.to,level:k.level},r.fallback?{fallback:1,fromLevel:r.fromLevel}:{}));}else if(r&&r.error)L('s3_rest_none',{week:k.week,level:k.level});return r;}
  function recover(id){if(!on())return {ok:false,why:'Season 3 is off'};const k=circ();if(!k)return {ok:false,why:'No career'};const r=sync(k=>C().recoveryEntry(k,id));if(r&&r.ok){persist();L('s3_recover',{id:r.id,cost:r.cost,debt:r.debt,level:k.level});}return r;}
  function advance(){if(!on())return {ok:false,why:'Season 3 is off'};const r=sync(k=>C().advance(k));if(r&&r.ok){persist();L('s3_advance',{amt:r.amt});}return r;}

  // ---- the hub's old "Play" goes to the Circuit: the next round of your event, or (until the Circuit screen books for you) the first
  //      event on this week you can afford; broke = the hardship advance. Never the Season 2 league.
  if(typeof playNext==='function'){const _pn=playNext;playNext=function(){if(!on())return _pn.apply(this,arguments);const c=career();if(!c||c.run)return _pn.apply(this,arguments);
    const k=circ();if(!k.live){let v=view();if(v.rest){restWeek();v=view();}/* CAR-DEADWK: a rest week jumps to the next event */let e=v.calendar.find(x=>x.canAfford);if(!e){const a=advance();if(a&&a.ok)e=view().calendar.find(x=>x.canAfford);}
      if(!e&&view().recover){const rr=recover();if(rr&&rr.ok){playNow();return;}}
      if(!e){try{showMsg({from:'Tour budget',lines:['Nothing on this week you can afford.','Money matches pay. Come back with the cash.'],replies:[['OK','ok']]},()=>showHub());}catch(x){}return;}book(e.id);}
    playNow();};}

  // ---- money in Season 3: a round pays nothing until the event ends (Circuit prize only). The only old payout left on this path was the
  //      feat bonus ($8 each at the Pub; a first match unlocks ~15 of them = +$120), so feats still unlock but pay no cash in Season 3.
  if(typeof checkFeats==='function'){const _cf=checkFeats;checkFeats=function(){if(!on()||!SS())return _cf.apply(this,arguments);const c=career();if(!c||!c.circuit)return _cf.apply(this,arguments);
    const b=c.bank,e=S.earned||0;const r=_cf.apply(this,arguments);const paid=(c.bank||0)-b;if(paid){c.bank=b;S.earned=e;L('s3_feat_cash_off',{n:(r||[]).length,paid});}return r;};}

  // ---- after a Circuit match: the career's own bookkeeping (XP, bests, leaderboard), then the engine decides the event
  if(typeof careerAfterMatch==='function'){const _cam=careerAfterMatch;careerAfterMatch=function(){
    if(!on()||!SS()||!S.s3||S.practice)return _cam.apply(this,arguments);
    const c=career();if(!c||!c.circuit)return _cam.apply(this,arguments);
    try{matchXP();}catch(e){}
    const me=S.p[0];c.pts=(c.pts||0)+me.pts;c.darts=(c.darts||0)+me.darts;c.history=(c.history||[]).concat(S.won?'W':'L').slice(-8);
    if(S.won){c.wins=(c.wins||0)+1;c.tierWins=(c.tierWins||0)+1;}else c.losses=(c.losses||0)+1;c.tierPlayed=(c.tierPlayed||0)+1;
    try{recordBests();}catch(e){}try{checkFeats();}catch(e){}
    const was=c.circuit.level;const r=sync(k=>C().result(k,!!S.won))||{};
    if(r.done){/* trophy records from day one (Overseer 08:12, for the trophy cabinet later): every finished event keeps its date; wins and finals also go in titles */
      try{const k=c.circuit,h=k.history[k.history.length-1];if(h){h.date=new Date().toISOString();h.season=3;}if(r.fin==='W'||r.fin==='F'){const e=C().eventOf(S.s3.id);(k.titles=k.titles||[]).push({ev:e.id,n:e.n,level:e.level,season:3,finish:r.fin,prize:r.prize||0,date:new Date().toISOString()});}}catch(e){}
      S.earned=r.prize||0;if(r.up&&r.up.to>was)S.after='promo';if(r.up&&r.up.champion)S.after='champion';}
    try{S.s3xp=(window.C3&&C3.s3MatchXP)?C3.s3MatchXP():null;}catch(e){S.s3xp=null;}/* CAR-XP: player XP + levels, no cash (career3.js) */
    S.s3res=r;persist();setTimeout(()=>{try{lbPost();}catch(e){}},1500);
    const me0=S.p[0],op0=S.p[1],lv=id=>{try{return window.TOPS_LofT?Math.round(TOPS_LofT(id)*75+20):null;}catch(e){return null;}};
    L('s3_result',{xp:S.s3xp?S.s3xp.xp:null,lv:S.s3xp?S.s3xp.after.lv:null,tw:S.tune?S.tune.win:null,tr:S.tune?+S.tune.ramp.toFixed(1):null,tsrc:S.tune?S.tune.src:null,tat:S.tune?S.tune.at:null,avg:me0&&me0.darts?+(me0.pts/me0.darts*3).toFixed(1):null,oavg:op0&&op0.darts?+(op0.pts/op0.darts*3).toFixed(1):null,rh:lv('rh'),ct:lv('ct'),sc:lv('sc'),id:S.s3.id,round:S.s3.round,won:S.won?1:0,done:r.done?1:0,fin:r.fin||null,prize:r.prize||0,pts:r.pts||0,up:r.up?(r.up.to!=null?r.up.to:'champ'):null,bank:c.bank,level:c.circuit.level,debt:c.circuit.debt||0,rec:c.circuit.recovered||0,recm:S.s3.recovery?1:0});
    try{window.dispatchEvent(new CustomEvent('tops:s3',{detail:r}));}catch(e){}
  };}

  // ---- Best Leg, Season 3: the board's best_leg (fewest darts in a won leg) lives in tops_players_s3; the view tops_bestleg_s3 ranks it
  const rest=async(path)=>{const r=await fetch(LB.url+'/rest/v1/'+path,{headers:{'apikey':LB.key,'Authorization':'Bearer '+LB.key}});if(!r.ok)throw new Error(path+' '+r.status);return r.json();};
  let recCache=null;
  const BESTLEG={async table(){const me=(save.lb&&save.lb.id)||null;const rows=await rest('tops_bestleg_s3?select=name,darts,at&order=darts.asc,at.asc&limit=50');const myName=(typeof lbName==='function'?lbName():save.name)||'';return rows.map(r=>({name:r.name,you:r.name===myName,darts:r.darts,at:r.at}));},
    async record(){const rows=await rest('tops_bestleg_s3?select=name,darts,at&order=darts.asc,at.asc&limit=1');recCache=rows[0]||null;return recCache;}};
  // fetch the record at match start; when a won 501 leg beats or equals it, tell the screens (Experience draws the moment)
  if(typeof beginMatch==='function'){const _bm=beginMatch;beginMatch=function(o){const r=_bm.apply(this,arguments);try{if(on()&&o&&o.mode==='career')BESTLEG.record().catch(()=>{});}catch(e){}return r;};}
  if(typeof endLeg==='function'){const _el=endLeg;endLeg=function(){try{if(on()&&SS()&&!S.practice&&!S.drill&&(S.start||501)===501&&(typeof ui!=='undefined'&&ui.mode==='career')&&S.lastLegWinner&&S.lastLegWinner!==S._s3leg){const me=S.p[0],w=S.lastLegWinner;S._s3leg=w;
      if(w.name===(me.disp||me.name)&&w.darts>=9){const d=w.darts;L('leg_won',{darts:d,start:501,mode:'career',tier:S.tier?TIERS.indexOf(S.tier):null,s3:1});
        const prev=recCache?recCache.darts:null;if(prev==null||d<=prev){const kind=prev==null||d<prev?'new':'equal';if(kind==='new')recCache={name:(typeof lbName==='function'?lbName():save.name),darts:d,at:new Date().toISOString()};
          try{window.dispatchEvent(new CustomEvent('tops:bestleg',{detail:{darts:d,prev,kind,name:(typeof lbName==='function'?lbName():save.name)}}));}catch(e){}L('bestleg_moment',{darts:d,prev,kind});}}}}catch(e){}return _el.apply(this,arguments);};}

  // ---- Season 1 and 2 history between the mates (view tops_history); null = "no data"
  const HISTORY={async rows(){const rows=await rest('tops_history?select=who,season,tier,title,best_avg,best_leg');const me=(typeof lbName==='function'?lbName():save.name)||'';const by={};
    rows.forEach(r=>{const p=by[r.who]=by[r.who]||{name:r.who,you:r.who===me,s1:null,s2:null};const lv=r.tier==null?null:{level:r.tier,n:r.title||(typeof TIERS!=='undefined'&&TIERS[r.tier]?TIERS[r.tier].n:'Tier '+(r.tier+1))};
      p['s'+r.season]={furthest:lv,bestAvg:r.best_avg!=null?+r.best_avg:null,bestLeg:r.best_leg!=null?+r.best_leg:null};});
    return Object.values(by).sort((a,b)=>((b.s2&&b.s2.furthest?b.s2.furthest.level:-1)-(a.s2&&a.s2.furthest?a.s2.furthest.level:-1))||((b.s2&&b.s2.bestAvg||0)-(a.s2&&a.s2.bestAvg||0)));}};

  // the match result's main button: in Season 3 it carries on the Circuit (next round of this event, or back to the Circuit screen),
  // never the Season 2 league's "Next fixture · Week n of 8". Experience restyles it; this keeps the flow right until then.
  window.addEventListener('tops:s3',ev=>{const r=ev.detail||{};let n=0;const t=setInterval(()=>{const b=document.getElementById('btnResAction');if(!b&&++n<50)return;clearInterval(t);if(!b)return;
    const k=circ(),v=k&&k.live?view():null;b.innerHTML=v&&v.live?`To the next round<small>${v.live.n} · ${v.live.roundName}</small>`:`Back to the Circuit<small>${r.done?(r.finName+(r.prize?' · '+money(r.prize):'')):''}</small>`;
    /* its click still goes through btnResultNext -> afterResult -> the hub (ENG-RESET may reload between matches); the Circuit screen plays the next round */},100);});
  /* CAR-OPP: v11's save migration re-shifts a queued opponent while the page loads, before this engine (and its Season 3 FIELD_CEN) is
     on the page, so it used the Season 2 centre. Re-derive it once now from its raw rating, the same rule as v11 (never the player). */
  try{const c=typeof career==='function'?career():null,n=c&&c.next;if(on()&&c&&c.circuit&&!c.run&&n&&n.oppRaw!=null&&!n.intro&&window.TOPS_OPP_SHIFT){const a=TOPS_OPP_SHIFT(n.oppRaw,c.tier)+(n.routeAdj||0);if(a!==n.oppAvg){n.oppAvg=a;persist();}}}catch(e){}
  window.TOPS_S3={on,view,plays,book,play,advance,rest:restWeek,recover,withdraw(){return {ok:false,why:'Not yet'};},_circ:circ,_playNow:playNow};
  // ---- CAR-TUNE (Overseer 19:45, Hayden): per-tier perfect-window scale and near-miss ramp width, the same for every player at a tier.
  // Read once at game load from tops_tune (players can read it, only the Overseer's service role can write it); the values below are
  // the baked fallback. beginMatch freezes the values for that match, so a late read or a change applies from the next match.
  // win_scale is the one difficulty lever per tier: it scales the perfect window and the near-miss ramp together (the whole forgiving
  // zone), so a 10% step moves results about as much as Hayden expects. ramp_ms sets the shape (Hayden 19:42: gentle past the window). Baked from the sim (mid-skill profile, entry->exit win %, target 50->65-70):
  // ramp 0 (3.54) Pub 46->60, Club 38->48, DPNZ 44->70; ramp 40 Pub 67->85, Club 63->76, DPNZ 75->91; ramp 20 Pub 59->71. So 20 ms up to the
  // Pro Tour, and 40 at the Palace, where it gives the ~100 average Hayden wants (97->103). The table moves any tier without a release.
  // Each value is checked on its own (win_scale .5-1.5, ramp_ms 0-120, tier 0-6); anything else keeps the baked value.
  const TUNE_BAKED=Object.freeze({win:Object.freeze([1,1,1,1,1,1,1]),ramp:Object.freeze([20,20,20,20,20,20,40])});
  const TUNE={win:TUNE_BAKED.win.slice(),ramp:TUNE_BAKED.ramp.slice(),src:'baked',at:null,rows:0};
  /* ChatGPT P2-1: only real numbers (or numeric strings, as PostgREST sends numeric) count; null, '', booleans and duplicate tiers are refused */
  const num=v=>(typeof v==='number')?v:(typeof v==='string'&&v.trim()!==''&&!isNaN(v))?Number(v):NaN;
  const okW=v=>Number.isFinite(v)&&v>=.5&&v<=1.5,okR=v=>Number.isFinite(v)&&v>=0&&v<=120;
  /* ChatGPT P2-2: the read gives up after 6 s (baked values stay); every match records which values it used (s3_result tw/tr/tsrc/tat) */
  const TUNE_TIMEOUT=6000;
  const restT=async(path)=>{const ac=typeof AbortController==='function'?new AbortController():null;const tm=setTimeout(()=>{try{ac&&ac.abort();}catch(e){}},TUNE_TIMEOUT);
    try{const r=await fetch(LB.url+'/rest/v1/'+path,{headers:{'apikey':LB.key,'Authorization':'Bearer '+LB.key},signal:ac?ac.signal:undefined});if(!r.ok)throw new Error(path.split('?')[0]+' '+r.status);return await r.json();}finally{clearTimeout(tm);}};
  async function tuneLoad(){try{const rows=await restT('tops_tune?select=tier,win_scale,ramp_ms,updated_at&order=tier.asc');if(!Array.isArray(rows))throw new Error('not a list');
      const w=TUNE_BAKED.win.slice(),r=TUNE_BAKED.ramp.slice();let n=0,last=null;const seen=new Set();
      for(const x of rows){if(!x||typeof x!=='object')continue;const t=num(x.tier);if(!Number.isInteger(t)||t<0||t>6||seen.has(t))continue;seen.add(t);const ws=num(x.win_scale),rm=num(x.ramp_ms);if(okW(ws))w[t]=ws;if(okR(rm))r[t]=rm;n++;if(typeof x.updated_at==='string'&&(!last||x.updated_at>last))last=x.updated_at;}
      if(!n)throw new Error('no rows');TUNE.win=w;TUNE.ramp=r;TUNE.src='db';TUNE.at=last;TUNE.rows=n;L('tune_load',{win:w,ramp:r,at:last});
    }catch(e){L('tune_fail',{m:String(e&&e.message||e).slice(0,80)});}}
  const tierIx=t=>{t=Number(t);return Number.isInteger(t)&&t>=0&&t<=6?t:0;};
  window.TOPS_TUNE={snap(t){t=tierIx(t);return Object.freeze({tier:t,win:TUNE.win[t],ramp:TUNE.ramp[t]*TUNE.win[t],src:TUNE.src,at:TUNE.at});},state:()=>JSON.parse(JSON.stringify(TUNE)),baked:TUNE_BAKED,load:tuneLoad};
  if(on())tuneLoad();
  /* ChatGPT P1-1: the snapshot is taken before the game builds the match (from the match's own tier), then attached as soon as S exists;
     throw parameters are first computed at the first press (startPull), after this. Every career entry (Circuit, hub, money match) passes mode 'career'. */
  if(typeof beginMatch==='function'){const _bmt=beginMatch;beginMatch=function(o){let snap=null;try{if(on()&&o&&o.mode==='career'){const t=Number.isInteger(o.tier)?o.tier:((career()&&career().tier)|0);snap=TOPS_TUNE.snap(t);}}catch(e){}
    const r=_bmt.apply(this,arguments);try{const s=SS();if(s)s.tune=snap;}catch(e){}return r;};}
  window.TOPS_BESTLEG=BESTLEG;window.TOPS_HISTORY=HISTORY;
})();

/* ===== CAR-TABS (Q&D, Producer 22 Nov 07:38 / 09:09 / 09:44): one tab owns the save =====
   Lives here (Career's file, loaded after v11/v15's save wrappers) so no protected file changes. Two tabs of one browser each held their own
   copy of the save and wrote all of it on every save, so the last tab to save won (real progress lost on 4.26). Now:
   1 ownership with a handshake: a new tab says hello and waits up to 1.5 s; the owner flushes its last completed state and acks, then the new
     tab loads the latest save and takes over; the older tab steps aside behind "TOPS is open in another tab" with "Play here". If the owner is
     mid-match (a match can't be resumed), the NEW tab shows the card ("a match is in progress") with "Play here anyway" instead. A lone tab, or
     a reload (ENG-RESET between matches), takes over at once: the owner keeps a heartbeat and clears it when its page goes.
   2 write guard: before a write the tab compares the save counter in storage (sv) with its own; if another tab (or an older build) saved
     since, it never overwrites and steps aside. Every write of the save key goes through it (a guard on localStorage.setItem for that one
     key), so direct writes elsewhere (the LUX buy in career3) are covered without touching them: a refused write throws, as a full storage would.
   3 the cloud: a stepped-aside or stale tab never pushes or pulls; before each push a device checks the cloud and, if another device saved
     since this one last synced, loads that save instead of overwriting it. When the server supports it (DQ's tops_save3_put p_base, a
     proposal for Hayden), the push also sends p_base = the cloud counter this device last synced; until then it sends what it sends today.
   4 a save only writes when something changed, so the hub's redraws don't save or bump the counter.
   5 recovery copies: before a tab steps aside for a newer write, or loads a newer cloud save over changes it hadn't synced, it keeps its own
     save under <key>_rescue (the last 3), so nothing is ever thrown away silently. TOPS_TABS.rescues() lists them.
   Loading another device's save (adopt) is never itself a reason to step aside: the migration it runs saves, and that save is allowed.
   The race (DQ, 22 Nov 10:52): an owner that answers late (busy main thread, an iOS background tab waking) used to flush and ack a hello whose
   tab had already timed out and claimed, so both tabs ended behind the card. Now the owner ignores a hello it can't answer within that tab's
   wait (no flush, no ack; the claim follows), and a tab that took over on a timeout adopts a save the tab it claimed from finishes writing in
   the next 2 s instead of stepping aside. The owner's heartbeat also says whether it is mid-match, written the moment a match starts or ends,
   so a new tab shows "a match is in progress" without waiting on an answer (and turns it into Play here when that match ends). A recovery copy is also kept whenever the stored save isn't this tab's last write (an older build's
   tab wrote over it): this tab's copy when it steps aside, the stored one before this tab writes over it. */
(function(){
  if(typeof persist!=='function'||typeof TOPS_SAVE_NS==='undefined'||!window.localStorage)return;
  const KEY=TOPS_SAVE_NS.key,OWN='tops_owner_'+KEY,MSG=OWN+'_msg',RES=KEY+'_rescue',TAB='t'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);
  const SI=Storage.prototype.setItem;let away=false,pending=true,owner=false,passing=0,adopting=0,lastBody=null,waitT=0,synced=null,lastWrote=null,grace=null;
  const WAIT=1500,WAIT_LIVE=4000,WR=KEY+'_w';   /* WAIT: how long a new tab waits for the owner's ack; WR: which tab wrote the save last */
  const raw=(k,v)=>SI.call(localStorage,k,v);
  const svIn=()=>{try{const s=localStorage.getItem(KEY);return s?+(JSON.parse(s).sv||0):0;}catch(e){return 0;}};
  const mine=()=>{try{return +(save&&save.sv||0);}catch(e){return 0;}};
  const stale=()=>svIn()>mine();
  const body=()=>{try{const sv=save.sv,dev=save.dev;save.sv=0;save.dev='';const j=JSON.stringify(save);save.sv=sv;save.dev=dev;return j;}catch(e){return null;}};
  const LOG=[];const ev=(n,d)=>{try{LOG.push([Date.now()%100000,n,JSON.stringify(d||{})]);if(LOG.length>40)LOG.shift();}catch(e){}try{window.TOPS_FLIGHT&&TOPS_FLIGHT.log&&TOPS_FLIGHT.log(n,d||{});}catch(e){}};
  function rescue(why){try{const list=JSON.parse(localStorage.getItem(RES)||'[]').filter(Boolean).slice(-2);list.push({at:Date.now(),why,sv:mine(),tab:TAB,save:JSON.parse(JSON.stringify(save))});
    try{raw(RES,JSON.stringify(list));}catch(e){raw(RES,JSON.stringify(list.slice(-1)));}ev('tabs_rescue',{why,sv:mine()});}catch(e){}}
  function rescueStored(why){try{const cur=localStorage.getItem(KEY);if(!cur)return;const list=JSON.parse(localStorage.getItem(RES)||'[]').filter(Boolean).slice(-2);
    list.push({at:Date.now(),why,sv:(()=>{try{return +(JSON.parse(cur).sv||0);}catch(e){return 0;}})(),tab:'stored',save:JSON.parse(cur)});try{raw(RES,JSON.stringify(list));}catch(e){raw(RES,JSON.stringify(list.slice(-1)));}ev('tabs_rescue',{why});}catch(e){}}
  const norm=x=>{try{const o=JSON.parse(x);o.sv=0;o.dev='';return JSON.stringify(o);}catch(e){return x;}};
  const foreign=()=>{try{const cur=localStorage.getItem(KEY);return !!cur&&lastWrote!=null&&cur!==lastWrote&&norm(cur)!==norm(lastWrote);}catch(e){return false;}};   /* storage holds a save other than this tab's last write (counter and device aside): what this tab last wrote is no longer stored anywhere */
  // the card
  (function(){try{const st=document.createElement('style');st.textContent='#tabsCard{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(9,10,12,.97);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:#f3f4f2;font-family:Manrope,system-ui,sans-serif}#tabsCard .tc-in{max-width:340px;text-align:center;display:flex;flex-direction:column;gap:14px;align-items:center}#tabsCard b{font:800 26px/1.1 "Saira Condensed","Arial Narrow",Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase}#tabsCard p{margin:0;font-size:15px;line-height:1.45;color:#c9ccd0}#tabsCard button{min-height:48px;padding:0 28px;border:0;border-radius:12px;background:#c6f36b;color:#111;font:800 16px/1 Manrope,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}#tabsCard button:focus,#tabsCard button:focus-visible{outline:3px solid #f3f4f2;outline-offset:3px}#tabsCard small{font-size:12px;color:#8d9096}';(document.head||document.documentElement).appendChild(st);}catch(e){}})();
  function card(mode){const old=document.getElementById('tabsCard');if(old){if(old.dataset.mode===(mode||''))return;old.remove();}
    const d=document.createElement('div');d.id='tabsCard';d.dataset.mode=mode||'';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
    d.innerHTML=mode==='busy'?'<div class="tc-in"><b>TOPS is open in another tab</b><p>A match is in progress there. Finish it there, or play here anyway: the match in the other tab stops and isn’t saved.</p><button type="button">Play here anyway</button><small>Your progress up to that match is safe either way.</small></div>'
      :'<div class="tc-in"><b>TOPS is open in another tab</b><p>Only one tab can play at a time, so your progress stays safe. Keep playing there, or play here instead.</p><button type="button">Play here</button><small>Play here loads your latest save.</small></div>';
    d.querySelector('button').onclick=mode==='busy'?()=>{d.remove();takeOver('anyway');}:()=>{try{raw(OWN,JSON.stringify({tab:'reload',at:Date.now()}));}catch(e){}location.reload();};
    const stop=e=>{if(!e.target.closest||!e.target.closest('button'))e.stopPropagation();};['pointerdown','touchstart','click','keydown'].forEach(t=>d.addEventListener(t,stop,true));
    (document.body||document.documentElement).appendChild(d);try{d.querySelector('button').focus();}catch(e){}}
  function stepAside(why){if(away)return;if((why==='newer'&&body()!==lastBody)||foreign())rescue(why==='newer'?'newer':'overwritten');away=true;try{clearTimeout(NET.pushT);}catch(e){}try{if(typeof S!=='undefined'&&S&&!S.done)S.paused=true;}catch(e){}ev('tabs_away',{why});card();}
  // 2: every write of the save key passes the guard (passing = this tab's own guarded save, or a cloud adopt)
  Storage.prototype.setItem=function(k,v){if(k===KEY&&this===localStorage&&!passing&&!adopting){
      if(away||pending)throw new Error('TOPS: the save belongs to another tab');if(stale()){if(inGrace()){graceAdopt();throw new Error('TOPS: a newer save was just loaded');}stepAside('newer');throw new Error('TOPS: a newer save is in storage');}}
    const r=SI.apply(this,arguments);if(k===KEY&&this===localStorage&&passing&&!adopting){lastWrote=String(v);try{raw(WR,JSON.stringify({tab:TAB,sv:mine()}));}catch(e){}}else if(k===KEY&&this===localStorage&&adopting){lastWrote=String(v);}return r;};
  // 1 ownership
  const midMatch=()=>{try{return typeof S!=='undefined'&&!!S&&!S.done;}catch(e){return false;}};
  let bc=null;try{bc=new BroadcastChannel('tops-tabs-'+KEY);bc.onmessage=m=>recv(m&&m.data);}catch(e){}
  const send=d=>{d.tab=TAB;d.at=Date.now();try{bc&&bc.postMessage(d);}catch(e){}try{raw(MSG,JSON.stringify(d));}catch(e){}};
  /* QA (tests/s3-tabs 10, 11): TOPS_TABS_QA={delay:ms} makes this tab handle messages late, as a busy or just-woken tab does; late:1 also
     answers late hellos, as the old build did, to prove the taking-over tab's 2 s adopt on its own */
  function recv(d){const q=window.TOPS_TABS_QA;if(q&&q.delay>0)setTimeout(()=>on(d),q.delay);else on(d);}
  function on(d){if(!d||d.tab===TAB)return;ev('tabs_msg',{t:d.t,age:Date.now()-(+d.at||0),pending,away});
    if(d.t==='hello'&&!away&&!pending){if(Date.now()>(+d.at||0)+(+d.wait||WAIT)-150&&!(window.TOPS_TABS_QA&&TOPS_TABS_QA.late)){ev('tabs_late_hello',{age:Date.now()-(+d.at||0)});return;}   /* too late to answer: that tab has taken over (or is about to), so neither flush nor ack; its claim follows */
      const busy=midMatch();try{persist();}catch(e){}send({t:'ack',to:d.tab,busy,sv:mine()});}   // flush the last completed state, then answer
    else if(d.t==='ack'&&d.to===TAB&&pending){clearTimeout(waitT);if(d.busy){pending=false;away=true;card('busy');ev('tabs_busy');return;}
      const want=+(d.sv||0),t0=Date.now();const wait=()=>{if(!pending)return;if(svIn()>=want||Date.now()-t0>800)takeOver('ack');else setTimeout(wait,25);};wait();}   // the ack can beat the flushed save to this tab's storage
    else if(d.t==='claim'){if(pending){clearTimeout(waitT);pending=false;}stepAside('claim');}}
  /* a tab that took over on a timeout: the tab it claimed from may still finish a write it had started (or answer late) in the next ~2 s;
     that save is adopted here instead of making this tab step aside (DQ: both tabs ended behind the card) */
  const inGrace=()=>{if(!grace||Date.now()>grace.until)return false;try{const w=JSON.parse(localStorage.getItem(WR)||'null');return !!w&&w.tab===grace.from;}catch(e){return false;}};
  function graceAdopt(){if(body()!==lastBody)rescue('grace');ev('tabs_grace',{sv:svIn()});reread();}
  function reread(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&+(s.sv||0)>mine()&&window.TOPS_SAVEV&&TOPS_SAVEV.adopt)TOPS_SAVEV.adopt(s,'tab');}catch(e){}}
  function takeOver(why,from){if(away&&why!=='anyway')return;pending=false;away=false;owner=true;{const c=document.getElementById('tabsCard');if(c)c.remove();}if(why==='timeout'&&from)grace={from,until:Date.now()+2000};reread();try{persist();}catch(e){}send({t:'claim'});
    try{raw(OWN,JSON.stringify({tab:TAB,at:Date.now()}));}catch(e){}ev('tabs_own',{why});}
  window.addEventListener('storage',e=>{try{
    if(e.key===MSG&&e.newValue){if(!bc)recv(JSON.parse(e.newValue));}
    else if(e.key===OWN&&e.newValue){const o=JSON.parse(e.newValue);if(o&&!o.hb&&o.tab!==TAB&&!pending)stepAside('claim');
      else if(o&&o.hb&&!o.busy&&o.tab!==TAB&&away){const c=document.getElementById('tabsCard');if(c&&c.dataset.mode==='busy')card();}}   /* the match there ended: offer Play here (loads the save it just made) */
    else if(e.key===KEY&&e.newValue&&!away&&!pending&&!adopting&&stale()){if(inGrace())graceAdopt();else stepAside('newer');}}catch(x){}});
  /* hb: a heartbeat, never a claim. It also says whether the owner is mid-match (busy), written the moment a match starts or ends, so a new
     tab knows without waiting on an answer: a tab busy rendering a match can take seconds to hear a hello (DQ's race) */
  let hbBusy=null;const beat=()=>{if(owner&&!away)try{hbBusy=midMatch();raw(OWN,JSON.stringify({tab:TAB,at:Date.now(),hb:1,busy:hbBusy?1:0}));}catch(e){}};
  setInterval(beat,4000);setInterval(()=>{if(owner&&!away&&midMatch()!==hbBusy)beat();},400);   /* the poll is only a refresh: */
  /* busy is written synchronously where a match starts and ends (DQ 12:41: a tab busy rendering a match missed the 400 ms ticks, so a new
     tab 1.5 s in found no busy and took over). Every start goes through beginMatch; every end through endMatch, a quit back to the hub
     (showHub), or a reload (pagehide clears the owner key). */
  const edge=()=>{try{if(owner&&!away&&midMatch()!==hbBusy)beat();}catch(e){}};
  if(typeof beginMatch==='function'){const _bm=beginMatch;beginMatch=function(){try{return _bm.apply(this,arguments);}finally{edge();}};}
  if(typeof endMatch==='function'){const _em=endMatch;endMatch=function(){try{return _em.apply(this,arguments);}finally{edge();}};}
  if(typeof showHub==='function'){const _sh=showHub;showHub=function(){try{return _sh.apply(this,arguments);}finally{edge();}};}
  window.addEventListener('pagehide',()=>{try{const o=JSON.parse(localStorage.getItem(OWN)||'null');if(owner&&o&&o.tab===TAB)localStorage.removeItem(OWN);}catch(e){}});
  const start=()=>{let live=null;try{live=JSON.parse(localStorage.getItem(OWN)||'null');}catch(e){}
    if(!live||live.tab==='reload'||!(Date.now()-(live.at||0)<9000))takeOver('alone');
    else if(live.hb&&live.busy){pending=false;away=true;card('busy');ev('tabs_busy',{via:'beat'});}   /* mid-match there: no handshake needed */
    else{const WAITN=live.hb&&Date.now()-(live.at||0)<6000?WAIT_LIVE:WAIT;   /* a heartbeat this recent: the owner is alive but its busy is unknown (it may be starting a match), so wait longer for its answer */send({t:'hello',wait:WAITN});waitT=setTimeout(()=>{if(!pending)return;   /* this tab's own load can hold the ack in its queue past the timer: read the ack from storage, then give queued messages one more turn */
      try{const m=JSON.parse(localStorage.getItem(MSG)||'null');if(m&&m.t==='ack'&&m.to===TAB){on(m);return;}}catch(e){}
      setTimeout(()=>{if(pending)takeOver('timeout',live.tab);},60);},WAITN);}};
  // 2 + 4 the save itself
  const _p=persist;
  persist=function(){
    if(adopting){passing++;try{return _p.apply(this,arguments);}finally{passing--;lastBody=body();}}   // the migration inside an adopt saves the adopted save
    if(away||pending)return;
    const j=body();if(j!==null&&j===lastBody){try{hubBankUpdate();}catch(e){}return;}   // nothing changed: no write, no counter bump
    if(stale()){if(inGrace()){graceAdopt();return;}stepAside('newer');return;}
    if(foreign()&&svIn()>0)rescueStored('overwrite');   /* storage holds a save this tab didn't write (an older build's tab): keep it before overwriting */
    passing++;try{const r=_p.apply(this,arguments);lastBody=j;return r;}finally{passing--;}};
  // 3 the cloud
  const PB='tops_pbase';const pbase=()=>{try{const v=JSON.parse(localStorage.getItem(PB)||'null');if(!v)return null;if(v.ok)return true;return Date.now()-v.at<864e5?false:null;}catch(e){return null;}};
  const rpcPut=async()=>{const args={p_data:save};const pb=synced!=null?pbase():false;
    if(pb!==false&&synced!=null){const r=await NET.sb.rpc(TOPS_SAVE_NS.rpc,Object.assign({p_base:synced},args));
      if(!r.error){if(pb==null)try{raw(PB,JSON.stringify({ok:1,at:Date.now()}));}catch(e){}return r;}
      const m=String((r.error&&(r.error.code+' '+r.error.message))||'');if(/PGRST202/.test(m)){try{raw(PB,JSON.stringify({ok:0,at:Date.now()}));}catch(e){}}else return r;}
    return NET.sb.rpc(TOPS_SAVE_NS.rpc,args);};
  if(typeof cloudPush==='function'&&window.TOPS_SAVEV&&TOPS_SAVEV.adopt){
    const SV=TOPS_SAVEV,_adopt=SV.adopt;
    SV.adopt=function(c,why){if(c&&why!=='tab'&&mine()>0&&(synced==null||mine()>synced))rescue('cloud');   // this device saved since it last synced: keep its copy
      adopting++;let r;try{r=_adopt.apply(this,arguments);}finally{adopting--;}try{if(c&&why!=='tab')synced=+(c.sv||0);lastBody=body();}catch(e){}return r;};
    const _pull=SV.pull;SV.pull=async function(){if(away||pending)return;return _pull.apply(this,arguments);};
    cloudPush=function(now){if(typeof NET==='undefined'||!NET.user||!NET.sb||away||pending||stale())return;clearTimeout(NET.pushT);
      const go=async()=>{if(away||pending||stale())return;try{
        if(synced!=null){let c=null;try{const r=await NET.sb.from(TOPS_SAVE_NS.table).select('data').eq('user_id',NET.user.id).maybeSingle();c=r&&r.data&&r.data.data;}catch(e){}
          if(c&&c.dev!==SV.dev()&&+(c.sv||0)>synced){ev('save_conflict',{cloud:c.sv||0,synced,mine:mine()});SV.adopt(c,'push');return;}}
        const {data,error}=await rpcPut();if(error)throw error;
        if(data&&data.ok){NET.cloudAt=Date.now();synced=mine();return;}
        if(data&&data.err==='older'&&data.data){console.warn('TOPS cloud save is newer (sv '+data.sv+' vs '+mine()+'), loading it');SV.adopt(data.data,'push');}
      }catch(e){console.warn('cloud push',e);}};
      if(now)go();else NET.pushT=setTimeout(go,2500);};
  }else if(typeof cloudPush==='function'){const _c=cloudPush;cloudPush=function(){if(away||pending||stale())return;return _c.apply(this,arguments);};}
  lastBody=body();try{lastWrote=localStorage.getItem(KEY);}catch(e){}start();
  window.TOPS_TABS={tab:TAB,log:()=>LOG.slice(),away:()=>away,pending:()=>pending,canWrite:()=>!away&&!pending&&!stale(),stepAside,takeOver,synced:()=>synced,rescues:()=>{try{return JSON.parse(localStorage.getItem(RES)||'[]');}catch(e){return [];}}};
})();
