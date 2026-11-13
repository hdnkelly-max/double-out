const fs=require('fs');
const eng=fs.readFileSync('engine.js','utf8'),g=fs.readFileSync('game4.js','utf8').replace('ENGINE',()=>eng);
const head=fs.readFileSync('head3.html','utf8'),body=fs.readFileSync('body4.html','utf8');
const BUILD=String(Date.now());
/* update check (ENG-RIGCACHE): it used to download the whole page (6.5 MB, no-store) on every launch and every fresh start between matches,
   just to read TOPS_BUILD. It now reads the release's version.json (a few bytes) and compares it with TOPS_VER; newer -> reload once. */
const upd=`<script>window.TOPS_BUILD="${BUILD}";(function(){try{if(location.protocol==='file:')return;var q=new URLSearchParams(location.search);
function n(v){return String(v||'').split('.').map(function(x){return +x||0;});}function newer(a,b){a=n(a);b=n(b);for(var i=0;i<Math.max(a.length,b.length);i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)>(b[i]||0);}return false;}
fetch('version.json?cb='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){var v=j&&j.v,cur=window.TOPS_VER;if(!v||!cur||!newer(v,cur))return;var k='tops-upd-'+v;if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1');if(window.S&&S&&!S.done)return;q.set('v',v);location.replace(location.pathname+'?'+q.toString());}).catch(function(){});}catch(e){}})();</script>\n`;
const NM='node_modules/three/examples/js/';
const exr=fs.readFileSync(NM+'libs/fflate.min.js','utf8')+';\n'+fs.readFileSync(NM+'loaders/EXRLoader.js','utf8');
const envB64=n=>fs.readFileSync('env/'+n+'.exr.js','utf8').split('base64,')[1].split("'")[0];
const mo=fs.readFileSync(NM+'libs/meshopt_decoder.js','utf8');
const envs=`<script>${exr}</script>\n<script>${mo}\n;(function(){const G=THREE.GLTFLoader;if(!G)return;THREE.GLTFLoader=function(m){const l=new G(m);if(window.MeshoptDecoder)l.setMeshoptDecoder(MeshoptDecoder);return l;};THREE.GLTFLoader.prototype=G.prototype;})();window.TOPS_ASSETS=(Math.min(screen.width,screen.height)<700)?'assets/m/':'assets/';</script>\n<script>window.TOPS_ENV=${JSON.stringify({pub:envB64('apartment'),club:envB64('lobby'),stage:envB64('hall')})};</script>\n`;
const c3=fs.readFileSync('career3.js','utf8');
const v3=fs.existsSync('v03.js')?fs.readFileSync('v03.js','utf8'):'';
const v4=fs.existsSync('v04.js')?fs.readFileSync('v04.js','utf8'):'';
const v41=fs.existsSync('v041.js')?fs.readFileSync('v041.js','utf8'):'';
const v5=fs.existsSync('v05.js')?fs.readFileSync('v05.js','utf8'):'';
const v51=fs.existsSync('v051.js')?fs.readFileSync('v051.js','utf8'):'';
const v6=fs.existsSync('v06.js')?fs.readFileSync('v06.js','utf8'):'';
const v7=fs.existsSync('v07.js')?fs.readFileSync('v07.js','utf8'):'';
const v8=fs.existsSync('v08.js')?fs.readFileSync('v08.js','utf8'):'';
const v9=fs.existsSync('v09.js')?fs.readFileSync('v09.js','utf8'):'';
const v10=fs.existsSync('v10.js')?fs.readFileSync('v10.js','utf8'):'';
const v11=fs.existsSync('v11.js')?fs.readFileSync('v11.js','utf8'):'';
const v12=fs.existsSync('v12.js')?fs.readFileSync('v12.js','utf8'):'';
const v13=fs.existsSync('v13.js')?fs.readFileSync('v13.js','utf8'):'';
const v14=fs.existsSync('v14.js')?fs.readFileSync('v14.js','utf8'):'';
const v15=fs.existsSync('v15.js')?fs.readFileSync('v15.js','utf8'):'';/* CAR-S career backup + confirm */
const v16=fs.existsSync('v16.js')?fs.readFileSync('v16.js','utf8'):'';/* ENG-RESET fresh page between matches */
const dg=fs.existsSync('dartgeo.json')?`<script>window.TOPS_DG_RAW=${fs.readFileSync('dartgeo.json','utf8')}</script>\n`:'';
// collectibles (cards, packs, cabinet, exhibitions): tc/
const tcf=n=>fs.existsSync('tc/'+n)?fs.readFileSync('tc/'+n,'utf8'):'';
const tc=tcf('core.js')?`<style>${tcf('cards.css')}\n${tcf('tc.css')}</style>\n<script>${tcf('cards.js')}\n${tcf('data.js')}\n${tcf('fx.js')}\n${tcf('core.js')}\n${tcf('venue.js')}\n${tcf('pubfx.js')}\n${tcf('cab3d.js')}</script>\n`:'';
// rebrand (EXP-REBRAND): new menu set behind ?rebrand=1; installs nothing when off
const rb=fs.existsSync('rb/rb.js')?`<style>${fs.existsSync('rb/rb-lime.css')?fs.readFileSync('rb/rb-lime.css','utf8'):''}${fs.readFileSync('rb/rb.css','utf8')}</style>\n<script>${fs.readFileSync('rb/rb.js','utf8')}</script>\n`:'';
const page0=upd+head+envs+dg+body+g+c3+v3+v4+v41+v5+v51+v6+v7+v8+v9+v10+v11+v12+v13+v14+v15+tc+rb+v16;
// ENG-FLASH real progress (Experience, Overseer 17:58) + Q&D 18:23: every shipped file is parsed top to bottom, so how far the parser has got IS the
// load progress. After the loader, a tiny TOPS_LOAD.part('parse', f) goes in after the first </script> past every 10 % of THAT file (always top
// level: the HTML parser ends a script at </script>), f = the real fraction at that point; weighted in TOPS_LOAD.part with the page parsed (8 %) and
// the player model (32 %); the game's own #loading.gone → 100 %. Q&D 18:23: the standalone file (what ships) had its 3.2 MB player model BEFORE the
// loader (first paint 15 s on iOS). The model now goes at <!--TOPS_RIG-->, right after the loader, in ten chunks, so the bar moves while it loads.
const RIGMARK=/<!--TOPS_RIG:[^>]*-->/;
const finish=(p0,rig)=>{let p=p0.replace(RIGMARK,()=>rig||'');const L=p.indexOf('id="loading"');if(L<0)throw new Error('build: no loader');let out='',from=0,last=0;
  for(let k=1;k<=12;k++){const at=Math.max(L,Math.floor(p.length*k/13));const e=p.indexOf('</script>',at);if(e<0||e<from)continue;const cut=e+9,f=+(cut/p.length).toFixed(2);if(f<=last)continue;last=f;
    out+=p.slice(from,cut)+`<script>window.TOPS_LOAD&&TOPS_LOAD.part('parse',${f})</script>`;from=cut;}
  out+=p.slice(from);
  // ChatGPT P2: markers after the loader, in order, each value once; the loader comes before the model and before any external CSS/JS
  const ks=[...out.matchAll(/TOPS_LOAD\.part\('parse',([0-9.]+)\)<\/script>/g)].map(m=>[m.index,+m[1]]);
  if(ks.length<3||ks.some((m,i)=>m[0]<L||(i&&m[1]<=ks[i-1][1])))throw new Error('build: load-progress markers out of order '+JSON.stringify(ks.map(m=>m[1])));
  const ld=out.indexOf('id="loading"');for(const s of ['RIG_URL=','RIG_P','<script src=','fonts.googleapis.com/css2'])if(out.indexOf(s)>=0&&out.indexOf(s)<ld)throw new Error('build: '+s+' before the loader');
  return out;};
