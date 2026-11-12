// CAR-7e: hair in the hub/Locker hero render (V.heroShot) and the face portrait (V.portrait) keeps the colour it has at the oche:
// no green cast from the hero's lime rim light, no red cast from the portrait's red rim.
// How: render each opponent twice, once as is and once with its hair tinted magenta (same look otherwise); the pixels that change are
// the hair. Fails if the hair's mean colour has more green than red (the hero's lime rim made dark hair read green), or a red:green
// more than 15% above the same render with the rim lights off (the portrait's red rim).
// usage: node tests/portrait-hair.js   (over http so the character files load; ~3 min)
const {chromium}=require('playwright');const path=require('path');const http=require('http');const fs=require('fs');
const root=path.resolve(__dirname,'..');const srv=http.createServer((q,s)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);s.end();return;}s.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html':f.endsWith('.js')?'text/javascript':'application/octet-stream'});s.end(d);});});
// Shazza (Elizabeth) is checked by eye only: her curls aren't a mesh the tint reaches, so they can't be masked this way
const NAMES=(process.env.NAMES?JSON.parse(process.env.NAMES):[['Craig Caldwell','brian','model'],['Mere Hohepa','megan','named'],['Ian Makuch','leonard','model'],['Kev Marsh','bryce','model']]);
(async()=>{await new Promise(r=>srv.listen(0,r));const port=srv.address().port;const f=[];
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:390,height:844}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());
 await p.goto(`http://localhost:${port}/index.html`);await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
 await p.evaluate(()=>{save.authSeen=true;save.name='P';save.lessonDone=true;$('login').hidden=true;newCareer();V.walkOn=()=>{};V.loadHair();});
 if(process.env.RIMS)await p.evaluate(r=>{r.split(',').forEach(x=>{const [w,h,i]=x.split(':');V._qa.rimSet(w,parseInt(h,16),+i);});},process.env.RIMS);/* tuning only */
 const rows=[];
 for(const [n,ck,kind] of NAMES){
  await p.evaluate(([n])=>{V.setOpponentLook(lookFor(n),n,0);},[n]);
  await p.waitForFunction(([n,ck])=>TOPS_RIGS().ids.includes(ck)&&Array.isArray(V._qa.gfx().hair),[n,ck],{timeout:180000});
  const r=await p.evaluate(async([n,ck,kind])=>{
   const dec=u=>new Promise(res=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);res(x.getImageData(0,0,c.width,c.height).data);};im.src=u;});
   const cur=V.oppVar(n,ck);const keep=cur?Object.assign({},cur):null;const set=v=>V._qa.varSet(kind==='named'?n.toLowerCase():ck,v,kind==='named');
   let salt=0;const shot=(fn)=>{const lk=Object.assign({},lookFor(n),{_qa:++salt});return fn(lk);};
   const out={};
   for(const [which,fn] of [['hero',lk=>V.heroShot(lk,n,0,null)],['portrait',lk=>V.portrait(lk,n,0,0)]]){
    const norm=await dec(shot(fn));
    set(Object.assign({},keep||{},{hairCol:'#ff00ff'}));const mag=await dec(shot(fn));set(keep);
    const neu=await dec(shot(lk=>{V._qa.rims&&V._qa.rims(false);try{return fn(lk);}finally{V._qa.rims&&V._qa.rims(true);}}));
    let k=0,R=0,G=0,B=0,nR=0,nG=0,nB=0;for(let i=0;i<norm.length;i+=4){const dm=Math.abs(mag[i]-norm[i])+Math.abs(mag[i+1]-norm[i+1])+Math.abs(mag[i+2]-norm[i+2]);
     if(dm>90&&mag[i]>mag[i+1]+40&&mag[i+2]>mag[i+1]+20){k++;R+=norm[i];G+=norm[i+1];B+=norm[i+2];nR+=neu[i];nG+=neu[i+1];nB+=neu[i+2];}}
    out[which]=k?{px:k,rgb:[R/k,G/k,B/k].map(v=>Math.round(v)),neutral:[nR/k,nG/k,nB/k].map(v=>Math.round(v)),gr:+(G/Math.max(1,R)).toFixed(3),ngr:+(nG/Math.max(1,nR)).toFixed(3),rims:!!V._qa.rims}:{px:0};}
   return out;},[n,ck,kind]);
  r.name=n;rows.push(r);
  for(const w of ['hero','portrait']){const x=r[w];if(!x.px){f.push(`${n} ${w}: no hair pixels found (test setup)`);continue;}
   if(!x.rims){f.push('V._qa.rims missing (build before CAR-7e): no neutral reference');continue;}
   /* green cast: brown/black hair never has more green than red; red cast: the hair's red:green no more than 15% above the neutral render's */
   if(x.rgb[1]>x.rgb[0]*1.0+2)f.push(`${n} ${w}: hair has a green cast (rgb ${x.rgb}; neutral ${x.neutral})`);
   if((1/x.gr)>(1/x.ngr)*1.15)f.push(`${n} ${w}: hair has a red cast (r/g ${(1/x.gr).toFixed(2)} vs neutral ${(1/x.ngr).toFixed(2)}; rgb ${x.rgb})`);}}
 console.log(JSON.stringify(rows));if(errs.length)f.push('page errors: '+errs.slice(0,2).join(' | '));
 await b.close();srv.close();
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log('PASS: hair in the hero render and the face portrait keeps its neutral-light colour (no green or red cast) for '+NAMES.map(x=>x[0]).join(', '));})();
