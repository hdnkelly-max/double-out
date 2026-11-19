// ENG-WALKON (Q&D 20:15): the model cache survives a release, and the clip file arrives without a walk-on asking for it.
// Serves <dir> with real ETag / 304 support and a TOPS_BUILD it can change between loads (= a new release), on one browser profile:
//  1. fresh device on a slow phone line (1.6 Mbit/s, 150 ms): the clip file (anims.glb) is fetched straight after the S3 rig, with no
//     hub or walk-on asking, and is in (V.animsReady()) - time logged;
//  2. a new release, nothing changed: every model is checked with one small request (304) and nothing is downloaded again;
//  3. a new release that changed anims.glb: that one file comes down again, the rest stay 304.
// node tests/asset-cache.js <dir>
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]);let build='1111',animsTag='a1';const log=[];
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(dir,u);
 fs.stat(f,(e,st)=>{if(e){r.writeHead(404);r.end();return;}const glb=/\.glb$/.test(u);const et='"'+st.size+'-'+(/anims\.glb$/.test(u)?animsTag:st.mtimeMs.toFixed(0))+'"';
  if(glb&&q.headers['if-none-match']===et){log.push({u,s:304,bytes:0});r.writeHead(304,{etag:et});r.end();return;}
  fs.readFile(f,(e2,d)=>{if(/index\.html$/.test(u))d=Buffer.from(d.toString().replace(/TOPS_BUILD="[^"]*"/,'TOPS_BUILD="'+build+'"'));if(/version\.json$/.test(u))d=Buffer.from(d.toString().replace(/"build":"[^"]*"/,'"build":"'+build+'"'));if(glb)log.push({u,s:200,bytes:d.length});
   r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':'application/octet-stream',etag:et,'cache-control':'no-cache'});r.end(d);});});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({...devices['iPhone 13']});
await ctx.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await ctx.addInitScript(()=>{try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_s3_welcome','1');}catch(e){}});
const url=`http://127.0.0.1:${srv.address().port}/index.html?s3=1`;const errs=[];
const run=async(name,slow)=>{log.length=0;const p=await ctx.newPage();p.on('pageerror',e=>errs.push(name+': '+e.message));
 if(slow){const cdp=await ctx.newCDPSession(p);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6e6/8,uploadThroughput:7.5e5/8});}
 const t0=Date.now();await p.goto(url);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});const tRig=Date.now()-t0;
 await p.waitForFunction(()=>V.animsReady&&V.animsReady(),null,{timeout:240000});const tAnims=Date.now()-t0;await p.waitForTimeout(1500);
 const res={name,tRig,tAnims,files:log.map(x=>x.u.replace(/.*\//,'')+' '+x.s+' '+(x.bytes/1e6).toFixed(2)+'MB')};await p.close();return res;};
const r1=await run('fresh, slow line',true);build='2222';const r2=await run('new release, nothing changed');build='3333';animsTag='a2';const r3=await run('new release, anims.glb changed');
[r1,r2,r3].forEach(r=>console.log(JSON.stringify(r)));
const bad=[];const anim=r=>r.files.filter(f=>/^anims\.glb/.test(f));
if(!anim(r1).some(f=>/ 200 /.test(f)))bad.push('1: anims.glb not fetched without a walk-on');
if(r2.files.some(f=>/ 200 /.test(f)))bad.push('2: downloaded again after a release with no change: '+r2.files.filter(f=>/ 200 /.test(f)).join(', '));
if(!r2.files.some(f=>/ 304 /.test(f)))bad.push('2: no 304 checks');
if(!anim(r3).some(f=>/ 200 /.test(f)))bad.push('3: changed anims.glb not downloaded');
if(r3.files.some(f=>/ 200 /.test(f)&&!/^anims\.glb/.test(f)))bad.push('3: unchanged files downloaded');
if(errs.length)bad.push('page errors: '+errs.slice(0,3).join(' | '));
console.log(bad.length?'ASSET-CACHE FAIL\n'+bad.join('\n'):'ASSET-CACHE PASS (slow line: S3 rig '+(r1.tRig/1000).toFixed(1)+' s, clip file in at '+(r1.tAnims/1000).toFixed(1)+' s with no walk-on asking; release with no change: '+r2.files.length+' models checked by 304, 0 downloaded; changed anims.glb: re-downloaded alone)');
await b.close();srv.close();process.exit(bad.length?1:0);})();
