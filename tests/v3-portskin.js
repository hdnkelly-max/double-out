// r8c (ChatGPT): node tests/v3-portskin.js <dir forced v3> <outdir> [bases] [ks]: the v3 portrait (headshot) at skin-light trims k vs a FRONT-FACING IN-MATCH render
// (the same figure under the match light rig, drawn by the main renderer to the screen, the camera placed at the portrait's pose relative to the head bone)
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]),out=process.argv[3],bases=(process.argv[4]||'kai,ray,tama,mia,dazza').split(','),KS=(process.argv[5]||'1,0.9,0.87,0.85').split(',').map(Number);fs.mkdirSync(out,{recursive:true});
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({viewport:{width:600,height:700}})).newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(()=>{try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_s3_welcome','1');localStorage.setItem('tops_v3','1');}catch(e){}window.__SHOTREF=true;});
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1&s3gloss=full`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>{V.loadAnims();});await p.waitForFunction(()=>V._qa.animNames().length>0,null,{timeout:180000});
const res={};
for(const base of bases){const r=await p.evaluate(async([base,KS])=>{const Q=V._qa,T=Q.T,R0=Q.renderer;const toURL=(d,W,H,flip)=>{const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(d),W,H),0,0);return c.toDataURL('image/png');};
  const o={ports:{}};let ref=null;
  for(const k of KS){window.TOPS_PORTSK=k;window.__shotRefs=[];const u=V.portrait({s3:{base}},'P'+k+base,0,0);const rr=window.__shotRefs[window.__shotRefs.length-1];if(!ref&&rr&&rr.cam)ref=rr;o.ports[k]=u;}
  delete window.TOPS_PORTSK;if(!ref)return {err:'no ref cam'};
  /* the in-match front render */const f=Q.makeFigure({s3:{base}},'M'+base,0);try{TOPS_V2LIGHT.setMode('match');}catch(e){}TOPS_V2LIGHT.relight(f);if(f.userData.mixer)f.userData.mixer.stopAllAction();const a=Q.playClip(f,'idle',{t:0});if(a){a.time=0.6;f.userData.mixer.update(0);}
  const sc=new T.Scene();sc.add(f);f.position.set(0,0,0);f.rotation.set(0,0,0);f.updateMatrixWorld(true);try{TOPS_V2POST(f,null,true);}catch(e){}f.traverse(q=>{if(q.userData&&(q.userData.spare||q.userData.dart))q.visible=false;});if(f.userData.dt)f.userData.dt.visible=false;f.updateMatrixWorld(true);
  const Hp=new T.Matrix4().fromArray(ref.head),Cp=new T.Matrix4().fromArray(ref.cam),Hm=f.userData.B.Head.matrixWorld.clone();const Cm=Hm.clone().multiply(Hp.clone().invert()).multiply(Cp);
  const cam=new T.PerspectiveCamera(ref.fov,1,.05,10);Cm.decompose(cam.position,cam.quaternion,cam.scale);cam.scale.set(1,1,1);cam.updateMatrixWorld(true);
  const W=ref.W,H=ref.H,sz=R0.getSize(new T.Vector2()),pr=R0.getPixelRatio(),cc=R0.getClearColor(new T.Color()),ca=R0.getClearAlpha(),st=R0.getScissorTest();let M;
  R0.setPixelRatio(1);R0.setSize(W,H,false);try{R0.setRenderTarget(null);R0.setScissorTest(false);R0.setViewport(0,0,W,H);R0.setClearColor(0x12161c,1);R0.clear();R0.render(sc,cam);const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(R0.domElement,0,0,W,H,0,0,W,H);M=c.toDataURL('image/png');}finally{R0.setPixelRatio(pr);R0.setSize(sz.x,sz.y,false);R0.setClearColor(cc,ca);R0.setScissorTest(st);}
  /* landmark patches: skull vertices facing the camera, by direction from the skull centre in camera space; the same pixels are the same surface in the portrait (camera fixed to the head bone) */
  {let sk=null;f.traverse(q=>{if(q.isMesh&&q.userData.tag==='skull'&&!sk)sk=q;});const G=sk.geometry,Pa=G.attributes.position,Na=G.attributes.normal;sk.updateMatrixWorld(true);const bb=new T.Box3().setFromBufferAttribute(Pa);const ctr=bb.getCenter(new T.Vector3()).applyMatrix4(sk.matrixWorld).applyMatrix4(cam.matrixWorldInverse);
   const nm=new T.Matrix3().getNormalMatrix(new T.Matrix4().multiplyMatrices(cam.matrixWorldInverse,sk.matrixWorld)),v=new T.Vector3(),n=new T.Vector3(),pts={forehead:[],cheek:[],jaw:[]};
   const PB=window.__PB||{forehead:[[-.2,.2],[.24,.36]],cheek:[[.55,.75],[-.4,-.22]],jaw:[[.46,.7],[-.64,-.42]]};
   for(let i=0;i<Pa.count;i++){v.fromBufferAttribute(Pa,i).applyMatrix4(sk.matrixWorld).applyMatrix4(cam.matrixWorldInverse);n.fromBufferAttribute(Na,i).applyMatrix3(nm).normalize();if(n.z<0.35)continue;const d=v.clone().sub(ctr).normalize();
    for(const [k,[xr,yr]] of Object.entries(PB)){const ax=k==='forehead'?d.x:Math.abs(d.x);if(ax>=xr[0]&&ax<=xr[1]&&d.y>=yr[0]&&d.y<=yr[1]){const q=v.clone().applyMatrix4(cam.projectionMatrix);pts[k].push([Math.round((q.x+1)/2*W),Math.round((1-q.y)/2*H)]);}}}
   o.pts=pts;}
  o.match=M;o.W=W;Q.dispose(f);return o;},[base,KS]);
 if(r.err){console.log(base,r.err);continue;}
 const sv=(u,n)=>fs.writeFileSync(`${out}/${base}_${n}.${u.startsWith('data:image/png')?'png':'jpg'}`,Buffer.from(u.split(',')[1],'base64'));sv(r.match,'match');for(const [k,u] of Object.entries(r.ports))sv(u,'k'+k);fs.writeFileSync(out+'/'+base+'_pts.json',JSON.stringify(r.pts));console.log(base,'ok',r.W,Object.entries(r.pts).map(([k,a])=>k+':'+a.length).join(' '));}
fs.writeFileSync(out+'/pe.json',JSON.stringify(pe.slice(0,3)));await b.close();srv.close();})();
