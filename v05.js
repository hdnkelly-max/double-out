<script>
/* ===== v0.5: perfect = tight, AI heart rate, audible heartbeat, 9 new cards ===== */
(function(){
// --- 1. A perfect release lands tight (Hayden: "the dopamine of doing it correctly"); window 15% smaller to hold averages ---
const _tp=throwParams;throwParams=function(){const tp=_tp.apply(this,arguments);tp.P*=.85;return tp;};
const _lf=landFrom;landFrom=function(lock,tp,dt){const perfect=Math.abs(dt)<=tp.P;if(!perfect){const ed=window.TOPS_EDGE!=null?window.TOPS_EDGE:6;if(ed>0&&tp.perfSig!=null&&Math.abs(dt)<tp.P+ed&&window.TOPS_ringR){const sg=TOPS_ringR(dt,tp)/1.794;return {x:lock.x+gauss()*sg*.95,y:lock.y+gauss()*sg*.85,e:Math.sign(dt)*(Math.abs(dt)-tp.P)};}return _lf.apply(this,arguments);}
 let k=1;try{if(S&&S.fx&&S.fx.some(f=>f.mods&&f.mods.tight))k*=.75;}catch(e){}const ps=tp.perfSig!=null?tp.perfSig:tp.s0*.6;const sg=ps*k; /* perfect-release scatter (mm): career throws carry the calibrated 2.8 mm (tp.perfSig, set in v09); other modes keep the old 0.6 x s0 */
 try{if(S&&S.aim&&Math.hypot(lock.x-S.aim.x,lock.y-S.aim.y)>14)S.lockedOff=performance.now();}catch(e){}
 /* every perfect dart lands inside the ring the player sees (radius 1.794 x scatter: 5 mm, just over the treble wires) */
 if(tp.perfSig==null)return {x:lock.x+gauss()*sg*.95,y:lock.y+gauss()*sg*.85,e:0};
 const RR=1.794*sg;let dx=0,dy=0;for(let i=0;i<12;i++){dx=gauss()*sg*.95;dy=gauss()*sg*.85;if(dx*dx+dy*dy<=RR*RR)break;if(i===11){const f=RR/Math.hypot(dx,dy);dx*=f;dy*=f;}}
 return {x:lock.x+dx,y:lock.y+dy,e:0};};
// the ring shown while pulling: inside the perfect window it snaps to the perfect-release ring; just outside it (a short
// band, TOPS_EDGE ms, default 6) it widens smoothly to the normal ring, so 0.1 ms outside the window isn't a cliff (ChatGPT 22:52)
const perfR=tp=>{let k=1;try{if(S&&S.fx&&S.fx.some(f=>f.mods&&f.mods.tight))k*=.75;}catch(e){}return 1.794*tp.perfSig*k;};
const EDGE=()=>window.TOPS_EDGE!=null?window.TOPS_EDGE:6;
const _rr=ringR;ringR=function(dt,tp){if(!tp||tp.perfSig==null)return _rr.apply(this,arguments);const a=Math.abs(dt),ed=EDGE();if(a<=tp.P)return perfR(tp);
 if(ed>0&&a<tp.P+ed){const rEnd=_rr.call(this,Math.sign(dt)*(tp.P+ed),tp),f=(a-tp.P)/ed;return perfR(tp)+(rEnd-perfR(tp))*f;}return _rr.apply(this,arguments);};
window.TOPS_ringR=ringR;
setInterval(()=>{if(S&&S.lockedOff&&performance.now()-S.lockedOff<300){const v=$('paVerdict');if(v&&/perfect/i.test(v.textContent)&&!/locked/i.test(v.textContent))v.textContent='Perfect · locked off target';}},60);
// --- 2. Career opponents show a heart rate (their choke already scales with it) ---
setInterval(()=>{if(!S||S.online||S.practice||!S.p||S.p.length<2)return;const p=S.p[1];const host=$('avg1');if(!host)return;let b=document.getElementById('ohr1');if(!b){b=document.createElement('span');b.id='ohr1';b.className='ohr';host.appendChild(b);}
 const raw=(S.aiPress&&S.aiPress.raw)||0;const tgt=70+Math.min(90,raw*20)+(S.cur===1&&S.aiPress&&S.aiPress.lvl?6:0);S.aiHr=(S.aiHr||70)+(tgt-(S.aiHr||70))*.25;b.textContent='♥ '+Math.round(S.aiHr);b.classList.toggle('hot',S.aiHr>105);},400);
// --- 3. Audible heartbeat on your turn: soft and slow when calm, loud and fast under pressure; crowd dips ---
sfxHeart=function(){};let nextBeat=0;
setInterval(()=>{try{if(!S||S.done||!AU.ctx||!AU.on||S.cur!==0||S.p[0].ai||S.mateTurn){return;}const now=performance.now();const hr=S.hr||72;if(now<nextBeat)return;nextBeat=now+60000/hr;
 const nv=Math.max(0,Math.min(1,(hr-75)/70));const g=.05+.45*nv;thump(55,.12,g);thump(50,.1,g*.7,.13);
 if(AU.crowdGain&&nv>.45){AU.crowdGain.gain.setTargetAtTime(.02,AU.ctx.currentTime,.15);}}catch(e){}},30);
// --- 4. Nine new ability cards ---
const NEW=[
 {id:'pyro',n:'Pyrotechnics',ty:'off',r:'U',live:1,ico:'🎆',fx:'Flames go up: reticle gone for a moment, heart rate +15, aim drifts 30% wider this visit.',fl:'Walk-on budget well spent.'},
 {id:'chalk',n:'Chalk Dust',ty:'off',r:'C',ico:'🌫️',fx:'Next dart: twice the hand tremor.',fl:'Achoo.'},
 {id:'stare',n:'The Stare',ty:'off',r:'U',ico:'👀',fx:'Next visit: heart rate +20, perfect window 25% smaller.',fl:'Don’t look at me. Look at the board.'},
 {id:'crowd',n:'Crowd Chant',ty:'off',r:'R',aud:1,ico:'📣',fx:'Whole next visit: aim drifts 50% faster, heart rate +25.',fl:'Who are ya? WHO ARE YA?'},
 {id:'eclipse',n:'Eclipse',ty:'off',r:'L',ico:'🌑',fx:'Next 2 darts: board fogged and no ring. Time it blind.',fl:'Lights out, sunshine.'},
 {id:'shades',n:'Sunglasses',ty:'def',r:'C',ico:'🕶️',fx:'Blocks the next Camera Flash, Pyrotechnics, Vape Cloud or Eclipse.',fl:'Too cool to care.'},
 {id:'zone',n:'In the Zone',ty:'self',r:'R',ico:'🎯',fx:'Next visit: perfect window 80% wider, sway 40% smaller.',fl:'Nothing but the treble.'},
 {id:'tungsten',n:'Lucky Tungsten',ty:'self',r:'U',ico:'🍀',fx:'Next visit: perfect releases land 25% tighter.',fl:'Blessed by the darts gods.'},
 {id:'crown',n:'The Crown',ty:'self',r:'L',ico:'👑',fx:'For 90 seconds: perfect window 40% wider and heart rate capped at 80.',fl:'Heavy is the head.'}];
NEW.forEach(c=>{if(!CARD[c.id]){CARDS.push(c);CARD[c.id]=c;}});
const SHADES=['flash','pyro','vape','eclipse'];
const _ca=cardApply;cardApply=function(m,localOnly){const C=S&&S.pub&&S.pub.cards;
 if(C&&m&&SHADES.includes(m.id)&&m.from!==NET.myId){const si=C.armed.indexOf('shades');if(si>=0){C.armed.splice(si,1);const a={cid:m.cid,res:'blocked',id:m.id,from:m.from,to:m.to,by:'shades'};if(!localOnly)netSend('cack',a);try{C.seen[m.cid]=1;cardAnnounce(a,true);}catch(e){}return;}}
 const before=C?C.armed.join(','):'';const r=_ca.apply(this,arguments);
 try{if(C&&C.armed.join(',')===before&&S.cur===0&&!S.done){const now=performance.now();const add=(mods,until,extra)=>S.fx.push(Object.assign({id:m.id,until,mods,from:m.from},extra||{}));
  if(m.id==='pyro'){cardFlash();add({},now+800,{hideRet:1});add({A:1.3},'visit');S.hr=Math.min(178,(S.hr||72)+15);}
  else if(m.id==='chalk')add({tr:2},'dart');
  else if(m.id==='stare'){add({P:.75},'visit');S.hr=Math.min(178,(S.hr||72)+20);}
  else if(m.id==='crowd'){add({w:1.5},'visit');S.hr=Math.min(178,(S.hr||72)+25);}
  else if(m.id==='eclipse')add({},'dart2',{fog:1,noMarker:1,left:2});
  cardFxSync();}}catch(e){}return r;};
const _cs=cardSelf;cardSelf=function(id){const r=_cs.apply(this,arguments);try{const add=(mods,until)=>S.fx.push({id,until,mods,from:NET.myId,armedFor:'next'});
 if(id==='zone')add({P:1.8,A:.6},'visit');else if(id==='tungsten')add({tight:1},'visit');else if(id==='crown'){add({P:1.4},performance.now()+90000);S.crownUntil=performance.now()+90000;}}catch(e){}return r;};
setInterval(()=>{if(S&&S.crownUntil&&performance.now()<S.crownUntil&&S.hr>80)S.hr=80;},200);
// Defence card arming: Sunglasses behaves like the other defences (armed face down)
})();
</script>
<script>
/* ===== v0.5: dart log (every human dart, signed-in players, Supabase tops_darts, own rows only) ===== */
(function(){const Q=[];let t=null;
function flush(){if(!Q.length||!window.NET||!NET.user||!NET.sb)return;const rows=Q.splice(0,Q.length);NET.sb.from('tops_darts').insert(rows).then(({error})=>{if(error)console.warn('dartlog',error.message);});}
const _lf=landFrom;landFrom=function(lock,tp,dt){const l=_lf.apply(this,arguments);try{if(S&&!S.done&&S.cur===0&&!S.p[0].ai&&window.NET&&NET.user){const h=scoreAt(l.x,l.y);const sh=window.TOPS_SW?TOPS_SW.curSway():null;
 Q.push({ver:window.TOPS_BUILD||'',mode:S.online?'online':(S.practice?'practice':(isRun&&isRun()?'run':ui.mode)),tier:ui.tier|0,opp:(S.p[1]&&S.p[1].name)||null,leg:(function(){try{return legsPlayed();}catch(e){return null;}})(),dart:S.dart,score_before:S.p[0].score,
  aim_x:+S.aim.x.toFixed(1),aim_y:+S.aim.y.toFixed(1),lock_x:+lock.x.toFixed(1),lock_y:+lock.y.toFixed(1),land_x:+l.x.toFixed(1),land_y:+l.y.toFixed(1),dt_ms:+dt.toFixed(1),perfect:Math.abs(dt)<=tp.P,ring_mm:+ringR(dt,tp).toFixed(1),s0:+tp.s0.toFixed(2),sway_mm:+tp.A.toFixed(1),window_ms:+tp.P.toFixed(1),
  hr:Math.round(S.hr||0),nerves:+(effNerves()||0).toFixed(2),barrel:S.barrel&&S.barrel.id,sway_shape:sh&&sh.id,cards:(S.fx||[]).map(f=>f.id).filter(Boolean),hit:h.label,pts:h.v|0});
 clearTimeout(t);if(Q.length>=3)flush();else t=setTimeout(flush,8000);}}catch(e){}return l;};
addEventListener('pagehide',flush);})();
</script>
