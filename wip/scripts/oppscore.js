// Opponent visit score through REAL play (QA send-back 00:07): node oppscore.js <dir> -> PASS/FAIL
// The AI throws its own visit (startTurn → AI darts → land → visitReceipt); your visit is three real land() calls.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2];
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:360,height:780}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();V.walkOn=()=>{};const n=nextOpponent();beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:n.oppKey,oppName:n.oppName,oppAvg:50,legs:1});});
await p.waitForTimeout(9000);
// keep the number up long enough to read it in the test (the 1.56 s cap is checked by eye in play)
await p.evaluate(()=>{const st=window.setTimeout;window.setTimeout=function(f,ms,...a){if(ms===1560)return 0;return st.call(window,f,ms,...a);};});
const r={};
// 1. a real AI visit
let opp=null;for(let tries=0;tries<3&&!opp;tries++){
 await p.evaluate(()=>{const v=document.getElementById('vscore');if(v)v.innerHTML='';S.cur=1;S.dart=0;S.visit=[];startTurn();});
 for(let i=0;i<40&&!opp;i++){await p.waitForTimeout(500);opp=await p.evaluate(()=>{const e=document.getElementById('vscore');const w=e&&e.querySelector('.vs-who');const n=e&&e.querySelector('.vs-n');return w&&n?{who:w.textContent,n:n.textContent,rec:S.lastRec&&S.lastRec.tot,finish:!!e.querySelector('.vs-left')}:null;});}
}
if(opp&&process.env.SHOT){await p.evaluate(()=>document.querySelectorAll('#vscore .vs-n,#vscore small').forEach(e=>{e.style.animation='none';e.style.opacity='1';}));r.chip=await p.evaluate(()=>{const v=document.getElementById('vscore').getBoundingClientRect();const hits=[...document.querySelectorAll('body *')].filter(e=>{if(e.closest('#vscore'))return false;const q=e.getBoundingClientRect();if(!q.width||!q.height||q.width>300)return false;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0||cs.display==='none')return false;return q.left<v.right&&q.right>v.left&&q.top<v.bottom&&q.bottom>v.top&&(e.innerText||'').trim().length>0&&!e.children.length;}).map(e=>(e.id||e.className||e.tagName)+':'+(e.innerText||'').trim().slice(0,16));return {box:[v.left|0,v.top|0,v.width|0,v.height|0],overlaps:hits.slice(0,6)};});}
if(opp&&process.env.SHOT)await p.screenshot({path:process.env.SHOT,timeout:120000,animations:'disabled'});
r.aiVisitShows=!!opp;r.opp=opp;r.matchesReceipt=!!opp&&+opp.n===opp.rec;r.noFinishLine=!!opp&&!opp.finish;
// 2. a tap on the play area clears it; Space does too
r.tapClears=opp?await p.evaluate(()=>{document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));return document.getElementById('vscore').innerHTML==='';}):false;
// 3. your own real visit: three darts into T20 via land(); number shows with no name
const mine=await p.evaluate(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<60&&S.cur!==0;i++)await wait(250);
 const e0=document.getElementById('vscore');if(e0)e0.innerHTML='';S.p[0].score=Math.max(S.p[0].score,200);/* leave S.dart / S.visit as startTurn set them (S.dart is 1-based) */
 for(let k=0;k<3;k++){for(let i=0;i<60&&S.busy;i++)await wait(50);S.busy=true;land(0,k<2?-103:-134);await wait(60);}/* T20 T20 S20 = 140 (three T20s would be a 180, which keeps its own moment) *//* like regress.js: busy set before each dart */let seen=null;for(let i=0;i<30&&!seen;i++){await wait(50);const e=document.getElementById('vscore');if(e&&/vs-n/.test(e.innerHTML))seen={html:e.innerHTML,who:!!e.querySelector('.vs-who'),rec:S.lastRec&&S.lastRec.tot};}return seen||{html:'',who:false,rec:S.lastRec&&S.lastRec.tot,cur:S.cur,dart:S.dart,visit:S.visit.map(v=>v.label),busy:S.busy,score:S.p[0].score,done:S.done,ai:S.p[0].ai,intro:document.getElementById('intro').className};});r.own=mine;
r.ownShows=/vs-n/.test(mine.html);r.ownNoName=!mine.who;
const pass=r.aiVisitShows&&r.matchesReceipt&&r.noFinishLine&&r.tapClears&&r.ownShows&&r.ownNoName&&!pe.length;
console.log('oppscore',pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
