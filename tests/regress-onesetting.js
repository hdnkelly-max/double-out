// One setting for everyone (Hayden 21:52): no difficulty picker anywhere, every save plays Club.
// Covers the rule 17 data paths: a 1.79 save on Rookie/Competitive arriving by page load, by cloud adopt at sign-in
// (netAdopt) and from another device (adopt via NET.pendCloud); its queued next opponent re-derived from the raw rating;
// a first career match starts with no picker; the hub has no difficulty chip. Fails on 1.79, passes on the fix.
// usage: node tests/regress-onesetting.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const f=[];const want=await p.evaluate(()=>TOPS_OPP_SHIFT(70,2));
 const plant=lv=>p.evaluate(lv=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;newCareer();const c=career();c.tier=2;c.stage=null;c.bank=500;
  c.next={oppName:'Queued',oppRaw:70,oppAvg:lv==='comp'?76:63,legs:3,_d:2};const cloud=JSON.parse(JSON.stringify(save));cloud.diff={lv,darts:300,pts:21000,place:0};cloud.season=SEASON;cloud.sv=(save.sv||0)+5;cloud.dev='other-device';return cloud;},lv);
 const read=()=>p.evaluate(()=>({lv:save.diff&&save.diff.lv,next:career().next&&career().next.oppAvg}));
 for(const lv of ['comp','rookie']){
  let cloud=await plant(lv);await p.evaluate(c=>netAdopt(c),cloud);let r=await read();if(r.lv!=='club'||r.next!==want)f.push(`sign-in adopt of a ${lv} save: ${JSON.stringify(r)} (want club / ${want})`);
  cloud=await plant(lv);await p.evaluate(c=>{NET.pendCloud=c;},cloud);await p.waitForTimeout(2600);r=await read();if(r.lv!=='club'||r.next!==want)f.push(`other-device adopt of a ${lv} save: ${JSON.stringify(r)} (want club / ${want})`);
  // page load
  await p.evaluate(lv=>{save.diff={lv,darts:300,pts:21000,place:0};career().next={oppName:'Queued',oppRaw:70,oppAvg:lv==='comp'?76:63,legs:3,_d:2};persist();},lv);await p.reload();await p.waitForTimeout(4000);
  r=await read();if(r.lv!=='club'||r.next!==want)f.push(`page load of a ${lv} save: ${JSON.stringify(r)} (want club / ${want})`);}
 // a brand-new career: the first real match starts without asking how hard it should be
 const first=await p.evaluate(async()=>{localStorage.clear();delete save.diff;save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=0;c.bank=500;persist();playNext();
  await new Promise(r=>setTimeout(r,800));const msg=document.getElementById('msg');const asked=!!(msg&&!msg.hidden&&/how hard/i.test(msg.textContent));const playing=!!(S&&!S.done);try{S.done=true;}catch(e){}return {asked,playing,lv:save.diff&&save.diff.lv};});
 if(first.asked)f.push('a new career still asks for a difficulty');if(first.lv!=='club')f.push('new career not on Club: '+JSON.stringify(first));
 await p.evaluate(()=>{showHub();});await p.waitForTimeout(2000);
 if(await p.evaluate(()=>!!document.querySelector('.v11diff')))f.push('difficulty chip still on the hub');
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 await b.close();if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: one setting (Club) after load, sign-in adopt and other-device adopt; queued opponent re-derived ('+want+'); no picker, no chip');})();
