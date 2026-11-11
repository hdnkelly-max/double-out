// ChatGPT P0: create A and B, dispose A, dispose B, recreate A, switch shirt, render a portrait. Every texture must still have its image and the figure must render.
const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'..')+'/index.html');await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(6000);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';persist();$('login').hidden=true;V.walkOn=()=>{};newCareer();const n=nextOpponent();beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:n.oppKey,oppName:n.oppName,oppAvg:50,legs:1});});
await p.waitForTimeout(9000);
const r=await p.evaluate(async()=>{const q=V._qa,sc=q.scene,raf=n=>new Promise(async res=>{for(let i=0;i<n;i++)await new Promise(r=>requestAnimationFrame(r));res();});
 const look=Object.assign({},save.look),bad=[];
 const check=(f,tag)=>{let meshes=0;f.traverse(o=>{if(o.isMesh){meshes++;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{['map','normalMap'].forEach(k=>{const t=m&&m[k];if(t&&!t.image)bad.push(tag+':'+o.name+'.'+k);});});}});return meshes;};
 let A=q.makeFigure(look,'Lee',1),B=q.makeFigure(look,'Lee',1);sc.add(A);sc.add(B);await raf(3);
 sc.remove(A);q.dispose(A);await raf(3);sc.remove(B);q.dispose(B);await raf(3);
 A=q.makeFigure(look,'Lee',1);sc.add(A);await raf(3);const m1=check(A,'recreated');
 const look2=Object.assign({},look,{shirt:'#c0392b',pattern:1});const A2=q.makeFigure(look2,'Lee',1);sc.remove(A);q.dispose(A);sc.add(A2);await raf(3);const m2=check(A2,'newshirt');
 const url=V.portrait?V.portrait(look2,'Lee',1):'';
 const gl=q.renderer.getContext();const err=gl.getError();
 sc.remove(A2);q.dispose(A2);
 return {meshes:[m1,m2],badTextures:bad,portraitOk:typeof url==='string'&&url.length>1000,glError:err};});
console.log(JSON.stringify(r),'pageErrors:',pe.length,pe.slice(0,2).join(' | '));await b.close();})();
