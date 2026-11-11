const {chromium}=require('playwright');const view=process.argv[2]||'full';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:1200,height:900}});
p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('err',e.message));
await p.addInitScript(v=>{window.VIEW=v;},view);await p.goto('http://localhost:8765/index.html');await p.waitForFunction(()=>window.DONE,null,{timeout:120000});
const cdp=await p.context().newCDPSession(p);const r=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:88});require('fs').writeFileSync('mh_'+view+'.jpg',Buffer.from(r.data,'base64'));await b.close();console.log('ok');})();
