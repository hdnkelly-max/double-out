<style>
/* v12 (F2): barrels and kit parts unlock by player level; sponsor-exclusive sets */
#hub #shopList .opt.v12lock,#hub #setupList .opt.v12lock{opacity:1!important}
#hub .opt.v12lock .n img{filter:grayscale(.55) brightness(.8)!important}
#hub .opt.v12lock .t{color:#C9CFCE!important}
#hub .opt.v12lock .n em{opacity:.7}
#hub .opt.v12lock .kitpts,#hub .opt.v12lock .kitpts *{opacity:.9}
#hub .opt .price.v12p{font-size:0!important;line-height:1;text-align:left;justify-self:start}
.v12gate{display:inline-flex;align-items:center;gap:7px;min-height:30px;padding:5px 12px 5px 10px;border-radius:999px;background:rgba(198,243,107,.08);border:1px solid rgba(198,243,107,.5);color:#C6F36B;font:800 13px/1.1 Manrope,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.v12gate svg{width:14px;height:14px;flex:none}
.v12gate.sp{background:linear-gradient(90deg,rgba(233,196,106,.16),rgba(233,196,106,.04));border-color:rgba(233,196,106,.65);color:#E9C46A}
.v12sub{display:block;margin-top:7px;font:600 12px/1.35 Manrope,system-ui,sans-serif;color:#ADB2BA;letter-spacing:.01em;text-transform:none;white-space:normal}
.v12sub b{color:#EDECE5;font-weight:700}
#hub #setupList .opt .price.v12p{justify-self:end;text-align:right}
#setupList .v12gate{min-height:30px;padding:5px 10px 5px 9px;font-size:12px}
.v12why.sp{display:flex;align-items:center;gap:6px;color:#E9C46A}.v12why.sp svg{width:13px;height:13px;flex:none}
.v12why{display:block;margin-top:6px;font:700 12px/1.35 Manrope,system-ui,sans-serif;color:#C6F36B}
.v12lv{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:4px 14px;margin:0 0 12px;padding:12px 16px;border-radius:12px;background:radial-gradient(ellipse at 0% 50%,rgba(198,243,107,.1),transparent 60%),linear-gradient(155deg,#263335,#192426 75%);border:1px solid rgba(198,243,107,.22)}
.v12lv .lvn{grid-row:1/3;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:56px;padding-right:14px;border-right:1px solid rgba(237,236,229,.12)}
.v12lv .lvn small{font:700 11px/1 Manrope,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#ADB2BA}
.v12lv .lvn b{font:italic 800 34px/1 "Barlow Condensed",sans-serif;color:#C6F36B}
.v12lv .nx{font:700 11px/1.2 Manrope,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#ADB2BA}
.v12lv .nn{font:italic 800 19px/1.05 "Barlow Condensed",sans-serif;text-transform:uppercase;color:#EDECE5}
.v12lv .nn i{font-style:normal;color:#C6F36B}
.st2x .v12no{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;margin-top:10px;border-radius:10px;border:1px dashed rgba(198,243,107,.45);color:#C6F36B;font:700 14px Manrope,system-ui,sans-serif;text-align:center;padding:8px 12px}
.st2x .v12no.sp{border-color:rgba(233,196,106,.6);color:#E9C46A}
.st2x .v12no svg{width:15px;height:15px;flex:none}
/* level-up reward: barrel unlocked */
.v12rw{position:relative;overflow:hidden;display:grid;grid-template-columns:104px 1fr;gap:3px 12px;align-items:center;min-height:104px;padding:14px 16px;border-radius:10px;background:radial-gradient(ellipse at 12% 50%,rgba(198,243,107,.16),transparent 58%),linear-gradient(155deg,#263335,#192426 75%);box-shadow:inset 0 0 0 1px rgba(198,243,107,.6),0 10px 24px rgba(0,0,0,.35);animation:v12in .4s cubic-bezier(.2,.8,.2,1) 1.6s both}
.v12rw .v12im{grid-row:1/5;align-self:center;width:136px;margin-left:-26px;transform:rotate(-14deg);filter:drop-shadow(-6px 8px 8px rgba(0,0,0,.6));mix-blend-mode:lighten}
.v12rw small{grid-column:2;font:800 11px/1.2 Manrope,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#C6F36B}
.v12rw b{grid-column:2;font:italic 800 22px/1.02 "Barlow Condensed",sans-serif;text-transform:uppercase;color:#EDECE5}
.v12rw .v12pt{grid-column:2;display:block;background:none;width:auto;padding:0;font:700 13px/1.35 Manrope,system-ui,sans-serif;color:#C6F36B}
.v12rw .v12pr{grid-column:2;display:block;font:600 12px/1.3 Manrope,system-ui,sans-serif;color:#ADB2BA}
.v12rw .v12pr em{font-style:normal;color:#D9AD52;font-weight:800}
.v12rw.part>*{grid-column:1!important}.v12rw.part{grid-template-columns:1fr;min-height:0;padding:12px 16px}
.v12rw.part .v12im{display:none}
@keyframes v12in{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.v12rw{animation:none}}
</style>
<script>
(function(){
// ===== F2 (11 Nov): barrels unlock by player level, sponsor-only sets, level-gated kit parts =====
// Ladder anchors set by the owner: Club Brass 1, Supergrip 8, Razor Edge 15, Zen Jutsu 25, Power 9Five 40.
// Everything else is slotted by its kit points (2*accuracy + rhythm + control; see v09 kitPts):
//  0 brass 1 · 7 neutron 4 · 9 core xl 6 · 12 supergrip 8 · 16 razor 15 · 17 vapor8 18 · 19 zen 25 · 22 asp 30 · 22 ga 32 · 27 power 40
const LV={assassin:1,neutron:4,corexl:6,supergrip:8,razor:15,vapor8:18,zen:25,asp:30,ga:32,power:40};
// sponsor exclusives: never sold, only arrive with that deal; you keep them if the deal ends
const EXCL={iceman:'rd',mvg:'winmau',littler:'target'};
// kit parts that are straight upgrades get a level; trade-off parts (short/long shaft, slim/kite/pear) stay open
const PART_LV={'point:black':5,'shaft:spin':6,'point:long':10,'shaft:carbon':12,'point:gold':20};
// new Red Dragon set (visuals in game4.js tables under 'iceman'); 20 kit points, between Zen Jutsu and the Lv30 sets
if(!BARRELS.some(b=>b.id==='iceman'))BARRELS.push({id:'iceman',n:'Red Dragon Gerwyn Price Avalanche 23g',brand:'Red Dragon',s:'The Iceman’s set. 90% tungsten, ice-blue coat.',base:4.2,tol:1.1,sway:.74,price:230});
// store order: by unlock level, sponsor sets last (rows map to BARRELS by index in every shop patch, so sort the array itself)
{const rank=b=>EXCL[b.id]?100+['iceman','mvg','littler'].indexOf(b.id):(LV[b.id]||50);BARRELS.sort((a,b)=>rank(a)-rank(b));}
// sponsor deals hand over the exclusive set
try{const sp=id=>SPONSORS.find(s=>s.id===id);
 const rd=sp('rd');if(rd){rd.free=Object.assign({},rd.free,{barrel:'iceman'});rd.lines=['Red Dragon here. We watched the ProTour feed.','Gerwyn Price Avalanche set you can’t buy in a shop, carbon shafts, 25% off the range and $150 appearance money every match.','You’d be our second player in NZ.'];}
 const tg=sp('target');if(tg){tg.free=Object.assign({},tg.free,{barrel:'littler'});tg.lines=['Target Darts. Tour Card holders only get this call.','Luke Littler Gen 1 set, sponsored players only. Swiss points, Pro Grip Spin shafts, 40% off and $900 a match.','You’d be on the same wall as Littler and Aspinall.'];}
 const wm=sp('winmau');if(wm){wm.lines=['Winmau. Congratulations on the card.','MvG Exact set, sponsored players only. Prism shafts and flights, Diamond points, 40% off and $900 a match.','Blade 6 board for the house too.'];}
}catch(e){}
const LOCK='<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4.5 7V5.2a3.5 3.5 0 0 1 7 0V7h.6c.8 0 1.4.6 1.4 1.4v5.2c0 .8-.6 1.4-1.4 1.4H3.9c-.8 0-1.4-.6-1.4-1.4V8.4C2.5 7.6 3.1 7 3.9 7h.6Zm1.8 0h3.4V5.2a1.7 1.7 0 0 0-3.4 0V7Z"/></svg>';
const STAR='<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.2l2 4.3 4.7.5-3.5 3.2 1 4.6L8 11.5l-4.2 2.3 1-4.6L1.3 6l4.7-.5z"/></svg>';
function lvNow(){try{const c=career();if(!c||c.run)return null;const v=C3.V3();return v?v.lv:null;}catch(e){return null;}}
function brandOf(spId){const s=SPONSORS.find(x=>x.id===spId);return s?s.brand:spId;}
// gate for an item you don't own: null (open) | {lv} | {sp}
function gateBarrel(b){if(EXCL[b.id])return {sp:EXCL[b.id]};const need=LV[b.id]||1;const lv=lvNow();if(lv==null||lv>=need)return null;return {lv:need};}
function gatePart(key,id){const need=PART_LV[key+':'+id];if(!need)return null;const lv=lvNow();if(lv==null||lv>=need)return null;return {lv:need};}
window.TOPS_GATE={LV,EXCL,PART_LV,gateBarrel,gatePart};
// migration: a player already signed with Red Dragon, Target or Winmau gets that deal's exclusive set (not equipped). Owned barrels are never taken away.
function grantSponsorSet(){try{if(!save||!save.owned||!save.sponsor)return;const id=Object.keys(EXCL).find(k=>EXCL[k]===save.sponsor);if(id&&!save.owned.includes(id)){save.owned.push(id);persist();}}catch(e){}}
grantSponsorSet();
function gateHTML(g,short){if(short&&g.lv)return `<span class="v12gate">${LOCK}Lv ${g.lv}</span>`;return g.sp?`<span class="v12gate sp">${STAR}Sponsor exclusive</span><span class="v12sub">Sign with <b>${brandOf(g.sp)}</b> to get this set</span>`:`<span class="v12gate">${LOCK}Unlocks at level ${g.lv}</span>`;}
function noteHTML(g,priceTxt){return g.sp?`<div class="v12no sp">${STAR}Sponsor exclusive · sign with ${brandOf(g.sp)}</div>`:`<div class="v12no">${LOCK}Unlocks at level ${g.lv}${priceTxt?' · then '+priceTxt:''}</div>`;}
function lockRow(el,g,priceTxt,short){el.classList.add('v12lock');el.classList.remove('locked');el.setAttribute('aria-disabled','true');
 const pr=el.querySelector('.price');if(pr){pr.className='price v12p';pr.innerHTML=gateHTML(g,short)+(g.lv&&priceTxt&&!short?`<span class="v12sub">${priceTxt} once unlocked</span>`:'');}
 if(short&&g.lv){const s0=el.querySelector('.s');if(s0&&!s0.querySelector('.v12why'))s0.insertAdjacentHTML('beforeend',`<span class="v12why">Unlocks at level ${g.lv}${priceTxt?', then '+priceTxt:''}</span>`);}
 const tap=el.onclick;
 if(el.dataset.st2w&&tap){el.onclick=function(e){tap.call(el,e);const x=el.nextElementSibling;if(x&&x.classList.contains('st2x')){x.querySelectorAll('button').forEach(bt=>bt.remove());x.insertAdjacentHTML('beforeend',noteHTML(g,priceTxt));}};}
 else el.onclick=null;}
function nextUnlock(lv){let best=null;BARRELS.forEach(b=>{const n=LV[b.id];if(!EXCL[b.id]&&n>lv&&!save.owned.includes(b.id)&&(!best||n<best.lv))best={lv:n,n:b.n};});return best;}
function levelStrip(){const L=$('shopList');if(!L)return;let s=$('v12lv');const lv=lvNow();if(lv==null){if(s)s.remove();return;}
 if(!s){s=document.createElement('div');s.id='v12lv';s.className='v12lv';L.parentNode.insertBefore(s,L);}
 const nx=nextUnlock(lv);s.innerHTML=`<div class="lvn"><small>Level</small><b>${lv}</b></div>`+(nx?`<span class="nx">Next barrel · level ${nx.lv}</span><span class="nn">${nx.n}</span>`:`<span class="nx">Every barrel unlocked</span><span class="nn">Sponsor sets come <i>with a deal</i></span>`);}
function decorate(){grantSponsorSet();
 const rows=[...document.querySelectorAll('#shopList .opt')];
 rows.forEach((el,i)=>{const b=BARRELS[i];if(!b)return;if(save.owned.includes(b.id)){if(EXCL[b.id]){const s0=el.querySelector('.s');if(s0&&!s0.querySelector('.v12why'))s0.insertAdjacentHTML('beforeend',`<span class="v12why sp">${STAR}${brandOf(EXCL[b.id])} sponsor set · yours to keep</span>`);}return;}const g=gateBarrel(b);if(!g)return;lockRow(el,g,money(price(b.price)));});
 levelStrip();
 const SU=$('setupList');if(SU){let key=null;[...SU.children].forEach(el=>{if(el.classList.contains('label')){key=/Shaft/.test(el.textContent)?'shaft':/Flight/.test(el.textContent)?'flight':'point';return;}const t=el.querySelector('.t');if(!t||!key)return;const list=key==='shaft'?SHAFTS:key==='flight'?FSHAPES:POINTS;const it=list.find(x=>x.n===t.textContent);if(!it)return;
  const own=(save.ownedSetup||[]).includes(key+':'+it.id)||it.price===0;if(own)return;const g=gatePart(key,it.id);if(!g)return;lockRow(el,g,money(price(it.price)),true);});}}
const _ss12=showShop;showShop=function(){const r=_ss12.apply(this,arguments);try{decorate();}catch(e){console.warn('v12 shop',e);}return r;};
// ----- level-up reward: barrels (and parts) that just opened in the store -----
// the last level whose unlocks were shown lives on the career's v3 state; first seen = current level, so no backlog on update
function v3(){try{const c=career();if(!c||c.run)return null;return C3.V3();}catch(e){return null;}}
function seenInit(){const v=v3();if(v&&v.bSeen==null)v.bSeen=v.lv;}
const _cam12=careerAfterMatch;careerAfterMatch=function(){seenInit();return _cam12.apply(this,arguments);};
const _bm12=beginMatch;beginMatch=function(){seenInit();return _bm12.apply(this,arguments);};
function unlocksIn(a,b){const out=[];BARRELS.forEach(x=>{const n=LV[x.id];if(!EXCL[x.id]&&n>a&&n<=b&&n>1)out.push({k:'barrel',lv:n,it:x});});
 Object.entries(PART_LV).forEach(([tag,n])=>{if(n>a&&n<=b){const [key,id]=tag.split(':');const list=key==='shaft'?SHAFTS:key==='flight'?FSHAPES:POINTS;const it=list.find(x=>x.id===id);if(it)out.push({k:key,lv:n,it});}});return out;}
function ptsOf(id){try{if(!window.TOPS_kitPts)return '';const sb=save.barrel,ss=save.setup;save.barrel=id;save.setup={shaft:'med',flight:'standard',point:'std'};let k;try{k=TOPS_kitPts();}finally{save.barrel=sb;save.setup=ss;}
 return [['Scoring','sc'],['Finishing','fi'],['Control','ct'],['Rhythm','rh']].filter(([n,x])=>k[x]>0).map(([n,x])=>`${n} ▲${k[x]}`).join(' · ');}catch(e){return '';}}
function rewardCards(list){const bs=list.filter(u=>u.k==='barrel');const ps=list.filter(u=>u.k!=='barrel');let h='';
 bs.forEach(u=>{const b=u.it;let img='';try{img=V.dartShot(save.flight,Object.assign({},setupParts(),{barrel:b}));}catch(e){}
  h+=`<div class="v12rw" role="status">${img?`<img class="v12im" src="${img}" alt="">`:''}<small>Level ${u.lv} · Store unlock</small><b>${b.n}</b><span class="v12pt">${ptsOf(b.id)}</span><span class="v12pr">Yours for <em>${money(price(b.price))}</em> in the Store</span></div>`;});
 if(ps.length)h+=`<div class="v12rw part" role="status"><small>Level ${ps[0].lv} · kit unlocked</small><b>${ps.map(u=>u.it.n).join(', ')}</b><span class="v12pr">${ps.map(u=>u.it.s).join(' ')} Now in the Store.</span></div>`;
 return h;}
function onReward(){const el=$('c3rw');if(!el||el.hidden)return;const card=el.querySelector('.c3rw-card');if(!card||card.dataset.v12)return;card.dataset.v12='1';
 const v=v3();if(!v)return;if(v.bSeen==null){v.bSeen=v.lv;return;}if(v.lv<=v.bSeen)return;
 const list=unlocksIn(v.bSeen,v.lv);v.bSeen=v.lv;try{persist();}catch(e){}if(!list.length)return;
 // one unlock section on the card: the barrel becomes the hero render, parts list beneath with their own dart renders (career3 addUnlocks)
 if(window.C3&&C3.addUnlocks){C3.addUnlocks(list.map(u=>u.k==='barrel'?{k:'barrel',v:u.it.id,lv:u.lv,n:u.it.n,sub:ptsOf(u.it.id),note:`Yours for <em>${money(price(u.it.price))}</em> in the Store`}:{k:'part',key:u.k,id:u.it.id,lv:u.lv,n:u.it.n,sub:u.it.s}));return;}
 const html=rewardCards(list);const anchor=card.querySelector('.c3rw-ach,.c3rw-con,.c3rw-hook,.c3rw-act');if(anchor)anchor.insertAdjacentHTML('beforebegin',html);else card.insertAdjacentHTML('beforeend',html);}
window.TOPS_v12Reward=onReward;
new MutationObserver(()=>{try{onReward();}catch(e){}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden'],childList:true});
})();
</script>
