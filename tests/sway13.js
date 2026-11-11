// Calibration (held for Hayden): sway 1.3x for everyone wherever career stats drive the throw (career, practice,
// friendlies with a career save); The Run and online unchanged. No toggle anywhere. usage: node tests/sway13.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;
  const A=(k,setup)=>{window.TOPS_SWAY_K=k;setup();const en=effNerves;effNerves=()=>0;let a;try{a=throwParams().A;}finally{effNerves=en;}try{S.done=true;}catch(e){}return a;};
  const car=()=>beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:50,legs:1});
  const run=()=>{c.run={stage:0};beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:50,legs:1});};
  const o={career:A(null,car)/A(1,car),run:A(null,run)/A(1,run)};c.run=null;delete window.TOPS_SWAY_K;
  o.toggle=!!document.querySelector('#btnCalSway');return o;});
 await b.close();const f=[];
 if(Math.abs(r.career-1.3)>0.001)f.push('career sway ratio '+r.career);if(Math.abs(r.run-1)>1e-9)f.push('The Run sway changed: '+r.run);if(r.toggle)f.push('a sway toggle exists');if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: sway 1.3x for everyone on career stats; The Run unchanged; no toggle',JSON.stringify(r));})();
