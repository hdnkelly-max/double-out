// F2 DOM checks + top-of-store and reward shots
const {chromium}=require('playwright');const tag=process.argv[2]||'x';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await require('./hl.js')(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';$('login').hidden=true;newCareer();career().bank=420;persist();const v=C3.V3();v.lv=12;v.bSeen=12;showShop('barrel');});await p.waitForTimeout(800);
const top=await p.evaluate(()=>{const s=$('v12lv');if(s)s.scrollIntoView({block:'start'});const k=$('kitImg');if(k)k.scrollIntoView({block:'start'});return {strip:s?s.innerText.replace(/\n/g,' | '):null,bankHdr:document.querySelector('.hub-top,#hubBank,.bank')?.innerText,shopBank:$('shopBank').textContent};});
await p.waitForTimeout(500);await p.screenshot({path:`shots/f2_${tag}_kit_top.jpg`,quality:80});
if(top.strip)await p.evaluate(()=>$('v12lv').scrollIntoView({block:'center'}));await p.waitForTimeout(300);await p.screenshot({path:`shots/f2_${tag}_strip.jpg`,quality:80});
const prev=await p.evaluate(()=>{const r=[...document.querySelectorAll('#shopList .opt.v12lock')][0];r.click();const x=r.nextElementSibling;const no=x&&x.querySelector('.v12no');if(no)no.scrollIntoView({block:'center'});return {expanded:!!(x&&x.classList.contains('st2x')),note:no?no.innerText:null,buttons:x?x.querySelectorAll('button').length:-1};});
await p.waitForTimeout(500);await p.screenshot({path:`shots/f2_${tag}_prev_note.jpg`,quality:80});
const rw=await p.evaluate(()=>{const v=C3.V3();v.lv=15;v.bSeen=14;let el=$('c3rw');if(!el){el=document.createElement('div');el.id='c3rw';el.className='c3rw';document.body.appendChild(el);}
 el.innerHTML='<div class="c3rw-card w" role="dialog"><div class="c3rw-top"><b class="c3rw-res">Win</b></div><div class="c3rw-act"><button class="btn">Continue</button></div></div>';el.hidden=false;TOPS_v12Reward();
 const c=el.querySelector('.v12rw');return {cards:el.querySelectorAll('.v12rw').length,txt:c?c.innerText.replace(/\n/g,' | '):null,overlayVisible:getComputedStyle(el).display,img:!!el.querySelector('.v12im')};});
await p.waitForTimeout(2600);await p.screenshot({path:`shots/f2_${tag}_reward.jpg`,quality:80});
console.log(JSON.stringify({top,prev,rw,errs:errs.slice(0,4)},null,1));await b.close();})();
