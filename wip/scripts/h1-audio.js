// R0 #16 H1 (Engine): does anything in the audio graph, the loops/timers, render targets or speech queue grow from match 1 to 2 to 3?
// node h1-audio.js <dir> [matches=3]. Real path: hub Play next -> match (player via land(), AI its own way, sped-up timers) -> result
// -> Continue -> hub -> Play next. Mid-match snapshot at the player's first aim of each match (+1.5 s), and one at the hub after each.
// Audio: every node made by any create*() gets a WeakRef + owner (game function on the stack); before counting we force a GC, so
// "alive" = something (JS or the audio graph) still holds it. Also playing sources (started, not ended), AudioContexts and their state.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],N=+(process.argv[3]||3);const T0=Date.now();const t=()=>((Date.now()-T0)/1000|0)+'s';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required','--js-flags=--expose-gc']});
const ctx=await b.newContext({viewport:{width:360,height:640},screen:{width:360,height:640},hasTouch:true,isMobile:true});
const p=await ctx.newPage();await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{const A=window.__H={nodes:[],src:new Set(),ctx:[],iv:new Set(),to:new Set(),raf:0,fr:0,fb:0,rb:0,speak:0};Error.stackTraceLimit=30;
 const own=()=>{const o=[];for(const l of String(new Error().stack).split('\n').slice(3)){const m=l.match(/at (?:new )?([\w$.]+) \((.*?):\d+:\d+\)/);if(!m||/^(Array|Object|Function|Promise)\./.test(m[1]))continue;o.push(m[1].replace(/^.*\./,''));if(o.length>=2)break;}return o.join('<')||'?';};
 const B=window.BaseAudioContext||window.AudioContext;for(const k of Object.getOwnPropertyNames(B.prototype)){if(!/^create/.test(k)||k==='createBuffer'||k==='createPeriodicWave'||typeof B.prototype[k]!=='function')continue;const o=B.prototype[k];
  B.prototype[k]=function(){const n=o.apply(this,arguments);A.nodes.push([new WeakRef(n),k.slice(6)+' '+own()]);if(n&&n.start){const st=n.start;n.start=function(){A.src.add(n);n.addEventListener('ended',()=>A.src.delete(n));return st.apply(n,arguments);};const sp=n.stop;n.stop=function(){A.src.delete(n);return sp.apply(n,arguments);};}return n;};}
 const AC=window.AudioContext;if(AC){const W=function(...a){const c=new AC(...a);A.ctx.push(c);return c;};W.prototype=AC.prototype;window.AudioContext=W;window.webkitAudioContext=W;}
 const si=setInterval,ci=clearInterval,st=setTimeout,ct=clearTimeout;window.setInterval=function(){const id=si.apply(window,arguments);A.iv.add(id);return id;};window.clearInterval=function(id){A.iv.delete(id);return ci.apply(window,arguments);};
 window.setTimeout=function(f,ms,...a){let id;id=st(function(){A.to.delete(id);if(typeof f==='function')return f.apply(this,arguments);},Math.max(0,(ms||0)*0.06),...a);A.to.add(id);return id;};window.clearTimeout=function(id){A.to.delete(id);return ct.apply(window,arguments);};
 const raf=requestAnimationFrame;window.requestAnimationFrame=function(f){return raf.call(window,function(x){A.raf++;return f(x);});};(function c(){A.fr++;raf.call(window,c);})();
 for(const C of [WebGLRenderingContext,window.WebGL2RenderingContext].filter(Boolean)){const P=C.prototype;for(const [mk,dl,key] of [['createFramebuffer','deleteFramebuffer','fb'],['createRenderbuffer','deleteRenderbuffer','rb']]){const m=P[mk],d=P[dl];P[mk]=function(){A[key]++;return m.apply(this,arguments);};P[dl]=function(){A[key]--;return d.apply(this,arguments);};}}
 if(window.speechSynthesis){const sp=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=function(u){A.speak++;return sp(u);};}});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=Date.now();save.tcWelcomed=Date.now();document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();V.walkOn=()=>{};});
console.error(t(),'loaded');
const snap=async tag=>{const a0=await p.evaluate(()=>[__H.raf,__H.fr]);await p.waitForTimeout(1500);
 return p.evaluate(([tag,a0])=>{gc();gc();const A=__H;const by={};let alive=0;A.nodes.forEach(([w,k])=>{if(w.deref()){alive++;by[k]=(by[k]||0)+1;}});
  return {tag,made:A.nodes.length,alive,by,playing:A.src.size,loops:[...A.src].filter(s=>s.loop).length,ctx:A.ctx.map(c=>c.state),rafPerFrame:+((A.raf-a0[0])/Math.max(1,A.fr-a0[1])).toFixed(2),iv:A.iv.size,to:A.to.size,fb:A.fb,rb:A.rb,speak:A.speak,speechPending:window.speechSynthesis?(speechSynthesis.pending|0)+'/'+(speechSynthesis.speaking|0):null,dom:document.getElementsByTagName('*').length};},[tag,a0]);};
const click=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
const rows=[];
for(let m=1;m<=N;m++){
 let started=false;for(let i=0;i<60&&!started;i++){await p.evaluate(()=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());});started=await click('#btnPlayNext');if(!started){await click('#c3Go');await p.waitForTimeout(400);}}
 for(let i=0;i<300;i++){const st=await p.evaluate(()=>{try{if(!S)return 'wait';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim'||st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(100);}
 rows.push(await snap('mid'+m));console.log(JSON.stringify(rows[rows.length-1]));console.error(t(),'mid',m);
 for(let i=0;i<3000;i++){const st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
   S.p.forEach(q=>{if(q.score>60&&!S.visit.length)q.score=60;});if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const tp=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(tp.x+gauss()*12,tp.y+gauss()*12);}return 'play';}catch(e){return 'ERR '+e.message;}});
  if(st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(40);}
 for(let i=0;i<80;i++){const atHub=await p.evaluate(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])'));if(atHub)break;await p.evaluate(()=>document.querySelectorAll('.tc-sheet,.cd-wrap').forEach(e=>e.remove()));for(const s of ['#c3rwGo','#btnResultNext'])await click(s);await p.waitForTimeout(400);}
 rows.push(await snap('hub'+m));console.log(JSON.stringify(rows[rows.length-1]));console.error(t(),'hub',m);}
const mids=rows.filter(r=>/^mid/.test(r.tag));const a=mids[0],z=mids[mids.length-1];const grew={};Object.keys(z.by).forEach(k=>{const d=z.by[k]-(a.by[k]||0);if(d>0)grew[k]=(a.by[k]||0)+'→'+z.by[k];});
console.log('h1',JSON.stringify({mid:mids.map(r=>({alive:r.alive,made:r.made,playing:r.playing,loops:r.loops,raf:r.rafPerFrame,iv:r.iv,to:r.to,fb:r.fb,rb:r.rb,speak:r.speak,sp:r.speechPending,dom:r.dom,ctx:r.ctx.join(',')})),grewMid1toLast:grew,pe:pe.slice(0,3),secs:(Date.now()-T0)/1000|0}));await b.close();})();
