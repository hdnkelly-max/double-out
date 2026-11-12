// R0 #19: shader programs are linked once per session, and a failed link never leaves a surface undrawn.
// node tests/prog-keep.js [dir] -> PASS / FAIL. iPhone UA, real rendering (links happen as on a phone). Path: hub 10 s -> fixture at aim ->
// match end -> hub 10 s -> next fixture at aim. Then, in match 2, every visible bump-mapped standard material (the board face uses a bump map)
// gets a define that makes its next link FAIL (gl LINK_STATUS forced false for shaders carrying it), as Hayden's iPhone did at 263 s.
// Checks: 1 re-links of programs linked before: 'after match 1' <= 2 and 'match 2' <= 2 (3.00: dozens, from teardown/showHub/figure rebuilds)
//         2 after the forced failure, every visible mesh in the main scene draws with a program that linked (a fallback, never nothing),
//           and the failure is logged ('TOPS #19 shader link failed')
//         3 shared holder: a failing program held by 2 materials (one outside every scene the rescue walks), disposed in both orders:
//           no duplicates or holes in renderer.info.programs, no live material missing its program, no GL 'not valid' errors
//         4 no page errors
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');const T0=Date.now();
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
const ce=[];p.on('console',m=>{if(m.type()==='error'||/INVALID|not valid/i.test(m.text()))ce.push(m.text());});
await p.addInitScript(()=>{const C=window.__C={fr:0,del:0,linkFail:0,names:{},calls:{},hashes:new Map(),relinks:0,src:new WeakMap(),psrc:new WeakMap(),force:false};
 for(const P of [WebGLRenderingContext.prototype,window.WebGL2RenderingContext&&WebGL2RenderingContext.prototype].filter(Boolean)){
  const ss=P.shaderSource;P.shaderSource=function(sh,src){C.src.set(sh,src);if(/SHADER_NAME/.test(src)&&/gl_FragColor|pc_fragColor|fragColor/.test(src)){C.fr++;const m=src.match(/#define SHADER_NAME ([^\n]+)/);const n=m?m[1]:'?';C.names[n]=(C.names[n]||0)+1;let h=0;for(let i=0;i<src.length;i+=7)h=(h*31+src.charCodeAt(i))|0;const k=n+':'+src.length+':'+h;const c=C.hashes.get(k)||0;if(c)C.relinks++;C.hashes.set(k,c+1);}return ss.call(this,sh,src);};
  const at=P.attachShader;P.attachShader=function(pr,sh){const s=C.src.get(sh)||'';if(/TOPS_FORCE_FAIL/.test(s))C.psrc.set(pr,1);return at.call(this,pr,sh);};
  const dp=P.deleteProgram;P.deleteProgram=function(pr){C.del++;return dp.call(this,pr);};
  const gp=P.getProgramParameter;P.getProgramParameter=function(pr,pn){let r=gp.call(this,pr,pn);if(pn===0x8B82&&C.psrc.get(pr))r=false;if(pn===0x8B82&&r===false)C.linkFail++;return r;};}
 const st=setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*(window.__slow?1:0.25)),...a);});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{const C=__C;const wrap=(o,k,name)=>{const f=o[k];if(typeof f!=='function')return;o[k]=function(){C.calls[name]=(C.calls[name]||0)+1;return f.apply(this,arguments);};};
 ['showHub','beginMatch','showTitle'].forEach(k=>{wrap(window,k,k);try{eval(k+'=window.'+k);}catch(e){}});wrap(V,'buildVenue','buildVenue');wrap(V,'setPlayerLook','setPlayerLook');wrap(V,'setOpponentLook','setOpponentLook');
 save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;showHub();});
const click=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
const ev=f=>p.evaluate(f);const rows=[];
const phase=async(name,ms)=>{await ev(()=>{const C=__C;C.s={fr:C.fr,del:C.del,lf:C.linkFail,rl:C.relinks,names:{...C.names},calls:{...C.calls}};});await p.waitForTimeout(ms);
 const r=await p.evaluate(name=>{const C=__C,s=C.s;const d=(a,b)=>{const o={};Object.keys(a).forEach(k=>{const v=a[k]-(b[k]||0);if(v)o[k]=v;});return o;};return {name,relinks:C.relinks-s.rl,compiles:C.fr-s.fr,deletes:C.del-s.del,linkFail:C.linkFail-s.lf,programsNow:V._qa.renderer.info.programs.length,calls:d(C.calls,s.calls),byMaterial:d(C.names,s.names)};},name);
 rows.push(r);console.log('phase',JSON.stringify(r));};
