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
 const f=[];const g=r.gate;
 if(!g[30].asp||g[30].asp.lv!==33)f.push('Asp at level 30: '+JSON.stringify(g[30].asp)+' (want locked until 33)');
 if(!g[32].asp||g[32].asp.lv!==33)f.push('Asp at level 32 not locked');if(g[33].asp)f.push('Asp still locked at 33');
 if(!g[33].ga||g[33].ga.lv!==34)f.push('GA at 33: '+JSON.stringify(g[33].ga)+' (want locked until 34)');if(g[34].ga)f.push('GA still locked at 34');
 if(g[30].vapor8)f.push('Vapor 8 locked at 30');if(!g[34].power||g[34].power.lv!==40)f.push('Power 9Five moved: '+JSON.stringify(g[34].power));
 if(!r.keep.owned||r.keep.barrel!=='asp')f.push('an owned Asp was removed or unequipped below its new level: '+JSON.stringify(r.keep));
 if(!r.store)f.push('Store does not say "level 33" for Asp at level 31: '+r.lvls);
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: Asp unlocks at 33, GA at 34, Power still 40; an owned Asp stays owned and equipped; Store shows level 33');})();
