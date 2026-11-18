// ENG-CHARCACHE (BUG-AVATAR / BUG-BEARD, Overseer 19:00): character files (assets/chars/<key>.glb), hair.glb and anims.glb are kept in Cache
// Storage per build, and the player's and next opponent's files are asked for as soon as the page is up, so the fresh page between matches
// builds the real figures and never the stand-in (remy). node tests/char-cache.js <dir>   (<dir> = the SHIPPED page as index.html + rig/ + assets/)
// Served like GitHub Pages (max-age=600 + ETag); outside hosts unreachable by DNS. The player's look is a named character (bryce).
//  1. first launch: the player's file is downloaded once, the figure is bryce (not the stand-in), the file is in Cache Storage.
//  2. relaunch (the fresh page): no character, hair or clip file is downloaded again; bryce is in before the hub is up.
//  3. a new build: the old build's asset cache is dropped, the files are downloaded once into the new one.
//  4. no Cache Storage (window.caches missing): the files load from the network as before.
//  5. a broken cache entry (a valid GLB header over a body that can't be parsed): deleted, downloaded again, the figure is still bryce.
//  6. Cache Storage throws on open: the network is used, nothing throws.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]);const types={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
let log=[],build=null;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';if(/\/chars\/[^/]+\.glb$|\/(hair|anims)\.glb$/.test(u))log.push(u);
 const f=path.join(dir,u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}let body=d;if(u==='/index.html'&&build)body=Buffer.from(d.toString('utf8').replace(/window\.TOPS_BUILD="\d+"/,'window.TOPS_BUILD="'+build+'"'));
  const et='"'+body.length+'-'+(build||'')+'"';const h={'content-type':types[path.extname(f)]||'application/octet-stream','cache-control':'max-age=600',etag:et};
  if(q.headers['if-none-match']===et){r.writeHead(304,h);r.end();return;}r.writeHead(200,h);r.end(body);});}).listen(0);
const URL0=`http://127.0.0.1:${srv.address().port}/index.html`;const fails=[];const F=m=>{console.log('FAIL '+m);fails.push(m);};const O=o=>console.log(JSON.stringify(o));
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--host-resolver-rules=MAP *.supabase.co 127.0.0.1:9, MAP cdn.jsdelivr.net 127.0.0.1:9, MAP fonts.googleapis.com 127.0.0.1:9, MAP fonts.gstatic.com 127.0.0.1:9, MAP cdnjs.cloudflare.com 127.0.0.1:9']});
const pe=[];const SAVE={authSeen:true,name:'Hayden',lessonDone:true,walkon:'off',look:{model:'bryce',sex:'m'}};
const init=(mode)=>{/* runs in the page */};
const newPage=async(cx,label,mode)=>{const p=await cx.newPage();p.on('pageerror',e=>pe.push(label+': '+e.message));
 await p.addInitScript(([sv,mode])=>{try{localStorage.setItem('tops_rebrand','1');}catch(e){}
  if(mode==='nocaches'){try{Object.defineProperty(window,'caches',{value:undefined,configurable:true});}catch(e){}}
  if(mode==='throws'){try{const o=CacheStorage.prototype.open;CacheStorage.prototype.open=function(){return Promise.reject(new Error('SecurityError (test)'));};}catch(e){}}
  window.__t0=performance.now();const iv=setInterval(()=>{try{if(window.V&&V._qa&&V._qa.renderer){V._qa.renderer.render=function(){};clearInterval(iv);}}catch(e){}},50);
  /* when bryce's figure data lands, and when the hub first shows */
  const iv2=setInterval(()=>{try{if(!window.__tBryce&&window.TOPS_RIGS&&TOPS_RIGS().ids.includes('bryce'))window.__tBryce=Math.round(performance.now());if(!window.__tRig&&window.V&&V._qa&&V._qa.rigReady&&V._qa.rigReady())window.__tRig=Math.round(performance.now());}catch(e){}},20);},[SAVE,mode]);
 return p;};
const st=p=>p.evaluate(()=>{let me=null;try{const g=V._qa.gfx&&V._qa.gfx();me=g&&g.me;if(me==null){const d=V._qa.dbg&&V._qa.dbg();me=d&&d.me;}}catch(e){}
  return {ready:!!(typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady()),rigs:window.TOPS_RIGS?TOPS_RIGS():null,me,tBryce:window.__tBryce||null,tRig:window.__tRig||null,build:window.TOPS_BUILD};}).catch(()=>null);
const until=async(p,f,ms)=>{const t=Date.now();let s=null;while(Date.now()-t<ms){s=await st(p);if(s&&f(s))return s;await p.waitForTimeout(250);}return s;};
const cached=p=>p.evaluate(async()=>{if(!window.caches)return null;const out={};for(const n of await caches.keys()){if(!/^tops-assets-/.test(n))continue;const c=await caches.open(n);out[n]=(await c.keys()).map(k=>new URL(k.url).pathname);}return out;}).catch(e=>'err '+e.message);
const has=s=>s&&s.rigs&&s.rigs.ids.includes('bryce');const n=(re)=>log.filter(x=>re.test(x)).length;
// 1
const cx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});let p=await newPage(cx,'main');
await p.goto(URL0);await until(p,x=>x.ready,120000);await p.evaluate(sv=>{Object.assign(save,sv);persist();},SAVE);
 await p.evaluate(async()=>{for(const n of await caches.keys())await caches.delete(n);});
 log=[];await p.reload();let s=await until(p,x=>x.ready&&has(x),120000);await p.waitForTimeout(3000);s=await st(p);let c=await cached(p);O({step:'first launch',s,requests:log,cached:c});
