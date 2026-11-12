<script>
/* ===== v0.7: atmosphere. Crowd reacts to you, walk-on music, clip of big moments ===== */
(function(){
// --- crowd reactions ---
function cheer(k){try{V.cheer&&V.cheer(k);}catch(e){}}
function groan(){try{if(!AU.ctx||!AU.on)return;const c=AU.ctx,t=c.currentTime;const s=c.createBufferSource();s.buffer=nbBuf(c,1.2);const f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(260,t+1.1);const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.15);g.gain.exponentialRampToValueAtTime(.001,t+1.15);s.connect(f);f.connect(g);g.connect(AU.master||c.destination);s.start(t);s.stop(t+1.2);}catch(e){}}
function claps(n){try{if(!AU.ctx||!AU.on)return;for(let i=0;i<n;i++){const d=i<2?i*.42:.84+(i-2)*.21;noiseBurst({dur:.04,freq:1400,q:.8,gain:.12,delay:d});noiseBurst({dur:.04,freq:2600,q:.8,gain:.07,delay:d+.01});}}catch(e){}}
const _ad=addAdrenaline;addAdrenaline=function(h,dartNo){const r=_ad.apply(this,arguments);try{if(S&&S.cur===0&&S.t20run===2)cheer(.55);}catch(e){}return r;};
const _cv=callVisit;callVisit=function(total,ctx){try{if(S&&S.cur===0){if(ctx==='bust')groan();else if(total<20&&ctx!=='gameshot')groan();}}catch(e){}return _cv.apply(this,arguments);};
let mdKey='';setInterval(()=>{try{if(!S||S.done||S.cur!==0||S.p[0].ai)return;const me=S.p[0];const need=Math.ceil(S.bestOf/2);const f=window.TOPS_finishable;
 if(me.legs===need-1&&f&&f(me.score)&&me.score<=60&&(!S.visit||!S.visit.length)){const k=me.score+':'+me.legs;if(k!==mdKey){mdKey=k;claps(8);}}
 // hush while you pull
 if(AU.crowdGain&&AU.ctx&&S.pulling)AU.crowdGain.gain.setTargetAtTime(.01,AU.ctx.currentTime,.12);}catch(e){}},300);
// --- walk-on music: short synth stingers, picked in the Player tab ---
const WALK=[{id:'off',n:'None'},{id:'rock',n:'Pub Rock',bpm:132,bass:[40,40,43,45],lead:[64,67,69,67]},{id:'stadium',n:'Stadium',bpm:96,bass:[36,36,41,43],lead:[60,64,67,72]},{id:'club',n:'Club Bass',bpm:124,bass:[33,33,36,31],lead:[69,72,74,72]},{id:'anthem',n:'Anthem',bpm:110,bass:[38,43,45,41],lead:[62,66,69,74]},{id:'leerap',n:"Rap",file:'assets/voice/walk_lee.mp3'},{id:'energy',n:"Walk-On Energy",file:'assets/voice/walk_energy.mp3'},{id:'lounge',n:"Late-night Lounge",file:'assets/voice/walk_lounge.mp3'}];
function hz(m){return 440*Math.pow(2,(m-69)/12);}
let walkBuf={},walkGet={};
/* ENG-11: the equipped file track is fetched and decoded in the hub, so the walk-on starts it at once (it used to be fetched at the walk-on, 0.5-2 s late on a phone) */
function walkLoad(id){const w=WALK.find(x=>x.id===id);if(!w||!w.file)return Promise.resolve(null);if(walkBuf[id])return Promise.resolve(walkBuf[id]);if(walkGet[id])return walkGet[id];
 const dec=b=>{if(AU.ctx)return AU.ctx.decodeAudioData(b);const O=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!O)return Promise.reject(0);/* an AudioBuffer plays in any context */return new O(2,1,48000).decodeAudioData(b);};
 const p=walkGet[id]=fetch(w.file).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer();}).then(b=>dec(b.slice(0)).catch(()=>AU.ctx?AU.ctx.decodeAudioData(b):Promise.reject(0))).then(buf=>{walkBuf[id]=buf;return buf;}).finally(()=>{delete walkGet[id];});return p;}
