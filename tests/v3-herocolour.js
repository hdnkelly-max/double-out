// r8b (Experience: the v3 figure render washed colours out: red pink, charcoal grey, purple lilac, Tama pale). For each look the hero render (hub /
// Locker / New look card) and the portrait (result screen, hub, Circuit) are compared with the SAME scene and camera drawn straight to the screen
// canvas (the in-match colour pipeline; window.__SHOTREF): the render-target path must match it. And the shirt must keep the picked colour: hue held,
// saturation not drained, darks not lifted. Looks: Kai in red, green, blue, black, charcoal, purple shirts + each base's default look (a skin swatch each).
// node tests/v3-herocolour.js <dir (forced v3)> [globalsJSON]
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]),G=JSON.parse(process.argv[3]||'{}');const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':/\.js$/.test(u)?'text/javascript':/\.webp$/.test(u)?'image/webp':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({viewport:{width:600,height:700}})).newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(G=>{try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_s3_welcome','1');localStorage.setItem('tops_v3','1');}catch(e){}Object.assign(window,G);window.__SHOTREF=true;},G);
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1&s3gloss=full`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>{V.loadAnims();});await p.waitForFunction(()=>V._qa.animNames().length>0,null,{timeout:180000});
const SH={red:'#d21e28',green:'#1e8a3c',blue:'#1e50c8',black:'#141416',charcoal:'#2a2b33',purple:'#5b2a86'};
const looks=[...Object.entries(SH).map(([k,c])=>({id:'shirt_'+k,look:{base:'kai',shirt:c},shirt:c})),...['kai','ray','tama','mia','dazza'].map(id=>({id:'skin_'+id,look:{base:id}})),{id:'frame_mia_muscle',look:{base:'mia',body:'muscle'}}];
const res=await p.evaluate(async([looks])=>{const dec=u=>new Promise(r=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);r({W:im.width,H:im.height,data:x.getImageData(0,0,im.width,im.height).data});};im.src=u;});
 const down=(R,W,H)=>{const c=document.createElement('canvas');c.width=R.W;c.height=R.H;c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(R.data),R.W,R.H),0,0);const d=document.createElement('canvas');d.width=W;d.height=H;const x=d.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(c,0,0,W,H);return {W,H,data:x.getImageData(0,0,W,H).data};};
 const cmp=(A,B,opaqueRef)=>{let n=0,s=[0,0,0];for(let i=0;i<A.data.length;i+=4){if(B.data[i+3]<250||(!opaqueRef&&A.data[i+3]<250))continue;n++;for(let c=0;c<3;c++)s[c]+=Math.abs(A.data[i+c]-B.data[i+c]);}return {n,mad:s.map(v=>+(v/Math.max(1,n)).toFixed(2))};};
 const hsv=([r,g,b])=>{r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;}return [h,mx?d/mx:0,mx];};
 const med=(R,x0,x1,y0,y1)=>{const v=[[],[],[]];for(let y=Math.floor(y0*R.H);y<y1*R.H;y++)for(let x=Math.floor(x0*R.W);x<x1*R.W;x++){const i=4*(y*R.W+x);if(R.data[i+3]<250)continue;for(let c=0;c<3;c++)v[c].push(R.data[i+c]);}return v.map(a=>{a.sort((p,q)=>p-q);return a.length?a[a.length>>1]:0;});};
 const out=[];for(const L of looks){const lk={s3:L.look};window.__shotRefs=[];const hu=V.heroShot(lk,'You '+L.id,0);const hr=window.__shotRefs[0];window.__shotRefs=[];const pu=V.portrait(lk,'You '+L.id,0,0);const pr=window.__shotRefs[0];
  if(!hu||!hr||!pu||!pr){out.push({id:L.id,err:'no shot '+(!!hu)+(!!hr)+(!!pu)+(!!pr)+' '+(window.__shotRefErr||'')});continue;}
  const H=await dec(hu),P=await dec(pu);const H2=down(hr,H.W,H.H);const hc=cmp(H,H2,false),pc=cmp(P,pr,true);
  const o={id:L.id,hero:hc.mad,portrait:pc.mad};
  /* doc 79 framing, measured on the pictures: the hero's figure (alpha) never touches the top edge, nor the side edges above the waist (head, hair,
     throwing hand, dart); the portrait's head (pixels off its near-black ground) starts 3-14% down (the hair top inside, a little headroom) and
     never touches the sides in its upper 60% */
  {const ed=(R,isF,y0,y1,x0,x1)=>{let n=0;for(let y=Math.floor(y0*R.H);y<y1*R.H;y++)for(let x=Math.floor(x0*R.W);x<x1*R.W;x++)if(isF(R.data,4*(y*R.W+x)))n++;return n;};
   const hA=(d,i)=>d[i+3]>24,pF=(d,i)=>Math.max(d[i],d[i+1],d[i+2])>10;let top=-1;for(let y=0;y<P.H&&top<0;y++){let n=0;for(let x=0;x<P.W;x++)if(pF(P.data,4*(y*P.W+x)))n++;if(n>=3)top=y;}
   o.frame={heroTop:ed(H,hA,0,.02,0,1),heroSide:ed(H,hA,0,.7,0,.02)+ed(H,hA,0,.7,.98,1),portTop:+(top/P.H).toFixed(3),portSide:ed(P,pF,0,.6,0,.02)+ed(P,pF,0,.6,.98,1)};}
  if(L.shirt){const s=med(H,.645,.715,.505,.565),r=med(H2,.645,.715,.505,.565);/* a clean shirt patch: the figure's left chest, below the collar, right of the logo, above the forearm (hero framing) */o.shirt={pick:L.shirt,hero:s,ref:r};}else{const f=med(P,.4,.6,.38,.58),fr=med(pr,.4,.6,.38,.58);o.skin={portrait:f,ref:fr};}
  if(window.__DUMP)o.png=hu;o.shotsOk=true;o.hsvPick=L.shirt?hsv([1,3,5].map(k=>parseInt(L.shirt.slice(k,k+2),16))):null;o.hsvShirt=o.shirt?hsv(o.shirt.hero):null;out.push(o);}
 return out;},[looks]);
const fails=[];for(const o of res){if(o.err){fails.push(o.id+': '+o.err);continue;}
 if(Math.max(...o.hero)>4)fails.push(`${o.id}: hero differs from the screen pipeline by ${o.hero.join('/')} (mean abs, 0-255)`);
 if(Math.max(...o.portrait)>6)fails.push(`${o.id}: portrait differs from the screen pipeline by ${o.portrait.join('/')}`);
 if(o.hsvPick){const [hp,sp,vp]=o.hsvPick,[hs,ss,vs]=o.hsvShirt;const dh=Math.min(Math.abs(hp-hs),360-Math.abs(hp-hs));
  if(sp>0.3){if(dh>20)fails.push(`${o.id}: shirt hue ${hs.toFixed(0)} vs picked ${hp.toFixed(0)}`);if(ss<0.6*sp)fails.push(`${o.id}: shirt saturation ${ss.toFixed(2)} vs picked ${sp.toFixed(2)} (washed out)`);}
  if(vp<0.25&&vs>vp+0.12)fails.push(`${o.id}: dark shirt lifted to value ${vs.toFixed(2)} (picked ${vp.toFixed(2)})`);}}
for(const o of res){if(!o.frame)continue;const f=o.frame;if(f.heroTop||f.heroSide)fails.push(`${o.id}: hero figure on the frame edge (top ${f.heroTop} px, sides ${f.heroSide} px above the waist)`);
 if(!(f.portTop>=.03&&f.portTop<=.14))fails.push(`${o.id}: portrait head starts at ${(f.portTop*100).toFixed(1)}% (want 3-14%: hair top inside, a little headroom)`);if(f.portSide)fails.push(`${o.id}: portrait head on the side edge (${f.portSide} px)`);}
const FR=res.filter(o=>o.frame).map(o=>o.frame.portTop);
for(const o of res)console.log(JSON.stringify(o));if(pe.length)console.log('page errors',pe.slice(0,3));
console.log(fails.length?'V3-HEROCOLOUR FAIL '+JSON.stringify(fails.slice(0,14)):`V3-HEROCOLOUR PASS (${res.length} looks: hero + portrait match the screen pipeline; red/green/blue/black/charcoal/purple shirts keep hue, saturation and darkness; a skin swatch per base; framing: hero clear of the top and side edges, portrait head from ${(Math.min(...FR)*100).toFixed(1)}-${(Math.max(...FR)*100).toFixed(1)}% down, clear of the sides)`);await b.close();srv.close();process.exit(fails.length?1:0);})();
