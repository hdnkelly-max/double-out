// CAR-TOP (Hayden 22:21-22:26): the throw gets harder by career STAGE (game4 STAGE_TUNE), perfects land where you aimed, and near-misses grow smoothly.
// Checks, in a real career match (nerves 0, no traits):
//   1 each tier's window = the Rhythm window x STAGE_TUNE[tier].win, its cone = STAGE_TUNE[tier].cone/.ex (one table drives it)
//   2 buying Rhythm never hurts: on every tier the window grows with Rhythm and the cone does not move
//   3 a higher stage is never easier: window multiplier and cone ms never grow tier on tier
//   4 a perfect release lands where you aimed: dead-centre T20 lock, perfect timing -> T20 >= 93% at max stats (Worlds) and >= 75% at starter stats (Pub)
//   5 no cliff at the window edge: the miss ring starts exactly at the perfect scatter, 1 ms outside keeps >= 70% of the perfect T20 rate,
//     and the ring grows steadily with the timing error (early and late)
//   6 off-career play is untouched by STAGE_TUNE (cone from the level table TT)
// usage: node tests/car-top.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{if(typeof STAGE_TUNE==='undefined'||typeof PERF_K==='undefined')return {err:'STAGE_TUNE / PERF_K missing'};
  save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.run=null;
  const tpAt=(tier,v,rh)=>{c.tier=tier;save.st2=save.st2||(window.TOPS_st&&TOPS_st());save.st2.v={sc:v,fi:v,ct:v,rh:rh==null?v:rh,co:v};save.st2.trait=null;save.barrel='assassin';save.setup={point:'std',shaft:'med',flight:'standard'};save.arm=0;
   beginMatch({mode:'career',tier,p0:'P',oppName:'X',oppAvg:50,legs:1});S.aim=targetPoint('T20');S.adren=0;S.calm=99;const en=effNerves;effNerves=()=>0;let tp;try{tp=Object.assign({},throwParams());}finally{effNerves=en;}
   const ti=TIERS.indexOf(S.tier);return {tp,ti};};
  const t20=(tp,dt,n)=>{const lock={x:S.aim.x,y:S.aim.y};let h=0;for(let i=0;i<n;i++){const l=landFrom(lock,tp,dt);if(scoreAt(l.x,l.y).label==='T20')h++;}return h/n;};
  const out={tiers:[],rh:[],t20:{},cliff:{},grow:{}};
  const base=tpAt(0,95).tp.P;
  for(let t=0;t<STAGE_TUNE.length;t++){const {tp,ti}=tpAt(t,95);out.tiers.push({t,ti,P:+tp.P.toFixed(3),ratio:+(tp.P/base).toFixed(4),want:STAGE_TUNE[t][0],D:+tp.D.toFixed(3),wantD:STAGE_TUNE[t][1],ex:tp.ex,wantEx:STAGE_TUNE[t][2]});
   const rows=[20,58,95].map(rh=>{const q=tpAt(t,60,rh).tp;return {rh,P:+q.P.toFixed(3),D:+q.D.toFixed(3),ex:q.ex};});out.rh.push({t,rows});}
  {const {tp}=tpAt(6,95);S.done=false;out.t20.top=t20(tp,0,20000);out.t20.topSigma=+(tp.s0*PERF_K).toFixed(2);
   const r0=ringR(tp.P,tp),rIn=ringR(tp.P*.5,tp);out.cliff={start:+r0.toFixed(3),perfectRing:+(PERF_K*1.794*tp.s0).toFixed(3),inside:+rIn.toFixed(3),early1:t20(tp,-(tp.P+1),20000),late1:t20(tp,tp.P+1,20000)};
   const g=s=>[1,2,3,5,8,12,20,40].map(e=>+ringR(s*(tp.P+e),tp).toFixed(2));out.grow={early:g(-1),late:g(1)};}
  {const {tp}=tpAt(0,20);out.t20.pub=t20(tp,0,20000);}
  // off-career: on() is false when the career has a run (v09); the cone then comes from TT (nerves 0)
  {c.tier=6;beginMatch({mode:'career',tier:6,p0:'P',oppName:'X',oppAvg:50,legs:1});c.run={};const en=effNerves;effNerves=()=>0;let tp;try{tp=Object.assign({},throwParams());}finally{effNerves=en;c.run=null;}out.off={D:+tp.D.toFixed(3),want:+ttAt(tp.L).D.toFixed(3),ex:tp.ex===undefined?null:tp.ex};}
  S.done=true;return out;});
 const f=[];if(r.err)f.push(r.err);else{
  r.tiers.forEach(x=>{if(x.ti!==x.t)f.push(`tier ${x.t}: match ran on tier index ${x.ti}`);if(Math.abs(x.ratio-x.want)>.002)f.push(`tier ${x.t}: window x${x.ratio}, want x${x.want}`);if(Math.abs(x.D-x.wantD)>.01||x.ex!==x.wantEx)f.push(`tier ${x.t}: cone ${x.D}/${x.ex}, want ${x.wantD}/${x.wantEx}`);});
  r.rh.forEach(({t,rows})=>{if(!(rows[0].P<rows[1].P&&rows[1].P<rows[2].P))f.push(`tier ${t}: window does not grow with Rhythm `+JSON.stringify(rows));if(new Set(rows.map(x=>x.D+'/'+x.ex)).size!==1)f.push(`tier ${t}: Rhythm moves the cone `+JSON.stringify(rows));});
  for(let t=1;t<r.tiers.length;t++){const a=r.tiers[t-1],c=r.tiers[t];if(c.want>a.want||c.wantD>a.wantD)f.push(`tier ${t} is easier than tier ${t-1}`);}
  if(r.t20.top<.93)f.push(`perfect from a dead-centre T20 lock at max stats: T20 ${(100*r.t20.top).toFixed(1)}%, want >= 93%`);
  if(r.t20.pub<.75)f.push(`perfect at starter stats: T20 ${(100*r.t20.pub).toFixed(1)}%, want >= 75%`);
  if(Math.abs(r.cliff.start-r.cliff.perfectRing)>.01||Math.abs(r.cliff.inside-r.cliff.perfectRing)>.01)f.push('miss ring does not start at the perfect scatter '+JSON.stringify(r.cliff));
  if(r.cliff.early1<.7*r.t20.top||r.cliff.late1<.7*r.t20.top)f.push(`cliff: 1 ms outside the window T20 ${(100*r.cliff.early1).toFixed(0)}% early / ${(100*r.cliff.late1).toFixed(0)}% late vs perfect ${(100*r.t20.top).toFixed(0)}%`);
  ['early','late'].forEach(k=>{const a=r.grow[k];for(let i=1;i<a.length;i++)if(!(a[i]>a[i-1]))f.push(`${k} misses do not grow steadily: `+a.join(','));});
  if(Math.abs(r.off.D-r.off.want)>.01||r.off.ex!==null)f.push('off-career throw uses the stage table '+JSON.stringify(r.off));}
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 console.log(JSON.stringify(r));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log(`PASS: stage table drives window x${r.tiers.map(x=>x.want).join('/')} and cone ${r.tiers.map(x=>x.wantD).join('/')} ms by tier; Rhythm always widens the window and never moves the cone; higher stages never easier; perfect from a dead-centre T20 lock: T20 ${(100*r.t20.top).toFixed(1)}% at max (Worlds), ${(100*r.t20.pub).toFixed(1)}% at starter (Pub); miss ring starts at the perfect scatter, 1 ms outside keeps T20 ${(100*r.cliff.early1).toFixed(0)}%/${(100*r.cliff.late1).toFixed(0)}% (early/late), grows steadily; off-career untouched`);
})();
