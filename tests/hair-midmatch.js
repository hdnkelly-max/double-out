// CAR-7a (Delivery QA 19:52, blank board at 360): the hair library (hair.glb) must never rebuild the figures and venue mid-match.
//  1 hub: when the next fixture wears library hair or a beard (Big Mal, Pete), the hub fetches hair.glb before the match
//  2 a match whose opponent needs hair.glb that hasn't loaded yet: when the file lands mid-match nothing is rebuilt
//    (no buildVenue / setOpponentLook / setPlayerLook) until the hub, and the hub then rebuilds once
// usage: node tests/hair-midmatch.js   (serves the build over http so the GLB can load)
const {chromium}=require('playwright');const path=require('path');const http=require('http');const fs=require('fs');
const root=path.resolve(__dirname,'..');const srv=http.createServer((q,s)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':'application/octet-stream'});s.end(d);});});
(async()=>{await new Promise(r=>srv.listen(0,r));const port=srv.address().port;const f=[];
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const run=async(holdHair)=>{const p=await b.newPage({viewport:{width:360,height:640}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());let hairReq=0,release=null;const gate=new Promise(r=>release=r);
  await p.route(/hair\.glb$/,async r=>{hairReq++;if(holdHair)await gate;r.continue();});
  await p.goto(`http://localhost:${port}/index.html`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
  return {p,errs,hair:()=>hairReq,release};};
 // 1 the hub fetches hair.glb when the next fixture is Big Mal
 {const {p,errs,hair}=await run(false);
  await p.evaluate(()=>{save.authSeen=true;save.name='P';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;const c=career();c.next=Object.assign({},nextOpponent(),{oppName:'Big Mal',oppName2:null,rival:false});showHub();});
  await p.waitForTimeout(3000);if(hair()<1)f.push('the hub did not fetch hair.glb for a Big Mal fixture');
  const n0=hair();await p.close();if(errs.length)f.push('page errors (hub): '+errs.slice(0,2).join(' | '));}
 // 2 hair.glb held until the match is running, then released: no rebuild until the hub
 {const {p,errs,hair,release}=await run(true);
  await p.evaluate(()=>{save.authSeen=true;save.name='P';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;V.walkOn=()=>{};try{V.heroShot({model:'pete'},'Pete the Plumber',0,null);}catch(e){}});
  await p.waitForFunction(()=>TOPS_RIGS().ids.includes('pete'),null,{timeout:60000});/* Pete's own file first, so the match below builds the real Pete (who wears library hair) */
  await p.evaluate(()=>{
   beginMatch({mode:'career',tier:0,p0:'P',oppName:'Pete the Plumber',oppAvg:45,legs:3,start:501});});
  await p.waitForFunction(()=>TOPS_RIGS().wait===0,null,{timeout:60000});await p.waitForTimeout(1500);/* every character file the match needs has landed and its rebuild is done */
  await p.evaluate(()=>{V.setOpponentLook({model:'pete'},'Pete the Plumber',0);/* a Pete figure asks for the hair library now, mid-match */
   window.__rb={venue:0,opp:0,me:0};const w=(k,n)=>{const o=V[k];V[k]=function(){window.__rb[n]++;return o.apply(this,arguments);};};w('buildVenue','venue');w('setOpponentLook','opp');w('setPlayerLook','me');
   /* charsChanged calls the internal functions, not V.*: watch the objects instead (the opponent figure and the board face are replaced by a rebuild) */
   const bf=()=>{let b=null;V._qa.scene.traverse(o=>{if(!b&&o.isMesh&&o.geometry&&o.geometry.type==='CircleGeometry'&&o.geometry.parameters.radius>.2&&o.geometry.parameters.radius<.23)b=o;});return b;};window.__ids=()=>({opp:V._qa.opp()&&V._qa.opp().uuid,board:bf()&&bf().uuid});window.__id0=__ids();
   window.__cc=0;const st=window.setTimeout;window.setTimeout=function(fn,ms){try{if(ms===120&&typeof fn==='function'&&/setOpponentLook/.test(String(fn)))window.__cc++;(window.__ccs=window.__ccs||[]).push(String(new Error().stack).split('\n').slice(2,5).join(' / ').slice(0,300));}catch(e){}return st.apply(this,arguments);};/* charsChanged() schedules its rebuild this way */});
  await p.waitForTimeout(2500);const before=await p.evaluate(()=>Object.assign({},window.__rb));release();await p.waitForTimeout(6000);
  const after=await p.evaluate(()=>Object.assign({},window.__rb));
  const ccs=await p.evaluate(()=>window.__ccs||[]);const hl=fs.readFileSync(path.join(root,'index.html'),'utf8').split('\n').findIndex(l=>l.includes('function loadHair('))+1;
  const fromHair=ccs.filter(x=>x.includes('index.html:'+hl+':'));/* a character file reloading mid-match also rebuilds (loadChar): a different item, not counted here */
  if(fromHair.length)f.push('hair.glb landing mid-match scheduled a full rebuild (charsChanged): '+JSON.stringify(fromHair));if(!hl)f.push('loadHair not found in index.html (test setup)');
  if(!hair())f.push('the Pete match never asked for hair.glb (test setup)');
  if(after.venue!==before.venue||after.opp!==before.opp||after.me!==before.me)f.push('hair.glb landing mid-match rebuilt: '+JSON.stringify({before,after}));
  const inMatch=await p.evaluate(()=>!!(S&&!S.done));if(!inMatch)f.push('match ended early (test setup)');
  await p.evaluate(()=>{S.won=true;endMatch();showHub();});await p.waitForTimeout(1500);const hub=await p.evaluate(()=>Object.assign({},window.__rb));
  if(!(hub.venue>after.venue))f.push('the hub did not rebuild after the deferred hair.glb: '+JSON.stringify(hub));
  if(errs.length)f.push('page errors (match): '+errs.slice(0,2).join(' | '));
  console.log(JSON.stringify({before,after,hub}));await p.close();}
 await b.close();srv.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log('PASS: the hub fetches hair.glb for a Big Mal fixture; hair.glb landing mid-match rebuilds nothing until the hub, which rebuilds once');})();
