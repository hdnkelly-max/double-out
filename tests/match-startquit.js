// #15 fast gate check (QA, 12 Nov): start a career Club match and quit it (the real Quit button, twice to confirm the forfeit), N times; counts after each. Companion of match-growth.js, which plays (land() -> endLeg -> endMatch,
// then the next beginMatch, as after a rematch/next fixture) and counts, after each: event listeners added and not removed (window,
// document, elements), requestAnimationFrame callbacks per second, live intervals and pending timeouts, Web Audio nodes created and
// still connected (listeners are counted only on window, document and elements still in the page), and renderer.info (geometries, textures, programs, calls). Fails if any count climbs from match 2 to match 3
// beyond a small slack (match 1 warms caches). usage: node tests/match-growth.js [dir] [matches=3]   DBG=1 prints the table
const {chromium}=require('playwright');const path=require('path');const ROOT=process.argv[2]?path.resolve(process.argv[2]):path.resolve(__dirname,'..');const N=+(process.argv[3]||3);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
await ctx.addInitScript(()=>{const G=window.__G={lis:0,lisRm:0,lisBy:{},per:new WeakMap(),raf:0,iv:new Set(),to:new Set(),nodes:0,src:0,ctx:0};
 const ael=EventTarget.prototype.addEventListener,rel=EventTarget.prototype.removeEventListener;const key=(t,type)=>(t===window?'window':t===document?'document':(t&&t.nodeName)||(t&&t.constructor&&t.constructor.name)||'?')+':'+type;
 EventTarget.prototype.addEventListener=function(type,fn,o){G.lis++;const k=key(this,type);G.lisBy[k]=(G.lisBy[k]||0)+1;try{const m=G.per.get(this)||{};m[type]=(m[type]||0)+1;G.per.set(this,m);}catch(e){}return ael.call(this,type,fn,o);};
 EventTarget.prototype.removeEventListener=function(type,fn,o){G.lisRm++;const k=key(this,type);G.lisBy[k]=(G.lisBy[k]||0)-1;try{const m=G.per.get(this);if(m&&m[type])m[type]--;}catch(e){}return rel.call(this,type,fn,o);};
 const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=function(f){G.raf++;return raf(f);};
 const si=window.setInterval.bind(window),ci=window.clearInterval.bind(window),st=window.setTimeout.bind(window),ct=window.clearTimeout.bind(window);
 window.setInterval=function(f,ms,...a){const id=si(f,ms,...a);G.iv.add(id);return id;};window.clearInterval=function(id){G.iv.delete(id);return ci(id);};
 window.setTimeout=function(f,ms,...a){let id;id=st(function(){G.to.delete(id);return typeof f==='function'?f.apply(this,arguments):null;},ms,...a);G.to.add(id);return id;};window.clearTimeout=function(id){G.to.delete(id);return ct(id);};
 const AC=window.AudioContext||window.webkitAudioContext;if(AC){const pr=AC.prototype;['createGain','createOscillator','createBufferSource','createBiquadFilter','createDynamicsCompressor','createStereoPanner','createConvolver','createDelay','createMediaElementSource','createAnalyser','createWaveShaper'].forEach(m=>{const o=pr[m];if(o)pr[m]=function(){G.nodes++;const n=o.apply(this,arguments);if(/Source|Oscillator/.test(m))G.src++;return n;};});
  const W=window.AudioContext;window.AudioContext=function(){G.ctx++;return new W(...arguments);};window.AudioContext.prototype=W.prototype;}
 const AE=window.HTMLAudioElement;if(AE){const A=window.Audio;window.Audio=function(s){G.audioEl=(G.audioEl||0)+1;return new A(s);};}});
const p=await ctx.newPage();await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;newCareer();const c=career();c.stage=null;c.tier=1;showHub();});await p.waitForTimeout(1500);
const snap=()=>p.evaluate(async()=>{const G=window.__G;const r0=G.raf;await new Promise(z=>setTimeout(z,2000));const rafPerS=(G.raf-r0)/2;const R=V._qa.renderer.info;
 const lisLive={};let live=0;const add=(t,name)=>{const m=G.per.get(t);if(!m)return;for(const ty in m){if(m[ty]>0){live+=m[ty];const k=name+':'+ty;lisLive[k]=(lisLive[k]||0)+m[ty];}}};add(window,'window');add(document,'document');document.querySelectorAll('*').forEach(el=>add(el,el.nodeName));
 return {lis:live,rafPerS:Math.round(rafPerS),iv:G.iv.size,to:G.to.size,nodes:G.nodes,srcs:G.src,actx:G.ctx,audioEl:G.audioEl||0,geo:R.memory.geometries,tex:R.memory.textures,progs:R.programs.length,lisLive};});
const rows=[Object.assign({m:0},await snap())];
for(let i=1;i<=N;i++){await p.evaluate(()=>{beginMatch({mode:'career',tier:1,p0:'H',oppName:'Deano Marsh',oppAvg:60,legs:3});});await p.waitForTimeout(6000);
 const q=await p.evaluate(async()=>{const b=$('btnQuit');if(!b)return 'no quit button';b.click();await new Promise(z=>setTimeout(z,200));b.click();await new Promise(z=>setTimeout(z,1500));return (!S||S.done)?'quit':'still playing';});
 rows.push(Object.assign({m:i,q},await snap()));}
const f=[];const a=rows[1],z=rows[rows.length-1];const K={lis:3,rafPerS:12,iv:1,to:6,actx:0,audioEl:0,geo:30,tex:8,progs:3};
Object.keys(K).forEach(k=>{if(z[k]-a[k]>K[k])f.push(`${k} grows start→quit to start→quit: ${rows.map(r=>r[k]).join(' → ')}`);});
const dn=rows.slice(1).map((r,i)=>r.nodes-rows[i].nodes);if(dn.length>2&&dn[dn.length-1]-dn[1]>30)f.push('audio nodes per start keep rising: '+dn.join(' → '));
const grown=Object.keys(z.lisLive).filter(k=>(z.lisLive[k]||0)-(a.lisLive[k]||0)>=2).map(k=>k+' '+(a.lisLive[k]||0)+'→'+z.lisLive[k]);if(grown.length)f.push('live listeners growing: '+grown.slice(0,8).join(', '));
rows.forEach(r=>{if(r.q&&r.q!=='quit')f.push(`start ${r.m}: ${r.q}`);});
rows.forEach(r=>{const o=Object.assign({},r);delete o.lisLive;console.log(JSON.stringify(o));});
if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log(`PASS: start + quit ${N}x: nothing grows (live listeners, rAF, timers, audio, GPU memory)`);})();