const toAim=async()=>{for(let i=0;i<600;i++){const st=await ev(()=>{try{const w=document.getElementById('tcWalk');if(w&&!w.classList.contains('out')){w.click();return 'walk';}if(!S)return 'nos';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR';}});if(st==='aim'||st==='ERR')return st;await p.waitForTimeout(150);}return 'timeout';};
const finish=async()=>{for(let i=0;i<3000;i++){const st=await ev(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}S.p.forEach(q=>{if(q.score>40&&!S.visit.length)q.score=40;});if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const tp=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(tp.x+gauss()*8,tp.y+gauss()*8);}return 'play';}catch(e){return 'ERR';}});if(st==='done'||st==='ERR')return;await p.waitForTimeout(60);}};
const toHub=async()=>{for(let i=0;i<80;i++){const at=await ev(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!document.querySelector('div.tcpk')&&!(S&&!S.done));if(at)return;await ev(()=>document.querySelectorAll('.cd-wrap').forEach(e=>e.remove()));for(const s of ['#tcPLater','.tcpk__later','#btnPerkLater','#msgReplies button','#c3rwGo','#btnResAction','#btnResultNext']){if(await click(s))break;}await p.waitForTimeout(400);}};
for(let i=0;i<20;i++){if(await click('#tcPLater'))break;await p.waitForTimeout(150);}
await phase('hub idle 10 s',10000);
await ev(()=>{__C.mark=1;});let ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await click('#tcPLater');await p.waitForTimeout(300);}}
await ev(()=>{const C=__C;C.s2={fr:C.fr,del:C.del};});const a1=await toAim();await phase('match 1 at aim, 8 s ('+a1+')',8000);
await finish();await toHub();await phase('after match 1, in hub 10 s',10000);
ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await click('#tcPLater');await p.waitForTimeout(300);}}
const a2=await toAim();await phase('match 2 at aim, 8 s ('+a2+')',8000);
// forced link failure on the bump-mapped standard materials (the board face) while match 2 is on
const forced=await ev(()=>{const R=V._qa.renderer;let n=0;const sc=[];R.__lastScenes=sc;const seen=new Set();const walk=o=>{if(!o.visible)return;const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(m&&m.isMeshStandardMaterial&&m.bumpMap&&!seen.has(m)){seen.add(m);m.defines=Object.assign({},m.defines,{TOPS_FORCE_FAIL:1});m.needsUpdate=true;n++;}});o.children.forEach(walk);};
 V._qa.gfx&&0;let root=null;try{root=V._qa.opp()&&V._qa.opp().parent;while(root&&root.parent)root=root.parent;}catch(e){}if(root)walk(root);return {n,root:!!root};});
await p.waitForTimeout(6000);
/* visible proof: the board area after the forced failure (CDP shot; page.screenshot waits on blocked web fonts) */
try{const cdp=await ctx.newCDPSession(p);const sh=await cdp.send('Page.captureScreenshot',{format:'png'});require('fs').writeFileSync(process.env.SHOT||require('path').join(require('os').tmpdir(),'prog-keep-forced.png'),Buffer.from(sh.data,'base64'));}catch(e){}
const after=await ev(()=>{const R=V._qa.renderer,P=R.properties;let root=null;try{root=V._qa.opp().parent;while(root.parent)root=root.parent;}catch(e){}const bad=[],fb=[];
 const vis=o=>{let q=o;while(q){if(!q.visible)return false;q=q.parent;}return true;};if(root)root.traverse(o=>{if(!(o.isMesh&&vis(o)))return;const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{const mp=P.get(m);const pr=mp&&mp.currentProgram;if(/fallback/.test(m.name||''))fb.push((o.name||o.type)+':'+m.type);if(pr&&pr.diagnostics&&pr.diagnostics.runnable===false)bad.push((o.name||o.type)+':'+m.type);});});
 return {bad,fallbacks:fb.slice(0,6),nFallbacks:fb.length,linkFail:__C.linkFail,pgFails:window.TOPS_PG?TOPS_PG.fails:null};});
