// Rule 22 baseline: screenshots of the main menu screens at a phone size, real fonts if available.
// node r22shots.js <dir> <w> <h> <tag>  -> wip/shots/<tag>_<screen>.png + a small-text report per screen
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],w=+(process.argv[3]||390),h=+(process.argv[4]||844),tag=process.argv[5]||'r22';
const out=require('path').resolve(__dirname,'../shots')+'/';require('fs').mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:w,height:h},hasTouch:w<600,isMobile:w<600});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');
if(process.env.FONTS!=='fallback'){try{await p.addStyleTag({content:require('fs').readFileSync('/home/claude/fonts/fonts_local.css','utf8')});}catch(e){}}
await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=12;$('login').hidden=true;newCareer();save.tcIntro=Date.now();save.tcWelcomed=Date.now();document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();});
await p.waitForTimeout(2500);
for(let i=0;i<3;i++){const L=await p.$('#tcWelLater');if(!L)break;await L.click().catch(()=>{});await p.waitForTimeout(800);}
await p.evaluate(()=>document.querySelectorAll('.tc-sheet').forEach(e=>e.remove()));
const small=()=>p.evaluate(()=>{const res={};document.querySelectorAll('body *').forEach(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();if(!own)return;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.3)return;const r=e.getBoundingClientRect();if(!r.width||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)return;let hid=false;for(let a=e;a;a=a.parentElement){if(a.hidden){hid=true;break;}}if(hid)return;const sc=e.offsetHeight?r.height/e.offsetHeight:1;const fs=parseFloat(cs.fontSize)*sc;if(fs<11){const k=(own.slice(0,18))+'@'+fs.toFixed(1);res[k]=1;}});
 const taps=[...document.querySelectorAll('button,[role=button],a')].filter(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);return r.width&&r.height&&cs.display!=='none'&&cs.visibility!=='hidden'&&r.bottom>0&&r.top<innerHeight&&(r.height<44||r.width<44);}).map(e=>((e.textContent||e.getAttribute('aria-label')||e.id||'').trim().slice(0,14))+'@'+(e.getBoundingClientRect().width|0)+'x'+(e.getBoundingClientRect().height|0));
 return {small:Object.keys(res).slice(0,25),smallN:Object.keys(res).length,tapsUnder44:taps.slice(0,20),tapsN:taps.length};});
const shot=async name=>{await p.waitForTimeout(1200);await p.screenshot({path:out+tag+'_'+name+'.png',timeout:120000});return small();};
const R={};
const tapNav=async txt=>{const q=await p.evaluate(t=>{const e=[...document.querySelectorAll('button,a')].find(x=>x.offsetParent&&x.textContent.trim()===t&&x.getBoundingClientRect().top>innerHeight-90);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};},txt);if(q){if(w<600)await p.touchscreen.tap(q.x,q.y);else await p.mouse.click(q.x,q.y);}return !!q;};
if(process.env.SCREENS==='scroll'){
 const U={};
 for(const t of ['Play','Career','Store','Player','Practice']){R['nav_'+t]=await tapNav(t);await p.waitForTimeout(1500);
  const sc=await p.evaluate(()=>{const c=[...document.querySelectorAll('body *')].filter(e=>{const cs=getComputedStyle(e);return (cs.overflowY==='auto'||cs.overflowY==='scroll')&&e.scrollHeight>e.clientHeight+50&&e.getClientRects().length&&cs.display!=='none';}).sort((a,b)=>b.clientHeight-a.clientHeight)[0];if(!c){const H=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);return H>innerHeight+50?{win:true,sh:H,ch:innerHeight}:null;}c.dataset.r22s=1;return {sh:c.scrollHeight,ch:c.clientHeight};});
  const steps=sc?Math.ceil((sc.sh-sc.ch)/(sc.ch*0.7))+1:1;const agg={small:{},taps:{}};
  for(let i=0;i<steps;i++){if(sc)await p.evaluate(y=>{const c=document.querySelector('[data-r22s]');if(c)c.scrollTop=y;else window.scrollTo(0,y);},Math.round(i*sc.ch*0.7));await p.waitForTimeout(500);
   if(i===0||i===steps-1)await p.screenshot({path:out+tag+'_'+t.toLowerCase()+'_'+i+'.png',timeout:120000});
   const m=await small();m.small.forEach(k=>agg.small[k]=1);m.tapsUnder44.forEach(k=>agg.taps[k]=1);}
  await p.evaluate(()=>{const c=document.querySelector('[data-r22s]');if(c){c.scrollTop=0;delete c.dataset.r22s;}window.scrollTo(0,0);});
  U[t]={steps,small:Object.keys(agg.small).filter(k=>!/^Menu@0/.test(k)),taps:Object.keys(agg.taps)};}
 console.log(tag,JSON.stringify(U),pe.slice(0,3).join(' | '));await b.close();return;}
if(process.env.SCREENS==='career'){
 for(const t of ['Career','Practice']){R['nav_'+t+'_found']=await tapNav(t);await p.waitForTimeout(1500);R['tab_'+t]=await shot('tab_'+t.toLowerCase());
  await p.evaluate(()=>{const sc=[...document.querySelectorAll('#hub *')].find(e=>{const cs=getComputedStyle(e);return (cs.overflowY==='auto'||cs.overflowY==='scroll')&&e.scrollHeight>e.clientHeight+50&&e.offsetParent;});if(sc)sc.scrollTop=sc.clientHeight*0.8;else window.scrollTo(0,innerHeight*0.8);});
  R['tab_'+t+'_2']=await shot('tab_'+t.toLowerCase()+'_2');}
 console.log(tag,JSON.stringify(R),pe.slice(0,3).join(' | '));await b.close();return;}
await p.evaluate(()=>{try{hubTab('play');}catch(e){}});await p.waitForTimeout(800);await p.evaluate(()=>{const pn=document.querySelector('#hub .panel');if(pn)pn.scrollTop=420;});R.play_scrolled=await shot('play_scrolled');
for(const t of ['play','kit','player']){await p.evaluate(t=>{try{hubTab(t);}catch(e){}},t);R['hub_'+t]=await shot('hub_'+t);}
await p.evaluate(()=>{const b=document.getElementById('btnHubMenu');if(b)b.click();});R.menu=await shot('menu');
await p.evaluate(()=>{const pp=document.getElementById('hubPop');if(pp)pp.hidden=true;try{showShop();}catch(e){}});R.store=await shot('store');
console.log(tag,JSON.stringify(R),pe.slice(0,3).join(' | '));await b.close();})();
