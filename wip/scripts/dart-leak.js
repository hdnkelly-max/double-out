// #15b: GPU memory per dart thrown, over one full unclamped match (real throw paths: land() for the player,
// the AI's own fly()+land()). node wip/scripts/dart-leak.js <dir> [visits=24]
// Reads renderer.info geometries/textures at the start of each of the player's visits (clearDarts has just run there),
// so on a build that frees darts the count stays flat; on one that doesn't it climbs with every dart.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],VIS=+(process.argv[3]||24);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},hasTouch:true,isMobile:true});
const p=await ctx.newPage();await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.addInitScript(()=>{const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,Math.max(0,(ms||0)*0.06),...a);});
await p.goto('file://'+dir+'/index.html');
await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function',null,{timeout:180000});
for(let i=0;i<120;i++){const ok=await p.evaluate(()=>!!(typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady())).catch(()=>false);if(ok)break;await p.waitForTimeout(500);}
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';$('login').hidden=true;newCareer();save.tcIntro=Date.now();save.tcWelcomed=Date.now();document.querySelectorAll('.tc-sheet').forEach(e=>e.remove());V.walkOn=()=>{};
 window.__darts=0;const L=window.land;window.land=function(){window.__darts++;return L.apply(this,arguments);};
 beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:'deano',oppName:'Deano',oppAvg:60,legs:5,start:501});});
const mem=()=>p.evaluate(()=>{const R=V._qa.renderer.info.memory;return {geo:R.geometries,tex:R.textures,darts:window.__darts};});
const rows=[];let lastTurn=-1;const t0=Date.now();
while(rows.length<VIS&&Date.now()-t0<240000){const st=await p.evaluate(()=>{try{if(S.done)return 'done';if(S.bull){if(S.cur===0&&!S.busy&&S.bull.me==null){S.busy=true;land(gauss()*30,gauss()*30);}return 'bull';}
  if(S.cur===0&&!S.busy&&S.visit.length<3&&!S.p[0].ai){return S.visit.length===0?'visit:'+S.turnN:'aim';}return 'wait';}catch(e){return 'ERR '+e.message;}});
 if(st==='done'||st.startsWith('ERR')){rows.push({end:st});break;}
 if(st.startsWith('visit:')){const n=+st.slice(6);if(n!==lastTurn){lastTurn=n;await p.waitForTimeout(150);const m=await mem();m.visit=rows.length+1;rows.push(m);}}
 if(st.startsWith('visit:')||st==='aim')await p.evaluate(()=>{try{if(S.cur===0&&!S.busy&&S.visit.length<3){const t=targetPoint(aimFor(S.p[0].score,4-S.dart));S.busy=true;land(t.x+gauss()*14,t.y+gauss()*14);}}catch(e){}});
 await p.waitForTimeout(60);}
const r=rows.filter(x=>x.geo!=null);const a=r[1]||r[0],z=r[r.length-1];const dd=Math.max(1,z.darts-a.darts);
console.log('dart-leak',JSON.stringify({visits:r.length,dartsThrown:z.darts-a.darts,geo:[a.geo,z.geo],tex:[a.tex,z.tex],geoPerDart:+((z.geo-a.geo)/dd).toFixed(2),texPerDart:+((z.tex-a.tex)/dd).toFixed(2),trace:r.map(x=>x.geo+'/'+x.tex+'@'+x.darts).join(' '),end:rows.filter(x=>x.end).map(x=>x.end),pe:pe.slice(0,2)}));await b.close();})();
