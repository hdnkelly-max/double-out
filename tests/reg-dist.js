// QA regulars rework check (ChatGPT 17:10 conditions): per tier, 1000 generated seasons; the table's mean opponent offset
// (excl. you and the rival) P5/P50/P95/min/max, now vs the old position-dealt design (computed from the same seed); regOff fallback
// warnings must be 0; regOff stable across a reload. usage: node reg-dist.js <dir> [N]
const {chromium}=require('playwright');const path=require('path');const dir=path.resolve(process.argv[2]||'.');const N=+(process.argv[3]||1000);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage();
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const warns=[];p.on('console',m=>{if(/regOff/.test(m.text()))warns.push(m.text());});
 await p.goto('file://'+dir+'/index.html');await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const run=()=>p.evaluate(N=>{save.authSeen=true;newCareer();const c=career();c.stage=null;const OFF=[-6,-5,-3,-2,-1,0,1,2,3,4,5,6,7],KO=[-4,-2,0,2,4,6,8];
  const q=(a,f)=>a[Math.min(a.length-1,Math.floor(f*a.length))];const out=[];const offs={};
  for(let t=0;t<7;t++){c.tier=t;const now=[],was=[];
   for(let r=0;r<N;r++){save.name='Q'+r;c.seasons=[];c.season=null;const s=newSeason(c);const seed=hash(save.name+t+1);
    const o=s.table.filter(x=>!x.you&&x.name!==RIVAL.name).map(x=>x.avg-TIERS[t].avg);now.push(o.reduce((a,b)=>a+b,0)/o.length);
    const cnt=t===6?7:SEASON_LEN[t];let w=0,k=0;for(let i=0;i<cnt;i++){if(t<=4&&i===cnt-1)continue;w+=(t===6?KO:OFF)[(i+seed)%(t===6?7:13)];k++;}was.push(w/k);
    s.table.forEach(x=>{if(!x.you&&t<6&&x.name!==RIVAL.name)offs[t+'|'+x.name]=x.avg-TIERS[t].avg;});}
   const st=a=>{a=a.slice().sort((x,y)=>x-y);return {mean:+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(2),p5:+q(a,.05).toFixed(2),p50:+q(a,.5).toFixed(2),p95:+q(a,.95).toFixed(2),min:+a[0].toFixed(2),max:+a[a.length-1].toFixed(2)};};
   out.push({t,now:st(now),was:st(was)});}
  return {out,offs};},N);
 const r1=await run();await p.reload();await p.waitForTimeout(4500);const r2=await run();
 const unstable=Object.keys(r1.offs).filter(k=>r2.offs[k]!==r1.offs[k]);
 r1.out.forEach(x=>console.log('tier '+x.t+' now '+JSON.stringify(x.now)+'\n       was '+JSON.stringify(x.was)));
 console.log('regOff fallback warnings: '+warns.length+(warns.length?' e.g. '+warns.slice(0,3).join(' | '):''));
 console.log('names whose offset differs after a reload: '+unstable.length+(unstable.length?' e.g. '+unstable.slice(0,5).join(', '):'')+' (of '+Object.keys(r1.offs).length+')');
 await b.close();})().catch(e=>{console.error(e);process.exit(2);});
