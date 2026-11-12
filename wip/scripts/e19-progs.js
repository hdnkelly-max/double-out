// R0 #19 (Engine): which shader programs does match 2 build after an exhibition, and why (light counts, defines)?
// node e19-progs.js <dir>. iPhone UA, ?exh=1. Rendering stubbed, but three's real renderer.compile(scene,camera) runs on every 4th scene
// the game asks to draw, so programs are built exactly as on a phone (gl.shaderSource hooked: SHADER_NAME, NUM_* light/shadow counts,
// USE_* defines). Phases: hub0 -> exhibition walk-on -> match 1 at aim -> after match 1 (perk) -> hub -> match 2 at aim.
// Prints per phase: the lights in the main scene (visible, by type, shadow casters) and the NEW programs compiled in that phase.
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{window.__C={all:[],phase:'boot'};const ss=WebGLRenderingContext.prototype.shaderSource;const ss2=window.WebGL2RenderingContext&&WebGL2RenderingContext.prototype.shaderSource;
 const rec=function(sh,src){try{if(/gl_FragColor|fragColor|pc_fragColor/.test(src)&&/SHADER_NAME/.test(src)){const g=re=>{const m=src.match(re);return m?m[1]:null;};const d=[...src.matchAll(/#define (NUM_[A-Z_]+) (\d+)/g)].filter(m=>+m[2]>0).map(m=>m[1].replace('NUM_','')+'='+m[2]).join(' ');
  const u=[...src.matchAll(/#define (USE_[A-Z_]+|PHYSICAL|STANDARD|FLAT_SHADED|DOUBLE_SIDED|ALPHATEST)\b/g)].map(m=>m[1]).join(' ');__C.all.push({ph:__C.phase,name:g(/#define SHADER_NAME ([^\n]+)/),lights:d,defs:u,len:src.length,usesG:/G_GGX_Smith|G_BlinnPhong/.test(src)});}}catch(e){}};
 WebGLRenderingContext.prototype.shaderSource=function(sh,src){rec(sh,src);return ss.call(this,sh,src);};if(ss2)WebGL2RenderingContext.prototype.shaderSource=function(sh,src){rec(sh,src);return ss2.call(this,sh,src);};
 const st=setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*(window.__slow?1:0.06)),...a);});
await p.goto('file://'+dir+'/index.html?exh=1');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>{const R=V._qa.renderer;window.__D={frames:0,scenes:new Set()};/* rendering stubbed (software GL makes each frame take seconds); the scenes the game asks to draw are recorded */const comp=R.compile.bind(R);let k=0;R.render=function(sc,cam){if(sc&&sc.isScene){__D.scenes.add(sc);if((k++%4)===0){try{comp(sc,cam);}catch(e){}}}};
 const raf=requestAnimationFrame;(function c(){__D.frames++;raf.call(window,c);})();
 save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;try{sessionStorage.removeItem('tcWalkSeen');}catch(e){}showHub();});
const click=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
const ev=f=>p.evaluate(f);
// figures in the drawn scenes: visible = itself and every parent visible, and at least one skinned mesh of it visible
const measure=async tag=>{await p.waitForTimeout(800);await ev(()=>{__D.frames=0;__D.scenes.clear();});await p.waitForTimeout(2500);
 return ev(tag=>{const vis=o=>{let q=o;while(q){if(!q.visible)return false;q=q.parent;}return true;};const figs=[];
  __D.scenes.forEach(sc=>sc.traverse(o=>{if(!(o.userData&&o.userData.ck))return;let anc=o.parent,nested=false;while(anc){if(anc.userData&&anc.userData.ck){nested=true;break;}anc=anc.parent;}if(nested)return;
   let sk=false;o.traverse(m=>{if(!sk&&m.isSkinnedMesh&&vis(m))sk=true;});figs.push({ck:o.userData.ck,vis:sk,opp:o===V._qa.opp(),fp:o===V._qa.fp()});}));
  let meshes=0,tris=0;__D.scenes.forEach(sc=>sc.traverse(m=>{if(m.isMesh&&vis(m)&&m.geometry){meshes++;const gi=m.geometry.index;tris+=gi?gi.count/3:(m.geometry.attributes.position?m.geometry.attributes.position.count/3:0);}}));
  return {tag,me:V._qa.gfx().vis,visFigs:figs.filter(f=>f.vis).length,figs:figs.map(f=>f.ck+(f.vis?'':'(hidden)')+(f.opp?'*opp':'')+(f.fp?'*fp':'')).join(' '),visMeshes:meshes,visTris:tris|0,walking:document.body.classList.contains('tc-walking'),walkFull:!!window.TOPS_WALKFULL,overlay:!!document.getElementById('tcWalk')};},tag);};
const toAim=async(skip=true)=>{for(let i=0;i<900;i++){const st=await ev(skip=>{try{const w=document.getElementById('tcWalk');if(w&&!w.classList.contains('out')){if(skip)w.click();return 'walk';}if(!S)return 'nos';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
  const o=V._qa.opp();if(S.cur===0&&!S.busy&&!S.p[0].ai&&o&&o.userData&&o.userData.ck&&!document.body.classList.contains('tc-walking'))return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}},skip);
 if(st==='aim'||st==='done'||st.startsWith('ERR'))return st;await p.waitForTimeout(100);}return 'timeout';};
const finish=async()=>{for(let i=0;i<3000;i++){const st=await ev(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
  S.p.forEach(q=>{if(q.score>60&&!S.visit.length)q.score=60;});if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const tp=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(tp.x+gauss()*12,tp.y+gauss()*12);}return 'play';}catch(e){return 'ERR '+e.message;}});
 if(st==='done'||st.startsWith('ERR'))return st;await p.waitForTimeout(40);}};
