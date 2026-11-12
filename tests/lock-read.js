// Green Option A: the engine's lock read (TOPS_LOCK() / 'tops-lock') for Experience's white lock pip, "Aim locked high-left" and the miss line.
// node tests/lock-read.js <fixDir>
//  1. Throw unchanged: the diff adds only S.lockAt (a copy of the lock taken before landFrom) and a try-wrapped lockRead() after the landing
//     is scored. lockRead must draw no random numbers and change no game state: called directly on a live match, Math.random calls = 0 and
//     S (aim, lock, sway, visit, scores, dart, player, busy) is byte-identical before and after. (Comparing landings across builds can't
//     prove it: the sway at the press depends on how many frames have run.) Plus regress.js.
//  2. The read: one event per throw; aimBed/lockBed/landBed match scoreAt of aim/lock/land; lockOutside and missed follow the beds;
//     dir agrees with dx/dy; perfect matches the throw's own verdict; mine true for the player.
//  3. Set cases (lock forced after the press, before release): aim T20, lock 6 mm left and 9 mm up -> 'high-left', lock in S20 so outside;
//     lock 1 mm right inside T20 -> not outside; aim bull, lock 20 mm low -> 'low', outside.
const {chromium,devices}=require('playwright');const path=require('path');
const run=async(b,dir)=>{const ctx=await b.newContext({viewport:{width:390,height:844},userAgent:devices['iPhone 13'].userAgent,hasTouch:true,isMobile:true});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.goto('file://'+path.resolve(dir)+'/index.html');
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
 await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};showHub();
  beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501,practice:true});});
 for(let i=0;i<300;i++){const ok=await p.evaluate(()=>{const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();if(S&&S.bull){S.bull=null;startTurn();}return !!(S&&S.cur===0&&!S.busy&&!S.p[0].ai&&S.view!==1);});if(ok)break;await p.waitForTimeout(200);}
 return await p.evaluate(async()=>{const ev=[];document.addEventListener('tops-lock',e=>ev.push(e.detail));
  // seeded random: both builds draw the same numbers
  const snap=()=>JSON.stringify({aim:S.aim,lock:S.lock,sway:S.sway,visit:S.visit,sc:S.p.map(p=>p.score),dart:S.dart,cur:S.cur,busy:S.busy,lockAt:S.lockAt||null});let rn=0;const mr=Math.random;Math.random=function(){rn++;return mr.apply(this,arguments);};const s0=snap();lockRead({x:-6,y:-112},1.5,-100.2,scoreAt(1.5,-100.2),true);const pure={random:rn,same:snap()===s0,event:ev.length===1};Math.random=mr;ev.length=0;
  window.__lands=[];{const L0=land;land=function(x,y){__lands.push([+x.toFixed(6),+y.toFixed(6)]);return L0.apply(this,arguments);};}let sd=12345;const rnd=()=>{sd=(sd*1103515245+12345)&0x7fffffff;return sd/0x7fffffff;};Math.random=rnd;
  const wait=ms=>new Promise(r=>setTimeout(r,ms));const aims=[[0,-103],[0,-166],[-31.8,-97.9],[0,0]];const out=[];
  const throwOne=async(aim,holdFrac,force)=>{for(let k=0;k<200&&(S.busy||S.cur!==0||S.p[0].ai);k++)await wait(50);S.cur=0;S.dart=1;S.visit=[];setAim(aim[0],aim[1]);
   const pn=performance.now;let fake=pn.call(performance);performance.now=()=>fake;/* frozen clock: the pull length is exactly what we set */
   startPull('key');if(force&&S.lock){S.lock.x=aim[0]+force[0];S.lock.y=aim[1]+force[1];}fake+=S.pullMs*holdFrac;release({timeStamp:fake},'key');performance.now=pn;
   const n0=__lands.length;const lr=window.TOPS_LOCK?TOPS_LOCK():null;const tm=S.lastTiming,pf=S.perfect;for(let k=0;k<60&&__lands.length===n0;k++)await wait(50);
   out.push({timing:tm,perfect:pf,last:__lands[n0]||null,lock:lr});S.p[0].score=501;S.p[1].score=501;await wait(300);};
  save.inputOffsetMs=0;const SW=typeof SWEET==='number'?SWEET:1;for(let i=0;i<60;i++)await throwOne(aims[i%4],SW*[1,1,.999,1.001,.9,1.1][i%6]);/* half at the sweet spot (perfect), the rest early/late */
  const set=[];for(const [aim,f] of [[[0,-103],[-6,-9]],[[0,-103],[1,0]],[[0,0],[0,20]]]){await throwOne(aim,typeof SWEET==='number'?SWEET:1,f);set.push(TOPS_LOCK?TOPS_LOCK():null);}
  return {pure,out,ev,set,sc:out.map(o=>o.lock&&[scoreAt(o.lock.aim.x,o.lock.aim.y).label,scoreAt(o.lock.lock.x,o.lock.lock.y).label,scoreAt(o.lock.land.x,o.lock.land.y).label])};}).then(r=>{r.pe=pe;return r;}).finally(()=>ctx.close());};
