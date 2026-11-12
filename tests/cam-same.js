// #20e: frame() reuses its camera/eye vectors; the camera must come out exactly as before.
// node tests/cam-same.js <dirA> <dirB> -> CAM-SAME PASS when camera position, quaternion and fov agree after every one of 600 frames
// (frozen clock, scripted states: aim, pull, throw, opponent's turn (view 1), first-person figure, a punch-in), in split view (phone) and
// single view (desktop). Rendering is stubbed; both builds run the same sequence from a fresh page.
const {chromium,devices}=require('playwright');
const run=async(b,dir,vp)=>{const ctx=await b.newContext(vp.phone?{viewport:{width:390,height:844},userAgent:devices['iPhone 13'].userAgent,hasTouch:true,isMobile:true,deviceScaleFactor:1}:{viewport:{width:1366,height:768}});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.goto('file://'+dir+'/index.html');
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
 await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();
  beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});});
 await p.waitForTimeout(1500);
 const res=await p.evaluate(()=>{const cam=V._qa.camera;const out=[];const pn=performance.now;performance.now=()=>12345.678;/* the figure's idle lean reads the clock */
  const st={view:0,nerves:.4,p:[{ai:false},{ai:true}],cur:0,done:false,pulling:false,busy:false,aim:{x:0,y:-103},sway:{x:0,y:0},sigma:3,oppArm:{pull:0,phase:'idle'},visit:[]};
  let now=500000,rec=false;const step=(mut)=>{mut&&mut(st);now+=16.667;V.frame(now,st);const c=cam;if(rec)out.push([c.position.x,c.position.y,c.position.z,c.quaternion.x,c.quaternion.y,c.quaternion.z,c.quaternion.w,c.fov]);};
  /* the sequence runs twice and only the second pass is compared, so whatever the page's own loop left in camK etc. has decayed away */
  for(const pass of [0,1]){rec=pass===1;Object.assign(st,{view:0,cur:0,nerves:.4,busy:false,pulling:false,anim:null,flyingOwn:false});
  for(let i=0;i<100;i++)step();                                   // aim, settling
  for(let i=0;i<60;i++)step(s=>{s.pulling=true;s.pull=i/60;});     // pull
  for(let i=0;i<40;i++)step(s=>{s.pulling=false;s.anim={kind:'throw',t0:now-i*16.667,dur:200};}); // throw
  for(let i=0;i<60;i++)step(s=>{s.anim=null;s.flyingOwn=i<20;});   // follow-through and reset
  for(let i=0;i<120;i++)step(s=>{s.view=1;s.cur=1;});              // opponent's turn: camera swings over
  for(let i=0;i<120;i++)step(s=>{s.view=0;s.cur=0;s.nerves=1;});   // back, high nerves
  for(let i=0;i<100;i++)step(s=>{s.busy=i<50;});
  }
  performance.now=pn;return {out,hasCam:!!cam};});
 await ctx.close();return {res,pe};};
(async()=>{const [A,B]=[process.argv[2],process.argv[3]];const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});let ok=true;
 for(const vp of [{phone:true},{phone:false}]){const ra=await run(b,A,vp),rb=await run(b,B,vp);let worst=0,at=-1;
  for(let i=0;i<ra.res.out.length;i++)for(let j=0;j<8;j++){const d=Math.abs(ra.res.out[i][j]-rb.res.out[i][j]);if(!(d<=worst)){worst=d;at=i;}}
  const moved=ra.res.out.some((r,i)=>i&&Math.abs(r[2]-ra.res.out[0][2])>1e-3);
  const pass=ra.res.hasCam&&ra.res.out.length===600&&rb.res.out.length===600&&worst<1e-9&&moved&&!ra.pe.length&&!rb.pe.length;ok=ok&&pass;
  console.log(JSON.stringify({view:vp.phone?'phone 390 (split)':'desktop 1366',frames:ra.res.out.length,worst,at,cameraMoved:moved,pe:[ra.pe,rb.pe],pass}));}
 await b.close();console.log(ok?'CAM-SAME PASS':'CAM-SAME FAIL');process.exit(ok?0:1);})();
