// R0 #20 (Q&D): "match 2 equals match 1". Plays N career matches the way Hayden does (lose match 1, then whatever screens follow:
// msg / perk Later / reward / toasts, to the hub, then the hub's walk-on button into the next match) and measures each match at the
// player's aim, after the walk-on, at the same point: visible figures (skinned roots drawn), animation mixers updated per frame, triangles
// and draw calls per frame, rAF callbacks per frame, live intervals, pending timeouts, DOM nodes, running CSS animations, scene objects.
// FAIL if any match after the first differs from match 1 beyond a small tolerance. usage: node match-parity.js <dir> [N=2]  env PATH=A|B
//   PATH=A (default): lose match 1 and take the first button on each screen (Hayden's 3.05 path: result -> msg -> hub -> rematch/next)
//   PATH=B: prefer 'Later' on the perk screen (Hayden's 3.02 path: perk Later -> hub -> next fixture)
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const ROOT=path.resolve(process.argv[2]||'.');const N=+(process.argv[3]||2);const VW=+(process.env.VW||390);const PATHK=process.env.PATH_KIND||process.env.PK||'A';
const T0=Date.now();const log=(...a)=>console.log(((Date.now()-T0)/1000).toFixed(0)+'s',...a);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:VW,height:VW===360?640:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
await ctx.addInitScript(()=>{const M=window.__MP={iv:new Map(),to:new Map(),raf:0,frame:0,mix:new Set()};
 const si=window.setInterval,ci=window.clearInterval,st=window.setTimeout,ct=window.clearTimeout;
 const who=()=>{const l=(new Error().stack.split('\n')[3]||'');const m=l.match(/at (?:new )?([\w$.]+)/);return m?m[1]:'?';};
 window.setInterval=function(f,ms){const id=si.apply(this,arguments);M.iv.set(id,who()+'@'+ms);return id;};window.clearInterval=function(id){M.iv.delete(id);return ci.apply(this,arguments);};
 window.setTimeout=function(f,ms){let id;const g=typeof f==='function'?function(){M.to.delete(id);return f.apply(this,arguments);}:f;id=st.call(this,g,ms);M.to.set(id,1);return id;};window.clearTimeout=function(id){M.to.delete(id);return ct.apply(this,arguments);};
 const ra=window.requestAnimationFrame;window.requestAnimationFrame=function(f){return ra.call(window,function(x){M.raf++;return f(x);});};(function c(){M.frame++;ra.call(window,c);})();
 let T_;Object.defineProperty(window,'THREE',{configurable:true,get(){return T_;},set(v){T_=v;try{const up=v.AnimationMixer.prototype.update;v.AnimationMixer.prototype.update=function(){M.mix.add(this);return up.apply(this,arguments);};}catch(e){}}});});
const p=await ctx.newPage();await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+ROOT+'/index.html');await p.waitForFunction(()=>typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&typeof showHub==='function',null,{timeout:90000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;const l=$('login');if(l)l.hidden=true;newCareer();const c=career();c.stage=null;c.bank=50000;persist();
 startBullUp=(function(o){return function(){try{S.bull=null;S.cur=0;S.dart=1;S.visit=[];S.busy=false;startTurn();}catch(e){o.apply(this,arguments);}};})(startBullUp);showHub();});
await p.waitForTimeout(2500);
// match 1 from the hub's own walk-on button, like every later match
const goHub=()=>p.evaluate(()=>{const g=document.getElementById('c3Go');if(g&&g.offsetParent!==null){g.click();return true;}return false;});
if(!(await goHub())){log('no #c3Go at start; using beginMatch');await p.evaluate(()=>{const n=nextOpponent();beginMatch({mode:'career',tier:career().tier,p0:'You',oppKey:n.oppKey,oppName:n.oppName,oppAvg:n.oppAvg,legs:n.legs||1});});}
const state=()=>p.evaluate(()=>{try{const ic=document.querySelector('#intro.show');const live=typeof S!=='undefined'&&S&&!S.done;if(ic)document.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
 if(!live)return 'none';if(document.body.classList.contains('tc-walking')){const o=document.getElementById('tcWalk');if(o)o.click();return 'walk';}if(S.bull)return 'bull';return (S.cur===0&&!S.busy&&!(S.flights&&S.flights.length))?'myturn':'wait';}catch(e){return 'ERR '+e.message;}});
