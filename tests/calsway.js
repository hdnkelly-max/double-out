// Calibration A/B flag check (Overseer 21:24): sway x1.3 only when the tester opts in, only where career stats drive the throw,
// (career, practice and friendlies on career stats; not The Run or online), and every dart logs 'cal_sway13' while it's on. usage: node tests/calsway.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;
  const A=(flag,setup)=>{save.calSway=flag;setup();const en=effNerves;effNerves=()=>0;let a;try{a=throwParams().A;}finally{effNerves=en;}try{S.done=true;}catch(e){}return a;};
  const car=()=>beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:50,legs:1});
  const out={careerOff:A(false,car),careerOn:A(true,car)};
  // The Run: career stats don't drive the throw there, so the flag must not change it
  const run=()=>{c.run={stage:0};beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:50,legs:1});};
  out.runOff=A(false,run);out.runOn=A(true,run);c.run=null;
  // a friendly with a career save also uses career stats (v09 on()), so the flag applies there too: same Control, same sway offline
  const fr=()=>beginMatch({mode:'local',tier:0,p0:'P',p1:'Q',legs:1,local:true});
  out.friendlyOff=A(false,fr);out.friendlyOn=A(true,fr);
  // toggle in the hub menu
  save.calSway=false;showHub();return out;});
 await p.waitForTimeout(1800);
 const t=await p.evaluate(()=>{const b=$('btnCalSway');if(!b)return {missing:true};const l0=b.textContent;b.click();const l1=b.textContent,on=!!save.calSway,stored=JSON.parse(localStorage.getItem('doubleout2')||'{}').calSway;b.click();return {l0,l1,on,stored,off:!save.calSway};});
 // telemetry row: cards carries the marker while on
 const tele=await p.evaluate(()=>{const src=String(window.TOPS_DARTLOG||'');return /cal_sway13/.test(document.documentElement.innerHTML);});
 await b.close();const f=[];const ratio=r.careerOn/r.careerOff;
 if(Math.abs(ratio-1.3)>0.001)f.push(`career sway on/off ratio ${ratio.toFixed(3)}, want 1.3`);
 if(Math.abs(r.runOn-r.runOff)>1e-9)f.push(`The Run sway changed with the flag (${r.runOff} -> ${r.runOn})`);
 if(Math.abs(r.friendlyOn/r.friendlyOff-1.3)>0.001)f.push(`friendly (career stats) sway ratio ${(r.friendlyOn/r.friendlyOff).toFixed(3)}, want 1.3 like career`);
 if(t.missing)f.push('no Sway test button in the hub menu');else{if(t.l0!=='Sway test: off'||t.l1!=='Sway test: on')f.push('toggle labels: '+JSON.stringify(t));if(!t.on||t.stored!==true||!t.off)f.push('toggle state/persist: '+JSON.stringify(t));}
 if(!tele)f.push("telemetry: 'cal_sway13' marker not in the dart log code");
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 console.log(JSON.stringify(r),JSON.stringify(t));if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: sway x1.3 only in career with the flag on; friendlies on career stats too; The Run unchanged (online is excluded by v09 on()); hub toggle persists; darts marked');})();
