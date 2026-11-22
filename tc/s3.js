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

/* CAR-PRESTIGE (Producer 21 Nov 22:43, agreed with ChatGPT): prestige-only spends. Money never buys stats.
   Gear first. A title at a level unlocks that level's premium edition (the trophy on the shelf is the free proof); buying the edition is a
   cosmetic, one-off spend that never takes the bank below the next entry fee. This file: the catalogue and the dart art.
   The dart parts only change how your own darts look: the flight SHAPE, shaft length, barrel and point (and every throw number) stay the ones
   you have equipped. game4's makeDart asks TOPS_GEAR() for {flight: canvas painter, shaft: colour, barrel: finish} on your own darts only. */
(function () {
  const ED = [
    { id: 'pub',    lv: 0, n: 'Kauri Arms flights',         price: 250,   parts: ['flight'] },
    { id: 'club',   lv: 1, n: 'Club shirt',                 price: 750,   parts: ['shirt'] },
    { id: 'opens',  lv: 2, n: 'Opens crest shirt',          price: 2000,  parts: ['shirt'] },
    { id: 'dpnz',   lv: 3, n: 'DPNZ fern darts',            price: 5000,  parts: ['flight', 'shaft', 'barrel'] },
    { id: 'tt',     lv: 4, n: 'Trans-Tasman kit',           price: 9000,  parts: ['flight', 'shaft', 'shirt'] },
    { id: 'card',   lv: 5, n: 'Tour Card signature darts',  price: 15000, parts: ['flight', 'shaft', 'barrel'] },
    { id: 'worlds', lv: 6, n: 'Worlds gold edition',        price: 25000, parts: ['flight', 'shaft', 'barrel'] }
  ];
  // flight art: the flight texture is a 256 px square laid over the whole flight (game4 flightTex scale), so big shapes, high contrast
  const FONT = '"Saira Condensed","Arial Narrow",Arial,sans-serif';
  function fern(x, cx, cy, s, col) {   // a silver fern frond: a curved stem with tapering leaflets
    x.save(); x.translate(cx, cy); x.rotate(-Math.PI / 4); x.fillStyle = col; x.strokeStyle = col; x.lineCap = 'round';
    x.lineWidth = 7 * s; x.beginPath(); x.moveTo(0, 95 * s); x.quadraticCurveTo(6 * s, 0, 0, -100 * s); x.stroke();
    for (let i = 0; i < 11; i++) { const t = i / 11, y = 85 * s - t * 180 * s, L = (1 - t * .85) * 52 * s;
      for (const d of [-1, 1]) { x.beginPath(); x.moveTo(0, y); x.quadraticCurveTo(d * L * .6, y - 6 * s, d * L, y - 20 * s); x.quadraticCurveTo(d * L * .55, y - 2 * s, 0, y + 9 * s); x.fill(); } }
    x.restore(); }
  function paint0(id, name) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    if (id === 'pub') {   // warm rimu wood with the pub's name, the Kauri Arms colours
      x.fillStyle = '#7a4a22'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(${i % 2 ? '40,20,8' : '160,100,50'},.28)`; x.lineWidth = 3 + (i % 3); x.beginPath(); x.moveTo(-20, i * 11); x.bezierCurveTo(80, i * 11 + 14, 170, i * 11 - 12, 280, i * 11 + 6); x.stroke(); }
      x.fillStyle = '#f2e2b8'; x.font = `800 46px ${FONT}`; x.textAlign = 'center'; x.save(); x.translate(140, 140); x.rotate(-Math.PI / 4); x.fillText('KAURI', 0, -6); x.fillText('ARMS', 0, 40); x.restore();
      x.strokeStyle = '#f2e2b8'; x.lineWidth = 8; x.strokeRect(4, 4, 248, 248); }
    else if (id === 'dpnz') { x.fillStyle = '#0d0e10'; x.fillRect(0, 0, 256, 256); fern(x, 140, 140, 1.15, '#d8dde2'); x.strokeStyle = '#d8dde2'; x.lineWidth = 6; x.strokeRect(3, 3, 250, 250); }
    else if (id === 'tt') {   // half NZ black, half Aussie green and gold, split along the flight
      x.fillStyle = '#0d0e10'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#0f6b3a'; x.beginPath(); x.moveTo(256, 0); x.lineTo(256, 256); x.lineTo(0, 256); x.closePath(); x.fill();
      x.strokeStyle = '#f2c230'; x.lineWidth = 16; x.beginPath(); x.moveTo(256, 0); x.lineTo(0, 256); x.stroke(); fern(x, 96, 96, .55, '#d8dde2');
      x.fillStyle = '#f2c230'; x.font = `800 40px ${FONT}`; x.textAlign = 'center'; x.save(); x.translate(176, 176); x.rotate(-Math.PI / 4); x.fillText('TT', 0, 14); x.restore(); }
    else if (id === 'card') {   // tour white with your signature in black ink
      x.fillStyle = '#f4f4f1'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#c9ccd0'; x.fillRect(0, 0, 256, 18);
      x.fillStyle = '#121316'; x.font = `italic 700 ${Math.max(34, 70 - (name || 'You').length * 3)}px "Brush Script MT","Segoe Script",cursive`; x.textAlign = 'center';
      x.save(); x.translate(132, 136); x.rotate(-Math.PI / 4); x.fillText(name || 'You', 0, 12); x.lineWidth = 4; x.strokeStyle = '#121316'; x.beginPath(); x.moveTo(-70, 30); x.quadraticCurveTo(10, 46, 82, 22); x.stroke(); x.restore(); }
    else if (id === 'worlds') {   // gold leaf with a black crown band
      const g = x.createLinearGradient(0, 0, 256, 256); g.addColorStop(0, '#8a6a22'); g.addColorStop(.45, '#f3d27a'); g.addColorStop(.55, '#e2b64a'); g.addColorStop(1, '#7a5a1a'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      x.fillStyle = '#111'; x.beginPath(); x.moveTo(256, 60); x.lineTo(256, 112); x.lineTo(112, 256); x.lineTo(60, 256); x.closePath(); x.fill();
      x.fillStyle = '#111'; x.font = `800 34px ${FONT}`; x.textAlign = 'center'; x.save(); x.translate(110, 110); x.rotate(-Math.PI / 4); x.fillText('WORLD', 0, -4); x.fillText('CHAMPION', 0, 28); x.restore(); }
    else return null;
    return c; }
  /* doc 75 (art): the flights redrawn as bold two-colour designs for the 180 / match-winner / 9-darter close-up and the walk-on (TOPS_FLT75, on
     by default; TOPS_FLT75=0 = the first-pass art above). Where the art lands on the flight: game4 maps the 256 px canvas at 1/.032 per metre,
     so the front of each wing shows only the canvas's lower right (the standard wing: a point at (0,230), its top edge up to (144,114) and
     (252,166), the root along y 230-256) and the back of each wing shows the mirror of that (the lower left). Everything is drawn for the front
     and mirrored for the back; text is flipped back so it reads on both faces. Every other flight shape (slim, kite, pear, vapor, shot, ar,
     tenx) covers the same core, x 150-250 / y 170-250, so the key mark sits there. One dominant colour per edition (what reads end-on, when the
     wings are slivers) + one bold contrast mark (what reads three-quarter): wood + cream, black + white fern, green | black split, white + black
     signature, gold + black crown. The default darts keep their set or custom flights (black + red Harrows on a new career). */
  const F75 = () => window.TOPS_FLT75 !== false && window.TOPS_FLT75 !== 0;
  const SIG = '"Snell Roundhand","Brush Script MT","Segoe Script","Bradley Hand",cursive';
  function word(x, m, t, cx, cy, rot) { x.save(); x.translate(cx, cy); if (m) x.scale(-1, 1); x.rotate(m ? -rot : rot); x.fillText(t, 0, 0); x.restore(); }
  function frond(x, s, col) {   // a bold silver fern: a curved stem from the wing root to the tall back tip, 13 long leaflet pairs leaning to the tip, a solid silhouette
    x.fillStyle = col; x.strokeStyle = col; x.lineCap = 'round'; x.lineJoin = 'round';
    const P = t => { const u = 1 - t; return [u * u * 62 + 2 * u * t * 150 + t * t * 246, u * u * 240 + 2 * u * t * 206 + t * t * 122]; };
    x.lineWidth = 8.5 * s; x.beginPath(); for (let i = 0; i <= 24; i++) { const [a, b] = P(i / 24); i ? x.lineTo(a, b) : x.moveTo(a, b); } x.stroke();
    for (let i = 0; i < 13; i++) { const t = .1 + i * .068, [a, b] = P(t), [a2, b2] = P(Math.min(1, t + .03)), ang = Math.atan2(b2 - b, a2 - a), L = (1 - t * .72) * 62 * s, W = 9.6 * s;
      for (const d of [-1, 1]) { const n = ang + d * .78, ex = a + Math.cos(n) * L, ey = b + Math.sin(n) * L, mx = a + Math.cos(n) * L * .5, my = b + Math.sin(n) * L * .5, px = -Math.sin(n) * W * d, py = Math.cos(n) * W * d;
        x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(mx + px, my + py, ex, ey); x.quadraticCurveTo(mx - px * .6 + (a2 - a) * .6, my - py * .6 + (b2 - b) * .6, a2, b2); x.closePath(); x.fill(); } } }
  function crown(x, cx, cy, w, col) {   // a five-point crown, heavy: wide spikes, big ball tips, a deep band (75b: +25% weight on the outer panel)
    const h = w * .66; x.fillStyle = col; x.beginPath(); x.moveTo(cx - w / 2, cy + h / 2);
    const pts = [[-.52, -.22], [-.36, .14], [-.27, -.5], [-.13, .08], [0, -.62], [.13, .08], [.27, -.5], [.36, .14], [.52, -.22]];
    pts.forEach(([u, v]) => x.lineTo(cx + u * w, cy + v * h)); x.lineTo(cx + w / 2, cy + h / 2); x.closePath(); x.fill();
    [[-.52, -.22], [-.27, -.5], [0, -.62], [.27, -.5], [.52, -.22]].forEach(([u, v]) => { x.beginPath(); x.arc(cx + u * w, cy + v * h - w * .035, w * .085, 0, 7); x.fill(); });
    x.fillRect(cx - w / 2, cy + h / 2 + w * .05, w, w * .17); }
  function star(x, cx, cy, r, n, col) { x.fillStyle = col; x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * .45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); }
  function pint(x, cx, cy, h, glass, beer) {   // a pint glass: cream glass, amber beer, a cream head
    const wT = h * .66, wB = h * .5, top = cy - h / 2, bot = cy + h / 2;
    const side = (y) => wB / 2 + (wT / 2 - wB / 2) * (bot - y) / h;
    x.fillStyle = glass; x.beginPath(); x.moveTo(cx - wT / 2 - 3, top); x.lineTo(cx + wT / 2 + 3, top); x.lineTo(cx + wB / 2 + 3, bot + 3); x.lineTo(cx - wB / 2 - 3, bot + 3); x.closePath(); x.fill();
    const yb = top + h * .24; x.fillStyle = beer; x.beginPath(); x.moveTo(cx - side(yb) + 3, yb); x.lineTo(cx + side(yb) - 3, yb); x.lineTo(cx + wB / 2 - 3, bot - 3); x.lineTo(cx - wB / 2 + 3, bot - 3); x.closePath(); x.fill();
    x.fillStyle = glass; x.beginPath(); x.ellipse(cx, top + 2, wT / 2 + 4, h * .1, 0, 0, 7); x.fill(); }
  // one edition = a base (the dominant colour, laid over the whole canvas) + a mark (drawn for the front face; mirrored onto the back canvas)
  const D75 = {
    pub: {   // Kauri Arms (75b): amber rimu wood, a cream root band and pinstripe, and the pub's mark on the outer panel: a big cream pint with amber beer (wood + cream)
      base(x) { x.fillStyle = '#86461c'; x.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 30; i++) { x.strokeStyle = i % 2 ? 'rgba(30,12,4,.35)' : 'rgba(170,96,44,.35)'; x.lineWidth = 2 + (i % 3); x.beginPath(); const y = i * 9; x.moveTo(-10, y); x.bezierCurveTo(70, y + 7, 170, y - 6, 266, y + 4); x.stroke(); }
        x.fillStyle = '#f0dfb2'; x.fillRect(0, 222, 256, 34); x.fillRect(0, 206, 256, 7); },
      mark(x) { pint(x, 202, 166, 84, '#f0dfb2', '#b8641e'); } },
    dpnz: {  // DPNZ: black with one big white fern across the wing, 20% larger in 75b so it reads when flights overlap (black + white)
      base(x) { x.fillStyle = '#0c0d0f'; x.fillRect(0, 0, 256, 256); }, mark(x) { frond(x, 1, '#eef1f3'); } },
    tt: {    // Trans-Tasman (75d, ChatGPT P2): the rivalry is split by FACE, not inside one face. The back of every wing is NZ (black, a big white fern,
             // as DPNZ, with a thin gold root band so it isn't mistaken for DPNZ): in the 180 close-up's 3/4 view the backs are the faces on top, so NZ leads.
             // The front is Australia (green, the gold Southern Cross, a gold root band).
             // Each flight's opposite wings are turned 180 deg, so wherever you stand you see one NZ wing and one Aussie wing in each plane, side by side.
      base(x) { x.fillStyle = '#0c0d0f'; x.fillRect(0, 0, 256, 256); },
      mark(x, back) { const G = '#f6c52c';
        if (back) { frond(x, 1, '#eef1f3'); x.fillStyle = G; x.fillRect(0, 240, 256, 16); return; }   // the back canvas is mirrored, so the fern still runs root to tip
        x.fillStyle = '#0f7a44'; x.fillRect(0, 0, 256, 256);
        star(x, 196, 128, 20, 5, G); star(x, 160, 160, 16, 5, G); star(x, 232, 150, 16, 5, G); star(x, 204, 184, 20, 5, G); star(x, 226, 176, 7, 5, G);
        x.fillStyle = G; x.fillRect(0, 232, 256, 24); } },
    card: {  // Tour Card (75b): tour blue with your signature as a big metallic silver mark on the outer panel and a silver swoosh (blue + silver)
      base(x) { x.fillStyle = '#1d3b78'; x.fillRect(0, 0, 256, 256); },
      mark(x, m, nm) { const g = x.createLinearGradient(0, 120, 0, 230); g.addColorStop(0, '#ffffff'); g.addColorStop(.45, '#c9d0d6'); g.addColorStop(.6, '#f4f6f8'); g.addColorStop(1, '#8e979f');
        x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#0d1a36'; x.lineWidth = 15; x.beginPath(); x.moveTo(104, 246); x.bezierCurveTo(166, 240, 222, 214, 254, 168); x.stroke();
        x.strokeStyle = g; x.lineWidth = 10; x.stroke();
        const MW = 106; let sig = nm, fs = 62; const fit = t => { x.font = `italic 700 62px ${SIG}`; const tw = x.measureText(t).width; return tw > MW ? 62 * MW / tw : 62; };
        fs = fit(sig); if (fs < 38 && sig.indexOf(' ') > 0) { sig = sig.split(' ')[0]; fs = fit(sig); }   // a long full name signs with the first name, so it stays big
        fs = Math.max(30, fs); x.font = `italic 700 ${fs}px ${SIG}`; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.save(); x.translate(180, 188); if (m) x.scale(-1, 1); x.rotate(m ? .3 : -.3); x.lineWidth = 5; x.strokeStyle = '#0d1a36'; x.strokeText(sig, 0, 0); x.fillStyle = g; x.fillText(sig, 0, 0); x.restore(); } },
    worlds: { // Worlds (75b): gold leaf with a heavier, bigger black crown on the outer panel and a black root band (gold + black)
      base(x) { const g = x.createLinearGradient(0, 100, 0, 256); g.addColorStop(0, '#f6da84'); g.addColorStop(.55, '#dcae45'); g.addColorStop(1, '#a87d26'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
        x.fillStyle = '#111111'; x.fillRect(0, 238, 256, 18); },
      mark(x) { crown(x, 200, 176, 92, '#111111'); } }
  };
  // back = the canvas for the back of each wing (game4 reads it mirrored), so the mark is laid out mirrored and its text flipped back
  function paint75(id, name, back) { const E = D75[id]; if (!E) return null; const nm = (name || 'You').slice(0, 12);
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); E.base(x);
    if (E.mark) { x.save(); if (back) { x.translate(256, 0); x.scale(-1, 1); } E.mark(x, !!back, nm); x.restore(); } return c; }
  function paint(id, name, back) { return F75() ? paint75(id, name, back) : back ? null : paint0(id, name); }
  // a flight-shaped preview for the shop (the front of one standard wing, as the close-up shows it): transparent outside the wing
  function swatch(id, name, px) { const src = paint(id, name); if (!src) return null; px = px || 128; const c = document.createElement('canvas'); c.width = c.height = px; const x = c.getContext('2d');
    const k = px / 256; x.scale(k, k); x.beginPath(); x.moveTo(0, 230); x.lineTo(144, 114); x.quadraticCurveTo(244, 106, 252, 166); x.lineTo(248, 254); x.lineTo(160, 256); x.closePath();
    x.save(); x.clip(); x.drawImage(src, 0, 0);
    if (id === 'tt' && F75()) { const bk = paint(id, name, true); if (bk) { x.beginPath(); x.moveTo(0, 0); x.lineTo(132, 0); x.lineTo(150, 256); x.lineTo(0, 256); x.closePath(); x.clip();   // 75d: the shop shows both faces: NZ on the root half, Australia on the outer half
      x.save(); x.translate(256, 0); x.scale(-1, 1); x.drawImage(bk, 0, 0); x.restore(); x.strokeStyle = '#f6c52c'; x.lineWidth = 6; x.beginPath(); x.moveTo(132, 0); x.lineTo(150, 256); x.stroke(); } }
    x.restore(); x.beginPath(); x.moveTo(0, 230); x.lineTo(144, 114); x.quadraticCurveTo(244, 106, 252, 166); x.lineTo(248, 254); x.lineTo(160, 256); x.closePath();   /* the wing outline again (the seam replaced the path) */ x.lineWidth = 3; x.strokeStyle = 'rgba(0,0,0,.55)'; x.stroke(); return c; }
  const PARTS = {   // shaft colour and barrel finish per edition (the flight is painted above)
    pub:    {},
    dpnz:   { shaft: 0x0d0e10, barrel: { col: 0x2a2d31, met: .9, rough: .28, band: 0xd8dde2 } },
    tt:     { shaft: 0xf2c230 },
    card:   { shaft: 0xf4f4f1, barrel: { col: 0xb9c0c6, met: .95, rough: .18, band: 0x121316 } },
    worlds: { shaft: 0xd9b24a, barrel: { col: 0xd4a63c, met: .95, rough: .2, band: 0x111111 } }
  };
  const CACHE = {};
  // which edition your darts wear: TOPS_GEAR_PREVIEW (captures) or the equipped one on the career
  function equipped() { try { if (window.TOPS_GEAR_PREVIEW) return window.TOPS_GEAR_PREVIEW; const c = career(), g = c && c.prestige; return g && g.eq && g.eq.darts || null; } catch (e) { return null; } }
  window.TOPS_GEAR = function () { const id = equipped(); if (!id || !PARTS[id]) return null; const nm = (typeof save !== 'undefined' && save.name) || 'You';
    const key = id + '|' + nm + (F75() ? '|75' : ''); if (!CACHE[key]) CACHE[key] = [paint(id, nm), paint(id, nm, true)]; const fb = CACHE[key][1];
    return Object.assign({ id, flight: CACHE[key][0] }, fb ? { flightB: fb } : {}, PARTS[id]); };
  /* gear cam (Producer 07:03): on your 180s, the match-winning double and any nine-darter, a ~1.2 s still close-up of your three darts in the
     board over the board pane. Tap skips. Never on ordinary visits; the match carries on underneath (turn timing and throw numbers unchanged).
     Behind TOPS_GEARCAM (?gearcam=1 sticks, ?gearcam=0 off) until it ships. */
  window.TOPS_GEARCAM = (() => { try { const q = new URLSearchParams(location.search).get('gearcam'); if (q === '1' || q === '0') localStorage.setItem('tops_gearcam', q); return localStorage.getItem('tops_gearcam') === '1'; } catch (e) { return false; } })();
  const GC_MS = 1200, LAB = { '180': 'ONE HUNDRED AND EIGHTY', match: 'GAME SHOT AND THE MATCH', nine: 'NINE-DARTER' };
  function pane() {   // the board pane: under the match header, down to where the pull pad starts (or the board's bottom edge)
    let top = 0, bot = 0; try { const m = document.getElementById('btnMenu').getBoundingClientRect(); if (m.height > 0 && m.bottom < innerHeight * .2) top = Math.round(m.bottom); } catch (e) {}   // the match header ends under its MENU button
    try { const r = document.getElementById('pullPad').getBoundingClientRect(); if (r.height > 40 && r.top > top + 80) bot = Math.round(r.top); } catch (e) {}
    if (!bot) try { const b = V.boardBottomY(); if (b > top + 80) bot = Math.round(b); } catch (e) {}
    if (!bot) bot = Math.round(innerHeight * .45); return { top, h: bot - top }; }
  window.TOPS_GEARCAM_FIRE = function (kind) {
    const VV = typeof V !== 'undefined' ? V : null; if (!window.TOPS_GEARCAM || !VV || !VV.gearShot) return false; const P = pane(); const shot = VV.gearShot(innerWidth / P.h); if (!shot) return false;
    const old = document.getElementById('gearCam'); if (old) old.remove();
    const d = document.createElement('div'); d.id = 'gearCam'; d.setAttribute('role', 'img'); d.setAttribute('aria-label', 'Your darts, close up');
    d.style.cssText = `position:fixed;left:0;right:0;top:${P.top}px;height:${P.h}px;z-index:2147483000;overflow:hidden;background:#000;opacity:1;touch-action:none;pointer-events:auto`;
    shot.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
    d.appendChild(shot); const t = document.createElement('div'); t.textContent = LAB[kind] || ''; t.style.cssText = 'position:absolute;left:12px;bottom:10px;font:800 13px/1 "Saira Condensed","Arial Narrow",Arial,sans-serif;letter-spacing:1.5px;color:#f3f4f2;background:rgba(10,11,13,.72);padding:6px 9px;border-left:3px solid #c6f36b'; d.appendChild(t);
    document.body.appendChild(d); const Q = window.TOPS_GEARCAM_QA || {}; if (!Q.still) try { d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 }); shot.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }], { duration: GC_MS, fill: 'forwards', easing: 'cubic-bezier(.2,.6,.3,1)' }); } catch (e) {}
    let gone = false; const end = () => { if (gone) return; gone = true; try { d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: 'forwards' }); } catch (e) {} setTimeout(() => d.remove(), 150); };
    const skip = e => { try { e.preventDefault(); e.stopPropagation(); } catch (x) {} end(); };   // the tap that skips never reaches the aim pad
    d.addEventListener('pointerdown', skip, true); d.addEventListener('touchstart', skip, { capture: true, passive: false }); setTimeout(end, Q.hold || GC_MS);   // QA captures: {still, hold} (slow software GL drops frames)
    window.TOPS_GEARCAM_LAST = { kind, at: Date.now(), w: shot.width, h: shot.height }; return true; };
  /* ---------- the shop (Producer 07:03, decided with ChatGPT): a title at a level unlocks that level's premium edition; the trophy on the shelf
     is the free proof. Buying is cosmetic and one-off and never takes the bank below the next entry fee. Owned editions never expire; one
     dart edition is worn at a time. Shirt editions (Club, Opens) and the Trans-Tasman shirt only show outside matches and need their kit art,
     so they're listed but not sold until that lands (READY). ---------- */
  const READY = { pub: 1, dpnz: 1, tt: 1, card: 1, worlds: 1 };   // Club/Opens shirts aren't listed until their kit art exists. Owning 'tt' is the entitlement to the TT shirt: when it ships, every owner gets it (no second purchase)
  const CIRC = () => window.TOPS_CIRCUIT;
  const carOf = () => { try { const c = career(); return c && c.circuit ? c : null; } catch (e) { return null; } };
  const wonAt = (k, ed) => (k.history || []).some(h => h.fin === 'W' && (ed.id === 'worlds' ? h.id === 'worlds' : h.level === ed.lv));
  function floorFee(c) {   // the next entry fee at the player's level: the cheapest event there (with the trip funded if it is)
    const E = CIRC(), k = c.circuit; try { const L = E.LEVELS[k.level]; return Math.min(...L.events.map(e => E.costFor ? E.costFor(k, e) : E.cost(e))); } catch (e) { return 0; } }
  /* owned is the player's, not the career's (Producer 14:43: "owned forever" means across careers): owned editions and when they were bought
     live at save level (save.prestige); what you wear stays per career (c.prestige.eq). A career from before this keeps its owned list
     until first read, when it moves up (merged, never lost). Bank and owned are still in one save, so they roll back together. */
  const vault = () => { if (typeof save === 'undefined' || !save) return { own: [], at: {} }; const v = save.prestige = save.prestige && typeof save.prestige === 'object' ? save.prestige : {};
    v.own = Array.isArray(v.own) ? v.own : []; v.at = v.at && typeof v.at === 'object' ? v.at : {}; return v; };
  const pres = c => { c.prestige = c.prestige && typeof c.prestige === 'object' ? c.prestige : {}; const g = c.prestige; g.eq = g.eq || {};
    if (Array.isArray(g.own)) { const v = vault(); g.own.forEach(id => { if (!v.own.includes(id)) v.own.push(id); if (g.at && g.at[id] && !v.at[id]) v.at[id] = g.at[id]; }); delete g.own; delete g.at; }
    return g; };
  const owns = id => vault().own.includes(id);
  function state(id) { const ed = ED.find(x => x.id === id), c = carOf(); if (!ed || !c) return null; const g = pres(c), k = c.circuit;
    const owned = owns(id), won = wonAt(k, ed), fee = floorFee(c), left = c.bank - ed.price;
    return { id, n: ed.n, lv: ed.lv, price: ed.price, ready: !!READY[id], won, owned, worn: g.eq.darts === id, fee, canAfford: left >= fee,
      can: !!READY[id] && won && !owned && left >= fee }; }
  function buy(id) { const st = state(id), c = carOf(); if (!st) return { ok: false, why: 'No career' };
    if (!st.ready) return { ok: false, why: 'Not on sale yet' }; if (!st.won) return { ok: false, why: 'Win a title at this level to unlock it' };
    if (st.owned) return { ok: false, why: 'Already yours' }; if (!st.canAfford) return { ok: false, why: 'Keep ' + st.fee + ' for your next entry' };
    if (window.TOPS_TABS && TOPS_TABS.canWrite && !TOPS_TABS.canWrite()) return { ok: false, why: 'TOPS is open in another tab' };
    c.bank -= st.price; const g = pres(c), v = vault(); v.own.push(id); v.at[id] = Date.now(); if (ED.find(x => x.id === id).parts.includes('flight')) g.eq.darts = id;
    try { persist(); } catch (e) {} try { window.TOPS_FLIGHT && TOPS_FLIGHT.log && TOPS_FLIGHT.log('prestige_buy', { id, price: st.price, bank: c.bank }); } catch (e) {}
    return { ok: true, id, bank: c.bank }; }
  function wear(id) { const c = carOf(); if (!c) return { ok: false }; const g = pres(c); if (id && !owns(id)) return { ok: false, why: 'Not yours yet' };
    g.eq.darts = id || null; try { persist(); } catch (e) {} return { ok: true, worn: g.eq.darts }; }
  /* the edition row under each level on the trophy shelf (Locker > Trophies). Self-contained: rb/s3.js only asks for the row's HTML; taps are
     handled here (delegated), and the row redraws itself. Buying takes two taps (the first arms it for 3 s), never a dialog. */
  const $m = n => '$' + Math.round(n).toLocaleString('en-NZ'); const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const THUMB = {}; const thumb = id => { if (!PARTS[id]) return ''; const nm = (typeof save !== 'undefined' && save.name) || 'You', k = id + '|' + nm; try { if (!THUMB[k]) THUMB[k] = swatch(id, nm, 112).toDataURL('image/png'); } catch (e) { return ''; } return THUMB[k]; };   // 75c: the flight-shaped swatch
  function row(lv) { const ed = ED.find(x => x.lv === lv); if (!ed || !READY[ed.id]) return ''; const st = state(ed.id); if (!st) return '';   /* never list what can't render yet (Producer 10:40): Club/Opens shirts wait for their kit art */ const E = CIRC(), L = E && E.LEVELS[lv];
    let line, btn = '';
    if (!st.ready) line = 'Joins the shop with the new kits';
    else if (!st.won) line = (ed.id === 'worlds' ? 'Win the World Championship' : 'Win a ' + esc(L ? L.n : '') + ' title') + ' to unlock · ' + $m(ed.price);
    else if (!st.owned) { line = ed.id === 'tt' ? 'Flights and shafts now · shirt joins your locker when it\u2019s made' : 'Your title unlocked it · cosmetic only'; const armed = ARM.id === ed.id && Date.now() - ARM.at < 3000; btn = st.canAfford ? `<button type="button" class="s3-edb" data-ed-buy="${ed.id}">${armed ? `<b>Tap again to buy</b><small>${$m(ed.price)}</small>` : `<b>Buy · ${$m(ed.price)}</b>`}</button>` : `<button type="button" class="s3-edb" disabled><b>${$m(ed.price)}</b><small>Keep ${$m(st.fee)} for your next entry</small></button>`; }
    else if (PARTS[ed.id]) { line = (st.worn ? 'On your darts' : 'Yours') + (ed.id === 'tt' ? ' · shirt joins your locker when it\u2019s made' : ''); btn = `<button type="button" class="s3-edb s3-edw" data-ed-wear="${st.worn ? '' : ed.id}"><b>${st.worn ? 'Take off' : 'Wear'}</b></button>`; }
    else line = 'Yours';
    const img = thumb(ed.id); return `<div class="s3-ed${st.owned ? ' s3-edown' : st.won && st.ready ? ' s3-edopen' : ''}" data-edrow="${lv}">${img ? `<img src="${img}" alt="" class="s3-edsw">` : '<i></i>'}<div><span>Title edition</span><b>${esc(ed.n)}</b><small>${line}</small></div>${btn}</div>`; }
  const ARM = { id: null, at: 0 };   // the first tap arms a buy for 3 s (kept here, so a shelf redraw in between doesn't lose it)
  const redraw = lv => { const r = document.querySelector(`[data-edrow="${lv}"]`); if (r) r.outerHTML = row(lv); };
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ed-buy],[data-ed-wear]'); if (!b) return; e.preventDefault(); e.stopPropagation();
    const r = b.closest('[data-edrow]'), lv = r ? +r.dataset.edrow : null;
    if (b.dataset.edBuy) { const id = b.dataset.edBuy; if (!(ARM.id === id && Date.now() - ARM.at < 3000)) { ARM.id = id; ARM.at = Date.now(); redraw(lv); setTimeout(() => { if (ARM.id === id) { ARM.id = null; redraw(lv); } }, 3050); return; }
      ARM.id = null; const res = buy(id); if (!res.ok) { b.innerHTML = '<b>' + esc(res.why || 'Not bought') + '</b>'; setTimeout(() => redraw(lv), 1800); return; } redraw(lv);
      try { const bk = document.getElementById('rbBank'); if (bk) bk.textContent = $m(career().bank); } catch (x) {} }
    else { wear(b.dataset.edWear || null); redraw(lv); } }, true);
  /* every level's edition in one block (Producer 14:43): the live Trophies view shows them all, locked ones with their unlock line; the Season 3
     shelf (s3x) keeps each row under its level and lists the levels above yours here. Only what can render is listed (Club/Opens wait for kits). */
  function section(from, title) { const rows = ED.filter(e => e.lv >= (from || 0) && READY[e.id]).map(e => row(e.lv)).filter(Boolean).join(''); if (!rows) return '';
    return `<section class="rb-card s3-edsec"><div class="s3-row"><span class="s3-trn">${esc(title || 'Title editions')}</span><span class="rb-sub">Win a title, unlock its darts</span></div>${rows}</section>`; }
  window.TOPS_PRESTIGE = { ED, paint, PARTS, READY, state, buy, wear, floorFee, row, section, swatch, owns };
})();
