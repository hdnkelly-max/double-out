// #20d (Director 22:10, Overseer 23:48): standing iOS costs. node tests/eng20d.js [dir] -> ENG20D PASS / FAIL.
// (1) card-foil gyro: after a card pick, tilt events write the foil properties on the open pack only (not <body>), and the sensor
//     listener is removed when the pack closes (more tilt events after closing do nothing; <body> never carries tc-gyro).
// (2) image caches: 60 different dart renders keep at most 16 cached; the newest one is still a cache hit.
// (3) per frame in a match at aim with no particles: the full-screen #fx canvas is not cleared every frame, and #nerve's style
//     isn't rewritten every frame.
// (4) kitPts is cached per kit: same object while the kit is the same, the right values after a kit change and back.
// Live 3.18 fails (1), (2), (3) and (4).
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');const fails=[];const out={};
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{/* iOS-style DeviceOrientationEvent (permission granted on the first pick tap), and a count of live sensor listeners */
  window.DeviceOrientationEvent=window.DeviceOrientationEvent||function(){};window.DeviceOrientationEvent.requestPermission=()=>Promise.resolve('granted');/* as iOS after the player allows motion */window.__GL=0;const A=EventTarget.prototype.addEventListener,R=EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener=function(t){if(this===window&&t==='deviceorientation')__GL++;return A.apply(this,arguments);};
  EventTarget.prototype.removeEventListener=function(t){if(this===window&&t==='deviceorientation')__GL--;return R.apply(this,arguments);};});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();});
// (1) gyro
out.gyro=await p.evaluate(async()=>{const tilt=(g,bt)=>{const e=new Event('deviceorientation');e.gamma=g;e.beta=bt;window.dispatchEvent(e);};
  const TCC=window.TopsCards;if(!TCC||!TCC.openPack)return {err:'no TopsCards.openPack'};
  /* the pick's server answer fails ("connection dropped"): the pick tap has already asked for the sensor, which is all this needs */
  TCC.openPack({picks:[{id:'p1',reason:'test'}],resolve:()=>Promise.reject(new Error('offline')),onDone:()=>{},onLater:()=>{}});
  await new Promise(r=>setTimeout(r,800));const pk=document.querySelector('.tcpk');if(!pk)return {err:'no pack'};
  const c=pk.querySelector('.tcpk__row .tc');if(!c)return {err:'no card to pick'};
  /* ChatGPT P2: denied first (no listener), then allowed on the next pick tap */
  const rp=DeviceOrientationEvent.requestPermission;DeviceOrientationEvent.requestPermission=()=>Promise.resolve('denied');c.click();await new Promise(r=>setTimeout(r,300));const deniedL=__GL;
  DeviceOrientationEvent.requestPermission=rp;pk.querySelector('.tcpk__row .tc').click();await new Promise(r=>setTimeout(r,300));
  tilt(10,60);tilt(-8,30);await new Promise(r=>setTimeout(r,50));
  const o={deniedL,listenersOpen:__GL,packFx:pk.style.getPropertyValue('--fx'),bodyFx:document.body.style.getPropertyValue('--fx'),bodyClass:document.body.classList.contains('tc-gyro')};
  pk.querySelector('.tcpk__later').click();/* Open later: the pack's own close */await new Promise(r=>setTimeout(r,500));o.packGone=!document.querySelector('.tcpk');
  /* ChatGPT P1: two packs (B opens while A is open): A's foil is cleared, one listener, B tilts; closing A late doesn't stop B */
  const open=async()=>{TCC.openPack({picks:[{id:'p'+Math.random(),reason:'t'}],resolve:()=>Promise.reject(new Error('offline')),onDone(){},onLater(){}});await new Promise(r=>setTimeout(r,600));const all=[...document.querySelectorAll('.tcpk')];return all[all.length-1];};
  const A=await open();A.querySelector('.tcpk__row .tc').click();await new Promise(r=>setTimeout(r,200));tilt(5,50);
  const B=await open();B.querySelector('.tcpk__row .tc').click();await new Promise(r=>setTimeout(r,200));tilt(-5,40);
  o.two={listeners:__GL,aFx:A.style.getPropertyValue('--fx'),aCls:A.classList.contains('tc-gyro'),bFx:B.style.getPropertyValue('--fx')};
  A.querySelector('.tcpk__later').click();await new Promise(r=>setTimeout(r,400));tilt(7,55);o.two.afterA={listeners:__GL,bFx:B.style.getPropertyValue('--fx')};
  B.querySelector('.tcpk__later').click();await new Promise(r=>setTimeout(r,400));o.two.afterB=__GL;
  tilt(20,80);await new Promise(r=>setTimeout(r,50));o.listenersAfter=__GL;o.bodyFxAfter=document.body.style.getPropertyValue('--fx');o.bodyClassAfter=document.body.classList.contains('tc-gyro');o.gyroStat=window.TOPS_GYRO?TOPS_GYRO():null;return o;});
