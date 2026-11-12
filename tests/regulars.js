// Named regulars (directive 5): every tier's season table has unique names; the Worlds knockout has a named opponent for all 7 rounds
// (it had 4, so rounds 5–7 played "undefined"); each league regular keeps the same average every season at a tier (bar the small repeat drift);
// the Worlds knockout keeps its designed ladder by round (-4..+8, each once), so there the strength goes with the round, not the name.
// usage: node tests/regulars.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage();
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const r=await p.evaluate(()=>{save.authSeen=true;newCareer();const c=career();c.stage=null;const out={dups:[],undef:[],drift:[]};
  for(let t=0;t<7;t++){c.tier=t;c.seasons=[];c.season=null;const s1=newSeason(c);const names=s1.table.filter(x=>!x.you).map(x=>x.name);if(new Set(names).size!==names.length)out.dups.push(t+': '+names.join(', '));
   for(let w=1;w<=s1.len;w++){s1.week=w;c.next=null;const n=nextOpponent();if(!n||!n.oppName||n.oppName==='undefined')out.undef.push('tier '+t+' week '+w);}
   const a1=Object.fromEntries(s1.table.map(x=>[x.name,x.avg]));c.seasons.push({tier:t,n:1});c.season=null;const s2=newSeason(c);
   s2.table.forEach(x=>{if(t<6&&!x.you&&a1[x.name]!=null&&Math.abs(x.avg-a1[x.name])>1)out.drift.push(t+' '+x.name+' '+a1[x.name]+'→'+x.avg);});}
  // difficulty must not move (QA 14:09): per tier, the mean opponent offset over 40 seasons vs the old position-dealt design,
  // and the Worlds knockout uses each ladder step (-4..+8) exactly once
  out.mean=[];out.ko=[];const OFF=[-6,-5,-3,-2,-1,0,1,2,3,4,5,6,7];
  for(let t=0;t<7;t++){c.tier=t;let now=0,was=0,k=0;for(let r=0;r<40;r++){save.name='P'+r;c.seasons=[];c.season=null;const s=newSeason(c);const len=SEASON_LEN[t];const seed=hash(save.name+t+1);
    s.table.forEach((x,i)=>{if(x.you||x.name===RIVAL.name)return;now+=x.avg-TIERS[t].avg;k++;});
    const cnt=t===6?7:len;for(let i=0;i<cnt;i++){if(t<=4&&i===cnt-1)continue;was+=(t===6?[-4,-2,0,2,4,6,8]:OFF)[(i+seed)%(t===6?7:13)];}
    if(t===6){const o=s.table.filter(x=>!x.you).map(x=>x.avg-TIERS[6].avg).sort((a,b)=>a-b).join(',');if(o!=='-4,-2,0,2,4,6,8')out.ko.push(o);}}
   const wasN=t===6?7*40:(t<=4?(SEASON_LEN[t]-1):SEASON_LEN[t])*40;out.mean.push({t,now:+(now/k).toFixed(2),was:+(was/wasN).toFixed(2)});}
  return out;});
 console.log('mean opponent offset per tier (now vs before): '+r.mean.map(m=>m.t+': '+m.now+' vs '+m.was).join(' · '));
 r.diff=[];r.mean.forEach(m=>{if(Math.abs(m.now-m.was)>0.75)r.diff.push('tier '+m.t+' difficulty moved: mean offset '+m.was+' → '+m.now);});
 if(r.ko.length)r.diff.push('Worlds knockout not the designed ladder: '+r.ko.slice(0,3).join(' | '));
 const f=[];if(r.diff.length)f.push('opponent difficulty changed: '+r.diff.join(' | '));if(r.dups.length)f.push('the same player twice in a table: '+r.dups.join(' | '));if(r.undef.length)f.push('fixtures with no opponent: '+r.undef.join(', '));if(r.drift.length)f.push('regulars changing average between seasons: '+r.drift.slice(0,4).join(', '));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: field difficulty unchanged per tier (mean offset within 0.75 of the old design), Worlds ladder -4..+8 once each, unique names in every table, a named opponent every week (Worlds 7 rounds), regulars keep their average season to season');})();
