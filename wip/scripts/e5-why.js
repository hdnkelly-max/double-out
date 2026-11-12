// ENG-5 (#16 fix C) probe: WHY do the closed result / reward / pack / perk screens still cost style time in match 2, and what fixes it?
// node e5-why.js <dir> [matches=2]. Hayden's path (hub walk on -> match -> result -> Next fixture -> hub -> walk on), render stubbed.
// In the last match at the player's aim: per leftover screen, its hidden attribute, computed display/visibility/opacity, element count and
// how many of its elements are actually rendered; then 5 s style recalc ms for: A as the game leaves it, B leftovers forced display:none
// (CSS), C Experience's exp-inc16-css rules only, D B + C.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],N=+(process.argv[3]||3);const T0=Date.now();const t=()=>((Date.now()-T0)/1000|0)+'s';
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
 for(let i=0;i<10;i++){if(!(await click('.tcpk__later'))&&!(await click('.tcpk__done')))break;await p.waitForTimeout(400);}
 let ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await p.evaluate(()=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());try{if($('hub').hidden)showHub();}catch(e){}});await p.waitForTimeout(300);}}
 for(let i=0;i<600;i++){const st=await p.evaluate(()=>{try{if(!S)return 'nos';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});
  if(st==='nos'){await click('#c3Go');}if(st==='aim'||st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(100);}
 await p.waitForTimeout(1500);await cdp.send('Performance.enable').catch(()=>{});
 {
  const why=await p.evaluate(()=>[['div.tcpk',document.querySelector('div.tcpk')],['#loading',document.getElementById('loading')],['#cardFog',document.getElementById('cardFog')],['#grain',document.getElementById('grain')]].map(([k,e])=>{if(!e)return {k,missing:true};const cs=getComputedStyle(e);const all=[e,...e.getElementsByTagName('*')];return {k,cls:String(e.className||'').slice(0,30),display:cs.display,opacity:cs.opacity,vis:cs.visibility,bf:cs.backdropFilter||cs.webkitBackdropFilter,rendered:all.filter(x=>x.getClientRects().length>0).length,anims:all.reduce((n,x)=>n+(x.getAnimations?x.getAnimations().filter(a=>a.playState==='running').length:0),0)};}));
  console.log('why m'+m,JSON.stringify(why));
  const g2=(a,k)=>(a.find(x=>x.name===k)||{}).value||0;
  const win=async tag=>{const q0=(await cdp.send('Performance.getMetrics')).metrics;await p.waitForTimeout(5000);const q1=(await cdp.send('Performance.getMetrics')).metrics;
   const r={m,tag,styles:g2(q1,'RecalcStyleCount')-g2(q0,'RecalcStyleCount'),styleMs:+((g2(q1,'RecalcStyleDuration')-g2(q0,'RecalcStyleDuration'))*1000).toFixed(0),layoutMs:+((g2(q1,'LayoutDuration')-g2(q0,'LayoutDuration'))*1000).toFixed(0),els:await p.evaluate(()=>document.getElementsByTagName('*').length)};console.log('win',JSON.stringify(r));return r;};
  const css=txt=>p.evaluate(txt=>{let s=document.getElementById('e5css');if(!s){s=document.createElement('style');s.id='e5css';document.head.appendChild(s);}s.textContent=txt;},txt);
  const R={load:"#loading.gone{visibility:hidden;transition:opacity .5s,visibility 0s .5s}#loading.gone i::after{animation:none}",grain:"body.lk-match #grain{animation:none}",fog:"#cardFog{backdrop-filter:none;-webkit-backdrop-filter:none}body.card-fog #cardFog{backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}"};
  await win('A as left');await css(R.load);await win('loading only');await css(R.grain);await win('grain only');await css(R.fog);await win('cardFog only');await css(R.load+R.grain+R.fog);await win('C all three');await css('');await win('A again');
 }
 if(m===N)break;
 // finish the match (scores clamped), then Hayden's path: result -> Next fixture -> hub
 for(let i=0;i<3000;i++){const st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
   S.p.forEach(q=>{if(q.score>60&&!S.visit.length)q.score=60;});if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const tp=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(tp.x+gauss()*12,tp.y+gauss()*12);}return 'play';}catch(e){return 'ERR '+e.message;}});
  if(st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(40);}
 let path=[];for(let i=0;i<80;i++){const atHub=await p.evaluate(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!document.querySelector('div.tcpk')&&$('msg').hidden!==false&&!(S&&!S.done));if(atHub)break;
  await p.evaluate(()=>document.querySelectorAll('.tc-sheet,.cd-wrap').forEach(e=>e.remove()));if(await click('.tcpk__later'))path.push('packLater');else if(await click('.tcpk__done'))path.push('packDone');else if(await click('#btnPerkLater'))path.push('perkLater');else if(await click('#msgReplies button'))path.push('msg');else if(await click('#btnResAction'))path.push('ResAction');else if(await click('#c3rwGo'))path.push('rwGo');else if(await click('#btnResultNext'))path.push('ResultNext');await p.waitForTimeout(400);}
 console.error(t(),'path',path.join('>'));}
console.log('e5 done',JSON.stringify({pe:pe.slice(0,2),secs:(Date.now()-T0)/1000|0}));await b.close();})();
