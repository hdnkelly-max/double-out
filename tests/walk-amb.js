// ENG-AMB (Lee 07:27): the walk-out must have the match venue's ambience from its first moment, with no second bed over it at the handover.
// node tests/walk-amb.js <dir>   (served over http; 390x844 iPhone UA; rebrand on; career; real tap on Walk on)
// The crowd beds (assets/voice/crowd_1-4.mp3, the big stadium crowd, 206 KB each) and pub beds (pub_1-5.mp3, Lee's pub, 352 KB each) are served
// with a phone-like delay of 300 ms + 1 ms per KB, so the smaller stadium files land first, as on a phone. Each bed take that starts is
// identified by the bytes it was decoded from. Pub and Club (tiers 0, 1) want the pub set; Regional (tier 2) wants the crowd set.
// Cases per tier: 'warm' (Walk on after 4 s in the hub) and 'cold' (Walk on 0.3 s after the hub opens: the files can't have landed yet).
// PASS: from the walk-on start through 12 s of the match, every bed take that starts is the venue's own set; when a take starts, any earlier
// one is in its last 1.5 s (the normal crossfade) or stopped; 'warm': the first take starts within 1.5 s of the walk-on.
// Live 3.32 fails Pub/Club cold (a stadium take starts the walk-on and runs ~15 s).
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const types={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.css':'text/css'};
const serve=(q,r,u)=>{const f=path.join(dir,u==='/'?'index.html':u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(/\/(crowd|pub)_\d\.mp3$/.test(u)){let n=0;try{n=fs.statSync(path.join(dir,u)).size;}catch(e){}setTimeout(()=>serve(q,r,u),300+n/1024);return;}serve(q,r,u);});srv.listen(0);
const port=srv.address().port;const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--autoplay-policy=user-gesture-required']});const res=[];
for(const c of [{tier:0,mode:'cold'},{tier:1,mode:'cold'},{tier:1,mode:'warm'},{tier:2,mode:'cold'},{tier:2,mode:'warm'},{tier:0,mode:'warm'}]){
 const want=c.tier<=1?'pub':'crowd';
 const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('tops_rebrand','1');const L=window.__B={starts:[],stops:[]};
  /* bytes -> set, by URL; decoded buffer -> set, by the bytes' length */const BL=new Map(),BS=new WeakMap();
  const RA=Response.prototype.arrayBuffer;Response.prototype.arrayBuffer=function(){const u=this.url;return RA.call(this).then(x=>{const m=/\/(crowd|pub)_\d\.mp3/.exec(u);if(m)BL.set(x.byteLength,m[1]);return x;});};
  const DA=BaseAudioContext.prototype.decodeAudioData;BaseAudioContext.prototype.decodeAudioData=function(ab){const set=ab&&BL.get(ab.byteLength);const pr=DA.apply(this,arguments);if(pr&&pr.then)pr.then(bf=>{if(set)BS.set(bf,set);},()=>{});return pr;};
  const P=AudioBufferSourceNode.prototype,st=P.start,sp=P.stop;P.start=function(when){const set=this.buffer&&BS.get(this.buffer);if(set){const c=this.context;const at=performance.now()+Math.max(0,((when||0)-c.currentTime))*1000;const e={set,t:at,dur:this.buffer.duration*1000,end:null};this.__bed=e;L.starts.push(e);}return st.apply(this,arguments);};
  P.stop=function(when){if(this.__bed){const c=this.context;const at=performance.now()+Math.max(0,((when||0)-c.currentTime))*1000;const e=this.__bed;e.end=Math.min(e.end==null?Infinity:e.end,at);}return sp.apply(this,arguments);};});
 await p.goto(`http://127.0.0.1:${port}/index.html`);
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
 await p.evaluate(t=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();career().tier=t;save.walkon='off';save.tcIntro=1;save.tcWelcomed=1;try{persist();}catch(e){}document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();},c.tier);
 await p.waitForTimeout(c.mode==='warm'?4000:300);
 await p.evaluate(()=>{window.__W=null;const f=()=>{if(V.walking&&V.walking()&&__W===null)__W=performance.now();if(__W===null)requestAnimationFrame(f);};requestAnimationFrame(f);});
 await p.locator('#rbGo').tap();
 for(let i=0;i<40;i++){await p.waitForTimeout(250);if(await p.evaluate(()=>__W!==null))break;}
 await p.waitForTimeout(12000);
 const r=await p.evaluate(()=>({W:__W,starts:__B.starts.map(e=>({set:e.set,t:Math.round(e.t),dur:Math.round(e.dur),end:e.end==null?null:Math.round(e.end)})),tier:document.body.dataset.tier,bed:window.TOPS_bed?TOPS_bed():null}));
 const W=r.W;const win=r.starts.filter(e=>W!=null&&e.t>=W-500&&e.t<=W+12000);const fails=[];
 win.forEach(e=>{if(e.set!==want)fails.push(e.set+' take at +'+Math.round(e.t-W)+' ms (venue wants '+want+')');});
 for(let i=1;i<win.length;i++){const a=win[i-1],x=win[i];const aEnd=Math.min(a.end==null?Infinity:a.end,a.t+a.dur);if(aEnd-x.t>1500)fails.push('two beds at once from +'+Math.round(x.t-W)+' ms ('+a.set+' still '+Math.round(aEnd-x.t)+' ms)');}
 if(c.mode==='warm'&&!(win.length&&win[0].t-W<=1500))fails.push('first take '+(win.length?Math.round(win[0].t-W)+' ms':'never')+' after the walk-on');
 if(W==null)fails.push('no walk-on');if(pe.length)fails.push('page errors '+pe.slice(0,2).join(' | '));
 res.push({case:'tier '+c.tier+' '+c.mode,want,firstTake:win.length?{set:win[0].set,at:Math.round(win[0].t-W)}:null,takes:win.map(e=>e.set+'@'+Math.round(e.t-W)+(e.end!=null&&e.end<e.t+e.dur?' (cut at +'+Math.round(e.end-W)+')':'')),bed:r.bed,ok:!fails.length,fails});await ctx.close();}
await b.close();srv.close();
const ok=res.every(x=>x.ok);res.forEach(x=>console.log(JSON.stringify(x)));console.log(ok?'WALK-AMB PASS':'WALK-AMB FAIL');process.exit(ok?0:1);})();
