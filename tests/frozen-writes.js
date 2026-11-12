// #20e: ttAt() and setupParts() now hand out cached, frozen objects. In sloppy-mode code a write to them is silently ignored,
// so this hook proves no caller writes: it wraps every result in a Proxy that records any set/define/delete attempt, then plays
// the full regression suite through it.
// Usage: node -r ./tests/frozen-writes.js tests/regress.js 2   -> prints FROZEN-WRITES PASS (0 write attempts, both functions
// called) or FROZEN-WRITES FAIL with the property and a stack line. Test-only: changes nothing in the game.
const pw=require('playwright');const launch=pw.chromium.launch.bind(pw.chromium);const seen=[];
const hook=()=>{const W=window.__fw={n:{ttAt:0,setupParts:0},w:[]};
 const wrap=nm=>{const f=window[nm];if(typeof f!=='function'||f.__fw)return false;const g=function(){const r=f.apply(this,arguments);W.n[nm]++;
   if(!r||typeof r!=='object')return r;return new Proxy(r,{set(t,k,v){W.w.push([nm,'set',String(k),(new Error().stack||'').split('\n')[2]]);return Reflect.set(t,k,v);},
    defineProperty(t,k,d){W.w.push([nm,'define',String(k),(new Error().stack||'').split('\n')[2]]);return Reflect.defineProperty(t,k,d);},
    deleteProperty(t,k){W.w.push([nm,'delete',String(k),(new Error().stack||'').split('\n')[2]]);return Reflect.deleteProperty(t,k);}});};g.__fw=1;window[nm]=g;return true;};
 const iv=setInterval(()=>{const a=wrap('ttAt'),b=wrap('setupParts');if(window.ttAt&&window.ttAt.__fw&&window.setupParts&&window.setupParts.__fw)clearInterval(iv);},5);};
pw.chromium.launch=async(...a)=>{const b=await launch(...a);const np=b.newPage.bind(b);
 b.newPage=async(...o)=>{const p=await np(...o);await p.addInitScript(hook);const cl=p.close.bind(p);
  p.close=async(...c)=>{try{seen.push(await p.evaluate(()=>window.__fw));}catch(e){}return cl(...c);};return p;};
 const bc=b.close.bind(b);b.close=async()=>{report();return bc();};return b;};
let done=false;function report(){if(done)return;done=true;const n={ttAt:0,setupParts:0},w=[];seen.forEach(s=>{if(!s)return;n.ttAt+=s.n.ttAt;n.setupParts+=s.n.setupParts;w.push(...s.w);});
 const ok=seen.length>0&&n.ttAt>0&&n.setupParts>0&&!w.length;console.log(JSON.stringify({pages:seen.length,calls:n,writes:w.slice(0,10)}));console.log(ok?'FROZEN-WRITES PASS':'FROZEN-WRITES FAIL');}
process.on('exit',report);
