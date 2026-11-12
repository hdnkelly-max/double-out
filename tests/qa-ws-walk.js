// #20 (Hayden 17:36): the opponent never animates while waiting, and a clip file landing mid-match rebuilds nothing until the hub.
// node tests/wait-still.js [dir] -> PASS / FAIL. Served over http (clips can load; file:// can't fetch them), render stubbed, 390 iPhone UA.
// Path: match 1 (walk-on already seen this session, so no clips load) lost -> reward Continue -> message -> hub -> Go -> match 2 = the
// session's first walk-on (a walk-on equipped), which requests the clip file mid-match, as on Hayden's 3.05 path. SKIP=1 taps the walk-on away.
// Checks: (1) in match 2 no figure or venue rebuild after the clip file lands (opponent figure, player figure and venue objects keep their
// identity from the walk-on to 8 s after the player's aim); (2) 0 mixers updated per frame at the player's aim in match 1 and match 2;
// (3) no visible rigged figure in a T-pose (both upper arms level) on any frame of either match; (4) the deferred rebuild happens at the hub.
const {chromium,devices}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]||path.resolve(__dirname,'..'));const T0=Date.now();
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
const ORIGIN='http://tops.test/';const types={html:'text/html',js:'application/javascript',json:'application/json',css:'text/css',png:'image/png',jpg:'image/jpeg',webp:'image/webp',glb:'model/gltf-binary',mp3:'audio/mpeg',woff2:'font/woff2'};
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());let animsAt=null;
await p.route(ORIGIN+'**',async r=>{const u=new URL(r.request().url());let f=decodeURIComponent(u.pathname.slice(1))||'index.html';if(/anims\.glb$/.test(f))animsAt=Date.now();
 const fp=path.join(dir,f);if(!fp.startsWith(dir)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory())return r.fulfill({status:404,body:''});
 return r.fulfill({status:200,contentType:types[path.extname(f).slice(1)]||'application/octet-stream',body:fs.readFileSync(fp)});});
const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(s=>{window.__SKIP=s;window.__W={mix:0,on:false,tpose:[],frames:0};const st=setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.3),...a);},process.env.SKIP==='1');
await p.goto(ORIGIN+'index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{const W=__W,T=window.THREE,R=V._qa.renderer;const up=T.AnimationMixer.prototype.update;T.AnimationMixer.prototype.update=function(){if(W.on)W.mix++;return up.apply(this,arguments);};
 const vis=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};const M=new T.Matrix4(),Mi=new T.Matrix4(),a=new T.Vector3(),c=new T.Vector3(),ba=new T.Vector3(),bc=new T.Vector3();
 // bind (T-)pose test: both upper arms point where they point in the skin's bind pose (within 12 degrees), in the mesh's own space
 const armBind=(m,A,F,cur)=>{const sk=m.skeleton,i=sk.bones.indexOf(A),j=sk.bones.indexOf(F);if(i<0||j<0)return false;
  M.copy(sk.boneInverses[i]).invert().premultiply(m.bindMatrixInverse);ba.setFromMatrixPosition(M);M.copy(sk.boneInverses[j]).invert().premultiply(m.bindMatrixInverse);bc.setFromMatrixPosition(M);
  Mi.copy(m.matrixWorld).invert();a.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Mi);c.setFromMatrixPosition(F.matrixWorld).applyMatrix4(Mi);
  const d1=bc.sub(ba).normalize(),d2=c.sub(a).normalize();return d1.dot(d2)>Math.cos(12*Math.PI/180);};
 R.render=function(sc){if(!S||S.done||!sc)return;W.frames++;sc.updateMatrixWorld(true);sc.traverse(o=>{const B=o.userData&&o.userData.B;if(!B||!B.LeftArm||!B.RightArm||!B.LeftForeArm||!B.RightForeArm||!vis(o))return;
   let sm=null;o.traverse(m=>{if(!sm&&m.isSkinnedMesh&&m.skeleton&&m.skeleton.bones.indexOf(B.LeftArm)>=0&&vis(m))sm=m;});if(!sm)return;
   if(armBind(sm,B.LeftArm,B.LeftForeArm)&&armBind(sm,B.RightArm,B.RightForeArm)&&W.tpose.length<20)W.tpose.push((o.userData.ck||'?')+(o===V._qa.opp()?'*opp':'')+'@'+S.cur+(document.getElementById('tcWalk')?' walk':''));});};
 save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;save.look=save.look||{};save.look.cel=Object.assign({},save.look.cel,{walkon:'walk_smoke'});
 try{sessionStorage.setItem('tcWalkSeen','1');}catch(e){}const bm=window.beginMatch;window.__BM=[];window.beginMatch=beginMatch=function(o){const r=bm.apply(this,arguments);try{__BM.push({cur:S.cur,bull:!!S.bull,seen:sessionStorage.getItem('tcWalkSeen'),walk:!!document.getElementById('tcWalk'),mode:o&&o.mode,tier:o&&o.tier,exh:!!(o&&o.tcExh),keys:o?Object.keys(o).join(','):null,money:o&&o.money,practice:o&&o.practice});}catch(e){}return r;};showHub();});
