// Named regulars (directive 5): every tier's season table has unique names; the Worlds knockout has a named opponent for all 7 rounds
// (it had 4, so rounds 5–7 played "undefined"); each regular keeps the same average every season at a tier (bar the small repeat drift).
// usage: node tests/regulars.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage();
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{save.authSeen=true;newCareer();const c=career();c.stage=null;const out={dups:[],undef:[],drift:[]};
  for(let t=0;t<7;t++){c.tier=t;c.seasons=[];c.season=null;const s1=newSeason(c);const names=s1.table.filter(x=>!x.you).map(x=>x.name);if(new Set(names).size!==names.length)out.dups.push(t+': '+names.join(', '));
   for(let w=1;w<=s1.len;w++){s1.week=w;c.next=null;const n=nextOpponent();if(!n||!n.oppName||n.oppName==='undefined')out.undef.push('tier '+t+' week '+w);}
   const a1=Object.fromEntries(s1.table.map(x=>[x.name,x.avg]));c.seasons.push({tier:t,n:1});c.season=null;const s2=newSeason(c);
   s2.table.forEach(x=>{if(!x.you&&a1[x.name]!=null&&Math.abs(x.avg-a1[x.name])>1)out.drift.push(t+' '+x.name+' '+a1[x.name]+'→'+x.avg);});}
  return out;});
 const f=[];if(r.dups.length)f.push('the same player twice in a table: '+r.dups.join(' | '));if(r.undef.length)f.push('fixtures with no opponent: '+r.undef.join(', '));if(r.drift.length)f.push('regulars changing average between seasons: '+r.drift.slice(0,4).join(', '));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: unique names in every table, a named opponent every week (Worlds 7 rounds), regulars keep their average season to season');})();
