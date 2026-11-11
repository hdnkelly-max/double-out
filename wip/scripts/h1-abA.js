// R0 #16 (Engine): is the match-2 per-frame cost about the MATCH (accumulates) or the OPPONENT (some characters cost more)?
// node h1-abA.js <dir> [A] [B]. One session: match vs A, hub, match vs B, hub, match vs A again. In each, at the player's aim:
// 4 s of frame timing (rAF callback ms incl. render, software GL) + a CPU profile (self time by function, top 12).
// If A2 ~ A1 and B differs: the opponent. If A2 > A1: something accumulates per match.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],A=process.argv[3]||'Carl Maddox',B=process.argv[4]||'Pete the Plumber';const T0=Date.now();const t=()=>((Date.now()-T0)/1000|0)+'s';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));const cdp=await ctx.newCDPSession(p);
await p.addInitScript(()=>{const raf=requestAnimationFrame;window.__F=null;window.requestAnimationFrame=function(f){return raf.call(window,function(x){const s=performance.now();try{return f(x);}finally{if(window.__F)window.__F.push(performance.now()-s);}});};});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();});
console.error(t(),'loaded');
await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});
const out=[];
for(const [tag,nm] of [['A1',A],['B',B],['A2',A]]){
 await p.evaluate(nm=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:nm,oppName:nm,oppAvg:50,legs:3,start:501});},nm);
 // to the player's first aim, with the opponent's real model in place
 for(let i=0;i<400;i++){const st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}const o=V._qa.opp();if(S.cur===0&&!S.busy&&!S.p[0].ai&&o&&o.userData&&o.userData.ck&&V._qa.gfx().rigs.includes(o.userData.ck))return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim'||st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(100);}
 await p.waitForTimeout(1500);await cdp.send('Profiler.start');await p.evaluate(()=>{window.__F=[];});await p.waitForTimeout(4000);
 const fr=await p.evaluate(()=>{const a=window.__F.slice();window.__F=null;return a;});const {profile}=await cdp.send('Profiler.stop');
 const self={},dt={};for(let i=0;i<profile.samples.length;i++)dt[profile.samples[i]]=(dt[profile.samples[i]]||0)+(profile.timeDeltas[i]||0);
 profile.nodes.forEach(n=>{const cf=n.callFrame;const k=(cf.functionName||'(anon)')+(cf.url?'@'+cf.url.split('/').pop().replace('index.html','')+':'+(cf.lineNumber+1):'');self[k]=(self[k]||0)+(dt[n.id]||0);});
 const s=fr.slice().sort((x,y)=>x-y);const q=f=>s.length?+s[Math.min(s.length-1,Math.floor(s.length*f))].toFixed(1):null;
 const info=await p.evaluate(()=>{const R=V._qa.renderer.info;let tri=0,mesh=0;const o=V._qa.opp();if(o)o.traverse(x=>{if(x.isMesh){mesh++;tri+=x.geometry.index?x.geometry.index.count/3:(x.geometry.attributes.position?x.geometry.attributes.position.count/3:0);}});return {opp:S.p[1].name,ck:o&&o.userData.ck,oppMesh:mesh,oppTri:tri|0,calls:R.render.calls,tris:R.render.triangles,progs:R.programs.length,geo:R.memory.geometries,tex:R.memory.textures};});
 const top=Object.entries(self).sort((x,y)=>y[1]-x[1]).slice(0,12).map(([k,v])=>k+' '+(v/1000|0));
 const row={tag,frames:fr.length,p50:q(.5),p95:q(.95),...info,top};out.push(row);console.log(JSON.stringify(row));console.error(t(),tag);
 await p.evaluate(()=>{const q=$('btnQuit');q.click();q.click();});await p.waitForTimeout(800);}
console.log('abA',JSON.stringify(out.map(r=>({tag:r.tag,opp:r.opp,ck:r.ck,frames:r.frames,p50:r.p50,p95:r.p95,oppTri:r.oppTri,calls:r.calls,tris:r.tris}))),'pe',JSON.stringify(pe.slice(0,2)));await b.close();})();
