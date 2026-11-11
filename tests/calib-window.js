// Timing-window calibration (Hayden 22:26/22:28): checks the shipped constants and the feel guarantees.
//  - a perfect release in career lands inside the 5 mm ring the player sees (scatter 2.8 mm, truncated), mostly T20
//  - the perfect window is 6 ms at Rhythm 20 and grows to 21 ms at Rhythm 95 (nerves held at 0)
//  - just outside the window the ring widens smoothly (no cliff), meeting the normal ring 6 ms out
//  - The Run and online keep their own throw (no perfSig there)
// usage: node tests/calib-window.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;
  const tpAt=(rh,run)=>{save.st2=save.st2||TOPS_st();if(save.st2)save.st2.v={sc:20,fi:20,ct:20,rh,co:20};save.barrel='assassin';save.setup={point:'std',shaft:'med',flight:'standard'};save.arm=0;
   if(run)c.run={stage:0};else c.run=null;beginMatch({mode:'career',tier:1,p0:'P',oppName:'X',oppAvg:50,legs:1});S.aim=targetPoint('T20');const en=effNerves;effNerves=()=>0;let tp;try{tp=Object.assign({},throwParams());}finally{effNerves=en;}try{S.done=true;}catch(e){}c.run=null;return tp;};
  const t20=tpAt(20),t95=tpAt(95),trun=tpAt(20,true);
  // 3,000 perfect darts locked dead centre on T20
  const tg=targetPoint('T20');let inRing=0,trebs=0,maxR=0;for(let i=0;i<3000;i++){const l=landFrom({x:tg.x,y:tg.y},t20,0);const d=Math.hypot(l.x-tg.x,l.y-tg.y);maxR=Math.max(maxR,d);if(d<=1.794*2.8+1e-6)inRing++;if(scoreAt(l.x,l.y).label==='T20')trebs++;}
  const P=t20.P,ring=dt=>ringR(dt,t20);const edge=[0,.01,1,3,5.99,6,6.01].map(e=>+ring(P+e).toFixed(2));
  return {P20:+t20.P.toFixed(2),P95:+t95.P.toFixed(2),perfSig:t20.perfSig,runPerfSig:trun.perfSig==null?null:trun.perfSig,inRing:inRing/3000,t20:trebs/3000,maxR:+maxR.toFixed(2),ringIn:+ring(0).toFixed(2),edge};});
 await b.close();const f=[];
 if(Math.abs(r.P20-6)>0.05)f.push('window at Rhythm 20 '+r.P20+' ms, want 6');
 if(Math.abs(r.P95-21)>0.1)f.push('window at Rhythm 95 '+r.P95+' ms, want 21');
 if(r.perfSig!==2.8)f.push('career perfect scatter '+r.perfSig);
 if(r.runPerfSig!=null)f.push('The Run picked up the career perfect release');
 if(r.inRing<1)f.push('perfect darts outside the ring: '+(1-r.inRing));
 if(r.t20<0.88)f.push('perfect darts on T20 only '+(r.t20*100).toFixed(1)+'%');
 if(Math.abs(r.ringIn-5.02)>0.05)f.push('ring inside the window '+r.ringIn+' mm, want 5.0');
 for(let i=1;i<r.edge.length;i++)if(r.edge[i]<r.edge[i-1]-1e-6)f.push('ring shrinks moving away from the window: '+r.edge.join(' / '));
 if(Math.abs(r.edge[1]-r.edge[0])>0.5)f.push('cliff at the window edge: '+r.edge.join(' / '));
 if(Math.abs(r.edge[6]-r.edge[5])>0.5)f.push('jump where the soft edge meets the normal ring: '+r.edge.join(' / '));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 console.log(JSON.stringify(r));if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: perfect release inside the 5 mm ring ('+(r.t20*100).toFixed(0)+'% T20), window 6 -> 21 ms, smooth edge, The Run unchanged');})();
