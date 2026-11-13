// ENG-RIGCACHE (Overseer 19:32): the player model ships as its own file (rig/remy-<hash>.glb), kept in Cache Storage, so a relaunch or the fresh
// start between matches never downloads it again. node tests/rig-cache.js <dir>   (<dir> = the SHIPPED page as index.html + rig/ + version.json)
// Served like GitHub Pages (max-age=600 + ETag); outside hosts unreachable by DNS (page.route would switch the HTTP cache off).
//  1. first launch: the model is downloaded once, from the network; the player model loads; it is in Cache Storage.
//  2. relaunch (reload): the model comes from Cache Storage; the server gets no request for it.
//  3. a new build (model file renamed = new hash): downloaded once, the old copy is dropped from Cache Storage.
//  4. a flaky network (the first two requests for the model fail): the retries load it.
//  5. the model file missing (404 every time): the game still reaches a usable screen (login), nothing throws.
//  6. the update check reads version.json (a few bytes), never the 3 MB page.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]);const types={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
let log=[],fail404=0,always404=false,rename=null;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
 if(/^\/rig\//.test(u)){log.push(u);if(always404||fail404>0){if(fail404>0)fail404--;r.writeHead(404);r.end();return;}if(rename&&u===rename.to)u=rename.from;}
 if(u==='/index.html'||u==='/version.json')log.push(u+(q.url.includes('?')?'?':''));
 const f=path.join(dir,u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}let body=d;if(u==='/index.html'&&rename)body=Buffer.from(d.toString('utf8').replace(rename.from.slice(1),rename.to.slice(1)));
  const et='"'+body.length+'-'+(rename?rename.to:'')+'"';const h={'content-type':types[path.extname(f)]||'application/octet-stream','cache-control':'max-age=600',etag:et};
  if(q.headers['if-none-match']===et){r.writeHead(304,h);r.end();return;}r.writeHead(200,h);r.end(body);});}).listen(0);
const URL0=`http://127.0.0.1:${srv.address().port}/index.html`;const fails=[];const F=m=>{console.log('FAIL '+m);fails.push(m);};const O=o=>console.log(JSON.stringify(o));
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--host-resolver-rules=MAP *.supabase.co 127.0.0.1:9, MAP cdn.jsdelivr.net 127.0.0.1:9, MAP fonts.googleapis.com 127.0.0.1:9, MAP fonts.gstatic.com 127.0.0.1:9, MAP cdnjs.cloudflare.com 127.0.0.1:9']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('tops_rebrand','1');}catch(e){}const iv=setInterval(()=>{try{if(window.V&&V._qa&&V._qa.renderer){V._qa.renderer.render=function(){};clearInterval(iv);}}catch(e){}},50);});
const rigName=fs.readFileSync(path.join(dir,'index.html'),'utf8').match(/window\.RIG_URL="(rig\/remy-[0-9a-f]+\.glb)"/);if(!rigName){console.log('no rig file in the page');process.exit(1);}const RIG='/'+rigName[1];
const st=()=>p.evaluate(()=>({src:window.TOPS_RIGSRC||null,ready:!!(typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady()),login:!(document.getElementById('login')||{hidden:true}).hidden,ld:(document.getElementById('loading')||{}).className}));
const until=async(f,ms)=>{const t=Date.now();while(Date.now()-t<ms){const s=await st().catch(()=>null);if(s&&f(s))return s;await p.waitForTimeout(250);}return await st().catch(()=>null);};
const cached=()=>p.evaluate(async()=>{const c=await caches.open('tops-rig');return (await c.keys()).map(k=>new URL(k.url).pathname);});
// 1
log=[];await p.goto(URL0);let s=await until(x=>x.ready,120000);const c1=await cached();O({step:'first launch',s,requests:log,cached:c1});
if(!s||!s.ready)F('1: model not loaded');if(s&&s.src!=='net')F('1: source '+(s&&s.src));if(log.filter(x=>x===RIG).length!==1)F('1: model requests '+log.filter(x=>x===RIG).length);if(!c1.includes(RIG))F('1: not in Cache Storage');
if(log.some(x=>x==='/index.html?'))F('6: the update check downloaded the page');if(!log.includes('/version.json?'))F('6: the update check did not read version.json');
// 2
await p.waitForTimeout(1500);log=[];await p.reload();s=await until(x=>x.ready,120000);O({step:'relaunch',s,requests:log});
if(!s||!s.ready)F('2: model not loaded');if(s&&s.src!=='cache')F('2: source '+(s&&s.src));if(log.includes(RIG))F('2: the model was downloaded again');
// 3
rename={from:RIG,to:RIG.replace(/remy-[0-9a-f]+/,'remy-0000newbuild0')};await p.waitForTimeout(1000);log=[];await p.reload();s=await until(x=>x.ready,120000);await p.waitForTimeout(1500);const c3=await cached();O({step:'new build',s,requests:log,cached:c3});
if(!s||!s.ready||s.src!=='net')F('3: new model not loaded from the network '+JSON.stringify(s));if(log.filter(x=>x===rename.to).length!==1)F('3: new model requests '+log.filter(x=>x===rename.to).length);if(c3.includes(RIG)||!c3.includes(rename.to))F('3: cache not swapped '+JSON.stringify(c3));
rename=null;
// 4 (a fresh context: nothing cached)
await p.close();
const ctx2=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});
const run=async(label,setup,want)=>{/* its own context: nothing in the HTTP cache or Cache Storage */const cx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const pp=await cx.newPage();pp.on('pageerror',e=>pe.push(label+': '+e.message));await pp.addInitScript(()=>{try{localStorage.setItem('tops_rebrand','1');}catch(e){}const iv=setInterval(()=>{try{if(window.V&&V._qa&&V._qa.renderer){V._qa.renderer.render=function(){};clearInterval(iv);}}catch(e){}},50);});
 await pp.evaluate(()=>0).catch(()=>{});setup();log=[];await pp.goto(URL0);const t=Date.now();let x=null;while(Date.now()-t<60000){x=await pp.evaluate(()=>({src:window.TOPS_RIGSRC||null,ready:!!(typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady()),login:!document.getElementById('login').hidden,ld:document.getElementById('loading').className})).catch(()=>null);if(x&&want(x))break;await pp.waitForTimeout(250);}
 await cx.close();return {x,requests:log.filter(r=>/rig/.test(r)).length};};
const r4=await run('flaky',()=>{fail404=2;always404=false;},x=>x.ready);O({step:'flaky network',...r4});if(!r4.x||!r4.x.ready)F('4: retries did not load the model '+JSON.stringify(r4));
const r5=await run('missing',()=>{fail404=0;always404=true;},x=>x.login&&/gone/.test(x.ld));always404=false;O({step:'model missing',...r5});if(!r5.x||!r5.x.login||!/gone/.test(r5.x.ld))F('5: no usable screen without the model '+JSON.stringify(r5.x));
if(pe.length)F('page errors: '+pe.slice(0,3).join(' | '));
await b.close();srv.close();console.log(fails.length?'RIG-CACHE FAIL':'RIG-CACHE PASS');process.exit(fails.length?1:0);})();
