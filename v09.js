<style>
/* ===== v0.9 stat progression ===== */
.st2c{display:flex;flex-direction:column;gap:10px}
.st2h{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.st2h .ovr{font:800 44px/.9 "Barlow Condensed",sans-serif;color:#EDECE5;letter-spacing:-.01em}
.st2h .ovr small{font:700 11px/1 Manrope,sans-serif;letter-spacing:.08em;color:#9fa8a8;margin-right:6px;text-transform:uppercase}
.st2h .idn{font:700 13px/1.2 Manrope,sans-serif;color:#C6F36B;text-align:right}
.st2h .idn span{display:block;color:#9fa8a8;font-weight:600;font-size:11px}
.st2r{display:grid;grid-template-columns:86px 1fr 62px;gap:8px;align-items:center}
.st2r b{font:700 13px/1.1 Manrope,sans-serif;color:#EDECE5;display:flex;align-items:center;gap:4px}
.st2r .num{font:800 20px/1 "Barlow Condensed",sans-serif;color:#EDECE5;text-align:right;white-space:nowrap}
.st2r .num i{font:600 11px/1 Manrope,sans-serif;font-style:normal;color:#7fb6ff;margin-left:2px}
.st2r .num i.neg{color:#ff7a6b}
.st2bar{position:relative;height:12px;border-radius:6px;background:rgba(237,236,229,.07);overflow:hidden}
.st2bar .base{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(237,236,229,.10)}
.st2bar .me{position:absolute;top:0;bottom:0;background:#C6F36B}
.st2bar .kb{position:absolute;top:0;bottom:0;background:#5f9fe8}
.st2big{margin:-4px -4px 10px;border-radius:10px;background:radial-gradient(ellipse at 50% 55%,rgba(198,243,107,.10),rgba(0,0,0,0) 70%),#0d1214;padding:8px 0;animation:st2zoom .28s cubic-bezier(.2,.9,.3,1.2)}.st2big img{display:block;width:100%;height:auto;aspect-ratio:768/240;object-fit:contain;filter:drop-shadow(0 6px 10px rgba(0,0,0,.6))}@keyframes st2zoom{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.st2bar .pen{position:absolute;top:0;bottom:0;background:repeating-linear-gradient(135deg,#e2362f 0 3px,rgba(226,54,47,.45) 3px 6px)}
.st2bar .hot{position:absolute;top:0;bottom:0;background:#ffb13b}
.st2bar .gain{position:absolute;top:0;bottom:0;background:rgba(198,243,107,.35);outline:1px dashed #C6F36B;outline-offset:-1px}
.st2bar .cap{position:absolute;top:-2px;bottom:-2px;width:2px;background:#EDECE5;opacity:.55}
.st2fm{grid-column:2/4;height:3px;border-radius:2px;background:rgba(237,236,229,.06);overflow:hidden;margin-top:-4px}
.st2fm i{display:block;height:100%;background:#ffb13b}
.st2key{display:flex;flex-wrap:wrap;gap:10px;font:600 11px/1.2 Manrope,sans-serif;color:#9fa8a8}
.st2key i{display:inline-block;width:10px;height:6px;border-radius:2px;margin-right:4px;vertical-align:middle}
.st2act{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.st2act button{min-height:44px;border-radius:10px;font:700 13px/1.1 Manrope,sans-serif}
.st2pts{background:#C6F36B;color:#10191A;border:0}
.st2tr{display:flex;flex-direction:column;gap:6px}
.st2t{display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:10px 12px;border-radius:10px;background:rgba(237,236,229,.04);border:1px solid rgba(237,236,229,.08);text-align:left;color:#EDECE5}
.st2t b{font:700 14px/1.2 Manrope,sans-serif}
.st2t small{grid-column:1/3;font:500 12px/1.35 Manrope,sans-serif;color:#b9c0bf}
.st2t em{font:700 11px/1.2 Manrope,sans-serif;font-style:normal;color:#9fa8a8;align-self:center}
.st2t.on{border-color:#C6F36B;background:rgba(198,243,107,.08)}.st2t.on em{color:#C6F36B}
.st2t.lock{opacity:.5}
/* pick screen */
#perk.st2p .panel{max-width:520px}
#perkCards.st2host{display:block!important;grid-template-columns:none!important}
.st2pick{display:flex;flex-direction:column;gap:10px}
.st2o{display:grid;grid-template-columns:1fr auto;gap:6px 10px;padding:12px 14px;border-radius:12px;text-align:left;color:#EDECE5;background:linear-gradient(155deg,#263335,#192426 75%);border:1px solid rgba(237,236,229,.11)}
.st2o .t{font:800 20px/1 "Barlow Condensed",sans-serif;letter-spacing:.02em;text-transform:uppercase;display:flex;gap:6px;align-items:center}
.st2o .g{font:800 24px/1 "Barlow Condensed",sans-serif;color:#C6F36B;text-align:right}
.st2o .g small{display:block;font:600 10px/1.2 Manrope,sans-serif;color:#ffb13b}
.st2o .st2bar{grid-column:1/3}
.st2o .fx{grid-column:1/3;font:500 12px/1.3 Manrope,sans-serif;color:#b9c0bf}
.st2o.fl{border-color:#ffb13b;box-shadow:0 0 0 1px rgba(255,177,59,.35)}
.st2o.capd{opacity:.45}
.st2o.taken{border-color:#C6F36B;transform:scale(1.02);transition:transform .2s}
.st2lit{display:flex;flex-wrap:wrap;gap:6px}
.st2lit span{padding:6px 10px;border-radius:999px;background:rgba(255,177,59,.12);color:#ffcf85;font:700 12px/1.1 Manrope,sans-serif}
body.st2on #resAttrs{display:none}
body.st2on #plAttrs,body.st2on #plPerks{display:none}
body.st2on #plAttrs:not(:empty)+*{display:none}
.kitpts{display:block;color:#C6F36B;font-weight:700;margin-top:2px}
.kitpts .neg{color:#ff7a6b}
</style>
<script>
/* ===== v0.9: career progression is five stats. Points from levels, form from play, kit on top, one signature trait ===== */
(function(){
const STATS=[
 {id:'sc',n:'Scoring',w:.30,t:'Power Scorer',fx:'Tightest group on trebles and singles'},
 {id:'fi',n:'Finishing',w:.25,t:'The Finisher',fx:'Tightest group on doubles and bull'},
 {id:'ct',n:'Control',w:.20,t:'Rock Steady',fx:'Sway size and speed'},
 {id:'rh',n:'Rhythm',w:.15,t:'Smooth Operator',fx:'Perfect-release window and hand tremor'},
 {id:'co',n:'Composure',w:.10,t:'Ice Cold',fx:'How much pressure and heart rate get to you'}];
const SN=id=>STATS.find(s=>s.id===id).n;
const CAPS=[40,50,60,68,75,80];
const TRAITS=[
 {id:'heavy',n:'Heavy Scorer',s:'First dart of each visit groups 4% tighter.',feat:'f_180',st:'sc',need:50},
 {id:'machine',n:'Treble Machine',s:'2nd and 3rd dart into the same treble group 6% tighter.',feat:'f_tons5',st:'sc',need:65},
 {id:'bull',n:'Bull Specialist',s:'Bull groups 12% tighter.',feat:'f_bullout',st:'fi',need:40},
 {id:'artist',n:'Checkout Artist',s:'Doubles 8% tighter on finishes of 100 or less.',feat:'f_co100',st:'fi',need:55},
 {id:'steady',n:'Steady Hand',s:'Sway no longer speeds up as your heart rate climbs.',feat:'f_avg60',st:'ct',need:50},
 {id:'metro',n:'Metronome',s:'Each perfect release adds 3 ms to your window, up to +6 ms a visit.',feat:'f_leg15',st:'rh',need:55},
 {id:'clutch',n:'Clutch',s:'Nerves 50% lower on match darts and in deciding legs.',feat:'f_dec',st:'co',need:50},
 {id:'comeback',n:'Comeback',s:'Trailing in legs: nerves 35% lower, so your heart rate climbs slower.',feat:'f_comeback',st:'co',need:40}];
window.TOPS_TRAITS=TRAITS;
// new feat for Comeback
try{if(!FEATS.some(f=>f.id==='f_comeback'))FEATS.push({id:'f_comeback',n:'Comeback',s:'Win a match after trailing by two legs',c:(m,c,M)=>M.won&&(M.maxDown||0)>=2,p:c=>[c.feats&&c.feats.f_comeback?1:0,c.feats&&c.feats.f_comeback?'done':'not yet']});}catch(e){}

function on(){const c=career();return !!(c&&!c.run&&!(S&&S.mp));}
window.TOPS_ST2=on;
function lvNow(){try{const v=C3.V3();return v?v.lv:1;}catch(e){return 1;}}
function st(){if(!save.st2){const z=()=>({sc:0,fi:0,ct:0,rh:0,co:0});const lv=lvNow();save.st2={v:{sc:20,fi:20,ct:20,rh:20,co:20},nat:z(),form:z(),flame:z(),bank:Math.max(0,lv-1),earned:0,lvSeen:lv,trait:null,respec:0};
  // migration: retired perks become cash, attribute XP retires
  try{const c=career();const n=Object.values(save.perks||{}).reduce((a,v)=>a+(typeof v==='number'?v:(v?1:0)),0);if(c&&n){const cash=n*Math.max(10,Math.round(TIERS[c.tier||0].purse*.25));c.bank+=cash;save.st2.migCash=cash;}}catch(e){}
  save.perks={};save.attr={};try{_SK=null;}catch(e){}persist();}
 return save.st2;}
window.TOPS_st=()=>save.st2;
function capNow(){const c=career();if(!c)return 85;const t=c.tier||0;if(t<6)return CAPS[t];return (c.seasonN||1)>=2?85:82;}
function gainAt(v){return Math.max(2,Math.min(6,Math.round((100-v)/9)));}
// kit points: equipment shown as stat points on top of yours
function kitPts(){const k={sc:0,fi:0,ct:0,rh:0,co:0};try{const b=barrel();const acc=Math.round((5.6-b.base)/1.8*7);k.sc+=acc;k.fi+=acc;k.rh+=Math.round((b.tol-1)/.15*6);k.ct+=Math.round((1.25-b.sway)/.6*7);
 const su=save.setup||{};const SH={short:{ct:1,rh:-2},long:{ct:-1,rh:3},carbon:{ct:1},spin:{rh:2}},FL={slim:{sc:2,fi:2,rh:-3},kite:{sc:-1,fi:-1,rh:3},pear:{sc:1,fi:1,rh:-1}},PT={long:{sc:1,fi:1},black:{sc:1,fi:1},gold:{sc:1,fi:1}};
 [SH[su.shaft],FL[su.flight],PT[su.point]].forEach(o=>{if(o)Object.keys(o).forEach(x=>k[x]+=o[x]);});
 if(gearCount('case'))k.ct+=2;k.co+=2*Math.min(5,gearCount('coach'));}catch(e){}
 Object.keys(k).forEach(x=>k[x]=Math.max(-3,Math.min(10,k[x])));return k;}
window.TOPS_kitPts=kitPts;
function partPts(key,id){const SH={short:{ct:1,rh:-2},long:{ct:-1,rh:3},carbon:{ct:1},spin:{rh:2}},FL={slim:{sc:2,fi:2,rh:-3},kite:{sc:-1,fi:-1,rh:3},pear:{sc:1,fi:1,rh:-1}},PT={long:{sc:1,fi:1},black:{sc:1,fi:1},gold:{sc:1,fi:1}};return ({shaft:SH,flight:FL,point:PT}[key]||{})[id]||{};}
function barrelPts(b){const acc=Math.round((5.6-b.base)/1.8*7);return {sc:acc,fi:acc,rh:Math.round((b.tol-1)/.15*6),ct:Math.round((1.25-b.sway)/.6*7)};}
function ptsTxt(o){const parts=STATS.filter(s=>o[s.id]).map(s=>`<span class="${o[s.id]<0?'neg':''}">${SN(s.id)} ${o[s.id]>0?'+':''}${o[s.id]}</span>`);return parts.length?parts.join(' · '):'No stat change';}
function eff(id){const s=st();const hot=(S&&S.hot&&S.hot[id])?3:0;return Math.max(0,Math.min(100,s.v[id]+kitPts()[id]+hot));}
function Lof(id){return Math.max(0,Math.min(1,(eff(id)-20)/75));}
function ovr(){let o=0;STATS.forEach(s=>o+=s.w*(st().v[s.id]+kitPts()[s.id]));return Math.round(o);}
function ident(){const v=st().v;const arr=STATS.map(s=>v[s.id]);if(Math.max(...arr)-Math.min(...arr)<8)return 'All-Rounder';const top=STATS.slice().sort((a,b)=>v[b.id]-v[a.id])[0];return top.t;}
// ---------- points from levels ----------
function syncPts(){if(!on())return;const s=st();const lv=lvNow();if(lv>s.lvSeen){s.bank+=lv-s.lvSeen;s.lvSeen=lv;persist();}
 // at max, points pay out
 if(s.bank>0&&STATS.every(x=>s.v[x.id]>=85)){const c=career();const cash=s.bank*Math.round(TIERS[c.tier||0].purse*.5);c.bank+=cash;s.bank=0;persist();}}
function canSpend(){const s=st();const cap=capNow();return s.bank>0&&STATS.some(x=>s.v[x.id]<Math.min(cap,85));}
function spend(id){const s=st();const cap=Math.min(85,capNow());if(s.bank<=0||s.v[id]>=cap)return 0;const g=Math.min(cap-s.v[id],gainAt(s.v[id])+(s.flame[id]?2:0));s.v[id]+=g;s.flame[id]=0;s.bank--;s.earned++;persist();return g;}
window.TOPS_spend=spend;
// ---------- form ----------
function formSize(id){return 100*(1+st().v[id]/60);}
function addForm(id,amt,why){if(!on()||!S||!(amt>0))return;if(S.practice&&!S.drill)amt*=.5;if(S.drill&&gearCount('board'))amt*=1.5;const s=st();s.form[id]+=amt;S.formLog=S.formLog||{};S.formLog[id]=(S.formLog[id]||0)+amt;
 while(s.form[id]>=formSize(id)){s.form[id]-=formSize(id);s.flame[id]=1;let up=0;if(s.v[id]<Math.min(85,capNow())){s.v[id]++;s.nat[id]++;up=1;}S.hot=S.hot||{};S.hot[id]=1;S.formLit=(S.formLit||[]).concat({id,up,why});
  try{tick._p=null;}catch(e){}flameChip(id);}}
window.TOPS_addForm=addForm;
function flameChip(id){try{const n=$('hrNote');if(n){n.textContent='🔥 '+SN(id)+' in form';n.classList.add('st2fl');clearTimeout(flameChip.t);flameChip.t=setTimeout(()=>{n.classList.remove('st2fl');if(n.textContent.indexOf('in form')>0)n.textContent='';},2600);}}catch(e){}}
// per dart: called from landCore for the human thrower
window.TOPS_formDart=function(me,h,x,y){try{if(!on()||!S||S.bull)return;if(S.dart===1){S.visPerf=0;S.visTight=0;}
 const a=S.aim||{x:0,y:0};const d=Math.hypot(x-a.x,y-a.y);const tgt=scoreAt(a.x,a.y);
 // Scoring: trebles, worth more the longer your 60+ visit streak runs
 if(h.m===3)addForm('sc',1.0*(1+.25*Math.min(6,S.scStreak||0)));
 // Control: darts on your aim; a run of them snowballs (x1.2 per dart in a row, max x2.5)
 if(d<15){S.ctStreak=(S.ctStreak||0)+1;addForm('ct',.6*Math.min(2.5,1+.2*(S.ctStreak-1)));S.visTight=(S.visTight||0)+1;}else S.ctStreak=0;
 // Rhythm: perfect releases, multiplied by your perfect streak (max x2.5)
 if(S.lastTiming==='Perfect'){S.visPerf=(S.visPerf||0)+1;addForm('rh',.6*Math.min(2.5,1+.2*Math.max(0,(S.perfStreak||1)-1)));}
 // Composure: good darts under pressure, worth more the higher your heart rate
 if((S.hr||0)>=110&&(h.label===tgt.label||d<15))addForm('co',2*(1+Math.min(1.5,((S.hr||110)-110)/40)));
 // Finishing: doubles hit, double value with the first dart at that double
 if(S.aimWasDbl&&h.dbl&&h.label===tgt.label){const first=!(S.dblTry&&S.dblTry[h.label]);addForm('fi',first?4:2);}
 if(S.aimWasDbl){S.dblTry=S.dblTry||{};S.dblTry[tgt.label]=1;}
 if(S.dart===3){S.dblTry={};if(S.visPerf>=3)addForm('rh',4,'three perfects');if(S.visTight>=3)addForm('ct',4,'tight group');const lb=S.visit.map(v=>v.label);if(lb.length===3&&lb[0]===lb[1]&&lb[1]===lb[2]&&/^T/.test(lb[0]))addForm('ct',15,'three in '+lb[0]);}
}catch(e){}};
// after a dart is scored: visits and checkouts
window.TOPS_formAfter=function(me,r,gained,h){try{if(!on()||!S||S.bull)return;
 if(r.won){const val=S.visitStart;const darts=S.dart;let f=4+val/5;if(val>=100)f+=10;if(val===170)f+=30;if(h.label==='BULL')f+=8;if(darts<=(val>110?3:val>50?2:1))f*=1.5;addForm('fi',f,val+' checkout');
  if((S.hr||0)>=120)addForm('co',10,'checkout under pressure');const need=Math.ceil((S.bestOf||3)/2);const op=S.p[1];if(op&&me.legs===need-1&&op.legs===need-1)addForm('co',12,'won the decider');if(me.legs+1>=need)addForm('co',8);S.scStreak=0;return;}
 if(S.dart===3&&!r.bust){const k=1+.25*Math.min(6,S.scStreak||0);if(gained===180)addForm('sc',40*k,'180');else if(gained>=140)addForm('sc',12*k);else if(gained>=100)addForm('sc',6*k);else if(gained>=60)addForm('sc',2*k);S.scStreak=gained>=60?(S.scStreak||0)+1:0;}
 else if(r.bust)S.scStreak=0;
}catch(e){}};
// deficit tracker for Comeback
setInterval(()=>{try{if(S&&S.p&&S.p[1]&&!S.done){const d=(S.p[1].legs||0)-(S.p[0].legs||0);S.maxDown=Math.max(S.maxDown||0,d);}}catch(e){}},500);
// ---------- traits ----------
function traitOK(t){const c=career()||{};return !!(c.feats&&c.feats[t.feat])&&st().v[t.st]>=t.need;}
function trait(){const s=st();if(!on()||!s.trait||lvNow()<15)return null;const t=TRAITS.find(x=>x.id===s.trait);return t&&traitOK(t)?t.id:null;}
window.TOPS_trait=trait;
function lastLegs(){const me=S.p[0],op=S.p[1];const need=Math.ceil((S.bestOf||3)/2);return {need,me,op,dec:op&&me.legs===need-1&&op.legs===need-1,md:me.legs===need-1&&me.score<=170,trail:op&&op.legs>me.legs};}
// ---------- engine ----------
const _tp9=throwParams;throwParams=function(){const tp=_tp9.apply(this,arguments);if(!on()||!S)return tp;try{
 const nv=effNerves();const b=S.barrel||barrel();const tgt=scoreAt(S.aim.x,S.aim.y);const fin=tgt.dbl||tgt.label==='BULL';
 const q0=ttAt(tp.L),qc=ttAt(Lof('ct')),qr=ttAt(Lof('rh')),qs=ttAt(Lof(fin?'fi':'sc'));
 tp.A*=qc.A/(q0.A*(b.sway/1.1)*swayMultRaw());tp.w*=q0.T/qc.T;tp.tr*=qr.tr/(q0.tr*Math.max(.4,1+SK().jit));tp.D*=qr.D/q0.D;
 const Lr=Lof('rh');tp.P*=(20+14*Lr)/(q0.P*tolMult()*.85);
 let m=1;const tr=trait();const me=S.p[S.cur];
 if(tr==='heavy'&&S.dart===1&&!fin)m*=.96;
 if(tr==='machine'&&S.dart>1&&tgt.m===3&&S.visit&&S.visit.length&&S.visit[S.visit.length-1].label===tgt.label)m*=.94;
 if(tr==='bull'&&tgt.label==='BULL')m*=.88;
 if(tr==='artist'&&tgt.dbl&&me&&me.score<=100)m*=.92;
 if(tr==='steady')tp.w/=(1+.08*nv);
 if(tr==='metro')tp.P+=Math.min(6,3*(S.visPerf||0));
 tp.s0=Math.max(4.2,qs.s0*m);
}catch(e){}return tp;};
const _ce9=compEff;compEff=function(){if(!on())return _ce9.apply(this,arguments);const c=career();return (eff('co')-20)/7.5+((c&&c.buffComp&&S&&!S.practice&&!S.local&&!S_money)?c.buffComp:0);};
const _en9=effNerves;effNerves=function(){const n=_en9.apply(this,arguments);if(!n||!on()||!S||!S.p)return n;try{const t=trait();if(!t)return n;const L=lastLegs();if(t==='clutch'&&(L.dec||L.md))return n*.5;if(t==='comeback'&&L.trail)return n*.65;}catch(e){}return n;};
const _tl9=throwLevelRaw;throwLevelRaw=function(){if(!on()||!S)return _tl9.apply(this,arguments);return (Lof('sc')+Lof('fi')+Lof('ct')+Lof('rh')+Lof('co'))/5;};
const _am9=armMult;armMult=function(){if(on()&&S&&!S.mp)return 1;return _am9.apply(this,arguments);};
window.TOPS_CONF_K=()=>on()?(.7+.6*Lof('co')):1;
// old attribute XP retires in career
const _gx9=gainXP;gainXP=function(){if(on())return 0;return _gx9.apply(this,arguments);};
// feats no longer draft perks in career
const _cf9=checkFeats;checkFeats=function(){const r=_cf9.apply(this,arguments);try{if(on())S.draftN=0;}catch(e){}return r;};
// ---------- UI: bars ----------
const X=v=>Math.max(0,Math.min(100,v));
function barHTML(id,opt){opt=opt||{};const s=st();const v=s.v[id],k=kitPts()[id],cap=Math.min(85,capNow());const hot=opt.hot&&S&&S.hot&&S.hot[id]?3:0;
 let h=`<div class="st2bar"><i class="base" style="width:20%"></i>`;
 if(k>=0){h+=`<i class="me" style="left:20%;width:${X(v)-20}%"></i>`;if(k)h+=`<i class="kb" style="left:${X(v)}%;width:${X(k)}%"></i>`;}
 else{h+=`<i class="me" style="left:20%;width:${Math.max(0,X(v+k)-20)}%"></i><i class="pen" style="left:${X(v+k)}%;width:${-k}%"></i>`;}
 if(hot)h+=`<i class="hot" style="left:${X(v+Math.max(0,k))}%;width:3%"></i>`;
 if(opt.gain)h+=`<i class="gain" style="left:${X(v+Math.max(0,k))}%;width:${opt.gain}%"></i>`;
 h+=`<i class="cap" style="left:${cap}%" title="Chapter cap"></i></div>`;return h;}
function rowHTML(x){const s=st();const k=kitPts()[x.id];const fp=Math.min(100,s.form[x.id]/formSize(x.id)*100);
 return `<div class="st2r"><b>${s.flame[x.id]?'🔥':''}${x.n}</b>${barHTML(x.id)}<span class="num">${s.v[x.id]}${k?`<i class="${k<0?'neg':''}">${k>0?'+':''}${k}</i>`:''}</span><div class="st2fm" title="Form"><i style="width:${fp.toFixed(0)}%"></i></div></div>`;}
function cardHTML(){const s=st();const cap=Math.min(85,capNow());const lv=lvNow();const t=TRAITS.find(x=>x.id===s.trait);
 return `<div class="c3-card st2c" id="st2Card"><div class="st2h"><div class="ovr"><small>OVR</small>${ovr()}</div><div class="idn">${ident()}<span>Chapter cap ${cap} · max 85</span></div></div>
 ${STATS.map(rowHTML).join('')}
 <div class="st2key"><span><i style="background:#C6F36B"></i>You</span><span><i style="background:#5f9fe8"></i>Kit</span><span><i style="background:#e2362f"></i>Kit penalty</span><span><i style="background:#ffb13b"></i>Form</span></div>
 <div class="st2act">${s.bank>0?`<button type="button" class="st2pts" id="st2Spend">${canSpend()?`Spend ${s.bank} point${s.bank>1?'s':''}`:`${s.bank} banked · promote to use`}</button>`:`<button type="button" class="ghost" id="st2How">How stats grow</button>`}<button type="button" class="ghost" id="st2Kit">Change darts</button></div>
 <div class="label">Signature trait</div>${lv<15?`<p class="help">Unlocks at level 15. You're level ${lv}.</p>`:`<button type="button" class="st2t ${t?'on':''}" id="st2Trait"><b>${t?t.n:'Choose a trait'}</b><em>${t?'Equipped':'Tap'}</em><small>${t?t.s:'Earn traits by doing a feat and reaching its stat.'}</small></button>`}
 <button type="button" class="ghost" id="st2Respec" style="min-height:44px">${s.respec?`Respec · ${money(respecCost())}`:'Respec · first one free'}</button></div>`;}
function respecCost(){const c=career();return c?TIERS[c.tier||0].purse:0;}
function wireCard(){const q=id=>document.getElementById(id);if(q('st2Spend'))q('st2Spend').onclick=()=>{if(canSpend())showStatPick(()=>showHub('player'));};if(q('st2How'))q('st2How').onclick=howMsg;q('st2Kit').onclick=()=>{hubTab('kit');showShop('barrel',true);};if(q('st2Trait'))q('st2Trait').onclick=traitPicker;q('st2Respec').onclick=respec;}
function howMsg(){showMsg({from:'Kev Mercer',lines:['Every level you earn a stat point. Early points are worth +6, later ones +2.','Play fills form meters. Trebles feed Scoring, doubles and big checkouts feed Finishing, tight groups feed Control, perfect releases feed Rhythm, good darts under pressure feed Composure.','Fill one and that stat lights up: +1 now, +3 for the rest of the match, and +2 on your next point there.','Blue is your kit. Better darts, better numbers.'],replies:[['Got it','ok']]},()=>showHub('player'));}
function respec(){const s=st();const cost=s.respec?respecCost():0;const c=career();if(cost&&c.bank<cost){showMsg({from:'Kev Mercer',lines:[`A rebuild costs ${money(cost)}. You've got ${money(c.bank)}.`],replies:[['Fair','ok']]},()=>showHub('player'));return;}
 showMsg({from:'Kev Mercer',lines:[`Rebuild your game? Every point you've spent comes back to spend again. Form gains stay.${cost?` It costs ${money(cost)}.`:' First one is free.'}`],replies:[['Rebuild','yes'],['Leave it','no']]},a=>{if(a==='yes'){if(cost)c.bank-=cost;STATS.forEach(x=>{s.v[x.id]=20+s.nat[x.id];});s.bank+=s.earned;s.earned=0;s.respec++;persist();showStatPick(()=>showHub('player'));}else showHub('player');});}
function traitPicker(){const s=st();const host=document.createElement('div');host.className='st2tr';
 const L=TRAITS.map(t=>{const ok=traitOK(t);const c=career()||{};const fd=!!(c.feats&&c.feats[t.feat]);const f=FEATS.find(x=>x.id===t.feat);return `<button type="button" class="st2t ${s.trait===t.id?'on':''} ${ok?'':'lock'}" data-t="${t.id}"><b>${t.n}</b><em>${s.trait===t.id?'Equipped':ok?'Equip':'Locked'}</em><small>${t.s}${ok?'':`<br>${fd?'✓':'✗'} ${f?f.n:'Feat'} · ${s.v[t.st]>=t.need?'✓':'✗'} ${SN(t.st)} ${s.v[t.st]}/${t.need}`}</small></button>`;}).join('');
 showStatScreen('Signature trait','One equipped at a time. Swap between matches.',`<div class="st2tr">${L}</div>`,'Done',()=>showHub('player'));
 document.querySelectorAll('#perkCards [data-t]').forEach(b=>b.onclick=()=>{const t=TRAITS.find(x=>x.id===b.dataset.t);if(!traitOK(t))return;s.trait=t.id;persist();traitPicker();});}
function showStatScreen(kick,sub,html,later,done){const P=$('perk');P.classList.add('st2p');$('perkWhy').textContent=kick;document.querySelector('#perk .res-win').textContent=kick==='Signature trait'?'Pick your trait':'Level up';$('perkCount').innerHTML=sub;const host=$('perkCards');host.classList.remove('deck');host.classList.add('st2host');host.style.gridTemplateColumns='';host.innerHTML=html;$('perkKeyHelp').hidden=true;$('perkFlush').hidden=true;$('btnPerkReroll').hidden=true;$('btnPerkLater').hidden=false;$('btnPerkLater').textContent=later;$('btnPerkLater').onclick=()=>{P.classList.remove('st2p');host.classList.remove('st2host');done&&done();};showScreen('perk');}
function fxLine(id,v0,v1){const L=v=>Math.max(0,Math.min(1,(v+kitPts()[id]-20)/75));const a=ttAt(L(v0)),b=ttAt(L(v1));
 if(id==='sc'||id==='fi')return `${id==='sc'?'Spread':'Spread on doubles'} ${a.s0.toFixed(1)} → ${b.s0.toFixed(1)} mm`;
 if(id==='ct')return `Sway ${Math.round(a.A)} → ${Math.round(b.A)} mm`;
 if(id==='rh')return `Perfect window ${Math.round(20+14*L(v0))} → ${Math.round(20+14*L(v1))} ms`;
 const p=v=>Math.round(Math.max(0,100-((v+kitPts().co-20)/7.5)*.28/2*100));return `Pressure felt ${p(v0)}% → ${p(v1)}%`;}
function showStatPick(done,Lm){syncPts();const s=st();const cap=Math.min(85,capNow());const lit=(Lm&&Lm.formLit)||[];
 const litH=lit.length?`<div class="label">Lit this match</div><div class="st2lit">${lit.map(f=>`<span>🔥 ${SN(f.id)}${f.up?' +1':''}${f.why?' · '+f.why:''}</span>`).join('')}</div>`:'';
 const opts=STATS.map(x=>{const v=s.v[x.id];const capd=v>=cap;const g=capd?0:Math.min(cap-v,gainAt(v)+(s.flame[x.id]?2:0));
  return `<button type="button" class="st2o ${s.flame[x.id]?'fl':''} ${capd?'capd':''}" data-s="${x.id}"><span class="t">${s.flame[x.id]?'🔥':''}${x.n} <small style="font:600 12px Manrope;color:#9fa8a8;text-transform:none">${v}</small></span><span class="g">${capd?'Cap':'+'+g}${s.flame[x.id]&&!capd?'<small>in form +2</small>':''}</span>${barHTML(x.id,{gain:g})}<span class="fx">${capd?`At chapter cap ${cap} · promote to raise`:fxLine(x.id,v,v+g)}</span></button>`;}).join('');
 const sub=s.bank>0?(canSpend()?`${s.bank} point${s.bank>1?'s':''} to spend. Early points count most.`:`${s.bank} banked. Every stat is at the chapter cap, so they unlock at promotion.`):'No points to spend right now.';
 showStatScreen(lit.length&&!s.bank?'Form':'Level '+lvNow(),sub,litH+`<div class="st2pick">${opts}</div>`,s.bank>0&&canSpend()?'Later':'Continue',done);
 document.querySelectorAll('#perkCards .st2o').forEach(el=>el.onclick=()=>{if(el.classList.contains('capd')||s.bank<=0)return;const g=spend(el.dataset.s);if(!g)return;el.classList.add('taken');try{sfxLevel();}catch(e){}setTimeout(()=>{if(s.bank>0&&canSpend())showStatPick(done,null);else{$('perk').classList.remove('st2p');$('perkCards').classList.remove('st2host');done&&done();}},420);});}
window.TOPS_statPick=showStatPick;
// after a career match: show form + points before moving on
const _ar9=afterResult;afterResult=function(L){try{if(on()&&L&&!L.st2Shown&&!L.objMsg&&!L.rivalMsg&&!L.flavour){L.st2Shown=true;L.draftN=0;syncPts();if(canSpend()||(L.formLit&&L.formLit.length)){showStatPick(()=>afterResult(L),L);return;}}}catch(e){console.warn('st2',e);}return _ar9.apply(this,arguments);};
// Player tab: stats card under the hero
function renderCard(){if(!on())return;syncPts();const host=$('c3plv');if(!host)return;let el=$('st2Card');const html=cardHTML();if(el)el.outerHTML=html;else{const hero=host.querySelector('.c3x-hero');if(hero)hero.insertAdjacentHTML('afterend',html);else host.insertAdjacentHTML('afterbegin',html);}wireCard();
 try{const help=host.querySelector('.c3-me .help');if(help)help.textContent='Every level is a stat point. Levels also unlock looks, titles and cash.';}catch(e){}}
const _sp9=showPlayer;showPlayer=function(){const r=_sp9.apply(this,arguments);try{document.body.classList.toggle('st2on',on());renderCard();}catch(e){console.warn('st2',e);}return r;};
const _sh9=showHub;showHub=function(){const r=_sh9.apply(this,arguments);try{document.body.classList.toggle('st2on',on());if(on()){st();syncPts();renderCard();}}catch(e){console.warn('st2',e);}return r;};

function kitWith(o){const sb=save.barrel,ss=save.setup,sg=save.gear;try{if(o.barrel)save.barrel=o.barrel;if(o.shaft||o.flight||o.point)save.setup=Object.assign({},ss||{},o.shaft?{shaft:o.shaft}:{},o.flight?{flight:o.flight}:{},o.point?{point:o.point}:{});if(o.gear){save.gear=Object.assign({},sg||{});save.gear[o.gear]=(save.gear[o.gear]||0)+1;}return kitPts();}finally{save.barrel=sb;save.setup=ss;save.gear=sg;}}
function rowPreview(el,nk,cur){const s=st();const ck=kitPts();const s0=el.querySelector('.s');if(s0){s0.innerHTML=s0.innerHTML.replace(/<br>Spread[^<]*/,'');s0.querySelectorAll('.kitpts').forEach(x=>x.remove());}
 const ch=STATS.filter(x=>nk[x.id]!==ck[x.id]);
 const sum=cur?'<span class="kitpts">Equipped</span>':(ch.length?`<span class="kitpts">${ch.map(x=>{const dd=nk[x.id]-ck[x.id];return `<span class="${dd<0?'neg':''}">${x.n} ${dd>0?'▲':'▼'}${Math.abs(dd)}</span>`;}).join(' · ')}</span>`:'<span class="kitpts" style="color:#9fa8a8">Same stats as yours</span>');
 if(s0)s0.insertAdjacentHTML('beforeend',sum);
 let ex=el.nextElementSibling&&el.nextElementSibling.classList.contains('st2x')?el.nextElementSibling:null;if(ex)ex.remove();
 if(el.dataset.st2w)return;el.dataset.st2w='1';const orig=el.onclick;
 el.onclick=e=>{const open=el.nextElementSibling&&el.nextElementSibling.classList.contains('st2x');document.querySelectorAll('.st2x').forEach(x=>x.remove());if(open)return;
  const ck2=kitPts();const nk2=el._nk||nk;const rows=STATS.map(x=>{const v=s.v[x.id];const a=v+ck2[x.id],b2=v+nk2[x.id];const up=b2>a;return `<div class="st2r"><b>${x.n}</b><div class="st2bar"><i class="base" style="width:20%"></i><i class="me" style="left:20%;width:${Math.max(0,X(Math.min(a,b2))-20)}%"></i>${a!==b2?`<i class="${up?'kb':'pen'}" style="left:${X(Math.min(a,b2))}%;width:${Math.abs(b2-a)}%"></i>`:''}</div><span class="num">${b2}${a!==b2?`<i class="${up?'':'neg'}">${up?'+':''}${b2-a}</i>`:''}</span></div>`;}).join('');
  const pr=el.querySelector('.price');const own=pr&&/Owned|Equipped/.test(pr.textContent);const isCur=el.getAttribute('aria-pressed')==='true';
  const label=isCur?'Equipped':own?'Equip':(pr?pr.textContent.replace(/buy/i,'').trim():'Buy');
  const im=el.querySelector('img');const nm=el.querySelector('.t,.n b,b');el.insertAdjacentHTML('afterend',`<div class="st2x c3-card st2c">${im&&im.src?`<div class="st2big"><img src="${im.src}" alt=""></div>`:''}<div class="label">Your stats with this</div>${rows}${isCur?'':(el.classList.contains('locked')&&!own?`<button type="button" class="ghost" disabled style="min-height:44px">Can't afford yet · ${label}</button>`:`<button type="button" class="st2pts st2go" style="min-height:44px;border-radius:10px;font:700 14px Manrope">${own?'Equip':'Buy · '+label}</button>`)}</div>`);
  const go=el.nextElementSibling.querySelector('.st2go');if(go)go.onclick=()=>{orig&&orig.call(el,e);};};}
// Store: the five bars, live with kit, and points on every item
const _ss9=showShop;showShop=function(){const r=_ss9.apply(this,arguments);try{if(!on())return r;const kb=$('kitBars');if(kb){kb.style.display='block';const sw=kb.querySelector('.swkit');kb.innerHTML=`<div class="st2c">${STATS.map(rowHTML).join('')}<div class="st2key"><span><i style="background:#C6F36B"></i>You</span><span><i style="background:#5f9fe8"></i>Kit</span><span><i style="background:#e2362f"></i>Kit penalty</span></div></div>`;if(sw)kb.appendChild(sw);}
 [...document.querySelectorAll('#shopList .opt')].forEach((el,i)=>{const b=BARRELS[i];if(!b)return;const cur=save.barrel===b.id;rowPreview(el,kitWith({barrel:b.id}),cur);});
 const SU=$('setupList');if(SU){let key=null;[...SU.children].forEach(el=>{if(el.classList.contains('label')){key=/Shaft/.test(el.textContent)?'shaft':/Flight/.test(el.textContent)?'flight':'point';return;}const t=el.querySelector('.t');if(!t)return;const list=key==='shaft'?SHAFTS:key==='flight'?FSHAPES:POINTS;const it=list.find(x=>x.n===t.textContent);if(!it)return;const cur=(save.setup||{})[key]===it.id;rowPreview(el,kitWith({[key]:it.id}),cur);});}
 const G=$('gearList');if(G)[...G.children].forEach(el=>{const t=el.querySelector('.t');if(!t)return;const g=/case/i.test(t.textContent)?'case':/Coaching/.test(t.textContent)?'coach':null;if(!g)return;const owned=el.getAttribute('aria-pressed')==='true';rowPreview(el,kitWith({gear:g}),owned);});
}catch(e){console.warn('st2 shop',e);}return r;};
// flights: the set's own flights by default, a colour swatch makes them custom
const _ss9b=showShop;showShop=function(){const r=_ss9b.apply(this,arguments);try{const w=$('swFlight2');if(w&&!w.querySelector('.setfl')){const b=document.createElement('button');b.type='button';b.className='sw setfl';b.textContent='Set';b.title='Flights that come with this set';b.style.cssText='width:auto;padding:0 12px;font:700 12px Manrope;color:#10191A;background:#C6F36B';b.setAttribute('aria-pressed',!save.flightCustom);b.onclick=()=>{save.flightCustom=false;persist();try{V.setPlayerLook(save.look,save.flight);}catch(e){}showShop();};w.insertBefore(b,w.firstChild);const lb=w.parentNode.querySelector('.label');if(lb)lb.textContent=save.flightCustom?'Flights · custom colour':'Flights · the set’s own';}}catch(e){}return r;};
// loose ends from the old system
const _dan=drillAttrName;drillAttrName=function(dd){if(on())return ({sc:'Scoring',fi:'Finishing',co:'Composure',cn:'Rhythm'})[dd.attr]||_dan(dd);return _dan(dd);};
const _co9=checkObjectives;checkObjectives=function(){const done=_co9.apply(this,arguments);try{if(on()&&done&&done.length){const c=career();const mul=[1,1.25,1.5,2,2.5,3.5,5][Math.min(6,c.tier||0)];const xp=Math.round(done.length*120*mul);C3.gainLevels(C3.V3(),xp);if(S&&S.objMsg)S.objMsg.lines.push(`+${xp} XP toward your next stat point.`);}}catch(e){}return done;};
function tidyCareerUI(){if(!on())return;try{
 const fl=document.querySelector('#plFeats');const lab=fl&&fl.parentNode.querySelector('.label');if(lab)lab.textContent='Feats · each pays cash and XP, and some unlock traits';
 ['hubPick','plPick'].forEach(id=>{const e=$(id);if(e)e.hidden=true;});
 document.querySelectorAll('#hubObj small').forEach(s=>{if(s.textContent==='perk')s.textContent='+XP';});
 const ps=$('plStats');if(ps)[...ps.querySelectorAll('.stat')].forEach(x=>{const n=x.querySelector('span');if(n&&n.textContent==='Arm'){n.textContent='OVR';x.classList.add('ovrt');x.querySelector('b').innerHTML=ovr()+'<small>'+ident()+'</small>';}});
}catch(e){}}
const _sh9c=showHub;showHub=function(){const r=_sh9c.apply(this,arguments);tidyCareerUI();return r;};
const _sp9c=showPlayer;showPlayer=function(){const r=_sp9c.apply(this,arguments);tidyCareerUI();return r;};
// gear means something in the stat system
const GEAR_TXT={board:'A board at home. Drills fill your form meters 50% faster.',coach:'One-on-one with a coach. Composure +2 each, up to five sessions.',case:'Pro case and spare shafts. Control +2, and it looks the part on stage.'};
const _ss9g=showShop;showShop=function(){const r=_ss9g.apply(this,arguments);try{if(on()){const G=$('gearList');if(G)[...G.children].forEach(el=>{const t=el.querySelector('.t'),s=el.querySelector('.s');if(!t||!s)return;const it=GEAR.find(g=>g.n===t.textContent);if(it&&GEAR_TXT[it.id]){const kp=s.querySelector('.kitpts');s.textContent=GEAR_TXT[it.id];if(kp)s.appendChild(kp);}});}}catch(e){}return r;};
// fresh career: fresh stats
const _nc9=newCareer;newCareer=function(){const r=_nc9.apply(this,arguments);delete save.st2;st();save.st2.bank=0;persist();return r;};
// boot: migrate existing careers once
setTimeout(()=>{try{if(on()){const fresh=!save.st2;st();syncPts();if(fresh&&save.st2.bank>0)save.st2.migNote=1;}}catch(e){}},1500);
window.TOPS_ST2_API={STATS,TRAITS,kitPts,eff,Lof,ovr,capNow,gainAt,addForm,spend,showStatPick,cardHTML};
})();
</script>
<style>
/* v0.95: card draft is a full-screen pick that pauses the match */
#cardDraft.cd-big{position:fixed;inset:0;left:0;bottom:0;transform:none;width:auto;max-width:none;z-index:80;display:flex;flex-direction:column;justify-content:center;padding:20px 16px;background:rgba(8,10,12,.86);backdrop-filter:blur(3px);border:0;border-radius:0}
#cardDraft.cd-big[hidden]{display:none}
#cardDraft.cd-big .cd-h{display:flex;justify-content:space-between;align-items:baseline;max-width:720px;margin:0 auto;width:100%}
#cardDraft.cd-big .cd-h b{font:800 30px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;color:#EDECE5}
#cardDraft.cd-big .cd-sub{max-width:720px;margin:6px auto 14px;width:100%;font-size:15px}
#cardDraft.cd-big .cd-row{max-width:720px;margin:0 auto;width:100%;grid-template-columns:repeat(3,1fr);gap:12px}
#cardDraft.cd-big .cd-card{min-height:220px;padding:16px 14px;gap:8px;border-radius:12px}
#cardDraft.cd-big .cd-card b{font-size:20px}#cardDraft.cd-big .cd-card .cd-fx{font-size:14px;line-height:1.35}#cardDraft.cd-big .cd-ico{font-size:34px}
#cardDraft.cd-big .cd-skip{max-width:720px;margin:12px auto 0;width:100%;min-height:48px}
#cardDraft .cd-wait{max-width:720px;margin:14px auto 0;width:100%;text-align:center;font:700 15px Manrope,sans-serif;color:#C6F36B}
@media (max-width:600px){#cardDraft.cd-big .cd-row{grid-template-columns:1fr}#cardDraft.cd-big .cd-card{min-height:96px;flex-direction:row;flex-wrap:wrap;align-items:center}#cardDraft.cd-big .cd-card .cd-fx{width:100%}}
.rules-btn{position:fixed;z-index:47;left:8px;top:calc(var(--lk-hdr,40px) + 52px);min-height:36px;padding:0 12px;background:rgba(13,16,20,.9);border:1px solid #343C47;border-radius:18px;color:#E9E4D8;font-family:var(--display);font-size:13px;letter-spacing:.04em;text-transform:uppercase;cursor:pointer}
#rulesOv{position:fixed;inset:0;z-index:85;background:rgba(8,10,12,.88);display:flex;align-items:center;justify-content:center;padding:16px}
#rulesOv[hidden]{display:none}
#rulesOv .ro{max-width:520px;width:100%;max-height:86vh;overflow:auto;background:#141a1c;border:1px solid #2c3638;border-radius:14px;padding:18px 18px 14px;color:#EDECE5}
#rulesOv h2{margin:0 0 4px;font:800 28px/1 "Barlow Condensed",sans-serif;text-transform:uppercase}#rulesOv h3{margin:14px 0 6px;font:700 13px Manrope,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#C6F36B}
#rulesOv ul{margin:0;padding-left:18px}#rulesOv li{margin:4px 0;font:500 14px/1.4 Manrope,sans-serif;color:#d6dad9}
#rulesOv button{margin-top:14px;width:100%;min-height:46px;border-radius:10px;background:#C6F36B;color:#10191A;border:0;font:700 14px Manrope,sans-serif}
</style>
<script>
(function(){
// ---- card draft: bigger, and the match waits until every player has picked ----
const CDW={round:-1,done:{},t0:0};
function alive(){return (S&&S.p||[]).filter(p=>!p.left&&p.key);}
function waitingOn(){return alive().filter(p=>!CDW.done[p.key]);}
function released(){if(!S||!S.online||!S.pub||!S.pub.cards)return true;if(CDW.round<0)return true;if(CDW.skip===CDW.round)return true;if(performance.now()-CDW.t0>20000)return true;return waitingOn().length===0;}
window.TOPS_cardHold=()=>!released();
function showWait(){const host=$('cardDraft');if(!host)return;
 // self-heal: if the round is waiting on me, show my cards now, or report done if I have none to pick
 try{const C=S.pub&&S.pub.cards;if(S.online&&C&&!CDW.done[NET.myId]&&CDW.round>=0&&!C.draft){if(C.pendDraft){C.pendDraft=false;cardDraftShow(C.round);return;}CDW.done[NET.myId]=1;netSend('cdone',{r:CDW.round});}}catch(e){}
 if(released()){host.hidden=true;host.classList.remove('cd-big');return;}
 const w=waitingOn();if(!w.length){host.hidden=true;host.classList.remove('cd-big');return;}
 host.classList.add('cd-big');host.hidden=false;const left=Math.max(0,Math.ceil((20000-(performance.now()-CDW.t0))/1000));host.innerHTML=`<div class="cd-h"><b>Card round</b><span class="cd-cnt" style="font:800 26px/1 'Barlow Condensed',sans-serif;color:#C6F36B">${left}s</span></div><p class="cd-wait">Waiting for ${w.map(p=>p.name).join(' and ')} to pick a card…</p><button type="button" id="cdPlayOn" class="ghost" style="max-width:720px;margin:12px auto 0;width:100%;min-height:48px">Play on</button>`;const po=$('cdPlayOn');if(po)po.onclick=()=>{CDW.skip=CDW.round;host.hidden=true;host.classList.remove('cd-big');};}
const _cds=cardDraftShow;cardDraftShow=function(round){if(CDW.round!==round){CDW.round=round;CDW.done={};CDW.t0=performance.now();}
 let r;try{r=_cds.apply(this,arguments);}catch(e){console.warn('draft',e);try{CDW.done[NET.myId]=1;netSend('cdone',{r:round});}catch(_){}return;}const host=$('cardDraft');if(host&&!host.querySelector('.cd-card')){try{CDW.done[NET.myId]=1;netSend('cdone',{r:round});}catch(_){}}if(host)host.classList.add('cd-big');
 // longer timer: 25s instead of 12
 try{const C=S.pub.cards;if(C.draft)C.draft.t0=performance.now()+13000;}catch(e){}
 // wrap pick buttons so we report the pick and wait for the others
 try{const report=()=>setTimeout(()=>{CDW.done[NET.myId]=1;try{netSend('cdone',{r:round});}catch(e){}showWait();},30);host.querySelectorAll('.cd-card,#cdSkip').forEach(b=>b.addEventListener('click',report));
  const C=S.pub.cards;const iv=setInterval(()=>{if(!C.draft){clearInterval(iv);if(!CDW.done[NET.myId])report();}},300);}catch(e){}
 return r;};
// players who get their draft later (the thrower) also count: mark rounds as pending for everyone
const _cda=cardDraftAt;cardDraftAt=function(round){const C=S&&S.pub&&S.pub.cards;const before=C?C.round:-1;const r=_cda.apply(this,arguments);try{if(S.online&&C&&C.pendDraft){C.pendDraft=false;cardDraftShow(C.round);}}catch(e){}try{if(C&&C.round===round&&before<round&&CDW.round!==round){CDW.round=round;CDW.done={};CDW.t0=performance.now();}}catch(e){}return r;};
const _nr=netRecv;netRecv=function(m){if(m&&m.t==='cdone'){try{const C=S&&S.pub&&S.pub.cards;if(C&&!S.done&&C.round<+m.r){C.round=+m.r-1;cardDraftAt(+m.r);}}catch(e){console.warn('cdsync',e);}if(CDW.round<0||+m.r>=CDW.round){if(+m.r>CDW.round){CDW.round=+m.r;CDW.done={};CDW.t0=performance.now();}CDW.done[m.from]=1;}const host=$('cardDraft');if(host&&!host.hidden&&!(S.pub&&S.pub.cards&&S.pub.cards.draft))showWait();return;}return _nr.apply(this,arguments);};
// close the wait screen once everyone has picked or the failsafe passes
let _cdRe=0;setInterval(()=>{try{if(S&&S.online&&CDW.round>=0&&CDW.done[NET.myId]&&!released()&&performance.now()-_cdRe>2000){_cdRe=performance.now();netSend('cdone',{r:CDW.round});}}catch(e){}try{const host=$('cardDraft');if(host&&!host.hidden&&host.querySelector('.cd-wait')){if(released()){host.hidden=true;host.classList.remove('cd-big');}else{const c=host.querySelector('.cd-cnt');if(c)c.textContent=Math.max(0,Math.ceil((20000-(performance.now()-CDW.t0))/1000))+'s';}}}catch(e){}},500);
// ---- reliable online messages: every game message is re-sent a few times over 6s; receivers already drop duplicates by sender+seq ----
(function(){let R=[];const _ns=netSend;netSend=function(type,data){if(!NET.chan)return;if(type==='chat'||type==='ach'||type==='vreq')return _ns.apply(this,arguments);NET.seq++;const pl=Object.assign({t:type,q:NET.seq,from:NET.myId},data||{});try{NET.chan.send({type:'broadcast',event:'tops',payload:pl});}catch(e){}R.push({pl,t:performance.now(),n:0});if(R.length>24)R=R.slice(-24);};
 setInterval(()=>{if(!NET.chan||!R.length)return;const now=performance.now();R=R.filter(x=>now-x.t<6500);R.forEach(x=>{if(now-x.t>=(x.n+1)*1500){x.n++;try{NET.chan.send({type:'broadcast',event:'tops',payload:x.pl});}catch(e){}}});},250);})();
// ---- 3+ players / Games night: one strip along the bottom with every player, the floating list and the 2-player bar go ----
(function(){const st=document.createElement('style');st.textContent=`
body.mp-strip #mpBoard{display:none!important}
body.mp-strip .sbrow>*:not(#mpStrip){display:none!important}
body.mp-strip .sbrow{display:block!important;padding:0!important}
#mpStrip{display:flex;gap:6px;height:100%;padding:6px 8px;box-sizing:border-box;overflow-x:auto;scrollbar-width:none}
#mpStrip::-webkit-scrollbar{display:none}
#mpStrip .ms{flex:1 1 0;min-width:0;display:flex;flex-direction:column;justify-content:space-between;background:rgba(237,236,229,.04);border:1px solid rgba(237,236,229,.10);border-radius:8px;padding:6px 8px;position:relative;overflow:hidden;transition:background .25s,border-color .25s}
#mpStrip .ms.on{background:rgba(198,243,107,.12);border-color:#C6F36B;box-shadow:inset 0 -3px 0 #C6F36B}
#mpStrip .ms .t{display:flex;justify-content:space-between;align-items:baseline;gap:6px}
#mpStrip .ms .n{font:800 12px/1.1 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.03em;color:#EDECE5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mpStrip .ms.me .n:before{content:"";display:inline-block;width:6px;height:6px;border-radius:3px;background:#C6F36B;margin-right:5px;vertical-align:middle}
#mpStrip .ms .s{font:800 28px/1 "Barlow Condensed",sans-serif;color:#EDECE5;font-variant-numeric:tabular-nums}
#mpStrip .ms.on .s{color:#C6F36B}
#mpStrip .ms .b{display:flex;align-items:center;gap:6px;font:700 10px/1 Manrope,sans-serif;color:#9fa8a8;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}
#mpStrip .ms .b .tag{color:#C6F36B}
#mpStrip .ms .w{flex:1;height:4px;border-radius:2px;background:rgba(237,236,229,.10);overflow:hidden;min-width:20px}
#mpStrip .ms .w i{display:block;height:100%;background:#f3c560}
`;document.head.appendChild(st);
 const _mr=mpBoardRender;mpBoardRender=function(){const r=_mr.apply(this,arguments);try{const el=$('mpBoard');const on=!!(el&&!el.hidden&&S&&!S.done);document.body.classList.toggle('mp-strip',on);const row=document.querySelector('.sbrow');if(!row)return r;let sp=$('mpStrip');
  if(!on){if(sp)sp.remove();return r;}if(!sp){sp=document.createElement('div');sp.id='mpStrip';row.appendChild(sp);}
  const P=S.pub;const nx=(()=>{for(let k=1;k<S.p.length;k++){const j=(S.cur+k)%S.p.length;if(!S.p[j].left)return j;}return -1;})();
  sp.innerHTML=S.p.map((p,i)=>{const cur=i===S.cur,d=P&&P.p[i],lv=d?Math.min(8,d.lvl):0,cards=P&&P.cards&&P.cards.n[p.key];const tag=cur?'Throwing':i===nx?'Next':'';
   return `<div class="ms ${cur?'on':''} ${i===0?'me':''} ${S.teams?'tm'+(i%2):''}"><div class="t">${S.teams?`<em class="tmk">${i%2?'Them':'Us'}</em>`:''}<span class="n">${String(p.name||'').replace(/</g,'&lt;')}${p.left?' (left)':''}</span></div><div class="s">${p.score}</div><div class="b">${tag?`<span class="tag">${tag}</span>`:`<span>${p.legs||0} leg${p.legs===1?'':'s'}</span>`}${cards?`<span>🃏${cards}</span>`:''}${P?`<span class="w" title="Wobble ${lv}/8"><i style="width:${lv/8*100}%"></i></span>`:''}</div></div>`;}).join('');}catch(e){console.warn('strip',e);}return r;};
 setInterval(()=>{try{if(document.body.classList.contains('mp-strip')&&S&&!S.done){const k=S.cur+':'+S.p.map(p=>p.score).join(',');if(k!==mpBoardRender._k){mpBoardRender._k=k;mpBoardRender();}}else if(document.body.classList.contains('mp-strip')&&(!S||S.done)){document.body.classList.remove('mp-strip');const sp=$('mpStrip');if(sp)sp.remove();}}catch(e){}},300);})();
// ---- shot clock (online): 60s per visit. Pauses for card rounds and bets. Runs out = each remaining dart misses ----
(function(){const SC={key:null,end:0,auto:0};window.TOPS_SHOT=60;
 const st=document.createElement('style');st.textContent='#shotClk{position:fixed;left:50%;top:calc(var(--lk-hdr,56px) + 10px);transform:translateX(-50%);z-index:60;pointer-events:none;font:800 22px/1 "Barlow Condensed",sans-serif;color:#EDECE5;background:rgba(8,10,12,.78);border:1px solid rgba(237,236,229,.18);border-radius:999px;padding:6px 14px;letter-spacing:.04em}#shotClk.low{color:#fff;background:#c4161c;border-color:#ff6b5e;animation:scPulse 1s infinite}@keyframes scPulse{50%{transform:translateX(-50%) scale(1.08)}}#shotClk[hidden]{display:none}';document.head.appendChild(st);
 const el=document.createElement('div');el.id='shotClk';el.hidden=true;document.body.appendChild(el);
 setInterval(()=>{try{const mine=S&&S.online&&!S.done&&S.cur===0&&S.p&&S.p[0]&&!S.p[0].ai;if(!mine){SC.key=null;el.hidden=true;return;}
  const k=(S.pub?S.pub.visits:0)+':'+S.p.map(p=>p.legs||0).join('.');const now=performance.now();
  if(k!==SC.key){SC.key=k;SC.end=now+(window.TOPS_SHOT||60)*1000;SC.auto=0;}
  const held=(window.TOPS_cardHold&&TOPS_cardHold())||(S.pub&&S.pub.wait)||(S.noPullUntil&&now<S.noPullUntil)||!$('cardDraft').hidden||S.busy;
  if(held){SC.end+=250;}
  const left=Math.max(0,Math.ceil((SC.end-now)/1000));el.hidden=left>30;el.textContent='⏱ '+left+'s';el.classList.toggle('low',left<=10);
  if(left<=0&&!held&&now-SC.auto>1500){SC.auto=now;try{if(!S.pulling){S.aim={x:0,y:-460};S.shotMiss=true;try{xpPop('Shot clock · dart missed','tm');}catch(e){}startPull('auto');}setTimeout(()=>{try{if(S&&S.pulling)release({timeStamp:performance.now()},'auto');}catch(e){}},380);}catch(e){}}}catch(e){}},250);})();
// ---- menu music: Lee's two Suno tracks, streamed, alternating. Only on menus, fades out when a match starts ----
(function(){const TR=['assets/voice/menu_1.mp3','assets/voice/menu_2.mp3'];
 let au=null,i=Math.floor(Math.random()*2),armed=false,vol=0;const MAX=.32;
 function mk(){au=new Audio();au.preload='auto';au.src=TR[i%TR.length];au.volume=0;au.onended=()=>{i++;au.src=TR[i%TR.length];au.play().catch(()=>{});};au.onerror=()=>{i++;setTimeout(()=>{try{au.src=TR[i%TR.length];}catch(e){}},4000);};}
 function onMenu(){const inMatch=S&&!S.done;return !inMatch&&AU.on&&!document.hidden&&!window.__walkOut;}
 const arm=()=>{armed=true;};['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,arm,{once:false,passive:true}));
 setInterval(()=>{try{if(!armed)return;const want=onMenu();if(want&&!au)mk();if(!au)return;if(want&&au.paused)au.play().catch(()=>{});
  vol+=want?.04:-.08;vol=Math.max(0,Math.min(MAX,vol));au.volume=vol;if(!want&&vol<=0&&!au.paused)au.pause();}catch(e){}},150);})();
// ---- joining a code nobody is hosting: say so and back out instead of opening an empty lobby ----
(function(){const _oj=onlineJoin;onlineJoin=async function(code,seat){const r=await _oj.apply(this,arguments);try{if(seat!==0&&NET.chan&&NET.room){const room=NET.room;await new Promise(res=>setTimeout(res,2600));if(NET.room===room&&!NET.started&&(NET.peers||[]).filter(k=>k!==NET.myId).length===0){try{await NET.chan.unsubscribe();}catch(e){}NET.chan=null;NET.room=null;$('onLobby').hidden=true;$('onEntry').hidden=false;netStatus('No game found for '+room+'. Check the code with whoever is hosting.');}}}catch(e){}return r;};})();
// ---- opponent reticle: glide between the 10/s updates (predict a little ahead, then ease) instead of jumping ----
(function(){const _rr=window.TOPS_remoteRet;if(!_rr)return;const M={s:null,t:0,last:null,prev:null,key:null};
 window.TOPS_remoteRet=function(){const r=_rr();if(!r||document.body.classList.contains('card-noret')){M.s=null;M.last=M.prev=null;return null;}const now=performance.now();if(r.mode==='pull'){M.s={x:r.x,y:r.y};M.t=now;M.last={x:r.x,y:r.y,at:now};M.prev=null;return r;}
  const k=S.cur+':'+(S.dart||0);if(M.key!==k&&M.key&&M.key.split(':')[0]!==String(S.cur)){M.s=null;M.last=M.prev=null;}M.key=k;
  if(!M.last||M.last.x!==r.x||M.last.y!==r.y){M.prev=M.last;M.last={x:r.x,y:r.y,at:now};}
  let tx=M.last.x,ty=M.last.y;if(M.prev){const dt=Math.max(30,M.last.at-M.prev.at);const ah=Math.min(110,now-M.last.at);tx+=(M.last.x-M.prev.x)/dt*ah*.8;ty+=(M.last.y-M.prev.y)/dt*ah*.8;}
  if(!M.s){M.s={x:tx,y:ty};M.t=now;}const dt=Math.min(100,now-M.t);M.t=now;const a=1-Math.exp(-dt/70);M.s.x+=(tx-M.s.x)*a;M.s.y+=(ty-M.s.y)*a;
  return Object.assign({},r,{x:M.s.x,y:M.s.y});};})();
// ---- stuck remote dart guard: keep pumping the queue, and if someone rejoins with a new id, move their seat to it ----
setInterval(()=>{try{if(S&&S.online&&!S.done&&S.cur!==0&&!S.netAnim&&NET.queue&&NET.queue.length)netPump();}catch(e){}},1000);
(function(){const _nb=netBack;netBack=function(key){const r=_nb.apply(this,arguments);try{if(S&&S.online&&!S.done&&NET.chan){const ps=NET.chan.presenceState()[key];const pid=ps&&ps[0]&&ps[0].pid;if(pid){const seat=S.p.find(p=>p.pid===pid&&p.key!==key);if(seat){const old=seat.key;seat.key=key;seat.left=false;if(NETDROP[old]){clearTimeout(NETDROP[old]);delete NETDROP[old];}try{pubBand('land','BACK IN',seat.name+' reconnected',1500,null);}catch(e){}}}}}catch(e){}return r;};})();
// ---- v1.06 SYNC: the fix for 'it thinks it's someone else's turn' ----
// 1) a dropped connection (app switched, screen locked) no longer removes you after 20s on other screens. Only Quit or a vote to remove does.
// 2) after every visit the thrower broadcasts the full scoreboard and whose turn is next; everyone snaps to it.
// 3) coming back to the app asks everyone for the current state.
(function(){
 const SY={pend:null,lastCur:null,lastLeg:null,fixes:0};window.TOPS_SYNC=SY;
 const byKey=k=>S.p.findIndex(p=>p.key===k);
 function snap(){return {leg:legsPlayed(),next:S.p[S.cur]&&S.p[S.cur].key,pl:Object.fromEntries(S.p.map(p=>[p.key,{s:p.score,l:p.legs||0,d:p.darts||0,x:p.left?1:0}]))};}
 function darts(){return S.p.reduce((a,p)=>a+(p.darts||0),0);}
 function apply(m,force){if(!S||!S.online||S.done||S.bull)return true;
  // wait for that player's darts to finish playing on this screen first
  if(!force&&(S.netAnim||(NET.queue||[]).some(q=>q.from===m.from)))return false;
  if(S.pulling&&S.cur===0&&!force)return false;
  let changed=false;
  // never go backwards: a snapshot older than what this screen already has is ignored
  const myLeg=legsPlayed(),myTot=darts(),mTot=Object.values(m.pl||{}).reduce((a,e)=>a+(e.d||0),0);
  if(m.leg<myLeg)return true;
  if(m.leg===myLeg&&mTot<myTot&&!m.full){const e=m.pl&&m.pl[m.from],i=byKey(m.from);if(e&&i>=0&&m.from!==NET.myId&&(e.d||0)>=(S.p[i].darts||0)&&(S.p[i].score!==e.s)){S.p[i].score=e.s;try{updateUI();}catch(_){}}return true;}
  if(m.full&&(m.leg<myLeg||(m.leg===myLeg&&mTot<=myTot)))return true;
  const legDiff=m.leg!==myLeg;
  Object.entries(m.pl||{}).forEach(([k,e])=>{const i=byKey(k);if(i<0)return;const p=S.p[i];
   const own=k===m.from;if(!(own||legDiff||m.full))return;if(k===NET.myId&&!(legDiff&&m.leg>myLeg)&&!m.full)return;if(m.full&&(p.darts||0)!==e.d)p.darts=e.d;
   if(p.score!==e.s||(p.legs||0)!==e.l){p.score=e.s;p.legs=e.l;changed=true;}
   if(own&&p.left&&!e.x){p.left=false;changed=true;}});
  const ni=byKey(m.next);
  if(ni>=0&&S.p[ni].left&&!(m.pl&&m.pl[m.next]&&m.pl[m.next].x)){S.p[ni].left=false;changed=true;}
  if(ni>=0&&ni!==S.cur){S.cur=ni;changed=true;try{S.netAnim=false;NET.queue=(NET.queue||[]).filter(q=>q.from===m.next);startTurn();}catch(e){console.warn('sync turn',e);}}
  else if(changed){try{updateUI();}catch(e){}}
  if(changed){SY.fixes++;console.warn('TOPS sync fixed a desync',SY.fixes,m);try{mpBoardRender();}catch(e){}}
  return true;}
 // hold incoming snaps until the darts they describe have landed here (max 8s)
 setInterval(()=>{try{if(!SY.pend)return;const m=SY.pend;if(apply(m,performance.now()-m._at>8000))SY.pend=null;}catch(e){SY.pend=null;}},250);
 const _nr2=netRecv;netRecv=function(m){if(m&&(m.t==='snap'||m.t==='sres')){if(m.from===NET.myId)return;try{if(NET.seen&&m.q!=null){const k=m.from+':'+m.q;if(NET.seen[k])return;NET.seen[k]=1;}}catch(e){}
   // any message from someone marked as left means they are back
   try{const i=byKey(m.from);if(i>=0&&S.p[i].left){S.p[i].left=false;}}catch(e){}
   if(m.t==='sres'){const tot=Object.values(m.pl||{}).reduce((a,e)=>a+e.d,0);if(tot<=darts())return;m.full=1;}
   m._at=performance.now();if(!apply(m,false))SY.pend=m;return;}
  if(m&&m.t==='sreq'){if(m.from!==NET.myId&&S&&S.online&&!S.done){setTimeout(()=>{try{netSend('sres',snap());}catch(e){}},Math.random()*600);}return;}
  if(m&&m.t==='kick'){if(S&&S.online&&!S.done){const i=byKey(m.key);if(i>=0&&m.key!==NET.myId)onlineLeft(m.key,true);}return;}
  try{if(m&&m.from&&S&&S.online){const i=byKey(m.from);if(i>=0&&S.p[i].left&&m.t!=='quit')S.p[i].left=false;}}catch(e){}
  return _nr2.apply(this,arguments);};
 // after MY visit: broadcast the board and whose turn is next
 setInterval(()=>{try{if(!S||!S.online||S.done||S.bull){SY.lastCur=S&&S.bull?-1:null;return;}const lp=legsPlayed();
  if(SY.lastCur===0&&(S.cur!==0||lp!==SY.lastLeg)){setTimeout(()=>{try{if(S&&S.online&&!S.done)netSend('snap',snap());}catch(e){}},700);}
  SY.lastCur=S.cur;SY.lastLeg=lp;}catch(e){}},150);
 // back in the app: ask for the current state
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S&&S.online&&!S.done){setTimeout(()=>{try{netSend('sreq',{});}catch(e){}},800);}});
 // presence drop no longer removes anyone; after 60s you can vote to remove them for everyone
 const _dg=netDropGrace;netDropGrace=function(key){if(!S||S.done)return;const pl=S.p.find(p=>p.key===key);if(!pl||pl.left)return;if(NETDROP[key])return;
  try{pubBand('miss','CONNECTION DROPPED',`${pl.name} · waiting for them to come back`,4000,null);}catch(e){}
  NETDROP[key]=setTimeout(()=>{delete NETDROP[key];const st=NET.chan&&NET.chan.presenceState?NET.chan.presenceState():{};if(st[key])return;
   let b=$('kickBtn');if(!b){b=document.createElement('button');b.id='kickBtn';b.type='button';b.style.cssText='position:fixed;left:50%;top:calc(var(--lk-hdr,56px) + 54px);transform:translateX(-50%);z-index:61;background:#c4161c;color:#fff;border:0;border-radius:10px;padding:10px 16px;font:800 14px Manrope,sans-serif';document.body.appendChild(b);}
   b.textContent=`${pl.name} is gone · Remove from match`;b.hidden=false;b.onclick=()=>{b.hidden=true;try{netSend('kick',{key});}catch(e){}onlineLeft(key,true);};},60000);};
 const _nb2=netBack;netBack=function(key){const r=_nb2.apply(this,arguments);try{const b=$('kickBtn');if(b)b.hidden=true;const i=S&&S.p?byKey(key):-1;if(i>=0&&S.p[i].left&&S.online&&!S.done){S.p[i].left=false;}setTimeout(()=>{try{if(S&&S.online&&!S.done)netSend('sres',snap());}catch(e){}},1200);}catch(e){}return r;};
})();
// ---- rejoin + mates online ----
(function(){
 const LS='tops_lastroom';const save_=o=>{try{localStorage.setItem(LS,JSON.stringify(o));}catch(e){}};const load_=()=>{try{return JSON.parse(localStorage.getItem(LS)||'null');}catch(e){return null;}};
 // remember the room once a match starts
 const _ob=onlineBegin;onlineBegin=function(cfg){const r=_ob.apply(this,arguments);try{if(NET.started)save_({room:NET.room,myId:NET.myId,seat:NET.seat,at:Date.now()});}catch(e){}return r;};
 // room code chip in the match header
 const st=document.createElement('style');st.textContent='#roomChip{position:fixed;right:84px;top:calc(env(safe-area-inset-top) + 12px);z-index:45;font:800 12px/1 Manrope,sans-serif;letter-spacing:.08em;color:#C6F36B;background:rgba(8,10,12,.7);border:1px solid rgba(198,243,107,.4);border-radius:8px;padding:7px 9px;pointer-events:auto}#roomChip[hidden]{display:none}#mateList{margin:14px 0 6px;display:grid;gap:8px}#mateList .ml-h{font:800 13px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.06em;color:#9fa8a8}#mateList .ml{display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(237,236,229,.05);border:1px solid rgba(237,236,229,.12);border-radius:10px;padding:10px 12px}#mateList .ml b{font:800 15px/1.1 "Barlow Condensed",sans-serif;text-transform:uppercase;color:#EDECE5}#mateList .ml small{display:block;font:600 12px/1.2 Manrope,sans-serif;color:#9fa8a8;margin-top:3px}#mateList .ml button{min-height:40px;padding:0 14px;border-radius:9px;border:0;background:#C6F36B;color:#10191A;font:800 13px Manrope,sans-serif}#mateList .ml button.gh{background:transparent;color:#EDECE5;border:1px solid rgba(237,236,229,.3)}';document.head.appendChild(st);
 const chip=document.createElement('div');chip.id='roomChip';chip.hidden=true;document.body.appendChild(chip);chip.title='Room code: share it so mates can rejoin';
 setInterval(()=>{try{const on=!!(S&&S.online&&!S.done&&NET.room);chip.hidden=!on;if(on)chip.textContent='ROOM '+NET.room;}catch(e){}},700);
 // joining a room that's mid-match: ask for the match setup, then the live scoreboard
 const _nr3=netRecv;netRecv=function(m){if(m&&m.t==='creq'){if(m.from!==NET.myId&&S&&S.online&&!S.done&&NET.lastCfg){setTimeout(()=>{try{netSend('cres',{cfg:NET.lastCfg,to:m.from});}catch(e){}},Math.random()*500);}return;}
  if(m&&m.t==='cres'){if(m.to===NET.myId&&!NET.started&&m.cfg){try{onlineBegin(m.cfg);setTimeout(()=>{try{netSend('sreq',{});}catch(e){}},1800);setTimeout(()=>{try{netSend('sreq',{});}catch(e){}},5000);}catch(e){console.warn('rejoin',e);}}return;}
  return _nr3.apply(this,arguments);};
 const _oj2=onlineJoin;onlineJoin=async function(code,seat){const r=await _oj2.apply(this,arguments);try{if(seat!==0&&NET.chan){for(let i=0;i<6&&!NET.started;i++){await new Promise(res=>setTimeout(res,700));const st=NET.chan.presenceState();const busy=Object.entries(st).some(([k,v])=>k!==NET.myId&&v[0]&&v[0].inGame);if(busy){netStatus('Match in progress · rejoining…');netSend('creq',{});break;}}}}catch(e){}return r;};
 // mates online: everyone with the app open shows here with their lobby or match
 let hub=null;const HUB={};
 async function hubJoin(){if(hub)return;try{const sb=await netLoad();hub=sb.channel('tops-hub',{config:{presence:{key:mpPid()+'-'+Math.random().toString(36).slice(2,6)}}});
  hub.on('presence',{event:'sync'},()=>{Object.keys(HUB).forEach(k=>delete HUB[k]);Object.entries(hub.presenceState()).forEach(([k,v])=>{if(v[0])HUB[k]=v[0];});renderMates();});
  await new Promise(res=>hub.subscribe(s=>{if(s==='SUBSCRIBED')res();}));track();}catch(e){console.warn('hub',e);hub=null;}}
 window.TOPS_matesOnline=()=>{try{const mine=mpPid();return new Set(Object.values(HUB).filter(x=>x.pid!==mine).map(x=>x.pid)).size;}catch(e){return 0;}};function me(){return {pid:mpPid(),name:mpName()||(save&&save.name)||'Mate',room:NET.room||'',inGame:!!(S&&S.online&&!S.done),lobby:!!(NET.room&&!NET.started),at:Date.now()};}
 let lastT='';function track(){if(!hub)return;const m=me();const k=JSON.stringify([m.room,m.inGame,m.lobby,m.name]);if(k===lastT)return;lastT=k;try{hub.track(m);}catch(e){}}
 setInterval(()=>{track();},3000);
 function renderMates(){const host=$('onEntry');if(!host)return;let box=$('mateList');if(!box){box=document.createElement('div');box.id='mateList';host.insertBefore(box,host.firstChild);}
  const mine=mpPid();const L=load_();const rows=Object.values(HUB).filter(x=>x.pid!==mine&&x.room);
  const re=(L&&Date.now()-L.at<4*3600e3&&L.room&&Object.values(HUB).some(x=>x.room===L.room&&x.inGame&&x.pid!==mine))?L.room:null;
  box.innerHTML=(re?`<div class="ml"><span><b>Your match · ${re}</b><small>Still going. Jump back in.</small></span><button type="button" data-j="${re}">Rejoin</button></div>`:'')+(rows.length?`<div class="ml-h">Mates online</div>`+rows.map(x=>`<div class="ml"><span><b>${String(x.name).replace(/</g,'&lt;')}</b><small>${x.inGame?'In a match · '+x.room:'In lobby · '+x.room}</small></span><button type="button" class="${x.inGame?'gh':''}" data-j="${x.room}">${x.inGame?'Rejoin':'Join'}</button></div>`).join(''):'');
  box.hidden=!re&&!rows.length;box.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{try{onlineJoin(b.dataset.j,1);}catch(e){}});}
 setInterval(()=>{try{const e=$('onEntry');if(e&&!e.hidden&&e.offsetParent)hubJoin();if(hub)renderMates();}catch(e){}},2000);
 setTimeout(()=>{try{if(save&&save.authSeen)hubJoin();}catch(e){}},6000);
})();
// ---- revoked: achievements earned through the v1.06 sync rollback bug (Lee's Perfect Leg, 10 Nov) ----
setTimeout(()=>{try{const R={nine:[1794300312817]};let ch=false;Object.entries(R).forEach(([id,ts])=>{if(save.ach&&ts.includes(save.ach[id])){delete save.ach[id];ch=true;}});if(ch){persist();console.warn('TOPS: revoked bugged achievement');}}catch(e){}},2500);
// ---- drunk board: the more you've had, the more the board swims, rolls and breathes. Your aim drifts with it, so it costs you darts ----
(function(){function lvl(){try{if(!S||!S.pub||S.done)return 0;const d=S.pub.p[S.cur];return d?Math.min(8,d.lvl||0):0;}catch(e){return 0;}}
 window.TOPS_DRUNK=now=>{const L=lvl();if(!L||S.cur!==0)return null;const k=L/8,t=now/1000,A=26*k*k+6*k;return {x:A*(Math.sin(t*.43)+.45*Math.sin(t*1.07+1.3)),y:A*.8*(Math.sin(t*.31+2.1)+.4*Math.sin(t*.93))};};
 window.TOPS_DRUNKCAM=now=>{const L=lvl();if(!L)return null;const k=L/8,t=now/1000;return {x:.012*k*Math.sin(t*.37+.5),y:.010*k*Math.sin(t*.29+1.7),r:.06*k*k*Math.sin(t*.23),f:1+.05*k*Math.sin(t*.51)};};})();
// ---- spectators see what the thrower sees: fly, vape fog, camera flash, spilled pint ----
(function(){const SP={fog:null,flashT:0,nomark:null};
 function thrKey(){return S&&S.p&&S.p[S.cur]&&S.p[S.cur].key;}
 const _ca2=cardAnnounce;cardAnnounce=function(m,mine){const r=_ca2.apply(this,arguments);try{if(S&&S.online&&m&&(m.res==='live'||m.res==='queued')&&m.to&&m.to!==NET.myId&&m.to===thrKey()){const d=(S.p[S.cur].darts||0);
   if(m.id==='fly'&&!FLY.on){try{flySpawn('card:'+m.cid);}catch(e){}}
   if(m.id==='vape')SP.fog={key:m.to,until:d+2};
   if(m.id==='spill')SP.nomark={key:m.to,until:d+1};
   if(m.id==='flash'){try{cardFlash();}catch(e){}SP.flashT=performance.now()+1000;}
   sync();}}catch(e){}return r;};
 function on(o){return !!(o&&thrKey()===o.key&&(S.p[S.cur].darts||0)<o.until);}
 function sync(){if(!S||!S.online)return;const mine=S.cur===0;if(mine)return;document.body.classList.toggle('card-fog',on(SP.fog));document.body.classList.toggle('card-nomarker',on(SP.nomark));document.body.classList.toggle('card-noret',performance.now()<SP.flashT);}
 const _fs=cardFxSync;cardFxSync=function(){const r=_fs.apply(this,arguments);try{sync();}catch(e){}return r;};
 setInterval(()=>{try{if(S&&S.online&&!S.done&&S.cur!==0)sync();}catch(e){}},200);})();
// ---- online: everyone hears the first thrower's walk-on as the match starts ----
(function(){const _ob2=onlineBegin;onlineBegin=function(cfg){const r=_ob2.apply(this,arguments);try{const f=cfg&&cfg.players&&cfg.players[cfg.first||0];}catch(e){}return r;};})();
// ---- watching someone throw: you see it through their eyes, drink blur and all ----
setInterval(()=>{try{if(S&&S.pub&&!S.done)betBlur();}catch(e){}},400);
// ---- online bull-off: one dart each at the bull, in seat order; closest throws first. Each player's walk-on plays as they step up ----
(function(){
 const _ob3=onlineBegin;onlineBegin=function(cfg){const r=_ob3.apply(this,arguments);try{if(S&&S.online&&cfg&&cfg.players&&!S.p.some(p=>p.darts)){S.mpBullPending={order:cfg.players.map(p=>p.key),walks:Object.fromEntries(cfg.players.map(p=>[p.key,p.walk||'off']))};}}catch(e){}return r;};
 const _st=startTurn;startTurn=function(){if(S&&S.online&&S.mpBullPending&&!S.done){const P=S.mpBullPending;S.mpBullPending=null;beginBull(P);return;}return _st.apply(this,arguments);};
 const idx=k=>S.p.findIndex(p=>p.key===k);
 function beginBull(P){S.bull={mp:true,order:P.order.filter(k=>idx(k)>=0),walks:P.walks,i:0,res:{}};V.clearDarts();try{$('outshot').textContent='Bull off: closest to the bull throws first';}catch(e){}step();}
 function step(){const B=S.bull;if(!B||!B.mp)return;const k=B.order[B.i];const i=idx(k);if(i<0){B.i++;return B.i<B.order.length?step():finish();}
  S.cur=i;S.dart=1;S.visit=[];
  try{const w=B.walks[k];if(w&&w!=='off'&&window.TOPS_walk)TOPS_walk.playWalk(w);}catch(e){}
  try{pubBand('land','BULL OFF',(i===0?'Your':S.p[i].name+"'s")+' dart for the bull',1800,null);}catch(e){}
  if(i===0){S.busy=false;S.view=0;S.netAnim=false;setAim(0,0);try{$('hint').style.opacity=1;setHint();}catch(e){}}
  else{S.busy=true;S.view=1;S.oppArm={pull:0,phase:'idle'};S.netAnim=false;try{V.setOpponentLook(S.p[i].look||lookFor(S.p[i].name),S.p[i].name,ui.tier);}catch(e){}setTimeout(()=>{try{netPump();}catch(e){}},900);}
  try{updateUI();mpBoardRender();}catch(e){}}
 const _bl=bullLand;bullLand=function(x,y,far){const B=S&&S.bull;if(!B||!B.mp)return _bl.apply(this,arguments);
  const k=B.order[B.i];const d=Math.hypot(x,y);B.res[k]=d;const h=scoreAt(x,y);
  try{flash(h.label==='BULL'?'Bull':h.label==='25'?'25':Math.round(d)+' mm',h.label==='BULL'?'gold':'',S.p[S.cur]?S.p[S.cur].name:null);sfxDartHit(h.v?'hit':'miss',far);V.shake();V.punchIn(x,y,700);}catch(e){}
  S.netAnim=false;B.i++;setTimeout(()=>{try{if(B.i<B.order.length)step();else finish();}catch(e){console.warn('bulloff',e);}},1300);};
 function finish(){const B=S.bull;try{TOPS_walk&&TOPS_walk.stopWalk();}catch(e){}
  let best=null;B.order.forEach(k=>{if(B.res[k]==null)return;if(best==null||B.res[k]<B.res[best])best=k;});const wi=Math.max(0,idx(best));
  S.bull=null;V.clearDarts();S.legStarter=wi;S.cur=wi;S.netAnim=false;
  try{const el=$('intro');$('introTier').textContent='Bull off';$('introVenue').textContent=(wi===0?'You throw':S.p[wi].name+' throws')+' first';$('introFmt').textContent=Math.round(B.res[best]||0)+' mm from the bull';el.classList.add('show');say('Game on.',S.tier.caller);setTimeout(()=>{el.classList.remove('show');if(S&&!S.done)_st();},1700);}catch(e){_st();}}
})();
// ---- no walk-on picked yet? ask in the lobby ----
(function(){let asked=false;
 setInterval(()=>{try{const lob=$('onLobby');if(asked||!lob||lob.hidden||!lob.offsetParent||save.walkon)return;asked=true;const W=(window.TOPS_walk&&TOPS_walk.WALK)||[];
  const el=document.createElement('div');el.id='walkAsk';el.style.cssText='position:fixed;inset:0;z-index:150;background:rgba(6,9,10,.9);display:flex;align-items:center;justify-content:center;padding:18px';
  el.innerHTML=`<div style="max-width:420px;width:100%;color:#EDECE5;text-align:center"><b style="display:block;font:900 clamp(24px,8vw,34px)/1 'Barlow Condensed',sans-serif;text-transform:uppercase;margin-bottom:6px;white-space:nowrap">Pick your walk-on</b><p style="font:500 14px/1.45 Manrope,sans-serif;color:#c9cfce;margin:0 0 14px">Plays for everyone when you step up for the bull. Tap to hear it.</p><div id="waRow" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${W.filter(w=>w.id!=='off').map(w=>`<button type="button" data-id="${w.id}" style="min-height:52px;border-radius:12px;border:1px solid rgba(237,236,229,.2);background:#192426;color:#EDECE5;font:800 15px Manrope,sans-serif">${w.n}</button>`).join('')}</div><button type="button" id="waDone" style="margin-top:12px;width:100%;min-height:52px;border-radius:12px;border:0;background:#C6F36B;color:#10191A;font:800 16px Manrope,sans-serif" disabled>Choose one</button><button type="button" id="waNone" style="margin-top:8px;width:100%;min-height:44px;border-radius:12px;border:0;background:transparent;color:#9fa8a8;font:700 14px Manrope,sans-serif">No walk-on</button></div>`;
  document.body.appendChild(el);let pick=null;
  el.querySelectorAll('#waRow button').forEach(b=>b.onclick=()=>{pick=b.dataset.id;el.querySelectorAll('#waRow button').forEach(o=>{o.style.background=o===b?'#C6F36B':'#192426';o.style.color=o===b?'#10191A':'#EDECE5';});try{audioInit&&audioInit();}catch(e){}try{TOPS_walk.playWalk(pick);}catch(e){}const d=$('waDone');d.disabled=false;d.textContent='Walk on to '+b.textContent;});
  const done=v=>{save.walkon=v;persist();try{TOPS_walk.stopWalk();}catch(e){}el.remove();try{NET.chan&&NET.chan.track(mpMeta());}catch(e){}};
  $('waDone').onclick=()=>pick&&done(pick);$('waNone').onclick=()=>done('off');}catch(e){}},1000);})();
// ---- whose throw: big banner every time the turn changes (online and pass-and-play) ----
(function(){const st=document.createElement('style');st.textContent='#turnBan{position:fixed;left:0;right:0;top:38%;z-index:70;pointer-events:none;text-align:center;opacity:0;transform:scale(.9);transition:opacity .22s,transform .22s}#turnBan.on{opacity:1;transform:scale(1)}#turnBan b{display:inline-block;padding:10px 26px;border-radius:10px;background:rgba(8,10,12,.82);border:2px solid #C6F36B;font:800 34px/1 "Barlow Condensed",sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#EDECE5}#turnBan.me b{background:#C6F36B;color:#0b0d0e}#turnBan small{display:block;margin-top:6px;font:600 13px/1.2 Inter,sans-serif;color:#C6F36B}';document.head.appendChild(st);
 let last=null,tm=0;setInterval(()=>{try{if(!S||!S.p||S.done||!(S.online||S.mp)){last=null;return;}const p=S.p[S.cur];if(!p)return;const id=S.cur+':'+S.p.map(q=>q.legs||0).join('.');if(id===last)return;const first=last===null;last=id;if(first&&!S.online)return;
  let el=$('turnBan');if(!el){el=document.createElement('div');el.id='turnBan';document.body.appendChild(el);}
  const mine=S.online?(p.key===NET.myId):false;el.className=mine?'me':'';el.innerHTML='<b>'+(mine?'Your throw':(p.name||'Player')+"'s throw")+'</b>'+(p.score!=null?'<small>'+p.score+' left</small>':'');
  void el.offsetWidth;el.classList.add('on');clearTimeout(tm);tm=setTimeout(()=>el.classList.remove('on'),1500);
  if(mine)try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}}catch(e){}},150);})();
// no throwing while a card round is open
const _sp=startPull;startPull=function(){if(!released()){showWait();return;}return _sp.apply(this,arguments);};
// ---- drinking rules info button ----
function rulesHTML(){const P=S&&S.pub;const c=P&&P.cfg||{};const L=[];
 const sip=[];if(c.sips&&c.sips.length)sip.push(`Score exactly ${c.sips.join(', ')} in a visit: sip`);if(c.low!==false)sip.push('Visit under 60: sip. 26 or less: drink');if(c.tre&&c.tre.length)sip.push(`Hit ${c.tre.join(', ')} when you weren’t aiming at it: down it`);if(c.bust)sip.push('Bust: sip');if(c.t180!==false)sip.push('Someone hits 180: everyone else downs it. 140+: everyone else sips');
 const card=S&&S.pub&&S.pub.cards?['Every 3 rounds everyone picks a secret card. The match waits until all picks are in','Hold up to 2. Offence hits your opponent, defence protects you, self helps you','Tap a card in your tray to arm it, tap again to play it']:[];
 return `<div class="ro"><h2>Pub rules</h2>
 <h3>When you drink</h3><ul>${sip.map(x=>`<li>${x}</li>`).join('')||'<li>No sip rules this match</li>'}</ul>
 <h3>Wobble</h3><ul><li>Every sip adds wobble, up to 8</li><li>More wobble means more sway and a wider spread. The bar under your name shows it</li><li>Water cards and wins against a bet calm it back down</li></ul>
 ${c.bets?'<h3>Secret bets</h3><ul><li>Some rounds you secretly bet on your visit. Land it and your opponent drinks, miss and you do</li></ul>':''}
 ${card.length?`<h3>Cards</h3><ul>${card.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}
 <button type="button" id="rulesClose">Back to the darts</button></div>`;}
function rulesBtn(){let b=$('btnRules');const on=!!(S&&S.pub&&!S.done&&['hub','friends','result','title','msg','perk'].every(id=>{const e=document.getElementById(id);return !e||e.hidden;}));
 if(!b){b=document.createElement('button');b.id='btnRules';b.type='button';b.className='rules-btn';b.textContent='🍺 Rules';b.onclick=()=>{let o=$('rulesOv');if(!o){o=document.createElement('div');o.id='rulesOv';document.body.appendChild(o);}o.innerHTML=rulesHTML();o.hidden=false;$('rulesClose').onclick=()=>o.hidden=true;o.onclick=e=>{if(e.target===o)o.hidden=true;};};document.body.appendChild(b);}
 b.hidden=!on;}
setInterval(rulesBtn,700);
})();
</script>
<style>.mpb-cards{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:999px;background:rgba(198,243,107,.16);color:#C6F36B;font:700 11px/1.5 Manrope,sans-serif;letter-spacing:0;text-transform:none}</style>
<style>
/* v0.95: Vape Cloud is a drifting cloud, not a block. Thick in the middle of the board, wispy edges */
#cardFog{top:0;height:52%;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
 background:
  radial-gradient(circle at 50% 46%,rgba(236,236,242,.94) 0 14%,rgba(236,236,242,0) 30%),
  radial-gradient(circle at 34% 54%,rgba(228,228,236,.9) 0 11%,rgba(228,228,236,0) 26%),
  radial-gradient(circle at 66% 38%,rgba(232,232,240,.88) 0 12%,rgba(232,232,240,0) 27%),
  radial-gradient(circle at 42% 30%,rgba(225,225,234,.8) 0 9%,rgba(225,225,234,0) 22%),
  radial-gradient(circle at 62% 64%,rgba(225,225,234,.82) 0 10%,rgba(225,225,234,0) 24%),
  radial-gradient(circle at 22% 36%,rgba(220,220,230,.6) 0 7%,rgba(220,220,230,0) 18%),
  radial-gradient(circle at 80% 56%,rgba(220,220,230,.6) 0 7%,rgba(220,220,230,0) 18%);
 background-size:120% 120%;background-position:50% 50%;
 -webkit-mask-image:radial-gradient(ellipse 42% 46% at 50% 48%,#000 55%,transparent 100%);mask-image:radial-gradient(ellipse 42% 46% at 50% 48%,#000 55%,transparent 100%)}
body.card-fog #cardFog{opacity:1;animation:vapeDrift 3.2s ease-in-out infinite alternate}
@keyframes vapeDrift{0%{background-position:44% 52%;transform:scale(1)}50%{background-position:56% 46%;transform:scale(1.06)}100%{background-position:48% 56%;transform:scale(.98)}}
@media (prefers-reduced-motion:reduce){body.card-fog #cardFog{animation:none}}
/* ENG-5: off = not painted (its 10px backdrop blur sat at opacity 0 all match); on = visible at once; off = hidden after the .4s fade, so the fade looks the same */
#cardFog{visibility:hidden;transition:opacity .4s,visibility 0s .4s}body.card-fog #cardFog{visibility:visible;transition:opacity .4s,visibility 0s}
</style>
<style>.opt .n img.supimg{width:100%;height:auto;max-height:64px;object-fit:contain;transform:scale(1.25);filter:drop-shadow(0 6px 8px rgba(0,0,0,.45))}.opt .n img.gearimg{width:100%;height:auto;max-height:72px;object-fit:contain}</style>
<script>
(function(){
window.TOPS_GEAR_IMG={board:'assets/ui/ic_gear_board.webp',coach:'assets/ui/ic_gear_coach.webp',case:'assets/ui/ic_gear_case.webp'};
// setup rows get a render of your dart with that part fitted; gear rows get item art
const GEAR_IMG=Object.assign({shirt:'assets/ui/ic_shirt.webp'},window.TOPS_GEAR_IMG||{});
const _ss=showShop;showShop=function(){const r=_ss.apply(this,arguments);try{
 const SU=$('setupList');if(SU){let key=null;[...SU.children].forEach(el=>{if(el.classList.contains('label')){key=/Shaft/.test(el.textContent)?'shaft':/Flight/.test(el.textContent)?'flight':'point';return;}const t=el.querySelector('.t'),n=el.querySelector('.n');if(!t||!n||n.querySelector('img'))return;const list=key==='shaft'?SHAFTS:key==='flight'?FSHAPES:POINTS;const it=list.find(x=>x.n===t.textContent);if(!it)return;
  try{const parts=setupParts();const p=Object.assign({},parts,{barrel:barrel()});if(key==='shaft')p.shaft=it;else if(key==='flight')p.fl=it;else p.pt=it;const u=V.dartShot(save.flight,p);if(u)n.innerHTML=`<img class="supimg" src="${u}" alt="">`;}catch(e){}});}
 const G=$('gearList');if(G)[...G.children].forEach(el=>{const t=el.querySelector('.t'),n=el.querySelector('.n');if(!t||!n||n.querySelector('img'))return;const it=GEAR.find(g=>g.n===t.textContent);if(!it||!GEAR_IMG[it.id])return;const cnt=n.textContent;n.innerHTML=`<img class="gearimg" src="${GEAR_IMG[it.id]}" alt="">${cnt?`<em>${cnt}</em>`:''}`;});
}catch(e){console.warn('shop img',e);}return r;};
})();
</script>
<style>
#verGate{position:fixed;inset:0;z-index:2147483000;background:rgba(6,9,10,.94);display:flex;align-items:center;justify-content:center;padding:20px}
#verGate[hidden]{display:none}
#verGate .vg{max-width:420px;width:100%;text-align:center;color:#EDECE5}
#verGate .vg b{display:block;font:800 40px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin-bottom:8px}
#verGate .vg p{font:500 15px/1.45 Manrope,sans-serif;color:#c9cfce;margin:0 0 18px}
#verGate .vg button{width:100%;min-height:54px;border-radius:12px;background:#C6F36B;color:#10191A;border:0;font:800 17px Manrope,sans-serif}
</style>
<script>
// v0.95: never play on an old build. Checks version.json every minute and when the app comes back into view
(function(){
const vnum=s=>{const p=String(s||'0').split('.');return (+p[0]||0)*1000+(+(p[1]||0)+'').padEnd(2,'0').slice(0,2)*1+ (p[1]&&p[1].length>2?0:0);};
const cmp=(a,b)=>{const A=String(a).split('.').map(Number),B=String(b).split('.').map(Number);const fa=A[0]+((A[1]||0)/Math.pow(10,String(A[1]||0).length)),fb=B[0]+((B[1]||0)/Math.pow(10,String(B[1]||0).length));return fa-fb;};
window.TOPS_vcmp=cmp;
let latest=null;
function gate(v){let g=document.getElementById('verGate');if(!g){g=document.createElement('div');g.id='verGate';document.body.appendChild(g);}
 g.innerHTML=`<div class="vg"><b>Update now</b><p>TOPS v${v} is out. You're on v${window.TOPS_VER}. Everyone plays the same build, so reload to keep going.</p><button type="button" id="vgGo">Reload to v${v}</button><button type="button" id="vgLater" style="margin-top:10px;background:transparent;color:#c9cfce;border:1px solid rgba(237,236,229,.25)">Later, finish this first</button></div>`;
 if(window.__vgMini===v){g.hidden=true;pill(v);return;}g.hidden=false;
 document.getElementById('vgLater').onclick=()=>{window.__vgMini=v;g.hidden=true;pill(v);};
 document.getElementById('vgGo').onclick=()=>{try{persist();}catch(e){}location.replace(location.pathname+'?v='+encodeURIComponent(v)+'&t='+Date.now());};}
function pill(v){let p=document.getElementById('vgPill');if(!p){p=document.createElement('button');p.id='vgPill';p.type='button';p.style.cssText='position:fixed;top:calc(8px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147482999;background:#C6F36B;color:#10191A;border:0;border-radius:999px;padding:8px 14px;font:800 13px Manrope,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.5)';document.body.appendChild(p);}
 p.textContent='Update v'+v+' ready · tap to reload';p.onclick=()=>{try{persist();}catch(e){}location.replace(location.pathname+'?v='+encodeURIComponent(v)+'&t='+Date.now());};}
async function check(){if(location.protocol==='file:')return;try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const j=await r.json();latest=j.v;if(j.v&&cmp(j.v,window.TOPS_VER)>0)gate(j.v);}catch(e){}}
setTimeout(check,4000);setInterval(check,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});window.addEventListener('focus',check);
// multiplayer: everyone in the lobby must be on the same build
try{const _m=mpMeta;mpMeta=function(){const m=_m.apply(this,arguments);m.ver=window.TOPS_VER;return m;};}catch(e){}
window.TOPS_verCheckPlayers=list=>{const bad=(list||[]).filter(p=>p.ver&&p.ver!==window.TOPS_VER);return bad;};
})();
</script>
<script>
(function(){const _os=onlineStart;onlineStart=function(){try{const ps=mpPeers().slice(0,5);const bad=ps.filter(p=>p.key!==NET.myId&&p.ver!==window.TOPS_VER);if(bad.length){netStatus(`${bad.map(p=>p.name||'Mate').join(' and ')} ${bad.length>1?'are':'is'} on ${bad.map(p=>p.ver?'v'+p.ver:'an old version').join(', ')}. Everyone needs v${window.TOPS_VER}: close and reopen the app.`);try{netSend('vreq',{v:window.TOPS_VER});}catch(e){}return;}}catch(e){}return _os.apply(this,arguments);};
 const _nr=netRecv;netRecv=function(m){if(m&&m.t==='vreq'&&m.v&&window.TOPS_vcmp&&window.TOPS_vcmp(m.v,window.TOPS_VER)>0){try{document.dispatchEvent(new Event('visibilitychange'));}catch(e){}}return _nr.apply(this,arguments);};})();
</script>
<script>
// v0.96: card sounds play for the player who played the card too (instantly, not waiting on the network), never twice
(function(){
function cueFor(id){return id==='horn'?()=>{try{sfxHorn();}catch(e){}}:(PUBCUE&&PUBCUE.jack);}
const _cp=cardPlay;cardPlay=function(i){let id=null;try{id=S.pub.cards.hand[i];}catch(e){}const r=_cp.apply(this,arguments);try{const c=CARD[id];if(c&&(c.ty==='off'||c.ty==='chaos')){const f=cueFor(id);f&&f();window.__myCardT=performance.now();window.__myCardId=id;}}catch(e){}return r;};
const _pb=pubBand;pubBand=function(kind,title,line,ms,cue){if(window.__skipCue)cue=null;return _pb.call(this,kind,title,line,ms,cue);};
const _ca=cardAnnounce;cardAnnounce=function(m,mine){const skip=!mine&&m&&m.from===NET.myId&&window.__myCardId===m.id&&performance.now()-(window.__myCardT||0)<8000;if(skip)window.__skipCue=true;try{return _ca.apply(this,arguments);}finally{window.__skipCue=false;}};
})();
</script>
<script>
// v0.96: real crowd bed (Lee's recordings). Looping crossfade across four takes. Hushes while you aim, near-silent on big moments, swells on the cool stuff
(function(){
const CB={sets:{crowd:[],pub:[]},bufs:[],loading:false,gain:null,src:null,next:0,idx:0,boost:0,boostUntil:0,last:{}};
function get(set,name){return fetch('assets/voice/'+name+'.mp3').then(r=>r.ok?r.arrayBuffer():null).then(b=>b?AU.ctx.decodeAudioData(b):null).then(buf=>{if(buf)CB.sets[set].push(buf);}).catch(()=>{});}
function load(){if(CB.loading||!AU.ctx)return;CB.loading=true;[1,2,3,4].forEach(i=>get('crowd','crowd_'+i));[1,2,3,4,5].forEach(i=>get('pub','pub_'+i));
 fetch('assets/voice/lee_180.mp3').then(r=>r.ok?r.arrayBuffer():null).then(b=>b?AU.ctx.decodeAudioData(b):null).then(buf=>{if(buf)window.__lee180=buf;}).catch(()=>{});}
// Lee's pub recordings for the Pub and Club, the big crowd for Regional and up (online follows the venue the host picked)
function venue(){return (S&&((S.tier&&S.tier.crowd)||0)<.35)?'pub':'crowd';}
function pick(){const want=venue();const b=CB.sets[want].length?CB.sets[want]:CB.sets[want==='pub'?'crowd':'pub'];if(CB.bufs!==b){CB.bufs=b;CB.idx=Math.floor(Math.random()*Math.max(1,b.length));}return b;}
function ensure(){if(!AU.ctx||!AU.master)return false;load();if(!CB.gain){CB.gain=AU.ctx.createGain();CB.gain.gain.value=0;CB.gain.connect(AU.master);}return pick().length>0;}
function playNext(){const c=AU.ctx;const buf=CB.bufs[CB.idx%CB.bufs.length];CB.idx=(CB.idx+1+Math.floor(Math.random()*2))%Math.max(1,CB.bufs.length);
 const s=c.createBufferSource(),g=c.createGain();s.buffer=buf;s.connect(g);g.connect(CB.gain);const t=c.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1,t+1.2);const dur=buf.duration;g.gain.setValueAtTime(1,t+dur-1.4);g.gain.linearRampToValueAtTime(0,t+dur-.1);s.start(t);s.stop(t+dur);CB.next=t+dur-1.4;}
function inMatch(){return !!(S&&!S.done&&!S.practice&&S.tier);}
function target(){if(!inMatch())return 0;const isPub=venue()==='pub';const base=isPub?.42:.16+.34*Math.min(1,S.tier.crowd||.2);let k=1;const me=S.p[S.cur];
 // hush while someone is lining up, near silence for the big ones
 if(S.pulling)k*=isPub?.8:.6;try{const need=Math.ceil((S.bestOf||3)/2);const op=S.p[1-S.cur]||{};const matchDart=me&&me.legs===need-1&&me.score<=170;const decider=me&&op&&me.legs===need-1&&op.legs===need-1;if(matchDart||(decider&&me.score<=170))k*=.28;else if(me&&me.score<=100)k*=.75;}catch(e){}
 if(document.body.classList.contains('lk-cine'))k*=.2;
 if(performance.now()<CB.boostUntil)k=Math.max(k,CB.boost);return base*k;}
function events(){if(!S||!S.p)return;S.p.forEach((p,i)=>{const L=CB.last[i]||(CB.last[i]={t180:p.t180||0,legs:p.legs||0,tons:p.tons||0});
 if((p.t180||0)>L.t180){swell(2.3,4200);}else if((p.legs||0)>L.legs){const out=S.lastLegWinner&&S.lastLegWinner.out||0;swell(out>=100?2.1:1.6,out>=100?3800:2600);}else if((p.tons||0)>L.tons){swell(1.35,1800);}
 L.t180=p.t180||0;L.legs=p.legs||0;L.tons=p.tons||0;});}
function swell(k,ms){CB.boost=k;CB.boostUntil=performance.now()+ms;}
let lastS=null;
setInterval(()=>{try{if(!AU.on||!AU.ctx){if(CB.gain)CB.gain.gain.setTargetAtTime(0,AU.ctx?AU.ctx.currentTime:0,.3);return;}
 if(S!==lastS){lastS=S;CB.last={};}
 if(!ensure())return;const c=AU.ctx;const tg=target();if(tg>0&&c.currentTime>=CB.next-.05)playNext();
 if(inMatch())events();if(S&&S.done&&S.won&&!S.__cbWin){S.__cbWin=1;swell(2.4,5000);CB.boostUntil=performance.now()+5000;}
 const v=(S&&S.done&&performance.now()<CB.boostUntil)?.5*CB.boost/2.4:tg;CB.gain.gain.setTargetAtTime(v,c.currentTime,v>CB.gain.gain.value?.25:.6);}catch(e){}},120);
// Lee's 180 call replaces the synthetic one
try{const _cv=callVisit;callVisit=function(total,ctx){if(total===180&&!ctx&&window.__lee180&&AU.on&&AU.ctx){try{const s=AU.ctx.createBufferSource(),g=AU.ctx.createGain();s.buffer=window.__lee180;g.gain.value=1;s.connect(g);g.connect(AU.master);s.start();return;}catch(e){}}return _cv.apply(this,arguments);};}catch(e){}
// the synthetic crowd hum steps back now there's a real crowd
const _cs=crowdSet;crowdSet=function(level){return _cs.call(this,CB.bufs.length?level*.35:level);};
})();
</script>
