// Release timing is the same at any frame rate (QA, calibration review; ChatGPT P0): the hold starts and ends at the input events' own
// timestamps, so a press and release at the same real moments give the same timing error whether the page runs at 30, 60 or 120 fps
// (events reach the page up to one frame late). Fails if either end of the hold uses the time the handler ran.
// usage: node tests/fps-timing.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};save.inputOffsetMs=0;newCareer();const c=career();c.stage=null;c.tier=1;
  const real=performance.now.bind(performance);const out={};
  for(const hold of [180,260,340])for(const fps of [30,60,120]){
   beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:50,legs:1});S.busy=false;S.cur=0;S.breathe=false;S.view=0;S.noPullUntil=0;
   const fr=1000/fps;let clock=real()+50;const base=Math.ceil(clock/fr)*fr+0.37; // press happens mid-frame
   const T0=base,T1=base+hold,late=t=>Math.ceil(t/fr)*fr+0.5; // handlers run at the next frame
   performance.now=()=>clock;
   try{clock=late(T0);startPull('pad',{timeStamp:T0});clock=late(T1);release({timeStamp:T1},'pad');}finally{performance.now=real;}
   (out[hold]=out[hold]||[]).push(+S.relMs.toFixed(3));try{S.done=true;}catch(e){}}
  return out;});
 const f=[];Object.entries(r).forEach(([h,v])=>{if(Math.max(...v)-Math.min(...v)>0.01)f.push(`hold ${h} ms: timing error ${v.join(' / ')} ms at 30 / 60 / 120 fps`);});
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: same release timing at 30, 60 and 120 fps '+JSON.stringify(r));})();
