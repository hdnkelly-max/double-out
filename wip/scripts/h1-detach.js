// #16 follow-up (Engine): h1-detach.js = h1-dom.js + in each match, a second 5 s window after DETACHING the hidden leftovers (#c3rw, div.tcpk, #result's children, #perk's children) to see if they cost style time. Was: h1-dom.js = h1-path.js + what changes the page every frame (MutationObserver by element) and layout/style counts+ms (CDP Performance), match 1 vs 2 vs 3. Was: per-function JS cost per frame, match 1 vs 2 vs 3, render stubbed, on Hayden's path:
// hub walk on (#c3Go) -> match -> result -> "Next fixture" (#btnResAction) -> hub -> walk on. Same opponent every match
// (match 1's fixture is put back as career().next before each walk on). In each match at the player's aim: 5 s of rAF callback ms
// (JS only, renderer.render is a no-op) and a CPU profile; prints self ms per function, and the functions that grow from match 1.
// node h1-path.js <dir> [matches=3]
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],N=+(process.argv[3]||3);const T0=Date.now();const t=()=>((Date.now()-T0)/1000|0)+'s';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));const cdp=await ctx.newCDPSession(p);
await p.addInitScript(()=>{const raf=requestAnimationFrame;window.__F=null;window.requestAnimationFrame=function(f){return raf.call(window,function(x){const s=performance.now();try{return f(x);}finally{if(window.__F)window.__F.push(performance.now()-s);}});};
 const st=setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.06),...a);});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();});
