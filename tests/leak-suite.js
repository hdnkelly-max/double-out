// ENG-2 known-leak regression suite (Engine with Quality & Diagnostics). node tests/leak-suite.js [dir]  -> PASS / FAIL, target < 2 min.
// Replaces running dart-leak, char-evict, match-growth and sampler-loops one by one. Works on any build (no engine hooks needed):
// a JS-side ledger catches every three.js geometry, material and texture as it is made (a setter on each prototype's `uuid`, which the
// r128 constructors assign) and every dispose(), and tags each with an OWNER (the game functions on the creation stack) and when it
// was BORN (match, visit). Rendering is stubbed (the ledger needs no GPU, and software GL makes every frame take seconds here); the
// scenes the game asks to draw are still recorded, so "reachable" = in a scene the game rendered recently, or kept (V._qa.kept).
// An ORPHAN = made, never disposed, not reachable, not kept: GPU memory nothing will ever free.
// Checks: D darts: orphans per dart thrown across 6 real visits (player land(), AI's own fly()+land()) ~ 0
//         T teardown: 4 start/quit cycles against different characters: orphans born in a finished match don't accumulate;
//           character templates loaded <= player + last + current opponent + remy
//         L listeners and loops: live listeners flat over the cycles; rAF callbacks per frame flat after 5 background/foreground switches
// INJECT=dart: runs against a copy of the build with one dart disposal removed (drop() no longer frees), to prove D catches it.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const T0=Date.now();const dir=path.resolve(process.argv[2]||path.resolve(__dirname,'..'));const t=()=>((Date.now()-T0)/1000).toFixed(0)+'s';const log=(...a)=>process.env.QUIET||console.error(t(),...a);
let page='index.html';if(process.env.INJECT==='dart'){const src=fs.readFileSync(path.join(dir,'index.html'),'utf8');const a='function drop(o){dartsG.remove(o);disposeTree(o);}';
 if(!src.includes(a)){console.log('leak-suite SKIP INJECT: this build has no drop() (pre-#15b), nothing to remove');process.exit(2);}
 fs.writeFileSync(path.join(dir,'index.inject.html'),src.replace(a,'function drop(o){dartsG.remove(o);}'));page='index.inject.html';}
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:360,height:640},isMobile:true,hasTouch:true});const p=await ctx.newPage();
const pe=[];p.on('pageerror',e=>pe.push(e.message));await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
await p.addInitScript(()=>{
 const L=window.__L={rec:new Map(),m:0,v:0,scenes:new Map(),frame:0,lis:new Map()};Error.stackTraceLimit=40;
 const own=()=>{const out=[];for(const l of String(new Error().stack).split('\n').slice(3)){const m=l.match(/at (?:new )?([\w$.]+) \((.*?):\d+:\d+\)/);if(!m||/three\.(min|module)/.test(m[2])||/^(Array|Object|Map|Set|Function|Promise)\./.test(m[1]))continue;out.push(m[1].replace(/^.*\./,''));if(out.length>=3)break;}return out.join('<')||'?';};
 const install=T=>{if(!T||!T.BufferGeometry||L.inst)return;L.inst=1;
  for(const [C,k] of [[T.BufferGeometry,'geo'],[T.Material,'mat'],[T.Texture,'tex']]){const P=C.prototype;
   Object.defineProperty(P,'uuid',{configurable:true,get(){return undefined;},set(u){Object.defineProperty(this,'uuid',{value:u,writable:true,configurable:true,enumerable:true});L.rec.set(this,{k,o:own(),m:L.m,v:L.v,d:false});}});
   const d=P.dispose;P.dispose=function(){const r=L.rec.get(this);if(r)r.d=true;return d.apply(this,arguments);};}};
 let T_;Object.defineProperty(window,'THREE',{configurable:true,get(){return T_;},set(v){T_=v;queueMicrotask(()=>install(v));}});
 // live listeners: add/remove pairs per target; counted only for window, document and nodes still in the page
 const ae=EventTarget.prototype.addEventListener,re=EventTarget.prototype.removeEventListener;
 EventTarget.prototype.addEventListener=function(ty,fn,o){if(fn){let m=L.lis.get(this);if(!m)L.lis.set(this,m=new Set());m.add(ty+'|'+!!(o===true||(o&&o.capture))+'|'+(fn.__lid||(fn.__lid=Math.random())));}return ae.apply(this,arguments);};
 EventTarget.prototype.removeEventListener=function(ty,fn,o){const m=L.lis.get(this);if(m&&fn)m.delete(ty+'|'+!!(o===true||(o&&o.capture))+'|'+fn.__lid);return re.apply(this,arguments);};
 L.liveLis=()=>{let n=0;L.lis.forEach((s,t)=>{if(t===window||t===document||(t.isConnected))n+=s.size;});return n;};
 const raf=window.requestAnimationFrame;L.raf=0;window.requestAnimationFrame=function(f){return raf.call(window,function(x){L.raf++;return f(x);});};(function c(){L.frame++;raf.call(window,c);})();
 // reachability: everything in a scene the game drew in the last ~30 frames
 L.reach=()=>{const live=new Set(),seen=new Set();const tex=m=>{for(const k in m){const x=m[k];if(x&&x.isTexture)live.add(x);}};
  L.scenes.forEach((f,sc)=>{if(L.frame-f>30)return;sc.traverse(o=>{if(seen.has(o))return;seen.add(o);if(o.geometry)live.add(o.geometry);const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{live.add(m);tex(m);if(m.uniforms)for(const u in m.uniforms){const x=m.uniforms[u]&&m.uniforms[u].value;if(x&&x.isTexture)live.add(x);}});if(o.skeleton&&o.skeleton.boneTexture)live.add(o.skeleton.boneTexture);});
   if(sc.background&&sc.background.isTexture)live.add(sc.background);if(sc.environment)live.add(sc.environment);});return live;};
 L.orphans=()=>{const live=L.reach();const kept=(typeof V!=='undefined'&&V._qa&&V._qa.kept)?V._qa.kept:null;const by={};let n=0;
  L.rec.forEach((r,o)=>{if(r.d||live.has(o)||(kept&&kept(o)))return;n++;const k=r.k+' '+r.o;by[k]=(by[k]||0)+1;});return {n,by};};
});
await p.goto('file://'+dir+'/'+page);
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady()&&window.__L.inst,null,{timeout:120000});
log('loaded');
await p.evaluate(()=>{const L=__L;const R=V._qa.renderer;R.render=function(sc){if(sc&&sc.isScene)L.scenes.set(sc,L.frame);};/* stub: record what would be drawn */
 const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.06),...a);
 const bm=beginMatch;beginMatch=function(){L.m++;L.v=0;return bm.apply(this,arguments);};const sT=startTurn;startTurn=function(){L.v++;return sT.apply(this,arguments);};
 window.__darts=0;const ld=land;land=function(){__darts++;return ld.apply(this,arguments);};
 save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};});
