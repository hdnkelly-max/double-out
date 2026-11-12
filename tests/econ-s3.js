// ECON-M2 S3 data hooks for Experience's DPNZ+ shop screens (no screens): TOPS_LUX.shop(), provide(), pool().
// Checks: 1 shut below DPNZ and in The Run, with the reason, and reading the shop never creates career.lux;
//         2 nothing is sellable until the code that delivers its effects calls provide() (block 'soon', buy refused, bank untouched);
//         3 per-item state: 'bank' with the shortfall, buyable, the kit warning listed on the item, 'owned' with the time;
//         4 a purchase fires 'tops:lux' and logs lux_buy to the flight recorder; a kit warning logs lux_kit_warn;
//         5 no purchase during a match (err 'match');
//         6 pool(): null below DPNZ; at DPNZ three items, totals, next pay 'mid' then 'end', money waiting once met;
//         7 the throw is untouched (throwParams identical before and after).
// usage: node tests/econ-s3.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{const out={};save.authSeen=true;save.name='Tester';$('login').hidden=true;const X=window.TOPS_LUX;
  const tp=()=>{beginMatch({mode:'career',tier:3,p0:'Tester',oppName:'X',oppAvg:70,legs:3,start:501});S.aim=targetPoint('T20');S.adren=0;S.calm=99;const en=effNerves;effNerves=()=>0;let t;try{t=throwParams();}finally{effNerves=en;}S.done=true;return JSON.stringify(t);};
  const fresh=t=>{newCareer();const c=career();c.tier=t;c.stage=null;c.season=null;c.next=null;C3.V3();newSeason(c);return c;};
  const st=s=>s.items.map(x=>x.id+':'+(x.block||'buy'));
  // 1 shut
  {const c=fresh(2);c.bank=50000;delete c.lux;const s=X.shop();out.reg={open:s.open,why:s.why,st:st(s),lux:'lux' in c,tierName:s.tierName,tier:s.tier};
   out.poolReg=X.pool();}
  {const c=fresh(3);c.run={};const s=X.shop();out.run={open:s.open,why:s.why};c.run=null;}
  // 2 nothing provided yet
  const c=fresh(3);c.bank=50000;const before=tp();
  {const s=X.shop();out.soon={why:s.why,st:st(s),miss:s.items.map(x=>x.missing.join('+')),sellable:s.items.map(x=>x.sellable)};out.soonBuy=X.buy('walkon_prod').err;out.soonBank=c.bank;}
  X.provide('bogus');out.bogus=X.live();
  // 3 provide the walk-on: walkon_prod sellable; other items still 'soon'
  X.provide('walkon');c.bank=1000;{const s=X.shop();const w=s.items.find(x=>x.id==='walkon_prod');out.bank={st:st(s),short:w.short,bank:s.bank};}
  c.bank=5000;{const s=X.shop();const w=s.items.find(x=>x.id==='walkon_prod');out.buyable={canBuy:w.canBuy,block:w.block,kit:w.kitRisk.length,confirm:w.confirm};}
  // kit warning on the item: an unlocked, unowned gated barrel affordable now but not after
  const G=TOPS_GATE;const v=C3.V3();v.lv=50;const gated=BARRELS.filter(b=>(G.LV[b.id]||1)>1&&!G.gateBarrel(b));const bb=gated.sort((x,y)=>price(x.price)-price(y.price))[0];
  save.owned=save.owned.filter(id=>!gated.some(g=>g.id===id));c.bank=3000+price(bb.price)-1;
  {const s=X.shop();const w=s.items.find(x=>x.id==='walkon_prod');out.kitItem={canBuy:w.canBuy,confirm:w.confirm,kit:w.kitRisk.map(k=>k.id)};out.ready=s.ready;}
  // 4 event + log
  const ev=[];addEventListener('tops:lux',e=>ev.push(e.detail));const n0=TOPS_LOG.events().length;
  out.kitBuy=X.buy('walkon_prod').err;
  save.owned=save.owned.concat(gated.map(g=>g.id));c.bank=5000;
  // 5 mid-match
  beginMatch({mode:'career',tier:3,p0:'Tester',oppName:'X',oppAvg:70,legs:3,start:501});out.match=X.buy('walkon_prod').err;out.matchShop=X.shop().why;S.done=true;
  out.ok=X.buy('walkon_prod');out.ev=ev.slice();const evs=TOPS_LOG.events().slice(n0>0?0:0).filter(e=>e&&(e.k==='lux_buy'||e.k==='lux_kit_warn'||e.e==='lux_buy'||e.e==='lux_kit_warn'||JSON.stringify(e).includes('lux_')));out.log=evs.map(e=>JSON.stringify(e).match(/lux_(buy|kit_warn)/)[0]);
  {const s=X.shop();const w=s.items.find(x=>x.id==='walkon_prod');out.owned={block:w.block,at:!!w.boughtAt,bank:s.bank};}
  // edition shown with the barrel's name
  X.provide('edition');c.bank=20000;save.barrel=save.barrel||'assassin';out.ed=X.buy('kit_edition').err||'ok';out.edition=X.shop().edition;
  out.after=tp();out.same=out.after===before;
  // 6 pool
  {const c2=fresh(3);C3.fillContracts();const P=X.pool();out.pool=P&&{n:P.items.length,total:P.total,paid:P.paid,waiting:P.waiting,next:P.next,grades:P.items.map(k=>k.grade),st:P.items.map(k=>k.st),midWeek:P.midWeek,len:P.len};
   const pv=c2.v3.cpool;pv.items[0].st='met';out.pool2=(({waiting,next})=>({waiting,next}))(X.pool());c2.season.week=Math.ceil(c2.season.len/2)+1;C3._poolAfter({won:false,tons:0,maxV:0,n180:0,maxCo:0,bestLeg:99,perf:0,avg:0,opLegs:3});
   const P3=X.pool();out.pool3={next:P3.next,paid:P3.paid,waiting:P3.waiting,cash0:pv.items[0].cash};}
  return out;});
 const f=[];const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))f.push(m+': '+JSON.stringify(a)+' want '+JSON.stringify(b));};
 const ids=['coach_doubles','coach_scoring','coach_pro','walkon_prod','kit_edition'];const all=b=>ids.map(i=>i+':'+b);
 eq([r.reg.open,r.reg.why,r.reg.tier],[false,'tier',3],'shut at Regional');eq(r.reg.st,all('tier'),'Regional items blocked by tier');eq(r.reg.lux,false,'reading the shop creates no career.lux');
 if(!r.reg.tierName)f.push('tierName missing');eq(r.poolReg,null,'no pool below DPNZ');eq([r.run.open,r.run.why],[false,'run'],'shut in The Run');
 eq(r.soon.why,null,'open at DPNZ');eq(r.soon.st,all('soon'),'nothing sellable before provide()');eq(r.soon.sellable,[false,false,false,false,false],'sellable flags');
 eq(r.soon.miss,['badge+set:doubles','badge+set:scoring','badge+set:pro','walkon','edition'],'missing effects');eq(r.soonBuy,'soon','buy refused before provide()');eq(r.soonBank,50000,'bank untouched');
 eq(r.bogus,[],'unknown effect keys ignored');
 eq(r.bank.st,['coach_doubles:soon','coach_scoring:soon','coach_pro:soon','walkon_prod:bank','kit_edition:soon'],'walk-on provided, short of cash');eq(r.bank.short,2000,'shortfall');
 eq(r.buyable,{canBuy:true,block:null,kit:0,confirm:false},'buyable');eq(r.ready,true,'ready after load');eq(r.matchShop,'match','shop() shows the match block');if(!r.kitItem.confirm)f.push('confirm flag with a kit warning');if(!r.kitItem.kit.length||!r.kitItem.canBuy)f.push('kit warning listed on the item: '+JSON.stringify(r.kitItem));
 eq(r.kitBuy,'kit','kit warning on buy');eq(r.match,'match','no purchase mid-match');
 if(!r.ok.ok)f.push('buy: '+JSON.stringify(r.ok));eq(r.ev,[{id:'walkon_prod',bank:2000}],'tops:lux event once with the new bank');
 eq(r.log,['lux_kit_warn','lux_buy'],'flight recorder events');eq(r.owned,{block:'owned',at:true,bank:2000},'owned');
 eq(r.ed,'ok','edition bought');if(!r.edition||!r.edition.id||!r.edition.name)f.push('edition with barrel name: '+JSON.stringify(r.edition));
 if(!r.same)f.push('throwParams changed');
 if(!r.pool)f.push('no pool at DPNZ');else{eq([r.pool.n,r.pool.total,r.pool.paid,r.pool.waiting,r.pool.next],[3,263+394+656,0,0,'mid'],'pool at DPNZ');eq(r.pool.st,['open','open','open'],'pool open');}
 eq(r.pool2.next,'mid','met, before mid-season');if(!(r.pool2.waiting>0))f.push('met money waiting: '+JSON.stringify(r.pool2));
 eq([r.pool3.next,r.pool3.paid,r.pool3.waiting],['end',r.pool3.cash0,0],'paid at mid-season');
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 console.log(JSON.stringify(r).slice(0,1500));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log('PASS: shop() shut below DPNZ and in The Run (no save write on read); nothing sellable until provide(); bank/shortfall, kit warning, owned states; tops:lux event + lux_buy/lux_kit_warn logged; no buy mid-match; pool() totals and pay timing; throw unchanged');})();
