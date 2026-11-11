// Emulate a phone GPU texture budget: live texture bytes are tracked; past the cap, new uploads get a 1x1 black pixel instead (what a failed upload looks like).
const {chromium}=require('playwright');(async()=>{const dir=process.argv[2]||require('path').resolve(__dirname,'..'),CAP=+process.argv[3],N=+process.argv[4]||5,tag=process.argv[5]||'x';
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:390,height:844}});await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());
await p.addInitScript(cap=>{window.__live=0;window.__fail=0;const sz=new WeakMap();
 for(const C of [WebGLRenderingContext,window.WebGL2RenderingContext].filter(Boolean)){const P=C.prototype,bind=P.bindTexture,tex=P.texImage2D,del=P.deleteTexture;
  P.bindTexture=function(t,o){this.__cur=o;return bind.call(this,t,o);};
  P.deleteTexture=function(o){const s=sz.get(o)||0;window.__live-=s;sz.delete(o);return del.call(this,o);};
  P.texImage2D=function(...a){const o=this.__cur;let w,h;if(a.length>=9){w=a[3];h=a[4];}else{const src=a[a.length-1];w=src&&(src.width||src.videoWidth);h=src&&(src.height||src.videoHeight);}const bytes=(w||0)*(h||0)*4/1e6;
   const prev=sz.get(o)||0;if(o&&a[1]===0&&bytes>0.05&&window.__live-prev+bytes>cap){window.__fail++;window.__live-=prev;sz.set(o,0);return tex.call(this,a[0],0,this.RGBA,1,1,0,this.RGBA,this.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));}
   if(o&&a[1]===0){window.__live+=bytes-prev;sz.set(o,bytes);}return tex.apply(this,a);};}},CAP);
await p.goto('file://'+dir+'/index.html');await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(5000);
await p.evaluate(()=>{save.authSeen=true;save.name='Lee';persist();$('login').hidden=true;V.walkOn=()=>{};newCareer();});
for(let m=0;m<N;m++){await p.evaluate(()=>{const n=nextOpponent();beginMatch({mode:'career',tier:1,p0:'Lee',oppKey:n.oppKey,oppName:n.oppName,oppAvg:50,legs:1});});await p.waitForTimeout(9000);
 console.log('match',m,JSON.stringify(await p.evaluate(()=>({liveMB:Math.round(window.__live),failed:window.__fail}))));
 if(m===N-1)await p.screenshot({path:dir+'/shots/gpucap_'+tag+'.jpg',quality:75});
 await p.evaluate(()=>{try{S.done=true;}catch(e){}try{quitMatch&&quitMatch();}catch(e){}try{showHub&&showHub();}catch(e){}});await p.waitForTimeout(1200);}
await b.close();})();
