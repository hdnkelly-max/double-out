// ECON-M2 S1 (Hayden 21:41): DPNZ+ contracts are a season pool of three (attainable · stretch · demanding) paying 1 · 1.5 · 2.5 × 0.75 of the
// tier's contract value, each once a season, paid at the mid-season check and at season end; below DPNZ unchanged; an in-flight DPNZ season
// keeps the old contracts until the next season; save round-trip keeps the pool.
// usage: node tests/econ-pool.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{const out={};save.authSeen=true;save.name='Tester';$('login').hidden=true;
  const fresh=t=>{newCareer();const c=career();c.tier=t;c.stage=null;c.season=null;c.next=null;C3.V3();newSeason(c);return c;};
  // 1 below DPNZ: drip contracts, unchanged pay
  {const c=fresh(2);C3.fillContracts();const v=c.v3;out.reg={n:v.con.length,cash:v.con.map(k=>k.cash),pool:!!v.cpool};}
  // 2 DPNZ fresh season: pool of three
  {const c=fresh(3);C3.fillContracts();const v=c.v3;out.dpnz={con:v.con.length,live:C3.poolLive(),items:v.cpool&&v.cpool.items.map(k=>[k.g,k.id,k.n,k.cash,k.st])};
   // 3 payouts: meet the attainable one in week 2 (nothing paid), mid-season pays it once, season end pays the demanding one once
   const sn=c.season;const half=Math.ceil(sn.len/2);const bank0=c.bank;const P=v.cpool;const pass=k=>({won:true,tons:99,maxV:180,n180:3,maxCo:170,bestLeg:9,perf:99,avg:120,opLegs:0});
   const meet=i=>{P.items.forEach((k,j)=>{if(j!==i&&k.st==='open')k._hold=k.st;});const m=pass();/* only item i passes: make the others fail by making m fail theirs */return m;};
   sn.week=2;const m0={won:false,tons:0,maxV:0,n180:0,maxCo:0,bestLeg:99,perf:0,avg:0,opLegs:3};
   const T0=P.items[0];const mm=Object.assign({},m0);if(T0.id==='tons')mm.tons=99;if(T0.id==='v140')mm.maxV=180;if(T0.id==='co')mm.maxCo=170;if(T0.id==='leg')mm.bestLeg=9;if(T0.id==='perf')mm.perf=99;if(T0.id==='avg')mm.avg=120;if(T0.id==='clean'){mm.won=true;mm.opLegs=0;}if(T0.id==='t180')mm.n180=1;
   let paid=C3._poolAfter(mm);out.wk2={st:P.items.map(k=>k.st),bank:c.bank-bank0,paid:paid.length};
   paid=C3._poolAfter(m0);out.wk2b={paid:paid.length};
   sn.week=half+1;paid=C3._poolAfter(m0);out.mid={st:P.items.map(k=>k.st),bank:c.bank-bank0,paid:paid.map(k=>k.cash)};
   sn.week=half+2;paid=C3._poolAfter(m0);out.mid2={paid:paid.length};
   const T2=P.items[2];const m2=Object.assign({},m0);if(T2.id==='tons')m2.tons=99;if(T2.id==='co')m2.maxCo=170;if(T2.id==='leg')m2.bestLeg=9;if(T2.id==='perf')m2.perf=99;if(T2.id==='avg')m2.avg=150;
   sn.week=half+3;paid=C3._poolAfter(m2);out.late={st:P.items.map(k=>k.st),paid:paid.length};
   sn.done=true;paid=C3._poolAfter(m0);out.end={st:P.items.map(k=>k.st),bank:c.bank-bank0,paid:paid.map(k=>k.cash)};
   paid=C3._poolAfter(m2);out.end2={paid:paid.length,bank:c.bank-bank0};
   // the list the screens show
   out.list=C3.conList().map(k=>k.t+' | '+k.from);
   // 5 save round-trip (cloud adopt is a JSON copy of the save)
   const key=P.key;const copy=JSON.parse(JSON.stringify(save));Object.assign(save,copy);out.rt={key:career().v3.cpool&&career().v3.cpool.key===key,items:career().v3.cpool&&career().v3.cpool.items.length};
   // 6 next season at T-T (promotion): a new pool at the new tier
   {const c=career();c.season.done=true;c.tier=4;newSeason(c);C3.fillContracts();out.tt={live:C3.poolLive(),cash:c.v3.cpool.items.map(k=>k.cash),st:c.v3.cpool.items.map(k=>k.st)};}}
  // 4 in-flight DPNZ season (week 5, drip contracts in hand, never seen by this version): stays on drip until next season
  {newCareer();const c=career();c.tier=2;c.stage=null;c.season=null;C3.V3();newSeason(c);C3.fillContracts();const drip=c.v3.con.map(k=>k.id).join();
   c.tier=3;newSeason(c);c.season.week=5;c.season.results=[{},{},{},{}];delete c.v3.cpool;delete c.v3.cpLegacy;c.v3.con=c.v3.con.slice(0,2);C3.fillContracts();
   out.legacy={pool:!!c.v3.cpool,con:c.v3.con.length,cash:c.v3.con.map(k=>k.cash)};
   c.season.done=true;newSeason(c);C3.fillContracts();out.legacyNext={live:C3.poolLive(),con:c.v3.con.length};}
  // 7 the real match path at DPNZ: a fixture through beginMatch/endMatch/careerAfterMatch runs the pool without errors
  {newCareer();const c=career();c.tier=3;c.stage=null;c.season=null;c.next=null;C3.V3();newSeason(c);C3.fillContracts();const n=nextOpponent();c.next=n;
   try{beginMatch({mode:'career',tier:3,p0:'Tester',oppName:n.oppName,oppKey:n.oppKey,oppAvg:n.oppAvg,legs:3,start:501});S.p[0].legs=2;S.p[1].legs=0;S.won=true;endMatch();out.real={week:c.season.week,live:C3.poolLive(),st:c.v3.cpool.items.map(k=>k.st),con:c.v3.con.length};}catch(e){out.real={err:e.message};}}
  // 8 the last fixture of the season through the real path: a contract met earlier pays at that match's end, before any new season (ChatGPT P1)
  {newCareer();const c=career();c.tier=3;c.stage=null;c.season=null;c.next=null;C3.V3();newSeason(c);C3.fillContracts();const sn=c.season;const P=c.v3.cpool;P.mid=true;P.items[1].st='met';sn.week=sn.len;
   const bank0=c.bank;const n=nextOpponent();c.next=n;try{beginMatch({mode:'career',tier:3,p0:'Tester',oppName:n.oppName,oppKey:n.oppKey,oppAvg:n.oppAvg,legs:3,start:501});S.p[0].legs=0;S.p[1].legs=2;S.won=false;endMatch();
    out.last={done:sn.done,same:c.season===sn,st:P.items.map(k=>k.st),gain:c.bank-bank0,cash:P.items[1].cash};}catch(e){out.last={err:e.message};}}
  return out;});
 const f=[];const eq=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))f.push(m+': '+JSON.stringify(a)+' want '+JSON.stringify(b));};
 eq(r.reg.n,3,'Regional drip contracts');eq(r.reg.cash,[120,120,120],'Regional contract pay');eq(r.reg.pool,false,'Regional has no pool');
 eq(r.dpnz.con,0,'DPNZ drip contracts');eq(r.dpnz.live,true,'DPNZ pool live');eq(r.dpnz.items&&r.dpnz.items.map(x=>x[3]),[263,394,656],'DPNZ pool pay');eq(r.dpnz.items&&r.dpnz.items.map(x=>x[0]),['Attainable','Stretch','Demanding'],'grades');
 if(r.dpnz.items&&new Set(r.dpnz.items.map(x=>x[1])).size!==3)f.push('pool repeats a contract type');
 eq(r.wk2.bank,0,'met in week 2 pays nothing yet');eq(r.wk2.st[0],'met','attainable met');eq(r.wk2b.paid,0,'no double meet');
 eq(r.mid.paid,[263],'mid-season pays the met one');eq(r.mid2.paid,0,'mid-season pays once');
 eq(r.late.st[2],'met','demanding met after mid-season');eq(r.late.paid,0,'nothing paid between checks');
 eq(r.end.paid,[656],'season end pays the rest');eq(r.end.bank,263+656,'season total');eq(r.end2.paid,0,'season end pays once');eq(r.end2.bank,263+656,'no more pay after the end');
 eq(r.rt,{key:true,items:3},'save round-trip keeps the pool');
 eq(r.tt.live,true,'T-T pool live');eq(r.tt.cash,[750,1125,1875],'T-T pool pay');eq(r.tt.st,['open','open','open'],'new pool open');
 eq(r.legacy.pool,false,'in-flight DPNZ season: no pool yet');eq(r.legacy.con,3,'in-flight DPNZ season keeps drip contracts');eq(r.legacyNext.live,true,'next season: pool');eq(r.legacyNext.con,0,'next season: no drip');
 if(!r.last||r.last.err||!r.last.done||r.last.st[1]!=='paid'||r.last.gain<r.last.cash)f.push('last fixture pays the met contract at season end: '+JSON.stringify(r.last));
 if(!r.real||r.real.err||r.real.week!==2||!r.real.live||r.real.con!==0)f.push('real DPNZ fixture path: '+JSON.stringify(r.real));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 console.log(JSON.stringify(r).slice(0,1500));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log('PASS: Regional unchanged; DPNZ pool 263/394/656, T-T 750/1125/1875; met contracts pay once at mid-season or season end; in-flight season keeps drip until the next; save round-trip keeps the pool');})();
