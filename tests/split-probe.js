// #20 frame split: off by default (no wrappers, rows unchanged); on with ?q20=split: timer/event JS is timed, add/remove listener pairs still match,
// once listeners fire once, and every recorder window carries [raf, ajs, probe, rest, gpu p50, p90, n]. node tests/split-probe.js <built dir>
const {chromium,devices}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..');const fails=[];
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const run=async q=>{const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:devices['iPhone 13'].userAgent});const p=await ctx.newPage();
 await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());const pe=[];p.on('pageerror',e=>pe.push(e.message));
 await p.goto('file://'+dir+'/index.html'+(q?'?q20='+q:''));await p.waitForFunction(()=>typeof V!=='undefined'&&typeof beginMatch==='function',null,{timeout:60000});
 const r=await p.evaluate(()=>{const o={ajs:!!window.TOPS_AJS};let hits=0;const f=()=>hits++;window.addEventListener('tops-x',f);window.dispatchEvent(new Event('tops-x'));window.removeEventListener('tops-x',f);window.dispatchEvent(new Event('tops-x'));
  o.addRemove=hits;let h2=0;const g=()=>h2++;document.addEventListener('tops-y',g,{capture:true});document.removeEventListener('tops-y',g,false);document.dispatchEvent(new Event('tops-y'));o.capMismatchKept=h2;document.removeEventListener('tops-y',g,true);
  let h3=0;window.addEventListener('tops-z',()=>h3++,{once:true});window.dispatchEvent(new Event('tops-z'));window.dispatchEvent(new Event('tops-z'));o.once=h3;
  let h4=0;const k=()=>h4++;window.addEventListener('tops-w',k);window.addEventListener('tops-w',k);window.dispatchEvent(new Event('tops-w'));o.dedupe=h4;window.removeEventListener('tops-w',k);
  let h5=0;const obj={handleEvent(){h5++;}};window.addEventListener('tops-v',obj);window.dispatchEvent(new Event('tops-v'));window.removeEventListener('tops-v',obj);window.dispatchEvent(new Event('tops-v'));o.handleEvent=h5;
  let h6=0;const ac=new AbortController();const s6=()=>h6++;window.addEventListener('tops-u',s6,{signal:ac.signal});window.dispatchEvent(new Event('tops-u'));ac.abort();window.dispatchEvent(new Event('tops-u'));o.abort=h6;
  let h7=0;const s7=()=>h7++;window.addEventListener('tops-t',s7);window.removeEventListener('tops-t',s7);window.addEventListener('tops-t',s7);window.dispatchEvent(new Event('tops-t'));window.removeEventListener('tops-t',s7);window.dispatchEvent(new Event('tops-t'));o.readd=h7;
  let h8=0;const s8=()=>h8++;window.addEventListener('tops-s',s8,true);document.addEventListener('tops-s',s8,false);document.dispatchEvent(new Event('tops-s',{bubbles:true}));window.removeEventListener('tops-s',s8,true);document.dispatchEvent(new Event('tops-s',{bubbles:true}));document.removeEventListener('tops-s',s8,false);document.dispatchEvent(new Event('tops-s',{bubbles:true}));o.multi=h8;
  let h9=0;const s9=()=>h9++;window.addEventListener('tops-r',s9,null);window.removeEventListener('tops-r',s9,null);window.dispatchEvent(new Event('tops-r'));o.nullOpts=h9;
  const inA=window.TOPS_AJS?window.TOPS_AJS.ms:0;window.__TOPS_INF=1;window.addEventListener('tops-q',()=>{const e=performance.now()+5;while(performance.now()<e){}});window.dispatchEvent(new Event('tops-q'));window.__TOPS_INF=0;o.inFrameNotCounted=window.TOPS_AJS?(window.TOPS_AJS.ms-inA)<1:true;
  return o;});
 const a0=await p.evaluate(()=>window.TOPS_AJS?window.TOPS_AJS.n:-1);await p.waitForTimeout(1500);const a1=await p.evaluate(()=>window.TOPS_AJS?window.TOPS_AJS.n:-1);r.ajsGrew=a1>a0;
 r.pe=pe;await ctx.close();return r;};
const off=await run(''),on=await run('split');console.log(JSON.stringify({off,on}));
const chk=(n,c)=>{if(!c)fails.push(n);};
chk('off: no wrappers',!off.ajs);chk('on: wrappers',on.ajs&&on.ajsGrew);
for(const [n,r] of [['off',off],['on',on]]){chk(n+': add/remove',r.addRemove===1);chk(n+': capture must match to remove',r.capMismatchKept===1);chk(n+': once',r.once===1);chk(n+': same listener added twice fires once',r.dedupe===1);chk(n+': handleEvent objects',r.handleEvent===1);chk(n+': AbortSignal removes',r.abort===1);chk(n+': remove then re-add',r.readd===1);chk(n+': same fn on two targets, different capture',r.multi===3);chk(n+': null options',r.nullOpts===0);chk(n+': handler inside the game frame not counted',r.inFrameNotCounted);chk(n+': no page errors',!r.pe.length);}
await b.close();console.log(fails.length?'SPLIT-PROBE FAIL\n- '+fails.join('\n- '):'SPLIT-PROBE PASS');process.exit(fails.length?1:0);})();
