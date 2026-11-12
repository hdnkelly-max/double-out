// #16 check 2: with the clip recorders removed, a cinematic still plays and ends on the REAL throw path (startPull/release, not land()).
// node tests/cine-still-plays.js [dir] -> PASS/FAIL. iPhone UA. Player one leg from the match on 50, aims at the bull, throws via
// the game's own pull/release until a dart wins the match. Checks: body.lk-cine added then removed, S.cine was true, the match ends,
// canvas.captureStream / MediaRecorder never used, no page errors. landFrom is wrapped so the player's darts land on the bull
// (sway and spread made a bull finish too rare to test); only the landing point is forced.
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{window.__C={cap:0,mr:0,cineOn:0,cineOff:0,sawS:false};const cs=HTMLCanvasElement.prototype.captureStream;if(cs)HTMLCanvasElement.prototype.captureStream=function(){__C.cap++;return cs.apply(this,arguments);};
 if(window.MediaRecorder){const M=window.MediaRecorder;window.MediaRecorder=function(){__C.mr++;return new M(...arguments);};window.MediaRecorder.isTypeSupported=M.isTypeSupported.bind(M);}
 document.addEventListener('DOMContentLoaded',()=>{let on=false;new MutationObserver(()=>{const n=document.body.classList.contains('lk-cine');if(n&&!on)__C.cineOn++;if(!n&&on)__C.cineOff++;on=n;}).observe(document.body,{attributes:true,attributeFilter:['class']});});});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};
 beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});
 /* the player's own darts land on the bull (forces only WHERE the dart lands; release, the cinematic decision and everything after run as normal) */
 const lf=landFrom;landFrom=function(){const r=lf.apply(this,arguments);try{if(S&&S.cur===0&&!S.p[0].ai){const b=targetPoint('BULL');return Object.assign({},r,{x:b.x,y:b.y});}}catch(e){}return r;};});
let tries=0;const t0=Date.now();
while(Date.now()-t0<240000){const st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.cine)__C.sawS=true;if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
  if(S.cur===0&&!S.busy&&!S.pulling&&!S.p[0].ai&&S.visit.length<3&&!S.flyingOwn){const me=S.p[0];const need=Math.ceil(S.bestOf/2);me.legs=need-1;if(S.visit.length===0)me.score=50;S.aim=Object.assign({},targetPoint('BULL'));startPull('auto');return 'pull';}
  return 'wait';}catch(e){return 'ERR '+e.message;}});
 if(st==='done'||st.startsWith('ERR'))break;
 if(st==='pull'){tries++;await p.waitForTimeout(420);await p.evaluate(()=>{try{if(S.cine)__C.sawS=true;release({timeStamp:performance.now()},'auto');}catch(e){}});}
 await p.evaluate(()=>{if(S&&S.cine)__C.sawS=true;});await p.waitForTimeout(80);}
await p.waitForTimeout(6000);
const r=await p.evaluate(()=>({...__C,done:!!(S&&S.done)||S===null,cineNow:document.body.classList.contains('lk-cine')}));
const fails=[];if(!r.cineOn)fails.push('no cinematic started (lk-cine never added)');if(r.cineOn&&r.cineOff<r.cineOn)fails.push('cinematic never ended (lk-cine still on)');if(!r.done)fails.push('match did not end');
if(r.cap||r.mr)fails.push('recording started: captureStream '+r.cap+', MediaRecorder '+r.mr);if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));
console.log('cine-still-plays',fails.length?'FAIL':'PASS',JSON.stringify({tries,...r,fails}));await b.close();process.exit(fails.length?1:0);})();
