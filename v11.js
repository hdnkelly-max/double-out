<style>
/* v1.53 quick wins: visit pops, post-match breakdown, rematch, first level-up */
#vpop{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 118px);transform:translateX(-50%);z-index:9000;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:4px}
#vpop .vp{font:800 15px/1 Barlow,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:8px 14px;border-radius:999px;background:rgba(14,16,20,.86);color:#f1e6c8;border:1px solid rgba(214,178,94,.55);box-shadow:0 6px 18px rgba(0,0,0,.35);animation:v11pop .5s cubic-bezier(.2,.75,.2,1);white-space:nowrap}
#vpop .vp.gold{background:linear-gradient(180deg,#e9c46a,#b8872b);color:#1b1306;border-color:#f6dc92}
#vpop .vp.pb{background:linear-gradient(180deg,#f3d27a,#c2902f);color:#1b1306;border-color:#fff1bf;font-size:17px;box-shadow:0 0 0 2px rgba(246,220,146,.35),0 10px 26px rgba(0,0,0,.45)}
#vpop .vp small{display:block;font:600 11px/1.2 Manrope,system-ui,sans-serif;letter-spacing:.04em;text-transform:none;margin-top:3px;opacity:.85}
@keyframes v11pop{0%{transform:translateY(8px) scale(.9)}45%{transform:translateY(0) scale(1.05)}100%{transform:none}}
#vpop .vmed{display:flex;flex-direction:column;align-items:center;gap:6px;animation:v11med .45s cubic-bezier(.2,1.3,.4,1)}
#vpop .vmed-c{position:relative;display:grid;place-items:center;width:58px;height:58px;border-radius:50%;font-style:normal;box-shadow:0 0 0 2px rgba(0,0,0,.35),0 6px 14px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.45),inset 0 -4px 8px rgba(0,0,0,.3)}
#vpop .vmed-c::before{content:"";position:absolute;inset:6px;border-radius:50%;border:1.5px solid rgba(255,255,255,.35)}
#vpop .vmed-c b{font:900 24px/1 "Barlow Condensed",Barlow,system-ui,sans-serif;letter-spacing:-.01em;text-shadow:0 1px 0 rgba(255,255,255,.35)}
#vpop .vmed-c em{animation:v11pb .4s .25s cubic-bezier(.2,1.6,.4,1) both;position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);font:800 10px/1 Barlow,system-ui,sans-serif;font-style:normal;letter-spacing:.14em;padding:3px 7px;border-radius:999px;background:#C6F36B;color:#0c1410;box-shadow:0 2px 6px rgba(0,0,0,.4)}
#vpop .vmed.bronze .vmed-c{background:radial-gradient(circle at 35% 28%,#F2C39A,#B87333 45%,#6E3E18);color:#2a1406}
#vpop .vmed.silver .vmed-c{background:radial-gradient(circle at 35% 28%,#FFFFFF,#C9D1D6 42%,#7E8A92);color:#1b2228}
#vpop .vmed.gold .vmed-c{background:radial-gradient(circle at 35% 28%,#FFF3C4,#E2B84F 42%,#9C6B19);color:#2a1a02;box-shadow:0 0 0 3px rgba(0,0,0,.35),0 0 14px rgba(246,210,120,.35),0 6px 14px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.5),inset 0 -4px 8px rgba(0,0,0,.3)}
#vpop .vmed small{white-space:nowrap;font:600 12px/1.2 Manrope,system-ui,sans-serif;color:#f1e6c8;background:rgba(14,16,20,.8);padding:4px 10px;border-radius:999px}
@keyframes v11pb{0%{transform:translateX(-50%) scale(0)}100%{transform:translateX(-50%) scale(1)}}
#vpop .vmed-c::after{content:"";position:absolute;inset:0;border-radius:50%;background:repeating-radial-gradient(circle at 50% 50%,rgba(255,255,255,.07) 0 1px,rgba(0,0,0,.05) 1px 3px);mix-blend-mode:overlay}
@keyframes v11med{0%{opacity:0;transform:scale(.4) rotate(-20deg)}70%{opacity:1;transform:scale(1.08) rotate(4deg)}100%{transform:scale(1) rotate(0)}}
@media (prefers-reduced-motion:reduce){#vpop .vp,#vpop .vmed{animation:none}}
/* v1.79 visit score (Hayden 21:52): just the number, white 0-59, silver 60-99, gold 100+, bottom-right of the board view, clear of the treble 20 (ChatGPT "Darts UI Design Review": steel silver, tighter plate, 40 px desktop, 160/1200/180 ms, short finish label) */
#vscore{position:fixed;z-index:9000;pointer-events:none;display:flex;flex-direction:column;align-items:flex-end;gap:4px}
#vscore .vs-n{font:italic 900 46px/.9 "Barlow Condensed",Barlow,system-ui,sans-serif;letter-spacing:-.01em;padding:8px 11px 7px;border-radius:6px;background:rgba(10,13,16,.78);box-shadow:0 6px 18px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.08);animation:v11sc 1.54s linear both}
#vscore.desk .vs-n{font-size:40px}
#vscore .vs-n i{font-style:normal;color:#F1EDE4}
#vscore.silver .vs-n i{background:linear-gradient(180deg,#F1F4F5,#8C9BA3);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 1px 0 rgba(0,0,0,.55))}
#vscore.gold .vs-n{box-shadow:0 6px 18px rgba(0,0,0,.45),inset 0 0 0 1px rgba(246,210,120,.35)}
#vscore.gold .vs-n i{background:linear-gradient(180deg,#FFF1B8,#E9BF55 50%,#B07A1E);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 1px 0 rgba(0,0,0,.45))}
#vscore small{font:800 10.5px/1 Barlow,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#f1e6c8;background:rgba(10,13,16,.82);padding:5px 8px;border-radius:5px;white-space:nowrap;animation:v11sc 1.54s linear both}
@keyframes v11sc{0%{opacity:0;transform:translateY(8px)}10.4%{opacity:1;transform:none}88.3%{opacity:1;transform:none}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){#vscore .vs-n,#vscore small{animation:v11scr 1.54s linear both}@keyframes v11scr{0%,88%{opacity:1}100%{opacity:0}}}
#hub b.nm{font-size:15px!important;line-height:1.05!important;letter-spacing:0!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;display:block}
/* the reward card already lists achievements: no toasts on top of it */
body:has(#c3rw:not([hidden])) #achToasts{display:none!important}
#lvFirst .sw,.c3rw-unl .sw{display:none!important}
/* breakdown tiles */
#resKeys.v11{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#resKeys.v11>div{min-width:0}
#resKeys.v11 small{font-size:11px}
#resKeys.v11 span{font-size:12px}
@media (min-width:700px){#resKeys.v11{grid-template-columns:repeat(4,minmax(0,1fr))}}
/* rematch front and centre */
#btnResultNext.v11rem{order:-1;width:100%;min-height:58px;font-size:18px;font-weight:800;letter-spacing:.06em;background:linear-gradient(180deg,#e9c46a,#b8872b)!important;color:#1b1306!important;border:1px solid #f6dc92!important;box-shadow:0 8px 22px rgba(184,135,43,.35)}
#btnResultNext.v11rem small{color:#3a2a0c!important;opacity:.85}
/* first level-up reveal */
#lvFirst{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 42%,#3a2a0c,#0b0c0f 72%);color:#f1e6c8;text-align:center;padding:24px;cursor:pointer}
#lvFirst .k{font:700 13px Manrope,system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;color:#d6b25e;animation:lvUp .5s .1s}
#lvFirst .n{font:900 88px/1 Barlow,system-ui,sans-serif;background:linear-gradient(180deg,#fff1bf,#d6a640 60%,#9a6d1e);-webkit-background-clip:text;background-clip:text;color:transparent;animation:lvBig .7s .25s cubic-bezier(.2,.75,.2,1);filter:drop-shadow(0 6px 18px rgba(214,166,64,.45))}
#lvFirst .s{font:600 15px/1.4 Manrope,system-ui,sans-serif;max-width:300px;margin-top:14px;animation:lvUp .5s .8s}
#lvFirst .t{margin-top:26px;font:700 12px Manrope,system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#d6b25e;animation:lvUp .5s 1.4s}
#lvFirst .ring{position:absolute;width:220px;height:220px;border-radius:50%;border:2px solid rgba(246,220,146,.6);opacity:0;animation:lvRing 1.2s .25s ease-out forwards}
@keyframes lvUp{from{transform:translateY(8px)}to{transform:none}}
@keyframes lvBig{0%{transform:scale(.6)}60%{transform:scale(1.08)}100%{transform:scale(1)}}
@keyframes lvRing{0%{opacity:.9;transform:scale(.4)}100%{opacity:0;transform:scale(2.2)}}
</style>
<script>
// ===== v1.53 quick wins =====
(function(){
 const safe=f=>function(){try{return f.apply(this,arguments);}catch(e){console.warn('v11',e);}};
 // ---- 1. feedback on every visit (mine only) ----
 let host=null;const pop=(txt,cls,sub)=>{if(!host){host=document.createElement('div');host.id='vpop';document.body.appendChild(host);}
  host.innerHTML='';const d=document.createElement('div');d.className='vp '+(cls||'');d.innerHTML=txt+(sub?`<small>${sub}</small>`:'');host.appendChild(d);setTimeout(()=>{if(d.parentNode)d.remove();},1700);};
 window.TOPS_POP=pop;
 const medal=(n,tier,pb,sub)=>{if(!host){host=document.createElement('div');host.id='vpop';document.body.appendChild(host);}
  host.innerHTML='';const d=document.createElement('div');d.className='vmed '+tier;
  d.innerHTML=`<i class="vmed-c"><b>${n}</b>${pb?'<em>PB</em>':''}</i>${sub?`<small>${sub}</small>`:''}`;host.appendChild(d);setTimeout(()=>{if(d.parentNode)d.remove();},1500);};
 let scEl=null,scT=0;
 const scoreNum=(n,band,sub)=>{try{if(!scEl){scEl=document.createElement('div');scEl.id='vscore';document.body.appendChild(scEl);}
  const R=V.lkRects&&V.lkRects(),B=R&&R.board;const W=innerWidth,H=innerHeight;
  if(B&&B.w>0){scEl.style.right=Math.max(14,W-(B.x+B.w)+14)+'px';scEl.style.bottom=Math.max(14,H-(B.y+B.h)+14)+'px';scEl.style.left='auto';scEl.style.top='auto';}
  else{scEl.style.right='16px';scEl.style.bottom='45%';}
  let desk=false;try{desk=!(V.lkPhone&&V.lkPhone());}catch(e){}scEl.className=band+(desk?' desk':'');scEl.innerHTML=`<div class="vs-n"><i>${n}</i></div>${sub?`<small>${sub}</small>`:''}`;
  // ChatGPT round 2: keep >=12 px between the finish label and the HR chip on narrow phones (the gap was 8 px at 360):
  // shorten to "120 LEFT · FINISH", and if that still doesn't fit, drop the label (the number stays)
  const sm=sub&&scEl.querySelector('small'),hrE=document.getElementById('hr');
  if(sm&&hrE){const tight=()=>{const a=sm.getBoundingClientRect(),h=hrE.getBoundingClientRect();return h.width>0&&a.bottom>h.top-10&&a.top<h.bottom+10&&a.left-h.right<12;};
   if(tight()){sm.textContent=sub.replace(' · on a finish',' · finish');if(tight())sm.remove();}}
  clearTimeout(scT);scT=setTimeout(()=>{if(scEl)scEl.innerHTML='';},1560);}catch(e){}};
 // the number belongs to the visit just thrown: the next dart (anyone's) clears it (ChatGPT review)
 const scClear=()=>{clearTimeout(scT);if(scEl)scEl.innerHTML='';};
 if(typeof landCore==='function'){const _lc=landCore;landCore=function(){scClear();return _lc.apply(this,arguments);};}
 window.TOPS_scoreNum=scoreNum;
 const mine=p=>p&&!p.ai&&(!S.online||p.key===NET.myId);
 const _vc=visitCall;visitCall=function(gained,h,who){const r=_vc.apply(this,arguments);safe(()=>{
   if(!S||S.done||S.bull)return;const me=S.p[who==null?S.cur:who];if(!mine(me)||gained>=180)return;
   S.v11=S.v11||{ton:false,tre:false};const labs=(S.visit||[]).map(v=>v.label||'');const bust=(S.visit||[]).some(v=>v.bust);if(bust)return;
   const prev=save.pbVisit||0;const seasoned=(save.matches||0)>=3;
   if(!S.practice)save.pbVisit=Math.max(prev,gained);
   let left='';try{if(me.score>1&&me.score<=170&&route(me.score,3)&&S.visitStart>170)left=`${me.score} left · on a finish`;}catch(e){}
   const hadT=labs.some(l=>/^T/.test(l));
   // visit score (Hayden 21:52, replaces the medals): just the number after every visit, white 0-59, silver 60-99, gold 100+; 180 keeps its own moment
   const pb=!S.practice&&seasoned&&prev>=60&&gained>prev;
   if(labs.some(l=>/^T/.test(l)))S.v11.tre=true;
   scoreNum(gained,gained>=100?'gold':gained>=60?'silver':'white',left);if(pb){try{sfxLevel();}catch(e){}}
 })();return r;};
 const _bm=beginMatch;beginMatch=function(){const r=_bm.apply(this,arguments);try{if(S)S.v11={ton:false,tre:false};}catch(e){}return r;};

 // ---- 2. post-match breakdown for every mode ----
 const _rk=renderKeys;renderKeys=function(p0,c){const r=_rk.apply(this,arguments);safe(()=>{
   const host=$('resKeys'),coach=$('resCoach');if(!host||!p0)return;
   const a=avg(p0);const form=(save.form||[]).slice(-10);const fa=form.length?form.reduce((x,y)=>x+y,0)/form.length:null;
   if(!S.practice&&p0.darts>=9){save.form=(save.form||[]).concat([+a.toFixed(1)]).slice(-20);}
   const f=f9(p0);const co=p0.coAtt?Math.round(p0.coHit/p0.coAtt*100):null;const pf=p0.throws?Math.round((p0.perfects||0)/p0.throws*100):null;
   const tile=(k,v,sub,cls)=>`<div><small>${k}</small><b>${v}</b><span class="${cls||''}">${sub}</span></div>`;
   const d=fa==null?null:a-fa;
   const formT=tile('Average',a.toFixed(1),fa==null?'First match on record':`${d>=0?'+':''}${d.toFixed(1)} vs your last ${form.length}`,d==null?'':d>=0?'up':'dn');
   const f9T=tile('First 9',f?f.toFixed(1):'–',f?(f>=a?'Fast starter':`${(a-f).toFixed(0)} below your average`):'Not enough darts');
   const coT=tile('Checkouts',co==null?'–':co+'%',`${p0.coHit||0} of ${p0.coAtt||0} at a double`);
   const pfT=tile('Timing',pf==null?'–':pf+'%',pf==null?'':`perfect releases${(p0.early||0)+(p0.late||0)>3?((p0.early||0)>(p0.late||0)*1.4?', mostly early':(p0.late||0)>(p0.early||0)*1.4?', mostly late':''):''}`);
   if(ui.mode==='career'&&c){host.insertAdjacentHTML('afterbegin',f9T);if(fa!=null){const av=[...host.children].find(x=>/Average/i.test((x.querySelector('small')||{}).textContent||''));const sp=av&&av.querySelector('span');if(sp)sp.insertAdjacentHTML('beforeend',`<br>${d>=0?'+':''}${d.toFixed(1)} vs your form`);}}
   else{host.innerHTML=formT+f9T+coT+pfT;host.hidden=false;
     let line='';if(S.practice)line='Practice. Nothing counts except what your arm learned.';
     else if(co!=null&&p0.coAtt>=4&&co<20)line=`${p0.coAtt} darts at doubles, ${p0.coHit} in. The finishing cost you.`;
     else if(f&&f<a-10)line=`First nine ${f.toFixed(0)}, overall ${a.toFixed(0)}. Start faster.`;
     else if(d!=null&&d>=5)line=`${d.toFixed(0)} up on your recent form. Keep that arm.`;
     else if(d!=null&&d<=-8)line=`Off your usual by ${(-d).toFixed(0)}. Short memory.`;
     else if(pf!=null&&p0.throws>=15&&pf<10)line=(p0.early||0)>(p0.late||0)?'Most releases were early. Hold a fraction longer.':'Most releases were late. Let go on the stop.';
     if(line&&coach){coach.textContent=line;coach.hidden=false;}}
   host.classList.add('v11');
 })();return r;};

 // ---- 3. rematch front and centre ----
 const _rb=resultOnlineButtons;resultOnlineButtons=function(on){const r=_rb.apply(this,arguments);safe(()=>{const nb=$('btnResultNext');if(!nb)return;
   if(on){nb.classList.add('v11rem');nb.innerHTML='Rematch<small>Same room, same rules. Tap to ready up</small>';const par=nb.parentNode;if(par&&par.firstElementChild!==nb)par.insertBefore(nb,par.firstElementChild);}
   else nb.classList.remove('v11rem');})();return r;};

 // ---- 4. a bigger first level-up: full-screen reveal the first time the reward card unlocks something ----
 const lvReveal=(unl)=>{const lab=(unl.querySelector('small')||{}).textContent||'';const m=lab.match(/Level (\d+)/);const lv=m?m[1]:'2';
   const item=(unl.querySelector('b')||{}).textContent||'';const ico=unl.querySelector('.ri');
   const o=document.createElement('div');o.id='lvFirst';o.innerHTML=`<div class="ring"></div><div class="k">Level up</div><div class="n">${lv}</div><div class="s">${item?`<b style="display:block;font:800 22px Barlow,system-ui,sans-serif;letter-spacing:.04em;color:#fff1bf;margin-bottom:6px">${item}</b>`:''}Your first unlock. Every level from here adds something to your kit, your look or your name.</div><div class="t">Tap to equip</div>`;
   if(ico){const c=ico.cloneNode(true);c.style.cssText='display:block;width:96px;height:96px;margin:18px auto 0;animation:lvUp .5s .6s';const im=c.querySelector('img');if(im)im.style.cssText='width:96px;height:96px;object-fit:contain';o.querySelector('.s').after(c);}
   document.body.appendChild(o);try{sfxLevel();setTimeout(()=>{try{sfxCheer(false);}catch(e){}},350);}catch(e){}try{confetti(1);}catch(e){}
   let gone=false;const go=()=>{if(gone)return;gone=true;o.style.transition='opacity .25s';o.style.opacity='0';setTimeout(()=>o.remove(),260);};o.onclick=go;setTimeout(go,5000);};
 new MutationObserver(()=>{try{const u=$('c3rwUnl');if(!u||u.hidden||u.dataset.v11||save.lvFirstSeen)return;u.dataset.v11=1;if(!/Level \d+ unlocked/.test(u.textContent))return;save.lvFirstSeen=true;try{persist();}catch(e){}setTimeout(()=>lvReveal(u),250);}catch(e){}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden'],childList:true});
})();
</script>
<script>
// ===== v1.55 difficulty: Rookie / Club / Competitive + placement from your first 120 career darts =====
// Open, not secret: the level and the shift are shown to the player. No rubber-banding mid-match.
(function(){
 const LV={rookie:{n:'Rookie',off:-6,d:'Opponents a step below the pub field. Learn the throw.'},club:{n:'Club',off:0,d:'The field as written. Pub regulars play their usual.'},comp:{n:'Competitive',off:5,d:'Everyone brings their best night. For players already averaging 60+.'}};
 const D=()=>save.diff||null;window.TOPS_DIFF=LV;
 // v1.77 (#12, rule 11): the 120-dart placement no longer touches opponent strength. Opponents come from tier, opponent and difficulty only.
 const placeEff=()=>0;
 const placeOff=()=>0;
 const totalOff=()=>{const d=D();if(!d)return 0;return (LVO[d.lv]!=null?LVO[d.lv]:0)+placeOff();};
 window.topsDiffOffset=totalOff;
 // shift opponent averages in career (not practice, drills or the intro tutorial)
 // v1.77 (#12, rule 11): opponents are mapped into their tier's band instead of taking raw offsets. Before this, placement
 // (measured once off the player's own average, usually against the pub) and the level offset were added at every tier, so a
 // 75-average pub player met 85-average Club opponents even on Rookie. The bands are for the default setting (Club); Competitive sits up to 5 above, Rookie below.
 // Bands are Hayden's drafts; tests/sim-ai.js gates them.
 const BAND=[[50,58],[56,64],[62,70],[68,76],[74,82],[80,90],[88,100]];
 // target that makes the simulated match average land mid-band: pub and club AIs finish less efficiently, and stage pressure widens the spread at higher tiers, so each centre sits above its band middle by the measured gap
 const CEN=[58,63,69,76,84,91,97];
 // Competitive headroom over the Club top per tier: Trans-Tasman and Pro Tour fields have the widest spread (stage pressure), so their toughest opponents run hottest; less headroom there keeps them inside the +5 hard cap with margin (sim-ai 200 legs, 20:47)
 const CX=[3,3,3,3,1,1,3];
 const LVO={rookie:-6,club:0,comp:5}; // option A (Overseer 20:02): Club, the default, sits in the band; Competitive up to 5 above; Rookie 6 below
 const tierOf=t=>{const n=t==null?(career()?career().tier:0):t;return Math.max(0,Math.min(6,n|0));};
 const shift=(v,t)=>{const k=tierOf(t),[lo,hi]=BAND[k],adj=CEN[k]-(lo+hi)/2,d=D();const lv=d&&LVO[d.lv]!=null?d.lv:'club';
  const rel=Math.max(-10,Math.min(10,v-TIERS[k].avg))*.5;                         // keep the field's spread (deciders, Deano, table) at half strength
  const tgt=CEN[k]+rel+LVO[lv];
  const top=hi+adj+(lv==='comp'?CX[k]:0),bot=lo+adj-(lv==='rookie'?12:0);   // Club inside the band; Competitive targets at most 3 over (realised toughest opponents stay inside the +5 hard cap); Rookie below
  return Math.round(Math.max(Math.max(20,bot),Math.min(top,tgt)));};
 window.TOPS_OPP_SHIFT=shift;
 // save migration (v1.77): opponents stored by v1.75 (the queued next opponent, a revenge match) carry the old inflated average.
 // Undo the old offset (level + placement, read before placement is cleared), then shift once with the new rule. New-code opponents carry oppRaw and _d=2.
 const migrateSave=()=>{try{const d=save.diff,c=save.career;if(!c&&!d)return;let ch=false;
  const oldOff=d?(({rookie:-6,club:0,comp:8})[d.lv]||0)+(d.place||0):0;
  if(c&&c.next&&c.next.oppAvg>0&&c.next.oppRaw==null&&!c.next.intro){const raw=Math.max(20,c.next._d?c.next.oppAvg-oldOff:c.next.oppAvg);c.next.oppRaw=raw;c.next.oppAvg=shift(raw,c.tier);c.next._d=2;ch=true;}
  const v=c&&c.v3;if(v&&v.rev&&v.rev.avg>0&&!v.rev.raw){if(d)v.rev.avg=Math.max(20,v.rev.avg-oldOff);v.rev.raw=1;ch=true;}
  if(d&&(d.place||d.placeNew)){d.place=0;d.placeNew=false;d.placeCleared=1;ch=true;}
  if(ch)persist();}catch(e){console.warn('v11 migrate',e);}};
 migrateSave();window.TOPS_v11Migrate=migrateSave;
 // shifted exactly once: the raw rating is kept on the opponent and every shift starts from it (ChatGPT 19:47: rematch, save/load, reused objects)
 const _no=nextOpponent;nextOpponent=function(){const n=_no.apply(this,arguments);try{if(n&&!n.intro&&n.oppAvg>0&&!n._d){n.oppRaw=n.oppAvg;n.oppAvg=shift(n.oppAvg);n._d=2;}}catch(e){}return n;};
 const SHIFTED=new WeakSet();
 const _bm=beginMatch;beginMatch=function(opts){try{const c=career();const viaNext=c&&c.next&&c.next._d&&opts&&opts.oppName===c.next.oppName&&opts.oppAvg===c.next.oppAvg;const done=opts&&(opts._diffOff!=null||SHIFTED.has(opts));if(opts&&opts.mode==='career'&&!opts.practice&&!opts.intro&&!opts.tcExh&&opts.oppAvg>0&&!viaNext&&!done){const o=totalOff();const raw=opts.oppRaw!=null?opts.oppRaw:opts.oppAvg;opts=Object.assign({},opts,{oppRaw:raw,oppAvg:shift(raw,opts.tier),_diffOff:o});SHIFTED.add(opts);}
  else if(opts&&viaNext&&c.next.oppRaw!=null&&opts.oppRaw==null)opts=Object.assign({},opts,{oppRaw:c.next.oppRaw});}catch(e){}
  const r=_bm.call(this,opts);try{if(S&&opts)S.oppRaw=opts.oppRaw!=null?opts.oppRaw:null;}catch(e){}return r;}; // S.oppRaw: revenge replays store the raw rating, so they're shifted once
 // count career darts for placement
 const _em=endMatch;endMatch=function(){try{if(ui.mode==='career'&&!S.practice&&!S.drill&&D()){const me=S.p[0];const d=D();d.darts=(d.darts||0)+(me.darts||0);d.pts=(d.pts||0)+(me.pts||0);
   /* v1.77: 120-dart placement retired (rule 11) */}}catch(e){}return _em.apply(this,arguments);};
 const pick=(done,again)=>{const cur=D()&&D().lv;showMsg({from:'Kev Mercer',lines:[again?'Change how hard it is? It applies from your next match.':'Before you play: how hard do you want it? Rookie is a step below the pub, Club is the field as written, Competitive is for 60+ averages.','Each level up the ladder brings a tougher field. Change this any time from the hub.'],replies:[['Rookie','rookie'],['Club','club'],['Competitive','comp']]},a=>{save.diff=Object.assign(D()||{darts:0,pts:0,place:null},{lv:LV[a]?a:'club'});try{const c=career();if(c)c.next=null;}catch(e){}try{persist();trackEv('diff_pick',{lv:save.diff.lv,again:!!again});}catch(e){}done&&done();});};
 window.topsPickDiff=()=>pick(()=>{try{showHub();}catch(e){}},true);
 const _pn=playNext;playNext=function(){const args=arguments,self=this;try{const c=career();if(c&&!c.run&&c.stage!=='intro'){if(!D()){return pick(()=>_pn.apply(self,args));}}}catch(e){}return _pn.apply(self,args);};
 // a small difficulty chip on the career hub, tap to change
 setInterval(()=>{try{const d=D();const h=document.querySelector('#hub:not([hidden]) .hx-head');if(!d||!h||h.querySelector('.v11diff'))return;const b=document.createElement('button');b.type='button';b.className='v11diff';b.textContent=(LV[d.lv]||LV.club).n;b.onclick=e=>{e.stopPropagation();window.topsPickDiff();};const bk=h.querySelector('.bank');h.insertBefore(b,bk||null);}catch(e){}},1500);
})();
</script>
<style>.v11diff{margin:0 8px 0 auto;font:700 11px Manrope,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:6px 10px;border-radius:999px;border:1px solid rgba(214,178,94,.5);background:rgba(14,16,20,.6);color:#e9d9a8;cursor:pointer}</style>
<script>
// ===== v1.56 versioned cloud saves: an older device can never overwrite newer progress =====
(function(){if(typeof cloudPush!=='function'||typeof NET==='undefined')return;
 let DEV='';try{DEV=localStorage.getItem('tops-dev')||'';if(!DEV){DEV='d'+Math.random().toString(36).slice(2,10);localStorage.setItem('tops-dev',DEV);}}catch(e){DEV='d'+Math.random().toString(36).slice(2,10);}
 const _ps=persist;persist=function(){try{save.sv=(save.sv||0)+1;save.dev=DEV;}catch(e){}return _ps.apply(this,arguments);};
 const busy=()=>typeof S!=='undefined'&&S&&!S.done;
 const adopt=(cloud,why)=>{if(!cloud)return;if(busy()){NET.pendCloud=cloud;return;}NET.pendCloud=null;const keep={authSeen:true,cloudUser:save.cloudUser};save=Object.assign({},cloud,keep);save.dev=DEV;try{window.TOPS_v11Migrate&&TOPS_v11Migrate();}catch(e){}/* #12: newer save from another device may be a v1.75 one */try{localStorage.setItem('doubleout2',JSON.stringify(save));}catch(e){}
   try{trackEv('save_newer',{why,sv:cloud.sv||0});}catch(e){}try{flash('Synced','',why==='push'?'Newer progress from your other device':'Loaded your latest progress');}catch(e){}try{if(document.querySelector('#hub:not([hidden])'))showHub();else if(document.querySelector('#title:not([hidden])'))showTitle();}catch(e){}};
 cloudPush=function(now){if(!NET.user||!NET.sb)return;clearTimeout(NET.pushT);const go=async()=>{try{const {data,error}=await NET.sb.rpc('tops_save_put',{p_data:save});if(error)throw error;
    if(data&&data.ok){NET.cloudAt=Date.now();return;}if(data&&data.err==='older'&&data.data){console.warn('TOPS cloud save is newer (sv '+data.sv+' vs '+(save.sv||0)+'), loading it');adopt(data.data,'push');}}catch(e){console.warn('cloud push',e);}};if(now)go();else NET.pushT=setTimeout(go,2500);};
 // coming back to the app: pull, and load the cloud copy if another device moved on
 const pull=async()=>{try{if(!NET.user||!NET.sb)return;const {data,error}=await NET.sb.from('tops_saves').select('data').eq('user_id',NET.user.id).maybeSingle();if(error||!data||!data.data)return;const c=data.data;
   if((c.sv||0)>(save.sv||0)&&c.dev!==DEV)adopt(c,'pull');}catch(e){}};
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pull();});
 setInterval(()=>{try{if(NET.pendCloud&&!busy())adopt(NET.pendCloud,'push');}catch(e){}},2000);
 window.TOPS_SAVEV={pull,dev:()=>DEV};
})();
</script>
<script>
// ===== v1.57 guided first throw before your first career match =====
(function(){if(typeof lessonStart!=='function'||typeof playNext!=='function')return;
 const need=()=>!save.lessonDone&&(save.totThrows||0)<30;
 const _pn=playNext;playNext=function(){try{const c=career();if(c&&!c.run&&need()&&!(typeof LES!=='undefined'&&LES.on)){LES.career=true;try{trackEv('lesson_auto');}catch(e){}lessonStart();return;}}catch(e){}return _pn.apply(this,arguments);};
 const _lf=lessonFinish;lessonFinish=function(){const r=_lf.apply(this,arguments);try{if(LES.career){const b=$('lsCareer');if(b){b.textContent='Play your first match';b.onclick=ev=>{ev.stopPropagation();LES.on=false;LES.career=false;save.lessonDone=true;persist();$('lesson').hidden=true;if(S)S.done=true;$('hud').hidden=true;try{showHub();}catch(e){}setTimeout(()=>{try{playNext();}catch(e){}},300);};}}}catch(e){}return r;};
 const _le=lessonEnd;lessonEnd=function(skipped){const wasC=LES.career;LES.career=false;const r=_le.apply(this,arguments);if(wasC&&skipped){try{if(S)S.done=true;$('hud').hidden=true;showHub();setTimeout(()=>{try{playNext();}catch(e){}},300);}catch(e){}}return r;};
})();
</script>
<style>
/* ===== v1.62 polish pass from ChatGPT review (11 Nov, 7.6/10): loadout, tiers, picks banner, stakes, chips, standings ===== */
/* loadout: the player is the product */
.tc-load{background:linear-gradient(180deg,rgba(16,25,26,0) 0,rgba(16,25,26,0) 40vh,#10191A 50vh)!important}
.tc-load-stage{height:42vh!important;padding-bottom:12px!important}
.tc-load-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding-top:4px}
.tc-load-list .tc-lrow{min-height:84px;padding:10px;border:1px solid #344345!important;border-radius:10px;background:#162123!important;flex-direction:column;align-items:flex-start;gap:6px;position:relative}
.tc-load-list .tc-lrow .tc-lthumb{position:absolute;right:10px;top:10px;width:30px;height:42px}
.tc-load-list .tc-lrow span{padding-right:36px}
.tc-load-list .tc-lrow small{font:700 10px Manrope,system-ui,sans-serif!important;letter-spacing:.12em}
.tc-load-list .tc-lrow b{font:800 15px/1.15 "Barlow Condensed",sans-serif!important;letter-spacing:.02em}
.tc-load-list .tc-lrow b.tc-none{font:600 12px Manrope,system-ui,sans-serif!important;text-transform:none!important;color:#899693}
.tc-load-list .tc-lrow em{font-size:11px!important;position:absolute;right:10px;bottom:8px}
.tc-load-list .tc-lrow .tc-chev{display:none}
.tc-load-list .tc-lrow:has(b:not(.tc-none)){border-color:#C6F36B!important;background:linear-gradient(180deg,#1b2a24,#162123)!important}
/* achievement tiers: medals with weight */
.tc-trow{min-height:88px!important;padding:12px 4px!important}
.tc-trow .tc-medal{width:32px!important;height:32px!important}
.tc-trow .tc-medal.off{background:radial-gradient(circle at 35% 30%,#8f9699,#4c5357 60%,#2c3134)!important;box-shadow:inset 0 1px 1px rgba(255,255,255,.18)!important;opacity:.5!important;filter:none!important}
.tc-trow .tc-medal.next{opacity:.9!important;box-shadow:0 0 0 2px #C6F36B,inset 0 1px 1px rgba(255,255,255,.2)!important}
.tc-trow b{font-size:17px!important}
.tc-trow span{font-size:12px!important;color:#A0AAA7!important}
.tc-trow .tc-bar{height:4px!important;border-radius:2px;background:#344345!important}
.tc-trow.done b{color:#D7B45C}
/* card picks banner reads as a reward */
.tc-picks{min-height:80px!important;border-left:3px solid #C6F36B!important}
.tc-picks span b{font-size:26px!important;font-weight:900!important}
/* exhibition stakes */
.tc-stakes div{min-height:76px;display:flex;flex-direction:column;justify-content:center;border:1px solid #344345}
.tc-stakes b{font-size:20px!important}
/* filter chips */
.tc-chips button{min-height:36px;font:650 12px Manrope,system-ui,sans-serif!important}
/* collection: rarity borders, missing cards read as silhouettes */
.tc.is-locked{opacity:.62}
/* close buttons: consistent */
.tc-x{width:44px!important;height:44px!important;top:max(12px,env(safe-area-inset-top))!important;right:12px!important}
/* career standings: your row stands out */
#hub tr.you,#hub .you-row,#hub [data-you="1"]{background:#263B32!important;box-shadow:inset 3px 0 0 #C6F36B}
</style>
<style>
/* v1.66 result details polish (ChatGPT round 3 prep): objective chips were squeezed into a narrow column, next-fixture text unreadable on lime */
#resObj{grid-column:1/-1!important;width:100%!important;max-width:none!important}
#resObjChips{display:flex!important;flex-direction:column!important;gap:6px!important}
#resObjChips .chip{display:block!important;height:auto!important;min-height:0!important;margin:0!important;width:100%!important;white-space:normal!important;word-break:normal!important;font:600 13px/1.35 Manrope,system-ui,sans-serif!important;padding:8px 10px!important;text-align:left!important}
#btnResultNext:not(.v11rem),#btnResAction{color:#10191A!important}
#btnResultNext:not(.v11rem) small,#btnResAction small{color:#24331f!important;opacity:.85}
</style>
<style>
/* v1.67 ChatGPT round 3 (match flow 7.7/10): result first on the details screen, pinned Next fixture, clear XP names */
@media (max-width:700px){
 #result .rx-left{display:flex!important;flex-direction:column}
 #result .rx-left>*{order:3}
 #result .rx-left>#resTitle{order:0}
 #result .rx-left>#resSub{order:1}
 #result .rx-left>.res-score{order:2;margin:8px 0 14px!important}
 #btnResAction{position:sticky;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:6;box-shadow:0 -8px 24px rgba(16,25,26,.9)}
}
</style>
<script>
// v1.68 avatars: portraits drawn before your chosen character loaded were cached as the default bloke. Redraw once it's in.
let __avN=0;setInterval(()=>{try{if(!window.__avPending||__avN>12)return;__avN++;window.__avPending=0;document.dispatchEvent(new Event('tops-avatars'));}catch(e){}},2500);
document.addEventListener('tops-avatars',()=>{try{if(typeof S!=='undefined'&&S&&!S.done)return;if(document.querySelector('#hub:not([hidden])')){const t=hubTab.cur;showHub();try{if(t)hubTab(t);}catch(e){}}else if(document.querySelector('#title:not([hidden])'))showTitle();}catch(e){}});
</script>
<script>
// v1.69 one-time migration: collectible kit slots moved from look.kit (clashed with the shirt kit picker) to look.tkit
(function(){try{const L=save.look;if(L&&L.kit&&typeof L.kit==='object'){L.tkit=Object.assign({},L.tkit||{},L.kit);L.kit=null;persist();}}catch(e){}})();
</script>
