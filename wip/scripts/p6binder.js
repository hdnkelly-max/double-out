// P6: text size on cards in the Collection (binder) and the pack summary. node p6binder.js <dir> <w> <h> <tag>
// Reports every visible text element on .tc cards under 11px, and any whose text is clipped. PASS = none.
const {chromium}=require('playwright');let r0;(async()=>{const dir=process.argv[2],w=+process.argv[3],h=+process.argv[4],tag=process.argv[5]||'p6';
const out=require('path').resolve(__dirname,'../shots')+'/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:w,height:h},hasTouch:w<600,isMobile:w<600});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');
/* real fonts (Google Fonts is blocked here): local @fontsource copies, if present */
try{const css=require('fs').readFileSync('/home/claude/fonts/fonts_local.css','utf8');await p.addStyleTag({content:css});}catch(e){}await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();save.tcIntro=Date.now();save.tcWelcomed=Date.now();
 const D=window.TC_DATA;const rar=c=>c.r||c.rarity||c[4],cid=c=>c.id||c[0];
 /* own one card of each rarity so the binder shows real cards (incl. the longest set names) */
 ['common','uncommon','rare','epic','legendary'].forEach(r=>{D.CARDS.filter(c=>rar(c)===r).slice(0,2).forEach(c=>TC_API.grant(cid(c)));});
 /* and the longest names, which get the smallest type */
 D.CARDS.slice().sort((a,b)=>String(b.name||b[2]).length-String(a.name||a[2]).length).slice(0,6).forEach(c=>TC_API.grant(cid(c)));
 window.__longIds=D.CARDS.slice().sort((a,b)=>String(b.name||b[2]).length-String(a.name||a[2]).length).slice(0,6).map(cid);
 document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());TC_API.binder();});
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
r0=await p.evaluate(()=>document.fonts.check('800 16px "Barlow Condensed"'));
const measure=()=>p.evaluate(()=>{const res=[];document.querySelectorAll('.tc-grid .tc:not(.is-locked) *, .tc-sets .tc:not(.is-locked) *').forEach(e=>{if(!e.childNodes.length)return;const ownTxt=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();if(!ownTxt)return;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')return;const r=e.getBoundingClientRect();if(!r.width)return;const fs=parseFloat(cs.fontSize);const pr=e.closest('.tc__plate');const pb=pr&&pr.getBoundingClientRect();const clip=(e.scrollWidth>e.clientWidth+1&&(cs.overflow!=='visible'||cs.textOverflow==='ellipsis'))||(pb&&(r.right>pb.right+1||r.left<pb.left-1))||(/tc__name/.test(e.className)&&e.scrollHeight>e.clientHeight+2);res.push({cls:String(e.className).slice(0,24),txt:ownTxt.slice(0,22),fs:+fs.toFixed(1),clip});});
 const card=document.querySelector('.tc-grid .tc');return {cardW:card&&card.getBoundingClientRect().width|0,small:res.filter(x=>x.fs<11),clipped:res.filter(x=>x.clip),n:res.length};});
const r=await measure();r.realFont=r0;
await p.evaluate(()=>document.querySelectorAll('.tc-sheet *').forEach(e=>e.style.animation='none'));await p.screenshot({path:out+tag+'_binder.png',animations:'disabled'});
await p.evaluate(()=>{const e=document.querySelector('.tc-grid .tc:not(.is-locked) .tc__name.is-xlong');if(e)e.closest('.tc').scrollIntoView({block:'center'});});await p.waitForTimeout(500);await p.screenshot({path:out+tag+'_long.png',animations:'disabled'});
const uniq=a=>[...new Map(a.map(x=>[x.cls+'|'+x.fs,x])).values()];
r.small=uniq(r.small);r.clipped=uniq(r.clipped);
const pass=r.n>0&&!r.small.length&&!r.clipped.length&&!pe.length;
console.log(tag,pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
