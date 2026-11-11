// R0 #16 (Engine): does every cinematic big moment leave a live canvas capture track behind (v08.js clip recorder), and what does
// that cost per frame? node h1-cine.js <dir> [cycles=3]. iPhone user agent (so v10's clip recorder stays off, as on Hayden's phone
// unless he turned clips on). In a match at the player's aim: live capture tracks + frame timing (render ON) + a CPU profile; then the
// game's own cinematic toggle (body class lk-cine on ~2 s, off), `cycles` times, and the same measures again.
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2],N=+(process.argv[3]||3);const T0=Date.now();const t=()=>((Date.now()-T0)/1000|0)+'s';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));const cdp=await ctx.newCDPSession(p);
await p.addInitScript(()=>{const T=window.__T={tracks:[],calls:0};const cs=HTMLCanvasElement.prototype.captureStream;HTMLCanvasElement.prototype.captureStream=function(){T.calls++;const st=cs.apply(this,arguments);st.getTracks().forEach(tr=>T.tracks.push({tr,who:String(new Error().stack).split('\n').slice(2,4).map(l=>(l.match(/at (\w+)/)||[])[1]).join('<')}));return st;};
 const raf=requestAnimationFrame;window.__F=null;window.requestAnimationFrame=function(f){return raf.call(window,function(x){const s=performance.now();try{return f(x);}finally{if(window.__F)window.__F.push([x,performance.now()-s]);}});};});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};
 beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:50,legs:3,start:501});});
for(let i=0;i<400;i++){const st=await p.evaluate(()=>{try{if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim'||st.startsWith('ERR'))break;await p.waitForTimeout(100);}
console.error(t(),'at aim');await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});
const measure=async tag=>{await p.waitForTimeout(800);await cdp.send('Profiler.start');await p.evaluate(()=>{window.__F=[];});await p.waitForTimeout(6000);
 const fr=await p.evaluate(()=>{const a=window.__F.slice();window.__F=null;return a;});const {profile}=await cdp.send('Profiler.stop');
 const self={},dt={};for(let i=0;i<profile.samples.length;i++)dt[profile.samples[i]]=(dt[profile.samples[i]]||0)+(profile.timeDeltas[i]||0);profile.nodes.forEach(n=>{const k=n.callFrame.functionName||'(anon)';self[k]=(self[k]||0)+(dt[n.id]||0)/1000;});
 const gaps=fr.slice(1).map((x,i)=>x[0]-fr[i][0]).sort((a,b)=>a-b),cb=fr.map(x=>x[1]).sort((a,b)=>a-b);const q=(a,f)=>a.length?+a[Math.min(a.length-1,Math.floor(a.length*f))].toFixed(1):null;
 const tr=await p.evaluate(()=>({calls:__T.calls,live:__T.tracks.filter(x=>x.tr.readyState==='live').length,by:__T.tracks.filter(x=>x.tr.readyState==='live').map(x=>x.who),recs:typeof MediaRecorder!=='undefined'}));
 const row={tag,frames:fr.length,fps:+(fr.length/6).toFixed(2),frameGapP50:q(gaps,.5),cbMsP50:q(cb,.5),liveCaptureTracks:tr.live,captureCalls:tr.calls,liveBy:tr.by,captureMs:+(self['captureStream']||0).toFixed(0),top:Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>k+' '+v.toFixed(0))};console.log(JSON.stringify(row));console.error(t(),tag);return row;};
const r0=await measure('before');
for(let i=0;i<N;i++){await p.evaluate(()=>document.body.classList.add('lk-cine'));await p.waitForTimeout(2000);await p.evaluate(()=>document.body.classList.remove('lk-cine'));await p.waitForTimeout(1200);}
const r1=await measure('after '+N+' cinematic moments');
console.log('cine',JSON.stringify({before:{live:r0.liveCaptureTracks,fps:r0.fps,gap:r0.frameGapP50,cb:r0.cbMsP50},after:{live:r1.liveCaptureTracks,fps:r1.fps,gap:r1.frameGapP50,cb:r1.cbMsP50,by:r1.liveBy},pe:pe.slice(0,2)}));await b.close();})();
