// Engine: renders s3/assets/creator/head_v3_<id>.png (node tests/v3-heads-render.js <built dir, forced v3> <outdir>)
// node heads.js <dir> <outdir> [ids]: the v3 creator head cards for Experience (exp-v3-heads-421b): 512x512 RGBA, transparent, front view,
// idle stance, each base's default look, head top ~12 px from the top, cut mid-torso, centred. Rendered on its own antialiased canvas with the main
// renderer's tone mapping / exposure / output encoding and the match figure light rig (the creator's generic env made the v3 skin pale), at 2x then
// downsampled. Writes <outdir>/head_v3_<id>.png
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]),out=process.argv[3],ids=(process.argv[4]||'kai,ray,tama,mia,dazza').split(',');fs.mkdirSync(out,{recursive:true});
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({viewport:{width:600,height:600}})).newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(()=>{try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_s3_welcome','1');localStorage.setItem('tops_v3','1');}catch(e){}});
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1&s3gloss=full`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>{V.loadAnims();});await p.waitForFunction(()=>V._qa.animNames().length>0,null,{timeout:120000});
const meta={};
for(const id of ids){const url=await p.evaluate(async(id)=>{const Q=V._qa,T=Q.T,R0=Q.renderer;
  const f=Q.makeFigure({s3:{base:id}},'You',0);if(!f.userData.s3rig||!f.userData.s3rig.v3)return {err:'not v3'};
  try{TOPS_V2LIGHT.setMode('match');}catch(e){}TOPS_V2LIGHT.relight(f);/* the match rig, as the face cam */
  if(f.userData.mixer)f.userData.mixer.stopAllAction();const a=Q.playClip(f,'idle',{t:0});if(a){a.time=0.6;f.userData.mixer.update(0);}f.updateMatrixWorld(true);try{TOPS_V2POST(f,null,true);}catch(e){}
  const sc=new T.Scene();sc.add(f);f.position.set(0,0,0);f.rotation.set(0,0,0);/* facing the board (-z) as in the match, so the match env rig lights the face; the camera goes to the front */f.updateMatrixWorld(true);/* face the camera (+z toward the camera after the turn) */
  /* framing: head top and the mid-torso from the real geometry */
  let sk=null;f.traverse(o=>{if(o.isMesh&&o.userData.tag==='skull'&&!sk)sk=o;});const bb=new T.Box3();f.traverse(o=>{if(o.isMesh&&o.visible&&!o.userData.dart&&o.geometry){o.geometry.computeBoundingBox();const b2=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);if(b2.max.y>1.0)bb.union(b2);}});
  const top=bb.max.y,B=f.userData.B;const chest=(B&&B.Spine1?B.Spine1.getWorldPosition(new T.Vector3()).y:top-0.9);const bottom=chest-0.06;/* cut at mid-torso */
  const S=1024,px12=24/* 12 px at 512 */,cy=(top+bottom)/2;const h=(top-bottom)/(1-2*px12/S*0)+0;/* world height that fills (S - top margin) */
  const fovY=22,dist=((top-bottom)*S/(S-px12))/2/Math.tan(fovY*Math.PI/360);const cam=new T.PerspectiveCamera(fovY,1,.05,30);
  const midY=bottom+((top-bottom)*S/(S-px12))/2;/* the frame spans bottom .. top + margin */const hc=sk?sk.getWorldPosition(new T.Vector3()):new T.Vector3(0,top-.3,0);
  cam.position.set(hc.x,midY,hc.z-dist);cam.lookAt(hc.x,midY,hc.z);
  if(f.userData.dt)f.userData.dt.visible=false;f.traverse(o=>{if(o.userData&&(o.userData.spare||o.userData.dart))o.visible=false;});/* no darts on the card */
  /* the MAIN renderer (its PMREM env maps live in its GL context), resized to SxS for two synchronous renders: on black and on white; alpha from the
     difference (the clear colour isn't tone mapped), colour = black render / alpha. State restored right after. */
  const sz=R0.getSize(new T.Vector2()),pr=R0.getPixelRatio(),cc=R0.getClearColor(new T.Color()),ca=R0.getClearAlpha(),st=R0.getScissorTest(),cv0=R0.domElement;
  const grab=bg=>{R0.setRenderTarget(null);R0.setScissorTest(false);R0.setViewport(0,0,S,S);R0.setClearColor(bg,1);R0.clear();R0.render(sc,cam);const c=document.createElement('canvas');c.width=S;c.height=S;c.getContext('2d').drawImage(cv0,0,0,S,S,0,0,S,S);return c.getContext('2d').getImageData(0,0,S,S).data;};
  R0.setPixelRatio(1);R0.setSize(S,S,false);let K,W;try{K=grab(0x000000);W=grab(0xffffff);}finally{R0.setPixelRatio(pr);R0.setSize(sz.x,sz.y,false);R0.setClearColor(cc,ca);R0.setScissorTest(st);}
  const big=document.createElement('canvas');big.width=S;big.height=S;const bx=big.getContext('2d'),im=bx.createImageData(S,S),o=im.data;
  for(let i=0;i<o.length;i+=4){const al=Math.max(0,Math.min(1,1-((W[i]-K[i])+(W[i+1]-K[i+1])+(W[i+2]-K[i+2]))/(3*255)));o[i+3]=Math.round(al*255);if(al>0.004){o[i]=Math.min(255,K[i]/al);o[i+1]=Math.min(255,K[i+1]/al);o[i+2]=Math.min(255,K[i+2]/al);}}
  bx.putImageData(im,0,0);/* frame from the real silhouette: head top 12 px (24 at 2x) from the top, centred on the head (the hair band), bottom cut kept */let ty2=-1;for(let y=0;y<S&&ty2<0;y++)for(let xx=0;xx<S;xx++)if(o[(y*S+xx)*4+3]>40){ty2=y;break;}let x0=S,x1=0;for(let y=ty2;y<Math.min(S,ty2+170);y++)for(let xx=0;xx<S;xx++)if(o[(y*S+xx)*4+3]>40){if(xx<x0)x0=xx;if(xx>x1)x1=xx;}
  const cs=Math.min(S,S-(ty2-24)),sy=Math.max(0,ty2-24),sx=Math.max(0,Math.min(S-cs,Math.round((x0+x1)/2-cs/2)));const c2=document.createElement('canvas');c2.width=512;c2.height=512;const x=c2.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(big,sx,sy,cs,cs,0,0,512,512);
  /* measured head-top margin */const d=x.getImageData(0,0,512,512).data;let ty=-1;for(let y=0;y<512&&ty<0;y++)for(let xx=0;xx<512;xx++)if(d[(y*512+xx)*4+3]>40){ty=y;break;}
  const res={png:c2.toDataURL('image/png'),topPx:ty,toneMapping:R0.toneMapping,exposure:R0.toneMappingExposure};Q.dispose(f);return res;},id);
 if(url.err){console.log(id,url.err);continue;}fs.writeFileSync(`${out}/head_v3_${id}.png`,Buffer.from(url.png.split(',')[1],'base64'));meta[id]={topPx:url.topPx,tm:url.toneMapping,exp:url.exposure};console.log(id,JSON.stringify(meta[id]));}
fs.writeFileSync(out+'/heads.json',JSON.stringify({meta,errors:pe.slice(0,3)},null,1));await b.close();srv.close();})();
