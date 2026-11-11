// Does a real tap on the bottom-bar Store tab show a broken "Your dart" image? node r22store.js <dir>
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2];const out=require('path').resolve(__dirname,'../shots')+'/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');try{await p.addStyleTag({content:require('fs').readFileSync('/home/claude/fonts/fonts_local.css','utf8')});}catch(e){}
await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=12;$('login').hidden=true;newCareer();save.tcIntro=Date.now();showHub();});await p.waitForTimeout(2500);
for(let i=0;i<3;i++){const L=await p.$('#tcWelLater');if(!L)break;await L.click().catch(()=>{});await p.waitForTimeout(800);}
const tap=async txt=>{const q=await p.evaluate(t=>{const e=[...document.querySelectorAll('button,a,[role=tab]')].find(x=>x.offsetParent&&x.textContent.trim()===t&&x.getBoundingClientRect().top>700);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,cls:e.className,dt:e.dataset.t||e.dataset.tab||''};},txt);if(q)await p.touchscreen.tap(q.x,q.y);return q;};
const r={};r.player=await tap('Player');await p.waitForTimeout(1500);r.store=await tap('Store');await p.waitForTimeout(2500);
r.imgs=await p.evaluate(()=>[...document.querySelectorAll('img')].filter(i=>i.offsetParent&&i.getBoundingClientRect().top<844&&i.getBoundingClientRect().bottom>0).map(i=>({alt:i.alt,ok:i.complete&&i.naturalWidth>0,src:(i.src||'').slice(0,40)})).filter(i=>!i.ok));
r.title=await p.evaluate(()=>{const v=[...document.querySelectorAll('h1,h2,.hh,.c3-h')].find(e=>e.offsetParent&&e.getBoundingClientRect().top<300);return v&&v.textContent.trim().slice(0,30);});
await p.screenshot({path:out+'r22_store_tap.png',timeout:120000});
console.log('r22store',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();})();
