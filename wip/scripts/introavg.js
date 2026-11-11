// Intro card "Season avg" must match what the opponent actually plays at (the #12 band shift), within the fixture's ±2 form.
// Usage: node introavg.js <dir with built index.html>   exits 1 on failure.
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2]||process.cwd();
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.goto('file://'+dir+'/index.html');await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
const r=await p.evaluate(()=>{save.authSeen=true;save.name='Lee';persist();$('login').hidden=true;newCareer();const out=[];
 for(const tier of [1,2,3,4,5]){const c=career();c.tier=tier;c.season=null;c.next=null;newSeason(c);const sn=c.season;let worst=0,ex=null;
  for(let w=1;w<=Math.min(sn.len,6);w++){sn.week=w;c.next=null;const n=nextOpponent();if(!n||!n.fixture)continue;const shown=oppSeasonAvg(c,n.oppName,n.oppAvg);const gap=Math.abs(shown-n.oppAvg);if(gap>worst){worst=gap;ex={opp:n.oppName,shown,plays:n.oppAvg};}}
  out.push({tier,worstGap:worst,ex,ok:worst<=2.5});}
 return out;});
console.log(JSON.stringify(r),pe.length?'pageErrors '+pe.slice(0,2).join(' | '):'');const fail=r.some(x=>!x.ok)||pe.length;console.log(fail?'INTROAVG FAIL':'INTROAVG PASS');await b.close();process.exit(fail?1:0);})();
