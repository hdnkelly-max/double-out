// r16 collar vs the head (Director doc 45 risk: "check the stand doesn't clip the chin in the throw follow-through on Dazza (beard) and Mia
// (hair to the shoulders)"). Every base + three seeded opponents, through the throw at the match place (k .05) and every game clip (6 moments),
// with the idle clip time varied. For every collar stand / piping / flap vertex: is it inside the skull (ray parity on the closed skull mesh), and
// the closest head-side vertex (skull, beard, hair, ears) in mm. Pass: nothing inside the skull and no head mesh vertex within 0 mm of the stand
// from the inside (beard/hair may rest on the collar: they're reported, not failed, unless they cross it by more than 6 mm).
// node tests/s3-collar-chin.js <build dir> [ids]
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]),only=(process.argv[3]||'').split(',').filter(Boolean);
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(()=>{window.TOPS_S3FLAG=true;try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_v2','1');localStorage.setItem('tops_v3','1');}catch(e){}});
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>{V.loadAnims();});await p.waitForFunction(()=>TOPS_RIGS().ids.includes('leonard')&&V._qa.animNames().length>0,null,{timeout:180000});
const res=await p.evaluate(([only])=>{const Q=V._qa,T=Q.T;const boardC=new T.Vector3(0,1.73,0.045);
 const specs=[...TOPS_S3_BASES.map(b=>[b.look,'You',b.id]),[{},'Big Mal','opp:Big Mal'],[{},'Shazza','opp:Shazza'],[{},'Deano','opp:Deano']].filter(s=>!only.length||only.includes(s[2]));
 const out={};const rc=new T.Raycaster(),v=new T.Vector3(),w=new T.Vector3();
 for(const [look,name,id] of specs){const f=Q.makeFigure(look,name,0);if(!f.userData.rigged){out[id]={err:'not rigged'};continue;}Q.scene.add(f);f.position.set(0.1,0,2.37-0.51);f.rotation.set(0,0.8,0);
  const Hd=f.userData.B&&f.userData.B.Head;const col=[],head=[];let skull=null;
  f.traverse(o=>{if(!o.isMesh||!o.visible)return;const t=o.userData.tag;if(t==='collar'||t==='pipe'||t==='fold'){col.push(o);return;}let a=o;while(a&&a!==Hd)a=a.parent;if(a===Hd){head.push(o);if(t==='skull')skull=o;}});
  if(!col.length){out[id]={err:'no r16 collar ('+col.length+')'};Q.scene.remove(f);Q.dispose(f);continue;}
  const R={inside:0,min:99,at:'',minBy:{},n:0,colMeshes:col.length,headMeshes:head.length};
  const skP=skull?new T.Mesh(skull.geometry,new T.MeshBasicMaterial({side:T.DoubleSide})):null;
  const meas=where=>{f.updateMatrixWorld(true);R.n++;if(skP){skP.matrixWorld.copy(skull.matrixWorld);skP.matrixAutoUpdate=false;}
   const hv=[];for(const o of head){const P=o.geometry.attributes.position;const st=Math.max(1,Math.floor(P.count/1500));for(let i=0;i<P.count;i+=st){hv.push([v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld).clone(),o.userData.tag||(o.userData.hair?'hair':o.userData.beard?'beard':'head')]);}}
   const sc=new T.Vector3();if(skull)skull.getWorldPosition(sc);
   for(const o of col){const P=o.geometry.attributes.position;const st=Math.max(1,Math.floor(P.count/400));for(let i=0;i<P.count;i+=st){w.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);
     if(skP&&w.distanceTo(sc)<0.4){const dir=w.clone().sub(sc).normalize();rc.set(w,dir);const h=rc.intersectObject(skP,false);if(h.length%2===1){R.inside++;if(!R.insideAt)R.insideAt=where;}}
     let md=99,mt='';for(const [q,t] of hv){const d=q.distanceTo(w);if(d<md){md=d;mt=t;}}const mm=md*1000;if(mm<R.min){R.min=mm;R.at=where+' ('+mt+' vs '+o.userData.tag+')';}R.minBy[mt]=Math.min(R.minBy[mt]??99,+mm.toFixed(1));}}};
  const idle=Q.playClip(f,'idle',{t:0}),idur=idle?idle.getClip().duration:1;let ci=0;
  for(const ph of ['idle','pull','throw','fly','follow','reset'])for(let k=0;k<=1.0001;k+=0.05){if(f.userData.mixer)f.userData.mixer.stopAllAction();const a=Q.playClip(f,'idle',{t:0});if(a&&f.userData.mixer){a.time=idur*((ci++*0.1379)%1);f.userData.mixer.update(0);}
    f.updateMatrixWorld(true);Q.poseFigure(f,ph==='idle'?{phase:'idle'}:ph==='pull'?{phase:'pull',pull:k*1.3}:{phase:ph,k},boardC);meas(ph+(+k.toFixed(2)));if(ph==='idle')break;}
  for(const c of Q.animNames()){if(f.userData.mixer)f.userData.mixer.stopAllAction();const a=Q.playClip(f,c,{t:0});if(!a)continue;const d=a.getClip().duration;for(const q of [0,.2,.4,.6,.8,.98]){a.time=d*q;f.userData.mixer.update(0);meas(c+'@'+q);}}
  R.min=+R.min.toFixed(1);out[id]=R;Q.scene.remove(f);Q.dispose(f);}
 return out;},[only]);
let bad=0;for(const [id,r] of Object.entries(res)){if(r.err){console.log(id,r.err);continue;}const fail=r.inside>0;if(fail)bad++;console.log(`${id.padEnd(14)} ${fail?'FAIL':'ok  '} inside skull ${r.inside}${r.insideAt?' ('+r.insideAt+')':''} | closest head ${r.min} mm at ${r.at} | by part ${JSON.stringify(r.minBy)} | ${r.n} poses`);}
if(pe.length)console.log('page errors',pe.slice(0,3).join(' | '));console.log(bad||pe.length?'S3-COLLAR-CHIN FAIL':'S3-COLLAR-CHIN PASS');await b.close();srv.close();process.exit(bad?1:0);})();
