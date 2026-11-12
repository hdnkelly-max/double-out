// usage: node shot.js out.jpg "v=front&c=brian" [w h]
const {chromium}=require('playwright');const [out,q,w,h]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:+(w||700),height:+(h||900)}});p.on('console',m=>console.log('console:',m.text()));p.on('pageerror',e=>console.log('err',e.message));
await p.goto('http://localhost:8766/index.html?'+q+'&w='+(w||700)+'&h='+(h||900));await p.waitForFunction(()=>window.DONE,null,{timeout:80000});
console.log(JSON.stringify(await p.evaluate(()=>window.INFO)));
await p.locator('canvas').screenshot({path:out,type:'jpeg',quality:90});await b.close();})();