const step=()=>p.evaluate(()=>{try{if(!S||S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
 if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const first=S.visit.length===0;const tp=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(tp.x+gauss()*14,tp.y+gauss()*14);return first?'visit':'aim';}return 'wait';}catch(e){return 'ERR '+e.message;}});
const snap=()=>p.evaluate(()=>{const o=__L.orphans();return {n:o.n,by:o.by,darts:__darts,lis:__L.liveLis(),rigs:V._qa.gfx().rigs.slice()};});
const fails=[];const out={};
// ---- D: darts
await p.evaluate(()=>beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:'deano',oppName:'Deano Marsh',oppAvg:60,legs:9,start:501}));
const vis=[];for(let i=0;i<3000&&vis.length<7;i++){const s=await step();if(s==='visit'){vis.push(await snap());}if(s==='done'||String(s).startsWith('ERR')){out.dEnd=s;break;}await p.waitForTimeout(15);}
log('darts',vis.length,'visits');
if(vis.length<5)fails.push('D: only '+vis.length+' visits played');else{const a=vis[1],z=vis[vis.length-1];const dd=Math.max(1,z.darts-a.darts);const grow={};
 Object.keys(z.by).forEach(k=>{const g=z.by[k]-(a.by[k]||0);if(g>0)grow[k]=g;});out.D={darts:dd,orphans:[a.n,z.n],perDart:+((z.n-a.n)/dd).toFixed(2),grew:grow};
 if((z.n-a.n)/dd>0.3)fails.push('D: '+out.D.perDart+' orphan GPU objects per dart thrown (should be ~0): '+JSON.stringify(Object.entries(grow).sort((x,y)=>y[1]-x[1]).slice(0,4)));}
