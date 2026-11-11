// #16: where does "Cannot read properties of null (reading 'after')" come from, and is it on live too?
// node after-err.js <dir> [runs=2]. Career match played to the end (scores clamped, real land()), then the result screen's
// "Next fixture" (#btnResAction) or Continue, exactly as a player taps; page errors captured with their stack.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],R=+(process.argv[3]||2);
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
 log.push({run:r,path:path.join('>'),newErrors:pe.length-n0});}
console.log('after-err',JSON.stringify({log,errors:pe.slice(0,4)}));await b.close();})();
