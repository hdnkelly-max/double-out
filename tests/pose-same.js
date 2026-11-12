// #20e: the scratch-object rewrite of dartPhase/poseDarts/setW must pose every bone exactly as before.
// node tests/pose-same.js <dirA> <dirB>  -> POSE-SAME PASS when every bone quaternion, the dart in hand's position/rotation and the
// visibility agree to 1e-9 over 40 throw states x 3 board targets, opponent figure and first-person (fpv) posing. Also prints bytes
// allocated per poseFigure call in each build (sampling heap profiler).
const {chromium,devices}=require('playwright');
const run=async(b,dir)=>{const ctx=await b.newContext({viewport:{width:390,height:844},userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.goto('file://'+dir+'/index.html');
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
 await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();
  beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});});
 await p.waitForFunction(()=>{try{const o=V._qa.opp();return o&&o.userData&&o.userData.rigged&&o.userData.ck&&o.userData.ck!=='remy';}catch(e){return false;}},null,{timeout:60000});
 const cdp=await ctx.newCDPSession(p);
 const res=await p.evaluate(()=>{const T=THREE,o=V._qa.opp();const pn=performance.now.bind(performance);performance.now=()=>12345.678;/* the idle lean uses the clock */
  const states=[];[0,.2,.5,.8,1].forEach(v=>states.push({phase:'pull',pull:v}));[0,.3,.6,1].forEach(k=>states.push({phase:'throw',k}));[0,.5,1].forEach(k=>{states.push({phase:'fly',k});states.push({phase:'follow',k});});[0,.2,.4,.7,1].forEach(k=>states.push({phase:'reset',k}));states.push({phase:'idle'});states.push({});
  while(states.length<40)states.push({phase:['pull','throw','reset'][states.length%3],pull:(states.length*.037)%1,k:(states.length*.053)%1});
  const tg=[[0,1.73,.045],[.12,1.6,.05],[-.2,1.85,.03]];const out=[];
  const snap=fig=>{const B=fig.userData.B;const r=[];Object.keys(B).sort().forEach(n=>{const q=B[n].quaternion;r.push(n,q.x,q.y,q.z,q.w);});const dt=fig.userData.dt;if(dt){r.push('dt',dt.position.x,dt.position.y,dt.position.z,dt.quaternion.x,dt.quaternion.y,dt.quaternion.z,dt.quaternion.w,dt.visible);}return r;};
  for(const fpv of [false,true])for(const t of tg)for(const s of states){(V._qa.poseFigure||V.poseFigure)(o,Object.assign({},s),new T.Vector3(t[0],t[1],t[2]),fpv);out.push(snap(o));}
  performance.now=pn;return out;});
 // allocation per call
 await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.startSampling',{samplingInterval:64,includeObjectsCollectedByMajorGC:true,includeObjectsCollectedByMinorGC:true});
 await p.evaluate(()=>{const T=THREE,o=V._qa.opp();const tgt=new T.Vector3(0,1.73,.045);const st={phase:'pull',pull:.5};for(let i=0;i<2000;i++)(V._qa.poseFigure||V.poseFigure)(o,st,tgt);});
 const {profile}=await cdp.send('HeapProfiler.stopSampling');let tot=0;const walk=n=>{if(/pose|setW|dartPhase|restAxis|boneW/i.test(n.callFrame.functionName||''))tot+=n.selfSize;(n.children||[]).forEach(walk);};walk(profile.head);
 await ctx.close();return {res,pe,bytesPerCall:Math.round(tot/2000)};};
(async()=>{const [A,B]=[process.argv[2],process.argv[3]];const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
 const ra=await run(b,A),rb=await run(b,B);await b.close();
 let worst=0,where=null,mism=0;for(let i=0;i<ra.res.length;i++){const x=ra.res[i],y=rb.res[i];if(!y||x.length!==y.length){mism++;continue;}for(let j=0;j<x.length;j++){if(typeof x[j]==='number'){const d=Math.abs(x[j]-y[j]);if(d>worst){worst=d;where=[i,x[j-1]];}}else if(x[j]!==y[j])mism++;}}
 console.log(JSON.stringify({poses:ra.res.length,values:ra.res[0]&&ra.res[0].length,worst,where,mism,bytesPerCall:{A:ra.bytesPerCall,B:rb.bytesPerCall},pe:[ra.pe,rb.pe]}));
 const ok=ra.res.length===240&&!mism&&worst<1e-9&&!ra.pe.length&&!rb.pe.length;console.log(ok?'POSE-SAME PASS':'POSE-SAME FAIL');process.exit(ok?0:1);})();
