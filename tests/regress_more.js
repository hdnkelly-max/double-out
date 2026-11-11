// TOPS regression suite, part 2 (bug B7): the modes regress.js does not reach. Runs fully offline.
//   1 cards   pub-rules ability cards: every offence card on the human thrower, S.fx, pubfx DOM layer + TOPS_DRUNKCAM
//   2 run     The Run: opening draft, one match to the end, post-match draft screen
//   3 pack    card pack with 8 picks (incl. epic + legendary), pick through, summary, Done
//   4 501     a best-of-3 501 career match with the same dart/score invariants as regress.js
//   5 walk    own walk-on and opponent walk-on both end (TOPS_WALKFULL false, #tcWalk gone)
// Usage: node tests/regress_more.js [only=cards,run,pack,501,walk]   exits 1 on any failure.
// Serves ../index.html (run `node build.js` first) on PORT (default 8802); other files from the repo root, then
// TOPS_SERVE (default /home/claude/serve: assets/, img/, node_modules/). Every request off that origin is aborted.
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),SERVE=process.env.TOPS_SERVE||'/home/claude/serve',PORT=+process.env.PORT||8802;
const ONLY=(process.argv.find(a=>/^[a-z0-9,]+$/.test(a)&&a.split(',').every(k=>['cards','run','pack','501','walk'].includes(k)))||'').split(',').filter(Boolean);
const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.glb':'model/gltf-binary','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.m4a':'audio/mp4','.exr':'application/octet-stream','.webmanifest':'application/manifest+json','.txt':'text/plain'};
const results=[];let failed=false;
const pass=(k,msg)=>{results.push('PASS '+k+(msg?': '+msg:''));console.log('PASS '+k+(msg?': '+msg:''));};
const fail=(k,msg)=>{failed=true;results.push('FAIL '+k+': '+msg);console.log('FAIL '+k+': '+msg);};
const T0=Date.now(),el=()=>((Date.now()-T0)/1000).toFixed(0)+'s';

