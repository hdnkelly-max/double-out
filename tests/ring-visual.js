// CAR-VIS (P0, David 09:47 on 3.55): the ring you time against must shrink over the pull exactly as on 3.54, on every tier.
// For a real career match at max stats on tiers 0 and 6 (nerves 0), the drawn ring (S.sigma path: ringVis) is sampled across the hold:
//   1 it equals 3.54's formula at every hold time (radius from the pull length tp.D, not the stage cone)
//   2 it shrinks steadily over the pull (not parked at the 70 mm cap until the last few ms)
//   3 where the dart lands still uses the stage cone (ringR differs from the drawn ring off the window at the Worlds)
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
 const f=[];for(const t of ['0','6']){const x=r[t];x.rows.forEach(w=>{if(Math.abs(w.vis-w.old)>.01)f.push(`tier ${t} hold ${w.hold}: drawn ring ${w.vis} mm, 3.54 formula ${w.old}`);});
  const v=x.rows.map(w=>w.vis);for(let i=1;i<5;i++)if(!(v[i]<v[i-1]))f.push(`tier ${t}: drawn ring does not shrink over the pull ${v.join(',')}`);if(v[2]>=69.9)f.push(`tier ${t}: drawn ring still at the cap halfway through the pull`);}
 const w6=r['6'].rows[2];if(!(w6.land>w6.vis))f.push('Worlds: landing no longer uses the stage cone');
 if(errs.length)f.push('page errors '+errs.slice(0,2).join(' | '));console.log(JSON.stringify(r));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log(`PASS: drawn ring = 3.54 formula on Pub and Worlds; Worlds ring across the hold ${r['6'].rows.map(w=>w.vis).join(' / ')} mm (was the landing cone ${r['6'].rows.map(w=>w.land).join(' / ')})`);})();
