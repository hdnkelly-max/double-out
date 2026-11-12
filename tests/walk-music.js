// ENG-11 (Lee 06:56): the walk-on music must be heard with the walk-on, not from the first gameplay tap.
// node tests/walk-music.js <dir>   (served over http so the mp3 tracks load; 390x844 iPhone UA; rebrand on; tier-1 career; real tap on Walk on)
// The mp3s are served with a phone-like 600 ms delay (NET_MS). Cases: track rock (synth) / energy (mp3); audio context fresh (the Walk on tap
// creates it) / suspended in the hub (what iOS does after an app switch, lock or call: 'suspended' or 'interrupted'); mp3 cached (played once in
// the hub) / not; 'late': the mp3 takes 2 s and Walk on is tapped 0.3 s after the hub opens, so the clip lands after the walk-on has begun;
// 'too-late': the mp3 takes 4.5 s, past the walk-on: the music must not start at all (ChatGPT P1: no walk-on music halfway into the match).
// Per case: t_walk = the walk-on starts (V.walking() first true); t_music = the first music source node start() call after the tap; t_heard =
// when that source can actually sound = max(t_music, the moment the context is 'running'). PASS when t_heard - t_walk <= 200 ms in every case but
// 'late' (music that starts earlier, with the intro card, counts as on time) and no gameplay tap was needed. 'late' passes when the music starts
// within 200 ms of the clip being decoded and while the walk-on (2.8 s) is still on. The music node: an AudioBufferSourceNode playing the buffer
// decoded from the walk_*.mp3 bytes (the file tracks) or the first sawtooth OscillatorNode under 150 Hz (the synth
// tracks' bass; the only other sawtooth is the 233/311 Hz horn).
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const types={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.css':'text/css'};
let NET=+process.env.NET_MS||600,LATE=false;const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);if(/walk_.*\.mp3$/.test(u)){const d=LATE||NET;setTimeout(()=>serve(q,r,u),d);return;}serve(q,r,u);});const serve=(q,r,u)=>{const f=path.join(dir,u==='/'?'index.html':u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});};srv.listen(0);
const port=srv.address().port;const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--autoplay-policy=user-gesture-required']});const res=[];
for(const c of [{track:'rock',ctx:'fresh'},{track:'rock',ctx:'suspended'},{track:'energy',ctx:'fresh',cache:false},{track:'energy',ctx:'suspended',cache:false},{track:'energy',ctx:'suspended',cache:true},{track:'energy',ctx:'fresh',late:2000},{track:'energy',ctx:'fresh',late:4500,expire:true}]){LATE=c.late||0;
 const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.addInitScript(()=>{localStorage.setItem('tops_rebrand','1');const L=window.__L={src:[],st:[]};
  /* AudioBufferSourceNode has its own start(), so both are hooked */for(const P of [AudioScheduledSourceNode.prototype,AudioBufferSourceNode.prototype,OscillatorNode.prototype]){if(!Object.prototype.hasOwnProperty.call(P,'start'))continue;const st0=P.start;P.start=function(){const c=this.context;L.src.push({t:performance.now(),kind:this.constructor.name,walk:!!(this.buffer&&L.WB&&L.WB.has(this.buffer)),buf:this.buffer?+this.buffer.duration.toFixed(1):null,osc:this.type||null,hz:this.frequency?Math.round(this.frequency.value):null,state:c.state,looping:!!this.loop});return st0.apply(this,arguments);};}
  /* the walk-on file: its bytes are tagged by length when fetched; the AudioBuffer decoded from bytes of that length is the walk-on track */
  const WL=new Set(),WB=new WeakSet();L.WB=WB;const RA=Response.prototype.arrayBuffer;Response.prototype.arrayBuffer=function(){const u=this.url;return RA.call(this).then(b=>{if(/walk_[a-z]+\.mp3/.test(u))WL.add(b.byteLength);return b;});};
  const DA=BaseAudioContext.prototype.decodeAudioData;BaseAudioContext.prototype.decodeAudioData=function(ab){const walk=!!(ab&&WL.has(ab.byteLength));const pr=DA.apply(this,arguments);if(pr&&pr.then)pr.then(b=>{if(walk){WB.add(b);L.dec=L.dec||performance.now();}},()=>{});return pr;};
  const OA=window.OfflineAudioContext;if(OA){const OD=OA.prototype.decodeAudioData;/* inherited from BaseAudioContext: hooked above */}
  const AC=window.AudioContext;window.AudioContext=function(){const c=new AC(...arguments);L.st.push({t:performance.now(),s:c.state,ev:'new'});c.addEventListener('statechange',()=>L.st.push({t:performance.now(),s:c.state}));return c;};window.AudioContext.prototype=AC.prototype;window.webkitAudioContext=window.AudioContext;});
 await p.goto(`http://127.0.0.1:${port}/index.html`);
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
 await p.evaluate(t=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();career().tier=1;save.walkon=t;save.tcIntro=1;save.tcWelcomed=1;try{persist();}catch(e){}document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();},c.track);
 await p.waitForTimeout(c.late?300:3000);
 if(c.ctx==='suspended'){/* a tap in the hub made the context (as any button does), then iOS suspended it (app switch / lock) */await p.locator('#rbMenu').tap();await p.waitForTimeout(200);await p.locator('#rbMenu').tap().catch(()=>{});
  await p.evaluate(async cache=>{audioInit();if(cache&&window.TOPS_walk){TOPS_walk.playWalk(save.walkon);await new Promise(z=>setTimeout(z,2500));TOPS_walk.stopWalk();}await AU.ctx.suspend();},!!c.cache);}
 const n0=await p.evaluate(()=>__L.src.length);
 const tTap=await p.evaluate(()=>{window.__W=null;const f=()=>{if(V.walking&&V.walking()&&__W===null)__W=performance.now();if(__W===null)requestAnimationFrame(f);};requestAnimationFrame(f);return performance.now();});
 await p.locator('#rbGo').tap();
 for(let i=0;i<40;i++){await p.waitForTimeout(250);const ok=await p.evaluate(()=>__W!==null);if(ok)break;}
 await p.waitForTimeout(4000);
 const r=await p.evaluate(n0=>{const src=__L.src.slice(n0).filter(s=>!s.looping);const st=__L.st;const running=t=>{let s=null;for(const x of st)if(x.t<=t)s=x.s;return s;};const firstRunAfter=t=>{const x=st.find(y=>y.t>=t&&y.s==='running');return x?x.t:null;};
  const m=src.find(s=>s.walk)||src.find(s=>s.kind==='OscillatorNode'&&s.osc==='sawtooth'&&s.hz<150);let heard=null;if(m){heard=running(m.t)==='running'||m.state==='running'?m.t:firstRunAfter(m.t);}
  return {walk:__W,decoded:__L.dec||null,music:m?m.t:null,musicKind:m?m.kind:null,stateAtMusic:m?m.state:null,heard,ctxNow:AU.ctx&&AU.ctx.state,walkon:save.walkon,tier:career()&&career().tier};},n0);
 const d=(r.heard!=null&&r.walk!=null)?Math.round(r.heard-r.walk):null;const afterDecode=(r.heard!=null&&r.decoded!=null)?Math.round(r.heard-Math.max(r.decoded,r.walk||0)):null;
 res.push(Object.assign({case:c.track+'/'+c.ctx+(c.cache!=null?(c.cache?'/cached':'/uncached'):'')+(c.expire?'/too-late':c.late?'/late':'')},r,{tapToWalk:r.walk?Math.round(r.walk-tTap):null,heardMinusWalk:d,heardMinusDecoded:afterDecode,ok:c.expire?(r.music==null):c.late?(afterDecode!=null&&afterDecode<=200&&d!=null&&d<=2800):(d!=null&&d<=200),pe}));await ctx.close();}
await b.close();srv.close();
const ok=res.every(x=>x.ok&&!x.pe.length);res.forEach(x=>console.log(JSON.stringify(x)));console.log(ok?'WALK-MUSIC PASS':'WALK-MUSIC FAIL');process.exit(ok?0:1);})();
