// S3 pros (Hayden 10:32): the real-pro look-alikes are a patch after launch. With S3 on and the look-alike switch at its default (off), every
// real-name pro and legend is a generic seeded Vinyl player from the builder (no look-alike look, no s3/pros/ file asked for), still the same
// each meeting. With ?s3pros=1 (patch work only) all 16 get their own look. node tests/s3-pros.js <dir>   (<dir> = the built page + assets)
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]);let reqs=[];const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';if(/\/s3\/pros\//.test(u))reqs.push(u);fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const fails=[];const F=m=>{fails.push(m);console.log('FAIL '+m);};const out={};
const NAMES=['Michael van Gerwen','Luke Littler','Luke Humphries','Gerwyn Price','Gary Anderson','Raymond van Barneveld','Phil Taylor','Peter Wright','Michael Smith','Nathan Aspinall','Rob Cross','Jonny Clayton','Stephen Bunting','Damon Heta','Danny Noppert','Chris Dobey','Fallon Sherlock'];
for(const mode of ['default','pros']){reqs=[];const cx=await b.newContext({...devices['iPhone 13']});const p=await cx.newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(()=>{window.TOPS_S3FLAG=true;try{localStorage.setItem('tops_s3','1');}catch(e){}});
 await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1${mode==='pros'?'&s3pros=1':''}`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
 await p.evaluate(()=>TOPS_LOADCHAR('leonard'));await p.waitForFunction(()=>TOPS_RIGS().ids.includes('leonard'),null,{timeout:180000});await p.waitForTimeout(1500);
 const r=await p.evaluate(NAMES=>NAMES.map(n=>{const f1=V._qa.makeFigure(lookFor(n),n,6),f2=V._qa.makeFigure(lookFor(n),n,6);const a=f1.userData.s3look||null,c=f2.userData.s3look||null;V._qa.dispose(f1);V._qa.dispose(f2);
  return {n,s3:!!f1.userData.s3fig,pro:a&&a.pro||null,same:JSON.stringify(a)===JSON.stringify(c),look:a?{body:a.body,skin:a.skin,hair:a.hair,face:a.face,shirt:a.shirt}:null};}),NAMES);
 out[mode]={on:await p.evaluate(()=>window.TOPS_S3_PROS_ON&&TOPS_S3_PROS_ON()),figs:r,proReqs:reqs.slice()};
 if(r.some(x=>!x.s3))F(mode+': not all S3 figures');if(r.some(x=>!x.same))F(mode+': a figure looks different the second time');
 if(mode==='default'){const pr=r.filter(x=>x.pro);if(pr.length)F('default: look-alike used for '+pr.map(x=>x.n).join(', '));if(reqs.length)F('default: asked for '+reqs.join(' '));
  /* seeded, not one look: at least 3 different builds / skins / hair across the 17 */for(const k of ['body','skin','hair']){const u=new Set(r.map(x=>x.look&&x.look[k]));if(u.size<3)F('default: only '+u.size+' different '+k+' across the pros');}}
 else{const pr=r.filter(x=>x.pro);if(pr.length!==16)F('pros: '+pr.length+' of 16 pros got their look-alike');}
 if(pe.length)F(mode+' page errors: '+pe.slice(0,2).join(' | '));await cx.close();}
console.log(JSON.stringify({default:{on:out.default.on,pros:out.default.figs.filter(x=>x.pro).length,looks:out.default.figs.map(x=>x.n+': '+JSON.stringify(x.look))},pros:{on:out.pros.on,pros:out.pros.figs.filter(x=>x.pro).length}},null,1));
await b.close();srv.close();console.log(fails.length?'S3-PROS FAIL':'S3-PROS PASS');process.exit(fails.length?1:0);})();
