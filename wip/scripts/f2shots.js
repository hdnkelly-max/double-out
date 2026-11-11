// F2 review shots: store barrels + kit parts at a given level and sponsor, and the level-up unlock card.
// usage: node wip/scripts/f2shots.js <tag>   (writes shots/f2_<tag>_*.jpg)
const {chromium}=require('playwright');const tag=process.argv[2]||'x';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await require('./hl.js')(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(800);
await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';$('login').hidden=true;newCareer();career().bank=420;persist();});
const shop=async(lv,sp,tab,name,scroll)=>{await p.evaluate(([lv,sp,tab,scroll])=>{const v=C3.V3();v.lv=lv;v.bSeen=lv;save.sponsor=sp||null;persist();showShop(tab);
  const sl=document.querySelector(tab==='setup'?'#setupList':'#shopList');if(sl){const sc=sl.closest('.scroll,.hub-body,main,section')||document.scrollingElement;sl.scrollIntoView({block:'start'});if(scroll)window.scrollBy(0,scroll);document.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight+40&&getComputedStyle(e).overflowY!=='visible'&&e.contains(sl)){const r=sl.getBoundingClientRect(),er=e.getBoundingClientRect();e.scrollTop+=r.top-er.top-8+(scroll||0);}});}},[lv,sp,tab,scroll||0]);
  await p.waitForTimeout(900);await p.screenshot({path:`shots/f2_${tag}_${name}.jpg`,quality:80});};
await shop(1,null,'barrel','lv1_top');
await shop(12,null,'barrel','lv12_top');
await shop(12,null,'barrel','lv12_bottom',900);
await shop(26,'rd','barrel','lv26_rd_bottom',900);
await shop(12,null,'setup','lv12_parts');
// tap a locked row to see its preview
await p.evaluate(()=>{const v=C3.V3();v.lv=12;save.sponsor=null;showShop('barrel');const r=[...document.querySelectorAll('#shopList .opt.v12lock')][0];if(r){r.scrollIntoView({block:'center'});r.click();}});await p.waitForTimeout(900);
await p.screenshot({path:`shots/f2_${tag}_locked_preview.jpg`,quality:80});
// level-up reward card: Lv 14 -> 15 opens Razor Edge
const rw=await p.evaluate(()=>{try{const v=C3.V3();v.lv=15;v.bSeen=14;let el=$('c3rw');if(!el){el=document.createElement('div');el.id='c3rw';el.className='c3rw';document.body.appendChild(el);}
  el.hidden=false;let card=el.querySelector('.c3rw-card');if(!card){card=document.createElement('div');card.className='c3rw-card';el.appendChild(card);}card.innerHTML='<div class="c3rw-act"></div>';delete card.dataset.v12;TOPS_v12Reward();return 'manual';}catch(e){return 'ERR '+e.message;}});
await p.waitForTimeout(2600);await p.screenshot({path:`shots/f2_${tag}_reward.jpg`,quality:80});
console.log('reward via',rw,'| page errors:',errs.slice(0,5).join(' || ')||'none');
await b.close();})();
