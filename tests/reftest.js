const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});const errs=[];
const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(/referee|ref /.test(m.text()))console.log('  console:',m.text().slice(0,200))});
await p.goto('file:///home/claude/oche-next/index.html');await p.waitForTimeout(3500);
const mid='test-'+Date.now();
await p.evaluate((mid)=>{save.authSeen=true;$('login').hidden=true;V.walkOn=()=>{};NET.myId='me';NET.room='TEST';
 onlineBegin({mid,players:[{key:'me',name:'Hayden'},{key:'lee',name:'Lee'}],first:0,legs:3,start:501,tier:2,level:1});},mid);
await p.waitForTimeout(4000);
// my visit: three T20-ish darts
for(let i=0;i<3;i++){await p.evaluate(()=>{const t=targetPoint('T20');S.busy=true;land(t.x,t.y);});await p.waitForTimeout(2500);}
const rpc=(fn,body)=>p.evaluate(async([fn,body])=>{const r=await fetch(LB.url+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'apikey':LB.key,'Authorization':'Bearer '+LB.key,'Content-Type':'application/json'},body:JSON.stringify(body)});return r.json();},[fn,body]);
let st=await rpc('tops_ref_state',{p_match:mid});console.log('after my visit server:',JSON.stringify({v:st&&st.v,cur:st&&st.cur,scores:st&&st.scores}));
console.log('local:',JSON.stringify(await p.evaluate(()=>({cur:S.cur,sc:S.p.map(q=>q.score)}))));
// Lee throws 3 darts on the server only (peer messages lost)
for(let i=0;i<3;i++){st=await rpc('tops_ref_dart',{p_match:mid,p_key:'lee',p_seq:st.v+1,p_x:0,p_y:-103,p_bo:false});}
console.log('server after lee:',JSON.stringify({v:st.v,cur:st.cur,scores:st.scores,err:st.err}));
await p.waitForTimeout(9000);
console.log('local after reconcile:',JSON.stringify(await p.evaluate(()=>({cur:S.cur,sc:S.p.map(q=>q.score),fixes:TOPS_REF.fixes,dart:S.dart}))));
console.log('errors',errs.slice(0,3));await b.close();})();
