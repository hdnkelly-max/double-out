// node export.js out.glb [src.json]
const {chromium}=require('playwright');const [out,src]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();p.on('pageerror',e=>console.log('err',e.message));p.on('console',m=>{if(!/stall|SIMD/.test(m.text()))console.log('console:',m.text())});
await p.goto('http://localhost:8766/export.html?src='+(src||'mh_rig.json'));await p.waitForFunction(()=>window.DONE,null,{timeout:90000});
const b64=await p.evaluate(async()=>{const ab=await window.OUTP;let s='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);});
require('fs').writeFileSync(out,Buffer.from(b64,'base64'));console.log('wrote',out,Buffer.from(b64,'base64').length);await b.close();})();
