// Whole board view removed (Hayden 22:59): zoomed in is the only view, even for a save that chose "Whole board".
// node nowhole.js <dir> [w h]  -> PASS/FAIL
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2],w=+(process.argv[3]||390),h=+(process.argv[4]||844);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
const boot=async()=>{await p.goto('file://'+dir+'/index.html');await p.waitForFunction(()=>window.TC_API&&typeof S!=='undefined',null,{timeout:180000});await p.waitForTimeout(1500);};
await boot();
// a save that picked "Whole board" on an older version
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';save.matches=5;save.boardZoom=false;persist();});
await p.waitForTimeout(300);await boot();
const r=await p.evaluate(()=>{$('login').hidden=true;try{newCareer();}catch(e){}V.walkOn=()=>{};const n=nextOpponent();beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:n.oppKey,oppName:n.oppName,oppAvg:50,legs:1});return {stored:save.boardZoom};});
await p.waitForTimeout(8000);
const s=await p.evaluate(()=>({zoom:window.__zoomOn,btn:!!document.getElementById('btnZoom'),btnText:[...document.querySelectorAll('button')].some(x=>/whole board|zoom in/i.test(x.textContent||''))}));
const pass=s.zoom===true&&!s.btn&&!s.btnText&&!pe.length;
console.log('nowhole',w,pass?'PASS':'FAIL',JSON.stringify({...r,...s}),pe.slice(0,2).join(' | '));await b.close();process.exit(pass?0:1);})();
