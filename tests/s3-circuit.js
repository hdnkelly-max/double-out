// S3 Circuit career wiring (tc/s3.js). With ?s3=1:
//   1 a new career is a full reset at the Pub: Circuit state, bank 60, tier 0
//   2 TOPS_S3.view() has the frozen shape (level, ladder, calendar with prizes/points, live, history, bank, runway)
//   3 book() takes entry + travel from the one bank; you can't book twice or book what isn't on
//   4 play() starts a career match against the engine's opponent (avg and legs from the level and round, a name from the level's pool)
//   5 three wins at a Pub league night: the bank ends at exactly 60 - $5 entry + the winner's prize (rounds pay nothing, feats pay no cash), points, week moves on, tops:s3 fires with done/fin/prize
//   5b the win is recorded for the trophy cabinet: titles [{ev,n,level,season,finish,prize,date}] and a dated history row
//   6 a loss ends the event with that round's finish
//   7 TOPS_HISTORY.rows() and TOPS_BESTLEG.table()/record() read the views (mocked here) into the frozen shape
//   7b the hub's old Play (playNext) books the first affordable event and plays it, never the Season 2 league
//   8 flag off: TOPS_S3.on() is false and a new career has no Circuit state
// usage: node tests/s3-circuit.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844}});
 const url='file://'+path.resolve(__dirname,'../index.html');
 await p.route(/jsdelivr|googleapis|gstatic/,r=>r.abort());
 await p.route(/supabase\.co/,r=>{const u=r.request().url();
  if(/tops_history/.test(u))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{who:'Lee McKenzie',season:1,tier:1,title:null,best_avg:'73.3',best_leg:14},{who:'Lee McKenzie',season:2,tier:2,title:'Regional rep',best_avg:'115.6',best_leg:12},{who:'Gene Lovelock',season:2,tier:0,title:'Pub league',best_avg:'71.9',best_leg:18}])});
  if(/tops_bestleg_s3/.test(u))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{name:'Lee McKenzie',darts:12,at:'2026-11-19T01:00:00Z'},{name:'David Fraser',darts:13,at:'2026-11-19T02:00:00Z'}])});
  r.abort();});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));const f=[];
 await p.goto(url+'?s3=1');await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.goto(url+'?s3=1');await p.waitForTimeout(4500);
 const r=await p.evaluate(async()=>{const out={};try{
  save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();
  out.start={on:TOPS_S3.on(),tier:c.tier,bank:c.bank,circ:!!c.circuit,level:c.circuit&&c.circuit.level};
  const v=TOPS_S3.view();out.keys=Object.keys(v).sort();out.levelKeys=Object.keys(v.level).sort();out.cal0=v.calendar[0];out.ladder=v.ladder.map(x=>x.state).join(',');
  out.book1=TOPS_S3.book('pub_night');out.bank1=career().bank;out.book2=TOPS_S3.book('pub_night');out.bookBad=(career().circuit.live=null,career().bank+=5,TOPS_S3.book('waikato'));
  // re-book properly
  career().bank=60;career().circuit.live=null;out.book3=TOPS_S3.book('pub_night');
  const evs=[];window.addEventListener('tops:s3',e=>evs.push(e.detail));
  const v1=TOPS_S3.view();out.live=v1.live;
  for(let i=0;i<3;i++){const ok=TOPS_S3._playNow();if(!ok){out.err='play failed at '+i;break;}if(i===0)out.match={mode:'career',oppAvg:S.p[1].avg||S.oppAvg,s3:S.s3,legs:S.bestOf,name:S.p[1].name};S.won=true;S.p[0].pts=300;S.p[0].darts=18;careerAfterMatch();S.done=true;}
  out.evs=evs.slice();out.after={bank:career().bank,week:career().circuit.week,pts:career().circuit.pts.pub,hist:career().circuit.history.length,wins:career().wins};
  out.titles=JSON.parse(JSON.stringify(career().circuit.titles||[]));out.h0=JSON.parse(JSON.stringify(career().circuit.history[0]||null));
  // a loss in the second round
  TOPS_S3.book('pub_night');TOPS_S3._playNow();S.won=true;S.p[0].pts=200;S.p[0].darts=18;careerAfterMatch();S.done=true;TOPS_S3._playNow();S.won=false;S.p[0].pts=100;S.p[0].darts=18;careerAfterMatch();S.done=true;
  out.loss=evs[evs.length-1];
  out.hist=await TOPS_HISTORY.rows();out.bl=await TOPS_BESTLEG.table();out.rec=await TOPS_BESTLEG.record();
 }catch(e){out.err=String(e&&e.stack||e);}return out;});
 // 7b the hub's old Play (playNext); ENG-RESET may reload the page first, so check after it settles
 const b0=await p.evaluate(()=>{S.done=true;career().circuit.live=null;persist();setTimeout(()=>playNext(),0);return career().bank;});
 // Q&D (Producer 23:50): ENG-RESET reloads the page and replays it in ~11.5 s locally, slower on CI, so a fixed 15 s wait flaked.
 // Poll for the live event and S.s3 (the match under way) up to 60 s; an evaluate during the reload just tries again.
 { const t0=Date.now(); r.pn={err:'not live after 60 s'};
   while(Date.now()-t0<60000){ const s=await p.evaluate(b0=>{try{return {live:!!(career()&&career().circuit&&career().circuit.live),s3:!!(typeof S!=='undefined'&&S&&S.s3),paid:b0-career().bank};}catch(e){return null;}},b0).catch(()=>null);
     if(s&&s.live&&s.s3){r.pn=s;r.pnMs=Date.now()-t0;break;} if(s)r.pn=Object.assign({},s,{waiting:true}); await p.waitForTimeout(500); } }
 const want=['bank','calendar','card','debt','history','ladder','level','live','oom','qsOffer','recover','rest','runway','week'];
 if(r.err)f.push('error: '+r.err);else{
  if(!r.start.on||r.start.tier!==0||r.start.bank!==60||!r.start.circ||r.start.level!==0)f.push('new career is not a fresh Pub start '+JSON.stringify(r.start));
  if(JSON.stringify(r.keys)!==JSON.stringify(want))f.push('view() keys '+r.keys.join(','));
  if(!r.cal0||!r.cal0.prizes||r.cal0.prizes.W<=0||r.cal0.cost!==5)f.push('calendar row '+JSON.stringify(r.cal0));
  if(r.ladder!=='current,next,locked,locked,locked,locked,locked')f.push('ladder '+r.ladder);
  if(!r.book1.ok||r.bank1!==55)f.push('book did not take $5 '+JSON.stringify(r.book1)+' bank '+r.bank1);
  if(r.book2.ok)f.push('could book twice');if(r.bookBad.ok)f.push('could book an event from another level');
  if(!r.live||r.live.roundName!=='Quarter-final'||!r.live.opp||!r.live.opp.name||r.live.opp.legs!==3)f.push('live '+JSON.stringify(r.live));
  if(!r.match||r.match.mode!=='career'||!r.match.s3||r.match.s3.id!=='pub_night')f.push('match '+JSON.stringify(r.match));
  const last=r.evs[r.evs.length-1]||{};
  if(r.evs.length!==3||!r.evs[0].next||!last.done||last.fin!=='W'||!(last.prize>0))f.push('events '+JSON.stringify(r.evs));
  if(r.after.bank!==60-5+last.prize||r.after.week!==2||r.after.pts!==50||r.after.hist!==1||r.after.wins!==3)f.push('after the win '+JSON.stringify(r.after)+' prize '+last.prize);
  if(r.titles.length!==1||r.titles[0].ev!=='pub_night'||r.titles[0].finish!=='W'||r.titles[0].season!==3||!r.titles[0].date||!r.h0||!r.h0.date)f.push('trophy records '+JSON.stringify(r.titles)+' '+JSON.stringify(r.h0));
  if(!r.loss||!r.loss.done||r.loss.fin!=='SF')f.push('loss in round 2 '+JSON.stringify(r.loss));
  const lee=(r.hist||[]).find(x=>x.name==='Lee McKenzie');if(!lee||!lee.s1||lee.s1.bestLeg!==14||!lee.s2||lee.s2.furthest.n!=='Regional rep'||lee.s2.bestAvg!==115.6)f.push('history '+JSON.stringify(r.hist));
  const gene=(r.hist||[]).find(x=>x.name==='Gene Lovelock');if(!gene||gene.s1!==null)f.push('history: a season with no row is not null (no data) '+JSON.stringify(gene));
  if(!r.pn||!r.pn.live||!r.pn.s3||r.pn.paid!==5)f.push('playNext under S3 '+JSON.stringify(r.pn));
  if(!r.bl||r.bl.length!==2||r.bl[0].darts!==12||!r.rec||r.rec.darts!==12)f.push('best leg '+JSON.stringify(r.bl)+' '+JSON.stringify(r.rec));}
 // 8 flag off
 await p.goto(url+'?s3=0');await p.waitForTimeout(4500);
 const off=await p.evaluate(()=>{save.authSeen=true;newCareer();return {on:TOPS_S3.on(),circ:!!career().circuit};});
 if(off.on||off.circ)f.push('flag off still runs the Circuit '+JSON.stringify(off));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));
 await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log(`PASS: fresh Pub career (bank 60); view() frozen shape; booking takes $5 once; play() runs a career match vs ${r.match.name} (${r.match.oppAvg}); three wins = Winner, +$${r.evs[2].prize}, 50 pts, week 2; a round-2 loss = Semi-final; history + Best Leg read the views; old hub Play live after ${r.pnMs} ms (polled, up to 60 s); flag off = no Circuit`);
})();
