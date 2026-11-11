// Calibration flag: the hub menu with the Sway test toggle, off and on (390 px).
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await require('./hl.js')(p);
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;save.name='Hayden';$('login').hidden=true;newCareer();const c=career();c.stage=null;c.tier=1;c.bank=500;persist();showHub();});
await p.waitForTimeout(2000);await p.evaluate(()=>{$('btnHubMenu').click();});await p.waitForTimeout(500);
await p.screenshot({path:'shots/cal_menu_off.jpg',quality:80,timeout:90000});
await p.evaluate(()=>{$('btnCalSway').click();});await p.waitForTimeout(300);
await p.screenshot({path:'shots/cal_menu_on.jpg',quality:80,timeout:90000});await b.close();})();
