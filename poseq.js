const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});const errs=[];
const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/oche-next/index.html');await p.waitForTimeout(3500);
await p.evaluate(()=>{save.authSeen=true;$('login').hidden=true;newCareer();persist();const c=career();const n=c.next||nextOpponent();c.next=n;ui.mode='career';ui.tier=2;V.walkOn=()=>{};beginMatch({mode:'career',tier:2,p0:'Hayden',oppKey:n.oppKey,oppName:n.oppName,oppAvg:74,legs:5});});
await p.waitForTimeout(6000);await p.evaluate(()=>{if(S.bull)S.bull=null;S.cur=0;S.dart=1;S.busy=false;});
const P=[['set',{phase:'idle'}],['back',{phase:'pull',pull:1}],['release',{phase:'throw',pull:1,k:1}],['follow',{phase:'follow',pull:1,k:1}]];
for(const [n,oa] of P){await p.evaluate(oa=>{window.GFX_OA=oa;},oa);await p.waitForTimeout(1200);await p.screenshot({path:'shots/pose_'+n+'.jpg',clip:{x:0,y:390,width:390,height:340}});}
console.log(JSON.stringify(errs));await b.close();})();