(async()=>{const [B]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
 const rb=await run(b,B);await b.close();const fails=[];
 // 1. lockRead is pure
 if(!(rb.pure&&rb.pure.random===0&&rb.pure.same))fails.push('lockRead not pure: '+JSON.stringify(rb.pure));
 // 2. the read on the fix
 const dirOk=l=>{if(!l.dist||l.dist<.05)return true;const ang=Math.atan2(-l.dy,l.dx)*180/Math.PI;const want=['right','high-right','high','high-left','left','low-left','low','low-right'][Math.round(((ang%360)+360)%360/45)%8];return want===l.dir;};
 let readOk=0;rb.out.forEach((o,i)=>{const l=o.lock,s=rb.sc[i];if(!l){fails.push('throw '+i+': no read');return;}const ok=s[0]===l.aimBed&&s[1]===l.lockBed&&s[2]===l.landBed&&l.lockOutside===(l.aimBed!==l.lockBed)&&l.missed===(l.landBed!==l.aimBed)&&dirOk(l)&&l.perfect===o.perfect&&l.mine===true;if(ok)readOk++;else if(fails.length<8)fails.push('throw '+i+' read wrong: '+JSON.stringify(l));});
 if(rb.ev.length!==63)fails.push('events '+rb.ev.length+' (want 63, one per throw)');
 const [s1,s2,s3]=rb.set;
 if(!(s1&&s1.dir==='high-left'&&s1.aimBed==='T20'&&s1.lockOutside))fails.push('set 1 (T20, lock 6 left 9 up): '+JSON.stringify(s1));
 if(!(s2&&s2.aimBed==='T20'&&s2.lockBed==='T20'&&!s2.lockOutside&&s2.dir==='right'))fails.push('set 2 (T20, lock 1 right): '+JSON.stringify(s2));
 if(!(s3&&s3.dir==='low'&&s3.aimBed==='BULL'&&s3.lockOutside))fails.push('set 3 (bull, lock 20 low): '+JSON.stringify(s3));
 const perfects=rb.out.filter(o=>o.perfect).length,outside=rb.out.filter(o=>o.lock&&o.lock.lockOutside).length,miss=rb.out.filter(o=>o.lock&&o.lock.missed).length;
 if(rb.pe.length)fails.push('page errors '+JSON.stringify(rb.pe));
 console.log(JSON.stringify({pure:rb.pure,readOk:readOk+'/'+rb.out.length,events:rb.ev.length,perfects,lockOutside:outside,missed:miss,set:[s1,s2,s3].map(s=>s&&{dir:s.dir,aimBed:s.aimBed,lockBed:s.lockBed,lockOutside:s.lockOutside,dist:s.dist}),sample:rb.out.slice(0,2).map(o=>o.lock),fails}));
 const ok=readOk===rb.out.length&&rb.out.length===63&&perfects>0&&!fails.length;console.log(ok?'LOCK-READ PASS':'LOCK-READ FAIL');process.exit(ok?0:1);})();
