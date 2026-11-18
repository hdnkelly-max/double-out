// ENG-REL (fairness, Overseer 19:00): the pull start is the press event's own timeStamp, the same clock as the release.
// node tests/rel-timing.js <dir> [hayden.json]   (<dir> = a build; hayden.json = {darts:[{dt,w,gp}], hist:[{h,secs,max,s100}]} from tops_darts/tops_perf)
// A. Real input, real browser: a practice match, presses and releases sent as touch events (CDP) at exact times; just before some presses the
//    page's main thread is blocked for 60 or 120 ms (a long frame / a stall), so the press is HANDLED late but stamped on time. Each dart is
//    released exactly at the ideal pull length. Old code (TH_PRESS_NOW) must score those releases early by about the block; the new code
//    must score them within a few ms of zero, blocked or not. Also checks hp (press handler delay) is logged.
// B. Replay of Hayden's darts on his iPhone's frame profile, through the game's own startPull / pullAt / isPerfect with a controlled clock:
//    his own timing errors (darts whose press came in a normal frame) and his tonight's frame-time histograms (with his 1.3 s stalls): each
//    press lands at a random moment, so it waits for the rest of the frame (or stall) it landed in. Perfect-window hit rate, old vs new.
const {chromium,devices}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]);let H=process.argv[3]?JSON.parse(fs.readFileSync(process.argv[3],'utf8')):null;/* rows: darts [dt_ms, window_ms, rel.gp]; hist [frame_hist, max_ms, mode, match_index] */if(H&&Array.isArray(H.darts[0]))H={darts:H.darts.map(([dt,w,gp])=>({dt,w,gp})),hist:H.hist.map(([h,max,mode,mi])=>({h,max,mode,mi}))};const fails=[];const F=m=>{console.log('FAIL '+m);fails.push(m);};const O=o=>console.log(JSON.stringify(o));
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(dir,u);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(f)?'text/html':/\.js$/.test(f)?'text/javascript':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
await p.addInitScript(()=>{try{localStorage.setItem('tops_rebrand','1');localStorage.setItem('tops_q20_app','nowalk');}catch(e){}const iv=setInterval(()=>{try{if(V&&V._qa&&V._qa.renderer){V._qa.renderer.render=function(){};clearInterval(iv);}}catch(e){}},50);});
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof startPull==='function'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:300000});
await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';save.lessonDone=true;$('login').hidden=true;if(!career())newCareer();save.walkon='off';save.tcIntro=1;save.tcWelcomed=1;try{if(save.tc)delete save.tc.welPend;}catch(e){}persist();document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());playPractice();});
const atAim=async()=>{for(let i=0;i<200;i++){const s=await p.evaluate(()=>{const it=document.getElementById('intro');if(it&&it.classList.contains('show'))it.click();if(!S||S.done)return 'none';return (S.cur===0&&!S.busy&&!S.pulling&&!S.p[0].ai&&S.view!==1&&!(S.noPullUntil&&performance.now()<S.noPullUntil))?'aim':'wait';}).catch(()=>'err');if(s==='aim')return true;if(s==='none')return false;await p.waitForTimeout(100);}return false;};
const cdp=await ctx.newCDPSession(p);
// ---- A ----
const A={old:[],nw:[]};const ideal=await p.evaluate(()=>PM()*SWEET);O({idealPullMs:Math.round(ideal)});
for(const arm of ['old','nw'])for(const block of [0,60,120,0,60,120,60,120]){
 if(!(await atAim())){F('A: not at aim ('+arm+')');break;}
 await p.evaluate(old=>{window.TH_PRESS_NOW=old;},arm==='old');
 const bx=await p.locator('#pullPad').boundingBox();const x=bx.x+bx.width/2,y=bx.y+bx.height/2;
 if(block)await p.evaluate(ms=>{setTimeout(()=>{const t=performance.now();while(performance.now()-t<ms){}},0);},block);
 const t0=Date.now();const press=cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 while(Date.now()-t0<ideal)await new Promise(z=>setTimeout(z,1));const tr=Date.now();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await press;
 await p.waitForTimeout(150);const r=await p.evaluate(()=>({rel:S&&S.relMs,lag:S&&S.pressLag,perfect:S&&S.perfect})).catch(()=>null);
 if(r&&r.rel!=null)A[arm].push({block,err:Math.round(r.rel),lag:r.lag,late:tr-t0-Math.round(ideal)});await p.waitForTimeout(1200);}
