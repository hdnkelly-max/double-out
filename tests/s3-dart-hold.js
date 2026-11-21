// Dart hold (doc 52 r19 hands): while the dart is held (aim, pull 0-1.3, throw up to the release), is it still pinched between the thumb pad and the
// index finger, and does no finger sink into the barrel? For every v3 base, at the match place, r19 hands ON and OFF (TOPS_HANDS19=0):
//   thumb gap / index gap = distance from the thumb tip / index middle segment surface to the barrel surface (mm, should stay small: holding);
//   finger gap = the closest skinned finger vertex to the barrel surface (mm, negative = inside the barrel).
// Pass (comparative, against the shipped old hands, which Q&D approved in doc 41): r19's worst thumb and index gaps no more than 6 mm larger, and its
// deepest finger no more than 2 mm deeper into the barrel. Gaps are bone-line to barrel-surface, so absolute values include the finger radius.
// node tests/s3-dart-hold.js <build dir (forced v3)> [ids]
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]),only=(process.argv[3]||'').split(',').filter(Boolean);
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const out={};let pe=[];
for(const H19 of [1,0]){const p=await (await b.newContext({...devices['iPhone 13']})).newPage();p.on('pageerror',e=>pe.push(e.message));
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(h=>{try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_v3','1');}catch(e){}if(!h)window.TOPS_HANDS19=0;},H19);
 await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
 await p.evaluate(()=>{V.loadAnims();});await p.waitForFunction(()=>V._qa.animNames().length>0,null,{timeout:180000});
 out[H19?'r19':'old']=await p.evaluate(only=>{const Q=V._qa,T=Q.T;const boardC=new T.Vector3(0,1.73,0.045);const res={};
  for(const bs of TOPS_S3_BASES){if(only.length&&!only.includes(bs.id))continue;const f=Q.makeFigure(bs.look,'You',0);Q.scene.add(f);f.position.set(0.1,0,2.37-0.51);f.rotation.set(0,0.8,0);
   const u=f.userData,B=u.B;let fing=null;f.traverse(o=>{if(o.name==='v2fingers')fing=o;});const R={thumb:0,index:0,finger:99,poses:0,worst:''};
   const meas=where=>{f.updateMatrixWorld(true);const dt=u.dt;if(!dt||!dt.visible)return;R.poses++;
    const vs=[];dt.traverse(o=>{if(o.isMesh){const P=o.geometry.attributes.position;for(let i=0;i<P.count;i+=2)vs.push(new T.Vector3().fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld));}});
    const c=vs.reduce((a,v)=>a.add(v),new T.Vector3()).divideScalar(vs.length);let ax=new T.Vector3(),far=0;for(const v of vs){const d=v.distanceTo(c);if(d>far){far=d;ax.copy(v).sub(c);}}ax.normalize();
    let t0=1e9,t1=-1e9;const rads=[];for(const v of vs){const t=v.clone().sub(c).dot(ax);t0=Math.min(t0,t);t1=Math.max(t1,t);}
    for(const v of vs){const t=v.clone().sub(c).dot(ax);if(Math.abs(t)<(t1-t0)*0.15)rads.push(v.clone().sub(c).addScaledVector(ax,-t).length());}rads.sort((a,b)=>a-b);const rb=rads.length?rads[Math.floor(rads.length*0.9)]:0.006;
    const A=c.clone().addScaledVector(ax,t0),Bp=c.clone().addScaledVector(ax,t1);const dAxis=P=>{const q=Bp.clone().sub(A);const t=Math.max(0,Math.min(1,P.clone().sub(A).dot(q)/q.lengthSq()));return A.clone().addScaledVector(q,t).distanceTo(P);};
    const wp=n=>B[n]?B[n].getWorldPosition(new T.Vector3()):null;
    const segD=(n0,n1)=>{const a=wp(n0),b_=wp(n1)||a;if(!a)return 99;let m=99;for(let k=0;k<=8;k++)m=Math.min(m,dAxis(a.clone().lerp(b_,k/8)));return m;};
    const fr=(fing&&fing.userData.r)||0;
    const th=segD('RightHandThumb3','RightHandThumb4')-rb,ix=segD('RightHandIndex2','RightHandIndex3')-rb;
    let fg=99;if(fing&&fing.isSkinnedMesh){const P=fing.geometry.attributes.position,v=new T.Vector3();for(let i=0;i<P.count;i+=3){fing.boneTransform(i,v);v.applyMatrix4(fing.matrixWorld);fg=Math.min(fg,dAxis(v)-rb);}}
    R.thumb=Math.max(R.thumb,th*1000);R.index=Math.max(R.index,ix*1000);if(fg*1000<R.finger){R.finger=fg*1000;R.worst=where;}R.thumbAt=R.thumbAt||'';if(th*1000>=R.thumb)R.thumbAt=where;};
   const idle=Q.playClip(f,'idle',{t:0});
   for(const [ph,ks] of [['idle',[0]],['pull',[0,.25,.5,.75,1,1.3]],['throw',[0,.2,.4,.6,.75]]])for(const k of ks){if(u.mixer){u.mixer.stopAllAction();const a=Q.playClip(f,'idle',{t:0});if(a){a.time=0.3;u.mixer.update(0);}}f.updateMatrixWorld(true);
     Q.poseFigure(f,ph==='idle'?{phase:'idle'}:ph==='pull'?{phase:'pull',pull:k}:{phase:'throw',k},boardC);meas(ph+k);}
   for(const k of ['thumb','index','finger'])R[k]=+R[k].toFixed(1);res[bs.id]=R;Q.scene.remove(f);Q.dispose(f);}
  return res;},only);await p.context().close();}
await b.close();srv.close();let bad=0;
for(const id of Object.keys(out.r19)){const a=out.r19[id],o=out.old[id]||{};const ok=a.thumb<=o.thumb+6&&a.index<=o.index+6&&a.finger>=o.finger-2;/* comparative: the shipped grip (old hands, Q&D-approved, doc 41) is the reference; r19 may not loosen the pinch by more than 6 mm or sink a finger 2 mm deeper */if(!ok)bad++;
 console.log(`${id.padEnd(6)} ${ok?'ok  ':'FAIL'} r19: thumb gap ${a.thumb} mm (${a.thumbAt}), index gap ${a.index} mm, closest finger ${a.finger} mm (${a.worst}) | old hands: thumb ${o.thumb}, index ${o.index}, finger ${o.finger} | ${a.poses} held poses`);}
if(pe.length){console.log('page errors',pe.slice(0,3).join(' | '));bad++;}console.log(bad?'S3-DART-HOLD FAIL':'S3-DART-HOLD PASS');process.exit(bad?1:0);})();
