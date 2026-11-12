// #20 test switch 'pubalt' (Overseer 07:18): the pub (tier 0) uses the code-built room instead of the baked pub2.glb, so Hayden can A/B the
// venue tonight with nothing else changed. node tests/pubalt.js <dir>   (390x844 iPhone profile, rebrand on, real taps on the Menu row)
//  1. switch off: a tier-0 match draws the baked pub (the venue holds the kept pub2 scene).
//  2. tap 'Test: plain pub room (next match)' in the rebrand Menu sheet: it reads on and is stored; the next tier-0 match draws the code-built
//     pub (no baked scene in the venue, the code room's walls are there), the TEST tag says 'plain pub'.
//  3. tap it off: the next tier-0 match is the baked pub again. Tier 1 (club) is baked with the switch on (pub only).
const {chromium,devices}=require('playwright');const path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]||path.join(__dirname,'..'));const fails=[];const out=[];
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{try{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem('tops_rebrand','1');localStorage.removeItem('tops_q20_app');}}catch(e){}});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&window.TOPS_R&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;if(!career())newCareer();save.tcIntro=1;save.tcWelcomed=1;try{persist();}catch(e){}document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();});
for(let i=0;i<40;i++){const busy=await p.evaluate(()=>{try{const r=TOPS_RIGS();return !!((r.wait&&r.wait.length)||r.loading);}catch(e){return false;}});if(!busy)break;await p.waitForTimeout(250);}await p.waitForTimeout(1500);
const match=async(tier,tag)=>{await p.evaluate(t=>{beginMatch({mode:'career',tier:t,p0:'Hayden',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501,practice:true});},tier);
 let r=null;for(let i=0;i<60;i++){await p.waitForTimeout(250);r=await p.evaluate(()=>{const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();const v=V._qa.venue;let baked=false,meshes=0;v.traverse(o=>{if(o.userData&&o.userData.keep)baked=true;if(o.isMesh)meshes++;});
   const tagEl=document.getElementById('q20tag');return {tier:document.body.dataset.tier,baked,meshes,glb:V._qa.rigInfo?null:null,tag:tagEl?tagEl.textContent:null,switches:window.TOPS_Q20||''};});if(r.baked||i>=24)break;}
 await p.evaluate(()=>{try{S.done=true;}catch(e){}try{V.teardownMatch&&V.teardownMatch();}catch(e){}try{showHub();}catch(e){}});await p.waitForTimeout(1200);const o=Object.assign({tag},r);out.push(o);return o;};
const tapRow=async()=>{await p.locator('#rbMenu').tap();await p.waitForTimeout(250);await p.locator('#rbMenuSheet [data-q20="pubalt"]').tap();await p.waitForTimeout(150);const t=await p.evaluate(()=>({label:(document.querySelector('#rbMenuSheet [data-q20="pubalt"]')||{}).textContent,stored:localStorage.getItem('tops_q20_app')}));await p.locator('#rbMenu').tap().catch(()=>{});await p.waitForTimeout(200);return t;};
const a=await match(0,'pub, switch off');if(!a.baked)fails.push('pub not baked with the switch off: '+JSON.stringify(a));
const on=await tapRow();out.push({tag:'row tapped on',on});if(!/: on$/.test(on.label||'')||on.stored!=='pubalt')fails.push('row did not turn on: '+JSON.stringify(on));
const b2=await match(0,'pub, switch on');if(b2.baked)fails.push('pub still baked with pubalt on');if(!(b2.meshes>20))fails.push('code-built pub missing: '+b2.meshes+' meshes');
const c1=await match(1,'club, switch on');if(!c1.baked)fails.push('club not baked with pubalt on (pub only)');
const off=await tapRow();out.push({tag:'row tapped off',off});if(!/: off$/.test(off.label||''))fails.push('row did not turn off');
const d=await match(0,'pub, switch off again');if(!d.baked)fails.push('pub not baked after the switch went off');
if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));
out.forEach(o=>console.log(JSON.stringify(o)));console.log(JSON.stringify({fails}));console.log(fails.length?'PUBALT FAIL':'PUBALT PASS');await b.close();process.exit(fails.length?1:0);})();