await p.evaluate(()=>{window.TH_PRESS_NOW=false;});
const avg=a=>a.length?Math.round(a.reduce((s,x)=>s+x,0)/a.length):null;
for(const arm of ['old','nw']){const by={};for(const d of A[arm]){(by[d.block]=by[d.block]||[]).push(d);}
 const sum=Object.fromEntries(Object.entries(by).map(([k,v])=>[k,{n:v.length,meanErr:avg(v.map(d=>d.err)),meanPressLag:avg(v.map(d=>d.lag))}]));O({part:'A',arm:arm==='old'?'old (start = handler time)':'new (start = press timeStamp)',byBlockMs:sum});
 if(arm==='old'&&by[120]&&!(avg(by[120].map(d=>d.err))<-70))F('A: old code did not show the early bias under a 120 ms block (test not exercising the bug?)');
 if(arm==='nw')for(const [k,v] of Object.entries(by)){const m=avg(v.map(d=>d.err));if(Math.abs(m)>12)F('A: new code, '+k+' ms block: mean error '+m+' ms (want within 12 ms)');if(+k>0&&!(avg(v.map(d=>d.lag))>=+k*0.6))F('A: press handler delay not logged for a '+k+' ms block');}}
// ---- B ----
if(H){/* frame profile: his tonight's histograms. bins (ms): <9, 9-13, 13-18, 18-21, 21-26, 26-34, 34-51, 51-101, 101-200, >200; stalls: max_ms */
 const mids=[7,11,15.5,19.5,23.5,30,42.5,76,150,0];const W=[];let tot=0;for(const m of H.hist.filter(m=>m.mi===1||m.mode==='career')){m.h.forEach((c,i)=>{if(i<9&&c){W.push([mids[i],c]);tot+=c;}});/* the >200 bin: his long stalls */const big=m.h[9]||0;if(big){W.push([Math.max(250,m.max||1300)*0.6,big-1]);W.push([m.max||1300,1]);}}
 /* a press lands at a uniformly random moment: a frame of length L is hit with weight L x count; it then waits U(0, L) */
 const wsum=W.reduce((s,[L,c])=>s+L*c,0);const pickFrame=r=>{let x=r*wsum;for(const [L,c] of W){x-=L*c;if(x<=0)return L;}return W[W.length-1][0];};
 let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
 const human=H.darts.filter(d=>d.gp!=null&&d.gp<=30&&Math.abs(d.dt)<400);/* his own errors, from presses in normal frames (and no wild throws) */
 const N=4000;const trials=[];for(let i=0;i<N;i++){const h=human[Math.floor(rnd()*human.length)];const L=pickFrame(rnd());const d=rnd()*L;trials.push({e:h.dt,w:h.w,d:Math.round(d*10)/10,L});}
 const res=await p.evaluate(T=>{const ideal=PM()*SWEET;const out={old:0,nw:0,oldLong:0,nwLong:0,long:0,n:T.length};const real=performance.now.bind(performance);const pw=window.perfectWin;let clock=0;
  try{performance.now=()=>clock;for(const t of T){window.perfectWin=()=>t.w/1000;for(const arm of ['old','nw']){window.TH_PRESS_NOW=arm==='old';
     const Tp=100000;clock=Tp+t.d;S.pulling=false;S.busy=false;S.done=false;S.view=0;S.noPullUntil=0;S.breathe=false;startPull('pad',{timeStamp:Tp});
     const Tr=Tp+ideal+t.e;clock=Tr+1;S.pull=pullAt(Tr);S.over=S.pull>=1.0;const hit=isPerfect();S.pulling=false;
     if(hit)out[arm]++;if(t.L>=40){if(arm==='old')out.long++;if(hit)out[arm+'Long']++;}}}}finally{performance.now=real;window.perfectWin=pw;window.TH_PRESS_NOW=false;}return out;},trials);
 const pc=(a,b)=>b?Math.round(a/b*1000)/10:null;
 O({part:'B',replayed:res.n,humanSample:human.length,perfect:{old:pc(res.old,res.n),new:pc(res.nw,res.n)},pressesInFrames40msPlus:{n:res.long,old:pc(res.oldLong,res.long),new:pc(res.nwLong,res.long)},
   meanPressWait:Math.round(trials.reduce((s,t)=>s+t.d,0)/trials.length*10)/10});
 if(!(res.nw>=res.old))F('B: the new code scores fewer perfects than the old on the same inputs');}
if(pe.length)F('page errors: '+pe.slice(0,2).join(' | '));
await b.close();srv.close();console.log(fails.length?'REL-TIMING FAIL':'REL-TIMING PASS');process.exit(fails.length?1:0);})();
