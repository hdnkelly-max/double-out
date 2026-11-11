// #11 regression: buying in the kit room must drop the top-right balance (#hubBank) at once, not on the next hub redraw.
// Usage: node bank11.js <dir with built index.html>   exits 1 on failure.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
const r=await p.evaluate(async()=>{save.authSeen=true;save.name='Lee';persist();$('login').hidden=true;newCareer();const c=career();c.bank=500000;persist();showHub('kit');await new Promise(r=>setTimeout(r,600));
 const out=[];const read=()=>$('hubBank').textContent;
 // one purchase from each kit-room list: barrels, setup parts, gear
 for(const id of ['shopList','setupList','gearList']){const L=$(id);if(!L)continue;const el=[...L.children].find(e=>e.onclick&&e.querySelector('.price')&&/buy/i.test(e.querySelector('.price').textContent));if(!el){out.push({list:id,skipped:'nothing to buy'});continue;}
  const before=c.bank,shown0=read();el.onclick();const go=el.nextElementSibling&&el.nextElementSibling.querySelector('.st2go');if(go)go.onclick();const after=c.bank;out.push({list:id,spent:before-after,bankAfter:money(after),shown:read(),shownBefore:shown0,ok:after<before&&read()===money(after)});}
 return out;});
console.log(JSON.stringify(r),pe.length?'pageErrors '+pe.slice(0,2).join(' | '):'');
const bought=r.filter(x=>x.spent>0);const fail=!bought.length||bought.some(x=>!x.ok)||pe.length;console.log(fail?'BANK11 FAIL':'BANK11 PASS');await b.close();process.exit(fail?1:0);})();
