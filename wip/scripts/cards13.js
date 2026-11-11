// #13 "What are cards?" through the real flows (real clicks): node cards13.js <dir> <w> <h> <tag> -> PASS/FAIL
// A. New player: the one-time "Cards are here" welcome carries the explainer; Open picks goes straight to the pack (no second sheet).
// B. Existing player who saw the welcome before the explainer existed: a one-time "What are cards?" sheet before the next pick, then the pack.
// C. The Cards screen has a "What are cards?" link that opens the sheet and returns to the binder. The hub entry reads "Cards".
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],w=+process.argv[3],h=+process.argv[4],tag=process.argv[5]||'c13';
const out='/home/claude/double-out/wip/shots/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const shot=async(p,name)=>{await p.evaluate(()=>document.querySelectorAll('.tc-sheet,.tc-sheet *').forEach(e=>{e.style.animation='none';}));await p.screenshot({path:out+tag+'_'+name+'.png',timeout:120000,animations:'disabled'});};
const clickSel=async(p,sel)=>{const q=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};},sel);if(q){await p.mouse.click(q.x,q.y);return true;}return false;};
const page=async()=>{const p=await b.newPage({viewport:{width:w,height:h},hasTouch:w<600,isMobile:w<600});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());p.pe=[];p.on('pageerror',e=>p.pe.push(e.message));
 await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);return p;};
const packOpen=p=>p.evaluate(()=>!!document.querySelector('.tcpk'));
const r={};
// A. new player
{const p=await page();await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();delete save.tcIntro;showHub();});
 await p.waitForSelector('.tc-welcome',{timeout:15000}).catch(()=>{});await p.waitForTimeout(400);
 r.tile=await p.evaluate(()=>{const t=document.getElementById('tcColTile');return t?(t.querySelector('small')||{}).textContent:null;});
 r.welcome=await p.evaluate(()=>{const e=document.querySelector('.tc-welcome');return e?{how:e.querySelectorAll('.tc-wel-how li').length,intro:!!save.tcIntro}:null;});
 const fit=await p.evaluate(()=>{const g=document.getElementById('tcWelGo');const q=g&&g.getBoundingClientRect();return q?{bottom:q.bottom|0,vh:innerHeight}:null;});r.welcomeFits=fit;
 await shot(p,'welcome');
 await clickSel(p,'#tcWelGo');await p.waitForTimeout(1500);
 r.newNoSecondSheet=await p.evaluate(()=>!document.querySelector('.tc-intro'));r.newPack=await packOpen(p);
 r.peA=p.pe.slice();await p.close();}
// B. existing player (welcome seen long ago, explainer not yet)
{const p=await page();await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();showHub();});
 await p.waitForSelector('.tc-welcome',{timeout:15000}).catch(()=>{});await p.waitForTimeout(400);
 /* an existing player saw this welcome in an older version (before the explainer existed): dismiss it with Later, then clear the flag */
 await clickSel(p,'#tcWelLater');await p.waitForTimeout(500);r.welcomeDismissed=await p.evaluate(()=>!document.querySelector('.tc-welcome'));
 await p.evaluate(()=>{delete save.tcIntro;TC_API.award('c13b:'+Date.now(),'max','180');window.tcOpenPicks();});await p.waitForTimeout(700);
 r.existingSheet=await p.evaluate(()=>{const e=document.querySelector('.tc-intro');return e?{rows:e.querySelectorAll('.tc-introl li').length,btn:(e.querySelector('.tc-introgo')||{}).textContent}:null;});
 await shot(p,'intro');
 await p.evaluate(()=>{window.__clk=[];document.addEventListener('click',e=>{window.__clk.push((e.target.className||e.target.tagName)+'|'+document.querySelectorAll('.tc-sheet').length);},true);});
 r.introAt=await p.evaluate(()=>{const g=document.querySelector('.tc-intro .tc-introgo');const q=g.getBoundingClientRect();const top=document.elementFromPoint(q.x+q.width/2,q.y+q.height/2);return {btn:[q.x|0,q.y|0,q.width|0,q.height|0],top:top&&String(top.className).slice(0,40),sheets:[...document.querySelectorAll('.tc-sheet')].map(e=>e.className)};});
 await clickSel(p,'.tc-intro .tc-introgo');await p.waitForTimeout(1500);r.clk=await p.evaluate(()=>window.__clk);r.after=await p.evaluate(()=>({sheets:[...document.querySelectorAll('.tc-sheet,.tcpk')].map(e=>e.className.slice(0,30)),picks:TC_API.st().picks.filter(p=>p.chosen==null).length}));
 r.existingPack=await packOpen(p);
 // next pick: no sheet again
 await p.evaluate(()=>{document.querySelectorAll('.tc-sheet,.tcpk').forEach(e=>e.remove());TC_API.award('c13c:'+Date.now(),'max','180');window.tcOpenPicks();});await p.waitForTimeout(600);
 r.secondTimeNoSheet=await p.evaluate(()=>!document.querySelector('.tc-intro'));
 // C. binder link
 await p.evaluate(()=>{document.querySelectorAll('.tc-sheet,.tcpk').forEach(e=>e.remove());TC_API.binder();});await p.waitForTimeout(700);
 await shot(p,'binder');
 r.preWhat=await p.evaluate(()=>[...document.querySelectorAll('.tc-sheet,.tcpk')].map(e=>e.className.slice(0,30)));await clickSel(p,'#tcWhat');await p.waitForTimeout(600);
 r.linkBtn=await p.evaluate(()=>{const e=document.querySelector('.tc-intro .tc-introgo');return e&&e.textContent;});
 await clickSel(p,'.tc-intro .tc-introgo');await p.waitForFunction(()=>!document.querySelector('.tc-intro'),null,{timeout:5000}).catch(()=>{});
 r.backToBinder=await p.evaluate(()=>!!document.querySelector('.tc-binder')&&!document.querySelector('.tc-intro'));r.bDbg=await p.evaluate(()=>[...document.querySelectorAll('.tc-sheet,.tcpk')].map(e=>e.className.slice(0,30)));
 r.peB=p.pe.slice();await p.close();}
const pass=r.tile==='Cards'&&r.welcome&&r.welcome.how===3&&r.welcome.intro&&r.welcomeFits&&r.welcomeFits.bottom<=r.welcomeFits.vh&&r.newNoSecondSheet&&r.newPack&&r.existingSheet&&r.existingSheet.btn==='Open my picks'&&r.existingPack&&r.secondTimeNoSheet&&r.linkBtn==='Got it'&&r.backToBinder&&!r.peA.length&&!r.peB.length;
console.log(tag,pass?'PASS':'FAIL',JSON.stringify(r));await b.close();process.exit(pass?0:1);})();