const click=sel=>p.evaluate(sel=>{if(sel==='MSG'){const bs=[...document.querySelectorAll('#msgReplies button')];if(!bs.length||!bs[0].getClientRects().length)return false;(window.__MSGT=window.__MSGT||[]).push(bs.map(b=>b.textContent).join(' | '));const pick=bs.find(b=>!/\$|money|bet|stake|cash|quid|bucks|wager/i.test(b.textContent))||bs[bs.length-1];pick.click();return true;}const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
const ev=(f,a)=>p.evaluate(f,a);
const ids=()=>ev(()=>{const sc=V._qa.renderer&&V._qa.opp()?(()=>{let r=V._qa.opp();while(r.parent)r=r.parent;return r;})():null;return {opp:V._qa.opp()?V._qa.opp().uuid:null,fp:V._qa.fp()?V._qa.fp().uuid:null,kids:sc?sc.children.map(c=>c.uuid).join(','):null,anim:TOPS_RIGS().anim,keys:(TOPS_RIGS().animKeys||[]).join(',')};});
let idWalk=null,S2=false;const toAim=async()=>{let walked=false;for(let i=0;i<900;i++){const st=await ev(()=>{try{const w=document.getElementById('tcWalk');if(w&&!w.classList.contains('out')){if(window.__SKIP)w.click();return 'walk';}if(!S)return 'nos';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});
 if(st==='walk'){walked=true;if(S2)await ev(()=>{__W.on=true;});if(!idWalk&&S2)idWalk=await ids();}if(st==='aim'||st.startsWith('ERR'))return {st,walked};if(st==='nos'||st==='done'){for(const s of ['MSG','.tc-sheet .tc-x','#tcPLater','.tcpk__later','#c3Go'])if(await click(s))break;}await p.waitForTimeout(120);}return {st:'timeout',walked};};
const mixAt=async()=>{await ev(()=>{__W.mix=0;__W.on=true;});await p.waitForTimeout(2500);return ev(()=>{__W.on=false;return +(__W.mix/Math.max(1,__W.frames)).toFixed(2);});};
const play=async()=>{for(let i=0;i<4000;i++){const st=await ev(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
  S.p[1].score=Math.min(S.p[1].score,40);if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){S.busy=true;land(400,400);}return 'play';}catch(e){return 'ERR '+e.message;}});if(st==='done'||st.startsWith('ERR'))return st;await p.waitForTimeout(40);}return 'timeout';};
const toHub=async()=>{for(let i=0;i<90;i++){const at=await ev(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!document.querySelector('div.tcpk')&&$('msg').hidden!==false&&!(S&&!S.done));if(at)return true;
 for(const s of ['#tcPLater','.tcpk__later','#btnPerkLater','MSG','#c3rwGo','#btnResultNext','#btnResAction']){if(await click(s))break;}await p.waitForTimeout(400);}return false;};
const m1=await toAim();await p.waitForTimeout(1200);const mix1=await mixAt();const id1=await ids();const anims1=animsAt;
await play();const hub=await toHub();
await ev(()=>{try{sessionStorage.removeItem('tcWalkSeen');}catch(e){}});
// match 2: snapshot identities as soon as the walk-on starts, then at aim, then 8 s later
S2=true;await click('#c3Go');
const w2=await ev(async()=>{for(let i=0;i<30;i++){if(document.getElementById('tcWalk'))return 'walk';await new Promise(r=>setTimeout(r,100));}return {seen:sessionStorage.getItem('tcWalkSeen'),cur:S&&S.cur,cel:JSON.stringify(save.look&&save.look.cel),msg:!$('msg').hidden,hub:!$('hub').hidden,started:!!(S&&!S.done)};});
await ev(()=>{__W.mix=0;});const m2=await toAim();const walkMix=await ev(()=>{__W.on=false;return __W.mix;});await p.waitForTimeout(1200);const mix2=await mixAt();const idA=await ids();await p.waitForTimeout(8000);const idB=await ids();
const animsLanded=!!animsAt;const tpose=await ev(()=>__W.tpose.slice());
await play();await toHub();await p.waitForTimeout(800);const idH=await ids();
const fails=[];
if(m1.st!=='aim'||m2.st!=='aim')fails.push('a match never reached the aim: '+m1.st+'/'+m2.st);
if(!m2.walked&&!process.env.SKIP)fails.push('match 2 had no walk-on');
if(!animsLanded)fails.push('the clip file never loaded (walk-on did not request it)');
const idW=idWalk;if(!idW&&!process.env.SKIP)fails.push('no snapshot at the walk-on');if(idW&&idA&&(idW.opp!==idA.opp||idW.fp!==idA.fp||idW.kids!==idA.kids))fails.push('figures/venue rebuilt during match 2 (walk-on -> aim)');
if(idA&&idB&&(idA.opp!==idB.opp||idA.fp!==idB.fp||idA.kids!==idB.kids))fails.push('figures/venue rebuilt during match 2 (aim -> +8 s)');
if(mix1>0||mix2>0)fails.push('mixers updated at aim: match 1 '+mix1+', match 2 '+mix2+' per frame');
if(tpose.length)fails.push('T-pose frames: '+tpose.slice(0,4).join(', '));
if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));
console.log('walkMix (clips landing mid-walk)',walkMix,'animsAt-relative',animsAt);console.log('wait-still',fails.length?'FAIL':'PASS',JSON.stringify({fails,match1:{mix:mix1,anim:id1.anim},match2:{walked:m2.walked,mix:mix2,animAtAim:idA.anim,keys:idB.keys,sameFromWalk:idWalk&&idA?{opp:idWalk.opp===idA.opp,fp:idWalk.fp===idA.fp,venue:idWalk.kids===idA.kids}:null,sameAimTo8s:{opp:idA.opp===idB.opp,fp:idA.fp===idB.fp,venue:idA.kids===idB.kids}},hubRebuilt:idH.fp!==idB.fp,w2,bm:await ev(()=>__BM),msgs:await ev(()=>window.__MSGT||[]),animsLanded,hub,secs:(Date.now()-T0)/1000|0}));
await b.close();process.exit(fails.length?1:0);})();
