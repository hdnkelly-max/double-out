// Print selectors + sizes for the elements ChatGPT flagged. node r22probe.js <dir>
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2];
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
await p.goto('file://'+dir+'/index.html');try{await p.addStyleTag({content:require('fs').readFileSync('/home/claude/fonts/fonts_local.css','utf8')});}catch(e){}
await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=12;$('login').hidden=true;newCareer();save.tcIntro=Date.now();showHub();});await p.waitForTimeout(2500);
for(let i=0;i<3;i++){const L=await p.$('#tcWelLater');if(!L)break;await L.click().catch(()=>{});await p.waitForTimeout(800);}
const info=await p.evaluate(()=>{const chain=e=>{const a=[];for(let x=e;x&&x!==document.body&&a.length<4;x=x.parentElement)a.push(x.tagName.toLowerCase()+(x.id?'#'+x.id:'')+(x.className&&typeof x.className==='string'?'.'+x.className.trim().split(/\s+/).join('.'):''));return a.join(' < ');};
 const find=t=>[...document.querySelectorAll('body *')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().toLowerCase().startsWith(t.toLowerCase()))).slice(0,2).map(e=>{const cs=getComputedStyle(e),r=e.getBoundingClientRect();return {t,sel:chain(e),fs:cs.fontSize,h:r.height|0,w:r.width|0,pad:cs.padding};});
 const o={};['Win','Lose','Money match','Local night','Ready to open','3 card picks','Next big unlock','Respec','Edit look','Sound on','Main menu'].forEach(t=>o[t]=find(t));
 const tile=document.getElementById('tcPicksTile');if(tile){const r=tile.getBoundingClientRect();o.tile={h:r.height|0,w:r.width|0,pad:getComputedStyle(tile).padding,kids:[...tile.children].map(c=>c.tagName+'.'+c.className+':'+(c.getBoundingClientRect().height|0))};}
 return o;});
console.log(JSON.stringify(info,null,1));await b.close();})();
