// ENG-5 (#16 fix C) probe: WHY do the closed result / reward / pack / perk screens still cost style time in match 2, and what fixes it?
// node e5-why.js <dir> [matches=2]. Hayden's path (hub walk on -> match -> result -> Next fixture -> hub -> walk on), render stubbed.
// In the last match at the player's aim: per leftover screen, its hidden attribute, computed display/visibility/opacity, element count and
// how many of its elements are actually rendered; then 5 s style recalc ms for: A as the game leaves it, B leftovers forced display:none
// (CSS), C Experience's exp-inc16-css rules only, D B + C.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],N=+(process.argv[3]||2);const T0=Date.now();const t=()=>((Date.now()-T0)/1000|0)+'s';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));const cdp=await ctx.newCDPSession(p);
await p.addInitScript(()=>{const raf=requestAnimationFrame;window.__F=null;window.requestAnimationFrame=function(f){return raf.call(window,function(x){const s=performance.now();try{return f(x);}finally{if(window.__F)window.__F.push(performance.now()-s);}});};
 const st=setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.06),...a);});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();});
console.error(t(),'loaded');
const click=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
const rows=[];let fix=null;
for(let m=1;m<=N;m++){
 await p.evaluate(fx=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());const c=career();if(fx)c.next=JSON.parse(fx);else{if(!c.next)c.next=nextOpponent();window.__fix=JSON.stringify(c.next);}},fix);
 if(!fix)fix=await p.evaluate(()=>window.__fix);
 let ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await p.evaluate(()=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());try{if($('hub').hidden)showHub();}catch(e){}});await p.waitForTimeout(300);}}
 for(let i=0;i<600;i++){const st=await p.evaluate(()=>{try{if(!S)return 'nos';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});
  if(st==='nos'){await click('#c3Go');}if(st==='aim'||st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(100);}
 await p.waitForTimeout(1500);await cdp.send('Performance.enable').catch(()=>{});
 if(m<N){const g0=(a,k)=>(a.find(x=>x.name===k)||{}).value||0;const q0=(await cdp.send('Performance.getMetrics')).metrics;await p.waitForTimeout(5000);const q1=(await cdp.send('Performance.getMetrics')).metrics;console.log('win',JSON.stringify({tag:'match '+m+' as left',styleMs:+((g0(q1,'RecalcStyleDuration')-g0(q0,'RecalcStyleDuration'))*1000).toFixed(0),els:await p.evaluate(()=>document.getElementsByTagName('*').length),rendered:await p.evaluate(()=>[...document.getElementsByTagName('*')].filter(x=>x.getClientRects().length>0).length)}));}
 if(m===N){
  const why=await p.evaluate(()=>{const roots=[['#result',document.getElementById('result')],['#c3rw',document.getElementById('c3rw')],['div.tcpk',document.querySelector('div.tcpk')],['#perk',document.getElementById('perk')],['#hub',document.getElementById('hub')],['#loading',document.getElementById('loading')],['#cardFog',document.getElementById('cardFog')],['#grain',document.getElementById('grain')]];
   return roots.map(([k,e])=>{if(!e)return {k,missing:true};const cs=getComputedStyle(e);const all=[e,...e.getElementsByTagName('*')];const rendered=all.filter(x=>x.getClientRects().length>0).length;
    const anims=all.reduce((n,x)=>n+(x.getAnimations?x.getAnimations().filter(a=>a.playState==='running').length:0),0);
    return {k,hiddenAttr:e.hidden,cls:String(e.className||'').slice(0,40),display:cs.display,visibility:cs.visibility,opacity:cs.opacity,pos:cs.position,els:all.length,rendered,anims};});});
  console.log('why',JSON.stringify(why));
  const g2=(a,k)=>(a.find(x=>x.name===k)||{}).value||0;
  const win=async tag=>{const q0=(await cdp.send('Performance.getMetrics')).metrics;await p.waitForTimeout(5000);const q1=(await cdp.send('Performance.getMetrics')).metrics;
   const r={tag,styles:g2(q1,'RecalcStyleCount')-g2(q0,'RecalcStyleCount'),styleMs:+((g2(q1,'RecalcStyleDuration')-g2(q0,'RecalcStyleDuration'))*1000).toFixed(0),layoutMs:+((g2(q1,'LayoutDuration')-g2(q0,'LayoutDuration'))*1000).toFixed(0),rendered:await p.evaluate(()=>[...document.getElementsByTagName('*')].filter(x=>x.getClientRects().length>0).length)};console.log('win',JSON.stringify(r));return r;};
  const css=(id,txt)=>p.evaluate(([id,txt])=>{let s=document.getElementById(id);if(!s){s=document.createElement('style');s.id=id;document.head.appendChild(s);}s.textContent=txt;},[id,txt]);
  const B='#result[hidden],#c3rw[hidden],#perk[hidden],div.tcpk[hidden],.tcpk[hidden]{display:none!important}';
  const C="#loading.gone{visibility:hidden;transition:opacity .5s,visibility 0s .5s}#loading.gone i::after{animation:none}body.lk-match #grain{animation:none}#cardFog{backdrop-filter:none;-webkit-backdrop-filter:none}body.card-fog #cardFog{backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}";
  await win('A as left');await css('e5B',B);await win('B leftovers display:none');await css('e5B','');await css('e5C',C);await win('C exp-inc16-css');await css('e5B',B);await win('D B+C');await css('e5B','');await css('e5C','');await win('A again');
  const fm=await p.evaluate(()=>({m1:window.__m1rendered||null}));
 }
 if(m===N)break;
 // finish the match (scores clamped), then Hayden's path: result -> Next fixture -> hub
 for(let i=0;i<3000;i++){const st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
   S.p.forEach(q=>{if(q.score>60&&!S.visit.length)q.score=60;});if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const tp=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(tp.x+gauss()*12,tp.y+gauss()*12);}return 'play';}catch(e){return 'ERR '+e.message;}});
  if(st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(40);}
 let path=[];for(let i=0;i<80;i++){const atHub=await p.evaluate(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!(S&&!S.done));if(atHub)break;
  await p.evaluate(()=>document.querySelectorAll('.tc-sheet,.cd-wrap').forEach(e=>e.remove()));if(await click('#btnResAction'))path.push('ResAction');else if(await click('#c3rwGo'))path.push('rwGo');else if(await click('#btnResultNext'))path.push('ResultNext');await p.waitForTimeout(400);}
 console.error(t(),'path',path.join('>'));}
console.log('e5 done',JSON.stringify({pe:pe.slice(0,2),secs:(Date.now()-T0)/1000|0}));await b.close();})();
