const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});
 for(const rbq of ['','?rebrand=1']){const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());
 await p.goto('file://'+path.resolve(__dirname,'../../index.html')+rbq);await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
 await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;newCareer();const c=career();c.tier=0;c.wins=6;c.losses=28;c.bank=154;c.stage='pub';c.v3=c.v3||{};c.v3.lv=16;persist();showTitle();});await p.waitForTimeout(800);
 const t=rbq?'rb':'old';await p.screenshot({path:`wip/cars/title_${t}.png`});
 await p.evaluate(()=>$('btnNewCareer').click());await p.waitForTimeout(300);await p.screenshot({path:`wip/cars/ask_${t}.png`});
 await p.evaluate(()=>{[...document.querySelectorAll('#carSheet .cs-b')].find(b=>/start over/i.test(b.textContent)).click();});await p.waitForTimeout(300);await p.evaluate(()=>$('btnCreate').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{try{$('msg').hidden=true;}catch(e){}if(typeof S!=='undefined'&&S)S.done=true;['hud','hub','creator'].forEach(i=>{try{$(i).hidden=true}catch(e){}});showTitle();});await p.waitForTimeout(800);await p.screenshot({path:`wip/cars/title2_${t}.png`});
 await p.evaluate(()=>$('btnRestoreCareer').click());await p.waitForTimeout(300);await p.screenshot({path:`wip/cars/restore_${t}.png`});await p.close();}
 await b.close();})();