if(!has(s))F('1: the player\'s character file never loaded');if(n(/chars\/bryce\.glb$/)!==1)F('1: bryce.glb requests '+n(/chars\/bryce\.glb$/));
const cn=c&&typeof c==='object'?Object.keys(c):[];if(cn.length!==1||!c[cn[0]].some(x=>/chars\/bryce\.glb$/.test(x)))F('1: not in the asset cache '+JSON.stringify(c));
// 2
for(let i=0;i<2;i++){await p.waitForTimeout(1000);log=[];await p.reload();s=await until(p,x=>x.ready&&has(x),120000);await p.waitForTimeout(2000);s=await st(p);O({step:'relaunch '+(i+1),s,requests:log});
 if(!has(s))F('2: bryce not loaded on the fresh page');if(log.length)F('2: files downloaded again: '+log.join(' '));if(s&&s.tBryce&&s.tRig&&s.tBryce>s.tRig+500)F('2: bryce landed '+(s.tBryce-s.tRig)+' ms after the player model (want with it)');
 if(s&&s.me&&s.me!=='bryce')F('2: the player figure is '+s.me);}
// 2b: the match figure
{await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;try{$('login').hidden=true;}catch(e){}if(!career())newCareer();save.walkon='off';persist();document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());playPractice();});
 let me=null;for(let i=0;i<60&&!me;i++){await p.waitForTimeout(250);me=await p.evaluate(()=>{try{const g=V._qa.gfx();return g&&g.me;}catch(e){return null;}});}
 O({step:'practice figure',me});if(me!=='bryce')F('2b: the player figure in the match is '+me+' (want bryce)');await p.evaluate(()=>{try{if(S)S.done=true;}catch(e){}});}
// 3
build=String(Date.now());await p.waitForTimeout(1000);log=[];await p.reload();s=await until(p,x=>x.ready&&has(x),120000);await p.waitForTimeout(3000);c=await cached(p);O({step:'new build',build:s&&s.build,requests:log,cached:c});
const cn3=c&&typeof c==='object'?Object.keys(c):[];if(cn3.length!==1||cn3[0]!=='tops-assets-'+build)F('3: caches after a new build '+JSON.stringify(cn3));if(!has(s))F('3: bryce not loaded on the new build');/* the file itself may come from the browser's HTTP cache (max-age), which is fine */
// 5 (same context: break the cached entry)
await p.evaluate(async b=>{const cc=await caches.open('tops-assets-'+b);for(const k of await cc.keys())if(/chars\/bryce\.glb$/.test(k.url)){/* worst case (ChatGPT P1): a GLB header that checks out (magic, length) over a body that can't be parsed */const u=new Uint8Array(5000);for(let i=0;i<u.length;i++)u[i]=(i*37)&255;const v=new DataView(u.buffer);v.setUint32(0,0x46546C67,true);v.setUint32(4,2,true);v.setUint32(8,5000,true);v.setUint32(12,4980,true);v.setUint32(16,0x4E4F534A,true);await cc.put(k,new Response(u));}},build);
log=[];await p.reload();s=await until(p,x=>x.ready&&has(x),120000);await p.waitForTimeout(2000);O({step:'broken entry',s:{rigs:s&&s.rigs&&s.rigs.ids,me:s&&s.me},requests:log});
if(!has(s))F('5: bryce not loaded after a broken cache entry');{const sz=await p.evaluate(async b=>{const cc=await caches.open('tops-assets-'+b);await new Promise(r=>setTimeout(r,1500));for(const k of await cc.keys())if(/chars\/bryce\.glb$/.test(k.url)){const m=await cc.match(k);return m?(await m.arrayBuffer()).byteLength:0;}return 0;},build);O({step:'broken entry repaired',bytes:sz});if(!(sz>5000))F('5: the broken cache entry was not replaced by the real file ('+sz+' bytes)');}
await cx.close();build=null;
// 4 and 6 (each a fresh context)
for(const mode of ['nocaches','throws']){const cy=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const q=await newPage(cy,mode,mode);
 await q.goto(URL0);await until(q,y=>y.ready,120000);await q.evaluate(sv=>{Object.assign(save,sv);persist();},SAVE);log=[];await q.reload();const x=await until(q,y=>y.ready&&has(y),120000);O({step:mode,rigs:x&&x.rigs&&x.rigs.ids,requests:log.length});if(!has(x))F((mode==='nocaches'?'4':'6')+': bryce not loaded without Cache Storage');await cy.close();}
if(pe.length)F('page errors: '+pe.slice(0,3).join(' | '));
await b.close();srv.close();console.log(fails.length?'CHAR-CACHE FAIL':'CHAR-CACHE PASS');process.exit(fails.length?1:0);})();
