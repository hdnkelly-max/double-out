// #20 A/B (Overseer 07:58): hub Menu row "Test: no game audio (next match)" = the game's AudioContext suspended for the whole match.
// node tests/q20-mute.js <dir>   (390 iPhone profile, rebrand on, real taps)
//  1. row on (real tap in the rebrand Menu sheet) -> stored as 'mute'; Walk on -> the context is suspended in the match; a real touch on the
//     pull pad (which resumes audio on live) leaves it suspended; the TEST tag says 'no audio'; TOPS_Q20 carries 'mute' (logged per row).
//  2. quit to the hub -> the context runs again (hub sounds).
//  3. ChatGPT P1: sounds started while a muted match's context is suspended must not play when the hub resumes it. In each of two muted
//     matches the game's own sound calls run (a dart hit, a thump, the 'rock' walk-on song: ~7 s of scheduled notes); 1 s after the hub resumes
//     the context none of those nodes may still be live.
//  4. row off -> next match: the pad touch leaves the context running, and the same sound calls give live nodes (normal audio is back).
const {chromium,devices}=require('playwright');const path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]||path.join(__dirname,'..'));const fails=[];const out=[];
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{window.__N=[];for(const P of [AudioScheduledSourceNode.prototype,AudioBufferSourceNode.prototype]){if(!Object.prototype.hasOwnProperty.call(P,'start'))continue;const st=P.start;P.start=function(){const e={t:performance.now(),ended:null,tag:window.__TAG||''};__N.push(e);this.addEventListener('ended',()=>{e.ended=performance.now();});return st.apply(this,arguments);};}try{if(!sessionStorage.getItem('__i')){sessionStorage.setItem('__i','1');localStorage.setItem('tops_rebrand','1');localStorage.removeItem('tops_q20_app');}}catch(e){}});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&window.TOPS_R&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;if(!career())newCareer();save.walkon='off';save.tcIntro=1;save.tcWelcomed=1;try{persist();}catch(e){}document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();});
for(let i=0;i<40;i++){const busy=await p.evaluate(()=>{try{const r=TOPS_RIGS();return !!((r.wait&&r.wait.length)||r.loading);}catch(e){return false;}});if(!busy)break;await p.waitForTimeout(250);}await p.waitForTimeout(1500);
const row=async()=>{await p.locator('#rbMenu').tap();await p.waitForTimeout(250);await p.locator('#rbMenuSheet [data-q20="mute"]').tap();await p.waitForTimeout(150);const r=await p.evaluate(()=>({label:(document.querySelector('#rbMenuSheet [data-q20="mute"]')||{}).textContent,stored:localStorage.getItem('tops_q20_app')}));await p.locator('#rbMenu').tap().catch(()=>{});await p.waitForTimeout(200);return r;};
const toAim=async()=>{await p.locator('#rbGo').tap();for(let i=0;i<200;i++){const st=await p.evaluate(()=>{const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();if(S&&S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}return (S&&S.cur===0&&!S.busy&&!S.p[0].ai&&S.view!==1)?'aim':'wait';});if(st==='aim')return true;await p.waitForTimeout(250);}return false;};
const padTouch=async()=>{const bx=await p.locator('#pullPad').boundingBox();if(!bx)return false;await p.touchscreen.tap(bx.x+bx.width/2,bx.y+bx.height/2);await p.waitForTimeout(600);return true;};
const st=()=>p.evaluate(()=>({ctx:AU.ctx?AU.ctx.state:null,q20:window.TOPS_Q20||'',tag:(document.getElementById('q20tag')||{}).textContent||null}));
const on=await row();out.push({tag:'row on',on});if(!/: on$/.test(on.label||'')||on.stored!=='mute')fails.push('row did not turn on: '+JSON.stringify(on));
if(!(await toAim()))fails.push('match 1 never reached aim');
const a=await st();out.push({tag:'match, muted, at aim',a});if(a.ctx!=='suspended')fails.push('audio not suspended in the muted match: '+a.ctx);if(!/no audio/.test(a.tag||''))fails.push('TEST tag: '+a.tag);if(!/mute/.test(a.q20))fails.push('q20 not logged: '+a.q20);
await padTouch();const a2=await st();out.push({tag:'after a real pad touch',a2});if(a2.ctx!=='suspended')fails.push('a pad touch resumed audio in the muted match: '+a2.ctx);
const sounds=tag=>p.evaluate(tag=>{window.__TAG=tag;try{sfxDartHit('hit');thump(110,.09,.6,0);TOPS_walk.playWalk('rock');}catch(e){return String(e);}window.__TAG='';return __N.filter(e=>e.tag===tag).length;},tag);
const toHub=async()=>{await p.evaluate(()=>{try{TOPS_walk.stopWalk();}catch(e){}try{S.done=true;}catch(e){}try{showHub();}catch(e){}});await p.waitForTimeout(1000);};
const stale=tag=>p.evaluate(tag=>__N.filter(e=>e.tag===tag&&e.ended==null).length,tag);
out.push({tag:'muted match 1 sounds started',n:await sounds('m1')});
await toHub();const h=await st();out.push({tag:'hub',h});if(h.ctx!=='running')fails.push('audio not back in the hub: '+h.ctx);
const s1=await stale('m1');out.push({tag:'muted match 1 nodes still live 1 s after the hub resumed',s1});if(s1>0)fails.push(s1+' sounds from muted match 1 still playing in the hub (backlog)');
if(!(await toAim()))fails.push('muted match 2 never reached aim');const a3=await st();if(a3.ctx!=='suspended')fails.push('second muted match not suspended: '+a3.ctx);out.push({tag:'muted match 2 sounds started',n:await sounds('m2')});await padTouch();
await toHub();const s2=await stale('m2');out.push({tag:'muted match 2 nodes still live 1 s after the hub',s2});if(s2>0)fails.push(s2+' sounds from muted match 2 still playing in the hub (backlog)');
await p.waitForTimeout(1500);const off=await row();out.push({tag:'row off',off});if(!/: off$/.test(off.label||''))fails.push('row did not turn off');
if(!(await toAim()))fails.push('match 2 never reached aim');await padTouch();const c=await st();out.push({tag:'match, not muted, after a pad touch',c});if(c.ctx!=='running')fails.push('audio not running in the unmuted match: '+c.ctx);
const nn=await sounds('n');await p.waitForTimeout(400);const live=await stale('n');out.push({tag:'normal match: sounds started, live 0.4 s later',nn,live});if(!(live>0))fails.push('normal audio not back: no sound node playing in the unmuted match');
if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));
out.forEach(o=>console.log(JSON.stringify(o)));console.log(JSON.stringify({fails}));console.log(fails.length?'Q20-MUTE FAIL':'Q20-MUTE PASS');await b.close();process.exit(fails.length?1:0);})();
