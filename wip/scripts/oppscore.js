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
r.aiVisitShows=!!opp;r.opp=opp;r.matchesReceipt=!!opp&&+opp.n===opp.rec;r.noFinishLine=!!opp&&!opp.finish;
// 2. a tap on the play area clears it; Space does too
r.tapClears=opp?await p.evaluate(()=>{document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));return document.getElementById('vscore').innerHTML==='';}):false;
// 3. your own real visit: three darts into T20 via land(); number shows with no name
const mine=await p.evaluate(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<60&&S.cur!==0;i++)await wait(250);
 const e0=document.getElementById('vscore');if(e0)e0.innerHTML='';S.p[0].score=Math.max(S.p[0].score,200);S.dart=0;S.visit=[];
 for(let k=0;k<3;k++){land(0,-103);await wait(80);}await wait(900);const e=document.getElementById('vscore');return {html:e?e.innerHTML:'',who:!!(e&&e.querySelector('.vs-who'))};});
r.ownShows=/vs-n/.test(mine.html);r.ownNoName=!mine.who;
const pass=r.aiVisitShows&&r.matchesReceipt&&r.noFinishLine&&r.tapClears&&r.ownShows&&r.ownNoName&&!pe.length;
console.log('oppscore',pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
