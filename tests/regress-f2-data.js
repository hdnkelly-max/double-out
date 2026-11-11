// F2 barrel locks, rule 17 data paths (QA 21:55 #4, #5): save.owned, save.v12res, save.barrel and the sponsor grant
// arriving by page load, cloud adopt at sign-in (netAdopt) and another device (adopt via NET.pendCloud), plus a new career.
//  A sponsor deal (Red Dragon) grants its exclusive set, not equipped; nothing owned is taken away.
//  B a set reserved by a sponsor (Shot: Zen Jutsu at Lv 25) is handed over at the level even after switching sponsor.
//  C below the level it stays reserved, not owned.  D a barrel owned before F2 above your level stays owned and equipped.
//  E a new career clears reservations.
// usage: node tests/regress-f2-data.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const f=[];
 const cases={
  A:{lv:30,sponsor:'rd',owned:['assassin'],barrel:'assassin',res:{},want:{has:['assassin','iceman'],barrel:'assassin',res:[]}},
  B:{lv:26,sponsor:'rd',owned:['assassin'],barrel:'assassin',res:{zen:'shot'},want:{has:['zen','iceman'],barrel:'assassin',res:[]}},
  C:{lv:10,sponsor:'rd',owned:['assassin'],barrel:'assassin',res:{zen:'shot'},want:{has:['assassin'],not:['zen'],barrel:'assassin',res:['zen']}},
  D:{lv:3,sponsor:null,owned:['assassin','power'],barrel:'power',res:{},want:{has:['power'],barrel:'power',res:[]}}};
 const plant=c=>p.evaluate(c=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;newCareer();const k=career();k.stage=null;k.tier=1;k.bank=500;
  const v=C3.V3();v.lv=c.lv;save.sponsor=c.sponsor;save.owned=c.owned.slice();save.barrel=c.barrel;save.v12res=Object.assign({},c.res);
  const cloud=JSON.parse(JSON.stringify(save));cloud.season=SEASON;cloud.sv=(save.sv||0)+5;cloud.dev='other-device';
  newCareer();save.owned=['assassin'];save.barrel='assassin';save.sponsor=null;save.v12res={};return cloud;},c);
 const read=()=>p.evaluate(()=>({owned:save.owned.slice(),barrel:save.barrel,res:Object.keys(save.v12res||{})}));
 const check=(name,how,r,w)=>{const bad=[];(w.has||[]).forEach(id=>{if(!r.owned.includes(id))bad.push('missing '+id);});(w.not||[]).forEach(id=>{if(r.owned.includes(id))bad.push('owns '+id+' early');});
  if(r.barrel!==w.barrel)bad.push('equipped '+r.barrel+' (want '+w.barrel+')');if(r.res.sort().join()!==w.res.sort().join())bad.push('reserved ['+r.res+'] (want ['+w.res+'])');
  if(bad.length)f.push(`${name} via ${how}: ${bad.join(', ')}`);};
 for(const [name,c] of Object.entries(cases)){
  let cloud=await plant(c);await p.evaluate(x=>netAdopt(x),cloud);check(name,'sign-in adopt',await read(),c.want);
  cloud=await plant(c);await p.evaluate(x=>{NET.pendCloud=x;},cloud);await p.waitForTimeout(2600);check(name,'other-device adopt',await read(),c.want);
  cloud=await plant(c);await p.evaluate(x=>{const keep={authSeen:true};save=Object.assign({},x,keep);persist();},cloud);await p.reload();await p.waitForTimeout(4000);check(name,'page load',await read(),c.want);}
 // QA 04:21: a career's reserved set must not leak into The Run, and must survive it
 const R=await p.evaluate(()=>{newCareer();const v=C3.V3();v.lv=10;save.sponsor='rd';save.owned=['assassin'];save.v12res={zen:'shot'};persist();
  newRun();try{TOPS_v11Migrate();}catch(e){}try{showShop('barrel');}catch(e){}const runOwned=save.owned.slice();const runRes=Object.keys(save.v12res||{});
  switchSlot('career');try{TOPS_v11Migrate();}catch(e){}return {runOwned,runRes,careerRes:Object.keys(save.v12res||{}),careerOwned:save.owned.slice()};});
 if(R.runOwned.includes('zen'))f.push('The Run got the career\'s reserved Zen Jutsu');if(!R.careerRes.includes('zen'))f.push('the career lost its reservation after a Run: '+JSON.stringify(R));
 if(R.runRes.length)f.push('The Run holds reservations of its own: '+R.runRes.join(','));
 // QA 05:25 follow-ups: a career's sponsor set stays out of a new Run; a cloud save that is sitting in the Run adopts without leaking either way
 const Q=await p.evaluate(()=>{const out={};newCareer();const v=C3.V3();v.lv=10;save.sponsor='rd';save.owned=['assassin'];save.v12res={zen:'shot'};TOPS_v11Migrate();
   const setId=save.owned.find(k=>k!=='assassin'&&k!=='zen');out.setId=setId;out.careerHasSet=save.owned.includes(setId);
   newRun();TOPS_v11Migrate();try{showShop('barrel');}catch(e){}out.runHasSet=save.owned.includes(setId);out.runSponsor=save.sponsor;
   const cloud=JSON.parse(JSON.stringify(save));out.cloudSlot=cloud.slot;
   switchSlot('career');save.v12res={};save.owned=['assassin'];persist();
   netAdopt(cloud);try{TOPS_v11Migrate();}catch(e){}out.adSlot=save.slot;out.adRunHasSet=save.owned.includes(setId);out.adRunRes=Object.keys(save.v12res||{});
   switchSlot('career');try{TOPS_v11Migrate();}catch(e){}out.adCareerRes=Object.keys(save.v12res||{});out.adCareerHasSet=save.owned.includes(setId);return out;});
 if(!Q.setId||!Q.careerHasSet)f.push('setup: the career did not get its sponsor set '+JSON.stringify(Q));
 if(Q.runHasSet)f.push('a new Run got the career\'s sponsor set '+Q.setId);
 if(Q.cloudSlot!=='run')f.push('setup: the planted cloud save is not in the Run');
 if(Q.adRunHasSet||Q.adRunRes.length)f.push('cloud adopt of a save in the Run leaked career kit into the Run: '+JSON.stringify(Q));
 if(!Q.adCareerRes.includes('zen')||!Q.adCareerHasSet)f.push('cloud adopt of a save in the Run lost the career\'s reservation or sponsor set: '+JSON.stringify(Q));
 const E=await p.evaluate(()=>{save.v12res={zen:'shot'};newCareer();return Object.keys(save.v12res||{}).length;});if(E)f.push('a new career keeps old reservations');
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 await b.close();if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: F2 data paths (page load, sign-in adopt, other-device adopt, new career): sponsor set granted, reserved gift kept across a sponsor change and handed over at its level, nothing owned removed');})();
