// #14 regression: on a phone, a vertical swipe that starts on a card in the Collection (binder) must scroll the sheet.
// Drives raw touch events through Chrome DevTools, which honour CSS touch-action like a real finger. Usage: node scroll14.js <dir>
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2]||process.cwd();
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});await ctx.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
const p=await ctx.newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof save!=='undefined',null,{timeout:180000});await p.waitForTimeout(2000);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';$('login').hidden=true;try{newCareer();}catch(e){}persist();TC_API.binder();});await p.waitForTimeout(2500);
const info=await p.evaluate(()=>{const g=document.getElementById('tcGrid');const cards=g?[...g.querySelectorAll('.tc')]:[];let sc=g;while(sc&&sc!==document.body){const cs=getComputedStyle(sc);if(/(auto|scroll)/.test(cs.overflowY)&&sc.scrollHeight>sc.clientHeight)break;sc=sc.parentElement;}
 window.__sc=sc;const c=cards[2]||cards[0];const r=c&&c.getBoundingClientRect();return {cards:cards.length,touchAction:c&&getComputedStyle(c).touchAction,scroller:sc&&(sc.id||sc.className),scrollable:sc?sc.scrollHeight-sc.clientHeight:0,x:r&&Math.round(r.left+r.width/2),y:r&&Math.round(r.top+r.height/2),top0:sc?sc.scrollTop:0};});
const cdp=await ctx.newCDPSession(p);
// a finger: touch down on a card, drag up 300 px in 10 steps, lift (raw touch events honour touch-action like a real phone)
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:info.x,y:info.y}]});for(let i=1;i<=10;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:info.x,y:info.y-i*30}]});await p.waitForTimeout(30);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
await p.waitForTimeout(800);const top1=await p.evaluate(()=>window.__sc?window.__sc.scrollTop:0);
const out=Object.assign(info,{top1,scrolled:top1-info.top0});console.log(JSON.stringify(out),pe.length?'pageErrors '+pe.slice(0,2).join(' | '):'');
const ok=info.cards>0&&info.scrollable>50&&out.scrolled>100&&!pe.length;console.log(ok?'SCROLL14 PASS':'SCROLL14 FAIL');await b.close();process.exit(ok?0:1);})();
