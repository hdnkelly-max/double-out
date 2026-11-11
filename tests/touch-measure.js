// Phone measurability of the perfect window: a release made at exactly the perfect moment, with press and release timestamps quantised
// to the touch sampling rate (60/120/240 Hz, random phase), judged by the game's own release(). Reports the share still judged perfect.
// usage: [FLOOR=1] node tests/touch-measure.js [p0 list, default 3,4,5]   FLOOR=1: with the touch-rate floor (window half-width >= half a sample)
const {chromium}=require('playwright');const path=require('path');const P0=(process.argv[2]||'3,4,5').split(',').map(Number);const FLOOR=!!process.env.FLOOR;
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(([P0,FLOOR])=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};save.inputOffsetMs=0;newCareer();const c=career();c.stage=null;c.tier=1;
  const real=performance.now.bind(performance);const out={};const base=Object.assign({},TOPS_CAL_W);
  beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:50,legs:1});
  for(const p0 of P0){TOPS_CAL_W.p0=p0;for(const hz of [60,120,240]){let ok=0,reach=0,n=120;window.TOPS_TOUCH_MS=FLOOR?1000/hz:null;
   for(let i=0;i<n;i++){S.done=false;S.dart=1;S.pulling=false;S.over=false;S.bull=null;S.busy=false;S.cur=0;S.view=0;S.breathe=false;S.noPullUntil=0;S.perfect=null;S.busy=false;S.cur=0;S.view=0;S.breathe=false;S.noPullUntil=0;const en=effNerves;effNerves=()=>0;
    let clock=real()+50;performance.now=()=>clock;try{const fr=1000/hz,ph=Math.random()*fr;const q=t=>Math.ceil((t-ph)/fr)*fr+ph;
     const t0=clock+Math.random()*50;const fire=dt=>{S.done=false;S.dart=1;S.pulling=false;S.over=false;S.busy=false;S.cur=0;S.perfect=null;clock=q(t0);startPull('pad',{timeStamp:q(t0)});const hold=SWEET*PM()*(S.pullMul||1);const t1=t0+hold+dt;clock=q(t1)+0.2;release({timeStamp:q(t1)},'pad');return !!S.perfect;};
     if(fire(0))ok++;let any=false;for(let dt=-fr;dt<=fr&&!any;dt+=0.5)any=fire(dt);if(any)reach++;(out._s=out._s||[]).length<6&&out._s.push([hz,+S.lockTp.P.toFixed(2),+S.relMs.toFixed(2)]);}finally{performance.now=real;effNerves=en;}}
   out[p0+' ms @ '+hz+' Hz']={exact:Math.round(100*ok/n),reachable:Math.round(100*reach/n)};}}
  Object.assign(TOPS_CAL_W,base);window.TOPS_TOUCH_MS=null;delete out._s;return out;},[P0,FLOOR]);
 await b.close();console.log(JSON.stringify(r));})();
