// ENG-RESET acceptance (Overseer 16:44, Hayden's screen recording of a cold launch): no white frame, the approved loading screen is the first
// thing drawn and covers everything until the NEW screen has rendered; the old splash / old title never show.
// node tests/first-paint.js <dir>   (served over http; iPhone 390 and desktop 1366; rebrand on, as live)
// Every frame from the first paint is recorded twice:
//  - pixels: a CDP screencast; a frame whose mean brightness is > 200/255 (white/near-white) fails;
//  - DOM: from the first script in <head>, on every animation frame + every 40 ms, the element on top at 5 points; a frame fails if the
//    old title (#title) or the old in-game splash shows at any point while the loading screen isn't covering it.
// Cases: 'cold' (a guest's first launch, ends on the new title/login); 'returning' (a saved career, no sign-in: ends on the new title);
//        'reset' (a match finished, the fresh start: ends on the hub).
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');let sharp=null;try{sharp=require('sharp');}catch(e){}
(async()=>{const dir=path.resolve(process.argv[2]||path.join(__dirname,'..'));const ONLY=process.env.ONLY||'';const SHOTS=process.env.SHOTS||'';
const types={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.css':'text/css'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(dir,u==='/'?'index.html':u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});}).listen(0);
const URL0=`http://127.0.0.1:${srv.address().port}/index.html`;
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const fails=[];const out=[];const T00=Date.now();
const F=(tag,m)=>{console.log(Math.round((Date.now()-T00)/1000)+'s FAIL '+tag+': '+m);fails.push(tag+': '+m);};const O=o=>{console.log(Math.round((Date.now()-T00)/1000)+'s '+JSON.stringify(o));out.push(o);};
const PROF={iphone:{viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent},desktop:{viewport:{width:1366,height:768}}};
/* the DOM sampler: runs before any of the page's own code */
const SAMPLER=()=>{const L=window.__fp=[];const t0=performance.now();
 const chain=e=>{const ids=[];for(let c=e,i=0;c&&i<12;i++,c=c.parentElement){if(c.id)ids.push(c.id);}return ids;};
 const snap=why=>{try{if(!document.body)return;const W=innerWidth,H=innerHeight;const pts=[[W/2,H/2],[W/2,H*.15],[W/2,H*.85],[W*.15,H/2],[W*.85,H/2]];
  const top=pts.map(([x,y])=>chain(document.elementFromPoint(x,y)));const ld=document.getElementById('loading');
  const pc=document.getElementById('ldPct');L.push({t:Math.round(performance.now()-t0),why,top,ld:ld?ld.className:null,pre:document.documentElement.className,pct:pc?parseInt(pc.textContent)||0:null});if(L.length>4000)L.splice(0,1000);}catch(e){}};
 const f=()=>{snap('raf');requestAnimationFrame(f);};requestAnimationFrame(f);setInterval(()=>snap('iv'),40);
 addEventListener('beforeunload',()=>{try{sessionStorage.setItem('__fpPrev',JSON.stringify(L.slice(-50)));}catch(e){}});};
/* under the cover ('tops-pre' on <html>) only the loading screen may be on top; once it lifts, the screen it lifted onto must still be the
   screen 2.5 s later (what Hayden saw: the old title, then 'Continue career', then the new one) */
const SCR=ch=>ch.find(id=>['title','login','rbApp','hub','loading','friends','creator','skills'].includes(id))||ch[ch.length-1]||'?';
const judge=(tag,L)=>{let bad=null,lift=null;for(const s of L){const pre=/tops-pre/.test(s.pre||'');const gone=/gone/.test(s.ld||'');
  if(!lift&&!pre&&gone){lift=s;}/* both holds off: the page's pre-paint class (Experience) and the loading screen (Engine, at the boot's end) */
  if(!lift){for(const ch of s.top){if(!ch.includes('loading')){bad={t:s.t,why:'under the cover, on top: '+ch.join('<')};break;}}if(bad)break;}}
 const settle=L.filter(s=>lift&&s.t>=lift.t+600);const first=settle.length?settle[0].top.map(SCR).join(','):null;const last=settle.length?settle[settle.length-1].top.map(SCR).join(','):null;
 /* the bar shows real steps (Hayden 17:57): before it lifts, at least 3 different % values, the last one at 50 % or more; never sitting at 0 % for over 3 s */
 const before=L.filter(s=>lift&&s.t<lift.t&&s.pct!=null);const vals=[...new Set(before.map(s=>s.pct))];const lastPct=before.length?before[before.length-1].pct:null;
 let zero=0;{let z0=null;for(const s of before){if(s.pct===0){if(z0==null)z0=s.t;zero=Math.max(zero,s.t-z0);}else z0=null;}}
 O({tag,bar:{values:vals.slice(0,12),last:lastPct,zeroMs:zero}});if(lift&&lift.t>1500){if(vals.length<3)F(tag,'the bar showed only '+JSON.stringify(vals)+' % before the lift');if(!(lastPct>=50))F(tag,'the bar was at '+lastPct+' % just before the lift');if(zero>3000)F(tag,'the bar sat at 0 % for '+zero+' ms');}
 if(!lift)F(tag,'the cover never lifted');if(bad)F(tag,'+'+bad.t+' ms '+bad.why);if(first&&last&&first!==last)F(tag,'the screen changed after the cover lifted: '+first+' -> '+last);
 return {liftAt:lift&&lift.t,first,last,bad};};
const white=async(tag,frames)=>{if(!sharp){O({tag,note:'sharp missing: no pixel check'});return;}let worst=0,at=null,first=null;for(const fr of frames){const st=await sharp(Buffer.from(fr.data,'base64')).stats();const m=(st.channels[0].mean+st.channels[1].mean+st.channels[2].mean)/3;if(first==null)first=Math.round(m);if(m>worst){worst=m;at=fr.t;}}
 O({tag,screencastFrames:frames.length,firstFrameMean:first,brightest:Math.round(worst),brightestAt:at});if(worst>200)F(tag,'a white frame at +'+at+' ms (mean '+Math.round(worst)+'/255)');};
const run=async(prof,mode)=>{const tag=prof+' '+mode;const ctx=await b.newContext(PROF[prof]);const p=await ctx.newPage();await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.addInitScript(SAMPLER);await p.addInitScript(()=>{const iv=setInterval(()=>{try{if(window.V&&V._qa&&V._qa.renderer){V._qa.renderer.render=function(){};clearInterval(iv);}}catch(e){}},50);});
 if(mode==='signed')await p.addInitScript(()=>{const W=ms=>new Promise(z=>setTimeout(z,ms));const user={id:'u-test',email:'t@t',user_metadata:{full_name:'Hayden Test'}};
  const cloud={matches:47,name:'Hayden',authSeen:true,lessonDone:true,sv:9,tcIntro:1,tcWelcomed:1};
  const q={select(){return q;},eq(){return q;},maybeSingle:async()=>{await W(1500);let c=null;try{c=JSON.parse(localStorage.getItem('__cloud')||'null');}catch(e){}return {data:{data:c||cloud,updated_at:new Date().toISOString()},error:null};},insert:async()=>({error:null}),upsert:async()=>({error:null})};
  window.supabase={createClient:()=>({auth:{getSession:async()=>{await W(300);return {data:{session:{user}}};},onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}};},signOut:async()=>({})},from:()=>q,rpc:async()=>({data:{ok:true},error:null}),channel:()=>({on(){return this;},subscribe(){return this;}}),removeChannel(){}})};});
 if(mode!=='cold'){await p.goto(URL0);await p.waitForFunction(()=>typeof S!=='undefined'&&window.TOPS_RESET&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
  await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';save.lessonDone=true;if(!career())newCareer();save.tcIntro=1;save.tcWelcomed=1;persist();try{localStorage.setItem('__cloud',JSON.stringify(save));}catch(e){}});}
 const cdp=await ctx.newCDPSession(p);const frames=[];let tNav=0,tCommit=0;p.on('framenavigated',f=>{if(f===p.mainFrame()&&/index\.html/.test(f.url()))tCommit=Date.now()-tNav;});cdp.on('Page.screencastFrame',f=>{frames.push({t:Date.now()-tNav,data:f.data});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
 /* THROTTLE=kbps: a phone-like download (default off), so a page that draws nothing until megabytes have arrived shows its white frames */
 if(process.env.THROTTLE){const kb=+process.env.THROTTLE;await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:120,downloadThroughput:kb*1024/8,uploadThroughput:kb*1024/8});}
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:50,maxWidth:390,everyNthFrame:1});
 tNav=Date.now();
 if(mode==='reset'){/* the fresh start as v16 does it: the flag, then a reload */await p.evaluate(()=>{const c=career();sessionStorage.setItem('tops_reset_go',JSON.stringify({t:Date.now(),saveMs:1,run:false,tab:null,why:'test',sv:save.sv||0}));sessionStorage.setItem('tops_reset',JSON.stringify({k:'Next up',t:'vs Test',s:'Pub'}));});await p.reload({waitUntil:'commit'});/* wait for the new document, so the sampler reads the reset page */}
 else await p.goto(URL0);
 /* settled: the new screen is up and the loading screen gone */
 let settled=null;const tS=Date.now();for(let i=0;i<600;i++){const s=await p.evaluate(()=>{const l=document.getElementById('loading');const gone=(!l||l.classList.contains('gone'))&&!document.documentElement.classList.contains('tops-pre');const a=document.getElementById('rbApp');const rb=!!(a&&!a.hidden&&a.getClientRects().length);const t=document.getElementById('title');const tl=!!(t&&!t.hidden&&t.getClientRects().length);const lg=document.getElementById('login');const lo=!!(lg&&!lg.hidden&&lg.getClientRects().length);return {gone,rb,tl,lo,pre:document.documentElement.className};}).catch(()=>null);if(s&&s.gone&&(s.rb||s.tl||s.lo)){settled=s;break;}await p.waitForTimeout(100);}
 await p.waitForTimeout(2500);/* and 2.5 s after: what Hayden saw was the old title for ~2.5 s, then a change */
 await cdp.send('Page.stopScreencast').catch(()=>{});
 const bt=await p.evaluate(()=>{const t0=Date.now()-performance.now();return {bootEnd:window.TOPS_BOOTEND?Math.round(TOPS_BOOTEND-t0):null,bootMs:window.TOPS_BOOT_MS||null,rig:!!(V&&V._qa&&V._qa.rigReady&&V._qa.rigReady()),pre:window.TOPS_PRE&&TOPS_PRE.why};}).catch(e=>({err:e.message}));O({tag,boot:bt});
 const L=await p.evaluate(()=>window.__fp||[]).catch(()=>[]);const end=L.length?L[L.length-1].t:0;
 O({tag,settled,settleMs:Date.now()-tS,samples:L.length,lastTop:L.length?L[L.length-1].top.map(c=>c.join('<')).slice(0,2):null});if(!settled)F(tag,'never settled on a screen with the loading screen gone');
 O({tag,judge:judge(tag,L)});/* frames before the new document commits are the previous page (or the browser's blank tab), not ours */await white(tag,frames.filter(f=>f.t>=tCommit));
 if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});frames.forEach((fr,i)=>{if(i%3===0)fs.writeFileSync(path.join(SHOTS,`${prof}_${mode}_${String(fr.t).padStart(5,'0')}.jpg`),Buffer.from(fr.data,'base64'));});}
 if(pe.length)F(tag,'page errors: '+pe.slice(0,2).join(' | '));await ctx.close();};
for(const prof of ['iphone','desktop'])for(const mode of ['cold','returning','signed','reset'])if(!ONLY||ONLY.split(',').some(x=>(prof+' '+mode).includes(x)))await run(prof,mode);
await b.close();srv.close();console.log(JSON.stringify({fails}));console.log(fails.length?'FIRST-PAINT FAIL':'FIRST-PAINT PASS');process.exit(fails.length?1:0);})();
