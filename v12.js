<style>
/* v12 (F2): barrels and kit parts unlock by player level; sponsor-exclusive sets */
#hub #shopList .opt.v12lock,#hub #setupList .opt.v12lock{opacity:1!important}
/* locked: dart render dimmed to ~58%; name, body and requirement stay readable (ChatGPT 19:10) */
#hub .opt.v12lock{border-style:dashed!important;border-color:rgba(237,236,229,.16)!important}
#hub .opt.v12lock .n em{opacity:.58}
#hub .opt.v12lock .n img{filter:grayscale(.6) brightness(.62)!important}
#hub .opt.v12lock .s>*:not(.v12why):not(.v12sp):not(.v12gate),#hub .opt.v12lock .v12d{opacity:.88}
#hub .opt.v12lock .t{color:#EDECE5!important;opacity:1}
/* card descriptions cap at two lines; the full text sits in the preview */
.opt .v12d{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.st2x .v12full{margin:12px 2px 2px;font:500 14px/1.45 Manrope,system-ui,sans-serif;color:#C9CFCE}
/* buy button on available rows */
#hub .opt .price.v12bp{font-size:0!important;line-height:1}
.v12buy{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;min-width:112px;padding:0 16px;border-radius:10px;background:#C6F36B;color:#10191A;font:800 15px/1 Manrope,system-ui,sans-serif;letter-spacing:.02em;box-shadow:0 6px 14px rgba(0,0,0,.25);cursor:pointer}
.v12buy i{font-style:normal;text-transform:uppercase;letter-spacing:.08em;font-size:13px}
.v12buy b{font:italic 800 19px/1 "Barlow Condensed",sans-serif}
.v12buy:active{transform:translateY(1px)}
.v12buy.poor{background:transparent;color:#D9AD52;box-shadow:inset 0 0 0 1px rgba(217,173,82,.55);cursor:default}
.v12buy.poor i{color:#ADB2BA}
#hub .opt .price .v12need{display:block;margin-top:6px;font:600 12px/1.3 Manrope,system-ui,sans-serif;color:#ADB2BA;letter-spacing:0;text-transform:none}
#hub #setupList .opt .price.v12bp{justify-self:end;text-align:right}
#setupList .v12buy{min-width:96px;padding:0 12px}
/* sponsor identity */
.v12sp{display:inline-flex;flex-direction:column;gap:3px;padding:8px 14px 8px 12px;border-radius:8px;border-left:3px solid var(--bc);background:linear-gradient(90deg,color-mix(in srgb,var(--bc) 16%,transparent),rgba(255,255,255,.02))}
.v12sp small{font:800 11px/1.1 Manrope,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#EDECE5}
.v12sp b{font:italic 800 21px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.02em;color:var(--bc)}
.v12why.spo{display:block;color:#C9CFCE;font-weight:600}.v12why.spo b{font:italic 800 15px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.03em;color:var(--bc)}
#hub .opt .price.v12p{font-size:0!important;line-height:1;text-align:left;justify-self:start}
.v12gate{display:inline-flex;align-items:center;gap:7px;min-height:30px;padding:5px 12px 5px 10px;border-radius:999px;background:rgba(198,243,107,.08);border:1px solid rgba(198,243,107,.5);color:#C6F36B;font:800 13px/1.1 Manrope,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap}
.v12gate svg{width:14px;height:14px;flex:none}
.v12sub{display:block;margin-top:7px;font:600 12px/1.35 Manrope,system-ui,sans-serif;color:#ADB2BA;letter-spacing:.01em;text-transform:none;white-space:normal}
.v12sub b{color:#EDECE5;font-weight:700}
#hub #setupList .opt .price.v12p{justify-self:end;text-align:right}
#setupList .v12gate{min-height:30px;padding:5px 10px 5px 9px;font-size:12px}
.v12why{display:block;margin-top:6px;font:700 12px/1.35 Manrope,system-ui,sans-serif;color:#C6F36B}
.v12lv{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:4px 14px;margin:0 0 12px;padding:12px 16px;border-radius:12px;background:radial-gradient(ellipse at 0% 50%,rgba(198,243,107,.1),transparent 60%),linear-gradient(155deg,#263335,#192426 75%);border:1px solid rgba(198,243,107,.22)}
.v12lv .lvn{grid-row:1/3;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:56px;padding-right:14px;border-right:1px solid rgba(237,236,229,.12)}
.v12lv .lvn small{font:700 11px/1 Manrope,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#ADB2BA}
.v12lv .lvn b{font:italic 800 34px/1 "Barlow Condensed",sans-serif;color:#C6F36B}
.v12lv .nx{font:700 11px/1.2 Manrope,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#ADB2BA}
.v12lv .nn{font:italic 800 19px/1.05 "Barlow Condensed",sans-serif;text-transform:uppercase;color:#EDECE5}
.v12lv .nn i{font-style:normal;color:#C6F36B}
.st2x .v12no{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;margin-top:10px;border-radius:10px;border:1px dashed rgba(198,243,107,.45);color:#C6F36B;font:700 14px Manrope,system-ui,sans-serif;text-align:center;padding:8px 12px}
.st2x .v12no.sp{border:0;border-left:3px solid var(--bc);border-radius:8px;justify-content:flex-start;background:rgba(255,255,255,.04);color:#EDECE5}.st2x .v12no.sp b{font:italic 800 17px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;color:var(--bc)}
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
/* fresh unlock since your last Store visit */
.v12new{display:inline-block;vertical-align:.15em;margin-right:8px;padding:3px 7px 2px;border-radius:4px;background:#C6F36B;color:#10191A;font:800 11px/1 Manrope,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
@keyframes v12in{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.v12rw{animation:none}}
/* F2 resubmit (QA 21:55): the dart render stays inside its 104 px column so it never runs over names; locked rows show a compact level pill and the full line in the body */
#hub.c3 #shopList .bopt .bimg{width:118px!important;margin-left:-20px!important}
#hub.c3 #shopList .opt.bopt .s,#hub.c3 #shopList .opt.bopt .t{min-width:0;overflow-wrap:anywhere}
#hub #shopList .opt.v12lock .price.v12p{justify-self:end;text-align:right}
.v12why.v12whysp{color:#C9CFCE;font-weight:600}
#hub #shopList .v12sp{padding:6px 10px 6px 9px}#hub #shopList .v12sp b{font-size:18px}
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
// sponsor gifts of store barrels respect the level gate: reserved for you (no charge) and handed over when you reach the level
const BCOL={rd:'#FF4A3D',winmau:'#5B9BFF',target:'#FFD43B',shot:'#5FD3CF',harrows:'#FF5A5F'};
SPONSORS.forEach(s=>{const id=s.free&&s.free.barrel;if(id&&!EXCL[id]&&(LV[id]||1)>1){s.v12gift=id;s.free=Object.assign({},s.free);delete s.free.barrel;}});
const LOCK='<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4.5 7V5.2a3.5 3.5 0 0 1 7 0V7h.6c.8 0 1.4.6 1.4 1.4v5.2c0 .8-.6 1.4-1.4 1.4H3.9c-.8 0-1.4-.6-1.4-1.4V8.4C2.5 7.6 3.1 7 3.9 7h.6Zm1.8 0h3.4V5.2a1.7 1.7 0 0 0-3.4 0V7Z"/></svg>';
function lvNow(){try{const c=career();if(!c||c.run)return null;const v=C3.V3();return v?v.lv:null;}catch(e){return null;}}
function brandOf(spId){const s=SPONSORS.find(x=>x.id===spId);return s?s.brand:spId;}
function bc(spId){return BCOL[spId]||'#C6F36B';}
function giftOf(sid){const s=SPONSORS.find(x=>x.id===sid);return s&&s.v12gift;}
// reservations live on the save: {barrelId: sponsorId}. Granted (free) once your level reaches the barrel's gate.
function syncReserve(equipNow){const out=[];try{if(!save||!save.owned)return out;const R=save.v12res=save.v12res||{};const g=save.sponsor&&giftOf(save.sponsor);
 if(g&&!save.owned.includes(g)&&!R[g])R[g]=save.sponsor;
 const lv=lvNow();Object.keys(R).forEach(id=>{if(save.owned.includes(id)){delete R[id];return;}if(lv==null||lv>=(LV[id]||1)){save.owned.push(id);if(equipNow)save.barrel=id;out.push({id,sp:R[id]});delete R[id];}});
 if(out.length||g)persist();}catch(e){}return out;}
window.TOPS_v12Res=syncReserve;
const _os12=offerSponsors;offerSponsors=function(done){try{const sh=SPONSORS.find(x=>x.id==='shot');if(sh){const lv=lvNow();const need=LV[sh.v12gift]||1;sh.lines[1]=(lv!=null&&lv<need)?`We back Kiwi players coming through. A set of Zen Jutsu 23g is put aside for you, no charge, the day you hit level ${need}. 15% off anything in the range now.`:'We back Kiwi players coming through. Set of Zen Jutsu 23g on us, 15% off anything in the range.';}}catch(e){}
 return _os12.call(this,()=>{const got=syncReserve(true);if(got.length){try{V.setPlayerLook(save.look,save.flight,save.name,career()?career().tier:0);}catch(e){}}done&&done();});};
const _nc12=newCareer;newCareer=function(){const r=_nc12.apply(this,arguments);try{save.v12res={};persist();}catch(e){}return r;};
// gate for an item you don't own: null (open) | {lv} | {sp}
function gateBarrel(b){if(EXCL[b.id])return {sp:EXCL[b.id]};const rs=save.v12res&&save.v12res[b.id];if(rs)return {res:rs,lv:LV[b.id]||1};const need=LV[b.id]||1;const lv=lvNow();if(lv==null||lv>=need)return null;return {lv:need};}
function gatePart(key,id){const need=PART_LV[key+':'+id];if(!need)return null;const lv=lvNow();if(lv==null||lv>=need)return null;return {lv:need};}
window.TOPS_GATE={LV,EXCL,PART_LV,gateBarrel,gatePart};
// migration: a player already signed with Red Dragon, Target or Winmau gets that deal's exclusive set (not equipped). Owned barrels are never taken away.
function grantSponsorSet(){try{if(!save||!save.owned||!save.sponsor)return false;const id=Object.keys(EXCL).find(k=>EXCL[k]===save.sponsor);if(id&&!save.owned.includes(id)){save.owned.push(id);persist();return true;}}catch(e){}return false;}
grantSponsorSet();syncReserve(false);
// rule 17 (QA 21:55 #4): whenever the save is replaced (cloud copy at sign-in: netAdopt; a newer save from another device: adopt),
// run the same F2 upkeep as page load: sponsor exclusive granted, due reserved gifts handed over. Owned barrels are never removed.
// Reserved gifts (QA 21:55 #5): a set a sponsor put aside for you stays yours if you later change sponsor; it arrives at its level, no charge.
{const _m=window.TOPS_v11Migrate;window.TOPS_v11Migrate=function(){let r;try{r=_m&&_m.apply(this,arguments);}catch(e){}grantSponsorSet();syncReserve(false);return r;};}
function spLabel(sid,top){return `<span class="v12sp" style="--bc:${bc(sid)}"><small>${top}</small><b>${brandOf(sid)}</b></span>`;}
function gateHTML(g,short){if(short&&g.res)return spLabel(g.res,'Sponsor set');if(short&&g.sp)return spLabel(g.sp,'Sponsor only');if(g.res)return spLabel(g.res,'Sponsor set')+`<span class="v12sub">Unlocks for you at Lv ${g.lv} · no charge</span>`;
 if(short&&g.lv)return `<span class="v12gate">${LOCK}Lv ${g.lv}</span>`;
 return g.sp?spLabel(g.sp,'Sponsor exclusive')+`<span class="v12sub">Comes with a ${brandOf(g.sp)} deal. Not sold in the Store.</span>`:`<span class="v12gate">${LOCK}Unlocks at level ${g.lv}</span>`;}
function noteHTML(g,priceTxt){if(g.res)return `<div class="v12no sp" style="--bc:${bc(g.res)}"><b>${brandOf(g.res)}</b>&nbsp;sponsor set · yours at Lv ${g.lv}, no charge</div>`;
 return g.sp?`<div class="v12no sp" style="--bc:${bc(g.sp)}">Sponsor exclusive ·&nbsp;<b>${brandOf(g.sp)}</b>&nbsp;deal only</div>`:`<div class="v12no">${LOCK}Unlocks at level ${g.lv}${priceTxt?' · then '+priceTxt:''}</div>`;}
function lockRow(el,g,priceTxt,short){el.classList.add('v12lock');el.classList.remove('locked');el.setAttribute('aria-disabled','true');
 const pr=el.querySelector('.price');if(pr){pr.className='price v12p';pr.innerHTML=gateHTML(g,short)+(g.lv&&!g.res&&priceTxt&&!short?`<span class="v12sub">${priceTxt} once unlocked</span>`:'');}
 if(short){const s0=el.querySelector('.s');const why=g.res?`Yours at level ${g.lv}, no charge`:g.sp?`Comes with a ${brandOf(g.sp)} deal. Not sold in the Store.`:g.lv?`Unlocks at level ${g.lv}${priceTxt?', then '+priceTxt:''}`:'';if(s0&&why&&!s0.querySelector('.v12why'))s0.insertAdjacentHTML('beforeend',`<span class="v12why${g.lv&&!g.res?'':' v12whysp'}">${why}</span>`);}
 const tap=el.onclick;
 if(el.dataset.st2w&&tap){el.onclick=function(e){tap.call(el,e);const x=el.nextElementSibling;if(x&&x.classList.contains('st2x')){x.querySelectorAll('button').forEach(bt=>bt.remove());x.insertAdjacentHTML('beforeend',noteHTML(g,priceTxt));}};}
 else el.onclick=null;}
function nextUnlock(lv){let best=null;BARRELS.forEach(b=>{const n=LV[b.id];if(!EXCL[b.id]&&n>lv&&!save.owned.includes(b.id)&&(!best||n<best.lv))best={lv:n,n:b.n};});return best;}
function levelStrip(){const L=$('shopList');if(!L)return;let s=$('v12lv');const lv=lvNow();if(lv==null){if(s)s.remove();return;}
 if(!s){s=document.createElement('div');s.id='v12lv';s.className='v12lv';L.parentNode.insertBefore(s,L);}
 const nx=nextUnlock(lv);s.innerHTML=`<div class="lvn"><small>Level</small><b>${lv}</b></div>`+(nx?`<span class="nx">Next barrel · level ${nx.lv}</span><span class="nn">${nx.n}</span>`:`<span class="nx">Every barrel unlocked</span><span class="nn">Sponsor sets come <i>with a deal</i></span>`);}
function clampDesc(el){const s0=el.querySelector('.s');if(!s0||s0.querySelector('.v12d'))return '';const sp=document.createElement('span');sp.className='v12d';
 while(s0.firstChild&&!(s0.firstChild.nodeType===1&&s0.firstChild.matches('.kitpts,.v12why,.swtag,br')))sp.appendChild(s0.firstChild);s0.insertBefore(sp,s0.firstChild);return sp.textContent.trim();}
function previewFull(el,txt){if(!txt||!el.dataset.st2w||el.dataset.v12f)return;el.dataset.v12f='1';const tap=el.onclick;if(!tap)return;
 el.onclick=function(e){tap.call(el,e);const x=el.nextElementSibling;if(x&&x.classList.contains('st2x')&&!x.querySelector('.v12full')){const big=x.querySelector('.st2big');const p=document.createElement('p');p.className='v12full';p.textContent=txt;if(big)big.after(p);else x.prepend(p);}};}
function buyBtn(el,cost,doBuy){const pr=el.querySelector('.price');if(!pr)return;const bank=career()?career().bank:0;const ok=bank>=cost;pr.className='price v12bp';
 pr.innerHTML=`<span class="v12buy${ok?'':' poor'}" aria-label="Buy for ${money(cost)}"><i>Buy</i><b>${money(cost)}</b></span>`+(ok?'':`<span class="v12need">Need ${money(cost-bank)} more</span>`);
 const btn=pr.querySelector('.v12buy');btn.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();if(ok)doBuy();});}
function buyBarrel(b){const c=career();const p=price(b.price);if(!c||c.bank<p||save.owned.includes(b.id)||gateBarrel(b))return;c.bank-=p;save.owned.push(b.id);save.barrel=b.id;try{noiseBurst({dur:.08,freq:3000,q:3,gain:.15});}catch(e){}persist();showShop();}
function buyPart(key,it){const c=career();const p=price(it.price);if(!c||c.bank<p||gatePart(key,it.id))return;c.bank-=p;save.ownedSetup=(save.ownedSetup||[]).concat(key+':'+it.id);try{noiseBurst({dur:.08,freq:3000,q:3,gain:.15});}catch(e){}save.setup=Object.assign({},save.setup||{},{[key]:it.id});persist();try{V.setPlayerLook(save.look,save.flight,save.name,career()?career().tier:0);}catch(e){}showShop();}
function decorate(){if(grantSponsorSet()|syncReserve(false).length>0&&!decorate.again){decorate.again=1;try{showShop(showShop.tab,true);}finally{decorate.again=0;}return;}
 const rows=[...document.querySelectorAll('#shopList .opt')];
 rows.forEach((el,i)=>{const b=BARRELS[i];if(!b)return;el.dataset.v12id=b.id;const full=clampDesc(el);
  if(save.owned.includes(b.id)){const sid=EXCL[b.id]||((SPONSORS.find(s=>s.v12gift===b.id&&s.id===save.sponsor)||{}).id);if(EXCL[b.id]){const s0=el.querySelector('.s');if(s0&&!s0.querySelector('.v12why'))s0.insertAdjacentHTML('beforeend',`<span class="v12why spo" style="--bc:${bc(sid)}"><b>${brandOf(sid)}</b> sponsor set · yours to keep</span>`);}}
  else{const g=gateBarrel(b);if(g)lockRow(el,g,money(price(b.price)),true);else buyBtn(el,price(b.price),()=>buyBarrel(b));}
  previewFull(el,full);});
 levelStrip();
 const SU=$('setupList');if(SU){let key=null;[...SU.children].forEach(el=>{if(el.classList.contains('label')){key=/Shaft/.test(el.textContent)?'shaft':/Flight/.test(el.textContent)?'flight':'point';return;}const t=el.querySelector('.t');if(!t||!key)return;const list=key==='shaft'?SHAFTS:key==='flight'?FSHAPES:POINTS;const it=list.find(x=>x.n===t.textContent);if(!it)return;el.dataset.v12id=key+':'+it.id;
  const full=clampDesc(el);const own=(save.ownedSetup||[]).includes(key+':'+it.id)||it.price===0;
  if(!own){const g=gatePart(key,it.id);if(g)lockRow(el,g,money(price(it.price)),true);else buyBtn(el,price(it.price),()=>buyPart(key,it));}
  previewFull(el,full);});}
 markNew();}
// "New" chip on rows that unlocked since you last looked at them. Each item keeps its chip until you open
// its preview or own it (ChatGPT 19:10: a tab switch isn't the same as seeing it). Rows matched by data-v12id.
function ownedKey(k){if(k.includes(':'))return (save.ownedSetup||[]).includes(k);return save.owned.includes(k);}
function validKey(k){if(!k.includes(':'))return BARRELS.some(b=>b.id===k);return Object.prototype.hasOwnProperty.call(PART_LV,k);}
function seeNew(k){const nw=save.v12new||[];if(!nw.includes(k))return;save.v12new=nw.filter(x=>x!==k);try{persist();}catch(e){}}
function markNew(){let nw=save.v12new||[];if(!nw.length)return;
 const keep=nw.filter(k=>validKey(k)&&!ownedKey(k));if(keep.length!==nw.length){save.v12new=nw=keep;try{persist();}catch(e){}}
 document.querySelectorAll('#shopList .opt[data-v12id],#setupList .opt[data-v12id]').forEach(el=>{const k=el.dataset.v12id;if(!nw.includes(k))return;
  const t=el.querySelector('.t');if(!t||t.querySelector('.v12new'))return;t.insertAdjacentHTML('afterbegin','<span class="v12new">New</span>');
  el.addEventListener('click',()=>{seeNew(k);const c=el.querySelector('.v12new');if(c)c.remove();},{once:true});});}
const _ss12=showShop;showShop=function(){const r=_ss12.apply(this,arguments);try{decorate();}catch(e){console.warn('v12 shop',e);}return r;};
// ----- level-up reward: barrels (and parts) that just opened in the store -----
// the last level whose unlocks were shown lives on the career's v3 state; first seen = current level, so no backlog on update
function v3(){try{const c=career();if(!c||c.run)return null;return C3.V3();}catch(e){return null;}}
function seenInit(){const v=v3();if(v&&v.bSeen==null)v.bSeen=v.lv;}
const _cam12=careerAfterMatch;careerAfterMatch=function(){seenInit();const r=_cam12.apply(this,arguments);try{syncReserve(false);}catch(e){}return r;};
const _bm12=beginMatch;beginMatch=function(){seenInit();return _bm12.apply(this,arguments);};
function unlocksIn(a,b){const out=[];BARRELS.forEach(x=>{const n=LV[x.id];if(!EXCL[x.id]&&n>a&&n<=b&&n>1)out.push({k:'barrel',lv:n,it:x});});
 Object.entries(PART_LV).forEach(([tag,n])=>{if(n>a&&n<=b){const [key,id]=tag.split(':');const list=key==='shaft'?SHAFTS:key==='flight'?FSHAPES:POINTS;const it=list.find(x=>x.id===id);if(it)out.push({k:key,lv:n,it});}});return out;}
function ptsOf(id){try{if(!window.TOPS_kitPts)return '';const sb=save.barrel,ss=save.setup;save.barrel=id;save.setup={shaft:'med',flight:'standard',point:'std'};let k;try{k=TOPS_kitPts();}finally{save.barrel=sb;save.setup=ss;}
 return [['Scoring','sc'],['Finishing','fi'],['Control','ct'],['Rhythm','rh']].filter(([n,x])=>k[x]>0).map(([n,x])=>`${n} ▲${k[x]}`).join(' · ');}catch(e){return '';}}
function rewardCards(list){const bs=list.filter(u=>u.k==='barrel');const ps=list.filter(u=>u.k!=='barrel');let h='';
 bs.forEach(u=>{const b=u.it;let img='';try{img=V.dartShot(save.flight,Object.assign({},setupParts(),{barrel:b}));}catch(e){}
  const cost=price(b.price),cr=career(),bank=cr?cr.bank:0;
  const pr=save.owned.includes(b.id)?'Sponsor set · in your kit, <em>no charge</em>':bank>=cost?`<em>${money(cost)}</em> in the Store · you can afford it`:`<em>${money(cost)}</em> in the Store · ${money(cost-bank)} to go`;
  h+=`<div class="v12rw" role="status">${img?`<img class="v12im" src="${img}" alt="">`:''}<small>Level ${u.lv} · Store unlock</small><b>${b.n}</b><span class="v12pt">${ptsOf(b.id)}</span><span class="v12pr">${pr}</span></div>`;});
 if(ps.length)h+=`<div class="v12rw part" role="status"><small>Level ${ps[0].lv} · kit unlocked</small><b>${ps.map(u=>u.it.n).join(', ')}</b><span class="v12pr">${ps.map(u=>u.it.s).join(' ')} Now in the Store.</span></div>`;
 return h;}
function onReward(){const el=$('c3rw');if(!el||el.hidden)return;const card=el.querySelector('.c3rw-card');if(!card||card.dataset.v12)return;card.dataset.v12='1';
 syncReserve(false);const v=v3();if(!v)return;if(v.bSeen==null){v.bSeen=v.lv;return;}if(v.lv<=v.bSeen)return;
 const list=unlocksIn(v.bSeen,v.lv);v.bSeen=v.lv;
 // tag fresh unlocks so the Store can point them out on the next visit
 if(list.length){const nw=new Set(save.v12new||[]);list.forEach(u=>nw.add(u.k==='barrel'?u.it.id:u.k+':'+u.it.id));save.v12new=[...nw];}
 try{persist();}catch(e){}if(!list.length)return;
 const html=rewardCards(list);const anchor=card.querySelector('.c3rw-ach,.c3rw-con,.c3rw-hook,.c3rw-act');if(anchor)anchor.insertAdjacentHTML('beforebegin',html);else card.insertAdjacentHTML('beforeend',html);}
window.TOPS_v12Reward=onReward;
// career3 calls TOPS_REWARD(el) right after the reward overlay opens (no page-wide observer: older iPhones already struggle)
{const prev=window.TOPS_REWARD;window.TOPS_REWARD=function(el){try{if(prev)prev(el);}catch(e){}try{onReward();}catch(e){console.warn('v12 reward',e);}};}
})();
</script>
