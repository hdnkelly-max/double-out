// Reward tile resubmit: node rewardtile.js <dir> [lin]  -> PASS/FAIL
// 1. dart renders key cleanly: corners fully transparent, the dart itself opaque (also with the sRGB path, GFX_LIN, that gave newer phones a dark box)
// 2. the level-up flight tile shows the colour being unlocked, not the barrel's printed flights
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],lin=process.argv[3]==='lin';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
if(lin)await p.addInitScript(()=>{window.GFX_LIN=true;});
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined'&&typeof V!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
const r=await p.evaluate(async()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();
 const parts=()=>Object.assign({barrel:barrel()},setupParts());const out={};
 const alpha=async url=>{const im=new Image();im.src=url;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;const at=(px,py)=>d[(py*c.width+px)*4+3];let opaque=0;for(let i=3;i<d.length;i+=4)if(d[i]===255)opaque++;
   return {corners:[at(0,0),at(c.width-1,0),at(0,c.height-1),at(c.width-1,c.height-1),at(5,(c.height/2)|0)],opaquePct:Math.round(1000*opaque/(d.length/4))/10};};
 const store=V.dartShot(save.flight,parts());out.store=await alpha(store);
 const teal='#2BB3A8';const tealCustom=V.dartShot(teal,Object.assign(parts(),{custom:true}));out.custom=await alpha(tealCustom);
 out.rIco=typeof rIco==='function';
 if(out.rIco){const h=rIco({k:'flight',v:teal});const m=h.match(/src="([^"]+)"/);out.tileIsCustom=!!m&&m[1]===tealCustom;out.tileIsSet=!!m&&m[1]===V.dartShot(teal,Object.assign(parts(),{custom:false}));}
 return out;});
const clean=a=>a.corners.every(v=>v===0)&&a.opaquePct>2&&a.opaquePct<80;
const pass=clean(r.store)&&clean(r.custom)&&r.rIco&&r.tileIsCustom&&!r.tileIsSet&&!pe.length;
console.log('rewardtile'+(lin?' (GFX_LIN)':''),pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
