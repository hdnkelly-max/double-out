// TOPS player calibration sim (Overseer directive 4, rule 11). Replays each tester's REAL career darts from Supabase
// `tops_darts` (timing error dt_ms, lock point relative to aim, nerves; as quantiles in tests/sim-player-profiles.json)
// through the game's own throw model (throwParams inside a real career match, landFrom, scoreAt, aimFor) with adjustable knobs,
// and plays best-of-3 501 against each tier's field (opponents built by nextOpponent, thrown like sim-ai.js).
// Reports per tester and tier: simulated 3-dart average, perfect-release rate, and win rate.
// usage: [STARTER=1] node tests/sim-player.js [legs=300] [knobs JSON]   e.g. '{"kP":0.6,"kS":1.15,"kA":1.2}'
//   kP  perfect window (ms) multiplier        kS  base scatter s0 multiplier (perfect and near-perfect darts)
//   kR  outer ring R0 multiplier (bad timing) kA  sway: lock offset from aim multiplier
//   kD  ms-to-tightest multiplier (timing penalty curve: lower = steeper)
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const LEGS=+process.argv[2]||300;const K=Object.assign({kP:1,kS:1,kR:1,kA:1,kD:1},process.argv[3]?JSON.parse(process.argv[3]):{});
const STARTER=!!process.env.STARTER;const REC=!!process.env.REC;const LAND=!!process.env.LAND;const JOINT=!!process.env.JOINT; // JOINT=1: sample whole real darts (timing, lock offset and nerves together) from tests/sim-player-joint.json where a tester has them
const JD=JSON.parse(fs.readFileSync(path.resolve(__dirname,'sim-player-joint.json'),'utf8'));Object.keys(JD).forEach(k=>{if(k!=='note')JD[k]=JD[k].split(',').map(r=>r.trim().split(' ').map(Number));});
 // LAND=1: replay the testers' real landing offsets from aim directly (checks aiming and scoring, bypasses the throw model)
 // REC=1: window and s0 as recorded on the testers' own pub darts (validates the model, tier 0 only)
 // STARTER=1: every tester's real timing at starter stats (20s) and starter kit
