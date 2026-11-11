// Level-up flight reward, functional checks (ChatGPT 00:14): node rewardflow.js <dir> -> PASS/FAIL
// 1. "Equip new flights" equips the colour and the dart shows it; 2. "Keep current flights" leaves the loadout alone but the colour stays available;
// 3. tapping through the first level-up stage can't hit the Equip button underneath.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2];
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message+' @ '+String(e.stack||'').split('\n').slice(1,3).join(' | ').slice(0,300)));
await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined'&&window.C3,null,{timeout:180000});await p.waitForTimeout(1500);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;$('login').hidden=true;newCareer();V.walkOn=()=>{};const n=nextOpponent();beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:n.oppKey,oppName:n.oppName,oppAvg:50,legs:1});});
await p.waitForTimeout(8000);
const TEAL='#00c2a8';
const show=(first)=>p.evaluate(([T,first])=>{const v=C3.V3(),c=career();save.lvFirstSeen=!first;document.querySelectorAll('#lvFirst').forEach(e=>e.remove());const el=document.getElementById('c3rw');if(el){el.hidden=true;el.classList.remove('on');}
 {const nb=document.getElementById('btnResultNext');if(nb&&!nb.dataset.dummy){const d=nb.cloneNode(true);d.dataset.dummy=1;nb.replaceWith(d);}}/* outside a finished match there's no result to go on to */
 C3.showRewardTest({before:{lv:v.lv,xp:v.xp,bank:c.bank,fame:v.fame},after:{lv:v.lv+1,xp:40,bank:c.bank,fame:v.fame},L:[['Match played',300]],xp:300,ups:[{lv:v.lv+1,k:'flight',v:T,n:'Teal flights',big:1}],done:[],m:{won:true},cash:0,ranked:false});},[TEAL,first]);
const r={};const start=await p.evaluate(()=>({flight:save.flight,custom:!!save.flightCustom}));
// 3. first level-up: the stage covers the card; tap where the Equip button is
await show(true);await p.waitForTimeout(1200);await p.evaluate(()=>{const c=document.querySelector('.c3rw-card');if(c)c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));});await p.waitForTimeout(1200);
const stage=await p.evaluate(()=>!!document.getElementById('lvFirst'));
const go=await p.evaluate(()=>{const g=document.getElementById('c3rwGo');const q=g&&g.getBoundingClientRect();return q?{x:q.x+q.width/2,y:q.y+q.height/2}:null;});
if(stage&&go){await p.mouse.click(go.x,go.y);await p.waitForTimeout(150);}
r.stageShown=stage;r.tapThroughSafe=await p.evaluate(s=>save.flight===s,start.flight);
await p.waitForTimeout(600);
// 2. keep current
r.keepBtn=await p.evaluate(()=>{const k=document.getElementById('c3rwKeep');return !!(k&&k.offsetParent);});
if(r.keepBtn){await p.click('#c3rwKeep');await p.waitForTimeout(400);}
r.keepLeavesLoadout=await p.evaluate(s=>save.flight===s.flight&&!!save.flightCustom===s.custom,start);
r.colourStaysAvailable=await p.evaluate(()=>{const v=C3.V3();const lv0=v.lv;v.lv=Math.max(lv0,14);const l=C3.lvFlights();v.lv=lv0;return l.includes('#00c2a8');});
// 1. equip
await show(false);await p.waitForTimeout(1200);await p.evaluate(()=>{const c=document.querySelector('.c3rw-card');if(c)c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));});await p.waitForTimeout(800);
r.equipBtn=await p.evaluate(()=>{const g=document.getElementById('c3rwGo');return g?g.textContent.trim():null;});
if(r.equipBtn){await p.click('#c3rwGo');await p.waitForTimeout(400);}
r.equipped=await p.evaluate(T=>save.flight===T&&save.flightCustom===true,TEAL);
r.dartShowsIt=await p.evaluate(T=>{const parts=Object.assign({barrel:barrel()},setupParts());return V.dartShot(save.flight,parts)===V.dartShot(T,Object.assign({},parts,{custom:true}));},TEAL);
const pass=r.stageShown&&r.tapThroughSafe&&r.keepBtn&&r.keepLeavesLoadout&&r.colourStaysAvailable&&r.equipped&&r.dartShowsIt&&!pe.length;
console.log('rewardflow',pass?'PASS':'FAIL',JSON.stringify(r),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