console.error(t(),'loaded');await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});
const click=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
const rows=[];let fix=null;
for(let m=1;m<=N;m++){
 await p.evaluate(fx=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());const c=career();if(fx)c.next=JSON.parse(fx);else{if(!c.next)c.next=nextOpponent();window.__fix=JSON.stringify(c.next);}},fix);
 if(!fix)fix=await p.evaluate(()=>window.__fix);
 let ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await p.evaluate(()=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());try{if($('hub').hidden)showHub();}catch(e){}});await p.waitForTimeout(300);}}
 for(let i=0;i<600;i++){const st=await p.evaluate(()=>{try{if(!S)return 'nos';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});
  if(st==='nos'){await click('#c3Go');}if(st==='aim'||st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(100);}
 await p.waitForTimeout(1500);await cdp.send('Performance.enable').catch(()=>{});const pm0=(await cdp.send('Performance.getMetrics')).metrics;await cdp.send('Profiler.start');
 await p.evaluate(()=>{window.__F=[];const M=window.__MU={by:{},n:0};const nm=e=>{if(!e||e.nodeType!==1)e=e&&e.parentElement;if(!e)return '?';let s=e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/)[0]:'');const p=e.parentElement&&e.parentElement.closest('[id]');return (p&&p!==e?'#'+p.id+' ':'')+s;};
  window.__MO=new MutationObserver(l=>{for(const r of l){M.n++;const k=r.type[0]+(r.attributeName?':'+r.attributeName:'')+' '+nm(r.target);M.by[k]=(M.by[k]||0)+1;}});window.__MO.observe(document.body,{subtree:true,attributes:true,childList:true,characterData:true});});
 await p.waitForTimeout(5000);
 const mu=await p.evaluate(()=>{window.__MO.disconnect();const M=window.__MU;return {n:M.n,top:Object.entries(M.by).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>k+' '+v),nodes:document.getElementsByTagName('*').length};});
 const pm1=(await cdp.send('Performance.getMetrics')).metrics;const g=(a,k)=>(a.find(x=>x.name===k)||{}).value||0;
 {const g2=(a,k)=>(a.find(x=>x.name===k)||{}).value||0;const q0=(await cdp.send('Performance.getMetrics')).metrics;
 const det=await p.evaluate(()=>{let n=0;const keep=window.__kept=[];const take=e=>{if(!e)return;n+=e.getElementsByTagName('*').length+1;const ph=document.createComment('x');e.replaceWith(ph);keep.push([ph,e]);};document.querySelectorAll('#c3rw,div.tcpk').forEach(take);['result','perk'].forEach(id=>{const r=document.getElementById(id);if(r)[...r.children].forEach(take);});return {detached:n,nodes:document.getElementsByTagName('*').length};});
 await p.waitForTimeout(5000);const q1=(await cdp.send('Performance.getMetrics')).metrics;
 await p.evaluate(()=>{(window.__kept||[]).forEach(([ph,e])=>ph.replaceWith(e));window.__kept=[];});
 console.log('detach m'+m,JSON.stringify({...det,styles:g2(q1,'RecalcStyleCount')-g2(q0,'RecalcStyleCount'),styleMs:+((g2(q1,'RecalcStyleDuration')-g2(q0,'RecalcStyleDuration'))*1000).toFixed(0)}));}
 console.log('dom m'+m,JSON.stringify({mutations:mu.n,nodes:mu.nodes,layouts:g(pm1,'LayoutCount')-g(pm0,'LayoutCount'),layoutMs:+((g(pm1,'LayoutDuration')-g(pm0,'LayoutDuration'))*1000).toFixed(0),styles:g(pm1,'RecalcStyleCount')-g(pm0,'RecalcStyleCount'),styleMs:+((g(pm1,'RecalcStyleDuration')-g(pm0,'RecalcStyleDuration'))*1000).toFixed(0),top:mu.top}));
 const fr=await p.evaluate(()=>{const a=window.__F.slice();window.__F=null;return a;});const {profile}=await cdp.send('Profiler.stop');
 const self={},dt={};for(let i=0;i<profile.samples.length;i++)dt[profile.samples[i]]=(dt[profile.samples[i]]||0)+(profile.timeDeltas[i]||0);
 profile.nodes.forEach(n=>{const cf=n.callFrame;const k=(cf.functionName||'(anon)')+(cf.url?'@'+(cf.url.includes('three')?'three':'L'+(cf.lineNumber+1)):'');self[k]=(self[k]||0)+(dt[n.id]||0)/1000;});
 const s=fr.slice().sort((x,y)=>x-y);const q=f=>s.length?+s[Math.min(s.length-1,Math.floor(s.length*f))].toFixed(2):null;
 const info=await p.evaluate(()=>({opp:S.p[1].name,scene:(()=>{let n=0;V._qa.opp()&&0;return n;})(),turn:S.turnN}));
 const row={m,opp:info.opp,frames:fr.length,cbMsP50:q(.5),cbMsP95:q(.95),cbMsSum:+fr.reduce((a,x)=>a+x,0).toFixed(0),self};rows.push(row);
 console.log(JSON.stringify({m,opp:row.opp,frames:row.frames,cbMsP50:row.cbMsP50,cbMsP95:row.cbMsP95,cbMsSum:row.cbMsSum,top:Object.entries(self).sort((x,y)=>y[1]-x[1]).slice(0,10).map(([k,v])=>k+' '+v.toFixed(0))}));console.error(t(),'m',m);
 if(m===N)break;
 // finish the match (scores clamped), then Hayden's path: result -> Next fixture -> hub
 for(let i=0;i<3000;i++){const st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
   S.p.forEach(q=>{if(q.score>60&&!S.visit.length)q.score=60;});if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const tp=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(tp.x+gauss()*12,tp.y+gauss()*12);}return 'play';}catch(e){return 'ERR '+e.message;}});
  if(st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(40);}
 let path=[];for(let i=0;i<80;i++){const atHub=await p.evaluate(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!(S&&!S.done));if(atHub)break;
  await p.evaluate(()=>document.querySelectorAll('.tc-sheet,.cd-wrap').forEach(e=>e.remove()));if(await click('#btnResAction'))path.push('ResAction');else if(await click('#c3rwGo'))path.push('rwGo');else if(await click('#btnResultNext'))path.push('ResultNext');await p.waitForTimeout(400);}
 console.error(t(),'path',path.join('>'));}
const a=rows[0].self,z=rows[rows.length-1].self;const grow=Object.keys(z).map(k=>[k,z[k]-(a[k]||0),a[k]||0,z[k]]).filter(x=>x[1]>15).sort((x,y)=>y[1]-x[1]).slice(0,15).map(x=>x[0]+' '+x[2].toFixed(0)+'→'+x[3].toFixed(0)+' ms');
console.log('path',JSON.stringify({rows:rows.map(r=>({m:r.m,opp:r.opp,frames:r.frames,cbMsP50:r.cbMsP50,cbMsP95:r.cbMsP95,cbMsSum:r.cbMsSum})),growFrom1:grow,pe:pe.slice(0,2),secs:(Date.now()-T0)/1000|0}));await b.close();})();
