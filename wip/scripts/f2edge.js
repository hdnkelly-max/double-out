// F2 edge cases (ChatGPT review 19:10). Prints PASS/FAIL per check; exits 1 on any failure.
// usage: node wip/scripts/f2edge.js
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await require('./hl.js')(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
const url='file://'+require('path').resolve(__dirname,'../../index.html');
await p.goto(url);await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
const res=[];const ok=(n,c,d)=>res.push((c?'PASS ':'FAIL ')+n+(d?' · '+d:''));
// fake reward overlay, then fire the career3 hook the way showReward does
const fire=()=>p.evaluate(()=>{let el=$('c3rw');if(!el){el=document.createElement('div');el.id='c3rw';el.className='c3rw';document.body.appendChild(el);}
 el.innerHTML='<div class="c3rw-card w"><div class="c3rw-act"></div></div>';el.hidden=false;TOPS_REWARD(el);
 return [...el.querySelectorAll('.v12rw')].map(c=>c.innerText.replace(/\n/g,' | '));});
await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';$('login').hidden=true;newCareer();persist();});
// 1) level skip with several unlocks in one go: Lv 5 -> 8 opens Core XL (6), Supergrip (8) and the spin shaft (6)
let c=await p.evaluate(()=>{const v=C3.V3();v.lv=8;v.bSeen=5;career().bank=0;return 0;});c=await fire();
ok('skip 5->8: two barrel cards + one parts card',c.length===3&&/CORE XL/i.test(c.join())&&/SUPERGRIP/i.test(c.join())&&/kit unlocked/i.test(c.join()),c.length+' cards');
ok('zero bank: "to go" shown',c.filter(x=>/to go/.test(x)).length===2);
let nw=await p.evaluate(()=>save.v12new.slice().sort().join());ok('all three tagged New',nw==='corexl,shaft:spin,supergrip',nw);
// 2) same level again: no duplicate cards
c=await fire();ok('no repeat cards at the same level',c.length===0,c.length+' cards');
// 3) exact price is affordable
c=await p.evaluate(()=>{const v=C3.V3();v.lv=15;v.bSeen=14;const r=BARRELS.find(b=>b.id==='razor');career().bank=price(r.price);return 0;});c=await fire();
ok('exact bank = price: "you can afford it"',c.length===1&&/you can afford it/.test(c[0]),c[0]);
// 4) New chips: shown on matching rows only, survive a tab switch and a reload, clear on open
let s=await p.evaluate(()=>{hubTab('career');showShop('barrel');return [...document.querySelectorAll('#shopList .v12new')].map(x=>x.closest('.opt').dataset.v12id).sort().join();});
ok('chips on corexl, razor, supergrip rows',s==='corexl,razor,supergrip',s);
s=await p.evaluate(()=>{hubTab('career');hubTab('kit');showShop('barrel');return document.querySelectorAll('#shopList .v12new').length;});ok('chips survive a tab switch',s===3,s);
await p.reload();await p.waitForTimeout(4500);
s=await p.evaluate(()=>{save.authSeen=true;$('login').hidden=true;showShop('barrel');return document.querySelectorAll('#shopList .v12new').length+'/'+(save.v12new||[]).length;});ok('chips survive a reload',s==='3/4',s);
s=await p.evaluate(()=>{const r=document.querySelector('#shopList .opt[data-v12id="razor"]');r.click();return [!r.querySelector('.v12new'),!save.v12new.includes('razor'),save.v12new.length].join();});
ok('opening Razor Edge clears only its chip',s==='true,true,3',s);
s=await p.evaluate(()=>{showShop('setup');return [...document.querySelectorAll('#setupList .v12new')].map(x=>x.closest('.opt').dataset.v12id).join();});ok('kit part chip on the spin shaft',s==='shaft:spin',s);
// 5) buying a tagged item drops it from the queue
s=await p.evaluate(()=>{career().bank=999;save.owned.push('supergrip');showShop('barrel');return save.v12new.includes('supergrip')+'/'+!!document.querySelector('#shopList .opt[data-v12id="supergrip"] .v12new');});
ok('owned items leave the New queue',s==='false/false',s);
// 6) sponsor grant is idempotent; owned barrels are never removed
s=await p.evaluate(()=>{save.sponsor='rd';for(let i=0;i<3;i++)showShop('barrel');const n=save.owned.filter(x=>x==='iceman').length;save.sponsor=null;showShop('barrel');return n+'/'+save.owned.includes('iceman');});
ok('Red Dragon set granted once and kept after the deal ends',s==='1/true',s);
s=await p.evaluate(()=>save.owned.length===new Set(save.owned).size);ok('no duplicate owned ids',s);
// 7) rows map to the right barrel after the sort (row title contains the barrel name)
s=await p.evaluate(()=>{showShop('barrel');const bad=[...document.querySelectorAll('#shopList .opt[data-v12id]')].filter(el=>{const b=BARRELS.find(x=>x.id===el.dataset.v12id);return !b||!el.innerText.toUpperCase().includes(b.n.toUpperCase().slice(0,12));}).map(el=>el.dataset.v12id);return bad.join()||'ok';});
ok('every row id matches its title',s==='ok',s);
// 8) not in career (The Run / no career): no gates, no strip
s=await p.evaluate(()=>{const c=save.career;save.career=null;let g;try{g=TOPS_GATE.gateBarrel(BARRELS.find(b=>b.id==='power'));}finally{save.career=c;}return g===null;});ok('no gates outside a career',s);
s=await p.evaluate(()=>{const c=career();const had=c.run;c.run={stage:0};let g;try{g=['mvg','littler','iceman','power'].map(id=>TOPS_GATE.gateBarrel(BARRELS.find(b=>b.id===id)));}finally{c.run=had;}return g.every(x=>x===null);});ok('The Run: sponsor sets and level-locked barrels all open',s);
ok('no page errors',errs.length===0,errs.slice(0,3).join(' || '));
console.log(res.join('\n'));await b.close();process.exit(res.some(r=>r.startsWith('FAIL'))?1:0);})();