// ---- L1: background/foreground x5 mid-match (sampler loops)
const rate=async()=>{const a=await p.evaluate(()=>[__L.raf,__L.frame]);await p.waitForTimeout(700);const z=await p.evaluate(()=>[__L.raf,__L.frame]);return (z[0]-a[0])/Math.max(1,z[1]-a[1]);};
const r0=await rate();await p.evaluate(()=>{const hid=v=>{Object.defineProperty(document,'hidden',{get:()=>v,configurable:true});Object.defineProperty(document,'visibilityState',{get:()=>v?'hidden':'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'));};for(let i=0;i<5;i++){hid(true);hid(false);}});
await p.waitForTimeout(400);const r1=await rate();out.L1={rafPerFrame:[+r0.toFixed(2),+r1.toFixed(2)]};if(r1-r0>=0.5)fails.push('L: +'+(r1-r0).toFixed(1)+' rAF loops after 5 background/foreground switches');
// ---- T: quit, then start/quit against four other characters
const quit=()=>p.evaluate(()=>{const q=$('btnQuit');q.click();q.click();});
await quit();await p.waitForTimeout(300);const cyc=[await snap()];
for(const nm of ['Pete the Plumber','Shazza','Tama Rewiri','Kev Mercer']){
 await p.evaluate(nm=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:nm,oppName:nm,oppAvg:60,legs:3,start:501});},nm);
 for(let i=0;i<200;i++){const ok=await p.evaluate(()=>{const o=V._qa.opp();return !!(o&&o.userData&&o.userData.ck&&V._qa.gfx().rigs.includes(o.userData.ck));});if(ok)break;await p.waitForTimeout(100);}
 for(let i=0;i<6;i++){await step();await p.waitForTimeout(30);}await quit();await p.waitForTimeout(300);cyc.push(await snap());}
log('cycles done');
const c1=cyc[1],cz=cyc[cyc.length-1];const gT={};Object.keys(cz.by).forEach(k=>{const g=cz.by[k]-(c1.by[k]||0);if(g>0)gT[k]=g;});
out.T={orphans:cyc.map(c=>c.n),rigs:cyc.map(c=>c.rigs.length),rigsLast:cz.rigs,lis:cyc.map(c=>c.lis),grew:gT};
if(cz.n-c1.n>12)fails.push('T: orphans grow over start/quit cycles '+out.T.orphans.join(' → ')+': '+JSON.stringify(Object.entries(gT).sort((x,y)=>y[1]-x[1]).slice(0,4)));
if(cz.rigs.length>4)fails.push('T: '+cz.rigs.length+' character templates still loaded after 5 opponents ('+cz.rigs.join(',')+'); expected <= 4 (remy, player, last, current)');
if(cz.lis-c1.lis>3)fails.push('L: live listeners grow over cycles '+out.T.lis.join(' → '));
if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));
await b.close();if(page!=='index.html')try{fs.unlinkSync(path.join(dir,page));}catch(e){}
out.secs=+((Date.now()-T0)/1000).toFixed(0);if(out.secs>120)fails.push('took '+out.secs+' s (target < 120)');
console.log('leak-suite'+(process.env.INJECT?' INJECT='+process.env.INJECT:''),fails.length?'FAIL':'PASS',JSON.stringify({fails,...out}));process.exit(fails.length?1:0);})();
