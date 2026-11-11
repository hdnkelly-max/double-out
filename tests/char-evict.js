// #15 hardening: character templates nobody uses are freed after each opponent is set, and come back when needed.
// node tests/char-evict.js [dir] -> PASS/FAIL. Sets four opponents with different characters in turn (as successive matches do),
// then checks the loaded templates are only those in use (player, current opponent, live extras, remy), that a freed template
// reloads when that opponent comes back, and no page errors.
const {chromium}=require('playwright');const path=require('path');(async()=>{const dir=process.argv[2]?path.resolve(process.argv[2]):path.resolve(__dirname,'..');
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844},screen:{width:390,height:844},isMobile:true,hasTouch:true});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:180000});
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';$('login').hidden=true;newCareer();});await p.waitForTimeout(2000);
const snap=()=>p.evaluate(()=>{const d=V._qa.gfx();const live=new Set(['remy']);if(d.me)live.add(d.me);(d.extras||[]).forEach(e=>live.add(String(e).split(':')[0]));
  const opp=V._qa.opp&&V._qa.opp();if(opp&&opp.userData&&opp.userData.ck)live.add(opp.userData.ck);
  return {rigs:d.rigs,live:[...live],extra:d.rigs.filter(k=>!live.has(k)),freed:window.__charsFreed||0,oppCk:opp&&opp.userData&&opp.userData.ck};});
const names=['Pete the Plumber','Shazza','Tama Rewiri','Kev Marsh','Pete the Plumber'];const out=[];
for(const n of names){await p.evaluate(n=>{V.setOpponentLook({},n,1);},n);await p.waitForTimeout(9000);await p.evaluate(n=>{V.setOpponentLook({},n,1);},n);await p.waitForTimeout(1500);out.push(Object.assign({opp:n},await snap()));}
const last=out[out.length-1];const pass=last.freed>=1&&out.every(o=>o.extra.length===0)&&last.rigs.includes(last.oppCk)&&!pe.length;
const r={out,pe:pe.slice(0,3)};
console.log('char-evict',pass?'PASS':'FAIL',JSON.stringify(r));await b.close();process.exit(pass?0:1);})();
