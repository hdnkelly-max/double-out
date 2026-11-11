// #15: how long does an opponent's character take to be ready when its template was freed at the last teardown?
// node reload-time.js <dir> [cpu=4]. Loads Pete once, tears the match down (if this build has teardown), then times
// setOpponentLook(Pete) until his template is in RIGS (the real model can show). On 1.99 the template is still cached (~0).
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],cpu=+(process.argv[3]||4);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const cdp=await ctx.newCDPSession(p);
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';$('login').hidden=true;newCareer();});
const has=k=>p.evaluate(k=>V._qa.gfx().rigs.includes(k),k);
await p.evaluate(()=>V.setOpponentLook({model:'pete'},'Pete the Plumber',1));for(let i=0;i<120&&!(await has('pete'));i++)await p.waitForTimeout(250);
const teardown=await p.evaluate(()=>{if(V.teardownMatch){V.teardownMatch();return true;}return false;});
const freed=!(await has('pete'));await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
const t0=Date.now();await p.evaluate(()=>V.setOpponentLook({model:'pete'},'Pete the Plumber',1));let ok=false;for(let i=0;i<400&&!(ok=await has('pete'));i++)await p.waitForTimeout(50);
const ms=Date.now()-t0;console.log('reload-time',JSON.stringify({teardown,freedAtTeardown:freed,readyAfterMs:ms,ready:ok,cpu}));await b.close();})();
