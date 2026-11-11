// F2: play a real career match from Lv 14 (one XP short of 15) and capture the real reward screen
const {chromium}=require('playwright');const tag=process.argv[2]||'x';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await require('./hl.js')(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.06),...a);});
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';$('login').hidden=true;newCareer();const v=C3.V3();v.lv=14;v.bSeen=14;v.xp=C3.lvNeed(14)-1;persist();const n=nextOpponent();V.walkOn=()=>{};
 beginMatch({mode:'career',tier:0,p0:'Hayden',oppKey:n.oppKey,oppName:n.oppName,oppAvg:30,legs:1,start:101});
 const _fly=V.fly;V.fly=function(){const a=[...arguments];if(typeof a[4]==='number')a[4]=a[4]*0.08;return _fly.apply(this,a);};});
const t0=Date.now();let st='';while(Date.now()-t0<180000){st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(0,0);}return 'bull';}
 if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const lbl=aimFor(S.p[0].score,4-S.dart);const t=targetPoint(lbl);S.busy=true;land(t.x,t.y);}return 'play';}catch(e){return 'ERR '+e.message;}});if(st!=='play'&&st!=='bull')break;await p.waitForTimeout(40);}
let rw=null;for(let i=0;i<120;i++){rw=await p.evaluate(()=>{const el=$('c3rw');return el&&!el.hidden?{v12:el.querySelectorAll('.v12rw').length,lv:C3.V3().lv,bSeen:C3.V3().bSeen}:null;});if(rw&&rw.v12)break;await p.waitForTimeout(250);}
await p.waitForTimeout(3000);await p.screenshot({path:`shots/f2_${tag}_realreward.jpg`,quality:80});
await p.evaluate(()=>{const c=document.querySelector('#c3rw .v12rw');if(c)c.scrollIntoView({block:'center'});});await p.waitForTimeout(400);await p.screenshot({path:`shots/f2_${tag}_realreward2.jpg`,quality:80});
const chip=await p.evaluate(()=>{const n0=(save.v12new||[]).slice();try{$('c3rw').hidden=true;}catch(e){}career().bank=60;showShop('barrel');const r=[...document.querySelectorAll('#shopList .opt')].find(x=>x.querySelector('.v12new'));if(r)r.scrollIntoView({block:'center'});
 return {tagged:n0,chipRows:document.querySelectorAll('#shopList .v12new').length};});
await p.waitForTimeout(600);await p.screenshot({path:`shots/f2_${tag}_newchip.jpg`,quality:80});
const after=await p.evaluate(()=>{hubTab('career');hubTab('kit');showShop('barrel');return {left:(save.v12new||[]).length,chipRows:document.querySelectorAll('#shopList .v12new').length};});
console.log(JSON.stringify({st,rw,chip,after,errs:errs.slice(0,4)}));await b.close();})();
