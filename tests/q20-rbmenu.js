// ENG-10 (Overseer 06:27): the #20 test switches must be reachable from the rebrand's hub Menu sheet (#rbMenuSheet), which replaced #hubPop.
// node tests/q20-rbmenu.js [dir]  (390x844 iPhone profile, rebrand on, real taps)
//  1. hub -> tap Menu: the sheet keeps 'Edit look' and 'Main menu' and adds 'Test: no walk-on', 'Test: no effects', 'Test: frame split
//     (from next launch)', each >= 44 px tall and on screen, showing the stored state (a pre-set 'nowalk,nofx' reads on/on/off: never cleared).
//  2. tap each one: its label flips, localStorage 'tops_q20_app' follows, the sheet stays open.
//  3. reload: Menu again shows the same states (kept); TOPS_q20has agrees.
//  4. rebrand off: the old #hubPop still has the three toggles.
const {chromium,devices}=require('playwright');const path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]||path.join(__dirname,'..'));const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
 const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.addInitScript(()=>{try{if(!sessionStorage.getItem('__init')){sessionStorage.setItem('__init','1');localStorage.setItem('tops_rebrand','1');localStorage.setItem('tops_q20_app','nowalk,nofx');}}catch(e){}});
 const boot=async()=>{await p.waitForFunction(()=>typeof S!=='undefined'&&typeof showHub==='function'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
  await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;if(!career())newCareer();save.tcIntro=1;save.tcWelcomed=1;try{persist();}catch(e){}document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();});
  /* let character files and the avatar refresh settle: a refresh re-renders the rebrand hub, which closes an open Menu sheet (existing behaviour) */
  for(let i=0;i<40;i++){const busy=await p.evaluate(()=>{try{const r=TOPS_RIGS();return !!((r.wait&&r.wait.length)||r.loading);}catch(e){return false;}});if(!busy)break;await p.waitForTimeout(250);}await p.waitForTimeout(1500);};
 const read=()=>p.evaluate(()=>{const sh=document.getElementById('rbMenuSheet');if(!sh)return null;const rows=[...sh.querySelectorAll('button')].map(x=>{const r=x.getBoundingClientRect();return {t:x.textContent.trim(),h:Math.round(r.height),on:r.top>=0&&r.bottom<=innerHeight&&r.width>0,q:x.getAttribute('data-q20'),pr:x.getAttribute('aria-pressed')};});return {rows,stored:localStorage.getItem('tops_q20_app'),has:['nowalk','nofx','split'].map(k=>TOPS_q20has(k))};});
 const openMenu=async()=>{await p.locator('#rbMenu').tap();await p.waitForTimeout(250);return read();};
 const fails=[];const out={};
 await p.goto('file://'+dir+'/index.html');await boot();
 out.rbOn=await p.evaluate(()=>document.body.classList.contains('rb-on')||!!document.getElementById('rbApp'));
 out.first=await openMenu();
 const lab=(r,k)=>{const x=r&&r.rows.find(y=>y.q===k);return x?x.t:null;};
 if(!out.first)fails.push('Menu sheet did not open');else{
  const t=out.first.rows.map(r=>r.t);if(!t.includes('Edit look')||!t.includes('Main menu'))fails.push('sheet lost its own items: '+JSON.stringify(t));
  const q=out.first.rows.filter(r=>r.q);if(q.length!==3)fails.push('expected 3 test rows, got '+q.length);
  q.forEach(r=>{if(r.h<44)fails.push(r.t+' is '+r.h+' px tall');if(!r.on)fails.push(r.t+' not on screen');});
  if(lab(out.first,'nowalk')!=='Test: no walk-on: on'||lab(out.first,'nofx')!=='Test: no effects: on'||lab(out.first,'split')!=='Test: frame split (from next launch): off')fails.push('initial states wrong (stored nowalk,nofx must read on/on/off): '+JSON.stringify(q.map(r=>r.t)));}
 // tap each: nowalk off, nofx off, split on
 for(const k of ['nowalk','nofx','split']){try{await p.locator('#rbMenuSheet [data-q20="'+k+'"]').tap({timeout:3000});}catch(e){fails.push('no '+k+' row to tap in the Menu sheet');}await p.waitForTimeout(150);}
 if(fails.length){console.log(JSON.stringify({first:out.first&&out.first.rows,fails}));console.log('Q20-RBMENU FAIL');await b.close();process.exit(1);}
 out.after=await read();
 if(!out.after)fails.push('sheet closed after a toggle');else{
  if(lab(out.after,'nowalk')!=='Test: no walk-on: off'||lab(out.after,'nofx')!=='Test: no effects: off'||lab(out.after,'split')!=='Test: frame split (from next launch): on')fails.push('labels after taps: '+JSON.stringify(out.after.rows.map(r=>r.t)));
  if(out.after.stored!=='split')fails.push('stored after taps: '+out.after.stored);}
 // reload: kept
 await p.reload();await boot();out.reload=await openMenu();
 if(!out.reload)fails.push('Menu sheet did not open after reload');else{
  if(lab(out.reload,'nowalk')!=='Test: no walk-on: off'||lab(out.reload,'nofx')!=='Test: no effects: off'||lab(out.reload,'split')!=='Test: frame split (from next launch): on')fails.push('state not kept after reload: '+JSON.stringify(out.reload.rows.map(r=>r.t)));
  if(JSON.stringify(out.reload.has)!=='[false,false,true]')fails.push('TOPS_q20has after reload: '+JSON.stringify(out.reload.has));}
 out.splitOn=await p.evaluate(()=>!!window.TOPS_AJS);
 // close and reopen: no duplicate rows
 await p.locator('#rbMenu').tap();await p.waitForTimeout(150);out.again=await openMenu();if(out.again&&out.again.rows.filter(r=>r.q).length!==3)fails.push('rows duplicated on reopen');
 // rebrand off: the old menu keeps them
 await p.evaluate(()=>{localStorage.setItem('tops_rebrand','0');});await p.reload();await boot();
 out.old=await p.evaluate(async()=>{const m=document.getElementById('btnHubMenu');if(m)m.click();await new Promise(z=>setTimeout(z,200));return ['nowalk','nofx','split'].map(k=>{const x=document.getElementById('q20b_'+k);return x?x.textContent:null;});});
 if(out.old.some(x=>!x))fails.push('rebrand off: #hubPop toggles missing: '+JSON.stringify(out.old));
 if(pe.length)fails.push('page errors: '+pe.slice(0,3).join(' | '));
 console.log(JSON.stringify({rbOn:out.rbOn,first:out.first&&out.first.rows,after:out.after&&out.after.stored,reload:out.reload&&out.reload.rows.filter(r=>r.q).map(r=>r.t),splitOnAfterReload:out.splitOn,old:out.old,fails}));
 console.log(fails.length?'Q20-RBMENU FAIL':'Q20-RBMENU PASS');await b.close();process.exit(fails.length?1:0);})();
