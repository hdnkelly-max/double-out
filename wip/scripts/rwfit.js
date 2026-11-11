// Bug: the career match-reward screen (.c3rw) can't show its top on a phone when the card is taller than the screen
// (bottom sheet with align-items:flex-end and no scroll: the overflow goes off the top, out of reach).
// Plays one short career leg to a win with rewards (sped-up timers, like regress.js), then checks:
//  - the top of the card (result + score) can be brought on screen, and the last button (Continue / Keep current) too
//  - the screen opens showing the top of the card (the result), not the middle
// node rwfit.js <dir> [w] [h] [tag]   -> PASS/FAIL; FONTS=fallback skips the real fonts
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],w=+(process.argv[3]||390),h=+(process.argv[4]||844),tag=process.argv[5]||'rwfit';
const out=require('path').resolve(__dirname,'../shots')+'/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:w,height:h},hasTouch:w<600,isMobile:w<600});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.06),...a);});
await p.goto('file://'+dir+'/index.html');
if(process.env.FONTS!=='fallback'){try{await p.addStyleTag({content:require('fs').readFileSync('/home/claude/fonts/fonts_local.css','utf8')});}catch(e){}}
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function',null,{timeout:180000});await p.waitForTimeout(2500);
const setup=await p.evaluate(()=>{try{save.authSeen=true;save.name='Lee';$('login').hidden=true;newCareer();save.tcIntro=Date.now();save.tcWelcomed=Date.now();const n=nextOpponent();V.walkOn=()=>{};
 beginMatch({mode:'career',tier:0,p0:'Lee',oppKey:n.oppKey,oppName:n.oppName,oppAvg:30,legs:1,start:101});
 const _fly=V.fly;V.fly=function(){const a=[...arguments];if(typeof a[4]==='number')a[4]=a[4]*0.08;return _fly.apply(this,a);};return 'ok';}catch(e){return 'setup '+e.message;}});
if(setup!=='ok'){console.log(tag,'FAIL',setup);await b.close();process.exit(1);}
const t0=Date.now();let st='';
while(Date.now()-t0<240000){st=await p.evaluate(()=>{try{if(S.done)return 'done';
  if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
  if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){const me=S.p[0];S.busy=true;const t=targetPoint(aimFor(me.score,4-S.dart));land(t.x+gauss()*3,t.y+gauss()*3);}
  return 'play';}catch(e){return 'ERR '+e.message;}});
 if(st==='done'||st.startsWith('ERR'))break;await p.waitForTimeout(40);}
let shown=false;for(let i=0;i<120&&!shown;i++){shown=await p.evaluate(()=>{const o=document.getElementById('c3rw');return !!o&&!o.hidden&&getComputedStyle(o).display!=='none'&&!!o.querySelector('.c3rw-card');});
 if(!shown){await p.evaluate(()=>{document.querySelectorAll('.tc-sheet,.cd-wrap').forEach(e=>e.remove());});await p.waitForTimeout(500);}}
const r={st,shown,w,h};
if(shown){await p.waitForTimeout(2000);
 // what the player sees when it opens
 r.open=await p.evaluate(()=>{const o=document.getElementById('c3rw'),c=o.querySelector('.c3rw-card'),res=o.querySelector('.c3rw-top')||o.querySelector('#c3rwRes');const q=c.getBoundingClientRect(),t=res.getBoundingClientRect();return {cardH:q.height|0,cardTop:q.top|0,resTop:t.top|0,resBottom:t.bottom|0,scrolls:o.scrollHeight>o.clientHeight+1,ov:getComputedStyle(o).overflowY};});
 await p.screenshot({path:out+tag+'_open.png',timeout:120000});
 r.unl=await p.evaluate(()=>{const u=document.getElementById('c3rwUnl');if(!u||u.hidden)return null;const sm=u.querySelector(':scope>small'),im=u.querySelector('.ri');return {dart:u.classList.contains('is-dart'),img:im?im.className:'',smallW:sm?sm.getBoundingClientRect().width|0:0,tileW:u.getBoundingClientRect().width|0,smallLines:sm?Math.round(sm.getBoundingClientRect().height/parseFloat(getComputedStyle(sm).lineHeight||16)):0,smallH:sm?sm.getBoundingClientRect().height|0:0};});
 // try to reach the top: scroll every scroller to 0, then where is the result?
 r.top=await p.evaluate(()=>{const o=document.getElementById('c3rw');[o,...o.querySelectorAll('*')].forEach(e=>{if(e.scrollHeight>e.clientHeight)e.scrollTop=0;});const t=(o.querySelector('.c3rw-top')||o.querySelector('#c3rwRes')).getBoundingClientRect();const hi=o.querySelector('.rwhero');const hr=hi&&getComputedStyle(hi).display!=='none'?hi.getBoundingClientRect():null;return {resTop:t.top|0,onScreen:t.top>=0&&t.bottom<=innerHeight,hero:hr?{top:hr.top|0,h:hr.height|0}:null,heroWhole:!hr||hr.top>=-1};});
 // and the bottom: scroll to the end, then where are the buttons?
 r.bottom=await p.evaluate(()=>{const o=document.getElementById('c3rw');[o,...o.querySelectorAll('*')].forEach(e=>{if(e.scrollHeight>e.clientHeight)e.scrollTop=e.scrollHeight;});const bs=[...o.querySelectorAll('.c3rw-act button, .c3rw-act a')].filter(x=>x.offsetParent||x.getClientRects().length);const last=bs[bs.length-1];const q=last&&last.getBoundingClientRect();return {n:bs.length,lastTxt:last&&last.textContent.trim().slice(0,22),lastBottom:q&&q.bottom|0,onScreen:!!q&&q.top>=0&&q.bottom<=innerHeight};});
 await p.screenshot({path:out+tag+'_end.png',timeout:120000});
 // rule 22: text under 11px and taps under 44px anywhere in the reward card (scrolled through)
 r.small={};r.taps=[];{const o0=await p.evaluate(()=>document.getElementById('c3rw').scrollHeight);for(let y=0;y<o0;y+=Math.max(200,h-100)){await p.evaluate(y=>{document.getElementById('c3rw').scrollTop=y;},y);await p.waitForTimeout(150);
  const m=await p.evaluate(()=>{const res={};const o=document.getElementById('c3rw');o.querySelectorAll('*').forEach(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();if(!own)return;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.3)return;const q=e.getBoundingClientRect();if(!q.width||q.bottom<0||q.top>innerHeight)return;const fs=parseFloat(cs.fontSize);if(fs<11)res[own.slice(0,20)+'@'+fs]=String(e.className).slice(0,18);});
   const taps=[...o.querySelectorAll('button,a,[role=button]')].filter(e=>{const q=e.getBoundingClientRect();return q.width&&q.bottom>0&&q.top<innerHeight&&(q.height<44||q.width<44);}).map(e=>e.textContent.trim().slice(0,18)+'@'+(e.getBoundingClientRect().width|0)+'x'+(e.getBoundingClientRect().height|0));return {res,taps};});
  Object.assign(r.small,m.res);m.taps.forEach(t=>{if(!r.taps.includes(t))r.taps.push(t);});}}
}
const pass=r.shown&&r.open.resTop>=0&&r.top.onScreen&&r.top.heroWhole&&r.bottom.onScreen&&!pe.length;
console.log(tag,pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
