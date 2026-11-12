// F3 in the real game build (NOT live): every character GLB request is answered with the MakeHuman test character
// (MH=1) or left alone (MH=0), so the same scenes can be compared. Shots: hub preview, opponent idle at the oche,
// opponent throw frames. usage: MH=1 node wip/f3mh/f3game.js <outdir> [mh.glb]
const {chromium,devices}=require('playwright');const fs=require('fs'),path=require('path');
const out=process.argv[2]||'shots';const glb=process.argv[3]||'/home/claude/mhbuild/r/out/mhtest.glb';const MH=process.env.MH==='1';const tag=MH?'mh':'mix';
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2,userAgent:devices['iPhone 13'].userAgent});
const p=await ctx.newPage();p.on('pageerror',e=>console.log('pageerror',e.message));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
if(MH)await p.route(/\/chars\/[a-z]+\.glb$/,r=>r.fulfill({body:fs.readFileSync(glb),contentType:'model/gltf-binary'}));
await p.goto(process.env.URL||'http://localhost:8770/index.html');/* http, not file://: Playwright can only route http requests */
await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
const ev=(f,a)=>p.evaluate(f,a);const cdp=await ctx.newCDPSession(p);/* CDP capture: page.screenshot waits on blocked web fonts */const shot=async n=>{const r=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:85});fs.writeFileSync(`${out}/${tag}_${n}.jpg`,Buffer.from(r.data,'base64'));console.log('shot',n);};
await ev(M=>{save.authSeen=true;save.name='Hayden';save.lessonDone=true;save.look=Object.assign({},save.look||{},{model:M});$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;showHub();},process.env.MODEL||'brian');
await p.waitForTimeout(9000);await shot('hub');
// hub preview (Player hero) and portrait, as the game renders them for this look
for(let i=0;i<40;i++){const u=await ev(M=>{try{const lk=Object.assign({},save.look,{model:M});const h=V.heroShot(lk,'Hayden',0,save.flight);const pt=V.portrait(lk,'Hayden',0,0);return h&&pt&&h.length>50000?[h,pt]:null;}catch(e){return null;}},process.env.MODEL||'brian');
 if(u){fs.writeFileSync(`${out}/${tag}_hero.png`,Buffer.from(u[0].split(',')[1],'base64'));fs.writeFileSync(`${out}/${tag}_portrait.png`,Buffer.from(u[1].split(',')[1],'base64'));console.log('hero+portrait');break;}if(i===39)console.log('no hero:',await ev(()=>{try{const lk=save.look;return JSON.stringify({h:(V.heroShot(lk,'Hayden',0,save.flight)||'').length,p:(V.portrait(lk,'Hayden',0,0)||'').length,pend:!!window.__avPending});}catch(e){return e.message}}));await p.waitForTimeout(500);}
if(process.env.HEROONLY){await b.close();return;}
await ev(()=>{const n=nextOpponent();V.walkOn=()=>{};beginMatch({mode:'career',tier:0,p0:'Hayden',oppKey:n.oppKey,oppName:n.oppName,oppAvg:45,legs:1,start:501});});
// bull: let the player throw at once; then play the player's visits instantly and photograph the opponent's
let n=0,lastPh='',k=0,lastShot=0;const t0=Date.now();
while(Date.now()-t0<240000&&n<12){const st=await ev(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
  if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const t=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(t.x+gauss()*16,t.y+gauss()*16);return 'me';}
  const o=V._qa.opp();const oa=o&&o.userData&&o.userData.oa;return S.cur===1?'opp:'+(oa&&oa.phase||'?'):'wait';}catch(e){return 'ERR '+e.message;}});
 if(st==='done'||st.startsWith('ERR')){console.log(st);break;}
 if(process.env.DBG&&st!==lastPh)console.log(st);if(st.startsWith('opp')){if(st!==lastPh)k=0;if(k<3&&Date.now()-lastShot>650){await shot(String(++n).padStart(2,'0'));k++;lastShot=Date.now();}}lastPh=st;await p.waitForTimeout(st.startsWith('opp')?120:60);}
await b.close();})();
