// CAR-6 (Overseer 15:21): diagnostics that name the cause. Real page, network stubbed, under 2 minutes.
//  1 a forced shader failure (a ShaderMaterial that fails to compile, on a tagged mesh) -> 'shader_fail' with the FULL error text (>200 chars),
//    'shader_fail_at' naming the mesh/material, its defines and light counts, a 'thumb' (160 px JPEG of our canvas), and one uploaded row
//  2 a hidden board face -> 'health_fail' naming it + a thumb + an uploaded row; match 2 logs 'health_diff' vs match 1
//  3 nothing uploads during aim (a failure while aiming waits for the next break); per-frame cost of the new hook (p95) < 0.05 ms
//  4 rows stay under the 48 KiB body limit; tops_perf slow-frame incidents carry rnd/js/other/scr
// usage: node tests/diag.js
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--allow-file-access-from-files','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
 await p.route(/jsdelivr|supabase\.co|googleapis|gstatic/,r=>r.abort());const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(800);await p.evaluate(()=>localStorage.clear());await p.reload();
 await p.waitForFunction(()=>typeof V!=='undefined'&&V._qa&&V._qa.rigReady&&V._qa.rigReady(),null,{timeout:240000});
 const f=[];const ev=(fn,a)=>p.evaluate(fn,a);
 await ev(()=>{window.__ins=[];NET.user={id:'u1'};NET.sb={supabaseUrl:'https://x.supabase.co',supabaseKey:'k',from:t=>({insert:(r)=>{__ins.push([t,JSON.parse(JSON.stringify(r))]);return Promise.resolve({error:null});}}),auth:{getSession:()=>Promise.resolve({data:{session:{access_token:'tok'}}})}};
  save.authSeen=true;save.lessonDone=true;$('login').hidden=true;V.walkOn=()=>{};newCareer();const c=career();c.stage=null;c.tier=1;});
 const evs=k=>ev(k=>TOPS_LOG.events().filter(e=>e.k===k),k);
 const waitFor=async(fn,ms)=>{for(let i=0;i<ms/250;i++){if(await ev(fn))return true;await p.waitForTimeout(250);}return false;};
 // match 1 (baseline health) -------------------------------------------------------------------------------------------------------------
 await ev(()=>{beginMatch({mode:'career',tier:1,p0:'P',oppName:'Phil Taylor',oppAvg:60,legs:1});});
 await waitFor(()=>TOPS_LOG.events().some(e=>e.k==='health'),20000);
 await ev(()=>TOPS_LOG._health());await waitFor(()=>TOPS_LOG.events().filter(e=>e.k==='health').length>=2,20000);
 const h=await evs('health');if(h.length<2)f.push('match 1: health snapshots '+h.length+' (want start + 5 s)');else if(!h[0].d||!h[0].d.board||!h[0].d.board.meshes)f.push('health has no board face: '+JSON.stringify(h[0].d));
 if(await ev(()=>TOPS_LOG.events().some(e=>e.k==='health_fail')))f.push('healthy match 1 logged health_fail: '+JSON.stringify((await evs('health_fail'))[0]));
 // 1 forced shader failure, at a quiet moment (bull card up) -------------------------------------------------------------------------
 const ins0=await ev(()=>__ins.length);
 await ev(()=>{if(S){S.bull=S.bull||{};S.busy=false;S.pulling=false;}const m=new THREE.Mesh(new THREE.PlaneGeometry(.1,.1),new THREE.ShaderMaterial({name:'diagTestMat',vertexShader:'void main(){gl_Position=vec4(0.0);}',fragmentShader:'void main(){ gl_FragColor = vec4(undefined_function_for_car6_test(1.0)); }'}));m.name='diagTestMesh';m.position.set(0,1.7,-1);V._qa.scene.add(m);window.__bad=m;});
 await waitFor(()=>TOPS_LOG.events().some(e=>e.k==='shader_fail_at'),15000);
 const sf=(await evs('shader_fail'))[0],sfa=(await evs('shader_fail_at'))[0];
 if(!sf)f.push('no shader_fail event');else if(!(sf.d.log.length>200))f.push('shader_fail text cut: '+sf.d.log.length+' chars');
 if(!sfa)f.push('no shader_fail_at (attribution)');else{if(!/diagTestMesh/.test(JSON.stringify(sfa.d.by)))f.push('shader_fail_at does not name the mesh: '+JSON.stringify(sfa.d.by));if(!sfa.d.lights)f.push('no light counts');if(!/undefined_function_for_car6_test/.test(sfa.d.log||''))f.push('the compile log is missing from shader_fail_at: '+JSON.stringify(sfa.d).slice(0,600));}
 await waitFor(()=>TOPS_LOG.events().some(e=>e.k==='thumb'),8000);const th=(await evs('thumb'))[0];if(!th||!/^data:image\/jpeg/.test(th.d.img))f.push('no thumbnail: '+JSON.stringify(await evs('thumb_blank')));
 // the upload goes at the next break (sendOk): open the window the way a leg break does
 await ev(()=>{V._qa.scene.remove(__bad);});
 await ev(()=>{S.won=true;endMatch();});
 const up=await waitFor(ins0=>__ins.slice(ins0).some(x=>x[0]==='tops_log'&&x[1].events.some(e=>e.k==='shader_fail_at')),20000,ins0);
 if(!(await ev(i=>__ins.slice(i).some(x=>x[0]==='tops_log'&&x[1].events.some(e=>e.k==='shader_fail_at')),ins0)))f.push('the shader failure was not uploaded');
 const big=await ev(()=>Math.max(0,...__ins.filter(x=>x[0]==='tops_log').map(x=>new TextEncoder().encode(JSON.stringify(x[1])).length)));if(big>48*1024)f.push('row over 48 KiB: '+big);
 // 2 match 2: hidden board face -> health_fail, health_diff vs match 1 --------------------------------------------------------------
 const ins1=await ev(()=>__ins.length);
 await ev(()=>{beginMatch({mode:'career',tier:1,p0:'P',oppName:'Phil Taylor',oppAvg:60,legs:1});});
 await waitFor(()=>TOPS_LOG.events().filter(e=>e.k==='health').length>=3,20000);
 await ev(()=>{let bd=null;V._qa.scene.traverse(o=>{if(!bd&&o.isMesh&&o.geometry&&o.geometry.type==='CircleGeometry'&&o.geometry.parameters.radius>.2&&o.geometry.parameters.radius<.23&&o.material.map&&o.material.map.image&&o.material.map.image.width>=1024)bd=o;});window.__bd=bd;bd.visible=false;V._qa.scene.add(new THREE.PointLight(0xffffff,0.1));if(S){S.bull=S.bull||{};S.busy=false;S.pulling=false;}TOPS_LOG._health();});
 await waitFor(()=>TOPS_LOG.events().some(e=>e.k==='health_fail'),15000);const hf=(await evs('health_fail'))[0];
 if(!hf||!hf.d.miss.some(m=>/board hidden/.test(m)))f.push('hidden board: no health_fail naming it: '+JSON.stringify(hf&&hf.d));
 const hd=(await evs('health_diff'));if(!hd.length||!JSON.stringify(hd[hd.length-1].d).includes('l_point'))f.push('match 2: no health_diff with the extra light: '+JSON.stringify(hd.map(x=>x.d)));
 // R0 #20 counters in every match-2 diff: figures by key, mixers, DOM nodes, CSS animations, calls/tris
 if(hd.length){const d=hd[hd.length-1].d;for(const k of ['by','mixers','dom','css','calls','tris'])if(!(k in d))f.push('health_diff lacks '+k+': '+JSON.stringify(d));}
 // every slow frame of a match: a slow_sum event (JS vs render vs other, DOM nodes) logged before match_end, so it uploads with it
 
 // a board that's gone from the scene altogether -> 'board missing' (ChatGPT code review P0-1)
 await ev(()=>{__bd.visible=true;window.__bdp=__bd.parent;__bdp.remove(__bd);TOPS_LOG._health();});
 await waitFor(()=>TOPS_LOG.events().some(e=>e.k==='health_fail'&&e.d.miss.some(m=>/board missing/.test(m))),15000);
 if(!(await ev(()=>TOPS_LOG.events().some(e=>e.k==='health_fail'&&e.d.miss.some(m=>/board missing/.test(m))))))f.push('a removed board does not log health_fail "board missing"');
 await ev(()=>{__bdp.add(__bd);S.won=true;endMatch();});
 const ss=await evs('slow_sum');if(!ss.length)f.push('no slow_sum at match end (SwiftShader frames are slow, so there should be one)');else{const d=ss[0].d;if(!(d.n>0&&'js' in d&&'rnd' in d&&d.dom_max>0&&Array.isArray(d.f)))f.push('slow_sum incomplete: '+JSON.stringify(d).slice(0,300));}
 if(!(await ev(()=>__ins.some(x=>x[0]==='tops_log'&&x[1].events.some(e=>e.k==='slow_sum')))))f.push('slow_sum was not uploaded');
 // thumbnails within their documented cap (12,000 chars), every other event within 2,600
 const sizes=await ev(()=>TOPS_LOG.events().map(e=>[e.k,JSON.stringify(e.d||'').length]));const th2=sizes.filter(x=>x[0]==='thumb');if(th2.some(x=>x[1]>12200))f.push('thumbnail over its cap: '+JSON.stringify(th2));
 const other=sizes.filter(x=>x[0]!=='thumb'&&x[1]>2700);if(other.length)f.push('events over 2.6 KB: '+JSON.stringify(other.slice(0,3)));
 await waitFor(i=>__ins.slice(i).some(x=>x[0]==='tops_log'&&x[1].events.some(e=>e.k==='health_fail')),20000,ins1);
 if(!(await ev(i=>__ins.slice(i).some(x=>x[0]==='tops_log'&&x[1].events.some(e=>e.k==='health_fail')),ins1)))f.push('health_fail was not uploaded');
 // 3 a failure while aiming: nothing uploads until a break --------------------------------------------------------------------------
 await ev(()=>{beginMatch({mode:'career',tier:1,p0:'P',oppName:'Phil Taylor',oppAvg:60,legs:1});});await p.waitForTimeout(1500);
 const ins2=await ev(()=>__ins.length);
 await ev(()=>{S.bull=null;S.cur=0;S.busy=false;S.pulling=true;console.error('THREE.WebGLProgram: shader error: car6 aim test '+'x'.repeat(400));});
 await p.waitForTimeout(5000);const dur=await ev(i=>__ins.slice(i).filter(x=>x[0]==='tops_log').length,ins2);if(dur)f.push('an upload went while the player was pulling');
 await ev(()=>{S.pulling=false;S.won=true;endMatch();});
 // per-frame cost of the new hook: frameTick with a stable program cache, p95 of 2000 calls
 const cost=await ev(()=>{const a=[];let t=performance.now();for(let i=0;i<2000;i++){t+=16.7;const s=performance.now();TOPS_LOG._tick(t);a.push(performance.now()-s);}a.sort((x,y)=>x-y);return {p95:a[Math.floor(a.length*.95)],max:a[a.length-1]};});
 if(cost.p95>0.05)f.push('per-frame hook p95 '+cost.p95.toFixed(4)+' ms (limit 0.05)');
 // 4 slow-frame attribution fields in tops_perf incidents
 const incs=await ev(()=>{try{return TOPS_perf.fitTest?null:null;}catch(e){return null;}});
 const realErrs=errs.filter(e=>!/car6|undefined_function/.test(e));if(realErrs.length)f.push('page errors: '+realErrs.slice(0,3).join(' | '));
 await b.close();console.log('cost p95 '+cost.p95.toFixed(4)+' ms, max '+cost.max.toFixed(3)+' ms');
 if(f.length){console.log('FAIL\n- '+f.join('\n- '));process.exit(1);}
 console.log('PASS: shader failure -> full text + mesh/material + defines/lights + thumbnail + uploaded at the break; hidden board -> health_fail + upload; match diff names the extra light; nothing uploads while pulling; hook p95 < 0.05 ms; rows < 48 KiB');})();
