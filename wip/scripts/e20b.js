// R0 #20 (Engine): what differs between match 1 and match 2 on Hayden's 3.05 path (lose match 1 0-2 -> result -> msg -> hub -> match 2,
// same opponent if the game offers it). Real rendering (iPhone UA). At the player's aim in each match, over 6 s:
// per frame: render calls, draw calls, triangles (summed over every renderer.render call), which scenes; visible figures (userData.ck roots)
// and their visible skinned meshes; AnimationMixer.update calls per frame and whose; rAF callbacks + JS ms per frame; live intervals;
// DOM nodes; running CSS animations; ANIM_CACHE keys; S.p names. node e20b.js <dir> [lose=1]  (e20 + audio sources playing, contexts, media elements, timeouts fired per s)
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2],LOSE=process.argv[3]!=='0';const T0=Date.now();
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{window.__M={on:false,fr:0,rc:0,calls:0,tris:0,scenes:new Map(),mix:new Map(),rafN:0,rafMs:0,iv:new Set()};
 const raf=requestAnimationFrame;window.requestAnimationFrame=function(f){return raf.call(window,function(x){const s=performance.now();try{return f(x);}finally{if(__M.on){__M.rafN++;__M.rafMs+=performance.now()-s;}}});};
 (function c(){if(__M.on)__M.fr++;raf.call(window,c);})();
 const si=setInterval,ci=clearInterval;window.setInterval=function(){const id=si.apply(this,arguments);__M.iv.add(id);return id;};window.clearInterval=function(id){__M.iv.delete(id);return ci.apply(this,arguments);};
 const st=setTimeout;__M.to=0;window.setTimeout=(f,ms,...a)=>st(function(){if(__M.on)__M.to++;return typeof f==='function'?f.apply(this,arguments):undefined;},Math.max(0,(ms||0)*(window.__slow?1:0.3)),...a);
 __M.src=new Set();__M.mk={};const AC=window.AudioContext||window.webkitAudioContext;if(AC){const P=AC.prototype;['createBufferSource','createOscillator','createGain','createBiquadFilter','createMediaElementSource','createConvolver','createDynamicsCompressor','createPanner','createStereoPanner','createAnalyser','createScriptProcessor'].forEach(k=>{if(!P[k])return;const o=P[k];P[k]=function(){const n=o.apply(this,arguments);__M.mk[k]=(__M.mk[k]||0)+1;return n;};});
  const S0=AudioScheduledSourceNode.prototype.start,S1=AudioScheduledSourceNode.prototype.stop;AudioScheduledSourceNode.prototype.start=function(){const me=this;__M.src.add(me);me.__t=(me.loop?'loop ':'')+(me.buffer?('buf'+(me.buffer.duration|0)+'s'):(me.frequency?'osc':'src'));me.addEventListener('ended',()=>__M.src.delete(me));return S0.apply(this,arguments);};
  __M.ctxs=0;window.AudioContext=function(){__M.ctxs++;return new AC(...arguments);};window.AudioContext.prototype=AC.prototype;window.webkitAudioContext=window.AudioContext;}
 const cnt=Audio.prototype.play;__M.media=new Set();HTMLMediaElement.prototype.play=function(){__M.media.add(this);return cnt.apply(this,arguments);};});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{const R=V._qa.renderer;const r0=R.render;R.render=function(sc,cam){const out=r0.apply(this,arguments);if(__M.on){__M.rc++;__M.calls+=R.info.render.calls;__M.tris+=R.info.render.triangles;const k=sc&&(sc.name||sc.uuid.slice(0,6))+':'+(sc.children?sc.children.length:0);__M.scenes.set(k,(__M.scenes.get(k)||0)+1);}return out;};
 const T=window.THREE;const up=T.AnimationMixer.prototype.update;T.AnimationMixer.prototype.update=function(dt){if(__M.on){const r=this.getRoot&&this.getRoot();const k=(r&&r.userData&&r.userData.ck||r&&r.name||'?')+(r&&r===V._qa.opp()?'*opp':'')+(r&&r.visible===false?'(hidden)':'');__M.mix.set(k,(__M.mix.get(k)||0)+1);}return up.apply(this,arguments);};
 save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;showHub();});
