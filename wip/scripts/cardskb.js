// P6 a11y: Collection cards work from the keyboard. node cardskb.js <dir> [w] [h] -> PASS/FAIL
// Tab reaches an owned card (role=button, a name), Enter opens the card view, Escape/close returns; Space works too;
// locked slots are labelled and not in the tab order.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],w=+(process.argv[3]||390),h=+(process.argv[4]||844);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:w,height:h}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();save.tcIntro=Date.now();
 const D=window.TC_DATA;D.CARDS.slice(0,3).forEach(c=>TC_API.grant(c.id||c[0]));TC_API.grant('mo'); /* QA 05:10: a no-reward card too */D.CARDS.filter(c=>c.cosmetic).slice(0,1).forEach(c=>TC_API.grant(c.id));document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());TC_API.binder();});
await p.waitForTimeout(1000);
const r={};
r.owned=await p.evaluate(()=>{const k=document.querySelector('.tc-grid .tc:not(.is-locked)');return k?{role:k.getAttribute('role'),label:k.getAttribute('aria-label'),tab:k.tabIndex}:null;});
r.locked=await p.evaluate(()=>{const k=document.querySelector('.tc-grid .tc.is-locked');return k?{role:k.getAttribute('role'),label:k.getAttribute('aria-label'),tab:k.tabIndex}:null;});
// Tab until focus lands on a card (max 40 presses)
let hit=null;for(let i=0;i<40&&!hit;i++){await p.keyboard.press('Tab');hit=await p.evaluate(()=>{const a=document.activeElement;return a&&a.matches('.tc-grid .tc')?a.getAttribute('aria-label'):null;});}
r.tabReached=hit;
await p.screenshot({path:require('path').resolve(__dirname,'../shots')+'/cardskb_focus.png',timeout:120000});r.focusRing=await p.evaluate(()=>{const a=document.activeElement;return a?getComputedStyle(a).outlineStyle+' '+getComputedStyle(a).outlineWidth:null;});
await p.keyboard.press('Enter');await p.waitForTimeout(800);
r.enterOpens=await p.evaluate(()=>!!document.querySelector('.tc-inspect'));
r.focusInView=await p.evaluate(()=>{const v=document.querySelector('.tc-inspect');return !!v&&v.contains(document.activeElement);});
for(let i=0;i<6;i++)await p.keyboard.press('Tab');
r.tabTrapped=await p.evaluate(()=>{const v=document.querySelector('.tc-inspect');return !!v&&v.contains(document.activeElement);});
await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('.tc-inspect'),null,{timeout:5000}).catch(()=>{});
r.escCloses=await p.evaluate(()=>!document.querySelector('.tc-inspect'));
await p.evaluate(()=>document.querySelectorAll('.tc-inspect').forEach(e=>e.remove()));await p.waitForTimeout(300);r.focusBack=await p.evaluate(()=>{const a=document.activeElement;return !!a&&a.matches('.tc-grid .tc[role=button]');});
await p.evaluate(()=>{const k=document.querySelector('.tc-grid .tc:not(.is-locked)');if(k)k.focus();});await p.keyboard.press(' ');await p.waitForTimeout(800);
r.spaceOpens=await p.evaluate(()=>!!document.querySelector('.tc-inspect'));
await p.evaluate(()=>document.querySelectorAll('.tc-inspect').forEach(e=>e.remove()));await p.waitForTimeout(300);
const inV=()=>p.evaluate(()=>{const v=document.querySelector('.tc-inspect');return !!v&&v.contains(document.activeElement)?(document.activeElement.className||document.activeElement.textContent||'').toString().slice(0,20):false;});
// QA 05:10 #1: a no-reward card (Mo Rangi): Tab and Shift+Tab x5 keep focus on the close button
await p.evaluate(()=>{const k=document.querySelector('.tc-grid .tc[data-id="mo"]');if(k)k.focus();});await p.keyboard.press('Enter');await p.waitForTimeout(800);
r.moOpen=await p.evaluate(()=>!!document.querySelector('.tc-inspect'));const mo=[];for(let i=0;i<5;i++){await p.keyboard.press('Tab');mo.push(await inV());}for(let i=0;i<5;i++){await p.keyboard.press('Shift+Tab');mo.push(await inV());}
r.moTrap=mo.every(x=>x&&/tc-x/.test(x));r.moSeq=mo.slice(0,3);
await p.keyboard.press('Escape');await p.waitForTimeout(500);r.moBack=await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.id==='mo');
// reward card: Tab reaches the close button
const rid=await p.evaluate(()=>{const k=[...document.querySelectorAll('.tc-grid .tc[role=button]')].find(k=>{const c=TC_DATA.CARDS.find(c=>c.id===k.dataset.id);return c&&c.cosmetic;});if(k){k.focus();return k.dataset.id;}return null;});
await p.keyboard.press('Enter');await p.waitForTimeout(800);const rw=[];for(let i=0;i<8;i++){await p.keyboard.press('Tab');rw.push(await inV());}
r.rewardId=rid;r.rewardReachesX=rw.some(x=>x&&/tc-x/.test(x));r.rewardTrap=rw.every(Boolean);
await p.keyboard.press('Escape');await p.waitForTimeout(500);
// QA 05:10 #2: a held Enter opens once and stays open
await p.evaluate(()=>{const k=document.querySelector('.tc-grid .tc[data-id="mo"]');if(k)k.focus();});
await p.keyboard.down('Enter');await p.waitForTimeout(100);for(let i=0;i<6;i++){await p.keyboard.down('Enter');await p.waitForTimeout(60);}await p.keyboard.up('Enter');await p.waitForTimeout(800);
r.heldViews=await p.evaluate(()=>document.querySelectorAll('.tc-inspect').length);
await p.keyboard.press('Escape');await p.waitForTimeout(500);
// QA 05:10 #3: the binder redraws under the open view -> focus returns to the same card in the new grid
await p.evaluate(()=>{const k=document.querySelector('.tc-grid .tc[data-id="mo"]');if(k)k.focus();});await p.keyboard.press('Enter');await p.waitForTimeout(800);
await p.evaluate(()=>{const b=document.querySelector('#tcChips button[data-s="all"]');if(b)b.click();});await p.waitForTimeout(300);
await p.keyboard.press('Escape');await p.waitForTimeout(500);r.redrawBack=await p.evaluate(()=>{const a=document.activeElement;return !!a&&a.matches('.tc-grid .tc')&&a.dataset.id==='mo';});
const pass=r.owned&&r.owned.role==='button'&&/ card/.test(r.owned.label||'')&&r.owned.tab===0&&r.locked&&r.locked.label&&r.locked.tab<0&&r.tabReached&&r.enterOpens&&r.focusInView&&r.tabTrapped&&r.escCloses&&r.focusBack&&r.spaceOpens&&r.moOpen&&r.moTrap&&r.moBack&&r.rewardId&&r.rewardReachesX&&r.rewardTrap&&r.heldViews===1&&r.redrawBack&&!pe.length;
console.log('cardskb',pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
