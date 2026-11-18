// CAR-TOP (Hayden 22:21-22:26): the throw gets harder by career STAGE (game4 THROW_TUNE.stage), perfects land where you aimed, and near-misses grow smoothly.
// Checks, in a real career match (nerves 0, no traits):
//   1 each tier's window = the Rhythm window x THROW_TUNE.stage[tier].win, its cone = .cone/.ex (one table drives it)
//   1b the pull length (tp.D, time to the tightest ring) is the 3.54 value on every tier (Q&D 23:19 P0: car-top2 overwrote it), and a real
//      held release at that hold time scores Perfect at Pub and at Worlds
//   2 buying Rhythm never hurts: on every tier the window grows with Rhythm and the cone does not move
//   3 a higher stage is never easier: window multiplier and cone ms never grow tier on tier
//   4 a perfect release lands where you aimed: dead-centre T20 lock, perfect timing -> T20 >= 93% at max stats (Worlds) and >= 75% at starter stats (Pub)
//   5 no cliff at the window edge: the miss ring starts exactly at the perfect scatter, 1 ms outside keeps >= 70% of the perfect T20 rate at Worlds
//     and >= 80% on every tier,
//     and the ring grows steadily with the timing error (early and late)
//   6 off-career play is untouched by the stage table (cone from the level table TT)
//   7 the Rhythm card shows the window this stage really gives (Q&D P2)
// usage: node tests/car-top.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{if(typeof THROW_TUNE==='undefined')return {err:'THROW_TUNE missing'};const ST=THROW_TUNE.stage,PK=THROW_TUNE.perfK;
  save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.run=null;
  const tpAt=(tier,v,rh)=>{c.tier=tier;save.st2=save.st2||(window.TOPS_st&&TOPS_st());save.st2.v={sc:v,fi:v,ct:v,rh:rh==null?v:rh,co:v};save.st2.trait=null;save.barrel='assassin';save.setup={point:'std',shaft:'med',flight:'standard'};save.arm=0;
   beginMatch({mode:'career',tier,p0:'P',oppName:'X',oppAvg:50,legs:1});S.aim=targetPoint('T20');S.adren=0;S.calm=99;const en=effNerves;effNerves=()=>0;let tp;try{tp=Object.assign({},throwParams());}finally{effNerves=en;}
   const ti=TIERS.indexOf(S.tier);return {tp,ti};};
  const t20=(tp,dt,n)=>{const lock={x:S.aim.x,y:S.aim.y};let h=0;for(let i=0;i<n;i++){const l=landFrom(lock,tp,dt);if(scoreAt(l.x,l.y).label==='T20')h++;}return h/n;};
  const out={tiers:[],rh:[],t20:{},cliff:{},grow:{}};
  const base=tpAt(0,95).tp.P;
  for(let t=0;t<ST.length;t++){const {tp,ti}=tpAt(t,95);out.tiers.push({t,ti,P:+tp.P.toFixed(3),ratio:+(tp.P/base).toFixed(4),want:ST[t][0],D:+tp.cone.toFixed(3),wantD:ST[t][1],ex:tp.ex,wantEx:ST[t][2],pull:+tp.D.toFixed(3),pullWant:+ttAt(1).D.toFixed(3)});
   const rows=[20,58,95].map(rh=>{const q=tpAt(t,60,rh).tp;return {rh,P:+q.P.toFixed(3),D:+q.cone.toFixed(3),ex:q.ex};});out.rh.push({t,rows});}
  {const {tp}=tpAt(6,95);S.done=false;out.t20.top=t20(tp,0,20000);out.t20.topSigma=+(tp.s0*PK).toFixed(2);
   const r0=ringR(tp.P,tp),rIn=ringR(tp.P*.5,tp);out.cliff={start:+r0.toFixed(3),perfectRing:+(PK*1.794*tp.s0).toFixed(3),inside:+rIn.toFixed(3),early1:t20(tp,-(tp.P+1),20000),late1:t20(tp,tp.P+1,20000)};
   const g=s=>[1,2,3,5,8,12,20,40].map(e=>+ringR(s*(tp.P+e),tp).toFixed(2));out.grow={early:g(-1),late:g(1)};}
  {const {tp}=tpAt(0,20);out.t20.pub=t20(tp,0,20000);}
  out.edge=[];for(let t=0;t<ST.length;t++){const {tp}=tpAt(t,95);S.done=false;const pf=t20(tp,0,8000);out.edge.push({t,pf:+pf.toFixed(3),early:+t20(tp,-(tp.P+1),8000).toFixed(3),late:+t20(tp,tp.P+1,8000).toFixed(3)});}
  // off-career: on() is false when the career has a run (v09); the cone then comes from TT (nerves 0)
  {c.tier=6;beginMatch({mode:'career',tier:6,p0:'P',oppName:'X',oppAvg:50,legs:1});c.run={};const en=effNerves;effNerves=()=>0;let tp;try{tp=Object.assign({},throwParams());}finally{effNerves=en;c.run=null;}out.off={D:+tp.D.toFixed(3),want:+ttAt(tp.L).D.toFixed(3),ex:tp.ex===undefined?null:tp.ex,cone:tp.cone===undefined?null:tp.cone};}
  // Rhythm card on a tough stage vs the pub (Q&D P2)
  {c.tier=6;out.card6=TOPS_FXLINE('rh',60,61);c.tier=0;out.card0=TOPS_FXLINE('rh',60,61);out.w6=+(TOPS_WIN(Math.max(0,Math.min(1,(60+((window.TOPS_kitPts?TOPS_kitPts().rh:0)||0)-20)/75)))*ST[6][0]).toFixed(1);}
  S.done=true;return out;});
 if(!r.err)r.held=[];for(const tier of [0,6]){if(r.err)break;const h=await p.evaluate(async(tier)=>{try{const c=career();c.tier=tier;c.run=null;save.st2.v={sc:95,fi:95,ct:95,rh:95,co:95};save.st2.trait=null;save.inputOffsetMs=0;
   beginMatch({mode:'career',tier,p0:'P',oppName:'X',oppAvg:50,legs:1});await new Promise(r=>setTimeout(r,300));S.aim=targetPoint('T20');S.bull=null;/* skip the bull-off for order */S.busy=false;S.view=0;S.breathe=false;S.noPullUntil=0;S.cur=0;S.over=false;S.adren=0;S.calm=99;
   const en=effNerves,vw=V.walking;effNerves=()=>0;V.walking=()=>false;let out;try{startPull('key');if(!S.pulling)return {t:tier,err:'pull did not start'};const t0=S.pullStart,D=S.lockTp.D,P=S.lockTp.P,pullMs=S.pullMs;
    while(performance.now()-t0<D){}release(undefined,'key');const held=performance.now()-t0;const err_ms=S.relMs;out={t:tier,held,err_ms,P,pullMs,wantD:+ttAt(1).D.toFixed(3),perfect:S.perfect===true&&S.lastTiming==='Perfect'};}finally{effNerves=en;V.walking=vw;}S.done=true;return out;}catch(e){return {t:tier,err:String(e&&e.message||e)};}},tier);r.held.push(h);}
 const f=[];if(r.err)f.push(r.err);else{
  r.tiers.forEach(x=>{if(x.ti!==x.t)f.push(`tier ${x.t}: match ran on tier index ${x.ti}`);if(Math.abs(x.ratio-x.want)>.002)f.push(`tier ${x.t}: window x${x.ratio}, want x${x.want}`);if(Math.abs(x.D-x.wantD)>.01||x.ex!==x.wantEx)f.push(`tier ${x.t}: cone ${x.D}/${x.ex}, want ${x.wantD}/${x.wantEx}`);});
  r.rh.forEach(({t,rows})=>{if(!(rows[0].P<rows[1].P&&rows[1].P<rows[2].P))f.push(`tier ${t}: window does not grow with Rhythm `+JSON.stringify(rows));if(new Set(rows.map(x=>x.D+'/'+x.ex)).size!==1)f.push(`tier ${t}: Rhythm moves the cone `+JSON.stringify(rows));});
  for(let t=1;t<r.tiers.length;t++){const a=r.tiers[t-1],c=r.tiers[t];if(c.want>a.want||c.wantD>a.wantD)f.push(`tier ${t} is easier than tier ${t-1}`);}
  if(r.t20.top<.93)f.push(`perfect from a dead-centre T20 lock at max stats: T20 ${(100*r.t20.top).toFixed(1)}%, want >= 93%`);
  if(r.t20.pub<.75)f.push(`perfect at starter stats: T20 ${(100*r.t20.pub).toFixed(1)}%, want >= 75%`);
  if(Math.abs(r.cliff.start-r.cliff.perfectRing)>.01||Math.abs(r.cliff.inside-r.cliff.perfectRing)>.01)f.push('miss ring does not start at the perfect scatter '+JSON.stringify(r.cliff));
  if(r.cliff.early1<.7*r.t20.top||r.cliff.late1<.7*r.t20.top)f.push(`cliff: 1 ms outside the window T20 ${(100*r.cliff.early1).toFixed(0)}% early / ${(100*r.cliff.late1).toFixed(0)}% late vs perfect ${(100*r.t20.top).toFixed(0)}%`);
  r.edge.forEach(x=>{if(x.early<.8*x.pf||x.late<.8*x.pf)f.push(`tier ${x.t}: cliff at the window edge, 1 ms outside T20 ${(100*x.early).toFixed(0)}%/${(100*x.late).toFixed(0)}% vs perfect ${(100*x.pf).toFixed(0)}%`);});
  ['early','late'].forEach(k=>{const a=r.grow[k];for(let i=1;i<a.length;i++)if(!(a[i]>a[i-1]))f.push(`${k} misses do not grow steadily: `+a.join(','));});
  if(Math.abs(r.off.D-r.off.want)>.01||r.off.ex!==null||r.off.cone!==null)f.push('off-career throw uses the stage table '+JSON.stringify(r.off));
  r.tiers.forEach(x=>{if(Math.abs(x.pull-x.pullWant)>.01)f.push(`tier ${x.t}: pull length (time to the tightest ring) ${x.pull} ms, want ${x.pullWant} (3.54)`);});
  r.held.forEach(h=>{if(h.err)f.push(`held release on tier ${h.t}: ${h.err}`);else{if(Math.abs(h.pullMs*0.68-h.wantD)>1)f.push(`tier ${h.t}: time to the tightest ring ${(h.pullMs*0.68).toFixed(0)} ms, want ${h.wantD}`);if(!h.perfect)f.push(`tier ${h.t}: a release held ${h.held.toFixed(0)} ms (the ideal hold) missed Perfect: off by ${h.err_ms.toFixed(1)} ms, window ${h.P.toFixed(1)}`);}});
  if(!String(r.card6).includes(String(r.w6))||!/here/.test(r.card6))f.push(`Rhythm card at Worlds "${r.card6}" does not show this stage's window (${r.w6} ms)`);
  if(/here/.test(r.card0))f.push(`Rhythm card in the pub "${r.card0}" should be the plain line`);}
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 console.log(JSON.stringify(r));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log(`PASS: pull length unchanged on every tier (${r.tiers[0].pull} ms) and a held release at the ideal hold is Perfect at Pub and Worlds (off ${r.held.map(h=>h.err_ms.toFixed(1)).join(' / ')} ms); Rhythm card at Worlds: "${r.card6}"; stage table drives window x${r.tiers.map(x=>x.want).join('/')} and cone ${r.tiers.map(x=>x.wantD).join('/')} ms by tier; Rhythm always widens the window and never moves the cone; higher stages never easier; perfect from a dead-centre T20 lock: T20 ${(100*r.t20.top).toFixed(1)}% at max (Worlds), ${(100*r.t20.pub).toFixed(1)}% at starter (Pub); miss ring starts at the perfect scatter, 1 ms outside keeps T20 ${(100*r.cliff.early1).toFixed(0)}%/${(100*r.cliff.late1).toFixed(0)}% (early/late), grows steadily; off-career untouched`);
})();
