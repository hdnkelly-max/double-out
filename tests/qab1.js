// QA-B1: colour flight rewards must show on the dart. node tests/qab1.js [dir]  -> PASS/FAIL
// Compares V.dartShot images (the cache key includes the custom flag, so identical data URLs mean the same flights were drawn).
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2]||require("path").resolve(__dirname,"..");
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined'&&typeof V!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();
 const D=TC_API.D,cosId=Object.keys(D.COS).find(k=>D.COS[k].flight&&D.COS[k].flight!==save.flight);const cos=D.COS[cosId];
 const parts=()=>Object.assign({barrel:barrel()},setupParts());
 const shot=(extra)=>V.dartShot(save.flight,Object.assign(parts(),extra||{}));
 const out={barrel:barrel().id,cos:cosId,flight:cos&&cos.flight};
 // 1. equip the reward flight like a card set reward does
 save.flightCustom=false;TC_API.equip(cosId);
 const A=shot({custom:false}),B=shot({custom:true}),C=shot();
 out.equipShowsColour=C===B&&A!==B;
 // 2. take it off: back to the barrel's own flights
 TC_API.equip(cosId,true);out.offShowsSet=shot()===shot({custom:false});
 // 3. a save from before the fix: reward equipped, flag never set
 TC_API.equip(cosId);delete save.flightCustom;out.legacyShowsColour=shot()===shot({custom:true});
 return out;});
const pass=r.equipShowsColour&&r.offShowsSet&&r.legacyShowsColour&&!pe.length;
console.log('qab1',pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
