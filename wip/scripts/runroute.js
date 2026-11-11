// The Run route pick at 390 px: two route cards, the tougher one tagged (Hayden 22:54). usage: node wip/scripts/runroute.js <tag>
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await require('./hl.js')(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;save.name='Hayden';$('login').hidden=true;newCareer();const c=career();c.run={stage:0};c.tier=2;c.stage=null;c.wins=1;c.losses=0;c.lives=3;c.routeOpts=null;persist();showRunRoute(()=>{});});
await p.waitForTimeout(2500);await p.screenshot({path:'shots/run_route_'+(process.argv[2]||'x')+'.jpg',quality:85,timeout:90000});console.log('errors:',errs.slice(0,3).join(' | ')||'none');await b.close();})();
