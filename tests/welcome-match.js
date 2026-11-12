// EXP-6: the card welcome sheet (tc-welcome) must never sit over a match.
// node tests/welcome-match.js [dir] [width=390] [height=844]
// Save just after the first match (matches=1, cards never welcomed), exhibition forced with the game's ?exh=1.
// A: accept the exhibition poster BEFORE the welcome's 700 ms timer fires.  B: accept it AFTER the welcome is open under it.
// Each: 3 s into the match, no .tc-welcome in the page and no infinite CSS animation inside any .tc-sheet.
// C (check 2): the match ends -> hub: the welcome shows once; Later -> hub again: it doesn't come back.
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');const W=+(process.argv[3]||390),H=+(process.argv[4]||844);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});const res={},pe=[];
const probe=()=>({wel:!!document.querySelector('.tc-sheet.tc-welcome'),inf:document.getAnimations().filter(a=>{try{const t=a.effect&&a.effect.target;return a.effect.getTiming().iterations===Infinity&&t&&t.closest&&t.closest('.tc-sheet');}catch(e){return false;}}).length,match:!!(S&&!S.done)});
for(const mode of ['A','B']){const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();p.on('pageerror',e=>pe.push(mode+': '+e.message));
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.goto('file://'+dir+'/index.html?exh=1');
 await p.waitForFunction(()=>typeof S!=='undefined'&&typeof beginMatch==='function'&&typeof showHub==='function'&&window.TC_API,null,{timeout:180000});await p.waitForTimeout(1500);
 await p.evaluate(()=>{save.authSeen=true;$('login').hidden=true;newCareer();career().tier=1;career().stage='pub';save.name='Hayden';save.lessonDone=true;save.matches=1;save.tcIntro=0;try{V.walkOn=()=>{};}catch(e){}showHub();});
 await p.waitForSelector('#tcPGo',{timeout:30000});
 if(mode==='B')await p.waitForSelector('.tc-sheet.tc-welcome',{timeout:30000});
 const before=await p.evaluate(probe);await p.evaluate(()=>document.getElementById('tcPGo').click());
 await p.waitForTimeout(3000);const during=await p.evaluate(probe);res[mode]={before,during};
 if(mode==='B'){ // C: end the match, back to the hub
  await p.evaluate(()=>{S.done=true;showHub();});await p.waitForTimeout(1500);const hub1=await p.evaluate(probe);
  await p.evaluate(()=>{const l=document.getElementById('tcWelLater');l&&l.click();});await p.waitForTimeout(300);
  await p.evaluate(()=>showHub());await p.waitForTimeout(1500);const hub2=await p.evaluate(probe);res.C={hub1,hub2};}
 await ctx.close();}
await b.close();
const f=[];['A','B'].forEach(m=>{const d=res[m].during;if(!d.match)f.push(m+': match not running');if(d.wel)f.push(m+': welcome over the match');if(d.inf)f.push(m+': '+d.inf+' infinite tc animations during play');});
if(!res.B.before.wel)f.push('B setup: welcome never opened before the invite');if(!res.C.hub1.wel)f.push('C: welcome not shown at the next hub');if(res.C.hub2.wel)f.push('C: welcome came back after Later');if(pe.length)f.push('page errors: '+pe.slice(0,2).join(' | '));
console.log(JSON.stringify({W,H,res,fails:f}));console.log('welcome-match',f.length?'FAIL':'PASS');process.exit(f.length?1:0);})();
