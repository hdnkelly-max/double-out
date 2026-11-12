// EXP-STYLE: today's live screens (2.08) for the Broadcast mockups: screenshot (390x844) + visible text of each page.
// node pages.js <built game dir> <out dir>
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const dir=process.argv[2],out=process.argv[3];
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>typeof showHub==='function'&&typeof V!=='undefined',null,{timeout:120000});await p.waitForTimeout(4000);
await p.evaluate(()=>{save.authSeen=true;$('login').hidden=true;newCareer();save.name='Hayden';save.lessonDone=true;save.tcIntro=Date.now();save.tcWelcomed=1;const c=career();c.tier=1;c.bank=640;c.wins=23;c.losses=11;try{const v=C3.V3();v.lv=14;v.xp=380;}catch(e){}
 try{const t=TC_API.st();['jukebox','airhorn','heckle','bouncer'].forEach(k=>{t.own[k]=1;});}catch(e){}try{persist();}catch(e){}});
const clean=()=>p.evaluate(()=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());});
const grab=async(name,fn)=>{await clean();await p.evaluate(fn);await p.waitForTimeout(2500);await p.evaluate(()=>{document.querySelectorAll('.tc-sheet .tc-welcome').forEach(e=>{const s=e.closest('.tc-sheet');s&&s.remove();});});
 const txt=await p.evaluate(()=>{const els=[...document.querySelectorAll('.screen:not([hidden]),.tc-sheet,.sheet:not([hidden])')];return els.map(e=>'['+(e.id||e.className)+']\n'+e.innerText.replace(/\n{2,}/g,'\n')).join('\n\n').slice(0,4000);});
 fs.writeFileSync(`${out}/${name}.txt`,txt);try{const cdp=await p.context().newCDPSession(p);const {data}=await cdp.send('Page.captureScreenshot',{format:'png',clip:{x:0,y:0,width:390,height:844,scale:1}});fs.writeFileSync(`${out}/${name}.png`,Buffer.from(data,'base64'));}catch(e){console.log('shot fail',name,e.message);}console.log('==',name,txt.length);};
await grab('hub',()=>showHub());
await grab('kit',()=>showHub('kit'));
await grab('cards',()=>{showHub();TC_API.binder();});
await grab('mate',()=>{showTitle();$('btnFriends').click();});
await grab('run',()=>{showTitle();$('btnRun').click();});
await b.close();})();
