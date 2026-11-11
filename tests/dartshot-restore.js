// QA 01:15 follow-up: V.dartShot must always restore the main renderer, even if the dart render fails.
// node tests/dartshot-restore.js [dir] -> PASS/FAIL
// Makes the GPU draw call throw once inside dartShot, then checks the main view is back on the screen
// (no render target bound) with its original clear colour and alpha.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2]||require("path").resolve(__dirname,"..");
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined'&&typeof V!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();
 const gl=document.getElementById('scene').getContext('webgl2')||document.getElementById('scene').getContext('webgl');
 const before={fb:gl.getParameter(gl.FRAMEBUFFER_BINDING),clear:[...gl.getParameter(gl.COLOR_CLEAR_VALUE)]};
 const P=Object.getPrototypeOf(gl),names=['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced'],orig={};
 let armed=true;names.forEach(n=>{if(!P[n])return;orig[n]=P[n];P[n]=function(){if(armed){armed=false;throw new Error('test: draw failed');}return orig[n].apply(this,arguments);};});
 let threw=false;try{V.dartShot('#2ad1c9',Object.assign({barrel:barrel()},setupParts(),{custom:true,fl:{id:'restoretest'+Date.now()}}));}catch(e){threw=true;}
 names.forEach(n=>{if(orig[n])P[n]=orig[n];});
 const after={fb:gl.getParameter(gl.FRAMEBUFFER_BINDING),clear:[...gl.getParameter(gl.COLOR_CLEAR_VALUE)]};
 const same=(a,b)=>a.length===b.length&&a.every((v,i)=>Math.abs(v-b[i])<1e-6);
 return {threw,injected:!armed,fbRestored:after.fb===before.fb,clearRestored:same(after.clear,before.clear),before:before.clear,after:after.clear};});
const pass=r.injected&&r.fbRestored&&r.clearRestored;
console.log('dartshot-restore',pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