const PROF=JSON.parse(fs.readFileSync(process.env.PROFILES||path.resolve(__dirname,'sim-player-profiles.json'),'utf8')); // PROFILES=file: alternative profiles (e.g. one tester at different stats/kit)
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const res=await p.evaluate(({LEGS,K,PROF,STARTER,REC,LAND,JOINT,JD})=>{save.authSeen=true;$('login').hidden=true;V.walkOn=()=>{};delete save.diff;
  const smp=q=>{const u=Math.random()*(q.length-1);const i=Math.floor(u);return q[i]+(q[i+1]-q[i])*(u-i);};
  // the field at tier t (default setting), through the game's own opponent pipeline
  const field=t=>{newCareer();const c=career();c.tier=t;c.stage=null;c.season=null;const a=[];for(let k=0;k<30;k++){c.next=null;const n=nextOpponent();if(n&&n.oppAvg>0)a.push(n.oppAvg);}return a;};
  // base throw parameters for a player at tier t: a real career match, so every live wrapper (v09 career window etc.) applies
  // stats (st2.v), barrel and setup as the tester has them now; nerves held at 0 here because each replayed dart brings its own
  const baseTp=(t,pr,st)=>{newCareer();save.arm=pr.arm;const c=career();c.tier=t;c.stage=null;
   const s2=save.st2||(window.TOPS_ST2&&TOPS_ST2(),save.st2);if(save.st2)save.st2.v=Object.assign({},st||pr.st2v);
   save.owned=Array.from(new Set((save.owned||[]).concat(pr.barrel)));save.barrel=pr.barrel;save.setup=Object.assign({},pr.setup);
   beginMatch({mode:'career',tier:t,p0:'P',oppName:'X',oppAvg:50,legs:1});S.adren=0;S.calm=99;
   const en=effNerves;effNerves=()=>0;let tp;try{tp=Object.assign({},throwParams());}finally{effNerves=en;}try{S.done=true;}catch(e){}return tp;};
  const one=(tp0,pr)=>{const jd=JOINT&&JD[pr.jd||pr.who];const row=jd?jd[Math.floor(Math.random()*jd.length)]:null;const nv=row?row[3]:smp(pr.nvq);const tp={P:tp0.P*K.kP*(REC?1:(1-.3*Math.min(1,nv/2))),/* REC: the recorded window already includes nerves */s0:tp0.s0*K.kS,D:tp0.D*K.kD*(1-.08*Math.min(1,nv)),R0:tp0.R0*K.kR*(1+.1*nv),kv:(tp0.kv||1)*(1+.1*nv)};
   if(row)return {tp,dt:row[0],lx:row[1]*K.kA,ly:row[2]*K.kA};const dt=smp(pr.dtq);return {tp,dt,lx:smp(pr.lxq)*K.kA,ly:smp(pr.lyq)*K.kA};};
  // a 501 leg for the player: real dart samples, game aiming and scoring; returns darts used and points
  const _t=targetPoint('T20');var tg0x=_t.x,tg0y=_t.y;const DBG=window.__DBG=window.__DBG||{pf:[],np:[],la:[],sp:0,sn:0,t20:0,dx:[],dy:[]};const pLeg=(tp0,pr)=>{let sc=501,darts=0,pts=0,perf=0;for(let v=0;v<40&&sc>0;v++){const st=sc;let vis=0,bust=false;
    for(let d=1;d<=3;d++){const lbl=aimFor(sc,4-d);const tg=targetPoint(lbl);const o=one(tp0,pr);const l=LAND?{x:tg.x+smp(pr.landxq),y:tg.y+smp(pr.landyq)}:landFrom({x:tg.x+o.lx,y:tg.y+o.ly},o.tp,o.dt);if(Math.abs(o.dt)<=o.tp.P)perf++;{const r=Math.hypot(l.x-tg.x,l.y-tg.y);(Math.abs(o.dt)<=o.tp.P?DBG.pf:DBG.np).push(r);DBG.la.push(Math.hypot(o.lx,o.ly));}
     const h=scoreAt(l.x,l.y);darts++;DBG.rn=(DBG.rn||0)+1;DBG.rp=(DBG.rp||0)+h.v;if(sc>=200){DBG.sn++;DBG.sp+=h.v;if(h.label==='T20')DBG.t20++;DBG.dx.push(Math.abs(l.x-tg.x));DBG.dy.push(Math.abs(l.y-tg.y));}const ns=sc-h.v;if(ns<0||ns===1||(ns===0&&!h.dbl)){bust=true;break;}sc=ns;vis+=h.v;if(sc===0)break;}
    if(bust){sc=st;vis=0;}pts+=vis;}return {darts:sc===0?darts:999,used:darts,pts,perf};};
  const aiLeg=(avg,t)=>{let sc=501,darts=0;const base=aiBaseSigma(avg,t);for(let v=0;v<40&&sc>0;v++){const st=sc;let bust=false;for(let d=1;d<=3;d++){const lbl=aimFor(sc,4-d);const tg=targetPoint(lbl);const h=scoreAt(tg.x+gauss()*base,tg.y+gauss()*base);darts++;const ns=sc-h.v;if(ns<0||ns===1||(ns===0&&!h.dbl)){bust=true;break;}sc=ns;if(sc===0)break;}if(bust)sc=st;}return sc===0?darts:999;};
  const out=[];
  for(const pr of PROF){if(JOINT&&!JD[pr.jd||pr.who])continue;for(let t=0;t<=2;t++){const tp0=STARTER?baseTp(t,Object.assign({},pr,{arm:0,barrel:'assassin',setup:{point:'std',shaft:'med',flight:'standard'}}),{sc:20,fi:20,ct:20,rh:20,co:20}):baseTp(t,pr,pr.st2v);if(REC||LAND){if(t>0)continue;tp0.P=pr.rec.P;tp0.s0=pr.rec.s0;}const fl=field(t);let used=0,pts=0,perf=0,won=0;
    for(let m=0;m<LEGS;m++){const opp=fl[m%fl.length];let lw=0,lo=0,first=m%2===0;
     while(lw<2&&lo<2){const a=pLeg(tp0,pr),o=aiLeg(opp,t);used+=a.used;pts+=a.pts;perf+=a.perf;const pv=Math.ceil(a.darts/3),ov=Math.ceil(o/3);if(pv<ov||(pv===ov&&first))lw++;else lo++;first=!first;}
     if(lw===2)won++;}
    const md=a=>{const b=a.slice().sort((x,y)=>x-y);return b.length?+b[b.length>>1].toFixed(1):0;};const dbg={pf:md(DBG.pf),np:md(DBG.np),la:md(DBG.la),sc:+(3*DBG.sp/DBG.sn).toFixed(1),t20:+(100*DBG.t20/DBG.sn).toFixed(1),dx:md(DBG.dx),dy:md(DBG.dy),raw:+(3*DBG.rp/DBG.rn).toFixed(1),ax:+tg0x.toFixed(1),ay:+tg0y.toFixed(1)};Object.assign(DBG,{rp:0,rn:0,pf:[],np:[],la:[],sp:0,sn:0,t20:0,dx:[],dy:[]});out.push({dbg,who:pr.who,from:pr.from,tier:t,P:+tp0.P.toFixed(1),s0:+tp0.s0.toFixed(1),avg:+(pts/used*3).toFixed(1),perf:+(perf/used*100).toFixed(1),win:+(won/LEGS*100).toFixed(1),field:Math.round(fl.reduce((s,x)=>s+x,0)/fl.length)});}}
  return out;},{LEGS,K,PROF,STARTER,REC,LAND,JOINT,JD});
 await b.close();
 const pad=(s,n)=>String(s).padEnd(n);console.log((REC?'RECORDED window + s0 (validation) · ':'')+(STARTER?'STARTER stats + kit · ':'testers\' own stats + kit · ')+'knobs '+JSON.stringify(K)+' · '+LEGS+' best-of-3 matches per cell');
 console.log(pad('tester (data)',24)+pad('tier',6)+pad('window',8)+pad('s0',6)+pad('sim avg',9)+pad('perfect%',10)+pad('win%',7)+'field avg');
 res.forEach(r=>console.log(pad(r.who+' ('+r.from+')',24)+pad(r.tier,6)+pad(r.P,8)+pad(r.s0,6)+pad(r.avg,9)+pad(r.perf,10)+pad(r.win,7)+r.field+'  med land-aim perfect '+r.dbg.pf+' other '+r.dbg.np+' lock-aim '+r.dbg.la+' | telemetry-style avg (bust darts keep points) '+r.dbg.raw+' | scoring phase avg '+r.dbg.sc+' T20% '+r.dbg.t20+' dx '+r.dbg.dx+' dy '+r.dbg.dy+' T20 aim '+r.dbg.ax+','+r.dbg.ay));
})();
