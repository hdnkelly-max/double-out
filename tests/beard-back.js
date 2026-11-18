// BUG-BEARD (David 22:01, 3.53, Android: "the opponent has a beard on the back of their head"; screenshot: Luke Littler from behind, a dark
// strip at the nape). The library beard (hair.glb, from Pete's model) wraps round the back of the neck; only "soft" beards were trimmed
// to the front. This builds a bearded opponent on every male model the way a match does (setOpponentLook) and counts the beard's
// triangles that sit behind the head's centre (head-bone space, the eyes give the front). Want 0 on every model.
// node tests/beard-back.js <dir>   (<dir> = a built page as index.html + rig/ + assets/)
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]);const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({...devices['Pixel 7']})).newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>TOPS_LOADHAIR());await p.waitForFunction(()=>Array.isArray(V._qa.gfx().hair),null,{timeout:120000});
const fails=[];const out={};
for(const [nm,mdl,soft] of [['Luke Littler','lewis'],['Luke Littler','brian'],['Luke Littler','david'],['Luke Littler','leonard'],['Luke Littler','pete'],['Luke Littler','bryce'],['Big Mal','pete',1]]){
 await p.evaluate(m=>TOPS_LOADCHAR(m),mdl);await p.waitForFunction(m=>TOPS_RIGS().ids.includes(m),mdl,{timeout:120000});
 const r=await p.evaluate(([nm,mdl,soft])=>{const T=THREE;const lk=Object.assign(lookFor(nm),{pint:false,model:mdl,beard2:1});if(soft)lk.beardSoft=1;V.setOpponentLook(lk,nm,6);const f=V._qa.opp();f.updateMatrixWorld(true);
  let head=null;f.traverse(o=>{if(o.isBone&&/Head$/.test(o.name)&&!head)head=o;});const ey=[];f.traverse(o=>{if(/RightEye|LeftEye/.test(o.name)){const w=o.getWorldPosition(new T.Vector3());head.worldToLocal(w);ey.push(w.z);}});const fz=ey[0];
  const res={ck:f.userData.ck,stand:!!f.userData.stand,beard:null};head.children.forEach(o=>{if(!o.isMesh||o.userData.hairStyle!=='beard')return;const g=o.geometry,P=g.attributes.position,I=g.index;o.updateMatrix();const v=new T.Vector3();let back=0,front=0;
   const n=I?I.count/3:P.count/3;for(let t=0;t<n;t++){let cz=0;for(let k=0;k<3;k++){const ix=I?I.array[t*3+k]:t*3+k;v.fromBufferAttribute(P,ix).applyMatrix4(o.matrix);cz+=v.z/3;}if(fz>0?cz<0:cz>0)back++;else front++;}res.beard={front,back};});return res;},[nm,mdl,soft]);
 out[mdl+(soft?' soft':'')]=r;if(r.stand)fails.push(mdl+': stand-in');if(!r.beard)fails.push(mdl+': no beard');else{if(r.beard.back>0)fails.push(mdl+': '+r.beard.back+' beard triangles behind the head');if(r.beard.front<200)fails.push(mdl+': beard nearly gone ('+r.beard.front+')');}}
console.log(JSON.stringify(out));if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));fails.forEach(f=>console.log('FAIL '+f));
await b.close();srv.close();console.log(fails.length?'BEARD-BACK FAIL':'BEARD-BACK PASS');process.exit(fails.length?1:0);})();
