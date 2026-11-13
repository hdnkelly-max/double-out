// ENG-RIGCACHE (Overseer 19:32): the loader's time limit can never reveal an old or half-built screen.
// node tests/boot-cap.js <dir>   (the shipped page as index.html; 390 iPhone; rebrand on)
// Cases (the sign-in service is a stub):
//  'hang'  the session check never answers: the loader stays on top past 15 s and says the connection is slow; no game screen (title, login,
//          hub) is ever on top while it waits; at 45 s it lifts onto the complete login screen with the "can't reach the server" line.
//  'late'  signed in, the cloud save arrives at 20 s: the loader stays until then and lifts onto the title showing that cloud save (its
//          player name), never onto a title drawn before it.
//  'quick' signed in, the cloud save at 1 s: lifts as soon as the boot ends (well before 15 s).
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]);const ONLY=process.env.ONLY||'';
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(dir,u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(f)?'text/html':/\.js$/.test(f)?'text/javascript':'application/octet-stream','cache-control':'max-age=600'});r.end(d);});}).listen(0);
const URL0=`http://127.0.0.1:${srv.address().port}/index.html`;const fails=[];const F=(t,m)=>{console.log('FAIL '+t+': '+m);fails.push(t+': '+m);};const O=o=>console.log(JSON.stringify(o));
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--host-resolver-rules=MAP *.supabase.co 127.0.0.1:9, MAP cdn.jsdelivr.net 127.0.0.1:9, MAP fonts.googleapis.com 127.0.0.1:9, MAP fonts.gstatic.com 127.0.0.1:9']});
const run=async(mode)=>{const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.addInitScript(mode=>{try{localStorage.setItem('tops_rebrand','1');}catch(e){}const iv=setInterval(()=>{try{if(V&&V._qa&&V._qa.renderer){V._qa.renderer.render=function(){};clearInterval(iv);}}catch(e){}},50);
  const W=ms=>new Promise(z=>setTimeout(z,ms));const user={id:'u-cap',email:'c@c',user_metadata:{full_name:'Cap Test'}};const T0=performance.now();
  const cloud={matches:12,name:'CloudName',authSeen:true,lessonDone:true,sv:5,tcIntro:1,tcWelcomed:1};
  const q={select(){return q;},eq(){return q;},maybeSingle:async()=>{await W(Math.max(0,(mode==='late'?20000:1000)-(performance.now()-T0)));return {data:{data:cloud,updated_at:new Date().toISOString()},error:null};},insert:async()=>({error:null}),upsert:async()=>({error:null})};
  window.supabase={createClient:()=>({auth:{getSession:()=>mode==='hang'?new Promise(()=>{}):Promise.resolve({data:{session:{user}}}),onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}};},signOut:async()=>({})},from:()=>q,rpc:async()=>({data:{ok:true},error:null}),channel:()=>({on(){return this;},subscribe(){return this;}}),removeChannel(){}})};
  /* what is on top, every 100 ms, from the first script on */
  window.__cap=[];setInterval(()=>{try{if(!document.body)return;const ch=[];for(let c=document.elementFromPoint(innerWidth/2,innerHeight/2),i=0;c&&i<12;i++,c=c.parentElement)if(c.id)ch.push(c.id);
   const ld=document.getElementById('loading');const t=document.getElementById('title');
   __cap.push({t:Math.round(performance.now()),top:ch.join('<'),gone:!!(ld&&ld.classList.contains('gone')),tip:(document.getElementById('ldTip')||{}).textContent||'',name:t&&!t.hidden?(t.textContent.match(/CloudName/)?'cloud':'other'):null,end:!!window.TOPS_BOOTEND});}catch(e){}},100);},mode);
 await p.goto(URL0);const dur=mode==='hang'?50000:mode==='late'?26000:14000;await p.waitForTimeout(dur);
 const L=await p.evaluate(()=>__cap);const lift=L.find(s=>s.gone);const before=lift?L.filter(s=>s.t<lift.t):L;
 const game=before.filter(s=>!/loading/.test(s.top)&&/title|login|hub|rbApp/.test(s.top));const slow=L.find(s=>/slow/i.test(s.tip));const after=lift?L.filter(s=>s.t>=lift.t+300):[];
 O({mode,liftAt:lift&&lift.t,slowAt:slow&&slow.t,topAtLift:after[0]&&after[0].top,titleAfter:after.length?after[after.length-1].name:null,gameUnderCover:game.length,samples:L.length});
 if(game.length)F(mode,'a game screen was on top before the loader lifted: '+game[0].top+' at '+game[0].t);
 if(mode==='hang'){if(!slow||slow.t<14500)F(mode,'no slow-connection line after 15 s');if(!lift||lift.t<44500)F(mode,'lifted at '+(lift&&lift.t)+' ms with the boot unfinished');if(!after.length||!/login/.test(after[after.length-1].top))F(mode,'not on the login screen after 45 s: '+(after.length&&after[after.length-1].top));
  const ls=await p.evaluate(()=>(document.getElementById('loginStatus')||{}).textContent||'');if(!/reach the server/.test(ls))F(mode,'login line: '+ls);}
 if(mode==='late'){if(!lift||lift.t<19500)F(mode,'lifted at '+(lift&&lift.t)+' ms, before the cloud save landed');if(after.some(s=>s.name==='other'))F(mode,'a title without the cloud save was shown');if(!after.some(s=>s.name==='cloud'))F(mode,'the title with the cloud save never showed');}
 if(mode==='quick'){if(!lift||lift.t>12000)F(mode,'lifted at '+(lift&&lift.t)+' ms');}
 if(pe.length)F(mode,'page errors: '+pe.slice(0,2).join(' | '));await ctx.close();};
for(const m of ['quick','late','hang'])if(!ONLY||ONLY.includes(m))await run(m);
await b.close();srv.close();console.log(fails.length?'BOOT-CAP FAIL':'BOOT-CAP PASS');process.exit(fails.length?1:0);})();
