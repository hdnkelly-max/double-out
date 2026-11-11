// Quick route picker: the in-match route chips at 390 px on a finishable score. usage: node wip/scripts/routeshots.js <tag> [score] [dart]
const {chromium}=require('playwright');const [tag='x',score='100',dart='1']=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await require('./hl.js')(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
await p.evaluate(([sc,dt])=>{save.authSeen=true;save.lessonDone=true;save.name='Hayden';$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;c.bank=500;persist();
 beginMatch({mode:'career',tier:1,p0:'Hayden',oppName:'Tama Rewiri',oppAvg:60,legs:3});try{$('intro').classList.remove('show');}catch(e){}S.p[0].score=+sc;S.dart=+dt;S.plan=null;try{updateUI();renderRoutes();}catch(e){}},[score,dart]);
await p.waitForTimeout(2500);await p.evaluate(()=>{try{$('intro').classList.remove('show');renderRoutes();}catch(e){}});await p.waitForTimeout(500);
await p.screenshot({path:`shots/routes_${tag}_${score}.jpg`,quality:85,timeout:90000});
const info=await p.evaluate(()=>{const h=$('routes');return h?{hidden:h.hidden,cls:h.className,html:h.innerText.slice(0,200),rect:h.getBoundingClientRect().toJSON()}:null;});
console.log(JSON.stringify(info),'errors:',errs.slice(0,3).join(' | ')||'none');await b.close();})();