const toHub=async()=>{for(let i=0;i<80;i++){const at=await ev(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!(S&&!S.done));if(at)return true;await ev(()=>document.querySelectorAll('.cd-wrap').forEach(e=>e.remove()));
 for(const s of ['#tcPLater','#c3rwGo','#btnResAction','#btnResultNext']){if(await click(s))break;}await p.waitForTimeout(400);}return false;};
const quit=()=>ev(()=>{const q=$('btnQuit');q.click();q.click();});
const acceptExh=async()=>{await click('#tcPLater');await p.waitForTimeout(300);if(!(await click('#tcExhTile'))){await ev(()=>{try{showHub();}catch(e){}});await p.waitForTimeout(600);await click('#tcExhTile');}
 for(let i=0;i<30;i++){if(await click('#tcPGo'))return true;await p.waitForTimeout(200);}return false;};
const sawWalk=async()=>{for(let i=0;i<25;i++){if(await ev(()=>!!document.getElementById('tcWalk')))return true;await p.waitForTimeout(80);}return false;};
const out={};const fails=[];
const phase=async name=>{await p.waitForTimeout(1500);const r=await p.evaluate(name=>{const lt={};let sh=0;const sc=[...__D.scenes].sort((a,b)=>b.children.length-a.children.length)[0];
  if(sc)sc.traverseVisible(o=>{if(o.isLight){lt[o.type]=(lt[o.type]||0)+1;if(o.castShadow)sh++;}});
  const nw=__C.all.filter(c=>c.ph===__C.phase);const prev=__C.phase;__C.phase=name;return {phase:prev,lights:lt,shadowCasters:sh,newPrograms:nw.length,programs:nw.map(c=>c.name+' ['+c.lights+'] '+(c.usesG?'G ':'')+c.defs.replace(/USE_/g,'').slice(0,90))};},name);
 console.log('phase',JSON.stringify(r));return r;};
for(let i=0;i<20;i++){if(await click('#tcPLater'))break;await p.waitForTimeout(150);}
await phase('hub0');
// match 1 = the exhibition, accepted from the hub; walk-on on real timers to its end (as on the phone)
let walked=false;for(let t=0;t<5&&!walked;t++){await ev(()=>{window.__slow=true;});await acceptExh();walked=await sawWalk();if(!walked){await ev(()=>{window.__slow=false;});await quit();await p.waitForTimeout(400);await toHub();}}
if(walked){for(let i=0;i<150;i++){if(!(await ev(()=>document.body.classList.contains('tc-walking'))))break;await p.waitForTimeout(100);}}
await ev(()=>{window.__slow=false;});out.walked=walked;await phase('m1 walk-on');
out.aim1=await toAim(false);await phase('m1 at aim');
await finish();for(let i=0;i<80;i++){const at=await ev(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!document.querySelector('div.tcpk')&&!(S&&!S.done));if(at)break;
 await ev(()=>document.querySelectorAll('.cd-wrap').forEach(e=>e.remove()));for(const s of ['#tcPLater','.tcpk__later','#btnPerkLater','#msgReplies button','#c3rwGo','#btnResAction','#btnResultNext']){if(await click(s))break;}await p.waitForTimeout(400);}
await phase('end m1 -> perk -> hub');
let ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await click('#tcPLater');await p.waitForTimeout(300);}}
out.aim2=await toAim();await phase('m2 start -> aim');await p.waitForTimeout(3000);await phase('m2 later');
console.log('e19 done',JSON.stringify({out,pe:pe.slice(0,3)}));await b.close();})();
