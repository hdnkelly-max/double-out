// R0 #19 (Engine): how many shader programs does the game itself compile and delete per phase (real rendering, no extra compile calls)?
// node e19-churn.js <dir>. iPhone UA. Phases: hub idle 10 s, fixture start -> at aim 8 s, match end -> hub 10 s, next fixture -> at aim 8 s.
// Counts: fragment shader compiles (gl.shaderSource), gl.deleteProgram, link failures, showHub / buildVenue / setPlayerLook / beginMatch calls,
// renderer.info.programs, and which material types were compiled.
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2];const T0=Date.now();
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{const C=window.__C={fr:0,del:0,linkFail:0,names:{},calls:{}};
 for(const P of [WebGLRenderingContext.prototype,window.WebGL2RenderingContext&&WebGL2RenderingContext.prototype].filter(Boolean)){
  const ss=P.shaderSource;P.shaderSource=function(sh,src){if(/SHADER_NAME/.test(src)&&/gl_FragColor|pc_fragColor|fragColor/.test(src)){C.fr++;const m=src.match(/#define SHADER_NAME ([^\n]+)/);const n=m?m[1]:'?';C.names[n]=(C.names[n]||0)+1;}return ss.call(this,sh,src);};
  const dp=P.deleteProgram;P.deleteProgram=function(pr){C.del++;return dp.call(this,pr);};
  const gp=P.getProgramParameter;P.getProgramParameter=function(pr,pn){const r=gp.call(this,pr,pn);if(pn===0x8B82&&r===false)C.linkFail++;return r;};}
 const st=setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*(window.__slow?1:0.25)),...a);});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{const C=__C;const wrap=(o,k,name)=>{const f=o[k];if(typeof f!=='function')return;o[k]=function(){C.calls[name]=(C.calls[name]||0)+1;return f.apply(this,arguments);};};
 ['showHub','beginMatch','showTitle'].forEach(k=>{wrap(window,k,k);try{eval(k+'=window.'+k);}catch(e){}});wrap(V,'buildVenue','buildVenue');wrap(V,'setPlayerLook','setPlayerLook');wrap(V,'setOpponentLook','setOpponentLook');
 save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;showHub();});
const click=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
const ev=f=>p.evaluate(f);const rows=[];
const phase=async(name,ms)=>{await ev(()=>{const C=__C;C.s={fr:C.fr,del:C.del,lf:C.linkFail,names:{...C.names},calls:{...C.calls}};});await p.waitForTimeout(ms);
 const r=await ev(name=>{const C=__C,s=C.s;const d=(a,b)=>{const o={};Object.keys(a).forEach(k=>{const v=a[k]-(b[k]||0);if(v)o[k]=v;});return o;};return {name,compiles:C.fr-s.fr,deletes:C.del-s.del,linkFail:C.linkFail-s.lf,programsNow:V._qa.renderer.info.programs.length,calls:d(C.calls,s.calls),byMaterial:d(C.names,s.names)};},name);
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
const tot=await ev(()=>({compiles:__C.fr,deletes:__C.del,linkFail:__C.linkFail,calls:__C.calls}));
console.log('e19churn',JSON.stringify({tot,secs:(Date.now()-T0)/1000|0,pe:pe.slice(0,2)}));await b.close();})();
