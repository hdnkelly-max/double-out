// TOPS regression suite: plays real matches in a headless browser (sped-up timers) and checks scoring invariants.
// Usage: node tests/regress.js [matches=6]   exits 1 on any failure.
const {chromium}=require('playwright');
const N=+process.argv[2]||6;
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
 const fails=[];const stats=[];
const one=async(m)=>{
  const p=await b.newPage({viewport:{width:390,height:844}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.06),...a);});
  await p.goto('file://'+require('path').resolve(__dirname,'../index.html'),{waitUntil:'domcontentloaded',timeout:180000});await p.waitForTimeout(3500);
  const setup=await p.evaluate((m)=>{try{save.authSeen=true;$('login').hidden=true;newCareer();const n=nextOpponent();V.walkOn=()=>{};
   const tier=m%3,start=301;
   beginMatch({mode:'career',tier,p0:'Test',oppKey:n.oppKey,oppName:n.oppName,oppAvg:[42,55,70][tier],legs:1,start});
   window.__T={viol:[],turns:{},base:{},last:{},start};const _fly=V.fly;V.fly=function(){const a=[...arguments];if(typeof a[4]==='number')a[4]=a[4]*0.08;return _fly.apply(this,a);};
   const _st=startTurn;startTurn=function(){const r=_st.apply(this,arguments);try{if(S&&!S.bull)S.p.forEach((q,i)=>{const s0=window.__T.start;if(q.score===s0&&window.__T.last[i]!==s0)window.__T.base[i]=q.pts;window.__T.last[i]=q.score;const base=window.__T.base[i]||0;if(q.pts-base!==s0-q.score)window.__T.viol.push(`pts drift p${i}: pts ${q.pts} base ${base} score ${q.score}`);if(q.score<0||q.score===1)window.__T.viol.push(`bad score p${i} ${q.score}`);});}catch(e){window.__T.viol.push('hook '+e.message)}return r;};
   const _ld=land;land=function(x,y,far){if(S&&!S.bull&&!S.done){const k=S.cur+':'+S.turnN;window.__T.turns[k]=(window.__T.turns[k]||0)+1;if(window.__T.turns[k]>3)window.__T.viol.push(`4th dart in turn ${k} (p${S.cur})`);}return _ld.apply(this,arguments);};
   try{if(window.TC_API){const t=TC_API.st();window.__T.paid0=new Set(Object.keys(t.paid||{}));window.__T.picks0=(t.picks||[]).length;window.__T.exp={max:0,ton:0};const _av=achVisit;achVisit=function(tc,R,vs0){const r=_av.apply(this,arguments);try{if(tc===0&&R&&!R.bust&&!S.practice){if(R.tot===180)window.__T.exp.max++;if(R.won&&vs0>=100)window.__T.exp.ton++;}}catch(e){}return r;};}}catch(e){window.__T.viol.push('tc setup '+e.message);}
   // v1.71: opponent never stands in a throw pose on your visit; spare darts count down 2/1/0
   {const bad={};setInterval(()=>{try{if(!S||S.bull||S.done||!V._qa.opp)return;const o=V._qa.opp();if(!o)return;const seen=new Set();const chk=(m,c)=>{if(c){seen.add(m);bad[m]=(bad[m]||0)+1;if(bad[m]>=12&&!window.__T.viol.includes(m))window.__T.viol.push(m);}};
    chk('opponent in throw pose on human visit',S.cur===0&&!S.p[0].ai&&!S.mateTurn&&o.visible!==false&&!o.userData.waiting);
    chk('opponent hidden on his visit',S.p[S.cur].ai&&o.visible!==true);
    if(S.p[S.cur].ai&&o.visible===true){const got=o.userData.B.LeftHand.children.filter(c=>c.userData.spare&&c.visible).length,want=Math.max(0,2-S.visit.length);chk('opp spares wrong',got!==want);}
    Object.keys(bad).forEach(k=>{if(!seen.has(k))bad[k]=0;});}catch(e){}},150);}
   return 'ok';}catch(e){return 'setup '+e.message;}},m);
  if(setup!=='ok'){fails.push(`match ${m}: ${setup}`);await p.close();return;}
  const t0=Date.now();let st='';
  let iter=0;while(Date.now()-t0<200000){if((++iter)%60===0&&process.env.DBG)console.log("  m"+m+" "+st+" "+await p.evaluate(()=>JSON.stringify({cur:S.cur,busy:S.busy,dart:S.dart,v:S.visit.length,sc:S.p.map(q=>q.score),bull:!!S.bull,fly:!!S.aiFlying,cel:!!(S.celebrateUntil&&performance.now()<S.celebrateUntil),cards:!!document.querySelector(".cd-wrap:not([hidden]),#cardDraft:not([hidden])"),done:S.done,lg:S.p.map(q=>q.legs)})));st=await p.evaluate(()=>{try{if(S.done)return 'done';
    if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
    if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const me=S.p[0];const lbl=aimFor(me.score,4-S.dart);const t=targetPoint(lbl);S.busy=true;land(t.x+gauss()*16,t.y+gauss()*16);}
    return 'play';}catch(e){return 'ERR '+e.message;}});
   if(st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(40);}
  await p.evaluate(()=>{try{if(!window.TC_API||!window.__T.paid0)return;const t=TC_API.st();const nk=Object.keys(t.paid||{}).filter(k=>!window.__T.paid0.has(k));const mx=nk.filter(k=>/^match:.*:180$/.test(k)).length,tn=nk.filter(k=>/^match:.*:ton$/.test(k)).length;const E=window.__T.exp;
   if(mx!==E.max)window.__T.viol.push(`cards: ${mx} picks for 180s, expected ${E.max}`);if(tn!==E.ton)window.__T.viol.push(`cards: ${tn} picks for 100+ outs, expected ${E.ton}`);
   const gained=(t.picks||[]).length-window.__T.picks0;if(!t.srv&&gained<mx+tn)window.__T.viol.push(`cards: ${gained} picks queued, expected at least ${mx+tn}`);
   const ids=(t.picks||[]).map(x=>x.id);if(new Set(ids).size!==ids.length)window.__T.viol.push('cards: duplicate pick ids');}catch(e){window.__T.viol.push('cards check '+e.message);}});
  const r=await p.evaluate(()=>({viol:window.__T.viol.slice(0,10),p:S.p.map(q=>({legs:q.legs,avg:q.darts?+(q.pts/q.darts*3).toFixed(1):0,darts:q.darts,ai:!!q.ai})),done:!!S.done}));
  if(!r.done)fails.push(`match ${m}: did not finish (${st})`);
  r.viol.forEach(v=>fails.push(`match ${m}: ${v}`));errs.slice(0,3).forEach(e=>fails.push(`match ${m}: page error ${e}`));
  const ai=r.p.find(q=>q.ai);if(ai&&ai.darts>30&&ai.avg>110)fails.push(`match ${m}: AI avg ${ai.avg} impossible for rating`);
  stats.push(r.p.map(q=>(q.ai?'AI ':'P ')+q.avg+'/'+q.legs).join(' vs '));
  await p.close();
 };
 for(let m=0;m<N;m++){await one(m);}
 await b.close();
 console.log('regress: '+N+' matches · '+stats.join(' | '));
 if(fails.length){console.log('REGRESSION FAILED\n- '+fails.join('\n- '));process.exit(1);}
 console.log('regress: all checks passed');
})();
