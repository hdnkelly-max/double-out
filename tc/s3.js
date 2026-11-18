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

  function view(){const k=circ();if(!k)return null;const c=career();k.bank=c.bank||0;const E=C(),Lv=E.LEVELS[k.level];
    const played=k.history.filter(h=>h.level===k.level).length;
    const cal=E.calendar(k).map(e=>{const prizes={},points={};E.FIN.forEach(f=>{prizes[f]=E.prizeFor(e,f);points[f]=E.pointsFor(e,f);});return {id:e.id,n:e.n,where:e.where,kind:e.kind,size:e.size,entry:e.entry,travel:e.travel,cost:e.cost,purse:e.purse,pts:e.pts,every:e.every,jump:!!e.jump,canAfford:e.canAfford,prizes,points};});
    let live=null;if(k.live){const e=E.eventOf(k.live.id),o=E.nextOpp(k);live={id:e.id,n:e.n,where:e.where,round:k.live.round,roundName:E.FIN_NAME[o.round]||o.round,rounds:k.live.rounds.slice(),results:(k.live.results||[]).slice(),group:k.live.g?{w:k.live.g.w,p:k.live.g.p}:null,opp:{name:oppName(k),avg:o.avg,legs:o.legs}};}
    const costs=Lv.events.map(E.cost);const avgCost=costs.reduce((s,x)=>s+x,0)/Math.max(1,costs.length);
    return {level:{i:k.level,id:Lv.id,n:Lv.n,s:Lv.s,avg:Lv.avg,legs:Lv.legs,up:Lv.up,need:Lv.need,pts:k.pts[Lv.id]||0,minEv:Lv.minEv,played},
      ladder:E.LEVELS.map((x,i)=>({i,id:x.id,n:x.n,avg:x.avg,state:i<k.level?'done':i===k.level?'current':i===k.level+1?'next':'locked'})),
      week:k.week,bank:c.bank||0,debt:k.debt||0,runway:Math.floor((c.bank||0)/Math.max(1,avgCost)),calendar:cal,live,
      oom:Lv.id==='dpnz'?E.dpnzTable(k).map(r=>({n:r.n,pts:r.pts,you:!!r.you})):null,
      history:k.history.slice().reverse().map(h=>Object.assign({finName:E.FIN_NAME[h.fin]||h.fin},h)),card:!!k.card,qsOffer:!!k.qsOffer};}
  function book(id){if(!on())return {ok:false,why:'Season 3 is off'};const k=circ();if(!k)return {ok:false,why:'No career'};if(k.live)return {ok:false,why:'Finish the event you are in first'};
    const e=C().eventOf(id);if(!e||e.level!==k.level||!C().calendar(Object.assign({},k,{bank:career().bank||0})).some(x=>x.id===id))return {ok:false,why:'Not on this week'};
    const r=sync(k=>C().book(k,id));if(r&&r.ok){persist();L('s3_book',{id,cost:C().cost(e),bank:career().bank});}return r&&r.ok?{ok:true}:{ok:false,why:(r&&r.why)||'Could not book'};}
  // play(): the screens' Play button. It goes through playNext so ENG-RESET gives a fresh page between matches (its launcher replays playNext on the new page)
  function play(){if(!on())return false;const k=circ();if(!k||!k.live)return false;try{window.playNext();}catch(e){return false;}return true;}
  function playNow(){if(!on())return false;const k=circ();if(!k||!k.live)return false;const o=C().nextOpp(k),e=C().eventOf(k.live.id),nm=oppName(k);
    beginMatch({mode:'career',tier:k.level,p0:save.name||'You',oppKey:nm,oppName:nm,oppAvg:o.avg,legs:o.legs,purse:0,fee:0});
    if(SS()){S.s3={id:e.id,round:o.round,level:k.level};}L('s3_match',{id:e.id,round:o.round,opp:o.avg,legs:o.legs});return true;}
  function advance(){if(!on())return {ok:false,why:'Season 3 is off'};const r=sync(k=>C().advance(k));if(r&&r.ok){persist();L('s3_advance',{amt:r.amt});}return r;}

  // ---- the hub's old "Play" goes to the Circuit: the next round of your event, or (until the Circuit screen books for you) the first
  //      event on this week you can afford; broke = the hardship advance. Never the Season 2 league.
  if(typeof playNext==='function'){const _pn=playNext;playNext=function(){if(!on())return _pn.apply(this,arguments);const c=career();if(!c||c.run)return _pn.apply(this,arguments);
    const k=circ();if(!k.live){const v=view();let e=v.calendar.find(x=>x.canAfford);if(!e){const a=advance();if(a&&a.ok)e=view().calendar.find(x=>x.canAfford);}
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
    S.s3res=r;persist();setTimeout(()=>{try{lbPost();}catch(e){}},1500);
    L('s3_result',{id:S.s3.id,round:S.s3.round,won:S.won?1:0,done:r.done?1:0,fin:r.fin||null,prize:r.prize||0,pts:r.pts||0,up:r.up?(r.up.to!=null?r.up.to:'champ'):null,bank:c.bank,level:c.circuit.level});
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
  window.TOPS_S3={on,view,book,play,advance,withdraw(){return {ok:false,why:'Not yet'};},_circ:circ,_playNow:playNow};
  window.TOPS_BESTLEG=BESTLEG;window.TOPS_HISTORY=HISTORY;
})();
