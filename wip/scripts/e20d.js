// R0 #20 inventory (render stubbed): Hayden's 3.05 path (lose match 1 -> reward Continue -> message -> pack Later -> hub -> Go -> match 2).
// At the player's aim in each match: DOM nodes by signature (diffed match 2 vs match 1), live intervals with their creator (stack), running CSS
// animations by name+target, the clip cache. node e20d.js <dir>
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2];const T0=Date.now();
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{window.__IV=new Map();const si=setInterval,ci=clearInterval;window.setInterval=function(f,ms){const id=si.apply(this,arguments);const st=(new Error().stack||'').split('\n').slice(2,4).map(l=>l.trim().replace(/^at /,'').replace(/file:\/\/[^ )]*index\.html/,'L')).join(' < ');__IV.set(id,{ms,st,src:String(f).slice(0,70)});return id;};window.clearInterval=function(id){__IV.delete(id);return ci.apply(this,arguments);};
 const st=setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.3),...a);});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;showHub();});
const click=sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(e&&e.getClientRects().length&&!e.disabled){e.click();return true;}return false;},sel);
const ev=(f,a)=>p.evaluate(f,a);
const snap=tag=>ev(tag=>{const sig=e=>{let s=e.tagName.toLowerCase();if(e.id)s+='#'+e.id;else if(typeof e.className==='string'&&e.className.trim())s+='.'+e.className.trim().split(/\s+/)[0];return s;};
 const top={};document.querySelectorAll('body > *').forEach(e=>{const k=sig(e)+(e.hidden?'[hidden]':'')+(getComputedStyle(e).display==='none'?'[none]':'');top[k]=(top[k]||0)+e.getElementsByTagName('*').length+1;});
 const deep={};document.querySelectorAll('body *').forEach(e=>{const pa=e.parentElement;if(!pa)return;const k=sig(pa)+'>'+sig(e)+(e.closest('[hidden]')?'[h]':'');deep[k]=(deep[k]||0)+1;});
 const an=document.getAnimations().filter(a=>a.playState==='running').map(a=>{const t=a.effect&&a.effect.target;return (a.animationName||a.constructor.name)+'@'+(t?sig(t):'?');});
 return {tag,deep,dom:document.getElementsByTagName('*').length,top,anims:an,intervals:[...__IV.values()].map(v=>v.ms+'ms '+v.st),animCache:window.TOPS_RIGS?TOPS_RIGS().anim:null};},tag);
const toAim=async()=>{for(let i=0;i<600;i++){const st=await ev(()=>{try{const w=document.getElementById('tcWalk');if(w&&!w.classList.contains('out')){w.click();return 'walk';}if(!S)return 'nos';if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim'||st.startsWith('ERR'))return st;
 if(st==='nos'||st==='done'){for(const s of ['#msgReplies button','.tc-sheet .tc-x','.tc-sheet button','#tcPLater','.tcpk__later','#c3Go'])if(await click(s))break;}await p.waitForTimeout(150);}return 'timeout';};
const play=async()=>{for(let i=0;i<4000;i++){const st=await ev(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
  S.p[1].score=Math.min(S.p[1].score,40);if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){S.busy=true;land(400,400);}return 'play';}catch(e){return 'ERR '+e.message;}});if(st==='done'||st.startsWith('ERR'))return st;await p.waitForTimeout(40);}return 'timeout';};
const path=[];const toHub=async()=>{for(let i=0;i<90;i++){const at=await ev(()=>!$('hub').hidden&&!document.querySelector('#c3rw:not([hidden])')&&!document.querySelector('div.tcpk')&&$('msg').hidden!==false&&!(S&&!S.done));if(at)return true;
 for(const s of ['#tcPLater','.tcpk__later','#btnPerkLater','#msgReplies button','#c3rwGo','#btnResultNext','#btnResAction']){if(await click(s)){path.push(s);break;}}await p.waitForTimeout(400);}return false;};
const a1=await toAim();await p.waitForTimeout(1500);const s1=await snap('match 1 at aim '+a1);
await play();const hub=await toHub();await p.waitForTimeout(1500);const sh=await snap('hub');
const a2=await toAim();await p.waitForTimeout(1500);const s2=await snap('match 2 at aim '+a2);
const diff=(a,b)=>{const o={};new Set([...Object.keys(a),...Object.keys(b)]).forEach(k=>{const d=(b[k]||0)-(a[k]||0);if(d)o[k]=d;});return o;};
console.log('e20d',JSON.stringify({path,hub,dom:[s1.dom,sh.dom,s2.dom],topDiff_m2_vs_m1:diff(s1.top,s2.top),deepDiff:Object.fromEntries(Object.entries(diff(s1.deep,s2.deep)).filter(([k,v])=>Math.abs(v)>=3)),a2,anims:{m1:s1.anims,m2:s2.anims},intervals:{n:[s1.intervals.length,sh.intervals.length,s2.intervals.length],m2:s2.intervals},animCache:[s1.animCache,s2.animCache],secs:(Date.now()-T0)/1000|0,pe:pe.slice(0,3)},null,1));await b.close();})();