// (2) dart image cache
out.dart=await p.evaluate(()=>{const base=Object.assign({},setupParts(),{barrel:barrel()});const cols=[];for(let i=0;i<60;i++)cols.push('#'+(0x100000+i*997).toString(16).slice(-6));const t0=performance.now();cols.forEach(c=>V.dartShot(c,Object.assign({},base,{custom:true})));const t1=performance.now();
  V.dartShot(cols[59],Object.assign({},base,{custom:true}));const hit=performance.now()-t1;return {n:window.TOPS_IMGC?TOPS_IMGC().d:null,per:(t1-t0)/60,hit,imgc:window.TOPS_IMGC?TOPS_IMGC():null};});
// (3) per frame at aim
await p.evaluate(()=>{V._qa.renderer.render=function(){};beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});});
for(let i=0;i<400;i++){const st=await p.evaluate(()=>{try{if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim')break;await p.waitForTimeout(150);}
out.frame=await p.evaluate(async()=>{const fx=document.getElementById('fx').getContext('2d');let clears=0;const cr=fx.clearRect;fx.clearRect=function(){clears++;return cr.apply(this,arguments);};
  let muts=0;const mo=new MutationObserver(l=>muts+=l.length);const ne=document.getElementById('nerve');if(ne)mo.observe(ne,{attributes:true,attributeFilter:['style']});
  let frames=0;const vf=V.frame;V.frame=function(){frames++;return vf.apply(this,arguments);};await new Promise(r=>setTimeout(r,3000));V.frame=vf;await new Promise(r=>setTimeout(r,0));mo.disconnect();fx.clearRect=cr;
  /* ChatGPT P2: the last particle leaves no ghost: draw one, let it fall off, then the canvas is empty */
  fxP.push({x:60,y:innerHeight-40,vx:0,vy:0,r:0,vr:0,w:40,c:'#fff',lim:null});await new Promise(r=>setTimeout(r,400));const drawn=fx.getImageData(40,innerHeight-44,40,8).data.some(v=>v>0);
  fxP.forEach(q=>{q.y=innerHeight+50;});await new Promise(r=>setTimeout(r,600));const ghost=fx.getImageData(0,0,fx.canvas.width,fx.canvas.height).data.some(v=>v>0);
  return {frames,clears,nerveWrites:muts,drawn,ghost};});
// (4) kitPts
out.kit=await p.evaluate(()=>{const K=window.TOPS_kitPts;const a=K(),a2=K();const sb=save.barrel,ss=save.setup;const ids=(window.BARRELS||[]).map(x=>x.id);
  const other=ids.find(id=>id!==sb);save.barrel=other;const b1=K();save.barrel=sb;const a3=K();const sameObj=a===a2;const back=JSON.stringify(a)===JSON.stringify(a3);
  save.setup=Object.assign({},ss,{flight:ss&&ss.flight==='slim'?'kite':'slim'});const f1=K();save.setup=ss;const f0=K();return {sameObj,back,barrelChanges:JSON.stringify(b1)!==JSON.stringify(a)||ids.length<2,flightChanges:JSON.stringify(f1)!==JSON.stringify(f0),a,b1,f1};});
out.pe=pe;console.log(JSON.stringify(out));
const chk=(n,c)=>{if(!c)fails.push(n);};const g=out.gyro||{};
chk('gyro: pack opened and a card picked',!g.err);
chk('gyro: denied -> no listener; next tap allowed -> listener',g.deniedL===0&&g.listenersOpen===1);
chk('gyro: tilt writes the foil on the open pack',!!g.packFx);
chk('gyro: <body> never gets the foil properties',!g.bodyFx&&!g.bodyFxAfter);
chk('gyro: <body> never gets tc-gyro',!g.bodyClass&&!g.bodyClassAfter);
chk('gyro: sensor listener removed when the pack closes',g.listenersAfter===0);
chk('gyro: second pack takes over (one listener, first pack cleared, second tilts)',g.two&&g.two.listeners===1&&!g.two.aFx&&!g.two.aCls&&!!g.two.bFx);
chk('gyro: closing the first pack later leaves the second tilting',g.two&&g.two.afterA.listeners===1&&g.two.afterA.bFx!==g.two.bFx);
chk('gyro: closing the second pack removes the listener',g.two&&g.two.afterB===0);
chk('dart cache capped (<=16 of 60)',out.dart.n!=null&&out.dart.n<=16);
chk('dart cache: newest still a hit (<2 ms)',out.dart.hit<2);
chk('frame: #fx not cleared every frame with no particles',out.frame.frames>5&&out.frame.clears<=1);
chk('fx: a particle draws, and the canvas is empty after the last one',out.frame.drawn&&!out.frame.ghost);
chk('frame: #nerve style not rewritten every frame',out.frame.nerveWrites<=2);/* Chromium records no mutation for a same-value style write, so this can't fail on live here; it guards against a regression */
chk('kitPts: same kit -> same cached result',out.kit.sameObj);
chk('kitPts: kit change -> new values, and back',out.kit.back&&out.kit.barrelChanges&&out.kit.flightChanges);
chk('no page errors',!pe.length);
await b.close();console.log(fails.length?'ENG20D FAIL\n- '+fails.join('\n- '):'ENG20D PASS');process.exit(fails.length?1:0);})();
