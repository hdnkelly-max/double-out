// #15 hardening: the per-match frame sampler (v10.js) must run one loop, however often the app goes to the background and back.
// node tests/sampler-loops.js [dir]  -> PASS / FAIL. Starts a career match, cycles document.hidden 5 times (as iOS does when you
// lock the phone or switch apps), and counts requestAnimationFrame callbacks per frame. Live 1.99 grows by one loop per cycle.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{window.__hid=false;Object.defineProperty(document,'hidden',{get:()=>window.__hid,configurable:true});Object.defineProperty(document,'visibilityState',{get:()=>window.__hid?'hidden':'visible',configurable:true});
 const raf=window.requestAnimationFrame;window.__raf=0;window.requestAnimationFrame=function(f){return raf.call(window,function(t){window.__raf++;return f(t);});};
 window.__fr=0;(function c(){window.__fr++;raf.call(window,c);})();});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function',null,{timeout:180000});await p.waitForTimeout(2000);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';$('login').hidden=true;newCareer();V.walkOn=()=>{};beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:'deano',oppName:'Deano Marsh',oppAvg:60,legs:3,start:501});});
await p.waitForTimeout(1500);
const rate=async()=>{const a=await p.evaluate(()=>[__raf,__fr]);await p.waitForTimeout(2500);const z=await p.evaluate(()=>[__raf,__fr]);return +((z[0]-a[0])/Math.max(1,z[1]-a[1])).toFixed(2);};
const r0=await rate();
// iOS pauses animation frames while the app is in the background, so the sampler's pending frame survives until it comes back:
// model that by going hidden and visible again before that frame can run (same task)
for(let i=0;i<5;i++){await p.evaluate(()=>{window.__hid=true;document.dispatchEvent(new Event('visibilitychange'));window.__hid=false;document.dispatchEvent(new Event('visibilitychange'));});await p.waitForTimeout(300);}
await p.waitForTimeout(800);const r1=await rate();
const perf=await p.evaluate(()=>{try{return window.TOPS_perfNow?TOPS_perfNow():null;}catch(e){return 'ERR '+e.message;}});await p.waitForTimeout(600);const r2=await rate();
const extra=+(r2-r0).toFixed(2),extraVis=+(r1-r0).toFixed(2);const pass=extra<0.5&&extraVis<0.5&&perf&&perf.live===true&&!pe.length;
console.log('sampler-loops',pass?'PASS':'FAIL',JSON.stringify({rafPerFrameStart:r0,after5Cycles:r1,afterPerfNow:r2,extraLoops:extra,extraFromBackground:extraVis,perfLive:perf&&perf.live,pe:pe.slice(0,2)}));await b.close();process.exit(pass?0:1);})();
