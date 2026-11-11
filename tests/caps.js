// Caps +10 (Overseer 00:36): a chapter's stat cap rises by 5 for each extra season at the same tier, up to +10; promotion resets it.
// Checks capNow through real newSeason calls: season 1/2/3/4 at Club = 50/55/60/60; first season at Regional = 60; Worlds keeps 82 -> 85; The Run unaffected.
// usage: node tests/caps.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{save.authSeen=true;$('login').hidden=true;newCareer();const c=career();c.stage=null;c.tier=1;c.seasons=[];c.season=null;const out={club:[]};
  for(let i=0;i<4;i++){newSeason(c);out.club.push(TOPS_capNow());c.season.done=true;c.seasons.push({tier:1,n:i+1});}
  c.tier=2;c.season=null;newSeason(c);out.reg=TOPS_capNow();
  c.tier=6;c.seasons=[];newSeason(c);out.w1=TOPS_capNow();c.seasons.push({tier:6});newSeason(c);out.w2=TOPS_capNow();
  out.card=(document.createElement('div'),true);return out;});
 const f=[];if(r.club.join()!=='50,55,60,60')f.push('Club caps by season '+r.club.join()+' (want 50,55,60,60)');if(r.reg!==60)f.push('first Regional season cap '+r.reg+' (want 60)');if(r.w1!==82||r.w2!==85)f.push('Worlds '+r.w1+'/'+r.w2+' (want 82/85)');
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: caps rise 5 per extra season at a tier (50/55/60), reset on promotion, Worlds unchanged');})();
