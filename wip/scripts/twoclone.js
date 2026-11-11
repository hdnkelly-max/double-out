// QA condition 5: dispose one rigged figure, keep rendering the other. Programs flat, no geometry re-upload, frame time steady.
const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(6000);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';persist();$('login').hidden=true;V.walkOn=()=>{};newCareer();const n=nextOpponent();beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:n.oppKey,oppName:n.oppName,oppAvg:50,legs:1});});
await p.waitForTimeout(9000);
const r=await p.evaluate(async()=>{const q=V._qa,r=q.renderer,sc=q.scene;const look=Object.assign({},save.look);
 const ft=async n=>{const t=[];let last=performance.now();for(let i=0;i<n;i++){await new Promise(res=>requestAnimationFrame(res));const now=performance.now();t.push(now-last);last=now;}t.sort((a,b)=>a-b);return Math.round(t[t.length>>1]);};
 const A=q.makeFigure(look,'Lee',1),B=q.makeFigure(look,'Lee',1);A.position.set(-.5,0,2);B.position.set(.5,0,2);sc.add(A);sc.add(B);
 for(let i=0;i<5;i++)await new Promise(res=>requestAnimationFrame(res));
 const before={geo:r.info.memory.geometries,tex:r.info.memory.textures,prog:r.info.programs.length,ft:await ft(20)};
 // what B shares with the template, and what A will dispose
 let shared=0;B.traverse(o=>{if(o.geometry){let s=false;A.traverse(x=>{if(x.geometry===o.geometry)s=true;});if(s)shared++;}});
 sc.remove(A);q.dispose(A);
 let upl=0;const gl=r.getContext();const bd=gl.bufferData.bind(gl);gl.bufferData=function(...a){upl++;return bd(...a);};
 for(let i=0;i<5;i++)await new Promise(res=>requestAnimationFrame(res));
 const after={geo:r.info.memory.geometries,tex:r.info.memory.textures,prog:r.info.programs.length,ft:await ft(20),bufferUploads:upl};
 let bOk=true;B.traverse(o=>{if(o.isMesh&&o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m.map&&!m.map.image)bOk=false;});}});
 return {sharedGeometries:shared,before,after,bTexturesIntact:bOk};});
console.log(JSON.stringify(r),pe.slice(0,2).join(' | '));await p.screenshot({path:'shots/twoclone.jpg',quality:70});await b.close();})();
