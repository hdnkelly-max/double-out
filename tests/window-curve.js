// V4-R (Hayden 19:15): the perfect window follows the fitted table by Rhythm level, linear between points:
//   L 0 · .265 · .5 · .75 · 1  ->  10 · 12 · 16.5 · 21 · 26 ms   (was 20 + 14*L)
// Checks: 1 TOPS_WIN at the table points and between them, clamped and never narrowing as L rises;
//         2 in a real career match (nerves 0, no traits) throwParams().P at Rhythm 20/40/58/76/95 equals the table at that
//           Rhythm level times one constant factor (the window is the only thing Rhythm moves there);
//         3 sway (A) and scatter (s0) at the same stats are unchanged by Rhythm (window only).
// usage: node tests/window-curve.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{const W=window.TOPS_WIN;if(!W)return {err:'TOPS_WIN missing'};
  const pts=[[0,10],[.265,12],[.5,16.5],[.75,21],[1,26],[.1325,11],[.625,18.75],[.875,23.5],[-1,10],[2,26]].map(([L,w])=>({L,want:w,got:+W(L).toFixed(3)}));
  let mono=true,prev=-1;for(let L=0;L<=1.0001;L+=.01){const v=W(L);if(v<prev-1e-9)mono=false;prev=v;}
  save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;c.run=null;
  const at=rh=>{save.st2=save.st2||(window.TOPS_st&&TOPS_st());save.st2.v={sc:40,fi:40,ct:40,rh,co:40};save.st2.trait=null;save.barrel='assassin';save.setup={point:'std',shaft:'med',flight:'standard'};save.arm=0;
   beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:50,legs:1});S.aim=targetPoint('T20');S.adren=0;S.calm=99;const en=effNerves;effNerves=()=>0;let tp;try{tp=Object.assign({},throwParams());}finally{effNerves=en;}
   const L=window.TOPS_LofT?TOPS_LofT('rh'):Math.max(0,Math.min(1,(rh-20)/75));S.done=true;return {rh,L:+L.toFixed(4),P:+tp.P.toFixed(4),A:+tp.A.toFixed(4),s0:+tp.s0.toFixed(4),k:+(tp.P/W(L)).toFixed(4)};};
  const rows=[20,40,58,76,95].map(at);return {pts,mono,rows};});
 const f=[];if(r.err)f.push(r.err);else{
  r.pts.forEach(x=>{if(Math.abs(x.got-x.want)>.01)f.push(`TOPS_WIN(${x.L}) = ${x.got}, want ${x.want}`);});if(!r.mono)f.push('window narrows somewhere as Rhythm rises');
  const ks=r.rows.map(x=>x.k);if(Math.max(...ks)-Math.min(...ks)>.002)f.push('career window is not the table times one factor: '+JSON.stringify(r.rows));
  const A=r.rows.map(x=>x.A),S0=r.rows.map(x=>x.s0);if(Math.max(...A)-Math.min(...A)>1e-3)f.push('sway moves with Rhythm: '+A.join(','));if(Math.max(...S0)-Math.min(...S0)>1e-3)f.push('scatter moves with Rhythm: '+S0.join(','));}
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 console.log(JSON.stringify(r.rows||r));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log('PASS: window table 10/12/16.5/21/26 ms at Rhythm level 0/.265/.5/.75/1, linear between, clamped, never narrowing; career throwParams follows it at Rhythm 20-95 (factor '+r.rows[0].k+'); sway and scatter unchanged');})();
