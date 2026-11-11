// #18: no other figure may stand inside the opponent while he throws, on Hayden's exact path and on a normal fixture.
// node tests/fig-clear.js [dir] [tier=0] [width=390] [path=hayden|fixture|exh] [shotDir]
//  hayden : career match 1 (Walk on from the hub) is played out -> result -> Next fixture -> hub -> Exhibition tile ->
//           Accept invite (Raymond van Barneveld), as Hayden did 12:31. The exhibition is forced with ?exh=1 (the game's own switch).
//  fixture: one normal career fixture from the hub.   exh: the exhibition straight from a fresh hub.
// Walk-ons run and are tapped to skip, as a player would. The player throws through land(). While the AI opponent throws,
// every 60 ms: every VISIBLE rigged figure in the scene (found by its Hips bone) is measured against the opponent's hips on the
// floor plane. FAIL if any other visible figure is within 0.45 m. Also reports the player's own 3rd-person figure (me) and the
// camera on the player's own visit (check 2), and saves a screenshot at the 12th opponent sample when shotDir is given.
const {chromium,devices}=require('playwright');
(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');const tier=+(process.argv[3]||0),W=+(process.argv[4]||390),path=process.argv[5]||'hayden',shotDir=process.argv[6]||'';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:W,height:844},screen:{width:W,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html'+(path==='fixture'?'':'?exh=1'));
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(([tier])=>{save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;
 try{sessionStorage.removeItem('tcWalkSeen');}catch(e){}const c=career();c.tier=tier;
 window.__F={walk:0,opp:[],own:[],steps:[]};
 window.__scan=()=>{const T=V._qa.T,sc=V._qa.scene,opp=V._qa.opp();if(!opp||!opp.userData.B||!opp.userData.B.Hips)return null;const oh=opp.userData.B.Hips.getWorldPosition(new T.Vector3());
  const vis=o=>{let q=o;while(q){if(!q.visible)return false;q=q.parent;}return true;};const inside=(o,a)=>{let q=o;while(q){if(q===a)return true;q=q.parent;}return false;};
  const hits=[];sc.traverse(o=>{if(!o.isBone||!/Hips$/.test(o.name)||inside(o,opp))return;let f=o;while(f.parent&&f.parent!==sc&&!(f.userData&&(f.userData.ck||f.userData.B)))f=f.parent;
   const meshVis=(()=>{let v=false;sc.traverse(m=>{if(!v&&m.isSkinnedMesh&&m.skeleton&&m.skeleton.bones.indexOf(o)>=0&&vis(m))v=true;});return v;})();if(!meshVis)return;
   const wp=o.getWorldPosition(new T.Vector3());hits.push({who:(f.userData&&f.userData.ck)||f.name||'?',d:+Math.hypot(wp.x-oh.x,wp.z-oh.z).toFixed(2)});});
  hits.sort((a,b)=>a.d-b.d);return {oppVis:vis(opp),near:hits.slice(0,2),me:V._qa.gfx().vis};};
},[tier]);
const step=async(fn,arg)=>p.evaluate(fn,arg);
const drive=async(label,until,ms)=>{const t0=Date.now();let shot=false;while(Date.now()-t0<ms){
  const st=await step(([label])=>{try{const w=document.getElementById('tcWalk');if(w&&!w.classList.contains('out')){__F.walk++;if(__F.walk%6===0)w.click();return 'walk';}
   if(!S)return 'nos';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
   if(S.cur===1&&S.p[1].ai){if(label==='measure'){const s=__scan();if(s)__F.opp.push(s);return __F.opp.length>=40?'enough':'opp';}return 'opp';}
   if(S.cur===0&&!S.p[0].ai){if(label==='measure')__F.own.push({me:V._qa.gfx().vis,cam:V._qa.camera.position.toArray().map(v=>+v.toFixed(3))});
    if(!S.busy&&S.visit.length<3){if(label==='win'){const me=S.p[0];me.legs=Math.ceil(S.bestOf/2)-1;if(S.visit.length===0&&me.score>40)me.score=40;}
     const lbl=label==='win'?aimFor(S.p[0].score,3-S.visit.length):'T20';const t=targetPoint(lbl);S.busy=true;land(t.x+gauss()*3,t.y+gauss()*3);}return 'own';}
   return 'wait';}catch(e){return 'ERR '+e.message;}},[label]);
  if(label==='measure'&&st==='opp'&&shotDir&&!shot){const n=await step(()=>__F.opp.length);if(n>=12){shot=true;await p.screenshot({path:`${shotDir}/fig18_${path}_t${tier}_${W}.png`});}}
  if(until.includes(st)||st.startsWith('ERR'))return st;await p.waitForTimeout(60);}return 'timeout';};
const log=s=>step(s=>__F.steps.push(s),s);
if(path==='hayden'){
 await step(()=>{showHub();document.querySelectorAll('.tc-sheet .tc-x').forEach(x=>x.click());});await p.waitForTimeout(1500);
 await step(()=>{document.querySelectorAll('.tc-sheet .tc-x').forEach(x=>x.click());$('btnPlayNext').click();});
 const m1=await drive('win',['done'],240000);await log('match1 '+m1);await p.waitForTimeout(4500);
 await step(()=>{const b=$('btnResAction');if(b)b.click();else if($('btnResultNext'))$('btnResultNext').click();});await p.waitForTimeout(3000);
 await step(()=>{document.querySelectorAll('.tc-sheet .tc-x').forEach(x=>x.click());});await p.waitForTimeout(800);
 const ok=await step(()=>{const t=document.getElementById('tcExhTile');if(!t)return 'no tile';t.click();return 'tile';});await log(ok);await p.waitForTimeout(1200);
 const go=await step(()=>{const g=document.getElementById('tcPGo');if(!g)return 'no accept';g.click();return 'accepted';});await log(go);
}else if(path==='exh'){await step(()=>{showHub();document.querySelectorAll('.tc-sheet .tc-x').forEach(x=>x.click());});await p.waitForTimeout(1500);
 await step(()=>{document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());const t=document.getElementById('tcExhTile');if(t)t.click();});await p.waitForTimeout(1200);await step(()=>{const g=document.getElementById('tcPGo');g&&g.click();});
}else{await step(()=>{showHub();document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());$('btnPlayNext').click();});}
const m2=await drive('measure',['enough','done'],150000);await log('measure '+m2);
const F=await step(()=>({...__F,opp2:S&&S.p&&S.p[1]&&S.p[1].name}));
const bad=F.opp.filter(s=>s.oppVis&&s.near.length&&s.near[0].d<.45);
const fail=[];if(F.opp.length<10)fail.push('opponent never measured ('+F.steps.join(', ')+')');if(bad.length)fail.push(bad.length+'/'+F.opp.length+' samples with a figure inside the opponent: '+JSON.stringify(bad[0].near[0]));if(pe.length)fail.push('page errors: '+pe.slice(0,2).join(' | '));
const r={tier,path,W,opponent:F.opp2,steps:F.steps,walkFrames:F.walk,oppSamples:F.opp.length,closest:F.opp.length?F.opp.map(s=>s.near[0]||{d:99}).sort((a,b)=>a.d-b.d)[0]:null,meVisibleDuringOpp:F.opp.filter(s=>s.me).length,ownMeVisible:F.own.filter(s=>s.me).length+'/'+F.own.length,ownCam:F.own.length?F.own[F.own.length-1].cam:null,result:fail.length?'FAIL':'PASS',fail};
console.log(JSON.stringify(r));console.log('fig-clear',r.result);await b.close();process.exit(fail.length?1:0);})();