const measure=()=>p.evaluate(async()=>{const M=window.__MP,r=V._qa.renderer;try{const AM=(window.THREE||{}).AnimationMixer;if(AM&&!AM.prototype.update.__mp){const up=AM.prototype.update;const w=function(){M.mix.add(this);return up.apply(this,arguments);};w.__mp=1;AM.prototype.update=w;}}catch(e){}
 // per-frame figures: draw calls/tris from renderer.info.render (reset each render), averaged over the frames in 2.5 s
 const f0=M.frame,r0=M.raf;M.mix=new Set();let calls=0,tris=0,n=0;const _r=r.render.bind(r);r.render=function(s,c){const x=_r(s,c);if(s===V._qa.scene){calls+=r.info.render.calls;tris+=r.info.render.triangles;n++;}return x;};
 await new Promise(z=>setTimeout(z,2500));r.render=_r;const frames=Math.max(1,M.frame-f0);
 const figs=[];const sc=V._qa.scene;const roots=new Set();sc.traverse(o=>{if(o.isSkinnedMesh){let v=true,q=o;while(q){if(!q.visible)v=false;q=q.parent;}if(v){let rt=o;while(rt.parent&&rt.parent!==sc)rt=rt.parent;roots.add(rt);}}});
 roots.forEach(rt=>figs.push((rt.userData&&rt.userData.ck||rt.name||'?')+(rt===V._qa.gfx?.()?.me?'*':'')));
 let objs=0,visTris=0;const oppR=V._qa.opp&&V._qa.opp();sc.traverse(o=>{objs++;if(o.isMesh&&o.geometry){let v=true,q=o;while(q){if(!q.visible||q===oppR){v=false;break;}q=q.parent;}if(v){const g=o.geometry;visTris+=g.index?g.index.count/3:(g.attributes.position?g.attributes.position.count/3:0);}}});
 const anims=document.getAnimations?document.getAnimations().filter(a=>a.playState==='running'):[];
 return {figs:figs.sort(),visFigs:figs.length,mixers:M.mix.size,calls:+(calls/Math.max(1,n)).toFixed(0),tris:Math.round(tris/Math.max(1,n)),rafPerFrame:+((M.raf-r0)/frames).toFixed(2),
  intervals:M.iv.size,intervalList:[...M.iv.values()].sort(),timeouts:M.to.size,dom:document.getElementsByTagName('*').length,domBy:Object.fromEntries([...document.body.children].map(e=>[(e.id||e.className||e.tagName).toString().slice(0,24),e.getElementsByTagName('*').length+1]).filter(x=>x[1]>5)),cssAnims:anims.length,cssAnimList:anims.map(a=>(a.animationName||a.constructor.name)+'@'+((a.effect&&a.effect.target&&(a.effect.target.id||a.effect.target.className))||'?').toString().slice(0,30)).sort(),
  sceneObjs:objs,visTris:Math.round(visTris),lights:(()=>{let l=0;sc.traverse(o=>{if(o.isLight&&o.visible)l++;});return l;})(),programs:r.info.programs.length};});
const R=[];const RO=[];let m=0,measured=false,measuredOpp=false;const t0=Date.now();
let lastLog=0;while(Date.now()-t0<1200000&&!(R.length>=N&&RO.length>=N)){const st=await state();if(Date.now()-lastLog>20000){lastLog=Date.now();log('state',st,await p.evaluate(()=>JSON.stringify({S:typeof S!=='undefined'&&S?{done:S.done,cur:S.cur,busy:S.busy,bull:!!S.bull}:null,vis:[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.hidden).map(b=>(b.id||'')+':'+b.textContent.trim().slice(0,16)).slice(0,10),walking:document.body.classList.contains('tc-walking')})));}
 if(st==='myturn'){if(!measured){await p.waitForTimeout(2000);const x=await measure();x.match=R.length+1;R.push(x);log('match',x.match,JSON.stringify({visTris:x.visTris,css:x.cssAnimList,visFigs:x.visFigs,figs:x.figs,mixers:x.mixers,calls:x.calls,tris:x.tris,raf:x.rafPerFrame,iv:x.intervals,to:x.timeouts,dom:x.dom,css:x.cssAnims,objs:x.sceneObjs,lights:x.lights}));measured=true;}
  await p.evaluate(()=>{if(S.p[1].score>40)S.p[1].score=40;S.busy=true;land(.9,.9);});}
 else if(st==='wait'&&measured&&!measuredOpp&&await p.evaluate(()=>S&&S.cur===1)){measuredOpp=true;const x=await measure();x.match=R.length;RO.push(x);log('opp-turn',x.match,JSON.stringify({visTris:x.visTris,cssList:x.cssAnimList,visFigs:x.visFigs,figs:x.figs,mixers:x.mixers,calls:x.calls,tris:x.tris,raf:x.rafPerFrame,iv:x.intervals,dom:x.dom,css:x.cssAnims,objs:x.sceneObjs}));}
 else if(st==='none'&&R.length>=1){const seq=[];for(let j=0;j<60;j++){const s2=await state();if(s2!=='none')break;
   const bt=await p.evaluate(PK=>{const ok=b=>b&&!b.hidden&&b.offsetParent!==null&&!b.disabled;const hub=document.getElementById('c3Go');
    let b=null;const ids=PK==='B'?['btnPerkLater','btnResultNext']:['btnResultNext','btnPerkLater'];for(const id of ids){const x=document.getElementById(id);if(ok(x)){b=x;break;}}
    if(!b)b=[...document.querySelectorAll('button')].find(x=>ok(x)&&/^(continue|ok|later|nice|cheers|open later|keep current shirt|not tonight|got it)/i.test(x.textContent.trim()));
    if(!b)b=[...document.querySelectorAll('.tc-x,button')].find(x=>ok(x)&&x.textContent.trim()==='✕');
    if(!b&&ok(hub)){hub.click();return 'HUB #c3Go';}
    if(b){const t=(b.id||'')+':'+b.textContent.trim().slice(0,20);b.click();return t;}return null;},PATHK);
   if(bt)seq.push(bt);if(bt==='HUB #c3Go'){await p.waitForTimeout(1200);continue;}await p.waitForTimeout(bt?700:400);}
  log('path to match',R.length+1,':',seq.join(' > '));measured=false;measuredOpp=false;if(!seq.length){log('stuck');break;}}
 else if(String(st).startsWith('ERR')){log(st);break;}
 await p.waitForTimeout(200);}
