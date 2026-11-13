// ENG-RIGCACHE (ChatGPT P2): the update check at the top of the page reads version.json, not the 3 MB page.
// node tests/upd-check.js <dir>   (runs the page's own first script, taken from <dir>/index.html, against stubs; no browser)
// Cases: newer (3.10 vs 3.9 -> reload once), same, older, malformed or missing version, missing/broken version.json, already reloaded for
// that version this session (no loop), a match in progress (no reload), and it never fetches the page itself.
const fs=require('fs'),path=require('path'),vm=require('vm');
const html=fs.readFileSync(path.join(path.resolve(process.argv[2]),'index.html'),'utf8');
const m=html.match(/<script>(window\.TOPS_BUILD=[\s\S]*?)<\/script>/);if(!m){console.log('UPD-CHECK FAIL: no update script');process.exit(1);}
const run=async({cur,json,status=200,seen=false,live=false})=>{const fetched=[];let replaced=null;const ss={};if(seen&&json&&json.v)ss['tops-upd-'+json.v]='1';
 const win={location:{protocol:'https:',search:'',pathname:'/index.html',replace:u=>{replaced=u;}},sessionStorage:{getItem:k=>ss[k]||null,setItem:(k,v)=>{ss[k]=v;}},
  fetch:(u,o)=>{fetched.push(u);return Promise.resolve({ok:status===200,json:()=>json==='bad'?Promise.reject(new Error('bad json')):Promise.resolve(json)});},URLSearchParams};
 win.window=win;win.TOPS_VER=cur;if(live){win.S={done:false};}
 vm.runInNewContext(m[1],win);await new Promise(r=>setTimeout(r,20));return {fetched,replaced};};
const cases=[['newer 3.10 > 3.9',{cur:'3.9',json:{v:'3.10'}},true],['newer 3.49 > 3.48',{cur:'3.48',json:{v:'3.49'}},true],['same',{cur:'3.49',json:{v:'3.49'}},false],['older',{cur:'3.50',json:{v:'3.49'}},false],
 ['malformed version',{cur:'3.49',json:{v:'abc'}},false],['missing v',{cur:'3.49',json:{}},false],['version.json 404',{cur:'3.49',json:null,status:404},false],['broken json',{cur:'3.49',json:'bad'},false],
 ['already reloaded for it (no loop)',{cur:'3.48',json:{v:'3.49'},seen:true},false],['match in progress',{cur:'3.48',json:{v:'3.49'},live:true},false],['page version unknown',{cur:undefined,json:{v:'3.49'}},false]];
(async()=>{const fails=[];for(const [name,c,want] of cases){const r=await run(c);const got=!!r.replaced;const okFetch=r.fetched.length===1&&/^version\.json\?cb=/.test(r.fetched[0]);
 console.log(JSON.stringify({name,reload:got,fetched:r.fetched,replaced:r.replaced}));if(got!==want)fails.push(name+': reload '+got);if(!okFetch)fails.push(name+': fetched '+JSON.stringify(r.fetched));if(got&&!/[?&]v=/.test(r.replaced))fails.push(name+': no ?v= on the reload');}
 console.log(fails.length?'UPD-CHECK FAIL: '+fails.join('; '):'UPD-CHECK PASS');process.exit(fails.length?1:0);})();
