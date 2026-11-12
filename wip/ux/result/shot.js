// EXP-R1a dev shots: end a real career match (legs set, endMatch) and capture what the player sees after it.
// usage: node shot.js <dir> <tag> [W H] [won=1]   -> wip/ux/result/<tag>_{a,b,c}.png
const {chromium}=require('playwright');const path=require('path');
const dir=process.argv[2],tag=process.argv[3]||'x',W=+(process.argv[4]||390),H=+(process.argv[5]||844),won=process.argv[6]!=='0';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:W,height:H}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined'&&window.C3,null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';save.matches=5;$('login').hidden=true;newCareer();V.walkOn=()=>{};try{sessionStorage.setItem('tcWalkSeen','1');}catch(e){}const n=nextOpponent();beginMatch({mode:'career',tier:1,p0:'Hayden',oppKey:n.oppKey,oppName:n.oppName,oppAvg:50,legs:3});});
await p.waitForTimeout(6000);
await p.evaluate(won=>{const a=S.p[0],o=S.p[1];a.legs=won?2:1;o.legs=won?1:2;a.pts=a.pts||480;a.darts=a.darts||30;o.pts=o.pts||420;o.darts=o.darts||30;a.coAtt=a.coAtt||8;a.coHit=a.coHit||3;try{TC_API&&TC_API.grant&&TC_API.grant('test');}catch(e){}endMatch();},won);
const out=n=>path.join(__dirname,`${tag}_${n}.png`);
await p.waitForTimeout(700);await p.screenshot({path:out('a')});
await p.waitForTimeout(2600);await p.screenshot({path:out('b')});
const st=await p.evaluate(()=>({result:!$('result').hidden,rw:!!(document.getElementById('c3rw')&&!document.getElementById('c3rw').hidden),btns:[...document.querySelectorAll('#c3rw button')].filter(x=>x.offsetParent).map(x=>x.id||x.textContent.trim().slice(0,20))}));
console.log(JSON.stringify({st,pe:pe.slice(0,3)}));await b.close();})();
