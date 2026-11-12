// #20 test switches (Overseer 21:07/21:10): the hub Menu's 'Test: no walk-on' / 'Test: no effects' toggles persist, show a TEST tag in the match,
// stop the walk-on and the celebration effects, and are logged on the perf row (dev.t20.q20). Off = everything as before.
// node tests/q20-switches.js [dir] -> PASS / FAIL. Render stubbed; walk-on, win and checkout celebrations equipped.
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const run=async on=>{const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.goto('file://'+dir+'/index.html');
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
 const o=await p.evaluate(async on=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;
  save.look=save.look||{};save.look.cel=Object.assign({},save.look.cel,{win:'cel_green',checkout:'cel_goldflash',walkon:'walk_smoke'});document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();
  const r={};$('btnHubMenu').click();await new Promise(z=>setTimeout(z,200));const bw=document.getElementById('q20b_nowalk'),bf=document.getElementById('q20b_nofx');r.buttons=[bw&&bw.textContent,bf&&bf.textContent];
  if(on){bw.click();bf.click();}r.after=[bw.textContent,bf.textContent];r.stored=localStorage.getItem('tops_q20_app');
  beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});await new Promise(z=>setTimeout(z,600));
  r.walk=!!document.getElementById('tcWalk');const tg=document.getElementById('q20tag');r.tag=tg?tg.textContent:null;
  try{TC_FX.run('cel_green','Lee');}catch(e){}await new Promise(z=>setTimeout(z,300));const c=document.getElementById('tcFx');r.fx=c?getComputedStyle(c).display:'none-made';r.q20=window.TOPS_Q20||null;r.has=[TOPS_q20has('nowalk'),TOPS_q20has('nofx')];return r;},on);
 o.pe=pe.slice(0,2);await ctx.close();return o;};
const off=await run(false),on=await run(true);
const fails=[];
if(!(off.buttons[0]==='Test: no walk-on: off'&&off.buttons[1]==='Test: no effects: off'))fails.push('menu toggles missing or wrong: '+JSON.stringify(off.buttons));
if(!off.walk)fails.push('off: walk-on did not start');if(off.fx!=='block'&&off.fx!=='inline')fails.push('off: effect canvas not shown during the effect ('+off.fx+')');if(off.tag)fails.push('off: TEST tag shown');if(off.q20)fails.push('off: q20 logged: '+off.q20);
if(on.walk)fails.push('on: walk-on started');if(on.fx==='block'||on.fx==='inline')fails.push('on: effect canvas shown');if(!/TEST/.test(on.tag||''))fails.push('on: no TEST tag');if(on.q20!=='nowalk,nofx')fails.push('on: q20 not logged as nowalk,nofx: '+on.q20);if(on.stored!=='nowalk,nofx')fails.push('on: toggles not stored');
[off,on].forEach(r=>{if(r.pe.length)fails.push('page errors: '+r.pe.join(' | '));});
console.log('q20-switches',fails.length?'FAIL':'PASS',JSON.stringify({fails,off,on}));await b.close();process.exit(fails.length?1:0);})();
