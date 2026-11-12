// ENG-5 (#16 follow-up): nothing you can't see keeps animating during a match, and the fixes change nothing you can see.
// node tests/standing-cost.js [dir] -> PASS / FAIL. iPhone UA, rendering stubbed, a career match at the player's aim.
//  1 no infinite CSS animation runs on an element that is invisible (display:none, visibility:hidden or opacity 0 on it or an ancestor)
//    (live 2.09: the loading bar animates `left` under #loading.gone at opacity 0, and #grain's 6-step animation under opacity 0)
//  2 layout and style recalcs per 5 s at aim (reported, plus the loading screen's state)
//  3 Vape Cloud fog unchanged: on -> visible, opacity 1, 10px backdrop blur, drifting; off -> still visible mid-fade (200 ms), hidden after it (700 ms)
//  4 the hub's film grain still animates where it shows (tier 2 hub, not in a match)
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));const cdp=await ctx.newCDPSession(p);
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.waitForFunction(()=>{const l=document.getElementById('loading');return !l||l.classList.contains('gone');},null,{timeout:30000});
await p.waitForTimeout(1200);
const invisibleAnims=()=>p.evaluate(()=>{const inv=e=>{for(let q=e;q&&q.nodeType===1;q=q.parentElement){const cs=getComputedStyle(q);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return true;}return false;};
 return document.getAnimations().filter(a=>a.playState==='running'&&a.effect&&a.effect.target&&a.effect.getComputedTiming().iterations===Infinity&&inv(a.effect.target))
  .map(a=>{const t=a.effect.target;return (t.id?'#'+t.id:t.tagName.toLowerCase()+(t.className&&typeof t.className==='string'?'.'+t.className.trim().split(/\s+/)[0]:''))+(a.effect.pseudoElement||'')+' '+(a.animationName||'');});});
// 4 hub grain (before any match)
const hubGrain=await p.evaluate(()=>{V._qa.renderer.render=function(){};save.authSeen=true;save.name='Lee';save.lessonDone=true;$('login').hidden=true;newCareer();save.tcIntro=1;save.tcWelcomed=1;document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());showHub();
 document.body.dataset.tier='2';const g=document.getElementById('grain');const cs=getComputedStyle(g);return {opacity:cs.opacity,running:g.getAnimations().filter(a=>a.playState==='running').length,lkMatch:document.body.classList.contains('lk-match')};});
// match at aim
await p.evaluate(()=>{V.walkOn=()=>{};beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:'Carl Maddox',oppName:'Carl Maddox',oppAvg:40,legs:3,start:501});});
for(let i=0;i<600;i++){const st=await p.evaluate(()=>{try{if(!S)return 'nos';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}if(S.cur===0&&!S.busy&&!S.p[0].ai)return 'aim';return 'wait';}catch(e){return 'ERR '+e.message;}});if(st==='aim'||st.startsWith('ERR'))break;await p.waitForTimeout(100);}
await p.waitForTimeout(1500);
const inv=await invisibleAnims();
await cdp.send('Performance.enable');const g=(a,k)=>(a.find(x=>x.name===k)||{}).value||0;const m0=(await cdp.send('Performance.getMetrics')).metrics;await p.waitForTimeout(5000);const m1=(await cdp.send('Performance.getMetrics')).metrics;
const cost={layouts:g(m1,'LayoutCount')-g(m0,'LayoutCount'),layoutMs:+((g(m1,'LayoutDuration')-g(m0,'LayoutDuration'))*1000).toFixed(0),styles:g(m1,'RecalcStyleCount')-g(m0,'RecalcStyleCount'),styleMs:+((g(m1,'RecalcStyleDuration')-g(m0,'RecalcStyleDuration'))*1000).toFixed(0)};
const loading=await p.evaluate(()=>{const l=document.getElementById('loading');if(!l)return null;const cs=getComputedStyle(l);return {cls:l.className,opacity:cs.opacity,visibility:cs.visibility,lkMatch:document.body.classList.contains('lk-match')};});
// 3 fog
const fogState=()=>p.evaluate(()=>{const f=document.getElementById('cardFog');const cs=getComputedStyle(f);return {visibility:cs.visibility,opacity:+(+cs.opacity).toFixed(2),blur:cs.backdropFilter||cs.webkitBackdropFilter,drift:f.getAnimations().filter(a=>a.playState==='running').map(a=>a.animationName).join(',')};});
const fogOff0=await fogState();
await p.evaluate(()=>document.body.classList.add('card-fog'));await p.waitForTimeout(700);const fogOn=await fogState();
await p.evaluate(()=>document.body.classList.remove('card-fog'));await p.waitForTimeout(200);const fogMid=await fogState();await p.waitForTimeout(500);const fogOff=await fogState();
const fails=[];
if(inv.length)fails.push('animations running on invisible elements: '+inv.join(', '));
if(!(fogOn.visibility==='visible'&&fogOn.opacity===1&&/blur\(10px\)/.test(fogOn.blur)&&/vapeDrift/.test(fogOn.drift)))fails.push('fog on looks different: '+JSON.stringify(fogOn));
if(fogMid.visibility!=='visible'||!(fogMid.opacity>0&&fogMid.opacity<1))fails.push('fog fade-out cut short: '+JSON.stringify(fogMid));
if(!(fogOff.opacity===0))fails.push('fog not off after its fade: '+JSON.stringify(fogOff));
if(!(+hubGrain.opacity>0&&hubGrain.running>0))fails.push('hub film grain not animating where it shows: '+JSON.stringify(hubGrain));
if(pe.length)fails.push('page errors: '+pe.slice(0,2).join(' | '));
console.log('standing-cost',fails.length?'FAIL':'PASS',JSON.stringify({fails,invisible:inv,cost,loading,fog:{off0:fogOff0,on:fogOn,mid:fogMid,off:fogOff},hubGrain}));await b.close();process.exit(fails.length?1:0);})();
