const {chromium}=require('playwright');const tier=+(process.argv[2]||4),tag=process.argv[3]||'a';(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1366,height:768}});p.on('pageerror',e=>console.log('ERR',e.message));await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
p.on('console',m=>{if(/plate|venue|404|ERR_|Failed/i.test(m.text()))console.log('C',m.text())});p.on('requestfailed',r=>console.log('RF',r.url().slice(-60)));await p.goto('file:///home/claude/oche-next/index.html');await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(3000);
await p.evaluate(t=>{save.authSeen=true;save.name='Hayden';persist();$('login').hidden=true;V.walkOn=()=>{};newCareer();save.look.model='pete';persist();beginMatch({mode:'career',tier:t,p0:'Hayden',oppKey:'deano',oppName:'Deano',oppAvg:60,legs:3});},tier);
await p.waitForTimeout(30000);await p.evaluate(()=>{$('intro').classList.remove('show');});
const views=[['n',null],['w',{pos:[-1.2,1.8,2.6],look:[4,1.6,2.3],fov:62}]];
for(const [n,c] of views){await p.evaluate(c=>window.GFX_FACECAM=c,c);await p.waitForTimeout(3500);await p.screenshot({path:`shots/side${tier}_${tag}_${n}.jpg`,clip:{x:800,y:48,width:566,height:608},quality:80,timeout:120000});}
await b.close();})();
