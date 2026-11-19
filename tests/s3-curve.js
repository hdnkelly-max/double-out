// S3-CURVE hidden switch (Hayden 17:03/17:23: ships hidden behind ?curve=1, default off). Checks in a real career match at stats 60:
//   1 off (no ?curve): throwParams has no curve fields and its window/sway are the live ones (3.57 / 4.0x)
//   2 ?curve=1 with Season 3 turned off on the device (?s3=0): still off
//   3 ?curve=1&s3=1: window = CURVE_TUNE.win at the Rhythm level, sway = CURVE_TUNE.sway at the Control level, landK = CURVE_TUNE.land[tier];
//     the drawn ring is the 3.54 ring on the live window (tp.Pv): the player's timing cue does not change
//   4 a near-miss lands landK x wider/narrower than the drawn ring (mean scatter ratio), a perfect is unchanged
//   5 ?curve=0 turns it off and sticks
// usage: node tests/s3-curve.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const u='file://'+path.resolve(__dirname,'../index.html');
 const probe=()=>p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;newCareer();const c=career();c.tier=3;c.stage=null;c.run=null;save.st2=save.st2||{};save.st2.v={sc:60,fi:60,ct:60,rh:60,co:60};
  beginMatch({mode:'career',tier:3,p0:'P',oppName:'X',oppAvg:50,legs:1});S.aim=targetPoint('T20');const en=effNerves;effNerves=()=>0;let tp;try{tp=Object.assign({},throwParams());}finally{effNerves=en;}
  const out={on:curveOn(),P:+tp.P.toFixed(3),A:+tp.A.toFixed(3),Pv:tp.Pv==null?null:+tp.Pv.toFixed(3),landK:tp.landK==null?null:tp.landK,
   wantP:+(curveAt('win',TOPS_LofT('rh'))).toFixed(3),wantA:+curveAt('sway',TOPS_LofT('ct')).toFixed(3),wantK:CURVE_TUNE.land[3]};
  if(out.on){const dt=tp.P+40;const vis=ringR(dt,Object.assign({},tp,{P:tp.Pv}));const ref=ringR(dt,tp);out.vis=+vis.toFixed(2);
   const lock={x:S.aim.x,y:S.aim.y};let s=0,s0=0;const N=6000;for(let i=0;i<N;i++){const l=landFrom(lock,tp,dt);s+=Math.hypot(l.x-lock.x,l.y-lock.y);const l0=landFrom(lock,Object.assign({},tp,{landK:1}),dt);s0+=Math.hypot(l0.x-lock.x,l0.y-lock.y);}out.ratio=+(s/s0).toFixed(3);
   let pf=0,pf0=0;for(let i=0;i<N;i++){const l=landFrom(lock,tp,0);pf+=Math.hypot(l.x-lock.x,l.y-lock.y);const l0=landFrom(lock,Object.assign({},tp,{landK:1}),0);pf0+=Math.hypot(l0.x-lock.x,l0.y-lock.y);}out.pfRatio=+(pf/pf0).toFixed(3);}
  S.done=true;return out;});
 const f=[];
 await p.goto(u);await p.evaluate(()=>localStorage.clear());await p.goto(u);await p.waitForTimeout(4500);const off=await probe();
 if(off.on||off.Pv!=null||off.landK!=null)f.push('off: curve fields present '+JSON.stringify(off));
 await p.goto(u+'?curve=1&s3=0');await p.waitForTimeout(4500);const noS3=await probe();if(noS3.on)f.push('?curve=1 without Season 3 is on');
 await p.goto(u+'?curve=1&s3=1');await p.waitForTimeout(4500);const on=await probe();
 if(!on.on)f.push('?curve=1&s3=1 is not on');else{
  // the window in tp.P carries the game's tolerance/nerve factors: compare through the live/curve ratio instead of absolute ms
  if(Math.abs(on.P-on.wantP)>.01||Math.abs(on.A-on.wantA)>.01)f.push('window/sway '+JSON.stringify(on));
  if(on.landK!==on.wantK)f.push(`landK ${on.landK}, want ${on.wantK}`);
  if(Math.abs(on.ratio-on.wantK)>.06)f.push(`near-miss scatter x${on.ratio}, want x${on.wantK}`);
  if(Math.abs(on.pfRatio-1)>.05)f.push(`a perfect changed with landK (x${on.pfRatio})`);
  if(Math.abs(on.Pv-off.P)>.01)f.push(`drawn ring window ${on.Pv} is not the live window ${off.P}`);}
 await p.goto(u+'?curve=0');await p.waitForTimeout(3000);await p.goto(u+'?s3=1');await p.waitForTimeout(4500);const back=await probe();if(back.on)f.push('?curve=0 did not turn it off');
 if(errs.length)f.push('page errors '+errs.slice(0,2).join(' | '));console.log(JSON.stringify({off,noS3,on,back}));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log(`PASS: off by default and without Season 3; ?curve=1&s3=1 sets window ${on.P} ms (live ${on.Pv}), sway ${on.A} mm, near-miss landing x${on.ratio} (DPNZ ${on.wantK}) with the drawn ring on the live window and perfects unchanged; ?curve=0 off`);})();
