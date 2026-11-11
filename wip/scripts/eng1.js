// ENG-1 checks: node eng1.js <before-dir> <after-dir> [w=390] [h=844]
// 1 the hub ☰ button's accessible name is "Menu" (aria-label) on <after>; 2 the hub looks the same: viewport screenshot with the
// 3D canvas hidden (it animates), compared pixel by pixel in the browser, plus the button's box; 3 the button still opens/closes the menu.
const {chromium}=require('playwright');(async()=>{const [A,B]=[process.argv[2],process.argv[3]],W=+(process.argv[4]||390),H=+(process.argv[5]||844);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const shot=async dir=>{const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());console.error('@','await p.goto(',Date.now()%100000);await p.goto('file://'+dir+'/index.html');
 console.error('@','await p.waitForFun',Date.now()%100000);await p.waitForFunction(()=>typeof S!=='undefined'&&typeof showHub==='function',null,{timeout:180000});
 await p.evaluate(()=>{try{V._qa.renderer.render=()=>{};}catch(e){}/* the 3D view is hidden for the compare; software GL makes every step take seconds */});
 await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();});
 console.error('@','await p.waitForTim',Date.now()%100000);await p.waitForTimeout(2500);await p.evaluate(()=>{document.querySelectorAll('canvas').forEach(c=>c.style.visibility='hidden');document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());});
 await p.addStyleTag({content:'*,*:before,*:after{animation:none!important;transition:none!important;caret-color:transparent!important}'});await p.waitForTimeout(400);
 console.error('@','const cdp=',Date.now()%100000);const cdp=await ctx.newCDPSession(p);const png=(await cdp.send('Page.captureScreenshot',{format:'png'})).data;/* page.screenshot waits on web fonts, which are blocked here */
 console.error('@','const box=',Date.now()%100000);const box=await p.evaluate(()=>{const r=document.getElementById('btnHubMenu').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};});/* Playwright locators wait on the blocked web fonts too */
 console.error('@','const name=',Date.now()%100000);const name=await p.evaluate(()=>{const e=document.getElementById('btnHubMenu');return {aria:e.getAttribute('aria-label'),text:e.textContent};});
 console.error('@','const ax=',Date.now()%100000);const ax=await cdp.send('Accessibility.getFullAXTree');const byRole=ax.nodes.filter(n=>!n.ignored&&n.role&&n.role.value==='button'&&n.name&&n.name.value==='Menu').map(n=>n.backendDOMNodeId);const hubId=(await cdp.send('DOM.describeNode',{objectId:(await cdp.send('Runtime.evaluate',{expression:'document.getElementById("btnHubMenu")'})).result.objectId})).node.backendNodeId;const nameSrc=ax.nodes.filter(n=>n.backendDOMNodeId===hubId).map(n=>n.name&&n.name.sources&&n.name.sources.filter(x=>x.value).map(x=>x.attribute||x.type).join('/'))[0];
 console.error('@','await p.mouse.clic',Date.now()%100000);await p.mouse.click(box.x+box.w/2,box.y+box.h/2);await p.waitForTimeout(200);const open=await p.evaluate(()=>!$('hubPop').hidden&&$('btnHubMenu').getAttribute('aria-expanded'));await p.mouse.click(box.x+box.w/2,box.y+box.h/2);await p.waitForTimeout(200);const closed=await p.evaluate(()=>$('hubPop').hidden&&$('btnHubMenu').getAttribute('aria-expanded'));
 console.error('@','await ctx.close();',Date.now()%100000);await ctx.close();return {png,box,name,byRole:byRole.includes(hubId)?['btnHubMenu']:[],nameSrc,open,closed,pe};};
const a=await shot(A),z=await shot(B);
const ctx=await b.newContext();const p=await ctx.newPage();
const diff=await p.evaluate(async([x,y])=>{const ld=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s;});const [i1,i2]=await Promise.all([ld(x),ld(y)]);
 if(i1.width!==i2.width||i1.height!==i2.height)return {size:[i1.width,i1.height,i2.width,i2.height]};const c=document.createElement('canvas');c.width=i1.width;c.height=i1.height;const g=c.getContext('2d');
 g.drawImage(i1,0,0);const d1=g.getImageData(0,0,c.width,c.height).data;g.clearRect(0,0,c.width,c.height);g.drawImage(i2,0,0);const d2=g.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d1.length;i+=4)if(d1[i]!==d2[i]||d1[i+1]!==d2[i+1]||d1[i+2]!==d2[i+2])n++;return {px:n,of:d1.length/4};},[a.png,z.png]);
require('fs').writeFileSync(process.env.OUT||'/tmp/eng1_after.png',Buffer.from(z.png,'base64'));
const fails=[];if(z.name.aria!=='Menu')fails.push('aria-label missing on after');if(!z.byRole.includes('btnHubMenu'))fails.push('getByRole(button, Menu) does not find #btnHubMenu');
if(diff.px!==0)fails.push('hub pixels differ: '+JSON.stringify(diff));if(JSON.stringify(a.box)!==JSON.stringify(z.box))fails.push('button box moved '+JSON.stringify([a.box,z.box]));
if(z.open!=='true'||z.closed!=='false')fails.push('menu toggle broken '+JSON.stringify([z.open,z.closed]));if(a.pe.length||z.pe.length)fails.push('page errors '+JSON.stringify([a.pe,z.pe]));
console.log('eng1',W+'x'+H,fails.length?'FAIL':'PASS',JSON.stringify({before:{aria:a.name.aria,byRole:a.byRole,nameSrc:a.nameSrc},after:{aria:z.name.aria,byRole:z.byRole,nameSrc:z.nameSrc,open:z.open,closed:z.closed},box:z.box,diff,fails}));await b.close();process.exit(fails.length?1:0);})();
