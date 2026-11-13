const fs=require('fs');
const eng=fs.readFileSync('engine.js','utf8'),g=fs.readFileSync('game4.js','utf8').replace('ENGINE',()=>eng);
const head=fs.readFileSync('head3.html','utf8'),body=fs.readFileSync('body4.html','utf8');
const BUILD=String(Date.now());
const upd=`<script>window.TOPS_BUILD="${BUILD}";(function(){try{if(location.protocol==='file:')return;var q=new URLSearchParams(location.search);fetch(location.pathname+'?cb='+Date.now(),{cache:'no-store'}).then(function(r){return r.text();}).then(function(t){var m=t.match(/TOPS_BUILD="(\\d+)"/);if(!m||m[1]===window.TOPS_BUILD||+m[1]<+window.TOPS_BUILD)return;var k='tops-upd-'+m[1];if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1');if(window.S&&S&&!S.done)return;q.set('v',m[1]);location.replace(location.pathname+'?'+q.toString());}).catch(function(){});}catch(e){}})();</script>\n`;
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
const dg=fs.existsSync('dartgeo.json')?`<script>window.TOPS_DG_RAW=${fs.readFileSync('dartgeo.json','utf8')}</script>\n`:'';
// collectibles (cards, packs, cabinet, exhibitions): tc/
const tcf=n=>fs.existsSync('tc/'+n)?fs.readFileSync('tc/'+n,'utf8'):'';
const tc=tcf('core.js')?`<style>${tcf('cards.css')}\n${tcf('tc.css')}</style>\n<script>${tcf('cards.js')}\n${tcf('data.js')}\n${tcf('fx.js')}\n${tcf('core.js')}\n${tcf('venue.js')}\n${tcf('pubfx.js')}\n${tcf('cab3d.js')}</script>\n`:'';
// rebrand (EXP-REBRAND): new menu set behind ?rebrand=1; installs nothing when off
const rb=fs.existsSync('rb/rb.js')?`<style>${fs.existsSync('rb/rb-lime.css')?fs.readFileSync('rb/rb-lime.css','utf8'):''}${fs.readFileSync('rb/rb.css','utf8')}</style>\n<script>${fs.readFileSync('rb/rb.js','utf8')}</script>\n`:'';
const page0=upd+head+envs+dg+body+g+c3+v3+v4+v41+v5+v51+v6+v7+v8+v9+v10+v11+v12+v13+v14+v15+tc+rb;
// ENG-FLASH real progress (Experience, Overseer 17:58): the page is one 3 MB file the phone parses top to bottom, so how far the parser has got IS
// the load progress. After the loader, a tiny TOPS_LOAD.set() goes in after the first </script> past every 10 % of the page (always top level:
// the HTML parser ends a script at </script>), weighted with the rest in TOPS_LOAD.part: page parsed 50 %, DOMContentLoaded 8 %, the player model download 32 % (game4.js) (they overlap),
// the game's own #loading.gone → 100 %.
const page=(()=>{const L=page0.indexOf('id="loading"');if(L<0)return page0;let out='',from=0;for(let k=1;k<=9;k++){const at=Math.max(L,Math.floor(page0.length*k/10));
  const e=page0.indexOf('</script>',at);if(e<0||e<from)continue;const cut=e+9;out+=page0.slice(from,cut)+`<script>window.TOPS_LOAD&&TOPS_LOAD.part('parse',${k/10})</script>`;from=cut;}
  out+=page0.slice(from);
  // ChatGPT P2: markers must come after the loader, in order, each value once
  const ks=[...out.matchAll(/TOPS_LOAD\.part\('parse',([0-9.]+)\)<\/script>/g)].map(m=>[m.index,+m[1]]);
  if(ks.length<3||ks.some((m,i)=>m[0]<L||(i&&m[1]<=ks[i-1][1])))throw new Error('build: load-progress markers out of order '+JSON.stringify(ks.map(m=>m[1])));
  return out;})();
fs.writeFileSync('index.html',page.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','node_modules/three/build/three.min.js'));
fs.writeFileSync('double-out.html','<meta charset="utf-8">\n<script>window.RIG_B64_URL="remy.b64.txt"</script>\n'+page);
const b64=fs.readFileSync('remy.b64.txt','utf8').trim();
fs.writeFileSync('double-out-standalone.html','<meta charset="utf-8">\n<script>window.RIG_URL="data:model/gltf-binary;base64,'+b64+'"</script>\n'+page);
console.log('built',page.length);
