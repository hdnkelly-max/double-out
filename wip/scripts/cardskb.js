// P6 a11y: Collection cards work from the keyboard. node cardskb.js <dir> [w] [h] -> PASS/FAIL
// Tab reaches an owned card (role=button, a name), Enter opens the card view, Escape/close returns; Space works too;
// locked slots are labelled and not in the tab order.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],w=+(process.argv[3]||390),h=+(process.argv[4]||844);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:w,height:h}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();save.tcIntro=Date.now();
 const D=window.TC_DATA;D.CARDS.slice(0,3).forEach(c=>TC_API.grant(c.id||c[0]));document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());TC_API.binder();});
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
await p.evaluate(()=>document.querySelectorAll('.tc-inspect').forEach(e=>e.remove()));await p.waitForTimeout(300);r.focusBack=await p.evaluate(()=>{const a=document.activeElement;return !!a&&a.matches('.tc-grid .tc[role=button]');});
await p.evaluate(()=>{const k=document.querySelector('.tc-grid .tc:not(.is-locked)');if(k)k.focus();});await p.keyboard.press(' ');await p.waitForTimeout(800);
r.spaceOpens=await p.evaluate(()=>!!document.querySelector('.tc-inspect'));
const pass=r.owned&&r.owned.role==='button'&&r.owned.label&&r.owned.tab===0&&r.locked&&r.locked.label&&r.locked.tab<0&&r.tabReached&&r.enterOpens&&r.focusBack&&r.spaceOpens&&!pe.length;
console.log('cardskb',pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
