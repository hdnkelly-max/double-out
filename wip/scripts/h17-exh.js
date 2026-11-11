// R0 #17 (Engine): the exhibition-invite path into match 2 vs a normal match 1. node h17-exh.js <dir>
// Page opened with ?exh=1 (the game's own switch that forces an invite). First poster: "Not tonight". Match 1 from the hub (#c3Go),
// played out, result -> hub. Then the hub's exhibition tile -> "Accept invite" (#tcPGo) -> match 2, as Hayden did.
// At the player's aim in each match (rendering ON): every figure in the drawn scenes (visible, key, position), draw calls and triangles
// per frame, rAF callbacks per frame and their JS ms, page nodes, page changes / style recalc ms (CDP) over 4 s.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2];const T0=Date.now();const t=()=>((Date.now()-T0)/1000|0)+'s';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));const cdp=await ctx.newCDPSession(p);
await p.addInitScript(()=>{const st=setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.06),...a);
 const raf=requestAnimationFrame;window.__R={cb:0,fr:0,ms:0};window.requestAnimationFrame=function(f){return raf.call(window,function(x){const s=performance.now();try{return f(x);}finally{__R.cb++;__R.ms+=performance.now()-s;}});};(function c(){__R.fr++;raf.call(window,c);})();});
await p.goto('file://'+dir+'/index.html?exh=1');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
await p.evaluate(()=>{const R=V._qa.renderer;window.__SC=new Map();const r0=R.render.bind(R);R.render=function(sc,cam){if(sc&&sc.isScene)__SC.set(sc,(__SC.get(sc)||0)+1);return r0(sc,cam);};
 save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet:not(.tc-poster)').forEach(e=>e.remove());V.walkOn=null;showHub();});
const click=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
// decline the first invite
for(let i=0;i<30;i++){if(await click('#tcPLater'))break;await p.waitForTimeout(200);}console.error(t(),'loaded, first poster declined:',await p.evaluate(()=>!document.querySelector('.tc-poster')));
await cdp.send('Performance.enable');
const snap=async tag=>{await p.waitForTimeout(1500);const g=(a,k)=>(a.find(x=>x.name===k)||{}).value||0;const m0=(await cdp.send('Performance.getMetrics')).metrics;
 const a0=await p.evaluate(()=>{const R=V._qa.renderer;R.info.autoReset=true;window.__MU=0;window.__MO=new MutationObserver(l=>{__MU+=l.length;});__MO.observe(document.body,{subtree:true,attributes:true,childList:true,characterData:true});__SC.clear();return {cb:__R.cb,fr:__R.fr,ms:__R.ms};});
 await p.waitForTimeout(4000);const m1=(await cdp.send('Performance.getMetrics')).metrics;
 const r=await p.evaluate(a0=>{__MO.disconnect();const R=V._qa.renderer;const frames=__R.fr-a0.fr;
  const figs=[];const scenes=[];__SC.forEach((n,sc)=>{let objs=0;sc.traverse(()=>objs++);scenes.push({children:sc.children.length,objs,renders:n});sc.traverse(o=>{if(o.userData&&o.userData.ck&&!o.parent?.userData?.ck){let vis=o.visible;let q=o.parent;while(q&&vis){vis=q.visible;q=q.parent;}let skinned=0,tris=0;o.traverse(x=>{if(x.isSkinnedMesh)skinned++;if(x.isMesh&&x.geometry){const gi=x.geometry.index;tris+=gi?gi.count/3:(x.geometry.attributes.position?x.geometry.attributes.position.count/3:0);}});const w=new THREE.Vector3();o.getWorldPosition(w);figs.push({ck:o.userData.ck,vis,skinned,tris:tris|0,pos:[+w.x.toFixed(2),+w.z.toFixed(2)],isOpp:o===V._qa.opp(),isFp:o===V._qa.fp()});}});});
  return {frames,rafCbPerFrame:+((__R.cb-a0.cb)/Math.max(1,frames)).toFixed(2),jsMsPerFrame:+((__R.ms-a0.ms)/Math.max(1,frames)).toFixed(1),calls:R.info.render.calls,tris:R.info.render.triangles,scenes,figs,nodes:document.getElementsByTagName('*').length,mut:__MU,exh:S&&S.tcExh||null,opp:S&&S.p[1]&&S.p[1].name,bodyCls:document.body.className};},a0);
 r.styleMs=+((g(m1,'RecalcStyleDuration')-g(m0,'RecalcStyleDuration'))*1000).toFixed(0);r.styles=g(m1,'RecalcStyleCount')-g(m0,'RecalcStyleCount');r.tag=tag;console.log(JSON.stringify(r));console.error(t(),tag);return r;};
const toAim=async()=>{for(let i=0;i<900;i++){const st=await p.evaluate(()=>{try{if(!S)return 'nos';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}const o=V._qa.opp();if(S.cur===0&&!S.busy&&!S.p[0].ai&&o&&o.userData&&o.userData.ck)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});
 if(st==='aim'||st==='done'||st.startsWith('ERR'))return st;await p.waitForTimeout(100);}return 'timeout';};
const finish=async()=>{for(let i=0;i<3000;i++){const st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
   S.p.forEach(q=>{if(q.score>60&&!S.visit.length)q.score=60;});if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const tp=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(tp.x+gauss()*12,tp.y+gauss()*12);}return 'play';}catch(e){return 'ERR '+e.message;}});
  if(st==='done'||st.startsWith('ERR'))return st;await p.waitForTimeout(40);}};
// match 1, normal fixture from the hub
let ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await click('#tcPLater');await p.waitForTimeout(300);}}
console.error(t(),'m1 start',ok,await toAim());const A=await snap('match1 (fixture)');
await finish();const path=[];for(let i=0;i<80;i++){const atHub=await p.evaluate(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!(S&&!S.done));if(atHub)break;
 await p.evaluate(()=>document.querySelectorAll('.cd-wrap').forEach(e=>e.remove()));for(const s of ['#tcPLater','#c3rwGo','#btnResAction','#btnResultNext']){if(await click(s)){path.push(s);break;}}await p.waitForTimeout(400);}
console.error(t(),'back at hub via',path.join('>'));
// match 2: the exhibition invite, accepted
await p.waitForTimeout(800);let opened=await click('#tcExhTile');if(!opened){await p.evaluate(()=>{try{showHub();}catch(e){}});await p.waitForTimeout(800);opened=await click('#tcExhTile');}
let acc=false;for(let i=0;i<30&&!acc;i++){acc=await click('#tcPGo');if(!acc)await p.waitForTimeout(200);}
console.error(t(),'invite tile',opened,'accepted',acc,await toAim());const B=await snap('match2 (exhibition invite)');
console.log('h17',JSON.stringify({m1:{opp:A.opp,figs:A.figs.length,visFigs:A.figs.filter(f=>f.vis).length,calls:A.calls,tris:A.tris,raf:A.rafCbPerFrame,js:A.jsMsPerFrame,nodes:A.nodes,mut:A.mut,styleMs:A.styleMs,scenes:A.scenes.length},
 m2:{opp:B.opp,exh:B.exh,figs:B.figs.length,visFigs:B.figs.filter(f=>f.vis).length,calls:B.calls,tris:B.tris,raf:B.rafCbPerFrame,js:B.jsMsPerFrame,nodes:B.nodes,mut:B.mut,styleMs:B.styleMs,scenes:B.scenes.length},pe:pe.slice(0,3),secs:(Date.now()-T0)/1000|0}));await b.close();})();
