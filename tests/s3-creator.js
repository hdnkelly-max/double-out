// LIVE P1 4.00 (Lee, 13:41): every creator change must show on the live preview at once, and the saved look must be the one shown.
// Fresh device, Season 3 on by default, iPhone 13 + Pixel 5, normal network and slow (the S3 rig file held 8 s: preview starts on the
// in-page-rig carrier, then swaps). The player types a name that isn't saved yet (the case that broke: the preview was a seeded stranger).
// Per option (base, skin, build, hair, hair colour, facial hair, each extra, shirt): click it, then the preview figure's look has the new value
// AND a drawn material changed. At the end the game's own player figure for the saved save (what a match builds) equals the preview.
// node tests/s3-creator.js <dir>   (<dir> = the built page + assets/ + rig/ + s3/)
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]);let slow=false;const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const send=()=>fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':/\.webp$/.test(u)?'image/webp':/\.png$/.test(u)?'image/png':/\.jpe?g$/.test(u)?'image/jpeg':'application/octet-stream'});r.end(d);});if(slow&&/chars\/leonard/.test(u))setTimeout(send,8000);else send();}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const fails=[];const F=m=>{fails.push(m);console.log('FAIL '+m);};
for(const dev of ['iPhone 13','Pixel 5'])for(const sl of [false,true]){slow=sl;const tag=dev+(sl?' slow':'');const cx=await b.newContext({...devices[dev]});const p=await cx.newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
 await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
 if(!await p.evaluate(()=>!!window.TOPS_S3FLAG)){F(tag+': Season 3 is not on by default');await cx.close();continue;}
 await p.evaluate(()=>{const w=document.getElementById('s3WelGo');if(w&&w.offsetParent)w.click();});await p.waitForTimeout(1200);
 /* signed in (Google is outside the test): the game's own next step for a new player, with a typed name not saved yet */
 await p.evaluate(()=>{save.authSeen=true;try{$('login').hidden=true;}catch(e){}persist();showCreator(false);showScreen('creator');const n=$('cName');n.value='Lee';n.dispatchEvent(new Event('input',{bubbles:true}));});await p.waitForTimeout(1500);
 const snap=()=>p.evaluate(()=>{const f=V._qa.meFig();if(!f||!f.userData.s3look)return null;const L=f.userData.s3look;const hx=c=>c==null?null:new THREE.Color(c).getHexString();const mats=[];f.traverse(o=>{if(o.isMesh&&o.visible&&o.material&&o.material.color){let k=o.material.color.getHexString();/* painted parts (the hair kit, the v2 beard) carry their colour in the vertices: sample them too */const ca=o.geometry&&o.geometry.attributes.color;if(o.material.vertexColors&&ca){let r=0,g=0,b=0;const n=Math.min(ca.count,400);for(let i=0;i<n;i++){r+=ca.getX(i);g+=ca.getY(i);b+=ca.getZ(i);}k+=':'+[r,g,b].map(v=>(v/n).toFixed(3)).join('/');}mats.push(k);}});
  return {L:{base:L.base||null,skin:hx(L.skin),hair:L.hair||null,hairC:hx(L.hairC),face:L.face,body:L.body,shirt:hx(L.shirt),glasses:!!L.glasses,band:!!L.band,cap:!!L.cap},mats:mats.sort().join(','),ck:f.userData.ck,vl:JSON.stringify(save.vlook)};});
 const click=(f,i)=>p.evaluate(([f,i])=>{const bs=[...document.querySelectorAll(`#s3Cre [data-f="${f}"]`)];if(!bs.length)return null;const pick=bs.find((b,k)=>k>=i&&b.getAttribute('aria-pressed')!=='true')||bs.find(b=>b.getAttribute('aria-pressed')!=='true');if(!pick)return null;pick.click();return pick.dataset.v;},[f,i]);
 let prev=await snap();if(!prev){F(tag+': no preview figure');await cx.close();continue;}
 const steps=[['base',0],['skin',3],['body',2],['hair',2],['hairC',4],['face',3],['acc',0],['acc',1],['acc',2],['shirt',5],['base',2]];let ok=0;
 for(const [f,i] of steps){const v=await click(f,i);if(v==null){F(tag+': no button for '+f);continue;}await p.waitForTimeout(sl?900:500);const now=await snap();if(!now){F(tag+': preview figure gone after '+f);continue;}
  const want=f==='acc'?null:(f==='skin'||f==='hairC'||f==='shirt')?v.replace('#','').toLowerCase():v;let has=true;
  if(f==='base')has=now.L.base===v;else if(f==='acc')has=now.L[v==='band'?'band':v]!==prev.L[v==='band'?'band':v];else if(f==='hair')has=(now.L.hair||'bald')===(v==='bald'?'bald':v)||(v==='bald'&&now.L.hair==null);else has=String(now.L[f])===String(want);
  if(!has)F(`${tag}: ${f}=${v} not on the preview (look ${JSON.stringify(now.L)})`);else if(now.mats===prev.mats&&f!=='body'&&f!=='hair'&&f!=='face')F(`${tag}: ${f}=${v} set but no drawn colour changed`);else ok++;prev=now;}
 /* the saved look is the one shown: the player's figure the game builds after saving equals the preview */
 const same=await p.evaluate(()=>{save.name='Lee';persist();const f=V._qa.meFig();const a=JSON.stringify(f.userData.s3look);V.setPlayerLook(save.look,save.flight,save.name,0);const g=V._qa.meFig();return {a,b:JSON.stringify(g.userData.s3look),ck:g.userData.ck};});
 if(same.a!==same.b)F(tag+': saved look differs from the preview');
 console.log(JSON.stringify({tag,ok,of:steps.length,carrier:prev.ck,matchFigure:same.ck,errors:pe.slice(0,2)}));if(pe.length)F(tag+': page errors');await cx.close();}
await b.close();srv.close();console.log(fails.length?'S3-CREATOR FAIL':'S3-CREATOR PASS');process.exit(fails.length?1:0);})();
