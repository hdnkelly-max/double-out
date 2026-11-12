// ENG-3: the update prompt through the real path. The page is served over http (the check skips file://), version.json answers
// with SERVER (default 2.10), and the game's own check runs (focus event, as when the app comes back into view).
// node tests/vergate.js [dir] [server version]   -> PASS when the page prompts exactly when the server version is newer.
// Checks with the page's own version as client: server newer -> #verGate shown; server equal -> no gate; server older -> no gate.
const {chromium,devices}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]||path.resolve(__dirname,'..'));const SERVER=process.argv[3]||'2.10';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
const ORIGIN='http://tops.test/';const types={html:'text/html',js:'application/javascript',json:'application/json',css:'text/css',png:'image/png',jpg:'image/jpeg',webp:'image/webp',glb:'model/gltf-binary',mp3:'audio/mpeg',woff2:'font/woff2'};
const run=async serverVer=>{const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 const pe=[];p.on('pageerror',e=>pe.push(e.message));let asked=0;
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
 await p.route(ORIGIN+'**',async r=>{const u=new URL(r.request().url());let f=decodeURIComponent(u.pathname.slice(1))||'index.html';
  if(f==='version.json'){asked++;return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({v:serverVer})});}
  const fp=path.join(dir,f);if(!fp.startsWith(dir)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory())return r.fulfill({status:404,body:''});
  return r.fulfill({status:200,contentType:types[path.extname(f).slice(1)]||'application/octet-stream',body:fs.readFileSync(fp)});});
 await p.goto(ORIGIN+'index.html');await p.waitForFunction(()=>window.TOPS_VER&&typeof window.TOPS_vcmp==='function',null,{timeout:120000});
 const client=await p.evaluate(()=>window.TOPS_VER);
 await p.evaluate(()=>window.dispatchEvent(new Event('focus')));   /* the game's own check, as when the app comes back into view */
 let shown=false;for(let i=0;i<40&&!shown;i++){await p.waitForTimeout(150);shown=await p.evaluate(()=>{const g=document.getElementById('verGate');return !!(g&&!g.hidden&&g.getClientRects().length);});}
 const text=shown?await p.evaluate(()=>document.querySelector('#verGate b').textContent+' | '+document.querySelector('#vgGo').textContent):'';
 await ctx.close();return {serverVer,client,asked,shown,text,pe:pe.slice(0,2)};};
const newer=await run(SERVER);const client=newer.client;
const equal=await run(client);const older=await run('1.99');
const fails=[];
if(!newer.asked)fails.push('version.json was never fetched (check did not run)');
if(!newer.shown)fails.push(`no update prompt: client ${client}, server ${SERVER}`);
if(equal.shown)fails.push(`prompt shown when server = client (${client})`);
if(older.shown)fails.push(`prompt shown for an older server (1.99) on client ${client}`);
[newer,equal,older].forEach(r=>{if(r.pe.length)fails.push('page errors: '+r.pe.join(' | '));});
console.log('vergate',fails.length?'FAIL':'PASS',JSON.stringify({client,server:SERVER,newer:{shown:newer.shown,text:newer.text,asked:newer.asked},equal:equal.shown,older:older.shown,fails}));
await b.close();process.exit(fails.length?1:0);})();
