// Vinyl v2.2 head clearance, IN THE GAME (Director's claude/director/vinyl2/v2-clear.js, on the game rig): with the 2x head, no arm, sleeve,
// fist or finger vertex may sit inside the skull ellipsoid (radii x1.04). Every base + three seeded opponents, through the game's own throw
// (poseDarts: set, pull, throw, fly, follow, reset), the celebrate / shush poses and every match clip. Also measures Ray's glasses against
// the painted eyes (pass: lens centre within 20 mm of the eye centre, every base given glasses).
// node tests/s3-v2-clear.js <dir>   (<dir> = the built page as index.html + assets/ + rig/)
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]);const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':/\.webp$/.test(u)?'image/webp':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
const reqs=[];p.on('request',r=>reqs.push(r.url()));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(()=>{window.TOPS_S3FLAG=true;try{localStorage.setItem('tops_s3','1');}catch(e){}});
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>{V.loadAnims();});await p.waitForFunction(()=>TOPS_RIGS().ids.includes('leonard')&&V._qa.animNames().length>0,null,{timeout:180000});
const res=await p.evaluate(()=>{const Q=V._qa,T=Q.T;const specs=[...TOPS_S3_BASES.map(b=>[b.look,'You',b.id]),[{},'Big Mal','opp:Big Mal'],[{},'Shazza','opp:Shazza'],[{},'Deano','opp:Deano']];
 const poses=[['set',{phase:'idle'}]];[0,.3,.6,1,1.3].forEach(v=>poses.push(['pull'+v,{phase:'pull',pull:v}]));[0,.25,.5,.75,1].forEach(v=>{poses.push(['throw'+v,{phase:'throw',k:v}]);poses.push(['fly'+v,{phase:'fly',k:v}]);poses.push(['follow'+v,{phase:'follow',k:v}]);poses.push(['reset'+v,{phase:'reset',k:v}]);});
 poses.push(['celebrate',{celebrate:true}],['shush',{shush:true}]);
 const clips=Q.animNames();const per={},fails=[];let n=0,figs=0;const worst={};
 const rec=(id,what,r)=>{n+=r.checked;const k=what.replace(/[\d.]+$/,'');per[k]=Math.max(per[k]||0,r.mm);if(r.n){fails.push(`${id}/${what}: ${r.n} verts, ${r.mm.toFixed(1)} mm (${r.where})`);}worst[id]=Math.max(worst[id]||0,r.mm);};
 for(const [look,name,id] of specs){const f=Q.makeFigure(look,name,0);if(!f.userData.s3rig||!f.userData.s3rig.v2){fails.push(id+': not a v2 figure');continue;}figs++;Q.scene.add(f);f.updateMatrixWorld(true);const tgt=f.localToWorld(new T.Vector3(0,1.73,-2.4));
  for(const [nm,oa] of poses){if(f.userData.mixer)f.userData.mixer.stopAllAction();f.userData.act=null;const a=Q.playClip(f,'idle',{t:0});if(a&&f.userData.mixer)f.userData.mixer.update(0);Q.poseFigure(f,oa,tgt);f.updateMatrixWorld(true);rec(id,nm,(TOPS_V2POST(f),TOPS_S3HEADCLEAR(f)));}
  for(const c of clips){if(f.userData.mixer)f.userData.mixer.stopAllAction();f.userData.act=null;/* no cross-fade: each clip is measured on its own at full weight */const a=Q.playClip(f,c,{t:0});if(!a)continue;const dur=a.getClip().duration;for(const k of [0,.1,.2,.3,.4,.5,.6,.7,.8,.9]){a.time=dur*k;f.userData.mixer.update(0);rec(id,'clip:'+c,(TOPS_V2POST(f),TOPS_S3HEADCLEAR(f)));}}
  Q.scene.remove(f);Q.dispose(f);}
 /* glasses on the painted eyes: every base with glasses on */
 const gl=[];for(const bs of TOPS_S3_BASES){const f=Q.makeFigure({s3:{base:bs.id,glasses:true}},'Glasses '+bs.id,0);let sk=null,gs=[];f.updateMatrixWorld(true);f.traverse(o=>{if(o.isMesh&&o.userData.tag==='skull'&&!sk)sk=o;if(o.isMesh&&o.userData.tag==='lens')gs.push(o);});
  if(!sk||!gs.length){gl.push({id:bs.id,err:'no '+(sk?'lenses':'skull')});Q.dispose(f);continue;}const ws=new T.Vector3().setFromMatrixScale(sk.matrixWorld).x;const inv=new T.Matrix4().copy(sk.matrixWorld).invert();
  /* the lenses may be merged into one mesh: each lens centre = the mean of the rim vertices on its side of the face, in skull space */
  const side=[[0,0,0,0],[0,0,0,0]],v=new T.Vector3();gs.forEach(o=>{const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);const k=v.x<0?0:1;side[k][0]+=v.x;side[k][1]+=v.y;side[k][2]+=v.z;side[k][3]++;}});
  const d=[-1,1].map((s,i)=>{const e=TOPS_V2EYE(s),c=side[i];if(!c[3])return 999;return Math.hypot(c[0]/c[3]-e.x,c[1]/c[3]-e.y)*ws*1000;});gl.push({id:bs.id,mm:d.map(v=>+v.toFixed(1))});Q.dispose(f);}
 return {figs,poses:poses.length,clips:clips.length,n,per:Object.fromEntries(Object.entries(per).map(([k,v])=>[k,+v.toFixed(1)])),worst:Object.fromEntries(Object.entries(worst).map(([k,v])=>[k,+v.toFixed(1)])),nf:fails.length,fails:fails.slice(0,30),glasses:gl};});
console.log(JSON.stringify(res));const remy=reqs.filter(u=>/rig\/remy-/.test(u));console.log('remy fetches:',remy.length);
if(pe.length)console.log('page errors',JSON.stringify(pe.slice(0,3)));const gbad=res.glasses.some(g=>g.err||g.mm.some(v=>v>20));
const bad=res.nf||pe.length||!res.n||res.figs<8||gbad||remy.length;console.log(bad?'S3-V2-CLEAR FAIL':'S3-V2-CLEAR PASS ('+res.figs+' figures, '+res.poses+' poses + '+res.clips+' clips, '+res.n+' checks, 0 head penetration; glasses '+res.glasses.map(g=>g.id+' '+Math.max(...g.mm)+'mm').join(', ')+'; remy fetched 0 times)');await b.close();srv.close();process.exit(bad?1:0);})();
