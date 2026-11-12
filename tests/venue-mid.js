// ENG-7 (QA-B3): a venue rebuild or a late character file during a match must not blank the board face in the top board view.
// node tests/venue-mid.js [dir] [runs]   env MODE=venue|all|char (default char), W/H (default 360x640)
//   venue: call V.buildVenue(tier) 3 s into the player's turn (what charsChanged does);
//   all:   V.setOpponentLook(...) + V.buildVenue(tier) (the whole charsChanged rebuild);
//   char:  the real path: the opponent's character file is held back until 3 s into the player's turn, then released (late model, slow
//          connection); on live that lands in loadChar -> charsChanged -> setPlayerLook + setOpponentLook + buildVenue mid-match.
// After the event: 3 darts, then the board view is sampled right after each rendered frame (gl.readPixels in the same task) for 3 s;
// a drawn face has many colours (sisal, segment colours, numbers); a blank face (wires only) has few. FAIL if any run is blank.
// Also reports what the event did to the board mesh: disposed (geometry/material/textures) and where it lives (scene vs the lights group).
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=process.argv[2]||path.resolve(__dirname,'..');const RUNS=+process.argv[3]||3;const MODE=process.env.MODE||'char';const W=+process.env.W||360,H=+process.env.H||640;
const types={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.css':'text/css','.txt':'text/plain'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(dir,u==='/'?'index.html':u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});}).listen(0);
const port=srv.address().port;const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const res=[];
for(let run=0;run<RUNS;run++){
 const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));const glbs=[];p.on('request',q=>{if(/\.glb/.test(q.url()))glbs.push(q.url().replace(/^.*\/assets\//,''));});
 let release=null;const held=new Promise(r=>release=r);let OPPK=null;
 if(MODE==='char')await p.route(/chars\/[a-z]+\.glb/,async r=>{if(OPPK&&r.request().url().includes('chars/'+OPPK+'.glb'))await held;await r.continue();});
 await p.goto(`http://127.0.0.1:${port}/index.html`);
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
 await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};
  });
 /* an opponent whose character file isn't loaded yet (so it arrives during the match) */
 const pick=await p.evaluate(()=>{const have=TOPS_RIGS().ids;const names=['Carl Maddox','Lewis Kane','Dave Hurring','Gaz Tapsell','Big Mal','Tama Rewi','Kiri Walker','Steve Brooks','Wiremu Tane','Bev Collins','Sharon Kemp','Daz Holt'];for(const n of names){const k=V.charKey(lookFor(n),n);if(k&&k!=='remy'&&!have.includes(k))return {n,k,have};}return {n:'Carl Maddox',k:null,have};});
 OPPK=pick.k;
 await p.evaluate(n=>{window.__rigs0=TOPS_RIGS().ids.slice();beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:n,oppName:n,oppAvg:40,legs:3,start:501});},pick.n);
 let st='';for(let i=0;i<600;i++){st=await p.evaluate(()=>{try{const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim')break;await p.waitForTimeout(200);}
 // find the board face mesh (the 225.5 mm circle) and watch it
 await p.evaluate(()=>{const R=V._qa.renderer;window.__BD={disp:[],root:null};const rr=R.render;R.render=function(s,c){if(s&&s.isScene&&(!__BD.root||s.children.length>__BD.root.children.length))__BD.root=s;return rr.apply(this,arguments);};});
 await p.waitForTimeout(3000);
 await p.evaluate(()=>{const root=__BD.root;let bd=null;root.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='CircleGeometry'&&o.geometry.parameters&&Math.abs(o.geometry.parameters.radius-.2255)<1e-4)bd=o;});__BD.mesh=bd;
  if(bd){const hook=(x,n)=>{if(!x||!x.dispose)return;const d=x.dispose.bind(x);x.dispose=function(){__BD.disp.push(n);return d();};};hook(bd.geometry,'geometry');hook(bd.material,'material');['map','emissiveMap','bumpMap'].forEach(k=>hook(bd.material[k],k));
   const pth=[];let q=bd.parent;while(q){pth.push(q.isScene?'scene':(q.children.some(c=>c.isLight)?'lights-group':'group'));q=q.parent;}__BD.before=pth.join('<');}});
 // the event, 3 s into the player's turn
 if(MODE==='char'){release();}
 else await p.evaluate(m=>{const t=0;if(m==='all'&&V._qa.opp){try{const o=S.p[1];V.setOpponentLook(o.look||oppLookFor(S.p[1]),o.name,t);}catch(e){}}V.buildVenue(t);},MODE);
 await p.waitForTimeout(MODE==='char'?4000:1500);
 const lateLoaded=await p.evaluate(k=>({key:k,before:(window.__rigs0||[]).includes(k),now:TOPS_RIGS().ids.includes(k)}),OPPK);
 for(let d=0;d<3;d++){await p.evaluate(()=>{if(S.cur===0&&!S.busy&&!S.done){S.busy=true;land(gauss()*20,-103+gauss()*10);}});await p.waitForTimeout(900);}
 // sample the board view after each rendered frame for 3 s: distinct colours (4 bits per channel) in the board circle's screen box
 const samp=await p.evaluate(async()=>{const R=V._qa.renderer;const gl=R.getContext();const pr=R.getPixelRatio();const out=[];const vf=V.frame;
  V.frame=function(){const r=vf.apply(this,arguments);try{const bull=V.mmToScreen(0,0),edge=V.mmToScreen(170,0);if(bull&&edge){const rad=Math.abs(edge.x-bull.x);const x0=Math.max(0,Math.round((bull.x-rad)*pr)),w=Math.round(rad*2*pr),y0=Math.round((innerHeight-(bull.y+rad))*pr),h=w;
   const px=new Uint8Array(w*h*4);gl.readPixels(x0,y0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px);const set=new Set();for(let i=0;i<px.length;i+=4*7)set.add((px[i]>>4)<<8|(px[i+1]>>4)<<4|(px[i+2]>>4));out.push(set.size);}}catch(e){}return r;};
  await new Promise(r=>setTimeout(r,3000));V.frame=vf;return out;});
 const bd=await p.evaluate(()=>{const bd=__BD.mesh;const pth=[];let q=bd&&bd.parent;while(q){pth.push(q.isScene?'scene':(q.children.some(c=>c.isLight)?'lights-group':'group'));q=q.parent;}return {before:__BD.before,after:pth.join('<'),disposed:__BD.disp.slice()};});
 samp.sort((a,b)=>a-b);const med=samp.length?samp[Math.floor(samp.length/2)]:null;res.push({run,mode:MODE,glbs:glbs.slice(0,12),oppCk:await p.evaluate(()=>{try{return V.charKey(S.p[1].look||{},S.p[1].name);}catch(e){return 'err '+e.message;}}),lateLoaded,frames:samp.length,colours:{min:samp[0],med,max:samp[samp.length-1]},board:bd,pe:pe.slice(0,3)});
 await ctx.close();}
srv.close();await b.close();
const blank=res.filter(r=>r.colours.med!=null&&r.colours.med<120).length,disposed=res.filter(r=>r.board.disposed.length).length;
console.log(JSON.stringify(res));console.log(`venue-mid MODE=${MODE} ${W}x${H}: blank (wires only) in ${blank} of ${res.length} runs; board face disposed in ${disposed} of ${res.length}`);
const f=[];if(blank)f.push('board face blank');if(disposed)f.push('board face disposed mid-match');if(res.some(r=>r.pe.length))f.push('page errors');if(res.some(r=>!r.frames))f.push('no frames sampled');
console.log(f.length?'VENUE-MID FAIL: '+f.join('; '):'VENUE-MID PASS');process.exit(f.length?1:0);})();
