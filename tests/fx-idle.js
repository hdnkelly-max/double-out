// #20: the effect canvases leave the page when idle and come back for the next effect. node tests/fx-idle.js [dir] -> PASS / FAIL.
// Plays a win celebration (TC_FX) and a pub effect (TOPS_PUBFX) at the player's aim: each canvas is shown while its effect runs and display:none
// within 3 s after; a second effect shows it again. Live 3.11 leaves #tcFx shown (and #pubFxC) after the effect.
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();
 beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});});
const st=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return 'none';return getComputedStyle(e).display==='none'?'hidden':'shown';},sel);
const out={};
await p.evaluate(()=>TC_FX.run('cel_green','Lee'));await p.waitForTimeout(300);out.tcDuring=await st('#tcFx');await p.waitForTimeout(3500);out.tcAfter=await st('#tcFx');
await p.evaluate(()=>TC_FX.run('cel_goldflash','Lee'));await p.waitForTimeout(300);out.tcAgain=await st('#tcFx');await p.waitForTimeout(3500);out.tcAfter2=await st('#tcFx');
const ids=await p.evaluate(()=>window.TOPS_PUBFX?Object.keys(TOPS_PUBFX).join(','):null);out.pubApi=ids;
await p.evaluate(()=>{try{TOPS_PUBFX.test('horn');}catch(e){}});await p.waitForTimeout(300);out.pubDuring=await st('#pubFxC');await p.waitForTimeout(6000);out.pubAfter=await st('#pubFxC');
const fails=[];if(out.tcDuring!=='shown'||out.tcAgain!=='shown')fails.push('#tcFx not shown during an effect');if(out.tcAfter!=='hidden'||out.tcAfter2!=='hidden')fails.push('#tcFx still in the page after the effect');
if(out.pubDuring==='hidden')fails.push('#pubFxC hidden during an effect');if(out.pubAfter==='shown')fails.push('#pubFxC still in the page after the effect');if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));
console.log('fx-idle',fails.length?'FAIL':'PASS',JSON.stringify({fails,out}));await b.close();process.exit(fails.length?1:0);})();
