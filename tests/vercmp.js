// ENG-3: version compare used by the update gate (v09.js). No browser, <1 s.
// node tests/vercmp.js [v09.js path] [proposed next version]   -> PASS / FAIL
//  1 the compare in that v09.js orders 1.99 < 2.00 < 2.08 < 2.09 < 2.10 < 2.11 < 2.99 < 3.00 < 3.01 < 3.10 (both directions, equal = 0)
//  2 what clients ALREADY LIVE do with the proposed next version: their compare is frozen in their page (the 2.09 code is copied
//    below, verbatim), so the next release has to be a version the old compare sees as newer than every 2.0x, or they never get the prompt
const fs=require('fs'),path=require('path');
const file=process.argv[2]||path.resolve(__dirname,'../v09.js');const NEXT=process.argv[3]||process.env.NEXT||'3.00';
const src=fs.readFileSync(file,'utf8');const m=src.match(/^const cmp=\(a,b\)=>.*;$/m);if(!m){console.log('vercmp FAIL: no `const cmp=` line in',file);process.exit(1);}
const cmp=eval('('+m[0].replace(/^const cmp=/,'').replace(/;$/,'')+')');
// live 2.09 compare (v09.js before ENG-3), copied exactly: what every page opened on <=2.09 runs until it reloads
const live=(a,b)=>{const A=String(a).split('.').map(Number),B=String(b).split('.').map(Number);const fa=A[0]+((A[1]||0)/Math.pow(10,String(A[1]||0).length)),fb=B[0]+((B[1]||0)/Math.pow(10,String(B[1]||0).length));return fa-fb;};
const fails=[];const order=['1.99','2.00','2.08','2.09','2.10','2.11','2.99','3.00','3.01','3.10'];
for(let i=0;i<order.length;i++)for(let j=0;j<order.length;j++){const a=order[i],b=order[j],r=cmp(a,b),want=Math.sign(i-j);if(Math.sign(r)!==want)fails.push(`cmp(${a},${b}) = ${r}, want ${want>0?'newer':want<0?'older':'equal'}`);}
// the gate prompts when cmp(server, client) > 0
const prompts=(c,srv,cl)=>c(srv,cl)>0;
const table=[];for(const cl of ['2.07','2.08','2.09'])for(const srv of [...new Set(['2.10','2.11',NEXT])]){table.push({client:cl,server:srv,livePrompt:prompts(live,srv,cl),fixPrompt:prompts(cmp,srv,cl)});}
const stuck=table.filter(r=>r.server===NEXT&&!r.livePrompt);if(stuck.length)fails.push(`live clients would NOT be prompted for ${NEXT}: `+stuck.map(r=>r.client).join(', '));
console.log('live clients (frozen compare) vs server version, prompted?');table.forEach(r=>console.log(`  client ${r.client}  server ${r.server.padEnd(5)}  live compare: ${r.livePrompt?'prompt':'NO PROMPT'}   fixed compare: ${r.fixPrompt?'prompt':'NO PROMPT'}`));
console.log('vercmp',fails.length?'FAIL':'PASS',JSON.stringify({file:path.basename(path.dirname(path.resolve(file)))+'/'+path.basename(file),next:NEXT,fails:fails.slice(0,8),nFails:fails.length}));process.exit(fails.length?1:0);
