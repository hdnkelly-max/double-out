// CAR-EASE (Hayden 10:03, after CAR-VIS): one honest ring that eases in. For a real career match at max stats on tiers 0 and 6 (nerves 0),
// the drawn ring (S.sigma path: ringVis) is sampled across the hold:
//   1 it IS the landing ring (ringR) at every hold time: what you see is where the dart lands
//   2 it eases in: it shrinks over the pull, slowly early and faster and faster into the ideal hold (the first half of the pull moves it less
//     than the last tenth), it's tight at the ideal hold (the perfect scatter) and grows back after it
//   3 it never sits parked at the 70 mm cap through the first half of the pull
// usage: node tests/ring-visual.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;newCareer();const c=career();c.stage=null;c.run=null;save.st2=save.st2||{};save.st2.v={sc:95,fi:95,ct:95,rh:95,co:95};
  const out={};for(const tier of [0,6]){c.tier=tier;beginMatch({mode:'career',tier,p0:'P',oppName:'X',oppAvg:50,legs:1});S.aim=targetPoint('T20');const en=effNerves;effNerves=()=>0;let tp;try{tp=Object.assign({},throwParams());}finally{effNerves=en;}
   const old=(dt)=>{const Rmin=1.794*tp.s0;const e=Math.max(0,Math.abs(dt)-tp.P);const k=Math.pow(e/Math.max(80,tp.D-tp.P),.5);return Math.min(70,Rmin+Math.max(0,tp.R0-Rmin)*k*(dt>0?1.3:1)*(tp.kv||1));};
   const holds=[.1,.25,.5,.75,.9,1,1.1].map(f=>f*tp.D);const rows=holds.map(h=>{const dt=h-tp.D;return {hold:Math.round(h),vis:+ringVis(dt,tp).toFixed(2),old:+old(dt).toFixed(2),land:+ringR(dt,tp).toFixed(2)};});
   out[tier]={D:+tp.D.toFixed(1),P:+tp.P.toFixed(1),rows};S.done=true;}return out;});
 const f=[];for(const t of ['0','6']){const x=r[t];x.rows.forEach(w=>{if(Math.abs(w.vis-w.land)>.01)f.push(`tier ${t} hold ${w.hold}: drawn ring ${w.vis} mm but the dart lands from ${w.land} mm`);});
  const v=x.rows.map(w=>w.vis);for(let i=1;i<6;i++)if(!(v[i]<v[i-1]))f.push(`tier ${t}: drawn ring does not shrink over the pull ${v.join(',')}`);
  if(!(v[6]>v[5]))f.push(`tier ${t}: the ring does not grow back after the ideal hold`);
  if(!((v[0]-v[2])<(v[4]-v[5])))f.push(`tier ${t}: no ease-in: the first half of the pull moves the ring ${(v[0]-v[2]).toFixed(1)} mm, the last tenth ${(v[4]-v[5]).toFixed(1)} mm`);
  if(v[2]>=109.9)f.push(`tier ${t}: drawn ring still at the cap halfway through the pull`);}
 if(errs.length)f.push('page errors '+errs.slice(0,2).join(' | '));console.log(JSON.stringify(r));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log(`PASS: drawn ring = landing ring and eases in, Pub ${r['0'].rows.map(w=>w.vis).join(' / ')} mm, Worlds ${r['6'].rows.map(w=>w.vis).join(' / ')} mm at holds 10/25/50/75/90/100/110% of the pull`);})();
