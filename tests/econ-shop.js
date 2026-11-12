// ECON-M2 S2: DPNZ+ things worth buying (coaching programmes $2k/6k/15k with a challenge set + badge, walk-on production $3k, kit edition $8k).
// Checks: shut below DPNZ; open from DPNZ; pays once, owned once; not enough cash refused; level-gated kit keeps buy-order priority
// (a purchase that would put an unlocked, unowned gated barrel you can afford now out of reach asks first; force buys); save round-trip;
// the throw is untouched (throwParams identical before and after buying everything).
// usage: node tests/econ-shop.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{const out={};save.authSeen=true;save.name='Tester';$('login').hidden=true;const X=window.TOPS_LUX;
  const tp=()=>{beginMatch({mode:'career',tier:3,p0:'Tester',oppName:'X',oppAvg:70,legs:3,start:501});S.aim=targetPoint('T20');S.adren=0;S.calm=99;const en=effNerves;effNerves=()=>0;let t;try{t=throwParams();}finally{effNerves=en;}S.done=true;return JSON.stringify({A:t.A,P:t.P,s0:t.s0,w:t.w,tr:t.tr});};
  newCareer();let c=career();c.tier=2;c.stage=null;c.bank=50000;out.reg={open:X.open(),buy:X.buy('coach_doubles').err,bank:c.bank};
  c.tier=3;out.dpnz={open:X.open(),items:X.items().map(x=>[x.id,x.price])};
  const before=tp();
  // kit first: an unlocked, unowned level-gated barrel affordable now
  const G=TOPS_GATE;const gated=BARRELS.filter(b=>(G.LV[b.id]||1)>1);const v=C3.V3();v.lv=50;const bb=gated.filter(b=>!G.gateBarrel(b)).sort((x,y)=>price(y.price)-price(x.price))[0];save.owned=save.owned.filter(id=>id!==bb.id);
  const bp=price(bb.price);c.bank=Math.max(bp,2000)+500;/* can buy the clinic, but then not the barrel */out.kit={barrel:bb.n,bp,res:X.buy('coach_doubles')};out.kitForce=X.buy('coach_doubles',true);out.bankAfter=c.bank;
  // plenty of cash: buy everything once
  save.owned=save.owned.concat(gated.map(b=>b.id));c.bank=100000;const res=['coach_doubles','coach_scoring','coach_pro','walkon_prod','kit_edition'].map(id=>[id,X.buy(id).err||'ok']);out.all=res;out.spent=100000-c.bank;out.again=X.buy('coach_pro').err;
  out.badges=X.badges();out.sets=X.sets();out.edition=X.edition();
  c.bank=100;out.poor=(()=>{c.lux.owned=[];return X.buy('coach_pro').err;})();
  c.lux.owned=['coach_scoring'];const copy=JSON.parse(JSON.stringify(save));Object.assign(save,copy);out.rt=TOPS_LUX.owns('coach_scoring');
  out.after=tp();out.same=out.after===before;return out;});
 const f=[];const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))f.push(m+': '+JSON.stringify(a)+' want '+JSON.stringify(b));};
 eq(r.reg.open,false,'shut at Regional');eq(r.reg.buy,'tier','Regional buy refused');eq(r.reg.bank,50000,'Regional bank untouched');
 eq(r.dpnz.open,true,'open at DPNZ');eq(r.dpnz.items,[['coach_doubles',2000],['coach_scoring',6000],['coach_pro',15000],['walkon_prod',3000],['kit_edition',8000]],'catalogue');
 eq(r.kit.res.err,'kit','gated kit asks first');if(!(r.kit.res.kit||[]).includes(r.kit.barrel))f.push('kit warning names the barrel: '+JSON.stringify(r.kit));eq(r.kitForce.ok,1,'force buys');
 eq(r.all.map(x=>x[1]),['owned','ok','ok','ok','ok'],'buy everything once (doubles already owned)');eq(r.spent,15000+6000+3000+8000,'spent');eq(r.again,'owned','owned once');
 eq(r.badges.sort(),['camp','clinic','pro'],'badges');eq(r.sets.sort(),['doubles','pro','scoring'],'challenge sets');if(!r.edition)f.push('kit edition records the barrel');
 eq(r.poor,'bank','not enough cash refused');eq(r.rt,true,'save round-trip keeps purchases');eq(r.same,true,'throw unchanged after buying everything');
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 console.log(JSON.stringify(r).slice(0,900));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log('PASS: shut below DPNZ; DPNZ catalogue 2k/6k/15k/3k/8k; owned once; cash checked; gated kit asks first, force buys; badges, sets, edition recorded; round-trip; throw unchanged');})();
