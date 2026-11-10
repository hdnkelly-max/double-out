<style>
/* v1.53 quick wins: visit pops, post-match breakdown, rematch, first level-up */
#vpop{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 118px);transform:translateX(-50%);z-index:9000;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:4px}
#vpop .vp{font:800 15px/1 Barlow,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:8px 14px;border-radius:999px;background:rgba(14,16,20,.86);color:#f1e6c8;border:1px solid rgba(214,178,94,.55);box-shadow:0 6px 18px rgba(0,0,0,.35);animation:v11pop .5s cubic-bezier(.2,.75,.2,1);white-space:nowrap}
#vpop .vp.gold{background:linear-gradient(180deg,#e9c46a,#b8872b);color:#1b1306;border-color:#f6dc92}
#vpop .vp.pb{background:linear-gradient(180deg,#f3d27a,#c2902f);color:#1b1306;border-color:#fff1bf;font-size:17px;box-shadow:0 0 0 2px rgba(246,220,146,.35),0 10px 26px rgba(0,0,0,.45)}
#vpop .vp small{display:block;font:600 11px/1.2 Manrope,system-ui,sans-serif;letter-spacing:.04em;text-transform:none;margin-top:3px;opacity:.85}
@keyframes v11pop{0%{transform:translateY(8px) scale(.9)}45%{transform:translateY(0) scale(1.05)}100%{transform:none}}
@media (prefers-reduced-motion:reduce){#vpop .vp{animation:none}}
#hub b.nm{font-size:15px!important;line-height:1.05!important;letter-spacing:0!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;display:block}
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
 const mine=p=>p&&!p.ai&&(!S.online||p.key===NET.myId);
 const _vc=visitCall;visitCall=function(gained,h,who){const r=_vc.apply(this,arguments);safe(()=>{
   if(!S||S.done||S.bull)return;const me=S.p[who==null?S.cur:who];if(!mine(me)||gained>=180)return;
   S.v11=S.v11||{ton:false,tre:false};const labs=(S.visit||[]).map(v=>v.label||'');const bust=(S.visit||[]).some(v=>v.bust);if(bust)return;
   const prev=save.pbVisit||0;const seasoned=(save.matches||0)>=3;
   if(!S.practice)save.pbVisit=Math.max(prev,gained);
   let left='';try{if(me.score>1&&me.score<=170&&route(me.score,3)&&S.visitStart>170)left=`${me.score} left, you're on a finish`;}catch(e){}
   const hadT=labs.some(l=>/^T/.test(l));
   if(!S.practice&&seasoned&&prev>=60&&gained>prev){if(hadT)S.v11.tre=true;pop('New best visit','pb',`${gained}, beats your ${prev}`);try{sfxLevel();}catch(e){}return;}
   if(gained>=140){if(hadT)S.v11.tre=true;pop('Ton-forty','gold',left);return;}
   if(gained>=100){if(hadT)S.v11.tre=true;pop(S.v11.ton?'Ton':'First ton','gold',left);S.v11.ton=true;return;}
   const tre=labs.filter(l=>/^T/.test(l));const firstT=tre.length&&!S.v11.tre;if(tre.length)S.v11.tre=true;if(firstT){pop('First treble','',left||tre.join(' · '));return;}
   if(tre.length>=2){pop('Two trebles','',left);return;}
   if(gained>=60){pop(gained>=80?'80 plus':'60 plus','',left);return;}
   if(left)pop('On a finish','',left);
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
 const LV={rookie:{n:'Rookie',off:-6,d:'Opponents a step below the pub field. Learn the throw.'},club:{n:'Club',off:0,d:'The field as written. Pub regulars play their usual.'},comp:{n:'Competitive',off:8,d:'Everyone brings their best night. For players already averaging 60+.'}};
 const D=()=>save.diff||null;window.TOPS_DIFF=LV;
 const placeOff=()=>{const d=D();return d&&d.place!=null?d.place:0;};
 const totalOff=()=>{const d=D();if(!d)return 0;return (LV[d.lv]||LV.club).off+placeOff();};
 window.topsDiffOffset=totalOff;
 // shift opponent averages in career (not practice, drills or the intro tutorial)
 const shift=v=>Math.max(25,Math.min(108,Math.round(v+totalOff())));
 const _no=nextOpponent;nextOpponent=function(){const n=_no.apply(this,arguments);try{if(n&&!n.intro&&n.oppAvg>0&&D()){n.oppAvg=shift(n.oppAvg);n._d=1;}}catch(e){}return n;};
 const _bm=beginMatch;beginMatch=function(opts){try{const c=career();const viaNext=c&&c.next&&c.next._d&&opts&&opts.oppName===c.next.oppName&&opts.oppAvg===c.next.oppAvg;if(opts&&opts.mode==='career'&&!opts.practice&&!opts.intro&&!opts.tcExh&&opts.oppAvg>0&&D()&&!viaNext){const o=totalOff();opts=Object.assign({},opts,{oppAvg:shift(opts.oppAvg),_diffOff:o});}}catch(e){}return _bm.call(this,opts);};
 // count career darts for placement
 const _em=endMatch;endMatch=function(){try{if(ui.mode==='career'&&!S.practice&&!S.drill&&D()){const me=S.p[0];const d=D();d.darts=(d.darts||0)+(me.darts||0);d.pts=(d.pts||0)+(me.pts||0);
   if(d.place==null&&d.darts>=120){const a=d.pts/d.darts*3;const c=career();const par=c?TIERS[c.tier].avg:45;d.place=Math.max(-6,Math.min(15,Math.round((a-par)*0.6)));d.placeAvg=+a.toFixed(1);d.placeNew=true;try{trackEv('diff_place',{avg:d.placeAvg,place:d.place,lv:d.lv});}catch(e){}}}}catch(e){}return _em.apply(this,arguments);};
 const pick=(done,again)=>{const cur=D()&&D().lv;showMsg({from:'Kev Mercer',lines:[again?'Change how hard it is? Your placement stays.':'Before you play: how hard do you want it? Rookie is a step below the pub, Club is the field as written, Competitive is for 60+ averages.','After 120 darts I\'ll tune the field to how you actually throw, and tell you when I do.'],replies:[['Rookie','rookie'],['Club','club'],['Competitive','comp']]},a=>{save.diff=Object.assign(D()||{darts:0,pts:0,place:null},{lv:LV[a]?a:'club'});try{const c=career();if(c)c.next=null;}catch(e){}try{persist();trackEv('diff_pick',{lv:save.diff.lv,again:!!again});}catch(e){}done&&done();});};
 window.topsPickDiff=()=>pick(()=>{try{showHub();}catch(e){}},true);
 const placedMsg=done=>{const d=D();d.placeNew=false;try{const c=career();if(c)c.next=null;}catch(e){}try{persist();}catch(e){}const c=career();const par=c?TIERS[c.tier].avg:45;const up=d.place>0;
   showMsg({from:'Kev Mercer',lines:[`120 darts in. You're averaging ${d.placeAvg} against a ${par} room.`,d.place===0?'That\'s right where the field is. No change.':up?`So the field gets ${d.place} points tougher from tonight. No point beating mugs.`:`So I've eased the field by ${-d.place}. Get the throw right, then we push.`,`You're on ${(LV[d.lv]||LV.club).n}. Change it any time from the hub.`],replies:[['Sweet','ok']]},done);};
 const _pn=playNext;playNext=function(){const args=arguments,self=this;try{const c=career();if(c&&!c.run&&c.stage!=='intro'){if(!D()){return pick(()=>_pn.apply(self,args));}if(D().placeNew)return placedMsg(()=>_pn.apply(self,args));}}catch(e){}return _pn.apply(self,args);};
 // a small difficulty chip on the career hub, tap to change
 setInterval(()=>{try{const d=D();const h=document.querySelector('#hub:not([hidden]) .hx-head');if(!d||!h||h.querySelector('.v11diff'))return;const b=document.createElement('button');b.type='button';b.className='v11diff';b.textContent=(LV[d.lv]||LV.club).n+(d.place?` ${d.place>0?'+':''}${d.place}`:'');b.onclick=e=>{e.stopPropagation();window.topsPickDiff();};const bk=h.querySelector('.bank');h.insertBefore(b,bk||null);}catch(e){}},1500);
})();
</script>
<style>.v11diff{margin:0 8px 0 auto;font:700 11px Manrope,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:6px 10px;border-radius:999px;border:1px solid rgba(214,178,94,.5);background:rgba(14,16,20,.6);color:#e9d9a8;cursor:pointer}</style>
<script>
// ===== v1.56 versioned cloud saves: an older device can never overwrite newer progress =====
(function(){if(typeof cloudPush!=='function'||typeof NET==='undefined')return;
 let DEV='';try{DEV=localStorage.getItem('tops-dev')||'';if(!DEV){DEV='d'+Math.random().toString(36).slice(2,10);localStorage.setItem('tops-dev',DEV);}}catch(e){DEV='d'+Math.random().toString(36).slice(2,10);}
 const _ps=persist;persist=function(){try{save.sv=(save.sv||0)+1;save.dev=DEV;}catch(e){}return _ps.apply(this,arguments);};
 const busy=()=>typeof S!=='undefined'&&S&&!S.done;
 const adopt=(cloud,why)=>{if(!cloud)return;if(busy()){NET.pendCloud=cloud;return;}NET.pendCloud=null;const keep={authSeen:true,cloudUser:save.cloudUser};save=Object.assign({},cloud,keep);save.dev=DEV;try{localStorage.setItem('doubleout2',JSON.stringify(save));}catch(e){}
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
