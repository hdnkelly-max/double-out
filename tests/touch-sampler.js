// Overseer 07:13: the touch-rate sampler must not cost anything per touch move once it has its estimate.
// Real touch drags (CDP): with nothing stored it listens, settles after ~24 intervals, stores the tier and detaches; further drags add nothing;
// after a reload with a stored tier it is never attached.
// usage: node tests/touch-sampler.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files']});const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(4500);
 // Real PointerEvents dispatched in the page 8 ms apart (a 120 Hz touch screen). CDP touch drags arrive ~300 ms apart in this headless
 // software-GL box (rAF-coalesced at ~1 fps), which the sampler rightly ignores as no estimate, so the timing has to be made in the page.
 const drag=n=>p.evaluate(async n=>{const T=performance.now();for(let k=0;k<n;k++){while(performance.now()<T+k*8.33);window.dispatchEvent(new PointerEvent('pointermove',{pointerType:'touch',pointerId:7,clientX:200+k%30,clientY:300,bubbles:true}));}},n);
 const st=()=>p.evaluate(()=>({on:TOPS_TCH.on,ms:TOPS_TCH.ms,n:TOPS_TCH.d.length,stored:localStorage.getItem('tops_touchMs')}));
 const f=[];const s0=await st();if(!s0.on)f.push('fresh install: sampler not listening '+JSON.stringify(s0));
 await drag(60);const s1=await st();if(s1.on)f.push('still listening after 60 touch moves '+JSON.stringify(s1));if(s1.ms==null||s1.stored==null)f.push('no tier stored '+JSON.stringify(s1));
 await drag(60);const s2=await st();if(s2.n!==0)f.push('collected samples after detaching '+JSON.stringify(s2));
 await p.reload();await p.waitForTimeout(4500);const s3=await st();if(s3.on)f.push('attached again after reload with a stored tier '+JSON.stringify(s3));if(s3.ms!==s1.ms)f.push('stored tier not reused '+JSON.stringify(s3));
 if(errs.length)f.push('page errors: '+errs.slice(0,3).join(' | '));await b.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}console.log('PASS: sampler listens on a fresh install only until it has a tier ('+s1.ms+' ms), then detaches; never attached once stored');})();
