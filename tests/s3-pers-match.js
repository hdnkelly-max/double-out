// Round 8D: PERS23 in a REAL match. For each base: a career practice match at the Pub (v3, PERS23 on by default); then the game's own hooks fire the
// moments the way play does: visitCall(10) -> miss, visitCall(140) -> celebrate, visitCall(180) -> signature, a bust, endMatch() with the player
// behind -> defeated. After each hook the frame loop runs; the face-pane figure must be holding that moment (persNow), it must pass the body clip
// check (TOPS_S3CLIP, as s3-clip-game), and a new pull must release it. Screenshots of the face pane go to <outdir> (optional).
// node tests/s3-pers-match.js <dir (forced v3 build)> [outdir]
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]),out=process.argv[3];if(out)fs.mkdirSync(out,{recursive:true});
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const fails=[];let checks=0,held=0;const pe=[];
for(const base of ['kai','ray','tama','mia','dazza']){const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();p.on('pageerror',e=>pe.push(base+': '+e.message));
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(()=>{try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_s3_welcome','1');localStorage.setItem('tops_v3','1');localStorage.removeItem('tops_pers23');}catch(e){}});
 await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1&s3gloss=phone`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
 await p.evaluate(()=>{V.loadAnims();});await p.waitForFunction(()=>V._qa.animNames().length>0,null,{timeout:120000});
 await p.evaluate(([base])=>{try{save.vlook={v:1,base,acc:[],accSet:false};}catch(e){}try{V.setPlayerLook(save.look,save.name);}catch(e){}beginMatch({mode:'career',tier:0,p0:'Kai',oppName:'Big Mal',oppAvg:40,legs:1,purse:0,practice:true});},[base]);
 await p.waitForTimeout(7000);
 const on=await p.evaluate(()=>!!(window.TOPS_PERS_ON&&TOPS_PERS_ON()));if(!on){fails.push(base+': PERS23 not on by default under v3');await ctx.close();continue;}
 const steps=[['miss',()=>{S.cur=S.p.findIndex(q=>!q.ai);visitCall(10);}],['celebrate',()=>{S.cur=S.p.findIndex(q=>!q.ai);visitCall(140);}],['sig',()=>{S.cur=S.p.findIndex(q=>!q.ai);visitCall(180);}],
  ['miss',()=>{/* bust: the same hook as a busted visit */const h=S.p.findIndex(q=>!q.ai);S.persMe=null;persHold(S.p[h],'miss',1600);}],['defeated',()=>{const h=S.p.findIndex(q=>!q.ai);S.p[h].legs=0;S.p[1-h].legs=1;endMatch();}]];
 for(const [si,[m,fn]] of steps.entries()){await p.evaluate(`(${fn.toString()})()`);/* the hook picked the moment; hold it longer for measuring only (software GL screenshots and clip checks outlast the 1.5 s in-game hold) */await p.evaluate(()=>{if(S&&S.persMe)S.persMe.until=performance.now()+60000;});await p.waitForTimeout(600);
  if(m==='defeated'){/* match end: the 3D is behind the result screen, so 'defeated' shows on the player's result portrait */const d=await p.evaluate(()=>{const im=document.querySelector('#rsPt0 img');const neutral=V.portrait(save.look,save.name,0,0,0);return {has:!!im,diff:!!im&&im.src!==neutral};});
   if(!d.has||!d.diff)fails.push(`${base}/defeated: result portrait ${d.has?'unchanged':'missing'}`);else held++;if(out)await p.screenshot({path:`${out}/${base}_${si}_defeated_result.png`,clip:{x:0,y:180,width:390,height:150}});continue;}
  if(out)await p.screenshot({path:`${out}/${base}_${si}_${m}${si===3?'_bust':''}.png`});
  const r=await p.evaluate(()=>{const f=V._qa.fpFig();if(!f)return {err:'no fpFig'};const now=f.userData.persNow||null;const c=window.TOPS_S3CLIP?TOPS_S3CLIP(f):null;const bad=[];if(c)for(const k of ['pants','arm','cuff','collar','trim','head','fist','skull','dart'])if(c[k])bad.push(k+':'+c[k]);return {now,checked:c?c.checked:0,bad,ex:c&&c.ex?c.ex.slice(0,2):[]};});
  if(r.err){fails.push(`${base}/${m}: ${r.err}`);continue;}checks+=r.checked;if(r.now===m)held++;else fails.push(`${base}/${m}: figure holds ${r.now}`);if(r.bad.length)fails.push(`${base}/${m}: clip ${r.bad.join(' ')} ${r.ex.join(' ')}`);
  }
 /* release: a new pull takes over a held moment (checked after 'sig' on a fresh hold) */
 const rel=await p.evaluate(async()=>{S.done=false;const h=S.p.findIndex(q=>!q.ai);persHold(S.p[h],'celebrate',5000);await new Promise(r=>setTimeout(r,400));const a=V._qa.fpFig().userData.persNow;S.pulling=true;S.pull=.5;await new Promise(r=>setTimeout(r,400));const b=V._qa.fpFig().userData.persNow;S.pulling=false;return {a,b};});
 if(rel.a!=='celebrate'||rel.b)fails.push(`${base}: release: held ${rel.a}, after a pull ${rel.b}`);
 await ctx.close();console.log(base,'done');}
console.log(JSON.stringify({held,checks,fails:fails.slice(0,20)}));if(pe.length)console.log('page errors',JSON.stringify(pe.slice(0,3)));
const bad=fails.length||pe.length||!checks;console.log(bad?`S3-PERS-MATCH FAIL (${fails.length} issues)`:`S3-PERS-MATCH PASS (5 bases, ${held} moments held through the game's hooks, ${checks} clip checks, release on pull OK)`);await b.close();srv.close();process.exit(bad?1:0);})();
