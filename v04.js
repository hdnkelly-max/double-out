<script>
/* ===== v0.4: Settle removed, ability cards in every online match, legendary cards, card art, tournament caller ===== */
(function(){
// --- 1. Settle is gone (Hayden, 10 Nov) ---
breatheStart=function(){};settle=function(){};
// --- 2. Ability cards are standard in multiplayer (host can switch them off). Without Pub rules they run "dry": no drink cards, no sips ---
CARDS.push(
 {id:'invasion',n:'Pitch Invasion',ty:'off',r:'L',live:1,ico:'🏃',fx:'Their whole next visit: sway doubles, the perfect window shrinks 40% and their heart rate jumps 30.',fl:'Streaker on the oche!'},
 {id:'nine',n:'Nine-Darter Form',ty:'self',r:'L',ico:'💎',fx:'Your next visit: no sway, double the perfect window, heart rate 60.',fl:'A touch of greatness.'});
CARDS.forEach(c=>{CARD[c.id]=c;});
function abilOn(){const b=document.querySelector('#mpAbil [aria-pressed="true"]');return !b||b.dataset.v!=='0';}
const DRY={low:false,sips:[],tre:[],bust:false,t180:false,bets:false,water:false,abil:true,dry:true};
const _pc=pubCfg;pubCfg=function(){const base=_pc.apply(this,arguments);const ab=abilOn();if(!base)return ab?Object.assign({},DRY):null;base.abil=ab;return base;};
const _pt=pubText;pubText=function(p){if(p&&p.dry)return 'Ability cards on';return _pt.apply(this,arguments)+(p&&p.abil?'. Ability cards on':'');};
cardsOn=function(){const c=S&&S.pub&&S.pub.cfg;if(!c)return false;return c.abil!==undefined?!!c.abil:!!c.bets;};
const dry=()=>!!(S&&S.pub&&S.pub.cfg&&S.pub.cfg.dry);
cardDeal=function(round){const C=S.pub.cards;const rk=cardRank();const lvl=(S.pub.p[0]||{}).lvl||0;let seed=betHash((NET.room||'x')+':'+round+':'+(NET.myId||'me'));const rnd=()=>{seed=(seed*1103515245+12345)>>>0;return (seed>>>8)/16777216;};
 const pool=CARDS.filter(c=>!(round===0&&(c.r==='R'||c.r==='L')&&c.ty==='off')&&!(dry()&&(c.drink||c.id==='swap')));
 const w=c=>{let x=RAR_W[c.r];if(c.r==='R')x*=1+rk;if(c.r==='L')x*=.5;if(c.ty==='off')x*=1+.15*rk;if(rk===0&&(c.ty==='self'||c.ty==='def'))x*=1.15;if((c.id==='water'||c.id==='dd')&&lvl>=4)x*=2;return x;};
 const pick=[];for(let k=0;k<3;k++){const opts=pool.filter(c=>!pick.includes(c));const tot=opts.reduce((a,c)=>a+w(c),0);let r=rnd()*tot;for(const c of opts){r-=w(c);if(r<=0){pick.push(c);break;}}if(pick.length<=k)pick.push(opts[0]);}return pick;};
const _ps=pubSend;pubSend=function(){if(dry())return;return _ps.apply(this,arguments);};
// legendary effects (defences inside cardApply still run first)
const _ca=cardApply;cardApply=function(m,localOnly){const C=S&&S.pub&&S.pub.cards;const before=C?C.armed.slice().join(','):'';const r=_ca.apply(this,arguments);
 try{if(m&&m.id==='invasion'&&C&&C.armed.join(',')===before&&S.cur===0&&!S.done){S.fx.push({id:'invasion',until:'visit',mods:{A:2,P:.6},from:m.from});S.hr=Math.min(178,(S.hr||72)+30);cardFxSync();}}catch(e){}return r;};
const _cs=cardSelf;cardSelf=function(id){const r=_cs.apply(this,arguments);try{if(id==='nine'){S.fx.push({id,until:'visit',mods:{A:0,tr:0,P:2,ice:1},from:NET.myId,armedFor:'next'});S.hr=60;}}catch(e){}return r;};
// lobby switch, outside Pub rules
(function lobby(){const opts=$('mpOpts');if(!opts||$('mpAbil'))return;const pub=opts.querySelector('.pub-sec');const f=document.createElement('div');f.className='field abil-sec';
 f.innerHTML='<span class="pub-sh"><b>Ability cards</b><small>Draft cards that mess with your mates or help you. Common to Legendary.</small></span><div class="seg" id="mpAbil"><button type="button" data-v="1" aria-pressed="true">On</button><button type="button" data-v="0" aria-pressed="false">Off</button></div>';
 if(pub)pub.parentNode.insertBefore(f,pub);else opts.appendChild(f);
 f.querySelectorAll('#mpAbil button').forEach(b=>b.onclick=()=>{f.querySelectorAll('#mpAbil button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));try{renderLobby();}catch(e){}});
 const bt=document.querySelector('#pubTg [data-k="bets"]');if(bt)bt.textContent='Secret bet rounds';})();
// card art: swap emoji for ChatGPT art when the file exists
function art(id){return `assets/ui/card_${id}.webp`;}
function artify(root){if(!root)return;root.querySelectorAll('.cd-card,.ct-card').forEach(b=>{const i=+b.dataset.i;let id=null;if(b.classList.contains('cd-card')){const C=S.pub.cards;id=C.draft&&C.draft.opts[i]&&C.draft.opts[i].id;}else{id=S.pub.cards.hand[i];}
  if(!id)return;const sp=b.querySelector('.cd-ico')||b.querySelector('span');if(!sp||sp.querySelector('img'))return;const em=sp.textContent;sp.innerHTML=`<img class="card-art" src="${art(id)}" alt="" onerror="this.replaceWith(document.createTextNode('${em}'))">`;});}
const _cds=cardDraftShow;cardDraftShow=function(){const r=_cds.apply(this,arguments);try{artify($('cardDraft'));}catch(e){}return r;};
const _ct=cardTray;cardTray=function(){const r=_ct.apply(this,arguments);try{artify($('cardTray'));}catch(e){}return r;};
// --- 3. Tournament caller ---
function voice(){const vs=speechSynthesis.getVoices();return vs.find(v=>/en-GB/i.test(v.lang)&&/male|daniel|george|arthur/i.test(v.name)&&!/female/i.test(v.name))||vs.find(v=>/en-GB/i.test(v.lang)&&!/female/i.test(v.name))||vs.find(v=>/en-(AU|NZ)/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang));}
function speak(parts){if(!AU.caller||!AU.on||!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const v=voice();parts.forEach(p=>{const u=new SpeechSynthesisUtterance(p.t);u.rate=p.r||.95;u.pitch=p.p||.8;u.volume=1;if(v)u.voice=v;speechSynthesis.speak(u);});}catch(e){}}
const CLIP={};let clipsLoading=false;
function clipLoad(){if(clipsLoading||!AU.ctx)return;clipsLoading=true;const names=['s180','gsm','bust','gameon'];for(let i=1;i<=13;i++)names.push('gl'+i);for(let n=0;n<180;n++)names.push('s'+n);for(let n=2;n<=170;n++)names.push('r'+n);
 let i=0;const next=()=>{if(i>=names.length)return;const n=names[i++];fetch('assets/voice/'+n+'.mp3').then(r=>r.ok?r.arrayBuffer():null).then(b=>b?AU.ctx.decodeAudioData(b):null).then(buf=>{if(buf)CLIP[n]=buf;}).catch(()=>{}).finally(next);};for(let k=0;k<4;k++)next();}
let clipSrc=null;
function clip(name,vol){if(!AU.caller||!AU.on||!AU.ctx)return false;clipLoad();const b=CLIP[name];if(!b)return false;try{if(clipSrc)clipSrc.stop();}catch(e){}try{speechSynthesis.cancel();}catch(e){}const s=AU.ctx.createBufferSource();s.buffer=b;const g=AU.ctx.createGain();g.gain.value=vol||1;s.connect(g);g.connect(AU.master||AU.ctx.destination);s.start();clipSrc=s;return true;}
window.TOPS_clipLoad=clipLoad;
function crowd(k){try{V.cheer&&V.cheer(k);}catch(e){}}
const _cv=callVisit;callVisit=function(total,ctx){const st=S.tier.caller;const w=S.p[S.cur];
 if(ctx==='gameshot'){const need=Math.ceil(S.bestOf/2);const match=w.legs>=need;crowd(1);if(clip(match?'gsm':'gl'+legsPlayed()))return;speak(match?[{t:'Game shot!',r:.85,p:.75},{t:'And the MATCH!',r:.8,p:.95}]:[{t:'Game shot,',r:.88,p:.78},{t:`and the ${['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth'][legsPlayed()-1]||''} leg!`,r:.9,p:.85}]);return;}
 if(ctx==='bust'){if(clip('bust'))return;speak([{t:'No score.',r:.9,p:.75}]);return;}
 if(total===180){crowd(1);if(clip('s180'))return;speak([{t:'One hundred',r:.8,p:.8},{t:'and',r:.8,p:.8},{t:'EIGHTYYYYY!',r:.55,p:1.15}]);return;}
 if(total>=140){crowd(.6);if(clip('s'+total))return;speak([{t:words(total)+'!',r:.82,p:.9}]);return;}
 if(total>=100){if(clip('s'+total))return;speak([{t:words(total),r:.9,p:.82}]);return;}
 if(clip('s'+total,.85))return;return _cv.apply(this,arguments);};
// "Hayden, you require 81" before your visit when you're on a finish
let lastCall='';
function requireTick(){if(!S||S.done||S.practice||!AU.caller)return;const p=S.p[S.cur];if(!p||S.visit&&S.visit.length)return;const f=window.TOPS_finishable;const key=S.cur+':'+p.score+':'+legsPlayed();if(key===lastCall)return;
 if(f&&f(p.score)&&S.cur===0&&!p.ai){lastCall=key;if(clip('r'+p.score))return;speak([{t:`${String(p.name||'You').split(' ')[0]},`,r:.95,p:.8},{t:`you require ${words(p.score)}.`,r:.92,p:.78}]);}else lastCall=key;}
setInterval(requireTick,400);
})();
</script>
<style id="v04-css">
#btnSettle,.hr .settle{display:none!important}
.card-art{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 6px 10px rgba(0,0,0,.55))}
.cd-card .cd-ico{width:72px;height:72px;display:grid;place-items:center;margin:0 auto 4px}
.ct-card>span{width:34px;height:34px;display:grid;place-items:center}
.cd-card.r-L{border-color:#C49A52!important;box-shadow:0 0 0 1px rgba(196,154,82,.5),0 0 24px rgba(196,154,82,.25)!important;background:radial-gradient(ellipse at 50% 0%,rgba(196,154,82,.18),transparent 60%),linear-gradient(155deg,#263335,#192426 75%)!important}
.abil-sec .pub-sh b{color:#C6F36B}
</style>
<style id="v04-seg">#friends .seg button[aria-pressed="true"],#mpOpts .seg button[aria-pressed="true"]{color:#10191A!important}</style>
