// F6/F7: towel + mullet on every character model, front three-quarter and back. usage: node wip/scripts/f67models.js <tag>
const {chromium}=require('playwright');const tag=process.argv[2]||'x';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await require('./scripts/hl.js')(p);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(/wear|mullet|towel/i.test(m.text()))errs.push(m.type()+' '+m.text());});
await p.goto('file://'+require('path').resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
await p.evaluate(()=>{save.authSeen=true;save.name='Hayden';$('login').hidden=true;newCareer();persist();TC_API.grant('wear_towel');TC_API.grant('wear_mullet');TC_API.equip('wear_towel');TC_API.equip('wear_mullet');});
await p.evaluate(async(MS)=>{for(const m of MS){try{V.heroShot(Object.assign({},save.look,{model:m,_w:1}),save.name,0);}catch(e){}}},(process.env.MODELS||'brian,lewis,megan').split(','));await p.waitForTimeout(9000);
const M=(process.env.MODELS||'brian,lewis,megan').split(',');const fs=require('fs');
for(const m of M){const out=await p.evaluate(async(m)=>{const r=[];for(const c of [[-1.25,.14,-1.4,-.16],[.9,.12,1.5,-.12]]){window.__HCAM=c;let u='';for(let k=0;k<40&&!u.startsWith('data:image/png');k++){try{u=V.heroShot(Object.assign({},save.look,{model:m,_v:Math.random()}),save.name,0)||'';}catch(e){u='ERR '+e.message;}if(!u.startsWith('data:image/png'))await new Promise(z=>setTimeout(z,500));}r.push(u);}window.__HCAM=null;return r;},m);
 out.forEach((u,i)=>{if(u.startsWith('data:image'))fs.writeFileSync(`shots/f67m_${tag}_${m}_${i}.png`,Buffer.from(u.split(',')[1],'base64'));else errs.push(m+' '+u.slice(0,60));});}
console.log(JSON.stringify({errs:errs.slice(0,8)}));await b.close();})();
