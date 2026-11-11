// Legacy-save invariants (ChatGPT P0, Overseer 03:50): a save from before the taper keeps exactly today's sway and scatter for the points it
// already had, through reload, respec, kit change, a new season (caps bonus), promotion and cloud adopt; the snapshot never moves.
// "Today's effect" = the same save measured with the taper switched off (k=1).
// usage: node tests/legacy-save.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const helper=()=>{window.__m=k=>{const old=window.TOPS_CAL_W;if(k!=null)window.TOPS_CAL_W=Object.assign({},old,{k});const c=career();beginMatch({mode:'career',tier:c.tier,p0:'P',oppName:'X',oppAvg:50,legs:1});S.aim=targetPoint('T20');
   const en=effNerves;effNerves=()=>0;let tp;try{tp=throwParams();}finally{effNerves=en;window.TOPS_CAL_W=old;}const o={A:+tp.A.toFixed(4),s0:+tp.s0.toFixed(4),tb:JSON.stringify(save.st2.tb)};try{S.done=true;}catch(e){}return o;};};
 await p.evaluate(helper);
 const f=[];const chk=(what,o)=>{if(o.a.A!==o.b.A||o.a.s0!==o.b.s0)f.push(`${what}: sway/scatter ${o.a.A}/${o.a.s0} vs today's ${o.b.A}/${o.b.s0}`);if(o.a.tb!==o.tb0)f.push(`${what}: snapshot moved ${o.tb0} -> ${o.a.tb}`);};
 // a save from before the update: Club, stats 50, no snapshot
 const tb0=await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;save.st2.v={sc:50,fi:48,ct:52,rh:50,co:45};delete save.st2.tb;save.barrel='assassin';persist();const a=__m();return a.tb;});
 if(tb0!=='{"sc":50,"fi":48,"ct":52}')f.push('snapshot on first read: '+tb0);
 let o=await p.evaluate(()=>({a:__m(),b:__m(1)}));chk('first load',Object.assign(o,{tb0}));
 await p.evaluate(()=>persist());await p.reload();await p.waitForTimeout(4000);await p.evaluate(helper);
 o=await p.evaluate(()=>{save.authSeen=true;$('login').hidden=true;V.walkOn=()=>{};return {a:__m(),b:__m(1)};});chk('after reload',Object.assign(o,{tb0}));
 // respec: points come back, re-spent into the same stats
 o=await p.evaluate(()=>{const s=save.st2;s.v={sc:20,fi:20,ct:20,rh:20,co:20};s.v={sc:50,fi:48,ct:52,rh:50,co:45};s.respec=(s.respec||0)+1;return {a:__m(),b:__m(1)};});chk('respec and re-spend',Object.assign(o,{tb0}));
 // respec moving Control points into Rhythm: Control's lower value keeps today's effect
 o=await p.evaluate(()=>{save.st2.v={sc:50,fi:48,ct:40,rh:62,co:45};return {a:__m(),b:__m(1)};});chk('respec moving points out of Control',Object.assign(o,{tb0}));
 await p.evaluate(()=>{save.st2.v={sc:50,fi:48,ct:52,rh:50,co:45};});
 // kit change
 o=await p.evaluate(()=>{save.owned=(save.owned||[]).concat('razor');save.barrel='razor';return {a:__m(),b:__m(1)};});chk('kit change',Object.assign(o,{tb0}));
 // a second season at the tier (caps bonus) and promotion
 o=await p.evaluate(()=>{const c=career();c.seasons=(c.seasons||[]).concat({tier:1,n:1});c.season=null;newSeason(c);return {a:__m(),b:__m(1)};});chk('second season (caps bonus)',Object.assign(o,{tb0}));
 o=await p.evaluate(()=>{const c=career();c.tier=2;c.season=null;newSeason(c);return {a:__m(),b:__m(1)};});chk('promotion',Object.assign(o,{tb0}));
 // new points after the update are tapered, old ones not
 const np=await p.evaluate(()=>{save.st2.v.ct=62;const a=__m(),b=__m(1);save.st2.v.ct=52;return {a,b};});if(!(np.a.A>np.b.A))f.push('points above the snapshot are not tapered');
 // cloud adopt: a copy with the snapshot keeps it; an old-version copy gets its own snapshot
 o=await p.evaluate(()=>{const cl=JSON.parse(JSON.stringify(save));cl.season=SEASON;cl.sv=(save.sv||0)+3;netAdopt(cl);return {a:__m(),b:__m(1)};});chk('sign-in adopt',Object.assign(o,{tb0}));
 const old=await p.evaluate(()=>{const cl=JSON.parse(JSON.stringify(save));delete cl.st2.tb;cl.st2.v.ct=58;cl.season=SEASON;cl.sv=(save.sv||0)+3;netAdopt(cl);const a=__m(),b=__m(1);return {a,b,tb:save.st2.tb};});
 if(old.a.A!==old.b.A)f.push('an old-version cloud save plays differently after adopt');if(!old.tb||old.tb.ct!==58)f.push('old-version cloud save snapshot '+JSON.stringify(old.tb));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: legacy save keeps today\'s sway and scatter through reload, respec, kit change, caps season, promotion and cloud adopt; snapshot fixed; new points tapered');})();
