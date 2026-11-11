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
 // logged darts: stub the signed-in upload, throw one dart per condition and read the rows
 const tele=await p.evaluate(async()=>{const rows=[];window.NET=window.NET||{};NET.user={id:'t'};NET.sb={from:()=>({insert:r=>{rows.push(...r);return Promise.resolve({});}})};
  const dart=(flag,blk)=>{save.calSway=flag;save.calBlk=blk;beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:50,legs:1});S.cur=0;const en=effNerves;effNerves=()=>0;const tp=throwParams();landFrom({x:0,y:-103},tp,0);landFrom({x:0,y:-103},tp,0);landFrom({x:0,y:-103},tp,0);const A=tp.A;
   // a toggle mid-match must not change this match
   save.calSway=!flag;const A2=throwParams().A;effNerves=en;try{S.done=true;}catch(e){}return {A,A2};};
  const off=dart(false,3),on=dart(true,4),none=dart(false,0);await new Promise(r=>setTimeout(r,50));
  return {rows:rows.map(r=>({cards:r.cards,sway:r.sway_mm})),off,on,none};});
 await b.close();const f=[];const ratio=r.careerOn/r.careerOff;
 if(Math.abs(ratio-1.3)>0.001)f.push(`career sway on/off ratio ${ratio.toFixed(3)}, want 1.3`);
 if(Math.abs(r.runOn-r.runOff)>1e-9)f.push(`The Run sway changed with the flag (${r.runOff} -> ${r.runOn})`);
 if(Math.abs(r.friendlyOn/r.friendlyOff-1.3)>0.001)f.push(`friendly (career stats) sway ratio ${(r.friendlyOn/r.friendlyOff).toFixed(3)}, want 1.3 like career`);
 if(t.missing)f.push('no Sway test button in the hub menu');else{if(!/^Wider aim sway: off/.test(t.l0)||!/^Wider aim sway: on/.test(t.l1))f.push('toggle labels: '+JSON.stringify(t));if(!t.on||t.stored!==true||!t.off)f.push('toggle state/persist: '+JSON.stringify(t));}
 {const R=tele.rows;const tag=i=>(R[i]&&R[i].cards||[]).join(',');
  if(R.length<9)f.push('expected 9 logged darts, got '+R.length);
  else{if(tag(0)!=='cal_base|calb3')f.push('baseline block dart tag '+tag(0));if(tag(3)!=='cal_sway13|calb4')f.push('wide block dart tag '+tag(3));if(tag(6)!=='')f.push('non-tester dart tagged '+tag(6));
   if(Math.abs(R[3].sway/R[0].sway-1.3)>0.01)f.push(`logged sway_mm ratio ${(R[3].sway/R[0].sway).toFixed(3)}, want 1.3 (logs the effective amplitude)`);}
  if(tele.off.A2!==tele.off.A||tele.on.A2!==tele.on.A)f.push('toggling mid-match changed the current match: '+JSON.stringify(tele));}
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 console.log(JSON.stringify(r),JSON.stringify(t),JSON.stringify(tele.rows.map(x=>x.cards.join(',')+':'+x.sway)));if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: sway x1.3 only in career with the flag on; friendlies on career stats too; The Run unchanged (online is excluded by v09 on()); hub toggle persists; each dart logs condition + block and the effective sway; a match keeps the setting it started with');})();
