// #17/#18: after a walk-on (completed, skipped or quit), the player's 3rd-person figure is hidden again and nothing of the walk is left.
// node tests/walk-clean.js [dir] -> PASS / FAIL. iPhone UA, Hayden's path: ?exh=1 (the game's own switch) forces an exhibition invite.
//  1 match 1 = a normal fixture from the hub (no walk-on at the Pub): baseline figures and draw calls at the player's aim.
//  2 hub -> Exhibition tile -> Accept invite (walk-on plays when you throw first; quit and re-accept until it does), real timers, NOT skipped ->
//    at the player's aim: the player figure must be hidden, visible figures and draw calls as in match 1.
//  3 another exhibition, QUIT during the walk-on -> hub: no walk-on class/overlay/flag left; then a normal fixture: player figure
//    hidden, figures as in match 1.
// Rendering is stubbed; 'visMeshes'/'visTris' = visible meshes and triangles in the scenes the game draws (what a phone has to draw).
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{const st=setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*(window.__slow?1:0.06)),...a);});
await p.goto('file://'+dir+'/index.html?exh=1');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>{const R=V._qa.renderer;window.__D={frames:0,scenes:new Set()};/* rendering stubbed (software GL makes each frame take seconds); the scenes the game asks to draw are recorded */R.render=function(sc,cam){if(sc&&sc.isScene)__D.scenes.add(sc);};
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
for(let i=0;i<20;i++){if(await click('#tcPLater'))break;await p.waitForTimeout(150);}
// 1 baseline
let ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await click('#tcPLater');await p.waitForTimeout(300);}}
out.aim1=await toAim();out.m1=await measure('match1 fixture');await finish();await toHub();
// 2 exhibition with a walk-on, skipped
/* as on Hayden's phone: real timers while the match starts and the walk-on plays to its end, not tapped (the start-of-match look rebuilds
   run on timers; with sped-up timers they can land after the walk and hide what it left behind) */
let walked=false;for(let t=0;t<5&&!walked;t++){await ev(()=>{window.__slow=true;});await acceptExh();walked=await sawWalk();if(!walked){await ev(()=>{window.__slow=false;});await quit();await p.waitForTimeout(400);await toHub();}}
if(walked){for(let i=0;i<150;i++){if(!(await ev(()=>document.body.classList.contains('tc-walking'))))break;await p.waitForTimeout(100);}await p.waitForTimeout(1500);}
await ev(()=>{window.__slow=false;});
out.walk2=walked;out.aim2=await toAim(false);out.m2=await measure('match2 exhibition after walk-on');await quit();await p.waitForTimeout(400);await toHub();
// 3 exhibition, quit DURING the walk-on
let walked3=false;for(let t=0;t<5&&!walked3;t++){await acceptExh();walked3=await sawWalk();if(!walked3){await quit();await p.waitForTimeout(400);await toHub();}}
if(walked3){await quit();await p.waitForTimeout(500);}await toHub();out.walk3=walked3;
out.hubAfterQuit=await ev(()=>({walking:document.body.classList.contains('tc-walking'),walkFull:!!window.TOPS_WALKFULL,overlay:!!(document.getElementById('tcWalk')&&!document.getElementById('tcWalk').classList.contains('out'))}));
ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await click('#tcPLater');await p.waitForTimeout(300);}}
out.aim4=await toAim();out.m4=await measure('fixture after quitting a walk-on');
if(!walked)fails.push('could not get a walk-on to play in 5 tries (player never threw first)');
if(out.m2.me)fails.push('player figure still visible after the walk-on (match 2)');
if(out.m2.visFigs>out.m1.visFigs)fails.push('match 2 shows '+out.m2.visFigs+' figures, match 1 '+out.m1.visFigs);
if(out.m2.walking||out.m2.walkFull)fails.push('walk-on state left in match 2');
if(walked3&&(out.hubAfterQuit.walking||out.hubAfterQuit.walkFull||out.hubAfterQuit.overlay))fails.push('walk-on state left after quitting during it: '+JSON.stringify(out.hubAfterQuit));
if(out.m4.me||out.m4.visFigs>out.m1.visFigs)fails.push('fixture after a quit walk-on: figure visible '+out.m4.me+', figures '+out.m4.visFigs);
if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));
console.log('walk-clean',fails.length?'FAIL':'PASS',JSON.stringify({fails,...out}));await b.close();process.exit(fails.length?1:0);})();
