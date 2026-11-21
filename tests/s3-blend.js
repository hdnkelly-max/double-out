// v3 BLEND coverage (Producer 21 Nov 22:31): clearance and attachments THROUGH CLIP TRANSITIONS, sampled mid-crossfade. The other v3 checks
// (s3-v2-clear, s3-clip-game, s3-collar-chin) measure every clip on its own at full weight; this one plays the outgoing clip, starts the
// incoming one with the game's own cross-fade (playClip -> crossFadeTo, the fade lengths tc/core.js and the match use) and measures at blend
// weights .2 .4 .6 .8, from two points in the outgoing clip. Where a throw can overlap the fade (walk-on into the first throw, a celebration
// fading out while the arm resets) the throw phases are layered on top through poseFigure, as poseDarts sits on the mixer in a match.
// Every sample, as drawn (TOPS_V2POST then the shirt skin):
//   head  - no arm, sleeve, fist or finger vertex inside the skull (TOPS_S3HEADCLEAR)
//   darts - no spare in its arm or the shirt, the throwing dart clear of the skull and the hair (TOPS_S3DARTCLEAR)
//   clip  - the Lab clipCheck: pants, arm, cuff, collar, trim, head, fist, skull, dart (TOPS_S3CLIP)
//   collar- no collar stand / piping / flap vertex inside the skull (ray parity on the closed skull, as s3-collar-chin)
//   glasses - lens centres stay on the painted eyes (both are on the head bone: measured once per figure through a blend, must not drift)
// v3 only (?v3=1 forced): the v2 default is identical to 4.18 by construction (tests/v3-parity.js clip pass).
// node tests/s3-blend.js <dir> [ids]
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]),only=(process.argv[3]||'').split(',').filter(Boolean);
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':/\.webp$/.test(u)?'image/webp':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({...devices['iPhone 13']})).newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(()=>{window.TOPS_S3FLAG=true;try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_v2','1');localStorage.setItem('tops_v3','1');}catch(e){}});
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1&v3=1`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>{TOPS_LOADCHAR('leonard');V.loadAnims();});await p.waitForFunction(()=>TOPS_RIGS().ids.includes('leonard')&&V._qa.animNames().length>0,null,{timeout:180000});
const res=await p.evaluate(([only])=>{const Q=V._qa,T=Q.T;const clips=Q.animNames();
 const specs=[...TOPS_S3_BASES.map(b=>[b.look,'You',b.id]),[{},'Big Mal','opp:Big Mal'],[{},'Shazza','opp:Shazza'],[{},'Deano','opp:Deano']].filter(s=>!only.length||only.includes(s[2]));
 /* [name, from clip, to clip, fade s, to-clip once, throw phases layered on top] - fades as the game plays them */
 const TH=[['set',{phase:'idle'}],['pull.6',{phase:'pull',pull:.6}],['throw.3',{phase:'throw',k:.3}],['throw.6',{phase:'throw',k:.6}]];
 const RS=[['follow.5',{phase:'follow',k:.5}],['reset0',{phase:'reset',k:0}],['reset.5',{phase:'reset',k:.5}],['reset1',{phase:'reset',k:1}]];
 const TR=[['victory>idle','victory','idle',.5,false,null],/* the hero beat ending (tc walk end: fadeOut .4, idle fade .5) */
  ['walk>throw','walk','idle',.2,false,TH],/* walk-on arrival into the first throw */
  ['walk>pump','walk','pump',.2,true,null],/* walk-on arrival with an entrance effect */
  ['idle>cheer','idle','cheer',.2,true,null],['cheer>idle','cheer','idle',.5,false,null],/* the hero clip in and out */
  ['idle>celebrate','idle','pump',.2,true,null],['celebrate>idle','pump','idle',.6,false,null],/* the match celebration (tcCelebrate) */
  ['throw>reset','pump','idle',.6,false,RS],/* a celebration still fading out while the throwing arm follows through and resets */
  ['throw>celebrate','idle','pump',.2,true,[['throw.6',{phase:'throw',k:.6}],['fly.5',{phase:'fly',k:.5}],['follow.5',{phase:'follow',k:.5}]]]];
 const W=[.2,.4,.6,.8],ST=[.25,.6];
 const out={figs:0,samples:0,checks:0,skipped:[],fails:[],per:{},worst:{},dartSkull:{v:9,at:''},dartHair:{v:999,at:''},collar:{inside:0},glasses:{},weights:{}};
 const rc=new T.Raycaster(),v=new T.Vector3(),w3=new T.Vector3();
 for(const [look,name,id] of specs){const f=Q.makeFigure(look,name,0);if(!f.userData.s3rig||!f.userData.s3rig.v3){out.skipped.push(id+(f.userData.s3rig?' (v2 figure)':' (no s3 rig)'));Q.dispose(f);continue;}
  out.figs++;Q.scene.add(f);f.updateMatrixWorld(true);const tgt=f.localToWorld(new T.Vector3(0,1.73,-2.4));const mx=()=>f.userData.mixer;
  const Hd=f.userData.B&&f.userData.B.Head;const col=[];let skull=null;f.traverse(o=>{if(!o.isMesh)return;const t=o.userData.tag;if(t==='collar'||t==='pipe'||t==='fold')col.push(o);if(t==='skull'&&!skull)skull=o;});
  const skP=skull?new T.Mesh(skull.geometry,new T.MeshBasicMaterial({side:T.DoubleSide})):null;
  const lens=[];f.traverse(o=>{if(o.isMesh&&o.userData.tag==='lens')lens.push(o);});
  const lensAt=()=>{if(!lens.length||!skull)return null;const inv=new T.Matrix4().copy(skull.matrixWorld).invert(),s=[[0,0,0,0],[0,0,0,0]];lens.forEach(o=>{const a=o.geometry.attributes.position;for(let i=0;i<a.count;i+=3){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);const k=v.x<0?0:1;s[k][0]+=v.x;s[k][1]+=v.y;s[k][2]+=v.z;s[k][3]++;}});return s.map(c=>c[3]?[c[0]/c[3],c[1]/c[3],c[2]/c[3]]:null);};
  const ws=skull?new T.Vector3().setFromMatrixScale(skull.matrixWorld).x:1;let lens0=null,lensDrift=0;
  const fail=(where,msg)=>{out.fails.push(id+'/'+where+': '+msg);const k=msg.split(' ')[0];out.per[k]=(out.per[k]||0)+1;};
  const measure=(where,throwing)=>{f.updateMatrixWorld(true);out.samples++;
   const h=(TOPS_V2POST(f),TOPS_S3HEADCLEAR(f));out.checks+=h.checked;if(h.n)fail(where,`head ${h.n} verts ${h.mm.toFixed(1)} mm (${h.where})`);out.worst.head=Math.max(out.worst.head||0,h.mm);
   const d=TOPS_S3DARTCLEAR(f,{skull:throwing});out.checks+=d.checked;if(d.n)fail(where,`darts in ${d.where}, ${d.n} verts ${d.mm.toFixed(1)} mm`);if(d.tn)fail(where,`darts in the shirt ${d.tn} verts ${d.tmm.toFixed(1)} mm`);
   if(d.sn)fail(where,`dartskull ${d.sn} verts ${d.smm.toFixed(1)} mm`);if(d.hn)fail(where,`darthair ${d.hn} verts ${d.hmm.toFixed(1)} mm`);if(d.se<out.dartSkull.v)out.dartSkull={v:d.se,at:id+'/'+where};if(d.hc!=null&&d.hc<out.dartHair.v)out.dartHair={v:d.hc,at:id+'/'+where};
   const c=TOPS_S3CLIP(f);if(c){out.checks+=c.checked;for(const key of ['pants','arm','cuff','collar','trim','head','fist','skull','dart'])if(c[key])fail(where,`clip:${key} ${c[key]} ${(c.ex||[]).slice(0,2).join(' ')}`);for(const k in c.worst)out.worst['clip:'+k]=Math.min(out.worst['clip:'+k]??1,c.worst[k]);}
   f.updateMatrixWorld(true);if(skP&&col.length){skP.matrixWorld.copy(skull.matrixWorld);skP.matrixAutoUpdate=false;const sc=new T.Vector3();skull.getWorldPosition(sc);let ins=0;
    for(const o of col){const P=o.geometry.attributes.position;const st=Math.max(1,Math.floor(P.count/300));for(let i=0;i<P.count;i+=st){w3.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);if(w3.distanceTo(sc)>0.4)continue;rc.set(w3,w3.clone().sub(sc).normalize());if(rc.intersectObject(skP,false).length%2===1)ins++;}}
    out.checks+=1;if(ins){out.collar.inside+=ins;fail(where,`collar ${ins} verts inside the skull`);}}
   const L=lensAt();if(L){if(!lens0)lens0=L;else for(let s=0;s<2;s++)if(L[s]&&lens0[s])lensDrift=Math.max(lensDrift,Math.hypot(L[s][0]-lens0[s][0],L[s][1]-lens0[s][1],L[s][2]-lens0[s][2])*ws*1000);}};
  for(const [tn,A,B,F,once,layer] of TR){if(!clips.includes(A)||!clips.includes(B)){out.skipped.push(id+' '+tn+' (clip missing)');continue;}
   for(const st of ST)for(const wt of W)for(const [ln,oa] of (layer||[[null,null]])){
    if(mx())mx().stopAllAction();f.userData.act=null;const a=Q.playClip(f,A,{t:0});if(!a){out.skipped.push(id+' '+tn);continue;}a.time=a.getClip().duration*st;mx().update(0);
    const bb=Q.playClip(f,B,{fade:F,once});if(!bb)continue;mx().update(F*wt);/* mid-crossfade: the outgoing clip carries 1-wt, the incoming wt */
    const ew=+bb.getEffectiveWeight().toFixed(2);out.weights[tn]=out.weights[tn]||[];if(!out.weights[tn].includes(ew))out.weights[tn].push(ew);
    if(oa)Q.poseFigure(f,oa,tgt);measure(tn+'@'+st+'/w'+wt+(ln?'+'+ln:''),!!(ln&&/^throw|^fly|^follow/.test(ln)));}}
  if(lens.length)out.glasses[id]=+lensDrift.toFixed(2);
  Q.scene.remove(f);Q.dispose(f);}
 /* glasses: every base wearing glasses, through one blend (they ride the head bone, so the lens-to-eye distance must not drift) */
 for(const bs of TOPS_S3_BASES){if(only.length&&!only.includes(bs.id))continue;const f=Q.makeFigure({s3:{base:bs.id,glasses:true}},'Glasses '+bs.id,0);if(!f.userData.s3rig||!f.userData.s3rig.v3){Q.dispose(f);continue;}Q.scene.add(f);
  let sk=null;const gs=[];f.traverse(o=>{if(o.isMesh&&o.userData.tag==='skull'&&!sk)sk=o;if(o.isMesh&&o.userData.tag==='lens')gs.push(o);});if(!sk||!gs.length){out.glasses[bs.id]='no '+(sk?'lenses':'skull');Q.scene.remove(f);Q.dispose(f);continue;}
  const eyeD=()=>{f.updateMatrixWorld(true);const inv=new T.Matrix4().copy(sk.matrixWorld).invert(),ws=new T.Vector3().setFromMatrixScale(sk.matrixWorld).x,s=[[0,0,0,0],[0,0,0,0]];gs.forEach(o=>{const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);const k=v.x<0?0:1;s[k][0]+=v.x;s[k][1]+=v.y;s[k][2]+=v.z;s[k][3]++;}});
   return Math.max(...[-1,1].map((sg,i)=>{const e=(sk.userData.eyeAt||TOPS_V2EYE)(sg),c=s[i];return c[3]?Math.hypot(c[0]/c[3]-e.x,c[1]/c[3]-e.y)*ws*1000:999;}));};
  let mxd=0;for(const wt of W){if(f.userData.mixer)f.userData.mixer.stopAllAction();f.userData.act=null;const a=Q.playClip(f,'victory',{t:0});if(!a)break;f.userData.mixer.update(0);Q.playClip(f,'idle',{fade:.5});f.userData.mixer.update(.5*wt);TOPS_V2POST(f);mxd=Math.max(mxd,eyeD());}
  out.glasses['eyes:'+bs.id]=+mxd.toFixed(1);if(mxd>20)out.fails.push('glasses:'+bs.id+' lens '+mxd.toFixed(1)+' mm off the eye mid-blend');Q.scene.remove(f);Q.dispose(f);}
 out.nf=out.fails.length;out.fails=out.fails.slice(0,40);out.worst=Object.fromEntries(Object.entries(out.worst).map(([k,x])=>[k,+x.toFixed(3)]));out.dartSkull.v=+out.dartSkull.v.toFixed(3);out.dartHair.v=+(+out.dartHair.v).toFixed(1);out.transitions=TR.map(t=>t[0]);return out;},[only]);
console.log(JSON.stringify(res));if(pe.length)console.log('page errors',JSON.stringify(pe.slice(0,3)));
const bad=res.nf||pe.length||!res.samples||res.figs<(only.length?1:5)/* the five bases are v3; seeded opponents are measured when they build as v3 */;
console.log(bad?'S3-BLEND FAIL ('+res.nf+' failures)':'S3-BLEND PASS ('+res.figs+' v3 figures, '+res.transitions.length+' transitions x 4 blend weights x 2 start points (+ layered throw phases) = '+res.samples+' mid-crossfade samples, '+res.checks+' checks: 0 head penetration, 0 darts in arms/shirt, 0 clip pokes, 0 collar in the skull; throwing dart closest to the skull '+res.dartSkull.v+' at '+res.dartSkull.at+', to the hair '+res.dartHair.v+' mm at '+res.dartHair.at+'; glasses on the eyes mid-blend: '+Object.entries(res.glasses).filter(([k])=>/^eyes:/.test(k)).map(([k,x])=>k.slice(5)+' '+x+' mm').join(', ')+')');
await b.close();srv.close();process.exit(bad?1:0);})();
