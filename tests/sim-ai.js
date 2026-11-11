// TOPS opponent difficulty gate (rule 11). Builds career opponents through the game's own pipeline
// (season fixtures, deciders, Deano, difficulty level + placement) and throws 501 legs with the game's own
// aiming (aimFor/withPref/targetPoint), spread (aiBaseSigma x pressure) and scoring (scoreAt).
// Reports each tier's opponent average and 180 rate per setting, and fails if any tier leaves its band.
// usage: node tests/sim-ai.js [legs per cell = 200] [--report-only]
const {chromium}=require('playwright');const path=require('path');
const LEGS=+process.argv[2]||200, REPORT=process.argv.includes('--report-only');
// draft bands (Overseer rule 11, pending Hayden): opponent 3-dart average on the Club ("as written") setting
const BANDS=[[50,58],[56,64],[62,70],[68,76],[74,82],[80,90],[88,100]];
// settings to check: [label, diff level, placement]. Placement +15 is the cap (a pub player averaging ~77).
const SETS=[['none',null,null],['rookie',  'rookie',0],['club','club',0],['comp','comp',0],['club+15','club',15],['comp+15','comp',15],['rookie+14 (Lee)','rookie',14]];
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
    out.push({set:lab,tier:t,targetMin:avgs[0],targetMax:avgs[avgs.length-1],targetMean:+(avgs.reduce((s,x)=>s+x,0)/avgs.length).toFixed(1),avg:+(pts/darts*3).toFixed(1),p180:+(m180/visits*100).toFixed(2),b2bPer100Legs:+(b2b/LEGS*100).toFixed(2)});}}
  delete save.diff;return out;},{LEGS,SETS});
 await b.close();
 const fails=[];const pad=(s,n)=>String(s).padEnd(n);
 console.log(pad('setting',18)+pad('tier',6)+pad('band',9)+pad('targets',12)+pad('sim avg',9)+pad('180s/100 visits',17)+'b2b 180s/100 legs');
 res.forEach(r=>{const [lo,hi]=BANDS[r.tier];console.log(pad(r.set,18)+pad(r.tier,6)+pad(lo+'-'+hi,9)+pad(r.targetMin+'-'+r.targetMax,12)+pad(r.avg,9)+pad(r.p180,17)+r.b2bPer100Legs);
  // gate: "as written" (no setting / Club, no placement) must sit inside the band; every setting may not exceed the band top by more than 5
  if((r.set==='none'||r.set==='club')&&(r.avg<lo-1||r.avg>hi+1))fails.push(`tier ${r.tier} ${r.set}: sim avg ${r.avg} outside band ${lo}-${hi}`);
  if(r.avg>hi+5)fails.push(`tier ${r.tier} ${r.set}: sim avg ${r.avg} more than 5 above band top ${hi}`);
  if(r.tier<=2&&r.b2bPer100Legs>1)fails.push(`tier ${r.tier} ${r.set}: back-to-back 180s in ${r.b2bPer100Legs} of 100 legs`);});
 if(fails.length){console.log('SIM-AI FAILED\n- '+fails.join('\n- '));if(!REPORT)process.exit(1);}else console.log('sim-ai: every tier inside its band');
})();
