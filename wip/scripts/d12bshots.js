// #12b shots: the career hub (where the difficulty chip lives) and the match intro card, at 390 px.
// usage: node wip/scripts/d12bshots.js <tag> [lv]   (writes shots/d12b_<tag>_*.jpg)
const {chromium}=require('playwright');const tag=process.argv[2]||'x',lv=process.argv[3]||'club';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await require('./hl.js')(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(800);
await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
await p.evaluate(lv=>{save.authSeen=true;save.lessonDone=true;save.name='Hayden';$('login').hidden=true;newCareer();const c=career();c.stage=null;c.tier=1;c.bank=500;save.diff={lv,darts:0,pts:0,place:0};persist();showHub();},lv);
await p.waitForTimeout(1500);await p.screenshot({path:`shots/d12b_${tag}_hub.jpg`,quality:80});
await p.evaluate(()=>{V.walkOn=()=>{};playNext();});for(let i=0;i<30;i++){await p.waitForTimeout(150);if(await p.evaluate(()=>{const e=$('intro');return e&&e.classList.contains('show');}))break;}await p.waitForTimeout(500);
const shown=await p.evaluate(()=>{const e=$('intro');const was=e.classList.contains('show');e.classList.add('show');return was;});await p.waitForTimeout(400);
await p.screenshot({path:`shots/d12b_${tag}_intro.jpg`,quality:80});console.log('intro was showing on its own:',shown);
console.log('page errors:',errs.slice(0,5).join(' || ')||'none');await b.close();})();
