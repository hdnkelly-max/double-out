// CAR-S (Overseer 07:16/07:20): "Start a new career" can't lose a career.
//  1 no career / a fresh unplayed one: the button goes straight to the creator (no sheet), and nothing is backed up
//  2 a played career: the sheet names it (tier · W–L · level · bank); "Keep my career", Escape and a tap outside change nothing (save identical)
//  3 "Replace it" → creator → "That's me": a new career, and the old one is in save.careerBak AND localStorage, field for field
//  4 the title shows "Bring back a previous career"; bringing it back restores every field, and the played current career becomes a backup
//  5 a cloud copy without the backup (loaded from another device) still lists this device's copy
//  6 at most 3 backups, newest first; an unplayed restart never pushes a real career out
//  7 storage refusing the backup: "That's me" and Bring back change nothing (no intro, no match), and say so
//  8 an older cloud copy without the backups (sign-in, another device): the next save carries this device's backups again
//  9 CAR-S2 size: the save (cloud copy) carries one backup, the newest that isn't the career in play; the device keeps three
// 10 CAR-S2 cross-device: a cloud copy's backup from another device and this device's own are all offered; bringing one back keeps the others
// 11 CAR-S2 a save that fails right after a restore (storage full / app killed): after a reload the old career is there and the backup is offered again
// 12 CAR-S2 eviction: with three backups and a played career, bringing back the oldest says which one makes room first, and never drops the one coming back
// 13 the old build: no sheet and no backup (the test fails there)
// usage: node tests/career-safe.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const f=[];const ok=(c,m)=>{if(!c)f.push(m);};
 const has=await p.evaluate(()=>!!window.TOPS_CAREER_BAK);if(!has){/* old build: show what it does, then fail cleanly */await p.evaluate(()=>{save.authSeen=true;save.name='T';$('login').hidden=true;newCareer();const c=career();c.wins=3;c.stage='pub';persist();showTitle();$('btnNewCareer').click();});await p.waitForTimeout(300);
  const r=await p.evaluate(()=>({sheet:!!document.getElementById('carSheet'),creator:!document.getElementById('creator').hidden}));await b.close();console.log('FAIL\n- build before CAR-S: no TOPS_CAREER_BAK; tapping Start a new career over a 3-win career: sheet '+r.sheet+', creator opened '+r.creator+' (no backup exists)');process.exit(1);}
 const sheet=()=>p.evaluate(()=>{const d=document.getElementById('carSheet');return d?d.innerText:null;});
 const creator=()=>p.evaluate(()=>!document.getElementById('creator').hidden);
 const setup=async()=>p.evaluate(()=>{save.authSeen=true;save.name='Tester';save.lessonDone=true;$('login').hidden=true;['creator','hub'].forEach(id=>{const e=$(id);if(e)e.hidden=true;});showTitle();});
 // 1 no career → creator straight away
 await setup();await p.evaluate(()=>{save.career=null;showTitle();$('btnNewCareer').click();});await p.waitForTimeout(300);
 ok(await sheet()===null,'sheet shown with no career');ok(await creator(),'no career: creator not shown');
 // a fresh unplayed career → creator straight away, and "That's me" backs nothing up
 await setup();await p.evaluate(()=>{newCareer();showTitle();$('btnNewCareer').click();});await p.waitForTimeout(300);
 ok(await sheet()===null,'sheet shown over an unplayed career');ok(await creator(),'unplayed: creator not shown');
 await p.evaluate(()=>$('btnCreate').click());await p.waitForTimeout(400);
 ok(await p.evaluate(()=>(save.careerBak||[]).length===0&&!localStorage.getItem('tops_career_bak')),'an unplayed career was backed up');
 // 2 a played career
 const mk=(tier,w,l,lv,bank,tag)=>p.evaluate(([tier,w,l,lv,bank,tag])=>{try{$('msg').hidden=true;}catch(e){}if(typeof S!=='undefined'&&S)S.done=true;
  newCareer();const c=career();c.tier=tier;c.wins=w;c.losses=l;c.bank=bank;c.stage='pub';c.tag=tag;c.v3=c.v3||{};c.v3.lv=lv;c.v3.xp=207;save.owned=['assassin','tag_'+tag];save.barrel='tag_'+tag;save.attr={sc:{lv:3,xp:5}};save.perks={grp:1};save.picks=2;save.arm=1.5;
  save.st2=save.st2||{};save.st2.v={co:38,ct:48,fi:41,rh:41,sc:45};save.setup={shaft:'short',flight:'standard',point:'std'};save.v12res={x:tag};persist();showTitle();},[tier,w,l,lv,bank,tag]);
 await setup();await mk(1,6,28,16,154,'A');
 const before=await p.evaluate(()=>JSON.stringify(save,(k,v)=>k==='sv'||k==='dev'?undefined:v));const bakBefore=await p.evaluate(()=>(save.careerBak||[]).length);
 await p.evaluate(()=>$('btnNewCareer').click());await p.waitForTimeout(300);const s1=await sheet();
 ok(s1&&/start a new career/i.test(s1)&&s1.includes('Club singles · 6–28 · Level 16 · $154'),'sheet text: '+s1);ok(!(await creator()),'creator opened before the answer');
 ok(await p.evaluate(()=>document.activeElement&&/keep my career/i.test(document.activeElement.textContent)),'focus is not on "Keep my career"');
 await p.evaluate(()=>[...document.querySelectorAll('#carSheet .cs-b')].find(b=>/keep/i.test(b.textContent)).click());await p.waitForTimeout(200);
 ok(await sheet()===null,'sheet still open after Keep');ok(!(await creator()),'Keep opened the creator');
 await p.evaluate(()=>$('btnNewCareer').click());await p.keyboard.press('Escape');await p.waitForTimeout(150);ok(await sheet()===null,'Escape left the sheet open');
 await p.evaluate(()=>$('btnNewCareer').click());await p.mouse.click(195,40);await p.waitForTimeout(150);ok(await sheet()===null,'a tap outside left the sheet open');
 const after=await p.evaluate(()=>JSON.stringify(save,(k,v)=>k==='sv'||k==='dev'?undefined:v));ok(after===before,'Keep/Escape/outside changed the save');
 // 3 Replace it
 const oldA=await p.evaluate(()=>{const K=['career','perks','attr','arm','picks','owned','barrel','setup','ownedSetup','st2','v12res'];const o={};K.forEach(k=>o[k]=save[k]);return JSON.stringify(o);});
 await p.evaluate(()=>$('btnNewCareer').click());await p.evaluate(()=>[...document.querySelectorAll('#carSheet .cs-b')].find(b=>/start over/i.test(b.textContent)).click());await p.waitForTimeout(300);
 ok(await creator(),'Replace did not open the creator');await p.evaluate(()=>$('btnCreate').click());await p.waitForTimeout(400);
 const r3=await p.evaluate(()=>{const c=career();const bk=save.careerBak||[];let loc=[];try{loc=JSON.parse(localStorage.getItem('tops_career_bak')||'[]');}catch(e){}
  const K=['career','perks','attr','arm','picks','owned','barrel','setup','ownedSetup','st2','v12res'];const pick=d=>{const o={};K.forEach(k=>o[k]=d[k]);return JSON.stringify(o);};
  return {fresh:c.tier===0&&c.wins===0&&c.stage==='intro'&&save.barrel==='assassin',n:bk.length,loc:loc.length,same:bk[0]&&pick(bk[0].d),locSame:loc[0]&&pick(loc[0].d),sum:bk[0]&&bk[0].sum};});
 ok(r3.fresh,'no new career after "That\'s me"');ok(r3.n===bakBefore+1&&r3.loc===r3.n,'backup counts save/local: '+JSON.stringify(r3));
 ok(r3.same===oldA,'save.careerBak is not the old career field for field');ok(r3.locSame===oldA,'local copy is not the old career field for field');
 // 4 bring it back
 const link=await p.evaluate(()=>{showTitle();const b=$('btnRestoreCareer');return b&&!b.hidden&&b.offsetParent!==null;});ok(link,'"Bring back a previous career" not shown');
 await p.evaluate(()=>{const c=career();c.wins=1;c.stage='pub';persist();});/* the new one has been played: it must become a backup */
 await p.evaluate(()=>$('btnRestoreCareer').click());await p.waitForTimeout(200);const s4=await sheet();ok(s4&&s4.includes('Club singles · 6–28')&&s4.includes('Level 16 · $154 · saved'),'restore list: '+s4);
 await p.evaluate(()=>document.querySelector('#carSheet [data-r]').click());await p.waitForTimeout(300);
 const r4=await p.evaluate(()=>{const K=['career','perks','attr','arm','picks','owned','barrel','setup','ownedSetup','st2','v12res'];const o={};K.forEach(k=>o[k]=save[k]);o.career=Object.assign({},o.career);delete o.career.bakId;/* CAR-S2: the restored career is marked with the backup it came from */const bk=save.careerBak||[];return {now:JSON.stringify(o),n:bk.length,top:bk[0]&&bk[0].sum,title:$('btnContinue').textContent};});
 ok(r4.now===oldA,'restored career differs from the original');ok(r4.top&&r4.top.w===1&&r4.top.tier===0,'the played current career was not kept as a backup: '+JSON.stringify(r4));ok(/Club singles/.test(r4.title),'title after restore: '+r4.title);
 // 5 a cloud copy without the backup
 const r5=await p.evaluate(()=>{const keep=save.careerBak;delete save.careerBak;const n=TOPS_CAREER_BAK.list().length;save.careerBak=keep;return n;});ok(r5>=1,'local backup not listed when the save lacks it');
 // 6 cap + an unplayed restart never pushes a real one out
 await p.evaluate(()=>{save.careerBak=[];localStorage.removeItem('tops_career_bak');});
 for(const [i,t] of [[0,'B'],[1,'C'],[2,'D'],[3,'E']].entries()){await mk(t[0],i+1,0,2+i,10*i,t[1]);await p.evaluate(()=>{newCareer();});await p.waitForTimeout(5);}
 await p.evaluate(()=>{newCareer();newCareer();});
 const r6=await p.evaluate(()=>TOPS_CAREER_BAK.list().map(x=>x.d.career.tag));ok(JSON.stringify(r6)===JSON.stringify(['E','D','C']),'cap/newest first/unplayed kept out: '+JSON.stringify(r6));

 // 7 storage refuses the backup
 await p.evaluate(()=>{save.careerBak=[];localStorage.removeItem('tops_career_bak');});await mk(2,9,4,20,500,'F');
 const pre7=await p.evaluate(()=>JSON.stringify(career()));
 await p.evaluate(()=>{const si=Storage.prototype.setItem;window.__si=si;Storage.prototype.setItem=function(k,v){if(k==='tops_career_bak')throw new Error('QuotaExceededError');return si.apply(this,arguments);};});
 await p.evaluate(()=>$('btnNewCareer').click());await p.evaluate(()=>[...document.querySelectorAll('#carSheet .cs-b')].find(b=>/start over/i.test(b.textContent)).click());await p.waitForTimeout(300);
 await p.evaluate(()=>{try{$('btnCreate').click();}catch(e){}});await p.waitForTimeout(500);
 const r7=await p.evaluate(()=>({same:JSON.stringify(career()),sheet:(document.getElementById('carSheet')||{}).innerText||'',msg:!$('msg').hidden,match:typeof S!=='undefined'&&S&&!S.done,bak:TOPS_CAREER_BAK.list().filter(x=>x.d.career.tag==='F').length}));
 ok(r7.same===pre7,'career changed although the backup failed');ok(/couldn.t save a backup/i.test(r7.sheet),'no "couldn\'t save" sheet: '+r7.sheet);ok(!r7.msg&&!r7.match,'intro message or match started after a failed backup');ok(r7.bak===0,'failed backup listed');
 await p.evaluate(()=>{const d=document.getElementById('carSheet');if(d)d.remove();Storage.prototype.setItem=window.__si;$('creator').hidden=true;showTitle();});
 // restore refusing: make one backup, then fail the store during Bring back
 await p.evaluate(()=>{TOPS_CAREER_BAK.backup('t');});const pre7b=await p.evaluate(()=>JSON.stringify(career()));
 await p.evaluate(()=>{const c=career();c.wins+=1;persist();const si=window.__si;Storage.prototype.setItem=function(k,v){if(k==='tops_career_bak')throw new Error('Quota');return si.apply(this,arguments);};});
 const r7b=await p.evaluate(()=>{const before=JSON.stringify(career());const id=TOPS_CAREER_BAK.list()[0].id;const r=TOPS_CAREER_BAK.restore(id);Storage.prototype.setItem=window.__si;return {r,same:JSON.stringify(career())===before};});
 ok(r7b.r==='fail'&&r7b.same,'restore changed the save although storing the outgoing career failed: '+JSON.stringify(r7b));
 // 8 an older cloud copy without the backups
 const r8=await p.evaluate(()=>{const n=TOPS_CAREER_BAK.list().length;const cloud=JSON.parse(JSON.stringify(save));delete cloud.careerBak;cloud.sv=(save.sv||0)+5;netAdopt(cloud);return {n,after:(save.careerBak||[]).length,stored:(JSON.parse(localStorage.getItem('doubleout2')).careerBak||[]).length};});
 ok(r8.n>0&&r8.after===1&&r8.stored===1,'the newest backup not carried into the next save after an older cloud copy: '+JSON.stringify(r8));

 // 9 size
 await p.evaluate(()=>{localStorage.removeItem('tops_career_bak');save.careerBak=[];});await p.reload();await p.waitForTimeout(4500);await setup();
 for(const t of ['P','Q','R']){await mk(1,3,1,12,40,t);await p.evaluate(()=>newCareer());}
 const r9=await p.evaluate(()=>{const loc=JSON.parse(localStorage.getItem('tops_career_bak')||'[]');return {cloud:(save.careerBak||[]).map(x=>x.d.career.tag),dev:loc.map(x=>x.d.career.tag)};});
 ok(JSON.stringify(r9)===JSON.stringify({cloud:['R'],dev:['R','Q','P']}),'size: '+JSON.stringify(r9));
 // 10 cross-device: the cloud copy (another phone) brings backup Z; this device has R,Q,P
 const r10=await p.evaluate(()=>{const z=JSON.parse(JSON.stringify(TOPS_CAREER_BAK.list()[0]));z.id='other-phone-z';z.at=Date.now()+1000;z.d.career.tag='Z';
  const cloud=JSON.parse(JSON.stringify(save));cloud.careerBak=[z];netAdopt(cloud);const before=TOPS_CAREER_BAK.shown().map(x=>x.d.career.tag);
  const r=TOPS_CAREER_BAK.restore('other-phone-z');return {before,r,tag:career().tag,after:TOPS_CAREER_BAK.shown().map(x=>x.d.career.tag),cloud:(save.careerBak||[]).map(x=>x.d.career.tag)};});
 ok(JSON.stringify(r10.before)==='["Z","R","Q"]','cross-device list: '+JSON.stringify(r10));ok(r10.r==='ok'&&r10.tag==='Z','cross-device restore: '+JSON.stringify(r10));
 ok(JSON.stringify(r10.after)==='["R","Q"]'&&JSON.stringify(r10.cloud)==='["R"]','after a cross-device restore: '+JSON.stringify(r10));
 // 11 the save fails right after the restore copy
 await setup();await mk(0,2,2,4,15,'S');await p.evaluate(()=>{newCareer();});await mk(0,7,0,6,70,'T');
 const r11a=await p.evaluate(()=>{const id=TOPS_CAREER_BAK.shown().find(x=>x.d.career.tag==='S').id;const si=Storage.prototype.setItem;window.__si=si;
  Storage.prototype.setItem=function(k,v){if(k==='doubleout2')throw new Error('QuotaExceededError');return si.apply(this,arguments);};
  const r=TOPS_CAREER_BAK.restore(id);Storage.prototype.setItem=si;return {r,mem:career().tag,id};});
 await p.reload();await p.waitForTimeout(4500);
 const r11=await p.evaluate(id=>({tag:career()&&career().tag,offered:TOPS_CAREER_BAK.shown().some(x=>x.id===id)}),r11a.id);
 ok(r11a.r==='ok'&&r11.tag==='T'&&r11.offered,'failed save after a restore lost something: '+JSON.stringify([r11a,r11]));
 // 12 eviction
 await setup();await p.evaluate(()=>{localStorage.removeItem('tops_career_bak');save.careerBak=[];});await p.reload();await p.waitForTimeout(4500);await setup();
 for(const t of ['U','V','W']){await mk(1,2,1,9,30,t);await p.evaluate(()=>newCareer());}await mk(1,5,5,10,50,'X');
 await p.evaluate(()=>{showTitle();$('btnRestoreCareer').click();});await p.waitForTimeout(200);
 await p.evaluate(()=>{const rows=[...document.querySelectorAll('#carSheet .cs-row')];rows[rows.length-1].querySelector('[data-r]').click();});await p.waitForTimeout(200);
 const s12=await sheet();ok(s12&&/make room/i.test(s12)&&/Club singles · 2–1/.test(s12),'no make-room sheet: '+s12);
 await p.evaluate(()=>[...document.querySelectorAll('#carSheet .cs-b')].find(b=>/bring it back/i.test(b.textContent)).click());await p.waitForTimeout(300);
 const r12=await p.evaluate(()=>({tag:career().tag,dev:JSON.parse(localStorage.getItem('tops_career_bak')).map(x=>x.d.career.tag),shown:TOPS_CAREER_BAK.shown().map(x=>x.d.career.tag)}));
 ok(r12.tag==='U'&&JSON.stringify(r12.dev)==='["X","W","U"]'&&JSON.stringify(r12.shown)==='["X","W"]','eviction: '+JSON.stringify(r12));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log('PASS: no sheet without a played career; sheet names the career, Keep/Escape/outside change nothing; Replace backs up to the save and the device field for field; Bring back restores it and keeps the played current one; device copy listed when the cloud copy lacks it; max 3, newest first, unplayed restarts kept out; a refused backup or restore changes nothing; an older cloud copy gets the newest backup back; CAR-S2: one backup in the save, three on the device, cross-device restore keeps the rest, a failed save after a restore loses nothing, making room is announced and never drops the one coming back');})();
