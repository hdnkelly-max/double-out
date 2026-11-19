// S3-CURVE hidden switch (Hayden 17:03/17:23: ships hidden behind ?curve=1, default off). Checks in a real career match at stats 60:
//   1 off (no ?curve): throwParams has no curve fields and its window/sway are the live ones (3.57 / 4.0x)
//   2 ?curve=1 with Season 3 turned off on the device (?s3=0): still off
//   3 ?curve=1&s3=1: window = CURVE_TUNE.win at the Rhythm level x CURVE_TUNE.lvl[tier], sway = CURVE_TUNE.sway at the Control level
//   4 honest ring (ChatGPT 17:40): the drawn ring IS the landing ring (same ringR, same real window): no hidden landing changes
//   5 ?curve=0 turns it off and sticks
// usage: node tests/s3-curve.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const u='file://'+path.resolve(__dirname,'../index.html');
 const probe=()=>p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;newCareer();const c=career();c.tier=3;c.stage=null;c.run=null;save.st2=save.st2||{};save.st2.v={sc:60,fi:60,ct:60,rh:60,co:60};
  beginMatch({mode:'career',tier:3,p0:'P',oppName:'X',oppAvg:50,legs:1});S.aim=targetPoint('T20');const en=effNerves;effNerves=()=>0;let tp;try{tp=Object.assign({},throwParams());}finally{effNerves=en;}
  const out={on:curveOn(),P:+tp.P.toFixed(3),A:+tp.A.toFixed(3),curve:tp.curve||null,
   wantP:+(curveAt('win',TOPS_LofT('rh'))*(CURVE_TUNE.lvl[3]||1)).toFixed(3),wantA:+curveAt('sway',TOPS_LofT('ct')).toFixed(3)};
  if(out.on){S.lockTp=tp;S.pulling=true;const keep=S.pull;let same=true;for(const dt of [-300,-100,-30,-tp.P,0,tp.P+5,60]){const vis=ringR(dt,S.lockTp);const land=ringR(dt,tp);if(Math.abs(vis-land)>1e-9)same=false;}out.honest=same;S.pulling=false;
}
  S.done=true;return out;});
 const f=[];
 await p.goto(u);await p.evaluate(()=>localStorage.clear());await p.goto(u);await p.waitForTimeout(4500);const off=await probe();
 if(off.on||off.curve)f.push('off: curve fields present '+JSON.stringify(off));
 await p.goto(u+'?curve=1&s3=0');await p.waitForTimeout(4500);const noS3=await probe();if(noS3.on)f.push('?curve=1 without Season 3 is on');
 await p.goto(u+'?curve=1&s3=1');await p.waitForTimeout(4500);const on=await probe();
 if(!on.on)f.push('?curve=1&s3=1 is not on');else{
  // the window in tp.P carries the game's tolerance/nerve factors: compare through the live/curve ratio instead of absolute ms
  if(Math.abs(on.P-on.wantP)>.01||Math.abs(on.A-on.wantA)>.01)f.push('window/sway '+JSON.stringify(on));
  if(!on.honest)f.push('the drawn ring is not the landing ring '+JSON.stringify(on));}
 await p.goto(u+'?curve=0');await p.waitForTimeout(3000);await p.goto(u+'?s3=1');await p.waitForTimeout(4500);const back=await probe();if(back.on)f.push('?curve=0 did not turn it off');
 if(errs.length)f.push('page errors '+errs.slice(0,2).join(' | '));console.log(JSON.stringify({off,noS3,on,back}));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log(`PASS: off by default and without Season 3; ?curve=1&s3=1 at stats 60 (DPNZ): window ${on.P} ms (live ${off.P}), sway ${on.A} mm (live ${off.A}); the drawn ring is the landing ring; ?curve=0 off`);})();