const page=finish(page0,'');
fs.writeFileSync('index.html',page.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','node_modules/three/build/three.min.js'));
fs.writeFileSync('double-out.html','<meta charset="utf-8">\n'+finish(page0,'<script>window.RIG_B64_URL="remy.b64.txt"</script>'));
/* ENG-RIGCACHE (Engine, Overseer 19:32; build.js is Experience's, change agreed on the tracker): the shipped page no longer carries the
   3.2 MB player model. It ships once as its own file, named by its content (rig/remy-<hash>.glb, so a cached copy is never stale), which the
   game keeps in Cache Storage: a fresh start between matches or a relaunch reads it with no download and no 3.2 MB of text to parse.
   The release copies rig/ next to index.html (release.yml). */
const b64=fs.readFileSync('remy.b64.txt','utf8').trim();const rigBin=Buffer.from(b64,'base64');
const rigHash=require('crypto').createHash('sha256').update(rigBin).digest('hex').slice(0,12),rigFile=`rig/remy-${rigHash}.glb`;
fs.mkdirSync('rig',{recursive:true});for(const f of fs.readdirSync('rig'))if(/^remy-.*\.glb$/.test(f)&&'rig/'+f!==rigFile)fs.unlinkSync('rig/'+f);fs.writeFileSync(rigFile,rigBin);
if(rigBin.slice(0,4).toString()!=='glTF')throw new Error('build: remy.b64.txt is not a GLB');
const rig=`<script>window.RIG_URL="${rigFile}"</script>\n`;
fs.writeFileSync('double-out-standalone.html','<meta charset="utf-8">\n'+finish(page0,rig));
console.log('built',page.length);
