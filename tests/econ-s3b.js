// ECON-S3b (Q&D 02:00, ChatGPT's three points on the S3 hooks, fixed before any DPNZ+ item can be sold):
//  1 a purchase whose local save fails (storage full, private mode) is undone: bank, owned list, time and edition back as they were,
//    err 'save', lux_save_fail logged, no tops:lux event; the next successful buy works normally
//  2 every read is read-only: shop(), pool(), items(), owns(), badges(), sets(), edition(), open(), kitAtRisk() leave the save byte-identical,
//    including a career with no career.lux, a career with no v3 yet and a season with no id yet; a refused buy (tier, soon) writes nothing
//  3 one effect key per badge: providing the Clinic badge and the doubles set opens only the Doubles clinic; the old shared 'badge' key is ignored
// usage: node tests/econ-s3b.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{const out={};save.authSeen=true;save.name='Tester';$('login').hidden=true;const X=window.TOPS_LUX;
  const fresh=t=>{newCareer();const c=career();c.tier=t;c.stage=null;c.season=null;c.next=null;C3.V3();newSeason(c);return c;};
  const snap=()=>JSON.stringify(save);
  const reads=()=>{X.shop();X.pool();X.items();X.owns('walkon_prod');X.badges();X.sets();X.edition();X.open();X.kitAtRisk(3000);};
  // 2 read-only
  {const c=fresh(3);C3.fillContracts();delete c.lux;let a=snap();reads();out.ro1=snap()===a;
   delete c.v3;a=snap();reads();out.ro2=snap()===a;out.noV3=!('v3' in c);
   C3.V3();if(c.season)delete c.season.pk;a=snap();reads();out.ro3=snap()===a;
   c.tier=2;a=snap();out.tierErr=X.buy('walkon_prod').err;out.ro4=snap()===a;c.tier=3;
   a=snap();out.soonErr=X.buy('walkon_prod').err;out.ro5=snap()===a;}
  // 3 badge keys
  {const cb=fresh(3);cb.bank=50000;X.provide('badge');out.bad=X.live();X.provide('badge:clinic');X.provide('set:doubles');const s=X.shop();out.badge=s.items.filter(x=>x.kind==='coach').map(x=>x.id+':'+(x.block||'buy'));}
  // 1 save failure rolls back
  {const c=fresh(3);c.bank=10000;X.provide('walkon');X.provide('edition');const ev=[];addEventListener('tops:lux',e=>ev.push(e.detail.id));
   const ls=Storage.prototype.setItem;const n0=TOPS_LOG.events().length;
   Storage.prototype.setItem=function(k,v){if(k==='doubleout2')throw new DOMException('full','QuotaExceededError');return ls.apply(this,arguments);};
   let res;try{res=X.buy('kit_edition');}finally{Storage.prototype.setItem=ls;}
   out.fail={err:res.err,bank:c.bank,lux:'lux' in c,owns:X.owns('kit_edition'),edition:X.edition(),ev:ev.slice(),log:JSON.stringify(TOPS_LOG.events().slice(-5)).includes('lux_save_fail')};
   c.lux={owned:['walkon_prod'],at:{walkon_prod:1}};const before=JSON.stringify(c.lux);
   Storage.prototype.setItem=function(k,v){if(k==='doubleout2')throw new DOMException('full','QuotaExceededError');return ls.apply(this,arguments);};
   try{res=X.buy('kit_edition');}finally{Storage.prototype.setItem=ls;}out.fail2={err:res.err,lux:JSON.stringify(c.lux)===before,bank:c.bank};
   res=X.buy('kit_edition');out.ok={ok:res.ok,bank:c.bank,owns:X.owns('kit_edition'),ev:ev.slice(),stored:((JSON.parse(localStorage.getItem('doubleout2')||'{}').career||{}).lux||{}).owned||null};}
  return out;});
 const f=[];const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))f.push(m+': '+JSON.stringify(a)+' want '+JSON.stringify(b));};
 eq([r.ro1,r.ro2,r.noV3,r.ro3],[true,true,true,true],'reads leave the save unchanged (no lux / no v3 / no season id)');
 eq([r.tierErr,r.ro4],['tier',true],'refused buy below DPNZ writes nothing');eq([r.soonErr,r.ro5],['soon',true],'refused soon buy writes nothing');
 eq(r.bad,[],'the old shared badge key is ignored');
 eq(r.badge,['coach_doubles:buy','coach_scoring:soon','coach_pro:soon'],'Clinic badge + doubles set opens only the Doubles clinic');
 eq(r.fail,{err:'save',bank:10000,lux:false,owns:false,edition:null,ev:[],log:true},'failed save undone (no lux before)');
 eq(r.fail2,{err:'save',lux:true,bank:10000},'failed save undone (lux before)');
 eq(r.ok,{ok:1,bank:2000,owns:true,ev:['kit_edition'],stored:['walkon_prod','kit_edition']},'next buy works and is on the device');
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 console.log(JSON.stringify(r));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log('PASS: a purchase that fails to save is undone (err save, logged, no event); every read leaves the save byte-identical (no lux, no v3, no season id; refused buys too); one key per badge');})();
