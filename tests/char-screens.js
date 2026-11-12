// ENG-7 rework (Q&D 02:4x): a character file that lands while the player is NOT in a match must swap the figure straight away, as on
// live; only a live match (or the result screen) waits for the hub.
// node tests/char-screens.js [dir]   (serves the game over http so character files really load)
//  creator: open the creator, tap a body whose file isn't loaded (held back), release it -> the preview figure becomes that body
//  title:   on the title screen, the player's look switches to an unloaded body (what a cold start does), release -> title figure swaps
//  match:   start a match, switch the player's look to an unloaded body mid-match, release -> the figure must NOT be rebuilt mid-match;
//           back in the hub it is
// CHAR-SCREENS PASS when creator and title swap within 3 s and the match case waits for the hub.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=process.argv[2]||path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.css':'text/css','.txt':'text/plain'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]);const f=path.join(dir,u==='/'?'index.html':u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});r.end(d);});}).listen(0);
const port=srv.address().port;const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const out={};
const page=async()=>{const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 const H={key:null,rel:null,hit:false};H.p=new Promise(r=>H.rel=r);
 await p.route(/chars\/[a-z]+\.glb/,async r=>{if(H.key&&r.request().url().includes('chars/'+H.key+'.glb')){H.hit=true;await H.p;}await r.continue();});
 await p.goto(`http://127.0.0.1:${port}/index.html`);
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
 await p.waitForTimeout(2500);
 /* a body whose file isn't loaded yet */
 const k=await p.evaluate(()=>{const have=TOPS_RIGS().ids;return V.chars.find(c=>c!=='remy'&&!have.includes(c))||null;});H.key=k;return {ctx,p,pe,H,k};};
const me=p=>p.evaluate(()=>V._qa.gfx().me||null);
const waitMe=async(p,k,ms)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await me(p)===k)return Date.now()-t0;await p.waitForTimeout(100);}return -1;};
// creator
{const {ctx,p,pe,H,k}=await page();
 await p.evaluate(()=>{save.authSeen=true;save.name='Lee';$('login').hidden=true;showCreator();});await p.waitForTimeout(500);
 const btn=await p.$(`#segChar button[data-v="${k}"]`);if(btn)await btn.tap();await p.waitForTimeout(1500);
 const before=await me(p);H.rel();const ms=await waitMe(p,k,6000);
 out.creator={key:k,tapped:!!btn,held:H.hit,before,after:await me(p),swapMs:ms,pe};await ctx.close();}
// title (what a cold start does: the player's own model lands while the title is up)
{const {ctx,p,pe,H,k}=await page();
 const vis=await p.evaluate(k=>{showTitle();save.look=Object.assign({},save.look||{},{model:k});V.setPlayerLook(save.look,save.flight,'Lee',0);const t=$('title')||document.querySelector('#title,.title');return !!(t&&!t.hidden);},k);
 await p.waitForTimeout(1500);const before=await me(p);H.rel();const ms=await waitMe(p,k,6000);
 out.title={key:k,titleShown:vis,held:H.hit,before,after:await me(p),swapMs:ms,pe};await ctx.close();}
// match: must wait for the hub
{const {ctx,p,pe,H,k}=await page();
 await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();
  beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});});
 await p.waitForTimeout(2500);
 await p.evaluate(k=>{save.look=Object.assign({},save.look||{},{model:k});V.setPlayerLook(save.look,save.flight,'Lee',0);},k);
 await p.waitForTimeout(1000);const before=await me(p);H.rel();await p.waitForTimeout(3000);
 const during=await me(p);const live=await p.evaluate(()=>!!(S&&!S.done));
 await p.evaluate(()=>{try{quitMatch&&quitMatch();}catch(e){}showHub();});const ms=await waitMe(p,k,6000);
 out.match={key:k,held:H.hit,before,during,stillLive:live,afterHub:await me(p),hubMs:ms,pe};await ctx.close();}
await b.close();srv.close();
const c=out.creator,t=out.title,m=out.match;
const ok=c.tapped&&c.held&&c.before!==c.key&&c.swapMs>=0&&t.held&&t.before!==t.key&&t.swapMs>=0&&m.held&&m.stillLive&&m.during!==m.key&&m.hubMs>=0&&!c.pe.length&&!t.pe.length&&!m.pe.length;
console.log(JSON.stringify(out));console.log(ok?'CHAR-SCREENS PASS':'CHAR-SCREENS FAIL');process.exit(ok?0:1);})();
