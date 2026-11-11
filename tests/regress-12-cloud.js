// #12 regression guard (QA send-back 20:30): a cloud save written by v1.75 must be migrated when it is adopted.
// Signed-in players get their save replaced by the cloud copy after page load (netAdopt at sign-in, adopt() for a newer
// save from another device), so the load-time migration alone missed them and they still met the inflated opponent.
// Plants a v1.75-shaped cloud save (Rookie, placement +14, stored Club opponent 75, revenge 79), adopts it both ways,
// and checks the stored opponent and revenge come back in band with placement cleared. Fails on f203c01, passes on the fix.
// usage: node tests/regress-12-cloud.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const stale=()=>p.evaluate(()=>{newCareer();const c=career();c.tier=1;c.stage=null;c.next={oppName:'Old Stored',oppAvg:75,legs:3,_d:1};C3.V3().rev={name:'Rev Guy',avg:79,stake:45};
  const cloud=JSON.parse(JSON.stringify(save));cloud.diff={lv:'rookie',darts:600,pts:40000,place:14,placeAvg:74.6};cloud.season=SEASON;cloud.sv=(save.sv||0)+5;cloud.dev='other-device';
  // reset the local save to a fresh one so only the cloud copy carries the stale opponents
  newCareer();career().next=null;return cloud;});
 const read=()=>p.evaluate(()=>{const c=save.career;return {next:c&&c.next&&c.next.oppAvg,raw:c&&c.next&&c.next.oppRaw,rev:c&&c.v3&&c.v3.rev&&c.v3.rev.avg,revRaw:c&&c.v3&&c.v3.rev&&c.v3.rev.raw,revPlays:c&&c.v3&&c.v3.rev&&TOPS_OPP_SHIFT(c.v3.rev.avg,1),place:save.diff&&save.diff.place};});
 const fails=[];const BAND=[56,64];
 // 1. sign-in: netAdopt (game4.js), "the cloud save always wins"
 let cloud=await stale();await p.evaluate(c=>netAdopt(c),cloud);const a=await read();console.log('netAdopt: '+JSON.stringify(a));
 // 2. newer save from another device: adopt() in v11.js, reached through NET.pendCloud when not mid-match
 cloud=await stale();await p.evaluate(c=>{NET.pendCloud=c;},cloud);await p.waitForTimeout(2600);const d=await read();console.log('adopt:    '+JSON.stringify(d));
 [['netAdopt',a],['adopt',d]].forEach(([k,r])=>{
  if(!(r.next>=BAND[0]-12&&r.next<=BAND[1]))fails.push(`${k}: stored Club opponent ${r.next} not in band (v1.75 stored 75)`);
  if(r.raw==null)fails.push(`${k}: stored opponent not migrated (no oppRaw)`);
  // revenge stores the raw rating (raw:1); the band shift happens when the match starts
  if(!r.revRaw||!(r.revPlays<=BAND[1]+3)) /* v1.80: one setting (Club); a revenge opponent can be one of the tier's strongest (Club targets reach 67 at tier 1) */fails.push(`${k}: stored revenge not migrated (avg ${r.rev}, raw ${r.revRaw}, plays at ${r.revPlays}; v1.75 stored 79)`);
  if(r.place)fails.push(`${k}: placement ${r.place} not cleared`);});
 // 3. idempotent: adopting the already-migrated save again changes nothing
 const again=await p.evaluate(()=>{const c=JSON.parse(JSON.stringify(save));netAdopt(c);return save.career.next.oppAvg;});if(again!==d.next)fails.push(`second adopt moved the opponent ${d.next} -> ${again}`);
 await b.close();
 if(fails.length){console.log('FAIL\n- '+fails.join('\n- '));process.exit(1);}console.log('PASS: v1.75 cloud saves are migrated on adopt (sign-in and other device), idempotent');})();
