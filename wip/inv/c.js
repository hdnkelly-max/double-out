// Screen inventory phase C: real end of match (reward card, level-up, after-match chain), checkout hint, money match, local night, practice drill
const {chromium}=require('playwright');const path=require('path');const dir=path.resolve(__dirname,'../..');const out=n=>path.join(__dirname,'shots',n+'.png');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined'&&window.C3&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';save.matches=30;$('login').hidden=true;newCareer();const c=career();c.tier=1;c.bank=640;c.wins=12;c.losses=7;c.pts=9000;c.darts=600;newSeason(c);try{const v=C3.V3();v.lv=14;v.xp=C3.lvNeed(14)-30;}catch(e){}save.tcWelSeen=1;persist();showHub('play');});
await p.waitForTimeout(3000);const clean=()=>p.evaluate(()=>{try{delete TC_API.st().welPend;}catch(e){}document.querySelectorAll('.tc-sheet,.tc-poster,.tcpk,.tc-back,.tc-scrim').forEach(e=>e.remove());});await clean();
const shot=async n=>{await p.screenshot({path:out(n)});console.log('ok',n);};
await p.evaluate(()=>{const c=career();c.next=null;const n=nextOpponent();c.next=n;beginMatch({mode:'career',tier:1,p0:'Hayden',oppKey:n.oppKey,oppName:n.oppName,oppAvg:30,legs:1,start:121});});
let ck=0;const t0=Date.now();let st='';
while(Date.now()-t0<140000){st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(0,0);}return 'bull';}
  if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const o=$('outshot');const ckv=o&&!o.hidden&&getComputedStyle(o).display!=='none'&&o.textContent.trim();if(ckv&&!window.__ck){window.__ck=1;return 'ck';}const me=S.p[0];const lbl=aimFor(me.score,4-S.dart);const t=targetPoint(lbl);S.busy=true;land(t.x+gauss()*2,t.y+gauss()*2);}return 'play';}catch(e){return 'ERR '+e.message;}});
 if(st==='ck'&&!ck){ck=1;await p.waitForTimeout(400);await shot('28_match_checkout_hint');}
 if(st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(80);}
console.log('end',st);
for(let i=0;i<30;i++){if(await p.evaluate(()=>{const e=$('c3rw');return e&&!e.hidden;}))break;await p.waitForTimeout(500);}
await p.waitForTimeout(400);await shot('31_reward_card_start');await p.waitForTimeout(3500);await shot('32_reward_card_levelup');
await p.evaluate(()=>{const g=$('c3rwGo');if(g)g.click();});
for(let i=0;i<4;i++){await p.waitForTimeout(2500);await shot('33_after_match_'+(i+1));await p.evaluate(()=>{const ms=$('msg');if(ms&&!ms.hidden){const r=document.querySelector('#msgReplies button');if(r)r.click();}});}
await clean();
await p.evaluate(()=>{try{endMatch&&0;}catch(e){}S=null;showHub('play');});await p.waitForTimeout(1500);
try{await p.evaluate(()=>moneyMatch());await p.waitForTimeout(1200);await shot('35_money_match_start');}catch(e){console.log('money',e.message.slice(0,100));}
try{await p.evaluate(()=>{S=null;showHub('play');playLocal();});await p.waitForTimeout(1500);await shot('36_local_night');}catch(e){console.log('local',e.message.slice(0,100));}
try{await p.evaluate(()=>{S=null;showHub('play');startDrill('doubles');});await p.waitForTimeout(2500);await shot('37_practice_drill');}catch(e){console.log('drill',e.message.slice(0,100));}
console.log(JSON.stringify(pe.slice(0,5)));await b.close();})();
