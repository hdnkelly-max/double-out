const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await require('./hl.js')(p);
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
const r=await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';$('login').hidden=true;newCareer();career().bank=420;const v=C3.V3();v.lv=26;v.bSeen=26;save.sponsor='rd';save.owned.push('iceman');persist();showShop('barrel');
 const rows=[...document.querySelectorAll('#shopList .opt')];const ex=rows.filter(x=>x.querySelector('.v12sp'));if(ex[0])ex[0].scrollIntoView({block:'start'});return rows.length+' rows, '+ex.length+' sponsor rows';});
await p.waitForTimeout(1500);await p.screenshot({path:'shots/f2_f_excl.jpg',quality:80});console.log(r);await b.close();})();
