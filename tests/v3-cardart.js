// rel-v3-r8: the v3-only card-art layer (rb/s3.js: s3/v3/<path> wins under ?v3=1). Under v3 each pro card's art resolves to s3/v3/assets/cards/art/<id>.webp
// and loads (700x1050); a second pass through the swap leaves it alone (no nested s3/v3/s3/v3); without v3 the same card keeps today's art.
// node tests/v3-cardart.js <dir (normal build, with s3/)>
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]);const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.webp$/.test(u)?'image/webp':/\.js$/.test(u)?'text/javascript':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader']});const ids=['power','nuke','green','price','wright','smith','barneveld','humphries','anderson'];const fails=[];
for(const v3 of [1,0]){const p=await (await b.newContext()).newPage();await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
 await p.addInitScript(v=>{try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_v3',v?'1':'0');}catch(e){}},v3);await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?v3=${v3}`);await p.waitForFunction(()=>!!window.TOPS_S3_IMG,null,{timeout:120000});
 const r=await p.evaluate(async ids=>{const out={};for(const id of ids){const im=new Image();im.src='assets/cards/art/'+id+'.webp';const once=im.getAttribute('src')||im.src;const twice=window.TOPS_S3_IMG(once);
   const d=document.createElement('div');d.innerHTML=`<img src="assets/cards/art/${id}.webp">`;d.innerHTML=d.innerHTML;const viaHTML=d.querySelector('img').getAttribute('src');
   const ok=await new Promise(res=>{im.onload=()=>res([im.naturalWidth,im.naturalHeight]);im.onerror=()=>res(null);setTimeout(()=>res('timeout'),8000);});out[id]={once,twice,viaHTML,ok};}return {flag:window.TOPS_V3FLAG===true,out};},ids);
 for(const id of ids){const o=r.out[id];const v3p=/s3\/v3\/assets\/cards\/art\//.test(o.once);
  if(v3&&!v3p)fails.push(`v3 ${id}: ${o.once}`);if(!v3&&v3p)fails.push(`v2 ${id} took the v3 art: ${o.once}`);if(/s3\/v3\/s3\//.test(o.twice)||/s3\/v3\/s3\//.test(o.viaHTML))fails.push(`${id}: nested ${o.twice} ${o.viaHTML}`);
  if(v3&&!(Array.isArray(o.ok)&&o.ok[0]===700&&o.ok[1]===1050))fails.push(`v3 ${id}: did not load at 700x1050 (${JSON.stringify(o.ok)})`);}
 console.log(v3?'v3':'v2',JSON.stringify({flag:r.flag,price:r.out.price}));await p.close();}
console.log(fails.length?'V3-CARDART FAIL '+JSON.stringify(fails.slice(0,10)):'V3-CARDART PASS (9 pro cards: v3 art under ?v3=1 and loads 700x1050; no nested swap; v2 keeps today\'s art)');await b.close();srv.close();process.exit(fails.length?1:0);})();
