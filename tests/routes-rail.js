// Quick route picker (Hayden 22:59, product rule 9): on a finish the top routes for the score and darts in hand show as one-tap buttons.
// Checks at 390 px with real touch: 121 / 3 darts shows 3 routes; tapping the 2nd re-aims to its first target and never starts a throw;
// the buttons are at least 44 px tall and sit below the board pane; one dart left shows only direct finishes; a dart that follows the
// route moves the plan on, a miss drops it with 'Route updated'; no rail when there's no finish.
// usage: node tests/routes-rail.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;beginMatch({mode:'career',tier:1,p0:'H',oppName:'D',oppAvg:58,legs:3});});
 await p.waitForFunction(()=>S&&S.bull,null,{timeout:20000}).catch(()=>{});await p.waitForTimeout(300);
 const set=(score,left)=>p.evaluate(([score,left])=>{try{$('intro').classList.remove('show');}catch(e){}S.bull=null;S.busy=false;S.cur=0;S.p[0].score=score;S.visitStart=score;S.dart=4-left;S.visit=[];S.plan=null;S.planPicked=false;S.pulling=false;updateUI();renderRoutes();
  const bt=[...document.querySelectorAll('#routes .rt-rail .rt')];const pane=document.querySelector('#routes').getBoundingClientRect();return {n:bt.length,labels:bt.map(x=>x.innerText.replace(/\s+/g,' ').trim()),rects:bt.map(x=>{const r=x.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,r.height];}),hidden:$('routes').hidden,top:pane.top,boardBottom:+getComputedStyle(document.body).getPropertyValue('--lk-bh').replace('px','')+ +getComputedStyle(document.body).getPropertyValue('--lk-hdr').replace('px','')};},[score,left]);
 const f=[];
 let r=await set(121,3);if(r.n!==3)f.push('121/3 shows '+r.n+' routes, want 3');if(r.rects.some(x=>x[2]<44))f.push('route buttons under 44 px tall');if(r.boardBottom&&r.top<r.boardBottom-1)f.push('rail sits on the board ('+r.top+' < '+r.boardBottom+')');
 if(r.n>=2){await p.touchscreen.tap(r.rects[1][0],r.rects[1][1]);await p.waitForTimeout(300);
  const a=await p.evaluate(()=>({plan:S.plan&&S.plan.join(' '),pulling:!!S.pulling,aim:scoreAt(S.aim.x,S.aim.y).label,on:[...document.querySelectorAll('#routes .rt-rail .rt')].findIndex(x=>x.classList.contains('on'))}));
  const want=r.labels[1].replace(/ · /g,' ').replace(/·/g,' ').replace(/\s+/g,' ').trim();
  if(a.plan!==want)f.push('tap picked '+a.plan+', want '+want);if(a.pulling)f.push('tapping a route started a throw');if(a.aim!==want.split(' ')[0])f.push('aim moved to '+a.aim+', want '+want.split(' ')[0]);if(a.on!==1)f.push('tapped route not shown as selected');
  // follow: land on the first target, the plan moves on; then miss, the plan drops and the rail says so
  const fl=await p.evaluate(()=>{const t=targetPoint(S.plan[0]);landCore(t.x,t.y);const after1=S.plan&&S.plan.join(' ');renderRoutes();const t2=targetPoint('S1');landCore(t2.x,t2.y);renderRoutes();return {after1,plan2:S.plan,upd:!!document.querySelector('#routes .rt-upd')};});
  if(!fl.after1||fl.after1.split(' ').length!==want.split(' ').length-1)f.push('after hitting the first target the plan is '+fl.after1);if(fl.plan2)f.push('a miss kept the old plan');}
 r=await set(40,1);if(r.n>1)f.push('40 with one dart shows '+r.n+' routes (want only the direct finish)');
 r=await set(250,3);if(!r.hidden&&r.n)f.push('a rail shows with no finish on');
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: quick route rail: 3 routes on 121, one tap re-aims (no throw), follows the route, drops it on a miss, direct finishes only with one dart');})();