function walkPrefetch(){try{const id=save&&save.walkon;if(id&&id!=='off'&&!walkBuf[id])walkLoad(id).catch(()=>{});}catch(e){}}let walkTok=0;function stopWalk(){walkTok++;try{const o=window.__walkOut;if(o&&AU.ctx){o.gain.setTargetAtTime(0,AU.ctx.currentTime,.25);}window.__walkOut=null;}catch(e){}}function playWalk(id){try{stopWalk();const w=WALK.find(x=>x.id===id);if(!w||!AU.ctx||!AU.on)return;try{audioWake();}catch(e){}if(w.file){const go=buf=>{const s=AU.ctx.createBufferSource(),g=AU.ctx.createGain();s.buffer=buf;g.gain.value=.9;s.connect(g);g.connect(AU.master||AU.ctx.destination);s.start();window.__walkOut=g;s.onended=()=>{if(window.__walkOut===g)window.__walkOut=null;};};if(walkBuf[id])go(walkBuf[id]);else{const tok=walkTok,t0=performance.now();walkLoad(id).then(buf=>{/* late: start when it lands, unless the walk-on was stopped or replaced meanwhile, or the walk-on (2.8 s) is nearly over: then this match has none and the next one has it cached */if(buf&&walkTok===tok&&performance.now()-t0<2500)go(buf);}).catch(()=>{});}return;}if(!w.bpm)return;const c=AU.ctx;const t0=c.currentTime+.05;const b=60/w.bpm;const out=c.createGain();out.gain.value=.5;out.connect(AU.master||c.destination);window.__walkOut=out;
 for(let bar=0;bar<4;bar++){for(let s=0;s<4;s++){const t=t0+(bar*4+s)*b;
  const o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.value=hz(w.bass[bar]);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+b*.9);o.connect(g);g.connect(out);o.start(t);o.stop(t+b);
  noiseBurst({dur:s%2?.12:.05,freq:s%2?1800:120,q:.7,gain:s%2?.12:.25,type:s%2?'bandpass':'lowpass',delay:t-c.currentTime});
  if(s===0||s===2){const l=c.createOscillator(),lg=c.createGain();l.type='square';l.frequency.value=hz(w.lead[(bar+s/2)%4]);lg.gain.setValueAtTime(.0001,t);lg.gain.exponentialRampToValueAtTime(.06,t+.02);lg.gain.exponentialRampToValueAtTime(.0001,t+b*1.8);l.connect(lg);lg.connect(out);l.start(t);l.stop(t+b*2);}}}
 out.gain.setValueAtTime(.5,t0+14*b);out.gain.linearRampToValueAtTime(0,t0+16*b);setTimeout(()=>{if(window.__walkOut===out)window.__walkOut=null;},(16*b+.3)*1000);}catch(e){}}
window.TOPS_walk={WALK,playWalk,stopWalk,walkLoad,ready:id=>!!walkBuf[id]};
{const _sh=showHub;showHub=function(){const r=_sh.apply(this,arguments);setTimeout(walkPrefetch,800);/* after the hub has drawn */return r;};}
const _ic=introCard;introCard=function(p0,p1,opts,t){const r=_ic.apply(this,arguments);try{if(opts&&opts.mode==='career'&&!opts.practice&&(opts.tier|0)>=1&&save.walkon&&save.walkon!=='off')playWalk(save.walkon);}catch(e){}return r;};
// picker in the Player tab
const _sp=showPlayer;showPlayer=function(){const r=_sp.apply(this,arguments);try{const host=$('plPerks');if(!host)return r;let sec=$('walkSec');if(!sec){sec=document.createElement('section');sec.id='walkSec';sec.className='walk-sec';host.parentNode.insertBefore(sec,host);}
 const cur=save.walkon||'off';sec.innerHTML=`<div class="c3x-sh"><b>Walk-on music</b><span>Career Club and up, and online when you throw first</span></div><div class="walk-row">${WALK.map(w=>`<button type="button" class="walk-b${w.id===cur?' on':''}" data-id="${w.id}" aria-pressed="${w.id===cur}">${w.n}</button>`).join('')}</div>`;
 sec.querySelectorAll('.walk-b').forEach(b=>b.onclick=()=>{save.walkon=b.dataset.id;persist();try{audioInit&&audioInit();}catch(e){}playWalk(b.dataset.id);showPlayer(true);});}catch(e){}return r;};
})();
</script>
<style id="v07-css">
.walk-sec{margin:18px 0}.walk-row{display:flex;flex-wrap:wrap;gap:8px}.walk-b{padding:10px 14px;min-height:44px;border-radius:999px;border:1px solid rgba(237,236,229,.18);background:#192426;color:#EDECE5;font:700 13px Manrope,sans-serif}.walk-b.on{background:#C6F36B;color:#10191A;border-color:#C6F36B}
</style>
