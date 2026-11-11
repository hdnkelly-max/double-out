// P6: on-screen text size in the pack flow (deal, pick, summary) + the welcome's Later button.
// node p6pack.js <dir> <w> <h> <tag>. Effective size = computed font-size x the element's on-screen scale
// (pack cards are shrunk with transforms, which computed font-size ignores). Uses real fonts if /home/claude/fonts/fonts_local.css exists.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],w=+process.argv[3],h=+process.argv[4],tag=process.argv[5]||'p6p';
const out=require('path').resolve(__dirname,'../shots')+'/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:w,height:h},hasTouch:w<600,isMobile:w<600});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');
if(process.env.FONTS!=='fallback'){try{await p.addStyleTag({content:require('fs').readFileSync('/home/claude/fonts/fonts_local.css','utf8')});}catch(e){}}
await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);
const clickSel=async sel=>{const q=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};},sel);if(q){await p.mouse.click(q.x,q.y);return true;}return false;};
const measure=(root)=>p.evaluate(root=>{const res=[];document.querySelectorAll(root+' *').forEach(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim();if(!own)return;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return;const r=e.getBoundingClientRect();if(!r.width||r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)return;
  let op=1;for(let a=e;a&&a!==document.body;a=a.parentElement)op*=+getComputedStyle(a).opacity;if(op<.5)return; /* dimmed 'missed' cards (opacity .28) are decorative */
  const sc=e.offsetHeight?r.height/e.offsetHeight:1;const pl=e.closest('.tc__plate');const pb=pl&&pl.getBoundingClientRect();const clip=!!pb&&(r.right>pb.right+1||(/tc__name/.test(e.className)&&e.scrollHeight>e.clientHeight+2));const fs=parseFloat(cs.fontSize)*sc;res.push({cls:String(e.className).slice(0,26),txt:own.slice(0,20),fs:+fs.toFixed(1),op:+op.toFixed(2),clip});});
 const seen={};return res.filter(x=>{const k=x.cls+'|'+x.fs;if(seen[k])return false;seen[k]=1;return true;});},root);
const r={};
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();delete save.tcIntro;showHub();});
await p.waitForSelector('.tc-welcome',{timeout:15000}).catch(()=>{});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
r.later=await p.evaluate(()=>{const e=document.getElementById('tcWelLater');if(!e)return null;const q=e.getBoundingClientRect();return {h:q.height|0,w:q.width|0,fs:parseFloat(getComputedStyle(e).fontSize)};});
r.welcome=(await measure('.tc-welcome')).filter(x=>x.fs<11);
await clickSel('#tcWelGo');await p.waitForSelector('.tcpk',{timeout:15000}).catch(()=>{});await p.waitForTimeout(2500);
await p.screenshot({path:out+tag+'_deal.png'});r.deal=(await measure('.tcpk')).filter(x=>x.fs<11);
// pick the middle card
const cards=await p.$$('.tcpk__row .tc');if(cards[1]){const bb=await cards[1].boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);}
await p.waitForTimeout(3500);await p.screenshot({path:out+tag+'_pick.png'});r.pick=(await measure('.tcpk')).filter(x=>x.fs<11);
// continue through the remaining picks to the summary
r.steps=[];
for(let i=0;i<30;i++){
 const st=await p.evaluate(()=>{const v=s=>{const e=document.querySelector(s);return !!e&&!e.hidden&&getComputedStyle(e).display!=='none';};return {next:v('.tcpk__next'),nextTxt:(document.querySelector('.tcpk__next')||{}).textContent,sum:v('.tcpk__summary'),fresh:document.querySelectorAll('.tcpk__row .tc:not(.is-hero):not(.is-behind)').length};});
 r.steps.push(st);if(st.sum)break;
 if(st.next){await clickSel('.tcpk__next');await p.waitForTimeout(3000);continue;}
 if(st.fresh){const cs=await p.$$('.tcpk__row .tc:not(.is-hero):not(.is-behind)');const bb=await cs[Math.min(1,cs.length-1)].boundingBox();if(bb)await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(3500);continue;}
 await p.waitForTimeout(1500);}
r.summaryShown=await p.evaluate(()=>{const s=document.querySelector('.tcpk__summary');return !!s&&!s.hidden;});
if(r.summaryShown){r.layout=await p.evaluate(()=>{const s=document.querySelector('.tcpk__summary');const kids=[...s.parentElement.children].map(e=>{const q=e.getBoundingClientRect();return e.className.slice(0,22)+':'+(q.top|0)+'-'+(q.bottom|0)+(getComputedStyle(e).display==='none'||e.hidden?'(h)':'');});const ins=[...s.children].map(e=>{const q=e.getBoundingClientRect();return e.className.slice(0,18)+':'+(q.top|0)+'-'+(q.bottom|0);});return {parent:s.parentElement.className.slice(0,30),kids,ins,ph:getComputedStyle(s.parentElement).paddingTop};});await p.screenshot({path:out+tag+'_summary.png'});r.summary=(await measure('.tcpk__summary')).filter(x=>x.fs<11||x.clip);}
const pass=r.later&&r.later.h>=44&&!r.welcome.length&&!r.deal.length&&!r.pick.length&&(!r.summary||!r.summary.length)&&!pe.length;
console.log(tag,pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