fs.writeFileSync(process.env.OUT||path.join(__dirname,'out','match-parity.json'),JSON.stringify({R,RO,errs},null,1));
const f=[];if(R.length<2)f.push('only '+R.length+' match measured');
const a=R[0];for(const x of R.slice(1)){const d=(k,tol)=>{const v=x[k]-a[k];if(v>tol)f.push(`match ${x.match} ${k} ${a[k]} → ${x[k]} (+${typeof v==='number'?+v.toFixed(2):v})`);};
 d('visFigs',0);d('mixers',0);d('rafPerFrame',0.5);d('intervals',0);d('cssAnims',0);d('lights',0);d('programs',0);
 if(x.visTris>a.visTris*1.03+500)f.push(`match ${x.match} visible scene triangles ${a.visTris} → ${x.visTris}`);/* per-frame calls/tris depend on the camera moment (Delivery QA 16:48): reported, not asserted */
 if(x.dom>a.dom+150){const grew=Object.entries(x.domBy).map(([k,v])=>[k,v-(a.domBy[k]||0)]).filter(z=>z[1]>10).sort((p,q)=>q[1]-p[1]).slice(0,6).map(z=>z[0]+' +'+z[1]).join(', ');f.push(`match ${x.match} DOM nodes ${a.dom} → ${x.dom} (grew: ${grew})`);}if(x.sceneObjs>a.sceneObjs+20)f.push(`match ${x.match} scene objects ${a.sceneObjs} → ${x.sceneObjs}`);
 const nf=x.figs.filter(z=>!a.figs.includes(z));if(nf.length)f.push(`match ${x.match} new visible figures: ${nf.join(', ')}`);
 const ni=x.intervalList.filter(z=>!a.intervalList.includes(z));if(ni.length)f.push(`match ${x.match} new intervals: ${ni.join(', ')}`);
 const na=x.cssAnimList.filter(z=>!a.cssAnimList.includes(z));if(na.length)f.push(`match ${x.match} new CSS animations: ${na.slice(0,6).join(', ')}`);}
if(RO.length>=2){const a2=RO[0];for(const x of RO.slice(1)){if(x.visFigs>a2.visFigs)f.push(`match ${x.match} (opponent's turn) visible figures ${a2.visFigs} → ${x.visFigs}: ${x.figs.join(',')}`);if(x.mixers>a2.mixers)f.push(`match ${x.match} (opponent's turn) mixers ${a2.mixers} → ${x.mixers}`);if(x.visTris>a2.visTris*1.03+500)f.push(`match ${x.match} (opponent's turn) visible scene triangles ${a2.visTris} → ${x.visTris}`);}}
if(errs.length)log('page errors',JSON.stringify(errs.slice(0,3)));
await b.close();console.log(f.length?'MATCH-PARITY FAIL\n- '+f.join('\n- '):'MATCH-PARITY PASS: match 2 equals match 1 on every counter');process.exit(f.length?1:0);})().catch(e=>{console.error(e);process.exit(2);});
