// Overseer 07:13: cost of 2,000 touch pointermoves at CPU x4 (after the first-drag estimate settles). usage: node tests/touch-move-cost.js <abs build dir>
const {chromium}=require('playwright');
(async()=>{const dir=process.argv[2];const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());await p.goto('file://'+dir+'/index.html');await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
await p.evaluate(async()=>{const T=performance.now();for(let k=0;k<40;k++){while(performance.now()<T+k*8.33);window.dispatchEvent(new PointerEvent('pointermove',{pointerType:'touch',pointerId:9,clientX:100,clientY:300,bubbles:true}));}});await p.waitForTimeout(300);
const r=await p.evaluate(async()=>{const run=()=>{const T=performance.now();for(let k=0;k<2000;k++)window.dispatchEvent(new PointerEvent('pointermove',{pointerType:'touch',pointerId:7,clientX:200+k%30,clientY:300,bubbles:true}));return performance.now()-T;};
 const base=(()=>{const T=performance.now();for(let k=0;k<2000;k++)new PointerEvent('pointermove',{pointerType:'touch',pointerId:7,clientX:200+k%30,clientY:300,bubbles:true});return performance.now()-T;})();
 const first=run();await new Promise(r=>setTimeout(r,300));const second=run();return {first:+first.toFixed(1),second:+second.toFixed(1),eventOnly:+base.toFixed(1),tch:window.TOPS_TCH?{on:TOPS_TCH.on,ms:TOPS_TCH.ms}:'none'};});
console.log(dir.split('/').pop(),JSON.stringify(r));await b.close();})();
