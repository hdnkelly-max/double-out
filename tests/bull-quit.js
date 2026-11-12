// ENG-8 (QA-B2): the bull-up timers belong to their match. node tests/bull-quit.js [dir] -> BULL-QUIT PASS / FAIL.
// A: throw your bull-up dart, then Quit (two taps, as a player) within 1.2 s -> no page error over the next 4 s (live: "Cannot set
//    properties of null (setting 'cur')").
// B: throw your bull-up dart, then quit and start the next match within 1.2 s -> the new match's bull-up isn't touched by the old timers
//    (still your turn, not busy, view 0, no opponent bull dart thrown for it) and it plays on normally.
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');const fails=[];const out={};
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();});
const start=()=>p.evaluate(()=>{beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});});
const toBull=async()=>{for(let i=0;i<100;i++){const s=await p.evaluate(()=>{const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();return S&&S.bull&&S.cur===0&&!S.busy&&S.bull.me==null?'ok':'wait';});if(s==='ok')return true;await p.waitForTimeout(150);}return false;};
const quit=()=>p.evaluate(()=>{const q=document.getElementById('btnQuit');q.click();q.click();});
// A
await start();out.aBull=await toBull();
await p.evaluate(()=>{S.busy=true;land(4,3);});await p.waitForTimeout(300);await quit();await p.waitForTimeout(4000);
out.a={errors:pe.slice(),S:await p.evaluate(()=>S===null?'null':typeof S),hub:await p.evaluate(()=>!document.getElementById('hub').hidden)};
// B
const pe0=pe.length;await start();out.bBull=await toBull();
await p.evaluate(()=>{S.busy=true;land(4,3);});await p.waitForTimeout(300);await quit();await p.waitForTimeout(150);await start();
const t0=Date.now();out.bAfter=await p.evaluate(()=>new Promise(r=>{const s=S;let opp=0;const h=setInterval(()=>{if(S!==s){clearInterval(h);r({changed:true});}},50);setTimeout(()=>{clearInterval(h);r({sameMatch:S===s,bull:!!(s&&s.bull),cur:s.cur,busy:!!s.busy,view:s.view,oppBull:s.bull?s.bull.op:null,meBull:s.bull?s.bull.me:null});},3000);}));
// and it still plays: my bull dart, the opponent's, then the first visit
await p.evaluate(()=>{const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();});
let played='';for(let i=0;i<120;i++){played=await p.evaluate(()=>{try{const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(!S.p[S.cur].ai)return 'aim';return 'opp';}catch(e){return 'ERR '+e.message;}});if(played==='aim'||played==='opp')break;await p.waitForTimeout(150);}
out.b={errors:pe.slice(pe0),played};
console.log(JSON.stringify(out));
const chk=(n,c)=>{if(!c)fails.push(n);};
chk('A: reached the bull-up',out.aBull);chk('A: no page error after quitting during the bull-up',!out.a.errors.length);chk('A: back in the hub',out.a.hub);
chk('B: reached the bull-up',out.bBull);/* busy is the new match's own intro card; the old timers set cur 1 + view 1 (the opponent's bull-up throw) */chk('B: the new match is untouched by the old match\'s timers (still your turn, view 0, no opponent bull dart)',out.bAfter.sameMatch&&out.bAfter.cur===0&&!out.bAfter.view&&out.bAfter.oppBull==null);
chk('B: the new match plays on (bull-up done, a visit starts)',out.b.played==='aim'||out.b.played==='opp');chk('B: no page errors',!out.b.errors.length);
await b.close();console.log(fails.length?'BULL-QUIT FAIL\n- '+fails.join('\n- '):'BULL-QUIT PASS');process.exit(fails.length?1:0);})();
