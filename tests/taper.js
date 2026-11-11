// Taper (Overseer 01:40): Control/Scoring/Finishing points earned from this version on count 0.7 of a live point; points already in a save keep
// exactly today's effect. Hard limits: no save's sway or scatter is larger after the update than before; sway is never wider than a starter's.
// usage: node tests/taper.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;
  const tpWith=(v,tb,k)=>{save.st2.v=Object.assign({},save.st2.v,v);if(tb===undefined)delete save.st2.tb;else save.st2.tb=tb;save.barrel='assassin';save.setup={point:'std',shaft:'med',flight:'standard'};
   const old=window.TOPS_CAL_W;if(k!=null)window.TOPS_CAL_W=Object.assign({},old,{k});beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:50,legs:1});S.aim=targetPoint('T20');
   const en=effNerves;effNerves=()=>0;let tp;try{tp=throwParams();}finally{effNerves=en;window.TOPS_CAL_W=old;}const o={A:+tp.A.toFixed(4),s0:+tp.s0.toFixed(4),tb:save.st2.tb&&Object.assign({},save.st2.tb)};try{S.done=true;}catch(e){}return o;};
  const mid={sc:50,fi:50,ct:50,rh:50,co:50},top={sc:85,fi:85,ct:85,rh:85,co:85},low={sc:20,fi:20,ct:20,rh:20,co:20};
  return {
   live:tpWith(mid,{sc:50,fi:50,ct:50},1),           // today's effect at 50
   oldSave:tpWith(mid,undefined),                      // a save from before the update: snapshot taken now
   newPts:tpWith(mid,{sc:20,fi:20,ct:20}),             // the same 50 earned after the update
   starter:tpWith(low,{sc:20,fi:20,ct:20}),
   topNew:tpWith(top,{sc:20,fi:20,ct:20}),
   respec:tpWith({sc:40,fi:40,ct:40,rh:50,co:50},{sc:50,fi:50,ct:50}),   // points moved below the snapshot
   respecLive:tpWith({sc:40,fi:40,ct:40,rh:50,co:50},{sc:40,fi:40,ct:40},1),
   // property: 60 random existing saves load with no snapshot and play exactly as today (k=1 is today's effect)
   prop:(()=>{const bad=[];for(let i=0;i<60;i++){const R=()=>20+Math.floor(Math.random()*66);const v={sc:R(),fi:R(),ct:R(),rh:R(),co:R()};
     const a=tpWith(v,undefined),b2=tpWith(v,{sc:v.sc,fi:v.fi,ct:v.ct},1);if(a.A!==b2.A||a.s0!==b2.s0)bad.push(JSON.stringify(v));
     const again=tpWith(Object.assign({},v,{ct:Math.min(85,v.ct+5)}),a.tb);if(again.tb.ct!==a.tb.ct)bad.push('snapshot moved');}return bad;})()};});
 const f=[];
 if(r.oldSave.A!==r.live.A||r.oldSave.s0!==r.live.s0)f.push('a save from before the update plays differently: '+JSON.stringify([r.oldSave,r.live]));
 if(!r.oldSave.tb||r.oldSave.tb.ct!==50)f.push('no snapshot taken for an old save');
 if(!(r.newPts.A>r.live.A&&r.newPts.A<r.starter.A))f.push('new points not tapered between starter and live sway: '+[r.starter.A,r.newPts.A,r.live.A].join(' / '));
 if(!(r.newPts.s0>=r.live.s0&&r.newPts.s0<=r.starter.s0))f.push('new points not tapered between starter and live scatter: '+[r.starter.s0,r.newPts.s0,r.live.s0].join(' / '));
 if(r.topNew.A>r.starter.A||r.topNew.s0>r.starter.s0)f.push('maxed player has wider sway or scatter than a starter');
 if(r.respec.A!==r.respecLive.A)f.push('points moved below the snapshot lose their live effect: '+[r.respec.A,r.respecLive.A].join(' / '));
 if(r.prop.length)f.push('existing saves that play differently after the update: '+r.prop.slice(0,3).join(' | '));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: old saves keep today\'s sway and scatter; new points tapered (sway '+r.starter.A+' > '+r.newPts.A+' > '+r.live.A+'); never wider than a starter');})();
