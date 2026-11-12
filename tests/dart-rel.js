// CAR-5c (Overseer 05:29): every human dart records its release context, so a green throw far from the target can be split by
// "was there a freeze just before it" and "where was the reticle on screen". Real presses and releases in a career match (render stubbed,
// 390 iPhone UA, signed-in stub), checked in the flight recorder's 'match_dart' events:
//  A a 330 ms stall right before the press  -> gp >= 250, lag = 1 (the lock used the frame on screen), s (shown) differs from g (game)
//  B a steady press                          -> gp < 100, lag = 0
//  every event: lg, d, sb, pf, gp, gr, gpl, pm, lag and x,y pairs a (aim), k (lock), l (land), s (shown at press), g (game sway at press), r (sway at release)
//  C a 300 ms stall during the pull           -> gpl >= 250 and gr >= 250, gp < 100
//  D the tops_darts rows keep their columns (no 'rel' field unless TOPS_DARTS_REL is set, which waits for sql/tops_darts_rel.sql);
//    with the flag on, the row carries the same record
// usage: node tests/dart-rel.js [dir]
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();
 window.__rows=[];NET.user={id:'u1'};NET.sb={from:t=>({insert:rows=>{if(t==='tops_darts')__rows.push(...rows);return Promise.resolve({error:null,status:201});},upsert:()=>Promise.resolve({error:null}),select:()=>({eq:()=>Promise.resolve({data:[],error:null})})}),auth:{getSession:()=>Promise.resolve({data:{session:null}})}};
 beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});});
const toAim=async()=>{for(let i=0;i<600;i++){const st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai&&!S.pulling)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim'||st==='done'||st.startsWith('ERR'))return st;await p.waitForTimeout(100);}return 'timeout';};
const ev=()=>p.evaluate(()=>{const e=TOPS_LOG.events().filter(x=>x&&x.k==='match_dart');return e.length?e[e.length-1].d:null;});
const throwOne=async(mode)=>{const s=await toAim();if(s!=='aim')return {err:'state '+s};await p.waitForTimeout(400);
 return p.evaluate(mode=>new Promise(res=>{const press=()=>{try{startPull('key');}catch(e){res({err:e.message});return;}
   const rel=()=>{try{release({timeStamp:performance.now()},'key');res({ok:1});}catch(e){res({err:e.message});}};
   if(mode==='pull'){setTimeout(()=>{const a=performance.now();while(performance.now()-a<300){}rel();},120);}else setTimeout(rel,300);};
  if(mode==='stall'){requestAnimationFrame(()=>{const a=performance.now();while(performance.now()-a<330){}setTimeout(press,0);});}
  else requestAnimationFrame(()=>setTimeout(press,0));}),mode);};
const out={};
for(const [k,m] of [['A','stall'],['B','steady'],['C','pull']]){const r=await throwOne(m);await p.waitForTimeout(200);out[k]=r.err?r:await ev();}
// D: the rows as sent (flush after 3 darts or 8 s)
await p.waitForTimeout(8500);out.D1=await p.evaluate(()=>({n:__rows.length,rel:__rows.some(r=>'rel' in r),cols:__rows[0]&&Object.keys(__rows[0]).length}));
await p.evaluate(()=>{window.TOPS_DARTS_REL=true;});const rD=await throwOne('steady');await p.waitForTimeout(8500);
out.D2=await p.evaluate(()=>{const r=__rows[__rows.length-1];return r&&r.rel?{has:1,keys:Object.keys(r.rel).sort().join(',')}:{has:0};});
const f=[];const A=out.A,B=out.B,C=out.C;
if(!A||A.err)f.push('A: '+JSON.stringify(A));else{if(!(A.gp>=250))f.push('A: stall before the press not seen (gp '+A.gp+')');if(A.lag!==1)f.push('A: lag flag not set after the stall');if(A.s[0]===A.g[0]&&A.s[1]===A.g[1])f.push('A: shown reticle equals game sway after a stall (test did not exercise it)');}
if(!B||B.err)f.push('B: '+JSON.stringify(B));else{if(!(B.gp<100))f.push('B: steady press shows a gap '+B.gp);if(B.lag!==0)f.push('B: lag set on a steady press');if(!(B.ra<60))f.push('B: frame age at the release '+B.ra);}
if(!C||C.err)f.push('C: '+JSON.stringify(C));else{if(!(C.gpl>=250&&C.gr>=250))f.push('C: stall during the pull not seen '+JSON.stringify(C));if(!(C.gp<100))f.push('C: pre-press gap '+C.gp);if(!(C.ra>=250))f.push('C: the frame on screen at the release should be ~300 ms old, got '+C.ra);}
for(const x of [A,B,C])if(x&&!x.err&&!(['lg','d','sb','pf','gp','gr','gpl','pm','ra','lag'].every(k=>k in x)&&['a','k','l','s','g','r'].every(k=>Array.isArray(x[k])&&x[k].length===2&&x[k].every(v=>typeof v==='number'))))f.push('event fields missing: '+JSON.stringify(x));
if(!(out.D1.n>=3))f.push('dart rows not sent: '+JSON.stringify(out.D1));if(out.D1.rel)f.push('tops_darts rows carry rel before the migration');
if(rD.err||!out.D2.has)f.push('with TOPS_DARTS_REL the row has no rel: '+JSON.stringify(out.D2));
if(pe.length)f.push('page errors: '+pe.slice(0,2).join(' | '));
console.log(JSON.stringify(out));await b.close();
if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
console.log('PASS: each dart records the frame gaps before the press, during the pull and before the release, the on-screen and game reticle at the press and the sway at the release (flight recorder match_dart); rows unchanged until the migration');})();
