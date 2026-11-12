// Screen inventory phase B (match flow) on live 3.10 at 390x844: intro, walk-on, bull-off, match view states, menu, leg won, result, reward
const {chromium}=require('playwright');const path=require('path');const dir=path.resolve(__dirname,'../..');const out=n=>path.join(__dirname,'shots',n+'.png');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*(window.__SPD||1)),...a);});
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined'&&window.C3&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';save.matches=30;$('login').hidden=true;newCareer();const c=career();c.tier=1;c.bank=640;c.wins=12;c.losses=7;c.pts=9000;c.darts=600;try{const v=C3.V3();v.lv=14;v.xp=C3.lvNeed(14)-30;}catch(e){}save.tcWelSeen=1;persist();showHub('play');});
await p.waitForTimeout(3000);await p.evaluate(()=>{try{delete TC_API.st().welPend;}catch(e){}document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e=>e.remove());});
const got={};const shot=async n=>{if(got[n])return;got[n]=1;await p.screenshot({path:out(n)});console.log('ok',n);};
await p.evaluate(()=>{const c=career();c.next=null;const n=nextOpponent();beginMatch({mode:'career',tier:1,p0:'Hayden',oppKey:n.oppKey,oppName:n.oppName,oppAvg:42,legs:3,start:301});});
await p.waitForTimeout(500);await shot('23_match_intro');await p.waitForTimeout(1800);await shot('24_walkon_or_start');
const t0=Date.now();let st='';
while(Date.now()-t0<150000){st=await p.evaluate(()=>{try{if(S.done)return 'done';
  const vis=id=>{const e=$(id);return e&&!e.hidden&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'&&+getComputedStyle(e).opacity>0.2;};
  const tags=[];if(S.bull)tags.push('bull');if(S.cur===1&&S.aiFlying)tags.push('oppthrow');if(S.cur===0&&!S.busy&&!S.bull)tags.push('myturn');if(vis('outshot')&&S.cur===0)tags.push('checkout');if(vis('callout')&&/leg/i.test($('callout').textContent))tags.push('leg');
  if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null&&window.__bw){S.busy=true;land(gauss()*30,gauss()*30);}window.__bw=1;return tags.join(',');}
  if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){if(!window.__w){window.__w=Date.now();return tags.join(',');}if(Date.now()-window.__w<700)return tags.join(',');window.__w=0;const me=S.p[0];const lbl=aimFor(me.score,4-S.dart);const t=targetPoint(lbl);S.busy=true;land(t.x+gauss()*14,t.y+gauss()*14);}
  return tags.join(',');}catch(e){return 'ERR '+e.message;}});
 if(st==='done'||st.startsWith('ERR'))break;
 for(const t of st.split(',')){const m={bull:'25_bulloff',oppthrow:'27_match_opp_throwing',myturn:'26_match_my_turn',checkout:'28_match_checkout_hint',leg:'30_leg_won_lost'}[t];if(m&&!got[m]){await shot(m);}}
 if(got['26_match_my_turn']&&!got['29_match_menu']&&!st.includes('bull')){await p.evaluate(()=>{$('btnMenu').click();});await p.waitForTimeout(500);await shot('29_match_menu');await p.evaluate(()=>{$('btnMenu').click();});}
 await p.waitForTimeout(60);}
console.log('end',st);await p.waitForTimeout(1200);await shot('31_reward_card');await p.waitForTimeout(2500);await shot('32_reward_levelup');
await p.evaluate(()=>{const g=$('c3rwGo');if(g)g.click();});await p.waitForTimeout(2500);await shot('33_after_continue');
await p.evaluate(()=>{const r=$('result');if(r){showScreen('result');}});await p.waitForTimeout(800);await shot('34_result_screen');
console.log(JSON.stringify(pe.slice(0,5)));await b.close();})();
