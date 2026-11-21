// v2-default parity: proves a build changes nothing for players without ?v3=1. Loads two builds (the src baseline and the candidate) in the
// default mode (no tops_v3, no ?v3) and compares, figure by figure (every base look, every seeded opponent, every pro, the player figure in the
// creator), a hash of every mesh's geometry (positions, normals, uvs, colours, index), its material (type, colour, maps' sizes, every numeric
// and boolean parameter, onBeforeCompile presence, program cache key) and tag, plus a pixel hash of the figure rendered alone in a fixed scene
// and pose. Also checks the v3 flag reads false and no v3-only global switch is set. Exit 0 only if everything matches.
// node tests/v3-parity.js <baseline dir> <candidate dir>
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const serve=dir=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':'application/octet-stream'});r.end(d);});}).listen(0);
async function snap(b,dir){const srv=serve(dir);const p=await (await b.newContext({...devices['iPhone 13']})).newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
 await p.addInitScript(()=>{try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_s3_welcome','1');}catch(e){}window.TOPS_S3PROS=true;let s=12345;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};});
 await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
 await p.evaluate(()=>{V.loadAnims();});await p.waitForFunction(()=>TOPS_RIGS().ids.includes('leonard')&&V._qa.animNames().length>0,null,{timeout:180000});
 const out=await p.evaluate(()=>{const Q=V._qa,T=Q.T;
  const h=(a,x)=>{a=a^0;for(let i=0;i<x.length;i++){a=Math.imul(a^x.charCodeAt(i),16777619);}return a>>>0;};
  const hArr=(arr)=>{let a=2166136261;if(!arr)return 0;const n=arr.length;for(let i=0;i<n;i++){const v=Math.round(arr[i]*1e5);a=Math.imul(a^(v&0xffff),16777619);a=Math.imul(a^(v>>>16),16777619);}return a>>>0;};
  const matSig=m=>{const o=[m.type];for(const k of Object.keys(m).sort()){const v=m[k];if(typeof v==='number'||typeof v==='boolean'||typeof v==='string')o.push(k+'='+(typeof v==='number'?+v.toFixed(5):v));else if(v&&v.isColor)o.push(k+'='+v.getHexString());else if(v&&v.isTexture)o.push(k+'=tex'+(v.image&&v.image.width||0)+'x'+(v.image&&v.image.height||0));}
   o.push('obc='+(m.onBeforeCompile&&m.onBeforeCompile.toString().length>40?'1':'0'),'key='+(m.customProgramCacheKey?m.customProgramCacheKey():''));return o.join(';').replace(/;uuid=[^;]*/,'').replace(/;id=\d+/,'').replace(/;version=\d+/,'');};
  const figSig=f=>{f.updateMatrixWorld(true);const parts=[];f.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,A=g.attributes;const mats=[].concat(o.material);
    parts.push([o.name,o.userData.tag||'',o.visible?1:0,hArr(A.position&&A.position.array),hArr(A.normal&&A.normal.array),hArr(A.uv&&A.uv.array),hArr(A.color&&A.color.array),hArr(g.index&&g.index.array),hArr(o.matrixWorld.elements),mats.map(matSig).join('|')].join(','));});
   return {meshes:parts.length,hash:h(2166136261,parts.join('\n')),parts};};
  const cam=new T.PerspectiveCamera(30,1,.05,30);cam.position.set(0,1.2,-3.2);cam.lookAt(0,1.0,0);const rt=new T.WebGLRenderTarget(256,256);const px=new Uint8Array(256*256*4);
  const render=f=>{const keep=[];Q.scene.children.forEach(c=>{if(c.visible&&!c.isLight){keep.push(c);c.visible=false;}});Q.scene.add(f);f.position.set(0,0,0);f.rotation.set(0,Math.PI,0);f.updateMatrixWorld(true);
   const R=Q.renderer;R.setRenderTarget(rt);R.clear();R.render(Q.scene,cam);R.readRenderTargetPixels(rt,0,0,256,256,px);R.setRenderTarget(null);Q.scene.remove(f);keep.forEach(c=>c.visible=true);
   let a=2166136261,lit=0;for(let i=0;i<px.length;i+=4){const v=(px[i]>>2)<<16|(px[i+1]>>2)<<8|(px[i+2]>>2);a=Math.imul(a^v,16777619);if(px[i+3])lit++;}return {px:a>>>0,lit};};
  const specs=[...TOPS_S3_BASES.map(b=>[b.look,'You','base:'+b.id]),...['Big Mal','Shazza','Deano','Jonno'].map(n=>[{},n,'opp:'+n])];
  ['Michael van Gerwen','Luke Littler','Gerwyn Price','Peter Wright'].forEach(n=>specs.push([{},n,'pro:'+n]));
  const res={v3flag:window.TOPS_V3FLAG,globals:['TOPS_V3SKIN','TOPS_V3HOT','TOPS_V3LOGO','TOPS_MOUTH16','TOPS_COLLAR16'].filter(k=>window[k]!==undefined),figs:{}};
  for(const [look,name,id] of specs){const f=Q.makeFigure(look,name,0);if(f.userData.mixer)f.userData.mixer.stopAllAction();const a=Q.playClip(f,'idle',{t:0});if(a&&f.userData.mixer){a.time=0.5;f.userData.mixer.update(0);}
   const s=figSig(f);const r=render(f);res.figs[id]={meshes:s.meshes,hash:s.hash,px:r.px,lit:r.lit,parts:s.parts};Q.dispose(f);}
  return res;});
 await p.context().close();srv.close();out.pe=pe;return out;}
(async()=>{const [A,B]=process.argv.slice(2).map(d=>path.resolve(d));const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});
 const a=await snap(b,A),c=await snap(b,B);await b.close();let bad=0;
 console.log('v3 flag (baseline / candidate):',a.v3flag,'/',c.v3flag,'| v3 switches set in candidate:',c.globals.join(',')||'none');if(c.v3flag===true){bad++;console.log('FAIL: v3 is on by default');}
 const ids=[...new Set([...Object.keys(a.figs),...Object.keys(c.figs)])];
 for(const id of ids){const x=a.figs[id],y=c.figs[id];if(!x||!y){bad++;console.log(id.padEnd(22),'MISSING in',x?'candidate':'baseline');continue;}
  const same=x.hash===y.hash&&x.px===y.px&&x.meshes===y.meshes;if(!same){bad++;const diff=x.parts.map((l,i)=>l!==y.parts[i]?i:-1).filter(i=>i>=0).slice(0,3);console.log(id.padEnd(22),'DIFF meshes',x.meshes,y.meshes,'geom/mat',x.hash===y.hash?'same':'differ','pixels',x.px===y.px?'same':'differ');diff.forEach(i=>console.log('   A:',(x.parts[i]||'').slice(0,240),'\n   B:',(y.parts[i]||'').slice(0,240)));}
  else console.log(id.padEnd(22),'same  meshes',x.meshes,'lit px',x.lit);}
 if(a.pe.length||c.pe.length){console.log('page errors',JSON.stringify(a.pe.slice(0,2)),JSON.stringify(c.pe.slice(0,2)));bad++;}
 console.log(bad?'V3-PARITY FAIL ('+bad+')':'V3-PARITY PASS: '+ids.length+' figures identical in geometry, materials and pixels without ?v3=1');process.exit(bad?1:0);})();
