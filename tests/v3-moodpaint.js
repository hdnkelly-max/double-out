// r8b (doc 71): a PERS23 mood redraw must keep the skin-map paint (Dazza's doc 68 mouth junction; doc 67/70 painted stubble). For Dazza and a
// stubble player look: the skull map's painted band (Dazza's outer junction ring; the stubble cheeks) after v3Mood(celebrate, sig, miss) vs the neutral map, leaving
// out each mood's own footprint (pixels where the plain mood sheet differs from the plain neutral one), and after the reset. FAIL if a mood
// moves the band toward plain skin (fix off: 37-43; on: <=0.6). node tests/v3-moodpaint.js <dir (forced v3)> [globalsJSON]
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
(async()=>{const dir=path.resolve(process.argv[2]),G=JSON.parse(process.argv[3]||'{}');const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';fs.readFile(path.join(dir,u),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':/\.html$/.test(u)?'text/html':'application/octet-stream'});r.end(d);});}).listen(0);
const b=await chromium.launch({args:['--use-gl=swiftshader']});const p=await (await b.newContext()).newPage();const pe=[];p.on('pageerror',e=>pe.push(e.message));
await p.route(/jsdelivr|googleapis|gstatic|supabase\.co/,r=>r.abort());await p.addInitScript(G=>{try{localStorage.setItem('tops_s3','1');localStorage.setItem('tops_v3','1');}catch(e){}Object.assign(window,G);},G);
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?s3=1`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
await p.evaluate(()=>{V.loadAnims();});await p.waitForFunction(()=>V._qa.animNames().length>0,null,{timeout:180000});
const r=await p.evaluate(()=>{const Q=V._qa,out={};
 /* masks where the paint is and the mouth (which changes with the mood) never reaches: Dazza, the outer junction ring (doc 68 ellipse hw .45, hh .21 at th 2.37: md 1.12-1.42); stubble, the cheeks either side (|ph| .75-1.25, th 2.25-2.75) */
 for(const [id,look,band] of [['dazza',{base:'dazza'},{ph:[-0.7,0.7],th:[2.0,2.75],in:(ph,th)=>{const md=Math.hypot(ph/.45,(th-2.37)/.21);return md>1.12&&md<1.42;}}],['kai_stubble',{base:'kai',face:'stubble'},{ph:[-1.25,1.25],th:[2.25,2.75],in:(ph,th)=>Math.abs(ph)>.75}]]){
  const f=Q.makeFigure({s3:look},'You',0);let m=null;f.traverse(o=>{if(!m&&o.isMesh&&o.material&&o.material.userData&&o.material.userData.v3m)m=o.material.userData.v3m;});if(!m){out[id]={err:'no face map'};continue;}
  const cv=m.map.image,W=cv.width,H=cv.height,x=cv.getContext('2d');const x0=Math.floor((band.ph[0]+Math.PI/2)/(2*Math.PI)*W),x1=Math.ceil((band.ph[1]+Math.PI/2)/(2*Math.PI)*W),y0=Math.floor(band.th[0]/Math.PI*H),y1=Math.ceil(band.th[1]/Math.PI*H),w=x1-x0;
  const inB=[];for(let py=y0;py<y1;py++)for(let px=x0;px<x1;px++){const ph=(px+0.5)/W*2*Math.PI-Math.PI/2,th=(py+0.5)/H*Math.PI;inB.push(band.in(ph,th));}
  const grab=()=>x.getImageData(x0,y0,w,y1-y0).data.slice();const P=window.TOPS_PERS&&f.userData.persBase;const set=mood=>{if(P)Q.pers(f,mood,0.4);else Q.mood(f,{mouth:'grin',sm:1.05});};const clr=()=>{Q.persReset(f);Q.mood(f,null);};
  /* mean over the band, leaving out the pixels the mood itself changes (its footprint) */
  const mean=(d,ex)=>{let s=[0,0,0],n=0;for(let q=0;q<inB.length;q++){if(!inB[q]||(ex&&ex[q]))continue;n++;for(let c=0;c<3;c++)s[c]+=d[q*4+c];}return {v:s.map(v=>+(v/Math.max(1,n)).toFixed(1)),n};};
  const base=grab(),flag=window.TOPS_DOC71;const o={base:mean(base).v,moods:{},n:{}};
  for(const mood of ['celebrate','sig','miss']){
   /* the mood's footprint: where the PLAIN mood sheet differs from the PLAIN neutral sheet (the pre-doc-71 path draws the sheet with no paint) */
   window.TOPS_DOC71=0;Q.mood(f,{mouth:'o',sm:.5});clr();const p0=grab();/* the detour forces a redraw: an unchanged mood key skips it */set(mood);const pm=grab();clr();window.TOPS_DOC71=flag;Q.mood(f,{mouth:'o',sm:.5});clr();
   const ex=new Uint8Array(inB.length);for(let q=0;q<inB.length;q++)for(let c=0;c<3;c++)if(Math.abs(pm[q*4+c]-p0[q*4+c])>6)ex[q]=1;
   set(mood);const mm=grab();const A=mean(mm,ex),B=mean(base,ex);o.moods[mood]={v:A.v,b:B.v};o.n[mood]=A.n;clr();}
  o.reset=mean(grab()).v;o.skin=m.sk;out[id]=o;Q.dispose(f);}
 return out;});
const fails=[];for(const [id,o] of Object.entries(r)){if(o.err){fails.push(id+': '+o.err);continue;}const d=a=>Math.max(...a.map((v,i)=>Math.abs(v-o.base[i])));
 for(const [m,{v,b}] of Object.entries(o.moods)){const dm=Math.max(...v.map((x,i)=>Math.abs(x-b[i])));if(o.n[m]<200)fails.push(`${id}/${m}: only ${o.n[m]} band pixels outside the mood's footprint`);else if(dm>2)fails.push(`${id}/${m}: painted band moved by ${dm.toFixed(1)} (base ${b} -> ${v}, ${o.n[m]} px)`);}if(d(o.reset)>2)fails.push(`${id}/reset: ${o.reset} vs ${o.base}`);}
console.log(JSON.stringify(r));if(pe.length)console.log('page errors',pe.slice(0,2));console.log(fails.length?'V3-MOODPAINT FAIL '+JSON.stringify(fails):'V3-MOODPAINT PASS (Dazza junction + painted stubble kept through celebrate / signature / miss moods and the reset)');await b.close();srv.close();process.exit(fails.length?1:0);})();
