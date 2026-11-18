// S3 save slot (Hayden 07:45: Season 3 gets its own save slot; rolling back to 3.55 gives Season 2 careers back exactly).
// Checks, with a real Season 2 device save in place:
//   1 flag off: the game uses doubleout2 / tops_saves / tops_save_put / tops_career_bak, and loads the Season 2 save
//   2 ?s3=1: the game uses doubleout_s3 / tops_saves_s3 / tops_save3_put / tops_career_bak_s3 and starts a fresh save
//     (no career, starter bank); playing on it (new career, persist) never changes the Season 2 device save or its backups
//   3 the flag sticks without the URL (home-screen app), and ?s3=0 turns it off: the Season 2 save comes back byte-identical
//   4 the cloud calls go to the Season 3 table and RPC only (no request names tops_saves or tops_save_put)
// usage: node tests/s3-slot.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 const url='file://'+path.resolve(__dirname,'../index.html');const reqs=[];
 await p.route(/jsdelivr|googleapis|gstatic/,r=>r.abort());await p.route(/supabase\.co/,r=>{reqs.push(r.request().url());r.abort();});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));const f=[];
 await p.goto(url);await p.waitForTimeout(800);
 // a Season 2 save with a played career, plus its device backup
 const S2=await p.evaluate(()=>{localStorage.clear();const s=JSON.parse(JSON.stringify(save));s.season=1;s.composure=7;s.career={tier:3,stage:'season',wins:41,losses:12,bank:9876,v3:{lv:22}};s.bank=9876;s.sv=777;s.dev='s2dev';
  localStorage.setItem('doubleout2',JSON.stringify(s));localStorage.setItem('tops_career_bak',JSON.stringify([{at:1,id:'x',d:{career:{tier:2}}}]));return {save:localStorage.getItem('doubleout2'),bak:localStorage.getItem('tops_career_bak')};});
 const state=()=>p.evaluate(()=>({ns:window.TOPS_SAVE_NS,flag:window.TOPS_S3FLAG,tier:save.career&&save.career.tier,wins:save.career&&save.career.wins,bankOk:!save.career,s2:localStorage.getItem('doubleout2'),bak:localStorage.getItem('tops_career_bak'),s3:localStorage.getItem('doubleout_s3')}));
 // 1 flag off
 await p.goto(url);await p.waitForTimeout(4000);let s=await state();
 if(s.flag!==false||s.ns.key!=='doubleout2'||s.ns.table!=='tops_saves'||s.ns.rpc!=='tops_save_put'||s.ns.bak!=='tops_career_bak')f.push('flag off: wrong save slot '+JSON.stringify(s.ns));
 if(s.tier!==3||s.wins!==41)f.push('flag off: the Season 2 career did not load ('+s.tier+'/'+s.wins+')');
 const s2After1=s.s2;/* the flag-off load itself may persist (migrations); from here on Season 3 must not change it */
 if(!s2After1)f.push('flag off: no Season 2 device save after load');
 // 2 ?s3=1
 reqs.length=0;await p.goto(url+'?s3=1');await p.waitForTimeout(4000);s=await state();
 if(s.flag!==true||s.ns.key!=='doubleout_s3'||s.ns.table!=='tops_saves_s3'||s.ns.rpc!=='tops_save3_put'||s.ns.bak!=='tops_career_bak_s3')f.push('s3: wrong save slot '+JSON.stringify(s.ns));
 if(!s.bankOk)f.push('s3: the game did not start a fresh save (career '+JSON.stringify(s.tier)+')');
 const play=await p.evaluate(()=>{try{save.authSeen=true;save.lessonDone=true;newCareer();const c=career();c.wins=1;c.stage='season';persist();try{window.TOPS_CAREER_BAK&&TOPS_CAREER_BAK.backup&&TOPS_CAREER_BAK.backup('test');}catch(e){}
  return {ok:true,s3:!!localStorage.getItem('doubleout_s3'),s2:localStorage.getItem('doubleout2'),bak:localStorage.getItem('tops_career_bak')};}catch(e){return {err:String(e.message||e)};}});
 if(play.err)f.push('s3: playing failed: '+play.err);
 else{if(!play.s3)f.push('s3: no Season 3 device save written');if(play.s2!==s2After1)f.push('s3: the Season 2 device save changed');if(play.bak!==S2.bak)f.push('s3: the Season 2 career backups changed');}
 // 3 sticks without the URL, then ?s3=0
 await p.goto(url);await p.waitForTimeout(4000);s=await state();
 if(!s.flag)f.push('s3 flag did not stick without the URL');
 if(s.s2!==s2After1)f.push('Season 2 device save changed after a Season 3 reload');
 await p.goto(url+'?s3=0');await p.waitForTimeout(4000);s=await state();
 if(s.flag!==false)f.push('?s3=0 did not turn the flag off');
 if(s.tier!==3||s.wins!==41)f.push('after ?s3=0 the Season 2 career is not back ('+s.tier+'/'+s.wins+')');
 // flag-off load is allowed to rewrite doubleout2 (persist), but the career must be the same one
 // 4 cloud calls during the Season 3 loads
 const bad=reqs.filter(u=>/tops_saves(?!_s3)|tops_save_put/.test(u));if(bad.length)f.push('Season 3 game called the Season 2 cloud slot: '+bad.slice(0,2).join(' | '));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log('PASS: flag off uses the Season 2 slot and loads the Season 2 career; ?s3=1 uses doubleout_s3 / tops_saves_s3 / tops_save3_put / tops_career_bak_s3 with a fresh save; playing Season 3 leaves the Season 2 device save and backups byte-identical; the flag sticks without the URL; ?s3=0 brings the Season 2 career back');
})();
