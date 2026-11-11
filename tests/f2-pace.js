// F2 unlock pacing (Overseer 05:58): Asp 33 and GA 34 (were 30/32) so Asp no longer lands exactly at Regional promotion (level ~30).
// Checks the gate at levels 30-34, that an Asp you already own stays owned and equipped below 33, and that the Store says "level 33".
// usage: node tests/f2-pace.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;newCareer();const c=career();c.stage=null;const v=C3.V3();const out={gate:{}};
  for(const lv of [30,32,33,34]){v.lv=lv;const gateBarrel=TOPS_GATE.gateBarrel;out.gate[lv]={asp:gateBarrel({id:'asp'}),ga:gateBarrel({id:'ga'}),vapor8:gateBarrel({id:'vapor8'}),power:gateBarrel({id:'power'})};}
  v.lv=31;save.owned=['assassin','asp'];save.barrel='asp';save.sponsor=null;try{TOPS_v11Migrate();}catch(e){}out.keep={owned:save.owned.includes('asp'),barrel:save.barrel};
  save.owned=['assassin'];save.barrel='assassin';try{showHub();showShop('barrel');}catch(e){}const t=document.body.textContent;out.store=/level 33/.test(t);out.lvls=(t.match(/Unlocks at level \d+/g)||[]).join('|');return out;});
 // ChatGPT 8.7 condition: a career that had already reached the old level keeps Asp / GA unlocked (one-time entitlement, every load path)
 const plant=lv=>p.evaluate(lv=>{newCareer();const c=career();c.stage=null;c.tier=2;C3.V3().lv=lv;save.owned=['assassin'];save.barrel='assassin';delete save.v12pace;delete save.v12ent;persist();return JSON.parse(JSON.stringify(save));},lv);
 const gates=()=>p.evaluate(()=>({asp:!!TOPS_GATE.gateBarrel({id:'asp'}),ga:!!TOPS_GATE.gateBarrel({id:'ga'}),ent:save.v12ent,flag:save.v12pace}));
 const E={};
 let sv=await plant(31);await p.evaluate(x=>{save=Object.assign({},x,{authSeen:true});persist();},sv);await p.reload();await p.waitForTimeout(4000);await p.evaluate(()=>{try{TOPS_v11Migrate();}catch(e){}});E.load31=await gates();
 sv=await plant(31);await p.evaluate(()=>{newCareer();persist();});await p.evaluate(x=>netAdopt(x),sv);E.adopt31=await gates();
 sv=await plant(31);await p.evaluate(x=>{NET.pendCloud=x;},sv);await p.waitForTimeout(2600);E.other31=await gates();
 await plant(33);await p.evaluate(()=>{TOPS_v11Migrate();});E.lv33=await gates();
 await plant(29);await p.evaluate(()=>{TOPS_v11Migrate();C3.V3().lv=31;});E.reached31after=await gates();
 E.run=await p.evaluate(()=>{newCareer();C3.V3().lv=31;delete save.v12pace;delete save.v12ent;newRun();try{TOPS_v11Migrate();}catch(e){}const inRun=save.v12pace;switchSlot('career');try{TOPS_v11Migrate();}catch(e){}return {inRun,asp:!!TOPS_GATE.gateBarrel({id:'asp'})};});
 E.fresh=await p.evaluate(()=>{newCareer();C3.V3().lv=31;try{TOPS_v11Migrate();}catch(e){}return !!TOPS_GATE.gateBarrel({id:'asp'});});
 // QA 06:36: decided at page load with NO manual migrate (guests never sign in); 29 -> 31 -> sign-in stays locked; unlock texts skip entitled
 // barrels; a career without level data is not decided yet
 const G={};
 sv=await plant(31);await p.evaluate(x=>{save=Object.assign({},x,{authSeen:true});persist();},sv);await p.reload();await p.waitForTimeout(4000);
 G.guest=await p.evaluate(()=>({asp:!!TOPS_GATE.gateBarrel({id:'asp'}),flag:save.v12pace,ent:save.v12ent,next:(TOPS_GATE.nextUnlock(31)||{}).n||null,ann:TOPS_GATE.unlocksIn(32,33).map(u=>u.it.id)}));
 sv=await plant(29);await p.evaluate(x=>{save=Object.assign({},x,{authSeen:true});persist();},sv);await p.reload();await p.waitForTimeout(4000);
 G.at29=await p.evaluate(()=>({flag:save.v12pace,ent:save.v12ent}));
 G.later=await p.evaluate(()=>{C3.V3().lv=31;persist();const cloud=JSON.parse(JSON.stringify(save));netAdopt(cloud);try{TOPS_v11Migrate();}catch(e){}try{showHub();showShop('barrel');}catch(e){}return {asp:!!TOPS_GATE.gateBarrel({id:'asp'}),ent:save.v12ent};});
 G.nov3=await p.evaluate(()=>{newCareer();const c=career();delete c.v3;delete save.v12pace;delete save.v12ent;TOPS_GATE.paceEntitle();return {flag:save.v12pace||null,hasV3:!!c.v3};});
 const f=[];const g=r.gate;
 if(!g[30].asp||g[30].asp.lv!==33)f.push('Asp at level 30: '+JSON.stringify(g[30].asp)+' (want locked until 33)');
 if(!g[32].asp||g[32].asp.lv!==33)f.push('Asp at level 32 not locked');if(g[33].asp)f.push('Asp still locked at 33');
 if(!g[33].ga||g[33].ga.lv!==34)f.push('GA at 33: '+JSON.stringify(g[33].ga)+' (want locked until 34)');if(g[34].ga)f.push('GA still locked at 34');
 if(g[30].vapor8)f.push('Vapor 8 locked at 30');if(!g[34].power||g[34].power.lv!==40)f.push('Power 9Five moved: '+JSON.stringify(g[34].power));
 if(!r.keep.owned||r.keep.barrel!=='asp')f.push('an owned Asp was removed or unequipped below its new level: '+JSON.stringify(r.keep));
 if(!r.store)f.push('Store does not say "level 33" for Asp at level 31: '+r.lvls);
 for(const k of ['load31','adopt31','other31']){const e=E[k];if(!e||e.asp)f.push(k+': a level-31 career lost its Asp unlock '+JSON.stringify(e));else if(!e.ga)f.push(k+': GA unlocked at 31 (old level was 32) '+JSON.stringify(e));}
 if(E.lv33.asp||E.lv33.ga)f.push('level 33 (past both old levels): Asp and GA should both be open '+JSON.stringify(E.lv33));
 if(!E.reached31after.asp)f.push('a career that reached 31 after this version (entitlement already decided at 29) got Asp early');
 if(E.run.inRun)f.push('the entitlement was decided inside The Run');if(E.run.asp)f.push('a level-31 career lost Asp after a Run: '+JSON.stringify(E.run));
 if(!E.fresh)f.push('a new career got the old-level entitlement');
 if(G.guest.asp||!(G.guest.ent||[]).includes('asp'))f.push('guest (no sign-in, no manual migrate) at 31 lost Asp after the update: '+JSON.stringify(G.guest));
 if(G.guest.next&&/Aspinall/.test(G.guest.next))f.push('next-unlock text still announces Asp to an entitled player: '+G.guest.next);
 if(G.guest.ann.includes('asp'))f.push('the level-33 reward would announce Asp to an entitled player');
 if(G.at29.flag!==1||(G.at29.ent||[]).length)f.push('a level-29 save was not decided at load: '+JSON.stringify(G.at29));
 if(!G.later.asp)f.push('29 -> 31 -> sign-in got Asp early: '+JSON.stringify(G.later));
 if(G.nov3.flag||G.nov3.hasV3)f.push('a career without level data was decided (or given level data): '+JSON.stringify(G.nov3));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: Asp unlocks at 33, GA at 34, Power still 40; an owned Asp stays owned and equipped; Store shows level 33; careers already past level 30 keep Asp (page load, sign-in adopt, other-device adopt, after a Run), new careers and later arrivals wait for 33');})();
