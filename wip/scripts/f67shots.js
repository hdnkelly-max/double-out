// F6/F7 review shots: towel + mullet on the player (loadout + front/back hero renders, two body models) and the 3D cabinet.
// usage: node wip/scripts/f67shots.js <tag>
const {chromium}=require('playwright');const tag=process.argv[2]||'x';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await require('./hl.js')(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='warning'&&/wear|cab/i.test(m.text()))errs.push('warn '+m.text());});
await p.goto('file://'+require('path').resolve(__dirname,'../../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
const r1=await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';$('login').hidden=true;newCareer();persist();try{TC_API.grant('wear_towel');TC_API.grant('wear_mullet');TC_API.equip('wear_towel');TC_API.equip('wear_mullet');}catch(e){return 'ERR '+e.message;}return JSON.stringify(save.look&&save.look.tkit||(TC_API.st().tkit)||null);});
await p.waitForTimeout(2500);
// hero renders front / back / three-quarter for two body models
const shots=await p.evaluate(async()=>{const out=[];const cams=[[-1.25,.14,-1.4,-.16],[1.6,.1,.2,-.12],[.9,.12,1.5,-.12],[-1.6,.1,-.1,-.12]];
 const models=['',...((window.CHARS||[]).filter(c=>c!==save.look.model).slice(0,1))];
 let k=0;for(const m of models){for(const c of cams){window.__HCAM=c;const lk=Object.assign({},save.look,m?{model:m}:{},{_v:k++});try{out.push(V.heroShot(lk,save.name,0));}catch(e){out.push('ERR '+e.message);}}}window.__HCAM=null;return out;});
const fs=require('fs');shots.forEach((u,i)=>{if(u&&u.startsWith('data:image'))fs.writeFileSync(`shots/f67_${tag}_hero${i}.png`,Buffer.from(u.split(',')[1],'base64'));});
await p.evaluate(()=>{try{TC_API.loadout();}catch(e){}});await p.waitForTimeout(2500);await p.screenshot({path:`shots/f67_${tag}_loadout.jpg`,quality:80});
const r2=await p.evaluate(()=>{try{for(let t=0;t<7;t++)TC_API.addTrophy(t);}catch(e){return 'trophy ERR '+e.message;}try{document.querySelectorAll('.tc-modal,.tc-sheet').forEach(x=>x.hidden=true);TC_API.cabinet();}catch(e){return 'cab ERR '+e.message;}return 'ok';});
await p.waitForTimeout(4000);await p.screenshot({path:`shots/f67_${tag}_cabinet.jpg`,quality:80});
const perf=await p.evaluate(()=>new Promise(res=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else res((n/2).toFixed(1));};requestAnimationFrame(f);}));
console.log(JSON.stringify({equip:r1,heroes:shots.map(s=>s.slice(0,30)),cab:r2,fps:perf,errs:errs.slice(0,6)}));await b.close();})();
