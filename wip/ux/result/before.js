// Hayden's before/after: today's live screens at 390x844 (career save at the Club, level 14, $640) -> wip/ux/result/live_{tonight,shop,locker,cards}.png
const {chromium}=require('playwright');const path=require('path');const dir=process.argv[2];
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined'&&window.C3,null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';save.matches=30;$('login').hidden=true;newCareer();const c=career();c.tier=1;c.bank=640;try{const v=C3.V3();v.lv=14;v.xp=200;}catch(e){}save.tcWelSeen=1;persist();showHub('play');});
const out=n=>path.join(__dirname,`live_${n}.png`);const close=()=>p.evaluate(()=>{try{const t=TC_API.st();delete t.welPend;}catch(e){}document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e=>e.remove());});
await p.waitForTimeout(4000);await close();await p.evaluate(()=>showHub('play'));await p.waitForTimeout(2500);await close();await p.waitForTimeout(400);await p.screenshot({path:out('tonight')});
console.log(await p.evaluate(()=>{hubTab('kit');try{showShop('barrel',true);return 'ok '+document.querySelectorAll('#shopList > *,.shop-row,.kit-row').length;}catch(e){return 'ERR '+e.message+' '+String(e.stack).slice(0,300);}}));await p.waitForTimeout(4000);await close();await p.screenshot({path:out('shop')});
await p.evaluate(()=>hubTab('player'));await p.waitForTimeout(2500);await close();await p.screenshot({path:out('locker')});
await p.evaluate(()=>{try{TC_API.binder();}catch(e){console.log(e)}});await p.waitForTimeout(1500);await p.screenshot({path:out('cards')});
await p.evaluate(()=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());const D=TC_API.D;const L=D.LEGENDS.find(l=>/barnev/i.test(l.id))||D.LEGENDS[0];TC_API.poster({venue:'the Club',tries:2,weeksLeft:3},L,true);});await p.waitForTimeout(2500);await p.screenshot({path:out('poster')});
console.log(JSON.stringify({pe:pe.slice(0,3),api:await p.evaluate(()=>Object.keys(window.TC_API||{}))}));await b.close();})();
