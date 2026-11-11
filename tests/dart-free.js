// #15b: thrown darts are freed safely. node tests/dart-free.js [dir]  -> PASS / FAIL
// 1. Plays visits of a real match (player via land(), AI via its own fly()+land()) and checks the board is empty at the start
//    of each of the player's visits (clearDarts freed the last visit's darts, hit rings and puffs).
// 2. Nothing kept is ever disposed: hooks dispose() on every texture, geometry and material and fails if one in KEEP
//    (shared flight textures, cached barrel/point geometry, glow sprite) is freed while other darts still use it.
// 3. Quit while a dart is in the air (ChatGPT 08:37 P0): the flying dart is freed, never sticks into the hub's board,
//    and the next match starts clean (score 501, no stray dart landing in it).
// 4. No page errors, no teardown warnings, no WebGL error.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
const pe=[],warn=[];p.on('pageerror',e=>pe.push(e.message));p.on('console',m=>{if(m.type()==='warning'&&/teardown|evict/.test(m.text()))warn.push(m.text());});
await p.addInitScript(()=>{const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.06),...a);});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
if(!(await p.evaluate(()=>!!V._qa.darts))){console.log('dart-free FAIL',JSON.stringify({why:'build has no V._qa.darts (pre-#15b)'}));await b.close();process.exit(1);}
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';$('login').hidden=true;newCareer();save.tcIntro=Date.now();save.tcWelcomed=Date.now();document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};
 window.__kd=[];for(const [C,n] of [[THREE.Texture,'texture'],[THREE.BufferGeometry,'geometry'],[THREE.Material,'material']]){const o=C.prototype.dispose;C.prototype.dispose=function(){if(V._qa.kept(this))window.__kd.push(n+':'+(this.type||this.constructor.name));return o.apply(this,arguments);};}
 beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:'deano',oppName:'Deano',oppAvg:60,legs:5,start:501});});
const step=()=>p.evaluate(()=>{try{if(!S||S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
 if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const first=S.visit.length===0,d=V._qa.darts();const t=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(t.x+gauss()*14,t.y+gauss()*14);return first?{visitStart:d}:'aim';}
 return 'wait';}catch(e){return 'ERR '+e.message;}});
// 1 + 2: eight of the player's visits
const starts=[];let aiFlights=0;const t0=Date.now();
while(starts.length<8&&Date.now()-t0<180000){const st=await step();if(st&&st.visitStart)starts.push(st.visitStart);if(st==='done'||String(st).startsWith('ERR'))break;
 if((await p.evaluate(()=>V._qa.darts().flying))>0)aiFlights++;await p.waitForTimeout(40);}
const dirty=starts.slice(1).filter(d=>d.stuck||d.marks);
// 3: quit while the AI's dart is in the air
let caught=false;for(let i=0;i<4000&&!caught;i++){caught=await p.evaluate(()=>{try{if(S&&!S.done&&S.cur===0&&!S.busy&&S.visit.length<3){const t=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(t.x,t.y);}}catch(e){}return V._qa.darts().flying>0;});if(!caught)await p.waitForTimeout(10);}
const before=await p.evaluate(()=>V._qa.darts());
await p.evaluate(()=>{const q=$('btnQuit');q.click();q.click();});
await p.waitForTimeout(1500);
const after=await p.evaluate(()=>({d:V._qa.darts(),S:typeof S==='undefined'?'undef':(S===null?null:'live'),hub:!$('hub').hidden}));
// the next match starts clean
await p.evaluate(()=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:'deano',oppName:'Deano',oppAvg:60,legs:3,start:501});});
let next=null;for(let i=0;i<600&&!next;i++){next=await p.evaluate(()=>{try{if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return null;}if(S.cur===0&&!S.busy&&!S.p[0].ai)return {score:S.p[0].score,visit:S.visit.length,d:V._qa.darts()};return null;}catch(e){return null;}});if(!next)await p.waitForTimeout(50);}
const glErr=await p.evaluate(()=>V._qa.renderer.getContext().getError());const kd=await p.evaluate(()=>window.__kd.slice(0,8));
const fails=[];if(starts.length<5)fails.push('only '+starts.length+' visits played');if(!aiFlights)fails.push('never saw an AI dart in flight');if(dirty.length)fails.push('board not empty at a visit start: '+JSON.stringify(dirty[0]));
if(kd.length)fails.push('kept resources disposed: '+kd.join(','));if(!caught)fails.push('could not catch a dart in flight to quit on');
if(after.d.flying||after.d.stuck)fails.push('after quit-in-flight: '+JSON.stringify(after.d));if(!next||next.score!==501||next.visit||next.d.stuck)fails.push('next match not clean: '+JSON.stringify(next));
if(glErr)fails.push('WebGL error '+glErr);if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));if(warn.length)fails.push('warnings: '+warn.slice(0,2).join(' | '));
console.log('dart-free',fails.length?'FAIL':'PASS',JSON.stringify({visits:starts.length,visitStarts:starts.slice(0,4),aiFlightFrames:aiFlights,quitInFlight:{before,after},next,glErr,fails}));await b.close();process.exit(fails.length?1:0);})();
