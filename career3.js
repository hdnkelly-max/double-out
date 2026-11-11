<script>
// ===== CAREER V3 "The Grind": Play board, player level + reward track, contracts, fame, revenge, reward overlay =====
(function(){
const XPMUL=[1,1.25,1.5,2,2.5,3.5,5];
const CASHR=[10,25,60,200,500,1500,4000];
const CONPAY=[15,40,120,350,1000,3000,8000];
const FL_X=[['#ff8a00','Blaze'],['#1f1f1f','Blackout'],['#e9e4d8','Chalk'],['#ff3ea5','Hot pink'],['#00c2a8','Teal'],['#c0c0c0','Silver'],['#d4af37','Gold leaf'],['#7a0019','Claret'],['#2b59ff','Royal'],['#9be15d','Lime'],['#5b2a86','Grape'],['#ff2d2d','Signal'],['#00e5ff','Ice'],['#ffd400','Taxi'],['#ff7b9c','Flamingo'],['#3d3d3d','Gunmetal'],['#0a7d46','Bottle'],['#ff5500','Hi-vis'],['#a0d8ef','Sky'],['#f5f5dc','Ivory']];
const SH_X=[['#0b3d2e','Racing green'],['#3a1f5c','Purple haze'],['#c9a227','Old gold'],['#5a5a5a','Slate'],['#0e6ba8','Ocean'],['#8a1c1c','Oxblood'],['#f4f1ea','Bone'],['#ff6b00','Hi-vis'],['#111a3a','Midnight'],['#d6336c','Raspberry'],['#2d6a4f','Fern'],['#b08968','Tan'],['#6c757d','Smoke'],['#e63946','Poppy'],['#1d3557','Navy'],['#ffb703','Amber'],['#023047','Deep sea'],['#9d0208','Blood'],['#4a4e69','Storm'],['#000000','Jet']];
const TITLES={10:'The Fill-in',20:'Pub Hero',30:'Club Hustler',40:'Stage Ready',50:'Circuit Grinder',60:'Ditch Crosser',70:'Card Holder',80:'Floor Assassin',90:'Palace Bound',100:'Legend of the Oche'};
function rIco(r){if(!r)return '';
 // flights and shirts show the real thing in the colour you unlocked: the game's own dart render and player render
 try{if(r.k==='flight'&&V.dartShot){const src=V.dartShot(r.v,Object.assign({barrel:barrel()},setupParts(),{custom:true}));if(src)return `<span class="ri ri-dart"><img src="${src}" alt=""></span>`;}
  if(r.k==='shirt'&&V.heroShot){const src=V.heroShot(Object.assign({},save.look,{shirt:r.v,shirtTint:true}),save.name||'You',tierOf(),save.flight);if(src&&typeof src==='string')return `<span class="ri ri-hero"><img src="${src}" alt=""></span>`;}}catch(e){}
 const f={flight:'flights',shirt:'shirt',title:'title',cash:'cash'}[r.k]||'star';return `<span class="ri"><img src="assets/ui/ic_${f}.webp" alt="">${(r.k==='flight'||r.k==='shirt')?`<i class="sw" style="background:${r.v}"></i>`:''}</span>`;}
function bigIco(r){if(!r)return '';const f={flight:'flights',shirt:'shirt',title:'title',cash:'cash'}[r.k]||'star';return `<img src="assets/ui/ic_${f}.webp" alt="">${(r.k==='flight'||r.k==='shirt')?`<i class="sw" style="background:${r.v}"></i>`:''}`;}
function heroImg(cls){let u='';try{u=V.heroShot&&V.heroShot(save.look,save.name||'You',tierOf(),save.flight);}catch(e){}return u?`<img class="c3x-pl ${cls||''}" src="${u}" alt="">`:'';}
function lvNeed(L){return Math.round(150+25*L+.6*L*L);}
// reward for reaching level L: deterministic so the track can be previewed
function rewardAt(L){if(TITLES[L])return {k:'title',v:TITLES[L],n:`Title: ${TITLES[L]}`,big:1};
 if(L%5===0){const s=SH_X[(L/5-1)%SH_X.length];return {k:'shirt',v:s[0],n:`${s[1]} shirt`,big:1};}
 if(L%3===0||L===2){const i=L===2?0:(Math.floor(L/3))%FL_X.length;const f=FL_X[i];return {k:'flight',v:f[0],n:`${f[1]} flights`};}
 return {k:'cash',v:0,n:'Cash bonus'};}
function V3(){const c=career();if(!c||c.run)return null;if(!c.v3){c.v3={xp:0,lv:1,fame:Math.min(20,(c.tier||0)*12),con:[],unl:[],rev:null,title:'',conDone:0,best:0};}return c.v3;}
window.c3State=V3;
function c3First(n){const w=String(n).split(' ');return (w.length>1&&w[0].length>3&&!/^(Big|Old|Pete)$/.test(w[0]))?w[0]:n;}
function c3Norm(){const v=V3();if(v&&v.xp>=lvNeed(v.lv))gainLevels(v,0);}
// unlocked cosmetics flow into the creator / kit swatch lists
function applyUnlocks(){const v=V3();if(!v)return;for(const u of v.unl){if(u.k==='flight'&&!FLIGHTS.includes(u.v))FLIGHTS.push(u.v);if(u.k==='shirt'&&!SHIRTS.includes(u.v))SHIRTS.push(u.v);}}
function stars(f){const n=Math.max(0,Math.min(5,f/20));let s='';for(let i=0;i<5;i++)s+=i<Math.floor(n)?'★':(i<n?'⯪':'☆');return s;}
function tierOf(){const c=career();return c?c.tier:0;}
// ----- contracts -----
const FROM=['The Kauri','Jonno','Shah Electrical','Tama','Kev','The club bar'];
const CON_T=[
 {id:'tons',mk:t=>{const n=[2,3,3,4,4,5,5][t];return {n,t:`Hit ${n} tons in one match`};},ok:(m,n)=>m.tons>=n},
 {id:'v140',mk:t=>({t:'Hit a 140 or better'}),ok:m=>m.maxV>=140},
 {id:'co',mk:t=>{const n=[40,50,60,70,80,90,100][t];return {n,t:`Check out ${n} or more`};},ok:(m,n)=>m.maxCo>=n},
 {id:'leg',mk:t=>{const n=[24,21,21,18,18,15,15][t];return {n,t:`Win a leg in ${n} darts or fewer`};},ok:(m,n)=>m.bestLeg<=n},
 {id:'perf',mk:t=>{const n=[6,7,8,9,10,11,12][t];return {n,t:`${n} perfect releases in one match`};},ok:(m,n)=>m.perf>=n},
 {id:'avg',mk:t=>{const n=TIERS[t].avg-4;return {n,t:`Average ${n}+ in a match`};},ok:(m,n)=>m.avg>=n},
 {id:'clean',mk:t=>({t:'Win a match without dropping a leg'}),ok:m=>m.won&&m.opLegs===0},
 {id:'t180',mk:t=>({t:'Hit a 180'}),min:1,ok:m=>m.n180>0}];
function fillContracts(){const v=V3();if(!v)return;const t=tierOf();let guard=0;while(v.con.length<3&&guard++<30){const pool=CON_T.filter(x=>!v.con.some(c=>c.id===x.id)&&!(x.min&&t<x.min));const T=pool[Math.floor(Math.random()*pool.length)];if(!T)break;const m=T.mk(t);v.con.push({id:T.id,n:m.n,t:m.t,from:FROM[Math.floor(Math.random()*FROM.length)],cash:CONPAY[t],tier:t});}}
// ----- match summary from the finished match -----
function summary(){const me=S.p[0],op=S.p[1];const vl=me.vlog||[],ol=me.olog||[];return {won:!!S.won,tons:me.tons||0,maxV:vl.length?Math.max(...vl):0,n180:me.t180||0,maxCo:ol.length?Math.max(...ol.map(o=>o[0])):0,bestLeg:me.bestLeg||99,perf:me.perfects||0,avg:avg(me),opLegs:op?op.legs:0,vl,ol,legs:me.legs};}
function xpBreakdown(m,ranked,side){const t=tierOf(),mul=XPMUL[t];const L=[];const add=(n,x)=>{if(x>0)L.push([n,Math.round(x)]);};
 if(ranked){add('Match played',60*mul);if(m.won)add('Win',100*mul);}else if(side){add('Side match',30*mul);if(m.won)add('Win',60*mul);}
 const c1=m.vl.filter(v=>v>=100&&v<140).length,c2=m.vl.filter(v=>v>=140&&v<180).length,c3=m.vl.filter(v=>v===180).length;
 add(`Tons ×${Math.min(5,c1)}`,Math.min(5,c1)*12);add(`140+ ×${Math.min(3,c2)}`,Math.min(3,c2)*25);add(`180 ×${Math.min(2,c3)}`,Math.min(2,c3)*80);
 const o1=m.ol.filter(o=>o[0]>=40&&o[0]<80).length,o2=m.ol.filter(o=>o[0]>=80&&o[0]<120).length,o3=m.ol.filter(o=>o[0]>=120).length;
 add(`Checkouts 40+ ×${Math.min(3,o1)}`,Math.min(3,o1)*15);add(`Checkouts 80+ ×${Math.min(2,o2)}`,Math.min(2,o2)*35);if(o3)add(`Big finish ${Math.max(...m.ol.map(o=>o[0]))}`,75);
 let sp=0;m.ol.map(o=>o[1]).sort((a,b)=>a-b).slice(0,3).forEach(d=>{sp+=d<=12?80:d<=15?45:d<=18?25:0;});add('Quick legs',sp);
 const need=Math.ceil((S.bestOf||3)/2);if(m.won&&m.legs===need&&m.opLegs===need-1)add('Deciding leg',60);
 (S.featsNew||[]).forEach(f=>add('Feat: '+f.n,80*mul)); if(m.won&&S.rival)add('Beat your rival',75);if(m.won&&S.revenge)add('Revenge',75);
 if(S.after==='promo')add('Promotion',350);if(S.after==='champion')add('Title',250);
 return L;}
function gainLevels(v,xp){const ups=[];v.xp+=xp;while(v.lv<100&&v.xp>=lvNeed(v.lv)){v.xp-=lvNeed(v.lv);v.lv++;const r=Object.assign({lv:v.lv},rewardAt(v.lv));if(r.k==='cash'){r.v=CASHR[tierOf()];r.n=`${money(r.v)} bonus`;career().bank+=r.v;}if(r.k==='title')v.title=r.v;v.unl.push(r);ups.push(r);}applyUnlocks();return ups;}
// ----- after every career match -----
let pre=null;
const _cam=careerAfterMatch;careerAfterMatch=function(){const c=career();const v=V3();if(!v||S.practice||S.drill){return _cam.apply(this,arguments);}
 const ranked=!S.local&&!S_money&&!S.intro;const side=!ranked&&!S.intro;const before={lv:v.lv,xp:v.xp,bank:c.bank,fame:v.fame};
 const r=_cam.apply(this,arguments);
 const m=summary();const L=xpBreakdown(m,ranked,side);
 // contracts (any competitive career match)
 const done=[];v.con=v.con.filter(k=>{const T=CON_T.find(x=>x.id===k.id);if(T&&T.ok(m,k.n)){done.push(k);return false;}return true;});
 done.forEach(k=>{c.bank+=k.cash;S.earned=(S.earned||0)+k.cash;v.fame=Math.min(100,v.fame+3);L.push([`Contract: ${k.t}`,100]);v.conDone++;});
 // fame
 if(ranked&&m.won)v.fame=Math.min(100,v.fame+2);if(m.won&&S.rival)v.fame=Math.min(100,v.fame+3);if(S.after==='promo')v.fame=Math.min(100,v.fame+8);if(S.after==='champion')v.fame=Math.min(100,v.fame+10);if(ranked&&!m.won&&S.hard)v.fame=Math.max(0,v.fame-1);
 // revenge: a ranked loss to a named opponent opens a rematch for the spare night
 if(ranked&&!m.won){const op=S.p[1];v.rev={name:op.name,raw:1,avg:Math.round(S.oppRaw||S.oppAvg||TIERS[c.tier].avg),stake:Math.round((MM_PAY[c.tier]||30)*1.5),wk:c.season?c.season.week:0,tier:c.tier};}
 else if(S.revenge){v.rev=null;}
 const xp=L.reduce((a,b)=>a+b[1],0);const ups=gainLevels(v,xp);
 if(m.avg>v.best)v.best=+m.avg.toFixed(1);
 fillContracts();
 pre={before,after:{lv:v.lv,xp:v.xp,bank:c.bank,fame:v.fame},L,xp,ups,done,m,cash:S.earned||0,ranked};persist();return r;};
// ----- reward overlay -----
function hookLine(){const c=career(),v=V3();if(!v)return '';const sn=c.season;
 if(sn&&!sn.ko&&!sn.done){const rows=seasonPos(sn);const yi=rows.findIndex(r=>r.you);const left=sn.len-sn.week+1;if(left<=2&&left>0){return yi<=1?`${left===1?'Last fixture':'Two to go'}. Hold your spot and you’re promoted.`:`${left===1?'Last fixture':'Two to go'}. ${rows[1].pts-rows[yi].pts} points off promotion.`;}}
 if(v.rev&&c.season&&v.rev.wk===c.season.week&&v.rev.tier===c.tier)return `${c3First(v.rev.name)} wants another go. ${money(v.rev.stake)} on it.`;
 const need=lvNeed(v.lv),left=need-v.xp;const nx=rewardAt(v.lv+1);if(left<need*.3)return `${left} XP to level ${v.lv+1}: ${nx.k==='cash'?'cash bonus':nx.n}.`;
 const k=v.con[0];if(k)return `Contract: ${k.t} · ${money(k.cash)}`;
 return v.best?`Career-best match average ${v.best}. Beat it.`:'';}
window.c3HookLine=hookLine;
function ensureOverlay(){let el=$('c3rw');if(el)return el;el=document.createElement('div');el.id='c3rw';el.className='c3rw';el.hidden=true;document.body.appendChild(el);return el;}
function countUp(node,from,to,ms,fmt){const t0=performance.now();const f=()=>{const k=Math.min(1,(performance.now()-t0)/ms);const e=1-Math.pow(1-k,3);node.textContent=fmt(Math.round(from+(to-from)*e));if(k<1&&!node._skip)requestAnimationFrame(f);else node.textContent=fmt(to);};f();}
function sfxC(kind){try{if(!AU||!AU.ctx||!AU.on)return;if(kind==='thud')noiseBurst({dur:.18,freq:140,q:.7,gain:.12});else if(kind==='coin')noiseBurst({dur:.06,freq:3200,q:4,gain:.035});else if(kind==='tick')noiseBurst({dur:.05,freq:1800,q:6,gain:.04});else if(kind==='lvl')sfxPerfect(2);}catch(e){}}
function buzz(p){try{if(navigator.vibrate&&save.haptics!==false)navigator.vibrate(p);}catch(e){}}
function showReward(){const P=pre;pre=null;if(!P)return;const achs=payAch(P);const el=ensureOverlay();const c=career(),v=V3();const op=S?S.p[1]:null;
 const res=P.m.won?'Win':'Loss';const sc=`${S?S.p[0].legs:0}–${op?op.legs:0} v ${op?(op.disp||op.name):''}`;
 const src=P.L.filter(x=>!/^Contract/.test(x[0])).sort((a,b)=>b[1]-a[1]);const top=src.slice(0,2);const rest=src.length-top.length;
 const hero=P.ups.find(u=>u.big)||P.ups[P.ups.length-1]||null;const cos=hero&&(hero.k==='flight'||hero.k==='shirt');
 const pct0=Math.min(100,P.before.xp/lvNeed(P.before.lv)*100),pct1=Math.min(100,v.xp/lvNeed(v.lv)*100);
 const hook=(()=>{const h=hookLine();return /^Contract/.test(h)?'':h;})();
 el.innerHTML=`<div class="c3rw-card ${P.m.won?'w':'l'}" role="dialog" aria-label="Match rewards">${heroImg('rwhero')}
  <div class="c3rw-top"><b class="c3rw-res" id="c3rwRes">${res}</b><span class="c3rw-sc">${sc}</span></div>
  ${(()=>{const me=S&&S.p[0];if(!me||!me.darts)return '';const avg=(me.pts/me.darts*3).toFixed(1);const co=me.coAtt?Math.round(me.coHit/me.coAtt*100)+'%':'–';const t=[['Average',avg],[me.t180>1?'180s':'Best visit',me.t180>1?me.t180:(me.bestVisit||'–')],[me.hf?'High out':'Checkout',me.hf?me.hf:co]];return `<div class="c3rw-stats">${t.map(([k,v])=>`<div><b>${v}</b><small>${k}</small></div>`).join('')}</div>`;})()}
  <div class="c3rw-cash${P.cash>0?'':' none'}"><b class="c3-cash" id="c3rwCash">+$0</b><small>${P.cash>0?(P.m.won?'prize & bonuses':'appearance & bonuses'):'no prize this time'}</small></div>
  <div class="c3rw-xp"><b id="c3rwXp">+0 career XP</b><div class="c3-lvrow"><span class="c3-lvn" id="c3rwLv">Lv ${P.before.lv}</span><div class="c3-bar"><i id="c3rwBar" style="width:${pct0}%"></i></div><span class="c3-lvn dim" id="c3rwLv2">${P.before.lv+1}</span></div>
   <p class="c3rw-src">${top.map(([n,x])=>`${n} <b>+${x}</b>`).join(' · ')}${rest>0?` · +${rest} more`:''}</p></div>
  ${hero?'':'<!--nohero-->'}<div class="c3rw-unl" id="c3rwUnl" hidden>${hero?`<small>Level ${hero.lv} unlocked</small><b>${hero.n}</b>${P.ups.length>1?`<span>Plus ${P.ups.length-1} more · see Player</span>`:''}${rIco(hero)}`:''}</div>
  ${achs.map(a=>`<div class="c3rw-ach t-${a.t}"><i>${achIco(a)}</i><div><small>Achievement \u00b7 ${(ACHR[a.t]||ACHR.R).lab}</small><b>${a.n}</b><span>${a.d}</span></div><em>+${a._xp} XP<br>+${money(a._cash)}</em></div>`).join('')}
  ${P.done.length?`<div class="c3rw-con" id="c3rwCon">${P.done.map(k=>`<span><i>✓</i>${k.t} <em>${money(k.cash)}</em></span>`).join('')}</div>`:''}
  ${hook?`<p class="c3rw-hook" id="c3rwHook">${hook}</p>`:''}
  <div class="c3rw-act"><button type="button" class="big" id="c3rwGo">${cos?'Equip new '+(hero.k==='flight'?'flights':'shirt'):'Continue'}</button>${cos?'<button type="button" class="c3rw-keep" id="c3rwKeep">Keep current '+(hero.k==='flight'?'flights':'shirt')+'</button>':''}<button type="button" class="c3rw-det" id="c3rwDet">Match details</button></div></div>`;
 const R=$('result');if(R)R.classList.add('c3-dim');
 el.hidden=false;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');try{if(window.TOPS_REWARD)TOPS_REWARD(el);}catch(e){console.warn('reward hook',e);}
 const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;const big=!!P.ups.length;
 const cashN=$('c3rwCash'),xpN=$('c3rwXp'),bar=$('c3rwBar'),lvN=$('c3rwLv'),lv2=$('c3rwLv2');const T=[];const at=(ms,f)=>T.push(setTimeout(f,rm?0:ms));
 sfxC('thud');
 at(180,()=>{$('c3rwRes').classList.add('in');buzz(12);});
 at(420,()=>{countUp(cashN,0,Math.max(0,P.cash),430,n=>'+'+money(n));sfxC('coin');});
 at(650,()=>{countUp(xpN,0,P.xp,450,n=>'+'+n+' career XP');
  if(big){bar.style.transition=rm?'none':'width .3s ease-in';bar.style.width='100%';at(980,()=>{bar.style.transition='none';bar.style.width='0%';lvN.textContent='Lv '+v.lv;lv2.textContent=Math.min(100,v.lv+1);lvN.parentNode.classList.add('pop');sfxC('lvl');buzz([15,40,15]);requestAnimationFrame(()=>{bar.style.transition=rm?'none':'width .4s ease-out';bar.style.width=pct1+'%';});});}
  else{bar.style.transition=rm?'none':'width .45s ease-out';bar.style.width=pct1+'%';}});
 at(big?1100:1100,()=>{const k=$('c3rwCon');if(k){k.classList.add('in');sfxC('tick');}});
 at(big?1450:1250,()=>{const u=$('c3rwUnl');if(u&&hero)u.hidden=false;});
 at(big?2100:1400,()=>{const h=$('c3rwHook');if(h)h.classList.add('in');});
 const finish=()=>{T.forEach(clearTimeout);cashN._skip=xpN._skip=1;cashN.textContent='+'+money(Math.max(0,P.cash));xpN.textContent='+'+P.xp+' career XP';lvN.textContent='Lv '+v.lv;lv2.textContent=Math.min(100,v.lv+1);bar.style.transition='none';bar.style.width=pct1+'%';$('c3rwRes').classList.add('in');const u=$('c3rwUnl');if(u&&hero)u.hidden=false;['c3rwCon','c3rwHook'].forEach(id=>{const e=$(id);if(e)e.classList.add('in');});};
 const close=then=>{finish();el.classList.remove('on');el.hidden=true;if(R)R.classList.remove('c3-dim');if(then)then();};
 el.querySelector('.c3rw-card').addEventListener('pointerdown',e=>{if(!e.target.closest('button'))finish();});
 $('c3rwGo').onclick=()=>{if(cos){if(hero.k==='flight'){save.flight=hero.v;save.flightCustom=true;}else{save.look.shirt=hero.v;save.look.shirtTint=true;}persist();try{V.setPlayerLook(save.look,save.flight);}catch(e){}}close(()=>$('btnResultNext').click());};
 {const kp=$('c3rwKeep');if(kp)kp.onclick=()=>close(()=>$('btnResultNext').click());}
 $('c3rwDet').onclick=()=>close();}
const _em=endMatch;endMatch=function(){const r=_em.apply(this,arguments);if(pre&&ui.mode==='career')setTimeout(showReward,850);return r;};
// ----- achievements pay out and show in the reward overlay -----
const ACHR={L:{xp:600,cash:4,lab:'Legendary'},E:{xp:300,cash:2,lab:'Epic'},R:{xp:150,cash:1,lab:'Rare'}};
let achQ=[];
const _au=achUnlock;achUnlock=function(id){const had=achHas(id);const r=_au.apply(this,arguments);const c=career();if(!had&&achHas(id)&&c&&!c.run&&!(S&&S.practice)){const a=ACH.find(x=>x.id===id);if(a)achQ.push(a);}return r;};
function payAch(P){if(!achQ.length)return [];const c=career(),v=V3();const got=achQ.splice(0);let xp=0,cash=0;got.forEach(a=>{const R=ACHR[a.t]||ACHR.R;a._xp=R.xp;a._cash=CASHR[tierOf()]*R.cash;xp+=a._xp;cash+=a._cash;});c.bank+=cash;if(P){P.cash+=cash;P.xp+=xp;const ups=gainLevels(v,xp);P.ups=P.ups.concat(ups);}else gainLevels(v,xp);persist();return got;}
// ----- revenge match -----
function playRevenge(){const c=career(),v=V3();const R=v&&v.rev;if(!R)return;S_money=true;beginMatch({mode:'career',tier:c.tier,p0:save.name||'You',oppName:R.name,oppAvg:R.avg,legs:3,purse:R.stake,money:true});if(S)S.revenge=true;v.rev=null;persist();}
// ----- hub: four tabs + Play board -----
function nav(){const tabs=$('hubTabs');if(!tabs||tabs._c3)return;tabs._c3=1;
 const mk=(t,txt)=>{let b=tabs.querySelector(`[data-t=${t}]`);if(!b){b=document.createElement('button');b.type='button';b.dataset.t=t;tabs.appendChild(b);}b.textContent=txt;if(!b.hasAttribute('aria-pressed'))b.setAttribute('aria-pressed','false');return b;};
 const order=[['play','Play'],['season','Career'],['kit','Store'],['player','Player'],['practice','Practice']];const keep=order.map(([t,x])=>mk(t,x));['board'].forEach(t=>{const b=tabs.querySelector(`[data-t=${t}]`);if(b){b.classList.add('c3-hid');}});{const k=tabs.querySelector('[data-t=kit]');if(k)k.classList.remove('c3-hid');}keep.forEach(b=>tabs.appendChild(b));['board'].forEach(t=>{const b=tabs.querySelector(`[data-t=${t}]`);if(b)tabs.appendChild(b);});
 [...tabs.children].forEach(b=>{if(!b._c3){b._c3=1;b.addEventListener('click',()=>{const t=b.dataset.t;if(t==='season'){hubTab('season');renderSeason();}});}});
 // sections
 const hub=$('hub');const body=hub.querySelector('.hx-body');
 if(!$('c3play')){const s=document.createElement('section');s.className='htab c3p';s.dataset.t='play';s.id='c3play';hub.insertBefore(s,hub.querySelector('.hx-main'));}
 if(!$('c3season')){const s=document.createElement('section');s.className='htab c3s';s.dataset.t='season';s.id='c3season';s.hidden=true;body.insertBefore(s,body.firstChild);}
 if(!$('c3plv')){const pl=body.querySelector('.htab[data-t=player]');const d=document.createElement('div');d.id='c3plv';d.className='c3pl';pl.insertBefore(d,pl.firstChild);}}
const NAVI={play:['Play','<path d="M7 4l13 8-13 8z"/>'],season:['Career','<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 20h8"/>'],kit:['Store','<path d="M3 4h3l2 11h11l2-8H7"/><circle cx="10" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>'],player:['Player','<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/>'],practice:['Practice','<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>']};
function navIcons(){const tb=$('hubTabs');if(!tb)return;Object.keys(NAVI).forEach(t=>{const b=tb.querySelector(`[data-t=${t}]`);if(b&&!b.querySelector('svg'))b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${NAVI[t][1]}</svg><span>${NAVI[t][0]}</span>`;});}
function fixtureCost(c,n){if(c.run||n.intro)return {fee:0,trav:0};const fee=FIXPAY[c.tier][2];const trav=c.travelCredit>0?0:(TRAVEL[c.tier]||0);return {fee,trav};}
function renderPlay(){const c=career(),v=V3();const host=$('c3play');if(!host||!v)return;const t=TIERS[c.tier];const sn=c.season;const n=c.next||nextOpponent();
 const rows=sn&&!sn.ko?seasonPos(sn):null;const yi=rows?rows.findIndex(r=>r.you):-1;const played=sn?sn.table.some(r=>r.p>0):false;
 let race='';if(sn&&sn.ko)race=`Knockout · round ${Math.min(sn.week,sn.len)} of ${sn.len}`;else if(rows){const gap=yi<=1?0:rows[1].pts-rows[yi].pts;race=!played?'Season starts tonight':yi<=1?`${ord(yi+1)} · promotion places`:`${ord(yi+1)} · ${gap} pt${gap===1?'':'s'} off promotion`;}else race=n.intro?'Fill-in night':t.n;
 const pips=sn?sn.fixtures.map((nm,k)=>{const r=(sn.results||[])[k];const cur=k===Math.min(sn.week,sn.len)-1&&!sn.done;return `<i class="${r?(r.won?'w':'l'):''}${cur?' cur':''}"></i>`;}).join(''):'';
 const cost=fixtureCost(c,n);const tot=cost.fee+cost.trav;const fp=FIXPAY[c.tier];const short=tot>c.bank;
 const row=sn&&!sn.ko?sn.table.find(r=>r.name===n.oppName):null;const opos=row&&played?seasonPos(sn).indexOf(row)+1:0;
 const last=sn&&!sn.ko&&sn.week===sn.len;const promoNight=last&&yi>=0&&yi<=2;
 const kicker=n.intro?'Fill-in match':sn&&sn.ko?matchKind(n,c,t).kind:last?'Final fixture':`Tonight · week ${Math.min(sn?sn.week:1,sn?sn.len:1)}`;
 const meta=[`Avg ${n.oppAvg}`,`Best of ${n.legs}`];if(opos)meta.push(`${ord(opos)} in table`);if(n.rival)meta.push(`Rival ${c.rivalW||0}–${c.rivalL||0}`);
 const winTxt=n.intro?'a place in the team':sn&&sn.ko?(sn.week===sn.len?`world champion · ${money(t.purse*4)}`:`next round · ${money(fp[0])}`):`+2 pts · ${money(fp[0]+fp[3])}`;
 const loseTxt=n.intro?'a beer anyway':sn&&sn.ko?'out':`${fp[1]+fp[3]?money(fp[1]+fp[3]):'nothing'}`;
 const cta=n.intro?'Walk on':tot?(short?`Short ${money(tot-c.bank)} · tap for options`:`Pay ${money(tot)} & walk on`):'Walk on';
 const used=!!(sn&&sn.side);
 const alts=[];const revOn=v.rev&&sn&&v.rev.wk===sn.week&&v.rev.tier===c.tier;if(revOn)alts.push({id:'rev',k:'Revenge',h:`Rematch ${c3First(v.rev.name)}`,s:`Win ${money(v.rev.stake)}`,hot:1});
 alts.push({id:'money',k:'Money match',h:'Kauri back room',s:`Win ${money(MM_PAY[c.tier]||30)}`});
 if(alts.length<2)alts.push({id:'local',k:'Local night',h:'Open draw',s:`Win ${money(Math.max(15,Math.round(TIERS[Math.max(0,c.tier-1)].purse*.15)))}`});
 const k0=v.con[0];const nx=rewardAt(v.lv+1);const pct=Math.min(100,v.xp/lvNeed(v.lv)*100);
 // only promotion or a near unlock earn the hook line here (revenge already has its card, contract has its line)
 let hook='';{const h=hookLine();if(h&&!/wants another go|^Contract/.test(h))hook=h;}
 const big=race.match(/^(\d+(?:st|nd|rd|th))\s*·\s*(.*)$/);const bigA=big?big[1]:(sn&&sn.ko?`Rd ${Math.min(sn.week,sn.len)}`:n.intro?'Fill‑in':'Wk '+(sn?Math.min(sn.week,sn.len):1));const bigB=big?big[2]:(sn&&sn.ko?`of ${sn.len} · lose and you’re out`:race);
 const oppPt=V.portrait(oppLookFor(n),n.oppName2||n.oppName,c.tier,0);const vimg=c.tier<=1?'pub':c.tier<=3?'club':'stage';
 const altArt={rev:oppPt?`url(${oppPt})`:'',money:'url(assets/ui/th_backroom.webp),url(assets/ui/bg_pub.webp)',local:`url(assets/ui/th_local.webp),url(assets/ui/bg_${vimg}.webp)`};
 host.innerHTML=`
 <section class="c3x-hero">${heroImg()}<div class="c3x-copy"><div class="c3x-k">${sn?(sn.ko?'The Palace':`${t.n} · week ${Math.min(sn.week,sn.len)} of ${sn.len}`):t.n}</div><h1 class="c3x-big">${bigA}</h1><div class="c3x-sub">${bigB}</div><div class="c3-pips" aria-label="Season form">${pips}</div></div></section>
 <article class="c3x-fix${promoNight?' promo':''}${n.rival?' rival':''}">
  ${promoNight?`<div class="c3-promo">${yi<=1?'Win and you’re up':'Win and hope'}</div>`:''}
  <div class="c3x-vs">${oppPt?`<img class="c3x-opp" src="${oppPt}" alt="">`:''}<div class="c3x-who"><div class="c3x-k lime">${kicker}</div><h2>${n.oppName}</h2><div class="c3x-meta">${meta.join(' · ')}</div></div></div>
  <div class="c3x-stakes"><div><small>Win</small><b>${winTxt}</b></div><div><small>Lose</small><b class="dim">${loseTxt}</b></div></div>
  <button type="button" class="big c3-go${short?' short':''}" id="c3Go">${cta}</button>
  ${tot?`<div class="c3-cost">${short?`You’ve got ${money(c.bank)}. Money match or hardship entry.`:`Entry ${money(cost.fee)}${cost.trav?` · travel ${money(cost.trav)}`:''} · leaves ${money(c.bank-tot)}`}</div>`:''}
 </article>
 <div class="c3x-sh"><b>Spare night</b><span>${used?`Used · ${sn.sideKind||'activity'}`:'1 available'}</span></div>
 <div class="c3x-alts">${alts.slice(0,2).map(a=>`<button type="button" class="c3x-alt ${a.id}${a.hot?' hot':''}" data-a="${a.id}" ${used?'disabled':''} style="--art:${altArt[a.id]||altArt.local}"><small>${a.k}</small><b>${a.h}</b><span>${used?'Next week':a.s}</span></button>`).join('')}</div>
 <button type="button" class="c3x-unl" id="c3Lvl"><div class="c3x-ucopy"><small>Next unlock · level ${v.lv+1}</small><b>${nx.k==='cash'?'Cash bonus':nx.n}</b><div class="c3-bar"><i style="width:${pct}%"></i></div><span>Lv ${v.lv} · ${v.xp} / ${lvNeed(v.lv)} XP</span></div><div class="c3x-item">${bigIco(nx)}</div></button>
 ${k0?`<button type="button" class="c3x-con" id="c3Con"><span class="c3x-k lime">Pinned contract</span><b>${k0.t}</b><em>${money(k0.cash)}</em></button>`:''}
 ${hook?`<p class="c3-hook">${hook}</p>`:''}`;
 const go=$('c3Go');go.onclick=()=>{const pricey=tot&&!short&&tot>c.bank*.3;if(pricey&&!go.dataset.arm){go.dataset.arm=1;go.classList.add('arm');go.textContent=`Tap again · leaves ${money(c.bank-tot)}`;setTimeout(()=>{if(go.isConnected){delete go.dataset.arm;go.classList.remove('arm');go.textContent=cta;}},3000);return;}playNext();};
 host.querySelectorAll('.c3x-alt,.c3-alt').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='rev')playRevenge();else if(a==='money')moneyMatch();else if(a==='local')playLocal();});
 const cb=$('c3Con');if(cb)cb.onclick=()=>{hubTab('season');renderSeason();};$('c3Lvl').onclick=()=>{hubTab('player');showPlayer(true);};}
const REP=[[0,'Unknown','Win a few and the regulars learn your name'],[20,'Local name','Sponsors start watching the table'],[40,'Talked about','Sponsor offers and invitations open up'],[60,'Crowd favourite','Bigger invitations, better deals'],[80,'Box office','Your name sells tickets']];
function renderSeason(){const c=career(),v=V3();const host=$('c3season');if(!host||!v)return;const aside=document.querySelector('#hub .hx-season');const sn=c.season;const n=c.next;
 const rows=sn&&!sn.ko?seasonPos(sn):null;const yi=rows?rows.findIndex(r=>r.you):-1;
 const rep=REP.filter(r=>v.fame>=r[0]).pop();const nextRep=REP.find(r=>r[0]>v.fame);
 const stake=rows?(yi<=1?`In the promotion places. ${sn.len-sn.week+1} fixture${sn.len-sn.week===0?'':'s'} left.`:(rows[1].pts-rows[yi].pts<=0?`Level on points with the top two. ${sn.len-sn.week+1} fixtures left.`:`${rows[1].pts-rows[yi].pts} pts behind ${rows[1].name} for promotion. ${sn.len-sn.week+1} left.`)):sn&&sn.ko?'Knockout. Lose once and it’s over.':'';
 const ch=String(CHAPTERS[c.tier]).split(' · ');const ROADV=['th_local','bg_pub','bg_club','bg_club','bg_stage','th_arena','bg_stage'];const ROADP=['center','70% 50%','30% 40%','75% 50%','50% 35%','center','80% 40%'];
 const me=rows&&rows[yi];
 host.innerHTML=`<section class="c3x-hero c3x-ch">${heroImg()}<div class="c3x-copy"><div class="c3x-k">${ch[0]}</div><h1 class="c3x-big sm">${ch[1]||TIERS[c.tier].n}</h1><div class="c3x-sub">${stake}</div></div></section>
 <div class="c3x-strip"><div><small>Position</small><b>${rows&&me&&me.p>0?ord(yi+1):'–'}<i>/${rows?rows.length:'–'}</i></b></div><div><small>Points</small><b>${me?me.pts:'–'}</b></div><div><small>Record</small><b>${c.wins}–${c.losses}</b></div><div><small>Next</small><b class="nm">${n?c3First(n.oppName):'–'}</b></div></div>
 <div id="c3TableSlot"></div>
 <div class="c3x-sh"><b>Road to the Palace</b><span>${c.tier+1} of 7</span></div>
 <div class="c3x-road">${TIERS.map((T,i)=>`<div class="c3x-ven${i<c.tier?' done':i===c.tier?' cur':' lock'}" style="--art:url(assets/ui/${ROADV[i]}.webp),url(assets/ui/bg_stage.webp);--pos:${ROADP[i]}"><span class="c3x-vn">${i+1}</span>${i>c.tier?'<img class="lk" src="assets/ui/ic_lock.webp" alt="">':''}<b>${T.venue.split(' · ')[0]}</b><small>${i<c.tier?'Done':i===c.tier?'You are here':T.n}</small></div>`).join('')}</div>
 <div class="c3x-sh"><b>Contracts</b><span>${v.conDone} done</span></div>
 <div class="c3x-cons">${v.con.map((k,i)=>`<div class="c3x-crow${i===0?' pin':''}"><img src="assets/ui/ic_${i===0?'star':'cash'}.webp" alt=""><div><small>${i===0?'Pinned · ':''}${k.from}</small><b>${k.t}</b></div><em>${money(k.cash)}<span>+100 XP</span></em></div>`).join('')}</div>
 <div class="c3x-feat c3x-rep"><img src="assets/ui/ic_trophy.webp" alt=""><div><div class="c3-ch"><b>${rep[1]}</b><span>Reputation</span></div><div class="c3-bar"><i style="width:${v.fame}%"></i></div><p class="help">${nextRep?`${nextRep[0]-Math.floor(v.fame)} to “${nextRep[1]}”: ${nextRep[2].toLowerCase()}.`:rep[2]+'.'}</p></div></div>
 <div class="c3x-strip"><div><small>Best avg</small><b>${v.best||'–'}</b></div><div><small>Rival</small><b>${c.rivalW||0}–${c.rivalL||0}</b></div><div><small>Titles</small><b>${c.titles||0}</b></div></div>
 <button type="button" class="ghost wide c3x-board" id="c3Board">Mates leaderboard</button>`;
 if(aside)$('c3TableSlot').appendChild(aside);{const rd=host.querySelector('.c3x-road .cur');if(rd)requestAnimationFrame(()=>{rd.parentNode.scrollLeft=Math.max(0,rd.offsetLeft-rd.parentNode.offsetLeft-40);});}$('c3Board').onclick=()=>{hubTab('board');};}
function renderPlayerTop(){const v=V3();const host=$('c3plv');if(!host)return;if(!v){host.innerHTML='';return;}const pct=Math.min(100,v.xp/lvNeed(v.lv)*100);
 let heroL=v.lv+1;for(let L=v.lv+1;L<=Math.min(100,v.lv+10);L++){if(rewardAt(L).big){heroL=L;break;}}const H=rewardAt(heroL);
 const track=[];for(let L=v.lv;L<=Math.min(100,v.lv+4);L++)track.push(Object.assign({lv:L},rewardAt(L)));
 const ico=rIco;
 const cap=attrCap();
 host.innerHTML=`<section class="c3x-hero c3x-me">${heroImg()}<div class="c3x-copy"><div class="c3x-k">${save.name||'You'}${v.title?` · “${v.title}”`:''}</div><h1 class="c3x-big"><i>Lv</i>${v.lv}</h1><div class="c3-bar"><i style="width:${pct}%"></i></div><div class="c3x-sub">${v.xp} / ${lvNeed(v.lv)} XP</div></div></section>
  <div class="c3-card c3-me">
  <button type="button" class="c3x-unl hero" id="c3HeroUn"><div class="c3x-ucopy"><small>Next big unlock · level ${heroL}</small><b>${H.n}</b><span>${heroL-v.lv} level${heroL-v.lv>1?'s':''} away</span></div><div class="c3x-item">${bigIco(H)}</div></button>
  <div class="c3-path">${track.map((r,i)=>`<div class="c3-node${i===0?' cur':''}${r.big?' hi':''}"><span class="c3-dot">${i===0?'✓':ico(r)}</span><small>${r.lv}</small><em>${i===0?'Now':r.k==='cash'?'Cash':r.n.replace(' flights','').replace(' shirt','').replace('Title: ','')}</em></div>`).join('')}</div>
  <p class="help">Levels unlock looks, titles and cash. Never accuracy: your hands and attributes do that. Attributes cap at ${cap} in ${TIERS[tierOf()].n}.</p>
  <div class="c3x-tiles"><button type="button" class="c3x-tile" id="c3Kit"><img src="assets/ui/ic_barrel.webp" alt=""><b>Store</b><small>Barrels, shafts, flights</small></button><button type="button" class="c3x-tile" id="c3Look"><img src="assets/ui/ic_shirt.webp" alt=""><b>Edit look</b><small>Face, shirt, walk-on</small></button></div></div>`;
 $('c3Kit').onclick=()=>{hubTab('kit');showShop(showShop.tab,true);};$('c3Look').onclick=()=>{const b=$('btnLook');if(b)b.click();};}

// title: live 3D player render behind the logo (depth pass)
{const _st=showTitle;showTitle=function(){const r=_st.apply(this,arguments);try{const t=$('title');if(t&&save.look){let im=$('tlHero');if(!im){im=document.createElement('img');im.id='tlHero';im.alt='';im.className='tl-hero';{const bg=$("titleBg");t.insertBefore(im,bg?bg.nextSibling:t.firstChild);}}const u=V.heroShot&&V.heroShot(save.look,save.name||'You',career()?career().tier:0,save.flight);if(u){im.src=u;im.hidden=false;}else im.hidden=true;}}catch(e){}return r;};}
const _sh=showHub;showHub=function(tab){{const o=$('c3rw');if(o){o.hidden=true;o.classList.remove('on');}}const r=_sh.apply(this,arguments);const c=career();const hub=$('hub');const on=!!(c&&!c.run);hub.classList.toggle('c3',on);if(c)hub.dataset.venue=c.tier<=1?'pub':c.tier<=3?'club':'stage';{const sb=$('hubTabs').querySelector('[data-t=season]');if(sb)sb.hidden=!on;}
 if(!on){const a=document.querySelector('#hub .hx-season'),mn=document.querySelector('#hub .hx-main');if(a&&mn&&a.parentNode!==mn)mn.insertBefore(a,mn.firstChild);return r;}
 nav();V3();c3Norm();applyUnlocks();fillContracts();persist();navIcons();
 renderPlay();renderPlayerTop();hubTab(hubTab.cur||'play');if(hubTab.cur==='season')renderSeason();else{renderSeason();}
 if(tab==='season'||hubTab.cur==='season')hubTab('season');return r;};
const _sp=showPlayer;showPlayer=function(){const r=_sp.apply(this,arguments);renderPlayerTop();return r;};
const _gx=gainXP;gainXP=function(id,amt,mult){const c=career();if(c&&!c.run&&amt>0){const cap=attrCap();const r=cap?lvOf(id)/cap:0;const k=r<.6?1.25:r<.8?1:r<.95?.65:.35;amt*=k;}return _gx.call(this,id,amt,mult);};
// title-card / creator pick up unlocked colours on load
try{applyUnlocks();}catch(e){}
// every flight colour a level you've reached has awarded stays yours, equipped or not (needed once 'Keep current flights' exists); derived from your level, so nothing extra is stored
const lvFlights=()=>{const out=[];try{const lv=V3().lv;for(let L=2;L<=lv;L++){const r=rewardAt(L);if(r&&r.k==='flight'&&!out.includes(r.v))out.push(r.v);}}catch(e){}return out;};
window.C3={gainLevels,lvNeed,rewardAt,V3,fillContracts,renderPlay,rIco,lvFlights,showRewardTest:p=>{pre=p;showReward();}};
// ===== F8: Your form (improvement chart). ChatGPT design review 8.5 → option A "performance card" (Player tab, under the level hero).
// One trend (10-match rolling 3-dart average over raw match dots), one comparison (vs the previous 10), checkout %, and where you started.
// Personal only: no comparisons with other players, nothing feeds difficulty. Falling form is shown neutrally (no red), never faked.
{const FMAX=200;
 const fLog=()=>{if(!Array.isArray(save.mlog))save.mlog=[];return save.mlog;};
 const _emF=endMatch;endMatch=function(){const s=S;_emF.apply(this,arguments);try{const c=career();if(!s||!c||c.run||s.practice||s.online||s.mp||ui.mode!=='career'||!s.p||!s.p[1]||!s.p[1].ai)return;const me=s.p[0];if(!me||!me.darts)return;
   if(!s.fid)s.fid=Date.now().toString(36)+Math.random().toString(36).slice(2,6);const L=fLog();if(L.some(x=>x.id===s.fid))return;
   L.push({id:s.fid,t:Date.now(),tr:c.tier||0,a:+avg(me).toFixed(1),ca:me.coAtt||0,ch:me.coHit||0,pf:me.perfects||0,th:me.throws||0,w:s.won?1:0});if(L.length>FMAX)L.splice(0,L.length-FMAX);persist();}catch(e){}};
 const mean=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
 const roll=(L,k)=>L.map((_,i)=>i+1<k?null:mean(L.slice(i+1-k,i+1).map(x=>x.a)));
 function fSum(L){const n=L.length;const last=L.slice(-10),prev=n>=20?L.slice(-20,-10):null;const a10=mean(last.map(x=>x.a));const p10=prev?mean(prev.map(x=>x.a)):null;
  const ca=last.reduce((s,x)=>s+x.ca,0),ch=last.reduce((s,x)=>s+x.ch,0);const start=n>=10?mean(L.slice(0,10).map(x=>x.a)):null;
  const pca=prev?prev.reduce((s,x)=>s+x.ca,0):0,pch=prev?prev.reduce((s,x)=>s+x.ch,0):0;return {n,a10,p10,co:ca?ch/ca*100:null,pco:pca?pch/pca*100:null,start};}
 function fLine(f){if(f.n<10)return `Building your form · ${f.n}/10 matches`;if(f.p10==null)return 'Your last 10 matches';const d=f.a10-f.p10;
  if(d>=1)return `<b class="up">↑ ${d.toFixed(1)}</b> vs your previous 10`;if(d>-1)return `Holding steady across 10 matches`;
  if(f.co!=null&&f.pco!=null&&f.co-f.pco>=3)return `Checkout up from ${f.pco.toFixed(0)}% to ${f.co.toFixed(0)}%`;return `Previous 10: ${f.p10.toFixed(1)}`;}
 function fSvg(L,w,h,marks){const pts=L.map(x=>x.a);if(!pts.length)return '';const r=roll(L,Math.min(10,Math.max(3,L.length)));const lo=Math.floor(Math.min(...pts)/5)*5-2,hi=Math.ceil(Math.max(...pts)/5)*5+2;
  const X=i=>L.length<2?w/2:6+(w-12)*i/(L.length-1),Y=v=>h-6-(h-12)*(v-lo)/Math.max(1,hi-lo);
  const dots=pts.map((v,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="2" fill="#EDECE5" opacity=".28"/>`).join('');
  const rl=r.map((v,i)=>v==null?null:`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).filter(Boolean);
  const mk=marks?L.map((x,i)=>i&&x.tr>L[i-1].tr?`<line x1="${X(i)}" x2="${X(i)}" y1="4" y2="${h-4}" stroke="#D9AD52" stroke-dasharray="3 3" opacity=".6"/><text x="${X(i)+3}" y="12" fill="#D9AD52" font-size="10" font-family="Manrope,system-ui">${(TIERS[x.tr]||{}).n||''}</text>`:'').join(''):'';
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true">${mk}${dots}${rl.length>1?`<polyline points="${rl.join(' ')}" fill="none" stroke="#C6F36B" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`:''}</svg>`;}
 const FS=document.createElement('style');FS.textContent=`
 .c3form{margin:12px 0 4px;padding:14px 16px 12px;border-radius:12px;background:linear-gradient(155deg,#263335,#192426 75%);border:1px solid rgba(237,236,229,.1);color:#EDECE5;cursor:pointer;display:block;width:100%;text-align:left;font:inherit}
 .c3form .fk{display:flex;justify-content:space-between;align-items:baseline;font:800 11px/1 Manrope,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#ADB2BA}
 .c3form .fk i{font-style:normal;letter-spacing:.04em;text-transform:none;font-weight:700;color:#C6F36B}
 .c3form .fh{display:flex;align-items:baseline;gap:10px;margin:8px 0 2px}.c3form .fh b{font:italic 800 40px/1 "Barlow Condensed",sans-serif}
 .c3form .fh span{font:600 13px/1.3 Manrope,system-ui,sans-serif;color:#C9CFCE}.c3form .fh span b{font:800 13px Manrope,system-ui,sans-serif}.c3form .up{color:#C6F36B}
 .c3form .fl{font:600 12px/1.2 Manrope,system-ui,sans-serif;color:#ADB2BA;margin-bottom:6px}
 .c3form .fc{margin:4px -4px 8px}.c3form .fr{display:flex;gap:18px;font:600 12px/1.25 Manrope,system-ui,sans-serif;color:#ADB2BA}.c3form .fr b{display:block;font:italic 800 19px/1.1 "Barlow Condensed",sans-serif;color:#EDECE5}
 .c3formx{position:fixed;inset:0;z-index:80;background:#0b1011;display:flex;flex-direction:column;padding:max(16px,env(safe-area-inset-top)) 16px 16px;color:#EDECE5;overflow:auto}
 .c3formx h2{font:italic 800 26px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin:6px 0 4px}.c3formx p{font:600 13px/1.4 Manrope,system-ui,sans-serif;color:#C9CFCE;margin:0 0 12px}
 .c3formx .fx{border-radius:12px;background:#192426;padding:10px 6px;margin-bottom:12px}.c3formx button{align-self:stretch;min-height:48px;border-radius:10px;border:0;background:#C6F36B;color:#10191A;font:800 15px Manrope,system-ui,sans-serif;margin-top:auto}`;document.head.appendChild(FS);
 function fCard(){const L=fLog();const f=fSum(L);const last=L.slice(-30);
  return `<button type="button" class="c3form" id="c3form" aria-label="Your form: ${f.n<10?'building':'last 10 average '+f.a10.toFixed(1)}. Open the full chart"><div class="fk">Your form<i>${f.n>=10?'See all →':''}</i></div>
   ${f.n?`<div class="fh"><b>${f.a10.toFixed(1)}</b><span>3-dart avg · last ${Math.min(10,f.n)}<br>${fLine(f)}</span></div>`:`<div class="fh"><span>Play a career match to start your form line.</span></div>`}
   ${last.length>=2?`<div class="fc">${fSvg(last,320,84,false)}</div>`:''}
   ${f.n>=10?`<div class="fr"><span>Checkout<b>${f.co==null?'–':f.co.toFixed(0)+'%'}</b></span><span>Your start<b>${f.start.toFixed(1)}</b></span><span>Matches<b>${f.n}</b></span></div>`:''}</button>`;}
 function fOpen(){const L=fLog();const f=fSum(L);const o=document.createElement('div');o.className='c3formx';o.setAttribute('role','dialog');o.setAttribute('aria-label','Your form');
  o.innerHTML=`<h2>Your form</h2><p>Every career match, oldest to newest. Dots are single matches; the line is your 10-match average. Gold lines mark promotions.${f.start!=null?` Your first 10 matches averaged ${f.start.toFixed(1)}; your last 10, ${f.a10.toFixed(1)}.`:''}</p><div class="fx">${fSvg(L,340,220,true)}</div><button type="button">Done</button>`;
  o.querySelector('button').onclick=()=>o.remove();document.body.appendChild(o);}
 window.TOPS_form={log:fLog,sum:fSum,card:fCard,render:()=>renderPlayerTop()};
 const _rpt=renderPlayerTop;renderPlayerTop=function(){const r=_rpt.apply(this,arguments);try{const host=$('c3plv');if(host&&career()&&!career().run){let el=$('c3form');const html=fCard();const hero=host.querySelector('.c3x-hero');if(el)el.outerHTML=html;else if(hero)hero.insertAdjacentHTML('afterend',html);else host.insertAdjacentHTML('afterbegin',html);el=$('c3form');if(el)el.onclick=fOpen;const place=()=>{const fm=$('c3form'),hr=host.querySelector('.c3x-hero');if(fm&&hr&&hr.nextElementSibling!==fm)hr.after(fm);};place();setTimeout(place,0);}}catch(e){}return r;};}
})();
</script>
