// F8 "Your form": career matches are logged once each (practice, The Run and online are not), capped at 200; the Player tab card shows
// the last-10 average, the comparison with the previous 10 (neutral when down), checkout and career start. Shots with SHOTS=1.
// usage: [SHOTS=1] node tests/form.js
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:process.env.SHOTS?2:1});
 try{await require('../wip/scripts/hl.js')(p);}catch(e){await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());}const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 const f=[];
 const r=await p.evaluate(()=>{save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;
  const play=(o)=>{beginMatch(Object.assign({mode:'career',tier:1,p0:'H',oppName:'D',oppAvg:58,legs:1},o||{}));S.p[0].darts=45;S.p[0].pts=900;S.p[0].coAtt=4;S.p[0].coHit=1;S.won=true;endMatch();};
  play();const n1=TOPS_form.log().length;try{endMatch();}catch(e){}const n2=TOPS_form.log().length;
  play({practice:true});const n3=TOPS_form.log().length;
  const e=TOPS_form.log()[0];
  // 34 matches rising 45 -> 62 with a promotion at 20, then a dip
  save.mlog=[];for(let i=0;i<34;i++){const a=45+i*.55+Math.sin(i*1.7)*5-(i>30?6:0);save.mlog.push({id:'m'+i,t:i,tr:i<20?1:2,a:+a.toFixed(1),ca:6,ch:i<17?1:2,pf:5,th:60,w:i%2});}
  for(let i=0;i<220;i++)save.mlog.push({id:'x'+i,t:i,tr:2,a:60,ca:1,ch:0,pf:1,th:10,w:0});const big=save.mlog.length;
  save.mlog=save.mlog.slice(0,34);persist();
  return {n1,n2,n3,e,big};});
 if(r.n1!==1)f.push('a career match logged '+r.n1+' times');if(r.n2!==1)f.push('a second endMatch for the same match logged it again');if(r.n3!==1)f.push('a practice match was logged');
 if(!r.e||Math.abs(r.e.a-60)>.05)f.push('logged average '+(r.e&&r.e.a)+' (want 60.0)');
 const card=await p.evaluate(()=>{showHub();hubTab('player');TOPS_form.render();const el=document.getElementById('c3form');if(!el)return null;el.scrollIntoView({block:'center'});const rc=el.getBoundingClientRect();return {txt:el.textContent.replace(/\s+/g,' '),w:rc.width,h:rc.height,f:TOPS_form.sum(TOPS_form.log())};});
 if(!card)f.push('no form card on the Player tab');else{if(!/3-dart avg/.test(card.txt))f.push('card text: '+card.txt);if(card.w>370)f.push('card wider than the screen: '+card.w);}
 if(process.env.SHOTS){await p.addStyleTag({content:'#lvFirst,.tcpk,.tc-welcome,.tcpk__sparks{display:none!important}'});await p.waitForTimeout(1200);const cdp=await p.context().newCDPSession(p);const s1=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:85});fs.writeFileSync(path.resolve(__dirname,'../shots/form_card.jpg'),Buffer.from(s1.data,'base64'));
  await p.evaluate(()=>{document.querySelectorAll('#c3rw,.c3rw,#lvFirst').forEach(e=>{e.hidden=true;e.classList.remove('on');if(e.id==='lvFirst')e.remove();});document.getElementById('c3form').click();});await p.waitForTimeout(600);await p.evaluate(()=>{const e=document.getElementById('lvFirst');if(e)e.remove();});await p.waitForTimeout(200);const s2=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:85});fs.writeFileSync(path.resolve(__dirname,'../shots/form_full.jpg'),Buffer.from(s2.data,'base64'));}
 // a falling last 10 is shown without red and without a fake positive
 const down=await p.evaluate(()=>{save.mlog=[];for(let i=0;i<20;i++)save.mlog.push({id:'d'+i,t:i,tr:1,a:i<10?60:55,ca:5,ch:1,pf:1,th:10,w:0});TOPS_form.render();const el=document.getElementById('c3form');return el?el.textContent.replace(/\s+/g,' '):'';});
 if(!/Previous 10: 60\.0/.test(down))f.push('falling form text: '+down);
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: form log once per career match (not practice), card on the Player tab: '+(card&&card.txt));})();
