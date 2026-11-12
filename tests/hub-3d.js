// ENG-13 (#20, Overseer 07:12): no 3D frame while an opaque full-screen menu covers the scene and no match is live.
// node tests/hub-3d.js <dir>   (390x844 iPhone profile, real GL via SwiftShader, rebrand on unless RBOFF=1)
// Per screen, 4 s: main-scene renders/s (TOPS_R.render to the screen; render-target renders = portraits/heroes counted apart), V.frame JS
// ms/s, page frames/s (rAF) and the longest frame gap, whether an opaque menu is over the canvas.
// PASS (fix): rebrand hub, its Menu sheet open: 0 main renders; a screen with nothing opaque over the canvas still draws (the creator's 3D
// preview); after Walk on the match draws again within 2 frames of the match going live; portraits still render (headshot on demand);
// with the 'hub3d' switch the hub draws again (the A/B). The film grain layer (#grain: 4x-screen, blend mode overlay, animated, z 2 under the
// hub's z 50) is off while the menu covers the scene and back in the match. The live build is reported for the before numbers (it fails the 0-render rows).
const {chromium,devices}=require('playwright');const path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]||path.join(__dirname,'..'));const fails=[];const out=[];
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const page=async(q20)=>{const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.addInitScript(()=>{try{localStorage.setItem('tops_rebrand','1');}catch(e){}const A=window.__H={raf:0,gaps:[]};let last=0;
  const raf=window.requestAnimationFrame;window.requestAnimationFrame=function(f){return raf(function(t){A.raf++;if(last)A.gaps.push(t-last);last=t;return f.apply(this,arguments);});};});
 await p.goto('file://'+dir+'/index.html'+(q20?'?q20='+q20:''));
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof showHub==='function'&&window.TOPS_R&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
 await p.evaluate(()=>{const R=TOPS_R,A=__H;A.main=0;A.rt=0;A.ms=0;A.firstLive=null;const rr=R.render;R.render=function(){if(R.getRenderTarget())A.rt++;else{A.main++;if(A.wantLive&&typeof S!=='undefined'&&S&&!S.done&&A.firstLive==null)A.firstLive=performance.now();}return rr.apply(this,arguments);};
  const vf=V.frame;V.frame=function(){const t=performance.now();const r=vf.apply(this,arguments);A.ms+=performance.now()-t;return r;};
  save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;if(!career())newCareer();career().tier=0;save.tcIntro=1;save.tcWelcomed=1;try{persist();}catch(e){}document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();});
 for(let i=0;i<40;i++){const busy=await p.evaluate(()=>{try{const r=TOPS_RIGS();return !!((r.wait&&r.wait.length)||r.loading);}catch(e){return false;}});if(!busy)break;await p.waitForTimeout(250);}await p.waitForTimeout(1500);
 return {p,ctx,pe};};
const sample=async(p,tag,ms)=>{await p.evaluate(()=>{const A=__H;A.main=0;A.rt=0;A.ms=0;A.raf=0;A.gaps=[];A.t0=performance.now();});await p.waitForTimeout(ms||4000);
 const r=await p.evaluate(()=>{const A=__H;const s=(performance.now()-A.t0)/1000;const cv=document.getElementById('scene');const st=document.elementsFromPoint(innerWidth/2,innerHeight/2);
  return {mainPs:+(A.main/s).toFixed(1),rtPs:+(A.rt/s).toFixed(1),vframeMsPs:+(A.ms/s).toFixed(1),fps:+(A.raf/s).toFixed(1),maxGapMs:Math.round(Math.max(0,...A.gaps)),
   top:st.slice(0,2).map(e=>e.id||e.className&&String(e.className).split(' ')[0]||e.tagName).join(' > '),covers:window.TOPS_menuCovers?TOPS_menuCovers():null,grain:(()=>{const g=document.getElementById('grain');return g?getComputedStyle(g).display:null;})(),live:!!(S&&!S.done)};});
 const o=Object.assign({tag},r);out.push(o);return o;};
// 1. rebrand hub, Menu sheet, creator, match
{const {p,ctx,pe}=await page('');
 const hub=await sample(p,'rebrand hub');
 await p.locator('#rbMenu').tap();await p.waitForTimeout(300);const sheet=await sample(p,'rebrand Menu sheet open');await p.locator('#rbMenu').tap().catch(()=>{});await p.waitForTimeout(300);
 // portrait on demand while the hub is up
 const hs=await p.evaluate(()=>{try{const A=__H;const n=A.rt;const hsf=V.portrait||V.headshot;const u=hsf&&hsf(save.look||{},'HS'+Date.now(),0);return {called:!!hsf,rt:A.rt-n,ok:!!u&&A.rt-n>0};}catch(e){return {err:e.message};}});out.push({tag:'headshot in the hub',hs});
 await p.evaluate(()=>{try{showScreen('creator');}catch(e){}});await p.waitForTimeout(600);const cr=await sample(p,'creator (3D preview)',3000);await p.evaluate(()=>{try{showHub();}catch(e){}});await p.waitForTimeout(800);
 // Walk on: the match draws again at once
 await p.evaluate(()=>{__H.wantLive=true;__H.firstLive=null;__H.liveAt=null;const bm=beginMatch;beginMatch=function(){const r=bm.apply(this,arguments);if(__H.liveAt==null)__H.liveAt=performance.now();return r;};});
 await p.locator('#rbGo').tap();for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>__H.firstLive!=null))break;}
 const wl=await p.evaluate(()=>({liveAt:__H.liveAt,firstLive:__H.firstLive,gap:__H.liveAt&&__H.firstLive?Math.round(__H.firstLive-__H.liveAt):null,frameMs:(()=>{const g=__H.gaps.slice(-20).sort((a,b)=>a-b);return g.length?Math.round(g[g.length>>1]):null;})()}));out.push({tag:'walk on -> first match frame',wl});
 await p.waitForTimeout(2500);const m=await sample(p,'match (walk-on/intro)',3000);
 if(hub.mainPs>0)fails.push('rebrand hub draws 3D: '+hub.mainPs+'/s');if(sheet.mainPs>0)fails.push('Menu sheet open draws 3D: '+sheet.mainPs+'/s');
 if(!(cr.mainPs>0))fails.push('creator 3D preview not drawn');if(hub.grain!=='none')fails.push('film grain layer still on under the opaque hub');if(m.grain==='none')fails.push('film grain missing in the match');if(!(m.mainPs>0))fails.push('match not drawn');
 if(wl.gap==null||wl.gap>Math.max(2*(wl.frameMs||16),400))fails.push('match drew late after Walk on: '+JSON.stringify(wl));
 if(hs.err||!hs.ok)fails.push('headshot in the hub failed: '+JSON.stringify(hs));
 if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));await ctx.close();}
// 2. the A/B switch
{const {p,ctx}=await page('hub3d');const h=await sample(p,'rebrand hub, q20=hub3d (old behaviour)');if(!(h.mainPs>0))fails.push('hub3d switch does not restore drawing');await ctx.close();}
await b.close();out.forEach(o=>console.log(JSON.stringify(o)));console.log(JSON.stringify({fails}));console.log(fails.length?'HUB-3D FAIL':'HUB-3D PASS');process.exit(fails.length?1:0);})();
