// #20 Task B: the throw locks where the reticle was on screen when the player pressed. node tests/lock-shown.js [dir] -> PASS / FAIL.
// A career match at the player's aim (render stubbed, 390 iPhone UA). We record the reticle position (aim + sway) every frame; then, right
// after a frame that the phone took 330 ms to get out (busy main thread, as in Hayden's 3.11 match 2), the player presses. The frame drawn
// just before the press hasn't reached the screen yet; the one before it is what he sees. The hand tremor (random) is set to 0 for the check.
// PASS when, over 12 presses, the lock is the on-screen reticle (within 0.05 mm) every time. Live 3.11 locks to the not-yet-shown frame.
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();
 beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});
 window.__H=[];const vf=V.frame;V.frame=function(now,st){const r=vf.apply(this,arguments);try{if(st&&!st.done&&st.sway&&!st.pulling)__H.push({t:now,x:st.aim.x+st.sway.x,y:st.aim.y+st.sway.y});if(__H.length>10)__H.shift();}catch(e){}return r;};});
for(let i=0;i<600;i++){const st=await p.evaluate(()=>{try{if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim'||st.startsWith('ERR'))break;await p.waitForTimeout(100);}
const res=[];
for(let k=0;k<12;k++){await p.waitForTimeout(400);
 const r=await p.evaluate(()=>new Promise(res=>{/* stall the next frame 330 ms, then press before the following frame */requestAnimationFrame(()=>{const a=performance.now();while(performance.now()-a<330){}setTimeout(()=>{try{const H=__H.slice();const last=H[H.length-1],shown=H[H.length-2];const g0=window.gauss;window.gauss=()=>0;try{startPull('key');}finally{window.gauss=g0;}
  const L=S.lock?{x:S.lock.x,y:S.lock.y}:null;S.pulling=false;S.lock=null;S.busy=false;res({L,last,shown,step:Math.hypot(last.x-shown.x,last.y-shown.y)});}catch(e){res({err:e.message});}},0);});}));
 if(r.err){res.push(r);continue;}const dS=Math.hypot(r.L.x-r.shown.x,r.L.y-r.shown.y),dL=Math.hypot(r.L.x-r.last.x,r.L.y-r.last.y);res.push({toShown:+dS.toFixed(2),toNotShown:+dL.toFixed(2),step:+r.step.toFixed(2)});}
const fails=[];const bad=res.filter(r=>r.err||r.toShown>0.05);if(bad.length)fails.push(bad.length+' of '+res.length+' presses did not lock to the on-screen reticle');if(!res.some(r=>r.step>0.3))fails.push('the stalled frame never moved the reticle (test did not exercise the case)');if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));
console.log('lock-shown',fails.length?'FAIL':'PASS',JSON.stringify({fails,presses:res,maxStep:Math.max(...res.map(r=>r.step||0)).toFixed(2)}));await b.close();process.exit(fails.length?1:0);})();
