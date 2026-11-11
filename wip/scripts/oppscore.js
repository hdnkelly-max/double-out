// Opponent visit score (Overseer 22:53 option b; ChatGPT r4): node oppscore.js <dir> -> PASS/FAIL
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2];
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:360,height:780}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();V.walkOn=()=>{};const n=nextOpponent();beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:n.oppKey,oppName:n.oppName,oppAvg:50,legs:1});});
await p.waitForTimeout(9000);
const st0=await p.evaluate(()=>{const st=window.setTimeout;window.setTimeout=function(f,ms,...a){if(ms===1560)return 0;return st.call(window,f,ms,...a);};return 1;});
const vis=(who,sc,name)=>p.evaluate(([who,sc,name])=>{S.bull=false;S.done=false;S.cur=who;const me=S.p[who];if(name){me.disp=name;}S.visitStart=501;me.score=501-sc;S.visit=[{v:60,label:'T20'},{v:60,label:'T20'},{v:sc-120,label:'S20'}];visitCall(sc,null,who);const e=document.getElementById('vscore');return {html:e?e.innerHTML:'',who:(e&&e.querySelector('.vs-who')||{}).textContent||null};},[who,sc,name]);
const tap=()=>p.evaluate(()=>{document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));const e=document.getElementById('vscore');return e?e.innerHTML:'';});
const r={};
const a=await vis(1,140);r.oppShows=/vs-n/.test(a.html)&&!!a.who;r.oppName=a.who;r.oppNoFinish=!/vs-left/.test(a.html);
r.tapClearsOpp=(await tap())==='';
await vis(1,120);r.buttonKeepsOpp=await p.evaluate(()=>{const bt=document.createElement('button');document.body.appendChild(bt);bt.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));bt.remove();return document.getElementById('vscore').innerHTML!=='';});
r.spaceClearsOpp=await p.evaluate(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true}));return document.getElementById('vscore').innerHTML==='';});
const m=await vis(0,140);r.ownShows=/vs-n/.test(m.html)&&!m.who;r.tapKeepsOwn=(await tap())!=='';
const l=await vis(1,100,'Tangaroa the Taniwha');r.longName=l.who;r.longOk=/^Tangaroa the…$|^Tangaroa…$/.test(l.who||'');
const pass=r.oppShows&&r.oppNoFinish&&r.tapClearsOpp&&r.buttonKeepsOpp&&r.spaceClearsOpp&&r.ownShows&&r.tapKeepsOwn&&r.longOk&&!pe.length;
console.log('oppscore',pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
