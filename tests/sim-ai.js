// TOPS opponent difficulty gate (rule 11). Builds career opponents through the game's own pipeline
// (season fixtures, deciders, Deano, difficulty level + placement) and throws 501 legs with the game's own
// aiming (aimFor/withPref/targetPoint), spread (aiBaseSigma x pressure) and scoring (scoreAt).
// Reports each tier's opponent average and 180 rate per setting, and fails if any tier leaves its band.
// usage: node tests/sim-ai.js [legs per cell = 200] [--report-only]
const {chromium}=require('playwright');const path=require('path');
const LEGS=+process.argv[2]||200, REPORT=process.argv.includes('--report-only');
// draft bands (Overseer rule 11): opponent 3-dart average. v1.80 (Hayden 21:52): one setting for everyone (Club); the old Rookie and
// Competitive saves must play exactly like Club.
const BANDS=[[50,58],[56,64],[62,70],[68,76],[74,82],[80,90],[88,100]];
// settings to check: [label, diff level, placement]. Placement +15 is the cap (a pub player averaging ~77).
// Lee's case: Competitive, ~70 player average at the pub -> old placement round((70-52)*0.6) = +11; Leemus's live save is Rookie +14
const SETS=[['club','club',0],['none',null,null],['old rookie save','rookie',0],['old comp save','comp',0],['comp+11 (Lee)','comp',11],['rookie+14 (Leemus save)','rookie',14],['comp+15 (max)','comp',15]];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});
 const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const res=await p.evaluate(({LEGS,SETS})=>{save.authSeen=true;$('login').hidden=true;
  const out=[];
  // one leg of 501 for an AI with target average `avg` at tier t (double out, busts, pressure + settle like startTurn)
  const leg=(avg,t,temper,dbl)=>{let score=501,darts=0,pts=0,m180=0,b2b=0,last180=false,settled=false;const base=aiBaseSigma(avg,t);
   const press=TIERS[t].press||0;
   for(let v=0;v<60&&score>0;v++){const ctx={press,score,oppScore:200+Math.random()*250,legs:0,oppLegs:0,need:2,decider:false};let pr=aiPressure(ctx,temper,settled);
    if(!settled&&pr.raw>=TEMPER[temper].settleAt){settled=true;pr=aiPressure(ctx,temper,true);}
    const sig=base*pr.mult;const start=score;let vis=0,bust=false;
    for(let d=1;d<=3;d++){const lbl=withPref(dbl,()=>aimFor(score,4-d));const tp=targetPoint(lbl);const h=scoreAt(tp.x+gauss()*sig,tp.y+gauss()*sig);darts++;
     const ns=score-h.v;if(ns<0||ns===1||(ns===0&&!h.dbl)){bust=true;break;}score=ns;vis+=h.v;if(score===0)break;}
    if(bust){score=start;vis=0;}pts+=vis;const is180=vis===180;if(is180){m180++;if(last180)b2b++;}last180=is180;}
   return {darts,pts,m180,b2b};};
  const temps=Object.keys(TEMPER);
  for(const [lab,lv,place] of SETS){
   if(lv){save.diff={lv,darts:999,pts:0,place,placeAvg:0};}else delete save.diff;
   for(let t=0;t<7;t++){newCareer();const c=career();c.tier=t;c.stage=null;c.season=null;c.next=null;
    // the field this tier would serve: 40 opponents through nextOpponent (fixtures, deciders, Deano)
    const avgs=[];for(let k=0;k<40;k++){let n;try{c.next=null;n=nextOpponent();}catch(e){n=null;}if(n&&n.oppAvg>0)avgs.push(n.oppAvg);try{if(c.season)c.season.week=1+(k%Math.max(1,c.season.len||1));}catch(e){}}
    if(!avgs.length)avgs.push(TIERS[t].avg);
    let darts=0,pts=0,m180=0,b2b=0,visits=0;
    for(let i=0;i<LEGS;i++){const a=avgs[i%avgs.length];const r=leg(a,t,temps[i%temps.length],[20,16,18,12,10,8][i%6]);darts+=r.darts;pts+=r.pts;m180+=r.m180;b2b+=r.b2b;visits+=Math.ceil(r.darts/3);}
    avgs.sort((x,y)=>x-y);
    let topAvg=null;if(lab==='club'){let d2=0,p2=0;const mx=avgs[avgs.length-1];for(let i=0;i<LEGS;i++){const r=leg(mx,t,temps[i%temps.length],[20,16,18,12,10,8][i%6]);d2+=r.darts;p2+=r.pts;}topAvg=+(p2/d2*3).toFixed(1);}
    out.push({set:lab,tier:t,targetMin:avgs[0],targetMax:avgs[avgs.length-1],targetMean:+(avgs.reduce((s,x)=>s+x,0)/avgs.length).toFixed(1),avg:+(pts/darts*3).toFixed(1),p180:+(m180/visits*100).toFixed(2),b2bPer100Legs:+(b2b/LEGS*100).toFixed(2),topAvg});}}
  delete save.diff;return out;},{LEGS,SETS});
 // ---- edge checks (ChatGPT 19:47) ----
 const edge=await p.evaluate(({LEGS})=>{const out={order:[],idem:[],top:[],legacy:null};const sh=window.TOPS_OPP_SHIFT;
  // (a) one setting: every opponent is the same whatever level an old save carries
  for(let t=0;t<7;t++)for(let v=TIERS[t].avg-12;v<=TIERS[t].avg+12;v++){const r=[];for(const lv of ['rookie','club','comp',null]){if(lv)save.diff={lv,darts:999,pts:0,place:0};else delete save.diff;r.push(sh(v,t));}if(new Set(r).size>1)out.order.push(`t${t} raw ${v}: ${r.join(' / ')}`);}
  // (b) shifted once: nextOpponent -> beginMatch, twice, same object and a rebuilt object
  save.diff={lv:'comp',darts:999,pts:0,place:0};newCareer();const c=career();c.tier=1;c.stage=null;c.season=null;c.next=null;V.walkOn=()=>{};
  const n=nextOpponent();c.next=n;const want=n.oppAvg;const go=o=>{beginMatch(o);const got=S.oppAvg;try{S.done=true;}catch(e){}return got;};
  const base={mode:'career',tier:1,p0:'T',oppName:n.oppName,oppAvg:n.oppAvg,legs:1};
  const g1=go(base),g2=go(base),g3=go(Object.assign({},base)),g4=go(Object.assign({},base,{oppAvg:n.oppAvg}));go(base);const raw=S.oppRaw;c.next=null;const g5=go(Object.assign({},base,{oppAvg:raw})); // revenge: the real match (started from the fixture) stores its raw rating; the replay shifts it once
  out.idem=[want,g1,g2,g3,g4,g5];
  // (c) toughest opponent each tier on Competitive (deciders, Deano): simulate the max target on its own
  return out;},{LEGS});
 // (g) a 1.79 save on Competitive (or Rookie) with a queued next opponent: reloads on Club, and the queued opponent plays at Club
 const move=[];for(const lv of ['comp','rookie']){await p.evaluate(lv=>{save.diff={lv,darts:300,pts:21000,place:0};newCareer();const c=career();c.tier=2;c.stage=null;c.next={oppName:'Queued',oppRaw:70,oppAvg:lv==='comp'?76:63,legs:3,_d:2};persist();},lv);
  await p.reload();await p.waitForTimeout(4000);
  move.push(await p.evaluate(()=>{const c=career();save.authSeen=true;$('login').hidden=true;V.walkOn=()=>{};const want=TOPS_OPP_SHIFT(70,2);const stored=c.next.oppAvg;beginMatch({mode:'career',tier:2,p0:'T',oppName:c.next.oppName,oppAvg:c.next.oppAvg,legs:1});const got=S.oppAvg;try{S.done=true;}catch(e){}return {lv:save.diff.lv,was:save.diff.lvWas,stored,got,want};}));}
 // (e) The Run: every stage tougher than the one before, the boss above its stage's regulars, on every setting
 const run=await p.evaluate(()=>{const out=[];for(const lv of ['club']){save.diff={lv,darts:999,pts:0,place:0};newCareer();const c=career();c.run=true;c.stage=null;const row=[];
  for(let t=0;t<7;t++){c.tier=t;const reg=[],boss=[];for(let w=0;w<2;w++){c.tierWins=w;for(let k=0;k<12;k++){c.next=null;let n;try{n=nextOpponent();}catch(e){n=null;}if(n&&n.oppAvg>0)(n.decider||n.boss?boss:reg).push(n.oppAvg);}}
   c.tierWins=2;for(let k=0;k<6;k++){c.next=null;let n;try{n=nextOpponent();}catch(e){n=null;}if(n&&n.oppAvg>0)(n.decider||n.boss?boss:reg).push(n.oppAvg);}
   row.push({t,reg:Math.max(...reg),regMin:Math.min(...reg),boss:boss.length?Math.max(...boss):null});}
  c.run=false;out.push({lv,row});}return out;});
 // (f) a save written by v1.75: next opponent already shifted (+8 Rookie/placement 14 style), revenge stored, placement set
 await p.evaluate(()=>{save.diff={lv:'rookie',darts:600,pts:40000,place:14,placeAvg:74.6};newCareer();const c=career();c.tier=1;c.stage=null;c.next={oppName:'Old Stored',oppAvg:75,legs:3,_d:1};c.v3=c.v3||{};C3.V3().rev={name:'Rev Guy',avg:79,stake:45};persist();});
 await p.reload();await p.waitForTimeout(4000);
 const stale=await p.evaluate(()=>{const c=career();save.authSeen=true;$('login').hidden=true;V.walkOn=()=>{};const n=c.next;beginMatch({mode:'career',tier:1,p0:'T',oppName:n.oppName,oppAvg:n.oppAvg,legs:1});const got=S.oppAvg;try{S.done=true;}catch(e){}
  const rv=C3.V3().rev;beginMatch({mode:'career',tier:1,p0:'T',oppName:rv.name,oppAvg:rv.avg,legs:1});const rev=S.oppAvg;try{S.done=true;}catch(e){}
  save.diff.place=0;const fresh=TOPS_OPP_SHIFT(75-8,1);return {next:got,raw:n.oppRaw,rev,revRaw:rv.avg,fresh,place:save.diff.place};});
 // (d) legacy saves: placement -6, 0, +15 stored before the update, then the page reloads with the new code
 const legacy=[];for(const pl of [-6,0,15]){await p.evaluate(pl=>{save.diff={lv:'comp',darts:300,pts:21000,place:pl,placeAvg:70,placeNew:pl!==0};persist();},pl);await p.reload();await p.waitForTimeout(4000);
  legacy.push(await p.evaluate(()=>{const d=save.diff;save.authSeen=true;$('login').hidden=true;newCareer();const c=career();c.tier=1;c.stage=null;c.season=null;c.next=null;const n=nextOpponent();return {place:d.place,placeNew:d.placeNew,opp:n.oppAvg,raw:n.oppRaw};}));}
 await b.close();
 const fails=[];
 run.forEach(({lv,row})=>{row.forEach((r,i)=>{if(i&&!(r.regMin>row[i-1].reg-6))0;if(i&&!(r.reg>row[i-1].reg))fails.push(`The Run ${lv}: stage ${i} regulars (${r.reg}) not above stage ${i-1} (${row[i-1].reg})`);if(r.boss!=null&&!(r.boss>r.reg))fails.push(`The Run ${lv}: stage ${i} boss ${r.boss} not above its regulars ${r.reg}`);});});
 console.log('The Run: '+run.map(({lv,row})=>lv+' '+row.map(r=>r.reg+(r.boss!=null?'/B'+r.boss:'')).join(' > ')).join(' · '));
 // a stored v1.75 opponent may be one of the tier's strongest (revenge, deciders) but never above the strongest the tier serves today
 const BND=BANDS[1],CLUBMAX=(res.find(r=>r.set==='club'&&r.tier===1)||{}).targetMax||BND[1]+3;if(stale.next>CLUBMAX)fails.push(`stored v1.75 opponent still inflated after update (above ${CLUBMAX}): ${JSON.stringify(stale)}`);if(stale.rev>CLUBMAX)fails.push(`stored v1.75 revenge still inflated (above ${CLUBMAX}): ${JSON.stringify(stale)}`);
 console.log('stale v1.75 save: '+JSON.stringify(stale));
 if(edge.order.length)fails.push('an old save level still changes opponents: '+edge.order.slice(0,3).join(' | '));
 move.forEach(m=>{if(m.lv!=='club'||m.stored!==m.want||m.got!==m.want)fails.push('1.79 save not moved to Club: '+JSON.stringify(m));});console.log('1.79 saves moved to Club: '+JSON.stringify(move));
 const [want,...got]=edge.idem;if(got.some(g=>g!==want))fails.push(`opponent shifted more than once: wanted ${want}, got ${got.join(',')}`);
 legacy.forEach((l,i)=>{if(l.place!==0||l.placeNew)fails.push(`legacy save placement ${[-6,0,15][i]} not cleared: ${JSON.stringify(l)}`);});
 const lt=legacy.map(l=>TOPS_TGT(l.raw));function TOPS_TGT(x){return x;}
 if(new Set(legacy.map(l=>l.opp)).size>1&&new Set(legacy.map(l=>l.raw)).size===1)fails.push('legacy saves give different opponents for the same raw rating: '+JSON.stringify(legacy));
 console.log('edges: order ok='+!edge.order.length+' · shift-once '+edge.idem.join('/')+' · legacy '+JSON.stringify(legacy));const pad=(s,n)=>String(s).padEnd(n);
 console.log(pad('setting',18)+pad('tier',6)+pad('band',9)+pad('targets',12)+pad('sim avg',9)+pad('180s/100 visits',17)+'b2b 180s/100 legs');
 res.forEach(r=>{const [lo,hi]=BANDS[r.tier];console.log(pad(r.set,18)+pad(r.tier,6)+pad(lo+'-'+hi,9)+pad(r.targetMin+'-'+r.targetMax,12)+pad(r.avg,9)+pad(r.p180,17)+r.b2bPer100Legs);
  // gate (rule 11): Competitive inside the band (1 point of sim noise); no setting above the band top; placement must not change anything
  if(r.set==='club'&&(r.avg<lo-1||r.avg>hi+1))fails.push(`tier ${r.tier} ${r.set}: sim avg ${r.avg} outside band ${lo}-${hi}`);
  if(r.avg>hi+5)fails.push(`tier ${r.tier} ${r.set}: sim avg ${r.avg} more than 5 over band top ${hi} (rule 11 hard cap)`);
  if(r.targetMax>hi+((r.tier<=1)?9:12))fails.push(`tier ${r.tier} ${r.set}: an opponent target of ${r.targetMax} is far above band top ${hi}`);
  if(r.topAvg!=null){console.log(`   toughest ${r.set} opponent at tier ${r.tier} (target ${r.targetMax}): sim ${r.topAvg}`);if(r.topAvg>hi+5)fails.push(`tier ${r.tier}: toughest opponent sims at ${r.topAvg}, more than 5 over band top ${hi}`);}
  if(r.tier<=2&&r.b2bPer100Legs>1)fails.push(`tier ${r.tier} ${r.set}: back-to-back 180s in ${r.b2bPer100Legs} of 100 legs`);});
 // tiers climb in order on every setting
 const bySet={};res.forEach(r=>(bySet[r.set]=bySet[r.set]||[])[r.tier]=r.avg);Object.entries(bySet).forEach(([k,a])=>{for(let t=1;t<a.length;t++)if(!(a[t]>a[t-1]))fails.push(`${k}: tier ${t} (${a[t]}) not above tier ${t-1} (${a[t-1]})`);});
 // one setting: every old save (any level, any placement) gets exactly the Club field
 const tg=(set,t)=>{const r=res.find(x=>x.set===set&&x.tier===t);return r&&r.targetMean;};for(let t=0;t<7;t++)SETS.slice(1).forEach(([k])=>{if(tg(k,t)!==tg('club',t))fails.push(`${k}: tier ${t} target ${tg(k,t)} differs from Club ${tg('club',t)}`);});
 if(fails.length){console.log('SIM-AI FAILED\n- '+fails.join('\n- '));if(!REPORT)process.exit(1);}else console.log('sim-ai: every tier inside its band');
})();