const click=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
const ev=(f,a)=>p.evaluate(f,a);
const measure=async tag=>{await p.waitForTimeout(1500);await ev(()=>{const M=__M;M.fr=0;M.rc=0;M.calls=0;M.tris=0;M.scenes.clear();M.mix.clear();M.rafN=0;M.rafMs=0;M.to=0;M.on=true;});await p.waitForTimeout(6000);
 const r=await ev(tag=>{const M=__M;M.on=false;const fr=Math.max(1,M.fr);const vis=o=>{let q=o;while(q){if(!q.visible)return false;q=q.parent;}return true;};
  let root=null;try{root=V._qa.opp().parent;while(root.parent)root=root.parent;}catch(e){}const figs=[];
  if(root)root.traverse(o=>{if(!(o.userData&&o.userData.ck))return;let a=o.parent,nested=false;while(a){if(a.userData&&a.userData.ck){nested=true;break;}a=a.parent;}if(nested)return;let sk=0,tris=0;o.traverse(m=>{if(m.isSkinnedMesh&&vis(m)){sk++;const g=m.geometry;tris+=g.index?g.index.count/3:g.attributes.position.count/3;}});figs.push(o.userData.ck+(o===V._qa.opp()?'*opp':'')+(o===V._qa.fp()?'*fp':'')+(sk?' visible sk'+sk+' '+(tris|0)+'tris':' hidden')+(o.userData.mixer?' MIXER':''));});
  let anims=0;try{anims=document.getAnimations().filter(a=>a.playState==='running').length;}catch(e){}
  return {tag,opp:S&&S.p&&S.p[1]&&S.p[1].name,frames:M.fr,renderCallsPerFrame:+(M.rc/fr).toFixed(2),drawCallsPerFrame:+(M.calls/fr).toFixed(1),trisPerFrame:(M.tris/fr)|0,scenes:[...M.scenes].map(([k,v])=>k+' x'+(v/fr).toFixed(2)),
   mixerUpdatesPerFrame:[...M.mix].map(([k,v])=>k+' '+(v/fr).toFixed(2)),rafPerFrame:+(M.rafN/fr).toFixed(2),jsMsPerFrame:+(M.rafMs/fr).toFixed(2),intervals:M.iv.size,timeoutsPerSec:+(M.to/6).toFixed(1),audioPlaying:(()=>{const c={};M.src.forEach(n=>{c[n.__t]=(c[n.__t]||0)+1;});return c;})(),audioMade:Object.assign({},M.mk),ctxs:M.ctxs,mediaPlaying:[...M.media].filter(m=>!m.paused).map(m=>(m.src||'').split('/').pop()+(m.loop?' loop':'')),dom:document.getElementsByTagName('*').length,cssAnims:anims,
   animCache:window.TOPS_RIGS?TOPS_RIGS():null,figs,info:(()=>{const i=V._qa.renderer.info;return {programs:i.programs.length,geo:i.memory.geometries,tex:i.memory.textures};})()};},tag);
 console.log('measure',JSON.stringify(r));return r;};
const toAim=async()=>{for(let i=0;i<900;i++){const st=await ev(()=>{try{const w=document.getElementById('tcWalk');if(w&&!w.classList.contains('out')){w.click();return 'walk';}if(!S)return 'nos';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim'||st==='done'||st.startsWith('ERR'))return st;await p.waitForTimeout(150);}return 'timeout';};
const play=async lose=>{for(let i=0;i<4000;i++){const st=await ev(lose=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
  if(lose){S.p[1].score=Math.min(S.p[1].score,40);if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){S.busy=true;land(400,400);}}
  else{S.p.forEach(q=>{if(q.score>60&&!S.visit.length)q.score=60;});if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const tp=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(tp.x+gauss()*12,tp.y+gauss()*12);}}return 'play';}catch(e){return 'ERR '+e.message;}},lose);
  if(st==='done'||st.startsWith('ERR'))return st;await p.waitForTimeout(60);}return 'timeout';};
const path=[];const toHub=async()=>{for(let i=0;i<90;i++){const at=await ev(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!document.querySelector('div.tcpk')&&$('msg').hidden!==false&&!(S&&!S.done));if(at)return true;
 await ev(()=>document.querySelectorAll('.cd-wrap').forEach(e=>e.remove()));for(const s of ['#tcPLater','.tcpk__later','#btnPerkLater','#msgReplies button','#c3rwGo','#btnResultNext','#btnResAction']){if(await click(s)){path.push(s);break;}}await p.waitForTimeout(500);}return false;};
for(let i=0;i<20;i++){if(await click('#tcPLater'))break;await p.waitForTimeout(150);}
let ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await click('#tcPLater');await p.waitForTimeout(300);}}
const a1=await toAim();const m1=await measure('match 1 at aim ('+a1+')');
const r1=await play(LOSE);const hub=await toHub();console.log('path',JSON.stringify({r1,hub,path}));
const hubM=await measure('hub between matches');
ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await click('#tcPLater');await p.waitForTimeout(300);}}
const a2=await toAim();const m2=await measure('match 2 at aim ('+a2+')');
console.log('e20 done',JSON.stringify({secs:(Date.now()-T0)/1000|0,pe:pe.slice(0,3)}));await b.close();})();
