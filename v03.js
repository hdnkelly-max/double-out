<script>
/* ===== v0.3: pressure moments + multiplayer live view (separate file so it merges cleanly) ===== */
(function(){
const BOGEY=[169,168,166,165,163,162,159];
function finishable(s){return s>1&&s<=170&&BOGEY.indexOf(s)<0;}
window.TOPS_finishable=finishable;

// --- 1. Treble streaks: one T20 gets the heart going, two in a row and it's out of control ---
addAdrenaline=function(h,dartNo){const rarity=[1.6,1.3,1,.7,.5,.35,.3][ui.tier||0]*(1+SK().chase);
 const big=h.label==='T20'||(h.m===3&&h.n>=19);
 if(dartNo===1)S.t20run=0;
 if(big){S.t20run=(S.t20run||0)+1;
  if(S.t20run===1){S.adren+=.55*rarity;S.hr=Math.min(175,(S.hr||72)+6*rarity);}
  else{S.adren+=1.4*rarity;S.hr=Math.min(178,(S.hr||72)+16*rarity);S.hotMoment={t:performance.now(),k:'180 on'};}}
 else{S.t20run=0;if(h.m===3)S.adren+=.4*rarity;else S.adren*=.5;}};

// --- 2. Finishing pressure depends on the other player ---
function surgeNow(){const sg=S&&S.surge;if(!sg)return 0;const k=1-(performance.now()-sg.t)/30000;if(k<=0){S.surge=null;return 0;}return sg.amt*k;}
situational=function(){const me=S.p[S.cur],op=oppOf(S.cur);const sk=SK();let n=S.tier.press*(1+sk.press);if(S.legFirstVisit&&sk.warm)n=0;
 const tgt=scoreAt(S.aim.x,S.aim.y);const meOn=finishable(me.score),opOn=!!(op&&finishable(op.score));
 if(meOn){const close=me.score<=40?1:me.score<=100?.6:.35;let f=(tgt.dbl||me.score<=40)?close:close*.5;
  f*=opOn?(op.score<=40?1.6:1.25):.55; // nobody breathing down your neck = calmer; both on = squeaky bum time
  n+=f*1.2*[.6,.75,.85,1,1,1.05,1.1][Math.min(6,ui.tier|0)]+(tgt.dbl?sk.fin:0);}
 else if(opOn)n+=op.score<=40?.8:.4;
 const need=Math.ceil(S.bestOf/2);if(me.legs===need-1||op.legs===need-1)n+=1;if(S.decider)n+=.5;
 if(S.cur===0)n+=surgeNow();
 return n;};
const _cause=nerveCause;nerveCause=function(){if(!S)return '';const me=S.p[S.cur],op=oppOf(S.cur);
 if(S.hotMoment&&performance.now()-S.hotMoment.t<9000&&S.t20run>=2)return 'T20, T20… 180 on';
 if(S.cur===0&&S.surge&&surgeNow()>.3)return S.surge.why;
 if(finishable(me.score)&&op&&finishable(op.score)&&me.score<=100)return 'You’re both on a finish';
 return _cause();};

// opponent visits that drag you into a fight: watch every player's score
let prev=null;
function watchScores(){if(!S||!S.p||S.done||S.practice){prev=null;return;}const now=performance.now();
 if(!prev||prev.length!==S.p.length||prev.leg!==legsPlayedSafe()){prev=S.p.map(p=>p.score);prev.leg=legsPlayedSafe();return;}
 const me=S.p[0];
 for(let i=1;i<S.p.length;i++){const was=prev[i],is=S.p[i].score;if(is===was)continue;const drop=was-is;
  if(finishable(me.score)&&drop>0){
   const into=!finishable(was)&&finishable(is);const big=drop>=100;
   if(into||big||(is<=40&&was>40)){const amt=(drop>=180?1.4:big?1.0:.7)*(1+S.tier.press*.5);
    S.surge={t:now,amt,why:drop>=180?`${S.p[i].disp||S.p[i].name} hit 180 · now on ${is}`:`${S.p[i].disp||S.p[i].name} is on ${is}`};
    S.hr=Math.min(178,(S.hr||72)+(drop>=180?18:10));}}
  prev[i]=is;}
 prev[0]=me.score;}
function legsPlayedSafe(){try{return legsPlayed();}catch(e){return 0;}}

// --- 3. Multiplayer: send my live aim + heart rate, show theirs ---
NET.live=NET.live||{};let lastSend=0,lastHr=0;
function liveSend(now){if(!S||!S.online||S.done||!NET.chan)return;const mine=S.cur===0;
 if(mine&&now-lastSend>100){lastSend=now;lastHr=now;const ax=S.aim.x+(S.sway?S.sway.x:0),ay=S.aim.y+(S.sway?S.sway.y:0);
  try{NET.chan.send({type:'broadcast',event:'tops',payload:{t:'live',from:NET.myId,x:+ax.toFixed(1),y:+ay.toFixed(1),sg:+(S.sigma||0).toFixed(2),pl:S.pulling?1:0,pf:S.inWin?1:0,hr:Math.round(S.hr||72),cs:nerveCause()}});}catch(e){}}
 else if(!mine&&now-lastHr>1000){lastHr=now;try{NET.chan.send({type:'broadcast',event:'tops',payload:{t:'live',from:NET.myId,hr:Math.round(S.hr||72),idle:1}});}catch(e){}}}
const _recv=netRecv;netRecv=function(m){if(m&&m.t==='live'){if(m.from!==NET.myId){const o=NET.live[m.from]||{};Object.assign(o,m,{at:performance.now()});if(m.idle){delete o.x;}NET.live[m.from]=o;}return;}return _recv(m);};
function remoteLive(){if(!S||!S.online||S.done||S.cur===0)return null;const p=S.p[S.cur];const l=p&&p.key&&NET.live[p.key];if(!l||performance.now()-l.at>3000)return null;return {p,l};}
window.TOPS_remoteRet=function(){const rl=remoteLive();if(!rl||rl.l.x==null)return null;return {x:rl.l.x,y:rl.l.y,mode:rl.l.pl?'pull':'aim',sigma:rl.l.sg,perfect:!!rl.l.pf,over:false,op:.8};};
function oppHrBadges(){if(!S||!S.online)return;for(let i=1;i<S.p.length&&i<2;i++){const p=S.p[i];const l=p&&p.key&&NET.live[p.key];const el=$('sub'+i);let b=document.getElementById('ohr'+i);const host=$('avg'+i);if(!host)continue;
  if(!b){b=document.createElement('span');b.id='ohr'+i;b.className='ohr';host.appendChild(b);}
  b.textContent=l&&l.hr?`♥ ${l.hr}`:'';b.classList.toggle('hot',!!(l&&l.hr>105));}}

// hook the frame: runs after the game's own HUD + reticle update
const _frame=V.frame;V.frame=function(now,st){const r=_frame.apply(this,arguments);try{watchScores();liveSend(now);
 const rl=remoteLive();
 if(S&&S.online&&!S.done){const hrEl=$('hr');if(rl&&rl.l.hr){$('bpm').textContent=rl.l.hr;$('hrNote').textContent=`${rl.p.disp||rl.p.name}${rl.l.cs&&rl.l.cs!=='Settled'?' · '+rl.l.cs:''}`;hrEl&&hrEl.classList.add('opp');hrEl&&hrEl.classList.toggle('hot',rl.l.hr>105);}else hrEl&&hrEl.classList.remove('opp');
  if(!window.__ohrT||now-window.__ohrT>500){window.__ohrT=now;oppHrBadges();}}}catch(e){window.__v3err=String(e);}window.__v3n=(window.__v3n||0)+1;return r;};
})();
</script>
<style id="v03-css">
body.lk-match .hr.opp{border-color:rgba(201,85,74,.55)!important}
body.lk-match .hr.opp span::before{content:"THEIR ";}
body.lk-match .ohr{margin-left:6px;font:700 11px Manrope,sans-serif;color:#9AA7A5}
body.lk-match .ohr.hot{color:#E07A6E}
</style>

<script>
/* ===== v0.3: sway shapes. Every dart has its own sway pattern; same size and speed, so none is easier, just different ===== */
(function(){
const R=(a,x,y)=>({x:x*Math.cos(a)-y*Math.sin(a),y:x*Math.sin(a)+y*Math.cos(a)});
const SW=[
 {id:'eight',n:'Figure 8',line:'The classic. Crosses the middle twice a loop.',f:t=>({x:Math.sin(t),y:.55*Math.sin(2*t)})},
 {id:'pend',n:'Pendulum',line:'Wide side to side, barely moves up and down. Kind to trebles, hard on the bed beside it.',f:t=>({x:Math.sin(t),y:.16*Math.sin(2*t)})},
 {id:'pump',n:'Pump',line:'Up and down, stays in its lane. Great for the 20 bed, tricky on trebles and doubles.',f:t=>({x:.16*Math.sin(2*t),y:Math.sin(t)})},
 {id:'lazy',n:'Lazy loop',line:'A tilted figure 8. Hard to read at first, very steady once it clicks.',f:t=>R(.7,Math.sin(t),.55*Math.sin(2*t))}];
// equalise: every shape gets the same average distance from the aim point as the classic figure 8
(function(){const N=720;const rms=sh=>{let s=0;for(let i=0;i<N;i++){const p=sh.f(i/N*2*Math.PI);s+=p.x*p.x+p.y*p.y;}return Math.sqrt(s/N);};const base=rms(SW[0]);SW.forEach(sh=>sh.k=base/rms(sh));})();
const BY_BARREL={assassin:'eight',neutron:'pump',corexl:'eight',supergrip:'pend',razor:'pump',vapor8:'pend',zen:'lazy',mvg:'pump',asp:'pend',ga:'eight',littler:'lazy',power:'lazy',mp:'eight'};
function swayOf(id){return SW.find(s=>s.id===id)||SW[0];}
function curSway(){if(S&&S.online)return swayOf(save.mpSway||'eight');const b=S?S.barrel:barrel();return swayOf(BY_BARREL[b&&b.id]||'eight');}
window.TOPS_SW={SW,BY_BARREL,swayOf,curSway};
driftAt=function(now,p){const dt=TH.last?Math.min(.1,(now-TH.last)/1000):0;TH.last=now;TH.ph+=dt*p.w;const th=TH.ph;const sh=curSway();
 // v0.93 (Lee): same shape, never the exact same loop twice. Slow smooth variance in speed, size, tilt and centre
 if(TH.sd==null)TH.sd=[0,1,2,3,4,5].map(()=>Math.random()*6.28);const s=TH.sd;
 const thw=th+.28*Math.sin(.53*th+s[0])+.12*Math.sin(1.31*th+s[1]);const q=sh.f(thw);
 const ax=1+.13*Math.sin(.61*th+s[2])+.05*Math.sin(1.73*th+s[3]),ay=1+.13*Math.sin(.47*th+s[4])+.05*Math.sin(1.21*th+s[5]);const rot=.13*Math.sin(.29*th+s[1]);
 let qx=q.x*ax,qy=q.y*ay;const cr=Math.cos(rot),sr=Math.sin(rot);[qx,qy]=[qx*cr-qy*sr,qx*sr+qy*cr];
 let x=p.A*sh.k*(qx+.07*Math.sin(.23*th+s[3])),y=p.A*sh.k*(qy+.07*Math.sin(.19*th+s[4]));if(p.dl){x+=p.dl*1.2*Math.sin(.37*th+1);y+=p.dl*.9*Math.sin(.29*th+2);}return {x,y};};
// little animated picture of a sway shape
function swaySvg(id,cls){const sh=swayOf(id);const N=96;let d='';for(let i=0;i<=N;i++){const p=sh.f(i/N*2*Math.PI);const x=50+p.x*sh.k*38,y=32+p.y*sh.k*38*.62;d+=(i?'L':'M')+x.toFixed(1)+' '+y.toFixed(1);}
 return `<svg class="swsvg ${cls||''}" viewBox="0 0 100 64" aria-label="${sh.n} sway"><circle cx="50" cy="32" r="3" class="sw-c"/><path d="${d}" class="sw-p"/><circle r="4.2" class="sw-dot"><animateMotion dur="2.6s" repeatCount="indefinite" path="${d}"/></circle></svg>`;}
window.TOPS_swaySvg=swaySvg;
// Store: show each barrel's sway shape
const _shop=showShop;showShop=function(){const r=_shop.apply(this,arguments);if(window.TOPS_SWAY_HIDDEN!==false)return r;try{const rows=[...document.querySelectorAll('#shopList .opt')];rows.forEach((el,i)=>{const b=BARRELS[i];if(!b||el.querySelector('.swtag'))return;const sh=swayOf(BY_BARREL[b.id]);const t=document.createElement('span');t.className='swtag';t.innerHTML=swaySvg(sh.id,'sm')+`<em>${sh.n}</em>`;const s=el.querySelector('.s');(s||el).appendChild(t);});
 const kb=$('kitBars');if(kb&&!kb.querySelector('.swkit')){const b=barrel();const sh=swayOf(BY_BARREL[b.id]);const d=document.createElement('div');d.className='kb swkit';d.innerHTML=`<span>Sway shape</span>${swaySvg(sh.id,'kit')}<small>${sh.n}</small>`;kb.appendChild(d);}}catch(e){}return r;};
// Multiplayer: choose your darts (sway shape) after your pro
const _pp=renderProPicker;renderProPicker=function(){const r=_pp.apply(this,arguments);try{const pros=$('mpPros');if(!pros)return r;const sec=pros.closest('section')||pros.parentNode;let host=$('mpSways');
 if(!host){const s2=document.createElement('section');s2.className='mp-sec';s2.innerHTML=`<h2 class="mp-h2">Choose your darts <small id="mpSwSel"></small></h2><p class="mp-note">Every set has the same accuracy. Each one sways its own way, and you only find out by throwing it.</p><div class="mp-sways" id="mpSways"></div>`;sec.parentNode.insertBefore(s2,sec.nextSibling);host=$('mpSways');}
 const cur=save.mpSway||'eight';const SETN={eight:'Set A',pend:'Set B',pump:'Set C',lazy:'Set D'};host.innerHTML=SW.map(s=>`<button type="button" class="mpsw ${s.id===cur?'on':''}" data-id="${s.id}" aria-pressed="${s.id===cur}"><span class="swq">?</span><b>${SETN[s.id]}</b><span>Throw them to learn how they move.</span></button>`).join('');
 [...host.children].forEach(b=>b.onclick=()=>{save.mpSway=b.dataset.id;persist();renderProPicker();try{mpTrack();}catch(e){}});const sel=$('mpSwSel');if(sel)sel.textContent='· '+({eight:'Set A',pend:'Set B',pump:'Set C',lazy:'Set D'})[cur];}catch(e){}return r;};
const _meta=mpMeta;mpMeta=function(){const m=_meta.apply(this,arguments);m.sway=save.mpSway||'eight';return m;};
})();
</script>
<style id="v03-sway">
.swsvg{display:block}.swsvg .sw-p{fill:none;stroke:#C6F36B;stroke-width:2.2;stroke-linecap:round;opacity:.55}.swsvg .sw-c{fill:none;stroke:#EDECE5;stroke-width:1.2;opacity:.6}.swsvg .sw-dot{fill:#C6F36B;filter:drop-shadow(0 0 3px rgba(198,243,107,.8))}
.swtag{display:flex;width:max-content;align-items:center;gap:6px;margin-top:6px;padding:2px 8px 2px 4px;border-radius:999px;background:rgba(16,25,26,.6);border:1px solid rgba(237,236,229,.12)}
.swtag .swsvg.sm{width:36px;height:23px}.swtag em{font:700 11px Manrope,sans-serif;font-style:normal;color:#C6F36B}
.swkit .swsvg.kit{width:72px;height:46px}
.mp-sways{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.mpsw{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;text-align:left;border-radius:12px;background:linear-gradient(155deg,#263335,#192426 75%);border:1px solid rgba(237,236,229,.1);color:#EDECE5;min-height:150px}
.mpsw.on{border-color:#C6F36B;box-shadow:0 0 0 1px rgba(198,243,107,.3)}
.mpsw .swsvg{width:100%;height:64px;background:radial-gradient(circle at 50% 50%,rgba(198,243,107,.08),transparent 70%);border-radius:8px}
.mpsw b{font:italic 800 20px/1 "Barlow Condensed",sans-serif;text-transform:uppercase}.mpsw span{font:500 12px/1.35 Manrope,sans-serif;color:#9AA7A5}
.mpsw .swq{display:grid;place-items:center;width:56px;height:36px;border-radius:8px;background:rgba(237,236,229,.06);font:800 20px 'Barlow Condensed',sans-serif;color:#C6F36B}
@media (prefers-reduced-motion:reduce){.swsvg .sw-dot animateMotion{display:none}}
</style>
