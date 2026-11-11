// #13 "What are cards?" explainer: shots + checks. node cards13.js <dir> <w> <h> <tag>
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],w=+process.argv[3],h=+process.argv[4],tag=process.argv[5]||'c13';
const out='/home/claude/double-out/wip/shots/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:w,height:h},hasTouch:w<600,isMobile:w<600});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
const res={};
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();delete save.tcIntro;try{showHub();}catch(e){}});
await p.waitForTimeout(1200);
// hub tile label
res.tile=await p.evaluate(()=>{const t=document.getElementById('tcColTile');return t?t.innerText.replace(/\s+/g,' '):null;});
// a pick, then open picks: the explainer comes first
await p.evaluate(()=>{TC_API.award('c13test:'+Date.now(),'max','180');});
await p.evaluate(()=>window.tcOpenPicks());await p.waitForTimeout(600);
res.introFirst=await p.evaluate(()=>!!document.querySelector('.tc-intro')&&!!save.tcIntro);
res.introBtn=await p.evaluate(()=>{const e=document.querySelector('.tc-introgo');return e&&e.textContent;});
res.fits=await p.evaluate(()=>{const e=document.querySelector('.tc-introgo');const r=e&&e.getBoundingClientRect();return r?{bottom:Math.round(r.bottom),vh:innerHeight}:null;});
await p.screenshot({path:out+tag+'_intro.png'});
await p.click('.tc-introgo');await p.waitForTimeout(900);
res.packAfter=await p.evaluate(()=>!document.querySelector('.tc-intro')&&!!document.querySelector('.tcpk, [class*="tcpk"]'));
await p.screenshot({path:out+tag+'_pack.png'});
// second time: no explainer
await p.evaluate(()=>{document.querySelectorAll('[class*="tcpk"],.tc-sheet').forEach(e=>e.remove());TC_API.award('c13test2:'+Date.now(),'max','180');window.tcOpenPicks();});await p.waitForTimeout(500);
res.introSecond=await p.evaluate(()=>!!document.querySelector('.tc-intro'));
await p.evaluate(()=>{document.querySelectorAll('[class*="tcpk"],.tc-sheet').forEach(e=>e.remove());TC_API.binder();});await p.waitForTimeout(600);
await p.screenshot({path:out+tag+'_binder.png'});
await p.click('#tcWhat');await p.waitForTimeout(500);
res.fromBinder=await p.evaluate(()=>{const e=document.querySelector('.tc-intro .tc-introgo');return e&&e.textContent;});
await p.click('.tc-intro .tc-introgo');await p.waitForTimeout(400);
res.binderStill=await p.evaluate(()=>!!document.querySelector('.tc-binder')&&!document.querySelector('.tc-intro'));
const pass=res.tile&&/Cards/.test(res.tile)&&res.introFirst&&res.introBtn==='Open my picks'&&res.packAfter&&!res.introSecond&&res.fromBinder==='Got it'&&res.binderStill&&!pe.length;
console.log(tag,pass?'PASS':'FAIL',JSON.stringify(res),pe.slice(0,3).join(' | '));await b.close();process.exit(pass?0:1);})();
