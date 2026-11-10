<script>
/* ===== v0.6: online reconnect. 60 s grace when a phone drops, and a state sync when it comes back ===== */
(function(){
const GRACE=60000;
netDropGrace=function(key){if(!S||S.done)return;const pl=S.p.find(p=>p.key===key);if(!pl||pl.left)return;if(NETDROP[key])return;
 try{pubBand('miss','CONNECTION DROPPED',`${pl.name} · waiting up to 60s for them to come back`,4000,null);}catch(e){try{flash(pl.name+' dropped','red','waiting');}catch(_){}}
 try{trackEv('peer_drop');}catch(e){}
 NETDROP[key]=setTimeout(()=>{delete NETDROP[key];const st=NET.chan&&NET.chan.presenceState?NET.chan.presenceState():{};if(st[key])return;onlineLeft(key,true);},GRACE);};
function dartsTotal(){return S.p.reduce((a,p)=>a+(p.darts||0),0)+(S.visit?S.visit.length:0);}
function snapshot(to){return {t:'sync',from:NET.myId,to,stamp:dartsTotal(),cur:(S.p[S.cur]||{}).key===undefined?null:(S.cur===0?NET.myId:S.p[S.cur].key),dart:S.dart,visit:(S.visit||[]).map(v=>Object.assign({},v)),
 players:S.p.map((p,i)=>({key:i===0?NET.myId:p.key,score:p.score,legs:p.legs,darts:p.darts,pts:p.pts,t180:p.t180||0,left:!!p.left,legDarts:p.legDarts||0}))};}
function sendSync(to){if(!S||!S.online||S.done||!NET.chan)return;try{NET.chan.send({type:'broadcast',event:'tops',payload:snapshot(to)});}catch(e){}}
function applySync(m){if(!S||!S.online||S.done||m.to!==NET.myId)return;if(m.stamp<=dartsTotal())return;
 m.players.forEach(sp=>{const p=sp.key===NET.myId?S.p[0]:S.p.find(q=>q.key===sp.key);if(!p)return;Object.assign(p,{score:sp.score,legs:sp.legs,darts:sp.darts,pts:sp.pts,t180:sp.t180,legDarts:sp.legDarts});if(sp.left)p.left=true;});
 const ci=m.cur===NET.myId?0:S.p.findIndex(q=>q.key===m.cur);if(ci>=0)S.cur=ci;S.dart=m.dart||1;S.visit=m.visit||[];S.busy=false;S.netAnim=false;NET.queue=[];
 try{updateUI();}catch(e){}try{pubBand('land','RESYNCED','Back in the match',1400,null);}catch(e){}if(!(m.dart>1)){try{startTurn();}catch(e){}}S.dart=m.dart||1;S.visit=m.visit||[];try{updateUI();}catch(e){}}
const _back=netBack;netBack=function(key){const was=!!NETDROP[key];const r=_back.apply(this,arguments);if(S&&S.online&&!S.done&&key!==NET.myId)setTimeout(()=>sendSync(key),300+Math.random()*600);return r;};
const _rv=netRecv;netRecv=function(m){if(m&&m.t==='sync'){applySync(m);return;}if(m&&m.t==='syncreq'){if(m.from!==NET.myId)setTimeout(()=>sendSync(m.from),200+Math.random()*500);return;}return _rv.apply(this,arguments);};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&S&&S.online&&!S.done&&NET.chan){setTimeout(()=>{try{NET.chan.send({type:'broadcast',event:'tops',payload:{t:'syncreq',from:NET.myId}});}catch(e){}},1500);}});
window.TOPS_sync={snapshot,applySync};
})();
</script>
