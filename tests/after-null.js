// ENG-4: "Cannot read properties of null (reading 'after')" after a career match. The reward card's Continue clicks
// #btnResultNext again after the result screen already handed the match on (S = null), so afterResult(null) threw.
// node tests/after-null.js [dir] [matches=2] -> PASS when no page error in 2 career matches played to the end and continued
// exactly as a player taps (result screen, reward card), the hub is reached after each, and the next match starts.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..'),R=+(process.argv[3]||2);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push({m:e.message,stack:String(e.stack||'').split('\n').slice(0,6).map(l=>l.trim().replace(/file:\/\/[^ )]*index\.html/,'L')).join(' | ')}));
await p.addInitScript(()=>{const st=setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.06),...a);});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();});
const click=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
const log=[];
for(let r=1;r<=R;r++){let ok=false;for(let i=0;i<40&&!ok;i++){ok=await click('#c3Go');if(!ok){await p.evaluate(()=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());try{if($('hub').hidden)showHub();}catch(e){}});await p.waitForTimeout(300);}}
 for(let i=0;i<3000;i++){const st=await p.evaluate(()=>{try{if(!S)return 'nos';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
   S.p.forEach(q=>{if(q.score>60&&!S.visit.length)q.score=60;});if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const tp=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(tp.x+gauss()*12,tp.y+gauss()*12);}return 'play';}catch(e){return 'ERR '+e.message;}});
  if(st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(40);}
 const n0=pe.length;const path=[];for(let i=0;i<80;i++){const atHub=await p.evaluate(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!(S&&!S.done));if(atHub)break;
  await p.evaluate(()=>document.querySelectorAll('.tc-sheet,.cd-wrap').forEach(e=>e.remove()));for(const s of ['#btnResAction','#c3rwGo','#btnResultNext']){if(await click(s)){path.push(s.slice(1)+(pe.length>n0?'!ERR':''));break;}}await p.waitForTimeout(400);}
 const hub=await p.evaluate(()=>!$('hub').hidden&&!(S&&!S.done));log.push({run:r,started:ok,path:path.join('>'),hub,newErrors:pe.length-n0});}
const fails=[];if(pe.length)fails.push(pe.length+' page error(s): '+pe.slice(0,2).map(e=>e.m).join(' | '));log.forEach(l=>{if(!l.started)fails.push('match '+l.run+' did not start from the hub');if(!l.hub)fails.push('match '+l.run+': never got back to the hub ('+l.path+')');});
console.log('after-null',fails.length?'FAIL':'PASS',JSON.stringify({fails,log,errors:pe.slice(0,2)}));await b.close();process.exit(fails.length?1:0);})();