// shared holder (Delivery QA 15:58): one failing program held by 2 materials, B outside every scene the rescue walks (it got the program via
// renderer.compile on a private scene, which the sweep doesn't see), A in the main scene; then dispose them in both orders
const glErrs0=ce.length;
const shared=[];for(const order of ['B then A','A then B']){
 const r=await p.evaluate(async order=>{const R=V._qa.renderer,T=window.THREE;let root=V._qa.opp().parent;while(root.parent)root=root.parent;
  const key='S'+Math.random().toString(36).slice(2,7),def={TOPS_FORCE_FAIL:'1\n#error TOPS forced shared failure',TOPS_SHARED:key};
  const mA=new T.MeshStandardMaterial({color:0x808080});mA.defines=Object.assign({},def);const mB=new T.MeshStandardMaterial({color:0x808080});mB.defines=Object.assign({},def);
  const P=new T.Scene();const g=new T.BoxGeometry(.01,.01,.01);const meshB=new T.Mesh(g,mB);P.add(meshB);P.add(new T.AmbientLight(0xffffff,.1));
  R.compile(P,new T.PerspectiveCamera());/* B holds the failing program; no sweep ran */
  const meshA=new T.Mesh(g,mA);meshA.position.set(0,-50,0);root.add(meshA);
  await new Promise(r=>setTimeout(r,1500));/* a few real frames: A acquires the same program, the sweep finds it failed, the rescue walks root (not P) */
  const ps=R.info.programs,props=R.properties;
  const chk=tag=>{const dup=ps.length!==new Set(ps).size,holes=ps.some(x=>!x);let missing=0;const seen=new Set();root.traverse(o=>{const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(!m||seen.has(m))return;seen.add(m);const mp=props.get(m);const pr=mp&&mp.currentProgram;if(pr&&pr.program!==undefined&&ps.indexOf(pr)<0)missing++;});});return {tag,n:ps.length,dup,holes,missing};};
  const out=[chk('after rescue')];
  const disp=w=>{if(w==='A'){root.remove(meshA);mA.dispose();}else{mB.dispose();}};
  const [x,y]=order==='B then A'?['B','A']:['A','B'];disp(x);await new Promise(r=>setTimeout(r,600));out.push(chk('after '+x));disp(y);await new Promise(r=>setTimeout(r,600));out.push(chk('after '+y));
  return {order,steps:out};},order);
 shared.push(r);}
const glErrs=ce.slice(glErrs0).filter(t=>/not valid|INVALID_OPERATION/i.test(t));
const tot=await ev(()=>({compiles:__C.fr,deletes:__C.del,relinks:__C.relinks,linkFail:__C.linkFail,calls:__C.calls}));
const r1=rows.find(r=>/after match 1/.test(r.name)),r2=rows.find(r=>/match 2/.test(r.name));const fails=[];
if(r1.relinks>2)fails.push('re-linked '+r1.relinks+' programs after match 1 (result, hub)');
if(r2.relinks>2)fails.push('re-linked '+r2.relinks+' programs in match 2');
if(!forced.n)fails.push('no bump-mapped standard material found to force a failure on (board face)');
if(after.bad.length)fails.push('surfaces left with a failed program (drawn as nothing): '+after.bad.slice(0,5).join(', '));
if(forced.n&&!ce.some(t=>/TOPS #19 shader link failed/.test(t)))fails.push('forced link failure was not logged');
shared.forEach(r=>r.steps.forEach(st=>{if(st.dup||st.holes||st.missing)fails.push('shared holder, '+r.order+', '+st.tag+': programs list '+(st.dup?'has duplicates ':'')+(st.holes?'has holes ':'')+(st.missing?st.missing+' live material(s) missing their program':''));}));
if(glErrs.length)fails.push('GL "not valid" errors after the shared-holder case: '+glErrs.slice(0,2).join(' | '));
if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));
console.log('prog-keep',fails.length?'FAIL':'PASS',JSON.stringify({fails,shared,rows:rows.map(r=>({name:r.name,relinks:r.relinks,compiles:r.compiles,deletes:r.deletes,calls:r.calls})),forced,after,tot}));await b.close();process.exit(fails.length?1:0);})();
