const {chromium}=require('playwright');(async()=>{const [dir,w,h,out]=[process.argv[2],+process.argv[3],+process.argv[4],process.argv[5]];
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:w,height:h}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();V.walkOn=()=>{};const n=nextOpponent();beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:n.oppKey,oppName:n.oppName,oppAvg:50,legs:1});});
await p.waitForTimeout(9000);await p.screenshot({path:out,timeout:120000,animations:'disabled'});await b.close();})();
