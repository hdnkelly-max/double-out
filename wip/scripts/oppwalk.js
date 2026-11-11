// Opponent walk-on online: QA's three points (19:05). Two headless phones, each in its own browser so neither is throttled as a
// background tab; room messages are relayed between them through this script (standing in for the Supabase channel).
// 1) neither phone can throw (TOPS_walkHold) until both phones' walk-ons have finished;
// 2) rematch vs the same mate: no opponent walk-on, released at once;
// 3) leaving mid-walk cancels it, the opponent goes back, nothing stays held.
// Usage: node oppwalk.js <dir with built index.html>   exits 1 on failure.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2]||process.cwd();
const args=['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'];const pe=[];const pages={};
const open=async id=>{const b=await chromium.launch({args});const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
 p.on('pageerror',e=>pe.push(id+': '+e.message));
 await p.exposeFunction('__relay',msg=>{const to=pages[id==='A'?'B':'A'];if(to)to.evaluate(m=>{try{netRecv(m);}catch(e){}},msg).catch(()=>{});});
 await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof V!=='undefined'&&V._qa&&typeof onlineBegin==='function',null,{timeout:180000});await p.waitForTimeout(1500);pages[id]=p;return {b,p};};
const a=await open('A'),bb=await open('B');const A=a.p,B=bb.p;
const setup=(p,id,seat)=>p.evaluate(([id,seat])=>{save.authSeen=true;save.name=id==='A'?'Lee':'Dave';$('login').hidden=true;try{newCareer();}catch(e){}
 const D=TC_API.D;const wk=Object.keys(D.COS).find(k=>D.COS[k].slot==='walkon');save.look=Object.assign({},save.look,{cel:Object.assign({},(save.look||{}).cel,{walkon:wk})});persist();
 window.TC_WALK_TIMEOUT=600000;NET.myId=id;NET.seat=seat;NET.chan={send:o=>{window.__relay(o.payload);}};try{sessionStorage.clear();}catch(e){}return wk;},[id,seat]);
const wk=await setup(A,'A',0);await setup(B,'B',1);
const cfg=await A.evaluate(()=>({t:'start',legs:3,start:501,din:false,tier:1,level:1,first:0,teams:false,players:[{key:'A',name:'Lee',look:save.look},{key:'B',name:'Dave',look:Object.assign({},save.look)}]}));
const st=p=>p.evaluate(()=>{const s=window.TOPS_walkState&&TOPS_walkState();return s&&Object.assign(s,{held:!!TOPS_walkHold(),wait:!!document.getElementById('tcWalkWait')});});
const out={walkon:wk,samples:[]};
// 1) first match
await Promise.all([A.evaluate(c=>onlineBegin(c),cfg),B.evaluate(c=>onlineBegin(c),cfg)]);
let relA=null,relB=null,heldWhileOtherBusy=true,sawWaitOnB=false,earlyRelease=false;
for(let i=0;i<120&&(relA==null||relB==null);i++){const [sa,sb]=await Promise.all([st(A),st(B)]);out.samples.push([sa.age,sa.mine,sa.held,sb.age,sb.mine,sb.held]);
 if(sb.mine&&!sa.mine){if(!sb.held)heldWhileOtherBusy=false;if(sb.wait)sawWaitOnB=true;}if(sa.mine&&!sb.mine&&!sa.held)heldWhileOtherBusy=false;
 if((!sa.held&&!sa.mine)||(!sb.held&&!sb.mine))earlyRelease=true;
 if(relA==null&&!sa.held)relA=sa.age;if(relB==null&&!sb.held)relB=sb.age;await A.waitForTimeout(400);}
Object.assign(out,{relA,relB,heldWhileOtherBusy,sawWaitOnB,earlyRelease});
// 2) rematch, same mate
await Promise.all([A.evaluate(c=>onlineBegin(c),cfg),B.evaluate(c=>onlineBegin(c),cfg)]);let rel2=null;
let rs=null;for(let i=0;i<20;i++){const [sa,sb]=await Promise.all([st(A),st(B)]);rs=[sa,sb];if(!sa.held&&!sb.held){rel2=Math.max(sa.age,sb.age);break;}await A.waitForTimeout(300);}out.rematchState=rs&&rs.map(x=>({mine:x.mine,walk:x.walk,done:x.done}));
out.rematchReleasedMs=rel2;out.rematchOppWalk=await B.evaluate(()=>!!document.getElementById('tcWalk'));
// 3) B meets Lee fresh, leaves mid-walk
await B.evaluate(()=>{try{sessionStorage.removeItem('tcOppWalk:Lee');}catch(e){}});await B.evaluate(c=>onlineBegin(c),cfg);
let mid=null;for(let i=0;i<20;i++){mid=await B.evaluate(()=>{const s=TOPS_walkState();return s&&s.walk;});if(mid==='opp')break;await B.waitForTimeout(200);}
const before=await B.evaluate(()=>{const s=TOPS_walkState();return s;});await B.evaluate(()=>showHub());await B.waitForTimeout(800);
const after=await B.evaluate(()=>({walking:!!window.TOPS_WALKFULL,overlay:!!document.getElementById('tcWalk'),held:!!TOPS_walkHold()}));
out.leave={midWalk:mid,after};
console.log(JSON.stringify(Object.assign({},out,{samples:out.samples.slice(0,4).concat(['…'],out.samples.slice(-3))})));
const ok=relA!=null&&relB!=null&&heldWhileOtherBusy&&!earlyRelease&&rel2!=null&&rs&&rs.every(x=>x.mine&&x.walk==null)&&!out.rematchOppWalk&&mid==='opp'&&!after.walking&&!after.overlay&&!after.held&&!pe.length;
console.log(pe.length?'pageErrors '+pe.slice(0,3).join(' | '):'',ok?'OPPWALK PASS':'OPPWALK FAIL');await a.b.close();await bb.b.close();process.exit(ok?0:1);})();
