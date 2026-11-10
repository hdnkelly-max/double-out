<script>
/* ===== v0.61: confidence. Darts that land close calm you down; hitting near your double settles the hand. Replaces the Settle button ===== */
(function(){
const _lf=landFrom;landFrom=function(lock,tp,dt){const l=_lf.apply(this,arguments);try{if(S&&!S.done&&S.cur===0&&!S.p[0].ai&&!S.practice){
 const d=Math.hypot(l.x-S.aim.x,l.y-S.aim.y);const tier=Math.min(6,ui.tier|0);const k=[1.2,1,.85,.7,.6,.5,.45][tier];const tgt=scoreAt(S.aim.x,S.aim.y);const hit=scoreAt(l.x,l.y);
 let c=d<8?.55:d<15?.32:d<25?.12:0;if(tgt.dbl&&hit.label===tgt.label)c+=.9;else if(tgt.dbl&&d<14)c+=.25;c*=k*(window.TOPS_CONF_K?TOPS_CONF_K():1);
 if(c>0){S.calm=Math.min(2.6,(S.calm||0)+c);S.adren=Math.max(0,(S.adren||0)-c*.6);S.hr=Math.max(66,(S.hr||72)-c*9);S.confT=performance.now();}
 else S.calm=Math.max(0,(S.calm||0)*.85);}}catch(e){}return l;};
// confidence fades between visits (keeps 60%) and resets each leg
let lastCur=null,lastLeg=null;setInterval(()=>{if(!S||!S.p)return;let lg=null;try{lg=legsPlayed();}catch(e){}if(lg!==lastLeg){lastLeg=lg;S.calm=0;}if(S.cur!==lastCur){if(lastCur===0)S.calm=(S.calm||0)*.6;lastCur=S.cur;}
 if(S.confT&&performance.now()-S.confT<1800&&S.cur===0){const n=$('hrNote');if(n)n.textContent='Confidence up';}},250);
})();
</script>