function serve(){return new Promise(res=>{const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';p=path.normalize(p).replace(/^(\.\.[\/\\])+/,'');
  const c=[path.join(ROOT,p),path.join(SERVE,p)].find(f=>{try{return fs.statSync(f).isFile();}catch(e){return false;}});
  if(!c){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':MIME[path.extname(c).toLowerCase()]||'application/octet-stream'});fs.createReadStream(c).pipe(r);});
 srv.listen(PORT,'127.0.0.1',()=>res(srv));});}
const BASE=`http://127.0.0.1:${PORT}/`;

// a fresh page with the game loaded; timers sped up by `speed` (1 = real time)
async function open(b,speed,scene){
 const p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/*',r=>r.request().url().startsWith(BASE)?r.continue():r.abort());
 // cap the frame rate: swiftshader renders the 3D pub on the CPU and starves everything else on a busy box
 await p.addInitScript(ms=>{const raf=window.requestAnimationFrame.bind(window);let open=-1e9;window.requestAnimationFrame=cb=>raf(function f(t){if(t===open||t-open>=ms){open=t;cb(t);}else raf(f);});},+process.env.FRAME_MS||90);
 if(speed!==1)await p.addInitScript(k=>{const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*k),...a);},speed);
 await p.goto(BASE+'index.html',{waitUntil:'domcontentloaded',timeout:90000});
 await p.waitForFunction(()=>typeof beginMatch==='function'&&typeof save==='object'&&window.TC_API&&window.TOPS_PUBFX&&window.TopsCards,null,{timeout:90000,polling:250});
 // the 3D canvas costs ~95% of a swiftshader frame (3 fps vs 55 on a shared box); game logic still runs every frame without it.
 // RENDER=1 keeps it on for every check. regress.js always renders, so the WebGL path stays covered there.
 if(!scene&&!process.env.RENDER)await p.addStyleTag({content:'#scene{display:none!important}'});
 await p.waitForTimeout(1500);
 await p.evaluate(()=>{save.authSeen=true;const l=$('login');if(l)l.hidden=true;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());});
 return {p,errs};
}
const errCheck=(k,errs)=>{if(errs.length){fail(k,'page errors: '+errs.slice(0,3).join(' | '));return false;}return true;};

// in-page: dart/score invariants (same as regress.js) for local career matches
function hooks(){window.__T={viol:[],turns:{},base:{},last:{},start:S.p[0].score,legs:0};
 const _st=startTurn;startTurn=function(){const r=_st.apply(this,arguments);try{if(S&&!S.bull)S.p.forEach((q,i)=>{const s0=window.__T.start;if(q.score===s0&&window.__T.last[i]!==s0)window.__T.base[i]=q.pts;window.__T.last[i]=q.score;const base=window.__T.base[i]||0;if(q.pts-base!==s0-q.score)window.__T.viol.push(`pts drift p${i}: pts ${q.pts} base ${base} score ${q.score}`);if(q.score<0||q.score===1)window.__T.viol.push(`bad score p${i} ${q.score}`);});}catch(e){window.__T.viol.push('hook '+e.message)}return r;};
 const _ld=land;land=function(){if(S&&!S.bull&&!S.done){const k=legsPlayed()+':'+S.cur+':'+S.turnN;window.__T.turns[k]=(window.__T.turns[k]||0)+1;if(window.__T.turns[k]>3)window.__T.viol.push(`4th dart in turn ${k} (p${S.cur})`);}return _ld.apply(this,arguments);};
 const _el=endLeg;endLeg=function(){window.__T.legs++;return _el.apply(this,arguments);};
 const _fly=V.fly;V.fly=function(){const a=[...arguments];if(typeof a[4]==='number')a[4]=a[4]*0.08;return _fly.apply(this,a);};}
// in-page: one tick of the human thrower (aims at the right target with some noise); returns state
function tick(){try{if(!S)return 'nos';if(S.done)return 'done';
 if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
 if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const me=S.p[0];const t=targetPoint(aimFor(me.score,4-S.dart));S.busy=true;land(t.x+gauss()*14,t.y+gauss()*14);}
 return 'play';}catch(e){return 'ERR '+e.message;}}

// ---------- 1. pub-rules ability cards ----------
async function checkCards(b){const K='cards';const {p,errs}=await open(b,0.25);
 const st=await p.evaluate(()=>{try{NET.myId='me';NET.chan=null;sessionStorage.setItem('tcWalkSeen','1');
  onlineBegin({t:'start',legs:1,start:501,din:false,tier:0,level:1,first:0,teams:false,players:[{key:'me',name:'Test',pro:'shane',pid:'me'},{key:'opp',name:'Big Mal',pro:'shane',pid:'opp'}],pub:{bets:1,abil:1,sips:[],tre:[]}});
  const _fly=V.fly;V.fly=function(){const a=[...arguments];if(typeof a[4]==='number')a[4]=a[4]*0.08;return _fly.apply(this,a);};
  return {on:cardsOn(),cur:S.cur,online:!!S.online,ids:CARDS.filter(c=>c.ty==='off').map(c=>c.id),drink:CARDS.filter(c=>c.ty==='off'&&c.drink).map(c=>c.id)};}catch(e){return {err:e.message};}});
 const D=m=>process.env.DBG&&console.log('  cards '+el()+' '+m);D('started '+JSON.stringify(st));
 if(st.err||!st.on){fail(K,'could not start a local pub-rules match: '+(st.err||'cardsOn() false'));await p.close();return;}
 // the remote mate's visit: three misses over the fake channel
 let q=0;const oppVisit=async()=>{for(let i=0;i<3;i++){await p.evaluate(n=>netRecv({t:'dart',from:'opp',q:n,x:0,y:320}),++q);}};
 const ready=async(ms)=>{try{await p.waitForFunction(()=>S&&!S.done&&S.cur===0&&!S.busy&&S.visit.length===0&&!$('intro').classList.contains('show')&&!window.TOPS_WALKFULL,null,{timeout:ms,polling:100});return true;}catch(e){return false;}};
 const diag=()=>p.evaluate(()=>JSON.stringify({cur:S.cur,busy:S.busy,netAnim:!!S.netAnim,q:NET.queue.length,v:S.visit.length,oppDarts:S.p[1].darts,intro:$('intro').classList.contains('show'),draft:!$('cardDraft').hidden,walk:!!window.TOPS_WALKFULL,done:S.done})).catch(e=>'?');
 const bad=[];const sane=c=>c==null||(c.every(Number.isFinite)&&Math.abs(c[0])<.25&&Math.abs(c[1])<.25&&Math.abs(c[2])<.6&&c[3]>.5&&c[3]<2);
 const cam=()=>p.evaluate(()=>{const c=window.TOPS_DRUNKCAM&&TOPS_DRUNKCAM(performance.now());return c==null?null:[c.x,c.y,c.r,c.f];});
 const dart=async()=>{try{await p.waitForFunction(()=>S.cur===0&&!S.busy,null,{timeout:30000,polling:50});}catch(e){return false;}await p.evaluate(()=>{const t=targetPoint('S1');S.busy=true;land(t.x,t.y);});return true;};
 if(!await ready(45000)){fail(K,'human never got the throw ('+await p.evaluate(()=>JSON.stringify({cur:S.cur,busy:S.busy,v:S.visit.length})).catch(()=>'?')+')');await p.close();return;}
 // every offence card lands on the human at the start of one visit (two batches so the stack stays realistic),
 // each is checked as it lands, then the visit and the mate's visit play out and every trace must be gone
 if(process.env.CARDS)st.ids=st.ids.filter(i=>process.env.CARDS.split(',').includes(i));   // debug: CARDS=horn,bump
 const half=Math.ceil(st.ids.length/2);
 for(const batch of [st.ids.slice(0,half),st.ids.slice(half)]){
  const R=await p.evaluate(ids=>{S.fx=[];return ids.map(id=>{const out={id};try{
    cardApply({cid:'qa-'+id,id,from:'opp',to:'me'},true);
    const f=(S.fx||[]).filter(x=>x.id===id);out.fx=f.length;out.until=f.map(x=>typeof x.until==='number'?'time':x.until);
    out.body=document.body.classList.contains('pfx-'+id);out.dom=!!document.querySelector('#pubFx > .pf-'+id);out.has=!!TOPS_PUBFX.FX[id];
    const c=window.TOPS_DRUNKCAM&&TOPS_DRUNKCAM(performance.now());out.cam=c==null?null:[c.x,c.y,c.r,c.f];
   }catch(e){out.err=e.message;}return out;});},batch);
  D('applied '+JSON.stringify(R));await p.waitForTimeout(300);const c2=await cam();
  for(const r of R){const why=[];if(r.err)why.push('threw '+r.err);
   if(!r.fx&&r.id!=='bump'&&!st.drink.includes(r.id))why.push('no S.fx entry');     // bump moves the aim directly; drink cards set drink flags, not fx
   if(r.has&&!r.dom&&!r.body)why.push('no #pubFx layer or body class');
   if(!sane(r.cam))why.push('DRUNKCAM '+JSON.stringify(r.cam));
   if(why.length)bad.push(r.id+': '+why.join('; '));}
  if(!sane(c2))bad.push('DRUNKCAM with the stack live '+JSON.stringify(c2));
  if(!await dart()){bad.push('stuck before dart 1 '+await diag());break;}
  try{await p.waitForFunction(()=>S.visit.length>=1&&!S.busy,null,{timeout:30000,polling:50});}catch(e){}
  const d1=await p.evaluate(()=>(S.fx||[]).filter(f=>f.until==='dart').map(f=>f.id));if(d1.length)bad.push('one-dart effects still live after dart 1: '+d1.join(','));
  if(!sane(await cam()))bad.push('DRUNKCAM after dart 1');
  if(!await dart())bad.push('stuck before dart 2');if(!await dart())bad.push('stuck before dart 3');
  try{await p.waitForFunction(()=>S.cur!==0,null,{timeout:30000,polling:100});}catch(e){bad.push('turn never passed '+await diag());break;}
  D('opp visit');await oppVisit();
  if(!await ready(60000)){bad.push('turn never came back '+await diag());break;}D('back');
  // bump runs on a 2.6 s clock; the layer fades over 0.45 s
  await p.waitForTimeout(3000);D('settled');
  const g=await p.evaluate(ids=>({fx:(S.fx||[]).map(f=>f.id),body:[...document.body.classList].filter(c=>/^(pfx-|card-)/.test(c)),dom:[...document.querySelectorAll('#pubFx > *')].map(e=>e.className),cam:(()=>{const c=TOPS_DRUNKCAM(performance.now());return c==null?null:[c.x,c.y,c.r,c.f];})()}),batch);
  if(g.fx.length)bad.push('S.fx still holds '+g.fx.join(',')+' on the next visit');
  if(g.body.length)bad.push('body classes left: '+g.body.join(','));
  if(g.dom.length)bad.push('#pubFx children left: '+g.dom.join(','));
  if(!sane(g.cam))bad.push('DRUNKCAM after effects ended '+JSON.stringify(g.cam));
  if(await p.evaluate(()=>S.done)){bad.push('match ended early');break;}
  if(process.env.DBG)console.log('  cards batch done '+el()+' '+batch.join(' '));
 }
 // the stamp/defence layers too: they must clear themselves
 await p.evaluate(()=>{TOPS_PUBFX.door();TOPS_PUBFX.stamp('2×','QA','drink');});await p.waitForTimeout(3000);
 if(await p.evaluate(()=>!!document.querySelector('#pubFx .pf-door,#pubFx .pf-stamp')))bad.push('door/stamp layer not removed after 3 s');
 if(bad.length)fail(K,bad.join(' | '));else pass(K,st.ids.length+' offence cards: '+st.ids.join(' '));
 errCheck(K+' errors',errs)&&pass(K+' errors','no page errors');await p.close();}

// ---------- 2. The Run ----------
async function checkRun(b){const K='run';const {p,errs}=await open(b,0.1);
 await p.evaluate(()=>{sessionStorage.setItem('tcWalkSeen','1');save.name='Test';newRun(null);V.walkOn=()=>{};showPerkPick(()=>playNext(),3,{won:true,opening:true});window.__H=null;});
 const t0=Date.now();let phase='opening',draft=false,matchSeen=false,last='',it=0;
 while(Date.now()-t0<240000){
  const s=await p.evaluate(()=>{const vis=id=>{const e=document.getElementById(id);return !!(e&&!e.hidden&&e.offsetParent!==null);};
   if(S&&!S.done){if(!window.__H){window.__H=1;(function(){const _ld=land;window.__V=[];const turns={};land=function(){if(S&&!S.bull&&!S.done){const k=legsPlayed()+':'+S.cur+':'+S.turnN;turns[k]=(turns[k]||0)+1;if(turns[k]>3)window.__V.push('4th dart '+k);}return _ld.apply(this,arguments);};const _fly=V.fly;V.fly=function(){const a=[...arguments];if(typeof a[4]==='number')a[4]=a[4]*0.08;return _fly.apply(this,a);};})();}
    const cd=document.querySelector('#cardDraft:not([hidden]) .cd-card');if(cd)cd.click();
    if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'match';}
    if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai&&!$('intro').classList.contains('show')){const me=S.p[0];const t=targetPoint(aimFor(me.score,4-S.dart));S.busy=true;land(t.x+gauss()*12,t.y+gauss()*12);}
    return 'match';}
   if(vis('perk')){const c=document.querySelector('#perkCards > *:not(.fade)');const why=$('perkWhy').textContent;if(c&&!document.getElementById('perkCards').dataset.lock)c.click();return 'perk:'+why;}
   if(vis('result')){$('btnResultNext').click();return 'result';}
   const rb=document.querySelector('#msgReplies button');if(vis('msg')){if(rb)rb.click();return 'msg';}
   if(vis('hub')){const pn=$('btnPlayNext');if(pn&&!pn.disabled)pn.click();return 'hub';}
   const fx=document.querySelector('.screen:not([hidden]) button.primary, .overlay:not([hidden]) button.primary');if(fx){fx.click();return 'btn:'+(fx.id||fx.textContent.slice(0,20));}
   return 'idle:'+[...document.querySelectorAll('.screen:not([hidden]),.overlay:not([hidden])')].map(e=>e.id).join(',');});
  if(s!==last&&process.env.DBG)console.log('  run '+el()+' '+s);last=s;
  if(s==='match')matchSeen=true;
  if(matchSeen&&s.startsWith('perk:')&&!/Opening/.test(s)){draft=s.slice(5);break;}
  if(s.startsWith('ERR'))break;
  await p.waitForTimeout(++it%10?60:200);}
 const v=await p.evaluate(()=>window.__V||[]);
 if(!matchSeen)fail(K,'run match never started (last screen '+last+')');
 else if(!draft)fail(K,'no draft screen after the match (last '+last+')');
 else pass(K,'match played, draft shown: "'+draft+'" in '+((Date.now()-t0)/1000|0)+'s');
 if(v.length)fail(K+' darts',v.slice(0,3).join(', '));
 errCheck(K+' errors',errs)&&pass(K+' errors','no page errors');await p.close();}

// ---------- 3. card pack ----------
async function checkPack(b){const K='pack';const {p,errs}=await open(b,1);
 const ids=await p.evaluate(()=>{const D=TC_DATA;const by=r=>D.CARDS.filter(c=>c.rarity===r).map(c=>c.id);const E=by('epic'),L=by('legendary'),C=by('common'),U=by('uncommon'),R=by('rare');
  // pick 1 offers an epic first, pick 2 a legendary first; the rest mixed
  const seq=[[E[0],C[0],C[1]],[L[0],U[0],C[2]],[R[0],C[3],U[1]],[C[4],C[5],C[6]],[E[1],R[1],C[7]],[U[2],C[8],C[9]],[L[1],R[2],U[3]],[C[10],U[4],R[3]]];
  let k=0;window.__pk={done:false,got:null,res:0};
  TopsCards.openPack({picks:seq.map((s,i)=>({id:'q'+i,reason:'QA'})),backdrop:'assets/ui/bg_pub.webp',
   resolve:()=>new Promise(r=>{const s=seq[k++];window.__pk.res++;setTimeout(()=>r({options:s.map(id=>D.CARDS.find(c=>c.id===id)),chosen:0,owned:{},keepAll:false}),50);}),
   onDone:g=>{window.__pk.done=true;window.__pk.got=g?g.length:0;}});
  return seq.map(s=>s[0]);});
 const bad=[];
 const waitSel=async(sel,ms)=>{try{await p.waitForSelector(sel,{state:'visible',timeout:ms});return true;}catch(e){return false;}};
 for(let i=0;i<8;i++){
  if(i>0){if(!await waitSel('.tcpk__next',12000)){bad.push('no Continue after pick '+i);break;}await p.click('.tcpk__next');}
  if(!await waitSel('.tcpk__row .tc',12000)){bad.push('no cards for pick '+(i+1));break;}
  await p.waitForTimeout(400);const cs=await p.$$('.tcpk__row .tc');await cs[0].click();await p.waitForTimeout(i<2?3500:1500);}
 if(!bad.length){if(!await waitSel('.tcpk__next',12000))bad.push('no Continue after last pick');else await p.click('.tcpk__next');
  if(!await waitSel('.tcpk__done',12000))bad.push('summary never showed a Done button');
  else{const inView=await p.evaluate(()=>{const r=document.querySelector('.tcpk__done').getBoundingClientRect();return r.bottom<=innerHeight&&r.top>=0;});if(!inView)bad.push('Done button off screen');
   await p.click('.tcpk__done');try{await p.waitForFunction(()=>!document.querySelector('.tcpk'),null,{timeout:5000,polling:100});}catch(e){}
   const r=await p.evaluate(()=>({ov:!!document.querySelector('.tcpk'),pk:window.__pk}));
   if(r.ov)bad.push('pack overlay still in the DOM after Done');if(!r.pk.done)bad.push('onDone not called');if(r.pk.res!==8)bad.push('resolve called '+r.pk.res+' times');}}
 if(bad.length)fail(K,bad.join(' | '));else pass(K,'8 picks (epic '+ids[0]+', legendary '+ids[1]+'), summary, Done, overlay removed');
 errCheck(K+' errors',errs)&&pass(K+' errors','no page errors');await p.close();}

// ---------- 4. best-of-3 501 ----------
async function check501(b){const K='501';const {p,errs}=await open(b,0.06);
 const s=await p.evaluate(h=>{try{sessionStorage.setItem('tcWalkSeen','1');newCareer();const n=nextOpponent();V.walkOn=()=>{};
  beginMatch({mode:'career',tier:0,p0:'Test',oppKey:n.oppKey,oppName:n.oppName,oppAvg:50,legs:3,start:501});eval('('+h+')')();return S.bestOf+'/'+S.p[0].score;}catch(e){return 'ERR '+e.message;}},hooks.toString());
 if(s!=='3/501'){fail(K,'setup '+s);await p.close();return;}
 const t0=Date.now();let st='';const tk='('+tick.toString()+')()';
 while(Date.now()-t0<240000){st=await p.evaluate(tk);if(st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(40);}
 const r=await p.evaluate(()=>({viol:window.__T.viol.slice(0,8),legs:S.p.map(q=>q.legs),played:window.__T.legs,darts:S.p.map(q=>q.darts),done:!!S.done}));
 const bad=[];if(!r.done)bad.push('did not finish in 240 s ('+st+', legs '+r.legs.join('-')+')');
 if(r.done&&Math.max(...r.legs)!==2)bad.push('winner has '+Math.max(...r.legs)+' legs, want 2 (best of 3)');
 if(r.done&&r.played!==r.legs[0]+r.legs[1])bad.push(`endLeg ran ${r.played}x for ${r.legs.join('-')}`);
 bad.push(...r.viol);
 if(bad.length)fail(K,bad.join(' | '));else pass(K,'legs '+r.legs.join('-')+', darts '+r.darts.join('/')+' in '+((Date.now()-t0)/1000|0)+'s');
 errCheck(K+' errors',errs)&&pass(K+' errors','no page errors');await p.close();}

// ---------- 5. walk-ons ----------
const WALK_MAX=+process.env.WALK_MAX||8;   // walk-ons are 0.3 s + 4.8 s by design
async function checkWalk(b){const K='walk';const {p,errs}=await open(b,1);
 // measured in page time from the walk's start; also report the longest frame gap so a starved box is visible in the output
 const watch=()=>p.evaluate(()=>{const W={t0:performance.now(),gap:0,last:performance.now(),end:0};window.__W=W;(function f(){const n=performance.now();W.gap=Math.max(W.gap,n-W.last);W.lost=(W.lost||0)+Math.max(0,n-W.last-250);W.last=n;if(!window.TOPS_WALKFULL&&!document.getElementById('tcWalk')){W.end=n-W.t0;return;}requestAnimationFrame(f);})();});
 const waitEnd=async(ms)=>{try{await p.waitForFunction(()=>window.__W&&window.__W.end>0,null,{timeout:ms,polling:200});}catch(e){}return p.evaluate(()=>({s:__W.end?__W.end/1000:-1,gap:Math.round(__W.gap),lost:(__W.lost||0)/1000,now:(performance.now()-__W.t0)/1000}));};
 // pass = ended within WALK_MAX seconds of frames actually delivered (main-thread stalls over 250 ms are not the walk's fault), hard cap 45 s
 const judge=(k,r,ok)=>{const eff=r.s-r.lost,txt=`ended after ${r.s.toFixed(1)}s wall, ${eff.toFixed(1)}s of live frames (stalls ${r.lost.toFixed(1)}s, worst ${r.gap} ms)`;if(r.s<0)fail(k,`still walking after ${r.now.toFixed(1)}s (stalls ${r.lost.toFixed(1)}s)`);else if(eff>WALK_MAX||r.s>45)fail(k,txt+', max '+WALK_MAX+'s');else pass(k,ok+' '+txt);};
 const own=await p.evaluate(()=>{try{sessionStorage.removeItem('tcWalkSeen');newCareer();save.tc={bf:1};save.matches=5;save.name='Test';persist();const A=TC_API;['walk_power','title_power'].forEach(c=>A.st().unl[c]={at:1});['walk_power','title_power'].forEach(c=>A.equip(c));save.walkon='stadium';
  const c=career();c.tier=3;const n=nextOpponent();beginMatch({mode:'career',tier:3,p0:'Test',oppKey:n.oppKey,oppName:n.oppName,oppAvg:60,legs:1});return {walk:!!window.TOPS_WALKFULL,ov:!!document.getElementById('tcWalk'),cel:(save.look.cel||{}).walkon||null};}catch(e){return {err:e.message};}});
 if(!own.err)await watch();
 if(own.err||!own.walk||!own.ov)fail(K+' own','walk-on did not start: '+JSON.stringify(own));
 else judge(K+' own',await waitEnd(45000),own.cel);
 await p.waitForTimeout(1500);
 const o=await p.evaluate(()=>{try{const P=S.p[1];P.look=P.look||{};P.look.cel={walkon:'walk_power'};P.look.title='title_power';P.disp='Big Mal';const d=TC_API.oppWalk({online:true});const W={t0:performance.now(),gap:0,last:performance.now(),end:0};window.__W=W;(function f(){const n=performance.now();W.gap=Math.max(W.gap,n-W.last);W.lost=(W.lost||0)+Math.max(0,n-W.last-250);W.last=n;if(!window.TOPS_WALKFULL&&!document.getElementById('tcWalk')){W.end=n-W.t0;return;}requestAnimationFrame(f);})();return {d,walk:!!window.TOPS_WALKFULL,ov:!!document.getElementById('tcWalk')};}catch(e){return {err:e.message};}});
 if(o.err||!o.d||!o.walk||!o.ov)fail(K+' opp','opponent walk-on did not start: '+JSON.stringify(o));
 else judge(K+' opp',await waitEnd(45000),'game waits '+o.d+' ms,');
 // the match underneath must still be playable afterwards
 const ok=await p.evaluate(()=>!!(S&&!S.done&&S.p&&S.p.length===2));if(!ok)fail(K+' after','match state broken after walk-ons');
 errCheck(K+' errors',errs)&&pass(K+' errors','no page errors');await p.close();}

(async()=>{
 if(!fs.existsSync(path.join(ROOT,'index.html'))){console.log('regress_more: no index.html, run node build.js');process.exit(1);}
 const srv=await serve();
 const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
 const all=[['pack',checkPack],['walk',checkWalk],['cards',checkCards],['run',checkRun],['501',check501]];
 for(const [k,f] of all){if(ONLY.length&&!ONLY.includes(k))continue;const t=Date.now();
  try{await f(b);}catch(e){fail(k,'harness '+String(e.message||e).split('\n')[0]);}
  console.log(`  (${k} ${((Date.now()-t)/1000).toFixed(0)}s, total ${el()})`);}
 await b.close();srv.close();
 if(failed){console.log('regress_more: FAILED');process.exit(1);}
 console.log('regress_more: all checks passed ('+el()+')');
})();
