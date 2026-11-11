// #18: the player's own figure must stand clear of the opponent while the opponent throws (no overlap), at every venue.
// node tests/fig-clear.js [dir] [tiers=0,1,2,3,4,5,6] [width=390] [mode=exh|fixture] [shotDir]
// Per tier: starts a real career match (exhibition vs Raymond van Barneveld, or a normal fixture), lets the walk-on run
// (skipped by tapping it, as a player would), the player throws a visit through land(), then samples every 60 ms while the
// AI opponent throws: is the player's figure visible, and how far is its head from the opponent's head (metres, floor plane).
// FAIL if both figures are visible and closer than 0.6 m at any sample. Also records the camera during the player's own
// visit (check 2: own throw view unchanged) and saves a screenshot mid opponent throw when shotDir is given.
const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');const tiers=(process.argv[3]||'0,1,2,3,4,5,6').split(',').map(Number);
const W=+(process.argv[4]||390),mode=process.argv[5]||'exh',shotDir=process.argv[6]||'';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const out=[];let failed=0;
for(const tier of tiers){
 const ctx=await b.newContext({viewport:{width:W,height:844},screen:{width:W,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.goto('file://'+dir+'/index.html');
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
 await p.evaluate(([tier,mode])=>{save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;
  document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());try{sessionStorage.removeItem('tcWalkSeen');}catch(e){}
  const c=career();c.tier=tier;showHub();document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());
  window.__F={walk:0,opp:[],own:[]};
  // the player throws first, as on Hayden's night (the walk-on only runs when you throw first)
  const o=mode==='exh'?{mode:'career',tier,p0:'Hayden',oppName:'Raymond van Barneveld',oppAvg:94,legs:3,purse:0,local:true,tcExh:'barneveld'}
   :{mode:'career',tier,p0:'Hayden',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501};
  beginMatch(o);},[tier,mode]);
 const t0=Date.now();let shot=false,phase='start';
 while(Date.now()-t0<90000){
  const st=await p.evaluate(()=>{try{const w=document.getElementById('tcWalk');if(w&&!w.classList.contains('out')){__F.walk++;if(__F.walk>25)w.click();return 'walk';}
   if(!S||S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
   const g=V._qa.gfx(),opp=V._qa.opp(),T=V._qa.T;const oh=opp&&opp.userData.B&&opp.userData.B.Head?opp.userData.B.Head.getWorldPosition(new T.Vector3()).toArray():null;
   const cam=V._qa.camera.position.toArray().map(v=>+v.toFixed(3));
   if(S.cur===1&&S.p[1].ai){const d=g.head&&oh?Math.hypot(g.head[0]-oh[0],g.head[2]-oh[2]):null;__F.opp.push({meVis:g.vis,oppVis:!!(opp&&opp.visible),d:d==null?null:+d.toFixed(2),me:g.pos&&g.pos.map(v=>+v.toFixed(2))});return __F.opp.length>40?'enough':'opp';}
   if(S.cur===0&&!S.p[0].ai){__F.own.push({meVis:g.vis,cam});if(!S.busy&&S.visit.length<3){const t=targetPoint('T20');S.busy=true;land(t.x+gauss()*6,t.y+gauss()*6);}return 'own';}
   return 'wait';}catch(e){return 'ERR '+e.message;}});
  if(st==='opp'&&!shot&&shotDir){const n=await p.evaluate(()=>__F.opp.length);if(n===12){shot=true;await p.screenshot({path:`${shotDir}/fig18_${mode}_t${tier}_${W}.png`});}}
  if(st==='enough'||st==='done'||st.startsWith('ERR')){phase=st;break;}
  await p.waitForTimeout(60);}
 const F=await p.evaluate(()=>__F);
 const both=F.opp.filter(s=>s.meVis&&s.oppVis);const close=both.filter(s=>s.d!=null&&s.d<.6);
 const own=F.own.slice(-5);const ownMeVis=F.own.some(s=>s.meVis);
 const fail=[];if(F.opp.length<10)fail.push('opponent never threw ('+phase+')');if(close.length)fail.push(close.length+' samples overlap, min '+Math.min(...close.map(s=>s.d))+' m');if(pe.length)fail.push('page errors: '+pe.slice(0,2).join(' | '));
 if(fail.length)failed++;
 const r={tier,mode,W,walkFrames:F.walk,oppSamples:F.opp.length,meVisibleDuringOpp:both.length,minDist:both.length?Math.min(...both.filter(s=>s.d!=null).map(s=>s.d)):null,mePos:(both[0]||{}).me||null,ownMeVisible:ownMeVis,ownCam:own.length?own[own.length-1].cam:null,result:fail.length?'FAIL':'PASS',fail};
 out.push(r);console.log(JSON.stringify(r));await ctx.close();}
await b.close();console.log('fig-clear',failed?'FAIL':'PASS',failed+'/'+out.length+' failing');process.exit(failed?1:0);})();
