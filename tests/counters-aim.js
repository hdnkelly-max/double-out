// ENG-9 (Q&D 21:19): the recorder's once-per-match counters() pass (a getComputedStyle walk of the page, 5-11 ms on a phone) must never run
// while the player can start a pull, and must still run once per match.
// node tests/counters-aim.js <dir>   (390x844 iPhone profile, CPU x4, render stubbed so frame times are our JS)
//  1. bull-up done, the player then aims (never pulls) for 16 s of visible play: counters() becomes due at 10 s.
//  2. the player throws 3 darts, the opponent takes its turn, the player aims again for 4 s.
// Each counters() call is caught by its document.getAnimations() call and records the game state at that moment (startPull's own refusals) and
// its cost (from its canvas query to getAnimations). Every frame from the first aim is timed; the frame holding the call is reported against the
// median aim frame (this box's frames are ~80 ms at CPU x4 with SwiftShader, so a fixed 16 ms bar can't be used here; the phone's is ~17 ms).
// COUNTERS-AIM PASS: counters() ran exactly once, at a moment startPull refuses (opponent's turn, opponent view or the leg card), and no
// frame at aim contains it. FAIL otherwise (live 3.26: it runs during the aim).
const {chromium,devices}=require('playwright');const path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]||path.join(__dirname,'..'));const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
 const ctx=await b.newContext({viewport:{width:390,height:844},userAgent:devices['iPhone 13'].userAgent,hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.addInitScript(()=>{window.__C={calls:[],frames:[],cs:0};const ga=Document.prototype.getAnimations;
  Document.prototype.getAnimations=function(){const t=performance.now();try{const s=(typeof S!=='undefined')?S:null;const it=document.getElementById('intro');
   /* counters() = a canvas query, then a getComputedStyle walk of the page (hundreds of calls), then getAnimations */const isC=!!(__C.cs&&(__C.g||0)>50);__C.calls.push({t,cost:isC?+(t-__C.cs).toFixed(2):null,cur:s?s.cur:null,ai:!!(s&&s.p&&s.p[s.cur]&&s.p[s.cur].ai),view:s?s.view:null,busy:s?!!s.busy:null,pulling:s?!!s.pulling:null,done:s?!!s.done:null,card:!!(it&&it.classList.contains('show')),
    /* startPull's own refusals */canPull:!!(s&&!s.done&&!s.busy&&!s.pulling&&!(s.p&&s.p[s.cur]&&s.p[s.cur].ai)&&s.view!==1&&!s.breathe&&!(typeof V!=='undefined'&&V.walking&&V.walking())&&!(s.noPullUntil&&performance.now()<s.noPullUntil))});}catch(e){}__C.cs=0;__C.g=0;return ga.apply(this,arguments);};
  const qa=Document.prototype.querySelectorAll;Document.prototype.querySelectorAll=function(q){if(q==='canvas'){__C.cs=performance.now();__C.g=0;}return qa.apply(this,arguments);};
  const gcs=window.getComputedStyle;window.getComputedStyle=function(){__C.g=(__C.g||0)+1;return gcs.apply(this,arguments);};});
 await p.goto('file://'+dir+'/index.html');
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
 await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();
  beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});
  __C.F=[];let last=performance.now();const f=now=>{const s=S;__C.F.push([+last.toFixed(1),+(now-last).toFixed(1),!!(s&&!s.done&&s.cur===0&&!s.busy&&!s.pulling&&!s.p[0].ai&&s.view!==1)]);last=now;if(!__C.stop)requestAnimationFrame(f);};requestAnimationFrame(f);});
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 // through the intro and the bull-up to the player's own turn
 let st='';for(let i=0;i<900;i++){st=await p.evaluate(()=>{try{const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai&&S.view!==1)return 'aim';if(S.cur!==0&&!S.busy)return 'opp';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim')break;await p.waitForTimeout(200);}
 

 await p.waitForTimeout(16000);
 // the player's 3 darts, then the opponent's turn, then aim again
 for(let d=0;d<3;d++){await p.evaluate(()=>{if(S.cur===0&&!S.busy&&!S.done){S.busy=true;land(gauss()*20,-103+gauss()*10);}});await p.waitForTimeout(1500);}
 for(let i=0;i<300;i++){const s=await p.evaluate(()=>S&&S.cur===0&&!S.busy&&S.view!==1&&!S.done);if(s)break;await p.waitForTimeout(200);}
 await p.waitForTimeout(4000);await p.evaluate(()=>{__C.stop=1;});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 const C=await p.evaluate(()=>__C.calls);const F=await p.evaluate(()=>__C.F);const all=C;const calls=all.filter(c=>c.cost!=null);/* counters() queries canvases first; other getAnimations callers (v14's health snapshot) are reported apart */const other=all.filter(c=>c.cost==null);
 const frames=F.filter(f=>f[2]);const hit=frames.filter(f=>calls.some(c=>c.t>f[0]&&c.t<=f[0]+f[1]));
 const med=a=>{const x=a.map(f=>f[1]).sort((p,q)=>p-q);return x.length?x[x.length>>1]:null;};const medAim=med(frames);
 const host=calls.map(c=>{const f=F.find(f=>c.t>f[0]&&c.t<=f[0]+f[1]);return f?{frameMs:f[1],aim:f[2],addedOverMedianAim:+(f[1]-medAim).toFixed(1)}:null;});
 const ok=calls.length===1&&calls.every(c=>!c.canPull)&&!hit.length&&!pe.length;
 console.log(JSON.stringify({counters:calls,frameHoldingIt:host,medianAimFrameMs:medAim,otherGetAnimations:other.map(c=>({canPull:c.canPull,ai:c.ai,view:c.view})),aimFrames:frames.length,aimFramesContainingCounters:hit,pe}));
 console.log(ok?'COUNTERS-AIM PASS':'COUNTERS-AIM FAIL');await b.close();process.exit(ok?0:1);})();
